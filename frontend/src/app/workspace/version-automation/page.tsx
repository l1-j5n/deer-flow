"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

const API_BASE = "";

interface Workflow {
  workflow_id: string;
  name: string;
  description: string;
  status: string;
  run_count: number;
  last_run: string | null;
}

interface RateLimitConfig {
  endpoint: string;
  requests_per_minute: number;
  requests_per_hour: number;
  enabled: boolean;
}

interface RateLimitStats {
  endpoint: string;
  requests_current_minute: number;
  requests_current_hour: number;
  limit_minute: number;
  limit_hour: number;
  remaining_minute: number;
  remaining_hour: number;
}

interface CacheStats {
  total_entries: number;
  total_hits: number;
  total_misses: number;
  hit_rate: number;
}

export default function VersionAutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimitConfig[]>([]);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);

  const userId = "user_" + Math.random().toString(36).substring(2, 8);

  // Load workflows
  const loadWorkflows = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/workflows`);
      setWorkflows(await res.json());
    } catch (e) {
      console.error("Failed to load workflows:", e);
    }
  }, []);

  // Load rate limits
  const loadRateLimits = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/rate-limits/config`);
      setRateLimits(await res.json());
    } catch (e) {
      console.error("Failed to load rate limits:", e);
    }
  }, []);

  // Load cache stats
  const loadCacheStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/cache/stats`);
      setCacheStats(await res.json());
    } catch (e) {
      console.error("Failed to load cache stats:", e);
    }
  }, []);

  useEffect(() => {
    loadWorkflows();
    loadRateLimits();
    loadCacheStats();
  }, [loadWorkflows, loadRateLimits, loadCacheStats]);

  // Create workflow
  const createWorkflow = async (name: string) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/kg/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          description: `Workflow: ${name}`,
          trigger: { event_type: "manual" },
          actions: []
        }),
      });
      loadWorkflows();
    } catch (e) {
      console.error("Failed to create workflow:", e);
    }
    setLoading(false);
  };

  // Run workflow
  const runWorkflow = async (workflowId: string) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/kg/workflows/${workflowId}/run`, { method: "POST" });
      loadWorkflows();
    } catch (e) {
      console.error("Failed to run workflow:", e);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "paused": return "bg-yellow-500";
      case "running": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Workflow Automation
          </h1>
          <p className="text-muted-foreground mt-1">
            Automate workflows, rate limiting, and caching
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          v1.45
        </Badge>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Workflow</CardTitle>
                <CardDescription>Define a new automated workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Workflow Name</Label>
                  <Input placeholder="Enter workflow name" id="wfName" />
                </div>
                <div className="space-y-2">
                  <Label>Trigger Event</Label>
                  <Input placeholder="e.g., entity.created" disabled />
                </div>
                <Button
                  onClick={() => {
                    const input = document.getElementById("wfName") as HTMLInputElement;
                    if (input?.value) createWorkflow(input.value);
                  }}
                  disabled={loading}
                  className="w-full"
                >
                  Create Workflow
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Active Workflows</CardTitle>
                <CardDescription>Manage automated workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {workflows.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        No workflows created yet
                      </p>
                    ) : (
                      workflows.map((wf) => (
                        <div
                          key={wf.workflow_id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{wf.name}</span>
                              <span className={`w-2 h-2 rounded-full ${getStatusColor(wf.status)}`} />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {wf.run_count} runs • Last: {wf.last_run ? new Date(wf.last_run).toLocaleDateString() : "Never"}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => runWorkflow(wf.workflow_id)}
                            >
                              Run
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rate Limits Tab */}
        <TabsContent value="rate-limits">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limit Configuration</CardTitle>
                <CardDescription>Configure API rate limits</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {rateLimits.map((rl, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">{rl.endpoint}</Badge>
                          <Switch checked={rl.enabled} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Per Minute: </span>
                            <span className="font-medium">{rl.requests_per_minute}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Per Hour: </span>
                            <span className="font-medium">{rl.requests_per_hour}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Usage</CardTitle>
                <CardDescription>Current rate limit status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <Label>Default Endpoint</Label>
                    <div className="mt-2 space-y-2">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Minute</span>
                          <span>0 / 60</span>
                        </div>
                        <Progress value={0} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Hour</span>
                          <span>0 / 1000</span>
                        </div>
                        <Progress value={0} />
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Check Current Limits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cache Tab */}
        <TabsContent value="cache">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache Statistics</CardTitle>
                <CardDescription>Cache performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {cacheStats ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">{cacheStats.total_entries}</div>
                      <div className="text-sm text-muted-foreground">Entries</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {(cacheStats.hit_rate * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Hit Rate</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">{cacheStats.total_hits}</div>
                      <div className="text-sm text-muted-foreground">Hits</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-2xl font-bold">{cacheStats.total_misses}</div>
                      <div className="text-sm text-muted-foreground">Misses</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Loading...</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Configuration</CardTitle>
                <CardDescription>Configure caching behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default TTL (seconds)</Label>
                  <Input type="number" defaultValue={300} />
                </div>
                <div className="space-y-2">
                  <Label>Max Entries</Label>
                  <Input type="number" defaultValue={1000} />
                </div>
                <div className="space-y-2">
                  <Label>Eviction Policy</Label>
                  <Input value="LRU" disabled />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Cache Enabled</Label>
                  <Switch defaultChecked />
                </div>
                <Button className="w-full">Save Config</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}