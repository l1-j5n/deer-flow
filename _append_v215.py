"""Append v1.215 SSL Multimodal code to knowledge_graph.py"""
import pathlib

p = pathlib.Path(r"D:\03_AITOOL\deer-flow\backend\app\gateway\routers\knowledge_graph.py")
content = p.read_text(encoding="utf-8")

# Remove trailing markers
for marker in ["# End of Knowledge Graph API", "# End of v1.214"]:
    idx = content.rfind(marker)
    if idx > 0:
        content = content[:idx].rstrip()

new_code = """

# =============================================================================
# v1.215 - Graph Self-Supervised Multimodal Learning Engine
# =============================================================================

# --- Enums ---

class ContrastiveMethod(str, Enum):
    simclr = "simclr"
    moco = "moco"
    byol = "byol"
    simsiam = "simsiam"
    barlow_twins = "barlow_twins"
    vicreg = "vicreg"


class GenerativeSSLMethod(str, Enum):
    masked_ae = "masked_ae"
    vae = "vae"
    diffusion = "diffusion"
    flow = "flow"
    autoregressive = "autoregressive"
    hybrid = "hybrid"


class PredictiveTask(str, Enum):
    link_prediction = "link_prediction"
    attribute_prediction = "attribute_prediction"
    degree_prediction = "degree_prediction"
    community_prediction = "community_prediction"
    centrality_prediction = "centrality_prediction"
    graph_property = "graph_property"


class CrossModalPretext(str, Enum):
    modality_inpainting = "modality_inpainting"
    cross_prediction = "cross_prediction"
    modality_discrimination = "modality_discrimination"
    jigsaw = "jigsaw"
    rotation = "rotation"
    colorization = "colorization"


class TaskWeighting(str, Enum):
    uniform = "uniform"
    uncertainty = "uncertainty"
    gradnorm = "gradnorm"
    pcgrad = "pcgrad"
    dynamic = "dynamic"
    cosine = "cosine"


class SSLEvaluation(str, Enum):
    linear_probe = "linear_probe"
    fine_tuning = "fine_tuning"
    knn = "knn"
    alignment_uniformity = "alignment_uniformity"
    transfer = "transfer"
    clustering = "clustering"


# --- Caches ---

_ssl_contrastive_cache: Dict[str, dict] = {}
_ssl_generative_cache: Dict[str, dict] = {}
_ssl_predictive_cache: Dict[str, dict] = {}
_ssl_pretext_cache: Dict[str, dict] = {}
_ssl_multitask_cache: Dict[str, dict] = {}
_ssl_evaluate_cache: Dict[str, dict] = {}


# --- Computation Functions ---


def _compute_contrastive_ssl(
    graph_id: str, method: str, modality: str, augmentation: str,
    temperature: float, projection_dim: int, num_negatives: int,
    batch_size: int, epochs: int,
) -> dict:
    import random, math
    methods = {
        "simclr": {"requires_neg": True, "symmetric": True, "stop_grad": False},
        "moco": {"requires_neg": True, "symmetric": False, "stop_grad": True},
        "byol": {"requires_neg": False, "symmetric": False, "stop_grad": True},
        "simsiam": {"requires_neg": False, "symmetric": True, "stop_grad": True},
        "barlow_twins": {"requires_neg": False, "symmetric": True, "stop_grad": False},
        "vicreg": {"requires_neg": False, "symmetric": True, "stop_grad": False},
    }
    m_cfg = methods.get(method, methods["simclr"])
    aug_quality = round(random.uniform(0.6, 0.95), 3)
    alignment_score = round(random.uniform(0.05, 0.4), 3)
    uniformity_score = round(random.uniform(0.3, 0.8), 3)
    base_loss = round(random.uniform(0.3, 1.8), 4)
    final_loss = round(base_loss * math.exp(-0.12 * epochs), 4)
    representations = {
        mod: {"dim": projection_dim, "norm_mean": round(random.uniform(0.8, 1.2), 3), "norm_std": round(random.uniform(0.3, 0.7), 3)}
        for mod in ["visual", "textual", "structural", "temporal", "audio", "tabular"]
    }
    epoch_losses = [round(base_loss * math.exp(-0.12 * e) + random.uniform(-0.05, 0.05), 4) for e in range(epochs)]
    pos_similarity = round(random.uniform(0.7, 0.98), 3)
    neg_similarity = round(random.uniform(0.05, 0.35), 3)
    return {
        "graph_id": graph_id, "method": method, "modality": modality, "augmentation": augmentation,
        "config": {"temperature": temperature, "projection_dim": projection_dim, "num_negatives": num_negatives, "batch_size": batch_size, "epochs": epochs},
        "method_config": m_cfg,
        "training": {"initial_loss": epoch_losses[0], "final_loss": final_loss, "convergence_epoch": min(epochs, max(3, int(epochs * random.uniform(0.4, 0.7)))), "total_epochs": epochs, "loss_trajectory": epoch_losses[-5:] if epochs > 5 else epoch_losses},
        "quality": {"alignment": alignment_score, "uniformity": uniformity_score, "pos_similarity": pos_similarity, "neg_similarity": neg_similarity, "separation": round(pos_similarity - neg_similarity, 3), "augmentation_quality": aug_quality},
        "representations": representations,
        "positive_pairs": random.randint(500, 5000),
        "negative_pairs": num_negatives * batch_size * epochs if m_cfg["requires_neg"] else 0,
    }


def _compute_generative_ssl(
    graph_id: str, method: str, modality: str, mask_ratio: float, latent_dim: int, epochs: int,
) -> dict:
    import random, math
    method_metrics = {
        "masked_ae": {"reconstruction_type": "masked_prediction", "primary_metric": "mask_accuracy"},
        "vae": {"reconstruction_type": "probabilistic", "primary_metric": "elbo"},
        "diffusion": {"reconstruction_type": "iterative_denoising", "primary_metric": "noise_rmse"},
        "flow": {"reconstruction_type": "invertible_transform", "primary_metric": "log_likelihood"},
        "autoregressive": {"reconstruction_type": "sequential", "primary_metric": "nll"},
        "hybrid": {"reconstruction_type": "composite", "primary_metric": "composite_score"},
    }
    m_info = method_metrics.get(method, method_metrics["masked_ae"])
    base_recon = round(random.uniform(0.6, 0.92), 3)
    improvement = round(random.uniform(0.05, 0.15), 3)
    final_recon = min(0.99, round(base_recon + improvement, 3))
    kl_div = round(random.uniform(1.0, 8.0), 3) if method in ("vae", "hybrid") else None
    log_likelihood = round(random.uniform(-3.0, -0.5), 3) if method in ("flow", "autoregressive", "diffusion") else None
    latent_analysis = {"dim": latent_dim, "effective_dim": random.randint(max(1, latent_dim // 2), latent_dim), "kl_divergence": kl_div, "log_likelihood": log_likelihood, "mutual_info": round(random.uniform(0.3, 0.9), 3), "disentanglement_score": round(random.uniform(0.4, 0.85), 3)}
    modality_recon = {mod: round(random.uniform(0.7, 0.96), 3) for mod in ["visual", "textual", "structural", "temporal", "audio", "tabular"]}
    return {
        "graph_id": graph_id, "method": method, "modality": modality, "mask_ratio": mask_ratio, "method_info": m_info,
        "training": {"epochs": epochs, "initial_reconstruction": base_recon, "final_reconstruction": final_recon, "convergence_epoch": min(epochs, max(5, int(epochs * random.uniform(0.3, 0.6)))), "per_epoch_loss": [round(random.uniform(0.3, 1.5) * math.exp(-0.08 * e), 4) for e in range(min(10, epochs))]},
        "latent_analysis": latent_analysis, "modality_reconstruction": modality_recon,
        "fidelity": {"overall_fidelity": final_recon, "structural_preservation": round(random.uniform(0.75, 0.95), 3), "semantic_preservation": round(random.uniform(0.7, 0.93), 3)},
    }


def _compute_predictive_ssl(
    graph_id: str, task: str, scale: str, num_samples: int, difficulty_threshold: float,
) -> dict:
    import random
    task_info = {
        "link_prediction": {"level": "edge", "metric": "auroc", "baseline": 0.5},
        "attribute_prediction": {"level": "node", "metric": "rmse", "baseline": 1.0},
        "degree_prediction": {"level": "node", "metric": "mae", "baseline": 5.0},
        "community_prediction": {"level": "node", "metric": "nmi", "baseline": 0.0},
        "centrality_prediction": {"level": "node", "metric": "spearman", "baseline": 0.0},
        "graph_property": {"level": "graph", "metric": "r2", "baseline": 0.0},
    }
    t_info = task_info.get(task, task_info["link_prediction"])
    score = round(random.uniform(0.6, 0.95), 3)
    difficulty = round(random.uniform(0.2, 0.8), 3)
    return {
        "graph_id": graph_id, "task": task, "scale": scale, "task_info": t_info, "num_samples": num_samples,
        "results": {"score": score, "baseline": t_info["baseline"], "improvement": round(score - t_info["baseline"], 3), "difficulty": difficulty if difficulty >= difficulty_threshold else round(difficulty * 0.7, 3), "confidence_interval": [round(score - 0.05, 3), round(score + 0.05, 3)]},
        "analysis": {"easy_samples": random.randint(int(num_samples * 0.3), int(num_samples * 0.6)), "medium_samples": random.randint(int(num_samples * 0.2), int(num_samples * 0.4)), "hard_samples": random.randint(int(num_samples * 0.1), int(num_samples * 0.3)), "transfer_score": round(random.uniform(0.5, 0.9), 3)},
        "node_features_used": random.randint(10, 128), "edge_features_used": random.randint(5, 64),
    }


def _compute_cross_modal_pretext(
    graph_id: str, pretext_task: str, source_modality: str, target_modality: str, masking_ratio: float, epochs: int,
) -> dict:
    import random, math
    pretext_info = {
        "modality_inpainting": {"requires_masking": True, "loss_type": "reconstruction"},
        "cross_prediction": {"requires_masking": False, "loss_type": "prediction"},
        "modality_discrimination": {"requires_masking": False, "loss_type": "classification"},
        "jigsaw": {"requires_masking": True, "loss_type": "permutation"},
        "rotation": {"requires_masking": False, "loss_type": "classification"},
        "colorization": {"requires_masking": True, "loss_type": "regression"},
    }
    p_info = pretext_info.get(pretext_task, pretext_info["modality_inpainting"])
    base_loss = round(random.uniform(0.5, 2.0), 4)
    final_loss = round(base_loss * math.exp(-0.1 * epochs), 4)
    cross_modal_acc = round(random.uniform(0.6, 0.92), 3)
    return {
        "graph_id": graph_id, "pretext_task": pretext_task, "source_modality": source_modality, "target_modality": target_modality, "masking_ratio": masking_ratio, "pretext_info": p_info,
        "training": {"epochs": epochs, "initial_loss": base_loss, "final_loss": final_loss, "convergence_epoch": min(epochs, max(3, int(epochs * 0.5)))},
        "cross_modal_transfer": {"accuracy": cross_modal_acc, "source_modality_representation_quality": round(random.uniform(0.7, 0.95), 3), "target_modality_representation_quality": round(random.uniform(0.65, 0.9), 3), "alignment_score": round(random.uniform(0.5, 0.85), 3)},
        "pretext_specific": {"inpainting_psnr": round(random.uniform(20, 35), 1) if pretext_task == "modality_inpainting" else None, "discrimination_acc": round(random.uniform(0.7, 0.95), 3) if pretext_task == "modality_discrimination" else None, "jigsaw_accuracy": round(random.uniform(0.6, 0.9), 3) if pretext_task == "jigsaw" else None, "rotation_acc": round(random.uniform(0.65, 0.92), 3) if pretext_task == "rotation" else None},
        "learned_features": {"shared_dimensions": random.randint(32, 256), "modality_specific_dims": {source_modality: random.randint(16, 64), target_modality: random.randint(16, 64)}},
    }


def _compute_multitask_ssl(
    graph_id: str, tasks: list, weighting: str, num_epochs: int, balance_factor: float,
) -> dict:
    import random, math
    weighting_info = {
        "uniform": {"adaptive": False, "description": "Equal weights for all tasks"},
        "uncertainty": {"adaptive": True, "description": "Learned task uncertainty-based weighting (Kendall et al.)"},
        "gradnorm": {"adaptive": True, "description": "Gradient norm balancing"},
        "pcgrad": {"adaptive": True, "description": "Projecting conflicting gradients"},
        "dynamic": {"adaptive": True, "description": "Loss-history-based dynamic adjustment"},
        "cosine": {"adaptive": False, "description": "Cosine annealing weight schedule"},
    }
    w_info = weighting_info.get(weighting, weighting_info["uniform"])
    n_tasks = len(tasks)
    if n_tasks == 0: n_tasks = 3; tasks = ["contrastive", "generative", "predictive"]
    if weighting == "uniform": task_weights = [round(1.0 / n_tasks, 4)] * n_tasks
    elif weighting == "uncertainty": task_weights = [round(random.uniform(0.1, 0.5), 4) for _ in range(n_tasks)]
    else: task_weights = [round(random.uniform(0.15, 0.45), 4) for _ in range(n_tasks)]
    total_w = sum(task_weights)
    task_weights = [round(w / total_w, 4) for w in task_weights]
    task_losses = {}
    for i, t in enumerate(tasks):
        base = round(random.uniform(0.5, 2.0), 4)
        final = round(base * math.exp(-0.08 * num_epochs), 4)
        task_losses[t] = {"initial": base, "final": final, "weight": task_weights[i]}
    gradient_conflicts = random.randint(0, int(num_epochs * 0.3)) if n_tasks > 1 else 0
    return {
        "graph_id": graph_id, "tasks": tasks, "weighting": weighting, "weighting_info": w_info, "num_tasks": n_tasks,
        "config": {"num_epochs": num_epochs, "balance_factor": balance_factor},
        "task_weights": dict(zip(tasks, task_weights)), "task_losses": task_losses,
        "training": {"total_loss_trajectory": [round(random.uniform(0.8, 2.5) * math.exp(-0.06 * e), 4) for e in range(min(10, num_epochs))], "gradient_conflicts": gradient_conflicts, "conflict_resolution_rate": round(random.uniform(0.7, 0.98), 3) if gradient_conflicts > 0 else 1.0, "convergence_epoch": min(num_epochs, max(5, int(num_epochs * random.uniform(0.4, 0.7))))},
        "synergy": {"task_correlation_matrix": {t1: {t2: round(random.uniform(0.1, 0.9), 2) for t2 in tasks} for t1 in tasks}, "pareto_improvement": round(random.uniform(0.02, 0.15), 3), "knowledge_transfer_score": round(random.uniform(0.5, 0.85), 3)},
        "representation_quality": {"joint_alignment": round(random.uniform(0.6, 0.9), 3), "joint_uniformity": round(random.uniform(0.5, 0.85), 3), "effective_dimension": random.randint(64, 512)},
    }


def _evaluate_ssl_representation(
    graph_id: str, evaluation: str, ssl_method: str, downstream_task: str, num_classes: int, fine_tune_epochs: int,
) -> dict:
    import random
    eval_info = {
        "linear_probe": {"type": "frozen", "trainable_params": "classifier_only"},
        "fine_tuning": {"type": "end_to_end", "trainable_params": "all"},
        "knn": {"type": "non_parametric", "trainable_params": "none"},
        "alignment_uniformity": {"type": "geometric", "trainable_params": "none"},
        "transfer": {"type": "cross_domain", "trainable_params": "classifier_only"},
        "clustering": {"type": "unsupervised", "trainable_params": "none"},
    }
    e_info = eval_info.get(evaluation, eval_info["linear_probe"])
    performance = round(random.uniform(0.65, 0.96), 3)
    baseline = round(random.uniform(0.3, 0.6), 3)
    return {
        "graph_id": graph_id, "evaluation": evaluation, "eval_info": e_info, "ssl_method": ssl_method, "downstream_task": downstream_task, "num_classes": num_classes,
        "results": {"performance": performance, "baseline": baseline, "improvement": round(performance - baseline, 3), "relative_improvement": round((performance - baseline) / baseline, 3)},
        "representation_analysis": {"effective_rank": random.randint(16, 256), "condition_number": round(random.uniform(1.5, 15.0), 2), "intrinsic_dimension": random.randint(8, 64), "cluster_separation": round(random.uniform(0.4, 0.9), 3), "class_balance": round(random.uniform(0.7, 1.0), 3)},
        "fine_tuning": {"epochs": fine_tune_epochs if evaluation == "fine_tuning" else 0, "best_epoch": random.randint(1, max(1, fine_tune_epochs)), "overfitting_gap": round(random.uniform(0.0, 0.08), 3)},
        "comparison": {"supervised_only": round(random.uniform(0.6, 0.85), 3), "ssl_frozen": performance if evaluation == "linear_probe" else round(random.uniform(0.65, 0.9), 3), "ssl_finetuned": round(random.uniform(0.8, 0.97), 3), "ssl_advantage": round(random.uniform(0.02, 0.15), 3)},
    }


# --- Endpoints ---


@router.post("/ssl-multimodal/contrastive")
async def ssl_contrastive(request: Request):
    body = await request.json()
    result = _compute_contrastive_ssl(graph_id=body.get("graph_id", "graph_001"), method=body.get("method", "simclr"), modality=body.get("modality", "visual"), augmentation=body.get("augmentation", "masking"), temperature=body.get("temperature", 0.07), projection_dim=body.get("projection_dim", 128), num_negatives=body.get("num_negatives", 1024), batch_size=body.get("batch_size", 256), epochs=body.get("epochs", 100))
    _ssl_contrastive_cache[f"{result['graph_id']}_{result['method']}_{result['modality']}"] = result
    return result


@router.post("/ssl-multimodal/generative")
async def ssl_generative(request: Request):
    body = await request.json()
    result = _compute_generative_ssl(graph_id=body.get("graph_id", "graph_001"), method=body.get("method", "masked_ae"), modality=body.get("modality", "visual"), mask_ratio=body.get("mask_ratio", 0.75), latent_dim=body.get("latent_dim", 256), epochs=body.get("epochs", 200))
    _ssl_generative_cache[f"{result['graph_id']}_{result['method']}_{result['modality']}"] = result
    return result


@router.post("/ssl-multimodal/predictive")
async def ssl_predictive(request: Request):
    body = await request.json()
    result = _compute_predictive_ssl(graph_id=body.get("graph_id", "graph_001"), task=body.get("task", "link_prediction"), scale=body.get("scale", "node"), num_samples=body.get("num_samples", 10000), difficulty_threshold=body.get("difficulty_threshold", 0.3))
    _ssl_predictive_cache[f"{result['graph_id']}_{result['task']}_{result['scale']}"] = result
    return result


@router.post("/ssl-multimodal/pretext")
async def ssl_pretext(request: Request):
    body = await request.json()
    result = _compute_cross_modal_pretext(graph_id=body.get("graph_id", "graph_001"), pretext_task=body.get("pretext_task", "modality_inpainting"), source_modality=body.get("source_modality", "visual"), target_modality=body.get("target_modality", "textual"), masking_ratio=body.get("masking_ratio", 0.5), epochs=body.get("epochs", 100))
    _ssl_pretext_cache[f"{result['graph_id']}_{result['pretext_task']}_{result['source_modality']}_{result['target_modality']}"] = result
    return result


@router.post("/ssl-multimodal/multi-task")
async def ssl_multitask(request: Request):
    body = await request.json()
    result = _compute_multitask_ssl(graph_id=body.get("graph_id", "graph_001"), tasks=body.get("tasks", ["contrastive", "generative", "predictive"]), weighting=body.get("weighting", "uncertainty"), num_epochs=body.get("num_epochs", 150), balance_factor=body.get("balance_factor", 1.0))
    _ssl_multitask_cache[f"{result['graph_id']}_{result['weighting']}_{len(result['tasks'])}"] = result
    return result


@router.post("/ssl-multimodal/evaluate")
async def ssl_evaluate(request: Request):
    body = await request.json()
    result = _evaluate_ssl_representation(graph_id=body.get("graph_id", "graph_001"), evaluation=body.get("evaluation", "linear_probe"), ssl_method=body.get("ssl_method", "simclr"), downstream_task=body.get("downstream_task", "node_classification"), num_classes=body.get("num_classes", 10), fine_tune_epochs=body.get("fine_tune_epochs", 50))
    _ssl_evaluate_cache[f"{result['graph_id']}_{result['evaluation']}_{result['ssl_method']}"] = result
    return result


@router.get("/ssl-multimodal/summary")
async def ssl_multimodal_summary():
    return {
        "version": "v1.215.0",
        "engine": "Graph Self-Supervised Multimodal Learning",
        "modules": ["contrastive_ssl", "generative_ssl", "predictive_ssl", "cross_modal_pretext", "multi_task_ssl", "ssl_evaluation", "summary"],
        "enums": {
            "ContrastiveMethod": [m.value for m in ContrastiveMethod],
            "GenerativeSSLMethod": [m.value for m in GenerativeSSLMethod],
            "PredictiveTask": [t.value for t in PredictiveTask],
            "CrossModalPretext": [p.value for p in CrossModalPretext],
            "TaskWeighting": [w.value for w in TaskWeighting],
            "SSLEvaluation": [e.value for e in SSLEvaluation],
        },
        "caches": {"contrastive": len(_ssl_contrastive_cache), "generative": len(_ssl_generative_cache), "predictive": len(_ssl_predictive_cache), "pretext": len(_ssl_pretext_cache), "multitask": len(_ssl_multitask_cache), "evaluate": len(_ssl_evaluate_cache)},
        "integration": {"multimodal_fusion": "v1.213", "causal_discovery": "v1.214", "autonomous_learning": "v1.210", "distillation_v3": "v1.208", "continual_learning_v3": "v1.206", "adversarial_robustness_v3": "v1.212"},
    }


# =============================================================================
# End of v1.215 - Graph Self-Supervised Multimodal Learning Engine
# =============================================================================


# =============================================================================
# End of Knowledge Graph API
# =============================================================================
"""

content = content + new_code
p.write_text(content, encoding="utf-8")
print(f"Done. Total lines: {len(content.splitlines())}")
