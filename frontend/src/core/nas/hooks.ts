// =============================================================================
// Graph Neural Architecture Search Engine - React Query Hooks (v1.241)
// =============================================================================

import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  nasSearch,
  nasEvolution,
  nasDARTS,
  nasPrune,
  nasPredict,
  nasBenchmark,
  getNASOverview,
  type NASSearchRequest,
  type NASEvolutionRequest,
  type NASDARTSRequest,
  type NASPruneRequest,
  type NASPredictRequest,
  type NASBenchRequest,
  type NASSearchResponse,
  type NASEvolutionResponse,
  type NASDARTSResponse,
  type NASPruneResponse,
  type NASPredictResponse,
  type NASBenchResponse,
  type NASOverview,
} from "./api";

// Mutation Hooks (POST endpoints)
export function useNASSearch(): UseMutationResult<NASSearchResponse, Error, NASSearchRequest> {
  return useMutation<NASSearchResponse, Error, NASSearchRequest>({
    mutationFn: nasSearch,
  });
}

export function useNASEvolution(): UseMutationResult<NASEvolutionResponse, Error, NASEvolutionRequest> {
  return useMutation<NASEvolutionResponse, Error, NASEvolutionRequest>({
    mutationFn: nasEvolution,
  });
}

export function useNASDARTS(): UseMutationResult<NASDARTSResponse, Error, NASDARTSRequest> {
  return useMutation<NASDARTSResponse, Error, NASDARTSRequest>({
    mutationFn: nasDARTS,
  });
}

export function useNASPrune(): UseMutationResult<NASPruneResponse, Error, NASPruneRequest> {
  return useMutation<NASPruneResponse, Error, NASPruneRequest>({
    mutationFn: nasPrune,
  });
}

export function useNASPredict(): UseMutationResult<NASPredictResponse, Error, NASPredictRequest> {
  return useMutation<NASPredictResponse, Error, NASPredictRequest>({
    mutationFn: nasPredict,
  });
}

export function useNASBenchmark(): UseMutationResult<NASBenchResponse, Error, NASBenchRequest> {
  return useMutation<NASBenchResponse, Error, NASBenchRequest>({
    mutationFn: nasBenchmark,
  });
}

// Query Hooks (GET endpoints)
export function useNASOverview(): UseQueryResult<NASOverview, Error> {
  return useQuery<NASOverview, Error>({
    queryKey: ["nas-overview"],
    queryFn: getNASOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}