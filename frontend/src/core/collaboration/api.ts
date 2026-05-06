import { getBackendBaseURL } from "@/core/config";
import type { CollaborationSession, CollaborationStats, Collaborator, CollaborationTask, AgentMessage } from "./types";

const BASE = `/api/electron/collaboration`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Collaboration API error: ${res.status}`);
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

// ── Sessions ─────────────────────────────────────────────────────────

export async function listSessions(status?: string): Promise<CollaborationSession[]> {
  try {
    const q = status ? `?status=${status}` : "";
    return (await fetchJson(`${BASE}/sessions${q}`)) as CollaborationSession[];
  } catch {
    const api = window.electronAPI?.collaboration;
    if (api) return (await api.listSessions(status ? { status } : undefined)) as unknown as CollaborationSession[];
    return [];
  }
}

export async function createSession(
  title: string,
  goal: string,
  consensusThreshold?: number,
): Promise<CollaborationSession | null> {
  try {
    return (await fetchJson(`${BASE}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, goal, consensusThreshold }),
    })) as CollaborationSession;
  } catch {
    const api = window.electronAPI?.collaboration;
    if (api) return (await api.createSession(title, goal, consensusThreshold ? { consensusThreshold } : undefined)) as CollaborationSession | null;
    return null;
  }
}

export async function getSession(id: string): Promise<CollaborationSession | null> {
  const data = await fetchJsonSafe(`${BASE}/sessions/${encodeURIComponent(id)}`);
  if (data) return data as CollaborationSession;
  const api = window.electronAPI?.collaboration;
  if (api) return (await api.getSession(id)) as CollaborationSession | null;
  return null;
}

export async function deleteSession(id: string): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/sessions/${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  } catch {
    const api = window.electronAPI?.collaboration;
    if (api) return api.deleteSession(id);
    return false;
  }
}

// ── Collaborators ────────────────────────────────────────────────────

export async function addCollaborator(
  sessionId: string,
  name: string,
  role: string,
  capabilities: string[],
  model?: string,
): Promise<Collaborator | null> {
  try {
    return (await fetchJson(`${BASE}/sessions/${encodeURIComponent(sessionId)}/collaborators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role, capabilities, model }),
    })) as Collaborator;
  } catch {
    const api = window.electronAPI?.collaboration;
    if (api) return (await api.addCollaborator(sessionId, name, role, capabilities, model)) as Collaborator | null;
    return null;
  }
}

export async function removeCollaborator(sessionId: string, collaboratorId: string): Promise<boolean> {
  try {
    await fetchJson(
      `${BASE}/sessions/${encodeURIComponent(sessionId)}/collaborators/${encodeURIComponent(collaboratorId)}`,
      { method: "DELETE" },
    );
    return true;
  } catch {
    const api = window.electronAPI?.collaboration;
    if (api) return api.removeCollaborator(sessionId, collaboratorId);
    return false;
  }
}

// ── Tasks ────────────────────────────────────────────────────────────

export async function createTask(
  sessionId: string,
  title: string,
  description: string,
  options?: { assignedTo?: string; dependencies?: string[]; priority?: number },
): Promise<CollaborationTask | null> {
  try {
    return (await fetchJson(`${BASE}/sessions/${encodeURIComponent(sessionId)}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, ...options }),
    })) as CollaborationTask;
  } catch {
    const api = window.electronAPI?.collaboration;
    if (api) return (await api.createTask(sessionId, title, description, options)) as CollaborationTask | null;
    return null;
  }
}

export async function updateTask(
  sessionId: string,
  taskId: string,
  updates: Partial<Pick<CollaborationTask, "status" | "assignedTo"> & { result?: unknown; error?: string }>,
): Promise<CollaborationTask | null> {
  try {
    return (await fetchJson(
      `${BASE}/sessions/${encodeURIComponent(sessionId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      },
    )) as CollaborationTask;
  } catch {
    const api = window.electronAPI?.collaboration;
    if (api) return (await api.updateTask(sessionId, taskId, updates)) as CollaborationTask | null;
    return null;
  }
}

// ── Messages ─────────────────────────────────────────────────────────

export async function getMessages(sessionId: string, limit?: number): Promise<AgentMessage[]> {
  try {
    const q = limit ? `?limit=${limit}` : "";
    return (await fetchJson(`${BASE}/sessions/${encodeURIComponent(sessionId)}/messages${q}`)) as AgentMessage[];
  } catch {
    const api = window.electronAPI?.collaboration;
    if (api) return (await api.getMessages(sessionId, limit ? { limit } : undefined)) as AgentMessage[];
    return [];
  }
}

export async function sendMessage(
  sessionId: string,
  from: string,
  type: string,
  content: string,
  options?: { to?: string; payload?: unknown },
): Promise<AgentMessage | null> {
  try {
    return (await fetchJson(`${BASE}/sessions/${encodeURIComponent(sessionId)}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, type, content, ...options }),
    })) as AgentMessage;
  } catch {
    const api = window.electronAPI?.collaboration;
    if (api) return (await api.sendMessage(sessionId, from, type, content, options)) as AgentMessage | null;
    return null;
  }
}

// ── Stats ────────────────────────────────────────────────────────────

export async function getCollaborationStats(): Promise<CollaborationStats | null> {
  const data = await fetchJsonSafe(`${BASE}/stats`);
  if (data) return data as CollaborationStats;
  const api = window.electronAPI?.collaboration;
  if (api) return (await api.getStats()) as unknown as CollaborationStats;
  return null;
}
