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

interface ContrastiveResult {
  type: string;
  temperature?: number;
  augmentation?: string;
  projector?: {
    input_dim: number;
    hidden_dim: number;
    output_dim: number;
  };
  loss?: string;
  encoder?: string;
}

interface DenoiseResult {
  type: string;
  noise_ratio?: number;
  attention?: {
    heads: number;
    dropout: number;
  };
  num_layers?: number;
  hidden_dim?: number;
  aggregator?: string;
}

interface GenerateResult {
  type: string;
  num_nodes?: number;
  node_types?: number;
  edge_probability?: number;
  latent_dim?: number;
  encoder?: string;
  decoder?: string;
}

export default function GraphLearningPage() {
  const [activeTab, setActiveTab] = useState("contrastive");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common state
  const [graphId, setGraphId] = useState("graph1");

  // Contrastive state
  const [contrastiveType, setContrastiveType] = useState("graphcl");
  const [temperature, setTemperature] = useState(0.5);
  const [augmentType, setAugmentType] = useState("dropout");
  const [contrastiveHidden, setContrastiveHidden] = useState(64);
  const [contrastiveResult, setContrastiveResult] = useState<ContrastiveResult | null>(null);

  // Denoise state
  const [denoiseType, setDenoiseType] = useState("gaan");
  const [noiseRatio, setNoiseRatio] = useState(0.2);
  const [denoiseLayers, setDenoiseLayers] = useState(3);
  const [denoiseHidden, setDenoiseHidden] = useState(64);
  const [denoiseResult, setDenoiseResult] = useState<DenoiseResult | null>(null);

  // Generation state
  const [genType, setGenType] = useState("gcn");
  const [numNodes, setNumNodes] = useState(10);
  const [nodeTypes, setNodeTypes] = useState(5);
  const [edgeProb, setEdgeProb] = useState(0.3);
  const [latentDim, setLatentDim] = useState(32);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);

  // Run contrastive learning
  const runContrastiveLearn = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/contrastive/learn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          contrastive_type: contrastiveType,
          temperature: temperature,
          augment_type: augmentType,
          hidden_dim: contrastiveHidden,
        }),
      });
      const data = await res.json();
      setContrastiveResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run denoising
  const runDenoise = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/denoise/clean`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          denoise_type: denoiseType,
          noise_ratio: noiseRatio,
          num_layers: denoiseLayers,
          hidden_dim: denoiseHidden,
        }),
      });
      const data = await res.json();
      setDenoiseResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run graph generation
  const runGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/generate/graph`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          gen_type: genType,
          num_nodes: numNodes,
          node_types: nodeTypes,
          edge_prob: edgeProb,
          latent_dim: latentDim,
        }),
      });
      const data = await res.json();
      setGenerateResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate nodes preview
  const generatedEdges = Math.floor(numNodes * (numNodes - 1) / 2 * edgeProb);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Graph Learning</h1>
          <p className="text-muted-foreground">Contrastive Learning, Denoising & Generation</p>
        </div>
        <Badge variant="outline">v1.63</Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="contrastive">Contrastive Learning</TabsTrigger>
          <TabsTrigger value="denoise">Graph Denoising</TabsTrigger>
          <TabsTrigger value="generate">Graph Generation</TabsTrigger>
        </TabsList>

        {/* Contrastive Learning Tab */}
        <TabsContent value="contrastive">
          <Card>
            <CardHeader>
              <CardTitle>Graph Contrastive Learning</CardTitle>
              <CardDescription>
                Learn node embeddings via self-supervised contrastive learning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Contrastive Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={contrastiveType}
                    onChange={(e) => setContrastiveType(e.target.value)}
                  >
                    <option value="graphcl">GraphCL</option>
                    <option value="infograph">InfoGraph</option>
                    <option value="mvgrl">MVGRL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Temperature</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Augmentation</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={augmentType}
                    onChange={(e) => setAugmentType(e.target.value)}
                  >
                    <option value="dropout">Dropout</option>
                    <option value="node_drop">Node Drop</option>
                    <option value="edge">Edge</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={contrastiveHidden}
                    onChange={(e) => setContrastiveHidden(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runContrastiveLearn} disabled={loading}>
                {loading ? "Learning..." : "Run Contrastive Learning"}
              </Button>

              {contrastiveResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(contrastiveResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Denoising Tab */}
        <TabsContent value="denoise">
          <Card>
            <CardHeader>
              <CardTitle>Graph Denoising</CardTitle>
              <CardDescription>
                Remove noise from graph structure and node features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Denoise Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={denoiseType}
                    onChange={(e) => setDenoiseType(e.target.value)}
                  >
                    <option value="gaan">GAAN</option>
                    <option value="dropedge">DropEdge</option>
                    <option value="feature_mask">Feature Mask</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Noise Ratio</Label>
                  <Input
                    type="number"
                    step="0.05"
                    max="1"
                    value={noiseRatio}
                    onChange={(e) => setNoiseRatio(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={denoiseHidden}
                    onChange={(e) => setDenoiseHidden(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Number of Layers</Label>
                  <Input
                    type="number"
                    value={denoiseLayers}
                    onChange={(e) => setDenoiseLayers(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runDenoise} disabled={loading}>
                {loading ? "Denoising..." : "Run Graph Denoising"}
              </Button>

              {denoiseResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(denoiseResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generation Tab */}
        <TabsContent value="generate">
          <Card>
            <CardHeader>
              <CardTitle>Graph Generation</CardTitle>
              <CardDescription>
                Generate new graphs from latent distributions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Generation Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={genType}
                    onChange={(e) => setGenType(e.target.value)}
                  >
                    <option value="gcn">GCN-based</option>
                    <option value="graphrnn">GraphRNN</option>
                    <option value="molexp">MoleXP</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Nodes</Label>
                  <Input
                    type="number"
                    value={numNodes}
                    onChange={(e) => setNumNodes(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Node Types</Label>
                  <Input
                    type="number"
                    value={nodeTypes}
                    onChange={(e) => setNodeTypes(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Edge Probability</Label>
                  <Input
                    type="number"
                    step="0.05"
                    max="1"
                    value={edgeProb}
                    onChange={(e) => setEdgeProb(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Latent Dimension</Label>
                  <Input
                    type="number"
                    value={latentDim}
                    onChange={(e) => setLatentDim(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <span className="font-medium">Preview:</span> ~{generatedEdges} edges will be generated
              </div>

              <Button onClick={runGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate Graph"}
              </Button>

              {generateResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(generateResult, null, 2)}
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