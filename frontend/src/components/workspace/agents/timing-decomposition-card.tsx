"use client";

import { LayersIcon, ZapIcon, GaugeIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ── Helpers ─────────────────────────────────────────────────────────────

function formatSec(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  if (seconds < 0.001) return "<1ms";
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  return `${seconds.toFixed(2)}s`;
}

function formatMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ── Props ───────────────────────────────────────────────────────────────

export interface TimingDecompositionData {
  /** Average Gateway HTTP response time in seconds.  */
  avg_response_time: number;
  /** Average LangGraph agent processing time in seconds, or null.  */
  langgraph_avg_response_time: number | null;
  /** Average Gateway overhead in ms (HTTP total − LangGraph), or null.  */
  gateway_overhead_ms: number | null;
}

interface TimingDecompositionCardProps {
  data: TimingDecompositionData | undefined;
  loading?: boolean;
  labels: {
    title: string;
    description: string;
    gatewayLabel: string;
    langgraphLabel: string;
    overheadLabel: string;
    noData: string;
    noDataHint: string;
  };
}

// ── Component ──────────────────────────────────────────────────────────

export function TimingDecompositionCard({
  data,
  loading = false,
  labels,
}: TimingDecompositionCardProps) {
  const hasLanggraphData =
    data != null && data.langgraph_avg_response_time != null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayersIcon className="size-5" />
          {labels.title}
        </CardTitle>
        <CardDescription>{labels.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !hasLanggraphData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <LayersIcon className="text-muted-foreground mb-3 size-10" />
            <p className="text-muted-foreground text-sm">{labels.noData}</p>
            <p className="text-muted-foreground/60 mt-1 text-xs">
              {labels.noDataHint}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Gateway HTTP total */}
            <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-2">
                <GaugeIcon className="text-foreground/60 size-4" />
                <span className="text-sm font-medium">{labels.gatewayLabel}</span>
              </div>
              <span className="text-sm tabular-nums font-semibold">
                {formatSec(data.avg_response_time)}
              </span>
            </div>

            {/* LangGraph processing */}
            <div className="border-border bg-primary/5 flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <ZapIcon className="text-primary size-4" />
                <span className="text-sm font-medium">{labels.langgraphLabel}</span>
              </div>
              <span className="text-primary text-sm tabular-nums font-semibold">
                {formatSec(data.langgraph_avg_response_time)}
              </span>
            </div>

            {/* Gateway overhead (computed or from API) */}
            <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
              <div className="flex items-center gap-2">
                <LayersIcon className="text-foreground/60 size-4" />
                <span className="text-sm font-medium">{labels.overheadLabel}</span>
              </div>
              <span className="text-muted-foreground text-sm tabular-nums">
                {formatMs(data.gateway_overhead_ms)}
              </span>
            </div>

            {/* Visual breakdown bar */}
            {data.gateway_overhead_ms != null &&
              data.langgraph_avg_response_time != null && (
                <div className="h-3 w-full overflow-hidden rounded-full">
                  <div className="flex h-full">
                    {/* LangGraph portion */}
                    <div
                      className="bg-primary h-full transition-all"
                      style={{
                        width: `${Math.max(
                          2,
                          (data.langgraph_avg_response_time /
                            data.avg_response_time) *
                            100
                        )}%`,
                      }}
                      title={`LangGraph: ${formatSec(data.langgraph_avg_response_time)}`}
                    />
                    {/* Overhead portion */}
                    <div
                      className="bg-foreground/15 h-full transition-all"
                      style={{
                        width: `${Math.max(
                          2,
                          (data.gateway_overhead_ms / 1000 /
                            data.avg_response_time) *
                            100
                        )}%`,
                      }}
                      title={`Overhead: ${formatMs(data.gateway_overhead_ms)}`}
                    />
                  </div>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TimingDecompositionCard;
