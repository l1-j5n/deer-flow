/**
 * DeerFlow Electron - Context & Memory Manager
 *
 * Manages conversation context and long-term memory for agent sessions:
 * - Sliding window context compression (token budget management)
 * - Long-term memory storage with semantic search
 * - Session context snapshots
 * - Token counting and budget enforcement
 * - Cross-session memory sharing
 *
 * Integrates with AgentSessionManager for message history.
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export interface ContextConfig {
  maxTokens: number;
  maxMessages: number;
  compressionThreshold: number; // When to compress (0-1 ratio)
  preserveSystemMessages: boolean;
  preserveRecentCount: number; // Always keep N most recent messages
}

export interface ContextSnapshot {
  id: string;
  sessionId: string;
  timestamp: string;
  messages: ContextMessage[];
  tokenCount: number;
  summary?: string;
  metadata: Record<string, any>;
}

export interface ContextMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: string;
  tokenCount?: number;
  metadata?: Record<string, any>;
}

export interface MemoryEntry {
  id: string;
  content: string;
  category: "fact" | "preference" | "task" | "entity" | "summary";
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  lastAccessed: string;
  tags: string[];
  confidence: number; // 0-1
  source?: string;
}

export interface MemoryQuery {
  query?: string;
  category?: MemoryEntry["category"] | MemoryEntry["category"][];
  tags?: string[];
  sessionId?: string;
  limit?: number;
  minConfidence?: number;
}

export interface TokenCountResult {
  total: number;
  byRole: Record<string, number>;
  byMessage: Map<string, number>;
}

// ============================================================
// Context Manager
// ============================================================

const DEFAULT_CONFIG: ContextConfig = {
  maxTokens: 8000,
  maxMessages: 100,
  compressionThreshold: 0.8,
  preserveSystemMessages: true,
  preserveRecentCount: 10,
};

// Approximate token count (rough estimate: 1 token ≈ 4 chars for English, 2 for CJK)
function estimateTokens(text: string): number {
  let tokens = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    // CJK characters
    if (code >= 0x4e00 && code <= 0x9fff) {
      tokens += 1;
    } else {
      tokens += 0.25;
    }
  }
  return Math.ceil(tokens);
}

export class ContextManager extends EventEmitter {
  private projectRoot: string;
  private config: ContextConfig;
  private snapshots: Map<string, ContextSnapshot> = new Map();
  private memories: Map<string, MemoryEntry> = new Map();
  private snapshotsDir: string;
  private memoriesDir: string;
  private memoryIndexPath: string;

  constructor(projectRoot: string, config?: Partial<ContextConfig>) {
    super();
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.snapshotsDir = path.join(projectRoot, ".deerflow", "context-snapshots");
    this.memoriesDir = path.join(projectRoot, ".deerflow", "memories");
    this.memoryIndexPath = path.join(this.memoriesDir, "index.json");
    this.ensureDirectories();
    this.loadMemories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir, { recursive: true });
    }
    if (!fs.existsSync(this.memoriesDir)) {
      fs.mkdirSync(this.memoriesDir, { recursive: true });
    }
  }

  // ============================================================
  // Context Building
  // ============================================================

  /**
   * Build optimized context from messages within token budget
   */
  buildContext(
    messages: ContextMessage[],
    options?: {
      systemPrompt?: string;
      extraContext?: string;
      budget?: number;
    }
  ): { context: ContextMessage[]; tokenCount: number; compressed: boolean } {
    const budget = options?.budget || this.config.maxTokens;
    let tokenCount = 0;
    const result: ContextMessage[] = [];
    let compressed = false;

    // Add system prompt if provided
    if (options?.systemPrompt) {
      const sysMsg: ContextMessage = {
        id: `sys_${Date.now()}`,
        role: "system",
        content: options.systemPrompt,
        timestamp: new Date().toISOString(),
        tokenCount: estimateTokens(options.systemPrompt),
      };
      result.push(sysMsg);
      tokenCount += sysMsg.tokenCount!;
    }

    // Add extra context if provided
    if (options?.extraContext) {
      const extraTokens = estimateTokens(options.extraContext);
      if (tokenCount + extraTokens < budget * 0.3) {
        result.push({
          id: `extra_${Date.now()}`,
          role: "system",
          content: options.extraContext,
          timestamp: new Date().toISOString(),
          tokenCount: extraTokens,
        });
        tokenCount += extraTokens;
      }
    }

    // Calculate tokens for all messages
    const scoredMessages = messages.map((m) => ({
      ...m,
      tokenCount: m.tokenCount || estimateTokens(m.content),
    }));

    // Always preserve recent messages
    const recentMessages = scoredMessages.slice(-this.config.preserveRecentCount);
    const recentTokens = recentMessages.reduce((sum, m) => sum + m.tokenCount, 0);

    // Check if we need compression
    const totalTokens = scoredMessages.reduce((sum, m) => sum + m.tokenCount, 0);
    const threshold = budget * this.config.compressionThreshold;

    if (totalTokens + tokenCount > threshold) {
      compressed = true;

      // Try to fit older messages within remaining budget
      const remainingBudget = budget - tokenCount - recentTokens;
      const olderMessages = scoredMessages.slice(0, -this.config.preserveRecentCount);

      // Add older messages that fit
      let usedTokens = 0;
      for (const msg of olderMessages) {
        if (usedTokens + msg.tokenCount <= remainingBudget) {
          result.push(msg);
          usedTokens += msg.tokenCount;
        } else {
          // Summarize remaining older messages
          const remaining = olderMessages.slice(olderMessages.indexOf(msg));
          if (remaining.length > 0) {
            const summary = this.summarizeMessages(remaining);
            const summaryTokens = estimateTokens(summary);
            if (usedTokens + summaryTokens <= remainingBudget) {
              result.push({
                id: `summary_${Date.now()}`,
                role: "system",
                content: `[Earlier conversation summary]: ${summary}`,
                timestamp: new Date().toISOString(),
                tokenCount: summaryTokens,
              });
            }
          }
          break;
        }
      }
    } else {
      // All messages fit
      result.push(...scoredMessages);
    }

    // Always add recent messages
    result.push(...recentMessages);

    // Recalculate total
    const finalTokenCount = result.reduce((sum, m) => sum + (m.tokenCount || estimateTokens(m.content)), 0);

    return {
      context: result,
      tokenCount: finalTokenCount,
      compressed,
    };
  }

  /**
   * Summarize a batch of messages into a brief summary
   */
  private summarizeMessages(messages: ContextMessage[]): string {
    const keyPoints: string[] = [];
    for (const msg of messages) {
      const preview = msg.content.substring(0, 100).replace(/\n/g, " ");
      keyPoints.push(`${msg.role}: ${preview}${msg.content.length > 100 ? "..." : ""}`);
    }
    return keyPoints.join(" | ");
  }

  /**
   * Count tokens for a set of messages
   */
  countTokens(messages: ContextMessage[]): TokenCountResult {
    const byRole: Record<string, number> = {};
    const byMessage = new Map<string, number>();
    let total = 0;

    for (const msg of messages) {
      const count = msg.tokenCount || estimateTokens(msg.content);
      byRole[msg.role] = (byRole[msg.role] || 0) + count;
      byMessage.set(msg.id, count);
      total += count;
    }

    return { total, byRole, byMessage };
  }

  /**
   * Check if messages exceed token budget
   */
  isOverBudget(messages: ContextMessage[], budget?: number): boolean {
    const limit = budget || this.config.maxTokens;
    const { total } = this.countTokens(messages);
    return total > limit;
  }

  // ============================================================
  // Context Snapshots
  // ============================================================

  /**
   * Create a snapshot of current context
   */
  createSnapshot(
    sessionId: string,
    messages: ContextMessage[],
    metadata?: Record<string, any>
  ): ContextSnapshot {
    const id = `snap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const tokenCount = this.countTokens(messages).total;

    const snapshot: ContextSnapshot = {
      id,
      sessionId,
      timestamp: new Date().toISOString(),
      messages: [...messages],
      tokenCount,
      metadata: metadata || {},
    };

    this.snapshots.set(id, snapshot);
    this.saveSnapshot(snapshot);

    this.emit("snapshot-created", snapshot);
    return snapshot;
  }

  /**
   * Get a snapshot by ID
   */
  getSnapshot(id: string): ContextSnapshot | undefined {
    return this.snapshots.get(id);
  }

  /**
   * List snapshots for a session
   */
  listSnapshots(sessionId?: string): ContextSnapshot[] {
    let results = Array.from(this.snapshots.values());
    if (sessionId) {
      results = results.filter((s) => s.sessionId === sessionId);
    }
    return results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /**
   * Restore context from snapshot
   */
  restoreSnapshot(id: string): { success: boolean; messages?: ContextMessage[]; error?: string } {
    const snapshot = this.snapshots.get(id);
    if (!snapshot) {
      return { success: false, error: `Snapshot "${id}" not found` };
    }

    return { success: true, messages: [...snapshot.messages] };
  }

  /**
   * Delete a snapshot
   */
  deleteSnapshot(id: string): { success: boolean; error?: string } {
    const snapshot = this.snapshots.get(id);
    if (!snapshot) {
      return { success: false, error: `Snapshot "${id}" not found` };
    }

    this.snapshots.delete(id);

    const filePath = path.join(this.snapshotsDir, `${id}.json`);
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (err) {
      console.warn(`[ContextManager] Failed to delete snapshot file:`, err);
    }

    return { success: true };
  }

  private saveSnapshot(snapshot: ContextSnapshot): void {
    try {
      const filePath = path.join(this.snapshotsDir, `${snapshot.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf-8");
    } catch (err) {
      console.warn(`[ContextManager] Failed to save snapshot ${snapshot.id}:`, err);
    }
  }

  // ============================================================
  // Long-term Memory
  // ============================================================

  /**
   * Store a memory entry
   */
  storeMemory(
    content: string,
    options: {
      category?: MemoryEntry["category"];
      sessionId?: string;
      tags?: string[];
      confidence?: number;
      source?: string;
    } = {}
  ): MemoryEntry {
    const id = `mem_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const entry: MemoryEntry = {
      id,
      content,
      category: options.category || "fact",
      sessionId: options.sessionId,
      createdAt: now,
      updatedAt: now,
      accessCount: 0,
      lastAccessed: now,
      tags: options.tags || [],
      confidence: options.confidence ?? 0.8,
      source: options.source,
    };

    this.memories.set(id, entry);
    this.saveMemoryIndex();

    this.emit("memory-stored", entry);
    return entry;
  }

  /**
   * Retrieve memories matching query
   */
  retrieveMemories(query: MemoryQuery = {}): MemoryEntry[] {
    let results = Array.from(this.memories.values());

    if (query.category) {
      const categories = Array.isArray(query.category) ? query.category : [query.category];
      results = results.filter((m) => categories.includes(m.category));
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter((m) => query.tags!.some((tag) => m.tags.includes(tag)));
    }

    if (query.sessionId) {
      results = results.filter((m) => m.sessionId === query.sessionId);
    }

    if (query.minConfidence !== undefined) {
      results = results.filter((m) => m.confidence >= query.minConfidence!);
    }

    if (query.query) {
      const lower = query.query.toLowerCase();
      results = results.filter(
        (m) =>
          m.content.toLowerCase().includes(lower) ||
          m.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }

    // Sort by relevance (confidence * recency)
    results.sort((a, b) => {
      const scoreA = a.confidence * this.recencyScore(a.lastAccessed);
      const scoreB = b.confidence * this.recencyScore(b.lastAccessed);
      return scoreB - scoreA;
    });

    const limit = query.limit || 20;
    const final = results.slice(0, limit);

    // Update access stats
    for (const mem of final) {
      mem.accessCount++;
      mem.lastAccessed = new Date().toISOString();
    }

    if (final.length > 0) {
      this.saveMemoryIndex();
    }

    return final;
  }

  /**
   * Calculate recency score (0-1, higher = more recent)
   */
  private recencyScore(lastAccessed: string): number {
    const now = Date.now();
    const last = new Date(lastAccessed).getTime();
    const daysAgo = (now - last) / (1000 * 60 * 60 * 24);
    return Math.max(0.1, Math.exp(-daysAgo / 30)); // Decay over 30 days
  }

  /**
   * Get a memory by ID
   */
  getMemory(id: string): MemoryEntry | undefined {
    const mem = this.memories.get(id);
    if (mem) {
      mem.accessCount++;
      mem.lastAccessed = new Date().toISOString();
    }
    return mem;
  }

  /**
   * Update a memory entry
   */
  updateMemory(
    id: string,
    updates: Partial<Omit<MemoryEntry, "id" | "createdAt">>
  ): { success: boolean; error?: string } {
    const mem = this.memories.get(id);
    if (!mem) {
      return { success: false, error: `Memory "${id}" not found` };
    }

    Object.assign(mem, updates, { updatedAt: new Date().toISOString() });
    this.saveMemoryIndex();

    this.emit("memory-updated", mem);
    return { success: true };
  }

  /**
   * Delete a memory entry
   */
  deleteMemory(id: string): { success: boolean; error?: string } {
    if (!this.memories.has(id)) {
      return { success: false, error: `Memory "${id}" not found` };
    }

    this.memories.delete(id);
    this.saveMemoryIndex();

    this.emit("memory-deleted", id);
    return { success: true };
  }

  /**
   * Extract memories from a conversation
   */
  extractMemoriesFromMessages(
    messages: ContextMessage[],
    sessionId?: string
  ): MemoryEntry[] {
    const extracted: MemoryEntry[] = [];

    for (const msg of messages) {
      // Simple extraction: look for declarative statements
      const sentences = msg.content.split(/[.!?。！？]/).filter((s) => s.trim().length > 10);

      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        // Heuristic: statements about preferences, facts, entities
        if (
          trimmed.includes("like") ||
          trimmed.includes("prefer") ||
          trimmed.includes("is a") ||
          trimmed.includes("called") ||
          trimmed.includes("name is") ||
          trimmed.includes("喜欢") ||
          trimmed.includes("叫") ||
          trimmed.includes("是")
        ) {
          const entry = this.storeMemory(trimmed, {
            category: "fact",
            sessionId,
            confidence: 0.6,
            source: `message:${msg.id}`,
          });
          extracted.push(entry);
        }
      }
    }

    return extracted;
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    totalMemories: number;
    byCategory: Record<string, number>;
    byTag: Record<string, number>;
    averageConfidence: number;
  } {
    const memories = Array.from(this.memories.values());
    const byCategory: Record<string, number> = {};
    const byTag: Record<string, number> = {};
    let totalConfidence = 0;

    for (const mem of memories) {
      byCategory[mem.category] = (byCategory[mem.category] || 0) + 1;
      for (const tag of mem.tags) {
        byTag[tag] = (byTag[tag] || 0) + 1;
      }
      totalConfidence += mem.confidence;
    }

    return {
      totalMemories: memories.length,
      byCategory,
      byTag,
      averageConfidence: memories.length > 0 ? totalConfidence / memories.length : 0,
    };
  }

  // ============================================================
  // Persistence
  // ============================================================

  private saveMemoryIndex(): void {
    try {
      const index = {
        updatedAt: new Date().toISOString(),
        memories: Array.from(this.memories.values()),
      };
      fs.writeFileSync(this.memoryIndexPath, JSON.stringify(index, null, 2), "utf-8");
    } catch (err) {
      console.warn("[ContextManager] Failed to save memory index:", err);
    }
  }

  private loadMemories(): void {
    try {
      if (!fs.existsSync(this.memoryIndexPath)) return;
      const data = JSON.parse(fs.readFileSync(this.memoryIndexPath, "utf-8"));
      if (data.memories) {
        for (const mem of data.memories) {
          this.memories.set(mem.id, mem);
        }
      }
    } catch (err) {
      console.warn("[ContextManager] Failed to load memories:", err);
    }
  }

  // ============================================================
  // Config
  // ============================================================

  updateConfig(updates: Partial<ContextConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit("config-updated", this.config);
  }

  getConfig(): ContextConfig {
    return { ...this.config };
  }

  // ============================================================
  // Cleanup
  // ============================================================

  destroy(): void {
    this.saveMemoryIndex();
    this.removeAllListeners();
  }
}
