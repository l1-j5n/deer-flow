/**
 * DeerFlow Electron - File Logger
 *
 * Provides structured logging to files with rotation support.
 * Logs are stored in .deerflow/logs/ directory.
 */

import * as fs from "fs";
import * as path from "path";

export interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  source?: string;
}

export class FileLogger {
  private logDir: string;
  private currentLogFile: string;
  private maxFileSize: number;
  private maxFiles: number;
  private writeQueue: string[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isWriting = false;

  constructor(projectRoot: string, options?: { maxFileSize?: number; maxFiles?: number }) {
    this.logDir = path.join(projectRoot, ".deerflow", "logs");
    this.maxFileSize = options?.maxFileSize || 5 * 1024 * 1024; // 5MB
    this.maxFiles = options?.maxFiles || 5;
    this.currentLogFile = path.join(this.logDir, "deerflow.log");

    this.ensureLogDir();
    this.startFlushTimer();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, 1000); // Flush every second
  }

  log(level: LogEntry["level"], message: string, source?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
    };

    const line = JSON.stringify(entry) + "\n";
    this.writeQueue.push(line);

    // Also log to console for development
    const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    consoleMethod(`[${source || "DeerFlow"}] ${message}`);
  }

  debug(message: string, source?: string): void {
    this.log("debug", message, source);
  }

  info(message: string, source?: string): void {
    this.log("info", message, source);
  }

  warn(message: string, source?: string): void {
    this.log("warn", message, source);
  }

  error(message: string, source?: string): void {
    this.log("error", message, source);
  }

  private async flush(): Promise<void> {
    if (this.isWriting || this.writeQueue.length === 0) return;

    this.isWriting = true;
    const lines = this.writeQueue.splice(0, this.writeQueue.length);

    try {
      // Check if we need to rotate
      await this.rotateIfNeeded();

      // Append to log file
      fs.appendFileSync(this.currentLogFile, lines.join(""), "utf-8");
    } catch (err) {
      console.error("[FileLogger] Failed to write logs:", err);
      // Put lines back in queue
      this.writeQueue.unshift(...lines);
    } finally {
      this.isWriting = false;
    }
  }

  private async rotateIfNeeded(): Promise<void> {
    try {
      const stats = fs.statSync(this.currentLogFile);
      if (stats.size < this.maxFileSize) return;
    } catch {
      // File doesn't exist yet
      return;
    }

    // Rotate files: deerflow.log -> deerflow.log.1 -> deerflow.log.2 -> ...
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const oldFile = path.join(this.logDir, `deerflow.log.${i}`);
      const newFile = path.join(this.logDir, `deerflow.log.${i + 1}`);

      if (fs.existsSync(oldFile)) {
        if (i === this.maxFiles - 1) {
          fs.unlinkSync(oldFile); // Delete oldest
        } else {
          fs.renameSync(oldFile, newFile);
        }
      }
    }

    // Rotate current log
    const backupFile = path.join(this.logDir, "deerflow.log.1");
    fs.renameSync(this.currentLogFile, backupFile);
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    try {
      if (!fs.existsSync(this.currentLogFile)) return [];

      const content = fs.readFileSync(this.currentLogFile, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);
      const recent = lines.slice(-count);

      return recent.map((line) => JSON.parse(line));
    } catch {
      return [];
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    // Final flush
    this.flush();
  }
}

// Global logger instance
let globalLogger: FileLogger | null = null;

export function initLogger(projectRoot: string): FileLogger {
  if (!globalLogger) {
    globalLogger = new FileLogger(projectRoot);
  }
  return globalLogger;
}

export function getLogger(): FileLogger | null {
  return globalLogger;
}
