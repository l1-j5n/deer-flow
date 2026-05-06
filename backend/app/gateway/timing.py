"""Shared timing-data store for the Gateway.

Keeps per-agent response-time metrics collected by the HTTP timing middleware,
so the agents router and WebSocket endpoint can return real (not placeholder)
timing data.

Two dimensions of timing are tracked:

* **Gateway HTTP time** — total wall-clock time from request arrival to response
  departure, measured by the HTTP middleware.
* **LangGraph processing time** — actual agent computation time inside the
  LangGraph server, reported via the ``POST /api/agents/{name}/timing/instrument``
  endpoint (from channels service or other internal callers).

Gateway overhead = HTTP total − LangGraph processing (computed on read).

Timing snapshots are persisted as JSON files in agent directories so data
survives Gateway restarts.  Auto-save fires on every ``record()`` call with
a 30-second per-agent cooldown; a full save is also triggered during Gateway
shutdown.
"""

import asyncio
import json
import logging
import time
from collections import deque
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


# Maximum number of recent response-time *averaging* samples (floating window).
_MAX_SAMPLES = 50

# Maximum number of timestamped history samples to keep per agent.
_MAX_HISTORY = 200

# Minimum interval between auto-saves for a single agent (seconds).
_PERSIST_COOLDOWN_S = 30.0


class _AgentTiming:
    """Sliding-window of response times for a single agent.

    Two tiers of data are tracked for each timing dimension (Gateway HTTP
    and LangGraph processing):

    * **samples** — short window (last *MAX_SAMPLES* values) used for the
      running average reported by ``avg_response_time``.
    * **sample_history** — longer history (last *MAX_HISTORY* entries) of
      ``(real_time, elapsed_ms)`` pairs used for percentile computation,
      timing history API, and persistence.
    """

    def __init__(self) -> None:
        # ── Gateway HTTP timing ────────────────────────────────────────
        self.samples: deque[float] = deque(maxlen=_MAX_SAMPLES)  # seconds
        self.sample_history: deque[tuple[float, int]] = deque(
            maxlen=_MAX_HISTORY
        )  # (real_time, elapsed_ms)
        self.last_request_at: float = 0.0  # monotonic wall-clock
        self.last_response_time_ms: Optional[int] = None

        # ── LangGraph processing timing ─────────────────────────────────
        self._lg_samples: deque[float] = deque(maxlen=_MAX_SAMPLES)
        self._lg_history: deque[tuple[float, int]] = deque(
            maxlen=_MAX_HISTORY
        )  # (real_time, elapsed_ms)
        self.last_langgraph_time_ms: Optional[int] = None

        self._last_persist_at: float = 0.0  # monotonic; used for cooldown

    # ── recording ──────────────────────────────────────────────────────

    def record(self, elapsed_s: float) -> None:
        """Record a new Gateway HTTP response-time sample."""
        elapsed_ms = int(elapsed_s * 1000)
        self.samples.append(elapsed_s)
        self.sample_history.append((time.time(), elapsed_ms))
        self.last_request_at = time.monotonic()
        self.last_response_time_ms = elapsed_ms

    def record_langgraph(self, elapsed_ms: int) -> None:
        """Record a new LangGraph processing-time sample (in ms)."""
        self._lg_samples.append(elapsed_ms / 1000.0)
        self._lg_history.append((time.time(), elapsed_ms))
        self.last_langgraph_time_ms = elapsed_ms

    # ── derived metrics (Gateway HTTP) ─────────────────────────────────

    @property
    def avg_ms(self) -> int | None:
        if not self.samples:
            return None
        return int((sum(self.samples) / len(self.samples)) * 1000)

    def percentile_ms(self, pct: float) -> int | None:
        """Return the *pct*-th percentile (0–100) from Gateway HTTP ``sample_history`` in ms."""
        return self._compute_percentile(self.sample_history, pct)

    def history_as_list(self) -> list[dict]:
        """Return Gateway HTTP sample history as ``[{ts, value_ms}, ...]`` dicts."""
        return [{"ts": ts, "value_ms": ms} for ts, ms in self.sample_history]

    # ── derived metrics (LangGraph processing) ─────────────────────────

    @property
    def langgraph_avg_ms(self) -> int | None:
        if not self._lg_samples:
            return None
        return int((sum(self._lg_samples) / len(self._lg_samples)) * 1000)

    def langgraph_percentile_ms(self, pct: float) -> int | None:
        """Return the *pct*-th percentile from LangGraph processing history in ms."""
        return self._compute_percentile(self._lg_history, pct)

    def langgraph_history_as_list(self) -> list[dict]:
        """Return LangGraph processing history as ``[{ts, value_ms}, ...]`` dicts."""
        return [{"ts": ts, "value_ms": ms} for ts, ms in self._lg_history]

    # ── overhead computation ───────────────────────────────────────────

    @property
    def overhead_avg_ms(self) -> int | None:
        """Average Gateway overhead (HTTP total − LangGraph processing), or None."""
        gw = self.avg_ms
        lg = self.langgraph_avg_ms
        if gw is None or lg is None:
            return None
        return max(0, gw - lg)

    # ── internal helpers ───────────────────────────────────────────────

    @staticmethod
    def _compute_percentile(history: deque[tuple[float, int]], pct: float) -> int | None:
        values = sorted(ms for _ts, ms in history)
        if not values:
            return None
        k = (len(values) - 1) * pct / 100.0
        f = int(k)
        c = min(f + 1, len(values) - 1)
        if f == c:
            return values[f]
        frac = k - f
        return int(values[f] + (values[c] - values[f]) * frac)

    # ── snapshot helpers ───────────────────────────────────────────────

    def to_snapshot(self) -> dict:
        """Serialize timing data (both dimensions) for persistence."""
        return {
            "samples": list(self.samples),
            "sample_history": list(self.sample_history),
            "last_response_time_ms": self.last_response_time_ms,
            "lg_samples": list(self._lg_samples),
            "lg_history": list(self._lg_history),
            "last_langgraph_time_ms": self.last_langgraph_time_ms,
        }

    @classmethod
    def from_snapshot(cls, data: dict) -> "_AgentTiming":
        """Restore timing data from a previously persisted snapshot."""
        inst = cls()
        inst.samples = deque(data.get("samples", [])[-_MAX_SAMPLES:], maxlen=_MAX_SAMPLES)
        inst.sample_history = deque(
            [(ts, ms) for ts, ms in data.get("sample_history", [])][-_MAX_HISTORY:],
            maxlen=_MAX_HISTORY,
        )
        inst.last_response_time_ms = data.get("last_response_time_ms")
        inst._lg_samples = deque(data.get("lg_samples", [])[-_MAX_SAMPLES:], maxlen=_MAX_SAMPLES)
        inst._lg_history = deque(
            [(ts, ms) for ts, ms in data.get("lg_history", [])][-_MAX_HISTORY:],
            maxlen=_MAX_HISTORY,
        )
        inst.last_langgraph_time_ms = data.get("last_langgraph_time_ms")
        return inst


class TimingStore:
    """Thread-safe store of per-agent timing data."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._agents: dict[str, _AgentTiming] = {}

    # ── core CRUD ──────────────────────────────────────────────────────

    async def record(self, agent_name: str, elapsed_s: float) -> None:
        async with self._lock:
            timing = self._agents.setdefault(agent_name, _AgentTiming())
            timing.record(elapsed_s)

    async def get(self, agent_name: str) -> _AgentTiming:
        async with self._lock:
            return self._agents.get(agent_name, _AgentTiming())

    async def avg_response_time_ms(self, agent_name: str) -> int | None:
        """Return average response time in ms, or None if no data."""
        timing = await self.get(agent_name)
        return timing.avg_ms

    async def last_response_time_ms(self, agent_name: str) -> int | None:
        """Return most recent response time in ms, or None if no data."""
        timing = await self.get(agent_name)
        return timing.last_response_time_ms

    async def get_history(self, agent_name: str) -> list[dict]:
        """Return timestamped response-time history as ``[{ts, value_ms}, ...]``."""
        timing = await self.get(agent_name)
        return timing.history_as_list()

    async def percentile_ms(self, agent_name: str, pct: float) -> int | None:
        """Return the *pct*-th percentile response time in ms."""
        timing = await self.get(agent_name)
        return timing.percentile_ms(pct)

    async def record_langgraph(self, agent_name: str, elapsed_ms: int) -> None:
        """Record a LangGraph processing-time sample for *agent_name*."""
        async with self._lock:
            timing = self._agents.setdefault(agent_name, _AgentTiming())
            timing.record_langgraph(elapsed_ms)

    async def langgraph_avg_response_time_ms(self, agent_name: str) -> int | None:
        """Return average LangGraph processing time in ms, or None if no data."""
        timing = await self.get(agent_name)
        return timing.langgraph_avg_ms

    async def langgraph_last_response_time_ms(self, agent_name: str) -> int | None:
        """Return most recent LangGraph processing time in ms, or None."""
        timing = await self.get(agent_name)
        return timing.last_langgraph_time_ms

    async def langgraph_percentile_ms(self, agent_name: str, pct: float) -> int | None:
        """Return the *pct*-th percentile LangGraph processing time in ms."""
        timing = await self.get(agent_name)
        return timing.langgraph_percentile_ms(pct)

    async def langgraph_history(self, agent_name: str) -> list[dict]:
        """Return timestamped LangGraph processing history as ``[{ts, value_ms}, ...]``."""
        timing = await self.get(agent_name)
        return timing.langgraph_history_as_list()

    async def overhead_avg_ms(self, agent_name: str) -> int | None:
        """Return average Gateway overhead (HTTP total − LangGraph) in ms, or None."""
        timing = await self.get(agent_name)
        return timing.overhead_avg_ms

    async def get_agent_names(self) -> list[str]:
        """Return names of all agents that have timing data."""
        async with self._lock:
            return list(self._agents.keys())

    # ── persistence ────────────────────────────────────────────────────

    async def save_snapshot(self, agent_name: str, agent_dir: Path) -> bool:
        """Persist timing data for *agent_name* to ``agent_dir/timing.json``.

        Returns True on success.
        """
        timing = await self.get(agent_name)
        if not timing.samples and not timing.sample_history:
            return False  # nothing to persist

        snapshot_file = agent_dir / "timing.json"
        try:
            agent_dir.mkdir(parents=True, exist_ok=True)
            snapshot_file.write_text(
                json.dumps(timing.to_snapshot(), ensure_ascii=False),
                encoding="utf-8",
            )
            logger.debug("Saved timing snapshot for %r to %s", agent_name, snapshot_file)
            return True
        except OSError:
            logger.exception("Failed to save timing snapshot for %r", agent_name)
            return False

    async def load_snapshot(self, agent_name: str, agent_dir: Path) -> bool:
        """Load timing data from ``agent_dir/timing.json`` into the store.

        Returns True if a snapshot was found and loaded.
        """
        snapshot_file = agent_dir / "timing.json"
        if not snapshot_file.is_file():
            return False

        try:
            data = json.loads(snapshot_file.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            logger.warning("Corrupt timing snapshot for %r, skipping", agent_name)
            return False

        async with self._lock:
            self._agents[agent_name] = _AgentTiming.from_snapshot(data)
        logger.info("Loaded timing snapshot for %r (%d history samples)", agent_name, len(data.get("sample_history", [])))
        return True

    async def save_all_to_dir(self, base_dir: Path) -> int:
        """Save snapshots for all agents with recorded timing data under *base_dir*.

        *base_dir* is expected to be the agents root (e.g.
        ``deerflow.config.paths.get_paths().base_dir``).  Each agent's data
        is written to ``base_dir/{agent_name}/timing.json``.

        Returns the number of agents successfully saved.
        """
        names = await self.get_agent_names()
        count = 0
        for name in names:
            agent_dir = base_dir / name
            if await self.save_snapshot(name, agent_dir):
                count += 1
        return count

    async def prune_old_snapshots(self, base_dir: Path) -> int:
        """Remove ``timing.json`` files for agents that no longer have a directory.

        Returns the number of orphaned snapshots pruned.
        """
        count = 0
        try:
            for child in base_dir.iterdir():
                if not child.is_dir():
                    continue
                timing_file = child / "timing.json"
                if timing_file.is_file():
                    # If the agent directory is non-empty (has config.yaml etc.),
                    # we keep the snapshot. Otherwise it's orphaned.
                    has_config = (child / "config.yaml").is_file()
                    if not has_config:
                        try:
                            timing_file.unlink()
                            logger.info("Pruned orphan timing snapshot: %s", timing_file)
                            count += 1
                        except OSError:
                            logger.exception("Failed to prune %s", timing_file)
        except OSError:
            logger.exception("Failed to scan %s for orphan snapshots", base_dir)
        return count


# Module-level singleton (safe in single-process ASGI with uvicorn).
_timing_store: Optional[TimingStore] = None


def get_timing_store() -> TimingStore:
    global _timing_store
    if _timing_store is None:
        _timing_store = TimingStore()
    return _timing_store
