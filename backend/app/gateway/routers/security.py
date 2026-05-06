"""Security Settings REST API Router.

Provides endpoints for viewing security configuration, policies, and rate-limit
status. Includes mock data mirroring a realistic security posture.
Enables browser-mode access to security settings outside Electron.

Endpoints
---------
GET  /api/electron/security/stats       – security feature status
GET  /api/electron/security/policies    – list security policies
GET  /api/electron/security/rate-limit  – current rate-limit status
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/electron/security", tags=["security"])

_lock = asyncio.Lock()
_policies: dict[str, dict] = {}
_persistence_path: Optional[Path] = None
_start_time = time.time()

# ── Pydantic models ───────────────────────────────────────────────────


class SecurityPolicyModel(BaseModel):
    id: str
    name: str
    type: str  # allow | deny | prompt
    pattern: str
    enabled: bool
    category: str  # path | file | input | network | command


class RateLimitModel(BaseModel):
    windowMs: int
    maxRequests: int
    currentRequests: int
    remainingRequests: int
    resetAt: str


class SecurityStatsModel(BaseModel):
    encryptionEnabled: bool
    totalPolicies: int
    activePolicies: int
    rateLimitEnabled: bool
    inputSanitizationEnabled: bool
    pathSanitizationEnabled: bool
    apiKeyValidationEnabled: bool


# ── Seed data ─────────────────────────────────────────────────────────

_SEED_POLICIES = [
    {
        "id": "sec-pol-001",
        "name": "Block Dangerous Paths",
        "type": "deny",
        "pattern": r"\.\./|\.\.\\",
        "enabled": True,
        "category": "path",
    },
    {
        "id": "sec-pol-002",
        "name": "Allow Safe File Extensions",
        "type": "allow",
        "pattern": r"\.(txt|md|json|yaml|yml|toml)$",
        "enabled": True,
        "category": "file",
    },
    {
        "id": "sec-pol-003",
        "name": "Sanitize HTML Input",
        "type": "deny",
        "pattern": r"<script|javascript:|onerror\s*=",
        "enabled": True,
        "category": "input",
    },
    {
        "id": "sec-pol-004",
        "name": "Prompt for External URLs",
        "type": "prompt",
        "pattern": r"^https?://(?!localhost|127\.0\.0\.1)",
        "enabled": True,
        "category": "network",
    },
    {
        "id": "sec-pol-005",
        "name": "Block Shell Commands",
        "type": "deny",
        "pattern": r"rm\s+-rf|del\s+/f|format\s+[c-z]:",
        "enabled": True,
        "category": "command",
    },
    {
        "id": "sec-pol-006",
        "name": "Limit File Write Scope",
        "type": "deny",
        "pattern": r"^/(etc|sys|proc|dev)/",
        "enabled": True,
        "category": "path",
    },
    {
        "id": "sec-pol-007",
        "name": "Allow API Keys in Headers",
        "type": "allow",
        "pattern": r"^X-API-Key:\s*sk-[a-zA-Z0-9]+$",
        "enabled": True,
        "category": "input",
    },
    {
        "id": "sec-pol-008",
        "name": "Deny Unsafe Deserialisation",
        "type": "deny",
        "pattern": r"pickle\.loads|yaml\.load\b(?!_all\b)|eval\s*\(",
        "enabled": True,
        "category": "command",
    },
    {
        "id": "sec-pol-009",
        "name": "Prompt for Large File Uploads",
        "type": "prompt",
        "pattern": r"Content-Length:\s*[2-9]\d{7,}",
        "enabled": True,
        "category": "file",
    },
    {
        "id": "sec-pol-010",
        "name": "Block Local File Access from Web",
        "type": "deny",
        "pattern": r"file:///(etc|home|Users|Windows)",
        "enabled": True,
        "category": "network",
    },
    {
        "id": "sec-pol-011",
        "name": "Allow Inline Data URIs (Safe)",
        "type": "allow",
        "pattern": r"^data:(image|text)/",
        "enabled": False,
        "category": "input",
    },
    {
        "id": "sec-pol-012",
        "name": "Deny SQL Injection Patterns",
        "type": "deny",
        "pattern": r"(\bUNION\b.*\bSELECT\b|\bDROP\s+TABLE\b|';?\s*--\s*)",
        "enabled": True,
        "category": "input",
    },
]


# ── Persistence helpers ───────────────────────────────────────────────


async def _load_state() -> None:
    global _persistence_path
    try:
        paths = get_paths()
        _persistence_path = paths.base_dir / "security_policies.json"
        if _persistence_path.exists():
            data = json.loads(_persistence_path.read_text(encoding="utf-8"))
            async with _lock:
                _policies.clear()
                _policies.update(data)
            logger.info("Restored %d security policies from disk", len(_policies))
        else:
            async with _lock:
                for p in _SEED_POLICIES:
                    _policies[p["id"]] = p
            await _save_state_nolock()
            logger.info("Seeded %d mock security policies", len(_policies))
    except Exception:
        logger.exception("Failed to load security policy state (non-fatal)")
        async with _lock:
            if not _policies:
                for p in _SEED_POLICIES:
                    _policies[p["id"]] = p


async def _save_state() -> None:
    await _save_state_nolock()


async def _save_state_nolock() -> None:
    if not _persistence_path:
        paths = get_paths()
        _persistence_path = paths.base_dir / "security_policies.json"
    try:
        _persistence_path.parent.mkdir(parents=True, exist_ok=True)
        async with _lock:
            data = dict(_policies)
        _persistence_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist security policies")


# ── Helpers ───────────────────────────────────────────────────────────


def _compute_stats() -> SecurityStatsModel:
    active = sum(1 for p in _policies.values() if p.get("enabled", False))
    return SecurityStatsModel(
        encryptionEnabled=True,
        totalPolicies=len(_policies),
        activePolicies=active,
        rateLimitEnabled=True,
        inputSanitizationEnabled=True,
        pathSanitizationEnabled=True,
        apiKeyValidationEnabled=True,
    )


def _simulate_rate_limit() -> RateLimitModel:
    """Simulate a sliding-window rate-limit counter using process uptime."""
    window_ms = 60_000
    max_req = 100
    elapsed = int((time.time() - _start_time) * 1000)
    cycles = elapsed // window_ms
    offset = elapsed % window_ms
    # Deterministic "usage" that resets each window
    used = (hash(f"rl_{cycles}") % 70) + 5  # 5–74 range
    remaining = max(0, max_req - used)
    reset_at_ts = (int(time.time() * 1000) + (window_ms - offset)) / 1000.0
    from datetime import datetime, timezone
    reset_str = datetime.fromtimestamp(reset_at_ts, tz=timezone.utc).isoformat()
    return RateLimitModel(
        windowMs=window_ms,
        maxRequests=max_req,
        currentRequests=used,
        remainingRequests=remaining,
        resetAt=reset_str,
    )


# ── Endpoints ─────────────────────────────────────────────────────────


@router.get("/stats", response_model=SecurityStatsModel)
async def get_stats():
    """Get security feature status summary."""
    return _compute_stats()


@router.get("/policies")
async def list_policies(
    category: Optional[str] = Query(None, description="Filter by category"),
    enabled: Optional[bool] = Query(None, description="Filter by enabled status"),
):
    """List security policies with optional filters."""
    async with _lock:
        result = list(_policies.values())
    if category:
        result = [p for p in result if p.get("category") == category]
    if enabled is not None:
        result = [p for p in result if p.get("enabled", False) == enabled]
    result.sort(key=lambda p: (p.get("category", ""), p.get("name", "")))
    return {"policies": result, "total": len(result)}


@router.get("/rate-limit", response_model=RateLimitModel)
async def get_rate_limit():
    """Get current rate-limit status."""
    return _simulate_rate_limit()
