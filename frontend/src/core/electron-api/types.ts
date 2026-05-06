/**
 * DeerFlow Electron API Type Definitions
 *
 * TypeScript interfaces for all window.electronAPI namespaces.
 * Enables type-safe access to backend modules from the frontend.
 * Synced with electron/src/preload.ts
 */

// ============================================================
// Service Management
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

// ============================================================
// Health Monitor
// ============================================================

export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown" | "recovering";

export interface ServiceHealth {
  name: string;
  status: HealthStatus;
  responseTimeMs: number;
  lastCheck: string;
  errorCount: number;
  consecutiveFailures: number;
  dependencyOf: string[];
  dependencies: string[];
}

export interface ResourceMetrics {
  cpuPercent: number;
  memoryRssMB: number;
  memoryPercent: number;
  diskPercent: number;
  timestamp: string;
}

export interface HealthIssue {
  id: string;
  severity: "critical" | "warning" | "info";
  service?: string;
  resource?: string;
  message: string;
  recommendation: string;
  detectedAt: string;
  resolvedAt?: string;
}

export interface HealthSnapshot {
  timestamp: string;
  overallStatus: HealthStatus;
  score: number;
  services: ServiceHealth[];
  resources: ResourceMetrics;
  issues: HealthIssue[];
  recommendations: string[];
}

export interface HealthTrend {
  periodHours: number;
  snapshots: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  statusDistribution: Record<string, number>;
}

export interface HealthStats {
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  unhealthyServices: number;
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  averageScore: number;
}

// ============================================================
// Agent Reasoning
// ============================================================

export type ReasoningStrategy = "direct" | "cot" | "react" | "tot" | "reflection";
export type ReasoningStepType = "thought" | "action" | "observation" | "plan" | "reflection" | "conclusion";
export type TraceStatus = "active" | "completed" | "failed" | "paused";

export interface ReasoningStep {
  id: string;
  type: ReasoningStepType;
  content: string;
  timestamp: string;
  confidence: number;
  metadata?: {
    toolName?: string;
    toolArgs?: Record<string, unknown>;
    toolResult?: unknown;
    durationMs?: number;
    tokenCount?: number;
  };
}

export interface ReasoningTrace {
  id: string;
  sessionId: string;
  strategy: ReasoningStrategy;
  goal: string;
  steps: ReasoningStep[];
  status: TraceStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  totalSteps: number;
  finalAnswer?: string;
  metrics: {
    totalThoughts: number;
    totalActions: number;
    totalObservations: number;
    averageConfidence: number;
    totalDurationMs: number;
  };
}

export interface ReasoningStats {
  totalTraces: number;
  activeTraces: number;
  completedTraces: number;
  failedTraces: number;
  strategyBreakdown: Record<string, number>;
  averageSteps: number;
  averageConfidence: number;
}

// ============================================================
// Knowledge Graph
// ============================================================

export interface KnowledgeEntity {
  id: string;
  name: string;
  type: string;
  aliases: string[];
  description?: string;
  properties: Record<string, unknown>;
  source?: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  lastAccessed: string;
}

export interface KnowledgeRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  properties: Record<string, unknown>;
  confidence: number;
  createdAt: string;
  updatedAt: string;
  source?: string;
}

export interface GraphStats {
  totalEntities: number;
  totalRelations: number;
  entityTypes: Record<string, number>;
  relationTypes: Record<string, number>;
  mostConnected: Array<{ entityId: string; name: string; count: number }>;
  orphanedEntities: number;
  averageConfidence: number;
}

export interface VizNode {
  data: {
    id: string;
    label: string;
    type: string;
    confidence: number;
  };
}

export interface VizEdge {
  data: {
    id: string;
    source: string;
    target: string;
    label: string;
  };
}

export interface VizGraph {
  nodes: VizNode[];
  edges: VizEdge[];
}

// ============================================================
// Agent Collaboration
// ============================================================

export type AgentRole = "coordinator" | "researcher" | "critic" | "executor" | "synthesizer" | "specialist";
export type CollaborationStatus = "forming" | "active" | "consensus" | "conflict" | "completed" | "failed";
export type TaskStatus = "pending" | "ready" | "running" | "completed" | "failed" | "blocked";

export interface Collaborator {
  id: string;
  name: string;
  role: AgentRole;
  capabilities: string[];
  model?: string;
  status: "idle" | "working" | "waiting" | "error";
  currentTaskId?: string;
  workload: number;
}

export interface CollaborationTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo?: string;
  dependencies: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: unknown;
  error?: string;
}

export interface AgentMessage {
  id: string;
  from: string;
  to?: string;
  type: "broadcast" | "direct" | "system";
  content: string;
  timestamp: string;
  taskId?: string;
}

export interface CollaborationSession {
  id: string;
  title: string;
  goal: string;
  status: CollaborationStatus;
  collaborators: Collaborator[];
  tasks: CollaborationTask[];
  messages: AgentMessage[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  finalResult?: unknown;
}

export interface TaskGraph {
  nodes: Array<{ id: string; label: string; status: TaskStatus }>;
  edges: Array<{ source: string; target: string }>;
}

export interface CollaborationStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  totalCollaborators: number;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  roleDistribution: Record<string, number>;
}

// ============================================================
// Task Scheduler
// ============================================================

export type ScheduleType = "once" | "interval" | "cron";
export type ScheduledTaskCategory = "workflow" | "session" | "skill" | "system" | "backup" | "cleanup";
export type ScheduledTaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled" | "skipped";

export interface ScheduledTask {
  id: string;
  title: string;
  description?: string;
  category: ScheduledTaskCategory;
  scheduleType: ScheduleType;
  scheduleConfig: {
    delayMs?: number;
    intervalMs?: number;
    cronExpression?: string;
  };
  enabled: boolean;
  target: {
    type: string;
    id?: string;
    params?: Record<string, unknown>;
  };
  options: {
    timeoutMs: number;
    maxRetries: number;
    skipIfRunning: boolean;
  };
  nextRun?: string;
  lastRun?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  status: ScheduledTaskStatus;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
  result?: unknown;
  retryCount: number;
}

export interface SchedulerStats {
  totalTasks: number;
  enabledTasks: number;
  disabledTasks: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  executionsToday: number;
}

// ============================================================
// Tool Registry
// ============================================================

export type ToolCategory = "web" | "file" | "data" | "code" | "communication" | "search" | "analysis" | "media" | "system" | "custom";
export type ToolStatus = "available" | "deprecated" | "experimental" | "disabled";

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required: boolean;
  enum?: unknown[];
  min?: number;
  max?: number;
  pattern?: string;
  default?: unknown;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  parameters: ToolParameter[];
  examples?: string[];
  permissions?: string[];
  status: ToolStatus;
  source: "builtin" | "mcp" | "skill" | "plugin" | "custom";
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface ToolAnalytics {
  toolId: string;
  toolName: string;
  totalCalls: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  averageDurationMs: number;
  lastUsed: string;
  errorsByType: Record<string, number>;
}

export interface ToolRecommendation {
  toolId: string;
  toolName: string;
  score: number;
  reason: string;
}

export interface ToolRegistryStats {
  totalTools: number;
  availableTools: number;
  deprecatedTools: number;
  experimentalTools: number;
  disabledTools: number;
  categoryBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
}

// ============================================================
// Conversation Memory
// ============================================================

export type MemoryType = "fact" | "preference" | "relationship" | "event" | "concept";

export interface MemoryEntry {
  id: string;
  type: MemoryType;
  content: string;
  confidence: number;
  importance: number;
  sessionId?: string;
  tags: string[];
  relatedMemoryIds: string[];
  sourceSegment?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessed: string;
  accessCount: number;
}

export interface ExtractedTopic {
  name: string;
  count: number;
  relatedTopics: string[];
}

export interface ConversationSummary {
  id: string;
  sessionId: string;
  level: "brief" | "detailed" | "comprehensive";
  content: string;
  keyPoints: string[];
  actionItems: string[];
  decisions: string[];
  createdAt: string;
}

export interface MemoryStats {
  totalMemories: number;
  byType: Record<string, number>;
  averageConfidence: number;
  averageImportance: number;
  totalTopics: number;
  totalSummaries: number;
}

// ============================================================
// Audit Logger
// ============================================================

export type AuditCategory = "security" | "data" | "system" | "user" | "session" | "workflow" | "mcp" | "skill" | "config";
export type AuditSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface AuditEvent {
  id: string;
  timestamp: string;
  category: AuditCategory;
  severity: AuditSeverity;
  action: string;
  actor: {
    type: string;
    id?: string;
    name?: string;
  };
  target?: {
    type: string;
    id?: string;
    name?: string;
  };
  result: "success" | "failure" | "denied";
  details?: Record<string, unknown>;
  hash: string;
  previousHash: string;
}

export interface AuditStats {
  totalEvents: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  byResult: Record<string, number>;
  byActorType: Record<string, number>;
  timeRange: {
    oldest: string;
    newest: string;
  };
}

// ============================================================
// Plugin Manager
// ============================================================

export type PluginStatus = "installed" | "enabled" | "disabled" | "error" | "incompatible";

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: string[];
  hooks: string[];
  dependencies: Record<string, string>;
}

export interface Plugin {
  id: string;
  manifest: PluginManifest;
  status: PluginStatus;
  path: string;
  enabledAt?: string;
  error?: string;
  hookCount: number;
}

export interface PluginStats {
  totalPlugins: number;
  enabledPlugins: number;
  disabledPlugins: number;
  errorPlugins: number;
  incompatiblePlugins: number;
  totalHooks: number;
}

// ============================================================
// Performance
// ============================================================

export interface PerformanceReport {
  id: string;
  generatedAt: string;
  period: { start: string; end: string };
  metrics: {
    session: { p50: number; p95: number; p99: number; avg: number; count: number };
    workflow: { p50: number; p95: number; p99: number; avg: number; count: number };
    mcp: { p50: number; p95: number; p99: number; avg: number; count: number };
    system: { p50: number; p95: number; p99: number; avg: number; count: number };
  };
  healthScore: number;
  trends: Array<{
    metric: string;
    direction: "up" | "down" | "stable";
    changePercent: number;
    period: string;
  }>;
  alerts: Array<{
    metric: string;
    threshold: number;
    current: number;
    severity: "critical" | "warning" | "info";
    message: string;
  }>;
  recommendations: string[];
}

// ============================================================
// Electron API Interface (synced with preload.ts)
// ============================================================

declare global {
  interface Window {
    electronAPI?: {
      // Service management
      services?: {
        getStatus: () => Promise<ServiceStatus[]>;
        restart: () => Promise<{ success: boolean; error?: string }>;
        onLog: (callback: (data: { name: string; stream: string; msg: string }) => void) => () => void;
        onReady: (callback: (name: string) => void) => () => void;
      };

      // Desktop notifications
      notifications?: {
        send: (options: NotificationOptions) => Promise<{ success: boolean; error?: string; id: string }>;
        isSupported: () => Promise<boolean>;
      };

      // File operations
      files?: {
        onDrop: (callback: (files: DroppedFile[], errors: Array<{ path: string; error: string }>) => void) => () => void;
        readAsBase64: (filePath: string) => Promise<{ success: boolean; data?: string; mimeType?: string; error?: string }>;
        copyToThreadUpload: (filePath: string, threadId: string) => Promise<{ success: boolean; destination?: string; error?: string }>;
      };

      // Configuration management
      config?: {
        read: (filename: "config" | "env" | "extensions") => Promise<{ success: boolean; content?: string; error?: string }>;
        write: (filename: "config" | "env" | "extensions", content: string) => Promise<{ success: boolean; error?: string }>;
        getModels: () => Promise<{ success: boolean; models?: Array<Record<string, unknown>>; error?: string }>;
        getEnvVars: () => Promise<{ success: boolean; vars?: Record<string, string>; error?: string }>;
        setEnvVar: (key: string, value: string) => Promise<{ success: boolean; error?: string }>;
        getSummary: () => Promise<{ hasModels: boolean; modelCount: number; hasEnvVars: boolean; envVarCount: number; models: Array<Record<string, unknown>> }>;
        addModel: (model: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
        removeModel: (name: string) => Promise<{ success: boolean; error?: string }>;
      };

      // Dialog
      dialog?: {
        openFolder: () => Promise<string | null>;
        openFile: (filters?: Array<{ name: string; extensions: string[] }>) => Promise<string[] | null>;
      };

      // Shell
      shell?: {
        openExternal: (url: string) => Promise<void>;
        openPath: (path: string) => Promise<void>;
      };

      // App info
      app?: {
        getVersion: () => Promise<string>;
        getProjectRoot: () => Promise<string>;
        getPlatform: () => Promise<string>;
        getConfig: () => Promise<{ proxyPort: number; langgraphPort: number; gatewayPort: number; frontendPort: number }>;
        getStartupMetrics: () => Promise<unknown>;
        isElectron: true;
        setConfig?: (key: string, value: string | Record<string, unknown>) => Promise<{ success: boolean }>;
      };

      // Telemetry
      telemetry?: {
        getConfig: () => Promise<{ enabled: boolean }>;
        enable: () => Promise<{ enabled: boolean }>;
        disable: () => Promise<{ enabled: boolean }>;
        track: (eventName: string, properties?: Record<string, unknown>) => Promise<{ success: boolean }>;
      };

      // Auto updater
      updater?: {
        check: () => Promise<unknown>;
        getStatus: () => Promise<unknown>;
        install: () => Promise<{ success: boolean }>;
      };

      // Navigation
      navigation?: {
        onNavigate: (callback: (route: string) => void) => () => void;
      };

      // Onboarding
      onboarding?: {
        complete: () => Promise<{ success: boolean }>;
        navigate: (stepIndex: number) => Promise<{ success: boolean }>;
        saveModel: (data: { provider: string; apiKey: string; modelName: string }) => Promise<{ success: boolean; error?: string }>;
      };

      // Diagnostics
      diagnostics?: {
        run: () => Promise<unknown>;
        exportReport: (report: unknown) => Promise<{ success: boolean; path?: string; error?: string }>;
        exportLogs: () => Promise<{ success: boolean; path?: string; error?: string }>;
      };

      // Shortcuts
      shortcuts?: {
        getAll: () => Promise<unknown[]>;
        set: (action: string, accelerator: string) => Promise<{ success: boolean; error?: string }>;
        reset: (action: string) => Promise<{ success: boolean; error?: string }>;
        resetAll: () => Promise<{ success: boolean }>;
      };

      // User Settings persistence
      settings?: {
        read: () => Promise<{ success: boolean; data?: Record<string, unknown> | null; error?: string }>;
        write: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
      };

      // Theme
      theme?: {
        get: () => Promise<{ mode: string; effective: string }>;
        set: (mode: "light" | "dark" | "auto") => Promise<{ mode: string; effective: string }>;
        toggle: () => Promise<{ effective: string }>;
        onChange: (callback: (theme: string) => void) => () => void;
      };

      // MCP Manager
      mcp?: {
        getServers: () => Promise<unknown[]>;
        getTools: () => Promise<unknown[]>;
        getTool: (name: string) => Promise<unknown | null>;
        executeTool: (toolName: string, args: Record<string, unknown>) => Promise<unknown>;
        validateArgs: (toolName: string, args: Record<string, unknown>) => Promise<{ valid: boolean; errors?: string[] }>;
        addServer: (config: unknown) => Promise<{ success: boolean; error?: string }>;
        removeServer: (name: string) => Promise<{ success: boolean; error?: string }>;
        setServerEnabled: (name: string, enabled: boolean) => Promise<{ success: boolean; error?: string }>;
        searchTools: (query: string) => Promise<unknown[]>;
        saveConfig: () => Promise<{ success: boolean; error?: string }>;
      };

      // Agent Session Manager
      session?: {
        create: (options?: unknown) => Promise<unknown>;
        get: (id: string) => Promise<unknown | null>;
        list: (filter?: unknown) => Promise<unknown[]>;
        start: (id: string) => Promise<{ success: boolean; error?: string }>;
        pause: (id: string) => Promise<{ success: boolean; error?: string }>;
        resume: (id: string) => Promise<{ success: boolean; error?: string }>;
        complete: (id: string) => Promise<{ success: boolean; error?: string }>;
        cancel: (id: string) => Promise<{ success: boolean; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
        addMessage: (sessionId: string, message: unknown) => Promise<unknown>;
        getMessages: (sessionId: string, options?: unknown) => Promise<{ messages: unknown[]; total: number }>;
        updateTitle: (id: string, title: string) => Promise<{ success: boolean; error?: string }>;
        updateMetadata: (id: string, metadata: unknown) => Promise<{ success: boolean; error?: string }>;
        search: (query: string) => Promise<unknown[]>;
        getStats: () => Promise<unknown>;
        export: (id: string) => Promise<unknown>;
        import: (data: unknown) => Promise<unknown>;
        archiveOld: (days?: number) => Promise<{ archived: number }>;
      };

      // Workflow Orchestrator
      workflow?: {
        create: (definition: unknown) => Promise<unknown>;
        get: (id: string) => Promise<unknown | null>;
        list: () => Promise<unknown[]>;
        update: (id: string, updates: unknown) => Promise<{ success: boolean; error?: string }>;
        delete: (id: string) => Promise<{ success: boolean; error?: string }>;
        validate: (definition: unknown) => Promise<{ valid: boolean; errors: string[] }>;
        execute: (workflowId: string, vars?: unknown) => Promise<unknown>;
        getExecution: (id: string) => Promise<unknown | null>;
        listExecutions: (workflowId?: string) => Promise<unknown[]>;
        pause: (id: string) => Promise<{ success: boolean; error?: string }>;
        resume: (id: string) => Promise<{ success: boolean; error?: string }>;
        cancel: (id: string) => Promise<{ success: boolean; error?: string }>;
        provideInput: (executionId: string, nodeId: string, value: unknown) => Promise<{ success: boolean; error?: string }>;
        getTemplates: () => Promise<unknown[]>;
        createFromTemplate: (templateId: string, overrides?: unknown) => Promise<unknown | null>;
      };

      // Context Manager
      context?: {
        build: (messages: unknown[], options?: unknown) => Promise<unknown>;
        countTokens: (messages: unknown[]) => Promise<unknown>;
        isOverBudget: (messages: unknown[], budget?: number) => Promise<boolean>;
        createSnapshot: (sessionId: string, messages: unknown[], metadata?: unknown) => Promise<unknown | null>;
        getSnapshot: (id: string) => Promise<unknown | null>;
        listSnapshots: (sessionId?: string) => Promise<unknown[]>;
        restoreSnapshot: (id: string) => Promise<unknown>;
        deleteSnapshot: (id: string) => Promise<{ success: boolean; error?: string }>;
        storeMemory: (content: string, options?: unknown) => Promise<unknown | null>;
        retrieveMemories: (query?: unknown) => Promise<unknown[]>;
        getMemory: (id: string) => Promise<unknown | null>;
        updateMemory: (id: string, updates: unknown) => Promise<{ success: boolean; error?: string }>;
        deleteMemory: (id: string) => Promise<{ success: boolean; error?: string }>;
        extractMemories: (messages: unknown[], sessionId?: string) => Promise<unknown[]>;
        getMemoryStats: () => Promise<unknown>;
        getConfig: () => Promise<unknown>;
        updateConfig: (updates: unknown) => Promise<{ success: boolean }>;
      };

      // Skill Manager
      skill?: {
        getAll: () => Promise<unknown[]>;
        get: (id: string) => Promise<unknown | null>;
        getEnabled: () => Promise<unknown[]>;
        search: (query: string) => Promise<unknown[]>;
        enable: (id: string) => Promise<{ success: boolean; error?: string }>;
        disable: (id: string) => Promise<{ success: boolean; error?: string }>;
        install: (options: unknown) => Promise<{ success: boolean; skill?: unknown; error?: string }>;
        uninstall: (id: string) => Promise<{ success: boolean; error?: string }>;
        updateConfig: (id: string, config: unknown) => Promise<{ success: boolean; error?: string }>;
        getStats: () => Promise<unknown>;
        discover: () => Promise<unknown[]>;
        execute: (id: string, inputs: unknown) => Promise<unknown>;
        validateManifest: (manifest: unknown) => Promise<{ valid: boolean; errors: string[]; warnings: string[] }>;
      };

      // Event Bus
      eventBus?: {
        publish: (channel: unknown, type: string, payload: unknown, options?: unknown) => Promise<unknown | null>;
        request: (channel: unknown, type: string, payload: unknown, options?: unknown) => Promise<unknown>;
        getHistory: (channel?: unknown) => Promise<unknown[]>;
        queryHistory: (query: unknown) => Promise<unknown[]>;
        getMetrics: () => Promise<unknown>;
        clearHistory: (channel?: unknown) => Promise<{ success: boolean }>;
      };

      // Performance Monitor
      perf?: {
        getSnapshot: () => Promise<unknown | null>;
        getReport: (periodHours?: number) => Promise<PerformanceReport | null>;
        getAlerts: (options?: unknown) => Promise<unknown[]>;
        acknowledgeAlert: (alertId: string) => Promise<boolean>;
        getMetrics: () => Promise<unknown | null>;
        saveMetrics: () => Promise<{ success: boolean; error?: string }>;
        loadMetrics: () => Promise<{ success: boolean; error?: string }>;
      };

      // Agent Reasoning Engine
      reasoning?: {
        startTrace: (sessionId: string, goal: string, strategy?: string) => Promise<unknown | null>;
        getTrace: (id: string) => Promise<ReasoningTrace | null>;
        listTraces: (filter?: unknown) => Promise<ReasoningTrace[]>;
        addStep: (traceId: string, step: unknown) => Promise<unknown | null>;
        addThought: (traceId: string, content: string, confidence?: number) => Promise<unknown | null>;
        addAction: (traceId: string, content: string, toolName: string, toolArgs: unknown) => Promise<unknown | null>;
        addObservation: (traceId: string, content: string, toolResult?: unknown) => Promise<unknown | null>;
        completeTrace: (traceId: string, finalAnswer: string) => Promise<unknown | null>;
        failTrace: (traceId: string, error: string) => Promise<unknown | null>;
        pauseTrace: (traceId: string) => Promise<unknown | null>;
        resumeTrace: (traceId: string) => Promise<unknown | null>;
        getStats: () => Promise<ReasoningStats>;
        getConfig: () => Promise<unknown>;
        updateConfig: (updates: unknown) => Promise<{ success: boolean }>;
        exportTrace: (id: string) => Promise<unknown>;
        importTrace: (data: unknown) => Promise<unknown>;
        deleteTrace: (id: string) => Promise<boolean>;
      };

      // Knowledge Graph
      knowledgeGraph?: {
        addEntity: (entity: unknown) => Promise<unknown | null>;
        getEntity: (id: string) => Promise<KnowledgeEntity | null>;
        searchEntities: (query: unknown) => Promise<KnowledgeEntity[]>;
        updateEntity: (id: string, updates: unknown) => Promise<boolean>;
        deleteEntity: (id: string) => Promise<boolean>;
        addRelation: (relation: unknown) => Promise<unknown | null>;
        queryRelations: (query: unknown) => Promise<KnowledgeRelation[]>;
        getNeighbors: (entityId: string) => Promise<unknown[]>;
        findPaths: (sourceId: string, targetId: string, maxDepth?: number) => Promise<unknown[]>;
        getSubgraph: (centerId: string, depth?: number) => Promise<unknown>;
        getStats: () => Promise<GraphStats>;
        exportViz: () => Promise<VizGraph>;
        exportGraph: () => Promise<unknown>;
        importGraph: (graph: unknown) => Promise<unknown>;
      };

      // Task Scheduler
      scheduler?: {
        createTask: (task: unknown) => Promise<unknown | null>;
        getTask: (id: string) => Promise<ScheduledTask | null>;
        listTasks: (filter?: unknown) => Promise<ScheduledTask[]>;
        updateTask: (id: string, updates: unknown) => Promise<unknown | null>;
        deleteTask: (id: string) => Promise<boolean>;
        enableTask: (id: string) => Promise<boolean>;
        disableTask: (id: string) => Promise<boolean>;
        runNow: (id: string) => Promise<unknown | null>;
        getHistory: (taskId?: string) => Promise<TaskExecution[]>;
        getStats: () => Promise<SchedulerStats>;
      };

      // Audit Logger
      audit?: {
        log: (partial: unknown) => Promise<unknown | null>;
        query: (query?: unknown) => Promise<AuditEvent[]>;
        getRecent: (limit?: number, category?: string) => Promise<AuditEvent[]>;
        getStats: () => Promise<AuditStats>;
        exportJSON: (query?: unknown) => Promise<unknown>;
        exportCSV: (query?: unknown) => Promise<unknown>;
        verifyIntegrity: () => Promise<unknown>;
      };

      // Agent Bridge
      bridge?: {
        createThread: (model?: string) => Promise<unknown | null>;
        getThread: (threadId: string) => Promise<unknown | null>;
        sendMessage: (threadId: string, content: string, options?: unknown) => Promise<unknown | null>;
        streamMessage: (threadId: string, content: string, options?: unknown) => Promise<unknown>;
        cancelStream: (threadId: string) => Promise<boolean>;
        submitToolResult: (threadId: string, toolCallId: string, result: string, isError?: boolean) => Promise<boolean>;
        isHealthy: () => Promise<boolean>;
        getModels: () => Promise<unknown[]>;
        onStreamEvent: (callback: (threadId: string, event: unknown) => void) => () => void;
      };

      // Security Manager
      security?: {
        storeSecret: (name: string, value: string) => Promise<unknown | null>;
        retrieveSecret: (id: string) => Promise<unknown>;
        retrieveSecretByName: (name: string) => Promise<unknown>;
        deleteSecret: (id: string) => Promise<boolean>;
        listSecrets: () => Promise<unknown[]>;
        checkPermission: (action: string, context: unknown) => Promise<unknown>;
        validateApiKey: (key: string, provider: string) => Promise<unknown>;
        sanitizePath: (inputPath: string, allowedBaseDirs: string[]) => Promise<unknown>;
      };

      // Plugin Manager
      plugin?: {
        discover: () => Promise<unknown[]>;
        load: (manifestPath: string) => Promise<unknown | null>;
        get: (id: string) => Promise<Plugin | null>;
        list: (filter?: unknown) => Promise<Plugin[]>;
        enable: (id: string) => Promise<unknown>;
        disable: (id: string) => Promise<boolean>;
        uninstall: (id: string) => Promise<unknown>;
        getStats: () => Promise<PluginStats>;
      };

      // Agent Collaboration Hub
      collaboration?: {
        createSession: (title: string, goal: string, options?: unknown) => Promise<CollaborationSession | null>;
        getSession: (id: string) => Promise<CollaborationSession | null>;
        listSessions: (filter?: unknown) => Promise<CollaborationSession[]>;
        endSession: (id: string, finalResult?: unknown) => Promise<unknown | null>;
        deleteSession: (id: string) => Promise<boolean>;
        addCollaborator: (sessionId: string, name: string, role: string, capabilities: string[], model?: string) => Promise<unknown | null>;
        removeCollaborator: (sessionId: string, collaboratorId: string) => Promise<boolean>;
        createTask: (sessionId: string, title: string, description: string, options?: unknown) => Promise<unknown | null>;
        updateTask: (sessionId: string, taskId: string, updates: unknown) => Promise<unknown | null>;
        getReadyTasks: (sessionId: string) => Promise<unknown[]>;
        getTaskGraph: (sessionId: string) => Promise<TaskGraph>;
        sendMessage: (sessionId: string, from: string, type: string, content: string, options?: unknown) => Promise<unknown | null>;
        getMessages: (sessionId: string, options?: unknown) => Promise<unknown[]>;
        proposeConsensus: (sessionId: string, taskId: string, proposedBy: string, content: unknown) => Promise<unknown | null>;
        voteProposal: (proposalId: string, collaboratorId: string, vote: string) => Promise<unknown | null>;
        synthesize: (sessionId: string) => Promise<unknown>;
        getStats: () => Promise<CollaborationStats>;
        getSessionStats: (sessionId: string) => Promise<unknown | null>;
      };

      // Conversation Memory Engine
      conversationMemory?: {
        processSegment: (segment: unknown) => Promise<unknown[]>;
        query: (query?: unknown) => Promise<MemoryEntry[]>;
        getRelevant: (query: string, limit?: number) => Promise<unknown[]>;
        getMemory: (id: string) => Promise<MemoryEntry | null>;
        updateMemory: (id: string, updates: unknown) => Promise<boolean>;
        deleteMemory: (id: string) => Promise<boolean>;
        getTopics: (sessionId?: string, limit?: number) => Promise<ExtractedTopic[]>;
        generateSummary: (sessionId: string, segments: unknown[], level?: string) => Promise<unknown | null>;
        getSummary: (sessionId: string) => Promise<ConversationSummary | null>;
        linkRelated: () => Promise<number>;
        prune: (keepCount?: number) => Promise<number>;
        getStats: () => Promise<MemoryStats>;
      };

      // Tool Registry
      toolRegistry?: {
        register: (tool: unknown) => Promise<unknown | null>;
        unregister: (id: string) => Promise<boolean>;
        get: (id: string) => Promise<ToolDefinition | null>;
        findByName: (name: string) => Promise<ToolDefinition | null>;
        search: (query?: unknown) => Promise<ToolDefinition[]>;
        getByCategory: (category: string) => Promise<ToolDefinition[]>;
        getAvailable: () => Promise<ToolDefinition[]>;
        getCategories: () => Promise<string[]>;
        validateParams: (toolId: string, params: unknown) => Promise<unknown>;
        recordUsage: (record: unknown) => Promise<void>;
        getAnalytics: (toolId: string) => Promise<ToolAnalytics | null>;
        getTop: (limit?: number) => Promise<ToolAnalytics[]>;
        getRecommendations: (context: unknown) => Promise<ToolRecommendation[]>;
        getStats: () => Promise<ToolRegistryStats>;
      };

      // Health Monitor
      healthMonitor?: {
        getStatus: () => Promise<HealthStats>;
        getSnapshot: () => Promise<HealthSnapshot | null>;
        check: () => Promise<HealthSnapshot | null>;
        registerService: (name: string, options?: unknown) => Promise<unknown | null>;
        updateService: (name: string, status: string, options?: unknown) => Promise<boolean>;
        getService: (name: string) => Promise<unknown | null>;
        getIssues: () => Promise<HealthIssue[]>;
        getTrends: (periodHours?: number) => Promise<HealthTrend>;
        getStats: () => Promise<HealthStats>;
        start: () => Promise<{ success: boolean }>;
        stop: () => Promise<{ success: boolean }>;
      };

      // WebSocket Manager
      websocket?: {
        connect: (connectionId: string) => Promise<{ id: string; subscribedChannels: string[]; connectedAt: string; lastActivity: string }>;
        disconnect: (connectionId: string) => Promise<boolean>;
        subscribe: (connectionId: string, channel: string) => Promise<boolean>;
        unsubscribe: (connectionId: string, channel: string) => Promise<boolean>;
        broadcast: (channel: string, type: string, payload: unknown) => Promise<unknown | null>;
        getHistory: (channel: string, limit?: number) => Promise<unknown[]>;
        getChannels: () => Promise<unknown[]>;
        getStats: () => Promise<unknown>;
        start: () => Promise<void>;
        stop: () => Promise<void>;
        onMessage: (callback: (message: unknown) => void) => () => void;
      };

      // Tray Notifications
      trayBadge?: {
        getState: () => Promise<{ unreadCount: number; alertCount: number; hasCriticalAlert: boolean; lastUpdated: string }>;
        setUnread: (count: number) => Promise<void>;
        clearUnread: () => Promise<void>;
        addAlert: (severity: string, message?: string) => Promise<void>;
        clearAlerts: () => Promise<void>;
        onCategory: (name: string, count: number, priority?: string, lastEvent?: string) => Promise<void>;
        getConfig: () => Promise<unknown>;
        updateConfig: (updates: unknown) => Promise<void>;
        reset: () => Promise<void>;
      };

      // Backup Service
      backup?: {
        create: (name?: string, description?: string, tags?: string[]) => Promise<unknown>;
        restore: (options: unknown) => Promise<unknown>;
        delete: (id: string) => Promise<boolean>;
        get: (id: string) => Promise<unknown | undefined>;
        list: () => Promise<unknown[]>;
        startAuto: () => Promise<void>;
        stopAuto: () => Promise<void>;
        isAutoRunning: () => Promise<boolean>;
        getConfig: () => Promise<unknown>;
        updateConfig: (updates: unknown) => Promise<void>;
        getStats: () => Promise<unknown>;
        export: (id: string) => Promise<unknown>;
        import: (data: string) => Promise<unknown>;
      };

      // Session Export Service
      sessionExport?: {
        export: (sessionId: string, options: unknown) => Promise<{ success: boolean; filePath?: string; error?: string }>;
        batchExport: (sessionIds: string[], options: unknown) => Promise<{ success: boolean; filePath?: string; error?: string }>;
        getTemplates: () => Promise<Array<{ id: string; name: string; description: string; icon: string }>>;
        listExports: () => Promise<Array<{ fileName: string; format: string; timestamp: string; size: number; sessionCount: number }>>;
        deleteExport: (fileName: string) => Promise<boolean>;
      };

      // Charts Data Pipeline
      charts?: {
        getDashboardData: () => Promise<unknown>;
        getSessionActivity: (days?: number) => Promise<Array<{ date: string; value: number }>>;
        getMessageVolume: (days?: number) => Promise<Array<{ date: string; value: number }>>;
        getModelUsage: () => Promise<Array<{ name: string; value: number; color: string }>>;
        getToolUsage: () => Promise<Array<{ name: string; value: number; color: string }>>;
        getHealthHistory: (days?: number) => Promise<Array<{ date: string; value: number }>>;
        getPerformanceMetrics: () => Promise<{
          session: { p50: number; p95: number; p99: number };
          workflow: { p50: number; p95: number; p99: number };
          mcp: { p50: number; p95: number; p99: number };
          system: { p50: number; p95: number; p99: number };
        }>;
        invalidateCache: () => Promise<{ success: boolean }>;
      };

      // State Sync Service
      stateSync?: {
        subscribe: (slices: string[]) => Promise<{ subscriptionId: string }>;
        unsubscribe: (id: string) => Promise<boolean>;
        getState: (slice: string) => Promise<unknown>;
        getAllStates: () => Promise<Record<string, unknown>>;
        getStats: () => Promise<{ subscriptions: number; cachedSlices: number; pendingUpdates: number; isRunning: boolean }>;
        onStateUpdate: (callback: (update: { slice: string; timestamp: string; data: unknown }) => void) => () => void;
      };

      // Plugin SDK Validator
      pluginSdk?: {
        validateManifest: (manifest: unknown) => Promise<{
          valid: boolean;
          errors: Array<{ type: string; field: string; message: string; suggestion?: string }>;
          warnings: Array<{ type: string; field: string; message: string; suggestion?: string }>;
          infos: Array<{ type: string; field: string; message: string; suggestion?: string }>;
        }>;
        generateScaffold: (manifest: unknown, options: { language: string; includeTests: boolean; includeDocs: boolean }) => Promise<Record<string, string>>;
        getStats: () => Promise<{ platformVersion: string; validPermissions: number; validHooks: number }>;
      };

      // Marketplace Service
      marketplace?: {
        getAllItems: (filter?: unknown) => Promise<unknown[]>;
        getItem: (id: string) => Promise<unknown | null>;
        getStats: () => Promise<unknown>;
        installItem: (id: string) => Promise<unknown>;
        uninstallItem: (id: string) => Promise<unknown>;
        updateItem: (id: string) => Promise<unknown>;
        getCategories: () => Promise<string[]>;
        getTags: () => Promise<string[]>;
        onInstallEvent: (callback: (data: unknown) => void) => () => void;
      };

      // Agent Context Manager
      agentContext?: {
        createSession: (name: string, options?: unknown) => Promise<unknown>;
        getSession: (id: string) => Promise<unknown | null>;
        getAllSessions: () => Promise<unknown[]>;
        deleteSession: (id: string) => Promise<boolean>;
        renameSession: (id: string, newName: string) => Promise<boolean>;
        addMessage: (sessionId: string, message: unknown) => Promise<unknown | null>;
        deleteMessage: (sessionId: string, messageId: string) => Promise<boolean>;
        getMessages: (sessionId: string, options?: unknown) => Promise<unknown[]>;
        compressSession: (sessionId: string) => Promise<unknown | null>;
        getSummary: (sessionId: string) => Promise<unknown | null>;
        inheritContext: (fromSessionId: string, toSessionId: string, options: unknown) => Promise<boolean>;
        getInheritances: (sessionId: string) => Promise<unknown[]>;
        updateSystemPrompt: (sessionId: string, systemPrompt: string) => Promise<boolean>;
        buildContextForLLM: (sessionId: string) => Promise<unknown | null>;
        getStats: () => Promise<unknown>;
      };
    };
  }
}

export {};
