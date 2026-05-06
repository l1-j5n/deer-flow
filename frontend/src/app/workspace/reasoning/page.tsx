"use client";

import { useState } from "react";
import {
  BrainCircuitIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  DownloadIcon,
  FileJsonIcon,
  FileTextIcon,
  LightbulbIcon,
  PauseIcon,
  PlayIcon,
  RefreshCwIcon,
  SearchIcon,
  TargetIcon,
  Trash2Icon,
  XCircleIcon,
  ZapIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import {
  useReasoningTraces,
  useReasoningStats,
  useDeleteReasoningTrace,
  type ReasoningTrace,
} from "@/core/reasoning";

function StrategyBadge({ strategy }: { strategy: string }) {
  const labels: Record<string, string> = {
    direct: "Direct",
    cot: "Chain-of-Thought",
    react: "ReAct",
    tot: "Tree-of-Thought",
    reflection: "Reflection",
  };
  const colors: Record<string, string> = {
    direct: "bg-slate-500",
    cot: "bg-blue-500",
    react: "bg-green-500",
    tot: "bg-purple-500",
    reflection: "bg-orange-500",
  };
  return (
    <Badge className={`${colors[strategy] ?? "bg-slate-500"} text-white text-xs`}>
      {labels[strategy] ?? strategy}
    </Badge>
  );
}

function TraceStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { color: string; icon: React.ReactNode }> = {
    active: { color: "bg-blue-500", icon: <PlayIcon className="size-3" /> },
    completed: { color: "bg-green-500", icon: <CheckCircle2Icon className="size-3" /> },
    failed: { color: "bg-red-500", icon: <XCircleIcon className="size-3" /> },
    paused: { color: "bg-yellow-500", icon: <PauseIcon className="size-3" /> },
  };
  const config = variants[status] ?? variants.active;
  if (!config) return null;
  return (
    <Badge className={`${config.color} text-white flex items-center gap-1`}>
      {config.icon}
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

function StepTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "thought":
      return <LightbulbIcon className="size-4 text-yellow-500" />;
    case "action":
      return <ZapIcon className="size-4 text-blue-500" />;
    case "observation":
      return <TargetIcon className="size-4 text-green-500" />;
    case "plan":
      return <BrainCircuitIcon className="size-4 text-purple-500" />;
    case "reflection":
      return <RefreshCwIcon className="size-4 text-orange-500" />;
    case "conclusion":
      return <CheckCircle2Icon className="size-4 text-green-600" />;
    default:
      return <ClockIcon className="size-4 text-muted-foreground" />;
  }
}

function exportTraceAsJSON(trace: ReasoningTrace) {
  const blob = new Blob([JSON.stringify(trace, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trace-${trace.id}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportTraceAsMarkdown(trace: ReasoningTrace) {
  const lines: string[] = [
    `# Reasoning Trace: ${trace.goal}`,
    "",
    `- **Strategy:** ${trace.strategy}`,
    `- **Status:** ${trace.status}`,
    `- **Created:** ${new Date(trace.createdAt).toLocaleString()}`,
    `- **Steps:** ${trace.steps.length}`,
    "",
    "---",
    "",
  ];
  if (trace.finalAnswer) {
    lines.push("## Final Answer", "", trace.finalAnswer, "", "---", "");
  }
  lines.push("## Reasoning Steps", "");
  for (const [index, step] of trace.steps.entries()) {
    lines.push(
      `### Step ${index + 1}: ${step.type}`,
      "",
      `- **Confidence:** ${(step.confidence * 100).toFixed(0)}%`,
      `- **Timestamp:** ${new Date(step.timestamp).toLocaleString()}`,
      step.metadata?.toolName ? `- **Tool:** ${step.metadata.toolName}` : "",
      "",
      step.content,
      "",
      "---",
      ""
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trace-${trace.id}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAllTracesAsJSON(traces: ReasoningTrace[]) {
  const blob = new Blob([JSON.stringify(traces, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reasoning-traces-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReasoningPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrace, setSelectedTrace] = useState<ReasoningTrace | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const qc = useQueryClient();
  const { data: tracesData, isLoading: tracesLoading } = useReasoningTraces({
    search: searchQuery || undefined,
  });
  const { data: stats, isLoading: statsLoading } = useReasoningStats();
  const deleteMutation = useDeleteReasoningTrace();

  const traces = tracesData?.traces ?? [];
  const loading = tracesLoading || statsLoading;

  const filteredTraces = traces;

  const toggleStep = (id: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteTrace = async (traceId: string) => {
    await deleteMutation.mutateAsync(traceId);
    if (selectedTrace?.id === traceId) {
      setSelectedTrace(null);
    }
  };

  const handleRefresh = () => {
    void qc.invalidateQueries({ queryKey: ["reasoning"] });
  };

  const expandAll = () => {
    if (selectedTrace) {
      setExpandedSteps(new Set(selectedTrace.steps.map((s) => s.id)));
    }
  };

  const collapseAll = () => {
    setExpandedSteps(new Set());
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuitIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Reasoning Traces</h1>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <DownloadIcon className="size-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => selectedTrace && exportTraceAsJSON(selectedTrace)}>
                <FileJsonIcon className="size-4 mr-2" />
                Export Selected as JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => selectedTrace && exportTraceAsMarkdown(selectedTrace)}
              >
                <FileTextIcon className="size-4 mr-2" />
                Export Selected as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportAllTracesAsJSON(traces)}>
                <FileJsonIcon className="size-4 mr-2" />
                Export All as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCwIcon className="size-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Traces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTraces}</div>
              <p className="text-muted-foreground text-xs">{stats.activeTraces} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.completedTraces}</div>
              <p className="text-muted-foreground text-xs">{stats.failedTraces} failed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageSteps.toFixed(1)}</div>
              <p className="text-muted-foreground text-xs">per trace</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats.averageConfidence * 100).toFixed(0)}%
              </div>
              <p className="text-muted-foreground text-xs">overall</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3">
          <div className="relative">
            <SearchIcon className="text-muted-foreground absolute left-2 top-2.5 size-4" />
            <Input
              placeholder="Search traces..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {tracesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredTraces.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BrainCircuitIcon className="text-muted-foreground mb-4 size-12" />
                <p className="text-muted-foreground">No reasoning traces found.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTraces.map((trace) => (
              <div
                key={trace.id}
                className={`cursor-pointer rounded-lg border p-4 transition-colors hover:bg-muted ${
                  selectedTrace?.id === trace.id ? "border-primary bg-muted" : ""
                }`}
                onClick={() => setSelectedTrace(trace)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium line-clamp-1">{trace.goal}</span>
                  <TraceStatusBadge status={trace.status} />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <StrategyBadge strategy={trace.strategy} />
                  <span className="text-muted-foreground text-xs">
                    {trace.totalSteps} steps
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(trace.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {selectedTrace ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedTrace.goal}</CardTitle>
                      <CardDescription className="mt-1">
                        <span className="flex items-center gap-2">
                          <StrategyBadge strategy={selectedTrace.strategy} />
                          <TraceStatusBadge status={selectedTrace.status} />
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={expandAll}>
                        Expand All
                      </Button>
                      <Button variant="ghost" size="sm" onClick={collapseAll}>
                        Collapse All
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleDeleteTrace(selectedTrace.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedTrace.finalAnswer && (
                    <div className="mb-4 rounded-lg bg-muted p-4">
                      <h4 className="mb-1 text-sm font-semibold">Final Answer</h4>
                      <p className="text-sm">{selectedTrace.finalAnswer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BrainCircuitIcon className="size-5" />
                    Reasoning Steps ({selectedTrace.steps.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedTrace.steps.map((step, index) => {
                    const isExpanded = expandedSteps.has(step.id);
                    return (
                      <div key={step.id} className="rounded-lg border">
                        <div
                          className="flex cursor-pointer items-center gap-3 p-3"
                          onClick={() => toggleStep(step.id)}
                        >
                          {isExpanded ? (
                            <ChevronDownIcon className="size-4 text-muted-foreground" />
                          ) : (
                            <ChevronRightIcon className="size-4 text-muted-foreground" />
                          )}
                          <span className="text-muted-foreground w-6 text-xs">#{index + 1}</span>
                          <StepTypeIcon type={step.type} />
                          <span className="flex-1 text-sm font-medium capitalize">{step.type}</span>
                          <Badge
                            variant={step.confidence > 0.8 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {(step.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        {isExpanded && (
                          <div className="border-t px-3 py-3 text-sm">
                            <p className="whitespace-pre-wrap">{step.content}</p>
                            {step.metadata?.toolName && (
                              <p className="text-muted-foreground mt-2 text-xs">
                                Tool: {step.metadata.toolName}
                              </p>
                            )}
                            <p className="text-muted-foreground mt-1 text-xs">
                              {new Date(step.timestamp).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Select a trace to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
