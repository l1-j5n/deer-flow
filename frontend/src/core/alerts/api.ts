import { getBackendBaseURL } from "@/core/config";
import type {
  AlertConfig,
  AlertConfigRequest,
  AlertHistoryResponse,
  AlertListResponse,
  EvaluateResponse,
} from "./types";

/** Fetch alert configurations for all agents. */
export async function listAlertConfigs(): Promise<AlertListResponse> {
  const res = await fetch(`${getBackendBaseURL()}/api/alerts`);
  if (!res.ok) throw new Error(`Failed to load alert configs: ${res.statusText}`);
  return res.json() as Promise<AlertListResponse>;
}

/** Get alert configuration for a single agent. */
export async function getAlertConfig(name: string): Promise<AlertConfig> {
  const res = await fetch(
    `${getBackendBaseURL()}/api/alerts/${encodeURIComponent(name)}/config`,
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to load alert config: ${res.statusText}`);
  }
  return res.json() as Promise<AlertConfig>;
}

/** Create or update alert configuration for an agent. */
export async function updateAlertConfig(
  name: string,
  request: AlertConfigRequest,
): Promise<AlertConfig> {
  const res = await fetch(
    `${getBackendBaseURL()}/api/alerts/${encodeURIComponent(name)}/config`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    },
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to update alert config: ${res.statusText}`);
  }
  return res.json() as Promise<AlertConfig>;
}

/** Get alert history for an agent. */
export async function getAlertHistory(name: string): Promise<AlertHistoryResponse> {
  const res = await fetch(
    `${getBackendBaseURL()}/api/alerts/${encodeURIComponent(name)}/history`,
  );
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to load alert history: ${res.statusText}`);
  }
  return res.json() as Promise<AlertHistoryResponse>;
}

/** Run alert evaluation (optionally dry-run). */
export async function evaluateAlerts(dryRun: boolean = false): Promise<EvaluateResponse> {
  const res = await fetch(`${getBackendBaseURL()}/api/alerts/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dry_run: dryRun }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to evaluate alerts: ${res.statusText}`);
  }
  return res.json() as Promise<EvaluateResponse>;
}
