"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const API_BASE = "";

interface RLResult {
  episodes: number;
  max_steps: number;
  policy_size: number;
}

interface RLPolicy {
  entity: string;
  recommended_action: string;
  available_actions: string[];
}

interface DynamicResult {
  status: string;
  entity_id?: string;
  message?: string;
}

interface BatchUpdate {
  total: number;
  results: Array<{ status: string }>;
}

interface IncrementalResult {
  method: string;
  entity_count: number;
}

export default function RLDynamicPage() {
  const [activeTab, setActiveTab] = useState("rl");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // RL state
  const [episodes, setEpisodes] = useState(100);
  const [maxSteps, setMaxSteps] = useState(50);
  const [epsilon, setEpsilon] = useState(0.1);
  const [rlResult, setRlResult] = useState<RLResult | null>(null);
  const [rlPolicy, setRlPolicy] = useState<RLPolicy | null>(null);
  const [policyEntity, setPolicyEntity] = useState("");

  // Dynamic state
  const [entityId, setEntityId] = useState("");
  const [changeType, setChangeType] = useState("add");
  const [properties, setProperties] = useState("");
  const [dynamicResult, setDynamicResult] = useState<DynamicResult | null>(null);
  const [batchUpdates, setBatchUpdates] = useState("");
  const [batchResult, setBatchResult] = useState<BatchUpdate | null>(null);

  // Incremental state
  const [incEntities, setIncEntities] = useState("");
  const [incMethod, setIncMethod] = useState("sgd");
  const [incResult, setIncResult] = useState<IncrementalResult | null>(null);
  const [batchSize, setBatchSize] = useState(10);
  const [windowSize, setWindowSize] = useState(5);
  const [streamResult, setStreamResult] = useState<IncrementalResult | null>(null);

  // RL functions
  const trainRL = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/rl/train`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodes: episodes,
          max_steps: maxSteps,
          epsilon: epsilon,
        }),
      });
      const data = await res.json();
      setRlResult(data);
    } catch (e) {
      setError("Failed to train RL");
    }
    setLoading(false);
  };

  const getPolicy = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/rl/policy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity_id: policyEntity }),
      });
      const data = await res.json();
      setRlPolicy(data);
    } catch (e) {
      setError("Failed to get policy");
    }
    setLoading(false);
  };

  // Dynamic functions
  const updateDynamic = async () => {
    setLoading(true);
    setError("");
    try {
      let props = {};
      if (properties) {
        try { props = JSON.parse(properties); } catch {}
      }

      const res = await fetch(`${API_BASE}/api/knowledge-graph/dynamic/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: entityId,
          change_type: changeType,
          properties: props,
        }),
      });
      const data = await res.json();
      setDynamicResult(data);
    } catch (e) {
      setError("Failed to update");
    }
    setLoading(false);
  };

  const runBatch = async () => {
    setLoading(true);
    setError("");
    try {
      const updates = JSON.parse(batchUpdates);
      const res = await fetch(`${API_BASE}/api/knowledge-graph/dynamic/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: updates,
          atomic: true,
        }),
      });
      const data = await res.json();
      setBatchResult(data);
    } catch (e) {
      setError("Failed to run batch - check JSON");
    }
    setLoading(false);
  };

  // Incremental functions
  const runIncremental = async () => {
    setLoading(true);
    setError("");
    try {
      const ids = incEntities.split(",").filter(Boolean);
      const res = await fetch(`${API_BASE}/api/knowledge-graph/incremental/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_ids: ids,
          method: incMethod,
        }),
      });
      const data = await res.json();
      setIncResult(data);
    } catch (e) {
      setError("Failed to run incremental");
    }
    setLoading(false);
  };

  const runStreaming = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/incremental/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_size: batchSize,
          window_size: windowSize,
        }),
      });
      const data = await res.json();
      setStreamResult(data);
    } catch (e) {
      setError("Failed to run streaming");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RL & Dynamic</h1>
          <p className="text-muted-foreground">
            Reinforcement learning, dynamic updates, and incremental embeddings
          </p>
        </div>
        <Badge variant="outline">v1.59</Badge>
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
          <TabsTrigger value="rl">RL</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic</TabsTrigger>
          <TabsTrigger value="incremental">Incremental</TabsTrigger>
        </TabsList>

        {/* RL Tab */}
        <TabsContent value="rl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Train RL Agent</CardTitle>
                <CardDescription>Train Q-learning agent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Episodes</Label>
                    <Input
                      type="number"
                      value={episodes}
                      onChange={(e) => setEpisodes(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Max Steps</Label>
                    <Input
                      type="number"
                      value={maxSteps}
                      onChange={(e) => setMaxSteps(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Epsilon</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={epsilon}
                      onChange={(e) => setEpsilon(Number(e.target.value))}
                    />
                  </div>
                </div>
                <Button onClick={trainRL} disabled={loading}>
                  Train
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Get Policy</CardTitle>
                <CardDescription>Get optimal policy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={policyEntity}
                  onChange={(e) => setPolicyEntity(e.target.value)}
                  placeholder="Entity ID"
                />
                <Button onClick={getPolicy} disabled={loading}>
                  Get Policy
                </Button>
              </CardContent>
            </Card>

            {/* RL Result */}
            {rlResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Training Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Episodes</p>
                      <p className="font-bold">{rlResult.episodes}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max Steps</p>
                      <p className="font-bold">{rlResult.max_steps}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Policy Size</p>
                      <p className="font-bold">{rlResult.policy_size}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Policy Result */}
            {rlPolicy && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Policy: {rlPolicy.entity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold mb-2">Recommended: {rlPolicy.recommended_action}</p>
                  <div className="flex gap-2 flex-wrap">
                    {rlPolicy.available_actions?.map((a, idx) => (
                      <Badge key={idx} variant="outline">{a}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Dynamic Tab */}
        <TabsContent value="dynamic">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dynamic Update</CardTitle>
                <CardDescription>Update graph dynamically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  placeholder="Entity ID"
                />
                <select
                  className="w-full border rounded p-2"
                  value={changeType}
                  onChange={(e) => setChangeType(e.target.value)}
                >
                  <option value="add">Add</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                </select>
                <Textarea
                  value={properties}
                  onChange={(e) => setProperties(e.target.value)}
                  placeholder='{"property": "value"}'
                  className="h-20"
                />
                <Button onClick={updateDynamic} disabled={loading}>
                  Update
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Batch Update</CardTitle>
                <CardDescription>Multiple updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={batchUpdates}
                  onChange={(e) => setBatchUpdates(e.target.value)}
                  placeholder='[{"entity_id": "e1", "change_type": "add"}]'
                  className="h-32 font-mono"
                />
                <Button onClick={runBatch} disabled={loading}>
                  Run Batch
                </Button>
              </CardContent>
            </Card>

            {/* Dynamic Result */}
            {dynamicResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Update Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={dynamicResult.status === "error" ? "destructive" : "default"}>
                    {dynamicResult.status}
                  </Badge>
                  {dynamicResult.message && (
                    <p className="mt-2">{dynamicResult.message}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Batch Result */}
            {batchResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Batch Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-bold text-2xl mb-4">{batchResult.total}</p>
                  <div className="flex gap-2">
                    {batchResult.results.slice(0, 5).map((r, idx) => (
                      <Badge key={idx} variant="outline">{r.status}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Incremental Tab */}
        <TabsContent value="incremental">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Incremental Update</CardTitle>
                <CardDescription>Update embeddings incrementally</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={incEntities}
                  onChange={(e) => setIncEntities(e.target.value)}
                  placeholder="entity1, entity2, entity3"
                  className="h-20"
                />
                <select
                  className="w-full border rounded p-2"
                  value={incMethod}
                  onChange={(e) => setIncMethod(e.target.value)}
                >
                  <option value="sgd">SGD</option>
                  <option value="adam">Adam</option>
                </select>
                <Button onClick={runIncremental} disabled={loading}>
                  Update
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Streaming Embeddings</CardTitle>
                <CardDescription>Stream embeddings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Batch Size</Label>
                    <Input
                      type="number"
                      value={batchSize}
                      onChange={(e) => setBatchSize(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Window</Label>
                    <Input
                      type="number"
                      value={windowSize}
                      onChange={(e) => setWindowSize(Number(e.target.value))}
                    />
                  </div>
                </div>
                <Button onClick={runStreaming} disabled={loading}>
                  Stream
                </Button>
              </CardContent>
            </Card>

            {/* Incremental Result */}
            {incResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Update Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-mono">{incResult.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entities</p>
                      <p className="font-bold text-2xl">{incResult.entity_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Streaming Result */}
            {streamResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Streaming Embeddings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Batch</p>
                      <p className="font-bold">{streamResult.batch_size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Window</p>
                      <p className="font-bold">{streamResult.window_size}</p>
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