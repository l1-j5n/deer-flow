/**
 * Theme API for DeerFlow Electron platform.
 */

import type { ThemeConfig, ThemePreview, ThemeStats } from "./types";

const BASE = `/api/theme`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${path.startsWith("/") ? "" : BASE}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getTheme(): Promise<ThemeConfig> {
  return (await fetchJson(BASE)) as ThemeConfig;
}

export async function updateTheme(config: Partial<ThemeConfig>): Promise<ThemeConfig> {
  return (await fetchJson(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  })) as ThemeConfig;
}

export async function resetTheme(): Promise<ThemeConfig> {
  return (await fetchJson(`${BASE}/reset`, { method: "POST" })) as ThemeConfig;
}

export async function getThemePreview(): Promise<ThemePreview> {
  return (await fetchJson(`${BASE}/preview`)) as ThemePreview;
}

export async function getThemeStats(): Promise<ThemeStats> {
  return (await fetchJson(`${BASE}/stats`)) as ThemeStats;
}