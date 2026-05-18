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
  layer: number; version: string; engine: str; description: string;
  enums: Record<string, string[]>; enum_count: number;
  endpoints: { method: string; path: string; desc: string }[];
  endpoint_count: number; config_space: number; cache_stats: Record<string, number>;
}

const SURF_TYPES = [
  { value: "planar_surface", label: "Planar" },
  { value: "toric_surface", label: "Toric" },
  { value: "rotated_surface", label: "Rotated" },
  { value: "xzzx_surface", label: "XZZX" },
  { value: "subsystem_surface", label: "Subsystem" },
  { value: "ai_surface_code", label: "AI" },
];

const COLOR_TYPES = [
  { value: "triangular_color", label: "Triangular" },
  { value: "hexagonal_color", label: "Hexagonal" },
  { value: "4_8_8_color", label: "4-8-8" },
  { value: "steane_color", label: "Steane" },
  { value: "bombin_color", label: "Bombin" },
  { value: "ai_color_code", label: "AI" },
];

const LDPC_TYPES = [
  { value: "tanner_ldpc", label: "Tanner" },
  { value: "hypergraph_ldpc", label: "Hypergraph" },
  { value: "quantum_ldpc_chain", label: "Chain" },
  { value: "expander_ldpc", label: "Expander" },
  { value: "lifted_ldpc", label: "Lifted" },
  { value: "ai_ldpc_code", label: "AI" },
];

const THRESH_TYPES = [
  { value: "independent_threshold", label: "Independent" },
  { value: "correlated_threshold", label: "Correlated" },
  { value: "circuit_level_threshold", label: "Circuit" },
  { value: "phenomenological", label: "Phenomenological" },
  { value: "code_capacity_threshold", label: "Code Cap." },
  { value: "ai_threshold_model", label: "AI" },
];

const DEC_TYPES = [
  { value: "mwpm_decoder", label: "MWPM" },
  { value: "belief_propagation", label: "BP" },
  { value: "neural_decoder", label: "Neural" },
  { value: "tensor_network_dec", label: "Tensor Net" },
  { value: "union_find_decoder", label: "Union-Find" },
  { value: "ai_decoder", label: "AI" },
];

const LOGIC_TYPES = [
  { value: "transversal_gate", label: "Transversal" },
  { value: "lattice_surgery", label: "Lattice" },
  { value: "code_switching", label: "Code Switch" },
  { value: "magic_state_distill", label: "Magic State" },
  { value: "flag_fault_tolerance", label: "Flag" },
  { value: "ai_logical_op", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumErrorCorrectionCodeEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [surfaceType, setSurfaceType] = useState("planar_surface");
  const [surfaceDistance, setSurfaceDistance] = useState("17");
  const [surfaceErrorRate, setSurfaceErrorRate] = useState("0.001");
  const [colorType, setColorType] = useState("triangular_color");
  const [colorDistance, setColorDistance] = useState("11");
  const [colorStab, setColorStab] = useState("6");
  const [ldpcType, setLdpcType] = useState("tanner_ldpc");
  const [ldpcBlock, setLdpcBlock] = useState("1000");
  const [ldpcRate, setLdpcRate] = useState("0.5");
  const [thresholdType, setThresholdType] = useState("independent_threshold");
  const [thresholdNoise, setThresholdNoise] = useState("depolarizing");
  const [thresholdRange, setThresholdRange] = useState("50");
  const [decoderType, setDecoderType] = useState("mwpm_decoder");
  const [decoderRounds, setDecoderRounds] = useState("10");
  const [decoderDistance, setDecoderDistance] = useState("15");
  const [logicalType, setLogicalType] = useState("transversal_gate");
  const [logicalGate, setLogicalGate] = useState("toffoli");
  const [logicalBudget, setLogicalBudget] = useState("0.0001");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-error-correction-code/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Error Correction Code Engine</h1>
          <p className="text-muted-foreground">Layer 98 — 表面码 / 颜色码 / LDPC码 / 容错阈值 / 解码器 / 逻辑操作</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.346.0</Badge>
          <Badge variant="secondary">Layer 98</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="surface">表面码</TabsTrigger>
<TabsTrigger value="color">颜色码</TabsTrigger>
<TabsTrigger value="ldpc">LDPC码</TabsTrigger>
<TabsTrigger value="threshold">容错阈值</TabsTrigger>
<TabsTrigger value="decoder">解码器</TabsTrigger>
<TabsTrigger value="logical">逻辑操作</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Error Correction Code Engine 概览</CardTitle><CardDescription>Layer 98 — 表面码 / 颜色码 / LDPC码 / 容错阈值 / 解码器 / 逻辑操作 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="surface">
          <Card><CardHeader><CardTitle>表面码 (Surface Code)</CardTitle><CardDescription>Planar/Toric/Rotated/XZZX/Subsystem</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={surfaceType} onValueChange={setSurfaceType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SURF_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>码距</Label><Input type="number" value={surfaceDistance} onChange={(e) => setSurfaceDistance(e.target.value)} min={3} /></div>
<div className="space-y-2"><Label>物理错误率</Label><Input type="number" value={surfaceErrorRate} onChange={(e) => setSurfaceErrorRate(e.target.value)} step={0.0001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-error-correction-code/surface-code", {surface_type: surfaceType, code_distance: surfaceDistance, physical_error_rate: surfaceErrorRate})} disabled={loading}>{loading ? "计算中..." : "表面码"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="color">
          <Card><CardHeader><CardTitle>颜色码 (Color Code)</CardTitle><CardDescription>Triangular/Hexagonal/4-8-8/Steane/Bombin</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={colorType} onValueChange={setColorType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COLOR_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>码距</Label><Input type="number" value={colorDistance} onChange={(e) => setColorDistance(e.target.value)} min={3} /></div>
<div className="space-y-2"><Label>稳定子权重</Label><Input type="number" value={colorStab} onChange={(e) => setColorStab(e.target.value)} min={4} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-error-correction-code/color-code", {color_type: colorType, code_distance: colorDistance, stabilizer_weight: colorStab})} disabled={loading}>{loading ? "计算中..." : "颜色码"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ldpc">
          <Card><CardHeader><CardTitle>LDPC码 (LDPC Code)</CardTitle><CardDescription>Tanner/Hypergraph/Chain/Expander/Lifted</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ldpcType} onValueChange={setLdpcType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LDPC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>块长度</Label><Input type="number" value={ldpcBlock} onChange={(e) => setLdpcBlock(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>码率</Label><Input type="number" value={ldpcRate} onChange={(e) => setLdpcRate(e.target.value)} step={0.01} min={0.1} max={0.9} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-error-correction-code/ldpc-code", {ldpc_type: ldpcType, block_length: ldpcBlock, rate: ldpcRate})} disabled={loading}>{loading ? "计算中..." : "LDPC分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="threshold">
          <Card><CardHeader><CardTitle>容错阈值 (Fault-Tolerant Threshold)</CardTitle><CardDescription>Independent/Correlated/Circuit/Phenomenological</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={thresholdType} onValueChange={setThresholdType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{THRESH_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>噪声模型</Label><Input type="number" value={thresholdNoise} onChange={(e) => setThresholdNoise(e.target.value)}  /></div>
<div className="space-y-2"><Label>码距范围</Label><Input type="number" value={thresholdRange} onChange={(e) => setThresholdRange(e.target.value)} min={3} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-error-correction-code/fault-tolerant-threshold", {threshold_type: thresholdType, noise_model: thresholdNoise, code_distance_range: thresholdRange})} disabled={loading}>{loading ? "计算中..." : "阈值分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="decoder">
          <Card><CardHeader><CardTitle>解码器 (Decoder Engine)</CardTitle><CardDescription>MWPM/BP/Neural/Tensor/Union-Find</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={decoderType} onValueChange={setDecoderType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>syndrome轮数</Label><Input type="number" value={decoderRounds} onChange={(e) => setDecoderRounds(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>码距</Label><Input type="number" value={decoderDistance} onChange={(e) => setDecoderDistance(e.target.value)} min={3} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-error-correction-code/decoder-engine", {decoder_type: decoderType, syndrome_rounds: decoderRounds, code_distance: decoderDistance})} disabled={loading}>{loading ? "计算中..." : "解码分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="logical">
          <Card><CardHeader><CardTitle>逻辑操作 (Logical Operation)</CardTitle><CardDescription>Transversal/Lattice/Code Switch/Magic/Flag</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={logicalType} onValueChange={setLogicalType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LOGIC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>目标门</Label><Input type="number" value={logicalGate} onChange={(e) => setLogicalGate(e.target.value)}  /></div>
<div className="space-y-2"><Label>误差预算</Label><Input type="number" value={logicalBudget} onChange={(e) => setLogicalBudget(e.target.value)} step={0.00001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-error-correction-code/logical-operation", {logical_type: logicalType, target_gate: logicalGate, error_budget: logicalBudget})} disabled={loading}>{loading ? "计算中..." : "逻辑操作"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
