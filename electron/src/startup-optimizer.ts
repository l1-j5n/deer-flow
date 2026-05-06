/**
 * DeerFlow Electron - Startup Optimizer
 *
 * Optimizes application startup by:
 * - Parallel service initialization (LangGraph + Gateway simultaneously)
 * - Frontend preloading while services start
 * - Startup time measurement and telemetry
 * - Smart retry with exponential backoff
 */

import { EventEmitter } from "events";

export interface StartupMetrics {
  startTime: number;
  servicesReadyAt?: number;
  proxyReadyAt?: number;
  frontendLoadedAt?: number;
  totalDuration?: number;
  serviceDurations: Record<string, number>;
}

export class StartupOptimizer extends EventEmitter {
  private metrics: StartupMetrics;
  private isRunning = false;

  constructor() {
    super();
    this.metrics = {
      startTime: Date.now(),
      serviceDurations: {},
    };
  }

  /**
   * Begin startup timing
   */
  start(): void {
    this.metrics.startTime = Date.now();
    this.isRunning = true;
    this.emit("started");
  }

  /**
   * Record a service becoming ready
   */
  recordServiceReady(name: string): void {
    if (!this.isRunning) return;
    const duration = Date.now() - this.metrics.startTime;
    this.metrics.serviceDurations[name] = duration;
    this.emit("service-ready", name, duration);
  }

  /**
   * Record proxy server ready
   */
  recordProxyReady(): void {
    if (!this.isRunning) return;
    this.metrics.proxyReadyAt = Date.now();
    this.emit("proxy-ready");
  }

  /**
   * Record frontend loaded
   */
  recordFrontendLoaded(): void {
    if (!this.isRunning) return;
    this.metrics.frontendLoadedAt = Date.now();
    this.emit("frontend-loaded");
  }

  /**
   * Complete startup and calculate total duration
   */
  complete(): StartupMetrics {
    this.isRunning = false;
    this.metrics.totalDuration = Date.now() - this.metrics.startTime;
    this.emit("completed", this.metrics);
    return this.getMetrics();
  }

  /**
   * Get current metrics
   */
  getMetrics(): StartupMetrics {
    return { ...this.metrics };
  }

  /**
   * Format metrics for display
   */
  formatMetrics(): string {
    const m = this.metrics;
    const lines: string[] = [];
    lines.push("📊 Startup Metrics:");
    lines.push(`  Total: ${m.totalDuration ? m.totalDuration + "ms" : "in progress..."}`);

    for (const [name, duration] of Object.entries(m.serviceDurations)) {
      lines.push(`  ${name}: ${duration}ms`);
    }

    if (m.proxyReadyAt) {
      lines.push(`  proxy: ${m.proxyReadyAt - m.startTime}ms`);
    }

    if (m.frontendLoadedAt) {
      lines.push(`  frontend: ${m.frontendLoadedAt - m.startTime}ms`);
    }

    return lines.join("\n");
  }

  /**
   * Check if startup is still in progress
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }
}

/**
 * Smart retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 5, baseDelay = 1000, maxDelay = 30000, onRetry } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s... capped at maxDelay
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      if (onRetry) {
        onRetry(attempt + 1, err);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error("Retry failed");
}

/**
 * Parallel execution helper for independent async tasks
 */
export async function runInParallel<T>(
  tasks: Array<() => Promise<T>>,
  options: {
    onTaskComplete?: (index: number, result: T) => void;
    onTaskError?: (index: number, error: Error) => void;
  } = {}
): Promise<(T | Error)[]> {
  const { onTaskComplete, onTaskError } = options;

  const results = await Promise.allSettled(
    tasks.map((task, index) =>
      task().then((result) => {
        onTaskComplete?.(index, result);
        return result;
      }).catch((error) => {
        onTaskError?.(index, error);
        throw error;
      })
    )
  );

  return results.map((r) =>
    r.status === "fulfilled" ? r.value : r.reason
  );
}
