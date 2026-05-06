"""Tool Registry REST API Router.

Provides endpoints for listing tools, analytics, and statistics. Includes mock
tool definitions for the built-in tools available in DeerFlow. Enables browser-mode
access to tool registry outside Electron.

Endpoints
---------
GET  /api/electron/tools            – list/search tools
GET  /api/electron/tools/{id}       – get single tool
GET  /api/electron/tools/analytics  – tool usage analytics
GET  /api/electron/tools/top        – most-used tools
GET  /api/electron/tools/stats      – tool registry statistics
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

router = APIRouter(prefix="/api/electron/tools", tags=["tools"])

_lock = asyncio.Lock()
_persistence_path: Optional[Path] = None

# ── Pydantic models ───────────────────────────────────────────────────


class ToolParameter(BaseModel):
    name: str
    type: str
    description: str
    required: bool = False
    enum: list[str] | None = None
    minimum: float | None = Field(default=None, alias="min")
    maximum: float | None = Field(default=None, alias="max")
    pattern: str | None = None
    default: str | None = None

    model_config = {"populate_by_name": True}


class ToolDefinitionModel(BaseModel):
    id: str
    name: str
    description: str
    category: str
    parameters: list[ToolParameter] = Field(default_factory=list)
    examples: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)
    status: str = "available"
    source: str = "builtin"
    version: str = "1.0.0"
    createdAt: str = ""
    updatedAt: str = ""


class ToolAnalyticsModel(BaseModel):
    toolId: str
    toolName: str
    totalCalls: int = 0
    successCount: int = 0
    errorCount: int = 0
    successRate: float = 1.0
    averageDurationMs: float = 0.0
    lastUsed: str = ""
    errorsByType: dict = Field(default_factory=dict)


class ToolStatsModel(BaseModel):
    totalTools: int = 0
    availableTools: int = 0
    deprecatedTools: int = 0
    experimentalTools: int = 0
    disabledTools: int = 0
    categoryBreakdown: dict = Field(default_factory=dict)
    sourceBreakdown: dict = Field(default_factory=dict)


# ── Mock tool definitions ─────────────────────────────────────────────

_MOCK_TOOLS: list[dict] = [
    {
        "id": "tool-web-search",
        "name": "web_search",
        "description": "Search the web for information using DuckDuckGo or configured search engines",
        "category": "search",
        "parameters": [
            {"name": "query", "type": "string", "description": "Search query string", "required": True},
            {"name": "max_results", "type": "number", "description": "Maximum results to return", "required": False, "default": "10"},
        ],
        "examples": ["Find the latest news about AI", "Search for Python tutorials"],
        "permissions": ["network:outbound"],
        "status": "available",
        "source": "builtin",
        "version": "2.1.0",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-05-01T12:00:00Z",
    },
    {
        "id": "tool-web-fetch",
        "name": "web_fetch",
        "description": "Fetch and extract content from a web URL with HTML-to-Markdown conversion",
        "category": "web",
        "parameters": [
            {"name": "url", "type": "string", "description": "URL to fetch content from", "required": True},
            {"name": "extract_mode", "type": "string", "description": "Extraction mode: text, markdown, or html", "required": False},
        ],
        "permissions": ["network:outbound"],
        "status": "available",
        "source": "builtin",
        "version": "1.8.0",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-04-15T08:00:00Z",
    },
    {
        "id": "tool-present-files",
        "name": "present_files",
        "description": "Present a list of files to the user in the chat interface",
        "category": "file",
        "parameters": [
            {"name": "files", "type": "array", "description": "Array of file paths to present", "required": True},
        ],
        "status": "available",
        "source": "builtin",
        "version": "1.0.0",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-03-01T00:00:00Z",
    },
    {
        "id": "tool-write-todos",
        "name": "write_todos",
        "description": "Create and manage a structured task list for the current session",
        "category": "system",
        "parameters": [
            {"name": "todos", "type": "array", "description": "Array of todo items with content and status", "required": True},
        ],
        "status": "available",
        "source": "builtin",
        "version": "1.2.0",
        "createdAt": "2025-01-15T00:00:00Z",
        "updatedAt": "2025-04-20T00:00:00Z",
    },
    {
        "id": "tool-image-search",
        "name": "image_search",
        "description": "Search for images on the web related to a query",
        "category": "media",
        "parameters": [
            {"name": "query", "type": "string", "description": "Image search query", "required": True},
            {"name": "count", "type": "number", "description": "Number of images to return", "required": False},
        ],
        "permissions": ["network:outbound"],
        "status": "available",
        "source": "builtin",
        "version": "1.5.0",
        "createdAt": "2025-02-01T00:00:00Z",
        "updatedAt": "2025-04-10T00:00:00Z",
    },
    {
        "id": "tool-view-image",
        "name": "view_image",
        "description": "View and analyze an image file",
        "category": "media",
        "parameters": [
            {"name": "path", "type": "string", "description": "Path to the image file", "required": True},
        ],
        "permissions": ["filesystem:read"],
        "status": "available",
        "source": "builtin",
        "version": "1.0.0",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-02-20T00:00:00Z",
    },
    {
        "id": "tool-task",
        "name": "task",
        "description": "Launch a sub-agent to handle complex multi-step tasks autonomously",
        "category": "system",
        "parameters": [
            {"name": "description", "type": "string", "description": "Short description of the task", "required": True},
            {"name": "prompt", "type": "string", "description": "Detailed instructions for the sub-agent", "required": True},
            {"name": "subagent_type", "type": "string", "description": "Type of sub-agent to use", "required": True},
        ],
        "status": "available",
        "source": "builtin",
        "version": "2.0.0",
        "createdAt": "2025-02-01T00:00:00Z",
        "updatedAt": "2025-05-01T00:00:00Z",
    },
    {
        "id": "tool-clarification",
        "name": "clarification",
        "description": "Ask the user for clarification when instructions are ambiguous",
        "category": "communication",
        "parameters": [
            {"name": "question", "type": "string", "description": "Clarification question", "required": True},
        ],
        "status": "available",
        "source": "builtin",
        "version": "1.0.0",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z",
    },
    {
        "id": "tool-skill-search",
        "name": "skill_search",
        "description": "Search the installed skills directory for relevant capabilities",
        "category": "system",
        "parameters": [
            {"name": "query", "type": "string", "description": "Search query for skills", "required": True},
        ],
        "status": "experimental",
        "source": "builtin",
        "version": "0.9.0",
        "createdAt": "2025-03-01T00:00:00Z",
        "updatedAt": "2025-04-01T00:00:00Z",
    },
    {
        "id": "tool-code-exec",
        "name": "code_executor",
        "description": "Execute code in a sandboxed environment and return results",
        "category": "code",
        "parameters": [
            {"name": "language", "type": "string", "description": "Programming language", "required": True},
            {"name": "code", "type": "string", "description": "Code to execute", "required": True},
            {"name": "timeout", "type": "number", "description": "Execution timeout in seconds", "required": False},
        ],
        "permissions": ["sandbox:execute"],
        "status": "experimental",
        "source": "builtin",
        "version": "1.3.0",
        "createdAt": "2025-02-15T00:00:00Z",
        "updatedAt": "2025-04-01T00:00:00Z",
    },
    {
        "id": "tool-mcp-list",
        "name": "mcp_list_tools",
        "description": "List all available MCP (Model Context Protocol) tools",
        "category": "system",
        "parameters": [],
        "status": "available",
        "source": "mcp",
        "version": "1.0.0",
        "createdAt": "2025-03-15T00:00:00Z",
        "updatedAt": "2025-04-01T00:00:00Z",
    },
    {
        "id": "tool-file-read",
        "name": "file_read",
        "description": "Read file contents from the filesystem with line offsets and limits",
        "category": "file",
        "parameters": [
            {"name": "file_path", "type": "string", "description": "Absolute path to the file", "required": True},
            {"name": "offset", "type": "number", "description": "Line offset to start reading from", "required": False},
            {"name": "limit", "type": "number", "description": "Maximum lines to read", "required": False},
        ],
        "permissions": ["filesystem:read"],
        "status": "available",
        "source": "builtin",
        "version": "2.0.0",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-05-01T00:00:00Z",
    },
    {
        "id": "tool-file-write",
        "name": "file_write",
        "description": "Write content to a file on the filesystem",
        "category": "file",
        "parameters": [
            {"name": "file_path", "type": "string", "description": "Absolute path to write to", "required": True},
            {"name": "content", "type": "string", "description": "File content", "required": True},
        ],
        "permissions": ["filesystem:write"],
        "status": "available",
        "source": "builtin",
        "version": "1.5.0",
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-04-01T00:00:00Z",
    },
    {
        "id": "tool-data-query",
        "name": "data_query",
        "description": "Query structured data using natural language (experimental)",
        "category": "data",
        "parameters": [
            {"name": "query", "type": "string", "description": "Natural language query", "required": True},
            {"name": "source", "type": "string", "description": "Data source identifier", "required": False},
        ],
        "status": "experimental",
        "source": "builtin",
        "version": "0.5.0",
        "createdAt": "2025-04-01T00:00:00Z",
        "updatedAt": "2025-05-01T00:00:00Z",
    },
    {
        "id": "tool-deprecated-ftp",
        "name": "ftp_upload",
        "description": "Upload files via FTP (deprecated in favor of cloud storage plugins)",
        "category": "file",
        "parameters": [
            {"name": "host", "type": "string", "description": "FTP host", "required": True},
            {"name": "file_path", "type": "string", "description": "Local file path", "required": True},
        ],
        "status": "deprecated",
        "source": "builtin",
        "version": "0.8.0",
        "createdAt": "2024-06-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z",
    },
]


# ── Mock analytics ─────────────────────────────────────────────────────

def _generate_analytics() -> list[dict]:
    """Generate realistic mock analytics for built-in tools."""
    import random
    rng = random.Random(42)  # Deterministic seed

    analytics: list[dict] = []
    for tool in _MOCK_TOOLS:
        total = rng.randint(100, 5000)
        errors = rng.randint(0, int(total * 0.15))
        analytics.append({
            "toolId": tool["id"],
            "toolName": tool["name"],
            "totalCalls": total,
            "successCount": total - errors,
            "errorCount": errors,
            "successRate": round((total - errors) / total, 3),
            "averageDurationMs": round(rng.uniform(50, 5000), 1),
            "lastUsed": "2025-05-03T08:00:00Z",
            "errorsByType": {"timeout": rng.randint(0, max(1, errors // 3)), "parse_error": rng.randint(0, max(1, errors // 3))},
        })
    return analytics


# ── Stats computation ──────────────────────────────────────────────────


def _compute_stats() -> dict:
    tools = _MOCK_TOOLS
    total = len(tools)

    by_status = {"available": 0, "deprecated": 0, "experimental": 0, "disabled": 0}
    by_category: dict[str, int] = {}
    by_source: dict[str, int] = {}

    for t in tools:
        status = t.get("status", "available")
        by_status[status] = by_status.get(status, 0) + 1
        cat = t.get("category", "unknown")
        by_category[cat] = by_category.get(cat, 0) + 1
        src = t.get("source", "builtin")
        by_source[src] = by_source.get(src, 0) + 1

    return {
        "totalTools": total,
        "availableTools": by_status.get("available", 0),
        "deprecatedTools": by_status.get("deprecated", 0),
        "experimentalTools": by_status.get("experimental", 0),
        "disabledTools": by_status.get("disabled", 0),
        "categoryBreakdown": by_category,
        "sourceBreakdown": by_source,
    }


# ── Endpoints ──────────────────────────────────────────────────────────


@router.get("")
async def list_tools(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    status: str | None = Query(default=None),
    source: str | None = Query(default=None),
    limit: int = Query(default=200, ge=1),
):
    """List/search tool definitions."""
    results = list(_MOCK_TOOLS)

    if search:
        q = search.lower()
        results = [
            t for t in results
            if q in t["name"].lower() or q in t["description"].lower() or q in t["category"].lower()
        ]
    if category:
        results = [t for t in results if t.get("category") == category]
    if status:
        results = [t for t in results if t.get("status") == status]
    if source:
        results = [t for t in results if t.get("source") == source]

    return results[:limit]


@router.get("/{tool_id}")
async def get_tool(tool_id: str):
    """Get a single tool definition by ID."""
    for t in _MOCK_TOOLS:
        if t["id"] == tool_id:
            return t
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Tool not found")


@router.get("/analytics")
async def get_analytics():
    """Get usage analytics for all tools."""
    return _generate_analytics()


@router.get("/top")
async def get_top_tools(limit: int = Query(default=10, ge=1)):
    """Get most-used tools ranked by call count."""
    analytics = _generate_analytics()
    sorted_analytics = sorted(analytics, key=lambda a: -a["totalCalls"])
    return sorted_analytics[:limit]


@router.get("/stats")
async def get_stats():
    """Get tool registry statistics."""
    return _compute_stats()
