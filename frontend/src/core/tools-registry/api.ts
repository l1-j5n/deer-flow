import { getBackendBaseURL } from "@/core/config";
import type { ToolDefinition, ToolAnalytics, ToolRegistryStats } from "./types";

const BASE = `/api/electron/tools`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Tools API error: ${res.status}`);
  }
  return res.json();
}

export async function listTools(params?: {
  search?: string;
  category?: string;
  status?: string;
  source?: string;
}): Promise<ToolDefinition[]> {
  const sp = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) sp.set(key, value);
    }
  }
  const qs = sp.toString();
  return (await fetchJson(`${BASE}${qs ? `?${qs}` : ""}`)) as ToolDefinition[];
}

export async function getTool(id: string): Promise<ToolDefinition> {
  return (await fetchJson(`${BASE}/${encodeURIComponent(id)}`)) as ToolDefinition;
}

export async function getToolAnalytics(): Promise<ToolAnalytics[]> {
  return (await fetchJson(`${BASE}/analytics`)) as ToolAnalytics[];
}

export async function getTopTools(limit = 10): Promise<ToolAnalytics[]> {
  return (await fetchJson(`${BASE}/top?limit=${limit}`)) as ToolAnalytics[];
}

export async function getToolStats(): Promise<ToolRegistryStats> {
  return (await fetchJson(`${BASE}/stats`)) as ToolRegistryStats;
}
