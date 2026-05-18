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

const AR_TYPES = [
  { value: "spiking_processor", label: "Spiking" },
  { value: "memristor_crossbar", label: "Memristor" },
  { value: "phase_change_array", label: "Phase-Change" },
  { value: "synaptic_array", label: "Synaptic" },
  { value: "neural_accelerator", label: "Accelerator" },
  { value: "ai_neuromorphic_soc", label: "AI" },
];

const SP_TYPES = [
  { value: "stdp", label: "STDP" },
  { value: "hebbian", label: "Hebbian" },
  { value: "anti_hebbian", label: "Anti-Hebbian" },
  { value: "homeostatic", label: "Homeostatic" },
  { value: "metaplasticity", label: "Meta" },
  { value: "ai_plasticity_rule", label: "AI" },
];

const SN_TYPES = [
  { value: "lif_neuron", label: "LIF" },
  { value: "izhikevich", label: "Izhikevich" },
  { value: "hodgkin_huxley", label: "H-H" },
  { value: "theta_neuron", label: "Theta" },
  { value: "srn_neuron", label: "SRN" },
  { value: "ai_spike_encoder", label: "AI" },
];

const ND_TYPES = [
  { value: "oscillatory", label: "Oscillatory" },
  { value: "chaotic", label: "Chaotic" },
  { value: "bifurcation", label: "Bifurcation" },
  { value: "synchronization", label: "Sync" },
  { value: "wave_propagation", label: "Wave" },
  { value: "ai_dynamics_simulator", label: "AI" },
];

const NM_TYPES = [
  { value: "dopamine", label: "Dopamine" },
  { value: "serotonin", label: "Serotonin" },
  { value: "acetylcholine", label: "ACh" },
  { value: "norepinephrine", label: "NE" },
  { value: "gabaergic", label: "GABA" },
  { value: "ai_modulation_controller", label: "AI" },
];

const BI_TYPES = [
  { value: "cortical_column", label: "Cortical" },
  { value: "hippocampal", label: "Hippocampal" },
  { value: "cerebellar", label: "Cerebellar" },
  { value: "basal_ganglia", label: "Basal" },
  { value: "thalamic", label: "Thalamic" },
  { value: "ai_brain_architect", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumNeuromorphicComputingEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [archType, setArchType] = useState("spiking_processor");
  const [archNeurons, setArchNeurons] = useState("100000");
  const [archConn, setArchConn] = useState("1000");
  const [plasticityType, setPlasticityType] = useState("stdp");
  const [plasticityLR, setPlasticityLR] = useState("0.01");
  const [plasticitySyn, setPlasticitySyn] = useState("1000000");
  const [neuronType, setNeuronType] = useState("lif_neuron");
  const [neuronLayers, setNeuronLayers] = useState("6");
  const [neuronThresh, setNeuronThresh] = useState("1.0");
  const [dynamicsType, setDynamicsType] = useState("oscillatory");
  const [dynamicsSteps, setDynamicsSteps] = useState("10000");
  const [dynamicsRes, setDynamicsRes] = useState("0.1");
  const [modulationType, setModulationType] = useState("dopamine");
  const [modulationConc, setModulationConc] = useState("1.0");
  const [modulationRegions, setModulationRegions] = useState("5");
  const [brainType, setBrainType] = useState("cortical_column");
  const [brainModules, setBrainModules] = useState("64");
  const [brainBW, setBrainBW] = useState("1000");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-neuromorphic-computing/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Neuromorphic Computing Engine</h1>
          <p className="text-muted-foreground">Layer 114 — 神经形态架构 / 突触可塑性 / 脉冲网络 / 神经动力学 / 神经调制 / 脑启发计算</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.362.0</Badge>
          <Badge variant="secondary">Layer 114</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="arch">神经架构</TabsTrigger>
<TabsTrigger value="plasticity">突触可塑</TabsTrigger>
<TabsTrigger value="spiking">脉冲网络</TabsTrigger>
<TabsTrigger value="dynamics">神经动力</TabsTrigger>
<TabsTrigger value="modulation">神经调制</TabsTrigger>
<TabsTrigger value="brain">脑启发</TabsTrigger>

        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Neuromorphic Computing Engine 概览</CardTitle><CardDescription>Layer 114 — 神经形态架构 / 突触可塑性 / 脉冲网络 / 神经动力学 / 神经调制 / 脑启发计算 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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

        <TabsContent value="arch">
          <Card><CardHeader><CardTitle>神经形态架构 (Neuromorphic Architecture)</CardTitle><CardDescription>Spiking/Memristor/Phase-Change/Synaptic/Accelerator</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={archType} onValueChange={setArchType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AR_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>神经元数</Label><Input type="number" value={archNeurons} onChange={(e) => setArchNeurons(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>连接数</Label><Input type="number" value={archConn} onChange={(e) => setArchConn(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-neuromorphic-computing/neuromorphic-arch", {arch_type: archType, num_neurons: archNeurons, connectivity: archConn})} disabled={loading}>{loading ? "计算中..." : "架构分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="plasticity">
          <Card><CardHeader><CardTitle>突触可塑性 (Synaptic Plasticity)</CardTitle><CardDescription>STDP/Hebbian/Anti-Hebbian/Homeostatic/Meta</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={plasticityType} onValueChange={setPlasticityType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>学习率</Label><Input type="number" value={plasticityLR} onChange={(e) => setPlasticityLR(e.target.value)} step={0.001} /></div>
<div className="space-y-2"><Label>突触数</Label><Input type="number" value={plasticitySyn} onChange={(e) => setPlasticitySyn(e.target.value)} min={1000} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-neuromorphic-computing/synaptic-plasticity", {plasticity_type: plasticityType, learning_rate: plasticityLR, num_synapses: plasticitySyn})} disabled={loading}>{loading ? "计算中..." : "可塑性分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="spiking">
          <Card><CardHeader><CardTitle>脉冲神经网络 (Spiking Neural)</CardTitle><CardDescription>LIF/Izhikevich/H-H/Theta/SRN</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={neuronType} onValueChange={setNeuronType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>层数</Label><Input type="number" value={neuronLayers} onChange={(e) => setNeuronLayers(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>阈值</Label><Input type="number" value={neuronThresh} onChange={(e) => setNeuronThresh(e.target.value)} step={0.1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-neuromorphic-computing/spiking-neural", {neuron_type: neuronType, num_layers: neuronLayers, threshold: neuronThresh})} disabled={loading}>{loading ? "计算中..." : "脉冲分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="dynamics">
          <Card><CardHeader><CardTitle>神经动力学 (Neural Dynamics)</CardTitle><CardDescription>Oscillatory/Chaotic/Bifurcation/Sync/Wave</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={dynamicsType} onValueChange={setDynamicsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ND_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>时间步数</Label><Input type="number" value={dynamicsSteps} onChange={(e) => setDynamicsSteps(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>分辨率</Label><Input type="number" value={dynamicsRes} onChange={(e) => setDynamicsRes(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-neuromorphic-computing/neural-dynamics", {dynamics_type: dynamicsType, time_steps: dynamicsSteps, resolution: dynamicsRes})} disabled={loading}>{loading ? "计算中..." : "动力学分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="modulation">
          <Card><CardHeader><CardTitle>神经调制 (Neuromodulation)</CardTitle><CardDescription>Dopamine/Serotonin/ACh/NE/GABA</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={modulationType} onValueChange={setModulationType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{NM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>浓度</Label><Input type="number" value={modulationConc} onChange={(e) => setModulationConc(e.target.value)} step={0.1} /></div>
<div className="space-y-2"><Label>目标区域</Label><Input type="number" value={modulationRegions} onChange={(e) => setModulationRegions(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-neuromorphic-computing/neuro-modulation", {modulation_type: modulationType, concentration: modulationConc, target_regions: modulationRegions})} disabled={loading}>{loading ? "计算中..." : "调制分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="brain">
          <Card><CardHeader><CardTitle>脑启发计算 (Brain-Inspired)</CardTitle><CardDescription>Cortical/Hippocampal/Cerebellar/Basal/Thalamic</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={brainType} onValueChange={setBrainType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BI_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>模块数</Label><Input type="number" value={brainModules} onChange={(e) => setBrainModules(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>互联带宽</Label><Input type="number" value={brainBW} onChange={(e) => setBrainBW(e.target.value)} min={100} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-neuromorphic-computing/brain-inspired", {brain_type: brainType, num_modules: brainModules, interconnect_bw: brainBW})} disabled={loading}>{loading ? "计算中..." : "脑启发分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
