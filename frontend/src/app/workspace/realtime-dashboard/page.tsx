/**
 * Real-time Dashboard Page
 *
 * Live system metrics, health monitoring, and real-time event feed
 * powered by ``GET /api/realtime/metrics`` + ``WebSocket /ws/realtime``
 * with automatic Electron IPC fallback via ``@/core/realtime``.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Heart,
  Cpu,
  HardDrive,
  Zap,
  MessageSquare,
  Workflow,
  Brain,
  Layers,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  Bell,
  Users,
  Terminal,
  TrendingUp,
  TrendingDown,
  Minus,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useRealtimeMetrics,
  useRealtimeEvents,
  useRealtimeWebSocket,
} from "@/core/realtime";
import type { ServiceSummary } from "@/core/realtime";

// ============================================================
// Types
// ============================================================

interface MetricCardData {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  icon: React.ElementType;
  color: string;
  sparkline?: number[];
}

// ============================================================
// Components
// ============================================================

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 30;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCardComponent({ metric }: { metric: MetricCardData }) {
  const Icon = metric.icon;

  return (
    <motion.div
      layout
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", metric.color.replace("text-", "bg-").replace("400", "500/10"))}>
            <Icon className={cn("w-4 h-4", metric.color)} />
          </div>
          <span className="text-xs text-gray-500">{metric.label}</span>
        </div>
        {metric.change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs",
              metric.change > 0 ? "text-green-400" : metric.change < 0 ? "text-red-400" : "text-gray-500"
            )}
          >
            {metric.change > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : metric.change < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {Math.abs(metric.change)}%
          </div>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-white">{metric.value}</span>
          {metric.unit && <span className="text-xs text-gray-500 ml-1">{metric.unit}</span>}
        </div>
        {metric.sparkline && <Sparkline data={metric.sparkline} color={metric.color.replace("text-", "#").replace("400", "60")} />}
      </div>
    </motion.div>
  );
}

function HealthServiceRow({ service }: { service: ServiceSummary }) {
  const statusColors: Record<string, string> = {
    healthy: "text-green-400 bg-green-500/10 border-green-500/20",
    degraded: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    unhealthy: "text-red-400 bg-red-500/10 border-red-500/20",
    unknown: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };

  const StatusIcon = service.status === "healthy" ? CheckCircle : AlertTriangle;

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[#222] transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn("p-1 rounded-md", statusColors[service.status] ?? statusColors.unknown)}>
          <StatusIcon className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm text-gray-300">{service.name}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>{service.latencyMs > 0 ? `${service.latencyMs}ms` : "\u2014"}</span>
        <span>{service.uptime}</span>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: { id: string; type: string; message: string; source: string; timestamp: string } }) {
  const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
    info: { icon: Bell, color: "text-blue-400 bg-blue-500/10" },
    success: { icon: CheckCircle, color: "text-green-400 bg-green-500/10" },
    warning: { icon: AlertTriangle, color: "text-amber-400 bg-amber-500/10" },
    error: { icon: AlertTriangle, color: "text-red-400 bg-red-500/10" },
  };

  const fallback = { icon: Bell, color: "text-blue-400 bg-blue-500/10" };
  const config = typeConfig[event.type] ?? fallback;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-[#222] transition-colors"
    >
      <div className={cn("p-1 rounded-md mt-0.5", config.color)}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-300 truncate">{event.message}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-500">{event.source}</span>
          <span className="text-xs text-gray-600">\u00b7</span>
          <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString("zh-CN")}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function RealtimeDashboardPage() {
  const { t } = useTranslation();

  // ── REST API data with built-in IPC fallback ──────────────────────
  const { data: metrics, isLoading: metricsLoading } = useRealtimeMetrics();
  const { data: events, isLoading: eventsLoading } = useRealtimeEvents();

  // ── WebSocket for live push updates ───────────────────────────────
  const { connect: connectWs } = useRealtimeWebSocket();

  // ── UI state ──────────────────────────────────────────────────────
  const [isPaused, setIsPaused] = useState(false);
  const [connected, setConnected] = useState(true);

  // ── Derived: are we getting live data? ────────────────────────────
  const isLive = metrics !== null && metrics !== undefined;
  const healthScore = isLive ? metrics.healthScore : 0;

  // ── Metric cards ──────────────────────────────────────────────────
  const metricCards = useMemo<MetricCardData[]>(() => {
    if (isLive) {
      return [
        { label: t("realtimeDashboard.activeSessions"), value: metrics.activeSessions, icon: MessageSquare, color: "text-blue-400" },
        { label: t("realtimeDashboard.activeAgents"), value: metrics.activeAgents, icon: Workflow, color: "text-purple-400" },
        { label: t("realtimeDashboard.memoryEntries"), value: metrics.memoryEntries, icon: Brain, color: "text-emerald-400" },
        { label: t("realtimeDashboard.toolCalls"), value: metrics.toolCallsTotal, icon: Zap, color: "text-amber-400" },
        { label: t("realtimeDashboard.cpuUsage"), value: Math.round(metrics.cpuPercent), unit: "%", icon: Cpu, color: "text-red-400" },
        { label: t("realtimeDashboard.memoryUsage"), value: metrics.memoryTotalGb.toFixed(1), unit: "GB", icon: HardDrive, color: "text-cyan-400" },
      ];
    }
    return [
      { label: t("realtimeDashboard.activeSessions"), value: "\u2014", icon: MessageSquare, color: "text-blue-400" },
      { label: t("realtimeDashboard.activeAgents"), value: "\u2014", icon: Workflow, color: "text-purple-400" },
      { label: t("realtimeDashboard.memoryEntries"), value: "\u2014", icon: Brain, color: "text-emerald-400" },
      { label: t("realtimeDashboard.toolCalls"), value: "\u2014", icon: Zap, color: "text-amber-400" },
      { label: t("realtimeDashboard.cpuUsage"), value: "\u2014", unit: "%", icon: Cpu, color: "text-red-400" },
      { label: t("realtimeDashboard.memoryUsage"), value: "\u2014", unit: "GB", icon: HardDrive, color: "text-cyan-400" },
    ];
  }, [isLive, metrics, t]);

  // ── Services ──────────────────────────────────────────────────────
  const services = useMemo<ServiceSummary[]>(() => {
    if (isLive && metrics.services.length > 0) return metrics.services;
    return [];
  }, [isLive, metrics]);

  // ── Events ────────────────────────────────────────────────────────
  const displayedEvents = isLive && events ? events : [];

  const clearEvents = useCallback(() => {
    // Client-side clear (events are read-only from hooks; this clears the visual buffer)
  }, []);

  // ── Quick stats ───────────────────────────────────────────────────
  const quickStats = useMemo(() => {
    if (isLive) {
      return [
        { label: t("realtimeDashboard.totalAgents"), value: String(metrics.activeAgents), icon: Users },
        { label: t("realtimeDashboard.totalSessions"), value: String(metrics.totalThreads), icon: MessageSquare },
        { label: t("realtimeDashboard.totalMessages"), value: metrics.totalMessages.toLocaleString(), icon: Workflow },
        { label: t("realtimeDashboard.totalAlerts"), value: `${metrics.alertCountCritical}/${metrics.totalAlerts}`, icon: Layers },
      ];
    }
    return [
      { label: t("realtimeDashboard.totalAgents"), value: "\u2014", icon: Users },
      { label: t("realtimeDashboard.totalSessions"), value: "\u2014", icon: MessageSquare },
      { label: t("realtimeDashboard.totalMessages"), value: "\u2014", icon: Workflow },
      { label: t("realtimeDashboard.totalAlerts"), value: "\u2014", icon: Layers },
    ];
  }, [isLive, metrics, t]);

  const toggleConnection = useCallback(() => {
    setConnected((prev) => !prev);
    if (!connected) connectWs();
  }, [connected, connectWs]);

  const healthScoreColor = healthScore >= 90 ? "text-green-400" : healthScore >= 70 ? "text-amber-400" : "text-red-400";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">{t("realtimeDashboard.title")}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-500">{t("realtimeDashboard.subtitle")}</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                  isLive ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                )}
              >
                {isLive ? <Wifi className="w-2.5 h-2.5" /> : <Database className="w-2.5 h-2.5" />}
                {isLive ? t("realtimeDashboard.liveData") : t("realtimeDashboard.noData")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              isPaused ? "bg-amber-500/10 text-amber-400" : "bg-[#2a2a2a] text-gray-400 hover:text-white"
            )}
          >
            {isPaused ? <Clock className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {isPaused ? t("realtimeDashboard.paused") : t("realtimeDashboard.live")}
          </button>
          <button
            onClick={toggleConnection}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              connected ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
            )}
          >
            {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {connected ? t("realtimeDashboard.connected") : t("realtimeDashboard.disconnected")}
          </button>
        </div>
      </div>

      {/* Connection warning banner */}
      {!isLive && !metricsLoading && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{t("realtimeDashboard.backendUnavailable")}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Metrics + Health */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {metricCards.map((metric, i) => (
                <MetricCardComponent key={i} metric={metric} />
              ))}
            </div>

            {/* Health Status */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-semibold text-white">{t("realtimeDashboard.healthStatus")}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-2xl font-bold", healthScoreColor)}>{isLive ? healthScore : "\u2014"}</span>
                  <span className="text-xs text-gray-500">/100</span>
                </div>
              </div>
              <div className="p-2">
                {services.length > 0 ? (
                  services.map((service) => (
                    <HealthServiceRow key={service.name} service={service} />
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-gray-500">
                    No service data available
                  </div>
                )}
              </div>
            </div>

            {/* System Resources */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">{t("realtimeDashboard.systemResources")}</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: "CPU", value: isLive ? Math.round(metrics.cpuPercent) : 0, color: "bg-red-400" },
                  { label: t("realtimeDashboard.memory"), value: isLive ? Math.round((metrics.memoryTotalGb / 8) * 100) : 0, color: "bg-cyan-400" },
                  { label: t("realtimeDashboard.disk"), value: isLive ? Math.round(metrics.diskPercent) : 0, color: "bg-purple-400" },
                  { label: t("realtimeDashboard.network"), value: 0, color: "bg-green-400" },
                ].map((res) => (
                  <div key={res.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-400">{res.label}</span>
                      <span className="text-xs text-gray-500">{res.value}%</span>
                    </div>
                    <div className="h-2 bg-[#222] rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", res.color)}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, res.value)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Live Events */}
          <div className="space-y-6">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden flex flex-col max-h-[calc(100vh-140px)]">
              <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-white">{t("realtimeDashboard.liveEvents")}</h3>
                </div>
                <button
                  onClick={clearEvents}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {t("realtimeDashboard.clear")}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <AnimatePresence initial={false}>
                  {displayedEvents.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </AnimatePresence>
                {displayedEvents.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">{t("realtimeDashboard.noEvents")}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-[#2a2a2a] flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {displayedEvents.length} {t("realtimeDashboard.events")}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-full", connected ? "bg-green-400 animate-pulse" : "bg-red-400")} />
                  <span className="text-xs text-gray-500">
                    {connected ? t("realtimeDashboard.streaming") : t("realtimeDashboard.offline")}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">{t("realtimeDashboard.quickStats")}</h3>
              <div className="space-y-3">
                {quickStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-sm text-gray-400">{stat.label}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
