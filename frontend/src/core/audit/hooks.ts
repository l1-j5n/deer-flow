import { useQuery, useMutation } from "@tanstack/react-query";
import {
  queryAuditEvents,
  getAuditStats,
  getRecentAudit,
  verifyAuditIntegrity,
} from "./api";
import type { AuditQuery } from "./types";

const AUDIT_KEY = "audit" as const;

export function useAuditEvents(query?: AuditQuery) {
  return useQuery({
    queryKey: [AUDIT_KEY, "events", query],
    queryFn: () => queryAuditEvents(query),
    staleTime: 30_000,
  });
}

export function useAuditStats() {
  return useQuery({
    queryKey: [AUDIT_KEY, "stats"],
    queryFn: getAuditStats,
    staleTime: 30_000,
  });
}

export function useAuditRecent(limit = 50, category?: string) {
  return useQuery({
    queryKey: [AUDIT_KEY, "recent", limit, category],
    queryFn: () => getRecentAudit(limit, category),
    staleTime: 15_000,
  });
}

export function useVerifyIntegrity() {
  return useMutation({
    mutationFn: verifyAuditIntegrity,
  });
}
