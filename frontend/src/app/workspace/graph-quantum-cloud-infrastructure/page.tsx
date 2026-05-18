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

const SCHED_TYPES = [
  { value: "fair_share_sched", label: "Fair-Share" },
  { value: "priority_queue_sched", label: "Priority" },
  { value: "backfill_sched", label: "Backfill" },
  { value: "reservation_sched", label: "Reservation" },
  { value: "deadline_sched", label: "Deadline" },
  { value: "ai_quantum_sched", label: "AI" },
];

const VIRT_TYPES = [
  { value: "circuit_slicing", label: "Circuit Slicing" },
  { value: "qubit_partition", label: "Qubit Partition" },
  { value: "time_multiplex", label: "Time-Mux" },
  { value: "hybrid_partition", label: "Hybrid" },
  { value: "dynamic_allocation", label: "Dynamic" },
  { value: "ai_virtualization", label: "AI" },
];

const TENANT_TYPES = [
  { value: "role_based_access", label: "RBAC" },
  { value: "quota_based_access", label: "Quota" },
  { value: "priority_tier_access", label: "Priority Tier" },
  { value: "spot_instance_access", label: "Spot" },
  { value: "dedicated_hw_access", label: "Dedicated" },
  { value: "ai_tenant_access", label: "AI" },
];

const JOB_TYPES = [
  { value: "dag_scheduler", label: "DAG" },
  { value: "workflow_engine", label: "Workflow" },
  { value: "pipeline_manager", label: "Pipeline" },
  { value: "batch_processor", label: "Batch" },
  { value: "streaming_quantum", label: "Streaming" },
  { value: "ai_orchestration", label: "AI" },
];

const MON_TYPES = [
  { value: "hardware_monitor", label: "Hardware" },
  { value: "job_analytics", label: "Job Analytics" },
  { value: "cost_tracker", label: "Cost" },
  { value: "performance_dashboard", label: "Dashboard" },
  { value: "alerting_system", label: "Alerting" },
  { value: "ai_monitoring", label: "AI" },
];

const GW_TYPES = [
  { value: "rest_api_quantum", label: "REST" },
  { value: "grpc_quantum", label: "gRPC" },
  { value: "websocket_stream", label: "WebSocket" },
  { value: "graphql_quantum", label: "GraphQL" },
  { value: "sdk_interface", label: "SDK" },
  { value: "api_gateway", label: "Gateway" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumCloudInfrastructureEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [schedType, setSchedType] = useState("fair_share_sched");
  const [schedQPUs, setSchedQPUs] = useState("4");
  const [schedQueue, setSchedQueue] = useState("1000");
  const [virtType, setVirtType] = useState("circuit_slicing");
  const [virtQubits, setVirtQubits] = useState("127");
  const [virtTenants, setVirtTenants] = useState("5");
  const [tenantType, setTenantType] = useState("role_based_access");
  const [tenantUsers, setTenantUsers] = useState("100");
  const [tenantHours, setTenantHours] = useState("24.0");
  const [jobType, setJobType] = useState("dag_scheduler");
  const [jobConcurrent, setJobConcurrent] = useState("50");
  const [jobDepth, setJobDepth] = useState("1000");
  const [monitorType, setMonitorType] = useState("hardware_monitor");
  const [monitorInterval, setMonitorInterval] = useState("1.0");
  const [monitorRetention, setMonitorRetention] = useState("90");
  const [apigwType, setApigwType] = useState("rest_api_quantum");
  const [apigwRateLimit, setApigwRateLimit] = useState("1000");
  const [apigwLatency, setApigwLatency] = useState("50.0");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-cloud-infrastructure/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Cloud Infrastructure Engine</h1>
          <p className="text-muted-foreground">Layer 100 — 量子调度 / 虚拟化 / 多租户 / 作业编排 / 监控 / API网关</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.348.0</Badge>
          <Badge variant="secondary">Layer 100</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="sched">量子调度</TabsTrigger>
<TabsTrigger value="virt">虚拟化</TabsTrigger>
<TabsTrigger value="tenant">多租户</TabsTrigger>
<TabsTrigger value="job">作业编排</TabsTrigger>
<TabsTrigger value="monitor">监控</TabsTrigger>
<TabsTrigger value="apigw">API网关</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Cloud Infrastructure Engine 概览</CardTitle><CardDescription>Layer 100 — 量子调度 / 虚拟化 / 多租户 / 作业编排 / 监控 / API网关 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="sched">
          <Card><CardHeader><CardTitle>量子调度 (Quantum Scheduler)</CardTitle><CardDescription>Fair-Share/Priority/Backfill/Reservation/Deadline</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={schedType} onValueChange={setSchedType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SCHED_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>QPU数量</Label><Input type="number" value={schedQPUs} onChange={(e) => setSchedQPUs(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>最大队列深度</Label><Input type="number" value={schedQueue} onChange={(e) => setSchedQueue(e.target.value)} min={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cloud-infrastructure/quantum-scheduler", {sched_type: schedType, num_qpus: schedQPUs, max_queue_depth: schedQueue})} disabled={loading}>{loading ? "计算中..." : "调度分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="virt">
          <Card><CardHeader><CardTitle>虚拟化 (Virtualization Layer)</CardTitle><CardDescription>Slicing/Partition/Multiplex/Hybrid/Dynamic</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={virtType} onValueChange={setVirtType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VIRT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>总比特数</Label><Input type="number" value={virtQubits} onChange={(e) => setVirtQubits(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>租户数</Label><Input type="number" value={virtTenants} onChange={(e) => setVirtTenants(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cloud-infrastructure/virtualization-layer", {virt_type: virtType, total_qubits: virtQubits, num_tenants: virtTenants})} disabled={loading}>{loading ? "计算中..." : "虚拟化分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="tenant">
          <Card><CardHeader><CardTitle>多租户 (Multi-Tenant Access)</CardTitle><CardDescription>RBAC/Quota/Priority/Spot/Dedicated</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={tenantType} onValueChange={setTenantType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TENANT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>用户数</Label><Input type="number" value={tenantUsers} onChange={(e) => setTenantUsers(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>QPU时/天</Label><Input type="number" value={tenantHours} onChange={(e) => setTenantHours(e.target.value)} step={0.5} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cloud-infrastructure/multi-tenant-access", {access_type: tenantType, num_users: tenantUsers, qpu_hours_per_day: tenantHours})} disabled={loading}>{loading ? "计算中..." : "租户管理"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="job">
          <Card><CardHeader><CardTitle>作业编排 (Job Orchestration)</CardTitle><CardDescription>DAG/Workflow/Pipeline/Batch/Streaming</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={jobType} onValueChange={setJobType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{JOB_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>最大并发</Label><Input type="number" value={jobConcurrent} onChange={(e) => setJobConcurrent(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>平均电路深度</Label><Input type="number" value={jobDepth} onChange={(e) => setJobDepth(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cloud-infrastructure/job-orchestration", {orch_type: jobType, max_concurrent_jobs: jobConcurrent, avg_circuit_depth: jobDepth})} disabled={loading}>{loading ? "计算中..." : "编排分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="monitor">
          <Card><CardHeader><CardTitle>监控 (Monitoring)</CardTitle><CardDescription>Hardware/Job/Cost/Dashboard/Alerting</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={monitorType} onValueChange={setMonitorType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MON_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>监控间隔(s)</Label><Input type="number" value={monitorInterval} onChange={(e) => setMonitorInterval(e.target.value)} step={0.1} /></div>
<div className="space-y-2"><Label>保留天数</Label><Input type="number" value={monitorRetention} onChange={(e) => setMonitorRetention(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cloud-infrastructure/monitoring-observability", {monitor_type: monitorType, monitoring_interval_s: monitorInterval, retention_days: monitorRetention})} disabled={loading}>{loading ? "计算中..." : "监控分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="apigw">
          <Card><CardHeader><CardTitle>API网关 (API Gateway)</CardTitle><CardDescription>REST/gRPC/WebSocket/GraphQL/SDK</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={apigwType} onValueChange={setApigwType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GW_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>限速(次/分)</Label><Input type="number" value={apigwRateLimit} onChange={(e) => setApigwRateLimit(e.target.value)} min={10} /></div>
<div className="space-y-2"><Label>延迟目标(ms)</Label><Input type="number" value={apigwLatency} onChange={(e) => setApigwLatency(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cloud-infrastructure/quantum-api-gateway", {gateway_type: apigwType, rate_limit_per_min: apigwRateLimit, avg_latency_target_ms: apigwLatency})} disabled={loading}>{loading ? "计算中..." : "网关分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
