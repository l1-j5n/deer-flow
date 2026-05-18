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
const WORLDSHEET_TYPES = [
  { value: "polyakov_action", label: "Polyakov作用量 Polyakov" },
  { value: "nambu_goto", label: "Nambu-Goto 南部-后藤" },
  { value: "lightcone_gauge", label: "光锥规范 Lightcone" },
  { value: "green_schwarz", label: "Green-Schwarz GS" },
  { value: "rns_formalism", label: "RNS形式论 RNS" },
  { value: "ai_worldsheet", label: "AI世界面 AI Worldsheet" },
];

const SPECTRUM_TYPES = [
  { value: "type_i", label: "Type I 开弦" },
  { value: "type_iib", label: "Type IIB IIB闭弦" },
  { value: "type_iia", label: "Type IIA IIA闭弦" },
  { value: "heterotic_e", label: "Heterotic E₈×E₈" },
  { value: "heterotic_o", label: "Heterotic SO(32)" },
  { value: "ai_spectrum", label: "AI谱 AI Spectrum" },
];

const T_DUALITY_TYPES = [
  { value: "buscher_rules", label: "Buscher规则 Buscher Rules" },
  { value: "rr_flux", label: "R-R通量 RR Flux" },
  { value: "nsns_sector", label: "NS-NS扇区 NS-NS Sector" },
  { value: "mirror_symmetry", label: "镜像对称 Mirror Symmetry" },
  { value: "topology_change", label: "拓扑变化 Topology Change" },
  { value: "ai_t_duality", label: "AI-T对偶 AI T-Duality" },
];

const S_DUALITY_TYPES = [
  { value: "montonen_olive", label: "Montonen-Olive对偶" },
  { value: "electric_magnetic", label: "电磁对偶 Electric-Magnetic" },
  { value: "sl2z_group", label: "SL(2,Z)群变换" },
  { value: "weak_strong", label: "弱强对偶 Weak-Strong" },
  { value: "dual_coupling", label: "对偶耦合 Dual Coupling" },
  { value: "ai_s_duality", label: "AI-S对偶 AI S-Duality" },
];

const CALABI_YAU_TYPES = [
  { value: "quintic_threefold", label: "五次超曲面 Quintic 3-fold" },
  { value: "toric_variety", label: "环面簇 Toric Variety" },
  { value: "elliptic_fibration", label: "椭圆纤维化 Elliptic Fibration" },
  { value: "orbifold_limit", label: "轨形极限 Orbifold Limit" },
  { value: "g2_manifold", label: "G₂流形 G₂ Manifold" },
  { value: "ai_calabi_yau", label: "AI-CY AI Calabi-Yau" },
];

const EFFECTIVE_TYPES = [
  { value: "kahler_potential", label: "Kähler势 Kähler Potential" },
  { value: "superpotential", label: "超势 Superpotential" },
  { value: "gauge_kinetic", label: "规范动能函数 Gauge Kinetic" },
  { value: "yukawa_coupling", label: "汤川耦合 Yukawa Coupling" },
  { value: "moduli_stabilization", label: "模稳定化 Moduli Stabilization" },
  { value: "ai_effective", label: "AI有效 AI Effective" },
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
export default function StringTheoryPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // Worldsheet CFT
  const [cftType, setCftType] = useState("polyakov_action");
  const [centralCharge, setCentralCharge] = useState("15");
  const [targetDim, setTargetDim] = useState("10");

  // Spectrum
  const [spectrumType, setSpectrumType] = useState("type_iia");
  const [spacetimeDim, setSpacetimeDim] = useState("10");
  const [susyLevel, setSusyLevel] = useState("2");

  // T-Duality
  const [tDualType, setTDualType] = useState("buscher_rules");
  const [compactRadius, setCompactRadius] = useState("1.0");
  const [windNumber, setWindNumber] = useState("1");

  // S-Duality
  const [sDualType, setSDualType] = useState("montonen_olive");
  const [couplingConst, setCouplingConst] = useState("0.1");
  const [gaugeRank, setGaugeRank] = useState("32");

  // Calabi-Yau
  const [cyType, setCyType] = useState("quintic_threefold");
  const [complexDim, setComplexDim] = useState("3");
  const [eulerNumber, setEulerNumber] = useState("-200");

  // Effective Action
  const [effType, setEffType] = useState("kahler_potential");
  const [fieldCount, setFieldCount] = useState("6");
  const [energyScale, setEnergyScale] = useState("1.0");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/string-theory/overview`);
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
            String Theory Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 59 — 世界面CFT / 超弦谱 / T-对偶 / S-对偶 / Calabi-Yau紧致化 / 有效4D作用量
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.307.0</Badge>
          <Badge variant="secondary">Layer 59</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="worldsheet">世界面CFT</TabsTrigger>
          <TabsTrigger value="spectrum">超弦谱</TabsTrigger>
          <TabsTrigger value="t-duality">T-对偶</TabsTrigger>
          <TabsTrigger value="s-duality">S-对偶</TabsTrigger>
          <TabsTrigger value="calabi-yau">CY紧致化</TabsTrigger>
          <TabsTrigger value="effective">有效作用量</TabsTrigger>
        </TabsList>

        {/* ── Overview ──────────────────────────────────────── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>String Theory Engine 概览</CardTitle>
              <CardDescription>
                弦论统一引擎 — 6枚举 × 6值 = 36值, 7 API端点
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

        {/* ── Worldsheet CFT ────────────────────────────────── */}
        <TabsContent value="worldsheet">
          <Card>
            <CardHeader>
              <CardTitle>世界面共形场论</CardTitle>
              <CardDescription>弦世界面CFT形式论分析 (Polyakov/Nambu-Goto/GS/RNS)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CFT类型</Label>
                  <Select value={cftType} onValueChange={setCftType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WORLDSHEET_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>中心荷 c</Label>
                  <Input type="number" step="0.5" value={centralCharge} onChange={(e) => setCentralCharge(e.target.value)} min={0} max={52} />
                </div>
                <div className="space-y-2">
                  <Label>目标维度</Label>
                  <Input type="number" value={targetDim} onChange={(e) => setTargetDim(e.target.value)} min={2} max={26} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory/worldsheet", {
                  cft_type: cftType, central_charge: centralCharge, target_dim: targetDim,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析世界面CFT"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Superstring Spectrum ───────────────────────────── */}
        <TabsContent value="spectrum">
          <Card>
            <CardHeader>
              <CardTitle>超弦谱分析</CardTitle>
              <CardDescription>五大一致超弦理论谱分析 (Type I/IIA/IIB/HE/HO)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>超弦类型</Label>
                  <Select value={spectrumType} onValueChange={setSpectrumType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SPECTRUM_TYPES.map((t) => (
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
                  <Label>超对称 N</Label>
                  <Input type="number" value={susyLevel} onChange={(e) => setSusyLevel(e.target.value)} min={0} max={8} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory/spectrum", {
                  spectrum_type: spectrumType, spacetime_dim: spacetimeDim, susy_level: susyLevel,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析超弦谱"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── T-Duality ─────────────────────────────────────── */}
        <TabsContent value="t-duality">
          <Card>
            <CardHeader>
              <CardTitle>T-对偶性分析</CardTitle>
              <CardDescription>紧致维T-对偶变换 (Buscher/镜像对称/拓扑变化)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>T-对偶类型</Label>
                  <Select value={tDualType} onValueChange={setTDualType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {T_DUALITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>紧致半径 R</Label>
                  <Input type="number" step="0.01" value={compactRadius} onChange={(e) => setCompactRadius(e.target.value)} min={0.01} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>缠绕数</Label>
                  <Input type="number" value={windNumber} onChange={(e) => setWindNumber(e.target.value)} min={0} max={100} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory/t-duality", {
                  duality_type: tDualType, compact_radius: compactRadius, wind_number: windNumber,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析T-对偶"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── S-Duality ─────────────────────────────────────── */}
        <TabsContent value="s-duality">
          <Card>
            <CardHeader>
              <CardTitle>S-对偶性分析</CardTitle>
              <CardDescription>强弱耦合对偶变换 (Montonen-Olive/SL(2,Z)/电磁对偶)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>S-对偶类型</Label>
                  <Select value={sDualType} onValueChange={setSDualType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {S_DUALITY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>弦耦合 gₛ</Label>
                  <Input type="number" step="0.01" value={couplingConst} onChange={(e) => setCouplingConst(e.target.value)} min={0.001} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>规范群秩</Label>
                  <Input type="number" value={gaugeRank} onChange={(e) => setGaugeRank(e.target.value)} min={1} max={64} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory/s-duality", {
                  duality_type: sDualType, coupling_const: couplingConst, rank: gaugeRank,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析S-对偶"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Calabi-Yau ────────────────────────────────────── */}
        <TabsContent value="calabi-yau">
          <Card>
            <CardHeader>
              <CardTitle>Calabi-Yau紧致化</CardTitle>
              <CardDescription>额外维Calabi-Yau流形紧致化分析 (五次超曲面/环面簇/椭圆纤维化/G₂)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CY流形类型</Label>
                  <Select value={cyType} onValueChange={setCyType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CALABI_YAU_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>复维度</Label>
                  <Input type="number" value={complexDim} onChange={(e) => setComplexDim(e.target.value)} min={1} max={6} />
                </div>
                <div className="space-y-2">
                  <Label>Euler数 χ</Label>
                  <Input type="number" value={eulerNumber} onChange={(e) => setEulerNumber(e.target.value)} min={-2000} max={2000} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory/calabi-yau", {
                  cy_type: cyType, complex_dim: complexDim, euler_number: eulerNumber,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析CY紧致化"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Effective 4D Action ────────────────────────────── */}
        <TabsContent value="effective">
          <Card>
            <CardHeader>
              <CardTitle>有效4D作用量</CardTitle>
              <CardDescription>低能有效4D超引力作用量分析 (Kähler势/超势/规范动能/汤川耦合/模稳定)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>作用量类型</Label>
                  <Select value={effType} onValueChange={setEffType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EFFECTIVE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>场数量</Label>
                  <Input type="number" value={fieldCount} onChange={(e) => setFieldCount(e.target.value)} min={1} max={128} />
                </div>
                <div className="space-y-2">
                  <Label>能标 (TeV)</Label>
                  <Input type="number" step="0.01" value={energyScale} onChange={(e) => setEnergyScale(e.target.value)} min={0.01} max={10000} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory/effective-action", {
                  action_type: effType, field_count: fieldCount, energy_scale: energyScale,
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析有效作用量"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="text-center text-xs text-muted-foreground">
        Layer 59 — String Theory Engine v1.307.0 | 6 Enums × 6 Values = 36 | 7 Endpoints | Config Space: 6⁶ = 46656
      </div>
    </div>
  );
}
