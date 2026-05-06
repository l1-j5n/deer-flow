import { getBackendBaseURL } from "@/core/config";
import type { MemoryEntry, MemoryStats, MemoryQueryParams, UpdateMemoryRequest } from "./types";

const BASE = `/api/electron/conversation-memory`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Conversation Memory API error: ${res.status}`);
  }
  return res.json();
}

export async function queryMemories(params?: MemoryQueryParams): Promise<MemoryEntry[]> {
  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    }
  }
  const qs = searchParams.toString();
  return (await fetchJson(`${BASE}${qs ? `?${qs}` : ""}`)) as MemoryEntry[];
}

export async function getMemoryStats(): Promise<MemoryStats> {
  return (await fetchJson(`${BASE}/stats`)) as MemoryStats;
}

export async function updateMemory(
  id: string,
  updates: UpdateMemoryRequest,
): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteMemory(id: string): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}
