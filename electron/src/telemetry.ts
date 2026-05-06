/**
 * DeerFlow Electron - Telemetry System
 *
 * Opt-in anonymous usage analytics for improving the product.
 * All data collection is strictly opt-in and can be disabled at any time.
 *
 * Collected data (only when opted in):
 * - Session duration
 * - Feature usage (settings opened, chats created, etc.)
 * - Error counts (no stack traces or sensitive data)
 * - OS platform and app version
 * - Startup performance metrics
 *
 * NOT collected:
 * - User messages or chat content
 * - API keys or model configurations
 * - File names or paths
 * - IP addresses
 */

import { EventEmitter } from "events";

export interface TelemetryConfig {
  enabled: boolean;
  endpoint?: string;
  flushIntervalMs: number;
  maxQueueSize: number;
}

export interface TelemetryEvent {
  name: string;
  timestamp: number;
  sessionId: string;
  appVersion: string;
  platform: string;
  properties?: Record<string, any>;
}

export class TelemetryManager extends EventEmitter {
  private config: TelemetryConfig;
  private queue: TelemetryEvent[] = [];
  private sessionId: string;
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;

  constructor(config?: Partial<TelemetryConfig>) {
    super();
    this.config = {
      enabled: false,
      endpoint: "https://telemetry.deerflow.io/events",
      flushIntervalMs: 60000, // 1 minute
      maxQueueSize: 100,
      ...config,
    };
    this.sessionId = this.generateSessionId();

    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Enable telemetry
   */
  enable(): void {
    if (this.config.enabled) return;
    this.config.enabled = true;
    this.sessionId = this.generateSessionId();
    this.startFlushTimer();
    this.emit("enabled");
  }

  /**
   * Disable telemetry and flush remaining events
   */
  async disable(): Promise<void> {
    if (!this.config.enabled) return;
    this.config.enabled = false;
    this.stopFlushTimer();
    await this.flush();
    this.emit("disabled");
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const event: TelemetryEvent = {
      name: eventName,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      appVersion: "0.5.0",
      platform: process.platform,
      properties: this.sanitizeProperties(properties),
    };

    this.queue.push(event);

    // Flush immediately if queue is full
    if (this.queue.length >= this.config.maxQueueSize) {
      this.flush();
    }
  }

  /**
   * Track a feature usage
   */
  trackFeature(feature: string, details?: Record<string, any>): void {
    this.track("feature_used", { feature, ...details });
  }

  /**
   * Track an error (no sensitive data)
   */
  trackError(errorType: string, message?: string): void {
    this.track("error", {
      errorType,
      message: message ? this.sanitizeString(message) : undefined,
    });
  }

  /**
   * Track startup metrics
   */
  trackStartupMetrics(metrics: {
    totalDuration: number;
    serviceCount: number;
  }): void {
    this.track("startup_completed", metrics);
  }

  /**
   * Get current queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get current config
   */
  getConfig(): TelemetryConfig {
    return { ...this.config };
  }

  /**
   * Flush queued events to server
   */
  async flush(): Promise<void> {
    if (this.isFlushing || this.queue.length === 0 || !this.config.enabled) {
      return;
    }

    this.isFlushing = true;
    const events = [...this.queue];
    this.queue = [];

    try {
      // In a real implementation, this would POST to the telemetry endpoint
      // For now, we just log to the console in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[Telemetry] Would send ${events.length} events`);
      }

      // Simulated network request (replace with actual fetch in production)
      // await fetch(this.config.endpoint!, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ events }),
      // });

      this.emit("flushed", events.length);
    } catch (err: any) {
      // Put events back in queue on failure
      this.queue.unshift(...events);
      this.emit("flush-error", err);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Clean up timers
   */
  destroy(): void {
    this.stopFlushTimer();
    this.queue = [];
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startFlushTimer(): void {
    this.stopFlushTimer();
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushIntervalMs);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private sanitizeProperties(props?: Record<string, any>): Record<string, any> | undefined {
    if (!props) return undefined;

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(props)) {
      // Skip potentially sensitive keys
      const sensitiveKeys = ["key", "token", "secret", "password", "api_key", "apikey", "auth"];
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sk) => lowerKey.includes(sk))) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "string") {
        sanitized[key] = this.sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private sanitizeString(str: string): string {
    // Remove potential file paths
    return str
      .replace(/([A-Za-z]:\\[^\s]+)/g, "[PATH]")
      .replace(/(\/[^\s]+\/[^\s]+)/g, "[PATH]");
  }
}
