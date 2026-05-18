#!/usr/bin/env python3
"""
DeerFlow Agent Platform — Layer 53 Append Script
Causal Ergodic Theory & Mixing Dynamics Engine (因果遍历理论与混合动力学引擎)
Version: v1.301.0

Appends to: backend/app/gateway/routers/knowledge_graph.py

Enums (6 × 6 = 36 values):
  ErgodicSystem301, MixingType301, SpectralAnalysis301,
  EntropyProduction301, ErgodicDecomposition301, ErgodicApplication301

Endpoints (7):
  POST /graph/ergodic-theory/{system,mixing,spectral,entropy,decomposition,application}
  GET  /graph/ergodic-theory/overview
"""

import os

BACKEND_FILE = os.path.join(
    os.path.dirname(__file__),
    "backend", "app", "gateway", "routers", "knowledge_graph.py",
)

APPENDIX = r'''

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Layer 53 — Causal Ergodic Theory & Mixing Dynamics Engine (v1.301)       ║
# ║  因果遍历理论与混合动力学引擎                                               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# ── Enums ─────────────────────────────────────────────────────────────────────

class ErgodicSystem301(str, Enum):
    discrete_time = "discrete_time"
    continuous_time = "continuous_time"
    random_dynamical = "random_dynamical"
    markov_chain = "markov_chain"
    thermodynamic = "thermodynamic"
    ai_ergodic = "ai_ergodic"

class MixingType301(str, Enum):
    strong_mixing = "strong_mixing"
    weak_mixing = "weak_mixing"
    exact_system = "exact_system"
    bernoulli_shift = "bernoulli_shift"
    kolmogorov_automorphism = "kolmogorov_automorphism"
    ai_mixing = "ai_mixing"

class SpectralAnalysis301(str, Enum):
    fourier_spectrum = "fourier_spectrum"
    lyapunov_exponents = "lyapunov_exponents"
    decay_correlations = "decay_correlations"
    transfer_operator = "transfer_operator"
    resolvent = "resolvent"
    ai_spectral = "ai_spectral"

class EntropyProduction301(str, Enum):
    kolmogorov_sinai = "kolmogorov_sinai"
    metric_entropy = "metric_entropy"
    topological_entropy = "topological_entropy"
    pressure_function = "pressure_function"
    large_deviation = "large_deviation"
    ai_entropy = "ai_entropy"

class ErgodicDecomposition301(str, Enum):
    invariant_measures = "invariant_measures"
    ergodic_components = "ergodic_components"
    pure_states = "pure_states"
    extremal_measures = "extremal_measures"
    choquet_theory = "choquet_theory"
    ai_decomposition = "ai_decomposition"

class ErgodicApplication301(str, Enum):
    markov_monte_carlo = "markov_monte_carlo"
    sampling_convergence = "sampling_convergence"
    causal_stability = "causal_stability"
    phase_transition = "phase_transition"
    random_matrix = "random_matrix"
    ai_application = "ai_application"


# ── Caches ────────────────────────────────────────────────────────────────────

_system_301_cache: Dict[str, Any] = {}
_mixing_301_cache: Dict[str, Any] = {}
_spectral_301_cache: Dict[str, Any] = {}
_entropy_301_cache: Dict[str, Any] = {}
_decomposition_301_cache: Dict[str, Any] = {}
_application_301_cache: Dict[str, Any] = {}


# ── Helper ────────────────────────────────────────────────────────────────────

def _mock_system_301(stype: ErgodicSystem301, dim: int, n_steps: int) -> Dict[str, Any]:
    """Simulate ergodic dynamical system and compute time averages vs space averages."""
    import math, random
    random.seed(hash(stype.value) + dim * 100 + n_steps)
    n = min(n_steps, 50)
    d = min(dim, 8)
    # transition / flow matrix
    T = [[round(random.gauss(0, 1.0 / max(d, 1)), 4) for _ in range(d)] for _ in range(d)]
    # invariant distribution (stationary measure)
    pi_raw = [random.uniform(0.1, 1.0) for _ in range(d)]
    pi_sum = sum(pi_raw)
    pi = [round(v / pi_sum, 6) for v in pi_raw]
    # simulate trajectory
    x = [round(random.gauss(0, 1), 4) for _ in range(d)]
    trajectory = []
    time_average = [0.0] * d
    for t in range(n):
        if stype == ErgodicSystem301.markov_chain:
            # discrete Markov transition
            x_new = [round(sum(T[i][j] * x[j] for j in range(d)) + random.gauss(0, 0.1), 4) for i in range(d)]
        elif stype == ErgodicSystem301.continuous_time:
            # continuous flow: dx = Ax dt + noise
            dt = 0.01
            x_new = [round(x[i] + sum(T[i][j] * x[j] for j in range(d)) * dt + random.gauss(0, 0.05), 4) for i in range(d)]
        elif stype == ErgodicSystem301.thermodynamic:
            # Langevin thermostat: dx = -grad V dt + sqrt(2T) dW
            grad_V = [round(0.5 * x[i], 4) for i in range(d)]
            temp = 1.0
            x_new = [round(x[i] - grad_V[i] * 0.01 + math.sqrt(2 * temp * 0.01) * random.gauss(0, 1), 4) for i in range(d)]
        else:
            # random dynamical system
            x_new = [round(sum(T[i][j] * x[j] for j in range(d)) + random.gauss(0, 0.2), 4) for i in range(d)]
        x = x_new
        for i in range(d):
            time_average[i] += x[i]
        trajectory.append({"step": t, "state": [round(v, 4) for v in x]})
    time_average = [round(v / n, 6) for v in time_average]
    # space average under invariant measure
    # Birkhoff: lim (1/n) sum f(T^k x) = integral f dμ for μ-a.e. x
    space_average = [round(random.gauss(0, 0.1), 4) for _ in range(d)]
    ergodic_gap = [round(abs(time_average[i] - space_average[i]), 6) for i in range(d)]
    return {
        "system_type": stype.value,
        "dimension": dim,
        "n_steps": n_steps,
        "transition_matrix_T_shape": f"{d}x{d}",
        "transition_matrix_T_sample": [T[i][:min(d, 5)] for i in range(min(d, 5))],
        "invariant_distribution_pi": pi,
        "trajectory_length": len(trajectory),
        "trajectory_sample": trajectory[:5],
        "time_average_birkhoff": time_average,
        "space_average_expectation": space_average,
        "ergodic_gap_time_vs_space": ergodic_gap,
        "birkhoff_convergence": "time_avg -> space_avg as n -> infinity (Birkhoff's theorem)",
        "ergodicity_holds": all(g < 1.0 for g in ergodic_gap),
        "spectral_gap_estimate": round(random.uniform(0.01, 0.5), 4),
        "mixing_rate_estimate": round(random.uniform(0.01, 0.3), 4),
        "connection_to_layer51": "Invariant measure = stationary solution of Fokker-Planck (Layer 51)",
        "connection_to_layer50": "Ergodic average converges on Fisher-Rao manifold (Layer 50)",
        "connection_to_layer52": "Convergence rate measured by Wasserstein distance (Layer 52)",
        "computation_id": f"erg301_{stype.value}_{dim}_{n_steps}",
    }


def _mock_mixing_301(mtype: MixingType301, dim: int, n_observables: int) -> Dict[str, Any]:
    """Compute mixing coefficients and correlation decay for dynamical systems."""
    import math, random
    random.seed(hash(mtype.value) + dim * 100 + n_observables)
    n_obs = min(n_observables, 8)
    d = min(dim, 6)
    # mixing coefficients alpha(n): sup |P(A∩B) - P(A)P(B)| for sigma-algebra separation
    max_lag = 20
    alpha_coefficients = []
    rho_coefficients = []
    for lag in range(1, max_lag + 1):
        # alpha-mixing: typically exponential decay for nice systems
        alpha_val = round(random.uniform(0.5, 1.0) * math.exp(-0.2 * lag), 6)
        alpha_coefficients.append({"lag": lag, "alpha_n": alpha_val})
        # correlation decay
        rho_val = round(random.uniform(0.3, 0.8) * math.exp(-0.15 * lag), 6)
        rho_coefficients.append({"lag": lag, "rho_n": rho_val})
    # classify mixing strength
    is_strong = all(a["alpha_n"] < 0.1 for a in alpha_coefficients if a["lag"] >= 10)
    is_weak = all(a["alpha_n"] < 0.5 for a in alpha_coefficients if a["lag"] >= 15)
    # Rosenblatt condition for exactness
    tail_sigma_algebra = "trivial" if mtype in (MixingType301.exact_system, MixingType301.bernoulli_shift) else "nontrivial"
    # Kolmogorov automorphism (K-property): past determines nothing about future
    k_property = mtype == MixingType301.kolmogorov_automorphism
    return {
        "mixing_type": mtype.value,
        "dimension": dim,
        "n_observables": n_obs,
        "alpha_mixing_coefficients": alpha_coefficients[:10],
        "rho_correlation_decay": rho_coefficients[:10],
        "mixing_rate_alpha": round(random.uniform(0.1, 0.5), 4),
        "correlation_decay_rate": round(random.uniform(0.1, 0.4), 4),
        "is_strong_mixing": is_strong,
        "is_weak_mixing": is_weak,
        "is_exact_system": mtype == MixingType301.exact_system,
        "is_bernoulli": mtype == MixingType301.bernoulli_shift,
        "is_kolmogorov_automorphism": k_property,
        "tail_sigma_algebra": tail_sigma_algebra,
        "mixing_hierarchy": "Bernoulli => K-automorphism => strong mixing => weak mixing => ergodic",
        "observables_trace": [[round(random.gauss(0, 1), 4) for _ in range(d)] for _ in range(min(n_obs, 5))],
        "gelfand_naimark_spectrum": "spectrum of Koopman operator on L2(X,μ)",
        "connection_to_layer52": "Mixing rate = exponential decay of W2 distance to equilibrium (Layer 52)",
        "connection_to_layer51": "Alpha-mixing bounds via Lyapunov exponents of SDE (Layer 51)",
        "computation_id": f"mix301_{mtype.value}_{dim}_{n_observables}",
    }


def _mock_spectral_301(stype: SpectralAnalysis301, dim: int, resolution: int) -> Dict[str, Any]:
    """Spectral analysis of Koopman and transfer operators."""
    import math, random
    random.seed(hash(stype.value) + dim * 100 + resolution)
    d = min(dim, 8)
    n_freq = min(resolution, 20)
    # Koopman operator eigenvalues (unit circle for measure-preserving)
    koopman_eigenvalues = []
    for k in range(d):
        theta = round(random.uniform(0, 2 * math.pi), 4)
        koopman_eigenvalues.append({"mode": k, "eigenvalue": f"exp(i*{theta:.4f})", "frequency": round(theta / (2 * math.pi), 6), "magnitude": 1.0})
    # transfer operator eigenvalues (Perron-Frobenius, inside unit disk)
    transfer_eigenvalues = []
    for k in range(d):
        magnitude = round(random.uniform(0.1, 0.99), 4)
        theta = round(random.uniform(0, 2 * math.pi), 4)
        transfer_eigenvalues.append({"mode": k, "magnitude": magnitude, "phase": theta, "spectral_gap": round(1 - magnitude, 4)})
    # Lyapunov exponents
    lyapunov_exponents = [round(random.uniform(-2.0, 0.5), 4) for _ in range(d)]
    max_lyapunov = max(lyapunov_exponents)
    # spectral gap = 1 - |lambda_2| (determines mixing rate)
    spectral_gap = round(1 - max(ev["magnitude"] for ev in transfer_eigenvalues[1:]), 4) if len(transfer_eigenvalues) > 1 else 1.0
    # Fourier spectrum
    fourier_spectrum = []
    for k in range(n_freq):
        freq = round(k * 0.5, 4)
        power = round(random.uniform(0.01, 1.0) * math.exp(-0.1 * k), 6)
        phase = round(random.uniform(0, 2 * math.pi), 4)
        fourier_spectrum.append({"frequency": freq, "power": power, "phase": phase})
    return {
        "spectral_type": stype.value,
        "dimension": dim,
        "resolution": resolution,
        "koopman_eigenvalues": koopman_eigenvalues[:6],
        "transfer_eigenvalues": transfer_eigenvalues[:6],
        "spectral_gap": spectral_gap,
        "spectral_gap_interpretation": f"Mixing rate ~ exp(-{spectral_gap:.4f} * t) — controls convergence to equilibrium",
        "lyapunov_exponents": lyapunov_exponents,
        "max_lyapunov_exponent": max_lyapunov,
        "chaos_indicator": "chaotic" if max_lyapunov > 0 else "regular",
        "lyapunov_dimension": round(d - sum(1 for l in lyapunov_exponents if l < 0), 4) if any(l > 0 for l in lyapunov_exponents) else 0,
        "fourier_spectrum_sample": fourier_spectrum[:10],
        "correlation_decay_rate": round(random.uniform(0.05, 0.5), 4),
        "decay_type": "exponential" if spectral_gap > 0.1 else "polynomial",
        "resolvent_bound": round(random.uniform(0.5, 2.0), 4),
        "koopman_generators": f"Koopman operator U_T f = f o T on L2(R^{d})",
        "transfer_perron_frobenius": f"Transfer operator P_T mu = T_* mu on measures",
        "connection_to_layer50": "Spectral gap on Fisher-Rao manifold (Layer 50) controls gradient descent convergence",
        "connection_to_layer51": "Lyapunov exponents of SDE (Layer 51) determine ergodicity",
        "connection_to_layer52": "W2 mixing rate = transfer operator spectral gap (Layer 52)",
        "computation_id": f"spc301_{stype.value}_{dim}_{resolution}",
    }


def _mock_entropy_301(etype: EntropyProduction301, dim: int, n_partitions: int) -> Dict[str, Any]:
    """Compute various entropy measures for ergodic systems."""
    import math, random
    random.seed(hash(etype.value) + dim * 100 + n_partitions)
    d = min(dim, 6)
    n_part = min(n_partitions, 12)
    # Kolmogorov-Sinai entropy: h_mu(T) = sup_alpha H(T alpha | alpha)
    ks_entropy = round(random.uniform(0.1, 3.0), 4)
    # metric entropy (Shannon rate)
    metric_entropy = round(random.uniform(0.1, 2.5), 4)
    # topological entropy
    topological_entropy = round(random.uniform(0.5, 4.0), 4)
    # variational principle: h_top = sup_mu h_mu
    variational_gap = round(topological_entropy - metric_entropy, 4)
    # partition refinement entropy
    partition_entropy = []
    H_prev = 0
    for k in range(n_part):
        # H(T^{-k} alpha | V_{j=0}^{k-1} T^{-j} alpha) decreases
        H_cond = round(max(random.uniform(0.01, 0.5) * math.exp(-0.1 * k), 0.001), 6)
        H_prev += H_cond
        partition_entropy.append({"refinement_level": k, "conditional_entropy": H_cond, "cumulative": round(H_prev, 6)})
    # pressure function P(T, phi) = sup_mu (h_mu(T) + integral phi dmu)
    n_potentials = 5
    potentials = [round(random.uniform(-1, 1), 4) for _ in range(n_potentials)]
    pressure_values = [round(ks_entropy + p, 4) for p in potentials]
    # large deviation rate function
    rate_function_values = []
    for k in range(8):
        deviation = round(k * 0.2, 2)
        rate = round(max(0.5 * deviation**2 + random.uniform(-0.1, 0.1), 0), 4)
        rate_function_values.append({"deviation": deviation, "rate_I": rate})
    # entropy production rate (thermodynamic)
    entropy_production = round(random.uniform(0.1, 2.0), 4)
    return {
        "entropy_type": etype.value,
        "dimension": dim,
        "n_partitions": n_part,
        "kolmogorov_sinai_entropy": ks_entropy,
        "metric_entropy_h_mu": metric_entropy,
        "topological_entropy_h_top": topological_entropy,
        "variational_principle_gap": variational_gap,
        "variational_principle": "h_top(T) = sup_mu h_mu(T) over all T-invariant measures",
        "partition_entropy_refinement": partition_entropy[:8],
        "pressure_function": {"potentials": potentials, "pressure_values": pressure_values},
        "large_deviation_rate_function": rate_function_values,
        "entropy_production_rate": entropy_production,
        "entropy_production_formula": "dS/dt = integral (J · ∇(1/T)) dV >= 0 (second law)",
        "shannon_mcmillan_breiman": "lim (1/n) log mu(C_n(x)) = h_mu(T) for mu-a.e. x",
        " Sinai_Ruelle_Bowen": "SRB measure: max h_mu + integral log|det DT| dmu",
        "pesin_formula": "h_mu = sum positive Lyapunov exponents (for SRB measures)",
        "margulis_ruelle_inequality": "h_mu <= sum positive Lyapunov exponents",
        "connection_to_layer50": "KS entropy bounds Fisher information flow on manifold (Layer 50)",
        "connection_to_layer51": "Entropy production = rate of KL divergence growth in SDE (Layer 51)",
        "connection_to_layer52": "Entropy rate controls Wasserstein convergence speed (Layer 52)",
        "computation_id": f"ent301_{etype.value}_{dim}_{n_partitions}",
    }


def _mock_decomposition_301(dtype: ErgodicDecomposition301, dim: int, n_components: int) -> Dict[str, Any]:
    """Decompose invariant measures into ergodic (extremal) components."""
    import math, random
    random.seed(hash(dtype.value) + dim * 100 + n_components)
    d = min(dim, 6)
    n_comp = min(n_components, 8)
    # ergodic decomposition: mu = integral mu_x dmu(x) where mu_x are ergodic
    # Choquet theorem: every invariant measure = barycenter of ergodic measures
    component_weights_raw = [random.uniform(0.1, 1.0) for _ in range(n_comp)]
    total_w = sum(component_weights_raw)
    component_weights = [round(w / total_w, 6) for w in component_weights_raw]
    # each ergodic component has its own invariant distribution
    ergodic_components = []
    for k in range(n_comp):
        comp_pi_raw = [random.uniform(0.1, 1.0) for _ in range(d)]
        comp_pi_sum = sum(comp_pi_raw)
        comp_pi = [round(v / comp_pi_sum, 6) for v in comp_pi_raw]
        is_extremal = random.random() > 0.3
        ergodic_components.append({
            "component_id": k,
            "weight": component_weights[k],
            "invariant_distribution": comp_pi,
            "is_extremal": is_extremal,
            "is_pure_state": is_extremal and random.random() > 0.5,
            "entropy": round(random.uniform(0, 3.0), 4),
        })
    # overall invariant measure = weighted sum
    overall_mu = [round(sum(ec["weight"] * ec["invariant_distribution"][i] for ec in ergodic_components), 6) for i in range(d)]
    # Choquet simplex structure
    simplex_vertices = n_comp
    simplex_dimension = n_comp - 1
    # extreme points of the simplex
    extremal_points = [ec for ec in ergodic_components if ec["is_extremal"]]
    return {
        "decomposition_type": dtype.value,
        "dimension": dim,
        "n_components": n_comp,
        "component_weights": component_weights,
        "ergodic_components": ergodic_components,
        "overall_invariant_measure": overall_mu,
        "n_extremal_points": len(extremal_points),
        "choquet_simplex": {"vertices": simplex_vertices, "dimension": simplex_dimension},
        "choquet_theorem": "Every invariant measure is the barycenter of a probability measure on ergodic measures",
        "ergodic_decomposition_theorem": "mu(E) = integral mu_x(E) dmu(x) for mu_x ergodic",
        "pure_state_decomposition": "Quantum analogy: mixed states decompose into pure states",
        "extremal_measures_form_face": "Faces of the invariant measure simplex = sub-simplex of extremal measures",
        "krein_milman_theorem": "Compact convex set = closed convex hull of its extreme points",
        "barycenter_map": "mu -> integral mu_x dmu(x) maps probability measures to invariant measures",
        "connection_to_layer50": "Ergodic decomposition on Fisher-Rao manifold (Layer 50)",
        "connection_to_layer51": "Each ergodic component = stationary Fokker-Planck solution (Layer 51)",
        "connection_to_layer52": "Wasserstein barycenter of ergodic components (Layer 52)",
        "computation_id": f"dcp301_{dtype.value}_{dim}_{n_components}",
    }


def _mock_application_301(atype: ErgodicApplication301, n_samples: int, n_chains: int) -> Dict[str, Any]:
    """Apply ergodic theory to causal inference and sampling algorithms."""
    import math, random
    random.seed(hash(atype.value) + n_samples + n_chains)
    if atype == ErgodicApplication301.markov_monte_carlo:
        # MCMC convergence analysis
        n_ch = min(n_chains, 6)
        burn_in = max(n_samples // 5, 100)
        effective_sample_size = round(n_samples * random.uniform(0.3, 0.8), 0)
        gelman_rubin_rhat = round(random.uniform(0.95, 1.15), 4)
        chain_means = [[round(random.gauss(0, 0.5), 4) for _ in range(3)] for _ in range(n_ch)]
        chain_variances = [[round(random.uniform(0.5, 2.0), 4) for _ in range(3)] for _ in range(n_ch)]
        return {
            "application_type": atype.value,
            "n_samples": n_samples,
            "n_chains": n_ch,
            "burn_in_period": burn_in,
            "effective_sample_size": effective_sample_size,
            "ess_per_sample": round(effective_sample_size / n_samples, 4),
            "gelman_rubin_rhat": gelman_rubin_rhat,
            "convergence_diagnostic": "converged" if gelman_rubin_rhat < 1.1 else "not converged",
            "chain_means": chain_means,
            "chain_variances": chain_variances,
            "mixing_time_bound": round(random.uniform(50, 500), 0),
            "spectral_gap_mcmc": round(random.uniform(0.01, 0.2), 4),
            "ergodic_theorem_guarantee": "MCMC estimate -> E_pi[f] as n -> infinity by Birkhoff's theorem",
        }
    elif atype == ErgodicApplication301.sampling_convergence:
        # Convergence rate analysis for sampling algorithms
        w2_convergence_rate = round(random.uniform(0.01, 0.1), 4)
        tv_convergence_rate = round(random.uniform(0.02, 0.15), 4)
        return {
            "application_type": atype.value,
            "n_samples": n_samples,
            "w2_convergence_rate": w2_convergence_rate,
            "tv_convergence_rate": tv_convergence_rate,
            "convergence_w2_formula": f"W2(mu_t, pi) <= {round(random.uniform(0.5, 2.0), 2)} * exp(-{w2_convergence_rate} * t)",
            "convergence_tv_formula": f"||mu_t - pi||_TV <= {round(random.uniform(0.5, 2.0), 2)} * exp(-{tv_convergence_rate} * t)",
            "mixing_time_w2": round(math.log(n_samples) / max(w2_convergence_rate, 0.001), 0),
            "mixing_time_tv": round(math.log(n_samples) / max(tv_convergence_rate, 0.001), 0),
            "coupling_argument": "Total variation convergence via maximal coupling (Aldous bound)",
            "relation_to_layer52": f"W2 convergence rate from Layer 52 optimal transport",
        }
    elif atype == ErgodicApplication301.causal_stability:
        # Ergodic-theoretic stability of causal inferences
        return {
            "application_type": atype.value,
            "n_samples": n_samples,
            "n_causal_variables": n_chains,
            "ergodic_causal_stability": "Causal effects estimable from time averages when system is ergodic",
            "intervention_convergence": round(random.uniform(0.8, 0.99), 4),
            "observational_equivalence": "Ergodic systems may have multiple causal structures with same long-run behavior",
            "mixing_causal_discovery": "Strong mixing enables consistent causal structure learning from time series",
            "sensitivity_to_non_ergodicity": round(random.uniform(0.01, 0.2), 4),
            "birkhoff_for_do_calculus": "do(P(X)) estimable via time averages in ergodic regime",
        }
    elif atype == ErgodicApplication301.phase_transition:
        # Phase transitions in ergodic systems
        n_phases = min(n_chains, 4)
        critical_temperatures = [round(random.uniform(1.0, 5.0), 2) for _ in range(n_phases)]
        return {
            "application_type": atype.value,
            "n_samples": n_samples,
            "n_phases": n_phases,
            "critical_temperatures": critical_temperatures,
            "ergodicity_breaking": "Phase transition = ergodicity breaking (system trapped in one ergodic component)",
            "free_energy_barrier": round(random.uniform(1.0, 10.0), 2),
            "spontaneous_symmetry_breaking": True,
            "lee_yang_zeros": "Zeros of partition function approach real axis at critical temperature",
            "order_parameter": round(random.uniform(0, 1), 4),
            "susceptibility": round(random.uniform(0.1, 10.0), 4),
            "correlation_length": round(random.uniform(1.0, 50.0), 2),
            "divergence_at_critical": "correlation_length, susceptibility -> infinity at T_c",
        }
    elif atype == ErgodicApplication301.random_matrix:
        # Random matrix theory and ergodic properties
        matrix_size = min(n_chains, 8)
        eigenvalues = sorted([round(random.gauss(0, 1.0 / math.sqrt(matrix_size)), 4) for _ in range(matrix_size)])
        wigner_semicircle = [round(math.sqrt(max(0, 2 - x**2)) / math.pi, 4) for x in [round(-2 + 4 * k / matrix_size, 2) for k in range(matrix_size)]]
        return {
            "application_type": atype.value,
            "n_samples": n_samples,
            "matrix_size": matrix_size,
            "eigenvalues_sample": eigenvalues,
            "wigner_semicircle_law": wigner_semicircle,
            "level_spacing_distribution": "GOE: P(s) = (pi/2) * s * exp(-pi*s^2/4)",
            "spectral_rigidity": round(random.uniform(0.01, 0.5), 4),
            "trace_formula": "Tr(T^n) = sum eigenvalues^n — connects to ergodic sums",
            "gue_statistics": "Quantum chaos = classical chaos when system is ergodic",
        }
    else:
        return {
            "application_type": atype.value,
            "n_samples": n_samples,
            "n_chains": n_chains,
            "ai_ergodic_result": "neural ergodic system with learned invariant measure",
            "estimated_spectral_gap": round(random.uniform(0.01, 0.5), 4),
            "model_parameters": round(random.uniform(1e5, 1e7), 0),
        }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/graph/ergodic-theory/system")
async def system_301(
    system_type: ErgodicSystem301 = Query(ErgodicSystem301.markov_chain),
    dimension: int = Query(4, ge=1, le=100),
    n_steps: int = Query(100, ge=10, le=10000),
):
    key = f"{system_type.value}_{dimension}_{n_steps}"
    if key in _system_301_cache:
        return _system_301_cache[key]
    result = _mock_system_301(system_type, dimension, n_steps)
    _system_301_cache[key] = result
    return result


@router.post("/graph/ergodic-theory/mixing")
async def mixing_301(
    mixing_type: MixingType301 = Query(MixingType301.strong_mixing),
    dimension: int = Query(4, ge=1, le=100),
    n_observables: int = Query(6, ge=2, le=50),
):
    key = f"{mixing_type.value}_{dimension}_{n_observables}"
    if key in _mixing_301_cache:
        return _mixing_301_cache[key]
    result = _mock_mixing_301(mixing_type, dimension, n_observables)
    _mixing_301_cache[key] = result
    return result


@router.post("/graph/ergodic-theory/spectral")
async def spectral_301(
    spectral_type: SpectralAnalysis301 = Query(SpectralAnalysis301.transfer_operator),
    dimension: int = Query(4, ge=1, le=100),
    resolution: int = Query(20, ge=5, le=200),
):
    key = f"{spectral_type.value}_{dimension}_{resolution}"
    if key in _spectral_301_cache:
        return _spectral_301_cache[key]
    result = _mock_spectral_301(spectral_type, dimension, resolution)
    _spectral_301_cache[key] = result
    return result


@router.post("/graph/ergodic-theory/entropy")
async def entropy_301(
    entropy_type: EntropyProduction301 = Query(EntropyProduction301.kolmogorov_sinai),
    dimension: int = Query(4, ge=1, le=100),
    n_partitions: int = Query(8, ge=2, le=50),
):
    key = f"{entropy_type.value}_{dimension}_{n_partitions}"
    if key in _entropy_301_cache:
        return _entropy_301_cache[key]
    result = _mock_entropy_301(entropy_type, dimension, n_partitions)
    _entropy_301_cache[key] = result
    return result


@router.post("/graph/ergodic-theory/decomposition")
async def decomposition_301(
    decomposition_type: ErgodicDecomposition301 = Query(ErgodicDecomposition301.ergodic_components),
    dimension: int = Query(4, ge=1, le=100),
    n_components: int = Query(5, ge=2, le=20),
):
    key = f"{decomposition_type.value}_{dimension}_{n_components}"
    if key in _decomposition_301_cache:
        return _decomposition_301_cache[key]
    result = _mock_decomposition_301(decomposition_type, dimension, n_components)
    _decomposition_301_cache[key] = result
    return result


@router.post("/graph/ergodic-theory/application")
async def application_301(
    application_type: ErgodicApplication301 = Query(ErgodicApplication301.markov_monte_carlo),
    n_samples: int = Query(1000, ge=100, le=100000),
    n_chains: int = Query(4, ge=1, le=20),
):
    key = f"{application_type.value}_{n_samples}_{n_chains}"
    if key in _application_301_cache:
        return _application_301_cache[key]
    result = _mock_application_301(application_type, n_samples, n_chains)
    _application_301_cache[key] = result
    return result


@router.get("/graph/ergodic-theory/overview")
async def ergodic_theory_overview_301():
    return {
        "layer": 53,
        "version": "v1.301.0",
        "engine": "Causal Ergodic Theory & Mixing Dynamics Engine",
        "description": "因果遍历理论与混合动力学引擎 — Birkhoff遍历定理、混合层次、Koopman/转移算子谱分析、Kolmogorov-Sinai熵、遍历分解、Choquet单纯形、MCMC收敛、相变",
        "enums": {
            "ErgodicSystem301": [e.value for e in ErgodicSystem301],
            "MixingType301": [e.value for e in MixingType301],
            "SpectralAnalysis301": [e.value for e in SpectralAnalysis301],
            "EntropyProduction301": [e.value for e in EntropyProduction301],
            "ErgodicDecomposition301": [e.value for e in ErgodicDecomposition301],
            "ErgodicApplication301": [e.value for e in ErgodicApplication301],
        },
        "enum_count": 36,
        "endpoints": [
            {"method": "POST", "path": "/graph/ergodic-theory/system", "desc": "遍历系统模拟"},
            {"method": "POST", "path": "/graph/ergodic-theory/mixing", "desc": "混合系数"},
            {"method": "POST", "path": "/graph/ergodic-theory/spectral", "desc": "谱分析"},
            {"method": "POST", "path": "/graph/ergodic-theory/entropy", "desc": "熵产生"},
            {"method": "POST", "path": "/graph/ergodic-theory/decomposition", "desc": "遍历分解"},
            {"method": "POST", "path": "/graph/ergodic-theory/application", "desc": "遍历应用"},
            {"method": "GET",  "path": "/graph/ergodic-theory/overview", "desc": "系统总览"},
        ],
        "endpoint_count": 7,
        "config_space": 6**6,
        "cache_stats": {
            "system": len(_system_301_cache),
            "mixing": len(_mixing_301_cache),
            "spectral": len(_spectral_301_cache),
            "entropy": len(_entropy_301_cache),
            "decomposition": len(_decomposition_301_cache),
            "application": len(_application_301_cache),
        },
    }

'''

if __name__ == "__main__":
    with open(BACKEND_FILE, "a", encoding="utf-8") as f:
        f.write(APPENDIX)
    size = os.path.getsize(BACKEND_FILE)
    print(f"Layer 53 (v1.301) appended to knowledge_graph.py -- new size: {size:,} bytes")
