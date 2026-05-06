import { useQuery } from "@tanstack/react-query";
import { getChartsAnalytics } from "./api";
import type { DashboardAnalytics } from "./types";

/**
 * Fetch chart analytics data with a 3-tier priority
 * (backend API → Electron IPC → null).
 *
 * @param days - Number of days for time-series data (default 7).
 */
export function useChartsAnalytics(days: number = 7) {
  const { data, isLoading, error } = useQuery<DashboardAnalytics | null>({
    queryKey: ["charts", "analytics", days],
    queryFn: () => getChartsAnalytics(days),
    staleTime: 30_000,
    retry: 1,
  });
  return { data: data ?? null, isLoading, error };
}
