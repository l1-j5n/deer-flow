/**
 * DeerFlow Electron - Agent Context Manager
 *
 * Manages persistent session context for AI agents:
 * - Context window management with token budgeting
 * - Multi-session context sharing and inheritance
 * - Context summarization and compression
 * - File attachment context injection
 * - System prompt management
 * - Context persistence across app restarts
 * - Priority-based context eviction
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export interface ContextMessage {
  id: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  timestamp: string;
  tokens?: number;
  metadata?: {
    toolName?: string;
    toolArgs?: Record<string, any>;
    fileAttachments?: string[];
    importance?: number; // 0-1, higher = less likely to be evicted
  };
}

export interface ContextSession {
  id: string;
  name: string;
  messages: ContextMessage[];
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
  totalTokens: number;
  maxTokens: number;
  metadata: {
    model: string;
    temperature: number;
    tags: string[];
    parentSessionId?: string;
  };
}

export interface ContextSummary {
  sessionId: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  generatedAt: string;
  messageCount: number;
  originalTokens: number;
  summaryTokens: number;
}

export interface ContextBudget {
  maxTokens: number;
  reservedSystem: number; // Tokens reserved for system prompt
  reservedRecent: number; // Tokens reserved for recent messages
  compressionThreshold: number; // When to trigger compression
}

export interface ContextInheritance {
  fromSessionId: string;
  toSessionId: string;
  inheritedAt: string;
  includeSummary: boolean;
  includeKeyPoints: boolean;
  includeActionItems: boolean;
}

// ============================================================
// Agent Context Manager
// ============================================================

const CONTEXT_DIR = "agent-contexts";
const CONTEXT_INDEX = "context-index.json";
const SUMMARIES_DIR = "context-summaries";

// Rough token estimation: ~4 chars per token
const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

export class AgentContextManager extends EventEmitter {
  private projectRoot: string;
  private contextDir: string;
  private summariesDir: string;
  private indexPath: string;
  private sessions: Map<string, ContextSession> = new Map();
  private summaries: Map<string, ContextSummary> = new Map();
  private inheritances: Map<string, ContextInheritance[]> = new Map();
  private defaultBudget: ContextBudget = {
    maxTokens: 8000,
    reservedSystem: 500,
    reservedRecent: 2000,
    compressionThreshold: 7000,
  };

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
    this.contextDir = path.join(projectRoot, CONTEXT_DIR);
    this.summariesDir = path.join(projectRoot, SUMMARIES_DIR);
    this.indexPath = path.join(projectRoot, CONTEXT_INDEX);

    this.ensureDirectories();
    this.loadIndex();
  }

  // ============================================================
  // Directory & Persistence
  // ============================================================

  private ensureDirectories(): void {
    for (const dir of [this.contextDir, this.summariesDir]) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  private loadIndex(): void {
    try {
      if (fs.existsSync(this.indexPath)) {
        const index = JSON.parse(fs.readFileSync(this.indexPath, "utf-8"));
        if (index.sessions) {
          for (const session of index.sessions) {
            this.sessions.set(session.id, session);
          }
        }
        if (index.summaries) {
          for (const summary of index.summaries) {
            this.summaries.set(summary.sessionId, summary);
          }
        }
        if (index.inheritances) {
          for (const [key, value] of Object.entries(index.inheritances)) {
            this.inheritances.set(key, value as ContextInheritance[]);
          }
        }
      }
    } catch (err) {
      console.warn("[AgentContext] Failed to load index:", err);
    }
  }

  private saveIndex(): void {
    try {
      const index = {
        updatedAt: new Date().toISOString(),
        sessions: Array.from(this.sessions.values()).map((s) => ({
          id: s.id,
          name: s.name,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          totalTokens: s.totalTokens,
          maxTokens: s.maxTokens,
          metadata: s.metadata,
          messageCount: s.messages.length,
        })),
        summaries: Array.from(this.summaries.values()),
        inheritances: Object.fromEntries(this.inheritances),
      };
      fs.writeFileSync(this.indexPath, JSON.stringify(index, null, 2));
    } catch (err) {
      console.warn("[AgentContext] Failed to save index:", err);
    }
  }

  private persistSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    try {
      const filePath = path.join(this.contextDir, `${sessionId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
    } catch (err) {
      console.warn(`[AgentContext] Failed to persist session ${sessionId}:`, err);
    }
  }

  private loadSession(sessionId: string): ContextSession | null {
    try {
      const filePath = path.join(this.contextDir, `${sessionId}.json`);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
      }
    } catch (err) {
      console.warn(`[AgentContext] Failed to load session ${sessionId}:`, err);
    }
    return null;
  }

  // ============================================================
  // Session Management
  // ============================================================

  createSession(
    name: string,
    options?: {
      systemPrompt?: string;
      maxTokens?: number;
      model?: string;
      temperature?: number;
      tags?: string[];
      parentSessionId?: string;
    }
  ): ContextSession {
    const id = `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();

    const session: ContextSession = {
      id,
      name,
      messages: [],
      systemPrompt: options?.systemPrompt || "You are a helpful AI assistant.",
      createdAt: now,
      updatedAt: now,
      totalTokens: 0,
      maxTokens: options?.maxTokens || this.defaultBudget.maxTokens,
      metadata: {
        model: options?.model || "default",
        temperature: options?.temperature ?? 0.7,
        tags: options?.tags || [],
        parentSessionId: options?.parentSessionId,
      },
    };

    // Calculate initial tokens
    session.totalTokens = estimateTokens(session.systemPrompt);

    this.sessions.set(id, session);
    this.persistSession(id);
    this.saveIndex();

    // If parent session specified, inherit context
    if (options?.parentSessionId) {
      this.inheritContext(options.parentSessionId, id, {
        includeSummary: true,
        includeKeyPoints: true,
        includeActionItems: false,
      });
    }

    this.emit("session:created", { sessionId: id, name });
    return session;
  }

  getSession(sessionId: string): ContextSession | null {
    // Try memory first, then disk
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = this.loadSession(sessionId);
      if (session) {
        this.sessions.set(sessionId, session);
      }
    }
    return session || null;
  }

  getAllSessions(): ContextSession[] {
    // Ensure all sessions from disk are loaded
    try {
      const files = fs.readdirSync(this.contextDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const sessionId = file.slice(0, -5);
          if (!this.sessions.has(sessionId)) {
            const session = this.loadSession(sessionId);
            if (session) {
              this.sessions.set(sessionId, session);
            }
          }
        }
      }
    } catch {
      // ignore
    }

    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  deleteSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    this.sessions.delete(sessionId);
    this.summaries.delete(sessionId);
    this.inheritances.delete(sessionId);

    // Remove file
    try {
      const filePath = path.join(this.contextDir, `${sessionId}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.warn(`[AgentContext] Failed to delete session file ${sessionId}:`, err);
    }

    this.saveIndex();
    this.emit("session:deleted", { sessionId });
    return true;
  }

  renameSession(sessionId: string, newName: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.name = newName;
    session.updatedAt = new Date().toISOString();
    this.persistSession(sessionId);
    this.saveIndex();

    this.emit("session:renamed", { sessionId, newName });
    return true;
  }

  // ============================================================
  // Message Management
  // ============================================================

  addMessage(
    sessionId: string,
    message: Omit<ContextMessage, "id" | "timestamp" | "tokens">
  ): ContextMessage | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const tokens = estimateTokens(message.content);

    const fullMessage: ContextMessage = {
      ...message,
      id,
      timestamp: new Date().toISOString(),
      tokens,
      metadata: {
        importance: 0.5,
        ...message.metadata,
      },
    };

    session.messages.push(fullMessage);
    session.totalTokens += tokens;
    session.updatedAt = new Date().toISOString();

    // Check if compression needed
    if (session.totalTokens > session.maxTokens * 0.9) {
      this.compressSession(sessionId);
    }

    this.persistSession(sessionId);
    this.emit("message:added", { sessionId, messageId: id, tokens });

    return fullMessage;
  }

  deleteMessage(sessionId: string, messageId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const index = session.messages.findIndex((m) => m.id === messageId);
    if (index === -1) return false;

    const message = session.messages[index];
    session.totalTokens -= message.tokens || estimateTokens(message.content);
    session.messages.splice(index, 1);
    session.updatedAt = new Date().toISOString();

    this.persistSession(sessionId);
    this.emit("message:deleted", { sessionId, messageId });
    return true;
  }

  getMessages(sessionId: string, options?: { limit?: number; offset?: number }): ContextMessage[] {
    const session = this.getSession(sessionId);
    if (!session) return [];

    let messages = session.messages;
    if (options?.offset !== undefined) {
      messages = messages.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      messages = messages.slice(0, options.limit);
    }
    return messages;
  }

  // ============================================================
  // Context Compression
  // ============================================================

  compressSession(sessionId: string): ContextSummary | null {
    const session = this.sessions.get(sessionId);
    if (!session || session.messages.length < 5) return null;

    // Keep system prompt + recent messages, summarize older ones
    const recentMessageCount = 4;
    const messagesToSummarize = session.messages.slice(0, -recentMessageCount);
    const recentMessages = session.messages.slice(-recentMessageCount);

    // Generate simple extractive summary
    const content = messagesToSummarize.map((m) => `${m.role}: ${m.content}`).join("\n");
    const keyPoints = this.extractKeyPoints(content);
    const actionItems = this.extractActionItems(content);

    const summary: ContextSummary = {
      sessionId,
      summary: this.generateSummary(content),
      keyPoints,
      actionItems,
      generatedAt: new Date().toISOString(),
      messageCount: messagesToSummarize.length,
      originalTokens: messagesToSummarize.reduce((sum, m) => sum + (m.tokens || 0), 0),
      summaryTokens: estimateTokens(keyPoints.join(" ") + actionItems.join(" ")),
    };

    this.summaries.set(sessionId, summary);

    // Replace summarized messages with summary context
    const summaryMessage: ContextMessage = {
      id: `summary_${Date.now()}`,
      role: "system",
      content: `[Previous conversation summary]\n${summary.summary}\n\nKey points:\n${keyPoints.map((p) => `- ${p}`).join("\n")}`,
      timestamp: new Date().toISOString(),
      tokens: summary.summaryTokens,
      metadata: { importance: 1.0 },
    };

    session.messages = [summaryMessage, ...recentMessages];
    session.totalTokens =
      estimateTokens(session.systemPrompt) +
      session.messages.reduce((sum, m) => sum + (m.tokens || estimateTokens(m.content)), 0);
    session.updatedAt = new Date().toISOString();

    this.persistSession(sessionId);
    this.saveIndex();

    this.emit("session:compressed", { sessionId, summary });
    return summary;
  }

  private generateSummary(content: string): string {
    // Simple extractive summary: take first sentence of each paragraph
    const sentences = content
      .split(/[.!?\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    if (sentences.length <= 3) return content.slice(0, 500);

    // Take representative sentences
    const selected = [
      sentences[0],
      sentences[Math.floor(sentences.length / 3)],
      sentences[Math.floor((sentences.length * 2) / 3)],
      sentences[sentences.length - 1],
    ].filter(Boolean);

    return selected.join(". ").slice(0, 800) + "...";
  }

  private extractKeyPoints(content: string): string[] {
    const points: string[] = [];
    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();
      // Look for lines that seem like key facts (contain numbers, names, or conclusions)
      if (
        trimmed.length > 30 &&
        trimmed.length < 200 &&
        (trimmed.match(/\d+/) || trimmed.includes("is ") || trimmed.includes("are "))
      ) {
        points.push(trimmed);
        if (points.length >= 5) break;
      }
    }

    return points.length > 0 ? points : ["Conversation continued from previous context"];
  }

  private extractActionItems(content: string): string[] {
    const items: string[] = [];
    const actionPatterns = [
      /(?:need to|should|must|will|let's|please)\s+(.{10,150})/gi,
      /(?:action item|todo|task|follow.up)\s*:?\s*(.{10,150})/gi,
    ];

    for (const pattern of actionPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        items.push(match[1].trim());
        if (items.length >= 5) break;
      }
      if (items.length >= 5) break;
    }

    return items;
  }

  getSummary(sessionId: string): ContextSummary | null {
    return this.summaries.get(sessionId) || null;
  }

  // ============================================================
  // Context Inheritance
  // ============================================================

  inheritContext(
    fromSessionId: string,
    toSessionId: string,
    options: {
      includeSummary?: boolean;
      includeKeyPoints?: boolean;
      includeActionItems?: boolean;
    }
  ): boolean {
    const fromSession = this.getSession(fromSessionId);
    const toSession = this.getSession(toSessionId);
    if (!fromSession || !toSession) return false;

    const summary = this.summaries.get(fromSessionId);
    const parts: string[] = [];

    if (options.includeSummary && summary) {
      parts.push(`[Inherited from "${fromSession.name}"]\n${summary.summary}`);
    }
    if (options.includeKeyPoints && summary) {
      parts.push(`Key points:\n${summary.keyPoints.map((p) => `- ${p}`).join("\n")}`);
    }
    if (options.includeActionItems && summary) {
      parts.push(`Action items:\n${summary.actionItems.map((i) => `- ${i}`).join("\n")}`);
    }

    if (parts.length > 0) {
      const inheritanceMessage: ContextMessage = {
        id: `inherit_${Date.now()}`,
        role: "system",
        content: parts.join("\n\n"),
        timestamp: new Date().toISOString(),
        tokens: estimateTokens(parts.join("\n\n")),
        metadata: { importance: 1.0 },
      };

      toSession.messages.unshift(inheritanceMessage);
      toSession.totalTokens += inheritanceMessage.tokens || 0;
      toSession.updatedAt = new Date().toISOString();
      this.persistSession(toSessionId);
    }

    const inheritance: ContextInheritance = {
      fromSessionId,
      toSessionId,
      inheritedAt: new Date().toISOString(),
      includeSummary: !!options.includeSummary,
      includeKeyPoints: !!options.includeKeyPoints,
      includeActionItems: !!options.includeActionItems,
    };

    if (!this.inheritances.has(toSessionId)) {
      this.inheritances.set(toSessionId, []);
    }
    this.inheritances.get(toSessionId)!.push(inheritance);
    this.saveIndex();

    this.emit("context:inherited", inheritance);
    return true;
  }

  getInheritances(sessionId: string): ContextInheritance[] {
    return this.inheritances.get(sessionId) || [];
  }

  // ============================================================
  // System Prompt Management
  // ============================================================

  updateSystemPrompt(sessionId: string, systemPrompt: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Adjust token count
    const oldTokens = estimateTokens(session.systemPrompt);
    const newTokens = estimateTokens(systemPrompt);
    session.totalTokens = session.totalTokens - oldTokens + newTokens;

    session.systemPrompt = systemPrompt;
    session.updatedAt = new Date().toISOString();

    this.persistSession(sessionId);
    this.emit("systemPrompt:updated", { sessionId });
    return true;
  }

  // ============================================================
  // Context Assembly for LLM
  // ============================================================

  buildContextForLLM(sessionId: string): {
    messages: Array<{ role: string; content: string }>;
    systemPrompt: string;
    totalTokens: number;
  } | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const messages = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    return {
      messages,
      systemPrompt: session.systemPrompt,
      totalTokens: session.totalTokens,
    };
  }

  // ============================================================
  // Stats
  // ============================================================

  getStats(): {
    totalSessions: number;
    totalMessages: number;
    totalTokens: number;
    totalSummaries: number;
    averageMessagesPerSession: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);

    return {
      totalSessions: sessions.length,
      totalMessages,
      totalTokens: sessions.reduce((sum, s) => sum + s.totalTokens, 0),
      totalSummaries: this.summaries.size,
      averageMessagesPerSession: sessions.length > 0 ? Math.round(totalMessages / sessions.length) : 0,
    };
  }

  // ============================================================
  // Cleanup
  // ============================================================

  dispose(): void {
    this.saveIndex();
    for (const sessionId of this.sessions.keys()) {
      this.persistSession(sessionId);
    }
    this.removeAllListeners();
  }
}
