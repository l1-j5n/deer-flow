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

const TRANSPORT_TYPES = [
  { value: "monge", label: "Monge 蒙日问题" },
  { value: "kantorovich", label: "Kantorovich 康托罗维奇" },
  { value: "multi_marginal", label: "Multi-Marginal 多边际" },
  { value: "dynamic_ot", label: "Dynamic OT 动态传输" },
  { value: "entropic_ot", label: "Entropic OT 熵正则化" },
  { value: "ai_transport", label: "AI-Transport AI传输" },
];

const WASSERSTEIN_TYPES = [
  { value: "w1_earth_mover", label: "W1 Earth Mover 推土距离" },
  { value: "w2_quadratic", label: "W2 Quadratic 二次距离" },
  { value: "w_infinity", label: "W∞ Infinity 无穷距离" },
  { value: "w_p_general", label: "Wp General 一般距离" },
  { value: "sliced_wasserstein", label: "Sliced W 切片距离" },
  { value: "ai_metric", label: "AI-Metric AI度量" },
];

const SINKHORN_TYPES = [
  { value: "sinkhorn_classic", label: "Sinkhorn Classic 经典" },
  { value: "log_stabilized", label: "Log-Stabilized 对数稳定" },
  { value: "multiscale", label: "Multiscale 多尺度" },
  { value: "debiased", label: "Debiased 去偏" },
  { value: "homogeneous_batch", label: "Batch 同质批量" },
  { value: "ai_sinkhorn", label: "AI-Sinkhorn AI算法" },
];

const SCHRODINGER_TYPES = [
  { value: "sb_classical", label: "Classical SB 经典桥" },
  { value: "sb_entropic", label: "Entropic SB 熵桥" },
  { value: "sb_dynamic", label: "Dynamic SB 动态桥" },
  { value: "sb_mean_field", label: "Mean-Field SB 平均场" },
  { value: "sb_reciprocal", label: "Reciprocal SB 互惠桥" },
  { value: "ai_bridge", label: "AI-Bridge AI桥" },
];

const DISPLACEMENT_TYPES = [
  { value: "otto_calculus", label: "Otto Calculus Otto微积分" },
  { value: "mccann_interpolation", label: "McCann Interp 位移插值" },
  { value: "displacement_convexity", label: "Displ. Convexity 位移凸" },
  { value: "ricci_curvature_ot", label: "Ricci Curvature OT曲率" },
  { value: "curvature_dimension", label: "CD Condition 曲率维数" },
  { value: "ai_geometry", label: "AI-Geometry AI几何" },
];

const APPLICATION_TYPES = [
  { value: "wasserstein_gan", label: "Wasserstein GAN WGAN" },
  { value: "domain_adaptation", label: "Domain Adapt 域适应" },
  { value: "fairness_transport", label: "Fairness Transport 公平传输" },
  { value: "robust_optimization", label: "Robust Opt 鲁棒优化" },
  { value: "barycenter", label: "Barycenter 重心" },
  { value: "ai_application", label: "AI-Application AI应用" },
];

const BASE = "/graph/optimal-transport";

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

function TransportTab() {
  const [problemType, setProblemType] = useState("kantorovich");
  const [nSource, setNSource] = useState(10);
  const [nTarget, setNTarget] = useState(10);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("transport", { problem_type: problemType, n_source: nSource, n_target: nTarget });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Optimal Transport 最优传输问题</CardTitle>
        <CardDescription className="text-xs">
          Monge/Kantorovich问题、多边际传输、动态传输、熵正则化、对偶势函数
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Problem Type" items={TRANSPORT_TYPES} value={problemType} onChange={setProblemType} />
          <ParamInput label="Source Points" value={nSource} onChange={setNSource} min={2} max={1000} />
          <ParamInput label="Target Points" value={nTarget} onChange={setNTarget} min={2} max={1000} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Solve</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function WassersteinTab() {
  const [metricType, setMetricType] = useState("w2_quadratic");
  const [nPoints, setNPoints] = useState(50);
  const [pOrder, setPOrder] = useState(2.0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("wasserstein", { metric_type: metricType, n_points: nPoints, p_order: pOrder });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Wasserstein Distance Wasserstein距离</CardTitle>
        <CardDescription className="text-xs">
          W1/W2/W∞/Wp距离、切片Wasserstein、Kantorovich-Rubinstein对偶、Otto黎曼度量
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Metric Type" items={WASSERSTEIN_TYPES} value={metricType} onChange={setMetricType} />
          <ParamInput label="N Points" value={nPoints} onChange={setNPoints} min={2} max={10000} />
          <ParamInput label="P Order" value={pOrder} onChange={setPOrder} min={0.1} max={100} step={0.1} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function SinkhornTab() {
  const [algoType, setAlgoType] = useState("sinkhorn_classic");
  const [matrixSize, setMatrixSize] = useState(10);
  const [epsilon, setEpsilon] = useState(0.1);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("sinkhorn", { algorithm_type: algoType, matrix_size: matrixSize, reg_epsilon: epsilon });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Sinkhorn Algorithm Sinkhorn算法</CardTitle>
        <CardDescription className="text-xs">
          经典/对数稳定/多尺度/去偏Sinkhorn、缩放向量、收敛误差、传输计划
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Algorithm Type" items={SINKHORN_TYPES} value={algoType} onChange={setAlgoType} />
          <ParamInput label="Matrix Size" value={matrixSize} onChange={setMatrixSize} min={2} max={500} />
          <ParamInput label="Reg. Epsilon" value={epsilon} onChange={setEpsilon} min={0.001} max={10} step={0.01} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Run</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function SchrodingerTab() {
  const [bridgeType, setBridgeType] = useState("sb_classical");
  const [nParticles, setNParticles] = useState(100);
  const [timeSteps, setTimeSteps] = useState(50);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("schrodinger", { bridge_type: bridgeType, n_particles: nParticles, time_steps: timeSteps });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Schrödinger Bridge Schrödinger桥</CardTitle>
        <CardDescription className="text-xs">
          经典/熵正则化/动态/平均场/互惠Schrödinger桥、前后向势函数、桥路径
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Bridge Type" items={SCHRODINGER_TYPES} value={bridgeType} onChange={setBridgeType} />
          <ParamInput label="N Particles" value={nParticles} onChange={setNParticles} min={2} max={10000} />
          <ParamInput label="Time Steps" value={timeSteps} onChange={setTimeSteps} min={2} max={1000} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function DisplacementTab() {
  const [geoType, setGeoType] = useState("otto_calculus");
  const [dimension, setDimension] = useState(4);
  const [nInterp, setNInterp] = useState(10);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("displacement", { geometry_type: geoType, dimension, n_interpolations: nInterp });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Displacement Geometry 位移几何</CardTitle>
        <CardDescription className="text-xs">
          Otto微积分、McCann位移插值、位移凸性、Ricci曲率、曲率-维数CD条件
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Geometry Type" items={DISPLACEMENT_TYPES} value={geoType} onChange={setGeoType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={100} />
          <ParamInput label="Interpolations" value={nInterp} onChange={setNInterp} min={2} max={100} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function ApplicationTab() {
  const [appType, setAppType] = useState("wasserstein_gan");
  const [nSamples, setNSamples] = useState(100);
  const [nClasses, setNClasses] = useState(3);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("application", { application_type: appType, n_samples: nSamples, n_classes: nClasses });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Transport Applications 传输应用</CardTitle>
        <CardDescription className="text-xs">
          WGAN、域适应、公平传输、分布鲁棒优化、Wasserstein重心、AI传输
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Application" items={APPLICATION_TYPES} value={appType} onChange={setAppType} />
          <ParamInput label="N Samples" value={nSamples} onChange={setNSamples} min={2} max={10000} />
          <ParamInput label="N Classes" value={nClasses} onChange={setNClasses} min={2} max={20} />
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
          Layer 52 — 因果最优传输与Wasserstein几何引擎 全量端点与配置空间
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

export default function OptimalTransportPage() {
  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold">Optimal Transport & Wasserstein Geometry</h1>
        <p className="text-xs text-muted-foreground">
          Layer 52 (v1.300) — 因果最优传输与Wasserstein几何引擎 — Monge-Kantorovich · Wasserstein距离 · Sinkhorn · Schrödinger桥 · Otto微积分 · 传输应用
        </p>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="transport" className="text-xs">Transport</TabsTrigger>
          <TabsTrigger value="wasserstein" className="text-xs">W-Dist</TabsTrigger>
          <TabsTrigger value="sinkhorn" className="text-xs">Sinkhorn</TabsTrigger>
          <TabsTrigger value="schrodinger" className="text-xs">S-Bridge</TabsTrigger>
          <TabsTrigger value="displacement" className="text-xs">Displace</TabsTrigger>
          <TabsTrigger value="application" className="text-xs">Apply</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="transport"><TransportTab /></TabsContent>
        <TabsContent value="wasserstein"><WassersteinTab /></TabsContent>
        <TabsContent value="sinkhorn"><SinkhornTab /></TabsContent>
        <TabsContent value="schrodinger"><SchrodingerTab /></TabsContent>
        <TabsContent value="displacement"><DisplacementTab /></TabsContent>
        <TabsContent value="application"><ApplicationTab /></TabsContent>
      </Tabs>
    </div>
  );
}
