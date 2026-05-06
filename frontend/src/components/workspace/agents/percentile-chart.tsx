"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Gauge } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ──────────────────────────────────────────────────────────────────

interface PercentileData {
  p50_response_time: number | null;
  p95_response_time: number | null;
  p99_response_time: number | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatSec(seconds: number | null | undefined): string {
  if (seconds == null) return "--";
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
  return `${seconds.toFixed(2)}s`;
}

// ── Chart ───────────────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  if (!entry) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1 font-medium">{label}</p>
      <p className="text-sm font-semibold text-white">{formatSec(entry.value)}</p>
    </div>
  );
}

interface ResponseTimePercentileChartProps {
  data: PercentileData | null;
  loading: boolean;
  labels: {
    p50: string;
    p95: string;
    p99: string;
    noData: string;
    noDataHint: string;
  };
}

export default function ResponseTimePercentileChart({
  data,
  loading,
  labels,
}: ResponseTimePercentileChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      { percentile: labels.p50, value: data.p50_response_time ?? 0 },
      { percentile: labels.p95, value: data.p95_response_time ?? 0 },
      { percentile: labels.p99, value: data.p99_response_time ?? 0 },
    ];
  }, [data, labels]);

  const hasData = data != null &&
    (data.p50_response_time != null ||
     data.p95_response_time != null ||
     data.p99_response_time != null);

  if (loading) {
    return <Skeleton className="h-[200px] w-full rounded-lg" />;
  }

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Gauge className="size-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground text-sm">{labels.noData}</p>
        <p className="text-muted-foreground text-xs mt-1">{labels.noDataHint}</p>
      </div>
    );
  }

  const barColors = ["#22c55e", "#f59e0b", "#ef4444"]; // green → amber → red

  return (
    <div className="space-y-3">
      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {chartData.map((item, i) => (
          <span
            key={item.percentile}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
            style={{
              borderColor: `${barColors[i]}33`,
              backgroundColor: `${barColors[i]}18`,
              color: barColors[i],
            }}
          >
            <Gauge className="size-3" />
            {item.percentile}: {formatSec(item.value)}
          </span>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-[#0d0d0d] rounded-lg p-2">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 12, left: -4, bottom: 0 }}
            barSize={48}
          >
            <defs>
              <linearGradient id="colorP50" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.85} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorP95" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.85} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="colorP99" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.85} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis
              dataKey="percentile"
              stroke="#555"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#555"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatSec(v)}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              name="Response Time"
              radius={[4, 4, 0, 0]}
              shape={(props: { x?: number; y?: number; width?: number; height?: number; index?: number }) => {
                const { x = 0, y = 0, width = 0, height = 0, index = 0 } = props;
                const color = barColors[index] ?? barColors[0];
                return (
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={color}
                    rx={4}
                    ry={4}
                    opacity={0.85}
                  />
                );
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
