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

const DNA_TYPES = [
  { value: "dna_quantum_encoding", label: "Encoding" },
  { value: "dna_quantum_sequencing", label: "Sequencing" },
  { value: "dna_quantum_error_correction", label: "Error Corr." },
  { value: "dna_quantum_storage", label: "Storage" },
  { value: "dna_quantum_circuit", label: "Circuit" },
  { value: "ai_quantum_dna", label: "AI" },
];

const PROTEIN_TYPES = [
  { value: "vqe_protein_folding", label: "VQE Fold" },
  { value: "qaoa_protein_folding", label: "QAOA Fold" },
  { value: "quantum_annealing_protein", label: "Annealing" },
  { value: "tensor_network_protein", label: "Tensor Net" },
  { value: "quantum_monte_carlo_protein", label: "QMC" },
  { value: "ai_quantum_protein", label: "AI" },
];

const PHOTO_TYPES = [
  { value: "exciton_transfer", label: "Exciton" },
  { value: "quantum_coherence_bio", label: "Coherence" },
  { value: "fmo_complex_sim", label: "FMO Complex" },
  { value: "light_harvesting_sim", label: "Harvesting" },
  { value: "quantum_energy_transfer", label: "Energy" },
  { value: "ai_quantum_photosynthesis", label: "AI" },
];

const NEURAL_IF_TYPES = [
  { value: "brain_quantum_sensor", label: "Sensor" },
  { value: "neural_quantum_decoder", label: "Decoder" },
  { value: "quantum_bci", label: "BCI" },
  { value: "quantum_neuro_stimulator", label: "Stimulator" },
  { value: "quantum_memory_implant", label: "Memory" },
  { value: "ai_quantum_neural_interface", label: "AI" },
];

const BIOMETRIC_TYPES = [
  { value: "quantum_dna_authentication", label: "DNA Auth" },
  { value: "quantum_iris_scan", label: "Iris" },
  { value: "quantum_voice_print", label: "Voice" },
  { value: "quantum_gait_analysis", label: "Gait" },
  { value: "quantum_thermal_signature", label: "Thermal" },
  { value: "ai_quantum_biometrics", label: "AI" },
];

const ECOSYSTEM_TYPES = [
  { value: "quantum_population_dynamics", label: "Population" },
  { value: "quantum_food_web", label: "Food Web" },
  { value: "quantum_biodiversity", label: "Biodiversity" },
  { value: "quantum_habitat_modeling", label: "Habitat" },
  { value: "quantum_climate_ecology", label: "Climate" },
  { value: "ai_quantum_ecosystem", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumBiologicalComputingEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [dnaType, setDnaType] = useState("dna_quantum_encoding");
  const [dnaLength, setDnaLength] = useState("1000");
  const [dnaErrorRate, setDnaErrorRate] = useState("0.001");
  const [proteinType, setProteinType] = useState("vqe_protein_folding");
  const [proteinResidues, setProteinResidues] = useState("100");
  const [proteinTemp, setProteinTemp] = useState("310.0");
  const [photoType, setPhotoType] = useState("exciton_transfer");
  const [photoChromophores, setPhotoChromophores] = useState("7");
  const [photoCoupling, setPhotoCoupling] = useState("0.1");
  const [neuralifType, setNeuralifType] = useState("brain_quantum_sensor");
  const [neuralifNeurons, setNeuralifNeurons] = useState("10000");
  const [neuralifBandwidth, setNeuralifBandwidth] = useState("1000.0");
  const [biometricsType, setBiometricsType] = useState("quantum_dna_authentication");
  const [biometricsSamples, setBiometricsSamples] = useState("100000");
  const [biometricsFAR, setBiometricsFAR] = useState("0.0001");
  const [ecosystemType, setEcosystemType] = useState("quantum_population_dynamics");
  const [ecosystemSpecies, setEcosystemSpecies] = useState("50");
  const [ecosystemSteps, setEcosystemSteps] = useState("365");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-biological-computing/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Biological Computing Engine</h1>
          <p className="text-muted-foreground">Layer 90 — 量子DNA / 量子蛋白质折叠 / 量子光合 / 量子神经接口 / 量子生物识别 / 量子生态</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.338.0</Badge>
          <Badge variant="secondary">Layer 90</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="dna">量子DNA</TabsTrigger>
<TabsTrigger value="protein">蛋白质折叠</TabsTrigger>
<TabsTrigger value="photosynthesis">量子光合</TabsTrigger>
<TabsTrigger value="neuralif">量子神经接口</TabsTrigger>
<TabsTrigger value="biometrics">量子生物识别</TabsTrigger>
<TabsTrigger value="ecosystem">量子生态</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Biological Computing Engine 概览</CardTitle><CardDescription>Layer 90 — 量子DNA / 量子蛋白质折叠 / 量子光合 / 量子神经接口 / 量子生物识别 / 量子生态 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="dna">
          <Card><CardHeader><CardTitle>量子DNA (Quantum DNA)</CardTitle><CardDescription>Encoding/Sequencing/Error Correction/Storage/Circuit</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={dnaType} onValueChange={setDnaType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DNA_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>序列长度</Label><Input type="number" value={dnaLength} onChange={(e) => setDnaLength(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>错误率</Label><Input type="number" value={dnaErrorRate} onChange={(e) => setDnaErrorRate(e.target.value)} step={0.0001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-biological-computing/quantum-dna", {dna_type: dnaType, sequence_length: dnaLength, error_rate: dnaErrorRate})} disabled={loading}>{loading ? "计算中..." : "DNA计算"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="protein">
          <Card><CardHeader><CardTitle>蛋白质折叠 (Quantum Protein)</CardTitle><CardDescription>VQE/QAOA/Annealing/Tensor/Monte Carlo</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={proteinType} onValueChange={setProteinType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PROTEIN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>残基数</Label><Input type="number" value={proteinResidues} onChange={(e) => setProteinResidues(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>温度(K)</Label><Input type="number" value={proteinTemp} onChange={(e) => setProteinTemp(e.target.value)} step={0.1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-biological-computing/quantum-protein", {protein_type: proteinType, residue_count: proteinResidues, temperature_k: proteinTemp})} disabled={loading}>{loading ? "计算中..." : "折叠分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="photosynthesis">
          <Card><CardHeader><CardTitle>量子光合 (Quantum Photosynthesis)</CardTitle><CardDescription>Exciton/Coherence/FMO/Light Harvest/Energy</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={photoType} onValueChange={setPhotoType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PHOTO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>色素分子数</Label><Input type="number" value={photoChromophores} onChange={(e) => setPhotoChromophores(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>耦合强度</Label><Input type="number" value={photoCoupling} onChange={(e) => setPhotoCoupling(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-biological-computing/quantum-photosynthesis", {photo_type: photoType, num_chromophores: photoChromophores, coupling_strength: photoCoupling})} disabled={loading}>{loading ? "计算中..." : "光合模拟"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="neuralif">
          <Card><CardHeader><CardTitle>量子神经接口 (Quantum Neural Interface)</CardTitle><CardDescription>Sensor/Decoder/BCI/Stimulator/Memory</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={neuralifType} onValueChange={setNeuralifType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{NEURAL_IF_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>神经元数</Label><Input type="number" value={neuralifNeurons} onChange={(e) => setNeuralifNeurons(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>带宽(Hz)</Label><Input type="number" value={neuralifBandwidth} onChange={(e) => setNeuralifBandwidth(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-biological-computing/quantum-neural-interface", {interface_type: neuralifType, neuron_count: neuralifNeurons, bandwidth_hz: neuralifBandwidth})} disabled={loading}>{loading ? "计算中..." : "接口分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="biometrics">
          <Card><CardHeader><CardTitle>量子生物识别 (Quantum Biometrics)</CardTitle><CardDescription>DNA/Iris/Voice/Gait/Thermal</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={biometricsType} onValueChange={setBiometricsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BIOMETRIC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>样本数</Label><Input type="number" value={biometricsSamples} onChange={(e) => setBiometricsSamples(e.target.value)} min={1000} /></div>
<div className="space-y-2"><Label>误识率</Label><Input type="number" value={biometricsFAR} onChange={(e) => setBiometricsFAR(e.target.value)} step={0.00001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-biological-computing/quantum-biometrics", {bio_type: biometricsType, sample_size: biometricsSamples, false_accept_rate: biometricsFAR})} disabled={loading}>{loading ? "计算中..." : "识别分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ecosystem">
          <Card><CardHeader><CardTitle>量子生态 (Quantum Ecosystem)</CardTitle><CardDescription>Population/Food Web/Biodiversity/Habitat/Climate</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ecosystemType} onValueChange={setEcosystemType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ECOSYSTEM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>物种数</Label><Input type="number" value={ecosystemSpecies} onChange={(e) => setEcosystemSpecies(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>时间步</Label><Input type="number" value={ecosystemSteps} onChange={(e) => setEcosystemSteps(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-biological-computing/quantum-ecosystem", {eco_type: ecosystemType, species_count: ecosystemSpecies, time_steps: ecosystemSteps})} disabled={loading}>{loading ? "计算中..." : "生态模拟"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
