/**
 * DeerFlow Electron - Agent Session Manager
 *
 * Manages agent conversation sessions:
 * - Session lifecycle (create, pause, resume, end)
 * - Session persistence and recovery
 * - Message history tracking
 * - Session metadata (model, tools, status)
 * - Session state machine (idle, running, paused, error, completed)
 * - Concurrent session management
 *
 * Integrates with the backend LangGraph agent system via IPC.
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export type SessionStatus =
  | "idle"
  | "running"
  | "paused"
  | "error"
  | "completed"
  | "cancelled";

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
  toolCalls?: Array<{
    name: string;
    arguments: Record<string, any>;
    result?: any;
  }>;
}

export interface AgentSession {
  id: string;
  title: string;
  status: SessionStatus;
  model: string;
  createdAt: string;
  updatedAt: string;
  messages: AgentMessage[];
  metadata: {
    threadId?: string;
    tools?: string[];
    tags?: string[];
    description?: string;
  };
  stats: {
    messageCount: number;
    tokenCount?: number;
    toolCallCount: number;
    duration: number; // ms
  };
}

export interface SessionCreateOptions {
  title?: string;
  model?: string;
  threadId?: string;
  tools?: string[];
  tags?: string[];
  description?: string;
}

export interface SessionFilter {
  status?: SessionStatus | SessionStatus[];
  model?: string;
  tags?: string[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  totalMessages: number;
  totalToolCalls: number;
  averageDuration: number;
}

// ============================================================
// Session Manager
// ============================================================

const SESSIONS_DIR = "agent-sessions";
const SESSIONS_INDEX = "sessions-index.json";
const MAX_SESSIONS_IN_MEMORY = 50;

export class AgentSessionManager extends EventEmitter {
  private projectRoot: string;
  private sessions: Map<string, AgentSession> = new Map();
  private activeSessionIds: Set<string> = new Set();
  private sessionsDir: string;
  private indexPath: string;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
    this.sessionsDir = path.join(projectRoot, ".deerflow", SESSIONS_DIR);
    this.indexPath = path.join(this.sessionsDir, SESSIONS_INDEX);
    this.ensureDirectories();
    this.loadIndex();
  }

  // ============================================================
  // Directory & Index Management
  // ============================================================

  private ensureDirectories(): void {
    if (!fs.existsSync(this.sessionsDir)) {
      fs.mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  private loadIndex(): void {
    try {
      if (fs.existsSync(this.indexPath)) {
        const data = JSON.parse(fs.readFileSync(this.indexPath, "utf-8"));
        if (data.sessions) {
          for (const session of data.sessions) {
            // Only load metadata, not full messages
            this.sessions.set(session.id, {
              ...session,
              messages: [], // Lazy load
            });
          }
        }
      }
    } catch (err) {
      console.warn("[AgentSessionManager] Failed to load index:", err);
    }
  }

  private saveIndex(): void {
    try {
      const index = {
        updatedAt: new Date().toISOString(),
        sessions: Array.from(this.sessions.values()).map((s) => ({
          id: s.id,
          title: s.title,
          status: s.status,
          model: s.model,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          metadata: s.metadata,
          stats: s.stats,
        })),
      };

      fs.writeFileSync(this.indexPath, JSON.stringify(index, null, 2), "utf-8");
    } catch (err) {
      console.warn("[AgentSessionManager] Failed to save index:", err);
    }
  }

  private scheduleSave(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveIndex();
    }, 1000);
  }

  // ============================================================
  // Session Lifecycle
  // ============================================================

  /**
   * Create a new agent session
   */
  createSession(options: SessionCreateOptions = {}): AgentSession {
    const id = this.generateSessionId();
    const now = new Date().toISOString();

    const session: AgentSession = {
      id,
      title: options.title || `Session ${this.formatDate(now)}`,
      status: "idle",
      model: options.model || "default",
      createdAt: now,
      updatedAt: now,
      messages: [],
      metadata: {
        threadId: options.threadId,
        tools: options.tools || [],
        tags: options.tags || [],
        description: options.description,
      },
      stats: {
        messageCount: 0,
        toolCallCount: 0,
        duration: 0,
      },
    };

    this.sessions.set(id, session);
    this.scheduleSave();

    this.emit("session-created", session);
    return session;
  }

  /**
   * Get a session by ID (lazy loads messages from disk)
   */
  getSession(id: string): AgentSession | undefined {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    // Lazy load messages if not in memory
    if (session.messages.length === 0) {
      this.loadSessionMessages(id);
    }

    return { ...session, messages: [...session.messages] };
  }

  /**
   * Load session messages from disk
   */
  private loadSessionMessages(id: string): void {
    const sessionPath = path.join(this.sessionsDir, `${id}.json`);
    try {
      if (fs.existsSync(sessionPath)) {
        const data = JSON.parse(fs.readFileSync(sessionPath, "utf-8"));
        const session = this.sessions.get(id);
        if (session && data.messages) {
          session.messages = data.messages;
        }
      }
    } catch (err) {
      console.warn(`[AgentSessionManager] Failed to load messages for ${id}:`, err);
    }
  }

  /**
   * Save session messages to disk
   */
  private saveSessionMessages(id: string): void {
    const session = this.sessions.get(id);
    if (!session) return;

    const sessionPath = path.join(this.sessionsDir, `${id}.json`);
    try {
      fs.writeFileSync(
        sessionPath,
        JSON.stringify(
          {
            id: session.id,
            title: session.title,
            status: session.status,
            model: session.model,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            metadata: session.metadata,
            stats: session.stats,
            messages: session.messages,
          },
          null,
          2
        ),
        "utf-8"
      );
    } catch (err) {
      console.warn(`[AgentSessionManager] Failed to save messages for ${id}:`, err);
    }
  }

  /**
   * Start a session (transition to running)
   */
  startSession(id: string): { success: boolean; error?: string } {
    const session = this.sessions.get(id);
    if (!session) {
      return { success: false, error: `Session "${id}" not found` };
    }

    if (session.status === "running") {
      return { success: false, error: "Session is already running" };
    }

    session.status = "running";
    session.updatedAt = new Date().toISOString();
    this.activeSessionIds.add(id);

    this.scheduleSave();
    this.emit("session-started", id);
    return { success: true };
  }

  /**
   * Pause a running session
   */
  pauseSession(id: string): { success: boolean; error?: string } {
    const session = this.sessions.get(id);
    if (!session) {
      return { success: false, error: `Session "${id}" not found` };
    }

    if (session.status !== "running") {
      return { success: false, error: "Session is not running" };
    }

    session.status = "paused";
    session.updatedAt = new Date().toISOString();
    this.activeSessionIds.delete(id);

    this.scheduleSave();
    this.emit("session-paused", id);
    return { success: true };
  }

  /**
   * Resume a paused session
   */
  resumeSession(id: string): { success: boolean; error?: string } {
    const session = this.sessions.get(id);
    if (!session) {
      return { success: false, error: `Session "${id}" not found` };
    }

    if (session.status !== "paused") {
      return { success: false, error: "Session is not paused" };
    }

    session.status = "running";
    session.updatedAt = new Date().toISOString();
    this.activeSessionIds.add(id);

    this.scheduleSave();
    this.emit("session-resumed", id);
    return { success: true };
  }

  /**
   * Complete a session
   */
  completeSession(id: string): { success: boolean; error?: string } {
    const session = this.sessions.get(id);
    if (!session) {
      return { success: false, error: `Session "${id}" not found` };
    }

    session.status = "completed";
    session.updatedAt = new Date().toISOString();
    this.activeSessionIds.delete(id);

    this.saveSessionMessages(id);
    this.scheduleSave();

    this.emit("session-completed", id);
    return { success: true };
  }

  /**
   * Mark a session as errored
   */
  errorSession(id: string, errorMessage: string): { success: boolean; error?: string } {
    const session = this.sessions.get(id);
    if (!session) {
      return { success: false, error: `Session "${id}" not found` };
    }

    session.status = "error";
    session.updatedAt = new Date().toISOString();
    this.activeSessionIds.delete(id);

    this.saveSessionMessages(id);
    this.scheduleSave();

    this.emit("session-error", id, errorMessage);
    return { success: true };
  }

  /**
   * Cancel a session
   */
  cancelSession(id: string): { success: boolean; error?: string } {
    const session = this.sessions.get(id);
    if (!session) {
      return { success: false, error: `Session "${id}" not found` };
    }

    session.status = "cancelled";
    session.updatedAt = new Date().toISOString();
    this.activeSessionIds.delete(id);

    this.saveSessionMessages(id);
    this.scheduleSave();

    this.emit("session-cancelled", id);
    return { success: true };
  }

  /**
   * Delete a session permanently
   */
  deleteSession(id: string): { success: boolean; error?: string } {
    const session = this.sessions.get(id);
    if (!session) {
      return { success: false, error: `Session "${id}" not found` };
    }

    // Stop if active
    if (this.activeSessionIds.has(id)) {
      this.activeSessionIds.delete(id);
    }

    // Delete from memory
    this.sessions.delete(id);

    // Delete from disk
    const sessionPath = path.join(this.sessionsDir, `${id}.json`);
    try {
      if (fs.existsSync(sessionPath)) {
        fs.unlinkSync(sessionPath);
      }
    } catch (err) {
      console.warn(`[AgentSessionManager] Failed to delete session file for ${id}:`, err);
    }

    this.scheduleSave();
    this.emit("session-deleted", id);
    return { success: true };
  }

  // ============================================================
  // Message Management
  // ============================================================

  /**
   * Add a message to a session
   */
  addMessage(
    sessionId: string,
    message: Omit<AgentMessage, "id" | "timestamp">
  ): { success: boolean; error?: string; message?: AgentMessage } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, error: `Session "${sessionId}" not found` };
    }

    const newMessage: AgentMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    session.messages.push(newMessage);
    session.stats.messageCount = session.messages.length;
    session.updatedAt = newMessage.timestamp;

    if (message.toolCalls) {
      session.stats.toolCallCount += message.toolCalls.length;
    }

    // Auto-save messages periodically
    if (session.messages.length % 10 === 0) {
      this.saveSessionMessages(sessionId);
    }

    this.emit("message-added", sessionId, newMessage);
    return { success: true, message: newMessage };
  }

  /**
   * Get messages for a session with optional pagination
   */
  getMessages(
    sessionId: string,
    options: { limit?: number; offset?: number } = {}
  ): { messages: AgentMessage[]; total: number } {
    const session = this.getSession(sessionId);
    if (!session) {
      return { messages: [], total: 0 };
    }

    const { limit, offset = 0 } = options;
    const messages = session.messages;

    if (limit === undefined) {
      return { messages: [...messages], total: messages.length };
    }

    return {
      messages: messages.slice(offset, offset + limit),
      total: messages.length,
    };
  }

  /**
   * Update session title
   */
  updateTitle(id: string, title: string): { success: boolean; error?: string } {
    const session = this.sessions.get(id);
    if (!session) {
      return { success: false, error: `Session "${id}" not found` };
    }

    session.title = title;
    session.updatedAt = new Date().toISOString();
    this.scheduleSave();

    this.emit("session-updated", id, { title });
    return { success: true };
  }

  /**
   * Update session metadata
   */
  updateMetadata(
    id: string,
    metadata: Partial<AgentSession["metadata"]>
  ): { success: boolean; error?: string } {
    const session = this.sessions.get(id);
    if (!session) {
      return { success: false, error: `Session "${id}" not found` };
    }

    session.metadata = { ...session.metadata, ...metadata };
    session.updatedAt = new Date().toISOString();
    this.scheduleSave();

    this.emit("session-updated", id, { metadata });
    return { success: true };
  }

  // ============================================================
  // Queries & Filtering
  // ============================================================

  /**
   * List all sessions with optional filtering
   */
  listSessions(filter?: SessionFilter): AgentSession[] {
    let results = Array.from(this.sessions.values());

    if (filter) {
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
        results = results.filter((s) => statuses.includes(s.status));
      }

      if (filter.model) {
        results = results.filter((s) => s.model === filter.model);
      }

      if (filter.tags && filter.tags.length > 0) {
        results = results.filter((s) =>
          filter.tags!.some((tag) => s.metadata.tags?.includes(tag))
        );
      }

      if (filter.search) {
        const lower = filter.search.toLowerCase();
        results = results.filter(
          (s) =>
            s.title.toLowerCase().includes(lower) ||
            s.metadata.description?.toLowerCase().includes(lower)
        );
      }

      if (filter.dateFrom) {
        results = results.filter((s) => s.createdAt >= filter.dateFrom!);
      }

      if (filter.dateTo) {
        results = results.filter((s) => s.createdAt <= filter.dateTo!);
      }
    }

    // Sort by updatedAt descending
    return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  /**
   * Get active (running) sessions
   */
  getActiveSessions(): AgentSession[] {
    return Array.from(this.activeSessionIds)
      .map((id) => this.sessions.get(id))
      .filter(Boolean) as AgentSession[];
  }

  /**
   * Get recent sessions
   */
  getRecentSessions(limit: number = 10): AgentSession[] {
    return this.listSessions().slice(0, limit);
  }

  /**
   * Search sessions
   */
  searchSessions(query: string): AgentSession[] {
    return this.listSessions({ search: query });
  }

  /**
   * Get session statistics
   */
  getStats(): SessionStats {
    const sessions = Array.from(this.sessions.values());
    const completed = sessions.filter((s) => s.status === "completed");
    const totalDuration = completed.reduce((sum, s) => sum + s.stats.duration, 0);

    return {
      totalSessions: sessions.length,
      activeSessions: this.activeSessionIds.size,
      completedSessions: completed.length,
      totalMessages: sessions.reduce((sum, s) => sum + s.stats.messageCount, 0),
      totalToolCalls: sessions.reduce((sum, s) => sum + s.stats.toolCallCount, 0),
      averageDuration: completed.length > 0 ? Math.round(totalDuration / completed.length) : 0,
    };
  }

  /**
   * Check if a session exists
   */
  hasSession(id: string): boolean {
    return this.sessions.has(id);
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  // ============================================================
  // Batch Operations
  // ============================================================

  /**
   * Delete multiple sessions
   */
  deleteSessions(ids: string[]): { success: string[]; failed: Array<{ id: string; error: string }> } {
    const success: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const id of ids) {
      const result = this.deleteSession(id);
      if (result.success) {
        success.push(id);
      } else {
        failed.push({ id, error: result.error || "Unknown error" });
      }
    }

    return { success, failed };
  }

  /**
   * Archive old sessions (mark as completed and save)
   */
  archiveOldSessions(olderThanDays: number = 30): { archived: number } {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    let archived = 0;
    for (const session of this.sessions.values()) {
      if (session.status === "idle" && new Date(session.updatedAt) < cutoff) {
        session.status = "completed";
        this.saveSessionMessages(session.id);
        archived++;
      }
    }

    if (archived > 0) {
      this.scheduleSave();
    }

    return { archived };
  }

  /**
   * Export session to JSON
   */
  exportSession(id: string): { success: boolean; data?: any; error?: string } {
    const session = this.getSession(id);
    if (!session) {
      return { success: false, error: `Session "${id}" not found` };
    }

    return {
      success: true,
      data: {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        session,
      },
    };
  }

  /**
   * Import session from JSON
   */
  importSession(data: any): { success: boolean; session?: AgentSession; error?: string } {
    try {
      if (!data.session || !data.session.id) {
        return { success: false, error: "Invalid session data" };
      }

      const imported = data.session as AgentSession;
      const newId = this.generateSessionId();

      const session: AgentSession = {
        ...imported,
        id: newId,
        title: `${imported.title} (imported)`,
        status: "idle",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.sessions.set(newId, session);
      this.saveSessionMessages(newId);
      this.scheduleSave();

      this.emit("session-imported", newId);
      return { success: true, session };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ============================================================
  // Cleanup
  // ============================================================

  /**
   * Flush all pending saves
   */
  flush(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.saveIndex();

    // Save all active sessions
    for (const id of this.activeSessionIds) {
      this.saveSessionMessages(id);
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.flush();
    this.removeAllListeners();
  }

  // ============================================================
  // Helpers
  // ============================================================

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatDate(iso: string): string {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
}
