/**
 * DeerFlow Electron - Enhanced Splash Screen
 *
 * Shows a dedicated splash window during service startup with:
 * - Animated logo and branding
 * - Real-time service status indicators
 * - Progress bar showing overall startup progress
 * - Auto-closes when all services are ready
 */

import * as path from "path";

export interface SplashServiceStatus {
  name: string;
  label: string;
  status: "pending" | "starting" | "ready" | "error";
  error?: string;
}

/**
 * Get the HTML content for the splash screen
 * This is rendered as a data URL in a BrowserWindow
 */
export function getSplashHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DeerFlow - Starting...</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%);
      color: #e5e5e5;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      overflow: hidden;
      user-select: none;
    }

    .splash-container {
      text-align: center;
      max-width: 480px;
      padding: 2.5rem;
      animation: fadeIn 0.6s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .logo-area {
      margin-bottom: 2rem;
    }

    .logo-icon {
      font-size: 4.5rem;
      display: inline-block;
      animation: pulse 2s ease-in-out infinite;
      filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3));
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .logo-title {
      font-size: 1.6rem;
      font-weight: 700;
      background: linear-gradient(135deg, #818cf8, #6366f1, #4f46e5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-top: 0.5rem;
      letter-spacing: -0.02em;
    }

    .logo-subtitle {
      font-size: 0.85rem;
      color: #666;
      margin-top: 0.3rem;
      letter-spacing: 0.05em;
    }

    /* Service Status */
    .services-section {
      margin-top: 2rem;
      text-align: left;
    }

    .service-item {
      display: flex;
      align-items: center;
      padding: 0.6rem 0.8rem;
      margin-bottom: 0.35rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
    }

    .service-item.ready {
      background: rgba(34, 197, 94, 0.08);
      border-color: rgba(34, 197, 94, 0.15);
    }

    .service-item.error {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.15);
    }

    .service-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 0.75rem;
      flex-shrink: 0;
      background: #444;
      transition: all 0.3s ease;
    }

    .service-item.starting .service-indicator {
      background: #eab308;
      animation: blink 1.2s ease-in-out infinite;
    }

    .service-item.ready .service-indicator {
      background: #22c55e;
      box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
    }

    .service-item.error .service-indicator {
      background: #ef4444;
      box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .service-name {
      font-size: 0.85rem;
      font-weight: 500;
      color: #aaa;
      flex: 1;
    }

    .service-item.ready .service-name { color: #22c55e; }
    .service-item.error .service-name { color: #ef4444; }

    .service-status-text {
      font-size: 0.75rem;
      color: #555;
    }

    .service-item.ready .service-status-text { color: #22c55e; }

    /* Progress Bar */
    .progress-section {
      margin-top: 1.5rem;
    }

    .progress-bar-track {
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #4f46e5, #818cf8);
      border-radius: 2px;
      transition: width 0.5s ease;
    }

    .progress-text {
      font-size: 0.72rem;
      color: #555;
      margin-top: 0.5rem;
    }

    /* Version */
    .version-text {
      font-size: 0.7rem;
      color: #333;
      margin-top: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="splash-container">
    <div class="logo-area">
      <div class="logo-icon">🦌</div>
      <div class="logo-title">DeerFlow Agent Platform</div>
      <div class="logo-subtitle">INTELLIGENT AGENT DESKTOP</div>
    </div>

    <div class="services-section">
      <div class="service-item" id="svc-langgraph">
        <div class="service-indicator"></div>
        <span class="service-name">LangGraph Agent Server</span>
        <span class="service-status-text">Waiting</span>
      </div>
      <div class="service-item" id="svc-gateway">
        <div class="service-indicator"></div>
        <span class="service-name">API Gateway</span>
        <span class="service-status-text">Waiting</span>
      </div>
      <div class="service-item" id="svc-frontend">
        <div class="service-indicator"></div>
        <span class="service-name">Frontend Server</span>
        <span class="service-status-text">Waiting</span>
      </div>
      <div class="service-item" id="svc-proxy">
        <div class="service-indicator"></div>
        <span class="service-name">Local Proxy</span>
        <span class="service-status-text">Waiting</span>
      </div>
    </div>

    <div class="progress-section">
      <div class="progress-bar-track">
        <div class="progress-bar-fill" id="progress-fill"></div>
      </div>
      <div class="progress-text" id="progress-text">Initializing services...</div>
    </div>

    <div class="version-text">DeerFlow v2.0 &middot; Electron Desktop</div>
  </div>

  <script>
    const services = {
      langgraph: { el: document.getElementById('svc-langgraph'), ready: false },
      gateway:   { el: document.getElementById('svc-gateway'),   ready: false },
      frontend:  { el: document.getElementById('svc-frontend'),  ready: false },
      proxy:     { el: document.getElementById('svc-proxy'),     ready: false },
    };
    const total = Object.keys(services).length;
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    function updateProgress() {
      const readyCount = Object.values(services).filter(s => s.ready).length;
      const pct = Math.round((readyCount / total) * 100);
      progressFill.style.width = pct + '%';

      if (readyCount === total) {
        progressText.textContent = 'All services ready! Loading interface...';
      } else {
        progressText.textContent = 'Starting services (' + readyCount + '/' + total + ')...';
      }
    }

    function setServiceStatus(name, status, error) {
      const svc = services[name];
      if (!svc) return;

      const el = svc.el;
      el.className = 'service-item ' + status;

      const statusText = el.querySelector('.service-status-text');
      const statusMap = {
        pending: 'Waiting',
        starting: 'Starting...',
        ready: 'Ready ✓',
        error: error || 'Failed ✗'
      };
      statusText.textContent = statusMap[status] || status;

      if (status === 'ready') {
        svc.ready = true;
      }
      updateProgress();
    }

    // Listen for IPC events from main process
    if (window.electronAPI && window.electronAPI.services) {
      window.electronAPI.services.onLog(function(data) {
        // Map log events to service status
        const nameMap = { langgraph: 'langgraph', gateway: 'gateway', frontend: 'frontend' };
        const svcName = nameMap[data.name];
        if (svcName && !services[svcName].ready) {
          setServiceStatus(svcName, 'starting');
        }
      });

      window.electronAPI.services.onReady(function(name) {
        setServiceStatus(name, 'ready');
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Get the service status dashboard HTML (accessible via tray or devtools)
 */
export function getStatusDashboardHTML(
  statuses: Array<{ name: string; running: boolean; ready: boolean; pid?: number; error?: string }>,
  ports: { proxy: number; langgraph: number; gateway: number; frontend: number }
): string {
  const statusRows = statuses
    .map(
      (s) => `
    <div class="status-row ${s.ready ? "healthy" : s.running ? "starting" : "stopped"}">
      <div class="status-dot"></div>
      <div class="status-info">
        <span class="status-name">${s.name}</span>
        <span class="status-detail">${
          s.ready
            ? "Running"
            : s.running
              ? "Starting..."
              : s.error || "Stopped"
        }${s.pid ? " (PID: " + s.pid + ")" : ""}</span>
      </div>
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DeerFlow - Service Status</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f0f; color: #e5e5e5;
      padding: 2rem; min-height: 100vh;
    }
    h1 { font-size: 1.2rem; margin-bottom: 0.3rem; }
    .subtitle { color: #666; font-size: 0.8rem; margin-bottom: 1.5rem; }
    .status-row {
      display: flex; align-items: center; padding: 0.8rem 1rem;
      background: #1a1a1a; border: 1px solid #2a2a2a;
      border-radius: 8px; margin-bottom: 0.5rem;
    }
    .status-dot {
      width: 10px; height: 10px; border-radius: 50%;
      margin-right: 1rem; flex-shrink: 0;
    }
    .healthy .status-dot { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.4); }
    .starting .status-dot { background: #eab308; animation: blink 1s infinite; }
    .stopped .status-dot { background: #ef4444; }
    @keyframes blink { 50% { opacity: 0.3; } }
    .status-info { flex: 1; }
    .status-name { font-weight: 600; font-size: 0.9rem; display: block; }
    .status-detail { font-size: 0.75rem; color: #888; }
    .ports { margin-top: 1.5rem; font-size: 0.8rem; color: #888; }
    .ports span { display: inline-block; background: #1a1a1a; padding: 0.3rem 0.7rem;
      border-radius: 4px; margin: 0.2rem; border: 1px solid #333; font-family: monospace; }
    .actions { margin-top: 1.5rem; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 6px;
      font-size: 0.8rem; cursor: pointer; margin-right: 0.5rem; }
    .btn-primary { background: #4f46e5; color: white; }
    .btn-primary:hover { background: #4338ca; }
    .btn-secondary { background: #333; color: #ccc; }
    .btn-secondary:hover { background: #444; }
  </style>
</head>
<body>
  <h1>🦌 DeerFlow Service Status</h1>
  <p class="subtitle">Backend service monitoring dashboard</p>
  ${statusRows}
  <div class="ports">
    <span>Proxy: :${ports.proxy}</span>
    <span>LangGraph: :${ports.langgraph}</span>
    <span>Gateway: :${ports.gateway}</span>
    <span>Frontend: :${ports.frontend}</span>
  </div>
  <div class="actions">
    <button class="btn btn-primary" onclick="window.electronAPI.services.restart().then(()=>location.reload())">Restart Services</button>
    <button class="btn btn-secondary" onclick="location.reload()">Refresh</button>
  </div>
  <script>
    // Auto-refresh every 5 seconds
    setTimeout(() => location.reload(), 5000);
  </script>
</body>
</html>`;
}
