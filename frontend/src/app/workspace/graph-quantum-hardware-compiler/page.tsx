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

const GATE_TYPES = [
  { value: "solovay_kitaev", label: "Solovay-Kitaev" },
  { value: "cartan_decomposition", label: "Cartan" },
  { value: "qiskit_transpile", label: "Qiskit" },
  { value: "t_par_synthesis", label: "T-par" },
  { value: "matroid_partition", label: "Matroid" },
  { value: "ai_gate_decompose", label: "AI" },
];

const PULSE_TYPES = [
  { value: "grape_pulse", label: "GRAPE" },
  { value: "dcrab_optimization", label: "DCRAB" },
  { value: "optimal_control", label: "Optimal Ctrl" },
  { value: "qiskit_pulse_custom", label: "Qiskit Pulse" },
  { value: "derivative_removal", label: "DRAG" },
  { value: "ai_pulse_optimize", label: "AI" },
];

const TOPO_TYPES = [
  { value: "sabre_routing", label: "SABRE" },
  { value: "lookahead_swap", label: "Lookahead" },
  { value: "stochastic_swap", label: "Stochastic" },
  { value: "noise_adaptive_map", label: "Noise-Adaptive" },
  { value: "crosstalk_aware", label: "Crosstalk" },
  { value: "ai_topology_map", label: "AI" },
];

const CAL_TYPES = [
  { value: "rb_calibration", label: "RB" },
  { value: "tomography_cal", label: "Tomography" },
  { value: "gate_set_tomography", label: "GST" },
  { value: "randomized_benchmark", label: "RB Std" },
  { value: "cross_entropy_cal", label: "XEB" },
  { value: "ai_calibration", label: "AI" },
];

const OPT_TYPES = [
  { value: "commutative_cancellation", label: "Commutative" },
  { value: "peephole_opt", label: "Peephole" },
  { value: "template_matching", label: "Template" },
  { value: "consolidate_blocks", label: "Consolidate" },
  { value: "depth_optimization", label: "Depth" },
  { value: "ai_circuit_opt", label: "AI" },
];

const EST_TYPES = [
  { value: "gate_count_est", label: "Gate Count" },
  { value: "t_factory_est", label: "T-Factory" },
  { value: "space_time_volume", label: "Space-Time" },
  { value: "clifford_t_cost", label: "Clifford-T" },
  { value: "logical_qubit_cost", label: "Logical Qubit" },
  { value: "ai_resource_est", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumHardwareCompilerEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [gateType, setGateType] = useState("solovay_kitaev");
  const [gateGateSet, setGateGateSet] = useState("clifford_t");
  const [gateApprox, setGateApprox] = useState("0.99");
  const [pulseType, setPulseType] = useState("grape_pulse");
  const [pulseDuration, setPulseDuration] = useState("40.0");
  const [pulseFidelity, setPulseFidelity] = useState("0.999");
  const [topologyType, setTopologyType] = useState("sabre_routing");
  const [topologyQubits, setTopologyQubits] = useState("27");
  const [topologyConn, setTopologyConn] = useState("3");
  const [calibType, setCalibType] = useState("rb_calibration");
  const [calibQubits, setCalibQubits] = useState("127");
  const [calibRounds, setCalibRounds] = useState("100");
  const [circuitType, setCircuitType] = useState("commutative_cancellation");
  const [circuitDepth, setCircuitDepth] = useState("1000");
  const [circuitLevel, setCircuitLevel] = useState("3");
  const [resourceType, setResourceType] = useState("gate_count_est");
  const [resourceSize, setResourceSize] = useState("10000");
  const [resourceError, setResourceError] = useState("0.001");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-hardware-compiler/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Hardware Compiler Engine</h1>
          <p className="text-muted-foreground">Layer 97 — 门分解 / 脉冲优化 / 拓扑映射 / 校准引擎 / 电路优化 / 资源估计</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.345.0</Badge>
          <Badge variant="secondary">Layer 97</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="gate">门分解</TabsTrigger>
<TabsTrigger value="pulse">脉冲优化</TabsTrigger>
<TabsTrigger value="topology">拓扑映射</TabsTrigger>
<TabsTrigger value="calib">校准引擎</TabsTrigger>
<TabsTrigger value="circuit">电路优化</TabsTrigger>
<TabsTrigger value="resource">资源估计</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Hardware Compiler Engine 概览</CardTitle><CardDescription>Layer 97 — 门分解 / 脉冲优化 / 拓扑映射 / 校准引擎 / 电路优化 / 资源估计 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="gate">
          <Card><CardHeader><CardTitle>门分解 (Gate Decomposition)</CardTitle><CardDescription>Solovay-Kitaev/Cartan/Qiskit/T-par/Matroid</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={gateType} onValueChange={setGateType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GATE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>目标门集</Label><Input type="number" value={gateGateSet} onChange={(e) => setGateGateSet(e.target.value)}  /></div>
<div className="space-y-2"><Label>近似度</Label><Input type="number" value={gateApprox} onChange={(e) => setGateApprox(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-hardware-compiler/gate-decomposition", {decomp_type: gateType, target_gate_set: gateGateSet, approximation_degree: gateApprox})} disabled={loading}>{loading ? "计算中..." : "门分解"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="pulse">
          <Card><CardHeader><CardTitle>脉冲优化 (Pulse Optimization)</CardTitle><CardDescription>GRAPE/DCRAB/Optimal Control/Custom/DRAG</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={pulseType} onValueChange={setPulseType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PULSE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>脉冲时长(ns)</Label><Input type="number" value={pulseDuration} onChange={(e) => setPulseDuration(e.target.value)} step={1} /></div>
<div className="space-y-2"><Label>保真度目标</Label><Input type="number" value={pulseFidelity} onChange={(e) => setPulseFidelity(e.target.value)} step={0.001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-hardware-compiler/pulse-optimization", {pulse_type: pulseType, pulse_duration_ns: pulseDuration, fidelity_target: pulseFidelity})} disabled={loading}>{loading ? "计算中..." : "脉冲优化"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="topology">
          <Card><CardHeader><CardTitle>拓扑映射 (Topology Mapping)</CardTitle><CardDescription>SABRE/Lookahead/Stochastic/Noise/Crosstalk</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={topologyType} onValueChange={setTopologyType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TOPO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>量子比特数</Label><Input type="number" value={topologyQubits} onChange={(e) => setTopologyQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>连接度</Label><Input type="number" value={topologyConn} onChange={(e) => setTopologyConn(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-hardware-compiler/topology-mapping", {topo_type: topologyType, qubit_count: topologyQubits, connectivity_degree: topologyConn})} disabled={loading}>{loading ? "计算中..." : "拓扑映射"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="calib">
          <Card><CardHeader><CardTitle>校准引擎 (Calibration Engine)</CardTitle><CardDescription>RB/Tomography/Gate Set/Benchmark/XEB</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={calibType} onValueChange={setCalibType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CAL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={calibQubits} onChange={(e) => setCalibQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>校准轮数</Label><Input type="number" value={calibRounds} onChange={(e) => setCalibRounds(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-hardware-compiler/calibration-engine", {cal_type: calibType, num_qubits: calibQubits, calibration_rounds: calibRounds})} disabled={loading}>{loading ? "计算中..." : "校准"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="circuit">
          <Card><CardHeader><CardTitle>电路优化 (Circuit Optimization)</CardTitle><CardDescription>Commutative/Peephole/Template/Consolidate</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={circuitType} onValueChange={setCircuitType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OPT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>电路深度</Label><Input type="number" value={circuitDepth} onChange={(e) => setCircuitDepth(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>优化级别</Label><Input type="number" value={circuitLevel} onChange={(e) => setCircuitLevel(e.target.value)} min={0} max={3} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-hardware-compiler/circuit-optimization", {opt_type: circuitType, circuit_depth: circuitDepth, optimization_level: circuitLevel})} disabled={loading}>{loading ? "计算中..." : "电路优化"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="resource">
          <Card><CardHeader><CardTitle>资源估计 (Resource Estimation)</CardTitle><CardDescription>Gate Count/T-Factory/Space-Time/Clifford-T</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={resourceType} onValueChange={setResourceType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EST_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>算法规模</Label><Input type="number" value={resourceSize} onChange={(e) => setResourceSize(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>误差预算</Label><Input type="number" value={resourceError} onChange={(e) => setResourceError(e.target.value)} step={0.0001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-hardware-compiler/resource-estimation", {est_type: resourceType, algorithm_size: resourceSize, error_budget: resourceError})} disabled={loading}>{loading ? "计算中..." : "资源估计"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
