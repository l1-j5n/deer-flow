"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8001";

interface OverviewData {
  layer: number; version: string; engine: string; description: string;
  enums: Record<string, string[]>; enum_count: number;
  endpoints: { method: string; path: string; desc: string }[];
  endpoint_count: number; config_space: number; cache_stats: Record<string, number>;
}

const QG_TYPES = [
  { value: "dna_sequencing", label: "DNA测序" },
  { value: "genome_assembly", label: "基因组" },
  { value: "variant_calling", label: "变异" },
  { value: "epigenetic_analysis", label: "表观" },
  { value: "phylogenomics", label: "系统" },
  { value: "ai_genomics_analyzer", label: "AI" },
];

const QP_TYPES = [
  { value: "protein_folding", label: "折叠" },
  { value: "structure_prediction", label: "结构" },
  { value: "molecular_docking", label: "对接" },
  { value: "binding_affinity", label: "亲和" },
  { value: "protein_design", label: "设计" },
  { value: "ai_protein_engineer", label: "AI" },
];

const QD_TYPES = [
  { value: "virtual_screening", label: "虚拟筛选" },
  { value: "lead_optimization", label: "先导" },
  { value: "admet_prediction", label: "ADMET" },
  { value: "toxicity_assessment", label: "毒性" },
  { value: "de_novo_design", label: "从头" },
  { value: "ai_drug_discovery", label: "AI" },
];

const QE_TYPES = [
  { value: "population_dynamics", label: "种群" },
  { value: "food_web_analysis", label: "食物网" },
  { value: "biodiversity_assessment", label: "多样性" },
  { value: "habitat_modeling", label: "栖息地" },
  { value: "climate_ecology", label: "气候" },
  { value: "ai_ecosystem_simulator", label: "AI" },
];

const QB_TYPES = [
  { value: "bio_inspired_material", label: "仿生材料" },
  { value: "neural_mimicry", label: "神经仿" },
  { value: "swarm_intelligence", label: "群体" },
  { value: "evolutionary_design", label: "进化" },
  { value: "morphogenesis_sim", label: "形态" },
  { value: "ai_biomimicry_engine", label: "AI" },
];

const QS_TYPES = [
  { value: "gene_circuit_design", label: "基因回路" },
  { value: "metabolic_engineering", label: "代谢" },
  { value: "cell_free_system", label: "无细胞" },
  { value: "xenobiology", label: "异源" },
  { value: "minimal_genome", label: "最小" },
  { value: "ai_synthetic_bio", label: "AI" },
];

function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumDigitalBiologyEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [qgType, setQgType] = useState("dna_sequencing");
  const [qgSeqLen, setQgSeqLen] = useState("1000");
  const [qgMutRate, setQgMutRate] = useState("0.01");
  const [qpType, setQpType] = useState("protein_folding");
  const [qpChainLen, setQpChainLen] = useState("300");
  const [qpTemp, setQpTemp] = useState("310");
  const [qdType, setQdType] = useState("virtual_screening");
  const [qdMolWeight, setQdMolWeight] = useState("500");
  const [qdTargetAffinity, setQdTargetAffinity] = useState("0.8");
  const [qeType, setQeType] = useState("population_dynamics");
  const [qeSpeciesCount, setQeSpeciesCount] = useState("100");
  const [qeEnvComplexity, setQeEnvComplexity] = useState("0.7");
  const [qbType, setQbType] = useState("bio_inspired_material");
  const [qbInspiration, setQbInspiration] = useState("0.5");
  const [qbAdaptCycles, setQbAdaptCycles] = useState("50");
  const [qsType, setQsType] = useState("gene_circuit_design");
  const [qsGeneCount, setQsGeneCount] = useState("20");
  const [qsExprLevel, setQsExprLevel] = useState("0.6");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-digital-biology/overview`); const data = await res.json(); setOverview(data); setResult(data); }
    catch (e) { setResult({ error: String(e) }); } finally { setLoading(false); }
  }
  async function postEndpoint(path: string, params: Record<string, string>) {
    setLoading(true); setResult(null);
    try { const qs = new URLSearchParams(params).toString(); const res = await fetch(`${API_BASE}${path}?${qs}`, { method: "POST" }); setResult(await res.json()); }
    catch (e) { setResult({ error: String(e) }); } finally { setLoading(false); }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quantum Digital Biology Engine</h1>
          <p className="text-muted-foreground">Layer 121 — 量子基因组 / 蛋白质折叠 / 药物设计 / 生态建模 / 仿生学 / 合成生物学</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.369.0</Badge>
          <Badge variant="secondary">Layer 121</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="qg">量子基因组</TabsTrigger>
<TabsTrigger value="qp">量子蛋白质</TabsTrigger>
<TabsTrigger value="qd">量子药物</TabsTrigger>
<TabsTrigger value="qe">量子生态</TabsTrigger>
<TabsTrigger value="qb">量子仿生</TabsTrigger>
<TabsTrigger value="qs">合成生物</TabsTrigger>

        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Digital Biology Engine 概览</CardTitle><CardDescription>Layer 121 — 量子基因组 / 蛋白质折叠 / 药物设计 / 生态建模 / 仿生学 / 合成生物学 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={fetchOverview} disabled={loading}>{loading ? "加载中..." : "获取概览"}</Button>
            {overview && (<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <Card><CardHeader className="pb-2"><CardDescription>枚举数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.enum_count}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>端点数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.endpoint_count}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>配置空间</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.config_space.toLocaleString()}</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardDescription>缓存命中</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{Object.values(overview.cache_stats).reduce((a: number, b: number) => a + b, 0)}</div></CardContent></Card>
            </div>)}
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="qg">
          <Card><CardHeader><CardTitle>量子基因组 (Quantum Genomics)</CardTitle><CardDescription>DNA测序/基因组/变异/表观/系统/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qgType} onValueChange={setQgType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>序列长度</Label><Input type="number" value={qgSeqLen} onChange={(e) => setQgSeqLen(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>突变率</Label><Input type="number" value={qgMutRate} onChange={(e) => setQgMutRate(e.target.value)} step={0.001} min={0} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-biology/quantum-genomics", {genomics_type: qgType, sequence_length: qgSeqLen, mutation_rate: qgMutRate})} disabled={loading}>{loading ? "计算中..." : "基因组分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="qp">
          <Card><CardHeader><CardTitle>量子蛋白质 (Quantum Protein)</CardTitle><CardDescription>折叠/结构/对接/亲和/设计/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qpType} onValueChange={setQpType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>链长度</Label><Input type="number" value={qpChainLen} onChange={(e) => setQpChainLen(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>温度(K)</Label><Input type="number" value={qpTemp} onChange={(e) => setQpTemp(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-biology/quantum-protein", {protein_type: qpType, chain_length: qpChainLen, temperature: qpTemp})} disabled={loading}>{loading ? "计算中..." : "蛋白质分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="qd">
          <Card><CardHeader><CardTitle>量子药物设计 (Quantum Drug Design)</CardTitle><CardDescription>虚拟筛选/先导优化/ADMET/毒性/从头/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qdType} onValueChange={setQdType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>分子量</Label><Input type="number" value={qdMolWeight} onChange={(e) => setQdMolWeight(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>靶标亲和力</Label><Input type="number" value={qdTargetAffinity} onChange={(e) => setQdTargetAffinity(e.target.value)} step={0.1} min={0} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-biology/quantum-drug-design", {drug_type: qdType, molecular_weight: qdMolWeight, target_affinity: qdTargetAffinity})} disabled={loading}>{loading ? "计算中..." : "药物分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="qe">
          <Card><CardHeader><CardTitle>量子生态建模 (Quantum Ecosystem)</CardTitle><CardDescription>种群/食物网/多样性/栖息地/气候/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qeType} onValueChange={setQeType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>物种数量</Label><Input type="number" value={qeSpeciesCount} onChange={(e) => setQeSpeciesCount(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>环境复杂度</Label><Input type="number" value={qeEnvComplexity} onChange={(e) => setQeEnvComplexity(e.target.value)} step={0.1} min={0} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-biology/quantum-ecosystem", {ecosystem_type: qeType, species_count: qeSpeciesCount, environment_complexity: qeEnvComplexity})} disabled={loading}>{loading ? "计算中..." : "生态分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="qb">
          <Card><CardHeader><CardTitle>量子仿生学 (Quantum Biomimicry)</CardTitle><CardDescription>仿生材料/神经仿/群体/进化/形态/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qbType} onValueChange={setQbType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QB_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>灵感来源</Label><Input type="number" value={qbInspiration} onChange={(e) => setQbInspiration(e.target.value)} step={0.1} min={0} max={1} /></div>
<div className="space-y-2"><Label>适应周期</Label><Input type="number" value={qbAdaptCycles} onChange={(e) => setQbAdaptCycles(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-biology/quantum-biomimicry", {biomimicry_type: qbType, inspiration_source: qbInspiration, adaptation_cycles: qbAdaptCycles})} disabled={loading}>{loading ? "计算中..." : "仿生分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="qs">
          <Card><CardHeader><CardTitle>合成生物学 (Quantum Synthetic Biology)</CardTitle><CardDescription>基因回路/代谢/无细胞/异源/最小/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qsType} onValueChange={setQsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>基因数量</Label><Input type="number" value={qsGeneCount} onChange={(e) => setQsGeneCount(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>表达水平</Label><Input type="number" value={qsExprLevel} onChange={(e) => setQsExprLevel(e.target.value)} step={0.1} min={0} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-digital-biology/quantum-synthetic-bio", {synthetic_type: qsType, gene_count: qsGeneCount, expression_level: qsExprLevel})} disabled={loading}>{loading ? "计算中..." : "合成分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
