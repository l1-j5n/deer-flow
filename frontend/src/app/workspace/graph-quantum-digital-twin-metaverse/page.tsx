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

const VR_TYPES = [
  { value: "quantum_rendering_vr", label: "Rendering" },
  { value: "quantum_haptic_feedback", label: "Haptic" },
  { value: "quantum_spatial_audio", label: "Spatial Audio" },
  { value: "quantum_presence_sim", label: "Presence" },
  { value: "quantum_immersion_engine", label: "Immersion" },
  { value: "ai_quantum_vr", label: "AI" },
];

const HOLO_TYPES = [
  { value: "quantum_light_field", label: "Light Field" },
  { value: "quantum_volume_display", label: "Volume" },
  { value: "quantum_wavefront_synth", label: "Wavefront" },
  { value: "quantum_interference_pattern", label: "Interference" },
  { value: "quantum_3d_projection", label: "3D Project" },
  { value: "ai_quantum_holographic", label: "AI" },
];

const SIM_TYPES = [
  { value: "quantum_physics_sim", label: "Physics" },
  { value: "quantum_weather_sim", label: "Weather" },
  { value: "quantum_traffic_sim", label: "Traffic" },
  { value: "quantum_urban_sim", label: "Urban" },
  { value: "quantum_disaster_sim", label: "Disaster" },
  { value: "ai_quantum_sim_world", label: "AI" },
];

const IDENTITY_TYPES = [
  { value: "quantum_did", label: "DID" },
  { value: "quantum_verifiable_credential", label: "VC" },
  { value: "quantum_zero_knowledge_id", label: "ZK-ID" },
  { value: "quantum_soul_bound", label: "Soul-Bound" },
  { value: "quantum_reputation_token", label: "Reputation" },
  { value: "ai_quantum_identity", label: "AI" },
];

const ECONOMIC_TYPES = [
  { value: "quantum_market_sim", label: "Market" },
  { value: "quantum_game_theory", label: "Game Theory" },
  { value: "quantum_auction_sim", label: "Auction" },
  { value: "quantum_supply_chain", label: "Supply Chain" },
  { value: "quantum_resource_alloc", label: "Resource" },
  { value: "ai_quantum_economic", label: "AI" },
];

const SOCIAL_TYPES = [
  { value: "quantum_opinion_dynamics", label: "Opinion" },
  { value: "quantum_network_formation", label: "Network" },
  { value: "quantum_collective_behavior", label: "Collective" },
  { value: "quantum_cultural_evolution", label: "Cultural" },
  { value: "quantum_cooperation_sim", label: "Cooperation" },
  { value: "ai_quantum_social", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumDigitalTwinMetaverseEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [vrType, setVrType] = useState("quantum_rendering_vr");
  const [vrResolution, setVrResolution] = useState("4096");
  const [vrFPS, setVrFPS] = useState("120.0");
  const [holoType, setHoloType] = useState("quantum_light_field");
  const [holoVoxels, setHoloVoxels] = useState("1000000");
  const [holoLayers, setHoloLayers] = useState("32");
  const [simworldType, setSimworldType] = useState("quantum_physics_sim");
  const [simworldAgents, setSimworldAgents] = useState("100000");
  const [simworldScale, setSimworldScale] = useState("100.0");
  const [identityType, setIdentityType] = useState("quantum_did");
  const [identityCredentials, setIdentityCredentials] = useState("50");
  const [identityDepth, setIdentityDepth] = useState("5");
  const [economicType, setEconomicType] = useState("quantum_market_sim");
  const [economicAgents, setEconomicAgents] = useState("10000");
  const [economicRounds, setEconomicRounds] = useState("1000");
  const [socialType, setSocialType] = useState("quantum_opinion_dynamics");
  const [socialPopulation, setSocialPopulation] = useState("100000");
  const [socialRounds, setSocialRounds] = useState("500");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-digital-twin-metaverse/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Digital Twin Metaverse Engine</h1>
          <p className="text-muted-foreground">Layer 92 — 量子VR / 量子全息 / 量子仿真世界 / 量子数字身份 / 量子经济 / 量子社会</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.340.0</Badge>
          <Badge variant="secondary">Layer 92</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="vr">量子VR</TabsTrigger>
<TabsTrigger value="holographic">量子全息</TabsTrigger>
<TabsTrigger value="simworld">量子仿真</TabsTrigger>
<TabsTrigger value="identity">量子身份</TabsTrigger>
<TabsTrigger value="economic">量子经济</TabsTrigger>
<TabsTrigger value="social">量子社会</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Digital Twin Metaverse Engine 概览</CardTitle><CardDescription>Layer 92 — 量子VR / 量子全息 / 量子仿真世界 / 量子数字身份 / 量子经济 / 量子社会 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="vr">
          <Card><CardHeader><CardTitle>量子VR (Quantum VR)</CardTitle><CardDescription>Rendering/Haptic/Spatial Audio/Presence/Immersion</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={vrType} onValueChange={setVrType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VR_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>分辨率(px)</Label><Input type="number" value={vrResolution} onChange={(e) => setVrResolution(e.target.value)} min={256} /></div>
<div className="space-y-2"><Label>帧率</Label><Input type="number" value={vrFPS} onChange={(e) => setVrFPS(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin-metaverse/quantum-vr", {vr_type: vrType, resolution_pixels: vrResolution, frame_rate_fps: vrFPS})} disabled={loading}>{loading ? "计算中..." : "VR模拟"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="holographic">
          <Card><CardHeader><CardTitle>量子全息 (Quantum Holographic)</CardTitle><CardDescription>Light Field/Volume/Wavefront/Interference/3D</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={holoType} onValueChange={setHoloType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{HOLO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>体素数</Label><Input type="number" value={holoVoxels} onChange={(e) => setHoloVoxels(e.target.value)} min={10000} /></div>
<div className="space-y-2"><Label>光场层数</Label><Input type="number" value={holoLayers} onChange={(e) => setHoloLayers(e.target.value)} min={4} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin-metaverse/quantum-holographic", {holo_type: holoType, voxel_count: holoVoxels, light_field_layers: holoLayers})} disabled={loading}>{loading ? "计算中..." : "全息渲染"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="simworld">
          <Card><CardHeader><CardTitle>量子仿真 (Quantum Sim World)</CardTitle><CardDescription>Physics/Weather/Traffic/Urban/Disaster</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={simworldType} onValueChange={setSimworldType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SIM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>智能体数</Label><Input type="number" value={simworldAgents} onChange={(e) => setSimworldAgents(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>空间尺度(km)</Label><Input type="number" value={simworldScale} onChange={(e) => setSimworldScale(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin-metaverse/quantum-sim-world", {sim_type: simworldType, agent_count: simworldAgents, spatial_scale_km: simworldScale})} disabled={loading}>{loading ? "计算中..." : "世界仿真"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="identity">
          <Card><CardHeader><CardTitle>量子身份 (Quantum Identity)</CardTitle><CardDescription>DID/VC/ZK-ID/Soul-Bound/Reputation</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={identityType} onValueChange={setIdentityType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{IDENTITY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>凭证数</Label><Input type="number" value={identityCredentials} onChange={(e) => setIdentityCredentials(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>验证深度</Label><Input type="number" value={identityDepth} onChange={(e) => setIdentityDepth(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin-metaverse/quantum-identity", {identity_type: identityType, credential_count: identityCredentials, verification_depth: identityDepth})} disabled={loading}>{loading ? "计算中..." : "身份验证"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="economic">
          <Card><CardHeader><CardTitle>量子经济 (Quantum Economic)</CardTitle><CardDescription>Market/Game Theory/Auction/Supply/Resource</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={economicType} onValueChange={setEconomicType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ECONOMIC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>经济主体</Label><Input type="number" value={economicAgents} onChange={(e) => setEconomicAgents(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>交易轮数</Label><Input type="number" value={economicRounds} onChange={(e) => setEconomicRounds(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin-metaverse/quantum-economic", {economic_type: economicType, num_agents: economicAgents, num_rounds: economicRounds})} disabled={loading}>{loading ? "计算中..." : "经济仿真"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="social">
          <Card><CardHeader><CardTitle>量子社会 (Quantum Social)</CardTitle><CardDescription>Opinion/Network/Collective/Cultural/Cooperation</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={socialType} onValueChange={setSocialType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SOCIAL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>人口数</Label><Input type="number" value={socialPopulation} onChange={(e) => setSocialPopulation(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>交互轮数</Label><Input type="number" value={socialRounds} onChange={(e) => setSocialRounds(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin-metaverse/quantum-social", {social_type: socialType, population_size: socialPopulation, interaction_rounds: socialRounds})} disabled={loading}>{loading ? "计算中..." : "社会模拟"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
