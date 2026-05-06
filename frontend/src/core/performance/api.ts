import { getBackendBaseURL } from "@/core/config";
import type { PerformanceReport, PerformanceStats } from "./types";

/**
 * Fetch the aggregated system performance report from the backend.
 * Returns null gracefully when the backend is unavailable.
 */
export async function getPerformanceReport(): Promise<PerformanceReport | null> {
  try {
    const url = `${getBackendBaseURL()}/api/performance/report`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(
        `Performance report endpoint returned ${res.status}: ${res.statusText}`,
      );
      return null;
    }
    return (await res.json()) as PerformanceReport;
  } catch (err) {
    console.warn("Performance report endpoint unreachable:", err);
    return null;
  }
}

/**
 * Fetch performance summary statistics from the backend.
 * Returns null gracefully when the backend is unavailable.
 */
export async function getPerformanceStats(): Promise<PerformanceStats | null> {
  try {
    const url = `${getBackendBaseURL()}/api/performance/stats`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(
        `Performance stats endpoint returned ${res.status}: ${res.statusText}`,
      );
      return null;
    }
    return (await res.json()) as PerformanceStats;
  } catch (err) {
    console.warn("Performance stats endpoint unreachable:", err);
    return null;
  }
}
