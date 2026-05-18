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
const LQG_TYPES = [
  { value: "spin_network", label: "自旋网络 Spin Network" },
  { value: "area_operator", label: "面积算子 Area Op." },
  { value: "volume_operator", label: "体积算子 Volume Op." },
  { value: "holonomy_flux", label: "和乐-通量 Holonomy-Flux" },
  { value: "canonical_quantization", label: "正则量子化 Canonical" },
  { value: "ai_lqg", label: "AI圈量子 AI LQG" },
];

const SPIN_FOAM_TYPES = [
  { value: "barrett_crane", label: "Barrett-Crane BC" },
  { value: "engle_pereira_rovelli", label: "EPRL模型 EPRL" },
  { value: "eprl_fk", label: "EPRL-FK统一" },
  { value: "flipped_foam", label: "翻转泡沫 Flipped" },
  { value: "bosonic_spin_foam", label: "玻色泡沫 Bosonic" },
  { value: "ai_spin_foam", label: "AI自旋泡沫 AI SF" },
];

const CAUSAL_TRI_TYPES = [
  { value: "regge_calculus", label: "Regge演算 Regge" },
  { value: "simplicial_gravity", label: "单纯引力 Simplicial" },
  { value: "causal_dynamical", label: "因果动力学 CDT" },
  { value: "euclidean_dynamical", label: "欧氏动力学 EDT" },
  { value: "horava_lifshitz", label: "Horava-Lifshitz" },
  { value: "ai_triangulation", label: "AI三角化 AI Tri." },
];

const ASYMPTOTIC_TYPES = [
  { value: "weinberg_fixed_point", label: "Weinberg固定点" },
  { value: "renormalization_group", label: "重正化群 RG" },
  { value: "beta_function", label: "Beta函数 β(g)" },
  { value: "non_perturbative", label: "非微扰 Non-pert." },
  { value: "functional_rg", label: "泛函RG FRG" },
  { value: "ai_asymptotic", label: "AI渐近安全 AI AS" },
];

const CAUSAL_SET_TYPES = [
  { value: "discrete_causal", label: "离散因果 Discrete" },
  { value: "sprinkle_generation", label: "撒点生成 Sprinkle" },
  { value: "hawking_malament", label: "Hawking-Malament" },
  { value: "swerves_dynamics", label: "偏转动力学 Swerves" },
  { value: "sequential_growth", label: "序列增长 Sequential" },
  { value: "ai_causal_set", label: "AI因果集 AI CS" },
];

const QUANTUM_COSMO_TYPES = [
  { value: "wheeler_dewitt", label: "Wheeler-DeWitt" },
  { value: "hartle_hawking", label: "Hartle-Hawking" },
  { value: "loop_quantum_cosmology", label: "圈量子宇宙学 LQC" },
  { value: "inflation_paradigm", label: "暴胀范式 Inflation" },
  { value: "multiverse_landscape", label: "多重宇宙景观" },
  { value: "ai_quantum_cosmology", label: "AI量子宇宙 AI QC" },
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
export default function QuantumGravityPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // LQG
  const [lqgType, setLqgType] = useState("spin_network");
  const [immirziParam, setImmirziParam] = useState("0.274");
  const [spinLabel, setSpinLabel] = useState("1.0");
  const [graphSize, setGraphSize] = useState("100");
  const [triangDepth, setTriangDepth] = useState("4");

  // Spin Foam
  const [sfType, setSfType] = useState("barrett_crane");
  const [boundarySpin, setBoundarySpin] = useState("0.5");
  const [foamSteps, setFoamSteps] = useState("10");
  const [faceAmplitude, setFaceAmplitude] = useState("1.0");

  // Causal Triangulation
  const [ctType, setCtType] = useState("regge_calculus");
  const [simplices, setSimplices] = useState("10000");
  const [dimension, setDimension] = useState("4");
  const [couplingConstant, setCouplingConstant] = useState("1.0");

  // Asymptotic Safety
  const [asType, setAsType] = useState("weinberg_fixed_point");
  const [energyScale, setEnergyScale] = useState("1e19");
  const [truncationOrder, setTruncationOrder] = useState("2");
  const [runningCouplings, setRunningCouplings] = useState("3");

  // Causal Set
  const [csType, setCsType] = useState("discrete_causal");
  const [numElements, setNumElements] = useState("1000");
  const [density, setDensity] = useState("1.0");
  const [dimEstimate, setDimEstimate] = useState("4.0");

  // Quantum Cosmology
  const [qcType, setQcType] = useState("wheeler_dewitt");
  const [scaleFactor, setScaleFactor] = useState("1.0");
  const [hubbleParam, setHubbleParam] = useState("70.0");
  const [cosmologicalConst, setCosmologicalConst] = useState("0.00000000000000000000000000000000000000000000000001");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/quantum-gravity/overview`);
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
            Quantum Gravity Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 65 — 圈量子引力 / 自旋泡沫 / 因果三角化 / 渐近安全 / 因果集 / 量子宇宙学
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.313.0</Badge>
          <Badge variant="secondary">Layer 65</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lqg">圈量子引力</TabsTrigger>
          <TabsTrigger value="spin-foam">自旋泡沫</TabsTrigger>
          <TabsTrigger value="causal-tri">因果三角化</TabsTrigger>
          <TabsTrigger value="asymptotic">渐近安全</TabsTrigger>
          <TabsTrigger value="causal-set">因果集</TabsTrigger>
          <TabsTrigger value="quantum-cosmo">量子宇宙学</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Gravity Engine 概览</CardTitle>
              <CardDescription>
                量子引力统一引擎 — 6枚举 × 6值 = 36值, 7 API端点
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

        {/* Loop Quantum Gravity */}
        <TabsContent value="lqg">
          <Card>
            <CardHeader>
              <CardTitle>圈量子引力 (Loop Quantum Gravity)</CardTitle>
              <CardDescription>自旋网络/面积算子/体积算子 — 时空的离散量子几何</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>LQG类型</Label>
                  <Select value={lqgType} onValueChange={setLqgType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LQG_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Immirzi参数 γ</Label>
                  <Input type="number" value={immirziParam} onChange={(e) => setImmirziParam(e.target.value)} step={0.001} min={0.01} max={10} />
                </div>
                <div className="space-y-2">
                  <Label>自旋标签 j</Label>
                  <Input type="number" value={spinLabel} onChange={(e) => setSpinLabel(e.target.value)} step={0.5} min={0.5} max={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>图规模 |Γ|</Label>
                  <Input type="number" value={graphSize} onChange={(e) => setGraphSize(e.target.value)} min={1} max={10000} />
                </div>
                <div className="space-y-2">
                  <Label>三角化深度</Label>
                  <Input type="number" value={triangDepth} onChange={(e) => setTriangDepth(e.target.value)} min={1} max={20} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-gravity/loop-quantum-gravity", {
                  lqg_type: lqgType, immirzi_parameter: immirziParam,
                  spin_label: spinLabel, graph_size: graphSize, triangulation_depth: triangDepth
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析圈量子引力"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spin Foam */}
        <TabsContent value="spin-foam">
          <Card>
            <CardHeader>
              <CardTitle>自旋泡沫 (Spin Foam Models)</CardTitle>
              <CardDescription>Barrett-Crane/EPRL/EPRL-FK — LQG的路径积分实现</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>泡沫模型</Label>
                  <Select value={sfType} onValueChange={setSfType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SPIN_FOAM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>边界自旋 j_b</Label>
                  <Input type="number" value={boundarySpin} onChange={(e) => setBoundarySpin(e.target.value)} step={0.5} min={0.5} max={10} />
                </div>
                <div className="space-y-2">
                  <Label>泡沫步数</Label>
                  <Input type="number" value={foamSteps} onChange={(e) => setFoamSteps(e.target.value)} min={1} max={100} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>面振幅 A_f</Label>
                  <Input type="number" value={faceAmplitude} onChange={(e) => setFaceAmplitude(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-gravity/spin-foam", {
                  sf_type: sfType, boundary_spin: boundarySpin,
                  foam_steps: foamSteps, face_amplitude: faceAmplitude, edge_amplitude: "1.0"
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析自旋泡沫"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Causal Triangulation */}
        <TabsContent value="causal-tri">
          <Card>
            <CardHeader>
              <CardTitle>因果动力学三角化 (Causal Dynamical Triangulation)</CardTitle>
              <CardDescription>Regge/CDT/Horava-Lifshitz — 从离散构建时空</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>三角化类型</Label>
                  <Select value={ctType} onValueChange={setCtType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CAUSAL_TRI_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>单纯形数 N</Label>
                  <Input type="number" value={simplices} onChange={(e) => setSimplices(e.target.value)} min={100} max={1000000} />
                </div>
                <div className="space-y-2">
                  <Label>维度 d</Label>
                  <Input type="number" value={dimension} onChange={(e) => setDimension(e.target.value)} min={2} max={11} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>耦合常数 G</Label>
                  <Input type="number" value={couplingConstant} onChange={(e) => setCouplingConstant(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-gravity/causal-triangulation", {
                  ct_type: ctType, simplices: simplices,
                  dimension: dimension, coupling_constant: couplingConstant, time_slicing: "causal"
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析因果三角化"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asymptotic Safety */}
        <TabsContent value="asymptotic">
          <Card>
            <CardHeader>
              <CardTitle>渐近安全 (Asymptotic Safety)</CardTitle>
              <CardDescription>Weinberg固定点/泛函重正化群 — 量子引力的可重正化路径</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>渐近安全类型</Label>
                  <Select value={asType} onValueChange={setAsType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ASYMPTOTIC_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>能标 E (GeV)</Label>
                  <Input type="text" value={energyScale} onChange={(e) => setEnergyScale(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>截断阶数</Label>
                  <Input type="number" value={truncationOrder} onChange={(e) => setTruncationOrder(e.target.value)} min={1} max={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>跑动耦合数</Label>
                  <Input type="number" value={runningCouplings} onChange={(e) => setRunningCouplings(e.target.value)} min={1} max={20} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-gravity/asymptotic-safety", {
                  as_type: asType, energy_scale: energyScale,
                  truncation_order: truncationOrder, running_couplings: runningCouplings, fixed_point_accuracy: "1e-10"
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析渐近安全"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Causal Set */}
        <TabsContent value="causal-set">
          <Card>
            <CardHeader>
              <CardTitle>因果集理论 (Causal Set Theory)</CardTitle>
              <CardDescription>离散因果序/撒点生成/Hawking-Malament — 序+数=几何</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>因果集类型</Label>
                  <Select value={csType} onValueChange={setCsType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CAUSAL_SET_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>元素数 N</Label>
                  <Input type="number" value={numElements} onChange={(e) => setNumElements(e.target.value)} min={10} max={1000000} />
                </div>
                <div className="space-y-2">
                  <Label>密度 ρ</Label>
                  <Input type="number" value={density} onChange={(e) => setDensity(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>维度估计 d</Label>
                  <Input type="number" value={dimEstimate} onChange={(e) => setDimEstimate(e.target.value)} step={0.1} min={1} max={11} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-gravity/causal-set", {
                  cs_type: csType, num_elements: numElements,
                  density: density, dimension_estimate: dimEstimate, sprinkling_method: "poisson"
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析因果集"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quantum Cosmology */}
        <TabsContent value="quantum-cosmo">
          <Card>
            <CardHeader>
              <CardTitle>量子宇宙学 (Quantum Cosmology)</CardTitle>
              <CardDescription>Wheeler-DeWitt/Hartle-Hawking/圈量子宇宙学 — 宇宙的量子起源</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>宇宙学类型</Label>
                  <Select value={qcType} onValueChange={setQcType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QUANTUM_COSMO_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>标度因子 a</Label>
                  <Input type="number" value={scaleFactor} onChange={(e) => setScaleFactor(e.target.value)} step={0.1} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>Hubble参数 H₀</Label>
                  <Input type="number" value={hubbleParam} onChange={(e) => setHubbleParam(e.target.value)} step={1} min={1} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>宇宙学常数 Λ</Label>
                  <Input type="text" value={cosmologicalConst} onChange={(e) => setCosmologicalConst(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-gravity/quantum-cosmology", {
                  qc_type: qcType, scale_factor: scaleFactor,
                  hubble_parameter: hubbleParam, cosmological_constant: cosmologicalConst, matter_content: "standard_model"
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析量子宇宙学"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="text-center text-xs text-muted-foreground">
        Layer 65 — Quantum Gravity Engine v1.313.0 | 6 Enums × 6 Values = 36 | 7 Endpoints | Config Space: 6⁶ = 46656
      </div>
    </div>
  );
}
