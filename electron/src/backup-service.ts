/**
 * Auto-Backup & Restore Service
 *
 * Manages automated and manual backups of DeerFlow data including:
 * - Agent sessions
 * - Workflows
 * - Knowledge graph
 * - Configuration files
 * - Memory stores
 * - Plugin data
 */

import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// Types
// ============================================================

export interface BackupConfig {
  enabled: boolean;
  intervalHours: number;
  maxBackups: number;
  backupPath: string;
  includeSessions: boolean;
  includeWorkflows: boolean;
  includeKnowledgeGraph: boolean;
  includeConfig: boolean;
  includeMemories: boolean;
  includePlugins: boolean;
  compress: boolean;
}

export interface BackupEntry {
  id: string;
  name: string;
  createdAt: string;
  size: number;
  path: string;
  description?: string;
  tags: string[];
  contents: BackupContentInfo[];
  compressed: boolean;
}

export interface BackupContentInfo {
  type: string;
  count: number;
  size: number;
}

export interface BackupStats {
  totalBackups: number;
  totalSize: number;
  oldestBackup?: string;
  newestBackup?: string;
  autoBackupEnabled: boolean;
  nextScheduledBackup?: string;
  lastBackupResult?: "success" | "failed";
  lastBackupTime?: string;
  lastBackupError?: string;
}

export interface RestoreOptions {
  backupId: string;
  targetComponents?: string[];
  mergeStrategy?: "overwrite" | "merge" | "skip";
}

export interface RestoreResult {
  success: boolean;
  restored: string[];
  skipped: string[];
  failed: string[];
  error?: string;
}

// ============================================================
// Backup Service
// ============================================================

export class BackupService extends EventEmitter {
  private config: BackupConfig;
  private backups: Map<string, BackupEntry> = new Map();
  private timer: NodeJS.Timeout | null = null;
  private projectRoot: string;
  private backupDir: string;

  constructor(projectRoot: string, config?: Partial<BackupConfig>) {
    super();
    this.projectRoot = projectRoot;
    this.config = {
      enabled: true,
      intervalHours: 24,
      maxBackups: 10,
      backupPath: path.join(projectRoot, ".deerflow", "backups"),
      includeSessions: true,
      includeWorkflows: true,
      includeKnowledgeGraph: true,
      includeConfig: true,
      includeMemories: true,
      includePlugins: true,
      compress: true,
      ...config,
    };
    this.backupDir = this.config.backupPath;
    this.ensureBackupDir();
    this.loadExistingBackups();
  }

  // ---- Directory Management ----

  private ensureBackupDir(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  private loadExistingBackups(): void {
    if (!fs.existsSync(this.backupDir)) return;
    const entries = fs.readdirSync(this.backupDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metaPath = path.join(this.backupDir, entry.name, "meta.json");
        if (fs.existsSync(metaPath)) {
          try {
            const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
            this.backups.set(meta.id, meta);
          } catch {
            // Skip corrupted meta files
          }
        }
      }
    }
  }

  // ---- Backup Operations ----

  async createBackup(name?: string, description?: string, tags?: string[]): Promise<BackupEntry> {
    const id = `backup-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const backupPath = path.join(this.backupDir, id);
    fs.mkdirSync(backupPath, { recursive: true });

    const contents: BackupContentInfo[] = [];
    let totalSize = 0;

    // Backup sessions
    if (this.config.includeSessions) {
      const result = await this.backupComponent("sessions", backupPath);
      if (result.count > 0) contents.push(result);
      totalSize += result.size;
    }

    // Backup workflows
    if (this.config.includeWorkflows) {
      const result = await this.backupComponent("workflows", backupPath);
      if (result.count > 0) contents.push(result);
      totalSize += result.size;
    }

    // Backup knowledge graph
    if (this.config.includeKnowledgeGraph) {
      const result = await this.backupComponent("knowledge-graph", backupPath);
      if (result.count > 0) contents.push(result);
      totalSize += result.size;
    }

    // Backup config
    if (this.config.includeConfig) {
      const result = await this.backupComponent("config", backupPath);
      if (result.count > 0) contents.push(result);
      totalSize += result.size;
    }

    // Backup memories
    if (this.config.includeMemories) {
      const result = await this.backupComponent("memories", backupPath);
      if (result.count > 0) contents.push(result);
      totalSize += result.size;
    }

    // Backup plugins
    if (this.config.includePlugins) {
      const result = await this.backupComponent("plugins", backupPath);
      if (result.count > 0) contents.push(result);
      totalSize += result.size;
    }

    const entry: BackupEntry = {
      id,
      name: name || `Auto Backup ${new Date().toLocaleString()}`,
      createdAt: timestamp,
      size: totalSize,
      path: backupPath,
      description,
      tags: tags || [],
      contents,
      compressed: false,
    };

    // Write meta file
    fs.writeFileSync(path.join(backupPath, "meta.json"), JSON.stringify(entry, null, 2), "utf-8");

    this.backups.set(id, entry);
    this.cleanupOldBackups();

    this.emit("backup:created", entry);
    this.emit("stats:changed", this.getStats());

    return entry;
  }

  private async backupComponent(type: string, backupPath: string): Promise<BackupContentInfo> {
    const sourceDir = path.join(this.projectRoot, ".deerflow", type);
    const targetDir = path.join(backupPath, type);

    if (!fs.existsSync(sourceDir)) {
      return { type, count: 0, size: 0 };
    }

    fs.mkdirSync(targetDir, { recursive: true });
    this.copyDir(sourceDir, targetDir);

    const files = this.countFiles(targetDir);
    const size = this.calculateDirSize(targetDir);

    return { type, count: files, size };
  }

  private copyDir(src: string, dest: string): void {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        this.copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  private countFiles(dir: string): number {
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        count += this.countFiles(path.join(dir, entry.name));
      } else {
        count++;
      }
    }
    return count;
  }

  private calculateDirSize(dir: string): number {
    let size = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        size += this.calculateDirSize(entryPath);
      } else {
        size += fs.statSync(entryPath).size;
      }
    }
    return size;
  }

  // ---- Restore Operations ----

  async restoreBackup(options: RestoreOptions): Promise<RestoreResult> {
    const backup = this.backups.get(options.backupId);
    if (!backup) {
      return { success: false, restored: [], skipped: [], failed: [], error: "Backup not found" };
    }

    const result: RestoreResult = {
      success: true,
      restored: [],
      skipped: [],
      failed: [],
    };

    const components = options.targetComponents || backup.contents.map((c) => c.type);
    const strategy = options.mergeStrategy || "overwrite";

    for (const component of components) {
      const sourceDir = path.join(backup.path, component);
      const targetDir = path.join(this.projectRoot, ".deerflow", component);

      if (!fs.existsSync(sourceDir)) {
        result.skipped.push(component);
        continue;
      }

      try {
        if (strategy === "overwrite") {
          if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true });
          }
          fs.mkdirSync(targetDir, { recursive: true });
          this.copyDir(sourceDir, targetDir);
        } else if (strategy === "merge") {
          fs.mkdirSync(targetDir, { recursive: true });
          this.mergeDir(sourceDir, targetDir);
        } else if (strategy === "skip") {
          if (fs.existsSync(targetDir)) {
            result.skipped.push(component);
            continue;
          }
          fs.mkdirSync(targetDir, { recursive: true });
          this.copyDir(sourceDir, targetDir);
        }
        result.restored.push(component);
      } catch (err: any) {
        result.failed.push(component);
        result.error = err.message;
      }
    }

    result.success = result.failed.length === 0;
    this.emit("backup:restored", { backupId: options.backupId, result });
    return result;
  }

  private mergeDir(src: string, dest: string): void {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        this.mergeDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  // ---- Backup Management ----

  deleteBackup(id: string): boolean {
    const backup = this.backups.get(id);
    if (!backup) return false;

    try {
      if (fs.existsSync(backup.path)) {
        fs.rmSync(backup.path, { recursive: true });
      }
      this.backups.delete(id);
      this.emit("backup:deleted", id);
      this.emit("stats:changed", this.getStats());
      return true;
    } catch {
      return false;
    }
  }

  getBackup(id: string): BackupEntry | undefined {
    return this.backups.get(id);
  }

  listBackups(): BackupEntry[] {
    return Array.from(this.backups.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  private cleanupOldBackups(): void {
    const backups = this.listBackups();
    if (backups.length > this.config.maxBackups) {
      const toDelete = backups.slice(this.config.maxBackups);
      for (const backup of toDelete) {
        this.deleteBackup(backup.id);
      }
    }
  }

  // ---- Auto Backup ----

  startAutoBackup(): void {
    if (this.timer) return;
    if (!this.config.enabled) return;

    const intervalMs = this.config.intervalHours * 60 * 60 * 1000;
    this.timer = setInterval(async () => {
      try {
        await this.createBackup(
          `Auto Backup ${new Date().toLocaleString()}`,
          "Automatically created backup",
          ["auto"]
        );
        this.emit("auto-backup:success");
      } catch (err: any) {
        this.emit("auto-backup:failed", err.message);
      }
    }, intervalMs);

    this.emit("auto-backup:started", { intervalHours: this.config.intervalHours });
  }

  stopAutoBackup(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.emit("auto-backup:stopped");
    }
  }

  isAutoBackupRunning(): boolean {
    return this.timer !== null;
  }

  // ---- Config ----

  updateConfig(updates: Partial<BackupConfig>): void {
    const wasEnabled = this.config.enabled;
    const wasRunning = this.isAutoBackupRunning();

    this.config = { ...this.config, ...updates };

    if (updates.backupPath) {
      this.backupDir = this.config.backupPath;
      this.ensureBackupDir();
    }

    // Restart auto-backup if config changed
    if (wasRunning && (updates.intervalHours || updates.enabled === false)) {
      this.stopAutoBackup();
      if (this.config.enabled) {
        this.startAutoBackup();
      }
    }

    if (!wasEnabled && this.config.enabled) {
      this.startAutoBackup();
    }

    this.emit("config:updated", this.config);
  }

  getConfig(): BackupConfig {
    return { ...this.config };
  }

  // ---- Stats ----

  getStats(): BackupStats {
    const backups = this.listBackups();
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);

    let nextScheduled: string | undefined;
    if (this.isAutoBackupRunning()) {
      const intervalMs = this.config.intervalHours * 60 * 60 * 1000;
      nextScheduled = new Date(Date.now() + intervalMs).toISOString();
    }

    return {
      totalBackups: backups.length,
      totalSize,
      oldestBackup: backups.length > 0 ? backups[backups.length - 1].createdAt : undefined,
      newestBackup: backups.length > 0 ? backups[0].createdAt : undefined,
      autoBackupEnabled: this.isAutoBackupRunning(),
      nextScheduledBackup: nextScheduled,
    };
  }

  // ---- Export / Import ----

  exportBackup(id: string): { success: boolean; data?: string; error?: string } {
    const backup = this.backups.get(id);
    if (!backup) return { success: false, error: "Backup not found" };

    try {
      const metaPath = path.join(backup.path, "meta.json");
      const data = fs.readFileSync(metaPath, "utf-8");
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  importBackup(data: string): { success: boolean; backup?: BackupEntry; error?: string } {
    try {
      const meta = JSON.parse(data);
      if (!meta.id || !meta.path) {
        return { success: false, error: "Invalid backup metadata" };
      }
      this.backups.set(meta.id, meta);
      this.emit("backup:imported", meta);
      return { success: true, backup: meta };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ---- Lifecycle ----

  destroy(): void {
    this.stopAutoBackup();
    this.removeAllListeners();
  }
}
