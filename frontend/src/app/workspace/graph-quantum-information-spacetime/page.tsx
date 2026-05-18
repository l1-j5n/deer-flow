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
const QUBIT_TYPES = [
  { value: "spacetime_emergence", label: "时空涌现 Emergent" },
  { value: "entanglement_geometry", label: "纠缠几何 EntGL" },
  { value: "quantum_causal_set", label: "量子因果集 QCausal" },
  { value: "holographic_screen", label: "全息屏 HoloScreen" },
  { value: "quantum_graphity", label: "量子图度 Graphity" },
  { value: "ai_it_from_qubit", label: "AI It from Qubit" },
];

const TENSOR_TYPES = [
  { value: "mera_network", label: "MERA网络" },
  { value: "random_tensor", label: "随机张量 RTN" },
  { value: "perfect_tensor", label: "完美张量 Perfect" },
  { value: "multi_scale_entanglement", label: "多尺度纠缠 MSE" },
  { value: "holographic_code", label: "全息码 HaPPY" },
  { value: "ai_tensor_network", label: "AI张量网络 AI TN" },
];

const QEC_TYPES = [
  { value: "ads_cft_code", label: "AdS/CFT码" },
  { value: "ryu_takayanagi_code", label: "RT码 Ryu-Tak." },
  { value: "entanglement_wedge_code", label: "纠缠楔码 EW" },
  { value: "petz_recovery", label: "Petz恢复 Petz" },
  { value: "complementary_reconstruction", label: "互补重构 Comp." },
  { value: "ai_qec_gravity", label: "AI量子纠错 AI QEC" },
];

const SYK_TYPES = [
  { value: "syk_model", label: "SYK模型" },
  { value: "sachdev_ye", label: "Sachdev-Ye SY" },
  { value: "colored_syk", label: "彩色SYK Colored" },
  { value: "complex_syk", label: "复杂SYK Complex" },
  { value: "jackiw_teitelboim", label: "JT引力 JT" },
  { value: "ai_syk", label: "AI SYK" },
];

const COMPLEXITY_TYPES = [
  { value: "circuit_complexity", label: "线路复杂性 Circuit" },
  { value: "nielsen_geometry", label: "Nielsen几何" },
  { value: "complexity_action", label: "CA 复杂性=作用量" },
  { value: "complexity_volume", label: "CV 复杂性=体积" },
  { value: "complexity_spacetime", label: "复杂性时空 CST" },
  { value: "ai_complexity", label: "AI复杂性 AI Cmplx" },
];

const ERB_TYPES = [
  { value: "traversable_erb", label: "可穿越ERB Trav." },
  { value: "ertpr_conjecture", label: "ER=EPR猜想" },
  { value: "quantum_wormhole", label: "量子虫洞 QWH" },
  { value: "eternal_blackhole", label: "永恒黑洞 Eternal" },
  { value: "multi_boundary", label: "多边界虫洞 Multi" },
  { value: "ai_erb", label: "AI ERB" },
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
export default function QuantumInformationSpacetimePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // It from Qubit
  const [qubitType, setQubitType] = useState("spacetime_emergence");
  const [numQubits, setNumQubits] = useState("100");
  const [entanglementEntropy, setEntanglementEntropy] = useState("0.5");
  const [spacetimeDimQubit, setSpacetimeDimQubit] = useState("4");
  const [qubitCoupling, setQubitCoupling] = useState("1.0");

  // Tensor Network
  const [tensorType, setTensorType] = useState("mera_network");
  const [bondDimension, setBondDimension] = useState("2");
  const [networkDepth, setNetworkDepth] = useState("10");
  const [hilbertDim, setHilbertDim] = useState("4");
  const [entanglementCut, setEntanglementCut] = useState("0.5");

  // QEC Gravity
  const [qecType, setQecType] = useState("ads_cft_code");
  const [codeDistance, setCodeDistance] = useState("5");
  const [logicalQubits, setLogicalQubits] = useState("1");
  const [physicalQubits, setPhysicalQubits] = useState("25");
  const [errorRate, setErrorRate] = useState("0.01");

  // SYK
  const [sykType, setSykType] = useState("syk_model");
  const [numFermions, setNumFermions] = useState("100");
  const [interactionOrder, setInteractionOrder] = useState("4");
  const [couplingVariance, setCouplingVariance] = useState("1.0");
  const [sykTemperature, setSykTemperature] = useState("1.0");

  // Complexity
  const [complexityType, setComplexityType] = useState("circuit_complexity");
  const [circuitDepth, setCircuitDepth] = useState("100");
  const [gateSetSize, setGateSetSize] = useState("4");
  const [targetUnitaryDim, setTargetUnitaryDim] = useState("2");
  const [geodesicLength, setGeodesicLength] = useState("10.0");

  // ERB
  const [erbType, setErbType] = useState("traversable_erb");
  const [throatLength, setThroatLength] = useState("1.0");
  const [throatRadius, setThroatRadius] = useState("1.0");
  const [erbCoupling, setErbCoupling] = useState("0.1");
  const [entangledPairs, setEntangledPairs] = useState("1");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/quantum-information-spacetime/overview`);
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
            Quantum Information Spacetime Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 67 — It from Qubit / 张量网络时空 / 量子纠错引力 / SYK模型 / 量子复杂性几何 / ERB桥
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.315.0</Badge>
          <Badge variant="secondary">Layer 67</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="it-from-qubit">It from Qubit</TabsTrigger>
          <TabsTrigger value="tensor-network">张量网络时空</TabsTrigger>
          <TabsTrigger value="qec-gravity">量子纠错引力</TabsTrigger>
          <TabsTrigger value="syk">SYK模型</TabsTrigger>
          <TabsTrigger value="complexity">量子复杂性</TabsTrigger>
          <TabsTrigger value="erb">ERB桥</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Information Spacetime Engine 概览</CardTitle>
              <CardDescription>
                量子信息时空引擎 — 6枚举 × 6值 = 36值, 7 API端点
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

        {/* It from Qubit */}
        <TabsContent value="it-from-qubit">
          <Card>
            <CardHeader>
              <CardTitle>It from Qubit (时空源于量子比特)</CardTitle>
              <CardDescription>时空涌现/纠缠几何/量子因果集/全息屏 — &apos;It from Qubit&apos; 范式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>量子比特类型</Label>
                  <Select value={qubitType} onValueChange={setQubitType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QUBIT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>量子比特数 N</Label>
                  <Input type="number" value={numQubits} onChange={(e) => setNumQubits(e.target.value)} min={1} max={10000} />
                </div>
                <div className="space-y-2">
                  <Label>纠缠熵 S_EE</Label>
                  <Input type="number" value={entanglementEntropy} onChange={(e) => setEntanglementEntropy(e.target.value)} step={0.01} min={0} max={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>时空维度 D</Label>
                  <Input type="number" value={spacetimeDimQubit} onChange={(e) => setSpacetimeDimQubit(e.target.value)} min={2} max={11} />
                </div>
                <div className="space-y-2">
                  <Label>耦合常数 g</Label>
                  <Input type="number" value={qubitCoupling} onChange={(e) => setQubitCoupling(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-information-spacetime/it-from-qubit", {
                  qubit_type: qubitType, num_qubits: numQubits,
                  entanglement_entropy: entanglementEntropy, spacetime_dim: spacetimeDimQubit, coupling: qubitCoupling
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析It from Qubit"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tensor Network Spacetime */}
        <TabsContent value="tensor-network">
          <Card>
            <CardHeader>
              <CardTitle>张量网络时空 (Tensor Network Spacetime)</CardTitle>
              <CardDescription>MERA/随机张量/完美张量/全息码 — 张量网络实现全息对应</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>网络类型</Label>
                  <Select value={tensorType} onValueChange={setTensorType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TENSOR_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>键维度 χ</Label>
                  <Input type="number" value={bondDimension} onChange={(e) => setBondDimension(e.target.value)} min={2} max={1000} />
                </div>
                <div className="space-y-2">
                  <Label>网络深度 d</Label>
                  <Input type="number" value={networkDepth} onChange={(e) => setNetworkDepth(e.target.value)} min={1} max={100} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hilbert空间维数</Label>
                  <Input type="number" value={hilbertDim} onChange={(e) => setHilbertDim(e.target.value)} min={2} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>纠缠截断</Label>
                  <Input type="number" value={entanglementCut} onChange={(e) => setEntanglementCut(e.target.value)} step={0.01} min={0} max={1} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-information-spacetime/tensor-network-spacetime", {
                  network_type: tensorType, bond_dimension: bondDimension,
                  network_depth: networkDepth, hilbert_dim: hilbertDim, entanglement_cut: entanglementCut
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析张量网络"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* QEC Gravity */}
        <TabsContent value="qec-gravity">
          <Card>
            <CardHeader>
              <CardTitle>量子纠错引力 (QEC Gravity)</CardTitle>
              <CardDescription>AdS/CFT码/RT码/纠缠楔码/Petz恢复 — 引力=量子纠错码</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>纠错码类型</Label>
                  <Select value={qecType} onValueChange={setQecType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QEC_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>码距离 d</Label>
                  <Input type="number" value={codeDistance} onChange={(e) => setCodeDistance(e.target.value)} min={1} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>逻辑量子比特 k</Label>
                  <Input type="number" value={logicalQubits} onChange={(e) => setLogicalQubits(e.target.value)} min={1} max={100} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>物理量子比特 n</Label>
                  <Input type="number" value={physicalQubits} onChange={(e) => setPhysicalQubits(e.target.value)} min={1} max={10000} />
                </div>
                <div className="space-y-2">
                  <Label>错误率 ε</Label>
                  <Input type="number" value={errorRate} onChange={(e) => setErrorRate(e.target.value)} step={0.001} min={0} max={1} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-information-spacetime/quantum-error-correction-gravity", {
                  code_type: qecType, code_distance: codeDistance,
                  logical_qubits: logicalQubits, physical_qubits: physicalQubits, error_rate: errorRate
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析量子纠错引力"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SYK */}
        <TabsContent value="syk">
          <Card>
            <CardHeader>
              <CardTitle>SYK模型 (Sachdev-Ye-Kitaev)</CardTitle>
              <CardDescription>SYK/Sachdev-Ye/彩色SYK/JT引力 — 最大混沌与AdS₂对偶</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>SYK类型</Label>
                  <Select value={sykType} onValueChange={setSykType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SYK_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>费米子数 N</Label>
                  <Input type="number" value={numFermions} onChange={(e) => setNumFermions(e.target.value)} min={4} max={10000} />
                </div>
                <div className="space-y-2">
                  <Label>相互作用阶 q</Label>
                  <Input type="number" value={interactionOrder} onChange={(e) => setInteractionOrder(e.target.value)} min={2} max={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>耦合方差 J²</Label>
                  <Input type="number" value={couplingVariance} onChange={(e) => setCouplingVariance(e.target.value)} step={0.1} min={0.01} />
                </div>
                <div className="space-y-2">
                  <Label>温度 T</Label>
                  <Input type="number" value={sykTemperature} onChange={(e) => setSykTemperature(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-information-spacetime/sachdev-ye-kitaev", {
                  syk_type: sykType, num_fermions: numFermions,
                  interaction_order: interactionOrder, coupling_variance: couplingVariance, temperature: sykTemperature
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析SYK模型"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complexity */}
        <TabsContent value="complexity">
          <Card>
            <CardHeader>
              <CardTitle>量子复杂性几何 (Quantum Complexity Geometry)</CardTitle>
              <CardDescription>线路复杂性/Nielsen几何/CA/CV — 复杂性=几何</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>复杂性类型</Label>
                  <Select value={complexityType} onValueChange={setComplexityType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COMPLEXITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>线路深度 D</Label>
                  <Input type="number" value={circuitDepth} onChange={(e) => setCircuitDepth(e.target.value)} min={1} max={10000} />
                </div>
                <div className="space-y-2">
                  <Label>门集大小 |G|</Label>
                  <Input type="number" value={gateSetSize} onChange={(e) => setGateSetSize(e.target.value)} min={1} max={100} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>目标酉矩阵维数</Label>
                  <Input type="number" value={targetUnitaryDim} onChange={(e) => setTargetUnitaryDim(e.target.value)} min={2} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>测地线长度 L</Label>
                  <Input type="number" value={geodesicLength} onChange={(e) => setGeodesicLength(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-information-spacetime/quantum-complexity-geometry", {
                  complexity_type: complexityType, circuit_depth: circuitDepth,
                  gate_set_size: gateSetSize, target_unitary_dim: targetUnitaryDim, geodesic_length: geodesicLength
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析量子复杂性"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ERB */}
        <TabsContent value="erb">
          <Card>
            <CardHeader>
              <CardTitle>ERB桥 (Einstein-Rosen Bridge)</CardTitle>
              <CardDescription>可穿越ERB/ER=EPR/量子虫洞/永恒黑洞 — 时空连通性</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>ERB类型</Label>
                  <Select value={erbType} onValueChange={setErbType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ERB_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>喉部长度 L_t</Label>
                  <Input type="number" value={throatLength} onChange={(e) => setThroatLength(e.target.value)} step={0.1} min={0.01} />
                </div>
                <div className="space-y-2">
                  <Label>喉部半径 r_t</Label>
                  <Input type="number" value={throatRadius} onChange={(e) => setThroatRadius(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>耦合常数 g_c</Label>
                  <Input type="number" value={erbCoupling} onChange={(e) => setErbCoupling(e.target.value)} step={0.01} min={0.001} />
                </div>
                <div className="space-y-2">
                  <Label>纠缠对数 n_EPR</Label>
                  <Input type="number" value={entangledPairs} onChange={(e) => setEntangledPairs(e.target.value)} min={1} max={1000} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-information-spacetime/einstein-rosen-bridge", {
                  erb_type: erbType, throat_length: throatLength,
                  throat_radius: throatRadius, coupling_constant: erbCoupling, entangled_pairs: entangledPairs
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析ERB桥"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="text-center text-xs text-muted-foreground">
        Layer 67 — Quantum Information Spacetime Engine v1.315.0 | 6 Enums × 6 Values = 36 | 7 Endpoints | Config Space: 6⁶ = 46656
      </div>
    </div>
  );
}
