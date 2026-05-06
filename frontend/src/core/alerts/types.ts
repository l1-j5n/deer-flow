/** Alert types for the slow response time alerting system. */

export interface AlertConfig {
  agent_name: string;
  enabled: boolean;
  p95_threshold_ms: number;
  cooldown_minutes: number;
  severity: string; // "critical" | "warning" | "info"
  last_fired_at: string | null;
  updated_at: string;
}

export interface AlertRecord {
  agent_name: string;
  severity: string;
  message: string;
  p95_ms: number | null;
  threshold_ms: number;
  status: string; // "firing" | "resolved"
  fired_at: string;
  resolved_at: string | null;
}

export interface AlertHistoryResponse {
  agent_name: string;
  alerts: AlertRecord[];
}

export interface AlertListResponse {
  configs: AlertConfig[];
}

export interface EvaluateResponse {
  fired: AlertRecord[];
  dry_run: boolean;
}

export interface AlertConfigRequest {
  enabled: boolean;
  p95_threshold_ms: number;
  cooldown_minutes: number;
  severity: string;
}
