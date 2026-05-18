"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Triangle, Grid3X3, Waves, RefreshCw, TrendingDown, Clock } from "lucide-react";

const API_BASE = "";

export default function GraphFractalDimensionPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Hausdorff state — 分形维数
  const [fractalType, setFractalType] = useState("self_similar");
  const [estimator, setEstimator] = useState("capacity");
  const [numScales, setNumScales] = useState(12);
  const [numPoints, setNumPoints] = useState(30);
  const [embeddingDim, setEmbeddingDim] = useState(3);

  // BoxCount state — 盒计数
  const [coverage, setCoverage] = useState("standard");
  const [minRes, setMinRes] = useState(4);
  const [maxRes, setMaxRes] = useState(64);
  const [bcPoints, setBcPoints] = useState(40);

  // Multifractal state — 多重分形谱
  const [mfMethod, setMfMethod] = useState("moment_method");
  const [numMoments, setNumMoments] = useState(10);
  const [mfPoints, setMfPoints] = useState(30);
  const [qRange, setQRange] = useState(5.0);

  // Renormalize state — 重正化群
  const [flowType, setFlowType] = useState("isotropic");
  const [numIter, setNumIter] = useState(10);
  const [numParams, setNumParams] = useState(4);
  const [coupling, setCoupling] = useState(0.5);

  // PowerLaw state — 幂律检测
  const [distribution, setDistribution] = useState("degree_distribution");
  const [fitMethod, setFitMethod] = useState("mle");
  const [numSamples, setNumSamples] = useState(50);
  const [xMin, setXMin] = useState(1.0);

  // FractalTime state — 分形时间序列
  const [decomposition, setDecomposition] = useState("wavelet");
  const [seriesLength, setSeriesLength] = useState(100);
  const [ftScales, setFtScales] = useState(8);
  const [hurstInit, setHurstInit] = useState(0.5);

  const callAPI = async (op: string, body: any) => {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/api/langgraph/graph/causal-fractal-dimension/${op}`, {
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
      const res = await fetch(`${API_BASE}/api/langgraph/graph/causal-fractal-dimension/overview`);
      const data = await res.json();
      setOverview(data);
    } catch {}
  };

  React.useEffect(() => { fetchOverview(); }, []);

  const renderOverview = () => (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Triangle className="h-5 w-5" /> Causal Fractal Dimension Engine</CardTitle>
      <CardDescription>因果分形维数与自相似性分析引擎 — Layer 42</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {overview ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950"><div className="text-2xl font-bold text-amber-600">{overview.configuration_space?.toLocaleString()}</div><div className="text-xs text-muted-foreground">Configuration Space</div></div>
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
        <Triangle className="h-6 w-6 text-amber-500" />
        <h1 className="text-xl font-bold">Causal Fractal Dimension Engine</h1>
        <Badge variant="secondary">v1.290 · Layer 42</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hausdorff"><Triangle className="h-3 w-3 mr-1" />Hausdorff</TabsTrigger>
          <TabsTrigger value="boxcount"><Grid3X3 className="h-3 w-3 mr-1" />BoxCount</TabsTrigger>
          <TabsTrigger value="multifractal"><Waves className="h-3 w-3 mr-1" />Multifractal</TabsTrigger>
          <TabsTrigger value="renormalize"><RefreshCw className="h-3 w-3 mr-1" />Renormalize</TabsTrigger>
          <TabsTrigger value="powerlaw"><TrendingDown className="h-3 w-3 mr-1" />PowerLaw</TabsTrigger>
          <TabsTrigger value="fractal-time"><Clock className="h-3 w-3 mr-1" />FractalTime</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">{renderOverview()}</TabsContent>

        <TabsContent value="hausdorff">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Triangle className="h-4 w-4" /> Hausdorff Dimension Estimation</CardTitle>
            <CardDescription>Estimate fractal dimensions of causal graph structures</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectField("Fractal Type", fractalType, setFractalType, [
                  { value: "self_similar", label: "Self-Similar" }, { value: "self_affine", label: "Self-Affine" },
                  { value: "random_fractal", label: "Random" }, { value: "deterministic", label: "Deterministic" },
                  { value: "multifractal_type", label: "Multifractal" }, { value: "ai_learned", label: "AI Learned" },
                ])}
                {selectField("Estimator", estimator, setEstimator, [
                  { value: "capacity", label: "Capacity" }, { value: "correlation", label: "Correlation" },
                  { value: "information", label: "Information" }, { value: "lyapunov", label: "Lyapunov" },
                  { value: "hausdorff_exact", label: "Hausdorff Exact" }, { value: "ai_adaptive", label: "AI Adaptive" },
                ])}
                {inputField("Scales", numScales, setNumScales, 5, 30)}
                {inputField("Points", numPoints, setNumPoints, 5, 100)}
                {inputField("Embed Dim", embeddingDim, setEmbeddingDim, 2, 10)}
              </div>
              <Button onClick={() => callAPI("hausdorff", { fractal_type: fractalType, estimator, num_scales: numScales, num_points: numPoints, embedding_dim: embeddingDim })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Triangle className="h-4 w-4 mr-1" />} Compute Hausdorff
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>

        <TabsContent value="boxcount">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Grid3X3 className="h-4 w-4" /> Box-Counting Dimension</CardTitle>
            <CardDescription>Multi-resolution grid analysis with log-log regression</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectField("Coverage", coverage, setCoverage, [
                  { value: "standard", label: "Standard" }, { value: "sliding", label: "Sliding" },
                  { value: "adaptive", label: "Adaptive" }, { value: "weighted", label: "Weighted" },
                  { value: "hierarchical", label: "Hierarchical" }, { value: "ai_optimized", label: "AI Optimized" },
                ])}
                {inputField("Min Res", minRes, setMinRes, 2, 10)}
                {inputField("Max Res", maxRes, setMaxRes, 16, 256)}
                {inputField("Points", bcPoints, setBcPoints, 10, 100)}
              </div>
              <Button onClick={() => callAPI("boxcount", { coverage, min_resolution: minRes, max_resolution: maxRes, num_points: bcPoints })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Grid3X3 className="h-4 w-4 mr-1" />} Box Count
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>

        <TabsContent value="multifractal">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Waves className="h-4 w-4" /> Multifractal Spectrum</CardTitle>
            <CardDescription>Singularity strength α and f(α) curve analysis</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectField("Method", mfMethod, setMfMethod, [
                  { value: "moment_method", label: "Moment" }, { value: "legendre_transform", label: "Legendre" },
                  { value: "direct_determination", label: "Direct" }, { value: "wavelet_leader", label: "Wavelet Leader" },
                  { value: "cumulant", label: "Cumulant" }, { value: "ai_moments", label: "AI Moments" },
                ])}
                {inputField("Moments", numMoments, setNumMoments, 4, 20)}
                {inputField("Points", mfPoints, setMfPoints, 10, 80)}
                {inputField("Q Range", qRange, setQRange, 1.0, 10.0, 0.5)}
              </div>
              <Button onClick={() => callAPI("multifractal", { method: mfMethod, num_moments: numMoments, num_points: mfPoints, q_range: qRange })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Waves className="h-4 w-4 mr-1" />} Compute Spectrum
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>

        <TabsContent value="renormalize">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Renormalization Group Flow</CardTitle>
            <CardDescription>Scale-invariant causal pattern detection via RG transformations</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectField("Flow Type", flowType, setFlowType, [
                  { value: "isotropic", label: "Isotropic" }, { value: "anisotropic", label: "Anisotropic" },
                  { value: "correlated", label: "Correlated" }, { value: "momentum_space", label: "Momentum Space" },
                  { value: "real_space", label: "Real Space" }, { value: "ai_flowing", label: "AI Flowing" },
                ])}
                {inputField("Iterations", numIter, setNumIter, 3, 30)}
                {inputField("Parameters", numParams, setNumParams, 2, 8)}
                {inputField("Coupling", coupling, setCoupling, 0.1, 2.0, 0.1)}
              </div>
              <Button onClick={() => callAPI("renormalize", { flow_type: flowType, num_iterations: numIter, num_params: numParams, coupling_strength: coupling })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />} Renormalize
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>

        <TabsContent value="powerlaw">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingDown className="h-4 w-4" /> Power-Law Detection</CardTitle>
            <CardDescription>Detect and fit power-law distributions in causal event cascades</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectField("Distribution", distribution, setDistribution, [
                  { value: "degree_distribution", label: "Degree" }, { value: "cascade_size", label: "Cascade" },
                  { value: "waiting_time", label: "Wait Time" }, { value: "event_magnitude", label: "Magnitude" },
                  { value: "path_length", label: "Path Length" }, { value: "ai_detected", label: "AI Detected" },
                ])}
                {selectField("Fitting", fitMethod, setFitMethod, [
                  { value: "mle", label: "MLE" }, { value: "cls", label: "CLS" },
                  { value: "hill_estimator", label: "Hill" }, { value: "kde", label: "KDE" },
                  { value: "bayesian", label: "Bayesian" }, { value: "ai_fit", label: "AI Fit" },
                ])}
                {inputField("Samples", numSamples, setNumSamples, 10, 200)}
                {inputField("X Min", xMin, setXMin, 0.1, 10.0, 0.1)}
              </div>
              <Button onClick={() => callAPI("powerlaw", { distribution, fitting_method: fitMethod, num_samples: numSamples, x_min: xMin })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />} Detect Power-Law
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>

        <TabsContent value="fractal-time">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Fractal Time Series</CardTitle>
            <CardDescription>Hurst exponent estimation and long-range dependence analysis</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectField("Decomposition", decomposition, setDecomposition, [
                  { value: "wavelet", label: "Wavelet" }, { value: "empirical_mode", label: "EMD" },
                  { value: "singular_spectrum", label: "SSA" }, { value: "fourier_band", label: "Fourier Band" },
                  { value: "rescaled_range", label: "R/S" }, { value: "ai_decompose", label: "AI Decompose" },
                ])}
                {inputField("Series Length", seriesLength, setSeriesLength, 20, 500)}
                {inputField("Scales", ftScales, setFtScales, 3, 15)}
                {inputField("Hurst Init", hurstInit, setHurstInit, 0.1, 0.9, 0.05)}
              </div>
              <Button onClick={() => callAPI("fractal-time", { decomposition, series_length: seriesLength, num_scales: ftScales, hurst_init: hurstInit })} disabled={loading} size="sm">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Clock className="h-4 w-4 mr-1" />} Decompose
              </Button>
            </CardContent>
          </Card>
          {resultPanel()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
