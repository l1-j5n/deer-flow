"""Workspace Notifications REST API Router.

Persistent notification management for the Electron workspace:
- Browse, mark-read, delete individual or clear all notifications
- Notification preference settings (which categories are enabled)
- Mock seed data covering 6 notification categories

Endpoints
---------
GET    /api/electron/notifications                – list notifications
POST   /api/electron/notifications/mark-read       – mark single/all as read
DELETE /api/electron/notifications/{id}            – delete single
POST   /api/electron/notifications/clear           – clear all
GET    /api/electron/notifications/settings        – read preferences
PUT    /api/electron/notifications/settings        – update preferences
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/electron/notifications", tags=["notifications"])

_lock = asyncio.Lock()
_notifications: list[dict] = []
_notif_settings: dict = {}
_persistence_path: Optional[Path] = None

# ── Pydantic models ───────────────────────────────────────────────────


class NotificationSettingsModel(BaseModel):
    enabled: bool = True
    categories: dict[str, bool] = Field(
        default_factory=lambda: {
            "system": True, "agent": True, "workflow": True,
            "security": True, "mcp": False, "update": True,
        }
    )
    severityThreshold: str = "info"  # info | warning | critical


class NotificationModel(BaseModel):
    id: str
    title: str
    message: str
    category: str
    severity: str  # info | warning | critical
    read: bool = False
    timestamp: str  # ISO 8601
    actionUrl: Optional[str] = None
    actionLabel: Optional[str] = None


class NotificationListResponse(BaseModel):
    notifications: list[NotificationModel]
    total: int
    unreadCount: int


class MarkReadRequest(BaseModel):
    ids: Optional[list[str]] = None  # If None, mark all as read


# ── Seed data ─────────────────────────────────────────────────────────

_SEED_NOTIFICATIONS = [
    {
        "id": "notif-001",
        "title": "New Agent Template Available",
        "message": "A new code review agent template has been published in the marketplace. It includes built-in security scanning tools.",
        "category": "agent",
        "severity": "info",
        "read": False,
        "timestamp": "2026-05-03T22:00:00Z",
        "actionUrl": "/workspace/marketplace",
        "actionLabel": "View",
    },
    {
        "id": "notif-002",
        "title": "Scheduled Backup Completed",
        "message": "Daily backup completed successfully at 21:00. 3 knowledge bases, 12 agents, 24 conversations backed up.",
        "category": "system",
        "severity": "info",
        "read": False,
        "timestamp": "2026-05-03T21:05:00Z",
        "actionUrl": "/workspace/backup",
        "actionLabel": "View Backups",
    },
    {
        "id": "notif-003",
        "title": "High API Usage Detected",
        "message": "Your API usage has exceeded 80%% of the daily quota. Current usage: 8,200/10,000 requests.",
        "category": "system",
        "severity": "warning",
        "read": False,
        "timestamp": "2026-05-03T20:30:00Z",
    },
    {
        "id": "notif-004",
        "title": "Security Policy Updated",
        "message": "A new security policy 'Deny SQL Injection Patterns' has been automatically enabled based on updated threat intelligence.",
        "category": "security",
        "severity": "info",
        "read": True,
        "timestamp": "2026-05-03T18:15:00Z",
        "actionUrl": "/workspace/security",
        "actionLabel": "Review",
    },
    {
        "id": "notif-005",
        "title": "Workflow Completed: Data Analysis",
        "message": "The Q1 Sales Analysis workflow has completed. Revenue: $4.2M (+18%% YoY). Full report available.",
        "category": "workflow",
        "severity": "info",
        "read": True,
        "timestamp": "2026-05-03T16:45:00Z",
        "actionUrl": "/workspace/charts",
        "actionLabel": "View Report",
    },
    {
        "id": "notif-006",
        "title": "MCP Server Connection Lost",
        "message": "Connection to external MCP server 'web-search' has been lost. Retrying in 30 seconds...",
        "category": "mcp",
        "severity": "warning",
        "read": False,
        "timestamp": "2026-05-03T15:20:00Z",
        "actionUrl": "/workspace/tools",
        "actionLabel": "Check Status",
    },
    {
        "id": "notif-007",
        "title": "Update Available: v0.51.0",
        "message": "DeerFlow v0.51.0 is available. Includes Settings & Notifications REST API migration and security policy enhancements.",
        "category": "update",
        "severity": "info",
        "read": False,
        "timestamp": "2026-05-03T14:00:00Z",
        "actionUrl": "/workspace/settings?section=about",
        "actionLabel": "Update Now",
    },
    {
        "id": "notif-008",
        "title": "File System Access Blocked",
        "message": "An agent attempted to access /etc/shadow but was blocked by security policy 'Limit File Write Scope'.",
        "category": "security",
        "severity": "critical",
        "read": False,
        "timestamp": "2026-05-03T13:45:00Z",
        "actionUrl": "/workspace/security",
        "actionLabel": "Investigate",
    },
    {
        "id": "notif-009",
        "title": "Agent Execution Timeout",
        "message": "Agent 'ResearchAssistant' exceeded the 5-minute timeout during a web search task. Task was cancelled to prevent resource exhaustion.",
        "category": "agent",
        "severity": "warning",
        "read": True,
        "timestamp": "2026-05-03T12:10:00Z",
        "actionUrl": "/workspace/agents/ResearchAssistant",
        "actionLabel": "View Agent",
    },
    {
        "id": "notif-010",
        "title": "System Health Check Passed",
        "message": "All system components operational. CPU: 23%%, Memory: 58%%, Disk: 72%% free. Cache hit rate: 87%%.",
        "category": "system",
        "severity": "info",
        "read": True,
        "timestamp": "2026-05-03T11:00:00Z",
        "actionUrl": "/workspace/health",
        "actionLabel": "Dashboard",
    },
    {
        "id": "notif-011",
        "title": "Knowledge Base Indexed",
        "message": "Knowledge base 'Technical Docs' has been indexed. 1,243 documents processed. Vector embeddings generated.",
        "category": "workflow",
        "severity": "info",
        "read": True,
        "timestamp": "2026-05-03T10:30:00Z",
        "actionUrl": "/workspace/knowledge-base",
        "actionLabel": "Browse",
    },
    {
        "id": "notif-012",
        "title": "New MCP Tool Registered",
        "message": "Custom MCP tool 'excel-analyzer' has been registered. It provides Excel file parsing and formula analysis.",
        "category": "mcp",
        "severity": "info",
        "read": False,
        "timestamp": "2026-05-03T09:45:00Z",
        "actionUrl": "/workspace/tool-tester",
        "actionLabel": "Test Tool",
    },
    {
        "id": "notif-013",
        "title": "Federated Sync Completed",
        "message": "Federation sync with 3 peer nodes completed. 12 KBs, 5 agents, 48 conversations synchronised.",
        "category": "system",
        "severity": "info",
        "read": False,
        "timestamp": "2026-05-03T08:00:00Z",
    },
    {
        "id": "notif-014",
        "title": "Deprecated Plugin Warning",
        "message": "Plugin 'legacy-ocr' v1.2 is using a deprecated API. It will stop working after v0.60.0. Please update to v2.0.",
        "category": "update",
        "severity": "warning",
        "read": True,
        "timestamp": "2026-05-02T17:00:00Z",
        "actionUrl": "/workspace/plugins",
        "actionLabel": "Manage Plugins",
    },
    {
        "id": "notif-015",
        "title": "Agent Chat Started",
        "message": "A new chat session with agent 'CodeReviewer' has been started by developer mode user.",
        "category": "agent",
        "severity": "info",
        "read": True,
        "timestamp": "2026-05-02T15:30:00Z",
        "actionUrl": "/workspace/chats",
        "actionLabel": "Join Chat",
    },
]

_DEFAULT_NOTIF_SETTINGS = {
    "enabled": True,
    "categories": {"system": True, "agent": True, "workflow": True, "security": True, "mcp": False, "update": True},
    "severityThreshold": "info",
}


# ── Persistence helpers ───────────────────────────────────────────────


async def _load_state() -> None:
    global _persistence_path
    try:
        paths = get_paths()
        _persistence_path = paths.base_dir / "notifications.json"
        if _persistence_path.exists():
            data = json.loads(_persistence_path.read_text(encoding="utf-8"))
            async with _lock:
                _notifications.clear()
                _notifications.extend(data.get("notifications", []))
                _notif_settings.clear()
                _notif_settings.update(data.get("settings", _DEFAULT_NOTIF_SETTINGS))
            logger.info("Restored %d notifications from disk", len(_notifications))
        else:
            async with _lock:
                _notifications.extend(_SEED_NOTIFICATIONS)
                _notif_settings.update(_DEFAULT_NOTIF_SETTINGS)
            await _save_state_nolock()
            logger.info("Seeded %d mock notifications", len(_notifications))
    except Exception:
        logger.exception("Failed to load notifications state (non-fatal)")
        async with _lock:
            if not _notifications:
                _notifications.extend(_SEED_NOTIFICATIONS)
            if not _notif_settings:
                _notif_settings.update(_DEFAULT_NOTIF_SETTINGS)


async def _save_state() -> None:
    await _save_state_nolock()


async def _save_state_nolock() -> None:
    if not _persistence_path:
        paths = get_paths()
        _persistence_path = paths.base_dir / "notifications.json"
    try:
        _persistence_path.parent.mkdir(parents=True, exist_ok=True)
        async with _lock:
            data = {"notifications": list(_notifications), "settings": dict(_notif_settings)}
        _persistence_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist notifications")


# ── Endpoints ─────────────────────────────────────────────────────────


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    category: Optional[str] = Query(None, description="Filter by category"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    unread_only: bool = Query(False, description="Show only unread notifications"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """List notifications with optional filters."""
    async with _lock:
        result = list(_notifications)
    if category:
        result = [n for n in result if n.get("category") == category]
    if severity:
        result = [n for n in result if n.get("severity") == severity]
    if unread_only:
        result = [n for n in result if not n.get("read", False)]
    result.sort(key=lambda n: n.get("timestamp", ""), reverse=True)
    total = len(result)
    sliced = result[offset : offset + limit]
    unread = sum(1 for n in _notifications if not n.get("read", False))
    return NotificationListResponse(notifications=sliced, total=len(sliced), unreadCount=unread)


@router.post("/mark-read")
async def mark_read(body: MarkReadRequest):
    """Mark notification(s) as read. If ids is None, mark all as read."""
    async with _lock:
        if body.ids is None:
            for n in _notifications:
                n["read"] = True
            count = len(_notifications)
        else:
            id_set = set(body.ids)
            count = 0
            for n in _notifications:
                if n["id"] in id_set and not n["read"]:
                    n["read"] = True
                    count += 1
    await _save_state_nolock()
    return {"ok": True, "markedRead": count}


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    """Delete a single notification."""
    async with _lock:
        for i, n in enumerate(_notifications):
            if n["id"] == notification_id:
                del _notifications[i]
                await _save_state_nolock()
                return {"ok": True, "id": notification_id}
    raise HTTPException(status_code=404, detail=f"Notification '{notification_id}' not found")


@router.post("/clear")
async def clear_all():
    """Delete all notifications."""
    async with _lock:
        count = len(_notifications)
        _notifications.clear()
    await _save_state_nolock()
    return {"ok": True, "cleared": count}


@router.get("/settings", response_model=NotificationSettingsModel)
async def get_settings():
    """Get notification preferences."""
    async with _lock:
        return dict(_notif_settings)


@router.put("/settings", response_model=NotificationSettingsModel)
async def update_settings(body: NotificationSettingsModel):
    """Update notification preferences (full replace)."""
    async with _lock:
        _notif_settings.clear()
        _notif_settings.update(body.model_dump())
    await _save_state_nolock()
    return dict(_notif_settings)
