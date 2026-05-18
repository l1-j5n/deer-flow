"use client";

import { useEffect, useState } from "react";
import {
  BarChart3Icon,
  AlertTriangleIcon,
  ActivityIcon,
  LinkIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
  RefreshCwIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ============================================================
// Version Analytics Dashboard Page
// ============================================================

interface VersionStatsSummary {
  total_versions: number;
  total_entities: number;
  total_relations: number;
  total_tags: number;
  avg_entities_per_version: number;
  avg_relations_per_version: number;
  avg_tags_per_version: number;
  most_active_version: string | null;
  least_active_version: string | null;
  versions_with_most_growth: string | null;
  oldest_version: string | null;
  newest_version: string | null;
  timestamp: string;
}

interface VersionAnomaly {
  version_id: string;
  anomaly_type: string;
  severity: string;
  description: string;
  expected_value: number;
  actual_value: number;
  deviation_percent: number;
}

interface VersionAlert {
  alert_id: string;
  version_id: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
}

interface DashboardStats {
  total_versions: number;
  total_entities: number;
  total_relations: number;
  total_tags: number;
  version_change_24h: number;
  entity_change_24h: number;
  relation_change_24h: number;
  top_version: string | null;
  recent_activity: Array<{ version_id: string; timestamp: string; entity_count: number; activity: number }>;
  alerts_count: number;
  health_status: string;
  timestamp: string;
}

interface ComparisonCell {
  version_a: string;
  version_b: string;
  entity_diff: number;
  relation_diff: number;
  tag_diff: number;
  similarity: number;
}

export default function VersionAnalyticsPage() {
  const [stats, setStats] = useState<VersionStatsSummary | null>(null);
  const [anomalies, setAnomalies] = useState<{ anomalies: VersionAnomaly[]; total_checked: number } | null>(null);
  const [alerts, setAlerts] = useState<{ alerts: VersionAlert[]; alert_count: number } | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState("medium");

  // Fetch analytics summary
  const fetchStatsSummary = async () => {
    try {
      const response = await fetch("/api/knowledge-graph/versions/analytics/summary");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  // Fetch anomalies
  const fetchAnomalies = async () => {
    try {
      const response = await fetch(`/api/knowledge-graph/versions/analytics/anomalies?sensitivity=${sensitivity}`);
      if (!response.ok) throw new Error("Failed to fetch anomalies");
      const data = await response.json();
      setAnomalies(data);
    } catch (err) {
      console.error("Anomalies error:", err);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/knowledge-graph/versions/alerts");
      if (!response.ok) throw new Error("Failed to fetch alerts");
      const data = await response.json();
      setAlerts(data);
    } catch (err) {
      console.error("Alerts error:", err);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/knowledge-graph/versions/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await response.json();
      setDashboardStats(data);
    } catch (err) {
      console.error("Dashboard stats error:", err);
    }
  };

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchStatsSummary(), fetchAnomalies(), fetchAlerts(), fetchDashboardStats()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [sensitivity]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500";
      case "warning":
        return "text-orange-500";
      case "high":
        return "text-red-400";
      case "medium":
        return "text-orange-400";
      default:
        return "text-yellow-400";
    }
  };

  // Get severity background
  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-orange-500";
      case "high":
        return "bg-red-400";
      case "medium":
        return "bg-orange-400";
      default:
        return "bg-yellow-400";
    }
  };

  // Get health status color
  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500";
      case "warning":
        return "text-orange-500";
      default:
        return "text-red-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3Icon className="h-8 w-8 text-blue-500" />
            Version Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced analytics, anomaly detection, and dashboard insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sensitivity}
            onChange={(e) => setSensitivity(e.target.value)}
            className="px-3 py-2 rounded border bg-background"
          >
            <option value="low">Low Sensitivity</option>
            <option value="medium">Medium Sensitivity</option>
            <option value="high">High Sensitivity</option>
          </select>
          <Button onClick={loadAllData} disabled={loading}>
            <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dashboard Quick Stats */}
      {!loading && dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Health Status */}
          <Card className={dashboardStats.health_status === "healthy" ? "border-green-500" : dashboardStats.health_status === "warning" ? "border-orange-500" : "border-red-500"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ActivityIcon className="h-4 w-4" />
                Health Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getHealthColor(dashboardStats.health_status)}`}>
                {dashboardStats.health_status.toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardStats.alerts_count} active alerts
              </p>
            </CardContent>
          </Card>

          {/* Versions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3Icon className="h-4 w-4" />
                Total Versions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.total_versions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{dashboardStats.version_change_24h} in 24h
              </p>
            </CardContent>
          </Card>

          {/* Entities */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Total Entities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.total_entities.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{dashboardStats.entity_change_24h} in 24h
              </p>
            </CardContent>
          </Card>

          {/* Top Version */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4" />
                Most Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">
                {dashboardStats.top_version || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                by activity score
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs for detailed sections */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="anomalies">
            Anomalies
            {anomalies && anomalies.anomalies.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5">
                {anomalies.anomalies.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {alerts && alerts.alert_count > 0 && (
              <Badge variant="destructive" className="ml-2 h-5">
                {alerts.alert_count}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          {!loading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Overview */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Version Statistics Overview</CardTitle>
                  <CardDescription>Aggregate statistics across all versions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.total_versions}</div>
                      <div className="text-sm text-muted-foreground">Total Versions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.total_entities.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Entities</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.total_relations.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Relations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.total_tags.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Tags</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Averages */}
              <Card>
                <CardHeader>
                  <CardTitle>Averages</CardTitle>
                  <CardDescription>Per version statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">Entities/Version</span>
                      <span className="font-bold">{stats.avg_entities_per_version}</span>
                    </div>
                    <Progress value={Math.min(stats.avg_entities_per_version * 10, 100)} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">Relations/Version</span>
                      <span className="font-bold">{stats.avg_relations_per_version}</span>
                    </div>
                    <Progress value={Math.min(stats.avg_relations_per_version * 10, 100)} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">Tags/Version</span>
                      <span className="font-bold">{stats.avg_tags_per_version}</span>
                    </div>
                    <Progress value={Math.min(stats.avg_tags_per_version * 10, 100)} className="mt-1" />
                  </div>
                </CardContent>
              </Card>

              {/* Version Highlights */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Version Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <div className="text-xs text-muted-foreground">Most Active</div>
                      <div className="font-bold text-green-500 truncate">
                        {stats.most_active_version || "N/A"}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10">
                      <div className="text-xs text-muted-foreground">Least Active</div>
                      <div className="font-bold text-red-500 truncate">
                        {stats.least_active_version || "N/A"}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <div className="text-xs text-muted-foreground">Most Growth</div>
                      <div className="font-bold text-blue-500 truncate">
                        {stats.versions_with_most_growth || "N/A"}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10">
                      <div className="text-xs text-muted-foreground">Oldest</div>
                      <div className="font-bold text-purple-500 truncate">
                        {stats.oldest_version || "N/A"}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10">
                      <div className="text-xs text-muted-foreground">Newest</div>
                      <div className="font-bold text-orange-500 truncate">
                        {stats.newest_version || "N/A"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies">
          {!loading && anomalies && (
            <Card>
              <CardHeader>
                <CardTitle>Detected Anomalies</CardTitle>
                <CardDescription>
                  {anomalies.total_checked} versions checked, {anomalies.anomalies.length} anomalies found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {anomalies.anomalies.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <CheckCircleIcon className="h-8 w-8 mr-2 text-green-500" />
                    No anomalies detected
                  </div>
                ) : (
                  <div className="space-y-3">
                    {anomalies.anomalies.map((anomaly, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border ${getSeverityBg(anomaly.severity)}/10`}
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangleIcon className={`h-5 w-5 ${getSeverityColor(anomaly.severity)}`} />
                          <div>
                            <div className="font-medium">{anomaly.version_id}</div>
                            <div className="text-sm text-muted-foreground">
                              {anomaly.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={anomaly.severity === "critical" || anomaly.severity === "high" ? "destructive" : "outline"}>
                            {anomaly.anomaly_type}
                          </Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {anomaly.deviation_percent}% deviation
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          {!loading && alerts && (
            <Card>
              <CardHeader>
                <CardTitle>Version Alerts</CardTitle>
                <CardDescription>
                  {alerts.alert_count} active alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alerts.alerts.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <CheckCircleIcon className="h-8 w-8 mr-2 text-green-500" />
                    No alerts
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.alerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          {alert.severity === "critical" ? (
                            <AlertCircleIcon className="h-5 w-5 text-red-500" />
                          ) : alert.severity === "warning" ? (
                            <AlertTriangleIcon className="h-5 w-5 text-orange-500" />
                          ) : (
                            <InfoIcon className="h-5 w-5 text-blue-500" />
                          )}
                          <div>
                            <div className="font-medium">{alert.version_id}</div>
                            <div className="text-sm text-muted-foreground">
                              {alert.message}
                            </div>
                          </div>
                        </div>
                        <Badge variant={alert.severity === "critical" ? "destructive" : alert.severity === "warning" ? "outline" : "secondary"}>
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Insights</CardTitle>
              <CardDescription>Intelligent analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {(!stats || stats.total_versions === 0) ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data available for analysis
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Key Insights */}
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 font-medium text-blue-500 mb-2">
                      <TrendingUpIcon className="h-4 w-4" />
                      Key Observations
                    </div>
                    <ul className="space-y-1 text-sm">
                      <li>• System has {stats.total_versions} versions with {stats.total_entities.toLocaleString()} total entities</li>
                      <li>• Average of {stats.avg_entities_per_version} entities per version</li>
                      {stats.versions_with_most_growth && (
                        <li>• {stats.versions_with_most_growth} shows highest growth rate</li>
                      )}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 font-medium text-green-500 mb-2">
                      <CheckCircleIcon className="h-4 w-4" />
                      Recommendations
                    </div>
                    <ul className="space-y-1 text-sm">
                      {stats.total_versions > 10 && (
                        <li>• Consider archiving older versions to improve performance</li>
                      )}
                      {stats.avg_relations_per_version < stats.avg_entities_per_version * 0.5 && (
                        <li>• Low relation density - consider adding more connections between entities</li>
                      )}
                      {anomalies && anomalies.anomalies.length > 0 && (
                        <li>• Review {anomalies.anomalies.length} detected anomalies for quality issues</li>
                      )}
                      {alerts && alerts.alert_count > 0 && (
                        <li>• Address {alerts.alert_count} active alerts to improve system health</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}