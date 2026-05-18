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
const SPIN_NETWORK_TYPES = [
  { value: "wilson_loop", label: "Wilson环" },
  { value: "spin_network_state", label: "自旋网络态" },
  { value: "area_operator", label: "面积算符" },
  { value: "volume_operator", label: "体积算符" },
  { value: "penrose_spin_network", label: "Penrose自旋网络" },
  { value: "ai_spin_network", label: "AI自旋网络" },
];

const LQG_TYPES = [
  { value: "ashtekar_variables", label: "Ashtekar变量" },
  { value: "immirzi_parameter", label: "Immirzi参数" },
  { value: "holonomy_operator", label: "环量算符" },
  { value: "flux_operator", label: "通量算符" },
  { value: "discretized_geometry", label: "离散几何" },
  { value: "ai_loop_quantum_gravity", label: "AI圈量子引力" },
];

const SPIN_FOAM_TYPES = [
  { value: "barrett_crane_model", label: "Barrett-Crane模型" },
  { value: "engle_pereira_rovelli", label: "EPRL模型" },
  { value: "fk_model", label: "FK模型" },
  { value: "eprl_fk_vertex", label: "EPRL-FK顶点" },
  { value: "spin_foam_amplitude", label: "自旋泡沫振幅" },
  { value: "ai_spin_foam", label: "AI自旋泡沫" },
];

const LQC_TYPES = [
  { value: "big_bounce_scenario", label: "大反弹" },
  { value: "quantum_friedmann", label: "量子Friedmann" },
  { value: "effective_dynamics", label: "有效动力学" },
  { value: "polymer_quantization", label: "多聚量子化" },
  { value: "bianchi_model", label: "Bianchi模型" },
  { value: "ai_loop_cosmology", label: "AI圈量子宇宙" },
];

const DISCRETE_GEOMETRY_TYPES = [
  { value: "triangulation_3d", label: "3D三角化" },
  { value: "quantum_tetrahedron", label: "量子四面体" },
  { value: "coherent_state_geometry", label: "相干态几何" },
  { value: "semi_classical_limit", label: "半经典极限" },
  { value: "regge_calculus", label: "Regge微积" },
  { value: "ai_discrete_geometry", label: "AI离散几何" },
];

const QUANTUM_BH_TYPES = [
  { value: "microstate_counting", label: "微观态计数" },
  { value: "area_spectrum", label: "面积谱" },
  { value: "isolated_horizon", label: "孤立视界" },
  { value: "quantum_isolated_horizon", label: "量子孤立视界" },
  { value: "entanglement_entropy", label: "纠缠熵" },
  { value: "ai_quantum_bh_entropy", label: "AI量子黑洞熵" },
];

// API base
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001/graph/causal-quantum-gravity";

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
export default function CausalQuantumGravityPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // ── Overview state ──
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOv, setLoadingOv] = useState(false);

  // ── Spin Network state ──
  const [snType, setSnType] = useState(SPIN_NETWORK_TYPES[0].value);
  const [snSpinJMax, setSnSpinJMax] = useState("5");
  const [snNetworkNodes, setSnNetworkNodes] = useState("100");
  const [snResult, setSnResult] = useState<unknown>(null);
  const [loadingSn, setLoadingSn] = useState(false);

  // ── LQG state ──
  const [lqgType, setLqgType] = useState(LQG_TYPES[0].value);
  const [lqgImmirziGamma, setLqgImmirziGamma] = useState("0.274");
  const [lqgGraphEdges, setLqgGraphEdges] = useState("50");
  const [lqgResult, setLqgResult] = useState<unknown>(null);
  const [loadingLqg, setLoadingLqg] = useState(false);

  // ── Spin Foam state ──
  const [sfType, setSfType] = useState(SPIN_FOAM_TYPES[0].value);
  const [sfBoundarySpins, setSfBoundarySpins] = useState("10");
  const [sfVertexAmplitude, setSfVertexAmplitude] = useState("1.0");
  const [sfResult, setSfResult] = useState<unknown>(null);
  const [loadingSf, setLoadingSf] = useState(false);

  // ── LQC state ──
  const [lqcType, setLqcType] = useState(LQC_TYPES[0].value);
  const [lqcCriticalDensity, setLqcCriticalDensity] = useState("0.41");
  const [lqcScaleFactor, setLqcScaleFactor] = useState("1.0");
  const [lqcResult, setLqcResult] = useState<unknown>(null);
  const [loadingLqc, setLoadingLqc] = useState(false);

  // ── Discrete Geometry state ──
  const [dgType, setDgType] = useState(DISCRETE_GEOMETRY_TYPES[0].value);
  const [dgTetrahedraCount, setDgTetrahedraCount] = useState("1000");
  const [dgBoundaryTriangulation, setDgBoundaryTriangulation] = useState("100");
  const [dgResult, setDgResult] = useState<unknown>(null);
  const [loadingDg, setLoadingDg] = useState(false);

  // ── QH Entropy state ──
  const [qhType, setQhType] = useState(QUANTUM_BH_TYPES[0].value);
  const [qhHorizonArea, setQhHorizonArea] = useState("1e76");
  const [qhElectricCharge, setQhElectricCharge] = useState("0");
  const [qhResult, setQhResult] = useState<unknown>(null);
  const [loadingQh, setLoadingQh] = useState(false);

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

  // ── Spin Network ──
  const runSn = async () => {
    setLoadingSn(true);
    try {
      const r = await callApi("/spin-network", {
        evolution_type: snType,
        spin_j_max: parseFloat(snSpinJMax),
        network_nodes: parseInt(snNetworkNodes),
      });
      setSnResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSn(false);
    }
  };

  // ── LQG ──
  const runLqg = async () => {
    setLoadingLqg(true);
    try {
      const r = await callApi("/lqg", {
        lqg_type: lqgType,
        immirzi_gamma: parseFloat(lqgImmirziGamma),
        graph_edges: parseInt(lqgGraphEdges),
      });
      setLqgResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLqg(false);
    }
  };

  // ── Spin Foam ──
  const runSf = async () => {
    setLoadingSf(true);
    try {
      const r = await callApi("/spin-foam", {
        foam_type: sfType,
        boundary_spins: parseInt(sfBoundarySpins),
        vertex_amplitude: parseFloat(sfVertexAmplitude),
      });
      setSfResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSf(false);
    }
  };

  // ── LQC ──
  const runLqc = async () => {
    setLoadingLqc(true);
    try {
      const r = await callApi("/lqc", {
        lqc_type: lqcType,
        critical_density_planck: parseFloat(lqcCriticalDensity),
        scale_factor: parseFloat(lqcScaleFactor),
      });
      setLqcResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLqc(false);
    }
  };

  // ── Discrete Geometry ──
  const runDg = async () => {
    setLoadingDg(true);
    try {
      const r = await callApi("/discrete-geometry", {
        geometry_type: dgType,
        tetrahedra_count: parseInt(dgTetrahedraCount),
        boundary_triangulation: parseInt(dgBoundaryTriangulation),
      });
      setDgResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDg(false);
    }
  };

  // ── QH Entropy ──
  const runQh = async () => {
    setLoadingQh(true);
    try {
      const r = await callApi("/quantum-bh-entropy", {
        entropy_type: qhType,
        horizon_area_planck2: parseFloat(qhHorizonArea),
        electric_charge: parseFloat(qhElectricCharge),
      });
      setQhResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQh(false);
    }
  };

  // ──────────────────────── RENDER ────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Causal Quantum Gravity Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Layer 74 (v1.322.0) — Bridges causal gauge theory (L73) with loop quantum gravity
          dynamics: spin network evolution, LQG dynamics, spin foam models, loop quantum
          cosmology, discrete geometry, and quantum black hole entropy.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Layer" value="74" desc="Causal Quantum Gravity" />
        <StatCard title="Enums" value="36" desc="6 x 6 values" />
        <StatCard title="Endpoints" value="7" desc="6 POST + 1 GET" />
        <StatCard title="Config Space" value="46,656" desc="6^6 combinations" />
      </div>

      {/* Physics Bridge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physics Bridge — L73 Causal Gauge Theory → L74 Causal Quantum Gravity</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <div>1. 规范场联络 → 自旋网络演化: Yang-Mills A_μ → Wilson环 W[γ]=Tr P exp(∮A) → 自旋网络态 |Γ,j,i⟩ → 面积算符 Â|s⟩ = 8πγℓ_P²Σ√(j(j+1))|s⟩</div>
          <div>2. 曲率张量 → 圈量子引力: Riemann R_μνρσ → Ashtekar变量 (A^i_a, E^a_i) → Immirzi参数 γ → 环量和通量算符</div>
          <div>3. 纤维丛 → 自旋泡沫模型: 主丛 P(M,G) → Barrett-Crane模型 → EPRL/FK顶点 → 自旋泡沫振幅 Z=Σ_σ∏_f A_f(j_f)∏_e A_e(g_e)∏_v A_v(j_f,g_e)</div>
          <div>4. 规范对称破缺 → 圈量子宇宙学: Higgs VEV → 大反弹 ρ_c=ρ_P·3/(8πγ²β²) → 有效Friedmann方程 → 多聚量子化</div>
          <div>5. 拓扑缺陷 → 离散几何: 瞬子/Sphaleron → 3D三角化 → 量子四面体 → 相干态几何 → Regge微扰</div>
          <div>6. Chern-Simons → 量子黑洞熵: CS k → 孤立视界 → 微观态计数 N(Δ) → S_LQG = γ·Σ√(j_i(j_i+1)) → S = A/(4ℓ_P²)</div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spinnet">Spin Net</TabsTrigger>
          <TabsTrigger value="lqg">LQG</TabsTrigger>
          <TabsTrigger value="spinfoam">Spin Foam</TabsTrigger>
          <TabsTrigger value="lqc">LQC</TabsTrigger>
          <TabsTrigger value="discgeom">Disc Geom</TabsTrigger>
          <TabsTrigger value="qhentropy">QH Entropy</TabsTrigger>
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

        {/* ── Spin Network ── */}
        <TabsContent value="spinnet">
          <Card>
            <CardHeader>
              <CardTitle>Spin Network Evolution</CardTitle>
              <CardDescription>
                Simulate spin network evolution: Wilson loops, spin network states,
                area operators, volume operators, Penrose spin networks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Evolution Type</Label>
                  <Select value={snType} onValueChange={setSnType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SPIN_NETWORK_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Spin j_max</Label>
                  <Input type="number" value={snSpinJMax} onChange={(e) => setSnSpinJMax(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Network Nodes</Label>
                  <Input type="number" value={snNetworkNodes} onChange={(e) => setSnNetworkNodes(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runSn} disabled={loadingSn}>
                {loadingSn ? "Computing..." : "Evolve Spin Network"}
              </Button>
              {snResult && <JsonBlock data={snResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LQG ── */}
        <TabsContent value="lqg">
          <Card>
            <CardHeader>
              <CardTitle>Loop Quantum Gravity</CardTitle>
              <CardDescription>
                Compute LQG dynamics: Ashtekar variables, Immirzi parameter,
                holonomy operators, flux operators, discretized geometry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>LQG Type</Label>
                  <Select value={lqgType} onValueChange={setLqgType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LQG_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Immirzi Parameter γ</Label>
                  <Input type="number" value={lqgImmirziGamma} onChange={(e) => setLqgImmirziGamma(e.target.value)} step="0.001" />
                </div>
                <div>
                  <Label>Graph Edges</Label>
                  <Input type="number" value={lqgGraphEdges} onChange={(e) => setLqgGraphEdges(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runLqg} disabled={loadingLqg}>
                {loadingLqg ? "Computing..." : "Compute LQG Dynamics"}
              </Button>
              {lqgResult && <JsonBlock data={lqgResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Spin Foam ── */}
        <TabsContent value="spinfoam">
          <Card>
            <CardHeader>
              <CardTitle>Spin Foam Models</CardTitle>
              <CardDescription>
                Evaluate spin foam models: Barrett-Crane model, EPRL model, FK model,
                EPRL-FK vertex amplitudes, spin foam amplitude sums
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Foam Type</Label>
                  <Select value={sfType} onValueChange={setSfType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SPIN_FOAM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Boundary Spins</Label>
                  <Input type="number" value={sfBoundarySpins} onChange={(e) => setSfBoundarySpins(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Vertex Amplitude</Label>
                  <Input type="number" value={sfVertexAmplitude} onChange={(e) => setSfVertexAmplitude(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runSf} disabled={loadingSf}>
                {loadingSf ? "Computing..." : "Evaluate Spin Foam"}
              </Button>
              {sfResult && <JsonBlock data={sfResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── LQC ── */}
        <TabsContent value="lqc">
          <Card>
            <CardHeader>
              <CardTitle>Loop Quantum Cosmology</CardTitle>
              <CardDescription>
                Simulate loop quantum cosmology: big bounce scenarios, quantum Friedmann equations,
                effective dynamics, polymer quantization, Bianchi models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>LQC Type</Label>
                  <Select value={lqcType} onValueChange={setLqcType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LQC_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Critical Density (ρ_P)</Label>
                  <Input type="number" value={lqcCriticalDensity} onChange={(e) => setLqcCriticalDensity(e.target.value)} step="0.01" />
                </div>
                <div>
                  <Label>Scale Factor</Label>
                  <Input type="number" value={lqcScaleFactor} onChange={(e) => setLqcScaleFactor(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runLqc} disabled={loadingLqc}>
                {loadingLqc ? "Computing..." : "Simulate Loop Quantum Cosmology"}
              </Button>
              {lqcResult && <JsonBlock data={lqcResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Discrete Geometry ── */}
        <TabsContent value="discgeom">
          <Card>
            <CardHeader>
              <CardTitle>Discrete Geometry</CardTitle>
              <CardDescription>
                Construct discrete geometries: 3D triangulations, quantum tetrahedra,
                coherent state geometries, semi-classical limits, Regge calculus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Geometry Type</Label>
                  <Select value={dgType} onValueChange={setDgType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DISCRETE_GEOMETRY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tetrahedra Count</Label>
                  <Input type="number" value={dgTetrahedraCount} onChange={(e) => setDgTetrahedraCount(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Boundary Triangulation</Label>
                  <Input type="number" value={dgBoundaryTriangulation} onChange={(e) => setDgBoundaryTriangulation(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runDg} disabled={loadingDg}>
                {loadingDg ? "Computing..." : "Construct Discrete Geometry"}
              </Button>
              {dgResult && <JsonBlock data={dgResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── QH Entropy ── */}
        <TabsContent value="qhentropy">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Black Hole Entropy</CardTitle>
              <CardDescription>
                Compute quantum black hole entropy: microstate counting, area spectra,
                isolated horizons, quantum isolated horizons, entanglement entropy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Entropy Type</Label>
                  <Select value={qhType} onValueChange={setQhType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {QUANTUM_BH_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Horizon Area (ℓ_P²)</Label>
                  <Input type="text" value={qhHorizonArea} onChange={(e) => setQhHorizonArea(e.target.value)} />
                </div>
                <div>
                  <Label>Electric Charge</Label>
                  <Input type="number" value={qhElectricCharge} onChange={(e) => setQhElectricCharge(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runQh} disabled={loadingQh}>
                {loadingQh ? "Computing..." : "Compute Quantum BH Entropy"}
              </Button>
              {qhResult && <JsonBlock data={qhResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
