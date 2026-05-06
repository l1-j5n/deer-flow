"""WebSocket endpoints for real-time agent status and metrics."""

import asyncio
import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.gateway.timing import get_timing_store

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])

# How often to push a status snapshot to the client (seconds).
STATUS_PUSH_INTERVAL = 5.0


@router.websocket("/ws/agents/{name}/status")
async def agent_status_ws(websocket: WebSocket, name: str) -> None:
    """WebSocket endpoint for live agent status.

    Protocol:
      - Server sends periodic ``{"type":"status","status":"...","responseTimeMs":..., ...}``
        messages every *STATUS_PUSH_INTERVAL* seconds.
      - Client may send ``{"type":"ping","ts":<unix_ms>}`` to measure RTT;
        server echoes back ``{"type":"pong","ts":<same_ts>}``.
    """
    await websocket.accept()
    logger.info("WebSocket agent-status connected for agent=%r", name)

    try:
        while True:
            # ── Compute current status + last_seen (single query) ──────
            activity = await _compute_agent_activity(name)
            status = activity["status"]
            last_seen = activity["last_seen"]

            timing_store = get_timing_store()
            rt_ms = await timing_store.last_response_time_ms(name)

            payload = {
                "type": "status",
                "status": status,
                "responseTimeMs": rt_ms,
                "lastSeen": last_seen,
                "version": None,
            }

            await websocket.send_text(json.dumps(payload))

            # ── Wait for next push (or incoming client messages) ───────
            try:
                while True:
                    data = await asyncio.wait_for(
                        websocket.receive_text(), timeout=STATUS_PUSH_INTERVAL
                    )
                    msg = json.loads(data)
                    if msg.get("type") == "ping":
                        pong = {"type": "pong", "ts": msg.get("ts")}
                        await websocket.send_text(json.dumps(pong))
                    # Ignore unknown message types
            except asyncio.TimeoutError:
                # No client message within the interval → push next status
                pass

    except WebSocketDisconnect:
        logger.info("WebSocket agent-status disconnected for agent=%r", name)
    except Exception:
        logger.exception("WebSocket agent-status error for agent=%r", name)
        try:
            await websocket.close()
        except Exception:
            pass


async def _compute_agent_activity(agent_name: str) -> dict:
    """Return ``{status, last_seen}`` from a single thread-list query.

    Status is one of ``"busy"`` / ``"online"`` / ``"offline"`` /
    ``"unknown"``.  ``last_seen`` is an ISO timestamp string or None.
    """
    try:
        from app.gateway.routers.agents import _list_agent_threads
        from deerflow.agents.checkpointer.provider import get_checkpointer

        checkpointer = get_checkpointer()
        threads = await _list_agent_threads(checkpointer, agent_name)
    except Exception:
        logger.debug("Cannot access checkpointer for %r", agent_name)
        return {"status": "unknown", "last_seen": None}

    if not threads:
        return {"status": "offline", "last_seen": None}

    # Find most recent updated_at
    last_active: str | None = None
    for t in threads:
        ua = t.get("updated_at")
        if ua:
            if last_active is None or ua > last_active:
                last_active = ua

    if not last_active:
        return {"status": "offline", "last_seen": None}

    try:
        last_dt = datetime.fromisoformat(last_active.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        logger.debug("Unparseable updated_at %r for %r", last_active, agent_name)
        return {"status": "offline", "last_seen": None}

    diff = (datetime.now(timezone.utc) - last_dt).total_seconds()

    if diff < 60:
        return {"status": "busy", "last_seen": last_active}
    elif diff < 300:
        return {"status": "online", "last_seen": last_active}
    return {"status": "offline", "last_seen": last_active}
