/**
 * DeerFlow Electron - Agent Reasoning Engine
 *
 * Provides structured reasoning capabilities for agent sessions:
 * - Chain-of-Thought (CoT) reasoning with step tracking
 * - ReAct pattern (Reasoning + Acting) implementation
 * - Multi-step planning with goal decomposition
 * - Reasoning trace persistence and replay
 * - Confidence scoring for reasoning steps
 * - Reasoning strategy selection (direct, cot, react, tree-of-thought)
 *
 * Integrates with AgentSessionManager for reasoning state
 * and EventBus for reasoning event publishing.
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export type ReasoningStrategy = "direct" | "cot" | "react" | "tot" | "reflection";

export type ReasoningStepType =
  | "thought"      // Internal reasoning step
  | "action"       // External action (tool call)
  | "observation"  // Result from action
  | "plan"         // Planning step
  | "reflection"   // Self-reflection/correction
  | "conclusion";  // Final answer

export interface ReasoningStep {
  id: string;
  type: ReasoningStepType;
  content: string;
  timestamp: string;
  confidence: number; // 0-1
  metadata?: {
    toolName?: string;
    toolArgs?: Record<string, any>;
    toolResult?: any;
    durationMs?: number;
    tokenCount?: number;
  };
}

export interface ReasoningTrace {
  id: string;
  sessionId: string;
  strategy: ReasoningStrategy;
  goal: string;
  steps: ReasoningStep[];
  status: "active" | "completed" | "failed" | "paused";
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  totalSteps: number;
  finalAnswer?: string;
  metrics: {
    totalThoughts: number;
    totalActions: number;
    totalObservations: number;
    averageConfidence: number;
    totalDurationMs: number;
  };
}

export interface ReasoningConfig {
  defaultStrategy: ReasoningStrategy;
  maxSteps: number;
  minConfidence: number;
  enableReflection: boolean;
  enablePlanning: boolean;
  maxReflectionDepth: number;
}

export interface PlanNode {
  id: string;
  description: string;
  dependencies: string[];
  status: "pending" | "in_progress" | "completed" | "failed";
  estimatedTokens?: number;
  result?: string;
}

export interface ReasoningPlan {
  id: string;
  traceId: string;
  goal: string;
  nodes: PlanNode[];
  currentNodeId?: string;
  createdAt: string;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: ReasoningConfig = {
  defaultStrategy: "react",
  maxSteps: 20,
  minConfidence: 0.6,
  enableReflection: true,
  enablePlanning: true,
  maxReflectionDepth: 3,
};

// ============================================================
// Agent Reasoning Engine
// ============================================================

const REASONING_DIR = "agent-reasoning";
const TRACES_INDEX = "reasoning-traces.json";

export class AgentReasoningEngine extends EventEmitter {
  private projectRoot: string;
  private traces: Map<string, ReasoningTrace> = new Map();
  private plans: Map<string, ReasoningPlan> = new Map();
  private config: ReasoningConfig;
  private reasoningDir: string;

  constructor(projectRoot: string, config?: Partial<ReasoningConfig>) {
    super();
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.reasoningDir = path.join(projectRoot, ".deerflow", REASONING_DIR);
    this.ensureDirectories();
    this.loadTraces();
  }

  // ============================================================
  // Trace Management
  // ============================================================

  /**
   * Start a new reasoning trace
   */
  startTrace(sessionId: string, goal: string, strategy?: ReasoningStrategy): ReasoningTrace {
    const trace: ReasoningTrace = {
      id: this.generateId(),
      sessionId,
      strategy: strategy || this.config.defaultStrategy,
      goal,
      steps: [],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalSteps: 0,
      metrics: {
        totalThoughts: 0,
        totalActions: 0,
        totalObservations: 0,
        averageConfidence: 0,
        totalDurationMs: 0,
      },
    };

    this.traces.set(trace.id, trace);
    this.saveTrace(trace);

    this.emit("trace:started", trace);
    return trace;
  }

  /**
   * Add a reasoning step to a trace
   */
  addStep(traceId: string, step: Omit<ReasoningStep, "id" | "timestamp">): ReasoningStep | null {
    const trace = this.traces.get(traceId);
    if (!trace || trace.status !== "active") return null;

    const fullStep: ReasoningStep = {
      ...step,
      id: `${traceId}-step-${trace.steps.length}`,
      timestamp: new Date().toISOString(),
    };

    trace.steps.push(fullStep);
    trace.totalSteps = trace.steps.length;
    trace.updatedAt = new Date().toISOString();

    // Update metrics
    this.updateTraceMetrics(trace);

    // Check max steps
    if (trace.totalSteps >= this.config.maxSteps) {
      trace.status = "completed";
      trace.completedAt = new Date().toISOString();
      this.emit("trace:max-steps-reached", trace);
    }

    this.saveTrace(trace);
    this.emit("trace:step-added", trace, fullStep);

    return fullStep;
  }

  /**
   * Add a thought step
   */
  addThought(traceId: string, content: string, confidence?: number): ReasoningStep | null {
    return this.addStep(traceId, {
      type: "thought",
      content,
      confidence: confidence ?? 0.8,
    });
  }

  /**
   * Add an action step (tool call)
   */
  addAction(traceId: string, content: string, toolName: string, toolArgs: Record<string, any>): ReasoningStep | null {
    return this.addStep(traceId, {
      type: "action",
      content,
      confidence: 1.0,
      metadata: { toolName, toolArgs },
    });
  }

  /**
   * Add an observation step (tool result)
   */
  addObservation(traceId: string, content: string, toolResult?: any): ReasoningStep | null {
    return this.addStep(traceId, {
      type: "observation",
      content,
      confidence: 1.0,
      metadata: { toolResult },
    });
  }

  /**
   * Add a reflection step
   */
  addReflection(traceId: string, content: string, confidence?: number): ReasoningStep | null {
    return this.addStep(traceId, {
      type: "reflection",
      content,
      confidence: confidence ?? 0.7,
    });
  }

  /**
   * Complete a trace with final answer
   */
  completeTrace(traceId: string, finalAnswer: string): ReasoningTrace | null {
    const trace = this.traces.get(traceId);
    if (!trace) return null;

    trace.status = "completed";
    trace.finalAnswer = finalAnswer;
    trace.completedAt = new Date().toISOString();
    trace.updatedAt = new Date().toISOString();

    // Calculate total duration
    const startTime = new Date(trace.createdAt).getTime();
    trace.metrics.totalDurationMs = Date.now() - startTime;

    this.saveTrace(trace);
    this.emit("trace:completed", trace);
    return trace;
  }

  /**
   * Fail a trace
   */
  failTrace(traceId: string, error: string): ReasoningTrace | null {
    const trace = this.traces.get(traceId);
    if (!trace) return null;

    trace.status = "failed";
    trace.updatedAt = new Date().toISOString();

    this.addStep(traceId, {
      type: "reflection",
      content: `Failed: ${error}`,
      confidence: 0,
    });

    this.saveTrace(trace);
    this.emit("trace:failed", trace, error);
    return trace;
  }

  /**
   * Pause a trace
   */
  pauseTrace(traceId: string): ReasoningTrace | null {
    const trace = this.traces.get(traceId);
    if (!trace) return null;

    trace.status = "paused";
    trace.updatedAt = new Date().toISOString();
    this.saveTrace(trace);
    this.emit("trace:paused", trace);
    return trace;
  }

  /**
   * Resume a paused trace
   */
  resumeTrace(traceId: string): ReasoningTrace | null {
    const trace = this.traces.get(traceId);
    if (!trace || trace.status !== "paused") return null;

    trace.status = "active";
    trace.updatedAt = new Date().toISOString();
    this.saveTrace(trace);
    this.emit("trace:resumed", trace);
    return trace;
  }

  // ============================================================
  // Plan Management
  // ============================================================

  /**
   * Create a plan for a trace
   */
  createPlan(traceId: string, goal: string, nodes: Omit<PlanNode, "id" | "status">[]): ReasoningPlan | null {
    const trace = this.traces.get(traceId);
    if (!trace) return null;

    const plan: ReasoningPlan = {
      id: this.generateId(),
      traceId,
      goal,
      nodes: nodes.map((n, i) => ({
        ...n,
        id: `${traceId}-plan-${i}`,
        status: "pending",
      })),
      createdAt: new Date().toISOString(),
    };

    this.plans.set(plan.id, plan);

    // Add plan step to trace
    this.addStep(traceId, {
      type: "plan",
      content: `Plan created: ${goal} (${nodes.length} steps)`,
      confidence: 0.9,
    });

    this.emit("plan:created", plan);
    return plan;
  }

  /**
   * Update plan node status
   */
  updatePlanNode(planId: string, nodeId: string, status: PlanNode["status"], result?: string): boolean {
    const plan = this.plans.get(planId);
    if (!plan) return false;

    const node = plan.nodes.find((n) => n.id === nodeId);
    if (!node) return false;

    node.status = status;
    if (result) node.result = result;

    if (status === "in_progress") {
      plan.currentNodeId = nodeId;
    }

    this.emit("plan:updated", plan, node);
    return true;
  }

  /**
   * Get plan for a trace
   */
  getPlanByTrace(traceId: string): ReasoningPlan | null {
    for (const plan of this.plans.values()) {
      if (plan.traceId === traceId) return plan;
    }
    return null;
  }

  // ============================================================
  // Query & Retrieval
  // ============================================================

  /**
   * Get a trace by ID
   */
  getTrace(id: string): ReasoningTrace | null {
    return this.traces.get(id) || null;
  }

  /**
   * List all traces with optional filtering
   */
  listTraces(filter?: { sessionId?: string; strategy?: ReasoningStrategy; status?: string }): ReasoningTrace[] {
    let traces = Array.from(this.traces.values());

    if (filter?.sessionId) {
      traces = traces.filter((t) => t.sessionId === filter.sessionId);
    }
    if (filter?.strategy) {
      traces = traces.filter((t) => t.strategy === filter.strategy);
    }
    if (filter?.status) {
      traces = traces.filter((t) => t.status === filter.status);
    }

    return traces.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get active trace for a session
   */
  getActiveTrace(sessionId: string): ReasoningTrace | null {
    for (const trace of this.traces.values()) {
      if (trace.sessionId === sessionId && trace.status === "active") {
        return trace;
      }
    }
    return null;
  }

  /**
   * Search traces by goal content
   */
  searchTraces(query: string): ReasoningTrace[] {
    const lower = query.toLowerCase();
    return Array.from(this.traces.values()).filter(
      (t) =>
        t.goal.toLowerCase().includes(lower) ||
        t.steps.some((s) => s.content.toLowerCase().includes(lower))
    );
  }

  /**
   * Get reasoning statistics
   */
  getStats(): {
    totalTraces: number;
    activeTraces: number;
    completedTraces: number;
    failedTraces: number;
    byStrategy: Record<string, number>;
    averageSteps: number;
    averageConfidence: number;
  } {
    const traces = Array.from(this.traces.values());
    const byStrategy: Record<string, number> = {};

    for (const t of traces) {
      byStrategy[t.strategy] = (byStrategy[t.strategy] || 0) + 1;
    }

    return {
      totalTraces: traces.length,
      activeTraces: traces.filter((t) => t.status === "active").length,
      completedTraces: traces.filter((t) => t.status === "completed").length,
      failedTraces: traces.filter((t) => t.status === "failed").length,
      byStrategy,
      averageSteps: traces.length > 0 ? traces.reduce((sum, t) => sum + t.totalSteps, 0) / traces.length : 0,
      averageConfidence: traces.length > 0
        ? traces.reduce((sum, t) => sum + t.metrics.averageConfidence, 0) / traces.length
        : 0,
    };
  }

  // ============================================================
  // Export / Import
  // ============================================================

  /**
   * Export a trace to JSON
   */
  exportTrace(id: string): { success: boolean; data?: any; error?: string } {
    const trace = this.traces.get(id);
    if (!trace) return { success: false, error: "Trace not found" };

    return {
      success: true,
      data: {
        ...trace,
        steps: trace.steps.map((s) => ({
          ...s,
          metadata: s.metadata || undefined,
        })),
      },
    };
  }

  /**
   * Import a trace from JSON
   */
  importTrace(data: any): { success: boolean; trace?: ReasoningTrace; error?: string } {
    try {
      if (!data.id || !data.goal || !Array.isArray(data.steps)) {
        return { success: false, error: "Invalid trace data" };
      }

      const trace: ReasoningTrace = {
        ...data,
        steps: data.steps.map((s: any) => ({
          ...s,
          metadata: s.metadata || undefined,
        })),
      };

      this.traces.set(trace.id, trace);
      this.saveTrace(trace);
      return { success: true, trace };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ============================================================
  // Configuration
  // ============================================================

  getConfig(): ReasoningConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ReasoningConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit("config:updated", this.config);
  }

  // ============================================================
  // Persistence
  // ============================================================

  private ensureDirectories(): void {
    if (!fs.existsSync(this.reasoningDir)) {
      fs.mkdirSync(this.reasoningDir, { recursive: true });
    }
  }

  private getTracePath(traceId: string): string {
    return path.join(this.reasoningDir, `trace-${traceId}.json`);
  }

  private saveTrace(trace: ReasoningTrace): void {
    try {
      const tracePath = this.getTracePath(trace.id);
      fs.writeFileSync(tracePath, JSON.stringify(trace, null, 2), "utf-8");
      this.saveIndex();
    } catch (err) {
      console.warn("[AgentReasoning] Failed to save trace:", err);
    }
  }

  private saveIndex(): void {
    try {
      const indexPath = path.join(this.reasoningDir, TRACES_INDEX);
      const index = Array.from(this.traces.values()).map((t) => ({
        id: t.id,
        sessionId: t.sessionId,
        strategy: t.strategy,
        goal: t.goal,
        status: t.status,
        createdAt: t.createdAt,
        totalSteps: t.totalSteps,
      }));
      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");
    } catch (err) {
      console.warn("[AgentReasoning] Failed to save index:", err);
    }
  }

  private loadTraces(): void {
    try {
      const indexPath = path.join(this.reasoningDir, TRACES_INDEX);
      if (!fs.existsSync(indexPath)) return;

      const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      for (const entry of index) {
        const tracePath = this.getTracePath(entry.id);
        if (fs.existsSync(tracePath)) {
          const trace = JSON.parse(fs.readFileSync(tracePath, "utf-8"));
          this.traces.set(trace.id, trace);
        }
      }
      console.log(`[AgentReasoning] Loaded ${this.traces.size} traces`);
    } catch (err) {
      console.warn("[AgentReasoning] Failed to load traces:", err);
    }
  }

  // ============================================================
  // Helpers
  // ============================================================

  private generateId(): string {
    return `reasoning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateTraceMetrics(trace: ReasoningTrace): void {
    const thoughts = trace.steps.filter((s) => s.type === "thought").length;
    const actions = trace.steps.filter((s) => s.type === "action").length;
    const observations = trace.steps.filter((s) => s.type === "observation").length;
    const confidences = trace.steps.map((s) => s.confidence).filter((c) => c > 0);

    trace.metrics = {
      totalThoughts: thoughts,
      totalActions: actions,
      totalObservations: observations,
      averageConfidence: confidences.length > 0
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length
        : 0,
      totalDurationMs: trace.metrics.totalDurationMs,
    };
  }

  /**
   * Destroy the engine and clean up
   */
  destroy(): void {
    this.saveIndex();
    this.removeAllListeners();
  }
}
