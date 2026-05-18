"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

interface EmbeddingResult {
  type: string;
  embedding_dim?: number;
  walk_length?: number;
  num_walks?: number;
  window_size?: number;
}

interface FeatureResult {
  type: string;
  num_features?: number;
  top_k?: number;
  normalize?: boolean;
}

interface RepresentationResult {
  type: string;
  hidden_dim?: number;
  encoder_layers?: number;
  decoder_layers?: number;
  learning_rate?: number;
}

export default function GraphRepresentationPage() {
  const [activeTab, setActiveTab] = useState("embedding");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common state
  const [graphId, setGraphId] = useState("graph1");

  // Embedding state
  const [embedType, setEmbedType] = useState("node2vec");
  const [embeddingDim, setEmbeddingDim] = useState(64);
  const [walkLength, setWalkLength] = useState(80);
  const [numWalks, setNumWalks] = useState(10);
  const [windowSize, setWindowSize] = useState(5);
  const [embeddingResult, setEmbeddingResult] = useState<EmbeddingResult | null>(null);

  // Feature state
  const [featureType, setFeatureType] = useState("spectral");
  const [numFeatures, setNumFeatures] = useState(10);
  const [topK, setTopK] = useState(5);
  const [normalize, setNormalize] = useState(true);
  const [featureResult, setFeatureResult] = useState<FeatureResult | null>(null);

  // Representation state
  const [repType, setRepType] = useState("dgi");
  const [hiddenDim, setHiddenDim] = useState(64);
  const [encoderLayers, setEncoderLayers] = useState(2);
  const [decoderLayers, setDecoderLayers] = useState(1);
  const [learningRate, setLearningRate] = useState(0.001);
  const [representationResult, setRepresentationResult] = useState<RepresentationResult | null>(null);

  // Run embedding
  const runEmbedding = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/embedding/encode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          embed_type: embedType,
          embedding_dim: embeddingDim,
          walk_length: walkLength,
          num_walks: numWalks,
          window_size: windowSize,
        }),
      });
      const data = await res.json();
      setEmbeddingResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run feature extraction
  const runFeatures = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/features/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          feature_type: featureType,
          num_features: numFeatures,
          top_k: topK,
          normalize: normalize,
        }),
      });
      const data = await res.json();
      setFeatureResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run representation learning
  const runRepresentation = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/representation/learn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          rep_type: repType,
          hidden_dim: hiddenDim,
          encoder_layers: encoderLayers,
          decoder_layers: decoderLayers,
          learning_rate: learningRate,
        }),
      });
      const data = await res.json();
      setRepresentationResult(data);
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
          <h1 className="text-3xl font-bold">Graph Representation</h1>
          <p className="text-muted-foreground">Embedding, Features & Representation Learning</p>
        </div>
        <Badge variant="outline">v1.69</Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="embedding">Embedding</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="representation">Representation</TabsTrigger>
        </TabsList>

        {/* Embedding Tab */}
        <TabsContent value="embedding">
          <Card>
            <CardHeader>
              <CardTitle>Graph Embedding</CardTitle>
              <CardDescription>
                Generate node embeddings from graph structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Embedding Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={embedType}
                    onChange={(e) => setEmbedType(e.target.value)}
                  >
                    <option value="node2vec">Node2Vec</option>
                    <option value="deepwalk">DeepWalk</option>
                    <option value="graphsage">GraphSAGE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Embedding Dimension</Label>
                  <Input
                    type="number"
                    value={embeddingDim}
                    onChange={(e) => setEmbeddingDim(parseInt(e.target.value))}
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
                  <Label>Number of Walks</Label>
                  <Input
                    type="number"
                    value={numWalks}
                    onChange={(e) => setNumWalks(parseInt(e.target.value))}
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

              <Button onClick={runEmbedding} disabled={loading}>
                {loading ? "Computing..." : "Run Embedding"}
              </Button>

              {embeddingResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(embeddingResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Graph Feature Extraction</CardTitle>
              <CardDescription>
                Extract structural features from graph
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Feature Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={featureType}
                    onChange={(e) => setFeatureType(e.target.value)}
                  >
                    <option value="spectral">Spectral</option>
                    <option value="pagerank">PageRank</option>
                    <option value="centrality">Centrality</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Features</Label>
                  <Input
                    type="number"
                    value={numFeatures}
                    onChange={(e) => setNumFeatures(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Top K</Label>
                  <Input
                    type="number"
                    value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="normalize"
                    checked={normalize}
                    onChange={(e) => setNormalize(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="normalize">Normalize</Label>
                </div>
              </div>

              <Button onClick={runFeatures} disabled={loading}>
                {loading ? "Extracting..." : "Extract Features"}
              </Button>

              {featureResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(featureResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Representation Tab */}
        <TabsContent value="representation">
          <Card>
            <CardHeader>
              <CardTitle>Graph Representation Learning</CardTitle>
              <CardDescription>
                Learn graph-level representations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Representation Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={repType}
                    onChange={(e) => setRepType(e.target.value)}
                  >
                    <option value="dgi">DGI</option>
                    <option value="gmi">GMI</option>
                    <option value="info_graphite">InfoGraph</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Hidden Dimension</Label>
                  <Input
                    type="number"
                    value={hiddenDim}
                    onChange={(e) => setHiddenDim(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Encoder Layers</Label>
                  <Input
                    type="number"
                    value={encoderLayers}
                    onChange={(e) => setEncoderLayers(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Decoder Layers</Label>
                  <Input
                    type="number"
                    value={decoderLayers}
                    onChange={(e) => setDecoderLayers(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Learning Rate</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={learningRate}
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runRepresentation} disabled={loading}>
                {loading ? "Learning..." : "Run Representation Learning"}
              </Button>

              {representationResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(representationResult, null, 2)}
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