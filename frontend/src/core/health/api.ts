/**
 * Health API client.
 *
 * Fetch priority:  backend API  →  Electron IPC  →  null (mock fallback).
 * Returns null gracefully when neither backend nor Electron is available
 * so the UI can fall back to mock/demo data.
 */

import type { HealthReport, HealthStats } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "";

/**
 * Fetch the full health report (snapshot).
 */
export async function getHealthReport(): Promise<HealthReport | null> {
  // 1. Try backend API
  try {
    const res = await fetch(`${BASE_URL}/api/health/report`);
    if (res.ok) return (await res.json()) as HealthReport;
  } catch {
    /* fall through to IPC */
  }

  // 2. Fallback: Electron IPC (healthMonitor snapshot)
  try {
    const api = window.electronAPI;
    if (!api?.healthMonitor) return null;
    const snap: any = await api.healthMonitor.getSnapshot();
    if (!snap) return null;

    return {
      timestamp: snap.timestamp || new Date().toISOString(),
      overall_status: snap.overallStatus || snap.overall_status || "unknown",
      score: snap.score ?? 0,
      services: Array.isArray(snap.services)
        ? snap.services.map((s: any) => ({
            name: s.name || "unknown",
            status: s.status || "unknown",
            response_time_ms: s.responseTimeMs ?? s.response_time_ms ?? 0,
            last_check: s.lastCheck || s.last_check || new Date().toISOString(),
            error_count: s.errorCount ?? s.error_count ?? 0,
            consecutive_failures:
              s.consecutiveFailures ?? s.consecutive_failures ?? 0,
          }))
        : [],
      resources: {
        cpu_percent:
          snap.resources?.cpuPercent ?? snap.resources?.cpu_percent ?? 0,
        memory_rss_mb:
          snap.resources?.memoryRssMB ?? snap.resources?.memory_rss_mb ?? 0,
        memory_percent:
          snap.resources?.memoryPercent ??
          snap.resources?.memory_percent ??
          0,
        disk_percent:
          snap.resources?.diskPercent ?? snap.resources?.disk_percent ?? 0,
        timestamp: snap.resources?.timestamp || snap.timestamp || "",
      },
      issues: Array.isArray(snap.issues)
        ? snap.issues.map((i: any) => ({
            id: i.id || "",
            severity: i.severity || "info",
            service: i.service,
            resource: i.resource,
            message: i.message || "",
            recommendation: i.recommendation || "",
            detected_at: i.detectedAt || i.detected_at || "",
            resolved_at: i.resolvedAt || i.resolved_at,
          }))
        : [],
      recommendations: Array.isArray(snap.recommendations)
        ? snap.recommendations
        : [],
    } satisfies HealthReport;
  } catch {
    return null;
  }
}

/**
 * Fetch health summary statistics.
 */
export async function getHealthStats(): Promise<HealthStats | null> {
  // 1. Try backend API
  try {
    const res = await fetch(`${BASE_URL}/api/health/stats`);
    if (res.ok) return (await res.json()) as HealthStats;
  } catch {
    /* fall through to IPC */
  }

  // 2. Fallback: Electron IPC (healthMonitor stats)
  try {
    const api = window.electronAPI;
    if (!api?.healthMonitor) return null;
    const stats: any = await api.healthMonitor.getStats();
    if (!stats) return null;

    return {
      total_services: stats.totalServices ?? stats.total_services ?? 0,
      healthy_services: stats.healthyServices ?? stats.healthy_services ?? 0,
      degraded_services:
        stats.degradedServices ?? stats.degraded_services ?? 0,
      unhealthy_services:
        stats.unhealthyServices ?? stats.unhealthy_services ?? 0,
      total_issues: stats.totalIssues ?? stats.total_issues ?? 0,
      critical_issues: stats.criticalIssues ?? stats.critical_issues ?? 0,
      warning_issues: stats.warningIssues ?? stats.warning_issues ?? 0,
      average_score: stats.averageScore ?? stats.average_score ?? 0,
    } satisfies HealthStats;
  } catch {
    return null;
  }
}
