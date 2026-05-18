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

const SC_TYPES = [
  { value: "transmon_qubit", label: "Transmon" },
  { value: "xmon_qubit", label: "Xmon" },
  { value: "flux_qubit", label: "Flux" },
  { value: "phase_qubit", label: "Phase" },
  { value: "cshunt_flux", label: "C-Shunt" },
  { value: "ai_superconducting", label: "AI" },
];

const ION_TYPES = [
  { value: "surface_trap", label: "Surface" },
  { value: "paul_trap", label: "Paul" },
  { value: "linear_trap", label: "Linear" },
  { value: "penning_trap", label: "Penning" },
  { value: "junction_trap", label: "Junction" },
  { value: "ai_ion_trap", label: "AI" },
];

const PH_TYPES = [
  { value: "dual_rail", label: "Dual-Rail" },
  { value: "time_bin", label: "Time-Bin" },
  { value: "gv_kernel", label: "Gottesman-Knill" },
  { value: "squeezed_light", label: "Squeezed" },
  { value: "waveguide_qubit", label: "Waveguide" },
  { value: "ai_photonic", label: "AI" },
];

const TOPO_TYPES = [
  { value: "majorana_wire", label: "Majorana" },
  { value: "anyon_braid", label: "Anyon" },
  { value: "fractional_qh", label: "FQH" },
  { value: "topological_insulator", label: "TI" },
  { value: "weyl_semimetal", label: "Weyl" },
  { value: "ai_topological", label: "AI" },
];

const CRYO_TYPES = [
  { value: "cryo_cmos", label: "Cryo-CMOS" },
  { value: "sfq_control", label: "SFQ" },
  { value: "cryo_fpga", label: "Cryo-FPGA" },
  { value: "mux_readout", label: "MUX Readout" },
  { value: "parametric_amp", label: "Paramp" },
  { value: "ai_cryo_control", label: "AI" },
];

const ARCH_TYPES = [
  { value: "monolithic_2d", label: "Monolithic 2D" },
  { value: "flip_chip_3d", label: "Flip-Chip 3D" },
  { value: "multi_chip_module", label: "MCM" },
  { value: "silicon_interposer", label: "Interposer" },
  { value: "optical_interconnect", label: "Optical" },
  { value: "ai_chip_arch", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumChipDesignEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [scType, setScType] = useState("transmon_qubit");
  const [scFreq, setScFreq] = useState("5.0");
  const [scAnharm, setScAnharm] = useState("-300.0");
  const [ionType, setIonType] = useState("surface_trap");
  const [ionSpecies, setIonSpecies] = useState("yb171");
  const [ionIons, setIonIons] = useState("32");
  const [photonicType, setPhotonicType] = useState("dual_rail");
  const [photonicWavelength, setPhotonicWavelength] = useState("1550.0");
  const [photonicLoss, setPhotonicLoss] = useState("0.1");
  const [topoType, setTopoType] = useState("majorana_wire");
  const [topoGap, setTopoGap] = useState("0.1");
  const [topoWire, setTopoWire] = useState("500.0");
  const [cryoType, setCryoType] = useState("cryo_cmos");
  const [cryoTemp, setCryoTemp] = useState("15.0");
  const [cryoChannels, setCryoChannels] = useState("128");
  const [archType, setArchType] = useState("monolithic_2d");
  const [archQubits, setArchQubits] = useState("1000");
  const [archYield, setArchYield] = useState("95.0");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-chip-design/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Chip Design Engine</h1>
          <p className="text-muted-foreground">Layer 99 — 超导比特 / 离子阱 / 光子比特 / 拓扑比特 / 低温控制 / 芯片架构</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.347.0</Badge>
          <Badge variant="secondary">Layer 99</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="sc">超导比特</TabsTrigger>
<TabsTrigger value="ion">离子阱</TabsTrigger>
<TabsTrigger value="photonic">光子比特</TabsTrigger>
<TabsTrigger value="topo">拓扑比特</TabsTrigger>
<TabsTrigger value="cryo">低温控制</TabsTrigger>
<TabsTrigger value="arch">芯片架构</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Chip Design Engine 概览</CardTitle><CardDescription>Layer 99 — 超导比特 / 离子阱 / 光子比特 / 拓扑比特 / 低温控制 / 芯片架构 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="sc">
          <Card><CardHeader><CardTitle>超导比特 (Superconducting Qubit)</CardTitle><CardDescription>Transmon/Xmon/Flux/Phase/C-Shunt</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={scType} onValueChange={setScType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>频率(GHz)</Label><Input type="number" value={scFreq} onChange={(e) => setScFreq(e.target.value)} step={0.1} /></div>
<div className="space-y-2"><Label>非谐性(MHz)</Label><Input type="number" value={scAnharm} onChange={(e) => setScAnharm(e.target.value)} step={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chip-design/superconducting-qubit", {sc_type: scType, qubit_frequency_ghz: scFreq, anharmonicity_mhz: scAnharm})} disabled={loading}>{loading ? "计算中..." : "超导设计"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ion">
          <Card><CardHeader><CardTitle>离子阱 (Ion Trap Qubit)</CardTitle><CardDescription>Surface/Paul/Linear/Penning/Junction</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ionType} onValueChange={setIonType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>离子种类</Label><Input type="number" value={ionSpecies} onChange={(e) => setIonSpecies(e.target.value)}  /></div>
<div className="space-y-2"><Label>离子数</Label><Input type="number" value={ionIons} onChange={(e) => setIonIons(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chip-design/ion-trap-qubit", {ion_type: ionType, ion_species: ionSpecies, num_ions: ionIons})} disabled={loading}>{loading ? "计算中..." : "离子阱设计"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="photonic">
          <Card><CardHeader><CardTitle>光子比特 (Photonic Qubit)</CardTitle><CardDescription>Dual-Rail/Time-Bin/GV/Squeezed/Waveguide</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={photonicType} onValueChange={setPhotonicType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PH_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>波长(nm)</Label><Input type="number" value={photonicWavelength} onChange={(e) => setPhotonicWavelength(e.target.value)} step={1} /></div>
<div className="space-y-2"><Label>损耗(dB/cm)</Label><Input type="number" value={photonicLoss} onChange={(e) => setPhotonicLoss(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chip-design/photonic-qubit", {photonic_type: photonicType, wavelength_nm: photonicWavelength, loss_db_per_cm: photonicLoss})} disabled={loading}>{loading ? "计算中..." : "光子设计"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="topo">
          <Card><CardHeader><CardTitle>拓扑比特 (Topological Qubit)</CardTitle><CardDescription>Majorana/Anyon/FQH/Insulator/Weyl</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={topoType} onValueChange={setTopoType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TOPO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>拓扑能隙(meV)</Label><Input type="number" value={topoGap} onChange={(e) => setTopoGap(e.target.value)} step={0.01} /></div>
<div className="space-y-2"><Label>纳米线长度(nm)</Label><Input type="number" value={topoWire} onChange={(e) => setTopoWire(e.target.value)} step={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chip-design/topological-qubit", {topo_type: topoType, gap_mev: topoGap, nanowire_length_nm: topoWire})} disabled={loading}>{loading ? "计算中..." : "拓扑设计"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="cryo">
          <Card><CardHeader><CardTitle>低温控制 (Cryogenic Control)</CardTitle><CardDescription>Cryo-CMOS/SFQ/Cryo-FPGA/MUX/Paramp</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={cryoType} onValueChange={setCryoType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CRYO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>温度(mK)</Label><Input type="number" value={cryoTemp} onChange={(e) => setCryoTemp(e.target.value)} step={1} /></div>
<div className="space-y-2"><Label>通道数</Label><Input type="number" value={cryoChannels} onChange={(e) => setCryoChannels(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chip-design/cryogenic-control", {cryo_type: cryoType, temperature_mk: cryoTemp, num_channels: cryoChannels})} disabled={loading}>{loading ? "计算中..." : "低温分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="arch">
          <Card><CardHeader><CardTitle>芯片架构 (Chip Architecture)</CardTitle><CardDescription>Monolithic/Flip-Chip/MCM/Interposer/Optical</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={archType} onValueChange={setArchType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ARCH_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>量子比特数</Label><Input type="number" value={archQubits} onChange={(e) => setArchQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>良率目标(%)</Label><Input type="number" value={archYield} onChange={(e) => setArchYield(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-chip-design/chip-architecture", {arch_type: archType, num_qubits: archQubits, yield_target_pct: archYield})} disabled={loading}>{loading ? "计算中..." : "架构设计"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
