"use client";

import { useState } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  FlameIcon,
  PauseIcon,
  PlayIcon,
  PlugIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SearchIcon,
  SettingsIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { usePlugins, usePluginStats, useEnablePlugin, useDisablePlugin, useUninstallPlugin } from "@/core/plugins";
import type { Plugin, PluginStatus } from "@/core/plugins";

interface HotReloadState {
  enabled: boolean;
  watchedPaths: string[];
  lastReloadAt?: string;
  reloadCount: number;
  errors: Array<{
    pluginId: string;
    message: string;
    timestamp: string;
  }>;
}

function StatusBadge({ status }: { status: PluginStatus }) {
  const variants: Record<PluginStatus, { color: string; icon: React.ReactNode; label: string }> = {
    installed: { color: "bg-blue-500", icon: <PlugIcon className="size-3" />, label: "Installed" },
    enabled: { color: "bg-green-500", icon: <CheckCircle2Icon className="size-3" />, label: "Enabled" },
    disabled: { color: "bg-slate-500", icon: <PauseIcon className="size-3" />, label: "Disabled" },
    error: { color: "bg-red-500", icon: <XCircleIcon className="size-3" />, label: "Error" },
    incompatible: { color: "bg-orange-500", icon: <AlertTriangleIcon className="size-3" />, label: "Incompatible" },
  };
  const config = variants[status];
  return (
    <Badge className={`${config.color} text-white flex items-center gap-1`}>
      {config.icon}
      <span className="capitalize">{config.label}</span>
    </Badge>
  );
}

export default function PluginMonitorPage() {
  const { data: plugins = [], isLoading } = usePlugins();
  const { data: stats } = usePluginStats();
  const enableMutation = useEnablePlugin();
  const disableMutation = useDisablePlugin();
  const uninstallMutation = useUninstallPlugin();

  const [hotReload, setHotReload] = useState<HotReloadState>({
    enabled: false,
    watchedPaths: [],
    reloadCount: 0,
    errors: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [reloadInProgress, setReloadInProgress] = useState<string | null>(null);

  const handleReloadPlugin = async (pluginId: string) => {
    setReloadInProgress(pluginId);
    try {
      await disableMutation.mutateAsync(pluginId);
      await enableMutation.mutateAsync(pluginId);
      setHotReload((prev) => ({
        ...prev,
        reloadCount: prev.reloadCount + 1,
        lastReloadAt: new Date().toISOString(),
      }));
    } catch {
      // ignore
    } finally {
      setReloadInProgress(null);
    }
  };

  const handleToggleHotReload = () => {
    setHotReload((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const filteredPlugins = plugins.filter(
    (p) =>
      p.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manifest.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlameIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Plugin Hot-Reload Monitor</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCwIcon className="size-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : null}

      {/* Hot Reload Settings */}

      {/* Hot Reload Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon className="size-5" />
            Hot Reload Configuration
          </CardTitle>
          <CardDescription>
            Automatically reload plugins when their source files change
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Enable Hot Reload</p>
              <p className="text-muted-foreground text-xs">
                Watch plugin directories and reload on file changes
              </p>
            </div>
            <Switch checked={hotReload.enabled} onCheckedChange={handleToggleHotReload} />
          </div>

          {hotReload.enabled && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Watched Paths</p>
              <div className="flex flex-wrap gap-2">
                {hotReload.watchedPaths.map((path) => (
                  <Badge key={path} variant="outline" className="text-xs font-mono">
                    {path}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {hotReload.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Recent Errors</p>
              <div className="space-y-2">
                {hotReload.errors.map((err, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 p-2"
                  >
                    <AlertTriangleIcon className="size-4 text-red-500 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-red-700 dark:text-red-300">
                        {err.pluginId}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400">{err.message}</p>
                      <p className="text-[10px] text-red-500 dark:text-red-500 mt-0.5">
                        {new Date(err.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plugin List */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          <div className="relative">
            <SearchIcon className="text-muted-foreground absolute left-2 top-2.5 size-4" />
            <Input
              placeholder="Search plugins..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredPlugins.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PlugIcon className="text-muted-foreground mb-4 size-12" />
                <p className="text-muted-foreground">No plugins found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredPlugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted ${
                    selectedPlugin?.id === plugin.id ? "border-primary bg-muted" : ""
                  }`}
                  onClick={() => setSelectedPlugin(plugin)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{plugin.manifest.name}</span>
                    <StatusBadge status={plugin.status} />
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm line-clamp-1">
                    {plugin.manifest.description}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>v{plugin.manifest.version}</span>
                    <span>{plugin.hookCount} hooks</span>
                    <span>{plugin.manifest.permissions.length} perms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plugin Detail */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPlugin ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedPlugin.manifest.name}</CardTitle>
                      <CardDescription>{selectedPlugin.manifest.description}</CardDescription>
                    </div>
                    <StatusBadge status={selectedPlugin.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground text-xs">Version</span>
                      <p className="text-sm font-medium">{selectedPlugin.manifest.version}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Author</span>
                      <p className="text-sm font-medium">{selectedPlugin.manifest.author}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Path</span>
                      <p className="text-sm font-medium truncate">{selectedPlugin.path}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Enabled At</span>
                      <p className="text-sm font-medium">
                        {selectedPlugin.enabledAt
                          ? new Date(selectedPlugin.enabledAt).toLocaleString()
                          : "Never"}
                      </p>
                    </div>
                  </div>

                  {selectedPlugin.manifest.permissions.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Permissions</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlugin.manifest.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPlugin.manifest.hooks.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Hooks</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlugin.manifest.hooks.map((hook) => (
                          <Badge key={hook} variant="secondary" className="text-xs">
                            {hook}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPlugin.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangleIcon className="size-4" />
                        <span className="text-sm font-medium">Error</span>
                      </div>
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {selectedPlugin.error}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReloadPlugin(selectedPlugin.id)}
                      disabled={reloadInProgress === selectedPlugin.id}
                    >
                      {reloadInProgress === selectedPlugin.id ? (
                        <RefreshCwIcon className="size-4 mr-2 animate-spin" />
                      ) : (
                        <RotateCcwIcon className="size-4 mr-2" />
                      )}
                      Hot Reload
                    </Button>
                    {selectedPlugin.status === "enabled" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => disableMutation.mutate(selectedPlugin.id)}
                        disabled={disableMutation.isPending}
                      >
                        <PauseIcon className="size-4 mr-2" />
                        Disable
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => enableMutation.mutate(selectedPlugin.id)}
                        disabled={enableMutation.isPending}
                      >
                        <PlayIcon className="size-4 mr-2" />
                        Enable
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => uninstallMutation.mutate(selectedPlugin.id)}
                      disabled={uninstallMutation.isPending}
                    >
                      <Trash2Icon className="size-4 mr-2" />
                      Uninstall
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Select a plugin to view details and reload</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
