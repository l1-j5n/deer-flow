"use client";

import { useState } from "react";
import {
  BarChart3Icon,
  CheckCircle2Icon,
  ClockIcon,
  PackageIcon,
  RefreshCwIcon,
  SearchIcon,
  StarIcon,
  TrendingUpIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useTools,
  useToolAnalytics,
  useTopTools,
  useToolStats,
} from "@/core/tools-registry";
import type { ToolDefinition, ToolCategory, ToolStatus, ToolSource } from "@/core/tools-registry";

const categoryLabels: Record<ToolCategory, string> = {
  web: "Web",
  file: "File",
  data: "Data",
  code: "Code",
  communication: "Communication",
  search: "Search",
  analysis: "Analysis",
  media: "Media",
  system: "System",
  custom: "Custom",
};

const sourceLabels: Record<ToolSource, string> = {
  builtin: "Built-in",
  mcp: "MCP",
  skill: "Skill",
  plugin: "Plugin",
  custom: "Custom",
};

function StatusBadge({ status }: { status: ToolStatus }) {
  const variants: Record<ToolStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    available: { variant: "default", label: "Available" },
    deprecated: { variant: "secondary", label: "Deprecated" },
    experimental: { variant: "outline", label: "Experimental" },
    disabled: { variant: "destructive", label: "Disabled" },
  };
  const config = variants[status];
  return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
}

function SourceBadge({ source }: { source: ToolSource }) {
  const colors: Record<ToolSource, string> = {
    builtin: "bg-blue-500",
    mcp: "bg-purple-500",
    skill: "bg-green-500",
    plugin: "bg-orange-500",
    custom: "bg-pink-500",
  };
  return (
    <Badge className={`${colors[source] ?? "bg-slate-500"} text-white text-xs`}>
      {sourceLabels[source] ?? source}
    </Badge>
  );
}

export default function ToolsPage() {
  const { data: tools = [], isLoading, refetch } = useTools();
  const { data: analytics = [] } = useToolAnalytics();
  const { data: topTools = [] } = useTopTools(10);
  const { data: stats } = useToolStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <WrenchIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Tool Registry</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCwIcon className="size-4 mr-2" />
          Refresh
        </Button>
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
              <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTools}</div>
              <p className="text-muted-foreground text-xs">{stats.availableTools} available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.categoryBreakdown).length}</div>
              <p className="text-muted-foreground text-xs">distinct types</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.sourceBreakdown).length}</div>
              <p className="text-muted-foreground text-xs">origins</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Experimental</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.experimentalTools}</div>
              <p className="text-muted-foreground text-xs">{stats.deprecatedTools} deprecated</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tool List */}
        <div className="space-y-3">
          <div className="relative">
            <SearchIcon className="text-muted-foreground absolute left-2 top-2.5 size-4" />
            <Input
              placeholder="Search tools..."
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
          ) : filteredTools.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <WrenchIcon className="text-muted-foreground mb-4 size-12" />
                <p className="text-muted-foreground">No tools found.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTools.map((tool) => (
              <div
                key={tool.id}
                className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted ${
                  selectedTool?.id === tool.id ? "border-primary bg-muted" : ""
                }`}
                onClick={() => setSelectedTool(tool)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tool.name}</span>
                  <StatusBadge status={tool.status} />
                </div>
                <p className="text-muted-foreground mt-1 text-sm line-clamp-2">{tool.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <SourceBadge source={tool.source} />
                  <Badge variant="outline" className="text-xs capitalize">
                    {categoryLabels[tool.category] ?? tool.category}
                  </Badge>
                  <span className="text-muted-foreground text-xs">v{tool.version}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tool Detail & Analytics */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTool ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedTool.name}</CardTitle>
                      <CardDescription className="mt-1">{selectedTool.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedTool.status} />
                      <SourceBadge source={selectedTool.source} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-muted-foreground text-xs">Category</span>
                      <p className="text-sm font-medium capitalize">{categoryLabels[selectedTool.category] ?? selectedTool.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Version</span>
                      <p className="text-sm font-medium">{selectedTool.version}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Created</span>
                      <p className="text-sm font-medium">{new Date(selectedTool.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Updated</span>
                      <p className="text-sm font-medium">{new Date(selectedTool.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {selectedTool.parameters.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Parameters</h4>
                      <div className="space-y-2">
                        {selectedTool.parameters.map((param) => (
                          <div key={param.name} className="rounded border p-2 text-sm">
                            <div className="flex items-center gap-2">
                              <code className="text-primary text-xs">{param.name}</code>
                              <Badge variant="outline" className="text-[10px]">{param.type}</Badge>
                              {param.required && (
                                <Badge variant="destructive" className="text-[10px]">Required</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-1 text-xs">{param.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analytics */}
              {analytics.find((a) => a.toolId === selectedTool.id) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3Icon className="size-5" />
                      Usage Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const a = analytics.find((x) => x.toolId === selectedTool.id)!;
                      return (
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <span className="text-muted-foreground text-xs">Total Calls</span>
                            <p className="text-xl font-bold">{a.totalCalls}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Success Rate</span>
                            <p className={`text-xl font-bold ${a.successRate >= 0.9 ? "text-green-500" : a.successRate >= 0.7 ? "text-yellow-500" : "text-red-500"}`}>
                              {(a.successRate * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Avg Duration</span>
                            <p className="text-xl font-bold">{a.averageDurationMs.toFixed(0)}ms</p>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Select a tool to view details</p>
              </CardContent>
            </Card>
          )}

          {/* Top Tools */}
          {topTools.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="size-5" />
                  Most Used Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topTools.slice(0, 5).map((a) => (
                    <div key={a.toolId} className="flex items-center justify-between rounded border p-3">
                      <div>
                        <span className="text-sm font-medium">{a.toolName}</span>
                        <p className="text-muted-foreground text-xs">
                          {a.totalCalls} calls · {(a.successRate * 100).toFixed(0)}% success
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <StarIcon className="size-4 text-yellow-500" />
                        <span className="text-sm font-medium">{a.totalCalls}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
