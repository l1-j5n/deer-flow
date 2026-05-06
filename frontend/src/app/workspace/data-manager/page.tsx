"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  BrainCircuitIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  DownloadIcon,
  FileJsonIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  MemoryStickIcon,
  MessageSquareIcon,
  NetworkIcon,
  RouteIcon,
  ShieldIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface DataModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  recordCount: number;
  sizeBytes: number;
  lastModified: string;
  exportFormats: ("json" | "csv" | "markdown")[];
  importFormats: ("json" | "csv")[];
}

interface ExportJob {
  id: string;
  moduleId: string;
  format: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  startedAt: string;
  completedAt?: string;
  fileName?: string;
  error?: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function generateMockModules(): DataModule[] {
  return [
    {
      id: "sessions",
      name: "Agent Sessions",
      description: "Chat sessions and conversation history",
      icon: <MessageSquareIcon className="size-5" />,
      recordCount: 156,
      sizeBytes: 2457600,
      lastModified: new Date(Date.now() - 86400000).toISOString(),
      exportFormats: ["json", "csv", "markdown"],
      importFormats: ["json"],
    },
    {
      id: "workflows",
      name: "Workflows",
      description: "Workflow definitions and execution history",
      icon: <RouteIcon className="size-5" />,
      recordCount: 42,
      sizeBytes: 890000,
      lastModified: new Date(Date.now() - 172800000).toISOString(),
      exportFormats: ["json", "csv"],
      importFormats: ["json"],
    },
    {
      id: "memories",
      name: "Memories",
      description: "Extracted facts, preferences, and summaries",
      icon: <MemoryStickIcon className="size-5" />,
      recordCount: 328,
      sizeBytes: 1843200,
      lastModified: new Date(Date.now() - 43200000).toISOString(),
      exportFormats: ["json", "csv", "markdown"],
      importFormats: ["json", "csv"],
    },
    {
      id: "knowledge-graph",
      name: "Knowledge Graph",
      description: "Entities, relations, and graph structure",
      icon: <NetworkIcon className="size-5" />,
      recordCount: 512,
      sizeBytes: 3200000,
      lastModified: new Date(Date.now() - 604800000).toISOString(),
      exportFormats: ["json", "csv"],
      importFormats: ["json"],
    },
    {
      id: "tools",
      name: "Tool Registry",
      description: "Tool definitions and usage analytics",
      icon: <WrenchIcon className="size-5" />,
      recordCount: 24,
      sizeBytes: 450000,
      lastModified: new Date(Date.now() - 259200000).toISOString(),
      exportFormats: ["json", "csv"],
      importFormats: ["json"],
    },
    {
      id: "audit",
      name: "Audit Log",
      description: "Security and system audit events",
      icon: <ShieldIcon className="size-5" />,
      recordCount: 2048,
      sizeBytes: 5242880,
      lastModified: new Date(Date.now() - 3600000).toISOString(),
      exportFormats: ["json", "csv"],
      importFormats: [],
    },
    {
      id: "collaboration",
      name: "Collaboration",
      description: "Multi-agent sessions and task graphs",
      icon: <UsersIcon className="size-5" />,
      recordCount: 18,
      sizeBytes: 720000,
      lastModified: new Date(Date.now() - 345600000).toISOString(),
      exportFormats: ["json", "csv", "markdown"],
      importFormats: ["json"],
    },
    {
      id: "reasoning",
      name: "Reasoning Traces",
      description: "Agent reasoning steps and traces",
      icon: <BrainCircuitIcon className="size-5" />,
      recordCount: 89,
      sizeBytes: 1560000,
      lastModified: new Date(Date.now() - 129600000).toISOString(),
      exportFormats: ["json", "markdown"],
      importFormats: ["json"],
    },
  ];
}

const formatIcons: Record<string, React.ReactNode> = {
  json: <FileJsonIcon className="size-4" />,
  csv: <FileSpreadsheetIcon className="size-4" />,
  markdown: <FileTextIcon className="size-4" />,
};

export default function DataManagerPage() {
  const [modules, setModules] = useState<DataModule[]>([]);
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("json");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!window.electronAPI) {
        setModules(generateMockModules());
        setLoading(false);
        return;
      }
      try {
        setModules(generateMockModules());
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleExport = (moduleId: string, format: string) => {
    const job: ExportJob = {
      id: `job-${Date.now()}`,
      moduleId,
      format,
      status: "running",
      progress: 0,
      startedAt: new Date().toISOString(),
    };
    setJobs((prev) => [...prev, job]);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? {
                  ...j,
                  progress: 100,
                  status: "completed",
                  completedAt: new Date().toISOString(),
                  fileName: `${moduleId}-export-${Date.now()}.${format}`,
                }
              : j
          )
        );
      } else {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, progress } : j))
        );
      }
    }, 500);
  };

  const handleImport = (moduleId: string) => {
    setImporting(true);
    setSelectedModule(moduleId);
    // Simulate import
    setTimeout(() => {
      setImporting(false);
      setSelectedModule(null);
    }, 2000);
  };

  const totalRecords = modules.reduce((sum, m) => sum + m.recordCount, 0);
  const totalSize = modules.reduce((sum, m) => sum + m.sizeBytes, 0);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DatabaseIcon className="size-7 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Manager</h1>
            <p className="text-muted-foreground text-sm">
              Export and import data across all modules
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
              <p className="text-muted-foreground text-xs">Across {modules.length} modules</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(totalSize)}</div>
              <p className="text-muted-foreground text-xs">Total data size</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobs.filter((j) => j.status === "running").length}
              </div>
              <p className="text-muted-foreground text-xs">
                {jobs.filter((j) => j.status === "completed").length} completed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Jobs */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Export Jobs</CardTitle>
            <CardDescription>Track your data export progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {job.status === "completed" ? (
                      <CheckCircle2Icon className="size-4 text-green-500" />
                    ) : job.status === "running" ? (
                      <ArrowDownToLineIcon className="size-4 text-blue-500 animate-pulse" />
                    ) : (
                      <DownloadIcon className="size-4" />
                    )}
                    <span className="text-sm font-medium">
                      {modules.find((m) => m.id === job.moduleId)?.name ?? job.moduleId}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {job.format.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {job.status === "completed"
                      ? "Done"
                      : job.status === "running"
                      ? `${Math.round(job.progress)}%`
                      : "Pending"}
                  </span>
                </div>
                {job.status === "running" && (
                  <Progress value={job.progress} className="h-2" />
                )}
                {job.fileName && (
                  <p className="text-muted-foreground text-xs">{job.fileName}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Modules Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Card key={module.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    {module.icon}
                    <CardTitle className="text-base">{module.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {module.recordCount} records
                  </Badge>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-medium">{formatBytes(module.sizeBytes)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Modified</span>
                  <span className="font-medium">
                    {new Date(module.lastModified).toLocaleDateString()}
                  </span>
                </div>

                {/* Export */}
                <div className="space-y-2">
                  <span className="text-muted-foreground text-xs font-medium">Export</span>
                  <div className="flex flex-wrap gap-1">
                    {module.exportFormats.map((format) => (
                      <Button
                        key={format}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleExport(module.id, format)}
                      >
                        {formatIcons[format]}
                        <span className="ml-1">{format.toUpperCase()}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Import */}
                {module.importFormats.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-xs font-medium">Import</span>
                    <div className="flex flex-wrap gap-1">
                      {module.importFormats.map((format) => (
                        <Button
                          key={format}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleImport(module.id)}
                          disabled={importing && selectedModule === module.id}
                        >
                          <ArrowUpFromLineIcon className="mr-1 size-3" />
                          {importing && selectedModule === module.id
                            ? "Importing..."
                            : `${format.toUpperCase()}`}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
