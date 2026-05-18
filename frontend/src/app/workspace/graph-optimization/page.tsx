"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

interface SamplingResult {
  type: string;
  num_walks?: number;
  walk_length?: number;
  window_size?: number;
}

interface CompressionResult {
  type: string;
  latent_dim?: number;
  codebook_size?: number;
  compression_ratio?: number;
}

interface SparsificationResult {
  type: string;
  sparsity_ratio?: number;
  preserved_ratio?: number;
  method?: string;
}

export default function GraphOptimizationPage() {
  const [activeTab, setActiveTab] = useState("sampling");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common state
  const [graphId, setGraphId] = useState("graph1");

  // Sampling state
  const [sampleType, setSampleType] = useState("mcts");
  const [numWalks, setNumWalks] = useState(10);
  const [walkLength, setWalkLength] = useState(80);
  const [windowSize, setWindowSize] = useState(5);
  const [samplingResult, setSamplingResult] = useState<SamplingResult | null>(null);

  // Compression state
  const [compressType, setCompressType] = useState("vq");
  const [latentDim, setLatentDim] = useState(32);
  const [codebookSize, setCodebookSize] = useState(256);
  const [compressionRatio, setCompressionRatio] = useState(0.5);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);

  // Sparsification state
  const [sparseType, setSparseType] = useState("edge");
  const [sparsityRatio, setSparsityRatio] = useState(0.3);
  const [preservedRatio, setPreservedRatio] = useState(0.7);
  const [method, setMethod] = useState("degree");
  const [sparsificationResult, setSparsificationResult] = useState<SparsificationResult | null>(null);

  // Run sampling
  const runSampling = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/sampling/sample`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          sample_type: sampleType,
          num_walks: numWalks,
          walk_length: walkLength,
          window_size: windowSize,
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

  // Run compression
  const runCompression = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/compression/compress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          compress_type: compressType,
          latent_dim: latentDim,
          codebook_size: codebookSize,
          compression_ratio: compressionRatio,
        }),
      });
      const data = await res.json();
      setCompressionResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run sparsification
  const runSparsification = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/sparsify/sparsify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          sparse_type: sparseType,
          sparsity_ratio: sparsityRatio,
          preserved_ratio: preservedRatio,
          method: method,
        }),
      });
      const data = await res.json();
      setSparsificationResult(data);
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
          <h1 className="text-3xl font-bold">Graph Optimization</h1>
          <p className="text-muted-foreground">Sampling, Compression & Sparsification</p>
        </div>
        <Badge variant="outline">v1.66</Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="sampling">Sampling</TabsTrigger>
          <TabsTrigger value="compression">Compression</TabsTrigger>
          <TabsTrigger value="sparsification">Sparsification</TabsTrigger>
        </TabsList>

        {/* Sampling Tab */}
        <TabsContent value="sampling">
          <Card>
            <CardHeader>
              <CardTitle>Graph Sampling</CardTitle>
              <CardDescription>
                Sample graph nodes via random walks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Sampling Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                  >
                    <option value="mcts">MCTS</option>
                    <option value="node2vec">Node2Vec</option>
                    <option value="deepwalk">DeepWalk</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Walks</Label>
                  <Input
                    type="number"
                    value={numWalks}
                    onChange={(e) => setNumWalks(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Walk Length</Label>
                  <Input
                    type="number"
                    value={walkLength}
                    onChange={(e) => setWalkLength(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Window Size</Label>
                  <Input
                    type="number"
                    value={windowSize}
                    onChange={(e) => setWindowSize(parseInt(e.target.value))}
                  />
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

        {/* Compression Tab */}
        <TabsContent value="compression">
          <Card>
            <CardHeader>
              <CardTitle>Graph Compression</CardTitle>
              <CardDescription>
                Compress graph structure and embeddings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Compression Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={compressType}
                    onChange={(e) => setCompressType(e.target.value)}
                  >
                    <option value="vq">Vector Quantization</option>
                    <option value="hash">Hash</option>
                    <option value="pruning">Pruning</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Latent Dimension</Label>
                  <Input
                    type="number"
                    value={latentDim}
                    onChange={(e) => setLatentDim(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Codebook Size</Label>
                  <Input
                    type="number"
                    value={codebookSize}
                    onChange={(e) => setCodebookSize(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Compression Ratio</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={compressionRatio}
                    onChange={(e) => setCompressionRatio(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runCompression} disabled={loading}>
                {loading ? "Compressing..." : "Run Compression"}
              </Button>

              {compressionResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(compressionResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sparsification Tab */}
        <TabsContent value="sparsification">
          <Card>
            <CardHeader>
              <CardTitle>Graph Sparsification</CardTitle>
              <CardDescription>
                Sparsify graph while preserving structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Sparsification Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={sparseType}
                    onChange={(e) => setSparseType(e.target.value)}
                  >
                    <option value="edge">Edge</option>
                    <option value="node">Node</option>
                    <option value="spectral">Spectral</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Sparsity Ratio</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={sparsityRatio}
                    onChange={(e) => setSparsityRatio(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preserved Ratio</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={preservedRatio}
                    onChange={(e) => setPreservedRatio(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="degree">Degree</option>
                    <option value="betweenness">Betweenness</option>
                    <option value="pagerank">PageRank</option>
                  </select>
                </div>
              </div>

              <Button onClick={runSparsification} disabled={loading}>
                {loading ? "Sparsifying..." : "Run Sparsification"}
              </Button>

              {sparsificationResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(sparsificationResult, null, 2)}
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