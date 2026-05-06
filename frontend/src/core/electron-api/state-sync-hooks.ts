/**
 * DeerFlow Electron - State Sync React Hooks
 *
 * Real-time React hooks for subscribing to Electron backend state slices.
 * Provides live updates via IPC with automatic batching and delta merging.
 *
 * Usage:
 *   const { data, loading, error } = useStateSyncSlice('health', 30000);
 *   const { sessions, workflows, health } = useStateSyncMulti(['sessions', 'workflows', 'health']);
 */

"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// ============================================================
// Types
// ============================================================

export type StateSlice =
  | "sessions"
  | "workflows"
  | "health"
  | "memory"
  | "knowledgeGraph"
  | "collaboration"
  | "scheduler"
  | "tools"
  | "plugins"
  | "audit"
  | "performance"
  | "backup"
  | "system";

export interface StateUpdate<T = any> {
  slice: StateSlice;
  timestamp: string;
  data: T;
  delta?: boolean;
}

export interface StateSyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdate: string | null;
}

// ============================================================
// Global Subscription Manager (singleton)
// ============================================================

class StateSyncSubscriptionManager {
  private subscriptions = new Map<StateSlice, Set<(update: StateUpdate) => void>>();
  private ipcUnsubscribers = new Map<StateSlice, () => void>();
  private activeSlices = new Set<StateSlice>();
  private electronAvailable = typeof window !== "undefined" && !!window.electronAPI?.stateSync;

  subscribe(slice: StateSlice, callback: (update: StateUpdate) => void): () => void {
    if (!this.subscriptions.has(slice)) {
      this.subscriptions.set(slice, new Set());
    }
    this.subscriptions.get(slice)!.add(callback);

    // Activate IPC subscription if first listener
    if (this.subscriptions.get(slice)!.size === 1) {
      this.activateSlice(slice);
    }

    return () => {
      const set = this.subscriptions.get(slice);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.deactivateSlice(slice);
        }
      }
    };
  }

  private activateSlice(slice: StateSlice): void {
    this.activeSlices.add(slice);
    if (!this.electronAvailable) return;

    // Subscribe via IPC
    window.electronAPI!.stateSync!.subscribe([slice]).catch((err: any) => {
      console.warn(`[StateSync] Failed to subscribe to ${slice}:`, err);
    });

    // Listen for updates
    const unsubscribe = window.electronAPI!.stateSync!.onStateUpdate((update: { slice: string; timestamp: string; data: unknown }) => {
      if (update.slice === slice) {
        this.notifyListeners(update as StateUpdate);
      }
    });

    this.ipcUnsubscribers.set(slice, unsubscribe);
  }

  private deactivateSlice(slice: StateSlice): void {
    this.activeSlices.delete(slice);
    if (!this.electronAvailable) return;

    // Unsubscribe via IPC
    window.electronAPI!.stateSync!.unsubscribe(slice).catch((err: any) => {
      console.warn(`[StateSync] Failed to unsubscribe from ${slice}:`, err);
    });

    // Remove IPC listener
    const unsub = this.ipcUnsubscribers.get(slice);
    if (unsub) {
      unsub();
      this.ipcUnsubscribers.delete(slice);
    }
  }

  private notifyListeners(update: StateUpdate): void {
    const listeners = this.subscriptions.get(update.slice);
    if (listeners) {
      listeners.forEach((cb) => {
        try {
          cb(update);
        } catch (err) {
          console.error(`[StateSync] Listener error for ${update.slice}:`, err);
        }
      });
    }
  }

  isElectronAvailable(): boolean {
    return this.electronAvailable;
  }
}

const subscriptionManager = new StateSyncSubscriptionManager();

// ============================================================
// Hook: useStateSyncSlice
// ============================================================

export function useStateSyncSlice<T = any>(
  slice: StateSlice,
  pollIntervalMs = 30000
): StateSyncState<T> {
  const [state, setState] = useState<StateSyncState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdate: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Initial fetch + polling fallback
  useEffect(() => {
    let mounted = true;

    const fetchState = async () => {
      if (!window.electronAPI?.stateSync?.getState) {
        if (mounted) {
          setState((s) => ({
            ...s,
            loading: false,
            error: new Error("State sync not available"),
          }));
        }
        return;
      }

      try {
        const data = await window.electronAPI.stateSync.getState(slice);
        if (mounted) {
          setState({
            data: (data ?? null) as T | null,
            loading: false,
            error: null,
            lastUpdate: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        if (mounted) {
          setState((s) => ({
            ...s,
            loading: false,
            error: err,
          }));
        }
      }
    };

    fetchState();

    // Poll as fallback for push updates
    const interval = setInterval(fetchState, pollIntervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [slice, pollIntervalMs]);

  // Real-time push subscription
  useEffect(() => {
    const unsubscribe = subscriptionManager.subscribe(slice, (update) => {
      setState({
        data: update.data,
        loading: false,
        error: null,
        lastUpdate: update.timestamp,
      });
    });

    return unsubscribe;
  }, [slice]);

  return state;
}

// ============================================================
// Hook: useStateSyncMulti
// ============================================================

export function useStateSyncMulti<T extends Record<string, any>>(
  slices: StateSlice[],
  pollIntervalMs = 30000
): {
  data: Partial<T>;
  loading: boolean;
  error: Error | null;
  lastUpdate: string | null;
} {
  const [data, setData] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      if (!window.electronAPI?.stateSync?.getAllStates) {
        if (mounted) {
          setLoading(false);
          setError(new Error("State sync not available"));
        }
        return;
      }

      try {
        const all = await window.electronAPI.stateSync.getAllStates();
        if (mounted) {
          const filtered: Partial<T> = {};
          slices.forEach((slice) => {
            if (all[slice] !== undefined) {
              (filtered as any)[slice] = all[slice];
            }
          });
          setData(filtered);
          setLoading(false);
          setError(null);
          setLastUpdate(new Date().toISOString());
        }
      } catch (err: any) {
        if (mounted) {
          setLoading(false);
          setError(err);
        }
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, pollIntervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [JSON.stringify(slices), pollIntervalMs]);

  // Subscribe to each slice
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    slices.forEach((slice) => {
      const unsub = subscriptionManager.subscribe(slice, (update) => {
        setData((prev) => ({
          ...prev,
          [update.slice]: update.data,
        }));
        setLastUpdate(update.timestamp);
        setLoading(false);
      });
      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [JSON.stringify(slices)]);

  return { data, loading, error, lastUpdate };
}

// ============================================================
// Hook: useStateSyncStats
// ============================================================

export function useStateSyncStats(pollIntervalMs = 30000) {
  const [stats, setStats] = useState<{
    subscriptions: number;
    cachedSlices: number;
    pendingUpdates: number;
    isRunning: boolean;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      if (!window.electronAPI?.stateSync?.getStats) return;

      try {
        const data = await window.electronAPI.stateSync.getStats();
        if (mounted) setStats(data);
      } catch (err) {
        console.warn("[StateSync] Failed to fetch stats:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, pollIntervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return stats;
}

// ============================================================
// Hook: useIsElectronAvailable
// ============================================================

export function useIsElectronAvailable(): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(subscriptionManager.isElectronAvailable());
  }, []);

  return available;
}

// ============================================================
// Hook: useLiveHealth (specialized)
// ============================================================

export function useLiveHealth(pollIntervalMs = 30000) {
  return useStateSyncSlice("health", pollIntervalMs);
}

// ============================================================
// Hook: useLiveSessions (specialized)
// ============================================================

export function useLiveSessions(pollIntervalMs = 30000) {
  return useStateSyncSlice("sessions", pollIntervalMs);
}

// ============================================================
// Hook: useLiveWorkflows (specialized)
// ============================================================

export function useLiveWorkflows(pollIntervalMs = 30000) {
  return useStateSyncSlice("workflows", pollIntervalMs);
}

// ============================================================
// Hook: useLiveMemory (specialized)
// ============================================================

export function useLiveMemory(pollIntervalMs = 30000) {
  return useStateSyncSlice("memory", pollIntervalMs);
}

// ============================================================
// Hook: useLiveCollaboration (specialized)
// ============================================================

export function useLiveCollaboration(pollIntervalMs = 30000) {
  return useStateSyncSlice("collaboration", pollIntervalMs);
}

// ============================================================
// Hook: useLiveSystem (specialized)
// ============================================================

export function useLiveSystem(pollIntervalMs = 30000) {
  return useStateSyncSlice("system", pollIntervalMs);
}

// ============================================================
// Hook: useLiveDashboard (multi-slice)
// ============================================================

export function useLiveDashboard(pollIntervalMs = 30000) {
  return useStateSyncMulti<
    Partial<Record<StateSlice, any>>
  >(["health", "sessions", "workflows", "memory", "system"], pollIntervalMs);
}

// ============================================================
// Store-based hook for advanced use cases
// ============================================================

interface SyncStore {
  [slice: string]: {
    data: any;
    timestamp: string;
  };
}

function createStateSyncStore() {
  let store: SyncStore = {};
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => store,
    subscribe: (callback: () => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    update: (slice: StateSlice, data: any, timestamp: string) => {
      store = {
        ...store,
        [slice]: { data, timestamp },
      };
      listeners.forEach((cb) => cb());
    },
  };
}

const globalSyncStore = createStateSyncStore();

export function useStateSyncStore(): SyncStore {
  return useSyncExternalStore(
    globalSyncStore.subscribe,
    globalSyncStore.getSnapshot,
    globalSyncStore.getSnapshot
  );
}

// Auto-subscribe store to IPC updates
if (typeof window !== "undefined" && window.electronAPI?.stateSync?.onStateUpdate) {
  window.electronAPI.stateSync.onStateUpdate((update: { slice: string; timestamp: string; data: unknown }) => {
    globalSyncStore.update(update.slice as StateSlice, update.data, update.timestamp);
  });
}
