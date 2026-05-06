/** Agent Collaboration type definitions. */

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
  title: string;
  description: string;
  assignedTo?: string;
  dependencies: string[];
  status: "pending" | "in_progress" | "completed" | "failed" | "blocked";
  priority: number;
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentMessage {
  id: string;
  from: string;
  to?: string;
  type: "task" | "result" | "question" | "answer" | "critique" | "consensus" | "system";
  content: string;
  timestamp: string;
  threadId: string;
}

export interface CollaborationSession {
  id: string;
  title: string;
  goal: string;
  status: CollaborationStatus;
  collaborators: Collaborator[];
  tasks: CollaborationTask[];
  messages: AgentMessage[];
  consensusThreshold: number;
  createdAt: string;
  updatedAt: string;
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  totalMessages: number;
  totalTasks: number;
  completedTasks: number;
  conflictCount: number;
  consensusCount: number;
}

export interface CollaborationStats {
  totalSessions: number;
  activeSessions: number;
  totalCollaborators: number;
  totalTasks: number;
  completedTasks: number;
  byRole: Record<string, number>;
  averageConsensusRate: number;
}
