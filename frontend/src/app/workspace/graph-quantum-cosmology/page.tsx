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

const DM_TYPES = [
  { value: "wimp_detection", label: "WIMP" },
  { value: "axion_search", label: "Axion" },
  { value: "dark_matter_halo", label: "Halo" },
  { value: "dark_matter_filament", label: "Filament" },
  { value: "sterile_neutrino_dm", label: "Sterile v" },
  { value: "ai_dark_matter", label: "AI" },
];

const DE_TYPES = [
  { value: "cosmological_constant", label: "Lambda" },
  { value: "quintessence_field", label: "Quintessence" },
  { value: "phantom_energy", label: "Phantom" },
  { value: "modified_gravity_de", label: "Mod. Gravity" },
  { value: "holographic_dark_energy", label: "Holographic" },
  { value: "ai_dark_energy", label: "AI" },
];

const CMB_TYPES = [
  { value: "cmb_power_spectrum", label: "Power Spec." },
  { value: "cmb_polarization", label: "Polarization" },
  { value: "cmb_lensing", label: "Lensing" },
  { value: "cmb_spectral_distortion", label: "Spectral" },
  { value: "cmb_primordial_gw", label: "Primordial GW" },
  { value: "ai_quantum_cmb", label: "AI" },
];

const GW_TYPES = [
  { value: "inspiral_gw", label: "Inspiral" },
  { value: "merger_gw", label: "Merger" },
  { value: "ringdown_gw", label: "Ringdown" },
  { value: "stochastic_gw", label: "Stochastic" },
  { value: "primordial_gw", label: "Primordial" },
  { value: "ai_quantum_grav_wave", label: "AI" },
];

const MV_TYPES = [
  { value: "eternal_inflation_mv", label: "Eternal Infl." },
  { value: "string_landscape_mv", label: "String Land." },
  { value: "quantum_many_worlds", label: "Many Worlds" },
  { value: "cyclic_brane_mv", label: "Cyclic Brane" },
  { value: "simulated_mv", label: "Simulated" },
  { value: "ai_multiverse", label: "AI" },
];

const ORIGIN_TYPES = [
  { value: "big_bang_quantum", label: "Big Bang" },
  { value: "quantum_bounce", label: "Q-Bounce" },
  { value: "string_gas_cosmology", label: "String Gas" },
  { value: "ekpyrotic_origin", label: "Ekpyrotic" },
  { value: "emergent_spacetime", label: "Emergent" },
  { value: "ai_cosmic_origin", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumCosmologyEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [darkmatterType, setDarkmatterType] = useState("wimp_detection");
  const [darkmatterMass, setDarkmatterMass] = useState("100.0");
  const [darkmatterCrossSec, setDarkmatterCrossSec] = useState("0.0000000001");
  const [darkenergyType, setDarkenergyType] = useState("cosmological_constant");
  const [darkenergyW, setDarkenergyW] = useState("-1.0");
  const [darkenergyRedshift, setDarkenergyRedshift] = useState("1100.0");
  const [cmbType, setCmbType] = useState("cmb_power_spectrum");
  const [cmbLmax, setCmbLmax] = useState("2500");
  const [cmbFreq, setCmbFreq] = useState("143.0");
  const [gravwaveType, setGravwaveType] = useState("inspiral_gw");
  const [gravwaveChirpMass, setGravwaveChirpMass] = useState("30.0");
  const [gravwaveDistance, setGravwaveDistance] = useState("1000.0");
  const [multiverseType, setMultiverseType] = useState("eternal_inflation_mv");
  const [multiversePockets, setMultiversePockets] = useState("1000000");
  const [multiverseSamples, setMultiverseSamples] = useState("10000");
  const [originType, setOriginType] = useState("big_bang_quantum");
  const [originPlanckT, setOriginPlanckT] = useState("5.39e-44");
  const [originEntropy, setOriginEntropy] = useState("0.0");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-cosmology/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Cosmology Engine</h1>
          <p className="text-muted-foreground">Layer 93 — 暗物质 / 暗能量 / 量子CMB / 量子引力波 / 多重宇宙 / 宇宙起源</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.341.0</Badge>
          <Badge variant="secondary">Layer 93</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="darkmatter">暗物质</TabsTrigger>
<TabsTrigger value="darkenergy">暗能量</TabsTrigger>
<TabsTrigger value="cmb">量子CMB</TabsTrigger>
<TabsTrigger value="gravwave">量子引力波</TabsTrigger>
<TabsTrigger value="multiverse">多重宇宙</TabsTrigger>
<TabsTrigger value="origin">宇宙起源</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Cosmology Engine 概览</CardTitle><CardDescription>Layer 93 — 暗物质 / 暗能量 / 量子CMB / 量子引力波 / 多重宇宙 / 宇宙起源 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="darkmatter">
          <Card><CardHeader><CardTitle>暗物质 (Dark Matter)</CardTitle><CardDescription>WIMP/Axion/Halo/Filament/Sterile</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={darkmatterType} onValueChange={setDarkmatterType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>质量(GeV)</Label><Input type="number" value={darkmatterMass} onChange={(e) => setDarkmatterMass(e.target.value)} step={1} /></div>
<div className="space-y-2"><Label>截面(pb)</Label><Input type="number" value={darkmatterCrossSec} onChange={(e) => setDarkmatterCrossSec(e.target.value)} step={1e-12} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cosmology/dark-matter", {dm_type: darkmatterType, detection_mass_gev: darkmatterMass, cross_section_pb: darkmatterCrossSec})} disabled={loading}>{loading ? "计算中..." : "探测暗物质"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="darkenergy">
          <Card><CardHeader><CardTitle>暗能量 (Dark Energy)</CardTitle><CardDescription>Lambda/Quintessence/Phantom/Holographic</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={darkenergyType} onValueChange={setDarkenergyType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>状态方程w</Label><Input type="number" value={darkenergyW} onChange={(e) => setDarkenergyW(e.target.value)} step={0.01} /></div>
<div className="space-y-2"><Label>红移范围</Label><Input type="number" value={darkenergyRedshift} onChange={(e) => setDarkenergyRedshift(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cosmology/dark-energy", {de_type: darkenergyType, equation_of_state: darkenergyW, redshift_range: darkenergyRedshift})} disabled={loading}>{loading ? "计算中..." : "暗能量模型"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="cmb">
          <Card><CardHeader><CardTitle>量子CMB (Quantum CMB)</CardTitle><CardDescription>Power Spectrum/Polarization/Lensing/Spectral</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={cmbType} onValueChange={setCmbType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CMB_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>多极最大值</Label><Input type="number" value={cmbLmax} onChange={(e) => setCmbLmax(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>频率(GHz)</Label><Input type="number" value={cmbFreq} onChange={(e) => setCmbFreq(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cosmology/quantum-cmb", {cmb_type: cmbType, multipole_max: cmbLmax, frequency_ghz: cmbFreq})} disabled={loading}>{loading ? "计算中..." : "CMB分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="gravwave">
          <Card><CardHeader><CardTitle>量子引力波 (Quantum GW)</CardTitle><CardDescription>Inspiral/Merger/Ringdown/Stochastic/Primordial</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={gravwaveType} onValueChange={setGravwaveType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GW_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>啁啾质量(Msun)</Label><Input type="number" value={gravwaveChirpMass} onChange={(e) => setGravwaveChirpMass(e.target.value)} step={1} /></div>
<div className="space-y-2"><Label>距离(Mpc)</Label><Input type="number" value={gravwaveDistance} onChange={(e) => setGravwaveDistance(e.target.value)} step={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cosmology/quantum-grav-wave", {gw_type: gravwaveType, chirp_mass_solar: gravwaveChirpMass, distance_mpc: gravwaveDistance})} disabled={loading}>{loading ? "计算中..." : "引力波分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="multiverse">
          <Card><CardHeader><CardTitle>多重宇宙 (Multiverse)</CardTitle><CardDescription>Inflation/String Landscape/Many-Worlds/Cyclic</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={multiverseType} onValueChange={setMultiverseType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MV_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>口袋宇宙数</Label><Input type="number" value={multiversePockets} onChange={(e) => setMultiversePockets(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>人择样本</Label><Input type="number" value={multiverseSamples} onChange={(e) => setMultiverseSamples(e.target.value)} min={100} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cosmology/multiverse", {mv_type: multiverseType, pocket_universe_count: multiversePockets, anthropic_samples: multiverseSamples})} disabled={loading}>{loading ? "计算中..." : "多重宇宙"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="origin">
          <Card><CardHeader><CardTitle>宇宙起源 (Cosmic Origin)</CardTitle><CardDescription>Big Bang/Bounce/String Gas/Ekpyrotic/Emergent</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={originType} onValueChange={setOriginType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ORIGIN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>普朗克时间(s)</Label><Input type="number" value={originPlanckT} onChange={(e) => setOriginPlanckT(e.target.value)} step={1e-45} /></div>
<div className="space-y-2"><Label>初始熵</Label><Input type="number" value={originEntropy} onChange={(e) => setOriginEntropy(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cosmology/cosmic-origin", {origin_type: originType, planck_time_s: originPlanckT, initial_entropy: originEntropy})} disabled={loading}>{loading ? "计算中..." : "起源模拟"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
