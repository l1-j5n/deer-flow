"""Reasoning Trace Viewer REST API Router.

Provides endpoints for browsing and analysing agent reasoning traces.
Includes realistic mock trace data covering 5 strategy types.
Enables browser-mode access to reasoning traces outside Electron.

Endpoints
---------
GET    /api/electron/reasoning/traces          – list/search traces
GET    /api/electron/reasoning/traces/{id}     – get single trace
DELETE /api/electron/reasoning/traces/{id}     – delete a trace
GET    /api/electron/reasoning/stats           – trace statistics
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

router = APIRouter(prefix="/api/electron/reasoning", tags=["reasoning"])

_lock = asyncio.Lock()
_traces: dict[str, dict] = {}
_persistence_path: Optional[Path] = None

# ── Pydantic models ───────────────────────────────────────────────────


class StepMetadataModel(BaseModel):
    toolName: Optional[str] = None
    durationMs: Optional[int] = None


class ReasoningStepModel(BaseModel):
    id: str
    type: str  # thought | action | observation | plan | reflection | conclusion
    content: str
    timestamp: str
    confidence: float = Field(ge=0.0, le=1.0)
    metadata: Optional[StepMetadataModel] = None


class ReasoningTraceModel(BaseModel):
    id: str
    sessionId: str
    strategy: str  # direct | cot | react | tot | reflection
    goal: str
    steps: list[ReasoningStepModel]
    status: str  # active | completed | failed | paused
    createdAt: str
    updatedAt: str
    totalSteps: int
    finalAnswer: Optional[str] = None


class ReasoningStatsModel(BaseModel):
    totalTraces: int
    activeTraces: int
    completedTraces: int
    failedTraces: int
    strategyBreakdown: dict[str, int]
    averageSteps: float
    averageConfidence: float


class TraceListResponse(BaseModel):
    traces: list[ReasoningTraceModel]
    total: int


# ── Seed data ─────────────────────────────────────────────────────────

_SEED_TRACES = [
    {
        "id": "trace-001",
        "sessionId": "sess-research-ai",
        "strategy": "react",
        "goal": "Research the latest developments in AI safety regulations in 2026",
        "status": "completed",
        "createdAt": "2026-05-03T12:15:00Z",
        "updatedAt": "2026-05-03T12:18:23Z",
        "totalSteps": 6,
        "finalAnswer": "In 2026, AI safety regulations have advanced significantly. The EU AI Act is now fully enforced with mandatory third-party audits for high-risk systems. The US has introduced the AI Safety and Accountability Act requiring foundation model developers to submit safety reports quarterly. China's Generative AI regulation has been expanded to cover agent-based systems. International cooperation through the Bletchley Process continues with a focus on frontier model testing standards.",
        "steps": [
            {"id": "s001-1", "type": "plan", "content": "I'll research AI safety regulations by: (1) searching for recent news, (2) checking regulatory databases, (3) synthesising findings across jurisdictions.", "timestamp": "2026-05-03T12:15:00Z", "confidence": 0.95},
            {"id": "s001-2", "type": "action", "content": "Searching web for '2026 AI safety regulation developments'...", "timestamp": "2026-05-03T12:15:05Z", "confidence": 0.90, "metadata": {"toolName": "web_search", "durationMs": 2340}},
            {"id": "s001-3", "type": "observation", "content": "Found 15 relevant articles. Key sources: European Commission AI Office update, US Senate AI Safety Bill, China CAC Generative AI Guidelines v2.", "timestamp": "2026-05-03T12:15:10Z", "confidence": 0.88},
            {"id": "s001-4", "type": "thought", "content": "The EU AI Act is most mature, followed by the US bill. China's approach is different — more focused on content control. Need to compare accountability mechanisms.", "timestamp": "2026-05-03T12:16:00Z", "confidence": 0.85},
            {"id": "s001-5", "type": "action", "content": "Cross-referencing regulatory databases for audit requirements...", "timestamp": "2026-05-03T12:17:00Z", "confidence": 0.92, "metadata": {"toolName": "web_search", "durationMs": 1800}},
            {"id": "s001-6", "type": "conclusion", "content": "Synthesised findings: EU mandatory audits, US quarterly reports, China agent-scope expansion, Bletchley frontier testing. All three major jurisdictions now have enforceable AI safety frameworks.", "timestamp": "2026-05-03T12:18:23Z", "confidence": 0.93},
        ],
    },
    {
        "id": "trace-002",
        "sessionId": "sess-code-review",
        "strategy": "cot",
        "goal": "Review a Python function for potential security vulnerabilities",
        "status": "completed",
        "createdAt": "2026-05-03T10:05:00Z",
        "updatedAt": "2026-05-03T10:07:45Z",
        "totalSteps": 5,
        "finalAnswer": "The function has two vulnerabilities: (1) SQL injection risk — user input is directly interpolated into the query string without parameterisation; (2) Path traversal — file path is not sanitised before os.path.join. Recommendations: use query parameters for SQL, apply os.path.realpath() validation.",
        "steps": [
            {"id": "s002-1", "type": "thought", "content": "Let me analyse the code structure step by step. First, I see a database query with string interpolation — that's a red flag for SQL injection.", "timestamp": "2026-05-03T10:05:00Z", "confidence": 0.97},
            {"id": "s002-2", "type": "thought", "content": "The function takes a user-supplied filename parameter. It uses os.path.join but doesn't validate the resulting path — this could allow path traversal.", "timestamp": "2026-05-03T10:06:00Z", "confidence": 0.92},
            {"id": "s002-3", "type": "observation", "content": "Line 15: cursor.execute(f'SELECT * FROM users WHERE name = {user_input}') — direct interpolation. Line 22: filepath = os.path.join(BASE, filename) with no realpath check.", "timestamp": "2026-05-03T10:06:30Z", "confidence": 0.95},
            {"id": "s002-4", "type": "reflection", "content": "Interesting that there's a try/except around the file read but no sanitisation. The author was thinking about error handling but not security. This is a common pattern in junior developer code.", "timestamp": "2026-05-03T10:07:00Z", "confidence": 0.88},
            {"id": "s002-5", "type": "conclusion", "content": "Confirmed two vulnerabilities: SQL injection (critical) and path traversal (high). Provided concrete fix recommendations with code examples.", "timestamp": "2026-05-03T10:07:45Z", "confidence": 0.96},
        ],
    },
    {
        "id": "trace-003",
        "sessionId": "sess-math-proof",
        "strategy": "tot",
        "goal": "Prove that the sum of the first n odd numbers equals n squared",
        "status": "completed",
        "createdAt": "2026-05-03T08:30:00Z",
        "updatedAt": "2026-05-03T08:35:12Z",
        "totalSteps": 7,
        "finalAnswer": "Proof by mathematical induction: Base case n=1: 1 = 1² ✓. Inductive step: Assume sum of first k odd numbers = k². The (k+1)th odd number is 2k+1. Sum = k² + 2k + 1 = (k+1)². Therefore holds for all n ≥ 1.",
        "steps": [
            {"id": "s003-1", "type": "plan", "content": "I'll explore three proof strategies: (1) mathematical induction, (2) visual/geometric proof, (3) algebraic manipulation of series. Induction seems most rigorous.", "timestamp": "2026-05-03T08:30:00Z", "confidence": 0.90},
            {"id": "s003-2", "type": "thought", "content": "Induction path: need base case P(1) and inductive step P(k) → P(k+1). The nth odd number is 2n-1. Sum from 1 to n of (2i-1) should equal n².", "timestamp": "2026-05-03T08:31:00Z", "confidence": 0.92},
            {"id": "s003-3", "type": "thought", "content": "Geometric path: arrange dots in a square. Each new L-shaped layer adds an odd number of dots. This gives visual intuition.", "timestamp": "2026-05-03T08:32:00Z", "confidence": 0.85},
            {"id": "s003-4", "type": "thought", "content": "Algebraic path: Σ(i=1 to n)(2i-1) = 2Σi - n = 2·n(n+1)/2 - n = n(n+1) - n = n²+n-n = n². This is the most direct approach.", "timestamp": "2026-05-03T08:33:00Z", "confidence": 0.95},
            {"id": "s003-5", "type": "reflection", "content": "The algebraic approach is actually the simplest — just a direct summation rather than induction. But induction is more instructive for learning proof techniques.", "timestamp": "2026-05-03T08:33:30Z", "confidence": 0.90},
            {"id": "s003-6", "type": "thought", "content": "I'll present the induction proof as the main answer and mention the algebraic shortcut for completeness.", "timestamp": "2026-05-03T08:34:00Z", "confidence": 0.93},
            {"id": "s003-7", "type": "conclusion", "content": "Proof complete via induction. Base case verified. Inductive step uses (k+1)th odd = 2k+1, sum = k² + 2k + 1 = (k+1)².", "timestamp": "2026-05-03T08:35:12Z", "confidence": 0.98},
        ],
    },
    {
        "id": "trace-004",
        "sessionId": "sess-debug-api",
        "strategy": "direct",
        "goal": "Why is the API returning a 500 error on POST /users?",
        "status": "completed",
        "createdAt": "2026-05-03T15:20:00Z",
        "updatedAt": "2026-05-03T15:21:30Z",
        "totalSteps": 4,
        "finalAnswer": "The 500 error is caused by a missing required field 'email' in the request body. The API expects {name, email, role} but the client is only sending {name, role}. Additionally, the database unique constraint on email is not being validated before insert, causing a IntegrityError that isn't caught.",
        "steps": [
            {"id": "s004-1", "type": "observation", "content": "Error log shows: sqlalchemy.exc.IntegrityError: NOT NULL constraint failed: users.email. The error happens in POST /api/v1/users handler.", "timestamp": "2026-05-03T15:20:00Z", "confidence": 0.95},
            {"id": "s004-2", "type": "thought", "content": "NOT NULL constraint means the 'email' column received None/NULL. The client must not be sending the email field in the request.", "timestamp": "2026-05-03T15:20:30Z", "confidence": 0.96},
            {"id": "s004-3", "type": "action", "content": "Checking the Pydantic model: UserCreate has email as required. Checking client code: the form only collects name and role fields. Email field is missing from the UI form.", "timestamp": "2026-05-03T15:21:00Z", "confidence": 0.93, "metadata": {"toolName": "code_inspection"}},
            {"id": "s004-4", "type": "conclusion", "content": "Root cause: UI form omits required 'email' field. Fix: add email input to form and ensure backend validation returns 422 instead of 500 by catching IntegrityError.", "timestamp": "2026-05-03T15:21:30Z", "confidence": 0.97},
        ],
    },
    {
        "id": "trace-005",
        "sessionId": "sess-write-essay",
        "strategy": "reflection",
        "goal": "Write a technical blog post about WebAssembly performance",
        "status": "active",
        "createdAt": "2026-05-03T16:00:00Z",
        "updatedAt": "2026-05-03T16:05:00Z",
        "totalSteps": 5,
        "steps": [
            {"id": "s005-1", "type": "plan", "content": "Outline: (1) What is Wasm, (2) Performance benchmarks vs JS, (3) Real-world use cases (Figma, Photoshop Web), (4) Limitations and future.", "timestamp": "2026-05-03T16:00:00Z", "confidence": 0.90},
            {"id": "s005-2", "type": "action", "content": "Writing introduction section explaining Wasm as a binary instruction format with near-native performance...", "timestamp": "2026-05-03T16:01:00Z", "confidence": 0.88},
            {"id": "s005-3", "type": "reflection", "content": "The intro is too technical for a general audience. Should add an analogy — maybe comparing Wasm to a 'universal plugin system' for the browser.", "timestamp": "2026-05-03T16:02:30Z", "confidence": 0.82},
            {"id": "s005-4", "type": "action", "content": "Revised intro with analogy. Added: 'Think of WebAssembly like a game console cartridge — pre-compiled, optimised, and ready to run at full speed the moment you plug it in.'", "timestamp": "2026-05-03T16:03:30Z", "confidence": 0.89},
            {"id": "s005-5", "type": "thought", "content": "Next: need benchmark data. Should search for the latest Wasm vs JS performance comparisons from 2025-2026.", "timestamp": "2026-05-03T16:05:00Z", "confidence": 0.87},
        ],
    },
    {
        "id": "trace-006",
        "sessionId": "sess-data-analysis",
        "strategy": "react",
        "goal": "Analyse Q1 2026 sales data and identify top-performing regions",
        "status": "completed",
        "createdAt": "2026-05-02T09:00:00Z",
        "updatedAt": "2026-05-02T09:08:15Z",
        "totalSteps": 8,
        "finalAnswer": "Q1 2026 analysis: Total revenue $4.2M (+18% YoY). Top regions: North America ($1.8M, +22%), Europe ($1.2M, +15%), APAC ($0.9M, +28%). APAC shows highest growth rate driven by Japan and India markets. Recommendation: increase APAC marketing budget by 25% for Q2.",
        "steps": [
            {"id": "s006-1", "type": "plan", "content": "Plan: (1) Load Q1 sales CSV, (2) Clean data, (3) Group by region, (4) Calculate YoY growth, (5) Identify top performers, (6) Generate visualisation.", "timestamp": "2026-05-02T09:00:00Z", "confidence": 0.92},
            {"id": "s006-2", "type": "action", "content": "Loading sales_data_q1_2026.csv with pandas...", "timestamp": "2026-05-02T09:00:30Z", "confidence": 0.95, "metadata": {"toolName": "python_exec", "durationMs": 450}},
            {"id": "s006-3", "type": "observation", "content": "Loaded 3,247 transactions. 12 records with missing dates, 5 with negative amounts (refunds). Data spans Jan 1 - Mar 31 2026.", "timestamp": "2026-05-02T09:01:15Z", "confidence": 0.90},
            {"id": "s006-4", "type": "action", "content": "Cleaning data: filtering out refunds, imputing missing dates from order IDs...", "timestamp": "2026-05-02T09:02:00Z", "confidence": 0.88, "metadata": {"toolName": "python_exec", "durationMs": 820}},
            {"id": "s006-5", "type": "observation", "content": "After cleaning: 3,230 valid transactions. Regional breakdown: NA 1,245, EU 890, APAC 720, LATAM 245, MEA 130.", "timestamp": "2026-05-02T09:03:00Z", "confidence": 0.92},
            {"id": "s006-6", "type": "action", "content": "Computing YoY growth by comparing with Q1 2025 baseline data...", "timestamp": "2026-05-02T09:04:00Z", "confidence": 0.90, "metadata": {"toolName": "python_exec", "durationMs": 1200}},
            {"id": "s006-7", "type": "reflection", "content": "Interesting pattern: APAC growth (28%) is significantly higher than other regions. Japan (+35%) and India (+32%) are the standout markets. Should investigate what drove this — possibly new product launch or marketing campaign.", "timestamp": "2026-05-02T09:06:00Z", "confidence": 0.85},
            {"id": "s006-8", "type": "conclusion", "content": "Analysis complete. NA leads in absolute revenue, APAC leads in growth. Recommended 25% budget increase for APAC markets in Q2.", "timestamp": "2026-05-02T09:08:15Z", "confidence": 0.94},
        ],
    },
    {
        "id": "trace-007",
        "sessionId": "sess-refactor",
        "strategy": "cot",
        "goal": "Refactor a monolithic Express.js route handler into a modular architecture",
        "status": "failed",
        "createdAt": "2026-05-02T14:00:00Z",
        "updatedAt": "2026-05-02T14:04:00Z",
        "totalSteps": 5,
        "finalAnswer": "Attempted refactoring but encountered a circular dependency issue between the new service layer and middleware. The middleware imports the service, which imports the middleware for error handling. Need to introduce a shared error utility module to break the cycle.",
        "steps": [
            {"id": "s007-1", "type": "plan", "content": "Plan: (1) Extract route logic into Service classes, (2) Create middleware functions, (3) Set up dependency injection, (4) Write integration tests.", "timestamp": "2026-05-02T14:00:00Z", "confidence": 0.90},
            {"id": "s007-2", "type": "thought", "content": "The current route handler is 400 lines. Business logic is mixed with validation and response formatting. Clear separation needed.", "timestamp": "2026-05-02T14:01:00Z", "confidence": 0.93},
            {"id": "s007-3", "type": "action", "content": "Creating src/services/UserService.ts — extracting user CRUD logic...", "timestamp": "2026-05-02T14:02:00Z", "confidence": 0.91},
            {"id": "s007-4", "type": "observation", "content": "ERROR: Circular dependency detected. src/middleware/auth.ts → src/services/UserService.ts → src/middleware/errorHandler.ts → src/middleware/auth.ts. Module resolution failed.", "timestamp": "2026-05-02T14:03:30Z", "confidence": 0.80},
            {"id": "s007-5", "type": "reflection", "content": "I should have checked the dependency graph before starting. The error handler middleware should be a standalone utility, not part of the middleware module. Need to restructure: create src/utils/errors.ts, then break the cycle.", "timestamp": "2026-05-02T14:04:00Z", "confidence": 0.88},
        ],
    },
    {
        "id": "trace-008",
        "sessionId": "sess-quick-calc",
        "strategy": "direct",
        "goal": "Convert 42 kilometres to miles",
        "status": "completed",
        "createdAt": "2026-05-03T17:00:00Z",
        "updatedAt": "2026-05-03T17:00:05Z",
        "totalSteps": 3,
        "finalAnswer": "42 kilometres ≈ 26.1 miles (1 km = 0.621371 miles, so 42 × 0.621371 = 26.098 miles).",
        "steps": [
            {"id": "s008-1", "type": "thought", "content": "Simple unit conversion: 1 km = 0.621371 miles. Multiply 42 by the conversion factor.", "timestamp": "2026-05-03T17:00:00Z", "confidence": 0.99},
            {"id": "s008-2", "type": "action", "content": "42 × 0.621371 = 26.097582.", "timestamp": "2026-05-03T17:00:03Z", "confidence": 0.99, "metadata": {"toolName": "calculator", "durationMs": 50}},
            {"id": "s008-3", "type": "conclusion", "content": "42 km = 26.1 miles (rounded to 1 decimal place).", "timestamp": "2026-05-03T17:00:05Z", "confidence": 0.99},
        ],
    },
]


# ── Persistence helpers ───────────────────────────────────────────────


async def _load_state() -> None:
    global _persistence_path
    try:
        paths = get_paths()
        _persistence_path = paths.base_dir / "reasoning_traces.json"
        if _persistence_path.exists():
            data = json.loads(_persistence_path.read_text(encoding="utf-8"))
            async with _lock:
                _traces.clear()
                _traces.update(data)
            logger.info("Restored %d reasoning traces from disk", len(_traces))
        else:
            # First run — seed with mock data
            async with _lock:
                for t in _SEED_TRACES:
                    _traces[t["id"]] = t
            await _save_state_nolock()
            logger.info("Seeded %d mock reasoning traces", len(_traces))
    except Exception:
        logger.exception("Failed to load reasoning trace state (non-fatal)")
        async with _lock:
            if not _traces:
                for t in _SEED_TRACES:
                    _traces[t["id"]] = t


async def _save_state() -> None:
    await _save_state_nolock()


async def _save_state_nolock() -> None:
    if not _persistence_path:
        paths = get_paths()
        _persistence_path = paths.base_dir / "reasoning_traces.json"
    try:
        _persistence_path.parent.mkdir(parents=True, exist_ok=True)
        async with _lock:
            data = dict(_traces)
        _persistence_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    except Exception:
        logger.exception("Failed to persist reasoning traces")


# ── Helper ────────────────────────────────────────────────────────────


def _compute_stats() -> ReasoningStatsModel:
    traces = list(_traces.values())
    if not traces:
        return ReasoningStatsModel(
            totalTraces=0, activeTraces=0, completedTraces=0,
            failedTraces=0, strategyBreakdown={}, averageSteps=0.0, averageConfidence=0.0,
        )
    active = sum(1 for t in traces if t["status"] == "active")
    completed = sum(1 for t in traces if t["status"] == "completed")
    failed = sum(1 for t in traces if t["status"] == "failed")
    breakdown: dict[str, int] = {}
    total_steps = 0
    total_conf = 0.0
    for t in traces:
        strat = t.get("strategy", "unknown")
        breakdown[strat] = breakdown.get(strat, 0) + 1
        total_steps += len(t.get("steps", []))
        for s in t.get("steps", []):
            total_conf += s.get("confidence", 0.0)
    step_count = sum(len(t.get("steps", [])) for t in traces)
    return ReasoningStatsModel(
        totalTraces=len(traces),
        activeTraces=active,
        completedTraces=completed,
        failedTraces=failed,
        strategyBreakdown=breakdown,
        averageSteps=round(total_steps / len(traces), 1),
        averageConfidence=round(total_conf / max(step_count, 1), 2),
    )


# ── Endpoints ─────────────────────────────────────────────────────────


@router.get("/traces", response_model=TraceListResponse)
async def list_traces(
    search: Optional[str] = Query(None, description="Search by goal or strategy"),
    strategy: Optional[str] = Query(None, description="Filter by strategy"),
    status: Optional[str] = Query(None, description="Filter by status"),
):
    """List reasoning traces with optional search and filters."""
    async with _lock:
        result = list(_traces.values())
    if search:
        q = search.lower()
        result = [t for t in result if q in t.get("goal", "").lower() or q in t.get("strategy", "").lower()]
    if strategy:
        result = [t for t in result if t.get("strategy") == strategy]
    if status:
        result = [t for t in result if t.get("status") == status]
    result.sort(key=lambda t: t.get("createdAt", ""), reverse=True)
    return TraceListResponse(traces=result, total=len(result))


@router.get("/traces/{trace_id}", response_model=ReasoningTraceModel)
async def get_trace(trace_id: str):
    """Get a single reasoning trace by ID."""
    async with _lock:
        trace = _traces.get(trace_id)
    if not trace:
        raise HTTPException(status_code=404, detail=f"Trace '{trace_id}' not found")
    return trace


@router.delete("/traces/{trace_id}")
async def delete_trace(trace_id: str):
    """Delete a reasoning trace."""
    async with _lock:
        if trace_id not in _traces:
            raise HTTPException(status_code=404, detail=f"Trace '{trace_id}' not found")
        del _traces[trace_id]
    await _save_state_nolock()
    return {"ok": True, "id": trace_id}


@router.get("/stats", response_model=ReasoningStatsModel)
async def get_stats():
    """Get reasoning trace statistics."""
    return _compute_stats()
