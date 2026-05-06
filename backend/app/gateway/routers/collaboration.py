"""Agent Collaboration REST API Router.

Provides CRUD endpoints for multi-agent collaboration sessions, collaborators,
tasks, messages, and consensus. Uses JSON-file persistence.

Endpoints
---------
GET    /api/electron/collaboration/sessions              – list sessions
POST   /api/electron/collaboration/sessions              – create session
GET    /api/electron/collaboration/sessions/{id}         – get session detail
DELETE /api/electron/collaboration/sessions/{id}         – delete session
POST   /api/electron/collaboration/sessions/{id}/collaborators – add collaborator
DELETE /api/electron/collaboration/sessions/{id}/collaborators/{cid} – remove
POST   /api/electron/collaboration/sessions/{id}/tasks   – create task
PATCH  /api/electron/collaboration/sessions/{id}/tasks/{tid} – update task
GET    /api/electron/collaboration/sessions/{id}/messages – get messages
POST   /api/electron/collaboration/sessions/{id}/messages – send message
GET    /api/electron/collaboration/stats                 – global stats
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

router = APIRouter(prefix="/api/electron/collaboration", tags=["collaboration"])

_lock = asyncio.Lock()
_sessions: dict[str, dict] = {}
_persistence_path: Optional[Path] = None


# ── Pydantic models ───────────────────────────────────────────────────


class CreateSessionRequest(BaseModel):
    title: str = Field(..., min_length=1)
    goal: str = Field(..., min_length=1)
    consensusThreshold: float = Field(default=0.66, ge=0.5, le=1.0, alias="consensusThreshold")

    model_config = {"populate_by_name": True}


class AddCollaboratorRequest(BaseModel):
    name: str = Field(..., min_length=1)
    role: str = Field(..., description="coordinator|researcher|critic|executor|synthesizer|specialist")
    capabilities: list[str] = Field(default_factory=list)
    model: str | None = None


class CreateTaskRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field(default="")
    assignedTo: str | None = Field(default=None, alias="assignedTo")
    dependencies: list[str] = Field(default_factory=list)
    priority: int = Field(default=5, ge=1, le=10)

    model_config = {"populate_by_name": True}


class UpdateTaskRequest(BaseModel):
    status: str | None = None  # pending|in_progress|completed|failed|blocked
    result: dict | None = None
    error: str | None = None
    assignedTo: str | None = Field(default=None, alias="assignedTo")

    model_config = {"populate_by_name": True}


class SendMessageRequest(BaseModel):
    from_: str = Field(..., alias="from")
    type: str = Field(default="task", description="task|result|question|answer|critique|consensus|system")
    content: str = Field(...)
    to: str | None = None
    payload: dict | None = None

    model_config = {"populate_by_name": True}


# ── persistence helpers ───────────────────────────────────────────────


def _get_persistence_path() -> Path:
    global _persistence_path
    if _persistence_path is None:
        try:
            base = get_paths().base_dir
        except Exception:
            base = Path(".")
        _persistence_path = base / "collaboration_sessions.json"
    return _persistence_path


async def _load_state() -> None:
    path = _get_persistence_path()
    if not path.exists():
        return
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        logger.exception("Failed to read collaboration_sessions.json")
        return
    for s in data.get("sessions", []):
        if isinstance(s, dict) and s.get("id"):
            _sessions[s["id"]] = s
    logger.info("Loaded %d collaboration sessions", len(_sessions))


async def _save_state() -> None:
    path = _get_persistence_path()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {"sessions": list(_sessions.values()), "updatedAt": time.time()}
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist collaboration sessions")


def _now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


def _session_metadata(s: dict) -> dict:
    """Extract lightweight metadata from a session."""
    msgs = s.get("messages", [])
    tasks = s.get("tasks", [])
    collaborators = s.get("collaborators", [])
    proposals = s.get("proposals", [])
    conflicts = sum(1 for m in msgs if m.get("type") == "conflict")
    return {
        "totalMessages": len(msgs),
        "totalTasks": len(tasks),
        "completedTasks": sum(1 for t in tasks if t.get("status") == "completed"),
        "conflictCount": conflicts,
        "consensusCount": sum(1 for p in proposals if p.get("status") == "approved"),
    }


# ── Session endpoints ─────────────────────────────────────────────────


@router.post("/sessions")
async def create_session(req: CreateSessionRequest):
    async with _lock:
        sid = str(uuid.uuid4())
        now = _now_iso()
        session = {
            "id": sid,
            "title": req.title,
            "goal": req.goal,
            "status": "forming",
            "collaborators": [],
            "tasks": [],
            "messages": [],
            "proposals": [],
            "consensusThreshold": req.consensusThreshold,
            "createdAt": now,
            "updatedAt": now,
            "metadata": {"totalMessages": 0, "totalTasks": 0, "completedTasks": 0, "conflictCount": 0, "consensusCount": 0},
        }
        _sessions[sid] = session
        await _save_state()
        return session


@router.get("/sessions")
async def list_sessions(
    status: str | None = Query(default=None),
):
    results = list(_sessions.values())
    if status:
        results = [s for s in results if s.get("status") == status]
    # Attach lightweight metadata
    return [{**s, "metadata": _session_metadata(s)} for s in results]


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    s = _sessions.get(session_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return {**s, "metadata": _session_metadata(s)}


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    async with _lock:
        if session_id not in _sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        del _sessions[session_id]
        await _save_state()
        return {"success": True}


# ── Collaborator endpoints ────────────────────────────────────────────


@router.post("/sessions/{session_id}/collaborators")
async def add_collaborator(session_id: str, req: AddCollaboratorRequest):
    async with _lock:
        s = _sessions.get(session_id)
        if s is None:
            raise HTTPException(status_code=404, detail="Session not found")
        cid = str(uuid.uuid4())
        collaborator = {
            "id": cid,
            "name": req.name,
            "role": req.role,
            "model": req.model,
            "capabilities": req.capabilities,
            "status": "idle",
            "messageCount": 0,
            "joinedAt": _now_iso(),
        }
        s.setdefault("collaborators", []).append(collaborator)
        s["updatedAt"] = _now_iso()
        await _save_state()
        return collaborator


@router.delete("/sessions/{session_id}/collaborators/{collaborator_id}")
async def remove_collaborator(session_id: str, collaborator_id: str):
    async with _lock:
        s = _sessions.get(session_id)
        if s is None:
            raise HTTPException(status_code=404, detail="Session not found")
        collabs = s.get("collaborators", [])
        s["collaborators"] = [c for c in collabs if c["id"] != collaborator_id]
        s["updatedAt"] = _now_iso()
        await _save_state()
        return {"success": True}


# ── Task endpoints ────────────────────────────────────────────────────


@router.post("/sessions/{session_id}/tasks")
async def create_task(session_id: str, req: CreateTaskRequest):
    async with _lock:
        s = _sessions.get(session_id)
        if s is None:
            raise HTTPException(status_code=404, detail="Session not found")
        tid = str(uuid.uuid4())
        task = {
            "id": tid,
            "title": req.title,
            "description": req.description,
            "assignedTo": req.assignedTo,
            "dependencies": req.dependencies,
            "priority": req.priority,
            "status": "pending",
            "createdAt": _now_iso(),
            "updatedAt": _now_iso(),
        }
        s.setdefault("tasks", []).append(task)
        s["updatedAt"] = _now_iso()
        s["metadata"] = _session_metadata(s)
        await _save_state()
        return task


@router.patch("/sessions/{session_id}/tasks/{task_id}")
async def update_task(session_id: str, task_id: str, req: UpdateTaskRequest):
    async with _lock:
        s = _sessions.get(session_id)
        if s is None:
            raise HTTPException(status_code=404, detail="Session not found")
        tasks = s.get("tasks", [])
        t = next((t for t in tasks if t["id"] == task_id), None)
        if t is None:
            raise HTTPException(status_code=404, detail="Task not found")
        if req.status is not None:
            t["status"] = req.status
        if req.result is not None:
            t["result"] = req.result
        if req.error is not None:
            t["error"] = req.error
        if req.assignedTo is not None:
            t["assignedTo"] = req.assignedTo
        t["updatedAt"] = _now_iso()
        s["updatedAt"] = _now_iso()
        s["metadata"] = _session_metadata(s)
        await _save_state()
        return t


# ── Message endpoints ─────────────────────────────────────────────────


@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    limit: int = Query(default=100, ge=1),
):
    s = _sessions.get(session_id)
    if s is None:
        return []
    msgs = s.get("messages", [])
    return msgs[-limit:]


@router.post("/sessions/{session_id}/messages")
async def send_message(session_id: str, req: SendMessageRequest):
    async with _lock:
        s = _sessions.get(session_id)
        if s is None:
            raise HTTPException(status_code=404, detail="Session not found")
        mid = str(uuid.uuid4())
        msg = {
            "id": mid,
            "from": req.from_,
            "to": req.to,
            "type": req.type,
            "content": req.content,
            "payload": req.payload,
            "timestamp": _now_iso(),
            "threadId": session_id,
        }
        s.setdefault("messages", []).append(msg)
        # Increment collaborator message count
        for c in s.get("collaborators", []):
            if c["name"] == req.from_:
                c["messageCount"] = c.get("messageCount", 0) + 1
        s["updatedAt"] = _now_iso()
        s["metadata"] = _session_metadata(s)
        await _save_state()
        return msg


# ── Stats endpoints ───────────────────────────────────────────────────


@router.get("/stats")
async def get_stats():
    total = len(_sessions)
    active = sum(1 for s in _sessions.values() if s.get("status") in ("forming", "active", "consensus", "conflict"))
    total_collaborators = sum(len(s.get("collaborators", [])) for s in _sessions.values())
    total_tasks = sum(len(s.get("tasks", [])) for s in _sessions.values())
    all_tasks = [t for s in _sessions.values() for t in s.get("tasks", [])]
    completed_tasks = sum(1 for t in all_tasks if t.get("status") == "completed")
    by_role: dict[str, int] = {}
    for s in _sessions.values():
        for c in s.get("collaborators", []):
            role = c.get("role", "unknown")
            by_role[role] = by_role.get(role, 0) + 1
    all_proposals = [p for s in _sessions.values() for p in s.get("proposals", [])]
    approved = sum(1 for p in all_proposals if p.get("status") == "approved")
    avg_consensus = (approved / len(all_proposals)) if all_proposals else 0.0

    return {
        "totalSessions": total,
        "activeSessions": active,
        "totalCollaborators": total_collaborators,
        "totalTasks": total_tasks,
        "completedTasks": completed_tasks,
        "byRole": by_role,
        "averageConsensusRate": round(avg_consensus, 3),
    }
