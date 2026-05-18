// =============================================================================
// v1.238 - Graph Causal Temporal Dynamics Engine
// =============================================================================

/**
 * Causal Temporal Dynamics Engine API
 *
 * Provides temporal evolution simulation, drift detection, forecast,
 * timed interventions, pattern analysis, and causal edge lifecycle tracking.
 *
 * Version: v1.238.0
 * Endpoints: 6 POST + 1 GET
 * Enums: 6 × 6 = 36 values
 */

// Enum Types
export enum TemporalGranularity {
  TICK = "tick",
  SECOND = "second",
  MINUTE = "minute",
  HOUR = "hour",
  DAY = "day",
  ADAPTIVE = "adaptive",
}

export enum CausalTransition {
  EDGE_APPEARANCE = "edge_appearance",
  EDGE_DISAPPEARANCE = "edge_disappearance",
  STRENGTH_CHANGE = "strength_change",
  DIRECTION_REVERSAL = "direction_reversal",
  FEEDBACK_LOOP = "feedback_loop",
  LATENT_ACTIVATION = "latent_activation",
}

export enum TemporalPattern {
  PERIODIC = "periodic",
  TREND = "trend",
  REGIME_SHIFT = "regime_shift",
  SEASONAL = "seasonal",
  INTERMITTENT = "intermittent",
  CUMULATIVE = "cumulative",
}

export enum InterventionTiming {
  IMMEDIATE = "immediate",
  DELAYED = "delayed",
  SCHEDULED = "scheduled",
  CONDITIONAL = "conditional",
  RECURRING = "recurring",
  OPTIMAL = "optimal",
}

export enum DriftDetector {
  PAGE_HINKLEY = "page_hinkley",
  CUSUM = "cusum",
  ADWIN = "adwin",
  KULLBACK_LEIBLER = "kl_divergence",
  MANN_WHITNEY = "mann_whitney",
  KERNEL_MMD = "kernel_mmd",
}

export enum ForecastHorizon {
  SHORT_TERM = "short_term",
  MEDIUM_TERM = "medium_term",
  LONG_TERM = "long_term",
  EXTENDED = "extended",
  MULTI_SCALE = "multi_scale",
  EVENT_DRIVEN = "event_driven",
}

// Request Types
export interface TemporalEvolutionRequest {
  graph_id: string;
  granularity: TemporalGranularity;
  n_steps: number;
  transition_types: CausalTransition[];
}

export interface DriftDetectionRequest {
  graph_id: string;
  detector: DriftDetector;
  window_size: number;
  sensitivity: number;
  edges: string[];
}

export interface TemporalForecastRequest {
  graph_id: string;
  horizon: ForecastHorizon;
  n_steps_ahead: number;
  confidence_level: number;
}

export interface TimedInterventionRequest {
  graph_id: string;
  timing: InterventionTiming;
  target_node: string;
  delay_steps: number;
  n_interventions: number;
}

export interface TemporalPatternRequest {
  graph_id: string;
  pattern: TemporalPattern;
  analysis_window: number;
  min_occurrences: number;
}

export interface CausalLifecycleRequest {
  graph_id: string;
  edge_id: string;
  granularity: TemporalGranularity;
}

// Response Types
export interface TemporalEvolutionResponse {
  graph_id: string;
  result: {
    granularity: string;
    granularity_info: Record<string, unknown>;
    n_steps: number;
    n_transitions: number;
    transitions: Array<{
      step: number;
      type: string;
      description: string;
      source: string;
      target: string;
      old_strength: number;
      new_strength: number;
      confidence: number;
      reversibility: string;
      duration_estimate: number;
    }>;
    snapshots: Array<{
      time_step: number;
      total_edges: number;
      active_edges: number;
      emerging_edges: number;
      vanishing_edges: number;
      avg_strength: number;
      graph_density: number;
      connectivity: number;
      feedback_loops: number;
      d_separation_changes: number;
    }>;
    stability_profile: {
      structural_stability: number;
      effect_consistency: number;
      intervention_durability: number;
      prediction_reliability: number;
      adaptation_rate: number;
    };
    temporal_complexity: number;
    evolution_regime: string;
  };
  timestamp: number;
}

export interface DriftDetectionResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface TemporalForecastResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface TimedInterventionResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface TemporalPatternResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface CausalLifecycleResponse {
  graph_id: string;
  result: Record<string, unknown>;
  timestamp: number;
}

export interface TemporalCausalOverview {
  engine: string;
  version: string;
  endpoints: string[];
  enums: {
    TemporalGranularity: string[];
    CausalTransition: string[];
    TemporalPattern: string[];
    InterventionTiming: string[];
    DriftDetector: string[];
    ForecastHorizon: string[];
  };
  features: {
    temporal_granularities: number;
    causal_transitions: number;
    temporal_patterns: number;
    intervention_timings: number;
    drift_detectors: number;
    forecast_horizons: number;
  };
  integration: Record<string, string>;
  total_enums: number;
  total_enum_values: number;
}

// API Functions
export async function simulateTemporalEvolution(
  request: TemporalEvolutionRequest
): Promise<TemporalEvolutionResponse> {
  const response = await fetch('/api/temporal-causal/evolution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to simulate temporal evolution');
  return response.json();
}

export async function detectCausalDrift(
  request: DriftDetectionRequest
): Promise<DriftDetectionResponse> {
  const response = await fetch('/api/temporal-causal/drift', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to detect causal drift');
  return response.json();
}

export async function forecastTemporalCausal(
  request: TemporalForecastRequest
): Promise<TemporalForecastResponse> {
  const response = await fetch('/api/temporal-causal/forecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to forecast temporal causal');
  return response.json();
}

export async function timedIntervention(
  request: TimedInterventionRequest
): Promise<TimedInterventionResponse> {
  const response = await fetch('/api/temporal-causal/intervene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to plan timed intervention');
  return response.json();
}

export async function analyzeTemporalPattern(
  request: TemporalPatternRequest
): Promise<TemporalPatternResponse> {
  const response = await fetch('/api/temporal-causal/pattern', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to analyze temporal pattern');
  return response.json();
}

export async function trackCausalLifecycle(
  request: CausalLifecycleRequest
): Promise<CausalLifecycleResponse> {
  const response = await fetch('/api/temporal-causal/lifecycle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to track causal lifecycle');
  return response.json();
}

export async function getTemporalCausalOverview(): Promise<TemporalCausalOverview> {
  const response = await fetch('/api/temporal-causal/overview');
  if (!response.ok) throw new Error('Failed to get overview');
  return response.json();
}

// Export all types and functions
export default {
  // Enums
  TemporalGranularity,
  CausalTransition,
  TemporalPattern,
  InterventionTiming,
  DriftDetector,
  ForecastHorizon,

  // API functions
  simulateTemporalEvolution,
  detectCausalDrift,
  forecastTemporalCausal,
  timedIntervention,
  analyzeTemporalPattern,
  trackCausalLifecycle,
  getTemporalCausalOverview,
};