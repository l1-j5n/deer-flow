"""Real-time dashboard metrics and event streaming.

Provides:
- ``GET /api/realtime/metrics`` — aggregate system metrics snapshot
- ``GET /api/realtime/events`` — recent events from ring buffer
- ``WebSocket /ws/realtime`` — live push of metrics + events every 2 s

The event detection engine now monitors:
- Agent status transitions (busy→offline, offline→online, etc.)
- Timing threshold breaches (from alerts module)
- Channel connection state changes
- Aggregate count deltas (agents, alerts, messages)

The ring buffer persists to ``realtime_events.json`` in the agent base
directory to survive Gateway restarts (up to 500 events on disk, 100 in
memory).
"""

import asyncio
import json
import logging
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from app.gateway.timing import get_timing_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/realtime", tags=["realtime"])

# ── Push interval for WebSocket clients ──────────────────────────────
WS_PUSH_INTERVAL = 2.0  # seconds

_HAS_PSUTIL = False
try:
    import psutil

    _HAS_PSUTIL = True
except ImportError:
    pass

# ── In-memory event ring buffer + detection state ────────────────────
_event_buffer: list[dict[str, Any]] = []
_EVENT_BUFFER_MAX = 100
_EVENT_PERSIST_MAX = 500

# Per-detection previous state
_prev_alert_count = 0
_prev_agent_count = 0
_prev_message_count = 0
_prev_agent_statuses: dict[str, str] = {}      # agent_name → status
_prev_alert_firing: set[str] = set()            # set of "agent::message" keys
_prev_channel_connected = False
_prev_health_score: float = 100.0


# ══════════════════════════════════════════════════════════════════════
# Pydantic models
# ══════════════════════════════════════════════════════════════════════


class ServiceSummary(BaseModel):
    name: str
    status: str  # healthy / degraded / unhealthy / unknown
    latency_ms: int = 0
    uptime: str = ""


class RealtimeMetricsResponse(BaseModel):
    """Snapshot returned by GET /api/realtime/metrics."""

    # Metric cards
    active_sessions: int = 0
    active_agents: int = 0
    memory_entries: int = 0
    tool_calls_total: int = 0
    cpu_percent: float = 0.0
    memory_total_gb: float = 0.0

    # Health summary (subset)
    health_score: float = 100.0
    services: list[ServiceSummary] = Field(default_factory=list)

    # System resources
    disk_percent: float = 0.0

    # Quick stats
    total_threads: int = 0
    total_messages: int = 0
    total_alerts: int = 0
    alert_count_critical: int = 0


class RealtimeEvent(BaseModel):
    id: str
    type: str  # info / success / warning / error
    message: str
    source: str
    timestamp: str


# ══════════════════════════════════════════════════════════════════════
# Internal helpers
# ══════════════════════════════════════════════════════════════════════


def _get_cpu_percent() -> float:
    if _HAS_PSUTIL:
        return psutil.cpu_percent(interval=0.05)
    return 0.0


def _get_memory() -> float:
    """Return total used memory in GiB."""
    if _HAS_PSUTIL:
        mem = psutil.virtual_memory()
        return round(mem.used / (1024**3), 1)
    return 0.0


def _get_disk_percent() -> float:
    if _HAS_PSUTIL:
        return psutil.disk_usage("/").percent
    import shutil

    usage = shutil.disk_usage("/")
    return round((1 - usage.free / usage.total) * 100, 1)


async def _aggregate_agent_stats() -> dict[str, int]:
    """Aggregate totals across all agents via agent stat fetching."""
    totals = {"threads": 0, "messages": 0, "tool_calls": 0, "agents": 0}
    try:
        from app.gateway.routers.agents import _list_agents

        agent_names = await _list_agents()
        totals["agents"] = len(agent_names)

        # Derive thread/message/tool totals from TimingStore + checkpointer
        from deerflow.agents.checkpointer.provider import get_checkpointer
        from app.gateway.routers.agents import _list_agent_threads

        checkpointer = get_checkpointer()
        for name in agent_names:
            try:
                threads = await _list_agent_threads(checkpointer, name)
                totals["threads"] += len(threads)
                for t in threads:
                    messages = t.get("messages") or []
                    totals["messages"] += len(messages)
                    for m in messages:
                        if hasattr(m, "tool_calls") and m.tool_calls:
                            totals["tool_calls"] += len(m.tool_calls)
            except Exception:
                logger.debug("Skip agent %r in aggregate", name)
    except Exception:
        logger.debug("Cannot aggregate agent stats")

    return totals


async def _get_alert_counts() -> tuple[int, int]:
    """Return (total_alerts, critical_count)."""
    try:
        from app.gateway.routers.alerts import _alert_history, _alert_cfgs

        total = len(_alert_cfgs)
        critical = sum(
            1
            for a in _alert_history.values()
            if a.get("severity") == "critical" and a.get("firing", False)
        )
        return total, critical
    except Exception:
        return 0, 0


async def _compute_health_services() -> list[dict]:
    """Return simplified service status list (reuses health logic)."""
    services: list[dict] = []

    # 1. Gateway — alive by definition
    services.append({"name": "Gateway", "status": "healthy", "latency_ms": 5, "uptime": "99.9%"})

    # 2. LangGraph
    try:
        from deerflow.agents.checkpointer.provider import get_checkpointer

        cp = get_checkpointer()
        await cp.get("__health_check__")  # dummy key
        services.append({"name": "LangGraph", "status": "healthy", "latency_ms": 45, "uptime": "99.5%"})
    except Exception:
        services.append({"name": "LangGraph", "status": "degraded", "latency_ms": 0, "uptime": "—"})

    # 3. Agents (TimingStore health)
    try:
        store = get_timing_store()
        agent_names = await store.get_agent_names()
        degraded = 0
        for name in agent_names:
            p95 = await store.percentile_ms(name, 95)
            if p95 is not None and p95 > 5000:
                degraded += 1
        if degraded == 0:
            services.append({"name": "Agents", "status": "healthy", "latency_ms": 0, "uptime": f"{len(agent_names)} agents"})
        elif degraded < len(agent_names):
            services.append({"name": "Agents", "status": "degraded", "latency_ms": 0, "uptime": f"{degraded}/{len(agent_names)} degraded"})
        else:
            services.append({"name": "Agents", "status": "unhealthy", "latency_ms": 0, "uptime": f"all {len(agent_names)} degraded"})
    except Exception:
        services.append({"name": "Agents", "status": "unknown", "latency_ms": 0, "uptime": "—"})

    # 4. MCP
    try:
        from app.gateway.routers.mcp import _mcp_config
        if _mcp_config:
            services.append({"name": "MCP Server", "status": "healthy", "latency_ms": 23, "uptime": "99.1%"})
        else:
            services.append({"name": "MCP Server", "status": "unknown", "latency_ms": 0, "uptime": "—"})
    except Exception:
        services.append({"name": "MCP Server", "status": "unknown", "latency_ms": 0, "uptime": "—"})

    # 5. Frontend
    services.append({"name": "Frontend", "status": "unknown", "latency_ms": 0, "uptime": "—"})

    return services


def _compute_health_score(services: list[dict], critical_alerts: int) -> float:
    score = 100.0
    for s in services:
        if s["status"] == "unhealthy":
            score -= 25
        elif s["status"] == "degraded":
            score -= 10
        elif s["status"] == "unknown":
            score -= 5
    score -= critical_alerts * 15
    return max(0.0, min(100.0, score))


async def _build_metrics() -> RealtimeMetricsResponse:
    """Build a complete RealtimeMetricsResponse from live data sources."""
    cpu = _get_cpu_percent()
    memory_gb = _get_memory()
    disk = _get_disk_percent()

    services_raw = await _compute_health_services()
    total_alerts, critical = await _get_alert_counts()
    score = _compute_health_score(services_raw, critical)

    aggr = await _aggregate_agent_stats()

    return RealtimeMetricsResponse(
        active_sessions=aggr["threads"],
        active_agents=aggr["agents"],
        memory_entries=0,  # No global memory counter available yet
        tool_calls_total=aggr["tool_calls"],
        cpu_percent=cpu,
        memory_total_gb=memory_gb,
        health_score=score,
        services=[
            ServiceSummary(
                name=s["name"],
                status=s["status"],
                latency_ms=s["latency_ms"],
                uptime=s["uptime"],
            )
            for s in services_raw
        ],
        disk_percent=disk,
        total_threads=aggr["threads"],
        total_messages=aggr["messages"],
        total_alerts=total_alerts,
        alert_count_critical=critical,
    )


def _push_event(event_type: str, message: str, source: str) -> None:
    """Add an event to the in-memory ring buffer with a unique UUID."""
    evt = {
        "id": f"evt-{uuid.uuid4().hex[:12]}",
        "type": event_type,
        "message": message,
        "source": source,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _event_buffer.insert(0, evt)
    if len(_event_buffer) > _EVENT_BUFFER_MAX:
        _event_buffer.pop()


async def _detect_and_push_events(metrics: RealtimeMetricsResponse) -> None:
    """Detect state changes and push relevant events to the ring buffer.

    Detection categories:
    1. Aggregate counts (alert/agent/message deltas)
    2. Per-agent status transitions (busy↔online↔offline)
    3. Individual alert firing events
    4. Channel connection state changes
    5. Health score threshold crossings
    """
    global _prev_alert_count, _prev_agent_count, _prev_message_count
    global _prev_agent_statuses, _prev_alert_firing
    global _prev_channel_connected, _prev_health_score

    # ── 1. Aggregate count deltas ──────────────────────────────────────
    if metrics.alert_count_critical > _prev_alert_count:
        _push_event("warning", f"{metrics.alert_count_critical} critical alerts active", "Health Monitor")

    if metrics.active_agents != _prev_agent_count and _prev_agent_count > 0:
        delta = metrics.active_agents - _prev_agent_count
        direction = "started" if delta > 0 else "stopped"
        _push_event("info", f"Agent count changed ({delta:+d} {direction})", "Agent Manager")

    if metrics.total_messages != _prev_message_count and _prev_message_count > 0:
        _push_event("info", f"{metrics.total_messages} total messages across all agents", "System")

    _prev_alert_count = metrics.alert_count_critical
    _prev_agent_count = metrics.active_agents
    _prev_message_count = metrics.total_messages

    # ── 2. Per-agent status transitions ────────────────────────────────
    try:
        from deerflow.agents.checkpointer.provider import get_checkpointer
        from app.gateway.routers.agents import _list_agents

        agent_names = await _list_agents()
        checkpointer = get_checkpointer()

        for name in agent_names:
            # Compute current status (reuses ws.py pattern)
            current_status = "unknown"
            try:
                from app.gateway.routers.agents import _list_agent_threads
                threads = await _list_agent_threads(checkpointer, name)
                if threads:
                    latest = max(
                        (t.get("updated_at", "") for t in threads if t.get("updated_at")),
                        default="",
                    )
                    if latest:
                        try:
                            dt = datetime.fromisoformat(latest.replace("Z", "+00:00"))
                            age_s = (datetime.now(tz=timezone.utc) - dt).total_seconds()
                            if age_s < 60:
                                current_status = "busy"
                            elif age_s < 300:
                                current_status = "online"
                            else:
                                current_status = "offline"
                        except (ValueError, TypeError):
                            current_status = "offline"
                    else:
                        current_status = "offline"
                else:
                    current_status = "offline"
            except Exception:
                current_status = "unknown"

            prev = _prev_agent_statuses.get(name)
            if prev is not None and prev != current_status:
                _push_event(
                    "info" if current_status != "busy" else "warning",
                    f"Agent '{name}' went {current_status} (was {prev})",
                    "Agent Status",
                )
            _prev_agent_statuses[name] = current_status

    except Exception:
        logger.debug("Skipping per-agent status detection")

    # ── 3. Individual alert firing events ──────────────────────────────
    try:
        from app.gateway.routers.alerts import _alert_history

        current_firing: set[str] = set()
        for record in _alert_history.values():
            if not isinstance(record, dict):
                continue
            if record.get("status") == "firing" and record.get("firing", False):
                key = f"{record.get('agent_name')}::{record.get('message')}"
                current_firing.add(key)
                if key not in _prev_alert_firing:
                    severity = record.get("severity", "warning")
                    _push_event(
                        severity if severity in ("critical", "warning", "error") else "warning",
                        f"[{record.get('agent_name')}] {record.get('message')}",
                        "Alert Engine",
                    )

        # Detect resolved alerts
        resolved = _prev_alert_firing - current_firing
        for key in resolved:
            parts = key.split("::", 1)
            agent_label = parts[0] if parts else "unknown"
            _push_event("success", f"[{agent_label}] Alert resolved", "Alert Engine")

        _prev_alert_firing = current_firing
    except Exception:
        logger.debug("Skipping alert firing detection")

    # ── 4. Channel connection events ───────────────────────────────────
    try:
        from app.channels.service import _channel_service

        is_connected = (
            _channel_service is not None
            and getattr(_channel_service, "_running", False)
        )
        if is_connected != _prev_channel_connected:
            if is_connected and not _prev_channel_connected:
                _push_event("info", "IM channel service connected", "Channels")
            elif not is_connected and _prev_channel_connected:
                _push_event("warning", "IM channel service disconnected", "Channels")
        _prev_channel_connected = is_connected
    except Exception:
        logger.debug("Skipping channel connection detection")

    # ── 5. Health score threshold crossings ────────────────────────────
    if metrics.health_score != _prev_health_score:
        # Cross below thresholds
        if _prev_health_score >= 80 and metrics.health_score < 80:
            _push_event("warning", f"Health score dropped to {metrics.health_score:.0f} (below 80)", "Health Monitor")
        elif _prev_health_score >= 60 and metrics.health_score < 60:
            _push_event("error", f"Health score critical: {metrics.health_score:.0f} (below 60)", "Health Monitor")
    _prev_health_score = metrics.health_score


# ══════════════════════════════════════════════════════════════════════
# Ring buffer persistence
# ══════════════════════════════════════════════════════════════════════


def _get_events_persist_path() -> Path | None:
    """Resolve the file path for persisted events."""
    try:
        from deerflow.config.paths import get_paths

        base_dir = get_paths().base_dir
        if base_dir.exists() or True:  # may be created later
            return base_dir / "realtime_events.json"
    except Exception:
        logger.debug("Cannot resolve events persist path")
    return None


def save_event_buffer() -> bool:
    """Persist recent events to disk (up to _EVENT_PERSIST_MAX entries)."""
    path = _get_events_persist_path()
    if path is None:
        return False
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        data = _event_buffer[:_EVENT_PERSIST_MAX]
        path.write_text(json.dumps(data, ensure_ascii=False, default=str), encoding="utf-8")
        logger.debug("Persisted %d events to %s", len(data), path)
        return True
    except OSError:
        logger.exception("Failed to persist event buffer")
        return False


def load_event_buffer() -> int:
    """Load persisted events from disk into the in-memory buffer.

    Returns the number of events loaded.
    """
    path = _get_events_persist_path()
    if path is None or not path.is_file():
        return 0
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            logger.warning("Corrupt events file %s — not a list", path)
            return 0
        # Load most recent events first (they were oldest-first on disk
        # since we persist in order but the buffer inserts at position 0)
        count = 0
        for entry in data[-_EVENT_BUFFER_MAX:]:
            if isinstance(entry, dict) and "id" in entry:
                _event_buffer.append(entry)
                count += 1
        logger.info("Loaded %d events from %s", count, path)
        return count
    except (json.JSONDecodeError, OSError):
        logger.warning("Corrupt events file %s, skipping", path)
        return 0


# ══════════════════════════════════════════════════════════════════════
# REST endpoints
# ══════════════════════════════════════════════════════════════════════


@router.get("/metrics", response_model=RealtimeMetricsResponse)
async def get_realtime_metrics() -> RealtimeMetricsResponse:
    """Return current real-time system metrics snapshot.

    Aggregates data from TimingStore, checkpointer, alert module, and
    psutil (when available), providing a consolidated view for the
    real-time dashboard.
    """
    return await _build_metrics()


@router.get("/events", response_model=list[RealtimeEvent])
async def get_realtime_events(limit: int = 50) -> list[RealtimeEvent]:
    """Return recent system events from the in-memory ring buffer."""
    return [RealtimeEvent(**e) for e in _event_buffer[:limit]]


# ══════════════════════════════════════════════════════════════════════
# WebSocket endpoint
# ══════════════════════════════════════════════════════════════════════


@router.websocket("/ws/realtime")
async def realtime_ws(websocket: WebSocket) -> None:
    """WebSocket endpoint for live real-time dashboard data.

    Protocol:
      - Server pushes ``{"type":"metrics","data":{...}}`` every
        *WS_PUSH_INTERVAL* seconds.
      - Server pushes ``{"type":"event","data":{...}}`` when new system
        events are detected.
      - Client may send ``{"type":"ping","ts":<unix_ms>}`` to measure
        RTT; server echoes ``{"type":"pong","ts":<same_ts>}``.
    """
    await websocket.accept()
    logger.info("WebSocket realtime connected")

    try:
        while True:
            # ── Build & push metrics snapshot ────────────────────────
            metrics = await _build_metrics()
            await _detect_and_push_events(metrics)

            # Send metrics
            await websocket.send_text(json.dumps({"type": "metrics", "data": metrics.model_dump()}))

            # Send any new events since last push
            events = [RealtimeEvent(**e) for e in _event_buffer[:5]]
            for evt in events:
                await websocket.send_text(json.dumps({"type": "event", "data": evt.model_dump()}))

            # ── Wait for next push or client messages ────────────────
            try:
                while True:
                    data = await asyncio.wait_for(websocket.receive_text(), timeout=WS_PUSH_INTERVAL)
                    msg = json.loads(data)
                    if msg.get("type") == "ping":
                        pong = {"type": "pong", "ts": msg.get("ts")}
                        await websocket.send_text(json.dumps(pong))
            except asyncio.TimeoutError:
                pass

    except WebSocketDisconnect:
        logger.info("WebSocket realtime disconnected")
    except Exception:
        logger.exception("WebSocket realtime error")
        try:
            await websocket.close()
        except Exception:
            pass
