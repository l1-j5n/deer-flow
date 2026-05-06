import { getBackendBaseURL } from "@/core/config";
import type { AutoBackupStatus, BackupConfig, BackupEntry, BackupRestoreRequest, BackupRestoreResponse, BackupStats, CreateBackupRequest } from "./types";

const BASE = `/api/electron/backup`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Backup API error: ${res.status}`);
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

export async function getBackupConfig(): Promise<BackupConfig> {
  return (await fetchJson(`${BASE}/config`)) as BackupConfig;
}

export async function updateBackupConfig(
  config: Partial<BackupConfig>,
): Promise<BackupConfig> {
  return (await fetchJson(`${BASE}/config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  })) as BackupConfig;
}

export async function createBackup(req?: CreateBackupRequest): Promise<BackupEntry> {
  return (await fetchJson(`${BASE}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req ?? {}),
  })) as BackupEntry;
}

export async function listBackups(): Promise<BackupEntry[]> {
  return (await fetchJson(`${BASE}/list`)) as BackupEntry[];
}

export async function deleteBackup(id: string): Promise<boolean> {
  try {
    await fetchJson(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}

export async function restoreBackup(
  req: BackupRestoreRequest,
): Promise<BackupRestoreResponse> {
  return (await fetchJson(`${BASE}/restore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })) as BackupRestoreResponse;
}

export async function getBackupStats(): Promise<BackupStats | null> {
  return (await fetchJsonSafe(`${BASE}/stats`)) as BackupStats | null;
}

export async function getAutoBackupStatus(): Promise<AutoBackupStatus> {
  return (await fetchJson(`${BASE}/auto-backup/status`)) as AutoBackupStatus;
}

export async function startAutoBackup(): Promise<{ success: boolean; enabled: boolean }> {
  return (await fetchJson(`${BASE}/auto-backup/start`, { method: "POST" })) as { success: boolean; enabled: boolean };
}

export async function stopAutoBackup(): Promise<{ success: boolean; enabled: boolean }> {
  return (await fetchJson(`${BASE}/auto-backup/stop`, { method: "POST" })) as { success: boolean; enabled: boolean };
}
