#!/usr/bin/env node

/**
 * DeerFlow Electron - Startup Script (v2)
 *
 * Launches the DeerFlow Electron desktop application.
 * Handles TypeScript compilation, environment validation, and Electron process management.
 *
 * Modes:
 *   --dev     Development mode (default): compiles TS, enables dev tools, no sandbox
 *   --prod    Production mode: uses pre-compiled dist-electron/, sandbox enabled
 *
 * IMPORTANT: Unsets ELECTRON_RUN_AS_NODE to ensure Electron
 * runs in application mode (not Node.js mode).
 */

const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT_DIR = __dirname;
const ELECTRON_DIR = path.join(ROOT_DIR, "electron");
const DIST_DIR = path.join(ROOT_DIR, "dist-electron");

// Parse arguments
const args = process.argv.slice(2);
const isProd = args.includes("--prod");
const isDev = !isProd;

console.log("🦌 DeerFlow Electron Launcher");
console.log("━".repeat(40));
console.log(`Mode: ${isProd ? "Production" : "Development"}\n`);

// ============================================================
// Environment Validation
// ============================================================

function validateEnvironment() {
  const issues = [];

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);
  if (majorVersion < 20) {
    issues.push(`Node.js ${nodeVersion} is too old. Requires v20+.`);
  }

  // Check Python (for backend)
  try {
    const pyVersion = execSync("python --version", { encoding: "utf-8", stdio: "pipe" });
    console.log(`✅ Python: ${pyVersion.trim()}`);
  } catch {
    try {
      const py3Version = execSync("python3 --version", { encoding: "utf-8", stdio: "pipe" });
      console.log(`✅ Python: ${py3Version.trim()}`);
    } catch {
      issues.push("Python not found. Backend services require Python 3.12+.");
    }
  }

  // Check pnpm (for frontend)
  try {
    const pnpmVersion = execSync("pnpm --version", { encoding: "utf-8", stdio: "pipe" });
    console.log(`✅ pnpm: ${pnpmVersion.trim()}`);
  } catch {
    issues.push("pnpm not found. Frontend dev server requires pnpm.");
  }

  // Check backend virtual environment
  const venvPath = path.join(ROOT_DIR, "backend", ".venv");
  if (!fs.existsSync(venvPath)) {
    issues.push("Backend virtual environment not found at backend/.venv. Run: make install");
  } else {
    console.log("✅ Backend venv: found");
  }

  // Check config.yaml
  const configPath = path.join(ROOT_DIR, "config.yaml");
  if (!fs.existsSync(configPath)) {
    issues.push("config.yaml not found. Copy from config.example.yaml.");
  } else {
    console.log("✅ config.yaml: found");
  }

  if (issues.length > 0) {
    console.error("\n❌ Environment issues found:");
    issues.forEach((issue) => console.error(`   • ${issue}`));
    console.error("\nRun 'make check' to verify all prerequisites.");
    process.exit(1);
  }

  console.log("✅ All environment checks passed.\n");
}

// ============================================================
// Compilation
// ============================================================

function compileTypeScript() {
  if (isProd) {
    // Production: use pre-compiled dist-electron/
    if (!fs.existsSync(DIST_DIR)) {
      console.error("❌ dist-electron/ not found. Run with --dev first to compile.");
      process.exit(1);
    }
    console.log("📦 Using pre-compiled dist-electron/\n");
    return;
  }

  // Development: compile TypeScript
  const nodeModulesPath = path.join(ELECTRON_DIR, "node_modules");
  if (!fs.existsSync(nodeModulesPath)) {
    console.log("📦 Installing build dependencies...");
    try {
      execSync("npm install", { cwd: ELECTRON_DIR, stdio: "inherit" });
      console.log("✅ Dependencies installed.\n");
    } catch (err) {
      console.error("❌ Failed to install dependencies:", err.message);
      process.exit(1);
    }
  }

  console.log("🔧 Compiling Electron source...");
  try {
    execSync("npx tsc", { cwd: ELECTRON_DIR, stdio: "inherit" });
    console.log("✅ Compilation complete.\n");
  } catch (err) {
    console.error("❌ Compilation failed:", err.message);
    process.exit(1);
  }
}

// ============================================================
// Electron Launch
// ============================================================

function findElectronBinary() {
  // Prefer globally installed Electron, fallback to local
  let electronBin = process.env.LOBSTERAI_ELECTRON_PATH;
  if (electronBin && fs.existsSync(electronBin)) {
    return electronBin;
  }

  const localCmd = path.join(ELECTRON_DIR, "node_modules", ".bin", "electron.cmd");
  const localExe = path.join(ELECTRON_DIR, "node_modules", "electron", "dist", "electron.exe");

  if (fs.existsSync(localCmd)) {
    return localCmd;
  } else if (fs.existsSync(localExe)) {
    return localExe;
  }

  // Try global electron
  try {
    const globalElectron = execSync("where electron", { encoding: "utf-8" }).trim().split("\n")[0];
    if (globalElectron && fs.existsSync(globalElectron)) {
      return globalElectron;
    }
  } catch {
    // ignore
  }

  console.error("❌ Electron binary not found.");
  console.error("   Install locally: cd electron && npm install");
  console.error("   Or globally: npm install -g electron");
  process.exit(1);
}

function launchElectron() {
  const electronBin = findElectronBinary();
  console.log(`🚀 Launching DeerFlow with ${path.basename(electronBin)}`);

  // Build environment - CRITICAL: unset ELECTRON_RUN_AS_NODE
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;

  const electronArgs = [DIST_DIR];

  if (isDev) {
    env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
    electronArgs.push("--no-sandbox");
  }

  const electronProc = spawn(electronBin, electronArgs, {
    cwd: ROOT_DIR,
    stdio: "inherit",
    env: env,
    windowsHide: false,
  });

  electronProc.on("error", (err) => {
    console.error("❌ Failed to start Electron:", err.message);
    process.exit(1);
  });

  electronProc.on("exit", (code) => {
    console.log(`\n🦌 DeerFlow exited with code ${code}`);
    process.exit(code ?? 0);
  });

  // Handle Ctrl+C gracefully
  process.on("SIGINT", () => {
    console.log("\n⏹ Stopping DeerFlow...");
    electronProc.kill("SIGTERM");
  });

  process.on("SIGTERM", () => {
    electronProc.kill("SIGTERM");
  });
}

// ============================================================
// Main
// ============================================================

validateEnvironment();
compileTypeScript();
launchElectron();
