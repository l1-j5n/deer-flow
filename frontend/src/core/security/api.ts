import { getBackendBaseURL } from "@/core/config";
import type { SecurityStats, SecurityPolicy, RateLimitStatus, PolicyListResponse } from "./types";

const BASE = `/api/electron/security`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Security API error: ${res.status}`);
  }
  return res.json();
}

export async function getSecurityStats(): Promise<SecurityStats> {
  return (await fetchJson(`${BASE}/stats`)) as SecurityStats;
}

export async function listPolicies(params?: {
  category?: string;
  enabled?: boolean;
}): Promise<PolicyListResponse> {
  const sp = new URLSearchParams();
  if (params?.category) sp.set("category", params.category);
  if (params?.enabled !== undefined) sp.set("enabled", String(params.enabled));
  const qs = sp.toString();
  return (await fetchJson(`${BASE}/policies${qs ? `?${qs}` : ""}`)) as PolicyListResponse;
}

export async function getRateLimit(): Promise<RateLimitStatus> {
  return (await fetchJson(`${BASE}/rate-limit`)) as RateLimitStatus;
}
