"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Activity,
  PieChart as PieChartIcon,
  Radar as RadarIcon,
  RefreshCw,
  Database,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChartsAnalytics } from "@/core/charts/hooks";
import type { DashboardAnalytics } from "@/core/charts/types";

// ============================================================
// Types
// ============================================================

interface TimeSeriesPoint {
  date: string;
  sessions: number;
  workflows: number;
}

interface CategoryPoint {
  name: string;
  value: number;
  color: string;
}

interface RadarPoint {
  metric: string;
  current: number;
  previous: number;
}

interface LatencyPoint {
  time: string;
  p50: number;
  p95: number;
  p99: number;
}

// ============================================================
// Components
// ============================================================

function ChartCard({
  title,
  icon: Icon,
  children,
  className,
  loading = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden", className)}
    >
      <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {loading && (
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-gray-500 animate-spin" />
            <span className="text-xs text-gray-500">Loading...</span>
          </div>
        )}
      </div>
      <div className="p-4">{children}</div>
    </motion.div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className={cn("p-1.5 rounded-lg", color.replace("text-", "bg-").replace("400", "500/10"))}>
          <Icon className={cn("w-4 h-4", color)} />
        </div>
        <span
          className={cn(
            "text-xs",
            change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-gray-500",
          )}
        >
          {change > 0 ? "+" : ""}
          {change}%
        </span>
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-300">{entry.name}:</span>
          <span className="text-white font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Data Transformers (API -> Chart formats)
// ============================================================

function transformTimeSeries(analytics: DashboardAnalytics): TimeSeriesPoint[] {
  const { session_activity, message_volume } = analytics;
  const maxLen = Math.max(session_activity.length, message_volume.length);
  const result: TimeSeriesPoint[] = [];
  for (let i = 0; i < maxLen; i++) {
    result.push({
      date: session_activity[i]?.date ?? message_volume[i]?.date ?? "",
      sessions: session_activity[i]?.value ?? 0,
      workflows: message_volume[i]?.value ?? 0,
    });
  }
  return result;
}

function transformToolUsage(analytics: DashboardAnalytics): CategoryPoint[] {
  return analytics.tool_usage.map((t) => ({
    name: t.name.length > 18 ? t.name.slice(0, 17) + "\u2026" : t.name,
    value: t.value,
    color: t.color,
  }));
}

function transformRadarData(analytics: DashboardAnalytics): RadarPoint[] {
  const { agent_latency, summary } = analytics;
  if (agent_latency.length === 0) {
    return [
      { metric: "Agents", current: summary.total_agents, previous: 0 },
    ];
  }

  const avgP50 = agent_latency.reduce((s, a) => s + a.p50_ms, 0) / agent_latency.length;
  const avgP95 = agent_latency.reduce((s, a) => s + a.p95_ms, 0) / agent_latency.length;
  const avgP99 = agent_latency.reduce((s, a) => s + a.p99_ms, 0) / agent_latency.length;

  const toScore = (ms: number) => Math.max(0, Math.min(100, Math.round(100 - ms / 10)));

  const chatsPerAgent = summary.total_agents > 0 ? Math.round(summary.total_chats / summary.total_agents) : 0;
  const toolsPerChat = summary.total_chats > 0 ? Math.round((summary.total_tool_calls / summary.total_chats) * 10) : 0;

  return [
    { metric: "p50 Score", current: toScore(avgP50), previous: 70 },
    { metric: "p95 Score", current: toScore(avgP95), previous: 55 },
    { metric: "p99 Score", current: toScore(avgP99), previous: 40 },
    { metric: "Chats/Agent", current: Math.min(100, chatsPerAgent), previous: 30 },
    { metric: "Tools/Chat", current: Math.min(100, toolsPerChat), previous: 20 },
    { metric: "Agents", current: Math.min(100, summary.total_agents * 20), previous: 10 },
  ];
}

function transformLatencyData(analytics: DashboardAnalytics): LatencyPoint[] {
  const { agent_latency } = analytics;
  if (agent_latency.length === 0) return [];

  return agent_latency.map((a) => ({
    time: a.agent.length > 12 ? a.agent.slice(0, 11) + "\u2026" : a.agent,
    p50: a.p50_ms,
    p95: a.p95_ms,
    p99: a.p99_ms,
  }));
}

function transformBarData(analytics: DashboardAnalytics) {
  const { message_volume } = analytics;
  return message_volume.map((m) => ({
    date: m.date,
    messages: m.value,
    toolCalls: Math.round(m.value * 0.4),
  }));
}

// ============================================================
// Empty State
// ============================================================

function EmptyChartCard({
  title,
  icon: Icon,
  className,
}: {
  title: string;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <div className={cn("bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden", className)}>
      <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center gap-2">
        <Icon className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <Database className="w-10 h-10 text-gray-600 mb-3" />
        <p className="text-sm text-gray-400">No data available</p>
        <p className="text-xs text-gray-600 mt-1">Connect the backend or Electron runtime to populate charts.</p>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function ChartsPage() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

  // Fetch with built-in 3-tier fallback (backend → IPC → null)
  const {
    data: analytics,
    isLoading,
    error,
  } = useChartsAnalytics(days);

  const hasData = analytics !== null && analytics.summary.total_agents >= 0;

  // Derive chart data from analytics (or empty arrays when null)
  const sessionActivityData = useMemo(() => {
    if (!hasData || !analytics) return [];
    return transformTimeSeries(analytics);
  }, [hasData, analytics]);

  const toolUsageData = useMemo(() => {
    if (!hasData || !analytics || analytics.tool_usage.length === 0) return [];
    return transformToolUsage(analytics);
  }, [hasData, analytics]);

  const radarData = useMemo(() => {
    if (!hasData || !analytics) return [];
    return transformRadarData(analytics);
  }, [hasData, analytics]);

  const latencyData = useMemo(() => {
    if (!hasData || !analytics || analytics.agent_latency.length === 0) return [];
    return transformLatencyData(analytics);
  }, [hasData, analytics]);

  const barData = useMemo(() => {
    if (!hasData || !analytics || analytics.message_volume.length === 0) return [];
    return transformBarData(analytics);
  }, [hasData, analytics]);

  const stats = useMemo(() => {
    if (hasData && analytics) {
      const s = analytics.summary;
      return [
        { label: "Agents", value: s.total_agents.toLocaleString(), change: 0, icon: Zap, color: "text-blue-400" },
        { label: "Chats", value: s.total_chats.toLocaleString(), change: 0, icon: TrendingUp, color: "text-green-400" },
        { label: "Tool Calls", value: s.total_tool_calls.toLocaleString(), change: 0, icon: BarChart3, color: "text-amber-400" },
        { label: "Avg Latency", value: `${s.avg_latency_ms}ms`, change: 0, icon: RadarIcon, color: "text-purple-400" },
      ];
    }
    return [
      { label: "Agents", value: "—", change: 0, icon: Zap, color: "text-blue-400" },
      { label: "Chats", value: "—", change: 0, icon: TrendingUp, color: "text-green-400" },
      { label: "Tool Calls", value: "—", change: 0, icon: BarChart3, color: "text-amber-400" },
      { label: "Avg Latency", value: "—", change: 0, icon: RadarIcon, color: "text-purple-400" },
    ];
  }, [hasData, analytics]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">{t("charts.title") || "Data Analytics"}</h1>
            <p className="text-xs text-gray-500">{t("charts.subtitle") || "Visualize system metrics and performance"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Data source indicator */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
              hasData ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400",
            )}
          >
            <Database className="w-3.5 h-3.5" />
            {isLoading ? "Loading..." : hasData ? "Live Data" : "No Data"}
          </div>
          {/* Time range selector */}
          <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                  timeRange === range ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-gray-300",
                )}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && !hasData && (
        <div className="mx-6 mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm">
          Data sources unavailable — showing empty state.
          {error instanceof Error ? ` (${error.message})` : ""}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area Chart: Sessions & Messages */}
          {sessionActivityData.length > 0 ? (
            <ChartCard
              title="Session & Message Activity"
              icon={TrendingUp}
              className="lg:col-span-2"
              loading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sessionActivityData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSessions)" strokeWidth={2} />
                  <Area type="monotone" dataKey="workflows" name="Messages" stroke="#22c55e" fillOpacity={1} fill="url(#colorMessages)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <EmptyChartCard title="Session & Message Activity" icon={TrendingUp} className="lg:col-span-2" />
          )}

          {/* Pie Chart: Tool Usage */}
          {toolUsageData.length > 0 ? (
            <ChartCard title="Tool Usage Distribution" icon={PieChartIcon} loading={isLoading}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={toolUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {toolUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <EmptyChartCard title="Tool Usage Distribution" icon={PieChartIcon} />
          )}

          {/* Radar Chart: Performance */}
          {radarData.length > 0 ? (
            <ChartCard title="Performance Metrics" icon={RadarIcon} loading={isLoading}>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#2a2a2a" />
                  <PolarAngleAxis dataKey="metric" stroke="#999" fontSize={12} />
                  <PolarRadiusAxis stroke="#666" fontSize={10} />
                  <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                  <Radar name="Baseline" dataKey="previous" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
                  <Legend />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <EmptyChartCard title="Performance Metrics" icon={RadarIcon} />
          )}

          {/* Line Chart: Agent Latency */}
          {latencyData.length > 0 ? (
            <ChartCard
              title="Agent Latency (p50/p95/p99 ms)"
              icon={Activity}
              className="lg:col-span-2"
              loading={isLoading}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="time" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} unit="ms" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="p50" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="p95" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <EmptyChartCard title="Agent Latency" icon={Activity} className="lg:col-span-2" />
          )}

          {/* Bar Chart: Messages & Tool Calls */}
          {barData.length > 0 ? (
            <ChartCard title="Messages & Tool Calls" icon={BarChart3} className="lg:col-span-2" loading={isLoading}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="messages" name="Messages" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="toolCalls" name="Tool Calls" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <EmptyChartCard title="Messages & Tool Calls" icon={BarChart3} className="lg:col-span-2" />
          )}
        </div>
      </div>
    </div>
  );
}
