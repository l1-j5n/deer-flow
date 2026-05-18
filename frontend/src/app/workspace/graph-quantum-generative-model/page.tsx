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
  layer: number; version: string; engine: str; description: string;
  enums: Record<string, string[]>; enum_count: number;
  endpoints: { method: string; path: string; desc: string }[];
  endpoint_count: number; config_space: number; cache_stats: Record<string, number>;
}

const GAN_TYPES = [
  { value: "qgan_circuit", label: "Circuit" },
  { value: "hybrid_qgan", label: "Hybrid" },
  { value: "patch_qgan", label: "Patch" },
  { value: "conditional_qgan", label: "Conditional" },
  { value: "style_qgan", label: "Style" },
  { value: "ai_qgan_arch", label: "AI" },
];

const VAE_TYPES = [
  { value: "qvae_circuit", label: "Circuit" },
  { value: "hybrid_qvae", label: "Hybrid" },
  { value: "beta_qvae", label: "Beta" },
  { value: "vq_qvae", label: "VQ" },
  { value: "hierarchical_qvae", label: "Hierarchical" },
  { value: "ai_qvae_design", label: "AI" },
];

const DIFF_TYPES = [
  { value: "q_diffusion_forward", label: "Forward" },
  { value: "q_diffusion_reverse", label: "Reverse" },
  { value: "q_score_matching", label: "Score Match" },
  { value: "q_denoise", label: "Denoise" },
  { value: "q_guided_diffusion", label: "Guided" },
  { value: "ai_diffusion_ctrl", label: "AI" },
];

const FLOW_TYPES = [
  { value: "q_affine_flow", label: "Affine" },
  { value: "q_sylvester_flow", label: "Sylvester" },
  { value: "q_planar_flow", label: "Planar" },
  { value: "q_radial_flow", label: "Radial" },
  { value: "q_coupling_flow", label: "Coupling" },
  { value: "ai_flow_arch", label: "AI" },
];

const TR_TYPES = [
  { value: "q_self_attention", label: "Self-Attn" },
  { value: "q_cross_attention", label: "Cross-Attn" },
  { value: "q_feedforward", label: "FFN" },
  { value: "q_positional_enc", label: "Pos Enc" },
  { value: "q_layer_norm", label: "Layer Norm" },
  { value: "ai_transformer_block", label: "AI" },
];

const BORN_TYPES = [
  { value: "born_trivial", label: "Trivial" },
  { value: "born_tensor", label: "Tensor" },
  { value: "born_entangled", label: "Entangled" },
  { value: "born_adversarial", label: "Adversarial" },
  { value: "born_hierarchical", label: "Hierarchical" },
  { value: "ai_born_generator", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumGenerativeModelEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [ganType, setGanType] = useState("qgan_circuit");
  const [ganLatent, setGanLatent] = useState("8");
  const [ganQubits, setGanQubits] = useState("16");
  const [vaeType, setVaeType] = useState("qvae_circuit");
  const [vaeLatent, setVaeLatent] = useState("4");
  const [vaeLayers, setVaeLayers] = useState("6");
  const [diffusionType, setDiffusionType] = useState("q_diffusion_forward");
  const [diffusionSteps, setDiffusionSteps] = useState("1000");
  const [diffusionSchedule, setDiffusionSchedule] = useState("cosine");
  const [flowType, setFlowType] = useState("q_affine_flow");
  const [flowFlows, setFlowFlows] = useState("10");
  const [flowQubits, setFlowQubits] = useState("8");
  const [transformerType, setTransformerType] = useState("q_self_attention");
  const [transformerSeqLen, setTransformerSeqLen] = useState("128");
  const [transformerHeads, setTransformerHeads] = useState("4");
  const [bornType, setBornType] = useState("born_trivial");
  const [bornQubits, setBornQubits] = useState("12");
  const [bornLayers, setBornLayers] = useState("8");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-generative-model/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Generative Model Engine</h1>
          <p className="text-muted-foreground">Layer 110 — 量子GAN / 量子VAE / 量子扩散 / 量子流 / 量子Transformer / Born机</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.358.0</Badge>
          <Badge variant="secondary">Layer 110</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="gan">量子GAN</TabsTrigger>
<TabsTrigger value="vae">量子VAE</TabsTrigger>
<TabsTrigger value="diffusion">量子扩散</TabsTrigger>
<TabsTrigger value="flow">量子流</TabsTrigger>
<TabsTrigger value="transformer">Q-Transformer</TabsTrigger>
<TabsTrigger value="born">Born机</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Generative Model Engine 概览</CardTitle><CardDescription>Layer 110 — 量子GAN / 量子VAE / 量子扩散 / 量子流 / 量子Transformer / Born机 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="gan">
          <Card><CardHeader><CardTitle>量子GAN (Quantum GAN)</CardTitle><CardDescription>Circuit/Hybrid/Patch/Conditional/Style</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ganType} onValueChange={setGanType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GAN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>潜在维度</Label><Input type="number" value={ganLatent} onChange={(e) => setGanLatent(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>量子比特数</Label><Input type="number" value={ganQubits} onChange={(e) => setGanQubits(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-generative-model/quantum-gan", {gan_type: ganType, latent_dim: ganLatent, num_qubits: ganQubits})} disabled={loading}>{loading ? "计算中..." : "GAN分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="vae">
          <Card><CardHeader><CardTitle>量子VAE (Quantum VAE)</CardTitle><CardDescription>Circuit/Hybrid/Beta/VQ/Hierarchical</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={vaeType} onValueChange={setVaeType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VAE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>潜在维度</Label><Input type="number" value={vaeLatent} onChange={(e) => setVaeLatent(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>层数</Label><Input type="number" value={vaeLayers} onChange={(e) => setVaeLayers(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-generative-model/quantum-vae", {vae_type: vaeType, latent_dim: vaeLatent, num_layers: vaeLayers})} disabled={loading}>{loading ? "计算中..." : "VAE分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="diffusion">
          <Card><CardHeader><CardTitle>量子扩散 (Quantum Diffusion)</CardTitle><CardDescription>Forward/Reverse/ScoreMatch/Denoise/Guided</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={diffusionType} onValueChange={setDiffusionType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DIFF_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>时间步数</Label><Input type="number" value={diffusionSteps} onChange={(e) => setDiffusionSteps(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>噪声调度</Label><Input type="number" value={diffusionSchedule} onChange={(e) => setDiffusionSchedule(e.target.value)}  /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-generative-model/quantum-diffusion", {diffusion_type: diffusionType, num_timesteps: diffusionSteps, noise_schedule: diffusionSchedule})} disabled={loading}>{loading ? "计算中..." : "扩散分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="flow">
          <Card><CardHeader><CardTitle>量子流 (Quantum Flow)</CardTitle><CardDescription>Affine/Sylvester/Planar/Radial/Coupling</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={flowType} onValueChange={setFlowType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FLOW_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>流层数</Label><Input type="number" value={flowFlows} onChange={(e) => setFlowFlows(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={flowQubits} onChange={(e) => setFlowQubits(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-generative-model/quantum-flow", {flow_type: flowType, num_flows: flowFlows, num_qubits: flowQubits})} disabled={loading}>{loading ? "计算中..." : "流分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="transformer">
          <Card><CardHeader><CardTitle>Q-Transformer (Quantum Transformer)</CardTitle><CardDescription>SelfAttn/CrossAttn/FFN/PosEnc/LayerNorm</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={transformerType} onValueChange={setTransformerType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TR_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>序列长度</Label><Input type="number" value={transformerSeqLen} onChange={(e) => setTransformerSeqLen(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>注意力头数</Label><Input type="number" value={transformerHeads} onChange={(e) => setTransformerHeads(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-generative-model/quantum-transformer", {transformer_type: transformerType, seq_length: transformerSeqLen, num_heads: transformerHeads})} disabled={loading}>{loading ? "计算中..." : "Transformer分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="born">
          <Card><CardHeader><CardTitle>Born机 (Quantum Born Machine)</CardTitle><CardDescription>Trivial/Tensor/Entangled/Adversarial/Hierarchical</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={bornType} onValueChange={setBornType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BORN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={bornQubits} onChange={(e) => setBornQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>层数</Label><Input type="number" value={bornLayers} onChange={(e) => setBornLayers(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-generative-model/quantum-born", {born_type: bornType, num_qubits: bornQubits, num_layers: bornLayers})} disabled={loading}>{loading ? "计算中..." : "Born分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
