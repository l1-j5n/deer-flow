/**
 * DeerFlow Electron - Conversation Memory Engine
 *
 * Advanced conversation analysis and long-term memory extraction:
 * - Automatic topic extraction from conversations
 * - Entity extraction with Knowledge Graph integration
 * - Conversation summarization (multi-level depth)
 * - Cross-session memory linking and retrieval
 * - Memory importance scoring and decay
 * - Semantic memory search
 *
 * Integrates with KnowledgeGraphManager and ContextManager.
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export interface ConversationSegment {
  id: string;
  sessionId: string;
  startIndex: number;
  endIndex: number;
  speaker: string;
  content: string;
  timestamp: string;
  tokens: number;
}

export interface ExtractedTopic {
  id: string;
  name: string;
  keywords: string[];
  confidence: number;
  firstMentionedAt: string;
  lastMentionedAt: string;
  mentionCount: number;
  relatedTopics: string[];
}

export interface ConversationSummary {
  id: string;
  sessionId: string;
  level: "brief" | "detailed" | "comprehensive";
  content: string;
  topics: string[];
  keyEntities: string[];
  actionItems: string[];
  decisions: string[];
  createdAt: string;
  tokenCount: number;
}

export interface MemoryEntry {
  id: string;
  type: "fact" | "preference" | "relationship" | "event" | "concept";
  content: string;
  sourceSessionId: string;
  sourceSegmentId?: string;
  confidence: number;
  importance: number; // 0-1, auto-calculated
  createdAt: string;
  updatedAt?: string;
  lastAccessed: string;
  accessCount: number;
  tags: string[];
  relatedMemoryIds: string[];
  decayFactor: number; // How quickly importance decays
}

export interface MemoryQuery {
  type?: MemoryEntry["type"] | MemoryEntry["type"][];
  tags?: string[];
  search?: string;
  minConfidence?: number;
  minImportance?: number;
  since?: string;
  limit?: number;
  sessionId?: string;
}

export interface MemoryStats {
  totalMemories: number;
  byType: Record<string, number>;
  averageImportance: number;
  averageConfidence: number;
  totalAccesses: number;
  recentlyCreated: number;
  recentlyAccessed: number;
  topTopics: Array<{ topic: string; count: number }>;
}

export interface MemoryConfig {
  autoExtract: boolean;
  minConfidenceThreshold: number;
  importanceDecayRate: number; // per day
  maxMemories: number;
  summaryDepth: "brief" | "detailed" | "comprehensive";
  enableCrossLinking: boolean;
  extractionInterval: number; // messages between extractions
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: MemoryConfig = {
  autoExtract: true,
  minConfidenceThreshold: 0.6,
  importanceDecayRate: 0.05,
  maxMemories: 5000,
  summaryDepth: "detailed",
  enableCrossLinking: true,
  extractionInterval: 5,
};

// ============================================================
// Conversation Memory Engine
// ============================================================

const MEMORY_DIR = "conversation-memory";
const MEMORIES_FILE = "memories.json";
const SUMMARIES_FILE = "summaries.json";
const TOPICS_FILE = "topics.json";

export class ConversationMemoryEngine extends EventEmitter {
  private projectRoot: string;
  private memoryDir: string;
  private memories: Map<string, MemoryEntry> = new Map();
  private summaries: Map<string, ConversationSummary> = new Map();
  private topics: Map<string, ExtractedTopic> = new Map();
  private config: MemoryConfig;
  private messageCounter: Map<string, number> = new Map(); // sessionId -> count
  private dirty = false;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(projectRoot: string, config?: Partial<MemoryConfig>) {
    super();
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.memoryDir = path.join(projectRoot, ".deerflow", MEMORY_DIR);
    this.ensureDirectories();
    this.loadData();
    this.startAutoSave();
  }

  // ============================================================
  // Memory Extraction
  // ============================================================

  /**
   * Process a conversation segment for memory extraction
   */
  processSegment(segment: ConversationSegment): MemoryEntry[] {
    const extracted: MemoryEntry[] = [];

    if (!this.config.autoExtract) return extracted;

    // Update message counter
    const count = (this.messageCounter.get(segment.sessionId) || 0) + 1;
    this.messageCounter.set(segment.sessionId, count);

    // Extract facts using heuristics
    const facts = this.extractFacts(segment);
    for (const fact of facts) {
      const memory = this.createMemory(fact, segment);
      if (memory.confidence >= this.config.minConfidenceThreshold) {
        this.memories.set(memory.id, memory);
        extracted.push(memory);
        this.emit("memory:extracted", memory);
      }
    }

    // Extract topics
    this.extractTopics(segment);

    // Periodic summarization
    if (count % this.config.extractionInterval === 0) {
      this.emit("segment:batch", segment.sessionId, count);
    }

    this.dirty = true;
    return extracted;
  }

  /**
   * Extract facts from a segment using heuristic patterns
   */
  private extractFacts(segment: ConversationSegment): Array<{
    type: MemoryEntry["type"];
    content: string;
    confidence: number;
    tags: string[];
  }> {
    const facts: Array<{ type: MemoryEntry["type"]; content: string; confidence: number; tags: string[] }> = [];
    const content = segment.content;
    const lower = content.toLowerCase();

    // Preference patterns
    const preferencePatterns = [
      /i (?:like|love|prefer|enjoy|hate|dislike) (.+)/i,
      /my favorite .+ is (.+)/i,
      /i (?:always|usually|never) (.+)/i,
    ];
    for (const pattern of preferencePatterns) {
      const match = content.match(pattern);
      if (match) {
        facts.push({
          type: "preference",
          content: match[0],
          confidence: 0.75,
          tags: ["preference", "user"],
        });
      }
    }

    // Fact patterns (definitions, statements)
    const factPatterns = [
      /(.+?) (?:is|are|was|were) (.+)/i,
      /(.+?) means (.+)/i,
    ];
    for (const pattern of factPatterns) {
      const match = content.match(pattern);
      if (match && match[1].length > 3 && match[2].length > 3) {
        facts.push({
          type: "fact",
          content: `${match[1].trim()} is ${match[2].trim()}`,
          confidence: 0.6,
          tags: ["fact"],
        });
      }
    }

    // Relationship patterns
    const relationPatterns = [
      /(.+?) (?:works for|is part of|belongs to|is related to) (.+)/i,
      /(.+?) and (.+?) (?:are|work|collaborate)/i,
    ];
    for (const pattern of relationPatterns) {
      const match = content.match(pattern);
      if (match) {
        facts.push({
          type: "relationship",
          content: match[0],
          confidence: 0.65,
          tags: ["relationship"],
        });
      }
    }

    // Action items / decisions
    if (lower.includes("decided") || lower.includes("decision") || lower.includes("agreed")) {
      facts.push({
        type: "event",
        content: content.slice(0, 200),
        confidence: 0.7,
        tags: ["decision", "event"],
      });
    }

    // Concept extraction (capitalized phrases)
    const conceptMatches = content.match(/\b[A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+\b/g);
    if (conceptMatches) {
      for (const concept of conceptMatches.slice(0, 3)) {
        if (concept.length > 5 && concept.length < 50) {
          facts.push({
            type: "concept",
            content: concept,
            confidence: 0.55,
            tags: ["concept"],
          });
        }
      }
    }

    return facts;
  }

  /**
   * Create a memory entry from extracted fact
   */
  private createMemory(
    fact: { type: MemoryEntry["type"]; content: string; confidence: number; tags: string[] },
    segment: ConversationSegment
  ): MemoryEntry {
    const importance = this.calculateImportance(fact);

    return {
      id: this.generateId("mem"),
      type: fact.type,
      content: fact.content,
      sourceSessionId: segment.sessionId,
      sourceSegmentId: segment.id,
      confidence: fact.confidence,
      importance,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      accessCount: 0,
      tags: [...fact.tags, segment.speaker],
      relatedMemoryIds: [],
      decayFactor: 0.02,
    };
  }

  /**
   * Calculate importance score for a memory
   */
  private calculateImportance(fact: { type: MemoryEntry["type"]; content: string; confidence: number }): number {
    let score = fact.confidence;

    // Type-based weighting
    const typeWeights: Record<string, number> = {
      preference: 0.9,
      relationship: 0.8,
      event: 0.75,
      fact: 0.6,
      concept: 0.5,
    };
    score *= typeWeights[fact.type] || 0.5;

    // Length bonus (concise is better)
    if (fact.content.length < 50) score *= 1.1;
    if (fact.content.length > 200) score *= 0.9;

    return Math.min(1, score);
  }

  // ============================================================
  // Topic Extraction
  // ============================================================

  /**
   * Extract topics from a segment
   */
  private extractTopics(segment: ConversationSegment): void {
    // Simple keyword extraction
    const words = segment.content
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 4 && !this.isStopWord(w));

    const wordFreq: Record<string, number> = {};
    for (const word of words) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }

    // Update or create topics
    for (const [word, freq] of Object.entries(wordFreq)) {
      if (freq < 2) continue;

      const existing = Array.from(this.topics.values()).find((t) => t.name === word);
      if (existing) {
        existing.mentionCount += freq;
        existing.lastMentionedAt = segment.timestamp;
        existing.confidence = Math.min(1, existing.confidence + 0.05);
      } else {
        const topic: ExtractedTopic = {
          id: this.generateId("topic"),
          name: word,
          keywords: [word],
          confidence: Math.min(1, freq * 0.1),
          firstMentionedAt: segment.timestamp,
          lastMentionedAt: segment.timestamp,
          mentionCount: freq,
          relatedTopics: [],
        };
        this.topics.set(topic.id, topic);
      }
    }
  }

  /**
   * Get topics for a session
   */
  getTopics(sessionId?: string, limit: number = 20): ExtractedTopic[] {
    let topics = Array.from(this.topics.values());

    if (sessionId) {
      // Filter by memories from this session
      const sessionMemories = Array.from(this.memories.values()).filter(
        (m) => m.sourceSessionId === sessionId
      );
      const sessionTags = new Set(sessionMemories.flatMap((m) => m.tags));
      topics = topics.filter((t) => sessionTags.has(t.name));
    }

    return topics
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, limit);
  }

  // ============================================================
  // Summarization
  // ============================================================

  /**
   * Generate a conversation summary
   */
  generateSummary(sessionId: string, segments: ConversationSegment[], level?: ConversationSummary["level"]): ConversationSummary {
    const summaryLevel = level || this.config.summaryDepth;

    // Group segments by speaker
    const bySpeaker: Record<string, string[]> = {};
    for (const seg of segments) {
      if (!bySpeaker[seg.speaker]) bySpeaker[seg.speaker] = [];
      bySpeaker[seg.speaker].push(seg.content);
    }

    let content = "";
    const topics = this.getTopics(sessionId, 10).map((t) => t.name);

    if (summaryLevel === "brief") {
      content = `Conversation with ${Object.keys(bySpeaker).join(", ")}. `;
      content += `Topics: ${topics.slice(0, 5).join(", ") || "general discussion"}. `;
      content += `${segments.length} messages exchanged.`;
    } else if (summaryLevel === "detailed") {
      content = `## Conversation Summary\n\n`;
      content += `**Participants:** ${Object.keys(bySpeaker).join(", ")}\n\n`;
      content += `**Topics:** ${topics.join(", ") || "general discussion"}\n\n`;
      content += `**Key Points:**\n`;

      // Extract key points from first and last few messages
      const keyMessages = [...segments.slice(0, 3), ...segments.slice(-3)];
      for (const msg of keyMessages) {
        content += `- ${msg.speaker}: ${msg.content.slice(0, 100)}${msg.content.length > 100 ? "..." : ""}\n`;
      }
    } else {
      // Comprehensive
      content = `## Comprehensive Conversation Summary\n\n`;
      content += `**Participants:** ${Object.keys(bySpeaker).join(", ")}\n`;
      content += `**Duration:** ${segments.length} messages\n`;
      content += `**Topics:** ${topics.join(", ") || "general discussion"}\n\n`;
      content += `**Full Exchange:**\n`;
      for (const seg of segments) {
        content += `${seg.speaker}: ${seg.content}\n\n`;
      }
    }

    // Extract action items and decisions
    const actionItems: string[] = [];
    const decisions: string[] = [];
    for (const seg of segments) {
      const lower = seg.content.toLowerCase();
      if (lower.includes("need to") || lower.includes("should") || lower.includes("will")) {
        actionItems.push(seg.content);
      }
      if (lower.includes("decided") || lower.includes("agreed") || lower.includes("conclusion")) {
        decisions.push(seg.content);
      }
    }

    const summary: ConversationSummary = {
      id: this.generateId("summary"),
      sessionId,
      level: summaryLevel,
      content,
      topics,
      keyEntities: topics.slice(0, 5),
      actionItems: actionItems.slice(0, 10),
      decisions: decisions.slice(0, 10),
      createdAt: new Date().toISOString(),
      tokenCount: content.length / 4, // Rough estimate
    };

    this.summaries.set(summary.id, summary);
    this.dirty = true;

    this.emit("summary:created", summary);
    return summary;
  }

  /**
   * Get summary for a session
   */
  getSummary(sessionId: string): ConversationSummary | null {
    const summaries = Array.from(this.summaries.values())
      .filter((s) => s.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return summaries[0] || null;
  }

  // ============================================================
  // Memory Retrieval
  // ============================================================

  /**
   * Query memories with filtering
   */
  queryMemories(query: MemoryQuery = {}): MemoryEntry[] {
    let results = Array.from(this.memories.values());

    // Apply decay to importance
    results = results.map((m) => this.applyDecay(m));

    if (query.type) {
      const types = Array.isArray(query.type) ? query.type : [query.type];
      results = results.filter((m) => types.includes(m.type));
    }

    if (query.tags) {
      results = results.filter((m) => query.tags!.some((t) => m.tags.includes(t)));
    }

    if (query.search) {
      const lower = query.search.toLowerCase();
      results = results.filter(
        (m) =>
          m.content.toLowerCase().includes(lower) || m.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }

    if (query.minConfidence !== undefined) {
      results = results.filter((m) => m.confidence >= query.minConfidence!);
    }

    if (query.minImportance !== undefined) {
      results = results.filter((m) => m.importance >= query.minImportance!);
    }

    if (query.since) {
      const since = new Date(query.since).getTime();
      results = results.filter((m) => new Date(m.createdAt).getTime() >= since);
    }

    if (query.sessionId) {
      results = results.filter((m) => m.sourceSessionId === query.sessionId);
    }

    // Sort by importance * confidence
    results.sort((a, b) => b.importance * b.confidence - a.importance * a.confidence);

    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    // Update access stats
    for (const memory of results) {
      memory.accessCount++;
      memory.lastAccessed = new Date().toISOString();
    }

    this.dirty = true;
    return results;
  }

  /**
   * Get memories relevant to a query string
   */
  getRelevantMemories(query: string, limit: number = 10): MemoryEntry[] {
    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3 && !this.isStopWord(w));

    let results = Array.from(this.memories.values()).map((m) => this.applyDecay(m));

    // Score by keyword match
    results = results
      .map((m) => {
        const contentWords = m.content.toLowerCase().split(/\s+/);
        const tagMatches = m.tags.filter((t) => keywords.some((k) => t.includes(k))).length;
        const contentMatches = contentWords.filter((w) => keywords.includes(w)).length;
        const score = (tagMatches * 2 + contentMatches) * m.importance * m.confidence;
        return { memory: m, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.memory);

    return results.slice(0, limit);
  }

  /**
   * Get memory by ID
   */
  getMemory(id: string): MemoryEntry | null {
    const memory = this.memories.get(id);
    if (memory) {
      memory.accessCount++;
      memory.lastAccessed = new Date().toISOString();
      this.dirty = true;
    }
    return memory || null;
  }

  /**
   * Update memory (e.g., increase importance)
   */
  updateMemory(id: string, updates: Partial<Pick<MemoryEntry, "importance" | "tags" | "relatedMemoryIds">>): boolean {
    const memory = this.memories.get(id);
    if (!memory) return false;

    if (updates.importance !== undefined) memory.importance = Math.min(1, updates.importance);
    if (updates.tags !== undefined) memory.tags = [...new Set([...memory.tags, ...updates.tags])];
    if (updates.relatedMemoryIds !== undefined) {
      memory.relatedMemoryIds = [...new Set([...memory.relatedMemoryIds, ...updates.relatedMemoryIds])];
    }

    memory.updatedAt = new Date().toISOString();
    this.dirty = true;
    return true;
  }

  /**
   * Delete a memory
   */
  deleteMemory(id: string): boolean {
    return this.memories.delete(id);
  }

  // ============================================================
  // Cross-Linking
  // ============================================================

  /**
   * Link related memories together
   */
  linkRelatedMemories(): number {
    if (!this.config.enableCrossLinking) return 0;

    const memories = Array.from(this.memories.values());
    let linksCreated = 0;

    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const a = memories[i];
        const b = memories[j];

        // Check for shared tags or content similarity
        const sharedTags = a.tags.filter((t) => b.tags.includes(t));
        const aWords = new Set(a.content.toLowerCase().split(/\s+/));
        const bWords = b.content.toLowerCase().split(/\s+/);
        const sharedWords = bWords.filter((w) => aWords.has(w) && w.length > 4).length;

        const similarity = sharedTags.length * 0.3 + sharedWords * 0.1;

        if (similarity >= 0.5) {
          if (!a.relatedMemoryIds.includes(b.id)) {
            a.relatedMemoryIds.push(b.id);
            linksCreated++;
          }
          if (!b.relatedMemoryIds.includes(a.id)) {
            b.relatedMemoryIds.push(a.id);
            linksCreated++;
          }
        }
      }
    }

    if (linksCreated > 0) {
      this.dirty = true;
      this.emit("memories:linked", linksCreated);
    }

    return linksCreated;
  }

  // ============================================================
  // Statistics
  // ============================================================

  getStats(): MemoryStats {
    const memories = Array.from(this.memories.values());
    const byType: Record<string, number> = {};
    let totalAccesses = 0;
    let totalImportance = 0;
    let totalConfidence = 0;

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    for (const m of memories) {
      byType[m.type] = (byType[m.type] || 0) + 1;
      totalAccesses += m.accessCount;
      totalImportance += m.importance;
      totalConfidence += m.confidence;
    }

    return {
      totalMemories: memories.length,
      byType,
      averageImportance: memories.length > 0 ? totalImportance / memories.length : 0,
      averageConfidence: memories.length > 0 ? totalConfidence / memories.length : 0,
      totalAccesses,
      recentlyCreated: memories.filter((m) => now - new Date(m.createdAt).getTime() < oneDay).length,
      recentlyAccessed: memories.filter((m) => now - new Date(m.lastAccessed).getTime() < oneDay).length,
      topTopics: Array.from(this.topics.values())
        .sort((a, b) => b.mentionCount - a.mentionCount)
        .slice(0, 10)
        .map((t) => ({ topic: t.name, count: t.mentionCount })),
    };
  }

  // ============================================================
  // Maintenance
  // ============================================================

  /**
   * Prune low-importance memories
   */
  pruneMemories(keepCount: number = this.config.maxMemories): number {
    if (this.memories.size <= keepCount) return 0;

    const memories = Array.from(this.memories.values()).map((m) => this.applyDecay(m));
    memories.sort((a, b) => b.importance * b.confidence - a.importance * a.confidence);

    const toKeep = new Set(memories.slice(0, keepCount).map((m) => m.id));
    let removed = 0;

    for (const id of this.memories.keys()) {
      if (!toKeep.has(id)) {
        this.memories.delete(id);
        removed++;
      }
    }

    if (removed > 0) {
      this.dirty = true;
      this.emit("memories:pruned", removed);
    }

    return removed;
  }

  // ============================================================
  // Helpers
  // ============================================================

  private applyDecay(memory: MemoryEntry): MemoryEntry {
    const daysSinceCreation =
      (Date.now() - new Date(memory.createdAt).getTime()) / (24 * 60 * 60 * 1000);
    const decay = Math.exp(-memory.decayFactor * daysSinceCreation);
    memory.importance = memory.importance * decay + memory.importance * (1 - decay) * 0.3; // Floor at 30%
    return memory;
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      "about", "above", "after", "again", "against", "all", "also", "am", "an", "and", "any", "are",
      "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
      "by", "can", "could", "did", "do", "does", "doing", "don", "down", "during", "each", "few",
      "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers",
      "himself", "his", "how", "into", "its", "itself", "just", "me", "more", "most", "my",
      "myself", "nor", "not", "now", "off", "once", "only", "or", "other", "our", "ours",
      "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than",
      "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they",
      "this", "those", "through", "too", "under", "until", "up", "very", "was", "we", "were",
      "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would",
      "you", "your", "yours", "yourself", "yourselves", "is", "was", "were", "being", "been",
    ]);
    return stopWords.has(word.toLowerCase());
  }

  // ============================================================
  // Persistence
  // ============================================================

  private ensureDirectories(): void {
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }
  }

  private startAutoSave(): void {
    this.saveTimer = setInterval(() => {
      if (this.dirty) this.saveData();
    }, 30000);
  }

  private saveData(): void {
    try {
      // Save memories
      const memoriesPath = path.join(this.memoryDir, MEMORIES_FILE);
      fs.writeFileSync(
        memoriesPath,
        JSON.stringify(
          { updatedAt: new Date().toISOString(), memories: Array.from(this.memories.values()) },
          null,
          2
        ),
        "utf-8"
      );

      // Save summaries
      const summariesPath = path.join(this.memoryDir, SUMMARIES_FILE);
      fs.writeFileSync(
        summariesPath,
        JSON.stringify(
          { updatedAt: new Date().toISOString(), summaries: Array.from(this.summaries.values()) },
          null,
          2
        ),
        "utf-8"
      );

      // Save topics
      const topicsPath = path.join(this.memoryDir, TOPICS_FILE);
      fs.writeFileSync(
        topicsPath,
        JSON.stringify(
          { updatedAt: new Date().toISOString(), topics: Array.from(this.topics.values()) },
          null,
          2
        ),
        "utf-8"
      );

      this.dirty = false;
    } catch (err) {
      console.warn("[ConversationMemory] Failed to save data:", err);
    }
  }

  private loadData(): void {
    try {
      // Load memories
      const memoriesPath = path.join(this.memoryDir, MEMORIES_FILE);
      if (fs.existsSync(memoriesPath)) {
        const data = JSON.parse(fs.readFileSync(memoriesPath, "utf-8"));
        for (const mem of data.memories || []) {
          this.memories.set(mem.id, mem);
        }
      }

      // Load summaries
      const summariesPath = path.join(this.memoryDir, SUMMARIES_FILE);
      if (fs.existsSync(summariesPath)) {
        const data = JSON.parse(fs.readFileSync(summariesPath, "utf-8"));
        for (const sum of data.summaries || []) {
          this.summaries.set(sum.id, sum);
        }
      }

      // Load topics
      const topicsPath = path.join(this.memoryDir, TOPICS_FILE);
      if (fs.existsSync(topicsPath)) {
        const data = JSON.parse(fs.readFileSync(topicsPath, "utf-8"));
        for (const topic of data.topics || []) {
          this.topics.set(topic.id, topic);
        }
      }

      console.log(
        `[ConversationMemory] Loaded ${this.memories.size} memories, ${this.summaries.size} summaries, ${this.topics.size} topics`
      );
    } catch (err) {
      console.warn("[ConversationMemory] Failed to load data:", err);
    }
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
    this.saveData();
    this.removeAllListeners();
  }
}
