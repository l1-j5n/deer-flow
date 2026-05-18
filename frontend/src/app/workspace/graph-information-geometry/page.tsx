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

const FISHER_METRICS = [
  { value: "fisher_rao", label: "Fisher-Rao 费雪-饶" },
  { value: "jeffreys", label: "Jeffreys 杰弗里斯" },
  { value: "wasserstein", label: "Wasserstein 瓦瑟斯坦" },
  { value: "causal_fisher", label: "Causal Fisher 因果费雪" },
  { value: "quantum_fisher", label: "Quantum Fisher 量子费雪" },
  { value: "ai_metric", label: "AI-Metric AI度量" },
];

const MANIFOLD_TYPES = [
  { value: "exponential", label: "Exponential 指数族" },
  { value: "mixture", label: "Mixture 混合族" },
  { value: "gaussian", label: "Gaussian 高斯族" },
  { value: "discrete", label: "Discrete 离散族" },
  { value: "nonparametric", label: "Nonparametric 非参数" },
  { value: "ai_manifold", label: "AI-Manifold AI流形" },
];

const GRADIENT_TYPES = [
  { value: "vanilla_ng", label: "Vanilla NG 标准自然梯度" },
  { value: "kfac", label: "K-FAC 克罗内克分解" },
  { value: "adam_ng", label: "Adam NG 自适应自然梯度" },
  { value: "svrg_ng", label: "SVRG-NG 方差缩减" },
  { value: "riemannian_sg", label: "Riemannian SG 黎曼随机" },
  { value: "ai_gradient", label: "AI-Gradient AI梯度" },
];

const DIVERGENCE_TYPES = [
  { value: "kl_divergence", label: "KL Divergence KL散度" },
  { value: "jensen_shannon", label: "Jensen-Shannon JS散度" },
  { value: "renyi", label: "Renyi α-散度" },
  { value: "wasserstein_div", label: "Wasserstein 瓦瑟斯坦" },
  { value: "f_divergence", label: "f-Divergence f-散度" },
  { value: "ai_divergence", label: "AI-Divergence AI散度" },
];

const GEODESIC_TYPES = [
  { value: "exponential_map", label: "Exponential Map 指数映射" },
  { value: "logarithmic_map", label: "Logarithmic Map 对数映射" },
  { value: "parallel_transport", label: "Parallel Transport 平行移动" },
  { value: "jacobi_field", label: "Jacobi Field 雅可比场" },
  { value: "sectional_curvature", label: "Sectional Curvature 截面曲率" },
  { value: "ai_geodesic", label: "AI-Geodesic AI测地线" },
];

const CURVATURE_TYPES = [
  { value: "riemann_tensor", label: "Riemann Tensor 黎曼张量" },
  { value: "ricci_curvature", label: "Ricci Curvature 里奇曲率" },
  { value: "scalar_curvature", label: "Scalar Curvature 标量曲率" },
  { value: "sectional", label: "Sectional 截面曲率" },
  { value: "gauss_codazzi", label: "Gauss-Codazzi 高斯-科达齐" },
  { value: "ai_curvature", label: "AI-Curvature AI曲率" },
];

const BASE = "/graph/information-geometry";

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

function FisherTab() {
  const [metricType, setMetricType] = useState("causal_fisher");
  const [dimension, setDimension] = useState(6);
  const [samples, setSamples] = useState(1000);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("fisher", { metric_type: metricType, dimension, samples });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Fisher Metric Fisher信息度量</CardTitle>
        <CardDescription className="text-xs">
          Fisher信息矩阵G_ij、特征值、Cramer-Rao界、条件数
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Metric Type" items={FISHER_METRICS} value={metricType} onChange={setMetricType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={2} max={100} />
          <ParamInput label="Samples" value={samples} onChange={setSamples} min={10} max={1000000} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function ManifoldTab() {
  const [manifoldType, setManifoldType] = useState("exponential");
  const [dimension, setDimension] = useState(6);
  const [curvature, setCurvature] = useState(0.0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("manifold", { manifold_type: manifoldType, dimension, curvature });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Statistical Manifold 统计流形</CardTitle>
        <CardDescription className="text-xs">
          Christoffel符号、切空间/余切空间、测地完备性、图集结构
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Manifold Type" items={MANIFOLD_TYPES} value={manifoldType} onChange={setManifoldType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={50} />
          <ParamInput label="Curvature Parameter" value={curvature} onChange={setCurvature} step={0.1} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function GradientTab() {
  const [gradientType, setGradientType] = useState("vanilla_ng");
  const [lr, setLr] = useState(0.01);
  const [dimension, setDimension] = useState(6);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("gradient", { gradient_type: gradientType, learning_rate: lr, dimension });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Natural Gradient 自然梯度</CardTitle>
        <CardDescription className="text-xs">
          G^{-1}预条件、K-FAC近似、收敛轨迹、有效学习率
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Gradient Type" items={GRADIENT_TYPES} value={gradientType} onChange={setGradientType} />
          <ParamInput label="Learning Rate" value={lr} onChange={setLr} min={0.0001} max={1} step={0.001} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={1000} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function DivergenceTab() {
  const [divType, setDivType] = useState("kl_divergence");
  const [alpha, setAlpha] = useState(1.0);
  const [dimension, setDimension] = useState(6);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("divergence", { divergence_type: divType, alpha, dimension });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Information Divergence 信息散度</CardTitle>
        <CardDescription className="text-xs">
          KL/JS/Renyi/Wasserstein/f-散度、对称性、三角不等式、对偶投影
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Divergence Type" items={DIVERGENCE_TYPES} value={divType} onChange={setDivType} />
          <ParamInput label="Alpha Parameter" value={alpha} onChange={setAlpha} min={0.01} max={10} step={0.1} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={2} max={1000} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function GeodesicTab() {
  const [flowType, setFlowType] = useState("exponential_map");
  const [dimension, setDimension] = useState(6);
  const [arcLength, setArcLength] = useState(1.0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("geodesic", { flow_type: flowType, dimension, arc_length: arcLength });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Geodesic Flow 测地线流</CardTitle>
        <CardDescription className="text-xs">
          指数/对数映射、平行移动、雅可比场、共轭点、切割轨迹
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Flow Type" items={GEODESIC_TYPES} value={flowType} onChange={setFlowType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={2} max={50} />
          <ParamInput label="Arc Length" value={arcLength} onChange={setArcLength} min={0.01} step={0.1} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function CurvatureTab() {
  const [curvType, setCurvType] = useState("riemann_tensor");
  const [dimension, setDimension] = useState(6);
  const [sigma, setSigma] = useState(1.0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("curvature", { curvature_type: curvType, dimension, noise_sigma: sigma });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Curvature Analysis 曲率分析</CardTitle>
        <CardDescription className="text-xs">
          Riemann/Ricci/标量曲率张量、Einstein张量、Weyl张量、Bianchi恒等式
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Curvature Type" items={CURVATURE_TYPES} value={curvType} onChange={setCurvType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={2} max={50} />
          <ParamInput label="Noise Sigma" value={sigma} onChange={setSigma} min={0.01} step={0.1} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
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
          Layer 50 — 因果信息几何与自然梯度引擎 全量端点与配置空间
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

export default function InformationGeometryPage() {
  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold">Information Geometry & Natural Gradient</h1>
        <p className="text-xs text-muted-foreground">
          Layer 50 (v1.298) — 因果信息几何与自然梯度引擎 — Fisher度量 · 统计流形 · 自然梯度 · 信息散度 · 测地线 · 曲率
        </p>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="fisher" className="text-xs">Fisher</TabsTrigger>
          <TabsTrigger value="manifold" className="text-xs">Manifold</TabsTrigger>
          <TabsTrigger value="gradient" className="text-xs">Gradient</TabsTrigger>
          <TabsTrigger value="divergence" className="text-xs">Divergence</TabsTrigger>
          <TabsTrigger value="geodesic" className="text-xs">Geodesic</TabsTrigger>
          <TabsTrigger value="curvature" className="text-xs">Curvature</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="fisher"><FisherTab /></TabsContent>
        <TabsContent value="manifold"><ManifoldTab /></TabsContent>
        <TabsContent value="gradient"><GradientTab /></TabsContent>
        <TabsContent value="divergence"><DivergenceTab /></TabsContent>
        <TabsContent value="geodesic"><GeodesicTab /></TabsContent>
        <TabsContent value="curvature"><CurvatureTab /></TabsContent>
      </Tabs>
    </div>
  );
}
