"""
Marketplace router — aggregate agents, templates, plugins, and skills
into a browsable marketplace view.
"""

import logging
from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..routers.agents import list_custom_agents

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/marketplace", tags=["Marketplace"])

# ── Types ──────────────────────────────────────────────────────────────────

MarketplaceType = Literal["agent", "plugin", "skill", "template"]
InstallStatus = Literal["not_installed", "installed", "installing", "updating", "uninstalling", "error"]
SortBy = Literal["popular", "rated", "recent", "name"]
ItemSource = Literal["builtin", "community", "local"]


class CompatibilityInfo(BaseModel):
    minAppVersion: str = "1.0.0"
    platforms: list[str] = ["web", "windows", "macos", "linux"]


class DependencyInfo(BaseModel):
    id: str
    versionRange: str
    optional: bool = False


class MarketplaceItem(BaseModel):
    id: str
    name: str
    description: str
    author: str
    version: str
    type: MarketplaceType
    category: str
    tags: list[str] = []
    downloads: int = 0
    rating: float = 0.0
    ratingCount: int = 0
    installStatus: InstallStatus = "not_installed"
    installedVersion: str | None = None
    updatedAt: str = ""
    size: int = 0
    compatibility: CompatibilityInfo = CompatibilityInfo()
    dependencies: list[DependencyInfo] = []
    permissions: list[str] = []
    hooks: list[str] = []
    source: ItemSource = "local"


class MarketplaceItemsResponse(BaseModel):
    items: list[MarketplaceItem]
    total: int


class MarketplaceStats(BaseModel):
    totalItems: int
    installedCount: int
    totalPlugins: int
    totalSkills: int
    totalTemplates: int
    totalAgents: int


# ── Mock data generators ──────────────────────────────────────────────────

_MOCK_PLUGINS = [
    {
        "id": "plugin-web-search",
        "name": "Web Search Pro",
        "description": "Enhanced web search with multi-engine support, result caching, and domain filtering.",
        "author": "DeerFlow Labs",
        "version": "2.1.3",
        "type": "plugin",
        "category": "search",
        "tags": ["web", "search", "browser", "scraping"],
        "downloads": 4520,
        "rating": 4.7,
        "ratingCount": 312,
        "source": "community",
        "permissions": ["network", "filesystem"],
        "hooks": ["on_search", "on_result"],
    },
    {
        "id": "plugin-file-manager",
        "name": "File Manager Plus",
        "description": "Advanced file operations with cloud storage integration and batch processing.",
        "author": "DeerFlow Labs",
        "version": "1.5.0",
        "type": "plugin",
        "category": "system",
        "tags": ["files", "storage", "cloud", "batch"],
        "downloads": 3210,
        "rating": 4.4,
        "ratingCount": 198,
        "source": "community",
        "permissions": ["filesystem", "network"],
        "hooks": ["on_file_create", "on_file_delete"],
    },
    {
        "id": "plugin-excel-tools",
        "name": "Excel Tools",
        "description": "Create, read, and analyze Excel spreadsheets with formula support and chart generation.",
        "author": "DeerFlow Labs",
        "version": "1.8.2",
        "type": "plugin",
        "category": "data",
        "tags": ["excel", "spreadsheet", "data", "charts"],
        "downloads": 2890,
        "rating": 4.5,
        "ratingCount": 245,
        "source": "builtin",
        "permissions": ["filesystem"],
        "hooks": ["on_spreadsheet_open"],
    },
    {
        "id": "plugin-ppt-generator",
        "name": "PPT Generator",
        "description": "Generate professional presentations from markdown or AI-generated content.",
        "author": "Community",
        "version": "0.9.1",
        "type": "plugin",
        "category": "creative",
        "tags": ["ppt", "presentation", "slides", "markdown"],
        "downloads": 1870,
        "rating": 4.2,
        "ratingCount": 89,
        "source": "community",
        "permissions": ["filesystem"],
        "hooks": ["on_slide_create"],
    },
    {
        "id": "plugin-code-interpreter",
        "name": "Code Interpreter",
        "description": "Execute and analyze code in a sandboxed environment with real-time output streaming.",
        "author": "DeerFlow Labs",
        "version": "2.0.0",
        "type": "plugin",
        "category": "development",
        "tags": ["code", "python", "sandbox", "execution"],
        "downloads": 5670,
        "rating": 4.9,
        "ratingCount": 456,
        "source": "builtin",
        "permissions": ["exec", "network", "filesystem"],
        "hooks": ["on_exec", "on_complete"],
    },
]

_MOCK_SKILLS = [
    {
        "id": "skill-data-analyst",
        "name": "Data Analyst",
        "description": "Analyze datasets, generate statistical summaries, and create data visualizations.",
        "author": "DeerFlow",
        "version": "1.2.0",
        "type": "skill",
        "category": "data",
        "tags": ["data", "analytics", "statistics", "visualization"],
        "downloads": 3890,
        "rating": 4.6,
        "ratingCount": 278,
        "source": "builtin",
        "permissions": ["filesystem", "network"],
        "hooks": ["on_analyze"],
    },
    {
        "id": "skill-pdf-toolkit",
        "name": "PDF Toolkit",
        "description": "Comprehensive PDF manipulation: extract, merge, split, and fill forms.",
        "author": "DeerFlow",
        "version": "1.0.0",
        "type": "skill",
        "category": "productivity",
        "tags": ["pdf", "document", "merge", "extract"],
        "downloads": 2150,
        "rating": 4.3,
        "ratingCount": 156,
        "source": "builtin",
        "permissions": ["filesystem"],
        "hooks": ["on_pdf_process"],
    },
    {
        "id": "skill-translator",
        "name": "Multi-Language Translator",
        "description": "Translate text between 50+ languages with context-aware accuracy.",
        "author": "Community",
        "version": "1.1.0",
        "type": "skill",
        "category": "productivity",
        "tags": ["translate", "language", "i18n"],
        "downloads": 4100,
        "rating": 4.5,
        "ratingCount": 334,
        "source": "community",
        "permissions": ["network"],
        "hooks": ["on_translate"],
    },
]

_MOCK_TEMPLATES = [
    {
        "id": "template-code-review",
        "name": "Code Review Assistant",
        "description": "Session template for reviewing code changes with structured feedback.",
        "author": "DeerFlow",
        "version": "1.0.0",
        "type": "template",
        "category": "development",
        "tags": ["code", "review", "development"],
        "downloads": 1280,
        "rating": 4.8,
        "ratingCount": 95,
        "source": "builtin",
        "permissions": [],
        "hooks": [],
    },
    {
        "id": "template-research-deep-dive",
        "name": "Research Deep Dive",
        "description": "Structured workflow for comprehensive research with source tracking and citation management.",
        "author": "DeerFlow",
        "version": "1.1.0",
        "type": "template",
        "category": "research",
        "tags": ["research", "analysis", "citations"],
        "downloads": 980,
        "rating": 4.4,
        "ratingCount": 67,
        "source": "builtin",
        "permissions": ["network"],
        "hooks": [],
    },
    {
        "id": "template-presentation-builder",
        "name": "Presentation Builder",
        "description": "Create structured presentations from outlines with AI-generated slide content.",
        "author": "Community",
        "version": "0.8.0",
        "type": "template",
        "category": "creative",
        "tags": ["presentation", "slides", "creative"],
        "downloads": 750,
        "rating": 4.1,
        "ratingCount": 43,
        "source": "community",
        "permissions": ["filesystem"],
        "hooks": ["on_slide_generate"],
    },
    {
        "id": "template-weekly-report",
        "name": "Weekly Report Generator",
        "description": "Automatically compile weekly activity into a structured report with charts and summaries.",
        "author": "DeerFlow",
        "version": "1.3.0",
        "type": "template",
        "category": "business",
        "tags": ["report", "weekly", "business", "summary"],
        "downloads": 1560,
        "rating": 4.6,
        "ratingCount": 112,
        "source": "builtin",
        "permissions": ["filesystem"],
        "hooks": ["on_report_generate"],
    },
]


def _make_agent_items() -> list[MarketplaceItem]:
    """Convert installed agents into marketplace items."""
    items: list[MarketplaceItem] = []
    try:
        agents = list_custom_agents()
        for agent_cfg in agents:
            model_tag = agent_cfg.model if agent_cfg.model else ""
            items.append(
                MarketplaceItem(
                    id=f"agent-{agent_cfg.name}",
                    name=agent_cfg.name.title().replace("-", " "),
                    description=agent_cfg.description or f"AI agent powered by {model_tag or 'LLM'}",
                    author="You",
                    version="1.0.0",
                    type="agent",
                    category="agent",
                    tags=[model_tag] if model_tag else ["llm"],
                    downloads=0,
                    rating=0.0,
                    ratingCount=0,
                    installStatus="installed",
                    installedVersion="1.0.0",
                    updatedAt="",
                    size=0,
                    source="local",
                    permissions=[],
                    hooks=[],
                )
            )
    except Exception as e:
        logger.warning(f"Failed to load agents for marketplace: {e}")
    return items


def _make_mock_items(mock_list: list[dict]) -> list[MarketplaceItem]:
    """Convert mock dicts into MarketplaceItems with timestamps."""
    import datetime

    now = datetime.datetime.now(datetime.timezone.utc)
    items: list[MarketplaceItem] = []
    for i, m in enumerate(mock_list):
        offset = datetime.timedelta(days=i * 7)
        updated = (now - offset).strftime("%Y-%m-%dT%H:%M:%SZ")
        install_status: InstallStatus = "installed" if m.get("source") == "builtin" else "not_installed"
        items.append(
            MarketplaceItem(
                id=m["id"],
                name=m["name"],
                description=m["description"],
                author=m["author"],
                version=m["version"],
                type=m["type"],
                category=m["category"],
                tags=m.get("tags", []),
                downloads=m.get("downloads", 0),
                rating=m.get("rating", 0.0),
                ratingCount=m.get("ratingCount", 0),
                installStatus=install_status,
                installedVersion=m["version"] if install_status == "installed" else None,
                updatedAt=updated,
                size=m.get("size", 0),
                source=m.get("source", "community"),
                permissions=m.get("permissions", []),
                hooks=m.get("hooks", []),
            )
        )
    return items


def _get_all_items() -> list[MarketplaceItem]:
    """Aggregate all items: real agents + mock plugins/skills/templates."""
    return (
        _make_agent_items()
        + _make_mock_items(_MOCK_PLUGINS)
        + _make_mock_items(_MOCK_SKILLS)
        + _make_mock_items(_MOCK_TEMPLATES)
    )


# ── Endpoints ──────────────────────────────────────────────────────────────


@router.get("/items", response_model=MarketplaceItemsResponse)
async def get_items(
    type: str | None = Query(None, description="Filter by item type"),
    category: str | None = Query(None, description="Filter by category"),
    search: str | None = Query(None, description="Search by name, description, or tags"),
    sortBy: SortBy = Query("popular", description="Sort order"),
):
    """List marketplace items with optional filtering and sorting."""
    all_items = _get_all_items()

    # Filter
    if type:
        all_items = [i for i in all_items if i.type == type]
    if category:
        all_items = [i for i in all_items if i.category.lower() == category.lower()]
    if search:
        q = search.lower()
        all_items = [
            i
            for i in all_items
            if q in i.name.lower()
            or q in i.description.lower()
            or any(q in t.lower() for t in i.tags)
        ]

    # Sort
    if sortBy == "popular":
        all_items.sort(key=lambda i: i.downloads, reverse=True)
    elif sortBy == "rated":
        all_items.sort(key=lambda i: i.rating, reverse=True)
    elif sortBy == "recent":
        all_items.sort(key=lambda i: i.updatedAt, reverse=True)
    elif sortBy == "name":
        all_items.sort(key=lambda i: i.name.lower())

    return MarketplaceItemsResponse(items=all_items, total=len(all_items))


@router.get("/stats", response_model=MarketplaceStats)
async def get_stats():
    """Return aggregate marketplace statistics."""
    all_items = _get_all_items()
    installed = [i for i in all_items if i.installStatus == "installed"]
    return MarketplaceStats(
        totalItems=len(all_items),
        installedCount=len(installed),
        totalPlugins=sum(1 for i in all_items if i.type == "plugin"),
        totalSkills=sum(1 for i in all_items if i.type == "skill"),
        totalTemplates=sum(1 for i in all_items if i.type == "template"),
        totalAgents=sum(1 for i in all_items if i.type == "agent"),
    )


@router.get("/categories")
async def get_categories():
    """Return all unique categories across marketplace items."""
    all_items = _get_all_items()
    categories = sorted({i.category for i in all_items if i.category})
    return {"categories": categories}
