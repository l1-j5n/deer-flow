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

const FC_TYPES = [
  { value: "pid_control", label: "PID" },
  { value: "state_feedback", label: "State" },
  { value: "output_feedback", label: "Output" },
  { value: "h_infinity", label: "H∞" },
  { value: "lqr_control", label: "LQR" },
  { value: "ai_adaptive_control", label: "AI" },
];

const AS_TYPES = [
  { value: "model_reference", label: "Model-Ref" },
  { value: "self_tuning", label: "Self-Tune" },
  { value: "gain_scheduling", label: "Gain" },
  { value: "mrac", label: "MRAC" },
  { value: "neural_adaptive", label: "Neural" },
  { value: "ai_meta_adaptive", label: "AI" },
];

const HR_TYPES = [
  { value: "thermal_homeostasis", label: "Thermal" },
  { value: "energy_homeostasis", label: "Energy" },
  { value: "load_balancing", label: "Load" },
  { value: "resource_allocation", label: "Resource" },
  { value: "qos_regulation", label: "QoS" },
  { value: "ai_homeostasis", label: "AI" },
];

const AC_TYPES = [
  { value: "self_config", label: "Self-Config" },
  { value: "self_healing", label: "Self-Heal" },
  { value: "self_optimizing", label: "Self-Opt" },
  { value: "self_protecting", label: "Self-Protect" },
  { value: "self_aware", label: "Self-Aware" },
  { value: "ai_autonomic_manager", label: "AI" },
];

const SH_TYPES = [
  { value: "fault_detection", label: "Detection" },
  { value: "fault_isolation", label: "Isolation" },
  { value: "fault_recovery", label: "Recovery" },
  { value: "redundancy_mgmt", label: "Redundancy" },
  { value: "graceful_degradation", label: "Graceful" },
  { value: "ai_healing_orchestrator", label: "AI" },
];

const CC_TYPES = [
  { value: "perception_loop", label: "Perception" },
  { value: "decision_reasoning", label: "Decision" },
  { value: "action_execution", label: "Action" },
  { value: "learning_feedback", label: "Learning" },
  { value: "meta_cognition", label: "Meta-Cog" },
  { value: "ai_cognitive_arch", label: "AI" },
];

function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumCyberneticsEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [fcType, setFcType] = useState("pid_control");
  const [fcSetpoint, setFcSetpoint] = useState("1.0");
  const [fcNoise, setFcNoise] = useState("0.05");
  const [asType, setAsType] = useState("model_reference");
  const [asRate, setAsRate] = useState("0.1");
  const [asOrder, setAsOrder] = useState("3");
  const [hrType, setHrType] = useState("thermal_homeostasis");
  const [hrTarget, setHrTarget] = useState("0.5");
  const [hrBw, setHrBw] = useState("0.1");
  const [acType, setAcType] = useState("self_config");
  const [acElements, setAcElements] = useState("50");
  const [acRules, setAcRules] = useState("20");
  const [shType, setShType] = useState("fault_detection");
  const [shRate, setShRate] = useState("0.01");
  const [shSla, setShSla] = useState("30");
  const [ccType, setCcType] = useState("perception_loop");
  const [ccChannels, setCcChannels] = useState("10");
  const [ccDepth, setCcDepth] = useState("5");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-cybernetics/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Cybernetics Engine</h1>
          <p className="text-muted-foreground">Layer 120 — 反馈控制 / 自适应系统 / 稳态调节 / 自主计算 / 自愈系统 / 认知控制</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.368.0</Badge>
          <Badge variant="secondary">Layer 120</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="fc">反馈控制</TabsTrigger>
<TabsTrigger value="as">自适应</TabsTrigger>
<TabsTrigger value="hr">稳态调节</TabsTrigger>
<TabsTrigger value="ac">自主计算</TabsTrigger>
<TabsTrigger value="sh">自愈系统</TabsTrigger>
<TabsTrigger value="cc">认知控制</TabsTrigger>

        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Cybernetics Engine 概览</CardTitle><CardDescription>Layer 120 — 反馈控制 / 自适应系统 / 稳态调节 / 自主计算 / 自愈系统 / 认知控制 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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

        <TabsContent value="fc">
          <Card><CardHeader><CardTitle>反馈控制 (Feedback Control)</CardTitle><CardDescription>PID/State/Output/H∞/LQR/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={fcType} onValueChange={setFcType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>设定值</Label><Input type="number" value={fcSetpoint} onChange={(e) => setFcSetpoint(e.target.value)} step={0.1} /></div>
<div className="space-y-2"><Label>噪声水平</Label><Input type="number" value={fcNoise} onChange={(e) => setFcNoise(e.target.value)} step={0.01} min={0} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cybernetics/feedback-control", {control_type: fcType, setpoint: fcSetpoint, noise_level: fcNoise})} disabled={loading}>{loading ? "计算中..." : "控制分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="as">
          <Card><CardHeader><CardTitle>自适应系统 (Adaptive System)</CardTitle><CardDescription>Model-Ref/Self-Tune/Gain/MRAC/Neural/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={asType} onValueChange={setAsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>适应率</Label><Input type="number" value={asRate} onChange={(e) => setAsRate(e.target.value)} step={0.01} min={0.001} /></div>
<div className="space-y-2"><Label>系统阶数</Label><Input type="number" value={asOrder} onChange={(e) => setAsOrder(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cybernetics/adaptive-system", {adaptive_type: asType, adaptation_rate: asRate, system_order: asOrder})} disabled={loading}>{loading ? "计算中..." : "自适应分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="hr">
          <Card><CardHeader><CardTitle>稳态调节 (Homeostatic Regulation)</CardTitle><CardDescription>Thermal/Energy/Load/Resource/QoS/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={hrType} onValueChange={setHrType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{HR_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>目标值</Label><Input type="number" value={hrTarget} onChange={(e) => setHrTarget(e.target.value)} step={0.05} min={0} /></div>
<div className="space-y-2"><Label>调节带宽</Label><Input type="number" value={hrBw} onChange={(e) => setHrBw(e.target.value)} step={0.01} min={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cybernetics/homeostatic-regulation", {homeostasis_type: hrType, target_value: hrTarget, regulation_bandwidth: hrBw})} disabled={loading}>{loading ? "计算中..." : "稳态分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="ac">
          <Card><CardHeader><CardTitle>自主计算 (Autonomic Computing)</CardTitle><CardDescription>Self-Config/Heal/Optimize/Protect/Aware/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={acType} onValueChange={setAcType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>管理元素</Label><Input type="number" value={acElements} onChange={(e) => setAcElements(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>策略规则</Label><Input type="number" value={acRules} onChange={(e) => setAcRules(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cybernetics/autonomic-computing", {autonomic_type: acType, managed_elements: acElements, policy_rules: acRules})} disabled={loading}>{loading ? "计算中..." : "自主分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="sh">
          <Card><CardHeader><CardTitle>自愈系统 (Self-Healing System)</CardTitle><CardDescription>Detection/Isolation/Recovery/Redundancy/Graceful/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={shType} onValueChange={setShType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SH_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>故障注入率</Label><Input type="number" value={shRate} onChange={(e) => setShRate(e.target.value)} step={0.001} min={0.001} max={1} /></div>
<div className="space-y-2"><Label>恢复SLA(秒)</Label><Input type="number" value={shSla} onChange={(e) => setShSla(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cybernetics/self-healing-system", {healing_type: shType, fault_injection_rate: shRate, recovery_sla: shSla})} disabled={loading}>{loading ? "计算中..." : "自愈分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="cc">
          <Card><CardHeader><CardTitle>认知控制 (Cognitive Control)</CardTitle><CardDescription>Perception/Decision/Action/Learning/Meta-Cog/AI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={ccType} onValueChange={setCcType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>感知通道</Label><Input type="number" value={ccChannels} onChange={(e) => setCcChannels(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>决策深度</Label><Input type="number" value={ccDepth} onChange={(e) => setCcDepth(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cybernetics/cognitive-control", {cognitive_type: ccType, perception_channels: ccChannels, decision_depth: ccDepth})} disabled={loading}>{loading ? "计算中..." : "认知分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
