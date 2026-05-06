"use client";

import {
  ActivityIcon,
  BotIcon,
  BrainCircuitIcon,
  CheckCircle2Icon,
  ClockIcon,
  CpuIcon,
  HardDriveIcon,
  MemoryStickIcon,
  NetworkIcon,
  WrenchIcon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/core/dashboard";
import type { ResourceKPI, ServiceItem } from "@/core/dashboard";

// ═══════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && !loading && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function HealthScoreCard({
  score,
  status,
  loading,
}: {
  score: number;
  status: string;
  loading?: boolean;
}) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 60) return "text-yellow-500";
    return "text-red-500";
  };
  const getStatusIcon = (s: string) => {
    if (s === "healthy") return <CheckCircle2Icon className="size-5 text-green-500" />;
    if (s === "degraded") return <ClockIcon className="size-5 text-yellow-500" />;
    return <XCircleIcon className="size-5 text-red-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ActivityIcon className="size-5" />
          System Health
        </CardTitle>
        <CardDescription>Overall system health status</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className={`text-5xl font-bold ${getColor(score)}`}>{score}</div>
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <span className="text-sm font-medium capitalize">{status}</span>
            </div>
            <Progress value={score} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ServiceStatusList({
  services,
  loading,
}: {
  services: ServiceItem[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NetworkIcon className="size-5" />
            Services
          </CardTitle>
          <CardDescription>Backend service status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NetworkIcon className="size-5" />
          Services
        </CardTitle>
        <CardDescription>Backend service status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.length === 0 ? (
          <p className="text-muted-foreground text-sm">No services detected</p>
        ) : (
          services.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`size-2 rounded-full ${
                    svc.status === "healthy"
                      ? "bg-green-500"
                      : svc.status === "degraded"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
                <span className="text-sm font-medium">{svc.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {svc.responseTimeMs}ms
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ResourceUsageCard({
  resources,
  loading,
}: {
  resources: ResourceKPI | null;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CpuIcon className="size-5" />
          Resources
        </CardTitle>
        <CardDescription>System resource usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading || !resources ? (
          <>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CpuIcon className="size-4" /> CPU
                </span>
                <span>{resources.cpuPercent.toFixed(1)}%</span>
              </div>
              <Progress value={resources.cpuPercent} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <MemoryStickIcon className="size-4" /> Memory
                </span>
                <span>{resources.memoryPercent.toFixed(1)}%</span>
              </div>
              <Progress value={resources.memoryPercent} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <HardDriveIcon className="size-4" /> Disk
                </span>
                <span>{resources.diskPercent.toFixed(1)}%</span>
              </div>
              <Progress value={resources.diskPercent} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Badge variant="outline" className="text-xs">
          DeerFlow Agent Platform
        </Badge>
      </div>

      {/* KPI Grid — top row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Health Score"
          value={stats?.health?.score ?? "--"}
          description={
            stats
              ? `${stats.health.healthyServices}/${stats.health.totalServices} services healthy`
              : undefined
          }
          icon={ActivityIcon}
          loading={isLoading}
        />
        <StatCard
          title="Agents"
          value={stats?.agents?.totalAgents ?? "--"}
          description={
            stats
              ? `${stats.agents.totalChats} total chats, ${stats.agents.avgLatencyMs}ms avg`
              : undefined
          }
          icon={BotIcon}
          loading={isLoading}
        />
        <StatCard
          title="Memories"
          value={stats?.memory?.totalMemories ?? "--"}
          description={
            stats
              ? `${stats.memory.totalTopics} topics`
              : undefined
          }
          icon={BrainCircuitIcon}
          loading={isLoading}
        />
        <StatCard
          title="Tools"
          value={stats?.tools?.availableTools ?? "--"}
          description={
            stats
              ? `${stats.tools.totalTools} total registered`
              : undefined
          }
          icon={WrenchIcon}
          loading={isLoading}
        />
      </div>

      {/* Main Content — Health + Services + Resources */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <HealthScoreCard
          score={stats?.health?.score ?? 0}
          status={stats?.health?.status ?? "unknown"}
          loading={isLoading}
        />
        <ServiceStatusList
          services={stats?.services ?? []}
          loading={isLoading}
        />
        <ResourceUsageCard
          resources={stats?.resources ?? null}
          loading={isLoading}
        />
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Navigate to platform modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Health Monitor", href: "/workspace/health", icon: ActivityIcon, desc: "System health & metrics" },
              { label: "Agents Gallery", href: "/workspace/agents", icon: BotIcon, desc: "Browse & manage agents" },
              { label: "Marketplace", href: "/workspace/marketplace", icon: WrenchIcon, desc: "Plugins & skills" },
              { label: "Performance", href: "/workspace/performance", icon: NetworkIcon, desc: "Timing & throughput" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <link.icon className="size-5 text-primary" />
                  <span className="font-medium">{link.label}</span>
                </div>
                <span className="text-muted-foreground text-xs">{link.desc}</span>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
