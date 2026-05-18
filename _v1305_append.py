#!/usr/bin/env python3
"""
DeerFlow Agent Platform — Layer 57 Append Script
Superconformal Field Theory (SCFT) Engine
(超共形场论引擎)
Version: v1.305.0

Appends to: backend/app/gateway/routers/knowledge_graph.py

Enums (6 × 6 = 36 values):
  SuperVirasoroRep305, BPSState305, SusyType305,
  SeibergWitten305, SuperconformalIndex305, NonRenormalization305

Endpoints (7):
  POST /graph/superconformal/{supervirasoro,bps,susy,seiberg-witten,index,non-renormalization}
  GET  /graph/superconformal/overview
"""

import os

BACKEND_FILE = os.path.join(
    os.path.dirname(__file__),
    "backend", "app", "gateway", "routers", "knowledge_graph.py",
)

APPENDIX = r'''

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Layer 57 — Superconformal Field Theory (SCFT) Engine (v1.305)            ║
# ║  超共形场论引擎                                                            ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# ── Enums ─────────────────────────────────────────────────────────────────────

class SuperVirasoroRep305(str, Enum):
    ns_sector = "ns_sector"
    r_sector = "r_sector"
    bps_short = "bps_short"
    non_unitary = "non_unitary"
    extended_n2 = "extended_n2"
    ai_supervirasoro = "ai_supervirasoro"

class BPSState305(str, Enum):
    half_bps = "half_bps"
    quarter_bps = "quarter_bps"
    eighth_bps = "eighth_bps"
    marginal = "marginal"
    threshold = "threshold"
    ai_bps = "ai_bps"

class SusyType305(str, Enum):
    n1_susy = "n1_susy"
    n2_seiberg_witten = "n2_seiberg_witten"
    n4_sym = "n4_sym"
    n8_sugra = "n8_sugra"
    extended_susy = "extended_susy"
    ai_susy = "ai_susy"

class SeibergWitten305(str, Enum):
    sw_curve = "sw_curve"
    sw_differential = "sw_differential"
    sw_monodromy = "sw_monodromy"
    sw_singularity = "sw_singularity"
    sw_moduli = "sw_moduli"
    ai_seiberg_witten = "ai_seiberg_witten"

class SuperconformalIndex305(str, Enum):
    schur_index = "schur_index"
    macdonald_index = "macdonald_index"
    hall_littlewood = "hall_littlewood"
    cardioid_limit = "cardioid_limit"
    casimir_energy = "casimir_energy"
    ai_index = "ai_index"

class NonRenormalization305(str, Enum):
    holomorphy = "holomorphy"
    r_symmetry = "r_symmetry"
    topology = "topology"
    anomaly_matching = "anomaly_matching"
    a_theorem = "a_theorem"
    ai_nonrenorm = "ai_nonrenorm"

# ── Caches ────────────────────────────────────────────────────────────────────

_supervirasoro_305_cache: dict = {}
_bps_305_cache: dict = {}
_susy_305_cache: dict = {}
_seiberg_witten_305_cache: dict = {}
_index_305_cache: dict = {}
_nonrenorm_305_cache: dict = {}

# ── Mock Data Generators ─────────────────────────────────────────────────────

def _mock_supervirasoro_305(sector: SuperVirasoroRep305, central_charge: float, n_supersymmetry: int) -> dict:
    import random, math, time
    random.seed(int(time.time() * 1000) % (2**31))
    sector_desc = {
        "ns_sector": "Neveu-Schwarz: G_r with r∈ℤ+1/2, G_{-1/2}|h⟩=0 (annihilation), highest weight in NS vacuum",
        "r_sector": "Ramond: G_r with r∈ℤ, zero mode G₀|h⟩=0 → massless fermions, ground state degeneracy",
        "bps_short": "Short multiplet: saturate BPS bound E=|R-charge|, fewer descendants, protected operators",
        "non_unitary": "Non-unitary SCFT: negative norm states, logarithmic partner, c < 0 or negative central term",
        "extended_n2": "N=2 extended: L_n + G^±_r + J_m, U(1) R-symmetry, chiral/anti-chiral rings, spectral flow",
        "ai_supervirasoro": "V_AI^SUSY = NN(c, N, sector; θ) — learned super-Virasoro representation",
    }[sector.value]
    # Generate superconformal descendants
    descendants = []
    for n in range(1, min(n_supersymmetry + 4, 8)):
        descendants.append({
            "level": n,
            "bosonic_basis": [f"L_{{-{a}}}" for a in range(1, n + 1)],
            "fermionic_basis": [f"G^{{+/-}}_{{-{a-0.5}}}" for a in range(1, n + 1)],
            "super_dim": n * n_supersymmetry + random.randint(1, n),
        })
    # BPS bounds
    bps_bounds = []
    for i in range(min(n_supersymmetry, 4)):
        bps_bounds.append({
            "susy_fraction": f"{1}/{2**(i+1)}-BPS",
            "energy_bound": round(central_charge / (6 * (2**i)), 4),
            "multiplet_type": random.choice(["short", "semi-short", "long"]),
            "protected": random.choice([True, False]),
        })
    return {
        "sector": sector.value,
        "central_charge": central_charge,
        "n_supersymmetry": n_supersymmetry,
        "description": sector_desc,
        "super_virasoro_algebra": {
            "bosonic_commutation": "[L_m, L_n] = (m-n)L_{m+n} + c/12·m(m²-1)δ_{m+n,0}",
            "fermionic_anticommutation": f"{{G_r^+, G_s^-}} = 2L_{{r+s}} + (r-s)·(c/3)δ_{{r+s,0}}",
            "mixed_commutation": "[L_m, G_r] = (m/2 - r)G_{m+r}",
            "r_symmetry": f"[J_m, J_n] = (c/3)mδ_{{m+n,0}}" if n_supersymmetry >= 2 else "N/A",
            "spectral_flow": f"α-flow: L_m → L_m + αJ_m + cα²/6δ_{{m,0}}, G_r → G_{{r+α}}",
        },
        "descendant_structure": descendants,
        "bps_bounds": bps_bounds,
        "ns_r_partition": {
            "ns_vacuum": f"|0⟩_NS: L_n|0⟩=0 (n≥-1), G_r|0⟩=0 (r≥-1/2)",
            "r_ground": f"|α⟩_R: G_0|α⟩=0, degeneracy = 2^{{⌊N/2⌋}}",
            "supertrace": "Tr_NS(-1)^F q^{L0-c/24} = 0 (supersymmetry index)",
        },
        "unitarity_bounds": {
            "c ≥ 3/2 (N=1)": "super-Virasoro unitarity bound",
            "h ≥ (c-1)/16 (NS)": "NS sector conformal weight bound",
            "h ≥ c/24 (R)": "R sector ground state energy",
        },
        "metadata": {"layer": 57, "version": "v1.305.0", "engine": "Superconformal Field Theory (SCFT)"},
    }

def _mock_bps_305(bps_type: BPSState305, dimension: float, n_charges: int) -> dict:
    import random, math, time
    random.seed(int(time.time() * 1000) % (2**31))
    bps_desc = {
        "half_bps": "1/2-BPS: Δ = |R|, saturate M/2 susy charges, chiral primary OPE ring (N=4 SYM)",
        "quarter_bps": "1/4-BPS: Δ = f(R₁,R₂), 3/4 of susy broken, F-term condition in N=2",
        "eighth_bps": "1/8-BPS: Δ = f(R₁,R₂,R₃), 7/8 of susy broken, N=4 1/8-BPS sector",
        "marginal": "Marginal BPS: Δ=4 (d=4), exactly marginal deformations, conformal manifold",
        "threshold": "Threshold bound state: Δ = Σ Δ_i at threshold, multi-particle BPS states",
        "ai_bps": "BPS_AI = NN(dimension, charges; θ) — learned BPS state classification",
    }[bps_type.value]
    # Generate BPS state spectrum
    bps_spectrum = []
    for i in range(min(n_charges, 8)):
        bps_spectrum.append({
            "state": f"BPS_{i}",
            "delta": round(dimension * (i + 1) / max(n_charges, 1), 4),
            "r_charges": [round(random.uniform(0, dimension), 4) for _ in range(min(n_charges, 4))],
            "susy_preserved": f"{random.randint(1, 8)}/8",
            "shortening_type": random.choice(["A-type", "B-type", "L-type", "none"]),
            "protected": random.choice([True, True, False]),
        })
    return {
        "bps_type": bps_type.value,
        "scaling_dimension": dimension,
        "n_charges": n_charges,
        "description": bps_desc,
        "bps_condition": {
            "general": "M = |Z| where Z = Σ n_i q_i (central charge from susy algebra)",
            "susy_algebra": "{Q, Q̄} = γ^μ P_μ δ + Z (central extension)",
            "bound_saturated": "Δ = |R-charge| for chiral primaries",
            "index_theorem": "Tr(-1)^F e^{-βH} = BPS index (independent of β)",
        },
        "bps_spectrum": bps_spectrum,
        "wall_crossing": {
            "phenomenon": "BPS states jump across walls of marginal stability in moduli space",
            "ks_wall_crossing": "Kontsevich-Soibelman wall-crossing formula for BPS invariants",
            "denef": "Denef: multicenter bound states exist iff Σ Γ_i · Γ_j > 0 for all pairs",
            "stability": "Π-stability in derived category ↔ BPS stability ↔ Θ-stability",
        },
        "operator_product": {
            "chiral_ring": "C(x,y) = Σ_i x^{Δ_i} y^{R_i} — chiral primary OPE ring",
            "topological_twist": "A-twist / B-twist → topological correlation functions",
            "protected_sector": "BPS operators protected from quantum corrections",
        },
        "metadata": {"layer": 57, "version": "v1.305.0", "engine": "Superconformal Field Theory (SCFT)"},
    }

def _mock_susy_305(susy_type: SusyType305, n_generators: int, coupling: float) -> dict:
    import random, math, time
    random.seed(int(time.time() * 1000) % (2**31))
    susy_desc = {
        "n1_susy": "N=1 SUSY: 2 supercharges (Q_α, Q̄_̇α), superpotential W, R-symmetry U(1)_R",
        "n2_seiberg_witten": "N=2 SUSY: 4 supercharges, hypermultiplets + vector multiplets, Seiberg-Witten curve y²=(x-Λ²)(x-⟨φ⟩²)",
        "n4_sym": "N=4 SYM: 8 supercharges, SU(N_c) gauge, β=0 conformal, AdS/CFT duality with AdS₅×S⁵",
        "n8_sugra": "N=8 SUGRA: 32 supercharges, maximal susy in d=4, E₇₇ symmetry, UV finiteness conjecture",
        "extended_susy": "N>1: extended susy algebra, R-symmetry SU(N)_R, non-renormalization theorems",
        "ai_susy": "SUSY_AI = NN(generators, coupling; θ) — learned supersymmetry classification",
    }[susy_type.value]
    # Generate supercharge structure
    supercharges = []
    for i in range(min(n_generators, 8)):
        supercharges.append({
            "generator": f"Q^{i+1}_α",
            "spin": 0.5,
            "r_charge": round(random.uniform(-1, 1), 4),
            "automorphism": f"SU({n_generators})_R",
            "central_extension": round(random.uniform(0, coupling), 4) if n_generators > 1 else 0,
        })
    return {
        "susy_type": susy_type.value,
        "n_generators": n_generators,
        "coupling": coupling,
        "description": susy_desc,
        "susy_algebra": {
            "anticommutator": "{Q^I_α, Q̄^J_̇β} = 2δ^{IJ}σ^μ_{α̇β}P_μ + ε_{α̇β}Z^{IJ}",
            "commutator": "[P_μ, Q^I_α] = 0, [M_{μν}, Q^I_α] = (σ_{μν})_α^β Q^I_β",
            "r_symmetry": f"SU({n_generators})_R automorphism of susy algebra" if n_generators > 1 else "U(1)_R",
            "central_charges": f"Z^{{IJ}} = -Z^{{JI}} ∈ ℂ, {n_generators*(n_generators-1)//2} independent" if n_generators > 1 else "none",
        },
        "supercharges": supercharges,
        "multiplet_structure": {
            "vector_multiplet": "(A_μ, λ^I, φ^{[IJ]}) — gauge boson + gauginos + scalars",
            "chiral_multiplet": "(φ, ψ_α) — complex scalar + Weyl fermion",
            "hyper_multiplet": "(φ_I, ψ_α) — doublet of chiral multiplets (N=2)",
            "gravity_multiplet": "(g_{μν}, ψ^I_μα) — graviton + gravitinos" if n_generators >= 4 else "N/A",
        },
        "duality_structure": {
            "montonen_olive": "N=4 SYM: electric ↔ magnetic S-duality, g → 1/g, SL(2,ℤ)",
            "seiberg_duality": "N=1: Seiberg dual gauge group G^D, mesons + baryons",
            "mirror_symmetry": "N=2: mirror pairs of SCFTs, Higgs ↔ Coulomb branch exchange",
            "ads_cft": "N=4 SYM(d=4) ↔ Type IIB AdS₅×S⁵ (g_YM² ↔ 1/g_s, N ↔ N D3-branes)" if n_generators >= 4 else "N/A",
        },
        "beta_function": {
            "n1_beta": "β(g) = -g³/(16π²)(3C₂(G)-ΣT(R_i)) + NLO",
            "n2_beta": "β(g) = 0 for N=2 (one-loop exact vanishing for vector multiplets)",
            "n4_beta": "β(g) = 0 exactly — N=4 SYM is conformal for all g",
            "nsvz_beta": "β(g) = -g³/(16π²) · 3C₂(G)-ΣT(R_i)(1-γ_i)/ (1-g²C₂(G)/(8π²))",
        },
        "metadata": {"layer": 57, "version": "v1.305.0", "engine": "Superconformal Field Theory (SCFT)"},
    }

def _mock_seiberg_witten_305(sw_type: SeibergWitten305, gauge_rank: int, n_flavors: int) -> dict:
    import random, math, time
    random.seed(int(time.time() * 1000) % (2**31))
    sw_desc = {
        "sw_curve": "y² = P(x,u) = Π(x-e_i(u)) — Seiberg-Witten elliptic curve, u=⟨Trφ²⟩ moduli",
        "sw_differential": "λ_SW = (√P(x,u)/x)dx — Seiberg-Witten differential, dλ_SW = 0 at BPS",
        "sw_monodromy": "M = (a,b;c,d) ∈ SL(2,ℤ) — monodromy around u=∞, u=±Λ² singularities",
        "sw_singularity": "u=±Λ²: massless monopole/dyon, strongly coupled, new massless degrees of freedom",
        "sw_moduli": "u = ⟨Trφ²⟩ ∈ ℂ — Coulomb branch moduli, a(u) = ∮_A λ_SW, a_D(u) = ∮_B λ_SW",
        "ai_seiberg_witten": "SW_AI = NN(rank, flavors; θ) — learned Seiberg-Witten geometry",
    }[sw_type.value]
    # Generate monodromy data
    monodromies = []
    for i in range(min(gauge_rank + n_flavors, 6)):
        monodromies.append({
            "point": f"u_{i}",
            "M": [[random.randint(-2, 2), random.randint(-2, 2)],
                  [random.randint(-2, 2), random.randint(-2, 2)]],
            "physical_interpretation": random.choice(["massless monopole", "massless dyon", "conformal point", "Higgs branch root"]),
            "bps_state": f"(n_m, n_e) = ({random.randint(0, 3)}, {random.randint(0, 3)})",
        })
    return {
        "sw_type": sw_type.value,
        "gauge_rank": gauge_rank,
        "n_flavors": n_flavors,
        "description": sw_desc,
        "sw_curve_data": {
            "general_form": f"y² = x³ - u·x² + Λ^{{2{gauge_rank}-{n_flavors}}}·x" if gauge_rank <= 2 else f"y² = P_{gauge_rank}(x, u, Λ)",
            "discriminant": f"Δ(u) = Π_i (u - u_i) where u_i are BPS singularities",
            "genus": 1 if gauge_rank == 1 else gauge_rank,
            "j_invariant": f"j(τ) = 1728·g₂³/(g₂³-27g₃²) → modular parameter of the curve",
        },
        "special_geometry": {
            "period_integrals": "a_i(u) = ∮_{A_i} λ_SW, a_{D,i}(u) = ∮_{B_i} λ_SW",
            "prepotential": "F(a) = i/(2π) · a²·ln(a²/Λ²) + Σ F_k · a² · (Λ/a)^{2k}",
            "kahler_metric": "g_{ij} = Im(τ_{ij}), τ_{ij} = ∂a_{D,i}/∂a_j (period matrix)",
            "special_coordinates": "(a_i, a_{D,i}) = (a_i, ∂F/∂a_i) on Coulomb branch",
        },
        "monodromy_data": monodromies,
        "effective_action": {
            "low_energy": "N=2 U(1)^r gauge theory on Coulomb branch with effective coupling τ_ij(u)",
            "prepotential": "ℱ = ℱ_pert + ℱ_inst, ℱ_inst = Σ_k F_k · q^k, q = e^{2πiτ}",
            "instanton_corrections": "Nekrasov partition function Z(a,ε₁,ε₂) = exp(ℱ/ε₁ε₂)",
            "agyf": "a_D = ∂ℱ/∂a → τ_eff = ∂²ℱ/∂a² (effective coupling from prepotential)",
        },
        "connections": {
            "ads_cft": "SW curve ↔ integrable system ↔ AdS geometry (gauge/gravity duality)",
            "integrable_system": "Hitchin system: Higgs field φ → spectral curve = SW curve",
            "topological_string": "ℱ_inst = F_top(CY₃) — SW prepotential = topological string free energy",
        },
        "metadata": {"layer": 57, "version": "v1.305.0", "engine": "Superconformal Field Theory (SCFT)"},
    }

def _mock_index_305(index_type: SuperconformalIndex305, n_charges: int, fugacity_dim: int) -> dict:
    import random, math, time
    random.seed(int(time.time() * 1000) % (2**31))
    index_desc = {
        "schur_index": "I_S(q) = Tr(-1)^F q^{{2J₁₂-R}} p=0, protected by N=2 susy, 2d chiral algebra",
        "macdonald_index": "I_M(q,t) = Tr(-1)^F q^{{2J₁₂-R}} t^{{R-2J₃}}, Macdonald polynomial reduction",
        "hall_littlewood": "I_HL(t) = Tr(-1)^F t^{{R-2J₃}} q→0 limit, Hall-Littlewood polynomials",
        "cardioid_limit": "I_card = lim_{τ→τ₀} I(τ) along cardioid curve, Cardy-like growth exp(c·√Δ)",
        "casimir_energy": "E_c = -lim_{β→0} log Z(β)/β — Casimir energy from superconformal algebra",
        "ai_index": "I_AI = NN(charges, fugacity; θ) — learned superconformal index",
    }[index_type.value]
    # Generate index coefficients
    fugacity_rings = []
    for k in range(min(fugacity_dim, 6)):
        coeffs = [round(random.uniform(-2, 2), 4) for _ in range(min(n_charges, 8))]
        fugacity_rings.append({
            "monomial": f"q^{k}",
            "coefficients": coeffs,
            "selection_rule": random.choice(["BPS only", "protected sector", "chiral ring"]),
            "multiplicity": sum(1 for c in coeffs if abs(c) > 0.1),
        })
    return {
        "index_type": index_type.value,
        "n_charges": n_charges,
        "fugacity_dim": fugacity_dim,
        "description": index_desc,
        "index_definition": {
            "general": "I = Tr(-1)^F e^{-βδ} Π_i x_i^{f_i} — supersymmetric Witten index",
            "independence": "I independent of β (susy protection) → counts BPS states weighted by fugacities",
            "factorization": "I = I_vector × I_matter — factorizes into single-particle indices",
            "plethystic": "I = PE[ι] = exp(Σ_{n=1}^∞ ι(x^n)/n) — plethystic exponential of single-particle",
        },
        "fugacity_data": fugacity_rings,
        "macdonald_theory": {
            "hall_littlewood_limit": "q→0: Macdonald → Hall-Littlewood, t-deformed Schur",
            "schur_limit": "t=q: Macdonald → Schur, connection to 2d chiral algebra (Beem et al.)",
            "characters": "I = Σ d_λ χ_λ^{Mac}(q,t) — expansion in Macdonald characters",
            "hilbert_series": "I(q=1,t=1) = Hilbert series of chiral ring (infinite for SCFTs)",
        },
        "cardy_behavior": {
            "high_temperature": "log I ~ exp(c·√Δ) — Cardy-like growth from high-T limit",
            "casimir_energy": f"E_c = {round(random.uniform(-10, 0), 4)} — vacuum energy from SUSY algebra",
            "entropy_matching": "S_BH = log I(x→1) ↔ Bekenstein-Hawking entropy of dual black hole",
        },
        "dualities_index": {
            "ads_cft_check": "I_SCFT = I_gravity: superconformal index ↔ giant graviton index in AdS",
            "seiberg_duality": "I_dual = I_original: Seiberg duality verified via index matching",
            "s_duality": "I(q,t) invariant under S-duality transformation of gauge group",
        },
        "metadata": {"layer": 57, "version": "v1.305.0", "engine": "Superconformal Field Theory (SCFT)"},
    }

def _mock_nonrenorm_305(nr_type: NonRenormalization305, perturbation_order: int, n_operators: int) -> dict:
    import random, math, time
    random.seed(int(time.time() * 1000) % (2**31))
    nr_desc = {
        "holomorphy": "Superpotential W is holomorphic → non-renormalization: W_tree = W_eff (no pert. corrections)",
        "r_symmetry": "U(1)_R selection rules → superpotential terms carry R-charge 2 → constrained by symmetry",
        "topology": "Topological sectors: A-twist → correlators independent of metric (topological invariants)",
        "anomaly_matching": "'t Hooft anomaly matching: Tr(R³), Tr(R), Tr(R·F²) matched across dualities",
        "a_theorem": "a_UV ≥ a_IR: a-anomaly (a = 3/16·Tr R³ + ...) non-increasing along RG flow (4d c-theorem)",
        "ai_nonrenorm": "NR_AI = NN(order, operators; θ) — learned non-renormalization theorem verifier",
    }[nr_type.value]
    # Generate anomaly coefficients
    anomalies = []
    for i in range(min(n_operators, 6)):
        anomalies.append({
            "operator": f"O_{i}",
            "r_charge": round(random.uniform(0, 2), 4),
            "anomaly_coeff": round(random.uniform(-5, 5), 4),
            "selection_rule": random.choice(["R-charge = 2", "R-charge ≠ 2 → forbidden", "marginal if Δ=4"]),
            "protected": random.choice([True, False]),
        })
    return {
        "nr_type": nr_type.value,
        "perturbation_order": perturbation_order,
        "n_operators": n_operators,
        "description": nr_desc,
        "nonrenormalization_theorem": {
            "statement": "Protected operators do not receive quantum corrections beyond specified order",
            "holomorphic_protection": "W_eff = W_tree + non-perturbative (instanton) corrections only",
            "perturbative_vanishing": f"All perturbative corrections at order > {perturbation_order} vanish by symmetry",
            "exact_results": "Exact β-function (NSVZ), exact superpotential from symmetries + holomorphy",
        },
        "anomaly_matching": {
            "thooft_condition": "Tr(R³) and Tr(R) must match between UV theory and any dual description",
            "gauge_anomaly": "Tr(T^a{T^b,T^c}) = 0 for anomaly-free gauge theory",
            "gravity_anomaly": "Tr(R) = 0 for consistent theory on curved space",
            "global_anomaly": "ABJ anomaly: U(1)_A broken by instantons → η' mass via Witten-Veneziano",
        },
        "anomaly_coefficients": anomalies,
        "a_theorem_data": {
            "a_anomaly": "a = 3/16(3Tr R³ - Tr R) — conformal anomaly a-coefficient",
            "c_anomaly": "c = 1/16(9Tr R³ - 5Tr R) — conformal anomaly c-coefficient",
            "a_theorem": "a_UV ≥ a_IR — 4d version of c-theorem (Komargodski-Schwimmer proof)",
            "a_maximization": "a(α) → maximize over R-charges to find superconformal R-symmetry",
        },
        "exact_beta_function": {
            "nsvz": "β(g) = -g³/(16π²)·[3C₂(G)-Σ T(R_i)(1-γ_i)] / [1-g²C₂(G)/(8π²)]",
            "exact_superpotential": "W_eff = W_tree + Λ^b₀ · f(μ/Λ) (non-perturbative only)",
            "konishi_anomaly": "δW/δφ = Σ loop corrections → Ward identity for SUSY",
        },
        "metadata": {"layer": 57, "version": "v1.305.0", "engine": "Superconformal Field Theory (SCFT)"},
    }

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/graph/superconformal/supervirasoro")
async def supervirasoro_305(
    sector: SuperVirasoroRep305 = Query(SuperVirasoroRep305.ns_sector),
    central_charge: float = Query(1.5, ge=-100, le=100),
    n_supersymmetry: int = Query(2, ge=1, le=8),
):
    key = f"{sector.value}_{central_charge}_{n_supersymmetry}"
    if key in _supervirasoro_305_cache:
        return _supervirasoro_305_cache[key]
    result = _mock_supervirasoro_305(sector, central_charge, n_supersymmetry)
    _supervirasoro_305_cache[key] = result
    return result


@router.post("/graph/superconformal/bps")
async def bps_305(
    bps_type: BPSState305 = Query(BPSState305.half_bps),
    dimension: float = Query(2.0, ge=0, le=100),
    n_charges: int = Query(4, ge=1, le=30),
):
    key = f"{bps_type.value}_{dimension}_{n_charges}"
    if key in _bps_305_cache:
        return _bps_305_cache[key]
    result = _mock_bps_305(bps_type, dimension, n_charges)
    _bps_305_cache[key] = result
    return result


@router.post("/graph/superconformal/susy")
async def susy_305(
    susy_type: SusyType305 = Query(SusyType305.n4_sym),
    n_generators: int = Query(4, ge=1, le=8),
    coupling: float = Query(1.0, ge=0, le=100),
):
    key = f"{susy_type.value}_{n_generators}_{coupling}"
    if key in _susy_305_cache:
        return _susy_305_cache[key]
    result = _mock_susy_305(susy_type, n_generators, coupling)
    _susy_305_cache[key] = result
    return result


@router.post("/graph/superconformal/seiberg-witten")
async def seiberg_witten_305(
    sw_type: SeibergWitten305 = Query(SeibergWitten305.sw_curve),
    gauge_rank: int = Query(1, ge=1, le=10),
    n_flavors: int = Query(2, ge=0, le=20),
):
    key = f"{sw_type.value}_{gauge_rank}_{n_flavors}"
    if key in _seiberg_witten_305_cache:
        return _seiberg_witten_305_cache[key]
    result = _mock_seiberg_witten_305(sw_type, gauge_rank, n_flavors)
    _seiberg_witten_305_cache[key] = result
    return result


@router.post("/graph/superconformal/index")
async def index_305(
    index_type: SuperconformalIndex305 = Query(SuperconformalIndex305.schur_index),
    n_charges: int = Query(4, ge=1, le=30),
    fugacity_dim: int = Query(4, ge=1, le=20),
):
    key = f"{index_type.value}_{n_charges}_{fugacity_dim}"
    if key in _index_305_cache:
        return _index_305_cache[key]
    result = _mock_index_305(index_type, n_charges, fugacity_dim)
    _index_305_cache[key] = result
    return result


@router.post("/graph/superconformal/non-renormalization")
async def non_renormalization_305(
    nr_type: NonRenormalization305 = Query(NonRenormalization305.holomorphy),
    perturbation_order: int = Query(1, ge=0, le=10),
    n_operators: int = Query(4, ge=1, le=30),
):
    key = f"{nr_type.value}_{perturbation_order}_{n_operators}"
    if key in _nonrenorm_305_cache:
        return _nonrenorm_305_cache[key]
    result = _mock_nonrenorm_305(nr_type, perturbation_order, n_operators)
    _nonrenorm_305_cache[key] = result
    return result


@router.get("/graph/superconformal/overview")
async def superconformal_overview_305():
    return {
        "layer": 57,
        "version": "v1.305.0",
        "engine": "Superconformal Field Theory (SCFT) Engine",
        "description": "超共形场论引擎 — Super-Virasoro代数(L_n+G^±_r+J_m)/BPS态(Δ=|R|)/N=1,2,4,8超对称/Seiberg-Witten曲线y²=P(x,u)/超共形指标(Macdonald/Schur/Hall-Littlewood)/非重正化定理(全纯性/R对称性/a-定理)/AdS/CFT对应(N=4 SYM↔AdS₅×S⁵)/谱流/手性环/手征对称性/Wall-crossing",
        "enums": {
            "SuperVirasoroRep305": [e.value for e in SuperVirasoroRep305],
            "BPSState305": [e.value for e in BPSState305],
            "SusyType305": [e.value for e in SusyType305],
            "SeibergWitten305": [e.value for e in SeibergWitten305],
            "SuperconformalIndex305": [e.value for e in SuperconformalIndex305],
            "NonRenormalization305": [e.value for e in NonRenormalization305],
        },
        "enum_count": 36,
        "endpoints": [
            {"method": "POST", "path": "/graph/superconformal/supervirasoro", "desc": "超维拉索罗表示"},
            {"method": "POST", "path": "/graph/superconformal/bps", "desc": "BPS态"},
            {"method": "POST", "path": "/graph/superconformal/susy", "desc": "超对称分类"},
            {"method": "POST", "path": "/graph/superconformal/seiberg-witten", "desc": "Seiberg-Witten理论"},
            {"method": "POST", "path": "/graph/superconformal/index", "desc": "超共形指标"},
            {"method": "POST", "path": "/graph/superconformal/non-renormalization", "desc": "非重正化定理"},
            {"method": "GET",  "path": "/graph/superconformal/overview", "desc": "系统总览"},
        ],
        "endpoint_count": 7,
        "config_space": 6**6,
        "cache_stats": {
            "supervirasoro": len(_supervirasoro_305_cache),
            "bps": len(_bps_305_cache),
            "susy": len(_susy_305_cache),
            "seiberg_witten": len(_seiberg_witten_305_cache),
            "index": len(_index_305_cache),
            "nonrenorm": len(_nonrenorm_305_cache),
        },
    }
'''

# ── Append to backend ────────────────────────────────────────────────────────

if __name__ == "__main__":
    with open(BACKEND_FILE, "a", encoding="utf-8") as f:
        f.write(APPENDIX)
    print(f"Layer 57 (v1.305) appended to {BACKEND_FILE}")
