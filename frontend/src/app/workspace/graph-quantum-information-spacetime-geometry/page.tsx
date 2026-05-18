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
const LATTICE_ACTION_TYPES = [
  { value: "wilson_action", label: "Wilson作用量" },
  { value: "clover_action", label: "Clover作用量" },
  { value: "domain_wall_action", label: "域壁作用量" },
  { value: "staggered_action", label: "交错作用量" },
  { value: "improved_staggered", label: "改进交错" },
  { value: "ai_lattice_action", label: "AI格点作用量" },
];

const GLUON_PROPAGATOR_TYPES = [
  { value: "landau_gauge_propagator", label: "Landau规范传播子" },
  { value: "coulomb_gauge_propagator", label: "Coulomb规范传播子" },
  { value: "temporal_propagator", label: "时间传播子" },
  { value: "ghost_propagator", label: "鬼场传播子" },
  { value: "running_coupling", label: "跑动耦合" },
  { value: "ai_gluon_propagator", label: "AI胶子传播子" },
];

const QUARK_LATTICE_TYPES = [
  { value: "wilson_quark", label: "Wilson夸克" },
  { value: "clover_quark", label: "Clover夸克" },
  { value: "overlap_quark", label: "Overlap夸克" },
  { value: "domain_wall_quark", label: "域壁夸克" },
  { value: "staggered_quark", label: "交错夸克" },
  { value: "ai_quark_lattice", label: "AI格点夸克" },
];

const CONFINEMENT_TYPES = [
  { value: "wilson_loop_confinement", label: "Wilson环禁闭" },
  { value: "string_tension", label: "弦张力" },
  { value: "flux_tube", label: "通量管" },
  { value: "area_law", label: "面积律" },
  { value: "linear_potential", label: "线性势" },
  { value: "ai_confinement", label: "AI禁闭" },
];

const FERMION_LATTICE_TYPES = [
  { value: "naive_fermion", label: "朴素费米子" },
  { value: "wilson_fermion", label: "Wilson费米子" },
  { value: "staggered_fermion", label: "交错费米子" },
  { value: "overlap_fermion", label: "Overlap费米子" },
  { value: "twisted_mass_fermion", label: "扭转质量费米子" },
  { value: "ai_fermion_lattice", label: "AI格点费米子" },
];

const HADRON_SPECTRUM_TYPES = [
  { value: "meson_spectrum", label: "介子谱" },
  { value: "baryon_spectrum", label: "重子谱" },
  { value: "glueball_spectrum", label: "胶球谱" },
  { value: "exotic_hadron", label: "奇特强子" },
  { value: "hybrid_state", label: "混杂态" },
  { value: "ai_hadron_spectrum", label: "AI强子谱" },
];

// API base
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001/graph/quantum-information-spacetime-geometry";

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
export default function QuantumInfoSpacetimeGeometryPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // ── Overview state ──
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOv, setLoadingOv] = useState(false);

  // ── Lattice Action state ──
  const [laType, setLaType] = useState(LATTICE_ACTION_TYPES[0].value);
  const [laBetaCoupling, setLaBetaCoupling] = useState("6.0");
  const [laLatticeSize, setLaLatticeSize] = useState("32");
  const [laResult, setLaResult] = useState<unknown>(null);
  const [loadingLa, setLoadingLa] = useState(false);

  // ── Gluon Propagator state ──
  const [glType, setGlType] = useState(GLUON_PROPAGATOR_TYPES[0].value);
  const [glMomentumGev, setGlMomentumGev] = useState("1.0");
  const [glGaugeAlpha, setGlGaugeAlpha] = useState("0.0");
  const [glResult, setGlResult] = useState<unknown>(null);
  const [loadingGl, setLoadingGl] = useState(false);

  // ── Quark Lattice state ──
  const [qlType, setQlType] = useState(QUARK_LATTICE_TYPES[0].value);
  const [qlQuarkMass, setQlQuarkMass] = useState("0.01");
  const [qlHoppingKappa, setQlHoppingKappa] = useState("0.135");
  const [qlResult, setQlResult] = useState<unknown>(null);
  const [loadingQl, setLoadingQl] = useState(false);

  // ── Confinement state ──
  const [clType, setClType] = useState(CONFINEMENT_TYPES[0].value);
  const [clWilsonLoopSize, setClWilsonLoopSize] = useState("8");
  const [clTemperatureMev, setClTemperatureMev] = useState("150");
  const [clResult, setClResult] = useState<unknown>(null);
  const [loadingCl, setLoadingCl] = useState(false);

  // ── Fermion Lattice state ──
  const [flType, setFlType] = useState(FERMION_LATTICE_TYPES[0].value);
  const [flBareMass, setFlBareMass] = useState("0.01");
  const [flLatticeSpacing, setFlLatticeSpacing] = useState("0.1");
  const [flResult, setFlResult] = useState<unknown>(null);
  const [loadingFl, setLoadingFl] = useState(false);

  // ── Hadron Spectrum state ──
  const [hlType, setHlType] = useState(HADRON_SPECTRUM_TYPES[0].value);
  const [hlPionMass, setHlPionMass] = useState("0.14");
  const [hlLatticeVolume, setHlLatticeVolume] = useState("64");
  const [hlResult, setHlResult] = useState<unknown>(null);
  const [loadingHl, setLoadingHl] = useState(false);

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

  // ── Lattice Action ──
  const runLa = async () => {
    setLoadingLa(true);
    try {
      const r = await callApi("/lattice-action", {
        action_type: laType,
        beta_coupling: parseFloat(laBetaCoupling),
        lattice_size: parseInt(laLatticeSize),
      });
      setLaResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLa(false);
    }
  };

  // ── Gluon Propagator ──
  const runGl = async () => {
    setLoadingGl(true);
    try {
      const r = await callApi("/gluon-propagator", {
        propagator_type: glType,
        momentum_gev: parseFloat(glMomentumGev),
        gauge_alpha: parseFloat(glGaugeAlpha),
      });
      setGlResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGl(false);
    }
  };

  // ── Quark Lattice ──
  const runQl = async () => {
    setLoadingQl(true);
    try {
      const r = await callApi("/quark-lattice", {
        quark_type: qlType,
        quark_mass_gev: parseFloat(qlQuarkMass),
        hopping_kappa: parseFloat(qlHoppingKappa),
      });
      setQlResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQl(false);
    }
  };

  // ── Confinement ──
  const runCl = async () => {
    setLoadingCl(true);
    try {
      const r = await callApi("/confinement-lattice", {
        confinement_type: clType,
        wilson_loop_size: parseInt(clWilsonLoopSize),
        temperature_mev: parseFloat(clTemperatureMev),
      });
      setClResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCl(false);
    }
  };

  // ── Fermion Lattice ──
  const runFl = async () => {
    setLoadingFl(true);
    try {
      const r = await callApi("/fermion-lattice", {
        fermion_type: flType,
        bare_mass: parseFloat(flBareMass),
        lattice_spacing_fm: parseFloat(flLatticeSpacing),
      });
      setFlResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFl(false);
    }
  };

  // ── Hadron Spectrum ──
  const runHl = async () => {
    setLoadingHl(true);
    try {
      const r = await callApi("/hadron-spectrum", {
        spectrum_type: hlType,
        pion_mass_gev: parseFloat(hlPionMass),
        lattice_volume: parseInt(hlLatticeVolume),
      });
      setHlResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHl(false);
    }
  };

  // ──────────────────────── RENDER ────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Quantum Information Spacetime Geometry Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Layer 78 (v1.326.0) — Bridges quantum topological field theory (L75) with lattice QCD:
          gauge actions, gluon propagators, quark formulations, confinement mechanisms,
          fermion lattice types, and hadron spectroscopy.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Layer" value="76" desc="QCD Lattice" />
        <StatCard title="Enums" value="36" desc="6 x 6 values" />
        <StatCard title="Endpoints" value="7" desc="6 POST + 1 GET" />
        <StatCard title="Config Space" value="46,656" desc="6^6 combinations" />
      </div>

      {/* Physics Bridge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physics Bridge — L75 Quantum Topological FT → L76 QCD Lattice</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <div>1. Chern-Simons → 格点作用量: S_CS = (k/4π)∫Tr(A∧dA+⅔A³) → Wilson格点作用量 S_W = βΣ(1-1/N·ReTr U_plaq) → β=6/g² → 改进作用量</div>
          <div>2. Jones多项式 → 胶子传播子: 结不变量 V_L(t) → Landau规范 D_μν(q) = (δ_μν-q_μq_ν/q²)Z(q²)/q² → 跑动耦合 α_s(q²) → 渐近自由</div>
          <div>3. BJT模型 → 格点夸克: Witten CS-WZW → Wilson夸克 D_W = m+Σ_μ(γ_μ∇_μ) → Clover改进 → Overlap算子 D_ov = ½(1+γ₅·sign(H_W)) → Ginsparg-Wilson关系</div>
          <div>4. CFT拓扑 → 禁闭机制: 有理CFT → Wilson环 ⟨W(C)⟩ = exp(-σA(C)) → 弦张力 σ = (4π²/12)·α_s → 面积律 → 线性势 V(r) = σr</div>
          <div>5. Atiyah-Segal配边 → 格点费米子: 配边范畴 Bord_n → Nielsen-Ninomiya定理 → 手征对称性 → 域壁费米子 → 扭转质量 m_q → 手征极限</div>
          <div>6. K理论 → 强子谱: K⁰分类 → SU(3)色 → 介子(M=q̄q)/重子(B=qqq)/胶球(G=gg) → 格点计算 m_H = lim(a→0) m_H(a) → 连续极限外推</div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lattice">Lattice Act</TabsTrigger>
          <TabsTrigger value="gluon">Gluon Prop</TabsTrigger>
          <TabsTrigger value="quark">Quark Lat</TabsTrigger>
          <TabsTrigger value="confine">Confinement</TabsTrigger>
          <TabsTrigger value="fermion">Fermion Lat</TabsTrigger>
          <TabsTrigger value="hadron">Hadron Spec</TabsTrigger>
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

        {/* ── Lattice Action ── */}
        <TabsContent value="lattice">
          <Card>
            <CardHeader>
              <CardTitle>Lattice Gauge Action</CardTitle>
              <CardDescription>
                Compute lattice gauge actions: Wilson, Clover, Domain Wall,
                Staggered, improved Staggered actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Action Type</Label>
                  <Select value={laType} onValueChange={setLaType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LATTICE_ACTION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>β Coupling (6/g²)</Label>
                  <Input type="number" value={laBetaCoupling} onChange={(e) => setLaBetaCoupling(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Lattice Size L</Label>
                  <Input type="number" value={laLatticeSize} onChange={(e) => setLaLatticeSize(e.target.value)} step="4" />
                </div>
              </div>
              <Button onClick={runLa} disabled={loadingLa}>
                {loadingLa ? "Computing..." : "Compute Lattice Action"}
              </Button>
              {laResult && <JsonBlock data={laResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Gluon Propagator ── */}
        <TabsContent value="gluon">
          <Card>
            <CardHeader>
              <CardTitle>Gluon Propagator</CardTitle>
              <CardDescription>
                Evaluate gluon propagators: Landau/Coulomb gauge, temporal,
                ghost propagators, running coupling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Propagator Type</Label>
                  <Select value={glType} onValueChange={setGlType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GLUON_PROPAGATOR_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Momentum (GeV)</Label>
                  <Input type="number" value={glMomentumGev} onChange={(e) => setGlMomentumGev(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Gauge α</Label>
                  <Input type="number" value={glGaugeAlpha} onChange={(e) => setGlGaugeAlpha(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runGl} disabled={loadingGl}>
                {loadingGl ? "Computing..." : "Evaluate Gluon Propagator"}
              </Button>
              {glResult && <JsonBlock data={glResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Quark Lattice ── */}
        <TabsContent value="quark">
          <Card>
            <CardHeader>
              <CardTitle>Quark Lattice Formulation</CardTitle>
              <CardDescription>
                Construct quark lattice actions: Wilson, Clover, Overlap,
                Domain Wall, Staggered quarks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quark Type</Label>
                  <Select value={qlType} onValueChange={setQlType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QUARK_LATTICE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quark Mass (GeV)</Label>
                  <Input type="number" value={qlQuarkMass} onChange={(e) => setQlQuarkMass(e.target.value)} step="0.001" />
                </div>
                <div>
                  <Label>Hopping Parameter κ</Label>
                  <Input type="number" value={qlHoppingKappa} onChange={(e) => setQlHoppingKappa(e.target.value)} step="0.001" />
                </div>
              </div>
              <Button onClick={runQl} disabled={loadingQl}>
                {loadingQl ? "Computing..." : "Construct Quark Action"}
              </Button>
              {qlResult && <JsonBlock data={qlResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Confinement ── */}
        <TabsContent value="confine">
          <Card>
            <CardHeader>
              <CardTitle>Confinement Mechanism</CardTitle>
              <CardDescription>
                Compute string tension and confinement: Wilson loops, flux tubes,
                area law, linear potential, deconfinement transition
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Confinement Type</Label>
                  <Select value={clType} onValueChange={setClType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONFINEMENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Wilson Loop Size R</Label>
                  <Input type="number" value={clWilsonLoopSize} onChange={(e) => setClWilsonLoopSize(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Temperature (MeV)</Label>
                  <Input type="number" value={clTemperatureMev} onChange={(e) => setClTemperatureMev(e.target.value)} step="10" />
                </div>
              </div>
              <Button onClick={runCl} disabled={loadingCl}>
                {loadingCl ? "Computing..." : "Compute Confinement"}
              </Button>
              {clResult && <JsonBlock data={clResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Fermion Lattice ── */}
        <TabsContent value="fermion">
          <Card>
            <CardHeader>
              <CardTitle>Fermion Lattice Analysis</CardTitle>
              <CardDescription>
                Analyze fermion lattice types: naive, Wilson, staggered, overlap,
                twisted mass fermions and Dirac operators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fermion Type</Label>
                  <Select value={flType} onValueChange={setFlType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FERMION_LATTICE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Bare Mass</Label>
                  <Input type="number" value={flBareMass} onChange={(e) => setFlBareMass(e.target.value)} step="0.001" />
                </div>
                <div>
                  <Label>Lattice Spacing (fm)</Label>
                  <Input type="number" value={flLatticeSpacing} onChange={(e) => setFlLatticeSpacing(e.target.value)} step="0.01" />
                </div>
              </div>
              <Button onClick={runFl} disabled={loadingFl}>
                {loadingFl ? "Computing..." : "Analyze Fermion Lattice"}
              </Button>
              {flResult && <JsonBlock data={flResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Hadron Spectrum ── */}
        <TabsContent value="hadron">
          <Card>
            <CardHeader>
              <CardTitle>Hadron Mass Spectrum</CardTitle>
              <CardDescription>
                Compute hadron mass spectrum: mesons, baryons, glueballs,
                exotic hadrons, hybrid states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Spectrum Type</Label>
                  <Select value={hlType} onValueChange={setHlType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HADRON_SPECTRUM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Pion Mass (GeV)</Label>
                  <Input type="number" value={hlPionMass} onChange={(e) => setHlPionMass(e.target.value)} step="0.01" />
                </div>
                <div>
                  <Label>Lattice Volume L³</Label>
                  <Input type="number" value={hlLatticeVolume} onChange={(e) => setHlLatticeVolume(e.target.value)} step="8" />
                </div>
              </div>
              <Button onClick={runHl} disabled={loadingHl}>
                {loadingHl ? "Computing..." : "Compute Hadron Spectrum"}
              </Button>
              {hlResult && <JsonBlock data={hlResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
