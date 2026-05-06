/**
 * React Query hooks for health monitoring.
 *
 * - useHealthReport(): auto-refetch every 30s for live monitoring
 * - useHealthStats(): summary KPI stats, also 30s stale time
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { getHealthReport, getHealthStats } from "./api";

export function useHealthReport() {
  return useQuery({
    queryKey: ["health", "report"],
    queryFn: getHealthReport,
    staleTime: 30_000,
    refetchInterval: 30_000,
    retry: 1,
  });
}

export function useHealthStats() {
  return useQuery({
    queryKey: ["health", "stats"],
    queryFn: getHealthStats,
    staleTime: 30_000,
    retry: 1,
  });
}
