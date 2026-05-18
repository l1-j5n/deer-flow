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

interface SimilarityScore {
  entity1: string;
  entity2: string;
  score: number;
}

interface EntitySimilarity {
  entity: string;
  score: number;
  common_neighbors?: string[];
}

interface SimilarityResult {
  method: string;
  similarities: SimilarityScore[];
}

interface SimilarityBetween {
  entity1: string;
  entity2: string;
  jaccard_similarity: number;
  cosine_similarity: number;
  common_neighbors: string[];
}

interface PredictionResult {
  entity: string;
  predictions: Record<string, EntitySimilarity[]>;
}

interface LinkScore {
  entity1: string;
  entity2: string;
  common_neighbors_score: number;
  jaccard_score: number;
  preferential_attachment_score: number;
  common_neighbors: string[];
}

interface AnomalyResult {
  method: string;
  anomalies: Array<{ entity: string; degree?: number; z_score?: number; type?: string; isolation_score?: number; reason?: string }>;
}

interface AnomalyCheck {
  entity: string;
  degree: number;
  mean_degree: number;
  z_score: number;
  is_anomalous: boolean;
}

interface LinkSummary {
  total_entities: number;
  total_relations: number;
  potential_links: number;
  cached_predictions: number;
}

export default function SimilarityPredictionPage() {
  const [activeTab, setActiveTab] = useState("similarity");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Similarity state
  const [simMethod, setSimMethod] = useState("jaccard");
  const [targetEntity, setTargetEntity] = useState("");
  const [topK, setTopK] = useState(10);
  const [similarityResult, setSimilarityResult] = useState<SimilarityResult | null>(null);
  const [entitySimilarity, setEntitySimilarity] = useState<SimilarityBetween | null>(null);
  const [mostSimilar, setMostSimilar] = useState<EntitySimilarity[]>([]);

  // Link prediction state
  const [predEntity, setPredEntity] = useState("");
  const [predMethods, setPredMethods] = useState("common_neighbors,adamic_adar,resource_allocation");
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [linkScore, setLinkScore] = useState<LinkScore | null>(null);
  const [linkSummary, setLinkSummary] = useState<LinkSummary | null>(null);

  // Anomaly state
  const [anomalyMethod, setAnomalyMethod] = useState("degree_anomaly");
  const [threshold, setThreshold] = useState(2.0);
  const [anomalyResult, setAnomalyResult] = useState<AnomalyResult | null>(null);
  const [anomalyCheck, setAnomalyCheck] = useState<AnomalyCheck | null>(null);
  const [checkEntity, setCheckEntity] = useState("");

  // Entity pair state
  const [entity1, setEntity1] = useState("");
  const [entity2, setEntity2] = useState("");

  // Similarity functions
  const calculateSimilarity = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/similarity/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: simMethod,
          top_k: topK,
        }),
      });
      const data = await res.json();
      setSimilarityResult(data);
    } catch (e) {
      setError("Failed to calculate similarity");
    }
    setLoading(false);
  };

  const calculatePairSimilarity = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/similarity/entity-pair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity1: entity1,
          entity2: entity2,
        }),
      });
      const data = await res.json();
      setEntitySimilarity(data);
    } catch (e) {
      setError("Failed to calculate pair similarity");
    }
    setLoading(false);
  };

  const findMostSimilar = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/similarity/most-similar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: targetEntity,
          method: simMethod,
          top_k: topK,
        }),
      });
      const data = await res.json();
      setMostSimilar(data.similar_entities || []);
    } catch (e) {
      setError("Failed to find most similar");
    }
    setLoading(false);
  };

  // Link prediction functions
  const predictLinks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/linkprediction/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: predEntity,
          top_k: topK,
          methods: predMethods.split(","),
        }),
      });
      const data = await res.json();
      setPredictionResult(data);
    } catch (e) {
      setError("Failed to predict links");
    }
    setLoading(false);
  };

  const scoreLink = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/linkprediction/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity1: entity1,
          entity2: entity2,
        }),
      });
      const data = await res.json();
      setLinkScore(data);
    } catch (e) {
      setError("Failed to score link");
    }
    setLoading(false);
  };

  const getLinkSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/linkprediction/summary`);
      const data = await res.json();
      setLinkSummary(data);
    } catch (e) {
      console.error("Failed to get link summary");
    }
  };

  // Anomaly functions
  const detectAnomalies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/anomaly/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: anomalyMethod,
          threshold: threshold,
        }),
      });
      const data = await res.json();
      setAnomalyResult(data);
    } catch (e) {
      setError("Failed to detect anomalies");
    }
    setLoading(false);
  };

  const checkEntityAnomaly = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph/anomaly/check-entity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: checkEntity,
        }),
      });
      const data = await res.json();
      setAnomalyCheck(data);
    } catch (e) {
      setError("Failed to check entity");
    }
    setLoading(false);
  };

  useEffect(() => {
    getLinkSummary();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Similarity & Link Prediction</h1>
          <p className="text-muted-foreground">
            Graph similarity, link prediction, and anomaly detection
          </p>
        </div>
        <Badge variant="outline">v1.55</Badge>
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
          <TabsTrigger value="similarity">Similarity</TabsTrigger>
          <TabsTrigger value="prediction">Link Prediction</TabsTrigger>
          <TabsTrigger value="anomaly">Anomaly</TabsTrigger>
        </TabsList>

        {/* Similarity Tab */}
        <TabsContent value="similarity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Calculate Similarity</CardTitle>
                <CardDescription>Calculate entity similarity scores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Method</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={simMethod}
                    onChange={(e) => setSimMethod(e.target.value)}
                  >
                    <option value="jaccard">Jaccard</option>
                    <option value="cosine">Cosine</option>
                    <option value="adamic_adar">Adamic-Adar</option>
                    <option value="resource_allocation">Resource Allocation</option>
                  </select>
                </div>
                <div>
                  <Label>Top K</Label>
                  <Input
                    type="number"
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                  />
                </div>
                <Button onClick={calculateSimilarity} disabled={loading}>
                  Calculate
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entity Pair Similarity</CardTitle>
                <CardDescription>Similarity between two entities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Entity 1</Label>
                    <Input
                      value={entity1}
                      onChange={(e) => setEntity1(e.target.value)}
                      placeholder="Entity ID"
                    />
                  </div>
                  <div>
                    <Label>Entity 2</Label>
                    <Input
                      value={entity2}
                      onChange={(e) => setEntity2(e.target.value)}
                      placeholder="Entity ID"
                    />
                  </div>
                </div>
                <Button onClick={calculatePairSimilarity} disabled={loading}>
                  Calculate Pair
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Similar Entities</CardTitle>
                <CardDescription>Find most similar to target</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={targetEntity}
                  onChange={(e) => setTargetEntity(e.target.value)}
                  placeholder="Target Entity ID"
                />
                <Button onClick={findMostSimilar} disabled={loading}>
                  Find Similar
                </Button>
              </CardContent>
            </Card>

            {/* Similarity Result */}
            {similarityResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Similarity Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {similarityResult.similarities.slice(0, 20).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <span className="font-mono text-sm">
                            {item.entity1} - {item.entity2}
                          </span>
                          <Badge>{item.score}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Entity Pair Similarity */}
            {entitySimilarity && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Pair: {entitySimilarity.entity1} ↔ {entitySimilarity.entity2}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Jaccard</p>
                      <p className="font-bold text-xl">
                        {entitySimilarity.jaccard_similarity}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cosine</p>
                      <p className="font-bold text-xl">
                        {entitySimilarity.cosine_similarity}
                      </p>
                    </div>
                  </div>
                  {entitySimilarity.common_neighbors.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Common Neighbors
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {entitySimilarity.common_neighbors.map((n, idx) => (
                          <Badge key={idx} variant="outline">{n}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Most Similar */}
            {mostSimilar.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Most Similar to {targetEntity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mostSimilar.map((item, idx) => (
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

        {/* Link Prediction Tab */}
        <TabsContent value="prediction">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Predict Links</CardTitle>
                <CardDescription>Predict potential links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={predEntity}
                  onChange={(e) => setPredEntity(e.target.value)}
                  placeholder="Entity ID"
                />
                <div>
                  <Label>Methods (comma-separated)</Label>
                  <Input
                    value={predMethods}
                    onChange={(e) => setPredMethods(e.target.value)}
                    placeholder="common_neighbors,adamic_adar"
                  />
                </div>
                <Button onClick={predictLinks} disabled={loading}>
                  Predict Links
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Potential Link</CardTitle>
                <CardDescription>Score a specific link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={entity1}
                    onChange={(e) => setEntity1(e.target.value)}
                    placeholder="Entity 1"
                  />
                  <Input
                    value={entity2}
                    onChange={(e) => setEntity2(e.target.value)}
                    placeholder="Entity 2"
                  />
                </div>
                <Button onClick={scoreLink} disabled={loading}>
                  Score Link
                </Button>
              </CardContent>
            </Card>

            {/* Link Summary */}
            {linkSummary && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Link Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Entities</p>
                      <p className="font-bold text-2xl">{linkSummary.total_entities}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Relations</p>
                      <p className="font-bold text-2xl">{linkSummary.total_relations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Potential Links</p>
                      <p className="font-bold text-2xl">{linkSummary.potential_links}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prediction Result */}
            {predictionResult && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Predictions for {predictionResult.entity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(predictionResult.predictions).map(
                      ([method, predictions]) => (
                        <div key={method}>
                          <p className="font-semibold mb-2">{method}</p>
                          <div className="flex gap-2 flex-wrap">
                            {predictions.slice(0, 5).map((p, idx) => (
                              <Badge key={idx} variant="outline">
                                {p.entity}: {p.score}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Link Score */}
            {linkScore && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Link Score: {linkScore.entity1} ↔ {linkScore.entity2}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Common Neighbors</p>
                      <p className="font-bold text-xl">
                        {linkScore.common_neighbors_score}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Jaccard</p>
                      <p className="font-bold text-xl">
                        {linkScore.jaccard_score}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">PA Score</p>
                      <p className="font-bold text-xl">
                        {linkScore.preferential_attachment_score}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Anomaly Tab */}
        <TabsContent value="anomaly">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Detect Anomalies</CardTitle>
                <CardDescription>Find anomalous entities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Method</Label>
                  <select
                    className="w-full border rounded p-2"
                    value={anomalyMethod}
                    onChange={(e) => setAnomalyMethod(e.target.value)}
                  >
                    <option value="degree_anomaly">Degree Anomaly</option>
                    <option value="isolation_score">Isolation Score</option>
                    <option value="outlier_links">Outlier Links</option>
                  </select>
                </div>
                <div>
                  <Label>Threshold (std deviations)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                  />
                </div>
                <Button onClick={detectAnomalies} disabled={loading}>
                  Detect Anomalies
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check Entity</CardTitle>
                <CardDescription>Check if entity is anomalous</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={checkEntity}
                  onChange={(e) => setCheckEntity(e.target.value)}
                  placeholder="Entity ID"
                />
                <Button onClick={checkEntityAnomaly} disabled={loading}>
                  Check Entity
                </Button>
              </CardContent>
            </Card>

            {/* Anomaly Result */}
            {anomalyResult && anomalyResult.anomalies && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Detected Anomalies</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {anomalyResult.anomalies.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center p-2 border rounded"
                        >
                          <span className="font-mono">{item.entity}</span>
                          <div className="flex gap-2">
                            {item.z_score && <Badge>z: {item.z_score}</Badge>}
                            {item.type && (
                              <Badge variant="destructive">{item.type}</Badge>
                            )}
                            {item.reason && (
                              <Badge variant="outline">{item.reason}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Anomaly Check */}
            {anomalyCheck && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Check Result: {anomalyCheck.entity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Degree</p>
                      <p className="font-bold text-2xl">{anomalyCheck.degree}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Mean Degree</p>
                      <p className="font-bold text-2xl">{anomalyCheck.mean_degree}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p>Z-Score: {anomalyCheck.z_score}</p>
                    {anomalyCheck.is_anomalous ? (
                      <Badge variant="destructive">Anomalous</Badge>
                    ) : (
                      <Badge variant="outline">Normal</Badge>
                    )}
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