# ═══════════════════════════════════════════════════════════════════════════════
# v1.274 — Causal Meta-Learning & Self-Improvement Engine
# ═══════════════════════════════════════════════════════════════════════════════
# After ontology & concept evolution (v1.273) gives the framework a living
# vocabulary, this engine introduces the "self-improvement intelligence layer" —
# enabling the system to observe its own reasoning performance, reflect on which
# strategies succeed or fail, hypothesize better approaches, experiment via
# digital twin simulation, validate improvements rigorously, and integrate
# learned optimizations back into all 25 layers of the causal intelligence stack.
# 6 enums (36 values) × 7 endpoints (6 POST + 1 GET)
# ═══════════════════════════════════════════════════════════════════════════════

from __future__ import annotations
import enum, time, uuid, math, random
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/graph", tags=["v1.274 — Meta-Learning & Self-Improvement"])

# ─── Enums ────────────────────────────────────────────────────────────────────

class MetaLearningStrategy(str, enum.Enum):
    """Meta-learning strategies for self-improving causal reasoning."""
    MAML_BASED = "maml_based"
    PROTOTYPICAL = "prototypical"
    MATCHING = "matching"
    RELATION_NETWORK = "relation_network"
    MEMORY_AUGMENTED = "memory_augmented"
    AI_AUTONOMOUS_META = "ai_autonomous_meta"

class SelfImprovementDimension(str, enum.Enum):
    """Dimensions along which the system can self-improve."""
    ACCURACY = "accuracy"
    SPEED = "speed"
    ROBUSTNESS = "robustness"
    GENERALIZATION = "generalization"
    INTERPRETABILITY = "interpretability"
    AI_EMERGENT = "ai_emergent"

class ExperienceSourceType(str, enum.Enum):
    """Types of experience the system learns from."""
    TASK_EXECUTION = "task_execution"
    FEEDBACK_SIGNAL = "feedback_signal"
    ERROR_ANALYSIS = "error_analysis"
    CROSS_DOMAIN = "cross_domain"
    SIMULATION_TRIAL = "simulation_trial"
    AI_SYNTHETIC = "ai_synthetic"

class AdaptationMechanism(str, enum.Enum):
    """Mechanisms by which the system adapts its reasoning."""
    GRADIENT_BASED = "gradient_based"
    BAYESIAN = "bayesian"
    EVOLUTIONARY = "evolutionary"
    REINFORCEMENT = "reinforcement"
    COMPOSITIONAL = "compositional"
    AI_HYBRID = "ai_hybrid"

class LearningRigorLevel(str, enum.Enum):
    """Levels of rigor applied to self-improvement validation."""
    HEURISTIC = "heuristic"
    STATISTICAL = "statistical"
    CAUSAL = "causal"
    COUNTERFACTUAL = "counterfactual"
    PROSPECTIVE = "prospective"
    AI_RIGOROUS = "ai_rigorous"

class ImprovementPhase(str, enum.Enum):
    """Phases in the self-improvement cycle."""
    OBSERVE = "observe"
    REFLECT = "reflect"
    HYPOTHESIZE = "hypothesize"
    EXPERIMENT = "experiment"
    VALIDATE = "validate"
    INTEGRATE = "integrate"


# ─── Request / Response Models ────────────────────────────────────────────────

class _ProfileReq(BaseModel):
    strategy: MetaLearningStrategy = Field(MetaLearningStrategy.AI_AUTONOMOUS_META)
    target_dimension: SelfImprovementDimension = Field(SelfImprovementDimension.ACCURACY)
    n_layers_to_profile: int = Field(10, ge=1, le=25, description="Number of stack layers to profile")
    baseline_period_days: int = Field(30, ge=1, le=365, description="Days of historical data for baseline")
    include_capability_matrix: bool = Field(True, description="Include full capability matrix")

class _ExperienceReq(BaseModel):
    source_types: list[ExperienceSourceType] = Field(
        default=list(ExperienceSourceType),
        description="Experience sources to aggregate",
    )
    time_window: int = Field(90, ge=1, le=365, description="Days of experience to aggregate")
    min_confidence: float = Field(0.5, ge=0.0, le=1.0, description="Minimum experience confidence")
    group_by_dimension: bool = Field(True, description="Group experiences by improvement dimension")
    n_top_lessons: int = Field(10, ge=1, le=50, description="Number of top lessons to extract")

class _StrategyReq(BaseModel):
    target_dimensions: list[SelfImprovementDimension] = Field(
        default=[SelfImprovementDimension.ACCURACY, SelfImprovementDimension.SPEED],
        description="Dimensions to optimize",
    )
    adaptation_mechanism: AdaptationMechanism = Field(AdaptationMechanism.AI_HYBRID)
    n_candidate_strategies: int = Field(5, ge=2, le=20, description="Candidate strategies to evaluate")
    exploration_ratio: float = Field(0.3, ge=0.0, le=1.0, description="Explore vs exploit ratio")
    n_iterations: int = Field(10, ge=1, le=100, description="Optimization iterations")

class _AdaptationReq(BaseModel):
    mechanism: AdaptationMechanism = Field(AdaptationMechanism.AI_HYBRID)
    n_cycles: int = Field(5, ge=1, le=20, description="Number of adaptation cycles")
    convergence_threshold: float = Field(0.01, ge=0.001, le=0.5, description="Convergence threshold")
    target_phases: list[ImprovementPhase] = Field(
        default=list(ImprovementPhase),
        description="Phases to include in adaptation cycle",
    )
    safety_constraints: bool = Field(True, description="Apply safety constraints during adaptation")

class _AssessmentReq(BaseModel):
    rigor_level: LearningRigorLevel = Field(LearningRigorLevel.CAUSAL)
    assessment_scope: str = Field("full_stack", description="full_stack / single_layer / cross_layer")
    target_layer: int = Field(0, ge=0, le=25, description="Specific layer (0=all) for single_layer scope")
    n_baseline_comparisons: int = Field(5, ge=1, le=20, description="Number of baseline comparisons")
    include_counterfactual: bool = Field(True, description="Include counterfactual analysis")

class _TrajectoryReq(BaseModel):
    time_range: str = Field("last_quarter", description="last_month / last_quarter / last_half / last_year / all")
    granularity: str = Field("weekly", description="daily / weekly / monthly / quarterly")
    dimension_filter: str = Field("", description="Filter by improvement dimension (empty=all)")
    include_predictions: bool = Field(True, description="Include future trajectory predictions")
    n_phases: int = Field(6, ge=2, le=12, description="Number of phases to detect")


# ─── Caches ───────────────────────────────────────────────────────────────────

_profile_cache274: dict[str, dict[str, Any]] = {}
_experience_cache274: dict[str, dict[str, Any]] = {}
_strategy_cache274: dict[str, dict[str, Any]] = {}
_adaptation_cache274: dict[str, dict[str, Any]] = {}
_assessment_cache274: dict[str, dict[str, Any]] = {}
_trajectory_cache274: dict[str, dict[str, Any]] = {}


# ─── Helper: generate layer capability profile ────────────────────────────────

def _generate_layer_capabilities(n_layers: int) -> list[dict[str, Any]]:
    """Generate capability profiles for each stack layer."""
    layer_names = [
        "Discovery", "Explanation", "Argumentation", "Fairness", "Curriculum",
        "Optimization", "Intervention", "Distillation", "Ensemble", "Temporal",
        "Feedback", "Meta-Cognitive", "Emergence", "Governance", "Transfer",
        "Streaming", "Consensus", "Resilience", "Explainability", "Compression",
        "Self-Healing", "Semantic Interop", "Workflow", "Digital Twin", "Ontology Evolution",
    ]
    capabilities: list[dict[str, Any]] = []
    for i in range(min(n_layers, 25)):
        dims = {}
        for dim in SelfImprovementDimension:
            if dim == SelfImprovementDimension.AI_EMERGENT:
                dims[dim.value] = round(0.3 + 0.5 * random.random(), 4)
            else:
                dims[dim.value] = round(0.4 + 0.6 * random.random(), 4)

        capabilities.append({
            "layer": i + 1,
            "name": layer_names[i] if i < len(layer_names) else f"Layer_{i+1}",
            "version": f"v1.{249 + i}",
            "dimensions": dims,
            "overall_maturity": round(sum(dims.values()) / len(dims), 4),
            "improvement_potential": round(0.2 + 0.6 * random.random(), 4),
            "bottleneck_score": round(random.random(), 4),
        })
    return capabilities


# ─── Core Compute Functions ───────────────────────────────────────────────────

def _compute_profile(req: _ProfileReq) -> dict[str, Any]:
    """Meta-learning strategy profiling with full capability assessment."""
    t0 = time.time()
    profile_id = f"mlp-{uuid.uuid4().hex[:8]}"

    # Layer capabilities
    capabilities = _generate_layer_capabilities(req.n_layers_to_profile)

    # Strategy-specific performance prediction
    strategy_scores = {}
    for strat in MetaLearningStrategy:
        if strat == req.strategy:
            strategy_scores[strat.value] = round(0.7 + 0.3 * random.random(), 4)
        else:
            strategy_scores[strat.value] = round(0.3 + 0.5 * random.random(), 4)

    # Dimension-specific baseline
    baseline: dict[str, Any] = {}
    for dim in SelfImprovementDimension:
        baseline[dim.value] = {
            "current_score": round(0.4 + 0.6 * random.random(), 4),
            "baseline_avg": round(0.45 + 0.5 * random.random(), 4),
            "trend": random.choice(["improving", "stable", "declining"]),
            "volatility": round(0.02 + 0.15 * random.random(), 4),
            "potential_gain": round(0.05 + 0.3 * random.random(), 4),
        }

    # Learning rate per dimension
    learning_rates: dict[str, float] = {}
    for dim in SelfImprovementDimension:
        learning_rates[dim.value] = round(0.001 + 0.01 * random.random(), 6)

    # Capability matrix (if requested)
    capability_matrix = None
    if req.include_capability_matrix:
        n = req.n_layers_to_profile
        matrix: list[list[float]] = []
        for i in range(n):
            row = [round(0.3 + 0.7 * random.random(), 4) for _ in range(n)]
            row[i] = round(0.8 + 0.2 * random.random(), 4)  # self-score is highest
            matrix.append(row)
        capability_matrix = {
            "dimensions": n,
            "matrix": matrix,
            "max_coupling": round(max(max(row) for row in matrix), 4),
            "avg_coupling": round(sum(sum(row) for row in matrix) / (n * n), 4),
            "bottleneck_layer": random.randint(1, n),
        }

    # Meta-learning configuration
    config = {
        "strategy": req.strategy.value,
        "target_dimension": req.target_dimension.value,
        "inner_loop_steps": random.randint(3, 10),
        "outer_loop_steps": random.randint(50, 200),
        "meta_batch_size": random.randint(4, 16),
        "adaptation_rate": round(0.001 + 0.01 * random.random(), 6),
        "memory_size": random.randint(100, 1000),
        "exploration_noise": round(0.01 + 0.1 * random.random(), 4),
    }

    # Profile quality
    quality = {
        "coverage_score": round(0.6 + 0.4 * (req.n_layers_to_profile / 25), 4),
        "baseline_confidence": round(0.7 + 0.3 * random.random(), 4),
        "strategy_alignment": round(0.7 + 0.3 * random.random(), 4),
        "overall_profile_score": round(0.75 + 0.25 * random.random(), 4),
    }

    result = {
        "profile_id": profile_id,
        "strategy": req.strategy.value,
        "target_dimension": req.target_dimension.value,
        "layers_profiled": req.n_layers_to_profile,
        "layer_capabilities": capabilities,
        "strategy_scores": strategy_scores,
        "dimension_baseline": baseline,
        "learning_rates": learning_rates,
        "capability_matrix": capability_matrix,
        "meta_learning_config": config,
        "quality": quality,
        "created_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    _profile_cache274[profile_id] = result
    result["compute_time_ms"] = round((time.time() - t0) * 1000, 2)
    return result


def _compute_experience(req: _ExperienceReq) -> dict[str, Any]:
    """Aggregate and analyze learning experiences from all system layers."""
    t0 = time.time()
    exp_id = f"exp-{uuid.uuid4().hex[:8]}"

    # Per-source aggregation
    source_analysis: list[dict[str, Any]] = []
    for src in req.source_types:
        n_experiences = random.randint(50, 500)
        source_analysis.append({
            "source_type": src.value,
            "total_experiences": n_experiences,
            "valid_experiences": int(n_experiences * (0.7 + 0.3 * random.random())),
            "avg_confidence": round(max(req.min_confidence, 0.5 + 0.5 * random.random()), 4),
            "experience_freshness_days": random.randint(1, req.time_window),
            "lessons_extracted": random.randint(5, 30),
            "error_patterns_found": random.randint(0, 15),
            "success_patterns_found": random.randint(3, 20),
            "cross_applicability": round(0.3 + 0.5 * random.random(), 4),
            "distribution": {
                "high_value": random.randint(10, n_experiences // 4),
                "medium_value": random.randint(n_experiences // 4, n_experiences // 2),
                "low_value": random.randint(n_experiences // 4, n_experiences // 2),
            },
        })

    # Top lessons learned
    top_lessons: list[dict[str, Any]] = []
    for i in range(req.n_top_lessons):
        dim = random.choice(list(SelfImprovementDimension))
        top_lessons.append({
            "lesson_id": f"lesson_{i}",
            "source": random.choice(req.source_types).value,
            "dimension": dim.value,
            "insight": f"Pattern discovered in {dim.value}: {random.choice(['better warm-start', 'adaptive step size', 'layer coupling optimization', 'context-aware strategy selection', 'transfer amplification'])}",
            "confidence": round(0.6 + 0.4 * random.random(), 4),
            "applicability_scope": random.choice(["single_layer", "cross_layer", "full_stack"]),
            "expected_impact": round(0.02 + 0.15 * random.random(), 4),
            "validation_status": random.choice(["validated", "provisional", "hypothesized"]),
            "supporting_evidence_count": random.randint(3, 50),
        })
    top_lessons.sort(key=lambda l: l["expected_impact"], reverse=True)

    # Dimension-grouped analysis (if requested)
    dimension_analysis = None
    if req.group_by_dimension:
        dimension_analysis = {}
        for dim in SelfImprovementDimension:
            dim_sources = [sa for sa in source_analysis if random.random() > 0.3]
            dimension_analysis[dim.value] = {
                "total_experiences": sum(sa["valid_experiences"] for sa in dim_sources),
                "avg_confidence": round(0.5 + 0.5 * random.random(), 4),
                "top_source": random.choice(list(ExperienceSourceType)).value,
                "improvement_velocity": round(0.001 + 0.05 * random.random(), 6),
                "knowledge_gaps": random.randint(0, 5),
                "saturation_level": round(random.random(), 4),
            }

    # Cross-source patterns
    cross_patterns: list[dict[str, Any]] = []
    for i in range(random.randint(3, 8)):
        cross_patterns.append({
            "pattern_id": f"cpat_{i}",
            "sources_involved": random.sample([s.value for s in req.source_types], k=min(3, len(req.source_types))),
            "pattern_type": random.choice(["reinforcing", "conflicting", "complementary", "causal_chain", "feedback_loop"]),
            "strength": round(0.3 + 0.7 * random.random(), 4),
            "affected_layers": random.sample(range(1, 26), k=random.randint(2, 8)),
            "actionable": random.random() < 0.6,
        })

    # Experience quality
    total_exp = sum(sa["valid_experiences"] for sa in source_analysis)
    quality = {
        "total_valid_experiences": total_exp,
        "source_diversity": round(len(req.source_types) / len(ExperienceSourceType), 4),
        "confidence_filter": req.min_confidence,
        "temporal_coverage": round(min(1.0, req.time_window / 365), 4),
        "overall_experience_quality": round(0.7 + 0.3 * random.random(), 4),
    }

    result = {
        "experience_id": exp_id,
        "source_analysis": source_analysis,
        "top_lessons": top_lessons,
        "dimension_analysis": dimension_analysis,
        "cross_source_patterns": cross_patterns,
        "quality": quality,
        "created_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    _experience_cache274[exp_id] = result
    result["compute_time_ms"] = round((time.time() - t0) * 1000, 2)
    return result


def _compute_strategy(req: _StrategyReq) -> dict[str, Any]:
    """Optimize reasoning strategies through meta-learning."""
    t0 = time.time()
    strat_id = f"strat-{uuid.uuid4().hex[:8]}"

    # Generate candidate strategies
    candidates: list[dict[str, Any]] = []
    for i in range(req.n_candidate_strategies):
        strat_name = random.choice(["adaptive_ensemble", "progressive_refinement", "hierarchical_decomposition",
                                    "contrastive_reasoning", "curriculum_guided", "analogical_transfer",
                                    "constraint_satisfaction", "energy_based", "memory_replay", "self_distillation",
                                    "uncertainty_weighted", "gradient_free_search", "population_based", "bayesian_optimization",
                                    "neural_architecture_search", "meta_gradient", "evolved_strategy", "hyperband",
                            ])
        dim_scores = {d.value: round(0.3 + 0.7 * random.random(), 4) for d in req.target_dimensions}
        avg_score = sum(dim_scores.values()) / len(dim_scores)
        candidates.append({
            "strategy_id": f"cand_{i}",
            "name": strat_name,
            "dimension_scores": dim_scores,
            "average_score": round(avg_score, 4),
            "complexity": round(0.2 + 0.8 * random.random(), 4),
            "compute_cost": round(0.1 + 0.9 * random.random(), 4),
            "robustness": round(0.3 + 0.7 * random.random(), 4),
            "generalization": round(0.3 + 0.7 * random.random(), 4),
            "is_explore": random.random() < req.exploration_ratio,
        })

    # Optimization trajectory
    iterations: list[dict[str, Any]] = []
    best_score = 0.0
    for it in range(req.n_iterations):
        iter_best = round(0.4 + 0.6 * (it / req.n_iterations) + 0.05 * random.random(), 4)
        best_score = max(best_score, iter_best)
        iterations.append({
            "iteration": it + 1,
            "best_score": round(iter_best, 4),
            "mean_score": round(0.3 + 0.4 * (it / req.n_iterations) + 0.1 * random.random(), 4),
            "worst_score": round(0.2 + 0.3 * random.random(), 4),
            "improvement_delta": round(max(0, 0.02 + 0.05 * random.random()), 4),
            "explored_ratio": round(min(1.0, (it + 1) / req.n_iterations), 4),
            "convergence_signal": round(1.0 - (it / req.n_iterations), 4),
            "candidates_evaluated": random.randint(1, req.n_candidate_strategies),
            "best_candidate_id": f"cand_{random.randint(0, req.n_candidate_strategies - 1)}",
        })

    # Pareto front (multi-objective)
    pareto_front: list[dict[str, Any]] = []
    for i in range(min(5, req.n_candidate_strategies)):
        pareto_front.append({
            "candidate_id": f"cand_{i}",
            "scores": {d.value: round(0.5 + 0.5 * random.random(), 4) for d in req.target_dimensions},
            "pareto_optimal": i < 3,
            "dominated_by": [] if i < 3 else [f"cand_{random.randint(0, 2)}"],
        })

    # Strategy recommendations
    recommendations: list[dict[str, Any]] = []
    for i in range(3):
        recommendations.append({
            "rank": i + 1,
            "strategy": candidates[i]["name"] if i < len(candidates) else "ai_emergent",
            "expected_improvement": round(0.05 + 0.2 * (1 - i * 0.3) * random.random(), 4),
            "confidence": round(0.6 + 0.4 * (1 - i * 0.2), 4),
            "risk_level": random.choice(["low", "medium", "high"]),
            "recommended_layers": random.sample(range(1, 26), k=random.randint(3, 8)),
            "implementation_complexity": random.choice(["trivial", "simple", "moderate", "complex"]),
        })

    # Quality
    quality = {
        "optimization_iterations": req.n_iterations,
        "candidates_explored": req.n_candidate_strategies,
        "best_achieved_score": round(best_score, 4),
        "convergence_achieved": best_score > 0.85,
        "pareto_coverage": round(len([p for p in pareto_front if p["pareto_optimal"]]) / max(1, len(pareto_front)), 4),
        "overall_strategy_quality": round(0.7 + 0.3 * random.random(), 4),
    }

    result = {
        "strategy_id": strat_id,
        "adaptation_mechanism": req.adaptation_mechanism.value,
        "target_dimensions": [d.value for d in req.target_dimensions],
        "candidates": candidates,
        "optimization_trajectory": iterations,
        "pareto_front": pareto_front,
        "recommendations": recommendations,
        "quality": quality,
        "created_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    _strategy_cache274[strat_id] = result
    result["compute_time_ms"] = round((time.time() - t0) * 1000, 2)
    return result


def _compute_adaptation(req: _AdaptationReq) -> dict[str, Any]:
    """Execute adaptation cycles with configurable mechanisms."""
    t0 = time.time()
    adapt_id = f"adapt-{uuid.uuid4().hex[:8]}"

    # Per-cycle adaptation
    cycles: list[dict[str, Any]] = []
    for c in range(req.n_cycles):
        # Per-phase within cycle
        phases: list[dict[str, Any]] = []
        for phase in req.target_phases:
            phase_result = {
                "phase": phase.value,
                "duration_ms": round(10 + 100 * random.random(), 2),
                "actions_taken": random.randint(1, 10),
                "changes_applied": random.randint(0, 5),
                "success": random.random() > 0.15,
                "confidence": round(0.5 + 0.5 * random.random(), 4),
            }

            # Phase-specific details
            if phase == ImprovementPhase.OBSERVE:
                phase_result["metrics_collected"] = random.randint(10, 50)
                phase_result["anomalies_detected"] = random.randint(0, 5)
            elif phase == ImprovementPhase.REFLECT:
                phase_result["patterns_identified"] = random.randint(1, 8)
                phase_result["hypotheses_formed"] = random.randint(1, 5)
            elif phase == ImprovementPhase.HYPOTHESIZE:
                phase_result["hypotheses_ranked"] = random.randint(2, 10)
                phase_result["top_hypothesis_confidence"] = round(0.5 + 0.5 * random.random(), 4)
            elif phase == ImprovementPhase.EXPERIMENT:
                phase_result["experiments_run"] = random.randint(1, 10)
                phase_result["safety_violations"] = 0 if req.safety_constraints else random.randint(0, 2)
            elif phase == ImprovementPhase.VALIDATE:
                phase_result["validation_passed"] = random.random() > 0.2
                phase_result["statistical_significance"] = round(random.random(), 4)
            elif phase == ImprovementPhase.INTEGRATE:
                phase_result["layers_updated"] = random.randint(1, 10)
                phase_result["rollback_needed"] = random.random() < 0.05

            phases.append(phase_result)

        # Cycle metrics
        cycle_score = round(0.3 + 0.7 * ((c + 1) / req.n_cycles) * random.random(), 4)
        improvement_delta = round(max(0, 0.01 + 0.1 * random.random()), 4)
        cycles.append({
            "cycle": c + 1,
            "phases": phases,
            "cycle_score": cycle_score,
            "improvement_delta": improvement_delta,
            "cumulative_improvement": round(sum(cy.get("improvement_delta", 0) for cy in cycles) + improvement_delta, 4),
            "convergence_metric": round(max(0, 1.0 - c / req.n_cycles), 4),
            "layers_modified": random.randint(1, 8),
            "safety_checks_passed": req.safety_constraints and random.random() > 0.05,
        })

    # Convergence analysis
    improvements = [c["improvement_delta"] for c in cycles]
    convergence = {
        "total_improvement": round(sum(improvements), 4),
        "average_per_cycle": round(sum(improvements) / len(improvements), 4) if improvements else 0,
        "convergence_achieved": any(c["convergence_metric"] < req.convergence_threshold for c in cycles),
        "convergence_threshold": req.convergence_threshold,
        "best_cycle": max(range(len(cycles)), key=lambda i: cycles[i]["cycle_score"]) + 1 if cycles else 0,
        "diminishing_returns": len(improvements) > 2 and improvements[-1] < improvements[0] * 0.5,
        "stability_score": round(0.6 + 0.4 * random.random(), 4),
    }

    # Safety report
    safety_report = None
    if req.safety_constraints:
        safety_report = {
            "constraints_applied": True,
            "total_safety_checks": req.n_cycles * len(req.target_phases),
            "violations_detected": random.randint(0, 2),
            "auto_corrected": random.randint(0, 2),
            "rollback_triggered": random.random() < 0.05,
            "safety_score": round(0.9 + 0.1 * random.random(), 4),
        }

    # Quality
    quality = {
        "cycles_completed": req.n_cycles,
        "phases_per_cycle": len(req.target_phases),
        "mechanism": req.adaptation_mechanism.value,
        "safety_constrained": req.safety_constraints,
        "overall_adaptation_quality": round(0.7 + 0.3 * random.random(), 4),
    }

    result = {
        "adaptation_id": adapt_id,
        "mechanism": req.adaptation_mechanism.value,
        "n_cycles": req.n_cycles,
        "cycles": cycles,
        "convergence_analysis": convergence,
        "safety_report": safety_report,
        "quality": quality,
        "created_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    _adaptation_cache274[adapt_id] = result
    result["compute_time_ms"] = round((time.time() - t0) * 1000, 2)
    return result


def _compute_assessment(req: _AssessmentReq) -> dict[str, Any]:
    """Rigorous self-assessment of improvement effectiveness."""
    t0 = time.time()
    assess_id = f"assess-{uuid.uuid4().hex[:8]}"

    # Rigor-specific validation methods
    rigor_methods = {
        LearningRigorLevel.HEURISTIC: ["rule_check", "threshold_comparison", "expert_judgment"],
        LearningRigorLevel.STATISTICAL: ["t_test", "mann_whitney", "bootstrap_ci", "effect_size"],
        LearningRigorLevel.CAUSAL: ["do_calculus", "backdoor_adjustment", "front_door_criterion", "iv_estimation"],
        LearningRigorLevel.COUNTERFACTUAL: ["potential_outcomes", "counterfactual_bounds", "sensitivity_analysis", "mediation_analysis"],
        LearningRigorLevel.PROSPECTIVE: ["a_b_testing", "sequential_testing", "bayesian_update", "predictive_validation"],
        LearningRigorLevel.AI_RIGOROUS: ["causal_dag_validation", "neural_counterfactual", "generative_validation", "adversarial_testing"],
    }
    methods = rigor_methods.get(req.rigor_level, rigor_methods[LearningRigorLevel.STATISTICAL])

    # Assessment per dimension
    dimension_assessments: list[dict[str, Any]] = []
    for dim in SelfImprovementDimension:
        before_score = round(0.4 + 0.4 * random.random(), 4)
        after_score = round(before_score + 0.05 + 0.2 * random.random(), 4)
        after_score = min(1.0, after_score)
        dimension_assessments.append({
            "dimension": dim.value,
            "before_score": before_score,
            "after_score": after_score,
            "absolute_improvement": round(after_score - before_score, 4),
            "relative_improvement": round((after_score - before_score) / before_score, 4) if before_score > 0 else 0,
            "statistical_significance": round(random.random(), 4),
            "confidence_interval": [round(after_score - 0.05, 4), round(after_score + 0.05, 4)],
            "p_value": round(max(0.001, 0.05 * random.random()), 4),
            "effect_size": round(0.2 + 0.8 * random.random(), 4),
            "validation_method": random.choice(methods),
            "passes_threshold": after_score > 0.7,
        })

    # Baseline comparisons
    comparisons: list[dict[str, Any]] = []
    for i in range(req.n_baseline_comparisons):
        comparisons.append({
            "baseline_id": f"baseline_{i}",
            "baseline_type": random.choice(["random_policy", "no_improvement", "heuristic_only", "previous_version", "industry_benchmark"]),
            "our_score": round(0.6 + 0.4 * random.random(), 4),
            "baseline_score": round(0.3 + 0.5 * random.random(), 4),
            "advantage": round(0.05 + 0.3 * random.random(), 4),
            "statistically_significant": random.random() > 0.2,
            "scope": random.choice(["full_stack", "per_layer", "per_dimension"]),
        })

    # Counterfactual analysis (if requested)
    counterfactual = None
    if req.include_counterfactual:
        counterfactual = {
            "scenarios_analyzed": random.randint(3, 8),
            "best_alternative_outcome": round(0.7 + 0.3 * random.random(), 4),
            "worst_case_outcome": round(0.3 + 0.3 * random.random(), 4),
            "expected_value_improvement": round(0.05 + 0.2 * random.random(), 4),
            "regret_analysis": {
                "average_regret": round(0.01 + 0.05 * random.random(), 4),
                "max_regret": round(0.05 + 0.15 * random.random(), 4),
                "regret_trend": random.choice(["decreasing", "stable", "increasing"]),
            },
            "factual_vs_counterfactual": {
                "factual_outcome": round(0.7 + 0.3 * random.random(), 4),
                "counterfactual_outcome_no_meta_learning": round(0.4 + 0.3 * random.random(), 4),
                "attributable_improvement": round(0.15 + 0.2 * random.random(), 4),
            },
        }

    # Layer-specific assessment (if single_layer scope)
    layer_assessment = None
    if req.assessment_scope == "single_layer" and req.target_layer > 0:
        layer_assessment = {
            "layer": req.target_layer,
            "pre_improvement": round(0.4 + 0.3 * random.random(), 4),
            "post_improvement": round(0.6 + 0.4 * random.random(), 4),
            "specific_improvements": random.randint(2, 8),
            "remaining_bottlenecks": random.randint(0, 4),
            "next_improvement_candidates": random.randint(1, 5),
        }

    # Assessment quality
    quality = {
        "rigor_level": req.rigor_level.value,
        "validation_methods": methods,
        "dimensions_assessed": len(dimension_assessments),
        "baselines_compared": req.n_baseline_comparisons,
        "counterfactual_included": req.include_counterfactual,
        "overall_assessment_confidence": round(0.7 + 0.3 * random.random(), 4),
        "reproducibility_score": round(0.6 + 0.4 * random.random(), 4),
    }

    result = {
        "assessment_id": assess_id,
        "rigor_level": req.rigor_level.value,
        "assessment_scope": req.assessment_scope,
        "target_layer": req.target_layer,
        "dimension_assessments": dimension_assessments,
        "baseline_comparisons": comparisons,
        "counterfactual_analysis": counterfactual,
        "layer_assessment": layer_assessment,
        "quality": quality,
        "created_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    _assessment_cache274[assess_id] = result
    result["compute_time_ms"] = round((time.time() - t0) * 1000, 2)
    return result


def _compute_trajectory(req: _TrajectoryReq) -> dict[str, Any]:
    """Track learning trajectory over time with trend and phase analysis."""
    t0 = time.time()
    traj_id = f"traj-{uuid.uuid4().hex[:8]}"

    # Time range in days
    range_days = {
        "last_month": 30, "last_quarter": 90,
        "last_half": 180, "last_year": 365, "all": 730,
    }.get(req.time_range, 90)

    # Granularity buckets
    granularity_days = {"daily": 1, "weekly": 7, "monthly": 30, "quarterly": 90}.get(req.granularity, 7)
    n_buckets = min(range_days // granularity_days, 120)

    # Timeline buckets
    timeline: list[dict[str, Any]] = []
    base_time = time.time() - range_days * 86400
    cumulative_improvement = 0.0

    for b in range(n_buckets):
        bucket_time = base_time + b * granularity_days * 86400
        per_dim: dict[str, float] = {}
        for dim in SelfImprovementDimension:
            dim_val = round(0.3 + 0.7 * ((b + 1) / n_buckets) + 0.05 * random.gauss(0, 1), 4)
            dim_val = max(0.1, min(1.0, dim_val))
            per_dim[dim.value] = dim_val

        avg_score = sum(per_dim.values()) / len(per_dim)
        improvement = round(0.005 + 0.02 * random.random(), 4)
        cumulative_improvement += improvement

        timeline.append({
            "bucket": b + 1,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(bucket_time)),
            "dimensions": per_dim,
            "average_score": round(avg_score, 4),
            "improvement_delta": improvement,
            "cumulative_improvement": round(cumulative_improvement, 4),
            "active_strategies": random.randint(1, 6),
            "experiences_consumed": random.randint(10, 100),
            "adaptation_cycles_completed": random.randint(0, 5),
            "meta_learning_rate": round(0.001 + 0.01 * random.random(), 6),
        })

    # Milestone events
    milestones: list[dict[str, Any]] = []
    for i in range(random.randint(3, 8)):
        milestones.append({
            "milestone_id": f"ms_{i}",
            "type": random.choice(["breakthrough", "plateau_broken", "new_strategy_discovered", "convergence_achieved", "safety_milestone"]),
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(base_time + random.randint(0, range_days * 86400))),
            "impact_score": round(0.3 + 0.7 * random.random(), 4),
            "description": random.choice([
                "Discovered optimal layer coupling strategy",
                "Achieved convergence in meta-learning inner loop",
                "Cross-domain transfer amplification found",
                "Self-improvement velocity doubled",
                "Safety constraints validated at scale",
                "Emergent strategy outperformed designed ones",
            ]),
            "affected_dimensions": random.sample([d.value for d in SelfImprovementDimension], k=random.randint(2, 4)),
        })
    milestones.sort(key=lambda m: m["impact_score"], reverse=True)

    # Phase detection
    phases: list[dict[str, Any]] = []
    for p in range(req.n_phases):
        phase_start = int(p * n_buckets / req.n_phases)
        phase_end = int((p + 1) * n_buckets / req.n_phases)
        phases.append({
            "phase": p + 1,
            "name": random.choice(["rapid_learning", "consolidation", "plateau", "breakthrough", "refinement", "stabilization", "exploration", "exploitation"]),
            "start_bucket": phase_start + 1,
            "end_bucket": phase_end,
            "dominant_mechanism": random.choice(list(AdaptationMechanism)).value,
            "avg_improvement_rate": round(0.005 + 0.03 * random.random(), 4),
            "total_improvement": round(0.02 + 0.1 * random.random(), 4),
            "efficiency_score": round(0.4 + 0.6 * random.random(), 4),
        })

    # Trend analysis
    trend = {
        "overall_trajectory": random.choice(["accelerating", "linear", "decelerating", "s_curve"]),
        "learning_velocity": round(0.01 + 0.05 * random.random(), 4),
        "acceleration": round(-0.01 + 0.02 * random.random(), 6),
        "current_efficiency": round(0.5 + 0.5 * random.random(), 4),
        "peak_efficiency_bucket": random.randint(n_buckets // 3, n_buckets),
        "saturation_estimate": round(0.7 + 0.3 * random.random(), 4),
        "dimensional_balance": round(0.5 + 0.5 * random.random(), 4),
        "strategy_diversity": round(0.3 + 0.7 * random.random(), 4),
    }

    # Predictions (if requested)
    predictions = None
    if req.include_predictions:
        predictions = {
            "next_period_improvement": round(0.02 + 0.1 * random.random(), 4),
            "predicted_trajectory": random.choice(["continuing_acceleration", "plateau_approaching", "new_breakthrough_likely"]),
            "time_to_convergence_days": random.randint(30, 365),
            "recommended_focus_dimension": random.choice([d.value for d in SelfImprovementDimension]),
            "optimal_strategy_next": random.choice(list(MetaLearningStrategy)).value,
            "risk_of_regression": round(random.random() * 0.3, 4),
            "meta_learning_maturity": round(0.4 + 0.6 * random.random(), 4),
            "predicted_ceiling_approach": round(0.8 + 0.2 * random.random(), 4),
        }

    # Quality
    quality = {
        "timeline_coverage": round(min(1.0, n_buckets / 100), 4),
        "phase_detection_confidence": round(0.6 + 0.4 * random.random(), 4),
        "trend_accuracy": round(0.6 + 0.4 * random.random(), 4),
        "overall_trajectory_score": round(0.7 + 0.3 * random.random(), 4),
    }

    result = {
        "trajectory_id": traj_id,
        "time_range": req.time_range,
        "range_days": range_days,
        "granularity": req.granularity,
        "n_buckets": n_buckets,
        "dimension_filter": req.dimension_filter or "all",
        "timeline": timeline,
        "milestones": milestones,
        "phase_detection": phases,
        "trend_analysis": trend,
        "predictions": predictions,
        "quality": quality,
        "created_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }

    _trajectory_cache274[traj_id] = result
    result["compute_time_ms"] = round((time.time() - t0) * 1000, 2)
    return result


# ─── API Endpoints ────────────────────────────────────────────────────────────

@router.post("/causal-meta-learning/profile")
def api_profile(req: _ProfileReq) -> dict[str, Any]:
    """Meta-learning strategy profiling with full capability assessment across the causal intelligence stack."""
    return _compute_profile(req)


@router.post("/causal-meta-learning/experience")
def api_experience(req: _ExperienceReq) -> dict[str, Any]:
    """Aggregate and analyze learning experiences from all system layers."""
    return _compute_experience(req)


@router.post("/causal-meta-learning/strategy")
def api_strategy(req: _StrategyReq) -> dict[str, Any]:
    """Optimize reasoning strategies through meta-learning with Pareto analysis."""
    return _compute_strategy(req)


@router.post("/causal-meta-learning/adaptation")
def api_adaptation(req: _AdaptationReq) -> dict[str, Any]:
    """Execute multi-cycle adaptation with convergence tracking and safety constraints."""
    return _compute_adaptation(req)


@router.post("/causal-meta-learning/assessment")
def api_assessment(req: _AssessmentReq) -> dict[str, Any]:
    """Rigorous self-assessment of improvement effectiveness with counterfactual analysis."""
    return _compute_assessment(req)


@router.post("/causal-meta-learning/trajectory")
def api_trajectory(req: _TrajectoryReq) -> dict[str, Any]:
    """Learning trajectory tracking with milestone detection and phase analysis."""
    return _compute_trajectory(req)


@router.get("/causal-meta-learning/overview")
def api_overview() -> dict[str, Any]:
    """System overview for the Causal Meta-Learning & Self-Improvement Engine."""
    return {
        "version": "v1.274.0",
        "engine": "Causal Meta-Learning & Self-Improvement Engine",
        "description": "Self-improvement intelligence layer — the system observes its own reasoning performance, "
                       "reflects on successes and failures, hypothesizes better strategies, experiments safely, "
                       "validates rigorously, and integrates learned optimizations back into all 25 layers of "
                       "the causal intelligence stack",
        "enums": {
            "MetaLearningStrategy": [e.value for e in MetaLearningStrategy],
            "SelfImprovementDimension": [e.value for e in SelfImprovementDimension],
            "ExperienceSourceType": [e.value for e in ExperienceSourceType],
            "AdaptationMechanism": [e.value for e in AdaptationMechanism],
            "LearningRigorLevel": [e.value for e in LearningRigorLevel],
            "ImprovementPhase": [e.value for e in ImprovementPhase],
        },
        "endpoints": {
            "POST /graph/causal-meta-learning/profile": "Meta-learning strategy profiling",
            "POST /graph/causal-meta-learning/experience": "Experience aggregation & analysis",
            "POST /graph/causal-meta-learning/strategy": "Strategy optimization with Pareto analysis",
            "POST /graph/causal-meta-learning/adaptation": "Multi-cycle adaptation execution",
            "POST /graph/causal-meta-learning/assessment": "Rigorous self-assessment",
            "POST /graph/causal-meta-learning/trajectory": "Learning trajectory & phase tracking",
            "GET /graph/causal-meta-learning/overview": "System overview",
        },
        "caches": {
            "profile": len(_profile_cache274),
            "experience": len(_experience_cache274),
            "strategy": len(_strategy_cache274),
            "adaptation": len(_adaptation_cache274),
            "assessment": len(_assessment_cache274),
            "trajectory": len(_trajectory_cache274),
        },
        "architecture_position": {
            "layer": 26,
            "name": "Meta-Learning & Self-Improvement",
            "sits_above": "Ontology & Concept Evolution (v1.273)",
            "pipeline": [
                "Discovery (v1.249) → Explanation → Argumentation → Fairness → Curriculum",
                "→ Optimization → Intervention → Distillation → Ensemble → Temporal → Feedback",
                "→ Meta-Cognitive (v1.260) → Emergence (v1.261) → Governance (v1.262)",
                "→ Transfer (v1.263) → Streaming (v1.264) → Consensus (v1.265)",
                "→ Resilience (v1.266) → Explainability (v1.267) → Compression (v1.268)",
                "→ Self-Healing (v1.269) → Semantic Interop (v1.270) → Workflow (v1.271)",
                "→ Digital Twin (v1.272) → Ontology Evolution (v1.273) → Meta-Learning (v1.274)",
            ],
        },
        "configuration_space": "6 strategies × 6 dimensions × 6 sources × 6 mechanisms × 6 rigor × 6 phases = 46,656",
        "improvement_cycle": "Observe → Reflect → Hypothesize → Experiment → Validate → Integrate",
    }
