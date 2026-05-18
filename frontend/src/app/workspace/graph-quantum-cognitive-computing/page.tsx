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

const AT_TYPES = [
  { value: "q_transformer", label: "Transformer" },
  { value: "q_flash_attention", label: "Flash" },
  { value: "q_sparse_attention", label: "Sparse" },
  { value: "q_cross_attention", label: "Cross" },
  { value: "q_self_attention", label: "Self" },
  { value: "ai_attention_orchestrator", label: "AI" },
];

const MM_TYPES = [
  { value: "q_working_memory", label: "Working" },
  { value: "q_episodic_memory", label: "Episodic" },
  { value: "q_semantic_memory", label: "Semantic" },
  { value: "q_procedural_memory", label: "Procedural" },
  { value: "q_associative_memory", label: "Associative" },
  { value: "ai_memory_manager", label: "AI" },
];

const LG_TYPES = [
  { value: "q_nlu", label: "NLU" },
  { value: "q_nlg", label: "NLG" },
  { value: "q_translation", label: "Translation" },
  { value: "q_summarization", label: "Summary" },
  { value: "q_dialog", label: "Dialog" },
  { value: "ai_language_core", label: "AI" },
];

const RS_TYPES = [
  { value: "q_logic_reasoning", label: "Logic" },
  { value: "q_analogical_reasoning", label: "Analogical" },
  { value: "q_abductive_reasoning", label: "Abductive" },
  { value: "q_causal_reasoning", label: "Causal" },
  { value: "q_commonsense", label: "Commonsense" },
  { value: "ai_reasoning_engine", label: "AI" },
];

const CR_TYPES = [
  { value: "q_generative", label: "Generative" },
  { value: "q_combinatorial", label: "Combinatorial" },
  { value: "q_transformative", label: "Transformative" },
  { value: "q_exploratory", label: "Exploratory" },
  { value: "q_evaluative", label: "Evaluative" },
  { value: "ai_creative_agent", label: "AI" },
];

const EM_TYPES = [
  { value: "q_sentiment", label: "Sentiment" },
  { value: "q_emotion_recognition", label: "Recognition" },
  { value: "q_affect_computing", label: "Affect" },
  { value: "q_empathy", label: "Empathy" },
  { value: "q_mood_tracking", label: "Mood" },
  { value: "ai_emotion_core", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumCognitiveComputingEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [attentionType, setAttentionType] = useState("q_transformer");
  const [attentionSeq, setAttentionSeq] = useState("512");
  const [attentionHeads, setAttentionHeads] = useState("8");
  const [memoryType, setMemoryType] = useState("q_working_memory");
  const [memoryCap, setMemoryCap] = useState("10000");
  const [memoryDim, setMemoryDim] = useState("256");
  const [languageType, setLanguageType] = useState("q_nlu");
  const [languageVocab, setLanguageVocab] = useState("50000");
  const [languageCtx, setLanguageCtx] = useState("4096");
  const [reasoningType, setReasoningType] = useState("q_logic_reasoning");
  const [reasoningKG, setReasoningKG] = useState("10000");
  const [reasoningDepth, setReasoningDepth] = useState("6");
  const [creativityType, setCreativityType] = useState("q_generative");
  const [creativityDiv, setCreativityDiv] = useState("0.7");
  const [creativityGen, setCreativityGen] = useState("10");
  const [emotionType, setEmotionType] = useState("q_sentiment");
  const [emotionSignals, setEmotionSignals] = useState("100");
  const [emotionDim, setEmotionDim] = useState("16");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-cognitive-computing/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Cognitive Computing Engine</h1>
          <p className="text-muted-foreground">Layer 113 — 量子注意力 / 量子记忆 / 量子语言 / 认知推理 / 创造力 / 情感计算</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.361.0</Badge>
          <Badge variant="secondary">Layer 113</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="attention">量子注意力</TabsTrigger>
<TabsTrigger value="memory">量子记忆</TabsTrigger>
<TabsTrigger value="language">量子语言</TabsTrigger>
<TabsTrigger value="reasoning">认知推理</TabsTrigger>
<TabsTrigger value="creativity">创造力</TabsTrigger>
<TabsTrigger value="emotion">情感计算</TabsTrigger>

        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Cognitive Computing Engine 概览</CardTitle><CardDescription>Layer 113 — 量子注意力 / 量子记忆 / 量子语言 / 认知推理 / 创造力 / 情感计算 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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

        <TabsContent value="attention">
          <Card><CardHeader><CardTitle>量子注意力 (Quantum Attention)</CardTitle><CardDescription>Transformer/Flash/Sparse/Cross/Self</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={attentionType} onValueChange={setAttentionType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>序列长度</Label><Input type="number" value={attentionSeq} onChange={(e) => setAttentionSeq(e.target.value)} min={64} /></div>
<div className="space-y-2"><Label>注意力头数</Label><Input type="number" value={attentionHeads} onChange={(e) => setAttentionHeads(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cognitive-computing/quantum-attention", {attention_type: attentionType, seq_length: attentionSeq, num_heads: attentionHeads})} disabled={loading}>{loading ? "计算中..." : "注意力分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="memory">
          <Card><CardHeader><CardTitle>量子记忆 (Quantum Memory)</CardTitle><CardDescription>Working/Episodic/Semantic/Procedural/Associative</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={memoryType} onValueChange={setMemoryType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>容量</Label><Input type="number" value={memoryCap} onChange={(e) => setMemoryCap(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>检索维度</Label><Input type="number" value={memoryDim} onChange={(e) => setMemoryDim(e.target.value)} min={16} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cognitive-computing/quantum-memory", {memory_type: memoryType, capacity: memoryCap, retrieval_dim: memoryDim})} disabled={loading}>{loading ? "计算中..." : "记忆分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="language">
          <Card><CardHeader><CardTitle>量子语言 (Quantum Language)</CardTitle><CardDescription>NLU/NLG/Translation/Summary/Dialog</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={languageType} onValueChange={setLanguageType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>词汇量</Label><Input type="number" value={languageVocab} onChange={(e) => setLanguageVocab(e.target.value)} min={1000} /></div>
<div className="space-y-2"><Label>上下文窗口</Label><Input type="number" value={languageCtx} onChange={(e) => setLanguageCtx(e.target.value)} min={128} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cognitive-computing/quantum-language", {language_type: languageType, vocab_size: languageVocab, context_window: languageCtx})} disabled={loading}>{loading ? "计算中..." : "语言分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="reasoning">
          <Card><CardHeader><CardTitle>认知推理 (Cognitive Reasoning)</CardTitle><CardDescription>Logic/Analogical/Abductive/Causal/Commonsense</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={reasoningType} onValueChange={setReasoningType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>知识图谱大小</Label><Input type="number" value={reasoningKG} onChange={(e) => setReasoningKG(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>推理深度</Label><Input type="number" value={reasoningDepth} onChange={(e) => setReasoningDepth(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cognitive-computing/quantum-reasoning", {reasoning_type: reasoningType, knowledge_graph_size: reasoningKG, reasoning_depth: reasoningDepth})} disabled={loading}>{loading ? "计算中..." : "推理分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="creativity">
          <Card><CardHeader><CardTitle>创造力 (Quantum Creativity)</CardTitle><CardDescription>Generative/Combinatorial/Transformative/Exploratory/Evaluative</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={creativityType} onValueChange={setCreativityType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CR_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>发散度</Label><Input type="number" value={creativityDiv} onChange={(e) => setCreativityDiv(e.target.value)} step={0.05} min={0} max={1} /></div>
<div className="space-y-2"><Label>生成数</Label><Input type="number" value={creativityGen} onChange={(e) => setCreativityGen(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cognitive-computing/quantum-creativity", {creativity_type: creativityType, divergence_degree: creativityDiv, num_generations: creativityGen})} disabled={loading}>{loading ? "计算中..." : "创造力分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="emotion">
          <Card><CardHeader><CardTitle>情感计算 (Quantum Emotion)</CardTitle><CardDescription>Sentiment/Recognition/Affect/Empathy/Mood</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={emotionType} onValueChange={setEmotionType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>信号数</Label><Input type="number" value={emotionSignals} onChange={(e) => setEmotionSignals(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>情感维度</Label><Input type="number" value={emotionDim} onChange={(e) => setEmotionDim(e.target.value)} min={2} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cognitive-computing/quantum-emotion", {emotion_type: emotionType, num_signals: emotionSignals, emotion_dim: emotionDim})} disabled={loading}>{loading ? "计算中..." : "情感分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
