/**
 * DeerFlow Electron - Task Scheduler
 *
 * Provides scheduled task execution for the agent platform:
 * - Cron-style scheduling (recurring tasks)
 * - One-time delayed execution
 * - Task persistence across app restarts
 * - Task categories: workflow, session, skill, system
 * - Execution history and retry logic
 * - Integration with EventBus for task events
 *
 * Uses pure Node.js timers (no external cron dependencies).
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Type Definitions
// ============================================================

export type TaskType = "workflow" | "session" | "skill" | "system" | "backup" | "cleanup";
export type TaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled" | "skipped";

export interface ScheduledTask {
  id: string;
  name: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  // Schedule config
  schedule: {
    type: "once" | "interval" | "cron";
    at?: string; // ISO timestamp for one-time
    intervalMs?: number; // For interval type
    cron?: string; // For cron type (simplified: "* * * * *")
  };
  // What to execute
  action: {
    handler: string; // e.g., "workflow:execute", "session:create", "skill:run"
    params: Record<string, any>;
  };
  // Execution config
  config: {
    enabled: boolean;
    maxRetries: number;
    retryDelayMs: number;
    timeoutMs: number;
    skipIfRunning: boolean;
  };
  // State
  lastRunAt?: string;
  lastRunResult?: "success" | "failed" | "timeout";
  lastRunError?: string;
  nextRunAt?: string;
  runCount: number;
  failCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  startedAt: string;
  completedAt?: string;
  status: TaskStatus;
  result?: any;
  error?: string;
  durationMs?: number;
  retryCount: number;
}

export interface SchedulerConfig {
  maxConcurrentTasks: number;
  defaultTimeoutMs: number;
  defaultRetryCount: number;
  historyLimit: number;
  checkIntervalMs: number;
}

// ============================================================
// Default Configuration
// ============================================================

const DEFAULT_CONFIG: SchedulerConfig = {
  maxConcurrentTasks: 5,
  defaultTimeoutMs: 300000, // 5 minutes
  defaultRetryCount: 2,
  historyLimit: 1000,
  checkIntervalMs: 1000, // Check every second
};

// ============================================================
// Task Scheduler
// ============================================================

const SCHEDULER_DIR = "scheduler";
const TASKS_FILE = "tasks.json";
const HISTORY_FILE = "history.json";

export class TaskScheduler extends EventEmitter {
  private projectRoot: string;
  private schedulerDir: string;
  private tasks: Map<string, ScheduledTask> = new Map();
  private executions: Map<string, TaskExecution> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private runningTasks: Set<string> = new Set();
  private config: SchedulerConfig;
  private checkTimer: NodeJS.Timeout | null = null;
  private dirty = false;

  constructor(projectRoot: string, config?: Partial<SchedulerConfig>) {
    super();
    this.projectRoot = projectRoot;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.schedulerDir = path.join(projectRoot, ".deerflow", SCHEDULER_DIR);
    this.ensureDirectories();
    this.loadTasks();
    this.startScheduler();
  }

  // ============================================================
  // Task CRUD
  // ============================================================

  /**
   * Create a new scheduled task
   */
  createTask(
    task: Omit<ScheduledTask, "id" | "status" | "runCount" | "failCount" | "createdAt" | "updatedAt">
  ): ScheduledTask {
    const now = new Date().toISOString();
    const newTask: ScheduledTask = {
      ...task,
      id: this.generateId(),
      status: "pending",
      runCount: 0,
      failCount: 0,
      createdAt: now,
      updatedAt: now,
      config: {
        enabled: true,
        maxRetries: 2,
        retryDelayMs: 5000,
        timeoutMs: 300000,
        skipIfRunning: true,
        ...task.config,
      },
    };

    // Calculate next run time
    newTask.nextRunAt = this.calculateNextRun(newTask);

    this.tasks.set(newTask.id, newTask);
    this.dirty = true;
    this.saveTasks();

    // Schedule the task
    this.scheduleTask(newTask);

    this.emit("task:created", newTask);
    return newTask;
  }

  /**
   * Get a task by ID
   */
  getTask(id: string): ScheduledTask | null {
    return this.tasks.get(id) || null;
  }

  /**
   * List all tasks with optional filtering
   */
  listTasks(filter?: { type?: TaskType; status?: TaskStatus; enabled?: boolean }): ScheduledTask[] {
    let tasks = Array.from(this.tasks.values());

    if (filter?.type) {
      tasks = tasks.filter((t) => t.type === filter.type);
    }
    if (filter?.status) {
      tasks = tasks.filter((t) => t.status === filter.status);
    }
    if (filter?.enabled !== undefined) {
      tasks = tasks.filter((t) => t.config.enabled === filter.enabled);
    }

    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Update a task
   */
  updateTask(id: string, updates: Partial<Omit<ScheduledTask, "id" | "createdAt">>): ScheduledTask | null {
    const task = this.tasks.get(id);
    if (!task) return null;

    Object.assign(task, updates, { updatedAt: new Date().toISOString() });

    // Recalculate next run if schedule changed
    if (updates.schedule) {
      task.nextRunAt = this.calculateNextRun(task);
    }

    this.dirty = true;
    this.saveTasks();

    // Reschedule
    this.unscheduleTask(id);
    this.scheduleTask(task);

    this.emit("task:updated", task);
    return task;
  }

  /**
   * Delete a task
   */
  deleteTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;

    this.unscheduleTask(id);
    this.tasks.delete(id);
    this.dirty = true;
    this.saveTasks();

    this.emit("task:deleted", id);
    return true;
  }

  /**
   * Enable a task
   */
  enableTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;

    task.config.enabled = true;
    task.updatedAt = new Date().toISOString();
    task.nextRunAt = this.calculateNextRun(task);

    this.dirty = true;
    this.saveTasks();
    this.scheduleTask(task);

    this.emit("task:enabled", task);
    return true;
  }

  /**
   * Disable a task
   */
  disableTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) return false;

    task.config.enabled = false;
    task.updatedAt = new Date().toISOString();
    task.nextRunAt = undefined;

    this.dirty = true;
    this.saveTasks();
    this.unscheduleTask(id);

    this.emit("task:disabled", task);
    return true;
  }

  // ============================================================
  // Task Execution
  // ============================================================

  /**
   * Run a task immediately (manual trigger)
   */
  async runTaskNow(id: string): Promise<TaskExecution | null> {
    const task = this.tasks.get(id);
    if (!task) return null;

    return this.executeTask(task);
  }

  /**
   * Execute a task
   */
  private async executeTask(task: ScheduledTask): Promise<TaskExecution> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const startedAt = new Date().toISOString();

    const execution: TaskExecution = {
      id: executionId,
      taskId: task.id,
      startedAt,
      status: "running",
      retryCount: 0,
    };

    this.executions.set(executionId, execution);
    this.runningTasks.add(task.id);
    task.status = "running";

    this.emit("execution:started", execution, task);

    const startTime = Date.now();

    try {
      // Execute with timeout
      const result = await this.runWithTimeout(
        () => this.executeAction(task.action),
        task.config.timeoutMs || this.config.defaultTimeoutMs
      );

      execution.status = "completed";
      execution.result = result;
      execution.completedAt = new Date().toISOString();
      execution.durationMs = Date.now() - startTime;

      task.lastRunAt = execution.completedAt;
      task.lastRunResult = "success";
      task.lastRunError = undefined;
      task.runCount++;
      task.status = "pending";

      // Calculate next run for recurring tasks
      if (task.schedule.type !== "once") {
        task.nextRunAt = this.calculateNextRun(task);
      }

      this.emit("execution:completed", execution, task);
    } catch (err: any) {
      execution.status = "failed";
      execution.error = err.message;
      execution.completedAt = new Date().toISOString();
      execution.durationMs = Date.now() - startTime;

      task.lastRunAt = execution.completedAt;
      task.lastRunResult = "failed";
      task.lastRunError = err.message;
      task.failCount++;
      task.status = "pending";

      this.emit("execution:failed", execution, task, err);

      // Retry logic
      if (execution.retryCount < task.config.maxRetries) {
        execution.retryCount++;
        setTimeout(() => {
          this.executeTask(task);
        }, task.config.retryDelayMs);
      }
    } finally {
      this.runningTasks.delete(task.id);
      this.dirty = true;
      this.saveTasks();
      this.saveHistory();
    }

    return execution;
  }

  /**
   * Execute the task action
   */
  private async executeAction(action: ScheduledTask["action"]): Promise<any> {
    // Emit event for external handlers to process
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Task execution timeout"));
      }, this.config.defaultTimeoutMs);

      this.emit("action:execute", action, (result: any, error?: Error) => {
        clearTimeout(timeout);
        if (error) reject(error);
        else resolve(result);
      });

      // If no listener handles the action, resolve with placeholder
      setTimeout(() => {
        if (this.listenerCount("action:execute") === 0) {
          clearTimeout(timeout);
          resolve({ handled: false, action });
        }
      }, 100);
    });
  }

  /**
   * Run a function with timeout
   */
  private runWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Task timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  }

  // ============================================================
  // Scheduling Logic
  // ============================================================

  /**
   * Calculate next run time for a task
   */
  private calculateNextRun(task: ScheduledTask): string | undefined {
    if (!task.config.enabled) return undefined;

    const now = Date.now();

    switch (task.schedule.type) {
      case "once":
        if (task.schedule.at) {
          const atTime = new Date(task.schedule.at).getTime();
          return atTime > now ? task.schedule.at : undefined;
        }
        return undefined;

      case "interval":
        if (task.schedule.intervalMs) {
          const lastRun = task.lastRunAt ? new Date(task.lastRunAt).getTime() : now;
          const nextRun = lastRun + task.schedule.intervalMs;
          return new Date(Math.max(nextRun, now)).toISOString();
        }
        return undefined;

      case "cron": {
        // Simplified cron: interpret as minutes interval for now
        // Format: "*/5" = every 5 minutes
        const cron = task.schedule.cron || "*/60";
        const match = cron.match(/\*\/(\d+)/);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const nextRun = now + minutes * 60 * 1000;
          return new Date(nextRun).toISOString();
        }
        return new Date(now + 3600000).toISOString(); // Default 1 hour
      }

      default:
        return undefined;
    }
  }

  /**
   * Schedule a task timer
   */
  private scheduleTask(task: ScheduledTask): void {
    if (!task.config.enabled || !task.nextRunAt) return;

    const nextRun = new Date(task.nextRunAt).getTime();
    const delay = Math.max(0, nextRun - Date.now());

    const timer = setTimeout(() => {
      this.timers.delete(task.id);
      if (task.config.skipIfRunning && this.runningTasks.has(task.id)) {
        task.status = "skipped";
        task.nextRunAt = this.calculateNextRun(task);
        this.scheduleTask(task);
        return;
      }
      this.executeTask(task);
    }, delay);

    this.timers.set(task.id, timer);
  }

  /**
   * Unschedule a task timer
   */
  private unscheduleTask(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  /**
   * Start the scheduler loop
   */
  private startScheduler(): void {
    // Check for tasks that need to run every second
    this.checkTimer = setInterval(() => {
      this.checkTasks();
    }, this.config.checkIntervalMs);

    // Schedule all enabled tasks
    for (const task of this.tasks.values()) {
      if (task.config.enabled) {
        this.scheduleTask(task);
      }
    }
  }

  /**
   * Check and run due tasks
   */
  private checkTasks(): void {
    const now = Date.now();

    for (const task of this.tasks.values()) {
      if (!task.config.enabled || task.status === "running") continue;
      if (!task.nextRunAt) continue;

      const nextRun = new Date(task.nextRunAt).getTime();
      if (nextRun <= now) {
        // Reschedule if timer missed it
        this.unscheduleTask(task.id);
        this.executeTask(task);
      }
    }
  }

  // ============================================================
  // History
  // ============================================================

  /**
   * Get execution history for a task
   */
  getHistory(taskId?: string): TaskExecution[] {
    let history = Array.from(this.executions.values());
    if (taskId) {
      history = history.filter((e) => e.taskId === taskId);
    }
    return history.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  /**
   * Alias for getHistory - gets execution history
   */
  getExecutionHistory(taskId?: string): TaskExecution[] {
    return this.getHistory(taskId);
  }

  /**
   * Get recent executions
   */
  getRecentExecutions(limit: number = 50): TaskExecution[] {
    return this.getHistory().slice(0, limit);
  }

  /**
   * Clear old history
   */
  clearOldHistory(keepCount: number = this.config.historyLimit): void {
    const all = this.getHistory();
    if (all.length <= keepCount) return;

    const toKeep = all.slice(0, keepCount);
    this.executions.clear();
    for (const exec of toKeep) {
      this.executions.set(exec.id, exec);
    }
    this.dirty = true;
    this.saveHistory();
  }

  // ============================================================
  // Statistics
  // ============================================================

  getStats(): {
    totalTasks: number;
    enabledTasks: number;
    runningTasks: number;
    byType: Record<string, number>;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
  } {
    const tasks = Array.from(this.tasks.values());
    const executions = Array.from(this.executions.values());
    const byType: Record<string, number> = {};

    for (const t of tasks) {
      byType[t.type] = (byType[t.type] || 0) + 1;
    }

    return {
      totalTasks: tasks.length,
      enabledTasks: tasks.filter((t) => t.config.enabled).length,
      runningTasks: tasks.filter((t) => t.status === "running").length,
      byType,
      totalExecutions: executions.length,
      successfulExecutions: executions.filter((e) => e.status === "completed").length,
      failedExecutions: executions.filter((e) => e.status === "failed").length,
    };
  }

  // ============================================================
  // Persistence
  // ============================================================

  private ensureDirectories(): void {
    if (!fs.existsSync(this.schedulerDir)) {
      fs.mkdirSync(this.schedulerDir, { recursive: true });
    }
  }

  private getTasksPath(): string {
    return path.join(this.schedulerDir, TASKS_FILE);
  }

  private getHistoryPath(): string {
    return path.join(this.schedulerDir, HISTORY_FILE);
  }

  private loadTasks(): void {
    try {
      const tasksPath = this.getTasksPath();
      if (!fs.existsSync(tasksPath)) return;

      const data = JSON.parse(fs.readFileSync(tasksPath, "utf-8"));
      for (const task of data.tasks || []) {
        this.tasks.set(task.id, task);
      }
      console.log(`[Scheduler] Loaded ${this.tasks.size} tasks`);
    } catch (err) {
      console.warn("[Scheduler] Failed to load tasks:", err);
    }
  }

  private saveTasks(): void {
    if (!this.dirty) return;
    try {
      const tasksPath = this.getTasksPath();
      const data = {
        updatedAt: new Date().toISOString(),
        tasks: Array.from(this.tasks.values()),
      };
      fs.writeFileSync(tasksPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("[Scheduler] Failed to save tasks:", err);
    }
  }

  private saveHistory(): void {
    try {
      const historyPath = this.getHistoryPath();
      const data = {
        updatedAt: new Date().toISOString(),
        executions: Array.from(this.executions.values()).slice(-this.config.historyLimit),
      };
      fs.writeFileSync(historyPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("[Scheduler] Failed to save history:", err);
    }
  }

  // ============================================================
  // Cleanup
  // ============================================================

  destroy(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();

    this.saveTasks();
    this.saveHistory();
    this.removeAllListeners();
  }

  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
