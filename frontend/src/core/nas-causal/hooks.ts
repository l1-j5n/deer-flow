// =============================================================================
// v1.240 - Graph Neural Architecture Search v5 for Causality - React Query Hooks
// =============================================================================

import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  searchCausalNAS,
  searchCausalCell,
  designInterventionArch,
  searchCounterfactualNAS,
  searchCausalConstraint,
  integrateSCM,
  evaluateCausalNAS,
  getNASCausalOverview,
  type CausalNASRequest,
  type CausalCellSearchRequest,
  type CausalInterventionArchRequest,
  type CausalCounterfactualNASRequest,
  type CausalConstraintNASRequest,
  type CausalSCMIntegrationRequest,
  type CausalEvaluationNASRequest,
  type CausalNASResponse,
  type CausalCellSearchResponse,
  type CausalInterventionArchResponse,
  type CausalCounterfactualNASResponse,
  type CausalConstraintNASResponse,
  type CausalSCMIntegrationResponse,
  type CausalEvaluationNASResponse,
  type NASCausalOverview,
} from "./api";

// Mutation Hooks (POST endpoints)
export function useCausalNASSearch(): UseMutationResult<
  CausalNASResponse,
  Error,
  CausalNASRequest
> {
  return useMutation<CausalNASResponse, Error, CausalNASRequest>({
    mutationFn: searchCausalNAS,
  });
}

export function useCausalCellSearch(): UseMutationResult<
  CausalCellSearchResponse,
  Error,
  CausalCellSearchRequest
> {
  return useMutation<CausalCellSearchResponse, Error, CausalCellSearchRequest>({
    mutationFn: searchCausalCell,
  });
}

export function useInterventionArchDesign(): UseMutationResult<
  CausalInterventionArchResponse,
  Error,
  CausalInterventionArchRequest
> {
  return useMutation<
    CausalInterventionArchResponse,
    Error,
    CausalInterventionArchRequest
  >({
    mutationFn: designInterventionArch,
  });
}

export function useCounterfactualNAS(): UseMutationResult<
  CausalCounterfactualNASResponse,
  Error,
  CausalCounterfactualNASRequest
> {
  return useMutation<
    CausalCounterfactualNASResponse,
    Error,
    CausalCounterfactualNASRequest
  >({
    mutationFn: searchCounterfactualNAS,
  });
}

export function useCausalConstraintSearch(): UseMutationResult<
  CausalConstraintNASResponse,
  Error,
  CausalConstraintNASRequest
> {
  return useMutation<
    CausalConstraintNASResponse,
    Error,
    CausalConstraintNASRequest
  >({
    mutationFn: searchCausalConstraint,
  });
}

export function useSCMIntegration(): UseMutationResult<
  CausalSCMIntegrationResponse,
  Error,
  CausalSCMIntegrationRequest
> {
  return useMutation<
    CausalSCMIntegrationResponse,
    Error,
    CausalSCMIntegrationRequest
  >({
    mutationFn: integrateSCM,
  });
}

export function useCausalEvaluation(): UseMutationResult<
  CausalEvaluationNASResponse,
  Error,
  CausalEvaluationNASRequest
> {
  return useMutation<
    CausalEvaluationNASResponse,
    Error,
    CausalEvaluationNASRequest
  >({
    mutationFn: evaluateCausalNAS,
  });
}

// Query Hooks (GET endpoints)
export function useNASCausalOverview(): UseQueryResult<NASCausalOverview, Error> {
  return useQuery<NASCausalOverview, Error>({
    queryKey: ["nas-causal-overview"],
    queryFn: getNASCausalOverview,
    staleTime: 5 * 60 * 1000,
  });
}
