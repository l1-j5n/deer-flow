import { useQuery } from "@tanstack/react-query";
import { getSecurityStats, listPolicies, getRateLimit } from "./api";

const SECURITY_KEY = "security" as const;

export function useSecurityStats() {
  return useQuery({
    queryKey: [SECURITY_KEY, "stats"],
    queryFn: getSecurityStats,
    staleTime: 30_000,
  });
}

export function useSecurityPolicies(params?: {
  category?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [SECURITY_KEY, "policies", params],
    queryFn: () => listPolicies(params),
    staleTime: 30_000,
  });
}

export function useRateLimitStatus() {
  return useQuery({
    queryKey: [SECURITY_KEY, "rate-limit"],
    queryFn: getRateLimit,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}
