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

const CONSCIOUSNESS_MODELS = [
  { value: "penrose_hameroff_orch", label: "Orch-OR" },
  { value: "quantum_cognitive_field", label: "Cog. Field" },
  { value: "integrated_information_q", label: "Phi (IIT)" },
  { value: "quantum_free_will_theorem", label: "Free Will" },
  { value: "quantum_subjective_experience", label: "Qualia" },
  { value: "ai_quantum_consciousness", label: "AI" },
];

const NEURAL_ARCH_TYPES = [
  { value: "quantum_nas_evolutionary", label: "Evolutionary" },
  { value: "quantum_nas_rl", label: "RL-NAS" },
  { value: "quantum_nas_differentiable", label: "Diff-NAS" },
  { value: "quantum_nas_bayesian", label: "Bayesian" },
  { value: "quantum_nas_gradient", label: "Gradient" },
  { value: "ai_quantum_neural_arch", label: "AI" },
];

const META_LEARN_TYPES = [
  { value: "quantum_maml", label: "Q-MAML" },
  { value: "quantum_reptile", label: "Q-Reptile" },
  { value: "quantum_prototypical", label: "Prototypical" },
  { value: "quantum_matching_net", label: "Matching" },
  { value: "quantum_fomaml", label: "FOMAML" },
  { value: "ai_quantum_meta_learning", label: "AI" },
];

const EVOLUTION_TYPES = [
  { value: "quantum_genetic_evolution", label: "Genetic" },
  { value: "quantum_open_ended_search", label: "Open-Ended" },
  { value: "quantum_auto_curriculum", label: "Auto-Curriculum" },
  { value: "quantum_fitness_landscape", label: "Fitness" },
  { value: "quantum_novelty_search", label: "Novelty" },
  { value: "ai_quantum_self_evolution", label: "AI" },
];

const COGNITIVE_TYPES = [
  { value: "quantum_decision_theory", label: "Decision" },
  { value: "quantum_probabilistic_reasoning", label: "Probabilistic" },
  { value: "quantum_attention_mechanism", label: "Attention" },
  { value: "quantum_working_memory", label: "Memory" },
  { value: "quantum_language_acquisition", label: "Language" },
  { value: "ai_quantum_cognitive", label: "AI" },
];

const CREATIVITY_TYPES = [
  { value: "quantum_divergent_thinking", label: "Divergent" },
  { value: "quantum_analogy_generation", label: "Analogy" },
  { value: "quantum_combinatorial_creativity", label: "Combinatorial" },
  { value: "quantum_exploratory_search", label: "Exploratory" },
  { value: "quantum_aesthetic_evaluation", label: "Aesthetic" },
  { value: "ai_quantum_creativity", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumAGIEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [consciousnessType, setConsciousnessType] = useState("penrose_hameroff_orch");
  const [consciousnessNeurons, setConsciousnessNeurons] = useState("1000000");
  const [consciousnessCoherence, setConsciousnessCoherence] = useState("500.0");
  const [neuralarchType, setNeuralarchType] = useState("quantum_nas_evolutionary");
  const [neuralarchSpaceSize, setNeuralarchSpaceSize] = useState("10000");
  const [neuralarchBudget, setNeuralarchBudget] = useState("500");
  const [metalearnType, setMetalearnType] = useState("quantum_maml");
  const [metalearnTasks, setMetalearnTasks] = useState("100");
  const [metalearnSteps, setMetalearnSteps] = useState("5");
  const [evolutionType, setEvolutionType] = useState("quantum_genetic_evolution");
  const [evolutionPopulation, setEvolutionPopulation] = useState("500");
  const [evolutionGenerations, setEvolutionGenerations] = useState("1000");
  const [cognitiveType, setCognitiveType] = useState("quantum_decision_theory");
  const [cognitiveDimensions, setCognitiveDimensions] = useState("256");
  const [cognitiveMemory, setCognitiveMemory] = useState("1024");
  const [creativityType, setCreativityType] = useState("quantum_divergent_thinking");
  const [creativityIdeas, setCreativityIdeas] = useState("100000");
  const [creativityThreshold, setCreativityThreshold] = useState("0.85");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-agi/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum AGI Engine</h1>
          <p className="text-muted-foreground">Layer 89 — 量子意识 / 量子神经架构 / 量子元学习 / 量子自进化 / 量子认知 / 量子创造力</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.337.0</Badge>
          <Badge variant="secondary">Layer 89</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="consciousness">量子意识</TabsTrigger>
<TabsTrigger value="neuralarch">量子神经架构</TabsTrigger>
<TabsTrigger value="metalearn">量子元学习</TabsTrigger>
<TabsTrigger value="evolution">量子自进化</TabsTrigger>
<TabsTrigger value="cognitive">量子认知</TabsTrigger>
<TabsTrigger value="creativity">量子创造力</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum AGI Engine 概览</CardTitle><CardDescription>Layer 89 — 量子意识 / 量子神经架构 / 量子元学习 / 量子自进化 / 量子认知 / 量子创造力 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="consciousness">
          <Card><CardHeader><CardTitle>量子意识 (Quantum Consciousness)</CardTitle><CardDescription>Penrose-Hameroff/Cognitive Field/Phi/Free Will</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={consciousnessType} onValueChange={setConsciousnessType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONSCIOUSNESS_MODELS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>神经元数</Label><Input type="number" value={consciousnessNeurons} onChange={(e) => setConsciousnessNeurons(e.target.value)} min={1000} /></div>
<div className="space-y-2"><Label>相干时间(ms)</Label><Input type="number" value={consciousnessCoherence} onChange={(e) => setConsciousnessCoherence(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-agi/quantum-consciousness", {consciousness_model: consciousnessType, neuron_count: consciousnessNeurons, coherence_time_ms: consciousnessCoherence})} disabled={loading}>{loading ? "计算中..." : "模拟意识"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="neuralarch">
          <Card><CardHeader><CardTitle>量子神经架构 (Quantum Neural Architecture)</CardTitle><CardDescription>Evolutionary/RL/Differentiable/Bayesian</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={neuralarchType} onValueChange={setNeuralarchType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{NEURAL_ARCH_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>搜索空间</Label><Input type="number" value={neuralarchSpaceSize} onChange={(e) => setNeuralarchSpaceSize(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>评估预算</Label><Input type="number" value={neuralarchBudget} onChange={(e) => setNeuralarchBudget(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-agi/quantum-neural-architecture", {arch_type: neuralarchType, search_space_size: neuralarchSpaceSize, fidelity_budget: neuralarchBudget})} disabled={loading}>{loading ? "计算中..." : "搜索架构"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="metalearn">
          <Card><CardHeader><CardTitle>量子元学习 (Quantum Meta-Learning)</CardTitle><CardDescription>MAML/Reptile/Prototypical/Matching/FOMAML</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={metalearnType} onValueChange={setMetalearnType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{META_LEARN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>任务数</Label><Input type="number" value={metalearnTasks} onChange={(e) => setMetalearnTasks(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>适应步数</Label><Input type="number" value={metalearnSteps} onChange={(e) => setMetalearnSteps(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-agi/quantum-meta-learning", {meta_type: metalearnType, num_tasks: metalearnTasks, adaptation_steps: metalearnSteps})} disabled={loading}>{loading ? "计算中..." : "元学习"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="evolution">
          <Card><CardHeader><CardTitle>量子自进化 (Quantum Self-Evolution)</CardTitle><CardDescription>Genetic/Open-Ended/Auto-Curriculum/Fitness/Novelty</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={evolutionType} onValueChange={setEvolutionType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EVOLUTION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>种群大小</Label><Input type="number" value={evolutionPopulation} onChange={(e) => setEvolutionPopulation(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>进化代数</Label><Input type="number" value={evolutionGenerations} onChange={(e) => setEvolutionGenerations(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-agi/quantum-self-evolution", {evolution_type: evolutionType, population_size: evolutionPopulation, generations: evolutionGenerations})} disabled={loading}>{loading ? "计算中..." : "自进化"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="cognitive">
          <Card><CardHeader><CardTitle>量子认知 (Quantum Cognitive)</CardTitle><CardDescription>Decision/Probabilistic/Attention/Memory/Language</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={cognitiveType} onValueChange={setCognitiveType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COGNITIVE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>上下文维度</Label><Input type="number" value={cognitiveDimensions} onChange={(e) => setCognitiveDimensions(e.target.value)} min={16} /></div>
<div className="space-y-2"><Label>记忆容量</Label><Input type="number" value={cognitiveMemory} onChange={(e) => setCognitiveMemory(e.target.value)} min={64} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-agi/quantum-cognitive", {cognitive_type: cognitiveType, context_dimension: cognitiveDimensions, memory_capacity: cognitiveMemory})} disabled={loading}>{loading ? "计算中..." : "认知计算"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="creativity">
          <Card><CardHeader><CardTitle>量子创造力 (Quantum Creativity)</CardTitle><CardDescription>Divergent/Analogy/Combinatorial/Exploratory/Aesthetic</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={creativityType} onValueChange={setCreativityType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CREATIVITY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>创意空间</Label><Input type="number" value={creativityIdeas} onChange={(e) => setCreativityIdeas(e.target.value)} min={1000} /></div>
<div className="space-y-2"><Label>新颖阈值</Label><Input type="number" value={creativityThreshold} onChange={(e) => setCreativityThreshold(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-agi/quantum-creativity", {creativity_type: creativityType, idea_space_size: creativityIdeas, novelty_threshold: creativityThreshold})} disabled={loading}>{loading ? "计算中..." : "创造力生成"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
