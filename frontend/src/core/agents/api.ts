import { getBackendBaseURL } from "@/core/config";

import type { Agent, AgentVersionDetail, AgentVersionDiffResponse, AgentVersionsResponse, CreateAgentRequest, RestoreVersionResponse, TimingHistory, UpdateAgentRequest } from "./types";

export async function listAgents(): Promise<Agent[]> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents`);
  if (!res.ok) throw new Error(`Failed to load agents: ${res.statusText}`);
  const data = (await res.json()) as { agents: Agent[] };
  return data.agents;
}

export async function getAgent(name: string): Promise<Agent> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents/${name}`);
  if (!res.ok) throw new Error(`Agent '${name}' not found`);
  return res.json() as Promise<Agent>;
}

export async function createAgent(request: CreateAgentRequest): Promise<Agent> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to create agent: ${res.statusText}`);
  }
  return res.json() as Promise<Agent>;
}

export async function updateAgent(
  name: string,
  request: UpdateAgentRequest,
): Promise<Agent> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents/${name}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to update agent: ${res.statusText}`);
  }
  return res.json() as Promise<Agent>;
}

export async function deleteAgent(name: string): Promise<void> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents/${name}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete agent: ${res.statusText}`);
}

// AgentStats is defined in types.ts (single source of truth)
import type { AgentStats } from "./types";

export async function getAgentStats(name: string): Promise<AgentStats> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents/${encodeURIComponent(name)}/stats`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to load agent stats: ${res.statusText}`);
  }
  return res.json() as Promise<AgentStats>;
}

export interface AgentCompareItem {
  name: string;
  stats: AgentStats;
}

export interface AgentCompareResponse {
  agents: AgentCompareItem[];
}

export async function compareAgentStats(names: string[]): Promise<AgentCompareResponse> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ names }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to compare agents: ${res.statusText}`);
  }
  return res.json() as Promise<AgentCompareResponse>;
}

export async function checkAgentName(
  name: string,
): Promise<{ available: boolean; name: string }> {
  const res = await fetch(
    `${getBackendBaseURL()}/api/agents/check?name=${encodeURIComponent(name)}`,
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(
      err.detail ?? `Failed to check agent name: ${res.statusText}`,
    );
  }
  return res.json() as Promise<{ available: boolean; name: string }>;
}

export async function getAgentTiming(name: string): Promise<TimingHistory> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents/${encodeURIComponent(name)}/timing`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to load agent timing: ${res.statusText}`);
  }
  return res.json() as Promise<TimingHistory>;
}

export interface AgentExportData {
  name: string;
  description: string;
  model: string | null;
  tool_groups: string[] | null;
  soul: string | null;
  version: string;
}

export async function exportAgent(name: string): Promise<AgentExportData> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents/${encodeURIComponent(name)}/export`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to export agent: ${res.statusText}`);
  }
  return res.json() as Promise<AgentExportData>;
}

export async function importAgent(
  data: AgentExportData,
  overwrite?: boolean,
): Promise<{ name: string; created: boolean }> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, overwrite: overwrite ?? false }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to import agent: ${res.statusText}`);
  }
  return res.json() as Promise<{ name: string; created: boolean }>;
}

export async function importAgentFromFile(file: File, overwrite?: boolean): Promise<{ name: string; created: boolean }> {
  const formData = new FormData();
  formData.append("file", file);
  if (overwrite) {
    formData.append("overwrite", "true");
  }
  const res = await fetch(`${getBackendBaseURL()}/api/agents/import`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to import agent: ${res.statusText}`);
  }
  return res.json() as Promise<{ name: string; created: boolean }>;
}

// ── Batch Export / Import (ZIP) ──────────────────────────────────────────

/**
 * Export multiple agents as a ZIP archive.
 * Returns a Blob that can be downloaded via URL.createObjectURL + anchor click.
 */
export async function exportAgentsBatch(names: string[]): Promise<Blob> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents/export-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ names }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to export agents: ${res.statusText}`);
  }
  return res.blob();
}

export interface BatchImportResult {
  name: string;
  created: boolean;
  error?: string | null;
}

export interface BatchImportResponse {
  results: BatchImportResult[];
  total: number;
  imported: number;
  skipped: number;
  failed: number;
}

/**
 * Import multiple agents from a ZIP file.
 */
export async function importAgentsBatch(
  file: File,
  overwrite?: boolean,
): Promise<BatchImportResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (overwrite) {
    formData.append("overwrite", "true");
  }
  const res = await fetch(`${getBackendBaseURL()}/api/agents/import-batch`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to import agents: ${res.statusText}`);
  }
  return res.json() as Promise<BatchImportResponse>;
}

/**
 * Trigger browser download of a Blob as a file.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Version History API ---

export async function getAgentVersions(
  name: string,
): Promise<AgentVersionsResponse> {
  const res = await fetch(
    `${getBackendBaseURL()}/api/agents/${encodeURIComponent(name)}/versions`,
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(
      err.detail ?? `Failed to fetch versions: ${res.statusText}`,
    );
  }
  return res.json() as Promise<AgentVersionsResponse>;
}

export async function getAgentVersion(
  name: string,
  versionId: string,
): Promise<AgentVersionDetail> {
  const res = await fetch(
    `${getBackendBaseURL()}/api/agents/${encodeURIComponent(name)}/versions/${encodeURIComponent(versionId)}`,
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(
      err.detail ?? `Failed to fetch version: ${res.statusText}`,
    );
  }
  return res.json() as Promise<AgentVersionDetail>;
}

export async function restoreAgentVersion(
  name: string,
  versionId: string,
): Promise<RestoreVersionResponse> {
  const res = await fetch(
    `${getBackendBaseURL()}/api/agents/${encodeURIComponent(name)}/versions/${encodeURIComponent(versionId)}/restore`,
    { method: "POST" },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(
      err.detail ?? `Failed to restore version: ${res.statusText}`,
    );
  }
  return res.json() as Promise<RestoreVersionResponse>;
}

export async function diffAgentVersions(
  name: string,
  fromVersion: string,
  toVersion: string,
): Promise<AgentVersionDiffResponse> {
  const params = new URLSearchParams({ from: fromVersion, to: toVersion });
  const res = await fetch(
    `${getBackendBaseURL()}/api/agents/${encodeURIComponent(name)}/versions/diff?${params}`,
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(
      err.detail ?? `Failed to diff versions: ${res.statusText}`,
    );
  }
  return res.json() as Promise<AgentVersionDiffResponse>;
}

// ── Batch Delete ──────────────────────────────────────────────────────────

export interface BatchDeleteItem {
  name: string;
  deleted: boolean;
  error: string | null;
}

export interface BatchDeleteResponse {
  results: BatchDeleteItem[];
  total: number;
  deleted: number;
  failed: number;
}

export async function deleteAgentsBatch(names: string[]): Promise<BatchDeleteResponse> {
  const res = await fetch(`${getBackendBaseURL()}/api/agents/delete-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ names }),
  });
  const data = (await res.json()) as BatchDeleteResponse;
  if (!res.ok) {
    throw new Error((data as { detail?: string }).detail ?? `Batch delete failed: ${res.statusText}`);
  }
  return data;
}
