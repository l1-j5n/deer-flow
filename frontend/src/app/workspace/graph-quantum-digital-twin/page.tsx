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

const DT_TYPES = [
  { value: "physics_based_model", label: "Physics" },
  { value: "data_driven_model", label: "Data-Driven" },
  { value: "hybrid_model", label: "Hybrid" },
  { value: "reduced_order_model", label: "Reduced" },
  { value: "surrogate_model", label: "Surrogate" },
  { value: "ai_generative_model", label: "AI" },
];

const VS_TYPES = [
  { value: "monte_carlo_sim", label: "Monte Carlo" },
  { value: "discrete_event_sim", label: "Discrete" },
  { value: "agent_based_sim", label: "Agent" },
  { value: "system_dynamics_sim", label: "SysDyn" },
  { value: "multi_physics_sim", label: "Multi-Phys" },
  { value: "ai_accelerated_sim", label: "AI" },
];

const PM_TYPES = [
  { value: "vibration_analysis", label: "Vibration" },
  { value: "thermal_monitoring", label: "Thermal" },
  { value: "acoustic_emission", label: "Acoustic" },
  { value: "oil_degradation", label: "Oil" },
  { value: "fatigue_tracking", label: "Fatigue" },
  { value: "ai_prognostic", label: "AI" },
];

const RS_TYPES = [
  { value: "sensor_fusion_sync", label: "Sensor" },
  { value: "edge_cloud_sync", label: "Edge-Cloud" },
  { value: "federated_sync", label: "Federated" },
  { value: "event_driven_sync", label: "Event" },
  { value: "state_estimation_sync", label: "State" },
  { value: "ai_predictive_sync", label: "AI" },
];

const OD_TYPES = [
  { value: "topology_optimization", label: "Topology" },
  { value: "parameter_sweep", label: "Param Sweep" },
  { value: "design_space_exploration", label: "Design" },
  { value: "multi_objective_opt", label: "Multi-Obj" },
  { value: "robust_optimization", label: "Robust" },
  { value: "ai_surrogate_opt", label: "AI" },
];

const PA_TYPES = [
  { value: "what_if_analysis", label: "What-If" },
  { value: "scenario_planning", label: "Scenario" },
  { value: "root_cause_analysis", label: "Root Cause" },
  { value: "anomaly_prediction", label: "Anomaly" },
  { value: "lifecycle_forecast", label: "Lifecycle" },
  { value: "ai_decision_support", label: "AI" },
];

function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumDigitalTwinEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [dtType, setDtType] = useState("physics_based_model");
  const [dtFidelity, setDtFidelity] = useState("5");
  const [dtComp, setDtComp] = useState("50");
  const [vsType, setVsType] = useState("monte_carlo_sim");
  const [vsIter, setVsIter] = useState("10000");
  const [vsHorizon, setVsHorizon] = useState("365");
  const [pmType, setPmType] = useState("vibration_analysis");
  const [pmWindow, setPmWindow] = useState("30");
  const [pmThreshold, setPmThreshold] = useState("0.05");
  const [rsType, setRsType] = useState("sensor_fusion_sync");
  const [rsFreq, setRsFreq] = useState("100");
  const [rsStreams, setRsStreams] = useState("20");
  const [odType, setOdType] = useState("topology_optimization");
  const [odVars, setOdVars] = useState("15");
  const [odConstraints, setOdConstraints] = useState("8");
  const [paType, setPaType] = useState("what_if_analysis");
  const [paScenarios, setPaScenarios] = useState("10");
  const [paHorizon, setPaHorizon] = useState("90");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-digital-twin/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Digital Twin Engine</h1>
          <p className="text-muted-foreground">Layer 117 — 数字孪生建模 / 虚拟仿真 / 预测性维护 / 实时同步 / 优化 / 规范性分析</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.365.0</Badge>
          <Badge variant="secondary">Layer 117</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="dt">数字孪生</TabsTrigger>
<TabsTrigger value="vs">虚拟仿真</TabsTrigger>
<TabsTrigger value="pm">预测维护</TabsTrigger>
<TabsTrigger value="rs">实时同步</TabsTrigger>
<TabsTrigger value="od">优化</TabsTrigger>
<TabsTrigger value="pa">规范分析</TabsTrigger>

        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Digital Twin Engine 概览</CardTitle><CardDescription>Layer 117 — 数字孪生建模 / 虚拟仿真 / 预测性维护 / 实时同步 / 优化 / 规范性分析 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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

        <TabsContent value="dt">
          <Card><CardHeader><CardTitle>数字孪生建模 (Digital Twin Model)</CardTitle><CardDescription>Physics/Data-Driven/Hybrid/Reduced/Surrogate/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={dtType} onValueChange={setDtType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>保真度</Label><Input type="number" value={dtFidelity} onChange={(e) => setDtFidelity(e.target.value)} min={1} max={10} /></div>
<div className="space-y-2"><Label>组件数</Label><Input type="number" value={dtComp} onChange={(e) => setDtComp(e.target.value)} min={5} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin/digital-twin-model", {model_type: dtType, model_fidelity: dtFidelity, num_components: dtComp})} disabled={loading}>{loading ? "计算中..." : "孪生建模分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="vs">
          <Card><CardHeader><CardTitle>虚拟仿真 (Virtual Simulation)</CardTitle><CardDescription>Monte-Carlo/Discrete-Event/Agent/System-Dynamics/Multi-Physics</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={vsType} onValueChange={setVsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>迭代数</Label><Input type="number" value={vsIter} onChange={(e) => setVsIter(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>时间范围</Label><Input type="number" value={vsHorizon} onChange={(e) => setVsHorizon(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin/virtual-simulation", {sim_type: vsType, num_iterations: vsIter, time_horizon: vsHorizon})} disabled={loading}>{loading ? "计算中..." : "仿真分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="pm">
          <Card><CardHeader><CardTitle>预测性维护 (Predictive Maintenance)</CardTitle><CardDescription>Vibration/Thermal/Acoustic/Oil/Fatigue/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={pmType} onValueChange={setPmType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>监控窗口</Label><Input type="number" value={pmWindow} onChange={(e) => setPmWindow(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>故障阈值</Label><Input type="number" value={pmThreshold} onChange={(e) => setPmThreshold(e.target.value)} step={0.01} min={0} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin/predictive-maintenance", {maint_type: pmType, monitoring_window: pmWindow, failure_threshold: pmThreshold})} disabled={loading}>{loading ? "计算中..." : "维护分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="rs">
          <Card><CardHeader><CardTitle>实时同步 (Real-Time Sync)</CardTitle><CardDescription>Sensor/Edge-Cloud/Federated/Event/State/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={rsType} onValueChange={setRsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>频率(Hz)</Label><Input type="number" value={rsFreq} onChange={(e) => setRsFreq(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>数据流</Label><Input type="number" value={rsStreams} onChange={(e) => setRsStreams(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin/real-time-sync", {sync_type: rsType, sync_frequency: rsFreq, data_streams: rsStreams})} disabled={loading}>{loading ? "计算中..." : "同步分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="od">
          <Card><CardHeader><CardTitle>数字孪生优化 (Optimization)</CardTitle><CardDescription>Topology/ParamSweep/Design/MultiObj/Robust/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={odType} onValueChange={setOdType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>设计变量</Label><Input type="number" value={odVars} onChange={(e) => setOdVars(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>约束数</Label><Input type="number" value={odConstraints} onChange={(e) => setOdConstraints(e.target.value)} min={0} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin/optimization-digital", {opt_type: odType, design_vars: odVars, constraint_count: odConstraints})} disabled={loading}>{loading ? "计算中..." : "优化分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="pa">
          <Card><CardHeader><CardTitle>规范性分析 (Prescriptive Analytics)</CardTitle><CardDescription>What-If/Scenario/RootCause/Anomaly/Lifecycle/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={paType} onValueChange={setPaType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PA_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>场景数</Label><Input type="number" value={paScenarios} onChange={(e) => setPaScenarios(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>预测范围</Label><Input type="number" value={paHorizon} onChange={(e) => setPaHorizon(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-twin/prescriptive-analytics", {analytics_type: paType, scenario_count: paScenarios, forecast_horizon: paHorizon})} disabled={loading}>{loading ? "计算中..." : "规范分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
