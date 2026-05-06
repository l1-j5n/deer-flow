import { getBackendBaseURL } from "@/core/config";

import type {
  CreateShareResponse,
  RevokeShareResponse,
  ShareLinkListResponse,
  SharedAgentView,
} from "./types";

export async function createAgentShare(
  name: string,
  expiresInHours?: number,
): Promise<CreateShareResponse> {
  const body: Record<string, unknown> = {};
  if (expiresInHours != null && expiresInHours > 0) {
    body.expires_in_hours = expiresInHours;
  }
  const res = await fetch(
    `${getBackendBaseURL()}/api/agents/${encodeURIComponent(name)}/share`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(
      err.detail ?? `Failed to create share link: ${res.statusText}`,
    );
  }
  return res.json() as Promise<CreateShareResponse>;
}

export async function listAgentShares(
  name: string,
): Promise<ShareLinkListResponse> {
  const res = await fetch(
    `${getBackendBaseURL()}/api/agents/${encodeURIComponent(name)}/shares`,
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(
      err.detail ?? `Failed to list shares: ${res.statusText}`,
    );
  }
  return res.json() as Promise<ShareLinkListResponse>;
}

export async function revokeAgentShare(
  name: string,
  token: string,
): Promise<RevokeShareResponse> {
  const res = await fetch(
    `${getBackendBaseURL()}/api/agents/${encodeURIComponent(name)}/shares/${encodeURIComponent(token)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(
      err.detail ?? `Failed to revoke share: ${res.statusText}`,
    );
  }
  return res.json() as Promise<RevokeShareResponse>;
}

/**
 * Public endpoint — fetch a shared agent by token (no auth required).
 * Uses window.location.origin directly to avoid workspace auth context.
 */
export async function getSharedAgent(
  token: string,
): Promise<SharedAgentView> {
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : getBackendBaseURL();
  const url = new URL(
    `/api/shared/agents/${encodeURIComponent(token)}`,
    baseUrl,
  );
  const res = await fetch(url.toString());
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Share link not found or has been revoked");
    }
    if (res.status === 410) {
      throw new Error("This share link has expired");
    }
    throw new Error(`Failed to load shared agent: ${res.statusText}`);
  }
  return res.json() as Promise<SharedAgentView>;
}
