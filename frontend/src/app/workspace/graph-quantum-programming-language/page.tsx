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

const IR_TYPES = [
  { value: "openqasm_ir", label: "OpenQASM" },
  { value: "quil_ir", label: "Quil" },
  { value: "qir_llvm", label: "QIR-LLVM" },
  { value: "blackbird_ir", label: "Blackbird" },
  { value: "braket_ir", label: "Braket" },
  { value: "ai_unified_ir", label: "AI" },
];

const DSL_TYPES = [
  { value: "gate_based_dsl", label: "Gate-Based" },
  { value: "pulse_level_dsl", label: "Pulse" },
  { value: "measurement_dsl", label: "Measurement" },
  { value: "hybrid_classical_dsl", label: "Hybrid" },
  { value: "variational_dsl", label: "Variational" },
  { value: "ai_dsl_synthesis", label: "AI" },
];

const TYPE_TYPES = [
  { value: "linear_type", label: "Linear" },
  { value: "dependent_type", label: "Dependent" },
  { value: "session_type", label: "Session" },
  { value: "effect_type", label: "Effect" },
  { value: "resource_type", label: "Resource" },
  { value: "ai_type_inference", label: "AI" },
];

const COMPILER_TYPES = [
  { value: "constant_fold", label: "Const Fold" },
  { value: "dead_gate_elim", label: "Dead Gate" },
  { value: "commutative_merge", label: "Commutative" },
  { value: "rotation_merge", label: "Rotation" },
  { value: "template_rewrite", label: "Template" },
  { value: "ai_pass_schedule", label: "AI" },
];

const RT_TYPES = [
  { value: "synchronous_rt", label: "Synchronous" },
  { value: "asynchronous_rt", label: "Asynchronous" },
  { value: "batch_runtime", label: "Batch" },
  { value: "streaming_rt", label: "Streaming" },
  { value: "event_driven_rt", label: "Event-Driven" },
  { value: "ai_runtime_adapt", label: "AI" },
];

const DEBUG_TYPES = [
  { value: "state_tomography_dbg", label: "Tomography" },
  { value: "circuit_inspector", label: "Inspector" },
  { value: "breakpoint_quantum", label: "Breakpoint" },
  { value: "trace_execution", label: "Trace" },
  { value: "assertion_quantum", label: "Assertion" },
  { value: "ai_debug_assist", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumProgrammingLanguageEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [irType, setIrType] = useState("openqasm_ir");
  const [irSize, setIrSize] = useState("100");
  const [irOptLevel, setIrOptLevel] = useState("2");
  const [dslType, setDslType] = useState("gate_based_dsl");
  const [dslOps, setDslOps] = useState("500");
  const [dslAbsLevel, setDslAbsLevel] = useState("3");
  const [typeType, setTypeType] = useState("linear_type");
  const [typeComplexity, setTypeComplexity] = useState("10");
  const [typeQubits, setTypeQubits] = useState("50");
  const [compilerType, setCompilerType] = useState("constant_fold");
  const [compilerDepth, setCompilerDepth] = useState("1000");
  const [compilerGates, setCompilerGates] = useState("5000");
  const [runtimeType, setRuntimeType] = useState("synchronous_rt");
  const [runtimeShots, setRuntimeShots] = useState("10000");
  const [runtimeTimeout, setRuntimeTimeout] = useState("300.0");
  const [debugType, setDebugType] = useState("state_tomography_dbg");
  const [debugQubits, setDebugQubits] = useState("20");
  const [debugDepth, setDebugDepth] = useState("100");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-programming-language/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Programming Language Engine</h1>
          <p className="text-muted-foreground">Layer 101 — 量子IR / 电路DSL / 类型系统 / 编译器优化 / 运行时 / 调试器</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.349.0</Badge>
          <Badge variant="secondary">Layer 101</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="ir">量子IR</TabsTrigger>
<TabsTrigger value="dsl">电路DSL</TabsTrigger>
<TabsTrigger value="type">类型系统</TabsTrigger>
<TabsTrigger value="compiler">编译优化</TabsTrigger>
<TabsTrigger value="runtime">运行时</TabsTrigger>
<TabsTrigger value="debug">调试器</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Programming Language Engine 概览</CardTitle><CardDescription>Layer 101 — 量子IR / 电路DSL / 类型系统 / 编译器优化 / 运行时 / 调试器 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="ir">
          <Card><CardHeader><CardTitle>量子IR (Quantum IR)</CardTitle><CardDescription>OpenQASM/Quil/QIR-LLVM/Blackbird/Braket</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={irType} onValueChange={setIrType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{IR_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>电路规模</Label><Input type="number" value={irSize} onChange={(e) => setIrSize(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>优化级别</Label><Input type="number" value={irOptLevel} onChange={(e) => setIrOptLevel(e.target.value)} min={0} max={3} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-programming-language/quantum-ir", {ir_type: irType, circuit_size: irSize, optimization_level: irOptLevel})} disabled={loading}>{loading ? "计算中..." : "IR编译"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="dsl">
          <Card><CardHeader><CardTitle>电路DSL (Circuit DSL)</CardTitle><CardDescription>Gate/Pulse/Measurement/Hybrid/Variational</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={dslType} onValueChange={setDslType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DSL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>操作数</Label><Input type="number" value={dslOps} onChange={(e) => setDslOps(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>抽象层级</Label><Input type="number" value={dslAbsLevel} onChange={(e) => setDslAbsLevel(e.target.value)} min={1} max={5} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-programming-language/circuit-dsl", {dsl_type: dslType, num_operations: dslOps, abstraction_level: dslAbsLevel})} disabled={loading}>{loading ? "计算中..." : "DSL分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="type">
          <Card><CardHeader><CardTitle>类型系统 (Type System)</CardTitle><CardDescription>Linear/Dependent/Session/Effect/Resource</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={typeType} onValueChange={setTypeType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TYPE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>电路复杂度</Label><Input type="number" value={typeComplexity} onChange={(e) => setTypeComplexity(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={typeQubits} onChange={(e) => setTypeQubits(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-programming-language/quantum-type-system", {type_system: typeType, circuit_complexity: typeComplexity, num_qubits: typeQubits})} disabled={loading}>{loading ? "计算中..." : "类型检查"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="compiler">
          <Card><CardHeader><CardTitle>编译优化 (Compiler Pass)</CardTitle><CardDescription>ConstantFold/DeadGate/Commutative/Rotation/Template</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={compilerType} onValueChange={setCompilerType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COMPILER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>电路深度</Label><Input type="number" value={compilerDepth} onChange={(e) => setCompilerDepth(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>门数量</Label><Input type="number" value={compilerGates} onChange={(e) => setCompilerGates(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-programming-language/compiler-pass", {pass_type: compilerType, circuit_depth: compilerDepth, gate_count: compilerGates})} disabled={loading}>{loading ? "计算中..." : "编译分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="runtime">
          <Card><CardHeader><CardTitle>运行时 (Quantum Runtime)</CardTitle><CardDescription>Sync/Async/Batch/Streaming/EventDriven</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={runtimeType} onValueChange={setRuntimeType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>最大shots</Label><Input type="number" value={runtimeShots} onChange={(e) => setRuntimeShots(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>超时(秒)</Label><Input type="number" value={runtimeTimeout} onChange={(e) => setRuntimeTimeout(e.target.value)} step={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-programming-language/quantum-runtime", {runtime_type: runtimeType, max_shots: runtimeShots, timeout_sec: runtimeTimeout})} disabled={loading}>{loading ? "计算中..." : "运行时分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="debug">
          <Card><CardHeader><CardTitle>调试器 (Quantum Debug)</CardTitle><CardDescription>Tomography/Inspector/Breakpoint/Trace/Assertion</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={debugType} onValueChange={setDebugType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DEBUG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={debugQubits} onChange={(e) => setDebugQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>电路深度</Label><Input type="number" value={debugDepth} onChange={(e) => setDebugDepth(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-programming-language/quantum-debug", {debug_type: debugType, num_qubits: debugQubits, circuit_depth: debugDepth})} disabled={loading}>{loading ? "计算中..." : "调试分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
