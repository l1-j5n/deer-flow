// ── Performance Monitoring Types ─────────────────────────────────────

export interface MetricSet {
  p50: number;
  p95: number;
  p99: number;
  avg: number;
  count: number;
}

export interface TrendItem {
  metric: string;
  direction: "up" | "down" | "stable";
  changePercent: number;
  period: string;
}

export interface AlertItem {
  metric: string;
  threshold: number;
  current: number;
  severity: "critical" | "warning" | "info";
  message: string;
}

export interface PerformanceReport {
  id: string;
  generatedAt: string;
  period: { start: string; end: string };
  metrics: {
    session: MetricSet;
    workflow: MetricSet;
    mcp: MetricSet;
    system: MetricSet;
  };
  healthScore: number;
  trends: TrendItem[];
  alerts: AlertItem[];
  recommendations: string[];
}

export interface PerformanceStats {
  totalReports: number;
  averageHealthScore: number;
  totalAlerts: number;
  criticalAlerts: number;
  totalMetrics: number;
  lastReportTime: string;
}
