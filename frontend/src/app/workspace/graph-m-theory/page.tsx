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

// ── Types ──────────────────────────────────────────────────────────────
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

// ── Enum option constants ──────────────────────────────────────────────
const SUGRA_TYPES = [
  { value: "eleven_d_supergravity", label: "11维超引力 11D SUGRA" },
  { value: "c_field_3form", label: "C场3形式 C₃ Gauge" },
  { value: "gravelectron", label: "引力微子 Gravitino" },
  { value: "kaluza_klein_reduction", label: "KK约化 KK Reduction" },
  { value: "membrane_coupling", label: "膜耦合 Membrane" },
  { value: "ai_11d_sugra", label: "AI-SUGRA AI 11D" },
];

const M2_TYPES = [
  { value: "fundamental_membrane", label: "基本膜 Fundamental M2" },
  { value: "bps_m2", label: "BPS M2膜 1/2 BPS" },
  { value: "m2_worldvolume", label: "M2世界体 Worldvolume" },
  { value: "hopf_fibration", label: "Hopf纤维化 Hopf Map" },
  { value: "om_m2", label: "开M2膜 Open M2" },
  { value: "ai_m2brane", label: "AI-M2 AI Membrane" },
];

const M5_TYPES = [
  { value: "solitonic_fivebrane", label: "孤子五膜 Solitonic M5" },
  { value: "bps_m5", label: "BPS M5膜 1/2 BPS" },
  { value: "self_dual_tensor", label: "自偶张量 Self-Dual H₃" },
  { value: "nahm_equation", label: "Nahm方程 Nahm Eq." },
  { value: "m5_cft", label: "M5 CFT (2,0)理论" },
  { value: "ai_m5brane", label: "AI-M5 AI Fivebrane" },
];

const MATRIX_TYPES = [
  { value: "bfss_matrix", label: "BFSS矩阵 BFSS Model" },
  { value: "ikkt_model", label: "IKKT模型 IKKT" },
  { value: "matrix_string", label: "矩阵弦 Matrix String" },
  { value: "finite_n", label: "有限N Finite N" },
  { value: "large_n_limit", label: "大N极限 N→∞" },
  { value: "ai_matrix", label: "AI-Matrix AI Matrix" },
];

const ADS_CFT_TYPES = [
  { value: "maldacena_duality", label: "Maldacena对偶 Gauge/Gravity" },
  { value: "planar_limit", label: "平面极限 Planar N→∞" },
  { value: "n4_susy", label: "N=4 SYM N=4超杨-Mills" },
  { value: "ads5_s5", label: "AdS₅×S⁵ Background" },
  { value: "radial_quantization", label: "径向量子化 Radial Quant." },
  { value: "ai_ads_cft", label: "AI-AdS/CFT AI Holography" },
];

const U_DUALITY_TYPES = [
  { value: "e7_symmetry", label: "E₇对称性 E₇(Z)" },
  { value: "non_perturbative", label: "非微扰 Non-perturbative" },
  { value: "exceptional_group", label: "例外群 Exceptional G" },
  { value: "charge_lattice", label: "荷格 Charge Lattice" },
  { value: "orbit_classification", label: "轨道分类 Orbit Class." },
  { value: "ai_u_duality", label: "AI-U对偶 AI U-Duality" },
];

const API_BASE = "http://localhost:8001";

// ── Helper ─────────────────────────────────────────────────────────────
function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-96 font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
export default function MTheoryPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // 11D SUGRA
  const [sugraType, setSugraType] = useState("eleven_d_supergravity");
  const [spacetimeDim, setSpacetimeDim] = useState("11");
  const [gravitonMass, setGravitonMass] = useState("0");

  // M2-Brane
  const [m2Type, setM2Type] = useState("fundamental_membrane");
  const [m2Worldvol, setM2Worldvol] = useState("2");
  const [m2Tension, setM2Tension] = useState("1.0");

  // M5-Brane
  const [m5Type, setM5Type] = useState("solitonic_fivebrane");
  const [m5Worldvol, setM5Worldvol] = useState("5");
  const [m5Flux, setM5Flux] = useState("1.0");

  // Matrix Theory
  const [matrixType, setMatrixType] = useState("bfss_matrix");
  const [matrixSize, setMatrixSize] = useState("4");
  const [matrixCoupling, setMatrixCoupling] = useState("1.0");

  // AdS/CFT
  const [adsType, setAdsType] = useState("maldacena_duality");
  const [centralChargeN, setCentralChargeN] = useState("4");
  const [lambdaT, setLambdaT] = useState("10.0");

  // U-Duality
  const [uDualType, setUDualType] = useState("e7_symmetry");
  const [groupRank, setGroupRank] = useState("7");
  const [chargeVector, setChargeVector] = useState("56");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/m-theory/overview`);
      const data = await res.json();
      setOverview(data);
      setResult(data);
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  async function postEndpoint(path: string, params: Record<string, string>) {
    setLoading(true);
    setResult(null);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}${path}?${qs}`, { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            M-Theory Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 60 — 11维超引力 / M2膜 / M5膜 / 矩阵理论 / AdS/CFT对偶 / U-对偶性
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.308.0</Badge>
          <Badge variant="secondary">Layer 60</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sugra">11D超引力</TabsTrigger>
          <TabsTrigger value="m2-brane">M2膜</TabsTrigger>
          <TabsTrigger value="m5-brane">M5膜</TabsTrigger>
          <TabsTrigger value="matrix">矩阵理论</TabsTrigger>
          <TabsTrigger value="ads-cft">AdS/CFT</TabsTrigger>
          <TabsTrigger value="u-duality">U-对偶</TabsTrigger>
        </TabsList>

        {/* ── Overview ──────────────────────────────────────── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>M-Theory Engine 概览</CardTitle>
              <CardDescription>
                M理论统一引擎 — 6枚举 × 6值 = 36值, 7 API端点
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchOverview} disabled={loading}>
                {loading ? "加载中..." : "获取概览"}
              </Button>
              {overview && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>枚举数</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overview.enum_count}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>端点数</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overview.endpoint_count}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>配置空间</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{overview.config_space.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>缓存命中</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {Object.values(overview.cache_stats).reduce((a, b) => a + b, 0)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 11D Supergravity ───────────────────────────────── */}
        <TabsContent value="sugra">
          <Card>
            <CardHeader>
              <CardTitle>11维超引力 (11D SUGRA)</CardTitle>
              <CardDescription>M理论低能有效理论 — 11维N=1超引力场内容与作用量分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>超引力类型</Label>
                  <Select value={sugraType} onValueChange={setSugraType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUGRA_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>时空维度</Label>
                  <Input type="number" value={spacetimeDim} onChange={(e) => setSpacetimeDim(e.target.value)} min={4} max={11} />
                </div>
                <div className="space-y-2">
                  <Label>引力子质量</Label>
                  <Input type="number" step="0.001" value={gravitonMass} onChange={(e) => setGravitonMass(e.target.value)} min={0} max={10} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/m-theory/11d-sugra", {
                  sugra_type: sugraType, spacetime_dim: spacetimeDim, graviton_mass: gravitonMass,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析11D超引力"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── M2-Brane ───────────────────────────────────────── */}
        <TabsContent value="m2-brane">
          <Card>
            <CardHeader>
              <CardTitle>M2膜分析</CardTitle>
              <CardDescription>M理论基本对象 — 2+1维膜动力学与BPS条件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>M2膜类型</Label>
                  <Select value={m2Type} onValueChange={setM2Type}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {M2_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>世界体积维度</Label>
                  <Input type="number" value={m2Worldvol} onChange={(e) => setM2Worldvol(e.target.value)} min={1} max={3} />
                </div>
                <div className="space-y-2">
                  <Label>膜张力 T₂</Label>
                  <Input type="number" step="0.01" value={m2Tension} onChange={(e) => setM2Tension(e.target.value)} min={0.01} max={100} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/m-theory/m2-brane", {
                  brane_type: m2Type, worldvolume_dim: m2Worldvol, tension: m2Tension,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析M2膜"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── M5-Brane ───────────────────────────────────────── */}
        <TabsContent value="m5-brane">
          <Card>
            <CardHeader>
              <CardTitle>M5膜分析</CardTitle>
              <CardDescription>M理论孤子解 — 5+1维自偶张量多重态与(2,0)理论</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>M5膜类型</Label>
                  <Select value={m5Type} onValueChange={setM5Type}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {M5_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>世界体积维度</Label>
                  <Input type="number" value={m5Worldvol} onChange={(e) => setM5Worldvol(e.target.value)} min={3} max={6} />
                </div>
                <div className="space-y-2">
                  <Label>通量量子化</Label>
                  <Input type="number" step="0.01" value={m5Flux} onChange={(e) => setM5Flux(e.target.value)} min={0.1} max={100} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/m-theory/m5-brane", {
                  brane_type: m5Type, worldvolume_dim: m5Worldvol, flux_quant: m5Flux,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析M5膜"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Matrix Theory ──────────────────────────────────── */}
        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>矩阵理论</CardTitle>
              <CardDescription>M理论非微扰表述 — BFSS/IKKT矩阵模型与时空涌现</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>矩阵模型类型</Label>
                  <Select value={matrixType} onValueChange={setMatrixType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MATRIX_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>矩阵大小 N</Label>
                  <Input type="number" value={matrixSize} onChange={(e) => setMatrixSize(e.target.value)} min={1} max={1024} />
                </div>
                <div className="space-y-2">
                  <Label>耦合常数</Label>
                  <Input type="number" step="0.01" value={matrixCoupling} onChange={(e) => setMatrixCoupling(e.target.value)} min={0.001} max={100} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/m-theory/matrix", {
                  matrix_type: matrixType, matrix_size: matrixSize, coupling: matrixCoupling,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析矩阵理论"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── AdS/CFT ────────────────────────────────────────── */}
        <TabsContent value="ads-cft">
          <Card>
            <CardHeader>
              <CardTitle>AdS/CFT对偶</CardTitle>
              <CardDescription>规范/引力对偶 — Maldacena猜想与全息字典</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>对偶类型</Label>
                  <Select value={adsType} onValueChange={setAdsType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ADS_CFT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>中心荷 N (SU(N)秩)</Label>
                  <Input type="number" value={centralChargeN} onChange={(e) => setCentralChargeN(e.target.value)} min={2} max={1024} />
                </div>
                <div className="space-y-2">
                  <Label>&apos;t Hooft耦合 λ</Label>
                  <Input type="number" step="0.1" value={lambdaT} onChange={(e) => setLambdaT(e.target.value)} min={0.1} max={1000} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/m-theory/ads-cft", {
                  duality_type: adsType, central_charge_n: centralChargeN, lambda_t: lambdaT,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析AdS/CFT对偶"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── U-Duality ──────────────────────────────────────── */}
        <TabsContent value="u-duality">
          <Card>
            <CardHeader>
              <CardTitle>U-对偶性分析</CardTitle>
              <CardDescription>M理论非微扰对称性 — E₇例外群与荷轨道分类</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>U-对偶类型</Label>
                  <Select value={uDualType} onValueChange={setUDualType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {U_DUALITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>群秩</Label>
                  <Input type="number" value={groupRank} onChange={(e) => setGroupRank(e.target.value)} min={1} max={8} />
                </div>
                <div className="space-y-2">
                  <Label>荷向量维度</Label>
                  <Input type="number" value={chargeVector} onChange={(e) => setChargeVector(e.target.value)} min={2} max={128} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/m-theory/u-duality", {
                  duality_type: uDualType, group_rank: groupRank, charge_vector: chargeVector,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析U-对偶性"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="text-center text-xs text-muted-foreground">
        Layer 60 — M-Theory Engine v1.308.0 | 6 Enums × 6 Values = 36 | 7 Endpoints | Config Space: 6⁶ = 46656
      </div>
    </div>
  );
}
