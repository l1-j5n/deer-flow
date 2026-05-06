"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangleIcon,
  BellIcon,
  CheckCircle2Icon,
  ClockIcon,
  InfoIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  SettingsIcon,
  ShieldIcon,
  Trash2Icon,
  WrenchIcon,
  XIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

import {
  useNotifications,
  useMarkNotificationsRead,
  useDeleteNotification,
  useClearAllNotifications,
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/core/app-notifications";
import type { NotificationSeverity } from "@/core/app-notifications";

type NotificationCategory = "system" | "agent" | "workflow" | "security" | "mcp" | "update";

const categoryIcons: Record<NotificationCategory, React.ReactNode> = {
  system: <WrenchIcon className="size-4" />,
  agent: <MessageSquareIcon className="size-4" />,
  workflow: <ClockIcon className="size-4" />,
  security: <ShieldIcon className="size-4" />,
  mcp: <SettingsIcon className="size-4" />,
  update: <RefreshCwIcon className="size-4" />,
};

const categoryLabels: Record<NotificationCategory, string> = {
  system: "System",
  agent: "Agent",
  workflow: "Workflow",
  security: "Security",
  mcp: "MCP",
  update: "Update",
};

const severityConfig: Record<NotificationSeverity, { color: string; icon: React.ReactNode }> = {
  info: { color: "text-blue-500", icon: <InfoIcon className="size-4" /> },
  warning: { color: "text-yellow-500", icon: <AlertTriangleIcon className="size-4" /> },
  critical: { color: "text-red-500", icon: <AlertTriangleIcon className="size-4" /> },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [filterCategory, setFilterCategory] = useState<NotificationCategory | "all">("all");

  // ── React Query hooks ──────────────────────────────────────────
  const { data: notifData, isLoading } = useNotifications({
    category: filterCategory === "all" ? undefined : filterCategory,
  });
  const { data: settings } = useNotificationSettings();
  const markReadMutation = useMarkNotificationsRead();
  const deleteMutation = useDeleteNotification();
  const clearAllMutation = useClearAllNotifications();
  const updateSettingsMutation = useUpdateNotificationSettings();

  const notifications = notifData?.notifications ?? [];
  const unreadCount = notifData?.unreadCount ?? 0;

  // ── Handlers ───────────────────────────────────────────────────

  const handleMarkAllRead = useCallback(() => {
    markReadMutation.mutate(undefined, {
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: ["app-notifications"] });
      },
    });
  }, [markReadMutation, qc]);

  const handleMarkOneRead = useCallback(
    (id: string) => {
      markReadMutation.mutate([id], {
        onSuccess: () => {
          void qc.invalidateQueries({ queryKey: ["app-notifications"] });
        },
      });
    },
    [markReadMutation, qc],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          void qc.invalidateQueries({ queryKey: ["app-notifications"] });
        },
      });
    },
    [deleteMutation, qc],
  );

  const handleClearAll = useCallback(() => {
    clearAllMutation.mutate(undefined, {
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: ["app-notifications"] });
      },
    });
  }, [clearAllMutation, qc]);

  const handleToggleEnabled = useCallback(
    (enabled: boolean) => {
      if (settings) {
        updateSettingsMutation.mutate({ ...settings, enabled });
      }
    },
    [settings, updateSettingsMutation],
  );

  const handleToggleCategory = useCallback(
    (cat: NotificationCategory, value: boolean) => {
      if (settings) {
        updateSettingsMutation.mutate({
          ...settings,
          categories: { ...settings.categories, [cat]: value },
        });
      }
    },
    [settings, updateSettingsMutation],
  );

  const handleRefresh = () => {
    void qc.invalidateQueries({ queryKey: ["app-notifications"] });
  };

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BellIcon className="size-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="text-muted-foreground text-sm">{unreadCount} unread</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCwIcon className="size-4 mr-2" />
            Refresh
          </Button>
          {notifications.length > 0 && (
            <>
              <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={markReadMutation.isPending}>
                <CheckCircle2Icon className="size-4 mr-2" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={clearAllMutation.isPending}
                className="text-red-500 hover:text-red-400"
              >
                <Trash2Icon className="size-4 mr-2" />
                {clearAllMutation.isPending ? "Clearing…" : "Clear All"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Sidebar — Settings */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {settings ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enabled</span>
                  <Switch checked={settings.enabled} onCheckedChange={handleToggleEnabled} />
                </div>
                <div className="space-y-2">
                  <span className="text-muted-foreground text-xs font-medium">Categories</span>
                  {(Object.keys(categoryLabels) as NotificationCategory[]).map((cat) => (
                    <div key={cat} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-sm">
                        {categoryIcons[cat]}
                        <span>{categoryLabels[cat]}</span>
                      </div>
                      <Switch
                        checked={settings.categories[cat] ?? false}
                        onCheckedChange={(v) => handleToggleCategory(cat, v)}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Skeleton className="h-48 w-full" />
            )}
          </CardContent>
        </Card>

        {/* Main — Notification List */}
        <div className="md:col-span-3 space-y-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {(["all", "system", "agent", "workflow", "security", "mcp", "update"] as const).map((cat) => (
              <Badge
                key={cat}
                variant={filterCategory === cat ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => setFilterCategory(cat)}
              >
                {cat === "all" ? "All" : categoryLabels[cat]}
              </Badge>
            ))}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <BellIcon className="text-muted-foreground mb-4 size-12" />
              <p className="text-muted-foreground text-lg">No notifications</p>
              <p className="text-muted-foreground text-sm">
                {filterCategory === "all"
                  ? "You're all caught up!"
                  : `No ${filterCategory} notifications.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const sev = severityConfig[notif.severity as NotificationSeverity] ?? severityConfig["info"];
                return (
                  <Card
                    key={notif.id}
                    className={`transition-colors hover:bg-accent/20 ${!notif.read ? "border-l-4 border-l-primary" : "opacity-70"}`}
                  >
                    <CardContent className="flex items-start gap-4 p-4">
                      <div className={`mt-0.5 ${sev.color}`}>{sev.icon}</div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{notif.title}</span>
                          {!notif.read && (
                            <Badge variant="default" className="text-xs h-4 px-1.5">
                              New
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[notif.category as NotificationCategory] ?? notif.category}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-3 text-muted-foreground text-xs">
                          <span>{timeAgo(notif.timestamp)}</span>
                          {notif.actionUrl && (
                            <a
                              href={notif.actionUrl}
                              className="text-primary hover:underline"
                            >
                              {notif.actionLabel ?? "View"}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notif.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            title="Mark as read"
                            onClick={() => handleMarkOneRead(notif.id)}
                          >
                            <CheckCircle2Icon className="size-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-red-500 hover:text-red-400"
                          title="Delete"
                          onClick={() => handleDelete(notif.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <XIcon className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
