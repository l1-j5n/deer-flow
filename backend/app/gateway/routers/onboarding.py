"""Onboarding REST API Router.

Manages user onboarding state: API key configuration, provider selection,
progress tracking, and completion status. REST API replacement for
window.electronAPI config storage.

Endpoints
---------
GET  /api/onboarding          – get onboarding state
PUT  /api/onboarding         – update onboarding state
POST /api/onboarding/complete – complete onboarding
POST /api/onboarding/reset    – reset onboarding state
GET  /api/onboarding/status – get onboarding status (simple)
"""

from __future__ import annotations

import asyncio
import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

_lock = asyncio.Lock()
_state: dict = {}
_persistence_path: Optional[Path] = None

# ── Pydantic models ───────────────────────────────────────────────────


class ProviderConfigModel(BaseModel):
    """API provider configuration."""
    id: str
    name: str
    apiKey: Optional[str] = None
    enabled: bool = False


class OnboardingStateModel(BaseModel):
    """Complete onboarding state."""
    completed: bool = False
    currentStep: int = Field(default=0, ge=0, le=3)
    providers: list[ProviderConfigModel] = Field(default_factory=list)
    featuresViewed: bool = False


class OnboardingStatusModel(BaseModel):
    """Simple status response."""
    completed: bool
    currentStep: int


class OnboardingUpdateModel(BaseModel):
    """Partial update request."""
    currentStep: Optional[int] = None
    providers: Optional[list[ProviderConfigModel]] = None
    featuresViewed: Optional[bool] = None


class ProviderApiKeysModel(BaseModel):
    """API keys for providers."""
    keys: dict  # providerId -> apiKey


# ── Provider defaults ──────────────────────────────────────────────

_DEFAULT_PROVIDERS = [
    {"id": "openai", "name": "OpenAI", "enabled": False},
    {"id": "anthropic", "name": "Anthropic", "enabled": False},
    {"id": "deepseek", "name": "DeepSeek", "enabled": False},
    {"id": "gemini", "name": "Gemini", "enabled": False},
    {"id": "openrouter", "name": "OpenRouter", "enabled": False},
]

_DEFAULTS = {
    "completed": False,
    "currentStep": 0,
    "providers": _DEFAULT_PROVIDERS,
    "featuresViewed": False,
}


# ── Persistence helpers ──────────────────────────────────────────────


async def _load_state() -> None:
    global _persistence_path
    try:
        paths = get_paths()
        _persistence_path = paths.base_dir / "onboarding_state.json"
        if _persistence_path.exists():
            data = json.loads(_persistence_path.read_text(encoding="utf-8"))
            async with _lock:
                _state.clear()
                _state.update(data)
            logger.info("Restored onboarding state from disk")
        else:
            async with _lock:
                _state.update(_DEFAULTS)
            await _save_state_nolock()
            logger.info("Seeded default onboarding state")
    except Exception:
        logger.exception("Failed to load onboarding state (non-fatal)")
        async with _lock:
            if not _state:
                _state.update(_DEFAULTS)


async def _save_state() -> None:
    await _save_state_nolock()


async def _save_state_nolock() -> None:
    if not _persistence_path:
        paths = get_paths()
        _persistence_path = paths.base_dir / "onboarding_state.json"
    try:
        _persistence_path.parent.mkdir(parents=True, exist_ok=True)
        data = dict(_state)
        _persistence_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist onboarding state")


# ── Startup ───────────────────────────────────────────────────────────

# Load state on module import (router registration happens at startup)
import deerflow.core
onboarding_loaded = False

@deerflow.core.on_startup
async def _ensure_loaded():
    global onboarding_loaded
    if not onboarding_loaded:
        await _load_state()
        onboarding_loaded = True


# ── Endpoints ─────────────────────────────────────────────────────────


@router.get("", response_model=OnboardingStateModel)
async def get_onboarding():
    """Get current onboarding state."""
    async with _lock:
        return OnboardingStateModel(**dict(_state))


@router.put("", response_model=OnboardingStateModel)
async def update_onboarding(body: OnboardingUpdateModel):
    """Partial update onboarding state."""
    update = body.model_dump(exclude_none=True)
    async with _lock:
        for key, value in update.items():
            if value is not None:
                _state[key] = value
    await _save_state_nolock()
    async with _lock:
        return OnboardingStateModel(**dict(_state))


@router.post("/complete", response_model=OnboardingStateModel)
async def complete_onboarding():
    """Mark onboarding as completed and save provider configs."""
    async with _lock:
        _state["completed"] = True
        _state["currentStep"] = 3
    await _save_state_nolock()
    async with _lock:
        return OnboardingStateModel(**dict(_state))


@router.post("/reset", response_model=OnboardingStateModel)
async def reset_onboarding():
    """Reset onboarding state to initial."""
    async with _lock:
        _state.clear()
        _state.update(_DEFAULTS)
    await _save_state_nolock()
    async with _lock:
        return OnboardingStateModel(**dict(_state))


@router.get("/status", response_model=OnboardingStatusModel)
async def get_onboarding_status():
    """Get simple onboarding status."""
    async with _lock:
        return OnboardingStatusModel(
            completed=_state.get("completed", False),
            currentStep=_state.get("currentStep", 0),
        )


# ── API Keys persistence for providers ──────────────────────────────────────

_onboarding_lock = asyncio.Lock()
_provider_keys: dict[str, str] = {}
_keys_persistence_path: Optional[Path] = None


async def _load_provider_keys() -> None:
    global _keys_persistence_path
    try:
        paths = get_paths()
        _keys_persistence_path = paths.base_dir / "onboarding_provider_keys.json"
        if _keys_persistence_path.exists():
            data = json.loads(_keys_persistence_path.read_text(encoding="utf-8"))
            async with _onboarding_lock:
                _provider_keys.clear()
                _provider_keys.update(data)
            logger.info("Restored provider API keys from disk")
    except Exception:
        logger.exception("Failed to load provider API keys (non-fatal)")


@deerflow.core.on_startup
async def _ensure_keys_loaded():
    await _load_provider_keys()


async def _save_provider_keys_nolock() -> None:
    if not _keys_persistence_path:
        paths = get_paths()
        _keys_persistence_path = paths.base_dir / "onboarding_provider_keys.json"
    try:
        _keys_persistence_path.parent.mkdir(parents=True, exist_ok=True)
        _keys_persistence_path.write_text(json.dumps(_provider_keys, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist provider API keys")


@router.post("/api-keys", response_model=ProviderApiKeysModel)
async def save_provider_api_keys(body: ProviderApiKeysModel):
    """Save API keys for providers."""
    async with _onboarding_lock:
        _provider_keys.clear()
        _provider_keys.update(body.keys)
    await _save_provider_keys_nolock()
    return ProviderApiKeysModel(keys=dict(_provider_keys))


@router.get("/api-keys", response_model=ProviderApiKeysModel)
async def get_provider_api_keys():
    """Get stored API keys (masked in frontend)."""
    async with _onboarding_lock:
        return ProviderApiKeysModel(keys=dict(_provider_keys))