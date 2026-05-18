// =============================================================================
// v1.237 - Graph Adversarial Causal Robustness Engine
// =============================================================================

/**
 * Adversarial Causal Robustness Engine API
 *
 * Provides adversarial attack generation, defense mechanisms, robustness assessment,
 * certification, model hardening, and vulnerability auditing for causal models.
 *
 * Version: v1.237.0
 * Endpoints: 6 POST + 1 GET
 * Enums: 6 × 6 = 36 values
 */

// Enum Types
export enum AdversarialAttackType {
  STRUCTURE_PERTURBATION = "structure_perturbation",
  PARAMETER_MANIPULATION = "parameter_manipulation",
  DATA_POISONING = "data_poisoning",
  LATENT_CONFOUNDER_INJECTION = "latent_confounder_injection",
  SELECTION_BIAS_AMPLIFICATION = "selection_bias_amplification",
  DISTRIBUTION_SHIFT = "distribution_shift",
}

export enum DefenseMechanism {
  ADVERSARIAL_TRAINING = "adversarial_training",
  CAUSAL_CERTIFICATION = "causal_certification",
  ROBUST_ESTIMATION = "robust_estimation",
  GRAPH_DENOISING = "graph_denoising",
  ADVERSARIAL_DETECTION = "adversarial_detection",
  CERTIFIED_DEFENSE = "certified_defense",
}

export enum RobustnessMetric {
  STRUCTURE_STABILITY = "structure_stability",
  EFFECT_ROBUSTNESS = "effect_robustness",
  INTERVENTION_INVARIANCE = "intervention_invariance",
  TOPOLOGY_RESILIENCE = "topology_resilience",
  DISTRIBUTIONAL_SCORE = "distributional_score",
  CERTIFIED_RADIUS = "certified_radius",
}

export enum AttackSurface {
  NODE_INJECTION = "node_injection",
  EDGE_REMOVAL = "edge_removal",
  ATTRIBUTE_PERTURBATION = "attribute_perturbation",
  LABEL_FLIP = "label_flip",
  GRAPH_REWIRING = "graph_rewiring",
  TEMPORAL_MANIPULATION = "temporal_manipulation",
}

export enum PerturbationBudget {
  LP_NORM = "lp_norm",
  EDIT_DISTANCE = "edit_distance",
  HAMMING_DISTANCE = "hamming_distance",
  SPECTRAL_NORM = "spectral_norm",
  WASSERSTEIN_DISTANCE = "wasserstein_distance",
  KL_DIVERGENCE = "kl_divergence",
}

export enum RobustnessCertification {
  LIPSCHITZ_CERTIFICATE = "lipschitz_certificate",
  RANDOMIZED_SMOOTHING = "randomized_smoothing",
  INTERVAL_BOUND_PROPAGATION = "interval_bound_propagation",
  CONVEX_RELAXATION = "convex_relaxation",
  FORMAL_VERIFICATION = "formal_verification",
  STATISTICAL_TEST = "statistical_test",
}

// Request Types
export interface AdversarialAttackRequest {
  graph_id: string;
  attack_type: AdversarialAttackType;
  surface: AttackSurface;
  budget: PerturbationBudget;
  budget_value: number;
  n_attacks: number;
}

export interface DefenseRequest {
  graph_id: string;
  mechanism: DefenseMechanism;
  attack_types: AdversarialAttackType[];
  defense_budget: number;
}

export interface RobustnessAssessmentRequest {
  graph_id: string;
  metrics: RobustnessMetric[];
  attack_scenarios: AdversarialAttackType[];
}

export interface CertificationRequest {
  graph_id: string;
  method: RobustnessCertification;
  confidence_level: number;
  perturbation_type: PerturbationBudget;
}

export interface HardeningRequest {
  graph_id: string;
  target_attack_types: AdversarialAttackType[];
  hardening_level: number;
}

export interface AuditRequest {
  graph_id: string;
  audit_depth: number;
  surfaces: AttackSurface[];
}

// Response Types
export interface AdversarialAttack {
  attack_id: number;
  strategy: string;
  perturbation_magnitude: number;
  budget_consumed: number;
  success_rate: number;
  detectability_score: number;
  impact_score: number;
  affected_edges: number;
  affected_nodes: number;
  effect_distortion: number;
  structure_change_ratio: number;
  causal_fidelity_loss: number;
  graph_modifications: {
    edges_added: number;
    edges_removed: number;
    edges_reversed: number;
    nodes_injected: number;
    attributes_modified: number;
  };
  stealth_metrics: {
    kl_divergence_original: number;
    graph_edit_distance: number;
    spectral_distance: number;
  };
}

export interface AdversarialAttackResponse {
  graph_id: string;
  result: {
    attack_type: string;
    attack_config: Record<string, unknown>;
    surface: string;
    surface_config: Record<string, unknown>;
    budget: string;
    budget_value: number;
    n_attacks: number;
    attacks: AdversarialAttack[];
    aggregate_metrics: {
      avg_impact_score: number;
      max_impact_score: number;
      avg_detectability: number;
      avg_fidelity_loss: number;
      total_budget_consumed: number;
    };
    most_dangerous_attack: AdversarialAttack;
    risk_assessment: {
      overall_risk: string;
      recommended_defenses: string[];
      priority_surfaces: string[];
    };
    attack_time_ms: number;
  };
  timestamp: number;
}

export interface DefenseLayer {
  layer_id: number;
  target_attack: string;
  attack_severity: string;
  techniques_applied: string[];
  robustness_before: number;
  robustness_after: number;
  improvement: number;
  defense_confidence: number;
  computational_overhead_pct: number;
  false_positive_rate: number;
  false_negative_rate: number;
  coverage_metrics: {
    attack_types_covered: number;
    surfaces_protected: number;
    edge_cases_handled: number;
  };
  residual_risk: {
    uncovered_surfaces: number;
    bounded_distortion: number;
    certified_radius: number;
  };
}

export interface DefenseResponse {
  graph_id: string;
  result: {
    mechanism: string;
    mechanism_config: Record<string, unknown>;
    n_attack_types_targeted: number;
    defense_layers: DefenseLayer[];
    aggregate_metrics: {
      avg_robustness_improvement: number;
      avg_defense_confidence: number;
      total_computational_overhead_pct: number;
      avg_false_positive_rate: number;
      avg_false_negative_rate: number;
    };
    defense_quality: {
      overall_grade: string;
      robustness_achieved: number;
      residual_vulnerability_count: number;
    };
    defense_budget_consumed: number;
    defense_time_ms: number;
  };
  timestamp: number;
}

export interface RobustnessAssessmentResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface CertificationResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface HardeningResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface AuditResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface AdversarialCausalOverview {
  engine: string;
  version: string;
  endpoints: string[];
  enums: {
    AdversarialAttackType: string[];
    DefenseMechanism: string[];
    RobustnessMetric: string[];
    AttackSurface: string[];
    PerturbationBudget: string[];
    RobustnessCertification: string[];
  };
  features: {
    attack_types: number;
    defense_mechanisms: number;
    robustness_metrics: number;
    attack_surfaces: number;
    perturbation_budgets: number;
    certification_methods: number;
  };
  integration: Record<string, string>;
  total_enums: number;
  total_enum_values: number;
}

// API Functions
export async function generateAdversarialAttack(
  request: AdversarialAttackRequest
): Promise<AdversarialAttackResponse> {
  const response = await fetch('/api/adversarial-causal/attack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to generate adversarial attack');
  return response.json();
}

export async function applyDefense(
  request: DefenseRequest
): Promise<DefenseResponse> {
  const response = await fetch('/api/adversarial-causal/defend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to apply defense');
  return response.json();
}

export async function assessRobustness(
  request: RobustnessAssessmentRequest
): Promise<RobustnessAssessmentResponse> {
  const response = await fetch('/api/adversarial-causal/assess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to assess robustness');
  return response.json();
}

export async function certifyRobustness(
  request: CertificationRequest
): Promise<CertificationResponse> {
  const response = await fetch('/api/adversarial-causal/certify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to certify robustness');
  return response.json();
}

export async function hardenModel(
  request: HardeningRequest
): Promise<HardeningResponse> {
  const response = await fetch('/api/adversarial-causal/harden', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to harden model');
  return response.json();
}

export async function auditAdversarialVulnerabilities(
  request: AuditRequest
): Promise<AuditResponse> {
  const response = await fetch('/api/adversarial-causal/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to audit vulnerabilities');
  return response.json();
}

export async function getAdversarialCausalOverview(): Promise<AdversarialCausalOverview> {
  const response = await fetch('/api/adversarial-causal/overview');
  if (!response.ok) throw new Error('Failed to get overview');
  return response.json();
}

// Export all types and functions
export default {
  // Enums
  AdversarialAttackType,
  DefenseMechanism,
  RobustnessMetric,
  AttackSurface,
  PerturbationBudget,
  RobustnessCertification,

  // API functions
  generateAdversarialAttack,
  applyDefense,
  assessRobustness,
  certifyRobustness,
  hardenModel,
  auditAdversarialVulnerabilities,
  getAdversarialCausalOverview,
};