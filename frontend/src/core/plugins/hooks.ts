import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listPlugins, getPluginStats, enablePlugin, disablePlugin, uninstallPlugin } from "./api";

const PLUGINS_KEY = "plugins" as const;

export function usePlugins(params?: { search?: string; status?: string }) {
  return useQuery({
    queryKey: [PLUGINS_KEY, "list", params],
    queryFn: () => listPlugins(params),
    staleTime: 30_000,
  });
}

export function usePluginStats() {
  return useQuery({
    queryKey: [PLUGINS_KEY, "stats"],
    queryFn: getPluginStats,
    staleTime: 30_000,
  });
}

export function useEnablePlugin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enablePlugin(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [PLUGINS_KEY] });
    },
  });
}

export function useDisablePlugin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => disablePlugin(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [PLUGINS_KEY] });
    },
  });
}

export function useUninstallPlugin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => uninstallPlugin(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [PLUGINS_KEY] });
    },
  });
}
