"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

export default function GraphNeuralPage() {
  const [activeTab, setActiveTab] = useState("tensor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Tensor Network
  const [networkType, setNetworkType] = useState("cp");
  const [rank, setRank] = useState("2,2,2");
  const [dimensions, setDimensions] = useState("4,4,4");
  const [tensorResult, setTensorResult] = useState<any>(null);

  // Neural ODE
  const [odenetType, setOdenetType] = useState("resnet");
  const [layers, setLayers] = useState(3);
  const [hiddenSize, setHiddenSize] = useState(64);
  const [timeSteps, setTimeSteps] = useState(10);
  const [neuralodeResult, setNeuralodeResult] = useState<any>(null);

  // Attention
  const [attentionType, setAttentionType] = useState("self");
  const [heads, setHeads] = useState(4);
  const [dropout, setDropout] = useState(0.1);
  const [keySize, setKeySize] = useState(32);
  const [attentionResult, setAttentionResult] = useState<any>(null);

  const runTensor = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/tensor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          network_type: networkType,
          rank: rank.split(",").map(Number),
          dimensions: dimensions.split(",").map(Number),
        }),
      });
      setTensorResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runNeuralode = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/neuralode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          odenet_type: odenetType,
          layers,
          hidden_size: hiddenSize,
          time_steps: timeSteps,
        }),
      });
      setNeuralodeResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runAttention = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/attention`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          attention_type: attentionType,
          heads,
          dropout,
          key_size: keySize,
        }),
      });
      setAttentionResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Neural Networks</h1>
          <p className="text-muted-foreground">Tensor Networks, Neural ODEs & Attention</p>
        </div>
        <Badge variant="outline">v1.79</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tensor">Tensor Networks</TabsTrigger>
          <TabsTrigger value="neuralode">Neural ODEs</TabsTrigger>
          <TabsTrigger value="attention">Attention</TabsTrigger>
        </TabsList>

        <TabsContent value="tensor">
          <Card>
            <CardHeader>
              <CardTitle>Tensor Network Decomposition</CardTitle>
              <CardDescription>CP, Tucker, Tensor Train decompositions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Network Type</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={networkType}
                    onChange={(e) => setNetworkType(e.target.value)}
                  >
                    <option value="cp">CP (Canonical Polyadic)</option>
                    <option value="tucker">Tucker</option>
                    <option value="tt">Tensor Train</option>
                    <option value="tree">Tree Tensor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Rank (comma)</Label>
                  <Input value={rank} onChange={(e) => setRank(e.target.value)} placeholder="2,2,2" />
                </div>
                <div className="space-y-2">
                  <Label>Dimensions (comma)</Label>
                  <Input value={dimensions} onChange={(e) => setDimensions(e.target.value)} placeholder="4,4,4" />
                </div>
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
              </div>
              <Button onClick={runTensor} disabled={loading}>
                {loading ? "Computing..." : "Run Decomposition"}
              </Button>
              {tensorResult && (
                <pre className="mt-4 p-4 bg-muted rounded overflow-x-auto">
                  {JSON.stringify(tensorResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="neuralode">
          <Card>
            <CardHeader>
              <CardTitle>Neural ODE Integrators</CardTitle>
              <CardDescription>ResNet, GRU, LSTM, Transformer-based ODEs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ODE Network</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={odenetType}
                    onChange={(e) => setOdenetType(e.target.value)}
                  >
                    <option value="resnet">ResNet</option>
                    <option value="gru">GRU</option>
                    <option value="lstm">LSTM</option>
                    <option value="transformer">Transformer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Layers</Label>
                  <Input type="number" value={layers} onChange={(e) => setLayers(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Hidden Size</Label>
                  <Input type="number" value={hiddenSize} onChange={(e) => setHiddenSize(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Time Steps</Label>
                  <Input type="number" value={timeSteps} onChange={(e) => setTimeSteps(Number(e.target.value))} />
                </div>
              </div>
              <Button onClick={runNeuralode} disabled={loading}>
                {loading ? "Integrating..." : "Run Neural ODE"}
              </Button>
              {neuralodeResult && (
                <pre className="mt-4 p-4 bg-muted rounded overflow-x-auto">
                  {JSON.stringify(neuralodeResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attention">
          <Card>
            <CardHeader>
              <CardTitle>Graph Attention Mechanisms</CardTitle>
              <CardDescription>Self, Cross, Multi-head, Graph attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Attention Type</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={attentionType}
                    onChange={(e) => setAttentionType(e.target.value)}
                  >
                    <option value="self">Self Attention</option>
                    <option value="cross">Cross Attention</option>
                    <option value="multihead">Multi-Head</option>
                    <option value="graph">Graph Attention</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Heads</Label>
                  <Input type="number" value={heads} onChange={(e) => setHeads(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Dropout</Label>
                  <Input type="number" step="0.01" value={dropout} onChange={(e) => setDropout(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Key Size</Label>
                  <Input type="number" value={keySize} onChange={(e) => setKeySize(Number(e.target.value))} />
                </div>
              </div>
              <Button onClick={runAttention} disabled={loading}>
                {loading ? "Computing..." : "Run Attention"}
              </Button>
              {attentionResult && (
                <pre className="mt-4 p-4 bg-muted rounded overflow-x-auto">
                  {JSON.stringify(attentionResult, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="p-4 text-red-500 bg-red-50 rounded">{error}</div>
      )}
    </div>
  );
}