import { getBackendBaseURL } from "@/core/config";
import type {
  DashboardAnalytics,
  DashboardStats,
  HealthKPI,
  ResourceKPI,
  ServiceItem,
  AgentKPI,
  MemoryKPI,
  ToolKPI,
} from "./types";

/**
 * Fetch aggregated dashboard analytics from the backend.
 *
 * @param days - Number of days to include in time-series data (default 7).
 */
export async function getDashboardAnalytics(
  days: number = 7,
): Promise<DashboardAnalytics | null> {
  try {
    const url = `${getBackendBaseURL()}/api/dashboard/analytics?days=${days}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Dashboard analytics endpoint returned ${res.status}`);
      return null;
    }
    return (await res.json()) as DashboardAnalytics;
  } catch (err) {
    console.warn("Dashboard analytics endpoint unreachable:", err);
    return null;
  }
}

/**
 * Fetch dashboard KPI stats (health, resources, agents, services, memory, tools).
 *
 * Priority order:
 *  1. Backend GET /api/dashboard/stats (via proxy)
 *  2. Electron IPC aggregation (healthMonitor + perf + memory + tools)
 *  3. null (UI shows loading/empty state)
 */
export async function getDashboardStats(): Promise<DashboardStats | null> {
  // 1. Try backend API first
  try {
    const url = `${getBackendBaseURL()}/api/dashboard/stats`;
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as DashboardStats;
    console.warn(`Dashboard stats endpoint returned ${res.status}`);
  } catch (err) {
    console.warn("Dashboard stats endpoint unreachable:", err);
  }

  // 2. Fallback: aggregate from Electron IPC
  try {
    const api = window.electronAPI;
    if (!api) return null;
    return await aggregateFromIPC(api);
  } catch (err) {
    console.warn("Dashboard IPC aggregation failed:", err);
    return null;
  }
}

// ─── IPC aggregation helpers ──────────────────────────────────────────

async function aggregateFromIPC(
  api: NonNullable<typeof window.electronAPI>,
): Promise<DashboardStats> {
  const [health, resources, services, agents, memory, tools] =
    await Promise.allSettled([
      fetchHealthKPI(api),
      fetchResourceKPI(api),
      fetchServices(api),
      fetchAgentKPI(api),
      fetchMemoryKPI(api),
      fetchToolKPI(api),
    ]);

  return {
    health: unwrapSettled(health, {
      score: 0,
      status: "unknown",
      healthyServices: 0,
      totalServices: 0,
      criticalIssues: 0,
    }),
    resources: unwrapSettled(resources, {
      cpuPercent: 0,
      memoryPercent: 0,
      diskPercent: 0,
    }),
    services: unwrapSettled(services, [] as ServiceItem[]),
    agents: unwrapSettled(agents, {
      totalAgents: 0,
      totalChats: 0,
      totalMessages: 0,
      totalToolCalls: 0,
      avgLatencyMs: 0,
    }),
    memory: unwrapSettled(memory, {
      totalMemories: 0,
      totalTopics: 0,
    }),
    tools: unwrapSettled(tools, {
      totalTools: 0,
      availableTools: 0,
    }),
  };
}

function unwrapSettled<T>(
  result: PromiseSettledResult<T>,
  fallback: T,
): T {
  return result.status === "fulfilled" ? result.value : fallback;
}

async function fetchHealthKPI(
  api: NonNullable<typeof window.electronAPI>,
): Promise<HealthKPI> {
  let hStats: any = null;
  let hSnapshot: any = null;
  try {
    hStats = await api.healthMonitor?.getStats();
  } catch {
    /* ignore */
  }
  try {
    hSnapshot = await api.healthMonitor?.getSnapshot();
  } catch {
    /* ignore */
  }

  return {
    score: hStats?.averageScore ?? hSnapshot?.score ?? 0,
    status: hSnapshot?.overallStatus ?? "unknown",
    healthyServices: hStats?.healthyServices ?? 0,
    totalServices: hStats?.totalServices ?? 0,
    criticalIssues: hStats?.criticalIssues ?? 0,
  };
}

async function fetchResourceKPI(
  api: NonNullable<typeof window.electronAPI>,
): Promise<ResourceKPI> {
  let snap: any = null;
  try {
    snap = await api.perf?.getSnapshot();
  } catch {
    /* ignore */
  }
  const sys = snap?.systemMetrics ?? snap ?? {};
  return {
    cpuPercent: Number(sys.cpuUsagePercent ?? sys.cpuPercent ?? 0),
    memoryPercent: Number(sys.memoryUsagePercent ?? sys.memoryPercent ?? 0),
    diskPercent: Number(sys.diskPercent ?? 0),
  };
}

async function fetchServices(
  api: NonNullable<typeof window.electronAPI>,
): Promise<ServiceItem[]> {
  let snapshot: any = null;
  try {
    snapshot = await api.healthMonitor?.getSnapshot();
  } catch {
    /* ignore */
  }
  if (!snapshot?.services || !Array.isArray(snapshot.services)) return [];
  return snapshot.services.map((s: any) => ({
    name: s.name || "unknown",
    status: s.status || "unknown",
    responseTimeMs: s.responseTimeMs ?? 0,
  }));
}

async function fetchAgentKPI(
  api: NonNullable<typeof window.electronAPI>,
): Promise<AgentKPI> {
  let sessionStats: any = null;
  try {
    sessionStats = await (api as any).session?.getStats?.();
  } catch {
    /* ignore */
  }
  return {
    totalAgents: Number(
      sessionStats?.totalAgents ?? sessionStats?.total ?? 0,
    ),
    totalChats: Number(
      sessionStats?.totalChats ?? sessionStats?.totalSessions ?? 0,
    ),
    totalMessages: Number(sessionStats?.totalMessages ?? 0),
    totalToolCalls: Number(sessionStats?.totalToolCalls ?? 0),
    avgLatencyMs: Number(
      sessionStats?.avgLatencyMs ?? sessionStats?.avgResponseTimeMs ?? 0,
    ),
  };
}

async function fetchMemoryKPI(
  api: NonNullable<typeof window.electronAPI>,
): Promise<MemoryKPI> {
  let memStats: any = null;
  try {
    memStats = await api.conversationMemory?.getStats();
  } catch {
    /* ignore */
  }
  return {
    totalMemories: Number(memStats?.totalMemories ?? memStats?.total ?? 0),
    totalTopics: Number(memStats?.totalTopics ?? 0),
  };
}

async function fetchToolKPI(
  api: NonNullable<typeof window.electronAPI>,
): Promise<ToolKPI> {
  let toolStats: any = null;
  try {
    toolStats = await api.toolRegistry?.getStats();
  } catch {
    /* ignore */
  }
  return {
    totalTools: Number(
      toolStats?.total ?? toolStats?.totalTools ?? 0,
    ),
    availableTools: Number(
      toolStats?.available ?? toolStats?.availableTools ?? 0,
    ),
  };
}
