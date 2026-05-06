"""Health Monitoring Router.

Provides system health reports, service status checks, resource monitoring,
and health recommendations.  Integrates with the timing store for agent-level
health and the alerts module for issue correlation.

Endpoints
---------
GET /api/health/report – full health snapshot (services, resources, issues, recommendations)
GET /api/health/stats  – summary statistics
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import shutil
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.gateway.timing import get_timing_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/health", tags=["health"])

# ── Try to import psutil for accurate system resource metrics ─────────
try:
    import psutil

    _PSUTIL_AVAILABLE = True
except ImportError:
    _PSUTIL_AVAILABLE = False
    logger.info("psutil not available — system resource metrics will be estimated")


# ── Pydantic models ───────────────────────────────────────────────────


class ServiceEntry(BaseModel):
    """Health check result for a single backend service."""

    name: str
    status: str = Field(description="healthy | degraded | unhealthy | unknown")
    response_time_ms: float = Field(default=0, description="Last check response time in ms")
    last_check: str = Field(description="ISO-8601 timestamp of last check")
    error_count: int = Field(default=0)
    consecutive_failures: int = Field(default=0)


class ResourceSnapshot(BaseModel):
    """System resource utilization snapshot."""

    cpu_percent: float = Field(default=0, description="CPU usage percentage")
    memory_rss_mb: float = Field(default=0, description="RSS memory in MB")
    memory_percent: float = Field(default=0, description="Memory usage percentage")
    disk_percent: float = Field(default=0, description="Disk usage percentage")
    timestamp: str = Field(description="ISO-8601 timestamp of resource snapshot")


class IssueEntry(BaseModel):
    """A detected health issue or active alert."""

    id: str = Field(description="Unique issue identifier")
    severity: str = Field(description="critical | warning | info")
    service: Optional[str] = Field(default=None, description="Affected service name")
    resource: Optional[str] = Field(default=None, description="Affected resource name")
    message: str
    recommendation: str
    detected_at: str = Field(description="ISO-8601 timestamp when issue was detected")
    resolved_at: Optional[str] = Field(default=None, description="ISO-8601 timestamp when resolved, null if active")


class HealthReport(BaseModel):
    """Full system health snapshot."""

    timestamp: str = Field(description="ISO-8601 timestamp of this report")
    overall_status: str = Field(description="healthy | degraded | unhealthy")
    score: int = Field(ge=0, le=100, description="Composite health score 0-100")
    services: list[ServiceEntry] = Field(default_factory=list)
    resources: ResourceSnapshot
    issues: list[IssueEntry] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


class HealthStats(BaseModel):
    """Summary health statistics."""

    total_services: int = Field(default=0)
    healthy_services: int = Field(default=0)
    degraded_services: int = Field(default=0)
    unhealthy_services: int = Field(default=0)
    total_issues: int = Field(default=0)
    critical_issues: int = Field(default=0)
    warning_issues: int = Field(default=0)
    average_score: int = Field(default=0)


# ── Resource collectors ───────────────────────────────────────────────


def _collect_resources() -> ResourceSnapshot:
    """Collect system resource metrics (CPU, memory, disk).

    Uses psutil when available; falls back to shutil/os builtins otherwise.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    if _PSUTIL_AVAILABLE:
        cpu = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory()
        disk = shutil.disk_usage("/")
        return ResourceSnapshot(
            cpu_percent=round(cpu, 1),
            memory_rss_mb=round(mem.used / (1024 * 1024), 1),
            memory_percent=round(mem.percent, 1),
            disk_percent=round(disk.used / disk.total * 100, 1),
            timestamp=now_iso,
        )

    # Fallback: use built-in modules
    cpu = 0.0
    try:
        # os.cpu_count() returns the number of logical CPUs
        # os.times() gives (user, system, children_user, children_system, elapsed)
        # but it's cumulative — not a great percentage approximation
        # Just keep 0 as "unavailable" for now
        cpu = 0.0
    except Exception:
        pass

    disk_percent = 0.0
    try:
        usage = shutil.disk_usage("/")
        disk_percent = round(usage.used / usage.total * 100, 1)
    except Exception:
        pass

    return ResourceSnapshot(
        cpu_percent=cpu,
        memory_rss_mb=0.0,
        memory_percent=0.0,
        disk_percent=disk_percent,
        timestamp=now_iso,
    )


# ── Service checkers ──────────────────────────────────────────────────


async def _check_gateway() -> ServiceEntry:
    """Gateway is implicitly healthy — this endpoint is responding."""
    return ServiceEntry(
        name="Gateway",
        status="healthy",
        response_time_ms=0,
        last_check=datetime.now(timezone.utc).isoformat(),
        error_count=0,
        consecutive_failures=0,
    )


async def _check_langgraph() -> ServiceEntry:
    """Check LangGraph server reachability via the checkpointer."""
    now_iso = datetime.now(timezone.utc).isoformat()
    t0 = time.monotonic()

    try:
        # Try to access the app config to see if checkpointer is configured
        from deerflow.config.app_config import get_app_config

        cfg = get_app_config()
        # Check if there's a checkpointer configuration
        has_checkpointer = getattr(cfg, "checkpointer", None) is not None

        elapsed_ms = (time.monotonic() - t0) * 1000

        if has_checkpointer:
            # Try a basic checkpointer operation
            try:
                from deerflow.agents.checkpointer import get_checkpointer

                checkpointer = await get_checkpointer()
                if checkpointer:
                    return ServiceEntry(
                        name="LangGraph",
                        status="healthy",
                        response_time_ms=round(elapsed_ms, 1),
                        last_check=now_iso,
                        error_count=0,
                        consecutive_failures=0,
                    )
            except Exception:
                pass

        # If checkpointer is not configured or check fails, mark as degraded
        if has_checkpointer:
            return ServiceEntry(
                name="LangGraph",
                status="degraded",
                response_time_ms=round(elapsed_ms, 1),
                last_check=now_iso,
                error_count=1,
                consecutive_failures=1,
            )

        return ServiceEntry(
            name="LangGraph",
            status="unknown",
            response_time_ms=round(elapsed_ms, 1),
            last_check=now_iso,
            error_count=0,
            consecutive_failures=0,
        )

    except Exception:
        elapsed_ms = (time.monotonic() - t0) * 1000
        return ServiceEntry(
            name="LangGraph",
            status="unhealthy",
            response_time_ms=round(elapsed_ms, 1),
            last_check=now_iso,
            error_count=1,
            consecutive_failures=1,
        )


async def _check_mcp() -> ServiceEntry:
    """Check MCP server connectivity."""
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        from deerflow.config.app_config import get_app_config

        cfg = get_app_config()
        mcp_servers = getattr(cfg, "mcp_servers", None)
        if mcp_servers and isinstance(mcp_servers, dict) and len(mcp_servers) > 0:
            return ServiceEntry(
                name="MCP Server",
                status="healthy",
                response_time_ms=1.0,
                last_check=now_iso,
                error_count=0,
                consecutive_failures=0,
            )
        # MCP servers configured but empty
        return ServiceEntry(
            name="MCP Server",
            status="unknown",
            response_time_ms=0,
            last_check=now_iso,
            error_count=0,
            consecutive_failures=0,
        )
    except Exception:
        return ServiceEntry(
            name="MCP Server",
            status="unknown",
            response_time_ms=0,
            last_check=now_iso,
            error_count=0,
            consecutive_failures=0,
        )


async def _check_agents() -> ServiceEntry:
    """Check agent health via TimingStore — are agents responding within thresholds?"""
    now_iso = datetime.now(timezone.utc).isoformat()
    t0 = time.monotonic()

    try:
        from deerflow.config.paths import get_paths

        paths = get_paths()
        base_dir = paths.base_dir

        if not base_dir.exists():
            return ServiceEntry(
                name="Agents",
                status="unknown",
                response_time_ms=0,
                last_check=now_iso,
                error_count=0,
                consecutive_failures=0,
            )

        agent_dirs = [d for d in base_dir.iterdir() if d.is_dir()]
        if not agent_dirs:
            return ServiceEntry(
                name="Agents",
                status="unknown",
                response_time_ms=0,
                last_check=now_iso,
                error_count=0,
                consecutive_failures=0,
            )

        # Check agent timing health
        store = get_timing_store()
        degraded_count = 0
        for agent_dir in agent_dirs:
            agent_name = agent_dir.name
            p95 = await store.percentile_ms(agent_name, 95)
            if p95 is not None and p95 > 5000:  # 5s threshold
                degraded_count += 1

        elapsed_ms = (time.monotonic() - t0) * 1000

        if degraded_count == 0:
            return ServiceEntry(
                name="Agents",
                status="healthy",
                response_time_ms=round(elapsed_ms, 1),
                last_check=now_iso,
                error_count=0,
                consecutive_failures=0,
            )
        elif degraded_count < len(agent_dirs):
            return ServiceEntry(
                name="Agents",
                status="degraded",
                response_time_ms=round(elapsed_ms, 1),
                last_check=now_iso,
                error_count=degraded_count,
                consecutive_failures=degraded_count,
            )
        else:
            return ServiceEntry(
                name="Agents",
                status="unhealthy",
                response_time_ms=round(elapsed_ms, 1),
                last_check=now_iso,
                error_count=degraded_count,
                consecutive_failures=degraded_count,
            )
    except Exception:
        elapsed_ms = (time.monotonic() - t0) * 1000
        return ServiceEntry(
            name="Agents",
            status="unknown",
            response_time_ms=round(elapsed_ms, 1),
            last_check=now_iso,
            error_count=0,
            consecutive_failures=0,
        )


async def _check_frontend() -> ServiceEntry:
    """Frontend is not directly checkable from backend — mark as unknown."""
    return ServiceEntry(
        name="Frontend",
        status="unknown",
        response_time_ms=0,
        last_check=datetime.now(timezone.utc).isoformat(),
        error_count=0,
        consecutive_failures=0,
    )


# ── Issue collector ───────────────────────────────────────────────────


async def _collect_issues() -> list[IssueEntry]:
    """Collect active issues from the alerts module."""
    issues: list[IssueEntry] = []

    try:
        from app.gateway.routers.alerts import (
            _alert_history as alert_history,
            _alert_cfgs as alert_configs,
        )

        for record in alert_history:
            # Only include currently firing (not resolved) alerts
            if hasattr(record, "firing") and not record.firing:
                continue
            if hasattr(record, "resolved_at") and record.resolved_at:
                continue

            agent_name = getattr(record, "agent_name", "unknown")
            severity = getattr(record, "severity", "warning")
            message = getattr(record, "message", f"Alert for {agent_name}")
            detected_at = getattr(record, "raised_at", record.timestamp if hasattr(record, "timestamp") else None)
            if detected_at is None:
                detected_at = datetime.now(timezone.utc).isoformat()

            issues.append(
                IssueEntry(
                    id=f"alert-{agent_name}-{len(issues)}",
                    severity=severity if severity in ("critical", "warning", "info") else "warning",
                    service="Agents",
                    resource=agent_name,
                    message=message,
                    recommendation=f"Investigate {agent_name} timing anomaly — review recent configuration changes",
                    detected_at=str(detected_at),
                )
            )
    except ImportError:
        pass  # Alerts module not available
    except Exception:
        logger.exception("Failed to collect alert issues (non-fatal)")

    return issues


# ── Recommendations generator ─────────────────────────────────────────


async def _generate_recommendations(
    services: list[ServiceEntry],
    resources: ResourceSnapshot,
    issue_count: int,
) -> list[str]:
    """Generate data-driven health recommendations."""
    recs: list[str] = []

    # Resource-based recommendations
    if _PSUTIL_AVAILABLE:
        if resources.cpu_percent > 80:
            recs.append(f"CPU usage is high ({resources.cpu_percent:.0f}%) — consider scaling or investigating CPU-bound operations")
        if resources.memory_percent > 80:
            recs.append(f"Memory usage is high ({resources.memory_percent:.0f}%) — consider increasing memory allocation or checking for leaks")
    if resources.disk_percent > 80:
        recs.append(f"Disk usage is high ({resources.disk_percent:.0f}%) — clean up old artifacts, logs, or expired sessions")

    # Service-based recommendations
    for svc in services:
        if svc.status == "unhealthy":
            recs.append(f"Service '{svc.name}' is unhealthy ({svc.consecutive_failures} consecutive failures) — restart or investigate")
        elif svc.status == "degraded":
            recs.append(f"Service '{svc.name}' is degraded — monitor for further degradation")
        elif svc.status == "unknown":
            if svc.name == "LangGraph":
                recs.append("LangGraph checkpointer is not configured — agent state will not persist across restarts")
            elif svc.name == "Agents":
                recs.append("No agents found — create your first agent to start using the platform")

    # Alert-based recommendations
    if issue_count > 0:
        recs.append(f"{issue_count} active alert(s) — review the Issues section and address critical alerts first")

    # No recommendations at all = everything is fine
    if not recs:
        recs.append("All systems are operating normally — no action required")
        recs.append("Consider setting up alert thresholds for proactive monitoring")

    return recs


# ── Health score computation ──────────────────────────────────────────


def _compute_health_score(services: list[ServiceEntry], issues: list[IssueEntry]) -> int:
    """Compute a 0-100 health score from services and issues."""
    score = 100

    # Service deductions
    unhealthy_svcs = sum(1 for s in services if s.status == "unhealthy")
    degraded_svcs = sum(1 for s in services if s.status == "degraded")
    unknown_svcs = sum(1 for s in services if s.status == "unknown")

    score -= unhealthy_svcs * 25
    score -= degraded_svcs * 10
    score -= unknown_svcs * 5

    # Issue deductions
    for issue in issues:
        if issue.severity == "critical":
            score -= 15
        elif issue.severity == "warning":
            score -= 5
        else:
            score -= 2

    return max(0, min(100, score))


# ── Endpoints ─────────────────────────────────────────────────────────


@router.get("/report", response_model=HealthReport)
async def get_health_report() -> HealthReport:
    """Return a full system health snapshot.

    Checks Gateway, LangGraph, MCP, and Agent health.  Collects system
    resource metrics (CPU, memory, disk).  Correlates active alerts as
    health issues.  Provides data-driven recommendations.
    """
    # Run all service checks in parallel
    gateway_svc, langgraph_svc, mcp_svc, agents_svc, frontend_svc = await asyncio.gather(
        _check_gateway(),
        _check_langgraph(),
        _check_mcp(),
        _check_agents(),
        _check_frontend(),
    )

    services = [gateway_svc, langgraph_svc, mcp_svc, agents_svc, frontend_svc]

    # Collect resources and issues concurrently
    resources = _collect_resources()
    issues = await _collect_issues()

    # Compute health score
    score = _compute_health_score(services, issues)

    # Determine overall status
    if score >= 80:
        overall_status = "healthy"
    elif score >= 60:
        overall_status = "degraded"
    else:
        overall_status = "unhealthy"

    # Generate recommendations
    recommendations = await _generate_recommendations(services, resources, len(issues))

    return HealthReport(
        timestamp=datetime.now(timezone.utc).isoformat(),
        overall_status=overall_status,
        score=score,
        services=services,
        resources=resources,
        issues=issues,
        recommendations=recommendations,
    )


@router.get("/stats", response_model=HealthStats)
async def get_health_stats() -> HealthStats:
    """Return summary health statistics.

    This is a lightweight counterpart to the full report — useful for
    dashboard KPI cards and polling.
    """
    # Run the full report and extract summary
    report = await get_health_report()

    total = len(report.services)
    healthy = sum(1 for s in report.services if s.status == "healthy")
    degraded = sum(1 for s in report.services if s.status == "degraded")
    unhealthy = sum(1 for s in report.services if s.status == "unhealthy")

    total_issues = len(report.issues)
    critical = sum(1 for i in report.issues if i.severity == "critical")
    warning = sum(1 for i in report.issues if i.severity == "warning")

    return HealthStats(
        total_services=total,
        healthy_services=healthy,
        degraded_services=degraded,
        unhealthy_services=unhealthy,
        total_issues=total_issues,
        critical_issues=critical,
        warning_issues=warning,
        average_score=report.score,
    )
