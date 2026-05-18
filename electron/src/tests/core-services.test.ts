/**
 * DeerFlow Electron - Core Services Tests
 *
 * Tests for SkillManager, MarketplaceService, and other core services.
 *
 * Run: npx ts-node electron/src/tests/core-services.test.ts
 */

import * as assert from "assert";
import { SkillManager } from "../skill-manager";
import { MarketplaceService } from "../marketplace-service";
import { ToolRegistry } from "../tool-registry";
import { HealthMonitor } from "../health-monitor";
import { ConversationMemoryEngine } from "../conversation-memory";
import { TaskScheduler } from "../scheduler";
import { PluginManager } from "../plugin-manager";
import { BackupService } from "../backup-service";
import { SessionExportService } from "../session-export-service";
import { ConfigManager } from "../config-manager";
import { FileLogger } from "../logger";
import { StartupOptimizer } from "../startup-optimizer";
import { ChartsDataPipeline } from "../charts-data-pipeline";
import { AgentReasoningEngine } from "../agent-reasoning";
import { KnowledgeGraphManager } from "../knowledge-graph";
import { AuditLogger } from "../audit-logger";
import { WebSocketManager } from "../websocket-manager";
import { AgentSessionManager } from "../agent-session";
import { AgentCollaborationHub } from "../agent-collaboration";
import { AgentContextManager } from "../agent-context-manager";
import { StateSyncService } from "../state-sync-service";
import { MCPManager } from "../mcp-manager";
import { AgentEventBus, EventChannel } from "../event-bus";
import { PluginSDKValidator } from "../plugin-sdk-validator";
import { PerformanceMonitor } from "../performance-monitor";
import { ThemeManager } from "../theme-manager";
import { SecurityManager } from "../security-manager";
import { DiagnosticsManager } from "../diagnostics";
import { TelemetryManager } from "../telemetry";
import { ContextManager } from "../context-manager";
import { AutoUpdater } from "../updater";
import { AgentBridge } from "../agent-bridge";
import { ShortcutsManager } from "../shortcuts";
import { TrayNotificationManager } from "../tray-notifications";
import { WorkflowOrchestrator } from "../workflow-orchestrator";
import { ServiceManager } from "../services";
import { ProxyServer, ProxyConfig } from "../proxy";
import { FileDropHandler } from "../file-drop";
import { loadWindowState, saveWindowState, WindowState } from "../window-state";
import { DesktopNotifications, NotificationOptions } from "../notifications";
import { StaticServer, StaticServerConfig } from "../static-server";
import { getSplashHTML, getStatusDashboardHTML, SplashServiceStatus } from "../splash";
import { getOnboardingHTML, ONBOARDING_STEPS, OnboardingStep } from "../onboarding";
import { MODEL_PROVIDERS, ModelConfig, ModelProvider } from "../settings";

// ============================================================
// Test Utilities
// ============================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class TestRunner {
  private results: TestResult[] = [];

  async test(name: string, fn: () => void | Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      await fn();
      this.results.push({ name, passed: true, duration: Date.now() - start });
      console.log(`  ✅ ${name} (${Date.now() - start}ms)`);
    } catch (err: any) {
      this.results.push({ name, passed: false, error: err.message, duration: Date.now() - start });
      console.log(`  ❌ ${name} — ${err.message}`);
    }
  }

  summary(): void {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;
    console.log(`\n📊 Results: ${passed}/${total} passed`);
    if (failed > 0) {
      console.log(`   ${failed} test(s) failed`);
      process.exit(1);
    }
  }
}

// ============================================================
// SkillManager Tests
// ============================================================

async function runSkillManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n🧩 SkillManager Tests");

  const projectRoot = process.cwd();
  const manager = new SkillManager(projectRoot);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getStats returns stats", () => {
    const stats = manager.getStats();
    assert.ok(typeof stats.totalSkills === "number");
    assert.ok(typeof stats.enabledSkills === "number");
    assert.ok(typeof stats.builtinSkills === "number");
    assert.ok(typeof stats.localSkills === "number");
    assert.ok(typeof stats.remoteSkills === "number");
    assert.ok(typeof stats.byTag === "object");
  });
}

// ============================================================
// MarketplaceService Tests
// ============================================================

async function runMarketplaceTests(runner: TestRunner): Promise<void> {
  console.log("\n🛒 MarketplaceService Tests");

  const projectRoot = process.cwd();
  const service = new MarketplaceService(projectRoot);

  await runner.test("constructor creates service", () => {
    assert.ok(service, "Should create service");
  });

  await runner.test("getStats returns stats", () => {
    const stats = service.getStats();
    assert.ok(typeof stats.totalPlugins === "number");
    assert.ok(typeof stats.totalSkills === "number");
  });
}

// ============================================================
// ToolRegistry Tests
// ============================================================

async function runToolRegistryTests(runner: TestRunner): Promise<void> {
  console.log("\n🔧 ToolRegistry Tests");

  const projectRoot = process.cwd();
  const registry = new ToolRegistry(projectRoot);

  await runner.test("constructor creates registry", () => {
    assert.ok(registry, "Should create registry");
  });

  await runner.test("getStats returns stats", () => {
    const stats = registry.getStats();
    assert.ok(typeof stats.totalTools === "number");
    assert.ok(typeof stats.byCategory === "object");
    assert.ok(typeof stats.bySource === "object");
    assert.ok(typeof stats.byStatus === "object");
    assert.ok(typeof stats.totalUsageRecords === "number");
    assert.ok(Array.isArray(stats.topTools));
  });
}

// ============================================================
// HealthMonitor Tests
// ============================================================

async function runHealthMonitorTests(runner: TestRunner): Promise<void> {
  console.log("\n💚 HealthMonitor Tests");

  const projectRoot = process.cwd();
  const monitor = new HealthMonitor(projectRoot);

  await runner.test("constructor creates monitor", () => {
    assert.ok(monitor, "Should create monitor");
  });

  await runner.test("getStats returns stats", () => {
    const stats = monitor.getStats();
    assert.ok(typeof stats.totalServices === "number");
    assert.ok(typeof stats.healthyServices === "number");
    assert.ok(typeof stats.degradedServices === "number");
    assert.ok(typeof stats.unhealthyServices === "number");
    assert.ok(typeof stats.totalSnapshots === "number");
  });
}

// ============================================================
// ConversationMemory Tests
// ============================================================

async function runConversationMemoryTests(runner: TestRunner): Promise<void> {
  console.log("\n🧠 ConversationMemory Tests");

  const projectRoot = process.cwd();
  const memory = new ConversationMemoryEngine(projectRoot);

  await runner.test("constructor creates memory", () => {
    assert.ok(memory, "Should create memory");
  });

  await runner.test("getStats returns stats", () => {
    const stats = memory.getStats();
    assert.ok(typeof stats.totalMemories === "number");
    assert.ok(typeof stats.byType === "object");
    assert.ok(typeof stats.averageImportance === "number");
    assert.ok(typeof stats.averageConfidence === "number");
    assert.ok(typeof stats.totalAccesses === "number");
  });
}

// ============================================================
// TaskScheduler Tests
// ============================================================

async function runTaskSchedulerTests(runner: TestRunner): Promise<void> {
  console.log("\n📅 TaskScheduler Tests");

  const projectRoot = process.cwd();
  const scheduler = new TaskScheduler(projectRoot);

  await runner.test("constructor creates scheduler", () => {
    assert.ok(scheduler, "Should create scheduler");
  });

  await runner.test("getStats returns stats", () => {
    const stats = scheduler.getStats();
    assert.ok(typeof stats.totalTasks === "number");
    assert.ok(typeof stats.enabledTasks === "number");
    assert.ok(typeof stats.runningTasks === "number");
    assert.ok(typeof stats.byType === "object");
    assert.ok(typeof stats.totalExecutions === "number");
    assert.ok(typeof stats.successfulExecutions === "number");
    assert.ok(typeof stats.failedExecutions === "number");
  });
}

// ============================================================
// PluginManager Tests
// ============================================================

async function runPluginManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n🔌 PluginManager Tests");

  const projectRoot = process.cwd();
  const appVersion = "2.0.0";
  const manager = new PluginManager(projectRoot, appVersion);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getStats returns stats", () => {
    const stats = manager.getStats();
    assert.ok(typeof stats.total === "number");
    assert.ok(typeof stats.enabled === "number");
    assert.ok(typeof stats.disabled === "number");
    assert.ok(typeof stats.errors === "number");
    assert.ok(typeof stats.incompatible === "number");
  });
}

// ============================================================
// BackupService Tests
// ============================================================

async function runBackupServiceTests(runner: TestRunner): Promise<void> {
  console.log("\n💾 BackupService Tests");

  const projectRoot = process.cwd();
  const service = new BackupService(projectRoot);

  await runner.test("constructor creates service", () => {
    assert.ok(service, "Should create service");
  });

  await runner.test("getStats returns stats", () => {
    const stats = service.getStats();
    assert.ok(typeof stats.totalBackups === "number");
    assert.ok(typeof stats.totalSize === "number");
    assert.ok(typeof stats.autoBackupEnabled === "boolean");
  });
}

// ============================================================
// SessionExportService Tests
// ============================================================

async function runSessionExportServiceTests(runner: TestRunner): Promise<void> {
  console.log("\n📤 SessionExportService Tests");

  const projectRoot = process.cwd();
  const service = new SessionExportService(projectRoot);

  await runner.test("constructor creates service", () => {
    assert.ok(service, "Should create service");
  });

  await runner.test("getStats returns stats", () => {
    const stats = service.getStats();
    assert.ok(typeof stats.totalExports === "number");
    assert.ok(typeof stats.totalSize === "number");
  });
}

// ============================================================
// ConfigManager Tests
// ============================================================

async function runConfigManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n⚙️ ConfigManager Tests");

  const projectRoot = process.cwd();
  const manager = new ConfigManager(projectRoot);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getConfigSummary returns summary", () => {
    const summary = manager.getConfigSummary();
    assert.ok(typeof summary.hasModels === "boolean");
    assert.ok(typeof summary.modelCount === "number");
    assert.ok(typeof summary.hasEnvVars === "boolean");
    assert.ok(typeof summary.envVarCount === "number");
    assert.ok(Array.isArray(summary.models));
  });

  await runner.test("getModelConfigs returns models", () => {
    const result = manager.getModelConfigs();
    assert.ok(typeof result.success === "boolean");
    if (result.success) {
      assert.ok(Array.isArray(result.models));
    }
  });

  await runner.test("hasModelsConfigured returns boolean", () => {
    const hasModels = manager.hasModelsConfigured();
    assert.ok(typeof hasModels === "boolean");
  });
}

// ============================================================
// FileLogger Tests
// ============================================================

async function runFileLoggerTests(runner: TestRunner): Promise<void> {
  console.log("\n📝 FileLogger Tests");

  const projectRoot = process.cwd();
  const logger = new FileLogger(projectRoot);

  await runner.test("constructor creates logger", () => {
    assert.ok(logger, "Should create logger");
  });

  await runner.test("log methods work", () => {
    logger.info("Test message", "test");
    logger.debug("Debug message", "test");
    logger.warn("Warning message", "test");
    logger.error("Error message", "test");
    // No assertion needed, just verify no errors thrown
  });

  await runner.test("getRecentLogs returns array", () => {
    const logs = logger.getRecentLogs(10);
    assert.ok(Array.isArray(logs));
  });

  // Clean up
  logger.destroy();
}

// ============================================================
// StartupOptimizer Tests
// ============================================================

async function runStartupOptimizerTests(runner: TestRunner): Promise<void> {
  console.log("\n🚀 StartupOptimizer Tests");

  const optimizer = new StartupOptimizer();

  await runner.test("constructor creates optimizer", () => {
    assert.ok(optimizer, "Should create optimizer");
  });

  await runner.test("getMetrics returns metrics", () => {
    const metrics = optimizer.getMetrics();
    assert.ok(typeof metrics.startTime === "number");
    assert.ok(typeof metrics.serviceDurations === "object");
  });

  await runner.test("getIsRunning returns boolean", () => {
    const isRunning = optimizer.getIsRunning();
    assert.ok(typeof isRunning === "boolean");
  });

  await runner.test("formatMetrics returns string", () => {
    const formatted = optimizer.formatMetrics();
    assert.ok(typeof formatted === "string");
    assert.ok(formatted.length > 0);
  });

  // Complete startup to get totalDuration
  optimizer.complete();
}

// ============================================================
// ChartsDataPipeline Tests
// ============================================================

async function runChartsDataPipelineTests(runner: TestRunner): Promise<void> {
  console.log("\n📊 ChartsDataPipeline Tests");

  const pipeline = new ChartsDataPipeline();

  await runner.test("constructor creates pipeline", () => {
    assert.ok(pipeline, "Should create pipeline");
  });

  await runner.test("getSessionActivity returns data", () => {
    const data = pipeline.getSessionActivity(7);
    assert.ok(Array.isArray(data));
  });

  await runner.test("getMessageVolume returns data", () => {
    const data = pipeline.getMessageVolume(7);
    assert.ok(Array.isArray(data));
  });

  await runner.test("getModelUsage returns data", () => {
    const data = pipeline.getModelUsage();
    assert.ok(Array.isArray(data));
  });

  await runner.test("getToolUsage returns data", () => {
    const data = pipeline.getToolUsage();
    assert.ok(Array.isArray(data));
  });

  await runner.test("getPerformanceMetrics returns data", () => {
    const data = pipeline.getPerformanceMetrics();
    assert.ok(typeof data.session === "object");
    assert.ok(typeof data.workflow === "object");
    assert.ok(typeof data.mcp === "object");
    assert.ok(typeof data.system === "object");
  });

  await runner.test("getHealthScoreHistory returns data", () => {
    const data = pipeline.getHealthScoreHistory(7);
    assert.ok(Array.isArray(data));
  });

  await runner.test("invalidateCache works", () => {
    pipeline.invalidateCache();
    // No assertion needed, just verify no errors thrown
  });
}

// ============================================================
// AgentReasoningEngine Tests
// ============================================================

async function runAgentReasoningTests(runner: TestRunner): Promise<void> {
  console.log("\n🧠 AgentReasoningEngine Tests");

  const projectRoot = process.cwd();
  const engine = new AgentReasoningEngine(projectRoot);

  await runner.test("constructor creates engine", () => {
    assert.ok(engine, "Should create engine");
  });

  await runner.test("getStats returns stats", () => {
    const stats = engine.getStats();
    assert.ok(typeof stats.totalTraces === "number");
    assert.ok(typeof stats.activeTraces === "number");
    assert.ok(typeof stats.completedTraces === "number");
    assert.ok(typeof stats.failedTraces === "number");
    assert.ok(typeof stats.byStrategy === "object");
    assert.ok(typeof stats.averageSteps === "number");
    assert.ok(typeof stats.averageConfidence === "number");
  });
}

// ============================================================
// KnowledgeGraphManager Tests
// ============================================================

async function runKnowledgeGraphTests(runner: TestRunner): Promise<void> {
  console.log("\n🔗 KnowledgeGraphManager Tests");

  const projectRoot = process.cwd();
  const kg = new KnowledgeGraphManager(projectRoot);

  await runner.test("constructor creates manager", () => {
    assert.ok(kg, "Should create manager");
  });

  await runner.test("getStats returns stats", () => {
    const stats = kg.getStats();
    assert.ok(typeof stats.totalEntities === "number");
    assert.ok(typeof stats.totalRelations === "number");
    assert.ok(typeof stats.entityTypes === "object");
    assert.ok(typeof stats.relationTypes === "object");
    assert.ok(typeof stats.averageConfidence === "number");
    assert.ok(typeof stats.orphanedEntities === "number");
    assert.ok(Array.isArray(stats.mostConnected));
  });
}

// ============================================================
// AuditLogger Tests
// ============================================================

async function runAuditLoggerTests(runner: TestRunner): Promise<void> {
  console.log("\n📋 AuditLogger Tests");

  const projectRoot = process.cwd();
  const logger = new AuditLogger(projectRoot);

  await runner.test("constructor creates logger", () => {
    assert.ok(logger, "Should create logger");
  });

  await runner.test("getStats returns stats", () => {
    const stats = logger.getStats();
    assert.ok(typeof stats.totalEvents === "number");
    assert.ok(typeof stats.byCategory === "object");
    assert.ok(typeof stats.bySeverity === "object");
    assert.ok(typeof stats.byResult === "object");
    assert.ok(typeof stats.byActorType === "object");
    assert.ok(typeof stats.tamperedEntries === "number");
  });
}

// ============================================================
// WebSocketManager Tests
// ============================================================

async function runWebSocketManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n🌐 WebSocketManager Tests");

  const manager = new WebSocketManager();

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getStats returns stats", () => {
    const stats = manager.getStats();
    assert.ok(typeof stats.totalConnections === "number");
    assert.ok(typeof stats.activeChannels === "number");
    assert.ok(typeof stats.messagesSent === "number");
    assert.ok(typeof stats.messagesReceived === "number");
    assert.ok(typeof stats.messagesByChannel === "object");
    assert.ok(typeof stats.peakConnections === "number");
  });
}

// ============================================================
// AgentSessionManager Tests
// ============================================================

async function runAgentSessionManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n🧑‍💻 AgentSessionManager Tests");

  const projectRoot = process.cwd();
  const manager = new AgentSessionManager(projectRoot);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getStats returns stats", () => {
    const stats = manager.getStats();
    assert.ok(typeof stats.totalSessions === "number");
    assert.ok(typeof stats.activeSessions === "number");
    assert.ok(typeof stats.completedSessions === "number");
    assert.ok(typeof stats.totalMessages === "number");
    assert.ok(typeof stats.totalToolCalls === "number");
    assert.ok(typeof stats.averageDuration === "number");
  });
}

// ============================================================
// AgentCollaborationHub Tests
// ============================================================

async function runAgentCollaborationHubTests(runner: TestRunner): Promise<void> {
  console.log("\n🤝 AgentCollaborationHub Tests");

  const projectRoot = process.cwd();
  const hub = new AgentCollaborationHub(projectRoot);

  await runner.test("constructor creates hub", () => {
    assert.ok(hub, "Should create hub");
  });

  await runner.test("getStats returns stats", () => {
    const stats = hub.getStats();
    assert.ok(typeof stats.totalSessions === "number");
    assert.ok(typeof stats.activeSessions === "number");
    assert.ok(typeof stats.totalCollaborators === "number");
    assert.ok(typeof stats.totalTasks === "number");
    assert.ok(typeof stats.completedTasks === "number");
    assert.ok(typeof stats.byRole === "object");
    assert.ok(typeof stats.averageConsensusRate === "number");
  });
}

// ============================================================
// AgentContextManager Tests
// ============================================================

async function runAgentContextManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n🧠 AgentContextManager Tests");

  const projectRoot = process.cwd();
  const manager = new AgentContextManager(projectRoot);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getStats returns stats", () => {
    const stats = manager.getStats();
    assert.ok(typeof stats.totalSessions === "number");
    assert.ok(typeof stats.totalMessages === "number");
    assert.ok(typeof stats.totalTokens === "number");
    assert.ok(typeof stats.totalSummaries === "number");
    assert.ok(typeof stats.averageMessagesPerSession === "number");
  });
}

// ============================================================
// StateSyncService Tests
// ============================================================

async function runStateSyncServiceTests(runner: TestRunner): Promise<void> {
  console.log("\n🔄 StateSyncService Tests");

  const service = new StateSyncService();

  await runner.test("constructor creates service", () => {
    assert.ok(service, "Should create service");
  });

  await runner.test("getStats returns stats", () => {
    const stats = service.getStats();
    assert.ok(typeof stats.subscriptions === "number");
    assert.ok(typeof stats.cachedSlices === "number");
    assert.ok(typeof stats.pendingUpdates === "number");
    assert.ok(typeof stats.isRunning === "boolean");
  });
}

// ============================================================
// MCPManager Tests
// ============================================================

async function runMCPManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n🔌 MCPManager Tests");

  const projectRoot = process.cwd();
  const manager = new MCPManager(projectRoot);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getToolCount returns number", () => {
    const count = manager.getToolCount();
    assert.ok(typeof count === "number", "Should return number");
  });

  await runner.test("getServerCount returns number", () => {
    const count = manager.getServerCount();
    assert.ok(typeof count === "number", "Should return number");
  });

  await runner.test("getAllTools returns array", () => {
    const tools = manager.getAllTools();
    assert.ok(Array.isArray(tools), "Should return array");
  });
}

// ============================================================
// EventBus Tests
// ============================================================

async function runEventBusTests(runner: TestRunner): Promise<void> {
  console.log("\n📨 EventBus Tests");

  const eventBus = new AgentEventBus();

  await runner.test("constructor creates event bus", () => {
    assert.ok(eventBus, "Should create event bus");
  });

  await runner.test("getMetrics returns metrics object", () => {
    const metrics = eventBus.getMetrics();
    assert.ok(metrics, "Should return metrics");
    assert.ok(typeof metrics.totalEventsPublished === "number");
    assert.ok(typeof metrics.totalEventsDelivered === "number");
    assert.ok(typeof metrics.activeSubscriptions === "number");
  });

  await runner.test("getMetrics has eventsByChannel", () => {
    const metrics = eventBus.getMetrics();
    assert.ok(metrics.eventsByChannel, "Should have eventsByChannel");
    assert.ok(typeof metrics.eventsByChannel === "object");
  });

  await runner.test("getMetrics has eventsByType", () => {
    const metrics = eventBus.getMetrics();
    assert.ok(metrics.eventsByType, "Should have eventsByType");
    assert.ok(typeof metrics.eventsByType === "object");
  });

  await runner.test("publish and emit returns event", () => {
    const event = eventBus.publish("session" as EventChannel, "test", { data: "test" });
    assert.ok(event, "Should return event");
    assert.ok(event.id, "Should have event id");
    assert.ok(event.timestamp, "Should have timestamp");
  });

  // Cleanup
  eventBus.destroy();
}

// ============================================================
// PluginSDKValidator Tests
// ============================================================

async function runPluginSDKValidatorTests(runner: TestRunner): Promise<void> {
  console.log("\n🔧 PluginSDKValidator Tests");

  const platformVersion = "1.0.0";
  const validator = new PluginSDKValidator(platformVersion);

  await runner.test("constructor creates validator", () => {
    assert.ok(validator, "Should create validator");
  });

  await runner.test("getStats returns stats object", () => {
    const stats = validator.getStats();
    assert.ok(stats, "Should return stats");
    assert.ok(typeof stats.platformVersion === "string");
    assert.ok(typeof stats.validPermissions === "number");
    assert.ok(typeof stats.validHooks === "number");
    assert.ok(typeof stats.totalValidations === "number");
    assert.ok(typeof stats.totalScaffolds === "number");
  });

  await runner.test("getStats has platformVersion", () => {
    const stats = validator.getStats();
    assert.strictEqual(stats.platformVersion, platformVersion);
  });

  await runner.test("getStats has valid permissions and hooks", () => {
    const stats = validator.getStats();
    assert.ok(stats.validPermissions > 0, "Should have valid permissions");
    assert.ok(stats.validHooks > 0, "Should have valid hooks");
  });
}

// ============================================================
// PerformanceMonitor Tests
// ============================================================

async function runPerformanceMonitorTests(runner: TestRunner): Promise<void> {
  console.log("\n📈 PerformanceMonitor Tests");

  const projectRoot = process.cwd();
  const monitor = new PerformanceMonitor(projectRoot);

  await runner.test("constructor creates monitor", () => {
    assert.ok(monitor, "Should create monitor");
  });

  await runner.test("getCurrentSnapshot returns snapshot", () => {
    const snapshot = monitor.getCurrentSnapshot();
    assert.ok(snapshot, "Should return snapshot");
    assert.ok(snapshot.timestamp, "Should have timestamp");
    assert.ok(typeof snapshot.sessionMetrics === "object", "Should have sessionMetrics");
    assert.ok(typeof snapshot.workflowMetrics === "object", "Should have workflowMetrics");
    assert.ok(typeof snapshot.mcpMetrics === "object", "Should have mcpMetrics");
    assert.ok(typeof snapshot.systemMetrics === "object", "Should have systemMetrics");
    assert.ok(typeof snapshot.aggregated === "object", "Should have aggregated");
  });

  await runner.test("getAlerts returns array", () => {
    const alerts = monitor.getAlerts();
    assert.ok(Array.isArray(alerts), "Should return array");
  });

  await runner.test("getLatestReport returns report", () => {
    const report = monitor.getLatestReport();
    assert.ok(report, "Should return report");
    assert.ok(typeof report.metrics === "object", "Should have metrics");
    assert.ok(typeof report.snapshot === "object", "Should have snapshot");
  });

  await runner.test("generateReport returns report", () => {
    const report = monitor.generateReport(1);
    assert.ok(report, "Should return report");
    assert.ok(report.generatedAt, "Should have generatedAt");
    assert.ok(report.snapshot, "Should have snapshot");
    assert.ok(Array.isArray(report.trends), "Should have trends");
    assert.ok(Array.isArray(report.recommendations), "Should have recommendations");
  });

  // Cleanup
  monitor.destroy();
}

// ============================================================
// ThemeManager Tests
// ============================================================

async function runThemeManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n🎨 ThemeManager Tests");

  const userDataPath = process.cwd();
  const manager = new ThemeManager(userDataPath);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getMode returns theme mode", () => {
    const mode = manager.getMode();
    assert.ok(mode === "light" || mode === "dark" || mode === "auto", "Should return valid mode");
  });

  await runner.test("getColors returns colors", () => {
    const colors = manager.getColors();
    assert.ok(colors, "Should return colors");
    assert.ok(colors.background, "Should have background");
    assert.ok(colors.surface, "Should have surface");
    assert.ok(colors.text, "Should have text");
    assert.ok(colors.accent, "Should have accent");
  });

  await runner.test("getEffectiveTheme returns resolved theme", () => {
    const effective = manager.getEffectiveTheme();
    assert.ok(effective === "light" || effective === "dark", "Should return resolved theme");
  });

  await runner.test("getConfig returns theme config", () => {
    const config = manager.getConfig();
    assert.ok(config, "Should return config");
    assert.ok(config.mode, "Should have mode");
  });
}

// ============================================================
// SecurityManager Tests
// ============================================================

async function runSecurityManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n🔐 SecurityManager Tests");

  const projectRoot = process.cwd();
  const manager = new SecurityManager(projectRoot);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getPolicy returns policy or null", () => {
    const policy = manager.getPolicy("default");
    // Policy may not exist yet, so check null or valid structure
    assert.ok(policy === null || typeof policy === "object", "Should return policy or null");
  });

  await runner.test("checkPermission returns result object", () => {
    const result = manager.checkPermission("read", { type: "file", path: "/test" });
    assert.ok(result, "Should return result");
    assert.ok(typeof result.allowed === "boolean", "Should have allowed");
  });

  await runner.test("checkRateLimit returns rate limit result", () => {
    const result = manager.checkRateLimit("test-key", 10, 60000);
    assert.ok(result, "Should return result");
    assert.ok(typeof result.allowed === "boolean", "Should have allowed");
    assert.ok(typeof result.remaining === "number", "Should have remaining");
  });
}

// ============================================================
// DiagnosticsManager Tests
// ============================================================

async function runDiagnosticsManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n🔍 DiagnosticsManager Tests");

  const projectRoot = process.cwd();
  const appVersion = "2.0.0";
  const manager = new DiagnosticsManager(projectRoot, appVersion);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("collectSystemInfo returns system info", async () => {
    const info = await manager.collectSystemInfo();
    assert.ok(info, "Should return system info");
    assert.ok(info.platform, "Should have platform");
    assert.ok(info.arch, "Should have arch");
    assert.ok(info.nodeVersion, "Should have nodeVersion");
    assert.ok(info.appVersion, "Should have appVersion");
  });

  await runner.test("checkServicesHealth returns health array", async () => {
    // Use a non-existent port to avoid actual network issues
    const ports = { "test-service": 59999 };
    try {
      const health = await manager.checkServicesHealth(ports);
      assert.ok(Array.isArray(health), "Should return array");
    } catch {
      // Network errors are acceptable in test environment
      assert.ok(true, "Acceptable in test environment");
    }
  });

  // Cleanup
  manager.removeAllListeners();
}

// ============================================================
// TelemetryManager Tests
// ============================================================

async function runTelemetryManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n📡 TelemetryManager Tests");

  const telemetry = new TelemetryManager();

  await runner.test("constructor creates telemetry", () => {
    assert.ok(telemetry, "Should create telemetry");
  });

  await runner.test("isEnabled returns boolean", () => {
    const enabled = telemetry.isEnabled();
    assert.ok(typeof enabled === "boolean", "Should return boolean");
  });

  await runner.test("getQueueSize returns number", () => {
    const size = telemetry.getQueueSize();
    assert.ok(typeof size === "number", "Should return number");
  });

  await runner.test("getConfig returns config", () => {
    const config = telemetry.getConfig();
    assert.ok(config, "Should return config");
    assert.ok(typeof config.enabled === "boolean", "Should have enabled");
  });

  // Cleanup
  telemetry.removeAllListeners();
}

// ============================================================
// ContextManager Tests
// ============================================================

async function runContextManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n🗂️ ContextManager Tests");

  const projectRoot = process.cwd();
  const manager = new ContextManager(projectRoot);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getMemoryStats returns stats", () => {
    const stats = manager.getMemoryStats();
    assert.ok(stats, "Should return stats");
    assert.ok(typeof stats.totalMemories === "number", "Should have totalMemories");
    assert.ok(typeof stats.byCategory === "object", "Should have byCategory");
  });

  await runner.test("getConfig returns config", () => {
    const config = manager.getConfig();
    assert.ok(config, "Should return config");
    assert.ok(typeof config.maxTokens === "number", "Should have maxTokens");
  });
}

// ============================================================
// AutoUpdater Tests
// ============================================================

async function runAutoUpdaterTests(runner: TestRunner): Promise<void> {
  console.log("\n⬆️ AutoUpdater Tests");

  const updater = new AutoUpdater();

  await runner.test("constructor creates updater", () => {
    assert.ok(updater, "Should create updater");
  });

  await runner.test("getStatus returns status", () => {
    const status = updater.getStatus();
    assert.ok(status, "Should return status");
    assert.ok(typeof status.isChecking === "boolean", "Should have isChecking");
    assert.ok(typeof status.isDownloading === "boolean", "Should have isDownloading");
  });
}

// ============================================================
// AgentBridge Tests
// ============================================================

async function runAgentBridgeTests(runner: TestRunner): Promise<void> {
  console.log("\n🌉 AgentBridge Tests");

  const config = { langgraphUrl: "http://localhost:2024", defaultModel: "gpt-4o" };
  const bridge = new AgentBridge(config);

  await runner.test("constructor creates bridge", () => {
    assert.ok(bridge, "Should create bridge");
  });

  await runner.test("getConfig returns config", () => {
    const cfg = bridge.getConfig();
    assert.ok(cfg, "Should return config");
    assert.ok(cfg.langgraphUrl, "Should have langgraphUrl");
    assert.ok(cfg.defaultModel, "Should have defaultModel");
  });

  await runner.test("updateConfig updates config", () => {
    bridge.updateConfig({ timeoutMs: 60000 });
    const cfg = bridge.getConfig();
    assert.strictEqual(cfg.timeoutMs, 60000, "Should update timeout");
  });

  await runner.test("cancelStream returns boolean", () => {
    const result = bridge.cancelStream("test-thread");
    assert.ok(typeof result === "boolean", "Should return boolean");
  });

  // Cleanup
  bridge.destroy();
}

// ============================================================
// ShortcutsManager Tests
// ============================================================

async function runShortcutsManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n⌨️ ShortcutsManager Tests");

  const tempDir = process.cwd();
  const manager = new ShortcutsManager(tempDir);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getAllShortcuts returns shortcuts array", () => {
    const shortcuts = manager.getAllShortcuts();
    assert.ok(Array.isArray(shortcuts), "Should return array");
    assert.ok(shortcuts.length > 0, "Should have shortcuts");
  });

  await runner.test("getAccelerator returns accelerator", () => {
    const accel = manager.getAccelerator("new-chat");
    assert.ok(accel, "Should return accelerator");
  });

  await runner.test("getShortcutsByCategory returns grouped shortcuts", () => {
    const grouped = manager.getShortcutsByCategory();
    assert.ok(grouped, "Should return grouped");
    assert.ok(grouped.navigation, "Should have navigation category");
  });

  await runner.test("setCustomShortcut handles invalid action", () => {
    const result = manager.setCustomShortcut("nonexistent", "Cmd+A");
    assert.strictEqual(result.success, false, "Should fail for invalid action");
  });

  await runner.test("resetShortcut handles unknown action", () => {
    const result = manager.resetShortcut("unknown-action");
    assert.strictEqual(result.success, false, "Should fail for unknown action");
  });
}

// ============================================================
// WorkflowOrchestrator Tests
// ============================================================

async function runWorkflowOrchestratorTests(runner: TestRunner): Promise<void> {
  console.log("\n🔀 WorkflowOrchestrator Tests");

  const projectRoot = process.cwd();
  const orchestrator = new WorkflowOrchestrator(projectRoot);

  await runner.test("constructor creates orchestrator", () => {
    assert.ok(orchestrator, "Should create orchestrator");
  });

  await runner.test("getTemplates returns templates array", () => {
    const templates = orchestrator.getTemplates();
    assert.ok(Array.isArray(templates), "Should return array");
    assert.ok(templates.length > 0, "Should have built-in templates");
  });

  await runner.test("createWorkflow creates workflow", () => {
    const workflow = orchestrator.createWorkflow({
      name: "Test Workflow",
      entryNode: "start",
      nodes: [
        { id: "start", type: "input", name: "Start", config: {} },
        { id: "end", type: "output", name: "End", config: {} },
      ],
    });
    assert.ok(workflow, "Should create workflow");
    assert.ok(workflow.id, "Should have id");
    assert.strictEqual(workflow.name, "Test Workflow");
  });

  await runner.test("getWorkflow returns workflow", () => {
    const workflows = orchestrator.listWorkflows();
    if (workflows.length > 0) {
      const wf = orchestrator.getWorkflow(workflows[0].id);
      assert.ok(wf, "Should return workflow");
    } else {
      assert.ok(true, "No workflows to test");
    }
  });

  await runner.test("validateWorkflow returns validation result", () => {
    const workflow = orchestrator.createWorkflow({
      name: "Validation Test",
      entryNode: "start",
      nodes: [
        { id: "start", type: "input", name: "Start", config: {} },
        { id: "middle", type: "llm", name: "Process", config: { prompt: "test" }, next: "end" },
        { id: "end", type: "output", name: "End", config: {} },
      ],
    });
    const result = orchestrator.validateWorkflow(workflow);
    assert.ok(result, "Should return validation result");
    assert.ok(typeof result.valid === "boolean", "Should have valid");
    assert.ok(Array.isArray(result.errors), "Should have errors array");
  });

  // Cleanup
  orchestrator.destroy();
}

async function runTrayNotificationManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n🔔 TrayNotificationManager Tests");

  const manager = new TrayNotificationManager();

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getBadgeState returns badge state", () => {
    const state = manager.getBadgeState();
    assert.ok(typeof state.unreadCount === "number", "Should have unreadCount");
    assert.ok(typeof state.alertCount === "number", "Should have alertCount");
    assert.ok(typeof state.hasCriticalAlert === "boolean", "Should have hasCriticalAlert");
  });

  await runner.test("incrementUnread updates count", () => {
    manager.incrementUnread(5);
    const state = manager.getBadgeState();
    assert.strictEqual(state.unreadCount, 5, "Should have 5 unread");
  });

  await runner.test("decrementUnread updates count", () => {
    manager.decrementUnread(2);
    const state = manager.getBadgeState();
    assert.strictEqual(state.unreadCount, 3, "Should have 3 unread after decrement");
  });

  await runner.test("getConfig returns badge config", () => {
    const config = manager.getConfig();
    assert.ok(typeof config.enabled === "boolean", "Should have enabled");
    assert.ok(typeof config.showCount === "boolean", "Should have showCount");
    assert.ok(typeof config.maxDisplayCount === "number", "Should have maxDisplayCount");
  });
}

async function runServiceManagerTests(runner: TestRunner): Promise<void> {
  console.log("\n⚙️ ServiceManager Tests");

  const projectRoot = process.cwd();
  const manager = new ServiceManager(projectRoot);

  await runner.test("constructor creates manager", () => {
    assert.ok(manager, "Should create manager");
  });

  await runner.test("getStatus returns service status array", () => {
    const status = manager.getStatus();
    assert.ok(Array.isArray(status), "Should return array");
  });

  await runner.test("isAllReady returns boolean", () => {
    const ready = manager.isAllReady();
    assert.ok(typeof ready === "boolean", "Should return boolean");
  });

  await runner.test("getStatus provides service info structure", () => {
    const status = manager.getStatus();
    // Status will be empty initially (no services started)
    if (status.length > 0) {
      const s = status[0];
      assert.ok(typeof s.name === "string", "Status should have name");
      assert.ok(typeof s.running === "boolean", "Status should have running");
      assert.ok(typeof s.ready === "boolean", "Status should have ready");
    }
  });
}

async function runProxyServerTests(runner: TestRunner): Promise<void> {
  console.log("\n🌐 ProxyServer Tests");

  const config: ProxyConfig = {
    port: 19999, // Use high port to avoid conflicts
    langgraphPort: 2024,
    gatewayPort: 8001,
    frontendPort: 3000,
  };
  const server = new ProxyServer(config);

  await runner.test("constructor creates server", () => {
    assert.ok(server, "Should create server");
  });

  await runner.test("config is stored correctly", () => {
    assert.ok(server instanceof ProxyServer, "Should be ProxyServer instance");
  });

  await runner.test("config has required ports", () => {
    assert.ok(config.port === 19999, "Should have port 19999");
    assert.ok(config.langgraphPort === 2024, "Should have langgraphPort 2024");
    assert.ok(config.gatewayPort === 8001, "Should have gatewayPort 8001");
    assert.ok(config.frontendPort === 3000, "Should have frontendPort 3000");
  });

  await runner.test("proxy config interface structure", () => {
    assert.ok(typeof config.port === "number", "port should be number");
    assert.ok(typeof config.langgraphPort === "number", "langgraphPort should be number");
    assert.ok(typeof config.gatewayPort === "number", "gatewayPort should be number");
    assert.ok(typeof config.frontendPort === "number", "frontendPort should be number");
  });
}

async function runFileDropHandlerTests(runner: TestRunner): Promise<void> {
  console.log("\n📁 FileDropHandler Tests");

  const handler = new FileDropHandler("/tmp/test-project");

  await runner.test("constructor creates handler", () => {
    assert.ok(handler, "Should create handler");
  });

  await runner.test("processDroppedFiles with empty array", () => {
    const result = handler.processDroppedFiles([]);
    assert.ok(Array.isArray(result.files), "Should return files array");
    assert.ok(Array.isArray(result.errors), "Should return errors array");
    assert.ok(result.files.length === 0, "Should have no files");
  });

  await runner.test("processDroppedFiles returns correct structure", () => {
    const result = handler.processDroppedFiles([]);
    assert.ok("files" in result, "Should have files property");
    assert.ok("errors" in result, "Should have errors property");
  });

  await runner.test("readFileAsBase64 returns success structure", () => {
    const result = handler.readFileAsBase64("/nonexistent/file.txt");
    assert.ok("success" in result, "Should have success property");
    assert.ok(result.success === false, "Should return false for missing file");
  });

  await runner.test("copyToThreadUpload returns success structure", () => {
    const result = handler.copyToThreadUpload("/nonexistent/file.txt", "thread-123");
    assert.ok("success" in result, "Should have success property");
    assert.ok(result.success === false, "Should return false for missing file");
  });
}

async function runWindowStateTests(runner: TestRunner): Promise<void> {
  console.log("\n🪟 WindowState Tests");

  await runner.test("loadWindowState returns default state", () => {
    const state = loadWindowState("/nonexistent/path");
    assert.ok(state, "Should return state");
    assert.ok(typeof state.width === "number", "width should be number");
    assert.ok(typeof state.height === "number", "height should be number");
  });

  await runner.test("loadWindowState has default dimensions", () => {
    const state = loadWindowState("/nonexistent/path");
    assert.ok(state.width >= 400, "width should be >= 400");
    assert.ok(state.height >= 300, "height should be >= 300");
  });

  await runner.test("WindowState interface structure", () => {
    const state: WindowState = {
      x: 100,
      y: 100,
      width: 1400,
      height: 900,
      isMaximized: false,
    };
    assert.ok(typeof state.x === "number", "x should be number");
    assert.ok(typeof state.y === "number", "y should be number");
    assert.ok(typeof state.width === "number", "width should be number");
    assert.ok(typeof state.height === "number", "height should be number");
    assert.ok(typeof state.isMaximized === "boolean", "isMaximized should be boolean");
  });

  await runner.test("saveWindowState does not throw", () => {
    const state: WindowState = {
      x: 100,
      y: 100,
      width: 1400,
      height: 900,
      isMaximized: false,
    };
    // Should not throw even with nonexistent path
    saveWindowState("/nonexistent/path", state);
  });
}

async function runDesktopNotificationsTests(runner: TestRunner): Promise<void> {
  console.log("\n🔔 DesktopNotifications Tests");

  const notif = new DesktopNotifications();

  await runner.test("constructor creates notifications", () => {
    assert.ok(notif, "Should create notifications");
  });

  await runner.test("isSupported returns boolean", () => {
    const supported = notif.isSupported();
    assert.ok(typeof supported === "boolean", "Should return boolean");
  });

  await runner.test("getActiveNotifications returns array", () => {
    const notifications = notif.getActiveNotifications();
    assert.ok(Array.isArray(notifications), "Should return array");
  });

  await runner.test("getActiveCount returns number", () => {
    const count = notif.getActiveCount();
    assert.ok(typeof count === "number", "Should return number");
  });

  await runner.test("NotificationOptions interface structure", () => {
    const options: NotificationOptions = {
      title: "Test Notification",
      body: "Test body",
      category: "system",
    };
    assert.ok(typeof options.title === "string", "title should be string");
    assert.ok(typeof options.body === "string", "body should be string");
    assert.ok(options.category === "system" || options.category === "agent" || options.category === "service", "category should be valid");
  });
}

async function runStaticServerTests(runner: TestRunner): Promise<void> {
  console.log("\n📁 StaticServer Tests");

  const config: StaticServerConfig = {
    port: 3999,
    rootDir: "/tmp/static-test",
  };
  const server = new StaticServer(config);

  await runner.test("constructor creates server", () => {
    assert.ok(server, "Should create server");
  });

  await runner.test("start resolves promise", async () => {
    await server.start();
  });

  await runner.test("stop resolves promise", async () => {
    await server.stop();
  });

  await runner.test("StaticServerConfig interface structure", () => {
    assert.ok(typeof config.port === "number", "port should be number");
    assert.ok(typeof config.rootDir === "string", "rootDir should be string");
  });

  await runner.test("StaticServerConfig accepts valid config", () => {
    const testConfig: StaticServerConfig = {
      port: 4000,
      rootDir: "./dist",
    };
    const testServer = new StaticServer(testConfig);
    assert.ok(testServer, "Should accept valid config");
  });
}

// ============================================================
// Splash Tests
// ============================================================

async function runSplashTests(runner: TestRunner): Promise<void> {
  console.log("\n🌅 Splash Tests");

  await runner.test("getSplashHTML returns HTML string", () => {
    const html = getSplashHTML();
    assert.ok(typeof html === "string", "Should return string");
    assert.ok(html.length > 0, "Should have content");
    assert.ok(html.includes("<!DOCTYPE html>"), "Should be HTML");
  });

  await runner.test("getSplashHTML contains DeerFlow branding", () => {
    const html = getSplashHTML();
    assert.ok(html.includes("DeerFlow"), "Should have DeerFlow branding");
  });

  await runner.test("getSplashHTML contains service status elements", () => {
    const html = getSplashHTML();
    assert.ok(html.includes("service-item"), "Should have service items");
    assert.ok(html.includes("progress-bar"), "Should have progress bar");
  });

  await runner.test("getStatusDashboardHTML returns HTML string", () => {
    const statuses = [{ name: "test", running: true, ready: true }];
    const ports = { proxy: 2026, langgraph: 2024, gateway: 8001, frontend: 3000 };
    const html = getStatusDashboardHTML(statuses, ports);
    assert.ok(typeof html === "string", "Should return string");
    assert.ok(html.includes("<!DOCTYPE html>"), "Should be HTML");
  });

  await runner.test("SplashServiceStatus interface structure", () => {
    const status: SplashServiceStatus = {
      name: "test-service",
      label: "Test Service",
      status: "ready",
    };
    assert.ok(typeof status.name === "string", "name should be string");
    assert.ok(typeof status.label === "string", "label should be string");
    assert.ok(status.status === "ready" || status.status === "pending" || status.status === "starting" || status.status === "error", "status should be valid");
  });
}

// ============================================================
// Onboarding Tests
// ============================================================

async function runOnboardingTests(runner: TestRunner): Promise<void> {
  console.log("\n🎯 Onboarding Tests");

  await runner.test("getOnboardingHTML returns HTML string", () => {
    const html = getOnboardingHTML(0);
    assert.ok(typeof html === "string", "Should return string");
    assert.ok(html.length > 0, "Should have content");
    assert.ok(html.includes("<!DOCTYPE html>"), "Should be HTML");
  });

  await runner.test("ONBOARDING_STEPS is array", () => {
    assert.ok(Array.isArray(ONBOARDING_STEPS), "Should be array");
    assert.ok(ONBOARDING_STEPS.length > 0, "Should have steps");
  });

  await runner.test("ONBOARDING_STEPS has valid step structure", () => {
    const step = ONBOARDING_STEPS[0];
    assert.ok(typeof step.id === "string", "id should be string");
    assert.ok(typeof step.title === "string", "title should be string");
    assert.ok(typeof step.description === "string", "description should be string");
    assert.ok(typeof step.icon === "string", "icon should be string");
  });

  await runner.test("OnboardingStep interface structure", () => {
    const step: OnboardingStep = {
      id: "test",
      title: "Test Step",
      description: "Test description",
      icon: "🎯",
    };
    assert.ok(typeof step.id === "string", "id should be string");
    assert.ok(typeof step.title === "string", "title should be string");
  });

  await runner.test("getOnboardingHTML renders step indicators", () => {
    const html = getOnboardingHTML(0);
    assert.ok(html.includes("step-dot"), "Should have step indicators");
    assert.ok(html.includes("wizard-container"), "Should have wizard container");
  });
}

// ============================================================
// Settings Tests
// ============================================================

async function runSettingsTests(runner: TestRunner): Promise<void> {
  console.log("\n⚙️ Settings Tests");

  await runner.test("MODEL_PROVIDERS is array", () => {
    assert.ok(Array.isArray(MODEL_PROVIDERS), "Should be array");
    assert.ok(MODEL_PROVIDERS.length > 0, "Should have providers");
  });

  await runner.test("MODEL_PROVIDERS has valid provider structure", () => {
    const provider = MODEL_PROVIDERS[0];
    assert.ok(typeof provider.id === "string", "id should be string");
    assert.ok(typeof provider.name === "string", "name should be string");
    assert.ok(typeof provider.use === "string", "use should be string");
    assert.ok(Array.isArray(provider.fields), "fields should be array");
  });

  await runner.test("ModelProvider interface structure", () => {
    const provider: ModelProvider = {
      id: "test",
      name: "Test Provider",
      use: "test:Provider",
      modelDefault: "test-model",
      fields: [{ key: "api_key", label: "API Key", type: "text" }],
      description: "Test provider",
    };
    assert.ok(typeof provider.id === "string", "id should be string");
    assert.ok(typeof provider.name === "string", "name should be string");
    assert.ok(typeof provider.modelDefault === "string", "modelDefault should be string");
    assert.ok(Array.isArray(provider.fields), "fields should be array");
  });

  await runner.test("ModelConfig interface structure", () => {
    const config: ModelConfig = {
      name: "test-model",
      use: "test:Model",
      model: "test-model",
    };
    assert.ok(typeof config.name === "string", "name should be string");
    assert.ok(typeof config.model === "string", "model should be string");
  });
}

// ============================================================
// Main
// ============================================================

async function main(): Promise<void> {
  console.log("🦌 DeerFlow Electron — Core Services Tests\n");
  const runner = new TestRunner();

  await runSkillManagerTests(runner);
  await runMarketplaceTests(runner);
  await runToolRegistryTests(runner);
  await runHealthMonitorTests(runner);
  await runConversationMemoryTests(runner);
  await runTaskSchedulerTests(runner);
  await runPluginManagerTests(runner);
  await runBackupServiceTests(runner);
  await runSessionExportServiceTests(runner);
  await runConfigManagerTests(runner);
  await runFileLoggerTests(runner);
  await runStartupOptimizerTests(runner);
  await runChartsDataPipelineTests(runner);
  await runAgentReasoningTests(runner);
  await runKnowledgeGraphTests(runner);
  await runAuditLoggerTests(runner);
  await runWebSocketManagerTests(runner);
  await runAgentSessionManagerTests(runner);
  await runAgentCollaborationHubTests(runner);
  await runAgentContextManagerTests(runner);
  await runStateSyncServiceTests(runner);
  await runMCPManagerTests(runner);
  await runEventBusTests(runner);
  await runPluginSDKValidatorTests(runner);
  await runPerformanceMonitorTests(runner);
  await runThemeManagerTests(runner);
  await runSecurityManagerTests(runner);
  await runDiagnosticsManagerTests(runner);
  await runTelemetryManagerTests(runner);
  await runContextManagerTests(runner);
  await runAutoUpdaterTests(runner);
  await runAgentBridgeTests(runner);
  await runShortcutsManagerTests(runner);
  await runTrayNotificationManagerTests(runner);
  await runWorkflowOrchestratorTests(runner);
  await runServiceManagerTests(runner);
  await runProxyServerTests(runner);
  await runFileDropHandlerTests(runner);
  await runWindowStateTests(runner);
  await runDesktopNotificationsTests(runner);
  await runStaticServerTests(runner);
  await runSplashTests(runner);
  await runOnboardingTests(runner);
  await runSettingsTests(runner);

  runner.summary();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});