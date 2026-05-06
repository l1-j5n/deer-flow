import { useQuery } from "@tanstack/react-query";
import { listTools, getToolAnalytics, getTopTools, getToolStats } from "./api";

const TOOLS_KEY = "tools-registry" as const;

export function useTools(params?: {
  search?: string;
  category?: string;
  status?: string;
  source?: string;
}) {
  return useQuery({
    queryKey: [TOOLS_KEY, "list", params],
    queryFn: () => listTools(params),
    staleTime: 30_000,
  });
}

export function useToolAnalytics() {
  return useQuery({
    queryKey: [TOOLS_KEY, "analytics"],
    queryFn: getToolAnalytics,
    staleTime: 30_000,
  });
}

export function useTopTools(limit = 10) {
  return useQuery({
    queryKey: [TOOLS_KEY, "top", limit],
    queryFn: () => getTopTools(limit),
    staleTime: 30_000,
  });
}

export function useToolStats() {
  return useQuery({
    queryKey: [TOOLS_KEY, "stats"],
    queryFn: getToolStats,
    staleTime: 30_000,
  });
}
