"""Conversation Memory REST API Router.

Provides CRUD endpoints for conversation memory entries (facts, preferences,
relationships, events, concepts) with JSON-file persistence. Enables browser-mode
access to conversation memory data outside Electron.

Endpoints
---------
GET    /api/electron/conversation-memory           – query memory entries
GET    /api/electron/conversation-memory/{id}      – get single entry
PATCH  /api/electron/conversation-memory/{id}      – update entry
DELETE /api/electron/conversation-memory/{id}      – delete entry
GET    /api/electron/conversation-memory/stats     – memory statistics
GET    /api/electron/conversation-memory/topics    – extracted topics
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/electron/conversation-memory", tags=["conversation-memory"])

_lock = asyncio.Lock()
_memories: dict[str, dict] = {}
_persistence_path: Optional[Path] = None

# ── Pydantic models ───────────────────────────────────────────────────


class MemoryEntryModel(BaseModel):
    id: str | None = None
    type: str = Field(..., description="fact|preference|relationship|event|concept")
    content: str = Field(..., min_length=1)
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    importance: float = Field(default=0.5, ge=0.0, le=1.0)
    tags: list[str] = Field(default_factory=list)
    relatedMemoryIds: list[str] = Field(default_factory=list, alias="relatedMemoryIds")
    sessionId: str | None = Field(default=None, alias="sessionId")
    sourceSegmentId: str | None = Field(default=None, alias="sourceSegmentId")
    decayFactor: float = Field(default=0.05, ge=0.0, le=1.0, alias="decayFactor")

    model_config = {"populate_by_name": True}


class UpdateMemoryRequest(BaseModel):
    content: str | None = None
    tags: list[str] | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    importance: float | None = Field(default=None, ge=0.0, le=1.0)
    relatedMemoryIds: list[str] | None = Field(default=None, alias="relatedMemoryIds")
    decayFactor: float | None = Field(default=None, ge=0.0, le=1.0, alias="decayFactor")

    model_config = {"populate_by_name": True}


class MemoryQueryParams(BaseModel):
    type: str | None = None
    tags: list[str] | None = None
    search: str | None = None
    minConfidence: float | None = Field(default=None, ge=0.0, le=1.0, alias="minConfidence")
    minImportance: float | None = Field(default=None, ge=0.0, le=1.0, alias="minImportance")
    sessionId: str | None = Field(default=None, alias="sessionId")
    limit: int = Field(default=200, ge=1)

    model_config = {"populate_by_name": True}


class MemoryStatsResponse(BaseModel):
    totalMemories: int = 0
    byType: dict = Field(default_factory=dict)
    averageConfidence: float = 0.0
    averageImportance: float = 0.0
    totalAccesses: int = 0
    recentlyCreated: int = 0
    recentlyAccessed: int = 0
    totalTopics: int = 0
    totalSummaries: int = 0


# ── persistence helpers ───────────────────────────────────────────────


def _get_persistence_path() -> Path:
    global _persistence_path
    if _persistence_path is None:
        try:
            base = get_paths().base_dir
        except Exception:
            base = Path(".")
        _persistence_path = base / "conversation_memory.json"
    return _persistence_path


async def _load_state() -> None:
    path = _get_persistence_path()
    if not path.exists():
        return
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        logger.exception("Failed to read conversation_memory.json")
        return
    for m in data.get("memories", []):
        if isinstance(m, dict) and m.get("id"):
            _memories[m["id"]] = m
    logger.info("Loaded %d conversation memory entries", len(_memories))


async def _save_state() -> None:
    path = _get_persistence_path()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "memories": list(_memories.values()),
            "updatedAt": time.time(),
        }
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist conversation memory state")


def _now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


# ── Query builder ─────────────────────────────────────────────────────


def _match_query(m: dict, q: dict) -> bool:
    """Check if a memory entry matches the given query parameters."""
    entry_type = m.get("type", "")
    entry_tags = set(m.get("tags", []))
    entry_conf = m.get("confidence", 0)
    entry_imp = m.get("importance", 0)
    entry_sid = m.get("sessionId", "")

    # Type filter
    if q.get("type") and entry_type != q["type"]:
        return False

    # Tags filter (all specified tags must be present)
    if q.get("tags"):
        req_tags = set(q["tags"])
        if not req_tags.issubset(entry_tags):
            return False

    # Confidence threshold
    if q.get("minConfidence") is not None and entry_conf < q["minConfidence"]:
        return False

    # Importance threshold
    if q.get("minImportance") is not None and entry_imp < q["minImportance"]:
        return False

    # Session filter
    if q.get("sessionId") and entry_sid != q["sessionId"]:
        return False

    # Full-text search
    if q.get("search"):
        search = q["search"].lower()
        hay = json.dumps(m).lower()
        if search not in hay:
            return False

    return True


# ── CRUD endpoints ────────────────────────────────────────────────────


@router.post("")
async def create_memory(req: MemoryEntryModel):
    """Create a new conversation memory entry."""
    async with _lock:
        mid = str(uuid.uuid4())
        now = _now_iso()
        memory: dict = {
            "id": mid,
            "type": req.type,
            "content": req.content,
            "confidence": req.confidence,
            "importance": req.importance,
            "tags": req.tags,
            "relatedMemoryIds": req.relatedMemoryIds,
            "sessionId": req.sessionId,
            "sourceSegmentId": req.sourceSegmentId,
            "decayFactor": req.decayFactor,
            "createdAt": now,
            "updatedAt": now,
            "lastAccessed": now,
            "accessCount": 0,
        }
        _memories[mid] = memory
        await _save_state()
        return memory


@router.get("")
async def query_memories(
    type: str | None = Query(default=None),
    search: str | None = Query(default=None),
    minConfidence: float | None = Query(default=None, alias="minConfidence"),
    minImportance: float | None = Query(default=None, alias="minImportance"),
    sessionId: str | None = Query(default=None, alias="sessionId"),
    tags: str | None = Query(default=None, description="Comma-separated tag list"),
    limit: int = Query(default=200, ge=1),
):
    """Search/query conversation memory entries."""
    q: dict = {
        "type": type,
        "search": search,
        "minConfidence": minConfidence,
        "minImportance": minImportance,
        "sessionId": sessionId,
        "tags": [t.strip() for t in tags.split(",") if t.strip()] if tags else None,
    }
    results = [m for m in _memories.values() if _match_query(m, q)]
    return results[:limit]


@router.get("/{memory_id}")
async def get_memory(memory_id: str):
    """Get a single memory entry by ID."""
    m = _memories.get(memory_id)
    if m is None:
        raise HTTPException(status_code=404, detail="Memory entry not found")
    m["accessCount"] = m.get("accessCount", 0) + 1
    m["lastAccessed"] = _now_iso()
    return m


@router.patch("/{memory_id}")
async def update_memory(memory_id: str, req: UpdateMemoryRequest):
    """Update a memory entry's mutable fields."""
    async with _lock:
        m = _memories.get(memory_id)
        if m is None:
            raise HTTPException(status_code=404, detail="Memory entry not found")
        for field in ("content", "tags", "confidence", "importance", "relatedMemoryIds", "decayFactor"):
            val = getattr(req, field, None)
            if val is not None:
                m[field] = val
        m["updatedAt"] = _now_iso()
        await _save_state()
        return {"success": True}


@router.delete("/{memory_id}")
async def delete_memory(memory_id: str):
    """Delete a memory entry."""
    async with _lock:
        if memory_id not in _memories:
            raise HTTPException(status_code=404, detail="Memory entry not found")
        del _memories[memory_id]
        await _save_state()
        return {"success": True}


# ── Stats endpoint ────────────────────────────────────────────────────


@router.get("/stats")
async def get_stats() -> MemoryStatsResponse:
    """Get conversation memory statistics."""
    total = len(_memories)
    by_type: dict[str, int] = {}
    confidences: list[float] = []
    importances: list[float] = []
    total_accesses = 0
    now_ts = time.time()
    recently_created = 0
    recently_accessed = 0
    day_secs = 86400  # 24 hours

    for m in _memories.values():
        t = m.get("type", "unknown")
        by_type[t] = by_type.get(t, 0) + 1
        confidences.append(m.get("confidence", 0))
        importances.append(m.get("importance", 0))
        total_accesses += m.get("accessCount", 0)

        # Recently created (last 24h)
        created = m.get("createdAt", "")
        if created:
            try:
                from datetime import datetime, timezone
                dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
                if (now_ts - dt.timestamp()) < day_secs:
                    recently_created += 1
            except Exception:
                pass

        # Recently accessed (last 24h)
        accessed = m.get("lastAccessed", "")
        if accessed:
            try:
                from datetime import datetime, timezone
                dt = datetime.fromisoformat(accessed.replace("Z", "+00:00"))
                if (now_ts - dt.timestamp()) < day_secs:
                    recently_accessed += 1
            except Exception:
                pass

    avg_conf = sum(confidences) / len(confidences) if confidences else 0.0
    avg_imp = sum(importances) / len(importances) if importances else 0.0

    # Compute topic count from keyword extraction across all memories
    keywords: set[str] = set()
    for m in _memories.values():
        content = m.get("content", "")
        words = re.findall(r"\b\w{4,}\b", content.lower())
        keywords.update(words)
    total_topics = len(keywords)

    # Summaries: count memory entries with summary-like content (long content with key structural patterns)
    total_summaries = sum(
        1 for m in _memories.values()
        if len(m.get("content", "")) > 200 and m.get("type") in ("event", "concept")
    )

    return MemoryStatsResponse(
        totalMemories=total,
        byType=by_type,
        averageConfidence=round(avg_conf, 3),
        averageImportance=round(avg_imp, 3),
        totalAccesses=total_accesses,
        recentlyCreated=recently_created,
        recentlyAccessed=recently_accessed,
        totalTopics=total_topics,
        totalSummaries=total_summaries,
    )


# ── Topics endpoint ───────────────────────────────────────────────────


@router.get("/topics")
async def get_topics(
    sessionId: str | None = Query(default=None, alias="sessionId"),
    limit: int = Query(default=20, ge=1),
):
    """Extract topics from memory entries (simple keyword-based)."""
    # Build keyword corpus from all memory entries
    keyword_scores: dict[str, float] = {}
    for m in _memories.values():
        if sessionId and m.get("sessionId") != sessionId:
            continue
        content = m.get("content", "")
        words = re.findall(r"\b\w{4,}\b", content.lower())
        conf = m.get("confidence", 0.5)
        for w in words:
            if w in keyword_scores:
                keyword_scores[w] += conf
            else:
                keyword_scores[w] = conf

    sorted_keywords = sorted(keyword_scores.items(), key=lambda x: -x[1])[:limit]

    # Group into simple topics
    topics: list[dict] = []
    for i, (kw, score) in enumerate(sorted_keywords):
        topics.append({
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, f"topic-{kw}")),
            "name": kw.capitalize(),
            "keywords": [kw],
            "confidence": min(score / 10, 1.0),
            "firstMentionedAt": _now_iso(),
            "lastMentionedAt": _now_iso(),
            "mentionCount": 1,
            "relatedTopics": [],
        })
    return topics
