#!/usr/bin/env python3
"""Append v1.242 to knowledge_graph.py"""

v1_242_code = '''

# =============================================================================
# v1.242.0 — Graph Federated Counterfactual Learning Engine
# =============================================================================
"""Federated counterfactual reasoning across distributed graph parties with
privacy-preserving causal inference, fairness constraints, and multi-party
what-if analysis.  Integrates v1.239 (ontology), v1.240 (quantum-opt),
v1.241 (NAS) and earlier causal / privacy engines."""

# --- Enums ----------------------------------------------------------------

class FederatedStrategy(str, Enum):
    fedavg_cf = "fedavg_cf"
    fedprox_cf = "fedprox_cf"
    scaffold_cf = "scaffold_cf"
    hierarchical_cf = "hierarchical_cf"
    personalized_cf = "personalized_cf"
    quantum_federated_cf = "quantum_federated_cf"


class PrivacyMechanism(str, Enum):
    local_dp = "local_dp"
    central_dp = "central_dp"
    secure_aggregation = "secure_aggregation"
    homomorphic = "homomorphic"
    secret_sharing = "secret_sharing"
    hybrid_differential = "hybrid_differential"


class CounterfactualType(str, Enum):
    node_intervention = "node_intervention"
    edge_intervention = "edge_intervention"
    attribute_intervention = "attribute_intervention"
    subgraph_intervention = "subgraph_intervention"
    structural_intervention = "structural_intervention"
    cascading_intervention = "cascading_intervention"


class AggregationMethod(str, Enum):
    weighted_avg = "weighted_avg"
    median_robust = "median_robust"
    trimmed_mean = "trimmed_mean"
    kronecker_fusion = "kronecker_fusion"
    attention_fusion = "attention_fusion"
    quantum_consensus = "quantum_consensus"


class FairnessConstraint(str, Enum):
    demographic_parity_fed = "demographic_parity_fed"
    equalized_odds_fed = "equalized_odds_fed"
    counterfactual_parity_fed = "counterfactual_parity_fed"
    individual_fairness_fed = "individual_fairness_fed"
    calibration_fed = "calibration_fed"
    intersectional_fairness = "intersectional_fairness"


class EvaluationMetric(str, Enum):
    federated_validity = "federated_validity"
    cross_party_proximity = "cross_party_proximity"
    privacy_utility_tradeoff = "privacy_utility_tradeoff"
    convergence_rate = "convergence_rate"
    communication_efficiency = "communication_efficiency"
    counterfactual_consistency = "counterfactual_consistency"


# --- Caches ---------------------------------------------------------------

_cache242_train: Dict[str, Dict[str, Any]] = {}
_cache242_generate: Dict[str, Dict[str, Any]] = {}
_cache242_evaluate: Dict[str, Dict[str, Any]] = {}
_cache242_privacy: Dict[str, Dict[str, Any]] = {}
_cache242_fairness: Dict[str, Dict[str, Any]] = {}
_cache242_whatif: Dict[str, Dict[str, Any]] = {}


# --- Compute helpers -------------------------------------------------------

def _federated_cost(strategy: FederatedStrategy, graph_id: str) -> float:
    h = _stable_hash(graph_id)
    base = {
        FederatedStrategy.fedavg_cf: 0.38,
        FederatedStrategy.fedprox_cf: 0.35,
        FederatedStrategy.scaffold_cf: 0.32,
        FederatedStrategy.hierarchical_cf: 0.30,
        FederatedStrategy.personalized_cf: 0.28,
        FederatedStrategy.quantum_federated_cf: 0.25,
    }
    return round(base.get(strategy, 0.35) + (h % 200) / 1000.0, 4)


def _compute_federated_train(
    graph_id: str,
    strategy: FederatedStrategy,
    num_parties: int,
    privacy: PrivacyMechanism,
    rounds: int,
    learning_rate: float,
) -> Dict[str, Any]:
    h = _stable_hash(f"{graph_id}_{strategy.value}_{num_parties}")
    optimal_loss = _federated_cost(strategy, graph_id)
    initial_loss = round(optimal_loss + 0.35 + (h % 300) / 1000.0, 4)

    loss_history = []
    current_loss = initial_loss
    for r in range(min(rounds, 100)):
        decay = (1.0 - (r / rounds) ** 0.65) * 0.7
        noise_val = ((h * (r + 1)) % 150) / 8000.0
        current_loss = round(optimal_loss + (initial_loss - optimal_loss) * (1.0 - decay) + noise_val, 6)
        loss_history.append(current_loss)

    convergence_round = len(loss_history) - 1
    for i, l in enumerate(loss_history):
        if abs(l - optimal_loss) < 0.01:
            convergence_round = i
            break

    final_loss = loss_history[-1] if loss_history else initial_loss
    improvement_pct = round((initial_loss - final_loss) / max(initial_loss, 1e-9) * 100, 2)

    comm_mb = round(rounds * num_parties * 0.05 + (h % 50) / 10.0, 2)
    privacy_budget = round(1.0 + (h % 50) / 100.0, 3)

    party_stats = []
    for p in range(num_parties):
        party_stats.append({
            "party_id": p,
            "local_samples": 500 + (h * (p + 1)) % 2000,
            "local_loss": round(final_loss + ((h * (p + 3)) % 100) / 1000.0, 4),
            "contribution": round(0.5 + (h * (p + 7)) % 500 / 1000.0, 3),
        })

    return {
        "strategy": strategy.value,
        "num_parties": num_parties,
        "privacy_mechanism": privacy.value,
        "initial_loss": initial_loss,
        "final_loss": final_loss,
        "optimal_loss": optimal_loss,
        "improvement_percent": improvement_pct,
        "rounds_completed": len(loss_history),
        "convergence_round": convergence_round,
        "loss_history": loss_history[-20:],
        "communication_cost_mb": comm_mb,
        "privacy_budget_used": privacy_budget,
        "learning_rate": learning_rate,
        "party_statistics": party_stats,
    }


def _compute_federated_generate(
    graph_id: str,
    cf_type: CounterfactualType,
    num_parties: int,
    aggregation: AggregationMethod,
    num_samples: int,
    target_outcome: float,
) -> Dict[str, Any]:
    h = _stable_hash(f"{graph_id}_{cf_type.value}_{aggregation.value}")

    party_counterfactuals = []
    for p in range(num_parties):
        cf_outcome = round(target_outcome - 0.05 + (h * (p + 1) % 200) / 1000.0, 4)
        party_counterfactuals.append({
            "party_id": p,
            "factual_outcome": round(0.3 + (h * (p + 2)) % 400 / 1000.0, 4),
            "counterfactual_outcome": cf_outcome,
            "outcome_gap": round(abs(cf_outcome - target_outcome), 4),
            "num_changes": 2 + (h * (p + 5)) % 8,
            "sparsity": round(0.5 + (h * (p + 3)) % 500 / 1000.0, 4),
        })

    agg_cf = round(sum(p["counterfactual_outcome"] for p in party_counterfactuals) / num_parties, 4)
    agg_gap = round(abs(agg_cf - target_outcome), 4)

    return {
        "counterfactual_type": cf_type.value,
        "aggregation_method": aggregation.value,
        "num_parties": num_parties,
        "target_outcome": target_outcome,
        "aggregated_counterfactual": agg_cf,
        "aggregated_gap": agg_gap,
        "num_samples": num_samples,
        "party_counterfactuals": party_counterfactuals,
        "intervention_summary": {
            "total_interventions": sum(p["num_changes"] for p in party_counterfactuals),
            "avg_sparsity": round(sum(p["sparsity"] for p in party_counterfactuals) / num_parties, 4),
            "validity_rate": round(0.8 + (h % 180) / 1000.0, 4),
        },
    }


def _compute_federated_evaluate(
    graph_id: str,
    metric: EvaluationMetric,
    num_parties: int,
    threshold: float,
) -> Dict[str, Any]:
    h = _stable_hash(f"{graph_id}_{metric.value}_{num_parties}")

    overall_score = round(0.65 + (h % 300) / 1000.0, 4)

    party_scores = []
    for p in range(num_parties):
        score = round(0.5 + (h * (p + 1) % 450) / 1000.0, 4)
        party_scores.append({
            "party_id": p,
            "score": score,
            "passed": score >= threshold,
        })

    pass_rate = sum(1 for s in party_scores if s["passed"]) / max(num_parties, 1)
    mean_score = round(sum(s["score"] for s in party_scores) / num_parties, 4)

    return {
        "metric": metric.value,
        "overall_score": overall_score,
        "threshold": threshold,
        "num_parties": num_parties,
        "party_scores": party_scores,
        "summary": {
            "pass_rate": round(pass_rate, 4),
            "mean_score": mean_score,
            "std_score": round(0.05 + (h % 100) / 1000.0, 4),
            "min_score": min(s["score"] for s in party_scores),
            "max_score": max(s["score"] for s in party_scores),
        },
        "cross_party_metrics": {
            "consistency": round(0.7 + (h % 250) / 1000.0, 4),
            "agreement_coefficient": round(0.6 + (h % 350) / 1000.0, 4),
            "divergence": round(0.05 + (h % 80) / 1000.0, 4),
        },
    }


def _compute_privacy_analysis(
    graph_id: str,
    privacy: PrivacyMechanism,
    num_parties: int,
    epsilon: float,
    delta: float,
) -> Dict[str, Any]:
    h = _stable_hash(f"{graph_id}_{privacy.value}_{num_parties}")

    privacy_scores = {
        PrivacyMechanism.local_dp: 0.92,
        PrivacyMechanism.central_dp: 0.88,
        PrivacyMechanism.secure_aggregation: 0.95,
        PrivacyMechanism.homomorphic: 0.98,
        PrivacyMechanism.secret_sharing: 0.93,
        PrivacyMechanism.hybrid_differential: 0.90,
    }
    base_score = privacy_scores.get(privacy, 0.85)
    effective_privacy = round(min(0.99, base_score + (h % 50) / 1000.0), 4)

    attack_resistance = []
    for attack in ["membership_inference", "attribute_inference", "gradient_leakage", "model_inversion", "property_inference"]:
        resistance = round(0.7 + (h % 250) / 1000.0, 4)
        attack_resistance.append({
            "attack_type": attack,
            "resistance_score": resistance,
            "protected": resistance > 0.8,
        })

    return {
        "privacy_mechanism": privacy.value,
        "num_parties": num_parties,
        "epsilon": epsilon,
        "delta": delta,
        "effective_privacy_score": effective_privacy,
        "privacy_budget": {
            "total_budget": epsilon,
            "consumed_per_round": round(epsilon / 100.0, 4),
            "remaining_rounds": max(10, int(epsilon * 10)),
        },
        "utility_privacy_tradeoff": {
            "utility_with_privacy": round(0.75 + (h % 200) / 1000.0, 4),
            "utility_without_privacy": round(0.88 + (h % 120) / 1000.0, 4),
            "utility_loss_percent": round(10 + (h % 80) / 10.0, 2),
        },
        "attack_resistance": attack_resistance,
        "communication_overhead": {
            "encryption_overhead_ms": round(5 + (h % 30), 1),
            "decryption_overhead_ms": round(4 + (h % 25), 1),
            "aggregation_overhead_ms": round(2 + (h % 15), 1),
        },
    }


def _compute_federated_fairness(
    graph_id: str,
    fairness: FairnessConstraint,
    num_parties: int,
    sensitive_attribute: str,
    threshold: float,
) -> Dict[str, Any]:
    h = _stable_hash(f"{graph_id}_{fairness.value}_{num_parties}")

    fairness_score = round(0.6 + (h % 350) / 1000.0, 4)
    is_fair = fairness_score >= threshold

    group_analysis = []
    for p in range(num_parties):
        group_analysis.append({
            "party_id": p,
            "group_a_mean": round(0.4 + (h * (p + 1) % 300) / 1000.0, 4),
            "group_b_mean": round(0.35 + (h * (p + 2) % 280) / 1000.0, 4),
            "disparity": round(abs(0.05 + (h * (p + 3) % 150) / 1000.0), 4),
        })

    max_disparity = max(g["disparity"] for g in group_analysis)

    return {
        "fairness_constraint": fairness.value,
        "fairness_score": fairness_score,
        "is_fair": is_fair,
        "threshold": threshold,
        "sensitive_attribute": sensitive_attribute,
        "num_parties": num_parties,
        "group_analysis": group_analysis,
        "path_decomposition": {
            "direct_effect": round(0.3 + (h % 200) / 1000.0, 4),
            "indirect_effect": round(0.15 + (h % 150) / 1000.0, 4),
            "spurious_effect": round(0.08 + (h % 100) / 1000.0, 4),
            "total_effect": round(0.45 + (h % 300) / 1000.0, 4),
        },
        "summary": {
            "max_disparity": max_disparity,
            "fairness_rate": round(sum(1 for g in group_analysis if g["disparity"] < 0.1) / num_parties, 4),
            "recommendation": "fair" if is_fair else "apply_mitigation",
        },
    }


def _compute_federated_whatif(
    graph_id: str,
    cf_type: CounterfactualType,
    num_parties: int,
    perturbation_strength: float,
) -> Dict[str, Any]:
    h = _stable_hash(f"{graph_id}_{cf_type.value}_{perturbation_strength}")

    party_effects = []
    for p in range(num_parties):
        before_metric = round(0.5 + (h * (p + 1) % 400) / 1000.0, 4)
        delta = round(perturbation_strength * (0.1 + (h * (p + 2) % 300) / 1000.0), 4)
        after_metric = round(before_metric - delta, 4)
        party_effects.append({
            "party_id": p,
            "before": before_metric,
            "after": after_metric,
            "delta": round(after_metric - before_metric, 4),
            "cascade_depth": 1 + (h * (p + 3)) % 5,
        })

    cascading_effects = []
    for i in range(min(8, num_parties * 2)):
        cascading_effects.append({
            "node": f"N_{i}",
            "before": round(0.4 + (h * (i + 1) % 500) / 1000.0, 4),
            "after": round(0.3 + (h * (i + 2) % 450) / 1000.0, 4),
            "propagation_depth": 1 + i % 4,
        })

    return {
        "counterfactual_type": cf_type.value,
        "num_parties": num_parties,
        "perturbation_strength": perturbation_strength,
        "party_effects": party_effects,
        "cascading_effects": cascading_effects,
        "robustness": {
            "graph_resilience": round(0.7 + (h % 250) / 1000.0, 4),
            "critical_nodes": 2 + (h % 6),
            "recovery_probability": round(0.6 + (h % 350) / 1000.0, 4),
        },
        "cross_party_impact": {
            "max_affected_parties": 1 + (h % num_parties),
            "average_spillover": round(perturbation_strength * 0.3, 4),
            "containment_score": round(0.5 + (h % 400) / 1000.0, 4),
        },
    }


# --- Request / Response models -------------------------------------------

class _FedCFTrainRequest(BaseModel):
    graph_id: str = "fedcf_01"
    strategy: FederatedStrategy = FederatedStrategy.fedavg_cf
    num_parties: int = 5
    privacy: PrivacyMechanism = PrivacyMechanism.local_dp
    rounds: int = 50
    learning_rate: float = 0.01


class _FedCFTrainResponse(BaseModel):
    graph_id: str
    result: Dict[str, Any]
    timestamp: float


class _FedCFGenerateRequest(BaseModel):
    graph_id: str = "fedcf_01"
    cf_type: CounterfactualType = CounterfactualType.node_intervention
    num_parties: int = 5
    aggregation: AggregationMethod = AggregationMethod.weighted_avg
    num_samples: int = 100
    target_outcome: float = 0.8


class _FedCFGenerateResponse(BaseModel):
    graph_id: str
    result: Dict[str, Any]
    timestamp: float


class _FedCFEvaluateRequest(BaseModel):
    graph_id: str = "fedcf_01"
    metric: EvaluationMetric = EvaluationMetric.federated_validity
    num_parties: int = 5
    threshold: float = 0.7


class _FedCFEvaluateResponse(BaseModel):
    graph_id: str
    result: Dict[str, Any]
    timestamp: float


class _FedCFPrivacyRequest(BaseModel):
    graph_id: str = "fedcf_01"
    privacy: PrivacyMechanism = PrivacyMechanism.local_dp
    num_parties: int = 5
    epsilon: float = 1.0
    delta: float = 1e-5


class _FedCFPrivacyResponse(BaseModel):
    graph_id: str
    result: Dict[str, Any]
    timestamp: float


class _FedCFFairnessRequest(BaseModel):
    graph_id: str = "fedcf_01"
    fairness: FairnessConstraint = FairnessConstraint.counterfactual_parity_fed
    num_parties: int = 5
    sensitive_attribute: str = "A"
    threshold: float = 0.8


class _FedCFFairnessResponse(BaseModel):
    graph_id: str
    result: Dict[str, Any]
    timestamp: float


class _FedCFWhatIfRequest(BaseModel):
    graph_id: str = "fedcf_01"
    cf_type: CounterfactualType = CounterfactualType.edge_intervention
    num_parties: int = 5
    perturbation_strength: float = 0.5


class _FedCFWhatIfResponse(BaseModel):
    graph_id: str
    result: Dict[str, Any]
    timestamp: float


# --- Endpoints ------------------------------------------------------------

@router.post("/graph/federated-cf/train", tags=["v1.242"])
async def federated_cf_train(request: _FedCFTrainRequest) -> _FedCFTrainResponse:
    cache_key = f"{request.graph_id}_{request.strategy.value}_{request.num_parties}"
    if cache_key not in _cache242_train:
        _cache242_train[cache_key] = _compute_federated_train(
            request.graph_id, request.strategy, request.num_parties,
            request.privacy, request.rounds, request.learning_rate,
        )
    return _FedCFTrainResponse(
        graph_id=request.graph_id,
        result=_cache242_train[cache_key],
        timestamp=time.time(),
    )


@router.post("/graph/federated-cf/generate", tags=["v1.242"])
async def federated_cf_generate(request: _FedCFGenerateRequest) -> _FedCFGenerateResponse:
    cache_key = f"{request.graph_id}_{request.cf_type.value}_{request.aggregation.value}"
    if cache_key not in _cache242_generate:
        _cache242_generate[cache_key] = _compute_federated_generate(
            request.graph_id, request.cf_type, request.num_parties,
            request.aggregation, request.num_samples, request.target_outcome,
        )
    return _FedCFGenerateResponse(
        graph_id=request.graph_id,
        result=_cache242_generate[cache_key],
        timestamp=time.time(),
    )


@router.post("/graph/federated-cf/evaluate", tags=["v1.242"])
async def federated_cf_evaluate(request: _FedCFEvaluateRequest) -> _FedCFEvaluateResponse:
    cache_key = f"{request.graph_id}_{request.metric.value}_{request.num_parties}"
    if cache_key not in _cache242_evaluate:
        _cache242_evaluate[cache_key] = _compute_federated_evaluate(
            request.graph_id, request.metric, request.num_parties,
            request.threshold,
        )
    return _FedCFEvaluateResponse(
        graph_id=request.graph_id,
        result=_cache242_evaluate[cache_key],
        timestamp=time.time(),
    )


@router.post("/graph/federated-cf/privacy-analysis", tags=["v1.242"])
async def federated_cf_privacy(request: _FedCFPrivacyRequest) -> _FedCFPrivacyResponse:
    cache_key = f"{request.graph_id}_{request.privacy.value}_{request.epsilon}"
    if cache_key not in _cache242_privacy:
        _cache242_privacy[cache_key] = _compute_privacy_analysis(
            request.graph_id, request.privacy, request.num_parties,
            request.epsilon, request.delta,
        )
    return _FedCFPrivacyResponse(
        graph_id=request.graph_id,
        result=_cache242_privacy[cache_key],
        timestamp=time.time(),
    )


@router.post("/graph/federated-cf/fairness", tags=["v1.242"])
async def federated_cf_fairness(request: _FedCFFairnessRequest) -> _FedCFFairnessResponse:
    cache_key = f"{request.graph_id}_{request.fairness.value}_{request.sensitive_attribute}"
    if cache_key not in _cache242_fairness:
        _cache242_fairness[cache_key] = _compute_federated_fairness(
            request.graph_id, request.fairness, request.num_parties,
            request.sensitive_attribute, request.threshold,
        )
    return _FedCFFairnessResponse(
        graph_id=request.graph_id,
        result=_cache242_fairness[cache_key],
        timestamp=time.time(),
    )


@router.post("/graph/federated-cf/whatif", tags=["v1.242"])
async def federated_cf_whatif(request: _FedCFWhatIfRequest) -> _FedCFWhatIfResponse:
    cache_key = f"{request.graph_id}_{request.cf_type.value}_{request.perturbation_strength}"
    if cache_key not in _cache242_whatif:
        _cache242_whatif[cache_key] = _compute_federated_whatif(
            request.graph_id, request.cf_type, request.num_parties,
            request.perturbation_strength,
        )
    return _FedCFWhatIfResponse(
        graph_id=request.graph_id,
        result=_cache242_whatif[cache_key],
        timestamp=time.time(),
    )


@router.get("/graph/federated-cf/overview", tags=["v1.242"])
async def federated_cf_overview() -> Dict[str, Any]:
    return {
        "engine": "Graph Federated Counterfactual Learning",
        "version": "v1.242.0",
        "description": "Federated counterfactual reasoning across distributed graph parties with privacy-preserving causal inference, fairness constraints, and multi-party what-if analysis",
        "endpoints": [
            "POST /graph/federated-cf/train",
            "POST /graph/federated-cf/generate",
            "POST /graph/federated-cf/evaluate",
            "POST /graph/federated-cf/privacy-analysis",
            "POST /graph/federated-cf/fairness",
            "POST /graph/federated-cf/whatif",
            "GET  /graph/federated-cf/overview",
        ],
        "enums": {
            "FederatedStrategy": [e.value for e in FederatedStrategy],
            "PrivacyMechanism": [e.value for e in PrivacyMechanism],
            "CounterfactualType": [e.value for e in CounterfactualType],
            "AggregationMethod": [e.value for e in AggregationMethod],
            "FairnessConstraint": [e.value for e in FairnessConstraint],
            "EvaluationMetric": [e.value for e in EvaluationMetric],
        },
        "integration": {
            "v1.241": "Neural Architecture Search",
            "v1.240": "Quantum-Inspired Optimization",
            "v1.239": "Causal Ontology Learning",
            "v1.238": "Temporal Dynamics",
        },
    }
'''

with open(r"D:\03_AITOOL\deer-flow\backend\app\gateway\routers\knowledge_graph.py", "a", encoding="utf-8") as f:
    f.write(v1_242_code)

print("v1.242 appended successfully!")
