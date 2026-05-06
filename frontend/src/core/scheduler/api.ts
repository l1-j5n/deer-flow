import { getBackendBaseURL } from "@/core/config";
import type { ScheduledTask, SchedulerStats, TaskExecution } from "./types";

const BASE = `/api/electron/scheduler`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Scheduler API error: ${res.status}`);
  }
  return res.json();
}

async function fetchJsonSafe(path: string, init?: RequestInit): Promise<unknown | null> {
  try {
    return await fetchJson(path, init);
  } catch {
    return null;
  }
}

// ── Task CRUD ────────────────────────────────────────────────────────

export async function listTasks(filters?: {
  type?: string;
  status?: string;
  enabled?: boolean;
}): Promise<ScheduledTask[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.enabled !== undefined) params.set("enabled", String(filters.enabled));
    const q = params.toString() ? `?${params}` : "";
    return (await fetchJson(`${BASE}/tasks${q}`)) as ScheduledTask[];
  } catch {
    const api = window.electronAPI?.scheduler;
    if (api) return (await api.listTasks(filters)) as unknown as ScheduledTask[];
    return [];
  }
}

export async function createTask(
  input: Omit<ScheduledTask, "id" | "status" | "runCount" | "failCount" | "createdAt" | "updatedAt">,
): Promise<ScheduledTask | null> {
  try {
    return (await fetchJson(`${BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })) as ScheduledTask;
  } catch {
    const api = window.electronAPI?.scheduler;
    if (api) return (await api.createTask(input)) as ScheduledTask | null;
    return null;
  }
}

export async function getTask(id: string): Promise<ScheduledTask | null> {
  const data = await fetchJsonSafe(`${BASE}/tasks/${encodeURIComponent(id)}`);
  if (data) return data as ScheduledTask;
  const api = window.electronAPI?.scheduler;
  if (api) return (await api.getTask(id)) as ScheduledTask | null;
  return null;
}

export async function updateTask(
  id: string,
  updates: Partial<ScheduledTask>,
): Promise<ScheduledTask | null> {
  try {
    return (await fetchJson(`${BASE}/tasks/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })) as ScheduledTask;
  } catch {
    const api = window.electronAPI?.scheduler;
    if (api) return (await api.updateTask(id, updates)) as ScheduledTask | null;
    return null;
  }
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  } catch {
    const api = window.electronAPI?.scheduler;
    if (api) return api.deleteTask(id);
    return false;
  }
}

export async function enableTask(id: string): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/tasks/${encodeURIComponent(id)}/enable`, { method: "POST" });
    return true;
  } catch {
    const api = window.electronAPI?.scheduler;
    if (api) return api.enableTask(id);
    return false;
  }
}

export async function disableTask(id: string): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/tasks/${encodeURIComponent(id)}/disable`, { method: "POST" });
    return true;
  } catch {
    const api = window.electronAPI?.scheduler;
    if (api) return api.disableTask(id);
    return false;
  }
}

export async function runTaskNow(id: string): Promise<TaskExecution | null> {
  try {
    return (await fetchJson(`${BASE}/tasks/${encodeURIComponent(id)}/run`, {
      method: "POST",
    })) as TaskExecution;
  } catch {
    const api = window.electronAPI?.scheduler;
    if (api) return (await api.runNow(id)) as TaskExecution | null;
    return null;
  }
}

export async function getHistory(taskId?: string): Promise<TaskExecution[]> {
  try {
    const q = taskId ? `?taskId=${encodeURIComponent(taskId)}` : "";
    return (await fetchJson(`${BASE}/history${q}`)) as TaskExecution[];
  } catch {
    const api = window.electronAPI?.scheduler;
    if (api) return (await api.getHistory(taskId)) as TaskExecution[];
    return [];
  }
}

export async function getSchedulerStats(): Promise<SchedulerStats | null> {
  const data = await fetchJsonSafe(`${BASE}/stats`);
  if (data) return data as SchedulerStats;
  const api = window.electronAPI?.scheduler;
  if (api) return (await api.getStats()) as unknown as SchedulerStats;
  return null;
}
