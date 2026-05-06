/**
 * Charts module type definitions.
 *
 * Re-exports DashboardAnalytics from dashboard/types for backward compatibility,
 * plus chart-specific types used by the charts page.
 */

import type {
  DashboardAnalytics,
  TimeSeriesEntry,
  ToolUsageEntry,
  AgentLatencyEntry,
  DashboardSummary,
} from "@/core/dashboard/types";

export type {
  DashboardAnalytics,
  TimeSeriesEntry,
  ToolUsageEntry,
  AgentLatencyEntry,
  DashboardSummary,
};

/** Raw data returned by Electron IPC charts namespace (before normalization). */
export interface ChartsIpcRaw {
  sessionActivity?: { date: string; value: number }[];
  messageVolume?: { date: string; value: number }[];
  toolUsage?: { name: string; value: number; color?: string }[];
  modelUsage?: { name: string; value: number }[];
  agentLatency?: { agent: string; p50_ms: number; p95_ms: number; p99_ms: number }[];
  summary?: Partial<DashboardSummary>;
}
