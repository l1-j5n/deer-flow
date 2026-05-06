"""Electron Workspace Settings REST API Router.

Manages user preferences for the Electron desktop shell: general behaviour,
appearance/theme, notification preferences, and advanced developer options.
Includes secure defaults and JSON persistence.

Endpoints
---------
GET   /api/electron/settings          – read current settings
PUT   /api/electron/settings          – update settings (partial merge)
POST  /api/electron/settings/reset    – reset to factory defaults
GET   /api/electron/settings/about    – app version & system info
"""

from __future__ import annotations

import asyncio
import json
import logging
import platform
import sys
from pathlib import Path
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/electron/settings", tags=["settings-workspace"])

_lock = asyncio.Lock()
_settings: dict = {}
_persistence_path: Optional[Path] = None

# ── Pydantic models ───────────────────────────────────────────────────


class GeneralSettingsModel(BaseModel):
    language: str = "zh-CN"
    startupBehavior: str = "restore"  # restore | newChat | dashboard
    minimizeToTray: bool = True
    closeToTray: bool = False
    autoUpdate: bool = True
    telemetry: bool = False


class AppearanceSettingsModel(BaseModel):
    theme: str = "dark"  # system | light | dark
    accentColor: str = "#3b82f6"
    fontSize: str = "medium"  # small | medium | large
    sidebarCollapsed: bool = False
    showAnimations: bool = True


class NotificationCategoriesModel(BaseModel):
    system: bool = True
    agent: bool = True
    workflow: bool = True
    security: bool = True
    mcp: bool = False
    update: bool = True


class WorkspaceNotificationSettingsModel(BaseModel):
    enabled: bool = True
    soundEnabled: bool = True
    desktopNotifications: bool = True
    emailNotifications: bool = False
    categories: NotificationCategoriesModel = Field(default_factory=NotificationCategoriesModel)


class AdvancedSettingsModel(BaseModel):
    developerMode: bool = False
    debugLogging: bool = False
    cacheSize: int = Field(500, ge=50, le=5000)
    maxConcurrentTasks: int = Field(4, ge=1, le=32)
    requestTimeout: int = Field(30, ge=5, le=300)


class ElectronSettingsModel(BaseModel):
    general: GeneralSettingsModel = Field(default_factory=GeneralSettingsModel)
    appearance: AppearanceSettingsModel = Field(default_factory=AppearanceSettingsModel)
    notifications: WorkspaceNotificationSettingsModel = Field(default_factory=WorkspaceNotificationSettingsModel)
    advanced: AdvancedSettingsModel = Field(default_factory=AdvancedSettingsModel)


class SettingsUpdateModel(BaseModel):
    """Partial update — every field is optional."""
    general: Optional[GeneralSettingsModel] = None
    appearance: Optional[AppearanceSettingsModel] = None
    notifications: Optional[WorkspaceNotificationSettingsModel] = None
    advanced: Optional[AdvancedSettingsModel] = None


class AboutInfoModel(BaseModel):
    appVersion: str = "0.51.0"
    electronVersion: str = "32.0.0"
    nodeVersion: str = "20.16.0"
    platform: str = ""
    arch: str = ""
    pythonVersion: str = ""


# ── Defaults ──────────────────────────────────────────────────────────

_DEFAULTS = {
    "general": GeneralSettingsModel().model_dump(),
    "appearance": AppearanceSettingsModel().model_dump(),
    "notifications": WorkspaceNotificationSettingsModel().model_dump(),
    "advanced": AdvancedSettingsModel().model_dump(),
}


# ── Persistence helpers ───────────────────────────────────────────────


async def _load_state() -> None:
    global _persistence_path
    try:
        paths = get_paths()
        _persistence_path = paths.base_dir / "electron_settings.json"
        if _persistence_path.exists():
            data = json.loads(_persistence_path.read_text(encoding="utf-8"))
            async with _lock:
                _settings.clear()
                _settings.update(data)
            logger.info("Restored electron settings from disk")
        else:
            async with _lock:
                _settings.update(_DEFAULTS)
            await _save_state_nolock()
            logger.info("Seeded default electron settings")
    except Exception:
        logger.exception("Failed to load electron settings (non-fatal)")
        async with _lock:
            if not _settings:
                _settings.update(_DEFAULTS)


async def _save_state() -> None:
    await _save_state_nolock()


async def _save_state_nolock() -> None:
    if not _persistence_path:
        paths = get_paths()
        _persistence_path = paths.base_dir / "electron_settings.json"
    try:
        _persistence_path.parent.mkdir(parents=True, exist_ok=True)
        async with _lock:
            data = dict(_settings)
        _persistence_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist electron settings")


def _deep_merge(base: dict, override: dict) -> dict:
    """Recursively merge override into base, preserving base keys not in override."""
    result = dict(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(result.get(key), dict):
            result[key] = _deep_merge(result[key], value)
        elif value is not None:
            result[key] = value
    return result


# ── Endpoints ─────────────────────────────────────────────────────────


@router.get("", response_model=ElectronSettingsModel)
async def get_settings():
    """Return current workspace settings (with defaults for missing keys)."""
    async with _lock:
        merged = {}
        for section in ("general", "appearance", "notifications", "advanced"):
            merged[section] = _deep_merge(
                _DEFAULTS.get(section, {}),
                _settings.get(section, {}),
            )
    return merged


@router.put("", response_model=ElectronSettingsModel)
async def update_settings(body: SettingsUpdateModel):
    """Partial update — only sent sections are merged."""
    update = body.model_dump(exclude_none=True)
    async with _lock:
        for section in ("general", "appearance", "notifications", "advanced"):
            if section in update and isinstance(update[section], dict):
                current = dict(_settings.get(section, {}))
                _settings[section] = {**current, **update[section]}
    await _save_state_nolock()
    # Return merged result
    async with _lock:
        merged = {}
        for section in ("general", "appearance", "notifications", "advanced"):
            merged[section] = _deep_merge(
                _DEFAULTS.get(section, {}),
                _settings.get(section, {}),
            )
    return merged


@router.post("/reset", response_model=ElectronSettingsModel)
async def reset_settings():
    """Reset all settings to factory defaults."""
    async with _lock:
        _settings.clear()
        _settings.update(_DEFAULTS)
    await _save_state_nolock()
    return _DEFAULTS


@router.get("/about", response_model=AboutInfoModel)
async def get_about():
    """Return application and system information."""
    return AboutInfoModel(
        appVersion="0.51.0",
        electronVersion="32.0.0",
        nodeVersion="20.16.0",
        platform=platform.system(),
        arch=platform.machine(),
        pythonVersion=sys.version.split()[0],
    )
