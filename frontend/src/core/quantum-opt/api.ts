// =============================================================================
// v1.240 - Graph Quantum-Inspired Optimization Engine
// =============================================================================

/**
 * Quantum-Inspired Optimization Engine API
 *
 * Provides quantum optimization algorithms, circuit construction, quantum annealing,
 * hybrid classical-quantum solving, entanglement analysis, and performance benchmarking.
 *
 * Version: v1.240.0
 * Endpoints: 6 POST + 1 GET
 * Enums: 6 × 6 = 36 values
 */

// Enum Types
export enum QuantumAlgorithm {
  QAOA = "qaoa",
  VQE = "vqe",
  QUANTUM_ANNEALING = "quantum_annealing",
  GROVER = "grover",
  SHOR = "shor",
  QFT = "qft",
}

export enum OptimizationObjective {
  MIN_CUT = "min_cut",
  MAX_FLOW = "max_flow",
  GRAPH_COLORING = "graph_coloring",
  TSP = "tsp",
  VERTEX_COVER = "vertex_cover",
  COMMUNITY_DETECTION = "community_detection",
}

export enum EntanglementStrategy {
  FULL = "full",
  PAIRWISE = "pairwise",
  NEAREST_NEIGHBOR = "nearest_neighbor",
  RANDOM = "random",
  ADAPTIVE = "adaptive",
  HIERARCHICAL = "hierarchical",
}

export enum DecoherenceMitigation {
  ERROR_CORRECTION = "error_correction",
  DYNAMICAL_DECOUPLING = "dynamical_decoupling",
  NOISE_ADAPTIVE = "noise_adaptive",
  FAULT_TOLERANT = "fault_tolerant",
  DECOHERENCE_FREE = "decoherence_free",
  MEASUREMENT_ERROR = "measurement_error",
}

export enum CircuitDepth {
  SHALLOW = "shallow",
  MEDIUM = "medium",
  DEEP = "deep",
  ADAPTIVE = "adaptive",
  NISQ_OPTIMIZED = "nisq_optimized",
  THEORETICAL_OPTIMAL = "theoretical_optimal",
}

export enum HybridMode {
  CLASSICAL_PREPROCESSING = "classical_preprocessing",
  QUANTUM_ACCELERATED = "quantum_accelerated",
  VARIATIONAL = "variational",
  QPU_FIRST = "qpu_first",
  CPU_FIRST = "cpu_first",
  ADAPTIVE_SWITCH = "adaptive_switch",
}

// Request Types
export interface QuantumOptimizeRequest {
  graph_id: string;
  algorithm?: QuantumAlgorithm;
  objective?: OptimizationObjective;
  num_qubits?: number;
  shots?: number;
  max_iterations?: number;
}

export interface QuantumCircuitRequest {
  graph_id: string;
  algorithm?: QuantumAlgorithm;
  depth?: CircuitDepth;
  num_qubits?: number;
  entanglement?: EntanglementStrategy;
  mitigation?: DecoherenceMitigation;
}

export interface QuantumAnnealRequest {
  graph_id: string;
  num_reads?: number;
  anneal_time_us?: number;
  chain_strength?: number;
  schedule_type?: string;
}

export interface HybridSolveRequest {
  graph_id: string;
  mode?: HybridMode;
  objective?: OptimizationObjective;
  classical_iterations?: number;
  quantum_iterations?: number;
}

export interface EntanglementRequest {
  graph_id: string;
  strategy?: EntanglementStrategy;
  num_qubits?: number;
  depth?: number;
  connectivity?: string;
}

export interface QuantumBenchmarkRequest {
  graph_id: string;
  algorithms?: QuantumAlgorithm[];
  objective?: OptimizationObjective;
  num_qubits_range?: number[];
}

// Response Types
export interface QuantumOptimizeResponse {
  graph_id: string;
  result: {
    algorithm: string;
    objective: string;
    initial_cost: number;
    final_cost: number;
    optimal_cost: number;
    improvement_percent: number;
    iterations_used: number;
    convergence_iteration: number;
    cost_history: number[];
    num_qubits_used: number;
    total_shots: number;
    success_probability: number;
    algorithm_config: Record<string, any>;
    solution_quality: {
      approximation_ratio: number;
      gap_to_optimal: number;
      feasibility: boolean;
    };
  };
  timestamp: number;
}

export interface QuantumCircuitResponse {
  graph_id: string;
  result: {
    algorithm: string;
    circuit_depth: number;
    circuit_width: number;
    total_gates: number;
    effective_gates_with_mitigation: number;
    single_qubit_gates: number;
    two_qubit_gates: number;
    entangler_count: number;
    fidelity_estimate: number;
    mitigation_strategy: string;
    mitigation_overhead_factor: number;
    depth_profile: string;
    entanglement_strategy: string;
    layers: Array<{
      depth_level: number;
      single_qubit_ops: number;
      two_qubit_ops: number;
      parameterized_gates: number;
      entanglement_pattern: string;
    }>;
    gate_counts: Record<string, number>;
    execution_time_estimate_ms: number;
  };
  timestamp: number;
}

export interface QuantumAnnealResponse {
  graph_id: string;
  result: {
    num_variables: number;
    num_couplings: number;
    num_reads: number;
    anneal_time_us: number;
    chain_strength: number;
    schedule_type: string;
    schedule_points: Array<{
      time_us: number;
      anneal_fraction: number;
    }>;
    results: {
      best_energy: number;
      average_energy: number;
      worst_energy: number;
      energy_std: number;
      ground_state_count: number;
      ground_state_probability: number;
    };
    timing: {
      total_anneal_time_us: number;
      readout_time_us: number;
      programming_time_us: number;
      total_time_us: number;
    };
    qpu_properties: {
      topology: string;
      active_qubits: number;
      chain_break_fraction: number;
      anneal_offset_range: number[];
    };
  };
  timestamp: number;
}

export interface HybridSolveResponse {
  graph_id: string;
  result: {
    mode: string;
    objective: string;
    mode_description: string;
    classical_best_cost: number;
    quantum_best_cost: number;
    hybrid_best_cost: number;
    improvement_over_pure_classical: number;
    improvement_over_pure_quantum: number;
    classical_iterations: number;
    quantum_iterations: number;
    classical_phases: Array<{
      iteration: number;
      cost: number;
      backend: string;
    }>;
    quantum_phases: Array<{
      iteration: number;
      cost: number;
      backend: string;
    }>;
    convergence: {
      total_wall_time_ms: number;
      classical_time_ms: number;
      quantum_time_ms: number;
      speedup_factor: number;
    };
    resource_usage: {
      cpu_cores_used: number;
      qpu_access_time_us: number;
      total_memory_mb: number;
    };
  };
  timestamp: number;
}

export interface EntanglementResponse {
  graph_id: string;
  result: {
    strategy: string;
    num_qubits: number;
    depth: number;
    connectivity: string;
    connectivity_edges: number;
    bell_pair_count: number;
    average_fidelity: number;
    entanglement_entropy: number;
    concurrence: number;
    quantum_volume: number;
    qubit_entanglement_map: Array<{
      qubit: number;
      entangled_partners: number[];
      local_entropy: number;
      participation: number;
    }>;
    depth_analysis: {
      entanglement_spread: number;
      gate_efficiency: number;
      swaps_needed: number;
    };
    resource_estimate: {
      circuit_layers: number;
      total_cnot_count: number;
      total_single_qubit_count: number;
      total_circuit_gates: number;
    };
  };
  timestamp: number;
}

export interface QuantumBenchmarkResponse {
  graph_id: string;
  result: {
    objective: string;
    num_algorithms_benchmarked: number;
    qubit_sizes_tested: number[];
    results: Array<{
      algorithm: string;
      best_cost: number;
      avg_time_ms: number;
      scalability_score: number;
      per_qubit_size: Array<{
        num_qubits: number;
        solution_cost: number;
        time_ms: number;
        fidelity: number;
        gates_required: number;
        approximation_ratio: number;
      }>;
    }>;
    ranking: {
      best_quality: string;
      fastest: string;
      best_scalability: string;
      recommended: string;
    };
    summary: {
      cost_range: number[];
      time_range_ms: number[];
    };
  };
  timestamp: number;
}

export interface QuantumOptOverview {
  engine: string;
  version: string;
  description: string;
  endpoints: string[];
  enums: {
    QuantumAlgorithm: string[];
    OptimizationObjective: string[];
    EntanglementStrategy: string[];
    DecoherenceMitigation: string[];
    CircuitDepth: string[];
    HybridMode: string[];
  };
  features: Record<string, number>;
  integration: Record<string, string>;
  total_enums: number;
  total_enum_values: number;
}

// API Functions
const API_BASE = "http://localhost:8000";

export async function quantumOptimize(
  request: QuantumOptimizeRequest
): Promise<QuantumOptimizeResponse> {
  const response = await fetch(`${API_BASE}/graph/quantum-opt/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function quantumCircuit(
  request: QuantumCircuitRequest
): Promise<QuantumCircuitResponse> {
  const response = await fetch(`${API_BASE}/graph/quantum-opt/circuit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function quantumAnneal(
  request: QuantumAnnealRequest
): Promise<QuantumAnnealResponse> {
  const response = await fetch(`${API_BASE}/graph/quantum-opt/anneal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function hybridSolve(
  request: HybridSolveRequest
): Promise<HybridSolveResponse> {
  const response = await fetch(`${API_BASE}/graph/quantum-opt/hybrid-solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function entanglementAnalysis(
  request: EntanglementRequest
): Promise<EntanglementResponse> {
  const response = await fetch(`${API_BASE}/graph/quantum-opt/entanglement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function quantumBenchmark(
  request: QuantumBenchmarkRequest
): Promise<QuantumBenchmarkResponse> {
  const response = await fetch(`${API_BASE}/graph/quantum-opt/benchmark`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return response.json();
}

export async function getQuantumOptOverview(): Promise<QuantumOptOverview> {
  const response = await fetch(`${API_BASE}/graph/quantum-opt/overview`);
  return response.json();
}
