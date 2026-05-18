// =============================================================================
// v1.238 - Graph Causal Temporal Dynamics Engine - React Hooks
// =============================================================================

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  simulateTemporalEvolution,
  detectCausalDrift,
  forecastTemporalCausal,
  timedIntervention,
  analyzeTemporalPattern,
  trackCausalLifecycle,
  getTemporalCausalOverview,
  type TemporalEvolutionRequest,
  type DriftDetectionRequest,
  type TemporalForecastRequest,
  type TimedInterventionRequest,
  type TemporalPatternRequest,
  type CausalLifecycleRequest,
} from './api';

// Hook for simulating temporal evolution
export function useTemporalEvolution() {
  return useMutation({
    mutationFn: (request: TemporalEvolutionRequest) => simulateTemporalEvolution(request),
  });
}

// Hook for detecting causal drift
export function useCausalDriftDetection() {
  return useMutation({
    mutationFn: (request: DriftDetectionRequest) => detectCausalDrift(request),
  });
}

// Hook for forecasting temporal causal states
export function useTemporalForecast() {
  return useMutation({
    mutationFn: (request: TemporalForecastRequest) => forecastTemporalCausal(request),
  });
}

// Hook for planning timed interventions
export function useTimedIntervention() {
  return useMutation({
    mutationFn: (request: TimedInterventionRequest) => timedIntervention(request),
  });
}

// Hook for analyzing temporal patterns
export function useTemporalPatternAnalysis() {
  return useMutation({
    mutationFn: (request: TemporalPatternRequest) => analyzeTemporalPattern(request),
  });
}

// Hook for tracking causal edge lifecycle
export function useCausalLifecycle() {
  return useMutation({
    mutationFn: (request: CausalLifecycleRequest) => trackCausalLifecycle(request),
  });
}

// Hook for getting engine overview
export function useTemporalCausalOverview() {
  return useQuery({
    queryKey: ['temporal-causal', 'overview'],
    queryFn: getTemporalCausalOverview,
  });
}