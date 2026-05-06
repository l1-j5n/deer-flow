"""Knowledge Graph REST API Router.

Provides CRUD endpoints for entities, relations, stats, and visualization
export. Uses JSON-file persistence for browser-mode support (outside Electron).

Endpoints
---------
GET    /api/electron/kg/entities/search  – search entities
POST   /api/electron/kg/entities         – create entity
GET    /api/electron/kg/entities/{id}    – get entity
PATCH  /api/electron/kg/entities/{id}    – update entity
DELETE /api/electron/kg/entities/{id}    – delete entity
GET    /api/electron/kg/entities/{id}/neighbors – get neighbors
POST   /api/electron/kg/relations        – create relation
GET    /api/electron/kg/relations        – query relations
GET    /api/electron/kg/stats            – graph statistics
GET    /api/electron/kg/export/viz       – visualization export
GET    /api/electron/kg/export           – full graph export
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/electron/kg", tags=["knowledge-graph"])

_lock = asyncio.Lock()

# In-memory storage
_entities: dict[str, dict] = {}
_relations: dict[str, dict] = {}
_persistence_path: Optional[Path] = None

# ── Pydantic models ───────────────────────────────────────────────────


class CreateEntityRequest(BaseModel):
    name: str = Field(..., min_length=1, description="Entity name")
    type: str = Field(..., description="Entity type (e.g. person, organization)")
    aliases: list[str] = Field(default_factory=list)
    description: str | None = None
    properties: dict = Field(default_factory=dict)
    source: str | None = None
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)


class UpdateEntityRequest(BaseModel):
    name: str | None = None
    type: str | None = None
    aliases: list[str] | None = None
    description: str | None = None
    properties: dict | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)


class CreateRelationRequest(BaseModel):
    sourceId: str = Field(..., alias="sourceId")
    targetId: str = Field(..., alias="targetId")
    type: str = Field(..., description="Relation type")
    properties: dict = Field(default_factory=dict)
    confidence: float = Field(default=0.5, ge=0.0, le=1.0)
    source: str | None = None

    model_config = {"populate_by_name": True}


class GraphStatsResponse(BaseModel):
    totalEntities: int = 0
    totalRelations: int = 0
    entityTypes: dict = Field(default_factory=dict)
    relationTypes: dict = Field(default_factory=dict)
    averageConfidence: float = 0.0
    orphanedEntities: int = 0
    mostConnected: list[dict] = Field(default_factory=list)


# ── persistence helpers ───────────────────────────────────────────────


def _get_persistence_path() -> Path:
    global _persistence_path
    if _persistence_path is None:
        try:
            base = get_paths().base_dir
        except Exception:
            base = Path(".")
        _persistence_path = base / "knowledge_graph.json"
    return _persistence_path


async def _load_state() -> None:
    path = _get_persistence_path()
    if not path.exists():
        return
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        logger.exception("Failed to read knowledge_graph.json")
        return
    entities_raw = data.get("entities", [])
    for e in entities_raw:
        if isinstance(e, dict) and e.get("id"):
            _entities[e["id"]] = e
    relations_raw = data.get("relations", [])
    for r in relations_raw:
        if isinstance(r, dict) and r.get("id"):
            _relations[r["id"]] = r
    logger.info("Loaded %d entities and %d relations from knowledge_graph.json",
                len(_entities), len(_relations))


async def _save_state() -> None:
    path = _get_persistence_path()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "entities": list(_entities.values()),
            "relations": list(_relations.values()),
            "updatedAt": time.time(),
        }
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist knowledge graph state")


def _now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


# ── Entity endpoints ──────────────────────────────────────────────────


@router.post("/entities")
async def create_entity(req: CreateEntityRequest):
    async with _lock:
        eid = str(uuid.uuid4())
        now = _now_iso()
        entity = {
            "id": eid,
            "name": req.name,
            "type": req.type,
            "aliases": req.aliases,
            "description": req.description,
            "properties": req.properties,
            "source": req.source,
            "confidence": req.confidence,
            "createdAt": now,
            "updatedAt": now,
            "accessCount": 0,
            "lastAccessed": now,
        }
        _entities[eid] = entity
        await _save_state()
        return entity


@router.get("/entities/{entity_id}")
async def get_entity(entity_id: str):
    entity = _entities.get(entity_id)
    if entity is None:
        raise HTTPException(status_code=404, detail="Entity not found")
    entity["accessCount"] = entity.get("accessCount", 0) + 1
    return entity


@router.get("/entities/search")
async def search_entities(
    name: str | None = Query(default=None),
    type: str | None = Query(default=None),
    search: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1),
    minConfidence: float = Query(default=0.0, ge=0.0, le=1.0, alias="minConfidence"),
):
    results: list[dict] = []
    for e in _entities.values():
        conf = e.get("confidence", 0)
        if conf < minConfidence:
            continue
        if type and e.get("type") != type:
            continue
        if name and name.lower() not in e.get("name", "").lower():
            continue
        if search:
            hay = json.dumps(e).lower()
            if search.lower() not in hay:
                continue
        results.append(dict(e))
    return results[:limit]


@router.patch("/entities/{entity_id}")
async def update_entity(entity_id: str, req: UpdateEntityRequest):
    async with _lock:
        if entity_id not in _entities:
            raise HTTPException(status_code=404, detail="Entity not found")
        e = _entities[entity_id]
        for field in ("name", "type", "aliases", "description", "properties", "confidence"):
            val = getattr(req, field, None)
            if val is not None:
                e[field] = val
        e["updatedAt"] = _now_iso()
        await _save_state()
        return e


@router.delete("/entities/{entity_id}")
async def delete_entity(entity_id: str):
    async with _lock:
        if entity_id not in _entities:
            raise HTTPException(status_code=404, detail="Entity not found")
        del _entities[entity_id]
        # Remove related relations
        to_del = [rid for rid, r in _relations.items()
                  if r.get("sourceId") == entity_id or r.get("targetId") == entity_id]
        for rid in to_del:
            del _relations[rid]
        await _save_state()
        return {"success": True}


@router.get("/entities/{entity_id}/neighbors")
async def get_neighbors(entity_id: str):
    if entity_id not in _entities:
        return []
    neighbors: list[dict] = []
    for r in _relations.values():
        if r.get("sourceId") == entity_id:
            tid = r.get("targetId")
            if tid and tid in _entities:
                neighbors.append({
                    "entity": dict(_entities[tid]),
                    "relation": dict(r),
                    "direction": "out",
                })
        elif r.get("targetId") == entity_id:
            sid = r.get("sourceId")
            if sid and sid in _entities:
                neighbors.append({
                    "entity": dict(_entities[sid]),
                    "relation": dict(r),
                    "direction": "in",
                })
    return neighbors


@router.get("/entities/by-doc/{doc_id}")
async def get_entities_by_document(doc_id: str) -> list[dict]:
    """Return all KG entities linked to a specific Knowledge Base document.

    Entities created during document upload store sourceDocId in their
    properties. This endpoint queries by that property.
    """
    results: list[dict] = []
    for e in _entities.values():
        props = e.get("properties", {})
        if isinstance(props, dict) and props.get("sourceDocId") == doc_id:
            results.append(dict(e))
    return results


# ── Relation endpoints ────────────────────────────────────────────────


@router.post("/relations")
async def create_relation(req: CreateRelationRequest):
    async with _lock:
        sid = req.sourceId
        tid = req.targetId
        if sid not in _entities or tid not in _entities:
            raise HTTPException(status_code=400, detail="Source or target entity not found")
        rid = str(uuid.uuid4())
        now = _now_iso()
        relation = {
            "id": rid,
            "sourceId": sid,
            "targetId": tid,
            "type": req.type,
            "properties": req.properties,
            "confidence": req.confidence,
            "source": req.source,
            "createdAt": now,
            "updatedAt": now,
        }
        _relations[rid] = relation
        await _save_state()
        return relation


@router.get("/relations")
async def query_relations(
    sourceId: str | None = Query(default=None, alias="sourceId"),
    targetId: str | None = Query(default=None, alias="targetId"),
    type: str | None = Query(default=None),
    entityId: str | None = Query(default=None, alias="entityId"),
    limit: int = Query(default=200, ge=1),
):
    results: list[dict] = []
    for r in _relations.values():
        if sourceId and r.get("sourceId") != sourceId:
            continue
        if targetId and r.get("targetId") != targetId:
            continue
        if type and r.get("type") != type:
            continue
        if entityId and r.get("sourceId") != entityId and r.get("targetId") != entityId:
            continue
        results.append(dict(r))
    return results[:limit]


# ── Stats & export endpoints ──────────────────────────────────────────


@router.get("/stats")
async def get_stats() -> GraphStatsResponse:
    entity_count = len(_entities)
    relation_count = len(_relations)
    entity_types: dict[str, int] = {}
    confidences: list[float] = []
    for e in _entities.values():
        t = e.get("type", "unknown")
        entity_types[t] = entity_types.get(t, 0) + 1
        confidences.append(e.get("confidence", 0))
    relation_types: dict[str, int] = {}
    for r in _relations.values():
        t = r.get("type", "unknown")
        relation_types[t] = relation_types.get(t, 0) + 1

    avg_conf = sum(confidences) / len(confidences) if confidences else 0.0

    # Compute orphaned and most-connected
    connected = set()
    connection_counts: dict[str, int] = {}
    for r in _relations.values():
        sid = r.get("sourceId", "")
        tid = r.get("targetId", "")
        if sid:
            connected.add(sid)
            connection_counts[sid] = connection_counts.get(sid, 0) + 1
        if tid:
            connected.add(tid)
            connection_counts[tid] = connection_counts.get(tid, 0) + 1
    orphaned = sum(1 for eid in _entities if eid not in connected)
    most = sorted(connection_counts.items(), key=lambda x: -x[1])[:10]
    most_connected = [
        {"entityId": eid, "name": _entities[eid].get("name", eid), "connectionCount": cnt}
        for eid, cnt in most
    ]

    return GraphStatsResponse(
        totalEntities=entity_count,
        totalRelations=relation_count,
        entityTypes=entity_types,
        relationTypes=relation_types,
        averageConfidence=round(avg_conf, 3),
        orphanedEntities=orphaned,
        mostConnected=most_connected,
    )


@router.get("/export/viz")
async def export_viz():
    nodes: list[dict] = []
    for e in _entities.values():
        nodes.append({
            "data": {
                "id": e["id"],
                "label": e.get("name", e["id"]),
                "type": e.get("type", "unknown"),
                "confidence": e.get("confidence", 0),
            }
        })
    edges: list[dict] = [
        {
            "data": {
                "id": r["id"],
                "source": r.get("sourceId", ""),
                "target": r.get("targetId", ""),
                "label": r.get("type", "related_to"),
                "confidence": r.get("confidence", 0),
            }
        }
        for r in _relations.values()
    ]
    return {"nodes": nodes, "edges": edges}


@router.get("/export")
async def export_graph():
    return {
        "entities": list(_entities.values()),
        "relations": list(_relations.values()),
        "version": 1,
        "updatedAt": _now_iso(),
    }


# ── AI Entity Extraction ───────────────────────────────────────────


import re


class ExtractEntitiesRequest(BaseModel):
    """Request to extract entities from text."""
    text: str = Field(..., min_length=1, description="Text to extract entities from")
    types: list[str] = Field(
        default_factory=lambda: ["person", "organization", "project", "concept"],
        description="Entity types to extract"
    )
    source: str | None = Field(default=None, description="Source identifier for extracted entities")


class ExtractedEntity(BaseModel):
    """A single extracted entity."""
    name: str
    type: str
    confidence: float
    mentions: int = 1


class ExtractEntitiesResponse(BaseModel):
    """Response with extracted entities."""
    entities: list[ExtractedEntity]
    relations: list[dict] = Field(default_factory=list)
    extractedCount: int = 0


# Simple extraction patterns
_EXTRACTION_PATTERNS: dict[str, list[re.Pattern]] = {}


def _get_patterns(entity_type: str) -> list[re.Pattern]:
    """Get or compile extraction patterns for an entity type."""
    if entity_type not in _EXTRACTION_PATTERNS:
        patterns = []
        if entity_type == "person":
            # Look for capitalized names (simplified heuristic)
            patterns = [
                re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b"),
                re.compile(r"\b([A-Z]\.?\s*[A-Z][a-z]+)\b"),
            ]
        elif entity_type == "organization":
            patterns = [
                re.compile(r"\b([A-Z][A-Za-z]+(?:\s+(?:Inc|Corp|Ltd|LLC|Co|Group|Company)))\b"),
                re.compile(r"\b(Google|Microsoft|Apple|Amazon|Meta|Tesla|OpenAI|Anthropic|NetEase|ByteDance)\b", re.IGNORECASE),
            ]
        elif entity_type == "project":
            patterns = [
                re.compile(r"\b(?:Project|Prj)[:\s]+([A-Z][A-Za-z0-9_-]+)", re.IGNORECASE),
                re.compile(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z0-9]+)+)\b"),
            ]
        elif entity_type == "concept":
            patterns = [
                re.compile(r"\b([A-Z][a-z]+(?:tion|ing|ness|ity))\b"),
            ]
        _EXTRACTION_PATTERNS[entity_type] = patterns
    return _EXTRACTION_PATTERNS[entity_type]


def _extract_entities_from_text(text: str, entity_type: str) -> list[tuple[str, float]]:
    """Extract entities of a given type from text using simple patterns."""
    results: list[tuple[str, float]] = []
    seen: set[str] = set()

    for pattern in _get_patterns(entity_type):
        for match in pattern.finditer(text):
            name = match.group(1).strip() if match.lastindex else match.group(0).strip()
            if name and name.lower() not in seen:
                seen.add(name.lower())
                # Simple confidence based on context
                confidence = 0.5
                if len(name) > 3:
                    confidence += 0.1
                # Check for repeated mentions
                count = len(re.findall(re.escape(name), text, re.IGNORECASE))
                confidence = min(0.95, confidence + count * 0.05)
                results.append((name, confidence))

    return results


@router.post("/extract")
async def extract_entities(req: ExtractEntitiesRequest) -> ExtractEntitiesResponse:
    """Extract entities from text using pattern-based extraction.

    This endpoint uses simple pattern matching to extract entities from text.
    For production use, replace with LLM-based extraction.
    """
    extracted: list[ExtractedEntity] = []
    all_entities: dict[str, ExtractedEntity] = {}

    for entity_type in req.types:
        matches = _extract_entities_from_text(req.text, entity_type)
        for name, confidence in matches:
            key = f"{entity_type}:{name.lower()}"
            if key in all_entities:
                all_entities[key].mentions += 1
                all_entities[key].confidence = min(0.95, all_entities[key].confidence + 0.05)
            else:
                all_entities[key] = ExtractedEntity(
                    name=name,
                    type=entity_type,
                    confidence=confidence,
                    mentions=1
                )

    # Sort by mentions and confidence
    sorted_entities = sorted(all_entities.values(), key=lambda e: (-e.mentions, -e.confidence))

    return ExtractEntitiesResponse(
        entities=sorted_entities[:50],  # Limit to top 50
        extractedCount=len(sorted_entities)
    )


@router.post("/extract-and-create")
async def extract_and_create(req: ExtractEntitiesRequest) -> ExtractEntitiesResponse:
    """Extract and create entities in the knowledge graph."""
    extracted = await extract_entities(req)

    async with _lock:
        created_entities: list[ExtractedEntity] = []
        for entity in extracted.entities:
            # Check for existing entity with similar name
            existing = False
            for existing_entity in _entities.values():
                if entity.name.lower() in existing_entity.get("name", "").lower():
                    existing = True
                    break

            if not existing:
                eid = str(uuid.uuid4())
                now = _now_iso()
                new_entity = {
                    "id": eid,
                    "name": entity.name,
                    "type": entity.type,
                    "aliases": [],
                    "description": f"Extracted from text (confidence: {entity.confidence:.2f})",
                    "properties": {"extractedFrom": req.text[:200], "mentions": entity.mentions},
                    "source": req.source or "pattern-extraction",
                    "confidence": entity.confidence,
                    "createdAt": now,
                    "updatedAt": now,
                    "accessCount": 0,
                    "lastAccessed": now,
                }
                _entities[eid] = new_entity
                created_entities.append(entity)

        await _save_state()

    return ExtractEntitiesResponse(
        entities=created_entities,
        extractedCount=len(created_entities)
    )


@router.post("/extract-session")
async def extract_from_session(
    session_id: str = Query(..., description="Session ID to extract from"),
    types: list[str] | None = Query(default=None),
    create: bool = Query(default=False, description="Whether to create extracted entities"),
) -> ExtractEntitiesResponse:
    """Extract entities from a session's conversation history."""
    from deerflow.client import DeerFlowClient

    if types is None:
        types = ["person", "organization", "project", "concept"]

    client = DeerFlowClient()
    messages: list[dict] = []

    try:
        # Try to get session messages
        result = client.get_memory()
        if result and "messages" in result:
            messages = result["messages"]
    except Exception as e:
        logger.warning(f"Could not get session messages: {e}")

    if not messages:
        return ExtractEntitiesResponse(entities=[], extractedCount=0)

    # Build text from messages
    text_parts = []
    for msg in messages[-20:]:  # Last 20 messages
        if isinstance(msg, dict):
            content = msg.get("content", "")
            role = msg.get("role", "")
            if content:
                text_parts.append(f"{role}: {content}")

    full_text = "\n".join(text_parts)

    req = ExtractEntitiesRequest(text=full_text, types=types, source=f"session:{session_id}")

    if create:
        return await extract_and_create(req)
    else:
        return await extract_entities(req)
