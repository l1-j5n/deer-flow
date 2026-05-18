"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

interface ConvolutionResult {
  type: string;
  num_layers?: number;
  hidden_dim?: number;
  kernel_size?: number;
  aggregation?: string;
}

interface AttentionResult {
  type: string;
  num_layers?: number;
  hidden_dim?: number;
  num_heads?: number;
  attention?: string;
}

interface SamplingResult {
  type: string;
  num_samples?: number;
  fanout?: number;
  method?: string;
}

export default function GraphAdvancedPage() {
  const [activeTab, setActiveTab] = useState("convolution");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common state
  const [graphId, setGraphId] = useState("graph1");

  // Convolution state
  const [convType, setConvType] = useState("gcn");
  const [numLayers, setNumLayers] = useState(3);
  const [convHidden, setConvHidden] = useState(64);
  const [kernelSize, setKernelSize] = useState(3);
  const [convolutionResult, setConvolutionResult] = useState<ConvolutionResult | null>(null);

  // Attention state
  const [attentionType, setAttentionType] = useState("gat");
  const [attLayers, setAttLayers] = useState(2);
  const [attHidden, setAttHidden] = useState(64);
  const [numHeads, setNumHeads] = useState(8);
  const [attentionResult, setAttentionResult] = useState<AttentionResult | null>(null);

  // Sampling state
  const [sampleStrategy, setSampleStrategy] = useState("random");
  const [numSamples, setNumSamples] = useState(25);
  const [fanout, setFanout] = useState(10);
  const [method, setMethod] = useState("uniform");
  const [samplingResult, setSamplingResult] = useState<SamplingResult | null>(null);

  // Run convolution
  const runConvolution = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/convolution/convolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          conv_type: convType,
          num_layers: numLayers,
          hidden_dim: convHidden,
          kernel_size: kernelSize,
        }),
      });
      const data = await res.json();
      setConvolutionResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run attention
  const runAttention = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/attention/attent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          attention_type: attentionType,
          num_layers: attLayers,
          hidden_dim: attHidden,
          num_heads: numHeads,
        }),
      });
      const data = await res.json();
      setAttentionResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run sampling
  const runSampling = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/sampling/strat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          sample_strategy: sampleStrategy,
          num_samples: numSamples,
          fanout: fanout,
          method: method,
        }),
      });
      const data = await res.json();
      setSamplingResult(data);
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
          <h1 className="text-3xl font-bold">Graph Advanced</h1>
          <p className="text-muted-foreground">Convolution, Attention & Sampling</p>
        </div>
        <Badge variant="outline">v1.71</Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="convolution">Convolution</TabsTrigger>
          <TabsTrigger value="attention">Attention</TabsTrigger>
          <TabsTrigger value="sampling">Sampling</TabsTrigger>
        </TabsList>

        {/* Convolution Tab */}
        <TabsContent value="convolution">
          <Card>
            <CardHeader>
              <CardTitle>Graph Convolution</CardTitle>
              <CardDescription>
                Apply convolution operations on graph structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Convolution Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={convType}
                    onChange={(e) => setConvType(e.target.value)}
                  >
                    <option value="gcn">GCN</option>
                    <option value="chebyshev">Chebyshev</option>
                    <option value="spline">Spline</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Layers</Label>
                  <Input
                    type="number"
                    value={numLayers}
                    onChange={(e) => setNumLayers(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={convHidden}
                    onChange={(e) => setConvHidden(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kernel Size</Label>
                  <Input
                    type="number"
                    value={kernelSize}
                    onChange={(e) => setKernelSize(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runConvolution} disabled={loading}>
                {loading ? "Convolving..." : "Run Convolution"}
              </Button>

              {convolutionResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(convolutionResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attention Tab */}
        <TabsContent value="attention">
          <Card>
            <CardHeader>
              <CardTitle>Graph Attention</CardTitle>
              <CardDescription>
                Apply attention mechanisms on graph nodes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Attention Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={attentionType}
                    onChange={(e) => setAttentionType(e.target.value)}
                  >
                    <option value="gat">GAT</option>
                    <option value="sitan">SiTAN</option>
                    <option value="gaat">GAAT</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Layers</Label>
                  <Input
                    type="number"
                    value={attLayers}
                    onChange={(e) => setAttLayers(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={attHidden}
                    onChange={(e) => setAttHidden(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of Heads</Label>
                  <Input
                    type="number"
                    value={numHeads}
                    onChange={(e) => setNumHeads(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runAttention} disabled={loading}>
                {loading ? "Processing..." : "Run Attention"}
              </Button>

              {attentionResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(attentionResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sampling Tab */}
        <TabsContent value="sampling">
          <Card>
            <CardHeader>
              <CardTitle>Graph Sampling Strategies</CardTitle>
              <CardDescription>
                Sample subgraphs for mini-batch training
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Sampling Strategy</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={sampleStrategy}
                    onChange={(e) => setSampleStrategy(e.target.value)}
                  >
                    <option value="random">Random</option>
                    <option value="layerwise">Layer-wise</option>
                    <option value="neighborhood">Neighborhood</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Samples</Label>
                  <Input
                    type="number"
                    value={numSamples}
                    onChange={(e) => setNumSamples(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fanout</Label>
                  <Input
                    type="number"
                    value={fanout}
                    onChange={(e) => setFanout(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="uniform">Uniform</option>
                    <option value="degree">Degree</option>
                  </select>
                </div>
              </div>

              <Button onClick={runSampling} disabled={loading}>
                {loading ? "Sampling..." : "Run Sampling"}
              </Button>

              {samplingResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(samplingResult, null, 2)}
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