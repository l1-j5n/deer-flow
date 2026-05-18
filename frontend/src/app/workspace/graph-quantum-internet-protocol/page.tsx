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

const TP_TYPES = [
  { value: "qtp_reliable", label: "Reliable" },
  { value: "qtp_unreliable", label: "Unreliable" },
  { value: "qtp_stream", label: "Stream" },
  { value: "qtp_datagram", label: "Datagram" },
  { value: "qtp_multicast", label: "Multicast" },
  { value: "ai_transport_select", label: "AI" },
];

const DNS_TYPES = [
  { value: "qdns_classical", label: "Classical" },
  { value: "qdns_quantum", label: "Quantum" },
  { value: "qdns_hybrid", label: "Hybrid" },
  { value: "qdns_entangled", label: "Entangled" },
  { value: "qdns_anonymous", label: "Anonymous" },
  { value: "ai_dns_resolve", label: "AI" },
];

const ROUTE_TYPES = [
  { value: "qospf", label: "QOSPF" },
  { value: "qbgp", label: "QBGP" },
  { value: "qrip", label: "QRIP" },
  { value: "qmpls", label: "QMPLS" },
  { value: "qsegment", label: "QSegment" },
  { value: "ai_route_protocol", label: "AI" },
];

const LINK_TYPES = [
  { value: "entanglement_ll", label: "Entanglement" },
  { value: "heralded_ll", label: "Heralded" },
  { value: "swap_ll", label: "Swap" },
  { value: "purification_ll", label: "Purification" },
  { value: "multiplexed_ll", label: "Multiplexed" },
  { value: "ai_link_manage", label: "AI" },
];

const APP_TYPES = [
  { value: "qrpc", label: "QRPC" },
  { value: "qftp", label: "QFTP" },
  { value: "qsmtp", label: "QSMTP" },
  { value: "qhttp", label: "QHTTP" },
  { value: "qwebsocket", label: "QWebSocket" },
  { value: "ai_app_protocol", label: "AI" },
];

const SDN_TYPES = [
  { value: "openflow_quantum", label: "OpenFlow-Q" },
  { value: "sdn_controller_q", label: "Controller" },
  { value: "network_slice_q", label: "Slicing" },
  { value: "flow_table_q", label: "Flow Table" },
  { value: "sdn_orchestration_q", label: "Orchestration" },
  { value: "ai_sdn_policy", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumInternetProtocolEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [transportType, setTransportType] = useState("qtp_reliable");
  const [transportBW, setTransportBW] = useState("100.0");
  const [transportLatency, setTransportLatency] = useState("10.0");
  const [dnsType, setDnsType] = useState("qdns_classical");
  const [dnsQPS, setDnsQPS] = useState("1000");
  const [dnsRecords, setDnsRecords] = useState("10000");
  const [routingType, setRoutingType] = useState("qospf");
  const [routingAS, setRoutingAS] = useState("50");
  const [routingTableSize, setRoutingTableSize] = useState("10000");
  const [linkType, setLinkType] = useState("entanglement_ll");
  const [linkDistance, setLinkDistance] = useState("100.0");
  const [linkFidelity, setLinkFidelity] = useState("0.95");
  const [appType, setAppType] = useState("qrpc");
  const [appRate, setAppRate] = useState("1000");
  const [appPayload, setAppPayload] = useState("100");
  const [sdnType, setSdnType] = useState("openflow_quantum");
  const [sdnSwitches, setSdnSwitches] = useState("100");
  const [sdnFlows, setSdnFlows] = useState("50000");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-internet-protocol/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Internet Protocol Engine</h1>
          <p className="text-muted-foreground">Layer 107 — 量子传输层 / 量子DNS / 路由协议 / 链路层 / 应用层 / 量子SDN</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.355.0</Badge>
          <Badge variant="secondary">Layer 107</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="transport">传输层</TabsTrigger>
<TabsTrigger value="dns">量子DNS</TabsTrigger>
<TabsTrigger value="routing">路由协议</TabsTrigger>
<TabsTrigger value="link">链路层</TabsTrigger>
<TabsTrigger value="app">应用层</TabsTrigger>
<TabsTrigger value="sdn">量子SDN</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Internet Protocol Engine 概览</CardTitle><CardDescription>Layer 107 — 量子传输层 / 量子DNS / 路由协议 / 链路层 / 应用层 / 量子SDN — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="transport">
          <Card><CardHeader><CardTitle>传输层 (Quantum Transport)</CardTitle><CardDescription>Reliable/Unreliable/Stream/Datagram/Multicast</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={transportType} onValueChange={setTransportType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>带宽(Mbps)</Label><Input type="number" value={transportBW} onChange={(e) => setTransportBW(e.target.value)} step={10} /></div>
<div className="space-y-2"><Label>延迟(ms)</Label><Input type="number" value={transportLatency} onChange={(e) => setTransportLatency(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-internet-protocol/quantum-transport", {transport_type: transportType, bandwidth_mbps: transportBW, latency_target_ms: transportLatency})} disabled={loading}>{loading ? "计算中..." : "传输分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="dns">
          <Card><CardHeader><CardTitle>量子DNS (Quantum DNS)</CardTitle><CardDescription>Classical/Quantum/Hybrid/Entangled/Anonymous</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={dnsType} onValueChange={setDnsType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DNS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>查询率(QPS)</Label><Input type="number" value={dnsQPS} onChange={(e) => setDnsQPS(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>记录数</Label><Input type="number" value={dnsRecords} onChange={(e) => setDnsRecords(e.target.value)} min={100} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-internet-protocol/quantum-dns", {dns_type: dnsType, query_rate_per_sec: dnsQPS, record_count: dnsRecords})} disabled={loading}>{loading ? "计算中..." : "DNS分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="routing">
          <Card><CardHeader><CardTitle>路由协议 (Routing Protocol)</CardTitle><CardDescription>QOSPF/QBGP/QRIP/QMPLS/QSegment</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={routingType} onValueChange={setRoutingType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ROUTE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>AS数量</Label><Input type="number" value={routingAS} onChange={(e) => setRoutingAS(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>路由表大小</Label><Input type="number" value={routingTableSize} onChange={(e) => setRoutingTableSize(e.target.value)} min={100} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-internet-protocol/quantum-routing-protocol", {protocol: routingType, num_as: routingAS, route_table_size: routingTableSize})} disabled={loading}>{loading ? "计算中..." : "路由分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="link">
          <Card><CardHeader><CardTitle>链路层 (Link Layer)</CardTitle><CardDescription>Entanglement/Heralded/Swap/Purification/Multiplexed</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={linkType} onValueChange={setLinkType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LINK_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>链路距离(km)</Label><Input type="number" value={linkDistance} onChange={(e) => setLinkDistance(e.target.value)} step={10} /></div>
<div className="space-y-2"><Label>保真度</Label><Input type="number" value={linkFidelity} onChange={(e) => setLinkFidelity(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-internet-protocol/quantum-link-layer", {link_type: linkType, link_distance_km: linkDistance, fidelity_target: linkFidelity})} disabled={loading}>{loading ? "计算中..." : "链路分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="app">
          <Card><CardHeader><CardTitle>应用层 (App Layer)</CardTitle><CardDescription>QRPC/QFTP/QSMTP/QHTTP/QWebSocket</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={appType} onValueChange={setAppType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{APP_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>请求率(rps)</Label><Input type="number" value={appRate} onChange={(e) => setAppRate(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>负载(KB)</Label><Input type="number" value={appPayload} onChange={(e) => setAppPayload(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-internet-protocol/quantum-app-layer", {app_type: appType, request_rate: appRate, payload_size_kb: appPayload})} disabled={loading}>{loading ? "计算中..." : "应用分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="sdn">
          <Card><CardHeader><CardTitle>量子SDN (Quantum SDN)</CardTitle><CardDescription>OpenFlow/Controller/Slicing/FlowTable/Orchestration</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={sdnType} onValueChange={setSdnType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SDN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>交换机数</Label><Input type="number" value={sdnSwitches} onChange={(e) => setSdnSwitches(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>流表项数</Label><Input type="number" value={sdnFlows} onChange={(e) => setSdnFlows(e.target.value)} min={100} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-internet-protocol/quantum-sdn", {sdn_type: sdnType, num_switches: sdnSwitches, flow_entries: sdnFlows})} disabled={loading}>{loading ? "计算中..." : "SDN分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
