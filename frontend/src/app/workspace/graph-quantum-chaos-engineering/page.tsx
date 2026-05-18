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

const CC_TYPES = [
  { value: "ogc_control", label: "OGC" },
  { value: "pyragas_control", label: "Pyragas" },
  { value: "feedback_linearization", label: "Feedback" },
  { value: "sliding_mode_control", label: "Sliding" },
  { value: "adaptive_chaos_control", label: "Adaptive" },
  { value: "ai_chaos_control", label: "AI" },
];

const FC_TYPES = [
  { value: "mandelbrot_set", label: "Mandelbrot" },
  { value: "julia_set", label: "Julia" },
  { value: "sierpinski_fractal", label: "Sierpinski" },
  { value: "l_system", label: "L-System" },
  { value: "fractal_dimension", label: "Fractal Dim" },
  { value: "ai_fractal_gen", label: "AI" },
];

const ND_TYPES = [
  { value: "van_der_pol", label: "Van der Pol" },
  { value: "lorenz_system", label: "Lorenz" },
  { value: "rossler_system", label: "Rossler" },
  { value: "duffing_oscillator", label: "Duffing" },
  { value: "henon_map", label: "Henon" },
  { value: "ai_nonlinear_ident", label: "AI" },
];

const BA_TYPES = [
  { value: "saddle_node", label: "Saddle-Node" },
  { value: "transcritical", label: "Transcritical" },
  { value: "pitchfork", label: "Pitchfork" },
  { value: "hopf_bifurcation", label: "Hopf" },
  { value: "period_doubling", label: "Period-2" },
  { value: "ai_bifurcation_detect", label: "AI" },
];

const AR_TYPES = [
  { value: "takens_embedding", label: "Takens" },
  { value: "lyapunov_spectrum", label: "Lyapunov" },
  { value: "recurrence_plot", label: "Recurrence" },
  { value: "poincare_section", label: "Poincare" },
  { value: "strange_attractor", label: "Strange" },
  { value: "ai_attractor_classify", label: "AI" },
];

const CA_TYPES = [
  { value: "cellular_automata", label: "CA" },
  { value: "boolean_network", label: "Boolean" },
  { value: "kuramoto_model", label: "Kuramoto" },
  { value: "ising_model", label: "Ising" },
  { value: "percolation_model", label: "Percolation" },
  { value: "ai_cas_simulator", label: "AI" },
];

function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumChaosEngineeringEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [ccType, setCcType] = useState("ogc_control");
  const [ccGain, setCcGain] = useState("1.0");
  const [ccDim, setCcDim] = useState("3");
  const [fcType, setFcType] = useState("mandelbrot_set");
  const [fcRes, setFcRes] = useState("1024");
  const [fcIter, setFcIter] = useState("1000");
  const [ndType, setNdType] = useState("lorenz_system");
  const [ndSteps, setNdSteps] = useState("10000");
  const [ndDt, setNdDt] = useState("0.01");
  const [baType, setBaType] = useState("hopf_bifurcation");
  const [baRange, setBaRange] = useState("4.0");
  const [baRes, setBaRes] = useState("500");
  const [arType, setArType] = useState("takens_embedding");
  const [arDim, setArDim] = useState("3");
  const [arDelay, setArDelay] = useState("10");
  const [caType, setCaType] = useState("cellular_automata");
  const [caGrid, setCaGrid] = useState("100");
  const [caAgents, setCaAgents] = useState("1000");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-chaos-engineering/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Chaos Engineering Engine</h1>
          <p className="text-muted-foreground">Layer 118 — 混沌控制 / 分形计算 / 非线性动力学 / 分岔分析 / 吸引子重构 / 复杂自适应</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.366.0</Badge>
          <Badge variant="secondary">Layer 118</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="cc">混沌控制</TabsTrigger>
<TabsTrigger value="fc">分形计算</TabsTrigger>
<TabsTrigger value="nd">非线性</TabsTrigger>
<TabsTrigger value="ba">分岔分析</TabsTrigger>
<TabsTrigger value="ar">吸引子</TabsTrigger>
<TabsTrigger value="ca">复杂自适应</TabsTrigger>

        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Chaos Engineering Engine 概览</CardTitle><CardDescription>Layer 118 — 混沌控制 / 分形计算 / 非线性动力学 / 分岔分析 / 吸引子重构 / 复杂自适应 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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

        <TabsContent value="cc">
          <Card><CardHeader><CardTitle>混沌控制 (Chaos Control)</CardTitle><CardDescription>OGC/Pyragas/Feedback/Sliding/Adaptive/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ccType} onValueChange={setCcType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>控制增益</Label><Input type="number" value={ccGain} onChange={(e) => setCcGain(e.target.value)} step={0.1} min={0} /></div>
<div className="space-y-2"><Label>系统维度</Label><Input type="number" value={ccDim} onChange={(e) => setCcDim(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chaos-engineering/chaos-control", {chaos_type: ccType, control_gain: ccGain, system_dim: ccDim})} disabled={loading}>{loading ? "计算中..." : "混沌控制分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="fc">
          <Card><CardHeader><CardTitle>分形计算 (Fractal Computing)</CardTitle><CardDescription>Mandelbrot/Julia/Sierpinski/L-System/Dim/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={fcType} onValueChange={setFcType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>分辨率</Label><Input type="number" value={fcRes} onChange={(e) => setFcRes(e.target.value)} min={64} /></div>
<div className="space-y-2"><Label>最大迭代</Label><Input type="number" value={fcIter} onChange={(e) => setFcIter(e.target.value)} min={100} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chaos-engineering/fractal-computing", {fractal_type: fcType, resolution: fcRes, max_iterations: fcIter})} disabled={loading}>{loading ? "计算中..." : "分形分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="nd">
          <Card><CardHeader><CardTitle>非线性动力学 (Nonlinear Dynamics)</CardTitle><CardDescription>Van-der-Pol/Lorenz/Rossler/Duffing/Henon/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ndType} onValueChange={setNdType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ND_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>时间步数</Label><Input type="number" value={ndSteps} onChange={(e) => setNdSteps(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>步长</Label><Input type="number" value={ndDt} onChange={(e) => setNdDt(e.target.value)} step={0.001} min={0.001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chaos-engineering/nonlinear-dynamics", {dynamics_type: ndType, time_steps: ndSteps, step_size: ndDt})} disabled={loading}>{loading ? "计算中..." : "动力学分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ba">
          <Card><CardHeader><CardTitle>分岔分析 (Bifurcation Analysis)</CardTitle><CardDescription>Saddle-Node/Transcritical/Pitchfork/Hopf/Period/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={baType} onValueChange={setBaType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BA_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>参数范围</Label><Input type="number" value={baRange} onChange={(e) => setBaRange(e.target.value)} step={0.5} min={0.1} /></div>
<div className="space-y-2"><Label>分辨率</Label><Input type="number" value={baRes} onChange={(e) => setBaRes(e.target.value)} min={50} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chaos-engineering/bifurcation-analysis", {bifurcation_type: baType, param_range: baRange, resolution: baRes})} disabled={loading}>{loading ? "计算中..." : "分岔分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ar">
          <Card><CardHeader><CardTitle>吸引子重构 (Attractor Reconstruction)</CardTitle><CardDescription>Takens/Lyapunov/Recurrence/Poincare/Strange/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={arType} onValueChange={setArType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AR_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>嵌入维度</Label><Input type="number" value={arDim} onChange={(e) => setArDim(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>时间延迟</Label><Input type="number" value={arDelay} onChange={(e) => setArDelay(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chaos-engineering/attractor-reconstruction", {attractor_type: arType, embedding_dim: arDim, time_delay: arDelay})} disabled={loading}>{loading ? "计算中..." : "吸引子分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ca">
          <Card><CardHeader><CardTitle>复杂自适应系统 (Complex Adaptive)</CardTitle><CardDescription>CA/Boolean/Kuramoto/Ising/Percolation/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={caType} onValueChange={setCaType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CA_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>网格大小</Label><Input type="number" value={caGrid} onChange={(e) => setCaGrid(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>代理数</Label><Input type="number" value={caAgents} onChange={(e) => setCaAgents(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chaos-engineering/complex-adaptive", {cas_type: caType, grid_size: caGrid, num_agents: caAgents})} disabled={loading}>{loading ? "计算中..." : "CAS分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
