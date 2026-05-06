/**
 * DeerFlow Electron - Diagnostics & Debug Tool
 *
 * Comprehensive system diagnostics for troubleshooting:
 * - Export logs (structured JSON logs + system info)
 * - Service health checks
 * - System information collection
 * - Network connectivity tests
 * - Configuration validation
 *
 * Accessible via Help menu or keyboard shortcut.
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as http from "http";
import { EventEmitter } from "events";

export interface SystemInfo {
  platform: string;
  arch: string;
  osRelease: string;
  totalMemory: string;
  freeMemory: string;
  cpuCount: number;
  nodeVersion: string;
  electronVersion?: string;
  appVersion: string;
  uptime: string;
}

export interface ServiceHealth {
  name: string;
  url: string;
  status: "healthy" | "unhealthy" | "unknown";
  responseTime?: number;
  statusCode?: number;
  error?: string;
}

export interface DiagnosticReport {
  timestamp: string;
  appVersion: string;
  system: SystemInfo;
  services: ServiceHealth[];
  config: {
    configYamlExists: boolean;
    envFileExists: boolean;
    hasModels: boolean;
    modelCount: number;
  };
  logs: {
    logDirExists: boolean;
    recentLogCount: number;
    logFiles: string[];
  };
  network: {
    proxyReachable: boolean;
    ports: Record<string, boolean>;
  };
}

export class DiagnosticsManager extends EventEmitter {
  private projectRoot: string;
  private appVersion: string;

  constructor(projectRoot: string, appVersion: string) {
    super();
    this.projectRoot = projectRoot;
    this.appVersion = appVersion;
  }

  /**
   * Collect comprehensive system information
   */
  async collectSystemInfo(): Promise<SystemInfo> {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    return {
      platform: process.platform,
      arch: process.arch,
      osRelease: os.release(),
      totalMemory: this.formatBytes(totalMem),
      freeMemory: this.formatBytes(freeMem),
      cpuCount: os.cpus().length,
      nodeVersion: process.version,
      electronVersion: process.versions.electron,
      appVersion: this.appVersion,
      uptime: this.formatDuration(process.uptime()),
    };
  }

  /**
   * Check health of all services
   */
  async checkServicesHealth(
    ports: Record<string, number>
  ): Promise<ServiceHealth[]> {
    const checks: ServiceHealth[] = [];

    const services = [
      { name: "Proxy", url: `http://localhost:${ports.proxy}/api/health` },
      { name: "LangGraph", url: `http://localhost:${ports.langgraph}/ok` },
      { name: "Gateway", url: `http://localhost:${ports.gateway}/health` },
      { name: "Frontend", url: `http://localhost:${ports.frontend}` },
    ];

    for (const service of services) {
      const health = await this.checkEndpoint(service.name, service.url);
      checks.push(health);
    }

    return checks;
  }

  /**
   * Check a single HTTP endpoint
   */
  private async checkEndpoint(
    name: string,
    url: string
  ): Promise<ServiceHealth> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const req = http.get(url, (res) => {
        const responseTime = Date.now() - startTime;
        res.resume();

        resolve({
          name,
          url,
          status: res.statusCode === 200 ? "healthy" : "unhealthy",
          responseTime,
          statusCode: res.statusCode,
        });
      });

      req.on("error", (err) => {
        resolve({
          name,
          url,
          status: "unhealthy",
          error: err.message,
        });
      });

      req.setTimeout(5000, () => {
        req.destroy();
        resolve({
          name,
          url,
          status: "unhealthy",
          error: "Connection timeout",
        });
      });
    });
  }

  /**
   * Check if required ports are available
   */
  async checkPorts(ports: number[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const port of ports) {
      results[port.toString()] = await this.isPortReachable(port);
    }

    return results;
  }

  /**
   * Check if a port is reachable
   */
  private async isPortReachable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${port}`, (res) => {
        res.resume();
        resolve(true);
      });
      req.on("error", () => resolve(false));
      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Collect configuration status
   */
  async collectConfigStatus(): Promise<DiagnosticReport["config"]> {
    const configYamlPath = path.join(this.projectRoot, "config.yaml");
    const envPath = path.join(this.projectRoot, ".env");

    let hasModels = false;
    let modelCount = 0;

    try {
      if (fs.existsSync(configYamlPath)) {
        const content = fs.readFileSync(configYamlPath, "utf-8");
        const modelsMatch = content.match(/models:\s*\n((?:  - .*(?:\n|$))*)/);
        if (modelsMatch) {
          const modelLines = modelsMatch[1].trim().split("\n").filter((l) => l.trim().startsWith("-"));
          modelCount = modelLines.length;
          hasModels = modelCount > 0;
        }
      }
    } catch {
      // ignore
    }

    return {
      configYamlExists: fs.existsSync(configYamlPath),
      envFileExists: fs.existsSync(envPath),
      hasModels,
      modelCount,
    };
  }

  /**
   * Collect log file information
   */
  async collectLogInfo(): Promise<DiagnosticReport["logs"]> {
    const logDir = path.join(this.projectRoot, ".deerflow", "logs");

    if (!fs.existsSync(logDir)) {
      return {
        logDirExists: false,
        recentLogCount: 0,
        logFiles: [],
      };
    }

    try {
      const files = fs.readdirSync(logDir);
      const logFiles = files.filter((f) => f.endsWith(".log"));

      let recentLogCount = 0;
      const mainLog = path.join(logDir, "deerflow.log");
      if (fs.existsSync(mainLog)) {
        const content = fs.readFileSync(mainLog, "utf-8");
        recentLogCount = content.split("\n").filter((l) => l.trim()).length;
      }

      return {
        logDirExists: true,
        recentLogCount,
        logFiles,
      };
    } catch {
      return {
        logDirExists: true,
        recentLogCount: 0,
        logFiles: [],
      };
    }
  }

  /**
   * Generate a full diagnostic report
   */
  async generateReport(
    servicePorts: Record<string, number>
  ): Promise<DiagnosticReport> {
    this.emit("report-start");

    const [system, services, config, logs, ports] = await Promise.all([
      this.collectSystemInfo(),
      this.checkServicesHealth(servicePorts),
      this.collectConfigStatus(),
      this.collectLogInfo(),
      this.checkPorts(Object.values(servicePorts)),
    ]);

    const report: DiagnosticReport = {
      timestamp: new Date().toISOString(),
      appVersion: this.appVersion,
      system,
      services,
      config,
      logs,
      network: {
        proxyReachable: services.some(
          (s) => s.name === "Proxy" && s.status === "healthy"
        ),
        ports,
      },
    };

    this.emit("report-complete", report);
    return report;
  }

  /**
   * Export diagnostic report to a file
   */
  async exportReport(
    report: DiagnosticReport,
    outputPath?: string
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const targetPath =
        outputPath ||
        path.join(
          os.homedir(),
          "Desktop",
          `deerflow-diagnostics-${Date.now()}.json`
        );

      // Ensure directory exists
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(targetPath, JSON.stringify(report, null, 2), "utf-8");

      this.emit("export-complete", targetPath);
      return { success: true, path: targetPath };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Export logs to a zip-like directory (copies log files)
   */
  async exportLogs(
    outputDir?: string
  ): Promise<{ success: boolean; path?: string; error?: string }> {
    try {
      const logDir = path.join(this.projectRoot, ".deerflow", "logs");
      const targetDir =
        outputDir ||
        path.join(os.homedir(), "Desktop", `deerflow-logs-${Date.now()}`);

      if (!fs.existsSync(logDir)) {
        return { success: false, error: "No log directory found" };
      }

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const files = fs.readdirSync(logDir);
      for (const file of files) {
        const src = path.join(logDir, file);
        const dst = path.join(targetDir, file);
        fs.copyFileSync(src, dst);
      }

      return { success: true, path: targetDir };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Format seconds to human readable duration
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }
}

/**
 * Generate the diagnostics dashboard HTML
 */
export function getDiagnosticsHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DeerFlow - Diagnostics</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      min-height: 100vh;
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #333;
    }

    .header h1 {
      font-size: 1.5rem;
      background: linear-gradient(135deg, #818cf8, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
    }

    .btn-primary:hover { opacity: 0.9; }

    .btn-secondary {
      background: transparent;
      color: #888;
      border: 1px solid #444;
    }

    .btn-secondary:hover { border-color: #666; color: #ccc; }

    /* Grid layout */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid #333;
      border-radius: 10px;
      padding: 1.25rem;
    }

    .card-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #aaa;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Status items */
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .status-item:last-child { border-bottom: none; }

    .status-label {
      font-size: 0.85rem;
      color: #888;
    }

    .status-value {
      font-size: 0.85rem;
      font-weight: 500;
      color: #e5e5e5;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-healthy { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .status-unhealthy { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    .status-unknown { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }

    /* Loading state */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      color: #666;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #333;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 0.75rem;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;
    }

    .empty-state-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    /* Toast notification */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 0.75rem 1.25rem;
      background: #1a1a2e;
      border: 1px solid #333;
      border-radius: 8px;
      color: #e5e5e5;
      font-size: 0.85rem;
      animation: slideUp 0.3s ease;
      z-index: 1000;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔍 Diagnostics & Debug</h1>
    <div class="header-actions">
      <button class="btn btn-secondary" onclick="runDiagnostics()">🔄 Refresh</button>
      <button class="btn btn-primary" onclick="exportReport()">📋 Export Report</button>
      <button class="btn btn-secondary" onclick="exportLogs()">📁 Export Logs</button>
    </div>
  </div>

  <div id="content">
    <div class="loading">
      <div class="spinner"></div>
      Running diagnostics...
    </div>
  </div>

  <script>
    let currentReport = null;

    async function runDiagnostics() {
      document.getElementById('content').innerHTML = '
        <div class="loading">
          <div class="spinner"></div>
          Running diagnostics...
        </div>
      ';

      try {
        const report = await window.electronAPI.diagnostics.run();
        currentReport = report;
        renderReport(report);
      } catch (err) {
        document.getElementById('content').innerHTML = '
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <div>Failed to run diagnostics: ' + err.message + '</div>
          </div>
        ';
      }
    }

    function renderReport(report) {
      const system = report.system;
      const services = report.services;
      const config = report.config;
      const logs = report.logs;

      const healthyCount = services.filter(s => s.status === 'healthy').length;
      const serviceStatusClass = healthyCount === services.length ? 'status-healthy' : 'status-unhealthy';

      document.getElementById('content').innerHTML = '
        <div class="grid">
          <div class="card">
            <div class="card-title">System Information</div>
            <div class="status-item"><span class="status-label">Platform</span><span class="status-value">' + system.platform + ' (' + system.arch + ')</span></div>
            <div class="status-item"><span class="status-label">OS Version</span><span class="status-value">' + system.osRelease + '</span></div>
            <div class="status-item"><span class="status-label">Memory</span><span class="status-value">' + system.freeMemory + ' / ' + system.totalMemory + '</span></div>
            <div class="status-item"><span class="status-label">CPUs</span><span class="status-value">' + system.cpuCount + ' cores</span></div>
            <div class="status-item"><span class="status-label">Node.js</span><span class="status-value">' + system.nodeVersion + '</span></div>
            <div class="status-item"><span class="status-label">Electron</span><span class="status-value">' + (system.electronVersion || 'N/A') + '</span></div>
            <div class="status-item"><span class="status-label">App Version</span><span class="status-value">' + system.appVersion + '</span></div>
            <div class="status-item"><span class="status-label">Uptime</span><span class="status-value">' + system.uptime + '</span></div>
          </div>

          <div class="card">
            <div class="card-title">Services (' + healthyCount + '/' + services.length + ' healthy)</div>
            ' + services.map(s => '
              <div class="status-item">
                <span class="status-label">' + s.name + '</span>
                <span class="status-badge status-' + s.status + '">' + (s.status === 'healthy' ? '✓ ' : '✗ ') + s.status + '</span>
              </div>
              ' + (s.responseTime ? '<div style="font-size: 0.75rem; color: #666; padding-left: 0.5rem;">' + s.responseTime + 'ms</div>' : '') + '
            ').join('') + '
          </div>

          <div class="card">
            <div class="card-title">Configuration</div>
            <div class="status-item"><span class="status-label">config.yaml</span><span class="status-badge ' + (config.configYamlExists ? 'status-healthy' : 'status-unhealthy') + '">' + (config.configYamlExists ? '✓ Found' : '✗ Missing') + '</span></div>
            <div class="status-item"><span class="status-label">.env file</span><span class="status-badge ' + (config.envFileExists ? 'status-healthy' : 'status-unknown') + '">' + (config.envFileExists ? '✓ Found' : '⚠ Missing') + '</span></div>
            <div class="status-item"><span class="status-label">Models</span><span class="status-value">' + config.modelCount + ' configured</span></div>
          </div>

          <div class="card">
            <div class="card-title">Logs</div>
            <div class="status-item"><span class="status-label">Log Directory</span><span class="status-badge ' + (logs.logDirExists ? 'status-healthy' : 'status-unknown') + '">' + (logs.logDirExists ? '✓ Found' : '⚠ Missing') + '</span></div>
            <div class="status-item"><span class="status-label">Recent Entries</span><span class="status-value">' + logs.recentLogCount + ' lines</span></div>
            <div class="status-item"><span class="status-label">Log Files</span><span class="status-value">' + logs.logFiles.length + ' files</span></div>
          </div>
        </div>
      ';
    }

    async function exportReport() {
      if (!currentReport) {
        showToast('Please run diagnostics first');
        return;
      }
      const result = await window.electronAPI.diagnostics.exportReport(currentReport);
      if (result.success) {
        showToast('Report exported to: ' + result.path);
      } else {
        showToast('Export failed: ' + result.error);
      }
    }

    async function exportLogs() {
      const result = await window.electronAPI.diagnostics.exportLogs();
      if (result.success) {
        showToast('Logs exported to: ' + result.path);
      } else {
        showToast('Export failed: ' + result.error);
      }
    }

    function showToast(message) {
      const existing = document.querySelector('.toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = message;
      document.body.appendChild(toast);

      setTimeout(() => toast.remove(), 4000);
    }

    // Auto-run on load
    runDiagnostics();
  </script>
</body>
</html>`;
}
