import { getBackendBaseURL } from "@/core/config";
import type { AppNotification, NotificationListResponse, NotificationSettingsModel, MarkReadRequest } from "./types";

const BASE = `/api/electron/notifications`;

async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const url = `${getBackendBaseURL()}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Notifications API error: ${res.status}`);
  }
  return res.json();
}

export async function listNotifications(params?: {
  category?: string;
  severity?: string;
  unread_only?: boolean;
  limit?: number;
  offset?: number;
}): Promise<NotificationListResponse> {
  const sp = new URLSearchParams();
  if (params?.category) sp.set("category", params.category);
  if (params?.severity) sp.set("severity", params.severity);
  if (params?.unread_only) sp.set("unread_only", "true");
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const qs = sp.toString();
  return (await fetchJson(`${BASE}${qs ? `?${qs}` : ""}`)) as NotificationListResponse;
}

export async function markNotificationsRead(body: MarkReadRequest): Promise<{ ok: boolean; markedRead: number }> {
  return (await fetchJson(`${BASE}/mark-read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })) as { ok: boolean; markedRead: number };
}

export async function deleteNotification(id: string): Promise<{ ok: boolean; id: string }> {
  return (await fetchJson(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })) as { ok: boolean; id: string };
}

export async function clearAllNotifications(): Promise<{ ok: boolean; cleared: number }> {
  return (await fetchJson(`${BASE}/clear`, { method: "POST" })) as { ok: boolean; cleared: number };
}

export async function getNotificationSettings(): Promise<NotificationSettingsModel> {
  return (await fetchJson(`${BASE}/settings`)) as NotificationSettingsModel;
}

export async function updateNotificationSettings(body: NotificationSettingsModel): Promise<NotificationSettingsModel> {
  return (await fetchJson(`${BASE}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })) as NotificationSettingsModel;
}
