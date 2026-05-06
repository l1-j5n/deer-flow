/**
 * Backend Service Manager for DeerFlow Electron App
 *
 * Manages the lifecycle of DeerFlow's backend services:
 * - LangGraph Agent Server (port 2024)
 * - FastAPI Gateway (port 8001)
 * - Next.js Frontend Dev Server (port 3000)
 */

import { spawn, ChildProcess } from "child_process";
import * as path from "path";
import * as http from "http";
import { EventEmitter } from "events";

export interface ServiceConfig {
  name: string;
  command: string;
  args: string[];
  cwd: string;
  env?: Record<string, string>;
  healthCheckUrl?: string;
  healthCheckInterval?: number;
  healthCheckTimeout?: number;
}

export interface ServiceStatus {
  name: string;
  running: boolean;
  pid?: number;
  ready: boolean;
  error?: string;
}

export class ServiceManager extends EventEmitter {
  private processes: Map<string, ChildProcess> = new Map();
  private statuses: Map<string, ServiceStatus> = new Map();
  private projectRoot: string;
  private healthCheckTimers: Map<string, NodeJS.Timeout> = new Map();
  private isShuttingDown = false;

  constructor(projectRoot: string) {
    super();
    this.projectRoot = projectRoot;
  }

  /**
   * Get the service configurations for the current platform
   */
  private getServiceConfigs(): ServiceConfig[] {
    const backendDir = path.join(this.projectRoot, "backend");
    const frontendDir = path.join(this.projectRoot, "frontend");
    const isWin = process.platform === "win32";

    const uvicornCmd = isWin
      ? path.join(backendDir, ".venv", "Scripts", "uvicorn.exe")
      : path.join(backendDir, ".venv", "bin", "uvicorn");

    const langgraphCmd = isWin
      ? path.join(backendDir, ".venv", "Scripts", "langgraph.exe")
      : path.join(backendDir, ".venv", "bin", "langgraph");

    const pnpmCmd = isWin ? "pnpm.cmd" : "pnpm";

    return [
      {
        name: "langgraph",
        command: langgraphCmd,
        args: ["dev", "--port", "2024"],
        cwd: backendDir,
        healthCheckUrl: "http://localhost:2024/ok",
        healthCheckInterval: 3000,
        healthCheckTimeout: 120000,
      },
      {
        name: "gateway",
        command: uvicornCmd,
        args: [
          "app.gateway.app:create_app",
          "--factory",
          "--host",
          "0.0.0.0",
          "--port",
          "8001",
        ],
        cwd: backendDir,
        healthCheckUrl: "http://localhost:8001/api/health",
        healthCheckInterval: 3000,
        healthCheckTimeout: 120000,
      },
      {
        name: "frontend",
        command: pnpmCmd,
        args: ["dev", "--port", "3000"],
        cwd: frontendDir,
        healthCheckUrl: "http://localhost:3000",
        healthCheckInterval: 3000,
        healthCheckTimeout: 120000,
      },
    ];
  }

  /**
   * Start all backend services
   * Optimized: starts all services in parallel, then waits for health
   */
  async startAll(): Promise<void> {
    const configs = this.getServiceConfigs();
    console.log(`[ServiceManager] Starting ${configs.length} services in parallel...`);

    // Start all services concurrently (they're independent processes)
    const startPromises = configs.map((config) => this.startService(config));
    await Promise.all(startPromises);

    // Wait for all services to be ready
    console.log("[ServiceManager] Waiting for services to become healthy...");
    await this.waitForAllHealthy(configs);

    console.log("[ServiceManager] All services are ready!");
    this.emit("all-ready");
  }

  /**
   * Start a single service
   */
  private startService(config: ServiceConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`[ServiceManager] Starting ${config.name}: ${config.command} ${config.args.join(" ")}`);

      const env = {
        ...process.env,
        ...config.env,
        PYTHONPATH: config.cwd,
      };

      const isWin = process.platform === "win32";
      const proc = spawn(config.command, config.args, {
        cwd: config.cwd,
        env,
        stdio: ["ignore", "pipe", "pipe"],
        shell: isWin, // Windows needs shell for .cmd/.exe path resolution
        windowsHide: false,
        // Avoid DEP0190: pass args as array instead of string when shell is true
        // The args array is already used above; this comment documents the choice
      });

      this.processes.set(config.name, proc);
      this.statuses.set(config.name, {
        name: config.name,
        running: true,
        pid: proc.pid,
        ready: false,
      });

      proc.stdout?.on("data", (data: Buffer) => {
        const msg = data.toString().trim();
        if (msg) {
          console.log(`[${config.name}] ${msg}`);
          this.emit("log", config.name, "stdout", msg);
        }
      });

      proc.stderr?.on("data", (data: Buffer) => {
        const msg = data.toString().trim();
        if (msg) {
          console.log(`[${config.name}:err] ${msg}`);
          this.emit("log", config.name, "stderr", msg);
        }
      });

      proc.on("error", (err) => {
        console.error(`[${config.name}] Process error: ${err.message}`);
        const status = this.statuses.get(config.name);
        if (status) {
          status.running = false;
          status.error = err.message;
        }
        this.emit("error", config.name, err);
        reject(err);
      });

      proc.on("exit", (code, signal) => {
        console.log(`[${config.name}] Process exited with code ${code}, signal ${signal}`);
        const status = this.statuses.get(config.name);
        if (status) {
          status.running = false;
          status.ready = false;
        }
        this.emit("exit", config.name, code, signal);

        // Auto-restart crashed services (non-zero exit, not killed by us)
        if (code !== 0 && code !== null && !this.isShuttingDown) {
          console.warn(`[ServiceManager] ${config.name} crashed (code ${code}), attempting restart in 3s...`);
          setTimeout(() => {
            if (!this.isShuttingDown) {
              this.restartService(config);
            }
          }, 3000);
        }
      });

      // Start health checking if configured
      if (config.healthCheckUrl) {
        this.startHealthCheck(config);
      }

      resolve();
    });
  }

  /**
   * Start periodic health checks for a service
   */
  private startHealthCheck(config: ServiceConfig): void {
    const interval = config.healthCheckInterval || 3000;
    const timeout = config.healthCheckTimeout || 60000;
    const startTime = Date.now();

    const timer = setInterval(async () => {
      const status = this.statuses.get(config.name);
      if (!status || !status.running) {
        clearInterval(timer);
        return;
      }

      if (status.ready) {
        clearInterval(timer);
        return;
      }

      // Check timeout
      if (Date.now() - startTime > timeout) {
        console.warn(`[ServiceManager] Health check timeout for ${config.name}`);
        status.error = "Health check timeout";
        clearInterval(timer);
        return;
      }

      // Perform health check
      try {
        const healthy = await this.checkHealth(config.healthCheckUrl!);
        if (healthy) {
          console.log(`[ServiceManager] ${config.name} is healthy!`);
          status.ready = true;
          this.emit("ready", config.name);
          clearInterval(timer);
        }
      } catch {
        // Service not ready yet, keep checking
      }
    }, interval);

    this.healthCheckTimers.set(config.name, timer);
  }

  /**
   * Perform an HTTP health check
   */
  private checkHealth(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(res.statusCode === 200 || res.statusCode === 404); // 404 is ok for some endpoints
      });
      req.on("error", () => resolve(false));
      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Wait for all services to report healthy
   */
  private waitForAllHealthy(configs: ServiceConfig[]): Promise<void> {
    return new Promise((resolve) => {
      const checkReady = () => {
        const allReady = configs.every((c) => {
          const status = this.statuses.get(c.name);
          return status?.ready;
        });
        if (allReady) {
          resolve();
          return;
        }
        setTimeout(checkReady, 1000);
      };
      checkReady();
    });
  }

  /**
   * Stop all backend services
   */
  async stopAll(): Promise<void> {
    console.log("[ServiceManager] Stopping all services...");
    this.isShuttingDown = true;

    // Clear health check timers
    for (const timer of this.healthCheckTimers.values()) {
      clearInterval(timer);
    }
    this.healthCheckTimers.clear();

    const stopPromises: Promise<void>[] = [];
    for (const [name, proc] of this.processes) {
      stopPromises.push(this.stopService(name, proc));
    }

    await Promise.all(stopPromises);
    this.processes.clear();
    console.log("[ServiceManager] All services stopped.");
  }

  /**
   * Stop a single service
   */
  private stopService(name: string, proc: ChildProcess): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(`[ServiceManager] Force killing ${name}...`);
        proc.kill("SIGKILL");
      }, 5000);

      proc.on("exit", () => {
        clearTimeout(timeout);
        const status = this.statuses.get(name);
        if (status) {
          status.running = false;
          status.ready = false;
        }
        resolve();
      });

      console.log(`[ServiceManager] Stopping ${name} (PID: ${proc.pid})...`);
      proc.kill("SIGTERM");
    });
  }

  /**
   * Get current status of all services
   */
  getStatus(): ServiceStatus[] {
    return Array.from(this.statuses.values());
  }

  /**
   * Check if all services are running and healthy
   */
  isAllReady(): boolean {
    const statuses = this.getStatus();
    return statuses.length > 0 && statuses.every((s) => s.ready);
  }

  /**
   * Restart all services (stop then start)
   */
  async restartAll(): Promise<void> {
    console.log("[ServiceManager] Restarting all services...");
    await this.stopAll();
    // Small delay to ensure ports are released
    await new Promise((resolve) => setTimeout(resolve, 1500));
    this.isShuttingDown = false;
    await this.startAll();
    console.log("[ServiceManager] All services restarted.");
  }

  /**
   * Restart a single service
   */
  private async restartService(config: ServiceConfig): Promise<void> {
    console.log(`[ServiceManager] Restarting ${config.name}...`);
    const existingProc = this.processes.get(config.name);
    if (existingProc) {
      existingProc.kill("SIGTERM");
      // Wait for process to exit
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    // Clear old status
    this.statuses.delete(config.name);
    this.processes.delete(config.name);
    // Start fresh
    await this.startService(config);
  }
}
