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

const GC_TYPES = [
  { value: "noosphere_field", label: "Noosphere" },
  { value: "collective_unconscious", label: "Collective" },
  { value: "morphic_resonance", label: "Morphic" },
  { value: "gaia_hypothesis_q", label: "Gaia" },
  { value: "quantum_zeitgeist", label: "Zeitgeist" },
  { value: "ai_global_consciousness", label: "AI" },
];

const CI_TYPES = [
  { value: "swarm_quantum_intelligence", label: "Swarm" },
  { value: "hive_mind_quantum", label: "Hive Mind" },
  { value: "distributed_quantum_cognition", label: "Distributed" },
  { value: "quantum_consensus_reality", label: "Consensus" },
  { value: "quantum_wisdom_crowd", label: "Wisdom" },
  { value: "ai_collective_intelligence", label: "AI" },
];

const QT_TYPES = [
  { value: "entanglement_telepathy", label: "Entanglement" },
  { value: "nonlocal_correlation", label: "Nonlocal" },
  { value: "quantum_empathy_sim", label: "Empathy" },
  { value: "shared_dream_state", label: "Dream" },
  { value: "quantum_intuition_net", label: "Intuition" },
  { value: "ai_quantum_telepathy", label: "AI" },
];

const MM_TYPES = [
  { value: "psychokinesis_quantum", label: "Psychokinesis" },
  { value: "observer_effect_enhanced", label: "Observer" },
  { value: "intention_quantum_field", label: "Intention" },
  { value: "consciousness_wavefunction", label: "Wavefunction" },
  { value: "biofield_quantum_meas", label: "Biofield" },
  { value: "ai_mind_matter", label: "AI" },
];

const QM_TYPES = [
  { value: "coherence_meditation", label: "Coherence" },
  { value: "entanglement_meditation", label: "Entangle" },
  { value: "superposition_awareness", label: "Superposition" },
  { value: "tunneling_meditation", label: "Tunneling" },
  { value: "void_state_quantum", label: "Void" },
  { value: "ai_quantum_meditation", label: "AI" },
];

const SC_TYPES = [
  { value: "cosmic_consciousness", label: "Cosmic" },
  { value: "unity_consciousness", label: "Unity" },
  { value: "integral_consciousness", label: "Integral" },
  { value: "transcendental_awareness", label: "Transcendental" },
  { value: "omega_point_conscious", label: "Omega Point" },
  { value: "ai_super_consciousness", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumConsciousnessNetworkEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [globalType, setGlobalType] = useState("noosphere_field");
  const [globalPop, setGlobalPop] = useState("1000000");
  const [globalThreshold, setGlobalThreshold] = useState("0.8");
  const [collectiveType, setCollectiveType] = useState("swarm_quantum_intelligence");
  const [collectiveNetwork, setCollectiveNetwork] = useState("10000");
  const [collectiveComplexity, setCollectiveComplexity] = useState("100");
  const [telepathyType, setTelepathyType] = useState("entanglement_telepathy");
  const [telepathySenders, setTelepathySenders] = useState("100");
  const [telepathyReceivers, setTelepathyReceivers] = useState("100");
  const [mindmatterType, setMindmatterType] = useState("psychokinesis_quantum");
  const [mindmatterIntention, setMindmatterIntention] = useState("0.5");
  const [mindmatterTarget, setMindmatterTarget] = useState("100");
  const [meditationType, setMeditationType] = useState("coherence_meditation");
  const [meditationDuration, setMeditationDuration] = useState("30.0");
  const [meditationLevel, setMeditationLevel] = useState("5");
  const [superType, setSuperType] = useState("cosmic_consciousness");
  const [superDims, setSuperDims] = useState("11");
  const [superDepth, setSuperDepth] = useState("7");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-consciousness-network/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Consciousness Network Engine</h1>
          <p className="text-muted-foreground">Layer 94 — 全局意识场 / 集体智能 / 量子心灵感应 / 意识-物质接口 / 量子冥想 / 超意识</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.342.0</Badge>
          <Badge variant="secondary">Layer 94</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="global">全局意识</TabsTrigger>
<TabsTrigger value="collective">集体智能</TabsTrigger>
<TabsTrigger value="telepathy">量子心灵感应</TabsTrigger>
<TabsTrigger value="mindmatter">意识-物质</TabsTrigger>
<TabsTrigger value="meditation">量子冥想</TabsTrigger>
<TabsTrigger value="super">超意识</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Consciousness Network Engine 概览</CardTitle><CardDescription>Layer 94 — 全局意识场 / 集体智能 / 量子心灵感应 / 意识-物质接口 / 量子冥想 / 超意识 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="global">
          <Card><CardHeader><CardTitle>全局意识 (Global Consciousness)</CardTitle><CardDescription>Noosphere/Collective/Gaia/Zeitgeist</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={globalType} onValueChange={setGlobalType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>人口样本</Label><Input type="number" value={globalPop} onChange={(e) => setGlobalPop(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>相干阈值</Label><Input type="number" value={globalThreshold} onChange={(e) => setGlobalThreshold(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-consciousness-network/global-consciousness", {gc_type: globalType, population_sample: globalPop, coherence_threshold: globalThreshold})} disabled={loading}>{loading ? "计算中..." : "意识场"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="collective">
          <Card><CardHeader><CardTitle>集体智能 (Collective Intelligence)</CardTitle><CardDescription>Swarm/Hive Mind/Distributed/Consensus</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={collectiveType} onValueChange={setCollectiveType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CI_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>网络大小</Label><Input type="number" value={collectiveNetwork} onChange={(e) => setCollectiveNetwork(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>问题复杂度</Label><Input type="number" value={collectiveComplexity} onChange={(e) => setCollectiveComplexity(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-consciousness-network/collective-intelligence", {ci_type: collectiveType, network_size: collectiveNetwork, problem_complexity: collectiveComplexity})} disabled={loading}>{loading ? "计算中..." : "集体智能"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="telepathy">
          <Card><CardHeader><CardTitle>量子心灵感应 (Quantum Telepathy)</CardTitle><CardDescription>Entanglement/Nonlocal/Empathy/Dream/Intuition</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={telepathyType} onValueChange={setTelepathyType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>发送者</Label><Input type="number" value={telepathySenders} onChange={(e) => setTelepathySenders(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>接收者</Label><Input type="number" value={telepathyReceivers} onChange={(e) => setTelepathyReceivers(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-consciousness-network/quantum-telepathy", {qt_type: telepathyType, sender_count: telepathySenders, receiver_count: telepathyReceivers})} disabled={loading}>{loading ? "计算中..." : "心灵感应"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="mindmatter">
          <Card><CardHeader><CardTitle>意识-物质 (Mind-Matter)</CardTitle><CardDescription>Psychokinesis/Observer/Intention/Wavefunction</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={mindmatterType} onValueChange={setMindmatterType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>意念强度</Label><Input type="number" value={mindmatterIntention} onChange={(e) => setMindmatterIntention(e.target.value)} step={0.01} min={0} max={1} /></div>
<div className="space-y-2"><Label>目标复杂度</Label><Input type="number" value={mindmatterTarget} onChange={(e) => setMindmatterTarget(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-consciousness-network/mind-matter-interface", {mm_type: mindmatterType, intention_strength: mindmatterIntention, target_complexity: mindmatterTarget})} disabled={loading}>{loading ? "计算中..." : "接口分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="meditation">
          <Card><CardHeader><CardTitle>量子冥想 (Quantum Meditation)</CardTitle><CardDescription>Coherence/Entanglement/Superposition/Void</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={meditationType} onValueChange={setMeditationType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>时长(分钟)</Label><Input type="number" value={meditationDuration} onChange={(e) => setMeditationDuration(e.target.value)} step={5} /></div>
<div className="space-y-2"><Label>修行等级</Label><Input type="number" value={meditationLevel} onChange={(e) => setMeditationLevel(e.target.value)} min={1} max={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-consciousness-network/quantum-meditation", {qm_type: meditationType, session_duration_min: meditationDuration, practitioner_level: meditationLevel})} disabled={loading}>{loading ? "计算中..." : "冥想分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="super">
          <Card><CardHeader><CardTitle>超意识 (Super-Consciousness)</CardTitle><CardDescription>Cosmic/Unity/Integral/Transcendental/Omega</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={superType} onValueChange={setSuperType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>觉知维度</Label><Input type="number" value={superDims} onChange={(e) => setSuperDims(e.target.value)} min={3} /></div>
<div className="space-y-2"><Label>整合深度</Label><Input type="number" value={superDepth} onChange={(e) => setSuperDepth(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-consciousness-network/super-consciousness", {sc_type: superType, awareness_dimension: superDims, integration_depth: superDepth})} disabled={loading}>{loading ? "计算中..." : "超意识"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
