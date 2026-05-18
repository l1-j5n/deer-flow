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

const KNOT_TYPES = [
  { value: "jones", label: "Jones 琼斯多项式" },
  { value: "homfly_pt", label: "HOMFLY-PT 多项式" },
  { value: "alexander", label: "Alexander 亚历山大" },
  { value: "kauffman", label: "Kauffman 考夫曼" },
  { value: "vassiliev", label: "Vassiliev 有限型" },
  { value: "ai_knot", label: "AI-Knot AI纽结" },
];

const CS_ACTION_TYPES = [
  { value: "abelian", label: "Abelian 阿贝尔CS" },
  { value: "su2", label: "SU(2) 陈-西蒙斯" },
  { value: "su_n", label: "SU(N) 陈-西蒙斯" },
  { value: "bf_theory", label: "BF Theory BF理论" },
  { value: "supersymmetric", label: "SUSY CS 超对称" },
  { value: "ai_chern_simons", label: "AI-CS AI陈-西蒙斯" },
];

const TQFT_TYPES = [
  { value: "atiyah", label: "Atiyah 公理体系" },
  { value: "reshetikhin_turaev", label: "Reshetikhin-Turaev RT" },
  { value: "turaev_viro", label: "Turaev-Viro TV" },
  { value: "extended", label: "Extended 扩展TQFT" },
  { value: "state_sum", label: "State-Sum 态和" },
  { value: "ai_tqft", label: "AI-TQFT AI拓扑" },
];

const WILSON_TYPES = [
  { value: "loop", label: "Wilson Loop 环" },
  { value: "network", label: "Spin Network 自旋网络" },
  { value: "surface", label: "Surface 面观测量" },
  { value: "volume", label: "Volume 体观测量" },
  { value: "graph_op", label: "Graph Operator 图算子" },
  { value: "ai_wilson", label: "AI-Wilson AI观测量" },
];

const BRAIDING_TYPES = [
  { value: "yang_baxter", label: "Yang-Baxter YBE" },
  { value: "r_matrix", label: "R-Matrix R矩阵" },
  { value: "quantum_group", label: "Quantum Group 量子群" },
  { value: "braid_group", label: "Braid Group 辫群" },
  { value: "modular_tensor", label: "Modular Tensor 模张量" },
  { value: "ai_braiding", label: "AI-Braiding AI编织" },
];

const PHASE_TYPES = [
  { value: "integer_qh", label: "Integer QH 整数量子霍尔" },
  { value: "fractional_qh", label: "Fractional QH 分数量子霍尔" },
  { value: "topo_insulator", label: "Topo Insulator 拓扑绝缘体" },
  { value: "topo_superconductor", label: "Topo SC 拓扑超导体" },
  { value: "anyonic", label: "Anyonic 任意子态" },
  { value: "ai_topo_phase", label: "AI-Phase AI拓扑相" },
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

export default function ChernSimonsPage() {
  const [tab, setTab] = useState("overview");

  // Overview
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Knot
  const [knotType, setKnotType] = useState("jones");
  const [crossingNum, setCrossingNum] = useState("6");
  const [nStrands, setNStrands] = useState("2");
  const [knotResult, setKnotResult] = useState<unknown>(null);
  const [loadingKnot, setLoadingKnot] = useState(false);

  // CS Action
  const [csType, setCsType] = useState("su2");
  const [levelK, setLevelK] = useState("5");
  const [manifoldDim, setManifoldDim] = useState("3");
  const [actionResult, setActionResult] = useState<unknown>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // TQFT
  const [tqftType, setTqftType] = useState("atiyah");
  const [nObjects, setNObjects] = useState("4");
  const [catDim, setCatDim] = useState("3");
  const [tqftResult, setTqftResult] = useState<unknown>(null);
  const [loadingTqft, setLoadingTqft] = useState(false);

  // Wilson
  const [wilsonType, setWilsonType] = useState("loop");
  const [repDim, setRepDim] = useState("3");
  const [loopLen, setLoopLen] = useState("12");
  const [wilsonResult, setWilsonResult] = useState<unknown>(null);
  const [loadingWilson, setLoadingWilson] = useState(false);

  // Braiding
  const [braidType, setBraidType] = useState("yang_baxter");
  const [braidStrands, setBraidStrands] = useState("4");
  const [braidCrossings, setBraidCrossings] = useState("8");
  const [braidingResult, setBraidingResult] = useState<unknown>(null);
  const [loadingBraiding, setLoadingBraiding] = useState(false);

  // Phase
  const [phaseType, setPhaseType] = useState("integer_qh");
  const [bandIdx, setBandIdx] = useState("2");
  const [nBands, setNBands] = useState("4");
  const [phaseResult, setPhaseResult] = useState<unknown>(null);
  const [loadingPhase, setLoadingPhase] = useState(false);

  // ── Fetch helpers ──────────────────────────────────────────────────────

  async function fetchOverview() {
    setLoadingOverview(true);
    try {
      const r = await fetch(`${API_BASE}/graph/chern-simons/overview`);
      const d = await r.json();
      setOverview(d);
    } catch (e) { console.error(e); }
    setLoadingOverview(false);
  }

  async function fetchKnot() {
    setLoadingKnot(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/chern-simons/knot?knot_type=${knotType}&crossing_number=${crossingNum}&n_strands=${nStrands}`,
        { method: "POST" }
      );
      setKnotResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingKnot(false);
  }

  async function fetchAction() {
    setLoadingAction(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/chern-simons/action?cs_type=${csType}&level_k=${levelK}&manifold_dim=${manifoldDim}`,
        { method: "POST" }
      );
      setActionResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingAction(false);
  }

  async function fetchTqft() {
    setLoadingTqft(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/chern-simons/tqft?tqft_type=${tqftType}&n_objects=${nObjects}&category_dim=${catDim}`,
        { method: "POST" }
      );
      setTqftResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingTqft(false);
  }

  async function fetchWilson() {
    setLoadingWilson(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/chern-simons/wilson?wilson_type=${wilsonType}&representation_dim=${repDim}&loop_length=${loopLen}`,
        { method: "POST" }
      );
      setWilsonResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingWilson(false);
  }

  async function fetchBraiding() {
    setLoadingBraiding(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/chern-simons/braiding?braid_type=${braidType}&n_strands=${braidStrands}&n_crossings=${braidCrossings}`,
        { method: "POST" }
      );
      setBraidingResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingBraiding(false);
  }

  async function fetchPhase() {
    setLoadingPhase(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/chern-simons/phase?phase_type=${phaseType}&band_index=${bandIdx}&n_bands=${nBands}`,
        { method: "POST" }
      );
      setPhaseResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingPhase(false);
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

  // ── Knot Tab ────────────────────────────────────────────────────────────

  function KnotTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Knot Invariants 纽结不变量</CardTitle>
            <CardDescription>Jones / HOMFLY-PT / Alexander / Kauffman / Vassiliev</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Knot Type</Label>
                <Select value={knotType} onValueChange={setKnotType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KNOT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Crossing Number</Label>
                <Input type="number" min={1} max={50} value={crossingNum} onChange={(e) => setCrossingNum(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">N Strands</Label>
                <Input type="number" min={1} max={20} value={nStrands} onChange={(e) => setNStrands(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchKnot} disabled={loadingKnot}>
              {loadingKnot ? "Computing..." : "Compute Knot 计算纽结"}
            </Button>
          </CardContent>
        </Card>
        {knotResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Knot Result 纽结结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={knotResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── CS Action Tab ───────────────────────────────────────────────────────

  function ActionTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Chern-Simons Action 陈-西蒙斯作用量</CardTitle>
            <CardDescription>S_CS = k/4π ∫ Tr(A∧dA + ⅔ A∧A∧A)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">CS Type</Label>
                <Select value={csType} onValueChange={setCsType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CS_ACTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Level k</Label>
                <Input type="number" min={1} max={100} value={levelK} onChange={(e) => setLevelK(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Manifold Dim</Label>
                <Input type="number" min={2} max={10} value={manifoldDim} onChange={(e) => setManifoldDim(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchAction} disabled={loadingAction}>
              {loadingAction ? "Computing..." : "Compute Action 计算作用量"}
            </Button>
          </CardContent>
        </Card>
        {actionResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Action Result 作用量结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={actionResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── TQFT Tab ────────────────────────────────────────────────────────────

  function TqftTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Topological QFT 拓扑量子场论</CardTitle>
            <CardDescription>Functors: Bord_n → Vect — Atiyah / RT / TV axioms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">TQFT Type</Label>
                <Select value={tqftType} onValueChange={setTqftType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TQFT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">N Objects</Label>
                <Input type="number" min={1} max={30} value={nObjects} onChange={(e) => setNObjects(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Category Dim</Label>
                <Input type="number" min={1} max={6} value={catDim} onChange={(e) => setCatDim(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchTqft} disabled={loadingTqft}>
              {loadingTqft ? "Computing..." : "Compute TQFT 计算拓扑场论"}
            </Button>
          </CardContent>
        </Card>
        {tqftResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">TQFT Result 拓扑场论结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={tqftResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Wilson Tab ──────────────────────────────────────────────────────────

  function WilsonTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Wilson Observables Wilson观测量</CardTitle>
            <CardDescription>W_R(C) = Tr_R P exp(∮_C A) — Loop / Network / Surface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Observable Type</Label>
                <Select value={wilsonType} onValueChange={setWilsonType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WILSON_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Representation Dim</Label>
                <Input type="number" min={1} max={20} value={repDim} onChange={(e) => setRepDim(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Loop Length</Label>
                <Input type="number" min={3} max={200} value={loopLen} onChange={(e) => setLoopLen(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchWilson} disabled={loadingWilson}>
              {loadingWilson ? "Computing..." : "Compute Wilson 计算观测量"}
            </Button>
          </CardContent>
        </Card>
        {wilsonResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Wilson Result 观测量结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={wilsonResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Braiding Tab ────────────────────────────────────────────────────────

  function BraidingTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Braiding Operations 编织操作</CardTitle>
            <CardDescription>R₁₂R₁₃R₂₃ = R₂₃R₁₃R₁₂ — Yang-Baxter / Quantum Groups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Braiding Type</Label>
                <Select value={braidType} onValueChange={setBraidType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BRAIDING_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">N Strands</Label>
                <Input type="number" min={2} max={20} value={braidStrands} onChange={(e) => setBraidStrands(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">N Crossings</Label>
                <Input type="number" min={1} max={100} value={braidCrossings} onChange={(e) => setBraidCrossings(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchBraiding} disabled={loadingBraiding}>
              {loadingBraiding ? "Computing..." : "Compute Braiding 计算编织"}
            </Button>
          </CardContent>
        </Card>
        {braidingResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Braiding Result 编织结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={braidingResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Phase Tab ───────────────────────────────────────────────────────────

  function PhaseTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Topological Phases 拓扑相</CardTitle>
            <CardDescription>Integer QH / Fractional QH / Topological Insulators / Anyons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Phase Type</Label>
                <Select value={phaseType} onValueChange={setPhaseType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PHASE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Band Index</Label>
                <Input type="number" min={1} max={20} value={bandIdx} onChange={(e) => setBandIdx(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">N Bands</Label>
                <Input type="number" min={1} max={30} value={nBands} onChange={(e) => setNBands(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchPhase} disabled={loadingPhase}>
              {loadingPhase ? "Computing..." : "Compute Phase 计算拓扑相"}
            </Button>
          </CardContent>
        </Card>
        {phaseResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Phase Result 拓扑相结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={phaseResult} />
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
        <h1 className="text-2xl font-bold">Causal Chern-Simons &amp; TQFT</h1>
        <Badge variant="outline">Layer 55</Badge>
        <Badge variant="secondary">v1.303.0</Badge>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl">
        因果陈-西蒙斯理论与拓扑量子场论引擎 — CS(A)=k/4π∫Tr(A∧dA+⅔A³), Jones polynomial V_K(q),
        braid group B_n, Yang-Baxter equation, topological phases, quantum Hall, anyons, bulk-boundary correspondence
      </p>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-7 w-full max-w-3xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="knot">Knot</TabsTrigger>
          <TabsTrigger value="action">CS Act</TabsTrigger>
          <TabsTrigger value="tqft">TQFT</TabsTrigger>
          <TabsTrigger value="wilson">Wilson</TabsTrigger>
          <TabsTrigger value="braiding">Braid</TabsTrigger>
          <TabsTrigger value="phase">Phase</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="knot"><KnotTab /></TabsContent>
        <TabsContent value="action"><ActionTab /></TabsContent>
        <TabsContent value="tqft"><TqftTab /></TabsContent>
        <TabsContent value="wilson"><WilsonTab /></TabsContent>
        <TabsContent value="braiding"><BraidingTab /></TabsContent>
        <TabsContent value="phase"><PhaseTab /></TabsContent>
      </Tabs>
    </div>
  );
}
