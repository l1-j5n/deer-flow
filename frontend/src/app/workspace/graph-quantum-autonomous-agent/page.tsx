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

const DC_TYPES = [
  { value: "q_utility", label: "Utility" },
  { value: "q_bayesian", label: "Bayesian" },
  { value: "q_prospect", label: "Prospect" },
  { value: "q_game_theory", label: "Game Theory" },
  { value: "q_markov_decision", label: "Markov" },
  { value: "ai_decision_engine", label: "AI" },
];

const PL_TYPES = [
  { value: "q_goal_planning", label: "Goal" },
  { value: "q_hierarchical", label: "Hierarchical" },
  { value: "q_task_decomp", label: "Task Decomp" },
  { value: "q_contingency", label: "Contingency" },
  { value: "q_temporal_planning", label: "Temporal" },
  { value: "ai_planning_orchestrator", label: "AI" },
];

const RS_TYPES = [
  { value: "q_deductive", label: "Deductive" },
  { value: "q_inductive", label: "Inductive" },
  { value: "q_abductive", label: "Abductive" },
  { value: "q_analogical", label: "Analogical" },
  { value: "q_causal", label: "Causal" },
  { value: "ai_reasoning_chain", label: "AI" },
];

const PC_TYPES = [
  { value: "sensor_fusion_q", label: "Sensor" },
  { value: "multi_modal_q", label: "Multi-Modal" },
  { value: "attention_fusion_q", label: "Attention" },
  { value: "belief_update_q", label: "Belief" },
  { value: "state_estimation_q", label: "State" },
  { value: "ai_perception_fusion", label: "AI" },
];

const SL_TYPES = [
  { value: "meta_q_learning", label: "Meta-Learn" },
  { value: "curriculum_q", label: "Curriculum" },
  { value: "self_play_q", label: "Self-Play" },
  { value: "evolution_q", label: "Evolution" },
  { value: "lifelong_q", label: "Lifelong" },
  { value: "ai_self_improve", label: "AI" },
];

const WM_TYPES = [
  { value: "transition_model_q", label: "Transition" },
  { value: "reward_model_q", label: "Reward" },
  { value: "dynamics_model_q", label: "Dynamics" },
  { value: "latent_world_q", label: "Latent" },
  { value: "imagination_q", label: "Imagination" },
  { value: "ai_world_predictor", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumAutonomousAgentEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [decisionType, setDecisionType] = useState("q_utility");
  const [decisionAlts, setDecisionAlts] = useState("10");
  const [decisionUncertainty, setDecisionUncertainty] = useState("0.3");
  const [planningType, setPlanningType] = useState("q_goal_planning");
  const [planningHorizon, setPlanningHorizon] = useState("50");
  const [planningConstraints, setPlanningConstraints] = useState("10");
  const [reasoningType, setReasoningType] = useState("q_deductive");
  const [reasoningFacts, setReasoningFacts] = useState("1000");
  const [reasoningDepth, setReasoningDepth] = useState("5");
  const [perceptionType, setPerceptionType] = useState("sensor_fusion_q");
  const [perceptionSensors, setPerceptionSensors] = useState("8");
  const [perceptionDim, setPerceptionDim] = useState("256");
  const [learningType, setLearningType] = useState("meta_q_learning");
  const [learningTasks, setLearningTasks] = useState("20");
  const [learningAdapt, setLearningAdapt] = useState("100");
  const [worldType, setWorldType] = useState("transition_model_q");
  const [worldState, setWorldState] = useState("128");
  const [worldAction, setWorldAction] = useState("16");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-autonomous-agent/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Autonomous Agent Engine</h1>
          <p className="text-muted-foreground">Layer 112 — 量子决策 / 量子规划 / 量子推理 / 感知融合 / 自主学习 / 世界模型</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.360.0</Badge>
          <Badge variant="secondary">Layer 112</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="decision">量子决策</TabsTrigger>
<TabsTrigger value="planning">量子规划</TabsTrigger>
<TabsTrigger value="reasoning">量子推理</TabsTrigger>
<TabsTrigger value="perception">感知融合</TabsTrigger>
<TabsTrigger value="learning">自主学习</TabsTrigger>
<TabsTrigger value="world">世界模型</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Autonomous Agent Engine 概览</CardTitle><CardDescription>Layer 112 — 量子决策 / 量子规划 / 量子推理 / 感知融合 / 自主学习 / 世界模型 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="decision">
          <Card><CardHeader><CardTitle>量子决策 (Quantum Decision)</CardTitle><CardDescription>Utility/Bayesian/Prospect/GameTheory/Markov</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={decisionType} onValueChange={setDecisionType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>备选方案数</Label><Input type="number" value={decisionAlts} onChange={(e) => setDecisionAlts(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>不确定性</Label><Input type="number" value={decisionUncertainty} onChange={(e) => setDecisionUncertainty(e.target.value)} step={0.05} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-autonomous-agent/quantum-decision", {decision_type: decisionType, num_alternatives: decisionAlts, uncertainty_level: decisionUncertainty})} disabled={loading}>{loading ? "计算中..." : "决策分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="planning">
          <Card><CardHeader><CardTitle>量子规划 (Quantum Planning)</CardTitle><CardDescription>Goal/Hierarchical/TaskDecomp/Contingency/Temporal</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={planningType} onValueChange={setPlanningType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>规划步数</Label><Input type="number" value={planningHorizon} onChange={(e) => setPlanningHorizon(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>约束数</Label><Input type="number" value={planningConstraints} onChange={(e) => setPlanningConstraints(e.target.value)} min={0} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-autonomous-agent/quantum-planning", {planning_type: planningType, horizon_steps: planningHorizon, num_constraints: planningConstraints})} disabled={loading}>{loading ? "计算中..." : "规划分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="reasoning">
          <Card><CardHeader><CardTitle>量子推理 (Quantum Reasoning)</CardTitle><CardDescription>Deductive/Inductive/Abductive/Analogical/Causal</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={reasoningType} onValueChange={setReasoningType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>知识事实数</Label><Input type="number" value={reasoningFacts} onChange={(e) => setReasoningFacts(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>推理深度</Label><Input type="number" value={reasoningDepth} onChange={(e) => setReasoningDepth(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-autonomous-agent/quantum-reasoning", {reasoning_type: reasoningType, knowledge_facts: reasoningFacts, inference_depth: reasoningDepth})} disabled={loading}>{loading ? "计算中..." : "推理分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="perception">
          <Card><CardHeader><CardTitle>感知融合 (Perception Fusion)</CardTitle><CardDescription>Sensor/MultiModal/Attention/Belief/State</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={perceptionType} onValueChange={setPerceptionType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>传感器数</Label><Input type="number" value={perceptionSensors} onChange={(e) => setPerceptionSensors(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>融合维度</Label><Input type="number" value={perceptionDim} onChange={(e) => setPerceptionDim(e.target.value)} min={16} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-autonomous-agent/quantum-perception", {perception_type: perceptionType, num_sensors: perceptionSensors, fusion_dim: perceptionDim})} disabled={loading}>{loading ? "计算中..." : "感知分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="learning">
          <Card><CardHeader><CardTitle>自主学习 (Self-Learning)</CardTitle><CardDescription>Meta/Curriculum/SelfPlay/Evolution/Lifelong</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={learningType} onValueChange={setLearningType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>任务数</Label><Input type="number" value={learningTasks} onChange={(e) => setLearningTasks(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>适应步数</Label><Input type="number" value={learningAdapt} onChange={(e) => setLearningAdapt(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-autonomous-agent/quantum-self-learning", {learning_type: learningType, num_tasks: learningTasks, adaptation_steps: learningAdapt})} disabled={loading}>{loading ? "计算中..." : "学习分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="world">
          <Card><CardHeader><CardTitle>世界模型 (World Model)</CardTitle><CardDescription>Transition/Reward/Dynamics/Latent/Imagination</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={worldType} onValueChange={setWorldType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{WM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>状态维度</Label><Input type="number" value={worldState} onChange={(e) => setWorldState(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>动作维度</Label><Input type="number" value={worldAction} onChange={(e) => setWorldAction(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-autonomous-agent/quantum-world-model", {model_type: worldType, state_dim: worldState, action_dim: worldAction})} disabled={loading}>{loading ? "计算中..." : "世界模型分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
