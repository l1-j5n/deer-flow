"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  discoverMultiScale,
  estimateHierarchicalEffects,
  transferCrossScale,
  validateMultiResolution,
  designCrossScaleIntervention,
  composeMultiScale,
  getOverview,
  type MultiScaleDiscoveryRequest,
  type HierarchicalEffectRequest,
  type ScaleTransferRequest,
  type MultiResolutionValidationRequest,
  type CrossScaleInterventionRequest,
  type ScaleCompositionRequest,
  type DiscoveryResponse,
  type HierarchicalEffectResponse,
  type ScaleTransferResponse,
  type MultiResolutionValidationResponse,
  type CrossScaleInterventionResponse,
  type ScaleCompositionResponse,
  type EngineOverview,
} from "./api";

const KEY = "multi-scale-causal" as const;

/**
 * Query hook for engine overview.
 */
export function useMultiScaleOverview() {
  return useQuery<EngineOverview | null>({
    queryKey: [KEY, "overview"],
    queryFn: getOverview,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Mutation hook for multi-scale causal discovery.
 */
export function useMultiScaleDiscovery() {
  return useMutation<DiscoveryResponse, Error, MultiScaleDiscoveryRequest>({
    mutationFn: discoverMultiScale,
  });
}

/**
 * Mutation hook for hierarchical effect estimation.
 */
export function useHierarchicalEffects() {
  return useMutation<HierarchicalEffectResponse, Error, HierarchicalEffectRequest>({
    mutationFn: estimateHierarchicalEffects,
  });
}

/**
 * Mutation hook for cross-scale transfer.
 */
export function useScaleTransfer() {
  return useMutation<ScaleTransferResponse, Error, ScaleTransferRequest>({
    mutationFn: transferCrossScale,
  });
}

/**
 * Mutation hook for multi-resolution validation.
 */
export function useMultiResolutionValidation() {
  return useMutation<MultiResolutionValidationResponse, Error, MultiResolutionValidationRequest>({
    mutationFn: validateMultiResolution,
  });
}

/**
 * Mutation hook for cross-scale intervention design.
 */
export function useCrossScaleIntervention() {
  return useMutation<CrossScaleInterventionResponse, Error, CrossScaleInterventionRequest>({
    mutationFn: designCrossScaleIntervention,
  });
}

/**
 * Mutation hook for multi-scale composition.
 */
export function useScaleComposition() {
  return useMutation<ScaleCompositionResponse, Error, ScaleCompositionRequest>({
    mutationFn: composeMultiScale,
  });
}
