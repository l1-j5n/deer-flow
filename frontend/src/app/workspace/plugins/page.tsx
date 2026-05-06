"use client";

import { useState } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  DownloadIcon,
  PackageIcon,
  PauseIcon,
  PlayIcon,
  PlugIcon,
  RefreshCwIcon,
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

import {
  usePlugins,
  usePluginStats,
  useEnablePlugin,
  useDisablePlugin,
  useUninstallPlugin,
} from "@/core/plugins";
import type { Plugin, PluginStatus } from "@/core/plugins";

function StatusBadge({ status }: { status: PluginStatus }) {
  const variants: Record<PluginStatus, { color: string; icon: React.ReactNode }> = {
    installed: { color: "bg-blue-500", icon: <PackageIcon className="size-3" /> },
    enabled: { color: "bg-green-500", icon: <CheckCircle2Icon className="size-3" /> },
    disabled: { color: "bg-slate-500", icon: <PauseIcon className="size-3" /> },
    error: { color: "bg-red-500", icon: <XCircleIcon className="size-3" /> },
    incompatible: { color: "bg-orange-500", icon: <AlertTriangleIcon className="size-3" /> },
  };
  const config = variants[status];
  return (
    <Badge className={`${config.color} text-white flex items-center gap-1`}>
      {config.icon}
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

export default function PluginsPage() {
  const { data: plugins = [], isLoading, refetch } = usePlugins();
  const { data: stats } = usePluginStats();
  const enableMutation = useEnablePlugin();
  const disableMutation = useDisablePlugin();
  const uninstallMutation = useUninstallPlugin();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  const filteredPlugins = plugins.filter(
    (p) =>
      p.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manifest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manifest.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlugIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Plugin Marketplace</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCwIcon className="size-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <DownloadIcon className="size-4 mr-2" />
            Install Plugin
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
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlugins}</div>
              <p className="text-muted-foreground text-xs">{stats.enabledPlugins} enabled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Hooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHooks}</div>
              <p className="text-muted-foreground text-xs">registered</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Disabled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.disabledPlugins}</div>
              <p className="text-muted-foreground text-xs">{stats.incompatiblePlugins} incompatible</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.errorPlugins}</div>
              <p className="text-muted-foreground text-xs">need attention</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plugin List */}
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
                <Button className="mt-4" variant="outline">
                  <DownloadIcon className="size-4 mr-2" />
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredPlugins.map((plugin) => (
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
                <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
                  {plugin.manifest.description}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>v{plugin.manifest.version}</span>
                  <span>by {plugin.manifest.author}</span>
                  <span>{plugin.hookCount} hooks</span>
                </div>
              </div>
            ))
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
                      <CardDescription className="mt-1">
                        {selectedPlugin.manifest.description}
                      </CardDescription>
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
                    {selectedPlugin.status === "enabled" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => disableMutation.mutate(selectedPlugin.id)}
                        disabled={disableMutation.isPending}
                      >
                        <PauseIcon className="size-4 mr-2" />
                        {disableMutation.isPending ? "Disabling..." : "Disable"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => enableMutation.mutate(selectedPlugin.id)}
                        disabled={enableMutation.isPending}
                      >
                        <PlayIcon className="size-4 mr-2" />
                        {enableMutation.isPending ? "Enabling..." : "Enable"}
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <SettingsIcon className="size-4 mr-2" />
                      Configure
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => uninstallMutation.mutate(selectedPlugin.id)}
                      disabled={uninstallMutation.isPending}
                    >
                      <Trash2Icon className="size-4 mr-2" />
                      {uninstallMutation.isPending ? "Uninstalling..." : "Uninstall"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Select a plugin to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
