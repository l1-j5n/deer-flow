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
const TABLETOP_TYPES = [
  { value: "bmv_experiment_design", label: "BMV实验设计" },
  { value: "cavity_optomechanics", label: "腔光力学" },
  { value: "atom_interferometry_qg", label: "原子干涉仪QG" },
  { value: "superconducting_qg_sensor", label: "超导QG传感器" },
  { value: "levitated_mass_interferometer", label: "悬浮质量干涉仪" },
  { value: "ai_tabletop_qg", label: "AI桌面QG" },
];

const SPACECRAFT_TYPES = [
  { value: "lisa_pathfinder", label: "LISA探路者" },
  { value: "decigo_concept", label: "DECIGO概念" },
  { value: "einstein_telescope", label: "爱因斯坦望远镜 ET" },
  { value: "cosmic_explorer", label: "宇宙探索者 CE" },
  { value: "atom_interferometry_space", label: "空间原子干涉" },
  { value: "ai_spacecraft_detection", label: "AI航天器探测" },
];

const ION_BEAM_TYPES = [
  { value: "heavy_ion_collision", label: "重离子碰撞 RHIC/LHC" },
  { value: "quark_gluon_plasma", label: "夸克胶子等离子体 QGP" },
  { value: "relativistic_heavy_ion", label: "相对论重离子" },
  { value: "ion_trap_qg", label: "离子阱QG" },
  { value: "antimatter_experiment", label: "反物质实验" },
  { value: "ai_ion_beam", label: "AI离子束" },
];

const DETECTOR_TYPES = [
  { value: "gravitational_wave_network", label: "引力波网络" },
  { value: "neutrino_telescope_array", label: "中微子望远镜阵列" },
  { value: "dark_matter_detector_array", label: "暗物质探测器阵列" },
  { value: "axion_haloscope_array", label: "轴子Haloscope阵列" },
  { value: "quantum_sensor_network", label: "量子传感网络" },
  { value: "ai_detector_array", label: "AI探测器阵列" },
];

const MATTER_WAVE_TYPES = [
  { value: "bose_einstein_condensate", label: "BEC玻色爱因斯坦凝聚" },
  { value: "cold_atom_fountain", label: "冷原子喷泉" },
  { value: "dual_species_interferometer", label: "双物种干涉仪" },
  { value: "large_momentum_transfer", label: "大动量转移 LMT" },
  { value: "entangled_atom_interferometer", label: "纠缠原子干涉仪" },
  { value: "ai_matter_wave", label: "AI物质波" },
];

const ASTROPHYSICAL_TYPES = [
  { value: "fast_radio_burst", label: "快速射电暴 FRB" },
  { value: "high_energy_photon", label: "高能光子" },
  { value: "neutrino_observation", label: "中微子观测" },
  { value: "multi_messenger_astronomy", label: "多信使天文学" },
  { value: "extreme_mass_ratio_inspiral", label: "极端质量比旋近 EMRI" },
  { value: "ai_astrophysical_probe", label: "AI天体物理探针" },
];

// API base
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001/graph/quantum-gravity-experimental-design";

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
export default function QuantumGravityExperimentalDesignPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // ── Overview state ──
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOv, setLoadingOv] = useState(false);

  // ── Tabletop QG Experiment state ──
  const [tqeType, setTqeType] = useState(TABLETOP_TYPES[0].value);
  const [tqeMass, setTqeMass] = useState("1e-14");
  const [tqeCoherence, setTqeCoherence] = useState("1.0");
  const [tqeSensitivity, setTqeSensitivity] = useState("1e-20");
  const [tqeResult, setTqeResult] = useState<unknown>(null);
  const [loadingTqe, setLoadingTqe] = useState(false);

  // ── Spacecraft Detection state ──
  const [sdeType, setSdeType] = useState(SPACECRAFT_TYPES[0].value);
  const [sdeArmLength, setSdeArmLength] = useState("2500000");
  const [sdeFrequency, setSdeFrequency] = useState("0.001");
  const [sdeStrain, setSdeStrain] = useState("1e-21");
  const [sdeResult, setSdeResult] = useState<unknown>(null);
  const [loadingSde, setLoadingSde] = useState(false);

  // ── Ion Beam Experiment state ──
  const [ibeType, setIbeType] = useState(ION_BEAM_TYPES[0].value);
  const [ibeEnergy, setIbeEnergy] = useState("200");
  const [ibeLuminosity, setIbeLuminosity] = useState("1e34");
  const [ibeRate, setIbeRate] = useState("10");
  const [ibeResult, setIbeResult] = useState<unknown>(null);
  const [loadingIbe, setLoadingIbe] = useState(false);

  // ── Detector Array state ──
  const [daeType, setDaeType] = useState(DETECTOR_TYPES[0].value);
  const [daeCount, setDaeCount] = useState("100");
  const [daeBaseline, setDaeBaseline] = useState("1000");
  const [daeDutyCycle, setDaeDutyCycle] = useState("0.8");
  const [daeResult, setDaeResult] = useState<unknown>(null);
  const [loadingDae, setLoadingDae] = useState(false);

  // ── Matter Wave Interferometry state ──
  const [mreType, setMreType] = useState(MATTER_WAVE_TYPES[0].value);
  const [mreAtomNumber, setMreAtomNumber] = useState("1e6");
  const [mreMomentum, setMreMomentum] = useState("100");
  const [mreTime, setMreTime] = useState("1.0");
  const [mreResult, setMreResult] = useState<unknown>(null);
  const [loadingMre, setLoadingMre] = useState(false);

  // ── Astrophysical Probe state ──
  const [aseType, setAseType] = useState(ASTROPHYSICAL_TYPES[0].value);
  const [aseEnergy, setAseEnergy] = useState("0.001");
  const [aseCoverage, setAseCoverage] = useState("0.5");
  const [aseResolution, setAseResolution] = useState("1.0");
  const [aseResult, setAseResult] = useState<unknown>(null);
  const [loadingAse, setLoadingAse] = useState(false);

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

  // ── Tabletop QG Experiment ──
  const runTqe = async () => {
    setLoadingTqe(true);
    try {
      const r = await callApi("/tabletop-qg-experiment", {
        experiment_type: tqeType,
        mass_kg: parseFloat(tqeMass),
        coherence_time_s: parseFloat(tqeCoherence),
        sensitivity_target: parseFloat(tqeSensitivity),
      });
      setTqeResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTqe(false);
    }
  };

  // ── Spacecraft Detection ──
  const runSde = async () => {
    setLoadingSde(true);
    try {
      const r = await callApi("/spacecraft-detection", {
        mission_type: sdeType,
        arm_length_km: parseFloat(sdeArmLength),
        frequency_band_hz: parseFloat(sdeFrequency),
        strain_sensitivity: parseFloat(sdeStrain),
      });
      setSdeResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSde(false);
    }
  };

  // ── Ion Beam Experiment ──
  const runIbe = async () => {
    setLoadingIbe(true);
    try {
      const r = await callApi("/ion-beam-experiment", {
        experiment_type: ibeType,
        beam_energy_gev: parseFloat(ibeEnergy),
        luminosity_cm2s: parseFloat(ibeLuminosity),
        collision_rate_mhz: parseFloat(ibeRate),
      });
      setIbeResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIbe(false);
    }
  };

  // ── Detector Array ──
  const runDae = async () => {
    setLoadingDae(true);
    try {
      const r = await callApi("/detector-array", {
        array_type: daeType,
        detector_count: parseInt(daeCount),
        baseline_km: parseFloat(daeBaseline),
        duty_cycle: parseFloat(daeDutyCycle),
      });
      setDaeResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDae(false);
    }
  };

  // ── Matter Wave Interferometry ──
  const runMre = async () => {
    setLoadingMre(true);
    try {
      const r = await callApi("/matter-wave-interferometry", {
        interferometer_type: mreType,
        atom_number: parseFloat(mreAtomNumber),
        momentum_transfer_hbar: parseFloat(mreMomentum),
        interrogation_time_s: parseFloat(mreTime),
      });
      setMreResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMre(false);
    }
  };

  // ── Astrophysical Probe ──
  const runAse = async () => {
    setLoadingAse(true);
    try {
      const r = await callApi("/astrophysical-probe", {
        probe_type: aseType,
        energy_range_gev: parseFloat(aseEnergy),
        sky_coverage_fraction: parseFloat(aseCoverage),
        time_resolution_ms: parseFloat(aseResolution),
      });
      setAseResult(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAse(false);
    }
  };

  // ──────────────────────── RENDER ────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Quantum Gravity Experimental Design Engine
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Layer 72 (v1.320.0) — Bridges quantum gravity observational signatures (L71) with
          experimental design: tabletop QG experiments, spacecraft detection, ion beam experiments,
          detector arrays, matter wave interferometry, and astrophysical probes.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard title="Layer" value="72" desc="QG Experimental Design" />
        <StatCard title="Enums" value="36" desc="6 x 6 values" />
        <StatCard title="Endpoints" value="7" desc="6 POST + 1 GET" />
        <StatCard title="Config Space" value="46,656" desc="6^6 combinations" />
      </div>

      {/* Physics Bridge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physics Bridge — L71 QG Observational Signatures → L72 QG Experimental Design</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <div>1. 宇宙学QG签名 → 桌面QG实验: CMB B模 → BMV实验方案 → 腔光力学耦合 g_0 → 质量干涉仪灵敏度 ~10⁻²⁰ m/√Hz</div>
          <div>2. CMB偏振 → 航天器探测: 退透镜效率 → LISA臂长 2.5×10⁶ km → 加速度噪声 ~3×10⁻¹⁵ m/s²/√Hz</div>
          <div>3. 引力波QG效应 → 离子束实验: 准正则模 → RHIC/LHC重离子碰撞 → QGP温度 T ~ 200 MeV → 夸克自由度</div>
          <div>4. 暗物质QG → 探测器阵列: 超轻暗物质 λ_dB → LZ/XENON探测器阵列 → 网络灵敏度三角测量</div>
          <div>5. 黑洞QG观测 → 物质波干涉: Hawking T_H → BEC原子数 N~10⁶ → 大动量转移 nℏk → 相位灵敏度 δφ ~ 10⁻⁶ rad</div>
          <div>6. GRB QG签名 → 天体物理探针: 谱延迟 Δt ∝ (E/E_P)^n → FRB色散测量 → 高能光子TOF → 多信使天文学</div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tqe">Tabletop</TabsTrigger>
          <TabsTrigger value="sde">Spacecraft</TabsTrigger>
          <TabsTrigger value="ibe">Ion Beam</TabsTrigger>
          <TabsTrigger value="dae">Detector</TabsTrigger>
          <TabsTrigger value="mre">Matter Wave</TabsTrigger>
          <TabsTrigger value="ase">Astro Probe</TabsTrigger>
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

        {/* ── Tabletop QG Experiment ── */}
        <TabsContent value="tqe">
          <Card>
            <CardHeader>
              <CardTitle>Tabletop QG Experiment</CardTitle>
              <CardDescription>
                Design tabletop quantum gravity experiments: BMV protocol, cavity optomechanics,
                atom interferometry for QG, superconducting sensors, levitated mass interferometers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Experiment Type</Label>
                  <Select value={tqeType} onValueChange={setTqeType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TABLETOP_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Test Mass (kg)</Label>
                  <Input type="text" value={tqeMass} onChange={(e) => setTqeMass(e.target.value)} />
                </div>
                <div>
                  <Label>Coherence Time (s)</Label>
                  <Input type="number" value={tqeCoherence} onChange={(e) => setTqeCoherence(e.target.value)} step="0.1" />
                </div>
                <div>
                  <Label>Sensitivity Target (m/√Hz)</Label>
                  <Input type="text" value={tqeSensitivity} onChange={(e) => setTqeSensitivity(e.target.value)} />
                </div>
              </div>
              <Button onClick={runTqe} disabled={loadingTqe}>
                {loadingTqe ? "Computing..." : "Design Tabletop QG Experiment"}
              </Button>
              {tqeResult && <JsonBlock data={tqeResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Spacecraft Detection ── */}
        <TabsContent value="sde">
          <Card>
            <CardHeader>
              <CardTitle>Spacecraft Detection</CardTitle>
              <CardDescription>
                Configure space-based QG detection: LISA Pathfinder, DECIGO, Einstein Telescope,
                Cosmic Explorer, space atom interferometry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mission Type</Label>
                  <Select value={sdeType} onValueChange={setSdeType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SPACECRAFT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Arm Length (km)</Label>
                  <Input type="text" value={sdeArmLength} onChange={(e) => setSdeArmLength(e.target.value)} />
                </div>
                <div>
                  <Label>Frequency Band (Hz)</Label>
                  <Input type="text" value={sdeFrequency} onChange={(e) => setSdeFrequency(e.target.value)} />
                </div>
                <div>
                  <Label>Strain Sensitivity</Label>
                  <Input type="text" value={sdeStrain} onChange={(e) => setSdeStrain(e.target.value)} />
                </div>
              </div>
              <Button onClick={runSde} disabled={loadingSde}>
                {loadingSde ? "Computing..." : "Configure Spacecraft Detection"}
              </Button>
              {sdeResult && <JsonBlock data={sdeResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Ion Beam Experiment ── */}
        <TabsContent value="ibe">
          <Card>
            <CardHeader>
              <CardTitle>Ion Beam Experiment</CardTitle>
              <CardDescription>
                Simulate ion beam experiments: RHIC/LHC heavy ion collisions, quark-gluon plasma,
                relativistic heavy ions, ion trap QG, antimatter experiments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Experiment Type</Label>
                  <Select value={ibeType} onValueChange={setIbeType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ION_BEAM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Beam Energy (GeV)</Label>
                  <Input type="number" value={ibeEnergy} onChange={(e) => setIbeEnergy(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Luminosity (cm⁻²s⁻¹)</Label>
                  <Input type="text" value={ibeLuminosity} onChange={(e) => setIbeLuminosity(e.target.value)} />
                </div>
                <div>
                  <Label>Collision Rate (MHz)</Label>
                  <Input type="number" value={ibeRate} onChange={(e) => setIbeRate(e.target.value)} step="1" />
                </div>
              </div>
              <Button onClick={runIbe} disabled={loadingIbe}>
                {loadingIbe ? "Computing..." : "Simulate Ion Beam Experiment"}
              </Button>
              {ibeResult && <JsonBlock data={ibeResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Detector Array ── */}
        <TabsContent value="dae">
          <Card>
            <CardHeader>
              <CardTitle>Detector Array</CardTitle>
              <CardDescription>
                Design multi-detector arrays: GW networks, neutrino telescopes, dark matter arrays,
                axion haloscopes, quantum sensor networks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Detector Type</Label>
                  <Select value={daeType} onValueChange={setDaeType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DETECTOR_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Detector Count</Label>
                  <Input type="number" value={daeCount} onChange={(e) => setDaeCount(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Baseline (km)</Label>
                  <Input type="number" value={daeBaseline} onChange={(e) => setDaeBaseline(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Duty Cycle</Label>
                  <Input type="number" value={daeDutyCycle} onChange={(e) => setDaeDutyCycle(e.target.value)} step="0.01" min="0" max="1" />
                </div>
              </div>
              <Button onClick={runDae} disabled={loadingDae}>
                {loadingDae ? "Computing..." : "Configure Detector Array"}
              </Button>
              {daeResult && <JsonBlock data={daeResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Matter Wave Interferometry ── */}
        <TabsContent value="mre">
          <Card>
            <CardHeader>
              <CardTitle>Matter Wave Interferometry</CardTitle>
              <CardDescription>
                Configure matter wave interferometry: BEC splitting, cold atom fountains,
                dual-species interferometers, large momentum transfer, entangled atom interferometry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Interferometer Type</Label>
                  <Select value={mreType} onValueChange={setMreType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MATTER_WAVE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Atom Number</Label>
                  <Input type="text" value={mreAtomNumber} onChange={(e) => setMreAtomNumber(e.target.value)} />
                </div>
                <div>
                  <Label>Momentum Transfer (ℏk)</Label>
                  <Input type="number" value={mreMomentum} onChange={(e) => setMreMomentum(e.target.value)} step="1" />
                </div>
                <div>
                  <Label>Interrogation Time (s)</Label>
                  <Input type="number" value={mreTime} onChange={(e) => setMreTime(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runMre} disabled={loadingMre}>
                {loadingMre ? "Computing..." : "Configure Matter Wave Interferometry"}
              </Button>
              {mreResult && <JsonBlock data={mreResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Astrophysical Probe ── */}
        <TabsContent value="ase">
          <Card>
            <CardHeader>
              <CardTitle>Astrophysical Probe</CardTitle>
              <CardDescription>
                Design astrophysical QG probes: FRB dispersion, high-energy photon TOF,
                neutrino observations, multi-messenger astronomy, extreme mass-ratio inspirals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Probe Type</Label>
                  <Select value={aseType} onValueChange={setAseType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ASTROPHYSICAL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Energy Range (GeV)</Label>
                  <Input type="text" value={aseEnergy} onChange={(e) => setAseEnergy(e.target.value)} />
                </div>
                <div>
                  <Label>Sky Coverage (fraction)</Label>
                  <Input type="number" value={aseCoverage} onChange={(e) => setAseCoverage(e.target.value)} step="0.01" min="0" max="1" />
                </div>
                <div>
                  <Label>Time Resolution (ms)</Label>
                  <Input type="number" value={aseResolution} onChange={(e) => setAseResolution(e.target.value)} step="0.1" />
                </div>
              </div>
              <Button onClick={runAse} disabled={loadingAse}>
                {loadingAse ? "Computing..." : "Configure Astrophysical Probe"}
              </Button>
              {aseResult && <JsonBlock data={aseResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
