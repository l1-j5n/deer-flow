/**
 * Real-time dashboard type definitions.
 *
 * Mirrors the backend Pydantic models in
 * ``backend/app/gateway/routers/realtime.py``.
 */

export interface ServiceSummary {
  name: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  latencyMs: number;
  uptime: string;
}

export interface RealtimeMetrics {
  /** Active thread/session count */
  activeSessions: number;
  /** Number of registered agents */
  activeAgents: number;
  /** Global memory entry count */
  memoryEntries: number;
  /** Cumulative tool call count */
  toolCallsTotal: number;
  /** CPU usage percentage */
  cpuPercent: number;
  /** Used memory in GiB */
  memoryTotalGb: number;

  /** Health score 0-100 */
  healthScore: number;
  /** Per-service health statuses */
  services: ServiceSummary[];

  /** Disk usage percentage */
  diskPercent: number;

  /** Total thread count (historical) */
  totalThreads: number;
  /** Total message count (historical) */
  totalMessages: number;
  /** Total alert configurations */
  totalAlerts: number;
  /** Currently firing critical alerts */
  alertCountCritical: number;
}

export interface RealtimeEvent {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  source: string;
  timestamp: string;
}

/** WebSocket message types for /ws/realtime */
export type WsRealtimeMessage =
  | { type: "metrics"; data: RealtimeMetrics }
  | { type: "event"; data: RealtimeEvent }
  | { type: "pong"; ts: number };
