import { getBackendBaseURL } from "@/core/config";
import type { AuditEvent, AuditQuery, AuditStats, IntegrityResult } from "./types";

const BASE = `/api/electron/audit`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Audit API error: ${res.status}`);
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

/** Build query string from AuditQuery params. */
function buildQuery(params?: AuditQuery): string {
  if (!params) return "";
  const parts: string[] = [];
  if (params.category) parts.push(`category=${encodeURIComponent(params.category)}`);
  if (params.severity) parts.push(`severity=${encodeURIComponent(params.severity)}`);
  if (params.sessionId) parts.push(`sessionId=${encodeURIComponent(params.sessionId)}`);
  if (params.since) parts.push(`since=${encodeURIComponent(params.since)}`);
  if (params.until) parts.push(`until=${encodeURIComponent(params.until)}`);
  if (params.limit !== undefined) parts.push(`limit=${params.limit}`);
  if (params.offset !== undefined) parts.push(`offset=${params.offset}`);
  return parts.length ? `?${parts.join("&")}` : "";
}

export async function queryAuditEvents(params?: AuditQuery): Promise<AuditEvent[]> {
  const qs = buildQuery(params);
  return (await fetchJson(`${BASE}/events${qs}`)) as AuditEvent[];
}

export async function getAuditStats(): Promise<AuditStats> {
  return (await fetchJson(`${BASE}/stats`)) as AuditStats;
}

export async function getRecentAudit(
  limit = 50,
  category?: string,
): Promise<AuditEvent[]> {
  let path = `${BASE}/recent?limit=${limit}`;
  if (category) path += `&category=${encodeURIComponent(category)}`;
  return (await fetchJson(path)) as AuditEvent[];
}

export async function verifyAuditIntegrity(): Promise<IntegrityResult> {
  return (await fetchJson(`${BASE}/examine`, { method: "POST" })) as IntegrityResult;
}

export async function exportAuditJSON(params?: AuditQuery): Promise<Blob> {
  const qs = buildQuery(params);
  const url = `${getBackendBaseURL()}${BASE}/export/json${qs}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  return res.blob();
}

export async function exportAuditCSV(params?: AuditQuery): Promise<Blob> {
  const qs = buildQuery(params);
  const url = `${getBackendBaseURL()}${BASE}/export/csv${qs}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  return res.blob();
}
