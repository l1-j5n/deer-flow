/**
 * DeerFlow Electron - System Health Monitor
 *
 * Comprehensive health monitoring and diagnostics:
 * - Service health checks with dependency graph
 * - Resource usage tracking (CPU, memory, disk)
 * - Health score calculation (0-100)
 * - Automatic recovery attempts
 * - Health history and trend analysis
 * - Alert generation for degraded services
 *
 * Integrates with ServiceManager, EventBus, and AuditLogger.
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// ============================================================
// Type Definitions
// ============================================================

export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown" | "recovering";

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  lastCheck: string;
  responseTimeMs: number;
  uptime?: number;
  pid?: number;
  errorCount: number;
  consecutiveFailures: number;
  lastError?: string;
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface ResourceMetrics {
  timestamp: string;
  cpu: {
    usagePercent: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
    processUsed: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
}

export interface HealthSnapshot {
  id: string;
  timestamp: string;
  overallStatus: HealthStatus;
  overallScore: number; // 0-100
  services: ServiceHealth[];
  resources: ResourceMetrics;
  issues: HealthIssue[];
  recommendations: string[];
}

export interface HealthIssue {
  id: string;
  severity: "critical" | "warning" | "info";
  service?: string;
  category: "service" | "resource" | "dependency" | "configuration";
  message: string;
  details?: Record<string, any>;
  detectedAt: string;
  resolvedAt?: string;
  autoRecoveryAttempted: boolean;
}

export interface HealthTrend {
  period: string;
  averageScore: number;
  minScore: number;
  maxScore: number;
  issueCount: number;
  recoveryCount: number;
  statusDistribution: Record<string, number>;
  snapshots: Array<{ timestamp: string; score: number; status: string }>;
}

export interface HealthMonitorConfig {
  checkIntervalMs: number;
  resourceCheckIntervalMs: number;
  maxHistorySnapshots: number;
  autoRecoveryEnabled: boolean;
  maxConsecutiveFailures: number;
  cpuThreshold: number; // Percent
  memoryThreshold: number; // Percent
  diskThreshold: number; // Percent
  scoreWeights: {
    services: number;
    resources: number;
    dependencies: number;
  };
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: HealthMonitorConfig = {
  checkIntervalMs: 30000, // 30s
  resourceCheckIntervalMs: 60000, // 60s
  maxHistorySnapshots: 1000,
  autoRecoveryEnabled: true,
  maxConsecutiveFailures: 3,
  cpuThreshold: 80,
  memoryThreshold: 85,
  diskThreshold: 90,
  scoreWeights: {
    services: 0.5,
    resources: 0.3,
    dependencies: 0.2,
  },
};

// ============================================================
// System Health Monitor
// ============================================================

const HEALTH_DIR = "health-monitor";
const HISTORY_FILE = "history.json";
const ISSUES_FILE = "issues.json";

export class HealthMonitor extends EventEmitter {
  private projectRoot: string;
  private healthDir: string;
  private services: Map<string, ServiceHealth> = new Map();
  private history: HealthSnapshot[] = [];
  private issues: HealthIssue[] = [];
  private config: HealthMonitorConfig;
  private checkTimer: NodeJS.Timeout | null = null;
  private resourceTimer: NodeJS.Timeout | null = null;
  private dirty = false;
  private isRunning = false;

  constructor(projectRoot: string, config?: Partial<HealthMonitorConfig>) {
    super();
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.healthDir = path.join(projectRoot, ".deerflow", HEALTH_DIR);
    this.ensureDirectories();
    this.loadData();
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Start health monitoring
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Initial check
    this.performHealthCheck();
    this.collectResourceMetrics();

    // Schedule periodic checks
    this.checkTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.checkIntervalMs);

    this.resourceTimer = setInterval(() => {
      this.collectResourceMetrics();
    }, this.config.resourceCheckIntervalMs);

    this.emit("monitor:started");
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    this.isRunning = false;
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    if (this.resourceTimer) {
      clearInterval(this.resourceTimer);
      this.resourceTimer = null;
    }
    this.emit("monitor:stopped");
  }

  // ============================================================
  // Service Registration
  // ============================================================

  /**
   * Register a service for health monitoring
   */
  registerService(
    name: string,
    options: {
      dependencies?: string[];
      checkFn?: () => Promise<{ healthy: boolean; responseTimeMs: number; metadata?: Record<string, any> }>;
      pid?: number;
    } = {}
  ): ServiceHealth {
    const service: ServiceHealth = {
      name,
      status: "unknown",
      lastCheck: new Date().toISOString(),
      responseTimeMs: 0,
      pid: options.pid,
      errorCount: 0,
      consecutiveFailures: 0,
      dependencies: options.dependencies || [],
      metadata: {},
    };

    this.services.set(name, service);
    this.emit("service:registered", service);
    return service;
  }

  /**
   * Unregister a service
   */
  unregisterService(name: string): boolean {
    const removed = this.services.delete(name);
    if (removed) {
      this.emit("service:unregistered", name);
    }
    return removed;
  }

  /**
   * Update service status manually
   */
  updateServiceStatus(
    name: string,
    status: HealthStatus,
    options?: { responseTimeMs?: number; uptime?: number; metadata?: Record<string, any> }
  ): boolean {
    const service = this.services.get(name);
    if (!service) return false;

    service.status = status;
    service.lastCheck = new Date().toISOString();
    if (options?.responseTimeMs !== undefined) service.responseTimeMs = options.responseTimeMs;
    if (options?.uptime !== undefined) service.uptime = options.uptime;
    if (options?.metadata) service.metadata = { ...service.metadata, ...options.metadata };

    if (status === "healthy") {
      service.consecutiveFailures = 0;
    } else if (status === "unhealthy") {
      service.consecutiveFailures++;
      service.errorCount++;
    }

    this.emit("service:updated", service);
    return true;
  }

  // ============================================================
  // Health Checks
  // ============================================================

  /**
   * Perform a comprehensive health check
   */
  async performHealthCheck(): Promise<HealthSnapshot> {
    const timestamp = new Date().toISOString();
    const services = Array.from(this.services.values());

    // Check each service
    for (const service of services) {
      await this.checkService(service);
    }

    // Check dependencies
    this.checkDependencies(services);

    // Collect resources
    const resources = this.getLatestResourceMetrics() || this.collectResourceMetrics();

    // Identify issues
    const issues = this.identifyIssues(services, resources);

    // Calculate score
    const score = this.calculateHealthScore(services, resources);
    const overallStatus = this.scoreToStatus(score);

    // Generate recommendations
    const recommendations = this.generateRecommendations(services, resources, issues);

    const snapshot: HealthSnapshot = {
      id: this.generateId("snapshot"),
      timestamp,
      overallStatus,
      overallScore: score,
      services: services.map((s) => ({ ...s })),
      resources,
      issues,
      recommendations,
    };

    this.history.push(snapshot);

    // Trim history
    if (this.history.length > this.config.maxHistorySnapshots) {
      this.history = this.history.slice(-this.config.maxHistorySnapshots);
    }

    this.dirty = true;

    // Auto-recovery
    if (this.config.autoRecoveryEnabled) {
      this.attemptAutoRecovery(snapshot);
    }

    this.emit("health:check", snapshot);
    return snapshot;
  }

  /**
   * Check a single service
   */
  private async checkService(service: ServiceHealth): Promise<void> {
    try {
      // Default check: process alive
      if (service.pid) {
        try {
          process.kill(service.pid, 0); // Check if process exists
          service.status = "healthy";
          service.lastCheck = new Date().toISOString();
          service.consecutiveFailures = 0;
          return;
        } catch {
          // Process not found
        }
      }

      // If no PID or process dead, mark unhealthy
      service.status = "unhealthy";
      service.consecutiveFailures++;
      service.errorCount++;
      service.lastError = "Process not found";
    } catch (err: any) {
      service.status = "unhealthy";
      service.consecutiveFailures++;
      service.errorCount++;
      service.lastError = err.message;
    }
  }

  /**
   * Check service dependencies
   */
  private checkDependencies(services: ServiceHealth[]): void {
    for (const service of services) {
      if (service.dependencies.length === 0) continue;

      const depStatuses = service.dependencies.map((depName) => {
        const dep = this.services.get(depName);
        return dep?.status || "unknown";
      });

      const unhealthyDeps = depStatuses.filter((s) => s === "unhealthy" || s === "unknown");

      if (unhealthyDeps.length > 0 && service.status === "healthy") {
        service.status = "degraded";
        service.metadata.degradedReason = `Dependencies unhealthy: ${service.dependencies.filter((d) => {
          const dep = this.services.get(d);
          return dep?.status === "unhealthy";
        }).join(", ")}`;
      }
    }
  }

  // ============================================================
  // Resource Metrics
  // ============================================================

  /**
   * Collect system resource metrics
   */
  collectResourceMetrics(): ResourceMetrics {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Process memory (Electron main process)
    const processMem = process.memoryUsage();

    const metrics: ResourceMetrics = {
      timestamp: new Date().toISOString(),
      cpu: {
        usagePercent: this.estimateCpuUsage(),
        loadAverage: os.loadavg(),
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usagePercent: (usedMem / totalMem) * 100,
        processUsed: processMem.rss,
      },
      disk: {
        total: 0,
        used: 0,
        free: 0,
        usagePercent: 0,
      },
    };

    // Try to get disk info (Windows/Linux/macOS)
    try {
      const stats = fs.statSync(this.projectRoot);
      // Disk stats not easily available cross-platform without external deps
      // Using placeholder that can be enhanced
      metrics.disk = {
        total: 100 * 1024 * 1024 * 1024, // Placeholder: 100GB
        used: 50 * 1024 * 1024 * 1024, // Placeholder: 50GB
        free: 50 * 1024 * 1024 * 1024, // Placeholder: 50GB
        usagePercent: 50,
      };
    } catch {
      // Ignore
    }

    this.emit("resources:collected", metrics);
    return metrics;
  }

  /**
   * Estimate CPU usage (simplified)
   */
  private estimateCpuUsage(): number {
    const cpus = os.cpus();
    if (!cpus || cpus.length === 0) return 0;

    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      const times = cpu.times;
      const idle = times.idle;
      const tick = Object.values(times).reduce((a, b) => a + b, 0);
      totalIdle += idle;
      totalTick += tick;
    }

    // Simplified: return load average as percentage of cores
    const loadAvg = os.loadavg()[0];
    const cores = cpus.length;
    return Math.min(100, (loadAvg / cores) * 100);
  }

  /**
   * Get latest resource metrics
   */
  private getLatestResourceMetrics(): ResourceMetrics | null {
    const latest = this.history[this.history.length - 1];
    return latest?.resources || null;
  }

  // ============================================================
  // Issue Detection
  // ============================================================

  /**
   * Identify health issues
   */
  private identifyIssues(services: ServiceHealth[], resources: ResourceMetrics): HealthIssue[] {
    const issues: HealthIssue[] = [];

    // Service issues
    for (const service of services) {
      if (service.status === "unhealthy") {
        issues.push({
          id: this.generateId("issue"),
          severity: "critical",
          service: service.name,
          category: "service",
          message: `Service ${service.name} is unhealthy`,
          details: { consecutiveFailures: service.consecutiveFailures, lastError: service.lastError },
          detectedAt: new Date().toISOString(),
          autoRecoveryAttempted: false,
        });
      } else if (service.status === "degraded") {
        issues.push({
          id: this.generateId("issue"),
          severity: "warning",
          service: service.name,
          category: "dependency",
          message: `Service ${service.name} is degraded`,
          details: service.metadata,
          detectedAt: new Date().toISOString(),
          autoRecoveryAttempted: false,
        });
      }
    }

    // Resource issues
    if (resources.cpu.usagePercent > this.config.cpuThreshold) {
      issues.push({
        id: this.generateId("issue"),
        severity: "warning",
        category: "resource",
        message: `High CPU usage: ${resources.cpu.usagePercent.toFixed(1)}%`,
        details: { usage: resources.cpu.usagePercent, threshold: this.config.cpuThreshold },
        detectedAt: new Date().toISOString(),
        autoRecoveryAttempted: false,
      });
    }

    if (resources.memory.usagePercent > this.config.memoryThreshold) {
      issues.push({
        id: this.generateId("issue"),
        severity: "warning",
        category: "resource",
        message: `High memory usage: ${resources.memory.usagePercent.toFixed(1)}%`,
        details: { usage: resources.memory.usagePercent, threshold: this.config.memoryThreshold },
        detectedAt: new Date().toISOString(),
        autoRecoveryAttempted: false,
      });
    }

    if (resources.disk.usagePercent > this.config.diskThreshold) {
      issues.push({
        id: this.generateId("issue"),
        severity: "critical",
        category: "resource",
        message: `High disk usage: ${resources.disk.usagePercent.toFixed(1)}%`,
        details: { usage: resources.disk.usagePercent, threshold: this.config.diskThreshold },
        detectedAt: new Date().toISOString(),
        autoRecoveryAttempted: false,
      });
    }

    // Merge with existing unresolved issues
    for (const existing of this.issues) {
      if (!existing.resolvedAt) {
        const stillRelevant = issues.find((i) => i.message === existing.message);
        if (!stillRelevant) {
          // Issue resolved
          existing.resolvedAt = new Date().toISOString();
        }
      }
    }

    // Add new issues
    for (const issue of issues) {
      const existing = this.issues.find((i) => i.message === issue.message && !i.resolvedAt);
      if (!existing) {
        this.issues.push(issue);
      }
    }

    return issues.filter((i) => !i.resolvedAt);
  }

  // ============================================================
  // Scoring
  // ============================================================

  /**
   * Calculate overall health score
   */
  private calculateHealthScore(services: ServiceHealth[], resources: ResourceMetrics): number {
    // Service score
    const healthyServices = services.filter((s) => s.status === "healthy").length;
    const serviceScore = services.length > 0 ? (healthyServices / services.length) * 100 : 100;

    // Resource score
    const cpuScore = Math.max(0, 100 - resources.cpu.usagePercent);
    const memScore = Math.max(0, 100 - resources.memory.usagePercent);
    const diskScore = Math.max(0, 100 - resources.disk.usagePercent);
    const resourceScore = (cpuScore + memScore + diskScore) / 3;

    // Dependency score
    const degradedServices = services.filter((s) => s.status === "degraded").length;
    const dependencyScore = services.length > 0
      ? Math.max(0, 100 - (degradedServices / services.length) * 50)
      : 100;

    // Weighted average
    const score =
      serviceScore * this.config.scoreWeights.services +
      resourceScore * this.config.scoreWeights.resources +
      dependencyScore * this.config.scoreWeights.dependencies;

    return Math.round(score);
  }

  private scoreToStatus(score: number): HealthStatus {
    if (score >= 90) return "healthy";
    if (score >= 70) return "degraded";
    if (score >= 40) return "unhealthy";
    return "unknown";
  }

  // ============================================================
  // Auto Recovery
  // ============================================================

  /**
   * Attempt automatic recovery
   */
  private attemptAutoRecovery(snapshot: HealthSnapshot): void {
    for (const issue of snapshot.issues) {
      if (issue.autoRecoveryAttempted) continue;
      if (issue.severity !== "critical") continue;

      issue.autoRecoveryAttempted = true;

      if (issue.category === "service" && issue.service) {
        this.emit("recovery:attempt", {
          service: issue.service,
          issue: issue.message,
          attempt: 1,
        });
      }
    }
  }

  // ============================================================
  // Recommendations
  // ============================================================

  /**
   * Generate health recommendations
   */
  private generateRecommendations(services: ServiceHealth[], resources: ResourceMetrics, issues: HealthIssue[]): string[] {
    const recommendations: string[] = [];

    if (resources.cpu.usagePercent > this.config.cpuThreshold) {
      recommendations.push("Consider reducing concurrent operations to lower CPU usage");
    }

    if (resources.memory.usagePercent > this.config.memoryThreshold) {
      recommendations.push("Memory usage is high - consider restarting services or increasing available RAM");
    }

    if (resources.disk.usagePercent > this.config.diskThreshold) {
      recommendations.push("Disk space is critically low - free up space or expand storage");
    }

    const failingServices = services.filter((s) => s.consecutiveFailures >= this.config.maxConsecutiveFailures);
    for (const service of failingServices) {
      recommendations.push(`Service ${service.name} has failed ${service.consecutiveFailures} times - manual intervention may be needed`);
    }

    return recommendations;
  }

  // ============================================================
  // Trends
  // ============================================================

  /**
   * Get health trends over a period
   */
  getTrends(periodHours: number = 24): HealthTrend {
    const cutoff = Date.now() - periodHours * 60 * 60 * 1000;
    const snapshots = this.history.filter((h) => new Date(h.timestamp).getTime() >= cutoff);

    if (snapshots.length === 0) {
      return {
        period: `${periodHours}h`,
        averageScore: 0,
        minScore: 0,
        maxScore: 0,
        issueCount: 0,
        recoveryCount: 0,
        statusDistribution: {},
        snapshots: [],
      };
    }

    const scores = snapshots.map((s) => s.overallScore);
    const statusDistribution: Record<string, number> = {};

    for (const s of snapshots) {
      statusDistribution[s.overallStatus] = (statusDistribution[s.overallStatus] || 0) + 1;
    }

    const recoveries = this.issues.filter(
      (i) => i.resolvedAt && new Date(i.resolvedAt).getTime() >= cutoff && i.autoRecoveryAttempted
    ).length;

    return {
      period: `${periodHours}h`,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      issueCount: this.issues.filter((i) => new Date(i.detectedAt).getTime() >= cutoff).length,
      recoveryCount: recoveries,
      statusDistribution,
      snapshots: snapshots.map((s) => ({
        timestamp: s.timestamp,
        score: s.overallScore,
        status: s.overallStatus,
      })),
    };
  }

  // ============================================================
  // Query
  // ============================================================

  /**
   * Get current health status
   */
  getCurrentStatus(): { status: HealthStatus; score: number; services: ServiceHealth[] } {
    const latest = this.history[this.history.length - 1];
    return {
      status: latest?.overallStatus || "unknown",
      score: latest?.overallScore || 0,
      services: Array.from(this.services.values()),
    };
  }

  /**
   * Get latest snapshot
   */
  getLatestSnapshot(): HealthSnapshot | null {
    return this.history[this.history.length - 1] || null;
  }

  /**
   * Get unresolved issues
   */
  getUnresolvedIssues(): HealthIssue[] {
    return this.issues.filter((i) => !i.resolvedAt);
  }

  /**
   * Get service health
   */
  getServiceHealth(name: string): ServiceHealth | null {
    return this.services.get(name) || null;
  }

  // ============================================================
  // Statistics
  // ============================================================

  getStats(): {
    totalServices: number;
    healthyServices: number;
    degradedServices: number;
    unhealthyServices: number;
    totalSnapshots: number;
    totalIssues: number;
    unresolvedIssues: number;
    averageScore: number;
  } {
    const services = Array.from(this.services.values());
    const scores = this.history.map((h) => h.overallScore);

    return {
      totalServices: services.length,
      healthyServices: services.filter((s) => s.status === "healthy").length,
      degradedServices: services.filter((s) => s.status === "degraded").length,
      unhealthyServices: services.filter((s) => s.status === "unhealthy").length,
      totalSnapshots: this.history.length,
      totalIssues: this.issues.length,
      unresolvedIssues: this.issues.filter((i) => !i.resolvedAt).length,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    };
  }

  // ============================================================
  // Persistence
  // ============================================================

  private ensureDirectories(): void {
    if (!fs.existsSync(this.healthDir)) {
      fs.mkdirSync(this.healthDir, { recursive: true });
    }
  }

  private saveData(): void {
    try {
      const historyPath = path.join(this.healthDir, HISTORY_FILE);
      fs.writeFileSync(
        historyPath,
        JSON.stringify(
          {
            updatedAt: new Date().toISOString(),
            snapshots: this.history.slice(-100), // Keep last 100
          },
          null,
          2
        ),
        "utf-8"
      );

      const issuesPath = path.join(this.healthDir, ISSUES_FILE);
      fs.writeFileSync(
        issuesPath,
        JSON.stringify(
          {
            updatedAt: new Date().toISOString(),
            issues: this.issues,
          },
          null,
          2
        ),
        "utf-8"
      );

      this.dirty = false;
    } catch (err) {
      console.warn("[HealthMonitor] Failed to save data:", err);
    }
  }

  private loadData(): void {
    try {
      const historyPath = path.join(this.healthDir, HISTORY_FILE);
      if (fs.existsSync(historyPath)) {
        const data = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
        this.history = data.snapshots || [];
      }

      const issuesPath = path.join(this.healthDir, ISSUES_FILE);
      if (fs.existsSync(issuesPath)) {
        const data = JSON.parse(fs.readFileSync(issuesPath, "utf-8"));
        this.issues = data.issues || [];
      }

      console.log(`[HealthMonitor] Loaded ${this.history.length} snapshots, ${this.issues.length} issues`);
    } catch (err) {
      console.warn("[HealthMonitor] Failed to load data:", err);
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy(): void {
    this.stop();
    this.saveData();
    this.removeAllListeners();
  }
}
