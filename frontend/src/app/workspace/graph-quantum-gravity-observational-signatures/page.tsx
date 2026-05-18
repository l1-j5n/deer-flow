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
const COSMOLOGICAL_TYPES = [
  { value: "cmb_b_mode_polarization", label: "CMB B模式偏振" },
  { value: "primordial_gravitational_waves", label: "原初引力波" },
  { value: "cmb_spectral_distortion", label: "CMB光谱失真" },
  { value: "large_scale_structure_qg", label: "大尺度结构QG印记" },
  { value: "reionization_qg_signal", label: "再电离QG信号" },
  { value: "ai_cosmology_signature", label: "AI宇宙学签名" },
];

const GW_QG_TYPES = [
  { value: "gw_echo", label: "GW回声" },
  { value: "gw_resonance", label: "GW共振" },
  { value: "dispersion_relation_modification", label: "色散关系修正" },
  { value: "gw_polarization_mode", label: "GW偏振模式" },
  { value: "qg_interferometer_signature", label: "QG干涉仪签名" },
  { value: "ai_gw_qg", label: "AI-GW QG" },
];

const DARK_MATTER_TYPES = [
  { value: "fuzzy_dark_matter", label: "模糊暗物质" },
  { value: "axion_dark_matter", label: "轴子暗物质" },
  { value: "primordial_black_hole", label: "原初黑洞" },
  { value: "dm_graviton_coupling", label: "暗物质引力子耦合" },
  { value: "quantum_dark_matter", label: "量子暗物质" },
  { value: "ai_dark_matter_qg", label: "AI暗物质QG" },
];

const BLACK_HOLE_OBS_TYPES = [
  { value: "eht_black_hole_shadow", label: "EHT黑洞阴影" },
  { value: "hawking_radiation_detection", label: "霍金辐射检测" },
  { value: "black_hole_information_paradox", label: "黑洞信息悖论" },
  { value: "black_hole_echo", label: "黑洞回声" },
  { value: "bh_ringdown_spectrum", label: "BH铃声谱" },
  { value: "ai_black_hole_observation", label: "AI黑洞观测" },
];

const GRB_QG_TYPES = [
  { value: "grb_time_delay", label: "GRB时间延迟" },
  { value: "energy_dependent_velocity", label: "能量依赖速度" },
  { value: "polarization_rotation", label: "偏振旋转" },
  { value: "lorentz_invariance_violation", label: "洛伦兹不变性破坏" },
  { value: "vacuum_dispersion_signature", label: "真空色散签名" },
  { value: "ai_grb_qg", label: "AI-GRB QG" },
];

const SPACETIME_PROBE_TYPES = [
  { value: "atom_interferometer", label: "原子干涉仪" },
  { value: "optical_clock_network", label: "光学钟网络" },
  { value: "pulsar_timing_array", label: "脉冲星计时阵列" },
  { value: "neutrino_interferometry", label: "中微子干涉" },
  { value: "quantum_gravity_antenna", label: "量子引力天线" },
  { value: "ai_spacetime_probe", label: "AI时空探测" },
];

// API base
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001/graph/quantum-gravity-observational-signatures";

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
export default function QuantumGravityObservationalSignaturesPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // ── Overview state ──
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOv, setLoadingOv] = useState(false);

  // ── Cosmological QG Signature state ──
  const [cqsType, setCqsType] = useState(COSMOLOGICAL_TYPES[0].value);
  const [cqsRedshift, setCqsRedshift] = useState("1100.0");
  const [cqsSensitivity, setCqsSensitivity] = useState("1e-6");
  const [cqsBand, setCqsBand] = useState("CMB");
  const [cqsResult, setCqsResult] = useState<unknown>(null);
  const [loadingCqs, setLoadingCqs] = useState(false);

  // ── Gravitational Wave QG state ──
  const [gwqType, setGwqType] = useState(GW_QG_TYPES[0].value);
  const [gwqFrequency, setGwqFrequency] = useState("100.0");
  const [gwqStrain, setGwqStrain] = useState("1e-21");
  const [gwqSnr, setGwqSnr] = useState("10.0");
  const [gwqResult, setGwqResult] = useState<unknown>(null);
  const [loadingGwq, setLoadingGwq] = useState(false);

  // ── Dark Matter QG state ──
  const [dmqType, setDmqType] = useState(DARK_MATTER_TYPES[0].value);
  const [dmqMass, setDmqMass] = useState("1e-22");
  const [dmqCoupling, setDmqCoupling] = useState("0.1");
  const [dmqDensity, setDmqDensity] = useState("0.3");
  const [dmqResult, setDmqResult] = useState<unknown>(null);
  const [loadingDmq, setLoadingDmq] = useState(false);

  // ── Black Hole QG Observation state ──
  const [bhqType, setBhqType] = useState(BLACK_HOLE_OBS_TYPES[0].value);
  const [bhqMass, setBhqMass] = useState("4e6");
  const [bhqDistance, setBhqDistance] = useState("8.0");
  const [bhqResolution, setBhqResolution] = useState("20.0");
  const [bhqResult, setBhqResult] = useState<unknown>(null);
  const [loadingBhq, setLoadingBhq] = useState(false);

  // ── Gamma-Ray Burst QG state ──
  const [grbType, setGrbType] = useState(GRB_QG_TYPES[0].value);
  const [grbEnergy, setGrbEnergy] = useState("100.0");
  const [grbDistance, setGrbDistance] = useState("1.0");
  const [grbDelay, setGrbDelay] = useState("0.001");
  const [grbResult, setGrbResult] = useState<unknown>(null);
  const [loadingGrb, setLoadingGrb] = useState(false);

  // ── Quantum Spacetime Probe state ──
  const [qspType, setQspType] = useState(SPACETIME_PROBE_TYPES[0].value);
  const [qspBaseline, setQspBaseline] = useState("100.0");
  const [qspPrecision, setQspPrecision] = useState("1e-18");
  const [qspIntegration, setQspIntegration] = useState("3600.0");
  const [qspResult, setQspResult] = useState<unknown>(null);
  const [loadingQsp, setLoadingQsp] = useState(false);

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

  // ── Cosmological QG Signature ──
  const runCqs = async () => {
    setLoadingCqs(true);
    try {
      const r = await callApi("/cosmological-qg-signature", {
        signature_type: cqsType,
        redshift: parseFloat(cqsRedshift),
        sensitivity: parseFloat(cqsSensitivity),
        observation_band: cqsBand,
      });
      setCqsResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCqs(false);
    }
  };

  // ── Gravitational Wave QG ──
  const runGwq = async () => {
    setLoadingGwq(true);
    try {
      const r = await callApi("/gravitational-wave-qg", {
        gw_qg_type: gwqType,
        frequency: parseFloat(gwqFrequency),
        strain: parseFloat(gwqStrain),
        snr: parseFloat(gwqSnr),
      });
      setGwqResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGwq(false);
    }
  };

  // ── Dark Matter QG ──
  const runDmq = async () => {
    setLoadingDmq(true);
    try {
      const r = await callApi("/dark-matter-qg", {
        dark_matter_type: dmqType,
        particle_mass: parseFloat(dmqMass),
        coupling_strength: parseFloat(dmqCoupling),
        local_density: parseFloat(dmqDensity),
      });
      setDmqResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDmq(false);
    }
  };

  // ── Black Hole QG Observation ──
  const runBhq = async () => {
    setLoadingBhq(true);
    try {
      const r = await callApi("/black-hole-qg-observation", {
        observation_type: bhqType,
        black_hole_mass: parseFloat(bhqMass),
        distance_mpc: parseFloat(bhqDistance),
        angular_resolution: parseFloat(bhqResolution),
      });
      setBhqResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBhq(false);
    }
  };

  // ── Gamma-Ray Burst QG ──
  const runGrb = async () => {
    setLoadingGrb(true);
    try {
      const r = await callApi("/gamma-ray-burst-qg", {
        grb_qg_type: grbType,
        photon_energy: parseFloat(grbEnergy),
        source_distance: parseFloat(grbDistance),
        time_delay: parseFloat(grbDelay),
      });
      setGrbResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGrb(false);
    }
  };

  // ── Quantum Spacetime Probe ──
  const runQsp = async () => {
    setLoadingQsp(true);
    try {
      const r = await callApi("/quantum-spacetime-probe", {
        probe_type: qspType,
        baseline_length: parseFloat(qspBaseline),
        measurement_precision: parseFloat(qspPrecision),
        integration_time: parseFloat(qspIntegration),
      });
      setQspResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQsp(false);
    }
  };

  // ──────────────────────── RENDER ────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Quantum Gravity Observational Signatures Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Layer 71 (v1.319.0) — Bridges quantum gravity phenomenology with observational signatures:
          CMB B-mode polarization, gravitational wave QG effects, dark matter quantum signatures,
          EHT black hole observations, GRB time delays, quantum spacetime probes.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Layer" value="71" desc="Quantum Gravity Observational Signatures" />
        <StatCard title="Enums" value="36" desc="6 × 6 values" />
        <StatCard title="Endpoints" value="7" desc="6 POST + 1 GET" />
        <StatCard title="Config Space" value="46,656" desc="6⁶ combinations" />
      </div>

      {/* Physics Bridge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physics Bridge — L70 Quantum Gravity Phenomenology → L71 Quantum Gravity Observational Signatures</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <div>1. Planck尺度效应 → CMB B模偏振: E_P ≈ 1.22×10¹⁹ GeV → 原初张量扰动 r → B模功率谱 C_l^BB</div>
          <div>2. 时空离散化 → 引力波色散修正: 因果集/自旋网络 → 修正色散关系 E² = p²c²(1 + ξ·(E/E_P)^n) → 引力波到达时间差</div>
          <div>3. 全息界 → 黑洞阴影观测: Ryu-Takayanagi S = A/(4G) → EHT黑洞阴影直径 d_shadow = 5.2M (Kerr) → M87*/Sgr A*</div>
          <div>4. 量子因果 → 暗物质量子引力签名: 不确定因果序 → 模糊暗物质 ψ_DM德布罗意波长 λ = h/(mv) → ψ_DM密度波纹</div>
          <div>5. BMV引力纠缠 → 黑洞量子观测: 引力诱导纠缠 → Page曲线信息恢复 → 黑洞回声信号 τ_echo ~ n·r_s/c</div>
          <div>6. Wheeler时空泡沫 → GRB时间延迟: Δx·Δt ≥ l_P·t_P → 光子能量依赖速度 Δv/c ~ (E/E_P)^n → Fermi/Swift GRB延迟</div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cqs">Cosmo QG</TabsTrigger>
          <TabsTrigger value="gwq">GW QG</TabsTrigger>
          <TabsTrigger value="dmq">Dark Matter</TabsTrigger>
          <TabsTrigger value="bhq">BH Obs</TabsTrigger>
          <TabsTrigger value="grb">GRB QG</TabsTrigger>
          <TabsTrigger value="qsp">ST Probe</TabsTrigger>
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

        {/* ── Cosmological QG Signature ── */}
        <TabsContent value="cqs">
          <Card>
            <CardHeader>
              <CardTitle>Cosmological QG Signature</CardTitle>
              <CardDescription>
                Analyze cosmological quantum gravity observational signatures: CMB B-mode polarization
                from primordial gravitational waves, spectral distortions, large-scale structure QG
                imprints, and reionization signals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Signature Type</Label>
                  <Select value={cqsType} onValueChange={setCqsType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COSMOLOGICAL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Redshift</Label>
                  <Input type="number" value={cqsRedshift} onChange={(e) => setCqsRedshift(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Sensitivity</Label>
                  <Input type="text" value={cqsSensitivity} onChange={(e) => setCqsSensitivity(e.target.value)} />
                </div>
                <div>
                  <Label>Observation Band</Label>
                  <Input type="text" value={cqsBand} onChange={(e) => setCqsBand(e.target.value)} />
                </div>
              </div>
              <Button onClick={runCqs} disabled={loadingCqs}>
                {loadingCqs ? "Computing…" : "Compute Cosmological QG Signature"}
              </Button>
              {cqsResult && <JsonBlock data={cqsResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Gravitational Wave QG ── */}
        <TabsContent value="gwq">
          <Card>
            <CardHeader>
              <CardTitle>Gravitational Wave QG</CardTitle>
              <CardDescription>
                Investigate quantum gravity signatures in gravitational wave signals: GW echoes,
                resonance structures, modified dispersion relations, extra polarization modes,
                and interferometer QG signatures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>GW QG Type</Label>
                  <Select value={gwqType} onValueChange={setGwqType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GW_QG_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Frequency (Hz)</Label>
                  <Input type="number" value={gwqFrequency} onChange={(e) => setGwqFrequency(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Strain</Label>
                  <Input type="text" value={gwqStrain} onChange={(e) => setGwqStrain(e.target.value)} />
                </div>
                <div>
                  <Label>SNR</Label>
                  <Input type="number" value={gwqSnr} onChange={(e) => setGwqSnr(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runGwq} disabled={loadingGwq}>
                {loadingGwq ? "Computing…" : "Compute GW QG Signature"}
              </Button>
              {gwqResult && <JsonBlock data={gwqResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Dark Matter QG ── */}
        <TabsContent value="dmq">
          <Card>
            <CardHeader>
              <CardTitle>Dark Matter QG Signature</CardTitle>
              <CardDescription>
                Probe quantum gravity signatures in dark matter: fuzzy dark matter de Broglie waves,
                axion dark matter, primordial black holes, dark matter-graviton coupling, and quantum
                dark matter phenomenology
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dark Matter Type</Label>
                  <Select value={dmqType} onValueChange={setDmqType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DARK_MATTER_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Particle Mass (eV)</Label>
                  <Input type="text" value={dmqMass} onChange={(e) => setDmqMass(e.target.value)} />
                </div>
                <div>
                  <Label>Coupling Strength</Label>
                  <Input type="number" value={dmqCoupling} onChange={(e) => setDmqCoupling(e.target.value)} step="0.01" />
                </div>
                <div>
                  <Label>Local Density (GeV/cm³)</Label>
                  <Input type="number" value={dmqDensity} onChange={(e) => setDmqDensity(e.target.value)} step="0.01" />
                </div>
              </div>
              <Button onClick={runDmq} disabled={loadingDmq}>
                {loadingDmq ? "Computing…" : "Compute Dark Matter QG Signature"}
              </Button>
              {dmqResult && <JsonBlock data={dmqResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Black Hole QG Observation ── */}
        <TabsContent value="bhq">
          <Card>
            <CardHeader>
              <CardTitle>Black Hole QG Observation</CardTitle>
              <CardDescription>
                Analyze quantum gravity signatures in black hole observations: EHT black hole shadow
                measurements, Hawking radiation detection prospects, information paradox signatures,
                black hole echoes, and ringdown spectrum QG effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Observation Type</Label>
                  <Select value={bhqType} onValueChange={setBhqType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BLACK_HOLE_OBS_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Black Hole Mass (M☉)</Label>
                  <Input type="text" value={bhqMass} onChange={(e) => setBhqMass(e.target.value)} />
                </div>
                <div>
                  <Label>Distance (Mpc)</Label>
                  <Input type="number" value={bhqDistance} onChange={(e) => setBhqDistance(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Angular Resolution (μas)</Label>
                  <Input type="number" value={bhqResolution} onChange={(e) => setBhqResolution(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runBhq} disabled={loadingBhq}>
                {loadingBhq ? "Computing…" : "Compute BH QG Observation"}
              </Button>
              {bhqResult && <JsonBlock data={bhqResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Gamma-Ray Burst QG ── */}
        <TabsContent value="grb">
          <Card>
            <CardHeader>
              <CardTitle>Gamma-Ray Burst QG</CardTitle>
              <CardDescription>
                Search for quantum gravity signatures in gamma-ray burst observations: time delay
                measurements, energy-dependent photon velocity, polarization rotation, Lorentz
                invariance violation, and vacuum dispersion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>GRB QG Type</Label>
                  <Select value={grbType} onValueChange={setGrbType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GRB_QG_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Photon Energy (GeV)</Label>
                  <Input type="number" value={grbEnergy} onChange={(e) => setGrbEnergy(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Source Distance (Gpc)</Label>
                  <Input type="number" value={grbDistance} onChange={(e) => setGrbDistance(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Time Delay (s)</Label>
                  <Input type="number" value={grbDelay} onChange={(e) => setGrbDelay(e.target.value)} step="0.001" />
                </div>
              </div>
              <Button onClick={runGrb} disabled={loadingGrb}>
                {loadingGrb ? "Computing…" : "Compute GRB QG Signature"}
              </Button>
              {grbResult && <JsonBlock data={grbResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Quantum Spacetime Probe ── */}
        <TabsContent value="qsp">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Spacetime Probe</CardTitle>
              <CardDescription>
                Design quantum spacetime probing experiments: atom interferometry, optical clock networks,
                pulsar timing arrays, neutrino interferometry, and quantum gravity antenna configurations
                for detecting spacetime structure at Planck scale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Probe Type</Label>
                  <Select value={qspType} onValueChange={setQspType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SPACETIME_PROBE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Baseline Length (m)</Label>
                  <Input type="number" value={qspBaseline} onChange={(e) => setQspBaseline(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Measurement Precision</Label>
                  <Input type="text" value={qspPrecision} onChange={(e) => setQspPrecision(e.target.value)} />
                </div>
                <div>
                  <Label>Integration Time (s)</Label>
                  <Input type="number" value={qspIntegration} onChange={(e) => setQspIntegration(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runQsp} disabled={loadingQsp}>
                {loadingQsp ? "Computing…" : "Compute Spacetime Probe Signature"}
              </Button>
              {qspResult && <JsonBlock data={qspResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
