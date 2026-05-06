"use client";

import { useCallback } from "react";
import {
  ActivityIcon,
  AlertTriangleIcon,
  BarChart3Icon,
  ClockIcon,
  DownloadIcon,
  FileJsonIcon,
  FileTextIcon,
  RefreshCwIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import {
  usePerformanceReport,
  usePerformanceStats,
  type PerformanceReport,
  type PerformanceStats,
} from "@/core/performance";

// ══════════════════════════════════════════════════════════════════════
// Fallback mock generators (used when backend is unreachable)
// ══════════════════════════════════════════════════════════════════════

function generateMockReport(): PerformanceReport {
  const now = Date.now();
  return {
    id: `report-${now}`,
    generatedAt: new Date(now).toISOString(),
    period: { start: new Date(now - 86400000).toISOString(), end: new Date(now).toISOString() },
    metrics: {
      session: { p50: 120, p95: 450, p99: 890, avg: 210, count: 0 },
      workflow: { p50: 850, p95: 3200, p99: 5800, avg: 1200, count: 0 },
      mcp: { p50: 230, p95: 680, p99: 1200, avg: 310, count: 0 },
      system: { p50: 45, p95: 120, p99: 250, avg: 65, count: 0 },
    },
    healthScore: 0,
    trends: [],
    alerts: [],
    recommendations: ["Backend unavailable — showing demo data. Start the Gateway to see real performance metrics."],
  };
}

function generateMockStats(): PerformanceStats {
  return {
    totalReports: 0,
    averageHealthScore: 0,
    totalAlerts: 0,
    criticalAlerts: 0,
    totalMetrics: 0,
    lastReportTime: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════════════════════════
// Sub-components
// ══════════════════════════════════════════════════════════════════════

function MetricBar({ label, value, max, color, unit }: { label: string; value: number; max: number; color: string; unit: string }) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(1)}{unit}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function TrendBadge({ direction, changePercent }: { direction: string; changePercent: number }) {
  if (direction === "stable") return <Badge variant="outline" className="text-xs">Stable</Badge>;
  const isUp = direction === "up";
  return (
    <Badge className={`text-xs ${isUp ? "bg-red-500" : "bg-green-500"} text-white flex items-center gap-1`}>
      {isUp ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
      {changePercent.toFixed(1)}%
    </Badge>
  );
}

function AlertBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };
  return <Badge className={`${colors[severity] ?? "bg-slate-500"} text-white text-xs capitalize`}>{severity}</Badge>;
}

function exportReportAsJSON(report: PerformanceReport) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `performance-report-${report.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportReportAsMarkdown(report: PerformanceReport) {
  const lines = [
    `# Performance Report`,
    "",
    `- **ID:** ${report.id}`,
    `- **Generated:** ${new Date(report.generatedAt).toLocaleString()}`,
    `- **Period:** ${new Date(report.period.start).toLocaleString()} → ${new Date(report.period.end).toLocaleString()}`,
    `- **Health Score:** ${report.healthScore}/100`,
    "",
    "## Response Time Metrics (ms)",
    "",
    "| Category | P50 | P95 | P99 | Avg | Count |",
    "|----------|-----|-----|-----|-----|-------|",
    `| Session | ${report.metrics.session.p50} | ${report.metrics.session.p95} | ${report.metrics.session.p99} | ${report.metrics.session.avg.toFixed(1)} | ${report.metrics.session.count} |`,
    `| Workflow | ${report.metrics.workflow.p50} | ${report.metrics.workflow.p95} | ${report.metrics.workflow.p99} | ${report.metrics.workflow.avg.toFixed(1)} | ${report.metrics.workflow.count} |`,
    `| MCP | ${report.metrics.mcp.p50} | ${report.metrics.mcp.p95} | ${report.metrics.mcp.p99} | ${report.metrics.mcp.avg.toFixed(1)} | ${report.metrics.mcp.count} |`,
    `| System | ${report.metrics.system.p50} | ${report.metrics.system.p95} | ${report.metrics.system.p99} | ${report.metrics.system.avg.toFixed(1)} | ${report.metrics.system.count} |`,
    "",
    "## Trends",
    "",
    ...report.trends.map((t) => `- **${t.metric}:** ${t.direction} (${t.changePercent.toFixed(1)}%) over ${t.period}`),
    "",
    "## Alerts",
    "",
    ...report.alerts.map((a) => `- **[${a.severity.toUpperCase()}]** ${a.metric}: ${a.message} (current: ${a.current}, threshold: ${a.threshold})`),
    "",
    "## Recommendations",
    "",
    ...report.recommendations.map((r) => `- ${r}`),
    "",
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `performance-report-${report.id}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════════════════

export default function PerformancePage() {
  const queryClient = useQueryClient();

  // ── Data fetching via React Query ──────────────────────────────────
  const { report: apiReport, isLoading: reportLoading } = usePerformanceReport();
  const { stats: apiStats, isLoading: statsLoading } = usePerformanceStats();

  const isLoading = reportLoading || statsLoading;

  // Graceful fallback when backend is unreachable
  const report: PerformanceReport = apiReport ?? generateMockReport();
  const stats: PerformanceStats = apiStats ?? generateMockStats();
  const isLiveData = apiReport !== null;

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["performance"] });
  }, [queryClient]);

  // ── Helpers ────────────────────────────────────────────────────────
  const healthColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ActivityIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
          <Badge variant="outline" className={`text-xs ml-2 ${isLiveData ? "border-green-500 text-green-600" : "border-amber-500 text-amber-600"}`}>
            {isLiveData ? "Live Data" : "Demo Mode"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <DownloadIcon className="size-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportReportAsJSON(report)}>
                <FileJsonIcon className="size-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportReportAsMarkdown(report)}>
                <FileTextIcon className="size-4 mr-2" />
                Export as Markdown
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCwIcon className="size-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${healthColor(stats.averageHealthScore)}`}>
                {stats.averageHealthScore}
              </div>
              <p className="text-muted-foreground text-xs">out of 100</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-muted-foreground text-xs">generated</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAlerts}</div>
              <p className="text-muted-foreground text-xs">{stats.criticalAlerts} critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMetrics}</div>
              <p className="text-muted-foreground text-xs">tracked</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Response Time Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="size-5" />
                Response Time Percentiles (ms)
              </CardTitle>
              <CardDescription>Last 24 hours — P50, P95, P99 breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {([
                { key: "session", label: "Session", color: "#3b82f6", metrics: report.metrics.session },
                { key: "workflow", label: "Workflow", color: "#8b5cf6", metrics: report.metrics.workflow },
                { key: "mcp", label: "MCP", color: "#10b981", metrics: report.metrics.mcp },
                { key: "system", label: "System", color: "#f59e0b", metrics: report.metrics.system },
              ] as const).map((cat) => (
                <div key={cat.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{cat.label}</span>
                    <span className="text-muted-foreground text-xs">{cat.metrics.count} samples</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <MetricBar label="P50" value={cat.metrics.p50} max={cat.metrics.p99 * 1.1 || 5000} color={cat.color} unit="ms" />
                    <MetricBar label="P95" value={cat.metrics.p95} max={cat.metrics.p99 * 1.1 || 5000} color={cat.color} unit="ms" />
                    <MetricBar label="P99" value={cat.metrics.p99} max={cat.metrics.p99 * 1.1 || 5000} color={cat.color} unit="ms" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Health Score Ring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ZapIcon className="size-5" />
                Health Score
              </CardTitle>
              <CardDescription>Overall system performance rating</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative size-40">
                  <svg className="size-40 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" opacity="0.2" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(report.healthScore / 100) * 264} 264`}
                      className={healthColor(report.healthScore)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${healthColor(report.healthScore)}`}>{report.healthScore}</span>
                    <span className="text-muted-foreground text-xs">/ 100</span>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm text-center">
                  {report.healthScore >= 80
                    ? "System performing well"
                    : report.healthScore >= 60
                    ? "Performance degradation detected"
                    : "Critical performance issues"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="size-5" />
                Trends
              </CardTitle>
              <CardDescription>Performance changes over time</CardDescription>
            </CardHeader>
            <CardContent>
              {report.trends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground text-sm">No trend data available yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Trends appear after at least two reports</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {report.trends.map((trend, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <span className="text-sm font-medium">{trend.metric}</span>
                        <p className="text-muted-foreground text-xs">Over {trend.period}</p>
                      </div>
                      <TrendBadge direction={trend.direction} changePercent={trend.changePercent} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangleIcon className="size-5" />
                Active Alerts
              </CardTitle>
              <CardDescription>Threshold violations requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {report.alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircleIcon className="text-green-500 mb-2 size-8" />
                  <p className="text-muted-foreground text-sm">No active alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {report.alerts.map((alert, i) => (
                    <div key={i} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{alert.metric}</span>
                        <AlertBadge severity={alert.severity} />
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">{alert.message}</p>
                      <p className="text-muted-foreground text-xs">
                        Current: {alert.current} · Threshold: {alert.threshold}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3Icon className="size-5" />
                Recommendations
              </CardTitle>
              <CardDescription>Suggested optimizations based on current metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {i + 1}
                    </div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
