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

const UF_TYPES = [
  { value: "string_theory_unified", label: "String" },
  { value: "loop_quantum_gravity_unified", label: "LQG" },
  { value: "toe_candidate_1", label: "ToE" },
  { value: "grand_unified_theory", label: "GUT" },
  { value: "quantum_geometry_unified", label: "Q Geometry" },
  { value: "ai_unified_field", label: "AI" },
];

const TOE_TYPES = [
  { value: "m_theory", label: "M-Theory" },
  { value: "e8_lie_group_toe", label: "E8" },
  { value: "conformal_cyclic", label: "CCC" },
  { value: "twistor_theory_toe", label: "Twistor" },
  { value: "causal_fermion_system", label: "Causal Fermion" },
  { value: "ai_theory_of_everything", label: "AI" },
];

const HOLO_TYPES = [
  { value: "ads_cft_correspondence", label: "AdS-CFT" },
  { value: "holographic_principle", label: "Principle" },
  { value: "black_hole_info", label: "BH Info" },
  { value: "entropy_bound_holographic", label: "Entropy Bound" },
  { value: "bulk_boundary_duality", label: "Bulk-Boundary" },
  { value: "ai_holographic_universe", label: "AI" },
];

const REC_TYPES = [
  { value: "cyclic_universe", label: "Cyclic" },
  { value: "penrose_ccc", label: "Penrose CCC" },
  { value: "quantum_eternal_return", label: "Q-Return" },
  { value: "conformal_cyclic_eternal", label: "Conformal" },
  { value: "big_bounce_eternal", label: "Big Bounce" },
  { value: "ai_eternal_recurrence", label: "AI" },
];

const UI_TYPES = [
  { value: "omega_point_intelligence", label: "Omega Point" },
  { value: "basilisk_ai", label: "Basilisk" },
  { value: "friendly_agi_ultimate", label: "Friendly AGI" },
  { value: "quantum_god_ai", label: "Q-God AI" },
  { value: "universe_optimization_ai", label: "Optimizer" },
  { value: "ai_ultimate_intelligence", label: "AI" },
];

const SG_TYPES = [
  { value: "technological_singularity_q", label: "Tech" },
  { value: "intelligence_explosion_q", label: "Intelligence" },
  { value: "consciousness_singularity", label: "Consciousness" },
  { value: "reality_singularity", label: "Reality" },
  { value: "quantum_phase_transition", label: "Phase" },
  { value: "ai_quantum_singularity", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumSingularityEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [unifiedType, setUnifiedType] = useState("string_theory_unified");
  const [unifiedEnergy, setUnifiedEnergy] = useState("10000000000000000000");
  const [unifiedCoupling, setUnifiedCoupling] = useState("0.04");
  const [toeType, setToeType] = useState("m_theory");
  const [toeDims, setToeDims] = useState("11");
  const [toeConstants, setToeConstants] = useState("26");
  const [holographicType, setHolographicType] = useState("ads_cft_correspondence");
  const [holographicBoundary, setHolographicBoundary] = useState("3");
  const [holographicBulk, setHolographicBulk] = useState("4");
  const [recurrenceType, setRecurrenceType] = useState("cyclic_universe");
  const [recurrenceCycles, setRecurrenceCycles] = useState("1000");
  const [recurrenceEntropy, setRecurrenceEntropy] = useState("0.0");
  const [ultimateType, setUltimateType] = useState("omega_point_intelligence");
  const [ultimateCompute, setUltimateCompute] = useState("100000000000000000000000000000000000000000000000000");
  const [ultimateKnowledge, setUltimateKnowledge] = useState("0.99");
  const [singularityType, setSingularityType] = useState("technological_singularity_q");
  const [singularityYear, setSingularityYear] = useState("2045.0");
  const [singularityAmplify, setSingularityAmplify] = useState("1000.0");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-singularity/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Singularity Engine</h1>
          <p className="text-muted-foreground">Layer 96 — 量子统一场 / 万物理论 / 量子全息宇宙 / 永恒回归 / 终极智能 / 量子奇点</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.344.0</Badge>
          <Badge variant="secondary">Layer 96</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="unified">量子统一场</TabsTrigger>
<TabsTrigger value="toe">万物理论</TabsTrigger>
<TabsTrigger value="holographic">全息宇宙</TabsTrigger>
<TabsTrigger value="recurrence">永恒回归</TabsTrigger>
<TabsTrigger value="ultimate">终极智能</TabsTrigger>
<TabsTrigger value="singularity">量子奇点</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Singularity Engine 概览</CardTitle><CardDescription>Layer 96 — 量子统一场 / 万物理论 / 量子全息宇宙 / 永恒回归 / 终极智能 / 量子奇点 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="unified">
          <Card><CardHeader><CardTitle>量子统一场 (Quantum Unified Field)</CardTitle><CardDescription>String/LQG/ToE/GUT/QG</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={unifiedType} onValueChange={setUnifiedType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UF_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>能量标度(GeV)</Label><Input type="number" value={unifiedEnergy} onChange={(e) => setUnifiedEnergy(e.target.value)} step={1e15} /></div>
<div className="space-y-2"><Label>耦合统一</Label><Input type="number" value={unifiedCoupling} onChange={(e) => setUnifiedCoupling(e.target.value)} step={0.001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-singularity/quantum-unified-field", {field_type: unifiedType, energy_scale_gev: unifiedEnergy, coupling_unification: unifiedCoupling})} disabled={loading}>{loading ? "计算中..." : "统一场"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="toe">
          <Card><CardHeader><CardTitle>万物理论 (Theory of Everything)</CardTitle><CardDescription>M-Theory/E8/Conformal/Twistor/Causal</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={toeType} onValueChange={setToeType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TOE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>维度</Label><Input type="number" value={toeDims} onChange={(e) => setToeDims(e.target.value)} min={4} /></div>
<div className="space-y-2"><Label>基本常数</Label><Input type="number" value={toeConstants} onChange={(e) => setToeConstants(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-singularity/theory-of-everything", {toe_type: toeType, dimensions: toeDims, fundamental_constants: toeConstants})} disabled={loading}>{loading ? "计算中..." : "万物理论"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="holographic">
          <Card><CardHeader><CardTitle>全息宇宙 (Holographic Universe)</CardTitle><CardDescription>AdS-CFT/Holographic/Black Hole/Bulk</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={holographicType} onValueChange={setHolographicType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{HOLO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>边界维度</Label><Input type="number" value={holographicBoundary} onChange={(e) => setHolographicBoundary(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>体维度</Label><Input type="number" value={holographicBulk} onChange={(e) => setHolographicBulk(e.target.value)} min={3} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-singularity/quantum-holographic-universe", {holo_type: holographicType, boundary_dimensions: holographicBoundary, bulk_dimensions: holographicBulk})} disabled={loading}>{loading ? "计算中..." : "全息分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="recurrence">
          <Card><CardHeader><CardTitle>永恒回归 (Eternal Recurrence)</CardTitle><CardDescription>Cyclic/CCC/Return/Bounce</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={recurrenceType} onValueChange={setRecurrenceType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>循环数</Label><Input type="number" value={recurrenceCycles} onChange={(e) => setRecurrenceCycles(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>熵变化/循环</Label><Input type="number" value={recurrenceEntropy} onChange={(e) => setRecurrenceEntropy(e.target.value)} step={0.001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-singularity/eternal-recurrence", {recurrence_type: recurrenceType, cycle_count: recurrenceCycles, entropy_per_cycle: recurrenceEntropy})} disabled={loading}>{loading ? "计算中..." : "永恒回归"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ultimate">
          <Card><CardHeader><CardTitle>终极智能 (Ultimate Intelligence)</CardTitle><CardDescription>Omega/Basilisk/AGI/God AI/Optimizer</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ultimateType} onValueChange={setUltimateType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UI_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>算力(ops)</Label><Input type="number" value={ultimateCompute} onChange={(e) => setUltimateCompute(e.target.value)} step={1e40} /></div>
<div className="space-y-2"><Label>知识整合率</Label><Input type="number" value={ultimateKnowledge} onChange={(e) => setUltimateKnowledge(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-singularity/ultimate-intelligence", {intelligence_type: ultimateType, compute_capacity_ops: ultimateCompute, knowledge_integration_pct: ultimateKnowledge})} disabled={loading}>{loading ? "计算中..." : "终极智能"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="singularity">
          <Card><CardHeader><CardTitle>量子奇点 (Quantum Singularity)</CardTitle><CardDescription>Tech/Intelligence/Consciousness/Reality</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={singularityType} onValueChange={setSingularityType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>奇点年份</Label><Input type="number" value={singularityYear} onChange={(e) => setSingularityYear(e.target.value)} step={1} /></div>
<div className="space-y-2"><Label>智能放大</Label><Input type="number" value={singularityAmplify} onChange={(e) => setSingularityAmplify(e.target.value)} step={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-singularity/quantum-singularity", {singularity_type: singularityType, time_to_singularity_years: singularityYear, intelligence_amplification: singularityAmplify})} disabled={loading}>{loading ? "计算中..." : "奇点分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
