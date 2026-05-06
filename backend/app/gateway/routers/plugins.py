"""Plugin Manager REST API Router.

Provides endpoints for managing installed plugins with JSON-file persistence.
Includes mock plugin data for the built-in and community plugins. Enables
browser-mode access to plugin management outside Electron.

Endpoints
---------
GET    /api/electron/plugins           – list/search plugins
GET    /api/electron/plugins/{id}      – get single plugin
PUT    /api/electron/plugins/{id}/enable   – enable a plugin
PUT    /api/electron/plugins/{id}/disable  – disable a plugin
DELETE /api/electron/plugins/{id}      – uninstall a plugin
GET    /api/electron/plugins/stats     – plugin statistics
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import copy
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/electron/plugins", tags=["plugins"])

_lock = asyncio.Lock()
_plugins: dict[str, dict] = {}
_persistence_path: Optional[Path] = None

# ── Pydantic models ───────────────────────────────────────────────────


class PluginManifestModel(BaseModel):
    id: str
    name: str
    version: str
    description: str
    author: str
    permissions: list[str] = Field(default_factory=list)
    hooks: list[str] = Field(default_factory=list)
    dependencies: dict[str, str] = Field(default_factory=dict)


class PluginModel(BaseModel):
    id: str
    manifest: PluginManifestModel
    status: str = "installed"
    path: str = ""
    enabledAt: str | None = None
    error: str | None = None
    hookCount: int = 0


class PluginStatsModel(BaseModel):
    totalPlugins: int = 0
    enabledPlugins: int = 0
    disabledPlugins: int = 0
    errorPlugins: int = 0
    incompatiblePlugins: int = 0
    totalHooks: int = 0


# ── Mock plugin data ──────────────────────────────────────────────────

_MOCK_PLUGINS: list[dict] = [
    {
        "id": "plugin-web-search",
        "manifest": {
            "id": "plugin-web-search",
            "name": "Web Search Pro",
            "version": "1.2.0",
            "description": "Enhanced web search with multi-engine support and result aggregation",
            "author": "DeerFlow Team",
            "permissions": ["network:outbound", "filesystem:cache"],
            "hooks": ["message:preprocess", "tool:postexec", "session:startup"],
            "dependencies": {},
        },
        "status": "enabled",
        "path": "/plugins/web-search",
        "enabledAt": "2025-03-15T10:30:00Z",
        "hookCount": 3,
    },
    {
        "id": "plugin-file-manager",
        "manifest": {
            "id": "plugin-file-manager",
            "name": "File Manager Plus",
            "version": "2.0.1",
            "description": "Advanced file operations with cloud storage integration and batch processing",
            "author": "Community",
            "permissions": ["filesystem:read", "filesystem:write", "network:api"],
            "hooks": ["filesystem:file-open", "filesystem:file-save", "session:cleanup"],
            "dependencies": {},
        },
        "status": "enabled",
        "path": "/plugins/file-manager",
        "enabledAt": "2025-04-01T08:00:00Z",
        "hookCount": 3,
    },
    {
        "id": "plugin-excel-tools",
        "manifest": {
            "id": "plugin-excel-tools",
            "name": "Excel Tools",
            "version": "1.5.0",
            "description": "Create, edit, and analyze Excel spreadsheets with formula support",
            "author": "DeerFlow Team",
            "permissions": ["filesystem:read", "filesystem:write"],
            "hooks": ["tool:register", "filesystem:file-open"],
            "dependencies": {},
        },
        "status": "enabled",
        "path": "/plugins/excel-tools",
        "enabledAt": "2025-02-20T14:00:00Z",
        "hookCount": 2,
    },
    {
        "id": "plugin-ppt-generator",
        "manifest": {
            "id": "plugin-ppt-generator",
            "name": "PPT Generator",
            "version": "1.0.0",
            "description": "Generate PowerPoint presentations from templates and data",
            "author": "Community",
            "permissions": ["filesystem:read", "filesystem:write"],
            "hooks": ["tool:register", "message:render"],
            "dependencies": {},
        },
        "status": "disabled",
        "path": "/plugins/ppt-generator",
        "hookCount": 2,
    },
    {
        "id": "plugin-code-interpreter",
        "manifest": {
            "id": "plugin-code-interpreter",
            "name": "Code Interpreter",
            "version": "2.1.0",
            "description": "Execute code in a sandboxed environment with multi-language support",
            "author": "DeerFlow Team",
            "permissions": ["sandbox:execute", "filesystem:temp"],
            "hooks": ["tool:register", "message:render", "session:cleanup"],
            "dependencies": {"nodejs": ">=18.0.0"},
        },
        "status": "enabled",
        "path": "/plugins/code-interpreter",
        "enabledAt": "2025-01-10T09:00:00Z",
        "hookCount": 3,
    },
    {
        "id": "plugin-analytics-dashboard",
        "manifest": {
            "id": "plugin-analytics-dashboard",
            "name": "Analytics Dashboard",
            "version": "0.9.0",
            "description": "Real-time analytics dashboard with customizable widgets and charts",
            "author": "Community",
            "permissions": ["network:api", "filesystem:read"],
            "hooks": ["dashboard:widget", "message:preprocess", "session:startup"],
            "dependencies": {"echarts": ">=5.0.0"},
        },
        "status": "error",
        "path": "/plugins/analytics-dashboard",
        "error": "Missing dependency: echarts >= 5.0.0 not found",
        "hookCount": 3,
    },
    {
        "id": "plugin-email-sender",
        "manifest": {
            "id": "plugin-email-sender",
            "name": "Email Sender",
            "version": "1.1.0",
            "description": "Send emails via SMTP with template support and attachment handling",
            "author": "DeerFlow Team",
            "permissions": ["network:smtp", "filesystem:read"],
            "hooks": ["tool:register"],
            "dependencies": {},
        },
        "status": "disabled",
        "path": "/plugins/email-sender",
        "hookCount": 1,
    },
    {
        "id": "plugin-i18n-translator",
        "manifest": {
            "id": "plugin-i18n-translator",
            "name": "i18n Translator",
            "version": "1.3.0",
            "description": "Automatic translation of messages, documents, and UI strings",
            "author": "Community",
            "permissions": ["network:api"],
            "hooks": ["message:preprocess", "message:render"],
            "dependencies": {},
        },
        "status": "enabled",
        "path": "/plugins/i18n-translator",
        "enabledAt": "2025-04-15T16:00:00Z",
        "hookCount": 2,
    },
]


# ── Persistence helpers ────────────────────────────────────────────────


def _get_persistence_path() -> Path:
    global _persistence_path
    if _persistence_path is None:
        try:
            base = get_paths().base_dir
        except Exception:
            base = Path(".")
        _persistence_path = base / "plugins.json"
    return _persistence_path


async def _load_state() -> None:
    path = _get_persistence_path()
    if not path.exists():
        # First run: seed with mock data
        for p in _MOCK_PLUGINS:
            _plugins[p["id"]] = copy.deepcopy(p)
        await _save_state()
        logger.info("Seeded %d mock plugins", len(_plugins))
        return
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        logger.exception("Failed to read plugins.json")
        return
    for p in data.get("plugins", []):
        if isinstance(p, dict) and p.get("id"):
            _plugins[p["id"]] = p
    logger.info("Loaded %d plugins", len(_plugins))


async def _save_state() -> None:
    path = _get_persistence_path()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "plugins": list(_plugins.values()),
            "updatedAt": time.time(),
        }
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist plugin state")


# ── Stats computation ─────────────────────────────────────────────────


def _compute_stats() -> dict:
    stats = {
        "totalPlugins": len(_plugins),
        "enabledPlugins": 0,
        "disabledPlugins": 0,
        "errorPlugins": 0,
        "incompatiblePlugins": 0,
        "totalHooks": 0,
    }
    for p in _plugins.values():
        status = p.get("status", "installed")
        if status == "enabled":
            stats["enabledPlugins"] += 1
        elif status == "disabled":
            stats["disabledPlugins"] += 1
        elif status == "error":
            stats["errorPlugins"] += 1
        elif status == "incompatible":
            stats["incompatiblePlugins"] += 1
        stats["totalHooks"] += p.get("hookCount", 0)
    return stats


# ── Endpoints ──────────────────────────────────────────────────────────


@router.get("")
async def list_plugins(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
):
    """List/search installed plugins."""
    results = list(_plugins.values())

    if search:
        q = search.lower()
        results = [
            p for p in results
            if q in p["manifest"]["name"].lower()
            or q in p["manifest"]["description"].lower()
            or q in p["manifest"]["author"].lower()
        ]
    if status:
        results = [p for p in results if p.get("status") == status]

    return results


@router.get("/{plugin_id}")
async def get_plugin(plugin_id: str):
    """Get a single plugin by ID."""
    p = _plugins.get(plugin_id)
    if p is None:
        raise HTTPException(status_code=404, detail="Plugin not found")
    return p


@router.put("/{plugin_id}/enable")
async def enable_plugin(plugin_id: str):
    """Enable a plugin."""
    async with _lock:
        p = _plugins.get(plugin_id)
        if p is None:
            raise HTTPException(status_code=404, detail="Plugin not found")
        from datetime import datetime, timezone
        p["status"] = "enabled"
        p["enabledAt"] = datetime.now(timezone.utc).isoformat()
        p["error"] = None
        await _save_state()
        return {"success": True, "plugin": p}


@router.put("/{plugin_id}/disable")
async def disable_plugin(plugin_id: str):
    """Disable a plugin."""
    async with _lock:
        p = _plugins.get(plugin_id)
        if p is None:
            raise HTTPException(status_code=404, detail="Plugin not found")
        p["status"] = "disabled"
        await _save_state()
        return {"success": True, "plugin": p}


@router.delete("/{plugin_id}")
async def uninstall_plugin(plugin_id: str):
    """Uninstall a plugin."""
    async with _lock:
        if plugin_id not in _plugins:
            raise HTTPException(status_code=404, detail="Plugin not found")
        del _plugins[plugin_id]
        await _save_state()
        return {"success": True}


@router.get("/stats")
async def get_stats():
    """Get plugin statistics."""
    return _compute_stats()
