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

interface EmbeddingResult {
  method: string;
  dimensions: number;
  entity_count: number;
}

interface EntityEmbedding {
  entity: string;
  embedding: number[];
  dimensions: number;
}

interface SimilarEntity {
  entity: string;
  score: number;
}

interface NeuralPrediction {
  entity: string;
  score: number;
  model: string;
}

interface NeuralResult {
  entity: string;
  model: string;
  predictions: NeuralPrediction[];
}

interface CompletionResult {
  entity: string;
  relation_predictions: Array<{ type: string; value: string; score: number }>;
  missing_relations: Array<{ entity: string; type: string; score: number; reason: string }>;
  property_predictions: Array<{ property: string; frequency: number; confidence: number }>;
}

interface MissingLink {
  from: string;
  to: string;
  common_neighbors: number;
}

interface EmbeddingSummary {
  cached_embeddings: number;
  total_entities: number;
}

export default function EmbeddingCompletionPage() {
  const [activeTab, setActiveTab] = useState("embedding");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Embedding state
  const [embedMethod, setEmbedMethod] = useState("deepwalk");
  const [dimensions, setDimensions] = useState(64);
  const [embeddingResult, setEmbeddingResult] = useState<EmbeddingResult | null>(null);
  const [entityEmbedding, setEntityEmbedding] = useState<EntityEmbedding | null>(null);
  const [similarEntities, setSimilarEntities] = useState<SimilarEntity[]>([]);

  // Neural state
  const [predEntity, setPredEntity] = useState("");
  const [predModel, setPredModel] = useState("simple");
  const [neuralResult, setNeuralResult] = useState<NeuralResult | null>(null);

  // Completion state
  const [completeEntity, setCompleteEntity] = useState("");
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const [missingLinks, setMissingLinks] = useState<MissingLink[]>([]);

  // Embedding functions
  const generateEmbeddings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/embedding/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: embedMethod,
          dimensions: dimensions,
        }),
      });
      const data = await res.json();
      setEmbeddingResult(data);
    } catch (e) {
      setError("Failed to generate embeddings");
    }
    setLoading(false);
  };

  const getEntityEmbedding = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/embedding/entity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: completeEntity,
          method: embedMethod,
        }),
      });
      const data = await res.json();
      setEntityEmbedding(data);
    } catch (e) {
      setError("Failed to get entity embedding");
    }
    setLoading(false);
  };

  const findSimilarEntities = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/embedding/similarity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: completeEntity,
          top_k: 10,
          method: embedMethod,
        }),
      });
      const data = await res.json();
      setSimilarEntities(data.similar_entities || []);
    } catch (e) {
      setError("Failed to find similar entities");
    }
    setLoading(false);
  };

  // Neural link prediction functions
  const predictNeural = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/neural/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: predEntity,
          top_k: 10,
          model: predModel,
        }),
      });
      const data = await res.json();
      setNeuralResult(data);
    } catch (e) {
      setError("Failed to predict links");
    }
    setLoading(false);
  };

  // Completion functions
  const completeEntityPredictions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/completion/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: completeEntity,
          top_k: 10,
        }),
      });
      const data = await res.json();
      setCompletionResult(data);
    } catch (e) {
      setError("Failed to complete entity");
    }
    setLoading(false);
  };

  const findMissingLinks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/completion/missing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ top_k: 20 }),
      });
      const data = await res.json();
      setMissingLinks(data.potential_missing || []);
    } catch (e) {
      setError("Failed to find missing links");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Embedding & Completion</h1>
          <p className="text-muted-foreground">
            Graph embeddings, neural link prediction, and knowledge graph completion
          </p>
        </div>
        <Badge variant="outline">v1.56</Badge>
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
          <TabsTrigger value="embedding">Embeddings</TabsTrigger>
          <TabsTrigger value="neural">Neural Prediction</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
        </TabsList>

        {/* Embeddings Tab */}
        <TabsContent value="embedding">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Embeddings</CardTitle>
                <CardDescription>Generate graph embeddings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Method</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={embedMethod}
                    onChange={(e) => setEmbedMethod(e.target.value)}
                  >
                    <option value="deepwalk">DeepWalk</option>
                    <option value="node2vec">Node2Vec</option>
                    <option value="spectral">Spectral</option>
                  </select>
                </div>
                <div>
                  <Label>Dimensions</Label>
                  <Input
                    type="number"
                    value={dimensions}
                    onChange={(e) => setDimensions(Number(e.target.value))}
                  />
                </div>
                <Button onClick={generateEmbeddings} disabled={loading}>
                  Generate
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entity Embedding</CardTitle>
                <CardDescription>Get embedding for entity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={completeEntity}
                  onChange={(e) => setCompleteEntity(e.target.value)}
                  placeholder="Entity ID"
                />
                <div className="flex gap-2">
                  <Button onClick={getEntityEmbedding} disabled={loading}>
                    Get Embedding
                  </Button>
                  <Button onClick={findSimilarEntities} disabled={loading} variant="outline">
                    Find Similar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Embedding Result */}
            {embeddingResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Embedding Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Method</p>
                      <p className="font-mono">{embeddingResult.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dimensions</p>
                      <p className="font-mono">{embeddingResult.dimensions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entities</p>
                      <p className="font-bold text-2xl">{embeddingResult.entity_count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Entity Embedding */}
            {entityEmbedding && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Embedding: {entityEmbedding.entity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-32">
                    <p className="font-mono text-sm">
                      [{entityEmbedding.embedding.slice(0, 8).join(", ")}...]
                    </p>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Similar Entities */}
            {similarEntities.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Most Similar to {completeEntity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {similarEntities.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 border rounded"
                      >
                        <span className="font-mono">{item.entity}</span>
                        <Badge>{item.score}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Neural Link Prediction Tab */}
        <TabsContent value="neural">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Neural Link Prediction</CardTitle>
                <CardDescription>Predict links using neural methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={predEntity}
                  onChange={(e) => setPredEntity(e.target.value)}
                  placeholder="Entity ID"
                />
                <div>
                  <Label>Model</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={predModel}
                    onChange={(e) => setPredModel(e.target.value)}
                  >
                    <option value="simple">Simple</option>
                    <option value="gcn">GCN</option>
                    <option value="graphsage">GraphSAGE</option>
                  </select>
                </div>
                <Button onClick={predictNeural} disabled={loading}>
                  Predict Links
                </Button>
              </CardContent>
            </Card>

            {/* Neural Result */}
            {neuralResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Predictions for {neuralResult.entity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">Model: {neuralResult.model}</p>
                  <div className="space-y-2">
                    {neuralResult.predictions.slice(0, 10).map((pred, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 border rounded"
                      >
                        <span className="font-mono">{pred.entity}</span>
                        <Badge>{pred.score}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Completion Tab */}
        <TabsContent value="completion">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Graph Completion</CardTitle>
                <CardDescription>Predict missing entities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={completeEntity}
                  onChange={(e) => setCompleteEntity(e.target.value)}
                  placeholder="Entity ID"
                />
                <div className="flex gap-2">
                  <Button onClick={completeEntityPredictions} disabled={loading}>
                    Complete
                  </Button>
                  <Button onClick={findMissingLinks} disabled={loading} variant="outline">
                    Find Missing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Completion Result */}
            {completionResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Completion: {completionResult.entity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completionResult.relation_predictions.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Relation Predictions</p>
                        <div className="flex gap-2 flex-wrap">
                          {completionResult.relation_predictions.map(
                            (pred, idx) => (
                              <Badge key={idx} variant="outline">
                                {pred.value}: {pred.score}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {completionResult.missing_relations.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Missing Relations</p>
                        <div className="space-y-2">
                          {completionResult.missing_relations.slice(0, 5).map(
                            (rel, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between p-2 border rounded"
                              >
                                <span className="font-mono">{rel.entity}</span>
                                <div className="flex gap-2">
                                  <Badge variant="outline">{rel.type}</Badge>
                                  <Badge>{rel.score}</Badge>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {completionResult.property_predictions.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Missing Properties</p>
                        <div className="flex gap-2 flex-wrap">
                          {completionResult.property_predictions.map(
                            (pred, idx) => (
                              <Badge key={idx} variant="secondary">
                                {pred.property}: {pred.confidence}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Missing Links */}
            {missingLinks.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Potential Missing Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {missingLinks.map((link, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <span className="font-mono">
                            {link.from} ↔ {link.to}
                          </span>
                          <Badge>CN: {link.common_neighbors}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}