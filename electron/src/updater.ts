/**
 * DeerFlow Electron - Auto Updater
 *
 * Integrates electron-updater for automatic update checking:
 * - Check for updates on startup (with configurable interval)
 * - Show update-available notification
 * - Download updates in background
 * - Prompt user to install when ready
 * - Support for manual check via menu/tray
 */

import { EventEmitter } from "events";

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

export interface UpdaterConfig {
  /** Check for updates on startup */
  checkOnStartup: boolean;
  /** Minimum hours between auto-checks */
  autoCheckIntervalHours: number;
  /** Allow pre-release updates */
  allowPrerelease: boolean;
  /** Silent download (no progress UI) */
  silentDownload: boolean;
}

export class AutoUpdater extends EventEmitter {
  private config: UpdaterConfig;
  private lastCheckTime: number = 0;
  private isChecking = false;
  private isDownloading = false;
  private pendingUpdate: UpdateInfo | null = null;
  private checkTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<UpdaterConfig>) {
    super();
    this.config = {
      checkOnStartup: true,
      autoCheckIntervalHours: 24,
      allowPrerelease: false,
      silentDownload: true,
      ...config,
    };
  }

  /**
   * Initialize the updater
   * Call this after app is ready
   */
  async initialize(): Promise<void> {
    // Note: electron-updater is an optional dependency
    // If not installed, updater features are gracefully disabled
    try {
      // Dynamic import to avoid hard dependency
      const { autoUpdater } = await import("electron-updater");

      // Configure auto-updater
      autoUpdater.allowPrerelease = this.config.allowPrerelease;
      autoUpdater.autoDownload = this.config.silentDownload;
      autoUpdater.autoInstallOnAppQuit = true;

      // Wire up events
      autoUpdater.on("checking-for-update", () => {
        this.isChecking = true;
        this.emit("checking");
      });

      autoUpdater.on("update-available", (info: any) => {
        this.isChecking = false;
        this.pendingUpdate = {
          version: info.version,
          releaseDate: info.releaseDate,
          releaseNotes: info.releaseNotes,
        };
        this.emit("update-available", this.pendingUpdate);
      });

      autoUpdater.on("update-not-available", () => {
        this.isChecking = false;
        this.emit("update-not-available");
      });

      autoUpdater.on("download-progress", (progress: any) => {
        this.emit("download-progress", {
          percent: progress.percent,
          transferred: progress.transferred,
          total: progress.total,
          bytesPerSecond: progress.bytesPerSecond,
        });
      });

      autoUpdater.on("update-downloaded", (info: any) => {
        this.isDownloading = false;
        this.emit("update-ready", {
          version: info.version,
          releaseDate: info.releaseDate,
        });
      });

      autoUpdater.on("error", (err: Error) => {
        this.isChecking = false;
        this.isDownloading = false;
        this.emit("error", err);
      });

      // Check on startup if enabled
      if (this.config.checkOnStartup) {
        await this.checkForUpdates();
      }

      // Schedule periodic checks
      this.schedulePeriodicChecks();
    } catch {
      // electron-updater not installed — disable auto-update features
      this.emit("disabled", "electron-updater not installed");
    }
  }

  /**
   * Manually check for updates
   */
  async checkForUpdates(): Promise<void> {
    if (this.isChecking) return;

    // Respect minimum interval between checks
    const now = Date.now();
    const minInterval = this.config.autoCheckIntervalHours * 60 * 60 * 1000;
    if (now - this.lastCheckTime < minInterval) {
      return;
    }

    this.lastCheckTime = now;

    try {
      const { autoUpdater } = await import("electron-updater");
      await autoUpdater.checkForUpdates();
    } catch (err: any) {
      this.emit("error", err);
    }
  }

  /**
   * Download the available update
   */
  async downloadUpdate(): Promise<void> {
    if (this.isDownloading || !this.pendingUpdate) return;

    this.isDownloading = true;
    this.emit("downloading");

    try {
      const { autoUpdater } = await import("electron-updater");
      await autoUpdater.downloadUpdate();
    } catch (err: any) {
      this.isDownloading = false;
      this.emit("error", err);
    }
  }

  /**
   * Install the downloaded update and restart
   */
  async installUpdate(): Promise<void> {
    try {
      const { autoUpdater } = await import("electron-updater");
      autoUpdater.quitAndInstall();
    } catch (err: any) {
      this.emit("error", err);
    }
  }

  /**
   * Get current update status
   */
  getStatus(): {
    isChecking: boolean;
    isDownloading: boolean;
    pendingUpdate: UpdateInfo | null;
    lastCheckTime: number;
  } {
    return {
      isChecking: this.isChecking,
      isDownloading: this.isDownloading,
      pendingUpdate: this.pendingUpdate,
      lastCheckTime: this.lastCheckTime,
    };
  }

  /**
   * Schedule periodic update checks
   */
  private schedulePeriodicChecks(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
    }

    const intervalMs = this.config.autoCheckIntervalHours * 60 * 60 * 1000;
    this.checkTimer = setInterval(() => {
      this.checkForUpdates();
    }, intervalMs);
  }

  /**
   * Clean up timers
   */
  destroy(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }
}
