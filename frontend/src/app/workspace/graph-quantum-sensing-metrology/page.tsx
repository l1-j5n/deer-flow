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

const CLK_TYPES = [
  { value: "optical_lattice_clock", label: "Optical Lattice" },
  { value: "ion_trap_clock", label: "Ion Trap" },
  { value: "hydrogen_maser", label: "H-Maser" },
  { value: "cs_fountain", label: "Cs Fountain" },
  { value: "nuclear_clock", label: "Nuclear" },
  { value: "ai_clock_stabilize", label: "AI" },
];

const MAG_TYPES = [
  { value: "nv_center", label: "NV-Center" },
  { value: "atomic_magnetometer", label: "Atomic" },
  { value: "squid_magnetometer", label: "SQUID" },
  { value: "opm_magnetometer", label: "OPM" },
  { value: "hall_quantum", label: "Hall" },
  { value: "ai_magnetometer", label: "AI" },
];

const GRAV_TYPES = [
  { value: "atom_interferometer", label: "Atom Intf." },
  { value: "bloch_oscillation", label: "Bloch" },
  { value: "dual_species_grav", label: "Dual Species" },
  { value: "bragg_interferometer", label: "Bragg" },
  { value: "raman_interferometer", label: "Raman" },
  { value: "ai_gravity_map", label: "AI" },
];

const IMG_TYPES = [
  { value: "ghost_imaging", label: "Ghost" },
  { value: "sub_rayleigh", label: "Sub-Rayleigh" },
  { value: "quantum_lidar", label: "Q-LiDAR" },
  { value: "quantum_holography", label: "Holography" },
  { value: "compressive_imaging", label: "Compressive" },
  { value: "ai_image_enhance", label: "AI" },
];

const RADAR_TYPES = [
  { value: "quantum_illumination", label: "Illumination" },
  { value: "entangled_radar", label: "Entangled" },
  { value: "ghost_radar", label: "Ghost" },
  { value: "quantum_mf_radar", label: "MF" },
  { value: "sqi_radar", label: "SQI" },
  { value: "ai_radar_process", label: "AI" },
];

const NAV_TYPES = [
  { value: "quantum_inertial", label: "Inertial" },
  { value: "quantum_gyroscope", label: "Gyroscope" },
  { value: "quantum_gps_alt", label: "GPS-Alt" },
  { value: "atom_interfero_nav", label: "Atom Intf." },
  { value: "quantum_compass", label: "Compass" },
  { value: "ai_nav_fusion", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumSensingMetrologyEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [clockType, setClockType] = useState("optical_lattice_clock");
  const [clockStability, setClockStability] = useState("1e-18");
  const [clockTime, setClockTime] = useState("1.0");
  const [magType, setMagType] = useState("nv_center");
  const [magSensitivity, setMagSensitivity] = useState("1e-15");
  const [magBW, setMagBW] = useState("1000.0");
  const [gravType, setGravType] = useState("atom_interferometer");
  const [gravRes, setGravRes] = useState("1.0");
  const [gravTime, setGravTime] = useState("10.0");
  const [imgType, setImgType] = useState("ghost_imaging");
  const [imgRes, setImgRes] = useState("10.0");
  const [imgFOV, setImgFOV] = useState("5.0");
  const [radarType, setRadarType] = useState("quantum_illumination");
  const [radarRange, setRadarRange] = useState("100.0");
  const [radarSNR, setRadarSNR] = useState("6.0");
  const [navType, setNavType] = useState("quantum_inertial");
  const [navAcc, setNavAcc] = useState("0.01");
  const [navDrift, setNavDrift] = useState("0.001");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-sensing-metrology/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Sensing Metrology Engine</h1>
          <p className="text-muted-foreground">Layer 108 — 量子时钟 / 量子磁力计 / 量子重力仪 / 量子成像 / 量子雷达 / 量子导航</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.356.0</Badge>
          <Badge variant="secondary">Layer 108</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="clock">量子时钟</TabsTrigger>
<TabsTrigger value="mag">磁力计</TabsTrigger>
<TabsTrigger value="grav">重力仪</TabsTrigger>
<TabsTrigger value="img">量子成像</TabsTrigger>
<TabsTrigger value="radar">量子雷达</TabsTrigger>
<TabsTrigger value="nav">量子导航</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Sensing Metrology Engine 概览</CardTitle><CardDescription>Layer 108 — 量子时钟 / 量子磁力计 / 量子重力仪 / 量子成像 / 量子雷达 / 量子导航 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="clock">
          <Card><CardHeader><CardTitle>量子时钟 (Quantum Clock)</CardTitle><CardDescription>OpticalLattice/IonTrap/HMaser/CsFountain/Nuclear</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={clockType} onValueChange={setClockType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CLK_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>稳定度目标</Label><Input type="number" value={clockStability} onChange={(e) => setClockStability(e.target.value)} step={1e-19} /></div>
<div className="space-y-2"><Label>积分时间(s)</Label><Input type="number" value={clockTime} onChange={(e) => setClockTime(e.target.value)} step={0.1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sensing-metrology/quantum-clock", {clock_type: clockType, stability_target: clockStability, integration_time_s: clockTime})} disabled={loading}>{loading ? "计算中..." : "时钟分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="mag">
          <Card><CardHeader><CardTitle>磁力计 (Quantum Magnetometer)</CardTitle><CardDescription>NV-Center/Atomic/SQUID/OPM/Hall</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={magType} onValueChange={setMagType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MAG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>灵敏度(T)</Label><Input type="number" value={magSensitivity} onChange={(e) => setMagSensitivity(e.target.value)} step={1e-16} /></div>
<div className="space-y-2"><Label>带宽(Hz)</Label><Input type="number" value={magBW} onChange={(e) => setMagBW(e.target.value)} step={100} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sensing-metrology/quantum-magnetometer", {sensor_type: magType, sensitivity_ft: magSensitivity, bandwidth_hz: magBW})} disabled={loading}>{loading ? "计算中..." : "磁力分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="grav">
          <Card><CardHeader><CardTitle>重力仪 (Quantum Gravimeter)</CardTitle><CardDescription>AtomInterferometer/Bloch/DualSpecies/Bragg/Raman</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={gravType} onValueChange={setGravType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GRAV_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>分辨率(μGal)</Label><Input type="number" value={gravRes} onChange={(e) => setGravRes(e.target.value)} step={0.1} /></div>
<div className="space-y-2"><Label>测量时间(s)</Label><Input type="number" value={gravTime} onChange={(e) => setGravTime(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sensing-metrology/quantum-gravimeter", {grav_type: gravType, resolution_ugal: gravRes, measurement_time_s: gravTime})} disabled={loading}>{loading ? "计算中..." : "重力分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="img">
          <Card><CardHeader><CardTitle>量子成像 (Quantum Imaging)</CardTitle><CardDescription>Ghost/SubRayleigh/LiDAR/Holography/Compressive</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={imgType} onValueChange={setImgType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{IMG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>分辨率(nm)</Label><Input type="number" value={imgRes} onChange={(e) => setImgRes(e.target.value)} step={1} /></div>
<div className="space-y-2"><Label>视场(mm)</Label><Input type="number" value={imgFOV} onChange={(e) => setImgFOV(e.target.value)} step={0.5} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sensing-metrology/quantum-imaging", {imaging_type: imgType, resolution_nm: imgRes, field_of_view_mm: imgFOV})} disabled={loading}>{loading ? "计算中..." : "成像分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="radar">
          <Card><CardHeader><CardTitle>量子雷达 (Quantum Radar)</CardTitle><CardDescription>Illumination/Entangled/Ghost/MF/SQI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={radarType} onValueChange={setRadarType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RADAR_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>目标距离(km)</Label><Input type="number" value={radarRange} onChange={(e) => setRadarRange(e.target.value)} step={10} /></div>
<div className="space-y-2"><Label>SNR提升(dB)</Label><Input type="number" value={radarSNR} onChange={(e) => setRadarSNR(e.target.value)} step={0.5} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sensing-metrology/quantum-radar", {radar_type: radarType, target_range_km: radarRange, snr_improvement_db: radarSNR})} disabled={loading}>{loading ? "计算中..." : "雷达分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="nav">
          <Card><CardHeader><CardTitle>量子导航 (Quantum Navigation)</CardTitle><CardDescription>Inertial/Gyroscope/GPS-Alt/AtomIntf/Compass</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={navType} onValueChange={setNavType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{NAV_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>精度目标(m)</Label><Input type="number" value={navAcc} onChange={(e) => setNavAcc(e.target.value)} step={0.001} /></div>
<div className="space-y-2"><Label>漂移(°/hr)</Label><Input type="number" value={navDrift} onChange={(e) => setNavDrift(e.target.value)} step={0.0001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sensing-metrology/quantum-navigation", {nav_type: navType, accuracy_target_m: navAcc, drift_rate_deg_per_hr: navDrift})} disabled={loading}>{loading ? "计算中..." : "导航分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
