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

const PG_TYPES = [
  { value: "q_reinforce", label: "Q-REINFORCE" },
  { value: "q_ppo", label: "Q-PPO" },
  { value: "q_a3c", label: "Q-A3C" },
  { value: "q_trpo", label: "Q-TRPO" },
  { value: "q_sac", label: "Q-SAC" },
  { value: "ai_policy_grad", label: "AI" },
];

const QL_TYPES = [
  { value: "q_dqn", label: "Q-DQN" },
  { value: "q_double_dqn", label: "Double" },
  { value: "q_dueling_dqn", label: "Dueling" },
  { value: "q_c51", label: "C51" },
  { value: "q_qrdqn", label: "QR-DQN" },
  { value: "ai_qlearning", label: "AI" },
];

const AC_TYPES = [
  { value: "q_a2c", label: "Q-A2C" },
  { value: "q_sac_ac", label: "Q-SAC" },
  { value: "q_td3", label: "Q-TD3" },
  { value: "q_ppo_ac", label: "Q-PPO" },
  { value: "q_impala", label: "Q-IMPALA" },
  { value: "ai_actor_critic", label: "AI" },
];

const MDP_TYPES = [
  { value: "pomdp", label: "POMDP" },
  { value: "quantum_mdp", label: "QMDP" },
  { value: "belief_mdp", label: "Belief" },
  { value: "partially_quantum", label: "Partial Q" },
  { value: "decoherence_mdp", label: "Decoherence" },
  { value: "ai_mdp_solver", label: "AI" },
];

const MA_TYPES = [
  { value: "q_qmix", label: "Q-QMIX" },
  { value: "q_maddpg", label: "Q-MADDPG" },
  { value: "q_commnet", label: "Q-CommNet" },
  { value: "q_tarmac", label: "Q-TarMAC" },
  { value: "q_facmaddpg", label: "Q-FAC" },
  { value: "ai_multi_agent", label: "AI" },
];

const RW_TYPES = [
  { value: "potential_reward", label: "Potential" },
  { value: "curiosity_driven", label: "Curiosity" },
  { value: "hindsight_reward", label: "Hindsight" },
  { value: "intrinsic_reward", label: "Intrinsic" },
  { value: "quantum_advantage_reward", label: "Q-Advantage" },
  { value: "ai_reward_design", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumReinforcementLearningEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [pgType, setPgType] = useState("q_reinforce");
  const [pgActions, setPgActions] = useState("10");
  const [pgState, setPgState] = useState("64");
  const [qlType, setQlType] = useState("q_dqn");
  const [qlStates, setQlStates] = useState("1000");
  const [qlActions, setQlActions] = useState("10");
  const [acType, setAcType] = useState("q_a2c");
  const [acEnvs, setAcEnvs] = useState("16");
  const [acTraj, setAcTraj] = useState("2048");
  const [mdpType, setMdpType] = useState("pomdp");
  const [mdpStates, setMdpStates] = useState("500");
  const [mdpHorizon, setMdpHorizon] = useState("100");
  const [maType, setMaType] = useState("q_qmix");
  const [maAgents, setMaAgents] = useState("5");
  const [maJoints, setMaJoints] = useState("32");
  const [rewardType, setRewardType] = useState("potential_reward");
  const [rewardLength, setRewardLength] = useState("1000");
  const [rewardSparse, setRewardSparse] = useState("true");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-reinforcement-learning/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Reinforcement Learning Engine</h1>
          <p className="text-muted-foreground">Layer 111 — 策略梯度 / Q学习 / Actor-Critic / MDP / 多智能体 / 奖励塑形</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.359.0</Badge>
          <Badge variant="secondary">Layer 111</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="pg">策略梯度</TabsTrigger>
<TabsTrigger value="ql">Q学习</TabsTrigger>
<TabsTrigger value="ac">Actor-Critic</TabsTrigger>
<TabsTrigger value="mdp">MDP</TabsTrigger>
<TabsTrigger value="ma">多智能体</TabsTrigger>
<TabsTrigger value="reward">奖励塑形</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Reinforcement Learning Engine 概览</CardTitle><CardDescription>Layer 111 — 策略梯度 / Q学习 / Actor-Critic / MDP / 多智能体 / 奖励塑形 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="pg">
          <Card><CardHeader><CardTitle>策略梯度 (Policy Gradient)</CardTitle><CardDescription>REINFORCE/PPO/A3C/TRPO/SAC</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={pgType} onValueChange={setPgType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>动作空间</Label><Input type="number" value={pgActions} onChange={(e) => setPgActions(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>状态维度</Label><Input type="number" value={pgState} onChange={(e) => setPgState(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-reinforcement-learning/quantum-policy-gradient", {policy_type: pgType, num_actions: pgActions, state_dim: pgState})} disabled={loading}>{loading ? "计算中..." : "策略分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ql">
          <Card><CardHeader><CardTitle>Q学习 (Q-Learning)</CardTitle><CardDescription>DQN/Double/Dueling/C51/QR-DQN</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qlType} onValueChange={setQlType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>状态空间</Label><Input type="number" value={qlStates} onChange={(e) => setQlStates(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>动作空间</Label><Input type="number" value={qlActions} onChange={(e) => setQlActions(e.target.value)} min={2} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-reinforcement-learning/quantum-q-learning", {ql_type: qlType, state_space: qlStates, action_space: qlActions})} disabled={loading}>{loading ? "计算中..." : "Q分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ac">
          <Card><CardHeader><CardTitle>Actor-Critic (Actor-Critic)</CardTitle><CardDescription>A2C/SAC/TD3/PPO/IMPALA</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={acType} onValueChange={setAcType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>环境数</Label><Input type="number" value={acEnvs} onChange={(e) => setAcEnvs(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>轨迹长度</Label><Input type="number" value={acTraj} onChange={(e) => setAcTraj(e.target.value)} min={100} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-reinforcement-learning/quantum-actor-critic", {ac_type: acType, num_envs: acEnvs, traj_length: acTraj})} disabled={loading}>{loading ? "计算中..." : "AC分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="mdp">
          <Card><CardHeader><CardTitle>MDP (Quantum MDP)</CardTitle><CardDescription>POMDP/QMDP/Belief/Partially/Decoherence</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={mdpType} onValueChange={setMdpType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MDP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>状态数</Label><Input type="number" value={mdpStates} onChange={(e) => setMdpStates(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>决策时域</Label><Input type="number" value={mdpHorizon} onChange={(e) => setMdpHorizon(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-reinforcement-learning/quantum-mdp", {mdp_type: mdpType, num_states: mdpStates, horizon: mdpHorizon})} disabled={loading}>{loading ? "计算中..." : "MDP分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ma">
          <Card><CardHeader><CardTitle>多智能体 (Multi-Agent RL)</CardTitle><CardDescription>QMIX/MADDPG/CommNet/TarMAC/FAC</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={maType} onValueChange={setMaType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MA_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>智能体数</Label><Input type="number" value={maAgents} onChange={(e) => setMaAgents(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>联合动作</Label><Input type="number" value={maJoints} onChange={(e) => setMaJoints(e.target.value)} min={2} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-reinforcement-learning/quantum-multi-agent", {ma_type: maType, num_agents: maAgents, joint_action_space: maJoints})} disabled={loading}>{loading ? "计算中..." : "多智能体分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="reward">
          <Card><CardHeader><CardTitle>奖励塑形 (Reward Shaping)</CardTitle><CardDescription>Potential/Curiosity/Hindsight/Intrinsic/Q-Advantage</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={rewardType} onValueChange={setRewardType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RW_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>回合长度</Label><Input type="number" value={rewardLength} onChange={(e) => setRewardLength(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>稀疏奖励</Label><Input type="number" value={rewardSparse} onChange={(e) => setRewardSparse(e.target.value)}  /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-reinforcement-learning/quantum-reward", {reward_type: rewardType, episode_length: rewardLength, sparse_reward: rewardSparse})} disabled={loading}>{loading ? "计算中..." : "奖励分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
