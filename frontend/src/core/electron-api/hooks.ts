/**
 * DeerFlow Electron API React Hooks
 *
 * Convenient React hooks for accessing Electron backend modules
 * from frontend components with loading/error states.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================
// Generic Async Hook Factory
// ============================================================

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  intervalMs?: number
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcherRef
      .current()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
    if (intervalMs && intervalMs > 0) {
      const id = setInterval(refresh, intervalMs);
      return () => clearInterval(id);
    }
  }, deps);

  return { data, loading, error, refresh };
}

// ============================================================
// Health Monitor Hooks
// ============================================================

export function useHealthStatus(intervalMs = 30000) {
  return useAsync(
    () =>
      window.electronAPI?.healthMonitor?.getStats() ??
      Promise.resolve(null),
    [],
    intervalMs
  );
}

export function useHealthSnapshot(intervalMs = 30000) {
  return useAsync(
    () =>
      window.electronAPI?.healthMonitor?.getSnapshot() ??
      Promise.resolve(null),
    [],
    intervalMs
  );
}

export function useHealthIssues() {
  return useAsync(
    () =>
      window.electronAPI?.healthMonitor?.getIssues() ??
      Promise.resolve([]),
    []
  );
}

// ============================================================
// Collaboration Hooks
// ============================================================

export function useCollaborationSessions() {
  return useAsync(
    () =>
      window.electronAPI?.collaboration?.listSessions() ??
      Promise.resolve([]),
    []
  );
}

export function useCollaborationSession(id: string | null) {
  return useAsync(
    () =>
      id
        ? window.electronAPI?.collaboration?.getSession(id) ??
          Promise.resolve(null)
        : Promise.resolve(null),
    [id]
  );
}

export function useCollaborationStats() {
  return useAsync(
    () =>
      window.electronAPI?.collaboration?.getStats() ??
      Promise.resolve(null),
    []
  );
}

// ============================================================
// Knowledge Graph Hooks
// ============================================================

export function useKnowledgeGraphEntities(query?: Record<string, unknown>) {
  return useAsync(
    () =>
      window.electronAPI?.knowledgeGraph?.searchEntities(query ?? {}) ??
      Promise.resolve([]),
    [JSON.stringify(query)]
  );
}

export function useKnowledgeGraphStats() {
  return useAsync(
    () =>
      window.electronAPI?.knowledgeGraph?.getStats() ??
      Promise.resolve(null),
    []
  );
}

export function useKnowledgeGraphViz() {
  return useAsync(
    () =>
      window.electronAPI?.knowledgeGraph?.exportViz() ??
      Promise.resolve({ nodes: [], edges: [] }),
    []
  );
}

// ============================================================
// Scheduler Hooks
// ============================================================

export function useSchedulerTasks() {
  return useAsync(
    () =>
      window.electronAPI?.scheduler?.listTasks() ?? Promise.resolve([]),
    []
  );
}

export function useSchedulerStats() {
  return useAsync(
    () =>
      window.electronAPI?.scheduler?.getStats() ?? Promise.resolve(null),
    []
  );
}

export function useSchedulerHistory(taskId?: string) {
  return useAsync(
    () =>
      window.electronAPI?.scheduler?.getHistory(taskId) ??
      Promise.resolve([]),
    [taskId]
  );
}

// ============================================================
// Tool Registry Hooks
// ============================================================

export function useToolRegistry(query?: Record<string, unknown>) {
  return useAsync(
    () =>
      window.electronAPI?.toolRegistry?.search(query ?? {}) ??
      Promise.resolve([]),
    [JSON.stringify(query)]
  );
}

export function useToolRegistryStats() {
  return useAsync(
    () =>
      window.electronAPI?.toolRegistry?.getStats() ?? Promise.resolve(null),
    []
  );
}

export function useToolRecommendations(context: unknown) {
  return useAsync(
    () =>
      window.electronAPI?.toolRegistry?.getRecommendations(context) ??
      Promise.resolve([]),
    [JSON.stringify(context)]
  );
}

// ============================================================
// Conversation Memory Hooks
// ============================================================

export function useMemoryEntries(query?: Record<string, unknown>) {
  return useAsync(
    () =>
      window.electronAPI?.conversationMemory?.query(query ?? {}) ??
      Promise.resolve([]),
    [JSON.stringify(query)]
  );
}

export function useMemoryStats() {
  return useAsync(
    () =>
      window.electronAPI?.conversationMemory?.getStats() ??
      Promise.resolve(null),
    []
  );
}

export function useMemoryTopics(sessionId?: string, limit = 10) {
  return useAsync(
    () =>
      window.electronAPI?.conversationMemory?.getTopics(sessionId, limit) ??
      Promise.resolve([]),
    [sessionId, limit]
  );
}

// ============================================================
// Audit Hooks
// ============================================================

export function useAuditEvents(query?: Record<string, unknown>) {
  return useAsync(
    () =>
      window.electronAPI?.audit?.query(query ?? {}) ?? Promise.resolve([]),
    [JSON.stringify(query)]
  );
}

export function useAuditStats() {
  return useAsync(
    () =>
      window.electronAPI?.audit?.getStats() ?? Promise.resolve(null),
    []
  );
}

// ============================================================
// Plugin Hooks
// ============================================================

export function usePlugins() {
  return useAsync(
    () =>
      window.electronAPI?.plugin?.list() ?? Promise.resolve([]),
    []
  );
}

export function usePluginStats() {
  return useAsync(
    () =>
      window.electronAPI?.plugin?.getStats() ?? Promise.resolve(null),
    []
  );
}

// ============================================================
// Reasoning Hooks
// ============================================================

export function useReasoningTraces(filter?: Record<string, unknown>) {
  return useAsync(
    () =>
      window.electronAPI?.reasoning?.listTraces(filter) ??
      Promise.resolve([]),
    [JSON.stringify(filter)]
  );
}

export function useReasoningStats() {
  return useAsync(
    () =>
      window.electronAPI?.reasoning?.getStats() ?? Promise.resolve(null),
    []
  );
}

// ============================================================
// Marketplace Hooks
// ============================================================

export function useMarketplaceItems(filter?: Record<string, unknown>) {
  return useAsync(
    () =>
      window.electronAPI?.marketplace?.getAllItems(filter ?? {}) ??
      Promise.resolve([]),
    [JSON.stringify(filter)]
  );
}

export function useMarketplaceItem(id: string | null) {
  return useAsync(
    () =>
      id
        ? window.electronAPI?.marketplace?.getItem(id) ?? Promise.resolve(null)
        : Promise.resolve(null),
    [id]
  );
}

export function useMarketplaceStats() {
  return useAsync(
    () =>
      window.electronAPI?.marketplace?.getStats() ?? Promise.resolve(null),
    []
  );
}

export function useMarketplaceCategories() {
  return useAsync(
    () =>
      window.electronAPI?.marketplace?.getCategories() ?? Promise.resolve([]),
    []
  );
}

export function useMarketplaceTags() {
  return useAsync(
    () =>
      window.electronAPI?.marketplace?.getTags() ?? Promise.resolve([]),
    []
  );
}

// ============================================================
// Agent Context Hooks
// ============================================================

export function useAgentContextSessions() {
  return useAsync(
    () =>
      window.electronAPI?.agentContext?.getAllSessions() ?? Promise.resolve([]),
    []
  );
}

export function useAgentContextSession(id: string | null) {
  return useAsync(
    () =>
      id
        ? window.electronAPI?.agentContext?.getSession(id) ?? Promise.resolve(null)
        : Promise.resolve(null),
    [id]
  );
}

export function useAgentContextStats() {
  return useAsync(
    () =>
      window.electronAPI?.agentContext?.getStats() ?? Promise.resolve(null),
    []
  );
}
