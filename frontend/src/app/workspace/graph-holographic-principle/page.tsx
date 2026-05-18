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

const DUALITY_TYPES = [
  { value: "ads_cft", label: "AdS/CFT 反德西特/共形" },
  { value: "ds_cft", label: "dS/CFT 德西特/共形" },
  { value: "kerr_cft", label: "Kerr/CFT 克尔/共形" },
  { value: "flat_holography", label: "Flat Holography 平坦全息" },
  { value: "wedge_holography", label: "Wedge 楔形全息" },
  { value: "ai_duality", label: "AI-Duality AI对偶" },
];

const BULK_GEOMETRIES = [
  { value: "anti_de_sitter", label: "AdS 反德西特空间" },
  { value: "de_sitter", label: "dS 德西特空间" },
  { value: "schwarzschild_ads", label: "Schwarzschild-AdS 黑洞" },
  { value: "reissner_nordstrom", label: "RN-AdS 带电黑洞" },
  { value: "btz_blackhole", label: "BTZ 2+1维黑洞" },
  { value: "ai_geometry", label: "AI-Geometry AI几何" },
];

const BOUNDARY_THEORIES = [
  { value: "cft_2d", label: "2d CFT 二维共形场论" },
  { value: "nscft", label: "NSCFT 非超对称CFT" },
  { value: "scft", label: "SCFT 超对称CFT" },
  { value: "logarithmic_cft", label: "Log-CFT 对数CFT" },
  { value: "w_cft", label: "W-CFT W-代数CFT" },
  { value: "ai_boundary", label: "AI-Boundary AI边界" },
];

const ENTANGLEMENT_METHODS = [
  { value: "ryu_takayanagi", label: "Ryu-Takayanagi RT公式" },
  { value: "hubeny_rangamani_takayanagi", label: "HRT 协变推广" },
  { value: "quantum_extremal_surface", label: "QES 量子极值面" },
  { value: "entanglement_wedge", label: "E-Wedge 纠缠楔" },
  { value: "petz_map", label: "Petz Map Petz恢复" },
  { value: "ai_entropy", label: "AI-Entropy AI熵" },
];

const CODE_TYPES = [
  { value: "perfect_tensor", label: "Perfect Tensor 完美张量" },
  { value: "random_tensor", label: "Random Tensor 随机张量" },
  { value: "ha_ppy_code", label: "HaPPY Code 全息五边形码" },
  { value: "tensor_network", label: "Tensor Network 张量网络" },
  { value: "merkkt_deboer", label: "MerCKT-deBoer 量子码" },
  { value: "ai_code", label: "AI-Code AI纠错码" },
];

const RECONSTRUCTION_METHODS = [
  { value: "hkll", label: "HKLL 哈密顿重构" },
  { value: "entanglement_wedge_reconstruction", label: "EW Recon 纠缠楔重构" },
  { value: "petz_recovery", label: "Petz Recovery Petz恢复" },
  { value: "subregion_duality", label: "Subregion 子区域对偶" },
  { value: "modularity", label: "Modularity 模流重构" },
  { value: "ai_reconstruction", label: "AI-Recon AI重构" },
];

// ── Helper ─────────────────────────────────────────────────────────────────

const API = "/api/graph/causal-holographic-principle";

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

export default function GraphHolographicPrinciplePage() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Overview
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // Duality
  const [dualType, setDualType] = useState("ads_cft");
  const [dualBoundDim, setDualBoundDim] = useState("4");
  const [dualBulkDim, setDualBulkDim] = useState("5");
  const [dualCentralC, setDualCentralC] = useState("100.0");
  const [dualResult, setDualResult] = useState<unknown>(null);

  // Bulk
  const [bulkGeom, setBulkGeom] = useState("anti_de_sitter");
  const [bulkRadius, setBulkRadius] = useState("1.0");
  const [bulkNewton, setBulkNewton] = useState("0.01");
  const [bulkDim, setBulkDim] = useState("5");
  const [bulkResult, setBulkResult] = useState<unknown>(null);

  // Boundary
  const [bndTheory, setBndTheory] = useState("cft_2d");
  const [bndCentralC, setBndCentralC] = useState("100.0");
  const [bndPrimaries, setBndPrimaries] = useState("6");
  const [bndDim, setBndDim] = useState("2");
  const [bndResult, setBndResult] = useState<unknown>(null);

  // Entanglement
  const [entMethod, setEntMethod] = useState("ryu_takayanagi");
  const [entArea, setEntArea] = useState("10.0");
  const [entNewton, setEntNewton] = useState("0.01");
  const [entCutoff, setEntCutoff] = useState("0.1");
  const [entResult, setEntResult] = useState<unknown>(null);

  // Code
  const [codeType, setCodeType] = useState("ha_ppy_code");
  const [codeLogical, setCodeLogical] = useState("3");
  const [codePhysical, setCodePhysical] = useState("15");
  const [codeDepth, setCodeDepth] = useState("3");
  const [codeResult, setCodeResult] = useState<unknown>(null);

  // Reconstruct
  const [recMethod, setRecMethod] = useState("entanglement_wedge_reconstruction");
  const [recOpDim, setRecOpDim] = useState("2.0");
  const [recPoints, setRecPoints] = useState("6");
  const [recAccuracy, setRecAccuracy] = useState("0.95");
  const [recResult, setRecResult] = useState<unknown>(null);

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

  const fetchDuality = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/duality`, {
        duality_type: dualType,
        boundary_dim: parseInt(dualBoundDim),
        bulk_dim: parseInt(dualBulkDim),
        central_charge: parseFloat(dualCentralC),
      });
      setDualResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchBulk = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/bulk`, {
        geometry: bulkGeom,
        ads_radius: parseFloat(bulkRadius),
        newton_constant: parseFloat(bulkNewton),
        num_dimensions: parseInt(bulkDim),
      });
      setBulkResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoundary = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/boundary`, {
        theory: bndTheory,
        central_charge: parseFloat(bndCentralC),
        num_primaries: parseInt(bndPrimaries),
        spacetime_dim: parseInt(bndDim),
      });
      setBndResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntanglement = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/entanglement`, {
        method: entMethod,
        region_area: parseFloat(entArea),
        newton_constant: parseFloat(entNewton),
        cutoff_scale: parseFloat(entCutoff),
      });
      setEntResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchCode = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/code`, {
        code_type: codeType,
        num_logical_qubits: parseInt(codeLogical),
        num_physical_qubits: parseInt(codePhysical),
        code_depth: parseInt(codeDepth),
      });
      setCodeResult(data);
    } finally {
      setLoading(false);
    }
  };

  const fetchReconstruct = async () => {
    setLoading(true);
    try {
      const data = await postJSON(`${API}/reconstruct`, {
        method: recMethod,
        operator_dim: parseFloat(recOpDim),
        boundary_points: parseInt(recPoints),
        accuracy: parseFloat(recAccuracy),
      });
      setRecResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Causal Holographic Principle Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            因果全息原理与AdS/CFT对偶引擎 — Layer 48 (v1.296)
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          6^6 = 46,656 configurations
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="duality">Duality</TabsTrigger>
          <TabsTrigger value="bulk">Bulk</TabsTrigger>
          <TabsTrigger value="boundary">Boundary</TabsTrigger>
          <TabsTrigger value="entanglement">Entangle</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="reconstruct">Recon</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ──────────────────────────────────────── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Causal Holographic Principle Engine — boundary QFT encodes bulk
                gravity via AdS/CFT duality, entanglement = geometry (ER = EPR)
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

        {/* ── Duality Tab ───────────────────────────────────────── */}
        <TabsContent value="duality">
          <Card>
            <CardHeader>
              <CardTitle>Holographic Duality 全息对偶</CardTitle>
              <CardDescription>
                Compute holographic duality structure — AdS/CFT, dS/CFT,
                Kerr/CFT, flat holography with GKPW dictionary and operator mapping
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duality Type</Label>
                  <Select value={dualType} onValueChange={setDualType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DUALITY_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Central Charge (C)</Label>
                  <Input type="number" step="10" value={dualCentralC} onChange={(e) => setDualCentralC(e.target.value)} />
                </div>
                <div>
                  <Label>Boundary Dimension</Label>
                  <Input type="number" value={dualBoundDim} onChange={(e) => setDualBoundDim(e.target.value)} />
                </div>
                <div>
                  <Label>Bulk Dimension</Label>
                  <Input type="number" value={dualBulkDim} onChange={(e) => setDualBulkDim(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchDuality} disabled={loading}>
                {loading ? "Computing..." : "Compute Holographic Duality"}
              </Button>
              {dualResult && <JsonBlock data={dualResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Bulk Tab ──────────────────────────────────────────── */}
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Geometry 体几何</CardTitle>
              <CardDescription>
                Compute bulk spacetime geometry — AdS, dS, Schwarzschild-AdS,
                Reissner-Nordström, BTZ black hole with metric and thermodynamics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bulk Geometry</Label>
                  <Select value={bulkGeom} onValueChange={setBulkGeom}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BULK_GEOMETRIES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>AdS Radius (L)</Label>
                  <Input type="number" step="0.1" value={bulkRadius} onChange={(e) => setBulkRadius(e.target.value)} />
                </div>
                <div>
                  <Label>Newton Constant (G_N)</Label>
                  <Input type="number" step="0.001" value={bulkNewton} onChange={(e) => setBulkNewton(e.target.value)} />
                </div>
                <div>
                  <Label>Dimensions</Label>
                  <Input type="number" value={bulkDim} onChange={(e) => setBulkDim(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchBulk} disabled={loading}>
                {loading ? "Computing..." : "Compute Bulk Geometry"}
              </Button>
              {bulkResult && <JsonBlock data={bulkResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Boundary Tab ──────────────────────────────────────── */}
        <TabsContent value="boundary">
          <Card>
            <CardHeader>
              <CardTitle>Boundary CFT 边界共形场论</CardTitle>
              <CardDescription>
                Compute boundary conformal field theory — 2d CFT, SCFT,
                logarithmic CFT, W-CFT with Virasoro algebra and bootstrap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Boundary Theory</Label>
                  <Select value={bndTheory} onValueChange={setBndTheory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BOUNDARY_THEORIES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Central Charge (c)</Label>
                  <Input type="number" step="10" value={bndCentralC} onChange={(e) => setBndCentralC(e.target.value)} />
                </div>
                <div>
                  <Label>Primary Operators</Label>
                  <Input type="number" value={bndPrimaries} onChange={(e) => setBndPrimaries(e.target.value)} />
                </div>
                <div>
                  <Label>Spacetime Dimension</Label>
                  <Input type="number" value={bndDim} onChange={(e) => setBndDim(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchBoundary} disabled={loading}>
                {loading ? "Computing..." : "Compute Boundary CFT"}
              </Button>
              {bndResult && <JsonBlock data={bndResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Entanglement Tab ──────────────────────────────────── */}
        <TabsContent value="entanglement">
          <Card>
            <CardHeader>
              <CardTitle>Entanglement Entropy 纠缠熵</CardTitle>
              <CardDescription>
                Compute entanglement entropy via holographic methods —
                Ryu-Takayanagi S = Area/(4G_N), HRT, quantum extremal surface,
                entanglement wedge with quantum corrections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Computation Method</Label>
                  <Select value={entMethod} onValueChange={setEntMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ENTANGLEMENT_METHODS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Region Area</Label>
                  <Input type="number" step="1.0" value={entArea} onChange={(e) => setEntArea(e.target.value)} />
                </div>
                <div>
                  <Label>Newton Constant (G_N)</Label>
                  <Input type="number" step="0.001" value={entNewton} onChange={(e) => setEntNewton(e.target.value)} />
                </div>
                <div>
                  <Label>UV Cutoff (ε)</Label>
                  <Input type="number" step="0.01" value={entCutoff} onChange={(e) => setEntCutoff(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchEntanglement} disabled={loading}>
                {loading ? "Computing..." : "Compute Entanglement Entropy"}
              </Button>
              {entResult && <JsonBlock data={entResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Code Tab ──────────────────────────────────────────── */}
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>Holographic Code 全息量子码</CardTitle>
              <CardDescription>
                Compute holographic quantum error correction code — perfect tensor,
                HaPPY code, tensor networks, AdS/MERA correspondence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Code Type</Label>
                  <Select value={codeType} onValueChange={setCodeType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CODE_TYPES.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Logical Qubits (k)</Label>
                  <Input type="number" value={codeLogical} onChange={(e) => setCodeLogical(e.target.value)} />
                </div>
                <div>
                  <Label>Physical Qubits (n)</Label>
                  <Input type="number" value={codePhysical} onChange={(e) => setCodePhysical(e.target.value)} />
                </div>
                <div>
                  <Label>Code Depth (d)</Label>
                  <Input type="number" value={codeDepth} onChange={(e) => setCodeDepth(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchCode} disabled={loading}>
                {loading ? "Encoding..." : "Compute Holographic Code"}
              </Button>
              {codeResult && <JsonBlock data={codeResult} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Reconstruct Tab ───────────────────────────────────── */}
        <TabsContent value="reconstruct">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Reconstruction 体重构</CardTitle>
              <CardDescription>
                Reconstruct bulk operators from boundary data — HKLL smearing
                function, entanglement wedge reconstruction, Petz recovery map,
                subregion duality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reconstruction Method</Label>
                  <Select value={recMethod} onValueChange={setRecMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RECONSTRUCTION_METHODS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Operator Dimension (Δ)</Label>
                  <Input type="number" step="0.5" value={recOpDim} onChange={(e) => setRecOpDim(e.target.value)} />
                </div>
                <div>
                  <Label>Boundary Points</Label>
                  <Input type="number" value={recPoints} onChange={(e) => setRecPoints(e.target.value)} />
                </div>
                <div>
                  <Label>Target Accuracy</Label>
                  <Input type="number" step="0.01" value={recAccuracy} onChange={(e) => setRecAccuracy(e.target.value)} />
                </div>
              </div>
              <Button onClick={fetchReconstruct} disabled={loading}>
                {loading ? "Reconstructing..." : "Reconstruct Bulk Operators"}
              </Button>
              {recResult && <JsonBlock data={recResult} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
