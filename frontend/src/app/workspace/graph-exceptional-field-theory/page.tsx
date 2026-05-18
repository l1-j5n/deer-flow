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
const U_DUALITY_TYPES = [
  { value: "e6_six_six", label: "E₆(₆) 5D SUGRA" },
  { value: "e7_seven_seven", label: "E₇(₇) 4D SUGRA" },
  { value: "e8_eight_eight", label: "E₈(₈) 3D SUGRA" },
  { value: "chevalley_generators", label: "Chevalley生成元 Chevalley" },
  { value: "representation_theory", label: "表示理论 Repr Theory" },
  { value: "ai_u_duality", label: "AI-U对偶 AI Duality" },
];

const GENERALIZED_GEOM_TYPES = [
  { value: "exceptional_tangent_bundle", label: "例外切丛 Exc. Tangent" },
  { value: "en_structure", label: "E_n结构 E_n Structure" },
  { value: "dorfman_bracket", label: "Dorfman括号 Dorfman" },
  { value: "generalized_metric", label: "广义度量 Gen. Metric" },
  { value: "weitzenbock_connection", label: "Weitzenböck联络 Weitzenböck" },
  { value: "ai_generalized_geom", label: "AI-广义几何 AI Geometry" },
];

const WRAPPED_COORD_TYPES = [
  { value: "m_theory_wrapping", label: "M理论包裹 M-Theory Wrap" },
  { value: "iib_wrapping", label: "IIB包裹 IIB Wrapping" },
  { value: "charge_lattice", label: "荷格 Charge Lattice" },
  { value: "section_condition", label: "截面条件 Section Cond." },
  { value: "coordinate_algebra", label: "坐标代数 Coord. Algebra" },
  { value: "ai_wrapped_coord", label: "AI-包裹坐标 AI Wrapped" },
];

const TRUNCATION_TYPES = [
  { value: "sphere_reduction", label: "球面约化 Sphere Reduction" },
  { value: "scherk_schwarz", label: "Scherk-Schwarz约化" },
  { value: "embedding_tensor", label: "嵌入张量 Embedding Tensor" },
  { value: "gauged_supergravity", label: "规范超引力 Gauged SUGRA" },
  { value: "nonlinear_realization", label: "非线性实现 Nonlinear Real." },
  { value: "ai_truncation", label: "AI-截断 AI Truncation" },
];

const EXCEPTIONAL_LIE_TYPES = [
  { value: "en_algebra", label: "E_n代数 E_n Algebra" },
  { value: "freudenthal_magic", label: "Freudenthal幻方 Magic Square" },
  { value: "jordan_algebra", label: "Jordan代数 Jordan Alg." },
  { value: "octonion_structure", label: "八元数 Octonions 𝕌" },
  { value: "cartan_classification", label: "Cartan分类 ADE" },
  { value: "ai_exceptional_lie", label: "AI-例外李群 AI Lie" },
];

const DFT_TYPES = [
  { value: "odd_group", label: "O(d,d)群 O(d,d) Group" },
  { value: "doubled_geometry", label: "倍增几何 Doubled Geom." },
  { value: "strong_constraint", label: "强约束 Strong Constr." },
  { value: "generalized_metric_dd", label: "广义度量H_MN Gen. Metric" },
  { value: "flux_formulation", label: "通量形式论 Flux Formal." },
  { value: "ai_double_field", label: "AI-DFT AI Double Field" },
];

const API_BASE = "http://localhost:8001";

// Helper
function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-96 font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

// Main Component
export default function ExceptionalFieldTheoryPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // U-Duality Group
  const [uDualityType, setUDualityType] = useState("e7_seven_seven");
  const [dimension, setDimension] = useState("4");
  const [rankGroup, setRankGroup] = useState("7");

  // Generalized Geometry
  const [geomType, setGeomType] = useState("exceptional_tangent_bundle");
  const [tangentDim, setTangentDim] = useState("4");
  const [structureGroup, setStructureGroup] = useState("E7");

  // Wrapped Coordinates
  const [coordType, setCoordType] = useState("m_theory_wrapping");
  const [wrappingDim, setWrappingDim] = useState("3");
  const [chargeRank, setChargeRank] = useState("6");

  // Consistent Truncation
  const [truncationType, setTruncationType] = useState("sphere_reduction");
  const [sphereDim, setSphereDim] = useState("7");
  const [gaugeDim, setGaugeDim] = useState("28");

  // Exceptional Lie Group
  const [lieType, setLieType] = useState("en_algebra");
  const [rootRank, setRootRank] = useState("6");
  const [algebraDim, setAlgebraDim] = useState("78");

  // Double Field Theory
  const [dftType, setDftType] = useState("odd_group");
  const [ddDimension, setDdDimension] = useState("2");
  const [oddRank, setOddRank] = useState("4");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/exceptional-field-theory/overview`);
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
            Exceptional Field Theory Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 62 — U-对偶群 / 广义几何 / 包裹坐标 / 一致截断 / 例外李群 / Double Field Theory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.310.0</Badge>
          <Badge variant="secondary">Layer 62</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="u-duality">U-对偶</TabsTrigger>
          <TabsTrigger value="generalized-geometry">广义几何</TabsTrigger>
          <TabsTrigger value="wrapped-coordinates">包裹坐标</TabsTrigger>
          <TabsTrigger value="truncation">一致截断</TabsTrigger>
          <TabsTrigger value="exceptional-lie">例外李群</TabsTrigger>
          <TabsTrigger value="double-field">DFT</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Exceptional Field Theory Engine 概览</CardTitle>
              <CardDescription>
                例外场论统一引擎 — 6枚举 × 6值 = 36值, 7 API端点
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

        {/* U-Duality Group */}
        <TabsContent value="u-duality">
          <Card>
            <CardHeader>
              <CardTitle>U-对偶群 (U-Duality Group)</CardTitle>
              <CardDescription>例外对称群 E₆(₆)/E₇(₇)/E₈(₈) — 使U-对偶成为显式对称性</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>群类型</Label>
                  <Select value={uDualityType} onValueChange={setUDualityType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {U_DUALITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>时空维度 D</Label>
                  <Input type="number" value={dimension} onChange={(e) => setDimension(e.target.value)} min={3} max={11} />
                </div>
                <div className="space-y-2">
                  <Label>群秩 rank</Label>
                  <Input type="number" value={rankGroup} onChange={(e) => setRankGroup(e.target.value)} min={2} max={8} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/exceptional-field-theory/u-duality-group", { group_type: uDualityType, dimension: dimension, rank_group: rankGroup })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析U-对偶群"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Generalized Geometry */}
        <TabsContent value="generalized-geometry">
          <Card>
            <CardHeader>
              <CardTitle>广义/例外几何</CardTitle>
              <CardDescription>例外切丛、E_n结构与Dorfman括号 — 几何的推广</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>几何类型</Label>
                  <Select value={geomType} onValueChange={setGeomType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GENERALIZED_GEOM_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>切丛维度</Label>
                  <Input type="number" value={tangentDim} onChange={(e) => setTangentDim(e.target.value)} min={1} max={11} />
                </div>
                <div className="space-y-2">
                  <Label>结构群</Label>
                  <Select value={structureGroup} onValueChange={setStructureGroup}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="E6">E₆</SelectItem>
                      <SelectItem value="E7">E₇</SelectItem>
                      <SelectItem value="E8">E₈</SelectItem>
                      <SelectItem value="SL5">SL(5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/exceptional-field-theory/generalized-geometry", { geometry_type: geomType, tangent_dim: tangentDim, structure_group: structureGroup })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析广义几何"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Wrapped Coordinates */}
        <TabsContent value="wrapped-coordinates">
          <Card>
            <CardHeader>
              <CardTitle>包裹坐标</CardTitle>
              <CardDescription>M/IIB膜包裹坐标与荷格 — 扩展时空的额外坐标</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>坐标类型</Label>
                  <Select value={coordType} onValueChange={setCoordType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WRAPPED_COORD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>包裹维度</Label>
                  <Input type="number" value={wrappingDim} onChange={(e) => setWrappingDim(e.target.value)} min={0} max={7} />
                </div>
                <div className="space-y-2">
                  <Label>荷格秩</Label>
                  <Input type="number" value={chargeRank} onChange={(e) => setChargeRank(e.target.value)} min={1} max={8} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/exceptional-field-theory/wrapped-coordinates", { coord_type: coordType, wrapping_dim: wrappingDim, charge_rank: chargeRank })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析包裹坐标"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Consistent Truncation */}
        <TabsContent value="truncation">
          <Card>
            <CardHeader>
              <CardTitle>一致截断</CardTitle>
              <CardDescription>Kaluza-Klein球面约化与规范超引力 — 高维到低维的映射</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>截断类型</Label>
                  <Select value={truncationType} onValueChange={setTruncationType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRUNCATION_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>球面维度 Sⁿ</Label>
                  <Input type="number" value={sphereDim} onChange={(e) => setSphereDim(e.target.value)} min={1} max={7} />
                </div>
                <div className="space-y-2">
                  <Label>规范维度</Label>
                  <Input type="number" value={gaugeDim} onChange={(e) => setGaugeDim(e.target.value)} min={1} max={133} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/exceptional-field-theory/consistent-truncation", { truncation_type: truncationType, sphere_dim: sphereDim, gauge_dim: gaugeDim })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析一致截断"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Exceptional Lie Group */}
        <TabsContent value="exceptional-lie">
          <Card>
            <CardHeader>
              <CardTitle>例外李群</CardTitle>
              <CardDescription>E₆/E₇/E₈李代数、Freudenthal幻方与八元数结构</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>李群类型</Label>
                  <Select value={lieType} onValueChange={setLieType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXCEPTIONAL_LIE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>根系秩</Label>
                  <Input type="number" value={rootRank} onChange={(e) => setRootRank(e.target.value)} min={2} max={8} />
                </div>
                <div className="space-y-2">
                  <Label>代数维数</Label>
                  <Input type="number" value={algebraDim} onChange={(e) => setAlgebraDim(e.target.value)} min={14} max={248} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/exceptional-field-theory/exceptional-lie-group", { lie_type: lieType, root_rank: rootRank, algebra_dim: algebraDim })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析例外李群"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Double Field Theory */}
        <TabsContent value="double-field">
          <Card>
            <CardHeader>
              <CardTitle>Double Field Theory</CardTitle>
              <CardDescription>O(d,d)对偶协变形式论 — T对偶的显式实现</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>DFT类型</Label>
                  <Select value={dftType} onValueChange={setDftType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DFT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>倍增维度 2D</Label>
                  <Input type="number" value={ddDimension} onChange={(e) => setDdDimension(e.target.value)} min={1} max={10} />
                </div>
                <div className="space-y-2">
                  <Label>O(d,d)秩</Label>
                  <Input type="number" value={oddRank} onChange={(e) => setOddRank(e.target.value)} min={1} max={10} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/exceptional-field-theory/double-field-theory", { dft_type: dftType, dd_dimension: ddDimension, odd_rank: oddRank })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析Double Field Theory"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="text-center text-xs text-muted-foreground">
        Layer 62 — Exceptional Field Theory Engine v1.310.0 | 6 Enums × 6 Values = 36 | 7 Endpoints | Config Space: 6⁶ = 46656
      </div>
    </div>
  );
}
