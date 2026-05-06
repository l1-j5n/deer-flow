import { getBackendBaseURL } from "@/core/config";
import type { Plugin, PluginStats } from "./types";

const BASE = `/api/electron/plugins`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Plugins API error: ${res.status}`);
  }
  return res.json();
}

export async function listPlugins(params?: {
  search?: string;
  status?: string;
}): Promise<Plugin[]> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set("search", params.search);
  if (params?.status) sp.set("status", params.status);
  const qs = sp.toString();
  return (await fetchJson(`${BASE}${qs ? `?${qs}` : ""}`)) as Plugin[];
}

export async function getPlugin(id: string): Promise<Plugin> {
  return (await fetchJson(`${BASE}/${encodeURIComponent(id)}`)) as Plugin;
}

export async function enablePlugin(id: string): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/${encodeURIComponent(id)}/enable`, { method: "PUT" });
    return true;
  } catch {
    return false;
  }
}

export async function disablePlugin(id: string): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/${encodeURIComponent(id)}/disable`, { method: "PUT" });
    return true;
  } catch {
    return false;
  }
}

export async function uninstallPlugin(id: string): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}

export async function getPluginStats(): Promise<PluginStats> {
  return (await fetchJson(`${BASE}/stats`)) as PluginStats;
}
