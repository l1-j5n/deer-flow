/**
 * WebSocket Manager - Real-time updates for the DeerFlow Agent Platform
 *
 * Provides a unified WebSocket-like event streaming system over Electron's IPC.
 * Enables real-time dashboard updates, live collaboration, and instant notifications.
 */

import { EventEmitter } from "events";

// ============================================================
// Types
// ============================================================

export interface WSChannelConfig {
  name: string;
  description?: string;
  persistent?: boolean;
  maxHistory?: number;
}

export interface WSMessage<T = unknown> {
  id: string;
  channel: string;
  type: string;
  payload: T;
  timestamp: string;
  sender?: string;
}

export interface WSConnection {
  id: string;
  subscribedChannels: Set<string>;
  connectedAt: string;
  lastActivity: string;
}

export interface WSStats {
  totalConnections: number;
  activeChannels: number;
  messagesSent: number;
  messagesReceived: number;
  messagesByChannel: Record<string, number>;
  peakConnections: number;
}

export interface ChannelStats {
  name: string;
  subscriberCount: number;
  messageCount: number;
  lastMessageAt?: string;
}

// ============================================================
// WebSocket Manager
// ============================================================

export class WebSocketManager extends EventEmitter {
  private channels: Map<string, WSChannelConfig> = new Map();
  private connections: Map<string, WSConnection> = new Map();
  private messageHistory: Map<string, WSMessage[]> = new Map();
  private stats: WSStats = {
    totalConnections: 0,
    activeChannels: 0,
    messagesSent: 0,
    messagesReceived: 0,
    messagesByChannel: {},
    peakConnections: 0,
  };
  private started = false;

  constructor() {
    super();
    this.setupDefaultChannels();
  }

  // ---- Channel Management ----

  private setupDefaultChannels(): void {
    const defaults: WSChannelConfig[] = [
      { name: "dashboard", description: "Real-time dashboard metrics", persistent: true, maxHistory: 100 },
      { name: "health", description: "Health monitor updates", persistent: true, maxHistory: 50 },
      { name: "notifications", description: "System notifications", persistent: true, maxHistory: 200 },
      { name: "collaboration", description: "Collaboration session events", persistent: true, maxHistory: 100 },
      { name: "sessions", description: "Agent session lifecycle", persistent: false, maxHistory: 50 },
      { name: "workflows", description: "Workflow execution events", persistent: false, maxHistory: 50 },
      { name: "system", description: "System-level events", persistent: true, maxHistory: 100 },
    ];

    for (const ch of defaults) {
      this.channels.set(ch.name, ch);
      this.messageHistory.set(ch.name, []);
      this.stats.messagesByChannel[ch.name] = 0;
    }
    this.stats.activeChannels = this.channels.size;
  }

  registerChannel(config: WSChannelConfig): boolean {
    if (this.channels.has(config.name)) return false;
    this.channels.set(config.name, config);
    this.messageHistory.set(config.name, []);
    this.stats.messagesByChannel[config.name] = 0;
    this.stats.activeChannels = this.channels.size;
    this.emit("channel:registered", config);
    return true;
  }

  unregisterChannel(name: string): boolean {
    if (!this.channels.has(name)) return false;
    // Unsubscribe all connections from this channel
    for (const conn of this.connections.values()) {
      conn.subscribedChannels.delete(name);
    }
    this.channels.delete(name);
    this.messageHistory.delete(name);
    delete this.stats.messagesByChannel[name];
    this.stats.activeChannels = this.channels.size;
    this.emit("channel:unregistered", name);
    return true;
  }

  getChannels(): WSChannelConfig[] {
    return Array.from(this.channels.values());
  }

  getChannel(name: string): WSChannelConfig | undefined {
    return this.channels.get(name);
  }

  // ---- Connection Management ----

  connect(connectionId: string): WSConnection {
    const existing = this.connections.get(connectionId);
    if (existing) return existing;

    const conn: WSConnection = {
      id: connectionId,
      subscribedChannels: new Set(),
      connectedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };
    this.connections.set(connectionId, conn);
    this.stats.totalConnections++;
    if (this.connections.size > this.stats.peakConnections) {
      this.stats.peakConnections = this.connections.size;
    }
    this.emit("connection:open", conn);
    return conn;
  }

  disconnect(connectionId: string): boolean {
    const conn = this.connections.get(connectionId);
    if (!conn) return false;
    this.connections.delete(connectionId);
    this.emit("connection:close", conn);
    return true;
  }

  subscribe(connectionId: string, channel: string): boolean {
    const conn = this.connections.get(connectionId);
    if (!conn || !this.channels.has(channel)) return false;
    conn.subscribedChannels.add(channel);
    conn.lastActivity = new Date().toISOString();
    this.emit("subscription:add", { connectionId, channel });
    return true;
  }

  unsubscribe(connectionId: string, channel: string): boolean {
    const conn = this.connections.get(connectionId);
    if (!conn) return false;
    conn.subscribedChannels.delete(channel);
    conn.lastActivity = new Date().toISOString();
    this.emit("subscription:remove", { connectionId, channel });
    return true;
  }

  getConnection(connectionId: string): WSConnection | undefined {
    return this.connections.get(connectionId);
  }

  getConnections(): WSConnection[] {
    return Array.from(this.connections.values());
  }

  // ---- Messaging ----

  broadcast<T>(channel: string, type: string, payload: T, sender?: string): WSMessage<T> | null {
    if (!this.channels.has(channel)) return null;

    const message: WSMessage<T> = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      channel,
      type,
      payload,
      timestamp: new Date().toISOString(),
      sender,
    };

    // Store in history
    const history = this.messageHistory.get(channel) || [];
    history.push(message as WSMessage);
    const config = this.channels.get(channel);
    if (config?.maxHistory && history.length > config.maxHistory) {
      history.shift();
    }
    this.messageHistory.set(channel, history);

    // Update stats
    this.stats.messagesSent++;
    this.stats.messagesByChannel[channel] = (this.stats.messagesByChannel[channel] || 0) + 1;

    // Emit for IPC forwarding
    this.emit("message", message);
    this.emit(`message:${channel}`, message);

    return message;
  }

  sendToConnection<T>(connectionId: string, channel: string, type: string, payload: T): WSMessage<T> | null {
    const conn = this.connections.get(connectionId);
    if (!conn || !conn.subscribedChannels.has(channel)) return null;

    const message: WSMessage<T> = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      channel,
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    conn.lastActivity = new Date().toISOString();
    this.stats.messagesSent++;
    this.emit("message:direct", { connectionId, message });

    return message;
  }

  getHistory(channel: string, limit = 50): WSMessage[] {
    const history = this.messageHistory.get(channel) || [];
    return history.slice(-limit);
  }

  clearHistory(channel?: string): void {
    if (channel) {
      this.messageHistory.set(channel, []);
    } else {
      for (const key of this.messageHistory.keys()) {
        this.messageHistory.set(key, []);
      }
    }
  }

  // ---- Stats ----

  getStats(): WSStats {
    return { ...this.stats };
  }

  getChannelStats(): ChannelStats[] {
    const result: ChannelStats[] = [];
    for (const [name, config] of this.channels) {
      const subscriberCount = Array.from(this.connections.values()).filter((c) =>
        c.subscribedChannels.has(name)
      ).length;
      const history = this.messageHistory.get(name) || [];
      result.push({
        name,
        subscriberCount,
        messageCount: this.stats.messagesByChannel[name] || 0,
        lastMessageAt: history.length > 0 ? history[history.length - 1].timestamp : undefined,
      });
    }
    return result;
  }

  // ---- Lifecycle ----

  start(): void {
    if (this.started) return;
    this.started = true;
    this.emit("started");
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    // Close all connections
    for (const id of this.connections.keys()) {
      this.disconnect(id);
    }
    this.emit("stopped");
  }

  isStarted(): boolean {
    return this.started;
  }

  // ---- Helpers for dashboard data ----

  broadcastDashboardUpdate(payload: {
    healthScore?: number;
    activeSessions?: number;
    memoryCount?: number;
    toolCalls?: number;
    cpuPercent?: number;
    memoryPercent?: number;
    diskPercent?: number;
    recentEvents?: Array<{ type: string; message: string; time: string }>;
  }): void {
    this.broadcast("dashboard", "update", payload, "system");
  }

  broadcastHealthAlert(issue: { severity: string; message: string; service?: string }): void {
    this.broadcast("health", "alert", issue, "health-monitor");
  }

  broadcastNotification(notification: { title: string; body: string; category: string; severity?: string }): void {
    this.broadcast("notifications", "new", notification, "system");
  }
}
