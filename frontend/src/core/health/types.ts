/**
 * Health monitoring types.
 *
 * Mirrors the backend Pydantic models in routers/health.py.
 */

export interface ServiceEntry {
  name: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  response_time_ms: number;
  last_check: string;
  error_count: number;
  consecutive_failures: number;
}

export interface ResourceSnapshot {
  cpu_percent: number;
  memory_rss_mb: number;
  memory_percent: number;
  disk_percent: number;
  timestamp: string;
}

export interface IssueEntry {
  id: string;
  severity: "critical" | "warning" | "info";
  service?: string;
  resource?: string;
  message: string;
  recommendation: string;
  detected_at: string;
  resolved_at?: string;
}

export interface HealthReport {
  timestamp: string;
  overall_status: "healthy" | "degraded" | "unhealthy";
  score: number;
  services: ServiceEntry[];
  resources: ResourceSnapshot;
  issues: IssueEntry[];
  recommendations: string[];
}

export interface HealthStats {
  total_services: number;
  healthy_services: number;
  degraded_services: number;
  unhealthy_services: number;
  total_issues: number;
  critical_issues: number;
  warning_issues: number;
  average_score: number;
}
