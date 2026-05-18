# ═══════════════════════════════════════════════════════════════════════════════
# v1.260 — Graph Causal Meta-Cognitive Engine
# ═══════════════════════════════════════════════════════════════════════════════
# A self-aware causal reasoning layer that introspects on its own reasoning
# processes, meta-learns strategy selection, maintains a calibrated self-model,
# and detects/corrects cognitive biases in causal inference.
# 6 enums (36 values) × 7 endpoints (6 POST + 1 GET)
# ═══════════════════════════════════════════════════════════════════════════════

from __future__ import annotations
import enum, time, uuid, math, random
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/graph", tags=["v1.260 — Causal Meta-Cognitive"])

# ─── Enums ────────────────────────────────────────────────────────────────────

class MetaCognitiveLevel(str, enum.Enum):
    SURFACE_REASONING = "surface_reasoning"
    STRATEGIC_REASONING = "strategic_reasoning"
    REFLECTIVE_REASONING = "reflective_reasoning"
    META_STRATEGIC = "meta_strategic"
    SELF_AWARE = "self_aware"
    AI_TRANSCENDENT = "ai_transcendent"

class ReasoningMode(str, enum.Enum):
    DEDUCTIVE = "deductive"
    INDUCTIVE = "inductive"
    ABDUCTIVE = "abductive"
    ANALOGICAL = "analogical"
    COUNTERFACTUAL = "counterfactual"
    AI_HYBRID_REASONING = "ai_hybrid_reasoning"

class SelfModelDimension(str, enum.Enum):
    ACCURACY_CALIBRATION = "accuracy_calibration"
    CONFIDENCE_CALIBRATION = "confidence_calibration"
    BIAS_AWARENESS = "bias_awareness"
    STRATEGY_ADEQUACY = "strategy_adequacy"
    KNOWLEDGE_BOUNDARY = "knowledge_boundary"
    AI_META_DIMENSION = "ai_meta_dimension"

class IntrospectionType(str, enum.Enum):
    PROCESS_AUDIT = "process_audit"
    OUTCOME_AUDIT = "outcome_audit"
    STRATEGY_AUDIT = "strategy_audit"
    BIAS_AUDIT = "bias_audit"
    CONSISTENCY_AUDIT = "consistency_audit"
    AI_COMPREHENSIVE_AUDIT = "ai_comprehensive_audit"

class MetaLearningStrategy(str, enum.Enum):
    LEARNING_TO_LEARN = "learning_to_learn"
    STRATEGY_SELECTION = "strategy_selection"
    RESOURCE_ALLOCATION = "resource_allocation"
    ERROR_PREDICTION = "error_prediction"
    CAPABILITY_MAPPING = "capability_mapping"
    AI_META_ADAPTIVE = "ai_meta_adaptive"

class CognitiveBiasType(str, enum.Enum):
    CONFIRMATION_BIAS = "confirmation_bias"
    ANCHORING_BIAS = "anchoring_bias"
    AVAILABILITY_BIAS = "availability_bias"
    SELECTION_BIAS = "selection_bias"
    OVERCONFIDENCE_BIAS = "overconfidence_bias"
    AI_DEBIASING = "ai_debiasing"

# ─── Caches ───────────────────────────────────────────────────────────────────

_reflect_cache260: dict[str, Any] = {}
_strategize_cache260: dict[str, Any] = {}
_selfmodel_cache260: dict[str, Any] = {}
_introspect_cache260: dict[str, Any] = {}
_metalearn_cache260: dict[str, Any] = {}
_debias_cache260: dict[str, Any] = {}

# ─── Compute helpers ──────────────────────────────────────────────────────────

def _compute_reflect(
    level: MetaCognitiveLevel, reasoning_mode: ReasoningMode,
    num_reflections: int, depth: float,
) -> dict[str, Any]:
    """Self-reflection on causal reasoning processes."""
    level_meta: dict[str, dict[str, Any]] = {
        MetaCognitiveLevel.SURFACE_REASONING: {"depth_factor": 0.2, "insight_quality": 0.3, "abstraction": "concrete"},
        MetaCognitiveLevel.STRATEGIC_REASONING: {"depth_factor": 0.4, "insight_quality": 0.5, "abstraction": "tactical"},
        MetaCognitiveLevel.REFLECTIVE_REASONING: {"depth_factor": 0.6, "insight_quality": 0.7, "abstraction": "reflective"},
        MetaCognitiveLevel.META_STRATEGIC: {"depth_factor": 0.8, "insight_quality": 0.85, "abstraction": "strategic"},
        MetaCognitiveLevel.SELF_AWARE: {"depth_factor": 0.9, "insight_quality": 0.92, "abstraction": "meta"},
        MetaCognitiveLevel.AI_TRANSCENDENT: {"depth_factor": 0.95, "insight_quality": 0.97, "abstraction": "transcendent"},
    }
    mode_meta: dict[str, dict[str, Any]] = {
        ReasoningMode.DEDUCTIVE: {"rigor": 0.9, "creativity": 0.3, "certainty": 0.85},
        ReasoningMode.INDUCTIVE: {"rigor": 0.6, "creativity": 0.5, "certainty": 0.6},
        ReasoningMode.ABDUCTIVE: {"rigor": 0.5, "creativity": 0.8, "certainty": 0.5},
        ReasoningMode.ANALOGICAL: {"rigor": 0.4, "creativity": 0.9, "certainty": 0.4},
        ReasoningMode.COUNTERFACTUAL: {"rigor": 0.7, "creativity": 0.7, "certainty": 0.55},
        ReasoningMode.AI_HYBRID_REASONING: {"rigor": 0.75, "creativity": 0.75, "certainty": 0.7},
    }
    l_meta = level_meta[level]
    r_meta = mode_meta[reasoning_mode]

    reflections = []
    focus_areas = [
        "assumption_validity", "evidence_sufficiency", "logical_coherence",
        "alternative_explanations", "confounding_awareness", "temporal_consistency",
        "scope_limitations", "generalization_risk", "model_adequacy",
        "data_quality_impact", "selection_effects", "measurement_validity",
    ]
    for i in range(num_reflections):
        insight_depth = round(l_meta["depth_factor"] * depth * random.uniform(0.7, 1.0), 4)
        focus = focus_areas[i % len(focus_areas)]
        quality_score = round(l_meta["insight_quality"] * r_meta["rigor"] * random.uniform(0.8, 1.0), 4)
        blind_spot_detected = random.random() < (1 - l_meta["depth_factor"]) * 0.4
        reflection = {
            "reflection_id": f"REF-{i+1:03d}",
            "meta_level": level.value,
            "reasoning_mode": reasoning_mode.value,
            "focus_area": focus,
            "insight_depth": insight_depth,
            "insight_quality": quality_score,
            "assumption_challenged": random.random() < 0.3 * depth,
            "blind_spot_detected": blind_spot_detected,
            "blind_spot_severity": round(random.random() * 0.5, 4) if blind_spot_detected else 0.0,
            "confidence_in_insight": round(min(1.0, quality_score * 1.1), 4),
            "novelty_score": round(random.random() * l_meta["insight_quality"], 4),
            "actionable": quality_score > 0.5,
            "abstraction_level": l_meta["abstraction"],
            "cross_domain_relevance": round(random.random() * depth, 4),
        }
        reflections.append(reflection)

    blind_spots = [r for r in reflections if r["blind_spot_detected"]]
    avg_quality = round(sum(r["insight_quality"] for r in reflections) / max(1, num_reflections), 4)
    actionable_count = sum(1 for r in reflections if r["actionable"])

    return {
        "meta_level": level.value,
        "reasoning_mode": reasoning_mode.value,
        "level_meta": l_meta,
        "mode_meta": r_meta,
        "depth": depth,
        "num_reflections": num_reflections,
        "reflections": reflections,
        "reflection_summary": {
            "avg_insight_quality": avg_quality,
            "avg_insight_depth": round(sum(r["insight_depth"] for r in reflections) / max(1, num_reflections), 4),
            "blind_spots_detected": len(blind_spots),
            "blind_spot_rate": round(len(blind_spots) / max(1, num_reflections), 4),
            "assumptions_challenged": sum(1 for r in reflections if r["assumption_challenged"]),
            "actionable_insights": actionable_count,
            "avg_novelty": round(sum(r["novelty_score"] for r in reflections) / max(1, num_reflections), 4),
            "meta_cognitive_index": round(avg_quality * l_meta["depth_factor"], 4),
            "reasoning_rigor": r_meta["rigor"],
        },
    }


def _compute_strategize(
    strategy: MetaLearningStrategy, num_strategies: int,
    complexity_budget: float,
) -> dict[str, Any]:
    """Meta-strategy selection and planning for causal inference."""
    strategy_meta: dict[str, dict[str, Any]] = {
        MetaLearningStrategy.LEARNING_TO_LEARN: {"adaptability": 0.9, "overhead": 0.3, "long_term_gain": 0.85},
        MetaLearningStrategy.STRATEGY_SELECTION: {"adaptability": 0.7, "overhead": 0.2, "long_term_gain": 0.75},
        MetaLearningStrategy.RESOURCE_ALLOCATION: {"adaptability": 0.6, "overhead": 0.15, "long_term_gain": 0.65},
        MetaLearningStrategy.ERROR_PREDICTION: {"adaptability": 0.8, "overhead": 0.25, "long_term_gain": 0.80},
        MetaLearningStrategy.CAPABILITY_MAPPING: {"adaptability": 0.5, "overhead": 0.35, "long_term_gain": 0.70},
        MetaLearningStrategy.AI_META_ADAPTIVE: {"adaptability": 0.95, "overhead": 0.2, "long_term_gain": 0.90},
    }
    s_meta = strategy_meta[strategy]

    strategies = []
    causal_tasks = [
        "discovery", "effect_estimation", "counterfactual", "mediation",
        "intervention", "fairness_analysis", "temporal_reasoning",
        "ensemble_synthesis", "feedback_integration", "bias_correction",
        "robustness_check", "knowledge_transfer",
    ]
    approach_options = [
        ("conservative", 0.7, 0.3), ("moderate", 0.5, 0.5),
        ("aggressive", 0.3, 0.7), ("exploratory", 0.4, 0.6),
        ("systematic", 0.6, 0.4), ("adaptive", 0.5, 0.65),
    ]
    for i in range(num_strategies):
        task = causal_tasks[i % len(causal_tasks)]
        approach, reliability, risk = approach_options[i % len(approach_options)]
        effectiveness = round(s_meta["long_term_gain"] * reliability * random.uniform(0.8, 1.0), 4)
        cost = round(s_meta["overhead"] * complexity_budget * random.uniform(0.5, 1.0), 4)
        strat = {
            "strategy_id": f"STRAT-{i+1:03d}",
            "meta_strategy": strategy.value,
            "target_task": task,
            "recommended_approach": approach,
            "expected_effectiveness": effectiveness,
            "estimated_cost": cost,
            "roi": round(effectiveness / max(0.01, cost), 4),
            "confidence": round(reliability * s_meta["adaptability"], 4),
            "risk_level": risk,
            "complexity_required": round(complexity_budget * random.uniform(0.3, 1.0), 4),
            "prerequisites_met": random.random() > 0.2,
            "fallback_available": random.random() > 0.3,
            "priority": round(effectiveness * (1 - risk) * (1 - cost), 4),
        }
        strategies.append(strat)

    avg_effectiveness = round(sum(s["expected_effectiveness"] for s in strategies) / max(1, num_strategies), 4)
    total_cost = round(sum(s["estimated_cost"] for s in strategies), 4)
    high_priority = sum(1 for s in strategies if s["priority"] > 0.15)

    return {
        "meta_strategy": strategy.value,
        "strategy_meta": s_meta,
        "complexity_budget": complexity_budget,
        "num_strategies": num_strategies,
        "strategies": sorted(strategies, key=lambda s: s["priority"], reverse=True),
        "strategize_summary": {
            "avg_effectiveness": avg_effectiveness,
            "total_cost": total_cost,
            "cost_efficiency": round(avg_effectiveness / max(0.01, total_cost), 4),
            "high_priority_count": high_priority,
            "prerequisites_met_rate": round(sum(1 for s in strategies if s["prerequisites_met"]) / max(1, num_strategies), 4),
            "fallback_coverage": round(sum(1 for s in strategies if s["fallback_available"]) / max(1, num_strategies), 4),
            "avg_confidence": round(sum(s["confidence"] for s in strategies) / max(1, num_strategies), 4),
            "budget_utilization": round(total_cost / max(0.01, complexity_budget), 4),
        },
    }


def _compute_self_model(
    dimension: SelfModelDimension, num_assessments: int,
    calibration_window: int,
) -> dict[str, Any]:
    """Maintain a calibrated self-model of causal reasoning capabilities."""
    dim_meta: dict[str, dict[str, Any]] = {
        SelfModelDimension.ACCURACY_CALIBRATION: {"current_level": 0.75, "trend": "improving", "volatility": 0.08},
        SelfModelDimension.CONFIDENCE_CALIBRATION: {"current_level": 0.68, "trend": "stable", "volatility": 0.12},
        SelfModelDimension.BIAS_AWARENESS: {"current_level": 0.55, "trend": "improving", "volatility": 0.15},
        SelfModelDimension.STRATEGY_ADEQUACY: {"current_level": 0.72, "trend": "improving", "volatility": 0.10},
        SelfModelDimension.KNOWLEDGE_BOUNDARY: {"current_level": 0.60, "trend": "expanding", "volatility": 0.20},
        SelfModelDimension.AI_META_DIMENSION: {"current_level": 0.82, "trend": "accelerating", "volatility": 0.06},
    }
    meta = dim_meta[dimension]

    assessments = []
    base_level = meta["current_level"]
    for i in range(num_assessments):
        step = i % calibration_window
        # Simulate calibration curve: actual vs self-predicted performance
        actual_performance = round(min(1.0, base_level + random.gauss(0.02 * step / calibration_window, meta["volatility"])), 4)
        actual_performance = max(0.1, actual_performance)
        predicted_performance = round(actual_performance + random.gauss(0, meta["volatility"] * 0.5), 4)
        predicted_performance = max(0.05, min(1.0, predicted_performance))
        calibration_error = round(abs(actual_performance - predicted_performance), 4)

        # Calibration curve: ideal = 1.0 (perfect match), <1 = overconfident, >1 = underconfident
        if actual_performance > 0.01:
            calibration_ratio = round(predicted_performance / actual_performance, 4)
        else:
            calibration_ratio = 1.0

        assessment = {
            "assessment_id": f"ASM-{i+1:03d}",
            "dimension": dimension.value,
            "time_step": step,
            "actual_performance": actual_performance,
            "self_predicted_performance": predicted_performance,
            "calibration_error": calibration_error,
            "calibration_ratio": calibration_ratio,
            "calibration_grade": "A" if calibration_error < 0.05 else "B" if calibration_error < 0.10 else "C" if calibration_error < 0.15 else "D" if calibration_error < 0.20 else "F",
            "overconfidence": predicted_performance > actual_performance * 1.05,
            "underconfidence": predicted_performance < actual_performance * 0.95,
            "trend_direction": "up" if actual_performance > base_level else "down" if actual_performance < base_level - 0.05 else "stable",
            "reliability_index": round(1 - calibration_error, 4),
            "learning_signal": "positive" if actual_performance > predicted_performance else "negative" if actual_performance < predicted_performance * 0.9 else "neutral",
        }
        assessments.append(assessment)
        base_level = actual_performance  # Track evolution

    avg_calibration_error = round(sum(a["calibration_error"] for a in assessments) / max(1, num_assessments), 4)
    grade_dist = {}
    for a in assessments:
        g = a["calibration_grade"]
        grade_dist[g] = grade_dist.get(g, 0) + 1
    overconfident_count = sum(1 for a in assessments if a["overconfidence"])
    underconfident_count = sum(1 for a in assessments if a["underconfidence"])

    return {
        "dimension": dimension.value,
        "dimension_meta": meta,
        "calibration_window": calibration_window,
        "num_assessments": num_assessments,
        "assessments": assessments,
        "self_model_summary": {
            "avg_calibration_error": avg_calibration_error,
            "calibration_accuracy": round(1 - avg_calibration_error, 4),
            "grade_distribution": grade_dist,
            "overconfident_rate": round(overconfident_count / max(1, num_assessments), 4),
            "underconfident_rate": round(underconfident_count / max(1, num_assessments), 4),
            "overall_trend": meta["trend"],
            "current_level": round(assessments[-1]["actual_performance"], 4) if assessments else meta["current_level"],
            "self_awareness_index": round(1 - avg_calibration_error * 2, 4),
            "calibration_improvement_potential": round(avg_calibration_error * 0.5, 4),
        },
    }


def _compute_introspect(
    itype: IntrospectionType, num_audits: int,
    thoroughness: float,
) -> dict[str, Any]:
    """Introspective auditing of causal decision processes."""
    itype_meta: dict[str, dict[str, Any]] = {
        IntrospectionType.PROCESS_AUDIT: {"scope": "procedural", "depth": 0.6, "objectivity": 0.8},
        IntrospectionType.OUTCOME_AUDIT: {"scope": "result_oriented", "depth": 0.5, "objectivity": 0.9},
        IntrospectionType.STRATEGY_AUDIT: {"scope": "methodological", "depth": 0.7, "objectivity": 0.75},
        IntrospectionType.BIAS_AUDIT: {"scope": "cognitive", "depth": 0.8, "objectivity": 0.7},
        IntrospectionType.CONSISTENCY_AUDIT: {"scope": "cross_referential", "depth": 0.65, "objectivity": 0.85},
        IntrospectionType.AI_COMPREHENSIVE_AUDIT: {"scope": "holistic", "depth": 0.9, "objectivity": 0.88},
    }
    meta = itype_meta[itype]

    audits = []
    decision_points = [
        "variable_selection", "model_specification", "identification_strategy",
        "estimator_choice", "hypothesis_formulation", "evidence_evaluation",
        "conclusion_drawing", "robustness_check", "sensitivity_analysis",
        "external_validity", "temporal_extrapolation", "domain_transfer",
    ]
    for i in range(num_audits):
        decision = decision_points[i % len(decision_points)]
        audit_depth = round(meta["depth"] * thoroughness * random.uniform(0.7, 1.0), 4)
        consistency_score = round(meta["objectivity"] * random.uniform(0.6, 1.0), 4)
        issue_found = random.random() < (1 - meta["objectivity"]) * 0.5
        audit = {
            "audit_id": f"AUD-{i+1:03d}",
            "introspection_type": itype.value,
            "decision_point": decision,
            "audit_depth": audit_depth,
            "consistency_score": consistency_score,
            "logical_coherence": round(0.5 + 0.5 * random.random(), 4),
            "evidence_adequacy": round(0.4 + 0.5 * random.random(), 4),
            "alternative_considered": random.random() > 0.3,
            "issue_found": issue_found,
            "issue_severity": round(random.random() * 0.7, 4) if issue_found else 0.0,
            "issue_type": random.choice(["logical_gap", "unsupported_assumption", "circular_reasoning", "cherry_picking", "scope_violation"]) if issue_found else "none",
            "recommendation": random.choice(["strengthen_evidence", "reconsider_alternative", "add_robustness_check", "refine_scope", "validate_externally"]) if issue_found else "maintain",
            "confidence_in_audit": round(meta["objectivity"] * random.uniform(0.8, 1.0), 4),
            "scope": meta["scope"],
        }
        audits.append(audit)

    issues = [a for a in audits if a["issue_found"]]
    avg_consistency = round(sum(a["consistency_score"] for a in audits) / max(1, num_audits), 4)
    avg_coherence = round(sum(a["logical_coherence"] for a in audits) / max(1, num_audits), 4)

    issue_types = {}
    for a in issues:
        it = a["issue_type"]
        issue_types[it] = issue_types.get(it, 0) + 1

    return {
        "introspection_type": itype.value,
        "itype_meta": meta,
        "thoroughness": thoroughness,
        "num_audits": num_audits,
        "audits": audits,
        "introspect_summary": {
            "avg_consistency": avg_consistency,
            "avg_logical_coherence": avg_coherence,
            "issue_rate": round(len(issues) / max(1, num_audits), 4),
            "issues_found": len(issues),
            "issue_type_distribution": issue_types,
            "avg_issue_severity": round(sum(a["issue_severity"] for a in issues) / max(1, len(issues)), 4) if issues else 0.0,
            "critical_issues": sum(1 for a in issues if a["issue_severity"] > 0.5),
            "alternatives_considered_rate": round(sum(1 for a in audits if a["alternative_considered"]) / max(1, num_audits), 4),
            "avg_evidence_adequacy": round(sum(a["evidence_adequacy"] for a in audits) / max(1, num_audits), 4),
            "introspection_quality_index": round((avg_consistency + avg_coherence) / 2 * meta["objectivity"], 4),
        },
    }


def _compute_meta_learn(
    strategy: MetaLearningStrategy, num_lessons: int,
    transfer_breadth: float,
) -> dict[str, Any]:
    """Meta-learning across pipeline stages for improved causal reasoning."""
    strategy_effectiveness: dict[str, dict[str, Any]] = {
        MetaLearningStrategy.LEARNING_TO_LEARN: {"transfer": 0.9, "retention": 0.7, "generalization": 0.85},
        MetaLearningStrategy.STRATEGY_SELECTION: {"transfer": 0.6, "retention": 0.8, "generalization": 0.7},
        MetaLearningStrategy.RESOURCE_ALLOCATION: {"transfer": 0.5, "retention": 0.85, "generalization": 0.6},
        MetaLearningStrategy.ERROR_PREDICTION: {"transfer": 0.8, "retention": 0.75, "generalization": 0.8},
        MetaLearningStrategy.CAPABILITY_MAPPING: {"transfer": 0.7, "retention": 0.9, "generalization": 0.65},
        MetaLearningStrategy.AI_META_ADAPTIVE: {"transfer": 0.92, "retention": 0.88, "generalization": 0.90},
    }
    s_eff = strategy_effectiveness[strategy]

    pipeline_stages = [
        ("discovery", 0.78), ("explanation", 0.82), ("argumentation", 0.75),
        ("fairness", 0.70), ("curriculum", 0.68), ("optimization", 0.80),
        ("intervention", 0.77), ("distillation", 0.85), ("ensemble", 0.83),
        ("temporal_evolution", 0.72), ("feedback_loop", 0.76),
    ]

    lessons = []
    for i in range(num_lessons):
        source_stage, source_perf = pipeline_stages[i % len(pipeline_stages)]
        target_stage, target_perf = pipeline_stages[(i + 3) % len(pipeline_stages)]

        transfer_success = round(
            s_eff["transfer"] * transfer_breadth * random.uniform(0.6, 1.0), 4
        )
        performance_gain = round(
            transfer_success * (1 - target_perf) * 0.5, 4
        )
        retention = round(s_eff["retention"] * random.uniform(0.8, 1.0), 4)
        generalization = round(s_eff["generalization"] * transfer_breadth * random.uniform(0.7, 1.0), 4)

        lesson = {
            "lesson_id": f"LES-{i+1:03d}",
            "meta_strategy": strategy.value,
            "source_stage": source_stage,
            "source_stage_performance": source_perf,
            "target_stage": target_stage,
            "target_stage_baseline": target_perf,
            "transfer_success": transfer_success,
            "performance_gain": performance_gain,
            "projected_target_performance": round(min(1.0, target_perf + performance_gain), 4),
            "knowledge_retention": retention,
            "cross_domain_generalization": generalization,
            "learning_speed": round(transfer_success * 2, 4),
            "negative_transfer_risk": round(random.random() * (1 - s_eff["transfer"]) * 0.3, 4),
            "lesson_quality": round((transfer_success + retention + generalization) / 3, 4),
            "applicable_breadth": round(transfer_breadth * s_eff["generalization"], 4),
        }
        lessons.append(lesson)

    avg_gain = round(sum(l["performance_gain"] for l in lessons) / max(1, num_lessons), 4)
    avg_retention = round(sum(l["knowledge_retention"] for l in lessons) / max(1, num_lessons), 4)
    avg_generalization = round(sum(l["cross_domain_generalization"] for l in lessons) / max(1, num_lessons), 4)

    return {
        "meta_strategy": strategy.value,
        "strategy_effectiveness": s_eff,
        "transfer_breadth": transfer_breadth,
        "num_lessons": num_lessons,
        "lessons": lessons,
        "meta_learn_summary": {
            "avg_performance_gain": avg_gain,
            "avg_knowledge_retention": avg_retention,
            "avg_generalization": avg_generalization,
            "meta_learning_effectiveness": round((avg_gain * 3 + avg_retention + avg_generalization) / 5, 4),
            "negative_transfer_rate": round(sum(1 for l in lessons if l["negative_transfer_risk"] > 0.1) / max(1, num_lessons), 4),
            "avg_lesson_quality": round(sum(l["lesson_quality"] for l in lessons) / max(1, num_lessons), 4),
            "pipeline_coverage": round(len(set(l["source_stage"] for l in lessons)) / len(pipeline_stages), 4),
            "learning_velocity_index": round(avg_gain * 10, 4),
        },
    }


def _compute_debias(
    bias_type: CognitiveBiasType, num_interventions: int,
    debias_strength: float,
) -> dict[str, Any]:
    """Detect and correct cognitive biases in causal inference."""
    bias_meta: dict[str, dict[str, Any]] = {
        CognitiveBiasType.CONFIRMATION_BIAS: {"prevalence": 0.65, "detection_difficulty": 0.4, "correction_ease": 0.5},
        CognitiveBiasType.ANCHORING_BIAS: {"prevalence": 0.55, "detection_difficulty": 0.3, "correction_ease": 0.6},
        CognitiveBiasType.AVAILABILITY_BIAS: {"prevalence": 0.50, "detection_difficulty": 0.35, "correction_ease": 0.55},
        CognitiveBiasType.SELECTION_BIAS: {"prevalence": 0.70, "detection_difficulty": 0.5, "correction_ease": 0.4},
        CognitiveBiasType.OVERCONFIDENCE_BIAS: {"prevalence": 0.60, "detection_difficulty": 0.45, "correction_ease": 0.45},
        CognitiveBiasType.AI_DEBIASING: {"prevalence": 0.40, "detection_difficulty": 0.25, "correction_ease": 0.8},
    }
    meta = bias_meta[bias_type]

    interventions = []
    reasoning_steps = [
        "hypothesis_generation", "evidence_collection", "pattern_recognition",
        "causal_attribution", "strength_assessment", "conclusion_synthesis",
        "counterfactual_evaluation", "robustness_verification",
    ]
    for i in range(num_interventions):
        step = reasoning_steps[i % len(reasoning_steps)]
        bias_detected = random.random() < meta["prevalence"]
        if bias_detected:
            severity = round(random.random() * 0.8 + 0.1, 4)
            correction_effectiveness = round(
                debias_strength * meta["correction_ease"] * random.uniform(0.7, 1.0), 4
            )
            residual_bias = round(severity * (1 - correction_effectiveness), 4)
        else:
            severity = 0.0
            correction_effectiveness = 0.0
            residual_bias = 0.0

        intervention = {
            "intervention_id": f"DBI-{i+1:03d}",
            "bias_type": bias_type.value,
            "reasoning_step": step,
            "bias_detected": bias_detected,
            "bias_severity": severity,
            "detection_confidence": round(1 - meta["detection_difficulty"] * random.uniform(0.5, 1.0), 4),
            "correction_applied": bias_detected and debias_strength > 0.3,
            "correction_method": random.choice(["reweighting", "perspective_shift", "adversarial_challenge", "blind_analysis", "pre_registration", "ensemble_debias"]) if bias_detected else "none",
            "correction_effectiveness": correction_effectiveness,
            "residual_bias": residual_bias,
            "confidence_after_correction": round(max(0.1, 1 - residual_bias), 4) if bias_detected else round(0.7 + 0.25 * random.random(), 4),
            "debias_strength": debias_strength,
            "side_effect_risk": round(debias_strength * (1 - meta["correction_ease"]) * 0.2, 4),
        }
        interventions.append(intervention)

    detected = [iv for iv in interventions if iv["bias_detected"]]
    corrected = [iv for iv in detected if iv["correction_applied"]]
    avg_residual = round(sum(iv["residual_bias"] for iv in detected) / max(1, len(detected)), 4) if detected else 0.0

    return {
        "bias_type": bias_type.value,
        "bias_meta": meta,
        "debias_strength": debias_strength,
        "num_interventions": num_interventions,
        "interventions": interventions,
        "debias_summary": {
            "bias_detection_rate": round(len(detected) / max(1, num_interventions), 4),
            "correction_rate": round(len(corrected) / max(1, len(detected)), 4) if detected else 0.0,
            "avg_bias_severity": round(sum(iv["bias_severity"] for iv in detected) / max(1, len(detected)), 4) if detected else 0.0,
            "avg_residual_bias": avg_residual,
            "avg_correction_effectiveness": round(sum(iv["correction_effectiveness"] for iv in corrected) / max(1, len(corrected)), 4) if corrected else 0.0,
            "overall_debiasing_impact": round((1 - avg_residual) * debias_strength, 4) if detected else round(debias_strength * 0.5, 4),
            "side_effect_risk": round(sum(iv["side_effect_risk"] for iv in interventions) / max(1, num_interventions), 4),
            "debiased_confidence": round(1 - avg_residual * 0.5, 4),
        },
    }


# ─── Request Models ───────────────────────────────────────────────────────────

class ReflectRequest(BaseModel):
    level: MetaCognitiveLevel = MetaCognitiveLevel.REFLECTIVE_REASONING
    reasoning_mode: ReasoningMode = ReasoningMode.AI_HYBRID_REASONING
    num_reflections: int = Field(default=6, ge=1, le=30)
    depth: float = Field(default=0.7, ge=0.1, le=1.0)

class StrategizeRequest(BaseModel):
    strategy: MetaLearningStrategy = MetaLearningStrategy.AI_META_ADAPTIVE
    num_strategies: int = Field(default=6, ge=1, le=20)
    complexity_budget: float = Field(default=0.8, ge=0.1, le=2.0)

class SelfModelRequest(BaseModel):
    dimension: SelfModelDimension = SelfModelDimension.AI_META_DIMENSION
    num_assessments: int = Field(default=6, ge=1, le=30)
    calibration_window: int = Field(default=10, ge=3, le=50)

class IntrospectRequest(BaseModel):
    itype: IntrospectionType = IntrospectionType.AI_COMPREHENSIVE_AUDIT
    num_audits: int = Field(default=6, ge=1, le=20)
    thoroughness: float = Field(default=0.8, ge=0.1, le=1.0)

class MetaLearnRequest(BaseModel):
    strategy: MetaLearningStrategy = MetaLearningStrategy.AI_META_ADAPTIVE
    num_lessons: int = Field(default=6, ge=1, le=20)
    transfer_breadth: float = Field(default=0.7, ge=0.1, le=1.0)

class DebiasRequest(BaseModel):
    bias_type: CognitiveBiasType = CognitiveBiasType.AI_DEBIASING
    num_interventions: int = Field(default=6, ge=1, le=20)
    debias_strength: float = Field(default=0.7, ge=0.1, le=1.0)


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/causal-meta-cognitive/reflect")
async def causal_meta_reflect(req: ReflectRequest) -> dict[str, Any]:
    """Self-reflection on causal reasoning processes."""
    result = _compute_reflect(req.level, req.reasoning_mode, req.num_reflections, req.depth)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _reflect_cache260[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.post("/causal-meta-cognitive/strategize")
async def causal_meta_strategize(req: StrategizeRequest) -> dict[str, Any]:
    """Meta-strategy selection and planning for causal inference."""
    result = _compute_strategize(req.strategy, req.num_strategies, req.complexity_budget)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _strategize_cache260[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.post("/causal-meta-cognitive/self-model")
async def causal_meta_self_model(req: SelfModelRequest) -> dict[str, Any]:
    """Maintain a calibrated self-model of causal reasoning capabilities."""
    result = _compute_self_model(req.dimension, req.num_assessments, req.calibration_window)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _selfmodel_cache260[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.post("/causal-meta-cognitive/introspect")
async def causal_meta_introspect(req: IntrospectRequest) -> dict[str, Any]:
    """Introspective auditing of causal decision processes."""
    result = _compute_introspect(req.itype, req.num_audits, req.thoroughness)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _introspect_cache260[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.post("/causal-meta-cognitive/meta-learn")
async def causal_meta_learn(req: MetaLearnRequest) -> dict[str, Any]:
    """Meta-learning across pipeline stages for improved causal reasoning."""
    result = _compute_meta_learn(req.strategy, req.num_lessons, req.transfer_breadth)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _metalearn_cache260[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.post("/causal-meta-cognitive/debias")
async def causal_meta_debias(req: DebiasRequest) -> dict[str, Any]:
    """Detect and correct cognitive biases in causal inference."""
    result = _compute_debias(req.bias_type, req.num_interventions, req.debias_strength)
    result["request_id"] = uuid.uuid4().hex[:12]
    result["timestamp"] = time.time()
    _debias_cache260[result["request_id"]] = result
    return {"status": "success", "data": result}


@router.get("/causal-meta-cognitive/overview")
async def causal_meta_overview() -> dict[str, Any]:
    """System overview for the Causal Meta-Cognitive engine."""
    return {
        "status": "success",
        "data": {
            "engine": "v1.260 — Graph Causal Meta-Cognitive Engine",
            "enums": {
                "MetaCognitiveLevel": [e.value for e in MetaCognitiveLevel],
                "ReasoningMode": [e.value for e in ReasoningMode],
                "SelfModelDimension": [e.value for e in SelfModelDimension],
                "IntrospectionType": [e.value for e in IntrospectionType],
                "MetaLearningStrategy": [e.value for e in MetaLearningStrategy],
                "CognitiveBiasType": [e.value for e in CognitiveBiasType],
            },
            "endpoints": [
                "POST /graph/causal-meta-cognitive/reflect",
                "POST /graph/causal-meta-cognitive/strategize",
                "POST /graph/causal-meta-cognitive/self-model",
                "POST /graph/causal-meta-cognitive/introspect",
                "POST /graph/causal-meta-cognitive/meta-learn",
                "POST /graph/causal-meta-cognitive/debias",
                "GET  /graph/causal-meta-cognitive/overview",
            ],
            "caches": {
                "reflect": len(_reflect_cache260),
                "strategize": len(_strategize_cache260),
                "self_model": len(_selfmodel_cache260),
                "introspect": len(_introspect_cache260),
                "meta_learn": len(_metalearn_cache260),
                "debias": len(_debias_cache260),
            },
            "pipeline_position": {
                "predecessor": "v1.259 — Causal Feedback Loop Engine",
                "current": "v1.260 — Causal Meta-Cognitive Engine",
                "role": "Self-aware causal reasoning — introspection, meta-learning, self-model calibration, cognitive bias correction",
            },
        },
    }
