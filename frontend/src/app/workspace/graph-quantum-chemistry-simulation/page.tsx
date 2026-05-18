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

const ELECTRONIC_TYPES = [
  { value: "vqe_chemistry", label: "VQE Chemistry" },
  { value: "quantum_phase_est", label: "QPE" },
  { value: "quantum_ccsd", label: "QCCSD" },
  { value: "quantum_casscf", label: "CASSCF" },
  { value: "quantum_dft", label: "QDFT" },
  { value: "ai_electronic_structure", label: "AI" },
];

const ORBITAL_TYPES = [
  { value: "sto3g_basis", label: "STO-3G" },
  { value: "cc_pvdz_basis", label: "cc-pVDZ" },
  { value: "cc_pvtz_basis", label: "cc-pVTZ" },
  { value: "aug_cc_pvtz", label: "aug-cc-pVTZ" },
  { value: "minimal_basis", label: "Minimal" },
  { value: "ai_molecular_orbital", label: "AI" },
];

const DYNAMICS_TYPES = [
  { value: "real_time_propagation", label: "Real-Time" },
  { value: "imaginary_time", label: "Imaginary" },
  { value: "time_dependent_hf", label: "TD-HF" },
  { value: "nonadiabatic_dynamics", label: "Nonadiabatic" },
  { value: "vibronic_coupling", label: "Vibronic" },
  { value: "ai_quantum_dynamics", label: "AI" },
];

const REACTION_TYPES = [
  { value: "transition_state_search", label: "TS Search" },
  { value: "intrinsic_reaction_coord", label: "IRC" },
  { value: "minimum_energy_path", label: "MEP" },
  { value: "surface_hopping", label: "Surface Hopping" },
  { value: "conical_intersection", label: "Conical Int." },
  { value: "ai_reaction_pathway", label: "AI" },
];

const SPECTROSCOPY_TYPES = [
  { value: "uv_vis_spectrum", label: "UV-Vis" },
  { value: "ir_spectrum", label: "IR" },
  { value: "raman_spectrum", label: "Raman" },
  { value: "nmr_spectrum", label: "NMR" },
  { value: "esr_spectrum", label: "ESR" },
  { value: "ai_spectroscopy", label: "AI" },
];

const CATALYSIS_TYPES = [
  { value: "homogeneous_catalysis", label: "Homogeneous" },
  { value: "heterogeneous_catalysis", label: "Heterogeneous" },
  { value: "enzymatic_catalysis", label: "Enzymatic" },
  { value: "photocatalysis", label: "Photocatalysis" },
  { value: "electrocatalysis", label: "Electrocatalysis" },
  { value: "ai_quantum_catalysis", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumChemistrySimulationEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [electronicType, setElectronicType] = useState("vqe_chemistry");
  const [electronicElectrons, setElectronicElectrons] = useState("10");
  const [electronicOrbitals, setElectronicOrbitals] = useState("20");
  const [orbitalType, setOrbitalType] = useState("sto3g_basis");
  const [orbitalMol, setOrbitalMol] = useState("H2O");
  const [orbitalAtoms, setOrbitalAtoms] = useState("3");
  const [dynamicsType, setDynamicsType] = useState("real_time_propagation");
  const [dynamicsTime, setDynamicsTime] = useState("100.0");
  const [dynamicsStep, setDynamicsStep] = useState("0.5");
  const [reactionType, setReactionType] = useState("transition_state_search");
  const [reactionReactants, setReactionReactants] = useState("2");
  const [reactionTemp, setReactionTemp] = useState("298.15");
  const [spectroscopyType, setSpectroscopyType] = useState("uv_vis_spectrum");
  const [spectroscopyRange, setSpectroscopyRange] = useState("10.0");
  const [spectroscopyRes, setSpectroscopyRes] = useState("0.01");
  const [catalysisType, setCatalysisType] = useState("homogeneous_catalysis");
  const [catalysisSites, setCatalysisSites] = useState("1");
  const [catalysisTemp, setCatalysisTemp] = useState("350.0");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-chemistry-simulation/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Chemistry Simulation Engine</h1>
          <p className="text-muted-foreground">Layer 86 — 电子结构 / 分子轨道 / 量子动力学 / 反应路径 / 光谱学 / 量子催化</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.334.0</Badge>
          <Badge variant="secondary">Layer 86</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="electronic">电子结构</TabsTrigger>
<TabsTrigger value="orbital">分子轨道</TabsTrigger>
<TabsTrigger value="dynamics">量子动力学</TabsTrigger>
<TabsTrigger value="reaction">反应路径</TabsTrigger>
<TabsTrigger value="spectroscopy">光谱学</TabsTrigger>
<TabsTrigger value="catalysis">量子催化</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Chemistry Simulation Engine 概览</CardTitle><CardDescription>Layer 86 — 电子结构 / 分子轨道 / 量子动力学 / 反应路径 / 光谱学 / 量子催化 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="electronic">
          <Card><CardHeader><CardTitle>电子结构 (Electronic Structure)</CardTitle><CardDescription>VQE/QPE/QCCSD/CASSCF/QDFT</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={electronicType} onValueChange={setElectronicType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ELECTRONIC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>电子数</Label><Input type="number" value={electronicElectrons} onChange={(e) => setElectronicElectrons(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>轨道数</Label><Input type="number" value={electronicOrbitals} onChange={(e) => setElectronicOrbitals(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chemistry-simulation/electronic-structure", {method_type: electronicType, num_electrons: electronicElectrons, num_orbitals: electronicOrbitals})} disabled={loading}>{loading ? "计算中..." : "计算电子结构"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="orbital">
          <Card><CardHeader><CardTitle>分子轨道 (Molecular Orbital)</CardTitle><CardDescription>STO-3G/cc-pVDZ/cc-pVTZ</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={orbitalType} onValueChange={setOrbitalType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ORBITAL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>分子</Label><Input type="number" value={orbitalMol} onChange={(e) => setOrbitalMol(e.target.value)} type="text" /></div>
<div className="space-y-2"><Label>原子数</Label><Input type="number" value={orbitalAtoms} onChange={(e) => setOrbitalAtoms(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chemistry-simulation/molecular-orbital", {orbital_type: orbitalType, molecule: orbitalMol, num_atoms: orbitalAtoms})} disabled={loading}>{loading ? "计算中..." : "分析分子轨道"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="dynamics">
          <Card><CardHeader><CardTitle>量子动力学 (Quantum Dynamics)</CardTitle><CardDescription>Real-Time/Imaginary/TD-HF</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={dynamicsType} onValueChange={setDynamicsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DYNAMICS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>时间(fs)</Label><Input type="number" value={dynamicsTime} onChange={(e) => setDynamicsTime(e.target.value)} step={0.1} /></div>
<div className="space-y-2"><Label>步长(fs)</Label><Input type="number" value={dynamicsStep} onChange={(e) => setDynamicsStep(e.target.value)} step={0.1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chemistry-simulation/quantum-dynamics", {dynamics_type: dynamicsType, simulation_time_fs: dynamicsTime, timestep_fs: dynamicsStep})} disabled={loading}>{loading ? "计算中..." : "模拟动力学"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="reaction">
          <Card><CardHeader><CardTitle>反应路径 (Reaction Pathway)</CardTitle><CardDescription>TS/IRC/MEP/Surface Hopping</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={reactionType} onValueChange={setReactionType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REACTION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>反应物数</Label><Input type="number" value={reactionReactants} onChange={(e) => setReactionReactants(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>温度(K)</Label><Input type="number" value={reactionTemp} onChange={(e) => setReactionTemp(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chemistry-simulation/reaction-pathway", {pathway_type: reactionType, num_reactants: reactionReactants, temperature_k: reactionTemp})} disabled={loading}>{loading ? "计算中..." : "计算反应"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="spectroscopy">
          <Card><CardHeader><CardTitle>光谱学 (Spectroscopy)</CardTitle><CardDescription>UV-Vis/IR/Raman/NMR/ESR</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={spectroscopyType} onValueChange={setSpectroscopyType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SPECTROSCOPY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>能量范围(eV)</Label><Input type="number" value={spectroscopyRange} onChange={(e) => setSpectroscopyRange(e.target.value)} step={0.1} /></div>
<div className="space-y-2"><Label>分辨率(eV)</Label><Input type="number" value={spectroscopyRes} onChange={(e) => setSpectroscopyRes(e.target.value)} step={0.001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chemistry-simulation/spectroscopy", {spectroscopy_type: spectroscopyType, energy_range_ev: spectroscopyRange, resolution_ev: spectroscopyRes})} disabled={loading}>{loading ? "计算中..." : "计算光谱"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="catalysis">
          <Card><CardHeader><CardTitle>量子催化 (Quantum Catalysis)</CardTitle><CardDescription>Homo/Hetero/Enzymatic/Photo/Electro</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={catalysisType} onValueChange={setCatalysisType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATALYSIS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>活性位点数</Label><Input type="number" value={catalysisSites} onChange={(e) => setCatalysisSites(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>温度(K)</Label><Input type="number" value={catalysisTemp} onChange={(e) => setCatalysisTemp(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chemistry-simulation/quantum-catalysis", {catalysis_type: catalysisType, num_active_sites: catalysisSites, temperature_k: catalysisTemp})} disabled={loading}>{loading ? "计算中..." : "分析催化"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
