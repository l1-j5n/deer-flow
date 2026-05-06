"""Keyboard Shortcuts REST API Router.

Provides endpoints for managing keyboard shortcuts.
Supports CRUD operations, search, and category filtering.
Persists custom shortcuts to JSON file.

Endpoints
---------
GET    /api/electron/shortcuts          – list shortcuts with filters
GET    /api/electron/shortcuts/{id}    – get single shortcut
PUT    /api/electron/shortcuts/{id}   – update shortcut
POST   /api/electron/shortcuts/reset  – reset to defaults
GET    /api/electron/shortcuts/stats   – shortcut statistics
"""

from __future__ import annotations

import asyncio
import json
import logging
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/electron/shortcuts", tags=["shortcuts"])

_lock = asyncio.Lock()
_persistence_path: Optional[Path] = None

# Default shortcuts matching frontend DEFAULT_SHORTCUTS
DEFAULT_SHORTCUTS_DATA = [
    {"id": "new-chat", "action": "New Chat", "description": "Start a new conversation", "category": "General", "keyCombo": "Ctrl+N", "defaultKeyCombo": "Ctrl+N"},
    {"id": "toggle-sidebar", "action": "Toggle Sidebar", "description": "Show or hide the sidebar", "category": "General", "keyCombo": "Ctrl+B", "defaultKeyCombo": "Ctrl+B"},
    {"id": "open-settings", "action": "Open Settings", "description": "Open the settings panel", "category": "General", "keyCombo": "Ctrl+,", "defaultKeyCombo": "Ctrl+,"},
    {"id": "command-palette", "action": "Command Palette", "description": "Open the command palette", "category": "General", "keyCombo": "Ctrl+Shift+P", "defaultKeyCombo": "Ctrl+Shift+P"},
    {"id": "reload", "action": "Reload", "description": "Reload the current page", "category": "General", "keyCombo": "Ctrl+R", "defaultKeyCombo": "Ctrl+R"},
    {"id": "force-reload", "action": "Force Reload", "description": "Force reload without cache", "category": "General", "keyCombo": "Ctrl+Shift+R", "defaultKeyCombo": "Ctrl+Shift+R"},
    {"id": "close-window", "action": "Close Window", "description": "Close the current window", "category": "Window", "keyCombo": "Ctrl+W", "defaultKeyCombo": "Ctrl+W"},
    {"id": "quit-app", "action": "Quit Application", "description": "Exit DeerFlow completely", "category": "Window", "keyCombo": "Ctrl+Q", "defaultKeyCombo": "Ctrl+Q"},
    {"id": "zoom-in", "action": "Zoom In", "description": "Increase zoom level", "category": "View", "keyCombo": "Ctrl+=", "defaultKeyCombo": "Ctrl+="},
    {"id": "zoom-out", "action": "Zoom Out", "description": "Decrease zoom level", "category": "View", "keyCombo": "Ctrl+-", "defaultKeyCombo": "Ctrl+-"},
    {"id": "reset-zoom", "action": "Reset Zoom", "description": "Reset zoom to default", "category": "View", "keyCombo": "Ctrl+0", "defaultKeyCombo": "Ctrl+0"},
    {"id": "toggle-devtools", "action": "Toggle DevTools", "description": "Open developer tools", "category": "View", "keyCombo": "Ctrl+Shift+I", "defaultKeyCombo": "Ctrl+Shift+I"},
    {"id": "focus-input", "action": "Focus Input", "description": "Focus the message input box", "category": "Chat", "keyCombo": "Ctrl+K", "defaultKeyCombo": "Ctrl+K"},
    {"id": "send-message", "action": "Send Message", "description": "Send the current message", "category": "Chat", "keyCombo": "Enter", "defaultKeyCombo": "Enter"},
    {"id": "new-line", "action": "New Line", "description": "Insert a new line in input", "category": "Chat", "keyCombo": "Shift+Enter", "defaultKeyCombo": "Shift+Enter"},
]

_shortcuts: dict[str, dict] = {s["id"]: s for s in DEFAULT_SHORTCUTS_DATA}


# ── Persistence ────────────────────────────────────────────────────────────


async def _ensure_persistence_path() -> Path:
    global _persistence_path
    if _persistence_path is None:
        paths = get_paths()
        data_dir = paths.data_dir
        data_dir.mkdir(parents=True, exist_ok=True)
        _persistence_path = data_dir / "shortcuts.json"
    return _persistence_path


async def _load_shortcuts() -> None:
    path = await _ensure_persistence_path()
    if path.exists():
        try:
            async with _lock:
                saved = json.loads(path.read_text(encoding="utf-8"))
                for s in saved:
                    _shortcuts[s["id"]] = s
            logger.info(f"Loaded {len(saved)} shortcuts from {path}")
        except Exception as e:
            logger.warning(f"Failed to load shortcuts: {e}")


async def _save_shortcuts() -> None:
    path = await _ensure_persistence_path()
    async with _lock:
        path.write_text(json.dumps(list(_shortcuts.values()), indent=2, ensure_ascii=False), encoding="utf-8")


# ── Pydantic models ────────────────────────────────────────────────────


class ShortcutModel(BaseModel):
    id: str
    action: str
    description: str
    category: str
    keyCombo: str
    defaultKeyCombo: str = Field(default="")
    isCustom: bool = Field(default=False)


class ShortcutListResponse(BaseModel):
    shortcuts: list[ShortcutModel]
    total: int


class ShortcutStatsResponse(BaseModel):
    totalShortcuts: int
    customShortcuts: int
    defaultShortcuts: int
    categories: dict[str, int]


# ── Endpoints ────────────────────────────────────────────────────────────


@router.on_event("startup")
async def _startup():
    await _load_shortcuts()


@router.get("", response_model=ShortcutListResponse)
async def list_shortcuts(
    search: Optional[str] = Query(None, description="Search by action, description, or key combo"),
    category: Optional[str] = Query(None, description="Filter by category"),
):
    """List all shortcuts with optional search and category filters."""
    result = list(_shortcuts.values())

    if search:
        q = search.lower()
        result = [
            s for s in result
            if q in s.get("action", "").lower()
            or q in s.get("description", "").lower()
            or q in s.get("keyCombo", "").lower()
        ]

    if category and category != "all":
        result = [s for s in result if s.get("category") == category]

    # Determine isCustom status
    for s in result:
        s["isCustom"] = s.get("keyCombo") != s.get("defaultKeyCombo", "")

    return ShortcutListResponse(
        shortcuts=[ShortcutModel(**s) for s in result],
        total=len(result),
    )


@router.get("/{shortcut_id}", response_model=ShortcutModel)
async def get_shortcut(shortcut_id: str):
    """Get a single shortcut by ID."""
    if shortcut_id not in _shortcuts:
        raise HTTPException(status_code=404, detail="Shortcut not found")
    s = _shortcuts[shortcut_id].copy()
    s["isCustom"] = s.get("keyCombo") != s.get("defaultKeyCombo", "")
    return ShortcutModel(**s)


@router.put("/{shortcut_id}", response_model=ShortcutModel)
async def update_shortcut(shortcut_id: str, shortcut: ShortcutModel):
    """Update a shortcut's key combination."""
    if shortcut_id not in _shortcuts:
        raise HTTPException(status_code=404, detail="Shortcut not found")

    s = _shortcuts[shortcut_id].copy()
    s["keyCombo"] = shortcut.keyCombo
    _shortcuts[shortcut_id] = s
    await _save_shortcuts()

    s["isCustom"] = s.get("keyCombo") != s.get("defaultKeyCombo", "")
    return ShortcutModel(**s)


@router.post("/reset", response_model=ShortcutListResponse)
async def reset_shortcuts():
    """Reset all shortcuts to defaults."""
    global _shortcuts
    _shortcuts = {s["id"]: s.copy() for s in DEFAULT_SHORTCUTS_DATA}
    await _save_shortcuts()

    result = list(_shortcuts.values())
    for s in result:
        s["isCustom"] = s.get("keyCombo") != s.get("defaultKeyCombo", "")

    return ShortcutListResponse(
        shortcuts=[ShortcutModel(**s) for s in result],
        total=len(result),
    )


@router.get("/stats", response_model=ShortcutStatsResponse)
async def get_stats():
    """Get shortcut statistics."""
    all_shortcuts = list(_shortcuts.values())
    total = len(all_shortcuts)
    custom = sum(1 for s in all_shortcuts if s.get("keyCombo") != s.get("defaultKeyCombo", ""))
    by_category: dict[str, int] = {}
    for s in all_shortcuts:
        cat = s.get("category", "Other")
        by_category[cat] = by_category.get(cat, 0) + 1

    return ShortcutStatsResponse(
        totalShortcuts=total,
        customShortcuts=custom,
        defaultShortcuts=total - custom,
        categories=by_category,
    )