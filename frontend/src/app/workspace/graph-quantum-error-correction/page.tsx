"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Types
interface OverviewData {
  layer: number;
  version: string;
  engine: string;
  description: string;
  enums: Record<string, string[]>;
  enum_count: number;
  endpoints: { method: string; path: string; desc: string }[];
  endpoint_count: number;
  config_space: number;
  cache_stats: Record<string, number>;
}

// Enum option constants
const QUANTUM_CODE_TYPES = [
  { value: "surface_code", label: "表面码 Surface Code" },
  { value: "color_code", label: "色码 Color Code" },
  { value: "stabilizer_code", label: "稳定子码 Stabilizer" },
  { value: "ldpc_code", label: "LDPC码 LDPC" },
  { value: "topological_code", label: "拓扑码 Topological" },
  { value: "ai_quantum_code", label: "AI纠错码 AI Code" },
];

const FAULT_TOLERANT_TYPES = [
  { value: "magic_state_distillation", label: "魔术态蒸馏 Magic State" },
  { value: "transversal_gate", label: "横向门 Transversal" },
  { value: "error_correction_circuit", label: "纠错线路 EC Circuit" },
  { value: "threshold_theorem", label: "阈值定理 Threshold" },
  { value: "measurement_based", label: "测量基 MBQC" },
  { value: "ai_fault_tolerant", label: "AI容错 AI FT" },
];

const DECODING_TYPES = [
  { value: "tensor_network_decoder", label: "张量网络 Tensor Net" },
  { value: "mwpm_decoder", label: "MWPM译码 MWPM" },
  { value: "belief_propagation", label: "信念传播 BP" },
  { value: "reinforcement_learning", label: "强化学习 RL" },
  { value: "maximum_likelihood", label: "最大似然 ML" },
  { value: "ai_decoding", label: "AI译码 AI Decode" },
];

const HOLOGRAPHIC_TYPES = [
  { value: "ads_cft_qec", label: "AdS/CFT纠错 ADH" },
  { value: "ryu_takayanagi", label: "Ryu-Takayanagi RT" },
  { value: "quantum_extremal", label: "量子极强面 QES" },
  { value: "entanglement_wedge", label: "纠缠楔 E-Wedge" },
  { value: "complementary_channel", label: "补码通道 Compl. Ch." },
  { value: "ai_holographic_qec", label: "AI全息纠错 AI Holo" },
];

const TOPO_QC_TYPES = [
  { value: "anyon_braiding", label: "任意子编织 Braiding" },
  { value: "braiding_statistics", label: "编织统计 Statistics" },
  { value: "toric_code", label: "Toric码 Toric" },
  { value: "fiber_bundle_computation", label: "纤维丛 Fiber Bundle" },
  { value: "fqhe_computation", label: "FQHE计算 FQHE" },
  { value: "ai_topological_qc", label: "AI拓扑计算 AI Topo" },
];

const QUANTUM_INFO_TYPES = [
  { value: "quantum_shannon", label: "量子Shannon Q-Shannon" },
  { value: "quantum_capacity", label: "量子容量 Q-Capacity" },
  { value: "holevo_bound", label: "Holevo界 Holevo" },
  { value: "quantum_random", label: "量子随机 QRNG" },
  { value: "decoherence_channel", label: "退相干通道 Decoherence" },
  { value: "ai_quantum_info", label: "AI量子信息 AI QInfo" },
];

const API_BASE = "http://localhost:8001";

// Helper
function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-96 font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// Main Component
export default function QuantumErrorCorrectionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // Quantum Code
  const [codeType, setCodeType] = useState("surface_code");
  const [distance, setDistance] = useState("3");
  const [physicalQubits, setPhysicalQubits] = useState("9");
  const [logicalQubits, setLogicalQubits] = useState("1");
  const [errorRate, setErrorRate] = useState("0.001");

  // Fault Tolerant
  const [ftType, setFtType] = useState("magic_state_distillation");
  const [errorThreshold, setErrorThreshold] = useState("0.01");
  const [gateDepth, setGateDepth] = useState("1000");
  const [logicalErrorRate, setLogicalErrorRate] = useState("0.000001");

  // Decoding
  const [decodingType, setDecodingType] = useState("tensor_network_decoder");
  const [syndromePattern, setSyndromePattern] = useState("random");
  const [codeDistance, setCodeDistance] = useState("5");
  const [noiseModel, setNoiseModel] = useState("depolarizing");

  // Holographic QEC
  const [holoType, setHoloType] = useState("ads_cft_qec");
  const [adsRadius, setAdsRadius] = useState("1.0");
  const [boundaryDim, setBoundaryDim] = useState("4");
  const [codeSubspaceDim, setCodeSubspaceDim] = useState("8");

  // Topological QC
  const [topoType, setTopoType] = useState("anyon_braiding");
  const [anyonType, setAnyonType] = useState("fibonacci");
  const [braidLength, setBraidLength] = useState("10");
  const [topology, setTopology] = useState("torus");

  // Quantum Info
  const [infoType, setInfoType] = useState("quantum_shannon");
  const [channelDim, setChannelDim] = useState("2");
  const [noiseStrength, setNoiseStrength] = useState("0.1");
  const [encodingType, setEncodingType] = useState("random_unitary");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/quantum-error-correction/overview`);
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
            Quantum Error Correction Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 64 — 量子纠错码 / 容错量子计算 / 纠缠译码 / 全息纠错 / 拓扑量子计算 / 量子信息论
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.312.0</Badge>
          <Badge variant="secondary">Layer 64</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quantum-code">纠错码</TabsTrigger>
          <TabsTrigger value="fault-tolerant">容错计算</TabsTrigger>
          <TabsTrigger value="decoding">纠缠译码</TabsTrigger>
          <TabsTrigger value="holographic-qec">全息纠错</TabsTrigger>
          <TabsTrigger value="topological-qc">拓扑QC</TabsTrigger>
          <TabsTrigger value="quantum-info">量子信息</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Error Correction Engine 概览</CardTitle>
              <CardDescription>
                量子纠错统一引擎 — 6枚举 × 6值 = 36值, 7 API端点
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchOverview} disabled={loading}>
                {loading ? "加载中..." : "获取概览"}
              </Button>
              {overview && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>枚举数</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overview.enum_count}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>端点数</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overview.endpoint_count}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>配置空间</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overview.config_space.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>缓存命中</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Object.values(overview.cache_stats).reduce((a, b) => a + b, 0)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quantum Code */}
        <TabsContent value="quantum-code">
          <Card>
            <CardHeader>
              <CardTitle>量子纠错码 (Quantum Error Correction Codes)</CardTitle>
              <CardDescription>表面码/色码/稳定子码/LDPC码 — 保护量子信息的核心编码</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>码类型</Label>
                  <Select value={codeType} onValueChange={setCodeType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QUANTUM_CODE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>码距 d</Label>
                  <Input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} min={1} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>物理量子比特 n</Label>
                  <Input type="number" value={physicalQubits} onChange={(e) => setPhysicalQubits(e.target.value)} min={1} max={10000} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>逻辑量子比特 k</Label>
                  <Input type="number" value={logicalQubits} onChange={(e) => setLogicalQubits(e.target.value)} min={1} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>物理错误率 p</Label>
                  <Input type="number" value={errorRate} onChange={(e) => setErrorRate(e.target.value)} step={0.0001} min={0} max={1} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-error-correction/quantum-code", {
                  code_type: codeType, distance: distance,
                  physical_qubits: physicalQubits, logical_qubits: logicalQubits,
                  error_rate: errorRate
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析量子纠错码"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fault Tolerant */}
        <TabsContent value="fault-tolerant">
          <Card>
            <CardHeader>
              <CardTitle>容错量子计算 (Fault-Tolerant QC)</CardTitle>
              <CardDescription>魔术态蒸馏/横向门/阈值定理 — 在噪声中实现可靠量子计算</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>容错类型</Label>
                  <Select value={ftType} onValueChange={setFtType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FAULT_TOLERANT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>错误阈值</Label>
                  <Input type="number" value={errorThreshold} onChange={(e) => setErrorThreshold(e.target.value)} step={0.001} min={0} max={1} />
                </div>
                <div className="space-y-2">
                  <Label>门深度</Label>
                  <Input type="number" value={gateDepth} onChange={(e) => setGateDepth(e.target.value)} min={1} max={1000000} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>目标逻辑错误率</Label>
                  <Input type="number" value={logicalErrorRate} onChange={(e) => setLogicalErrorRate(e.target.value)} step={0.0000001} min={0} max={1} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-error-correction/fault-tolerant", {
                  ft_type: ftType, error_threshold: errorThreshold,
                  gate_depth: gateDepth, logical_error_rate: logicalErrorRate
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析容错量子计算"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entanglement Decoding */}
        <TabsContent value="decoding">
          <Card>
            <CardHeader>
              <CardTitle>纠缠译码 (Entanglement-Assisted Decoding)</CardTitle>
              <CardDescription>张量网络/MWPM/信念传播译码器 — 从量子噪声中恢复信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>译码算法</Label>
                  <Select value={decodingType} onValueChange={setDecodingType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DECODING_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>伴随式模式</Label>
                  <Select value={syndromePattern} onValueChange={setSyndromePattern}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">随机 Random</SelectItem>
                      <SelectItem value="correlated">关联 Correlated</SelectItem>
                      <SelectItem value="burst">突发 Burst</SelectItem>
                      <SelectItem value="sparse">稀疏 Sparse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>码距 d</Label>
                  <Input type="number" value={codeDistance} onChange={(e) => setCodeDistance(e.target.value)} min={1} max={50} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>噪声模型</Label>
                  <Select value={noiseModel} onValueChange={setNoiseModel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="depolarizing">去极化 Depolarizing</SelectItem>
                      <SelectItem value="amplitude_damping">振幅阻尼 Amp. Damp.</SelectItem>
                      <SelectItem value="phase_damping">相位阻尼 Phase Damp.</SelectItem>
                      <SelectItem value="erasure">擦除 Erasure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-error-correction/entanglement-decoding", {
                  decoding_type: decodingType, syndrome_pattern: syndromePattern,
                  code_distance: codeDistance, noise_model: noiseModel, iterations: "1000"
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析纠缠译码"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Holographic QEC */}
        <TabsContent value="holographic-qec">
          <Card>
            <CardHeader>
              <CardTitle>全息量子纠错 (Holographic QEC)</CardTitle>
              <CardDescription>AdS/CFT纠错/Ryu-Takayanagi公式/量子极强面 — 量子纠错的全息实现</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>全息类型</Label>
                  <Select value={holoType} onValueChange={setHoloType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HOLOGRAPHIC_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>AdS半径 L</Label>
                  <Input type="number" value={adsRadius} onChange={(e) => setAdsRadius(e.target.value)} step={0.1} min={0.01} />
                </div>
                <div className="space-y-2">
                  <Label>边界维度 d</Label>
                  <Input type="number" value={boundaryDim} onChange={(e) => setBoundaryDim(e.target.value)} min={1} max={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>码子空间维度 k</Label>
                  <Input type="number" value={codeSubspaceDim} onChange={(e) => setCodeSubspaceDim(e.target.value)} min={1} max={256} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-error-correction/holographic-qec", {
                  holo_type: holoType, ads_radius: adsRadius,
                  boundary_dim: boundaryDim, code_subspace_dim: codeSubspaceDim,
                  central_charge: "1.0"
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析全息纠错"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Topological QC */}
        <TabsContent value="topological-qc">
          <Card>
            <CardHeader>
              <CardTitle>拓扑量子计算 (Topological QC)</CardTitle>
              <CardDescription>任意子编织/Toric码/纤维丛 — 拓扑保护的自然量子计算</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>拓扑类型</Label>
                  <Select value={topoType} onValueChange={setTopoType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TOPO_QC_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>任意子类型</Label>
                  <Select value={anyonType} onValueChange={setAnyonType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fibonacci">Fibonacci (通用)</SelectItem>
                      <SelectItem value="ising">Ising (非通用)</SelectItem>
                      <SelectItem value="semion">Semion (Abelian)</SelectItem>
                      <SelectItem value="fibonacci_2">Fibonacci-2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>编织长度</Label>
                  <Input type="number" value={braidLength} onChange={(e) => setBraidLength(e.target.value)} min={1} max={1000} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>拓扑空间</Label>
                  <Select value={topology} onValueChange={setTopology}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="torus">环面 Torus (g=1)</SelectItem>
                      <SelectItem value="sphere">球面 Sphere (g=0)</SelectItem>
                      <SelectItem value="genus_2">双孔环面 (g=2)</SelectItem>
                      <SelectItem value="projective_plane">射影平面 RP²</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-error-correction/topological-qc", {
                  topo_type: topoType, anyon_type: anyonType,
                  braid_length: braidLength, topology: topology, degeneracy: "4"
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析拓扑量子计算"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quantum Info */}
        <TabsContent value="quantum-info">
          <Card>
            <CardHeader>
              <CardTitle>量子信息论 (Quantum Information Theory)</CardTitle>
              <CardDescription>量子Shannon/量子容量/Holevo界 — 量子信息传输的终极极限</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>信息类型</Label>
                  <Select value={infoType} onValueChange={setInfoType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QUANTUM_INFO_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>信道维度 d</Label>
                  <Input type="number" value={channelDim} onChange={(e) => setChannelDim(e.target.value)} min={2} max={256} />
                </div>
                <div className="space-y-2">
                  <Label>噪声强度</Label>
                  <Input type="number" value={noiseStrength} onChange={(e) => setNoiseStrength(e.target.value)} step={0.01} min={0} max={1} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>编码类型</Label>
                  <Select value={encodingType} onValueChange={setEncodingType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random_unitary">随机酉 Random Unitary</SelectItem>
                      <SelectItem value="stabilizer_encoding">稳定子编码 Stabilizer</SelectItem>
                      <SelectItem value="polar_code">极化码 Polar</SelectItem>
                      <SelectItem value="tensor_network">张量网络 Tensor Net</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-error-correction/quantum-info", {
                  info_type: infoType, channel_dim: channelDim,
                  input_states: "4", noise_strength: noiseStrength, encoding_type: encodingType
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析量子信息论"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="text-center text-xs text-muted-foreground">
        Layer 64 — Quantum Error Correction Engine v1.312.0 | 6 Enums × 6 Values = 36 | 7 Endpoints | Config Space: 6⁶ = 46656
      </div>
    </div>
  );
}
