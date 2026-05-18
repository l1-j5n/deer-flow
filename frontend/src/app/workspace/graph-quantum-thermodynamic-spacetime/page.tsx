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
const ENTROPY_TYPES = [
  { value: "von_neumann_entropy", label: "Von Neumann熵" },
  { value: "renyi_entropy", label: "Rényi熵" },
  { value: "entanglement_entropy", label: "纠缠熵 EE" },
  { value: "topological_entropy", label: "拓扑熵 Topo." },
  { value: "relative_entropy", label: "相对熵 Relative" },
  { value: "ai_quantum_entropy", label: "AI量子熵 AI QE" },
];

const THERMAL_TYPES = [
  { value: "hawking_temperature", label: "Hawking温度" },
  { value: "unruh_effect", label: "Unruh效应" },
  { value: "gibbons_hawking", label: "Gibbons-Hawking" },
  { value: "thermalization_spacetime", label: "热化时空 ThST" },
  { value: "kms_state", label: "KMS态" },
  { value: "ai_thermal_spacetime", label: "AI热时空 AI TS" },
];

const FREE_ENERGY_TYPES = [
  { value: "helmholtz_free_energy", label: "Helmholtz自由能" },
  { value: "gibbs_free_energy", label: "Gibbs自由能" },
  { value: "partition_function", label: "配分函数 Z" },
  { value: "thermodynamic_potential", label: "热力学势 ThPot." },
  { value: "free_energy_landscape", label: "自由能景观 FEL" },
  { value: "ai_free_energy_gravity", label: "AI自由能 AI FE" },
];

const FLUCTUATION_TYPES = [
  { value: "fluctuation_dissipation", label: "涨落耗散 FDT" },
  { value: "quantum_noise", label: "量子噪声 QNoise" },
  { value: "stochastic_quantum", label: "随机量子 Stoch." },
  { value: "thermal_fluctuation", label: "热涨落 ThFluc." },
  { value: "quantum_shot_noise", label: "量子散粒噪声" },
  { value: "ai_quantum_fluctuation", label: "AI量子涨落 AI QF" },
];

const THERMALIZATION_TYPES = [
  { value: "thermalization_dynamics", label: "热化动力学" },
  { value: "eigenstate_thermalization", label: "本征态热化 ETH" },
  { value: "quantum_typicality", label: "量子典型性 QT" },
  { value: "random_matrix_thermal", label: "随机矩阵热化 RMT" },
  { value: "entanglement_spreading", label: "纠缠传播 ESpread" },
  { value: "ai_entanglement_thermal", label: "AI纠缠热化 AI ET" },
];

const BLACKHOLE_TYPES = [
  { value: "bekenstein_hawking_entropy", label: "Bekenstein-Hawking熵" },
  { value: "hawking_radiation", label: "Hawking辐射" },
  { value: "blackhole_phase_transition", label: "黑洞相变 BHPT" },
  { value: "information_paradox", label: "信息悖论 InfoPar." },
  { value: "page_curve", label: "Page曲线" },
  { value: "ai_blackhole_thermo", label: "AI黑洞热力学 AI BH" },
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
export default function QuantumThermodynamicSpacetimePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // Quantum Entropy
  const [entropyType, setEntropyType] = useState("von_neumann_entropy");
  const [numStates, setNumStates] = useState("64");
  const [entropyValue, setEntropyValue] = useState("0.5");
  const [temperature, setTemperature] = useState("1.0");
  const [resolution, setResolution] = useState("10");

  // Thermal Spacetime
  const [thermalType, setThermalType] = useState("hawking_temperature");
  const [surfaceGravity, setSurfaceGravity] = useState("1.0");
  const [observerAccel, setObserverAccel] = useState("1.0");
  const [cosmologicalConstant, setCosmologicalConstant] = useState("0.01");
  const [spacetimeDim, setSpacetimeDim] = useState("4");

  // Free Energy Gravity
  const [freeEnergyType, setFreeEnergyType] = useState("helmholtz_free_energy");
  const [numConfigs, setNumConfigs] = useState("100");
  const [beta, setBeta] = useState("1.0");
  const [energyScale, setEnergyScale] = useState("1.0");
  const [coupling, setCoupling] = useState("0.1");

  // Quantum Fluctuation
  const [fluctuationType, setFluctuationType] = useState("fluctuation_dissipation");
  const [noiseAmplitude, setNoiseAmplitude] = useState("0.1");
  const [correlationTime, setCorrelationTime] = useState("1.0");
  const [dissipationRate, setDissipationRate] = useState("0.5");
  const [systemSize, setSystemSize] = useState("100");

  // Entanglement Thermal
  const [thermalizationType, setThermalizationType] = useState("thermalization_dynamics");
  const [hilbertDim, setHilbertDim] = useState("1024");
  const [energyDensity, setEnergyDensity] = useState("0.5");
  const [interactionStrength, setInteractionStrength] = useState("1.0");
  const [evolutionTime, setEvolutionTime] = useState("10.0");

  // Black Hole Thermo
  const [bhType, setBhType] = useState("bekenstein_hawking_entropy");
  const [blackholeMass, setBlackholeMass] = useState("10.0");
  const [angularMomentum, setAngularMomentum] = useState("0.0");
  const [charge, setCharge] = useState("0.0");
  const [numModes, setNumModes] = useState("100");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/quantum-thermodynamic-spacetime/overview`);
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
            Quantum Thermodynamic Spacetime Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 68 — 量子熵 / 热力学时空 / 自由能引力 / 量子涨落 / 纠缠热化 / 黑洞热力学
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.316.0</Badge>
          <Badge variant="secondary">Layer 68</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="quantum-entropy">量子熵</TabsTrigger>
          <TabsTrigger value="thermal-spacetime">热力学时空</TabsTrigger>
          <TabsTrigger value="free-energy">自由能引力</TabsTrigger>
          <TabsTrigger value="fluctuation">量子涨落</TabsTrigger>
          <TabsTrigger value="thermalization">纠缠热化</TabsTrigger>
          <TabsTrigger value="blackhole">黑洞热力学</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Thermodynamic Spacetime Engine 概览</CardTitle>
              <CardDescription>
                量子热力学时空引擎 — 6枚举 × 6值 = 36值, 7 API端点
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

        {/* Quantum Entropy */}
        <TabsContent value="quantum-entropy">
          <Card>
            <CardHeader>
              <CardTitle>量子熵 (Quantum Entropy)</CardTitle>
              <CardDescription>Von Neumann熵 / Rényi熵 / 纠缠熵 / 拓扑熵 / 相对熵 — 量子信息理论基础</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>熵类型</Label>
                  <Select value={entropyType} onValueChange={setEntropyType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ENTROPY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>状态数 N</Label>
                  <Input type="number" value={numStates} onChange={(e) => setNumStates(e.target.value)} min={2} max={100000} />
                </div>
                <div className="space-y-2">
                  <Label>熵值 S</Label>
                  <Input type="number" value={entropyValue} onChange={(e) => setEntropyValue(e.target.value)} step={0.01} min={0} max={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>温度 T</Label>
                  <Input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} step={0.1} min={0.001} />
                </div>
                <div className="space-y-2">
                  <Label>Rényi阶 α</Label>
                  <Input type="number" value={resolution} onChange={(e) => setResolution(e.target.value)} min={1} max={100} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-thermodynamic-spacetime/quantum-entropy", {
                  entropy_type: entropyType, num_states: numStates,
                  entropy_value: entropyValue, temperature: temperature, resolution: resolution
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析量子熵"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Thermal Spacetime */}
        <TabsContent value="thermal-spacetime">
          <Card>
            <CardHeader>
              <CardTitle>热力学时空 (Thermal Spacetime)</CardTitle>
              <CardDescription>Hawking温度 / Unruh效应 / Gibbons-Hawking / KMS态 — 弯曲时空热力学</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>热力学类型</Label>
                  <Select value={thermalType} onValueChange={setThermalType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {THERMAL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>表面引力 κ</Label>
                  <Input type="number" value={surfaceGravity} onChange={(e) => setSurfaceGravity(e.target.value)} step={0.1} min={0.001} />
                </div>
                <div className="space-y-2">
                  <Label>观测者加速度 a</Label>
                  <Input type="number" value={observerAccel} onChange={(e) => setObserverAccel(e.target.value)} step={0.1} min={0} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>宇宙学常数 Λ</Label>
                  <Input type="number" value={cosmologicalConstant} onChange={(e) => setCosmologicalConstant(e.target.value)} step={0.001} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>时空维度 D</Label>
                  <Input type="number" value={spacetimeDim} onChange={(e) => setSpacetimeDim(e.target.value)} min={2} max={11} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-thermodynamic-spacetime/thermal-spacetime", {
                  thermal_type: thermalType, surface_gravity: surfaceGravity,
                  observer_accel: observerAccel, cosmological_constant: cosmologicalConstant, dimension: spacetimeDim
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析热力学时空"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Free Energy Gravity */}
        <TabsContent value="free-energy">
          <Card>
            <CardHeader>
              <CardTitle>自由能引力 (Free Energy Gravity)</CardTitle>
              <CardDescription>Helmholtz / Gibbs / 配分函数 / 自由能景观 — 引力与热力学势</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>自由能类型</Label>
                  <Select value={freeEnergyType} onValueChange={setFreeEnergyType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FREE_ENERGY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>配置数 N</Label>
                  <Input type="number" value={numConfigs} onChange={(e) => setNumConfigs(e.target.value)} min={1} max={10000} />
                </div>
                <div className="space-y-2">
                  <Label>逆温 β</Label>
                  <Input type="number" value={beta} onChange={(e) => setBeta(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>能量标度 E</Label>
                  <Input type="number" value={energyScale} onChange={(e) => setEnergyScale(e.target.value)} step={0.1} min={0.01} />
                </div>
                <div className="space-y-2">
                  <Label>耦合常数 g</Label>
                  <Input type="number" value={coupling} onChange={(e) => setCoupling(e.target.value)} step={0.01} min={0.001} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-thermodynamic-spacetime/free-energy-gravity", {
                  free_energy_type: freeEnergyType, num_configs: numConfigs,
                  beta: beta, energy_scale: energyScale, coupling: coupling
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析自由能引力"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quantum Fluctuation */}
        <TabsContent value="fluctuation">
          <Card>
            <CardHeader>
              <CardTitle>量子涨落 (Quantum Fluctuation)</CardTitle>
              <CardDescription>涨落耗散 / 量子噪声 / 随机量子 / 热涨落 — FDT与Casimir效应</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>涨落类型</Label>
                  <Select value={fluctuationType} onValueChange={setFluctuationType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FLUCTUATION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>噪声振幅</Label>
                  <Input type="number" value={noiseAmplitude} onChange={(e) => setNoiseAmplitude(e.target.value)} step={0.01} min={0.001} />
                </div>
                <div className="space-y-2">
                  <Label>关联时间 τ</Label>
                  <Input type="number" value={correlationTime} onChange={(e) => setCorrelationTime(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>耗散率 γ</Label>
                  <Input type="number" value={dissipationRate} onChange={(e) => setDissipationRate(e.target.value)} step={0.1} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>系统尺寸 N</Label>
                  <Input type="number" value={systemSize} onChange={(e) => setSystemSize(e.target.value)} min={1} max={100000} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-thermodynamic-spacetime/quantum-fluctuation", {
                  fluctuation_type: fluctuationType, noise_amplitude: noiseAmplitude,
                  correlation_time: correlationTime, dissipation_rate: dissipationRate, system_size: systemSize
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析量子涨落"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entanglement Thermal */}
        <TabsContent value="thermalization">
          <Card>
            <CardHeader>
              <CardTitle>纠缠热化 (Entanglement Thermalization)</CardTitle>
              <CardDescription>ETH / 量子典型性 / 随机矩阵 / 纠缠传播 — 本征态热化假说</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>热化类型</Label>
                  <Select value={thermalizationType} onValueChange={setThermalizationType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {THERMALIZATION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hilbert维数</Label>
                  <Input type="number" value={hilbertDim} onChange={(e) => setHilbertDim(e.target.value)} min={2} max={1048576} />
                </div>
                <div className="space-y-2">
                  <Label>能量密度 ε</Label>
                  <Input type="number" value={energyDensity} onChange={(e) => setEnergyDensity(e.target.value)} step={0.01} min={0} max={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>交互强度 g</Label>
                  <Input type="number" value={interactionStrength} onChange={(e) => setInteractionStrength(e.target.value)} step={0.1} min={0.01} />
                </div>
                <div className="space-y-2">
                  <Label>演化时间 t</Label>
                  <Input type="number" value={evolutionTime} onChange={(e) => setEvolutionTime(e.target.value)} step={0.1} min={0} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-thermodynamic-spacetime/entanglement-thermal", {
                  thermalization_type: thermalizationType, hilbert_dim: hilbertDim,
                  energy_density: energyDensity, interaction_strength: interactionStrength, evolution_time: evolutionTime
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析纠缠热化"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Black Hole Thermodynamics */}
        <TabsContent value="blackhole">
          <Card>
            <CardHeader>
              <CardTitle>黑洞热力学 (Black Hole Thermodynamics)</CardTitle>
              <CardDescription>Bekenstein-Hawking熵 / Hawking辐射 / Page曲线 / 信息悖论 — 黑洞热力学四定律</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>黑洞类型</Label>
                  <Select value={bhType} onValueChange={setBhType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BLACKHOLE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>黑洞质量 M</Label>
                  <Input type="number" value={blackholeMass} onChange={(e) => setBlackholeMass(e.target.value)} step={1} min={0.01} />
                </div>
                <div className="space-y-2">
                  <Label>角动量 J</Label>
                  <Input type="number" value={angularMomentum} onChange={(e) => setAngularMomentum(e.target.value)} step={0.1} min={0} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>电荷 Q</Label>
                  <Input type="number" value={charge} onChange={(e) => setCharge(e.target.value)} step={0.1} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>模式数 N</Label>
                  <Input type="number" value={numModes} onChange={(e) => setNumModes(e.target.value)} min={1} max={10000} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-thermodynamic-spacetime/blackhole-thermo", {
                  bh_type: bhType, blackhole_mass: blackholeMass,
                  angular_momentum: angularMomentum, charge: charge, num_modes: numModes
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析黑洞热力学"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
