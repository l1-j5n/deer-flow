import { getBackendBaseURL } from "@/core/config";

// ============================================================
// Types
// ============================================================

export type CausalScale =
  | "micro"
  | "meso"
  | "macro"
  | "cross_scale"
  | "hierarchical"
  | "adaptive";

export type ScaleDiscoveryMethod =
  | "bottom_up"
  | "top_down"
  | "hierarchical_pc"
  | "multi_resolution"
  | "scale_space"
  | "spectral_decomposition";

export type HierarchicalEffectType =
  | "within_level"
  | "between_level"
  | "cascading"
  | "emergent"
  | "feedback"
  | "composite";

export type ScaleTransferMechanism =
  | "aggregation"
  | "abstraction"
  | "projection"
  | "embedding"
  | "compression"
  | "summarization";

export type MultiResolutionMetric =
  | "consistency"
  | "stability"
  | "robustness"
  | "coverage"
  | "fidelity"
  | "efficiency";

export type ScaleCompositionPattern =
  | "sequential"
  | "parallel"
  | "hierarchical"
  | "modular"
  | "recursive"
  | "hybrid";

// --- Request Types ---

export interface MultiScaleDiscoveryRequest {
  graph_id: string;
  method: ScaleDiscoveryMethod;
  target_scale?: CausalScale;
}

export interface HierarchicalEffectRequest {
  graph_id: string;
  effect_type: HierarchicalEffectType;
  n_levels?: number;
}

export interface ScaleTransferRequest {
  graph_id: string;
  mechanism: ScaleTransferMechanism;
  source_scale?: CausalScale;
  target_scale?: CausalScale;
}

export interface MultiResolutionValidationRequest {
  graph_id: string;
  metric: MultiResolutionMetric;
  resolutions?: number[];
}

export interface CrossScaleInterventionRequest {
  graph_id: string;
  source_scale?: CausalScale;
  target_scale?: CausalScale;
  intervention_budget?: number;
}

export interface ScaleCompositionRequest {
  graph_id: string;
  pattern: ScaleCompositionPattern;
  n_scales?: number;
}

// --- Response Types ---

export interface CrossLayerLink {
  from_layer: number;
  to_layer: number;
  from_node: string;
  to_node: string;
  bridge_type: string;
  strength: number;
}

export interface DiscoveryLayer {
  layer_id: number;
  scale: string;
  node_count: number;
  edge_count: number;
  edges: Array<{
    source: string;
    target: string;
    weight: number;
    confidence: number;
    scale: string;
  }>;
  density: number;
  avg_confidence: number;
}

export interface DiscoveryResponse {
  graph_id: string;
  method: string;
  target_scale: string;
  discovery: {
    method: string;
    target_scale: string;
    discovery_config: Record<string, unknown>;
    layers: DiscoveryLayer[];
    layer_count: number;
    cross_layer_links: CrossLayerLink[];
    cross_link_count: number;
    overall_coherence: number;
    completeness: number;
  };
  timestamp: number;
}

export interface HierarchicalEffectResponse {
  graph_id: string;
  effect_type: string;
  n_levels: number;
  effects: {
    effect_type: string;
    config: Record<string, unknown>;
    n_levels: number;
    levels: Array<{
      level: number;
      scale: string;
      effects: Array<{
        effect_id: string;
        source: string;
        target: string;
        ate: number;
        ci_lower: number;
        ci_upper: number;
        p_value: number;
        scale: string;
        direction: string;
      }>;
      effect_count: number;
      avg_effect_size: number;
      significant_count: number;
    }>;
    cross_level_effects: Array<{
      from_level: number;
      to_level: number;
      effect: number;
      mechanism: string;
      strength: number;
    }>;
    cross_effect_count: number;
    total_effects: number;
    overall_significance: number;
    effect_consistency: number;
  };
  timestamp: number;
}

export interface ScaleTransferResponse {
  graph_id: string;
  mechanism: string;
  source_scale: string;
  target_scale: string;
  transfer: {
    mechanism: string;
    mechanism_config: Record<string, unknown>;
    source_scale: string;
    target_scale: string;
    transfers: Array<{
      transfer_id: number;
      source_node: string;
      target_node: string;
      causal_strength: number;
      information_preserved: number;
      distortion: number;
      source_scale: string;
      target_scale: string;
    }>;
    transfer_count: number;
    information_flow: Record<string, unknown>;
    transfer_efficiency: number;
    scale_gap: number;
    alignment_score: number;
  };
  timestamp: number;
}

export interface MultiResolutionValidationResponse {
  graph_id: string;
  metric: string;
  resolutions: number[];
  validation: {
    metric: string;
    resolution_results: Array<{
      resolution: number;
      metric: string;
      score: number;
      passed: boolean;
      tests: Array<{
        test_id: number;
        resolution: number;
        score: number;
        passed: boolean;
        details: string;
      }>;
      pass_rate: number;
      confidence: number;
    }>;
    resolution_count: number;
    optimal_resolution: number;
    optimal_score: number;
    avg_score: number;
    resolution_stability: number;
    grading: string;
    recommendation: string;
  };
  timestamp: number;
}

export interface CrossScaleInterventionResponse {
  graph_id: string;
  source_scale: string;
  target_scale: string;
  intervention: {
    source_scale: string;
    target_scale: string;
    budget: number;
    budget_used: number;
    budget_efficiency: number;
    interventions: Array<{
      intervention_id: number;
      type: string;
      source_scale: string;
      target_scale: string;
      target_node: string;
      cost: number;
      expected_impact: number;
      propagation_mode: string;
      propagated_effects: Array<{
        level: number;
        scale: string;
        effect_magnitude: number;
        affected_nodes: number;
        direction: string;
      }>;
      feasibility: number;
      risk_level: string;
    }>;
    intervention_count: number;
    total_expected_impact: number;
    pareto_frontier: number[];
    pareto_count: number;
    cross_scale_amplification: number;
    intervention_coherence: number;
  };
  timestamp: number;
}

export interface ScaleCompositionResponse {
  graph_id: string;
  pattern: string;
  n_scales: number;
  composition: {
    pattern: string;
    pattern_config: Record<string, unknown>;
    n_scales: number;
    components: Array<{
      component_id: number;
      scale: string;
      internal_edges: Array<{
        source: string;
        target: string;
        weight: number;
        type: string;
      }>;
      internal_edge_count: number;
      node_count: number;
      cohesion: number;
      autonomy: number;
    }>;
    component_count: number;
    interface_edges: Array<{
      from_component: number;
      to_component: number;
      from_scale: string;
      to_scale: string;
      weight: number;
      interface_type: string;
    }>;
    interface_edge_count: number;
    total_nodes: number;
    total_edges: number;
    composition_quality: number;
    modularity: number;
    integration_strength: number;
    scalability_score: number;
  };
  timestamp: number;
}

export interface EngineOverview {
  engine: string;
  version: string;
  endpoints: string[];
  enums: Record<string, string[]>;
  features: Record<string, number>;
  integration: Record<string, string>;
  total_enums: number;
  total_enum_values: number;
}

// ============================================================
// API Functions (3-tier fallback)
// ============================================================

const PREFIX = "/multi-scale-causal";

async function _post<T>(path: string, body: unknown): Promise<T> {
  const url = `${getBackendBaseURL()}${PREFIX}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Multi-Scale Causal API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Discover causal structures at multiple scales.
 * Priority: Backend → Electron IPC → throw
 */
export async function discoverMultiScale(
  request: MultiScaleDiscoveryRequest
): Promise<DiscoveryResponse> {
  try {
    return await _post<DiscoveryResponse>("/discovery", request);
  } catch (err) {
    console.warn("Multi-scale discovery endpoint unreachable:", err);
    throw err;
  }
}

/**
 * Estimate hierarchical causal effects across levels.
 */
export async function estimateHierarchicalEffects(
  request: HierarchicalEffectRequest
): Promise<HierarchicalEffectResponse> {
  try {
    return await _post<HierarchicalEffectResponse>("/hierarchical-effects", request);
  } catch (err) {
    console.warn("Hierarchical effects endpoint unreachable:", err);
    throw err;
  }
}

/**
 * Transfer causal knowledge between scales.
 */
export async function transferCrossScale(
  request: ScaleTransferRequest
): Promise<ScaleTransferResponse> {
  try {
    return await _post<ScaleTransferResponse>("/scale-transfer", request);
  } catch (err) {
    console.warn("Scale transfer endpoint unreachable:", err);
    throw err;
  }
}

/**
 * Validate causal inferences at multiple resolutions.
 */
export async function validateMultiResolution(
  request: MultiResolutionValidationRequest
): Promise<MultiResolutionValidationResponse> {
  try {
    return await _post<MultiResolutionValidationResponse>("/multi-resolution-validation", request);
  } catch (err) {
    console.warn("Multi-resolution validation endpoint unreachable:", err);
    throw err;
  }
}

/**
 * Design cross-scale causal interventions.
 */
export async function designCrossScaleIntervention(
  request: CrossScaleInterventionRequest
): Promise<CrossScaleInterventionResponse> {
  try {
    return await _post<CrossScaleInterventionResponse>("/cross-scale-intervention", request);
  } catch (err) {
    console.warn("Cross-scale intervention endpoint unreachable:", err);
    throw err;
  }
}

/**
 * Compose causal models from multi-scale sub-components.
 */
export async function composeMultiScale(
  request: ScaleCompositionRequest
): Promise<ScaleCompositionResponse> {
  try {
    return await _post<ScaleCompositionResponse>("/scale-composition", request);
  } catch (err) {
    console.warn("Scale composition endpoint unreachable:", err);
    throw err;
  }
}

/**
 * Get engine overview.
 */
export async function getOverview(): Promise<EngineOverview | null> {
  try {
    const url = `${getBackendBaseURL()}${PREFIX}/overview`;
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as EngineOverview;
  } catch (err) {
    console.warn("Multi-scale causal overview endpoint unreachable:", err);
  }
  return null;
}
