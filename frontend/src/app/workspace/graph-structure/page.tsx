"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

interface ClusteringResult {
  type: string;
  num_clusters?: number;
  affinity?: string;
  linkage?: string;
  eigen_solver?: string;
}

interface SegmentationResult {
  type: string;
  num_segments?: number;
  threshold?: number;
  min_size?: number;
  balance_ratio?: number;
}

interface CommunityResult {
  type: string;
  resolution?: number;
  random_walk_steps?: number;
  algorithm?: string;
  quality?: string;
}

export default function GraphStructurePage() {
  const [activeTab, setActiveTab] = useState("clustering");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Common state
  const [graphId, setGraphId] = useState("graph1");

  // Clustering state
  const [clusterType, setClusterType] = useState("spectral");
  const [numClusters, setNumClusters] = useState(5);
  const [affinity, setAffinity] = useState("rbf");
  const [linkage, setLinkage] = useState("ward");
  const [clusteringResult, setClusteringResult] = useState<ClusteringResult | null>(null);

  // Segmentation state
  const [segType, setSegType] = useState("balanced");
  const [numSegments, setNumSegments] = useState(10);
  const [threshold, setThreshold] = useState(0.5);
  const [minSize, setMinSize] = useState(5);
  const [segmentationResult, setSegmentationResult] = useState<SegmentationResult | null>(null);

  // Community state
  const [communityType, setCommunityType] = useState("louvain");
  const [resolution, setResolution] = useState(1.0);
  const [randomWalkSteps, setRandomWalkSteps] = useState(10);
  const [algorithm, setAlgorithm] = useState("greedy");
  const [communityResult, setCommunityResult] = useState<CommunityResult | null>(null);

  // Run clustering
  const runClustering = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/clustering/cluster`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          cluster_type: clusterType,
          num_clusters: numClusters,
          affinity: affinity,
          linkage: linkage,
        }),
      });
      const data = await res.json();
      setClusteringResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run segmentation
  const runSegmentation = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/segmentation/segment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          seg_type: segType,
          num_segments: numSegments,
          threshold: threshold,
          min_size: minSize,
        }),
      });
      const data = await res.json();
      setSegmentationResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Run community detection
  const runCommunity = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/community/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          community_type: communityType,
          resolution: resolution,
          random_walk_steps: randomWalkSteps,
          algorithm: algorithm,
        }),
      });
      const data = await res.json();
      setCommunityResult(data);
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
          <h1 className="text-3xl font-bold">Graph Structure</h1>
          <p className="text-muted-foreground">Clustering, Segmentation & Community Detection</p>
        </div>
        <Badge variant="outline">v1.67</Badge>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="clustering">Clustering</TabsTrigger>
          <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        {/* Clustering Tab */}
        <TabsContent value="clustering">
          <Card>
            <CardHeader>
              <CardTitle>Graph Clustering</CardTitle>
              <CardDescription>
                Cluster graph nodes into groups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Clustering Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={clusterType}
                    onChange={(e) => setClusterType(e.target.value)}
                  >
                    <option value="spectral">Spectral</option>
                    <option value="kmeans">K-Means</option>
                    <option value="hierarchical">Hierarchical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Clusters</Label>
                  <Input
                    type="number"
                    value={numClusters}
                    onChange={(e) => setNumClusters(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Affinity</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={affinity}
                    onChange={(e) => setAffinity(e.target.value)}
                  >
                    <option value="rbf">RBF</option>
                    <option value="cosine">Cosine</option>
                    <option value="euclidean">Euclidean</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Linkage</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={linkage}
                    onChange={(e) => setLinkage(e.target.value)}
                  >
                    <option value="ward">Ward</option>
                    <option value="complete">Complete</option>
                    <option value="average">Average</option>
                  </select>
                </div>
              </div>

              <Button onClick={runClustering} disabled={loading}>
                {loading ? "Clustering..." : "Run Clustering"}
              </Button>

              {clusteringResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(clusteringResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segmentation Tab */}
        <TabsContent value="segmentation">
          <Card>
            <CardHeader>
              <CardTitle>Graph Segmentation</CardTitle>
              <CardDescription>
                Segment graph into coherent parts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Segmentation Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={segType}
                    onChange={(e) => setSegType(e.target.value)}
                  >
                    <option value="balanced">Balanced</option>
                    <option value="hierarchical">Hierarchical</option>
                    <option value="watershed">Watershed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Segments</Label>
                  <Input
                    type="number"
                    value={numSegments}
                    onChange={(e) => setNumSegments(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Threshold</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Size</Label>
                  <Input
                    type="number"
                    value={minSize}
                    onChange={(e) => setMinSize(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={runSegmentation} disabled={loading}>
                {loading ? "Segmenting..." : "Run Segmentation"}
              </Button>

              {segmentationResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(segmentationResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community">
          <Card>
            <CardHeader>
              <CardTitle>Community Detection</CardTitle>
              <CardDescription>
                Detect communities in graph
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Graph ID</Label>
                  <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Community Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={communityType}
                    onChange={(e) => setCommunityType(e.target.value)}
                  >
                    <option value="louvain">Louvain</option>
                    <option value="label">Label Propagation</option>
                    <option value="infomap">InfoMap</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Resolution</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={resolution}
                    onChange={(e) => setResolution(parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Random Walk Steps</Label>
                  <Input
                    type="number"
                    value={randomWalkSteps}
                    onChange={(e) => setRandomWalkSteps(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Algorithm</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                  >
                    <option value="greedy">Greedy</option>
                    <option value="modularity">Modularity</option>
                    <option value="surprise">Surprise</option>
                  </select>
                </div>
              </div>

              <Button onClick={runCommunity} disabled={loading}>
                {loading ? "Detecting..." : "Detect Communities"}
              </Button>

              {communityResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(communityResult, null, 2)}
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