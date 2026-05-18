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

const KG_TYPES = [
  { value: "quantum_triple_store", label: "Triple Store" },
  { value: "quantum_graph_embedding", label: "Embedding" },
  { value: "quantum_reasoning_graph", label: "Reasoning" },
  { value: "quantum_entity_linking", label: "Entity Link" },
  { value: "quantum_relation_extraction", label: "Relation" },
  { value: "ai_quantum_knowledge_graph", label: "AI" },
];

const REASONING_TYPES = [
  { value: "quantum_description_logic", label: "Desc. Logic" },
  { value: "quantum_fuzzy_logic", label: "Fuzzy" },
  { value: "quantum_temporal_reasoning", label: "Temporal" },
  { value: "quantum_causal_reasoning", label: "Causal" },
  { value: "quantum_abductive_reasoning", label: "Abductive" },
  { value: "ai_quantum_reasoning", label: "AI" },
];

const NLP_TYPES = [
  { value: "quantum_compositional_semantics", label: "Compositional" },
  { value: "quantum_syntax_parsing", label: "Syntax" },
  { value: "quantum_discourse_analysis", label: "Discourse" },
  { value: "quantum_sentiment_entanglement", label: "Sentiment" },
  { value: "quantum_cross_lingual", label: "Cross-Lingual" },
  { value: "ai_quantum_nlp", label: "AI" },
];

const ONTOLOGY_TYPES = [
  { value: "quantum_schema_matching", label: "Schema" },
  { value: "quantum_ontology_alignment", label: "Alignment" },
  { value: "quantum_concept_drift", label: "Concept Drift" },
  { value: "quantum_taxonomy_evolution", label: "Taxonomy" },
  { value: "quantum_meronomy", label: "Meronomy" },
  { value: "ai_quantum_ontology", label: "AI" },
];

const QA_TYPES = [
  { value: "quantum_retrieval_qa", label: "Retrieval" },
  { value: "quantum_generative_qa", label: "Generative" },
  { value: "quantum_knowledge_qa", label: "Knowledge" },
  { value: "quantum_conversational_qa", label: "Conversational" },
  { value: "quantum_multimodal_qa", label: "Multimodal" },
  { value: "ai_quantum_qa", label: "AI" },
];

const RETRIEVAL_TYPES = [
  { value: "quantum_tfidf", label: "Q-TF-IDF" },
  { value: "quantum_bm25", label: "Q-BM25" },
  { value: "quantum_dense_retrieval", label: "Dense" },
  { value: "quantum_cross_encoder", label: "Cross-Encoder" },
  { value: "quantum_reranking", label: "Reranking" },
  { value: "ai_quantum_retrieval", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumSemanticWebEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [kgType, setKgType] = useState("quantum_triple_store");
  const [kgEntities, setKgEntities] = useState("100000");
  const [kgRelations, setKgRelations] = useState("50");
  const [reasoningType, setReasoningType] = useState("quantum_description_logic");
  const [reasoningAxioms, setReasoningAxioms] = useState("5000");
  const [reasoningDepth, setReasoningDepth] = useState("10");
  const [nlpType, setNlpType] = useState("quantum_compositional_semantics");
  const [nlpVocab, setNlpVocab] = useState("50000");
  const [nlpSeqLen, setNlpSeqLen] = useState("512");
  const [ontologyType, setOntologyType] = useState("quantum_schema_matching");
  const [ontologyConcepts, setOntologyConcepts] = useState("10000");
  const [ontologyDepth, setOntologyDepth] = useState("8");
  const [qaType, setQaType] = useState("quantum_retrieval_qa");
  const [qaKBSize, setQaKBSize] = useState("1000000");
  const [qaContext, setQaContext] = useState("4096");
  const [retrievalType, setRetrievalType] = useState("quantum_tfidf");
  const [retrievalIndex, setRetrievalIndex] = useState("10000000");
  const [retrievalLatency, setRetrievalLatency] = useState("50.0");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-semantic-web/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Semantic Web Engine</h1>
          <p className="text-muted-foreground">Layer 91 — 量子知识图谱 / 量子语义推理 / 量子NLP / 量子本体 / 量子问答 / 量子检索</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.339.0</Badge>
          <Badge variant="secondary">Layer 91</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="kg">量子知识图谱</TabsTrigger>
<TabsTrigger value="reasoning">语义推理</TabsTrigger>
<TabsTrigger value="nlp">量子NLP</TabsTrigger>
<TabsTrigger value="ontology">量子本体</TabsTrigger>
<TabsTrigger value="qa">量子问答</TabsTrigger>
<TabsTrigger value="retrieval">量子检索</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Semantic Web Engine 概览</CardTitle><CardDescription>Layer 91 — 量子知识图谱 / 量子语义推理 / 量子NLP / 量子本体 / 量子问答 / 量子检索 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="kg">
          <Card><CardHeader><CardTitle>量子知识图谱 (Quantum Knowledge Graph)</CardTitle><CardDescription>Triple Store/Embedding/Reasoning/Entity/Relation</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={kgType} onValueChange={setKgType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{KG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>实体数</Label><Input type="number" value={kgEntities} onChange={(e) => setKgEntities(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>关系类型</Label><Input type="number" value={kgRelations} onChange={(e) => setKgRelations(e.target.value)} min={5} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-semantic-web/quantum-knowledge-graph", {kg_type: kgType, entity_count: kgEntities, relation_types: kgRelations})} disabled={loading}>{loading ? "计算中..." : "图谱分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="reasoning">
          <Card><CardHeader><CardTitle>语义推理 (Quantum Reasoning)</CardTitle><CardDescription>Description Logic/Fuzzy/Temporal/Causal/Abductive</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={reasoningType} onValueChange={setReasoningType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{REASONING_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>公理数</Label><Input type="number" value={reasoningAxioms} onChange={(e) => setReasoningAxioms(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>推理深度</Label><Input type="number" value={reasoningDepth} onChange={(e) => setReasoningDepth(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-semantic-web/quantum-semantic-reasoning", {reasoning_type: reasoningType, axiom_count: reasoningAxioms, inference_depth: reasoningDepth})} disabled={loading}>{loading ? "计算中..." : "推理分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="nlp">
          <Card><CardHeader><CardTitle>量子NLP (Quantum NLP)</CardTitle><CardDescription>Compositional/Syntax/Discourse/Sentiment/Cross-Lingual</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={nlpType} onValueChange={setNlpType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{NLP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>词汇量</Label><Input type="number" value={nlpVocab} onChange={(e) => setNlpVocab(e.target.value)} min={1000} /></div>
<div className="space-y-2"><Label>序列长度</Label><Input type="number" value={nlpSeqLen} onChange={(e) => setNlpSeqLen(e.target.value)} min={32} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-semantic-web/quantum-nlp", {nlp_type: nlpType, vocab_size: nlpVocab, max_sequence_length: nlpSeqLen})} disabled={loading}>{loading ? "计算中..." : "NLP分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ontology">
          <Card><CardHeader><CardTitle>量子本体 (Quantum Ontology)</CardTitle><CardDescription>Schema/Alignment/Drift/Taxonomy/Meronomy</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ontologyType} onValueChange={setOntologyType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ONTOLOGY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>概念数</Label><Input type="number" value={ontologyConcepts} onChange={(e) => setOntologyConcepts(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>层级深度</Label><Input type="number" value={ontologyDepth} onChange={(e) => setOntologyDepth(e.target.value)} min={2} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-semantic-web/quantum-ontology", {ontology_type: ontologyType, concept_count: ontologyConcepts, hierarchy_depth: ontologyDepth})} disabled={loading}>{loading ? "计算中..." : "本体映射"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="qa">
          <Card><CardHeader><CardTitle>量子问答 (Quantum QA)</CardTitle><CardDescription>Retrieval/Generative/Knowledge/Conversational/Multimodal</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qaType} onValueChange={setQaType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QA_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>知识库大小</Label><Input type="number" value={qaKBSize} onChange={(e) => setQaKBSize(e.target.value)} min={1000} /></div>
<div className="space-y-2"><Label>上下文窗口</Label><Input type="number" value={qaContext} onChange={(e) => setQaContext(e.target.value)} min={128} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-semantic-web/quantum-qa", {qa_type: qaType, knowledge_base_size: qaKBSize, context_window: qaContext})} disabled={loading}>{loading ? "计算中..." : "问答分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="retrieval">
          <Card><CardHeader><CardTitle>量子检索 (Quantum Retrieval)</CardTitle><CardDescription>TF-IDF/BM25/Dense/Cross-Encoder/Reranking</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={retrievalType} onValueChange={setRetrievalType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RETRIEVAL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>索引大小</Label><Input type="number" value={retrievalIndex} onChange={(e) => setRetrievalIndex(e.target.value)} min={1000} /></div>
<div className="space-y-2"><Label>延迟(ms)</Label><Input type="number" value={retrievalLatency} onChange={(e) => setRetrievalLatency(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-semantic-web/quantum-retrieval", {retrieval_type: retrievalType, index_size: retrievalIndex, query_latency_ms: retrievalLatency})} disabled={loading}>{loading ? "计算中..." : "检索分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
