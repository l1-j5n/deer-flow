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

const PATH_INTEGRAL_TYPES = [
  { value: "feynman", label: "Feynman 费曼路径积分" },
  { value: "euclidean", label: "Euclidean 欧几里得" },
  { value: "hamiltonian", label: "Hamiltonian 哈密顿" },
  { value: "lattice", label: "Lattice 格点" },
  { value: "coherent_state", label: "Coherent State 相干态" },
  { value: "ai_sampling", label: "AI-Sampling AI采样" },
];

const GAUGE_GROUPS = [
  { value: "u1", label: "U(1) 电磁规范" },
  { value: "su2", label: "SU(2) 弱相互作用" },
  { value: "su3", label: "SU(3) 强相互作用" },
  { value: "so_n", label: "SO(N) 正交群" },
  { value: "exceptional", label: "Exceptional 例外群" },
  { value: "ai_gauge", label: "AI-Gauge AI规范" },
];

const PROPAGATOR_TYPES = [
  { value: "retarded", label: "Retarded 推迟格林函数" },
  { value: "advanced", label: "Advanced 超前格林函数" },
  { value: "feynman", label: "Feynman 费曼传播子" },
  { value: "hadamard", label: "Hadamard 阿达马" },
  { value: "pauli_villars", label: "Pauli-Villars 正则化" },
  { value: "ai_propagator", label: "AI-Propagator AI传播子" },
];

const VACUUM_TYPES = [
  { value: "unique_vacuum", label: "Unique 唯一真空" },
  { value: "spontaneous_symmetry", label: "SSB 自发对称破缺" },
  { value: "theta_vacuum", label: "θ-Vacuum θ真空" },
  { value: "instanton", label: "Instanton 瞬子" },
  { value: "false_vacuum", label: "False Vacuum 亚稳真空" },
  { value: "ai_vacuum", label: "AI-Vacuum AI真空" },
];

const SCATTERING_TYPES = [
  { value: "tree_level", label: "Tree Level 树图" },
  { value: "one_loop", label: "One Loop 单圈" },
  { value: "born_approx", label: "Born Approx 玻恩近似" },
  { value: "lsz_reduction", label: "LSZ Reduction LSZ约化" },
  { value: "optical_theorem", label: "Optical Theorem 光学定理" },
  { value: "ai_scattering", label: "AI-Scattering AI散射" },
];

const RENORM_SCHEMES = [
  { value: "on_shell", label: "On-Shell 在壳" },
  { value: "ms_bar", label: "MS-bar 修改最小减除" },
  { value: "mom", label: "MOM 动量减除" },
  { value: "dim_reg", label: "Dim Reg 维度正规化" },
  { value: "lattice_reg", label: "Lattice Reg 格点正规化" },
  { value: "ai_scheme", label: "AI-Scheme AI方案" },
];

// ── Helper ─────────────────────────────────────────────────────────────────

const API = "/api/graph/causal-quantum-field-theory";

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

export default function GraphQuantumFieldTheoryPage() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Overview
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // Path Integral
  const [piType, setPiType] = useState("feynman");
  const [piAction, setPiAction] = useState("φ⁴ theory: S = ∫d⁴x [½(∂φ)² - ½m²φ² - λ/4! φ⁴]");
  const [piDim, setPiDim] = useState("4");
  const [piConfigs, setPiConfigs] = useState("8");
  const [piResult, setPiResult] = useState<unknown>(null);

  // Gauge
  const [gaugeGroup, setGaugeGroup] = useState("su3");
  const [gaugeCoupling, setGaugeCoupling] = useState("0.3");
  const [gaugeDim, setGaugeDim] = useState("4");
  const [gaugeGenerators, setGaugeGenerators] = useState("8");
  const [gaugeResult, setGaugeResult] = useState<unknown>(null);

  // Propagator
  const [propType, setPropType] = useState("feynman");
  const [propMass, setPropMass] = useState("0.5");
  const [propCutoff, setPropCutoff] = useState("10.0");
  const [propDim, setPropDim] = useState("4");
  const [propResult, setPropResult] = useState<unknown>(null);

  // Vacuum
  const [vacType, setVacType] = useState("spontaneous_symmetry");
  const [vacPotential, setVacPotential] = useState("Mexican hat: V = -μ²|φ|²/2 + λ|φ|⁴/4");
  const [vacDim, setVacDim] = useState("4");
  const [vacTemp, setVacTemp] = useState("0.0");
  const [vacResult, setVacResult] = useState<unknown>(null);

  // Scattering
  const [scatType, setScatType] = useState("tree_level");
  const [scatEnergy, setScatEnergy] = useState("10.0");
  const [scatParticles, setScatParticles] = useState("4");
  const [scatCoupling, setScatCoupling] = useState("0.3");
  const [scatResult, setScatResult] = useState<unknown>(null);

  // Renormalize
  const [renScheme, setRenScheme] = useState("ms_bar");
  const [renCoupling, setRenCoupling] = useState("0.3");
  const [renScale, setRenScale] = useState("91.2");
  const [renFields, setRenFields] = useState("4");
  const [renResult, setRenResult] = useState<unknown>(null);

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

  const fetchPathIntegral = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/pathintegral`, {
        pi_type: piType,
        action: piAction,
        spacetime_dim: parseInt(piDim),
        num_configs: parseInt(piConfigs),
      });
      setPiResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchGauge = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/gauge`, {
        gauge_group: gaugeGroup,
        coupling_g: parseFloat(gaugeCoupling),
        spacetime_dim: parseInt(gaugeDim),
        num_generators: parseInt(gaugeGenerators),
      });
      setGaugeResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropagator = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/propagator`, {
        propagator_type: propType,
        mass: parseFloat(propMass),
        momentum_cutoff: parseFloat(propCutoff),
        spacetime_dim: parseInt(propDim),
      });
      setPropResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchVacuum = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/vacuum`, {
        vacuum_type: vacType,
        potential_type: vacPotential,
        spacetime_dim: parseInt(vacDim),
        temperature: parseFloat(vacTemp),
      });
      setVacResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchScattering = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/scattering`, {
        scattering_type: scatType,
        energy: parseFloat(scatEnergy),
        num_particles: parseInt(scatParticles),
        coupling: parseFloat(scatCoupling),
      });
      setScatResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchRenormalize = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/renormalize`, {
        scheme: renScheme,
        coupling: parseFloat(renCoupling),
        scale: parseFloat(renScale),
        num_fields: parseInt(renFields),
      });
      setRenResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Causal Quantum Field Theory Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            因果量子场论与规范不变性引擎 — Layer 47 (v1.295)
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          6^6 = 46,656 configurations
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pathintegral">Path Int</TabsTrigger>
          <TabsTrigger value="gauge">Gauge</TabsTrigger>
          <TabsTrigger value="propagator">Propagator</TabsTrigger>
          <TabsTrigger value="vacuum">Vacuum</TabsTrigger>
          <TabsTrigger value="scattering">Scattering</TabsTrigger>
          <TabsTrigger value="renormalize">Renorm</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ──────────────────────────────────────── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Causal Quantum Field Theory Engine — quantum version of causal
                structures with gauge invariance and path integral formulation
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

        {/* ── Path Integral Tab ─────────────────────────────────── */}
        <TabsContent value="pathintegral">
          <Card>
            <CardHeader>
              <CardTitle>Path Integral 路径积分</CardTitle>
              <CardDescription>
                Compute path integral via sum-over-histories for causal field
                configurations — Feynman, Euclidean, Hamiltonian, Lattice,
                Coherent State, AI-Sampling formulations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Path Integral Type</Label>
                  <Select value={piType} onValueChange={setPiType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PATH_INTEGRAL_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Spacetime Dimension</Label>
                  <Input type="number" value={piDim} onChange={(e) => setPiDim(e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Label>Action</Label>
                  <Input value={piAction} onChange={(e) => setPiAction(e.target.value)} />
                </div>
                <div>
                  <Label>Field Configurations</Label>
                  <Input type="number" value={piConfigs} onChange={(e) => setPiConfigs(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchPathIntegral} disabled={loading}>
                {loading ? "Integrating..." : "Compute Path Integral"}
              </Button>
              {piResult && <JsonBlock data={piResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Gauge Tab ─────────────────────────────────────────── */}
        <TabsContent value="gauge">
          <Card>
            <CardHeader>
              <CardTitle>Gauge Theory 规范理论</CardTitle>
              <CardDescription>
                Compute gauge theory structure for causal invariance — U(1),
                SU(2), SU(3), SO(N), exceptional groups with Yang-Mills action
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Gauge Group</Label>
                  <Select value={gaugeGroup} onValueChange={setGaugeGroup}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GAUGE_GROUPS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coupling g</Label>
                  <Input type="number" step="0.05" value={gaugeCoupling} onChange={(e) => setGaugeCoupling(e.target.value)} />
                </div>
                <div>
                  <Label>Spacetime Dimension</Label>
                  <Input type="number" value={gaugeDim} onChange={(e) => setGaugeDim(e.target.value)} />
                </div>
                <div>
                  <Label>Generators</Label>
                  <Input type="number" value={gaugeGenerators} onChange={(e) => setGaugeGenerators(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchGauge} disabled={loading}>
                {loading ? "Computing..." : "Compute Gauge Structure"}
              </Button>
              {gaugeResult && <JsonBlock data={gaugeResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Propagator Tab ────────────────────────────────────── */}
        <TabsContent value="propagator">
          <Card>
            <CardHeader>
              <CardTitle>Propagator 传播子</CardTitle>
              <CardDescription>
                Compute causal propagators / Green functions — retarded,
                advanced, Feynman, Hadamard, Pauli-Villars with momentum-space
                and position-space representations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Propagator Type</Label>
                  <Select value={propType} onValueChange={setPropType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPAGATOR_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mass (m)</Label>
                  <Input type="number" step="0.1" value={propMass} onChange={(e) => setPropMass(e.target.value)} />
                </div>
                <div>
                  <Label>Momentum Cutoff (Λ)</Label>
                  <Input type="number" step="1.0" value={propCutoff} onChange={(e) => setPropCutoff(e.target.value)} />
                </div>
                <div>
                  <Label>Spacetime Dimension</Label>
                  <Input type="number" value={propDim} onChange={(e) => setPropDim(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchPropagator} disabled={loading}>
                {loading ? "Propagating..." : "Compute Propagator"}
              </Button>
              {propResult && <JsonBlock data={propResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Vacuum Tab ────────────────────────────────────────── */}
        <TabsContent value="vacuum">
          <Card>
            <CardHeader>
              <CardTitle>Vacuum 真空结构</CardTitle>
              <CardDescription>
                Analyze vacuum structure — unique, spontaneous symmetry breaking,
                θ-vacuum, instanton, false vacuum with effective potential and
                tunneling analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vacuum Type</Label>
                  <Select value={vacType} onValueChange={setVacType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VACUUM_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Temperature (T)</Label>
                  <Input type="number" step="0.1" value={vacTemp} onChange={(e) => setVacTemp(e.target.value)} />
                </div>
                <div>
                  <Label>Spacetime Dimension</Label>
                  <Input type="number" value={vacDim} onChange={(e) => setVacDim(e.target.value)} />
                </div>
                <div>
                  <Label>Potential Type</Label>
                  <Input value={vacPotential} onChange={(e) => setVacPotential(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchVacuum} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze Vacuum"}
              </Button>
              {vacResult && <JsonBlock data={vacResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Scattering Tab ────────────────────────────────────── */}
        <TabsContent value="scattering">
          <Card>
            <CardHeader>
              <CardTitle>Scattering 散射振幅</CardTitle>
              <CardDescription>
                Compute scattering amplitudes — tree-level, one-loop, Born
                approximation, LSZ reduction, optical theorem with Mandelstam
                variables and helicity amplitudes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Scattering Type</Label>
                  <Select value={scatType} onValueChange={setScatType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SCATTERING_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Center-of-Mass Energy (√s)</Label>
                  <Input type="number" step="1.0" value={scatEnergy} onChange={(e) => setScatEnergy(e.target.value)} />
                </div>
                <div>
                  <Label>External Particles</Label>
                  <Input type="number" value={scatParticles} onChange={(e) => setScatParticles(e.target.value)} />
                </div>
                <div>
                  <Label>Coupling (g)</Label>
                  <Input type="number" step="0.05" value={scatCoupling} onChange={(e) => setScatCoupling(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchScattering} disabled={loading}>
                {loading ? "Scattering..." : "Compute Scattering Amplitude"}
              </Button>
              {scatResult && <JsonBlock data={scatResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Renormalize Tab ───────────────────────────────────── */}
        <TabsContent value="renormalize">
          <Card>
            <CardHeader>
              <CardTitle>Renormalization 重正化</CardTitle>
              <CardDescription>
                Compute renormalization connecting to Layer 46 RG flows —
                on-shell, MS-bar, MOM, dimensional regularization, lattice
                with counterterm and beta function analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Renormalization Scheme</Label>
                  <Select value={renScheme} onValueChange={setRenScheme}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RENORM_SCHEMES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coupling (g)</Label>
                  <Input type="number" step="0.05" value={renCoupling} onChange={(e) => setRenCoupling(e.target.value)} />
                </div>
                <div>
                  <Label>Scale μ (GeV)</Label>
                  <Input type="number" step="1.0" value={renScale} onChange={(e) => setRenScale(e.target.value)} />
                </div>
                <div>
                  <Label>Number of Fields</Label>
                  <Input type="number" value={renFields} onChange={(e) => setRenFields(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchRenormalize} disabled={loading}>
                {loading ? "Renormalizing..." : "Compute Renormalization"}
              </Button>
              {renResult && <JsonBlock data={renResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
