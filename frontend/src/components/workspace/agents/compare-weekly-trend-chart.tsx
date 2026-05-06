"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ──────────────────────────────────────────────────────────────────

interface AgentWeeklyData {
  name: string;
  weekly_activity: Array<{ day: string; messages: number; tool_calls: number }>;
}

interface CompareWeeklyTrendChartProps {
  data: AgentWeeklyData[];
  colors: string[];
  loading?: boolean;
  noDataLabel?: string;
}

// ── Tooltip ────────────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
  agentNames,
  colors,
}: {
  active?: boolean;
  payload?: Array<{ color: string; value: number }>;
  label?: string;
  agentNames: string[];
  colors: string[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <div key={agentNames[i]} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: colors[i] ?? "#888" }}
          />
          <span className="text-gray-400">{agentNames[i]}:</span>
          <span className="font-semibold text-white">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Legend ─────────────────────────────────────────────────────────────────

function renderLegend(agentNames: string[], colors: string[]) {
  return (
    <div className="flex justify-center gap-4 mb-2">
      {agentNames.map((name, i) => (
        <div key={name} className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-block size-2.5 rounded-full"
            style={{ backgroundColor: colors[i] }}
          />
          <span className="text-gray-300 font-medium">{name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Chart ──────────────────────────────────────────────────────────────────

export default function CompareWeeklyTrendChart({
  data,
  colors,
  loading = false,
  noDataLabel = "No weekly activity data",
}: CompareWeeklyTrendChartProps) {
  const agentNames = useMemo(() => data.map((d) => d.name), [data]);

  // Transform: flatten per-agent weekly_activity into grouped rows
  // Each row = { day, agent1: messages, agent2: messages, ... }
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const days = data[0]?.weekly_activity.map((d) => d.day) ?? [];
    if (days.length === 0) return [];

    return days.map((day, dayIdx) => {
      const row: Record<string, string | number> = { day };
      data.forEach((agent) => {
        const act = agent.weekly_activity[dayIdx];
        // Use agent name as dataKey with sanitized key
        const key = agent.name.replace(/\s/g, "_");
        row[key] = act?.messages ?? 0;
      });
      return row;
    });
  }, [data]);

  const dataKeys = useMemo(
    () => data.map((d) => d.name.replace(/\s/g, "_")),
    [data],
  );

  if (loading) {
    return <Skeleton className="h-[260px] w-full rounded-lg" />;
  }

  if (!data || data.length === 0 || chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-sm">{noDataLabel}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] rounded-lg p-2">
      {data.length <= 3 && renderLegend(agentNames, colors)}
      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 12, left: -8, bottom: 0 }}
          barGap={2}
        >
          <defs>
            {colors.map((color, i) => (
              <linearGradient
                key={dataKeys[i]}
                id={`weekly-${dataKeys[i]}`}
                x1="0" y1="0" x2="0" y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.85} />
                <stop offset="95%" stopColor={color} stopOpacity={0.25} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
          <XAxis
            dataKey="day"
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
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            content={
              <CustomTooltip agentNames={agentNames} colors={colors} />
            }
          />
          {data.length > 3 && (
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
              iconType="circle"
              iconSize={8}
            />
          )}
          {dataKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              name={agentNames[i]}
              fill={`url(#weekly-${key})`}
              radius={[3, 3, 0, 0]}
              maxBarSize={32}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
