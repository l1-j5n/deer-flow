"""Agent Sharing Router.

Provides share-link management for agents.  Each share link is a short
random token that allows read-only access to an agent's public profile
(description, model, tool_groups, soul).

Share links are persisted per-agent in ``<agent_dir>/share_links.json``.

Endpoints
---------
POST   /api/agents/{name}/share          – create a new share link
GET    /api/agents/{name}/shares         – list active share links
DELETE /api/agents/{name}/shares/{token} – revoke a share link
GET    /api/shared/agents/{token}        – public: view shared agent (no auth)
"""

from __future__ import annotations

import asyncio
import json
import logging
import secrets
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from deerflow.config.agents_config import load_agent_config, load_agent_soul
from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(tags=["sharing"])

# ──────────────────────────────────────────────────────────────────────
# In-memory share registry (file-persisted per agent)
# ──────────────────────────────────────────────────────────────────────

_lock: asyncio.Lock = asyncio.Lock()

# agent_name → list[dict] (loaded from disk / written to disk)
_shares: dict[str, list[dict]] = {}

# ── models ────────────────────────────────────────────────────────────


class ShareLink(BaseModel):
    """A single share link for an agent."""

    token: str = Field(..., description="Short random token (8 hex chars)")
    created_at: str = Field(..., description="ISO 8601 creation timestamp")
    expires_at: str | None = Field(default=None, description="ISO 8601 expiry timestamp, or null for no expiry")


class ShareLinkListResponse(BaseModel):
    """List of active share links for an agent."""

    agent_name: str
    shares: list[ShareLink]
    count: int


class CreateShareResponse(BaseModel):
    """Response when creating a new share link."""

    token: str = Field(..., description="The generated share token")
    url: str = Field(..., description="Full share URL (frontend-relative path)")
    created_at: str
    expires_at: str | None = None


class CreateShareRequest(BaseModel):
    """Optional request body when creating a share link."""

    expires_in_hours: int | None = Field(default=None, ge=1, le=8760, description="Optional expiry in hours (max 1 year)")


class SharedAgentResponse(BaseModel):
    """Public read-only view of a shared agent (no auth required)."""

    agent_name: str
    description: str
    model: str | None = None
    tool_groups: list[str] | None = None
    soul: str | None = None
    shared_at: str
    expires_at: str | None = None
    expired: bool = False


class RevokeResponse(BaseModel):
    """Response when revoking a share link."""

    success: bool
    token: str


# ── helpers ───────────────────────────────────────────────────────────


def _shares_path(agent_name: str) -> Path:
    """Return the path to the per-agent share-links JSON file."""
    paths = get_paths()
    agents_dir = paths.agents_dir
    return agents_dir / agent_name / "share_links.json"


def _load_shares(agent_name: str) -> list[dict]:
    """Load share links from disk for a specific agent."""
    if agent_name in _shares:
        return _shares[agent_name]
    path = _shares_path(agent_name)
    if not path.exists():
        _shares[agent_name] = []
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            _shares[agent_name] = data
            return data
    except Exception:
        logger.warning("Failed to parse share_links.json for agent '%s', starting fresh", agent_name)
    _shares[agent_name] = []
    return []


def _save_shares(agent_name: str, shares: list[dict]) -> None:
    """Persist share links to disk for a specific agent."""
    _shares[agent_name] = shares
    path = _shares_path(agent_name)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(shares, indent=2, ensure_ascii=False), encoding="utf-8")


def _prune_expired(shares: list[dict]) -> list[dict]:
    """Remove expired share links from the list (mutates and returns)."""
    now = datetime.now(timezone.utc)
    active: list[dict] = []
    for s in shares:
        if s.get("expires_at"):
            try:
                exp = datetime.fromisoformat(s["expires_at"])
                if exp <= now:
                    continue  # expired — drop
            except (ValueError, TypeError):
                pass
        active.append(s)
    return active


def _generate_token() -> str:
    """Generate a short random share token (8 hex characters)."""
    return secrets.token_hex(4)[:8]


# ── lifecycle helpers (called from app.py) ───────────────────────────


async def load_all_shares() -> None:
    """Load all agent share links from disk on startup."""
    paths = get_paths()
    agents_dir = paths.agents_dir
    if not agents_dir.exists():
        return
    async with _lock:
        for agent_dir in agents_dir.iterdir():
            if not agent_dir.is_dir():
                continue
            agent_name = agent_dir.name
            share_file = agent_dir / "share_links.json"
            if share_file.exists():
                try:
                    data = json.loads(share_file.read_text(encoding="utf-8"))
                    if isinstance(data, list):
                        # prune expired on load
                        active = _prune_expired(data)
                        _shares[agent_name] = active
                        if len(active) < len(data):
                            _save_shares(agent_name, active)
                except Exception:
                    logger.warning("Failed to load shares for agent '%s'", agent_name)


async def persist_all_shares() -> None:
    """Persist all share links to disk on shutdown."""
    async with _lock:
        for agent_name, shares in _shares.items():
            _save_shares(agent_name, shares)


# ── helper: compute frontend URL from custom header ────────────────────

def _build_share_url(token: str, origin: str = "") -> str:
    """Build the frontend share URL from a token and optional origin."""
    base = origin.rstrip("/") if origin else ""
    return f"{base}/share/{token}"


# ── endpoints ─────────────────────────────────────────────────────────


@router.post("/api/agents/{name}/share", response_model=CreateShareResponse)
async def create_share(name: str, body: CreateShareRequest = CreateShareRequest()) -> CreateShareResponse:
    """Create a new share link for an agent.

    Generates a random 8-char hex token and optionally sets an expiry.
    """
    cfg = load_agent_config(name)
    if cfg is None:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

    token = _generate_token()
    now = datetime.now(timezone.utc)
    created_at = now.isoformat()
    expires_at: str | None = None

    if body.expires_in_hours:
        exp = now.replace(hour=(now.hour + body.expires_in_hours) % 24)  # simplified
        from datetime import timedelta
        exp = now + timedelta(hours=body.expires_in_hours)
        expires_at = exp.isoformat()

    async with _lock:
        shares = _load_shares(name)
        shares = _prune_expired(shares)
        shares.append({
            "token": token,
            "created_at": created_at,
            "expires_at": expires_at,
        })
        _save_shares(name, shares)

    logger.info("Created share link '%s' for agent '%s'%s",
                token, name, f" (expires in {body.expires_in_hours}h)" if body.expires_in_hours else "")

    return CreateShareResponse(
        token=token,
        url=_build_share_url(token),
        created_at=created_at,
        expires_at=expires_at,
    )


@router.get("/api/agents/{name}/shares", response_model=ShareLinkListResponse)
async def list_shares(name: str) -> ShareLinkListResponse:
    """List all active share links for an agent."""
    cfg = load_agent_config(name)
    if cfg is None:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

    async with _lock:
        shares = _load_shares(name)
        shares = _prune_expired(shares)
        _save_shares(name, shares)

    return ShareLinkListResponse(
        agent_name=name,
        shares=[ShareLink(**s) for s in shares],
        count=len(shares),
    )


@router.delete("/api/agents/{name}/shares/{token}", response_model=RevokeResponse)
async def revoke_share(name: str, token: str) -> RevokeResponse:
    """Revoke (delete) a specific share link by token."""
    cfg = load_agent_config(name)
    if cfg is None:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

    async with _lock:
        shares = _load_shares(name)
        shares = _prune_expired(shares)
        original_len = len(shares)
        shares = [s for s in shares if s.get("token") != token]
        new_len = len(shares)

        if new_len == original_len:
            raise HTTPException(status_code=404, detail=f"Share token '{token}' not found for agent '{name}'")

        _save_shares(name, shares)
        logger.info("Revoked share link '%s' for agent '%s'", token, name)

    return RevokeResponse(success=True, token=token)


@router.get("/api/shared/agents/{token}", response_model=SharedAgentResponse)
async def get_shared_agent(token: str) -> SharedAgentResponse:
    """Public endpoint — view a shared agent by token (no auth required).

    Returns 404 if the token is not found or expired.
    """
    now = datetime.now(timezone.utc)

    async with _lock:
        # Search all agent share registries for this token
        for agent_name, shares in _shares.items():
            for s in shares:
                if s.get("token") != token:
                    continue
                # Check expiry
                if s.get("expires_at"):
                    try:
                        exp = datetime.fromisoformat(s["expires_at"])
                        if exp <= now:
                            raise HTTPException(status_code=410, detail="This share link has expired")
                    except (ValueError, TypeError):
                        pass

                # Load agent data
                cfg = load_agent_config(agent_name)
                if cfg is None:
                    raise HTTPException(status_code=410, detail="The shared agent no longer exists")

                soul = load_agent_soul(agent_name)

                return SharedAgentResponse(
                    agent_name=cfg.name,
                    description=cfg.description,
                    model=cfg.model,
                    tool_groups=cfg.tool_groups,
                    soul=soul,
                    shared_at=s["created_at"],
                    expires_at=s.get("expires_at"),
                    expired=False,
                )

    # Token not found in any agent's share list
    raise HTTPException(status_code=404, detail="Share link not found or has been revoked")
