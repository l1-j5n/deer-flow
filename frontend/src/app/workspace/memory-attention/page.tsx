"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const API_BASE = "";

interface MemoryResult {
  type: string;
  capacity?: number;
  operations?: string[];
  read_heads?: number;
  write_heads?: number;
}

interface AttentionResult {
  type: string;
  num_heads?: number;
  hidden_dim?: number;
  scale?: number;
  output_dim?: number;
}

interface NASResult {
  search_space: string;
  num_layers: number;
  architectures?: Array<{
    layer: number;
    type: string;
    hidden_dim: number;
    activation: string;
    dropout: number;
  }>;
  best_architecture?: {
    layer: number;
    type: string;
    hidden_dim: number;
    activation: string;
    dropout: number;
  };
  best_accuracy?: number;
}

export default function MemoryAttentionPage() {
  const [activeTab, setActiveTab] = useState("memory");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Memory state
  const [graphId, setGraphId] = useState("graph1");
  const [memoryType, setMemoryType] = useState("stack");
  const [memorySize, setMemorySize] = useState(100);
  const [readHeads, setReadHeads] = useState(4);
  const [writeHeads, setWriteHeads] = useState(4);
  const [memoryResult, setMemoryResult] = useState<MemoryResult | null>(null);

  // Attention state
  const [attentionType, setAttentionType] = useState("scaled_dot");
  const [numHeads, setNumHeads] = useState(8);
  const [hiddenDim, setHiddenDim] = useState(64);
  const [dropout, setDropout] = useState(0.1);
  const [attentionResult, setAttentionResult] = useState<AttentionResult | null>(null);

  // NAS state
  const [searchSpace, setSearchSpace] = useState("graph");
  const [numLayers, setNumLayers] = useState(3);
  const [searchEpochs, setSearchEpochs] = useState(50);
  const [rewardMetric, setRewardMetric] = useState("accuracy");
  const [nasResult, setNasResult] = useState<NASResult | null>(null);

  // Memory functions
  const createMemory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/memory/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          memory_type: memoryType,
          memory_size: memorySize,
          read_heads: readHeads,
          write_heads: writeHeads,
        }),
      });
      const data = await res.json();
      setMemoryResult(data);
    } catch (e) {
      setError("Failed to create memory");
    }
    setLoading(false);
  };

  const readMemory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/memory/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          memory_type: memoryType,
          memory_size: memorySize,
          read_heads: readHeads,
          write_heads: writeHeads,
        }),
      });
      const data = await res.json();
      setMemoryResult(data);
    } catch (e) {
      setError("Failed to read memory");
    }
    setLoading(false);
  };

  const writeMemory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/memory/write`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          memory_type: memoryType,
          memory_size: memorySize,
          read_heads: readHeads,
          write_heads: writeHeads,
        }),
      });
      const data = await res.json();
      setMemoryResult(data);
    } catch (e) {
      setError("Failed to write memory");
    }
    setLoading(false);
  };

  // Attention functions
  const computeAttention = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/attention/compute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          attention_type: attentionType,
          num_heads: numHeads,
          hidden_dim: hiddenDim,
          dropout: dropout,
        }),
      });
      const data = await res.json();
      setAttentionResult(data);
    } catch (e) {
      setError("Failed to compute attention");
    }
    setLoading(false);
  };

  const runMultihead = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/attention/multihead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          attention_type: "multihead",
          num_heads: numHeads,
          hidden_dim: hiddenDim,
          dropout: dropout,
        }),
      });
      const data = await res.json();
      setAttentionResult(data);
    } catch (e) {
      setError("Failed to run multi-head attention");
    }
    setLoading(false);
  };

  const runScaledDot = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/attention/scaled`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          attention_type: "scaled_dot",
          num_heads: numHeads,
          hidden_dim: hiddenDim,
          dropout: dropout,
        }),
      });
      const data = await res.json();
      setAttentionResult(data);
    } catch (e) {
      setError("Failed to run scaled dot attention");
    }
    setLoading(false);
  };

  // NAS functions
  const runSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/nas/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          search_space: searchSpace,
          num_layers: numLayers,
          search_epochs: searchEpochs,
          reward_metric: rewardMetric,
        }),
      });
      const data = await res.json();
      setNasResult(data);
    } catch (e) {
      setError("Failed to run architecture search");
    }
    setLoading(false);
  };

  const selectArchitecture = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/nas/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          search_space: searchSpace,
          num_layers: numLayers,
          search_epochs: searchEpochs,
          reward_metric: rewardMetric,
        }),
      });
      const data = await res.json();
      setNasResult(data);
    } catch (e) {
      setError("Failed to select architecture");
    }
    setLoading(false);
  };

  const evaluateArchitecture = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/nas/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          search_space: searchSpace,
          num_layers: numLayers,
          search_epochs: searchEpochs,
          reward_metric: rewardMetric,
        }),
      });
      const data = await res.json();
      setNasResult(data);
    } catch (e) {
      setError("Failed to evaluate architecture");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Memory & Attention</h1>
          <p className="text-muted-foreground">
            Memory networks, attention mechanisms, and neural architecture search
          </p>
        </div>
        <Badge variant="outline">v1.62</Badge>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">{error}</CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="attention">Attention</TabsTrigger>
          <TabsTrigger value="nas">NAS</TabsTrigger>
        </TabsList>

        {/* Memory Tab */}
        <TabsContent value="memory">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Memory Networks</CardTitle>
                <CardDescription>
                  Stack, queue, and associative memory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Memory Type</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={memoryType}
                    onChange={(e) => setMemoryType(e.target.value)}
                  >
                    <option value="stack">Stack</option>
                    <option value="queue">Queue</option>
                    <option value="association">Associative</option>
                  </select>
                </div>
                <div>
                  <Label>Memory Size</Label>
                  <Input
                    type="number"
                    value={memorySize}
                    onChange={(e) => setMemorySize(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Read Heads</Label>
                  <Input
                    type="number"
                    value={readHeads}
                    onChange={(e) => setReadHeads(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Write Heads</Label>
                  <Input
                    type="number"
                    value={writeHeads}
                    onChange={(e) => setWriteHeads(Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createMemory} disabled={loading}>
                    Create
                  </Button>
                  <Button onClick={readMemory} disabled={loading} variant="secondary">
                    Read
                  </Button>
                  <Button onClick={writeMemory} disabled={loading} variant="outline">
                    Write
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Results</CardTitle>
                <CardDescription>Results from memory network</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {memoryResult ? (
                    <pre className="text-xs">
                      {JSON.stringify(memoryResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">
                      Create memory to see results
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attention Tab */}
        <TabsContent value="attention">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attention Mechanisms</CardTitle>
                <CardDescription>
                  Scaled dot-product, multi-head, ReLU attention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Attention Type</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={attentionType}
                    onChange={(e) => setAttentionType(e.target.value)}
                  >
                    <option value="scaled_dot">Scaled Dot-Product</option>
                    <option value="multihead">Multi-Head</option>
                    <option value="relu">ReLU</option>
                  </select>
                </div>
                <div>
                  <Label>Num Heads</Label>
                  <Input
                    type="number"
                    value={numHeads}
                    onChange={(e) => setNumHeads(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Hidden Dim</Label>
                  <Input
                    type="number"
                    value={hiddenDim}
                    onChange={(e) => setHiddenDim(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Dropout</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={dropout}
                    onChange={(e) => setDropout(Number(e.target.value))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={computeAttention} disabled={loading}>
                    Compute
                  </Button>
                  <Button onClick={runMultihead} disabled={loading} variant="secondary">
                    Multi-Head
                  </Button>
                  <Button onClick={runScaledDot} disabled={loading} variant="outline">
                    Scaled
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attention Results</CardTitle>
                <CardDescription>Results from attention</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {attentionResult ? (
                    <pre className="text-xs">
                      {JSON.stringify(attentionResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">
                      Compute attention to see results
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* NAS Tab */}
        <TabsContent value="nas">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Neural Architecture Search</CardTitle>
                <CardDescription>
                  Graph, Transformer, RNN spaces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Search Space</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={searchSpace}
                    onChange={(e) => setSearchSpace(e.target.value)}
                  >
                    <option value="graph">Graph</option>
                    <option value="transformer">Transformer</option>
                    <option value="rnn">RNN</option>
                  </select>
                </div>
                <div>
                  <Label>Num Layers</Label>
                  <Input
                    type="number"
                    value={numLayers}
                    onChange={(e) => setNumLayers(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Search Epochs</Label>
                  <Input
                    type="number"
                    value={searchEpochs}
                    onChange={(e) => setSearchEpochs(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Reward Metric</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={rewardMetric}
                    onChange={(e) => setRewardMetric(e.target.value)}
                  >
                    <option value="accuracy">Accuracy</option>
                    <option value="loss">Loss</option>
                    <option value="f1">F1 Score</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={runSearch} disabled={loading}>
                    Search
                  </Button>
                  <Button onClick={selectArchitecture} disabled={loading} variant="secondary">
                    Select
                  </Button>
                  <Button onClick={evaluateArchitecture} disabled={loading} variant="outline">
                    Evaluate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>NAS Results</CardTitle>
                <CardDescription>Results from architecture search</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {nasResult ? (
                    <pre className="text-xs">
                      {JSON.stringify(nasResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">
                      Run architecture search to see results
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