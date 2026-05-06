"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Clock, Gauge, Timer } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimingHistory } from "@/core/agents/types";

// ── Helpers ────────────────────────────────────────────────────────────────

function formatRelativeTime(now: number, tsSeconds: number): string {
  const diffSec = now / 1000 - tsSeconds;
  if (diffSec < 60) return `${Math.floor(diffSec)}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

function formatMs(ms: number | null | undefined): string {
  if (ms == null) return "--";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ── Chart ───────────────────────────────────────────────────────────────────

interface ChartDataPoint {
  time: string;
  responseTime: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  if (!entry) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1">{entry.name}:</p>
      <p className="text-sm font-semibold text-white">{formatMs(entry.value)}</p>
    </div>
  );
}

interface TimingHistoryChartProps {
  data: TimingHistory | null;
  loading: boolean;
}

export default function TimingHistoryChart({
  data,
  loading,
}: TimingHistoryChartProps) {
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data || data.samples.length === 0) return [];
    const now = Date.now();
    // Show last 50 samples max for readability
    const recent = data.samples.slice(-50);
    return recent.map((s) => ({
      time: formatRelativeTime(now, Number(s.ts)),
      responseTime: s.value_ms,
    }));
  }, [data]);

  // ── Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[240px] w-full rounded-lg" />
        <div className="flex gap-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    );
  }

  // ── Empty state
  if (!data || data.samples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Activity className="size-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">No timing data yet</p>
        <p className="text-muted-foreground text-xs mt-1">
          Response-time samples will appear as the agent serves requests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats badges */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
          <Clock className="size-3" />
          avg {formatMs(data.avg_ms)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
          <Gauge className="size-3" />
          min {formatMs(data.min_ms)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
          <Timer className="size-3" />
          max {formatMs(data.max_ms)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1 text-xs text-gray-400">
          {data.count} samples
        </span>
      </div>

      {/* Area chart */}
      <div className="bg-[#0d0d0d] rounded-lg p-2">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="colorResponseTime" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis
              dataKey="time"
              stroke="#555"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#555"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="ms"
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="responseTime"
              name="Response Time"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorResponseTime)"
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6", stroke: "#0d0d0d", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
