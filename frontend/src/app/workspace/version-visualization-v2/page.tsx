"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_BASE = "";

interface GraphNode {
  id: string;
  label: string;
  type: string;
  data?: Record<string, unknown>;
}

interface GraphLink {
  id: string;
  source: string;
  target: string;
  type: string;
  data?: Record<string, unknown>;
}

interface D3Data {
  nodes: GraphNode[];
  links: GraphLink[];
  metadata: {
    node_count: number;
    link_count: number;
    layout: string;
  };
}

interface CytoscapeElement {
  data: {
    id: string;
    label?: string;
    type?: string;
    source?: string;
    target?: string;
    rawData?: Record<string, unknown>;
  };
}

interface VisNode {
  id: string;
  label: string;
  title?: string;
  group?: string;
}

interface VisEdge {
  from: string;
  to: string;
  label?: string;
}

interface LayoutPosition {
  x: number;
  y: number;
}

interface VisualizationSummary {
  nodes: number;
  edges: number;
  node_types: Record<string, number>;
  relation_types: Record<string, number>;
  density: number;
  cached_layouts: string[];
}

interface AdjacencyData {
  matrix: number[][];
  entities: string[];
  size: number;
}

export default function VisualizationPage() {
  const [d3Data, setD3Data] = useState<D3Data | null>(null);
  const [cytoscapeData, setCytoscapeData] = useState<CytoscapeElement[]>([]);
  const [visData, setVisData] = useState<{ nodes: VisNode[]; edges: VisEdge[] } | null>(null);
  const [layoutData, setLayoutData] = useState<Record<string, LayoutPosition>>({});
  const [summary, setSummary] = useState<VisualizationSummary | null>(null);
  const [adjacencyData, setAdjacencyData] = useState<AdjacencyData | null>(null);
  const [selectedLayout, setSelectedLayout] = useState("force");
  const [selectedFormat, setSelectedFormat] = useState("d3");
  const [entityIds, setEntityIds] = useState("");
  const [depthLimit, setDepthLimit] = useState<number | undefined>(undefined);
  const [includeRelations, setIncludeRelations] = useState(true);
  const [includeAttributes, setIncludeAttributes] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/visualize/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error("Failed to load summary:", e);
    }
  };

  const generateVisualization = async () => {
    setLoading(true);
    try {
      // Parse entity IDs if provided
      let entityIdList: string[] | undefined;
      if (entityIds.trim()) {
        entityIdList = entityIds.split(",").map((s) => s.trim());
      }

      const requestBody: Record<string, unknown> = {
        layout: selectedLayout,
        include_relations: includeRelations,
        include_attributes: includeAttributes,
        depth_limit: depthLimit,
        entity_ids: entityIdList,
      };

      if (selectedFormat === "d3") {
        const res = await fetch(`${API_BASE}/api/knowledge-graph/visualize/d3`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        if (res.ok) {
          const data = await res.json();
          setD3Data(data);
        }
      } else if (selectedFormat === "cytoscape") {
        const res = await fetch(`${API_BASE}/api/knowledge-graph/visualize/cytoscape`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        if (res.ok) {
          const data = await res.json();
          setCytoscapeData(data.elements || []);
        }
      } else if (selectedFormat === "visjs") {
        const res = await fetch(`${API_BASE}/api/knowledge-graph/visualize/visjs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        if (res.ok) {
          const data = await res.json();
          setVisData(data);
        }
      }
    } catch (e) {
      console.error("Failed to generate visualization:", e);
    } finally {
      setLoading(false);
    }
  };

  const generateLayout = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/visualize/layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layout_type: selectedLayout,
          force_strength: 100,
          force_distance: 100,
          centering: true,
          iterations: 100,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setLayoutData(data.positions || {});
      }
    } catch (e) {
      console.error("Failed to generate layout:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadAdjacency = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/visualize/adjacency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        const data = await res.json();
        setAdjacencyData(data);
      }
    } catch (e) {
      console.error("Failed to load adjacency:", e);
    }
  };

  const clearCache = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/visualize/clear-cache`, {
        method: "POST",
      });
      if (res.ok) {
        loadSummary();
      }
    } catch (e) {
      console.error("Failed to clear cache:", e);
    }
  };

  const exportJSON = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderGraphPreview = () => {
    // Simple text-based preview
    if (!d3Data && cytoscapeData.length === 0 && !visData) {
      return (
        <p className="text-muted-foreground">
          Generate visualization to see preview
        </p>
      );
    }

    const nodes = d3Data?.nodes || visData?.nodes || [];
    const links = d3Data?.links || visData?.edges || [];

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Badge variant="outline">{nodes.length} nodes</Badge>
          <Badge variant="outline">{links.length} edges</Badge>
        </div>
        <ScrollArea className="h-[300px]">
          <pre className="text-xs font-mono p-2 bg-muted rounded">
            {JSON.stringify(
              selectedFormat === "d3"
                ? d3Data
                : selectedFormat === "cytoscape"
                ? cytoscapeData
                : visData,
              null,
              2
            ).slice(0, 2000)}
            ...
          </pre>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Visualization</h1>
          <p className="text-muted-foreground">
            Generate visualization data for various libraries
          </p>
        </div>
        <Badge variant="secondary">
          {summary?.nodes || 0} nodes, {summary?.edges || 0} edges
        </Badge>
      </div>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="matrix">Adjacency</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualization Generator</CardTitle>
              <CardDescription>
                Generate visualization data for D3.js, Cytoscape.js, or vis.js
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Format</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                  >
                    <option value="d3">D3.js</option>
                    <option value="cytoscape">Cytoscape.js</option>
                    <option value="visjs">vis.js</option>
                  </select>
                </div>
                <div>
                  <Label>Layout</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded"
                    value={selectedLayout}
                    onChange={(e) => setSelectedLayout(e.target.value)}
                  >
                    <option value="force">Force-directed</option>
                    <option value="hierarchical">Hierarchical</option>
                    <option value="circular">Circular</option>
                    <option value="grid">Grid</option>
                  </select>
                </div>
                <div>
                  <Label>Depth Limit</Label>
                  <Input
                    type="number"
                    value={depthLimit || ""}
                    onChange={(e) =>
                      setDepthLimit(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    placeholder="Unlimited"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    checked={includeRelations}
                    onChange={(e) => setIncludeRelations(e.target.checked)}
                    id="includeRelations"
                  />
                  <Label htmlFor="includeRelations">Relations</Label>
                  <input
                    type="checkbox"
                    checked={includeAttributes}
                    onChange={(e) => setIncludeAttributes(e.target.checked)}
                    id="includeAttributes"
                  />
                  <Label htmlFor="includeAttributes">Attributes</Label>
                </div>
              </div>

              <div>
                <Label>Entity IDs (comma-separated, optional)</Label>
                <Input
                  value={entityIds}
                  onChange={(e) => setEntityIds(e.target.value)}
                  placeholder="entity-1, entity-2, entity-3"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={generateVisualization} disabled={loading}>
                  {loading ? "Generating..." : "Generate"}
                </Button>
                <Button variant="outline" onClick={clearCache}>
                  Clear Cache
                </Button>
              </div>

              <div className="mt-4">{renderGraphPreview()}</div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    exportJSON(
                      d3Data || cytoscapeData || visData,
                      `graph-${selectedFormat}-${Date.now()}.json`
                    )
                  }
                >
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout Generator</CardTitle>
              <CardDescription>
                Compute node positions for custom visualization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select
                  className="p-2 border rounded"
                  value={selectedLayout}
                  onChange={(e) => setSelectedLayout(e.target.value)}
                >
                  <option value="force">Force-directed</option>
                  <option value="hierarchical">Hierarchical</option>
                  <option value="circular">Circular</option>
                  <option value="grid">Grid</option>
                </select>
                <Button onClick={generateLayout} disabled={loading}>
                  {loading ? "Computing..." : "Compute Layout"}
                </Button>
              </div>

              {Object.keys(layoutData).length > 0 && (
                <ScrollArea className="h-[300px]">
                  <pre className="text-xs font-mono p-2 bg-muted rounded">
                    {JSON.stringify(layoutData, null, 2).slice(0, 2000)}
                  </pre>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Adjacency Matrix</CardTitle>
              <CardDescription>
                Generate adjacency matrix for matrix-based visualization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={loadAdjacency}>Generate Matrix</Button>

              {adjacencyData && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {adjacencyData.size} x {adjacencyData.size}
                    </Badge>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <pre className="text-xs font-mono p-2 bg-muted rounded">
                      Entities: {adjacencyData.entities.slice(0, 10).join(", ")}
                      {adjacencyData.entities.length > 10 ? "..." : ""}
                      {"\n\nMatrix preview:"}
                      {adjacencyData.matrix
                        .slice(0, 5)
                        .map((row) => "\n" + row.slice(0, 10).join(" "))}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Graph Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Nodes</span>
                      <Badge>{summary.nodes}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Edges</span>
                      <Badge>{summary.edges}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Density</span>
                      <Badge variant="outline">{summary.density}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cached Layouts</span>
                      <Badge variant="outline">
                        {summary.cached_layouts.length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Node Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(summary.node_types).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="font-mono text-sm">{type}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Relation Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(summary.relation_types).map(
                      ([type, count]) => (
                        <div key={type} className="flex justify-between">
                          <span className="font-mono text-sm">{type}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}