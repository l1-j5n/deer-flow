"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

export default function GraphTopologyPage() {
  const [activeTab, setActiveTab] = useState("graphometry");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Graphometry
  const [metricType, setMetricType] = useState("degree");
  const [normalize, setNormalize] = useState(true);
  const [graphometryResult, setGraphometryResult] = useState<any>(null);

  // Topology
  const [analysisType, setAnalysisType] = useState("components");
  const [persistent, setPersistent] = useState(true);
  const [topologyResult, setTopologyResult] = useState<any>(null);

  // Homology
  const [homologyType, setHomologyType] = useState("simplicial");
  const [dimension, setDimension] = useState(2);
  const [field, setField] = useState("z2");
  const [homologyResult, setHomologyResult] = useState<any>(null);

  const runGraphometry = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/graphometry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, metric_type: metricType, normalize }),
      });
      setGraphometryResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runTopology = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/topology`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, analysis_type: analysisType, persistent }),
      });
      setTopologyResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runHomology = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/homology`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, homology_type: homologyType, dimension, field }),
      });
      setHomologyResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runDegree = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/graphometry/degree`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, metric_type: "degree", normalize }),
      });
      setGraphometryResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runCentrality = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/graphometry/centrality`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, metric_type: "centrality", normalize }),
      });
      setGraphometryResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runClustering = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/graphometry/clustering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, metric_type: "clustering", normalize }),
      });
      setGraphometryResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runPageRank = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/graphometry/pagerank`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, metric_type: "pagerank", normalize }),
      });
      setGraphometryResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runComponents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/topology/components`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, analysis_type: "components", persistent }),
      });
      setTopologyResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runConnectivity = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/topology/connectivity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, analysis_type: "connectivity", persistent }),
      });
      setTopologyResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runCycles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/topology/cycles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, analysis_type: "cycles", persistent }),
      });
      setTopologyResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runHomologySimplicial = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/homology/simplicial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, homology_type: "simplicial", dimension, field }),
      });
      setHomologyResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runHomologyPersistent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/homology/persistent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, homology_type: "persistent", dimension, field }),
      });
      setHomologyResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Topology Analysis</h1>
          <p className="text-muted-foreground">Graphometry, Topological Analysis & Homology</p>
        </div>
        <Badge variant="outline">v1.77.0</Badge>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4 text-destructive">{error}</CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="graphometry">Graphometry</TabsTrigger>
          <TabsTrigger value="topology">Topology</TabsTrigger>
          <TabsTrigger value="homology">Homology</TabsTrigger>
        </TabsList>

        {/* Graphometry Tab */}
        <TabsContent value="graphometry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Graph Metrics</CardTitle>
              <CardDescription>Measure degree, centrality, clustering, PageRank</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Metric Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={metricType}
                    onChange={(e) => setMetricType(e.target.value)}
                  >
                    <option value="degree">Degree Distribution</option>
                    <option value="centrality">Centrality</option>
                    <option value="clustering">Clustering Coefficient</option>
                    <option value="pagerank">PageRank</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runGraphometry} disabled={loading}>Run Graphometry</Button>
                <Button variant="secondary" onClick={runDegree} disabled={loading}>Degree</Button>
                <Button variant="secondary" onClick={runCentrality} disabled={loading}>Centrality</Button>
                <Button variant="secondary" onClick={runClustering} disabled={loading}>Clustering</Button>
                <Button variant="secondary" onClick={runPageRank} disabled={loading}>PageRank</Button>
              </div>
              {graphometryResult && (
                <Card className="bg-muted">
                  <CardContent className="pt-4 font-mono text-sm">
                    <pre className="overflow-auto max-h-96">{JSON.stringify(graphometryResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topology Tab */}
        <TabsContent value="topology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Topological Analysis</CardTitle>
              <CardDescription>Components, connectivity, cycles, Eulerian path</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Analysis Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                  >
                    <option value="components">Connected Components</option>
                    <option value="connectivity">Connectivity</option>
                    <option value="cycles">Cycle Detection</option>
                    <option value="eulerian">Eulerian Path</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runTopology} disabled={loading}>Run Topology</Button>
                <Button variant="secondary" onClick={runComponents} disabled={loading}>Components</Button>
                <Button variant="secondary" onClick={runConnectivity} disabled={loading}>Connectivity</Button>
                <Button variant="secondary" onClick={runCycles} disabled={loading}>Cycles</Button>
              </div>
              {topologyResult && (
                <Card className="bg-muted">
                  <CardContent className="pt-4 font-mono text-sm">
                    <pre className="overflow-auto max-h-96">{JSON.stringify(topologyResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Homology Tab */}
        <TabsContent value="homology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homology Analysis</CardTitle>
              <CardDescription>Simplicial, Persistent, Zigzag homology</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Homology Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={homologyType}
                    onChange={(e) => setHomologyType(e.target.value)}
                  >
                    <option value="simplicial">Simplicial</option>
                    <option value="persistent">Persistent</option>
                    <option value="zigzag">Zigzag</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Dimension</Label>
                  <Input type="number" value={dimension} onChange={(e) => setDimension(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runHomology} disabled={loading}>Run Homology</Button>
                <Button variant="secondary" onClick={runHomologySimplicial} disabled={loading}>Simplicial</Button>
                <Button variant="secondary" onClick={runHomologyPersistent} disabled={loading}>Persistent</Button>
              </div>
              {homologyResult && (
                <Card className="bg-muted">
                  <CardContent className="pt-4 font-mono text-sm">
                    <pre className="overflow-auto max-h-96">{JSON.stringify(homologyResult, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}