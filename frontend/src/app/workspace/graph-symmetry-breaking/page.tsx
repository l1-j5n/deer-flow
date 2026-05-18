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

const SYMMETRY_TYPES = [
  { value: "translational", label: "Translational 平移对称" },
  { value: "rotational", label: "Rotational 旋转对称" },
  { value: "scale", label: "Scale 尺度对称" },
  { value: "gauge", label: "Gauge 规范对称" },
  { value: "chiral", label: "Chiral 手性对称" },
  { value: "ai_discovered", label: "AI-Discovered AI发现" },
];

const BREAKING_MECHANISMS = [
  { value: "spontaneous", label: "Spontaneous 自发破缺" },
  { value: "explicit", label: "Explicit 显式破缺" },
  { value: "anomalous", label: "Anomalous 反常破缺" },
  { value: "dynamical", label: "Dynamical 动力学破缺" },
  { value: "radiative", label: "Radiative 辐射破缺" },
  { value: "ai_triggered", label: "AI-Triggered AI触发" },
];

const ORDER_PARAMETERS = [
  { value: "magnetization", label: "Magnetization 磁化强度" },
  { value: "condensate", label: "Condensate 凝聚序参量" },
  { value: "chirality", label: "Chirality 手性参量" },
  { value: "gauge_field", label: "Gauge Field 规范场" },
  { value: "topological_charge", label: "Topological Charge 拓扑荷" },
  { value: "ai_parameter", label: "AI Parameter AI参量" },
];

const GOLDSTONE_MODES = [
  { value: "acoustic", label: "Acoustic 声学模" },
  { value: "magnon", label: "Magnon 磁振子" },
  { value: "phase", label: "Phase 相位模" },
  { value: "gauge_boson", label: "Gauge Boson 规范玻色子" },
  { value: "pseudo_goldstone", label: "Pseudo-Goldstone 赝Goldstone" },
  { value: "ai_mode", label: "AI Mode AI模" },
];

const SYMMETRY_GROUPS = [
  { value: "continuous", label: "Continuous 连续群" },
  { value: "discrete", label: "Discrete 离散群" },
  { value: "lie_algebra", label: "Lie Algebra 李代数" },
  { value: "point_group", label: "Point Group 点群" },
  { value: "space_group", label: "Space Group 空间群" },
  { value: "ai_group", label: "AI Group AI群" },
];

const RESTORATION_PATHS = [
  { value: "temperature", label: "Temperature 温度恢复" },
  { value: "external_field", label: "External Field 外场" },
  { value: "coupling", label: "Coupling 耦合调整" },
  { value: "dimensional", label: "Dimensional 维度恢复" },
  { value: "topological", label: "Topological 拓扑恢复" },
  { value: "ai_restored", label: "AI-Restored AI恢复" },
];

const API_BASE = "/api/graph/causal-symmetry-breaking";

// ── Helper ─────────────────────────────────────────────────────────────────

function StatCard({ title, value, sub }: { title: string; value: string | number; sub?: string }) {
  return (
    <Card className="py-2">
      <CardContent className="pt-0 pb-2 px-4">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-lg font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-auto max-h-[420px] whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// ── Tab Components ─────────────────────────────────────────────────────────

function OverviewTab() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/overview`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={fetchOverview} disabled={loading}>
        {loading ? "Loading..." : "Load Overview"}
      </Button>
      {data && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatCard title="Layer" value={data.layer} />
            <StatCard title="Enum Values" value={data.enum_count} />
            <StatCard title="Endpoints" value={data.endpoint_count} />
            <StatCard title="Config Space" value={data.config_space.toLocaleString()} />
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Enums</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(data.enums).map(([name, values]) => (
                <div key={name} className="mb-2">
                  <p className="text-xs font-medium mb-1">{name}</p>
                  <div className="flex flex-wrap gap-1">
                    {values.map((v) => (
                      <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              {data.endpoints.map((ep, i) => (
                <div key={i} className="flex items-center gap-2 py-1 border-b last:border-0">
                  <Badge variant={ep.method === "GET" ? "default" : "outline"} className="text-xs">
                    {ep.method}
                  </Badge>
                  <code className="text-xs">{ep.path}</code>
                  <span className="text-xs text-muted-foreground">— {ep.desc}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cache Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(data.cache_stats).map(([k, v]) => (
                  <div key={k} className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground capitalize">{k}</p>
                    <p className="font-bold">{v}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function DetectTab() {
  const [symmetryType, setSymmetryType] = useState("translational");
  const [variables, setVariables] = useState("x1,x2,x3,x4,x5");
  const [resolution, setResolution] = useState("100");
  const [threshold, setThreshold] = useState("0.7");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symmetry_type: symmetryType,
          variables: variables.split(",").map((s) => s.trim()),
          resolution: parseInt(resolution),
          threshold: parseFloat(threshold),
        }),
      });
      setResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Symmetry Detection 对称检测</CardTitle>
          <CardDescription className="text-xs">
            Detect symmetries in causal structures using Noether&apos;s theorem and group theory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Symmetry Type</Label>
              <Select value={symmetryType} onValueChange={setSymmetryType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SYMMETRY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Variables (comma-sep)</Label>
              <Input value={variables} onChange={(e) => setVariables(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Resolution</Label>
              <Input type="number" value={resolution} onChange={(e) => setResolution(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Threshold</Label>
              <Input type="number" step="0.05" value={threshold} onChange={(e) => setThreshold(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "Detecting..." : "Detect Symmetry"}
          </Button>
        </CardContent>
      </Card>
      {result && <JsonBlock data={result} />}
    </div>
  );
}

function BreakTab() {
  const [mechanism, setMechanism] = useState("spontaneous");
  const [targetSymmetry, setTargetSymmetry] = useState("SO(3)");
  const [perturbation, setPerturbation] = useState("0.5");
  const [coolingRate, setCoolingRate] = useState("0.1");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/break`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mechanism,
          target_symmetry: targetSymmetry,
          perturbation_strength: parseFloat(perturbation),
          cooling_rate: parseFloat(coolingRate),
        }),
      });
      setResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Symmetry Breaking 对称破缺</CardTitle>
          <CardDescription className="text-xs">
            Apply symmetry breaking — spontaneous, explicit, anomalous mechanisms to causal structures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Breaking Mechanism</Label>
              <Select value={mechanism} onValueChange={setMechanism}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BREAKING_MECHANISMS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Target Symmetry Group</Label>
              <Input value={targetSymmetry} onChange={(e) => setTargetSymmetry(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Perturbation Strength</Label>
              <Input type="number" step="0.1" value={perturbation} onChange={(e) => setPerturbation(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Cooling Rate</Label>
              <Input type="number" step="0.01" value={coolingRate} onChange={(e) => setCoolingRate(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "Breaking..." : "Break Symmetry"}
          </Button>
        </CardContent>
      </Card>
      {result && <JsonBlock data={result} />}
    </div>
  );
}

function ParameterTab() {
  const [paramType, setParamType] = useState("magnetization");
  const [fieldStrength, setFieldStrength] = useState("1.0");
  const [dimensions, setDimensions] = useState("3");
  const [samples, setSamples] = useState("50");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/parameter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parameter_type: paramType,
          field_strength: parseFloat(fieldStrength),
          dimensions: parseInt(dimensions),
          samples: parseInt(samples),
        }),
      });
      setResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Order Parameter 序参量</CardTitle>
          <CardDescription className="text-xs">
            Extract order parameters — magnetization, condensate, chirality from symmetry-broken structures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Parameter Type</Label>
              <Select value={paramType} onValueChange={setParamType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_PARAMETERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Field Strength</Label>
              <Input type="number" step="0.1" value={fieldStrength} onChange={(e) => setFieldStrength(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Dimensions</Label>
              <Input type="number" value={dimensions} onChange={(e) => setDimensions(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Samples</Label>
              <Input type="number" value={samples} onChange={(e) => setSamples(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "Extracting..." : "Extract Order Parameter"}
          </Button>
        </CardContent>
      </Card>
      {result && <JsonBlock data={result} />}
    </div>
  );
}

function GoldstoneTab() {
  const [mode, setMode] = useState("acoustic");
  const [brokenGen, setBrokenGen] = useState("3");
  const [massScale, setMassScale] = useState("1.0");
  const [momCutoff, setMomCutoff] = useState("10.0");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/goldstone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          broken_generators: parseInt(brokenGen),
          mass_scale: parseFloat(massScale),
          momentum_cutoff: parseFloat(momCutoff),
        }),
      });
      setResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Goldstone Mode Analysis Goldstone模分析</CardTitle>
          <CardDescription className="text-xs">
            Analyze Goldstone bosons — acoustic, magnon, phase, gauge modes from spontaneous symmetry breaking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Goldstone Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOLDSTONE_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Broken Generators</Label>
              <Input type="number" value={brokenGen} onChange={(e) => setBrokenGen(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Mass Scale</Label>
              <Input type="number" step="0.1" value={massScale} onChange={(e) => setMassScale(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Momentum Cutoff</Label>
              <Input type="number" step="1" value={momCutoff} onChange={(e) => setMomCutoff(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "Analyzing..." : "Analyze Goldstone Modes"}
          </Button>
        </CardContent>
      </Card>
      {result && <JsonBlock data={result} />}
    </div>
  );
}

function ClassifyTab() {
  const [groupType, setGroupType] = useState("continuous");
  const [elements, setElements] = useState("6");
  const [representation, setRepresentation] = useState("fundamental");
  const [tensorRank, setTensorRank] = useState("2");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_type: groupType,
          elements: parseInt(elements),
          representation,
          tensor_rank: parseInt(tensorRank),
        }),
      });
      setResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Group Classification 群分类</CardTitle>
          <CardDescription className="text-xs">
            Classify symmetry groups — continuous, discrete, Lie algebras of causal structures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Group Type</Label>
              <Select value={groupType} onValueChange={setGroupType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SYMMETRY_GROUPS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Elements</Label>
              <Input type="number" value={elements} onChange={(e) => setElements(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Representation</Label>
              <Input value={representation} onChange={(e) => setRepresentation(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Tensor Rank</Label>
              <Input type="number" value={tensorRank} onChange={(e) => setTensorRank(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "Classifying..." : "Classify Group"}
          </Button>
        </CardContent>
      </Card>
      {result && <JsonBlock data={result} />}
    </div>
  );
}

function RestoreTab() {
  const [path, setPath] = useState("temperature");
  const [brokenSym, setBrokenSym] = useState("Z2");
  const [controlParam, setControlParam] = useState("2.0");
  const [maxSteps, setMaxSteps] = useState("20");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path,
          broken_symmetry: brokenSym,
          control_parameter: parseFloat(controlParam),
          max_steps: parseInt(maxSteps),
        }),
      });
      setResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Symmetry Restoration 对称恢复</CardTitle>
          <CardDescription className="text-xs">
            Restore broken symmetries via temperature, external field, coupling, dimensional, topological paths
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Restoration Path</Label>
              <Select value={path} onValueChange={setPath}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RESTORATION_PATHS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Broken Symmetry</Label>
              <Input value={brokenSym} onChange={(e) => setBrokenSym(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Control Parameter</Label>
              <Input type="number" step="0.1" value={controlParam} onChange={(e) => setControlParam(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Max Steps</Label>
              <Input type="number" value={maxSteps} onChange={(e) => setMaxSteps(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={run} disabled={loading} className="w-full">
            {loading ? "Restoring..." : "Restore Symmetry"}
          </Button>
        </CardContent>
      </Card>
      {result && (
        <>
          {(() => {
            const d = result as Record<string, unknown>;
            const traj = d.trajectory as Array<Record<string, number>> | undefined;
            return traj && traj.length > 0 ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Restoration Trajectory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {traj.map((pt) => (
                      <div key={pt.step} className="flex items-center gap-2 text-xs">
                        <span className="w-12 text-muted-foreground">Step {pt.step}</span>
                        <div className="flex-1 bg-muted rounded h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all"
                            style={{ width: `${(1 - pt.order_parameter) * 100}%` }}
                          />
                        </div>
                        <span className="w-16 text-right">
                          {(1 - pt.order_parameter).toFixed(2)} sym
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Restored</p>
                      <Badge variant={d.symmetry_restored ? "default" : "destructive"}>
                        {d.symmetry_restored ? "Yes ✓" : "No ✗"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Efficiency</p>
                      <p className="font-bold">{String(d.restoration_efficiency)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Energy Barrier</p>
                      <p className="font-bold">{String(d.energy_barrier)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null;
          })()}
          <JsonBlock data={result} />
        </>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function GraphSymmetryBreakingPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Causal Symmetry Breaking Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">
          因果对称破缺与相变检测引擎 — Layer 44 (v1.292.0) — 从对称初始条件到非对称因果结果的破缺分析
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard title="Layer" value={44} sub="Above Thermodynamic" />
        <StatCard title="Enums" value="6×6 = 36" sub="Symmetry types & mechanisms" />
        <StatCard title="Endpoints" value={7} sub="6 POST + 1 GET" />
        <StatCard title="Config Space" value="46,656" sub="6⁶ combinations" />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detect">Detect</TabsTrigger>
          <TabsTrigger value="break">Break</TabsTrigger>
          <TabsTrigger value="parameter">Parameter</TabsTrigger>
          <TabsTrigger value="goldstone">Goldstone</TabsTrigger>
          <TabsTrigger value="classify">Classify</TabsTrigger>
          <TabsTrigger value="restore">Restore</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="detect"><DetectTab /></TabsContent>
        <TabsContent value="break"><BreakTab /></TabsContent>
        <TabsContent value="parameter"><ParameterTab /></TabsContent>
        <TabsContent value="goldstone"><GoldstoneTab /></TabsContent>
        <TabsContent value="classify"><ClassifyTab /></TabsContent>
        <TabsContent value="restore"><RestoreTab /></TabsContent>
      </Tabs>
    </div>
  );
}
