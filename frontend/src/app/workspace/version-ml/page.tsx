"use client";

import { useEffect, useState } from "react";
import {
  NetworkIcon,
  BrainIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  Share2Icon,
  RefreshCwIcon,
  TargetIcon,
  LineChartIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// ============================================================
// Version ML Dashboard Page
// ============================================================

interface VersionCluster {
  cluster_id: number;
  versions: string[];
  centroid: Record<string, number>;
  size: number;
}

interface VersionForecast {
  metric: string;
  forecast: Array<{ period: string; value: number; lower: number; upper: number }>;
  trend: string;
  seasonality: string;
  timestamp: string;
}

interface AnomalyPrediction {
  version_id: string;
  anomaly_type: string;
  probability: number;
  severity: string;
  expected_occurrence: string;
}

interface AnomalyPredictionResponse {
  predictions: AnomalyPrediction[];
  risk_score: number;
  recommendations: string[];
  timestamp: string;
}

interface SimilarityEdge {
  version_a: string;
  version_b: string;
  similarity: number;
}

interface SimilarityGraph {
  nodes: string[];
  edges: SimilarityEdge[];
  timestamp: string;
}

export default function VersionMLPage() {
  const [clustering, setClustering] = useState<{ clusters: VersionCluster[] } | null>(null);
  const [forecasting, setForecasting] = useState<VersionForecast | null>(null);
  const [anomalyPrediction, setAnomalyPrediction] = useState<AnomalyPredictionResponse | null>(null);
  const [similarityGraph, setSimilarityGraph] = useState<SimilarityGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clusterCount, setClusterCount] = useState(3);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.1);

  // Fetch clustering
  const fetchClustering = async () => {
    try {
      const response = await fetch(`/api/knowledge-graph/versions/ml/clustering?k=${clusterCount}`);
      if (!response.ok) throw new Error("Failed to fetch clustering");
      const data = await response.json();
      setClustering(data);
    } catch (err) {
      console.error("Clustering error:", err);
    }
  };

  // Fetch forecasting
  const fetchForecasting = async () => {
    try {
      const response = await fetch("/api/knowledge-graph/versions/ml/forecast?metric=entities&periods=5");
      if (!response.ok) throw new Error("Failed to fetch forecasting");
      const data = await response.json();
      setForecasting(data);
    } catch (err) {
      console.error("Forecasting error:", err);
    }
  };

  // Fetch anomaly prediction
  const fetchAnomalyPrediction = async () => {
    try {
      const response = await fetch("/api/knowledge-graph/versions/ml/anomaly-prediction");
      if (!response.ok) throw new Error("Failed to fetch anomaly prediction");
      const data = await response.json();
      setAnomalyPrediction(data);
    } catch (err) {
      console.error("Anomaly prediction error:", err);
    }
  };

  // Fetch similarity graph
  const fetchSimilarityGraph = async () => {
    try {
      const response = await fetch(`/api/knowledge-graph/versions/ml/similarity-graph?threshold=${similarityThreshold}`);
      if (!response.ok) throw new Error("Failed to fetch similarity graph");
      const data = await response.json();
      setSimilarityGraph(data);
    } catch (err) {
      console.error("Similarity graph error:", err);
    }
  };

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchClustering(), fetchForecasting(), fetchAnomalyPrediction(), fetchSimilarityGraph()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [clusterCount, similarityThreshold]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-orange-500";
      default:
        return "text-yellow-500";
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      default:
        return "bg-yellow-500";
    }
  };

  // Get risk color
  const getRiskColor = (score: number) => {
    if (score >= 0.7) return "text-red-500";
    if (score >= 0.4) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BrainIcon className="h-8 w-8 text-cyan-500" />
            Version ML
          </h1>
          <p className="text-muted-foreground mt-1">
            Machine learning for version analysis, clustering, and predictions
          </p>
        </div>
        <Button onClick={loadAllData} disabled={loading}>
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Overview Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Risk Score */}
          <Card className={anomalyPrediction && anomalyPrediction.risk_score >= 0.7 ? "border-red-500/50" : "border-green-500/50"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangleIcon className="h-4 w-4" />
                Overall Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${anomalyPrediction ? getRiskColor(anomalyPrediction.risk_score) : "text-gray-500"}`}>
                {anomalyPrediction ? (anomalyPrediction.risk_score * 100).toFixed(0) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Risk score</p>
            </CardContent>
          </Card>

          {/* Clusters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <NetworkIcon className="h-4 w-4" />
                Clusters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{clustering?.clusters?.length || 0}</div>
              <p className="text-xs text-muted-foreground">version groups</p>
            </CardContent>
          </Card>

          {/* Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUpIcon className="h-4 w-4" />
                Forecast Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold capitalize">
                {forecasting?.trend || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                {forecasting?.seasonality || "no seasonality"}
              </p>
            </CardContent>
          </Card>

          {/* Similarity Edges */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Share2Icon className="h-4 w-4" />
                Similarity Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{similarityGraph?.edges?.length || 0}</div>
              <p className="text-xs text-muted-foreground">connected versions</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="clustering" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clustering">Clustering</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="anomaly">Anomaly Prediction</TabsTrigger>
          <TabsTrigger value="graph">Similarity Graph</TabsTrigger>
        </TabsList>

        {/* Clustering Tab */}
        <TabsContent value="clustering">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NetworkIcon className="h-5 w-5" />
                Version Clustering
              </CardTitle>
              <CardDescription>Group similar versions together using k-means clustering</CardDescription>
              <div className="flex items-center gap-2 mt-4">
                <label className="text-sm">Number of clusters:</label>
                <select
                  value={clusterCount}
                  onChange={(e) => setClusterCount(Number(e.target.value))}
                  className="px-3 py-2 rounded border bg-background"
                >
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {clustering && clustering.clusters.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No clustering data available
                </div>
              )}

              {clustering && clustering.clusters.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clustering.clusters.map((cluster) => (
                    <Card key={cluster.cluster_id} className="border-muted">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500">
                            {cluster.cluster_id + 1}
                          </div>
                          Cluster {cluster.cluster_id}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground mb-2">
                          {cluster.size} version{cluster.size > 1 ? "s" : ""}
                        </div>
                        <div className="space-y-2">
                          {cluster.versions.map((v, idx) => (
                            <Badge key={idx} variant="outline" className="mr-1">
                              {v}
                            </Badge>
                          ))}
                        </div>
                        {cluster.centroid && (
                          <div className="mt-4 text-xs text-muted-foreground">
                            <div>Entity density: {((cluster.centroid.entities || 0) * 100).toFixed(0)}%</div>
                            <div>Relation density: {((cluster.centroid.relations || 0) * 100).toFixed(0)}%</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecasting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Version Forecasting
              </CardTitle>
              <CardDescription>Predict future version metrics with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              {forecasting && (
                <div className="space-y-6">
                  {/* Trend Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="text-sm text-muted-foreground">Trend</div>
                      <div className="text-xl font-bold capitalize">{forecasting.trend}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="text-sm text-muted-foreground">Seasonality</div>
                      <div className="text-xl font-bold capitalize">{forecasting.seasonality}</div>
                    </div>
                  </div>

                  {/* Forecast Table */}
                  {forecasting.forecast.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-2">Forecast Data</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Period</th>
                              <th className="text-right p-2">Predicted</th>
                              <th className="text-right p-2">Lower</th>
                              <th className="text-right p-2">Upper</th>
                            </tr>
                          </thead>
                          <tbody>
                            {forecasting.forecast.map((f, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="p-2">{f.period}</td>
                                <td className="text-right p-2 font-medium">{f.value.toFixed(1)}</td>
                                <td className="text-right p-2 text-muted-foreground">{f.lower.toFixed(1)}</td>
                                <td className="text-right p-2 text-muted-foreground">{f.upper.toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {forecasting.forecast.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No forecast data available
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomaly Prediction Tab */}
        <TabsContent value="anomaly">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TargetIcon className="h-5 w-5" />
                Anomaly Prediction
              </CardTitle>
              <CardDescription>AI-powered prediction of future anomalies</CardDescription>
            </CardHeader>
            <CardContent>
              {anomalyPrediction && (
                <div className="space-y-4">
                  {/* Risk Score */}
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="text-sm text-muted-foreground">Overall Risk Score</div>
                    <div className={`text-2xl font-bold ${getRiskColor(anomalyPrediction.risk_score)}`}>
                      {(anomalyPrediction.risk_score * 100).toFixed(0)}%
                    </div>
                  </div>

                  {/* Predictions */}
                  {anomalyPrediction.predictions.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Predicted Anomalies</div>
                      {anomalyPrediction.predictions.map((pred, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <AlertTriangleIcon className={`h-5 w-5 ${getSeverityColor(pred.severity)}`} />
                            <div>
                              <div className="font-medium">{pred.version_id}</div>
                              <div className="text-sm text-muted-foreground">
                                {pred.anomaly_type.replace("_", " ")} ({pred.expected_occurrence})
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getSeverityBadge(pred.severity)} text-white`}>
                            {pred.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {anomalyPrediction.predictions.length === 0 && (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                      <CheckCircleIcon className="h-8 w-8 mr-2 text-green-500" />
                      No anomalies predicted
                    </div>
                  )}

                  {/* Recommendations */}
                  {anomalyPrediction.recommendations.length > 0 && (
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-sm font-medium text-blue-500 mb-2">Recommendations</div>
                      <ul className="space-y-1 text-sm">
                        {anomalyPrediction.recommendations.map((rec, idx) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similarity Graph Tab */}
        <TabsContent value="graph">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2Icon className="h-5 w-5" />
                Version Similarity Network
              </CardTitle>
              <CardDescription>Network graph showing version relationships</CardDescription>
              <div className="flex items-center gap-2 mt-4">
                <label className="text-sm">Similarity threshold:</label>
                <select
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
                  className="px-3 py-2 rounded border bg-background"
                >
                  {[0.1, 0.2, 0.3, 0.5, 0.7].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {similarityGraph && (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="text-sm text-muted-foreground">Nodes</div>
                      <div className="text-2xl font-bold">{similarityGraph.nodes.length}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted">
                      <div className="text-sm text-muted-foreground">Edges</div>
                      <div className="text-2xl font-bold">{similarityGraph.edges.length}</div>
                    </div>
                  </div>

                  {/* Edges List */}
                  {similarityGraph.edges.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Similar Version Pairs</div>
                      {similarityGraph.edges.map((edge, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded bg-muted">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{edge.version_a}</Badge>
                            <span className="text-muted-foreground">↔</span>
                            <Badge variant="outline">{edge.version_b}</Badge>
                          </div>
                          <div className="text-sm font-medium">
                            {(edge.similarity * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {similarityGraph.edges.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No similarity edges at this threshold
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}