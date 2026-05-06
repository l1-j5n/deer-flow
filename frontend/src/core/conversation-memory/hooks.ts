import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryMemories, getMemoryStats, updateMemory, deleteMemory } from "./api";
import type { MemoryQueryParams, UpdateMemoryRequest } from "./types";

const CM_KEY = "conversation-memory" as const;

export function useMemories(params?: MemoryQueryParams) {
  return useQuery({
    queryKey: [CM_KEY, "list", params],
    queryFn: () => queryMemories(params),
    staleTime: 15_000,
  });
}

export function useMemoryStats() {
  return useQuery({
    queryKey: [CM_KEY, "stats"],
    queryFn: getMemoryStats,
    staleTime: 15_000,
  });
}

export function useUpdateMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateMemoryRequest }) =>
      updateMemory(id, updates),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [CM_KEY] });
    },
  });
}

export function useDeleteMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMemory(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [CM_KEY] });
    },
  });
}
