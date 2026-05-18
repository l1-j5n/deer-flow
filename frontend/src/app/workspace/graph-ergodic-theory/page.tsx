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

// ── Types ──────────────────────────────────────────────────────────────────

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

// ── Enum Options ───────────────────────────────────────────────────────────

const SYSTEM_TYPES = [
  { value: "discrete_time", label: "Discrete Time 离散时间" },
  { value: "continuous_time", label: "Continuous Time 连续时间" },
  { value: "random_dynamical", label: "Random Dynamical 随机动力" },
  { value: "markov_chain", label: "Markov Chain 马尔可夫链" },
  { value: "thermodynamic", label: "Thermodynamic 热力学" },
  { value: "ai_ergodic", label: "AI-Ergodic AI遍历" },
];

const MIXING_TYPES = [
  { value: "strong_mixing", label: "Strong Mixing 强混合" },
  { value: "weak_mixing", label: "Weak Mixing 弱混合" },
  { value: "exact_system", label: "Exact System 精确系统" },
  { value: "bernoulli_shift", label: "Bernoulli Shift 伯努利移位" },
  { value: "kolmogorov_automorphism", label: "K-Automorphism K自同构" },
  { value: "ai_mixing", label: "AI-Mixing AI混合" },
];

const SPECTRAL_TYPES = [
  { value: "fourier_spectrum", label: "Fourier Spectrum 傅里叶谱" },
  { value: "lyapunov_exponents", label: "Lyapunov Exp 李雅普诺夫" },
  { value: "decay_correlations", label: "Decay Corr. 相关衰减" },
  { value: "transfer_operator", label: "Transfer Op. 转移算子" },
  { value: "resolvent", label: "Resolvent 预解式" },
  { value: "ai_spectral", label: "AI-Spectral AI谱分析" },
];

const ENTROPY_TYPES = [
  { value: "kolmogorov_sinai", label: "Kolmogorov-Sinai KS熵" },
  { value: "metric_entropy", label: "Metric Entropy 度量熵" },
  { value: "topological_entropy", label: "Topological 拓扑熵" },
  { value: "pressure_function", label: "Pressure 压力函数" },
  { value: "large_deviation", label: "Large Deviation 大偏差" },
  { value: "ai_entropy", label: "AI-Entropy AI熵" },
];

const DECOMPOSITION_TYPES = [
  { value: "invariant_measures", label: "Invariant Measures 不变测度" },
  { value: "ergodic_components", label: "Ergodic Components 遍历分量" },
  { value: "pure_states", label: "Pure States 纯态" },
  { value: "extremal_measures", label: "Extremal 极端测度" },
  { value: "choquet_theory", label: "Choquet Theory Choquet理论" },
  { value: "ai_decomposition", label: "AI-Decomp AI分解" },
];

const APPLICATION_TYPES = [
  { value: "markov_monte_carlo", label: "MCMC 马尔可夫MC" },
  { value: "sampling_convergence", label: "Sampling Conv. 采样收敛" },
  { value: "causal_stability", label: "Causal Stability 因果稳定" },
  { value: "phase_transition", label: "Phase Transition 相变" },
  { value: "random_matrix", label: "Random Matrix 随机矩阵" },
  { value: "ai_application", label: "AI-Application AI应用" },
];

const BASE = "/graph/ergodic-theory";

// ── Helper ─────────────────────────────────────────────────────────────────

async function postEndpoint(
  ep: string,
  params: Record<string, string | number>
) {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const res = await fetch(`${BASE}/${ep}?${qs}`, { method: "POST" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Reusable Components ────────────────────────────────────────────────────

function ParamSelect({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value} className="text-xs">
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ParamInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="h-8 text-xs"
      />
    </div>
  );
}

function ResultBlock({
  data,
  loading,
}: {
  data: Record<string, unknown> | null;
  loading: boolean;
}) {
  if (loading) return <div className="text-xs text-muted-foreground animate-pulse">Computing...</div>;
  if (!data) return null;
  return (
    <div className="rounded-md border bg-muted/30 p-3 mt-3 overflow-x-auto">
      <pre className="text-[11px] leading-relaxed whitespace-pre-wrap break-all">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

// ── Tab Panels ─────────────────────────────────────────────────────────────

function SystemTab() {
  const [systemType, setSystemType] = useState("markov_chain");
  const [dimension, setDimension] = useState(4);
  const [nSteps, setNSteps] = useState(100);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("system", { system_type: systemType, dimension, n_steps: nSteps });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Ergodic System 遍历系统</CardTitle>
        <CardDescription className="text-xs">
          Birkhoff遍历定理验证：时间平均 vs 空间平均、不变分布、遍历性判定
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="System Type" items={SYSTEM_TYPES} value={systemType} onChange={setSystemType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={100} />
          <ParamInput label="N Steps" value={nSteps} onChange={setNSteps} min={10} max={10000} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Simulate</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function MixingTab() {
  const [mixingType, setMixingType] = useState("strong_mixing");
  const [dimension, setDimension] = useState(4);
  const [nObservables, setNObservables] = useState(6);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("mixing", { mixing_type: mixingType, dimension, n_observables: nObservables });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Mixing Analysis 混合分析</CardTitle>
        <CardDescription className="text-xs">
          α-混合系数、相关衰减、Bernoulli/Kolmogorov层次、尾σ-代数
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Mixing Type" items={MIXING_TYPES} value={mixingType} onChange={setMixingType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={100} />
          <ParamInput label="N Observables" value={nObservables} onChange={setNObservables} min={2} max={50} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Analyze</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function SpectralTab() {
  const [spectralType, setSpectralType] = useState("transfer_operator");
  const [dimension, setDimension] = useState(4);
  const [resolution, setResolution] = useState(20);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("spectral", { spectral_type: spectralType, dimension, resolution });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Spectral Analysis 谱分析</CardTitle>
        <CardDescription className="text-xs">
          Koopman算子特征值、转移算子(Perron-Frobenius)、Lyapunov指数、谱间隙、Fourier谱
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Spectral Type" items={SPECTRAL_TYPES} value={spectralType} onChange={setSpectralType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={100} />
          <ParamInput label="Resolution" value={resolution} onChange={setResolution} min={5} max={200} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function EntropyTab() {
  const [entropyType, setEntropyType] = useState("kolmogorov_sinai");
  const [dimension, setDimension] = useState(4);
  const [nPartitions, setNPartitions] = useState(8);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("entropy", { entropy_type: entropyType, dimension, n_partitions: nPartitions });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Entropy Production 熵产生</CardTitle>
        <CardDescription className="text-xs">
          Kolmogorov-Sinai熵、度量熵、拓扑熵、压力函数、大偏差率函数、Shannon-McMillan-Breiman
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Entropy Type" items={ENTROPY_TYPES} value={entropyType} onChange={setEntropyType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={100} />
          <ParamInput label="N Partitions" value={nPartitions} onChange={setNPartitions} min={2} max={50} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function DecompositionTab() {
  const [decompType, setDecompType] = useState("ergodic_components");
  const [dimension, setDimension] = useState(4);
  const [nComponents, setNComponents] = useState(5);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("decomposition", { decomposition_type: decompType, dimension, n_components: nComponents });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Ergodic Decomposition 遍历分解</CardTitle>
        <CardDescription className="text-xs">
          Choquet定理、不变测度分解为极端测度、纯态分解、单纯形结构、Krein-Milman
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Decomposition" items={DECOMPOSITION_TYPES} value={decompType} onChange={setDecompType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={100} />
          <ParamInput label="N Components" value={nComponents} onChange={setNComponents} min={2} max={20} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Decompose</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function ApplicationTab() {
  const [appType, setAppType] = useState("markov_monte_carlo");
  const [nSamples, setNSamples] = useState(1000);
  const [nChains, setNChains] = useState(4);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("application", { application_type: appType, n_samples: nSamples, n_chains: nChains });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Ergodic Applications 遍历应用</CardTitle>
        <CardDescription className="text-xs">
          MCMC收敛诊断、采样收敛率、因果稳定性、相变与遍历性破缺、随机矩阵理论
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Application" items={APPLICATION_TYPES} value={appType} onChange={setAppType} />
          <ParamInput label="N Samples" value={nSamples} onChange={setNSamples} min={100} max={100000} />
          <ParamInput label="N Chains" value={nChains} onChange={setNChains} min={1} max={20} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Apply</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/overview`);
      const json = await res.json();
      setData(json as OverviewData);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">System Overview 系统总览</CardTitle>
        <CardDescription className="text-xs">
          Layer 53 — 因果遍历理论与混合动力学引擎 全量端点与配置空间
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button size="sm" onClick={load} disabled={loading}>
          {loading ? "Loading..." : "Load Overview"}
        </Button>
        {data && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded border p-2">
                <span className="text-muted-foreground">Layer</span>
                <p className="font-semibold">{data.layer}</p>
              </div>
              <div className="rounded border p-2">
                <span className="text-muted-foreground">Version</span>
                <p className="font-semibold">{data.version}</p>
              </div>
              <div className="rounded border p-2">
                <span className="text-muted-foreground">Enums</span>
                <p className="font-semibold">{data.enum_count}</p>
              </div>
              <div className="rounded border p-2">
                <span className="text-muted-foreground">Endpoints</span>
                <p className="font-semibold">{data.endpoint_count}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="font-medium mb-1">Config Space: {data.config_space.toLocaleString()}</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(data.enums).map(([name, vals]) => (
                  <Badge key={name} variant="secondary" className="text-[10px]">
                    {name}: {vals.length}
                  </Badge>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <p className="font-medium mb-1">Endpoints</p>
              <div className="space-y-1">
                {data.endpoints.map((ep, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Badge variant={ep.method === "GET" ? "outline" : "default"} className="text-[10px] w-10 justify-center">
                      {ep.method}
                    </Badge>
                    <code className="text-[10px] text-muted-foreground">{ep.path}</code>
                    <span className="text-[10px] text-muted-foreground">— {ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <p className="font-medium mb-1">Cache Stats</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(data.cache_stats).map(([k, v]) => (
                  <Badge key={k} variant="secondary" className="text-[10px]">
                    {k}: {String(v)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ErgodicTheoryPage() {
  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold">Ergodic Theory & Mixing Dynamics</h1>
        <p className="text-xs text-muted-foreground">
          Layer 53 (v1.301) — 因果遍历理论与混合动力学引擎 — Birkhoff遍历定理 · 混合层次 · Koopman/转移算子 · KS熵 · Choquet分解 · MCMC收敛 · 相变
        </p>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="system" className="text-xs">System</TabsTrigger>
          <TabsTrigger value="mixing" className="text-xs">Mixing</TabsTrigger>
          <TabsTrigger value="spectral" className="text-xs">Spectral</TabsTrigger>
          <TabsTrigger value="entropy" className="text-xs">Entropy</TabsTrigger>
          <TabsTrigger value="decomposition" className="text-xs">Decomp</TabsTrigger>
          <TabsTrigger value="application" className="text-xs">Apply</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="system"><SystemTab /></TabsContent>
        <TabsContent value="mixing"><MixingTab /></TabsContent>
        <TabsContent value="spectral"><SpectralTab /></TabsContent>
        <TabsContent value="entropy"><EntropyTab /></TabsContent>
        <TabsContent value="decomposition"><DecompositionTab /></TabsContent>
        <TabsContent value="application"><ApplicationTab /></TabsContent>
      </Tabs>
    </div>
  );
}
