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

const NT_TYPES = [
  { value: "small_world", label: "Small-World" },
  { value: "scale_free", label: "Scale-Free" },
  { value: "random_network", label: "Random" },
  { value: "modular_network", label: "Modular" },
  { value: "multiplex_network", label: "Multiplex" },
  { value: "ai_network_evolution", label: "AI" },
];

const EB_TYPES = [
  { value: "pattern_formation", label: "Pattern" },
  { value: "self_organization", label: "Self-Org" },
  { value: "collective_intelligence", label: "Collective" },
  { value: "swarm_emergence", label: "Swarm" },
  { value: "phase_synchronization", label: "Sync" },
  { value: "ai_emergence_detector", label: "AI" },
];

const SO_TYPES = [
  { value: "dissipative_structure", label: "Dissipative" },
  { value: "autopoiesis", label: "Autopoiesis" },
  { value: "synergetics", label: "Synergetics" },
  { value: "morphogenesis", label: "Morpho" },
  { value: "homeokinetics", label: "Homeokinetics" },
  { value: "ai_self_org_optimizer", label: "AI" },
];

const SF_TYPES = [
  { value: "barabasi_albert", label: "Barabasi" },
  { value: "fitness_model", label: "Fitness" },
  { value: "copying_model", label: "Copying" },
  { value: "hybrid_growth", label: "Hybrid" },
  { value: "deactivation_model", label: "Deactivation" },
  { value: "ai_scale_free_gen", label: "AI" },
];

const MAC_TYPES = [
  { value: "consensus_protocol", label: "Consensus" },
  { value: "flocking_algorithm", label: "Flocking" },
  { value: "task_allocation", label: "Task" },
  { value: "market_mechanism", label: "Market" },
  { value: "stigmergy", label: "Stigmergy" },
  { value: "ai_coordination", label: "AI" },
];

const PT_TYPES = [
  { value: "first_order", label: "1st Order" },
  { value: "second_order", label: "2nd Order" },
  { value: "continuous", label: "Continuous" },
  { value: "percolation_transition", label: "Percolation" },
  { value: "synchronization_transition", label: "Sync" },
  { value: "ai_transition_predict", label: "AI" },
];

function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumComplexSystemsEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [ntType, setNtType] = useState("small_world");
  const [ntNodes, setNtNodes] = useState("500");
  const [ntDensity, setNtDensity] = useState("0.1");
  const [ebType, setEbType] = useState("pattern_formation");
  const [ebPop, setEbPop] = useState("200");
  const [ebRadius, setEbRadius] = useState("0.3");
  const [soType, setSoType] = useState("dissipative_structure");
  const [soComp, setSoComp] = useState("100");
  const [soCoupling, setSoCoupling] = useState("0.5");
  const [sfType, setSfType] = useState("barabasi_albert");
  const [sfInit, setSfInit] = useState("10");
  const [sfGrowth, setSfGrowth] = useState("1000");
  const [macType, setMacType] = useState("consensus_protocol");
  const [macAgents, setMacAgents] = useState("50");
  const [macRange, setMacRange] = useState("0.4");
  const [ptType, setPtType] = useState("second_order");
  const [ptSize, setPtSize] = useState("1000");
  const [ptParam, setPtParam] = useState("2.27");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-complex-systems/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Complex Systems Engine</h1>
          <p className="text-muted-foreground">Layer 119 — 网络拓扑 / 涌现行为 / 自组织 / 无标度网络 / 多智能体协调 / 相变</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.367.0</Badge>
          <Badge variant="secondary">Layer 119</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="nt">网络拓扑</TabsTrigger>
<TabsTrigger value="eb">涌现行为</TabsTrigger>
<TabsTrigger value="so">自组织</TabsTrigger>
<TabsTrigger value="sf">无标度</TabsTrigger>
<TabsTrigger value="mac">多智能体</TabsTrigger>
<TabsTrigger value="pt">相变</TabsTrigger>

        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Complex Systems Engine 概览</CardTitle><CardDescription>Layer 119 — 网络拓扑 / 涌现行为 / 自组织 / 无标度网络 / 多智能体协调 / 相变 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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

        <TabsContent value="nt">
          <Card><CardHeader><CardTitle>网络拓扑 (Network Topology)</CardTitle><CardDescription>Small-World/Scale-Free/Random/Modular/Multiplex/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ntType} onValueChange={setNtType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{NT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>节点数</Label><Input type="number" value={ntNodes} onChange={(e) => setNtNodes(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>边密度</Label><Input type="number" value={ntDensity} onChange={(e) => setNtDensity(e.target.value)} step={0.01} min={0.01} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-complex-systems/network-topology", {topology_type: ntType, node_count: ntNodes, edge_density: ntDensity})} disabled={loading}>{loading ? "计算中..." : "拓扑分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="eb">
          <Card><CardHeader><CardTitle>涌现行为 (Emergent Behavior)</CardTitle><CardDescription>Pattern/Self-Org/Collective/Swarm/Sync/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ebType} onValueChange={setEbType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EB_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>种群数</Label><Input type="number" value={ebPop} onChange={(e) => setEbPop(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>交互半径</Label><Input type="number" value={ebRadius} onChange={(e) => setEbRadius(e.target.value)} step={0.05} min={0.01} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-complex-systems/emergent-behavior", {emergence_type: ebType, population_size: ebPop, interaction_radius: ebRadius})} disabled={loading}>{loading ? "计算中..." : "涌现分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="so">
          <Card><CardHeader><CardTitle>自组织 (Self-Organization)</CardTitle><CardDescription>Dissipative/Autopoiesis/Synergetics/Morpho/Homeokinetics/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={soType} onValueChange={setSoType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>组件数</Label><Input type="number" value={soComp} onChange={(e) => setSoComp(e.target.value)} min={5} /></div>
<div className="space-y-2"><Label>耦合强度</Label><Input type="number" value={soCoupling} onChange={(e) => setSoCoupling(e.target.value)} step={0.05} min={0.01} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-complex-systems/self-organization", {selforg_type: soType, system_components: soComp, coupling_strength: soCoupling})} disabled={loading}>{loading ? "计算中..." : "自组织分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="sf">
          <Card><CardHeader><CardTitle>无标度网络 (Scale-Free Network)</CardTitle><CardDescription>Barabasi/Fitness/Copying/Hybrid/Deactivation/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={sfType} onValueChange={setSfType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SF_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>初始节点</Label><Input type="number" value={sfInit} onChange={(e) => setSfInit(e.target.value)} min={3} /></div>
<div className="space-y-2"><Label>增长步数</Label><Input type="number" value={sfGrowth} onChange={(e) => setSfGrowth(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-complex-systems/scale-free-network", {network_type: sfType, initial_nodes: sfInit, growth_steps: sfGrowth})} disabled={loading}>{loading ? "计算中..." : "无标度分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="mac">
          <Card><CardHeader><CardTitle>多智能体协调 (Multi-Agent Coordination)</CardTitle><CardDescription>Consensus/Flocking/Task/Market/Stigmergy/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={macType} onValueChange={setMacType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MAC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>智能体数</Label><Input type="number" value={macAgents} onChange={(e) => setMacAgents(e.target.value)} min={3} /></div>
<div className="space-y-2"><Label>通信范围</Label><Input type="number" value={macRange} onChange={(e) => setMacRange(e.target.value)} step={0.05} min={0.01} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-complex-systems/multi-agent-coordination", {coordination_type: macType, agent_count: macAgents, communication_range: macRange})} disabled={loading}>{loading ? "计算中..." : "协调分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="pt">
          <Card><CardHeader><CardTitle>相变 (Phase Transition)</CardTitle><CardDescription>1st-Order/2nd-Order/Continuous/Percolation/Sync/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ptType} onValueChange={setPtType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>系统大小</Label><Input type="number" value={ptSize} onChange={(e) => setPtSize(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>控制参数</Label><Input type="number" value={ptParam} onChange={(e) => setPtParam(e.target.value)} step={0.01} min={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-complex-systems/phase-transition", {transition_type: ptType, system_size: ptSize, control_param: ptParam})} disabled={loading}>{loading ? "计算中..." : "相变分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
