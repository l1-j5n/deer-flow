"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shapes, GitBranch, Mountain, Fingerprint, GitCompare, Layers } from "lucide-react";

const API_BASE = "";

export default function GraphTopologicalAnalysisPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Compute state — 持久同调
  const [simplMethod, setSimplMethod] = useState("vietoris_rips");
  const [homologyDim, setHomologyDim] = useState("h0_components");
  const [maxDimension, setMaxDimension] = useState(3);
  const [numPoints, setNumPoints] = useState(20);
  const [epsilon, setEpsilon] = useState(0.5);

  // Filtration state — 单纯过滤
  const [filtMethod, setFiltMethod] = useState("vietoris_rips");
  const [filtMaxDim, setFiltMaxDim] = useState(3);
  const [numSteps, setNumSteps] = useState(10);
  const [filtNumPoints, setFiltNumPoints] = useState(25);

  // Morse state — Morse理论
  const [morseFeature, setMorseFeature] = useState("critical_point");
  const [morseNumPoints, setMorseNumPoints] = useState(15);
  const [smoothness, setSmoothness] = useState(0.7);
  const [resolution, setResolution] = useState(20);

  // Extract state — 拓扑不变量提取
  const [invariant, setInvariant] = useState("betti_numbers");
  const [extractMaxDim, setExtractMaxDim] = useState(4);
  const [numSamples, setNumSamples] = useState(30);

  // Compare state — 持久图比较
  const [persMetric, setPersMetric] = useState("bottleneck");
  const [numDiagrams, setNumDiagrams] = useState(3);
  const [numFeatures, setNumFeatures] = useState(10);
  const [pOrder, setPOrder] = useState(2.0);

  // Sheaf state — 层论
  const [sheafStruct, setSheafStruct] = useState("locally_constant");
  const [numSections, setNumSections] = useState(8);
  const [numPatches, setNumPatches] = useState(6);
  const [gluingStrength, setGluingStrength] = useState(0.8);

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
      const res = await fetch(`${API_BASE}/graph/causal-topological-analysis/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      setOverview({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const SIMPL_METHODS = [
    { value: "vietoris_rips", label: "Vietoris-Rips" },
    { value: "cech_complex", label: "Čech Complex" },
    { value: "alpha_complex", label: "Alpha Complex" },
    { value: "witness_complex", label: "Witness Complex" },
    { value: "delaunay_complex", label: "Delaunay Complex" },
    { value: "ai_adaptive", label: "AI Adaptive 自适应" },
  ];
  const HOMOLOGY_DIMS = [
    { value: "h0_components", label: "H₀ Connected Components" },
    { value: "h1_loops", label: "H₁ Loops 环" },
    { value: "h2_voids", label: "H₂ Voids 空腔" },
    { value: "h3_spheres", label: "H₃ Spheres 球面" },
    { value: "h4_hypervoids", label: "H₄ Hypervoids 超空腔" },
    { value: "ai_multiscale", label: "AI Multiscale 多尺度" },
  ];
  const MORSE_FEATURES = [
    { value: "critical_point", label: "Critical Points 临界点" },
    { value: "gradient_flow", label: "Gradient Flow 梯度流" },
    { value: "morse_lemma", label: "Morse Lemma Morse引理" },
    { value: "handle_attachment", label: "Handle Attachment 把手附着" },
    { value: "cell_decomposition", label: "Cell Decomposition 胞腔分解" },
    { value: "ai_morse", label: "AI Morse" },
  ];
  const INVARIANTS = [
    { value: "euler_characteristic", label: "Euler Characteristic 欧拉示性数" },
    { value: "betti_numbers", label: "Betti Numbers Betti数" },
    { value: "fundamental_group", label: "Fundamental Group 基本群" },
    { value: "homology_group", label: "Homology Group 同调群" },
    { value: "cohomology_ring", label: "Cohomology Ring 上同调环" },
    { value: "ai_computed", label: "AI Computed" },
  ];
  const PERSISTENCE_METRICS = [
    { value: "bottleneck", label: "Bottleneck 瓶颈" },
    { value: "wasserstein", label: "Wasserstein" },
    { value: "landscape", label: "Landscape 景观" },
    { value: "silhouette", label: "Silhouette 轮廓" },
    { value: "persistence_image", label: "Persistence Image" },
    { value: "ai_learned", label: "AI Learned" },
  ];
  const SHEAF_STRUCTURES = [
    { value: "constant_sheaf", label: "Constant 常数层" },
    { value: "locally_constant", label: "Locally Constant 局部常数" },
    { value: "flabby_sheaf", label: "Flabby 松弛层" },
    { value: "injective_sheaf", label: "Injective 内射层" },
    { value: "soft_sheaf", label: "Soft 柔软层" },
    { value: "ai_dynamic", label: "AI Dynamic" },
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
    if (loading) return <div className="flex items-center gap-2 p-4"><Loader2 className="h-4 w-4 animate-spin" /><span className="text-sm text-muted-foreground">Computing topology...</span></div>;
    if (!results) return null;
    if (results.error) return <Card className="border-red-500/30"><CardContent className="p-4 text-red-500 text-sm">{results.error}</CardContent></Card>;
    return (
      <Card className="border-amber-500/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Badge variant="outline" className="text-amber-500">Layer 40</Badge>Results</CardTitle></CardHeader>
        <CardContent><pre className="text-xs bg-muted/50 p-3 rounded-md overflow-auto max-h-[400px] whitespace-pre-wrap">{JSON.stringify(results, null, 2)}</pre></CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
          <Shapes className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Causal Topological Data Analysis Engine</h1>
          <p className="text-sm text-muted-foreground">因果拓扑数据分析引擎 — Layer 40 (v1.288)</p>
        </div>
        <Badge variant="secondary" className="ml-auto">6^6 = 46,656 configs</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compute">Compute</TabsTrigger>
          <TabsTrigger value="filtration">Filtration</TabsTrigger>
          <TabsTrigger value="morse">Morse</TabsTrigger>
          <TabsTrigger value="extract">Extract</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="sheaf">Sheaf</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle className="text-sm">System Overview</CardTitle><CardDescription>Layer 40 — Causal Topological Data Analysis Engine</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={loadOverview} disabled={loading} size="sm" variant="outline">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Layers className="h-4 w-4 mr-2" />}Load Overview
              </Button>
              {overview && !overview.error && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">Layer</div><div className="text-lg font-bold text-amber-500">40</div></Card>
                    <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">Config Space</div><div className="text-lg font-bold text-orange-500">46,656</div></Card>
                    <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">Endpoints</div><div className="text-lg font-bold text-emerald-500">7</div></Card>
                  </div>
                  <div className="text-xs space-y-1">
                    <div><strong>Simplicial Methods:</strong> {overview.enums?.SimplicialMethod288?.join(", ")}</div>
                    <div><strong>Homology Dimensions:</strong> {overview.enums?.HomologyDimension288?.join(", ")}</div>
                    <div><strong>Persistence Metrics:</strong> {overview.enums?.PersistenceMetric288?.join(", ")}</div>
                    <div><strong>Morse Features:</strong> {overview.enums?.MorseFeature288?.join(", ")}</div>
                    <div><strong>Sheaf Structures:</strong> {overview.enums?.SheafStructure288?.join(", ")}</div>
                    <div><strong>Topological Invariants:</strong> {overview.enums?.TopologicalInvariant288?.join(", ")}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <strong>Pipeline:</strong> {overview.pipeline_position}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compute Tab — Persistent Homology */}
        <TabsContent value="compute">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shapes className="h-4 w-4 text-amber-500" /> Compute — 持久同调计算</CardTitle><CardDescription>Compute persistent homology of embedded causal structures</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Simplicial Method 单纯复形" value={simplMethod} onChange={setSimplMethod} options={SIMPL_METHODS} />
                <SelectField label="Homology Dimension 同调维" value={homologyDim} onChange={setHomologyDim} options={HOMOLOGY_DIMS} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Max Dimension 最大维度</Label><Input type="number" value={maxDimension} onChange={e => setMaxDimension(+e.target.value)} min={1} max={10} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Points 数据点</Label><Input type="number" value={numPoints} onChange={e => setNumPoints(+e.target.value)} min={5} max={100} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Epsilon 阈值</Label><Input type="number" value={epsilon} onChange={e => setEpsilon(+e.target.value)} min={0.01} max={5.0} step={0.05} /></div>
              </div>
              <Button onClick={() => callAPI("/causal-topological-analysis/compute", { method: simplMethod, homology_dim: homologyDim, max_dimension: maxDimension, num_points: numPoints, epsilon })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shapes className="h-4 w-4 mr-2" />}Compute Homology
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filtration Tab */}
        <TabsContent value="filtration">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><GitBranch className="h-4 w-4 text-blue-500" /> Filtration — 单纯过滤</CardTitle><CardDescription>Build simplicial filtration with Betti number evolution</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Method 复形方法" value={filtMethod} onChange={setFiltMethod} options={SIMPL_METHODS} />
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Max Dimension</Label><Input type="number" value={filtMaxDim} onChange={e => setFiltMaxDim(+e.target.value)} min={1} max={10} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Filtration Steps 过滤步数</Label><Input type="number" value={numSteps} onChange={e => setNumSteps(+e.target.value)} min={3} max={30} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Points 数据点</Label><Input type="number" value={filtNumPoints} onChange={e => setFiltNumPoints(+e.target.value)} min={5} max={100} /></div>
              </div>
              <Button onClick={() => callAPI("/causal-topological-analysis/filtration", { method: filtMethod, max_dimension: filtMaxDim, num_steps: numSteps, num_points: filtNumPoints })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitBranch className="h-4 w-4 mr-2" />}Build Filtration
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Morse Tab */}
        <TabsContent value="morse">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mountain className="h-4 w-4 text-emerald-500" /> Morse — Morse理论分析</CardTitle><CardDescription>Morse theory analysis of causal topological landscape</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <SelectField label="Feature 特征" value={morseFeature} onChange={setMorseFeature} options={MORSE_FEATURES} />
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Points 点数</Label><Input type="number" value={morseNumPoints} onChange={e => setMorseNumPoints(+e.target.value)} min={5} max={50} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Smoothness 平滑度</Label><Input type="number" value={smoothness} onChange={e => setSmoothness(+e.target.value)} min={0.1} max={1.0} step={0.1} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Resolution 分辨率</Label><Input type="number" value={resolution} onChange={e => setResolution(+e.target.value)} min={5} max={50} /></div>
              </div>
              <Button onClick={() => callAPI("/causal-topological-analysis/morse", { feature: morseFeature, num_points: morseNumPoints, smoothness, resolution })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mountain className="h-4 w-4 mr-2" />}Analyze Morse
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Extract Tab */}
        <TabsContent value="extract">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Fingerprint className="h-4 w-4 text-violet-500" /> Extract — 拓扑不变量</CardTitle><CardDescription>Extract topological invariants from causal structures</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <SelectField label="Invariant 不变量" value={invariant} onChange={setInvariant} options={INVARIANTS} />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Max Dimension 最大维度</Label><Input type="number" value={extractMaxDim} onChange={e => setExtractMaxDim(+e.target.value)} min={1} max={8} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Samples 采样数</Label><Input type="number" value={numSamples} onChange={e => setNumSamples(+e.target.value)} min={5} max={100} /></div>
              </div>
              <Button onClick={() => callAPI("/causal-topological-analysis/extract", { invariant, max_dimension: extractMaxDim, num_samples: numSamples })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Fingerprint className="h-4 w-4 mr-2" />}Extract Invariants
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><GitCompare className="h-4 w-4 text-cyan-500" /> Compare — 拓扑签名比较</CardTitle><CardDescription>Compare topological signatures using persistence-based metrics</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Metric 度量" value={persMetric} onChange={setPersMetric} options={PERSISTENCE_METRICS} />
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">p-Order p阶</Label><Input type="number" value={pOrder} onChange={e => setPOrder(+e.target.value)} min={1} max={10} step={0.5} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Diagrams 持久图数</Label><Input type="number" value={numDiagrams} onChange={e => setNumDiagrams(+e.target.value)} min={2} max={6} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Features 特征数</Label><Input type="number" value={numFeatures} onChange={e => setNumFeatures(+e.target.value)} min={5} max={50} /></div>
              </div>
              <Button onClick={() => callAPI("/causal-topological-analysis/compare", { metric: persMetric, num_diagrams: numDiagrams, num_features: numFeatures, p_order: pOrder })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitCompare className="h-4 w-4 mr-2" />}Compare Diagrams
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sheaf Tab */}
        <TabsContent value="sheaf">
          <Card>
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4 text-rose-500" /> Sheaf — 层论整合</CardTitle><CardDescription>Sheaf-theoretic local-to-global causal data integration</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <SelectField label="Structure 层结构" value={sheafStruct} onChange={setSheafStruct} options={SHEAF_STRUCTURES} />
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Sections 截面数</Label><Input type="number" value={numSections} onChange={e => setNumSections(+e.target.value)} min={2} max={20} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Patches 开覆盖</Label><Input type="number" value={numPatches} onChange={e => setNumPatches(+e.target.value)} min={2} max={15} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">Gluing 粘合强度</Label><Input type="number" value={gluingStrength} onChange={e => setGluingStrength(+e.target.value)} min={0.1} max={1.0} step={0.05} /></div>
              </div>
              <Button onClick={() => callAPI("/causal-topological-analysis/sheaf", { structure: sheafStruct, num_sections: numSections, num_patches: numPatches, gluing_strength: gluingStrength })} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Layers className="h-4 w-4 mr-2" />}Integrate Sheaf
              </Button>
              {renderResults()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
