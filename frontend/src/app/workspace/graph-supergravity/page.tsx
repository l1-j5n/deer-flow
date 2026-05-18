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
const SUGRA_DIM_TYPES = [
  { value: "eleven_d_sugra", label: "11D超引力 11D SUGRA" },
  { value: "type_iia", label: "IIA型超引力 Type IIA" },
  { value: "type_iib", label: "IIB型超引力 Type IIB" },
  { value: "four_d_n8", label: "4维N=8超引力 4D N=8" },
  { value: "gauged_sugra", label: "规范超引力 Gauged SUGRA" },
  { value: "ai_sugra_dim", label: "AI维度 AI Dimension" },
];

const KK_TYPES = [
  { value: "torus_reduction", label: "环面降维 Torus Reduction" },
  { value: "sphere_reduction", label: "球面降维 Sphere Reduction" },
  { value: "scherk_schwarz", label: "Scherk-Schwarz降维" },
  { value: "consistent_truncation", label: "一致截断 Consistent Truncation" },
  { value: "massive_kk", label: "有质量KK模式 Massive KK" },
  { value: "ai_kaluza_klein", label: "AI卡鲁扎 AI Kaluza-Klein" },
];

const SCALAR_MANIFOLD_TYPES = [
  { value: "e7_7_su8", label: "E₇₇/SU(8)对称空间" },
  { value: "sl2r_so2", label: "SL(2,R)/SO(2)" },
  { value: "coset_space", label: "陪集空间 Coset Space" },
  { value: "special_geometry", label: "特殊几何 Special Geometry" },
  { value: "kahler_moduli", label: "Kähler模空间" },
  { value: "ai_scalar_manifold", label: "AI标量流形 AI Manifold" },
];

const GRAVITINO_TYPES = [
  { value: "gravitino", label: "引力微子 Gravitino ψ_μ" },
  { value: "graviphoton", label: "引力光子 Graviphoton" },
  { value: "graviscalars", label: "引力标量 Graviscalars" },
  { value: "tensor_multiplet", label: "张量多重态 Tensor Multiplet" },
  { value: "vector_multiplet", label: "矢量多重态 Vector Multiplet" },
  { value: "ai_gravitino", label: "AI引力微子 AI Gravitino" },
];

const BRANE_TYPES = [
  { value: "m2_brane", label: "M2膜 M2-Brane" },
  { value: "m5_brane", label: "M5膜 M5-Brane" },
  { value: "d_brane", label: "D膜 D-Brane" },
  { value: "ns5_brane", label: "NS5膜 NS5-Brane" },
  { value: "fundamental_string", label: "基本弦 F1-String" },
  { value: "ai_brane_solution", label: "AI膜 AI Brane" },
];

const HOLOGRAPHIC_TYPES = [
  { value: "counterterm", label: "反项重整化 Counterterm" },
  { value: "boundary_stress", label: "边界应力张量 Boundary Stress" },
  { value: "fefferman_graham", label: "Fefferman-Graham展开" },
  { value: "asymptotic_ads", label: "渐近AdS空间 Asymptotic AdS" },
  { value: "legendre_transform", label: "勒让德变换 Legendre Transform" },
  { value: "ai_holographic", label: "AI全息 AI Holographic" },
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
export default function SupergravityPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // SUGRA Dimension
  const [sugraDimType, setSugraDimType] = useState("eleven_d_sugra");
  const [sugraDimDimension, setSugraDimDimension] = useState("11");
  const [sugraDimSusy, setSugraDimSusy] = useState("32");

  // KK
  const [kkType, setKkType] = useState("torus_reduction");
  const [kkCompactDim, setKkCompactDim] = useState("6");
  const [kkModeLevel, setKkModeLevel] = useState("0");

  // Scalar Manifold
  const [manifoldType, setManifoldType] = useState("e7_7_su8");
  const [manifoldDim, setManifoldDim] = useState("70");
  const [manifoldCurvature, setManifoldCurvature] = useState("negative");

  // Gravitino
  const [gravitinoType, setGravitinoType] = useState("gravitino");
  const [gravitinoSpin, setGravitinoSpin] = useState("3.0");
  const [gravitinoFields, setGravitinoFields] = useState("4");

  // Brane
  const [braneType, setBraneType] = useState("m2_brane");
  const [braneWorldvol, setBraneWorldvol] = useState("3");
  const [braneCharge, setBraneCharge] = useState("1");

  // Holographic
  const [holoType, setHoloType] = useState("counterterm");
  const [holoBoundaryDim, setHoloBoundaryDim] = useState("4");
  const [holoCutoff, setHoloCutoff] = useState("1.0");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/supergravity/overview`);
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
            Supergravity (SUGRA) Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 58 — 11D超引力 / Kaluza-Klein降维 / 标量流形 / 引力微子 / 膜解 / 全息重整化
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.306.0</Badge>
          <Badge variant="secondary">Layer 58</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dimension">SUGRA维度</TabsTrigger>
          <TabsTrigger value="kk">KK降维</TabsTrigger>
          <TabsTrigger value="scalar">标量流形</TabsTrigger>
          <TabsTrigger value="gravitino">引力微子</TabsTrigger>
          <TabsTrigger value="brane">膜解</TabsTrigger>
          <TabsTrigger value="holographic">全息重整</TabsTrigger>
        </TabsList>

        {/* ── Overview ──────────────────────────────────────── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>SUGRA Engine 概览</CardTitle>
              <CardDescription>
                超引力统一引擎 — 6枚举 × 6值 = 36值, 7 API端点
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

        {/* ── SUGRA Dimension ───────────────────────────────── */}
        <TabsContent value="dimension">
          <Card>
            <CardHeader>
              <CardTitle>SUGRA维度分析</CardTitle>
              <CardDescription>超引力理论维度类型分析 (11D/IIA/IIB/4D-N8/Gauged)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>维度类型</Label>
                  <Select value={sugraDimType} onValueChange={setSugraDimType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUGRA_DIM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>目标维度</Label>
                  <Input type="number" value={sugraDimDimension} onChange={(e) => setSugraDimDimension(e.target.value)} min={4} max={11} />
                </div>
                <div className="space-y-2">
                  <Label>超对称荷</Label>
                  <Input type="number" value={sugraDimSusy} onChange={(e) => setSugraDimSusy(e.target.value)} min={0} max={64} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/supergravity/dimension", {
                  dim_type: sugraDimType, dimension: sugraDimDimension, susy_charges: sugraDimSusy,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析维度"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Kaluza-Klein ──────────────────────────────────── */}
        <TabsContent value="kk">
          <Card>
            <CardHeader>
              <CardTitle>Kaluza-Klein降维</CardTitle>
              <CardDescription>紧致化降维与KK模式分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>降维类型</Label>
                  <Select value={kkType} onValueChange={setKkType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KK_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>紧致维度</Label>
                  <Input type="number" value={kkCompactDim} onChange={(e) => setKkCompactDim(e.target.value)} min={1} max={7} />
                </div>
                <div className="space-y-2">
                  <Label>激发能级</Label>
                  <Input type="number" value={kkModeLevel} onChange={(e) => setKkModeLevel(e.target.value)} min={0} max={100} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/supergravity/kaluza-klein", {
                  kk_type: kkType, compact_dim: kkCompactDim, mode_level: kkModeLevel,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析KK降维"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Scalar Manifold ───────────────────────────────── */}
        <TabsContent value="scalar">
          <Card>
            <CardHeader>
              <CardTitle>标量目标流形</CardTitle>
              <CardDescription>超引力标量场目标流形分析 (E₇₇/SU(8), SL(2,R)/SO(2), ...)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>流形类型</Label>
                  <Select value={manifoldType} onValueChange={setManifoldType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SCALAR_MANIFOLD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>流形维度</Label>
                  <Input type="number" value={manifoldDim} onChange={(e) => setManifoldDim(e.target.value)} min={1} max={133} />
                </div>
                <div className="space-y-2">
                  <Label>曲率类型</Label>
                  <Select value={manifoldCurvature} onValueChange={setManifoldCurvature}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="negative">负曲率 Negative</SelectItem>
                      <SelectItem value="positive">正曲率 Positive</SelectItem>
                      <SelectItem value="flat">平坦 Flat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/supergravity/scalar-manifold", {
                  manifold_type: manifoldType, dim: manifoldDim, curvature: manifoldCurvature,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析标量流形"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Gravitino ─────────────────────────────────────── */}
        <TabsContent value="gravitino">
          <Card>
            <CardHeader>
              <CardTitle>引力微子多重态</CardTitle>
              <CardDescription>超引力引力微子多重态场分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>多重态类型</Label>
                  <Select value={gravitinoType} onValueChange={setGravitinoType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GRAVITINO_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>最大自旋</Label>
                  <Input type="number" step="0.5" value={gravitinoSpin} onChange={(e) => setGravitinoSpin(e.target.value)} min={0.5} max={5} />
                </div>
                <div className="space-y-2">
                  <Label>场数量</Label>
                  <Input type="number" value={gravitinoFields} onChange={(e) => setGravitinoFields(e.target.value)} min={1} max={32} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/supergravity/gravitino", {
                  multiplet_type: gravitinoType, spin_range: gravitinoSpin, field_count: gravitinoFields,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析引力微子"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Brane Solutions ───────────────────────────────── */}
        <TabsContent value="brane">
          <Card>
            <CardHeader>
              <CardTitle>膜解与孤子</CardTitle>
              <CardDescription>超引力膜解与延展孤子解分析 (M2/M5/D/NS5/F1)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>膜类型</Label>
                  <Select value={braneType} onValueChange={setBraneType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BRANE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>世界体积维度</Label>
                  <Input type="number" value={braneWorldvol} onChange={(e) => setBraneWorldvol(e.target.value)} min={1} max={10} />
                </div>
                <div className="space-y-2">
                  <Label>膜荷</Label>
                  <Input type="number" value={braneCharge} onChange={(e) => setBraneCharge(e.target.value)} min={1} max={64} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/supergravity/brane", {
                  brane_type: braneType, worldvol_dim: braneWorldvol, charge: braneCharge,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析膜解"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Holographic Renormalization ───────────────────── */}
        <TabsContent value="holographic">
          <Card>
            <CardHeader>
              <CardTitle>全息重整化</CardTitle>
              <CardDescription>AdS/CFT全息重整化方法分析</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>重整化类型</Label>
                  <Select value={holoType} onValueChange={setHoloType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HOLOGRAPHIC_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>边界维度</Label>
                  <Input type="number" value={holoBoundaryDim} onChange={(e) => setHoloBoundaryDim(e.target.value)} min={2} max={6} />
                </div>
                <div className="space-y-2">
                  <Label>UV截断标度</Label>
                  <Input type="number" step="0.01" value={holoCutoff} onChange={(e) => setHoloCutoff(e.target.value)} min={0.01} max={100} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/supergravity/holographic", {
                  renorm_type: holoType, boundary_dim: holoBoundaryDim, cutoff_scale: holoCutoff,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析全息重整化"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="text-center text-xs text-muted-foreground">
        Layer 58 — Supergravity (SUGRA) Engine v1.306.0 | 6 Enums × 6 Values = 36 | 7 Endpoints | Config Space: 6⁶ = 46656
      </div>
    </div>
  );
}
