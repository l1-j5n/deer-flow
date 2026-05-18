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

const RG_FLOW_TYPES = [
  { value: "wilson", label: "Wilson 威尔逊" },
  { value: "momentum_shell", label: "Momentum Shell 动量壳" },
  { value: "real_space", label: "Real Space 实空间" },
  { value: "functional", label: "Functional 泛函" },
  { value: "exact", label: "Exact 精确" },
  { value: "ai_hybrid", label: "AI-Hybrid AI混合" },
];

const FIXED_POINT_TYPES = [
  { value: "gaussian", label: "Gaussian 高斯" },
  { value: "wilson_fisher", label: "Wilson-Fisher 威尔逊-费舍尔" },
  { value: "nontrivial", label: "Nontrivial 非平庸" },
  { value: "multicritical", label: "Multicritical 多临界" },
  { value: "topological", label: "Topological 拓扑" },
  { value: "ai_discovered", label: "AI-Discovered AI发现" },
];

const SCALING_TYPES = [
  { value: "relevant", label: "Relevant 相关算子" },
  { value: "irrelevant", label: "Irrelevant 无关算子" },
  { value: "marginal", label: "Marginal 边缘算子" },
  { value: "dangerously_irrelevant", label: "Dangerously Irrelevant 危险无关" },
  { value: "redundant", label: "Redundant 冗余算子" },
  { value: "ai_classified", label: "AI-Classified AI分类" },
];

const UNIVERSALITY_CLASSES = [
  { value: "ising", label: "Ising 伊辛" },
  { value: "xy", label: "XY XY模型" },
  { value: "percolation", label: "Percolation 渗流" },
  { value: "potts", label: "Potts 波茨" },
  { value: "directed_percolation", label: "Directed Percolation 有向渗流" },
  { value: "ai_universal", label: "AI-Universal AI普适" },
];

const BETA_FUNCTION_TYPES = [
  { value: "one_loop", label: "One Loop 单圈" },
  { value: "two_loop", label: "Two Loop 双圈" },
  { value: "epsilon_expansion", label: "ε-Expansion ε展开" },
  { value: "functional", label: "Functional 泛函" },
  { value: "nonperturbative", label: "Nonperturbative 非微扰" },
  { value: "ai_approximated", label: "AI-Approximated AI近似" },
];

const OPERATOR_TYPES = [
  { value: "primary", label: "Primary 本征算子" },
  { value: "descendant", label: "Descendant 后代算子" },
  { value: "conserved_current", label: "Conserved Current 守恒流" },
  { value: "stress_tensor", label: "Stress Tensor 应力张量" },
  { value: "marginal_operator", label: "Marginal Operator 边缘算子" },
  { value: "ai_operator", label: "AI-Operator AI算子" },
];

// ── Helper ─────────────────────────────────────────────────────────────────

const API = "/api/graph/causal-renormalization-group";

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </Card>
  );
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted/50 rounded-lg p-3 text-xs overflow-auto max-h-80 font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function GraphRenormalizationGroupPage() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Overview
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // Renormalize
  const [rgFlowType, setRgFlowType] = useState("wilson");
  const [rgCouplings, setRgCouplings] = useState("0.5, 0.3, -0.2");
  const [rgScaleFactor, setRgScaleFactor] = useState("2.0");
  const [rgIterations, setRgIterations] = useState("6");
  const [rgResult, setRgResult] = useState<unknown>(null);

  // Fixed Point
  const [fpType, setFpType] = useState("wilson_fisher");
  const [fpDimensions, setFpDimensions] = useState("3");
  const [fpCouplings, setFpCouplings] = useState("3");
  const [fpStability, setFpStability] = useState("0.7");
  const [fpResult, setFpResult] = useState<unknown>(null);

  // Scaling
  const [scType, setScType] = useState("relevant");
  const [scOpDim, setScOpDim] = useState("1.5");
  const [scSpacetime, setScSpacetime] = useState("4");
  const [scSamples, setScSamples] = useState("8");
  const [scResult, setScResult] = useState<unknown>(null);

  // Universality
  const [uniClass, setUniClass] = useState("ising");
  const [uniSpatial, setUniSpatial] = useState("3");
  const [uniOrderParam, setUniOrderParam] = useState("1");
  const [uniSymmetry, setUniSymmetry] = useState("Z2");
  const [uniResult, setUniResult] = useState<unknown>(null);

  // Beta Function
  const [betaType, setBetaType] = useState("one_loop");
  const [betaCoupling, setBetaCoupling] = useState("0.5");
  const [betaLoopOrder, setBetaLoopOrder] = useState("2");
  const [betaEpsilon, setBetaEpsilon] = useState("1.0");
  const [betaResult, setBetaResult] = useState<unknown>(null);

  // Operator
  const [opType, setOpType] = useState("primary");
  const [opPrimaryDim, setOpPrimaryDim] = useState("0.518");
  const [opCentralCharge, setOpCentralCharge] = useState("0.5");
  const [opChannels, setOpChannels] = useState("6");
  const [opResult, setOpResult] = useState<unknown>(null);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/overview`);
      const data = await res.json();
      setOverview(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchRenormalize = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/renormalize`, {
        flow_type: rgFlowType,
        couplings: rgCouplings.split(",").map((s) => parseFloat(s.trim())),
        scale_factor: parseFloat(rgScaleFactor),
        iterations: parseInt(rgIterations),
      });
      setRgResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchFixedPoint = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/fixedpoint`, {
        fixedpoint_type: fpType,
        dimensions: parseInt(fpDimensions),
        coupling_count: parseInt(fpCouplings),
        stability_threshold: parseFloat(fpStability),
      });
      setFpResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchScaling = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/scaling`, {
        scaling_type: scType,
        operator_dim: parseFloat(scOpDim),
        spacetime_dim: parseInt(scSpacetime),
        samples: parseInt(scSamples),
      });
      setScResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchUniversality = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/universality`, {
        universality_class: uniClass,
        spatial_dim: parseInt(uniSpatial),
        order_parameter_dim: parseInt(uniOrderParam),
        symmetry_group: uniSymmetry,
      });
      setUniResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchBetaFunction = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/betafunction`, {
        beta_type: betaType,
        coupling_value: parseFloat(betaCoupling),
        loop_order: parseInt(betaLoopOrder),
        epsilon: parseFloat(betaEpsilon),
      });
      setBetaResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchOperator = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/operator`, {
        operator_type: opType,
        primary_dimension: parseFloat(opPrimaryDim),
        central_charge: parseFloat(opCentralCharge),
        num_channels: parseInt(opChannels),
      });
      setOpResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Causal Renormalization Group Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            因果重正化群与标度不变性引擎 — Layer 46 (v1.294)
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          6^6 = 46,656 configurations
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="renormalize">Renormalize</TabsTrigger>
          <TabsTrigger value="fixedpoint">Fixed Point</TabsTrigger>
          <TabsTrigger value="scaling">Scaling</TabsTrigger>
          <TabsTrigger value="universality">Universality</TabsTrigger>
          <TabsTrigger value="betafunction">Beta Fn</TabsTrigger>
          <TabsTrigger value="operator">OPE</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ──────────────────────────────────────── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Causal Renormalization Group Engine — scale-invariant analysis
                for causal structures across the intelligence stack
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchOverview} disabled={loading}>
                {loading ? "Loading..." : "Load Overview"}
              </Button>
              {overview && (
                <>
                  <div className="grid grid-cols-4 gap-3">
                    <StatCard title="Layer" value={overview.layer} />
                    <StatCard title="Enums" value={overview.enum_count} />
                    <StatCard title="Endpoints" value={overview.endpoint_count} />
                    <StatCard title="Config Space" value={overview.config_space.toLocaleString()} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Enums</h3>
                    {Object.entries(overview.enums).map(([name, values]) => (
                      <div key={name} className="mb-2">
                        <p className="text-xs font-medium text-muted-foreground">{name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {values.map((v) => (
                            <Badge key={v} variant="secondary" className="text-xs">
                              {v}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Endpoints</h3>
                    <div className="space-y-1">
                      {overview.endpoints.map((ep) => (
                        <div key={ep.path} className="flex items-center gap-2 text-xs">
                          <Badge variant={ep.method === "GET" ? "default" : "outline"}>
                            {ep.method}
                          </Badge>
                          <code className="text-muted-foreground">{ep.path}</code>
                          <span className="text-muted-foreground">— {ep.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Cache Stats</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(overview.cache_stats).map(([k, v]) => (
                        <div key={k} className="text-xs">
                          <span className="font-medium">{k}:</span>{" "}
                          <span className="text-muted-foreground">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Renormalize Tab ────────────────────────────────────── */}
        <TabsContent value="renormalize">
          <Card>
            <CardHeader>
              <CardTitle>Renormalize 重正化流</CardTitle>
              <CardDescription>
                Perform RG flow analysis with iterative coarse-graining — Wilson,
                momentum-shell, real-space, functional, exact, AI-hybrid schemes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>RG Flow Type</Label>
                  <Select value={rgFlowType} onValueChange={setRgFlowType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RG_FLOW_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Couplings (comma-separated)</Label>
                  <Input value={rgCouplings} onChange={(e) => setRgCouplings(e.target.value)} />
                </div>
                <div>
                  <Label>Scale Factor (b)</Label>
                  <Input type="number" step="0.1" value={rgScaleFactor} onChange={(e) => setRgScaleFactor(e.target.value)} />
                </div>
                <div>
                  <Label>Iterations</Label>
                  <Input type="number" value={rgIterations} onChange={(e) => setRgIterations(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchRenormalize} disabled={loading}>
                {loading ? "Flowing..." : "Run RG Flow"}
              </Button>
              {rgResult && <JsonBlock data={rgResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Fixed Point Tab ────────────────────────────────────── */}
        <TabsContent value="fixedpoint">
          <Card>
            <CardHeader>
              <CardTitle>Fixed Point 不动点分类</CardTitle>
              <CardDescription>
                Classify RG fixed points (Gaussian, Wilson-Fisher, nontrivial,
                multicritical, topological) with stability analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fixed Point Type</Label>
                  <Select value={fpType} onValueChange={setFpType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FIXED_POINT_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Spacetime Dimensions</Label>
                  <Input type="number" value={fpDimensions} onChange={(e) => setFpDimensions(e.target.value)} />
                </div>
                <div>
                  <Label>Coupling Count</Label>
                  <Input type="number" value={fpCouplings} onChange={(e) => setFpCouplings(e.target.value)} />
                </div>
                <div>
                  <Label>Stability Threshold</Label>
                  <Input type="number" step="0.1" value={fpStability} onChange={(e) => setFpStability(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchFixedPoint} disabled={loading}>
                {loading ? "Classifying..." : "Classify Fixed Point"}
              </Button>
              {fpResult && <JsonBlock data={fpResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Scaling Tab ────────────────────────────────────────── */}
        <TabsContent value="scaling">
          <Card>
            <CardHeader>
              <CardTitle>Scaling 标度维度</CardTitle>
              <CardDescription>
                Extract scaling dimensions and classify operators as
                relevant/irrelevant/marginal with critical exponent verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Scaling Type</Label>
                  <Select value={scType} onValueChange={setScType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SCALING_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Operator Dimension (Δ)</Label>
                  <Input type="number" step="0.1" value={scOpDim} onChange={(e) => setScOpDim(e.target.value)} />
                </div>
                <div>
                  <Label>Spacetime Dimension (d)</Label>
                  <Input type="number" value={scSpacetime} onChange={(e) => setScSpacetime(e.target.value)} />
                </div>
                <div>
                  <Label>Samples</Label>
                  <Input type="number" value={scSamples} onChange={(e) => setScSamples(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchScaling} disabled={loading}>
                {loading ? "Extracting..." : "Extract Scaling Dimensions"}
              </Button>
              {scResult && <JsonBlock data={scResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Universality Tab ────────────────────────────────────── */}
        <TabsContent value="universality">
          <Card>
            <CardHeader>
              <CardTitle>Universality 普适类</CardTitle>
              <CardDescription>
                Identify universality classes (Ising, XY, percolation, Potts,
                directed percolation) with critical exponent matching and CFT data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Universality Class</Label>
                  <Select value={uniClass} onValueChange={setUniClass}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UNIVERSALITY_CLASSES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Spatial Dimension</Label>
                  <Input type="number" value={uniSpatial} onChange={(e) => setUniSpatial(e.target.value)} />
                </div>
                <div>
                  <Label>Order Parameter Dim (n)</Label>
                  <Input type="number" value={uniOrderParam} onChange={(e) => setUniOrderParam(e.target.value)} />
                </div>
                <div>
                  <Label>Symmetry Group</Label>
                  <Input value={uniSymmetry} onChange={(e) => setUniSymmetry(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchUniversality} disabled={loading}>
                {loading ? "Matching..." : "Identify Universality Class"}
              </Button>
              {uniResult && <JsonBlock data={uniResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Beta Function Tab ───────────────────────────────────── */}
        <TabsContent value="betafunction">
          <Card>
            <CardHeader>
              <CardTitle>Beta Function β函数</CardTitle>
              <CardDescription>
                Compute beta functions at various approximation orders — one-loop,
                two-loop, ε-expansion, functional, nonperturbative
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Beta Function Type</Label>
                  <Select value={betaType} onValueChange={setBetaType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BETA_FUNCTION_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coupling Value (g)</Label>
                  <Input type="number" step="0.1" value={betaCoupling} onChange={(e) => setBetaCoupling(e.target.value)} />
                </div>
                <div>
                  <Label>Loop Order</Label>
                  <Input type="number" value={betaLoopOrder} onChange={(e) => setBetaLoopOrder(e.target.value)} />
                </div>
                <div>
                  <Label>ε (epsilon)</Label>
                  <Input type="number" step="0.1" value={betaEpsilon} onChange={(e) => setBetaEpsilon(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchBetaFunction} disabled={loading}>
                {loading ? "Computing..." : "Compute Beta Function"}
              </Button>
              {betaResult && <JsonBlock data={betaResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Operator Tab ────────────────────────────────────────── */}
        <TabsContent value="operator">
          <Card>
            <CardHeader>
              <CardTitle>OPE 算子乘积展开</CardTitle>
              <CardDescription>
                Compute operator product expansion for conformal causal fields —
                primary operators, descendant levels, OPE channels, crossing equations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Operator Type</Label>
                  <Select value={opType} onValueChange={setOpType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OPERATOR_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Primary Dimension (Δ)</Label>
                  <Input type="number" step="0.001" value={opPrimaryDim} onChange={(e) => setOpPrimaryDim(e.target.value)} />
                </div>
                <div>
                  <Label>Central Charge (c)</Label>
                  <Input type="number" step="0.1" value={opCentralCharge} onChange={(e) => setOpCentralCharge(e.target.value)} />
                </div>
                <div>
                  <Label>OPE Channels</Label>
                  <Input type="number" value={opChannels} onChange={(e) => setOpChannels(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchOperator} disabled={loading}>
                {loading ? "Expanding..." : "Compute OPE"}
              </Button>
              {opResult && <JsonBlock data={opResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
