/** Audit log type definitions. */

export type AuditCategory =
  | "security"
  | "data"
  | "system"
  | "user"
  | "session"
  | "workflow"
  | "mcp"
  | "skill"
  | "config";

export type AuditSeverity = "critical" | "high" | "medium" | "low" | "info";
export type AuditResult = "success" | "failure" | "partial";

export interface AuditActor {
  type: string;
  id?: string;
  name?: string;
}

export interface AuditTarget {
  type: string;
  id?: string;
  name?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: AuditCategory;
  severity: AuditSeverity;
  action: string;
  actor: AuditActor;
  target?: AuditTarget;
  result: AuditResult;
  details?: Record<string, unknown>;
  hash?: string;
  previousHash?: string;
  sessionId?: string;
  errorMessage?: string | null;
}

export interface AuditStats {
  totalEvents: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byResult: Record<string, number>;
  byActorType: Record<string, number>;
  timeRange: {
    earliest: string;
    latest: string;
  };
  tamperedEntries: number;
}

export interface AuditQuery {
  category?: AuditCategory;
  severity?: AuditSeverity;
  sessionId?: string;
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
}

export interface IntegrityResult {
  valid: boolean;
  tamperedCount: number;
  totalChecked: number;
}
