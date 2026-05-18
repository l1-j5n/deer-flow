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
const STRING_TYPES = [
  { value: "bosonic_string", label: "玻色弦 Bosonic" },
  { value: "superstring_type_ii", label: "II型超弦 Type II" },
  { value: "heterotic_string", label: "杂化弦 Heterotic" },
  { value: "type_i_string", label: "I型弦 Type I" },
  { value: "green_schwarz", label: "Green-Schwarz GS" },
  { value: "ai_perturbative", label: "AI微扰弦 AI PST" },
];

const M_THEORY_TYPES = [
  { value: "m_brane", label: "M膜 M-Brane" },
  { value: "matrix_theory", label: "矩阵理论 BFSS" },
  { value: "f_theory", label: "F理论 F-Theory" },
  { value: "s_duality", label: "S对偶 S-Duality" },
  { value: "t_duality", label: "T对偶 T-Duality" },
  { value: "ai_m_theory", label: "AI M理论 AI MT" },
];

const COMPACT_TYPES = [
  { value: "calabi_yau", label: "Calabi-Yau CY" },
  { value: "orbifold", label: "轨形 Orbifold" },
  { value: "flux_compactification", label: "通量紧致化 Flux" },
  { value: "moduli_stabilization", label: "模稳定 KKLT" },
  { value: "landscape_swampland", label: "景观/沼泽 Landscape" },
  { value: "ai_compactification", label: "AI紧致化 AI Comp" },
];

const PHENO_TYPES = [
  { value: "gut_models", label: "GUT模型 E8×E8" },
  { value: "susy_breaking", label: "SUSY破缺 SUSY" },
  { value: "axion_physics", label: "轴子物理 Axion" },
  { value: "mirror_symmetry", label: "镜像对称 Mirror" },
  { value: "string_inflation", label: "弦暴胀 String Infl." },
  { value: "ai_phenomenology", label: "AI唯象学 AI Pheno" },
];

const HOLO_TYPES = [
  { value: "ads_cft_correspondence", label: "AdS/CFT对偶" },
  { value: "bulk_boundary", label: "体/边界 Bulk-Bdy" },
  { value: "holographic_renormalization", label: "全息重正化" },
  { value: "entanglement_holography", label: "纠缠全息 EE" },
  { value: "code_subspace", label: "码子空间 Code" },
  { value: "ai_holographic", label: "AI全息 AI Holo" },
];

const ADSCFT_TYPES = [
  { value: "ads_cmt", label: "AdS/CMT 全息SC" },
  { value: "ads_qcd", label: "AdS/QCD 全息QCD" },
  { value: "fluid_gravity", label: "流体/引力 Fluid" },
  { value: "kerr_cft", label: "Kerr/CFT" },
  { value: "random_matrix", label: "随机矩阵 SYK" },
  { value: "ai_ads_cft_app", label: "AI AdS/CFT AI" },
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
export default function StringTheoryUnificationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  // Perturbative String
  const [stringType, setStringType] = useState("bosonic_string");
  const [stringCoupling, setStringCoupling] = useState("0.1");
  const [stringLength, setStringLength] = useState("1.616e-33");
  const [worldsheetGenus, setWorldsheetGenus] = useState("0");
  const [spacetimeDim, setSpacetimeDim] = useState("10");

  // M-Theory
  const [mType, setMType] = useState("m_brane");
  const [numDbranes, setNumDbranes] = useState("1");
  const [couplingConstant, setCouplingConstant] = useState("1.0");
  const [matrixSize, setMatrixSize] = useState("9");
  const [targetDimension, setTargetDimension] = useState("11");

  // Compactification
  const [compType, setCompType] = useState("calabi_yau");
  const [hodgeNumbers, setHodgeNumbers] = useState("100");
  const [eulerCharacteristic, setEulerCharacteristic] = useState("-200");
  const [fluxQuanta, setFluxQuanta] = useState("100");
  const [moduliFields, setModuliFields] = useState("50");

  // Phenomenology
  const [phenoType, setPhenoType] = useState("gut_models");
  const [gaugeGroup, setGaugeGroup] = useState("E8×E8");
  const [susyScale, setSusyScale] = useState("1e16");
  const [yukawaCouplings, setYukawaCouplings] = useState("0.01");
  const [compactRadius, setCompactRadius] = useState("1e-32");

  // Holographic Principle
  const [holoType, setHoloType] = useState("ads_cft_correspondence");
  const [adsRadius, setAdsRadius] = useState("1.0");
  const [boundaryDim, setBoundaryDim] = useState("4");
  const [centralCharge, setCentralCharge] = useState("100.0");
  const [nSectors, setNSectors] = useState("10");

  // AdS/CFT Application
  const [appType, setAppType] = useState("ads_cmt");
  const [temperature, setTemperature] = useState("1.0");
  const [couplingStrength, setCouplingStrength] = useState("10.0");
  const [chemicalPotential, setChemicalPotential] = useState("0.5");
  const [fieldContent, setFieldContent] = useState("N=4 SYM");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/string-theory-unification/overview`);
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
            String Theory Unification Engine
          </h1>
          <p className="text-muted-foreground">
            Layer 66 — 微扰弦论 / M理论 / 紧致化 / 弦唯象学 / 全息原理 / AdS/CFT应用
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.314.0</Badge>
          <Badge variant="secondary">Layer 66</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="perturbative">微扰弦论</TabsTrigger>
          <TabsTrigger value="m-theory">M理论</TabsTrigger>
          <TabsTrigger value="compactification">紧致化</TabsTrigger>
          <TabsTrigger value="phenomenology">弦唯象学</TabsTrigger>
          <TabsTrigger value="holographic">全息原理</TabsTrigger>
          <TabsTrigger value="ads-cft">AdS/CFT应用</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>String Theory Unification Engine 概览</CardTitle>
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

        {/* Perturbative String */}
        <TabsContent value="perturbative">
          <Card>
            <CardHeader>
              <CardTitle>微扰弦论 (Perturbative String Theory)</CardTitle>
              <CardDescription>玻色弦/超弦/杂化弦 — 世界面微扰展开的弦量子场论</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>弦类型</Label>
                  <Select value={stringType} onValueChange={setStringType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STRING_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>弦耦合常数 g_s</Label>
                  <Input type="number" value={stringCoupling} onChange={(e) => setStringCoupling(e.target.value)} step={0.01} min={0.001} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>弦长度 l_s (m)</Label>
                  <Input type="text" value={stringLength} onChange={(e) => setStringLength(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>世界面亏格 g</Label>
                  <Input type="number" value={worldsheetGenus} onChange={(e) => setWorldsheetGenus(e.target.value)} min={0} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>时空维度 D</Label>
                  <Input type="number" value={spacetimeDim} onChange={(e) => setSpacetimeDim(e.target.value)} min={2} max={26} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory-unification/perturbative-string", {
                  string_type: stringType, string_coupling: stringCoupling,
                  string_length: stringLength, worldsheet_genus: worldsheetGenus, spacetime_dim: spacetimeDim
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析微扰弦论"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* M-Theory */}
        <TabsContent value="m-theory">
          <Card>
            <CardHeader>
              <CardTitle>M理论 (M-Theory)</CardTitle>
              <CardDescription>M膜/矩阵理论/F理论/S对偶/T对偶 — 弦论的终极统一</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>M理论类型</Label>
                  <Select value={mType} onValueChange={setMType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {M_THEORY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>D膜数 N</Label>
                  <Input type="number" value={numDbranes} onChange={(e) => setNumDbranes(e.target.value)} min={1} max={1000} />
                </div>
                <div className="space-y-2">
                  <Label>耦合常数 g</Label>
                  <Input type="number" value={couplingConstant} onChange={(e) => setCouplingConstant(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>矩阵大小 N×N</Label>
                  <Input type="number" value={matrixSize} onChange={(e) => setMatrixSize(e.target.value)} min={1} max={100} />
                </div>
                <div className="space-y-2">
                  <Label>目标维度 D</Label>
                  <Input type="number" value={targetDimension} onChange={(e) => setTargetDimension(e.target.value)} min={2} max={11} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory-unification/m-theory", {
                  m_type: mType, num_dbranes: numDbranes,
                  coupling_constant: couplingConstant, matrix_size: matrixSize, target_dimension: targetDimension
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析M理论"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compactification */}
        <TabsContent value="compactification">
          <Card>
            <CardHeader>
              <CardTitle>紧致化 (Compactification)</CardTitle>
              <CardDescription>Calabi-Yau/轨形/通量紧致化/KKLT模稳定 — 额外维度的几何</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>紧致化类型</Label>
                  <Select value={compType} onValueChange={setCompType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COMPACT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hodge数 (h^{1,1})</Label>
                  <Input type="number" value={hodgeNumbers} onChange={(e) => setHodgeNumbers(e.target.value)} min={1} max={10000} />
                </div>
                <div className="space-y-2">
                  <Label>Euler特征 χ</Label>
                  <Input type="number" value={eulerCharacteristic} onChange={(e) => setEulerCharacteristic(e.target.value)} min={-100000} max={100000} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>通量量子数 N_flux</Label>
                  <Input type="number" value={fluxQuanta} onChange={(e) => setFluxQuanta(e.target.value)} min={0} max={10000} />
                </div>
                <div className="space-y-2">
                  <Label>模场数 n_mod</Label>
                  <Input type="number" value={moduliFields} onChange={(e) => setModuliFields(e.target.value)} min={1} max={1000} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory-unification/compactification", {
                  comp_type: compType, hodge_numbers: hodgeNumbers,
                  euler_characteristic: eulerCharacteristic, flux_quanta: fluxQuanta, moduli_fields: moduliFields
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析紧致化"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* String Phenomenology */}
        <TabsContent value="phenomenology">
          <Card>
            <CardHeader>
              <CardTitle>弦唯象学 (String Phenomenology)</CardTitle>
              <CardDescription>GUT模型/SUSY破缺/轴子物理/镜像对称 — 弦论与粒子物理的桥梁</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>唯象类型</Label>
                  <Select value={phenoType} onValueChange={setPhenoType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PHENO_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>规范群 G</Label>
                  <Input type="text" value={gaugeGroup} onChange={(e) => setGaugeGroup(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>SUSY能标 (GeV)</Label>
                  <Input type="text" value={susyScale} onChange={(e) => setSusyScale(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>汤川耦合 Y</Label>
                  <Input type="number" value={yukawaCouplings} onChange={(e) => setYukawaCouplings(e.target.value)} step={0.001} min={0} max={1} />
                </div>
                <div className="space-y-2">
                  <Label>紧致半径 R (m)</Label>
                  <Input type="text" value={compactRadius} onChange={(e) => setCompactRadius(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory-unification/string-phenomenology", {
                  pheno_type: phenoType, gauge_group: gaugeGroup,
                  susy_scale: susyScale, yukawa_couplings: yukawaCouplings, compact_radius: compactRadius
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析弦唯象学"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Holographic Principle */}
        <TabsContent value="holographic">
          <Card>
            <CardHeader>
              <CardTitle>全息原理 (Holographic Principle)</CardTitle>
              <CardDescription>AdS/CFT对偶/体边界对应/全息重正化/纠缠全息 — 量子引力的信息原理</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>全息类型</Label>
                  <Select value={holoType} onValueChange={setHoloType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HOLO_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>AdS半径 L</Label>
                  <Input type="number" value={adsRadius} onChange={(e) => setAdsRadius(e.target.value)} step={0.1} min={0.01} />
                </div>
                <div className="space-y-2">
                  <Label>边界维度 d</Label>
                  <Input type="number" value={boundaryDim} onChange={(e) => setBoundaryDim(e.target.value)} min={1} max={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>中心荷 c</Label>
                  <Input type="number" value={centralCharge} onChange={(e) => setCentralCharge(e.target.value)} step={1} min={1} />
                </div>
                <div className="space-y-2">
                  <Label>扇区数 n</Label>
                  <Input type="number" value={nSectors} onChange={(e) => setNSectors(e.target.value)} min={1} max={1000} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory-unification/holographic-principle", {
                  holo_type: holoType, ads_radius: adsRadius,
                  boundary_dim: boundaryDim, central_charge: centralCharge, n_sectors: nSectors
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析全息原理"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AdS/CFT Application */}
        <TabsContent value="ads-cft">
          <Card>
            <CardHeader>
              <CardTitle>AdS/CFT应用 (AdS/CFT Applications)</CardTitle>
              <CardDescription>AdS/CMT/AdS/QCD/流体引力/Kerr-CFT/SYK — 全息对偶的实际应用</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>应用类型</Label>
                  <Select value={appType} onValueChange={setAppType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ADSCFT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>温度 T</Label>
                  <Input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} step={0.1} min={0.01} />
                </div>
                <div className="space-y-2">
                  <Label>耦合强度 λ</Label>
                  <Input type="number" value={couplingStrength} onChange={(e) => setCouplingStrength(e.target.value)} step={0.1} min={0.01} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>化学势 μ</Label>
                  <Input type="number" value={chemicalPotential} onChange={(e) => setChemicalPotential(e.target.value)} step={0.1} min={0} />
                </div>
                <div className="space-y-2">
                  <Label>场内容</Label>
                  <Input type="text" value={fieldContent} onChange={(e) => setFieldContent(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={() => postEndpoint("/graph/string-theory-unification/ads-cft-application", {
                  app_type: appType, temperature: temperature,
                  coupling_strength: couplingStrength, chemical_potential: chemicalPotential, field_content: fieldContent
                })}
                disabled={loading}
              >
                {loading ? "分析中..." : "分析AdS/CFT应用"}
              </Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="text-center text-xs text-muted-foreground">
        Layer 66 — String Theory Unification Engine v1.314.0 | 6 Enums × 6 Values = 36 | 7 Endpoints | Config Space: 6⁶ = 46656
      </div>
    </div>
  );
}
