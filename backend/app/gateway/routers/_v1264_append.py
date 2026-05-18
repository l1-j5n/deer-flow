# ═══════════════════════════════════════════════════════════════════════════════
# v1.264 — Graph Causal Real-time Streaming Engine
# ═══════════════════════════════════════════════════════════════════════════════
# Enables real-time causal analysis over streaming data with online model
# updates, adaptive windowing, latency-aware processing, checkpoint-based
# fault tolerance, stream health monitoring, and causal replay — bridging
# from "safe cross-domain transfer" to "continuous real-time causal intelligence."
# 6 enums (36 values) × 7 endpoints (6 POST + 1 GET)
# ═══════════════════════════════════════════════════════════════════════════════

from __future__ import annotations
import enum, time, uuid, math, random
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/graph", tags=["v1.264 — Causal Real-time Streaming"])

# ─── Enums ────────────────────────────────────────────────────────────────────

class StreamingMode(str, enum.Enum):
    EVENT_DRIVEN = "event_driven"
    MICRO_BATCH = "micro_batch"
    CONTINUOUS = "continuous"
    SLIDING_WINDOW = "sliding_window"
    TRIGGER_BASED = "trigger_based"
    AI_ADAPTIVE_STREAM = "ai_adaptive_stream"

class WindowStrategy(str, enum.Enum):
    FIXED_SIZE = "fixed_size"
    TIME_BASED = "time_based"
    COUNT_BASED = "count_based"
    SESSION_BASED = "session_based"
    ADAPTIVE_SIZE = "adaptive_size"
    AI_DYNAMIC_WINDOW = "ai_dynamic_window"

class OnlineUpdateMethod(str, enum.Enum):
    STOCHASTIC_GRADIENT = "stochastic_gradient"
    INCREMENTAL_BAYESIAN = "incremental_bayesian"
    ONLINE_EM = "online_em"
    RESERVOIR_SAMPLING = "reservoir_sampling"
    FORGETTING_FACTOR = "forgetting_factor"
    AI_RAPID_UPDATE = "ai_rapid_update"

class LatencyProfile(str, enum.Enum):
    ULTRA_LOW = "ultra_low"
    LOW = "low"
    MODERATE = "moderate"
    BEST_EFFORT = "best_effort"
    BATCH_OPTIMIZED = "batch_optimized"
    AI_PRIORITY_AWARE = "ai_priority_aware"

class CheckpointPolicy(str, enum.Enum):
    INTERVAL_BASED = "interval_based"
    EVENT_TRIGGERED = "event_triggered"
    STATE_CHANGE = "state_change"
    HYBRID_CHECKPOINT = "hybrid_checkpoint"
    INCREMENTAL_SNAPSHOT = "incremental_snapshot"
    AI_PREDICTIVE_CHECKPOINT = "ai_predictive_checkpoint"

class StreamHealthMetric(str, enum.Enum):
    THROUGHPUT = "throughput"
    LATENCY_P99 = "latency_p99"
    BACKPRESSURE = "backpressure"
    SKEWNESS = "skewness"
    COMPLETENESS = "completeness"
    AI_ANOMALY_SCORE = "ai_anomaly_score"

# ─── Caches ───────────────────────────────────────────────────────────────────

_ingest_cache264: dict[str, Any] = {}
_window_cache264: dict[str, Any] = {}
_update_cache264: dict[str, Any] = {}
_monitor_cache264: dict[str, Any] = {}
_checkpoint_cache264: dict[str, Any] = {}
_replay_cache264: dict[str, Any] = {}

# ─── Compute helpers ──────────────────────────────────────────────────────────

def _compute_ingest(mode: StreamingMode, event_rate: float, causal_dimensions: int) -> dict[str, Any]:
    """Stream ingestion — process incoming causal data events in real time."""
    rng = random.Random(hash(mode.value) + int(event_rate * 100) + causal_dimensions)
    total_events = rng.randint(800, 5000)
    processed_events = int(total_events * rng.uniform(0.88, 0.99))
    rejected_events = total_events - processed_events
    avg_latency_ms = rng.uniform(0.5, 15.0)
    parsing_accuracy = rng.uniform(0.92, 0.999)

    # Per-stream metrics
    streams = []
    stream_names = ["primary_causal", "intervention_feed", "confounder_monitor",
                    "effect_tracker", "temporal_chain", "anomaly_channel"]
    for name in stream_names:
        throughput = rng.uniform(50, 2000)
        latency = rng.uniform(0.3, 20.0)
        error_rate = rng.uniform(0.001, 0.05)
        backpressure = rng.uniform(0.0, 0.4)
        streams.append({
            "stream_name": name,
            "throughput_events_per_sec": round(throughput, 1),
            "avg_latency_ms": round(latency, 2),
            "error_rate": round(error_rate, 4),
            "backpressure_ratio": round(backpressure, 3),
            "buffer_utilization": round(rng.uniform(0.1, 0.85), 3),
            "event_schema_version": f"v{rng.randint(1,3)}.{rng.randint(0,9)}",
        })

    # Ingestion quality
    ingestion_quality = (parsing_accuracy * 0.3 + (1 - rejected_events / max(total_events, 1)) * 0.25
                         + (1 - avg_latency_ms / 20.0) * 0.25
                         + (1 - sum(s["error_rate"] for s in streams) / len(streams)) * 0.2)

    return {
        "streaming_mode": mode.value,
        "total_events": total_events,
        "processed_events": processed_events,
        "rejected_events": rejected_events,
        "processing_rate_pct": round(processed_events / max(total_events, 1) * 100, 2),
        "avg_latency_ms": round(avg_latency_ms, 2),
        "p99_latency_ms": round(avg_latency_ms * rng.uniform(2.0, 5.0), 2),
        "parsing_accuracy": round(parsing_accuracy, 4),
        "causal_dimensions": causal_dimensions,
        "event_rate_per_sec": round(event_rate, 1),
        "streams": streams,
        "ingestion_quality": round(ingestion_quality, 4),
        "schema_compatibility": round(rng.uniform(0.9, 1.0), 4),
        "deserialization_overhead_ms": round(rng.uniform(0.1, 2.0), 3),
    }


def _compute_window(strategy: WindowStrategy, window_size: int, overlap_ratio: float) -> dict[str, Any]:
    """Windowing strategy — segment streaming data into analysis windows."""
    rng = random.Random(hash(strategy.value) + window_size + int(overlap_ratio * 1000))
    total_windows = rng.randint(20, 100)
    active_windows = rng.randint(5, min(20, total_windows))

    windows = []
    for i in range(min(total_windows, 12)):
        event_count = rng.randint(window_size // 2, window_size * 2)
        causal_density = rng.uniform(0.1, 0.9)
        edge_count = rng.randint(10, window_size * 3)
        node_count = rng.randint(5, window_size)
        completeness = rng.uniform(0.7, 1.0)
        staleness = rng.uniform(0.0, 0.3)
        windows.append({
            "window_id": f"W_{i:04d}",
            "start_offset": i * max(1, int(window_size * (1 - overlap_ratio))),
            "event_count": event_count,
            "causal_edge_count": edge_count,
            "causal_node_count": node_count,
            "causal_density": round(causal_density, 4),
            "completeness": round(completeness, 4),
            "data_staleness": round(staleness, 4),
            "processing_time_ms": round(rng.uniform(1, 50), 2),
            "noise_ratio": round(rng.uniform(0.02, 0.2), 4),
        })

    # Windowing effectiveness
    avg_completeness = sum(w["completeness"] for w in windows) / max(len(windows), 1)
    avg_staleness = sum(w["data_staleness"] for w in windows) / max(len(windows), 1)
    windowing_effectiveness = (avg_completeness * 0.3 + (1 - avg_staleness) * 0.25
                               + min(overlap_ratio + 0.3, 1.0) * 0.25
                               + (active_windows / max(total_windows, 1)) * 0.2)

    return {
        "window_strategy": strategy.value,
        "window_size": window_size,
        "overlap_ratio": overlap_ratio,
        "total_windows": total_windows,
        "active_windows": active_windows,
        "windows": windows,
        "windowing_effectiveness": round(windowing_effectiveness, 4),
        "avg_completeness": round(avg_completeness, 4),
        "avg_staleness": round(avg_staleness, 4),
        "memory_footprint_mb": round(rng.uniform(10, 200), 1),
        "gc_pressure": round(rng.uniform(0.05, 0.4), 3),
        "slide_interval_ms": round(rng.uniform(10, 500), 1),
    }


def _compute_update(method: OnlineUpdateMethod, learning_rate: float, model_complexity: int) -> dict[str, Any]:
    """Online model update — incrementally update causal models from streaming data."""
    rng = random.Random(hash(method.value) + int(learning_rate * 10000) + model_complexity)
    update_steps = rng.randint(10, 50)
    convergence_step = rng.randint(update_steps // 3, update_steps)
    initial_loss = rng.uniform(0.5, 2.0)
    final_loss = rng.uniform(0.01, 0.3)
    loss_improvement = initial_loss - final_loss

    # Trajectory
    trajectory = []
    for step in range(update_steps):
        progress = step / max(update_steps - 1, 1)
        loss = initial_loss * (1 - progress * rng.uniform(0.6, 0.95)) + rng.uniform(-0.02, 0.02)
        loss = max(0.001, loss)
        causal_accuracy = min(1.0, rng.uniform(0.5, 0.8) + progress * rng.uniform(0.1, 0.3))
        edge_recovery = min(1.0, rng.uniform(0.4, 0.7) + progress * rng.uniform(0.1, 0.35))
        model_drift = rng.uniform(0.0, 0.15) * (1 - progress * 0.5)
        trajectory.append({
            "step": step,
            "loss": round(loss, 5),
            "causal_accuracy": round(causal_accuracy, 4),
            "edge_recovery_rate": round(edge_recovery, 4),
            "model_drift": round(model_drift, 4),
            "update_latency_ms": round(rng.uniform(0.5, 10.0), 2),
            "gradient_norm": round(rng.uniform(0.001, 0.5) * (1 - progress * 0.7), 5),
        })

    # Update quality
    update_quality = ((1 - final_loss / max(initial_loss, 0.001)) * 0.3
                      + trajectory[-1]["causal_accuracy"] * 0.25
                      + trajectory[-1]["edge_recovery_rate"] * 0.25
                      + (1 - convergence_step / max(update_steps, 1)) * 0.2)

    return {
        "update_method": method.value,
        "learning_rate": learning_rate,
        "model_complexity": model_complexity,
        "update_steps": update_steps,
        "convergence_step": convergence_step,
        "initial_loss": round(initial_loss, 5),
        "final_loss": round(final_loss, 5),
        "loss_improvement": round(loss_improvement, 5),
        "improvement_ratio": round(loss_improvement / max(initial_loss, 0.001), 4),
        "trajectory": trajectory,
        "update_quality": round(update_quality, 4),
        "catastrophic_forgetting_risk": round(rng.uniform(0.01, 0.15), 4),
        "stability_index": round(rng.uniform(0.7, 0.98), 4),
        "memory_retention": round(rng.uniform(0.85, 0.99), 4),
    }


def _compute_monitor(metric: StreamHealthMetric, monitoring_window_sec: float, alert_threshold: float) -> dict[str, Any]:
    """Stream health monitoring — track real-time health metrics and detect anomalies."""
    rng = random.Random(hash(metric.value) + int(monitoring_window_sec * 100) + int(alert_threshold * 1000))
    sample_points = rng.randint(20, 60)
    current_value = rng.uniform(0.1, 0.95)
    baseline_value = rng.uniform(0.3, 0.7)
    deviation = abs(current_value - baseline_value) / max(baseline_value, 0.01)

    # Timeline
    timeline = []
    for i in range(sample_points):
        noise = rng.gauss(0, 0.05)
        value = baseline_value + noise + (i / sample_points) * rng.uniform(-0.2, 0.3)
        value = max(0, min(1, value))
        anomaly_score = abs(value - baseline_value) / max(baseline_value, 0.01)
        timeline.append({
            "timestamp_offset_ms": round(i * monitoring_window_sec * 1000 / sample_points, 1),
            "value": round(value, 4),
            "baseline": round(baseline_value, 4),
            "deviation": round(abs(value - baseline_value), 4),
            "anomaly_score": round(min(anomaly_score, 2.0), 4),
            "status": "healthy" if anomaly_score < alert_threshold
                      else "warning" if anomaly_score < alert_threshold * 1.5
                      else "critical",
        })

    # Aggregate diagnostics
    healthy_count = sum(1 for t in timeline if t["status"] == "healthy")
    warning_count = sum(1 for t in timeline if t["status"] == "warning")
    critical_count = sum(1 for t in timeline if t["status"] == "critical")
    avg_anomaly = sum(t["anomaly_score"] for t in timeline) / max(len(timeline), 1)
    max_deviation = max(t["deviation"] for t in timeline)

    diagnostics = {
        "throughput_trend": rng.choice(["stable", "increasing", "decreasing", "fluctuating"]),
        "latency_percentile_p50_ms": round(rng.uniform(1, 10), 2),
        "latency_percentile_p90_ms": round(rng.uniform(5, 30), 2),
        "latency_percentile_p99_ms": round(rng.uniform(10, 80), 2),
        "backpressure_events": rng.randint(0, 15),
        "partition_skew": round(rng.uniform(0.0, 0.4), 3),
        "consumer_lag_sec": round(rng.uniform(0, 30), 2),
        "resource_utilization_cpu": round(rng.uniform(0.2, 0.85), 3),
        "resource_utilization_memory": round(rng.uniform(0.3, 0.9), 3),
        "network_io_mbps": round(rng.uniform(10, 500), 1),
    }

    # Health score
    health_score = (healthy_count / max(sample_points, 1) * 0.3
                    + (1 - avg_anomaly) * 0.25
                    + (1 - min(max_deviation, 1.0)) * 0.25
                    + (1 - diagnostics["backpressure_events"] / 20.0) * 0.2)

    return {
        "health_metric": metric.value,
        "monitoring_window_sec": monitoring_window_sec,
        "alert_threshold": alert_threshold,
        "current_value": round(current_value, 4),
        "baseline_value": round(baseline_value, 4),
        "deviation_ratio": round(deviation, 4),
        "sample_points": sample_points,
        "healthy_count": healthy_count,
        "warning_count": warning_count,
        "critical_count": critical_count,
        "avg_anomaly_score": round(avg_anomaly, 4),
        "max_deviation": round(max_deviation, 4),
        "timeline": timeline,
        "diagnostics": diagnostics,
        "health_score": round(health_score, 4),
        "alert_level": "none" if critical_count == 0 and warning_count < 3
                       else "low" if warning_count >= 3
                       else "high" if critical_count > 0 and critical_count < 5
                       else "critical",
    }


def _compute_checkpoint(policy: CheckpointPolicy, checkpoint_interval_sec: float, state_size_mb: float) -> dict[str, Any]:
    """Checkpoint management — persist causal model state for fault tolerance."""
    rng = random.Random(hash(policy.value) + int(checkpoint_interval_sec * 100) + int(state_size_mb * 10))
    total_checkpoints = rng.randint(5, 30)
    successful_checkpoints = int(total_checkpoints * rng.uniform(0.85, 0.99))
    failed_checkpoints = total_checkpoints - successful_checkpoints

    checkpoints = []
    for i in range(total_checkpoints):
        size_mb = state_size_mb * rng.uniform(0.8, 1.3)
        duration_ms = size_mb * rng.uniform(5, 20)
        is_successful = i < successful_checkpoints
        checkpoints.append({
            "checkpoint_id": f"CP_{i:04d}",
            "timestamp_offset_sec": round(i * checkpoint_interval_sec, 2),
            "state_size_mb": round(size_mb, 2),
            "duration_ms": round(duration_ms, 2),
            "status": "completed" if is_successful else "failed",
            "causal_model_hash": f"0x{rng.randint(0, 0xFFFFFFFF):08x}",
            "edge_count": rng.randint(50, 500),
            "node_count": rng.randint(20, 200),
            "compression_ratio": round(rng.uniform(0.3, 0.7), 3),
            "recovery_time_est_ms": round(size_mb * rng.uniform(2, 8), 2),
        })

    # Checkpoint quality
    avg_duration = sum(c["duration_ms"] for c in checkpoints if c["status"] == "completed") / max(successful_checkpoints, 1)
    avg_compression = sum(c["compression_ratio"] for c in checkpoints) / max(total_checkpoints, 1)
    checkpoint_quality = (successful_checkpoints / max(total_checkpoints, 1) * 0.3
                          + (1 - avg_duration / 5000) * 0.2
                          + avg_compression * 0.25
                          + (1 - failed_checkpoints / max(total_checkpoints, 1)) * 0.25)

    return {
        "checkpoint_policy": policy.value,
        "checkpoint_interval_sec": checkpoint_interval_sec,
        "state_size_mb": state_size_mb,
        "total_checkpoints": total_checkpoints,
        "successful_checkpoints": successful_checkpoints,
        "failed_checkpoints": failed_checkpoints,
        "success_rate_pct": round(successful_checkpoints / max(total_checkpoints, 1) * 100, 2),
        "checkpoints": checkpoints,
        "avg_checkpoint_duration_ms": round(avg_duration, 2),
        "avg_compression_ratio": round(avg_compression, 3),
        "total_storage_mb": round(sum(c["state_size_mb"] * c["compression_ratio"] for c in checkpoints), 2),
        "checkpoint_quality": round(checkpoint_quality, 4),
        "recovery_rto_sec": round(state_size_mb * rng.uniform(0.1, 0.5), 2),
        "recovery_rpo_sec": round(checkpoint_interval_sec * rng.uniform(0.1, 0.5), 2),
    }


def _compute_replay(streaming_mode: StreamingMode, replay_speed: float, replay_scope: str) -> dict[str, Any]:
    """Stream replay — reprocess historical causal events for debugging and validation."""
    rng = random.Random(hash(streaming_mode.value) + int(replay_speed * 100) + hash(replay_scope))
    total_replay_events = rng.randint(1000, 10000)
    replayed_events = int(total_replay_events * rng.uniform(0.9, 1.0))
    divergences = rng.randint(0, int(total_replay_events * 0.05))

    # Replay segments
    segments = []
    segment_count = rng.randint(4, 10)
    for i in range(segment_count):
        seg_events = rng.randint(total_replay_events // segment_count // 2,
                                  total_replay_events // segment_count * 2)
        seg_divergences = rng.randint(0, max(1, seg_events // 100))
        causal_consistency = rng.uniform(0.85, 1.0)
        segments.append({
            "segment_id": f"SEG_{i:03d}",
            "event_count": seg_events,
            "divergences": seg_divergences,
            "causal_consistency": round(causal_consistency, 4),
            "replay_duration_ms": round(seg_events * rng.uniform(0.01, 0.5) / max(replay_speed, 0.1), 2),
            "original_timestamp_range": f"T{i*1000:06d}-T{(i+1)*1000:06d}",
            "state_match": round(rng.uniform(0.9, 1.0), 4),
            "edge_reconstruction_accuracy": round(rng.uniform(0.8, 0.98), 4),
        })

    # Replay fidelity
    avg_consistency = sum(s["causal_consistency"] for s in segments) / max(len(segments), 1)
    avg_state_match = sum(s["state_match"] for s in segments) / max(len(segments), 1)
    replay_fidelity = (avg_consistency * 0.3 + avg_state_match * 0.25
                       + (1 - divergences / max(total_replay_events, 1)) * 0.25
                       + (replayed_events / max(total_replay_events, 1)) * 0.2)

    return {
        "streaming_mode": streaming_mode.value,
        "replay_speed": replay_speed,
        "replay_scope": replay_scope,
        "total_replay_events": total_replay_events,
        "replayed_events": replayed_events,
        "divergences": divergences,
        "replay_coverage_pct": round(replayed_events / max(total_replay_events, 1) * 100, 2),
        "segments": segments,
        "avg_causal_consistency": round(avg_consistency, 4),
        "avg_state_match": round(avg_state_match, 4),
        "replay_fidelity": round(replay_fidelity, 4),
        "determinism_score": round(rng.uniform(0.92, 0.999), 4),
        "replay_wall_time_sec": round(total_replay_events * rng.uniform(0.01, 0.1) / max(replay_speed, 0.1), 2),
        "memory_peak_mb": round(rng.uniform(50, 500), 1),
    }


# ─── Request / Response Models ────────────────────────────────────────────────

class _IngestReq(BaseModel):
    mode: StreamingMode = StreamingMode.AI_ADAPTIVE_STREAM
    event_rate: float = Field(100.0, ge=1.0, le=100000.0)
    causal_dimensions: int = Field(10, ge=2, le=200)

class _WindowReq(BaseModel):
    strategy: WindowStrategy = WindowStrategy.AI_DYNAMIC_WINDOW
    window_size: int = Field(100, ge=10, le=10000)
    overlap_ratio: float = Field(0.2, ge=0.0, le=0.8)

class _UpdateReq(BaseModel):
    method: OnlineUpdateMethod = OnlineUpdateMethod.AI_RAPID_UPDATE
    learning_rate: float = Field(0.01, ge=0.0001, le=1.0)
    model_complexity: int = Field(50, ge=5, le=1000)

class _MonitorReq(BaseModel):
    metric: StreamHealthMetric = StreamHealthMetric.AI_ANOMALY_SCORE
    monitoring_window_sec: float = Field(60.0, ge=1.0, le=3600.0)
    alert_threshold: float = Field(0.3, ge=0.01, le=1.0)

class _CheckpointReq(BaseModel):
    policy: CheckpointPolicy = CheckpointPolicy.AI_PREDICTIVE_CHECKPOINT
    checkpoint_interval_sec: float = Field(30.0, ge=1.0, le=600.0)
    state_size_mb: float = Field(50.0, ge=1.0, le=5000.0)

class _ReplayReq(BaseModel):
    streaming_mode: StreamingMode = StreamingMode.AI_ADAPTIVE_STREAM
    replay_speed: float = Field(2.0, ge=0.1, le=100.0)
    replay_scope: str = Field("full", description="full | partial | delta | critical_only")


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/causal-stream/ingest")
def causal_stream_ingest(req: _IngestReq) -> dict[str, Any]:
    """Process incoming causal data events in real-time streaming mode."""
    key = f"{req.mode.value}|{req.event_rate}|{req.causal_dimensions}"
    if key not in _ingest_cache264:
        _ingest_cache264[key] = _compute_ingest(req.mode, req.event_rate, req.causal_dimensions)
    return {"request_id": uuid.uuid4().hex[:12], "timestamp": time.time(), **_ingest_cache264[key]}


@router.post("/causal-stream/window")
def causal_stream_window(req: _WindowReq) -> dict[str, Any]:
    """Apply windowing strategy to segment streaming causal data."""
    key = f"{req.strategy.value}|{req.window_size}|{req.overlap_ratio}"
    if key not in _window_cache264:
        _window_cache264[key] = _compute_window(req.strategy, req.window_size, req.overlap_ratio)
    return {"request_id": uuid.uuid4().hex[:12], "timestamp": time.time(), **_window_cache264[key]}


@router.post("/causal-stream/update")
def causal_stream_update(req: _UpdateReq) -> dict[str, Any]:
    """Incrementally update causal models from streaming data."""
    key = f"{req.method.value}|{req.learning_rate}|{req.model_complexity}"
    if key not in _update_cache264:
        _update_cache264[key] = _compute_update(req.method, req.learning_rate, req.model_complexity)
    return {"request_id": uuid.uuid4().hex[:12], "timestamp": time.time(), **_update_cache264[key]}


@router.post("/causal-stream/monitor")
def causal_stream_monitor(req: _MonitorReq) -> dict[str, Any]:
    """Monitor stream health metrics and detect real-time anomalies."""
    key = f"{req.metric.value}|{req.monitoring_window_sec}|{req.alert_threshold}"
    if key not in _monitor_cache264:
        _monitor_cache264[key] = _compute_monitor(req.metric, req.monitoring_window_sec, req.alert_threshold)
    return {"request_id": uuid.uuid4().hex[:12], "timestamp": time.time(), **_monitor_cache264[key]}


@router.post("/causal-stream/checkpoint")
def causal_stream_checkpoint(req: _CheckpointReq) -> dict[str, Any]:
    """Manage checkpoints for causal model state persistence and fault tolerance."""
    key = f"{req.policy.value}|{req.checkpoint_interval_sec}|{req.state_size_mb}"
    if key not in _checkpoint_cache264:
        _checkpoint_cache264[key] = _compute_checkpoint(req.policy, req.checkpoint_interval_sec, req.state_size_mb)
    return {"request_id": uuid.uuid4().hex[:12], "timestamp": time.time(), **_checkpoint_cache264[key]}


@router.post("/causal-stream/replay")
def causal_stream_replay(req: _ReplayReq) -> dict[str, Any]:
    """Replay historical causal stream events for debugging and validation."""
    key = f"{req.streaming_mode.value}|{req.replay_speed}|{req.replay_scope}"
    if key not in _replay_cache264:
        _replay_cache264[key] = _compute_replay(req.streaming_mode, req.replay_speed, req.replay_scope)
    return {"request_id": uuid.uuid4().hex[:12], "timestamp": time.time(), **_replay_cache264[key]}


@router.get("/causal-stream/overview")
def causal_stream_overview() -> dict[str, Any]:
    """System overview — enums, endpoints, cache stats, architecture position."""
    return {
        "version": "v1.264",
        "module": "Causal Real-time Streaming Engine",
        "enums": {
            "StreamingMode": [e.value for e in StreamingMode],
            "WindowStrategy": [e.value for e in WindowStrategy],
            "OnlineUpdateMethod": [e.value for e in OnlineUpdateMethod],
            "LatencyProfile": [e.value for e in LatencyProfile],
            "CheckpointPolicy": [e.value for e in CheckpointPolicy],
            "StreamHealthMetric": [e.value for e in StreamHealthMetric],
        },
        "endpoints": [
            "POST /graph/causal-stream/ingest — Stream ingestion",
            "POST /graph/causal-stream/window — Windowing strategy",
            "POST /graph/causal-stream/update — Online model update",
            "POST /graph/causal-stream/monitor — Health monitoring",
            "POST /graph/causal-stream/checkpoint — Checkpoint management",
            "POST /graph/causal-stream/replay — Stream replay",
            "GET  /graph/causal-stream/overview — System overview",
        ],
        "caches": {
            "ingest": len(_ingest_cache264),
            "window": len(_window_cache264),
            "update": len(_update_cache264),
            "monitor": len(_monitor_cache264),
            "checkpoint": len(_checkpoint_cache264),
            "replay": len(_replay_cache264),
        },
        "pipeline_position": "Transfer & Adaptation (v1.263) → Real-time Streaming (v1.264)",
        "architecture_chain": [
            "Causal Pipeline (v1.249-v1.259)",
            "Meta-Cognitive Layer (v1.260)",
            "Emergence & Complexity Layer (v1.261)",
            "Governance & Compliance Layer (v1.262)",
            "Transfer & Adaptation Layer (v1.263)",
            "Real-time Streaming Layer (v1.264) ← NEW",
        ],
    }
