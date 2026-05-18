"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

interface PoolingResult {
  type: string;
  ratio?: number;
  num_layers?: number;
  hidden_dim?: number;
  assignment_dim?: number;
  aggregator?: string;
}

interface MatchingResult {
  type: string;
  metric?: string;
  num_layers?: number;
  hidden_dim?: number;
  embedding?: number;
  distance?: string;
}

interface AlignmentResult {
  type: string;
  iterations?: number;
  learning_rate?: number;
  hidden_dim?: number;
  cost_matrix?: string;
  regularization?: string;
}

export default function GraphPoolingPage() {
  const [activeTab, setActiveTab] = useState("pooling");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common state
  const [graphId, setGraphId] = useState("graph1");

  // Pooling state
  const [poolType, setPoolType] = useState("diffpool");
  const [ratio, setRatio] = useState(0.5);
  const [poolingLayers, setPoolingLayers] = useState(3);
  const [poolingHidden, setPoolingHidden] = useState(64);
  const [poolingResult, setPoolingResult] = useState<PoolingResult | null>(null);

  // Matching state
  const [matchType, setMatchType] = useState("nmr");
  const [metric, setMetric] = useState("cosine");
  const [matchingLayers, setMatchingLayers] = useState(3);
  const [matchingHidden, setMatchingHidden] = useState(64);
  const [matchingResult, setMatchingResult] = useState<MatchingResult | null>(null);

  // Alignment state
  const [alignType, setAlignType] = useState("ot");
  const [iterations, setIterations] = useState(100);
  const [learningRate, setLearningRate] = useState(0.01);
  const [alignmentHidden, setAlignmentHidden] = useState(64);
  const [alignmentResult, setAlignmentResult] = useState<AlignmentResult | null>(null);

  // Run pooling
  const runPooling = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/pooling/pool`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          pool_type: poolType,
          ratio: ratio,
          num_layers: poolingLayers,
          hidden_dim: poolingHidden,
        }),
      });
      const data = await res.json();
      setPoolingResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run matching
  const runMatching = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/matching/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          match_type: matchType,
          metric: metric,
          num_layers: matchingLayers,
          hidden_dim: matchingHidden,
        }),
      });
      const data = await res.json();
      setMatchingResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run alignment
  const runAlignment = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/alignment/align`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          align_type: alignType,
          num_iterations: iterations,
          learning_rate: learningRate,
          hidden_dim: alignmentHidden,
        }),
      });
      const data = await res.json();
      setAlignmentResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Graph Operations</h1>
          <p className="text-muted-foreground">Pooling, Matching & Alignment</p>
        </div>
        <Badge variant="outline">v1.64</Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="pooling">Graph Pooling</TabsTrigger>
          <TabsTrigger value="matching">Graph Matching</TabsTrigger>
          <TabsTrigger value="alignment">Graph Alignment</TabsTrigger>
        </TabsList>

        {/* Pooling Tab */}
        <TabsContent value="pooling">
          <Card>
            <CardHeader>
              <CardTitle>Graph Pooling</CardTitle>
              <CardDescription>
                Hierarchical graph pooling for graph-level representations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Pooling Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={poolType}
                    onChange={(e) => setPoolType(e.target.value)}
                  >
                    <option value="diffpool">DiffPool</option>
                    <option value="topk">TopK</option>
                    <option value="sag">SAG</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Pooling Ratio</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={ratio}
                    onChange={(e) => setRatio(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={poolingHidden}
                    onChange={(e) => setPoolingHidden(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of Layers</Label>
                  <Input
                    type="number"
                    value={poolingLayers}
                    onChange={(e) => setPoolingLayers(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runPooling} disabled={loading}>
                {loading ? "Pooling..." : "Run Graph Pooling"}
              </Button>

              {poolingResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(poolingResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matching Tab */}
        <TabsContent value="matching">
          <Card>
            <CardHeader>
              <CardTitle>Graph Matching</CardTitle>
              <CardDescription>
                Find correspondences between graph structures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Matching Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value)}
                  >
                    <option value="nmr">NMR</option>
                    <option value="gmn">GMN</option>
                    <option value="igm">IGM</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Metric</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                  >
                    <option value="cosine">Cosine</option>
                    <option value="euclidean">Euclidean</option>
                    <option value="hadamard">Hadamard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={matchingHidden}
                    onChange={(e) => setMatchingHidden(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of Layers</Label>
                  <Input
                    type="number"
                    value={matchingLayers}
                    onChange={(e) => setMatchingLayers(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runMatching} disabled={loading}>
                {loading ? "Matching..." : "Run Graph Matching"}
              </Button>

              {matchingResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(matchingResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alignment Tab */}
        <TabsContent value="alignment">
          <Card>
            <CardHeader>
              <CardTitle>Graph Alignment</CardTitle>
              <CardDescription>
                Align nodes across different graphs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Alignment Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={alignType}
                    onChange={(e) => setAlignType(e.target.value)}
                  >
                    <option value="ot">Optimal Transport</option>
                    <option value="deep">Deep Alignment</option>
                    <option value="grail">GRAIL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Iterations</Label>
                  <Input
                    type="number"
                    value={iterations}
                    onChange={(e) => setIterations(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Learning Rate</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={learningRate}
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={alignmentHidden}
                    onChange={(e) => setAlignmentHidden(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runAlignment} disabled={loading}>
                {loading ? "Aligning..." : "Run Graph Alignment"}
              </Button>

              {alignmentResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(alignmentResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}