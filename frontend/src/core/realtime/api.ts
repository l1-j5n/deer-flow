/**
 * Real-time dashboard REST API functions with Electron IPC fallback.
 *
 * Priority order for metrics:
 *  1. Backend GET /api/realtime/metrics
 *  2. Electron IPC aggregation (healthMonitor + perf + session + memory + tools)
 *  3. null (caller shows empty/loading state)
 *
 * Priority order for events:
 *  1. Backend GET /api/realtime/events?limit=N
 *  2. Electron IPC (derive from health snapshot alerts)
 *  3. null
 */

import type { RealtimeMetrics, RealtimeEvent } from "./types";

const BASE = "/api/realtime";

/**
 * Fetch the current real-time system metrics snapshot.
 * Falls back to Electron IPC aggregation when the backend is unreachable.
 */
export async function getRealtimeMetrics(): Promise<RealtimeMetrics | null> {
  // 1. Try backend API
  try {
    const res = await fetch(`${BASE}/metrics`);
    if (res.ok) return (await res.json()) as RealtimeMetrics;
  } catch {
    /* fall through */
  }

  // 2. Fallback: aggregate from Electron IPC
  try {
    const api = window.electronAPI;
    if (!api) return null;
    return await aggregateRealtimeFromIPC(api);
  } catch (err) {
    console.warn("Realtime IPC aggregation failed:", err);
    return null;
  }
}

/**
 * Fetch recent system events from the ring buffer.
 * Falls back to deriving events from Electron IPC health snapshot.
 */
export async function getRealtimeEvents(
  limit = 50,
): Promise<RealtimeEvent[] | null> {
  // 1. Try backend API
  try {
    const res = await fetch(`${BASE}/events?limit=${limit}`);
    if (res.ok) return (await res.json()) as RealtimeEvent[];
  } catch {
    /* fall through */
  }

  // 2. Fallback: derive events from Electron IPC health snapshot
  try {
    const api = window.electronAPI;
    if (!api) return null;
    return await deriveEventsFromIPC(api);
  } catch {
    return null;
  }
}

// ─── IPC aggregation helpers ──────────────────────────────────────────

async function aggregateRealtimeFromIPC(
  api: NonNullable<typeof window.electronAPI>,
): Promise<RealtimeMetrics> {
  const [health, perf, session, memory, tools] =
    await Promise.allSettled([
      safeIpc(() => (api.healthMonitor?.getSnapshot() ?? Promise.resolve(null as any))),
      safeIpc(() => ((api as any).perf?.getSnapshot() ?? Promise.resolve(null as any))),
      safeIpc(() => ((api as any).session?.getStats() ?? Promise.resolve(null as any))),
      safeIpc(() => (api.conversationMemory?.getStats() ?? Promise.resolve(null as any))),
      safeIpc(() => (api.toolRegistry?.getStats() ?? Promise.resolve(null as any))),
    ]);

  const hSnap: any = unwrapVal(health);
  const pSnap: any = unwrapVal(perf);
  const sess: any = unwrapVal(session);
  const mem: any = unwrapVal(memory);
  const toolS: any = unwrapVal(tools);

  // Health score: prefer healthMonitor snapshot score
  const healthScore =
    hSnap?.score ??
    hSnap?.averageScore ??
    (hSnap?.services?.length
      ? Math.round(
          (hSnap.services.filter((s: any) => s.status === "healthy").length /
            hSnap.services.length) *
            100,
        )
      : 0);

  // Services from health snapshot
  const services: import("./types").ServiceSummary[] = Array.isArray(
    hSnap?.services,
  )
    ? hSnap.services.map((s: any) => ({
        name: s?.name ?? "unknown",
        status: (s?.status ?? "unknown") as any,
        latencyMs: Number(s?.responseTimeMs ?? s?.latencyMs ?? 0),
        uptime: s?.uptime ?? "\u2014",
      }))
    : [];

  // CPU / memory from perf snapshot
  const sys = pSnap?.systemMetrics ?? pSnap ?? {};
  const cpuPercent = Number(
    sys?.cpuUsagePercent ?? sys?.cpuPercent ?? sys?.cpu ?? 0,
  );
  const memoryTotalGb =
    Number(sys?.memoryUsageMb ?? sys?.memoryMB ?? sys?.memory ?? 0) / 1024;

  return {
    activeSessions: Number(
      sess?.totalSessions ?? sess?.activeSessions ?? sess?.total ?? 0,
    ),
    activeAgents: Number(sess?.totalAgents ?? sess?.activeAgents ?? 0),
    memoryEntries: Number(mem?.totalMemories ?? mem?.total ?? 0),
    toolCallsTotal: Number(toolS?.totalToolCalls ?? toolS?.total ?? 0),
    cpuPercent: isNaN(cpuPercent) ? 0 : cpuPercent,
    memoryTotalGb:
      isNaN(memoryTotalGb) ? 0 : Math.round(memoryTotalGb * 10) / 10,
    healthScore: isNaN(healthScore) ? 0 : healthScore,
    services,
    diskPercent: Number(sys?.diskPercent ?? sys?.disk ?? 0),
    totalThreads: Number(
      sess?.totalThreads ?? sess?.totalSessions ?? sess?.total ?? 0,
    ),
    totalMessages: Number(sess?.totalMessages ?? 0),
    totalAlerts: Number(hSnap?.totalAlerts ?? 0),
    alertCountCritical: Number(
      hSnap?.criticalAlerts ?? hSnap?.criticalIssues ?? 0,
    ),
  };
}

async function deriveEventsFromIPC(
  api: NonNullable<typeof window.electronAPI>,
): Promise<RealtimeEvent[]> {
  const events: RealtimeEvent[] = [];

  try {
    const snap = await api.healthMonitor?.getSnapshot();
    if (snap?.services && Array.isArray(snap.services)) {
      const now = new Date().toISOString();
      for (const s of snap.services) {
        if (s?.status === "degraded") {
          events.push({
            id: `ipc-${s.name}-degraded`,
            type: "warning",
            message: `Service "${s.name}" is degraded`,
            source: "Health Monitor",
            timestamp: now,
          });
        } else if (s?.status === "unhealthy") {
          events.push({
            id: `ipc-${s.name}-unhealthy`,
            type: "error",
            message: `Service "${s.name}" is unhealthy`,
            source: "Health Monitor",
            timestamp: now,
          });
        }
      }
    }
  } catch {
    /* ignore */
  }

  return events;
}

// ─── Tiny utilities ───────────────────────────────────────────────────

async function safeIpc<T>(
  fn: () => Promise<T | null | undefined>,
): Promise<T | null> {
  try {
    return (await fn()) ?? null;
  } catch {
    return null;
  }
}

function unwrapVal<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}
