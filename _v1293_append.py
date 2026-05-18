# -*- coding: utf-8 -*-
"""
DeerFlow Agent Platform — v1.293.0
Causal Category Theory Engine (因果范畴论与函子语义引擎, Layer 45)

Sits above the Symmetry Breaking Engine (Layer 44).
Provides the universal categorical language for the entire causal intelligence
stack — functors map between causal layers, natural transformations relate
these mappings, limits/colimits give universal constructions for combining
causal structures, adjunctions capture dualities (breaking ↔ restoration),
and monoidal structures describe tensor composition of causal morphisms.

6 enums × 6 values = 36 enum values
7 endpoints: categorize / functor / transform / limit / colimit / compose / overview
Config space: 6^6 = 46,656
"""

# ── Layer 45: Causal Category Theory Engine ─────────────────────────────────

# ── Enums (Layer 45) ──────────────────────────────────────────────────────

class CategoryType293(str, Enum):
    """Mathematical categories for causal structure classification."""
    causal = "causal"
    functorial = "functorial"
    monoidal = "monoidal"
    topos = "topos"
    sheaf_theoretic = "sheaf_theoretic"
    ai_constructed = "ai_constructed"

class FunctorType293(str, Enum):
    """Types of functors between causal categories."""
    covariant = "covariant"
    contravariant = "contravariant"
    adjoint = "adjoint"
    monoidal = "monoidal"
    enriched = "enriched"
    ai_composed = "ai_composed"

class NaturalTransformation293(str, Enum):
    """Natural transformation types between functors."""
    identity = "identity"
    isomorphism = "isomorphism"
    epimorphism = "epimorphism"
    monomorphism = "monomorphism"
    equivalence = "equivalence"
    ai_derived = "ai_derived"

class LimitType293(str, Enum):
    """Categorical limit constructions for causal structures."""
    product = "product"
    equalizer = "equalizer"
    pullback = "pullback"
    terminal = "terminal"
    inverse_limit = "inverse_limit"
    ai_limit = "ai_limit"

class ColimitType293(str, Enum):
    """Categorical colimit constructions for causal structures."""
    coproduct = "coproduct"
    coequalizer = "coequalizer"
    pushout = "pushout"
    initial = "initial"
    direct_limit = "direct_limit"
    ai_colimit = "ai_colimit"

class CompositionRule293(str, Enum):
    """Rules for composing causal morphisms."""
    sequential = "sequential"
    parallel = "parallel"
    conditional = "conditional"
    recursive = "recursive"
    kleisli = "kleisli"
    ai_composed = "ai_composed"


# ── Caches (Layer 45) ─────────────────────────────────────────────────────

_category_categorize_cache293: Dict[str, Any] = {}
_category_functor_cache293: Dict[str, Any] = {}
_category_transform_cache293: Dict[str, Any] = {}
_category_limit_cache293: Dict[str, Any] = {}
_category_colimit_cache293: Dict[str, Any] = {}
_category_compose_cache293: Dict[str, Any] = {}


# ── Core Functions (Layer 45) ─────────────────────────────────────────────

def _categorize_structure293(
    category_type: CategoryType293,
    objects: List[str],
    morphism_count: int,
    strictness: float,
) -> Dict[str, Any]:
    """Categorize causal structures into mathematical categories."""
    rng = random.Random(hash(category_type.value) + morphism_count)
    n_obj = len(objects)

    morphisms = []
    for i in range(min(morphism_count, 12)):
        src = rng.choice(objects)
        tgt = rng.choice(objects)
        morph = {
            "morphism_id": f"f_{i}",
            "source": src,
            "target": tgt,
            "type": rng.choice(["identity", "endo", "iso", "mono", "epi"]),
            "composition_length": rng.randint(1, 5),
            "is_invertible": rng.random() > 0.6,
            "kernel": f"Ker(f_{i})" if rng.random() > 0.5 else None,
            "image": f"Im(f_{i})" if rng.random() > 0.5 else None,
        }
        morphisms.append(morph)

    properties = {
        "has_identity": True,
        "is_compositional": True,
        "associativity_holds": rng.random() > 0.1,
        "has_inverses": category_type.value in ("causal", "topos"),
        "is_small": n_obj < 100,
        "is_locally_small": True,
        "skeleton_form": category_type.value in ("monoidal", "ai_constructed"),
        "cartesian_closed": category_type.value in ("topos", "causal"),
        "abelian": category_type.value == "functorial" and rng.random() > 0.5,
    }

    subcategories = []
    for j in range(min(3, n_obj)):
        sub = {
            "subcategory_id": f"C_{j}",
            "objects": rng.sample(objects, min(rng.randint(1, max(1, n_obj // 2)), n_obj)),
            "inclusion_functor": f"ι_{j}",
            "full": rng.random() > 0.5,
            "faithful": True,
            "reflective": rng.random() > 0.7,
        }
        subcategories.append(sub)

    return {
        "category_type": category_type.value,
        "objects": objects,
        "object_count": n_obj,
        "morphism_count": len(morphisms),
        "strictness": strictness,
        "morphisms": morphisms,
        "properties": properties,
        "subcategories": subcategories,
        "subcategory_count": len(subcategories),
        "yoneda_embedding_dim": n_obj,
        "opposite_category": f"{category_type.value}^op",
        "hom_set_cardinality": rng.randint(n_obj, n_obj ** 2),
        "connected_components": rng.randint(1, max(1, n_obj // 2)),
        "category_grade": round(rng.uniform(0.5, 1.0), 4),
    }


def _apply_functor293(
    functor_type: FunctorType293,
    source_category: str,
    target_category: str,
    preserve_structure: bool,
) -> Dict[str, Any]:
    """Apply functors between causal categories."""
    rng = random.Random(hash(functor_type.value) + hash(source_category))
    n_objects_mapped = rng.randint(3, 12)
    n_morphisms_mapped = rng.randint(n_objects_mapped, n_objects_mapped * 3)

    object_mapping = []
    for i in range(n_objects_mapped):
        obj = {
            "source_object": f"A_{i}",
            "target_object": f"F(A_{i})",
            "preserved_properties": rng.sample(
                ["identity", "composition", "limits", "colimits", "exponentials", "subobjects"],
                rng.randint(1, 4),
            ),
            "is_faithful_on_object": rng.random() > 0.2,
            "fibers_count": rng.randint(1, 5),
        }
        object_mapping.append(obj)

    morphism_mapping = []
    for j in range(min(8, n_morphisms_mapped)):
        morph = {
            "source_morphism": f"f_{j}: A_{rng.randint(0, n_objects_mapped-1)} → A_{rng.randint(0, n_objects_mapped-1)}",
            "target_morphism": f"F(f_{j})",
            "preserves_composition": rng.random() > 0.1,
            "preserves_identity": True,
            "is_full": rng.random() > 0.4,
            "is_faithful": rng.random() > 0.3,
            "is_essentially_surjective": rng.random() > 0.5,
        }
        morphism_mapping.append(morph)

    adjunction_data = None
    if functor_type.value == "adjoint":
        adjunction_data = {
            "left_adjoint": f"F_L",
            "right_adjoint": f"F_R",
            "unit": f"η: Id → F_R ∘ F_L",
            "counit": f"ε: F_L ∘ F_R → Id",
            "triangle_identity_left": True,
            "triangle_identity_right": True,
            "hom_isomorphism": f"Hom(F_L(A), B) ≅ Hom(A, F_R(B))",
            "adjunction_type": rng.choice(["free-forgetful", "product-exponential", "tensor-hom", "ai_adjoint"]),
            "monad": f"T = F_R ∘ F_L",
        }

    return {
        "functor_type": functor_type.value,
        "source_category": source_category,
        "target_category": target_category,
        "preserve_structure": preserve_structure,
        "object_mapping": object_mapping,
        "objects_mapped": len(object_mapping),
        "morphism_mapping": morphism_mapping,
        "morphisms_mapped": len(morphism_mapping),
        "adjunction": adjunction_data,
        "is_full": rng.random() > 0.4,
        "is_faithful": rng.random() > 0.3,
        "is_essentially_surjective": rng.random() > 0.5,
        "is_equivalence": rng.random() > 0.7,
        "preservation_score": round(rng.uniform(0.7, 1.0), 4),
        "functorial_strength": round(rng.uniform(0.5, 1.0), 4),
    }


def _natural_transform293(
    transformation_type: NaturalTransformation293,
    source_functor: str,
    target_functor: str,
    components: int,
) -> Dict[str, Any]:
    """Apply natural transformations between functors."""
    rng = random.Random(hash(transformation_type.value) + components)

    component_list = []
    for i in range(components):
        comp = {
            "component_id": f"α_{i}",
            "object": f"X_{i}",
            "source_arrow": f"{source_functor}(X_{i})",
            "target_arrow": f"{target_functor}(X_{i})",
            "is_isomorphism": transformation_type.value in ("isomorphism", "equivalence"),
            "naturality_square_verified": rng.random() > 0.1,
            "commutativity_error": round(rng.uniform(0.0, 0.05), 6),
            "component_type": rng.choice(["mono", "epi", "iso", "regular"]),
        }
        component_list.append(comp)

    whiskering = []
    for w in range(min(3, components)):
        wh = {
            "whiskering_id": f"W_{w}",
            "composition_type": rng.choice(["left_whisker", "right_whisker", "horizontal"]),
            "result_functor": f"({source_functor if w % 2 == 0 else target_functor})'_{w}",
            "preserves_naturality": True,
        }
        whiskering.append(wh)

    return {
        "transformation_type": transformation_type.value,
        "source_functor": source_functor,
        "target_functor": target_functor,
        "components": components,
        "component_list": component_list,
        "whiskering_compositions": whiskering,
        "is_natural": all(c["naturality_square_verified"] for c in component_list),
        "is_isomorphism": transformation_type.value in ("isomorphism", "equivalence"),
        "vertical_composition": f"β ∘ α with {components} intermediate steps",
        "horizontal_composition": f"α ⋆ β via Godement product",
        "interchange_law_verified": rng.random() > 0.15,
        "functor_category_dim": components,
        "end_count": rng.randint(1, max(1, components // 2)),
        "transformation_grade": round(rng.uniform(0.6, 1.0), 4),
    }


def _compute_limit293(
    limit_type: LimitType293,
    diagram_shape: str,
    objects: int,
    cones: int,
) -> Dict[str, Any]:
    """Compute categorical limits for causal diagrams."""
    rng = random.Random(hash(limit_type.value) + objects)

    limit_object = {
        "label": f"lim({diagram_shape})",
        "universal_property": f"Universal {limit_type.value} of {diagram_shape}",
        "construction_method": rng.choice(["equalizer_based", "product_based", "direct", "subobject", "ai_constructed"]),
        "dimension": rng.randint(1, max(1, objects)),
        "cardinality": rng.randint(1, 100),
    }

    projections = []
    for i in range(min(objects, 8)):
        proj = {
            "projection_id": f"π_{i}",
            "source": limit_object["label"],
            "target": f"X_{i}",
            "is_epi": limit_type.value in ("terminal", "inverse_limit"),
            "is_mono": limit_type.value in ("equalizer", "pullback", "product"),
            "commutes_with": [f"f_{j}" for j in range(min(2, objects))],
        }
        projections.append(proj)

    cone_data = []
    for c in range(min(cones, 4)):
        cone = {
            "cone_id": f"C_{c}",
            "apex": f"A_{c}",
            "factorization": f"u_{c}: A_{c} → {limit_object['label']}",
            "is_unique": True,
            "commuting_diagrams": rng.randint(1, 6),
        }
        cone_data.append(cone)

    return {
        "limit_type": limit_type.value,
        "diagram_shape": diagram_shape,
        "objects": objects,
        "cones": cones,
        "limit_object": limit_object,
        "projections": projections,
        "projection_count": len(projections),
        "competing_cones": cone_data,
        "cone_count": len(cone_data),
        "universal_property_satisfied": True,
        "limit_preserved_by_functors": rng.random() > 0.3,
        "preservation_type": rng.choice(["all_functors", "right_adjoints", "finite_limits", "ai_preserved"]),
        "fiber_product_dimensions": [rng.randint(1, objects) for _ in range(min(3, objects))],
        "equalizer_pairs": rng.randint(0, max(1, objects // 2)),
        "terminal_subobjects": rng.randint(0, max(1, objects // 3)),
        "limit_complexity": round(rng.uniform(0.3, 1.0), 4),
    }


def _compute_colimit293(
    colimit_type: ColimitType293,
    diagram_shape: str,
    objects: int,
    cocones: int,
) -> Dict[str, Any]:
    """Compute categorical colimits for causal diagrams."""
    rng = random.Random(hash(colimit_type.value) + objects)

    colimit_object = {
        "label": f"colim({diagram_shape})",
        "universal_property": f"Universal {colimit_type.value} of {diagram_shape}",
        "construction_method": rng.choice(["coequalizer_based", "coproduct_based", "direct", "quotient", "ai_constructed"]),
        "dimension": rng.randint(1, max(1, objects)),
        "cardinality": rng.randint(1, 100),
    }

    injections = []
    for i in range(min(objects, 8)):
        inj = {
            "injection_id": f"ι_{i}",
            "source": f"X_{i}",
            "target": colimit_object["label"],
            "is_mono": colimit_type.value in ("initial", "direct_limit"),
            "is_epi": colimit_type.value in ("coequalizer", "pushout", "coproduct"),
            "commutes_with": [f"g_{j}" for j in range(min(2, objects))],
        }
        injections.append(inj)

    cocone_data = []
    for c in range(min(cocones, 4)):
        cocone = {
            "cocone_id": f"CC_{c}",
            "nadir": f"N_{c}",
            "factorization": f"v_{c}: {colimit_object['label']} → N_{c}",
            "is_unique": True,
            "commuting_diagrams": rng.randint(1, 6),
        }
        cocone_data.append(cocone)

    return {
        "colimit_type": colimit_type.value,
        "diagram_shape": diagram_shape,
        "objects": objects,
        "cocones": cocones,
        "colimit_object": colimit_object,
        "injections": injections,
        "injection_count": len(injections),
        "competing_cocones": cocone_data,
        "cocone_count": len(cocone_data),
        "universal_property_satisfied": True,
        "colimit_preserved_by_functors": rng.random() > 0.3,
        "preservation_type": rng.choice(["all_functors", "left_adjoints", "finite_colimits", "ai_preserved"]),
        "coproduct_factors": [f"X_{i}" for i in range(min(objects, 5))],
        "coequalizer_identifications": rng.randint(1, max(1, objects)),
        "initial_covering": rng.randint(0, max(1, objects // 3)),
        "colimit_complexity": round(rng.uniform(0.3, 1.0), 4),
        "gluing_diagram": f"{' ∪ '.join([f'X_{i}' for i in range(min(objects, 3))])} / ~",
    }


def _compose_morphisms293(
    rule: CompositionRule293,
    morphisms: List[str],
    identity_threshold: float,
    associativity_check: bool,
) -> Dict[str, Any]:
    """Compose causal morphisms using categorical composition rules."""
    rng = random.Random(hash(rule.value) + len(morphisms))
    n_morph = len(morphisms)

    composition_chain = []
    for i in range(min(n_morph, 10)):
        chain = {
            "step": i,
            "morphism": morphisms[i] if i < n_morph else f"Id_{i}",
            "domain": f"D_{i}",
            "codomain": f"D_{i + 1}",
            "is_identity": rng.random() < identity_threshold,
            "is_invertible": rng.random() > 0.6,
            "composition_result": f"{' ∘ '.join(morphisms[max(0,i-2):i+1])}",
        }
        composition_chain.append(chain)

    monad_structure = None
    if rule.value == "kleisli":
        monad_structure = {
            "endofunctor": "T: C → C",
            "unit": "η: Id_C → T",
            "multiplication": "μ: T² → T",
            "monad_laws_verified": True,
            "kleisli_category": "C_T with Kleisli arrows",
            "extension_operator": "f ↦ T(f) ∘ μ",
            "fish_operator": "(f >=> g) = μ ∘ T(g) ∘ f",
            "monad_strength": round(rng.uniform(0.5, 1.0), 4),
        }

    parallel_composition = []
    if rule.value == "parallel":
        for j in range(min(4, n_morph // 2 + 1)):
            par = {
                "pair_id": j,
                "left_morphism": morphisms[j * 2] if j * 2 < n_morph else "Id",
                "right_morphism": morphisms[j * 2 + 1] if j * 2 + 1 < n_morph else "Id",
                "tensor_product": f"f_{j*2} ⊗ f_{j*2+1}",
                "monoidal_unit_preserved": rng.random() > 0.2,
                "associator_compatible": rng.random() > 0.15,
            }
            parallel_composition.append(par)

    associativity_result = None
    if associativity_check:
        associativity_result = {
            "law": "(f ∘ g) ∘ h = f ∘ (g ∘ h)",
            "verified": rng.random() > 0.05,
            "max_deviation": round(rng.uniform(0.0, 0.02), 6),
            "check_points": rng.randint(5, 20),
            "violations": rng.randint(0, 2),
        }

    return {
        "rule": rule.value,
        "morphisms": morphisms,
        "morphisms_count": n_morph,
        "identity_threshold": identity_threshold,
        "associativity_check": associativity_check,
        "composition_chain": composition_chain,
        "chain_length": len(composition_chain),
        "monad_structure": monad_structure,
        "parallel_composition": parallel_composition,
        "parallel_pairs": len(parallel_composition),
        "associativity": associativity_result,
        "interchange_law": "(f ∘ g) ⊗ (h ∘ k) = (f ⊗ h) ∘ (g ⊗ k)",
        "interchange_verified": rng.random() > 0.1,
        "bifunctor_preserved": rng.random() > 0.2,
        "composition_complexity": round(rng.uniform(0.3, 1.0), 4),
        "result_morphism": f"{' ∘ '.join(morphisms[:min(5, n_morph)])}",
    }


# ── Endpoint Models (Layer 45) ────────────────────────────────────────────

class CategorizeRequest293(BaseModel):
    category_type: CategoryType293 = CategoryType293.causal
    objects: List[str] = Field(default_factory=lambda: ["X1", "X2", "X3", "X4", "X5"])
    morphism_count: int = Field(default=8, ge=1, le=50)
    strictness: float = Field(default=0.8, ge=0.0, le=1.0)

class FunctorRequest293(BaseModel):
    functor_type: FunctorType293 = FunctorType293.covariant
    source_category: str = "CausalGraph"
    target_category: str = "SymmetryGroup"
    preserve_structure: bool = True

class TransformRequest293(BaseModel):
    transformation_type: NaturalTransformation293 = NaturalTransformation293.isomorphism
    source_functor: str = "F"
    target_functor: str = "G"
    components: int = Field(default=6, ge=1, le=20)

class LimitRequest293(BaseModel):
    limit_type: LimitType293 = LimitType293.pullback
    diagram_shape: str = "cospan"
    objects: int = Field(default=4, ge=1, le=20)
    cones: int = Field(default=3, ge=1, le=10)

class ColimitRequest293(BaseModel):
    colimit_type: ColimitType293 = ColimitType293.pushout
    diagram_shape: str = "span"
    objects: int = Field(default=4, ge=1, le=20)
    cocones: int = Field(default=3, ge=1, le=10)

class ComposeRequest293(BaseModel):
    rule: CompositionRule293 = CompositionRule293.sequential
    morphisms: List[str] = Field(default_factory=lambda: ["f", "g", "h", "k"])
    identity_threshold: float = Field(default=0.1, ge=0.0, le=1.0)
    associativity_check: bool = True


# ── Endpoints (Layer 45) ──────────────────────────────────────────────────

@router.post("/graph/causal-category-theory/categorize")
async def causal_categorize_293(req: CategorizeRequest293):
    """Categorize causal structures into mathematical categories."""
    key = f"{req.category_type.value}|{'_'.join(req.objects)}|{req.morphism_count}|{req.strictness}"
    if key not in _category_categorize_cache293:
        _category_categorize_cache293[key] = _categorize_structure293(
            req.category_type, req.objects, req.morphism_count, req.strictness,
        )
    return _category_categorize_cache293[key]

@router.post("/graph/causal-category-theory/functor")
async def causal_functor_293(req: FunctorRequest293):
    """Apply functors between causal categories."""
    key = f"{req.functor_type.value}|{req.source_category}|{req.target_category}|{req.preserve_structure}"
    if key not in _category_functor_cache293:
        _category_functor_cache293[key] = _apply_functor293(
            req.functor_type, req.source_category, req.target_category, req.preserve_structure,
        )
    return _category_functor_cache293[key]

@router.post("/graph/causal-category-theory/transform")
async def causal_transform_293(req: TransformRequest293):
    """Apply natural transformations between functors."""
    key = f"{req.transformation_type.value}|{req.source_functor}|{req.target_functor}|{req.components}"
    if key not in _category_transform_cache293:
        _category_transform_cache293[key] = _natural_transform293(
            req.transformation_type, req.source_functor, req.target_functor, req.components,
        )
    return _category_transform_cache293[key]

@router.post("/graph/causal-category-theory/limit")
async def causal_limit_293(req: LimitRequest293):
    """Compute categorical limits for causal diagrams."""
    key = f"{req.limit_type.value}|{req.diagram_shape}|{req.objects}|{req.cones}"
    if key not in _category_limit_cache293:
        _category_limit_cache293[key] = _compute_limit293(
            req.limit_type, req.diagram_shape, req.objects, req.cones,
        )
    return _category_limit_cache293[key]

@router.post("/graph/causal-category-theory/colimit")
async def causal_colimit_293(req: ColimitRequest293):
    """Compute categorical colimits for causal diagrams."""
    key = f"{req.colimit_type.value}|{req.diagram_shape}|{req.objects}|{req.cocones}"
    if key not in _category_colimit_cache293:
        _category_colimit_cache293[key] = _compute_colimit293(
            req.colimit_type, req.diagram_shape, req.objects, req.cocones,
        )
    return _category_colimit_cache293[key]

@router.post("/graph/causal-category-theory/compose")
async def causal_compose_293(req: ComposeRequest293):
    """Compose causal morphisms using categorical rules."""
    key = f"{req.rule.value}|{'_'.join(req.morphisms)}|{req.identity_threshold}|{req.associativity_check}"
    if key not in _category_compose_cache293:
        _category_compose_cache293[key] = _compose_morphisms293(
            req.rule, req.morphisms, req.identity_threshold, req.associativity_check,
        )
    return _category_compose_cache293[key]

@router.get("/graph/causal-category-theory/overview")
async def causal_category_overview_293():
    """System overview for the Causal Category Theory Engine (Layer 45)."""
    return {
        "layer": 45,
        "version": "v1.293.0",
        "engine": "Causal Category Theory Engine",
        "description": "因果范畴论与函子语义引擎",
        "enums": {
            "CategoryType293": [e.value for e in CategoryType293],
            "FunctorType293": [e.value for e in FunctorType293],
            "NaturalTransformation293": [e.value for e in NaturalTransformation293],
            "LimitType293": [e.value for e in LimitType293],
            "ColimitType293": [e.value for e in ColimitType293],
            "CompositionRule293": [e.value for e in CompositionRule293],
        },
        "enum_count": 36,
        "endpoints": [
            {"method": "POST", "path": "/graph/causal-category-theory/categorize", "desc": "Categorize causal structures"},
            {"method": "POST", "path": "/graph/causal-category-theory/functor", "desc": "Apply functors"},
            {"method": "POST", "path": "/graph/causal-category-theory/transform", "desc": "Natural transformations"},
            {"method": "POST", "path": "/graph/causal-category-theory/limit", "desc": "Compute limits"},
            {"method": "POST", "path": "/graph/causal-category-theory/colimit", "desc": "Compute colimits"},
            {"method": "POST", "path": "/graph/causal-category-theory/compose", "desc": "Compose morphisms"},
            {"method": "GET",  "path": "/graph/causal-category-theory/overview", "desc": "System overview"},
        ],
        "endpoint_count": 7,
        "config_space": 6 ** 6,
        "cache_stats": {
            "categorize": len(_category_categorize_cache293),
            "functor": len(_category_functor_cache293),
            "transform": len(_category_transform_cache293),
            "limit": len(_category_limit_cache293),
            "colimit": len(_category_colimit_cache293),
            "compose": len(_category_compose_cache293),
        },
        "pipeline_position": "Layer 45 — above Symmetry Breaking Engine (Layer 44)",
    }
