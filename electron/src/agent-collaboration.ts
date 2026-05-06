/**
 * DeerFlow Electron - Agent Collaboration Hub
 *
 * Multi-agent coordination system for complex task decomposition:
 * - Agent roles: coordinator, researcher, critic, executor, synthesizer
 * - Task decomposition with dependency tracking
 * - Inter-agent message passing protocol
 * - Consensus building for conflicting results
 * - Result aggregation and final synthesis
 * - Collaborative reasoning traces
 *
 * Integrates with AgentReasoningEngine, EventBus, and KnowledgeGraph.
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export type AgentRole = "coordinator" | "researcher" | "critic" | "executor" | "synthesizer" | "specialist";

export type CollaborationStatus = "forming" | "active" | "consensus" | "conflict" | "completed" | "failed";

export interface Collaborator {
  id: string;
  name: string;
  role: AgentRole;
  model?: string;
  capabilities: string[];
  status: "idle" | "working" | "waiting" | "error";
  currentTaskId?: string;
  messageCount: number;
  joinedAt: string;
}

export interface CollaborationTask {
  id: string;
  parentId?: string;
  title: string;
  description: string;
  assignedTo?: string; // collaborator ID
  dependencies: string[]; // task IDs
  status: "pending" | "in_progress" | "completed" | "failed" | "blocked";
  priority: number; // 1-10
  result?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedTokens?: number;
}

export interface AgentMessage {
  id: string;
  from: string;
  to?: string; // undefined = broadcast
  type: "task" | "result" | "question" | "answer" | "critique" | "consensus" | "system";
  content: string;
  payload?: any;
  timestamp: string;
  threadId: string;
}

export interface CollaborationSession {
  id: string;
  title: string;
  goal: string;
  status: CollaborationStatus;
  collaborators: Map<string, Collaborator>;
  tasks: Map<string, CollaborationTask>;
  messages: AgentMessage[];
  consensusThreshold: number; // 0.5 - 1.0
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  finalResult?: any;
  metadata: {
    totalMessages: number;
    totalTasks: number;
    completedTasks: number;
    conflictCount: number;
    consensusCount: number;
  };
}

export interface ConsensusProposal {
  id: string;
  taskId: string;
  proposedBy: string;
  content: any;
  votes: Map<string, "approve" | "reject" | "abstain">;
  status: "open" | "approved" | "rejected";
  createdAt: string;
  expiresAt: string;
}

export interface CollaborationConfig {
  maxCollaborators: number;
  maxTasks: number;
  consensusThreshold: number;
  messageHistoryLimit: number;
  autoAssignTasks: boolean;
  enableCritique: boolean;
  maxRounds: number;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: CollaborationConfig = {
  maxCollaborators: 5,
  maxTasks: 20,
  consensusThreshold: 0.66,
  messageHistoryLimit: 500,
  autoAssignTasks: true,
  enableCritique: true,
  maxRounds: 10,
};

// ============================================================
// Agent Collaboration Hub
// ============================================================

const COLLAB_DIR = "collaboration";
const SESSIONS_FILE = "sessions.json";

export class AgentCollaborationHub extends EventEmitter {
  private projectRoot: string;
  private collabDir: string;
  private sessions: Map<string, CollaborationSession> = new Map();
  private proposals: Map<string, ConsensusProposal> = new Map();
  private config: CollaborationConfig;

  constructor(projectRoot: string, config?: Partial<CollaborationConfig>) {
    super();
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.collabDir = path.join(projectRoot, ".deerflow", COLLAB_DIR);
    this.ensureDirectories();
    this.loadSessions();
  }

  // ============================================================
  // Session Management
  // ============================================================

  /**
   * Create a new collaboration session
   */
  createSession(title: string, goal: string, options?: { consensusThreshold?: number }): CollaborationSession {
    const session: CollaborationSession = {
      id: this.generateId("session"),
      title,
      goal,
      status: "forming",
      collaborators: new Map(),
      tasks: new Map(),
      messages: [],
      consensusThreshold: options?.consensusThreshold || this.config.consensusThreshold,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        totalMessages: 0,
        totalTasks: 0,
        completedTasks: 0,
        conflictCount: 0,
        consensusCount: 0,
      },
    };

    this.sessions.set(session.id, session);
    this.saveSession(session);

    this.emit("session:created", session);
    return session;
  }

  /**
   * Get a session by ID
   */
  getSession(id: string): CollaborationSession | null {
    return this.sessions.get(id) || null;
  }

  /**
   * List all sessions
   */
  listSessions(filter?: { status?: CollaborationStatus }): CollaborationSession[] {
    let sessions = Array.from(this.sessions.values());
    if (filter?.status) {
      sessions = sessions.filter((s) => s.status === filter.status);
    }
    return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * End a session
   */
  endSession(id: string, finalResult?: any): CollaborationSession | null {
    const session = this.sessions.get(id);
    if (!session) return null;

    session.status = "completed";
    session.completedAt = new Date().toISOString();
    session.finalResult = finalResult;
    session.updatedAt = new Date().toISOString();

    // Set all collaborators to idle
    for (const collaborator of session.collaborators.values()) {
      collaborator.status = "idle";
      collaborator.currentTaskId = undefined;
    }

    this.saveSession(session);
    this.emit("session:completed", session);
    return session;
  }

  /**
   * Delete a session
   */
  deleteSession(id: string): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;

    this.sessions.delete(id);
    this.saveSessionsIndex();

    this.emit("session:deleted", id);
    return true;
  }

  // ============================================================
  // Collaborator Management
  // ============================================================

  /**
   * Add a collaborator to a session
   */
  addCollaborator(
    sessionId: string,
    name: string,
    role: AgentRole,
    capabilities: string[],
    model?: string
  ): Collaborator | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (session.collaborators.size >= this.config.maxCollaborators) return null;

    const collaborator: Collaborator = {
      id: this.generateId("agent"),
      name,
      role,
      model,
      capabilities,
      status: "idle",
      messageCount: 0,
      joinedAt: new Date().toISOString(),
    };

    session.collaborators.set(collaborator.id, collaborator);
    session.updatedAt = new Date().toISOString();

    // If we have enough collaborators, move to active
    if (session.status === "forming" && session.collaborators.size >= 2) {
      session.status = "active";
    }

    this.saveSession(session);
    this.emit("collaborator:joined", session, collaborator);
    return collaborator;
  }

  /**
   * Remove a collaborator
   */
  removeCollaborator(sessionId: string, collaboratorId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const collaborator = session.collaborators.get(collaboratorId);
    if (!collaborator) return false;

    // Reassign any pending tasks
    for (const task of session.tasks.values()) {
      if (task.assignedTo === collaboratorId && task.status === "in_progress") {
        task.status = "pending";
        task.assignedTo = undefined;
      }
    }

    session.collaborators.delete(collaboratorId);
    session.updatedAt = new Date().toISOString();

    this.saveSession(session);
    this.emit("collaborator:left", session, collaboratorId);
    return true;
  }

  /**
   * Update collaborator status
   */
  updateCollaboratorStatus(
    sessionId: string,
    collaboratorId: string,
    status: Collaborator["status"],
    currentTaskId?: string
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const collaborator = session.collaborators.get(collaboratorId);
    if (!collaborator) return false;

    collaborator.status = status;
    if (currentTaskId !== undefined) {
      collaborator.currentTaskId = currentTaskId;
    }

    session.updatedAt = new Date().toISOString();
    this.saveSession(session);
    return true;
  }

  // ============================================================
  // Task Management
  // ============================================================

  /**
   * Create a task in a session
   */
  createTask(
    sessionId: string,
    title: string,
    description: string,
    options?: {
      parentId?: string;
      dependencies?: string[];
      priority?: number;
      assignedTo?: string;
    }
  ): CollaborationTask | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (session.tasks.size >= this.config.maxTasks) return null;

    const task: CollaborationTask = {
      id: this.generateId("task"),
      parentId: options?.parentId,
      title,
      description,
      assignedTo: options?.assignedTo,
      dependencies: options?.dependencies || [],
      status: "pending",
      priority: options?.priority || 5,
      startedAt: undefined,
      completedAt: undefined,
    };

    // Check if dependencies are met
    if (task.dependencies.length > 0) {
      const allMet = task.dependencies.every((depId) => {
        const dep = session.tasks.get(depId);
        return dep?.status === "completed";
      });
      if (!allMet) {
        task.status = "blocked";
      }
    }

    session.tasks.set(task.id, task);
    session.metadata.totalTasks++;
    session.updatedAt = new Date().toISOString();

    // Auto-assign if enabled and no assignee
    if (this.config.autoAssignTasks && !task.assignedTo) {
      this.autoAssignTask(session, task);
    }

    this.saveSession(session);
    this.emit("task:created", session, task);
    return task;
  }

  /**
   * Update task status
   */
  updateTask(
    sessionId: string,
    taskId: string,
    updates: Partial<Pick<CollaborationTask, "status" | "result" | "error" | "assignedTo">>
  ): CollaborationTask | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const task = session.tasks.get(taskId);
    if (!task) return null;

    const oldStatus = task.status;

    if (updates.status) {
      task.status = updates.status;
      if (updates.status === "in_progress" && !task.startedAt) {
        task.startedAt = new Date().toISOString();
      }
      if (updates.status === "completed") {
        task.completedAt = new Date().toISOString();
        session.metadata.completedTasks++;

        // Unblock dependent tasks
        this.unblockDependentTasks(session, taskId);
      }
    }

    if (updates.result !== undefined) task.result = updates.result;
    if (updates.error !== undefined) task.error = updates.error;
    if (updates.assignedTo !== undefined) task.assignedTo = updates.assignedTo;

    session.updatedAt = new Date().toISOString();

    this.saveSession(session);
    this.emit("task:updated", session, task, oldStatus);
    return task;
  }

  /**
   * Get tasks ready to execute (dependencies met)
   */
  getReadyTasks(sessionId: string): CollaborationTask[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return Array.from(session.tasks.values()).filter((task) => {
      if (task.status !== "pending" && task.status !== "blocked") return false;

      const depsMet = task.dependencies.every((depId) => {
        const dep = session.tasks.get(depId);
        return dep?.status === "completed";
      });

      return depsMet;
    });
  }

  /**
   * Get task dependency graph
   */
  getTaskGraph(sessionId: string): { nodes: any[]; edges: any[] } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const nodes = Array.from(session.tasks.values()).map((t) => ({
      id: t.id,
      label: t.title,
      status: t.status,
      priority: t.priority,
      assignedTo: t.assignedTo,
    }));

    const edges: any[] = [];
    for (const task of session.tasks.values()) {
      for (const depId of task.dependencies) {
        edges.push({ source: depId, target: task.id });
      }
    }

    return { nodes, edges };
  }

  // ============================================================
  // Messaging
  // ============================================================

  /**
   * Send a message between collaborators
   */
  sendMessage(
    sessionId: string,
    from: string,
    type: AgentMessage["type"],
    content: string,
    options?: { to?: string; payload?: any }
  ): AgentMessage | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const message: AgentMessage = {
      id: this.generateId("msg"),
      from,
      to: options?.to,
      type,
      content,
      payload: options?.payload,
      timestamp: new Date().toISOString(),
      threadId: sessionId,
    };

    session.messages.push(message);
    session.metadata.totalMessages++;

    // Trim message history if needed
    if (session.messages.length > this.config.messageHistoryLimit) {
      session.messages = session.messages.slice(-this.config.messageHistoryLimit);
    }

    // Update sender message count
    const sender = session.collaborators.get(from);
    if (sender) {
      sender.messageCount++;
    }

    session.updatedAt = new Date().toISOString();
    this.saveSession(session);

    this.emit("message:sent", session, message);
    return message;
  }

  /**
   * Get message thread for a session
   */
  getMessages(sessionId: string, options?: { from?: string; to?: string; type?: string; limit?: number }): AgentMessage[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    let messages = session.messages;

    if (options?.from) {
      messages = messages.filter((m) => m.from === options.from);
    }
    if (options?.to) {
      messages = messages.filter((m) => m.to === options.to || (!m.to && options.to === "broadcast"));
    }
    if (options?.type) {
      messages = messages.filter((m) => m.type === options.type);
    }

    messages = messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    if (options?.limit) {
      messages = messages.slice(-options.limit);
    }

    return messages;
  }

  // ============================================================
  // Consensus
  // ============================================================

  /**
   * Propose a consensus on a task result
   */
  proposeConsensus(sessionId: string, taskId: string, proposedBy: string, content: any): ConsensusProposal | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const proposal: ConsensusProposal = {
      id: this.generateId("proposal"),
      taskId,
      proposedBy,
      content,
      votes: new Map(),
      status: "open",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min expiry
    };

    this.proposals.set(proposal.id, proposal);

    // Auto-vote by proposer
    proposal.votes.set(proposedBy, "approve");

    session.metadata.consensusCount++;
    session.updatedAt = new Date().toISOString();

    this.saveSession(session);
    this.emit("consensus:proposed", session, proposal);
    return proposal;
  }

  /**
   * Vote on a consensus proposal
   */
  voteOnProposal(proposalId: string, collaboratorId: string, vote: "approve" | "reject" | "abstain"): ConsensusProposal | null {
    const proposal = this.proposals.get(proposalId);
    if (!proposal || proposal.status !== "open") return null;

    proposal.votes.set(collaboratorId, vote);

    // Check if consensus reached
    const approvals = Array.from(proposal.votes.values()).filter((v) => v === "approve").length;
    const total = Array.from(proposal.votes.values()).filter((v) => v !== "abstain").length;

    if (total > 0 && approvals / total >= this.config.consensusThreshold) {
      proposal.status = "approved";
      this.emit("consensus:reached", proposal);
    } else if (total > 0 && (total - approvals) / total > 1 - this.config.consensusThreshold) {
      proposal.status = "rejected";
      this.emit("consensus:rejected", proposal);
    }

    return proposal;
  }

  /**
   * Get open proposals for a session
   */
  getOpenProposals(sessionId: string): ConsensusProposal[] {
    return Array.from(this.proposals.values()).filter(
      (p) => p.status === "open" && this.sessions.get(sessionId)?.tasks.has(p.taskId)
    );
  }

  // ============================================================
  // Synthesis
  // ============================================================

  /**
   * Synthesize final result from completed tasks
   */
  synthesizeResults(sessionId: string): { success: boolean; result?: any; error?: string } {
    const session = this.sessions.get(sessionId);
    if (!session) return { success: false, error: "Session not found" };

    const tasks = Array.from(session.tasks.values());
    const completed = tasks.filter((t) => t.status === "completed");

    if (completed.length === 0) {
      return { success: false, error: "No completed tasks to synthesize" };
    }

    // Build synthesis from task results
    const synthesis = {
      summary: `Completed ${completed.length}/${tasks.length} tasks`,
      taskResults: completed.map((t) => ({
        title: t.title,
        result: t.result,
        completedAt: t.completedAt,
      })),
      consensusResults: Array.from(this.proposals.values())
        .filter((p) => p.status === "approved" && session.tasks.has(p.taskId))
        .map((p) => p.content),
      metadata: {
        totalTasks: tasks.length,
        completedTasks: completed.length,
        failedTasks: tasks.filter((t) => t.status === "failed").length,
        collaborators: session.collaborators.size,
        messages: session.metadata.totalMessages,
      },
    };

    session.finalResult = synthesis;
    session.updatedAt = new Date().toISOString();
    this.saveSession(session);

    return { success: true, result: synthesis };
  }

  // ============================================================
  // Statistics
  // ============================================================

  getStats(): {
    totalSessions: number;
    activeSessions: number;
    totalCollaborators: number;
    totalTasks: number;
    completedTasks: number;
    byRole: Record<string, number>;
    averageConsensusRate: number;
  } {
    const sessions = Array.from(this.sessions.values());
    const byRole: Record<string, number> = {};
    let totalCollaborators = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    for (const session of sessions) {
      totalCollaborators += session.collaborators.size;
      totalTasks += session.metadata.totalTasks;
      completedTasks += session.metadata.completedTasks;

      for (const c of session.collaborators.values()) {
        byRole[c.role] = (byRole[c.role] || 0) + 1;
      }
    }

    const proposals = Array.from(this.proposals.values());
    const approved = proposals.filter((p) => p.status === "approved").length;
    const decided = proposals.filter((p) => p.status === "approved" || p.status === "rejected").length;

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter((s) => s.status === "active").length,
      totalCollaborators,
      totalTasks,
      completedTasks,
      byRole,
      averageConsensusRate: decided > 0 ? approved / decided : 0,
    };
  }

  getSessionStats(sessionId: string): any | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const tasks = Array.from(session.tasks.values());
    const byStatus: Record<string, number> = {};
    for (const t of tasks) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    }

    return {
      ...session.metadata,
      collaboratorCount: session.collaborators.size,
      taskBreakdown: byStatus,
      duration: session.completedAt
        ? new Date(session.completedAt).getTime() - new Date(session.createdAt).getTime()
        : Date.now() - new Date(session.createdAt).getTime(),
    };
  }

  // ============================================================
  // Helpers
  // ============================================================

  private autoAssignTask(session: CollaborationSession, task: CollaborationTask): void {
    // Find best collaborator based on capabilities and workload
    let bestCandidate: Collaborator | null = null;
    let bestScore = -1;

    for (const collaborator of session.collaborators.values()) {
      if (collaborator.status === "error") continue;

      const capabilityMatch = collaborator.capabilities.filter((c) =>
        task.title.toLowerCase().includes(c.toLowerCase()) ||
        task.description.toLowerCase().includes(c.toLowerCase())
      ).length;

      const workload = collaborator.currentTaskId ? 1 : 0;
      const roleBonus = collaborator.role === "coordinator" ? 0.5 : collaborator.role === "specialist" ? 1 : 0;

      const score = capabilityMatch * 2 + roleBonus - workload;

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = collaborator;
      }
    }

    if (bestCandidate) {
      task.assignedTo = bestCandidate.id;
    }
  }

  private unblockDependentTasks(session: CollaborationSession, completedTaskId: string): void {
    for (const task of session.tasks.values()) {
      if (task.status === "blocked" && task.dependencies.includes(completedTaskId)) {
        const allMet = task.dependencies.every((depId) => {
          const dep = session.tasks.get(depId);
          return dep?.status === "completed";
        });
        if (allMet) {
          task.status = "pending";
          this.emit("task:unblocked", session, task);
        }
      }
    }
  }

  // ============================================================
  // Persistence
  // ============================================================

  private ensureDirectories(): void {
    if (!fs.existsSync(this.collabDir)) {
      fs.mkdirSync(this.collabDir, { recursive: true });
    }
  }

  private getSessionPath(sessionId: string): string {
    return path.join(this.collabDir, `session-${sessionId}.json`);
  }

  private saveSession(session: CollaborationSession): void {
    try {
      const sessionPath = this.getSessionPath(session.id);
      const data = this.serializeSession(session);
      fs.writeFileSync(sessionPath, JSON.stringify(data, null, 2), "utf-8");
      this.saveSessionsIndex();
    } catch (err) {
      console.warn("[CollaborationHub] Failed to save session:", err);
    }
  }

  private saveSessionsIndex(): void {
    try {
      const indexPath = path.join(this.collabDir, SESSIONS_FILE);
      const index = Array.from(this.sessions.values()).map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        collaboratorCount: s.collaborators.size,
        taskCount: s.tasks.size,
      }));
      fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf-8");
    } catch (err) {
      console.warn("[CollaborationHub] Failed to save index:", err);
    }
  }

  private loadSessions(): void {
    try {
      const indexPath = path.join(this.collabDir, SESSIONS_FILE);
      if (!fs.existsSync(indexPath)) return;

      const index = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
      for (const entry of index) {
        const sessionPath = this.getSessionPath(entry.id);
        if (fs.existsSync(sessionPath)) {
          const data = JSON.parse(fs.readFileSync(sessionPath, "utf-8"));
          const session = this.deserializeSession(data);
          this.sessions.set(session.id, session);
        }
      }
      console.log(`[CollaborationHub] Loaded ${this.sessions.size} sessions`);
    } catch (err) {
      console.warn("[CollaborationHub] Failed to load sessions:", err);
    }
  }

  private serializeSession(session: CollaborationSession): any {
    return {
      ...session,
      collaborators: Array.from(session.collaborators.entries()),
      tasks: Array.from(session.tasks.entries()),
      messages: session.messages,
    };
  }

  private deserializeSession(data: any): CollaborationSession {
    return {
      ...data,
      collaborators: new Map(data.collaborators),
      tasks: new Map(data.tasks),
      messages: data.messages || [],
    };
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  destroy(): void {
    for (const session of this.sessions.values()) {
      this.saveSession(session);
    }
    this.removeAllListeners();
  }
}
