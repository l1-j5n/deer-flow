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

const GT_TYPES = [
  { value: "nash_equilibrium", label: "纳什" },
  { value: "quantum_prisoner", label: "囚徒" },
  { value: "stackelberg_game", label: "斯塔克" },
  { value: "auction_mechanism", label: "拍卖" },
  { value: "cooperative_game", label: "合作" },
  { value: "ai_game_strategist", label: "AI" },
];

const VT_TYPES = [
  { value: "plurality_voting", label: "多数" },
  { value: "ranked_choice", label: "排序" },
  { value: "approval_voting", label: "批准" },
  { value: "quadratic_voting", label: "二次" },
  { value: "liquid_democracy", label: "流动" },
  { value: "ai_consensus_engine", label: "AI" },
];

const OD_TYPES = [
  { value: "degroot_model", label: "DeGroot" },
  { value: "bounded_confidence", label: "有界" },
  { value: "voter_model", label: "投票" },
  { value: "majority_rule", label: "多数决" },
  { value: "social_influence", label: "社会" },
  { value: "ai_opinion_predictor", label: "AI" },
];

const NS_TYPES = [
  { value: "community_detection", label: "社区" },
  { value: "influence_maximization", label: "影响力" },
  { value: "information_diffusion", label: "扩散" },
  { value: "network_resilience", label: "韧性" },
  { value: "link_prediction", label: "链路" },
  { value: "ai_network_analyzer", label: "AI" },
];

const EC_TYPES = [
  { value: "market_simulation", label: "市场" },
  { value: "portfolio_optimization", label: "组合" },
  { value: "risk_assessment", label: "风险" },
  { value: "supply_chain", label: "供应链" },
  { value: "pricing_strategy", label: "定价" },
  { value: "ai_economic_advisor", label: "AI" },
];

const SS_TYPES = [
  { value: "agent_based_model", label: "ABM" },
  { value: "system_dynamics", label: "系统动力" },
  { value: "discrete_event", label: "离散" },
  { value: "monte_carlo_social", label: "MC" },
  { value: "cellular_automata", label: "元胞" },
  { value: "ai_social_simulator", label: "AI" },
];

function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumSocialComputingEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [gtType, setGtType] = useState("nash_equilibrium");
  const [gtPlayers, setGtPlayers] = useState("2");
  const [gtStrategy, setGtStrategy] = useState("0.5");
  const [vtType, setVtType] = useState("plurality_voting");
  const [vtVoters, setVtVoters] = useState("1000");
  const [vtCandidates, setVtCandidates] = useState("5");
  const [odType, setOdType] = useState("degroot_model");
  const [odPopSize, setOdPopSize] = useState("500");
  const [odPolarization, setOdPolarization] = useState("0.3");
  const [nsType, setNsType] = useState("community_detection");
  const [nsNodeCount, setNsNodeCount] = useState("1000");
  const [nsEdgeDensity, setNsEdgeDensity] = useState("0.1");
  const [ecType, setEcType] = useState("market_simulation");
  const [ecVolatility, setEcVolatility] = useState("0.2");
  const [ecTimeHorizon, setEcTimeHorizon] = useState("365");
  const [ssType, setSsType] = useState("agent_based_model");
  const [ssAgentCount, setSsAgentCount] = useState("10000");
  const [ssSimSteps, setSsSimSteps] = useState("1000");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-social-computing/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Social Computing Engine</h1>
          <p className="text-muted-foreground">Layer 122 — 量子博弈论 / 投票系统 / 舆情动力学 / 网络科学 / 经济建模 / 社会仿真</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.370.0</Badge>
          <Badge variant="secondary">Layer 122</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="gt">博弈论</TabsTrigger>
<TabsTrigger value="vt">投票系统</TabsTrigger>
<TabsTrigger value="od">舆情动力学</TabsTrigger>
<TabsTrigger value="ns">网络科学</TabsTrigger>
<TabsTrigger value="ec">经济建模</TabsTrigger>
<TabsTrigger value="ss">社会仿真</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Social Computing Engine 概览</CardTitle><CardDescription>Layer 122 — 量子博弈论 / 投票系统 / 舆情动力学 / 网络科学 / 经济建模 / 社会仿真 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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

        <TabsContent value="gt">
          <Card><CardHeader><CardTitle>博弈论 (Game Theory)</CardTitle><CardDescription>纳什/囚徒/斯塔克/拍卖/合作/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={gtType} onValueChange={setGtType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>参与者数</Label><Input type="number" value={gtPlayers} onChange={(e) => setGtPlayers(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>策略空间</Label><Input type="number" value={gtStrategy} onChange={(e) => setGtStrategy(e.target.value)} step={0.1} min={0} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-social-computing/quantum-game-theory", {game_type: gtType, player_count: gtPlayers, strategy_space: gtStrategy})} disabled={loading}>{loading ? "计算中..." : "博弈分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="vt">
          <Card><CardHeader><CardTitle>投票系统 (Voting System)</CardTitle><CardDescription>多数/排序/批准/二次/流动/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={vtType} onValueChange={setVtType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>选民数</Label><Input type="number" value={vtVoters} onChange={(e) => setVtVoters(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>候选人数</Label><Input type="number" value={vtCandidates} onChange={(e) => setVtCandidates(e.target.value)} min={2} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-social-computing/quantum-voting", {voting_type: vtType, voter_count: vtVoters, candidate_count: vtCandidates})} disabled={loading}>{loading ? "计算中..." : "投票分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="od">
          <Card><CardHeader><CardTitle>舆情动力学 (Opinion Dynamics)</CardTitle><CardDescription>DeGroot/有界/投票/多数决/社会/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={odType} onValueChange={setOdType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>种群规模</Label><Input type="number" value={odPopSize} onChange={(e) => setOdPopSize(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>极化指数</Label><Input type="number" value={odPolarization} onChange={(e) => setOdPolarization(e.target.value)} step={0.05} min={0} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-social-computing/quantum-opinion-dynamics", {opinion_type: odType, population_size: odPopSize, polarization_index: odPolarization})} disabled={loading}>{loading ? "计算中..." : "舆情分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ns">
          <Card><CardHeader><CardTitle>网络科学 (Network Science)</CardTitle><CardDescription>社区/影响力/扩散/韧性/链路/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={nsType} onValueChange={setNsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{NS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>节点数</Label><Input type="number" value={nsNodeCount} onChange={(e) => setNsNodeCount(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>边密度</Label><Input type="number" value={nsEdgeDensity} onChange={(e) => setNsEdgeDensity(e.target.value)} step={0.01} min={0.01} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-social-computing/quantum-network-science", {network_type: nsType, node_count: nsNodeCount, edge_density: nsEdgeDensity})} disabled={loading}>{loading ? "计算中..." : "网络分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ec">
          <Card><CardHeader><CardTitle>经济建模 (Economic Modeling)</CardTitle><CardDescription>市场/组合/风险/供应链/定价/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ecType} onValueChange={setEcType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>市场波动率</Label><Input type="number" value={ecVolatility} onChange={(e) => setEcVolatility(e.target.value)} step={0.01} min={0.01} max={1} /></div>
<div className="space-y-2"><Label>时间范围</Label><Input type="number" value={ecTimeHorizon} onChange={(e) => setEcTimeHorizon(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-social-computing/quantum-economics", {economics_type: ecType, market_volatility: ecVolatility, time_horizon: ecTimeHorizon})} disabled={loading}>{loading ? "计算中..." : "经济分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ss">
          <Card><CardHeader><CardTitle>社会仿真 (Social Simulation)</CardTitle><CardDescription>ABM/系统动力/离散/MC/元胞/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ssType} onValueChange={setSsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>智能体数</Label><Input type="number" value={ssAgentCount} onChange={(e) => setSsAgentCount(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>仿真步数</Label><Input type="number" value={ssSimSteps} onChange={(e) => setSsSimSteps(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-social-computing/quantum-social-simulation", {simulation_type: ssType, agent_count: ssAgentCount, simulation_steps: ssSimSteps})} disabled={loading}>{loading ? "计算中..." : "仿真分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
