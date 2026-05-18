"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_BASE = "";

interface DashboardData {
  overview: {
    total_entities: number;
    total_relations: number;
    active_users: number;
    queries_today: number;
  };
  trends: Record<string, string>;
  top_entities: Array<{ name: string; connections: number }>;
  activity: {
    exports_today: number;
    imports_today: number;
    api_calls: number;
  };
  health: {
    status: string;
    uptime: string;
    errors_today: number;
  };
}

interface GrowthMetrics {
  entity_growth_rate: number;
  relation_growth_rate: number;
  avg_degree: number;
  density: number;
  clustering_coefficient: number;
  connected_components: number;
}

interface Insight {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  entities: string[];
  severity: string;
}

interface TrendAnalysis {
  metric: string;
  trend: string;
  change_percent: number;
  data_points: Array<{ timestamp: string; value: number; label: string | null }>;
}

export default function VersionAnalyticsDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [growth, setGrowth] = useState<GrowthMetrics | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/kg/analytics/dashboard`);
      const data = await res.json();
      setDashboard(data);
    } catch (e) {
      console.error("Failed to load dashboard:", e);
    }
    setLoading(false);
  };

  const loadGrowth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/analytics/growth`);
      const data = await res.json();
      setGrowth(data);
    } catch (e) {
      console.error("Failed to load growth metrics:", e);
    }
  };

  const loadInsights = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/insights?limit=10`);
      const data = await res.json();
      setInsights(data);
    } catch (e) {
      console.error("Failed to load insights:", e);
    }
  };

  const loadTrends = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/analytics/trends?metric=entities&period=7d`);
      const data = await res.json();
      setTrends(data);
    } catch (e) {
      console.error("Failed to load trends:", e);
    }
  };

  const runAnalysis = async () => {
    try {
      await fetch(`${API_BASE}/api/kg/insights/analyze`, { method: "POST" });
      await loadInsights();
    } catch (e) {
      console.error("Failed to run analysis:", e);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadGrowth();
    loadInsights();
    loadTrends();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing": return "↑";
      case "decreasing": return "↓";
      default: return "→";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights and trends (v1.48.0)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAnalysis} variant="outline">
            Run AI Analysis
          </Button>
          <Button onClick={loadDashboard} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {dashboard && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Entities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard.overview.total_entities}</div>
                  <p className="text-xs text-muted-foreground">in knowledge graph</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Relations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard.overview.total_relations}</div>
                  <p className="text-xs text-muted-foreground">connections</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard.overview.active_users}</div>
                  <p className="text-xs text-muted-foreground">online now</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Queries Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard.overview.queries_today}</div>
                  <p className="text-xs text-muted-foreground">API calls</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Entities</CardTitle>
                <CardDescription>Most connected nodes</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard?.top_entities.map((entity, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <span>{entity.name}</span>
                    <Badge variant="outline">{entity.connections} connections</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Status</CardTitle>
                <CardDescription>System health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant={dashboard?.health.status === "good" ? "default" : "destructive"}>
                      {dashboard?.health.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Uptime</span>
                    <span className="font-mono">{dashboard?.health.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Errors Today</span>
                    <span className="font-mono">{dashboard?.health.errors_today}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          {growth && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Entity Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{(growth.entity_growth_rate * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">per period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Relation Growth Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{(growth.relation_growth_rate * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">per period</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Degree</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{growth.avg_degree}</div>
                  <p className="text-xs text-muted-foreground">connections per node</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Graph Density</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(growth.density * 100).toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground">of max possible</p>
                  <Progress value={growth.density * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Clustering Coefficient</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{growth.clustering_coefficient}</div>
                  <p className="text-xs text-muted-foreground">0-1 scale</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Connected Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{growth.connected_components}</div>
                  <p className="text-xs text-muted-foreground">graph components</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className={insight.severity === "high" ? "border-red-500" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(insight.severity)}>
                        {insight.severity}
                      </Badge>
                      <Badge variant="outline">{insight.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Confidence: {(insight.confidence * 100).toFixed(0)}%
                    </span>
                    {insight.entities.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Entities: {insight.entities.join(", ")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {trends && (
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis: {trends.metric}</CardTitle>
                <CardDescription>
                  {trends.trend} ({getTrendIcon(trends.trend)}{" "}
                  {Math.abs(trends.change_percent).toFixed(1)}%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end gap-2">
                  {trends.data_points.map((point, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary rounded-t"
                      style={{ height: `${(point.value / 100) * 100}%` }}
                      title={`${point.timestamp}: ${point.value}`}
                    />
                  ))}
                </div>
                <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                  <span>{trends.data_points[0]?.timestamp}</span>
                  <span>{trends.data_points[trends.data_points.length - 1]?.timestamp}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}