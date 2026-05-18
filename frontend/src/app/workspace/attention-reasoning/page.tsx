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

interface AttentionResult {
  entity: string;
  attention_type: string;
  top_attended: Array<[string, number]>;
}

interface MultiHeadResult {
  source: string;
  target: string;
  num_heads: number;
  average_attention: number;
  head_scores: Array<{ head: number; attention: number }>;
}

interface ReasoningResult {
  start: string;
  hops: number;
  reachable_count: number;
  by_hop: Record<number, string[]>;
}

interface CommonResult {
  entity_a: string;
  entity_b: string;
  common_reachers: Array<{ entity: string }>;
  count: number;
}

interface TraversalResult {
  method: string;
  visited_count: number;
  entities: string[];
}

interface BidirectionalResult {
  found: boolean;
  path?: string[];
  length?: number;
  method: string;
}

interface AttentionSummary {
  cached_attentions: number;
  total_entities: number;
}

export default function AttentionReasoningPage() {
  const [activeTab, setActiveTab] = useState("attention");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Attention state
  const [attEntity, setAttEntity] = useState("");
  const [attType, setAttType] = useState("scaled_dot_product");
  const [attResult, setAttResult] = useState<AttentionResult | null>(null);
  const [mhSource, setMhSource] = useState("");
  const [mhTarget, setMhTarget] = useState("");
  const [numHeads, setNumHeads] = useState(4);
  const [mhResult, setMhResult] = useState<MultiHeadResult | null>(null);
  const [attSummary, setAttSummary] = useState<AttentionSummary | null>(null);

  // Reasoning state
  const [reasonStart, setReasonStart] = useState("");
  const [numHops, setNumHops] = useState(2);
  const [reasoningResult, setReasoningResult] = useState<ReasoningResult | null>(null);
  const [commonA, setCommonA] = useState("");
  const [commonB, setCommonB] = useState("");
  const [commonResult, setCommonResult] = useState<CommonResult | null>(null);
  const [reasonSummary, setReasonSummary] = useState<{cached_queries: number; total_entities: number} | null>(null);

  // Traversal state
  const [traversalStart, setTraversalStart] = useState("");
  const [traversalMethod, setTraversalMethod] = useState("bfs");
  const [maxNodes, setMaxNodes] = useState(100);
  const [traversalResult, setTraversalResult] = useState<TraversalResult | null>(null);
  const [bidirStart, setBidirStart] = useState("");
  const [bidirTarget, setBidirTarget] = useState("");
  const [bidirResult, setBidirResult] = useState<BidirectionalResult | null>(null);
  const [traversalSummary, setTraversalSummary] = useState<{cached_traversals: number; total_entities: number} | null>(null);

  // Attention functions
  const computeAttention = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/attention/compute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: attEntity,
          attention_type: attType,
        }),
      });
      const data = await res.json();
      setAttResult(data);
    } catch (e) {
      setError("Failed to compute attention");
    }
    setLoading(false);
  };

  const computeMultiHead = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/attention/multi-head`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_entity: mhSource,
          target_entity: mhTarget,
          heads: numHeads,
        }),
      });
      const data = await res.json();
      setMhResult(data);
    } catch (e) {
      setError("Failed to compute multi-head attention");
    }
    setLoading(false);
  };

  const getAttSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/attention/summary`);
      const data = await res.json();
      setAttSummary(data);
    } catch (e) {
      console.error("Failed to get attention summary");
    }
  };

  // Reasoning functions
  const runReasoning = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/reasoning/multi-hop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_entity: reasonStart,
          hops: numHops,
        }),
      });
      const data = await res.json();
      setReasoningResult(data);
    } catch (e) {
      setError("Failed to run reasoning");
    }
    setLoading(false);
  };

  const findCommon = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/reasoning/common`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_a: commonA,
          entity_b: commonB,
        }),
      });
      const data = await res.json();
      setCommonResult(data);
    } catch (e) {
      setError("Failed to find common");
    }
    setLoading(false);
  };

  const getReasonSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/reasoning/summary`);
      const data = await res.json();
      setReasonSummary(data);
    } catch (e) {
      console.error("Failed to get reasoning summary");
    }
  };

  // Traversal functions
  const runTraversal = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/traversal/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_entity: traversalStart,
          method: traversalMethod,
          max_nodes: maxNodes,
        }),
      });
      const data = await res.json();
      setTraversalResult(data);
    } catch (e) {
      setError("Failed to run traversal");
    }
    setLoading(false);
  };

  const runBidirectional = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/traversal/bidirectional`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_entity: bidirStart,
          target_entity: bidirTarget,
        }),
      });
      const data = await res.json();
      setBidirResult(data);
    } catch (e) {
      setError("Failed to run bidirectional");
    }
    setLoading(false);
  };

  const getTraversalSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/traversal/summary`);
      const data = await res.json();
      setTraversalSummary(data);
    } catch (e) {
      console.error("Failed to get traversal summary");
    }
  };

  useEffect(() => {
    getAttSummary();
    getReasonSummary();
    getTraversalSummary();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attention & Reasoning</h1>
          <p className="text-muted-foreground">
            Graph attention, multi-hop reasoning, and traversal optimizations
          </p>
        </div>
        <Badge variant="outline">v1.58</Badge>
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
          <TabsTrigger value="attention">Attention</TabsTrigger>
          <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
          <TabsTrigger value="traversal">Traversal</TabsTrigger>
        </TabsList>

        {/* Attention Tab */}
        <TabsContent value="attention">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compute Attention</CardTitle>
                <CardDescription>Compute attention weights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={attEntity}
                  onChange={(e) => setAttEntity(e.target.value)}
                  placeholder="Entity ID"
                />
                <div>
                  <Label>Attention Type</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={attType}
                    onChange={(e) => setAttType(e.target.value)}
                  >
                    <option value="scaled_dot_product">Scaled Dot Product</option>
                    <option value="additive">Additive</option>
                    <option value="multiplicative">Multiplicative</option>
                  </select>
                </div>
                <Button onClick={computeAttention} disabled={loading}>
                  Compute
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-Head Attention</CardTitle>
                <CardDescription>Multi-head attention between entities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={mhSource}
                    onChange={(e) => setMhSource(e.target.value)}
                    placeholder="Source"
                  />
                  <Input
                    value={mhTarget}
                    onChange={(e) => setMhTarget(e.target.value)}
                    placeholder="Target"
                  />
                </div>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    value={numHeads}
                    onChange={(e) => setNumHeads(Number(e.target.value))}
                    placeholder="Heads"
                  />
                  <Button onClick={computeMultiHead} disabled={loading}>
                    Compute
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Attention Result */}
            {attResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Attention: {attResult.entity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    Attention Type: {attResult.attention_type}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {attResult.top_attended?.slice(0, 10).map((item, idx) => (
                      <Badge key={idx} variant="outline">
                        {item[0]}: {item[1].toFixed(3)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Multi-Head Result */}
            {mhResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Multi-Head: {mhResult.source} → {mhResult.target}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-2xl mb-4">
                    {mhResult.average_attention.toFixed(4)}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {mhResult.head_scores.map((h, idx) => (
                      <Badge key={idx} variant="secondary">
                        Head {h.head}: {h.attention.toFixed(3)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Reasoning Tab */}
        <TabsContent value="reasoning">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Hop Reasoning</CardTitle>
                <CardDescription>Reason over multiple hops</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={reasonStart}
                  onChange={(e) => setReasonStart(e.target.value)}
                  placeholder="Start Entity"
                />
                <div className="flex gap-4">
                  <Input
                    type="number"
                    value={numHops}
                    onChange={(e) => setNumHops(Number(e.target.value))}
                    placeholder="Hops"
                  />
                  <Button onClick={runReasoning} disabled={loading}>
                    Reason
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Reachers</CardTitle>
                <CardDescription>Find common reachers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={commonA}
                    onChange={(e) => setCommonA(e.target.value)}
                    placeholder="Entity A"
                  />
                  <Input
                    value={commonB}
                    onChange={(e) => setCommonB(e.target.value)}
                    placeholder="Entity B"
                  />
                </div>
                <Button onClick={findCommon} disabled={loading}>
                  Find Common
                </Button>
              </CardContent>
            </Card>

            {/* Reasoning Result */}
            {reasoningResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Reasoning: {reasoningResult.start}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Hops</p>
                      <p className="font-bold">{reasoningResult.hops}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reachable</p>
                      <p className="font-bold">{reasoningResult.reachable_count}</p>
                    </div>
                  </div>
                  {reasoningResult.by_hop && (
                    <ScrollArea className="h-32">
                      <div className="space-y-2">
                        {Object.entries(reasoningResult.by_hop).map(([hop, entities]) => (
                          <div key={hop} className="flex gap-2">
                            <Badge>Hop {hop}</Badge>
                            <span className="text-sm">{entities.length} entities</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Common Result */}
            {commonResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Common: {commonResult.entity_a} ↔ {commonResult.entity_b}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-2xl mb-4">{commonResult.count}</p>
                  <div className="flex gap-2 flex-wrap">
                    {commonResult.common_reachers.slice(0, 10).map((item, idx) => (
                      <Badge key={idx} variant="outline">{item.entity}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Traversal Tab */}
        <TabsContent value="traversal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimized Traversal</CardTitle>
                <CardDescription>Optimized graph traversal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={traversalStart}
                  onChange={(e) => setTraversalStart(e.target.value)}
                  placeholder="Start Entity"
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="border rounded p-2"
                    value={traversalMethod}
                    onChange={(e) => setTraversalMethod(e.target.value)}
                  >
                    <option value="bfs">BFS</option>
                    <option value="dfs">DFS</option>
                    <option value="bidirectional">Bidirectional</option>
                  </select>
                  <Input
                    type="number"
                    value={maxNodes}
                    onChange={(e) => setMaxNodes(Number(e.target.value))}
                    placeholder="Max Nodes"
                  />
                </div>
                <Button onClick={runTraversal} disabled={loading}>
                  Traverse
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bidirectional Search</CardTitle>
                <CardDescription>Fast path finding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={bidirStart}
                    onChange={(e) => setBidirStart(e.target.value)}
                    placeholder="Start"
                  />
                  <Input
                    value={bidirTarget}
                    onChange={(e) => setBidirTarget(e.target.value)}
                    placeholder="Target"
                  />
                </div>
                <Button onClick={runBidirectional} disabled={loading}>
                  Find Path
                </Button>
              </CardContent>
            </Card>

            {/* Traversal Result */}
            {traversalResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Traversal Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-mono">{traversalResult.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Visited</p>
                      <p className="font-bold text-2xl">{traversalResult.visited_count}</p>
                    </div>
                  </div>
                  <ScrollArea className="h-32">
                    <div className="flex gap-2 flex-wrap">
                      {traversalResult.entities?.slice(0, 30).map((e, idx) => (
                        <Badge key={idx} variant="outline">{e}</Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Bidirectional Result */}
            {bidirResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Bidirectional Search</CardTitle>
                </CardHeader>
                <CardContent>
                  {bidirResult.found ? (
                    <div>
                      <p className="font-bold text-green-500">Path Found!</p>
                      <p className="text-sm">Length: {bidirResult.length}</p>
                      <p className="font-mono text-sm mt-2">
                        {bidirResult.path?.join(" → ")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No path found</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}