import { getBackendBaseURL } from "@/core/config";
import type { DashboardAnalytics, ChartsIpcRaw } from "./types";

const PALETTE = [
  "#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ec4899",
  "#06b6d4", "#eab308", "#ef4444", "#8b5cf6", "#14b8a6",
];

/**
 * Fetch chart data with a 3-tier priority:
 *  1. Backend GET /api/dashboard/analytics?days=N
 *  2. Electron IPC aggregation (charts.* namespace)
 *  3. null (caller shows empty/loading state)
 */
export async function getChartsAnalytics(
  days: number = 7,
): Promise<DashboardAnalytics | null> {
  // 1. Try backend API
  try {
    const url = `${getBackendBaseURL()}/api/dashboard/analytics?days=${days}`;
    const res = await fetch(url);
    if (res.ok) return (await res.json()) as DashboardAnalytics;
    console.warn(`Charts analytics endpoint returned ${res.status}`);
  } catch (err) {
    console.warn("Charts analytics endpoint unreachable:", err);
  }

  // 2. Fallback: aggregate from Electron IPC charts namespace
  try {
    const api = window.electronAPI;
    if (!api?.charts) return null;
    return await aggregateChartsFromIPC(api, days);
  } catch (err) {
    console.warn("Charts IPC aggregation failed:", err);
    return null;
  }
}

// ─── IPC aggregation helpers ──────────────────────────────────────────

async function aggregateChartsFromIPC(
  api: NonNullable<typeof window.electronAPI>,
  days: number,
): Promise<DashboardAnalytics> {
  const charts = api.charts!;

  const [sessionActivity, messageVolume, toolUsage, perfMetrics] =
    await Promise.allSettled([
      safeCall(() => charts.getSessionActivity(days)),
      safeCall(() => charts.getMessageVolume(days)),
      safeCall(() => charts.getToolUsage()),
      safeCall(() => charts.getPerformanceMetrics()),
    ]);

  const sa = unwrapArr(sessionActivity);
  const mv = unwrapArr(messageVolume);
  const tu = (unwrapArr(toolUsage) as any[]).map((t: any, i: number) => ({
    name: typeof t === "string"
      ? t
      : t?.name ?? `Tool ${i + 1}`,
    value: typeof t === "number"
      ? t
      : t?.value ?? t?.count ?? 0,
    color:
      t?.color ??
      (typeof t === "string" || t?.name ? PALETTE[i % PALETTE.length] : PALETTE[i % PALETTE.length]),
  }));
  const al: any[] = [];
  const perfRaw = unwrapRaw(perfMetrics);
  if (perfRaw) {
    // Performance metrics may come as an object with category keys or as an array
    if (Array.isArray(perfRaw)) {
      for (const a of perfRaw) {
        al.push({
          agent: a?.agent ?? a?.name ?? "—",
          p50_ms: Number(a?.p50_ms ?? a?.p50 ?? 0),
          p95_ms: Number(a?.p95_ms ?? a?.p95 ?? 0),
          p99_ms: Number(a?.p99_ms ?? a?.p99 ?? 0),
        });
      }
    } else if (typeof perfRaw === "object") {
      // Object form: { session: {...}, workflow: {...}, ... }
      for (const [category, v] of Object.entries(perfRaw)) {
        const entry = v as any;
        if (entry && typeof entry === "object") {
          al.push({
            agent: category,
            p50_ms: Number(entry?.p50 ?? 0),
            p95_ms: Number(entry?.p95 ?? 0),
            p99_ms: Number(entry?.p99 ?? 0),
          });
        }
      }
    }
  }

  const totalAgents = al.length;
  const totalChats = sa.reduce((s, e) => s + (e.value ?? 0), 0);
  const totalMessages = mv.reduce((s, e) => s + (e.value ?? 0), 0);
  const totalToolCalls = tu.reduce((s, e) => s + (e.value ?? 0), 0);
  const avgLatency =
    al.length > 0
      ? Math.round(al.reduce((s, a) => s + a.p50_ms, 0) / al.length)
      : 0;

  return {
    session_activity: sa,
    message_volume: mv,
    tool_usage: tu,
    agent_latency: al,
    summary: {
      total_agents: totalAgents,
      total_chats: totalChats,
      total_messages: totalMessages,
      total_tool_calls: totalToolCalls,
      avg_latency_ms: avgLatency,
    },
  };
}

// ─── Tiny utilities ───────────────────────────────────────────────────

async function safeCall<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

function unwrapArr(result: PromiseSettledResult<any[] | null>): any[] {
  if (result.status !== "fulfilled" || !result.value) return [];
  return Array.isArray(result.value) ? result.value : [];
}

function unwrapRaw(result: PromiseSettledResult<any>): any {
  if (result.status !== "fulfilled" || !result.value) return null;
  return result.value;
}
