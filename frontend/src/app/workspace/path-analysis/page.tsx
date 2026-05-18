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

interface PathEntity {
  id: string;
  name: string;
  type: string;
  position: number;
}

interface PathRelation {
  id: string;
  from: string;
  to: string;
  relation_type: string;
}

interface PathResult {
  found: boolean;
  source: string;
  target: string;
  algorithm: string;
  path_length: number;
  path: string[];
  entities: PathEntity[];
  relations: PathRelation[];
}

interface MultiPathResult {
  source: string;
  target: string;
  paths_found: number;
  paths: Array<{ path: string[]; length: number }>;
}

interface PathStats {
  entity: string;
  reachable_entities: number;
  max_depth_reached: number;
  avg_distance: number;
  distance_distribution: Record<string, number>;
}

interface ReachableEntity {
  entity_id: string;
  name: string;
  type: string;
  distance: number;
  relation_type: string;
}

interface PathSummary {
  total_entities: number;
  total_relations: number;
  cached_paths: number;
  top_entities: Array<{ entity: string; degree: number }>;
}

interface TimelineEntry {
  version: string;
  timestamp: string;
  entity_count?: number;
  relation_count?: number;
  type_distribution?: Record<string, number>;
}

interface EvolutionEntry {
  version: string;
  timestamp: string;
  exists: boolean;
  name?: string;
  type?: string;
}

interface EvolutionResult {
  entity_id: string;
  versions_count: number;
  first_seen?: string;
  last_seen?: string;
  history?: EvolutionEntry[];
  changes: Array<{ version: string; changed_fields: string[] }>;
}

interface GrowthMetrics {
  first_version: string;
  last_version: string;
  first_version_entities: number;
  last_version_entities: number;
  entity_growth_percent: number;
  first_version_relations: number;
  last_version_relations: number;
  relation_growth_percent: number;
  avg_growth_rate: number;
}

interface TimeSeriesSummary {
  versions_count: number;
  first_version?: string;
  last_version?: string;
  cached_analyses: number;
}

interface SamplingResult {
  method: string;
  sample_size: number;
  entities: Record<string, unknown>;
  relations?: Record<string, unknown>;
  relation_count?: number;
}

interface ValidationResult {
  sample_size: number;
  original_distribution: Record<string, number>;
  sample_distribution: Record<string, number>;
  distribution_similarity: number;
}

interface SamplingSummary {
  total_entities: number;
  total_relations: number;
  cached_samples: number;
  methods_used: Record<string, number>;
}

export default function PathAnalysisPage() {
  const [activeTab, setActiveTab] = useState("path");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Path analysis state
  const [sourceEntity, setSourceEntity] = useState("");
  const [targetEntity, setTargetEntity] = useState("");
  const [maxDepth, setMaxDepth] = useState(10);
  const [algorithm, setAlgorithm] = useState("bfs");
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [multiPathResult, setMultiPathResult] = useState<MultiPathResult | null>(null);
  const [pathStats, setPathStats] = useState<PathStats | null>(null);
  const [pathSummary, setPathSummary] = useState<PathSummary | null>(null);
  const [reachableEntities, setReachableEntities] = useState<ReachableEntity[]>([]);

  // Time-series state
  const [timelineData, setTimelineData] = useState<TimelineEntry[]>([]);
  const [evolutionResult, setEvolutionResult] = useState<EvolutionResult | null>(null);
  const [evolutionEntity, setEvolutionEntity] = useState("");
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [timeSeriesSummary, setTimeSeriesSummary] = useState<TimeSeriesSummary | null>(null);

  // Sampling state
  const [sampleSize, setSampleSize] = useState(100);
  const [sampleMethod, setSampleMethod] = useState("random_nodes");
  const [sampleSeed, setSampleSeed] = useState<number | undefined>();
  const [samplingResult, setSamplingResult] = useState<SamplingResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [samplingSummary, setSamplingSummary] = useState<SamplingSummary | null>(null);

  const [maxPaths, setMaxPaths] = useState(10);

  // Path Analysis Functions
  const analyzePath = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/path/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_entity: sourceEntity,
          target_entity: targetEntity,
          max_depth: maxDepth,
          algorithm,
        }),
      });
      const data = await res.json();
      setPathResult(data);
    } catch (e) {
      setError("Failed to analyze path");
    }
    setLoading(false);
  };

  const searchPaths = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/path/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: sourceEntity,
          target: targetEntity,
          max_paths: maxPaths,
          max_depth: maxDepth,
          algorithm,
        }),
      });
      const data = await res.json();
      setMultiPathResult(data);
    } catch (e) {
      setError("Failed to search paths");
    }
    setLoading(false);
  };

  const getPathStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/path/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: sourceEntity,
          max_depth: maxDepth,
        }),
      });
      const data = await res.json();
      setPathStats(data);
    } catch (e) {
      setError("Failed to get path statistics");
    }
    setLoading(false);
  };

  const findReachable = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/path/reachable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: sourceEntity,
          max_depth: maxDepth,
        }),
      });
      const data = await res.json();
      setReachableEntities(data.entities || []);
    } catch (e) {
      setError("Failed to find reachable entities");
    }
    setLoading(false);
  };

  const getPathSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/path/summary`);
      const data = await res.json();
      setPathSummary(data);
    } catch (e) {
      console.error("Failed to get path summary");
    }
  };

  // Time-series Functions
  const getTimeline = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/timeseries/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metrics: ["entities", "relations", "types"],
        }),
      });
      const data = await res.json();
      setTimelineData(data.timeline || []);
    } catch (e) {
      setError("Failed to get timeline");
    }
    setLoading(false);
  };

  const trackEvolution = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/timeseries/evolution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: evolutionEntity,
          include_versions: true,
        }),
      });
      const data = await res.json();
      setEvolutionResult(data);
    } catch (e) {
      setError("Failed to track evolution");
    }
    setLoading(false);
  };

  const getGrowth = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/timeseries/growth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setGrowthMetrics(data);
    } catch (e) {
      setError("Failed to get growth metrics");
    }
    setLoading(false);
  };

  const getTimeSeriesSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/timeseries/summary`);
      const data = await res.json();
      setTimeSeriesSummary(data);
    } catch (e) {
      console.error("Failed to get time-series summary");
    }
  };

  // Sampling Functions
  const runSampling = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/sample/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sample_size: sampleSize,
          method: sampleMethod,
          seed: sampleSeed,
        }),
      });
      const data = await res.json();
      setSamplingResult(data);
    } catch (e) {
      setError("Failed to run sampling");
    }
    setLoading(false);
  };

  const validateSample = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/sample/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sample_size: sampleSize,
          method: sampleMethod,
          seed: sampleSeed,
        }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (e) {
      setError("Failed to validate sample");
    }
    setLoading(false);
  };

  const getSamplingSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/sample/summary`);
      const data = await res.json();
      setSamplingSummary(data);
    } catch (e) {
      console.error("Failed to get sampling summary");
    }
  };

  // Load summaries on mount
  useEffect(() => {
    getPathSummary();
    getTimeSeriesSummary();
    getSamplingSummary();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Path Analysis & Sampling</h1>
          <p className="text-muted-foreground">
            Advanced path analysis, time-series, and graph sampling tools
          </p>
        </div>
        <Badge variant="outline">v1.53</Badge>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="path">Path Analysis</TabsTrigger>
          <TabsTrigger value="timeseries">Time-Series</TabsTrigger>
          <TabsTrigger value="sampling">Graph Sampling</TabsTrigger>
        </TabsList>

        {/* Path Analysis Tab */}
        <TabsContent value="path">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Find Shortest Path</CardTitle>
                <CardDescription>
                  Find the shortest path between two entities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Source Entity</Label>
                    <Input
                      value={sourceEntity}
                      onChange={(e) => setSourceEntity(e.target.value)}
                      placeholder="Entity ID"
                    />
                  </div>
                  <div>
                    <Label>Target Entity</Label>
                    <Input
                      value={targetEntity}
                      onChange={(e) => setTargetEntity(e.target.value)}
                      placeholder="Entity ID"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Max Depth</Label>
                    <Input
                      type="number"
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Algorithm</Label>
                    <select
                      className="w-full border rounded p-2"
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value)}
                    >
                      <option value="bfs">BFS</option>
                      <option value="dfs">DFS</option>
                      <option value="dijkstra">Dijkstra</option>
                    </select>
                  </div>
                  <div>
                    <Label>Max Paths</Label>
                    <Input
                      type="number"
                      value={maxPaths}
                      onChange={(e) => setMaxPaths(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={analyzePath} disabled={loading}>
                    Find Path
                  </Button>
                  <Button onClick={searchPaths} disabled={loading} variant="outline">
                    Find All Paths
                  </Button>
                  <Button onClick={getPathStats} disabled={loading} variant="secondary">
                    Statistics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reachable Entities</CardTitle>
                <CardDescription>Find all reachable entities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={findReachable} disabled={loading}>
                  Find Reachable
                </Button>
                {reachableEntities.length > 0 && (
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {reachableEntities.map((entity, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <span className="font-mono text-sm">{entity.entity_id}</span>
                          <Badge>Distance: {entity.distance}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            {/* Path Result */}
            {pathResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Path Result</CardTitle>
                </CardHeader>
                <CardContent>
                  {pathResult.found ? (
                    <div className="space-y-2">
                      <div className="flex gap-4">
                        <Badge>Length: {pathResult.path_length}</Badge>
                        <Badge variant="outline">Algorithm: {pathResult.algorithm}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pathResult.path.map((entityId, idx) => (
                          <Badge key={idx} variant="secondary">
                            {entityId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No path found</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Multi-Path Result */}
            {multiPathResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Multiple Paths</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Found {multiPathResult.paths_found} paths</p>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {multiPathResult.paths.slice(0, 5).map((p, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Badge variant="outline">Path {idx + 1}</Badge>
                          <span className="font-mono text-sm">
                            {p.path.join(" → ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Path Stats */}
            {pathStats && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Path Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entity</p>
                      <p className="font-mono">{pathStats.entity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reachable</p>
                      <p className="font-bold">{pathStats.reachable_entities}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max Depth</p>
                      <p className="font-bold">{pathStats.max_depth_reached}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Distance</p>
                      <p className="font-bold">{pathStats.avg_distance}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Distance Distribution</p>
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(pathStats.distance_distribution).map(([depth, count]) => (
                        <Badge key={depth} variant="outline">
                          Depth {depth}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Path Summary */}
            {pathSummary && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Path Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Entities</p>
                      <p className="font-bold">{pathSummary.total_entities}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Relations</p>
                      <p className="font-bold">{pathSummary.total_relations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cached Paths</p>
                      <p className="font-bold">{pathSummary.cached_paths}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Top Entities by Degree</p>
                  <div className="flex gap-2 flex-wrap">
                    {pathSummary.top_entities.map((item, idx) => (
                      <Badge key={idx} variant="secondary">
                        {item.entity}: {item.degree}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Time-Series Tab */}
        <TabsContent value="timeseries">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline Analysis</CardTitle>
                <CardDescription>View graph changes over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={getTimeline} disabled={loading}>
                  Get Timeline
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entity Evolution</CardTitle>
                <CardDescription>Track entity changes across versions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={evolutionEntity}
                  onChange={(e) => setEvolutionEntity(e.target.value)}
                  placeholder="Entity ID"
                />
                <Button onClick={trackEvolution} disabled={loading}>
                  Track Evolution
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Calculate growth rate over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={getGrowth} disabled={loading}>
                  Get Growth Metrics
                </Button>
              </CardContent>
            </Card>

            {/* Timeline Data */}
            {timelineData.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {timelineData.slice(0, 20).map((entry, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <span className="font-mono text-sm">{entry.version}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">
                              Entities: {entry.entity_count}
                            </Badge>
                            <Badge variant="outline">
                              Relations: {entry.relation_count}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Evolution Result */}
            {evolutionResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Evolution History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entity</p>
                      <p className="font-mono">{evolutionResult.entity_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Versions</p>
                      <p className="font-bold">{evolutionResult.versions_count}</p>
                    </div>
                  </div>
                  {evolutionResult.changes.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Changes</p>
                      {evolutionResult.changes.map((change, idx) => (
                        <div key={idx} className="flex gap-2 mb-1">
                          <Badge variant="outline">{change.version}</Badge>
                          <span className="text-sm">
                            {change.changed_fields.join(", ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Growth Metrics */}
            {growthMetrics && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">First Version</p>
                      <p className="font-mono">{growthMetrics.first_version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Version</p>
                      <p className="font-mono">{growthMetrics.last_version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entity Growth</p>
                      <p className="font-bold text-green-500">
                        {growthMetrics.entity_growth_percent}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Growth Rate</p>
                      <p className="font-bold">{growthMetrics.avg_growth_rate}/version</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time-Series Summary */}
            {timeSeriesSummary && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Time-Series Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Versions</p>
                      <p className="font-bold">{timeSeriesSummary.versions_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">First Version</p>
                      <p className="font-mono">{timeSeriesSummary.first_version}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Version</p>
                      <p className="font-mono">{timeSeriesSummary.last_version}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Sampling Tab */}
        <TabsContent value="sampling">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Graph Sampling</CardTitle>
                <CardDescription>Sample entities from the graph</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sample Size</Label>
                    <Input
                      type="number"
                      value={sampleSize}
                      onChange={(e) => setSampleSize(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Seed (optional)</Label>
                    <Input
                      type="number"
                      value={sampleSeed || ""}
                      onChange={(e) => setSampleSeed(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Sampling Method</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={sampleMethod}
                    onChange={(e) => setSampleMethod(e.target.value)}
                  >
                    <option value="random_nodes">Random Nodes</option>
                    <option value="snowball">Snowball</option>
                    <option value="stratified">Stratified</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={runSampling} disabled={loading}>
                    Run Sampling
                  </Button>
                  <Button onClick={validateSample} disabled={loading} variant="outline">
                    Validate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entity Type Count</CardTitle>
                <CardDescription>Current entity type distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {samplingSummary && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Entities</span>
                      <Badge>{samplingSummary.total_entities}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Relations</span>
                      <Badge>{samplingSummary.total_relations}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Cached Samples</span>
                      <Badge>{samplingSummary.cached_samples}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sampling Result */}
            {samplingResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Sampling Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-mono">{samplingResult.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sample Size</p>
                      <p className="font-bold">{samplingResult.sample_size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relations</p>
                      <p className="font-bold">{samplingResult.relation_count || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Validation Result */}
            {validationResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Validation Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">Distribution Similarity</p>
                    <p className="font-bold text-lg">
                      {validationResult.distribution_similarity}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Original Distribution</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(validationResult.original_distribution).map(
                          ([type, count]) => (
                            <Badge key={type} variant="outline">
                              {type}: {count}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Sample Distribution</p>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(validationResult.sample_distribution).map(
                          ([type, count]) => (
                            <Badge key={type} variant="secondary">
                              {type}: {count}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}