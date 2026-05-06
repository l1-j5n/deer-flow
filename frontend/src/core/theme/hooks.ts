/**
 * Theme hooks for DeerFlow Electron platform.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ThemeConfig } from "./types";
import { getTheme, updateTheme, resetTheme, getThemePreview, getThemeStats } from "./api";

const THEME_KEY = "theme" as const;

export function useTheme() {
  return useQuery({
    queryKey: [THEME_KEY, "config"],
    queryFn: getTheme,
    staleTime: 30_000,
  });
}

export function useSaveTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<ThemeConfig>) => updateTheme(config),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [THEME_KEY] });
    },
  });
}

export function useResetTheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetTheme,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [THEME_KEY] });
    },
  });
}

export function useThemePreview() {
  return useQuery({
    queryKey: [THEME_KEY, "preview"],
    queryFn: getThemePreview,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useThemeStats() {
  return useQuery({
    queryKey: [THEME_KEY, "stats"],
    queryFn: getThemeStats,
    staleTime: 30_000,
  });
}