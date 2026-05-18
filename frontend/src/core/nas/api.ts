// =============================================================================
// Graph Neural Architecture Search Engine - API Layer (v1.241)
// =============================================================================

import { API_BASE } from "@/core/api";

// Enum Types (6 enums × 6 values = 36 values)
export enum NASSearchStrategy {
  EVOLUTIONARY = "evolutionary",
  REINFORCEMENT_LEARNING = "reinforcement_learning",
  DARTS = "darts",
  BAYESIAN = "bayesian",
  ONE_SHOT = "one_shot",
  PROXYLESS_NAS = "proxyless_nas",
}

export enum GraphSearchSpace {
  GCN_BASED = "gcn_based",
  GAT_BASED = "gat_based",
  GRAPHSAGE_BASED = "graphsage_based",
  TRANSFORMER_BASED = "transformer_based",
  HYBRID = "hybrid",
  CUSTOM = "custom",
}

export enum NASOptimizationObjective {
  ACCURACY = "accuracy",
  FLOPs = "flops",
  LATENCY = "latency",
  MEMORY = "memory",
  PARAMETER_COUNT = "parameter_count",
  MULTI_OBJECTIVE = "multi_objective",
}

export enum EvaluationStrategy {
  FULL_TRAINING = "full_training",
  WEIGHT_SHARING = "weight_sharing",
  SUPERNET = "supernet",
  PREDICTOR_BASED = "predictor_based",
  META_LEARNING = "meta_learning",
  TRANSFER_LEARNING = "transfer_learning",
}

export enum NetworkOperation {
  GRAPH_CONVOLUTION = "graph_convolution",
  ATTENTION = "attention",
  POOLING = "pooling",
  MESSAGE_PASSING = "message_passing",
  SKIP_CONNECTION = "skip_connection",
  NORMALIZATION = "normalization",
}

export enum ArchitectureConstraint {
  MAX_LAYERS = "max_layers",
  MAX_HIDDEN_DIMS = "max_hidden_dims",
  MAX_HEADS = "max_heads",
  RECURRENT = "recurrent",
  SPARSE = "sparse",
  QUANTIZED = "quantized",
}

// Request Types
export interface NASSearchRequest {
  graph_id: string;
  search_strategy: NASSearchStrategy;
  search_space: GraphSearchSpace;
  num_trials: number;
  max_generations: number;
  population_size: number;
  objective: NASOptimizationObjective;
}

export interface NASEvolutionRequest {
  graph_id: string;
  population_size: number;
  num_generations: number;
  mutation_rate: number;
  crossover_rate: number;
  elite_ratio: number;
}

export interface NASDARTSRequest {
  graph_id: string;
  num_epochs: number;
  unrolled: boolean;
  loss_weight: number;
  arch_weight: number;
}

export interface NASPruneRequest {
  graph_id: string;
  prune_ratio: number;
  iterative: boolean;
  l1_weight: number;
}

export interface NASPredictRequest {
  graph_id: string;
  architecture: Record<string, unknown>;
  dataset: string;
  num_train_samples: number;
}

export interface NASBenchRequest {
  graph_id: string;
  benchmarks: string[];
  num_trials: number;
}

// Response Types
export interface NASSearchResponse {
  graph_id: string;
  best_architecture: Record<string, unknown>;
  search_history: Array<Record<string, unknown>>;
  convergence_data: number[];
  timestamp: number;
}

export interface NASEvolutionResponse {
  graph_id: string;
  population: Array<Record<string, unknown>>;
  best_individual: Record<string, unknown>;
  fitness_history: number[];
  timestamp: number;
}

export interface NASDARTSResponse {
  graph_id: string;
  alphas: Record<string, number[]>;
  betas: Record<string, number[]>;
  architecture: Record<string, unknown>;
  edge_weights: Array<{ from: number; to: number; weight: number }>;
  timestamp: number;
}

export interface NASPruneResponse {
  graph_id: string;
  pruned_architecture: Record<string, unknown>;
  compression_ratio: number;
  remaining_params: Record<string, number>;
  timestamp: number;
}

export interface NASPredictResponse {
  graph_id: string;
  predicted_accuracy: number;
  predicted_flops: number;
  confidence_interval: { lower: number; upper: number };
  timestamp: number;
}

export interface NASBenchResponse {
  graph_id: string;
  search_strategy: NASSearchStrategy;
  results: Record<string, unknown>;
  comparison: Record<string, unknown>;
  timestamp: number;
}

export interface NASOverview {
  engine: string;
  version: string;
  description: string;
  endpoints: string[];
  enums: Record<string, string[]>;
  features: Record<string, number>;
  integration: Record<string, string>;
  total_enums: number;
  total_enum_values: number;
}

// API Functions
export async function nasSearch(request: NASSearchRequest): Promise<NASSearchResponse> {
  const res = await fetch(`${API_BASE}/graph/nas/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return res.json();
}

export async function nasEvolution(request: NASEvolutionRequest): Promise<NASEvolutionResponse> {
  const res = await fetch(`${API_BASE}/graph/nas/evolution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return res.json();
}

export async function nasDARTS(request: NASDARTSRequest): Promise<NASDARTSResponse> {
  const res = await fetch(`${API_BASE}/graph/nas/darts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return res.json();
}

export async function nasPrune(request: NASPruneRequest): Promise<NASPruneResponse> {
  const res = await fetch(`${API_BASE}/graph/nas/prune`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return res.json();
}

export async function nasPredict(request: NASPredictRequest): Promise<NASPredictResponse> {
  const res = await fetch(`${API_BASE}/graph/nas/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return res.json();
}

export async function nasBenchmark(request: NASBenchRequest): Promise<NASBenchResponse> {
  const res = await fetch(`${API_BASE}/graph/nas/benchmark`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return res.json();
}

export async function getNASOverview(): Promise<NASOverview> {
  const res = await fetch(`${API_BASE}/graph/nas/overview`);
  return res.json();
}