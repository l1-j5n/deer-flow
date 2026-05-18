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
const MEASUREMENT_TYPES = [
  { value: "projective_measurement", label: "投影测量 Proj." },
  { value: "positive_operator_valued", label: "POVM广义测量" },
  { value: "neumark_measurement", label: "Naimark扩展" },
  { value: "weak_measurement", label: "弱测量 Weak" },
  { value: "continuous_measurement", label: "连续测量 Cont." },
  { value: "ai_quantum_measurement", label: "AI量子测量 AI QM" },
];

const ESTIMATION_TYPES = [
  { value: "bayesian_estimation", label: "贝叶斯估计 Bayes" },
  { value: "maximum_likelihood", label: "最大似然 MLE" },
  { value: "cramer_rao_bound", label: "Cramér-Rao界 CRB" },
  { value: "helstrom_measurement", label: "Helstrom测量" },
  { value: "adaptive_estimation", label: "自适应估计 Adapt." },
  { value: "ai_quantum_estimation", label: "AI量子估计 AI QE" },
];

const FISHER_TYPES = [
  { value: "symmetric_fisher", label: "对称Fisher SLD" },
  { value: "asymmetric_fisher", label: "非对称Fisher RLD" },
  { value: "quantum_cramer_rao", label: "量子CR界 QCRB" },
  { value: "slater_determinant", label: "Fisher矩阵多参" },
  { value: "fisher_metric", label: "Fisher度量 Metric" },
  { value: "ai_quantum_fisher", label: "AI量子Fisher AI QF" },
];

const PARAMETER_TYPES = [
  { value: "phase_estimation", label: "相位估计 Phase" },
  { value: "frequency_estimation", label: "频率估计 Freq." },
  { value: "loss_estimation", label: "损耗估计 Loss" },
  { value: "displacement_estimation", label: "位移估计 Disp." },
  { value: "hamiltonian_estimation", label: "哈密顿估计 Ham." },
  { value: "ai_parameter_estimation", label: "AI参数估计 AI PE" },
];

const SENSING_TYPES = [
  { value: "atomic_clock", label: "原子钟 Clock" },
  { value: "magnetometer", label: "磁力计 Mag." },
  { value: "gravimeter", label: "重力计 Grav." },
  { value: "interferometer", label: "干涉仪 Interf." },
  { value: "spin_squeezing", label: "自旋压缩 Squez." },
  { value: "ai_quantum_sensing", label: "AI量子传感 AI QS" },
];

const GRAVITATIONAL_WAVE_TYPES = [
  { value: "ligo_detector", label: "LIGO探测器" },
  { value: "lisa_detector", label: "LISA探测器" },
  { value: "pulsar_timing", label: "脉冲星计时 PTA" },
  { value: "atom_interferometry", label: "原子干涉 Atom" },
  { value: "resonant_bar", label: "共振棒 Weber" },
  { value: "ai_gravitational_wave", label: "AI引力波 AI GW" },
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
export default function QuantumMetrologySpacetimePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // Quantum Measurement
  const [measurementType, setMeasurementType] = useState("projective_measurement");
  const [numObservables, setNumObservables] = useState("8");
  const [measurementStrength, setMeasurementStrength] = useState("1.0");
  const [decoherenceRate, setDecoherenceRate] = useState("0.01");
  const [measurementResolution, setMeasurementResolution] = useState("10");

  // Quantum Estimation
  const [estimationType, setEstimationType] = useState("bayesian_estimation");
  const [numSamples, setNumSamples] = useState("1000");
  const [priorWidth, setPriorWidth] = useState("0.5");
  const [signalToNoise, setSignalToNoise] = useState("10.0");
  const [paramDimension, setParamDimension] = useState("4");

  // Quantum Fisher Info
  const [fisherType, setFisherType] = useState("symmetric_fisher");
  const [numParameters, setNumParameters] = useState("3");
  const [fisherValue, setFisherValue] = useState("1.0");
  const [sensitivity, setSensitivity] = useState("0.01");
  const [fisherDimension, setFisherDimension] = useState("4");

  // Parameter Estimation
  const [paramType, setParamType] = useState("phase_estimation");
  const [numQubits, setNumQubits] = useState("10");
  const [targetPrecision, setTargetPrecision] = useState("0.001");
  const [resourceBudget, setResourceBudget] = useState("1000");
  const [noiseLevel, setNoiseLevel] = useState("0.01");

  // Quantum Sensing
  const [sensingType, setSensingType] = useState("atomic_clock");
  const [sensorCount, setSensorCount] = useState("100");
  const [coherenceTime, setCoherenceTime] = useState("1.0");
  const [sensitivityTarget, setSensitivityTarget] = useState("1e-12");
  const [integrationTime, setIntegrationTime] = useState("1.0");

  // Gravitational Wave
  const [gwType, setGwType] = useState("ligo_detector");
  const [detectorLength, setDetectorLength] = useState("4000.0");
  const [strainSensitivity, setStrainSensitivity] = useState("1e-23");
  const [frequencyBand, setFrequencyBand] = useState("100.0");
  const [observationTime, setObservationTime] = useState("1.0");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/quantum-metrology-spacetime/overview`);
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
            Quantum Metrology Spacetime Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 69 — 量子测量 / 量子估计 / 量子Fisher信息 / 参数估计 / 量子传感 / 引力波检测
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.317.0</Badge>
          <Badge variant="secondary">Layer 69</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="measurement">量子测量</TabsTrigger>
          <TabsTrigger value="estimation">量子估计</TabsTrigger>
          <TabsTrigger value="fisher">Fisher信息</TabsTrigger>
          <TabsTrigger value="parameter">参数估计</TabsTrigger>
          <TabsTrigger value="sensing">量子传感</TabsTrigger>
          <TabsTrigger value="gravwave">引力波</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Metrology Spacetime Engine 概览</CardTitle>
              <CardDescription>
                量子计量时空引擎 — 6枚举 × 6值 = 36值, 7 API端点
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

        {/* Quantum Measurement */}
        <TabsContent value="measurement">
          <Card>
            <CardHeader>
              <CardTitle>量子测量 (Quantum Measurement)</CardTitle>
              <CardDescription>投影测量 / POVM / Naimark扩展 / 弱测量 / 连续测量 — 量子测量理论基础</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>测量类型</Label>
                  <Select value={measurementType} onValueChange={setMeasurementType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MEASUREMENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>可观测量数</Label>
                  <Input type="number" value={numObservables} onChange={(e) => setNumObservables(e.target.value)} min={1} max={1000} />
                </div>
                <div className="space-y-2">
                  <Label>测量强度 g</Label>
                  <Input type="number" value={measurementStrength} onChange={(e) => setMeasurementStrength(e.target.value)} step={0.1} min={0} max={2} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>退相干率 γ</Label>
                  <Input type="number" value={decoherenceRate} onChange={(e) => setDecoherenceRate(e.target.value)} step={0.001} min={0} max={1} />
                </div>
                <div className="space-y-2">
                  <Label>分辨率 R</Label>
                  <Input type="number" value={measurementResolution} onChange={(e) => setMeasurementResolution(e.target.value)} min={1} max={100} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-metrology-spacetime/quantum-measurement", {
                  measurement_type: measurementType, num_observables: numObservables,
                  measurement_strength: measurementStrength, decoherence_rate: decoherenceRate, resolution: measurementResolution
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析量子测量"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quantum Estimation */}
        <TabsContent value="estimation">
          <Card>
            <CardHeader>
              <CardTitle>量子估计 (Quantum Estimation)</CardTitle>
              <CardDescription>贝叶斯 / MLE / Cramér-Rao界 / Helstrom — 量子参数估计理论</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>估计类型</Label>
                  <Select value={estimationType} onValueChange={setEstimationType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ESTIMATION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>采样数 N</Label>
                  <Input type="number" value={numSamples} onChange={(e) => setNumSamples(e.target.value)} min={1} max={100000} />
                </div>
                <div className="space-y-2">
                  <Label>先验宽度 σ₀</Label>
                  <Input type="number" value={priorWidth} onChange={(e) => setPriorWidth(e.target.value)} step={0.01} min={0.01} max={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>信噪比 SNR</Label>
                  <Input type="number" value={signalToNoise} onChange={(e) => setSignalToNoise(e.target.value)} step={0.1} min={0.1} max={1000} />
                </div>
                <div className="space-y-2">
                  <Label>参数维度 d</Label>
                  <Input type="number" value={paramDimension} onChange={(e) => setParamDimension(e.target.value)} min={1} max={100} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-metrology-spacetime/quantum-estimation", {
                  estimation_type: estimationType, num_samples: numSamples,
                  prior_width: priorWidth, signal_to_noise: signalToNoise, dimension: paramDimension
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析量子估计"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quantum Fisher Information */}
        <TabsContent value="fisher">
          <Card>
            <CardHeader>
              <CardTitle>量子Fisher信息 (Quantum Fisher Information)</CardTitle>
              <CardDescription>SLD / RLD / QCRB / Fisher度量 — 量子精度极限理论</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Fisher类型</Label>
                  <Select value={fisherType} onValueChange={setFisherType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FISHER_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>参数数量 d</Label>
                  <Input type="number" value={numParameters} onChange={(e) => setNumParameters(e.target.value)} min={1} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>Fisher值 H</Label>
                  <Input type="number" value={fisherValue} onChange={(e) => setFisherValue(e.target.value)} step={0.1} min={0.001} max={1000} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>灵敏度 δθ</Label>
                  <Input type="number" value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} step={0.001} min={0.0001} max={1} />
                </div>
                <div className="space-y-2">
                  <Label>Hilbert维度 D</Label>
                  <Input type="number" value={fisherDimension} onChange={(e) => setFisherDimension(e.target.value)} min={2} max={10000} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-metrology-spacetime/quantum-fisher-info", {
                  fisher_type: fisherType, num_parameters: numParameters,
                  fisher_value: fisherValue, sensitivity: sensitivity, dimension: fisherDimension
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析Fisher信息"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parameter Estimation */}
        <TabsContent value="parameter">
          <Card>
            <CardHeader>
              <CardTitle>参数估计 (Parameter Estimation)</CardTitle>
              <CardDescription>相位估计 / 频率估计 / 位移估计 / 哈密顿估计 — Heisenberg极限</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>参数类型</Label>
                  <Select value={paramType} onValueChange={setParamType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PARAMETER_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>量子比特数 n</Label>
                  <Input type="number" value={numQubits} onChange={(e) => setNumQubits(e.target.value)} min={1} max={1000} />
                </div>
                <div className="space-y-2">
                  <Label>目标精度 δθ</Label>
                  <Input type="number" value={targetPrecision} onChange={(e) => setTargetPrecision(e.target.value)} step={0.0001} min={0.00001} max={1} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>资源预算 M</Label>
                  <Input type="number" value={resourceBudget} onChange={(e) => setResourceBudget(e.target.value)} min={1} max={1000000} />
                </div>
                <div className="space-y-2">
                  <Label>噪声水平 ε</Label>
                  <Input type="number" value={noiseLevel} onChange={(e) => setNoiseLevel(e.target.value)} step={0.001} min={0} max={1} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-metrology-spacetime/parameter-estimation", {
                  param_type: paramType, num_qubits: numQubits,
                  target_precision: targetPrecision, resource_budget: resourceBudget, noise_level: noiseLevel
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析参数估计"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quantum Sensing */}
        <TabsContent value="sensing">
          <Card>
            <CardHeader>
              <CardTitle>量子传感 (Quantum Sensing)</CardTitle>
              <CardDescription>原子钟 / 磁力计 / 重力计 / 干涉仪 / 自旋压缩 — 量子精密测量</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>传感类型</Label>
                  <Select value={sensingType} onValueChange={setSensingType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SENSING_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>传感器数 N</Label>
                  <Input type="number" value={sensorCount} onChange={(e) => setSensorCount(e.target.value)} min={1} max={1000000} />
                </div>
                <div className="space-y-2">
                  <Label>相干时间 T₂</Label>
                  <Input type="number" value={coherenceTime} onChange={(e) => setCoherenceTime(e.target.value)} step={0.1} min={0.001} max={10000} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>灵敏度目标 δS</Label>
                  <Input type="text" value={sensitivityTarget} onChange={(e) => setSensitivityTarget(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>积分时间 τ</Label>
                  <Input type="number" value={integrationTime} onChange={(e) => setIntegrationTime(e.target.value)} step={0.1} min={0.001} max={100000} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-metrology-spacetime/quantum-sensing", {
                  sensing_type: sensingType, sensor_count: sensorCount,
                  coherence_time: coherenceTime, sensitivity_target: sensitivityTarget, integration_time: integrationTime
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析量子传感"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gravitational Wave Detection */}
        <TabsContent value="gravwave">
          <Card>
            <CardHeader>
              <CardTitle>引力波检测 (Gravitational Wave Detection)</CardTitle>
              <CardDescription>LIGO / LISA / PTA / 原子干涉 — 量子计量与引力波天文学</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>探测器类型</Label>
                  <Select value={gwType} onValueChange={setGwType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GRAVITATIONAL_WAVE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>臂长 L (m)</Label>
                  <Input type="number" value={detectorLength} onChange={(e) => setDetectorLength(e.target.value)} step={100} min={1} max={2500000000} />
                </div>
                <div className="space-y-2">
                  <Label>应变灵敏度 h</Label>
                  <Input type="text" value={strainSensitivity} onChange={(e) => setStrainSensitivity(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>频率 f (Hz)</Label>
                  <Input type="number" value={frequencyBand} onChange={(e) => setFrequencyBand(e.target.value)} step={1} min={0.0001} max={10000} />
                </div>
                <div className="space-y-2">
                  <Label>观测时间 T (s)</Label>
                  <Input type="number" value={observationTime} onChange={(e) => setObservationTime(e.target.value)} step={0.1} min={0.001} max={100000} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/quantum-metrology-spacetime/gravitational-wave", {
                  gw_type: gwType, detector_length: detectorLength,
                  strain_sensitivity: strainSensitivity, frequency_band: frequencyBand, observation_time: observationTime
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析引力波检测"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
