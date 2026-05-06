"""Electron Theme Settings REST API Router.

Manages user-facing theme preferences: mode (system/light/dark), accent color,
font size, animations, etc. Provides full CRUD with JSON persistence.

Endpoints
---------
GET    /api/theme           – read current theme config
PUT    /api/theme           – update theme config (partial merge)
POST   /api/theme/reset     – reset to factory defaults
GET    /api/theme/preview   – preview all available options
GET    /api/theme/stats    – usage statistics
"""

from __future__ import annotations

import asyncio
import json
import logging
import platform
import sys
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/theme", tags=["theme"])

_lock = asyncio.Lock()
_theme: dict = {}
_persistence_path: Optional[Path] = None

# ── Pydantic models ───────────────────────────────────────────────────


class ThemeModeModel(BaseModel):
    mode: str = Field(default="system", pattern="^(system|light|dark)$")
    label: str = "System"
    description: str = "Match your OS preference"


class AccentColorModel(BaseModel):
    name: str
    value: str = Field(pattern="^#[0-9a-fA-F]{6}$")
    class_name: str


class FontSizeModel(BaseModel):
    id: str = Field(pattern="^(small|medium|large)$")
    label: str
    value_px: str


class ThemeConfigModel(BaseModel):
    mode: str = Field(default="system", pattern="^(system|light|dark)$")
    accentColor: str = Field(default="#3b82f6", pattern="^#[0-9a-fA-F]{6}$")
    fontSize: str = Field(default="medium", pattern="^(small|medium|large)$")
    sidebarCollapsed: bool = False
    animationsEnabled: bool = True


class ThemePreviewModel(BaseModel):
    modes: list
    accent_colors: list
    font_sizes: list
    defaults: dict


class ThemeStatsModel(BaseModel):
    total_users: int = 1
    mode_distribution: dict
    accent_distribution: dict
    font_size_distribution: dict


# ── Internal helpers ─────────────────────────────────────────────────


def _get_persistence_path() -> Path:
    global _persistence_path
    if _persistence_path is None:
        paths = get_paths()
        data_dir = paths.get("data_dir", Path.cwd() / "data")
        data_dir.mkdir(parents=True, exist_ok=True)
        _persistence_path = data_dir / "theme.json"
    return _persistence_path


async def _load_theme() -> dict:
    path = _get_persistence_path()
    if path.exists():
        try:
            text = path.read_text(encoding="utf-8")
            return json.loads(text)
        except Exception:
            pass
    return _get_defaults()


def _get_defaults() -> dict:
    return {
        "mode": "system",
        "accentColor": "#3b82f6",
        "fontSize": "medium",
        "sidebarCollapsed": False,
        "animationsEnabled": True,
    }


async def _save_theme(theme: dict) -> None:
    path = _get_persistence_path()
    text = json.dumps(theme, indent=2, ensure_ascii=False)
    path.write_text(text, encoding="utf-8")


# ── API endpoints ───────────────────────────────────────────��────────


@router.get("", response_model=ThemeConfigModel)
async def get_theme() -> ThemeConfigModel:
    """Read current theme configuration."""
    async with _lock:
        theme = await _load_theme()
        _theme.update(theme)
    return ThemeConfigModel(**theme)


@router.put("", response_model=ThemeConfigModel)
async def update_theme(config: ThemeConfigModel) -> ThemeConfigModel:
    """Update theme configuration with partial merge."""
    async with _lock:
        current = await _load_theme()
        updated = current.copy()
        update_data = config.model_dump(exclude_unset=True)
        updated.update(update_data)
        await _save_theme(updated)
        _theme.clear()
        _theme.update(updated)
    return ThemeConfigModel(**updated)


@router.post("/reset", response_model=ThemeConfigModel)
async def reset_theme() -> ThemeConfigModel:
    """Reset theme to factory defaults."""
    defaults = _get_defaults()
    async with _lock:
        await _save_theme(defaults)
        _theme.clear()
        _theme.update(defaults)
    return ThemeConfigModel(**defaults)


@router.get("/preview", response_model=ThemePreviewModel)
async def get_theme_preview() -> ThemePreviewModel:
    """Get preview of all available theme options."""
    modes = [
        {"id": "system", "label": "System", "description": "Match your OS preference"},
        {"id": "light", "label": "Light", "description": "Bright and clear"},
        {"id": "dark", "label": "Dark", "description": "Easy on the eyes"},
    ]
    accent_colors = [
        {"name": "Blue", "value": "#3b82f6", "class_name": "bg-blue-500"},
        {"name": "Green", "value": "#10b981", "class_name": "bg-green-500"},
        {"name": "Purple", "value": "#8b5cf6", "class_name": "bg-purple-500"},
        {"name": "Orange", "value": "#f59e0b", "class_name": "bg-orange-500"},
        {"name": "Pink", "value": "#ec4899", "class_name": "bg-pink-500"},
        {"name": "Red", "value": "#ef4444", "class_name": "bg-red-500"},
        {"name": "Cyan", "value": "#06b6d4", "class_name": "bg-cyan-500"},
        {"name": "Slate", "value": "#64748b", "class_name": "bg-slate-500"},
    ]
    font_sizes = [
        {"id": "small", "label": "Small", "value_px": "14px"},
        {"id": "medium", "label": "Medium", "value_px": "16px"},
        {"id": "large", "label": "Large", "value_px": "18px"},
    ]
    defaults = _get_defaults()
    return ThemePreviewModel(
        modes=modes,
        accent_colors=accent_colors,
        font_sizes=font_sizes,
        defaults=defaults,
    )


@router.get("/stats", response_model=ThemeStatsModel)
async def get_theme_stats() -> ThemeStatsModel:
    """Get theme usage statistics."""
    theme = await _load_theme()
    mode = theme.get("mode", "system")
    accent = theme.get("accentColor", "#3b82f6")
    font_size = theme.get("fontSize", "medium")

    mode_dist = {mode: 1}
    accent_dist = {accent: 1}
    font_dist = {font_size: 1}

    return ThemeStatsModel(
        total_users=1,
        mode_distribution=mode_dist,
        accent_distribution=accent_dist,
        font_size_distribution=font_dist,
    )


# ── Router initialization ─────────────────────���─��─────────────────────


async def init_router():
    """Initialize router and load persisted theme."""
    logger.info("Initializing theme router...")
    async with _lock:
        theme = await _load_theme()
        _theme.update(theme)
    logger.info(f"Theme router initialized with mode=%s", theme.get("mode", "system"))