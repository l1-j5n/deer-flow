"""
DeerFlow Gateway - Session Export Router

Provides REST API for session export functionality, enabling browser-mode support
by bridging Electron's session-export-service with HTTP endpoints.

This router complements the Electron IPC namespace with REST API access,
following the 3-tier pattern: backend → Electron IPC → empty/defaults.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# ============================================================
# Router Setup
# ============================================================

router = APIRouter(prefix="/session-export", tags=["session-export"])

# Base directory for state persistence
BASE_DIR = Path(__file__).parent.parent.parent.parent / "data"
EXPORT_STATE_FILE = BASE_DIR / "session_exports.json"


# ============================================================
# Pydantic Models
# ============================================================


class ExportFormat(str):
    """Valid export formats."""
    JSON = "json"
    MARKDOWN = "markdown"
    HTML = "html"
    PDF = "pdf"


class ExportOptions(BaseModel):
    """Options for session export."""
    format: str = "json"
    includeMetadata: bool = True
    includeTimestamps: bool = True
    includeToolCalls: bool = True
    includeThinking: bool = False
    mediaHandling: str = "link"  # embed | link | skip
    mediaBase64Threshold: int = 1024 * 1024
    compressMedia: bool = False
    prettyPrint: bool = True
    template: Optional[str] = None


class ExportRequest(BaseModel):
    """Request to export a session."""
    sessionId: str
    options: Optional[ExportOptions] = None


class TemplateInfo(BaseModel):
    """Export template information."""
    id: str
    name: str
    description: str
    format: str


class ExportRecord(BaseModel):
    """Record of a past export."""
    fileName: str
    format: str
    timestamp: str
    size: int
    sessionCount: int


class ExportResponse(BaseModel):
    """Response from export operation."""
    success: bool
    data: Optional[str] = None
    filePath: Optional[str] = None
    error: Optional[str] = None


class BatchExportRequest(BaseModel):
    """Request to export multiple sessions."""
    sessionIds: list[str]
    format: str = "json"
    compression: bool = False


class BatchExportResponse(BaseModel):
    """Response from batch export."""
    success: bool
    completed: int = 0
    failed: int = 0
    zipPath: Optional[str] = None
    results: list[dict] = []


# ============================================================
# In-Memory State
# ============================================================

# Templates storage
_templates: list[dict] = [
    {
        "id": "default",
        "name": "Default",
        "description": "Standard export with all content",
        "format": "json",
    },
    {
        "id": "minimal",
        "name": "Minimal",
        "description": "Messages only, no metadata",
        "format": "markdown",
    },
    {
        "id": "detailed",
        "name": "Detailed",
        "description": "Full content with tool calls and reasoning",
        "format": "json",
    },
    {
        "id": "shareable",
        "name": "Shareable",
        "description": "Clean format for sharing",
        "format": "markdown",
    },
]

# Export history
_exports: list[dict] = []

# Lock for thread-safe operations
_state_lock = False


# ============================================================
# Helper Functions
# ============================================================


def _load_state() -> dict:
    """Load persisted state from JSON file."""
    global _exports
    if EXPORT_STATE_FILE.exists():
        try:
            data = json.loads(EXPORT_STATE_FILE.read_text())
            _exports = data.get("exports", [])
        except Exception:
            pass


def _save_state() -> None:
    """Persist state to JSON file."""
    global _state_lock
    _state_lock = True
    try:
        BASE_DIR.mkdir(parents=True, exist_ok=True)
        EXPORT_STATE_FILE.write_text(
            json.dumps({"exports": _exports}, indent=2, ensure_ascii=False)
        )
    finally:
        _state_lock = False


def _generate_filename(format: str, session_count: int = 1) -> str:
    """Generate export filename."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    if session_count > 1:
        return f"batch_export_{timestamp}.zip"
    return f"session_{timestamp}.{format}"


def _session_to_export_data(session_id: str, options: dict) -> dict:
    """Convert session to export format (mock implementation)."""
    return {
        "sessionId": session_id,
        "exportedAt": datetime.now().isoformat(),
        "format": options.get("format", "json"),
        "messages": [
            {"role": "user", "content": "Sample user message"},
            {"role": "assistant", "content": "Sample assistant response"},
        ],
        "metadata": {
            "messageCount": 2,
            "includeMetadata": options.get("includeMetadata", True),
        },
    }


# ============================================================
# API Endpoints
# ============================================================


@router.get("/templates")
async def get_templates() -> list[dict]:
    """Get available export templates."""
    return _templates


@router.get("/templates/{template_id}")
async def get_template(template_id: str) -> dict:
    """Get a specific template by ID."""
    for t in _templates:
        if t["id"] == template_id:
            return t
    raise HTTPException(status_code=404, detail=f"Template {template_id} not found")


@router.get("/exports")
async def list_exports() -> list[dict]:
    """List export history."""
    return _exports


@router.post("/export")
async def export_session(request: ExportRequest) -> ExportResponse:
    """Export a session to specified format."""
    options = request.options.dict() if request.options else {}
    format_type = options.get("format", "json")

    # Generate export data
    export_data = _session_to_export_data(request.sessionId, options)

    # Convert to format
    if format_type == "json":
        output = json.dumps(export_data, indent=options.get("prettyPrint", True) and 2 or None)
    elif format_type == "markdown":
        lines = [f"# Session {request.sessionId}", ""]
        for msg in export_data.get("messages", []):
            lines.append(f"## {msg['role'].capitalize()}")
            lines.append(msg["content"])
            lines.append("")
        output = "\n".join(lines)
    elif format_type == "html":
        output = f"""<!DOCTYPE html>
<html>
<head><title>Session {request.sessionId}</title></head>
<body>
<h1>Session {request.sessionId}</h1>
{"".join(f"<p><strong>{m['role']}</strong>: {m['content']}</p>" for m in export_data.get("messages", []))}
</body>
</html>"""
    else:
        output = json.dumps(export_data)

    # Create record
    filename = _generate_filename(format_type)
    record = {
        "fileName": filename,
        "format": format_type,
        "timestamp": datetime.now().isoformat(),
        "size": len(output),
        "sessionCount": 1,
    }
    _exports.append(record)
    _save_state()

    return ExportResponse(
        success=True,
        data=output,
        filePath=str(BASE_DIR / filename),
    )


@router.delete("/exports/{filename}")
async def delete_export(filename: str) -> dict:
    """Delete an export file from history."""
    global _exports
    initial_count = len(_exports)
    _exports = [e for e in _exports if e["fileName"] != filename]

    if len(_exports) == initial_count:
        raise HTTPException(status_code=404, detail=f"Export {filename} not found")

    _save_state()
    return {"success": True, "deleted": filename}


@router.post("/batch-export")
async def batch_export(request: BatchExportRequest) -> BatchExportResponse:
    """Export multiple sessions at once."""
    results = []
    completed = 0
    failed = 0

    for session_id in request.sessionIds:
        try:
            export_data = _session_to_export_data(
                session_id,
                {"format": request.format, "includeMetadata": True},
            )
            results.append({
                "sessionId": session_id,
                "success": True,
                "filePath": f"{BASE_DIR / _generate_filename(request.format)}",
            })
            completed += 1
        except Exception as e:
            results.append({"sessionId": session_id, "success": False, "error": str(e)})
            failed += 1

    # Create batch export record
    if completed > 0:
        filename = _generate_filename(request.format, completed)
        record = {
            "fileName": filename,
            "format": request.format,
            "timestamp": datetime.now().isoformat(),
            "size": 0,
            "sessionCount": completed,
        }
        _exports.append(record)
        _save_state()

    return BatchExportResponse(
        success=completed > 0,
        completed=completed,
        failed=failed,
        results=results,
    )


@router.get("/stats")
async def get_stats() -> dict:
    """Get export statistics."""
    return {
        "totalExports": len(_exports),
        "totalSize": sum(e.get("size", 0) for e in _exports),
        "formats": list(set(e.get("format", "unknown") for e in _exports)),
        "templates": len(_templates),
    }


# ============================================================
# Lifecycle Hooks
# ============================================================


async def on_startup() -> None:
    """Load state on startup."""
    _load_state()


async def on_shutdown() -> None:
    """Save state on shutdown."""
    _save_state()