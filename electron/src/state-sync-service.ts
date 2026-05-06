/**
 * DeerFlow Electron - Cross-Module State Sync Service
 *
 * Provides real-time synchronization between Electron backend modules
 * and the frontend renderer process. Uses WebSocket manager for push
 * updates and maintains a shared state store.
 *
 * Features:
 * - Subscribable state slices (sessions, workflows, health, memory, etc.)
 * - Push updates via WebSocket/IPC when state changes
 * - Batched updates to reduce IPC overhead
 * - Selective subscription (only sync what the frontend needs)
 * - State persistence for recovery
 */

import { EventEmitter } from "events";
import type { WebSocketManager } from "./websocket-manager";

// ============================================================
// Type Definitions
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

export interface StateUpdate {
  slice: StateSlice;
  timestamp: string;
  data: any;
  delta?: boolean; // If true, data is a partial update
}

export interface SyncSubscription {
  id: string;
  slices: StateSlice[];
  filter?: (update: StateUpdate) => boolean;
}

export interface SyncConfig {
  batchIntervalMs: number;
  maxBatchSize: number;
  persistState: boolean;
  persistencePath?: string;
}

// ============================================================
// State Sync Service
// ============================================================

export class StateSyncService extends EventEmitter {
  private wsManager?: WebSocketManager;
  private subscriptions = new Map<string, SyncSubscription>();
  private stateCache = new Map<StateSlice, { data: any; timestamp: string }>();
  private pendingUpdates: StateUpdate[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private config: SyncConfig;
  private isRunning = false;
  private updateSequence = 0;

  constructor(config?: Partial<SyncConfig>) {
    super();
    this.config = {
      batchIntervalMs: 100,
      maxBatchSize: 50,
      persistState: true,
      ...config,
    };
  }

  // ---- Lifecycle ----

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startBatchTimer();
    this.emit("started");
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    // Flush remaining updates
    this.flushPendingUpdates();
    this.emit("stopped");
  }

  destroy(): void {
    this.stop();
    this.subscriptions.clear();
    this.stateCache.clear();
    this.removeAllListeners();
  }

  // ---- WebSocket Integration ----

  setWebSocketManager(wsManager: WebSocketManager): void {
    this.wsManager = wsManager;
  }

  // ---- State Management ----

  /**
   * Update a state slice. This will queue the update and broadcast
   * to all subscribers after batching.
   */
  updateState(slice: StateSlice, data: any, delta = false): void {
    const update: StateUpdate = {
      slice,
      timestamp: new Date().toISOString(),
      data,
      delta,
    };

    // Update cache
    this.stateCache.set(slice, { data: delta ? this.mergeDelta(slice, data) : data, timestamp: update.timestamp });

    // Queue for broadcast
    this.pendingUpdates.push(update);

    // Emit immediate event for local listeners
    this.emit("state:update", update);
    this.emit(`state:${slice}`, update);

    // Check if we should flush immediately
    if (this.pendingUpdates.length >= this.config.maxBatchSize) {
      this.flushPendingUpdates();
    }
  }

  /**
   * Get the current cached state for a slice.
   */
  getState(slice: StateSlice): any {
    return this.stateCache.get(slice)?.data ?? null;
  }

  /**
   * Get all cached states.
   */
  getAllStates(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [slice, entry] of this.stateCache) {
      result[slice] = entry.data;
    }
    return result;
  }

  // ---- Subscriptions ----

  subscribe(subscription: Omit<SyncSubscription, "id">): string {
    const id = `sub_${++this.updateSequence}_${Date.now()}`;
    const sub: SyncSubscription = { ...subscription, id };
    this.subscriptions.set(id, sub);

    // Immediately send current state for requested slices
    const initialStates: StateUpdate[] = [];
    for (const slice of sub.slices) {
      const cached = this.stateCache.get(slice);
      if (cached) {
        initialStates.push({
          slice,
          timestamp: cached.timestamp,
          data: cached.data,
          delta: false,
        });
      }
    }

    if (initialStates.length > 0) {
      this.emit("state:initial", { subscriptionId: id, updates: initialStates });
    }

    return id;
  }

  unsubscribe(id: string): boolean {
    return this.subscriptions.delete(id);
  }

  getSubscription(id: string): SyncSubscription | undefined {
    return this.subscriptions.get(id);
  }

  // ---- Batching ----

  private startBatchTimer(): void {
    this.batchTimer = setInterval(() => {
      if (this.pendingUpdates.length > 0) {
        this.flushPendingUpdates();
      }
    }, this.config.batchIntervalMs);
  }

  private flushPendingUpdates(): void {
    if (this.pendingUpdates.length === 0) return;

    const updates = [...this.pendingUpdates];
    this.pendingUpdates = [];

    // Deduplicate: keep only latest update per slice
    const latestBySlice = new Map<StateSlice, StateUpdate>();
    for (const update of updates) {
      latestBySlice.set(update.slice, update);
    }

    const deduplicated = Array.from(latestBySlice.values());

    // Broadcast via WebSocket if available
    if (this.wsManager) {
      for (const update of deduplicated) {
        this.wsManager.broadcast("sync", "state-update", update);
      }
    }

    // Emit batch event
    this.emit("state:batch", deduplicated);

    // Notify subscribers
    this.notifySubscribers(deduplicated);
  }

  private notifySubscribers(updates: StateUpdate[]): void {
    for (const [id, sub] of this.subscriptions) {
      const relevant = updates.filter((u) => sub.slices.includes(u.slice));
      if (relevant.length === 0) continue;

      const filtered = sub.filter ? relevant.filter(sub.filter) : relevant;
      if (filtered.length === 0) continue;

      this.emit("state:notify", { subscriptionId: id, updates: filtered });
    }
  }

  // ---- Helpers ----

  private mergeDelta(slice: StateSlice, delta: any): any {
    const existing = this.stateCache.get(slice)?.data;
    if (!existing || typeof existing !== "object") return delta;
    if (Array.isArray(existing)) {
      // For arrays, delta should contain operations
      return this.applyArrayDelta(existing, delta);
    }
    return { ...existing, ...delta };
  }

  private applyArrayDelta(arr: any[], delta: any): any[] {
    if (delta._op === "append") {
      return [...arr, ...(delta.items || [])];
    }
    if (delta._op === "remove") {
      const ids = new Set(delta.ids || []);
      return arr.filter((item) => !ids.has(item.id));
    }
    if (delta._op === "replace") {
      return delta.items || [];
    }
    // Default: merge by id
    const result = [...arr];
    const updates = delta.updates || [];
    for (const update of updates) {
      const idx = result.findIndex((item) => item.id === update.id);
      if (idx >= 0) {
        result[idx] = { ...result[idx], ...update };
      } else {
        result.push(update);
      }
    }
    return result;
  }

  // ---- Stats ----

  getStats(): {
    subscriptions: number;
    cachedSlices: number;
    pendingUpdates: number;
    isRunning: boolean;
  } {
    return {
      subscriptions: this.subscriptions.size,
      cachedSlices: this.stateCache.size,
      pendingUpdates: this.pendingUpdates.length,
      isRunning: this.isRunning,
    };
  }
}
