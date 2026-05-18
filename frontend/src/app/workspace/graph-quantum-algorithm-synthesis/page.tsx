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

const CIRCUIT_TYPES = [
  { value: "variational_circuit", label: "Variational 变分线路" },
  { value: "qaoa_circuit", label: "QAOA 量子近似优化" },
  { value: "quantum_walk_circuit", label: "Quantum Walk 量子行走" },
  { value: "grover_circuit", label: "Grover 搜索线路" },
  { value: "phase_estimation_circuit", label: "Phase Estimation 相位估计" },
  { value: "ai_circuit_synthesis", label: "AI 线路合成" },
];
const GATE_TYPES = [
  { value: "clifford_gates", label: "Clifford 门集" },
  { value: "non_clifford_t", label: "Non-Clifford T门" },
  { value: "toffoli_gates", label: "Toffoli 门" },
  { value: "multi_controlled", label: "Multi-Controlled 多控" },
  { value: "parameterized_rotation", label: "Parameterized Rotation 参数旋转" },
  { value: "ai_gate_primitive", label: "AI 门原语" },
];
const COMPILATION_TYPES = [
  { value: "qiskit_transpile", label: "Qiskit Transpile" },
  { value: "cirq_compile", label: "Cirq Compile" },
  { value: "tket_optimization", label: "TKET Optimization" },
  { value: "sabre_routing", label: "SABRE Routing" },
  { value: "noise_adaptive_compile", label: "Noise Adaptive 噪声自适应" },
  { value: "ai_quantum_compile", label: "AI 量子编译" },
];
const RESOURCE_TYPES = [
  { value: "gate_count_estimation", label: "Gate Count 门计数" },
  { value: "t_count_estimation", label: "T-Count T门计数" },
  { value: "qubit_count_estimation", label: "Qubit Count 比特计数" },
  { value: "depth_estimation", label: "Depth 深度估计" },
  { value: "runtime_estimation", label: "Runtime 运行时估计" },
  { value: "ai_resource_estimation", label: "AI 资源估计" },
];
const OPTIMIZATION_TYPES = [
  { value: "vqe_optimization", label: "VQE 变分量子特征求解" },
  { value: "qaoa_optimization", label: "QAOA 量子近似优化" },
  { value: "quantum_annealing", label: "Quantum Annealing 量子退火" },
  { value: "grover_search", label: "Grover Search 量子搜索" },
  { value: "qubo_solver", label: "QUBO Solver 二次无约束" },
  { value: "ai_quantum_optimization", label: "AI 量子优化" },
];
const SIMULATION_TYPES = [
  { value: "hamiltonian_simulation", label: "Hamiltonian 哈密顿量模拟" },
  { value: "trotter_suzuki", label: "Trotter-Suzuki 分解" },
  { value: "qubitization", label: "Qubitization 量子比特化" },
  { value: "linear_combination", label: "LCU 线性组合" },
  { value: "variational_simulation", label: "Variational 变分模拟" },
  { value: "ai_quantum_simulation", label: "AI 量子模拟" },
];

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function QuantumAlgorithmSynthesisPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  const [circuitType, setCircuitType] = useState("variational_circuit");
  const [numQubits, setNumQubits] = useState("4");
  const [circuitDepth, setCircuitDepth] = useState("10");
  const [gateType, setGateType] = useState("clifford_gates");
  const [targetGateSet, setTargetGateSet] = useState("clifford_t");
  const [decompLevel, setDecompLevel] = useState("3");
  const [compileType, setCompileType] = useState("qiskit_transpile");
  const [couplingMap, setCouplingMap] = useState("linear");
  const [optLevel, setOptLevel] = useState("2");
  const [resourceType, setResourceType] = useState("gate_count_estimation");
  const [algorithm, setAlgorithm] = useState("shor");
  const [problemSize, setProblemSize] = useState("2048");
  const [optimType, setOptimType] = useState("vqe_optimization");
  const [objectiveFunc, setObjectiveFunc] = useState("min_energy");
  const [numIter, setNumIter] = useState("100");
  const [simType, setSimType] = useState("hamiltonian_simulation");
  const [hamTerms, setHamTerms] = useState("50");
  const [evoTime, setEvoTime] = useState("1.0");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/quantum-algorithm-synthesis/overview`);
      const data = await res.json();
      setOverview(data);
      setResult(data);
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  async function postEndpoint(path: string, params: Record<string, string>) {
    setLoading(true); setResult(null);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}${path}?${qs}`, { method: "POST" });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quantum Algorithm Synthesis Engine</h1>
          <p className="text-muted-foreground">
            Layer 82 — 量子线路 / 门原语 / 量子编译 / 资源估计 / 量子优化 / 量子模拟
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.330.0</Badge>
          <Badge variant="secondary">Layer 82</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="circuit">量子线路</TabsTrigger>
          <TabsTrigger value="gate">门原语</TabsTrigger>
          <TabsTrigger value="compilation">量子编译</TabsTrigger>
          <TabsTrigger value="resource">资源估计</TabsTrigger>
          <TabsTrigger value="optimization">量子优化</TabsTrigger>
          <TabsTrigger value="simulation">量子模拟</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Algorithm Synthesis Engine 概览</CardTitle>
              <CardDescription>量子算法合成引擎 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchOverview} disabled={loading}>{loading ? "加载中..." : "获取概览"}</Button>
              {overview && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <Card><CardHeader className="pb-2"><CardDescription>枚举数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.enum_count}</div></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardDescription>端点数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.endpoint_count}</div></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardDescription>配置空间</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.config_space.toLocaleString()}</div></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardDescription>缓存命中</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{Object.values(overview.cache_stats).reduce((a: number, b: number) => a + b, 0)}</div></CardContent></Card>
                </div>
              )}
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="circuit">
          <Card>
            <CardHeader><CardTitle>量子线路设计 (Quantum Circuit)</CardTitle><CardDescription>Variational/QAOA/Quantum Walk/Grover/QPE — 量子线路架构</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>线路类型</Label><Select value={circuitType} onValueChange={setCircuitType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CIRCUIT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>量子比特数</Label><Input type="number" value={numQubits} onChange={(e) => setNumQubits(e.target.value)} min={1} max={1000} /></div>
                <div className="space-y-2"><Label>线路深度</Label><Input type="number" value={circuitDepth} onChange={(e) => setCircuitDepth(e.target.value)} min={1} max={10000} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-algorithm-synthesis/quantum-circuit", { circuit_type: circuitType, num_qubits: numQubits, circuit_depth: circuitDepth })} disabled={loading}>{loading ? "计算中..." : "设计量子线路"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gate">
          <Card>
            <CardHeader><CardTitle>量子门原语 (Gate Primitive)</CardTitle><CardDescription>Clifford/T/Toffoli/Multi-Controlled/Rotation — 量子门分解与近似</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>门类型</Label><Select value={gateType} onValueChange={setGateType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GATE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>目标门集</Label><Input type="text" value={targetGateSet} onChange={(e) => setTargetGateSet(e.target.value)} /></div>
                <div className="space-y-2"><Label>分解层级</Label><Input type="number" value={decompLevel} onChange={(e) => setDecompLevel(e.target.value)} min={1} max={10} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-algorithm-synthesis/quantum-gate", { gate_type: gateType, target_gate_set: targetGateSet, decomposition_level: decompLevel })} disabled={loading}>{loading ? "计算中..." : "分解量子门"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compilation">
          <Card>
            <CardHeader><CardTitle>量子编译 (Quantum Compilation)</CardTitle><CardDescription>Qiskit/Cirq/TKET/SABRE — 量子线路编译与优化</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>编译器</Label><Select value={compileType} onValueChange={setCompileType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COMPILATION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>耦合图</Label><Input type="text" value={couplingMap} onChange={(e) => setCouplingMap(e.target.value)} /></div>
                <div className="space-y-2"><Label>优化级别</Label><Input type="number" value={optLevel} onChange={(e) => setOptLevel(e.target.value)} min={0} max={3} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-algorithm-synthesis/quantum-compilation", { compilation_type: compileType, coupling_map: couplingMap, optimization_level: optLevel })} disabled={loading}>{loading ? "计算中..." : "编译量子线路"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resource">
          <Card>
            <CardHeader><CardTitle>量子资源估计 (Resource Estimation)</CardTitle><CardDescription>Gate/T/Qubit/Depth/Runtime — 量子计算资源需求分析</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>估计类型</Label><Select value={resourceType} onValueChange={setResourceType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RESOURCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>算法</Label><Input type="text" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} /></div>
                <div className="space-y-2"><Label>问题规模 n</Label><Input type="number" value={problemSize} onChange={(e) => setProblemSize(e.target.value)} min={2} max={1000000} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-algorithm-synthesis/quantum-resource", { estimation_type: resourceType, algorithm: algorithm, problem_size: problemSize })} disabled={loading}>{loading ? "计算中..." : "估计量子资源"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <Card>
            <CardHeader><CardTitle>量子优化 (Quantum Optimization)</CardTitle><CardDescription>VQE/QAOA/Annealing/Grover/QUBO — 量子优化算法</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>优化类型</Label><Select value={optimType} onValueChange={setOptimType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OPTIMIZATION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>目标函数</Label><Input type="text" value={objectiveFunc} onChange={(e) => setObjectiveFunc(e.target.value)} /></div>
                <div className="space-y-2"><Label>迭代次数</Label><Input type="number" value={numIter} onChange={(e) => setNumIter(e.target.value)} min={1} max={100000} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-algorithm-synthesis/quantum-optimization", { optimization_type: optimType, objective_function: objectiveFunc, num_iterations: numIter })} disabled={loading}>{loading ? "计算中..." : "运行量子优化"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation">
          <Card>
            <CardHeader><CardTitle>量子模拟 (Quantum Simulation)</CardTitle><CardDescription>Hamiltonian/Trotter/Qubitization/LCU/Variational — 量子动力学模拟</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>模拟类型</Label><Select value={simType} onValueChange={setSimType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SIMULATION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>哈密顿量项数</Label><Input type="number" value={hamTerms} onChange={(e) => setHamTerms(e.target.value)} min={1} max={100000} /></div>
                <div className="space-y-2"><Label>演化时间</Label><Input type="number" value={evoTime} onChange={(e) => setEvoTime(e.target.value)} step={0.1} min={0.01} max={1000} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-algorithm-synthesis/quantum-simulation", { simulation_type: simType, hamiltonian_terms: hamTerms, evolution_time: evoTime })} disabled={loading}>{loading ? "计算中..." : "模拟量子动力学"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
