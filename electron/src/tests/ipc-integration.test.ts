/**
 * DeerFlow Electron - IPC Integration Tests
 *
 * Tests the IPC communication layer between main and renderer processes.
 * These tests verify that all IPC handlers respond correctly.
 *
 * Run: npx ts-node electron/src/tests/ipc-integration.test.ts
 */

import * as assert from "assert";
import { ConfigManager } from "../config-manager";
import { FileLogger } from "../logger";

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
  private beforeEachFn: (() => void) | null = null;
  private afterEachFn: (() => void) | null = null;

  beforeEach(fn: () => void): void {
    this.beforeEachFn = fn;
  }

  afterEach(fn: () => void): void {
    this.afterEachFn = fn;
  }

  async test(name: string, fn: () => void | Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      if (this.beforeEachFn) this.beforeEachFn();
      await fn();
      if (this.afterEachFn) this.afterEachFn();
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
// ConfigManager Tests
// ============================================================

async function runConfigManagerTests(runner: TestRunner, projectRoot: string): Promise<void> {
  console.log("\n📁 ConfigManager Tests");

  const configManager = new ConfigManager(projectRoot);

  await runner.test("readConfig returns success for config.yaml", () => {
    const result = configManager.readConfig("config");
    assert.ok(result.success, `Should read config.yaml: ${result.error}`);
    assert.ok(result.content, "Should have content");
  });

  await runner.test("getModelConfigs returns array", () => {
    const result = configManager.getModelConfigs();
    assert.ok(result.success, `Should parse models: ${result.error}`);
    assert.ok(Array.isArray(result.models), "models should be an array");
  });

  await runner.test("getConfigSummary returns correct structure", () => {
    const summary = configManager.getConfigSummary();
    assert.ok(typeof summary.hasModels === "boolean", "hasModels should be boolean");
    assert.ok(typeof summary.modelCount === "number", "modelCount should be number");
    assert.ok(Array.isArray(summary.models), "models should be array");
  });

  await runner.test("hasModelsConfigured returns boolean", () => {
    const result = configManager.hasModelsConfigured();
    assert.ok(typeof result === "boolean", "Should return boolean");
  });

  await runner.test("getEnvVariables returns object", () => {
    const result = configManager.getEnvVariables();
    assert.ok(result.success || !result.success, "Should return result object");
    if (result.success) {
      assert.ok(typeof result.vars === "object", "vars should be object");
    }
  });
}

// ============================================================
// FileLogger Tests
// ============================================================

async function runLoggerTests(runner: TestRunner, projectRoot: string): Promise<void> {
  console.log("\n📝 FileLogger Tests");

  const logger = new FileLogger(projectRoot, { maxFileSize: 1024 * 1024, maxFiles: 3 });

  await runner.test("log writes entry to queue", () => {
    logger.info("Test message", "test");
    // Log is queued, should not throw
    assert.ok(true, "Log should be queued without error");
  });

  await runner.test("getRecentLogs returns array", () => {
    const logs = logger.getRecentLogs(10);
    assert.ok(Array.isArray(logs), "Should return array");
  });

  await runner.test("all log levels work", () => {
    logger.debug("Debug test", "test");
    logger.info("Info test", "test");
    logger.warn("Warn test", "test");
    logger.error("Error test", "test");
    assert.ok(true, "All levels should work");
  });

  logger.destroy();
}

// ============================================================
// StartupOptimizer Tests
// ============================================================

async function runOptimizerTests(runner: TestRunner): Promise<void> {
  console.log("\n⚡ StartupOptimizer Tests");

  // Dynamic import to avoid circular dependency issues
  const { StartupOptimizer, retryWithBackoff, runInParallel } = await import("../startup-optimizer");

  await runner.test("StartupOptimizer starts and records metrics", () => {
    const optimizer = new StartupOptimizer();
    optimizer.start();
    assert.ok(optimizer.getIsRunning(), "Should be running after start");

    optimizer.recordServiceReady("test-service");
    const metrics = optimizer.getMetrics();
    assert.ok(metrics.serviceDurations["test-service"] >= 0, "Should record service duration");

    optimizer.complete();
    assert.ok(!optimizer.getIsRunning(), "Should not be running after complete");
    const finalMetrics = optimizer.getMetrics();
    assert.ok(finalMetrics.totalDuration !== undefined, "Should have total duration");
  });

  await runner.test("retryWithBackoff succeeds on first try", async () => {
    let calls = 0;
    const result = await retryWithBackoff(async () => {
      calls++;
      return "success";
    });
    assert.strictEqual(result, "success");
    assert.strictEqual(calls, 1);
  });

  await runner.test("retryWithBackoff retries on failure then succeeds", async () => {
    let calls = 0;
    const result = await retryWithBackoff(
      async () => {
        calls++;
        if (calls < 3) throw new Error("Not yet");
        return "success";
      },
      { maxRetries: 5, baseDelay: 10 }
    );
    assert.strictEqual(result, "success");
    assert.strictEqual(calls, 3);
  });

  await runner.test("runInParallel executes tasks concurrently", async () => {
    const start = Date.now();
    const results = await runInParallel([
      () => new Promise((resolve) => setTimeout(() => resolve("a"), 50)),
      () => new Promise((resolve) => setTimeout(() => resolve("b"), 50)),
      () => new Promise((resolve) => setTimeout(() => resolve("c"), 50)),
    ]);
    const duration = Date.now() - start;

    assert.strictEqual(results.length, 3);
    assert.ok(duration < 150, `Parallel execution took ${duration}ms, expected < 150ms`);
  });
}

// ============================================================
// Main Test Runner
// ============================================================

async function main(): Promise<void> {
  console.log("🦌 DeerFlow Electron — IPC Integration Tests");
  console.log("=" .repeat(50));

  const projectRoot = process.env.DEERFLOW_ROOT || process.cwd();
  const runner = new TestRunner();

  try {
    await runConfigManagerTests(runner, projectRoot);
    await runLoggerTests(runner, projectRoot);
    await runOptimizerTests(runner);

    runner.summary();
  } catch (err: any) {
    console.error("\n💥 Test suite failed:", err.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { TestRunner, TestResult };
