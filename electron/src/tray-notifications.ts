/**
 * Tray Notification Badge Manager
 *
 * Manages notification counts displayed on the system tray icon.
 * Supports unread message badges, alert indicators, and dynamic icon generation.
 */

import { EventEmitter } from "events";

// ============================================================
// Types
// ============================================================

export interface TrayBadgeState {
  unreadCount: number;
  alertCount: number;
  hasCriticalAlert: boolean;
  lastUpdated: string;
}

export interface BadgeConfig {
  enabled: boolean;
  showCount: boolean;
  maxDisplayCount: number;
  criticalColor: string;
  warningColor: string;
  normalColor: string;
}

export interface NotificationCategory {
  name: string;
  count: number;
  priority: "critical" | "warning" | "info";
  lastEvent?: string;
}

// ============================================================
// Tray Notification Manager
// ============================================================

export class TrayNotificationManager extends EventEmitter {
  private state: TrayBadgeState = {
    unreadCount: 0,
    alertCount: 0,
    hasCriticalAlert: false,
    lastUpdated: new Date().toISOString(),
  };

  private config: BadgeConfig = {
    enabled: true,
    showCount: true,
    maxDisplayCount: 99,
    criticalColor: "#ef4444",
    warningColor: "#f59e0b",
    normalColor: "#3b82f6",
  };

  private categories: Map<string, NotificationCategory> = new Map();
  private history: Array<{ time: string; action: string; details?: string }> = [];
  private maxHistory = 50;

  constructor(config?: Partial<BadgeConfig>) {
    super();
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // ---- Badge State Management ----

  incrementUnread(count = 1): void {
    this.state.unreadCount += count;
    this.state.lastUpdated = new Date().toISOString();
    this.emit("badge:changed", this.getBadgeState());
    this.logHistory("increment_unread", `+${count}`);
  }

  decrementUnread(count = 1): void {
    this.state.unreadCount = Math.max(0, this.state.unreadCount - count);
    this.state.lastUpdated = new Date().toISOString();
    this.emit("badge:changed", this.getBadgeState());
    this.logHistory("decrement_unread", `-${count}`);
  }

  clearUnread(): void {
    this.state.unreadCount = 0;
    this.state.lastUpdated = new Date().toISOString();
    this.emit("badge:changed", this.getBadgeState());
    this.logHistory("clear_unread");
  }

  setUnread(count: number): void {
    this.state.unreadCount = Math.max(0, count);
    this.state.lastUpdated = new Date().toISOString();
    this.emit("badge:changed", this.getBadgeState());
    this.logHistory("set_unread", String(count));
  }

  // ---- Alert Management ----

  addAlert(severity: "critical" | "warning" | "info" = "info", message?: string): void {
    this.state.alertCount++;
    if (severity === "critical") {
      this.state.hasCriticalAlert = true;
    }
    this.state.lastUpdated = new Date().toISOString();
    this.emit("alert:added", { severity, message });
    this.emit("badge:changed", this.getBadgeState());
    this.logHistory("add_alert", `${severity}: ${message || "N/A"}`);
  }

  clearAlerts(): void {
    this.state.alertCount = 0;
    this.state.hasCriticalAlert = false;
    this.state.lastUpdated = new Date().toISOString();
    this.emit("alerts:cleared");
    this.emit("badge:changed", this.getBadgeState());
    this.logHistory("clear_alerts");
  }

  resolveCriticalAlert(): void {
    this.state.hasCriticalAlert = false;
    this.state.lastUpdated = new Date().toISOString();
    this.emit("badge:changed", this.getBadgeState());
    this.logHistory("resolve_critical");
  }

  // ---- Category Management ----

  setCategoryCount(name: string, count: number, priority: "critical" | "warning" | "info" = "info", lastEvent?: string): void {
    this.categories.set(name, { name, count, priority, lastEvent });
    this.recalculateTotals();
    this.emit("category:updated", { name, count, priority });
  }

  incrementCategory(name: string, priority: "critical" | "warning" | "info" = "info", lastEvent?: string): void {
    const existing = this.categories.get(name);
    const newCount = (existing?.count || 0) + 1;
    this.categories.set(name, {
      name,
      count: newCount,
      priority: existing && priority !== "critical" ? existing.priority : priority,
      lastEvent: lastEvent || existing?.lastEvent,
    });
    this.recalculateTotals();
    this.emit("category:updated", { name, count: newCount, priority });
  }

  clearCategory(name: string): void {
    this.categories.delete(name);
    this.recalculateTotals();
    this.emit("category:cleared", name);
  }

  getCategories(): NotificationCategory[] {
    return Array.from(this.categories.values());
  }

  private recalculateTotals(): void {
    let totalUnread = 0;
    let totalAlerts = 0;
    let hasCritical = false;

    for (const cat of this.categories.values()) {
      totalUnread += cat.count;
      if (cat.count > 0) {
        totalAlerts++;
        if (cat.priority === "critical") {
          hasCritical = true;
        }
      }
    }

    this.state.unreadCount = totalUnread;
    this.state.alertCount = totalAlerts;
    this.state.hasCriticalAlert = hasCritical;
    this.state.lastUpdated = new Date().toISOString();
    this.emit("badge:changed", this.getBadgeState());
  }

  // ---- Badge Display ----

  getBadgeState(): TrayBadgeState {
    return { ...this.state };
  }

  getBadgeText(): string | null {
    if (!this.config.enabled) return null;
    if (this.state.unreadCount === 0) return null;

    if (this.config.showCount) {
      if (this.state.unreadCount > this.config.maxDisplayCount) {
        return `${this.config.maxDisplayCount}+`;
      }
      return String(this.state.unreadCount);
    }

    // Just show indicator
    return "●";
  }

  getBadgeColor(): string {
    if (this.state.hasCriticalAlert) return this.config.criticalColor;
    if (this.state.alertCount > 0) return this.config.warningColor;
    return this.config.normalColor;
  }

  shouldShowBadge(): boolean {
    return this.config.enabled && this.state.unreadCount > 0;
  }

  // ---- Config ----

  updateConfig(updates: Partial<BadgeConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit("config:updated", this.config);
  }

  getConfig(): BadgeConfig {
    return { ...this.config };
  }

  // ---- History ----

  private logHistory(action: string, details?: string): void {
    this.history.push({
      time: new Date().toISOString(),
      action,
      details,
    });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getHistory(): Array<{ time: string; action: string; details?: string }> {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  // ---- Preset Helpers ----

  onNewMessage(count = 1): void {
    this.incrementCategory("messages", "info", "New message received");
    this.incrementUnread(count);
  }

  onNewNotification(category: string, priority: "critical" | "warning" | "info" = "info", message?: string): void {
    this.incrementCategory(category, priority, message);
    if (priority === "critical") {
      this.addAlert("critical", message);
    }
  }

  onSessionEvent(eventType: string): void {
    this.incrementCategory("sessions", "info", eventType);
  }

  onWorkflowEvent(eventType: string): void {
    this.incrementCategory("workflows", "info", eventType);
  }

  onHealthAlert(severity: "critical" | "warning" | "info", message: string): void {
    this.incrementCategory("health", severity, message);
    if (severity === "critical" || severity === "warning") {
      this.addAlert(severity, message);
    }
  }

  // ---- Reset ----

  reset(): void {
    this.state = {
      unreadCount: 0,
      alertCount: 0,
      hasCriticalAlert: false,
      lastUpdated: new Date().toISOString(),
    };
    this.categories.clear();
    this.history = [];
    this.emit("badge:changed", this.getBadgeState());
  }
}
