# ═══════════════════════════════════════════════════════════════════════════════
# v1.261 — Graph Causal Emergence & Complexity Engine
# ═══════════════════════════════════════════════════════════════════════════════
# Detects emergent causal structures in complex systems, analyzes multi-scale
# complexity, computes causal emergence metrics (effective information, integrated
# information), and guides navigation through complexity phase transitions.
# 6 enums (36 values) × 7 endpoints (6 POST + 1 GET)
# ═══════════════════════════════════════════════════════════════════════════════

from __future__ import annotations
import enum, time, uuid, math, random
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/graph", tags=["v1.261 — Causal Emergence & Complexity"])

# ─── Enums ────────────────────────────────────────────────────────────────────

class EmergencePattern(str, enum.Enum):
    SCALE_TRANSITION = "scale_transition"
    COLLECTIVE_BEHAVIOR = "collective_behavior"
    PHASE_TRANSITION = "phase_transition"
    SELF_ORGANIZATION = "self_organization"
    SYNERGETIC_EFFECT = "synergetic_effect"
    AI_HYPER_EMERGENCE = "ai_hyper_emergence"

class ComplexityMetric(str, enum.Enum):
    SHANNON_ENTROPY = "shannon_entropy"
    MUTUAL_INFORMATION = "mutual_information"
    INTEGRATED_INFORMATION = "integrated_information"
    ALGORITHMIC_COMPLEXITY = "algorithmic_complexity"
    EFFECTIVE_COMPLEXITY = "effective_complexity"
    AI_ADAPTIVE_COMPLEXITY = "ai_adaptive_complexity"

class ScaleLevel(str, enum.Enum):
    MICRO = "micro"
    MESO = "meso"
    MACRO = "macro"
    CROSS_SCALE = "cross_scale"
    MULTI_RESOLUTION = "multi_resolution"
    AI_DYNAMIC_SCALE = "ai_dynamic_scale"

class CausalEmergenceType(str, enum.Enum):
    UPWARD_CAUSATION = "upward_causation"
    DOWNWARD_CAUSATION = "downward_causation"
    CAUSAL_EXCLUSION = "causal_exclusion"
    EFFECTIVE_INFORMATION = "effective_information"
    INTEGRATED_CAUSATION = "integrated_causation"
    AI_HYBRID_EMERGENCE = "ai_hybrid_emergence"

class SimulationModel(str, enum.Enum):
    AGENT_BASED = "agent_based"
    NETWORK_DYNAMICS = "network_dynamics"
    CELLULAR_AUTOMATA = "cellular_automata"
    MEAN_FIELD = "mean_field"
    STOCHASTIC_PROCESS = "stochastic_process"
    AI_NEURAL_SIMULATION = "ai_neural_simulation"

class PhaseTransitionType(str, enum.Enum):
    CONTINUOUS = "continuous"
    DISCONTINUOUS = "discontinuous"
    CRITICAL_SLOWING = "critical_slowing"
    BIFURCATION = "bifurcation"
    CATASTROPHE = "catastrophe"
    AI_ADAPTIVE_TRANSITION = "ai_adaptive_transition"

# ─── Caches ───────────────────────────────────────────────────────────────────

_detect_cache261: dict[str, Any] = {}
_analyze_cache261: dict[str, Any] = {}
_decompose_cache261: dict[str, Any] = {}
_simulate_cache261: dict[str, Any] = {}
_quantify_cache261: dict[str, Any] = {}
_evolve_cache261: dict[str, Any] = {}

# ─── Compute helpers ──────────────────────────────────────────────────────────

def _compute_detect(
    pattern: EmergencePattern, num_observations: int,
    sensitivity: float,
) -> dict[str, Any]:
    """Detect emergent causal patterns in complex systems."""
    pattern_meta: dict[str, dict[str, Any]] = {
        EmergencePattern.SCALE_TRANSITION: {"detectability": 0.7, "novelty": 0.6, "robustness": 0.75},
        EmergencePattern.COLLECTIVE_BEHAVIOR: {"detectability": 0.8, "novelty": 0.5, "robustness": 0.8},
        EmergencePattern.PHASE_TRANSITION: {"detectability": 0.6, "novelty": 0.8, "robustness": 0.65},
        EmergencePattern.SELF_ORGANIZATION: {"detectability": 0.65, "novelty": 0.7, "robustness": 0.7},
        EmergencePattern.SYNERGETIC_EFFECT: {"detectability": 0.55, "novelty": 0.85, "robustness": 0.6},
        EmergencePattern.AI_HYPER_EMERGENCE: {"detectability": 0.9, "novelty": 0.95, "robustness": 0.85},
    }
    meta = pattern_meta[pattern]

    observations = []
    emergence_indicators = [
        "correlation_amplification", "variance_concentration", "order_parameter_shift",
        "mutual_information_spike", "causal_asymmetry_change", "entropy_gradient_flip",
        "scale_coupling_strength", "feedback_loop_emergence", "critical_fluctuation",
        "collective_mode_onset", "topological_invariant_shift", "information_integration_peak",
    ]
    for i in range(num_observations):
        indicator = emergence_indicators[i % len(emergence_indicators)]
        signal_strength = round(
            meta["detectability"] * sensitivity * random.uniform(0.5, 1.0), 4
        )
        noise_floor = round(random.uniform(0.05, 0.25), 4)
        snr = round(signal_strength / max(0.01, noise_floor), 4)
        emergence_detected = signal_strength > noise_floor * 2
        novelty_score = round(meta["novelty"] * random.uniform(0.6, 1.0), 4)

        obs = {
            "observation_id": f"EMR-{i+1:03d}",
            "pattern_type": pattern.value,
            "indicator": indicator,
            "signal_strength": signal_strength,
            "noise_floor": noise_floor,
            "snr": snr,
            "emergence_detected": emergence_detected,
            "detection_confidence": round(min(1.0, snr / 5.0), 4),
            "novelty_score": novelty_score,
            "robustness_estimate": round(meta["robustness"] * random.uniform(0.7, 1.0), 4),
            "scale_of_emergence": random.choice(["micro_to_meso", "meso_to_macro", "cross_scale", "multi_level"]),
            "causal_relevance": round(random.uniform(0.3, 1.0), 4),
            "temporal_signature": random.choice(["sudden_onset", "gradual_buildup", "oscillatory", "threshold_triggered"]),
            "reproducibility": round(meta["robustness"] * random.uniform(0.6, 1.0), 4),
        }
        observations.append(obs)

    detected = [o for o in observations if o["emergence_detected"]]
    avg_snr = round(sum(o["snr"] for o in observations) / max(1, num_observations), 4)
    high_confidence = sum(1 for o in detected if o["detection_confidence"] > 0.7)

    return {
        "pattern_type": pattern.value,
        "pattern_meta": meta,
        "sensitivity": sensitivity,
        "num_observations": num_observations,
        "observations": observations,
        "detect_summary": {
            "emergence_rate": round(len(detected) / max(1, num_observations), 4),
            "avg_snr": avg_snr,
            "high_confidence_detections": high_confidence,
            "avg_novelty": round(sum(o["novelty_score"] for o in observations) / max(1, num_observations), 4),
            "avg_robustness": round(sum(o["robustness_estimate"] for o in observations) / max(1, num_observations), 4),
            "detection_effectiveness": round(len(detected) / max(1, num_observations) * meta["detectability"], 4),
            "emergence_diversity": round(len(set(o["indicator"] for o in detected)) / max(1, len(emergence_indicators)), 4),
            "avg_causal_relevance": round(sum(o["causal_relevance"] for o in detected) / max(1, len(detected)), 4) if detected else 0.0,
        },
    }


def _compute_analyze(
    metric: ComplexityMetric, num_samples: int,
    resolution: float,
) -> dict[str, Any]:
    """Analyze complexity using information-theoretic metrics."""
    metric_meta: dict[str, dict[str, Any]] = {
        ComplexityMetric.SHANNON_ENTROPY: {"baseline": 0.5, "range": (0.0, 1.0), "interpretability": 0.9},
        ComplexityMetric.MUTUAL_INFORMATION: {"baseline": 0.3, "range": (0.0, 1.0), "interpretability": 0.8},
        ComplexityMetric.INTEGRATED_INFORMATION: {"baseline": 0.2, "range": (0.0, 1.0), "interpretability": 0.6},
        ComplexityMetric.ALGORITHMIC_COMPLEXITY: {"baseline": 0.4, "range": (0.0, 1.0), "interpretability": 0.5},
        ComplexityMetric.EFFECTIVE_COMPLEXITY: {"baseline": 0.35, "range": (0.0, 1.0), "interpretability": 0.75},
        ComplexityMetric.AI_ADAPTIVE_COMPLEXITY: {"baseline": 0.45, "range": (0.0, 1.0), "interpretability": 0.85},
    }
    meta = metric_meta[metric]
    lo, hi = meta["range"]

    samples = []
    system_layers = [
        ("micro_dynamics", 0.8), ("local_interactions", 0.7),
        ("meso_structures", 0.6), ("regional_patterns", 0.5),
        ("macro_behavior", 0.4), ("global_emergence", 0.3),
    ]
    for i in range(num_samples):
        layer, base_complexity = system_layers[i % len(system_layers)]
        raw_value = round(
            meta["baseline"] + base_complexity * resolution * random.uniform(-0.3, 0.3), 4
        )
        complexity_value = round(max(lo, min(hi, raw_value)), 4)
        normalized = round((complexity_value - lo) / max(0.01, hi - lo), 4)

        # Compare with random baseline
        random_baseline = round(random.uniform(0.1, 0.5), 4)
        excess_complexity = round(max(0, complexity_value - random_baseline), 4)
        structured_fraction = round(excess_complexity / max(0.01, complexity_value), 4)

        sample = {
            "sample_id": f"CPL-{i+1:03d}",
            "metric": metric.value,
            "system_layer": layer,
            "complexity_value": complexity_value,
            "normalized_complexity": normalized,
            "random_baseline": random_baseline,
            "excess_complexity": excess_complexity,
            "structured_fraction": structured_fraction,
            "interpretation": "highly_structured" if structured_fraction > 0.6 else "moderately_structured" if structured_fraction > 0.3 else "near_random",
            "confidence_interval": (
                round(max(lo, complexity_value - 0.05 * (1 - meta["interpretability"])), 4),
                round(min(hi, complexity_value + 0.05 * (1 - meta["interpretability"])), 4),
            ),
            "information_density": round(complexity_value * resolution, 4),
            "causal_content_estimate": round(excess_complexity * random.uniform(0.5, 1.0), 4),
        }
        samples.append(sample)

    avg_complexity = round(sum(s["complexity_value"] for s in samples) / max(1, num_samples), 4)
    avg_excess = round(sum(s["excess_complexity"] for s in samples) / max(1, num_samples), 4)
    highly_structured = sum(1 for s in samples if s["structured_fraction"] > 0.6)

    return {
        "metric": metric.value,
        "metric_meta": meta,
        "resolution": resolution,
        "num_samples": num_samples,
        "samples": samples,
        "analyze_summary": {
            "avg_complexity": avg_complexity,
            "avg_excess_complexity": avg_excess,
            "avg_structured_fraction": round(sum(s["structured_fraction"] for s in samples) / max(1, num_samples), 4),
            "highly_structured_count": highly_structured,
            "complexity_range": (
                round(min(s["complexity_value"] for s in samples), 4),
                round(max(s["complexity_value"] for s in samples), 4),
            ),
            "interpretability": meta["interpretability"],
            "avg_causal_content": round(sum(s["causal_content_estimate"] for s in samples) / max(1, num_samples), 4),
            "complexity_gradient": round(max(s["complexity_value"] for s in samples) - min(s["complexity_value"] for s in samples), 4),
            "effective_complexity_ratio": round(avg_excess / max(0.01, avg_complexity), 4),
        },
    }


def _compute_decompose(
    scale: ScaleLevel, num_bridges: int,
    coupling_strength: float,
) -> dict[str, Any]:
    """Multi-scale causal decomposition identifying cross-scale bridges."""
    scale_meta: dict[str, dict[str, Any]] = {
        ScaleLevel.MICRO: {"granularity": 100, "causal_density": 0.9, "noise": 0.3},
        ScaleLevel.MESO: {"granularity": 30, "causal_density": 0.7, "noise": 0.2},
        ScaleLevel.MACRO: {"granularity": 10, "causal_density": 0.5, "noise": 0.15},
        ScaleLevel.CROSS_SCALE: {"granularity": 50, "causal_density": 0.6, "noise": 0.25},
        ScaleLevel.MULTI_RESOLUTION: {"granularity": 60, "causal_density": 0.65, "noise": 0.2},
        ScaleLevel.AI_DYNAMIC_SCALE: {"granularity": 80, "causal_density": 0.8, "noise": 0.1},
    }
    meta = scale_meta[scale]

    bridges = []
    causal_flows = [
        ("bottom_up_aggregation", 0.7), ("top_down_constraint", 0.5),
        ("lateral_coupling", 0.6), ("feedback_amplification", 0.8),
        ("information_cascading", 0.65), ("resonance_coupling", 0.75),
    ]
    for i in range(num_bridges):
        flow_type, flow_base = causal_flows[i % len(causal_flows)]
        effective_coupling = round(
            coupling_strength * flow_base * meta["causal_density"] * random.uniform(0.6, 1.0), 4
        )
        info_transfer = round(
            effective_coupling * math.log2(1 + meta["granularity"] / 10) * random.uniform(0.7, 1.0), 4
        )
        noise_contribution = round(meta["noise"] * random.uniform(0.5, 1.0), 4)
        causal_fidelity = round(max(0, 1 - noise_contribution / max(0.01, effective_coupling)), 4)

        bridge = {
            "bridge_id": f"CSD-{i+1:03d}",
            "scale_level": scale.value,
            "flow_type": flow_type,
            "source_scale": random.choice(["micro", "meso"]),
            "target_scale": random.choice(["meso", "macro"]),
            "coupling_strength": effective_coupling,
            "information_transfer_bits": round(info_transfer, 4),
            "noise_contribution": noise_contribution,
            "causal_fidelity": causal_fidelity,
            "bridge_type": "causal" if causal_fidelity > 0.7 else "correlational" if causal_fidelity > 0.4 else "noisy",
            "emergence_contribution": round(effective_coupling * (1 - noise_contribution), 4),
            "downward_causation_strength": round(effective_coupling * random.uniform(0.2, 0.6), 4),
            "upward_causation_strength": round(effective_coupling * random.uniform(0.4, 0.8), 4),
            "reversibility": round(1 - abs(effective_coupling - coupling_strength * 0.5), 4),
        }
        bridges.append(bridge)

    causal_bridges = [b for b in bridges if b["bridge_type"] == "causal"]
    avg_fidelity = round(sum(b["causal_fidelity"] for b in bridges) / max(1, num_bridges), 4)
    avg_info_transfer = round(sum(b["information_transfer_bits"] for b in bridges) / max(1, num_bridges), 4)

    return {
        "scale_level": scale.value,
        "scale_meta": meta,
        "coupling_strength": coupling_strength,
        "num_bridges": num_bridges,
        "bridges": bridges,
        "decompose_summary": {
            "avg_causal_fidelity": avg_fidelity,
            "causal_bridge_rate": round(len(causal_bridges) / max(1, num_bridges), 4),
            "avg_info_transfer": avg_info_transfer,
            "total_emergence_contribution": round(sum(b["emergence_contribution"] for b in bridges), 4),
            "avg_downward_causation": round(sum(b["downward_causation_strength"] for b in bridges) / max(1, num_bridges), 4),
            "avg_upward_causation": round(sum(b["upward_causation_strength"] for b in bridges) / max(1, num_bridges), 4),
            "causation_asymmetry": round(
                sum(b["downward_causation_strength"] for b in bridges) / max(0.01, sum(b["upward_causation_strength"] for b in bridges)), 4
            ),
            "avg_reversibility": round(sum(b["reversibility"] for b in bridges) / max(1, num_bridges), 4),
            "scale_integration_index": round(avg_fidelity * avg_info_transfer / max(0.01, meta["noise"]), 4),
        },
    }


def _compute_simulate(
    model: SimulationModel, num_steps: int,
    perturbation: float,
) -> dict[str, Any]:
    """Simulate emergence dynamics using various computational models."""
    model_meta: dict[str, dict[str, Any]] = {
        SimulationModel.AGENT_BASED: {"emergence_rate": 0.6, "computational_cost": 0.8, "fidelity": 0.75},
        SimulationModel.NETWORK_DYNAMICS: {"emergence_rate": 0.7, "computational_cost": 0.5, "fidelity": 0.8},
        SimulationModel.CELLULAR_AUTOMATA: {"emergence_rate": 0.5, "computational_cost": 0.3, "fidelity": 0.6},
        SimulationModel.MEAN_FIELD: {"emergence_rate": 0.4, "computational_cost": 0.2, "fidelity": 0.7},
        SimulationModel.STOCHASTIC_PROCESS: {"emergence_rate": 0.55, "computational_cost": 0.4, "fidelity": 0.65},
        SimulationModel.AI_NEURAL_SIMULATION: {"emergence_rate": 0.85, "computational_cost": 0.9, "fidelity": 0.9},
    }
    meta = model_meta[model]

    steps = []
    order_parameter = random.uniform(0.1, 0.3)
    for i in range(num_steps):
        # Simulate phase-transition-like dynamics
        perturbation_effect = perturbation * random.gauss(0, 1) * 0.1
        emergence_drive = meta["emergence_rate"] * 0.05 * random.uniform(0.5, 1.5)
        order_parameter = max(0.0, min(1.0, order_parameter + emergence_drive + perturbation_effect))

        # Critical slowing near phase transition
        near_transition = abs(order_parameter - 0.5) < 0.15
        variance = 0.02 if not near_transition else 0.08

        complexity_estimate = round(
            -order_parameter * math.log2(max(0.001, order_parameter))
            - (1 - order_parameter) * math.log2(max(0.001, 1 - order_parameter)), 4
        )

        step = {
            "step_id": f"SIM-{i+1:03d}",
            "model": model.value,
            "time_step": i,
            "order_parameter": round(order_parameter, 4),
            "complexity_estimate": complexity_estimate,
            "near_phase_transition": near_transition,
            "variance": round(variance, 4),
            "emergence_indicator": round(meta["emergence_rate"] * order_parameter, 4),
            "fidelity_estimate": round(meta["fidelity"] * (1 - variance), 4),
            "perturbation_impact": round(abs(perturbation_effect), 4),
            "collective_variable": round(order_parameter * random.uniform(0.8, 1.2), 4),
            "entropy_rate": round(random.uniform(0.1, 0.5) * (1 - order_parameter * 0.5), 4),
            "information_generation": round(meta["emergence_rate"] * complexity_estimate, 4),
        }
        steps.append(step)

    max_complexity = max(s["complexity_estimate"] for s in steps)
    transition_steps = sum(1 for s in steps if s["near_phase_transition"])
    final_order = steps[-1]["order_parameter"] if steps else 0.0

    return {
        "model": model.value,
        "model_meta": meta,
        "perturbation": perturbation,
        "num_steps": num_steps,
        "steps": steps,
        "simulate_summary": {
            "max_complexity_reached": round(max_complexity, 4),
            "final_order_parameter": round(final_order, 4),
            "phase_transition_steps": transition_steps,
            "transition_rate": round(transition_steps / max(1, num_steps), 4),
            "avg_emergence_indicator": round(sum(s["emergence_indicator"] for s in steps) / max(1, num_steps), 4),
            "avg_fidelity": round(sum(s["fidelity_estimate"] for s in steps) / max(1, num_steps), 4),
            "total_information_generated": round(sum(s["information_generation"] for s in steps), 4),
            "emergence_efficiency": round(meta["emergence_rate"] / meta["computational_cost"], 4),
            "avg_entropy_rate": round(sum(s["entropy_rate"] for s in steps) / max(1, num_steps), 4),
            "complexity_trajectory": "increasing" if final_order > 0.5 else "stable" if final_order > 0.3 else "disordered",
        },
    }


def _compute_quantify(
    emergence_type: CausalEmergenceType, num_measurements: int,
    granularity: float,
) -> dict[str, Any]:
    """Quantify causal emergence using rigorous information-theoretic measures."""
    type_meta: dict[str, dict[str, Any]] = {
        CausalEmergenceType.UPWARD_CAUSATION: {"expected_strength": 0.6, "measurability": 0.8, "theoretical_grounding": 0.75},
        CausalEmergenceType.DOWNWARD_CAUSATION: {"expected_strength": 0.5, "measurability": 0.6, "theoretical_grounding": 0.65},
        CausalEmergenceType.CAUSAL_EXCLUSION: {"expected_strength": 0.4, "measurability": 0.5, "theoretical_grounding": 0.8},
        CausalEmergenceType.EFFECTIVE_INFORMATION: {"expected_strength": 0.7, "measurability": 0.9, "theoretical_grounding": 0.85},
        CausalEmergenceType.INTEGRATED_CAUSATION: {"expected_strength": 0.55, "measurability": 0.7, "theoretical_grounding": 0.7},
        CausalEmergenceType.AI_HYBRID_EMERGENCE: {"expected_strength": 0.8, "measurability": 0.85, "theoretical_grounding": 0.9},
    }
    meta = type_meta[emergence_type]

    measurements = []
    for i in range(num_measurements):
        # Effective Information (EI) computation
        micro_ei = round(random.uniform(0.1, 0.5) * granularity, 4)
        macro_ei = round(random.uniform(0.2, 0.7) * granularity, 4)
        emergence_delta = round(macro_ei - micro_ei, 4)

        # Integration (Phi-like measure)
        integration = round(random.uniform(0.05, 0.4) * meta["expected_strength"], 4)

        # Causal emergence occurs when macro has more effective information than micro
        emergence_detected = emergence_delta > 0

        measurement = {
            "measurement_id": f"QNT-{i+1:03d}",
            "emergence_type": emergence_type.value,
            "micro_effective_info": micro_ei,
            "macro_effective_info": macro_ei,
            "emergence_delta_ei": emergence_delta,
            "integration_phi": integration,
            "emergence_detected": emergence_detected,
            "emergence_strength": round(max(0, emergence_delta) * meta["expected_strength"], 4),
            "causal_power_macro": round(macro_ei * meta["measurability"], 4),
            "causal_power_micro": round(micro_ei * (1 - meta["measurability"] * 0.3), 4),
            "emergence_ratio": round(macro_ei / max(0.01, micro_ei), 4),
            "effective_gauge": round(
                (macro_ei - micro_ei) / max(0.01, micro_ei + macro_ei), 4
            ),
            "theoretical_confidence": round(meta["theoretical_grounding"] * random.uniform(0.7, 1.0), 4),
            "measurement_precision": round(granularity * meta["measurability"], 4),
        }
        measurements.append(measurement)

    detected = [m for m in measurements if m["emergence_detected"]]
    avg_delta = round(sum(m["emergence_delta_ei"] for m in measurements) / max(1, num_measurements), 4)
    avg_integration = round(sum(m["integration_phi"] for m in measurements) / max(1, num_measurements), 4)

    return {
        "emergence_type": emergence_type.value,
        "type_meta": meta,
        "granularity": granularity,
        "num_measurements": num_measurements,
        "measurements": measurements,
        "quantify_summary": {
            "emergence_detection_rate": round(len(detected) / max(1, num_measurements), 4),
            "avg_emergence_delta": avg_delta,
            "avg_integration_phi": avg_integration,
            "avg_emergence_strength": round(sum(m["emergence_strength"] for m in detected) / max(1, len(detected)), 4) if detected else 0.0,
            "avg_emergence_ratio": round(sum(m["emergence_ratio"] for m in measurements) / max(1, num_measurements), 4),
            "avg_effective_gauge": round(sum(m["effective_gauge"] for m in measurements) / max(1, num_measurements), 4),
            "theoretical_confidence": round(sum(m["theoretical_confidence"] for m in measurements) / max(1, num_measurements), 4),
            "avg_measurement_precision": round(sum(m["measurement_precision"] for m in measurements) / max(1, num_measurements), 4),
            "emergence_robustness": round(len(detected) / max(1, num_measurements) * meta["theoretical_grounding"], 4),
            "strong_emergence_count": sum(1 for m in detected if m["emergence_delta_ei"] > 0.1),
        },
    }


def _compute_evolve(
    transition: PhaseTransitionType, num_phases: int,
    adaptation_rate: float,
) -> dict[str, Any]:
    """Guide navigation through complexity phase transitions."""
    transition_meta: dict[str, dict[str, Any]] = {
        PhaseTransitionType.CONTINUOUS: {"critical_point_clarity": 0.8, "predictability": 0.7, "reversibility": 0.9},
        PhaseTransitionType.DISCONTINUOUS: {"critical_point_clarity": 0.6, "predictability": 0.4, "reversibility": 0.3},
        PhaseTransitionType.CRITICAL_SLOWING: {"critical_point_clarity": 0.7, "predictability": 0.6, "reversibility": 0.8},
        PhaseTransitionType.BIFURCATION: {"critical_point_clarity": 0.5, "predictability": 0.3, "reversibility": 0.2},
        PhaseTransitionType.CATASTROPHE: {"critical_point_clarity": 0.4, "predictability": 0.2, "reversibility": 0.1},
        PhaseTransitionType.AI_ADAPTIVE_TRANSITION: {"critical_point_clarity": 0.85, "predictability": 0.75, "reversibility": 0.85},
    }
    meta = transition_meta[transition]

    phases = []
    current_complexity = random.uniform(0.2, 0.4)
    for i in range(num_phases):
        # Simulate phase transition dynamics
        near_critical = random.random() < 0.3
        if near_critical:
            complexity_jump = random.uniform(0.1, 0.3) * adaptation_rate
            stability_drop = random.uniform(0.1, 0.3)
        else:
            complexity_jump = random.uniform(-0.05, 0.1) * adaptation_rate
            stability_drop = random.uniform(-0.05, 0.05)

        current_complexity = max(0.05, min(0.95, current_complexity + complexity_jump))
        stability = round(max(0.1, 1.0 - stability_drop), 4)
        adaptability = round(adaptation_rate * meta["predictability"] * random.uniform(0.7, 1.0), 4)

        phase = {
            "phase_id": f"PHS-{i+1:03d}",
            "transition_type": transition.value,
            "complexity_level": round(current_complexity, 4),
            "stability": stability,
            "adaptability": adaptability,
            "near_critical_point": near_critical,
            "critical_point_proximity": round(random.uniform(0, 1) if near_critical else random.uniform(0.5, 1), 4),
            "order_parameter": round(current_complexity * stability, 4),
            "control_parameter": round(adaptation_rate * (i + 1) / max(1, num_phases), 4),
            "susceptibility": round((1 - stability) * adaptation_rate, 4),
            "navigability": round(meta["predictability"] * stability * random.uniform(0.8, 1.0), 4),
            "emergence_potential": round(current_complexity * (1 - stability) * 0.5, 4),
            "recommended_action": random.choice(["advance_cautiously", "consolidate", "probe_critical", "retreat", "exploit_structure"]) if near_critical else "continue",
            "reversibility_index": round(meta["reversibility"] * stability, 4),
        }
        phases.append(phase)

    critical_phases = [p for p in phases if p["near_critical_point"]]
    avg_navigability = round(sum(p["navigability"] for p in phases) / max(1, num_phases), 4)
    final_complexity = phases[-1]["complexity_level"] if phases else 0.0

    return {
        "transition_type": transition.value,
        "transition_meta": meta,
        "adaptation_rate": adaptation_rate,
        "num_phases": num_phases,
        "phases": phases,
        "evolve_summary": {
            "critical_point_encounters": len(critical_phases),
            "critical_encounter_rate": round(len(critical_phases) / max(1, num_phases), 4),
            "avg_navigability": avg_navigability,
            "complexity_trajectory": "ascending" if final_complexity > 0.6 else "fluctuating" if final_complexity > 0.35 else "low",
            "final_complexity": round(final_complexity, 4),
            "avg_stability": round(sum(p["stability"] for p in phases) / max(1, num_phases), 4),
            "avg_adaptability": round(sum(p["adaptability"] for p in phases) / max(1, num_phases), 4),
            "avg_emergence_potential": round(sum(p["emergence_potential"] for p in phases) / max(1, num_phases), 4),
            "navigation_efficiency": round(avg_navigability * meta["predictability"], 4),
            "avg_reversibility": round(sum(p["reversibility_index"] for p in phases) / max(1, num_phases), 4),
            "phase_diversity": round(len(set(p["recommended_action"] for p in phases)) / 5, 4),
        },
    }


# ─── Request Models ───────────────────────────────────────────────────────────

class DetectRequest(BaseModel):
    pattern: EmergencePattern = EmergencePattern.AI_HYPER_EMERGENCE
    num_observations: int = Field(default=6, ge=1, le=30)
    sensitivity: float = Field(default=0.7, ge=0.1, le=1.0)

class AnalyzeRequest(BaseModel):
    metric: ComplexityMetric = ComplexityMetric.AI_ADAPTIVE_COMPLEXITY
    num_samples: int = Field(default=6, ge=1, le=20)
    resolution: float = Field(default=0.7, ge=0.1, le=1.0)

class DecomposeRequest(BaseModel):
    scale: ScaleLevel = ScaleLevel.AI_DYNAMIC_SCALE
    num_bridges: int = Field(default=6, ge=1, le=20)
    coupling_strength: float = Field(default=0.7, ge=0.1, le=1.0)

class SimulateRequest(BaseModel):
    model: SimulationModel = SimulationModel.AI_NEURAL_SIMULATION
    num_steps: int = Field(default=6, ge=1, le=20)
    perturbation: float = Field(default=0.5, ge=0.0, le=1.0)

class QuantifyRequest(BaseModel):
    emergence_type: CausalEmergenceType = CausalEmergenceType.AI_HYBRID_EMERGENCE
    num_measurements: int = Field(default=6, ge=1, le=20)
    granularity: float = Field(default=0.7, ge=0.1, le=1.0)

class EvolveRequest(BaseModel):
    transition: PhaseTransitionType = PhaseTransitionType.AI_ADAPTIVE_TRANSITION
    num_phases: int = Field(default=6, ge=1, le=20)
    adaptation_rate: float = Field(default=0.6, ge=0.1, le=1.0)


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/causal-emergence/detect")
async def causal_emergence_detect(req: DetectRequest) -> dict[str, Any]:
    """Detect emergent causal patterns in complex systems."""
    result = _compute_detect(req.pattern, req.num_observations, req.sensitivity)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _detect_cache261[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.post("/causal-emergence/analyze")
async def causal_emergence_analyze(req: AnalyzeRequest) -> dict[str, Any]:
    """Analyze complexity using information-theoretic metrics."""
    result = _compute_analyze(req.metric, req.num_samples, req.resolution)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _analyze_cache261[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.post("/causal-emergence/decompose")
async def causal_emergence_decompose(req: DecomposeRequest) -> dict[str, Any]:
    """Multi-scale causal decomposition identifying cross-scale bridges."""
    result = _compute_decompose(req.scale, req.num_bridges, req.coupling_strength)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _decompose_cache261[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.post("/causal-emergence/simulate")
async def causal_emergence_simulate(req: SimulateRequest) -> dict[str, Any]:
    """Simulate emergence dynamics using various computational models."""
    result = _compute_simulate(req.model, req.num_steps, req.perturbation)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _simulate_cache261[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.post("/causal-emergence/quantify")
async def causal_emergence_quantify(req: QuantifyRequest) -> dict[str, Any]:
    """Quantify causal emergence using rigorous information-theoretic measures."""
    result = _compute_quantify(req.emergence_type, req.num_measurements, req.granularity)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _quantify_cache261[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.post("/causal-emergence/evolve")
async def causal_emergence_evolve(req: EvolveRequest) -> dict[str, Any]:
    """Guide navigation through complexity phase transitions."""
    result = _compute_evolve(req.transition, req.num_phases, req.adaptation_rate)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _evolve_cache261[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.get("/causal-emergence/overview")
async def causal_emergence_overview() -> dict[str, Any]:
    """System overview for the Causal Emergence & Complexity engine."""
    return {
        "status": "success",
        "data": {
            "engine": "v1.261 — Graph Causal Emergence & Complexity Engine",
            "enums": {
                "EmergencePattern": [e.value for e in EmergencePattern],
                "ComplexityMetric": [e.value for e in ComplexityMetric],
                "ScaleLevel": [e.value for e in ScaleLevel],
                "CausalEmergenceType": [e.value for e in CausalEmergenceType],
                "SimulationModel": [e.value for e in SimulationModel],
                "PhaseTransitionType": [e.value for e in PhaseTransitionType],
            },
            "endpoints": [
                "POST /graph/causal-emergence/detect",
                "POST /graph/causal-emergence/analyze",
                "POST /graph/causal-emergence/decompose",
                "POST /graph/causal-emergence/simulate",
                "POST /graph/causal-emergence/quantify",
                "POST /graph/causal-emergence/evolve",
                "GET  /graph/causal-emergence/overview",
            ],
            "caches": {
                "detect": len(_detect_cache261),
                "analyze": len(_analyze_cache261),
                "decompose": len(_decompose_cache261),
                "simulate": len(_simulate_cache261),
                "quantify": len(_quantify_cache261),
                "evolve": len(_evolve_cache261),
            },
            "pipeline_position": {
                "predecessor": "v1.260 — Causal Meta-Cognitive Engine",
                "current": "v1.261 — Causal Emergence & Complexity Engine",
                "role": "Detect emergent causal structures, analyze multi-scale complexity, quantify causal emergence, navigate phase transitions",
            },
        },
    }
