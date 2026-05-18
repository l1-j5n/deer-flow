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

const QEC_CODE_TYPES = [
  { value: "surface_code", label: "Surface Code 表面码" },
  { value: "color_code", label: "Color Code 色彩码" },
  { value: "stabilizer_code", label: "Stabilizer 稳定子码" },
  { value: "topological_code", label: "Topological 拓扑码" },
  { value: "bacon_shor_code", label: "Bacon-Shor 码" },
  { value: "ai_qec_code", label: "AI QEC 码" },
];
const LOGICAL_QUBIT_TYPES = [
  { value: "planar_encoding", label: "Planar 平面编码" },
  { value: "toric_encoding", label: "Toric 环面编码" },
  { value: "hyperbolic_encoding", label: "Hyperbolic 双曲编码" },
  { value: "fracton_encoding", label: "Fracton 分形子编码" },
  { value: "majorana_encoding", label: "Majorana 编码" },
  { value: "ai_logical_qubit", label: "AI 逻辑量子比特" },
];
const SYNDROME_DECODER_TYPES = [
  { value: "mwpm_decoder", label: "MWPM 最小权重完美匹配" },
  { value: "union_find_decoder", label: "Union-Find 联合查找" },
  { value: "tensor_network_decoder", label: "Tensor Network 张量网络" },
  { value: "neural_decoder", label: "Neural 神经网络" },
  { value: "belief_propagation", label: "Belief Propagation 置信传播" },
  { value: "ai_syndrome_decoder", label: "AI 解码器" },
];
const FAULT_TOLERANCE_TYPES = [
  { value: "transversal_gate", label: "Transversal 横向门" },
  { value: "lattice_surgery", label: "Lattice Surgery 晶格手术" },
  { value: "magic_state_distillation", label: "Magic State 魔态蒸馏" },
  { value: "flag_qubit_ft", label: "Flag Qubit 标记比特" },
  { value: "pieceable_ft", label: "Pieceable 分段容错" },
  { value: "ai_fault_tolerance", label: "AI 容错方案" },
];
const ERROR_MODEL_TYPES = [
  { value: "depolarizing_channel", label: "Depolarizing 退极化" },
  { value: "amplitude_damping", label: "Amplitude Damping 振幅阻尼" },
  { value: "correlated_noise", label: "Correlated 关联噪声" },
  { value: "erasure_channel", label: "Erasure 擦除信道" },
  { value: "coherent_error", label: "Coherent 相干误差" },
  { value: "ai_error_model", label: "AI 误差模型" },
];
const THRESHOLD_TYPES = [
  { value: "code_capacity", label: "Code Capacity 码容量" },
  { value: "phenomenological", label: "Phenomenological 唯象" },
  { value: "circuit_level", label: "Circuit Level 电路级" },
  { value: "adversarial_noise", label: "Adversarial 对抗噪声" },
  { value: "biased_noise", label: "Biased 偏置噪声" },
  { value: "ai_threshold_analysis", label: "AI 阈值分析" },
];

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function QuantumErrorCorrectionTopologyPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // QEC Code
  const [codeType, setCodeType] = useState("surface_code");
  const [codeDistance, setCodeDistance] = useState("3");
  const [physQubits, setPhysQubits] = useState("9");
  // Logical Qubit
  const [encType, setEncType] = useState("planar_encoding");
  const [latticeDim, setLatticeDim] = useState("2");
  const [logicalQubits, setLogicalQubits] = useState("1");
  // Syndrome Decoder
  const [decoderType, setDecoderType] = useState("mwpm_decoder");
  const [errorRate, setErrorRate] = useState("0.001");
  const [decCodeDistance, setDecCodeDistance] = useState("5");
  // Fault Tolerance
  const [ftType, setFtType] = useState("transversal_gate");
  const [targetGate, setTargetGate] = useState("T_gate");
  const [errorBudget, setErrorBudget] = useState("1e-6");
  // Error Model
  const [modelType, setModelType] = useState("depolarizing_channel");
  const [physErrorRate, setPhysErrorRate] = useState("0.001");
  const [corrLength, setCorrLength] = useState("1.0");
  // Threshold
  const [threshType, setThreshType] = useState("code_capacity");
  const [maxDist, setMaxDist] = useState("21");
  const [numTrials, setNumTrials] = useState("10000");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/quantum-error-correction-topology/overview`);
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
    setLoading(true);
    setResult(null);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}${path}?${qs}`, { method: "POST" });
      const data = await res.json();
      setResult(data);
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
          <h1 className="text-3xl font-bold tracking-tight">
            Quantum Error Correction Topology Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 81 — QEC码 / 逻辑量子比特 / 症候解码 / 容错方案 / 误差模型 / 阈值分析
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.329.0</Badge>
          <Badge variant="secondary">Layer 81</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qec-code">QEC码</TabsTrigger>
          <TabsTrigger value="logical-qubit">逻辑量子比特</TabsTrigger>
          <TabsTrigger value="syndrome">症候解码</TabsTrigger>
          <TabsTrigger value="fault-tolerance">容错方案</TabsTrigger>
          <TabsTrigger value="error-model">误差模型</TabsTrigger>
          <TabsTrigger value="threshold">阈值分析</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Error Correction Topology Engine 概览</CardTitle>
              <CardDescription>
                量子纠错拓扑引擎 — 6枚举 × 6值 = 36值, 7 API端点
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchOverview} disabled={loading}>
                {loading ? "加载中..." : "获取概览"}
              </Button>
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

        {/* QEC Code */}
        <TabsContent value="qec-code">
          <Card>
            <CardHeader>
              <CardTitle>QEC码 (Quantum Error Correction Code)</CardTitle>
              <CardDescription>Surface/Color/Stabilizer/Topological/Bacon-Shor — 量子纠错码拓扑结构</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>码类型</Label>
                  <Select value={codeType} onValueChange={setCodeType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{QEC_CODE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>码距离 d</Label>
                  <Input type="number" value={codeDistance} onChange={(e) => setCodeDistance(e.target.value)} min={1} max={101} />
                </div>
                <div className="space-y-2">
                  <Label>物理量子比特数 n</Label>
                  <Input type="number" value={physQubits} onChange={(e) => setPhysQubits(e.target.value)} min={1} max={10000} />
                </div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-error-correction-topology/qec-code", { code_type: codeType, code_distance: codeDistance, physical_qubit_count: physQubits })} disabled={loading}>
                {loading ? "计算中..." : "计算 QEC码"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logical Qubit */}
        <TabsContent value="logical-qubit">
          <Card>
            <CardHeader>
              <CardTitle>逻辑量子比特 (Logical Qubit Encoding)</CardTitle>
              <CardDescription>Planar/Toric/Hyperbolic/Fracton/Majorana — 拓扑编码方案</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>编码类型</Label>
                  <Select value={encType} onValueChange={setEncType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LOGICAL_QUBIT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>晶格维度</Label>
                  <Input type="number" value={latticeDim} onChange={(e) => setLatticeDim(e.target.value)} min={1} max={4} />
                </div>
                <div className="space-y-2">
                  <Label>逻辑量子比特数 k</Label>
                  <Input type="number" value={logicalQubits} onChange={(e) => setLogicalQubits(e.target.value)} min={1} max={100} />
                </div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-error-correction-topology/logical-qubit", { encoding_type: encType, lattice_dimension: latticeDim, logical_qubits: logicalQubits })} disabled={loading}>
                {loading ? "计算中..." : "分析逻辑量子比特"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Syndrome Decoder */}
        <TabsContent value="syndrome">
          <Card>
            <CardHeader>
              <CardTitle>症候解码 (Syndrome Decoder)</CardTitle>
              <CardDescription>MWPM/Union-Find/Tensor/Neural/BP — 错误症候解码算法</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>解码器类型</Label>
                  <Select value={decoderType} onValueChange={setDecoderType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{SYNDROME_DECODER_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>物理错误率 p</Label>
                  <Input type="number" value={errorRate} onChange={(e) => setErrorRate(e.target.value)} step={0.0001} min={0.00001} max={0.5} />
                </div>
                <div className="space-y-2">
                  <Label>码距离 d</Label>
                  <Input type="number" value={decCodeDistance} onChange={(e) => setDecCodeDistance(e.target.value)} min={3} max={101} />
                </div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-error-correction-topology/syndrome-decoder", { decoder_type: decoderType, error_rate: errorRate, code_distance: decCodeDistance })} disabled={loading}>
                {loading ? "计算中..." : "评估解码器"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fault Tolerance */}
        <TabsContent value="fault-tolerance">
          <Card>
            <CardHeader>
              <CardTitle>容错方案 (Fault Tolerance)</CardTitle>
              <CardDescription>Transversal/Lattice Surgery/Magic State/Flag/Pieceable — 容错量子计算</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>容错方案</Label>
                  <Select value={ftType} onValueChange={setFtType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FAULT_TOLERANCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>目标门</Label>
                  <Input type="text" value={targetGate} onChange={(e) => setTargetGate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>误差预算 ε</Label>
                  <Input type="text" value={errorBudget} onChange={(e) => setErrorBudget(e.target.value)} />
                </div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-error-correction-topology/fault-tolerance", { ft_type: ftType, target_gate: targetGate, error_budget: errorBudget })} disabled={loading}>
                {loading ? "计算中..." : "计算容错开销"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Error Model */}
        <TabsContent value="error-model">
          <Card>
            <CardHeader>
              <CardTitle>误差模型 (Error Model)</CardTitle>
              <CardDescription>Depolarizing/Amplitude Damping/Correlated/Erasure/Coherent — 量子噪声建模</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>噪声模型</Label>
                  <Select value={modelType} onValueChange={setModelType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ERROR_MODEL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>物理错误率</Label>
                  <Input type="number" value={physErrorRate} onChange={(e) => setPhysErrorRate(e.target.value)} step={0.0001} min={0.00001} max={0.5} />
                </div>
                <div className="space-y-2">
                  <Label>关联长度 ξ</Label>
                  <Input type="number" value={corrLength} onChange={(e) => setCorrLength(e.target.value)} step={0.1} min={0} max={100} />
                </div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-error-correction-topology/error-model", { model_type: modelType, physical_error_rate: physErrorRate, correlation_length: corrLength })} disabled={loading}>
                {loading ? "计算中..." : "分析误差模型"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threshold Analysis */}
        <TabsContent value="threshold">
          <Card>
            <CardHeader>
              <CardTitle>阈值分析 (Threshold Analysis)</CardTitle>
              <CardDescription>Code Capacity/Phenomenological/Circuit Level — 纠错阈值理论分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>分析类型</Label>
                  <Select value={threshType} onValueChange={setThreshType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{THRESHOLD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>最大距离 d_max</Label>
                  <Input type="number" value={maxDist} onChange={(e) => setMaxDist(e.target.value)} min={3} max={101} />
                </div>
                <div className="space-y-2">
                  <Label>蒙特卡洛试验次数</Label>
                  <Input type="number" value={numTrials} onChange={(e) => setNumTrials(e.target.value)} min={100} max={1000000} />
                </div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-error-correction-topology/threshold-analysis", { analysis_type: threshType, max_distance: maxDist, num_trials: numTrials })} disabled={loading}>
                {loading ? "计算中..." : "分析阈值"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
