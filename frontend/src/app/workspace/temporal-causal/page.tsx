"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = "";

interface TemporalResult {
  method: string;
  ordered_entities?: string[];
  timestamps?: number[];
  values?: number[];
  rolling_mean?: number[];
  entity?: string;
}

interface CausalResult {
  method: string;
  edges?: number;
  causal_graph?: Record<string, string[]>;
  orientations?: number;
  dag_size?: number;
  score?: number;
}

interface MultiHopResult {
  source: string;
  target: string;
  paths: string[][];
  path_scores: Array<{ path: string[]; score: number }>;
  max_hops: number;
}

export default function TemporalCausalPage() {
  const [activeTab, setActiveTab] = useState("temporal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Temporal state
  const [graphId, setGraphId] = useState("graph1");
  const [temporalMethod, setTemporalMethod] = useState("temporal_order");
  const [temporalEntities, setTemporalEntities] = useState("");
  const [temporalWindow, setTemporalWindow] = useState(10);
  const [temporalResult, setTemporalResult] = useState<TemporalResult | null>(null);

  // Causal state
  const [causalMethod, setCausalMethod] = useState("pc");
  const [effectEntity, setEffectEntity] = useState("");
  const [alpha, setAlpha] = useState(0.05);
  const [causalResult, setCausalResult] = useState<CausalResult | null>(null);

  // Multi-hop state
  const [sourceEntity, setSourceEntity] = useState("");
  const [targetEntity, setTargetEntity] = useState("");
  const [maxHops, setMaxHops] = useState(3);
  const [relationFilter, setRelationFilter] = useState("");
  const [multiHopResult, setMultiHopResult] = useState<MultiHopResult | null>(null);

  // Temporal functions
  const runTemporal = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/temporal/reason`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          method: temporalMethod,
          entities: JSON.parse(temporalEntities || "[]"),
          window: temporalWindow,
        }),
      });
      const data = await res.json();
      setTemporalResult(data);
    } catch (e) {
      setError("Failed to run temporal reasoning");
    }
    setLoading(false);
  };

  const runTemporalOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/temporal/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          method: "temporal_order",
          entities: JSON.parse(temporalEntities || "[]"),
          window: temporalWindow,
        }),
      });
      const data = await res.json();
      setTemporalResult(data);
    } catch (e) {
      setError("Failed to run temporal order");
    }
    setLoading(false);
  };

  const runTimeSeries = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/temporal/series`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          method: "time_series",
          entities: JSON.parse(temporalEntities || "[]"),
          window: temporalWindow,
        }),
      });
      const data = await res.json();
      setTemporalResult(data);
    } catch (e) {
      setError("Failed to run time series");
    }
    setLoading(false);
  };

  // Causal functions
  const runCausal = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/causal/infer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          method: causalMethod,
          effect_entity: effectEntity,
          alpha: alpha,
        }),
      });
      const data = await res.json();
      setCausalResult(data);
    } catch (e) {
      setError("Failed to run causal inference");
    }
    setLoading(false);
  };

  const runPC = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/causal/pc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          method: "pc",
          effect_entity: effectEntity,
          alpha: alpha,
        }),
      });
      const data = await res.json();
      setCausalResult(data);
    } catch (e) {
      setError("Failed to run PC algorithm");
    }
    setLoading(false);
  };

  const runFCI = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/causal/fci`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          method: "fci",
          effect_entity: effectEntity,
          alpha: alpha,
        }),
      });
      const data = await res.json();
      setCausalResult(data);
    } catch (e) {
      setError("Failed to run FCI algorithm");
    }
    setLoading(false);
  };

  // Multi-hop functions
  const runMultiHop = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/multihop/reason`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          source: sourceEntity,
          target: targetEntity,
          max_hops: maxHops,
          relation_filter: JSON.parse(relationFilter || "[]"),
        }),
      });
      const data = await res.json();
      setMultiHopResult(data);
    } catch (e) {
      setError("Failed to run multi-hop reasoning");
    }
    setLoading(false);
  };

  const runPaths = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/multihop/paths`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          source: sourceEntity,
          target: targetEntity,
          max_hops: maxHops,
          relation_filter: JSON.parse(relationFilter || "[]"),
        }),
      });
      const data = await res.json();
      setMultiHopResult(data);
    } catch (e) {
      setError("Failed to find paths");
    }
    setLoading(false);
  };

  const runShortest = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/multihop/shortest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          source: sourceEntity,
          target: targetEntity,
          max_hops: 3,
          relation_filter: JSON.parse(relationFilter || "[]"),
        }),
      });
      const data = await res.json();
      setMultiHopResult(data);
    } catch (e) {
      setError("Failed to find shortest path");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Temporal & Causal Reasoning</h1>
          <p className="text-muted-foreground">
            Temporal reasoning, causality inference, and multi-hop path finding
          </p>
        </div>
        <Badge variant="outline">v1.61</Badge>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">{error}</CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="temporal">Temporal</TabsTrigger>
          <TabsTrigger value="causal">Causality</TabsTrigger>
          <TabsTrigger value="multihop">Multi-hop</TabsTrigger>
        </TabsList>

        {/* Temporal Tab */}
        <TabsContent value="temporal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Temporal Reasoning</CardTitle>
                <CardDescription>
                  Time-ordered reasoning and sequence analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Graph ID</Label>
                  <Input
                    value={graphId}
                    onChange={(e) => setGraphId(e.target.value)}
                    placeholder="graph1"
                  />
                </div>
                <div>
                  <Label>Method</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={temporalMethod}
                    onChange={(e) => setTemporalMethod(e.target.value)}
                  >
                    <option value="temporal_order">Temporal Order</option>
                    <option value="time_series">Time Series</option>
                    <option value="sequence">Sequence</option>
                  </select>
                </div>
                <div>
                  <Label>Window</Label>
                  <Input
                    type="number"
                    value={temporalWindow}
                    onChange={(e) => setTemporalWindow(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Entities (JSON)</Label>
                  <Textarea
                    value={temporalEntities}
                    onChange={(e) => setTemporalEntities(e.target.value)}
                    placeholder='["e1", "e2", "e3"]'
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={runTemporal} disabled={loading}>
                    Reason
                  </Button>
                  <Button onClick={runTemporalOrder} disabled={loading} variant="secondary">
                    Order
                  </Button>
                  <Button onClick={runTimeSeries} disabled={loading} variant="outline">
                    Series
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temporal Results</CardTitle>
                <CardDescription>Results from temporal reasoning</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {temporalResult ? (
                    <pre className="text-xs">
                      {JSON.stringify(temporalResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">
                      Run temporal reasoning to see results
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Causality Tab */}
        <TabsContent value="causal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Causality Inference</CardTitle>
                <CardDescription>
                  PC, FCI, and GES algorithms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Method</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={causalMethod}
                    onChange={(e) => setCausalMethod(e.target.value)}
                  >
                    <option value="pc">PC Algorithm</option>
                    <option value="fci">FCI</option>
                    <option value="ges">GES</option>
                  </select>
                </div>
                <div>
                  <Label>Effect Entity</Label>
                  <Input
                    value={effectEntity}
                    onChange={(e) => setEffectEntity(e.target.value)}
                    placeholder="e1"
                  />
                </div>
                <div>
                  <Label>Alpha</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={alpha}
                    onChange={(e) => setAlpha(Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={runCausal} disabled={loading}>
                    Infer
                  </Button>
                  <Button onClick={runPC} disabled={loading} variant="secondary">
                    PC
                  </Button>
                  <Button onClick={runFCI} disabled={loading} variant="outline">
                    FCI
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Causality Results</CardTitle>
                <CardDescription>Results from causal inference</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {causalResult ? (
                    <pre className="text-xs">
                      {JSON.stringify(causalResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">
                      Run causal inference to see results
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Multi-hop Tab */}
        <TabsContent value="multihop">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-hop Reasoning</CardTitle>
                <CardDescription>
                  Find paths between entities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Source Entity</Label>
                  <Input
                    value={sourceEntity}
                    onChange={(e) => setSourceEntity(e.target.value)}
                    placeholder="e1"
                  />
                </div>
                <div>
                  <Label>Target Entity</Label>
                  <Input
                    value={targetEntity}
                    onChange={(e) => setTargetEntity(e.target.value)}
                    placeholder="e2"
                  />
                </div>
                <div>
                  <Label>Max Hops</Label>
                  <Input
                    type="number"
                    value={maxHops}
                    onChange={(e) => setMaxHops(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Relation Filter (JSON)</Label>
                  <Textarea
                    value={relationFilter}
                    onChange={(e) => setRelationFilter(e.target.value)}
                    placeholder='["knows", "works_with"]'
                    rows={2}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={runMultiHop} disabled={loading}>
                    Reason
                  </Button>
                  <Button onClick={runPaths} disabled={loading} variant="secondary">
                    Find Paths
                  </Button>
                  <Button onClick={runShortest} disabled={loading} variant="outline">
                    Shortest
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-hop Results</CardTitle>
                <CardDescription>Paths between source and target</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {multiHopResult ? (
                    <pre className="text-xs">
                      {JSON.stringify(multiHopResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">
                      Run multi-hop reasoning to see results
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}