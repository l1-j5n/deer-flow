/** Task Scheduler type definitions. */

export type TaskType = "workflow" | "session" | "skill" | "system" | "backup" | "cleanup";
export type TaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled" | "skipped";

export interface TaskSchedule {
  type: "once" | "interval" | "cron";
  at?: string;
  intervalMs?: number;
  cron?: string;
}

export interface TaskAction {
  handler: string;
  params: Record<string, unknown>;
}

export interface TaskConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
  skipIfRunning: boolean;
}

export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  schedule: TaskSchedule;
  action: TaskAction;
  config: TaskConfig;
  lastRunAt?: string;
  lastRunResult?: string;
  lastRunError?: string;
  nextRunAt?: string;
  runCount: number;
  failCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  name: string;
  description?: string;
  type: TaskType;
  schedule: TaskSchedule;
  action: TaskAction;
  config?: Partial<TaskConfig>;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  startedAt: string;
  completedAt?: string;
  status: TaskStatus;
  result?: unknown;
  error?: string;
  durationMs?: number;
  retryCount: number;
}

export interface SchedulerStats {
  totalTasks: number;
  enabledTasks: number;
  disabledTasks: number;
  runningTasks: number;
  byType: Record<string, number>;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  executionsToday: number;
}
