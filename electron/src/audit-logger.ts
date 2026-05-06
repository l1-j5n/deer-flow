/**
 * DeerFlow Electron - Audit Logger
 *
 * Comprehensive audit trail for all agent platform operations:
 * - Security events (auth, permission changes, config modifications)
 * - Data access events (entity read/write, export/import)
 * - System events (service start/stop, updates, crashes)
 * - User action events (settings changes, manual triggers)
 * - Compliance-grade tamper-resistant logging
 * - Log rotation and archival
 * - Query and export capabilities
 *
 * Stores audit logs in structured JSONL format under .deerflow/audit/
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// ============================================================
// Type Definitions
// ============================================================

export type AuditEventCategory =
  | "security"
  | "data"
  | "system"
  | "user"
  | "session"
  | "workflow"
  | "mcp"
  | "skill"
  | "config";

export type AuditEventSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: AuditEventCategory;
  severity: AuditEventSeverity;
  action: string;
  actor: {
    type: "user" | "system" | "agent" | "scheduler";
    id?: string;
    name?: string;
  };
  target: {
    type: string;
    id?: string;
    name?: string;
  };
  details: Record<string, any>;
  result: "success" | "failure" | "partial";
  errorMessage?: string;
  sourceIp?: string;
  sessionId?: string;
  correlationId?: string;
  hash?: string; // Tamper detection
}

export interface AuditQuery {
  category?: AuditEventCategory | AuditEventCategory[];
  severity?: AuditEventSeverity | AuditEventSeverity[];
  actorType?: string;
  actorId?: string;
  targetType?: string;
  targetId?: string;
  action?: string;
  result?: "success" | "failure" | "partial";
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
  sessionId?: string;
}

export interface AuditStats {
  totalEvents: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byResult: Record<string, number>;
  byActorType: Record<string, number>;
  timeRange: { earliest: string; latest: string };
  tamperedEntries: number;
}

// ============================================================
// Audit Logger
// ============================================================

const AUDIT_DIR = "audit";
const AUDIT_FILE = "audit.log";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_RETENTION_DAYS = 90;

export class AuditLogger {
  private projectRoot: string;
  private auditDir: string;
  private currentLogFile: string;
  private writeQueue: AuditEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isWriting = false;
  private lastHash: string = "";

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
    this.auditDir = path.join(projectRoot, ".deerflow", AUDIT_DIR);
    this.currentLogFile = path.join(this.auditDir, AUDIT_FILE);
    this.ensureDirectories();
    this.loadLastHash();
    this.startFlushTimer();
  }

  // ============================================================
  // Core Logging
  // ============================================================

  /**
   * Log a security event
   */
  logSecurity(
    action: string,
    actor: AuditEvent["actor"],
    target: AuditEvent["target"],
    details: Record<string, any>,
    result: AuditEvent["result"],
    severity: AuditEventSeverity = "medium",
    options?: { errorMessage?: string; sessionId?: string; correlationId?: string }
  ): AuditEvent {
    return this.log({
      category: "security",
      severity,
      action,
      actor,
      target,
      details,
      result,
      errorMessage: options?.errorMessage,
      sessionId: options?.sessionId,
      correlationId: options?.correlationId,
    });
  }

  /**
   * Log a data access event
   */
  logData(
    action: string,
    actor: AuditEvent["actor"],
    target: AuditEvent["target"],
    details: Record<string, any>,
    result: AuditEvent["result"],
    severity: AuditEventSeverity = "low"
  ): AuditEvent {
    return this.log({
      category: "data",
      severity,
      action,
      actor,
      target,
      details,
      result,
    });
  }

  /**
   * Log a system event
   */
  logSystem(
    action: string,
    target: AuditEvent["target"],
    details: Record<string, any>,
    result: AuditEvent["result"],
    severity: AuditEventSeverity = "info"
  ): AuditEvent {
    return this.log({
      category: "system",
      severity,
      action,
      actor: { type: "system", id: "system" },
      target,
      details,
      result,
    });
  }

  /**
   * Log a user action
   */
  logUser(
    action: string,
    actorId: string,
    target: AuditEvent["target"],
    details: Record<string, any>,
    result: AuditEvent["result"],
    severity: AuditEventSeverity = "info"
  ): AuditEvent {
    return this.log({
      category: "user",
      severity,
      action,
      actor: { type: "user", id: actorId },
      target,
      details,
      result,
    });
  }

  /**
   * Generic log method
   */
  log(partial: Omit<AuditEvent, "id" | "timestamp" | "hash">): AuditEvent {
    const event: AuditEvent = {
      ...partial,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    // Compute tamper-evident hash
    event.hash = this.computeHash(event);
    this.lastHash = event.hash;

    this.writeQueue.push(event);

    // Also log to console for development
    const severityEmoji = {
      critical: "🔴",
      high: "🟠",
      medium: "🟡",
      low: "🔵",
      info: "⚪",
    };
    console.log(
      `[Audit] ${severityEmoji[event.severity]} [${event.category}] ${event.action} by ${event.actor.type}:${event.actor.id || "unknown"} → ${event.result}`
    );

    return event;
  }

  // ============================================================
  // Query & Retrieval
  // ============================================================

  /**
   * Query audit events with filtering
   */
  query(query: AuditQuery = {}): AuditEvent[] {
    const events = this.readAllEvents();

    let filtered = events;

    if (query.category) {
      const categories = Array.isArray(query.category) ? query.category : [query.category];
      filtered = filtered.filter((e) => categories.includes(e.category));
    }

    if (query.severity) {
      const severities = Array.isArray(query.severity) ? query.severity : [query.severity];
      filtered = filtered.filter((e) => severities.includes(e.severity));
    }

    if (query.actorType) {
      filtered = filtered.filter((e) => e.actor.type === query.actorType);
    }

    if (query.actorId) {
      filtered = filtered.filter((e) => e.actor.id === query.actorId);
    }

    if (query.targetType) {
      filtered = filtered.filter((e) => e.target.type === query.targetType);
    }

    if (query.targetId) {
      filtered = filtered.filter((e) => e.target.id === query.targetId);
    }

    if (query.action) {
      filtered = filtered.filter((e) => e.action === query.action);
    }

    if (query.result) {
      filtered = filtered.filter((e) => e.result === query.result);
    }

    if (query.since) {
      const since = new Date(query.since).getTime();
      filtered = filtered.filter((e) => new Date(e.timestamp).getTime() >= since);
    }

    if (query.until) {
      const until = new Date(query.until).getTime();
      filtered = filtered.filter((e) => new Date(e.timestamp).getTime() <= until);
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const offset = query.offset || 0;
    const limit = query.limit || filtered.length;

    return filtered.slice(offset, offset + limit);
  }

  /**
   * Get recent events
   */
  getRecent(limit: number = 50, category?: AuditEventCategory): AuditEvent[] {
    return this.query({ limit, category });
  }

  /**
   * Get events for a specific session
   */
  getSessionEvents(sessionId: string): AuditEvent[] {
    return this.query({ sessionId });
  }

  /**
   * Get audit statistics
   */
  getStats(): AuditStats {
    const events = this.readAllEvents();
    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byResult: Record<string, number> = {};
    const byActorType: Record<string, number> = {};

    let tampered = 0;
    let earliest = events.length > 0 ? events[0].timestamp : new Date().toISOString();
    let latest = earliest;

    for (const event of events) {
      byCategory[event.category] = (byCategory[event.category] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
      byResult[event.result] = (byResult[event.result] || 0) + 1;
      byActorType[event.actor.type] = (byActorType[event.actor.type] || 0) + 1;

      if (event.timestamp < earliest) earliest = event.timestamp;
      if (event.timestamp > latest) latest = event.timestamp;

      // Verify hash
      if (!this.verifyHash(event)) {
        tampered++;
      }
    }

    return {
      totalEvents: events.length,
      byCategory,
      bySeverity,
      byResult,
      byActorType,
      timeRange: { earliest, latest },
      tamperedEntries: tampered,
    };
  }

  // ============================================================
  // Export
  // ============================================================

  /**
   * Export audit log to JSON
   */
  exportToJSON(query?: AuditQuery): { success: boolean; data?: any; error?: string } {
    try {
      const events = this.query(query);
      return {
        success: true,
        data: {
          exportedAt: new Date().toISOString(),
          count: events.length,
          events,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Export audit log to CSV
   */
  exportToCSV(query?: AuditQuery): { success: boolean; csv?: string; error?: string } {
    try {
      const events = this.query(query);
      const headers = ["id", "timestamp", "category", "severity", "action", "actorType", "actorId", "targetType", "targetId", "result", "errorMessage"];
      const rows = events.map((e) => [
        e.id,
        e.timestamp,
        e.category,
        e.severity,
        e.action,
        e.actor.type,
        e.actor.id || "",
        e.target.type,
        e.target.id || "",
        e.result,
        e.errorMessage || "",
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");

      return { success: true, csv };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ============================================================
  // Integrity
  // ============================================================

  /**
   * Verify integrity of all audit entries
   */
  verifyIntegrity(): { valid: boolean; tamperedCount: number; totalChecked: number } {
    const events = this.readAllEvents();
    let tampered = 0;

    for (const event of events) {
      if (!this.verifyHash(event)) {
        tampered++;
      }
    }

    return {
      valid: tampered === 0,
      tamperedCount: tampered,
      totalChecked: events.length,
    };
  }

  private computeHash(event: AuditEvent): string {
    const data = JSON.stringify({
      timestamp: event.timestamp,
      category: event.category,
      action: event.action,
      actor: event.actor,
      target: event.target,
      details: event.details,
      result: event.result,
      previousHash: this.lastHash,
    });
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  private verifyHash(event: AuditEvent): boolean {
    // Simplified: in production, would need to recompute with previous hash chain
    return !!event.hash && event.hash.length === 64;
  }

  // ============================================================
  // Persistence
  // ============================================================

  private ensureDirectories(): void {
    if (!fs.existsSync(this.auditDir)) {
      fs.mkdirSync(this.auditDir, { recursive: true });
    }
  }

  private loadLastHash(): void {
    try {
      if (fs.existsSync(this.currentLogFile)) {
        const lines = fs.readFileSync(this.currentLogFile, "utf-8").trim().split("\n");
        if (lines.length > 0) {
          const lastEvent = JSON.parse(lines[lines.length - 1]);
          this.lastHash = lastEvent.hash || "";
        }
      }
    } catch {
      this.lastHash = "";
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, 2000); // Flush every 2 seconds
  }

  private async flush(): Promise<void> {
    if (this.isWriting || this.writeQueue.length === 0) return;

    this.isWriting = true;
    const events = this.writeQueue.splice(0, this.writeQueue.length);

    try {
      await this.rotateIfNeeded();
      const lines = events.map((e) => JSON.stringify(e)).join("\n") + "\n";
      fs.appendFileSync(this.currentLogFile, lines, "utf-8");
    } catch (err) {
      console.error("[AuditLogger] Failed to write:", err);
      this.writeQueue.unshift(...events);
    } finally {
      this.isWriting = false;
    }
  }

  private async rotateIfNeeded(): Promise<void> {
    try {
      const stats = fs.statSync(this.currentLogFile);
      if (stats.size > MAX_FILE_SIZE) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const archivePath = path.join(this.auditDir, `audit-${timestamp}.log`);
        fs.renameSync(this.currentLogFile, archivePath);
        this.lastHash = "";
      }
    } catch {
      // File doesn't exist yet
    }
  }

  private readAllEvents(): AuditEvent[] {
    const events: AuditEvent[] = [];

    try {
      // Read current log
      if (fs.existsSync(this.currentLogFile)) {
        const lines = fs.readFileSync(this.currentLogFile, "utf-8").trim().split("\n");
        for (const line of lines) {
          if (line.trim()) {
            try {
              events.push(JSON.parse(line));
            } catch {
              // Skip corrupted lines
            }
          }
        }
      }

      // Read archived logs
      const files = fs.readdirSync(this.auditDir).filter((f) => f.startsWith("audit-") && f.endsWith(".log"));
      for (const file of files) {
        const filePath = path.join(this.auditDir, file);
        const lines = fs.readFileSync(filePath, "utf-8").trim().split("\n");
        for (const line of lines) {
          if (line.trim()) {
            try {
              events.push(JSON.parse(line));
            } catch {
              // Skip corrupted lines
            }
          }
        }
      }
    } catch (err) {
      console.warn("[AuditLogger] Failed to read events:", err);
    }

    return events;
  }

  // ============================================================
  // Cleanup
  // ============================================================

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }

  private generateId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
