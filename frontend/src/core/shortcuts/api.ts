import { getBackendBaseURL } from "@/core/config";
import type { Shortcut, ShortcutListResponse, ShortcutStats } from "./types";

const BASE = `/api/electron/shortcuts`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Shortcuts API error: ${res.status}`);
  }
  return res.json();
}

export async function listShortcuts(params?: {
  search?: string;
  category?: string;
}): Promise<ShortcutListResponse> {
  const sp = new URLSearchParams();
  if (params?.search) sp.set("search", params.search);
  if (params?.category) sp.set("category", params.category);
  const qs = sp.toString();
  return (await fetchJson(`${BASE}${qs ? `?${qs}` : ""}`)) as ShortcutListResponse;
}

export async function getShortcut(id: string): Promise<Shortcut> {
  return (await fetchJson(`${BASE}/${id}`)) as Shortcut;
}

export async function updateShortcut(id: string, keyCombo: string): Promise<Shortcut> {
  return (await fetchJson(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, keyCombo }),
  })) as Shortcut;
}

export async function resetShortcuts(): Promise<ShortcutListResponse> {
  return (await fetchJson(`${BASE}/reset`, {
    method: "POST",
  })) as ShortcutListResponse;
}

export async function getShortcutStats(): Promise<ShortcutStats> {
  return (await fetchJson(`${BASE}/stats`)) as ShortcutStats;
}