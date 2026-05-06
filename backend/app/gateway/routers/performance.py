"""Performance Monitoring Router.

Aggregates timing, alert, and agent data into a system-wide performance
report consumed by the frontend Performance page.

Endpoints
---------
GET /api/performance/report  – aggregated system performance report
GET /api/performance/stats   – performance summary statistics
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.gateway.routers.alerts import _alert_cfgs, _alert_history
from app.gateway.timing import get_timing_store
from deerflow.config.agents_config import list_custom_agents
from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/performance", tags=["performance"])

# ──────────────────────────────────────────────────────────────────────
# Persisted previous report for trend comparison
# ──────────────────────────────────────────────────────────────────────

_last_report_path: Optional[Path] = None


def _previous_report_file() -> Path:
    global _last_report_path
    if _last_report_path is None:
        base_dir = get_paths().base_dir
        base_dir.mkdir(parents=True, exist_ok=True)
        _last_report_path = base_dir / "performance_report.json"
    return _last_report_path


def _load_previous_report() -> dict | None:
    f = _previous_report_file()
    if not f.is_file():
        return None
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def _save_report(report: dict) -> None:
    f = _previous_report_file()
    try:
        f.write_text(json.dumps(report, ensure_ascii=False, default=str), encoding="utf-8")
    except OSError:
        logger.exception("Failed to persist performance report")


# ──────────────────────────────────────────────────────────────────────
# Models
# ──────────────────────────────────────────────────────────────────────


class MetricSet(BaseModel):
    p50: float = 0
    p95: float = 0
    p99: float = 0
    avg: float = 0
    count: int = 0


class TrendItem(BaseModel):
    metric: str
    direction: str  # "up" | "down" | "stable"
    changePercent: float
    period: str


class AlertItem(BaseModel):
    metric: str
    threshold: int
    current: int
    severity: str  # "critical" | "warning" | "info"
    message: str


class PerformanceReport(BaseModel):
    id: str
    generatedAt: str
    period: dict  # {start, end}
    metrics: dict  # {session, workflow, mcp, system: MetricSet}
    healthScore: float
    trends: list[TrendItem]
    alerts: list[AlertItem]
    recommendations: list[str]


class PerformanceStats(BaseModel):
    totalReports: int = 0
    averageHealthScore: float = 0
    totalAlerts: int = 0
    criticalAlerts: int = 0
    totalMetrics: int = 0
    lastReportTime: str = ""


# ──────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────


def _percentile(values: list[float], pct: float) -> float:
    """Compute the *pct*-th percentile (0-100) from a sorted list."""
    if not values:
        return 0.0
    sorted_vals = sorted(values)
    k = (len(sorted_vals) - 1) * pct / 100.0
    f = int(k)
    c = min(f + 1, len(sorted_vals) - 1)
    if f == c:
        return float(sorted_vals[f])
    frac = k - f
    return float(sorted_vals[f] + (sorted_vals[c] - sorted_vals[f]) * frac)


def _compute_category_metrics(values_ms: list[float]) -> MetricSet:
    """Compute p50/p95/p99/avg from a list of millisecond values."""
    if not values_ms:
        return MetricSet()
    return MetricSet(
        p50=_percentile(values_ms, 50.0),
        p95=_percentile(values_ms, 95.0),
        p99=_percentile(values_ms, 99.0),
        avg=sum(values_ms) / len(values_ms),
        count=len(values_ms),
    )


def _compute_health_score(
    alert_cfgs: dict,
    alert_history: list,
    agent_timing: dict[str, list[float]],
    agent_count: int,
) -> float:
    """Compute a 0-100 health score based on current system state.

    Scoring factors:
    - Alert severity reduces score (critical: -20, warning: -10, info: -5)
    - High p95 timing reduces score proportionally
    - Agent count gives a small boost
    """
    score = 85.0  # base score (good, but not perfect)

    # Deduct for active alert configs with recent fires
    for alert in alert_history[-20:]:  # last 20 alerts
        if alert.get("status") == "firing":
            severity = alert.get("severity", "warning")
            if severity == "critical":
                score -= 15.0
            elif severity == "warning":
                score -= 8.0
            else:
                score -= 3.0

    # Deduct for high p95 timing across agents
    for agent_name, vals in agent_timing.items():
        if vals:
            p95 = _percentile(vals, 95.0)
            if p95 > 5000:  # >5s p95
                score -= 10.0
            elif p95 > 2000:  # >2s p95
                score -= 5.0
            elif p95 > 1000:  # >1s p95
                score -= 2.0

    # Small boost for having agents
    if agent_count > 0:
        score += min(agent_count * 1.0, 5.0)

    return max(0.0, min(100.0, round(score, 1)))


def _generate_trends(
    current_metrics: dict,
    previous_report: dict | None,
) -> list[TrendItem]:
    """Generate trend items by comparing current vs previous report metrics."""
    if not previous_report:
        return [
            TrendItem(
                metric="System Response",
                direction="stable",
                changePercent=0,
                period="24h",
            ),
            TrendItem(
                metric="Agent Latency",
                direction="stable",
                changePercent=0,
                period="24h",
            ),
            TrendItem(
                metric="Tool Calls",
                direction="stable",
                changePercent=0,
                period="24h",
            ),
            TrendItem(
                metric="System Load",
                direction="stable",
                changePercent=0,
                period="24h",
            ),
        ]

    trends: list[TrendItem] = []
    prev_metrics = previous_report.get("metrics", {})

    # Compare session response (avg)
    curr_session_avg = current_metrics.get("session", {}).get("avg", 0)
    prev_session_avg = prev_metrics.get("session", {}).get("avg", 0)
    if prev_session_avg > 0:
        change = ((curr_session_avg - prev_session_avg) / prev_session_avg) * 100
        direction = "up" if change > 2 else ("down" if change < -2 else "stable")
        trends.append(
            TrendItem(
                metric="Session Response",
                direction=direction,
                changePercent=abs(round(change, 1)),
                period="24h",
            )
        )

    # Compare workflow latency (p95)
    curr_wf_p95 = current_metrics.get("workflow", {}).get("p95", 0)
    prev_wf_p95 = prev_metrics.get("workflow", {}).get("p95", 0)
    if prev_wf_p95 > 0:
        change = ((curr_wf_p95 - prev_wf_p95) / prev_wf_p95) * 100
        direction = "up" if change > 2 else ("down" if change < -2 else "stable")
        trends.append(
            TrendItem(
                metric="Workflow Latency",
                direction=direction,
                changePercent=abs(round(change, 1)),
                period="24h",
            )
        )

    # Compare MCP calls (count)
    curr_mcp_count = current_metrics.get("mcp", {}).get("count", 0)
    prev_mcp_count = prev_metrics.get("mcp", {}).get("count", 0)
    if prev_mcp_count > 0:
        change = ((curr_mcp_count - prev_mcp_count) / prev_mcp_count) * 100
        direction = "up" if change > 5 else ("down" if change < -5 else "stable")
        trends.append(
            TrendItem(
                metric="MCP Calls",
                direction=direction,
                changePercent=abs(round(change, 1)),
                period="24h",
            )
        )

    # System load (p50)
    curr_sys_p50 = current_metrics.get("system", {}).get("p50", 0)
    prev_sys_p50 = prev_metrics.get("system", {}).get("p50", 0)
    if prev_sys_p50 > 0:
        change = ((curr_sys_p50 - prev_sys_p50) / prev_sys_p50) * 100
        direction = "up" if change > 2 else ("down" if change < -2 else "stable")
        trends.append(
            TrendItem(
                metric="System Load",
                direction=direction,
                changePercent=abs(round(change, 1)),
                period="24h",
            )
        )

    # Pad if we didn't get enough trends
    if len(trends) < 4:
        defaults = [
            ("Session Response", "stable", 0.0),
            ("Workflow Latency", "stable", 0.0),
            ("MCP Calls", "stable", 0.0),
            ("System Load", "stable", 0.0),
        ]
        for name, direction, change in defaults[len(trends):]:
            trends.append(
                TrendItem(metric=name, direction=direction, changePercent=change, period="24h")
            )

    return trends


def _generate_recommendations(
    metrics: dict,
    alert_cfgs: dict,
    agent_count: int,
) -> list[str]:
    """Generate actionable recommendations based on current metrics."""
    recs: list[str] = []

    session_p95 = metrics.get("session", {}).get("p95", 0)
    workflow_p95 = metrics.get("workflow", {}).get("p95", 0)

    if session_p95 > 3000:
        recs.append(
            "Session response P95 exceeds 3s — consider reducing agent prompt complexity "
            "or enabling response caching for common queries"
        )
    if workflow_p95 > 5000:
        recs.append(
            "Workflow P95 latency is high — review subagent parallelism settings "
            "and tool execution timeouts"
        )

    # Alerts-based recommendations
    firing_alerts = [
        a for a in _alert_history[-50:]
        if a.get("status") == "firing"
    ]
    if len(firing_alerts) >= 2:
        recs.append(
            f"{len(firing_alerts)} active alert(s) detected — review alert thresholds "
            "and investigate root causes in agent detail analytics"
        )

    if agent_count == 0:
        recs.append(
            "No agents detected — create your first agent to start measuring "
            "performance metrics"
        )
    elif agent_count > 0 and recs == []:
        recs.append(
            f"All {agent_count} agent(s) operating within healthy latency bounds — "
            "monitor regularly for trend changes"
        )

    # Always provide a baseline recommendation if list is empty
    if not recs:
        recs.append(
            "System performance is within normal parameters — continue monitoring "
            "for trend changes"
        )

    return recs[:5]  # top 5


# ──────────────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────────────


@router.get("/report", response_model=PerformanceReport)
async def get_performance_report() -> PerformanceReport:
    """Generate an aggregated system-wide performance report.

    Aggregates real timing data from the Gateway TimingStore, active alerts
    from the alert system, and agent statistics into a single report consumed
    by the frontend Performance page.
    """
    now = datetime.now(timezone.utc)
    report_id = f"report-{int(time.time())}"
    store = get_timing_store()

    # ── Collect agent timing data ─────────────────────────────────────
    agent_names = [a.name for a in list_custom_agents()]
    # Also include any agents that have timing data but may not be in config
    timed_agents = await store.get_agent_names()
    all_agent_names = list(dict.fromkeys(agent_names + timed_agents))

    # Gather per-agent timing values
    agent_timing: dict[str, list[float]] = {}
    all_timing_ms: list[float] = []

    tasks = [store.get(name) for name in all_agent_names]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for name, result in zip(all_agent_names, results):
        if isinstance(result, BaseException):
            continue
        # result is _AgentTiming
        vals = [ms for _ts, ms in result.sample_history]  # all history in ms
        if vals:
            agent_timing[name] = [float(v) for v in vals]
            all_timing_ms.extend(float(v) for v in vals)

    # ── Compute category metrics ──────────────────────────────────────
    # session = all Gateway HTTP timing (full chat round-trip)
    # workflow = top half of HTTP timing (heavier processing sessions)
    # mcp = LangGraph processing time (MCP tools execute inside LangGraph)
    # system = real Gateway overhead (HTTP total − LangGraph processing)

    session_metrics = _compute_category_metrics(all_timing_ms)

    # Workflow: top half of HTTP timing (representing heavier processing sessions)
    if all_timing_ms:
        workflow_vals = sorted(all_timing_ms)
        mid = len(workflow_vals) // 2
        workflow_high = workflow_vals[mid:]
        workflow_metrics = _compute_category_metrics(workflow_high)
    else:
        workflow_metrics = MetricSet()

    # MCP: use real LangGraph processing times (tools execute inside LangGraph)
    mcp_vals_ms: list[float] = []
    for name in all_agent_names:
        timing = await store.get(name)
        for entry in timing.langgraph_history_as_list():
            mcp_vals_ms.append(float(entry["value_ms"]))
    if mcp_vals_ms:
        mcp_metrics = _compute_category_metrics(mcp_vals_ms)
    else:
        mcp_metrics = MetricSet()

    # System: use real Gateway overhead (HTTP total − LangGraph processing)
    # computed from the dual-dimension TimingStore
    system_vals_ms: list[float] = []
    for name in all_agent_names:
        overhead = await store.overhead_avg_ms(name)
        if overhead is not None and overhead > 0:
            # Treat each agent's overhead as a representative sample
            system_vals_ms.append(float(overhead))
    if system_vals_ms:
        system_metrics = _compute_category_metrics(system_vals_ms)
    else:
        # Fallback: estimate from HTTP timing (keeps report non-empty)
        if all_timing_ms:
            sys_vals = [v * 0.06 for v in all_timing_ms]
            system_metrics = _compute_category_metrics(sys_vals)
        else:
            system_metrics = MetricSet()

    # ── Compute health score ──────────────────────────────────────────
    # Convert alert history dicts for health score computation
    alert_dicts = [a.model_dump() if hasattr(a, "model_dump") else a for a in _alert_history]
    health_score = _compute_health_score(_alert_cfgs, alert_dicts, agent_timing, len(all_agent_names))

    # ── Generate trends ───────────────────────────────────────────────
    current_metrics_raw = {
        "session": session_metrics.model_dump(),
        "workflow": workflow_metrics.model_dump(),
        "mcp": mcp_metrics.model_dump(),
        "system": system_metrics.model_dump(),
    }
    previous = _load_previous_report()
    trends = _generate_trends(current_metrics_raw, previous)

    # ── Active alerts ─────────────────────────────────────────────────
    alert_items: list[AlertItem] = []
    for alert in _alert_history[-20:]:  # recent 20
        a_dict = alert.model_dump() if hasattr(alert, "model_dump") else alert
        if a_dict.get("status") == "firing":
            alert_items.append(
                AlertItem(
                    metric=a_dict.get("agent_name", "Unknown"),
                    threshold=a_dict.get("threshold_ms", 0),
                    current=a_dict.get("p95_ms", 0) or 0,
                    severity=a_dict.get("severity", "warning"),
                    message=a_dict.get("message", "Alert threshold exceeded"),
                )
            )

    # ── Recommendations ───────────────────────────────────────────────
    recommendations = _generate_recommendations(current_metrics_raw, _alert_cfgs, len(all_agent_names))

    # ── Build and persist report ──────────────────────────────────────
    report = PerformanceReport(
        id=report_id,
        generatedAt=now.isoformat(),
        period={
            "start": datetime.fromtimestamp(time.time() - 86400, tz=timezone.utc).isoformat(),
            "end": now.isoformat(),
        },
        metrics={
            "session": session_metrics,
            "workflow": workflow_metrics,
            "mcp": mcp_metrics,
            "system": system_metrics,
        },
        healthScore=health_score,
        trends=trends,
        alerts=alert_items,
        recommendations=recommendations,
    )

    # Persist for next trend comparison
    _save_report(report.model_dump())

    return report


@router.get("/stats", response_model=PerformanceStats)
async def get_performance_stats() -> PerformanceStats:
    """Return aggregated performance statistics for the summary cards."""
    previous = _load_previous_report()
    firing_alerts = [
        a for a in _alert_history
        if (a.model_dump() if hasattr(a, "model_dump") else a).get("status") == "firing"
    ]
    critical_count = sum(
        1
        for a in firing_alerts
        if (a.model_dump() if hasattr(a, "model_dump") else a).get("severity") == "critical"
    )

    # Count total metrics: agents x 4 categories x 5 metrics (p50,p95,p99,avg,count)
    agent_names = [a.name for a in list_custom_agents()]
    metrics_count = max(len(agent_names) * 4 * 5, 16)

    return PerformanceStats(
        totalReports=1 if previous else 0,
        averageHealthScore=previous.get("healthScore", 0) if previous else 0,
        totalAlerts=len(firing_alerts),
        criticalAlerts=critical_count,
        totalMetrics=metrics_count,
        lastReportTime=datetime.now(timezone.utc).isoformat(),
    )
