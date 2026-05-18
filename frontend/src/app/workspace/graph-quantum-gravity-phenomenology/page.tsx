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
const GRAVITY_EFFECT_TYPES = [
  { value: "planck_scale_effect", label: "Planck尺度效应" },
  { value: "lqg_spin_foam", label: "LQG自旋泡沫" },
  { value: "stringy_correction", label: "弦论修正" },
  { value: "causal_dynamical_triangulation", label: "因果动力学三角化 CDT" },
  { value: "asymptotic_safety", label: "渐近安全" },
  { value: "ai_quantum_gravity", label: "AI量子引力" },
];

const DISCRETIZATION_TYPES = [
  { value: "causal_set", label: "因果集 Causal Set" },
  { value: "spin_network", label: "自旋网络 Spin Net" },
  { value: "simplicial_complex", label: "单纯复形 Simplicial" },
  { value: "causal_diamond", label: "因果钻石 Diamond" },
  { value: "holographic_screen", label: "全息屏 Holo Screen" },
  { value: "ai_discrete_spacetime", label: "AI离散时空" },
];

const HOLOGRAPHIC_TYPES = [
  { value: "bekenstein_bound", label: "Bekenstein界" },
  { value: "covariant_entropy_bound", label: "协变熵界" },
  { value: "holographic_principle", label: "全息原理" },
  { value: "ads_cft_dictionary", label: "AdS/CFT字典" },
  { value: "ryu_takayanagi", label: "Ryu-Takayanagi" },
  { value: "ai_holographic_bound", label: "AI全息界" },
];

const CAUSALITY_TYPES = [
  { value: "indefinite_causal_order", label: "不确定因果序 ICO" },
  { value: "quantum_switch", label: "量子开关 Switch" },
  { value: "process_matrix", label: "过程矩阵 W" },
  { value: "supermap", label: "超映射 Supermap" },
  { value: "causal_inequality", label: "因果不等式" },
  { value: "ai_quantum_causality", label: "AI量子因果" },
];

const ENTANGLEMENT_TYPES = [
  { value: "bmv_experiment", label: "BMV实验" },
  { value: "tesla_entanglement", label: "桌面纠缠见证" },
  { value: "gravity_induced_correlation", label: "引力诱导关联" },
  { value: "matter_gravity_coupling", label: "物质-引力耦合" },
  { value: "time_dilation_entanglement", label: "时间膨胀纠缠" },
  { value: "ai_gravitational_entanglement", label: "AI引力纠缠" },
];

const FOAM_TYPES = [
  { value: "wheeler_foam", label: "Wheeler泡沫" },
  { value: "planck_scale_fluctuation", label: "Planck尺度涨落" },
  { value: "quantum_geometry_ripple", label: "量子几何涟漪" },
  { value: "spacetime_uncertainty", label: "时空不确定性" },
  { value: "minimal_length", label: "最小长度 GUP" },
  { value: "ai_spacetime_foam", label: "AI时空泡沫" },
];

// API base
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001/graph/quantum-gravity-phenomenology";

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
export default function QuantumGravityPhenomenologyPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // ── Overview state ──
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOv, setLoadingOv] = useState(false);

  // ── Quantum Gravity Effect state ──
  const [qgeType, setQgeType] = useState(GRAVITY_EFFECT_TYPES[0].value);
  const [qgeEnergy, setQgeEnergy] = useState("1.0");
  const [qgeCoupling, setQgeCoupling] = useState("0.1");
  const [qgeLoop, setQgeLoop] = useState("0.0");
  const [qgeResult, setQgeResult] = useState<unknown>(null);
  const [loadingQge, setLoadingQge] = useState(false);

  // ── Spacetime Discretization state ──
  const [sdType, setSdType] = useState(DISCRETIZATION_TYPES[0].value);
  const [sdLength, setSdLength] = useState("1.616e-35");
  const [sdTopology, setSdTopology] = useState("trivial");
  const [sdDimension, setSdDimension] = useState("4");
  const [sdResult, setSdResult] = useState<unknown>(null);
  const [loadingSd, setLoadingSd] = useState(false);

  // ── Holographic Bound state ──
  const [hbType, setHbType] = useState(HOLOGRAPHIC_TYPES[0].value);
  const [hbArea, setHbArea] = useState("1.0");
  const [hbVolume, setHbVolume] = useState("1.0");
  const [hbEntropy, setHbEntropy] = useState("0.0");
  const [hbResult, setHbResult] = useState<unknown>(null);
  const [loadingHb, setLoadingHb] = useState(false);

  // ── Quantum Causality state ──
  const [qcType, setQcType] = useState(CAUSALITY_TYPES[0].value);
  const [qcDim, setQcDim] = useState("2");
  const [qcCoherence, setQcCoherence] = useState("1.0");
  const [qcWitness, setQcWitness] = useState("0.0");
  const [qcResult, setQcResult] = useState<unknown>(null);
  const [loadingQc, setLoadingQc] = useState(false);

  // ── Gravitational Entanglement state ──
  const [geType, setGeType] = useState(ENTANGLEMENT_TYPES[0].value);
  const [geMass, setGeMass] = useState("1.0");
  const [geSeparation, setGeSeparation] = useState("1.0");
  const [geEntropy, setGeEntropy] = useState("0.0");
  const [geResult, setGeResult] = useState<unknown>(null);
  const [loadingGe, setLoadingGe] = useState(false);

  // ── Spacetime Foam state ──
  const [sfType, setSfType] = useState(FOAM_TYPES[0].value);
  const [sfPlanck, setSfPlanck] = useState("1.616e-35");
  const [sfAmplitude, setSfAmplitude] = useState("1.0");
  const [sfTopologyChange, setSfTopologyChange] = useState(false);
  const [sfResult, setSfResult] = useState<unknown>(null);
  const [loadingSf, setLoadingSf] = useState(false);

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

  // ── Quantum Gravity Effect ──
  const runQge = async () => {
    setLoadingQge(true);
    try {
      const r = await callApi("/quantum-gravity-effect", {
        effect_type: qgeType,
        planck_energy: parseFloat(qgeEnergy),
        coupling_constant: parseFloat(qgeCoupling),
        loop_correction: parseFloat(qgeLoop),
      });
      setQgeResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQge(false);
    }
  };

  // ── Spacetime Discretization ──
  const runSd = async () => {
    setLoadingSd(true);
    try {
      const r = await callApi("/spacetime-discretization", {
        discretization_type: sdType,
        fundamental_length: parseFloat(sdLength),
        topology: sdTopology,
        dimension: parseInt(sdDimension),
      });
      setSdResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSd(false);
    }
  };

  // ── Holographic Bound ──
  const runHb = async () => {
    setLoadingHb(true);
    try {
      const r = await callApi("/holographic-bound", {
        bound_type: hbType,
        boundary_area: parseFloat(hbArea),
        bulk_volume: parseFloat(hbVolume),
        entropy_content: parseFloat(hbEntropy),
      });
      setHbResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHb(false);
    }
  };

  // ── Quantum Causality ──
  const runQc = async () => {
    setLoadingQc(true);
    try {
      const r = await callApi("/quantum-causality", {
        causality_type: qcType,
        process_dimension: parseInt(qcDim),
        coherence_factor: parseFloat(qcCoherence),
        causal_witness: parseFloat(qcWitness),
      });
      setQcResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQc(false);
    }
  };

  // ── Gravitational Entanglement ──
  const runGe = async () => {
    setLoadingGe(true);
    try {
      const r = await callApi("/gravitational-entanglement", {
        entanglement_type: geType,
        mass_parameter: parseFloat(geMass),
        separation: parseFloat(geSeparation),
        entanglement_entropy: parseFloat(geEntropy),
      });
      setGeResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGe(false);
    }
  };

  // ── Spacetime Foam ──
  const runSf = async () => {
    setLoadingSf(true);
    try {
      const r = await callApi("/spacetime-foam", {
        foam_type: sfType,
        planck_length: parseFloat(sfPlanck),
        fluctuation_amplitude: parseFloat(sfAmplitude),
        topology_change: sfTopologyChange,
      });
      setSfResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSf(false);
    }
  };

  // ──────────────────────── RENDER ────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Quantum Gravity Phenomenology Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Layer 70 (v1.318.0) — Bridges quantum metrology with quantum gravity phenomenology:
          Planck-scale effects, spacetime discretization, holographic bounds, indefinite causal
          order, gravitational entanglement (BMV), Wheeler spacetime foam.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Layer" value="70" desc="Quantum Gravity Phenomenology" />
        <StatCard title="Enums" value="36" desc="6 × 6 values" />
        <StatCard title="Endpoints" value="7" desc="6 POST + 1 GET" />
        <StatCard title="Config Space" value="46,656" desc="6⁶ combinations" />
      </div>

      {/* Physics Bridge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physics Bridge — L69 Quantum Metrology → L70 Quantum Gravity Phenomenology</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <div>1. 量子测量极限 → Planck尺度量子引力效应: Born规则 p(i) = ⟨ψ|Pᵢ|ψ⟩ → Planck能量 E_P = √(ℏc⁵/G) ≈ 1.22×10¹⁹ GeV</div>
          <div>2. Fisher信息精度界 → 时空最小离散化: QFI H(ρ_θ) = Tr(ρL_s²) → 因果集/自旋网络/单纯复形离散化</div>
          <div>3. Bekenstein-Hawking熵 → 全息熵界: S = A/(4G_Nℏ) → Bekenstein界 S ≤ 2πkRE/(ℏc) → Ryu-Takayanagi公式</div>
          <div>4. Heisenberg测量极限 → 不确定因果序: δθ ~ 1/N → 量子开关 |A⟩|B⟩ + |B⟩|A⟩ → 过程矩阵 W</div>
          <div>5. 量子传感精度 → BMV引力诱导纠缠: Wineland压缩 ξ² &lt; 1 → Bose-Marletto-Vedral协议 → 引力中介纠缠</div>
          <div>6. LIGO/LISA应变检测 → Wheeler时空泡沫: h = ΔL/L ~ 10⁻²³ → Δx·Δt ≥ l_P·t_P → 量子拓扑涨落</div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qge">QG Effect</TabsTrigger>
          <TabsTrigger value="sd">Discretize</TabsTrigger>
          <TabsTrigger value="hb">Holo Bound</TabsTrigger>
          <TabsTrigger value="qc">Causality</TabsTrigger>
          <TabsTrigger value="ge">Entangle</TabsTrigger>
          <TabsTrigger value="sf">Foam</TabsTrigger>
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
                {loadingOv ? "Loading…" : "Fetch Overview"}
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

        {/* ── Quantum Gravity Effect ── */}
        <TabsContent value="qge">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Gravity Effect</CardTitle>
              <CardDescription>
                Compute phenomenological effects at the Planck scale: loop quantum gravity spin foams,
                string theory α&apos; corrections, causal dynamical triangulation, asymptotic safety
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Effect Type</Label>
                  <Select value={qgeType} onValueChange={setQgeType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GRAVITY_EFFECT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Planck Energy (E_P units)</Label>
                  <Input type="number" value={qgeEnergy} onChange={(e) => setQgeEnergy(e.target.value)} />
                </div>
                <div>
                  <Label>Coupling Constant</Label>
                  <Input type="number" value={qgeCoupling} onChange={(e) => setQgeCoupling(e.target.value)} step="0.01" />
                </div>
                <div>
                  <Label>Loop Correction Order</Label>
                  <Input type="number" value={qgeLoop} onChange={(e) => setQgeLoop(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runQge} disabled={loadingQge}>
                {loadingQge ? "Computing…" : "Compute Quantum Gravity Effect"}
              </Button>
              {qgeResult && <JsonBlock data={qgeResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Spacetime Discretization ── */}
        <TabsContent value="sd">
          <Card>
            <CardHeader>
              <CardTitle>Spacetime Discretization</CardTitle>
              <CardDescription>
                Analyze discrete spacetime structures: causal sets, spin networks, simplicial complexes,
                causal diamonds, holographic screens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discretization Type</Label>
                  <Select value={sdType} onValueChange={setSdType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DISCRETIZATION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fundamental Length (m)</Label>
                  <Input type="text" value={sdLength} onChange={(e) => setSdLength(e.target.value)} />
                </div>
                <div>
                  <Label>Topology</Label>
                  <Input type="text" value={sdTopology} onChange={(e) => setSdTopology(e.target.value)} />
                </div>
                <div>
                  <Label>Dimension</Label>
                  <Input type="number" value={sdDimension} onChange={(e) => setSdDimension(e.target.value)} min="2" max="11" />
                </div>
              </div>
              <Button onClick={runSd} disabled={loadingSd}>
                {loadingSd ? "Computing…" : "Analyze Discretization"}
              </Button>
              {sdResult && <JsonBlock data={sdResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Holographic Bound ── */}
        <TabsContent value="hb">
          <Card>
            <CardHeader>
              <CardTitle>Holographic Bound</CardTitle>
              <CardDescription>
                Evaluate entropy bounds and bulk-boundary correspondences: Bekenstein bound,
                covariant entropy bound, AdS/CFT dictionary, Ryu-Takayanagi formula
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bound Type</Label>
                  <Select value={hbType} onValueChange={setHbType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HOLOGRAPHIC_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Boundary Area</Label>
                  <Input type="number" value={hbArea} onChange={(e) => setHbArea(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Bulk Volume</Label>
                  <Input type="number" value={hbVolume} onChange={(e) => setHbVolume(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Entropy Content</Label>
                  <Input type="number" value={hbEntropy} onChange={(e) => setHbEntropy(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runHb} disabled={loadingHb}>
                {loadingHb ? "Computing…" : "Evaluate Holographic Bound"}
              </Button>
              {hbResult && <JsonBlock data={hbResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Quantum Causality ── */}
        <TabsContent value="qc">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Causality</CardTitle>
              <CardDescription>
                Process quantum causal structures: indefinite causal order, quantum switch,
                process matrix formalism, supermaps, causal inequality violations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Causality Type</Label>
                  <Select value={qcType} onValueChange={setQcType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CAUSALITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Process Dimension</Label>
                  <Input type="number" value={qcDim} onChange={(e) => setQcDim(e.target.value)} min="2" max="16" />
                </div>
                <div>
                  <Label>Coherence Factor</Label>
                  <Input type="number" value={qcCoherence} onChange={(e) => setQcCoherence(e.target.value)} step="0.1" min="0" max="1" />
                </div>
                <div>
                  <Label>Causal Witness</Label>
                  <Input type="number" value={qcWitness} onChange={(e) => setQcWitness(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runQc} disabled={loadingQc}>
                {loadingQc ? "Computing…" : "Process Causal Structure"}
              </Button>
              {qcResult && <JsonBlock data={qcResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Gravitational Entanglement ── */}
        <TabsContent value="ge">
          <Card>
            <CardHeader>
              <CardTitle>Gravitational Entanglement</CardTitle>
              <CardDescription>
                Compute gravity-induced entanglement: BMV experiment (Bose-Marletto-Vedral),
                tabletop entanglement witnesses, Newtonian gravity coupling, time dilation effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Entanglement Type</Label>
                  <Select value={geType} onValueChange={setGeType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ENTANGLEMENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mass Parameter</Label>
                  <Input type="number" value={geMass} onChange={(e) => setGeMass(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Separation</Label>
                  <Input type="number" value={geSeparation} onChange={(e) => setGeSeparation(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Entanglement Entropy</Label>
                  <Input type="number" value={geEntropy} onChange={(e) => setGeEntropy(e.target.value)} step="0.01" />
                </div>
              </div>
              <Button onClick={runGe} disabled={loadingGe}>
                {loadingGe ? "Computing…" : "Compute Gravitational Entanglement"}
              </Button>
              {geResult && <JsonBlock data={geResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Spacetime Foam ── */}
        <TabsContent value="sf">
          <Card>
            <CardHeader>
              <CardTitle>Spacetime Foam</CardTitle>
              <CardDescription>
                Analyze Wheeler spacetime foam fluctuations: Planck-scale topology changes,
                quantum geometry ripples, generalized uncertainty principle, minimal length effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Foam Type</Label>
                  <Select value={sfType} onValueChange={setSfType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FOAM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Planck Length (m)</Label>
                  <Input type="text" value={sfPlanck} onChange={(e) => setSfPlanck(e.target.value)} />
                </div>
                <div>
                  <Label>Fluctuation Amplitude</Label>
                  <Input type="number" value={sfAmplitude} onChange={(e) => setSfAmplitude(e.target.value)} step="0.1" />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sfTopologyChange}
                    onChange={(e) => setSfTopologyChange(e.target.checked)}
                    className="rounded border"
                  />
                  <Label>Topology Change</Label>
                </div>
              </div>
              <Button onClick={runSf} disabled={loadingSf}>
                {loadingSf ? "Computing…" : "Analyze Spacetime Foam"}
              </Button>
              {sfResult && <JsonBlock data={sfResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
