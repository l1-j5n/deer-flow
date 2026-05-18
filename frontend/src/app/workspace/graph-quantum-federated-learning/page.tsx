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

const AGG_TYPES = [
  { value: "qfed_avg", label: "Q-FedAvg" },
  { value: "qfed_prox", label: "Q-FedProx" },
  { value: "qfed_dynamic", label: "Dynamic" },
  { value: "qfed_scaffold", label: "Scaffold" },
  { value: "qfed_median", label: "Median" },
  { value: "ai_fed_aggregator", label: "AI" },
];

const PRIV_TYPES = [
  { value: "quantum_dp", label: "Q-DP" },
  { value: "quantum_smc", label: "Q-SMC" },
  { value: "quantum_he", label: "Q-HE" },
  { value: "quantum_tee", label: "Q-TEE" },
  { value: "quantum_dp_smc", label: "DP-SMC" },
  { value: "ai_privacy_selector", label: "AI" },
];

const COMM_TYPES = [
  { value: "gradient_compress", label: "Grad Compress" },
  { value: "model_distillation", label: "Distillation" },
  { value: "async_comm", label: "Async" },
  { value: "hierarchical_comm", label: "Hierarchical" },
  { value: "sparse_gradient", label: "Sparse" },
  { value: "ai_comm_scheduler", label: "AI" },
];

const HETERO_TYPES = [
  { value: "model_fusion", label: "Model Fusion" },
  { value: "knowledge_distill_fed", label: "Know. Distill" },
  { value: "feature_alignment", label: "Feature Align" },
  { value: "data_valuation", label: "Data Value" },
  { value: "transfer_fed", label: "Transfer" },
  { value: "ai_hetero_fusion", label: "AI" },
];

const BZ_TYPES = [
  { value: "krum_defense", label: "Krum" },
  { value: "trimmed_mean", label: "Trimmed Mean" },
  { value: "zeno_defense", label: "Zeno" },
  { value: "fltrust", label: "FLTrust" },
  { value: "spectre_defense", label: "Spectre" },
  { value: "ai_byzantine_detect", label: "AI" },
];

const DC_TYPES = [
  { value: "gossip_fed", label: "Gossip" },
  { value: "blockchain_fed", label: "Blockchain" },
  { value: "mesh_fed", label: "Mesh" },
  { value: "ring_allreduce", label: "Ring" },
  { value: "swarm_fed", label: "Swarm" },
  { value: "ai_decentral_orchestrator", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumFederatedLearningEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [aggType, setAggType] = useState("qfed_avg");
  const [aggClients, setAggClients] = useState("100");
  const [aggRounds, setAggRounds] = useState("50");
  const [privacyType, setPrivacyType] = useState("quantum_dp");
  const [privacyEpsilon, setPrivacyEpsilon] = useState("1.0");
  const [privacyParties, setPrivacyParties] = useState("10");
  const [commType, setCommType] = useState("gradient_compress");
  const [commBW, setCommBW] = useState("100.0");
  const [commRounds, setCommRounds] = useState("100");
  const [heteroType, setHeteroType] = useState("model_fusion");
  const [heteroDomains, setHeteroDomains] = useState("5");
  const [heteroVariance, setHeteroVariance] = useState("0.3");
  const [byzantineType, setByzantineType] = useState("krum_defense");
  const [byzantineMalicious, setByzantineMalicious] = useState("20.0");
  const [byzantineClients, setByzantineClients] = useState("50");
  const [decentralType, setDecentralType] = useState("gossip_fed");
  const [decentralNodes, setDecentralNodes] = useState("200");
  const [decentralDiameter, setDecentralDiameter] = useState("10");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-federated-learning/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Federated Learning Engine</h1>
          <p className="text-muted-foreground">Layer 109 — 联邦聚合 / 隐私保护 / 通信优化 / 异构融合 / 拜占庭容错 / 去中心化</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.357.0</Badge>
          <Badge variant="secondary">Layer 109</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="agg">联邦聚合</TabsTrigger>
<TabsTrigger value="privacy">隐私保护</TabsTrigger>
<TabsTrigger value="comm">通信优化</TabsTrigger>
<TabsTrigger value="hetero">异构融合</TabsTrigger>
<TabsTrigger value="byzantine">拜占庭容错</TabsTrigger>
<TabsTrigger value="decentral">去中心化</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Federated Learning Engine 概览</CardTitle><CardDescription>Layer 109 — 联邦聚合 / 隐私保护 / 通信优化 / 异构融合 / 拜占庭容错 / 去中心化 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="agg">
          <Card><CardHeader><CardTitle>联邦聚合 (Fed Aggregation)</CardTitle><CardDescription>FedAvg/FedProx/Dynamic/Scaffold/Median</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={aggType} onValueChange={setAggType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AGG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>客户端数</Label><Input type="number" value={aggClients} onChange={(e) => setAggClients(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>通信轮数</Label><Input type="number" value={aggRounds} onChange={(e) => setAggRounds(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-federated-learning/fed-aggregation", {agg_type: aggType, num_clients: aggClients, rounds: aggRounds})} disabled={loading}>{loading ? "计算中..." : "聚合分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="privacy">
          <Card><CardHeader><CardTitle>隐私保护 (Privacy Preserving)</CardTitle><CardDescription>DP/SMC/HE/TEE/DP-SMC</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={privacyType} onValueChange={setPrivacyType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRIV_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>隐私预算(ε)</Label><Input type="number" value={privacyEpsilon} onChange={(e) => setPrivacyEpsilon(e.target.value)} step={0.1} /></div>
<div className="space-y-2"><Label>参与方数</Label><Input type="number" value={privacyParties} onChange={(e) => setPrivacyParties(e.target.value)} min={2} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-federated-learning/privacy-preserving", {privacy_type: privacyType, epsilon: privacyEpsilon, num_parties: privacyParties})} disabled={loading}>{loading ? "计算中..." : "隐私分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="comm">
          <Card><CardHeader><CardTitle>通信优化 (Comm Optimize)</CardTitle><CardDescription>GradientCompress/Distill/Async/Hierarchical/Sparse</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={commType} onValueChange={setCommType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COMM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>带宽(Mbps)</Label><Input type="number" value={commBW} onChange={(e) => setCommBW(e.target.value)} step={10} /></div>
<div className="space-y-2"><Label>轮数</Label><Input type="number" value={commRounds} onChange={(e) => setCommRounds(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-federated-learning/comm-optimize", {comm_type: commType, bandwidth_mbps: commBW, num_rounds: commRounds})} disabled={loading}>{loading ? "计算中..." : "通信分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="hetero">
          <Card><CardHeader><CardTitle>异构融合 (Heterogeneous Fed)</CardTitle><CardDescription>ModelFusion/KnowledgeDistill/FeatureAlign/Transfer</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={heteroType} onValueChange={setHeteroType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{HETERO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>域数量</Label><Input type="number" value={heteroDomains} onChange={(e) => setHeteroDomains(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>最大方差</Label><Input type="number" value={heteroVariance} onChange={(e) => setHeteroVariance(e.target.value)} step={0.05} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-federated-learning/heterogeneous-fed", {hetero_type: heteroType, num_domains: heteroDomains, max_model_variance: heteroVariance})} disabled={loading}>{loading ? "计算中..." : "异构分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="byzantine">
          <Card><CardHeader><CardTitle>拜占庭容错 (Byzantine Defense)</CardTitle><CardDescription>Krum/TrimmedMean/Zeno/FLTrust/Spectre</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={byzantineType} onValueChange={setByzantineType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{BZ_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>恶意比例(%)</Label><Input type="number" value={byzantineMalicious} onChange={(e) => setByzantineMalicious(e.target.value)} step={5} /></div>
<div className="space-y-2"><Label>客户端数</Label><Input type="number" value={byzantineClients} onChange={(e) => setByzantineClients(e.target.value)} min={5} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-federated-learning/byzantine-fed", {defense_type: byzantineType, num_malicious_pct: byzantineMalicious, num_clients: byzantineClients})} disabled={loading}>{loading ? "计算中..." : "容错分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="decentral">
          <Card><CardHeader><CardTitle>去中心化 (Decentralized Fed)</CardTitle><CardDescription>Gossip/Blockchain/Mesh/Ring/Swarm</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={decentralType} onValueChange={setDecentralType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>节点数</Label><Input type="number" value={decentralNodes} onChange={(e) => setDecentralNodes(e.target.value)} min={3} /></div>
<div className="space-y-2"><Label>网络直径</Label><Input type="number" value={decentralDiameter} onChange={(e) => setDecentralDiameter(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-federated-learning/decentralized-fed", {decentral_type: decentralType, num_nodes: decentralNodes, network_diameter: decentralDiameter})} disabled={loading}>{loading ? "计算中..." : "去中心化分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
