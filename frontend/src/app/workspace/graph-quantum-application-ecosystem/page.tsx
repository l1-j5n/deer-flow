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

const FIN_TYPES = [
  { value: "portfolio_opt", label: "Portfolio" },
  { value: "risk_analysis", label: "Risk" },
  { value: "option_pricing", label: "Options" },
  { value: "fraud_detection", label: "Fraud" },
  { value: "credit_scoring", label: "Credit" },
  { value: "ai_quant_finance", label: "AI" },
];

const DRUG_TYPES = [
  { value: "molecular_sim", label: "Molecular" },
  { value: "protein_fold", label: "Protein" },
  { value: "drug_interaction", label: "Interaction" },
  { value: "binding_affinity", label: "Binding" },
  { value: "adme_prediction", label: "ADME" },
  { value: "ai_drug_discovery", label: "AI" },
];

const LOG_TYPES = [
  { value: "vehicle_routing", label: "VRP" },
  { value: "supply_chain", label: "Supply Chain" },
  { value: "warehouse_opt", label: "Warehouse" },
  { value: "scheduling_opt", label: "Scheduling" },
  { value: "network_flow", label: "Network" },
  { value: "ai_logistics_opt", label: "AI" },
];

const ENR_TYPES = [
  { value: "grid_optimization", label: "Grid" },
  { value: "battery_design", label: "Battery" },
  { value: "solar_material", label: "Solar" },
  { value: "carbon_capture", label: "Carbon" },
  { value: "fusion_control", label: "Fusion" },
  { value: "ai_energy_opt", label: "AI" },
];

const CLI_TYPES = [
  { value: "weather_pred", label: "Weather" },
  { value: "ocean_model", label: "Ocean" },
  { value: "carbon_cycle", label: "Carbon" },
  { value: "ice_sheet_model", label: "Ice Sheet" },
  { value: "atmospheric_sim", label: "Atmosphere" },
  { value: "ai_climate_model", label: "AI" },
];

const MAT_TYPES = [
  { value: "superconductor", label: "Superconductor" },
  { value: "catalyst_design", label: "Catalyst" },
  { value: "semiconductor", label: "Semiconductor" },
  { value: "polymer_design", label: "Polymer" },
  { value: "magnetic_material", label: "Magnetic" },
  { value: "ai_material_discovery", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumApplicationEcosystemEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [financeType, setFinanceType] = useState("portfolio_opt");
  const [financeAssets, setFinanceAssets] = useState("50");
  const [financeHorizon, setFinanceHorizon] = useState("252");
  const [drugType, setDrugType] = useState("molecular_sim");
  const [drugSize, setDrugSize] = useState("50");
  const [drugTarget, setDrugTarget] = useState("brca1");
  const [logisticsType, setLogisticsType] = useState("vehicle_routing");
  const [logisticsNodes, setLogisticsNodes] = useState("100");
  const [logisticsConstraints, setLogisticsConstraints] = useState("20");
  const [energyType, setEnergyType] = useState("grid_optimization");
  const [energySize, setEnergySize] = useState("500");
  const [energyEfficiency, setEnergyEfficiency] = useState("0.95");
  const [climateType, setClimateType] = useState("weather_pred");
  const [climateGrid, setClimateGrid] = useState("100");
  const [climateForecast, setClimateForecast] = useState("30");
  const [materialsType, setMaterialsType] = useState("superconductor");
  const [materialsAtoms, setMaterialsAtoms] = useState("200");
  const [materialsTemp, setMaterialsTemp] = useState("300.0");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-application-ecosystem/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Application Ecosystem Engine</h1>
          <p className="text-muted-foreground">Layer 104 — 量子金融 / 药物发现 / 物流优化 / 能源优化 / 气候建模 / 材料发现</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.352.0</Badge>
          <Badge variant="secondary">Layer 104</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="finance">量子金融</TabsTrigger>
<TabsTrigger value="drug">药物发现</TabsTrigger>
<TabsTrigger value="logistics">物流优化</TabsTrigger>
<TabsTrigger value="energy">能源优化</TabsTrigger>
<TabsTrigger value="climate">气候建模</TabsTrigger>
<TabsTrigger value="materials">材料发现</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Application Ecosystem Engine 概览</CardTitle><CardDescription>Layer 104 — 量子金融 / 药物发现 / 物流优化 / 能源优化 / 气候建模 / 材料发现 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="finance">
          <Card><CardHeader><CardTitle>量子金融 (Quantum Finance)</CardTitle><CardDescription>Portfolio/Risk/Options/Fraud/Credit</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={financeType} onValueChange={setFinanceType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FIN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>资产数</Label><Input type="number" value={financeAssets} onChange={(e) => setFinanceAssets(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>时间(天)</Label><Input type="number" value={financeHorizon} onChange={(e) => setFinanceHorizon(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-application-ecosystem/quantum-finance", {app_type: financeType, num_assets: financeAssets, time_horizon_days: financeHorizon})} disabled={loading}>{loading ? "计算中..." : "金融分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="drug">
          <Card><CardHeader><CardTitle>药物发现 (Quantum Drug Discovery)</CardTitle><CardDescription>Molecular/Protein/Interaction/Binding/ADME</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={drugType} onValueChange={setDrugType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DRUG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>分子大小</Label><Input type="number" value={drugSize} onChange={(e) => setDrugSize(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>靶蛋白</Label><Input type="number" value={drugTarget} onChange={(e) => setDrugTarget(e.target.value)}  /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-application-ecosystem/quantum-drug", {app_type: drugType, molecule_size: drugSize, target_protein: drugTarget})} disabled={loading}>{loading ? "计算中..." : "药物分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="logistics">
          <Card><CardHeader><CardTitle>物流优化 (Quantum Logistics)</CardTitle><CardDescription>VRP/SupplyChain/Warehouse/Scheduling/Network</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={logisticsType} onValueChange={setLogisticsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LOG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>节点数</Label><Input type="number" value={logisticsNodes} onChange={(e) => setLogisticsNodes(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>约束数</Label><Input type="number" value={logisticsConstraints} onChange={(e) => setLogisticsConstraints(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-application-ecosystem/quantum-logistics", {app_type: logisticsType, num_nodes: logisticsNodes, constraints: logisticsConstraints})} disabled={loading}>{loading ? "计算中..." : "物流分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="energy">
          <Card><CardHeader><CardTitle>能源优化 (Quantum Energy)</CardTitle><CardDescription>Grid/Battery/Solar/Carbon/Fusion</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={energyType} onValueChange={setEnergyType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ENR_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>系统规模</Label><Input type="number" value={energySize} onChange={(e) => setEnergySize(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>效率目标</Label><Input type="number" value={energyEfficiency} onChange={(e) => setEnergyEfficiency(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-application-ecosystem/quantum-energy", {app_type: energyType, system_size: energySize, efficiency_target: energyEfficiency})} disabled={loading}>{loading ? "计算中..." : "能源分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="climate">
          <Card><CardHeader><CardTitle>气候建模 (Quantum Climate)</CardTitle><CardDescription>Weather/Ocean/Carbon/Ice/Atmosphere</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={climateType} onValueChange={setClimateType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CLI_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>网格分辨率</Label><Input type="number" value={climateGrid} onChange={(e) => setClimateGrid(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>预报天数</Label><Input type="number" value={climateForecast} onChange={(e) => setClimateForecast(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-application-ecosystem/quantum-climate", {app_type: climateType, grid_resolution: climateGrid, forecast_days: climateForecast})} disabled={loading}>{loading ? "计算中..." : "气候分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="materials">
          <Card><CardHeader><CardTitle>材料发现 (Quantum Materials)</CardTitle><CardDescription>Superconductor/Catalyst/Semi/Polymer/Magnetic</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={materialsType} onValueChange={setMaterialsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MAT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>原子数</Label><Input type="number" value={materialsAtoms} onChange={(e) => setMaterialsAtoms(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>温度(K)</Label><Input type="number" value={materialsTemp} onChange={(e) => setMaterialsTemp(e.target.value)} step={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-application-ecosystem/quantum-materials", {app_type: materialsType, num_atoms: materialsAtoms, temperature_k: materialsTemp})} disabled={loading}>{loading ? "计算中..." : "材料分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
