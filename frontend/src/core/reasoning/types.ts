/** Reasoning Trace Viewer type definitions. */

export type StepType = "thought" | "action" | "observation" | "plan" | "reflection" | "conclusion";
export type TraceStrategy = "direct" | "cot" | "react" | "tot" | "reflection";
export type TraceStatus = "active" | "completed" | "failed" | "paused";

export interface StepMetadata {
  toolName?: string;
  durationMs?: number;
}

export interface ReasoningStep {
  id: string;
  type: StepType;
  content: string;
  timestamp: string;
  confidence: number;
  metadata?: StepMetadata;
}

export interface ReasoningTrace {
  id: string;
  sessionId: string;
  strategy: TraceStrategy;
  goal: string;
  steps: ReasoningStep[];
  status: TraceStatus;
  createdAt: string;
  updatedAt: string;
  totalSteps: number;
  finalAnswer?: string;
}

export interface ReasoningStats {
  totalTraces: number;
  activeTraces: number;
  completedTraces: number;
  failedTraces: number;
  strategyBreakdown: Record<string, number>;
  averageSteps: number;
  averageConfidence: number;
}

export interface TraceListResponse {
  traces: ReasoningTrace[];
  total: number;
}
