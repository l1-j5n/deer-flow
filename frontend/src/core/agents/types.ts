export interface Agent {
  name: string;
  description: string;
  model: string | null;
  tool_groups: string[] | null;
  soul?: string | null;
  /** Number of chats with this agent (available in list responses). */
  total_chats?: number;
  /** ISO timestamp of last activity (available in list responses). */
  last_active?: string | null;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  model?: string | null;
  tool_groups?: string[] | null;
  soul?: string;
}

export interface UpdateAgentRequest {
  description?: string | null;
  model?: string | null;
  tool_groups?: string[] | null;
  soul?: string | null;
}

export interface AgentStats {
  total_chats: number;
  total_messages: number;
  avg_response_time: number;
  p50_response_time: number | null;
  p95_response_time: number | null;
  p99_response_time: number | null;
  tool_calls: number;
  last_active: string | null;
  weekly_activity: Array<{ day: string; messages: number; tool_calls: number }>;
  top_tools: Array<{ name: string; count: number }>;
  /** LangGraph agent processing time (separate from Gateway HTTP).  */
  langgraph_avg_response_time: number | null;
  /** 95th percentile LangGraph processing time in seconds.  */
  langgraph_p95_response_time: number | null;
  /** Average Gateway overhead in ms (HTTP total − LangGraph processing).  */
  gateway_overhead_ms: number | null;
}

export interface TimingSample {
  ts: string;
  value_ms: number;
}

export interface TimingHistory {
  agent_name: string;
  samples: TimingSample[];
  count: number;
  avg_ms: number | null;
  min_ms: number | null;
  max_ms: number | null;
}

export interface AgentVersionSummary {
  version_id: string;
  timestamp: string;
  changed_fields: string[];
  description: string;
}

export interface AgentVersionsResponse {
  agent_name: string;
  versions: AgentVersionSummary[];
  count: number;
}

export interface AgentVersionDetail {
  version_id: string;
  timestamp: string;
  config: Record<string, unknown>;
  soul: string | null;
  changed_fields: string[];
}

export interface RestoreVersionResponse {
  success: boolean;
  restored_version_id: string;
  new_version_id: string;
}

export type { AgentCompareItem, AgentCompareResponse } from "./api";

export interface AgentVersionDiffResponse {
  from_version: AgentVersionDetail;
  to_version: AgentVersionDetail;
  config_diff: Record<string, { from: unknown; to: unknown }>;
  soul_changed: boolean;
  fields_changed: string[];
}
