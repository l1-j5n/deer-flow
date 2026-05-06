/**
 * DeerFlow Electron - Preload Script
 *
 * Bridge between the main process and the renderer (DeerFlow frontend).
 * Exposes safe APIs via contextBridge for:
 * - Service management (status, restart, logs)
 * - Desktop notifications
 * - File drop handling
 * - Configuration management
 * - App info and utilities
 */

import { contextBridge, ipcRenderer } from "electron";

// ============================================================
// Type Definitions
// ============================================================

export interface ServiceStatus {
  name: string;
  running: boolean;
  pid?: number;
  ready: boolean;
  error?: string;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
  clickRoute?: string;
  category?: "agent" | "service" | "system";
}

export interface DroppedFile {
  name: string;
  path: string;
  size: number;
  type: string;
  isDirectory: boolean;
}

export interface ElectronAPI {
  // Service management
  services: {
    getStatus: () => Promise<ServiceStatus[]>;
    restart: () => Promise<{ success: boolean; error?: string }>;
    onLog: (
      callback: (data: { name: string; stream: string; msg: string }) => void
    ) => () => void;
    onReady: (callback: (name: string) => void) => () => void;
  };

  // Desktop notifications
  notifications: {
    send: (
      options: NotificationOptions
    ) => Promise<{ success: boolean; error?: string; id: string }>;
    isSupported: () => Promise<boolean>;
  };

  // File operations
  files: {
    onDrop: (
      callback: (files: DroppedFile[], errors: Array<{ path: string; error: string }>) => void
    ) => () => void;
    readAsBase64: (
      filePath: string
    ) => Promise<{
      success: boolean;
      data?: string;
      mimeType?: string;
      error?: string;
    }>;
    copyToThreadUpload: (
      filePath: string,
      threadId: string
    ) => Promise<{ success: boolean; destination?: string; error?: string }>;
  };

  // Configuration management
  config: {
    read: (
      filename: "config" | "env" | "extensions"
    ) => Promise<{ success: boolean; content?: string; error?: string }>;
    write: (
      filename: "config" | "env" | "extensions",
      content: string
    ) => Promise<{ success: boolean; error?: string }>;
    getModels: () => Promise<{
      success: boolean;
      models?: Array<Record<string, any>>;
      error?: string;
    }>;
    getEnvVars: () => Promise<{
      success: boolean;
      vars?: Record<string, string>;
      error?: string;
    }>;
    setEnvVar: (
      key: string,
      value: string
    ) => Promise<{ success: boolean; error?: string }>;
    getSummary: () => Promise<{
      hasModels: boolean;
      modelCount: number;
      hasEnvVars: boolean;
      envVarCount: number;
      models: Array<Record<string, any>>;
    }>;
    addModel: (
      model: Record<string, any>
    ) => Promise<{ success: boolean; error?: string }>;
    removeModel: (
      name: string
    ) => Promise<{ success: boolean; error?: string }>;
  };

  // Dialog
  dialog: {
    openFolder: () => Promise<string | null>;
    openFile: (filters?: Array<{ name: string; extensions: string[] }>) => Promise<
      string[] | null
    >;
  };

  // Shell
  shell: {
    openExternal: (url: string) => Promise<void>;
    openPath: (path: string) => Promise<void>;
  };

  // App info
  app: {
    getVersion: () => Promise<string>;
    getProjectRoot: () => Promise<string>;
    getPlatform: () => Promise<string>;
    getConfig: () => Promise<{
      proxyPort: number;
      langgraphPort: number;
      gatewayPort: number;
      frontendPort: number;
    }>;
    getStartupMetrics: () => Promise<any>;
    isElectron: true;
  };

  // Telemetry
  telemetry: {
    getConfig: () => Promise<{ enabled: boolean }>;
    enable: () => Promise<{ enabled: boolean }>;
    disable: () => Promise<{ enabled: boolean }>;
    track: (eventName: string, properties?: Record<string, any>) => Promise<{ success: boolean }>;
  };

  // Auto updater
  updater: {
    check: () => Promise<any>;
    getStatus: () => Promise<any>;
    install: () => Promise<{ success: boolean }>;
  };

  // Navigation
  navigation: {
    onNavigate: (callback: (route: string) => void) => () => void;
  };

  // Onboarding
  onboarding: {
    complete: () => Promise<{ success: boolean }>;
    navigate: (stepIndex: number) => Promise<{ success: boolean }>;
    saveModel: (data: { provider: string; apiKey: string; modelName: string }) => Promise<{ success: boolean; error?: string }>;
  };

  // Diagnostics
  diagnostics: {
    run: () => Promise<any>;
    exportReport: (report: any) => Promise<{ success: boolean; path?: string; error?: string }>;
    exportLogs: () => Promise<{ success: boolean; path?: string; error?: string }>;
  };

  // Shortcuts
  shortcuts: {
    getAll: () => Promise<any[]>;
    set: (action: string, accelerator: string) => Promise<{ success: boolean; error?: string }>;
    reset: (action: string) => Promise<{ success: boolean; error?: string }>;
    resetAll: () => Promise<{ success: boolean }>;
  };

  // User Settings persistence
  settings: {
    read: () => Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }>;
    write: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  };

  // Theme
  theme: {
    get: () => Promise<{ mode: string; effective: string }>;
    set: (mode: "light" | "dark" | "auto") => Promise<{ mode: string; effective: string }>;
    toggle: () => Promise<{ effective: string }>;
    onChange: (callback: (theme: string) => void) => () => void;
  };

  // MCP Manager
  mcp: {
    getServers: () => Promise<any[]>;
    getTools: () => Promise<any[]>;
    getTool: (name: string) => Promise<any | null>;
    executeTool: (toolName: string, args: Record<string, any>) => Promise<any>;
    validateArgs: (toolName: string, args: Record<string, any>) => Promise<{ valid: boolean; errors?: string[] }>;
    addServer: (config: any) => Promise<{ success: boolean; error?: string }>;
    removeServer: (name: string) => Promise<{ success: boolean; error?: string }>;
    setServerEnabled: (name: string, enabled: boolean) => Promise<{ success: boolean; error?: string }>;
    searchTools: (query: string) => Promise<any[]>;
    saveConfig: () => Promise<{ success: boolean; error?: string }>;
  };

  // Agent Session Manager
  session: {
    create: (options?: any) => Promise<any>;
    get: (id: string) => Promise<any | null>;
    list: (filter?: any) => Promise<any[]>;
    start: (id: string) => Promise<{ success: boolean; error?: string }>;
    pause: (id: string) => Promise<{ success: boolean; error?: string }>;
    resume: (id: string) => Promise<{ success: boolean; error?: string }>;
    complete: (id: string) => Promise<{ success: boolean; error?: string }>;
    cancel: (id: string) => Promise<{ success: boolean; error?: string }>;
    delete: (id: string) => Promise<{ success: boolean; error?: string }>;
    addMessage: (sessionId: string, message: any) => Promise<any>;
    getMessages: (sessionId: string, options?: any) => Promise<{ messages: any[]; total: number }>;
    updateTitle: (id: string, title: string) => Promise<{ success: boolean; error?: string }>;
    updateMetadata: (id: string, metadata: any) => Promise<{ success: boolean; error?: string }>;
    search: (query: string) => Promise<any[]>;
    getStats: () => Promise<any>;
    export: (id: string) => Promise<any>;
    import: (data: any) => Promise<any>;
    archiveOld: (days?: number) => Promise<{ archived: number }>;
  };

  // Workflow Orchestrator
  workflow: {
    create: (definition: any) => Promise<any>;
    get: (id: string) => Promise<any | null>;
    list: () => Promise<any[]>;
    update: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
    delete: (id: string) => Promise<{ success: boolean; error?: string }>;
    validate: (definition: any) => Promise<{ valid: boolean; errors: string[] }>;
    execute: (workflowId: string, vars?: any) => Promise<any>;
    getExecution: (id: string) => Promise<any | null>;
    listExecutions: (workflowId?: string) => Promise<any[]>;
    pause: (id: string) => Promise<{ success: boolean; error?: string }>;
    resume: (id: string) => Promise<{ success: boolean; error?: string }>;
    cancel: (id: string) => Promise<{ success: boolean; error?: string }>;
    provideInput: (executionId: string, nodeId: string, value: any) => Promise<{ success: boolean; error?: string }>;
    getTemplates: () => Promise<any[]>;
    createFromTemplate: (templateId: string, overrides?: any) => Promise<any | null>;
  };

  // Context Manager
  context: {
    build: (messages: any[], options?: any) => Promise<any>;
    countTokens: (messages: any[]) => Promise<any>;
    isOverBudget: (messages: any[], budget?: number) => Promise<boolean>;
    createSnapshot: (sessionId: string, messages: any[], metadata?: any) => Promise<any | null>;
    getSnapshot: (id: string) => Promise<any | null>;
    listSnapshots: (sessionId?: string) => Promise<any[]>;
    restoreSnapshot: (id: string) => Promise<any>;
    deleteSnapshot: (id: string) => Promise<{ success: boolean; error?: string }>;
    storeMemory: (content: string, options?: any) => Promise<any | null>;
    retrieveMemories: (query?: any) => Promise<any[]>;
    getMemory: (id: string) => Promise<any | null>;
    updateMemory: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
    deleteMemory: (id: string) => Promise<{ success: boolean; error?: string }>;
    extractMemories: (messages: any[], sessionId?: string) => Promise<any[]>;
    getMemoryStats: () => Promise<any>;
    getConfig: () => Promise<any>;
    updateConfig: (updates: any) => Promise<{ success: boolean }>;
  };

  // Skill Manager
  skill: {
    getAll: () => Promise<any[]>;
    get: (id: string) => Promise<any | null>;
    getEnabled: () => Promise<any[]>;
    search: (query: string) => Promise<any[]>;
    enable: (id: string) => Promise<{ success: boolean; error?: string }>;
    disable: (id: string) => Promise<{ success: boolean; error?: string }>;
    install: (options: any) => Promise<{ success: boolean; skill?: any; error?: string }>;
    uninstall: (id: string) => Promise<{ success: boolean; error?: string }>;
    updateConfig: (id: string, config: any) => Promise<{ success: boolean; error?: string }>;
    getStats: () => Promise<any>;
    discover: () => Promise<any[]>;
    execute: (id: string, inputs: any) => Promise<any>;
    validateManifest: (manifest: any) => Promise<{ valid: boolean; errors: string[]; warnings: string[] }>;
  };

  // Event Bus
  eventBus: {
    publish: (channel: any, type: string, payload: any, options?: any) => Promise<any | null>;
    request: (channel: any, type: string, payload: any, options?: any) => Promise<any>;
    getHistory: (channel?: any) => Promise<any[]>;
    queryHistory: (query: any) => Promise<any[]>;
    getMetrics: () => Promise<any>;
    clearHistory: (channel?: any) => Promise<{ success: boolean }>;
  };

  // Performance Monitor
  perf: {
    getSnapshot: () => Promise<any | null>;
    getReport: (periodHours?: number) => Promise<any | null>;
    getAlerts: (options?: any) => Promise<any[]>;
    acknowledgeAlert: (alertId: string) => Promise<boolean>;
    getMetrics: () => Promise<any | null>;
    saveMetrics: () => Promise<{ success: boolean; error?: string }>;
    loadMetrics: () => Promise<{ success: boolean; error?: string }>;
  };

  // Agent Reasoning Engine
  reasoning: {
    startTrace: (sessionId: string, goal: string, strategy?: string) => Promise<any | null>;
    getTrace: (id: string) => Promise<any | null>;
    listTraces: (filter?: any) => Promise<any[]>;
    addStep: (traceId: string, step: any) => Promise<any | null>;
    addThought: (traceId: string, content: string, confidence?: number) => Promise<any | null>;
    addAction: (traceId: string, content: string, toolName: string, toolArgs: any) => Promise<any | null>;
    addObservation: (traceId: string, content: string, toolResult?: any) => Promise<any | null>;
    completeTrace: (traceId: string, finalAnswer: string) => Promise<any | null>;
    failTrace: (traceId: string, error: string) => Promise<any | null>;
    pauseTrace: (traceId: string) => Promise<any | null>;
    resumeTrace: (traceId: string) => Promise<any | null>;
    getStats: () => Promise<any>;
    getConfig: () => Promise<any>;
    updateConfig: (updates: any) => Promise<{ success: boolean }>;
    exportTrace: (id: string) => Promise<any>;
    importTrace: (data: any) => Promise<any>;
  };

  // Knowledge Graph
  knowledgeGraph: {
    addEntity: (entity: any) => Promise<any | null>;
    getEntity: (id: string) => Promise<any | null>;
    searchEntities: (query: any) => Promise<any[]>;
    updateEntity: (id: string, updates: any) => Promise<boolean>;
    deleteEntity: (id: string) => Promise<boolean>;
    addRelation: (relation: any) => Promise<any | null>;
    queryRelations: (query: any) => Promise<any[]>;
    getNeighbors: (entityId: string) => Promise<any[]>;
    findPaths: (sourceId: string, targetId: string, maxDepth?: number) => Promise<any[]>;
    getSubgraph: (centerId: string, depth?: number) => Promise<any>;
    getStats: () => Promise<any>;
    exportViz: () => Promise<any>;
    exportGraph: () => Promise<any>;
    importGraph: (graph: any) => Promise<any>;
  };

  // Task Scheduler
  scheduler: {
    createTask: (task: any) => Promise<any | null>;
    getTask: (id: string) => Promise<any | null>;
    listTasks: (filter?: any) => Promise<any[]>;
    updateTask: (id: string, updates: any) => Promise<any | null>;
    deleteTask: (id: string) => Promise<boolean>;
    enableTask: (id: string) => Promise<boolean>;
    disableTask: (id: string) => Promise<boolean>;
    runNow: (id: string) => Promise<any | null>;
    getHistory: (taskId?: string) => Promise<any[]>;
    getStats: () => Promise<any>;
  };

  // Audit Logger
  audit: {
    log: (partial: any) => Promise<any | null>;
    query: (query?: any) => Promise<any[]>;
    getRecent: (limit?: number, category?: string) => Promise<any[]>;
    getStats: () => Promise<any>;
    exportJSON: (query?: any) => Promise<any>;
    exportCSV: (query?: any) => Promise<any>;
    verifyIntegrity: () => Promise<any>;
  };

  // Agent Bridge
  bridge: {
    createThread: (model?: string) => Promise<any | null>;
    getThread: (threadId: string) => Promise<any | null>;
    sendMessage: (threadId: string, content: string, options?: any) => Promise<any | null>;
    streamMessage: (threadId: string, content: string, options?: any) => Promise<any>;
    cancelStream: (threadId: string) => Promise<boolean>;
    submitToolResult: (threadId: string, toolCallId: string, result: string, isError?: boolean) => Promise<boolean>;
    isHealthy: () => Promise<boolean>;
    getModels: () => Promise<any[]>;
    onStreamEvent: (callback: (threadId: string, event: any) => void) => () => void;
  };

  // Security Manager
  security: {
    storeSecret: (name: string, value: string) => Promise<any | null>;
    retrieveSecret: (id: string) => Promise<any>;
    retrieveSecretByName: (name: string) => Promise<any>;
    deleteSecret: (id: string) => Promise<boolean>;
    listSecrets: () => Promise<any[]>;
    checkPermission: (action: string, context: any) => Promise<any>;
    validateApiKey: (key: string, provider: string) => Promise<any>;
    sanitizePath: (inputPath: string, allowedBaseDirs: string[]) => Promise<any>;
  };

  // Plugin Manager
  plugin: {
    discover: () => Promise<any[]>;
    load: (manifestPath: string) => Promise<any | null>;
    get: (id: string) => Promise<any | null>;
    list: (filter?: any) => Promise<any[]>;
    enable: (id: string) => Promise<any>;
    disable: (id: string) => Promise<boolean>;
    uninstall: (id: string) => Promise<any>;
    getStats: () => Promise<any>;
  };

  // Agent Collaboration Hub
  collaboration: {
    createSession: (title: string, goal: string, options?: any) => Promise<any | null>;
    getSession: (id: string) => Promise<any | null>;
    listSessions: (filter?: any) => Promise<any[]>;
    endSession: (id: string, finalResult?: any) => Promise<any | null>;
    deleteSession: (id: string) => Promise<boolean>;
    addCollaborator: (sessionId: string, name: string, role: string, capabilities: string[], model?: string) => Promise<any | null>;
    removeCollaborator: (sessionId: string, collaboratorId: string) => Promise<boolean>;
    createTask: (sessionId: string, title: string, description: string, options?: any) => Promise<any | null>;
    updateTask: (sessionId: string, taskId: string, updates: any) => Promise<any | null>;
    getReadyTasks: (sessionId: string) => Promise<any[]>;
    getTaskGraph: (sessionId: string) => Promise<any>;
    sendMessage: (sessionId: string, from: string, type: string, content: string, options?: any) => Promise<any | null>;
    getMessages: (sessionId: string, options?: any) => Promise<any[]>;
    proposeConsensus: (sessionId: string, taskId: string, proposedBy: string, content: any) => Promise<any | null>;
    voteProposal: (proposalId: string, collaboratorId: string, vote: string) => Promise<any | null>;
    synthesize: (sessionId: string) => Promise<any>;
    getStats: () => Promise<any>;
    getSessionStats: (sessionId: string) => Promise<any | null>;
  };

  // Conversation Memory Engine
  conversationMemory: {
    processSegment: (segment: any) => Promise<any[]>;
    query: (query?: any) => Promise<any[]>;
    getRelevant: (query: string, limit?: number) => Promise<any[]>;
    getMemory: (id: string) => Promise<any | null>;
    updateMemory: (id: string, updates: any) => Promise<boolean>;
    deleteMemory: (id: string) => Promise<boolean>;
    getTopics: (sessionId?: string, limit?: number) => Promise<any[]>;
    generateSummary: (sessionId: string, segments: any[], level?: string) => Promise<any | null>;
    getSummary: (sessionId: string) => Promise<any | null>;
    linkRelated: () => Promise<number>;
    prune: (keepCount?: number) => Promise<number>;
    getStats: () => Promise<any>;
  };

  // Tool Registry
  toolRegistry: {
    register: (tool: any) => Promise<any | null>;
    unregister: (id: string) => Promise<boolean>;
    get: (id: string) => Promise<any | null>;
    findByName: (name: string) => Promise<any | null>;
    search: (query?: any) => Promise<any[]>;
    getByCategory: (category: string) => Promise<any[]>;
    getAvailable: () => Promise<any[]>;
    getCategories: () => Promise<any[]>;
    validateParams: (toolId: string, params: any) => Promise<any>;
    recordUsage: (record: any) => Promise<void>;
    getAnalytics: (toolId: string) => Promise<any | null>;
    getTop: (limit?: number) => Promise<any[]>;
    getRecommendations: (context: any) => Promise<any[]>;
    getStats: () => Promise<any>;
  };

  // Health Monitor
  healthMonitor: {
    getStatus: () => Promise<any>;
    getSnapshot: () => Promise<any | null>;
    check: () => Promise<any | null>;
    registerService: (name: string, options?: any) => Promise<any | null>;
    updateService: (name: string, status: string, options?: any) => Promise<boolean>;
    getService: (name: string) => Promise<any | null>;
    getIssues: () => Promise<any[]>;
    getTrends: (periodHours?: number) => Promise<any>;
    getStats: () => Promise<any>;
    start: () => Promise<{ success: boolean }>;
    stop: () => Promise<{ success: boolean }>;
  };

  // WebSocket Manager
  websocket: {
    connect: (connectionId: string) => Promise<any>;
    disconnect: (connectionId: string) => Promise<boolean>;
    subscribe: (connectionId: string, channel: string) => Promise<boolean>;
    unsubscribe: (connectionId: string, channel: string) => Promise<boolean>;
    broadcast: (channel: string, type: string, payload: any) => Promise<any | null>;
    getHistory: (channel: string, limit?: number) => Promise<any[]>;
    getChannels: () => Promise<any[]>;
    getStats: () => Promise<any>;
    start: () => Promise<void>;
    stop: () => Promise<void>;
    onMessage: (callback: (message: any) => void) => () => void;
  };

  // Tray Badge Notifications
  trayBadge: {
    getState: () => Promise<any>;
    setUnread: (count: number) => Promise<void>;
    clearUnread: () => Promise<void>;
    addAlert: (severity: string, message?: string) => Promise<void>;
    clearAlerts: () => Promise<void>;
    onCategory: (name: string, count: number, priority?: string, lastEvent?: string) => Promise<void>;
    getConfig: () => Promise<any>;
    updateConfig: (updates: any) => Promise<void>;
    reset: () => Promise<void>;
  };

  // Backup Service
  backup: {
    create: (name?: string, description?: string, tags?: string[]) => Promise<any>;
    restore: (options: any) => Promise<any>;
    delete: (id: string) => Promise<boolean>;
    get: (id: string) => Promise<any | undefined>;
    list: () => Promise<any[]>;
    startAuto: () => Promise<void>;
    stopAuto: () => Promise<void>;
    isAutoRunning: () => Promise<boolean>;
    getConfig: () => Promise<any>;
    updateConfig: (updates: any) => Promise<void>;
    getStats: () => Promise<any>;
    export: (id: string) => Promise<any>;
    import: (data: string) => Promise<any>;
  };

  // Session Export Service
  sessionExport: {
    export: (sessionId: string, options: any) => Promise<any>;
    batchExport: (sessionIds: string[], options: any) => Promise<any>;
    getTemplates: () => Promise<any[]>;
    listExports: () => Promise<any[]>;
    deleteExport: (fileName: string) => Promise<boolean>;
  };

  // Charts Data Pipeline
  charts: {
    getDashboardData: () => Promise<any>;
    getSessionActivity: (days?: number) => Promise<any[]>;
    getMessageVolume: (days?: number) => Promise<any[]>;
    getModelUsage: () => Promise<any[]>;
    getToolUsage: () => Promise<any[]>;
    getHealthHistory: (days?: number) => Promise<any[]>;
    getPerformanceMetrics: () => Promise<any>;
    invalidateCache: () => Promise<{ success: boolean }>;
  };

  // State Sync Service
  stateSync: {
    subscribe: (slices: string[]) => Promise<any>;
    unsubscribe: (id: string) => Promise<void>;
    getState: (slice: string) => Promise<any>;
    getAllStates: () => Promise<Record<string, any>>;
    getStats: () => Promise<any>;
    onStateUpdate: (callback: (update: any) => void) => () => void;
  };

  // Plugin SDK Validator
  pluginSdk: {
    validateManifest: (manifest: any) => Promise<{ valid: boolean; errors: any[]; warnings: any[] }>;
    generateScaffold: (manifest: any, options?: any) => Promise<any>;
    getStats: () => Promise<any>;
  };

  // Marketplace Service
  marketplace: {
    getAllItems: (filter?: any) => Promise<any[]>;
    getItem: (id: string) => Promise<any | null>;
    getStats: () => Promise<any>;
    installItem: (id: string) => Promise<any>;
    uninstallItem: (id: string) => Promise<any>;
    updateItem: (id: string) => Promise<any>;
    getCategories: () => Promise<string[]>;
    getTags: () => Promise<string[]>;
    onInstallEvent: (callback: (data: any) => void) => () => void;
  };

  // Agent Context Manager
  agentContext: {
    createSession: (name: string, options?: any) => Promise<any>;
    getSession: (id: string) => Promise<any | null>;
    getAllSessions: () => Promise<any[]>;
    deleteSession: (id: string) => Promise<boolean>;
    renameSession: (id: string, newName: string) => Promise<boolean>;
    addMessage: (sessionId: string, message: any) => Promise<any | null>;
    deleteMessage: (sessionId: string, messageId: string) => Promise<boolean>;
    getMessages: (sessionId: string, options?: any) => Promise<any[]>;
    compressSession: (sessionId: string) => Promise<any | null>;
    getSummary: (sessionId: string) => Promise<any | null>;
    inheritContext: (fromSessionId: string, toSessionId: string, options: any) => Promise<boolean>;
    getInheritances: (sessionId: string) => Promise<any[]>;
    updateSystemPrompt: (sessionId: string, systemPrompt: string) => Promise<boolean>;
    buildContextForLLM: (sessionId: string) => Promise<any | null>;
    getStats: () => Promise<any>;
  };
}

// ============================================================
// API Implementation
// ============================================================

const electronAPI: ElectronAPI = {
  // Service management
  services: {
    getStatus: () => ipcRenderer.invoke("services:get-status"),
    restart: () => ipcRenderer.invoke("services:restart"),
    onLog: (callback) => {
      const handler = (_event: any, data: any) => callback(data);
      ipcRenderer.on("service:log", handler);
      return () => ipcRenderer.removeListener("service:log", handler);
    },
    onReady: (callback) => {
      const handler = (_event: any, name: string) => callback(name);
      ipcRenderer.on("service:ready", handler);
      return () => ipcRenderer.removeListener("service:ready", handler);
    },
  },

  // Desktop notifications
  notifications: {
    send: (options) => ipcRenderer.invoke("notifications:send", options),
    isSupported: () => ipcRenderer.invoke("notifications:is-supported"),
  },

  // File operations
  files: {
    onDrop: (callback) => {
      const handler = (_event: any, files: DroppedFile[], errors: Array<{ path: string; error: string }>) =>
        callback(files, errors);
      ipcRenderer.on("files:dropped", handler);
      return () => ipcRenderer.removeListener("files:dropped", handler);
    },
    readAsBase64: (filePath) => ipcRenderer.invoke("files:read-base64", filePath),
    copyToThreadUpload: (filePath, threadId) =>
      ipcRenderer.invoke("files:copy-to-upload", filePath, threadId),
  },

  // Configuration management
  config: {
    read: (filename) => ipcRenderer.invoke("config:read", filename),
    write: (filename, content) =>
      ipcRenderer.invoke("config:write", filename, content),
    getModels: () => ipcRenderer.invoke("config:get-models"),
    getEnvVars: () => ipcRenderer.invoke("config:get-env-vars"),
    setEnvVar: (key, value) =>
      ipcRenderer.invoke("config:set-env-var", key, value),
    getSummary: () => ipcRenderer.invoke("config:get-summary"),
    addModel: (model) => ipcRenderer.invoke("config:add-model", model),
    removeModel: (name) => ipcRenderer.invoke("config:remove-model", name),
  },

  // Dialog
  dialog: {
    openFolder: () => ipcRenderer.invoke("dialog:open-folder"),
    openFile: (filters) => ipcRenderer.invoke("dialog:open-file", filters),
  },

  // Shell
  shell: {
    openExternal: (url) => ipcRenderer.invoke("shell:open-external", url),
    openPath: (p) => ipcRenderer.invoke("shell:open-path", p),
  },

  // App info
  app: {
    getVersion: () => ipcRenderer.invoke("app:get-version"),
    getProjectRoot: () => ipcRenderer.invoke("app:get-project-root"),
    getPlatform: () => ipcRenderer.invoke("app:get-platform"),
    getConfig: () => ipcRenderer.invoke("app:get-config"),
    getStartupMetrics: () => ipcRenderer.invoke("app:get-startup-metrics"),
    isElectron: true,
  },

  // Telemetry
  telemetry: {
    getConfig: () => ipcRenderer.invoke("telemetry:get-config"),
    enable: () => ipcRenderer.invoke("telemetry:enable"),
    disable: () => ipcRenderer.invoke("telemetry:disable"),
    track: (eventName, properties) => ipcRenderer.invoke("telemetry:track", eventName, properties),
  },

  // Auto updater
  updater: {
    check: () => ipcRenderer.invoke("updater:check"),
    getStatus: () => ipcRenderer.invoke("updater:status"),
    install: () => ipcRenderer.invoke("updater:install"),
  },

  // Navigation
  navigation: {
    onNavigate: (callback) => {
      const handler = (_event: any, route: string) => callback(route);
      ipcRenderer.on("navigate", handler);
      return () => ipcRenderer.removeListener("navigate", handler);
    },
  },

  // Onboarding
  onboarding: {
    complete: () => ipcRenderer.invoke("onboarding:complete"),
    navigate: (stepIndex) => ipcRenderer.invoke("onboarding:navigate", stepIndex),
    saveModel: (data) => ipcRenderer.invoke("onboarding:save-model", data),
  },

  // Diagnostics
  diagnostics: {
    run: () => ipcRenderer.invoke("diagnostics:run"),
    exportReport: (report) => ipcRenderer.invoke("diagnostics:export-report", report),
    exportLogs: () => ipcRenderer.invoke("diagnostics:export-logs"),
  },

  // Shortcuts
  shortcuts: {
    getAll: () => ipcRenderer.invoke("shortcuts:get-all"),
    set: (action, accelerator) => ipcRenderer.invoke("shortcuts:set", action, accelerator),
    reset: (action) => ipcRenderer.invoke("shortcuts:reset", action),
    resetAll: () => ipcRenderer.invoke("shortcuts:reset-all"),
  },

  // User Settings persistence
  settings: {
    read: () => ipcRenderer.invoke("settings:read"),
    write: (data) => ipcRenderer.invoke("settings:write", data),
  },

  // Theme
  theme: {
    get: () => ipcRenderer.invoke("theme:get"),
    set: (mode) => ipcRenderer.invoke("theme:set", mode),
    toggle: () => ipcRenderer.invoke("theme:toggle"),
    onChange: (callback) => {
      const handler = (_event: any, theme: string) => callback(theme);
      ipcRenderer.on("theme-changed", handler);
      return () => ipcRenderer.removeListener("theme-changed", handler);
    },
  },

  // MCP Manager
  mcp: {
    getServers: () => ipcRenderer.invoke("mcp:get-servers"),
    getTools: () => ipcRenderer.invoke("mcp:get-tools"),
    getTool: (name) => ipcRenderer.invoke("mcp:get-tool", name),
    executeTool: (toolName, args) => ipcRenderer.invoke("mcp:execute-tool", toolName, args),
    validateArgs: (toolName, args) => ipcRenderer.invoke("mcp:validate-args", toolName, args),
    addServer: (config) => ipcRenderer.invoke("mcp:add-server", config),
    removeServer: (name) => ipcRenderer.invoke("mcp:remove-server", name),
    setServerEnabled: (name, enabled) => ipcRenderer.invoke("mcp:set-server-enabled", name, enabled),
    searchTools: (query) => ipcRenderer.invoke("mcp:search-tools", query),
    saveConfig: () => ipcRenderer.invoke("mcp:save-config"),
  },

  // Agent Session Manager
  session: {
    create: (options) => ipcRenderer.invoke("session:create", options),
    get: (id) => ipcRenderer.invoke("session:get", id),
    list: (filter) => ipcRenderer.invoke("session:list", filter),
    start: (id) => ipcRenderer.invoke("session:start", id),
    pause: (id) => ipcRenderer.invoke("session:pause", id),
    resume: (id) => ipcRenderer.invoke("session:resume", id),
    complete: (id) => ipcRenderer.invoke("session:complete", id),
    cancel: (id) => ipcRenderer.invoke("session:cancel", id),
    delete: (id) => ipcRenderer.invoke("session:delete", id),
    addMessage: (sessionId, message) => ipcRenderer.invoke("session:add-message", sessionId, message),
    getMessages: (sessionId, options) => ipcRenderer.invoke("session:get-messages", sessionId, options),
    updateTitle: (id, title) => ipcRenderer.invoke("session:update-title", id, title),
    updateMetadata: (id, metadata) => ipcRenderer.invoke("session:update-metadata", id, metadata),
    search: (query) => ipcRenderer.invoke("session:search", query),
    getStats: () => ipcRenderer.invoke("session:get-stats"),
    export: (id) => ipcRenderer.invoke("session:export", id),
    import: (data) => ipcRenderer.invoke("session:import", data),
    archiveOld: (days) => ipcRenderer.invoke("session:archive-old", days),
  },

  // Workflow Orchestrator
  workflow: {
    create: (definition) => ipcRenderer.invoke("workflow:create", definition),
    get: (id) => ipcRenderer.invoke("workflow:get", id),
    list: () => ipcRenderer.invoke("workflow:list"),
    update: (id, updates) => ipcRenderer.invoke("workflow:update", id, updates),
    delete: (id) => ipcRenderer.invoke("workflow:delete", id),
    validate: (definition) => ipcRenderer.invoke("workflow:validate", definition),
    execute: (workflowId, vars) => ipcRenderer.invoke("workflow:execute", workflowId, vars),
    getExecution: (id) => ipcRenderer.invoke("workflow:get-execution", id),
    listExecutions: (workflowId) => ipcRenderer.invoke("workflow:list-executions", workflowId),
    pause: (id) => ipcRenderer.invoke("workflow:pause", id),
    resume: (id) => ipcRenderer.invoke("workflow:resume", id),
    cancel: (id) => ipcRenderer.invoke("workflow:cancel", id),
    provideInput: (executionId, nodeId, value) => ipcRenderer.invoke("workflow:provide-input", executionId, nodeId, value),
    getTemplates: () => ipcRenderer.invoke("workflow:get-templates"),
    createFromTemplate: (templateId, overrides) => ipcRenderer.invoke("workflow:create-from-template", templateId, overrides),
  },

  // Context Manager
  context: {
    build: (messages, options) => ipcRenderer.invoke("context:build", messages, options),
    countTokens: (messages) => ipcRenderer.invoke("context:count-tokens", messages),
    isOverBudget: (messages, budget) => ipcRenderer.invoke("context:is-over-budget", messages, budget),
    createSnapshot: (sessionId, messages, metadata) => ipcRenderer.invoke("context:create-snapshot", sessionId, messages, metadata),
    getSnapshot: (id) => ipcRenderer.invoke("context:get-snapshot", id),
    listSnapshots: (sessionId) => ipcRenderer.invoke("context:list-snapshots", sessionId),
    restoreSnapshot: (id) => ipcRenderer.invoke("context:restore-snapshot", id),
    deleteSnapshot: (id) => ipcRenderer.invoke("context:delete-snapshot", id),
    storeMemory: (content, options) => ipcRenderer.invoke("context:store-memory", content, options),
    retrieveMemories: (query) => ipcRenderer.invoke("context:retrieve-memories", query),
    getMemory: (id) => ipcRenderer.invoke("context:get-memory", id),
    updateMemory: (id, updates) => ipcRenderer.invoke("context:update-memory", id, updates),
    deleteMemory: (id) => ipcRenderer.invoke("context:delete-memory", id),
    extractMemories: (messages, sessionId) => ipcRenderer.invoke("context:extract-memories", messages, sessionId),
    getMemoryStats: () => ipcRenderer.invoke("context:get-memory-stats"),
    getConfig: () => ipcRenderer.invoke("context:get-config"),
    updateConfig: (updates) => ipcRenderer.invoke("context:update-config", updates),
  },

  // Skill Manager
  skill: {
    getAll: () => ipcRenderer.invoke("skill:get-all"),
    get: (id) => ipcRenderer.invoke("skill:get", id),
    getEnabled: () => ipcRenderer.invoke("skill:get-enabled"),
    search: (query) => ipcRenderer.invoke("skill:search", query),
    enable: (id) => ipcRenderer.invoke("skill:enable", id),
    disable: (id) => ipcRenderer.invoke("skill:disable", id),
    install: (options) => ipcRenderer.invoke("skill:install", options),
    uninstall: (id) => ipcRenderer.invoke("skill:uninstall", id),
    updateConfig: (id, config) => ipcRenderer.invoke("skill:update-config", id, config),
    getStats: () => ipcRenderer.invoke("skill:get-stats"),
    discover: () => ipcRenderer.invoke("skill:discover"),
    execute: (id, inputs) => ipcRenderer.invoke("skill:execute", id, inputs),
    validateManifest: (manifest) => ipcRenderer.invoke("skill:validate-manifest", manifest),
  },

  // Event Bus
  eventBus: {
    publish: (channel, type, payload, options) => ipcRenderer.invoke("eventbus:publish", channel, type, payload, options),
    request: (channel, type, payload, options) => ipcRenderer.invoke("eventbus:request", channel, type, payload, options),
    getHistory: (channel) => ipcRenderer.invoke("eventbus:get-history", channel),
    queryHistory: (query) => ipcRenderer.invoke("eventbus:query-history", query),
    getMetrics: () => ipcRenderer.invoke("eventbus:get-metrics"),
    clearHistory: (channel) => ipcRenderer.invoke("eventbus:clear-history", channel),
  },

  // Performance Monitor
  perf: {
    getSnapshot: () => ipcRenderer.invoke("perf:get-snapshot"),
    getReport: (periodHours) => ipcRenderer.invoke("perf:get-report", periodHours),
    getAlerts: (options) => ipcRenderer.invoke("perf:get-alerts", options),
    acknowledgeAlert: (alertId) => ipcRenderer.invoke("perf:acknowledge-alert", alertId),
    getMetrics: () => ipcRenderer.invoke("perf:get-metrics"),
    saveMetrics: () => ipcRenderer.invoke("perf:save-metrics"),
    loadMetrics: () => ipcRenderer.invoke("perf:load-metrics"),
  },

  // Agent Reasoning Engine
  reasoning: {
    startTrace: (sessionId, goal, strategy) => ipcRenderer.invoke("reasoning:start-trace", sessionId, goal, strategy),
    getTrace: (id) => ipcRenderer.invoke("reasoning:get-trace", id),
    listTraces: (filter) => ipcRenderer.invoke("reasoning:list-traces", filter),
    addStep: (traceId, step) => ipcRenderer.invoke("reasoning:add-step", traceId, step),
    addThought: (traceId, content, confidence) => ipcRenderer.invoke("reasoning:add-thought", traceId, content, confidence),
    addAction: (traceId, content, toolName, toolArgs) => ipcRenderer.invoke("reasoning:add-action", traceId, content, toolName, toolArgs),
    addObservation: (traceId, content, toolResult) => ipcRenderer.invoke("reasoning:add-observation", traceId, content, toolResult),
    completeTrace: (traceId, finalAnswer) => ipcRenderer.invoke("reasoning:complete-trace", traceId, finalAnswer),
    failTrace: (traceId, error) => ipcRenderer.invoke("reasoning:fail-trace", traceId, error),
    pauseTrace: (traceId) => ipcRenderer.invoke("reasoning:pause-trace", traceId),
    resumeTrace: (traceId) => ipcRenderer.invoke("reasoning:resume-trace", traceId),
    getStats: () => ipcRenderer.invoke("reasoning:get-stats"),
    getConfig: () => ipcRenderer.invoke("reasoning:get-config"),
    updateConfig: (updates) => ipcRenderer.invoke("reasoning:update-config", updates),
    exportTrace: (id) => ipcRenderer.invoke("reasoning:export-trace", id),
    importTrace: (data) => ipcRenderer.invoke("reasoning:import-trace", data),
  },

  // Knowledge Graph
  knowledgeGraph: {
    addEntity: (entity) => ipcRenderer.invoke("kg:add-entity", entity),
    getEntity: (id) => ipcRenderer.invoke("kg:get-entity", id),
    searchEntities: (query) => ipcRenderer.invoke("kg:search-entities", query),
    updateEntity: (id, updates) => ipcRenderer.invoke("kg:update-entity", id, updates),
    deleteEntity: (id) => ipcRenderer.invoke("kg:delete-entity", id),
    addRelation: (relation) => ipcRenderer.invoke("kg:add-relation", relation),
    queryRelations: (query) => ipcRenderer.invoke("kg:query-relations", query),
    getNeighbors: (entityId) => ipcRenderer.invoke("kg:get-neighbors", entityId),
    findPaths: (sourceId, targetId, maxDepth) => ipcRenderer.invoke("kg:find-paths", sourceId, targetId, maxDepth),
    getSubgraph: (centerId, depth) => ipcRenderer.invoke("kg:get-subgraph", centerId, depth),
    getStats: () => ipcRenderer.invoke("kg:get-stats"),
    exportViz: () => ipcRenderer.invoke("kg:export-viz"),
    exportGraph: () => ipcRenderer.invoke("kg:export-graph"),
    importGraph: (graph) => ipcRenderer.invoke("kg:import-graph", graph),
  },

  // Task Scheduler
  scheduler: {
    createTask: (task) => ipcRenderer.invoke("scheduler:create-task", task),
    getTask: (id) => ipcRenderer.invoke("scheduler:get-task", id),
    listTasks: (filter) => ipcRenderer.invoke("scheduler:list-tasks", filter),
    updateTask: (id, updates) => ipcRenderer.invoke("scheduler:update-task", id, updates),
    deleteTask: (id) => ipcRenderer.invoke("scheduler:delete-task", id),
    enableTask: (id) => ipcRenderer.invoke("scheduler:enable-task", id),
    disableTask: (id) => ipcRenderer.invoke("scheduler:disable-task", id),
    runNow: (id) => ipcRenderer.invoke("scheduler:run-now", id),
    getHistory: (taskId) => ipcRenderer.invoke("scheduler:get-history", taskId),
    getStats: () => ipcRenderer.invoke("scheduler:get-stats"),
  },

  // Audit Logger
  audit: {
    log: (partial) => ipcRenderer.invoke("audit:log", partial),
    query: (query) => ipcRenderer.invoke("audit:query", query),
    getRecent: (limit, category) => ipcRenderer.invoke("audit:get-recent", limit, category),
    getStats: () => ipcRenderer.invoke("audit:get-stats"),
    exportJSON: (query) => ipcRenderer.invoke("audit:export-json", query),
    exportCSV: (query) => ipcRenderer.invoke("audit:export-csv", query),
    verifyIntegrity: () => ipcRenderer.invoke("audit:verify-integrity"),
  },

  // Agent Bridge
  bridge: {
    createThread: (model) => ipcRenderer.invoke("bridge:create-thread", model),
    getThread: (threadId) => ipcRenderer.invoke("bridge:get-thread", threadId),
    sendMessage: (threadId, content, options) => ipcRenderer.invoke("bridge:send-message", threadId, content, options),
    streamMessage: (threadId, content, options) => ipcRenderer.invoke("bridge:stream-message", threadId, content, options),
    cancelStream: (threadId) => ipcRenderer.invoke("bridge:cancel-stream", threadId),
    submitToolResult: (threadId, toolCallId, result, isError) => ipcRenderer.invoke("bridge:submit-tool-result", threadId, toolCallId, result, isError),
    isHealthy: () => ipcRenderer.invoke("bridge:is-healthy"),
    getModels: () => ipcRenderer.invoke("bridge:get-models"),
    onStreamEvent: (callback) => {
      const handler = (_event, threadId, event) => callback(threadId, event);
      ipcRenderer.on("bridge:stream-event", handler);
      return () => ipcRenderer.removeListener("bridge:stream-event", handler);
    },
  },

  // Security Manager
  security: {
    storeSecret: (name, value) => ipcRenderer.invoke("security:store-secret", name, value),
    retrieveSecret: (id) => ipcRenderer.invoke("security:retrieve-secret", id),
    retrieveSecretByName: (name) => ipcRenderer.invoke("security:retrieve-secret-by-name", name),
    deleteSecret: (id) => ipcRenderer.invoke("security:delete-secret", id),
    listSecrets: () => ipcRenderer.invoke("security:list-secrets"),
    checkPermission: (action, context) => ipcRenderer.invoke("security:check-permission", action, context),
    validateApiKey: (key, provider) => ipcRenderer.invoke("security:validate-api-key", key, provider),
    sanitizePath: (inputPath, allowedBaseDirs) => ipcRenderer.invoke("security:sanitize-path", inputPath, allowedBaseDirs),
  },

  // Plugin Manager
  plugin: {
    discover: () => ipcRenderer.invoke("plugin:discover"),
    load: (manifestPath) => ipcRenderer.invoke("plugin:load", manifestPath),
    get: (id) => ipcRenderer.invoke("plugin:get", id),
    list: (filter) => ipcRenderer.invoke("plugin:list", filter),
    enable: (id) => ipcRenderer.invoke("plugin:enable", id),
    disable: (id) => ipcRenderer.invoke("plugin:disable", id),
    uninstall: (id) => ipcRenderer.invoke("plugin:uninstall", id),
    getStats: () => ipcRenderer.invoke("plugin:get-stats"),
  },

  // Agent Collaboration Hub
  collaboration: {
    createSession: (title, goal, options) => ipcRenderer.invoke("collaboration:create-session", title, goal, options),
    getSession: (id) => ipcRenderer.invoke("collaboration:get-session", id),
    listSessions: (filter) => ipcRenderer.invoke("collaboration:list-sessions", filter),
    endSession: (id, finalResult) => ipcRenderer.invoke("collaboration:end-session", id, finalResult),
    deleteSession: (id) => ipcRenderer.invoke("collaboration:delete-session", id),
    addCollaborator: (sessionId, name, role, capabilities, model) => ipcRenderer.invoke("collaboration:add-collaborator", sessionId, name, role, capabilities, model),
    removeCollaborator: (sessionId, collaboratorId) => ipcRenderer.invoke("collaboration:remove-collaborator", sessionId, collaboratorId),
    createTask: (sessionId, title, description, options) => ipcRenderer.invoke("collaboration:create-task", sessionId, title, description, options),
    updateTask: (sessionId, taskId, updates) => ipcRenderer.invoke("collaboration:update-task", sessionId, taskId, updates),
    getReadyTasks: (sessionId) => ipcRenderer.invoke("collaboration:get-ready-tasks", sessionId),
    getTaskGraph: (sessionId) => ipcRenderer.invoke("collaboration:get-task-graph", sessionId),
    sendMessage: (sessionId, from, type, content, options) => ipcRenderer.invoke("collaboration:send-message", sessionId, from, type, content, options),
    getMessages: (sessionId, options) => ipcRenderer.invoke("collaboration:get-messages", sessionId, options),
    proposeConsensus: (sessionId, taskId, proposedBy, content) => ipcRenderer.invoke("collaboration:propose-consensus", sessionId, taskId, proposedBy, content),
    voteProposal: (proposalId, collaboratorId, vote) => ipcRenderer.invoke("collaboration:vote-proposal", proposalId, collaboratorId, vote),
    synthesize: (sessionId) => ipcRenderer.invoke("collaboration:synthesize", sessionId),
    getStats: () => ipcRenderer.invoke("collaboration:get-stats"),
    getSessionStats: (sessionId) => ipcRenderer.invoke("collaboration:get-session-stats", sessionId),
  },

  // Conversation Memory Engine
  conversationMemory: {
    processSegment: (segment) => ipcRenderer.invoke("memory:process-segment", segment),
    query: (query) => ipcRenderer.invoke("memory:query", query),
    getRelevant: (query, limit) => ipcRenderer.invoke("memory:get-relevant", query, limit),
    getMemory: (id) => ipcRenderer.invoke("memory:get-memory", id),
    updateMemory: (id, updates) => ipcRenderer.invoke("memory:update-memory", id, updates),
    deleteMemory: (id) => ipcRenderer.invoke("memory:delete-memory", id),
    getTopics: (sessionId, limit) => ipcRenderer.invoke("memory:get-topics", sessionId, limit),
    generateSummary: (sessionId, segments, level) => ipcRenderer.invoke("memory:generate-summary", sessionId, segments, level),
    getSummary: (sessionId) => ipcRenderer.invoke("memory:get-summary", sessionId),
    linkRelated: () => ipcRenderer.invoke("memory:link-related"),
    prune: (keepCount) => ipcRenderer.invoke("memory:prune", keepCount),
    getStats: () => ipcRenderer.invoke("memory:get-stats"),
  },

  // Tool Registry
  toolRegistry: {
    register: (tool) => ipcRenderer.invoke("tool:register", tool),
    unregister: (id) => ipcRenderer.invoke("tool:unregister", id),
    get: (id) => ipcRenderer.invoke("tool:get", id),
    findByName: (name) => ipcRenderer.invoke("tool:find-by-name", name),
    search: (query) => ipcRenderer.invoke("tool:search", query),
    getByCategory: (category) => ipcRenderer.invoke("tool:get-by-category", category),
    getAvailable: () => ipcRenderer.invoke("tool:get-available"),
    getCategories: () => ipcRenderer.invoke("tool:get-categories"),
    validateParams: (toolId, params) => ipcRenderer.invoke("tool:validate-params", toolId, params),
    recordUsage: (record) => ipcRenderer.invoke("tool:record-usage", record),
    getAnalytics: (toolId) => ipcRenderer.invoke("tool:get-analytics", toolId),
    getTop: (limit) => ipcRenderer.invoke("tool:get-top", limit),
    getRecommendations: (context) => ipcRenderer.invoke("tool:get-recommendations", context),
    getStats: () => ipcRenderer.invoke("tool:get-stats"),
  },

  // Health Monitor
  healthMonitor: {
    getStatus: () => ipcRenderer.invoke("health:get-status"),
    getSnapshot: () => ipcRenderer.invoke("health:get-snapshot"),
    check: () => ipcRenderer.invoke("health:check"),
    registerService: (name, options) => ipcRenderer.invoke("health:register-service", name, options),
    updateService: (name, status, options) => ipcRenderer.invoke("health:update-service", name, status, options),
    getService: (name) => ipcRenderer.invoke("health:get-service", name),
    getIssues: () => ipcRenderer.invoke("health:get-issues"),
    getTrends: (periodHours) => ipcRenderer.invoke("health:get-trends", periodHours),
    getStats: () => ipcRenderer.invoke("health:get-stats"),
    start: () => ipcRenderer.invoke("health:start"),
    stop: () => ipcRenderer.invoke("health:stop"),
  },

  // WebSocket Manager
  websocket: {
    connect: (connectionId) => ipcRenderer.invoke("ws:connect", connectionId),
    disconnect: (connectionId) => ipcRenderer.invoke("ws:disconnect", connectionId),
    subscribe: (connectionId, channel) => ipcRenderer.invoke("ws:subscribe", connectionId, channel),
    unsubscribe: (connectionId, channel) => ipcRenderer.invoke("ws:unsubscribe", connectionId, channel),
    broadcast: (channel, type, payload) => ipcRenderer.invoke("ws:broadcast", channel, type, payload),
    getHistory: (channel, limit) => ipcRenderer.invoke("ws:get-history", channel, limit),
    getChannels: () => ipcRenderer.invoke("ws:get-channels"),
    getStats: () => ipcRenderer.invoke("ws:get-stats"),
    start: () => ipcRenderer.invoke("ws:start"),
    stop: () => ipcRenderer.invoke("ws:stop"),
    onMessage: (callback) => {
      const handler = (_event, message) => callback(message);
      ipcRenderer.on("ws:message", handler);
      return () => ipcRenderer.removeListener("ws:message", handler);
    },
  },

  // Tray Badge Notifications
  trayBadge: {
    getState: () => ipcRenderer.invoke("tray:get-state"),
    setUnread: (count) => ipcRenderer.invoke("tray:set-unread", count),
    clearUnread: () => ipcRenderer.invoke("tray:clear-unread"),
    addAlert: (severity, message) => ipcRenderer.invoke("tray:add-alert", severity, message),
    clearAlerts: () => ipcRenderer.invoke("tray:clear-alerts"),
    onCategory: (name, count, priority, lastEvent) => ipcRenderer.invoke("tray:on-category", name, count, priority, lastEvent),
    getConfig: () => ipcRenderer.invoke("tray:get-config"),
    updateConfig: (updates) => ipcRenderer.invoke("tray:update-config", updates),
    reset: () => ipcRenderer.invoke("tray:reset"),
  },

  // Backup Service
  backup: {
    create: (name, description, tags) => ipcRenderer.invoke("backup:create", name, description, tags),
    restore: (options) => ipcRenderer.invoke("backup:restore", options),
    delete: (id) => ipcRenderer.invoke("backup:delete", id),
    get: (id) => ipcRenderer.invoke("backup:get", id),
    list: () => ipcRenderer.invoke("backup:list"),
    startAuto: () => ipcRenderer.invoke("backup:start-auto"),
    stopAuto: () => ipcRenderer.invoke("backup:stop-auto"),
    isAutoRunning: () => ipcRenderer.invoke("backup:is-auto-running"),
    getConfig: () => ipcRenderer.invoke("backup:get-config"),
    updateConfig: (updates) => ipcRenderer.invoke("backup:update-config", updates),
    getStats: () => ipcRenderer.invoke("backup:get-stats"),
    export: (id) => ipcRenderer.invoke("backup:export", id),
    import: (data) => ipcRenderer.invoke("backup:import", data),
  },

  // Session Export Service
  sessionExport: {
    export: (sessionId, options) => ipcRenderer.invoke("session:export-advanced", sessionId, options),
    batchExport: (sessionIds, options) => ipcRenderer.invoke("session:batch-export", sessionIds, options),
    getTemplates: () => ipcRenderer.invoke("session:get-export-templates"),
    listExports: () => ipcRenderer.invoke("session:list-exports"),
    deleteExport: (fileName) => ipcRenderer.invoke("session:delete-export", fileName),
  },

  // Charts Data Pipeline
  charts: {
    getDashboardData: () => ipcRenderer.invoke("charts:get-dashboard-data"),
    getSessionActivity: (days) => ipcRenderer.invoke("charts:get-session-activity", days),
    getMessageVolume: (days) => ipcRenderer.invoke("charts:get-message-volume", days),
    getModelUsage: () => ipcRenderer.invoke("charts:get-model-usage"),
    getToolUsage: () => ipcRenderer.invoke("charts:get-tool-usage"),
    getHealthHistory: (days) => ipcRenderer.invoke("charts:get-health-history", days),
    getPerformanceMetrics: () => ipcRenderer.invoke("charts:get-performance-metrics"),
    invalidateCache: () => ipcRenderer.invoke("charts:invalidate-cache"),
  },

  // State Sync Service
  stateSync: {
    subscribe: (slices) => ipcRenderer.invoke("sync:subscribe", slices),
    unsubscribe: (id) => ipcRenderer.invoke("sync:unsubscribe", id),
    getState: (slice) => ipcRenderer.invoke("sync:get-state", slice),
    getAllStates: () => ipcRenderer.invoke("sync:get-all-states"),
    getStats: () => ipcRenderer.invoke("sync:get-stats"),
    onStateUpdate: (callback) => {
      const handler = (_event, update) => callback(update);
      ipcRenderer.on("sync:state-update", handler);
      return () => ipcRenderer.removeListener("sync:state-update", handler);
    },
  },

  // Plugin SDK Validator
  pluginSdk: {
    validateManifest: (manifest) => ipcRenderer.invoke("sdk:validate-manifest", manifest),
    generateScaffold: (manifest, options) => ipcRenderer.invoke("sdk:generate-scaffold", manifest, options),
    getStats: () => ipcRenderer.invoke("sdk:get-stats"),
  },

  // Marketplace Service
  marketplace: {
    getAllItems: (filter?) => ipcRenderer.invoke("marketplace:get-all-items", filter),
    getItem: (id) => ipcRenderer.invoke("marketplace:get-item", id),
    getStats: () => ipcRenderer.invoke("marketplace:get-stats"),
    installItem: (id) => ipcRenderer.invoke("marketplace:install-item", id),
    uninstallItem: (id) => ipcRenderer.invoke("marketplace:uninstall-item", id),
    updateItem: (id) => ipcRenderer.invoke("marketplace:update-item", id),
    getCategories: () => ipcRenderer.invoke("marketplace:get-categories"),
    getTags: () => ipcRenderer.invoke("marketplace:get-tags"),
    onInstallEvent: (callback) => {
      const handler = (_event, data) => callback(data);
      ipcRenderer.on("marketplace:install-event", handler);
      return () => ipcRenderer.removeListener("marketplace:install-event", handler);
    },
  },

  // Agent Context Manager
  agentContext: {
    createSession: (name, options?) => ipcRenderer.invoke("agent-context:create-session", name, options),
    getSession: (id) => ipcRenderer.invoke("agent-context:get-session", id),
    getAllSessions: () => ipcRenderer.invoke("agent-context:get-all-sessions"),
    deleteSession: (id) => ipcRenderer.invoke("agent-context:delete-session", id),
    renameSession: (id, newName) => ipcRenderer.invoke("agent-context:rename-session", id, newName),
    addMessage: (sessionId, message) => ipcRenderer.invoke("agent-context:add-message", sessionId, message),
    deleteMessage: (sessionId, messageId) => ipcRenderer.invoke("agent-context:delete-message", sessionId, messageId),
    getMessages: (sessionId, options?) => ipcRenderer.invoke("agent-context:get-messages", sessionId, options),
    compressSession: (sessionId) => ipcRenderer.invoke("agent-context:compress-session", sessionId),
    getSummary: (sessionId) => ipcRenderer.invoke("agent-context:get-summary", sessionId),
    inheritContext: (fromSessionId, toSessionId, options) => ipcRenderer.invoke("agent-context:inherit-context", fromSessionId, toSessionId, options),
    getInheritances: (sessionId) => ipcRenderer.invoke("agent-context:get-inheritances", sessionId),
    updateSystemPrompt: (sessionId, systemPrompt) => ipcRenderer.invoke("agent-context:update-system-prompt", sessionId, systemPrompt),
    buildContextForLLM: (sessionId) => ipcRenderer.invoke("agent-context:build-context-for-llm", sessionId),
    getStats: () => ipcRenderer.invoke("agent-context:get-stats"),
  },
};

// Expose the API to the renderer
contextBridge.exposeInMainWorld("electronAPI", electronAPI);

// Type declaration for the global scope
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
