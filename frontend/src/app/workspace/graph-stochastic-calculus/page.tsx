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

const PROCESS_TYPES = [
  { value: "ito_diffusion", label: "Itô Diffusion Itô扩散" },
  { value: "jump_diffusion", label: "Jump Diffusion 跳跃扩散" },
  { value: "levy_process", label: "Lévy Process Lévy过程" },
  { value: "branching_process", label: "Branching Process 分支过程" },
  { value: "mean_field_sde", label: "Mean-Field SDE 平均场" },
  { value: "ai_process", label: "AI-Process AI过程" },
];

const INTEGRAL_TYPES = [
  { value: "ito", label: "Itô Integral Itô积分" },
  { value: "stratonovich", label: "Stratonovich 斯特拉托诺维奇" },
  { value: "backward_itp", label: "Backward Itô 后向Itô" },
  { value: "maruyama", label: "Euler-Maruyama 欧拉-丸山" },
  { value: "milstein", label: "Milstein 米尔斯坦" },
  { value: "ai_integral", label: "AI-Integral AI积分" },
];

const FP_TYPES = [
  { value: "forward_fp", label: "Forward FP 前向方程" },
  { value: "backward_fp", label: "Backward FP 后向方程" },
  { value: "stationary", label: "Stationary 稳态解" },
  { value: "kolmogorov", label: "Kolmogorov 柯尔莫哥洛夫" },
  { value: "fractional_fp", label: "Fractional FP 分数阶" },
  { value: "ai_fp", label: "AI-FP AI方程" },
];

const MARTINGALE_TYPES = [
  { value: "doob_martingale", label: "Doob Martingale Doob鞅" },
  { value: "local_martingale", label: "Local 局部鞅" },
  { value: "submartingale", label: "Submartingale 下鞅" },
  { value: "supermartingale", label: "Supermartingale 上鞅" },
  { value: "azema_yor", label: "Azéma-Yor 阿泽马-约尔" },
  { value: "ai_martingale", label: "AI-Martingale AI鞅" },
];

const GIRSANOV_TYPES = [
  { value: "cameron_martin", label: "Cameron-Martin 卡梅伦-马丁" },
  { value: "girsanov_classic", label: "Girsanov Classic 经典Girsanov" },
  { value: "novikov_condition", label: "Novikov 诺维科夫条件" },
  { value: "kazamaki_condition", label: "Kazamaki 风间条件" },
  { value: "esscher_transform", label: "Esscher 埃舍尔变换" },
  { value: "ai_transform", label: "AI-Transform AI变换" },
];

const LANGEVIN_TYPES = [
  { value: "overdamped_langevin", label: "Overdamped Langevin 过阻尼" },
  { value: "underdamped_langevin", label: "Underdamped Langevin 欠阻尼" },
  { value: "adaptive_langevin", label: "Adaptive Langevin 自适应" },
  { value: "riemannian_langevin", label: "Riemannian Langevin 黎曼" },
  { value: "hamiltonian_mc", label: "Hamiltonian MC 哈密顿MC" },
  { value: "ai_dynamics", label: "AI-Dynamics AI动力学" },
];

const BASE = "/graph/stochastic-calculus";

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
  if (loading) return <div className="text-xs text-muted-foreground animate-pulse">Simulating...</div>;
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

function ProcessTab() {
  const [processType, setProcessType] = useState("ito_diffusion");
  const [dimension, setDimension] = useState(4);
  const [timeSteps, setTimeSteps] = useState(100);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("process", { process_type: processType, dimension, time_steps: timeSteps });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Stochastic Process 随机过程</CardTitle>
        <CardDescription className="text-xs">
          Itô扩散、跳跃扩散、Lévy过程、分支过程、平均场SDE轨迹模拟
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Process Type" items={PROCESS_TYPES} value={processType} onChange={setProcessType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={100} />
          <ParamInput label="Time Steps" value={timeSteps} onChange={setTimeSteps} min={10} max={10000} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Simulate</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function IntegralTab() {
  const [integralType, setIntegralType] = useState("ito");
  const [dimension, setDimension] = useState(4);
  const [partitions, setPartitions] = useState(1000);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("integral", { integral_type: integralType, dimension, partitions });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Stochastic Integral 随机积分</CardTitle>
        <CardDescription className="text-xs">
          Itô/Stratonovich积分、Brown路径、Itô-Stratonovich修正、收敛阶
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Integral Type" items={INTEGRAL_TYPES} value={integralType} onChange={setIntegralType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={100} />
          <ParamInput label="Partitions" value={partitions} onChange={setPartitions} min={10} max={100000} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Compute</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function FokkerPlanckTab() {
  const [fpType, setFpType] = useState("forward_fp");
  const [dimension, setDimension] = useState(3);
  const [diffCoeff, setDiffCoeff] = useState(1.0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("fokker-planck", { fp_type: fpType, dimension, diffusion_coeff: diffCoeff });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Fokker-Planck Equation Fokker-Planck方程</CardTitle>
        <CardDescription className="text-xs">
          前向/后向方程、稳态解、Kolmogorov方程、分数阶FPE、熵产生率
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="FP Type" items={FP_TYPES} value={fpType} onChange={setFpType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={50} />
          <ParamInput label="Diffusion Coeff D" value={diffCoeff} onChange={setDiffCoeff} min={0.01} max={100} step={0.1} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Solve</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function MartingaleTab() {
  const [martType, setMartType] = useState("doob_martingale");
  const [dimension, setDimension] = useState(4);
  const [steps, setSteps] = useState(100);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("martingale", { martingale_type: martType, dimension, steps });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Martingale Analysis 鞅分析</CardTitle>
        <CardDescription className="text-xs">
          Doob分解、可选停时、上穿次数、BDG不等式、二次变差、角括号过程
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Martingale Type" items={MARTINGALE_TYPES} value={martType} onChange={setMartType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={100} />
          <ParamInput label="Steps" value={steps} onChange={setSteps} min={10} max={10000} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Analyze</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function GirsanovTab() {
  const [girType, setGirType] = useState("girsanov_classic");
  const [dimension, setDimension] = useState(4);
  const [timeHorizon, setTimeHorizon] = useState(1.0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("girsanov", { transform_type: girType, dimension, time_horizon: timeHorizon });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Girsanov Transform Girsanov测度变换</CardTitle>
        <CardDescription className="text-xs">
          Cameron-Martin、Girsanov定理、Novikov条件、Kazamaki条件、Esscher变换、Radon-Nikodym导数
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Transform Type" items={GIRSANOV_TYPES} value={girType} onChange={setGirType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={100} />
          <ParamInput label="Time Horizon T" value={timeHorizon} onChange={setTimeHorizon} min={0.01} max={100} step={0.1} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Transform</Button>
        <ResultBlock data={result} loading={loading} />
      </CardContent>
    </Card>
  );
}

function LangevinTab() {
  const [langType, setLangType] = useState("overdamped_langevin");
  const [dimension, setDimension] = useState(4);
  const [temperature, setTemperature] = useState(1.0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const data = await postEndpoint("langevin", { dynamics_type: langType, dimension, temperature });
      setResult(data);
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Langevin Dynamics Langevin动力学</CardTitle>
        <CardDescription className="text-xs">
          过阻尼/欠阻尼Langevin、自适应采样、黎曼流形采样、HMC、能量守恒、细致平衡
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <ParamSelect label="Dynamics Type" items={LANGEVIN_TYPES} value={langType} onChange={setLangType} />
          <ParamInput label="Dimension" value={dimension} onChange={setDimension} min={1} max={1000} />
          <ParamInput label="Temperature T" value={temperature} onChange={setTemperature} min={0.01} max={100} step={0.1} />
        </div>
        <Button size="sm" onClick={run} disabled={loading}>Simulate</Button>
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
          Layer 51 — 因果随机微积分与Itô扩散引擎 全量端点与配置空间
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

export default function StochasticCalculusPage() {
  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold">Stochastic Calculus & Itô Diffusion</h1>
        <p className="text-xs text-muted-foreground">
          Layer 51 (v1.299) — 因果随机微积分与Itô扩散引擎 — 随机过程 · Itô积分 · Fokker-Planck · 鞅论 · Girsanov · Langevin
        </p>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="process" className="text-xs">Process</TabsTrigger>
          <TabsTrigger value="integral" className="text-xs">Integral</TabsTrigger>
          <TabsTrigger value="fokker" className="text-xs">F-P Eq</TabsTrigger>
          <TabsTrigger value="martingale" className="text-xs">Martingale</TabsTrigger>
          <TabsTrigger value="girsanov" className="text-xs">Girsanov</TabsTrigger>
          <TabsTrigger value="langevin" className="text-xs">Langevin</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="process"><ProcessTab /></TabsContent>
        <TabsContent value="integral"><IntegralTab /></TabsContent>
        <TabsContent value="fokker"><FokkerPlanckTab /></TabsContent>
        <TabsContent value="martingale"><MartingaleTab /></TabsContent>
        <TabsContent value="girsanov"><GirsanovTab /></TabsContent>
        <TabsContent value="langevin"><LangevinTab /></TabsContent>
      </Tabs>
    </div>
  );
}
