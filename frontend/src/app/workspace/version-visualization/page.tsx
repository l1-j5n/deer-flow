"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboardIcon,
  ActivityIcon,
  LineChartIcon,
  BarChart3Icon,
  PieChartIcon,
  GitBranchIcon,
  RefreshCwIcon,
  SettingsIcon,
  EyeIcon,
  TableIcon,
  ClockIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ============================================================
// Version Advanced Visualization Dashboard Page
// ============================================================

interface StreamPoint {
  version_id: string;
  timestamp: string;
  metric: string;
  value: number;
  category: string;
}

interface StreamData {
  points: StreamPoint[];
  total: number;
  has_more: boolean;
}

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  position: Record<string, number>;
  config: Record<string, unknown>;
}

interface DashboardData {
  widgets: DashboardWidget[];
  metrics: Record<string, unknown>;
  summary: Record<string, unknown>;
  timestamp: string;
}

interface TimelineMarker {
  version_id: string;
  position: number;
  label: string;
  type: string;
  metadata: Record<string, unknown>;
}

interface TimelineData {
  markers: TimelineMarker[];
  scale: string;
  range_start: string;
  range_end: string;
  zoom_level: number;
}

interface ComparisonDimension {
  metric: string;
  values: Record<string, number>;
  trend: string;
}

interface VersionRanking {
  version_id: string;
  score: number;
  rank: number;
}

interface ComparisonData {
  versions: string[];
  dimensions: ComparisonDimension[];
  similarity_scores: Record<string, number>;
  ranking: VersionRanking[];
}

// ============================================================
// API Functions
// ============================================================

async function fetchStreamData(metric: string = "changes", limit: number = 50): Promise<StreamData> {
  const res = await fetch(`/api/versions/visualization/stream?metric=${metric}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch stream data");
  return res.json();
}

async function fetchDashboardData(refresh: string = "auto"): Promise<DashboardData> {
  const res = await fetch(`/api/versions/visualization/dashboard?refresh=${refresh}`);
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  return res.json();
}

async function fetchTimelineData(scale: string = "auto", zoom: number = 1.0): Promise<TimelineData> {
  const res = await fetch(`/api/versions/visualization/timeline?scale=${scale}&zoom=${zoom}`);
  if (!res.ok) throw new Error("Failed to fetch timeline data");
  return res.json();
}

async function fetchComparisonData(
  versionIds: string = "",
  dimensions: string = "changes,quality,health,size"
): Promise<ComparisonData> {
  const res = await fetch(
    `/api/versions/visualization/comparison?version_ids=${versionIds}&dimensions=${dimensions}`
  );
  if (!res.ok) throw new Error("Failed to fetch comparison data");
  return res.json();
}

// ============================================================
// Components
// ============================================================

function StreamChart({ data, metric }: { data: StreamData; metric: string }) {
  if (!data.points.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No stream data available
      </div>
    );
  }

  const maxValue = Math.max(...data.points.map((p) => p.value), 1);

  return (
    <div className="space-y-2">
      <div className="relative h-48 w-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="streamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {data.points.map((point, i) => {
            const x = (i / Math.max(data.points.length - 1, 1)) * 100;
            const y = 100 - (point.value / maxValue) * 100;
            return (
              <g key={point.version_id}>
                <line
                  x1={x}
                  y1={y}
                  x2={x}
                  y2="100"
                  stroke="url(#streamGradient)"
                  strokeWidth="2"
                />
                <circle cx={x} cy={y} r="2" fill="hsl(var(--primary))" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data.points[data.points.length - 1]?.version_id}</span>
        <span>{metric}</span>
        <span>{data.points[0]?.version_id}</span>
      </div>
    </div>
  );
}

function WidgetCard({ widget, children }: { widget: DashboardWidget; children: React.ReactNode }) {
  return (
    <Card className="h-full">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm">{widget.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">{children}</CardContent>
    </Card>
  );
}

function TimelineView({ data }: { data: TimelineData }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {data.range_start.slice(0, 10)} - {data.range_end.slice(0, 10)}
        </span>
        <Badge variant="outline">Zoom: {data.zoom_level}x</Badge>
      </div>
      <div className="relative h-32 w-full">
        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-border" />
        {data.markers.map((marker) => (
          <div
            key={marker.version_id}
            className={`absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${
              marker.type === "deprecated"
                ? "bg-destructive"
                : marker.type === "archived"
                ? "bg-yellow-500"
                : "bg-primary"
            }`}
            style={{ left: `${marker.position * 100}%`, top: "50%" }}
            title={`${marker.version_id}: ${marker.label}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {data.markers.slice(0, 8).map((m) => (
          <Badge key={m.version_id} variant="secondary" className="text-xs">
            {m.version_id}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ComparisonTable({ data }: { data: ComparisonData }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Version</th>
            {data.dimensions.map((dim) => (
              <th key={dim.metric} className="text-right p-2">
                {dim.metric}
              </th>
            ))}
            <th className="text-right p-2">Rank</th>
          </tr>
        </thead>
        <tbody>
          {data.ranking.map((r) => (
            <tr key={r.version_id} className="border-b">
              <td className="p-2 font-mono text-xs">{r.version_id}</td>
              {data.dimensions.map((dim) => (
                <td key={dim.metric} className="text-right p-2">
                  {dim.values[r.version_id]?.toFixed(1) || "-"}
                </td>
              ))}
              <td className="text-right p-2">
                <Badge variant={r.rank <= 3 ? "default" : "secondary"}>#{r.rank}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricsGrid({ metrics }: { metrics: Record<string, unknown> }) {
  const metricItems = [
    { key: "total_versions", label: "Versions", icon: GitBranchIcon },
    { key: "total_entities", label: "Entities", icon: TableIcon },
    { key: "avg_quality", label: "Quality", icon: ActivityIcon },
    { key: "avg_health", label: "Health", icon: ZapIcon },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metricItems.map((item) => {
        const Icon = item.icon;
        const value = metrics[item.key as string];
        return (
          <Card key={item.key} className="bg-gradient-to-br from-card to-background">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-bold">{String(value ?? 0)}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function VersionVisualizationPage() {
  const [activeTab, setActiveTab] = useState("stream");
  const [metric, setMetric] = useState("changes");
  const [scale, setScale] = useState("auto");
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [streamData, setStreamData] = useState<StreamData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    try {
      const [stream, dashboard, timeline, comparison] = await Promise.all([
        fetchStreamData(metric),
        fetchDashboardData(),
        fetchTimelineData(scale, zoom),
        fetchComparisonData(),
      ]);

      setStreamData(stream);
      setDashboardData(dashboard);
      setTimelineData(timeline);
      setComparisonData(comparison);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [metric, scale, zoom]);

  if (loading && !streamData) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboardIcon className="w-6 h-6" />
            Version Advanced Visualization
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
            <Button onClick={loadData} className="mt-4">
              <RefreshCwIcon className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboardIcon className="w-6 h-6" />
          Version Advanced Visualization
        </h1>
        <div className="flex items-center gap-2">
          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="changes">Changes</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="health">Health</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadData}>
            <RefreshCwIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Metrics Summary */}
      {dashboardData && <MetricsGrid metrics={dashboardData.metrics} />}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stream" className="flex items-center gap-2">
            <ActivityIcon className="w-4 h-4" />
            Stream
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboardIcon className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4" />
            Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stream" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="w-5 h-5" />
                Real-Time Stream
              </CardTitle>
              <CardDescription>
                Live data stream for {metric} metric ({streamData?.points.length || 0} points)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {streamData && <StreamChart data={streamData} metric={metric} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData?.widgets.map((widget) => (
              <WidgetCard key={widget.id} widget={widget}>
                {widget.type === "line" && (
                  <div className="h-32 flex items-center justify-center text-muted-foreground">
                    <LineChartIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
                {widget.type === "pie" && (
                  <div className="h-32 flex items-center justify-center text-muted-foreground">
                    <PieChartIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
                {widget.type === "gauge" && (
                  <div className="h-32 flex items-center justify-center text-muted-foreground">
                    <ActivityIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
                {widget.type === "timeline" && timelineData && (
                  <TimelineView data={timelineData} />
                )}
                {widget.type === "table" && comparisonData && (
                  <ComparisonTable data={comparisonData} />
                )}
              </WidgetCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Interactive Timeline
              </CardTitle>
              <CardDescription>
                Zoomable timeline view (zoom: {zoom}x)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Select value={scale} onValueChange={setScale}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}>
                  -
                </Button>
                <span className="text-sm">{zoom.toFixed(1)}x</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(10, zoom + 0.1))}>
                  +
                </Button>
              </div>
              {timelineData && <TimelineView data={timelineData} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUpIcon className="w-5 h-5" />
                Dynamic Comparison
              </CardTitle>
              <CardDescription>
                Compare {comparisonData?.versions.length || 0} versions across {comparisonData?.dimensions.length || 0} dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {comparisonData && <ComparisonTable data={comparisonData} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Last updated: {dashboardData?.timestamp.slice(0, 19) || "-"}
        </span>
        <Badge variant="outline">v1.40.0</Badge>
      </div>
    </div>
  );
}