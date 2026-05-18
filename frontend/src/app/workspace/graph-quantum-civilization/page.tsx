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

const CIV_TYPES = [
  { value: "kardashev_type_1", label: "Type I" },
  { value: "kardashev_type_2", label: "Type II" },
  { value: "kardashev_type_3", label: "Type III" },
  { value: "dyson_sphere_sim", label: "Dyson Sphere" },
  { value: "matrioshka_brain", label: "Matrioshka" },
  { value: "ai_quantum_civilization", label: "AI" },
];

const FERMI_TYPES = [
  { value: "great_filter_analysis", label: "Great Filter" },
  { value: "dark_forest_theory", label: "Dark Forest" },
  { value: "zoo_hypothesis_sim", label: "Zoo" },
  { value: "rare_earth_hypothesis", label: "Rare Earth" },
  { value: "simulation_hypothesis", label: "Simulation" },
  { value: "ai_fermi_paradox", label: "AI" },
];

const COMM_TYPES = [
  { value: "quantum_radio_laser", label: "Radio Laser" },
  { value: "gravitational_wave_comm", label: "GW Comm" },
  { value: "quantum_entangle_comm", label: "Entangle" },
  { value: "neutrino_beam_comm", label: "Neutrino" },
  { value: "warp_signal_comm", label: "Warp" },
  { value: "ai_interstellar_comm", label: "AI" },
];

const EVO_TYPES = [
  { value: "technological_singularity", label: "Singularity" },
  { value: "cultural_evolution_sim", label: "Cultural" },
  { value: "societal_collapse_model", label: "Collapse" },
  { value: "post_scarcity_sim", label: "Post-Scarcity" },
  { value: "transcension_hypothesis", label: "Transcension" },
  { value: "ai_civilization_evo", label: "AI" },
];

const TERRA_TYPES = [
  { value: "planetary_engineering", label: "Planetary" },
  { value: "atmosphere_synthesis", label: "Atmosphere" },
  { value: "biosphere_design", label: "Biosphere" },
  { value: "magnetosphere_generation", label: "Magnetosphere" },
  { value: "stellar_engineering", label: "Stellar" },
  { value: "ai_quantum_terraforming", label: "AI" },
];

const EXPLORE_TYPES = [
  { value: "warp_drive_sim", label: "Warp Drive" },
  { value: "wormhole_traversal", label: "Wormhole" },
  { value: "alcubierre_metric", label: "Alcubierre" },
  { value: "quantum_teleportation_space", label: "Teleport" },
  { value: "generation_ship_sim", label: "Gen. Ship" },
  { value: "ai_quantum_exploration", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumCivilizationEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [civType, setCivType] = useState("kardashev_type_1");
  const [civEnergy, setCivEnergy] = useState("100000000000000000000000000");
  const [civPop, setCivPop] = useState("10.0");
  const [fermiType, setFermiType] = useState("great_filter_analysis");
  const [fermiRadius, setFermiRadius] = useState("44000000000");
  const [fermiSensitivity, setFermiSensitivity] = useState("0.00000000000000000001");
  const [commType, setCommType] = useState("quantum_radio_laser");
  const [commDistance, setCommDistance] = useState("4.37");
  const [commBW, setCommBW] = useState("1.0");
  const [evoType, setEvoType] = useState("technological_singularity");
  const [evoTimeline, setEvoTimeline] = useState("10000");
  const [evoInnovRate, setEvoInnovRate] = useState("0.05");
  const [terraformType, setTerraformType] = useState("planetary_engineering");
  const [terraformRadius, setTerraformRadius] = useState("6371.0");
  const [terraformTemp, setTerraformTemp] = useState("288.0");
  const [exploreType, setExploreType] = useState("warp_drive_sim");
  const [exploreDistance, setExploreDistance] = useState("100.0");
  const [exploreCrew, setExploreCrew] = useState("1000");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-civilization/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Civilization Engine</h1>
          <p className="text-muted-foreground">Layer 95 — 卡尔达肖夫文明 / 费米悖论 / 星际通信 / 文明演化 / 量子改造 / 量子探索</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.343.0</Badge>
          <Badge variant="secondary">Layer 95</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="civilization">量子文明</TabsTrigger>
<TabsTrigger value="fermi">费米悖论</TabsTrigger>
<TabsTrigger value="interstellar">星际通信</TabsTrigger>
<TabsTrigger value="evolution">文明演化</TabsTrigger>
<TabsTrigger value="terraform">量子改造</TabsTrigger>
<TabsTrigger value="explore">量子探索</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Civilization Engine 概览</CardTitle><CardDescription>Layer 95 — 卡尔达肖夫文明 / 费米悖论 / 星际通信 / 文明演化 / 量子改造 / 量子探索 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="civilization">
          <Card><CardHeader><CardTitle>量子文明 (Quantum Civilization)</CardTitle><CardDescription>Kardashev I/II/III/Dyson/Matrioshka</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={civType} onValueChange={setCivType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CIV_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>能量输出(W)</Label><Input type="number" value={civEnergy} onChange={(e) => setCivEnergy(e.target.value)} step={1e20} /></div>
<div className="space-y-2"><Label>人口(十亿)</Label><Input type="number" value={civPop} onChange={(e) => setCivPop(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-civilization/quantum-civilization", {civ_type: civType, energy_output_w: civEnergy, population_billions: civPop})} disabled={loading}>{loading ? "计算中..." : "文明模拟"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="fermi">
          <Card><CardHeader><CardTitle>费米悖论 (Fermi Paradox)</CardTitle><CardDescription>Great Filter/Dark Forest/Zoo/Rare Earth</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={fermiType} onValueChange={setFermiType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FERMI_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>可观测半径(ly)</Label><Input type="number" value={fermiRadius} onChange={(e) => setFermiRadius(e.target.value)} step={1e9} /></div>
<div className="space-y-2"><Label>探测灵敏度</Label><Input type="number" value={fermiSensitivity} onChange={(e) => setFermiSensitivity(e.target.value)} step={1e-22} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-civilization/fermi-paradox", {fermi_type: fermiType, observable_universe_radius_ly: fermiRadius, detection_sensitivity: fermiSensitivity})} disabled={loading}>{loading ? "计算中..." : "费米分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="interstellar">
          <Card><CardHeader><CardTitle>星际通信 (Interstellar Comm)</CardTitle><CardDescription>Radio/GravWave/Entangle/Neutrino/Warp</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={commType} onValueChange={setCommType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COMM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>距离(ly)</Label><Input type="number" value={commDistance} onChange={(e) => setCommDistance(e.target.value)} step={0.01} /></div>
<div className="space-y-2"><Label>带宽(Tbps)</Label><Input type="number" value={commBW} onChange={(e) => setCommBW(e.target.value)} step={0.1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-civilization/interstellar-comm", {comm_type: commType, distance_ly: commDistance, bandwidth_tbps: commBW})} disabled={loading}>{loading ? "计算中..." : "星际通信"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="evolution">
          <Card><CardHeader><CardTitle>文明演化 (Civilization Evolution)</CardTitle><CardDescription>Singularity/Cultural/Collapse/Post-Scarcity</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={evoType} onValueChange={setEvoType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EVO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>时间线(年)</Label><Input type="number" value={evoTimeline} onChange={(e) => setEvoTimeline(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>创新率</Label><Input type="number" value={evoInnovRate} onChange={(e) => setEvoInnovRate(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-civilization/civilization-evolution", {evo_type: evoType, timeline_years: evoTimeline, innovation_rate: evoInnovRate})} disabled={loading}>{loading ? "计算中..." : "演化模拟"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="terraform">
          <Card><CardHeader><CardTitle>量子改造 (Quantum Terraforming)</CardTitle><CardDescription>Planetary/Atmosphere/Biosphere/Magnetosphere</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={terraformType} onValueChange={setTerraformType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TERRA_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>半径(km)</Label><Input type="number" value={terraformRadius} onChange={(e) => setTerraformRadius(e.target.value)} step={100} /></div>
<div className="space-y-2"><Label>温度(K)</Label><Input type="number" value={terraformTemp} onChange={(e) => setTerraformTemp(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-civilization/quantum-terraforming", {terra_type: terraformType, target_radius_km: terraformRadius, current_temp_k: terraformTemp})} disabled={loading}>{loading ? "计算中..." : "改造分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="explore">
          <Card><CardHeader><CardTitle>量子探索 (Quantum Exploration)</CardTitle><CardDescription>Warp/Wormhole/Alcubierre/Teleport/Generation</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={exploreType} onValueChange={setExploreType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EXPLORE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>距离(ly)</Label><Input type="number" value={exploreDistance} onChange={(e) => setExploreDistance(e.target.value)} step={1} /></div>
<div className="space-y-2"><Label>船员数</Label><Input type="number" value={exploreCrew} onChange={(e) => setExploreCrew(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-civilization/quantum-exploration", {explore_type: exploreType, target_distance_ly: exploreDistance, crew_size: exploreCrew})} disabled={loading}>{loading ? "计算中..." : "探索模拟"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
