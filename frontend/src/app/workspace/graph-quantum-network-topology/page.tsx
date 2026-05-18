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

const CHANNEL_TYPES = [
  { value: "fiber_channel", label: "Fiber 光纤信道" },
  { value: "free_space_channel", label: "Free Space 自由空间" },
  { value: "satellite_channel", label: "Satellite 卫星信道" },
  { value: "waveguide_channel", label: "Waveguide 波导" },
  { value: "cavity_qed_channel", label: "Cavity QED 腔量子电动力学" },
  { value: "ai_quantum_channel", label: "AI 量子信道" },
];
const ENTANGLEMENT_TYPES = [
  { value: "entanglement_swapping", label: "Swapping 纠缠交换" },
  { value: "quantum_repeater", label: "Repeater 量子中继" },
  { value: "teleportation_based", label: "Teleportation 隐形传态" },
  { value: "direct_transmission", label: "Direct 直接传输" },
  { value: "entanglement_purification", label: "Purification 纠缠纯化" },
  { value: "ai_entanglement_dist", label: "AI 纠缠分发" },
];
const PROTOCOL_TYPES = [
  { value: "qkd_bb84", label: "BB84 协议" },
  { value: "qkd_e91", label: "E91 协议" },
  { value: "quantum_teleportation", label: "Quantum Teleportation 量子隐形传态" },
  { value: "quantum_secret_sharing", label: "Secret Sharing 量子秘密共享" },
  { value: "quantum_voting", label: "Quantum Voting 量子投票" },
  { value: "ai_network_protocol", label: "AI 网络协议" },
];
const TOPOLOGY_TYPES = [
  { value: "star_topology", label: "Star 星型" },
  { value: "mesh_topology", label: "Mesh 网状" },
  { value: "ring_topology", label: "Ring 环型" },
  { value: "tree_topology", label: "Tree 树型" },
  { value: "hybrid_topology", label: "Hybrid 混合型" },
  { value: "ai_network_topology", label: "AI 网络拓扑" },
];
const MEMORY_TYPES = [
  { value: "atomic_memory", label: "Atomic 原子存储" },
  { value: "spin_memory", label: "Spin 自旋存储" },
  { value: "photonic_memory", label: "Photonic 光子存储" },
  { value: "superconducting_memory", label: "Superconducting 超导存储" },
  { value: "nv_center_memory", label: "NV Center NV色心" },
  { value: "ai_memory_node", label: "AI 存储节点" },
];
const INTERNET_TYPES = [
  { value: "quantum_physical", label: "Physical 物理层" },
  { value: "quantum_link", label: "Link 链路层" },
  { value: "quantum_network", label: "Network 网络层" },
  { value: "quantum_transport", label: "Transport 传输层" },
  { value: "quantum_application", label: "Application 应用层" },
  { value: "ai_internet_layer", label: "AI 互联网层" },
];

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function QuantumNetworkTopologyPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  const [channelType, setChannelType] = useState("fiber_channel");
  const [channelLength, setChannelLength] = useState("50.0");
  const [attenuation, setAttenuation] = useState("0.2");
  const [entType, setEntType] = useState("entanglement_swapping");
  const [numHops, setNumHops] = useState("3");
  const [fidelityTarget, setFidelityTarget] = useState("0.9");
  const [protoType, setProtoType] = useState("qkd_bb84");
  const [keyLength, setKeyLength] = useState("256");
  const [secParam, setSecParam] = useState("1e-10");
  const [topoType, setTopoType] = useState("mesh_topology");
  const [numNodes, setNumNodes] = useState("10");
  const [connectivity, setConnectivity] = useState("0.5");
  const [memType, setMemType] = useState("atomic_memory");
  const [coherenceTime, setCoherenceTime] = useState("100.0");
  const [storageFidelity, setStorageFidelity] = useState("0.99");
  const [inetType, setInetType] = useState("quantum_network");
  const [bandwidth, setBandwidth] = useState("100.0");
  const [coverage, setCoverage] = useState("1000.0");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/quantum-network-topology/overview`);
      const data = await res.json();
      setOverview(data); setResult(data);
    } catch (e) { setResult({ error: String(e) }); } finally { setLoading(false); }
  }

  async function postEndpoint(path: string, params: Record<string, string>) {
    setLoading(true); setResult(null);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}${path}?${qs}`, { method: "POST" });
      setResult(await res.json());
    } catch (e) { setResult({ error: String(e) }); } finally { setLoading(false); }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quantum Network Topology Engine</h1>
          <p className="text-muted-foreground">
            Layer 83 — 量子信道 / 纠缠分发 / 网络协议 / 拓扑结构 / 量子存储 / 量子互联网
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.331.0</Badge>
          <Badge variant="secondary">Layer 83</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channel">量子信道</TabsTrigger>
          <TabsTrigger value="entanglement">纠缠分发</TabsTrigger>
          <TabsTrigger value="protocol">网络协议</TabsTrigger>
          <TabsTrigger value="topology">拓扑结构</TabsTrigger>
          <TabsTrigger value="memory">量子存储</TabsTrigger>
          <TabsTrigger value="internet">量子互联网</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Quantum Network Topology Engine 概览</CardTitle><CardDescription>量子网络拓扑引擎 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchOverview} disabled={loading}>{loading ? "加载中..." : "获取概览"}</Button>
              {overview && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <Card><CardHeader className="pb-2"><CardDescription>枚举数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.enum_count}</div></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardDescription>端点数</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.endpoint_count}</div></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardDescription>配置空间</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{overview.config_space.toLocaleString()}</div></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardDescription>缓存命中</CardDescription></CardHeader><CardContent><div className="text-2xl font-bold">{Object.values(overview.cache_stats).reduce((a: number, b: number) => a + b, 0)}</div></CardContent></Card>
                </div>
              )}
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channel">
          <Card>
            <CardHeader><CardTitle>量子信道 (Quantum Channel)</CardTitle><CardDescription>Fiber/Free-Space/Satellite/Waveguide/Cavity QED — 量子通信信道分析</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>信道类型</Label><Select value={channelType} onValueChange={setChannelType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CHANNEL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>信道长度 (km)</Label><Input type="number" value={channelLength} onChange={(e) => setChannelLength(e.target.value)} step={1} min={0.1} max={50000} /></div>
                <div className="space-y-2"><Label>衰减系数 (dB/km)</Label><Input type="number" value={attenuation} onChange={(e) => setAttenuation(e.target.value)} step={0.01} min={0.01} max={10} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-network-topology/quantum-channel", { channel_type: channelType, channel_length_km: channelLength, attenuation_db_km: attenuation })} disabled={loading}>{loading ? "计算中..." : "分析量子信道"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entanglement">
          <Card>
            <CardHeader><CardTitle>纠缠分发 (Entanglement Distribution)</CardTitle><CardDescription>Swapping/Repeater/Teleportation/Purification — 量子纠缠网络分发</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>分发类型</Label><Select value={entType} onValueChange={setEntType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ENTANGLEMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>跳数</Label><Input type="number" value={numHops} onChange={(e) => setNumHops(e.target.value)} min={1} max={100} /></div>
                <div className="space-y-2"><Label>目标保真度</Label><Input type="number" value={fidelityTarget} onChange={(e) => setFidelityTarget(e.target.value)} step={0.01} min={0.5} max={1.0} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-network-topology/entanglement-distribution", { distribution_type: entType, num_hops: numHops, fidelity_target: fidelityTarget })} disabled={loading}>{loading ? "计算中..." : "计算纠缠分发"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocol">
          <Card>
            <CardHeader><CardTitle>网络协议 (Quantum Network Protocol)</CardTitle><CardDescription>BB84/E91/Teleportation/Secret Sharing/Voting — 量子网络通信协议</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>协议类型</Label><Select value={protoType} onValueChange={setProtoType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PROTOCOL_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>密钥长度 (bits)</Label><Input type="number" value={keyLength} onChange={(e) => setKeyLength(e.target.value)} min={32} max={10000} /></div>
                <div className="space-y-2"><Label>安全参数</Label><Input type="text" value={secParam} onChange={(e) => setSecParam(e.target.value)} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-network-topology/quantum-protocol", { protocol_type: protoType, key_length_bits: keyLength, security_parameter: secParam })} disabled={loading}>{loading ? "计算中..." : "评估网络协议"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topology">
          <Card>
            <CardHeader><CardTitle>网络拓扑 (Network Topology)</CardTitle><CardDescription>Star/Mesh/Ring/Tree/Hybrid — 量子网络拓扑结构设计</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>拓扑类型</Label><Select value={topoType} onValueChange={setTopoType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TOPOLOGY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>节点数</Label><Input type="number" value={numNodes} onChange={(e) => setNumNodes(e.target.value)} min={2} max={10000} /></div>
                <div className="space-y-2"><Label>连通度</Label><Input type="number" value={connectivity} onChange={(e) => setConnectivity(e.target.value)} step={0.1} min={0.1} max={1.0} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-network-topology/network-topology", { topology_type: topoType, num_nodes: numNodes, connectivity: connectivity })} disabled={loading}>{loading ? "计算中..." : "分析网络拓扑"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory">
          <Card>
            <CardHeader><CardTitle>量子存储节点 (Quantum Memory Node)</CardTitle><CardDescription>Atomic/Spin/Photonic/Superconducting/NV — 量子存储器节点分析</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>存储类型</Label><Select value={memType} onValueChange={setMemType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{MEMORY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>相干时间 (ms)</Label><Input type="number" value={coherenceTime} onChange={(e) => setCoherenceTime(e.target.value)} step={1} min={0.01} max={100000} /></div>
                <div className="space-y-2"><Label>存储保真度</Label><Input type="number" value={storageFidelity} onChange={(e) => setStorageFidelity(e.target.value)} step={0.01} min={0.5} max={1.0} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-network-topology/quantum-memory-node", { node_type: memType, coherence_time_ms: coherenceTime, storage_fidelity: storageFidelity })} disabled={loading}>{loading ? "计算中..." : "分析量子存储"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="internet">
          <Card>
            <CardHeader><CardTitle>量子互联网层 (Quantum Internet Layer)</CardTitle><CardDescription>Physical/Link/Network/Transport/Application — 量子互联网协议栈</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>协议层</Label><Select value={inetType} onValueChange={setInetType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{INTERNET_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>带宽 (MHz)</Label><Input type="number" value={bandwidth} onChange={(e) => setBandwidth(e.target.value)} step={1} min={0.1} max={100000} /></div>
                <div className="space-y-2"><Label>覆盖范围 (km)</Label><Input type="number" value={coverage} onChange={(e) => setCoverage(e.target.value)} step={1} min={0.1} max={1000000} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-network-topology/quantum-internet", { layer_type: inetType, bandwidth_mhz: bandwidth, coverage_km: coverage })} disabled={loading}>{loading ? "计算中..." : "设计量子互联网"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
