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

interface ToolDataPoint {
  name: string;
  count: number;
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
      <p className="text-sm font-semibold text-white">
        {entry.value} call{entry.value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

interface TopToolsChartProps {
  tools: Array<ToolDataPoint>;
  loading: boolean;
}

export default function TopToolsChart({
  tools,
  loading,
}: TopToolsChartProps) {
  const chartData = useMemo(() => {
    if (!tools || tools.length === 0) return [];
    // Horizontal bar: Y axis uses tool name, so we invert the data layout
    return [...tools]
      .sort((a, b) => a.count - b.count) // ascending for horizontal (bottom→top)
      .map((t) => ({
        name: t.name.length > 20 ? t.name.slice(0, 19) + "…" : t.name,
        calls: t.count,
      }));
  }, [tools]);

  if (loading) {
    return <Skeleton className="h-[220px] w-full rounded-lg" />;
  }

  if (!tools || tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-sm">No tool data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] rounded-lg p-2">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 12, left: -4, bottom: 0 }}
          barSize={18}
        >
          <defs>
            <linearGradient id="colorToolBar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={1} />
            </linearGradient>
          </defs>
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
            allowDecimals={false}
          />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#555"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="calls"
            name="Calls"
            fill="url(#colorToolBar)"
            radius={[0, 3, 3, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
