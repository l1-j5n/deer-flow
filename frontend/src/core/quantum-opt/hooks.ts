// =============================================================================
// v1.240 - Graph Quantum-Inspired Optimization Engine
// =============================================================================

import { useMutation, useQuery } from "@tanstack/react-query";
import {
  quantumOptimize,
  quantumCircuit,
  quantumAnneal,
  hybridSolve,
  entanglementAnalysis,
  quantumBenchmark,
  getQuantumOptOverview,
  type QuantumOptimizeRequest,
  type QuantumCircuitRequest,
  type QuantumAnnealRequest,
  type HybridSolveRequest,
  type EntanglementRequest,
  type QuantumBenchmarkRequest,
  type QuantumOptOverview,
} from "./api";

export function useQuantumOptimize() {
  return useMutation({
    mutationFn: (request: QuantumOptimizeRequest) => quantumOptimize(request),
  });
}

export function useQuantumCircuit() {
  return useMutation({
    mutationFn: (request: QuantumCircuitRequest) => quantumCircuit(request),
  });
}

export function useQuantumAnneal() {
  return useMutation({
    mutationFn: (request: QuantumAnnealRequest) => quantumAnneal(request),
  });
}

export function useHybridSolve() {
  return useMutation({
    mutationFn: (request: HybridSolveRequest) => hybridSolve(request),
  });
}

export function useEntanglementAnalysis() {
  return useMutation({
    mutationFn: (request: EntanglementRequest) => entanglementAnalysis(request),
  });
}

export function useQuantumBenchmark() {
  return useMutation({
    mutationFn: (request: QuantumBenchmarkRequest) => quantumBenchmark(request),
  });
}

export function useQuantumOptOverview() {
  return useQuery({
    queryKey: ["quantum-opt-overview"],
    queryFn: getQuantumOptOverview,
  });
}
