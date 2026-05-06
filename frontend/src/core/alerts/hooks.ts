import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { evaluateAlerts, getAlertConfig, getAlertHistory, listAlertConfigs, updateAlertConfig } from "./api";
import type { AlertConfigRequest } from "./types";

/** Fetch all alert configurations. */
export function useAlertConfigs() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["alerts", "configs"],
    queryFn: () => listAlertConfigs(),
    refetchOnWindowFocus: false,
  });
  return { configs: data?.configs ?? [], isLoading, error };
}

/** Fetch alert config for a specific agent. */
export function useAlertConfig(agentName: string | null | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["alerts", "config", agentName],
    queryFn: () => getAlertConfig(agentName!),
    enabled: !!agentName,
    refetchOnWindowFocus: false,
  });
  return { config: data ?? null, isLoading, error };
}

/** Update alert config for an agent (mutation). */
export function useUpdateAlertConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, request }: { name: string; request: AlertConfigRequest }) =>
      updateAlertConfig(name, request),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["alerts", "config", variables.name] });
      qc.invalidateQueries({ queryKey: ["alerts", "configs"] });
    },
  });
}

/** Fetch alert history for an agent. */
export function useAlertHistory(agentName: string | null | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["alerts", "history", agentName],
    queryFn: () => getAlertHistory(agentName!),
    enabled: !!agentName,
    refetchOnWindowFocus: false,
  });
  return { history: data?.alerts ?? [], isLoading, error };
}

/** Evaluate alert rules (mutation). */
export function useEvaluateAlerts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: evaluateAlerts,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
