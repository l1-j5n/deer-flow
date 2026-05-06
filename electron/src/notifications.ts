/**
 * DeerFlow Electron - Desktop Notifications
 *
 * Provides native desktop notification support through Electron.
 * Allows the renderer to send notifications that appear in the OS
 * notification center (Windows Action Center, macOS Notification Center).
 *
 * Supports:
 * - Basic notifications with title and body
 * - Click handlers that navigate to specific routes
 * - Agent task completion notifications
 * - Service status change notifications
 */

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
  clickRoute?: string; // Route to navigate to on click (e.g., "/workspace/chats/123")
  category?: "agent" | "service" | "system";
  urgency?: "normal" | "critical" | "low";
}

interface TrackedNotification {
  id: string;
  options: NotificationOptions;
  timestamp: number;
}

export class DesktopNotifications {
  private notifications: Map<string, TrackedNotification> = new Map();
  private navigateCallback: ((route: string) => void) | null = null;
  private electronNotification: any = null;

  constructor() {
    try {
      this.electronNotification = require("electron").Notification;
    } catch {
      console.warn("[Notifications] Electron Notification not available");
    }
  }

  /**
   * Set callback for notification click navigation
   */
  setNavigateCallback(callback: (route: string) => void): void {
    this.navigateCallback = callback;
  }

  /**
   * Check if notifications are supported and permitted
   */
  isSupported(): boolean {
    if (!this.electronNotification) return false;
    return this.electronNotification.isSupported();
  }

  /**
   * Send a desktop notification
   */
  send(options: NotificationOptions): {
    success: boolean;
    error?: string;
    id: string;
  } {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    if (!this.isSupported()) {
      console.warn("[Notifications] Not supported, logging instead:", options.title);
      return { success: false, error: "Notifications not supported", id };
    }

    try {
      const Notification = this.electronNotification;

      const notifOptions: Electron.NotificationConstructorOptions = {
        title: options.title,
        body: options.body,
        silent: options.silent || false,
      };

      if (options.icon) {
        notifOptions.icon = options.icon;
      }

      const notification = new Notification(notifOptions);

      notification.on("click", () => {
        console.log(`[Notifications] Clicked: ${options.title}`);
        if (options.clickRoute && this.navigateCallback) {
          this.navigateCallback(options.clickRoute);
        }
      });

      notification.on("close", () => {
        this.notifications.delete(id);
      });

      notification.on("failed", (event: any, error: Error) => {
        console.error(`[Notifications] Failed: ${error.message}`);
      });

      notification.show();

      this.notifications.set(id, {
        id,
        options,
        timestamp: Date.now(),
      });

      return { success: true, id };
    } catch (err: any) {
      return { success: false, error: err.message, id };
    }
  }

  /**
   * Send an agent task completion notification
   */
  notifyAgentComplete(threadId: string, threadTitle: string): void {
    this.send({
      title: "🤖 Agent Task Complete",
      body: threadTitle || "Your agent has finished processing",
      category: "agent",
      clickRoute: `/workspace/chats/${threadId}`,
    });
  }

  /**
   * Send a service status notification
   */
  notifyServiceStatus(serviceName: string, status: "ready" | "error" | "stopped"): void {
    const statusMessages: Record<string, string> = {
      ready: `✅ ${serviceName} is running`,
      error: `❌ ${serviceName} encountered an error`,
      stopped: `⏹ ${serviceName} has stopped`,
    };

    this.send({
      title: "Service Status Update",
      body: statusMessages[status] || `${serviceName}: ${status}`,
      category: "service",
      silent: status === "error" ? false : true,
    });
  }

  /**
   * Get all active (non-dismissed) notifications
   */
  getActiveNotifications(): TrackedNotification[] {
    return Array.from(this.notifications.values());
  }

  /**
   * Get notification history count
   */
  getActiveCount(): number {
    return this.notifications.size;
  }
}
