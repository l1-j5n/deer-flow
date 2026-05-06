"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createAgentShare,
  getSharedAgent,
  listAgentShares,
  revokeAgentShare,
} from "./api";

/** List active share links for an agent. */
export function useAgentShares(agentName: string) {
  return useQuery({
    queryKey: ["agent-shares", agentName],
    queryFn: () => listAgentShares(agentName),
    enabled: !!agentName,
    staleTime: 10_000,
  });
}

/** Create a new share link for an agent. */
export function useCreateAgentShare(agentName: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expiresInHours?: number) =>
      createAgentShare(agentName, expiresInHours),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["agent-shares", agentName] });
    },
  });
}

/** Revoke a share link for an agent. */
export function useRevokeAgentShare(agentName: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => revokeAgentShare(agentName, token),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["agent-shares", agentName] });
    },
  });
}

/** Public query — fetch a shared agent by token (no authentication required). */
export function useSharedAgent(token: string) {
  return useQuery({
    queryKey: ["shared-agent", token],
    queryFn: () => getSharedAgent(token),
    enabled: !!token,
    retry: 1,
    staleTime: 60_000,
  });
}
