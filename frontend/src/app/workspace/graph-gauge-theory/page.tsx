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

const BUNDLE_TYPES = [
  { value: "principal_bundle", label: "Principal Bundle 主丛" },
  { value: "vector_bundle", label: "Vector Bundle 向量丛" },
  { value: "associated_bundle", label: "Associated Bundle 伴随丛" },
  { value: "spinor_bundle", label: "Spinor Bundle 旋量丛" },
  { value: "jet_bundle", label: "Jet Bundle 射流丛" },
  { value: "ai_bundle", label: "AI-Bundle AI纤维丛" },
];

const CONNECTION_TYPES = [
  { value: "yang_mills", label: "Yang-Mills 杨-米尔斯" },
  { value: "chern_simons", label: "Chern-Simons 陈-西蒙斯" },
  { value: "bf_theory", label: "BF Theory BF理论" },
  { value: "einstein_cartan", label: "Einstein-Cartan 爱因斯坦-嘉当" },
  { value: "teleparallel", label: "Teleparallel 远程平行" },
  { value: "ai_connection", label: "AI-Connection AI联络" },
];

const CURVATURE_TYPES = [
  { value: "yang_mills_field", label: "YM Field 杨-米尔斯场" },
  { value: "riemann_curvature", label: "Riemann 黎曼曲率" },
  { value: "chern_class", label: "Chern Class 陈类" },
  { value: "chern_simons_form", label: "CS Form 陈-西蒙斯形式" },
  { value: "bianchi_identity", label: "Bianchi 比安基恒等式" },
  { value: "ai_curvature", label: "AI-Curvature AI曲率" },
];

const HOLONOMY_TYPES = [
  { value: "wilson_loop", label: "Wilson Loop 威尔逊环" },
  { value: "polyakov_loop", label: "Polyakov Loop 玻利亚科夫环" },
  { value: "t_hooft_loop", label: "'t Hooft Loop 特胡夫特环" },
  { value: "surface_order", label: "Surface Order 面序" },
  { value: "berry_phase", label: "Berry Phase 贝里相位" },
  { value: "ai_holonomy", label: "AI-Holonomy AI和乐" },
];

const LATTICE_TYPES = [
  { value: "wilson_action", label: "Wilson Action 威尔逊作用量" },
  { value: "improved_action", label: "Improved 改进作用量" },
  { value: "symanzik", label: "Symanzik 西曼齐克" },
  { value: "domain_wall", label: "Domain Wall 畴壁" },
  { value: "overlap", label: "Overlap 重叠费米子" },
  { value: "ai_lattice", label: "AI-Lattice AI格子" },
];

const BRST_TYPES = [
  { value: "ghosts", label: "Ghosts 鬼场" },
  { value: "anti_ghosts", label: "Anti-Ghosts 反鬼场" },
  { value: "nilpotent", label: "Nilpotent 幂零算子" },
  { value: "slavnov_taylor", label: "Slavnov-Taylor S-T恒等式" },
  { value: "ward_identity", label: "Ward Identity Ward恒等式" },
  { value: "ai_brst", label: "AI-BRST AI量子化" },
];

const API_BASE = "http://localhost:8001";

// ── Helper ─────────────────────────────────────────────────────────────────

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted/50 border rounded-md p-3 text-xs overflow-auto max-h-80 font-mono leading-relaxed">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function StatCard({ title, value, sub }: { title: string; value: string; sub?: string }) {
  return (
    <Card className="py-2">
      <CardHeader className="pb-1 pt-2 px-4">
        <CardDescription className="text-xs">{title}</CardDescription>
      </CardHeader>
      <CardContent className="px-4 pb-2">
        <p className="text-xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function GaugeTheoryPage() {
  const [tab, setTab] = useState("overview");

  // Overview
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Bundle
  const [bundleType, setBundleType] = useState("principal_bundle");
  const [bundleDim, setBundleDim] = useState("4");
  const [fiberDim, setFiberDim] = useState("3");
  const [bundleResult, setBundleResult] = useState<unknown>(null);
  const [loadingBundle, setLoadingBundle] = useState(false);

  // Connection
  const [connType, setConnType] = useState("yang_mills");
  const [connDim, setConnDim] = useState("4");
  const [gaugeRank, setGaugeRank] = useState("3");
  const [connResult, setConnResult] = useState<unknown>(null);
  const [loadingConn, setLoadingConn] = useState(false);

  // Curvature
  const [curvType, setCurvType] = useState("yang_mills_field");
  const [curvDim, setCurvDim] = useState("4");
  const [curvOrder, setCurvOrder] = useState("2");
  const [curvResult, setCurvResult] = useState<unknown>(null);
  const [loadingCurv, setLoadingCurv] = useState(false);

  // Holonomy
  const [holoType, setHoloType] = useState("wilson_loop");
  const [holoDim, setHoloDim] = useState("4");
  const [loopLen, setLoopLen] = useState("10");
  const [holoResult, setHoloResult] = useState<unknown>(null);
  const [loadingHolo, setLoadingHolo] = useState(false);

  // Lattice
  const [latticeType, setLatticeType] = useState("wilson_action");
  const [latticeSize, setLatticeSize] = useState("8");
  const [beta, setBeta] = useState("5.5");
  const [latticeResult, setLatticeResult] = useState<unknown>(null);
  const [loadingLattice, setLoadingLattice] = useState(false);

  // BRST
  const [brstType, setBrstType] = useState("ghosts");
  const [ghostNum, setGhostNum] = useState("2");
  const [nFields, setNFields] = useState("8");
  const [brstResult, setBrstResult] = useState<unknown>(null);
  const [loadingBrst, setLoadingBrst] = useState(false);

  // ── Fetch helpers ──────────────────────────────────────────────────────

  async function fetchOverview() {
    setLoadingOverview(true);
    try {
      const r = await fetch(`${API_BASE}/graph/gauge-theory/overview`);
      const d = await r.json();
      setOverview(d);
    } catch (e) { console.error(e); }
    setLoadingOverview(false);
  }

  async function fetchBundle() {
    setLoadingBundle(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/gauge-theory/bundle?bundle_type=${bundleType}&dimension=${bundleDim}&fiber_dim=${fiberDim}`,
        { method: "POST" }
      );
      setBundleResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingBundle(false);
  }

  async function fetchConnection() {
    setLoadingConn(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/gauge-theory/connection?conn_type=${connType}&dimension=${connDim}&gauge_group_rank=${gaugeRank}`,
        { method: "POST" }
      );
      setConnResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingConn(false);
  }

  async function fetchCurvature() {
    setLoadingCurv(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/gauge-theory/curvature?curv_type=${curvType}&dimension=${curvDim}&order=${curvOrder}`,
        { method: "POST" }
      );
      setCurvResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingCurv(false);
  }

  async function fetchHolonomy() {
    setLoadingHolo(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/gauge-theory/holonomy?holo_type=${holoType}&dimension=${holoDim}&loop_length=${loopLen}`,
        { method: "POST" }
      );
      setHoloResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingHolo(false);
  }

  async function fetchLattice() {
    setLoadingLattice(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/gauge-theory/lattice?lattice_type=${latticeType}&lattice_size=${latticeSize}&beta=${beta}`,
        { method: "POST" }
      );
      setLatticeResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingLattice(false);
  }

  async function fetchBrst() {
    setLoadingBrst(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/gauge-theory/brst?brst_type=${brstType}&ghost_number=${ghostNum}&n_fields=${nFields}`,
        { method: "POST" }
      );
      setBrstResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingBrst(false);
  }

  // ── Overview Tab ───────────────────────────────────────────────────────

  function OverviewTab() {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button onClick={fetchOverview} disabled={loadingOverview}>
            {loadingOverview ? "Loading..." : "Fetch Overview"}
          </Button>
          {overview && (
            <Badge variant="outline" className="text-sm">
              Layer {overview.layer} | {overview.version}
            </Badge>
          )}
        </div>
        {overview && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard title="Enums / Values" value={`${overview.enum_count}`} sub="6 × 6 = 36" />
              <StatCard title="Endpoints" value={`${overview.endpoint_count}`} sub="6 POST + 1 GET" />
              <StatCard title="Config Space" value={`${overview.config_space.toExponential(2)}`} sub="6^6" />
              <StatCard title="Caches" value={`${Object.values(overview.cache_stats).reduce((a, b) => a + b, 0)}`} sub="total cached" />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Engine 引擎</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Name:</strong> {overview.engine}</p>
                <p><strong>Desc:</strong> {overview.description}</p>
                <Separator />
                <p className="font-semibold mt-2">Endpoints:</p>
                <div className="space-y-1">
                  {overview.endpoints.map((ep, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Badge variant={ep.method === "GET" ? "secondary" : "default"}>
                        {ep.method}
                      </Badge>
                      <code className="text-muted-foreground">{ep.path}</code>
                      <span className="text-muted-foreground">— {ep.desc}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <p className="font-semibold mt-2">Enums:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(overview.enums).map(([name, vals]) => (
                    <div key={name} className="text-xs">
                      <p className="font-mono font-semibold">{name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {vals.map((v) => (
                          <Badge key={v} variant="outline" className="text-[10px] px-1.5 py-0">{v}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  // ── Bundle Tab ─────────────────────────────────────────────────────────

  function BundleTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fiber Bundle Configuration 纤维丛配置</CardTitle>
            <CardDescription>Principal / Vector / Associated / Spinor / Jet bundles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Bundle Type</Label>
                <Select value={bundleType} onValueChange={setBundleType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BUNDLE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Base Dimension</Label>
                <Input type="number" min={1} max={100} value={bundleDim} onChange={(e) => setBundleDim(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Fiber Dimension</Label>
                <Input type="number" min={1} max={50} value={fiberDim} onChange={(e) => setFiberDim(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchBundle} disabled={loadingBundle}>
              {loadingBundle ? "Computing..." : "Compute Bundle 计算纤维丛"}
            </Button>
          </CardContent>
        </Card>
        {bundleResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bundle Result 纤维丛结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={bundleResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Connection Tab ─────────────────────────────────────────────────────

  function ConnectionTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Gauge Connection 规范联络</CardTitle>
            <CardDescription>Yang-Mills / Chern-Simons / BF / Einstein-Cartan / Teleparallel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Connection Type</Label>
                <Select value={connType} onValueChange={setConnType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONNECTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Dimension</Label>
                <Input type="number" min={1} max={100} value={connDim} onChange={(e) => setConnDim(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Gauge Group Rank</Label>
                <Input type="number" min={1} max={20} value={gaugeRank} onChange={(e) => setGaugeRank(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchConnection} disabled={loadingConn}>
              {loadingConn ? "Computing..." : "Compute Connection 计算联络"}
            </Button>
          </CardContent>
        </Card>
        {connResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Connection Result 联络结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={connResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Curvature Tab ──────────────────────────────────────────────────────

  function CurvatureTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Curvature Form 曲率形式</CardTitle>
            <CardDescription>F = dA + A ∧ A — Field Strength Tensor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Curvature Type</Label>
                <Select value={curvType} onValueChange={setCurvType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURVATURE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Dimension</Label>
                <Input type="number" min={1} max={100} value={curvDim} onChange={(e) => setCurvDim(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Order</Label>
                <Input type="number" min={1} max={10} value={curvOrder} onChange={(e) => setCurvOrder(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchCurvature} disabled={loadingCurv}>
              {loadingCurv ? "Computing..." : "Compute Curvature 计算曲率"}
            </Button>
          </CardContent>
        </Card>
        {curvResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Curvature Result 曲率结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={curvResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Holonomy Tab ───────────────────────────────────────────────────────

  function HolonomyTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Holonomy Group 和乐群</CardTitle>
            <CardDescription>W(C) = Tr P exp(∮_C A) — Wilson / Polyakov / Berry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Holonomy Type</Label>
                <Select value={holoType} onValueChange={setHoloType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {HOLONOMY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Dimension</Label>
                <Input type="number" min={1} max={100} value={holoDim} onChange={(e) => setHoloDim(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Loop Length</Label>
                <Input type="number" min={3} max={200} value={loopLen} onChange={(e) => setLoopLen(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchHolonomy} disabled={loadingHolo}>
              {loadingHolo ? "Computing..." : "Compute Holonomy 计算和乐"}
            </Button>
          </CardContent>
        </Card>
        {holoResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Holonomy Result 和乐结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={holoResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Lattice Tab ────────────────────────────────────────────────────────

  function LatticeTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lattice Gauge Theory 格子规范理论</CardTitle>
            <CardDescription>S_W = β Σ(1 − 1/N Re Tr U_□) — Wilson / Improved / Symanzik</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Action Type</Label>
                <Select value={latticeType} onValueChange={setLatticeType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LATTICE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Lattice Size</Label>
                <Input type="number" min={2} max={64} value={latticeSize} onChange={(e) => setLatticeSize(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">β Coupling</Label>
                <Input type="number" step={0.1} min={0.1} max={20} value={beta} onChange={(e) => setBeta(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchLattice} disabled={loadingLattice}>
              {loadingLattice ? "Computing..." : "Compute Lattice 计算格子"}
            </Button>
          </CardContent>
        </Card>
        {latticeResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lattice Result 格子结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={latticeResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── BRST Tab ───────────────────────────────────────────────────────────

  function BRSTTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">BRST Quantization BRST量子化</CardTitle>
            <CardDescription>Q² = 0 — Ghosts / Slavnov-Taylor / Ward Identities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">BRST Type</Label>
                <Select value={brstType} onValueChange={setBrstType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BRST_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ghost Number</Label>
                <Input type="number" min={1} max={20} value={ghostNum} onChange={(e) => setGhostNum(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">N Fields</Label>
                <Input type="number" min={1} max={50} value={nFields} onChange={(e) => setNFields(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchBrst} disabled={loadingBrst}>
              {loadingBrst ? "Computing..." : "Compute BRST 计算量子化"}
            </Button>
          </CardContent>
        </Card>
        {brstResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">BRST Result BRST结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={brstResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">Causal Gauge Theory</h1>
        <Badge variant="outline">Layer 54</Badge>
        <Badge variant="secondary">v1.302.0</Badge>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl">
        因果规范理论与纤维丛联络引擎 — Fiber bundles, gauge connections A_μ, curvature F = dA + A∧A,
        Wilson loops W(C) = Tr P exp(∮ A), lattice gauge theory, BRST quantization Q²=0
      </p>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-7 w-full max-w-3xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bundle">Bundle</TabsTrigger>
          <TabsTrigger value="connection">Connect</TabsTrigger>
          <TabsTrigger value="curvature">Curvat</TabsTrigger>
          <TabsTrigger value="holonomy">Holonom</TabsTrigger>
          <TabsTrigger value="lattice">Lattice</TabsTrigger>
          <TabsTrigger value="brst">BRST</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="bundle"><BundleTab /></TabsContent>
        <TabsContent value="connection"><ConnectionTab /></TabsContent>
        <TabsContent value="curvature"><CurvatureTab /></TabsContent>
        <TabsContent value="holonomy"><HolonomyTab /></TabsContent>
        <TabsContent value="lattice"><LatticeTab /></TabsContent>
        <TabsContent value="brst"><BRSTTab /></TabsContent>
      </Tabs>
    </div>
  );
}
