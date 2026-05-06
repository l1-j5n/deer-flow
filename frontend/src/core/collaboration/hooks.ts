"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSessions,
  createSession,
  getSession,
  deleteSession,
  addCollaborator,
  removeCollaborator,
  getCollaborationStats,
  getMessages,
  sendMessage,
  createTask,
  updateTask,
} from "./api";
import type { CollaborationTask } from "./types";

const COL_KEY = "collaboration" as const;

export function useCollaborationStats() {
  return useQuery({
    queryKey: [COL_KEY, "stats"],
    queryFn: getCollaborationStats,
    staleTime: 15_000,
  });
}

export function useSessions(status?: string) {
  return useQuery({
    queryKey: [COL_KEY, "sessions", status],
    queryFn: () => listSessions(status),
    staleTime: 10_000,
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: [COL_KEY, "session", id],
    queryFn: () => getSession(id),
    enabled: !!id,
  });
}

export function useSessionMessages(sessionId: string, limit?: number) {
  return useQuery({
    queryKey: [COL_KEY, "messages", sessionId, limit],
    queryFn: () => getMessages(sessionId, limit),
    enabled: !!sessionId,
    staleTime: 5_000,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ title, goal, consensusThreshold }: { title: string; goal: string; consensusThreshold?: number }) =>
      createSession(title, goal, consensusThreshold),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [COL_KEY] });
    },
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSession(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [COL_KEY] });
    },
  });
}

export function useAddCollaborator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      name,
      role,
      capabilities,
      model,
    }: {
      sessionId: string;
      name: string;
      role: string;
      capabilities: string[];
      model?: string;
    }) => addCollaborator(sessionId, name, role, capabilities, model),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [COL_KEY] });
    },
  });
}

export function useRemoveCollaborator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, collaboratorId }: { sessionId: string; collaboratorId: string }) =>
      removeCollaborator(sessionId, collaboratorId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [COL_KEY] });
    },
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      from,
      type,
      content,
      options,
    }: {
      sessionId: string;
      from: string;
      type: string;
      content: string;
      options?: { to?: string; payload?: unknown };
    }) => sendMessage(sessionId, from, type, content, options),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [COL_KEY] });
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      title,
      description,
      options,
    }: {
      sessionId: string;
      title: string;
      description: string;
      options?: { assignedTo?: string; dependencies?: string[]; priority?: number };
    }) => createTask(sessionId, title, description, options),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [COL_KEY] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      taskId,
      updates,
    }: {
      sessionId: string;
      taskId: string;
      updates: Partial<Pick<CollaborationTask, "status" | "assignedTo"> & { result?: unknown; error?: string }>;
    }) => updateTask(sessionId, taskId, updates),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [COL_KEY] });
    },
  });
}
