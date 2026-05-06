"""Backup & Restore REST API Router.

Provides CRUD endpoints for backup configurations, backup entries,
and backup operations. Uses JSON-file persistence for browser-mode support.

Endpoints
---------
GET    /api/electron/backup/config       – get current config
PUT    /api/electron/backup/config       – update config
POST   /api/electron/backup/create       – create a new backup (ZIP archive)
GET    /api/electron/backup/list         – list all backups
DELETE /api/electron/backup/{id}         – delete a backup entry
GET    /api/electron/backup/stats        – backup statistics
POST   /api/electron/backup/restore      – restore from a backup archive
POST   /api/electron/backup/auto-backup/start   – enable auto backup
POST   /api/electron/backup/auto-backup/stop    – disable auto backup
GET    /api/electron/backup/auto-backup/status   – auto backup status
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import shutil
import tempfile
import time
import uuid
import zipfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from deerflow.config.paths import get_paths

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/electron/backup", tags=["backup"])

_lock = asyncio.Lock()
_backups: dict[str, dict] = {}
_config: dict = {}
_persistence_path: Optional[Path] = None


def _get_persistence_path() -> Path:
    global _persistence_path
    if _persistence_path is None:
        try:
            base = get_paths().base_dir
        except Exception:
            base = Path(".")
        _persistence_path = base / "backups.json"
    return _persistence_path


async def _load_state() -> None:
    """Load persisted backup data from disk."""
    path = _get_persistence_path()
    if not path.exists():
        return
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        logger.exception("Failed to read backups.json")
        return
    global _backups, _config
    backups_raw = data.get("backups", [])
    for b in backups_raw:
        if isinstance(b, dict) and b.get("id"):
            _backups[b["id"]] = b
    _config = data.get("config", {})
    logger.info("Loaded %d backups and config from backups.json", len(_backups))


async def _save_state() -> None:
    """Persist backup data to disk."""
    path = _get_persistence_path()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "backups": list(_backups.values()),
            "config": _config,
            "updatedAt": time.time(),
        }
        path.write_text(json.dumps(data, indent=2), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist backup state")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ── Pydantic models ───────────────────────────────────────────────────


class BackupConfigModel(BaseModel):
    enabled: bool = True
    intervalHours: int = Field(default=24, ge=1, alias="intervalHours")
    maxBackups: int = Field(default=10, ge=1, le=50, alias="maxBackups")
    backupPath: str = Field(default=".deerflow/backups", alias="backupPath")
    includeSessions: bool = Field(default=True, alias="includeSessions")
    includeWorkflows: bool = Field(default=True, alias="includeWorkflows")
    includeKnowledgeGraph: bool = Field(default=True, alias="includeKnowledgeGraph")
    includeConfig: bool = Field(default=True, alias="includeConfig")
    includeMemories: bool = Field(default=True, alias="includeMemories")
    includePlugins: bool = Field(default=True, alias="includePlugins")
    compress: bool = True

    model_config = {"populate_by_name": True}


class BackupConfigUpdateRequest(BaseModel):
    enabled: bool | None = None
    intervalHours: int | None = Field(default=None, ge=1, alias="intervalHours")
    maxBackups: int | None = Field(default=None, ge=1, le=50, alias="maxBackups")
    backupPath: str | None = Field(default=None, alias="backupPath")
    includeSessions: bool | None = Field(default=None, alias="includeSessions")
    includeWorkflows: bool | None = Field(default=None, alias="includeWorkflows")
    includeKnowledgeGraph: bool | None = Field(default=None, alias="includeKnowledgeGraph")
    includeConfig: bool | None = Field(default=None, alias="includeConfig")
    includeMemories: bool | None = Field(default=None, alias="includeMemories")
    includePlugins: bool | None = Field(default=None, alias="includePlugins")
    compress: bool | None = None

    model_config = {"populate_by_name": True}


class CreateBackupRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    tags: list[str] = Field(default_factory=list)


class BackupStatsResponse(BaseModel):
    totalBackups: int = 0
    totalSize: int = 0
    oldestBackup: str | None = None
    newestBackup: str | None = None
    autoBackupEnabled: bool = False
    nextScheduledBackup: str | None = None


class BackupRestoreRequest(BaseModel):
    backupId: str = Field(..., alias="backupId")
    mergeStrategy: str = Field(default="overwrite", alias="mergeStrategy")  # "overwrite" | "merge" | "skip"
    components: list[str] = Field(default_factory=list)


class BackupRestoreResponse(BaseModel):
    success: bool = True
    restoredItems: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)


# ── Helpers ───────────────────────────────────────────────────────────


def _get_base_dir() -> Path:
    try:
        return get_paths().base_dir
    except Exception:
        return Path(".")


def _get_backup_archive_path(backup_id: str) -> Path:
    base = _get_base_dir()
    bp = _config.get("backupPath", ".deerflow/backups")
    bp_path = Path(bp) if Path(bp).is_absolute() else base / bp
    return bp_path / f"backup_{backup_id[:8]}.zip"


def _create_zip_archive(backup_id: str, temp_dir: Path) -> Path:
    """Package temp_dir contents into a ZIP archive."""
    archive_path = _get_backup_archive_path(backup_id)
    archive_path.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(archive_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _dirs, files in os.walk(temp_dir):
            for fname in files:
                fpath = Path(root) / fname
                arcname = str(fpath.relative_to(temp_dir))
                zf.write(fpath, arcname)

    return archive_path


# ── Core backup creation (callable from scheduler) ────────────────────


async def create_backup_async(name: str | None = None, description: str | None = None) -> dict:
    """Create a backup entry. Usable by the scheduler background loop
    without requiring an HTTP request context.

    Returns the backup dict or raises an exception on failure.
    """
    global _backups
    bid = str(uuid.uuid4())
    now_iso = _now_iso()
    backup_name = name or f"Auto Backup {now_iso[:19]}"
    tag_list = ["auto"] if not name else []

    base_dir = _get_base_dir()
    temp_dir = Path(tempfile.mkdtemp(prefix=f"deerflow_bak_{bid[:8]}_"))
    contents: list[dict] = []
    total_files = 0

    try:
        # Knowledge Base / Graph
        if _config.get("includeKnowledgeGraph", True):
            kb_json = base_dir / "knowledge_base.json"
            if kb_json.exists():
                shutil.copy2(kb_json, temp_dir / "knowledge_base.json")
                total_files += 1
                contents.append({"type": "knowledge-base", "count": 1, "size": kb_json.stat().st_size})

            docs_dir = base_dir / "knowledge_docs"
            if docs_dir.exists() and docs_dir.is_dir():
                dest_docs = temp_dir / "knowledge_docs"
                dest_docs.mkdir(exist_ok=True)
                doc_count = 0
                for f in docs_dir.iterdir():
                    if f.is_file():
                        shutil.copy2(f, dest_docs / f.name)
                        doc_count += 1
                if doc_count > 0:
                    total_files += doc_count
                    contents.append({"type": "knowledge-docs", "count": doc_count, "size": 0})

            vectors_npy = base_dir / "knowledge_base_vectors.npy"
            if vectors_npy.exists():
                shutil.copy2(vectors_npy, temp_dir / "knowledge_base_vectors.npy")
                total_files += 1

            kg_json = base_dir / "knowledge_graph.json"
            if kg_json.exists():
                shutil.copy2(kg_json, temp_dir / "knowledge_graph.json")
                total_files += 1
                contents.append({"type": "knowledge-graph", "count": 1, "size": kg_json.stat().st_size})

        # Config
        if _config.get("includeConfig", True):
            config_yaml = base_dir / "config.yaml"
            if config_yaml.exists():
                shutil.copy2(config_yaml, temp_dir / "config.yaml")
                total_files += 1
                contents.append({"type": "config", "count": 1, "size": config_yaml.stat().st_size})

        # Conversation Memory
        if _config.get("includeMemories", True):
            cm_json = base_dir / "conversation_memory.json"
            if cm_json.exists():
                shutil.copy2(cm_json, temp_dir / "conversation_memory.json")
                total_files += 1
                contents.append({"type": "memory", "count": 1, "size": cm_json.stat().st_size})

        # Write manifest
        manifest = {
            "backupId": bid,
            "createdAt": now_iso,
            "backupName": backup_name,
            "config": _config,
            "contents": contents,
            "totalFiles": total_files,
        }
        manifest_path = temp_dir / "manifest.json"
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        total_files += 1

        # Create ZIP archive
        archive_path = _create_zip_archive(bid, temp_dir)

        backup_entry = {
            "id": bid,
            "name": backup_name,
            "createdAt": now_iso,
            "size": archive_path.stat().st_size,
            "description": description or "",
            "tags": tag_list,
            "contents": contents,
            "compressed": _config.get("compress", True),
            "archivePath": str(archive_path),
            "totalFiles": total_files,
        }

    except Exception:
        logger.exception("Failed to create backup archive")
        raise
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

    return backup_entry


# ── Endpoints ─────────────────────────────────────────────────────────


@router.get("/config")
async def get_config() -> BackupConfigModel:
    if not _config:
        return BackupConfigModel()
    return BackupConfigModel(**_config)


@router.put("/config")
async def update_config(req: BackupConfigUpdateRequest) -> BackupConfigModel:
    global _config
    async with _lock:
        updates = req.model_dump(exclude_none=True, by_alias=True)
        _config.update(updates)
        await _save_state()
        return BackupConfigModel(**_config)


@router.post("/create")
async def create_backup(req: CreateBackupRequest) -> dict:
    global _backups
    async with _lock:
        try:
            backup = await create_backup_async(name=req.name, description=req.description)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to create backup: {exc}")

        backup["description"] = req.description or ""
        backup["tags"] = req.tags
        _backups[backup["id"]] = backup

        # Enforce max backups
        max_b = _config.get("maxBackups", 10)
        if len(_backups) > max_b:
            oldest = sorted(_backups.values(), key=lambda b: b.get("createdAt", ""))
            for old in oldest[: len(_backups) - max_b]:
                old_path = old.get("archivePath")
                if old_path and Path(old_path).exists():
                    Path(old_path).unlink(missing_ok=True)
                del _backups[old["id"]]

        await _save_state()
        return backup


@router.get("/list")
async def list_backups() -> list[dict]:
    sorted_list = sorted(
        _backups.values(),
        key=lambda b: b.get("createdAt", ""),
        reverse=True,
    )
    return list(sorted_list)


@router.delete("/{backup_id}")
async def delete_backup(backup_id: str) -> dict:
    async with _lock:
        if backup_id not in _backups:
            raise HTTPException(status_code=404, detail="Backup not found")
        entry = _backups[backup_id]
        # Remove archive file if it exists
        archive_path = entry.get("archivePath")
        if archive_path and Path(archive_path).exists():
            Path(archive_path).unlink(missing_ok=True)
        del _backups[backup_id]
        await _save_state()
        return {"success": True}


@router.post("/restore", response_model=BackupRestoreResponse)
async def restore_backup(req: BackupRestoreRequest) -> BackupRestoreResponse:
    """Restore data from a backup archive."""
    backup_id = req.backupId
    entry = _backups.get(backup_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Backup not found")

    archive_path = entry.get("archivePath")
    if not archive_path or not Path(archive_path).exists():
        raise HTTPException(status_code=404, detail="Backup archive not found on disk")

    restored: list[str] = []
    errors: list[str] = []

    try:
        base_dir = _get_base_dir()
        temp_dir = Path(tempfile.mkdtemp(prefix=f"deerflow_restore_{backup_id[:8]}_"))

        try:
            # Extract archive
            with zipfile.ZipFile(archive_path, "r") as zf:
                zf.extractall(temp_dir)

            # Read manifest
            manifest_path = temp_dir / "manifest.json"
            if not manifest_path.exists():
                return BackupRestoreResponse(success=False, errors=["manifest.json not found in archive"])

            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            selected = set(req.components) if req.components else set()

            # Restore Knowledge Base
            kb_json = temp_dir / "knowledge_base.json"
            if kb_json.exists() and ("knowledge-base" in selected or not selected):
                if req.mergeStrategy == "skip" and (base_dir / "knowledge_base.json").exists():
                    restored.append("knowledge-base (skipped)")
                else:
                    shutil.copy2(kb_json, base_dir / "knowledge_base.json")
                    restored.append("knowledge-base")

            docs_dir = temp_dir / "knowledge_docs"
            if docs_dir.exists() and ("knowledge-docs" in selected or not selected):
                dest_docs = base_dir / "knowledge_docs"
                dest_docs.mkdir(parents=True, exist_ok=True)
                doc_count = 0
                for f in docs_dir.iterdir():
                    if f.is_file():
                        dest = dest_docs / f.name
                        if req.mergeStrategy == "skip" and dest.exists():
                            continue
                        shutil.copy2(f, dest)
                        doc_count += 1
                if doc_count > 0:
                    restored.append(f"knowledge-docs ({doc_count} files)")

            vectors_npy = temp_dir / "knowledge_base_vectors.npy"
            if vectors_npy.exists() and ("knowledge-base" in selected or not selected):
                shutil.copy2(vectors_npy, base_dir / "knowledge_base_vectors.npy")
                restored.append("embedding-vectors")

            kg_json = temp_dir / "knowledge_graph.json"
            if kg_json.exists() and ("knowledge-graph" in selected or not selected):
                if req.mergeStrategy == "skip" and (base_dir / "knowledge_graph.json").exists():
                    restored.append("knowledge-graph (skipped)")
                else:
                    shutil.copy2(kg_json, base_dir / "knowledge_graph.json")
                    restored.append("knowledge-graph")

            config_yaml = temp_dir / "config.yaml"
            if config_yaml.exists() and ("config" in selected or not selected):
                if req.mergeStrategy == "skip" and (base_dir / "config.yaml").exists():
                    restored.append("config (skipped)")
                else:
                    shutil.copy2(config_yaml, base_dir / "config.yaml")
                    restored.append("config")

            cm_json = temp_dir / "conversation_memory.json"
            if cm_json.exists() and ("memory" in selected or not selected):
                if req.mergeStrategy == "skip" and (base_dir / "conversation_memory.json").exists():
                    restored.append("memory (skipped)")
                else:
                    shutil.copy2(cm_json, base_dir / "conversation_memory.json")
                    restored.append("memory")

        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    except Exception as exc:
        logger.exception("Failed to restore backup %s", backup_id)
        errors.append(str(exc))
        return BackupRestoreResponse(success=False, restoredItems=restored, errors=errors)

    if not restored and not errors:
        return BackupRestoreResponse(success=True, restoredItems=["(no matching components)"], errors=[])

    return BackupRestoreResponse(
        success=True,
        restoredItems=restored,
        errors=errors,
    )


@router.get("/stats")
async def get_backup_stats() -> BackupStatsResponse:
    entries = list(_backups.values())
    total_b = len(entries)
    total_s = sum(b.get("size", 0) for b in entries)
    oldest = min((b.get("createdAt", "") for b in entries), default=None)
    newest = max((b.get("createdAt", "") for b in entries), default=None)
    auto = _config.get("enabled", False)
    next_sched = None
    if auto:
        # Try to get real next-scheduled time from scheduler
        try:
            from app.gateway.routers.scheduler import get_tasks
            tasks = await get_tasks()
            backup_task = next((t for t in tasks if t.get("type") == "backup" and t.get("action", {}).get("handler") == "system:backup"), None)
            if backup_task:
                next_sched = backup_task.get("nextRunAt")
        except Exception:
            pass
        if not next_sched:
            hours = _config.get("intervalHours", 24)
            next_sched = (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()
    return BackupStatsResponse(
        totalBackups=total_b,
        totalSize=total_s,
        oldestBackup=oldest,
        newestBackup=newest,
        autoBackupEnabled=auto,
        nextScheduledBackup=next_sched,
    )


# ── Auto-backup control endpoints ─────────────────────────────────────

class AutoBackupStatusResponse(BaseModel):
    enabled: bool
    running: bool
    intervalHours: int = 24
    nextScheduled: str | None = None
    schedulerTaskId: str | None = None


@router.get("/auto-backup/status")
async def get_auto_backup_status() -> AutoBackupStatusResponse:
    """Query auto-backup status: enabled flag, next scheduled time, scheduler task."""
    enabled = _config.get("enabled", False)
    interval = _config.get("intervalHours", 24)
    next_sched = None
    task_id = None

    if enabled:
        try:
            from app.gateway.routers.scheduler import get_tasks
            tasks = await get_tasks()
            backup_task = next((t for t in tasks if t.get("type") == "backup" and t.get("action", {}).get("handler") == "system:backup"), None)
            if backup_task:
                next_sched = backup_task.get("nextRunAt")
                task_id = backup_task.get("id")
        except Exception:
            pass
        if not next_sched:
            next_sched = (datetime.now(timezone.utc) + timedelta(hours=interval)).isoformat()

    return AutoBackupStatusResponse(
        enabled=enabled,
        running=bool(task_id),
        intervalHours=interval,
        nextScheduled=next_sched,
        schedulerTaskId=task_id,
    )


@router.post("/auto-backup/start")
async def start_auto_backup() -> dict:
    """Enable automatic backup scheduling. Creates a scheduler task for periodic backup."""
    global _config
    async with _lock:
        _config["enabled"] = True
        interval_hours = _config.get("intervalHours", 24)
        interval_ms = interval_hours * 3600 * 1000
        await _save_state()

    # Create or update the scheduler task for periodic backup
    try:
        from app.gateway.routers.scheduler import create_task as sched_create, get_tasks

        tasks = await get_tasks()
        existing = next((t for t in tasks if t.get("type") == "backup" and t.get("action", {}).get("handler") == "system:backup"), None)
        if existing:
            logger.info("Auto-backup scheduler task already exists: %s", existing.get("id"))
        else:
            task = await sched_create({
                "name": "Auto Backup",
                "description": f"Periodic auto-backup every {interval_hours} hours",
                "type": "backup",
                "schedule": {"type": "interval", "intervalMs": interval_ms},
                "action": {"handler": "system:backup", "params": {}},
                "config": {"enabled": True, "maxRetries": 2, "retryDelayMs": 60000, "timeoutMs": 300000, "skipIfRunning": True},
            })
            logger.info("Created auto-backup scheduler task: %s", task.get("id"))
    except Exception as exc:
        logger.exception("Failed to create scheduler task for auto-backup (non-fatal): %s", exc)

    return {"success": True, "enabled": True, "intervalHours": interval_hours}


@router.post("/auto-backup/stop")
async def stop_auto_backup() -> dict:
    """Disable automatic backup scheduling. Removes the scheduler task."""
    global _config
    async with _lock:
        _config["enabled"] = False
        await _save_state()

    # Remove the scheduler task
    try:
        from app.gateway.routers.scheduler import get_tasks, delete_task as sched_delete

        tasks = await get_tasks()
        backup_task = next((t for t in tasks if t.get("type") == "backup" and t.get("action", {}).get("handler") == "system:backup"), None)
        if backup_task:
            await sched_delete(backup_task["id"])
            logger.info("Removed auto-backup scheduler task: %s", backup_task["id"])
    except Exception as exc:
        logger.exception("Failed to remove scheduler task for auto-backup (non-fatal): %s", exc)

    return {"success": True, "enabled": False}
