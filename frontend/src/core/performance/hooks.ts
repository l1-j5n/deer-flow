import { useQuery } from "@tanstack/react-query";
import { getPerformanceReport, getPerformanceStats } from "./api";
import type { PerformanceReport, PerformanceStats } from "./types";

/**
 * Fetch the system-wide performance report.
 *
 * Uses React Query with 60s stale time — performance data changes slowly.
 */
export function usePerformanceReport() {
  const { data, isLoading, error } = useQuery<PerformanceReport | null>({
    queryKey: ["performance", "report"],
    queryFn: getPerformanceReport,
    staleTime: 60_000, // 60s cache
    retry: 1,
    refetchOnWindowFocus: false,
  });
  return {
    report: data ?? null,
    isLoading,
    error,
  };
}

/**
 * Fetch performance summary statistics for the stat cards.
 */
export function usePerformanceStats() {
  const { data, isLoading, error } = useQuery<PerformanceStats | null>({
    queryKey: ["performance", "stats"],
    queryFn: getPerformanceStats,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  return {
    stats: data ?? null,
    isLoading,
    error,
  };
}
