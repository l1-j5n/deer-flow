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

const API_BASE = "";

interface ExportFormat {
  format: string;
  mime_type: string;
  file_extension: string;
  supports_compression: boolean;
}

interface ValidationRule {
  rule_id: string;
  name: string;
  description: string;
  field: string;
  rule_type: string;
  enabled: boolean;
  severity: string;
}

interface ApiEndpoint {
  path: string;
  method: string;
  summary: string;
  tags: string[];
}

interface HealthStatus {
  status: string;
  version: string;
  uptime_seconds: number;
}

export default function VersionExportsPage() {
  const [exportFormats, setExportFormats] = useState<ExportFormat[]>([]);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Load export formats
  const loadExportFormats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/export/formats`, { method: "POST" });
      setExportFormats(await res.json());
    } catch (e) {
      console.error("Failed to load export formats:", e);
    }
  }, []);

  // Load validation rules
  const loadValidationRules = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/validation/rules`);
      setValidationRules(await res.json());
    } catch (e) {
      console.error("Failed to load validation rules:", e);
    }
  }, []);

  // Load API endpoints
  const loadApiEndpoints = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/docs/endpoints`);
      setApiEndpoints(await res.json());
    } catch (e) {
      console.error("Failed to load API endpoints:", e);
    }
  }, []);

  // Load health
  const loadHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/kg/docs/health`);
      setHealth(await res.json());
    } catch (e) {
      console.error("Failed to load health:", e);
    }
  }, []);

  useEffect(() => {
    loadExportFormats();
    loadValidationRules();
    loadApiEndpoints();
    loadHealth();
  }, [loadExportFormats, loadValidationRules, loadApiEndpoints, loadHealth]);

  // Start export
  const startExport = async (format: string) => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/kg/export/graph`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: format,
          include_metadata: true,
          compression: false
        }),
      });
    } catch (e) {
      console.error("Export failed:", e);
    }
    setLoading(false);
  };

  // Toggle validation rule
  const toggleRule = async (ruleId: string) => {
    try {
      await fetch(`${API_BASE}/api/kg/validation/rules/${ruleId}/toggle`, { method: "POST" });
      loadValidationRules();
    } catch (e) {
      console.error("Toggle failed:", e);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "bg-red-500";
      case "warning": return "bg-yellow-500";
      default: return "bg-blue-500";
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-green-500";
      case "POST": return "bg-blue-500";
      case "PUT": return "bg-yellow-500";
      case "DELETE": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
            Export, Validation & Docs
          </h1>
          <p className="text-muted-foreground mt-1">
            Export formats, data validation, and API documentation
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          v1.47
        </Badge>
      </div>

      {/* Health Status */}
      {health && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium text-green-500">API Healthy</span>
            <span className="text-muted-foreground">v{health.version}</span>
            <span className="text-muted-foreground">• {health.uptime_seconds}s uptime</span>
          </div>
        </div>
      )}

      <Tabs defaultValue="exports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exports">Export Formats</TabsTrigger>
          <TabsTrigger value="validation">Validation Rules</TabsTrigger>
          <TabsTrigger value="docs">API Docs</TabsTrigger>
        </TabsList>

        {/* Export Formats Tab */}
        <TabsContent value="exports">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Knowledge Graph</CardTitle>
                <CardDescription>Choose export format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => startExport("json")} disabled={loading}>
                    📄 JSON
                  </Button>
                  <Button variant="outline" onClick={() => startExport("xml")} disabled={loading}>
                    📰 XML
                  </Button>
                  <Button variant="outline" onClick={() => startExport("rdf")} disabled={loading}>
                    🔗 RDF
                  </Button>
                  <Button variant="outline" onClick={() => startExport("ttl")} disabled={loading}>
                    🐢 Turtle
                  </Button>
                  <Button variant="outline" onClick={() => startExport("cypher")} disabled={loading}>
                    🔎 Cypher
                  </Button>
                  <Button variant="outline" onClick={() => startExport("gml")} disabled={loading}>
                    📊 GML
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Available Formats</CardTitle>
                <CardDescription>Supported export formats</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px] pr-4">
                  <div className="space-y-2">
                    {exportFormats.map((fmt, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{fmt.format.toUpperCase()}</div>
                          <div className="text-sm text-muted-foreground">
                            {fmt.mime_type} • {fmt.file_extension}
                          </div>
                        </div>
                        <Badge variant={fmt.supports_compression ? "default" : "secondary"}>
                          {fmt.supports_compression ? "Compression ✓" : "No Compression"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Validation Rules Tab */}
        <TabsContent value="validation">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Validation Rules</CardTitle>
                <CardDescription>Data validation rules</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {validationRules.map((rule) => (
                      <div key={rule.rule_id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(rule.severity)}>{rule.severity}</Badge>
                            <span className="font-medium">{rule.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {rule.description} • Field: {rule.field}
                          </div>
                        </div>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleRule(rule.rule_id)}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">{validationRules.length}</div>
                    <div className="text-sm text-muted-foreground">Total Rules</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {validationRules.filter(r => r.enabled).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Enabled</div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Test Validation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Documentation Tab */}
        <TabsContent value="docs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>Available API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {apiEndpoints.map((ep, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                        <Badge className={getMethodColor(ep.method)}>{ep.method}</Badge>
                        <span className="font-mono text-sm">{ep.path}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Reference</CardTitle>
                <CardDescription>Full documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>OpenAPI Spec</Label>
                  <Button variant="outline" className="w-full">
                    📄 View OpenAPI.json
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Schemas</Label>
                  <Button variant="outline" className="w-full">
                    📋 View Schemas
                  </Button>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Base URL</div>
                  <div className="font-mono text-sm">/api/kg</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}