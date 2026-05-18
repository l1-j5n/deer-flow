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
const GEOMETRY_TYPES = [
  { value: "twelve_d_geometry", label: "12维几何 12D Geometry" },
  { value: "elliptic_fibration", label: "椭圆纤维化 Elliptic Fib." },
  { value: "weierstrass_model", label: "Weierstrass模型 Weierstrass" },
  { value: "kodaira_fiber", label: "Kodaira纤维 Kodaira" },
  { value: "discriminant_locus", label: "判别轨迹 Discriminant" },
  { value: "ai_f_theory_geom", label: "AI-FGeom AI Geometry" },
];

const SL2_TYPES = [
  { value: "sl2z_monodromy", label: "SL(2,Z)单值 SL(2,Z)" },
  { value: "axio_dilaton", label: "轴子-伸缩子 Axio-Dilaton τ" },
  { value: "modular_parameter", label: "模参数 Modular τ" },
  { value: "b_field_holonomy", label: "B场全位相 B-field" },
  { value: "j_invariant", label: "j不变量 j(τ)" },
  { value: "ai_sl2_fibration", label: "AI-SL2 AI Fibration" },
];

const ORIENTIFOLD_TYPES = [
  { value: "op_plane", label: "O平面 O-Plane" },
  { value: "z2_involution", label: "Z₂对合 Z₂ Action" },
  { value: "fixed_locus", label: "不动点轨迹 Fixed Locus" },
  { value: "charge_conjugation", label: "电荷共轭 C-Conjugation" },
  { value: "tadpole_cancellation", label: "Tadpole消去 Tadpole Cancel" },
  { value: "ai_orientifold", label: "AI-Orientifold AI Orien." },
];

const D7_TYPES = [
  { value: "d7_stack", label: "D7膜堆 Stack" },
  { value: "gauge_group", label: "规范群 Gauge Group" },
  { value: "matter_curve", label: "物质曲线 Matter Curve" },
  { value: "yukawa_point", label: "汤川耦合点 Yukawa Point" },
  { value: "spectral_cover", label: "谱覆盖 Spectral Cover" },
  { value: "ai_d7_brane", label: "AI-D7 AI Brane" },
];

const TATE_TYPES = [
  { value: "tate_algorithm", label: "Tate算法 Tate Algorithm" },
  { value: "weierstrass_coefficients", label: "Weierstrass系数 Coeffs" },
  { value: "kodaira_classification", label: "Kodaira分类 Kodaira Class" },
  { value: "singularity_type", label: "奇点类型 Singularity" },
  { value: "enhancement", label: "增强链 Enhancement" },
  { value: "ai_tate_form", label: "AI-Tate AI Tate" },
];

const WEAK_COUPLING_TYPES = [
  { value: "sen_limit", label: "Sen极限 Sen Limit" },
  { value: "perturbative_limit", label: "微扰极限 Perturbative" },
  { value: "coupling_constant", label: "耦合常数 gₛ" },
  { value: "orientifold_transition", label: "Orientifold跃迁 Orien. Trans." },
  { value: "type_iib_dual", label: "IIB对偶 Type IIB Dual" },
  { value: "ai_weak_coupling", label: "AI-WeakCoupling AI Limit" },
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
export default function FTheoryPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // Geometry
  const [geometryType, setGeometryType] = useState("twelve_d_geometry");
  const [fiberDim, setFiberDim] = useState("2");
  const [g4Param, setG4Param] = useState("1.0");

  // SL(2,Z) Fibration
  const [sl2Type, setSl2Type] = useState("sl2z_monodromy");
  const [tauParam, setTauParam] = useState("0.0");
  const [bField, setBField] = useState("0.5");

  // Orientifold
  const [orientifoldType, setOrientifoldType] = useState("op_plane");
  const [involutionDim, setInvolutionDim] = useState("6");
  const [opCharge, setOpCharge] = useState("-1");

  // D7-Brane
  const [d7Type, setD7Type] = useState("d7_stack");
  const [stackSize, setStackSize] = useState("4");
  const [rankGroup, setRankGroup] = useState("4");

  // Tate Form
  const [tateType, setTateType] = useState("tate_algorithm");
  const [vanishingOrder, setVanishingOrder] = useState("1");
  const [singularityRank, setSingularityRank] = useState("6");

  // Weak Coupling
  const [couplingType, setCouplingType] = useState("sen_limit");
  const [gsCoupling, setGsCoupling] = useState("0.1");
  const [senParam, setSenParam] = useState("0.01");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/f-theory/overview`);
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
            F-Theory Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 61 — 12维几何 / SL(2,Z)纤维化 / Orientifold / D7膜 / Tate形式 / 弱耦合极限
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.309.0</Badge>
          <Badge variant="secondary">Layer 61</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="geometry">F几何</TabsTrigger>
          <TabsTrigger value="sl2-fibration">SL(2,Z)</TabsTrigger>
          <TabsTrigger value="orientifold">Orientifold</TabsTrigger>
          <TabsTrigger value="d7-brane">D7膜</TabsTrigger>
          <TabsTrigger value="tate-form">Tate形式</TabsTrigger>
          <TabsTrigger value="weak-coupling">弱耦合</TabsTrigger>
        </TabsList>

        {/* ── Overview ──────────────────────────────────────── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>F-Theory Engine 概览</CardTitle>
              <CardDescription>
                F理论统一引擎 — 6枚举 × 6值 = 36值, 7 API端点
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

        {/* ── Geometry ─────────────────────────────────────── */}
        <TabsContent value="geometry">
          <Card>
            <CardHeader>
              <CardTitle>F理论几何 (12D Geometry)</CardTitle>
              <CardDescription>12维几何、椭圆纤维化与Weierstrass模型 — F理论的基础几何框架</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>几何类型</Label>
                  <Select value={geometryType} onValueChange={setGeometryType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GEOMETRY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>纤维维度</Label>
                  <Input type="number" value={fiberDim} onChange={(e) => setFiberDim(e.target.value)} min={1} max={12} />
                </div>
                <div className="space-y-2">
                  <Label>Weierstrass g₄</Label>
                  <Input type="number" step="0.1" value={g4Param} onChange={(e) => setG4Param(e.target.value)} min={-100} max={100} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/f-theory/geometry", {
                  geometry_type: geometryType, fiber_dimension: fiberDim, weierstrass_g4: g4Param,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析F理论几何"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SL(2,Z) Fibration ─────────────────────────────── */}
        <TabsContent value="sl2-fibration">
          <Card>
            <CardHeader>
              <CardTitle>SL(2,Z)纤维化</CardTitle>
              <CardDescription>IIB型弦论S-对偶几何 — 轴子-伸缩子τ与模参数空间</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>纤维化类型</Label>
                  <Select value={sl2Type} onValueChange={setSl2Type}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SL2_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>τ参数 (模参数)</Label>
                  <Input type="number" step="0.1" value={tauParam} onChange={(e) => setTauParam(e.target.value)} min={-10} max={10} />
                </div>
                <div className="space-y-2">
                  <Label>B场值</Label>
                  <Input type="number" step="0.1" value={bField} onChange={(e) => setBField(e.target.value)} min={0} max={10} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/f-theory/sl2-fibration", {
                  fibration_type: sl2Type, tau_parameter: tauParam, b_field_val: bField,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析SL(2,Z)纤维化"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Orientifold ──────────────────────────────────── */}
        <TabsContent value="orientifold">
          <Card>
            <CardHeader>
              <CardTitle>Orientifold分析</CardTitle>
              <CardDescription>O平面、Z₂对合与Tadpole消去条件 — F理论的几何约束</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Orientifold类型</Label>
                  <Select value={orientifoldType} onValueChange={setOrientifoldType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ORIENTIFOLD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>对合维度</Label>
                  <Input type="number" value={involutionDim} onChange={(e) => setInvolutionDim(e.target.value)} min={2} max={12} />
                </div>
                <div className="space-y-2">
                  <Label>O平面电荷</Label>
                  <Input type="number" value={opCharge} onChange={(e) => setOpCharge(e.target.value)} min={-16} max={0} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/f-theory/orientifold", {
                  orientifold_type: orientifoldType, involution_dim: involutionDim, op_charge: opCharge,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析Orientifold"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── D7-Brane ──────────────────────────────────────── */}
        <TabsContent value="d7-brane">
          <Card>
            <CardHeader>
              <CardTitle>D7膜分析</CardTitle>
              <CardDescription>F理论基本对象 — D7膜规范群、物质曲线与汤川耦合</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>D7膜类型</Label>
                  <Select value={d7Type} onValueChange={setD7Type}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {D7_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>膜堆大小 N</Label>
                  <Input type="number" value={stackSize} onChange={(e) => setStackSize(e.target.value)} min={1} max={16} />
                </div>
                <div className="space-y-2">
                  <Label>规范群秩</Label>
                  <Input type="number" value={rankGroup} onChange={(e) => setRankGroup(e.target.value)} min={1} max={8} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/f-theory/d7-brane", {
                  brane_type: d7Type, stack_size: stackSize, rank_group: rankGroup,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析D7膜"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tate Form ─────────────────────────────────────── */}
        <TabsContent value="tate-form">
          <Card>
            <CardHeader>
              <CardTitle>Tate形式分析</CardTitle>
              <CardDescription>椭圆纤维化代数描述 — Tate算法与Kodaira奇点分类</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tate类型</Label>
                  <Select value={tateType} onValueChange={setTateType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TATE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>消没阶数 ord</Label>
                  <Input type="number" value={vanishingOrder} onChange={(e) => setVanishingOrder(e.target.value)} min={0} max={10} />
                </div>
                <div className="space-y-2">
                  <Label>奇点秩</Label>
                  <Input type="number" value={singularityRank} onChange={(e) => setSingularityRank(e.target.value)} min={1} max={8} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/f-theory/tate-form", {
                  tate_type: tateType, vanishing_order: vanishingOrder, singularity_rank: singularityRank,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析Tate形式"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Weak Coupling ─────────────────────────────────── */}
        <TabsContent value="weak-coupling">
          <Card>
            <CardHeader>
              <CardTitle>弱耦合极限</CardTitle>
              <CardDescription>Sen极限与Type IIB对偶 — F理论到弦论的过渡</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>耦合类型</Label>
                  <Select value={couplingType} onValueChange={setCouplingType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WEAK_COUPLING_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>弦耦合 gₛ</Label>
                  <Input type="number" step="0.01" value={gsCoupling} onChange={(e) => setGsCoupling(e.target.value)} min={0.001} max={10} />
                </div>
                <div className="space-y-2">
                  <Label>Sen参数 ε</Label>
                  <Input type="number" step="0.001" value={senParam} onChange={(e) => setSenParam(e.target.value)} min={0.001} max={1} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/f-theory/weak-coupling", {
                  coupling_type: couplingType, gs_coupling: gsCoupling, sen_param: senParam,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析弱耦合极限"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="text-center text-xs text-muted-foreground">
        Layer 61 — F-Theory Engine v1.309.0 | 6 Enums × 6 Values = 36 | 7 Endpoints | Config Space: 6⁶ = 46656
      </div>
    </div>
  );
}
