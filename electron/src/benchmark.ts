/**
 * Performance Benchmark Module for DeerFlow Electron
 *
 * Provides benchmarking utilities for measuring operation performance.
 * Useful for CI/CD performance regression testing.
 *
 * Run: npx ts-node electron/src/benchmark.ts
 */

import * as fs from "fs";
import * as path from "path";

export interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
  memoryUsed?: number;
}

export interface BenchmarkOptions {
  iterations?: number;
  warmup?: number;
  skipWarmup?: boolean;
  memoryTracking?: boolean;
}

const DEFAULT_OPTIONS: Required<BenchmarkOptions> = {
  iterations: 100,
  warmup: 10,
  skipWarmup: false,
  memoryTracking: true,
};

/**
 * BenchmarkRunner - Performance benchmarking utility
 */
export class BenchmarkRunner {
  private results: Map<string, BenchmarkResult> = new Map();

  /**
   * Add a benchmark result directly
   */
  addResult(result: BenchmarkResult): void {
    this.results.set(result.name, result);
  }

  /**
   * Run a benchmark for a given operation
   */
  async run(
    name: string,
    operation: () => void | Promise<void>,
    options: BenchmarkOptions = {}
  ): Promise<BenchmarkResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const times: number[] = [];

    // Warmup runs (not counted)
    if (!opts.skipWarmup) {
      for (let i = 0; i < opts.warmup; i++) {
        await operation();
      }
    }

    // Measured runs
    for (let i = 0; i < opts.iterations; i++) {
      const start = Date.now();
      await operation();
      const elapsed = Date.now() - start;
      times.push(elapsed);
    }

    // Calculate statistics
    const totalTime = times.reduce((a, b) => a + b, 0);
    const averageTime = totalTime / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const opsPerSecond = 1000 / averageTime;

    // Memory tracking
    let memoryUsed: number | undefined;
    if (opts.memoryTracking && typeof process !== "undefined") {
      const memUsage = process.memoryUsage();
      memoryUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
    }

    const result: BenchmarkResult = {
      name,
      iterations: opts.iterations,
      totalTime,
      averageTime: Math.round(averageTime * 100) / 100,
      minTime,
      maxTime,
      opsPerSecond: Math.round(opsPerSecond),
      memoryUsed,
    };

    this.results.set(name, result);
    return result;
  }

  /**
   * Get a specific benchmark result
   */
  getResult(name: string): BenchmarkResult | undefined {
    return this.results.get(name);
  }

  /**
   * Get all benchmark results
   */
  getAllResults(): BenchmarkResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Compare two benchmark results
   */
  compare(a: string, b: string): {
    nameA: string;
    nameB: string;
    speedup: number;
    faster: string;
  } | null {
    const resultA = this.results.get(a);
    const resultB = this.results.get(b);

    if (!resultA || !resultB) {
      return null;
    }

    const speedup = resultA.averageTime / resultB.averageTime;
    return {
      nameA: a,
      nameB: b,
      speedup: Math.round(speedup * 100) / 100,
      faster: speedup > 1 ? b : a,
    };
  }

  /**
   * Export results as JSON
   */
  toJSON(): string {
    return JSON.stringify(this.getAllResults(), null, 2);
  }

  /**
   * Export results as markdown table
   */
  toMarkdown(): string {
    const results = this.getAllResults();
    let md = `# Benchmark Results\n\n`;

    if (results.length === 0) {
      return md + "No benchmarks run yet.\n";
    }

    md += `| Benchmark | Iterations | Avg Time (ms) | Min | Max | Ops/sec | Memory (MB) |\n`;
    md += `|----------|------------|--------------|-----|-----|---------|-------------|\n`;

    for (const r of results) {
      md += `| ${r.name} | ${r.iterations} | ${r.averageTime} | ${r.minTime} | ${r.maxTime} | ${r.opsPerSecond} | ${r.memoryUsed ?? "-"} |\n`;
    }

    return md;
  }
}

// ============================================================
// Built-in Benchmarks
// ============================================================

/**
 * Run built-in benchmarks for DeerFlow services
 */
export async function runBuiltInBenchmarks(): Promise<BenchmarkRunner> {
  const runner = new BenchmarkRunner();

  console.log("\n⚡ Running Built-in Benchmarks...\n");

  // Benchmark: SkillManager constructor
  const { SkillManager } = await import("./skill-manager");
  await runner.run("SkillManager constructor", () => {
    new SkillManager(process.cwd());
  });
  console.log(`  ✅ SkillManager: ${runner.getResult("SkillManager constructor")?.averageTime}ms avg`);

  // Benchmark: ConfigManager constructor
  const { ConfigManager } = await import("./config-manager");
  await runner.run("ConfigManager constructor", () => {
    new ConfigManager(process.cwd());
  });
  console.log(`  ✅ ConfigManager: ${runner.getResult("ConfigManager constructor")?.averageTime}ms avg`);

  // Benchmark: FileLogger constructor
  const { FileLogger } = await import("./logger");
  await runner.run("FileLogger constructor", () => {
    new FileLogger("benchmark");
  }, { iterations: 50 });
  console.log(`  ✅ FileLogger: ${runner.getResult("FileLogger constructor")?.averageTime}ms avg`);

  // Benchmark: JSON parsing
  const testData = JSON.stringify({ a: 1, b: "test", c: [1, 2, 3] });
  await runner.run("JSON.parse", () => {
    JSON.parse(testData);
  }, { iterations: 1000 });
  console.log(`  ✅ JSON.parse: ${runner.getResult("JSON.parse")?.averageTime}ms avg`);

  // Benchmark: String template
  const template = "Hello {{name}}, welcome to {{place}}!";
  await runner.run("String replace", () => {
    template.replace("{{name}}", "User").replace("{{place}}", "DeerFlow");
  }, { iterations: 1000 });
  console.log(`  ✅ String replace: ${runner.getResult("String replace")?.averageTime}ms avg`);

  return runner;
}

// ============================================================
// Extended Benchmarks (File I/O)
// ============================================================

/**
 * Run extended benchmarks including file I/O operations
 */
export async function runExtendedBenchmarks(): Promise<BenchmarkRunner> {
  const runner = new BenchmarkRunner();
  const tempDir = path.join(process.cwd(), ".benchmark-temp");

  // Ensure temp directory exists
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  console.log("\n⚡ Running Extended Benchmarks...\n");

  const testContent = "Benchmark test content " + "x".repeat(1000);
  const testFile = path.join(tempDir, "bench-test.txt");

  // Benchmark: File write
  await runner.run("File write (1KB)", async () => {
    fs.writeFileSync(testFile, testContent);
  }, { iterations: 100 });
  console.log(`  ✅ File write: ${runner.getResult("File write (1KB)")?.averageTime}ms avg`);

  // Benchmark: File read
  await runner.run("File read (1KB)", () => {
    fs.readFileSync(testFile, "utf-8");
  }, { iterations: 100 });
  console.log(`  ✅ File read: ${runner.getResult("File read (1KB)")?.averageTime}ms avg`);

  // Benchmark: File exists check
  await runner.run("File exists check", () => {
    fs.existsSync(testFile);
  }, { iterations: 500 });
  console.log(`  ✅ File exists: ${runner.getResult("File exists check")?.averageTime}ms avg`);

  // Benchmark: Directory read (list files)
  await runner.run("Directory read", () => {
    fs.readdirSync(tempDir);
  }, { iterations: 200 });
  console.log(`  ✅ Directory read: ${runner.getResult("Directory read")?.averageTime}ms avg`);

  // Benchmark: JSON stringify
  const jsonData = { a: 1, b: "test", c: [1, 2, 3], d: { x: 10, y: 20 } };
  await runner.run("JSON.stringify", () => {
    JSON.stringify(jsonData);
  }, { iterations: 500 });
  console.log(`  ✅ JSON.stringify: ${runner.getResult("JSON.stringify")?.averageTime}ms avg`);

  // Benchmark: Object clone (structuredClone)
  await runner.run("Object clone", () => {
    structuredClone(jsonData);
  }, { iterations: 500 });
  console.log(`  ✅ Object clone: ${runner.getResult("Object clone")?.averageTime}ms avg`);

  // Cleanup
  fs.unlinkSync(testFile);

  return runner;
}

// ============================================================
// CLI
// ============================================================

/**
 * Main CLI entry point - runs all benchmarks and generates reports
 */
export async function runAllBenchmarks(): Promise<BenchmarkRunner> {
  console.log("⚡ DeerFlow Electron — Performance Benchmark\n");

  const runner = await runBuiltInBenchmarks();
  const extendedRunner = await runExtendedBenchmarks();

  // Merge extended results into main runner
  for (const result of extendedRunner.getAllResults()) {
    runner.addResult(result);
  }

  return runner;
}

/**
 * Generate combined report with TestReporter integration
 */
export function generateReport(runner: BenchmarkRunner): {
  json: string;
  markdown: string;
  summary: {
    totalBenchmarks: number;
    avgTime: number;
    fastest: string;
    slowest: string;
  };
} {
  const results = runner.getAllResults();
  const times = results.map((r) => r.averageTime);

  const summary = {
    totalBenchmarks: results.length,
    avgTime: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length * 100) / 100 : 0,
    fastest: results.length > 0 ? results.reduce((a, b) => (a.averageTime < b.averageTime ? a : b)).name : "-",
    slowest: results.length > 0 ? results.reduce((a, b) => (a.averageTime > b.averageTime ? a : b)).name : "-",
  };

  return {
    json: runner.toJSON(),
    markdown: runner.toMarkdown(),
    summary,
  };
}

// CLI mode
if (require.main === module) {
  runAllBenchmarks().then((runner) => {
    console.log("\n" + "=".repeat(50));
    console.log("📊 Benchmark Report");
    console.log("=".repeat(50));

    const report = generateReport(runner);

    console.log("\n📋 JSON Report:");
    console.log(report.json);

    console.log("\n📝 Markdown Report:");
    console.log(report.markdown);

    console.log("\n📈 Summary:");
    console.log(`  Total Benchmarks: ${report.summary.totalBenchmarks}`);
    console.log(`  Average Time: ${report.summary.avgTime}ms`);
    console.log(`  Fastest: ${report.summary.fastest}`);
    console.log(`  Slowest: ${report.summary.slowest}`);
  });
}