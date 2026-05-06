import { getBackendBaseURL } from "@/core/config";
import type { ReasoningTrace, ReasoningStats, TraceListResponse } from "./types";

const BASE = `/api/electron/reasoning`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Reasoning API error: ${res.status}`);
  }
  return res.json();
}

export async function listTraces(params?: {
  search?: string;
  strategy?: string;
  status?: string;
}): Promise<TraceListResponse> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set("search", params.search);
  if (params?.strategy) sp.set("strategy", params.strategy);
  if (params?.status) sp.set("status", params.status);
  const qs = sp.toString();
  return (await fetchJson(`${BASE}/traces${qs ? `?${qs}` : ""}`)) as TraceListResponse;
}

export async function getTrace(id: string): Promise<ReasoningTrace> {
  return (await fetchJson(`${BASE}/traces/${encodeURIComponent(id)}`)) as ReasoningTrace;
}

export async function deleteTrace(id: string): Promise<{ ok: boolean; id: string }> {
  return (await fetchJson(`${BASE}/traces/${encodeURIComponent(id)}`, { method: "DELETE" })) as { ok: boolean; id: string };
}

export async function getReasoningStats(): Promise<ReasoningStats> {
  return (await fetchJson(`${BASE}/stats`)) as ReasoningStats;
}
