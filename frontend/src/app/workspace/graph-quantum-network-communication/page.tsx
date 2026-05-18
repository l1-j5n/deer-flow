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

const QKD_TYPES = [
  { value: "bb84", label: "BB84" },
  { value: "e91", label: "E91" },
  { value: "b92", label: "B92" },
  { value: "sargo04", label: "SARG04" },
  { value: "cv_qkd", label: "CV-QKD" },
  { value: "ai_qkd_protocol", label: "AI" },
];

const RP_TYPES = [
  { value: "one_way_repeater", label: "One-Way" },
  { value: "two_way_repeater", label: "Two-Way" },
  { value: "memory_repeater", label: "Memory" },
  { value: "all_photonic_repeater", label: "All-Photonic" },
  { value: "nlc_repeater", label: "NLC" },
  { value: "ai_repeater_design", label: "AI" },
];

const SW_TYPES = [
  { value: "bell_swap", label: "Bell" },
  { value: "ghz_swap", label: "GHZ" },
  { value: "cascaded_swap", label: "Cascaded" },
  { value: "nested_swap", label: "Nested" },
  { value: "multiplexed_swap", label: "Multiplexed" },
  { value: "ai_swap_schedule", label: "AI" },
];

const CH_TYPES = [
  { value: "fiber_channel", label: "Fiber" },
  { value: "free_space_channel", label: "Free-Space" },
  { value: "satellite_channel", label: "Satellite" },
  { value: "underwater_channel", label: "Underwater" },
  { value: "waveguide_channel", label: "Waveguide" },
  { value: "ai_channel_model", label: "AI" },
];

const RT_TYPES = [
  { value: "shortest_path_route", label: "Shortest" },
  { value: "entanglement_route", label: "Entanglement" },
  { value: "fidelity_route", label: "Fidelity" },
  { value: "multipath_route", label: "Multipath" },
  { value: "adaptive_route", label: "Adaptive" },
  { value: "ai_routing_policy", label: "AI" },
];

const TP_TYPES = [
  { value: "star_topology", label: "Star" },
  { value: "ring_topology", label: "Ring" },
  { value: "mesh_topology", label: "Mesh" },
  { value: "hierarchical_topo", label: "Hierarchical" },
  { value: "dtn_topology", label: "DTN" },
  { value: "ai_topology_opt", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumNetworkCommunicationEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [qkdType, setQkdType] = useState("bb84");
  const [qkdKeyLen, setQkdKeyLen] = useState("256");
  const [qkdDistance, setQkdDistance] = useState("100.0");
  const [repeaterType, setRepeaterType] = useState("one_way_repeater");
  const [repeaterCount, setRepeaterCount] = useState("5");
  const [repeaterSegment, setRepeaterSegment] = useState("50.0");
  const [swapType, setSwapType] = useState("bell_swap");
  const [swapNodes, setSwapNodes] = useState("10");
  const [swapFidelity, setSwapFidelity] = useState("0.9");
  const [channelType, setChannelType] = useState("fiber_channel");
  const [channelDistance, setChannelDistance] = useState("200.0");
  const [channelWavelength, setChannelWavelength] = useState("1550.0");
  const [routerType, setRouterType] = useState("shortest_path_route");
  const [routerNodes, setRouterNodes] = useState("20");
  const [routerLoad, setRouterLoad] = useState("100");
  const [topologyType, setTopologyType] = useState("star_topology");
  const [topologyNodes, setTopologyNodes] = useState("50");
  const [topologyConn, setTopologyConn] = useState("4");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-network-communication/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Network Communication Engine</h1>
          <p className="text-muted-foreground">Layer 105 — 量子密钥分发 / 量子中继器 / 纠缠交换 / 量子信道 / 量子路由 / 网络拓扑</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.353.0</Badge>
          <Badge variant="secondary">Layer 105</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="qkd">密钥分发</TabsTrigger>
<TabsTrigger value="repeater">量子中继器</TabsTrigger>
<TabsTrigger value="swap">纠缠交换</TabsTrigger>
<TabsTrigger value="channel">量子信道</TabsTrigger>
<TabsTrigger value="router">量子路由</TabsTrigger>
<TabsTrigger value="topology">网络拓扑</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Network Communication Engine 概览</CardTitle><CardDescription>Layer 105 — 量子密钥分发 / 量子中继器 / 纠缠交换 / 量子信道 / 量子路由 / 网络拓扑 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="qkd">
          <Card><CardHeader><CardTitle>密钥分发 (QKD Protocol)</CardTitle><CardDescription>BB84/E91/B92/SARG04/CV-QKD</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qkdType} onValueChange={setQkdType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QKD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>密钥长度(bits)</Label><Input type="number" value={qkdKeyLen} onChange={(e) => setQkdKeyLen(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>距离(km)</Label><Input type="number" value={qkdDistance} onChange={(e) => setQkdDistance(e.target.value)} step={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-network-communication/quantum-key-distribution", {protocol: qkdType, key_length_bits: qkdKeyLen, distance_km: qkdDistance})} disabled={loading}>{loading ? "计算中..." : "QKD分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="repeater">
          <Card><CardHeader><CardTitle>量子中继器 (Quantum Repeater)</CardTitle><CardDescription>OneWay/TwoWay/Memory/AllPhotonic/NLC</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={repeaterType} onValueChange={setRepeaterType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>中继器数</Label><Input type="number" value={repeaterCount} onChange={(e) => setRepeaterCount(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>段长(km)</Label><Input type="number" value={repeaterSegment} onChange={(e) => setRepeaterSegment(e.target.value)} step={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-network-communication/quantum-repeater", {repeater_type: repeaterType, num_repeaters: repeaterCount, segment_length_km: repeaterSegment})} disabled={loading}>{loading ? "计算中..." : "中继分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="swap">
          <Card><CardHeader><CardTitle>纠缠交换 (Entanglement Swap)</CardTitle><CardDescription>Bell/GHZ/Cascaded/Nested/Multiplexed</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={swapType} onValueChange={setSwapType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SW_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>节点数</Label><Input type="number" value={swapNodes} onChange={(e) => setSwapNodes(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>目标保真度</Label><Input type="number" value={swapFidelity} onChange={(e) => setSwapFidelity(e.target.value)} step={0.01} min={0} max={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-network-communication/entanglement-swap", {swap_type: swapType, num_nodes: swapNodes, target_fidelity: swapFidelity})} disabled={loading}>{loading ? "计算中..." : "交换分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="channel">
          <Card><CardHeader><CardTitle>量子信道 (Quantum Channel)</CardTitle><CardDescription>Fiber/FreeSpace/Satellite/Underwater/Waveguide</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={channelType} onValueChange={setChannelType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CH_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>距离(km)</Label><Input type="number" value={channelDistance} onChange={(e) => setChannelDistance(e.target.value)} step={10} /></div>
<div className="space-y-2"><Label>波长(nm)</Label><Input type="number" value={channelWavelength} onChange={(e) => setChannelWavelength(e.target.value)} step={10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-network-communication/quantum-channel", {channel_type: channelType, distance_km: channelDistance, wavelength_nm: channelWavelength})} disabled={loading}>{loading ? "计算中..." : "信道分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="router">
          <Card><CardHeader><CardTitle>量子路由 (Quantum Router)</CardTitle><CardDescription>Shortest/Entanglement/Fidelity/Multipath/Adaptive</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={routerType} onValueChange={setRouterType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>节点数</Label><Input type="number" value={routerNodes} onChange={(e) => setRouterNodes(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>流量负载</Label><Input type="number" value={routerLoad} onChange={(e) => setRouterLoad(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-network-communication/quantum-router", {routing_type: routerType, num_nodes: routerNodes, traffic_load: routerLoad})} disabled={loading}>{loading ? "计算中..." : "路由分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="topology">
          <Card><CardHeader><CardTitle>网络拓扑 (Network Topology)</CardTitle><CardDescription>Star/Ring/Mesh/Hierarchical/DTN</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={topologyType} onValueChange={setTopologyType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>节点数</Label><Input type="number" value={topologyNodes} onChange={(e) => setTopologyNodes(e.target.value)} min={3} /></div>
<div className="space-y-2"><Label>连接度</Label><Input type="number" value={topologyConn} onChange={(e) => setTopologyConn(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-network-communication/network-topology", {topology_type: topologyType, num_nodes: topologyNodes, connectivity: topologyConn})} disabled={loading}>{loading ? "计算中..." : "拓扑分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
