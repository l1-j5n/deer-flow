"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Waves, PieChart, BarChart3, GitCompare, Filter } from "lucide-react";

const API_BASE = "";

export default function GraphSpectralAnalysisPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Spectrum state — 谱分解
  const [laplacian, setLaplacian] = useState("normalized");
  const [decomposition, setDecomposition] = useState("truncated_top");
  const [specNodes, setSpecNodes] = useState(20);
  const [numEigenvalues, setNumEigenvalues] = useState(10);
  const [edgeDensity, setEdgeDensity] = useState(0.3);

  // Transform state — 图变换
  const [transform, setTransform] = useState("fourier");
  const [freqBand, setFreqBand] = useState("broadband");
  const [transNodes, setTransNodes] = useState(20);
  const [resolution, setResolution] = useState(30);
  const [scale, setScale] = useState(1.0);

  // Partition state — 谱聚类
  const [clusterMethod, setClusterMethod] = useState("kway_ncut");
  const [numClusters, setNumClusters] = useState(4);
  const [partNodes, setPartNodes] = useState(30);
  const [embeddingDim, setEmbeddingDim] = useState(3);

  // Analyze state — 特征提取
  const [spectralFeature, setSpectralFeature] = useState("spectral_gap");
  const [analyzeNodes, setAnalyzeNodes] = useState(20);
  const [analyzeSamples, setAnalyzeSamples] = useState(15);

  // Compare state — 谱比较
  const [compareMetric, setCompareMetric] = useState("energy_distribution");
  const [numGraphs, setNumGraphs] = useState(3);
  const [compareNodes, setCompareNodes] = useState(20);
  const [perturbation, setPerturbation] = useState(0.1);

  // Filter state — 谱滤波
  const [filterBand, setFilterBand] = useState("low_frequency");
  const [filterTransform, setFilterTransform] = useState("fourier");
  const [filterNodes, setFilterNodes] = useState(20);
  const [cutoffFreq, setCutoffFreq] = useState(0.5);
  const [attenuation, setAttenuation] = useState(0.8);

  const callAPI = async (op: string, body: any) => {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/api/langgraph/graph/causal-spectral-analysis/${op}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(data);
    } catch (e: any) {
      setResults({ error: e.message });
    }
    setLoading(false);
  };

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/langgraph/graph/causal-spectral-analysis/overview`);
      const data = await res.json();
      setOverview(data);
    } catch {}
  };

  React.useEffect(() => { fetchOverview(); }, []);

  const renderOverview = () => (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Causal Spectral Graph Theory Engine</CardTitle>
      <CardDescription>因果谱图理论与特征值分析引擎 — Layer 41</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {overview ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950"><div className="text-2xl font-bold text-blue-600">{overview.configuration_space?.toLocaleString()}</div><div className="text-xs text-muted-foreground">Configuration Space</div></div>
              <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950"><div className="text-2xl font-bold text-emerald-600">{Object.keys(overview.enums || {}).length}</div><div className="text-xs text-muted-foreground">Enum Types (6×6=36)</div></div>
              <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950"><div className="text-2xl font-bold text-purple-600">{overview.endpoints?.length || 0}</div><div className="text-xs text-muted-foreground">API Endpoints</div></div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Enums</h4>
              {Object.entries(overview.enums || {}).map(([name, vals]: any) => (
                <div key={name} className="flex flex-wrap gap-1"><span className="font-mono text-xs text-muted-foreground mr-2">{name}:</span>{(vals as string[]).map(v => <Badge key={v} variant="outline" className="text-xs">{v}</Badge>)}</div>
              ))}
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">Endpoints</h4>
              {overview.endpoints?.map((ep: string) => <div key={ep} className="font-mono text-xs text-muted-foreground">{ep}</div>)}
            </div>
            <div className="text-xs text-muted-foreground">Pipeline: {overview.pipeline_position}</div>
          </>
        ) : <div className="text-sm text-muted-foreground">Loading overview...</div>}
      </CardContent>
    </Card>
  );

  const selectField = (label: string, value: string, setter: (v: string) => void, options: { value: string; label: string }[]) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={setter}>
        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>{options.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  const inputField = (label: string, value: number, setter: (v: number) => void, min: number, max: number, step = 1) => (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input type="number" value={value} onChange={e => setter(Number(e.target.value))} min={min} max={max} step={step} className="h-8 text-xs" />
    </div>
  );

  const resultPanel = () => {
    if (loading) return <div className="flex items-center gap-2 p-4"><Loader2 className="h-4 w-4 animate-spin" /> Computing...</div>;
    if (!results) return null;
    if (results.error) return <Card className="border-red-300"><CardContent className="p-4 text-red-500 text-sm">{results.error}</CardContent></Card>;
    return <Card><CardHeader><CardTitle className="text-sm">Results (Layer {results.layer})</CardTitle></CardHeader>
      <CardContent><pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-[500px]">{JSON.stringify(results.data || results, null, 2)}</pre></CardContent></Card>;
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-blue-500" />
        <h1 className="text-xl font-bold">Causal Spectral Graph Theory Engine</h1>
        <Badge variant="secondary">v1.289 · Layer 41</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spectrum"><Waves className="h-3 w-3 mr-1" />Spectrum</TabsTrigger>
          <TabsTrigger value="transform"><Activity className="h-3 w-3 mr-1" />Transform</TabsTrigger>
          <TabsTrigger value="partition"><PieChart className="h-3 w-3 mr-1" />Partition</TabsTrigger>
          <TabsTrigger value="analyze"><BarChart3 className="h-3 w-3 mr-1" />Analyze</TabsTrigger>
          <TabsTrigger value="compare"><GitCompare className="h-3 w-3 mr-1" />Compare</TabsTrigger>
          <TabsTrigger value="filter"><Filter className="h-3 w-3 mr-1" />Filter</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverview()}</TabsContent>

        <TabsContent value="spectrum">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Waves className="h-4 w-4" /> Laplacian Spectrum / Eigenvalue Decomposition</CardTitle>
            <CardDescription>Compute eigenvalues and eigenvectors of the graph Laplacian</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectField("Laplacian Type", laplacian, setLaplacian, [
                  { value: "combinatorial", label: "Combinatorial" }, { value: "normalized", label: "Normalized" },
                  { value: "random_walk", label: "Random Walk" }, { value: "symmetric", label: "Symmetric" },
                  { value: "lovasz", label: "Lovász" }, { value: "ai_spectral", label: "AI Spectral" },
                ])}
                {selectField("Decomposition", decomposition, setDecomposition, [
                  { value: "full_spectrum", label: "Full Spectrum" }, { value: "truncated_top", label: "Truncated Top" },
                  { value: "truncated_bottom", label: "Truncated Bottom" }, { value: "lanczos", label: "Lanczos" },
                  { value: "power_iteration", label: "Power Iteration" }, { value: "ai_adaptive", label: "AI Adaptive" },
                ])}
                {inputField("Nodes", specNodes, setSpecNodes, 5, 100)}
                {inputField("Eigenvalues", numEigenvalues, setNumEigenvalues, 2, 50)}
                {inputField("Edge Density", edgeDensity, setEdgeDensity, 0.05, 1.0, 0.05)}
              </div>
              <Button onClick={() => callAPI("spectrum", { laplacian, decomposition, num_nodes: specNodes, num_eigenvalues: numEigenvalues, edge_density: edgeDensity })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Waves className="h-4 w-4 mr-1" />} Compute Spectrum
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>

        <TabsContent value="transform">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Graph Fourier / Wavelet Transform</CardTitle>
            <CardDescription>Frequency domain analysis of causal signals on graph</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectField("Transform", transform, setTransform, [
                  { value: "fourier", label: "Fourier" }, { value: "wavelet", label: "Wavelet" },
                  { value: "gabor", label: "Gabor" }, { value: "short_time_fourier", label: "Short-Time FT" },
                  { value: "scattering", label: "Scattering" }, { value: "ai_multiresolution", label: "AI Multi-res" },
                ])}
                {selectField("Frequency Band", freqBand, setFreqBand, [
                  { value: "low_frequency", label: "Low Freq" }, { value: "mid_frequency", label: "Mid Freq" },
                  { value: "high_frequency", label: "High Freq" }, { value: "broadband", label: "Broadband" },
                  { value: "narrowband", label: "Narrowband" }, { value: "ai_resonant", label: "AI Resonant" },
                ])}
                {inputField("Nodes", transNodes, setTransNodes, 5, 80)}
                {inputField("Resolution", resolution, setResolution, 5, 100)}
                {inputField("Scale", scale, setScale, 0.1, 10.0, 0.1)}
              </div>
              <Button onClick={() => callAPI("transform", { transform, frequency_band: freqBand, num_nodes: transNodes, resolution, scale })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Activity className="h-4 w-4 mr-1" />} Transform
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>

        <TabsContent value="partition">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><PieChart className="h-4 w-4" /> Spectral Clustering</CardTitle>
            <CardDescription>Community detection via spectral embedding and eigenvalue gaps</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectField("Method", clusterMethod, setClusterMethod, [
                  { value: "kway_ncut", label: "K-way NCut" }, { value: "spectral_embedding", label: "Spectral Embed" },
                  { value: "eigen_gaps", label: "Eigen Gaps" }, { value: "modularity_max", label: "Modularity Max" },
                  { value: "perturbation", label: "Perturbation" }, { value: "ai_auto_cluster", label: "AI Auto" },
                ])}
                {inputField("Clusters", numClusters, setNumClusters, 2, 10)}
                {inputField("Nodes", partNodes, setPartNodes, 5, 100)}
                {inputField("Embed Dim", embeddingDim, setEmbeddingDim, 2, 10)}
              </div>
              <Button onClick={() => callAPI("partition", { method: clusterMethod, num_clusters: numClusters, num_nodes: partNodes, embedding_dim: embeddingDim })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <PieChart className="h-4 w-4 mr-1" />} Partition
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>

        <TabsContent value="analyze">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Spectral Feature Analysis</CardTitle>
            <CardDescription>Extract spectral gap, connectivity, energy distribution, Cheeger constant</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectField("Feature", spectralFeature, setSpectralFeature, [
                  { value: "spectral_gap", label: "Spectral Gap" }, { value: "algebraic_connectivity", label: "Algebraic Connectivity" },
                  { value: "energy_distribution", label: "Energy Dist" }, { value: "mixing_time", label: "Mixing Time" },
                  { value: "cheeger_constant", label: "Cheeger Const" }, { value: "ai_signature", label: "AI Signature" },
                ])}
                {inputField("Nodes", analyzeNodes, setAnalyzeNodes, 5, 80)}
                {inputField("Samples", analyzeSamples, setAnalyzeSamples, 5, 50)}
              </div>
              <Button onClick={() => callAPI("analyze", { feature: spectralFeature, num_nodes: analyzeNodes, num_samples: analyzeSamples })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <BarChart3 className="h-4 w-4 mr-1" />} Analyze
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><GitCompare className="h-4 w-4" /> Spectral Comparison</CardTitle>
            <CardDescription>Distance and similarity metrics between graph spectra</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectField("Metric", compareMetric, setCompareMetric, [
                  { value: "spectral_gap", label: "Spectral Gap" }, { value: "algebraic_connectivity", label: "Algebraic Conn" },
                  { value: "energy_distribution", label: "Energy Dist" }, { value: "mixing_time", label: "Mixing Time" },
                  { value: "cheeger_constant", label: "Cheeger" }, { value: "ai_signature", label: "AI Signature" },
                ])}
                {inputField("Graphs", numGraphs, setNumGraphs, 2, 6)}
                {inputField("Nodes", compareNodes, setCompareNodes, 5, 50)}
                {inputField("Perturbation", perturbation, setPerturbation, 0.01, 1.0, 0.01)}
              </div>
              <Button onClick={() => callAPI("compare", { metric: compareMetric, num_graphs: numGraphs, num_nodes: compareNodes, perturbation_strength: perturbation })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <GitCompare className="h-4 w-4 mr-1" />} Compare
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>

        <TabsContent value="filter">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Filter className="h-4 w-4" /> Spectral Filtering</CardTitle>
            <CardDescription>Low-pass, high-pass, band-pass filtering of causal signals</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectField("Band", filterBand, setFilterBand, [
                  { value: "low_frequency", label: "Low Pass" }, { value: "high_frequency", label: "High Pass" },
                  { value: "mid_frequency", label: "Band Pass" }, { value: "broadband", label: "Broadband" },
                  { value: "narrowband", label: "Narrowband" }, { value: "ai_resonant", label: "AI Resonant" },
                ])}
                {selectField("Transform", filterTransform, setFilterTransform, [
                  { value: "fourier", label: "Fourier" }, { value: "wavelet", label: "Wavelet" },
                  { value: "gabor", label: "Gabor" }, { value: "short_time_fourier", label: "STFT" },
                  { value: "scattering", label: "Scattering" }, { value: "ai_multiresolution", label: "AI Multi-res" },
                ])}
                {inputField("Nodes", filterNodes, setFilterNodes, 5, 80)}
                {inputField("Cutoff Freq", cutoffFreq, setCutoffFreq, 0.01, 1.0, 0.01)}
                {inputField("Attenuation", attenuation, setAttenuation, 0.1, 1.0, 0.05)}
              </div>
              <Button onClick={() => callAPI("filter", { band: filterBand, transform: filterTransform, num_nodes: filterNodes, cutoff_frequency: cutoffFreq, attenuation })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Filter className="h-4 w-4 mr-1" />} Filter
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
