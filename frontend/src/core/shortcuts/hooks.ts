import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listShortcuts, getShortcut, updateShortcut, resetShortcuts, getShortcutStats } from "./api";

const SHORTCUTS_KEY = "shortcuts" as const;

export function useShortcuts(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: [SHORTCUTS_KEY, "list", params],
    queryFn: () => listShortcuts(params),
    staleTime: 30_000,
  });
}

export function useShortcut(id: string) {
  return useQuery({
    queryKey: [SHORTCUTS_KEY, "single", id],
    queryFn: () => getShortcut(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useUpdateShortcut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, keyCombo }: { id: string; keyCombo: string }) => updateShortcut(id, keyCombo),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [SHORTCUTS_KEY] });
    },
  });
}

export function useResetShortcuts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resetShortcuts,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [SHORTCUTS_KEY] });
    },
  });
}

export function useShortcutStats() {
  return useQuery({
    queryKey: [SHORTCUTS_KEY, "stats"],
    queryFn: getShortcutStats,
    staleTime: 30_000,
  });
}