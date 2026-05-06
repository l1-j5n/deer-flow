import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getBackendBaseURL } from "@/core/config";

import {
  compareAgentStats,
  createAgent,
  deleteAgent,
  deleteAgentsBatch,
  exportAgent,
  exportAgentsBatch,
  getAgent,
  getAgentStats,
  getAgentTiming,
  importAgent,
  importAgentsBatch,
  listAgents,
  updateAgent,
} from "./api";
import type { AgentStats, CreateAgentRequest, UpdateAgentRequest, TimingHistory } from "./types";
import type { AgentCompareResponse, AgentExportData, BatchImportResponse } from "./api";

export function useAgents() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["agents"],
    queryFn: () => listAgents(),
  });
  return { agents: data ?? [], isLoading, error };
}

export function useAgent(name: string | null | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["agents", name],
    queryFn: () => getAgent(name!),
    enabled: !!name,
  });
  return { agent: data ?? null, isLoading, error };
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateAgentRequest) => createAgent(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      request,
    }: {
      name: string;
      request: UpdateAgentRequest;
    }) => updateAgent(name, request),
    onSuccess: (_data, { name }) => {
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
      void queryClient.invalidateQueries({ queryKey: ["agents", name] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteAgent(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useExportAgent() {
  return useMutation({
    mutationFn: (name: string) => exportAgent(name),
  });
}

export function useImportAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, overwrite }: { data: AgentExportData; overwrite?: boolean }) =>
      importAgent(data, overwrite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useExportAgentsBatch() {
  return useMutation({
    mutationFn: (names: string[]) => exportAgentsBatch(names),
  });
}

export function useImportAgentsBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, overwrite }: { file: File; overwrite?: boolean }) =>
      importAgentsBatch(file, overwrite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useDeleteAgentsBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (names: string[]) => deleteAgentsBatch(names),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useAgentStats(name: string | null | undefined) {
  const { data, isLoading, error } = useQuery<AgentStats>({
    queryKey: ["agents", name, "stats"],
    queryFn: () => getAgentStats(name!),
    enabled: !!name,
    refetchOnWindowFocus: false,
  });
  return { stats: data ?? null, isLoading, error };
}

export function useAgentTiming(name: string | null | undefined) {
  const { data, isLoading, error } = useQuery<TimingHistory>({
    queryKey: ["agents", name, "timing"],
    queryFn: () => getAgentTiming(name!),
    enabled: !!name,
    refetchOnWindowFocus: false,
  });
  return { timing: data ?? null, isLoading, error };
}

export function useAgentComparison(names: string[]) {
  const safeNames = names ?? [];
  const { data, isLoading, error } = useQuery<AgentCompareResponse>({
    queryKey: ["agents", "compare", safeNames.sort().join(",")],
    queryFn: () => compareAgentStats(safeNames),
    enabled: safeNames.length >= 2,
    refetchOnWindowFocus: false,
  });
  return { comparison: data ?? null, isLoading, error };
}

// ── Agent Status with Response Time Tracking ───────────────────────────────

export type AgentStatus = "online" | "offline" | "busy" | "unknown";

export interface AgentStatusData {
  status: AgentStatus;
  responseTimeMs: number | null;
  lastSeen: string | null;
  version: string | null;
}

export function useAgentStatus(agentName: string | null | undefined) {
  const [statusData, setStatusData] = useState<AgentStatusData>({
    status: "unknown",
    responseTimeMs: null,
    lastSeen: null,
    version: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!agentName) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let pingInterval: ReturnType<typeof setInterval> | null = null;

    const connect = () => {
      const wsUrl = `${getBackendBaseURL().replace(/^http/, "ws")}/ws/agents/${encodeURIComponent(agentName)}/status`;
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!mounted) return;
          // Send ping every 30s to keep connection alive and measure RTT
          pingInterval = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              const pingMsg = JSON.stringify({ type: "ping", ts: Date.now() });
              ws.send(pingMsg);
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          if (!mounted) return;
          try {
            const msg = JSON.parse(event.data as string) as {
              type: string;
              status?: AgentStatus;
              responseTimeMs?: number;
              lastSeen?: string;
              version?: string;
              ts?: number;
            };

            if (msg.type === "pong" && msg.ts) {
              const rtt = Date.now() - msg.ts;
              setStatusData((prev) => ({
                ...prev,
                responseTimeMs: rtt,
              }));
              return;
            }

            if (msg.type === "status" && msg.status) {
              setStatusData({
                status: msg.status,
                responseTimeMs: msg.responseTimeMs ?? null,
                lastSeen: msg.lastSeen ?? null,
                version: msg.version ?? null,
              });
            }
          } catch {
            // Ignore malformed messages
          }
        };

        ws.onerror = () => {
          // Silently handle error; onclose will trigger reconnect
        };

        ws.onclose = () => {
          if (!mounted) return;
          if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
          }
          // Reconnect after 5s
          reconnectTimer = setTimeout(connect, 5000);
        };
      } catch {
        // WebSocket not supported or connection failed
        setIsLoading(false);
      }
    };

    // Fallback: fetch status via HTTP first
    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `${getBackendBaseURL()}/api/agents/${encodeURIComponent(agentName!)}/status`
        );
        if (!res.ok) throw new Error("Failed to fetch status");
        const data = (await res.json()) as AgentStatusData;
        if (mounted) {
          setStatusData(data);
          setIsLoading(false);
        }
      } catch {
        if (mounted) setIsLoading(false);
      }
    };

    fetchStatus();
    connect();

    return () => {
      mounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingInterval) clearInterval(pingInterval);
      if (ws) ws.close();
    };
  }, [agentName]);

  return { statusData, isLoading };
}

// --- Version History Hooks ---

import type {
  AgentVersionDetail,
  AgentVersionDiffResponse,
  AgentVersionsResponse,
  RestoreVersionResponse,
} from "./types";
import { diffAgentVersions, getAgentVersion, getAgentVersions, restoreAgentVersion } from "./api";

export function useAgentVersions(name: string | null | undefined) {
  const { data, isLoading, error } = useQuery<AgentVersionsResponse>({
    queryKey: ["agents", name, "versions"],
    queryFn: () => getAgentVersions(name!),
    enabled: !!name,
    refetchOnWindowFocus: false,
  });
  return { versions: data ?? null, isLoading, error };
}

export function useAgentVersion(
  name: string | null | undefined,
  versionId: string | null | undefined,
) {
  const { data, isLoading, error } = useQuery<AgentVersionDetail>({
    queryKey: ["agents", name, "versions", versionId],
    queryFn: () => getAgentVersion(name!, versionId!),
    enabled: !!name && !!versionId,
    refetchOnWindowFocus: false,
  });
  return { version: data ?? null, isLoading, error };
}

export function useRestoreAgentVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, versionId }: { name: string; versionId: string }) =>
      restoreAgentVersion(name, versionId),
    onSuccess: (_data, { name }) => {
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
      void queryClient.invalidateQueries({ queryKey: ["agents", name] });
      void queryClient.invalidateQueries({ queryKey: ["agents", name, "versions"] });
      void queryClient.invalidateQueries({ queryKey: ["agents", name, "stats"] });
    },
  });
}

export function useAgentVersionDiff(
  name: string | null | undefined,
  fromVersion: string | null | undefined,
  toVersion: string | null | undefined,
) {
  const { data, isLoading, error } = useQuery<AgentVersionDiffResponse>({
    queryKey: ["agents", name, "versions", "diff", fromVersion, toVersion],
    queryFn: () => diffAgentVersions(name!, fromVersion!, toVersion!),
    enabled: !!name && !!fromVersion && !!toVersion,
    refetchOnWindowFocus: false,
  });
  return { diff: data ?? null, isLoading, error };
}
