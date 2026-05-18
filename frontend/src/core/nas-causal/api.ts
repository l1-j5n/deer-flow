// =============================================================================
// v1.240 - Graph Neural Architecture Search v5 for Causality
// =============================================================================

/**
 * Causality-Optimized Neural Architecture Search Engine API
 *
 * Provides causal-aware NAS search spaces, causal constraint integration,
 * intervention-aware architectures, counterfactual reasoning optimization,
 * and structural causal model (SCM) integration.
 *
 * Version: v1.240.0
 * Endpoints: 7 POST + 1 GET
 * Enums: 7 × 6 = 42 values
 */

// Enum Types
export enum CausalSearchSpace {
  CAUSAL_GRAPH_AWARE = "causal_graph_aware",
  INTERVENTION_TOLERANT = "intervention_tolerant",
  COUNTERFACTUAL_OPTIMIZED = "counterfactual_optimized",
  STRUCTURAL_CASUAL_MODEL = "structural_causal_model",
  DO_CALCULUS_NET = "do_calculus_net",
  CAUSAL_ATTENTION = "causal_attention",
}

export enum CausalConstraint {
  CAUSAL_CONSISTENCY = "causal_consistency",
  INTERVENTION_INDEPENDENCE = "intervention_independence",
  COUNTERFACTUAL_VALIDITY = "counterfactual_validity",
  FAIRNESS_CAUSAL = "fairness_causal",
  IDENTIFIABILITY = "identifiability",
  MARKOV_EQUIVALENCE = "markov_equivalence",
}

export enum CausalCellType {
  CAUSAL_CONV = "causal_conv",
  INTERVENTION_LAYER = "intervention_layer",
  COUNTERFACTUAL_HEAD = "counterfactual_head",
  DO_OPERATOR = "do_operator",
  CAUSAL_ATTENTION_CELL = "causal_attention_cell",
  STRUCTURAL_ENCODER = "structural_encoder",
}

export enum CausalOptimization {
  CAUSAL_ACCURACY = "causal_accuracy",
  INTERVENTION_ROBUSTNESS = "intervention_robustness",
  COUNTERFACTUAL_FIDELITY = "counterfactual_fidelity",
  IDENTIFICATION_SCORE = "identification_score",
  CAUSAL_DISCOVERY_QUALITY = "causal_discovery_quality",
  INTERVENTION_EFFECT_ESTIMATION = "intervention_effect_estimation",
}

export enum NASCausalStrategy {
  EVOLUTIONARY_CAUSAL = "evolutionary_causal",
  REINFORCEMENT_CAUSAL = "reinforcement_causal",
  BAYESIAN_CAUSAL = "bayesian_causal",
  GRADIENT_BASED_CAUSAL = "gradient_based_causal",
  ONE_SHOT_CAUSAL = "one_shot_causal",
  MULTI_OBJECTIVE_CAUSAL = "multi_objective_causal",
}

export enum CausalEvaluation {
  INTERVENTION_TESTING = "intervention_testing",
  COUNTERFACTUAL_EVALUATION = "counterfactual_evaluation",
  CAUSAL_DISCOVERY_BENCHMARK = "causal_discovery_benchmark",
  IDENTIFICATION_SCORE = "identification_score",
  STRUCTURAL_VALIDATION = "structural_validation",
  FAIRNESS_CAUSAL_AUDIT = "fairness_causal_audit",
}

export enum CausalArchitectureLayer {
  CAUSAL_GRAPH_ENCODER = "causal_graph_encoder",
  INTERVENTION_MODULE = "intervention_module",
  COUNTERFACTUAL_DECODER = "counterfactual_decoder",
  DO_OPERATOR_LAYER = "do_operator_layer",
  CAUSAL_ATTENTION_MECHANISM = "causal_attention_mechanism",
  STRUCTURAL_INFERENCE_LAYER = "structural_inference_layer",
}

// Request Types
export interface CausalNASRequest {
  graph_id: string;
  search_space: CausalSearchSpace;
  strategy: NASCausalStrategy;
  num_trials: number;
  max_layers: number;
  optimization_objective: CausalOptimization;
  causal_constraints: CausalConstraint[];
}

export interface CausalCellSearchRequest {
  graph_id: string;
  cell_type: CausalCellType;
  num_cells: number;
  hidden_dim: number;
  causal_awareness: number;
  intervention_tolerance: number;
}

export interface CausalInterventionArchRequest {
  graph_id: string;
  intervention_type: string;
  intervention_strength: number;
  architecture_id: string;
  robustness_targets: string[];
}

export interface CausalCounterfactualNASRequest {
  graph_id: string;
  counterfactual_distance: number;
  factual_accuracy: number;
  counterfactual_fidelity: number;
  num_candidates: number;
}

export interface CausalConstraintNASRequest {
  graph_id: string;
  constraint: CausalConstraint;
  constraint_weight: number;
  violation_tolerance: number;
  validation_frequency: number;
}

export interface CausalSCMIntegrationRequest {
  graph_id: string;
  scm_type: string;
  scm_parameters: Record<string, unknown>;
  integration_depth: number;
  latent_variables: number;
}

export interface CausalEvaluationNASRequest {
  graph_id: string;
  architecture: Record<string, unknown>;
  evaluation_type: CausalEvaluation;
  intervention_scenarios: string[];
  counterfactual_queries: string[];
}

// Response Types
export interface CausalNASResponse {
  graph_id: string;
  best_architecture: {
    architecture_id: string;
    cell_types: CausalCellType[];
    layers: Array<{
      layer_type: CausalArchitectureLayer;
      causal_score: number;
      intervention_score: number;
      counterfactual_score: number;
    }>;
    causal_metrics: {
      causal_consistency: number;
      intervention_independence: number;
      counterfactual_validity: number;
      identifiability: number;
    };
    performance: {
      accuracy: number;
      intervention_robustness: number;
      counterfactual_fidelity: number;
      total_params: number;
      flops: number;
      latency_ms: number;
    };
  };
  search_history: Array<{
    iteration: number;
    architecture_id: string;
    causal_score: number;
    intervention_score: number;
    counterfactual_score: number;
    overall_score: number;
  }>;
  convergence_data: number[];
  constraint_satisfaction: Record<string, boolean>;
  timestamp: number;
}

export interface CausalCellSearchResponse {
  graph_id: string;
  best_cell: {
    cell_id: string;
    cell_type: CausalCellType;
    structure: Record<string, unknown>;
    causal_awareness: number;
    intervention_tolerance: number;
    performance: {
      accuracy: number;
      flops: number;
      params: number;
    };
  };
  candidate_cells: Array<{
    cell_id: string;
    cell_type: CausalCellType;
    causal_score: number;
    intervention_score: number;
  }>;
  search_stats: {
    total_searched: number;
    search_coverage: number;
    avg_causal_score: number;
    best_causal_score: number;
  };
  timestamp: number;
}

export interface CausalInterventionArchResponse {
  graph_id: string;
  intervention_architecture: {
    architecture_id: string;
    intervention_modules: Array<{
      layer_idx: number;
      intervention_type: string;
      intervention_strength: number;
      robustness: number;
    }>;
    pre_intervention_performance: number;
    post_intervention_performance: number;
    recovery_rate: number;
  };
  robustness_analysis: {
    average_robustness: number;
    min_robustness: number;
    worst_case_scenario: string;
    improvement_suggestions: string[];
  };
  timestamp: number;
}

export interface CausalCounterfactualNASResponse {
  graph_id: string;
  counterfactual_architecture: {
    architecture_id: string;
    factual_accuracy: number;
    counterfactual_fidelity: number;
    tradeoff_score: number;
    factual_counterfactual_balance: number;
  };
  counterfactual_performance: {
    counterfactual_prediction_accuracy: number;
    minimal_intervention_success: number;
    causal_effect_estimation_error: number;
  };
  candidates: Array<{
    architecture_id: string;
    factual_score: number;
    counterfactual_score: number;
    tradeoff_score: number;
  }>;
  timestamp: number;
}

export interface CausalConstraintNASResponse {
  graph_id: string;
  constraint_satisfied: {
    architecture_id: string;
    constraint_type: CausalConstraint;
    constraint_value: number;
    satisfaction_score: number;
    performance: {
      accuracy: number;
      causal_score: number;
    };
  };
  constraint_violations: Array<{
    architecture_id: string;
    constraint_type: CausalConstraint;
    violation_severity: number;
    suggested_fix: string;
  }>;
  search_stats: {
    total_evaluated: number;
    feasible_count: number;
    infeasible_count: number;
    feasibility_rate: number;
  };
  timestamp: number;
}

export interface CausalSCMIntegrationResponse {
  graph_id: string;
  scm_integration: {
    scm_type: string;
    scm_parameters: Record<string, unknown>;
    integration_layers: Array<{
      layer_type: CausalArchitectureLayer;
      scm_connection: string;
    }>;
    causal_identifiability: number;
    latent_handling: string;
  };
  performance: {
    accuracy: number;
    causal_discovery_score: number;
    identification_accuracy: number;
    intervention_effect_mse: number;
  };
  timestamp: number;
}

export interface CausalEvaluationNASResponse {
  graph_id: string;
  evaluation_results: {
    evaluation_type: CausalEvaluation;
    overall_score: number;
    detailed_metrics: Record<string, number>;
  };
  intervention_results: Array<{
    intervention: string;
    pre_intervention: number;
    post_intervention: number;
    robustness: number;
  }>;
  counterfactual_results: Array<{
    query: string;
    factual_prediction: number;
    counterfactual_prediction: number;
    difference: number;
    validity: number;
  }>;
  causal_quality_metrics: {
    causal_consistency: number;
    intervention_independence: number;
    counterfactual_validity: number;
    identifiability: number;
    markov_equivalence: number;
  };
  timestamp: number;
}

export interface NASCausalOverview {
  engine: string;
  version: string;
  description: string;
  endpoints: string[];
  enums: {
    CausalSearchSpace: string[];
    CausalConstraint: string[];
    CausalCellType: string[];
    CausalOptimization: string[];
    NASCausalStrategy: string[];
    CausalEvaluation: string[];
    CausalArchitectureLayer: string[];
  };
  features: {
    search_spaces: number;
    constraint_types: number;
    cell_types: number;
    optimization_objectives: number;
    search_strategies: number;
    evaluation_methods: number;
    architecture_layers: number;
  };
  integration: Record<string, string>;
  total_enums: number;
  total_enum_values: number;
}

// API Functions
export async function searchCausalNAS(
  request: CausalNASRequest
): Promise<CausalNASResponse> {
  const response = await fetch('/api/graph/nas-causal/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to search causal NAS');
  return response.json();
}

export async function searchCausalCell(
  request: CausalCellSearchRequest
): Promise<CausalCellSearchResponse> {
  const response = await fetch('/api/graph/nas-causal/cell-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to search causal cell');
  return response.json();
}

export async function designInterventionArch(
  request: CausalInterventionArchRequest
): Promise<CausalInterventionArchResponse> {
  const response = await fetch('/api/graph/nas-causal/intervention', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to design intervention architecture');
  return response.json();
}

export async function searchCounterfactualNAS(
  request: CausalCounterfactualNASRequest
): Promise<CausalCounterfactualNASResponse> {
  const response = await fetch('/api/graph/nas-causal/counterfactual', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to search counterfactual NAS');
  return response.json();
}

export async function searchCausalConstraint(
  request: CausalConstraintNASRequest
): Promise<CausalConstraintNASResponse> {
  const response = await fetch('/api/graph/nas-causal/constraint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to search with causal constraint');
  return response.json();
}

export async function integrateSCM(
  request: CausalSCMIntegrationRequest
): Promise<CausalSCMIntegrationResponse> {
  const response = await fetch('/api/graph/nas-causal/scm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to integrate SCM');
  return response.json();
}

export async function evaluateCausalNAS(
  request: CausalEvaluationNASRequest
): Promise<CausalEvaluationNASResponse> {
  const response = await fetch('/api/graph/nas-causal/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to evaluate causal NAS');
  return response.json();
}

export async function getNASCausalOverview(): Promise<NASCausalOverview> {
  const response = await fetch('/api/graph/nas-causal/overview');
  if (!response.ok) throw new Error('Failed to get NAS causal overview');
  return response.json();
}

// Export all types and functions
export default {
  // Enums
  CausalSearchSpace,
  CausalConstraint,
  CausalCellType,
  CausalOptimization,
  NASCausalStrategy,
  CausalEvaluation,
  CausalArchitectureLayer,

  // API functions
  searchCausalNAS,
  searchCausalCell,
  designInterventionArch,
  searchCounterfactualNAS,
  searchCausalConstraint,
  integrateSCM,
  evaluateCausalNAS,
  getNASCausalOverview,
};
