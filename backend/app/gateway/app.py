import logging
import time
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from app.gateway.config import get_gateway_config
from app.gateway.routers import (
    agents,
    alerts,
    artifacts,
    audit,
    backup,
    benchmark,
    channels,
    collaboration,
    conversation_memory,
    health,
    knowledge_base,
    knowledge_graph,
    marketplace,
    mcp,
    memory,
    models,
    notifications,
    onboarding,
    performance,
    plugins,
    plugin_sdk,
    realtime,
    reasoning,
    scheduler,
    security,
    session_export,
    settings_workspace,
    sharing,
    shortcuts,
    skills,
    suggestions,
    threads,
    tools,
    uploads,
    ws,
    theme,
)
from app.gateway.timing import get_timing_store
from deerflow.config.app_config import get_app_config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""

    # Load config and check necessary environment variables at startup
    try:
        get_app_config()
        logger.info("Configuration loaded successfully")
    except Exception as e:
        error_msg = f"Failed to load configuration during gateway startup: {e}"
        logger.exception(error_msg)
        raise RuntimeError(error_msg) from e
    config = get_gateway_config()
    logger.info(f"Starting API Gateway on {config.host}:{config.port}")

    # NOTE: MCP tools initialization is NOT done here because:
    # 1. Gateway doesn't use MCP tools - they are used by Agents in the LangGraph Server
    # 2. Gateway and LangGraph Server are separate processes with independent caches
    # MCP tools are lazily initialized in LangGraph Server when first needed

    # Restore persisted timing snapshots from agent directories
    await _restore_timing_snapshots()

    # Restore alert state from disk
    await _restore_alert_state()

    # Restore share links from disk
    await _restore_share_links()

    # Restore real-time event buffer from disk
    _restore_event_buffer()

    # Restore knowledge-graph, collaboration, scheduler state from disk
    await _restore_kg_state()
    await _restore_kb_state()
    await _restore_collaboration_state()
    await _restore_scheduler_state()

    # Restore conversation-memory state from disk
    await _restore_cm_state()

    # Restore backup state from disk
    await _restore_backup_state()

    # Restore plugin state from disk
    await _restore_plugins_state()

    # Restore audit state from disk
    await _restore_audit_state()

    # Restore reasoning state from disk
    await _restore_reasoning_state()

    # Restore security state from disk
    await _restore_security_state()

    # Restore settings state from disk
    await _restore_settings_state()

    # Restore notifications state from disk
    await _restore_notifications_state()

    # Start IM channel service if any channels are configured
    try:
        from app.channels.service import start_channel_service

        channel_service = await start_channel_service()
        logger.info("Channel service started: %s", channel_service.get_status())
    except Exception:
        logger.exception("No IM channels configured or channel service failed to start")

    # Start scheduler background loop for periodic task execution
    try:
        from app.gateway.routers.scheduler import start_scheduler_loop

        await start_scheduler_loop()
        logger.info("Scheduler background loop started")
    except Exception:
        logger.exception("Failed to start scheduler background loop (non-fatal)")

    yield

    # Persist timing snapshots before shutdown
    await _persist_all_timing()

    # Persist alert state before shutdown
    await _persist_alert_state()

    # Persist share links before shutdown
    await _persist_share_links()

    # Persist real-time event buffer before shutdown
    _persist_event_buffer()

    # Persist knowledge-graph, collaboration, scheduler state before shutdown
    await _persist_kg_state()
    await _persist_kb_state()
    await _persist_collaboration_state()
    await _persist_scheduler_state()

    # Persist conversation-memory state before shutdown
    await _persist_cm_state()

    # Persist backup state before shutdown
    await _persist_backup_state()

    # Persist plugin state before shutdown
    await _persist_plugins_state()

    # Persist audit state before shutdown
    await _persist_audit_state()

    # Persist reasoning state before shutdown
    await _persist_reasoning_state()

    # Persist security state before shutdown
    await _persist_security_state()

    # Persist settings state before shutdown
    await _persist_settings_state()

    # Persist notifications state before shutdown
    await _persist_notifications_state()

    # Stop channel service on shutdown
    try:
        from app.channels.service import stop_channel_service

        await stop_channel_service()
    except Exception:
        logger.exception("Failed to stop channel service")

    # Stop scheduler background loop
    try:
        from app.gateway.routers.scheduler import stop_scheduler_loop

        await stop_scheduler_loop()
    except Exception:
        logger.exception("Failed to stop scheduler background loop (non-fatal)")

    logger.info("Shutting down API Gateway")


async def _restore_timing_snapshots() -> None:
    """Load persisted timing data from agent directories into the TimingStore."""
    try:
        from deerflow.config.paths import get_paths

        paths = get_paths()
        base_dir = paths.base_dir
        if not base_dir.exists():
            logger.info("No agents base directory yet — skipping timing restore")
            return

        store = get_timing_store()
        count = 0
        for child in base_dir.iterdir():
            if child.is_dir():
                agent_name = child.name
                if await store.load_snapshot(agent_name, child):
                    count += 1

        if count > 0:
            logger.info("Restored timing snapshots for %d agents", count)
    except Exception:
        logger.exception("Failed to restore timing snapshots (non-fatal)")


async def _persist_all_timing() -> None:
    """Save current timing data for all agents to their directories."""
    try:
        from deerflow.config.paths import get_paths

        paths = get_paths()
        base_dir = paths.base_dir
        store = get_timing_store()
        count = await store.save_all_to_dir(base_dir)
        if count > 0:
            logger.info("Persisted timing snapshots for %d agents", count)
    except Exception:
        logger.exception("Failed to persist timing snapshots (non-fatal)")


async def _restore_alert_state() -> None:
    """Load persisted alert configurations and history from disk at startup."""
    try:
        from app.gateway.routers.alerts import _load_state

        await _load_state()
    except Exception:
        logger.exception("Failed to restore alert state (non-fatal)")


async def _persist_alert_state() -> None:
    """Persist alert configurations and history to disk at shutdown."""
    try:
        from app.gateway.routers.alerts import _save_state

        await _save_state()
    except Exception:
        logger.exception("Failed to persist alert state (non-fatal)")


async def _restore_share_links() -> None:
    """Load persisted share links from disk at startup."""
    try:
        from app.gateway.routers.sharing import load_all_shares

        await load_all_shares()
    except Exception:
        logger.exception("Failed to restore share links (non-fatal)")


async def _persist_share_links() -> None:
    """Persist share links to disk at shutdown."""
    try:
        from app.gateway.routers.sharing import persist_all_shares

        await persist_all_shares()
    except Exception:
        logger.exception("Failed to persist share links (non-fatal)")


def _restore_event_buffer() -> None:
    """Load persisted real-time events into the in-memory ring buffer."""
    try:
        from app.gateway.routers.realtime import load_event_buffer

        count = load_event_buffer()
        if count > 0:
            logger.info("Restored %d real-time events from disk", count)
    except Exception:
        logger.exception("Failed to restore event buffer (non-fatal)")


def _persist_event_buffer() -> None:
    """Persist the in-memory event ring buffer to disk."""
    try:
        from app.gateway.routers.realtime import save_event_buffer

        if save_event_buffer():
            logger.debug("Persisted real-time event buffer")
    except Exception:
        logger.exception("Failed to persist event buffer (non-fatal)")


async def _restore_kg_state() -> None:
    """Load persisted knowledge graph data from disk."""
    try:
        from app.gateway.routers.knowledge_graph import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore knowledge graph state (non-fatal)")


async def _persist_kg_state() -> None:
    """Persist knowledge graph data to disk."""
    try:
        from app.gateway.routers.knowledge_graph import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist knowledge graph state (non-fatal)")


async def _restore_kb_state() -> None:
    """Load persisted knowledge base data from disk and init embedding provider."""
    try:
        from app.gateway.routers.knowledge_base import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore knowledge base state (non-fatal)")

    # Initialize embedding provider (may use network, so do it early)
    try:
        from app.gateway.routers.embeddings import init_embedding_provider
        await init_embedding_provider()
    except Exception:
        logger.exception("Failed to initialize embedding provider (non-fatal)")


async def _persist_kb_state() -> None:
    """Persist knowledge base data to disk."""
    try:
        from app.gateway.routers.knowledge_base import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist knowledge base state (non-fatal)")


async def _restore_collaboration_state() -> None:
    """Load persisted collaboration sessions from disk."""
    try:
        from app.gateway.routers.collaboration import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore collaboration state (non-fatal)")


async def _persist_collaboration_state() -> None:
    """Persist collaboration sessions to disk."""
    try:
        from app.gateway.routers.collaboration import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist collaboration state (non-fatal)")


async def _restore_scheduler_state() -> None:
    """Load persisted scheduled tasks from disk."""
    try:
        from app.gateway.routers.scheduler import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore scheduler state (non-fatal)")


async def _persist_scheduler_state() -> None:
    """Persist scheduled tasks to disk."""
    try:
        from app.gateway.routers.scheduler import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist scheduler state (non-fatal)")


async def _restore_backup_state() -> None:
    """Load persisted backup data from disk."""
    try:
        from app.gateway.routers.backup import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore backup state (non-fatal)")


async def _persist_backup_state() -> None:
    """Persist backup data to disk."""
    try:
        from app.gateway.routers.backup import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist backup state (non-fatal)")


async def _restore_cm_state() -> None:
    """Load persisted conversation memory data from disk."""
    try:
        from app.gateway.routers.conversation_memory import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore conversation memory state (non-fatal)")


async def _persist_cm_state() -> None:
    """Persist conversation memory data to disk."""
    try:
        from app.gateway.routers.conversation_memory import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist conversation memory state (non-fatal)")


async def _restore_plugins_state() -> None:
    """Load persisted plugin data from disk."""
    try:
        from app.gateway.routers.plugins import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore plugin state (non-fatal)")


async def _persist_plugins_state() -> None:
    """Persist plugin data to disk."""
    try:
        from app.gateway.routers.plugins import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist plugin state (non-fatal)")


async def _restore_audit_state() -> None:
    """Load persisted audit events from disk."""
    try:
        from app.gateway.routers.audit import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore audit state (non-fatal)")


async def _persist_audit_state() -> None:
    """Persist audit events to disk."""
    try:
        from app.gateway.routers.audit import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist audit state (non-fatal)")


async def _restore_reasoning_state() -> None:
    """Load persisted reasoning traces from disk."""
    try:
        from app.gateway.routers.reasoning import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore reasoning state (non-fatal)")


async def _persist_reasoning_state() -> None:
    """Persist reasoning traces to disk."""
    try:
        from app.gateway.routers.reasoning import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist reasoning state (non-fatal)")


async def _restore_security_state() -> None:
    """Load persisted security policies from disk."""
    try:
        from app.gateway.routers.security import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore security state (non-fatal)")


async def _persist_security_state() -> None:
    """Persist security policies to disk."""
    try:
        from app.gateway.routers.security import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist security state (non-fatal)")


async def _restore_settings_state() -> None:
    """Load persisted electron settings from disk."""
    try:
        from app.gateway.routers.settings_workspace import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore settings state (non-fatal)")


async def _persist_settings_state() -> None:
    """Persist electron settings to disk."""
    try:
        from app.gateway.routers.settings_workspace import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist settings state (non-fatal)")


async def _restore_notifications_state() -> None:
    """Load persisted notifications from disk."""
    try:
        from app.gateway.routers.notifications import _load_state
        await _load_state()
    except Exception:
        logger.exception("Failed to restore notifications state (non-fatal)")


async def _persist_notifications_state() -> None:
    """Persist notifications to disk."""
    try:
        from app.gateway.routers.notifications import _save_state
        await _save_state()
    except Exception:
        logger.exception("Failed to persist notifications state (non-fatal)")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns:
        Configured FastAPI application instance.
    """

    app = FastAPI(
        title="DeerFlow API Gateway",
        description="""
## DeerFlow API Gateway

API Gateway for DeerFlow - A LangGraph-based AI agent backend with sandbox execution capabilities.

### Features

- **Models Management**: Query and retrieve available AI models
- **MCP Configuration**: Manage Model Context Protocol (MCP) server configurations
- **Memory Management**: Access and manage global memory data for personalized conversations
- **Skills Management**: Query and manage skills and their enabled status
- **Artifacts**: Access thread artifacts and generated files
- **Health Monitoring**: System health check endpoints

### Architecture

LangGraph requests are handled by nginx reverse proxy.
This gateway provides custom endpoints for models, MCP configuration, skills, and artifacts.
        """,
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        openapi_tags=[
            {
                "name": "models",
                "description": "Operations for querying available AI models and their configurations",
            },
            {
                "name": "mcp",
                "description": "Manage Model Context Protocol (MCP) server configurations",
            },
            {
                "name": "memory",
                "description": "Access and manage global memory data for personalized conversations",
            },
            {
                "name": "skills",
                "description": "Manage skills and their configurations",
            },
            {
                "name": "artifacts",
                "description": "Access and download thread artifacts and generated files",
            },
            {
                "name": "uploads",
                "description": "Upload and manage user files for threads",
            },
            {
                "name": "threads",
                "description": "Manage DeerFlow thread-local filesystem data",
            },
            {
                "name": "agents",
                "description": "Create and manage custom agents with per-agent config and prompts",
            },
            {
                "name": "suggestions",
                "description": "Generate follow-up question suggestions for conversations",
            },
            {
                "name": "channels",
                "description": "Manage IM channel integrations (Feishu, Slack, Telegram)",
            },
            {
                "name": "health",
                "description": "Health check and system status endpoints",
            },
        ],
    )

    # CORS is handled by nginx - no need for FastAPI middleware

    # ── Response-time tracking middleware ──────────────────────────────
    @app.middleware("http")
    async def _timing_middleware(request: Request, call_next):
        """Record Gateway response times per agent so real (not placeholder)
        ``avg_response_time`` / ``responseTimeMs`` can be served by the agents
        router and WebSocket endpoint.
        """
        agent_name: str | None = None
        path = request.url.path

        # Extract agent name from /api/agents/{name} and sub-paths
        if path.startswith("/api/agents/"):
            parts = path.split("/")
            if len(parts) >= 4:
                candidate = parts[3]
                # Skip known sub-routes that are not agent names
                if candidate not in ("compare", "check", ""):
                    agent_name = candidate

        start = time.monotonic()
        try:
            response = await call_next(request)
        finally:
            elapsed = time.monotonic() - start
            if agent_name:
                store = get_timing_store()
                await store.record(agent_name, elapsed)

        return response

    # Include routers
    # WebSocket API (must be registered before other routers to avoid path conflicts)
    app.include_router(ws.router)

    # Models API is mounted at /api/models
    app.include_router(models.router)

    # MCP API is mounted at /api/mcp
    app.include_router(mcp.router)

    # Memory API is mounted at /api/memory
    app.include_router(memory.router)

    # Skills API is mounted at /api/skills
    app.include_router(skills.router)

    # Artifacts API is mounted at /api/threads/{thread_id}/artifacts
    app.include_router(artifacts.router)

    # Uploads API is mounted at /api/threads/{thread_id}/uploads
    app.include_router(uploads.router)

    # Thread cleanup API is mounted at /api/threads/{thread_id}
    app.include_router(threads.router)

    # Agents API is mounted at /api/agents
    app.include_router(agents.router)

    # Suggestions API is mounted at /api/threads/{thread_id}/suggestions
    app.include_router(suggestions.router)

    # Channels API is mounted at /api/channels
    app.include_router(channels.router)

    # Alerts API is mounted at /api/alerts
    app.include_router(alerts.router)

    # Performance API is mounted at /api/performance
    app.include_router(performance.router)

    # Realtime API is mounted at /api/realtime
    app.include_router(realtime.router)

    # Health API is mounted at /api/health
    app.include_router(health.router)

    # Agent Sharing API — includes public endpoint at /api/shared/agents/{token}
    app.include_router(sharing.router)

    # Marketplace API is mounted at /api/marketplace
    app.include_router(marketplace.router)

    # Knowledge Graph API is mounted at /api/electron/kg
    app.include_router(knowledge_graph.router)

    # Knowledge Base API is mounted at /api/electron/kb
    app.include_router(knowledge_base.router)

    # Collaboration API is mounted at /api/electron/collaboration
    app.include_router(collaboration.router)

    # Scheduler API is mounted at /api/electron/scheduler
    app.include_router(scheduler.router)

    # Conversation Memory API is mounted at /api/electron/conversation-memory
    app.include_router(conversation_memory.router)

    # Backup API is mounted at /api/electron/backup
    app.include_router(backup.router)

    # Benchmark API is mounted at /api/electron/benchmark
    app.include_router(benchmark.router)

    # Tools API is mounted at /api/electron/tools
    app.include_router(tools.router)

    # Plugins API is mounted at /api/electron/plugins
    app.include_router(plugins.router)

    # Plugin SDK API is mounted at /api/electron/plugin-sdk
    app.include_router(plugin_sdk.router)

    # Audit API is mounted at /api/electron/audit
    app.include_router(audit.router)

    # Reasoning API is mounted at /api/electron/reasoning
    app.include_router(reasoning.router)

    # Security API is mounted at /api/electron/security
    app.include_router(security.router)

    # Session Export API is mounted at /api/session-export
    app.include_router(session_export.router)

    # Settings API is mounted at /api/electron/settings
    app.include_router(settings_workspace.router)

    # Notifications API is mounted at /api/electron/notifications
    app.include_router(notifications.router)

    # Shortcuts API is mounted at /api/shortcuts
    app.include_router(shortcuts.router)

    # Theme API is mounted at /api/theme
    app.include_router(theme.router)
    app.include_router(onboarding.router)

    @app.get("/health", tags=["health"])
    async def health_check() -> dict:
        """Health check endpoint.

        Returns:
            Service health status information.
        """
        return {"status": "healthy", "service": "deer-flow-gateway"}

    return app


# Create app instance for uvicorn
app = create_app()
