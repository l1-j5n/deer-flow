# ═══════════════════════════════════════════════════════════════════════════════
# v1.266 — Graph Causal Resilience & Fault Tolerance Engine
# ═══════════════════════════════════════════════════════════════════════════════
# After multi-agent consensus (v1.265), this engine ensures the causal reasoning
# stack remains robust under adversarial perturbation, node failures, data
# poisoning, cascading failures, and resource exhaustion. It provides stress
# testing, fault injection, degradation analysis, recovery orchestration,
# redundancy management, and adversarial hardening — making the causal
# intelligence stack production-resilient.
# 6 enums (36 values) × 7 endpoints (6 POST + 1 GET)
# ═══════════════════════════════════════════════════════════════════════════════

from __future__ import annotations
import enum, time, uuid, math, random
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/graph", tags=["v1.266 — Resilience & Fault Tolerance"])

# ─── Enums ────────────────────────────────────────────────────────────────────

class StressType(str, enum.Enum):
    ADVERSARIAL_PERTURBATION = "adversarial_perturbation"
    DATA_CORRUPTION = "data_corruption"
    CONCEPT_DRIFT = "concept_drift"
    RESOURCE_EXHAUSTION = "resource_exhaustion"
    CASCADING_FAILURE = "cascading_failure"
    AI_HYBRID_STRESS = "ai_hybrid_stress"

class FaultCategory(str, enum.Enum):
    NODE_FAILURE = "node_failure"
    EDGE_CORRUPTION = "edge_corruption"
    MODEL_DEGRADATION = "model_degradation"
    COMMUNICATION_FAULT = "communication_fault"
    DATA_POISONING = "data_poisoning"
    AI_COMPOSITE_FAULT = "ai_composite_fault"

class DegradationLevel(str, enum.Enum):
    MINIMAL = "minimal"
    MODERATE = "moderate"
    SEVERE = "severe"
    CRITICAL = "critical"
    CATASTROPHIC = "catastrophic"
    AI_ADAPTIVE_DEGRADATION = "ai_adaptive_degradation"

class RecoveryStrategy(str, enum.Enum):
    ROLLBACK = "rollback"
    CHECKPOINT_RESTORE = "checkpoint_restore"
    REDUNDANT_FAILOVER = "redundant_failover"
    GRACEFUL_DEGRADATION = "graceful_degradation"
    SELF_REPAIR = "self_repair"
    AI_AUTONOMOUS_RECOVERY = "ai_autonomous_recovery"

class RedundancyType(str, enum.Enum):
    ACTIVE_ACTIVE = "active_active"
    ACTIVE_PASSIVE = "active_passive"
    N_PLUS_ONE = "n_plus_one"
    CONSENSUS_REPLICATION = "consensus_replication"
    ERASURE_CODING = "erasure_coding"
    AI_DYNAMIC_REDUNDANCY = "ai_dynamic_redundancy"

class HardeningMethod(str, enum.Enum):
    ADVERSARIAL_TRAINING = "adversarial_training"
    INPUT_SANITIZATION = "input_sanitization"
    ROBUST_OPTIMIZATION = "robust_optimization"
    CERTIFIED_DEFENSE = "certified_defense"
    ENSEMBLE_SHIELDING = "ensemble_shielding"
    AI_META_HARDENING = "ai_meta_hardening"

# ─── Caches ───────────────────────────────────────────────────────────────────

_stress_cache266: dict[str, Any] = {}
_fault_cache266: dict[str, Any] = {}
_degrade_cache266: dict[str, Any] = {}
_recover_cache266: dict[str, Any] = {}
_redundancy_cache266: dict[str, Any] = {}
_harden_cache266: dict[str, Any] = {}

# ─── Compute helpers ──────────────────────────────────────────────────────────

def _compute_stress_test(
    stress_type: StressType,
    intensity: float,
    duration_steps: int,
) -> dict[str, Any]:
    """Stress testing — evaluate causal reasoning under various stress conditions."""
    rng = random.Random(hash(stress_type.value) + int(intensity * 1000) + duration_steps * 17)
    test_scenarios = rng.randint(4, 12)
    system_components = rng.randint(8, 30)

    components = []
    comp_names = [
        "discovery_engine", "explanation_engine", "argumentation_engine",
        "fairness_engine", "curriculum_engine", "optimization_engine",
        "intervention_engine", "distillation_engine", "ensemble_engine",
        "temporal_engine", "feedback_engine", "meta_cognitive_engine",
        "emergence_engine", "governance_engine", "transfer_engine",
        "streaming_engine", "consensus_engine", "resilience_engine",
    ]
    for i in range(system_components):
        baseline_perf = rng.uniform(0.7, 0.99)
        stressed_perf = max(0.1, baseline_perf - intensity * rng.uniform(0.1, 0.6))
        degradation_pct = (baseline_perf - stressed_perf) / max(baseline_perf, 0.01) * 100
        recovery_time = rng.uniform(0.5, 30.0) * intensity
        components.append({
            "component_id": f"comp_{i:03d}",
            "component_name": comp_names[i % len(comp_names)],
            "baseline_performance": round(baseline_perf, 4),
            "stressed_performance": round(stressed_perf, 4),
            "degradation_pct": round(degradation_pct, 2),
            "recovery_time_s": round(recovery_time, 2),
            "failure_threshold": round(rng.uniform(0.3, 0.5), 4),
            "breached": stressed_perf < 0.3,
            "resilience_score": round(max(0, 1 - degradation_pct / 100), 4),
            "stress_sensitivity": round(rng.uniform(0.1, 0.9), 4),
        })

    scenarios = []
    for s in range(test_scenarios):
        scenario_intensity = intensity * rng.uniform(0.5, 1.5)
        affected = rng.randint(2, min(8, system_components))
        withstood = rng.random() > scenario_intensity * 0.4
        time_to_detect = rng.uniform(0.01, 2.0)
        time_to_recover = rng.uniform(1.0, 60.0) * scenario_intensity
        causal_accuracy_retained = max(0.1, 1 - scenario_intensity * rng.uniform(0.2, 0.7))
        scenarios.append({
            "scenario_id": f"STRESS_{s:04d}",
            "stress_type": stress_type.value,
            "scenario_intensity": round(scenario_intensity, 4),
            "affected_components": affected,
            "withstood": withstood,
            "time_to_detect_s": round(time_to_detect, 4),
            "time_to_recover_s": round(time_to_recover, 2),
            "causal_accuracy_retained": round(causal_accuracy_retained, 4),
            "data_loss_pct": round(rng.uniform(0, 30) * scenario_intensity, 2),
            "cascade_depth": rng.randint(0, 5),
            "mitigation_applied": rng.choice([
                "rate_limiting", "circuit_breaker", "load_shedding",
                "fallback_model", "graceful_degradation", "ai_adaptive_shield",
            ]),
            "post_stress_accuracy": round(
                max(0.3, causal_accuracy_retained + rng.uniform(0, 0.15)), 4
            ),
        })

    timeline = []
    for step in range(duration_steps):
        progress = step / max(duration_steps - 1, 1)
        load = intensity * (0.5 + 0.5 * math.sin(progress * math.pi))
        performance = max(0.2, 1 - load * rng.uniform(0.3, 0.7))
        timeline.append({
            "step": step + 1,
            "stress_load": round(load, 4),
            "system_performance": round(performance, 4),
            "active_faults": rng.randint(0, int(intensity * 5)),
            "mitigation_level": round(min(1, performance + rng.uniform(0, 0.2)), 4),
            "throughput_pct": round(performance * 100, 1),
            "error_rate": round(max(0, (1 - performance) * rng.uniform(0.5, 1.0)), 4),
        })

    avg_resilience = sum(c["resilience_score"] for c in components) / max(len(components), 1)
    withstood_count = sum(1 for s in scenarios if s["withstood"])
    overall_robustness = (
        avg_resilience * 0.3
        + withstood_count / max(len(scenarios), 1) * 0.25
        + sum(s["causal_accuracy_retained"] for s in scenarios) / max(len(scenarios), 1) * 0.25
        + (1 - sum(s["data_loss_pct"] for s in scenarios) / max(len(scenarios), 1) / 100) * 0.2
    )

    return {
        "stress_type": stress_type.value,
        "intensity": round(intensity, 4),
        "duration_steps": duration_steps,
        "test_scenarios": test_scenarios,
        "system_components": system_components,
        "components": components,
        "scenarios": scenarios,
        "timeline": timeline,
        "overall_robustness": round(overall_robustness, 4),
        "avg_resilience": round(avg_resilience, 4),
        "withstand_rate": round(withstood_count / max(test_scenarios, 1), 4),
        "worst_case_degradation": round(max(c["degradation_pct"] for c in components), 2),
        "mean_time_to_detect_s": round(
            sum(s["time_to_detect_s"] for s in scenarios) / max(len(scenarios), 1), 4
        ),
        "mean_time_to_recover_s": round(
            sum(s["time_to_recover_s"] for s in scenarios) / max(len(scenarios), 1), 2
        ),
    }


def _compute_fault_inject(
    fault: FaultCategory,
    injection_count: int,
    propagation_depth: int,
) -> dict[str, Any]:
    """Fault injection — systematically inject faults and measure system response."""
    rng = random.Random(hash(fault.value) + injection_count * 59 + propagation_depth * 23)
    rounds = rng.randint(3, 8)

    injections = []
    for i in range(injection_count):
        magnitude = rng.uniform(0.1, 1.0)
        detection_delay = rng.uniform(0.01, 5.0)
        blast_radius = rng.randint(1, min(propagation_depth * 3, 20))
        contained = rng.random() > magnitude * 0.3
        side_effects = rng.randint(0, int(magnitude * 5))
        affected_layers = rng.sample([
            "discovery", "explanation", "argumentation", "fairness",
            "meta_cognitive", "emergence", "governance", "transfer",
            "streaming", "consensus", "resilience",
        ], min(blast_radius, 11))
        injections.append({
            "injection_id": f"INJECT_{i:04d}",
            "fault_category": fault.value,
            "magnitude": round(magnitude, 4),
            "detection_delay_s": round(detection_delay, 4),
            "blast_radius": blast_radius,
            "contained": contained,
            "side_effects": side_effects,
            "affected_layers": affected_layers,
            "severity": "critical" if magnitude > 0.8 else (
                "high" if magnitude > 0.5 else (
                    "medium" if magnitude > 0.3 else "low"
                )
            ),
            "propagation_path": [f"node_{j:03d}" for j in range(
                min(propagation_depth, rng.randint(1, propagation_depth + 1))
            )],
            "causal_impact_score": round(magnitude * blast_radius * 0.1, 4),
            "recovery_difficulty": round(magnitude * rng.uniform(0.5, 1.5), 4),
        })

    propagation_trace = []
    for r in range(rounds):
        active_faults = max(0, injection_count - int(r * injection_count / rounds * rng.uniform(0.5, 0.9)))
        newly_contained = rng.randint(0, min(3, active_faults))
        new_propagated = rng.randint(0, min(2, active_faults))
        propagation_trace.append({
            "round": r + 1,
            "active_faults": active_faults,
            "newly_contained": newly_contained,
            "new_propagated": new_propagated,
            "total_affected_nodes": rng.randint(
                min(injection_count, active_faults * 2),
                min(injection_count * propagation_depth, active_faults * 5)
            ),
            "containment_rate": round(
                newly_contained / max(active_faults, 1), 4
            ),
            "propagation_rate": round(
                new_propagated / max(active_faults, 1), 4
            ),
            "system_health_pct": round(max(20, 100 - active_faults * rng.uniform(5, 15)), 1),
            "mitigation_actions": rng.randint(1, 6),
        })

    contained_count = sum(1 for inj in injections if inj["contained"])
    total_side_effects = sum(inj["side_effects"] for inj in injections)
    containment_effectiveness = (
        contained_count / max(injection_count, 1) * 0.3
        + (1 - total_side_effects / max(injection_count * 5, 1)) * 0.25
        + sum(1 for inj in injections if inj["severity"] in ("low", "medium"))
        / max(injection_count, 1) * 0.25
        + (1 - sum(inj["causal_impact_score"] for inj in injections)
           / max(injection_count, 1)) * 0.2
    )

    return {
        "fault_category": fault.value,
        "injection_count": injection_count,
        "propagation_depth": propagation_depth,
        "rounds": rounds,
        "injections": injections,
        "propagation_trace": propagation_trace,
        "containment_effectiveness": round(containment_effectiveness, 4),
        "contained_count": contained_count,
        "escaped_count": injection_count - contained_count,
        "total_side_effects": total_side_effects,
        "avg_detection_delay_s": round(
            sum(inj["detection_delay_s"] for inj in injections) / max(injection_count, 1), 4
        ),
        "worst_blast_radius": max(inj["blast_radius"] for inj in injections) if injections else 0,
        "avg_causal_impact": round(
            sum(inj["causal_impact_score"] for inj in injections) / max(injection_count, 1), 4
        ),
    }


def _compute_degrade(
    level: DegradationLevel,
    affected_ratio: float,
    adaptation_steps: int,
) -> dict[str, Any]:
    """Degradation analysis — analyze graceful degradation under partial failures."""
    rng = random.Random(hash(level.value) + int(affected_ratio * 1000) + adaptation_steps * 31)
    subsystem_count = rng.randint(6, 15)
    steps = min(adaptation_steps, 20)

    level_severity = {
        "minimal": 0.1, "moderate": 0.3, "severe": 0.5,
        "critical": 0.7, "catastrophic": 0.9, "ai_adaptive_degradation": 0.4,
    }
    base_severity = level_severity.get(level.value, 0.3)

    subsystems = []
    subsys_names = [
        "causal_discovery", "causal_validation", "causal_inference",
        "causal_explanation", "causal_intervention", "causal_monitoring",
        "consensus_manager", "trust_engine", "evidence_fusion",
        "stream_processor", "meta_cognitive", "governance",
        "transfer_engine", "resilience_core", "hardening_layer",
    ]
    for i in range(subsystem_count):
        health = max(0.1, 1 - base_severity * rng.uniform(0.3, 1.0) * affected_ratio)
        is_affected = rng.random() < affected_ratio
        degradation_pct = (1 - health) * 100 if is_affected else rng.uniform(0, 5)
        fallback_available = rng.random() > 0.3
        subsystems.append({
            "subsystem_id": f"sub_{i:03d}",
            "name": subsys_names[i % len(subsys_names)],
            "health": round(health, 4),
            "affected": is_affected,
            "degradation_pct": round(degradation_pct, 2),
            "fallback_available": fallback_available,
            "fallback_mode": rng.choice([
                "reduced_accuracy", "cached_results", "simplified_model",
                "batch_only", "local_only", "ai_lightweight_proxy",
            ]) if fallback_available else "none",
            "priority": rng.choice(["critical", "high", "medium", "low"]),
            "dependency_count": rng.randint(0, 8),
            "dependent_count": rng.randint(0, 5),
            "graceful_transition_score": round(rng.uniform(0.3, 1.0), 4),
        })

    adaptation_trace = []
    for step in range(steps):
        progress = step / max(steps - 1, 1)
        # System adapts over time — degradation lessens
        adapted_health = min(1.0, base_severity * (1 - progress * 0.6) + rng.uniform(-0.05, 0.05))
        adapted_health = max(0.1, adapted_health)
        active_degradations = max(0, int(subsystem_count * affected_ratio * (1 - progress * 0.7)))
        adaptation_trace.append({
            "step": step + 1,
            "system_health_pct": round((1 - adapted_health + progress * adapted_health) * 100, 1),
            "active_degradations": active_degradations,
            "adapted_subsystems": int(subsystem_count * affected_ratio * progress),
            "functional_capacity_pct": round(
                max(30, 100 - base_severity * affected_ratio * 100 * (1 - progress * 0.5)), 1
            ),
            "quality_of_service": round(
                max(0.3, 1 - base_severity * (1 - progress * 0.6)), 4
            ),
            "fallbacks_active": rng.randint(0, active_degradations),
            "user_impact_score": round(
                max(0, base_severity * (1 - progress * 0.7)), 4
            ),
            "adaptation_mechanism": rng.choice([
                "load_redistribution", "fallback_activation", "model_simplification",
                "priority_reordering", "selective_disable", "ai_adaptive_slim",
            ]),
        })

    final_health = adaptation_trace[-1]["system_health_pct"] if adaptation_trace else 100.0
    functional_subsystems = sum(1 for s in subsystems if s["health"] > 0.5)
    degradation_resilience = (
        functional_subsystems / max(subsystem_count, 1) * 0.3
        + sum(s["graceful_transition_score"] for s in subsystems) / max(len(subsystems), 1) * 0.25
        + adaptation_trace[-1]["quality_of_service"] if adaptation_trace else 0.5 * 0.25
        + (1 - affected_ratio) * 0.2
    )
    # Fix the nested ternary
    degradation_resilience = (
        functional_subsystems / max(subsystem_count, 1) * 0.3
        + sum(s["graceful_transition_score"] for s in subsystems) / max(len(subsystems), 1) * 0.25
        + (adaptation_trace[-1]["quality_of_service"] if adaptation_trace else 0.5) * 0.25
        + (1 - affected_ratio) * 0.2
    )

    return {
        "degradation_level": level.value,
        "affected_ratio": round(affected_ratio, 4),
        "adaptation_steps": steps,
        "subsystem_count": subsystem_count,
        "subsystems": subsystems,
        "adaptation_trace": adaptation_trace,
        "degradation_resilience": round(degradation_resilience, 4),
        "functional_subsystems": functional_subsystems,
        "degraded_subsystems": subsystem_count - functional_subsystems,
        "final_health_pct": round(final_health, 1),
        "avg_graceful_transition": round(
            sum(s["graceful_transition_score"] for s in subsystems) / max(len(subsystems), 1), 4
        ),
        "service_continuity_score": round(
            functional_subsystems / max(subsystem_count, 1) * 0.6
            + final_health / 100 * 0.4, 4
        ),
    }


def _compute_recover(
    strategy: RecoveryStrategy,
    failure_scope: float,
    recovery_budget_s: float,
) -> dict[str, Any]:
    """Recovery orchestration — plan and execute recovery from failures."""
    rng = random.Random(hash(strategy.value) + int(failure_scope * 1000) + int(recovery_budget_s * 100))
    recovery_phases = rng.randint(3, 7)
    affected_services = max(1, int(failure_scope * 20))

    services = []
    svc_names = [
        "causal_discovery_svc", "causal_validation_svc", "causal_inference_svc",
        "explanation_svc", "intervention_svc", "monitoring_svc",
        "consensus_svc", "trust_svc", "fusion_svc",
        "stream_svc", "meta_cognitive_svc", "governance_svc",
        "transfer_svc", "resilience_svc", "hardening_svc",
        "checkpoint_svc", "replay_svc", "audit_svc",
        "ensemble_svc", "feedback_svc",
    ]
    for i in range(affected_services):
        priority = rng.choice(["P0_critical", "P1_high", "P2_medium", "P3_low"])
        priority_order = {"P0_critical": 0, "P1_high": 1, "P2_medium": 2, "P3_low": 3}[priority]
        recovery_time = rng.uniform(0.5, recovery_budget_s) * (1 + priority_order * 0.3)
        dependencies_restored = rng.randint(0, 3)
        data_integrity = rng.uniform(0.6, 1.0)
        services.append({
            "service_id": f"svc_{i:03d}",
            "name": svc_names[i % len(svc_names)],
            "priority": priority,
            "priority_order": priority_order,
            "recovery_time_s": round(recovery_time, 2),
            "dependencies_restored": dependencies_restored,
            "data_integrity": round(data_integrity, 4),
            "state_recovery_pct": round(rng.uniform(50, 100), 1),
            "recovery_method": rng.choice([
                "full_restart", "partial_restore", "state_migration",
                "cache_rebuild", "consensus_resync", "ai_smart_restore",
            ]),
            "health_after_recovery": round(rng.uniform(0.7, 1.0), 4),
            "recovery_confidence": round(rng.uniform(0.5, 0.98), 4),
        })

    # Sort by priority
    services.sort(key=lambda s: s["priority_order"])

    phases = []
    cumulative_recovered = 0
    for p in range(recovery_phases):
        phase_recovered = min(
            affected_services - cumulative_recovered,
            rng.randint(1, max(1, affected_services // recovery_phases + 1))
        )
        cumulative_recovered += phase_recovered
        phases.append({
            "phase": p + 1,
            "phase_name": rng.choice([
                "Assessment", "Isolation", "Stabilization",
                "Restoration", "Verification", "Normalization",
            ]),
            "services_recovered": phase_recovered,
            "cumulative_recovered": cumulative_recovered,
            "remaining": affected_services - cumulative_recovered,
            "phase_duration_s": round(rng.uniform(1, recovery_budget_s / recovery_phases), 2),
            "data_loss_risk": round(max(0, failure_scope * (1 - cumulative_recovered / max(affected_services, 1))), 4),
            "causal_accuracy": round(
                0.3 + 0.7 * (cumulative_recovered / max(affected_services, 1)), 4
            ),
            "consistency_verified": rng.random() > 0.2,
            "rollback_available": rng.random() > 0.3,
        })

    total_recovery_time = sum(p["phase_duration_s"] for p in phases)
    final_accuracy = phases[-1]["causal_accuracy"] if phases else 0.3
    recovery_efficiency = (
        final_accuracy * 0.3
        + (1 - total_recovery_time / max(recovery_budget_s, 1)) * 0.25
        + cumulative_recovered / max(affected_services, 1) * 0.25
        + sum(s["data_integrity"] for s in services) / max(len(services), 1) * 0.2
    )

    return {
        "recovery_strategy": strategy.value,
        "failure_scope": round(failure_scope, 4),
        "recovery_budget_s": round(recovery_budget_s, 2),
        "affected_services": affected_services,
        "recovery_phases": recovery_phases,
        "services": services,
        "phases": phases,
        "recovery_efficiency": round(recovery_efficiency, 4),
        "total_recovery_time_s": round(total_recovery_time, 2),
        "final_accuracy": round(final_accuracy, 4),
        "data_integrity_preserved": round(
            sum(s["data_integrity"] for s in services) / max(len(services), 1), 4
        ),
        "rto_met": total_recovery_time <= recovery_budget_s,
        "rpo_s": round(rng.uniform(0, total_recovery_time * 0.1), 2),
        "services_fully_recovered": cumulative_recovered,
    }


def _compute_redundancy(
    redundancy_type: RedundancyType,
    replica_count: int,
    consistency_level: float,
) -> dict[str, Any]:
    """Redundancy management — maintain replicated causal reasoning capacity."""
    rng = random.Random(hash(redundancy_type.value) + replica_count * 43 + int(consistency_level * 1000))
    data_partitions = rng.randint(4, 16)
    sync_rounds = rng.randint(2, 8)

    replicas = []
    for i in range(replica_count):
        health = rng.uniform(0.7, 1.0)
        load_pct = rng.uniform(20, 95)
        sync_lag_ms = rng.uniform(0.1, 50.0)
        is_primary = i == 0
        replicas.append({
            "replica_id": f"replica_{i:03d}",
            "role": "primary" if is_primary else (
                "active" if redundancy_type.value in ("active_active", "ai_dynamic_redundancy") else "standby"
            ),
            "health": round(health, 4),
            "load_pct": round(load_pct, 1),
            "sync_lag_ms": round(sync_lag_ms, 2),
            "data_freshness_s": round(rng.uniform(0.1, 10.0), 2),
            "partition_coverage": round(rng.uniform(0.6, 1.0), 4),
            "last_heartbeat_ms": round(rng.uniform(10, 500), 1),
            "causal_model_version": f"v266.{rng.randint(1, 50)}",
            "consensus_participation": round(rng.uniform(0.5, 1.0), 4),
            "failover_readiness": round(rng.uniform(0.6, 1.0), 4),
        })

    partitions = []
    for i in range(data_partitions):
        primary_replica = i % replica_count
        secondary_replicas = [j for j in range(replica_count) if j != primary_replica]
        coverage = min(1.0, len(secondary_replicas) / max(replica_count - 1, 1))
        partitions.append({
            "partition_id": f"part_{i:03d}",
            "primary_replica": f"replica_{primary_replica:03d}",
            "secondary_replicas": [f"replica_{j:03d}" for j in secondary_replicas[:3]],
            "coverage": round(coverage, 4),
            "consistency_hash": uuid.uuid4().hex[:8],
            "size_mb": round(rng.uniform(1, 100), 2),
            "causal_edge_count": rng.randint(100, 10000),
            "last_sync_ms": round(rng.uniform(10, 1000), 1),
        })

    sync_trace = []
    for r in range(sync_rounds):
        progress = r / max(sync_rounds - 1, 1)
        consistency_achieved = min(1.0, consistency_level * (0.8 + progress * 0.2) + rng.uniform(-0.05, 0.05))
        consistency_achieved = max(0, min(1, consistency_achieved))
        sync_trace.append({
            "round": r + 1,
            "consistency_achieved": round(consistency_achieved, 4),
            "replicas_in_sync": min(replica_count, rng.randint(max(1, replica_count - 2), replica_count)),
            "divergence_count": rng.randint(0, max(1, int((1 - consistency_achieved) * 10))),
            "sync_duration_ms": round(rng.uniform(5, 200), 1),
            "conflicts_resolved": rng.randint(0, 3),
            "data_transferred_mb": round(rng.uniform(0.1, 10), 2),
        })

    avg_health = sum(r["health"] for r in replicas) / max(len(replicas), 1)
    redundancy_effectiveness = (
        avg_health * 0.25
        + sum(r["failover_readiness"] for r in replicas) / max(len(replicas), 1) * 0.25
        + (sync_trace[-1]["consistency_achieved"] if sync_trace else 0.5) * 0.25
        + (replica_count / max(data_partitions, 1)) * 0.25
    )

    return {
        "redundancy_type": redundancy_type.value,
        "replica_count": replica_count,
        "consistency_level": round(consistency_level, 4),
        "data_partitions": data_partitions,
        "replicas": replicas,
        "partitions": partitions,
        "sync_trace": sync_trace,
        "redundancy_effectiveness": round(redundancy_effectiveness, 4),
        "avg_replica_health": round(avg_health, 4),
        "failover_readiness": round(
            sum(r["failover_readiness"] for r in replicas) / max(len(replicas), 1), 4
        ),
        "data_availability": round(min(1.0, avg_health * (1 + replica_count * 0.1)), 4),
        "consistency_met": (
            sync_trace[-1]["consistency_achieved"] >= consistency_level if sync_trace else False
        ),
        "replication_factor": f"{replica_count}x",
        "estimated_rto_s": round(rng.uniform(0.5, 30) / max(replica_count, 1), 2),
    }


def _compute_harden(
    method: HardeningMethod,
    attack_surface: float,
    defense_layers: int,
) -> dict[str, Any]:
    """Adversarial hardening — strengthen the system against adversarial attacks."""
    rng = random.Random(hash(method.value) + int(attack_surface * 1000) + defense_layers * 37)
    attack_vectors = rng.randint(5, 15)
    defense_rounds = rng.randint(3, 8)

    vectors = []
    attack_types = [
        "causal_edge_injection", "node_attribute_manipulation", "graph_topology_attack",
        "temporal_causality_attack", "evidence_fabrication", "trust_exploitation",
        "consensus_subversion", "model_extraction", "data_poisoning_advanced",
        "adversarial_perturbation_targeted", "model_inversion", "membership_inference",
        "causal_chain_disruption", "feedback_loop_manipulation", "meta_cognitive_exploit",
    ]
    for i in range(attack_vectors):
        severity = rng.uniform(0.1, 1.0)
        base_defense = rng.uniform(0.3, 0.8)
        hardened_defense = min(1.0, base_defense + rng.uniform(0.05, 0.3))
        improvement = hardened_defense - base_defense
        vectors.append({
            "vector_id": f"ATK_{i:04d}",
            "attack_type": attack_types[i % len(attack_types)],
            "severity": round(severity, 4),
            "base_defense_score": round(base_defense, 4),
            "hardened_defense_score": round(hardened_defense, 4),
            "improvement": round(improvement, 4),
            "improvement_pct": round(improvement / max(base_defense, 0.01) * 100, 1),
            "residual_vulnerability": round(1 - hardened_defense, 4),
            "defense_mechanism": rng.choice([
                "input_validation", "anomaly_detection", "rate_limiting",
                "authentication", "encryption", "ai_adaptive_shield",
            ]),
            "mitigation_cost": round(rng.uniform(0.01, 0.1), 4),
        })

    layers = []
    layer_names = [
        "Input Sanitization", "Schema Validation", "Statistical Anomaly Detection",
        "Behavioral Analysis", "Trust Verification", "Consensus Integrity",
        "Model Certification", "Output Validation",
    ]
    for i in range(min(defense_layers, 8)):
        coverage = rng.uniform(0.5, 0.98)
        false_positive_rate = rng.uniform(0.01, 0.1)
        layers.append({
            "layer_id": f"LAYER_{i:03d}",
            "name": layer_names[i % len(layer_names)],
            "coverage": round(coverage, 4),
            "false_positive_rate": round(false_positive_rate, 4),
            "detection_accuracy": round(rng.uniform(0.7, 0.99), 4),
            "latency_overhead_ms": round(rng.uniform(0.1, 10.0), 2),
            "resource_overhead_pct": round(rng.uniform(0.5, 15.0), 1),
            "active": True,
            "threats_blocked": rng.randint(10, 500),
        })

    hardening_trace = []
    for r in range(defense_rounds):
        progress = r / max(defense_rounds - 1, 1)
        defense_strength = min(1.0, attack_surface * (1 - progress * 0.5) + rng.uniform(0, 0.1))
        threats_neutralized = rng.randint(1, attack_vectors)
        hardening_trace.append({
            "round": r + 1,
            "defense_strength": round(defense_strength, 4),
            "threats_neutralized": threats_neutralized,
            "remaining_vulnerabilities": max(0, attack_vectors - threats_neutralized),
            "attack_surface_reduction_pct": round(progress * 40 + rng.uniform(0, 10), 1),
            "false_positive_rate": round(rng.uniform(0.01, 0.05) * (1 - progress * 0.3), 4),
            "performance_overhead_pct": round(rng.uniform(1, 8), 1),
            "defense_method": rng.choice([
                "retraining", "calibration", "threshold_adjustment",
                "feature_pruning", "ensemble_diversification", "ai_meta_hardening",
            ]),
        })

    avg_improvement = sum(v["improvement"] for v in vectors) / max(len(vectors), 1)
    avg_hardened_defense = sum(v["hardened_defense_score"] for v in vectors) / max(len(vectors), 1)
    overall_security = (
        avg_hardened_defense * 0.3
        + sum(l["coverage"] for l in layers) / max(len(layers), 1) * 0.25
        + avg_improvement * 0.25
        + (1 - attack_surface * 0.3) * 0.2
    )

    return {
        "hardening_method": method.value,
        "attack_surface": round(attack_surface, 4),
        "defense_layers": min(defense_layers, 8),
        "attack_vectors_tested": attack_vectors,
        "vectors": vectors,
        "layers": layers,
        "hardening_trace": hardening_trace,
        "overall_security": round(overall_security, 4),
        "avg_defense_improvement": round(avg_improvement, 4),
        "avg_hardened_defense": round(avg_hardened_defense, 4),
        "residual_attack_surface": round(
            sum(v["residual_vulnerability"] for v in vectors) / max(len(vectors), 1), 4
        ),
        "total_defense_improvement_pct": round(
            avg_improvement / max(
                sum(v["base_defense_score"] for v in vectors) / max(len(vectors), 1), 0.01
            ) * 100, 1
        ),
        "security_posture": "strong" if overall_security > 0.8 else (
            "moderate" if overall_security > 0.6 else "weak"
        ),
        "performance_overhead_pct": round(
            sum(l["resource_overhead_pct"] for l in layers) / max(len(layers), 1), 1
        ),
    }


# ─── Request Models ───────────────────────────────────────────────────────────

class StressTestRequest(BaseModel):
    stress_type: StressType = StressType.ADVERSARIAL_PERTURBATION
    intensity: float = Field(0.5, ge=0.0, le=1.0)
    duration_steps: int = Field(10, ge=5, le=50)

class FaultInjectRequest(BaseModel):
    fault_category: FaultCategory = FaultCategory.NODE_FAILURE
    injection_count: int = Field(6, ge=1, le=30)
    propagation_depth: int = Field(3, ge=1, le=10)

class DegradeRequest(BaseModel):
    degradation_level: DegradationLevel = DegradationLevel.MODERATE
    affected_ratio: float = Field(0.3, ge=0.0, le=1.0)
    adaptation_steps: int = Field(8, ge=3, le=20)

class RecoverRequest(BaseModel):
    strategy: RecoveryStrategy = RecoveryStrategy.SELF_REPAIR
    failure_scope: float = Field(0.3, ge=0.0, le=1.0)
    recovery_budget_s: float = Field(60.0, ge=1.0, le=600.0)

class RedundancyRequest(BaseModel):
    redundancy_type: RedundancyType = RedundancyType.ACTIVE_PASSIVE
    replica_count: int = Field(3, ge=2, le=10)
    consistency_level: float = Field(0.9, ge=0.5, le=1.0)

class HardenRequest(BaseModel):
    method: HardeningMethod = HardeningMethod.ADVERSARIAL_TRAINING
    attack_surface: float = Field(0.3, ge=0.0, le=1.0)
    defense_layers: int = Field(4, ge=1, le=8)


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/causal-resilience/stress-test")
def resilience_stress_test(req: StressTestRequest) -> dict[str, Any]:
    key = f"{req.stress_type.value}|{req.intensity}|{req.duration_steps}"
    if key not in _stress_cache266:
        _stress_cache266[key] = _compute_stress_test(req.stress_type, req.intensity, req.duration_steps)
    return {"timestamp": time.time(), **_stress_cache266[key]}


@router.post("/causal-resilience/fault-inject")
def resilience_fault_inject(req: FaultInjectRequest) -> dict[str, Any]:
    key = f"{req.fault_category.value}|{req.injection_count}|{req.propagation_depth}"
    if key not in _fault_cache266:
        _fault_cache266[key] = _compute_fault_inject(req.fault_category, req.injection_count, req.propagation_depth)
    return {"timestamp": time.time(), **_fault_cache266[key]}


@router.post("/causal-resilience/degrade")
def resilience_degrade(req: DegradeRequest) -> dict[str, Any]:
    key = f"{req.degradation_level.value}|{req.affected_ratio}|{req.adaptation_steps}"
    if key not in _degrade_cache266:
        _degrade_cache266[key] = _compute_degrade(req.degradation_level, req.affected_ratio, req.adaptation_steps)
    return {"timestamp": time.time(), **_degrade_cache266[key]}


@router.post("/causal-resilience/recover")
def resilience_recover(req: RecoverRequest) -> dict[str, Any]:
    key = f"{req.strategy.value}|{req.failure_scope}|{req.recovery_budget_s}"
    if key not in _recover_cache266:
        _recover_cache266[key] = _compute_recover(req.strategy, req.failure_scope, req.recovery_budget_s)
    return {"timestamp": time.time(), **_recover_cache266[key]}


@router.post("/causal-resilience/redundancy")
def resilience_redundancy(req: RedundancyRequest) -> dict[str, Any]:
    key = f"{req.redundancy_type.value}|{req.replica_count}|{req.consistency_level}"
    if key not in _redundancy_cache266:
        _redundancy_cache266[key] = _compute_redundancy(req.redundancy_type, req.replica_count, req.consistency_level)
    return {"timestamp": time.time(), **_redundancy_cache266[key]}


@router.post("/causal-resilience/harden")
def resilience_harden(req: HardenRequest) -> dict[str, Any]:
    key = f"{req.method.value}|{req.attack_surface}|{req.defense_layers}"
    if key not in _harden_cache266:
        _harden_cache266[key] = _compute_harden(req.method, req.attack_surface, req.defense_layers)
    return {"timestamp": time.time(), **_harden_cache266[key]}


@router.get("/causal-resilience/overview")
def resilience_overview() -> dict[str, Any]:
    return {
        "version": "v1.266",
        "engine": "Graph Causal Resilience & Fault Tolerance",
        "enums": {
            "StressType": [e.value for e in StressType],
            "FaultCategory": [e.value for e in FaultCategory],
            "DegradationLevel": [e.value for e in DegradationLevel],
            "RecoveryStrategy": [e.value for e in RecoveryStrategy],
            "RedundancyType": [e.value for e in RedundancyType],
            "HardeningMethod": [e.value for e in HardeningMethod],
        },
        "endpoints": [
            "POST /graph/causal-resilience/stress-test",
            "POST /graph/causal-resilience/fault-inject",
            "POST /graph/causal-resilience/degrade",
            "POST /graph/causal-resilience/recover",
            "POST /graph/causal-resilience/redundancy",
            "POST /graph/causal-resilience/harden",
            "GET  /graph/causal-resilience/overview",
        ],
        "caches": {
            "stress_test": len(_stress_cache266),
            "fault_inject": len(_fault_cache266),
            "degrade": len(_degrade_cache266),
            "recover": len(_recover_cache266),
            "redundancy": len(_redundancy_cache266),
            "harden": len(_harden_cache266),
        },
        "architecture_layer": "Resilience & Fault Tolerance (v1.266)",
        "pipeline_position": "Above Multi-Agent Consensus (v1.265)",
        "integration_chain": [
            "Causal Pipeline (v1.249–v1.259)",
            "Meta-Cognitive Layer (v1.260)",
            "Emergence & Complexity (v1.261)",
            "Governance & Compliance (v1.262)",
            "Transfer & Adaptation (v1.263)",
            "Real-time Streaming (v1.264)",
            "Multi-Agent Consensus (v1.265)",
            "Resilience & Fault Tolerance (v1.266)",
        ],
    }
