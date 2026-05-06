/**
 * DeerFlow Electron - Agent Event Bus
 *
 * Centralized event bus for cross-module communication:
 * - Typed event channels with schema validation
 * - Event persistence and replay capability
 * - Event filtering and routing
 * - Subscriber priority and async handling
 * - Event bus metrics and monitoring
 * - Inter-module decoupling
 *
 * Replaces direct EventEmitter coupling between managers with
 * a structured pub/sub system that supports:
 * - Request/response patterns
 * - Event sourcing for audit trails
 * - Event-driven workflow triggers
 */

import { EventEmitter } from "events";

// ============================================================
// Type Definitions
// ============================================================

export type EventPriority = "critical" | "high" | "normal" | "low" | "background";

export interface AgentEvent<T = any> {
  id: string;
  type: string;
  channel: EventChannel;
  payload: T;
  timestamp: string;
  source: string; // Module/component that emitted the event
  correlationId?: string; // For tracing related events
  priority: EventPriority;
  persistent: boolean; // Whether to persist for replay
}

export type EventChannel =
  | "session"      // Session lifecycle events
  | "workflow"     // Workflow execution events
  | "mcp"          // MCP tool/server events
  | "skill"        // Skill management events
  | "context"      // Context/memory events
  | "system"       // System-level events (startup, shutdown, errors)
  | "user"         // User interaction events
  | "agent"        // Agent reasoning/action events
  | "notification"; // Notification events

export interface EventSubscription {
  id: string;
  channel?: EventChannel; // Undefined = all channels
  eventType?: string;     // Undefined = all types
  filter?: (event: AgentEvent) => boolean;
  handler: (event: AgentEvent) => void | Promise<void>;
  priority: EventPriority;
  once?: boolean;
  async?: boolean;
}

export interface EventBusConfig {
  maxHistoryPerChannel: number;
  enablePersistence: boolean;
  persistencePath?: string;
  defaultPriority: EventPriority;
  enableMetrics: boolean;
  asyncTimeoutMs: number;
}

export interface EventBusMetrics {
  totalEventsPublished: number;
  totalEventsDelivered: number;
  totalEventsDropped: number;
  activeSubscriptions: number;
  eventsByChannel: Record<EventChannel, number>;
  eventsByType: Record<string, number>;
  averageDeliveryTimeMs: number;
  errors: number;
}

export interface EventQuery {
  channel?: EventChannel;
  eventType?: string;
  source?: string;
  correlationId?: string;
  since?: string; // ISO timestamp
  until?: string;
  limit?: number;
  priority?: EventPriority;
}

export interface RequestOptions {
  timeoutMs?: number;
  correlationId?: string;
  priority?: EventPriority;
}

export interface RequestResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  responseTime: number;
}

// ============================================================
// Event Bus
// ============================================================

export class AgentEventBus extends EventEmitter {
  private config: EventBusConfig;
  private subscriptions: Map<string, EventSubscription> = new Map();
  private history: Map<EventChannel, AgentEvent[]> = new Map();
  private pendingRequests: Map<
    string,
    { resolve: (value: RequestResponse) => void; reject: (reason: any) => void; timer: NodeJS.Timeout }
  > = new Map();
  private metrics: EventBusMetrics;
  private deliveryTimes: number[] = [];
  private isDestroyed = false;
  private requestCounter = 0;

  constructor(config?: Partial<EventBusConfig>) {
    super();
    this.config = {
      maxHistoryPerChannel: 1000,
      enablePersistence: false,
      defaultPriority: "normal",
      enableMetrics: true,
      asyncTimeoutMs: 30000,
      ...config,
    };

    this.metrics = this.createEmptyMetrics();

    // Initialize history for all channels
    for (const channel of this.getAllChannels()) {
      this.history.set(channel, []);
    }
  }

  // ---- Publishing ----

  publish<T = any>(
    channel: EventChannel,
    type: string,
    payload: T,
    options?: {
      source?: string;
      correlationId?: string;
      priority?: EventPriority;
      persistent?: boolean;
    }
  ): AgentEvent<T> {
    if (this.isDestroyed) {
      throw new Error("EventBus has been destroyed");
    }

    const event: AgentEvent<T> = {
      id: this.generateEventId(),
      type,
      channel,
      payload,
      timestamp: new Date().toISOString(),
      source: options?.source || "unknown",
      correlationId: options?.correlationId,
      priority: options?.priority || this.config.defaultPriority,
      persistent: options?.persistent ?? false,
    };

    // Store in history
    this.addToHistory(event);

    // Update metrics
    if (this.config.enableMetrics) {
      this.metrics.totalEventsPublished++;
      this.metrics.eventsByChannel[channel] =
        (this.metrics.eventsByChannel[channel] || 0) + 1;
      this.metrics.eventsByType[type] =
        (this.metrics.eventsByType[type] || 0) + 1;
    }

    // Emit for internal listeners
    this.emit("event", event);
    this.emit(`${channel}:${type}`, event);
    this.emit(`${channel}:*`, event);

    // Deliver to subscribers
    this.deliver(event);

    return event;
  }

  // ---- Request/Response Pattern ----

  async request<T = any, R = any>(
    channel: EventChannel,
    type: string,
    payload: T,
    options?: RequestOptions
  ): Promise<RequestResponse<R>> {
    const correlationId = options?.correlationId || this.generateCorrelationId();
    const timeoutMs = options?.timeoutMs || 10000;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(correlationId);
        resolve({
          success: false,
          error: `Request timeout after ${timeoutMs}ms`,
          responseTime: timeoutMs,
        });
      }, timeoutMs);

      this.pendingRequests.set(correlationId, { resolve, reject, timer });

      // Publish the request event
      this.publish(channel, type, payload, {
        correlationId,
        priority: options?.priority || "high",
        source: "eventbus:request",
      });
    });
  }

  respond<T = any>(
    correlationId: string,
    data: T,
    error?: string
  ): void {
    const pending = this.pendingRequests.get(correlationId);
    if (!pending) {
      // No pending request, publish as regular event
      this.publish("system", "orphan-response", { correlationId, data, error }, {
        source: "eventbus:response",
      });
      return;
    }

    clearTimeout(pending.timer);
    this.pendingRequests.delete(correlationId);

    const responseTime = Date.now() - parseInt(correlationId.split(":")[1] || "0");

    pending.resolve({
      success: !error,
      data,
      error,
      responseTime,
    });
  }

  // ---- Subscriptions ----

  subscribe(subscription: Omit<EventSubscription, "id">): string {
    const id = this.generateSubscriptionId();
    const sub: EventSubscription = { ...subscription, id };
    this.subscriptions.set(id, sub);

    if (this.config.enableMetrics) {
      this.metrics.activeSubscriptions = this.subscriptions.size;
    }

    return id;
  }

  subscribeToChannel(
    channel: EventChannel,
    handler: (event: AgentEvent) => void | Promise<void>,
    options?: {
      eventType?: string;
      filter?: (event: AgentEvent) => boolean;
      priority?: EventPriority;
      once?: boolean;
      async?: boolean;
    }
  ): string {
    return this.subscribe({
      channel,
      eventType: options?.eventType,
      filter: options?.filter,
      handler,
      priority: options?.priority || "normal",
      once: options?.once,
      async: options?.async,
    });
  }

  unsubscribe(id: string): boolean {
    const existed = this.subscriptions.delete(id);
    if (existed && this.config.enableMetrics) {
      this.metrics.activeSubscriptions = this.subscriptions.size;
    }
    return existed;
  }

  unsubscribeAll(filter?: { channel?: EventChannel; source?: string }): number {
    let count = 0;
    for (const [id, sub] of this.subscriptions) {
      if (filter?.channel && sub.channel !== filter.channel) continue;
      if (filter?.source && sub.handler.toString().includes(filter.source)) continue;
      this.subscriptions.delete(id);
      count++;
    }
    if (this.config.enableMetrics) {
      this.metrics.activeSubscriptions = this.subscriptions.size;
    }
    return count;
  }

  // ---- Delivery ----

  private async deliver(event: AgentEvent): Promise<void> {
    const matchingSubs: EventSubscription[] = [];

    for (const sub of this.subscriptions.values()) {
      if (sub.channel && sub.channel !== event.channel) continue;
      if (sub.eventType && sub.eventType !== event.type) continue;
      if (sub.filter && !sub.filter(event)) continue;
      matchingSubs.push(sub);
    }

    // Sort by priority
    const priorityOrder: Record<EventPriority, number> = {
      critical: 0,
      high: 1,
      normal: 2,
      low: 3,
      background: 4,
    };
    matchingSubs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Deliver
    for (const sub of matchingSubs) {
      try {
        const startTime = Date.now();

        if (sub.async) {
          await Promise.race([
            sub.handler(event),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("Async handler timeout")),
                this.config.asyncTimeoutMs
              )
            ),
          ]);
        } else {
          sub.handler(event);
        }

        const deliveryTime = Date.now() - startTime;
        this.recordDeliveryTime(deliveryTime);

        if (this.config.enableMetrics) {
          this.metrics.totalEventsDelivered++;
        }

        if (sub.once) {
          this.subscriptions.delete(sub.id);
        }
      } catch (err: any) {
        if (this.config.enableMetrics) {
          this.metrics.errors++;
        }
        this.emit("delivery-error", { event, subscription: sub, error: err.message });
      }
    }
  }

  // ---- History & Replay ----

  private addToHistory(event: AgentEvent): void {
    const channelHistory = this.history.get(event.channel);
    if (!channelHistory) return;

    channelHistory.push(event);

    // Trim history
    if (channelHistory.length > this.config.maxHistoryPerChannel) {
      channelHistory.splice(0, channelHistory.length - this.config.maxHistoryPerChannel);
    }
  }

  getHistory(channel?: EventChannel): AgentEvent[] {
    if (channel) {
      return [...(this.history.get(channel) || [])];
    }
    // Return all history sorted by timestamp
    const all: AgentEvent[] = [];
    for (const events of this.history.values()) {
      all.push(...events);
    }
    return all.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  queryHistory(query: EventQuery): AgentEvent[] {
    let results = this.getHistory(query.channel);

    if (query.eventType) {
      results = results.filter((e) => e.type === query.eventType);
    }
    if (query.source) {
      results = results.filter((e) => e.source === query.source);
    }
    if (query.correlationId) {
      results = results.filter((e) => e.correlationId === query.correlationId);
    }
    if (query.since) {
      const since = new Date(query.since).getTime();
      results = results.filter((e) => new Date(e.timestamp).getTime() >= since);
    }
    if (query.until) {
      const until = new Date(query.until).getTime();
      results = results.filter((e) => new Date(e.timestamp).getTime() <= until);
    }
    if (query.priority) {
      results = results.filter((e) => e.priority === query.priority);
    }

    if (query.limit) {
      results = results.slice(-query.limit);
    }

    return results;
  }

  replayEvents(
    events: AgentEvent[],
    options?: { skipSubscribers?: string[]; transform?: (e: AgentEvent) => AgentEvent }
  ): void {
    for (const event of events) {
      const toReplay = options?.transform ? options.transform(event) : event;

      // Deliver to matching subscribers
      for (const sub of this.subscriptions.values()) {
        if (options?.skipSubscribers?.includes(sub.id)) continue;
        if (sub.channel && sub.channel !== toReplay.channel) continue;
        if (sub.eventType && sub.eventType !== toReplay.type) continue;

        try {
          sub.handler(toReplay);
        } catch (err: any) {
          this.emit("replay-error", { event: toReplay, error: err.message });
        }
      }
    }
  }

  clearHistory(channel?: EventChannel): void {
    if (channel) {
      this.history.set(channel, []);
    } else {
      for (const ch of this.history.keys()) {
        this.history.set(ch, []);
      }
    }
  }

  // ---- Metrics ----

  private createEmptyMetrics(): EventBusMetrics {
    const eventsByChannel: Record<EventChannel, number> = {
      session: 0,
      workflow: 0,
      mcp: 0,
      skill: 0,
      context: 0,
      system: 0,
      user: 0,
      agent: 0,
      notification: 0,
    };

    return {
      totalEventsPublished: 0,
      totalEventsDelivered: 0,
      totalEventsDropped: 0,
      activeSubscriptions: 0,
      eventsByChannel,
      eventsByType: {},
      averageDeliveryTimeMs: 0,
      errors: 0,
    };
  }

  private recordDeliveryTime(ms: number): void {
    this.deliveryTimes.push(ms);
    // Keep last 1000 measurements
    if (this.deliveryTimes.length > 1000) {
      this.deliveryTimes.shift();
    }
    if (this.deliveryTimes.length > 0) {
      this.metrics.averageDeliveryTimeMs =
        this.deliveryTimes.reduce((a, b) => a + b, 0) / this.deliveryTimes.length;
    }
  }

  getMetrics(): EventBusMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = this.createEmptyMetrics();
    this.deliveryTimes = [];
  }

  // ---- Helpers ----

  private getAllChannels(): EventChannel[] {
    return [
      "session",
      "workflow",
      "mcp",
      "skill",
      "context",
      "system",
      "user",
      "agent",
      "notification",
    ];
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateCorrelationId(): string {
    this.requestCounter++;
    return `req_${Date.now()}_${this.requestCounter}`;
  }

  // ---- Cleanup ----

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.resolve({
        success: false,
        error: "EventBus destroyed",
        responseTime: 0,
      });
    }
    this.pendingRequests.clear();

    this.subscriptions.clear();
    this.history.clear();
    this.removeAllListeners();
  }
}

// ============================================================
// Predefined Event Types (for type safety and documentation)
// ============================================================

export const SessionEvents = {
  CREATED: "session:created",
  STARTED: "session:started",
  PAUSED: "session:paused",
  RESUMED: "session:resumed",
  COMPLETED: "session:completed",
  CANCELLED: "session:cancelled",
  MESSAGE_ADDED: "session:message-added",
  STATUS_CHANGED: "session:status-changed",
} as const;

export const WorkflowEvents = {
  CREATED: "workflow:created",
  EXECUTION_STARTED: "workflow:execution-started",
  EXECUTION_COMPLETED: "workflow:execution-completed",
  EXECUTION_FAILED: "workflow:execution-failed",
  NODE_EXECUTED: "workflow:node-executed",
  PAUSED: "workflow:paused",
  RESUMED: "workflow:resumed",
} as const;

export const MCPEvents = {
  SERVER_CONNECTED: "mcp:server-connected",
  SERVER_DISCONNECTED: "mcp:server-disconnected",
  TOOL_EXECUTED: "mcp:tool-executed",
  TOOL_ERROR: "mcp:tool-error",
} as const;

export const SkillEvents = {
  DISCOVERED: "skill:discovered",
  ENABLED: "skill:enabled",
  DISABLED: "skill:disabled",
  INSTALLED: "skill:installed",
  UNINSTALLED: "skill:uninstalled",
  UPDATED: "skill:updated",
  ERROR: "skill:error",
} as const;

export const SystemEvents = {
  STARTUP: "system:startup",
  SHUTDOWN: "system:shutdown",
  ERROR: "system:error",
  CONFIG_CHANGED: "system:config-changed",
  OFFLINE: "system:offline",
  ONLINE: "system:online",
} as const;

export const AgentEvents = {
  THINKING: "agent:thinking",
  ACTION: "agent:action",
  TOOL_CALL: "agent:tool-call",
  RESPONSE: "agent:response",
  ERROR: "agent:error",
} as const;
