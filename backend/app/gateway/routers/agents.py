"""CRUD API for custom agents."""

import io
import json
import logging
import re
import shutil
import zipfile
from datetime import datetime, timezone

import yaml
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from deerflow.config.agents_config import AgentConfig, list_custom_agents, load_agent_config, load_agent_soul
from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["agents"])

AGENT_NAME_PATTERN = re.compile(r"^[A-Za-z0-9-]+$")


class AgentResponse(BaseModel):
    """Response model for a custom agent."""

    name: str = Field(..., description="Agent name (hyphen-case)")
    description: str = Field(default="", description="Agent description")
    model: str | None = Field(default=None, description="Optional model override")
    tool_groups: list[str] | None = Field(default=None, description="Optional tool group whitelist")
    soul: str | None = Field(default=None, description="SOUL.md content (included on GET /{name})")
    total_chats: int | None = Field(default=None, description="Total number of threads (only in list)")
    last_active: str | None = Field(default=None, description="ISO timestamp of last activity (only in list)")


class AgentsListResponse(BaseModel):
    """Response model for listing all custom agents."""

    agents: list[AgentResponse]


class AgentCreateRequest(BaseModel):
    """Request body for creating a custom agent."""

    name: str = Field(..., description="Agent name (must match ^[A-Za-z0-9-]+$, stored as lowercase)")
    description: str = Field(default="", description="Agent description")
    model: str | None = Field(default=None, description="Optional model override")
    tool_groups: list[str] | None = Field(default=None, description="Optional tool group whitelist")
    soul: str = Field(default="", description="SOUL.md content — agent personality and behavioral guardrails")


class AgentUpdateRequest(BaseModel):
    """Request body for updating a custom agent."""

    description: str | None = Field(default=None, description="Updated description")
    model: str | None = Field(default=None, description="Updated model override")
    tool_groups: list[str] | None = Field(default=None, description="Updated tool group whitelist")
    soul: str | None = Field(default=None, description="Updated SOUL.md content")


# --- Version History Models ---

class AgentVersionSummary(BaseModel):
    """Summary of a single version snapshot."""

    version_id: str = Field(..., description="ISO timestamp version ID (e.g., 20260503T024944)")
    timestamp: str = Field(..., description="ISO 8601 timestamp of when the version was saved")
    changed_fields: list[str] = Field(default_factory=list, description="Which fields changed in this version")
    description: str = Field(default="", description="Human-readable description of changes")


class AgentRestoreResponse(BaseModel):
    """Response for restoring an agent to a previous version."""

    success: bool = Field(..., description="Whether the restore was successful")
    restored_version_id: str = Field(..., description="The version ID that was restored")
    new_version_id: str = Field(..., description="The new version ID created as pre-restore snapshot")


class AgentVersionsResponse(BaseModel):
    """Response for listing all versions of an agent."""

    agent_name: str
    versions: list[AgentVersionSummary]
    count: int


class AgentVersionDetail(BaseModel):
    """Full details of a single version snapshot."""

    version_id: str
    timestamp: str
    config: dict = Field(default_factory=dict, description="Full config.yaml at this version")
    soul: str | None = Field(default=None, description="SOUL.md content at this version")
    changed_fields: list[str] = Field(default_factory=list)


class AgentVersionDiffResponse(BaseModel):
    """Side-by-side comparison of two agent versions."""

    from_version: AgentVersionDetail
    to_version: AgentVersionDetail
    config_diff: dict = Field(
        default_factory=dict,
        description="Key-level changes in config: {field: {from, to}}",
    )
    soul_changed: bool = Field(default=False)
    fields_changed: list[str] = Field(default_factory=list)


def _save_agent_version(agent_dir, agent_cfg, soul_content: str | None, changed_fields: list[str]) -> str | None:
    """Save a snapshot of the current agent config and soul before an update.

    Args:
        agent_dir: Path to the agent directory.
        agent_cfg: Current AgentConfig before the update.
        soul_content: Current SOUL.md content (None if not yet created).
        changed_fields: List of field names that are about to change.

    Returns:
        The version_id string, or None if nothing to save.
    """
    from pathlib import Path

    timestamp = datetime.now(timezone.utc)
    version_id = timestamp.strftime("%Y%m%dT%H%M%S")
    version_dir = Path(agent_dir) / "versions" / version_id
    version_dir.mkdir(parents=True, exist_ok=True)

    # Save config snapshot
    config_snapshot: dict = {
        "name": agent_cfg.name,
        "description": agent_cfg.description,
    }
    if agent_cfg.model is not None:
        config_snapshot["model"] = agent_cfg.model
    if agent_cfg.tool_groups is not None:
        config_snapshot["tool_groups"] = agent_cfg.tool_groups

    with open(version_dir / "config.yaml", "w", encoding="utf-8") as f:
        yaml.dump(config_snapshot, f, default_flow_style=False, allow_unicode=True)

    # Save soul snapshot
    if soul_content is not None:
        (version_dir / "SOUL.md").write_text(soul_content, encoding="utf-8")

    # Save metadata
    metadata = {
        "version_id": version_id,
        "timestamp": timestamp.isoformat(),
        "changed_fields": changed_fields,
    }
    with open(version_dir / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Saved version snapshot {version_id} for agent '{agent_cfg.name}' (fields: {changed_fields})")
    return version_id


def _validate_agent_name(name: str) -> None:
    """Validate agent name against allowed pattern.

    Args:
        name: The agent name to validate.

    Raises:
        HTTPException: 422 if the name is invalid.
    """
    if not AGENT_NAME_PATTERN.match(name):
        raise HTTPException(
            status_code=422,
            detail=f"Invalid agent name '{name}'. Must match ^[A-Za-z0-9-]+$ (letters, digits, and hyphens only).",
        )


def _normalize_agent_name(name: str) -> str:
    """Normalize agent name to lowercase for filesystem storage."""
    return name.lower()


def _agent_config_to_response(
    agent_cfg: AgentConfig,
    include_soul: bool = False,
    total_chats: int | None = None,
    last_active: str | None = None,
) -> AgentResponse:
    """Convert AgentConfig to AgentResponse."""
    soul: str | None = None
    if include_soul:
        soul = load_agent_soul(agent_cfg.name) or ""

    return AgentResponse(
        name=agent_cfg.name,
        description=agent_cfg.description,
        model=agent_cfg.model,
        tool_groups=agent_cfg.tool_groups,
        soul=soul,
        total_chats=total_chats,
        last_active=last_active,
    )


async def _get_agents_light_stats(
    agent_names: list[str],
) -> dict[str, dict[str, int | str | None]]:
    """Get lightweight stats (total_chats, last_active) for multiple agents efficiently.

    Lists all threads from the checkpointer once, then groups by agent_name.
    Returns a dict mapping agent_name -> {total_chats, last_active}.
    If the checkpointer is unavailable, returns empty dict for each agent.
    """
    try:
        from deerflow.agents.checkpointer.provider import get_checkpointer

        checkpointer = get_checkpointer()
    except Exception as exc:
        logger.warning("Checkpointer unavailable for agent light stats: %s", exc)
        return {name: {"total_chats": 0, "last_active": None} for name in agent_names}

    # Initialize stats for all agents
    stats: dict[str, dict[str, int | str | None]] = {
        name: {"total_chats": 0, "last_active": None} for name in agent_names
    }

    try:
        threads: list[dict] = []

        if hasattr(checkpointer, "alist"):
            config = {"configurable": {}}
            async for thread in checkpointer.alist(config):
                threads.append(_thread_to_dict(thread))
        elif hasattr(checkpointer, "list"):
            import asyncio

            loop = asyncio.get_running_loop()
            result = await loop.run_in_executor(
                None, lambda: list(checkpointer.list({"configurable": {}}))
            )
            threads = [_thread_to_dict(t) for t in result]
        else:
            return stats

        # Group by agent_name and compute stats
        agent_name_set = set(agent_names)
        for t in threads:
            values = t.get("values") or {}
            metadata = t.get("metadata") or {}
            ctx_agent = metadata.get("agent_name") if metadata else None
            vals_agent = values.get("agent_name") if values else None

            matched_agent = None
            if ctx_agent in agent_name_set:
                matched_agent = ctx_agent
            elif vals_agent in agent_name_set:
                matched_agent = vals_agent

            if matched_agent:
                agent_stats = stats[matched_agent]
                agent_stats["total_chats"] = (agent_stats["total_chats"] or 0) + 1

                updated_at: str | None = t.get("updated_at")
                if updated_at:
                    current_last: str | None = agent_stats.get("last_active")
                    if current_last is None or updated_at > current_last:
                        agent_stats["last_active"] = updated_at

    except Exception as exc:
        logger.warning("Failed to compute agent light stats: %s", exc)

    return stats


@router.get(
    "/agents",
    response_model=AgentsListResponse,
    summary="List Custom Agents",
    description="List all custom agents available in the agents directory.",
)
async def list_agents() -> AgentsListResponse:
    """List all custom agents.

    Returns:
        List of all custom agents with their metadata (without soul content),
        enriched with total_chats and last_active from the checkpointer.
    """
    try:
        agents = list_custom_agents()
        agent_names = [a.name for a in agents]

        # Enrich with lightweight stats from checkpointer
        light_stats = await _get_agents_light_stats(agent_names)

        return AgentsListResponse(
            agents=[
                _agent_config_to_response(
                    a,
                    total_chats=light_stats.get(a.name, {}).get("total_chats", 0),
                    last_active=light_stats.get(a.name, {}).get("last_active"),
                )
                for a in agents
            ]
        )
    except Exception as e:
        logger.error(f"Failed to list agents: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to list agents: {str(e)}")


@router.get(
    "/agents/check",
    summary="Check Agent Name",
    description="Validate an agent name and check if it is available (case-insensitive).",
)
async def check_agent_name(name: str) -> dict:
    """Check whether an agent name is valid and not yet taken.

    Args:
        name: The agent name to check.

    Returns:
        ``{"available": true/false, "name": "<normalized>"}``

    Raises:
        HTTPException: 422 if the name is invalid.
    """
    _validate_agent_name(name)
    normalized = _normalize_agent_name(name)
    available = not get_paths().agent_dir(normalized).exists()
    return {"available": available, "name": normalized}


@router.get(
    "/agents/{name}",
    response_model=AgentResponse,
    summary="Get Custom Agent",
    description="Retrieve details and SOUL.md content for a specific custom agent.",
)
async def get_agent(name: str) -> AgentResponse:
    """Get a specific custom agent by name.

    Args:
        name: The agent name.

    Returns:
        Agent details including SOUL.md content.

    Raises:
        HTTPException: 404 if agent not found.
    """
    _validate_agent_name(name)
    name = _normalize_agent_name(name)

    try:
        agent_cfg = load_agent_config(name)
        return _agent_config_to_response(agent_cfg, include_soul=True)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")
    except Exception as e:
        logger.error(f"Failed to get agent '{name}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get agent: {str(e)}")


@router.post(
    "/agents",
    response_model=AgentResponse,
    status_code=201,
    summary="Create Custom Agent",
    description="Create a new custom agent with its config and SOUL.md.",
)
async def create_agent_endpoint(request: AgentCreateRequest) -> AgentResponse:
    """Create a new custom agent.

    Args:
        request: The agent creation request.

    Returns:
        The created agent details.

    Raises:
        HTTPException: 409 if agent already exists, 422 if name is invalid.
    """
    _validate_agent_name(request.name)
    normalized_name = _normalize_agent_name(request.name)

    agent_dir = get_paths().agent_dir(normalized_name)

    if agent_dir.exists():
        raise HTTPException(status_code=409, detail=f"Agent '{normalized_name}' already exists")

    try:
        agent_dir.mkdir(parents=True, exist_ok=True)

        # Write config.yaml
        config_data: dict = {"name": normalized_name}
        if request.description:
            config_data["description"] = request.description
        if request.model is not None:
            config_data["model"] = request.model
        if request.tool_groups is not None:
            config_data["tool_groups"] = request.tool_groups

        config_file = agent_dir / "config.yaml"
        with open(config_file, "w", encoding="utf-8") as f:
            yaml.dump(config_data, f, default_flow_style=False, allow_unicode=True)

        # Write SOUL.md
        soul_file = agent_dir / "SOUL.md"
        soul_file.write_text(request.soul, encoding="utf-8")

        logger.info(f"Created agent '{normalized_name}' at {agent_dir}")

        agent_cfg = load_agent_config(normalized_name)
        return _agent_config_to_response(agent_cfg, include_soul=True)

    except HTTPException:
        raise
    except Exception as e:
        # Clean up on failure
        if agent_dir.exists():
            shutil.rmtree(agent_dir)
        logger.error(f"Failed to create agent '{request.name}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")


@router.put(
    "/agents/{name}",
    response_model=AgentResponse,
    summary="Update Custom Agent",
    description="Update an existing custom agent's config and/or SOUL.md.",
)
async def update_agent(name: str, request: AgentUpdateRequest) -> AgentResponse:
    """Update an existing custom agent.

    Args:
        name: The agent name.
        request: The update request (all fields optional).

    Returns:
        The updated agent details.

    Raises:
        HTTPException: 404 if agent not found.
    """
    _validate_agent_name(name)
    name = _normalize_agent_name(name)

    try:
        agent_cfg = load_agent_config(name)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

    agent_dir = get_paths().agent_dir(name)

    try:
        # Determine changed fields and save version snapshot before overwriting
        changed_fields: list[str] = []
        if request.description is not None and request.description != agent_cfg.description:
            changed_fields.append("description")
        if request.model is not None and request.model != (agent_cfg.model or ""):
            changed_fields.append("model")
        if request.tool_groups is not None and request.tool_groups != (agent_cfg.tool_groups or []):
            changed_fields.append("tool_groups")
        if request.soul is not None:
            # Load current soul to compare
            try:
                current_soul = load_agent_soul(name)
            except FileNotFoundError:
                current_soul = None
            if request.soul != (current_soul or ""):
                changed_fields.append("soul")

        # Save snapshot if anything changed
        if changed_fields:
            try:
                current_soul = load_agent_soul(name)
            except FileNotFoundError:
                current_soul = None
            _save_agent_version(agent_dir, agent_cfg, current_soul, changed_fields)

        # Update config if any config fields changed
        config_changed = any(v is not None for v in [request.description, request.model, request.tool_groups])

        if config_changed:
            updated: dict = {
                "name": agent_cfg.name,
                "description": request.description if request.description is not None else agent_cfg.description,
            }
            new_model = request.model if request.model is not None else agent_cfg.model
            if new_model is not None:
                updated["model"] = new_model

            new_tool_groups = request.tool_groups if request.tool_groups is not None else agent_cfg.tool_groups
            if new_tool_groups is not None:
                updated["tool_groups"] = new_tool_groups

            config_file = agent_dir / "config.yaml"
            with open(config_file, "w", encoding="utf-8") as f:
                yaml.dump(updated, f, default_flow_style=False, allow_unicode=True)

        # Update SOUL.md if provided
        if request.soul is not None:
            soul_path = agent_dir / "SOUL.md"
            soul_path.write_text(request.soul, encoding="utf-8")

        logger.info(f"Updated agent '{name}'")

        refreshed_cfg = load_agent_config(name)
        return _agent_config_to_response(refreshed_cfg, include_soul=True)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update agent '{name}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update agent: {str(e)}")


class UserProfileResponse(BaseModel):
    """Response model for the global user profile (USER.md)."""

    content: str | None = Field(default=None, description="USER.md content, or null if not yet created")


class UserProfileUpdateRequest(BaseModel):
    """Request body for setting the global user profile."""

    content: str = Field(default="", description="USER.md content — describes the user's background and preferences")


@router.get(
    "/user-profile",
    response_model=UserProfileResponse,
    summary="Get User Profile",
    description="Read the global USER.md file that is injected into all custom agents.",
)
async def get_user_profile() -> UserProfileResponse:
    """Return the current USER.md content.

    Returns:
        UserProfileResponse with content=None if USER.md does not exist yet.
    """
    try:
        user_md_path = get_paths().user_md_file
        if not user_md_path.exists():
            return UserProfileResponse(content=None)
        raw = user_md_path.read_text(encoding="utf-8").strip()
        return UserProfileResponse(content=raw or None)
    except Exception as e:
        logger.error(f"Failed to read user profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to read user profile: {str(e)}")


@router.put(
    "/user-profile",
    response_model=UserProfileResponse,
    summary="Update User Profile",
    description="Write the global USER.md file that is injected into all custom agents.",
)
async def update_user_profile(request: UserProfileUpdateRequest) -> UserProfileResponse:
    """Create or overwrite the global USER.md.

    Args:
        request: The update request with the new USER.md content.

    Returns:
        UserProfileResponse with the saved content.
    """
    try:
        paths = get_paths()
        paths.base_dir.mkdir(parents=True, exist_ok=True)
        paths.user_md_file.write_text(request.content, encoding="utf-8")
        logger.info(f"Updated USER.md at {paths.user_md_file}")
        return UserProfileResponse(content=request.content or None)
    except Exception as e:
        logger.error(f"Failed to update user profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update user profile: {str(e)}")


# ── Agent Analytics ────────────────────────────────────────────────────────

class AgentStatsResponse(BaseModel):
    """Response model for agent usage analytics."""

    total_chats: int = Field(default=0, description="Total number of conversations")
    total_messages: int = Field(default=0, description="Total number of messages exchanged")
    avg_response_time: float = Field(default=0.0, description="Average Gateway HTTP response time in seconds")
    p50_response_time: float | None = Field(default=None, description="Median (50th percentile) response time in seconds")
    p95_response_time: float | None = Field(default=None, description="95th percentile response time in seconds")
    p99_response_time: float | None = Field(default=None, description="99th percentile response time in seconds")
    tool_calls: int = Field(default=0, description="Total number of tool invocations")
    last_active: str | None = Field(default=None, description="ISO timestamp of last activity")
    weekly_activity: list[dict] = Field(default_factory=list, description="Daily message counts for the past week")
    top_tools: list[dict] = Field(default_factory=list, description="Most frequently used tools")

    # ── LangGraph processing time (separate from Gateway HTTP) ──────────
    langgraph_avg_response_time: float | None = Field(
        default=None,
        description="Average LangGraph agent processing time in seconds (None when no data)",
    )
    langgraph_p95_response_time: float | None = Field(
        default=None,
        description="95th percentile LangGraph processing time in seconds (None when no data)",
    )
    gateway_overhead_ms: int | None = Field(
        default=None,
        description="Average Gateway overhead in ms (HTTP total − LangGraph processing), None when no LangGraph data",
    )


class AgentCompareRequest(BaseModel):
    """Request body for comparing multiple agents."""

    names: list[str] = Field(..., description="List of agent names to compare")


class AgentCompareItem(BaseModel):
    """Single agent comparison item."""

    name: str = Field(..., description="Agent name")
    stats: AgentStatsResponse = Field(default_factory=AgentStatsResponse, description="Agent statistics")


class AgentCompareResponse(BaseModel):
    """Response model for agent comparison."""

    agents: list[AgentCompareItem] = Field(default_factory=list, description="Agent comparison data")


class AgentExportResponse(BaseModel):
    """Response model for exporting an agent's full configuration."""

    name: str = Field(..., description="Agent name")
    description: str = Field(default="", description="Agent description")
    model: str | None = Field(default=None, description="Optional model override")
    tool_groups: list[str] | None = Field(default=None, description="Optional tool group whitelist")
    soul: str | None = Field(default=None, description="SOUL.md content")
    version: str = Field(default="1.0", description="Export format version")


class AgentImportRequest(BaseModel):
    """Request body for importing an agent."""

    name: str = Field(..., description="Agent name")
    description: str = Field(default="", description="Agent description")
    model: str | None = Field(default=None, description="Optional model override")
    tool_groups: list[str] | None = Field(default=None, description="Optional tool group whitelist")
    soul: str = Field(default="", description="SOUL.md content")
    overwrite: bool = Field(default=False, description="Overwrite if agent already exists")


class AgentImportResponse(BaseModel):
    """Response model for agent import."""

    name: str
    created: bool = Field(..., description="True if newly created, False if overwritten")


class TimingHistoryResponse(BaseModel):
    """Response model for the agent timing history endpoint."""

    agent_name: str = ""
    samples: list[dict] = []
    count: int = 0
    avg_ms: int | None = None
    min_ms: int | None = None
    max_ms: int | None = None


@router.get(
    "/agents/{name}/stats",
    response_model=AgentStatsResponse,
    summary="Get Agent Statistics",
    description="Retrieve usage statistics for a specific agent by analyzing its threads.",
)
async def get_agent_stats(name: str) -> AgentStatsResponse:
    """Get usage statistics for a specific agent.

    Computes real metrics by scanning all threads that belong to this agent
    through the LangGraph checkpointer. Falls back to empty stats if the
    checkpointer is not available.

    Args:
        name: The agent name.

    Returns:
        AgentStatsResponse with computed analytics.

    Raises:
        HTTPException: 404 if agent not found.
    """
    _validate_agent_name(name)
    name = _normalize_agent_name(name)

    agent_dir = get_paths().agent_dir(name)
    if not agent_dir.exists():
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

    try:
        from deerflow.agents.checkpointer.provider import get_checkpointer

        checkpointer = get_checkpointer()
    except Exception as exc:
        logger.warning("Checkpointer unavailable for agent stats: %s", exc)
        return AgentStatsResponse()

    try:
        threads = await _list_agent_threads(checkpointer, name)
    except Exception as exc:
        logger.warning("Failed to list threads for agent stats: %s", exc)
        threads = []

    if not threads:
        return AgentStatsResponse()

    total_messages = 0
    tool_calls = 0
    last_active: str | None = None
    tool_counter: dict[str, int] = {}
    daily_messages: dict[str, int] = {}

    for thread in threads:
        values = thread.get("values") or {}
        messages = values.get("messages") or []
        total_messages += len(messages)

        updated_at = thread.get("updated_at")
        if updated_at:
            if last_active is None or updated_at > last_active:
                last_active = updated_at

            # Daily bucket for weekly activity
            day_key = updated_at[:10] if isinstance(updated_at, str) else None
            if day_key:
                daily_messages[day_key] = daily_messages.get(day_key, 0) + len(messages)

        # Count tool calls from messages
        for msg in messages:
            if isinstance(msg, dict):
                # Tool result message
                if msg.get("type") == "tool" or msg.get("name"):
                    tool_name = msg.get("name") or "unknown"
                    tool_counter[tool_name] = tool_counter.get(tool_name, 0) + 1
                    tool_calls += 1
                # AI message with tool_calls
                tc_list = msg.get("tool_calls") or []
                for tc in tc_list:
                    t_name = tc.get("name") if isinstance(tc, dict) else getattr(tc, "name", None)
                    if t_name:
                        tool_counter[t_name] = tool_counter.get(t_name, 0) + 1
                        tool_calls += 1

    # Build weekly activity (last 7 days)
    from datetime import datetime, timedelta

    today = datetime.utcnow().date()
    weekly_activity = []
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        day_str = d.isoformat()
        weekly_activity.append({
            "day": day_names[d.weekday()],
            "messages": daily_messages.get(day_str, 0),
            "tool_calls": 0,  # Simplified — could be derived per-day if needed
        })

    # Top tools sorted by usage
    top_tools = [
        {"name": t_name, "count": t_count}
        for t_name, t_count in sorted(tool_counter.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    # Average response time: use real Gateway timing data when available,
    # fall back to a heuristic based on thread count otherwise.
    from app.gateway.timing import get_timing_store

    timing_store = get_timing_store()
    measured_avg_ms = await timing_store.avg_response_time_ms(name)
    if measured_avg_ms is not None:
        avg_response_time = measured_avg_ms / 1000.0
    else:
        avg_response_time = 2.5 if total_messages > 0 else 0.0

    # Percentiles from timing history (None when no data)
    p50_ms = await timing_store.percentile_ms(name, 50)
    p95_ms = await timing_store.percentile_ms(name, 95)
    p99_ms = await timing_store.percentile_ms(name, 99)

    # ── LangGraph processing time (separate from Gateway HTTP) ──────────
    lg_avg_ms = await timing_store.langgraph_avg_response_time_ms(name)
    lg_p95_ms = await timing_store.langgraph_percentile_ms(name, 95)
    overhead_ms = await timing_store.overhead_avg_ms(name)

    return AgentStatsResponse(
        total_chats=len(threads),
        total_messages=total_messages,
        avg_response_time=round(avg_response_time, 1),
        p50_response_time=round(p50_ms / 1000.0, 3) if p50_ms is not None else None,
        p95_response_time=round(p95_ms / 1000.0, 3) if p95_ms is not None else None,
        p99_response_time=round(p99_ms / 1000.0, 3) if p99_ms is not None else None,
        tool_calls=tool_calls,
        last_active=last_active,
        weekly_activity=weekly_activity,
        top_tools=top_tools,
        langgraph_avg_response_time=round(lg_avg_ms / 1000.0, 3) if lg_avg_ms is not None else None,
        langgraph_p95_response_time=round(lg_p95_ms / 1000.0, 3) if lg_p95_ms is not None else None,
        gateway_overhead_ms=overhead_ms,
    )


@router.post(
    "/agents/compare",
    response_model=AgentCompareResponse,
    summary="Compare Agents",
    description="Retrieve usage statistics for multiple agents in a single request for side-by-side comparison.",
)
async def compare_agents(request: AgentCompareRequest) -> AgentCompareResponse:
    """Compare multiple agents by fetching their stats in parallel.

    Args:
        request: The comparison request with agent names.

    Returns:
        AgentCompareResponse with stats for each requested agent.
    """
    from deerflow.config.agents_config import load_agent_config

    items: list[AgentCompareItem] = []

    for name in request.names:
        try:
            _validate_agent_name(name)
            normalized = _normalize_agent_name(name)
            # Verify agent exists
            load_agent_config(normalized)
            # Reuse stats logic
            stats = await get_agent_stats(normalized)
            items.append(AgentCompareItem(name=normalized, stats=stats))
        except HTTPException:
            # Skip agents that don't exist
            logger.warning("Agent '%s' not found during comparison", name)
            continue
        except Exception as exc:
            logger.warning("Failed to get stats for agent '%s': %s", name, exc)
            items.append(AgentCompareItem(name=name, stats=AgentStatsResponse()))

    return AgentCompareResponse(agents=items)


# ── Dashboard Analytics ──────────────────────────────────────────────────

TOOL_COLORS = [
    "#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899",
    "#06b6d4", "#eab308", "#ef4444", "#6366f1", "#14b8a6",
]


class DashboardAnalyticsResponse(BaseModel):
    """Aggregated analytics for the dashboard charts page."""

    session_activity: list[dict] = Field(
        default_factory=list,
        description="Daily session counts across all agents: [{date, value}]",
    )
    message_volume: list[dict] = Field(
        default_factory=list,
        description="Daily message counts across all agents: [{date, value}]",
    )
    tool_usage: list[dict] = Field(
        default_factory=list,
        description="Aggregated tool usage: [{name, value, color}]",
    )
    agent_latency: list[dict] = Field(
        default_factory=list,
        description="Per-agent latency percentiles: [{agent, p50_ms, p95_ms, p99_ms}]",
    )
    summary: dict = Field(
        default_factory=dict,
        description="Totals: {total_agents, total_chats, total_messages, total_tool_calls, avg_latency_ms}",
    )


# ── Dashboard KPI Stats ────────────────────────────────────────────────────


class HealthKPI(BaseModel):
    score: int = Field(default=0, description="Composite health score 0-100")
    status: str = Field(default="unknown", description="healthy | degraded | unhealthy")
    healthyServices: int = Field(default=0)
    totalServices: int = Field(default=0)
    criticalIssues: int = Field(default=0)


class ResourceKPI(BaseModel):
    cpuPercent: float = Field(default=0.0)
    memoryPercent: float = Field(default=0.0)
    diskPercent: float = Field(default=0.0)


class ServiceItem(BaseModel):
    name: str
    status: str = Field(default="unknown")
    responseTimeMs: float = Field(default=0)


class AgentKPI(BaseModel):
    totalAgents: int = Field(default=0)
    totalChats: int = Field(default=0)
    totalMessages: int = Field(default=0)
    totalToolCalls: int = Field(default=0)
    avgLatencyMs: float = Field(default=0)


class MemoryKPI(BaseModel):
    totalMemories: int = Field(default=0)
    totalTopics: int = Field(default=0)


class ToolKPI(BaseModel):
    totalTools: int = Field(default=0)
    availableTools: int = Field(default=0)


class DashboardStatsResponse(BaseModel):
    health: HealthKPI = Field(default_factory=HealthKPI)
    resources: ResourceKPI = Field(default_factory=ResourceKPI)
    agents: AgentKPI = Field(default_factory=AgentKPI)
    services: list[ServiceItem] = Field(default_factory=list)
    memory: MemoryKPI = Field(default_factory=MemoryKPI)
    tools: ToolKPI = Field(default_factory=ToolKPI)


@router.get(
    "/dashboard/stats",
    response_model=DashboardStatsResponse,
    summary="Get Dashboard KPIs",
    description="Aggregated KPI stats for the dashboard overview page: health, resources, agents, services, memory, tools.",
)
async def get_dashboard_stats() -> DashboardStatsResponse:
    """Aggregate KPI stats from health subsystem, agent store, and memory.

    Returns a single response with all dashboard cards' data — avoids
    multiple round-trips for the overview page.
    """
    import asyncio

    from deerflow.config.agents_config import list_custom_agents
    from deerflow.agents.memory.updater import get_memory_data

    # ── Health ─────────────────────────────────────────────────────────
    health = HealthKPI()
    resources = ResourceKPI()
    services: list[ServiceItem] = []

    try:
        from app.gateway.routers.health import get_health_report
        report = await get_health_report()
        health = HealthKPI(
            score=report.score,
            status=report.overall_status,
            healthyServices=sum(1 for s in report.services if s.status == "healthy"),
            totalServices=len(report.services),
            criticalIssues=sum(1 for i in report.issues if i.severity == "critical"),
        )
        resources = ResourceKPI(
            cpuPercent=round(report.resources.cpu_percent, 1),
            memoryPercent=round(report.resources.memory_percent, 1),
            diskPercent=round(report.resources.disk_percent, 1),
        )
        for svc in report.services:
            services.append(ServiceItem(
                name=svc.name,
                status=svc.status,
                responseTimeMs=svc.response_time_ms,
            ))
    except Exception as e:
        logger.warning("Failed to collect health stats for dashboard: %s", e)

    # ── Agents ─────────────────────────────────────────────────────────
    agents_kpi = AgentKPI()
    try:
        agents = list_custom_agents()
        agents_kpi.totalAgents = len(agents)
        if agents:
            agent_names = [a.name for a in agents]
            stats_tasks = [get_agent_stats(n) for n in agent_names]
            stats_results = await asyncio.gather(*stats_tasks, return_exceptions=True)
            for result in stats_results:
                if isinstance(result, Exception):
                    continue
                s: AgentStatsResponse = result
                agents_kpi.totalChats += s.total_chats
                agents_kpi.totalMessages += s.total_messages
                agents_kpi.totalToolCalls += s.tool_calls

            # Avg latency from aggregate
            if agents_kpi.totalChats > 0:
                from app.gateway.timing import get_timing_store
                ts = get_timing_store()
                avg_gw = ts.average_ms()
                if avg_gw > 0:
                    agents_kpi.avgLatencyMs = round(avg_gw, 1)
    except Exception as e:
        logger.warning("Failed to collect agent stats for dashboard: %s", e)

    # ── Memory ─────────────────────────────────────────────────────────
    memory_kpi = MemoryKPI()
    try:
        mem_data = get_memory_data()
        if mem_data and "facts" in mem_data:
            memory_kpi.totalMemories = len(mem_data.get("facts", []))
        # Topics = distinct categories in facts
        topics: set[str] = set()
        for fact in mem_data.get("facts", []):
            if isinstance(fact, dict) and fact.get("category"):
                topics.add(fact["category"])
        memory_kpi.totalTopics = len(topics)
    except Exception as e:
        logger.warning("Failed to collect memory stats for dashboard: %s", e)

    # ── Tools ──────────────────────────────────────────────────────────
    tools_kpi = ToolKPI()
    try:
        agents = list_custom_agents()
        all_tools: set[str] = set()
        for agent_cfg in agents:
            for tg in (agent_cfg.tool_groups or []):
                all_tools.add(tg)
        tools_kpi.totalTools = len(all_tools)
        tools_kpi.availableTools = len(all_tools)
    except Exception as e:
        logger.warning("Failed to collect tool stats for dashboard: %s", e)

    return DashboardStatsResponse(
        health=health,
        resources=resources,
        agents=agents_kpi,
        services=services,
        memory=memory_kpi,
        tools=tools_kpi,
    )


@router.get(
    "/dashboard/analytics",
    response_model=DashboardAnalyticsResponse,
    summary="Get Dashboard Analytics",
    description="Aggregated analytics across all agents for the dashboard charts page.",
)
async def get_dashboard_analytics(days: int = 7) -> DashboardAnalyticsResponse:
    """Aggregate stats from all agents for dashboard visualization.

    Computes session activity, message volume, tool usage, per-agent latency
    percentiles, and summary totals — all from real agent stats and timing data.

    Args:
        days: Number of days to include in time-series data (default 7).

    Returns:
        DashboardAnalyticsResponse with aggregated analytics.
    """
    import asyncio
    from datetime import datetime, timedelta

    from deerflow.config.agents_config import list_custom_agents

    agents = list_custom_agents()
    if not agents:
        return DashboardAnalyticsResponse()

    agent_names = [a.name for a in agents]

    # Fetch stats for all agents in parallel
    tasks = []
    for name in agent_names:
        tasks.append(get_agent_stats(name))

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Aggregate
    daily_sessions: dict[str, int] = {}
    daily_messages: dict[str, int] = {}
    tool_counter: dict[str, int] = {}
    total_chats = 0
    total_messages = 0
    total_tool_calls = 0
    agent_latency: list[dict] = []
    total_latency_ms = 0
    latency_count = 0

    # Build date range for time series
    today = datetime.utcnow().date()
    date_range = [(today - timedelta(days=i)).isoformat() for i in range(days - 1, -1, -1)]
    day_names = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        day_names.append(d.strftime("%b %d"))

    for date_str in date_range:
        daily_sessions[date_str] = 0
        daily_messages[date_str] = 0

    for i, (name, result) in enumerate(zip(agent_names, results)):
        if isinstance(result, Exception):
            logger.warning("Failed to get stats for agent '%s': %s", name, result)
            continue

        stats: AgentStatsResponse = result
        total_chats += stats.total_chats
        total_messages += stats.total_messages
        total_tool_calls += stats.tool_calls

        # Aggregate weekly activity into daily buckets
        for entry in stats.weekly_activity:
            day = entry.get("day", "")
            msg_count = entry.get("messages", 0)
            # Map day abbreviation back to ISO date
            # weekday: Mon=0, Tue=1, ...
            day_abbr_to_idx = {
                "Mon": 0, "Tue": 1, "Wed": 2, "Thu": 3, "Fri": 4, "Sat": 5, "Sun": 6,
            }
            day_idx = day_abbr_to_idx.get(day)
            if day_idx is not None:
                target_date = today - timedelta(days=today.weekday() - day_idx)
                # Adjust if the target date is in the future (next week)
                if target_date > today:
                    target_date -= timedelta(days=7)
                date_str = target_date.isoformat()
                if date_str in daily_messages:
                    daily_messages[date_str] += msg_count
                    daily_sessions[date_str] += 1

        # Aggregate top tools
        for tool in stats.top_tools:
            t_name = tool.get("name", "unknown")
            t_count = tool.get("count", 0)
            tool_counter[t_name] = tool_counter.get(t_name, 0) + t_count

        # Agent latency
        p50 = stats.p50_response_time
        p95 = stats.p95_response_time
        p99 = stats.p99_response_time
        if p50 is not None or p95 is not None or p99 is not None:
            agent_latency.append({
                "agent": name,
                "p50_ms": round(p50 * 1000) if p50 is not None else 0,
                "p95_ms": round(p95 * 1000) if p95 is not None else 0,
                "p99_ms": round(p99 * 1000) if p99 is not None else 0,
            })
            if p50 is not None:
                total_latency_ms += round(p50 * 1000)
                latency_count += 1

    # Build ordered time series
    session_activity = []
    message_volume = []
    for date_str, day_name in zip(date_range, day_names):
        session_activity.append({"date": day_name, "value": daily_sessions.get(date_str, 0)})
        message_volume.append({"date": day_name, "value": daily_messages.get(date_str, 0)})

    # Build tool usage with colors
    sorted_tools = sorted(tool_counter.items(), key=lambda x: x[1], reverse=True)
    tool_usage = []
    for idx, (t_name, t_count) in enumerate(sorted_tools[:10]):
        tool_usage.append({
            "name": t_name,
            "value": t_count,
            "color": TOOL_COLORS[idx % len(TOOL_COLORS)],
        })

    # Summary
    avg_latency_ms = round(total_latency_ms / latency_count) if latency_count > 0 else 0
    summary = {
        "total_agents": len(agent_names),
        "total_chats": total_chats,
        "total_messages": total_messages,
        "total_tool_calls": total_tool_calls,
        "avg_latency_ms": avg_latency_ms,
    }

    return DashboardAnalyticsResponse(
        session_activity=session_activity,
        message_volume=message_volume,
        tool_usage=tool_usage,
        agent_latency=agent_latency,
        summary=summary,
    )


@router.get(
    "/agents/{name}/timing",
    response_model=TimingHistoryResponse,
    summary="Get Agent Timing History",
    description="Retrieve timestamped response-time history for an agent, useful for latency trend charts.",
)
async def get_agent_timing(name: str) -> TimingHistoryResponse:
    """Get response-time history for a specific agent.

    Args:
        name: The agent name.

    Returns:
        TimingHistoryResponse with timestamped samples and summary statistics.
    """
    _validate_agent_name(name)
    name = _normalize_agent_name(name)

    from app.gateway.timing import get_timing_store

    timing_store = get_timing_store()
    samples = await timing_store.get_history(name)

    if not samples:
        return TimingHistoryResponse(agent_name=name, samples=[], count=0)

    values = [s["value_ms"] for s in samples]
    return TimingHistoryResponse(
        agent_name=name,
        samples=samples,
        count=len(samples),
        avg_ms=int(sum(values) / len(values)),
        min_ms=min(values),
        max_ms=max(values),
    )


# ── LangGraph timing instrumentation ──────────────────────────────────────


class InstrumentTimingRequest(BaseModel):
    """Request to report LangGraph processing time from an internal caller."""

    gateway_total_ms: int = Field(..., description="Total Gateway HTTP roundtrip time in ms", ge=0)
    langgraph_ms: int = Field(..., description="Actual LangGraph agent processing time in ms", ge=0)


class InstrumentTimingResponse(BaseModel):
    """Response after recording a timing sample."""

    agent_name: str
    gateway_ms: int
    langgraph_ms: int
    overhead_ms: int = Field(..., description="Gateway overhead (HTTP total − LangGraph processing)")
    gateway_avg_ms: int | None = Field(default=None, description="Running avg Gateway HTTP response time")
    langgraph_avg_ms: int | None = Field(default=None, description="Running avg LangGraph processing time")


@router.post(
    "/agents/{name}/timing/instrument",
    response_model=InstrumentTimingResponse,
    summary="Report LangGraph Processing Time",
    description="""Record LangGraph agent processing time for response-time decomposition.

This endpoint is intended for **internal callers** (e.g., the channels
service) that can measure actual LangGraph invocation time separately from
the Gateway HTTP roundtrip.

The Gateway overhead is computed as:
  gateway_total_ms − langgraph_ms

Both Gateway HTTP timing and LangGraph processing timing are stored in the
TimingStore, enabling separate percentile tracking and overhead analysis.
""",
)
async def instrument_agent_timing(name: str, request: InstrumentTimingRequest) -> InstrumentTimingResponse:
    """Record LangGraph processing time from an internal timing reporter.

    Args:
        name: The agent name.
        request: Timing sample with gateway_total_ms and langgraph_ms.

    Returns:
        InstrumentTimingResponse with computed overhead and running averages.
    """
    _validate_agent_name(name)
    name = _normalize_agent_name(name)

    from app.gateway.timing import get_timing_store

    overhead = max(0, request.gateway_total_ms - request.langgraph_ms)
    store = get_timing_store()

    # Record both dimensions
    await store.record(name, request.gateway_total_ms / 1000.0)
    await store.record_langgraph(name, request.langgraph_ms)

    gw_avg = await store.avg_response_time_ms(name)
    lg_avg = await store.langgraph_avg_response_time_ms(name)

    logger.info(
        "Instrument timing for %r: gw=%dms lg=%dms overhead=%dms",
        name, request.gateway_total_ms, request.langgraph_ms, overhead,
    )

    return InstrumentTimingResponse(
        agent_name=name,
        gateway_ms=request.gateway_total_ms,
        langgraph_ms=request.langgraph_ms,
        overhead_ms=overhead,
        gateway_avg_ms=gw_avg,
        langgraph_avg_ms=lg_avg,
    )


# ── Checkpointer helpers ──────────────────────────────────────────────────


async def _list_agent_threads(checkpointer, agent_name: str) -> list[dict]:
    """List all threads that belong to a given agent.

    Uses the checkpointer's async interface when available, otherwise
    falls back to sync calls in a thread pool.
    """
    threads: list[dict] = []

    # Try async listing first (Postgres / AsyncSqlite)
    if hasattr(checkpointer, "alist"):
        config = {"configurable": {}}
        async for thread in checkpointer.alist(config):
            threads.append(_thread_to_dict(thread))
    elif hasattr(checkpointer, "list"):
        # Sync listing — run in executor to avoid blocking
        import asyncio

        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(None, lambda: list(checkpointer.list({"configurable": {}})))
        threads = [_thread_to_dict(t) for t in result]
    else:
        logger.warning("Checkpointer does not support thread listing")

    # Filter by agent_name in context/values
    filtered = []
    for t in threads:
        values = t.get("values") or {}
        metadata = t.get("metadata") or {}
        ctx_agent = metadata.get("agent_name") if metadata else None
        vals_agent = values.get("agent_name") if values else None
        if ctx_agent == agent_name or vals_agent == agent_name:
            filtered.append(t)

    return filtered


def _get_thread_id(thread: dict) -> str | None:
    """Extract thread_id from a normalized thread dict."""
    return thread.get("thread_id")


def _thread_to_dict(thread) -> dict:
    """Normalize a checkpointer thread record to a plain dict."""
    if isinstance(thread, dict):
        return thread
    # Handle Sqlite / Postgres row objects
    return {
        "thread_id": getattr(thread, "thread_id", None),
        "updated_at": getattr(thread, "updated_at", None),
        "values": getattr(thread, "values", None),
        "metadata": getattr(thread, "metadata", None),
    }


# ── Agent Status ───────────────────────────────────────────────────────────

class AgentStatusResponse(BaseModel):
    """Response model for agent live status."""

    status: str = Field(default="unknown", description="Agent status: online, offline, busy, unknown")
    responseTimeMs: int | None = Field(default=None, description="Last measured response time in milliseconds")
    lastSeen: str | None = Field(default=None, description="ISO timestamp of last activity")
    version: str | None = Field(default=None, description="Agent version or build info")


@router.get(
    "/agents/{name}/status",
    response_model=AgentStatusResponse,
    summary="Get Agent Status",
    description="Retrieve the current live status of an agent with response time metrics.",
)
async def get_agent_status(name: str) -> AgentStatusResponse:
    """Get the current live status of an agent.

    Computes status based on recent thread activity. If the agent has been
    active within the last 5 minutes, it is considered 'online'. If actively
    processing a thread, 'busy'. Otherwise 'offline'.

    Args:
        name: The agent name.

    Returns:
        AgentStatusResponse with status and timing info.

    Raises:
        HTTPException: 404 if agent not found.
    """
    _validate_agent_name(name)
    name = _normalize_agent_name(name)

    agent_dir = get_paths().agent_dir(name)
    if not agent_dir.exists():
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

    try:
        from deerflow.agents.checkpointer.provider import get_checkpointer

        checkpointer = get_checkpointer()
    except Exception as exc:
        logger.warning("Checkpointer unavailable for agent status: %s", exc)
        return AgentStatusResponse(status="unknown")

    try:
        threads = await _list_agent_threads(checkpointer, name)
    except Exception as exc:
        logger.warning("Failed to list threads for agent status: %s", exc)
        threads = []

    if not threads:
        return AgentStatusResponse(status="offline")

    # Find most recent activity
    last_active: str | None = None
    for thread in threads:
        updated_at = thread.get("updated_at")
        if updated_at:
            if last_active is None or updated_at > last_active:
                last_active = updated_at

    from datetime import datetime, timedelta, timezone

    now = datetime.now(timezone.utc)
    status = "offline"
    response_time_ms: int | None = None

    if last_active:
        last_dt = datetime.fromisoformat(last_active.replace("Z", "+00:00"))
        diff = (now - last_dt).total_seconds()

        if diff < 60:
            status = "busy"
        elif diff < 300:
            status = "online"
        else:
            status = "offline"

        # Use real Gateway timing data when available; fall back to heuristic
        from app.gateway.timing import get_timing_store

        timing_store = get_timing_store()
        measured_rt = await timing_store.last_response_time_ms(name)
        if measured_rt is not None:
            response_time_ms = measured_rt
        else:
            response_time_ms = max(50, min(2000, int(500 + len(threads) * 50)))

    return AgentStatusResponse(
        status=status,
        responseTimeMs=response_time_ms,
        lastSeen=last_active,
        version=None,
    )


@router.get(
    "/agents/{name}/export",
    response_model=AgentExportResponse,
    summary="Export Agent Configuration",
    description="Export an agent's full configuration including SOUL.md as JSON.",
)
async def export_agent(name: str) -> AgentExportResponse:
    """Export an agent's configuration.

    Args:
        name: The agent name.

    Returns:
        AgentExportResponse with the agent's full configuration.

    Raises:
        HTTPException: 404 if agent not found.
    """
    _validate_agent_name(name)
    name = _normalize_agent_name(name)

    config = load_agent_config(name)
    if config is None:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

    soul = load_agent_soul(name)

    return AgentExportResponse(
        name=name,
        description=config.description or "",
        model=config.model,
        tool_groups=config.tool_groups,
        soul=soul,
        version="1.0",
    )


@router.post(
    "/agents/import",
    response_model=AgentImportResponse,
    summary="Import Agent Configuration",
    description="Import an agent from a JSON configuration (or upload .json file).",
)
async def import_agent(
    request: AgentImportRequest | None = None,
    file: UploadFile | None = File(None),
) -> AgentImportResponse:
    """Import an agent from JSON.

    Accepts either a JSON body or a file upload.

    Args:
        request: JSON body with agent configuration.
        file: Optional uploaded .json file.

    Returns:
        AgentImportResponse indicating creation or overwrite.

    Raises:
        HTTPException: 400 if invalid, 409 if exists (without overwrite).
    """
    if file is not None:
        content = await file.read()
        try:
            data = json.loads(content.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError) as exc:
            raise HTTPException(status_code=400, detail=f"Invalid JSON file: {exc}")
        request = AgentImportRequest(**data)

    if request is None:
        raise HTTPException(status_code=400, detail="Either request body or file upload is required")

    _validate_agent_name(request.name)
    name = _normalize_agent_name(request.name)

    agent_dir = get_paths().agent_dir(name)
    existing = agent_dir.exists()

    if existing and not request.overwrite:
        raise HTTPException(
            status_code=409,
            detail=f"Agent '{name}' already exists. Set overwrite=true to replace.",
        )

    try:
        agent_dir.mkdir(parents=True, exist_ok=True)

        # Write config.yaml
        config_data: dict = {"name": name}
        if request.description:
            config_data["description"] = request.description
        if request.model:
            config_data["model"] = request.model
        if request.tool_groups:
            config_data["tool_groups"] = request.tool_groups

        config_path = agent_dir / "config.yaml"
        with open(config_path, "w", encoding="utf-8") as f:
            yaml.dump(config_data, f, default_flow_style=False, allow_unicode=True)

        # Write SOUL.md
        soul_path = agent_dir / "SOUL.md"
        with open(soul_path, "w", encoding="utf-8") as f:
            f.write(request.soul or "")

        action = "overwritten" if existing else "created"
        logger.info(f"Imported agent '{name}' ({action}) from JSON")
        return AgentImportResponse(name=name, created=not existing)

    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Failed to import agent: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to import agent: {str(exc)}")


# ── Batch Export / Import (ZIP) ──────────────────────────────────────────────

class BatchExportRequest(BaseModel):
    """Request body for batch agent export."""
    names: list[str] = Field(..., description="List of agent names to export")


class BatchImportResult(BaseModel):
    """Single agent import result in a batch operation."""
    name: str
    created: bool
    error: str | None = Field(default=None, description="Error message if import failed")


class BatchImportResponse(BaseModel):
    """Response model for batch agent import."""
    results: list[BatchImportResult] = Field(default_factory=list)
    total: int = Field(default=0, description="Total agents in the ZIP")
    imported: int = Field(default=0, description="Successfully imported/overwritten")
    skipped: int = Field(default=0, description="Skipped due to existing (no overwrite)")
    failed: int = Field(default=0, description="Failed due to errors")


@router.post(
    "/agents/export-batch",
    summary="Batch Export Agents (ZIP)",
    description="Export multiple agents as a ZIP archive containing manifest.json and per-agent configuration files.",
)
async def export_agents_batch(request: BatchExportRequest):
    """Export multiple agents as a ZIP archive.

    Args:
        request: Batch export request with agent names.

    Returns:
        StreamingResponse with application/zip content type.
    """
    if not request.names:
        raise HTTPException(status_code=400, detail="At least one agent name is required")

    # Validate all names and collect export data
    agents_data: list[dict] = []
    for name in request.names:
        _validate_agent_name(name)
        normalized = _normalize_agent_name(name)
        try:
            config = load_agent_config(normalized)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail=f"Agent '{normalized}' not found")

        soul = load_agent_soul(normalized)
        agents_data.append({
            "name": normalized,
            "description": config.description or "",
            "model": config.model,
            "tool_groups": config.tool_groups,
            "soul": soul,
            "version": "1.0",
        })

    # Build ZIP in memory
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # Write manifest.json
        manifest = {
            "export_format": "deerflow-agent-batch-v1",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "agent_count": len(agents_data),
            "agents": [a["name"] for a in agents_data],
        }
        zf.writestr("manifest.json", json.dumps(manifest, indent=2, ensure_ascii=False))

        # Write per-agent agent.json files
        for agent_data in agents_data:
            folder = agent_data["name"]
            zf.writestr(
                f"{folder}/agent.json",
                json.dumps(agent_data, indent=2, ensure_ascii=False),
            )

    buf.seek(0)
    filename = f"deerflow-agents-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.zip"

    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.post(
    "/agents/import-batch",
    response_model=BatchImportResponse,
    summary="Batch Import Agents (ZIP)",
    description="Import multiple agents from a ZIP archive created by the batch export endpoint.",
)
async def import_agents_batch(
    file: UploadFile = File(...),
    overwrite: bool = False,
) -> BatchImportResponse:
    """Import multiple agents from a ZIP archive.

    Args:
        file: Uploaded ZIP file.
        overwrite: Whether to overwrite existing agents.

    Returns:
        BatchImportResponse with per-agent results.
    """
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are accepted")

    content = await file.read()

    try:
        zf = zipfile.ZipFile(io.BytesIO(content), "r")
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP file")

    results: list[BatchImportResult] = []
    imported = 0
    skipped = 0
    failed = 0

    with zf:
        # First, try to read manifest.json
        try:
            manifest_raw = zf.read("manifest.json")
            manifest = json.loads(manifest_raw.decode("utf-8"))
            agent_names = manifest.get("agents", [])
        except (KeyError, json.JSONDecodeError):
            # Manifest not found or invalid — scan ZIP for agent folders
            agent_names = []
            for entry in zf.namelist():
                parts = entry.split("/")
                if len(parts) == 2 and parts[1] == "agent.json":
                    agent_names.append(parts[0])

        # Process each agent
        for name in agent_names:
            try:
                agent_json_path = f"{name}/agent.json"
                if agent_json_path not in zf.namelist():
                    results.append(BatchImportResult(
                        name=name, created=False,
                        error=f"agent.json not found in ZIP for '{name}'",
                    ))
                    failed += 1
                    continue

                agent_raw = zf.read(agent_json_path)
                agent_data = json.loads(agent_raw.decode("utf-8"))

                # Validate and normalize
                name_from_data = agent_data.get("name", name)
                _validate_agent_name(name_from_data)
                normalized = _normalize_agent_name(name_from_data)

                agent_dir = get_paths().agent_dir(normalized)
                existing = agent_dir.exists()

                if existing and not overwrite:
                    results.append(BatchImportResult(name=normalized, created=False))
                    skipped += 1
                    continue

                # Write agent files
                agent_dir.mkdir(parents=True, exist_ok=True)

                config_data: dict = {"name": normalized}
                if agent_data.get("description"):
                    config_data["description"] = agent_data["description"]
                if agent_data.get("model"):
                    config_data["model"] = agent_data["model"]
                if agent_data.get("tool_groups"):
                    config_data["tool_groups"] = agent_data["tool_groups"]

                config_path = agent_dir / "config.yaml"
                with open(config_path, "w", encoding="utf-8") as f:
                    yaml.dump(config_data, f, default_flow_style=False, allow_unicode=True)

                soul_path = agent_dir / "SOUL.md"
                with open(soul_path, "w", encoding="utf-8") as f:
                    f.write(agent_data.get("soul") or "")

                results.append(BatchImportResult(
                    name=normalized,
                    created=not existing,
                ))
                imported += 1
                logger.info(
                    "Batch import: agent '%s' %s",
                    normalized,
                    "created" if not existing else "overwritten",
                )

            except HTTPException:
                raise
            except Exception as exc:
                logger.error("Batch import failed for agent '%s': %s", name, exc)
                results.append(BatchImportResult(
                    name=name, created=False,
                    error=str(exc),
                ))
                failed += 1

    return BatchImportResponse(
        results=results,
        total=len(agent_names),
        imported=imported,
        skipped=skipped,
        failed=failed,
    )


@router.delete(
    "/agents/{name}",
    status_code=204,
    summary="Delete Custom Agent",
    description="Delete a custom agent and all its files (config, SOUL.md, memory), plus clean up associated threads.",
)
async def delete_agent(name: str) -> None:
    """Delete a custom agent.

    Args:
        name: The agent name.

    Raises:
        HTTPException: 404 if agent not found.
    """
    _validate_agent_name(name)
    name = _normalize_agent_name(name)

    agent_dir = get_paths().agent_dir(name)

    if not agent_dir.exists():
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

    try:
        shutil.rmtree(agent_dir)
        logger.info(f"Deleted agent '{name}' from {agent_dir}")
    except Exception as e:
        logger.error(f"Failed to delete agent '{name}': {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete agent: {str(e)}")

    # Best-effort thread cleanup: try to delete threads associated with this agent
    try:
        from deerflow.agents.checkpointer.provider import get_checkpointer

        checkpointer = get_checkpointer()
        threads = await _list_agent_threads(checkpointer, name)

        deleted_count = 0
        for thread in threads:
            thread_id = _get_thread_id(thread)
            if thread_id:
                try:
                    config = {"configurable": {"thread_id": thread_id}}
                    if hasattr(checkpointer, "adelete_thread"):
                        await checkpointer.adelete_thread(config)
                    elif hasattr(checkpointer, "delete_thread"):
                        checkpointer.delete_thread(config)
                    deleted_count += 1
                except Exception as inner_exc:
                    logger.debug(
                        "Failed to delete thread '%s' for agent '%s': %s",
                        thread_id, name, inner_exc,
                    )

        if deleted_count > 0:
            logger.info(
                "Cleaned up %d threads for deleted agent '%s'",
                deleted_count, name,
            )
    except Exception as cleanup_exc:
        logger.warning(
            "Thread cleanup for agent '%s' failed (non-blocking): %s",
            name, cleanup_exc,
        )


# ── Batch Delete ─────────────────────────────────────────────────────────


class BatchDeleteRequest(BaseModel):
    """Request body for batch agent deletion."""

    names: list[str] = Field(..., description="List of agent names to delete", min_length=1)


class BatchDeleteItem(BaseModel):
    """Result for a single agent in a batch delete."""

    name: str
    deleted: bool = False
    error: str | None = None


class BatchDeleteResponse(BaseModel):
    """Response for batch agent deletion."""

    results: list[BatchDeleteItem]
    total: int
    deleted: int = 0
    failed: int = 0


@router.post(
    "/agents/delete-batch",
    response_model=BatchDeleteResponse,
    summary="Batch Delete Agents",
    description="Delete multiple agents and their files in a single request. Thread cleanup is performed best-effort.",
)
async def delete_agents_batch(request: BatchDeleteRequest) -> BatchDeleteResponse:
    """Delete multiple agents.

    Each agent deletion includes:
    - Filesystem cleanup (config, SOUL.md, memory directory)
    - Best-effort LangGraph thread cleanup

    Failures for individual agents are logged but do not block
    deletion of the remaining agents.

    Args:
        request: List of agent names to delete.

    Returns:
        BatchDeleteResponse with per-agent results and aggregate counts.
    """
    results: list[BatchDeleteItem] = []
    deleted = 0
    failed = 0

    for name in request.names:
        try:
            _validate_agent_name(name)
        except HTTPException as exc:
            results.append(BatchDeleteItem(name=name, deleted=False, error=str(exc.detail)))
            failed += 1
            continue

        normalized = _normalize_agent_name(name)
        agent_dir = get_paths().agent_dir(normalized)

        if not agent_dir.exists():
            results.append(BatchDeleteItem(name=normalized, deleted=False, error="Agent not found"))
            failed += 1
            continue

        try:
            shutil.rmtree(agent_dir)
            logger.info("Batch delete: removed agent '%s' from %s", normalized, agent_dir)

            # Best-effort thread cleanup
            await _cleanup_agent_threads(normalized)
            results.append(BatchDeleteItem(name=normalized, deleted=True))
            deleted += 1
        except Exception as e:
            logger.error("Batch delete: failed for agent '%s': %s", normalized, e)
            results.append(BatchDeleteItem(name=normalized, deleted=False, error=str(e)))
            failed += 1

    return BatchDeleteResponse(
        results=results,
        total=len(request.names),
        deleted=deleted,
        failed=failed,
    )


async def _cleanup_agent_threads(agent_name: str) -> None:
    """Best-effort cleanup of LangGraph threads for a deleted agent."""
    try:
        from deerflow.agents.checkpointer.provider import get_checkpointer

        checkpointer = get_checkpointer()
        threads = await _list_agent_threads(checkpointer, agent_name)

        deleted_count = 0
        for thread in threads:
            thread_id = _get_thread_id(thread)
            if thread_id:
                try:
                    config = {"configurable": {"thread_id": thread_id}}
                    if hasattr(checkpointer, "adelete_thread"):
                        await checkpointer.adelete_thread(config)
                    elif hasattr(checkpointer, "delete_thread"):
                        checkpointer.delete_thread(config)
                    deleted_count += 1
                except Exception:
                    pass

        if deleted_count > 0:
            logger.info("Cleaned up %d threads for batch-deleted agent '%s'", deleted_count, agent_name)
    except Exception:
        logger.debug("Thread cleanup for agent '%s' failed (non-blocking)", agent_name, exc_info=True)


# --- Version History Endpoints ---

@router.get(
    "/agents/{name}/versions",
    response_model=AgentVersionsResponse,
    summary="List Agent Version History",
    description="List all saved version snapshots for an agent, ordered newest first.",
)
async def list_agent_versions(name: str) -> AgentVersionsResponse:
    """List all version snapshots for an agent.

    Args:
        name: The agent name.

    Returns:
        AgentVersionsResponse with sorted version summaries.
    """
    _validate_agent_name(name)
    name = _normalize_agent_name(name)

    agent_dir = get_paths().agent_dir(name)
    versions_dir = agent_dir / "versions"

    if not versions_dir.exists():
        return AgentVersionsResponse(agent_name=name, versions=[], count=0)

    versions: list[AgentVersionSummary] = []
    for version_dir in sorted(versions_dir.iterdir(), reverse=True):
        if not version_dir.is_dir():
            continue
        metadata_path = version_dir / "metadata.json"
        if not metadata_path.exists():
            continue
        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
            versions.append(AgentVersionSummary(
                version_id=metadata.get("version_id", version_dir.name),
                timestamp=metadata.get("timestamp", ""),
                changed_fields=metadata.get("changed_fields", []),
                description=metadata.get("description", ""),
            ))
        except (json.JSONDecodeError, KeyError) as e:
            logger.warning(f"Skipping corrupt version directory {version_dir.name}: {e}")

    return AgentVersionsResponse(
        agent_name=name,
        versions=versions,
        count=len(versions),
    )


@router.get(
    "/agents/{name}/versions/{version_id}",
    response_model=AgentVersionDetail,
    summary="Get Agent Version Detail",
    description="Retrieve the full config and soul content of a specific version snapshot.",
)
async def get_agent_version(name: str, version_id: str) -> AgentVersionDetail:
    """Get full details of a specific version snapshot.

    Args:
        name: The agent name.
        version_id: The version ID (ISO timestamp).

    Returns:
        AgentVersionDetail with full config and soul content.

    Raises:
        HTTPException: 404 if version not found.
    """
    _validate_agent_name(name)
    name = _normalize_agent_name(name)

    agent_dir = get_paths().agent_dir(name)
    version_dir = agent_dir / "versions" / version_id

    if not version_dir.exists():
        raise HTTPException(status_code=404, detail=f"Version '{version_id}' not found for agent '{name}'")

    metadata_path = version_dir / "metadata.json"
    metadata = {}
    if metadata_path.exists():
        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
        except json.JSONDecodeError:
            pass

    # Load config
    config: dict = {}
    config_path = version_dir / "config.yaml"
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f) or {}

    # Load soul
    soul: str | None = None
    soul_path = version_dir / "SOUL.md"
    if soul_path.exists():
        soul = soul_path.read_text(encoding="utf-8")

    return AgentVersionDetail(
        version_id=metadata.get("version_id", version_id),
        timestamp=metadata.get("timestamp", ""),
        config=config,
        soul=soul,
        changed_fields=metadata.get("changed_fields", []),
    )


@router.get(
    "/agents/{name}/versions/diff",
    response_model=AgentVersionDiffResponse,
    summary="Compare Two Agent Versions",
    description="Retrieve a side-by-side diff between two version snapshots of an agent.",
)
async def diff_agent_versions(
    name: str,
    from_: str = Query(..., alias="from", description="Earlier version ID"),
    to: str = Query(..., description="Later version ID"),
) -> AgentVersionDiffResponse:
    """Compare two version snapshots of an agent.

    Args:
        name: The agent name.
        from_: The earlier version ID.
        to: The later version ID.

    Returns:
        AgentVersionDiffResponse with both versions and computed diff.

    Raises:
        HTTPException: 404 if either version not found.
    """
    _validate_agent_name(name)
    name_norm = _normalize_agent_name(name)

    def _load_version(version_id: str) -> AgentVersionDetail:
        agent_dir = get_paths().agent_dir(name_norm)
        version_dir = agent_dir / "versions" / version_id
        if not version_dir.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Version '{version_id}' not found for agent '{name}'",
            )

        metadata = {}
        metadata_path = version_dir / "metadata.json"
        if metadata_path.exists():
            try:
                with open(metadata_path, "r", encoding="utf-8") as f:
                    metadata = json.load(f)
            except json.JSONDecodeError:
                pass

        config: dict = {}
        config_path = version_dir / "config.yaml"
        if config_path.exists():
            with open(config_path, "r", encoding="utf-8") as f:
                config = yaml.safe_load(f) or {}

        soul: str | None = None
        soul_path = version_dir / "SOUL.md"
        if soul_path.exists():
            soul = soul_path.read_text(encoding="utf-8")

        return AgentVersionDetail(
            version_id=version_id,
            timestamp=metadata.get("timestamp", ""),
            config=config,
            soul=soul,
            changed_fields=metadata.get("changed_fields", []),
        )

    from_ver = _load_version(from_)
    to_ver = _load_version(to)

    # Compute key-level config diff
    config_diff: dict = {}
    all_keys = set(from_ver.config.keys()) | set(to_ver.config.keys())
    for key in sorted(all_keys):
        from_val = from_ver.config.get(key)
        to_val = to_ver.config.get(key)
        if from_val != to_val:
            config_diff[key] = {"from": from_val, "to": to_val}

    soul_changed = from_ver.soul != to_ver.soul

    return AgentVersionDiffResponse(
        from_version=from_ver,
        to_version=to_ver,
        config_diff=config_diff,
        soul_changed=soul_changed,
        fields_changed=list(config_diff.keys()),
    )


@router.post(
    "/agents/{name}/versions/{version_id}/restore",
    response_model=AgentRestoreResponse,
    summary="Restore Agent to a Previous Version",
    description="Restore the agent's config and SOUL to a previous version snapshot. The current state is saved as a new version before restoring.",
)
async def restore_agent_version(name: str, version_id: str) -> AgentRestoreResponse:
    """Restore an agent to a specific version snapshot.

    Before restoring, the current state is saved as a new version snapshot
    (with changed_fields=["restore"]) so the restore is reversible.

    Args:
        name: The agent name.
        version_id: The version ID to restore.

    Returns:
        AgentRestoreResponse with success status and version IDs.

    Raises:
        HTTPException: 404 if agent or version not found, 400 if restore fails.
    """
    _validate_agent_name(name)
    name = _normalize_agent_name(name)

    agent_dir = get_paths().agent_dir(name)
    if not agent_dir.exists():
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

    version_dir = agent_dir / "versions" / version_id
    if not version_dir.exists():
        raise HTTPException(status_code=404, detail=f"Version '{version_id}' not found for agent '{name}'")

    # Load version config
    version_config_path = version_dir / "config.yaml"
    if not version_config_path.exists():
        raise HTTPException(status_code=400, detail=f"Version '{version_id}' config not found")

    with open(version_config_path, "r", encoding="utf-8") as f:
        version_config = yaml.safe_load(f) or {}

    # Load version soul (may not exist)
    version_soul_path = version_dir / "SOUL.md"
    version_soul = version_soul_path.read_text(encoding="utf-8") if version_soul_path.exists() else None

    # Save current state as a pre-restore snapshot
    try:
        agent_cfg = load_agent_config(name)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Agent '{name}' not found")

    try:
        current_soul = load_agent_soul(name)
    except FileNotFoundError:
        current_soul = None

    pre_restore_version_id = _save_agent_version(
        agent_dir, agent_cfg, current_soul, changed_fields=["restore"]
    )

    # Overwrite config.yaml with version's config
    config_path = agent_dir / "config.yaml"
    with open(config_path, "w", encoding="utf-8") as f:
        yaml.dump(version_config, f, default_flow_style=False, allow_unicode=True)

    # Overwrite SOUL.md with version's soul
    soul_path = agent_dir / "SOUL.md"
    if version_soul is not None:
        soul_path.write_text(version_soul, encoding="utf-8")
    elif soul_path.exists():
        soul_path.unlink()

    logger.info(
        f"Restored agent '{name}' to version {version_id}. "
        f"Pre-restore state saved as version {pre_restore_version_id}"
    )

    return AgentRestoreResponse(
        success=True,
        restored_version_id=version_id,
        new_version_id=pre_restore_version_id or "",
    )
