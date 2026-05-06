"""Slow Response Time Alerting Router.

Provides alert-configuration management and alert-history queries for
agent response-time anomalies.  Alerts are evaluated against the Gateway
timing store's p95 latency data.

Endpoints
---------
GET  /api/alerts                  – list alert configs for all agents
GET  /api/alerts/{name}/config    – get alert config for a specific agent
PUT  /api/alerts/{name}/config    – update alert config for an agent
GET  /api/alerts/{name}/history   – get alert history for an agent
POST /api/alerts/evaluate         – run alert evaluation on all agents (or agent={name})
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

# ──────────────────────────────────────────────────────────────────────
# In-memory alert state (file-persisted between restarts)
# ──────────────────────────────────────────────────────────────────────

_lock: asyncio.Lock = asyncio.Lock()

# Per-agent alert config: agent_name -> _AlertCfg
_alert_cfgs: dict[str, _AlertCfg] = {}

# Alert history: list of per-agent firing records across all time
_alert_history: list[AlertRecord] = []


# ── models ────────────────────────────────────────────────────────────


class AlertSeverity(str):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class AlertConfigRequest(BaseModel):
    """Request body for creating / updating an alert config."""

    enabled: bool = Field(default=True, description="Whether alerting is enabled for this agent")
    p95_threshold_ms: int = Field(
        default=5000, ge=100, description="p95 latency threshold in ms.  Alert fires when p95 > this value."
    )
    cooldown_minutes: int = Field(
        default=30, ge=1, le=1440, description="Minimum minutes between consecutive alerts for the same agent"
    )
    severity: str = Field(
        default="warning",
        description="Alert severity: critical, warning, info",
    )


class AlertConfig(BaseModel):
    """Full alert configuration for one agent."""

    agent_name: str
    enabled: bool = True
    p95_threshold_ms: int = 5000
    cooldown_minutes: int = 30
    severity: str = "warning"
    last_fired_at: str | None = None  # ISO-8601 timestamp
    updated_at: str = ""


class AlertRecord(BaseModel):
    """Single alert firing (or auto-resolved) event."""

    agent_name: str
    severity: str
    message: str
    p95_ms: int | None = None  # p95 value that triggered the alert
    threshold_ms: int = 0
    status: str = "firing"  # firing | resolved
    fired_at: str = ""  # ISO-8601
    resolved_at: str | None = None  # ISO-8601, None while firing


class AlertHistoryResponse(BaseModel):
    agent_name: str
    alerts: list[AlertRecord] = []


class AlertListResponse(BaseModel):
    configs: list[AlertConfig] = []


class EvaluateRequest(BaseModel):
    agent: str | None = Field(default=None, description="Evaluate a single agent by name (optional)")
    dry_run: bool = Field(default=False, description="If true, only return what would fire without recording")


class EvaluateResponse(BaseModel):
    fired: list[AlertRecord] = []
    dry_run: bool = False


# ── internal config type ──────────────────────────────────────────────


class _AlertCfg:
    """Internal mutable store for an alert configuration."""

    __slots__ = ("enabled", "p95_threshold_ms", "cooldown_minutes", "severity", "last_fired_at", "updated_at")

    def __init__(
        self,
        enabled: bool = True,
        p95_threshold_ms: int = 5000,
        cooldown_minutes: int = 30,
        severity: str = "warning",
        last_fired_at: float | None = None,
        updated_at: float | None = None,
    ) -> None:
        self.enabled = enabled
        self.p95_threshold_ms = p95_threshold_ms
        self.cooldown_minutes = cooldown_minutes
        self.severity = severity
        self.last_fired_at: float | None = last_fired_at  # monotonic wall-clock
        self.updated_at: float = updated_at or time.time()

    def to_response(self, agent_name: str) -> AlertConfig:
        return AlertConfig(
            agent_name=agent_name,
            enabled=self.enabled,
            p95_threshold_ms=self.p95_threshold_ms,
            cooldown_minutes=self.cooldown_minutes,
            severity=self.severity,
            last_fired_at=(
                datetime.fromtimestamp(self.last_fired_at, tz=timezone.utc).isoformat()
                if self.last_fired_at
                else None
            ),
            updated_at=datetime.fromtimestamp(self.updated_at, tz=timezone.utc).isoformat(),
        )

    def is_in_cooldown(self) -> bool:
        if self.last_fired_at is None:
            return False
        return (time.time() - self.last_fired_at) < (self.cooldown_minutes * 60)


# ── persistence helpers ───────────────────────────────────────────────


def _alerts_file() -> Path:
    base_dir = get_paths().base_dir
    return base_dir / "alerts_state.json"


async def _load_state() -> None:
    """Restore alert configs and history from disk."""
    f = _alerts_file()
    if not f.is_file():
        return
    try:
        data = json.loads(f.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        logger.warning("Corrupt alerts state file, using defaults")
        return

    async with _lock:
        # Restore configs
        for entry in data.get("configs", []):
            name = entry.get("agent_name")
            if not name:
                continue
            _alert_cfgs[name] = _AlertCfg(
                enabled=entry.get("enabled", True),
                p95_threshold_ms=entry.get("p95_threshold_ms", 5000),
                cooldown_minutes=entry.get("cooldown_minutes", 30),
                severity=entry.get("severity", "warning"),
                last_fired_at=entry.get("_last_fired_at"),
                updated_at=entry.get("_updated_at"),
            )

        # Restore history (last 500)
        for entry in data.get("history", [])[-500:]:
            _alert_history.append(AlertRecord(**entry))

    logger.info("Loaded alert state: %d configs, %d history records", len(_alert_cfgs), len(_alert_history))


async def _save_state() -> None:
    """Persist alert configs and history to disk."""
    async with _lock:
        configs = []
        for name, cfg in _alert_cfgs.items():
            configs.append({
                "agent_name": name,
                "enabled": cfg.enabled,
                "p95_threshold_ms": cfg.p95_threshold_ms,
                "cooldown_minutes": cfg.cooldown_minutes,
                "severity": cfg.severity,
                "_last_fired_at": cfg.last_fired_at,
                "_updated_at": cfg.updated_at,
            })

        history = [r.model_dump() for r in _alert_history[-500:]]

    data = {"configs": configs, "history": history}
    f = _alerts_file()
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    logger.info("Saved alert state: %d configs, %d history records", len(configs), len(history))


# ── endpoints ─────────────────────────────────────────────────────────


@router.get("", response_model=AlertListResponse, summary="List Alert Configurations")
async def list_alert_configs() -> AlertListResponse:
    """Return alert configurations for all agents that have been configured."""
    async with _lock:
        configs = [cfg.to_response(name) for name, cfg in _alert_cfgs.items()]
    return AlertListResponse(configs=configs)


@router.get("/{name}/config", response_model=AlertConfig, summary="Get Agent Alert Config")
async def get_alert_config(name: str) -> AlertConfig:
    """Get the alert configuration for a specific agent."""
    name = name.strip()
    async with _lock:
        cfg = _alert_cfgs.get(name)
    if cfg is None:
        raise HTTPException(status_code=404, detail=f"No alert config found for agent '{name}'")
    return cfg.to_response(name)


@router.put("/{name}/config", response_model=AlertConfig, summary="Update Agent Alert Config")
async def update_alert_config(name: str, request: AlertConfigRequest) -> AlertConfig:
    """Create or update the alert configuration for a specific agent."""
    name = name.strip()
    if request.severity not in ("critical", "warning", "info"):
        raise HTTPException(status_code=422, detail="severity must be one of: critical, warning, info")

    async with _lock:
        _alert_cfgs[name] = _AlertCfg(
            enabled=request.enabled,
            p95_threshold_ms=request.p95_threshold_ms,
            cooldown_minutes=request.cooldown_minutes,
            severity=request.severity,
        )
        cfg = _alert_cfgs[name]

    # Persist immediately
    await _save_state()
    return cfg.to_response(name)


@router.get("/{name}/history", response_model=AlertHistoryResponse, summary="Get Agent Alert History")
async def get_alert_history(name: str) -> AlertHistoryResponse:
    """Return alert history (firing + resolved events) for a specific agent."""
    name = name.strip()
    async with _lock:
        agent_alerts = [a for a in _alert_history if a.agent_name == name]
    return AlertHistoryResponse(agent_name=name, alerts=agent_alerts)


@router.post("/evaluate", response_model=EvaluateResponse, summary="Evaluate Alert Rules")
async def evaluate_alerts(request: EvaluateRequest = EvaluateRequest()) -> EvaluateResponse:
    """Evaluate p95 latency against configured thresholds and fire/resolve alerts.

    This endpoint is designed for both manual triggering and scheduled automation.
    When ``dry_run=True``, no alerts are actually recorded or persisted.
    """
    from app.gateway.timing import get_timing_store

    timing_store = get_timing_store()

    # Determine which agents to evaluate
    if request.agent:
        agent_names = [request.agent.strip()]
    else:
        agent_names = list(_alert_cfgs.keys())
        # Also check any agents with timing data but no config yet
        timed_names = await timing_store.get_agent_names()
        for tn in timed_names:
            if tn not in agent_names:
                agent_names.append(tn)

    fired_alerts: list[AlertRecord] = []
    now = time.time()
    now_iso = datetime.fromtimestamp(now, tz=timezone.utc).isoformat()

    for agent_name in agent_names:
        async with _lock:
            cfg = _alert_cfgs.get(agent_name)
        if cfg is None or not cfg.enabled:
            continue

        # Check cooldown
        if cfg.is_in_cooldown():
            continue

        # Get p95 latency
        p95_ms = await timing_store.percentile_ms(agent_name, 95)
        if p95_ms is None:
            continue  # No timing data yet

        if p95_ms <= cfg.p95_threshold_ms:
            # Below threshold — auto-resolve any active firing alerts for this agent
            if not request.dry_run:
                await _auto_resolve_firing(agent_name, now_iso)
            continue

        # p95 exceeds threshold — fire alert
        message = (
            f"Agent '{agent_name}' p95 response time ({p95_ms}ms) "
            f"exceeds threshold ({cfg.p95_threshold_ms}ms)"
        )
        record = AlertRecord(
            agent_name=agent_name,
            severity=cfg.severity,
            message=message,
            p95_ms=p95_ms,
            threshold_ms=cfg.p95_threshold_ms,
            status="firing",
            fired_at=now_iso,
            resolved_at=None,
        )

        if not request.dry_run:
            async with _lock:
                _alert_history.append(record)
                cfg.last_fired_at = now
                cfg.updated_at = now

        fired_alerts.append(record)
        logger.warning("ALERT FIRED: %s", message)

    if not request.dry_run and fired_alerts:
        await _save_state()

    return EvaluateResponse(fired=fired_alerts, dry_run=request.dry_run)


async def _auto_resolve_firing(agent_name: str, resolved_at_iso: str) -> None:
    """Mark any currently-firing alerts for *agent_name* as resolved."""
    async with _lock:
        for alert in _alert_history:
            if alert.agent_name == agent_name and alert.status == "firing":
                alert.status = "resolved"
                alert.resolved_at = resolved_at_iso
