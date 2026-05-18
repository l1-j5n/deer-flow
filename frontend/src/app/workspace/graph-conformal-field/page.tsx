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

const VIRASORO_TYPES = [
  { value: "highest_weight", label: "Highest Weight 最高权" },
  { value: "minimal_model", label: "Minimal 极小模型" },
  { value: "logarithmic", label: "Logarithmic 对数" },
  { value: "null_state", label: "Null State 零态" },
  { value: "kac_moody", label: "Kac-Moody 仿射" },
  { value: "ai_virasoro", label: "AI-Virasoro AI维拉索罗" },
];

const OPE_TYPES = [
  { value: "primary_field", label: "Primary 场本原场" },
  { value: "descendant", label: "Descendant 后裔场" },
  { value: "stress_tensor", label: "Stress Tensor 能量动量张量" },
  { value: "current_algebra", label: "Current 流代数" },
  { value: "twist_field", label: "Twist 扭场" },
  { value: "ai_ope", label: "AI-OPE AI算子积" },
];

const MODULAR_TYPES = [
  { value: "dedekind_eta", label: "Dedekind η 戴德金η" },
  { value: "theta_function", label: "Theta θ函数" },
  { value: "partition_function", label: "Partition Z 配分函数" },
  { value: "character", label: "Character χ 特征标" },
  { value: "modular_tensor", label: "Modular Tensor 模张量" },
  { value: "ai_modular", label: "AI-Modular AI模形式" },
];

const BLOCK_TYPES = [
  { value: "sphere_4pt", label: "Sphere 4pt 球面4点" },
  { value: "torus_1pt", label: "Torus 1pt 环面1点" },
  { value: "genus_g", label: "Genus-g 高亏格" },
  { value: "fusion_kernel", label: "Fusion Kernel 融合核" },
  { value: "crossing_kernel", label: "Crossing Kernel 交叉核" },
  { value: "ai_conformal", label: "AI-Block AI共形块" },
];

const CHARGE_TYPES = [
  { value: "free_boson", label: "Free Boson c=1 自由玻色子" },
  { value: "minimal_model_c", label: "Minimal c<1 极小模型" },
  { value: "wzw_model", label: "WZW Model WZW模型" },
  { value: "liouville", label: "Liouville 刘维尔" },
  { value: "monster_cft", label: "Monster c=24 怪物CFT" },
  { value: "ai_central", label: "AI-Charge AI中心荷" },
];

const RCFT_TYPES = [
  { value: "ising_model", label: "Ising c=1/2 伊辛模型" },
  { value: "potts_model", label: "Potts c=4/5 波茨模型" },
  { value: "wzw_su2", label: "WZW SU(2)_k WZW模型" },
  { value: "parafermion", label: "Parafermion Z_k 仲费米子" },
  { value: "coset_model", label: "Coset GKO 陪集模型" },
  { value: "ai_rcft", label: "AI-RCFT AI有理CFT" },
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

export default function ConformalFieldPage() {
  const [tab, setTab] = useState("overview");

  // Overview
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Virasoro
  const [repType, setRepType] = useState("highest_weight");
  const [centralCharge, setCentralCharge] = useState("0.5");
  const [maxLevel, setMaxLevel] = useState("4");
  const [virasoroResult, setVirasoroResult] = useState<unknown>(null);
  const [loadingVirasoro, setLoadingVirasoro] = useState(false);

  // OPE
  const [opeType, setOpeType] = useState("primary_field");
  const [dimension, setDimension] = useState("1.0");
  const [spin, setSpin] = useState("0");
  const [opeResult, setOpeResult] = useState<unknown>(null);
  const [loadingOpe, setLoadingOpe] = useState(false);

  // Modular
  const [modType, setModType] = useState("dedekind_eta");
  const [weightK, setWeightK] = useState("2");
  const [levelN, setLevelN] = useState("1");
  const [modularResult, setModularResult] = useState<unknown>(null);
  const [loadingModular, setLoadingModular] = useState(false);

  // Block
  const [blockType, setBlockType] = useState("sphere_4pt");
  const [nExternal, setNExternal] = useState("4");
  const [channelDim, setChannelDim] = useState("3");
  const [blockResult, setBlockResult] = useState<unknown>(null);
  const [loadingBlock, setLoadingBlock] = useState(false);

  // Charge
  const [chargeType, setChargeType] = useState("free_boson");
  const [cValue, setCValue] = useState("1.0");
  const [nFields, setNFields] = useState("4");
  const [chargeResult, setChargeResult] = useState<unknown>(null);
  const [loadingCharge, setLoadingCharge] = useState(false);

  // RCFT
  const [rcftType, setRcftType] = useState("ising_model");
  const [levelK, setLevelK] = useState("1");
  const [nPrimaries, setNPrimaries] = useState("3");
  const [rcftResult, setRcftResult] = useState<unknown>(null);
  const [loadingRcft, setLoadingRcft] = useState(false);

  // ── Fetch helpers ──────────────────────────────────────────────────────

  async function fetchOverview() {
    setLoadingOverview(true);
    try {
      const r = await fetch(`${API_BASE}/graph/conformal-field/overview`);
      const d = await r.json();
      setOverview(d);
    } catch (e) { console.error(e); }
    setLoadingOverview(false);
  }

  async function fetchVirasoro() {
    setLoadingVirasoro(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/conformal-field/virasoro?rep_type=${repType}&central_charge=${centralCharge}&max_level=${maxLevel}`,
        { method: "POST" }
      );
      setVirasoroResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingVirasoro(false);
  }

  async function fetchOpe() {
    setLoadingOpe(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/conformal-field/ope?ope_type=${opeType}&dimension=${dimension}&spin=${spin}`,
        { method: "POST" }
      );
      setOpeResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingOpe(false);
  }

  async function fetchModular() {
    setLoadingModular(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/conformal-field/modular?mod_type=${modType}&weight_k=${weightK}&level_n=${levelN}`,
        { method: "POST" }
      );
      setModularResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingModular(false);
  }

  async function fetchBlock() {
    setLoadingBlock(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/conformal-field/block?block_type=${blockType}&n_external=${nExternal}&channel_dim=${channelDim}`,
        { method: "POST" }
      );
      setBlockResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingBlock(false);
  }

  async function fetchCharge() {
    setLoadingCharge(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/conformal-field/charge?charge_type=${chargeType}&c_value=${cValue}&n_fields=${nFields}`,
        { method: "POST" }
      );
      setChargeResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingCharge(false);
  }

  async function fetchRcft() {
    setLoadingRcft(true);
    try {
      const r = await fetch(
        `${API_BASE}/graph/conformal-field/rcft?rcft_type=${rcftType}&level_k=${levelK}&n_primaries=${nPrimaries}`,
        { method: "POST" }
      );
      setRcftResult(await r.json());
    } catch (e) { console.error(e); }
    setLoadingRcft(false);
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

  // ── Virasoro Tab ────────────────────────────────────────────────────────

  function VirasoroTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Virasoro Representations 维拉索罗表示</CardTitle>
            <CardDescription>[L_m, L_n] = (m-n)L_{'{m+n}'} + c/12·m(m²-1)δ_{'{m+n,0}'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Rep Type</Label>
                <Select value={repType} onValueChange={setRepType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VIRASORO_TYPES.map((t) => (
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
                <Label className="text-xs">Max Level</Label>
                <Input type="number" min={1} max={20} value={maxLevel} onChange={(e) => setMaxLevel(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchVirasoro} disabled={loadingVirasoro}>
              {loadingVirasoro ? "Computing..." : "Compute Virasoro 计算维拉索罗"}
            </Button>
          </CardContent>
        </Card>
        {virasoroResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Virasoro Result 维拉索罗结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={virasoroResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── OPE Tab ────────────────────────────────────────────────────────────

  function OpeTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Operator Product Expansion 算子乘积展开</CardTitle>
            <CardDescription>Φ_i(z)Φ_j(w) ~ Σ C_{'{ij}'}^k (z-w)^{'{h_k-h_i-h_j}'} Φ_k(w)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">OPE Type</Label>
                <Select value={opeType} onValueChange={setOpeType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OPE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Scaling Dimension</Label>
                <Input type="number" step={0.1} min={0} max={100} value={dimension} onChange={(e) => setDimension(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Spin</Label>
                <Input type="number" min={0} max={20} value={spin} onChange={(e) => setSpin(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchOpe} disabled={loadingOpe}>
              {loadingOpe ? "Computing..." : "Compute OPE 计算算子积"}
            </Button>
          </CardContent>
        </Card>
        {opeResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">OPE Result 算子积结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={opeResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Modular Tab ────────────────────────────────────────────────────────

  function ModularTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Modular Forms 模形式</CardTitle>
            <CardDescription>η(τ) = q^{'{1/24}'} Π(1-q^n), SL(2,ℤ) invariance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Modular Type</Label>
                <Select value={modType} onValueChange={setModType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MODULAR_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Weight k</Label>
                <Input type="number" min={1} max={30} value={weightK} onChange={(e) => setWeightK(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Level N</Label>
                <Input type="number" min={1} max={50} value={levelN} onChange={(e) => setLevelN(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchModular} disabled={loadingModular}>
              {loadingModular ? "Computing..." : "Compute Modular 计算模形式"}
            </Button>
          </CardContent>
        </Card>
        {modularResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Modular Result 模形式结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={modularResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Block Tab ──────────────────────────────────────────────────────────

  function BlockTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Conformal Blocks 共形块</CardTitle>
            <CardDescription>F(c; {'{h_i}'}, h_p; x) — Zamolodchikov recursion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Block Type</Label>
                <Select value={blockType} onValueChange={setBlockType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BLOCK_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">N External</Label>
                <Input type="number" min={2} max={20} value={nExternal} onChange={(e) => setNExternal(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Channel Dim</Label>
                <Input type="number" min={1} max={30} value={channelDim} onChange={(e) => setChannelDim(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchBlock} disabled={loadingBlock}>
              {loadingBlock ? "Computing..." : "Compute Block 计算共形块"}
            </Button>
          </CardContent>
        </Card>
        {blockResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Block Result 共形块结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={blockResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Charge Tab ─────────────────────────────────────────────────────────

  function ChargeTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Central Charge 中心荷</CardTitle>
            <CardDescription>c-theorem: c_UV ≥ c_eff(μ) ≥ c_IR — RG irreversibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Charge Type</Label>
                <Select value={chargeType} onValueChange={setChargeType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CHARGE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Central Charge c</Label>
                <Input type="number" step={0.1} min={-100} max={100} value={cValue} onChange={(e) => setCValue(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">N Fields</Label>
                <Input type="number" min={1} max={30} value={nFields} onChange={(e) => setNFields(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchCharge} disabled={loadingCharge}>
              {loadingCharge ? "Computing..." : "Compute Charge 计算中心荷"}
            </Button>
          </CardContent>
        </Card>
        {chargeResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Charge Result 中心荷结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={chargeResult} />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── RCFT Tab ───────────────────────────────────────────────────────────

  function RcftTab() {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rational CFT 有理共形场论</CardTitle>
            <CardDescription>Ising c=1/2 / Potts c=4/5 / WZW SU(2)_k / Verlinde formula</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">RCFT Type</Label>
                <Select value={rcftType} onValueChange={setRcftType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RCFT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Level k</Label>
                <Input type="number" min={1} max={50} value={levelK} onChange={(e) => setLevelK(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">N Primaries</Label>
                <Input type="number" min={1} max={30} value={nPrimaries} onChange={(e) => setNPrimaries(e.target.value)} />
              </div>
            </div>
            <Button onClick={fetchRcft} disabled={loadingRcft}>
              {loadingRcft ? "Computing..." : "Compute RCFT 计算有理CFT"}
            </Button>
          </CardContent>
        </Card>
        {rcftResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">RCFT Result 有理CFT结果</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock data={rcftResult} />
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
        <h1 className="text-2xl font-bold">Causal Conformal Field Theory &amp; Virasoro</h1>
        <Badge variant="outline">Layer 56</Badge>
        <Badge variant="secondary">v1.304.0</Badge>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl">
        因果共形场论与维拉索罗代数引擎 — Virasoro algebra [L_m,L_n]=(m-n)L_{'{m+n}'}+c/12·m(m²-1)δ_{'{m+n,0}'},
        OPE, conformal blocks, modular forms η(τ), Verlinde formula, rational CFT,
        central charge c-theorem, Ising/Potts/WZW models, bulk-boundary correspondence with TQFT (Layer 55)
      </p>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-7 w-full max-w-3xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="virasoro">Virasoro</TabsTrigger>
          <TabsTrigger value="ope">OPE</TabsTrigger>
          <TabsTrigger value="modular">Modular</TabsTrigger>
          <TabsTrigger value="block">Block</TabsTrigger>
          <TabsTrigger value="charge">Charge</TabsTrigger>
          <TabsTrigger value="rcft">RCFT</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="virasoro"><VirasoroTab /></TabsContent>
        <TabsContent value="ope"><OpeTab /></TabsContent>
        <TabsContent value="modular"><ModularTab /></TabsContent>
        <TabsContent value="block"><BlockTab /></TabsContent>
        <TabsContent value="charge"><ChargeTab /></TabsContent>
        <TabsContent value="rcft"><RcftTab /></TabsContent>
      </Tabs>
    </div>
  );
}
