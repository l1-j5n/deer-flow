/**
 * Test Reporter for DeerFlow Electron
 *
 * Generates structured test reports for CI/CD pipelines.
 *
 * Run: npx ts-node electron/src/test-reporter.ts
 */

export interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

export interface TestSuiteResult {
  name: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  results: TestResult[];
}

export interface TestReport {
  timestamp: string;
  totalSuites: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  suites: TestSuiteResult[];
}

/**
 * TestReporter - Generates structured test reports
 */
export class TestReporter {
  private suites: TestSuiteResult[] = [];
  private currentSuite: TestSuiteResult | null = null;

  /**
   * Start a new test suite
   */
  startSuite(name: string): void {
    this.currentSuite = {
      name,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      duration: 0,
      results: [],
    };
  }

  /**
   * Add a test result to the current suite
   */
  addResult(result: TestResult): void {
    if (!this.currentSuite) {
      throw new Error("No active test suite. Call startSuite() first.");
    }
    this.currentSuite.results.push(result);
    this.currentSuite.totalTests++;
    if (result.passed) {
      this.currentSuite.passedTests++;
    } else {
      this.currentSuite.failedTests++;
    }
    this.currentSuite.duration += result.duration;
  }

  /**
   * End the current test suite
   */
  endSuite(): void {
    if (!this.currentSuite) {
      throw new Error("No active test suite. Call startSuite() first.");
    }
    this.suites.push(this.currentSuite);
    this.currentSuite = null;
  }

  /**
   * Generate the final report
   */
  generateReport(): TestReport {
    const timestamp = new Date().toISOString();
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let duration = 0;

    for (const suite of this.suites) {
      totalTests += suite.totalTests;
      passedTests += suite.passedTests;
      failedTests += suite.failedTests;
      duration += suite.duration;
    }

    return {
      timestamp,
      totalSuites: this.suites.length,
      totalTests,
      passedTests,
      failedTests,
      duration,
      suites: this.suites,
    };
  }

  /**
   * Get summary statistics
   */
  getStats(): {
    totalSuites: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;
  } {
    const report = this.generateReport();
    const passRate = report.totalTests > 0
      ? (report.passedTests / report.totalTests) * 100
      : 0;

    return {
      totalSuites: report.totalSuites,
      totalTests: report.totalTests,
      passedTests: report.passedTests,
      failedTests: report.failedTests,
      passRate: Math.round(passRate * 100) / 100,
    };
  }

  /**
   * Export report as JSON string
   */
  toJSON(): string {
    return JSON.stringify(this.generateReport(), null, 2);
  }

  /**
   * Export summary as markdown
   */
  toMarkdown(): string {
    const stats = this.getStats();
    const report = this.generateReport();

    let md = `# Test Report\n\n`;
    md += `**Generated:** ${report.timestamp}\n\n`;
    md += `## Summary\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Test Suites | ${stats.totalSuites} |\n`;
    md += `| Total Tests | ${stats.totalTests} |\n`;
    md += `| Passed | ${stats.passedTests} |\n`;
    md += `| Failed | ${stats.failedTests} |\n`;
    md += `| Pass Rate | ${stats.passRate}% |\n`;
    md += `| Duration | ${stats.totalTests}ms |\n\n`;

    if (report.suites.length > 0) {
      md += `## Suites\n\n`;
      md += `| Suite | Total | Passed | Failed | Duration |\n`;
      md += `|-------|-------|--------|--------|----------|\n`;
      for (const suite of report.suites) {
        md += `| ${suite.name} | ${suite.totalTests} | ${suite.passedTests} | ${suite.failedTests} | ${suite.duration}ms |\n`;
      }
    }

    return md;
  }
}

// ============================================================
// CLI
// ============================================================

if (require.main === module) {
  console.log("🦌 Test Reporter - Demo\n");

  // Create a demo reporter
  const reporter = new TestReporter();

  // Add some test suites
  reporter.startSuite("Core Services");
  reporter.addResult({ name: "test1", passed: true, duration: 10 });
  reporter.addResult({ name: "test2", passed: true, duration: 20 });
  reporter.addResult({ name: "test3", passed: false, duration: 5, error: "Assertion failed" });
  reporter.endSuite();

  reporter.startSuite("E2E Tests");
  reporter.addResult({ name: "e2e1", passed: true, duration: 100 });
  reporter.addResult({ name: "e2e2", passed: true, duration: 150 });
  reporter.endSuite();

  // Generate and print reports
  console.log("\n📊 Stats:");
  console.log(reporter.getStats());

  console.log("\n📋 JSON:");
  console.log(reporter.toJSON());

  console.log("\n📝 Markdown:");
  console.log(reporter.toMarkdown());
}