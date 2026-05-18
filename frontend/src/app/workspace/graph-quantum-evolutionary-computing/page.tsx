"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

interface OverviewData {
  layer: number; version: string; engine: string; description: string;
  enums: Record<string, string[]>; enum_count: number;
  endpoints: { method: string; path: string; desc: string }[];
  endpoint_count: number; config_space: number; cache_stats: Record<string, number>;
}

const GA_TYPES = [
  { value: "standard_ga", label: "Standard" },
  { value: "steady_state_ga", label: "Steady" },
  { value: "cellular_ga", label: "Cellular" },
  { value: "island_model_ga", label: "Island" },
  { value: "messy_ga", label: "Messy" },
  { value: "ai_adaptive_ga", label: "AI" },
];

const GP_TYPES = [
  { value: "tree_gp", label: "Tree" },
  { value: "linear_gp", label: "Linear" },
  { value: "cartesian_gp", label: "Cartesian" },
  { value: "stack_gp", label: "Stack" },
  { value: "grammar_gp", label: "Grammar" },
  { value: "ai_neural_programming", label: "AI" },
];

const ES_TYPES = [
  { value: "es_one_plus_one", label: "(1+1)" },
  { value: "es_mu_plus_lambda", label: "(μ+λ)" },
  { value: "es_mu_comma_lambda", label: "(μ,λ)" },
  { value: "cma_es", label: "CMA-ES" },
  { value: "natural_es", label: "Natural" },
  { value: "ai_meta_es", label: "AI" },
];

const DE_TYPES = [
  { value: "de_rand", label: "Rand" },
  { value: "de_best", label: "Best" },
  { value: "de_target_to_best", label: "Target" },
  { value: "de_adaptive", label: "Adaptive" },
  { value: "de_opposition", label: "Opposition" },
  { value: "ai_hybrid_de", label: "AI" },
];

const MA_TYPES = [
  { value: "lamarkian", label: "Lamarckian" },
  { value: "baldwinian", label: "Baldwinian" },
  { value: "hybrid_local", label: "Hybrid" },
  { value: "multi_meme", label: "Multi-Meme" },
  { value: "self_adaptive_meme", label: "Self-Adapt" },
  { value: "ai_meme_selector", label: "AI" },
];

const NE_TYPES = [
  { value: "neat", label: "NEAT" },
  { value: "hyperneat", label: "HyperNEAT" },
  { value: "neuroevolution_aug", label: "Augmented" },
  { value: "coevolution_nn", label: "Coevo-NN" },
  { value: "evolving_transformers", label: "Evo-Trans" },
  { value: "ai_architecture_search", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumEvolutionaryComputingEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [gaType, setGaType] = useState("standard_ga");
  const [gaPop, setGaPop] = useState("200");
  const [gaChrom, setGaChrom] = useState("100");
  const [gpType, setGpType] = useState("tree_gp");
  const [gpDepth, setGpDepth] = useState("17");
  const [gpFuncs, setGpFuncs] = useState("20");
  const [esType, setEsType] = useState("cma_es");
  const [esDim, setEsDim] = useState("50");
  const [esSigma, setEsSigma] = useState("0.5");
  const [deType, setDeType] = useState("de_rand");
  const [dePop, setDePop] = useState("100");
  const [deCR, setDeCR] = useState("0.9");
  const [maType, setMaType] = useState("lamarkian");
  const [maIter, setMaIter] = useState("50");
  const [maMemes, setMaMemes] = useState("5");
  const [neType, setNeType] = useState("neat");
  const [neIn, setNeIn] = useState("784");
  const [neOut, setNeOut] = useState("10");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-evolutionary-computing/overview`); const data = await res.json(); setOverview(data); setResult(data); }
    catch (e) { setResult({ error: String(e) }); } finally { setLoading(false); }
  }
  async function postEndpoint(path: string, params: Record<string, string>) {
    setLoading(true); setResult(null);
    try { const qs = new URLSearchParams(params).toString(); const res = await fetch(`${API_BASE}${path}?${qs}`, { method: "POST" }); setResult(await res.json()); }
    catch (e) { setResult({ error: String(e) }); } finally { setLoading(false); }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quantum Evolutionary Computing Engine</h1>
          <p className="text-muted-foreground">Layer 116 — 遗传算法 / 遗传编程 / 进化策略 / 差分进化 / 模因算法 / 神经进化</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.364.0</Badge>
          <Badge variant="secondary">Layer 116</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="ga">遗传算法</TabsTrigger>
<TabsTrigger value="gp">遗传编程</TabsTrigger>
<TabsTrigger value="es">进化策略</TabsTrigger>
<TabsTrigger value="de">差分进化</TabsTrigger>
<TabsTrigger value="ma">模因算法</TabsTrigger>
<TabsTrigger value="ne">神经进化</TabsTrigger>

        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Evolutionary Computing Engine 概览</CardTitle><CardDescription>Layer 116 — 遗传算法 / 遗传编程 / 进化策略 / 差分进化 / 模因算法 / 神经进化 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={fetchOverview} disabled={loading}>{loading ? "加载中..." : "获取概览"}</Button>
            {overview && (<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <Card><CardHeader className="pb-2"><CardDescription>枚举数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.enum_count}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>端点数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.endpoint_count}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>配置空间</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.config_space.toLocaleString()}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>缓存命中</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{Object.values(overview.cache_stats).reduce((a: number, b: number) => a + b, 0)}</div></CardContent></Card>
            </div>)}
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="ga">
          <Card><CardHeader><CardTitle>遗传算法 (Genetic Algorithm)</CardTitle><CardDescription>Standard/Steady/Cellular/Island/Messy</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={gaType} onValueChange={setGaType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GA_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>种群数</Label><Input type="number" value={gaPop} onChange={(e) => setGaPop(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>染色体长度</Label><Input type="number" value={gaChrom} onChange={(e) => setGaChrom(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-evolutionary-computing/genetic-algorithm", {ga_type: gaType, population_size: gaPop, chromosome_length: gaChrom})} disabled={loading}>{loading ? "计算中..." : "GA分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="gp">
          <Card><CardHeader><CardTitle>遗传编程 (Genetic Programming)</CardTitle><CardDescription>Tree/Linear/Cartesian/Stack/Grammar</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={gpType} onValueChange={setGpType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>最大深度</Label><Input type="number" value={gpDepth} onChange={(e) => setGpDepth(e.target.value)} min={3} /></div>
<div className="space-y-2"><Label>函数集数</Label><Input type="number" value={gpFuncs} onChange={(e) => setGpFuncs(e.target.value)} min={5} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-evolutionary-computing/genetic-programming", {gp_type: gpType, max_depth: gpDepth, num_functions: gpFuncs})} disabled={loading}>{loading ? "计算中..." : "GP分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="es">
          <Card><CardHeader><CardTitle>进化策略 (Evolution Strategy)</CardTitle><CardDescription>(1+1)/(μ+λ)/(μ,λ)/CMA-ES/Natural</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={esType} onValueChange={setEsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ES_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>搜索维度</Label><Input type="number" value={esDim} onChange={(e) => setEsDim(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>Sigma</Label><Input type="number" value={esSigma} onChange={(e) => setEsSigma(e.target.value)} step={0.05} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-evolutionary-computing/evolution-strategy", {es_type: esType, search_dim: esDim, sigma: esSigma})} disabled={loading}>{loading ? "计算中..." : "ES分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="de">
          <Card><CardHeader><CardTitle>差分进化 (Differential Evolution)</CardTitle><CardDescription>Rand/Best/Target/Adaptive/Opposition</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={deType} onValueChange={setDeType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>种群数</Label><Input type="number" value={dePop} onChange={(e) => setDePop(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>交叉率</Label><Input type="number" value={deCR} onChange={(e) => setDeCR(e.target.value)} step={0.05} min={0} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-evolutionary-computing/differential-evolution", {de_type: deType, pop_size: dePop, crossover_rate: deCR})} disabled={loading}>{loading ? "计算中..." : "DE分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ma">
          <Card><CardHeader><CardTitle>模因算法 (Memetic Algorithm)</CardTitle><CardDescription>Lamarckian/Baldwinian/Hybrid/Multi-Meme/Self-Adapt</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={maType} onValueChange={setMaType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MA_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>局部搜索迭代</Label><Input type="number" value={maIter} onChange={(e) => setMaIter(e.target.value)} min={5} /></div>
<div className="space-y-2"><Label>模因数</Label><Input type="number" value={maMemes} onChange={(e) => setMaMemes(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-evolutionary-computing/memetic-algorithm", {meme_type: maType, local_search_iters: maIter, meme_count: maMemes})} disabled={loading}>{loading ? "计算中..." : "模因分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ne">
          <Card><CardHeader><CardTitle>神经进化 (Neuroevolution)</CardTitle><CardDescription>NEAT/HyperNEAT/Augmented/Coevo-NN/Evo-Trans</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={neType} onValueChange={setNeType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{NE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>输入维度</Label><Input type="number" value={neIn} onChange={(e) => setNeIn(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>输出维度</Label><Input type="number" value={neOut} onChange={(e) => setNeOut(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-evolutionary-computing/neuroevolution", {neuro_type: neType, input_dim: neIn, output_dim: neOut})} disabled={loading}>{loading ? "计算中..." : "神经进化分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
