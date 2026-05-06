"""Task Scheduler REST API Router.

Provides CRUD endpoints for scheduled tasks, enabling browser-mode access
to the task scheduling system. Uses JSON-file persistence.

Includes a background asyncio loop that evaluates interval/once tasks and
executes them when due. Handlers can route to specific modules (e.g. backup).

Endpoints
---------
GET    /api/electron/scheduler/tasks       – list tasks (optional filters)
POST   /api/electron/scheduler/tasks       – create task
GET    /api/electron/scheduler/tasks/{id}  – get task detail
PATCH  /api/electron/scheduler/tasks/{id}  – update task
DELETE /api/electron/scheduler/tasks/{id}  – delete task
POST   /api/electron/scheduler/tasks/{id}/enable  – enable task
POST   /api/electron/scheduler/tasks/{id}/disable – disable task
POST   /api/electron/scheduler/tasks/{id}/run     – trigger execution
GET    /api/electron/scheduler/history     – execution history
GET    /api/electron/scheduler/stats       – scheduler statistics
POST   /api/electron/scheduler/loop/start  – start background loop
POST   /api/electron/scheduler/loop/stop   – stop background loop
GET    /api/electron/scheduler/loop/status – loop status
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/electron/scheduler", tags=["scheduler"])

_lock = asyncio.Lock()
_tasks: dict[str, dict] = {}
_history: list[dict] = []
_persistence_path: Optional[Path] = None

# ── Background loop state ─────────────────────────────────────────────
_loop_task: asyncio.Task | None = None
_loop_running = False
_loop_interval_s = 15
_loop_last_check: float | None = None

# ── Pydantic models ───────────────────────────────────────────────────


class TaskSchedule(BaseModel):
    type: str = Field(..., description="once|interval|cron")
    intervalMs: int | None = Field(default=None, ge=1000, alias="intervalMs")
    cron: str | None = None
    at: str | None = None  # ISO timestamp for one-time

    model_config = {"populate_by_name": True}


class TaskAction(BaseModel):
    handler: str = Field(default="system:dummy")
    params: dict = Field(default_factory=dict)


class TaskConfig(BaseModel):
    enabled: bool = Field(default=True)
    maxRetries: int = Field(default=3, ge=0, alias="maxRetries")
    retryDelayMs: int = Field(default=5000, ge=1000, alias="retryDelayMs")
    timeoutMs: int = Field(default=300000, alias="timeoutMs")
    skipIfRunning: bool = Field(default=True, alias="skipIfRunning")

    model_config = {"populate_by_name": True}


class CreateTaskRequest(BaseModel):
    name: str = Field(..., min_length=1)
    description: str = Field(default="")
    type: str = Field(default="system", description="workflow|session|skill|system|backup|cleanup")
    schedule: TaskSchedule = Field(...)
    action: TaskAction = Field(default_factory=TaskAction)
    config: TaskConfig = Field(default_factory=TaskConfig)


class UpdateTaskRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    type: str | None = None
    schedule: TaskSchedule | None = None
    action: TaskAction | None = None
    config: TaskConfig | None = None


# ── persistence helpers ───────────────────────────────────────────────


def _get_persistence_path() -> Path:
    global _persistence_path
    if _persistence_path is None:
        try:
            base = get_paths().base_dir
        except Exception:
            base = Path(".")
        _persistence_path = base / "scheduled_tasks.json"
    return _persistence_path


async def _load_state() -> None:
    path = _get_persistence_path()
    if not path.exists():
        return
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        logger.exception("Failed to read scheduled_tasks.json")
        return
    for t in data.get("tasks", []):
        if isinstance(t, dict) and t.get("id"):
            _tasks[t["id"]] = t
    history_raw = data.get("history", [])
    _history.clear()
    _history.extend(history_raw)
    logger.info("Loaded %d tasks and %d history entries", len(_tasks), len(_history))


async def _save_state() -> None:
    path = _get_persistence_path()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "tasks": list(_tasks.values()),
            "history": _history[-500:],  # Keep last 500 entries
            "updatedAt": time.time(),
        }
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist scheduled tasks")


def _now_iso() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


async def get_tasks() -> list[dict]:
    """Return a snapshot of all tasks as a list (safe for cross-module import)."""
    return list(_tasks.values())


# ── Task CRUD endpoints ───────────────────────────────────────────────


@router.post("/tasks")
async def create_task(req: CreateTaskRequest):
    async with _lock:
        tid = str(uuid.uuid4())
        now = _now_iso()
        task = {
            "id": tid,
            "name": req.name,
            "description": req.description,
            "type": req.type,
            "status": "pending",
            "schedule": req.schedule.model_dump(by_alias=True) if hasattr(req.schedule, "model_dump") else req.schedule.dict(),
            "action": req.action.model_dump() if hasattr(req.action, "model_dump") else req.action.dict(),
            "config": req.config.model_dump(by_alias=True) if hasattr(req.config, "model_dump") else req.config.dict(),
            "runCount": 0,
            "failCount": 0,
            "createdAt": now,
            "updatedAt": now,
        }
        _tasks[tid] = task
        await _save_state()
        return task


@router.get("/tasks")
async def list_tasks(
    type: str | None = Query(default=None),
    status: str | None = Query(default=None),
    enabled: bool | None = Query(default=None),
):
    results = list(_tasks.values())
    if type:
        results = [t for t in results if t.get("type") == type]
    if status:
        results = [t for t in results if t.get("status") == status]
    if enabled is not None:
        results = [t for t in results if t.get("config", {}).get("enabled") == enabled]
    return results


@router.get("/tasks/{task_id}")
async def get_task(task_id: str):
    t = _tasks.get(task_id)
    if t is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return t


@router.patch("/tasks/{task_id}")
async def update_task(task_id: str, req: UpdateTaskRequest):
    async with _lock:
        t = _tasks.get(task_id)
        if t is None:
            raise HTTPException(status_code=404, detail="Task not found")
        if req.name is not None:
            t["name"] = req.name
        if req.description is not None:
            t["description"] = req.description
        if req.type is not None:
            t["type"] = req.type
        if req.schedule is not None:
            t["schedule"] = req.schedule.model_dump(by_alias=True) if hasattr(req.schedule, "model_dump") else req.schedule.dict()
        if req.action is not None:
            t["action"] = req.action.model_dump() if hasattr(req.action, "model_dump") else req.action.dict()
        if req.config is not None:
            t["config"] = req.config.model_dump(by_alias=True) if hasattr(req.config, "model_dump") else req.config.dict()
        t["updatedAt"] = _now_iso()
        await _save_state()
        return t


@router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    async with _lock:
        if task_id not in _tasks:
            raise HTTPException(status_code=404, detail="Task not found")
        del _tasks[task_id]
        await _save_state()
        return {"success": True}


@router.post("/tasks/{task_id}/enable")
async def enable_task(task_id: str):
    async with _lock:
        t = _tasks.get(task_id)
        if t is None:
            raise HTTPException(status_code=404, detail="Task not found")
        t.setdefault("config", {})["enabled"] = True
        t["updatedAt"] = _now_iso()
        await _save_state()
        return {"success": True}


@router.post("/tasks/{task_id}/disable")
async def disable_task(task_id: str):
    async with _lock:
        t = _tasks.get(task_id)
        if t is None:
            raise HTTPException(status_code=404, detail="Task not found")
        t.setdefault("config", {})["enabled"] = False
        t["updatedAt"] = _now_iso()
        await _save_state()
        return {"success": True}


@router.post("/tasks/{task_id}/run")
async def run_task_now(task_id: str):
    t = _tasks.get(task_id)
    if t is None:
        raise HTTPException(status_code=404, detail="Task not found")
    exec_id = str(uuid.uuid4())
    now = _now_iso()
    execution = {
        "id": exec_id,
        "taskId": task_id,
        "startedAt": now,
        "status": "completed",  # Placeholder — real execution happens in Electron
        "retryCount": 0,
        "durationMs": 0,
    }
    async with _lock:
        t["runCount"] = t.get("runCount", 0) + 1
        t["lastRunAt"] = now
        t["lastRunResult"] = "success"
        t["updatedAt"] = now
        _history.append(execution)
        await _save_state()
        return execution


# ── History & Stats endpoints ─────────────────────────────────────────


@router.get("/history")
async def get_history(
    taskId: str | None = Query(default=None, alias="taskId"),
):
    results = _history
    if taskId:
        results = [h for h in results if h.get("taskId") == taskId]
    return results


@router.get("/stats")
async def get_stats():
    total = len(_tasks)
    enabled_count = sum(1 for t in _tasks.values() if t.get("config", {}).get("enabled"))
    running_count = sum(1 for t in _tasks.values() if t.get("status") == "running")
    by_type: dict[str, int] = {}
    for t in _tasks.values():
        tp = t.get("type", "unknown")
        by_type[tp] = by_type.get(tp, 0) + 1
    total_exec = sum(t.get("runCount", 0) for t in _tasks.values())
    failed = sum(t.get("failCount", 0) for t in _tasks.values())
    successful = total_exec - failed

    disabled_count = total - enabled_count
    from datetime import datetime, timezone, timedelta
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    executions_today = sum(
        1 for h in _history
        if datetime.fromisoformat(h.get("startedAt", "")).replace(tzinfo=timezone.utc) >= today_start
    )

    return {
        "totalTasks": total,
        "enabledTasks": enabled_count,
        "disabledTasks": disabled_count,
        "runningTasks": running_count,
        "byType": by_type,
        "totalExecutions": total_exec,
        "successfulExecutions": successful,
        "failedExecutions": failed,
        "executionsToday": executions_today,
    }


# ── Background loop ───────────────────────────────────────────────────


async def _execute_task(task: dict) -> None:
    """Execute a single task by dispatching to the appropriate handler."""
    handler = task.get("action", {}).get("handler", "system:dummy")
    tid = task["id"]
    now = _now_iso()

    execution = {
        "id": str(uuid.uuid4()),
        "taskId": tid,
        "startedAt": now,
        "status": "completed",
        "retryCount": 0,
        "durationMs": 0,
        "error": None,
    }

    try:
        if handler == "system:backup":
            # Delegate to backup module
            try:
                from app.gateway.routers.backup import create_backup_async
                result = await create_backup_async()
                execution["result"] = result
                logger.info("Auto-backup completed for task %s", tid)
            except ImportError:
                execution["status"] = "failed"
                execution["error"] = "Backup module not available"
                logger.warning("Backup module not importable for task %s", tid)
        else:
            # Generic handler: log and record
            logger.info("Executing task %s (handler=%s)", tid, handler)

    except Exception as exc:
        execution["status"] = "failed"
        execution["error"] = str(exc)
        logger.exception("Task %s execution failed", tid)

    execution["completedAt"] = _now_iso()

    async with _lock:
        task["runCount"] = task.get("runCount", 0) + 1
        task["lastRunAt"] = now
        if execution["status"] == "failed":
            task["failCount"] = task.get("failCount", 0) + 1
            task["lastRunResult"] = "failure"
            task["lastRunError"] = execution.get("error")
        else:
            task["lastRunResult"] = "success"
        task["updatedAt"] = now

        # Schedule next run for interval tasks
        sched = task.get("schedule", {})
        if sched.get("type") == "interval":
            interval_ms = sched.get("intervalMs", 3600000)
            task["nextRunAt"] = (datetime.now(timezone.utc) + timedelta(milliseconds=interval_ms)).isoformat()

        _history.append(execution)
        await _save_state()


async def _scheduler_loop() -> None:
    """Periodically check for due tasks and execute them."""
    global _loop_running, _loop_last_check
    logger.info("Scheduler background loop started (interval=%ds)", _loop_interval_s)
    while _loop_running:
        try:
            _loop_last_check = time.time()
            now = datetime.now(timezone.utc)
            due_tasks = []

            async with _lock:
                for t in _tasks.values():
                    if not t.get("config", {}).get("enabled"):
                        continue
                    sched = t.get("schedule", {})
                    stype = sched.get("type")

                    if stype == "once":
                        at_str = sched.get("at")
                        if at_str:
                            try:
                                at_dt = datetime.fromisoformat(at_str)
                                if at_dt.tzinfo is None:
                                    at_dt = at_dt.replace(tzinfo=timezone.utc)
                                if at_dt <= now and (not t.get("lastRunAt") or t.get("status") != "completed"):
                                    due_tasks.append(t)
                            except ValueError:
                                pass

                    elif stype == "interval":
                        next_at_str = t.get("nextRunAt")
                        if not next_at_str:
                            # First run: use creation time + interval
                            interval_ms = sched.get("intervalMs", 3600000)
                            created = t.get("createdAt", _now_iso())
                            try:
                                created_dt = datetime.fromisoformat(created)
                                if created_dt.tzinfo is None:
                                    created_dt = created_dt.replace(tzinfo=timezone.utc)
                                next_at = created_dt + timedelta(milliseconds=interval_ms)
                            except ValueError:
                                next_at = now + timedelta(milliseconds=interval_ms)
                        else:
                            try:
                                next_at = datetime.fromisoformat(next_at_str)
                                if next_at.tzinfo is None:
                                    next_at = next_at.replace(tzinfo=timezone.utc)
                            except ValueError:
                                next_at = now

                        if next_at <= now:
                            due_tasks.append(t)

            # Execute due tasks
            for task in due_tasks:
                if not _loop_running:
                    break
                await _execute_task(task)

        except Exception:
            logger.exception("Scheduler loop error (will retry next cycle)")

        # Sleep until next check
        try:
            await asyncio.sleep(_loop_interval_s)
        except asyncio.CancelledError:
            break

    _loop_running = False
    logger.info("Scheduler background loop stopped")


async def start_scheduler_loop() -> None:
    """Start the background scheduler loop (called from app lifespan)."""
    global _loop_task, _loop_running
    if _loop_running:
        logger.info("Scheduler loop already running")
        return
    _loop_running = True
    _loop_task = asyncio.create_task(_scheduler_loop())


async def stop_scheduler_loop() -> None:
    """Stop the background scheduler loop (called from app lifespan)."""
    global _loop_task, _loop_running
    _loop_running = False
    if _loop_task:
        _loop_task.cancel()
        try:
            await _loop_task
        except asyncio.CancelledError:
            pass
        _loop_task = None


# ── Loop control endpoints ────────────────────────────────────────────


@router.post("/loop/start")
async def loop_start():
    await start_scheduler_loop()
    return {"running": True}


@router.post("/loop/stop")
async def loop_stop():
    await stop_scheduler_loop()
    return {"running": False}


@router.get("/loop/status")
async def loop_status():
    return {
        "running": _loop_running,
        "lastCheck": _loop_last_check,
        "intervalSeconds": _loop_interval_s,
        "taskCount": len(_tasks),
        "historyCount": len(_history),
    }
