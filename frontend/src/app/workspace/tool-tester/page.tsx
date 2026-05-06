"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  PlayIcon,
  RefreshCwIcon,
  SearchIcon,
  SendIcon,
  Settings2Icon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useTools } from "@/core/tools-registry";
import type { ToolCategory, ToolStatus, ToolSource, ToolDefinition as ToolDef, ToolParameter as ToolParam } from "@/core/tools-registry";

type ParamType = "string" | "number" | "boolean" | "array" | "object";

interface LocalToolParameter extends ToolParam {
  type: ParamType;
}

type LocalToolDefinition = ToolDef & {
  parameters: LocalToolParameter[];
};

interface TestResult {
  id: string;
  toolId: string;
  toolName: string;
  params: Record<string, unknown>;
  status: "success" | "error" | "timeout" | "pending";
  result?: unknown;
  error?: string;
  durationMs: number;
  timestamp: string;
}

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

const sourceColors: Record<ToolSource, string> = {
  builtin: "bg-blue-500",
  mcp: "bg-purple-500",
  skill: "bg-green-500",
  plugin: "bg-orange-500",
  custom: "bg-pink-500",
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

function TestStatusBadge({ status }: { status: TestResult["status"] }) {
  const config: Record<TestResult["status"], { color: string; icon: React.ReactNode; label: string }> = {
    success: { color: "text-green-500", icon: <CheckCircle2Icon className="size-4" />, label: "Success" },
    error: { color: "text-red-500", icon: <XCircleIcon className="size-4" />, label: "Error" },
    timeout: { color: "text-amber-500", icon: <ClockIcon className="size-4" />, label: "Timeout" },
    pending: { color: "text-blue-500", icon: <RefreshCwIcon className="size-4 animate-spin" />, label: "Running" },
  };
  const c = config[status];
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${c.color}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

function ParamInput({
  param,
  value,
  onChange,
}: {
  param: ToolParam;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  if (param.enum && Array.isArray(param.enum)) {
    return (
      <select
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={String(value ?? param.default ?? "")}
        onChange={(e) => onChange(e.target.value)}
      >
        {param.enum.map((opt) => (
          <option key={String(opt)} value={String(opt)}>
            {String(opt)}
          </option>
        ))}
      </select>
    );
  }

  if (param.type === "boolean") {
    return (
      <Switch
        checked={Boolean(value ?? param.default ?? false)}
        onCheckedChange={(checked) => onChange(checked)}
      />
    );
  }

  if (param.type === "number") {
    return (
      <Input
        type="number"
        min={param.min}
        max={param.max}
        value={value !== undefined ? Number(value) : param.default !== undefined ? Number(param.default) : ""}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        placeholder={param.description}
      />
    );
  }

  if (param.type === "array" || param.type === "object") {
    return (
      <textarea
        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
        value={
          value !== undefined
            ? typeof value === "string"
              ? value
              : JSON.stringify(value, null, 2)
            : param.default !== undefined
              ? JSON.stringify(param.default, null, 2)
              : ""
        }
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            onChange(e.target.value);
          }
        }}
        placeholder={`${param.description} (JSON)`}
      />
    );
  }

  return (
    <Input
      type="text"
      value={value !== undefined ? String(value) : param.default !== undefined ? String(param.default) : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={param.description}
      pattern={param.pattern}
    />
  );
}

export default function ToolTesterPage() {
  const { data: apiTools = [], isLoading } = useTools();
  const [tools, setTools] = useState<LocalToolDefinition[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTool, setSelectedTool] = useState<LocalToolDefinition | null>(null);
  const [paramValues, setParamValues] = useState<Record<string, unknown>>({});
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningTest, setRunningTest] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  // Sync API tools to local state
  useEffect(() => {
    if (apiTools.length > 0) {
      setTools(apiTools as LocalToolDefinition[]);
    }
  }, [apiTools]);

  // Reset param values when tool changes
  useEffect(() => {
    if (selectedTool) {
      const defaults: Record<string, unknown> = {};
      for (const p of selectedTool.parameters) {
        if (p.default !== undefined) {
          defaults[p.name] = p.default;
        }
      }
      setParamValues(defaults);
    }
  }, [selectedTool]);

  const loading = isLoading;

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runTest = async () => {
    if (!selectedTool) return;

    // Validate required params
    for (const p of selectedTool.parameters) {
      if (p.required && (paramValues[p.name] === undefined || paramValues[p.name] === "")) {
        alert(`Missing required parameter: ${p.name}`);
        return;
      }
    }

    const testId = `test-${Date.now()}`;
    const newResult: TestResult = {
      id: testId,
      toolId: selectedTool.id,
      toolName: selectedTool.name,
      params: { ...paramValues },
      status: "pending",
      durationMs: 0,
      timestamp: new Date().toISOString(),
    };

    setTestResults((prev) => [newResult, ...prev]);
    setRunningTest(true);
    const startTime = performance.now();

    try {
      if (window.electronAPI?.mcp?.executeTool) {
        const result = await window.electronAPI.mcp.executeTool(selectedTool.name, paramValues);
        const duration = Math.round(performance.now() - startTime);
        setTestResults((prev) =>
          prev.map((r) =>
            r.id === testId
              ? { ...r, status: "success", result, durationMs: duration }
              : r
          )
        );
      } else {
        // Simulate test
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const duration = Math.round(performance.now() - startTime);
        setTestResults((prev) =>
          prev.map((r) =>
            r.id === testId
              ? {
                  ...r,
                  status: Math.random() > 0.2 ? "success" : "error",
                  result: { output: `Simulated result for ${selectedTool.name}`, timestamp: new Date().toISOString() },
                  error: Math.random() > 0.2 ? undefined : "Simulated error: connection timeout",
                  durationMs: duration,
                }
              : r
          )
        );
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      setTestResults((prev) =>
        prev.map((r) =>
          r.id === testId
            ? { ...r, status: "error", error: String(err), durationMs: duration }
            : r
        )
      );
    } finally {
      setRunningTest(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings2Icon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Tool Parameter Tester</h1>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCwIcon className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

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
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : filteredTools.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <WrenchIcon className="text-muted-foreground mb-2 size-8" />
                <p className="text-muted-foreground text-sm">No tools found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted ${
                    selectedTool?.id === tool.id ? "border-primary bg-muted" : ""
                  }`}
                  onClick={() => setSelectedTool(tool)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{tool.name}</span>
                    <StatusBadge status={tool.status} />
                  </div>
                  <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{tool.description}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className={`${sourceColors[tool.source]} text-white text-[10px]`}>
                      {tool.source}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {categoryLabels[tool.category]}
                    </Badge>
                    <span className="text-muted-foreground text-[10px]">{tool.parameters.length} params</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parameter Form */}
        <div className="lg:col-span-2 space-y-4">
          {selectedTool ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedTool.name}</CardTitle>
                      <CardDescription>{selectedTool.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={selectedTool.status} />
                      <Badge className={`${sourceColors[selectedTool.source]} text-white text-xs`}>
                        {selectedTool.source}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTool.parameters.length === 0 ? (
                    <p className="text-muted-foreground text-sm">This tool has no parameters.</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedTool.parameters.map((param) => (
                        <div key={param.name} className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">
                              {param.name}
                              {param.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <Badge variant="outline" className="text-[10px]">{param.type}</Badge>
                            {param.default !== undefined && (
                              <Badge variant="secondary" className="text-[10px]">
                                default: {String(param.default)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">{param.description}</p>
                          <ParamInput
                            param={param}
                            value={paramValues[param.name]}
                            onChange={(val) =>
                              setParamValues((prev) => ({ ...prev, [param.name]: val }))
                            }
                          />
                          {param.min !== undefined && param.max !== undefined && (
                            <p className="text-muted-foreground text-[10px]">
                              Range: {param.min} - {param.max}
                            </p>
                          )}
                          {param.pattern && (
                            <p className="text-muted-foreground text-[10px]">
                              Pattern: {param.pattern}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      onClick={runTest}
                      disabled={runningTest || selectedTool.parameters.length === 0}
                      className="min-w-[120px]"
                    >
                      {runningTest ? (
                        <>
                          <RefreshCwIcon className="size-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <PlayIcon className="size-4 mr-2" />
                          Run Test
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setParamValues({})}
                      disabled={runningTest}
                    >
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Test Results */}
              {testResults.filter((r) => r.toolId === selectedTool.id).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <SendIcon className="size-5" />
                      Test Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {testResults
                      .filter((r) => r.toolId === selectedTool.id)
                      .map((result) => (
                        <div
                          key={result.id}
                          className="rounded-lg border p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <TestStatusBadge status={result.status} />
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ClockIcon className="size-3" />
                                {result.durationMs}ms
                              </span>
                              <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>

                          <div className="text-xs">
                            <span className="text-muted-foreground">Params: </span>
                            <code className="bg-muted px-1 rounded">
                              {JSON.stringify(result.params)}
                            </code>
                          </div>

                          {result.error && (
                            <div className="rounded bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-2">
                              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-medium">
                                <AlertTriangleIcon className="size-3" />
                                Error
                              </div>
                              <p className="text-red-600 dark:text-red-400 text-xs mt-1">{result.error}</p>
                            </div>
                          )}

                          {result.result !== undefined && (
                            <div>
                              <button
                                onClick={() =>
                                  setExpandedResult(expandedResult === result.id ? null : result.id)
                                }
                                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {expandedResult === result.id ? (
                                  <ChevronDownIcon className="size-3" />
                                ) : (
                                  <ChevronRightIcon className="size-3" />
                                )}
                                Result
                              </button>
                              {expandedResult === result.id && (
                                <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto max-h-[200px]">
                                  {typeof result.result === "string"
                                    ? result.result
                                    : JSON.stringify(result.result, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <WrenchIcon className="text-muted-foreground mb-4 size-12" />
                <p className="text-muted-foreground">Select a tool to configure parameters and run tests</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
