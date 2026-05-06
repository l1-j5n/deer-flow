"use client";

import {
  ArrowLeftIcon,
  BarChart3Icon,
  BotIcon,
  ClockIcon,
  FileTextIcon,
  MessageSquareIcon,
  WrenchIcon,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAgentComparison } from "@/core/agents";
import { useI18n } from "@/core/i18n/hooks";
import CompareMetricsBarChart from "@/components/workspace/agents/compare-metrics-chart";
import CompareWeeklyTrendChart from "@/components/workspace/agents/compare-weekly-trend-chart";
import CompareToolsChart from "@/components/workspace/agents/compare-tools-chart";

// ── Types ──────────────────────────────────────────────────────────────────

interface ComparisonData {
  name: string;
  total_chats: number;
  total_messages: number;
  tool_calls: number;
  avg_response_time: number;
  p50_response_time: number | null;
  p95_response_time: number | null;
  p99_response_time: number | null;
  last_active: string | null;
  weekly_activity: Array<{ day: string; messages: number; tool_calls: number }>;
  top_tools: Array<{ name: string; count: number }>;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function _formatTimeAgo(iso: string | null, t: ReturnType<typeof useI18n>["t"]): string {
  if (!iso) return t("agents.compare.never");
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("agents.compare.justNow");
  if (mins < 60) return t("agents.compare.minutesAgo", { mins: String(mins) });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("agents.compare.hoursAgo", { hours: String(hours) });
  const days = Math.floor(hours / 24);
  return t("agents.compare.daysAgo", { days: String(days) });
}

function getMaxValues(data: ComparisonData[]) {
  return {
    total_chats: Math.max(...data.map((d) => d.total_chats), 1),
    total_messages: Math.max(...data.map((d) => d.total_messages), 1),
    tool_calls: Math.max(...data.map((d) => d.tool_calls), 1),
    avg_response_time: Math.max(...data.map((d) => d.avg_response_time), 0.1),
  };
}

// ── Components ─────────────────────────────────────────────────────────────

function AgentLegend({ agents }: { agents: ComparisonData[] }) {
  const colors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-rose-500",
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {agents.map((agent, i) => (
        <div key={agent.name} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-full ${colors[i]}`} />
          <span className="text-sm font-medium">{agent.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Content Component ─────────────────────────────────────────────────

export function AgentCompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const agentNames = useMemo(() => {
    const raw = searchParams?.get("agents");
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [searchParams]);

  const { comparison, isLoading } = useAgentComparison(agentNames);

  const data: ComparisonData[] = useMemo(() => {
    if (!comparison) return [];
    return comparison.agents.map((item) => ({
      name: item.name,
      total_chats: item.stats.total_chats,
      total_messages: item.stats.total_messages,
      tool_calls: item.stats.tool_calls,
      avg_response_time: item.stats.avg_response_time,
      p50_response_time: item.stats.p50_response_time ?? null,
      p95_response_time: item.stats.p95_response_time ?? null,
      p99_response_time: item.stats.p99_response_time ?? null,
      last_active: item.stats.last_active,
      weekly_activity: item.stats.weekly_activity,
      top_tools: item.stats.top_tools,
    }));
  }, [comparison]);

  const maxValues = useMemo(() => getMaxValues(data), [data]);

  const colors: string[] = [
    "#10b981", // emerald
    "#3b82f6", // blue
    "#f59e0b", // amber
    "#f43f5e", // rose
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl space-y-6 p-6">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 w-full animate-pulse rounded bg-muted" />
          ))}
        </div>
        <div className="h-96 w-full animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3Icon className="text-muted-foreground mb-4 size-16" />
          <h2 className="text-xl font-semibold">{t("agents.compare.selectAgents")}</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            {t("agents.compare.selectAgentsDescription")}
          </p>
          <Button className="mt-6" onClick={() => router.push("/workspace/agents")}>
            <ArrowLeftIcon className="mr-2 size-4" />
            {t("agents.compare.backToAgents")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/workspace/agents")}
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t("agents.compare.title")}</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {t("agents.compare.subtitle")}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/workspace/agents")}
        >
          <BarChart3Icon className="mr-1.5 size-4" />
          {t("agents.compare.changeSelection")}
        </Button>
      </div>

      {/* Agent Legend */}
      <Card>
        <CardContent className="py-4">
          <AgentLegend agents={data} />
        </CardContent>
      </Card>

      {/* Key Metrics Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquareIcon className="size-5" />
              {t("agents.compare.totalChats")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompareMetricsBarChart
              metricKey="chats"
              values={data.map((d, i) => ({
                name: d.name,
                value: d.total_chats,
                color: colors[i] ?? "#10b981",
              }))}
              max={maxValues.total_chats}
              loading={isLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileTextIcon className="size-5" />
              {t("agents.compare.totalMessages")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompareMetricsBarChart
              metricKey="messages"
              values={data.map((d, i) => ({
                name: d.name,
                value: d.total_messages,
                color: colors[i] ?? "#3b82f6",
              }))}
              max={maxValues.total_messages}
              loading={isLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <WrenchIcon className="size-5" />
              {t("agents.compare.toolCalls")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompareMetricsBarChart
              metricKey="toolCalls"
              values={data.map((d, i) => ({
                name: d.name,
                value: d.tool_calls,
                color: colors[i] ?? "#f59e0b",
              }))}
              max={maxValues.tool_calls}
              loading={isLoading}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClockIcon className="size-5" />
              {t("agents.compare.avgResponseTime")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompareMetricsBarChart
              metricKey="avgTime"
              values={data.map((d, i) => ({
                name: d.name,
                value: d.avg_response_time,
                color: colors[i] ?? "#f43f5e",
              }))}
              max={maxValues.avg_response_time}
              format={(v) => `${v.toFixed(1)}s`}
              loading={isLoading}
            />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="size-5" />
            {t("agents.compare.weeklyTrend")}
          </CardTitle>
          <CardDescription>{t("agents.compare.weeklyTrendDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <CompareWeeklyTrendChart
            data={data}
            colors={colors}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Top Tools Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WrenchIcon className="size-5" />
            {t("agents.compare.toolUsageComparison")}
          </CardTitle>
          <CardDescription>{t("agents.compare.toolUsageDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <CompareToolsChart
            data={data}
            colors={colors}
            noToolData={t("agents.compare.noToolData")}
            loading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BotIcon className="size-5" />
            {t("agents.compare.summary")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 text-left font-medium">{t("agents.compare.agent")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("agents.compare.chats")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("agents.compare.messages")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("agents.compare.tools")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("agents.compare.avgTime")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("agents.compare.p50")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("agents.compare.p95")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("agents.compare.p99")}</th>
                  <th className="px-4 py-2 text-right font-medium">{t("agents.compare.lastActive")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((agent) => (
                  <tr key={agent.name} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{agent.name}</td>
                    <td className="px-4 py-3 text-right">{agent.total_chats}</td>
                    <td className="px-4 py-3 text-right">{agent.total_messages}</td>
                    <td className="px-4 py-3 text-right">{agent.tool_calls}</td>
                    <td className="px-4 py-3 text-right">
                      {agent.avg_response_time.toFixed(1)}s
                    </td>
                    <td className="px-4 py-3 text-right">
                      {agent.p50_response_time != null ? `${agent.p50_response_time.toFixed(2)}s` : "--"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {agent.p95_response_time != null ? `${agent.p95_response_time.toFixed(2)}s` : "--"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {agent.p99_response_time != null ? `${agent.p99_response_time.toFixed(2)}s` : "--"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline" className="text-xs">
                        {_formatTimeAgo(agent.last_active, t)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
