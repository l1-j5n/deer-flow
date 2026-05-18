"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Box, Layers, RotateCw, Ruler, Navigation, Group } from "lucide-react";

const API_BASE = "";

export default function GraphHyperdimensionalEmbeddingPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Embed state — 嵌入超维空间
  const [topology, setTopology] = useState("euclidean");
  const [dimensions, setDimensions] = useState(128);
  const [projMethod, setProjMethod] = useState("random_projection");
  const [numStructures, setNumStructures] = useState(5);
  const [causalDensity, setCausalDensity] = useState(0.6);

  // Project state — 降维投影
  const [projectMethod, setProjectMethod] = useState("pca_projection");
  const [targetDimensions, setTargetDimensions] = useState(3);
  const [preserveVariance, setPreserveVariance] = useState(0.95);
  const [numEmbeddings, setNumEmbeddings] = useState(10);

  // Transform state — 几何变换
  const [transform, setTransform] = useState("rotation");
  const [angle, setAngle] = useState(45);
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [iterations, setIterations] = useState(5);

  // Measure state — 测量距离
  const [metric, setMetric] = useState("cosine");
  const [numPairs, setNumPairs] = useState(8);
  const [measureManifold, setMeasureManifold] = useState("flat");

  // Navigate state — 测地线路径
  const [pathStrategy, setPathStrategy] = useState("shortest_path");
  const [waypoints, setWaypoints] = useState(5);
  const [navManifold, setNavManifold] = useState("curved");
  const [curvature, setCurvature] = useState(0.5);

  // Cluster state — 聚类
  const [clusterManifold, setClusterManifold] = useState("flat");
  const [numClusters, setNumClusters] = useState(4);
  const [threshold, setThreshold] = useState(0.7);
  const [numPoints, setNumPoints] = useState(30);

  const callAPI = async (endpoint: string, body: any) => {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/graph${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setResults({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/causal-hyperdimensional-embedding/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      setOverview({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const TOPOLOGIES = [
    { value: "euclidean", label: "Euclidean 欧氏" },
    { value: "hyperbolic", label: "Hyperbolic 双曲" },
    { value: "spherical", label: "Spherical 球面" },
    { value: "product_manifold", label: "Product Manifold 积流形" },
    { value: "fiber_bundle", label: "Fiber Bundle 纤维丛" },
    { value: "ai_adaptive", label: "AI Adaptive 自适应" },
  ];
  const PROJ_METHODS = [
    { value: "random_projection", label: "Random Projection" },
    { value: "pca_projection", label: "PCA" },
    { value: "tsne_projection", label: "t-SNE" },
    { value: "umap_projection", label: "UMAP" },
    { value: "autoencoder_projection", label: "Autoencoder" },
    { value: "ai_learned", label: "AI Learned" },
  ];
  const TRANSFORMS = [
    { value: "rotation", label: "Rotation 旋转" },
    { value: "reflection", label: "Reflection 反射" },
    { value: "shear", label: "Shear 剪切" },
    { value: "scaling", label: "Scaling 缩放" },
    { value: "inversion", label: "Inversion 反演" },
    { value: "ai_compositional", label: "AI Compositional" },
  ];
  const METRICS = [
    { value: "cosine", label: "Cosine 余弦" },
    { value: "euclidean_dist", label: "Euclidean 欧氏" },
    { value: "manhattan", label: "Manhattan 曼哈顿" },
    { value: "mahalanobis", label: "Mahalanobis" },
    { value: "hyperbolic_distance", label: "Hyperbolic 双曲距离" },
    { value: "ai_contextual", label: "AI Contextual" },
  ];
  const MANIFOLDS = [
    { value: "flat", label: "Flat 平坦" },
    { value: "curved", label: "Curved 弯曲" },
    { value: "toroidal", label: "Toroidal 环面" },
    { value: "mobius", label: "Möbius 莫比乌斯" },
    { value: "klein_bottle", label: "Klein Bottle 克莱因瓶" },
    { value: "ai_dynamic", label: "AI Dynamic" },
  ];
  const PATH_STRATEGIES = [
    { value: "shortest_path", label: "Shortest Path 最短路径" },
    { value: "energy_minimizing", label: "Energy Minimizing 能量最小" },
    { value: "curvature_following", label: "Curvature Following 曲率跟随" },
    { value: "gradient_descent", label: "Gradient Descent 梯度下降" },
    { value: "spectral_decomposition", label: "Spectral 谱分解" },
    { value: "ai_optimal", label: "AI Optimal" },
  ];

  const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  const renderResults = () => {
    if (loading) return <div className="flex items-center gap-2 p-4"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm text-muted-foreground">Processing...</span></div>;
    if (!results) return null;
    if (results.error) return <Card className="border-red-500/30"><CardContent className="p-4 text-red-500 text-sm">{results.error}</CardContent></Card>;
    return (
      <Card className="border-emerald-500/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Badge variant="outline" className="text-emerald-500">Layer 39</Badge>Results</CardTitle></CardHeader>
        <CardContent><pre className="text-xs bg-muted/50 p-3 rounded-md overflow-auto max-h-[400px] whitespace-pre-wrap">{JSON.stringify(results, null, 2)}</pre></CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
          <Box className="h-6 w-6 text-violet-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Causal Hyperdimensional Embedding Engine</h1>
          <p className="text-sm text-muted-foreground">因果超维嵌入引擎 — Layer 39 (v1.287)</p>
        </div>
        <Badge variant="secondary" className="ml-auto">6^6 = 46,656 configs</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
          <TabsTrigger value="project">Project</TabsTrigger>
          <TabsTrigger value="transform">Transform</TabsTrigger>
          <TabsTrigger value="measure">Measure</TabsTrigger>
          <TabsTrigger value="navigate">Navigate</TabsTrigger>
          <TabsTrigger value="cluster">Cluster</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle className="text-sm">System Overview</CardTitle><CardDescription>Layer 39 — Causal Hyperdimensional Embedding Engine</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={loadOverview} disabled={loading} size="sm" variant="outline">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Layers className="h-4 w-4 mr-2" />}Load Overview
              </Button>
              {overview && !overview.error && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">Layer</div><div className="text-lg font-bold text-violet-500">39</div></Card>
                    <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">Config Space</div><div className="text-lg font-bold text-indigo-500">46,656</div></Card>
                    <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">Endpoints</div><div className="text-lg font-bold text-emerald-500">7</div></Card>
                  </div>
                  <div className="text-xs space-y-1">
                    <div><strong>Embedding Topologies:</strong> {overview.enums?.EmbeddingTopology287?.join(", ")}</div>
                    <div><strong>Projection Methods:</strong> {overview.enums?.ProjectionMethod287?.join(", ")}</div>
                    <div><strong>Geometric Transforms:</strong> {overview.enums?.GeometricTransform287?.join(", ")}</div>
                    <div><strong>Similarity Metrics:</strong> {overview.enums?.SimilarityMetric287?.join(", ")}</div>
                    <div><strong>Manifold Structures:</strong> {overview.enums?.ManifoldStructure287?.join(", ")}</div>
                    <div><strong>Geodesic Paths:</strong> {overview.enums?.GeodesicPath287?.join(", ")}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <strong>Pipeline:</strong> {overview.pipeline_position}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Embed Tab */}
        <TabsContent value="embed">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Box className="h-4 w-4 text-violet-500" /> Embed — 嵌入超维空间</CardTitle><CardDescription>Embed causal structures into hyperdimensional geometric space</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Topology 拓扑" value={topology} onChange={setTopology} options={TOPOLOGIES} />
                <SelectField label="Method 投影方法" value={projMethod} onChange={setProjMethod} options={PROJ_METHODS} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Dimensions 维度</Label><Input type="number" value={dimensions} onChange={e => setDimensions(+e.target.value)} min={8} max={4096} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Structures 结构数</Label><Input type="number" value={numStructures} onChange={e => setNumStructures(+e.target.value)} min={1} max={50} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Causal Density 因果密度</Label><Input type="number" value={causalDensity} onChange={e => setCausalDensity(+e.target.value)} min={0.1} max={1.0} step={0.1} /></div>
              </div>
              <Button onClick={() => callAPI("/causal-hyperdimensional-embedding/embed", { topology, dimensions, method: projMethod, num_structures: numStructures, causal_density: causalDensity })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Box className="h-4 w-4 mr-2" />}Embed Structures
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Tab */}
        <TabsContent value="project">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4 text-blue-500" /> Project — 降维投影</CardTitle><CardDescription>Project high-dimensional embeddings to lower dimensions</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Method 降维方法" value={projectMethod} onChange={setProjectMethod} options={PROJ_METHODS} />
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Target Dims 目标维度</Label><Input type="number" value={targetDimensions} onChange={e => setTargetDimensions(+e.target.value)} min={2} max={64} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Preserve Variance 方差保留</Label><Input type="number" value={preserveVariance} onChange={e => setPreserveVariance(+e.target.value)} min={0.5} max={1.0} step={0.01} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Num Embeddings 嵌入数</Label><Input type="number" value={numEmbeddings} onChange={e => setNumEmbeddings(+e.target.value)} min={1} max={100} /></div>
              </div>
              <Button onClick={() => callAPI("/causal-hyperdimensional-embedding/project", { method: projectMethod, target_dimensions: targetDimensions, preserve_variance: preserveVariance, num_embeddings: numEmbeddings })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Layers className="h-4 w-4 mr-2" />}Project Embeddings
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transform Tab */}
        <TabsContent value="transform">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><RotateCw className="h-4 w-4 text-amber-500" /> Transform — 几何变换</CardTitle><CardDescription>Apply geometric transformations to embedded structures</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <SelectField label="Transform 变换" value={transform} onChange={setTransform} options={TRANSFORMS} />
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Angle 角度</Label><Input type="number" value={angle} onChange={e => setAngle(+e.target.value)} min={0} max={360} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Scale Factor 缩放</Label><Input type="number" value={scaleFactor} onChange={e => setScaleFactor(+e.target.value)} min={0.1} max={10} step={0.1} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Iterations 迭代</Label><Input type="number" value={iterations} onChange={e => setIterations(+e.target.value)} min={1} max={20} /></div>
              </div>
              <Button onClick={() => callAPI("/causal-hyperdimensional-embedding/transform", { transform, angle, scale_factor: scaleFactor, iterations })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCw className="h-4 w-4 mr-2" />}Apply Transform
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Measure Tab */}
        <TabsContent value="measure">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Ruler className="h-4 w-4 text-emerald-500" /> Measure — 距离测量</CardTitle><CardDescription>Measure distances and similarities between embedded structures</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Metric 度量" value={metric} onChange={setMetric} options={METRICS} />
                <SelectField label="Manifold 流形" value={measureManifold} onChange={setMeasureManifold} options={MANIFOLDS} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Num Pairs 测量对数</Label>
                <Input type="number" value={numPairs} onChange={e => setNumPairs(+e.target.value)} min={1} max={50} />
              </div>
              <Button onClick={() => callAPI("/causal-hyperdimensional-embedding/measure", { metric, num_pairs: numPairs, manifold: measureManifold })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ruler className="h-4 w-4 mr-2" />}Measure Distances
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigate Tab */}
        <TabsContent value="navigate">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Navigation className="h-4 w-4 text-cyan-500" /> Navigate — 测地线导航</CardTitle><CardDescription>Navigate geodesic paths on the hyperdimensional manifold</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Path Strategy 路径策略" value={pathStrategy} onChange={setPathStrategy} options={PATH_STRATEGIES} />
                <SelectField label="Manifold 流形" value={navManifold} onChange={setNavManifold} options={MANIFOLDS} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Waypoints 路径点</Label><Input type="number" value={waypoints} onChange={e => setWaypoints(+e.target.value)} min={2} max={20} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Curvature 曲率</Label><Input type="number" value={curvature} onChange={e => setCurvature(+e.target.value)} min={0} max={2} step={0.1} /></div>
              </div>
              <Button onClick={() => callAPI("/causal-hyperdimensional-embedding/navigate", { path_strategy: pathStrategy, waypoints, manifold: navManifold, curvature })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}Navigate Path
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cluster Tab */}
        <TabsContent value="cluster">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Group className="h-4 w-4 text-rose-500" /> Cluster — 几何聚类</CardTitle><CardDescription>Cluster causal structures by geometric proximity on manifold</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <SelectField label="Manifold 流形" value={clusterManifold} onChange={setClusterManifold} options={MANIFOLDS} />
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Clusters 聚类数</Label><Input type="number" value={numClusters} onChange={e => setNumClusters(+e.target.value)} min={2} max={20} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Threshold 阈值</Label><Input type="number" value={threshold} onChange={e => setThreshold(+e.target.value)} min={0.1} max={1.0} step={0.05} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Points 数据点</Label><Input type="number" value={numPoints} onChange={e => setNumPoints(+e.target.value)} min={5} max={200} /></div>
              </div>
              <Button onClick={() => callAPI("/causal-hyperdimensional-embedding/cluster", { manifold: clusterManifold, num_clusters: numClusters, threshold, num_points: numPoints })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Group className="h-4 w-4 mr-2" />}Cluster Structures
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
