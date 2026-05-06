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
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ──────────────────────────────────────────────────────────────────

interface MetricEntry {
  name: string;
  value: number;
  color: string;
}

interface CompareMetricsBarChartProps {
  metricKey: string;
  values: MetricEntry[];
  max: number;
  format?: (v: number) => string;
  loading?: boolean;
  noDataLabel?: string;
}

// ── Tooltip ────────────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  formatFn,
}: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
  formatFn: (v: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0];
  if (!entry) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-1.5 font-medium">{label}</p>
      <div className="flex items-center gap-2 text-sm">
        <span
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: entry.color }}
        />
        <span className="font-semibold text-white">{formatFn(entry.value)}</span>
      </div>
    </div>
  );
}

// ── Chart ──────────────────────────────────────────────────────────────────

export default function CompareMetricsBarChart({
  metricKey,
  values,
  max,
  format = (v) => String(v),
  loading = false,
  noDataLabel = "No data",
}: CompareMetricsBarChartProps) {
  const chartData = useMemo(() => {
    if (!values || values.length === 0) return [];
    // Horizontal bar: sort smallest→largest (bottom→top in chart)
    return [...values]
      .sort((a, b) => a.value - b.value)
      .map((v) => ({
        name: v.name,
        value: v.value,
        color: v.color,
      }));
  }, [values]);

  const gradientId = `metricGradient-${metricKey}`;

  if (loading) {
    return <Skeleton className="h-[140px] w-full rounded-lg" />;
  }

  if (!values || values.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-muted-foreground text-sm">{noDataLabel}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] rounded-lg p-2">
      <ResponsiveContainer width="100%" height={Math.max(100, values.length * 36)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 12, left: -4, bottom: 0 }}
          barSize={20}
        >
          {values.map((v) => (
            <defs key={v.name}>
              <linearGradient
                id={`${gradientId}-${v.name}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor={v.color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={v.color} stopOpacity={1} />
              </linearGradient>
            </defs>
          ))}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1f1f1f"
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="#555"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, max * 1.1]}
            allowDecimals={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#555"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip
            content={<CustomTooltip formatFn={format} />}
          />
          <Bar
            dataKey="value"
            name="Value"
            radius={[0, 3, 3, 0]}
            shape={(props: { x?: number; y?: number; width?: number; height?: number; name?: string }) => {
              const { x = 0, y = 0, width = 0, height = 0, name = "" } = props;
              const entry = values.find((v) => v.name === name);
              const color = entry?.color ?? "#888";
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={`url(#${gradientId}-${name})`}
                  rx={3}
                  ry={3}
                  opacity={0.9}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
