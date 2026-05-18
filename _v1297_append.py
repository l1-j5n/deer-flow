#!/usr/bin/env python3
"""
DeerFlow Agent Platform — Layer 49 Append Script
Causal String Theory & Brane Cosmology Engine (因果弦理论与膜宇宙学引擎)
Version: v1.297.0

Appends to: backend/app/gateway/routers/knowledge_graph.py

Enums (6 × 6 = 36 values):
  StringTheoryType297, BraneType297, Compactification297,
  ConformalFieldTheory297, DualityEngine297, WorldsheetDynamics297

Endpoints (7):
  POST /graph/string-theory/{string,brane,compactification,conformal,duality,worldsheet}
  GET  /graph/string-theory/overview
"""

import os

BACKEND_FILE = os.path.join(
    os.path.dirname(__file__),
    "backend", "app", "gateway", "routers", "knowledge_graph.py",
)

APPENDIX = r'''

# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Layer 49 — Causal String Theory & Brane Cosmology Engine (v1.297.0)      ║
# ║  因果弦理论与膜宇宙学引擎                                                   ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

# ── Enums ─────────────────────────────────────────────────────────────────────

class StringTheoryType297(str, Enum):
    bosonic = "bosonic"
    superstring = "superstring"
    heterotic = "heterotic"
    type_IIA = "type_IIA"
    type_IIB = "type_IIB"
    ai_string = "ai_string"

class BraneType297(str, Enum):
    d_brane = "d_brane"
    ns5_brane = "ns5_brane"
    m2_brane = "m2_brane"
    m5_brane = "m5_brane"
    f_brane = "f_brane"
    ai_brane = "ai_brane"

class Compactification297(str, Enum):
    calabi_yau = "calabi_yau"
    toroidal = "toroidal"
    orbifold = "orbifold"
    flux_compactification = "flux_compactification"
    g2_manifold = "g2_manifold"
    ai_geometry = "ai_geometry"

class ConformalFieldTheory297(str, Enum):
    minimal_model = "minimal_model"
    wess_zumino = "wess_zumino"
    lattice_cft = "lattice_cft"
    nscft = "nscft"
    liouville = "liouville"
    ai_cft = "ai_cft"

class DualityEngine297(str, Enum):
    t_duality = "t_duality"
    s_duality = "s_duality"
    u_duality = "u_duality"
    gauge_gravity = "gauge_gravity"
    open_closed = "open_closed"
    ai_duality = "ai_duality"

class WorldsheetDynamics297(str, Enum):
    polyakov = "polyakov"
    nambu_goto = "nambu_goto"
    green_schwarz = "green_schwarz"
    berkovits = "berkovits"
    pure_spinor = "pure_spinor"
    ai_worldsheet = "ai_worldsheet"


# ── Caches ────────────────────────────────────────────────────────────────────

_string_theory_297_cache: Dict[str, Any] = {}
_brane_297_cache: Dict[str, Any] = {}
_compactification_297_cache: Dict[str, Any] = {}
_conformal_297_cache: Dict[str, Any] = {}
_duality_297_cache: Dict[str, Any] = {}
_worldsheet_297_cache: Dict[str, Any] = {}


# ── Helper ────────────────────────────────────────────────────────────────────

def _mock_string_297(stype: StringTheoryType297, dim: int, tension: float) -> Dict[str, Any]:
    """Compute string theory spectrum and fundamental parameters."""
    import math, random
    random.seed(hash(stype.value) + int(tension * 1000) + dim)
    l_s = 1.0 / max(tension, 0.01)
    modes = list(range(dim))
    mass_sq = [(n / l_s**2) * (1 + random.uniform(-0.05, 0.05)) for n in modes]
    return {
        "theory_type": stype.value,
        "spacetime_dimension": dim,
        "string_tension": tension,
        "string_length_ls": round(l_s, 8),
        "regge_slope_alpha_prime": round(l_s**2, 8),
        "oscillation_modes": [
            {"mode_n": n, "mass_squared": round(m, 8), "spin": random.randint(0, 2),
             "degeneracy": random.randint(1, 2**n)}
            for n, m in enumerate(mass_sq)
        ],
        "critical_dimension": 26 if stype == StringTheoryType297.bosonic else 10,
        "ground_state_tachyon": stype == StringTheoryType297.bosonic,
        "supersymmetry": stype in (
            StringTheoryType297.superstring, StringTheoryType297.type_IIA,
            StringTheoryType297.type_IIB, StringTheoryType297.heterotic,
        ),
        "central_charge_c": 26 if stype == StringTheoryType297.bosonic else 15,
        "gso_projection": stype in (StringTheoryType297.type_IIA, StringTheoryType297.type_IIB, StringTheoryType297.superstring),
        "dilaton_expectation": round(random.uniform(0.1, 2.0), 4),
        "graviton_present": True,
        "computation_id": f"str297_{stype.value}_{dim}_{int(tension*1e4)}",
    }


def _mock_brane_297(btype: BraneType297, dim: int, charge: float) -> Dict[str, Any]:
    """Compute brane dynamics and gauge theory on branes."""
    import math, random
    random.seed(hash(btype.value) + int(charge * 1000) + dim)
    p = dim if btype != BraneType297.f_brane else 1
    tension = abs(charge) / (max(dim, 1) * random.uniform(0.8, 1.2))
    return {
        "brane_type": btype.value,
        "worldvolume_dimension": p,
        "charge": charge,
        "tension": round(tension, 8),
        "rr_charge_quantized": btype == BraneType297.d_brane,
        "gauge_group_on_brane": f"U({random.randint(1, 8)})" if btype == BraneType297.d_brane else "N/A",
        "wess_zumino_coupling": round(random.uniform(0.01, 1.0), 4),
        "dirac_birth_action": round(charge * tension * random.uniform(0.9, 1.1), 4),
        "bps_condition": random.choice([True, False]),
        "moduli_fields": [f"phi_{i}" for i in range(random.randint(1, dim))],
        "scalar_vevs": [round(random.uniform(0.1, 10.0), 4) for _ in range(random.randint(1, dim))],
        "fermionic_zero_modes": random.randint(0, 8),
        "tachyonic_instability": random.choice([True, False, False]),
        "computation_id": f"brn297_{btype.value}_{dim}_{int(charge*1e4)}",
    }


def _mock_compactification_297(ctype: Compactification297, hodge: int, euler: int) -> Dict[str, Any]:
    """Compute compactification geometry and moduli space."""
    import math, random
    random.seed(hash(ctype.value) + hodge + euler)
    h11 = max(hodge, 1)
    h21 = max(euler // 2, 1)
    chi = 2 * (h11 - h21)
    return {
        "compactification_type": ctype.value,
        "hodge_numbers": {"h11": h11, "h21": h21, "h00": 1},
        "euler_characteristic": chi,
        "complex_dimension": 3 if ctype in (Compactification297.calabi_yau, Compactification297.g2_manifold) else 2,
        "kahler_moduli": h11,
        "complex_structure_moduli": h21,
        "dilaton_moduli": 1,
        "total_moduli": h11 + h21 + 1,
        "ricci_flat": ctype == Compactification297.calabi_yau,
        "holonomy_group": {
            "calabi_yau": "SU(3)", "toroidal": "U(1)^3",
            "orbifold": "Γ⊂SU(3)", "flux_compactification": "SU(3)",
            "g2_manifold": "G2", "ai_geometry": "AI-derived"
        }.get(ctype.value, "Unknown"),
        "flux_quanta": [random.randint(0, 20) for _ in range(3)],
        "tadpole_condition": abs(sum(random.randint(-10, 10) for _ in range(3))) < 20,
        "swampland_conjectures": {
            "weak_gravity": random.choice([True, False]),
            "distance": random.choice([True, False]),
            "de_sitter": random.choice([True, False]),
        },
        "computation_id": f"cmp297_{ctype.value}_{hodge}_{euler}",
    }


def _mock_conformal_297(cft_type: ConformalFieldTheory297, central: float, spins: int) -> Dict[str, Any]:
    """Compute worldsheet CFT data."""
    import math, random
    random.seed(hash(cft_type.value) + int(central * 100) + spins)
    primaries = random.randint(4, 16)
    return {
        "cft_type": cft_type.value,
        "central_charge_c": central,
        "effective_central_charge": round(central - 24 * random.uniform(0, 0.5), 4),
        "max_spin": spins,
        "primary_fields": [
            {
                "label": f"phi_{i}",
                "conformal_weight_h": round(random.uniform(0.01, central / 2), 4),
                "conformal_weight_hbar": round(random.uniform(0.01, central / 2), 4),
                "spin_s": random.randint(-spins, spins),
                "degeneracy": random.randint(1, 4),
            }
            for i in range(primaries)
        ],
        "virasoro_generators": f"L_n, n ∈ ℤ with c={central}",
        "kac_determinant_rank": random.randint(1, 5),
        "fusion_rules": [
            {"fields": f"phi_{i}×phi_{j}", "result": f"phi_{random.randint(0, primaries-1)}"}
            for i in range(min(4, primaries)) for j in range(min(4, primaries))
        ],
        "operator_product_expansion": [
            f"phi_{i}(z)phi_{j}(0) ~ " + " + ".join(
                f"C_{{{i}{j}{k}}} z^{{h_k-h_i-h_j}} phi_{k}(0)"
                for k in random.sample(range(primaries), min(2, primaries))
            )
            for i in range(min(3, primaries)) for j in range(min(3, primaries))
        ],
        "modular_invariant": random.choice([True, False]),
        "computation_id": f"cft297_{cft_type.value}_{int(central*100)}_{spins}",
    }


def _mock_duality_297(dtype: DualityEngine297, coupling: float, radius: float) -> Dict[str, Any]:
    """Compute string duality transformations."""
    import math, random
    random.seed(hash(dtype.value) + int(coupling * 100) + int(radius * 100))
    return {
        "duality_type": dtype.value,
        "coupling_g_s": coupling,
        "radius_R": radius,
        "transformed_coupling": round(1.0 / max(coupling, 0.001), 6),
        "transformed_radius": round(1.0 / max(radius, 0.001), 6) if dtype == DualityEngine297.t_duality else radius,
        "invariant_quantity": round(coupling * radius**2, 6) if dtype == DualityEngine297.u_duality else round(coupling**2 * radius, 6),
        "fixed_points": [
            {"coupling": round(random.uniform(0.1, 10.0), 4), "radius": round(random.uniform(0.1, 10.0), 4)}
            for _ in range(random.randint(1, 3))
        ],
        "montonen_olive": dtype == DualityEngine297.s_duality,
        "string_frame_action": round(random.uniform(0.1, 5.0), 4),
        "einstein_frame_metric": round(random.uniform(0.5, 2.0), 4),
        "non_perturbative_effects": random.choice(["instantons", "D-branes", "NS5-branes", "none"]),
        "strong_weak_mapping": f"g_s → 1/g_s = {round(1.0/max(coupling,0.001),4)}" if dtype == DualityEngine297.s_duality else "N/A",
        "computation_id": f"dul297_{dtype.value}_{int(coupling*1e4)}_{int(radius*1e4)}",
    }


def _mock_worldsheet_297(wtype: WorldsheetDynamics297, genus: int, target_dim: int) -> Dict[str, Any]:
    """Compute worldsheet dynamics and scattering amplitudes."""
    import math, random
    random.seed(hash(wtype.value) + genus + target_dim)
    g = max(genus, 0)
    chi_ws = 2 - 2 * g
    return {
        "worldsheet_type": wtype.value,
        "genus_g": g,
        "euler_characteristic": chi_ws,
        "target_dimension": target_dim,
        "conformal_anomaly": round(target_dim - 26 if wtype in (WorldsheetDynamics297.nambu_goto, WorldsheetDynamics297.polyakov) else target_dim - 10, 2),
        "virasoro_constraints": [f"L_{n}|phys⟩ = 0, n={i}" for i in range(min(3, 4))],
        "scattering_amplitude": {
            "tree_level": round(random.uniform(0.1, 10.0), 4),
            "one_loop": round(random.uniform(0.001, 1.0), 4),
            "genus_g": round(random.uniform(0.0001, 0.1) ** g, 8),
        },
        "vertex_operators": [
            {"label": f"V_{i}", "momentum": [round(random.uniform(-1, 1), 4) for _ in range(min(target_dim, 4))],
             "polarization": f"ε_{i}"}
            for i in range(random.randint(2, 6))
        ],
        "moduli_space_dimension": 3 * g - 3 if g > 1 else (1 if g == 1 else 0),
        "ghost_system": {"b_c ghosts": True, "beta_gamma ghosts": wtype in (WorldsheetDynamics297.green_schwarz, WorldsheetDynamics297.berkovits, WorldsheetDynamics297.pure_spinor)},
        "criticality_check": "critical" if (target_dim == 26 and wtype in (WorldsheetDynamics297.nambu_goto, WorldsheetDynamics297.polyakov)) or (target_dim == 10 and wtype != WorldsheetDynamics297.nambu_goto) else "non-critical",
        "computation_id": f"ws297_{wtype.value}_{genus}_{target_dim}",
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/graph/string-theory/string")
async def string_theory_297(
    theory_type: StringTheoryType297 = Query(StringTheoryType297.superstring),
    dimension: int = Query(10, ge=2, le=26),
    tension: float = Query(1.0, gt=0),
):
    key = f"{theory_type.value}_{dimension}_{tension:.4f}"
    if key in _string_theory_297_cache:
        return _string_theory_297_cache[key]
    result = _mock_string_297(theory_type, dimension, tension)
    _string_theory_297_cache[key] = result
    return result


@router.post("/graph/string-theory/brane")
async def brane_297(
    brane_type: BraneType297 = Query(BraneType297.d_brane),
    dimension: int = Query(4, ge=0, le=11),
    charge: float = Query(1.0),
):
    key = f"{brane_type.value}_{dimension}_{charge:.4f}"
    if key in _brane_297_cache:
        return _brane_297_cache[key]
    result = _mock_brane_297(brane_type, dimension, charge)
    _brane_297_cache[key] = result
    return result


@router.post("/graph/string-theory/compactification")
async def compactification_297(
    compact_type: Compactification297 = Query(Compactification297.calabi_yau),
    hodge_number: int = Query(3, ge=1, le=500),
    euler_char: int = Query(6, ge=-2000, le=2000),
):
    key = f"{compact_type.value}_{hodge_number}_{euler_char}"
    if key in _compactification_297_cache:
        return _compactification_297_cache[key]
    result = _mock_compactification_297(compact_type, hodge_number, euler_char)
    _compactification_297_cache[key] = result
    return result


@router.post("/graph/string-theory/conformal")
async def conformal_297(
    cft_type: ConformalFieldTheory297 = Query(ConformalFieldTheory297.minimal_model),
    central_charge: float = Query(15.0, gt=0),
    max_spin: int = Query(2, ge=0, le=10),
):
    key = f"{cft_type.value}_{central_charge:.4f}_{max_spin}"
    if key in _conformal_297_cache:
        return _conformal_297_cache[key]
    result = _mock_conformal_297(cft_type, central_charge, max_spin)
    _conformal_297_cache[key] = result
    return result


@router.post("/graph/string-theory/duality")
async def duality_297(
    duality_type: DualityEngine297 = Query(DualityEngine297.t_duality),
    coupling: float = Query(1.0, gt=0),
    radius: float = Query(1.0, gt=0),
):
    key = f"{duality_type.value}_{coupling:.4f}_{radius:.4f}"
    if key in _duality_297_cache:
        return _duality_297_cache[key]
    result = _mock_duality_297(duality_type, coupling, radius)
    _duality_297_cache[key] = result
    return result


@router.post("/graph/string-theory/worldsheet")
async def worldsheet_297(
    ws_type: WorldsheetDynamics297 = Query(WorldsheetDynamics297.polyakov),
    genus: int = Query(0, ge=0, le=100),
    target_dim: int = Query(10, ge=2, le=26),
):
    key = f"{ws_type.value}_{genus}_{target_dim}"
    if key in _worldsheet_297_cache:
        return _worldsheet_297_cache[key]
    result = _mock_worldsheet_297(ws_type, genus, target_dim)
    _worldsheet_297_cache[key] = result
    return result


@router.get("/graph/string-theory/overview")
async def string_theory_overview_297():
    return {
        "layer": 49,
        "version": "v1.297.0",
        "engine": "Causal String Theory & Brane Cosmology Engine",
        "description": "因果弦理论与膜宇宙学引擎 — 弦振谱计算、D-膜动力学、紧致化几何、世界面CFT、弦对偶性变换、世界面散射振幅",
        "enums": {
            "StringTheoryType297": [e.value for e in StringTheoryType297],
            "BraneType297": [e.value for e in BraneType297],
            "Compactification297": [e.value for e in Compactification297],
            "ConformalFieldTheory297": [e.value for e in ConformalFieldTheory297],
            "DualityEngine297": [e.value for e in DualityEngine297],
            "WorldsheetDynamics297": [e.value for e in WorldsheetDynamics297],
        },
        "enum_count": 36,
        "endpoints": [
            {"method": "POST", "path": "/graph/string-theory/string", "desc": "弦理论谱计算"},
            {"method": "POST", "path": "/graph/string-theory/brane", "desc": "膜动力学"},
            {"method": "POST", "path": "/graph/string-theory/compactification", "desc": "紧致化几何"},
            {"method": "POST", "path": "/graph/string-theory/conformal", "desc": "世界面CFT"},
            {"method": "POST", "path": "/graph/string-theory/duality", "desc": "弦对偶性"},
            {"method": "POST", "path": "/graph/string-theory/worldsheet", "desc": "世界面动力学"},
            {"method": "GET",  "path": "/graph/string-theory/overview", "desc": "系统总览"},
        ],
        "endpoint_count": 7,
        "config_space": 6**6,
        "cache_stats": {
            "string": len(_string_theory_297_cache),
            "brane": len(_brane_297_cache),
            "compactification": len(_compactification_297_cache),
            "conformal": len(_conformal_297_cache),
            "duality": len(_duality_297_cache),
            "worldsheet": len(_worldsheet_297_cache),
        },
    }

'''

if __name__ == "__main__":
    with open(BACKEND_FILE, "a", encoding="utf-8") as f:
        f.write(APPENDIX)
    size = os.path.getsize(BACKEND_FILE)
    print(f"✅ Layer 49 (v1.297) appended to knowledge_graph.py — new size: {size:,} bytes")
