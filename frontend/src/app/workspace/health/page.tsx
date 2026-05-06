"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CpuIcon,
  HardDriveIcon,
  MemoryStickIcon,
  RefreshCwIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  XCircleIcon,
  WifiIcon,
  DatabaseIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useHealthReport,
  useHealthStats,
  type HealthReport,
  type HealthStats,
} from "@/core/health";

// ── Mock data generator ──────────────────────────────────────────────

function generateMockReport(): HealthReport {
  const now = new Date().toISOString();
  return {
    timestamp: now,
    overall_status: "healthy",
    score: 92,
    services: [
      { name: "Gateway", status: "healthy", response_time_ms: 5, last_check: now, error_count: 0, consecutive_failures: 0 },
      { name: "LangGraph", status: "healthy", response_time_ms: 42, last_check: now, error_count: 0, consecutive_failures: 0 },
      { name: "MCP Server", status: "healthy", response_time_ms: 18, last_check: now, error_count: 0, consecutive_failures: 0 },
      { name: "Agents", status: "degraded", response_time_ms: 230, last_check: now, error_count: 2, consecutive_failures: 1 },
      { name: "Frontend", status: "unknown", response_time_ms: 0, last_check: now, error_count: 0, consecutive_failures: 0 },
    ],
    resources: {
      cpu_percent: 34.2,
      memory_rss_mb: 512.3,
      memory_percent: 42.8,
      disk_percent: 65.1,
      timestamp: now,
    },
    issues: [
      {
        id: "demo-1",
        severity: "warning",
        service: "Agents",
        resource: "code-reviewer",
        message: "Response time p95 exceeds 5s threshold",
        recommendation: "Check agent configuration and model provider latency",
        detected_at: now,
      },
    ],
    recommendations: [
      "All core services are healthy — no critical issues detected",
      "Monitor agent 'code-reviewer' for sustained high response times",
      "Disk usage is at 65% — ensure you have cleanup policies for old artifacts",
    ],
  };
}

function generateMockStats(report: HealthReport): HealthStats {
  return {
    total_services: report.services.length,
    healthy_services: report.services.filter((s) => s.status === "healthy").length,
    degraded_services: report.services.filter((s) => s.status === "degraded").length,
    unhealthy_services: report.services.filter((s) => s.status === "unhealthy").length,
    total_issues: report.issues.length,
    critical_issues: report.issues.filter((i) => i.severity === "critical").length,
    warning_issues: report.issues.filter((i) => i.severity === "warning").length,
    average_score: report.score,
  };
}

// ── Sub-components ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    healthy: { variant: "default", icon: <CheckCircle2Icon className="size-3" /> },
    degraded: { variant: "secondary", icon: <AlertTriangleIcon className="size-3" /> },
    unhealthy: { variant: "destructive", icon: <XCircleIcon className="size-3" /> },
    recovering: { variant: "outline", icon: <RefreshCwIcon className="size-3" /> },
    unknown: { variant: "outline", icon: <ClockIcon className="size-3" /> },
  };
  const config = variants[status] ?? variants.unknown;
  if (!config) return null;
  return (
    <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
      {config.icon}
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-muted-foreground text-[10px]">/ 100</span>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────

export default function HealthPage() {
  const queryClient = useQueryClient();
  const { data: report, isLoading, isFetching } = useHealthReport();
  const { data: healthStats } = useHealthStats();
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  // Determine effective data: real API or mock fallback
  const isLive = report !== undefined && report !== null;
  const snapshot = report ?? generateMockReport();
  const stats = healthStats ?? generateMockStats(snapshot);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["health"] });
  }, [queryClient]);

  const toggleIssue = useCallback((id: string) => {
    setExpandedIssues((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ActivityIcon className="size-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health Monitor</h1>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span>
                {isLive
                  ? `Last updated: ${new Date(snapshot.timestamp).toLocaleTimeString()}`
                  : "Backend unavailable"}
              </span>
              <Badge variant={isLive ? "default" : "secondary"} className="text-[10px] h-4 px-1.5">
                {isLive ? (
                  <span className="flex items-center gap-1">
                    <WifiIcon className="size-2.5" /> Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <DatabaseIcon className="size-2.5" /> Demo
                  </span>
                )}
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isFetching}
        >
          <RefreshCwIcon
            className={`size-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Not connected banner */}
          {!isLive && (
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="flex items-center gap-3 py-3">
                <AlertTriangleIcon className="size-4 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Backend health API unavailable — showing demo data. Start the Gateway server for live monitoring.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Score & Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="flex flex-col items-center justify-center py-6">
              <ScoreRing score={snapshot.score} />
              <div className="mt-4 text-center">
                <StatusBadge status={snapshot.overall_status} />
              </div>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_services}</div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle2Icon className="size-3" /> Healthy
                    </span>
                    <span>{stats.healthy_services}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-yellow-500">
                      <AlertTriangleIcon className="size-3" /> Degraded
                    </span>
                    <span>{stats.degraded_services}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-red-500">
                      <XCircleIcon className="size-3" /> Unhealthy
                    </span>
                    <span>{stats.unhealthy_services}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_issues}</div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-500">Critical</span>
                    <span>{stats.critical_issues}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-yellow-500">Warning</span>
                    <span>{stats.warning_issues}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.average_score.toFixed(1)}</div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {stats.average_score >= snapshot.score ? (
                    <TrendingDownIcon className="size-3 text-red-500" />
                  ) : (
                    <TrendingUpIcon className="size-3 text-green-500" />
                  )}
                  <span className="text-muted-foreground">Current: {snapshot.score}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CpuIcon className="size-5" />
                Resource Usage
              </CardTitle>
              <CardDescription>System resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <CpuIcon className="size-4" /> CPU
                    </span>
                    <span className="text-sm">{snapshot.resources.cpu_percent.toFixed(1)}%</span>
                  </div>
                  <Progress value={snapshot.resources.cpu_percent} />
                  {!isLive && snapshot.resources.cpu_percent === 0 && (
                    <p className="text-muted-foreground text-xs">psutil not available</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <MemoryStickIcon className="size-4" /> Memory
                    </span>
                    <span className="text-sm">{snapshot.resources.memory_percent.toFixed(1)}%</span>
                  </div>
                  <Progress value={snapshot.resources.memory_percent} />
                  <p className="text-muted-foreground text-xs">
                    {snapshot.resources.memory_rss_mb.toFixed(0)} MB RSS
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <HardDriveIcon className="size-4" /> Disk
                    </span>
                    <span className="text-sm">{snapshot.resources.disk_percent.toFixed(1)}%</span>
                  </div>
                  <Progress value={snapshot.resources.disk_percent} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Detail */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Individual service health checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {snapshot.services.map((svc) => (
                  <div
                    key={svc.name}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <StatusBadge status={svc.status} />
                      <span className="font-medium">{svc.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{svc.response_time_ms}ms</span>
                      {svc.error_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {svc.error_count} errors
                        </Badge>
                      )}
                      {svc.consecutive_failures > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {svc.consecutive_failures} failures
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Issues */}
          {snapshot.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangleIcon className="size-5" />
                  Active Issues
                </CardTitle>
                <CardDescription>{snapshot.issues.length} issue(s) detected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {snapshot.issues.map((issue) => {
                  const isExpanded = expandedIssues.has(issue.id);
                  return (
                    <div key={issue.id} className="rounded-lg border p-4">
                      <div
                        className="flex cursor-pointer items-center justify-between"
                        onClick={() => toggleIssue(issue.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              issue.severity === "critical"
                                ? "destructive"
                                : issue.severity === "warning"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {issue.severity}
                          </Badge>
                          <span className="font-medium">{issue.message}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUpIcon className="size-4" />
                        ) : (
                          <ChevronDownIcon className="size-4" />
                        )}
                      </div>
                      {isExpanded && (
                        <div className="mt-3 space-y-2 border-t pt-3 text-sm">
                          {issue.service && (
                            <p>
                              <span className="font-medium">Service: </span>
                              {issue.service}
                            </p>
                          )}
                          {issue.resource && (
                            <p>
                              <span className="font-medium">Resource: </span>
                              {issue.resource}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Recommendation: </span>
                            {issue.recommendation}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Detected: {new Date(issue.detected_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {snapshot.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {snapshot.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
