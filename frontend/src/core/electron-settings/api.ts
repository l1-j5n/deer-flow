import { getBackendBaseURL } from "@/core/config";
import type { ElectronSettings, SettingsUpdate, AppInfo } from "./types";

const BASE = `/api/electron/settings`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Settings API error: ${res.status}`);
  }
  return res.json();
}

export async function getSettings(): Promise<ElectronSettings> {
  return (await fetchJson(BASE)) as ElectronSettings;
}

export async function saveSettings(data: SettingsUpdate): Promise<ElectronSettings> {
  return (await fetchJson(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })) as ElectronSettings;
}

export async function resetSettings(): Promise<ElectronSettings> {
  return (await fetchJson(`${BASE}/reset`, { method: "POST" })) as ElectronSettings;
}

export async function getAppInfo(): Promise<AppInfo> {
  return (await fetchJson(`${BASE}/about`)) as AppInfo;
}
