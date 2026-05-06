import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// ============================================================
// Type Definitions
// ============================================================

export interface PerformanceSnapshot {
  timestamp: string;
  sessionMetrics: SessionPerformanceMetrics;
  workflowMetrics: WorkflowPerformanceMetrics;
  mcpMetrics: MCPPerformanceMetrics;
  systemMetrics: SystemMetrics;
  aggregated: AggregatedMetrics;
}

export interface SessionPerformanceMetrics {
  activeSessions: number;
  totalMessages: number;
  messagesPerMinute: number;
  averageResponseTimeMs: number;
  p50ResponseTimeMs: number;
  p95ResponseTimeMs: number;
  p99ResponseTimeMs: number;
  errorRate: number;
  tokenThroughput: number;
  sessionsByStatus: Record<string, number>;
}

export interface WorkflowPerformanceMetrics {
  activeExecutions: number;
  completedExecutions: number;
  failedExecutions: number;
  averageExecutionTimeMs: number;
  averageNodeExecutionTimeMs: number;
  slowestNodes: Array<{ nodeId: string; nodeType: string; avgTimeMs: number }>;
  bottleneckNodes: string[];
  executionsByStatus: Record<string, number>;
}

export interface MCPPerformanceMetrics {
  totalCalls: number;
  callsPerMinute: number;
  averageLatencyMs: number;
  errorRate: number;
  callsByTool: Record<string, number>;
  latencyByTool: Record<string, number>;
  errorsByTool: Record<string, number>;
  topTools: Array<{ name: string; count: number; avgLatencyMs: number }>;
}

export interface SystemMetrics {
  memoryUsageMB: number;
  memoryUsagePercent: number;
  cpuUsagePercent: number;
  eventLoopLagMs: number;
  uptimeSeconds: number;
  freeMemoryMB: number;
  totalMemoryMB: number;
  loadAverage: number[];
}

export interface AggregatedMetrics {
  totalOperations: number;
  totalErrors: number;
  overallErrorRate: number;
  averageLatencyMs: number;
  throughput: number;
  healthScore: number;
  alerts: PerformanceAlert[];
}

export interface PerformanceAlert {
  id: string;
  severity: "critical" | "warning" | "info";
  category: "session" | "workflow" | "mcp" | "system";
  message: string;
  metric: string;
  threshold: number;
  actualValue: number;
  timestamp: string;
  acknowledged: boolean;
}

export interface MetricThreshold {
  metric: string;
  warning: number;
  critical: number;
  comparator: "gt" | "lt" | "eq";
}

export interface PerformanceReport {
  generatedAt: string;
  period: { from: string; to: string };
  snapshot: PerformanceSnapshot;
  trends: MetricTrend[];
  recommendations: string[];
}

export interface MetricTrend {
  metric: string;
  values: Array<{ timestamp: string; value: number }>;
  direction: "improving" | "degrading" | "stable";
  changePercent: number;
}

export interface SessionTiming {
  sessionId: string;
  messageId: string;
  startTime: number;
  endTime?: number;
  tokenCount?: number;
  model?: string;
}

export interface WorkflowTiming {
  executionId: string;
  workflowId: string;
  nodeId: string;
  nodeType: string;
  startTime: number;
  endTime?: number;
  status: "success" | "error" | "timeout";
}

export interface MCPTiming {
  callId: string;
  toolName: string;
  serverName: string;
  startTime: number;
  endTime?: number;
  status: "success" | "error" | "timeout";
  errorMessage?: string;
}

export interface MonitorConfig {
  collectionIntervalMs: number;
  historyRetentionHours: number;
  alertCooldownMs: number;
  enableSystemMetrics: boolean;
  thresholds: MetricThreshold[];
  persistencePath?: string;
}

// ============================================================
// Performance Monitor
// ============================================================

export class PerformanceMonitor extends EventEmitter {
  private config: MonitorConfig;
  private projectRoot: string;
  private isRunning = false;
  private collectionTimer: NodeJS.Timeout | null = null;
  private isDestroyed = false;

  // Timing data
  private sessionTimings: SessionTiming[] = [];
  private workflowTimings: WorkflowTiming[] = [];
  private mcpTimings: MCPTiming[] = [];

  // Historical snapshots
  private snapshots: PerformanceSnapshot[] = [];

  // Alerts
  private alerts: PerformanceAlert[] = [];
  private alertCooldowns: Map<string, number> = new Map();

  // Current tracking
  private activeSessionTimings: Map<string, SessionTiming> = new Map();
  private activeWorkflowTimings: Map<string, WorkflowTiming> = new Map();
  private activeMCPTimings: Map<string, MCPTiming> = new Map();

  // Counters
  private messageCounter = 0;
  private messageCounterWindow: Array<{ time: number; count: number }> = [];
  private mcpCallCounter = 0;
  private mcpCallWindow: Array<{ time: number; count: number }> = [];
  private errorCounter = 0;
  private totalOperations = 0;

  // System metrics
  private lastCpuUsage: NodeJS.CpuUsage | null = null;
  private lastCpuCheck = 0;

  constructor(projectRoot: string, config?: Partial<MonitorConfig>) {
    super();
    this.projectRoot = projectRoot;
    this.config = {
      collectionIntervalMs: 30000,
      historyRetentionHours: 24,
      alertCooldownMs: 300000,
      enableSystemMetrics: true,
      thresholds: this.getDefaultThresholds(),
      ...config,
    };
  }

  // ---- Lifecycle ----

  start(): void {
    if (this.isRunning || this.isDestroyed) return;
    this.isRunning = true;

    this.collectionTimer = setInterval(() => {
      this.collectSnapshot();
    }, this.config.collectionIntervalMs);

    this.emit("started");
  }

  stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }

    this.emit("stopped");
  }

  // ---- Session Tracking ----

  trackSessionStart(sessionId: string, messageId: string, model?: string): void {
    const timing: SessionTiming = {
      sessionId,
      messageId,
      startTime: Date.now(),
      model,
    };
    this.activeSessionTimings.set(messageId, timing);
  }

  trackSessionEnd(messageId: string, tokenCount?: number): void {
    const timing = this.activeSessionTimings.get(messageId);
    if (!timing) return;

    timing.endTime = Date.now();
    timing.tokenCount = tokenCount;
    this.activeSessionTimings.delete(messageId);

    this.sessionTimings.push(timing);
    this.messageCounter++;
    this.totalOperations++;

    this.trimOldTimings(this.sessionTimings, 10000);
    this.emit("session:complete", timing);
  }

  trackSessionError(messageId: string): void {
    const timing = this.activeSessionTimings.get(messageId);
    if (timing) {
      timing.endTime = Date.now();
      this.activeSessionTimings.delete(messageId);
      this.sessionTimings.push(timing);
    }
    this.errorCounter++;
    this.totalOperations++;
  }

  // ---- Workflow Tracking ----

  trackWorkflowNodeStart(executionId: string, workflowId: string, nodeId: string, nodeType: string): void {
    const key = `${executionId}:${nodeId}`;
    const timing: WorkflowTiming = {
      executionId,
      workflowId,
      nodeId,
      nodeType,
      startTime: Date.now(),
      status: "success",
    };
    this.activeWorkflowTimings.set(key, timing);
  }

  trackWorkflowNodeEnd(executionId: string, nodeId: string, status: "success" | "error" | "timeout" = "success"): void {
    const key = `${executionId}:${nodeId}`;
    const timing = this.activeWorkflowTimings.get(key);
    if (!timing) return;

    timing.endTime = Date.now();
    timing.status = status;
    this.activeWorkflowTimings.delete(key);

    this.workflowTimings.push(timing);
    this.totalOperations++;

    if (status !== "success") {
      this.errorCounter++;
    }

    this.trimOldTimings(this.workflowTimings, 10000);
    this.emit("workflow:node-complete", timing);
  }

  // ---- MCP Tracking ----

  trackMCPCallStart(callId: string, toolName: string, serverName: string): void {
    const timing: MCPTiming = {
      callId,
      toolName,
      serverName,
      startTime: Date.now(),
      status: "success",
    };
    this.activeMCPTimings.set(callId, timing);
  }

  trackMCPCallEnd(callId: string, status: "success" | "error" | "timeout" = "success", errorMessage?: string): void {
    const timing = this.activeMCPTimings.get(callId);
    if (!timing) return;

    timing.endTime = Date.now();
    timing.status = status;
    timing.errorMessage = errorMessage;
    this.activeMCPTimings.delete(callId);

    this.mcpTimings.push(timing);
    this.mcpCallCounter++;
    this.totalOperations++;

    if (status !== "success") {
      this.errorCounter++;
    }

    this.trimOldTimings(this.mcpTimings, 10000);
    this.emit("mcp:call-complete", timing);
  }

  // ---- Snapshot Collection ----

  private collectSnapshot(): void {
    const snapshot: PerformanceSnapshot = {
      timestamp: new Date().toISOString(),
      sessionMetrics: this.calculateSessionMetrics(),
      workflowMetrics: this.calculateWorkflowMetrics(),
      mcpMetrics: this.calculateMCPMetrics(),
      systemMetrics: this.calculateSystemMetrics(),
      aggregated: this.calculateAggregatedMetrics(),
    };

    this.snapshots.push(snapshot);
    this.trimSnapshots();
    this.checkThresholds(snapshot);
    this.emit("snapshot", snapshot);
  }

  private calculateSessionMetrics(): SessionPerformanceMetrics {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    this.messageCounterWindow = this.messageCounterWindow.filter((w) => w.time > oneMinuteAgo);
    const messagesPerMinute = this.messageCounterWindow.reduce((sum, w) => sum + w.count, 0) + this.messageCounter;
    this.messageCounter = 0;
    this.messageCounterWindow.push({ time: now, count: messagesPerMinute });

    const completedTimings = this.sessionTimings.filter((t) => t.endTime);
    const responseTimes = completedTimings.map((t) => t.endTime! - t.startTime).sort((a, b) => a - b);

    const avgResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
    const p50 = this.percentile(responseTimes, 0.5);
    const p95 = this.percentile(responseTimes, 0.95);
    const p99 = this.percentile(responseTimes, 0.99);

    const totalSessionOps = this.sessionTimings.length + this.activeSessionTimings.size;
    const sessionErrors = this.sessionTimings.filter((t) => t.endTime && !t.tokenCount).length;
    const errorRate = totalSessionOps > 0 ? sessionErrors / totalSessionOps : 0;

    const totalTokens = completedTimings.reduce((sum, t) => sum + (t.tokenCount || 0), 0);
    const totalDuration = completedTimings.reduce((sum, t) => sum + (t.endTime! - t.startTime), 0);
    const tokenThroughput = totalDuration > 0 ? (totalTokens / totalDuration) * 1000 : 0;

    return {
      activeSessions: this.activeSessionTimings.size,
      totalMessages: this.sessionTimings.length,
      messagesPerMinute,
      averageResponseTimeMs: avgResponseTime,
      p50ResponseTimeMs: p50,
      p95ResponseTimeMs: p95,
      p99ResponseTimeMs: p99,
      errorRate,
      tokenThroughput,
      sessionsByStatus: {
        active: this.activeSessionTimings.size,
        completed: completedTimings.length,
      },
    };
  }

  private calculateWorkflowMetrics(): WorkflowPerformanceMetrics {
    const completedNodes = this.workflowTimings.filter((t) => t.endTime);
    const activeNodes = this.workflowTimings.filter((t) => !t.endTime);

    const executionTimes = completedNodes.map((t) => t.endTime! - t.startTime);
    const avgExecutionTime = executionTimes.length > 0 ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length : 0;

    const nodeTypeStats: Record<string, { total: number; count: number; errors: number }> = {};
    for (const timing of completedNodes) {
      const stats = nodeTypeStats[timing.nodeType] || { total: 0, count: 0, errors: 0 };
      stats.total += timing.endTime! - timing.startTime;
      stats.count++;
      if (timing.status !== "success") stats.errors++;
      nodeTypeStats[timing.nodeType] = stats;
    }

    const slowestNodes = Object.entries(nodeTypeStats)
      .map(([nodeType, stats]) => ({
        nodeId: nodeType,
        nodeType,
        avgTimeMs: stats.count > 0 ? stats.total / stats.count : 0,
      }))
      .sort((a, b) => b.avgTimeMs - a.avgTimeMs)
      .slice(0, 5);

    const bottleneckNodes = slowestNodes.filter((n) => n.avgTimeMs > avgExecutionTime * 2).map((n) => n.nodeType);

    const executionsByStatus: Record<string, number> = { success: 0, error: 0, timeout: 0 };
    for (const timing of completedNodes) {
      executionsByStatus[timing.status] = (executionsByStatus[timing.status] || 0) + 1;
    }

    return {
      activeExecutions: activeNodes.length,
      completedExecutions: completedNodes.length,
      failedExecutions: executionsByStatus.error + executionsByStatus.timeout,
      averageExecutionTimeMs: avgExecutionTime,
      averageNodeExecutionTimeMs: avgExecutionTime,
      slowestNodes,
      bottleneckNodes,
      executionsByStatus,
    };
  }

  private calculateMCPMetrics(): MCPPerformanceMetrics {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    this.mcpCallWindow = this.mcpCallWindow.filter((w) => w.time > oneMinuteAgo);
    const callsPerMinute = this.mcpCallWindow.reduce((sum, w) => sum + w.count, 0) + this.mcpCallCounter;
    this.mcpCallCounter = 0;
    this.mcpCallWindow.push({ time: now, count: callsPerMinute });

    const completedCalls = this.mcpTimings.filter((t) => t.endTime);
    const latencies = completedCalls.map((t) => t.endTime! - t.startTime);
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;

    const errors = completedCalls.filter((t) => t.status !== "success").length;
    const errorRate = completedCalls.length > 0 ? errors / completedCalls.length : 0;

    const callsByTool: Record<string, number> = {};
    const latencyByTool: Record<string, number[]> = {};
    const errorsByTool: Record<string, number> = {};

    for (const call of completedCalls) {
      callsByTool[call.toolName] = (callsByTool[call.toolName] || 0) + 1;
      if (!latencyByTool[call.toolName]) latencyByTool[call.toolName] = [];
      latencyByTool[call.toolName].push(call.endTime! - call.startTime);
      if (call.status !== "success") {
        errorsByTool[call.toolName] = (errorsByTool[call.toolName] || 0) + 1;
      }
    }

    const avgLatencyByTool: Record<string, number> = {};
    for (const [tool, lats] of Object.entries(latencyByTool)) {
      avgLatencyByTool[tool] = lats.reduce((a, b) => a + b, 0) / lats.length;
    }

    const topTools = Object.entries(callsByTool)
      .map(([name, count]) => ({
        name,
        count,
        avgLatencyMs: avgLatencyByTool[name] || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalCalls: completedCalls.length,
      callsPerMinute,
      averageLatencyMs: avgLatency,
      errorRate,
      callsByTool,
      latencyByTool: avgLatencyByTool,
      errorsByTool,
      topTools,
    };
  }

  private calculateSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    let cpuUsage = 0;
    const now = Date.now();
    if (this.lastCpuUsage && now - this.lastCpuCheck > 0) {
      const userDiff = process.cpuUsage(this.lastCpuUsage).user;
      const timeDiff = (now - this.lastCpuCheck) * 1000;
      cpuUsage = timeDiff > 0 ? (userDiff / timeDiff) * 100 : 0;
    }
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuCheck = now;

    return {
      memoryUsageMB: Math.round(memUsage.heapUsed / 1024 / 1024),
      memoryUsagePercent: Math.round((memUsage.heapUsed / totalMem) * 100),
      cpuUsagePercent: Math.round(cpuUsage),
      eventLoopLagMs: 0,
      uptimeSeconds: process.uptime(),
      freeMemoryMB: Math.round(freeMem / 1024 / 1024),
      totalMemoryMB: Math.round(totalMem / 1024 / 1024),
      loadAverage: os.loadavg(),
    };
  }

  private calculateAggregatedMetrics(): AggregatedMetrics {
    const sessionMetrics = this.calculateSessionMetrics();
    const workflowMetrics = this.calculateWorkflowMetrics();
    const mcpMetrics = this.calculateMCPMetrics();

    const totalOperations = this.totalOperations;
    const totalErrors = this.errorCounter;
    const overallErrorRate = totalOperations > 0 ? totalErrors / totalOperations : 0;

    const latencies = [
      sessionMetrics.averageResponseTimeMs,
      workflowMetrics.averageExecutionTimeMs,
      mcpMetrics.averageLatencyMs,
    ].filter((l) => l > 0);
    const averageLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;

    const throughput = sessionMetrics.messagesPerMinute + mcpMetrics.callsPerMinute;

    let healthScore = 100;
    if (overallErrorRate > 0.1) healthScore -= 30;
    else if (overallErrorRate > 0.05) healthScore -= 15;
    if (sessionMetrics.p95ResponseTimeMs > 10000) healthScore -= 20;
    if (mcpMetrics.errorRate > 0.1) healthScore -= 20;
    if (sessionMetrics.messagesPerMinute < 1 && this.activeSessionTimings.size > 0) healthScore -= 10;
    healthScore = Math.max(0, Math.min(100, healthScore));

    const recentAlerts = this.alerts.filter((a) => !a.acknowledged).slice(-5);

    return {
      totalOperations,
      totalErrors,
      overallErrorRate,
      averageLatencyMs: averageLatency,
      throughput,
      healthScore,
      alerts: recentAlerts,
    };
  }

  // ---- Thresholds & Alerts ----

  private getDefaultThresholds(): MetricThreshold[] {
    return [
      { metric: "session.errorRate", warning: 0.05, critical: 0.1, comparator: "gt" },
      { metric: "session.p95ResponseTimeMs", warning: 5000, critical: 10000, comparator: "gt" },
      { metric: "workflow.failedExecutions", warning: 5, critical: 10, comparator: "gt" },
      { metric: "mcp.errorRate", warning: 0.05, critical: 0.1, comparator: "gt" },
      { metric: "system.memoryUsagePercent", warning: 80, critical: 95, comparator: "gt" },
      { metric: "aggregated.healthScore", warning: 60, critical: 40, comparator: "lt" },
    ];
  }

  private checkThresholds(snapshot: PerformanceSnapshot): void {
    const metrics = this.flattenMetrics(snapshot);

    for (const threshold of this.config.thresholds) {
      const value = metrics[threshold.metric];
      if (value === undefined) continue;

      let triggered = false;
      let severity: "warning" | "critical" = "warning";

      if (threshold.comparator === "gt" && value > threshold.warning) {
        triggered = true;
        if (value > threshold.critical) severity = "critical";
      } else if (threshold.comparator === "lt" && value < threshold.warning) {
        triggered = true;
        if (value < threshold.critical) severity = "critical";
      }

      if (triggered) {
        this.emitAlert(threshold.metric, severity, threshold, value, snapshot);
      }
    }
  }

  private flattenMetrics(snapshot: PerformanceSnapshot): Record<string, number> {
    return {
      "session.activeSessions": snapshot.sessionMetrics.activeSessions,
      "session.messagesPerMinute": snapshot.sessionMetrics.messagesPerMinute,
      "session.averageResponseTimeMs": snapshot.sessionMetrics.averageResponseTimeMs,
      "session.p95ResponseTimeMs": snapshot.sessionMetrics.p95ResponseTimeMs,
      "session.errorRate": snapshot.sessionMetrics.errorRate,
      "workflow.activeExecutions": snapshot.workflowMetrics.activeExecutions,
      "workflow.failedExecutions": snapshot.workflowMetrics.failedExecutions,
      "workflow.averageExecutionTimeMs": snapshot.workflowMetrics.averageExecutionTimeMs,
      "mcp.totalCalls": snapshot.mcpMetrics.totalCalls,
      "mcp.callsPerMinute": snapshot.mcpMetrics.callsPerMinute,
      "mcp.averageLatencyMs": snapshot.mcpMetrics.averageLatencyMs,
      "mcp.errorRate": snapshot.mcpMetrics.errorRate,
      "system.memoryUsageMB": snapshot.systemMetrics.memoryUsageMB,
      "system.memoryUsagePercent": snapshot.systemMetrics.memoryUsagePercent,
      "system.cpuUsagePercent": snapshot.systemMetrics.cpuUsagePercent,
      "aggregated.healthScore": snapshot.aggregated.healthScore,
      "aggregated.overallErrorRate": snapshot.aggregated.overallErrorRate,
    };
  }

  private emitAlert(
    metric: string,
    severity: "warning" | "critical",
    threshold: MetricThreshold,
    actualValue: number,
    snapshot: PerformanceSnapshot
  ): void {
    const cooldownKey = `${metric}:${severity}`;
    const lastAlert = this.alertCooldowns.get(cooldownKey);
    const now = Date.now();

    if (lastAlert && now - lastAlert < this.config.alertCooldownMs) {
      return;
    }

    this.alertCooldowns.set(cooldownKey, now);

    const category = metric.split(".")[0] as PerformanceAlert["category"];
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      severity,
      category,
      message: `${metric} is ${severity}: ${actualValue.toFixed(2)} (threshold: ${threshold.critical})`,
      metric,
      threshold: threshold.critical,
      actualValue,
      timestamp: snapshot.timestamp,
      acknowledged: false,
    };

    this.alerts.push(alert);
    this.emit("alert", alert);
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;
    alert.acknowledged = true;
    return true;
  }

  getAlerts(options?: { severity?: PerformanceAlert["severity"]; acknowledged?: boolean; limit?: number }): PerformanceAlert[] {
    let result = this.alerts;

    if (options?.severity) {
      result = result.filter((a) => a.severity === options.severity);
    }
    if (options?.acknowledged !== undefined) {
      result = result.filter((a) => a.acknowledged === options.acknowledged);
    }
    if (options?.limit) {
      result = result.slice(-options.limit);
    }

    return result;
  }

  // ---- Reports ----

  generateReport(periodHours = 1): PerformanceReport {
    const now = new Date();
    const from = new Date(now.getTime() - periodHours * 60 * 60 * 1000);

    const periodSnapshots = this.snapshots.filter(
      (s) => new Date(s.timestamp).getTime() >= from.getTime()
    );

    const trends = this.calculateTrends(periodSnapshots);
    const recommendations = this.generateRecommendations(periodSnapshots);

    return {
      generatedAt: now.toISOString(),
      period: { from: from.toISOString(), to: now.toISOString() },
      snapshot: periodSnapshots.length > 0 ? periodSnapshots[periodSnapshots.length - 1] : this.getCurrentSnapshot(),
      trends,
      recommendations,
    };
  }

  getLatestReport(): { metrics?: any; snapshot?: PerformanceSnapshot } | null {
    if (this.snapshots.length === 0) {
      return { snapshot: this.getCurrentSnapshot(), metrics: { session: {}, workflow: {}, mcp: {}, system: {} } };
    }
    const latest = this.snapshots[this.snapshots.length - 1];
    return {
      snapshot: latest,
      metrics: {
        session: {
          p50: latest.sessionMetrics.p50ResponseTimeMs,
          p95: latest.sessionMetrics.p95ResponseTimeMs,
          p99: latest.sessionMetrics.p99ResponseTimeMs,
        },
        workflow: {
          p50: latest.workflowMetrics.averageNodeExecutionTimeMs,
          p95: latest.workflowMetrics.averageExecutionTimeMs,
        },
        mcp: latest.mcpMetrics,
        system: latest.systemMetrics,
      },
    };
  }

  private calculateTrends(snapshots: PerformanceSnapshot[]): MetricTrend[] {
    if (snapshots.length < 2) return [];

    const metrics = [
      "session.averageResponseTimeMs",
      "session.errorRate",
      "mcp.averageLatencyMs",
      "mcp.errorRate",
      "aggregated.healthScore",
    ];

    return metrics.map((metric) => {
      const values = snapshots.map((s) => ({
        timestamp: s.timestamp,
        value: this.flattenMetrics(s)[metric] || 0,
      }));

      const first = values[0].value;
      const last = values[values.length - 1].value;
      const changePercent = first !== 0 ? ((last - first) / first) * 100 : 0;

      let direction: "improving" | "degrading" | "stable" = "stable";
      if (Math.abs(changePercent) < 5) {
        direction = "stable";
      } else if (
        (metric.includes("errorRate") || metric.includes("latency") || metric.includes("responseTime")) &&
        changePercent < 0
      ) {
        direction = "improving";
      } else if (metric.includes("healthScore") && changePercent > 0) {
        direction = "improving";
      } else {
        direction = "degrading";
      }

      return { metric, values, direction, changePercent };
    });
  }

  private generateRecommendations(snapshots: PerformanceSnapshot[]): string[] {
    const recommendations: string[] = [];
    if (snapshots.length === 0) return recommendations;

    const latest = snapshots[snapshots.length - 1];

    if (latest.sessionMetrics.errorRate > 0.05) {
      recommendations.push("High session error rate detected. Review error logs and model configurations.");
    }
    if (latest.sessionMetrics.p95ResponseTimeMs > 5000) {
      recommendations.push("Response times are elevated. Consider enabling context compression or upgrading model tier.");
    }
    if (latest.mcpMetrics.errorRate > 0.05) {
      recommendations.push("MCP tool errors are frequent. Check tool configurations and server health.");
    }
    if (latest.workflowMetrics.bottleneckNodes.length > 0) {
      recommendations.push(`Workflow bottlenecks detected in: ${latest.workflowMetrics.bottleneckNodes.join(", ")}. Consider optimizing these nodes.`);
    }
    if (latest.systemMetrics.memoryUsagePercent > 80) {
      recommendations.push("Memory usage is high. Consider restarting services or increasing available memory.");
    }
    if (latest.aggregated.healthScore < 60) {
      recommendations.push("Overall system health is degraded. Review all metrics and take corrective action.");
    }

    return recommendations;
  }

  getCurrentSnapshot(): PerformanceSnapshot {
    return {
      timestamp: new Date().toISOString(),
      sessionMetrics: this.calculateSessionMetrics(),
      workflowMetrics: this.calculateWorkflowMetrics(),
      mcpMetrics: this.calculateMCPMetrics(),
      systemMetrics: this.calculateSystemMetrics(),
      aggregated: this.calculateAggregatedMetrics(),
    };
  }

  // ---- Persistence ----

  saveMetrics(): { success: boolean; error?: string } {
    try {
      const data = {
        snapshots: this.snapshots.slice(-288),
        alerts: this.alerts,
        savedAt: new Date().toISOString(),
      };

      const metricsPath = path.join(this.projectRoot, ".deerflow", "performance-metrics.json");
      fs.writeFileSync(metricsPath, JSON.stringify(data, null, 2), "utf-8");
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  loadMetrics(): { success: boolean; error?: string } {
    try {
      const metricsPath = path.join(this.projectRoot, ".deerflow", "performance-metrics.json");
      if (!fs.existsSync(metricsPath)) return { success: true };

      const data = JSON.parse(fs.readFileSync(metricsPath, "utf-8"));
      this.snapshots = data.snapshots || [];
      this.alerts = data.alerts || [];
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ---- Utility ----

  private percentile(sortedArray: number[], p: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil(sortedArray.length * p) - 1;
    return sortedArray[Math.max(0, index)];
  }

  private trimOldTimings<T extends { startTime: number }>(timings: T[], maxSize: number): void {
    if (timings.length > maxSize) {
      timings.splice(0, timings.length - maxSize);
    }
  }

  private trimSnapshots(): void {
    const retentionMs = this.config.historyRetentionHours * 60 * 60 * 1000;
    const cutoff = Date.now() - retentionMs;
    this.snapshots = this.snapshots.filter((s) => new Date(s.timestamp).getTime() > cutoff);
  }

  // ---- Cleanup ----

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.stop();
    this.saveMetrics();

    this.sessionTimings = [];
    this.workflowTimings = [];
    this.mcpTimings = [];
    this.snapshots = [];
    this.alerts = [];
    this.activeSessionTimings.clear();
    this.activeWorkflowTimings.clear();
    this.activeMCPTimings.clear();

    this.removeAllListeners();
  }
}
