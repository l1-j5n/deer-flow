import { useQuery } from "@tanstack/react-query";
import { getDashboardAnalytics, getDashboardStats } from "./api";
import type { DashboardAnalytics, DashboardStats } from "./types";

/**
 * Fetch aggregated dashboard analytics for the charts page.
 *
 * @param days - Number of days for time-series data (default 7).
 */
export function useDashboardAnalytics(days: number = 7) {
  const { data, isLoading, error } = useQuery<DashboardAnalytics | null>({
    queryKey: ["dashboard", "analytics", days],
    queryFn: () => getDashboardAnalytics(days),
    staleTime: 30_000,
    retry: 1,
  });
  return { data: data ?? null, isLoading, error };
}

/**
 * Fetch dashboard KPI stats with automatic 30s polling.
 * Returns health, resources, agents, services, memory, and tools data.
 */
export function useDashboardStats() {
  const { data, isLoading, error, refetch } = useQuery<DashboardStats | null>({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
    staleTime: 15_000,
    refetchInterval: 30_000, // Auto-refresh every 30s
    retry: 1,
  });
  return { data: data ?? null, isLoading, error, refresh: refetch };
}
