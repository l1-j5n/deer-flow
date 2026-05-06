import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, saveSettings, resetSettings, getAppInfo } from "./api";
import type { SettingsUpdate } from "./types";

const SETTINGS_KEY = "electron-settings" as const;

/* ── Queries ─────────────────────────────────────────────────────── */

export function useElectronSettings() {
  return useQuery({
    queryKey: [SETTINGS_KEY],
    queryFn: getSettings,
    staleTime: 60_000,
  });
}

export function useAppInfo() {
  return useQuery({
    queryKey: [SETTINGS_KEY, "about"],
    queryFn: getAppInfo,
    staleTime: 300_000,
  });
}

/* ── Mutations ───────────────────────────────────────────────────── */

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SettingsUpdate) => saveSettings(data),
    onSuccess: (saved) => {
      qc.setQueryData([SETTINGS_KEY], saved);
    },
  });
}

export function useResetSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => resetSettings(),
    onSuccess: (defaults) => {
      qc.setQueryData([SETTINGS_KEY], defaults);
    },
  });
}
