"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const API_BASE = "";

interface Metric {
  metric_id: string;
  value: number;
  label: string;
  change: number;
  trend: string;
}

interface Dashboard {
  dashboard_id: string;
  name: string;
  description: string;
  widgets: Array<{ type: string; title: string }>;
  created_at: string;
}

interface ImportJob {
  job_id: string;
  name: string;
  format: string;
  status: string;
  progress: number;
  records_total: number;
  records_processed: number;
}

interface ExportJob {
  job_id: string;
  name: string;
  format: string;
  status: string;
  output_url: string | null;
}

interface Notification {
  notification_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function VersionAnalyticsV2Page() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = "user_" + Math.random().toString(36).substring(2, 8);

  // Load data
  const loadMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/analytics/metrics?limit=8`);
      setMetrics(await res.json());
    } catch (e) {
      console.error("Failed to load metrics:", e);
    }
  }, []);

  const loadDashboards = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/analytics/dashboards`);
      setDashboards(await res.json());
    } catch (e) {
      console.error("Failed to load dashboards:", e);
    }
  }, []);

  const loadImportJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/import/jobs`);
      setImportJobs(await res.json());
    } catch (e) {
      console.error("Failed to load import jobs:", e);
    }
  }, []);

  const loadExportJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/export/jobs`);
      setExportJobs(await res.json());
    } catch (e) {
      console.error("Failed to load export jobs:", e);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/notifications/${userId}`);
      setNotifications(await res.json());
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
  }, [userId]);

  useEffect(() => {
    loadMetrics();
    loadDashboards();
    loadImportJobs();
    loadExportJobs();
    loadNotifications();
  }, [loadMetrics, loadDashboards, loadImportJobs, loadExportJobs, loadNotifications]);

  // Start import
  const startImport = async (format: string) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/kg/import/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Import ${format}`,
          format: format,
          source: "file",
          mapping: {}
        }),
      });
      loadImportJobs();
    } catch (e) {
      console.error("Failed to start import:", e);
    }
    setLoading(false);
  };

  // Start export
  const startExport = async (format: string) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/kg/export/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Export ${format}`,
          format: format,
          filters: {}
        }),
      });
      loadExportJobs();
    } catch (e) {
      console.error("Failed to start export:", e);
    }
    setLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "↗️";
      case "down": return "↘️";
      default: return "➡️";
    }
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-500";
    if (change < 0) return "text-red-500";
    return "text-gray-500";
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return "✅";
      case "warning": return "⚠️";
      case "error": return "❌";
      case "info": return "ℹ️";
      default: return "📢";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "success": return "bg-green-500";
      case "running": return "bg-blue-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Analytics dashboard, data import/export, and notifications
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          v1.44
        </Badge>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {metrics.map((metric) => (
              <Card key={metric.metric_id}>
                <CardContent className="pt-4">
                  <div className="text-2xl font-bold">{metric.value.toLocaleString()}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{metric.label}</span>
                    <span className={getTrendColor(metric.change)}>
                      {getTrendIcon(metric.trend)} {Math.abs(metric.change)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Time Series</CardTitle>
                <CardDescription>Historical trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <span className="text-muted-foreground">Time series chart would render here</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dashboards</CardTitle>
                <CardDescription>Saved dashboards</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboards.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No dashboards saved</p>
                ) : (
                  <div className="space-y-2">
                    {dashboards.map((d) => (
                      <div key={d.dashboard_id} className="p-2 border rounded">
                        <div className="font-medium">{d.name}</div>
                        <div className="text-sm text-muted-foreground">{d.description}</div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4">
                  Create Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Import Tab */}
        <TabsContent value="import">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Formats</CardTitle>
                <CardDescription>Select format to import</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => startImport("json")} disabled={loading}>
                    📄 Import JSON
                  </Button>
                  <Button onClick={() => startImport("csv")} disabled={loading}>
                    📊 Import CSV
                  </Button>
                  <Button onClick={() => startImport("excel")} disabled={loading}>
                    📗 Import Excel
                  </Button>
                  <Button onClick={() => startImport("xml")} disabled={loading}>
                    �_xml_ Import XML
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import Jobs</CardTitle>
                <CardDescription>Recent import operations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {importJobs.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No import jobs</p>
                    ) : (
                      importJobs.map((job) => (
                        <div key={job.job_id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{job.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {job.records_processed}/{job.records_total} records
                              </div>
                            </div>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </div>
                          <Progress value={job.progress} className="mt-2" />
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Formats</CardTitle>
                <CardDescription>Select format to export</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => startExport("json")} disabled={loading}>
                    📄 Export JSON
                  </Button>
                  <Button onClick={() => startExport("csv")} disabled={loading}>
                    📊 Export CSV
                  </Button>
                  <Button onClick={() => startExport("excel")} disabled={loading}>
                    📗 Export Excel
                  </Button>
                  <Button onClick={() => startExport("pdf")} disabled={loading}>
                    📕 Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Jobs</CardTitle>
                <CardDescription>Recent export operations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-2">
                    {exportJobs.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No export jobs</p>
                    ) : (
                      exportJobs.map((job) => (
                        <div key={job.job_id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{job.name}</div>
                              <div className="text-sm text-muted-foreground">{job.format}</div>
                            </div>
                            <Badge className={getStatusColor(job.status)}>
                              {job.status}
                            </Badge>
                          </div>
                          {job.output_url && (
                            <Button variant="link" size="sm" className="mt-2">
                              Download
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Your recent notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No notifications yet
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.notification_id}
                          className={`p-3 border rounded-lg ${
                            notif.read ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-xl">{getNotificationIcon(notif.type)}</span>
                            <div className="flex-1">
                              <div className="font-medium">{notif.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {notif.message}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(notif.created_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Notifications</Label>
                  <Select defaultValue="enabled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Push Notifications</Label>
                  <Select defaultValue="enabled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notification Types</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge>info</Badge>
                    <Badge>warning</Badge>
                    <Badge>error</Badge>
                    <Badge>success</Badge>
                  </div>
                </div>
                <Button className="w-full">Save Preferences</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}