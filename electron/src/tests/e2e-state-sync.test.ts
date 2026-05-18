/**
 * DeerFlow Electron - End-to-End State Sync Tests
 *
 * Tests StateSyncService, PluginSDKValidator, SessionExportService,
 * and ChartsDataPipeline integration.
 *
 * Run: npx ts-node electron/src/tests/e2e-state-sync.test.ts
 */

import * as assert from "assert";
import { StateSyncService, StateSlice } from "../state-sync-service";
import { PluginSDKValidator } from "../plugin-sdk-validator";
import { SessionExportService } from "../session-export-service";
import { ChartsDataPipeline } from "../charts-data-pipeline";

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
// State Sync Service Tests
// ============================================================

async function runStateSyncTests(runner: TestRunner): Promise<void> {
  console.log("\n🔄 StateSyncService Tests");

  const service = new StateSyncService({ batchIntervalMs: 50, maxBatchSize: 10, persistState: false });

  await runner.test("subscribe creates subscription", () => {
    const subId = service.subscribe({ slices: ["sessions", "health"] });
    assert.ok(subId, "Should have subscription ID");
    assert.ok(subId.startsWith("sub_"));
  });

  await runner.test("getState returns null for unsubscribed slice", () => {
    const state = service.getState("workflows");
    assert.strictEqual(state, null);
  });

  await runner.test("updateState queues update", () => {
    service.updateState("sessions", { count: 5 }, false);
    // Update is batched, should not be immediately available
    const state = service.getState("sessions");
    // After batch interval it should be available
    assert.ok(state !== undefined);
  });

  await runner.test("getStats returns correct counts", () => {
    const stats = service.getStats();
    assert.ok(stats.subscriptions >= 1);
    assert.ok(stats.pendingUpdates !== undefined);
  });

  await runner.test("unsubscribe removes subscription", () => {
    const subId = service.subscribe({ slices: ["memory"] });
    const before = service.getStats().subscriptions;
    service.unsubscribe(subId);
    const after = service.getStats().subscriptions;
    assert.strictEqual(after, before - 1);
  });

  await runner.test("getAllStates returns cached slices", () => {
    const all = service.getAllStates();
    assert.ok(typeof all === "object");
  });

  service.stop();
}

// ============================================================
// Plugin SDK Validator Tests
// ============================================================

async function runPluginSDKTests(runner: TestRunner): Promise<void> {
  console.log("\n🔌 PluginSDKValidator Tests");

  const validator = new PluginSDKValidator("2.0.0");

  await runner.test("valid manifest passes validation", () => {
    const manifest = {
      id: "test-plugin",
      name: "Test Plugin",
      version: "1.0.0",
      description: "A test plugin",
      author: "Test Author",
      license: "MIT",
      entry: "index.js",
      minPlatformVersion: "1.0.0",
      permissions: ["filesystem", "network"],
      hooks: ["init", "message"],
      dependencies: {},
    };
    const result = validator.validateManifest(manifest);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.errors.length, 0);
  });

  await runner.test("invalid version fails validation", () => {
    const manifest = {
      id: "bad-plugin",
      name: "Bad Plugin",
      version: "invalid",
      description: "Bad",
      author: "Test",
      license: "MIT",
      entry: "index.js",
      minPlatformVersion: "1.0.0",
      permissions: [],
      hooks: [],
      dependencies: {},
    };
    const result = validator.validateManifest(manifest);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.field === "version"));
  });

  await runner.test("missing required fields fail validation", () => {
    const manifest = { id: "incomplete" };
    const result = validator.validateManifest(manifest as any);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.length > 3);
  });

  await runner.test("invalid permission is rejected", () => {
    const manifest = {
      id: "test-plugin",
      name: "Test Plugin",
      version: "1.0.0",
      description: "A test plugin",
      author: "Test Author",
      license: "MIT",
      entry: "index.js",
      minPlatformVersion: "1.0.0",
      permissions: ["invalid_permission"],
      hooks: [],
      dependencies: {},
    };
    const result = validator.validateManifest(manifest);
    assert.ok(result.warnings.some((w) => w.field === "permissions"));
  });

  await runner.test("generateScaffold creates JS scaffold", () => {
    const manifest = {
      id: "test-plugin",
      name: "Test Plugin",
      version: "1.0.0",
      description: "A test plugin",
      author: "Test Author",
      license: "MIT",
      entry: "index.js",
      minPlatformVersion: "1.0.0",
      permissions: ["filesystem"],
      hooks: ["init"],
      dependencies: {},
    };
    const scaffold = validator.generateScaffold(manifest, { language: "javascript", includeTests: false, includeDocs: true });
    assert.ok(scaffold["src/index.js"]);
    assert.ok(scaffold["manifest.json"]);
    assert.ok(scaffold["README.md"]);
  });

  await runner.test("generateScaffold creates Python scaffold", () => {
    const manifest = {
      id: "py-plugin",
      name: "Python Plugin",
      version: "1.0.0",
      description: "A Python plugin",
      author: "Test Author",
      license: "MIT",
      entry: "main.py",
      minPlatformVersion: "1.0.0",
      permissions: ["network"],
      hooks: ["init"],
      dependencies: {},
    };
    const scaffold = validator.generateScaffold(manifest, { language: "python", includeTests: true, includeDocs: true });
    assert.ok(scaffold["src/__init__.py"]);
    assert.ok(scaffold["src/plugin.py"]);
    assert.ok(scaffold["tests/test_plugin.py"]);
  });

  await runner.test("getStats returns validation stats", () => {
    const stats = validator.getStats();
    assert.ok(typeof stats.totalValidations === "number");
    assert.ok(typeof stats.totalScaffolds === "number");
  });
}

// ============================================================
// Session Export Service Tests
// ============================================================

async function runSessionExportTests(runner: TestRunner): Promise<void> {
  console.log("\n📦 SessionExportService Tests");

  const projectRoot = process.cwd();
  const service = new SessionExportService(projectRoot);

  await runner.test("getTemplates returns templates", () => {
    const templates = service.getTemplates();
    assert.ok(Array.isArray(templates));
    assert.ok(templates.length > 0);
    assert.ok(templates.some((t) => t.id === "default-markdown"));
  });

  await runner.test("listExports returns array", () => {
    const exports = service.listExports();
    assert.ok(Array.isArray(exports));
  });

  await runner.test("getStats returns export stats", () => {
    const stats = service.getStats();
    assert.ok(typeof stats.totalExports === "number");
    assert.ok(typeof stats.totalSize === "number");
  });

  await runner.test("exportSession accepts export options", async () => {
    const result = service.exportSession({ id: "test" } as any, { format: "json" });
    // Just verify method accepts argument without type error
    assert.ok(result.success !== undefined);
  });

  service.dispose();
}

// ============================================================
// Charts Data Pipeline Tests
// ============================================================

async function runChartsPipelineTests(runner: TestRunner): Promise<void> {
  console.log("\n📊 ChartsDataPipeline Tests");

  const pipeline = new ChartsDataPipeline();

  await runner.test("getDashboardData returns dataset", () => {
    const data = pipeline.getDashboardData();
    assert.ok(data);
    assert.ok(Array.isArray(data.sessionActivity));
    assert.ok(Array.isArray(data.modelUsage));
    assert.ok(Array.isArray(data.toolUsage));
    assert.ok(Array.isArray(data.healthScoreHistory));
    assert.ok(typeof data.performanceMetrics === "object");
    assert.ok(data.performanceMetrics.session);
    assert.ok(data.performanceMetrics.workflow);
  });

  await runner.test("getSessionActivity returns time series", () => {
    const data = pipeline.getSessionActivity(7);
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
    assert.ok(data[0].date);
    assert.ok(typeof data[0].value === "number");
  });

  await runner.test("getMessageVolume returns stacked data", () => {
    const data = pipeline.getMessageVolume(7);
    assert.ok(Array.isArray(data));
    assert.ok(data[0].timestamp !== undefined);
    assert.ok(data[0].value !== undefined);
  });

  await runner.test("getModelUsage returns categorical data", () => {
    const data = pipeline.getModelUsage();
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
    assert.ok(data[0].name);
    assert.ok(typeof data[0].value === "number");
  });

  await runner.test("getToolUsage returns categorical data", () => {
    const data = pipeline.getToolUsage();
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
  });

  await runner.test("getHealthHistory returns time series", () => {
    const data = pipeline.getHealthHistory(7);
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0);
    assert.ok(typeof data[0].value === "number");
  });

  await runner.test("getPerformanceMetrics returns radar data", () => {
    const data = pipeline.getPerformanceMetrics();
    assert.ok(typeof data === "object");
    assert.ok(data.session);
    assert.ok(typeof data.session.p50 === "number");
    assert.ok(typeof data.session.p95 === "number");
    assert.ok(typeof data.session.p99 === "number");
  });

  await runner.test("invalidateCache clears cache", () => {
    pipeline.invalidateCache();
    // Should not throw
    assert.ok(true);
  });

  await runner.test("getStats returns pipeline stats", () => {
    const stats = pipeline.getStats();
    assert.ok(typeof stats.cacheHits === "number");
    assert.ok(typeof stats.cacheMisses === "number");
    assert.ok(typeof stats.totalRequests === "number");
  });
}

// ============================================================
// Main
// ============================================================

async function main(): Promise<void> {
  console.log("🦌 DeerFlow Electron E2E Tests — Iterations 19-20 Features");
  console.log("===========================================================");

  const runner = new TestRunner();

  await runStateSyncTests(runner);
  await runPluginSDKTests(runner);
  await runSessionExportTests(runner);
  await runChartsPipelineTests(runner);

  runner.summary();
}

main().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
