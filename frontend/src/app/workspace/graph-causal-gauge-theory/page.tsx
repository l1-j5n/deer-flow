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
const GAUGE_CONNECTION_TYPES = [
  { value: "yang_mills_field", label: "杨-米尔斯场" },
  { value: "abelian_gauge", label: "阿贝尔规范场" },
  { value: "non_abelian_gauge", label: "非阿贝尔规范场" },
  { value: "gauge_potential", label: "规范势" },
  { value: "connection_form", label: "联络形式" },
  { value: "ai_gauge_connection", label: "AI规范联络" },
];

const CURVATURE_TYPES = [
  { value: "riemann_curvature", label: "Riemann曲率" },
  { value: "yang_mills_field_strength", label: "Yang-Mills场强" },
  { value: "ricci_tensor", label: "Ricci张量" },
  { value: "weyl_tensor", label: "Weyl张量" },
  { value: "bianchi_identity", label: "Bianchi恒等式" },
  { value: "ai_curvature", label: "AI曲率" },
];

const FIBER_BUNDLE_TYPES = [
  { value: "principal_bundle", label: "主丛" },
  { value: "associated_bundle", label: "配丛" },
  { value: "vector_bundle", label: "矢量丛" },
  { value: "tangent_bundle", label: "切丛" },
  { value: "spinor_bundle", label: "旋量丛" },
  { value: "ai_fiber_bundle", label: "AI纤维丛" },
];

const SYMMETRY_BREAKING_TYPES = [
  { value: "higgs_mechanism", label: "Higgs机制" },
  { value: "spontaneous_breaking", label: "自发破缺" },
  { value: "goldstone_boson", label: "Goldstone玻色子" },
  { value: "symmetry_restoration", label: "对称性恢复" },
  { value: "electroweak_unification", label: "电弱统一" },
  { value: "ai_symmetry_breaking", label: "AI对称破缺" },
];

const TOPOLOGICAL_DEFECT_TYPES = [
  { value: "magnetic_monopole", label: "磁单极子" },
  { value: "cosmic_string", label: "宇宙弦" },
  { value: "domain_wall", label: "畴壁" },
  { value: "instanton", label: "瞬子" },
  { value: "sphaleron", label: "Sphaleron" },
  { value: "ai_topological_defect", label: "AI拓扑缺陷" },
];

const CHERN_SIMONS_TYPES = [
  { value: "chern_simons_action", label: "CS作用量" },
  { value: "knot_invariant", label: "纽结不变量" },
  { value: "three_manifold_invariant", label: "三维流形不变量" },
  { value: "fractional_quantum_hall", label: "分数量子霍尔" },
  { value: "topological_quantum_field", label: "拓扑量子场" },
  { value: "ai_chern_simons", label: "AI Chern-Simons" },
];

// API base
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001/graph/causal-gauge-theory";

// JSON render helper
function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted/50 border rounded-md p-3 text-xs overflow-auto max-h-[420px] whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// Stat card helper
function StatCard({ title, value, desc }: { title: string; value: string; desc: string }) {
  return (
    <Card className="min-w-[140px]">
      <CardHeader className="pb-1">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

// ──────────────────────────────────────────────
export default function CausalGaugeTheoryPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // ── Overview state ──
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOv, setLoadingOv] = useState(false);

  // ── Gauge Connection state ──
  const [gcType, setGcType] = useState(GAUGE_CONNECTION_TYPES[0].value);
  const [gcCoupling, setGcCoupling] = useState("0.3");
  const [gcGroupDim, setGcGroupDim] = useState("8");
  const [gcResult, setGcResult] = useState<unknown>(null);
  const [loadingGc, setLoadingGc] = useState(false);

  // ── Curvature state ──
  const [crType, setCrType] = useState(CURVATURE_TYPES[0].value);
  const [crSignature, setCrSignature] = useState("-2");
  const [crDimension, setCrDimension] = useState("4");
  const [crResult, setCrResult] = useState<unknown>(null);
  const [loadingCr, setLoadingCr] = useState(false);

  // ── Fiber Bundle state ──
  const [fbType, setFbType] = useState(FIBER_BUNDLE_TYPES[0].value);
  const [fbBaseDim, setFbBaseDim] = useState("4");
  const [fbFiberDim, setFbFiberDim] = useState("4");
  const [fbResult, setFbResult] = useState<unknown>(null);
  const [loadingFb, setLoadingFb] = useState(false);

  // ── Symmetry Breaking state ──
  const [sbType, setSbType] = useState(SYMMETRY_BREAKING_TYPES[0].value);
  const [sbGroupOrder, setSbGroupOrder] = useState("24");
  const [sbVev, setSbVev] = useState("246");
  const [sbResult, setSbResult] = useState<unknown>(null);
  const [loadingSb, setLoadingSb] = useState(false);

  // ── Topological Defect state ──
  const [tdType, setTdType] = useState(TOPOLOGICAL_DEFECT_TYPES[0].value);
  const [tdEnergyScale, setTdEnergyScale] = useState("1e16");
  const [tdDensity, setTdDensity] = useState("1e-6");
  const [tdResult, setTdResult] = useState<unknown>(null);
  const [loadingTd, setLoadingTd] = useState(false);

  // ── Chern-Simons state ──
  const [csType, setCsType] = useState(CHERN_SIMONS_TYPES[0].value);
  const [csLevelK, setCsLevelK] = useState("1");
  const [csBoundary, setCsBoundary] = useState("0");
  const [csResult, setCsResult] = useState<unknown>(null);
  const [loadingCs, setLoadingCs] = useState(false);

  // ── API call helper ──
  async function callApi(endpoint: string, body?: Record<string, unknown>) {
    const url = `${API_BASE}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
    return res.json();
  }

  // ── Overview fetch ──
  const fetchOverview = async () => {
    setLoadingOv(true);
    try {
      const res = await fetch(`${API_BASE}/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOv(false);
    }
  };

  // ── Gauge Connection ──
  const runGc = async () => {
    setLoadingGc(true);
    try {
      const r = await callApi("/gauge-connection", {
        connection_type: gcType,
        coupling_constant: parseFloat(gcCoupling),
        gauge_group_dimension: parseInt(gcGroupDim),
      });
      setGcResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGc(false);
    }
  };

  // ── Curvature ──
  const runCr = async () => {
    setLoadingCr(true);
    try {
      const r = await callApi("/curvature", {
        curvature_type: crType,
        metric_signature: parseInt(crSignature),
        dimension: parseInt(crDimension),
      });
      setCrResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCr(false);
    }
  };

  // ── Fiber Bundle ──
  const runFb = async () => {
    setLoadingFb(true);
    try {
      const r = await callApi("/fiber-bundle", {
        bundle_type: fbType,
        base_dimension: parseInt(fbBaseDim),
        fiber_dimension: parseInt(fbFiberDim),
      });
      setFbResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFb(false);
    }
  };

  // ── Symmetry Breaking ──
  const runSb = async () => {
    setLoadingSb(true);
    try {
      const r = await callApi("/symmetry-breaking", {
        breaking_type: sbType,
        symmetry_group_order: parseInt(sbGroupOrder),
        vev_gev: parseFloat(sbVev),
      });
      setSbResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSb(false);
    }
  };

  // ── Topological Defect ──
  const runTd = async () => {
    setLoadingTd(true);
    try {
      const r = await callApi("/topological-defect", {
        defect_type: tdType,
        energy_scale_gev: parseFloat(tdEnergyScale),
        defect_density: parseFloat(tdDensity),
      });
      setTdResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTd(false);
    }
  };

  // ── Chern-Simons ──
  const runCs = async () => {
    setLoadingCs(true);
    try {
      const r = await callApi("/chern-simons", {
        theory_type: csType,
        level_k: parseInt(csLevelK),
        boundary_condition: parseFloat(csBoundary),
      });
      setCsResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCs(false);
    }
  };

  // ──────────────────────── RENDER ────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Causal Gauge Theory Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Layer 73 (v1.321.0) — Bridges quantum gravity experimental design (L72) with
          causal gauge theory and fiber bundle connections: gauge field connections, curvature tensors,
          fiber bundle structures, gauge symmetry breaking, topological defects, and Chern-Simons theories.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Layer" value="73" desc="Causal Gauge Theory" />
        <StatCard title="Enums" value="36" desc="6 x 6 values" />
        <StatCard title="Endpoints" value="7" desc="6 POST + 1 GET" />
        <StatCard title="Config Space" value="46,656" desc="6^6 combinations" />
      </div>

      {/* Physics Bridge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physics Bridge — L72 QG Experimental Design → L73 Causal Gauge Theory</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <div>1. 桌面QG实验 → 规范场联络: BMV实验 → Yang-Mills规范势 A_μ → 耦合常数 g → 非阿贝尔规范场</div>
          <div>2. 引力波探测 → 曲率张量: LISA应变 h~10⁻²¹ → Riemann曲率 R_μνρσ → Ricci张量 R_μν → Weyl张量 C_μνρσ</div>
          <div>3. 离子束碰撞 → 纤维丛结构: QGP温度 ~200 MeV → 主丛 P(M,G) → 切丛 TM → 旋量丛 SM</div>
          <div>4. 探测器阵列 → 规范对称破缺: 暗物质探测 → Higgs机制 → 自发对称破缺 G→H → Goldstone玻色子</div>
          <div>5. 物质波干涉 → 拓扑缺陷: BEC相位 → 磁单极子 → 宇宙弦 → 瞬子/Sphaleron</div>
          <div>6. 天体物理探针 → Chern-Simons理论: FRB色散 → CS作用量 S_CS = (k/4π)∫Tr(A∧dA+⅔A³) → 拓扑量子场论 → 分数量子霍尔效应</div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gc">Gauge Conn</TabsTrigger>
          <TabsTrigger value="cr">Curvature</TabsTrigger>
          <TabsTrigger value="fb">Fiber Bundle</TabsTrigger>
          <TabsTrigger value="sb">Symmetry</TabsTrigger>
          <TabsTrigger value="td">Topo Defect</TabsTrigger>
          <TabsTrigger value="cs">Chern-Simons</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Fetch engine metadata, enum definitions, and cache statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchOverview} disabled={loadingOv}>
                {loadingOv ? "Loading..." : "Fetch Overview"}
              </Button>
              {overview && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Layer:</span> {overview.layer}
                    </div>
                    <div>
                      <span className="font-medium">Version:</span> {overview.version}
                    </div>
                    <div>
                      <span className="font-medium">Engine:</span> {overview.engine}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{overview.description}</p>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-2">Enums ({overview.enum_count} values)</h4>
                    {Object.entries(overview.enums).map(([name, vals]) => (
                      <div key={name} className="mb-2">
                        <span className="text-xs font-mono text-muted-foreground">{name}:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {vals.map((v) => (
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
                    <h4 className="font-medium text-sm mb-2">Endpoints ({overview.endpoint_count})</h4>
                    {overview.endpoints.map((ep) => (
                      <div key={ep.path} className="flex items-center gap-2 text-sm mb-1">
                        <Badge variant={ep.method === "POST" ? "default" : "outline"}>
                          {ep.method}
                        </Badge>
                        <code className="text-xs">{ep.path}</code>
                        <span className="text-xs text-muted-foreground">— {ep.desc}</span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-2">Cache Stats</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(overview.cache_stats).map(([k, v]) => (
                        <div key={k} className="text-xs">
                          <span className="font-mono">{k}:</span> {v}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Gauge Connection ── */}
        <TabsContent value="gc">
          <Card>
            <CardHeader>
              <CardTitle>Gauge Connection</CardTitle>
              <CardDescription>
                Configure gauge field connections: Yang-Mills fields, abelian and non-abelian gauge fields,
                gauge potentials, connection forms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Connection Type</Label>
                  <Select value={gcType} onValueChange={setGcType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GAUGE_CONNECTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coupling Constant</Label>
                  <Input type="number" value={gcCoupling} onChange={(e) => setGcCoupling(e.target.value)} step="0.01" />
                </div>
                <div>
                  <Label>Gauge Group Dimension</Label>
                  <Input type="number" value={gcGroupDim} onChange={(e) => setGcGroupDim(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runGc} disabled={loadingGc}>
                {loadingGc ? "Computing..." : "Compute Gauge Connection"}
              </Button>
              {gcResult && <JsonBlock data={gcResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Curvature ── */}
        <TabsContent value="cr">
          <Card>
            <CardHeader>
              <CardTitle>Curvature</CardTitle>
              <CardDescription>
                Compute curvature tensors: Riemann curvature, Yang-Mills field strength,
                Ricci tensor, Weyl tensor, Bianchi identities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Curvature Type</Label>
                  <Select value={crType} onValueChange={setCrType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURVATURE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Metric Signature</Label>
                  <Input type="number" value={crSignature} onChange={(e) => setCrSignature(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Dimension</Label>
                  <Input type="number" value={crDimension} onChange={(e) => setCrDimension(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runCr} disabled={loadingCr}>
                {loadingCr ? "Computing..." : "Compute Curvature Tensor"}
              </Button>
              {crResult && <JsonBlock data={crResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Fiber Bundle ── */}
        <TabsContent value="fb">
          <Card>
            <CardHeader>
              <CardTitle>Fiber Bundle</CardTitle>
              <CardDescription>
                Construct fiber bundle structures: principal bundles, associated bundles,
                vector bundles, tangent bundles, spinor bundles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bundle Type</Label>
                  <Select value={fbType} onValueChange={setFbType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FIBER_BUNDLE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base Dimension</Label>
                  <Input type="number" value={fbBaseDim} onChange={(e) => setFbBaseDim(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Fiber Dimension</Label>
                  <Input type="number" value={fbFiberDim} onChange={(e) => setFbFiberDim(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runFb} disabled={loadingFb}>
                {loadingFb ? "Computing..." : "Construct Fiber Bundle"}
              </Button>
              {fbResult && <JsonBlock data={fbResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Symmetry Breaking ── */}
        <TabsContent value="sb">
          <Card>
            <CardHeader>
              <CardTitle>Symmetry Breaking</CardTitle>
              <CardDescription>
                Analyze gauge symmetry breaking: Higgs mechanism, spontaneous symmetry breaking,
                Goldstone bosons, symmetry restoration, electroweak unification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Breaking Type</Label>
                  <Select value={sbType} onValueChange={setSbType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SYMMETRY_BREAKING_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Symmetry Group Order</Label>
                  <Input type="number" value={sbGroupOrder} onChange={(e) => setSbGroupOrder(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>VEV (GeV)</Label>
                  <Input type="number" value={sbVev} onChange={(e) => setSbVev(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runSb} disabled={loadingSb}>
                {loadingSb ? "Computing..." : "Analyze Symmetry Breaking"}
              </Button>
              {sbResult && <JsonBlock data={sbResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Topological Defect ── */}
        <TabsContent value="td">
          <Card>
            <CardHeader>
              <CardTitle>Topological Defect</CardTitle>
              <CardDescription>
                Investigate topological defects: magnetic monopoles, cosmic strings,
                domain walls, instantons, sphalerons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Defect Type</Label>
                  <Select value={tdType} onValueChange={setTdType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TOPOLOGICAL_DEFECT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Energy Scale (GeV)</Label>
                  <Input type="text" value={tdEnergyScale} onChange={(e) => setTdEnergyScale(e.target.value)} />
                </div>
                <div>
                  <Label>Defect Density</Label>
                  <Input type="text" value={tdDensity} onChange={(e) => setTdDensity(e.target.value)} />
                </div>
              </div>
              <Button onClick={runTd} disabled={loadingTd}>
                {loadingTd ? "Computing..." : "Investigate Topological Defect"}
              </Button>
              {tdResult && <JsonBlock data={tdResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Chern-Simons ── */}
        <TabsContent value="cs">
          <Card>
            <CardHeader>
              <CardTitle>Chern-Simons</CardTitle>
              <CardDescription>
                Explore Chern-Simons theories: CS action, knot invariants, 3-manifold invariants,
                fractional quantum Hall effect, topological quantum field theory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Theory Type</Label>
                  <Select value={csType} onValueChange={setCsType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CHERN_SIMONS_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level k</Label>
                  <Input type="number" value={csLevelK} onChange={(e) => setCsLevelK(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Boundary Condition</Label>
                  <Input type="number" value={csBoundary} onChange={(e) => setCsBoundary(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runCs} disabled={loadingCs}>
                {loadingCs ? "Computing..." : "Explore Chern-Simons Theory"}
              </Button>
              {csResult && <JsonBlock data={csResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
