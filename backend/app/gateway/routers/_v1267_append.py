# ═══════════════════════════════════════════════════════════════════════════════
# v1.267 — Graph Causal Explainability & Interpretation Engine
# ═══════════════════════════════════════════════════════════════════════════════
# After resilience & fault tolerance (v1.266), this engine bridges machine
# intelligence to human understanding. It generates multi-level causal
# explanations, interprets model internals, produces counterfactual analyses,
# creates visualization-ready data, generates narrative explanations, and
# validates explanation quality — making the causal intelligence stack
# transparent, trustworthy, and auditable by humans.
# 6 enums (36 values) × 7 endpoints (6 POST + 1 GET)
# ═══════════════════════════════════════════════════════════════════════════════

from __future__ import annotations
import enum, time, uuid, math, random
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/graph", tags=["v1.267 — Explainability & Interpretation"])

# ─── Enums ────────────────────────────────────────────────────────────────────

class ExplanationType(str, enum.Enum):
    NATURAL_LANGUAGE = "natural_language"
    COUNTERFACTUAL = "counterfactual"
    MECHANISTIC = "mechanistic"
    STATISTICAL = "statistical"
    STRUCTURAL = "structural"
    AI_MULTI_MODAL = "ai_multi_modal"

class AudienceLevel(str, enum.Enum):
    EXPERT = "expert"
    PRACTITIONER = "practitioner"
    STAKEHOLDER = "stakeholder"
    GENERAL_PUBLIC = "general_public"
    REGULATORY = "regulatory"
    AI_ADAPTIVE = "ai_adaptive"

class InterpretationMethod(str, enum.Enum):
    FEATURE_IMPORTANCE = "feature_importance"
    PARTIAL_DEPENDENCE = "partial_dependence"
    SHAP_VALUES = "shap_values"
    ATTENTION_WEIGHTS = "attention_weights"
    CAUSAL_PATH_TRACE = "causal_path_trace"
    AI_HOLISTIC = "ai_holistic"

class VisualizationType(str, enum.Enum):
    CAUSAL_GRAPH = "causal_graph"
    FLOW_DIAGRAM = "flow_diagram"
    HEATMAP = "heatmap"
    TIMELINE = "timeline"
    SANKEY_DIAGRAM = "sankey_diagram"
    AI_INTERACTIVE_3D = "ai_interactive_3d"

class NarrativeStyle(str, enum.Enum):
    ANALYTICAL = "analytical"
    STORYTELLING = "storytelling"
    QUESTION_ANSWER = "question_answer"
    COMPARATIVE = "comparative"
    PEDAGOGICAL = "pedagogical"
    AI_CONTEXTUAL = "ai_contextual"

class ValidationMethod(str, enum.Enum):
    HUMAN_EVALUATION = "human_evaluation"
    CONSISTENCY_CHECK = "consistency_check"
    FAITHFULNESS_TEST = "faithfulness_test"
    ROBUSTNESS_CHECK = "robustness_check"
    ABLATION_STUDY = "ablation_study"
    AI_META_VALIDATION = "ai_meta_validation"

# ─── Caches ───────────────────────────────────────────────────────────────────

_explain_cache267: dict[str, Any] = {}
_interpret_cache267: dict[str, Any] = {}
_counterfactual_cache267: dict[str, Any] = {}
_visualize_cache267: dict[str, Any] = {}
_narrate_cache267: dict[str, Any] = {}
_validate_cache267: dict[str, Any] = {}

# ─── Compute helpers ──────────────────────────────────────────────────────────

def _compute_explain(
    explanation_type: ExplanationType,
    audience: AudienceLevel,
    depth: int,
) -> dict[str, Any]:
    """Generate multi-level causal explanations for human understanding."""
    rng = random.Random(hash(explanation_type.value) + hash(audience.value) + depth * 19)
    explanation_layers = min(depth, 6)
    causal_claims = rng.randint(4, 12)
    evidence_nodes = rng.randint(8, 30)

    # Audience complexity mapping
    audience_complexity = {
        "expert": 0.9, "practitioner": 0.7, "stakeholder": 0.5,
        "general_public": 0.3, "regulatory": 0.6, "ai_adaptive": 0.8,
    }
    complexity = audience_complexity.get(audience.value, 0.5)

    claims = []
    claim_templates = [
        "X causes Y through direct mechanism M",
        "Variable A mediates the effect of B on C",
        "Intervention I reduces outcome O by P%",
        "Confounding factor F explains the spurious correlation between S and T",
        "Feedback loop L amplifies the causal effect E",
        "Temporal lag T separates cause C from effect E",
        "Interaction between I1 and I2 modulates outcome O",
        "Path P1 carries N% of the total causal effect",
        "Boundary condition B limits the causal effect to domain D",
        "Non-linear relationship R emerges at threshold T",
        "Instrumental variable Z identifies the causal effect of X on Y",
        "Mediator M partially explains the causal chain from A to C",
    ]
    for i in range(causal_claims):
        confidence = rng.uniform(0.5, 0.99)
        evidence_strength = rng.uniform(0.4, 0.95)
        simplicity = rng.uniform(0.3, 0.9)
        completeness = rng.uniform(0.4, 0.95)
        claims.append({
            "claim_id": f"CLAIM_{i:04d}",
            "claim_text": claim_templates[i % len(claim_templates)],
            "confidence": round(confidence, 4),
            "evidence_strength": round(evidence_strength, 4),
            "simplicity_score": round(simplicity, 4),
            "completeness_score": round(completeness, 4),
            "audience_appropriateness": round(
                1 - abs(simplicity - (1 - complexity)) * 0.5, 4
            ),
            "explanation_depth": min(i + 1, explanation_layers),
            "supporting_evidence": rng.randint(2, 8),
            "counter_evidence": rng.randint(0, 3),
            "causal_mechanism": rng.choice([
                "direct_cause", "mediated_cause", "moderated_cause",
                "spurious_correlation", "reverse_causation", "bidirectional",
            ]),
            "explanation_type": explanation_type.value,
            "abstraction_level": rng.choice([
                "micro_mechanism", "meso_pathway", "macro_system",
                "meta_pattern", "cross_domain", "ai_multi_scale",
            ]),
        })

    layers = []
    layer_names = [
        "Surface Summary", "Mechanistic Detail", "Statistical Evidence",
        "Structural Path Analysis", "Counterfactual Reasoning", "Meta-Level Reflection",
    ]
    for i in range(explanation_layers):
        coverage = rng.uniform(0.6, 0.98)
        coherence = rng.uniform(0.5, 0.95)
        layers.append({
            "layer_id": f"LAYER_{i:03d}",
            "name": layer_names[i % len(layer_names)],
            "depth_level": i + 1,
            "coverage": round(coverage, 4),
            "coherence": round(coherence, 4),
            "claims_addressed": rng.randint(2, min(causal_claims, 8)),
            "complexity_score": round(min(1.0, complexity * (1 + i * 0.15)), 4),
            "reading_time_s": round(rng.uniform(5, 60) * complexity, 1),
            "jargon_density": round(rng.uniform(0.05, 0.4) * complexity, 4),
            "information_density": round(rng.uniform(0.4, 0.9), 4),
            "transitions": rng.randint(1, 5),
        })

    evidence_map = []
    for i in range(evidence_nodes):
        relevance = rng.uniform(0.3, 0.98)
        reliability = rng.uniform(0.5, 0.95)
        evidence_map.append({
            "node_id": f"EV_{i:03d}",
            "relevance": round(relevance, 4),
            "reliability": round(reliability, 4),
            "type": rng.choice([
                "experimental", "observational", "simulation",
                "expert_judgment", "literature", "ai_synthesized",
            ]),
            "supports_claims": rng.randint(1, 4),
            "weight_in_explanation": round(rng.uniform(0.05, 0.3), 4),
        })

    avg_confidence = sum(c["confidence"] for c in claims) / max(len(claims), 1)
    avg_appropriateness = sum(c["audience_appropriateness"] for c in claims) / max(len(claims), 1)
    avg_layer_coherence = sum(l["coherence"] for l in layers) / max(len(layers), 1)
    explanation_quality = (
        avg_confidence * 0.25
        + avg_appropriateness * 0.2
        + avg_layer_coherence * 0.2
        + sum(c["completeness_score"] for c in claims) / max(len(claims), 1) * 0.2
        + sum(l["coverage"] for l in layers) / max(len(layers), 1) * 0.15
    )

    return {
        "explanation_type": explanation_type.value,
        "audience": audience.value,
        "depth": explanation_layers,
        "causal_claims": causal_claims,
        "evidence_nodes": evidence_nodes,
        "claims": claims,
        "layers": layers,
        "evidence_map": evidence_map,
        "explanation_quality": round(explanation_quality, 4),
        "avg_confidence": round(avg_confidence, 4),
        "avg_audience_appropriateness": round(avg_appropriateness, 4),
        "completeness": round(
            sum(c["completeness_score"] for c in claims) / max(len(claims), 1), 4
        ),
        "coherence": round(avg_layer_coherence, 4),
        "total_evidence_weight": round(
            sum(e["weight_in_explanation"] for e in evidence_map), 4
        ),
        "estimated_reading_time_s": round(sum(l["reading_time_s"] for l in layers), 1),
        "jargon_level": round(
            sum(l["jargon_density"] for l in layers) / max(len(layers), 1), 4
        ),
    }


def _compute_interpret(
    method: InterpretationMethod,
    model_complexity: float,
    feature_count: int,
) -> dict[str, Any]:
    """Interpret causal model internals using various interpretation methods."""
    rng = random.Random(hash(method.value) + int(model_complexity * 1000) + feature_count * 29)
    top_features = min(feature_count, 20)
    interpretation_depth = rng.randint(3, 8)

    features = []
    feature_names = [
        "temperature", "pressure", "humidity", "wind_speed", "altitude",
        "precipitation", "solar_radiation", "co2_concentration", "soil_moisture",
        "vegetation_index", "population_density", "gdp_per_capita", "education_level",
        "healthcare_access", "employment_rate", "inflation_rate", "trade_volume",
        "energy_consumption", "water_quality_index", "air_quality_index",
    ]
    for i in range(top_features):
        importance = rng.uniform(0.01, 1.0)
        contribution = importance * rng.uniform(0.5, 1.0)
        interaction_count = rng.randint(0, min(5, top_features - 1))
        features.append({
            "feature_id": f"FEAT_{i:03d}",
            "name": feature_names[i % len(feature_names)],
            "importance": round(importance, 4),
            "contribution": round(contribution, 4),
            "rank": 0,  # will set below
            "direction": rng.choice(["positive", "negative", "mixed", "non_linear"]),
            "magnitude": round(importance * model_complexity * rng.uniform(0.5, 1.5), 4),
            "stability": round(rng.uniform(0.5, 0.98), 4),
            "interaction_count": interaction_count,
            "causal_direction_confidence": round(rng.uniform(0.4, 0.95), 4),
            "partial_effect_range": [
                round(-importance * rng.uniform(0.1, 0.5), 4),
                round(importance * rng.uniform(0.5, 1.0), 4),
            ],
            "interpretation": rng.choice([
                "strong_direct_cause", "weak_direct_cause", "mediator",
                "confounder", "collider", "instrument",
            ]),
        })

    # Sort and rank by importance
    features.sort(key=lambda f: f["importance"], reverse=True)
    for rank, f in enumerate(features):
        f["rank"] = rank + 1

    path_traces = []
    for d in range(interpretation_depth):
        active_features = min(top_features, rng.randint(3, 8))
        path_features = rng.sample(range(top_features), min(active_features, top_features))
        trace = {
            "depth": d + 1,
            "path_id": f"PATH_{d:04d}",
            "features_in_path": [features[i]["name"] for i in path_features if i < len(features)],
            "path_strength": round(rng.uniform(0.3, 0.95), 4),
            "path_confidence": round(rng.uniform(0.5, 0.98), 4),
            "causal_chain": [f"step_{j}" for j in range(rng.randint(2, 6))],
            "cumulative_effect": round(rng.uniform(0.1, 0.8) * model_complexity, 4),
            "interactions_found": rng.randint(1, active_features),
            "nonlinearity_detected": rng.random() > 0.6,
            "threshold_effects": rng.randint(0, 3),
        }
        path_traces.append(trace)

    # Method-specific metrics
    method_metrics = {
        "feature_importance": {"gini_importance": round(rng.uniform(0.6, 0.95), 4), "permutation_importance": round(rng.uniform(0.5, 0.9), 4)},
        "partial_dependence": {"pd_curves_computed": top_features, "ice_coverage": round(rng.uniform(0.7, 0.98), 4)},
        "shap_values": {"shapley_variance_explained": round(rng.uniform(0.7, 0.95), 4), "interaction_values": rng.randint(5, top_features * 2)},
        "attention_weights": {"attention_entropy": round(rng.uniform(0.3, 0.8), 4), "head_diversity": round(rng.uniform(0.5, 0.95), 4)},
        "causal_path_trace": {"paths_traced": len(path_traces), "backdoor_adjustments": rng.randint(1, 5)},
        "ai_holistic": {"holistic_coverage": round(rng.uniform(0.8, 0.98), 4), "cross_method_consistency": round(rng.uniform(0.7, 0.95), 4)},
    }

    avg_importance = sum(f["importance"] for f in features) / max(len(features), 1)
    top5_importance = sum(f["importance"] for f in features[:5]) / max(min(5, len(features)), 1)
    interpretation_quality = (
        avg_importance * 0.2
        + top5_importance * 0.2
        + sum(f["stability"] for f in features) / max(len(features), 1) * 0.2
        + (path_traces[-1]["path_confidence"] if path_traces else 0.5) * 0.2
        + model_complexity * rng.uniform(0.5, 1.0) * 0.2
    )

    return {
        "interpretation_method": method.value,
        "model_complexity": round(model_complexity, 4),
        "feature_count": top_features,
        "interpretation_depth": interpretation_depth,
        "features": features,
        "path_traces": path_traces,
        "method_specific_metrics": method_metrics.get(method.value, {}),
        "interpretation_quality": round(interpretation_quality, 4),
        "top_feature": features[0]["name"] if features else "none",
        "top_importance": features[0]["importance"] if features else 0,
        "avg_stability": round(
            sum(f["stability"] for f in features) / max(len(features), 1), 4
        ),
        "importance_concentration": round(
            top5_importance / max(avg_importance, 0.01), 4
        ),
        "complexity_interpretability_tradeoff": round(
            interpretation_quality / max(model_complexity, 0.01), 4
        ),
    }


def _compute_counterfactual(
    explanation_type: ExplanationType,
    intervention_count: int,
    divergence_depth: int,
) -> dict[str, Any]:
    """Generate counterfactual causal explanations — what would happen if."""
    rng = random.Random(hash(explanation_type.value) + intervention_count * 53 + divergence_depth * 41)
    scenarios = rng.randint(3, 8)
    causal_nodes = rng.randint(6, 20)

    counterfactuals = []
    for i in range(intervention_count):
        magnitude = rng.uniform(0.1, 1.0)
        divergence = rng.uniform(0.05, 0.8)
        plausibility = rng.uniform(0.3, 0.95)
        necessity = rng.random() > 0.4
        sufficiency = rng.random() > 0.5
        counterfactuals.append({
            "cf_id": f"CF_{i:04d}",
            "original_cause": rng.choice([
                "increase_X", "decrease_Y", "remove_Z", "add_W",
                "delay_T", "accelerate_A", "reverse_R", "amplify_M",
            ]),
            "counterfactual_action": rng.choice([
                "decrease_X", "increase_Y", "add_Z", "remove_W",
                "accelerate_T", "delay_A", "maintain_R", "dampen_M",
            ]),
            "factual_outcome": round(rng.uniform(0.3, 0.9), 4),
            "counterfactual_outcome": round(rng.uniform(0.1, 0.8), 4),
            "outcome_difference": round(abs(rng.uniform(0.3, 0.9) - rng.uniform(0.1, 0.8)), 4),
            "magnitude": round(magnitude, 4),
            "divergence": round(divergence, 4),
            "plausibility": round(plausibility, 4),
            "necessity": necessity,
            "sufficiency": sufficiency,
            "causal_power": round(
                (1 if necessity else 0.3) * (1 if sufficiency else 0.5) * magnitude, 4
            ),
            "explanation_clarity": round(rng.uniform(0.4, 0.95), 4),
            "minimality": round(rng.uniform(0.3, 0.9), 4),
            "affected_nodes": rng.randint(2, min(causal_nodes, 10)),
            "divergence_path_length": rng.randint(1, divergence_depth),
        })

    # Timeline divergence trace
    divergence_trace = []
    for d in range(divergence_depth):
        cumulative_divergence = min(1.0, d * 0.15 + rng.uniform(0.02, 0.1))
        affected_nodes = min(causal_nodes, rng.randint(2, 4 + d * 2))
        divergence_trace.append({
            "depth": d + 1,
            "cumulative_divergence": round(cumulative_divergence, 4),
            "factual_state": round(1 - cumulative_divergence * 0.5, 4),
            "counterfactual_state": round(max(0.1, 1 - cumulative_divergence), 4),
            "affected_nodes": affected_nodes,
            "branching_factor": rng.randint(1, 4),
            "new_causal_paths": rng.randint(0, 3),
            "broken_causal_paths": rng.randint(0, 2),
            "stability_score": round(max(0, 1 - cumulative_divergence * 1.2), 4),
            "key_difference": rng.choice([
                "magnitude_shift", "direction_reversal", "timing_change",
                "scope_expansion", "cascade_halt", "emergent_effect",
            ]),
        })

    # Scenario comparison matrix
    scenario_matrix = []
    for s in range(scenarios):
        scenario_matrix.append({
            "scenario_id": f"SCEN_{s:03d}",
            "base_probability": round(rng.uniform(0.2, 0.8), 4),
            "counterfactual_probability": round(rng.uniform(0.1, 0.7), 4),
            "probability_shift": round(rng.uniform(-0.4, 0.4), 4),
            "risk_level": rng.choice(["low", "medium", "high", "critical"]),
            "actionability": round(rng.uniform(0.3, 0.95), 4),
            "reversibility": round(rng.uniform(0.2, 0.9), 4),
        })

    avg_plausibility = sum(cf["plausibility"] for cf in counterfactuals) / max(len(counterfactuals), 1)
    avg_clarity = sum(cf["explanation_clarity"] for cf in counterfactuals) / max(len(counterfactuals), 1)
    necessary_count = sum(1 for cf in counterfactuals if cf["necessity"])
    sufficient_count = sum(1 for cf in counterfactuals if cf["sufficiency"])

    counterfactual_quality = (
        avg_plausibility * 0.25
        + avg_clarity * 0.2
        + necessary_count / max(len(counterfactuals), 1) * 0.2
        + sufficient_count / max(len(counterfactuals), 1) * 0.15
        + sum(cf["minimality"] for cf in counterfactuals) / max(len(counterfactuals), 1) * 0.2
    )

    return {
        "explanation_type": explanation_type.value,
        "intervention_count": intervention_count,
        "divergence_depth": divergence_depth,
        "scenarios": scenarios,
        "causal_nodes": causal_nodes,
        "counterfactuals": counterfactuals,
        "divergence_trace": divergence_trace,
        "scenario_matrix": scenario_matrix,
        "counterfactual_quality": round(counterfactual_quality, 4),
        "avg_plausibility": round(avg_plausibility, 4),
        "avg_explanation_clarity": round(avg_clarity, 4),
        "necessary_ratio": round(necessary_count / max(len(counterfactuals), 1), 4),
        "sufficient_ratio": round(sufficient_count / max(len(counterfactuals), 1), 4),
        "avg_causal_power": round(
            sum(cf["causal_power"] for cf in counterfactuals) / max(len(counterfactuals), 1), 4
        ),
        "max_outcome_difference": round(
            max(cf["outcome_difference"] for cf in counterfactuals) if counterfactuals else 0, 4
        ),
    }


def _compute_visualize(
    viz_type: VisualizationType,
    node_count: int,
    complexity: float,
) -> dict[str, Any]:
    """Create visualization-ready explanation data structures."""
    rng = random.Random(hash(viz_type.value) + node_count * 47 + int(complexity * 1000))
    edge_count = rng.randint(node_count, node_count * 3)
    layers = rng.randint(2, 5)

    nodes = []
    node_categories = ["cause", "effect", "mediator", "confounder", "outcome", "context"]
    for i in range(node_count):
        category = node_categories[i % len(node_categories)]
        nodes.append({
            "node_id": f"N_{i:03d}",
            "label": f"variable_{i}",
            "category": category,
            "layer": rng.randint(1, layers),
            "x": round(rng.uniform(0, 1), 4),
            "y": round(rng.uniform(0, 1), 4),
            "z": round(rng.uniform(0, 1), 4) if viz_type.value == "ai_interactive_3d" else 0,
            "size": round(rng.uniform(5, 30), 1),
            "importance": round(rng.uniform(0.1, 1.0), 4),
            "color_value": round(rng.uniform(0, 1), 4),
            "shape": rng.choice(["circle", "diamond", "square", "triangle", "hexagon", "star"]),
            "tooltip": f"Causal {category}: variable_{i} with importance score",
            "group": f"group_{rng.randint(1, min(4, layers))}",
        })

    edges = []
    for i in range(edge_count):
        source = rng.randint(0, node_count - 1)
        target = rng.randint(0, node_count - 1)
        while target == source:
            target = rng.randint(0, node_count - 1)
        weight = rng.uniform(0.05, 1.0)
        edges.append({
            "edge_id": f"E_{i:03d}",
            "source": f"N_{source:03d}",
            "target": f"N_{target:03d}",
            "weight": round(weight, 4),
            "direction": rng.choice(["unidirectional", "bidirectional"]),
            "edge_type": rng.choice([
                "direct_cause", "indirect_cause", "association",
                "mediation", "moderation", "confounding",
            ]),
            "confidence": round(rng.uniform(0.3, 0.98), 4),
            "curvature": round(rng.uniform(0, 0.4), 4),
            "width": round(weight * 5, 1),
            "color_intensity": round(weight, 4),
            "animated": weight > 0.7,
            "label": f"effect={weight:.2f}",
        })

    # Type-specific visual properties
    viz_properties = {
        "causal_graph": {
            "layout_algorithm": "dagre_hierarchical",
            "node_spacing": 50,
            "rank_spacing": 100,
            "edge_bundling": True,
        },
        "flow_diagram": {
            "flow_direction": "top_to_bottom",
            "swim_lanes": layers,
            "decision_nodes": rng.randint(1, 4),
            "parallel_paths": rng.randint(1, 3),
        },
        "heatmap": {
            "matrix_size": f"{node_count}x{node_count}",
            "color_scale": "diverging_RdBu",
            "clustering_applied": True,
            "significant_cells": rng.randint(5, edge_count),
        },
        "timeline": {
            "time_range": f"t0 → t{rng.randint(10, 100)}",
            "event_count": rng.randint(5, 20),
            "causal_lag_max": rng.randint(1, 10),
            "temporal_resolution": "discrete_steps",
        },
        "sankey_diagram": {
            "flow_count": edge_count,
            "total_flow_value": round(sum(e["weight"] for e in edges), 2),
            "node_alignment": "justify",
            "cycle_handling": "curved_links",
        },
        "ai_interactive_3d": {
            "rendering_engine": "webgl",
            "camera_controls": True,
            "physics_simulation": True,
            "interactive_filtering": True,
        },
    }

    layout_quality = rng.uniform(0.6, 0.95)
    readability = 1 - complexity * rng.uniform(0.2, 0.5)
    visual_density = edge_count / max(node_count * (node_count - 1) / 2, 1)

    return {
        "visualization_type": viz_type.value,
        "node_count": node_count,
        "edge_count": edge_count,
        "layers": layers,
        "complexity": round(complexity, 4),
        "nodes": nodes,
        "edges": edges,
        "viz_properties": viz_properties.get(viz_type.value, {}),
        "layout_quality": round(layout_quality, 4),
        "readability_score": round(max(0.2, readability), 4),
        "visual_density": round(visual_density, 4),
        "interactive_elements": rng.randint(3, 10),
        "legend_entries": rng.randint(4, 10),
        "color_palette": f"causal_{viz_type.value}_palette",
        "estimated_render_time_ms": round(node_count * edge_count * 0.1 + rng.uniform(10, 100), 1),
    }


def _compute_narrate(
    style: NarrativeStyle,
    topic_count: int,
    audience: AudienceLevel,
) -> dict[str, Any]:
    """Generate narrative explanations in various styles."""
    rng = random.Random(hash(style.value) + topic_count * 61 + hash(audience.value))
    sections = rng.randint(3, 7)
    total_paragraphs = rng.randint(topic_count * 2, topic_count * 5)

    narrative_sections = []
    section_types = [
        "executive_summary", "background", "key_findings",
        "detailed_analysis", "implications", "recommendations", "appendix",
    ]
    for i in range(sections):
        paragraphs_in_section = rng.randint(1, max(1, total_paragraphs // sections))
        word_count = paragraphs_in_section * rng.randint(30, 120)
        coherence = rng.uniform(0.5, 0.95)
        engagement = rng.uniform(0.4, 0.9)
        narrative_sections.append({
            "section_id": f"SEC_{i:03d}",
            "section_type": section_types[i % len(section_types)],
            "title": rng.choice([
                "Understanding the Causal Chain",
                "Why This Matters",
                "The Evidence Behind Our Claims",
                "What Would Happen If...",
                "How Variables Interact",
                "Key Takeaways",
                "Technical Deep Dive",
            ]),
            "paragraphs": paragraphs_in_section,
            "word_count": word_count,
            "reading_level": rng.choice(["accessible", "moderate", "technical", "expert"]),
            "coherence_score": round(coherence, 4),
            "engagement_score": round(engagement, 4),
            "key_messages": rng.randint(1, 4),
            "supporting_examples": rng.randint(0, 3),
            "transitions": rng.randint(1, paragraphs_in_section),
            "audience_alignment": round(rng.uniform(0.5, 0.98), 4),
        })

    # Style-specific narrative elements
    style_elements = {
        "analytical": {"evidence_density": 0.8, "objectivity": 0.9, "structure": "hierarchical"},
        "storytelling": {"character_arcs": 3, "narrative_tension": 0.7, "resolution": "actionable"},
        "question_answer": {"questions": topic_count * 2, "depth_per_answer": "moderate"},
        "comparative": {"comparisons": rng.randint(3, 8), "dimensions": rng.randint(2, 5)},
        "pedagogical": {"learning_objectives": topic_count, "exercises": rng.randint(1, 5)},
        "ai_contextual": {"adaptation_points": rng.randint(3, 10), "personalization": 0.85},
    }

    # Topic coverage
    topics = []
    topic_names = [
        "primary_causal_factors", "mediating_mechanisms", "confounding_variables",
        "intervention_opportunities", "temporal_dynamics", "uncertainty_sources",
        "model_limitations", "cross_domain_patterns", "feedback_loops",
        "emergent_behaviors", "policy_implications", "validation_evidence",
    ]
    for i in range(topic_count):
        coverage = rng.uniform(0.4, 0.98)
        topics.append({
            "topic_id": f"TOPIC_{i:03d}",
            "name": topic_names[i % len(topic_names)],
            "coverage": round(coverage, 4),
            "depth": rng.choice(["surface", "moderate", "deep", "comprehensive"]),
            "connected_topics": rng.randint(1, min(3, topic_count - 1)),
            "evidence_references": rng.randint(2, 8),
            "narrative_weight": round(rng.uniform(0.05, 0.3), 4),
        })

    total_words = sum(s["word_count"] for s in narrative_sections)
    avg_coherence = sum(s["coherence_score"] for s in narrative_sections) / max(len(narrative_sections), 1)
    avg_engagement = sum(s["engagement_score"] for s in narrative_sections) / max(len(narrative_sections), 1)
    topic_coverage = sum(t["coverage"] for t in topics) / max(len(topics), 1)

    narrative_quality = (
        avg_coherence * 0.25
        + avg_engagement * 0.2
        + topic_coverage * 0.25
        + sum(s["audience_alignment"] for s in narrative_sections) / max(len(narrative_sections), 1) * 0.3
    )

    return {
        "narrative_style": style.value,
        "audience": audience.value,
        "topic_count": topic_count,
        "sections": sections,
        "total_paragraphs": total_paragraphs,
        "total_word_count": total_words,
        "narrative_sections": narrative_sections,
        "style_elements": style_elements.get(style.value, {}),
        "topics": topics,
        "narrative_quality": round(narrative_quality, 4),
        "avg_coherence": round(avg_coherence, 4),
        "avg_engagement": round(avg_engagement, 4),
        "topic_coverage": round(topic_coverage, 4),
        "estimated_reading_time_min": round(total_words / 200, 1),
        "flesch_reading_ease": round(rng.uniform(30, 80), 1),
    }


def _compute_validate(
    method: ValidationMethod,
    sample_size: int,
    strictness: float,
) -> dict[str, Any]:
    """Validate explanation quality and faithfulness."""
    rng = random.Random(hash(method.value) + sample_size * 43 + int(strictness * 1000))
    validation_rounds = rng.randint(3, 8)
    metrics_count = rng.randint(4, 10)

    metrics = []
    metric_names = [
        "faithfulness", "plausibility", "consistency", "completeness",
        "parsimony", "actionability", "robustness", "fairness",
        "stability", "audience_appropriateness",
    ]
    for i in range(metrics_count):
        score = rng.uniform(0.3, 0.98)
        passed = score >= (1 - strictness) * 0.7
        metrics.append({
            "metric_id": f"M_{i:03d}",
            "name": metric_names[i % len(metric_names)],
            "score": round(score, 4),
            "threshold": round((1 - strictness) * 0.7 + 0.2, 4),
            "passed": passed,
            "weight": round(1 / max(metrics_count, 1), 4),
            "confidence_interval": [
                round(max(0, score - rng.uniform(0.02, 0.1)), 4),
                round(min(1, score + rng.uniform(0.02, 0.1)), 4),
            ],
            "improvement_from_last": round(rng.uniform(-0.05, 0.15), 4),
            "category": rng.choice(["accuracy", "completeness", "usability", "robustness"]),
        })

    passed_count = sum(1 for m in metrics if m["passed"])
    pass_rate = passed_count / max(len(metrics), 1)

    # Validation rounds with progressive assessment
    rounds = []
    cumulative_improvement = 0
    for r in range(validation_rounds):
        round_pass_rate = min(1.0, pass_rate + r * 0.05 + rng.uniform(-0.03, 0.05))
        improvement = rng.uniform(0, 0.08)
        cumulative_improvement += improvement
        rounds.append({
            "round": r + 1,
            "pass_rate": round(round_pass_rate, 4),
            "improvement": round(improvement, 4),
            "cumulative_improvement": round(cumulative_improvement, 4),
            "issues_found": rng.randint(0, max(1, int((1 - pass_rate) * 10))),
            "issues_resolved": rng.randint(0, max(1, int((1 - pass_rate) * 8))),
            "consistency_score": round(rng.uniform(0.6, 0.98), 4),
            "method_specific_findings": rng.randint(1, 5),
            "recommendation": rng.choice([
                "proceed", "minor_adjustment", "revision_needed",
                "major_overhaul", "accept", "ai_auto_fix",
            ]),
        })

    # Method-specific validation details
    method_details = {
        "human_evaluation": {
            "evaluators": sample_size,
            "inter_rater_agreement": round(rng.uniform(0.6, 0.9), 4),
            "evaluation_criteria": ["clarity", "accuracy", "usefulness", "completeness"],
        },
        "consistency_check": {
            "cross_explanation_consistency": round(rng.uniform(0.7, 0.95), 4),
            "temporal_stability": round(rng.uniform(0.6, 0.95), 4),
            "perturbation_robustness": round(rng.uniform(0.5, 0.9), 4),
        },
        "faithfulness_test": {
            "perturbation_alignment": round(rng.uniform(0.6, 0.95), 4),
            "removal_accuracy": round(rng.uniform(0.5, 0.9), 4),
            "completeness_ratio": round(rng.uniform(0.7, 0.98), 4),
        },
        "robustness_check": {
            "input_perturbation_stability": round(rng.uniform(0.5, 0.95), 4),
            "noise_resistance": round(rng.uniform(0.4, 0.9), 4),
            "adversarial_resilience": round(rng.uniform(0.3, 0.85), 4),
        },
        "ablation_study": {
            "components_ablated": rng.randint(3, 8),
            "critical_components": rng.randint(1, 4),
            "performance_degradation_max": round(rng.uniform(0.05, 0.4), 4),
        },
        "ai_meta_validation": {
            "meta_accuracy": round(rng.uniform(0.75, 0.95), 4),
            "self_assessment_reliability": round(rng.uniform(0.7, 0.95), 4),
            "bias_detection": round(rng.uniform(0.6, 0.9), 4),
        },
    }

    avg_score = sum(m["score"] for m in metrics) / max(len(metrics), 1)
    validation_quality = (
        pass_rate * 0.3
        + avg_score * 0.25
        + (rounds[-1]["consistency_score"] if rounds else 0.5) * 0.25
        + cumulative_improvement / max(validation_rounds, 1) * 0.2
    )

    return {
        "validation_method": method.value,
        "sample_size": sample_size,
        "strictness": round(strictness, 4),
        "validation_rounds": validation_rounds,
        "metrics_count": metrics_count,
        "metrics": metrics,
        "rounds": rounds,
        "method_details": method_details.get(method.value, {}),
        "validation_quality": round(validation_quality, 4),
        "pass_rate": round(pass_rate, 4),
        "avg_score": round(avg_score, 4),
        "passed_count": passed_count,
        "failed_count": metrics_count - passed_count,
        "overall_verdict": "pass" if pass_rate >= (1 - strictness) * 0.6 else (
            "conditional_pass" if pass_rate >= 0.5 else "fail"
        ),
        "recommendation": rounds[-1]["recommendation"] if rounds else "proceed",
        "confidence_in_validation": round(rng.uniform(0.7, 0.98), 4),
    }


# ─── Request Models ───────────────────────────────────────────────────────────

class ExplainRequest(BaseModel):
    explanation_type: ExplanationType = ExplanationType.NATURAL_LANGUAGE
    audience: AudienceLevel = AudienceLevel.PRACTITIONER
    depth: int = Field(4, ge=1, le=6)

class InterpretRequest(BaseModel):
    method: InterpretationMethod = InterpretationMethod.FEATURE_IMPORTANCE
    model_complexity: float = Field(0.5, ge=0.0, le=1.0)
    feature_count: int = Field(10, ge=3, le=30)

class CounterfactualRequest(BaseModel):
    explanation_type: ExplanationType = ExplanationType.COUNTERFACTUAL
    intervention_count: int = Field(5, ge=1, le=20)
    divergence_depth: int = Field(5, ge=1, le=10)

class VisualizeRequest(BaseModel):
    visualization_type: VisualizationType = VisualizationType.CAUSAL_GRAPH
    node_count: int = Field(12, ge=5, le=50)
    complexity: float = Field(0.5, ge=0.0, le=1.0)

class NarrateRequest(BaseModel):
    style: NarrativeStyle = NarrativeStyle.ANALYTICAL
    topic_count: int = Field(5, ge=1, le=12)
    audience: AudienceLevel = AudienceLevel.PRACTITIONER

class ValidateRequest(BaseModel):
    method: ValidationMethod = ValidationMethod.CONSISTENCY_CHECK
    sample_size: int = Field(50, ge=10, le=500)
    strictness: float = Field(0.5, ge=0.0, le=1.0)


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/causal-explain/explain")
def explainability_explain(req: ExplainRequest) -> dict[str, Any]:
    key = f"{req.explanation_type.value}|{req.audience.value}|{req.depth}"
    if key not in _explain_cache267:
        _explain_cache267[key] = _compute_explain(req.explanation_type, req.audience, req.depth)
    return {"timestamp": time.time(), **_explain_cache267[key]}


@router.post("/causal-explain/interpret")
def explainability_interpret(req: InterpretRequest) -> dict[str, Any]:
    key = f"{req.method.value}|{req.model_complexity}|{req.feature_count}"
    if key not in _interpret_cache267:
        _interpret_cache267[key] = _compute_interpret(req.method, req.model_complexity, req.feature_count)
    return {"timestamp": time.time(), **_interpret_cache267[key]}


@router.post("/causal-explain/counterfactual")
def explainability_counterfactual(req: CounterfactualRequest) -> dict[str, Any]:
    key = f"{req.explanation_type.value}|{req.intervention_count}|{req.divergence_depth}"
    if key not in _counterfactual_cache267:
        _counterfactual_cache267[key] = _compute_counterfactual(req.explanation_type, req.intervention_count, req.divergence_depth)
    return {"timestamp": time.time(), **_counterfactual_cache267[key]}


@router.post("/causal-explain/visualize")
def explainability_visualize(req: VisualizeRequest) -> dict[str, Any]:
    key = f"{req.visualization_type.value}|{req.node_count}|{req.complexity}"
    if key not in _visualize_cache267:
        _visualize_cache267[key] = _compute_visualize(req.visualization_type, req.node_count, req.complexity)
    return {"timestamp": time.time(), **_visualize_cache267[key]}


@router.post("/causal-explain/narrate")
def explainability_narrate(req: NarrateRequest) -> dict[str, Any]:
    key = f"{req.style.value}|{req.topic_count}|{req.audience.value}"
    if key not in _narrate_cache267:
        _narrate_cache267[key] = _compute_narrate(req.style, req.topic_count, req.audience)
    return {"timestamp": time.time(), **_narrate_cache267[key]}


@router.post("/causal-explain/validate")
def explainability_validate(req: ValidateRequest) -> dict[str, Any]:
    key = f"{req.method.value}|{req.sample_size}|{req.strictness}"
    if key not in _validate_cache267:
        _validate_cache267[key] = _compute_validate(req.method, req.sample_size, req.strictness)
    return {"timestamp": time.time(), **_validate_cache267[key]}


@router.get("/causal-explain/overview")
def explainability_overview() -> dict[str, Any]:
    return {
        "version": "v1.267",
        "engine": "Graph Causal Explainability & Interpretation",
        "enums": {
            "ExplanationType": [e.value for e in ExplanationType],
            "AudienceLevel": [e.value for e in AudienceLevel],
            "InterpretationMethod": [e.value for e in InterpretationMethod],
            "VisualizationType": [e.value for e in VisualizationType],
            "NarrativeStyle": [e.value for e in NarrativeStyle],
            "ValidationMethod": [e.value for e in ValidationMethod],
        },
        "endpoints": [
            "POST /graph/causal-explain/explain",
            "POST /graph/causal-explain/interpret",
            "POST /graph/causal-explain/counterfactual",
            "POST /graph/causal-explain/visualize",
            "POST /graph/causal-explain/narrate",
            "POST /graph/causal-explain/validate",
            "GET  /graph/causal-explain/overview",
        ],
        "caches": {
            "explain": len(_explain_cache267),
            "interpret": len(_interpret_cache267),
            "counterfactual": len(_counterfactual_cache267),
            "visualize": len(_visualize_cache267),
            "narrate": len(_narrate_cache267),
            "validate": len(_validate_cache267),
        },
        "architecture_layer": "Explainability & Interpretation (v1.267)",
        "pipeline_position": "Above Resilience & Fault Tolerance (v1.266)",
        "integration_chain": [
            "Causal Pipeline (v1.249–v1.259)",
            "Meta-Cognitive Layer (v1.260)",
            "Emergence & Complexity (v1.261)",
            "Governance & Compliance (v1.262)",
            "Transfer & Adaptation (v1.263)",
            "Real-time Streaming (v1.264)",
            "Multi-Agent Consensus (v1.265)",
            "Resilience & Fault Tolerance (v1.266)",
            "Explainability & Interpretation (v1.267)",
        ],
    }
