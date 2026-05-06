/**
 * DeerFlow Electron - Main Process (v2)
 *
 * Entry point for the Electron application.
 * Manages the main window, backend service lifecycle, and built-in proxy.
 * Integrates: window state persistence, splash screen, notifications,
 * file drop handling, and configuration management.
 *
 * Iteration 2 enhancements:
 * - Window state persistence (remember size/position/maximized)
 * - Enhanced splash screen with real-time service status
 * - Desktop notifications via native OS notification center
 * - File drag-and-drop support
 * - Configuration file management IPC
 * - Service status dashboard
 */

// Use require for electron to avoid TS __importStar issues
const electron = require("electron");
const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  dialog,
  shell,
  Tray,
  nativeImage,
} = electron;
import * as path from "path";
import * as fs from "fs";
import { ServiceManager } from "./services";
import type { ServiceStatus } from "./services";
import { ProxyServer } from "./proxy";
import { StaticServer } from "./static-server";
import { createWindowStateTracker } from "./window-state";
import { getSplashHTML, getStatusDashboardHTML } from "./splash";
import { DesktopNotifications } from "./notifications";
import { FileDropHandler } from "./file-drop";
import { ConfigManager } from "./config-manager";
import { getSettingsHTML } from "./settings";
import { initLogger, getLogger } from "./logger";
import { StartupOptimizer, retryWithBackoff } from "./startup-optimizer";
import { AutoUpdater } from "./updater";
import { TelemetryManager } from "./telemetry";
import { getOnboardingHTML } from "./onboarding";
import { DiagnosticsManager, getDiagnosticsHTML } from "./diagnostics";
import { ShortcutsManager, getShortcutsHTML } from "./shortcuts";
import { ThemeManager } from "./theme-manager";
import { MCPManager } from "./mcp-manager";
import { AgentSessionManager } from "./agent-session";
import { WorkflowOrchestrator } from "./workflow-orchestrator";
import { ContextManager } from "./context-manager";
import { SkillManager } from "./skill-manager";
import { AgentEventBus } from "./event-bus";
import { PerformanceMonitor } from "./performance-monitor";
import { AgentReasoningEngine } from "./agent-reasoning";
import { KnowledgeGraphManager } from "./knowledge-graph";
import { TaskScheduler } from "./scheduler";
import { AuditLogger } from "./audit-logger";
import { AgentBridge } from "./agent-bridge";
import { SecurityManager } from "./security-manager";
import { PluginManager } from "./plugin-manager";
import { AgentCollaborationHub } from "./agent-collaboration";
import { ConversationMemoryEngine } from "./conversation-memory";
import { ToolRegistry } from "./tool-registry";
import { HealthMonitor } from "./health-monitor";
import { WebSocketManager } from "./websocket-manager";
import { TrayNotificationManager } from "./tray-notifications";
import { BackupService } from "./backup-service";
import { SessionExportService } from "./session-export-service";
import { ChartsDataPipeline } from "./charts-data-pipeline";
import { StateSyncService } from "./state-sync-service";
import { PluginSDKValidator } from "./plugin-sdk-validator";
import { MarketplaceService } from "./marketplace-service";
import { AgentContextManager } from "./agent-context-manager";

// ============================================================
// Constants
// ============================================================

const PROXY_PORT = 2026;
const LANGGRAPH_PORT = 2024;
const GATEWAY_PORT = 8001;
const FRONTEND_PORT = 3000;
const STATIC_PORT = 3456; // Port for static file server in production mode
const LOAD_URL = `http://localhost:${PROXY_PORT}`;
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Detect if we're in production mode (static files available)
const STATIC_DIR = path.join(PROJECT_ROOT, "frontend", "dist-static");
const isProductionMode = (): boolean => {
  try {
    const fs = require("fs");
    return fs.existsSync(path.join(STATIC_DIR, "index.html"));
  } catch {
    return false;
  }
};

// ============================================================
// Globals
// ============================================================

let mainWindow: InstanceType<typeof BrowserWindow> | null = null;
let splashWindow: InstanceType<typeof BrowserWindow> | null = null;
let tray: InstanceType<typeof Tray> | null = null;
let serviceManager: ServiceManager | null = null;
let proxyServer: ProxyServer | null = null;
let staticServer: StaticServer | null = null;
let notifications: DesktopNotifications | null = null;
let fileDropHandler: FileDropHandler | null = null;
let configManager: ConfigManager | null = null;
let windowState: ReturnType<typeof createWindowStateTracker> | null = null;
let isQuitting = false;
let logger = initLogger(PROJECT_ROOT);
let startupOptimizer: StartupOptimizer | null = null;
let autoUpdater: AutoUpdater | null = null;
let telemetry: TelemetryManager | null = null;
let diagnostics: DiagnosticsManager | null = null;
let shortcutsManager: ShortcutsManager | null = null;
let themeManager: ThemeManager | null = null;
let mcpManager: MCPManager | null = null;
let agentSessionManager: AgentSessionManager | null = null;
let workflowOrchestrator: WorkflowOrchestrator | null = null;
let contextManager: ContextManager | null = null;
let skillManager: SkillManager | null = null;
let eventBus: AgentEventBus | null = null;
let performanceMonitor: PerformanceMonitor | null = null;
let reasoningEngine: AgentReasoningEngine | null = null;
let knowledgeGraph: KnowledgeGraphManager | null = null;
let taskScheduler: TaskScheduler | null = null;
let auditLogger: AuditLogger | null = null;
let agentBridge: AgentBridge | null = null;
let securityManager: SecurityManager | null = null;
let pluginManager: PluginManager | null = null;
let collaborationHub: AgentCollaborationHub | null = null;
let conversationMemory: ConversationMemoryEngine | null = null;
let toolRegistry: ToolRegistry | null = null;
let healthMonitor: HealthMonitor | null = null;
let websocketManager: WebSocketManager | null = null;
let trayNotificationManager: TrayNotificationManager | null = null;
let backupService: BackupService | null = null;
let sessionExportService: SessionExportService | null = null;
let chartsDataPipeline: ChartsDataPipeline | null = null;
let stateSyncService: StateSyncService | null = null;
let pluginSdkValidator: PluginSDKValidator | null = null;
let marketplaceService: MarketplaceService | null = null;
let agentContextManager: AgentContextManager | null = null;

// ============================================================
// First-Run State (persisted to disk)
// ============================================================

const FIRST_RUN_FLAG_PATH = path.join(PROJECT_ROOT, ".deerflow", "first-run.json");

function getFirstRunState(): { hasBeenWelcomed: boolean; lastCheckAt?: string } {
  try {
    const fs = require("fs");
    if (fs.existsSync(FIRST_RUN_FLAG_PATH)) {
      return JSON.parse(fs.readFileSync(FIRST_RUN_FLAG_PATH, "utf-8"));
    }
  } catch {
    // ignore
  }
  return { hasBeenWelcomed: false };
}

function setFirstRunState(state: { hasBeenWelcomed: boolean }): void {
  try {
    const fs = require("fs");
    const dir = path.dirname(FIRST_RUN_FLAG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      FIRST_RUN_FLAG_PATH,
      JSON.stringify({ ...state, lastCheckAt: new Date().toISOString() }, null, 2),
      "utf-8"
    );
  } catch {
    // ignore
  }
}

function isFirstRun(): boolean {
  return !getFirstRunState().hasBeenWelcomed;
}

function markFirstRunWelcomed(): void {
  setFirstRunState({ hasBeenWelcomed: true });
}

// ============================================================
// Window Management
// ============================================================

function createMainWindow(): InstanceType<typeof BrowserWindow> {
  const initialState = windowState!.getInitialState();

  mainWindow = new BrowserWindow({
    width: initialState.width,
    height: initialState.height,
    minWidth: 1024,
    minHeight: 700,
    ...(initialState.x !== undefined && initialState.y !== undefined
      ? { x: initialState.x, y: initialState.y }
      : { center: true }),
    title: "DeerFlow - Intelligent Agent Platform",
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false, // Show after splash completes
    backgroundColor: "#0a0a0a",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
  });

  // Track window state changes (resize, move, maximize)
  windowState!.track(mainWindow);

  // Restore maximized state
  if (initialState.isMaximized) {
    mainWindow.maximize();
  }

  // Show window when content is loaded
  mainWindow.once("ready-to-show", () => {
    // Don't show immediately - wait for splash to finish
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Handle navigation (keep within the app)
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (
      url.startsWith("http://localhost:") ||
      url.startsWith("http://127.0.0.1:")
    ) {
      return;
    }
    event.preventDefault();
    shell.openExternal(url);
  });

  // Offline detection: monitor proxy connectivity
  setupOfflineDetection();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  return mainWindow;
}

function createSplashWindow(): InstanceType<typeof BrowserWindow> {
  splashWindow = new BrowserWindow({
    width: 500,
    height: 420,
    transparent: false,
    frame: false,
    resizable: false,
    center: true,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: true,
  });

  splashWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(getSplashHTML())}`
  );

  splashWindow.on("closed", () => {
    splashWindow = null;
  });

  return splashWindow;
}

function getAppIcon(): Electron.NativeImage | undefined {
  const iconPaths = [
    path.join(PROJECT_ROOT, "frontend", "public", "images", "logo.svg"),
    path.join(PROJECT_ROOT, "frontend", "public", "favicon.ico"),
  ];

  for (const iconPath of iconPaths) {
    try {
      return nativeImage.createFromPath(iconPath);
    } catch {
      // Continue to next path
    }
  }
  return undefined;
}

// ============================================================
// Application Menu
// ============================================================

function createAppMenu(): InstanceType<typeof Menu> {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "DeerFlow",
      submenu: [
        { role: "about", label: "About DeerFlow" },
        { type: "separator" },
        {
          label: "Preferences",
          accelerator: "CmdOrCtrl+,",
          click: () => {
            showSettings();
          },
        },
        { type: "separator" },
        {
          label: "Service Status",
          accelerator: "CmdOrCtrl+Shift+S",
          click: () => {
            showServiceStatusDashboard();
          },
        },
        {
          label: "Check for Updates",
          click: () => {
            autoUpdater?.checkForUpdates();
          },
        },
        { type: "separator" },
        { role: "quit", label: "Quit DeerFlow" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "New Chat",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            navigateTo("/workspace/chats/new");
          },
        },
        {
          label: "Toggle Sidebar",
          accelerator: "CmdOrCtrl+B",
          click: () => {
            mainWindow?.webContents.executeJavaScript(`
              (function() {
                const btn = document.querySelector('[data-testid="sidebar-toggle"]') ||
                           document.querySelector('button[aria-label*="sidebar" i]') ||
                           document.querySelector('button[title*="sidebar" i]');
                if (btn) btn.click();
              })();
            `).catch(() => {});
          },
        },
        { type: "separator" },
        {
          label: "Toggle Theme",
          accelerator: "CmdOrCtrl+Shift+T",
          click: () => {
            themeManager?.toggle();
            const newTheme = themeManager?.getEffectiveTheme();
            mainWindow?.webContents.send("theme-changed", newTheme);
          },
        },
        { type: "separator" },
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => mainWindow?.reload(),
        },
        {
          label: "Force Reload",
          accelerator: "CmdOrCtrl+Shift+R",
          click: () => mainWindow?.webContents.reloadIgnoringCache(),
        },
        { type: "separator" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Getting Started",
          click: () => showOnboarding(),
        },
        { type: "separator" },
        {
          label: "DeerFlow Documentation",
          click: () =>
            shell.openExternal("https://github.com/bytedance/deer-flow"),
        },
        {
          label: "Report Issue",
          click: () =>
            shell.openExternal(
              "https://github.com/bytedance/deer-flow/issues"
            ),
        },
        { type: "separator" },
        {
          label: "Service Status Dashboard",
          click: () => showServiceStatusDashboard(),
        },
        {
          label: "Diagnostics & Debug",
          accelerator: "CmdOrCtrl+Shift+D",
          click: () => showDiagnostics(),
        },
        { type: "separator" },
        {
          label: "Keyboard Shortcuts",
          click: () => showShortcuts(),
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}

// ============================================================
// System Tray
// ============================================================

function createTray(): void {
  const icon = getAppIcon() || nativeImage.createEmpty();
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  tray.setToolTip("DeerFlow Agent Platform");

  const buildContextMenu = () => {
    const recentChatItems: Electron.MenuItemConstructorOptions[] = [];
    try {
      const fs = require("fs");
      const historyPath = path.join(app.getPath("userData"), "chat-history.json");
      if (fs.existsSync(historyPath)) {
        const data = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
        const recent = (data.recentChats ?? []).slice(0, 5);
        if (recent.length > 0) {
          recentChatItems.push({ type: "separator" });
          recentChatItems.push({ label: "Recent Chats", enabled: false });
          for (const chat of recent) {
            recentChatItems.push({
              label: chat.title?.substring(0, 40) || "Untitled",
              click: () => {
                mainWindow?.show();
                mainWindow?.focus();
                navigateTo(`/workspace/chats/${chat.id}`);
              },
            });
          }
        }
      }
    } catch {
      // ignore
    }

    return Menu.buildFromTemplate([
      {
        label: "Open DeerFlow",
        click: () => {
          mainWindow?.show();
          mainWindow?.focus();
        },
      },
      { type: "separator" },
      {
        label: "New Chat",
        click: () => {
          mainWindow?.show();
          mainWindow?.focus();
          navigateTo("/workspace/chats/new");
        },
      },
      ...recentChatItems,
      { type: "separator" },
      {
        label: "Settings",
        click: () => {
          showSettings();
        },
      },
      {
        label: "Service Status",
        click: () => {
          showServiceStatusDashboard();
        },
      },
      {
        label: "Diagnostics",
        click: () => {
          showDiagnostics();
        },
      },
      { type: "separator" },
      {
        label: "Restart Services",
        click: async () => {
          if (serviceManager) {
            await serviceManager.stopAll();
            serviceManager = new ServiceManager(PROJECT_ROOT);
            await serviceManager.startAll();
            notifications?.send({
              title: "Services Restarted",
              body: "All backend services have been restarted",
              category: "service",
              silent: true,
            });
          }
        },
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ]);
  };

  tray.setContextMenu(buildContextMenu());
  tray.on("click", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Refresh tray menu when chat history changes
  ipcMain.on("chat-history-updated", () => {
    if (tray) {
      tray.setContextMenu(buildContextMenu());
    }
  });
}

// ============================================================
// IPC Handlers
// ============================================================

function setupIPC(): void {
  // ---- Service Management ----
  ipcMain.handle("services:get-status", (): ServiceStatus[] => {
    return serviceManager?.getStatus() || [];
  });

  ipcMain.handle("services:restart", async () => {
    try {
      if (serviceManager) {
        await serviceManager.restartAll();
      } else {
        serviceManager = new ServiceManager(PROJECT_ROOT);
        await serviceManager.startAll();
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // ---- Desktop Notifications ----
  ipcMain.handle(
    "notifications:send",
    (_event, options: import("./notifications").NotificationOptions) => {
      return notifications?.send(options) || { success: false, error: "Notifications not initialized", id: "" };
    }
  );

  ipcMain.handle("notifications:is-supported", () => {
    return notifications?.isSupported() || false;
  });

  // ---- File Operations ----
  ipcMain.handle("files:read-base64", (_event, filePath: string) => {
    return fileDropHandler?.readFileAsBase64(filePath) || { success: false, error: "File handler not initialized" };
  });

  ipcMain.handle(
    "files:copy-to-upload",
    (_event, filePath: string, threadId: string) => {
      return (
        fileDropHandler?.copyToThreadUpload(filePath, threadId) || {
          success: false,
          error: "File handler not initialized",
        }
      );
    }
  );

  // ---- Configuration Management ----
  ipcMain.handle(
    "config:read",
    (_event, filename: "config" | "env" | "extensions") => {
      return (
        configManager?.readConfig(filename) || {
          success: false,
          error: "Config manager not initialized",
        }
      );
    }
  );

  ipcMain.handle(
    "config:write",
    (
      _event,
      filename: "config" | "env" | "extensions",
      content: string
    ) => {
      return (
        configManager?.writeConfig(filename, content) || {
          success: false,
          error: "Config manager not initialized",
        }
      );
    }
  );

  ipcMain.handle("config:get-models", () => {
    return (
      configManager?.getModelConfigs() || {
        success: false,
        error: "Config manager not initialized",
      }
    );
  });

  ipcMain.handle("config:get-env-vars", () => {
    return (
      configManager?.getEnvVariables() || {
        success: false,
        error: "Config manager not initialized",
      }
    );
  });

  ipcMain.handle(
    "config:set-env-var",
    (_event, key: string, value: string) => {
      return (
        configManager?.setEnvVariable(key, value) || {
          success: false,
          error: "Config manager not initialized",
        }
      );
    }
  );

  ipcMain.handle("config:get-summary", () => {
    return (
      configManager?.getConfigSummary() || {
        hasModels: false,
        modelCount: 0,
        hasEnvVars: false,
        envVarCount: 0,
        models: [],
      }
    );
  });

  ipcMain.handle(
    "config:add-model",
    (_event, model: Record<string, any>) => {
      return (
        configManager?.addModel(model) || {
          success: false,
          error: "Config manager not initialized",
        }
      );
    }
  );

  ipcMain.handle(
    "config:remove-model",
    (_event, name: string) => {
      return (
        configManager?.removeModel(name) || {
          success: false,
          error: "Config manager not initialized",
        }
      );
    }
  );

  // ---- Settings Window ----
  ipcMain.handle("settings:open", () => {
    showSettings();
  });

  // ---- Dialog ----
  ipcMain.handle("dialog:open-folder", async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ["openDirectory"],
    });
    return result.filePaths[0] || null;
  });

  ipcMain.handle(
    "dialog:open-file",
    async (
      _event,
      filters?: Array<{ name: string; extensions: string[] }>
    ) => {
      const result = await dialog.showOpenDialog(mainWindow!, {
        properties: ["openFile", "multiSelections"],
        filters: filters || [
          { name: "All Files", extensions: ["*"] },
          { name: "Images", extensions: ["png", "jpg", "jpeg", "gif", "svg", "webp"] },
          { name: "Documents", extensions: ["pdf", "doc", "docx", "txt", "md"] },
          { name: "Code", extensions: ["js", "ts", "py", "json", "yaml", "yml"] },
        ],
      });
      return result.filePaths.length > 0 ? result.filePaths : null;
    }
  );

  // ---- Shell ----
  ipcMain.handle("shell:open-external", (_event, url: string) => {
    shell.openExternal(url);
  });

  ipcMain.handle("shell:open-path", (_event, p: string) => {
    shell.openPath(p);
  });

  // ---- App Info ----
  ipcMain.handle("app:get-version", () => {
    return app.getVersion();
  });

  ipcMain.handle("app:get-project-root", () => {
    return PROJECT_ROOT;
  });

  ipcMain.handle("app:get-platform", () => {
    return process.platform;
  });

  ipcMain.handle("app:get-config", () => {
    return {
      proxyPort: PROXY_PORT,
      langgraphPort: LANGGRAPH_PORT,
      gatewayPort: GATEWAY_PORT,
      frontendPort: FRONTEND_PORT,
    };
  });

  ipcMain.handle("app:get-startup-metrics", () => {
    return startupOptimizer?.getMetrics() || null;
  });

  // ---- Onboarding ----
  ipcMain.handle("onboarding:complete", () => {
    markFirstRunWelcomed();
    // Close onboarding window if open
    const onboardingWin = BrowserWindow.getAllWindows().find(
      (w) => w.getTitle().includes("Getting Started")
    );
    onboardingWin?.close();
    return { success: true };
  });

  ipcMain.handle("onboarding:navigate", (_event, stepIndex: number) => {
    const onboardingWin = BrowserWindow.getAllWindows().find(
      (w) => w.getTitle().includes("Getting Started")
    );
    if (onboardingWin) {
      onboardingWin.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(getOnboardingHTML(stepIndex))}`
      );
    }
    return { success: true };
  });

  ipcMain.handle("onboarding:save-model", async (_event, data: { provider: string; apiKey: string; modelName: string }) => {
    try {
      // Add model via config manager
      const modelConfig = buildOnboardingModelConfig(data.provider, data.modelName);
      const addResult = configManager?.addModel(modelConfig);
      if (!addResult?.success) {
        return { success: false, error: addResult?.error || "Failed to add model" };
      }

      // Save API key
      const envVar = getEnvVarForProvider(data.provider);
      if (envVar) {
        configManager?.setEnvVariable(envVar, data.apiKey);
      }

      // Restart services
      await serviceManager?.restartAll();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // ---- Diagnostics ----
  ipcMain.handle("diagnostics:run", async () => {
    if (!diagnostics) {
      return { error: "Diagnostics not initialized" };
    }
    const report = await diagnostics.generateReport({
      proxy: PROXY_PORT,
      langgraph: LANGGRAPH_PORT,
      gateway: GATEWAY_PORT,
      frontend: FRONTEND_PORT,
    });
    return report;
  });

  ipcMain.handle("diagnostics:export-report", async (_event, report: any) => {
    if (!diagnostics) return { success: false, error: "Diagnostics not initialized" };
    return await diagnostics.exportReport(report);
  });

  ipcMain.handle("diagnostics:export-logs", async () => {
    if (!diagnostics) return { success: false, error: "Diagnostics not initialized" };
    return await diagnostics.exportLogs();
  });

  // ---- Shortcuts ----
  ipcMain.handle("shortcuts:get-all", () => {
    return shortcutsManager?.getAllShortcuts() || [];
  });

  ipcMain.handle("shortcuts:set", (_event, action: string, accelerator: string) => {
    return shortcutsManager?.setCustomShortcut(action, accelerator) || { success: false, error: "Shortcuts manager not initialized" };
  });

  ipcMain.handle("shortcuts:reset", (_event, action: string) => {
    return shortcutsManager?.resetShortcut(action) || { success: false, error: "Shortcuts manager not initialized" };
  });

  ipcMain.handle("shortcuts:reset-all", () => {
    shortcutsManager?.resetAll();
    return { success: true };
  });

  // ---- Theme ----
  ipcMain.handle("theme:get", () => {
    return {
      mode: themeManager?.getMode() || "dark",
      effective: themeManager?.getEffectiveTheme() || "dark",
    };
  });

  ipcMain.handle("theme:set", (_event, mode: "light" | "dark" | "auto") => {
    themeManager?.setMode(mode);
    // Notify all windows
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send("theme-changed", themeManager?.getEffectiveTheme());
    });
    return { mode: themeManager?.getMode(), effective: themeManager?.getEffectiveTheme() };
  });

  ipcMain.handle("theme:toggle", () => {
    themeManager?.toggle();
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send("theme-changed", themeManager?.getEffectiveTheme());
    });
    return { effective: themeManager?.getEffectiveTheme() };
  });

  // ---- User Settings Persistence ----
  const SETTINGS_FILENAME = "user-settings.json";

  ipcMain.handle("settings:read", () => {
    try {
      const settingsPath = path.join(app.getPath("userData"), SETTINGS_FILENAME);
      if (fs.existsSync(settingsPath)) {
        const data = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
        return { success: true, data };
      }
      return { success: true, data: null };
    } catch (err: any) {
      logger?.warn(`Failed to read user settings: ${err.message}`, "settings");
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("settings:write", (_event, data: Record<string, unknown>) => {
    try {
      const settingsPath = path.join(app.getPath("userData"), SETTINGS_FILENAME);
      fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), "utf-8");
      return { success: true };
    } catch (err: any) {
      logger?.warn(`Failed to write user settings: ${err.message}`, "settings");
      return { success: false, error: err.message };
    }
  });

  // ---- Telemetry ----
  ipcMain.handle("telemetry:get-config", () => {
    return telemetry?.getConfig() || { enabled: false };
  });

  ipcMain.handle("telemetry:enable", () => {
    telemetry?.enable();
    return { enabled: true };
  });

  ipcMain.handle("telemetry:disable", async () => {
    await telemetry?.disable();
    return { enabled: false };
  });

  ipcMain.handle("telemetry:track", (_event, eventName: string, properties?: Record<string, any>) => {
    telemetry?.track(eventName, properties);
    return { success: true };
  });

  // ---- MCP Manager ----
  ipcMain.handle("mcp:get-servers", () => {
    return mcpManager?.getServerStatuses() || [];
  });

  ipcMain.handle("mcp:get-tools", () => {
    return mcpManager?.getAllTools() || [];
  });

  ipcMain.handle("mcp:get-tool", (_event, name: string) => {
    return mcpManager?.getTool(name) || null;
  });

  ipcMain.handle("mcp:execute-tool", async (_event, toolName: string, args: Record<string, any>) => {
    if (!mcpManager) return { success: false, error: "MCP manager not initialized", executionTime: 0 };
    return await mcpManager.executeTool(toolName, args);
  });

  ipcMain.handle("mcp:validate-args", (_event, toolName: string, args: Record<string, any>) => {
    return mcpManager?.validateToolArgs(toolName, args) || { valid: false, errors: ["MCP manager not initialized"] };
  });

  ipcMain.handle("mcp:add-server", (_event, config: any) => {
    return mcpManager?.addServer(config) || { success: false, error: "MCP manager not initialized" };
  });

  ipcMain.handle("mcp:remove-server", async (_event, name: string) => {
    if (!mcpManager) return { success: false, error: "MCP manager not initialized" };
    return await mcpManager.removeServer(name);
  });

  ipcMain.handle("mcp:set-server-enabled", async (_event, name: string, enabled: boolean) => {
    if (!mcpManager) return { success: false, error: "MCP manager not initialized" };
    return await mcpManager.setServerEnabled(name, enabled);
  });

  ipcMain.handle("mcp:search-tools", (_event, query: string) => {
    return mcpManager?.searchTools(query) || [];
  });

  ipcMain.handle("mcp:save-config", () => {
    return mcpManager?.saveConfig() || { success: false, error: "MCP manager not initialized" };
  });

  // ---- Agent Session Manager ----
  ipcMain.handle("session:create", (_event, options: any) => {
    return agentSessionManager?.createSession(options) || null;
  });

  ipcMain.handle("session:get", (_event, id: string) => {
    return agentSessionManager?.getSession(id) || null;
  });

  ipcMain.handle("session:list", (_event, filter?: any) => {
    return agentSessionManager?.listSessions(filter) || [];
  });

  ipcMain.handle("session:start", (_event, id: string) => {
    return agentSessionManager?.startSession(id) || { success: false, error: "Session manager not initialized" };
  });

  ipcMain.handle("session:pause", (_event, id: string) => {
    return agentSessionManager?.pauseSession(id) || { success: false, error: "Session manager not initialized" };
  });

  ipcMain.handle("session:resume", (_event, id: string) => {
    return agentSessionManager?.resumeSession(id) || { success: false, error: "Session manager not initialized" };
  });

  ipcMain.handle("session:complete", (_event, id: string) => {
    return agentSessionManager?.completeSession(id) || { success: false, error: "Session manager not initialized" };
  });

  ipcMain.handle("session:cancel", (_event, id: string) => {
    return agentSessionManager?.cancelSession(id) || { success: false, error: "Session manager not initialized" };
  });

  ipcMain.handle("session:delete", (_event, id: string) => {
    return agentSessionManager?.deleteSession(id) || { success: false, error: "Session manager not initialized" };
  });

  ipcMain.handle("session:add-message", (_event, sessionId: string, message: any) => {
    return agentSessionManager?.addMessage(sessionId, message) || { success: false, error: "Session manager not initialized" };
  });

  ipcMain.handle("session:get-messages", (_event, sessionId: string, options?: any) => {
    return agentSessionManager?.getMessages(sessionId, options) || { messages: [], total: 0 };
  });

  ipcMain.handle("session:update-title", (_event, id: string, title: string) => {
    return agentSessionManager?.updateTitle(id, title) || { success: false, error: "Session manager not initialized" };
  });

  ipcMain.handle("session:update-metadata", (_event, id: string, metadata: any) => {
    return agentSessionManager?.updateMetadata(id, metadata) || { success: false, error: "Session manager not initialized" };
  });

  ipcMain.handle("session:search", (_event, query: string) => {
    return agentSessionManager?.searchSessions(query) || [];
  });

  ipcMain.handle("session:get-stats", () => {
    return agentSessionManager?.getStats() || {
      totalSessions: 0, activeSessions: 0, completedSessions: 0,
      totalMessages: 0, totalToolCalls: 0, averageDuration: 0,
    };
  });

  ipcMain.handle("session:export", (_event, id: string) => {
    return agentSessionManager?.exportSession(id) || { success: false, error: "Session manager not initialized" };
  });

  ipcMain.handle("session:import", (_event, data: any) => {
    return agentSessionManager?.importSession(data) || { success: false, error: "Session manager not initialized" };
  });

  ipcMain.handle("session:archive-old", (_event, days?: number) => {
    return agentSessionManager?.archiveOldSessions(days) || { archived: 0 };
  });

  // ---- Workflow Orchestrator ----
  ipcMain.handle("workflow:create", (_event, definition: any) => {
    return workflowOrchestrator?.createWorkflow(definition) || null;
  });

  ipcMain.handle("workflow:get", (_event, id: string) => {
    return workflowOrchestrator?.getWorkflow(id) || null;
  });

  ipcMain.handle("workflow:list", () => {
    return workflowOrchestrator?.listWorkflows() || [];
  });

  ipcMain.handle("workflow:update", (_event, id: string, updates: any) => {
    return workflowOrchestrator?.updateWorkflow(id, updates) || { success: false, error: "Workflow orchestrator not initialized" };
  });

  ipcMain.handle("workflow:delete", (_event, id: string) => {
    return workflowOrchestrator?.deleteWorkflow(id) || { success: false, error: "Workflow orchestrator not initialized" };
  });

  ipcMain.handle("workflow:validate", (_event, definition: any) => {
    return workflowOrchestrator?.validateWorkflow(definition) || { valid: false, errors: ["Workflow orchestrator not initialized"] };
  });

  ipcMain.handle("workflow:execute", async (_event, workflowId: string, vars?: any) => {
    if (!workflowOrchestrator) return { success: false, error: "Workflow orchestrator not initialized" };
    try {
      return await workflowOrchestrator.execute(workflowId, vars);
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("workflow:get-execution", (_event, id: string) => {
    return workflowOrchestrator?.getExecution(id) || null;
  });

  ipcMain.handle("workflow:list-executions", (_event, workflowId?: string) => {
    return workflowOrchestrator?.listExecutions(workflowId) || [];
  });

  ipcMain.handle("workflow:pause", (_event, id: string) => {
    return workflowOrchestrator?.pauseExecution(id) || { success: false, error: "Workflow orchestrator not initialized" };
  });

  ipcMain.handle("workflow:resume", (_event, id: string) => {
    return workflowOrchestrator?.resumeExecution(id) || { success: false, error: "Workflow orchestrator not initialized" };
  });

  ipcMain.handle("workflow:cancel", (_event, id: string) => {
    return workflowOrchestrator?.cancelExecution(id) || { success: false, error: "Workflow orchestrator not initialized" };
  });

  ipcMain.handle("workflow:provide-input", (_event, executionId: string, nodeId: string, value: any) => {
    return workflowOrchestrator?.provideInput(executionId, nodeId, value) || { success: false, error: "Workflow orchestrator not initialized" };
  });

  ipcMain.handle("workflow:get-templates", () => {
    return workflowOrchestrator?.getTemplates() || [];
  });

  ipcMain.handle("workflow:create-from-template", (_event, templateId: string, overrides?: any) => {
    return workflowOrchestrator?.createFromTemplate(templateId, overrides) || null;
  });

  // ---- Context Manager ----
  ipcMain.handle("context:build", (_event, messages: any[], options?: any) => {
    return contextManager?.buildContext(messages, options) || { context: [], tokenCount: 0, compressed: false };
  });

  ipcMain.handle("context:count-tokens", (_event, messages: any[]) => {
    return contextManager?.countTokens(messages) || { total: 0, byRole: {}, byMessage: new Map() };
  });

  ipcMain.handle("context:is-over-budget", (_event, messages: any[], budget?: number) => {
    return contextManager?.isOverBudget(messages, budget) || false;
  });

  ipcMain.handle("context:create-snapshot", (_event, sessionId: string, messages: any[], metadata?: any) => {
    return contextManager?.createSnapshot(sessionId, messages, metadata) || null;
  });

  ipcMain.handle("context:get-snapshot", (_event, id: string) => {
    return contextManager?.getSnapshot(id) || null;
  });

  ipcMain.handle("context:list-snapshots", (_event, sessionId?: string) => {
    return contextManager?.listSnapshots(sessionId) || [];
  });

  ipcMain.handle("context:restore-snapshot", (_event, id: string) => {
    return contextManager?.restoreSnapshot(id) || { success: false, error: "Context manager not initialized" };
  });

  ipcMain.handle("context:delete-snapshot", (_event, id: string) => {
    return contextManager?.deleteSnapshot(id) || { success: false, error: "Context manager not initialized" };
  });

  ipcMain.handle("context:store-memory", (_event, content: string, options?: any) => {
    return contextManager?.storeMemory(content, options) || null;
  });

  ipcMain.handle("context:retrieve-memories", (_event, query?: any) => {
    return contextManager?.retrieveMemories(query) || [];
  });

  ipcMain.handle("context:get-memory", (_event, id: string) => {
    return contextManager?.getMemory(id) || null;
  });

  ipcMain.handle("context:update-memory", (_event, id: string, updates: any) => {
    return contextManager?.updateMemory(id, updates) || { success: false, error: "Context manager not initialized" };
  });

  ipcMain.handle("context:delete-memory", (_event, id: string) => {
    return contextManager?.deleteMemory(id) || { success: false, error: "Context manager not initialized" };
  });

  ipcMain.handle("context:extract-memories", (_event, messages: any[], sessionId?: string) => {
    return contextManager?.extractMemoriesFromMessages(messages, sessionId) || [];
  });

  ipcMain.handle("context:get-memory-stats", () => {
    return contextManager?.getMemoryStats() || { totalMemories: 0, byCategory: {}, byTag: {}, averageConfidence: 0 };
  });

  ipcMain.handle("context:get-config", () => {
    return contextManager?.getConfig() || { maxTokens: 8000, maxMessages: 100, compressionThreshold: 0.8, preserveSystemMessages: true, preserveRecentCount: 10 };
  });

  ipcMain.handle("context:update-config", (_event, updates: any) => {
    contextManager?.updateConfig(updates);
    return { success: true };
  });

  // ---- Updater ----
  ipcMain.handle("updater:check", async () => {
    await autoUpdater?.checkForUpdates();
    return autoUpdater?.getStatus() || { isChecking: false, isDownloading: false, pendingUpdate: null, lastCheckTime: 0 };
  });

  ipcMain.handle("updater:status", () => {
    return autoUpdater?.getStatus() || { isChecking: false, isDownloading: false, pendingUpdate: null, lastCheckTime: 0 };
  });

  ipcMain.handle("updater:install", async () => {
    await autoUpdater?.installUpdate();
    return { success: true };
  });

  // ---- Skill Manager ----
  ipcMain.handle("skill:get-all", () => {
    return skillManager?.listSkills() || [];
  });

  ipcMain.handle("skill:get", (_event, id: string) => {
    return skillManager?.getSkill(id) || null;
  });

  ipcMain.handle("skill:get-enabled", () => {
    return skillManager?.getEnabledSkills() || [];
  });

  ipcMain.handle("skill:search", (_event, query: string) => {
    return skillManager?.searchSkills(query) || [];
  });

  ipcMain.handle("skill:enable", (_event, id: string) => {
    return skillManager?.enableSkill(id) || { success: false, error: "Skill manager not initialized" };
  });

  ipcMain.handle("skill:disable", (_event, id: string) => {
    return skillManager?.disableSkill(id) || { success: false, error: "Skill manager not initialized" };
  });

  ipcMain.handle("skill:install", async (_event, options: any) => {
    if (!skillManager) return { success: false, error: "Skill manager not initialized" };
    return await skillManager.installSkill(options);
  });

  ipcMain.handle("skill:uninstall", async (_event, id: string) => {
    if (!skillManager) return { success: false, error: "Skill manager not initialized" };
    return await skillManager.uninstallSkill(id);
  });

  ipcMain.handle("skill:update-config", (_event, id: string, config: any) => {
    return skillManager?.updateSkillConfig(id, config) || { success: false, error: "Skill manager not initialized" };
  });

  ipcMain.handle("skill:get-stats", () => {
    return skillManager?.getStats() || { totalSkills: 0, enabledSkills: 0, builtinSkills: 0, localSkills: 0, remoteSkills: 0, byTag: {} };
  });

  ipcMain.handle("skill:discover", async () => {
    return skillManager?.discoverSkills() || [];
  });

  ipcMain.handle("skill:execute", async (_event, id: string, inputs: any) => {
    if (!skillManager) return { success: false, outputs: {}, error: "Skill manager not initialized", executionTime: 0 };
    return await skillManager.executeSkill(id, inputs);
  });

  ipcMain.handle("skill:validate-manifest", (_event, manifest: any) => {
    return skillManager?.validateManifest(manifest) || { valid: false, errors: ["Skill manager not initialized"], warnings: [] };
  });

  // ---- Event Bus ----
  ipcMain.handle("eventbus:publish", (_event, channel: any, type: string, payload: any, options?: any) => {
    return eventBus?.publish(channel, type, payload, options) || null;
  });

  ipcMain.handle("eventbus:request", async (_event, channel: any, type: string, payload: any, options?: any) => {
    if (!eventBus) return { success: false, error: "Event bus not initialized", responseTime: 0 };
    return await eventBus.request(channel, type, payload, options);
  });

  ipcMain.handle("eventbus:get-history", (_event, channel?: any) => {
    return eventBus?.getHistory(channel) || [];
  });

  ipcMain.handle("eventbus:query-history", (_event, query: any) => {
    return eventBus?.queryHistory(query) || [];
  });

  ipcMain.handle("eventbus:get-metrics", () => {
    return eventBus?.getMetrics() || { totalEventsPublished: 0, totalEventsDelivered: 0, totalEventsDropped: 0, activeSubscriptions: 0, eventsByChannel: {} as any, eventsByType: {}, averageDeliveryTimeMs: 0, errors: 0 };
  });

  ipcMain.handle("eventbus:clear-history", (_event, channel?: any) => {
    eventBus?.clearHistory(channel);
    return { success: true };
  });

  // ---- Performance Monitor ----
  ipcMain.handle("perf:get-snapshot", () => {
    return performanceMonitor?.getCurrentSnapshot() || null;
  });

  ipcMain.handle("perf:get-report", (_event, periodHours?: number) => {
    return performanceMonitor?.generateReport(periodHours) || null;
  });

  ipcMain.handle("perf:get-alerts", (_event, options?: any) => {
    return performanceMonitor?.getAlerts(options) || [];
  });

  ipcMain.handle("perf:acknowledge-alert", (_event, alertId: string) => {
    return performanceMonitor?.acknowledgeAlert(alertId) || false;
  });

  ipcMain.handle("perf:get-metrics", () => {
    return performanceMonitor?.getCurrentSnapshot()?.aggregated || null;
  });

  ipcMain.handle("perf:save-metrics", () => {
    return performanceMonitor?.saveMetrics() || { success: false, error: "Performance monitor not initialized" };
  });

  ipcMain.handle("perf:load-metrics", () => {
    return performanceMonitor?.loadMetrics() || { success: false, error: "Performance monitor not initialized" };
  });

  // ---- Agent Reasoning Engine ----
  ipcMain.handle("reasoning:start-trace", (_event, sessionId: string, goal: string, strategy?: string) => {
    return reasoningEngine?.startTrace(sessionId, goal, strategy as any) || null;
  });

  ipcMain.handle("reasoning:get-trace", (_event, id: string) => {
    return reasoningEngine?.getTrace(id) || null;
  });

  ipcMain.handle("reasoning:list-traces", (_event, filter?: any) => {
    return reasoningEngine?.listTraces(filter) || [];
  });

  ipcMain.handle("reasoning:add-step", (_event, traceId: string, step: any) => {
    return reasoningEngine?.addStep(traceId, step) || null;
  });

  ipcMain.handle("reasoning:add-thought", (_event, traceId: string, content: string, confidence?: number) => {
    return reasoningEngine?.addThought(traceId, content, confidence) || null;
  });

  ipcMain.handle("reasoning:add-action", (_event, traceId: string, content: string, toolName: string, toolArgs: any) => {
    return reasoningEngine?.addAction(traceId, content, toolName, toolArgs) || null;
  });

  ipcMain.handle("reasoning:add-observation", (_event, traceId: string, content: string, toolResult?: any) => {
    return reasoningEngine?.addObservation(traceId, content, toolResult) || null;
  });

  ipcMain.handle("reasoning:complete-trace", (_event, traceId: string, finalAnswer: string) => {
    return reasoningEngine?.completeTrace(traceId, finalAnswer) || null;
  });

  ipcMain.handle("reasoning:fail-trace", (_event, traceId: string, error: string) => {
    return reasoningEngine?.failTrace(traceId, error) || null;
  });

  ipcMain.handle("reasoning:pause-trace", (_event, traceId: string) => {
    return reasoningEngine?.pauseTrace(traceId) || null;
  });

  ipcMain.handle("reasoning:resume-trace", (_event, traceId: string) => {
    return reasoningEngine?.resumeTrace(traceId) || null;
  });

  ipcMain.handle("reasoning:get-stats", () => {
    return reasoningEngine?.getStats() || { totalTraces: 0, activeTraces: 0, completedTraces: 0, failedTraces: 0, byStrategy: {}, averageSteps: 0, averageConfidence: 0 };
  });

  ipcMain.handle("reasoning:get-config", () => {
    return reasoningEngine?.getConfig() || { defaultStrategy: "react", maxSteps: 20, minConfidence: 0.6, enableReflection: true, enablePlanning: true, maxReflectionDepth: 3 };
  });

  ipcMain.handle("reasoning:update-config", (_event, updates: any) => {
    reasoningEngine?.updateConfig(updates);
    return { success: true };
  });

  ipcMain.handle("reasoning:export-trace", (_event, id: string) => {
    return reasoningEngine?.exportTrace(id) || { success: false, error: "Reasoning engine not initialized" };
  });

  ipcMain.handle("reasoning:import-trace", (_event, data: any) => {
    return reasoningEngine?.importTrace(data) || { success: false, error: "Reasoning engine not initialized" };
  });

  // ---- Knowledge Graph ----
  ipcMain.handle("kg:add-entity", (_event, entity: any) => {
    return knowledgeGraph?.addEntity(entity) || null;
  });

  ipcMain.handle("kg:get-entity", (_event, id: string) => {
    return knowledgeGraph?.getEntity(id) || null;
  });

  ipcMain.handle("kg:search-entities", (_event, query: any) => {
    return knowledgeGraph?.searchEntities(query) || [];
  });

  ipcMain.handle("kg:update-entity", (_event, id: string, updates: any) => {
    return knowledgeGraph?.updateEntity(id, updates) || false;
  });

  ipcMain.handle("kg:delete-entity", (_event, id: string) => {
    return knowledgeGraph?.deleteEntity(id) || false;
  });

  ipcMain.handle("kg:add-relation", (_event, relation: any) => {
    return knowledgeGraph?.addRelation(relation) || null;
  });

  ipcMain.handle("kg:query-relations", (_event, query: any) => {
    return knowledgeGraph?.queryRelations(query) || [];
  });

  ipcMain.handle("kg:get-neighbors", (_event, entityId: string) => {
    return knowledgeGraph?.getNeighbors(entityId) || [];
  });

  ipcMain.handle("kg:find-paths", (_event, sourceId: string, targetId: string, maxDepth?: number) => {
    return knowledgeGraph?.findPaths(sourceId, targetId, maxDepth) || [];
  });

  ipcMain.handle("kg:get-subgraph", (_event, centerId: string, depth?: number) => {
    return knowledgeGraph?.getSubgraph(centerId, depth) || { entities: [], relations: [] };
  });

  ipcMain.handle("kg:get-stats", () => {
    return knowledgeGraph?.getStats() || { totalEntities: 0, totalRelations: 0, entityTypes: {}, relationTypes: {}, averageConfidence: 0, orphanedEntities: 0, mostConnected: [] };
  });

  ipcMain.handle("kg:export-viz", () => {
    return knowledgeGraph?.exportForVisualization() || { nodes: [], edges: [] };
  });

  ipcMain.handle("kg:export-graph", () => {
    return knowledgeGraph?.exportGraph() || { entities: [], relations: [], version: 1, updatedAt: new Date().toISOString() };
  });

  ipcMain.handle("kg:import-graph", (_event, graph: any) => {
    return knowledgeGraph?.importGraph(graph) || { success: false, imported: 0 };
  });

  // ---- Task Scheduler ----
  ipcMain.handle("scheduler:create-task", (_event, task: any) => {
    return taskScheduler?.createTask(task) || null;
  });

  ipcMain.handle("scheduler:get-task", (_event, id: string) => {
    return taskScheduler?.getTask(id) || null;
  });

  ipcMain.handle("scheduler:list-tasks", (_event, filter?: any) => {
    return taskScheduler?.listTasks(filter) || [];
  });

  ipcMain.handle("scheduler:update-task", (_event, id: string, updates: any) => {
    return taskScheduler?.updateTask(id, updates) || null;
  });

  ipcMain.handle("scheduler:delete-task", (_event, id: string) => {
    return taskScheduler?.deleteTask(id) || false;
  });

  ipcMain.handle("scheduler:enable-task", (_event, id: string) => {
    return taskScheduler?.enableTask(id) || false;
  });

  ipcMain.handle("scheduler:disable-task", (_event, id: string) => {
    return taskScheduler?.disableTask(id) || false;
  });

  ipcMain.handle("scheduler:run-now", async (_event, id: string) => {
    return await taskScheduler?.runTaskNow(id) || null;
  });

  ipcMain.handle("scheduler:get-history", (_event, taskId?: string) => {
    return taskScheduler?.getHistory(taskId) || [];
  });

  ipcMain.handle("scheduler:get-stats", () => {
    return taskScheduler?.getStats() || { totalTasks: 0, enabledTasks: 0, runningTasks: 0, byType: {}, totalExecutions: 0, successfulExecutions: 0, failedExecutions: 0 };
  });

  // ---- Audit Logger ----
  ipcMain.handle("audit:log", (_event, partial: any) => {
    return auditLogger?.log(partial) || null;
  });

  ipcMain.handle("audit:query", (_event, query: any) => {
    return auditLogger?.query(query) || [];
  });

  ipcMain.handle("audit:get-recent", (_event, limit?: number, category?: string) => {
    return auditLogger?.getRecent(limit, category as any) || [];
  });

  ipcMain.handle("audit:get-stats", () => {
    return auditLogger?.getStats() || { totalEvents: 0, byCategory: {}, bySeverity: {}, byResult: {}, byActorType: {}, timeRange: { earliest: "", latest: "" }, tamperedEntries: 0 };
  });

  ipcMain.handle("audit:export-json", (_event, query?: any) => {
    return auditLogger?.exportToJSON(query) || { success: false, error: "Audit logger not initialized" };
  });

  ipcMain.handle("audit:export-csv", (_event, query?: any) => {
    return auditLogger?.exportToCSV(query) || { success: false, error: "Audit logger not initialized" };
  });

  ipcMain.handle("audit:verify-integrity", () => {
    return auditLogger?.verifyIntegrity() || { valid: false, tamperedCount: 0, totalChecked: 0 };
  });

  // ---- Agent Bridge ----
  ipcMain.handle("bridge:create-thread", async (_event, model?: string) => {
    return await agentBridge?.createThread(model) || null;
  });

  ipcMain.handle("bridge:get-thread", async (_event, threadId: string) => {
    return await agentBridge?.getThread(threadId) || null;
  });

  ipcMain.handle("bridge:send-message", async (_event, threadId: string, content: string, options?: any) => {
    return await agentBridge?.sendMessage(threadId, content, options) || null;
  });

  ipcMain.handle("bridge:stream-message", async (_event, threadId: string, content: string, options?: any) => {
    // Streaming is handled via events, this starts the stream
    agentBridge?.streamMessage(threadId, content, options, (event) => {
      mainWindow?.webContents.send("bridge:stream-event", threadId, event);
    });
    return { success: true };
  });

  ipcMain.handle("bridge:cancel-stream", (_event, threadId: string) => {
    return agentBridge?.cancelStream(threadId) || false;
  });

  ipcMain.handle("bridge:submit-tool-result", async (_event, threadId: string, toolCallId: string, result: string, isError?: boolean) => {
    return await agentBridge?.submitToolResult(threadId, toolCallId, result, isError) || false;
  });

  ipcMain.handle("bridge:is-healthy", async () => {
    return await agentBridge?.isHealthy() || false;
  });

  ipcMain.handle("bridge:get-models", async () => {
    return await agentBridge?.getAvailableModels() || [];
  });

  // ---- Security Manager ----
  ipcMain.handle("security:store-secret", (_event, name: string, value: string) => {
    try {
      return securityManager?.storeSecret(name, value) || null;
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("security:retrieve-secret", (_event, id: string) => {
    return securityManager?.retrieveSecret(id) || { success: false, error: "Security manager not initialized" };
  });

  ipcMain.handle("security:retrieve-secret-by-name", (_event, name: string) => {
    return securityManager?.retrieveSecretByName(name) || { success: false, error: "Security manager not initialized" };
  });

  ipcMain.handle("security:delete-secret", (_event, id: string) => {
    return securityManager?.deleteSecret(id) || false;
  });

  ipcMain.handle("security:list-secrets", () => {
    return securityManager?.listSecrets() || [];
  });

  ipcMain.handle("security:check-permission", (_event, action: string, context: any) => {
    return securityManager?.checkPermission(action, context) || { allowed: true, action: "allow" };
  });

  ipcMain.handle("security:validate-api-key", (_event, key: string, provider: string) => {
    return securityManager?.validateApiKey(key, provider) || { valid: false, error: "Security manager not initialized" };
  });

  ipcMain.handle("security:sanitize-path", (_event, inputPath: string, allowedBaseDirs: string[]) => {
    return securityManager?.sanitizePath(inputPath, allowedBaseDirs) || { safe: false, error: "Security manager not initialized" };
  });

  // ---- Plugin Manager ----
  ipcMain.handle("plugin:discover", async () => {
    return await pluginManager?.discoverPlugins() || [];
  });

  ipcMain.handle("plugin:load", async (_event, manifestPath: string) => {
    return await pluginManager?.loadPlugin(manifestPath) || null;
  });

  ipcMain.handle("plugin:get", (_event, id: string) => {
    return pluginManager?.getPlugin(id) || null;
  });

  ipcMain.handle("plugin:list", (_event, filter?: any) => {
    return pluginManager?.listPlugins(filter) || [];
  });

  ipcMain.handle("plugin:enable", async (_event, id: string) => {
    return await pluginManager?.enablePlugin(id) || { success: false, error: "Plugin manager not initialized" };
  });

  ipcMain.handle("plugin:disable", (_event, id: string) => {
    return pluginManager?.disablePlugin(id) || false;
  });

  ipcMain.handle("plugin:uninstall", async (_event, id: string) => {
    return await pluginManager?.uninstallPlugin(id) || { success: false, error: "Plugin manager not initialized" };
  });

  ipcMain.handle("plugin:get-stats", () => {
    return pluginManager?.getStats() || { total: 0, enabled: 0, disabled: 0, errors: 0, incompatible: 0 };
  });

  // ---- Agent Collaboration Hub ----
  ipcMain.handle("collaboration:create-session", (_event, title: string, goal: string, options?: any) => {
    return collaborationHub?.createSession(title, goal, options) || null;
  });

  ipcMain.handle("collaboration:get-session", (_event, id: string) => {
    return collaborationHub?.getSession(id) || null;
  });

  ipcMain.handle("collaboration:list-sessions", (_event, filter?: any) => {
    return collaborationHub?.listSessions(filter) || [];
  });

  ipcMain.handle("collaboration:end-session", (_event, id: string, finalResult?: any) => {
    return collaborationHub?.endSession(id, finalResult) || null;
  });

  ipcMain.handle("collaboration:delete-session", (_event, id: string) => {
    return collaborationHub?.deleteSession(id) || false;
  });

  ipcMain.handle("collaboration:add-collaborator", (_event, sessionId: string, name: string, role: string, capabilities: string[], model?: string) => {
    return collaborationHub?.addCollaborator(sessionId, name, role as any, capabilities, model) || null;
  });

  ipcMain.handle("collaboration:remove-collaborator", (_event, sessionId: string, collaboratorId: string) => {
    return collaborationHub?.removeCollaborator(sessionId, collaboratorId) || false;
  });

  ipcMain.handle("collaboration:create-task", (_event, sessionId: string, title: string, description: string, options?: any) => {
    return collaborationHub?.createTask(sessionId, title, description, options) || null;
  });

  ipcMain.handle("collaboration:update-task", (_event, sessionId: string, taskId: string, updates: any) => {
    return collaborationHub?.updateTask(sessionId, taskId, updates) || null;
  });

  ipcMain.handle("collaboration:get-ready-tasks", (_event, sessionId: string) => {
    return collaborationHub?.getReadyTasks(sessionId) || [];
  });

  ipcMain.handle("collaboration:get-task-graph", (_event, sessionId: string) => {
    return collaborationHub?.getTaskGraph(sessionId) || { nodes: [], edges: [] };
  });

  ipcMain.handle("collaboration:send-message", (_event, sessionId: string, from: string, type: string, content: string, options?: any) => {
    return collaborationHub?.sendMessage(sessionId, from, type as any, content, options) || null;
  });

  ipcMain.handle("collaboration:get-messages", (_event, sessionId: string, options?: any) => {
    return collaborationHub?.getMessages(sessionId, options) || [];
  });

  ipcMain.handle("collaboration:propose-consensus", (_event, sessionId: string, taskId: string, proposedBy: string, content: any) => {
    return collaborationHub?.proposeConsensus(sessionId, taskId, proposedBy, content) || null;
  });

  ipcMain.handle("collaboration:vote-proposal", (_event, proposalId: string, collaboratorId: string, vote: string) => {
    return collaborationHub?.voteOnProposal(proposalId, collaboratorId, vote as any) || null;
  });

  ipcMain.handle("collaboration:synthesize", (_event, sessionId: string) => {
    return collaborationHub?.synthesizeResults(sessionId) || { success: false, error: "Collaboration hub not initialized" };
  });

  ipcMain.handle("collaboration:get-stats", () => {
    return collaborationHub?.getStats() || { totalSessions: 0, activeSessions: 0, totalCollaborators: 0, totalTasks: 0, completedTasks: 0, byRole: {}, averageConsensusRate: 0 };
  });

  ipcMain.handle("collaboration:get-session-stats", (_event, sessionId: string) => {
    return collaborationHub?.getSessionStats(sessionId) || null;
  });

  // ---- Conversation Memory Engine ----
  ipcMain.handle("memory:process-segment", (_event, segment: any) => {
    return conversationMemory?.processSegment(segment) || [];
  });

  ipcMain.handle("memory:query", (_event, query: any) => {
    return conversationMemory?.queryMemories(query) || [];
  });

  ipcMain.handle("memory:get-relevant", (_event, query: string, limit?: number) => {
    return conversationMemory?.getRelevantMemories(query, limit) || [];
  });

  ipcMain.handle("memory:get-memory", (_event, id: string) => {
    return conversationMemory?.getMemory(id) || null;
  });

  ipcMain.handle("memory:update-memory", (_event, id: string, updates: any) => {
    return conversationMemory?.updateMemory(id, updates) || false;
  });

  ipcMain.handle("memory:delete-memory", (_event, id: string) => {
    return conversationMemory?.deleteMemory(id) || false;
  });

  ipcMain.handle("memory:get-topics", (_event, sessionId?: string, limit?: number) => {
    return conversationMemory?.getTopics(sessionId, limit) || [];
  });

  ipcMain.handle("memory:generate-summary", (_event, sessionId: string, segments: any[], level?: string) => {
    return conversationMemory?.generateSummary(sessionId, segments, level as any) || null;
  });

  ipcMain.handle("memory:get-summary", (_event, sessionId: string) => {
    return conversationMemory?.getSummary(sessionId) || null;
  });

  ipcMain.handle("memory:link-related", () => {
    return conversationMemory?.linkRelatedMemories() || 0;
  });

  ipcMain.handle("memory:prune", (_event, keepCount?: number) => {
    return conversationMemory?.pruneMemories(keepCount) || 0;
  });

  ipcMain.handle("memory:get-stats", () => {
    return conversationMemory?.getStats() || { totalMemories: 0, byType: {}, averageImportance: 0, averageConfidence: 0, totalAccesses: 0, recentlyCreated: 0, recentlyAccessed: 0 };
  });

  // ---- Tool Registry ----
  ipcMain.handle("tool:register", (_event, tool: any) => {
    return toolRegistry?.registerTool(tool) || null;
  });

  ipcMain.handle("tool:unregister", (_event, id: string) => {
    return toolRegistry?.unregisterTool(id) || false;
  });

  ipcMain.handle("tool:get", (_event, id: string) => {
    return toolRegistry?.getTool(id) || null;
  });

  ipcMain.handle("tool:find-by-name", (_event, name: string) => {
    return toolRegistry?.findToolByName(name) || null;
  });

  ipcMain.handle("tool:search", (_event, query: any) => {
    return toolRegistry?.searchTools(query) || [];
  });

  ipcMain.handle("tool:get-by-category", (_event, category: string) => {
    return toolRegistry?.getByCategory(category as any) || [];
  });

  ipcMain.handle("tool:get-available", () => {
    return toolRegistry?.getAvailableTools() || [];
  });

  ipcMain.handle("tool:get-categories", () => {
    return toolRegistry?.getCategories() || [];
  });

  ipcMain.handle("tool:validate-params", (_event, toolId: string, params: any) => {
    return toolRegistry?.validateParameters(toolId, params) || { valid: false, errors: ["Tool registry not initialized"] };
  });

  ipcMain.handle("tool:record-usage", (_event, record: any) => {
    toolRegistry?.recordUsage(record);
    return undefined;
  });

  ipcMain.handle("tool:get-analytics", (_event, toolId: string) => {
    return toolRegistry?.getAnalytics(toolId) || null;
  });

  ipcMain.handle("tool:get-top", (_event, limit?: number) => {
    return toolRegistry?.getTopTools(limit) || [];
  });

  ipcMain.handle("tool:get-recommendations", (_event, context: any) => {
    return toolRegistry?.getRecommendations(context) || [];
  });

  ipcMain.handle("tool:get-stats", () => {
    return toolRegistry?.getStats() || { totalTools: 0, byCategory: {}, bySource: {}, byStatus: {}, totalUsageRecords: 0 };
  });

  // ---- Health Monitor ----
  ipcMain.handle("health:get-status", () => {
    return healthMonitor?.getCurrentStatus() || { status: "unknown", score: 0, services: [] };
  });

  ipcMain.handle("health:get-snapshot", () => {
    return healthMonitor?.getLatestSnapshot() || null;
  });

  ipcMain.handle("health:check", async () => {
    return await healthMonitor?.performHealthCheck() || null;
  });

  ipcMain.handle("health:register-service", (_event, name: string, options?: any) => {
    return healthMonitor?.registerService(name, options) || null;
  });

  ipcMain.handle("health:update-service", (_event, name: string, status: string, options?: any) => {
    return healthMonitor?.updateServiceStatus(name, status as any, options) || false;
  });

  ipcMain.handle("health:get-service", (_event, name: string) => {
    return healthMonitor?.getServiceHealth(name) || null;
  });

  ipcMain.handle("health:get-issues", () => {
    return healthMonitor?.getUnresolvedIssues() || [];
  });

  ipcMain.handle("health:get-trends", (_event, periodHours?: number) => {
    return healthMonitor?.getTrends(periodHours) || { period: "", averageScore: 0, minScore: 0, maxScore: 0, issueCount: 0, recoveryCount: 0, statusDistribution: {} };
  });

  ipcMain.handle("health:get-stats", () => {
    return healthMonitor?.getStats() || { totalServices: 0, healthyServices: 0, degradedServices: 0, unhealthyServices: 0, totalSnapshots: 0, totalIssues: 0, unresolvedIssues: 0, averageScore: 0 };
  });

  ipcMain.handle("health:start", () => {
    healthMonitor?.start();
    return { success: true };
  });

  ipcMain.handle("health:stop", () => {
    healthMonitor?.stop();
    return { success: true };
  });

  // ---- WebSocket Manager ----
  ipcMain.handle("ws:connect", (_event, connectionId: string) => {
    return websocketManager?.connect(connectionId) || null;
  });

  ipcMain.handle("ws:disconnect", (_event, connectionId: string) => {
    return websocketManager?.disconnect(connectionId) || false;
  });

  ipcMain.handle("ws:subscribe", (_event, connectionId: string, channel: string) => {
    return websocketManager?.subscribe(connectionId, channel) || false;
  });

  ipcMain.handle("ws:unsubscribe", (_event, connectionId: string, channel: string) => {
    return websocketManager?.unsubscribe(connectionId, channel) || false;
  });

  ipcMain.handle("ws:broadcast", (_event, channel: string, type: string, payload: unknown) => {
    return websocketManager?.broadcast(channel, type, payload) || null;
  });

  ipcMain.handle("ws:get-history", (_event, channel: string, limit?: number) => {
    return websocketManager?.getHistory(channel, limit) || [];
  });

  ipcMain.handle("ws:get-channels", () => {
    return websocketManager?.getChannels() || [];
  });

  ipcMain.handle("ws:get-stats", () => {
    return websocketManager?.getStats() || { totalConnections: 0, activeChannels: 0, messagesSent: 0, messagesReceived: 0, messagesByChannel: {}, peakConnections: 0 };
  });

  ipcMain.handle("ws:start", () => {
    websocketManager?.start();
  });

  ipcMain.handle("ws:stop", () => {
    websocketManager?.stop();
  });

  // Forward websocket messages to renderer
  websocketManager?.on("message", (message) => {
    mainWindow?.webContents.send("ws:message", message);
  });

  // ---- Tray Badge Notifications ----
  ipcMain.handle("tray:get-state", () => {
    return trayNotificationManager?.getBadgeState() || { unreadCount: 0, alertCount: 0, hasCriticalAlert: false, lastUpdated: new Date().toISOString() };
  });

  ipcMain.handle("tray:set-unread", (_event, count: number) => {
    trayNotificationManager?.setUnread(count);
  });

  ipcMain.handle("tray:clear-unread", () => {
    trayNotificationManager?.clearUnread();
  });

  ipcMain.handle("tray:add-alert", (_event, severity: string, message?: string) => {
    trayNotificationManager?.addAlert(severity as any, message);
  });

  ipcMain.handle("tray:clear-alerts", () => {
    trayNotificationManager?.clearAlerts();
  });

  ipcMain.handle("tray:on-category", (_event, name: string, count: number, priority?: string, lastEvent?: string) => {
    trayNotificationManager?.setCategoryCount(name, count, priority as any, lastEvent);
  });

  ipcMain.handle("tray:get-config", () => {
    return trayNotificationManager?.getConfig() || { enabled: true, showCount: true, maxDisplayCount: 99, criticalColor: "#ef4444", warningColor: "#f59e0b", normalColor: "#3b82f6" };
  });

  ipcMain.handle("tray:update-config", (_event, updates: unknown) => {
    trayNotificationManager?.updateConfig(updates as any);
  });

  ipcMain.handle("tray:reset", () => {
    trayNotificationManager?.reset();
  });

  // ---- Backup Service ----
  ipcMain.handle("backup:create", async (_event, name?: string, description?: string, tags?: string[]) => {
    return await backupService?.createBackup(name, description, tags) || null;
  });

  ipcMain.handle("backup:restore", async (_event, options: unknown) => {
    return await backupService?.restoreBackup(options as any) || { success: false, restored: [], skipped: [], failed: [], error: "Backup service not initialized" };
  });

  ipcMain.handle("backup:delete", (_event, id: string) => {
    return backupService?.deleteBackup(id) || false;
  });

  ipcMain.handle("backup:get", (_event, id: string) => {
    return backupService?.getBackup(id);
  });

  ipcMain.handle("backup:list", () => {
    return backupService?.listBackups() || [];
  });

  ipcMain.handle("backup:start-auto", () => {
    backupService?.startAutoBackup();
  });

  ipcMain.handle("backup:stop-auto", () => {
    backupService?.stopAutoBackup();
  });

  ipcMain.handle("backup:is-auto-running", () => {
    return backupService?.isAutoBackupRunning() || false;
  });

  ipcMain.handle("backup:get-config", () => {
    return backupService?.getConfig() || null;
  });

  ipcMain.handle("backup:update-config", (_event, updates: unknown) => {
    backupService?.updateConfig(updates as any);
  });

  ipcMain.handle("backup:get-stats", () => {
    return backupService?.getStats() || { totalBackups: 0, totalSize: 0, autoBackupEnabled: false };
  });

  ipcMain.handle("backup:export", (_event, id: string) => {
    return backupService?.exportBackup(id) || { success: false, error: "Backup service not initialized" };
  });

  ipcMain.handle("backup:import", (_event, data: string) => {
    return backupService?.importBackup(data) || { success: false, error: "Backup service not initialized" };
  });

  // ---- Session Export Service ----
  ipcMain.handle("session:export-advanced", (_event, sessionId: string, options: any) => {
    const session = agentSessionManager?.getSession(sessionId);
    if (!session) return { success: false, error: "Session not found" };
    return sessionExportService?.exportSession(session, options) || { success: false, error: "Export service not initialized" };
  });

  ipcMain.handle("session:batch-export", async (_event, sessionIds: string[], options: any) => {
    const sessions = sessionIds.map((id) => agentSessionManager?.getSession(id)).filter(Boolean) as any[];
    return sessionExportService?.batchExport(sessions, options) || { success: false, error: "Export service not initialized" };
  });

  ipcMain.handle("session:get-export-templates", () => {
    return sessionExportService?.getTemplates() || [];
  });

  ipcMain.handle("session:list-exports", () => {
    return sessionExportService?.listExports() || [];
  });

  ipcMain.handle("session:delete-export", (_event, fileName: string) => {
    return sessionExportService?.deleteExport(fileName) || false;
  });

  // ---- Charts Data Pipeline ----
  ipcMain.handle("charts:get-dashboard-data", () => {
    return chartsDataPipeline?.getDashboardData() || {};
  });

  ipcMain.handle("charts:get-session-activity", (_event, days?: number) => {
    return chartsDataPipeline?.getSessionActivity(days) || [];
  });

  ipcMain.handle("charts:get-message-volume", (_event, days?: number) => {
    return chartsDataPipeline?.getMessageVolume(days) || [];
  });

  ipcMain.handle("charts:get-model-usage", () => {
    return chartsDataPipeline?.getModelUsage() || [];
  });

  ipcMain.handle("charts:get-tool-usage", () => {
    return chartsDataPipeline?.getToolUsage() || [];
  });

  ipcMain.handle("charts:get-health-history", (_event, days?: number) => {
    return chartsDataPipeline?.getHealthScoreHistory(days) || [];
  });

  ipcMain.handle("charts:get-performance-metrics", () => {
    return chartsDataPipeline?.getPerformanceMetrics() || {};
  });

  ipcMain.handle("charts:invalidate-cache", () => {
    chartsDataPipeline?.invalidateCache();
    return { success: true };
  });

  // ---- State Sync Service ----
  ipcMain.handle("sync:subscribe", (_event, slices: string[]) => {
    const id = stateSyncService?.subscribe({ slices: slices as any }) || "";
    return { subscriptionId: id };
  });

  ipcMain.handle("sync:unsubscribe", (_event, id: string) => {
    return stateSyncService?.unsubscribe(id) || false;
  });

  ipcMain.handle("sync:get-state", (_event, slice: string) => {
    return stateSyncService?.getState(slice as any) || null;
  });

  ipcMain.handle("sync:get-all-states", () => {
    return stateSyncService?.getAllStates() || {};
  });

  ipcMain.handle("sync:get-stats", () => {
    return stateSyncService?.getStats() || { subscriptions: 0, cachedSlices: 0, pendingUpdates: 0, isRunning: false };
  });

  // Forward state updates to renderer
  stateSyncService?.on("state:notify", ({ subscriptionId, updates }) => {
    mainWindow?.webContents.send("sync:state-update", { subscriptionId, updates });
  });

  // ---- Plugin SDK Validator ----
  ipcMain.handle("sdk:validate-manifest", (_event, manifest: unknown) => {
    return pluginSdkValidator?.validateManifest(manifest) || { valid: false, errors: [{ type: "error", field: "validator", message: "SDK validator not initialized" }], warnings: [], infos: [] };
  });

  ipcMain.handle("sdk:generate-scaffold", (_event, manifest: unknown, options: { language: string; includeTests: boolean; includeDocs: boolean }) => {
    const result = pluginSdkValidator?.validateManifest(manifest);
    if (!result?.valid) {
      return { success: false, error: "Invalid manifest", files: {} };
    }
    const files = pluginSdkValidator?.generateScaffold(result.manifest!, {
      language: options.language as any,
      includeTests: options.includeTests,
      includeDocs: options.includeDocs,
    });
    return { success: true, files: files || {} };
  });

  ipcMain.handle("sdk:get-stats", () => {
    return pluginSdkValidator?.getStats() || { platformVersion: "", validPermissions: 0, validHooks: 0 };
  });

  // ---- Marketplace Service ----
  ipcMain.handle("marketplace:get-all-items", (_event, filter?: any) => {
    return marketplaceService?.getAllItems(filter) || [];
  });

  ipcMain.handle("marketplace:get-item", (_event, id: string) => {
    return marketplaceService?.getItem(id) || null;
  });

  ipcMain.handle("marketplace:get-stats", () => {
    return marketplaceService?.getStats() || {
      totalItems: 0, totalPlugins: 0, totalSkills: 0, totalTemplates: 0, totalAgents: 0,
      installedCount: 0, updateAvailableCount: 0, totalDownloads: 0, averageRating: 0,
    };
  });

  ipcMain.handle("marketplace:install-item", async (_event, id: string) => {
    if (!marketplaceService) return { success: false, itemId: id, message: "Marketplace service not initialized", requiresRestart: false };
    const result = await marketplaceService.installItem(id);
    return result;
  });

  ipcMain.handle("marketplace:uninstall-item", async (_event, id: string) => {
    if (!marketplaceService) return { success: false, itemId: id, message: "Marketplace service not initialized" };
    const result = await marketplaceService.uninstallItem(id);
    return result;
  });

  ipcMain.handle("marketplace:update-item", async (_event, id: string) => {
    if (!marketplaceService) return { success: false, itemId: id, message: "Marketplace service not initialized", requiresRestart: false };
    const result = await marketplaceService.updateItem(id);
    return result;
  });

  ipcMain.handle("marketplace:get-categories", () => {
    return marketplaceService?.getCategories() || [];
  });

  ipcMain.handle("marketplace:get-tags", () => {
    return marketplaceService?.getTags() || [];
  });

  // Forward marketplace install events to renderer
  marketplaceService?.on("install:complete", (data: any) => {
    mainWindow?.webContents.send("marketplace:install-event", { type: "installed", ...data });
  });
  marketplaceService?.on("install:error", (data: any) => {
    mainWindow?.webContents.send("marketplace:install-event", { type: "error", ...data });
  });
  marketplaceService?.on("uninstall:complete", (data: any) => {
    mainWindow?.webContents.send("marketplace:install-event", { type: "uninstalled", ...data });
  });

  // ---- Agent Context Manager ----
  ipcMain.handle("agent-context:create-session", (_event, name: string, options?: any) => {
    return agentContextManager?.createSession(name, options) || null;
  });

  ipcMain.handle("agent-context:get-session", (_event, id: string) => {
    return agentContextManager?.getSession(id) || null;
  });

  ipcMain.handle("agent-context:get-all-sessions", () => {
    return agentContextManager?.getAllSessions() || [];
  });

  ipcMain.handle("agent-context:delete-session", (_event, id: string) => {
    return agentContextManager?.deleteSession(id) || false;
  });

  ipcMain.handle("agent-context:rename-session", (_event, id: string, newName: string) => {
    return agentContextManager?.renameSession(id, newName) || false;
  });

  ipcMain.handle("agent-context:add-message", (_event, sessionId: string, message: any) => {
    return agentContextManager?.addMessage(sessionId, message) || null;
  });

  ipcMain.handle("agent-context:delete-message", (_event, sessionId: string, messageId: string) => {
    return agentContextManager?.deleteMessage(sessionId, messageId) || false;
  });

  ipcMain.handle("agent-context:get-messages", (_event, sessionId: string, options?: any) => {
    return agentContextManager?.getMessages(sessionId, options) || [];
  });

  ipcMain.handle("agent-context:compress-session", (_event, sessionId: string) => {
    return agentContextManager?.compressSession(sessionId) || null;
  });

  ipcMain.handle("agent-context:get-summary", (_event, sessionId: string) => {
    return agentContextManager?.getSummary(sessionId) || null;
  });

  ipcMain.handle("agent-context:inherit-context", (_event, fromSessionId: string, toSessionId: string, options: any) => {
    return agentContextManager?.inheritContext(fromSessionId, toSessionId, options) || false;
  });

  ipcMain.handle("agent-context:get-inheritances", (_event, sessionId: string) => {
    return agentContextManager?.getInheritances(sessionId) || [];
  });

  ipcMain.handle("agent-context:update-system-prompt", (_event, sessionId: string, systemPrompt: string) => {
    return agentContextManager?.updateSystemPrompt(sessionId, systemPrompt) || false;
  });

  ipcMain.handle("agent-context:build-context-for-llm", (_event, sessionId: string) => {
    return agentContextManager?.buildContextForLLM(sessionId) || null;
  });

  ipcMain.handle("agent-context:get-stats", () => {
    return agentContextManager?.getStats() || {
      totalSessions: 0, totalMessages: 0, totalTokens: 0, totalSummaries: 0, averageMessagesPerSession: 0,
    };
  });

}

// ============================================================
// Offline Detection
// ============================================================

let offlineCheckTimer: NodeJS.Timeout | null = null;
let isOffline = false;

function setupOfflineDetection(): void {
  // Check proxy connectivity every 10 seconds
  offlineCheckTimer = setInterval(async () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    const proxyHealthy = await checkProxyHealth();
    if (!proxyHealthy && !isOffline) {
      isOffline = true;
      console.warn("[DeerFlow] Proxy appears offline — backend services may have stopped");
      // Inject offline banner into the page
      mainWindow.webContents.executeJavaScript(`
        (function() {
          let banner = document.getElementById('deerflow-offline-banner');
          if (!banner) {
            banner = document.createElement('div');
            banner.id = 'deerflow-offline-banner';
            banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#ef4444;color:white;padding:8px 16px;font-family:sans-serif;font-size:13px;text-align:center;display:flex;align-items:center;justify-content:center;gap:12px;';
            document.body.appendChild(banner);
          }
          banner.innerHTML = '<span>⚠️ DeerFlow services are offline</span><button onclick="window.electronAPI.services.restart()" style="background:white;color:#ef4444;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;font-weight:600;font-size:12px;">Restart</button>';
          banner.style.display = 'flex';
        })();
      `).catch(() => {});
    } else if (proxyHealthy && isOffline) {
      isOffline = false;
      console.log("[DeerFlow] Proxy is back online");
      // Hide offline banner
      mainWindow.webContents.executeJavaScript(`
        (function() {
          const banner = document.getElementById('deerflow-offline-banner');
          if (banner) banner.style.display = 'none';
        })();
      `).catch(() => {});
    }
  }, 10000);
}

function stopOfflineDetection(): void {
  if (offlineCheckTimer) {
    clearInterval(offlineCheckTimer);
    offlineCheckTimer = null;
  }
}

function checkProxyHealth(): Promise<boolean> {
  return new Promise((resolve) => {
    const http = require("http");
    const req = http.get(`http://localhost:${PROXY_PORT}/api/health`, (res: any) => {
      res.resume();
      resolve(res.statusCode === 200 || res.statusCode === 404);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// ============================================================
// Settings Window
// ============================================================

function createSettingsWindow(): InstanceType<typeof BrowserWindow> {
  const settingsWindow = new BrowserWindow({
    width: 900,
    height: 650,
    title: "DeerFlow - Settings",
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: "#0a0a0a",
    autoHideMenuBar: true,
    resizable: true,
    minimizable: true,
  });

  settingsWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(getSettingsHTML())}`
  );

  return settingsWindow;
}

function showSettings(): void {
  // Check if settings window is already open
  const existing = BrowserWindow.getAllWindows().find(
    (w) => w.getTitle().includes("Settings")
  );
  if (existing) {
    existing.focus();
    return;
  }
  createSettingsWindow();
}

// ============================================================
// Navigation Helper
// ============================================================

function navigateTo(route: string): void {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send("navigate", route);
  }
}

// ============================================================
// Service Status Dashboard
// ============================================================

function showServiceStatusDashboard(): void {
  const statuses = serviceManager?.getStatus() || [];
  const html = getStatusDashboardHTML(statuses, {
    proxy: PROXY_PORT,
    langgraph: LANGGRAPH_PORT,
    gateway: GATEWAY_PORT,
    frontend: FRONTEND_PORT,
  });

  const statusWindow = new BrowserWindow({
    width: 600,
    height: 500,
    title: "DeerFlow - Service Status",
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: themeManager?.getBackgroundColor() || "#0f0f0f",
    autoHideMenuBar: true,
  });

  statusWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
  );
}

// ============================================================
// Onboarding Window
// ============================================================

function showOnboarding(): void {
  const existing = BrowserWindow.getAllWindows().find(
    (w) => w.getTitle().includes("Getting Started")
  );
  if (existing) {
    existing.focus();
    return;
  }

  const onboardingWindow = new BrowserWindow({
    width: 750,
    height: 650,
    title: "DeerFlow - Getting Started",
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: themeManager?.getBackgroundColor() || "#0a0a0a",
    autoHideMenuBar: true,
    resizable: false,
    minimizable: true,
  });

  onboardingWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(getOnboardingHTML(0))}`
  );
}

// ============================================================
// Diagnostics Window
// ============================================================

function showDiagnostics(): void {
  const existing = BrowserWindow.getAllWindows().find(
    (w) => w.getTitle().includes("Diagnostics")
  );
  if (existing) {
    existing.focus();
    return;
  }

  const diagWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: "DeerFlow - Diagnostics",
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: themeManager?.getBackgroundColor() || "#0a0a0a",
    autoHideMenuBar: true,
  });

  diagWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(getDiagnosticsHTML())}`
  );
}

// ============================================================
// Shortcuts Window
// ============================================================

function showShortcuts(): void {
  const existing = BrowserWindow.getAllWindows().find(
    (w) => w.getTitle().includes("Keyboard Shortcuts")
  );
  if (existing) {
    existing.focus();
    return;
  }

  const shortcutsWindow = new BrowserWindow({
    width: 700,
    height: 650,
    title: "DeerFlow - Keyboard Shortcuts",
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: themeManager?.getBackgroundColor() || "#0a0a0a",
    autoHideMenuBar: true,
  });

  shortcutsWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(getShortcutsHTML())}`
  );
}

// ============================================================
// Helper: Build model config from onboarding data
// ============================================================

function buildOnboardingModelConfig(provider: string, modelName: string): Record<string, any> {
  const configs: Record<string, any> = {
    openai: { use: "langchain_openai:ChatOpenAI", model: modelName || "gpt-4o" },
    anthropic: { use: "langchain_anthropic:ChatAnthropic", model: modelName || "claude-3-5-sonnet-20241022" },
    deepseek: { use: "deerflow.models.patched_deepseek:PatchedChatDeepSeek", model: modelName || "deepseek-reasoner" },
    gemini: { use: "langchain_google_genai:ChatGoogleGenerativeAI", model: modelName || "gemini-2.5-pro" },
    openrouter: { use: "langchain_openai:ChatOpenAI", model: modelName || "google/gemini-2.5-flash-preview", base_url: "https://openrouter.ai/api/v1" },
    minimax: { use: "langchain_openai:ChatOpenAI", model: modelName || "MiniMax-Text-01" },
  };
  return configs[provider] || configs.openai;
}

function getEnvVarForProvider(provider: string): string | null {
  const envVars: Record<string, string> = {
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    deepseek: "DEEPSEEK_API_KEY",
    gemini: "GEMINI_API_KEY",
    openrouter: "OPENAI_API_KEY",
    minimax: "MINIMAX_API_KEY",
  };
  return envVars[provider] || null;
}

// ============================================================
// File Drop Setup
// ============================================================

function setupFileDrop(window: InstanceType<typeof BrowserWindow>): void {
  // Enable file drop on the main window
  window.webContents.on("file-drop-target", (event, files: string[]) => {
    event.preventDefault();
    if (!fileDropHandler) return;

    const result = fileDropHandler.processDroppedFiles(files);
    // Send to renderer
    window.webContents.send("files:dropped", result.files, result.errors);
  });

  // Prevent default file drop behavior (which would navigate)
  window.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith("file://")) {
      event.preventDefault();
    }
  });
}

// ============================================================
// Application Lifecycle
// ============================================================

// ============================================================
// Process Error Handling
// ============================================================

process.on("uncaughtException", (err) => {
  logger.error(`Uncaught exception: ${err.message}\n${err.stack}`, "process");
  console.error("[DeerFlow] Uncaught exception:", err);
});

process.on("unhandledRejection", (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  logger.error(`Unhandled rejection: ${msg}`, "process");
  console.error("[DeerFlow] Unhandled rejection:", reason);
});

// SIGTERM/SIGINT handling for graceful shutdown
process.on("SIGTERM", () => {
  logger.info("Received SIGTERM, shutting down gracefully...", "process");
  app.quit();
});

process.on("SIGINT", () => {
  logger.info("Received SIGINT, shutting down gracefully...", "process");
  app.quit();
});

// ============================================================
// App Lifecycle
// ============================================================

app.whenReady().then(async () => {
  logger.info("Starting Electron application...", "app");
  console.log("[DeerFlow] Starting Electron application...");
  console.log(`[DeerFlow] Project root: ${PROJECT_ROOT}`);

  // Initialize all managers
  windowState = createWindowStateTracker(app.getPath("userData"));
  configManager = new ConfigManager(PROJECT_ROOT);
  notifications = new DesktopNotifications();
  fileDropHandler = new FileDropHandler(PROJECT_ROOT);
  shortcutsManager = new ShortcutsManager(app.getPath("userData"));
  themeManager = new ThemeManager(app.getPath("userData"));
  diagnostics = new DiagnosticsManager(PROJECT_ROOT, app.getVersion());

  // Initialize MCP Manager and Agent Session Manager
  mcpManager = new MCPManager(PROJECT_ROOT);
  agentSessionManager = new AgentSessionManager(PROJECT_ROOT);

  // Load MCP config and start enabled servers
  await mcpManager.loadConfig();
  await mcpManager.startAll();

  // Load existing sessions
  const sessionStats = agentSessionManager.getStats();
  console.log(`[DeerFlow] Loaded ${sessionStats.totalSessions} agent sessions`);

  // Initialize Workflow Orchestrator and Context Manager
  workflowOrchestrator = new WorkflowOrchestrator(PROJECT_ROOT);
  contextManager = new ContextManager(PROJECT_ROOT);

  const workflowCount = workflowOrchestrator.listWorkflows().length;
  const templateCount = workflowOrchestrator.getTemplates().length;
  const memoryStats = contextManager.getMemoryStats();
  console.log(`[DeerFlow] Loaded ${workflowCount} workflows, ${templateCount} templates`);
  console.log(`[DeerFlow] Context manager: ${memoryStats.totalMemories} memories stored`);

  // Initialize Skill Manager, Event Bus, and Performance Monitor
  skillManager = new SkillManager(PROJECT_ROOT);
  eventBus = new AgentEventBus({ enableMetrics: true });
  performanceMonitor = new PerformanceMonitor(PROJECT_ROOT);

  // Discover and load skills
  await skillManager.discoverSkills();
  const skillStats = skillManager.getStats();
  console.log(`[DeerFlow] Skill manager: ${skillStats.totalSkills} skills (${skillStats.enabledSkills} enabled)`);

  // Start performance monitoring
  performanceMonitor.start();
  console.log(`[DeerFlow] Performance monitor started`);

  // Initialize Agent Reasoning Engine
  reasoningEngine = new AgentReasoningEngine(PROJECT_ROOT);
  console.log(`[DeerFlow] Agent reasoning engine initialized`);

  // Initialize Knowledge Graph Manager
  knowledgeGraph = new KnowledgeGraphManager(PROJECT_ROOT);
  const kgStats = knowledgeGraph.getStats();
  console.log(`[DeerFlow] Knowledge graph: ${kgStats.totalEntities} entities, ${kgStats.totalRelations} relations`);

  // Initialize Task Scheduler
  taskScheduler = new TaskScheduler(PROJECT_ROOT);
  const schedulerStats = taskScheduler.getStats();
  console.log(`[DeerFlow] Task scheduler: ${schedulerStats.totalTasks} tasks (${schedulerStats.enabledTasks} enabled)`);

  // Initialize Audit Logger
  auditLogger = new AuditLogger(PROJECT_ROOT);
  console.log(`[DeerFlow] Audit logger initialized`);

  // Initialize Agent Bridge
  agentBridge = new AgentBridge({ langgraphUrl: `http://localhost:${LANGGRAPH_PORT}` });
  const bridgeHealthy = await agentBridge.isHealthy();
  console.log(`[DeerFlow] Agent bridge: ${bridgeHealthy ? "connected" : "disconnected"}`);

  // Initialize Security Manager
  securityManager = new SecurityManager(PROJECT_ROOT);
  console.log(`[DeerFlow] Security manager initialized`);

  // Initialize Plugin Manager
  pluginManager = new PluginManager(PROJECT_ROOT, app.getVersion());
  const pluginStats = pluginManager.getStats();
  console.log(`[DeerFlow] Plugin manager: ${pluginStats.total} plugins (${pluginStats.enabled} enabled)`);

  // Initialize Agent Collaboration Hub
  collaborationHub = new AgentCollaborationHub(PROJECT_ROOT);
  console.log(`[DeerFlow] Agent collaboration hub initialized`);

  // Initialize Conversation Memory Engine
  conversationMemory = new ConversationMemoryEngine(PROJECT_ROOT);
  const memStats = conversationMemory.getStats();
  console.log(`[DeerFlow] Conversation memory: ${memStats.totalMemories} memories, ${memStats.recentlyCreated} new today`);

  // Initialize Tool Registry
  toolRegistry = new ToolRegistry(PROJECT_ROOT);
  const toolStats = toolRegistry.getStats();
  console.log(`[DeerFlow] Tool registry: ${toolStats.totalTools} tools (${toolStats.byCategory.builtin || 0} builtin)`);

  // Initialize Health Monitor
  healthMonitor = new HealthMonitor(PROJECT_ROOT);
  healthMonitor.registerService("proxy", { dependencies: [] });
  healthMonitor.registerService("langgraph", { dependencies: ["proxy"] });
  healthMonitor.registerService("gateway", { dependencies: ["proxy", "langgraph"] });
  healthMonitor.registerService("frontend", { dependencies: ["proxy"] });
  healthMonitor.start();
  console.log(`[DeerFlow] Health monitor started`);

  // Initialize WebSocket Manager
  websocketManager = new WebSocketManager();
  websocketManager.start();
  console.log(`[DeerFlow] WebSocket manager started`);

  // Initialize Tray Notification Manager
  trayNotificationManager = new TrayNotificationManager();
  console.log(`[DeerFlow] Tray notification manager initialized`);

  // Initialize Backup Service
  backupService = new BackupService(PROJECT_ROOT);
  if (backupService.getConfig().enabled) {
    backupService.startAutoBackup();
  }
  const backupStats = backupService.getStats();
  console.log(`[DeerFlow] Backup service: ${backupStats.totalBackups} backups, auto=${backupStats.autoBackupEnabled}`);

  // Initialize Session Export Service
  sessionExportService = new SessionExportService(PROJECT_ROOT);
  console.log(`[DeerFlow] Session export service initialized`);

  // Initialize Charts Data Pipeline
  chartsDataPipeline = new ChartsDataPipeline();
  chartsDataPipeline.registerSessionManager(agentSessionManager);
  chartsDataPipeline.registerToolRegistry(toolRegistry);
  chartsDataPipeline.registerPerfMonitor(performanceMonitor);
  chartsDataPipeline.registerKnowledgeGraph(knowledgeGraph);
  chartsDataPipeline.registerCollaboration(collaborationHub);
  chartsDataPipeline.registerMemoryEngine(conversationMemory);
  chartsDataPipeline.registerHealthMonitor(healthMonitor);
  chartsDataPipeline.registerScheduler(taskScheduler);
  chartsDataPipeline.registerAuditLogger(auditLogger);
  console.log(`[DeerFlow] Charts data pipeline initialized`);

  // Initialize State Sync Service
  stateSyncService = new StateSyncService();
  stateSyncService.start();
  console.log(`[DeerFlow] State sync service started`);

  // Initialize Plugin SDK Validator
  pluginSdkValidator = new PluginSDKValidator(app.getVersion());
  console.log(`[DeerFlow] Plugin SDK validator initialized`);

  // Initialize Marketplace Service
  marketplaceService = new MarketplaceService(PROJECT_ROOT, {
    pluginManager: pluginManager || undefined,
    skillManager: skillManager || undefined,
  });
  const marketplaceStats = marketplaceService.getStats();
  console.log(`[DeerFlow] Marketplace: ${marketplaceStats.totalItems} items (${marketplaceStats.installedCount} installed)`);

  // Initialize Agent Context Manager
  agentContextManager = new AgentContextManager(PROJECT_ROOT);
  const contextStats = agentContextManager.getStats();
  console.log(`[DeerFlow] Agent context: ${contextStats.totalSessions} sessions, ${contextStats.totalMessages} messages`);

  // Wire up event bus to existing managers for cross-module communication
  setupEventBusIntegration();

  // Set notification click → navigate callback
  notifications.setNavigateCallback((route) => {
    if (route === "__settings__") {
      showSettings();
    } else {
      navigateTo(route);
    }
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Initialize startup optimizer
  startupOptimizer = new StartupOptimizer();
  startupOptimizer.start();
  startupOptimizer.on("completed", (metrics) => {
    logger.info(`Startup completed in ${metrics.totalDuration}ms`, "startup");
    console.log("\n" + startupOptimizer!.formatMetrics());
  });

  // Set up menu
  Menu.setApplicationMenu(createAppMenu());

  // Create splash window (shown first)
  createSplashWindow();

  // Create main window (hidden behind splash)
  createMainWindow();

  // Set up file drop on main window
  if (mainWindow) {
    setupFileDrop(mainWindow);
  }

  // Create tray icon
  createTray();

  // Set up IPC
  setupIPC();

  // Start backend services, proxy, and load frontend (optimized)
  await startBackendAndLoadFrontendOptimized();

  // Check config and notify if no models configured
  checkConfigState();

  // Initialize telemetry (opt-in, disabled by default)
  telemetry = new TelemetryManager({
    enabled: false,
    flushIntervalMs: 60000,
    maxQueueSize: 50,
  });

  // Initialize auto-updater (after everything is ready)
  autoUpdater = new AutoUpdater({
    checkOnStartup: true,
    autoCheckIntervalHours: 24,
    silentDownload: true,
  });

  autoUpdater.on("update-available", (info: any) => {
    logger.info(`Update available: ${info.version}`, "updater");
    notifications?.send({
      title: "🔄 Update Available",
      body: `DeerFlow ${info.version} is available. Downloading in background...`,
      category: "system",
    });
  });

  autoUpdater.on("update-ready", (info: any) => {
    logger.info(`Update ready: ${info.version}`, "updater");
    notifications?.send({
      title: "✅ Update Ready",
      body: `DeerFlow ${info.version} has been downloaded. Restart to install.`,
      category: "system",
      clickRoute: "__settings__",
    });
  });

  autoUpdater.on("error", (err: Error) => {
    logger.warn(`Update check failed: ${err.message}`, "updater");
  });

  await autoUpdater.initialize();

  // Track startup completion
  startupOptimizer?.on("completed", (metrics) => {
    telemetry?.trackStartupMetrics({
      totalDuration: metrics.totalDuration || 0,
      serviceCount: Object.keys(metrics.serviceDurations).length,
    });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  } else {
    mainWindow?.show();
  }
});

app.on("before-quit", async (event) => {
  if (isQuitting) return;

  event.preventDefault();
  isQuitting = true;

  console.log("[DeerFlow] Shutting down...");

  // Flush window state
  windowState?.flush();

  // Stop proxy
  if (proxyServer) {
    await proxyServer.stop();
  }

  // Stop static server
  if (staticServer) {
    await staticServer.stop();
  }

  // Stop backend services
  if (serviceManager) {
    await serviceManager.stopAll();
  }

  // Stop MCP servers
  if (mcpManager) {
    await mcpManager.stopAll();
  }

  // Flush agent sessions
  if (agentSessionManager) {
    agentSessionManager.flush();
  }

  // Destroy workflow orchestrator
  if (workflowOrchestrator) {
    workflowOrchestrator.destroy();
  }

  // Destroy context manager
  if (contextManager) {
    contextManager.destroy();
  }

  // Destroy skill manager
  if (skillManager) {
    skillManager.destroy();
  }

  // Destroy event bus
  if (eventBus) {
    eventBus.destroy();
  }

  // Destroy performance monitor
  if (performanceMonitor) {
    performanceMonitor.destroy();
  }

  // Destroy reasoning engine
  if (reasoningEngine) {
    reasoningEngine.destroy();
  }

  // Destroy knowledge graph
  if (knowledgeGraph) {
    knowledgeGraph.destroy();
  }

  // Destroy task scheduler
  if (taskScheduler) {
    taskScheduler.destroy();
  }

  // Destroy audit logger
  if (auditLogger) {
    auditLogger.destroy();
  }

  // Destroy agent bridge
  if (agentBridge) {
    agentBridge.destroy();
  }

  // Destroy security manager
  if (securityManager) {
    securityManager.destroy();
  }

  // Destroy plugin manager
  if (pluginManager) {
    pluginManager.destroy();
  }

  // Destroy marketplace service
  if (marketplaceService) {
    marketplaceService.dispose();
  }

  // Destroy agent context manager
  if (agentContextManager) {
    agentContextManager.dispose();
  }

  // Destroy collaboration hub
  if (collaborationHub) {
    collaborationHub.destroy();
  }

  // Destroy conversation memory
  if (conversationMemory) {
    conversationMemory.destroy();
  }

  // Destroy tool registry
  if (toolRegistry) {
    toolRegistry.destroy();
  }

  // Destroy health monitor
  if (healthMonitor) {
    healthMonitor.destroy();
  }

  // Destroy websocket manager
  if (websocketManager) {
    websocketManager.stop();
  }

  // Destroy backup service
  if (backupService) {
    backupService.destroy();
  }

  // Destroy tray
  if (tray) {
    tray.destroy();
  }

  app.exit(0);
});

// ============================================================
// Backend + Proxy + Frontend Loading (Optimized)
// ============================================================

async function startBackendAndLoadFrontendOptimized(): Promise<void> {
  // Start backend services
  serviceManager = new ServiceManager(PROJECT_ROOT);

  // Forward service logs to both splash and main window
  serviceManager.on("log", (name: string, _stream: string, msg: string) => {
    splashWindow?.webContents.send("service:log", { name, msg });
    mainWindow?.webContents.send("service:log", { name, msg });
  });

  serviceManager.on("ready", (name: string) => {
    console.log(`[DeerFlow] Service ready: ${name}`);
    startupOptimizer?.recordServiceReady(name);
    splashWindow?.webContents.send("service:ready", name);
    mainWindow?.webContents.send("service:ready", name);
    notifications?.notifyServiceStatus(name, "ready");
  });

  serviceManager.on("error", (name: string, err: Error) => {
    console.error(`[DeerFlow] Service ${name} error: ${err.message}`);
    splashWindow?.webContents.send("service:ready", name);
    mainWindow?.webContents.send("service:ready", name);
    notifications?.notifyServiceStatus(name, "error");
  });

  // Determine frontend mode: static files or dev server
  const useStaticFiles = isProductionMode();
  const frontendTargetPort = useStaticFiles ? STATIC_PORT : FRONTEND_PORT;

  if (useStaticFiles) {
    console.log("[DeerFlow] Production mode: using static file server");
    staticServer = new StaticServer({
      port: STATIC_PORT,
      rootDir: STATIC_DIR,
    });
  } else {
    console.log("[DeerFlow] Development mode: using Next.js dev server");
  }

  // Start proxy server in parallel with backend services
  proxyServer = new ProxyServer({
    port: PROXY_PORT,
    langgraphPort: LANGGRAPH_PORT,
    gatewayPort: GATEWAY_PORT,
    frontendPort: frontendTargetPort,
  });

  // Launch services, static server (if prod), and proxy concurrently
  const startupTasks: Array<() => Promise<void>> = [
    async () => {
      console.log("[DeerFlow] Starting backend services...");
      await serviceManager!.startAll();
      console.log("[DeerFlow] Backend services ready.");
    },
    async () => {
      try {
        await proxyServer!.start();
        console.log("[DeerFlow] Proxy server started.");
        startupOptimizer?.recordProxyReady();
        splashWindow?.webContents.send("service:ready", "proxy");
      } catch (err: any) {
        console.warn(`[DeerFlow] Proxy failed: ${err.message}`);
      }
    },
  ];

  // Add static server startup in production mode
  if (useStaticFiles && staticServer) {
    startupTasks.push(async () => {
      try {
        await staticServer!.start();
        splashWindow?.webContents.send("service:ready", "frontend");
      } catch (err: any) {
        console.warn(`[DeerFlow] Static server failed: ${err.message}`);
      }
    });
  }

  const results = await Promise.allSettled(startupTasks.map((t) => t()));
  const servicesResult = results[0];

  if (servicesResult.status === "rejected") {
    console.error("[DeerFlow] Failed to start backend services:", servicesResult.reason);
    notifications?.send({
      title: "⚠️ Service Start Error",
      body: `Some services failed to start: ${servicesResult.reason.message || servicesResult.reason}`,
      category: "service",
    });
  }

  // Try to load the frontend into main window with smart retry
  let frontendLoaded = false;

  try {
    await retryWithBackoff(
      async () => {
        console.log("[DeerFlow] Loading frontend...");
        await mainWindow?.loadURL(LOAD_URL);
        console.log("[DeerFlow] Frontend loaded successfully!");
      },
      {
        maxRetries: 15,
        baseDelay: 1000,
        maxDelay: 5000,
        onRetry: (attempt, err) => {
          console.log(`[DeerFlow] Frontend load attempt ${attempt}/15 failed: ${err.message}`);
          splashWindow?.webContents.send("service:log", {
            name: "frontend",
            msg: `Load attempt ${attempt}...`,
          });
        },
      }
    );

    startupOptimizer?.recordFrontendLoaded();
    splashWindow?.webContents.send("service:ready", "frontend");
    frontendLoaded = true;
  } catch (err: any) {
    console.error("[DeerFlow] Failed to load frontend after all retries:", err.message);
  }

  // Transition from splash to main window
  if (frontendLoaded) {
    // Small delay to let splash show "all ready"
    await new Promise((resolve) => setTimeout(resolve, 600));

    mainWindow?.show();
    mainWindow?.focus();
    splashWindow?.close();
    startupOptimizer?.complete();
  } else {
    // Show error in main window
    console.error("[DeerFlow] Failed to load frontend after all retries.");
    mainWindow?.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        getErrorPage(
          "Could not connect to the DeerFlow frontend. " +
            "Make sure the Next.js dev server is running (port 3000) " +
            "or run 'make dev' first."
        )
      )}`
    );
    mainWindow?.show();
    splashWindow?.close();
    startupOptimizer?.complete();
  }
}

// ============================================================
// Config State Check
// ============================================================

function checkConfigState(): void {
  if (!configManager) return;

  const summary = configManager.getConfigSummary();

  if (!summary.hasModels) {
    console.warn("[DeerFlow] No models configured in config.yaml");

    // Show notification about missing model config
    setTimeout(() => {
      notifications?.send({
        title: "⚠️ No AI Models Configured",
        body: "Click here to open Settings and add your first AI model.",
        category: "system",
        clickRoute: "__settings__",
      });

      // Auto-open onboarding wizard on first run (no models) only if never welcomed before
      if (isFirstRun()) {
        showOnboarding();
        markFirstRunWelcomed();
      }
    }, 3000); // Delay to let splash finish
  }

  if (summary.modelCount > 0) {
    console.log(
      `[DeerFlow] ${summary.modelCount} model(s) configured: ${summary.models.map((m) => m.name).join(", ")}`
    );
    // Mark as welcomed if models are configured
    markFirstRunWelcomed();
  }
}

// ============================================================
// Error Page
// ============================================================

// ============================================================
// Event Bus Integration
// ============================================================

function setupEventBusIntegration(): void {
  if (!eventBus) return;

  // Forward session events to event bus
  agentSessionManager?.on("session:created", (session: any) => {
    eventBus?.publish("session", "session:created", session, { source: "agent-session" });
  });
  agentSessionManager?.on("session:started", (session: any) => {
    eventBus?.publish("session", "session:started", session, { source: "agent-session" });
  });
  agentSessionManager?.on("session:completed", (session: any) => {
    eventBus?.publish("session", "session:completed", session, { source: "agent-session" });
  });
  agentSessionManager?.on("session:error", (data: any) => {
    eventBus?.publish("session", "session:error", data, { source: "agent-session", priority: "high" });
  });

  // Forward workflow events to event bus
  workflowOrchestrator?.on("execution:started", (data: any) => {
    eventBus?.publish("workflow", "workflow:execution-started", data, { source: "workflow-orchestrator" });
  });
  workflowOrchestrator?.on("execution:completed", (data: any) => {
    eventBus?.publish("workflow", "workflow:execution-completed", data, { source: "workflow-orchestrator" });
  });
  workflowOrchestrator?.on("execution:failed", (data: any) => {
    eventBus?.publish("workflow", "workflow:execution-failed", data, { source: "workflow-orchestrator", priority: "high" });
  });

  // Forward MCP events to event bus
  mcpManager?.on("tool:executed", (data: any) => {
    eventBus?.publish("mcp", "mcp:tool-executed", data, { source: "mcp-manager" });
  });
  mcpManager?.on("tool:error", (data: any) => {
    eventBus?.publish("mcp", "mcp:tool-error", data, { source: "mcp-manager", priority: "high" });
  });

  // Forward skill events to event bus
  skillManager?.on("skill:enabled", (skill: any) => {
    eventBus?.publish("skill", "skill:enabled", skill, { source: "skill-manager" });
  });
  skillManager?.on("skill:disabled", (skill: any) => {
    eventBus?.publish("skill", "skill:disabled", skill, { source: "skill-manager" });
  });
  skillManager?.on("skill:installed", (skill: any) => {
    eventBus?.publish("skill", "skill:installed", skill, { source: "skill-manager" });
  });

  // Forward system events
  eventBus.subscribeToChannel("system", (event) => {
    if (event.type === "system:shutdown") {
      console.log("[DeerFlow] Shutdown event received via event bus");
    }
  });

  // Performance monitoring via event bus
  eventBus.subscribeToChannel("session", (event) => {
    if (event.type === "session:started") {
      performanceMonitor?.trackSessionStart(event.payload.id, event.payload.id, event.payload.model);
    }
  }, { eventType: "session:started" });

  eventBus.subscribeToChannel("session", (event) => {
    if (event.type === "session:completed") {
      performanceMonitor?.trackSessionEnd(event.payload.id, event.payload.tokenCount);
    }
  }, { eventType: "session:completed" });

  eventBus.subscribeToChannel("mcp", (event) => {
    if (event.type === "mcp:tool-executed") {
      performanceMonitor?.trackMCPCallEnd(event.payload.callId || "unknown", "success");
    }
    if (event.type === "mcp:tool-error") {
      performanceMonitor?.trackMCPCallEnd(event.payload.callId || "unknown", "error", event.payload.error);
    }
  });

  console.log("[DeerFlow] Event bus integration established");
}

// ============================================================
// Error Page
// ============================================================

function getErrorPage(errorMsg: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>DeerFlow - Error</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
      background: #0a0a0a; color: #e5e5e5;
      display: flex; align-items: center; justify-content: center;
      height: 100vh; overflow: hidden;
    }
    .container { text-align: center; max-width: 600px; padding: 2rem; }
    .logo { font-size: 4rem; margin-bottom: 1rem; }
    h1 { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem; color: #ef4444; }
    .subtitle { color: #888; margin-bottom: 2rem; }
    .error {
      background: #1a1a1a; border: 1px solid #333; border-radius: 8px;
      padding: 1rem; text-align: left; font-family: monospace;
      font-size: 0.85rem; color: #ef4444; max-height: 200px; overflow-y: auto;
    }
    .actions { margin-top: 1.5rem; display: flex; gap: 0.5rem; justify-content: center; }
    .btn {
      padding: 0.5rem 1.5rem; border: none; border-radius: 6px;
      font-size: 0.9rem; cursor: pointer; color: white;
    }
    .btn-primary { background: #4f46e5; }
    .btn-primary:hover { background: #4338ca; }
    .btn-secondary { background: #333; }
    .btn-secondary:hover { background: #444; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🦌</div>
    <h1>Connection Error</h1>
    <p class="subtitle">Could not connect to DeerFlow services</p>
    <div class="error">${errorMsg}</div>
    <div class="actions">
      <button class="btn btn-primary" onclick="location.reload()">Retry</button>
      <button class="btn btn-secondary" onclick="window.electronAPI.services.restart().then(()=>location.reload())">Restart Services</button>
    </div>
  </div>
</body>
</html>`;
}
