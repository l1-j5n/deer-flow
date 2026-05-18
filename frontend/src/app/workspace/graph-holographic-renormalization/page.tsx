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
const ADSCFT_TYPES = [
  { value: "maldacena_duality", label: "Maldacena对偶 Maldacena" },
  { value: "gauge_gravity", label: "规范/引力 Gauge/Gravity" },
  { value: "large_n_limit", label: "大N极限 Large N" },
  { value: "planar_diagrams", label: "平面图 Planar" },
  { value: "holographic_dictionary", label: "全息字典 Holo. Dict." },
  { value: "ai_ads_cft", label: "AI-AdS/CFT AI Dual" },
];

const UVIR_TYPES = [
  { value: "energy_radius", label: "能标/半径 E/R Map" },
  { value: "cutoff_matching", label: "截断匹配 Cutoff Match" },
  { value: "holographic_rg", label: "全息RG Holo. RG" },
  { value: "boundary_counterterms", label: "边界抵消项 Counterterms" },
  { value: "asymptotic_expansion", label: "渐近展开 FG Expansion" },
  { value: "ai_uv_ir", label: "AI-UV/IR AI UV/IR" },
];

const ANOMALY_TYPES = [
  { value: "weyl_anomaly", label: "Weyl反常 Weyl Anomaly" },
  { value: "trace_anomaly", label: "迹反常 Trace Anomaly" },
  { value: "conformal_anomaly", label: "共形反常 Conformal" },
  { value: "central_charges", label: "中心荷 Central Charges" },
  { value: "type_ab_anomaly", label: "A/B型反常 Type A/B" },
  { value: "ai_boundary_anomaly", label: "AI-边界反常 AI Anomaly" },
];

const WILSONIAN_TYPES = [
  { value: "holographic_wilson", label: "全息Wilson Holo. Wilson" },
  { value: "running_couplings", label: "跑动耦合 Running Coupl." },
  { value: "irrelevant_operators", label: "无关算子 Irrelevant Op." },
  { value: "double_trace", label: "双迹 Double-Trace" },
  { value: "beta_functions", label: "Beta函数 Beta Functions" },
  { value: "ai_wilsonian", label: "AI-Wilsonian AI Wilson" },
];

const RG_FLOW_TYPES = [
  { value: "c_theorem", label: "c-定理 c-Theorem" },
  { value: "a_theorem", label: "a-定理 a-Theorem" },
  { value: "f_theorem", label: "F-定理 F-Theorem" },
  { value: "monotonicity", label: "单调性 Monotonicity" },
  { value: "gradient_flow", label: "梯度流 Gradient Flow" },
  { value: "ai_rg_flow", label: "AI-RG流 AI RG Flow" },
];

const TAU_TYPES = [
  { value: "isomonodromic_tau", label: "等单值τ Isomonodromic τ" },
  { value: "cft_tau", label: "CFT τ函数 CFT τ" },
  { value: "painleve_equations", label: "Painlevé方程 Painlevé" },
  { value: "universal_unfolded", label: "普适展开 Universal Unf." },
  { value: "hirota_equations", label: "Hirota方程 Hirota Eq." },
  { value: "ai_tau_function", label: "AI-Tau函数 AI τ" },
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
export default function HolographicRenormalizationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // AdS/CFT
  const [adsCftType, setAdsCftType] = useState("maldacena_duality");
  const [spacetimeDim, setSpacetimeDim] = useState("4");
  const [boundaryDim, setBoundaryDim] = useState("3");
  const [nColor, setNColor] = useState("4");
  const [coupling, setCoupling] = useState("strong");

  // UV/IR
  const [uvirType, setUvirType] = useState("energy_radius");
  const [bulkDim, setBulkDim] = useState("5");
  const [cutoffScale, setCutoffScale] = useState("UV");
  const [energyScale, setEnergyScale] = useState("1.0");

  // Boundary Anomaly
  const [anomalyType, setAnomalyType] = useState("weyl_anomaly");
  const [anomalyBoundaryDim, setAnomalyBoundaryDim] = useState("4");
  const [centralChargeA, setCentralChargeA] = useState("0");
  const [centralChargeC, setCentralChargeC] = useState("0");

  // Wilsonian
  const [wilsonianType, setWilsonianType] = useState("holographic_wilson");
  const [wilsonEnergyScale, setWilsonEnergyScale] = useState("1.0");
  const [operatorDim, setOperatorDim] = useState("4");
  const [numCouplings, setNumCouplings] = useState("3");

  // RG Flow
  const [rgType, setRgType] = useState("c_theorem");
  const [rgSpacetimeDim, setRgSpacetimeDim] = useState("2");
  const [centralChargeC2, setCentralChargeC2] = useState("1.0");
  const [flowDirection, setFlowDirection] = useState("UV_to_IR");

  // Tau Function
  const [tauType, setTauType] = useState("isomonodromic_tau");
  const [painleveType, setPainleveType] = useState("PVI");
  const [monodromyDim, setMonodromyDim] = useState("2");
  const [irregularRank, setIrregularRank] = useState("0");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/holographic-renormalization/overview`);
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
            Holographic Renormalization Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 63 — AdS/CFT对应 / UV-IR联系 / 边界反常 / Wilsonian有效作用量 / RG流 / Tau函数
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.311.0</Badge>
          <Badge variant="secondary">Layer 63</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ads-cft">AdS/CFT</TabsTrigger>
          <TabsTrigger value="uv-ir">UV/IR</TabsTrigger>
          <TabsTrigger value="boundary-anomaly">边界反常</TabsTrigger>
          <TabsTrigger value="wilsonian">Wilsonian</TabsTrigger>
          <TabsTrigger value="rg-flow">RG流</TabsTrigger>
          <TabsTrigger value="tau-function">Tau函数</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Holographic Renormalization Engine 概览</CardTitle>
              <CardDescription>
                全息重正化统一引擎 — 6枚举 × 6值 = 36值, 7 API端点
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

        {/* AdS/CFT Correspondence */}
        <TabsContent value="ads-cft">
          <Card>
            <CardHeader>
              <CardTitle>AdS/CFT对应 (AdS/CFT Correspondence)</CardTitle>
              <CardDescription>Maldacena对偶 — 规范理论与引力的深层等价性</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>对应类型</Label>
                  <Select value={adsCftType} onValueChange={setAdsCftType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ADSCFT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>时空维度 D</Label>
                  <Input type="number" value={spacetimeDim} onChange={(e) => setSpacetimeDim(e.target.value)} min={2} max={11} />
                </div>
                <div className="space-y-2">
                  <Label>边界维度 d</Label>
                  <Input type="number" value={boundaryDim} onChange={(e) => setBoundaryDim(e.target.value)} min={1} max={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>N (颜色数)</Label>
                  <Input type="number" value={nColor} onChange={(e) => setNColor(e.target.value)} min={2} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>耦合强度</Label>
                  <Select value={coupling} onValueChange={setCoupling}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strong">强耦合 Strong</SelectItem>
                      <SelectItem value="weak">弱耦合 Weak</SelectItem>
                      <SelectItem value="planar">平面极限 Planar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/holographic-renormalization/ads-cft", {
                  correspondence_type: adsCftType, spacetime_dim: spacetimeDim,
                  boundary_dim: boundaryDim, n_color: nColor, coupling: coupling
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析AdS/CFT对应"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* UV/IR Connection */}
        <TabsContent value="uv-ir">
          <Card>
            <CardHeader>
              <CardTitle>UV/IR联系 (UV-IR Connection)</CardTitle>
              <CardDescription>能量标度与径向坐标的对偶映射 — 全息重正化的几何基础</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>联系类型</Label>
                  <Select value={uvirType} onValueChange={setUvirType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UVIR_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>体维度 (Bulk dim)</Label>
                  <Input type="number" value={bulkDim} onChange={(e) => setBulkDim(e.target.value)} min={3} max={11} />
                </div>
                <div className="space-y-2">
                  <Label>截断标度</Label>
                  <Select value={cutoffScale} onValueChange={setCutoffScale}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UV">UV截断 (近边界)</SelectItem>
                      <SelectItem value="IR">IR截断 (深体)</SelectItem>
                      <SelectItem value="both">双向截断</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>能标 μ</Label>
                  <Input type="number" value={energyScale} onChange={(e) => setEnergyScale(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/holographic-renormalization/uv-ir", {
                  connection_type: uvirType, bulk_dim: bulkDim,
                  cutoff_scale: cutoffScale, energy_scale: energyScale
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析UV/IR联系"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Boundary Anomaly */}
        <TabsContent value="boundary-anomaly">
          <Card>
            <CardHeader>
              <CardTitle>边界反常 (Boundary Anomaly)</CardTitle>
              <CardDescription>Weyl反常、迹反常与中心荷 — 共形对称性的量子破缺</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>反常类型</Label>
                  <Select value={anomalyType} onValueChange={setAnomalyType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ANOMALY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>边界维度 d</Label>
                  <Input type="number" value={anomalyBoundaryDim} onChange={(e) => setAnomalyBoundaryDim(e.target.value)} min={2} max={6} />
                </div>
                <div className="space-y-2">
                  <Label>中心荷 a</Label>
                  <Input type="number" value={centralChargeA} onChange={(e) => setCentralChargeA(e.target.value)} step={0.01} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>中心荷 c</Label>
                  <Input type="number" value={centralChargeC} onChange={(e) => setCentralChargeC(e.target.value)} step={0.01} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/holographic-renormalization/boundary-anomaly", {
                  anomaly_type: anomalyType, boundary_dim: anomalyBoundaryDim,
                  central_charge_a: centralChargeA, central_charge_c: centralChargeC
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析边界反常"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wilsonian Effective Action */}
        <TabsContent value="wilsonian">
          <Card>
            <CardHeader>
              <CardTitle>Wilsonian有效作用量</CardTitle>
              <CardDescription>全息Wilsonian RG — 重正化群的引力实现</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Wilsonian类型</Label>
                  <Select value={wilsonianType} onValueChange={setWilsonianType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WILSONIAN_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>能标 μ</Label>
                  <Input type="number" value={wilsonEnergyScale} onChange={(e) => setWilsonEnergyScale(e.target.value)} step={0.1} min={0.01} />
                </div>
                <div className="space-y-2">
                  <Label>算子维度 Δ</Label>
                  <Input type="number" value={operatorDim} onChange={(e) => setOperatorDim(e.target.value)} min={1} max={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>耦合数量</Label>
                  <Input type="number" value={numCouplings} onChange={(e) => setNumCouplings(e.target.value)} min={1} max={20} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/holographic-renormalization/wilsonian-effective", {
                  wilsonian_type: wilsonianType, energy_scale: wilsonEnergyScale,
                  operator_dim: operatorDim, num_couplings: numCouplings
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析Wilsonian有效作用量"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RG Flow */}
        <TabsContent value="rg-flow">
          <Card>
            <CardHeader>
              <CardTitle>重正化群流 (RG Flow)</CardTitle>
              <CardDescription>c/a/F定理与梯度流 — 量子场论的普适单调性</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>RG类型</Label>
                  <Select value={rgType} onValueChange={setRgType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {RG_FLOW_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>时空维度 d</Label>
                  <Input type="number" value={rgSpacetimeDim} onChange={(e) => setRgSpacetimeDim(e.target.value)} min={2} max={6} />
                </div>
                <div className="space-y-2">
                  <Label>中心荷 c</Label>
                  <Input type="number" value={centralChargeC2} onChange={(e) => setCentralChargeC2(e.target.value)} step={0.1} min={0} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>流方向</Label>
                  <Select value={flowDirection} onValueChange={setFlowDirection}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UV_to_IR">UV → IR (能量降低)</SelectItem>
                      <SelectItem value="IR_to_UV">IR → UV (能量升高)</SelectItem>
                      <SelectItem value="both">双向</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/holographic-renormalization/rg-flow", {
                  rg_type: rgType, spacetime_dim: rgSpacetimeDim,
                  central_charge_c: centralChargeC2, flow_direction: flowDirection
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析RG流"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tau Function */}
        <TabsContent value="tau-function">
          <Card>
            <CardHeader>
              <CardTitle>Tau函数 (Tau Function)</CardTitle>
              <CardDescription>等单值τ函数与Painlevé方程 — 可积系统的万能生成函数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tau类型</Label>
                  <Select value={tauType} onValueChange={setTauType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TAU_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Painlevé类型</Label>
                  <Select value={painleveType} onValueChange={setPainleveType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PVI">PVI (最一般)</SelectItem>
                      <SelectItem value="PV">PV</SelectItem>
                      <SelectItem value="PIV">PIV</SelectItem>
                      <SelectItem value="PIII">PIII</SelectItem>
                      <SelectItem value="PII">PII</SelectItem>
                      <SelectItem value="PI">PI (最简)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>单值维度</Label>
                  <Input type="number" value={monodromyDim} onChange={(e) => setMonodromyDim(e.target.value)} min={2} max={8} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>不规则秩</Label>
                  <Input type="number" value={irregularRank} onChange={(e) => setIrregularRank(e.target.value)} min={0} max={4} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/holographic-renormalization/tau-function", {
                  tau_type: tauType, painleve_type: painleveType,
                  monodromy_dim: monodromyDim, irregular_rank: irregularRank
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析Tau函数"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="text-center text-xs text-muted-foreground">
        Layer 63 — Holographic Renormalization Engine v1.311.0 | 6 Enums × 6 Values = 36 | 7 Endpoints | Config Space: 6⁶ = 46656
      </div>
    </div>
  );
}
