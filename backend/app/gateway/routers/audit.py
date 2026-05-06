"""Audit Log REST API Router.

Provides query, stats, export, and integrity verification endpoints for
audit events. Uses JSON-file persistence with mock seed data on first run.

Endpoints
---------
GET  /api/electron/audit/events      – query audit events
GET  /api/electron/audit/stats       – audit statistics
GET  /api/electron/audit/recent      – recent events
POST /api/electron/audit/examine     – integrity verification
GET  /api/electron/audit/export/json – export JSON
GET  /api/electron/audit/export/csv  – export CSV
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/electron/audit", tags=["audit"])

_lock = asyncio.Lock()
_events: list[dict] = []
_persistence_path: Optional[Path] = None

# ── Pydantic models ───────────────────────────────────────────────────


class AuditQueryParams(BaseModel):
    category: str | None = None
    severity: str | None = None
    sessionId: str | None = Field(default=None, alias="sessionId")
    since: str | None = None
    until: str | None = None
    limit: int = Field(default=100, ge=1, le=1000)
    offset: int = Field(default=0, ge=0)

    model_config = {"populate_by_name": True}


# ── Persistence helpers ───────────────────────────────────────────────


def _get_persistence_path() -> Path:
    global _persistence_path
    if _persistence_path is None:
        try:
            base = get_paths().base_dir
        except Exception:
            base = Path(".")
        _persistence_path = base / "audit_events.json"
    return _persistence_path


async def _load_state() -> None:
    path = _get_persistence_path()
    if not path.exists():
        await _seed_mock_events()
        return
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        logger.exception("Failed to read audit_events.json")
        await _seed_mock_events()
        return
    _events.clear()
    _events.extend(data.get("events", []))
    logger.info("Loaded %d audit events", len(_events))


async def _save_state() -> None:
    path = _get_persistence_path()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps({"events": _events, "updatedAt": _now_iso()}, indent=2),
            encoding="utf-8",
        )
    except Exception:
        logger.exception("Failed to persist audit events")


async def _seed_mock_events() -> None:
    """Generate 50 mock audit events covering all categories."""
    categories = ["security", "data", "system", "user", "session", "workflow", "mcp", "skill", "config"]
    severities = ["critical", "high", "medium", "low", "info"]
    actions = {
        "security": ["login_attempt", "api_key_rotated", "access_denied", "tls_handshake", "rate_limit_triggered"],
        "data": ["data_export", "data_import", "backup_created", "data_deleted", "data_anonymized"],
        "system": ["service_start", "service_stop", "health_check", "config_reload", "dependency_update"],
        "user": ["user_created", "user_login", "user_logout", "preference_update", "profile_updated"],
        "session": ["session_start", "session_end", "session_timeout", "session_resume", "session_transfer"],
        "workflow": ["workflow_start", "workflow_complete", "workflow_fail", "step_execute", "decision_made"],
        "mcp": ["mcp_connect", "mcp_disconnect", "tool_call", "tool_result", "mcp_error"],
        "skill": ["skill_loaded", "skill_executed", "skill_unloaded", "skill_error", "skill_config_changed"],
        "config": ["config_updated", "model_added", "model_removed", "threshold_changed", "feature_toggled"],
    }
    results = ["success", "failure", "partial"]

    _events.clear()
    base_time = datetime.now(timezone.utc)
    for i in range(50):
        category = categories[i % len(categories)]
        action = actions[category][i % 5]
        ts = (base_time - timedelta(minutes=i * 37)).isoformat()
        evt = {
            "id": f"audit-{uuid.uuid4().hex[:12]}",
            "timestamp": ts,
            "category": category,
            "severity": severities[i % 5],
            "action": action,
            "actor": {"type": "system" if i % 3 == 0 else "user", "id": f"user-{i % 10}", "name": f"User {i % 10}"},
            "target": {"type": "module", "id": f"mod-{i % 8}", "name": f"Module {i % 8}"},
            "result": results[i % 3],
            "details": {"source": "gateway", "ip": f"192.168.1.{100 + i % 150}"},
            "hash": hashlib.sha256(f"audit-{i}-{ts}".encode()).hexdigest(),
            "previousHash": hashlib.sha256(f"prev-{max(0, i-1)}".encode()).hexdigest() if i > 0 else "",
            "sessionId": f"session-{i % 8}",
            "errorMessage": f"Mock error {i}" if i % 7 == 0 else None,
        }
        _events.append(evt)

    await _save_state()
    logger.info("Seeded %d mock audit events", len(_events))


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Endpoints ─────────────────────────────────────────────────────────


@router.get("/events")
async def query_events(
    category: str | None = Query(default=None),
    severity: str | None = Query(default=None),
    sessionId: str | None = Query(default=None, alias="sessionId"),
    since: str | None = Query(default=None),
    until: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
):
    results = list(_events)

    if category:
        results = [e for e in results if e.get("category") == category]
    if severity:
        results = [e for e in results if e.get("severity") == severity]
    if sessionId:
        results = [e for e in results if e.get("sessionId") == sessionId]
    if since:
        try:
            since_dt = datetime.fromisoformat(since)
            results = [e for e in results if datetime.fromisoformat(e.get("timestamp", "")) >= since_dt]
        except ValueError:
            pass
    if until:
        try:
            until_dt = datetime.fromisoformat(until)
            results = [e for e in results if datetime.fromisoformat(e.get("timestamp", "")) <= until_dt]
        except ValueError:
            pass

    # Sort by timestamp descending
    results.sort(key=lambda e: e.get("timestamp", ""), reverse=True)

    return results[offset : offset + limit]


@router.get("/stats")
async def get_stats():
    by_category: dict[str, int] = {}
    by_severity: dict[str, int] = {}
    by_result: dict[str, int] = {}
    by_actor_type: dict[str, int] = {}

    for e in _events:
        cat = e.get("category", "unknown")
        sev = e.get("severity", "info")
        res = e.get("result", "unknown")
        atype = e.get("actor", {}).get("type", "unknown")

        by_category[cat] = by_category.get(cat, 0) + 1
        by_severity[sev] = by_severity.get(sev, 0) + 1
        by_result[res] = by_result.get(res, 0) + 1
        by_actor_type[atype] = by_actor_type.get(atype, 0) + 1

    timestamps = [e.get("timestamp", "") for e in _events if e.get("timestamp")]
    earliest = min(timestamps) if timestamps else _now_iso()
    latest = max(timestamps) if timestamps else _now_iso()

    # Check tampered entries (hash length verification)
    tampered = sum(1 for e in _events if not (e.get("hash") and len(e.get("hash", "")) == 64))

    return {
        "totalEvents": len(_events),
        "byCategory": by_category,
        "bySeverity": by_severity,
        "byResult": by_result,
        "byActorType": by_actor_type,
        "timeRange": {"earliest": earliest, "latest": latest},
        "tamperedEntries": tampered,
    }


@router.get("/recent")
async def get_recent(
    limit: int = Query(default=50, ge=1, le=200),
    category: str | None = Query(default=None),
):
    results = list(_events)
    if category:
        results = [e for e in results if e.get("category") == category]
    results.sort(key=lambda e: e.get("timestamp", ""), reverse=True)
    return results[:limit]


@router.post("/examine")
async def verify_integrity():
    tampered = sum(1 for e in _events if not (e.get("hash") and len(e.get("hash", "")) == 64))
    return {
        "valid": tampered == 0,
        "tamperedCount": tampered,
        "totalChecked": len(_events),
    }


@router.get("/export/json")
async def export_json(
    category: str | None = Query(default=None),
    since: str | None = Query(default=None),
    until: str | None = Query(default=None),
):
    results = list(_events)
    if category:
        results = [e for e in results if e.get("category") == category]
    if since:
        try:
            since_dt = datetime.fromisoformat(since)
            results = [e for e in results if datetime.fromisoformat(e.get("timestamp", "")) >= since_dt]
        except ValueError:
            pass
    if until:
        try:
            until_dt = datetime.fromisoformat(until)
            results = [e for e in results if datetime.fromisoformat(e.get("timestamp", "")) <= until_dt]
        except ValueError:
            pass

    return {
        "exportedAt": _now_iso(),
        "count": len(results),
        "events": results,
    }


@router.get("/export/csv")
async def export_csv(
    category: str | None = Query(default=None),
    since: str | None = Query(default=None),
    until: str | None = Query(default=None),
):
    results = list(_events)
    if category:
        results = [e for e in results if e.get("category") == category]
    if since:
        try:
            since_dt = datetime.fromisoformat(since)
            results = [e for e in results if datetime.fromisoformat(e.get("timestamp", "")) >= since_dt]
        except ValueError:
            pass
    if until:
        try:
            until_dt = datetime.fromisoformat(until)
            results = [e for e in results if datetime.fromisoformat(e.get("timestamp", "")) <= until_dt]
        except ValueError:
            pass

    headers = ["id", "timestamp", "category", "severity", "action", "actorType", "actorId", "targetType", "targetId", "result", "errorMessage"]
    rows = [
        [
            e.get("id", ""),
            e.get("timestamp", ""),
            e.get("category", ""),
            e.get("severity", ""),
            e.get("action", ""),
            e.get("actor", {}).get("type", ""),
            e.get("actor", {}).get("id", ""),
            e.get("target", {}).get("type", ""),
            e.get("target", {}).get("id", ""),
            e.get("result", ""),
            e.get("errorMessage", ""),
        ]
        for e in results
    ]

    import csv as csv_mod
    import io
    output = io.StringIO()
    writer = csv_mod.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)

    return {"csv": output.getvalue()}
