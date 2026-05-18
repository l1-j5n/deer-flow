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

const TP_TYPES = [
  { value: "fully_connected", label: "Full" },
  { value: "ring_topology", label: "Ring" },
  { value: "star_topology", label: "Star" },
  { value: "grid_topology", label: "Grid" },
  { value: "small_world", label: "Small-World" },
  { value: "ai_adaptive_topology", label: "AI" },
];

const BH_TYPES = [
  { value: "foraging", label: "Foraging" },
  { value: "flocking", label: "Flocking" },
  { value: "schooling", label: "Schooling" },
  { value: "murmuration", label: "Murmuration" },
  { value: "stigmergy", label: "Stigmergy" },
  { value: "ai_behavior_synthesizer", label: "AI" },
];

const CM_TYPES = [
  { value: "pheromone", label: "Pheromone" },
  { value: "waggle_dance", label: "Waggle" },
  { value: "vibrational", label: "Vibration" },
  { value: "electromagnetic", label: "EM" },
  { value: "quantum_entangled", label: "Quantum" },
  { value: "ai_comm_protocol", label: "AI" },
];

const OP_TYPES = [
  { value: "pso", label: "PSO" },
  { value: "ant_colony", label: "Ant" },
  { value: "bee_colony", label: "Bee" },
  { value: "firefly", label: "Firefly" },
  { value: "whale_optimization", label: "Whale" },
  { value: "ai_hybrid_optimizer", label: "AI" },
];

const AD_TYPES = [
  { value: "environmental", label: "Environ" },
  { value: "predator_evasion", label: "Predator" },
  { value: "resource_depletion", label: "Resource" },
  { value: "climate_adaptation", label: "Climate" },
  { value: "collective_learning", label: "Collective" },
  { value: "ai_adaptation_engine", label: "AI" },
];

const EV_TYPES = [
  { value: "natural_selection", label: "Natural" },
  { value: "group_selection", label: "Group" },
  { value: "kin_selection", label: "Kin" },
  { value: "sexual_selection", label: "Sexual" },
  { value: "coevolution", label: "Coevo" },
  { value: "ai_evolution_driver", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumSwarmIntelligenceEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [topologyType, setTopologyType] = useState("fully_connected");
  const [topologyAgents, setTopologyAgents] = useState("1000");
  const [topologyDim, setTopologyDim] = useState("30");
  const [behaviorType, setBehaviorType] = useState("foraging");
  const [behaviorIndiv, setBehaviorIndiv] = useState("500");
  const [behaviorEnv, setBehaviorEnv] = useState("100");
  const [commType, setCommType] = useState("pheromone");
  const [commBW, setCommBW] = useState("100");
  const [commLat, setCommLat] = useState("1.0");
  const [optType, setOptType] = useState("pso");
  const [optDim, setOptDim] = useState("50");
  const [optIter, setOptIter] = useState("1000");
  const [adaptType, setAdaptType] = useState("environmental");
  const [adaptPressure, setAdaptPressure] = useState("0.5");
  const [adaptSteps, setAdaptSteps] = useState("500");
  const [evolType, setEvolType] = useState("natural_selection");
  const [evolPop, setEvolPop] = useState("200");
  const [evolGen, setEvolGen] = useState("500");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-swarm-intelligence/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Swarm Intelligence Engine</h1>
          <p className="text-muted-foreground">Layer 115 — 拓扑结构 / 群体行为 / 群体通信 / 群体优化 / 适应进化 / 群体演化</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.363.0</Badge>
          <Badge variant="secondary">Layer 115</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="topology">拓扑结构</TabsTrigger>
<TabsTrigger value="behavior">群体行为</TabsTrigger>
<TabsTrigger value="communication">群体通信</TabsTrigger>
<TabsTrigger value="optimization">群体优化</TabsTrigger>
<TabsTrigger value="adaptation">适应进化</TabsTrigger>
<TabsTrigger value="evolution">群体演化</TabsTrigger>

        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Swarm Intelligence Engine 概览</CardTitle><CardDescription>Layer 115 — 拓扑结构 / 群体行为 / 群体通信 / 群体优化 / 适应进化 / 群体演化 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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

        <TabsContent value="topology">
          <Card><CardHeader><CardTitle>拓扑结构 (Swarm Topology)</CardTitle><CardDescription>Full/Ring/Star/Grid/Small-World</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={topologyType} onValueChange={setTopologyType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>智能体数</Label><Input type="number" value={topologyAgents} onChange={(e) => setTopologyAgents(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>维度</Label><Input type="number" value={topologyDim} onChange={(e) => setTopologyDim(e.target.value)} min={2} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-swarm-intelligence/swarm-topology", {topology_type: topologyType, num_agents: topologyAgents, dimension: topologyDim})} disabled={loading}>{loading ? "计算中..." : "拓扑分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="behavior">
          <Card><CardHeader><CardTitle>群体行为 (Swarm Behavior)</CardTitle><CardDescription>Foraging/Flocking/Schooling/Murmuration/Stigmergy</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={behaviorType} onValueChange={setBehaviorType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BH_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>个体数</Label><Input type="number" value={behaviorIndiv} onChange={(e) => setBehaviorIndiv(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>环境大小</Label><Input type="number" value={behaviorEnv} onChange={(e) => setBehaviorEnv(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-swarm-intelligence/swarm-behavior", {behavior_type: behaviorType, num_individuals: behaviorIndiv, environment_size: behaviorEnv})} disabled={loading}>{loading ? "计算中..." : "行为分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="communication">
          <Card><CardHeader><CardTitle>群体通信 (Swarm Communication)</CardTitle><CardDescription>Pheromone/Waggle/Vibration/EM/Quantum</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={commType} onValueChange={setCommType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>带宽</Label><Input type="number" value={commBW} onChange={(e) => setCommBW(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>延迟(ms)</Label><Input type="number" value={commLat} onChange={(e) => setCommLat(e.target.value)} step={0.1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-swarm-intelligence/swarm-communication", {comm_type: commType, bandwidth: commBW, latency_ms: commLat})} disabled={loading}>{loading ? "计算中..." : "通信分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="optimization">
          <Card><CardHeader><CardTitle>群体优化 (Swarm Optimization)</CardTitle><CardDescription>PSO/Ant/Bee/Firefly/Whale</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={optType} onValueChange={setOptType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>目标维度</Label><Input type="number" value={optDim} onChange={(e) => setOptDim(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>最大迭代</Label><Input type="number" value={optIter} onChange={(e) => setOptIter(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-swarm-intelligence/swarm-optimization", {optimization_type: optType, objective_dim: optDim, max_iterations: optIter})} disabled={loading}>{loading ? "计算中..." : "优化分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="adaptation">
          <Card><CardHeader><CardTitle>适应进化 (Swarm Adaptation)</CardTitle><CardDescription>Environmental/Predator/Resource/Climate/Collective</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={adaptType} onValueChange={setAdaptType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>压力强度</Label><Input type="number" value={adaptPressure} onChange={(e) => setAdaptPressure(e.target.value)} step={0.05} min={0} max={1} /></div>
<div className="space-y-2"><Label>适应步数</Label><Input type="number" value={adaptSteps} onChange={(e) => setAdaptSteps(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-swarm-intelligence/swarm-adaptation", {adaptation_type: adaptType, pressure_intensity: adaptPressure, adaptation_steps: adaptSteps})} disabled={loading}>{loading ? "计算中..." : "适应分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="evolution">
          <Card><CardHeader><CardTitle>群体演化 (Swarm Evolution)</CardTitle><CardDescription>Natural/Group/Kin/Sexual/Coevolution</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={evolType} onValueChange={setEvolType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EV_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>种群数</Label><Input type="number" value={evolPop} onChange={(e) => setEvolPop(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>代数</Label><Input type="number" value={evolGen} onChange={(e) => setEvolGen(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-swarm-intelligence/swarm-evolution", {evolution_type: evolType, population_size: evolPop, generations: evolGen})} disabled={loading}>{loading ? "计算中..." : "演化分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
