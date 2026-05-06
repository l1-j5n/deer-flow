import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listTraces, getTrace, getReasoningStats, deleteTrace } from "./api";

const REASONING_KEY = "reasoning" as const;

export function useReasoningTraces(params?: {
  search?: string;
  strategy?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: [REASONING_KEY, "traces", params],
    queryFn: () => listTraces(params),
    staleTime: 15_000,
  });
}

export function useReasoningTrace(id: string) {
  return useQuery({
    queryKey: [REASONING_KEY, "trace", id],
    queryFn: () => getTrace(id),
    staleTime: 15_000,
    enabled: !!id,
  });
}

export function useReasoningStats() {
  return useQuery({
    queryKey: [REASONING_KEY, "stats"],
    queryFn: getReasoningStats,
    staleTime: 15_000,
  });
}

export function useDeleteReasoningTrace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTrace(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [REASONING_KEY] });
    },
  });
}
