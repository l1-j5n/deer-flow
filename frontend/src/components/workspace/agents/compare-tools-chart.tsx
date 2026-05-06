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

interface AgentToolData {
  name: string;
  top_tools: Array<{ name: string; count: number }>;
}

interface CompareToolsChartProps {
  data: AgentToolData[];
  colors: string[];
  noToolData: string;
  loading?: boolean;
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
  const total = payload.reduce((sum, e) => sum + (e.value || 0), 0);
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl max-w-[220px]">
      <p className="text-xs text-gray-400 mb-2 font-medium truncate">{label}</p>
      {payload.map((entry, i) => {
        const val = entry.value ?? 0;
        if (val === 0) return null;
        return (
          <div key={agentNames[i]} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block size-2 rounded-full"
              style={{ backgroundColor: colors[i] ?? "#888" }}
            />
            <span className="text-gray-400">{agentNames[i]}:</span>
            <span className="font-semibold text-white">{val}</span>
          </div>
        );
      })}
      <div className="border-t border-[#2a2a2a] mt-1.5 pt-1.5 text-xs text-gray-500">
        Total: {total} calls
      </div>
    </div>
  );
}

// ── Chart ──────────────────────────────────────────────────────────────────

export default function CompareToolsChart({
  data,
  colors,
  noToolData,
  loading = false,
}: CompareToolsChartProps) {
  const agentNames = useMemo(() => data.map((d) => d.name), [data]);

  // Aggregate: merge all tools across agents, compute per-agent counts
  const allTools = useMemo(() => {
    const toolMap = new Map<string, Map<string, number>>();
    data.forEach((agent) => {
      agent.top_tools.forEach((tool) => {
        if (!toolMap.has(tool.name)) {
          toolMap.set(tool.name, new Map());
        }
        toolMap.get(tool.name)!.set(agent.name, tool.count);
      });
    });
    return Array.from(toolMap.entries())
      .map(([name, counts]) => ({
        name,
        total: Array.from(counts.values()).reduce((a, b) => a + b, 0),
        counts,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [data]);

  // Transform for stacked bar chart: each row = { name, agentKey1: count, agentKey2: count, ... }
  const chartData = useMemo(() => {
    return allTools.map((tool) => {
      const row: Record<string, string | number> = {
        name: truncateName(tool.name),
      };
      data.forEach((agent) => {
        const key = agent.name.replace(/\s/g, "_");
        row[key] = tool.counts.get(agent.name) ?? 0;
      });
      return row;
    });
  }, [allTools, data]);

  const dataKeys = useMemo(
    () => data.map((d) => d.name.replace(/\s/g, "_")),
    [data],
  );

  if (loading) {
    return <Skeleton className="h-[240px] w-full rounded-lg" />;
  }

  if (allTools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-muted-foreground text-sm">{noToolData}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] rounded-lg p-2">
      {/* Inline legend */}
      <div className="flex justify-center gap-4 mb-1">
        {agentNames.map((name, i) => (
          <div key={name} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: colors[i] }}
            />
            <span className="text-gray-300 font-medium">{name}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={Math.max(180, allTools.length * 32)}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 12, left: -4, bottom: 0 }}
          barSize={22}
        >
          <defs>
            {colors.map((color, i) => (
              <linearGradient
                key={dataKeys[i]}
                id={`tools-${dataKeys[i]}`}
                x1="0" y1="0" x2="1" y2="0"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0.95} />
              </linearGradient>
            ))}
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
          <Tooltip
            content={
              <CustomTooltip agentNames={agentNames} colors={colors} />
            }
          />
          {dataKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              name={agentNames[i]}
              stackId="tools"
              fill={`url(#tools-${key})`}
              radius={i === dataKeys.length - 1 ? [0, 3, 3, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function truncateName(name: string, maxLen = 20): string {
  return name.length > maxLen ? name.slice(0, maxLen - 1) + "…" : name;
}
