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
const TOPOLOGICAL_QFT_TYPES = [
  { value: "chern_simons_tqft", label: "Chern-Simons TQFT" },
  { value: "donaldson_theory", label: "Donaldson理论" },
  { value: "seiberg_witten_theory", label: "Seiberg-Witten理论" },
  { value: "floer_homology", label: "Floer同调" },
  { value: "gromov_witten_theory", label: "Gromov-Witten理论" },
  { value: "ai_topological_qft", label: "AI拓扑QFT" },
];

const JONES_POLYNOMIAL_TYPES = [
  { value: "jones_v_torus", label: "Jones环面纽结" },
  { value: "homfly_polynomial", label: "HOMFLY多项式" },
  { value: "kauffman_bracket", label: "Kauffman括号" },
  { value: "alexander_polynomial", label: "Alexander多项式" },
  { value: "khovanov_homology", label: "Khovanov同调" },
  { value: "ai_knot_polynomial", label: "AI纽结多项式" },
];

const BJT_MODEL_TYPES = [
  { value: "witten_cs_wzw", label: "Witten CS-WZW" },
  { value: "bf_theory", label: "BF理论" },
  { value: "schwinger_model", label: "Schwinger模型" },
  { value: "thooft_model", label: "'t Hooft模型" },
  { value: "polyakov_model", label: "Polyakov模型" },
  { value: "ai_bjt_model", label: "AI BJT模型" },
];

const CFT_TOPOLOGY_TYPES = [
  { value: "rational_cft", label: "有理CFT" },
  { value: "logarithmic_cft", label: "对数CFT" },
  { value: "minimal_model", label: "极小模型" },
  { value: "wzw_model", label: "WZW模型" },
  { value: "vertex_operator_algebra", label: "顶点算子代数" },
  { value: "ai_cft_topology", label: "AI CFT拓扑" },
];

const ATIYAH_SEGAL_TYPES = [
  { value: "bordism_category", label: "配边范畴" },
  { value: "cobordism_hypothesis", label: "配边假说" },
  { value: "tangle_hypothesis", label: "纠缠假说" },
  { value: "extended_tqft", label: "扩展TQFT" },
  { value: "factorization_homology", label: "因子化同调" },
  { value: "ai_atiyah_segal", label: "AI Atiyah-Segal" },
];

const K_THEORY_TYPES = [
  { value: "topological_k_theory", label: "拓扑K理论" },
  { value: "k_homology", label: "K同调" },
  { value: "twisted_k_theory", label: "扭曲K理论" },
  { value: "index_theory", label: "指标理论" },
  { value: "t_duality", label: "T对偶" },
  { value: "ai_k_theory", label: "AI K理论" },
];

// API base
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001/graph/quantum-topological-field-theory";

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
export default function QuantumTopologicalFieldTheoryPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // ── Overview state ──
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOv, setLoadingOv] = useState(false);

  // ── Topological QFT state ──
  const [ttType, setTtType] = useState(TOPOLOGICAL_QFT_TYPES[0].value);
  const [ttCouplingLevel, setTtCouplingLevel] = useState("1");
  const [ttGenusG, setTtGenusG] = useState("2");
  const [ttResult, setTtResult] = useState<unknown>(null);
  const [loadingTt, setLoadingTt] = useState(false);

  // ── Jones Polynomial state ──
  const [jtType, setJtType] = useState(JONES_POLYNOMIAL_TYPES[0].value);
  const [jtCrossingNumber, setJtCrossingNumber] = useState("8");
  const [jtWrithe, setJtWrithe] = useState("3");
  const [jtResult, setJtResult] = useState<unknown>(null);
  const [loadingJt, setLoadingJt] = useState(false);

  // ── BJT Model state ──
  const [bjType, setBjType] = useState(BJT_MODEL_TYPES[0].value);
  const [bjGaugeRank, setBjGaugeRank] = useState("3");
  const [bjModuliDimension, setBjModuliDimension] = useState("6");
  const [bjResult, setBjResult] = useState<unknown>(null);
  const [loadingBj, setLoadingBj] = useState(false);

  // ── CFT Topology state ──
  const [ctType, setCtType] = useState(CFT_TOPOLOGY_TYPES[0].value);
  const [ctCentralCharge, setCtCentralCharge] = useState("1.0");
  const [ctPrimaryFields, setCtPrimaryFields] = useState("4");
  const [ctResult, setCtResult] = useState<unknown>(null);
  const [loadingCt, setLoadingCt] = useState(false);

  // ── Atiyah-Segal state ──
  const [atType, setAtType] = useState(ATIYAH_SEGAL_TYPES[0].value);
  const [atBordismDimension, setAtBordismDimension] = useState("3");
  const [atFunctorRank, setAtFunctorRank] = useState("2");
  const [atResult, setAtResult] = useState<unknown>(null);
  const [loadingAt, setLoadingAt] = useState(false);

  // ── K-Theory state ──
  const [ktType, setKtType] = useState(K_THEORY_TYPES[0].value);
  const [ktChernCharacter, setKtChernCharacter] = useState("1.0");
  const [ktTwistClass, setKtTwistClass] = useState("0");
  const [ktResult, setKtResult] = useState<unknown>(null);
  const [loadingKt, setLoadingKt] = useState(false);

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

  // ── Topological QFT ──
  const runTt = async () => {
    setLoadingTt(true);
    try {
      const r = await callApi("/topological-qft", {
        tqft_type: ttType,
        coupling_level: parseInt(ttCouplingLevel),
        genus_g: parseInt(ttGenusG),
      });
      setTtResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTt(false);
    }
  };

  // ── Jones Polynomial ──
  const runJt = async () => {
    setLoadingJt(true);
    try {
      const r = await callApi("/jones-polynomial", {
        polynomial_type: jtType,
        crossing_number: parseInt(jtCrossingNumber),
        writhe: parseInt(jtWrithe),
      });
      setJtResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingJt(false);
    }
  };

  // ── BJT Model ──
  const runBj = async () => {
    setLoadingBj(true);
    try {
      const r = await callApi("/bjt-model", {
        model_type: bjType,
        gauge_rank: parseInt(bjGaugeRank),
        moduli_dimension: parseInt(bjModuliDimension),
      });
      setBjResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBj(false);
    }
  };

  // ── CFT Topology ──
  const runCt = async () => {
    setLoadingCt(true);
    try {
      const r = await callApi("/cft-topology", {
        cft_type: ctType,
        central_charge: parseFloat(ctCentralCharge),
        primary_fields: parseInt(ctPrimaryFields),
      });
      setCtResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCt(false);
    }
  };

  // ── Atiyah-Segal ──
  const runAt = async () => {
    setLoadingAt(true);
    try {
      const r = await callApi("/atiyah-segal", {
        atiyah_type: atType,
        bordism_dimension: parseInt(atBordismDimension),
        functor_rank: parseInt(atFunctorRank),
      });
      setAtResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAt(false);
    }
  };

  // ── K-Theory ──
  const runKt = async () => {
    setLoadingKt(true);
    try {
      const r = await callApi("/k-theory-topological", {
        ktheory_type: ktType,
        chern_character: parseFloat(ktChernCharacter),
        twist_class: parseInt(ktTwistClass),
      });
      setKtResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingKt(false);
    }
  };

  // ──────────────────────── RENDER ────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Quantum Topological Field Theory Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Layer 75 (v1.323.0) — Bridges causal quantum gravity (L74) with quantum topological
          field theory: topological QFTs, Jones polynomials, BJT models, CFT topology,
          Atiyah-Segal axiomatics, and K-theory invariants.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Layer" value="75" desc="Quantum Topological FT" />
        <StatCard title="Enums" value="36" desc="6 x 6 values" />
        <StatCard title="Endpoints" value="7" desc="6 POST + 1 GET" />
        <StatCard title="Config Space" value="46,656" desc="6^6 combinations" />
      </div>

      {/* Physics Bridge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physics Bridge — L74 Causal Quantum Gravity → L75 Quantum Topological Field Theory</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <div>1. 自旋网络 → 拓扑QFT: Wilson环 W[γ] → Chern-Simons作用量 S_CS = (k/4π)∫Tr(A∧dA+⅔A³) → Witten不变量 Z(M) = Z_CS(M,k)</div>
          <div>2. LQG动力学 → Jones多项式: 环量算符 → 结不变量 V_L(t) = (-t)^{−3w(L)/4}⟨L⟩ → Khovanov同调 Kh(L) → Categorification</div>
          <div>3. 自旋泡沫 → BJT模型: EPRL/FK顶点 → Witten CS-WZW对应 Z_CS = Z_WZW[G_k] → BF理论 ∫B∧F → Polyakov模型 S_P = (1/2e²)∫Tr(F²)</div>
          <div>4. 圈量子宇宙 → CFT拓扑: 大反弹 ρ_c → 有理CFT Virasoro (c,h) → WZW模型 G_k → 顶点算子代数 VOA → 融合规则 N_ij^k</div>
          <div>5. 离散几何 → Atiyah-Segal: 三角化 → 配边范畴 Bord_n → 函子 Z: Bord_n → Vect → Baez-Dolan配边假说 → 扩展TQFT</div>
          <div>6. 黑洞熵 → K理论: 微观态 N(Δ) → 拓扑K理论 K(X) → Atiyah-Singer指标 idx(D) → T对偶 K(X)↔K^(X) → D-brane分类</div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="topqft">Topo QFT</TabsTrigger>
          <TabsTrigger value="jones">Jones Poly</TabsTrigger>
          <TabsTrigger value="bjt">BJT Model</TabsTrigger>
          <TabsTrigger value="cft">CFT Topo</TabsTrigger>
          <TabsTrigger value="atiyah">Atiyah</TabsTrigger>
          <TabsTrigger value="ktheory">K-Theory</TabsTrigger>
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
                    <div><span className="font-medium">Layer:</span> {overview.layer}</div>
                    <div><span className="font-medium">Version:</span> {overview.version}</div>
                    <div><span className="font-medium">Engine:</span> {overview.engine}</div>
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
                            <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>
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
                        <Badge variant={ep.method === "POST" ? "default" : "outline"}>{ep.method}</Badge>
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
                        <div key={k} className="text-xs"><span className="font-mono">{k}:</span> {v}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Topological QFT ── */}
        <TabsContent value="topqft">
          <Card>
            <CardHeader>
              <CardTitle>Topological QFT Computation</CardTitle>
              <CardDescription>
                Compute topological QFT invariants: Chern-Simons TQFT, Donaldson theory,
                Seiberg-Witten theory, Floer homology, Gromov-Witten theory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>TQFT Type</Label>
                  <Select value={ttType} onValueChange={setTtType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TOPOLOGICAL_QFT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coupling Level k</Label>
                  <Input type="number" value={ttCouplingLevel} onChange={(e) => setTtCouplingLevel(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Genus g</Label>
                  <Input type="number" value={ttGenusG} onChange={(e) => setTtGenusG(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runTt} disabled={loadingTt}>
                {loadingTt ? "Computing..." : "Compute TQFT Invariants"}
              </Button>
              {ttResult && <JsonBlock data={ttResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Jones Polynomial ── */}
        <TabsContent value="jones">
          <Card>
            <CardHeader>
              <CardTitle>Jones Polynomial Computation</CardTitle>
              <CardDescription>
                Compute knot invariants: Jones polynomial, HOMFLY polynomial, Kauffman bracket,
                Alexander polynomial, Khovanov homology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Polynomial Type</Label>
                  <Select value={jtType} onValueChange={setJtType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {JONES_POLYNOMIAL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Crossing Number</Label>
                  <Input type="number" value={jtCrossingNumber} onChange={(e) => setJtCrossingNumber(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Writhe</Label>
                  <Input type="number" value={jtWrithe} onChange={(e) => setJtWrithe(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runJt} disabled={loadingJt}>
                {loadingJt ? "Computing..." : "Compute Knot Polynomial"}
              </Button>
              {jtResult && <JsonBlock data={jtResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── BJT Model ── */}
        <TabsContent value="bjt">
          <Card>
            <CardHeader>
              <CardTitle>BJT Model Evaluation</CardTitle>
              <CardDescription>
                Evaluate BJT models: Witten CS-WZW, BF theory, Schwinger model,
                't Hooft model, Polyakov model
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Model Type</Label>
                  <Select value={bjType} onValueChange={setBjType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BJT_MODEL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Gauge Rank</Label>
                  <Input type="number" value={bjGaugeRank} onChange={(e) => setBjGaugeRank(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Moduli Dimension</Label>
                  <Input type="number" value={bjModuliDimension} onChange={(e) => setBjModuliDimension(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runBj} disabled={loadingBj}>
                {loadingBj ? "Computing..." : "Evaluate BJT Model"}
              </Button>
              {bjResult && <JsonBlock data={bjResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CFT Topology ── */}
        <TabsContent value="cft">
          <Card>
            <CardHeader>
              <CardTitle>CFT Topology Analysis</CardTitle>
              <CardDescription>
                Analyze CFT topology: rational CFT, logarithmic CFT, minimal models,
                WZW models, vertex operator algebras
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CFT Type</Label>
                  <Select value={ctType} onValueChange={setCtType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CFT_TOPOLOGY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Central Charge c</Label>
                  <Input type="number" value={ctCentralCharge} onChange={(e) => setCtCentralCharge(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Primary Fields</Label>
                  <Input type="number" value={ctPrimaryFields} onChange={(e) => setCtPrimaryFields(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runCt} disabled={loadingCt}>
                {loadingCt ? "Computing..." : "Analyze CFT Topology"}
              </Button>
              {ctResult && <JsonBlock data={ctResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Atiyah-Segal ── */}
        <TabsContent value="atiyah">
          <Card>
            <CardHeader>
              <CardTitle>Atiyah-Segal TQFT Construction</CardTitle>
              <CardDescription>
                Construct axiomatic TQFTs: bordism categories, cobordism hypothesis,
                extended TQFT, factorization homology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Construction Type</Label>
                  <Select value={atType} onValueChange={setAtType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ATIYAH_SEGAL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bordism Dimension</Label>
                  <Input type="number" value={atBordismDimension} onChange={(e) => setAtBordismDimension(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Functor Rank</Label>
                  <Input type="number" value={atFunctorRank} onChange={(e) => setAtFunctorRank(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runAt} disabled={loadingAt}>
                {loadingAt ? "Computing..." : "Construct Atiyah-Segal TQFT"}
              </Button>
              {atResult && <JsonBlock data={atResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── K-Theory ── */}
        <TabsContent value="ktheory">
          <Card>
            <CardHeader>
              <CardTitle>K-Theory Topological Invariants</CardTitle>
              <CardDescription>
                Compute K-theory invariants: topological K-theory, K-homology,
                twisted K-theory, index theory, T-duality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>K-Theory Type</Label>
                  <Select value={ktType} onValueChange={setKtType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {K_THEORY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Chern Character</Label>
                  <Input type="number" value={ktChernCharacter} onChange={(e) => setKtChernCharacter(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Twist Class</Label>
                  <Input type="number" value={ktTwistClass} onChange={(e) => setKtTwistClass(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runKt} disabled={loadingKt}>
                {loadingKt ? "Computing..." : "Compute K-Theory Invariants"}
              </Button>
              {ktResult && <JsonBlock data={ktResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
