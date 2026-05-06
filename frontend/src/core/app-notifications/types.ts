/* ── App Notifications data types ── */

export type NotificationSeverity = "info" | "warning" | "critical";
export type NotificationCategory = "system" | "agent" | "workflow" | "security" | "mcp" | "update";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  read: boolean;
  timestamp: string; // ISO 8601
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  total: number;
  unreadCount: number;
}

export interface NotificationSettingsModel {
  enabled: boolean;
  categories: Partial<Record<NotificationCategory, boolean>>;
  severityThreshold: NotificationSeverity;
}

export interface MarkReadRequest {
  ids?: string[]; // undefined = mark all
}
