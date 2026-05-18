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

const SV_TYPES = [
  { value: "exact_sv", label: "Exact" },
  { value: "sparse_sv", label: "Sparse" },
  { value: "gpu_accel_sv", label: "GPU" },
  { value: "distributed_sv", label: "Distributed" },
  { value: "chunked_sv", label: "Chunked" },
  { value: "ai_adaptive_sv", label: "AI" },
];

const DM_TYPES = [
  { value: "full_dm", label: "Full DM" },
  { value: "kraus_dm", label: "Kraus" },
  { value: "superop_dm", label: "Superop" },
  { value: "stochastic_dm", label: "Stochastic" },
  { value: "monte_carlo_dm", label: "Monte Carlo" },
  { value: "ai_noise_dm", label: "AI" },
];

const TN_TYPES = [
  { value: "mps_sim", label: "MPS" },
  { value: "mpo_sim", label: "MPO" },
  { value: "ttn_sim", label: "TTN" },
  { value: "peps_sim", label: "PEPS" },
  { value: "cotengra_sim", label: "Cotengra" },
  { value: "ai_contraction", label: "AI" },
];

const CF_TYPES = [
  { value: "stabilizer_chp", label: "CHP" },
  { value: "tableaux_sim", label: "Tableaux" },
  { value: "graph_state_sim", label: "Graph State" },
  { value: "cnot_hadamard_sim", label: "CNOT-H" },
  { value: "clifford_t_sim", label: "Clifford+T" },
  { value: "ai_clifford", label: "AI" },
];

const SB_TYPES = [
  { value: "chp_engine", label: "CHP" },
  { value: "Stim_engine", label: "Stim" },
  { value: "pymatching_sim", label: "PyMatching" },
  { value: "gf2_stabilizer", label: "GF2" },
  { value: "css_code_sim", label: "CSS" },
  { value: "ai_stabilizer", label: "AI" },
];

const MPS_TYPES = [
  { value: "mps_exact", label: "Exact" },
  { value: "mps_tebd", label: "TEBD" },
  { value: "mps_tdvp", label: "TDVP" },
  { value: "mps_dmrg", label: "DMRG" },
  { value: "mps_finite", label: "Finite" },
  { value: "ai_mps_bond", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumSimulatorEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [svType, setSvType] = useState("exact_sv");
  const [svQubits, setSvQubits] = useState("30");
  const [svDepth, setSvDepth] = useState("200");
  const [dmType, setDmType] = useState("full_dm");
  const [dmQubits, setDmQubits] = useState("15");
  const [dmNoise, setDmNoise] = useState("depolarizing");
  const [tnType, setTnType] = useState("mps_sim");
  const [tnQubits, setTnQubits] = useState("100");
  const [tnBond, setTnBond] = useState("64");
  const [cliffordType, setCliffordType] = useState("stabilizer_chp");
  const [cliffordQubits, setCliffordQubits] = useState("1000");
  const [cliffordGates, setCliffordGates] = useState("5000");
  const [stabilizerType, setStabilizerType] = useState("chp_engine");
  const [stabilizerDistance, setStabilizerDistance] = useState("11");
  const [stabilizerRounds, setStabilizerRounds] = useState("10");
  const [mpsType, setMpsType] = useState("mps_exact");
  const [mpsQubits, setMpsQubits] = useState("50");
  const [mpsBondDim, setMpsBondDim] = useState("32");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-simulator/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Simulator Engine</h1>
          <p className="text-muted-foreground">Layer 103 — 状态向量 / 密度矩阵 / 张量网络 / Clifford / 稳定子 / MPS</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.351.0</Badge>
          <Badge variant="secondary">Layer 103</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="sv">状态向量</TabsTrigger>
<TabsTrigger value="dm">密度矩阵</TabsTrigger>
<TabsTrigger value="tn">张量网络</TabsTrigger>
<TabsTrigger value="clifford">Clifford</TabsTrigger>
<TabsTrigger value="stabilizer">稳定子</TabsTrigger>
<TabsTrigger value="mps">MPS</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Simulator Engine 概览</CardTitle><CardDescription>Layer 103 — 状态向量 / 密度矩阵 / 张量网络 / Clifford / 稳定子 / MPS — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="sv">
          <Card><CardHeader><CardTitle>状态向量 (State Vector Sim)</CardTitle><CardDescription>Exact/Sparse/GPU/Distributed/Chunked</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={svType} onValueChange={setSvType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SV_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={svQubits} onChange={(e) => setSvQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>电路深度</Label><Input type="number" value={svDepth} onChange={(e) => setSvDepth(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-simulator/state-vector-sim", {sim_type: svType, num_qubits: svQubits, circuit_depth: svDepth})} disabled={loading}>{loading ? "计算中..." : "SV仿真"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="dm">
          <Card><CardHeader><CardTitle>密度矩阵 (Density Matrix Sim)</CardTitle><CardDescription>Full/Kraus/Superop/Stochastic/MonteCarlo</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={dmType} onValueChange={setDmType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={dmQubits} onChange={(e) => setDmQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>噪声模型</Label><Input type="number" value={dmNoise} onChange={(e) => setDmNoise(e.target.value)}  /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-simulator/density-matrix-sim", {sim_type: dmType, num_qubits: dmQubits, noise_model: dmNoise})} disabled={loading}>{loading ? "计算中..." : "DM仿真"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="tn">
          <Card><CardHeader><CardTitle>张量网络 (Tensor Network Sim)</CardTitle><CardDescription>MPS/MPO/TTN/PEPS/Cotengra</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={tnType} onValueChange={setTnType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={tnQubits} onChange={(e) => setTnQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>键维度</Label><Input type="number" value={tnBond} onChange={(e) => setTnBond(e.target.value)} min={2} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-simulator/tensor-network-sim", {sim_type: tnType, num_qubits: tnQubits, bond_dimension: tnBond})} disabled={loading}>{loading ? "计算中..." : "TN仿真"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="clifford">
          <Card><CardHeader><CardTitle>Clifford (Clifford Sim)</CardTitle><CardDescription>CHP/Tableaux/GraphState/CNOT-H/T</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={cliffordType} onValueChange={setCliffordType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CF_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={cliffordQubits} onChange={(e) => setCliffordQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>门数</Label><Input type="number" value={cliffordGates} onChange={(e) => setCliffordGates(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-simulator/clifford-sim", {sim_type: cliffordType, num_qubits: cliffordQubits, num_gates: cliffordGates})} disabled={loading}>{loading ? "计算中..." : "Clifford仿真"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="stabilizer">
          <Card><CardHeader><CardTitle>稳定子 (Stabilizer Sim)</CardTitle><CardDescription>CHP/Stim/PyMatching/GF2/CSS</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={stabilizerType} onValueChange={setStabilizerType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SB_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>码距</Label><Input type="number" value={stabilizerDistance} onChange={(e) => setStabilizerDistance(e.target.value)} min={3} /></div>
<div className="space-y-2"><Label>轮数</Label><Input type="number" value={stabilizerRounds} onChange={(e) => setStabilizerRounds(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-simulator/stabilizer-sim", {sim_type: stabilizerType, code_distance: stabilizerDistance, num_rounds: stabilizerRounds})} disabled={loading}>{loading ? "计算中..." : "稳定子仿真"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="mps">
          <Card><CardHeader><CardTitle>MPS (MPS Simulator)</CardTitle><CardDescription>Exact/TEBD/TDVP/DMRG/Finite</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={mpsType} onValueChange={setMpsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MPS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={mpsQubits} onChange={(e) => setMpsQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>键维度</Label><Input type="number" value={mpsBondDim} onChange={(e) => setMpsBondDim(e.target.value)} min={2} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-simulator/mps-simulator", {sim_type: mpsType, num_qubits: mpsQubits, bond_dim: mpsBondDim})} disabled={loading}>{loading ? "计算中..." : "MPS仿真"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
