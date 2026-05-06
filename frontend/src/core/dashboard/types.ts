// ── Dashboard Analytics Types ──────────────────────────────────────────

export interface TimeSeriesEntry {
  date: string;
  value: number;
}

export interface ToolUsageEntry {
  name: string;
  value: number;
  color: string;
}

export interface AgentLatencyEntry {
  agent: string;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
}

export interface DashboardSummary {
  total_agents: number;
  total_chats: number;
  total_messages: number;
  total_tool_calls: number;
  avg_latency_ms: number;
}

export interface DashboardAnalytics {
  session_activity: TimeSeriesEntry[];
  message_volume: TimeSeriesEntry[];
  tool_usage: ToolUsageEntry[];
  agent_latency: AgentLatencyEntry[];
  summary: DashboardSummary;
}

// ── Dashboard KPI Stats Types ─────────────────────────────────────────

export interface HealthKPI {
  score: number;
  status: string;
  healthyServices: number;
  totalServices: number;
  criticalIssues: number;
}

export interface ResourceKPI {
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
}

export interface ServiceItem {
  name: string;
  status: string;
  responseTimeMs: number;
}

export interface AgentKPI {
  totalAgents: number;
  totalChats: number;
  totalMessages: number;
  totalToolCalls: number;
  avgLatencyMs: number;
}

export interface MemoryKPI {
  totalMemories: number;
  totalTopics: number;
}

export interface ToolKPI {
  totalTools: number;
  availableTools: number;
}

export interface DashboardStats {
  health: HealthKPI;
  resources: ResourceKPI;
  agents: AgentKPI;
  services: ServiceItem[];
  memory: MemoryKPI;
  tools: ToolKPI;
}
