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

const SUPERVIRASORO_TYPES = [
  { value: "ns_sector", label: "NS Sector 中性子区域" },
  { value: "r_sector", label: "R Sector 拉蒙区域" },
  { value: "bps_short", label: "BPS Short BPS短表示" },
  { value: "non_unitary", label: "Non-Unitary 非幺正" },
  { value: "extended_n2", label: "Extended N=2 扩展N=2" },
  { value: "ai_supervirasoro", label: "AI-SuperVirasoro AI超维拉索罗" },
];

const BPS_TYPES = [
  { value: "half_bps", label: "1/2-BPS 半BPS" },
  { value: "quarter_bps", label: "1/4-BPS 四分之一BPS" },
  { value: "eighth_bps", label: "1/8-BPS 八分之一BPS" },
  { value: "marginal", label: "Marginal 边缘BPS" },
  { value: "threshold", label: "Threshold 阈值BPS" },
  { value: "ai_bps", label: "AI-BPS AI-BPS态" },
];

const SUSY_TYPES = [
  { value: "n1_susy", label: "N=1 SUSY N=1超对称" },
  { value: "n2_seiberg_witten", label: "N=2 Seiberg-Witten" },
  { value: "n4_sym", label: "N=4 SYM N=4超对称杨-米尔斯" },
  { value: "n8_sugra", label: "N=8 SUGRA N=8超引力" },
  { value: "extended_susy", label: "Extended 扩展超对称" },
  { value: "ai_susy", label: "AI-SUSY AI超对称" },
];

const SW_TYPES = [
  { value: "sw_curve", label: "SW Curve SW曲线" },
  { value: "sw_differential", label: "SW Differential SW微分" },
  { value: "sw_monodromy", label: "SW Monodromy SW单项式" },
  { value: "sw_singularity", label: "SW Singularity SW奇点" },
  { value: "sw_moduli", label: "SW Moduli SW模空间" },
  { value: "ai_seiberg_witten", label: "AI-SW AI赛伯格-威滕" },
];

const INDEX_TYPES = [
  { value: "schur_index", label: "Schur 舒尔指标" },
  { value: "macdonald_index", label: "Macdonald 麦克唐纳德" },
  { value: "hall_littlewood", label: "Hall-Littlewood 霍尔-李特尔伍德" },
  { value: "cardioid_limit", label: "Cardioid 心脏线极限" },
  { value: "casimir_energy", label: "Casimir Energy 卡西米尔能" },
  { value: "ai_index", label: "AI-Index AI超共形指标" },
];

const NONRENORM_TYPES = [
  { value: "holomorphy", label: "Holomorphy 全纯性" },
  { value: "r_symmetry", label: "R-Symmetry R对称性" },
  { value: "topology", label: "Topology 拓扑性" },
  { value: "anomaly_matching", label: "Anomaly Matching 反常匹配" },
  { value: "a_theorem", label: "a-Theorem a-定理" },
  { value: "ai_nonrenorm", label: "AI-NonRenorm AI非重正化" },
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

export default function SuperconformalPage() {
  const [tab, setTab] = useState("overview");

  // Overview
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // SuperVirasoro
  const [sector, setSector] = useState("ns_sector");
  const [centralCharge, setCentralCharge] = useState("1.5");
  const [nSusy, setNSusy] = useState("2");
  const [svResult, setSvResult] = useState<unknown>(null);
  const [loadingSv, setLoadingSv] = useState(false);

  // BPS
  const [bpsType, setBpsType] = useState("half_bps");
  const [dimension, setDimension] = useState("2.0");
  const [nCharges, setNCharges] = useState("4");
  const [bpsResult, setBpsResult] = useState<unknown>(null);
  const [loadingBps, setLoadingBps] = useState(false);

  // SUSY
  const [susyType, setSusyType] = useState("n4_sym");
  const [nGenerators, setNGenerators] = useState("4");
  const [coupling, setCoupling] = useState("1.0");
  const [susyResult, setSusyResult] = useState<unknown>(null);
  const [loadingSusy, setLoadingSusy] = useState(false);

  // Seiberg-Witten
  const [swType, setSwType] = useState("sw_curve");
  const [gaugeRank, setGaugeRank] = useState("1");
  const [nFlavors, setNFlavors] = useState("2");
  const [swResult, setSwResult] = useState<unknown>(null);
  const [loadingSw, setLoadingSw] = useState(false);

  // Index
  const [indexType, setIndexType] = useState("schur_index");
  const [indexCharges, setIndexCharges] = useState("4");
  const [fugacityDim, setFugacityDim] = useState("4");
  const [indexResult, setIndexResult] = useState<unknown>(null);
  const [loadingIndex, setLoadingIndex] = useState(false);

  // Non-Renormalization
  const [nrType, setNrType] = useState("holomorphy");
  const [pertOrder, setPertOrder] = useState("1");
  const [nOperators, setNOperators] = useState("4");
  const [nrResult, setNrResult] = useState<unknown>(null);
  const [loadingNr, setLoadingNr] = useState(false);

  // ── Fetch helpers ──────────────────────────────────────────────────────

  async function fetchOverview() {
    setLoadingOverview(true);
    try {
      const r = await fetch(`${API_BASE}/graph/superconformal/overview`);
      const d = await r.json();
      setOverview(d);
    } catch (e) { console.error(e); }
    setLoadingOverview(false);
  }

  async function fetchSupervirasoro() {
    setLoadingSv(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/superconformal/supervirasoro?sector=${sector}&central_charge=${centralCharge}&n_supersymmetry=${nSusy}`,
        { method: "POST" }
      );
      setSvResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingSv(false);
  }

  async function fetchBps() {
    setLoadingBps(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/superconformal/bps?bps_type=${bpsType}&dimension=${dimension}&n_charges=${nCharges}`,
        { method: "POST" }
      );
      setBpsResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingBps(false);
  }

  async function fetchSusy() {
    setLoadingSusy(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/superconformal/susy?susy_type=${susyType}&n_generators=${nGenerators}&coupling=${coupling}`,
        { method: "POST" }
      );
      setSusyResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingSusy(false);
  }

  async function fetchSw() {
    setLoadingSw(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/superconformal/seiberg-witten?sw_type=${swType}&gauge_rank=${gaugeRank}&n_flavors=${nFlavors}`,
        { method: "POST" }
      );
      setSwResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingSw(false);
  }

  async function fetchIndex() {
    setLoadingIndex(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/superconformal/index?index_type=${indexType}&n_charges=${indexCharges}&fugacity_dim=${fugacityDim}`,
        { method: "POST" }
      );
      setIndexResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingIndex(false);
  }

  async function fetchNr() {
    setLoadingNr(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/superconformal/non-renormalization?nr_type=${nrType}&perturbation_order=${pertOrder}&n_operators=${nOperators}`,
        { method: "POST" }
      );
      setNrResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingNr(false);
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

  // ── SuperVirasoro Tab ──────────────────────────────────────────────────

  function SupervirasoroTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Super-Virasoro Representations 超维拉索罗表示</CardTitle>
            <CardDescription>L_n + G_r^± + J_m, spectral flow α: L_m → L_m + αJ_m + cα²/6</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Sector</Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUPERVIRASORO_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Central Charge c</Label>
                <Input type="number" step={0.1} min={-100} max={100} value={centralCharge} onChange={(e) => setCentralCharge(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">N Supersymmetry</Label>
                <Input type="number" min={1} max={8} value={nSusy} onChange={(e) => setNSusy(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchSupervirasoro} disabled={loadingSv}>
              {loadingSv ? "Computing..." : "Compute Super-Virasoro 计算超维拉索罗"}
            </Button>
          </CardContent>
        </Card>
        {svResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Super-Virasoro Result 超维拉索罗结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={svResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── BPS Tab ────────────────────────────────────────────────────────────

  function BpsTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">BPS States BPS态</CardTitle>
            <CardDescription>Δ = |R|, M = |Z| — saturating BPS bound, protected operators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">BPS Type</Label>
                <Select value={bpsType} onValueChange={setBpsType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BPS_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Scaling Dimension Δ</Label>
                <Input type="number" step={0.1} min={0} max={100} value={dimension} onChange={(e) => setDimension(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">N Charges</Label>
                <Input type="number" min={1} max={30} value={nCharges} onChange={(e) => setNCharges(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchBps} disabled={loadingBps}>
              {loadingBps ? "Computing..." : "Compute BPS 计算BPS态"}
            </Button>
          </CardContent>
        </Card>
        {bpsResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">BPS Result BPS态结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={bpsResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── SUSY Tab ───────────────────────────────────────────────────────────

  function SusyTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Supersymmetry Classification 超对称分类</CardTitle>
            <CardDescription>{"{Q^I_α, Q̄^J_̇β} = 2δ^{IJ}σ^μ_{α̇β}P_μ + ε_{α̇β}Z^{IJ}"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">SUSY Type</Label>
                <Select value={susyType} onValueChange={setSusyType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SUSY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">N Generators</Label>
                <Input type="number" min={1} max={8} value={nGenerators} onChange={(e) => setNGenerators(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Coupling g</Label>
                <Input type="number" step={0.1} min={0} max={100} value={coupling} onChange={(e) => setCoupling(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchSusy} disabled={loadingSusy}>
              {loadingSusy ? "Computing..." : "Compute SUSY 计算超对称"}
            </Button>
          </CardContent>
        </Card>
        {susyResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">SUSY Result 超对称结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={susyResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Seiberg-Witten Tab ─────────────────────────────────────────────────

  function SeibergWittenTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Seiberg-Witten Theory 赛伯格-威滕理论</CardTitle>
            <CardDescription>y² = P(x,u), λ_SW = (√P/x)dx, a(u) = ∮_A λ_SW</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">SW Type</Label>
                <Select value={swType} onValueChange={setSwType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SW_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Gauge Rank</Label>
                <Input type="number" min={1} max={10} value={gaugeRank} onChange={(e) => setGaugeRank(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">N Flavors</Label>
                <Input type="number" min={0} max={20} value={nFlavors} onChange={(e) => setNFlavors(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchSw} disabled={loadingSw}>
              {loadingSw ? "Computing..." : "Compute Seiberg-Witten 计算SW理论"}
            </Button>
          </CardContent>
        </Card>
        {swResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Seiberg-Witten Result SW理论结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={swResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Index Tab ──────────────────────────────────────────────────────────

  function IndexTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Superconformal Index 超共形指标</CardTitle>
            <CardDescription>I = Tr(-1)^F e^{{-βδ}} Π x_i^{{f_i}}, PE[ι] = exp(Σ ι(x^n)/n)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Index Type</Label>
                <Select value={indexType} onValueChange={setIndexType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INDEX_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">N Charges</Label>
                <Input type="number" min={1} max={30} value={indexCharges} onChange={(e) => setIndexCharges(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Fugacity Dim</Label>
                <Input type="number" min={1} max={20} value={fugacityDim} onChange={(e) => setFugacityDim(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchIndex} disabled={loadingIndex}>
              {loadingIndex ? "Computing..." : "Compute Index 计算超共形指标"}
            </Button>
          </CardContent>
        </Card>
        {indexResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Index Result 超共形指标结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={indexResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Non-Renormalization Tab ────────────────────────────────────────────

  function NonRenormTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Non-Renormalization Theorems 非重正化定理</CardTitle>
            <CardDescription>W_eff = W_tree + non-perturbative, a_UV ≥ a_IR, &apos;t Hooft anomaly matching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">NR Type</Label>
                <Select value={nrType} onValueChange={setNrType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NONRENORM_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Perturbation Order</Label>
                <Input type="number" min={0} max={10} value={pertOrder} onChange={(e) => setPertOrder(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">N Operators</Label>
                <Input type="number" min={1} max={30} value={nOperators} onChange={(e) => setNOperators(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchNr} disabled={loadingNr}>
              {loadingNr ? "Computing..." : "Compute Non-Renorm 计算非重正化"}
            </Button>
          </CardContent>
        </Card>
        {nrResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Non-Renormalization Result 非重正化结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={nrResult} />
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
        <h1 className="text-2xl font-bold">Superconformal Field Theory (SCFT)</h1>
        <Badge variant="outline">Layer 57</Badge>
        <Badge variant="secondary">v1.305.0</Badge>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl">
        超共形场论引擎 — Super-Virasoro algebra (L_n + G_r^± + J_m + spectral flow),
        BPS states (1/2, 1/4, 1/8), N=1/2/4/8 supersymmetry,
        Seiberg-Witten theory (y²=P(x,u), λ_SW, monodromy, moduli space),
        superconformal indices (Schur/Macdonald/Hall-Littlewood/Cardioid),
        non-renormalization theorems (holomorphy/R-symmetry/a-theorem/anomaly matching),
        AdS/CFT duality (N=4 SYM ↔ AdS₅×S⁵), chiral rings, wall-crossing
      </p>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-7 w-full max-w-3xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="supervirasoro">SVRep</TabsTrigger>
          <TabsTrigger value="bps">BPS</TabsTrigger>
          <TabsTrigger value="susy">SUSY</TabsTrigger>
          <TabsTrigger value="seiberg-witten">SW</TabsTrigger>
          <TabsTrigger value="index">Index</TabsTrigger>
          <TabsTrigger value="non-renorm">NR</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="supervirasoro"><SupervirasoroTab /></TabsContent>
        <TabsContent value="bps"><BpsTab /></TabsContent>
        <TabsContent value="susy"><SusyTab /></TabsContent>
        <TabsContent value="seiberg-witten"><SeibergWittenTab /></TabsContent>
        <TabsContent value="index"><IndexTab /></TabsContent>
        <TabsContent value="non-renorm"><NonRenormTab /></TabsContent>
      </Tabs>
    </div>
  );
}
