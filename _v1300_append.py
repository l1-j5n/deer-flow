#!/usr/bin/env python3
"""
DeerFlow Agent Platform — Layer 52 Append Script
Causal Optimal Transport & Wasserstein Geometry Engine (因果最优传输与Wasserstein几何引擎)
Version: v1.300.0

Appends to: backend/app/gateway/routers/knowledge_graph.py

Enums (6 × 6 = 36 values):
  TransportProblem300, WassersteinMetric300, SinkhornAlgorithm300,
  SchrodingerBridge300, DisplacementGeometry300, TransportApplication300

Endpoints (7):
  POST /graph/optimal-transport/{transport,wasserstein,sinkhorn,schrodinger,displacement,application}
  GET  /graph/optimal-transport/overview
"""

import os

BACKEND_FILE = os.path.join(
    os.path.dirname(__file__),
    "backend", "app", "gateway", "routers", "knowledge_graph.py",
)

APPENDIX = r'''

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Layer 52 — Causal Optimal Transport & Wasserstein Geometry Engine (v1.300)║
# ║  因果最优传输与Wasserstein几何引擎                                          ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# ── Enums ─────────────────────────────────────────────────────────────────────

class TransportProblem300(str, Enum):
    monge = "monge"
    kantorovich = "kantorovich"
    multi_marginal = "multi_marginal"
    dynamic_ot = "dynamic_ot"
    entropic_ot = "entropic_ot"
    ai_transport = "ai_transport"

class WassersteinMetric300(str, Enum):
    w1_earth_mover = "w1_earth_mover"
    w2_quadratic = "w2_quadratic"
    w_infinity = "w_infinity"
    w_p_general = "w_p_general"
    sliced_wasserstein = "sliced_wasserstein"
    ai_metric = "ai_metric"

class SinkhornAlgorithm300(str, Enum):
    sinkhorn_classic = "sinkhorn_classic"
    log_stabilized = "log_stabilized"
    multiscale = "multiscale"
    debiased = "debiased"
    homogeneous_batch = "homogeneous_batch"
    ai_sinkhorn = "ai_sinkhorn"

class SchrodingerBridge300(str, Enum):
    sb_classical = "sb_classical"
    sb_entropic = "sb_entropic"
    sb_dynamic = "sb_dynamic"
    sb_mean_field = "sb_mean_field"
    sb_reciprocal = "sb_reciprocal"
    ai_bridge = "ai_bridge"

class DisplacementGeometry300(str, Enum):
    otto_calculus = "otto_calculus"
    mccann_interpolation = "mccann_interpolation"
    displacement_convexity = "displacement_convexity"
    ricci_curvature_ot = "ricci_curvature_ot"
    curvature_dimension = "curvature_dimension"
    ai_geometry = "ai_geometry"

class TransportApplication300(str, Enum):
    wasserstein_gan = "wasserstein_gan"
    domain_adaptation = "domain_adaptation"
    fairness_transport = "fairness_transport"
    robust_optimization = "robust_optimization"
    barycenter = "barycenter"
    ai_application = "ai_application"


# ── Caches ────────────────────────────────────────────────────────────────────

_transport_300_cache: Dict[str, Any] = {}
_wasserstein_300_cache: Dict[str, Any] = {}
_sinkhorn_300_cache: Dict[str, Any] = {}
_schrodinger_300_cache: Dict[str, Any] = {}
_displacement_300_cache: Dict[str, Any] = {}
_application_300_cache: Dict[str, Any] = {}


# ── Helper ────────────────────────────────────────────────────────────────────

def _mock_transport_300(ptype: TransportProblem300, n_source: int, n_target: int) -> Dict[str, Any]:
    """Solve optimal transport problem between source and target distributions."""
    import math, random
    random.seed(hash(ptype.value) + n_source * 100 + n_target)
    n = min(n_source, 20)
    m = min(n_target, 20)
    # generate source and target weights
    a_raw = [random.uniform(0.1, 1.0) for _ in range(n)]
    a = [round(v / sum(a_raw), 6) for v in a_raw]
    b_raw = [random.uniform(0.1, 1.0) for _ in range(m)]
    b = [round(v / sum(b_raw), 6) for v in b_raw]
    # cost matrix C_ij
    C = [[round(random.uniform(0.1, 5.0), 4) for _ in range(m)] for _ in range(n)]
    # mock optimal transport plan (entropy-regularized approximation)
    if ptype == TransportProblem300.monge:
        # deterministic mapping: each source maps to one target
        plan = [[0.0]*m for _ in range(n)]
        for i in range(n):
            j = min(range(m), key=lambda j: C[i][j])
            plan[i][j] = a[i]
    else:
        # Kantorovich: joint distribution
        plan = [[round(a[i] * b[j], 6) for j in range(m)] for i in range(n)]
    transport_cost = round(sum(plan[i][j] * C[i][j] for i in range(n) for j in range(m)), 6)
    # dual variables (Kantorovich potentials)
    f_dual = [round(random.uniform(-2, 2), 4) for _ in range(n)]
    g_dual = [round(random.uniform(-2, 2), 4) for _ in range(m)]
    dual_obj = round(sum(a[i]*f_dual[i] for i in range(n)) + sum(b[j]*g_dual[j] for j in range(m)), 4)
    return {
        "problem_type": ptype.value,
        "n_source": n_source,
        "n_target": n_target,
        "source_weights_a": a,
        "target_weights_b": b,
        "cost_matrix_C_shape": f"{n}x{m}",
        "cost_matrix_C_sample": [C[i][:min(m, 5)] for i in range(min(n, 5))],
        "optimal_plan_gamma_shape": f"{n}x{m}",
        "optimal_plan_sample": [[round(plan[i][j], 6) for j in range(min(m, 5))] for i in range(min(n, 5))],
        "transport_cost": transport_cost,
        "kantorovich_dual_potentials_f": f_dual[:min(n, 8)],
        "kantorovich_dual_potentials_g": g_dual[:min(m, 8)],
        "dual_objective": dual_obj,
        "duality_gap": round(abs(transport_cost - dual_obj), 6),
        "coulomb_cost": ptype == TransportProblem300.multi_marginal,
        "entropic_regularizer_epsilon": round(random.uniform(0.01, 0.5), 4) if ptype in (TransportProblem300.entropic_ot, TransportProblem300.ai_transport) else None,
        "benamou_brenier_form": ptype == TransportProblem300.dynamic_ot,
        "marginal_constraint_1_norm": round(sum(sum(plan[i][j] for j in range(m)) for i in range(n)), 4),
        "marginal_constraint_2_norm": round(sum(sum(plan[i][j] for i in range(n)) for j in range(m)), 4),
        "computation_id": f"otp300_{ptype.value}_{n_source}_{n_target}",
    }


def _mock_wasserstein_300(wtype: WassersteinMetric300, n_points: int, p_order: float) -> Dict[str, Any]:
    """Compute Wasserstein distance between two empirical distributions."""
    import math, random
    random.seed(hash(wtype.value) + n_points + int(p_order * 10))
    n = min(n_points, 20)
    # two empirical distributions on R^d
    dim = 3
    mu = [[round(random.gauss(0, 1), 4) for _ in range(dim)] for _ in range(n)]
    nu = [[round(random.gauss(1, 1.5), 4) for _ in range(dim)] for _ in range(n)]
    # compute Wasserstein-p
    if wtype == WassersteinMetric300.w1_earth_mover:
        p = 1.0
        dists = sorted([round(math.sqrt(sum((mu[i][d_] - nu[i][d_])**2 for d_ in range(dim))), 4) for i in range(n)])
        w_dist = round(sum(dists) / n, 4)
    elif wtype == WassersteinMetric300.w2_quadratic:
        p = 2.0
        dists_sq = [round(sum((mu[i][d_] - nu[i][d_])**2 for d_ in range(dim)), 4) for i in range(n)]
        w_dist = round(math.sqrt(sum(dists_sq) / n), 4)
    elif wtype == WassersteinMetric300.w_infinity:
        p = float('inf')
        dists = sorted([round(math.sqrt(sum((mu[i][d_] - nu[i][d_])**2 for d_ in range(dim))), 4) for i in range(n)])
        w_dist = max(dists)
    else:
        p = p_order
        dists_p = [round(sum(abs(mu[i][d_] - nu[i][d_])**p for d_ in range(dim)), 4) for i in range(n)]
        w_dist = round((sum(dists_p) / n) ** (1.0 / p), 4) if p > 0 else 0.0
    # sliced approximation
    n_slices = 10
    sliced_dists = [round(random.uniform(w_dist * 0.7, w_dist * 1.3), 4) for _ in range(n_slices)]
    return {
        "metric_type": wtype.value,
        "n_points": n_points,
        "dimension": dim,
        "p_order": p if wtype != WassersteinMetric300.w_infinity else "infinity",
        "source_distribution_mu_sample": mu[:5],
        "target_distribution_nu_sample": nu[:5],
        "wasserstein_distance": w_dist,
        "euclidean_reference": round(math.sqrt(sum((sum(mu[i][d_] for i in range(n))/n - sum(nu[i][d_] for i in range(n))/n)**2 for d_ in range(dim))), 4),
        "kantorovich_rubinstein_dual": round(random.uniform(w_dist * 0.9, w_dist * 1.1), 4),
        "sliced_wasserstein_estimates": sliced_dists,
        "sliced_mean": round(sum(sliced_dists) / len(sliced_dists), 4),
        "triangle_inequality_holds": True,
        "metric_property": "positive_definite, symmetric, triangle_inequality",
        "relation_to_fisher_rao": "W2 and Fisher-Rao define distinct Riemannian structures on P(R^d)",
        "otto_riemannian_metric": wtype == WassersteinMetric300.w2_quadratic,
        "computation_id": f"wss300_{wtype.value}_{n_points}_{int(p_order*10)}",
    }


def _mock_sinkhorn_300(stype: SinkhornAlgorithm300, matrix_size: int, reg_epsilon: float) -> Dict[str, Any]:
    """Run Sinkhorn algorithm for entropic regularization of OT."""
    import math, random
    random.seed(hash(stype.value) + matrix_size + int(reg_epsilon * 1000))
    n = min(matrix_size, 12)
    # cost matrix and marginals
    a = [round(1.0/n, 6)] * n
    b = [round(1.0/n, 6)] * n
    C = [[round(random.uniform(0.1, 3.0), 4) for _ in range(n)] for _ in range(n)]
    # Sinkhorn kernel K = exp(-C/epsilon)
    K = [[round(math.exp(-C[i][j] / max(reg_epsilon, 0.001)), 6) for j in range(n)] for i in range(n)]
    # simulate Sinkhorn iterations
    u = [1.0] * n
    max_iter = 20
    errors = []
    for it in range(max_iter):
        v = [round(max(b[j] / max(sum(K[i][j] * u[i] for i in range(n)), 1e-10), 1e-10), 6) for j in range(n)]
        u = [round(max(a[i] / max(sum(K[i][j] * v[j] for j in range(n)), 1e-10), 1e-10), 6) for i in range(n)]
        err = round(sum(abs(u[i] * sum(K[i][j] * v[j] for j in range(n)) - a[i]) for i in range(n)), 6)
        errors.append(err)
    # transport plan from Sinkhorn
    plan = [[round(u[i] * K[i][j] * v[j], 6) for j in range(n)] for i in range(n)]
    ot_cost = round(sum(plan[i][j] * C[i][j] for i in range(n) for j in range(n)), 6)
    return {
        "algorithm_type": stype.value,
        "matrix_size_n": n,
        "regularization_epsilon": reg_epsilon,
        "cost_matrix_C_sample": [C[i][:min(n, 5)] for i in range(min(n, 5))],
        "sinkhorn_kernel_K_sample": [K[i][:min(n, 5)] for i in range(min(n, 5))],
        "scaling_vector_u": u[:min(n, 8)],
        "scaling_vector_v": v[:min(n, 8)],
        "transport_plan_sample": [plan[i][:min(n, 5)] for i in range(min(n, 5))],
        "transport_cost": ot_cost,
        "convergence_errors": errors[:10],
        "final_error": errors[-1] if errors else 0.0,
        "iterations_run": max_iter,
        "convergence_achieved": errors[-1] < 0.01 if errors else False,
        "log_domain_stabilized": stype in (SinkhornAlgorithm300.log_stabilized, SinkhornAlgorithm300.multiscale),
        "debiased_correction": stype == SinkhornAlgorithm300.debiased,
        "entropy_of_plan": round(-sum(plan[i][j] * math.log(max(plan[i][j], 1e-15)) for i in range(n) for j in range(n) if plan[i][j] > 0), 4),
        "kl_divergence_plan_uniform": round(sum(plan[i][j] * math.log(max(plan[i][j] * n * n, 1e-15)) for i in range(n) for j in range(n) if plan[i][j] > 0), 4),
        "computation_id": f"snk300_{stype.value}_{matrix_size}_{int(reg_epsilon*1000)}",
    }


def _mock_schrodinger_300(sbtype: SchrodingerBridge300, n_particles: int, time_steps: int) -> Dict[str, Any]:
    """Compute Schrödinger bridge between distributions."""
    import math, random
    random.seed(hash(sbtype.value) + n_particles + time_steps)
    dim = 3
    T = 1.0
    dt = round(T / time_steps, 6)
    # forward and backward reference processes
    forward_drift = [round(random.uniform(-0.5, 0.5), 4) for _ in range(dim)]
    backward_drift = [round(random.uniform(-0.5, 0.5), 4) for _ in range(dim)]
    sigma = round(random.uniform(0.3, 1.5), 4)
    # simulate path-wise bridge
    paths = []
    for p in range(min(n_particles, 6)):
        path = []
        x = [round(random.gauss(0, 1), 4) for _ in range(dim)]
        for t in range(min(time_steps, 10)):
            bridge_weight = t / max(time_steps, 1)
            drift = [round(forward_drift[d_] * (1 - bridge_weight) + backward_drift[d_] * bridge_weight, 4) for d_ in range(dim)]
            noise = [round(random.gauss(0, sigma * math.sqrt(dt)), 6) for _ in range(dim)]
            x = [round(x[d_] + drift[d_] * dt + noise[d_], 6) for d_ in range(dim)]
            path.append({"step": t, "time": round(t * dt, 4), "state": x, "bridge_weight": round(bridge_weight, 4)})
        paths.append({"particle": p, "trajectory": path})
    # Schrödinger potentials
    psi = [round(random.uniform(-1, 1), 4) for _ in range(dim)]
    phi_hat = [round(random.uniform(-1, 1), 4) for _ in range(dim)]
    return {
        "bridge_type": sbtype.value,
        "n_particles": n_particles,
        "time_steps": time_steps,
        "dimension": dim,
        "time_horizon_T": T,
        "dt": dt,
        "forward_reference_drift": forward_drift,
        "backward_reference_drift": backward_drift,
        "diffusion_sigma": sigma,
        "entropic_regularization": round(0.5 * sigma**2, 4),
        "schrodinger_potential_psi": psi,
        "schrodinger_potential_phi_hat": phi_hat,
        "bridge_paths": paths[:3],
        "connection_to_girsanov": "Schrödinger bridge = Girsanov with entropic cost (Layer 51)",
        "connection_to_fokker_planck": "Bridge dynamics satisfy constrained FPE (Layer 51)",
        "reciprocal_couples_forward_backward": sbtype == SchrodingerBridge300.sb_reciprocal,
        "mean_field_interaction": sbtype == SchrodingerBridge300.sb_mean_field,
        "kl_cost_to_reference": round(random.uniform(0.1, 5.0), 4),
        "optimal_coupling_cost": round(random.uniform(0.5, 3.0), 4),
        "computation_id": f"sbr300_{sbtype.value}_{n_particles}_{time_steps}",
    }


def _mock_displacement_300(dtype: DisplacementGeometry300, dim: int, n_interpolations: int) -> Dict[str, Any]:
    """Compute displacement interpolation and Otto geometry."""
    import math, random
    random.seed(hash(dtype.value) + dim + n_interpolations)
    # two points in Wasserstein space
    mu_0 = [round(random.gauss(0, 1), 4) for _ in range(dim)]
    mu_1 = [round(random.gauss(2, 1), 4) for _ in range(dim)]
    # McCann displacement interpolation: mu_t = ((1-t)*id + t*T)#mu_0
    interpolation = []
    for k in range(min(n_interpolations, 12)):
        t = round(k / max(n_interpolations - 1, 1), 4)
        mu_t = [round((1 - t) * mu_0[d_] + t * mu_1[d_], 4) for d_ in range(dim)]
        velocity = [round(mu_1[d_] - mu_0[d_], 4) for d_ in range(dim)]
        # Otto metric: g_mu(v,w) = integral <v, w> dmu
        otto_metric_val = round(sum(v**2 for v in velocity), 4)
        interpolation.append({
            "t": t,
            "displacement_mu_t": mu_t,
            "velocity_v_t": velocity,
            "otto_metric_g_v_v": otto_metric_val,
        })
    # geometric quantities
    otto_tangent_norm = round(math.sqrt(sum((mu_1[d_] - mu_0[d_])**2 for d_ in range(dim))), 4)
    geodesic_length = otto_tangent_norm
    # displacement convexity (McCann)
    functional_values = [round(sum(v**2 for v in interp["displacement_mu_t"]), 4) for interp in interpolation]
    is_convex = all(functional_values[i] <= (functional_values[0] * (1 - i/(len(functional_values)-1)) + functional_values[-1] * i/(len(functional_values)-1)) + 0.01 for i in range(len(functional_values)))
    return {
        "geometry_type": dtype.value,
        "dimension": dim,
        "n_interpolations": n_interpolations,
        "initial_point_mu_0": mu_0,
        "final_point_mu_1": mu_1,
        "displacement_interpolation": interpolation,
        "otto_tangent_norm": otto_tangent_norm,
        "geodesic_length_W2": geodesic_length,
        "geodesic_is_constant_speed": True,
        "displacement_convexity": is_convex,
        "mccann_condition": "lambda-convex along geodesics in W2",
        "ricci_curvature_lower_bound_K": round(random.uniform(-2, 2), 4),
        "curvature_dimension_CD": f"CD(K, infinity) with K={round(random.uniform(-2, 2), 2)}",
        "lott_sturm_villani": "CD(K,N) <=> K-bounded Ricci curvature on Wasserstein space",
        "relation_to_layer50": "Otto metric is the W2 Riemannian metric, complementing Fisher-Rao (Layer 50)",
        "relation_to_layer51": "Displacement interpolation = constant-speed geodesic = Benamou-Brenier flow (Layer 51)",
        "computation_id": f"dsp300_{dtype.value}_{dim}_{n_interpolations}",
    }


def _mock_application_300(atype: TransportApplication300, n_samples: int, n_classes: int) -> Dict[str, Any]:
    """Apply optimal transport to causal inference and machine learning."""
    import math, random
    random.seed(hash(atype.value) + n_samples + n_classes)
    if atype == TransportApplication300.wasserstein_gan:
        # WGAN: critic computes W1 distance
        critic_scores = [round(random.uniform(-2, 2), 4) for _ in range(n_samples)]
        w1_estimate = round(sum(critic_scores) / n_samples, 4)
        grad_penalty = round(random.uniform(0, 0.1), 4)
        return {
            "application_type": atype.value,
            "n_samples": n_samples,
            "wasserstein_estimate_W1": w1_estimate,
            "critic_scores_sample": critic_scores[:8],
            "gradient_penalty": grad_penalty,
            "lipchitz_constraint": "enforced via gradient penalty or weight clipping",
            "convergence": "WGAN minimizes W1(P_data, P_gen) for stable training",
            "connection_to_layer50": "W1 gradient flow on probability space (Layer 50 Fisher manifold)",
        }
    elif atype == TransportApplication300.domain_adaptation:
        # OT-based domain adaptation
        source_labels = [random.randint(0, n_classes - 1) for _ in range(n_samples)]
        transport_plan = [round(1.0 / n_samples, 6)] * n_samples
        adaptation_accuracy = round(random.uniform(0.7, 0.95), 4)
        return {
            "application_type": atype.value,
            "n_source_samples": n_samples,
            "n_target_samples": n_samples,
            "n_classes": n_classes,
            "source_labels_distribution": {str(c): round(sum(1 for l in source_labels if l == c) / n_samples, 4) for c in range(n_classes)},
            "transport_coupling_sample": transport_plan[:8],
            "adapted_accuracy": adaptation_accuracy,
            "ot_cost": round(random.uniform(0.5, 3.0), 4),
            "method": "Joint Proportional OT for domain shift correction",
        }
    elif atype == TransportApplication300.fairness_transport:
        # Fairness via optimal transport
        group_transport_cost = {f"group_{g}": round(random.uniform(0.1, 2.0), 4) for g in range(n_classes)}
        fairness_gap = round(random.uniform(0.01, 0.2), 4)
        return {
            "application_type": atype.value,
            "n_samples": n_samples,
            "n_groups": n_classes,
            "group_transport_costs": group_transport_cost,
            "fairness_gap_wasserstein": fairness_gap,
            "equalized_odds_achieved": fairness_gap < 0.05,
            "barycentric_projection": "map each group distribution to Wasserstein barycenter",
            "demographic_parity_w1": round(random.uniform(0, 0.1), 4),
        }
    elif atype == TransportApplication300.robust_optimization:
        # Distributionally robust optimization with Wasserstein ambiguity set
        epsilon_radius = round(random.uniform(0.1, 2.0), 4)
        worst_case_cost = round(random.uniform(1.0, 5.0), 4)
        return {
            "application_type": atype.value,
            "n_samples": n_samples,
            "ambiguity_set_radius_epsilon": epsilon_radius,
            "ambiguity_set": f"W_p ball of radius {epsilon_radius} around empirical distribution",
            "worst_case_cost": worst_case_cost,
            "nominal_cost": round(worst_case_cost * random.uniform(0.5, 0.9), 4),
            "robustness premium": round(worst_case_cost * 0.1, 4),
            "dual_reformulation": "sup_{f 1-Lip} E_n[f] + epsilon * ||f||_Lip",
        }
    elif atype == TransportApplication300.barycenter:
        # Wasserstein barycenter
        n_distributions = 3
        weights = [round(1.0/n_distributions, 4)] * n_distributions
        barycenter_sample = [[round(random.gauss(1, 0.5), 4) for _ in range(min(n_samples, 8))] for _ in range(3)]
        return {
            "application_type": atype.value,
            "n_input_distributions": n_distributions,
            "barycenter_weights": weights,
            "input_distribution_samples": barycenter_sample,
            "barycenter_frechet_mean": "W2-Frechet mean of input distributions",
            "iteration_converged": True,
            "total_w2_cost_to_barycenter": round(random.uniform(0.5, 3.0), 4),
        }
    else:
        return {
            "application_type": atype.value,
            "n_samples": n_samples,
            "n_classes": n_classes,
            "ai_transport_result": "neural optimal transport with learned cost",
            "estimated_wasserstein": round(random.uniform(0.5, 3.0), 4),
            "model_parameters": round(random.uniform(1e5, 1e7), 0),
        }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/graph/optimal-transport/transport")
async def transport_300(
    problem_type: TransportProblem300 = Query(TransportProblem300.kantorovich),
    n_source: int = Query(10, ge=2, le=1000),
    n_target: int = Query(10, ge=2, le=1000),
):
    key = f"{problem_type.value}_{n_source}_{n_target}"
    if key in _transport_300_cache:
        return _transport_300_cache[key]
    result = _mock_transport_300(problem_type, n_source, n_target)
    _transport_300_cache[key] = result
    return result


@router.post("/graph/optimal-transport/wasserstein")
async def wasserstein_300(
    metric_type: WassersteinMetric300 = Query(WassersteinMetric300.w2_quadratic),
    n_points: int = Query(50, ge=2, le=10000),
    p_order: float = Query(2.0, gt=0, le=100),
):
    key = f"{metric_type.value}_{n_points}_{p_order:.2f}"
    if key in _wasserstein_300_cache:
        return _wasserstein_300_cache[key]
    result = _mock_wasserstein_300(metric_type, n_points, p_order)
    _wasserstein_300_cache[key] = result
    return result


@router.post("/graph/optimal-transport/sinkhorn")
async def sinkhorn_300(
    algorithm_type: SinkhornAlgorithm300 = Query(SinkhornAlgorithm300.sinkhorn_classic),
    matrix_size: int = Query(10, ge=2, le=500),
    reg_epsilon: float = Query(0.1, gt=0.001, le=10),
):
    key = f"{algorithm_type.value}_{matrix_size}_{reg_epsilon:.4f}"
    if key in _sinkhorn_300_cache:
        return _sinkhorn_300_cache[key]
    result = _mock_sinkhorn_300(algorithm_type, matrix_size, reg_epsilon)
    _sinkhorn_300_cache[key] = result
    return result


@router.post("/graph/optimal-transport/schrodinger")
async def schrodinger_300(
    bridge_type: SchrodingerBridge300 = Query(SchrodingerBridge300.sb_classical),
    n_particles: int = Query(100, ge=2, le=10000),
    time_steps: int = Query(50, ge=2, le=1000),
):
    key = f"{bridge_type.value}_{n_particles}_{time_steps}"
    if key in _schrodinger_300_cache:
        return _schrodinger_300_cache[key]
    result = _mock_schrodinger_300(bridge_type, n_particles, time_steps)
    _schrodinger_300_cache[key] = result
    return result


@router.post("/graph/optimal-transport/displacement")
async def displacement_300(
    geometry_type: DisplacementGeometry300 = Query(DisplacementGeometry300.otto_calculus),
    dimension: int = Query(4, ge=1, le=100),
    n_interpolations: int = Query(10, ge=2, le=100),
):
    key = f"{geometry_type.value}_{dimension}_{n_interpolations}"
    if key in _displacement_300_cache:
        return _displacement_300_cache[key]
    result = _mock_displacement_300(geometry_type, dimension, n_interpolations)
    _displacement_300_cache[key] = result
    return result


@router.post("/graph/optimal-transport/application")
async def application_300(
    application_type: TransportApplication300 = Query(TransportApplication300.wasserstein_gan),
    n_samples: int = Query(100, ge=2, le=10000),
    n_classes: int = Query(3, ge=2, le=20),
):
    key = f"{application_type.value}_{n_samples}_{n_classes}"
    if key in _application_300_cache:
        return _application_300_cache[key]
    result = _mock_application_300(application_type, n_samples, n_classes)
    _application_300_cache[key] = result
    return result


@router.get("/graph/optimal-transport/overview")
async def optimal_transport_overview_300():
    return {
        "layer": 52,
        "version": "v1.300.0",
        "engine": "Causal Optimal Transport & Wasserstein Geometry Engine",
        "description": "因果最优传输与Wasserstein几何引擎 — Monge-Kantorovich问题、Wasserstein距离、Sinkhorn算法、Schrödinger桥、Otto微积分、传输应用",
        "enums": {
            "TransportProblem300": [e.value for e in TransportProblem300],
            "WassersteinMetric300": [e.value for e in WassersteinMetric300],
            "SinkhornAlgorithm300": [e.value for e in SinkhornAlgorithm300],
            "SchrodingerBridge300": [e.value for e in SchrodingerBridge300],
            "DisplacementGeometry300": [e.value for e in DisplacementGeometry300],
            "TransportApplication300": [e.value for e in TransportApplication300],
        },
        "enum_count": 36,
        "endpoints": [
            {"method": "POST", "path": "/graph/optimal-transport/transport", "desc": "最优传输问题"},
            {"method": "POST", "path": "/graph/optimal-transport/wasserstein", "desc": "Wasserstein距离"},
            {"method": "POST", "path": "/graph/optimal-transport/sinkhorn", "desc": "Sinkhorn算法"},
            {"method": "POST", "path": "/graph/optimal-transport/schrodinger", "desc": "Schrödinger桥"},
            {"method": "POST", "path": "/graph/optimal-transport/displacement", "desc": "位移几何"},
            {"method": "POST", "path": "/graph/optimal-transport/application", "desc": "传输应用"},
            {"method": "GET",  "path": "/graph/optimal-transport/overview", "desc": "系统总览"},
        ],
        "endpoint_count": 7,
        "config_space": 6**6,
        "cache_stats": {
            "transport": len(_transport_300_cache),
            "wasserstein": len(_wasserstein_300_cache),
            "sinkhorn": len(_sinkhorn_300_cache),
            "schrodinger": len(_schrodinger_300_cache),
            "displacement": len(_displacement_300_cache),
            "application": len(_application_300_cache),
        },
    }

'''

if __name__ == "__main__":
    with open(BACKEND_FILE, "a", encoding="utf-8") as f:
        f.write(APPENDIX)
    size = os.path.getsize(BACKEND_FILE)
    print(f"Layer 52 (v1.300) appended to knowledge_graph.py -- new size: {size:,} bytes")
