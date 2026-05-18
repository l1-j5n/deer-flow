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

const QISKIT_TYPES = [
  { value: "qiskit_aer", label: "Aer" },
  { value: "qiskit_ibm", label: "IBM Quantum" },
  { value: "qiskit_nature", label: "Nature" },
  { value: "qiskit_finance", label: "Finance" },
  { value: "qiskit_ml", label: "QML" },
  { value: "ai_qiskit_wrap", label: "AI" },
];

const CIRQ_TYPES = [
  { value: "cirq_simulator", label: "Simulator" },
  { value: "cirq_google", label: "Google" },
  { value: "cirq_ionq", label: "IonQ" },
  { value: "cirq_pasqal", label: "Pasqal" },
  { value: "cirq_aqt", label: "AQT" },
  { value: "ai_cirq_wrap", label: "AI" },
];

const PL_TYPES = [
  { value: "pennylane_default", label: "Default" },
  { value: "pennylane_lightning", label: "Lightning" },
  { value: "pennylane_tf", label: "TensorFlow" },
  { value: "pennylane_torch", label: "PyTorch" },
  { value: "pennylane_jax", label: "JAX" },
  { value: "ai_pennylane_wrap", label: "AI" },
];

const QASM_TYPES = [
  { value: "qasm2_parser", label: "QASM2 Parser" },
  { value: "qasm3_parser", label: "QASM3 Parser" },
  { value: "qasm_exporter", label: "Exporter" },
  { value: "qasm_validator", label: "Validator" },
  { value: "qasm_transpiler", label: "Transpiler" },
  { value: "ai_qasm_synthesis", label: "AI" },
];

const HYBRID_TYPES = [
  { value: "variational_sdk", label: "Variational" },
  { value: "qaoa_sdk", label: "QAOA" },
  { value: "vqe_sdk", label: "VQE" },
  { value: "quantum_ml_sdk", label: "QML" },
  { value: "nisq_sdk", label: "NISQ" },
  { value: "ai_hybrid_orchestrator", label: "AI" },
];

const BENCH_TYPES = [
  { value: "circuit_bench", label: "Circuit" },
  { value: "simulator_bench", label: "Simulator" },
  { value: "hardware_bench", label: "Hardware" },
  { value: "transpiler_bench", label: "Transpiler" },
  { value: "end_to_end_bench", label: "E2E" },
  { value: "ai_benchmark_suite", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumSDKFrameworkEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [qiskitType, setQiskitType] = useState("qiskit_aer");
  const [qiskitQubits, setQiskitQubits] = useState("27");
  const [qiskitShots, setQiskitShots] = useState("1024");
  const [cirqType, setCirqType] = useState("cirq_simulator");
  const [cirqQubits, setCirqQubits] = useState("50");
  const [cirqDepth, setCirqDepth] = useState("100");
  const [pennylaneType, setPennylaneType] = useState("pennylane_default");
  const [pennylaneLayers, setPennylaneLayers] = useState("4");
  const [pennylaneParams, setPennylaneParams] = useState("100");
  const [qasmType, setQasmType] = useState("qasm2_parser");
  const [qasmSize, setQasmSize] = useState("200");
  const [qasmVersion, setQasmVersion] = useState("3");
  const [hybridType, setHybridType] = useState("variational_sdk");
  const [hybridClassical, setHybridClassical] = useState("10");
  const [hybridQuantum, setHybridQuantum] = useState("20");
  const [benchType, setBenchType] = useState("circuit_bench");
  const [benchTrials, setBenchTrials] = useState("100");
  const [benchSize, setBenchSize] = useState("10");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-sdk-framework/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum SDK Framework Engine</h1>
          <p className="text-muted-foreground">Layer 102 — Qiskit集成 / Cirq集成 / PennyLane集成 / OpenQASM / 混合SDK / 基准测试</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.350.0</Badge>
          <Badge variant="secondary">Layer 102</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="qiskit">Qiskit</TabsTrigger>
<TabsTrigger value="cirq">Cirq</TabsTrigger>
<TabsTrigger value="pennylane">PennyLane</TabsTrigger>
<TabsTrigger value="qasm">OpenQASM</TabsTrigger>
<TabsTrigger value="hybrid">混合SDK</TabsTrigger>
<TabsTrigger value="bench">基准测试</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum SDK Framework Engine 概览</CardTitle><CardDescription>Layer 102 — Qiskit集成 / Cirq集成 / PennyLane集成 / OpenQASM / 混合SDK / 基准测试 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="qiskit">
          <Card><CardHeader><CardTitle>Qiskit (Qiskit Integration)</CardTitle><CardDescription>Aer/IBM/Nature/Finance/ML</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qiskitType} onValueChange={setQiskitType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QISKIT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={qiskitQubits} onChange={(e) => setQiskitQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>Shots</Label><Input type="number" value={qiskitShots} onChange={(e) => setQiskitShots(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sdk-framework/qiskit-integration", {integration_type: qiskitType, num_qubits: qiskitQubits, shots: qiskitShots})} disabled={loading}>{loading ? "计算中..." : "Qiskit分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="cirq">
          <Card><CardHeader><CardTitle>Cirq (Cirq Integration)</CardTitle><CardDescription>Simulator/Google/IonQ/Pasqal/AQT</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={cirqType} onValueChange={setCirqType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CIRQ_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={cirqQubits} onChange={(e) => setCirqQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>电路深度</Label><Input type="number" value={cirqDepth} onChange={(e) => setCirqDepth(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sdk-framework/cirq-integration", {integration_type: cirqType, num_qubits: cirqQubits, circuit_depth: cirqDepth})} disabled={loading}>{loading ? "计算中..." : "Cirq分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="pennylane">
          <Card><CardHeader><CardTitle>PennyLane (PennyLane Integration)</CardTitle><CardDescription>Default/Lightning/TF/Torch/JAX</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={pennylaneType} onValueChange={setPennylaneType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>层数</Label><Input type="number" value={pennylaneLayers} onChange={(e) => setPennylaneLayers(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>参数数</Label><Input type="number" value={pennylaneParams} onChange={(e) => setPennylaneParams(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sdk-framework/pennylane-integration", {integration_type: pennylaneType, num_layers: pennylaneLayers, num_params: pennylaneParams})} disabled={loading}>{loading ? "计算中..." : "PennyLane分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="qasm">
          <Card><CardHeader><CardTitle>OpenQASM (OpenQASM Support)</CardTitle><CardDescription>v2/v3 Parser/Exporter/Validator/Transpiler</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qasmType} onValueChange={setQasmType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QASM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>电路规模</Label><Input type="number" value={qasmSize} onChange={(e) => setQasmSize(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>QASM版本</Label><Input type="number" value={qasmVersion} onChange={(e) => setQasmVersion(e.target.value)} min={2} max={3} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sdk-framework/openqasm-support", {qasm_type: qasmType, circuit_size: qasmSize, qasm_version: qasmVersion})} disabled={loading}>{loading ? "计算中..." : "QASM分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="hybrid">
          <Card><CardHeader><CardTitle>混合SDK (Hybrid SDK)</CardTitle><CardDescription>VQE/QAOA/Variational/QML/NISQ</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={hybridType} onValueChange={setHybridType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{HYBRID_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>经典资源</Label><Input type="number" value={hybridClassical} onChange={(e) => setHybridClassical(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>量子资源</Label><Input type="number" value={hybridQuantum} onChange={(e) => setHybridQuantum(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sdk-framework/hybrid-sdk", {hybrid_type: hybridType, classical_resources: hybridClassical, quantum_resources: hybridQuantum})} disabled={loading}>{loading ? "计算中..." : "混合分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="bench">
          <Card><CardHeader><CardTitle>基准测试 (SDK Benchmark)</CardTitle><CardDescription>Circuit/Simulator/Hardware/Transpiler/E2E</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={benchType} onValueChange={setBenchType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BENCH_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>试验次数</Label><Input type="number" value={benchTrials} onChange={(e) => setBenchTrials(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>问题规模</Label><Input type="number" value={benchSize} onChange={(e) => setBenchSize(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-sdk-framework/sdk-benchmark", {bench_type: benchType, num_trials: benchTrials, problem_size: benchSize})} disabled={loading}>{loading ? "计算中..." : "基准分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
