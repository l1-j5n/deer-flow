"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  enableTask,
  disableTask,
  runTaskNow,
  getHistory,
  getSchedulerStats,
} from "./api";
import type { ScheduledTask } from "./types";

const SCHED_KEY = "scheduler" as const;

export function useSchedulerStats() {
  return useQuery({
    queryKey: [SCHED_KEY, "stats"],
    queryFn: getSchedulerStats,
    staleTime: 15_000,
  });
}

export function useTasks(filters?: { type?: string; status?: string; enabled?: boolean }) {
  return useQuery({
    queryKey: [SCHED_KEY, "tasks", filters],
    queryFn: () => listTasks(filters),
    staleTime: 10_000,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [SCHED_KEY, "task", id],
    queryFn: () => getTask(id),
    enabled: !!id,
  });
}

export function useTaskHistory(taskId?: string) {
  return useQuery({
    queryKey: [SCHED_KEY, "history", taskId],
    queryFn: () => getHistory(taskId),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof createTask>[0]) => createTask(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [SCHED_KEY] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ScheduledTask> }) =>
      updateTask(id, updates),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [SCHED_KEY] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [SCHED_KEY] });
    },
  });
}

export function useEnableTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => enableTask(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [SCHED_KEY] });
    },
  });
}

export function useDisableTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => disableTask(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [SCHED_KEY] });
    },
  });
}

export function useRunTaskNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => runTaskNow(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [SCHED_KEY] });
    },
  });
}
