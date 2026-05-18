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

const PQC_TYPES = [
  { value: "lattice_kyber", label: "Kyber" },
  { value: "code_bike", label: "BIKE" },
  { value: "merkle_sphincs", label: "SPHINCS+" },
  { value: "isogeny_sidh", label: "SIDH" },
  { value: "multivariate_rainbow", label: "Rainbow" },
  { value: "ai_pqc_selector", label: "AI" },
];

const QRNG_TYPES = [
  { value: "vacuum_qrng", label: "Vacuum" },
  { value: "phase_qrng", label: "Phase" },
  { value: "time_bin_qrng", label: "Time-Bin" },
  { value: "laser_chaos_qrng", label: "Laser Chaos" },
  { value: "entanglement_qrng", label: "Entanglement" },
  { value: "ai_qrng_source", label: "AI" },
];

const SIG_TYPES = [
  { value: "gottesman_chuang", label: "Gottesman-Chuang" },
  { value: "lamport_quantum", label: "Lamport" },
  { value: "hash_quantum_sig", label: "Hash" },
  { value: "trapdoor_quantum", label: "Trapdoor" },
  { value: "blind_quantum_sig", label: "Blind" },
  { value: "ai_quantum_sig", label: "AI" },
];

const PROTO_TYPES = [
  { value: "quantum_tls", label: "Q-TLS" },
  { value: "quantum_vpn", label: "Q-VPN" },
  { value: "quantum_zkp", label: "Q-ZKP" },
  { value: "quantum_secret_share", label: "Secret Share" },
  { value: "quantum_oblivious", label: "Oblivious" },
  { value: "ai_protocol_design", label: "AI" },
];

const FW_TYPES = [
  { value: "intercept_detect", label: "Intercept" },
  { value: "coherence_monitor", label: "Coherence" },
  { value: "clone_detection", label: "Clone" },
  { value: "entanglement_verify", label: "Entanglement" },
  { value: "channel_integrity", label: "Channel" },
  { value: "ai_threat_detect", label: "AI" },
];

const AUDIT_TYPES = [
  { value: "key_lifecycle_audit", label: "Key Lifecycle" },
  { value: "protocol_compliance", label: "Compliance" },
  { value: "vulnerability_scan", label: "Vuln Scan" },
  { value: "penetration_quantum", label: "Penetration" },
  { value: "compliance_nist", label: "NIST" },
  { value: "ai_audit_engine", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumCryptographySecurityEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [pqcType, setPqcType] = useState("lattice_kyber");
  const [pqcLevel, setPqcLevel] = useState("128");
  const [pqcKeySize, setPqcKeySize] = useState("1024");
  const [qrngType, setQrngType] = useState("vacuum_qrng");
  const [qrngRate, setQrngRate] = useState("100.0");
  const [qrngEntropy, setQrngEntropy] = useState("0.999");
  const [sigType, setSigType] = useState("gottesman_chuang");
  const [sigMsgSize, setSigMsgSize] = useState("10");
  const [sigSigs, setSigSigs] = useState("1000");
  const [protoType, setProtoType] = useState("quantum_tls");
  const [protoParties, setProtoParties] = useState("2");
  const [protoParam, setProtoParam] = useState("256");
  const [fwType, setFwType] = useState("intercept_detect");
  const [fwRate, setFwRate] = useState("10.0");
  const [fwSensitivity, setFwSensitivity] = useState("0.99");
  const [auditType, setAuditType] = useState("key_lifecycle_audit");
  const [auditSize, setAuditSize] = useState("100");
  const [auditDepth, setAuditDepth] = useState("3");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-cryptography-security/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Cryptography Security Engine</h1>
          <p className="text-muted-foreground">Layer 106 — 后量子密码 / 量子随机数 / 量子签名 / 安全协议 / 量子防火墙 / 安全审计</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.354.0</Badge>
          <Badge variant="secondary">Layer 106</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="pqc">后量子密码</TabsTrigger>
<TabsTrigger value="qrng">量子随机数</TabsTrigger>
<TabsTrigger value="sig">量子签名</TabsTrigger>
<TabsTrigger value="proto">安全协议</TabsTrigger>
<TabsTrigger value="fw">量子防火墙</TabsTrigger>
<TabsTrigger value="audit">安全审计</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Cryptography Security Engine 概览</CardTitle><CardDescription>Layer 106 — 后量子密码 / 量子随机数 / 量子签名 / 安全协议 / 量子防火墙 / 安全审计 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="pqc">
          <Card><CardHeader><CardTitle>后量子密码 (Post-Quantum Crypto)</CardTitle><CardDescription>Kyber/BIKE/SPHINCS+/SIDH/Rainbow</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={pqcType} onValueChange={setPqcType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PQC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>安全级别(bits)</Label><Input type="number" value={pqcLevel} onChange={(e) => setPqcLevel(e.target.value)} min={64} /></div>
<div className="space-y-2"><Label>密钥大小(B)</Label><Input type="number" value={pqcKeySize} onChange={(e) => setPqcKeySize(e.target.value)} min={100} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography-security/post-quantum-crypto", {scheme: pqcType, security_level: pqcLevel, key_size_bytes: pqcKeySize})} disabled={loading}>{loading ? "计算中..." : "PQC分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="qrng">
          <Card><CardHeader><CardTitle>量子随机数 (Quantum RNG)</CardTitle><CardDescription>Vacuum/Phase/TimeBin/LaserChaos/Entanglement</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qrngType} onValueChange={setQrngType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QRNG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>速率(Mbps)</Label><Input type="number" value={qrngRate} onChange={(e) => setQrngRate(e.target.value)} step={10} /></div>
<div className="space-y-2"><Label>熵质量</Label><Input type="number" value={qrngEntropy} onChange={(e) => setQrngEntropy(e.target.value)} step={0.001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography-security/quantum-random", {source_type: qrngType, bit_rate_mbps: qrngRate, entropy_quality: qrngEntropy})} disabled={loading}>{loading ? "计算中..." : "QRNG分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="sig">
          <Card><CardHeader><CardTitle>量子签名 (Quantum Signature)</CardTitle><CardDescription>Gottesman-Chuang/Lamport/Hash/Trapdoor/Blind</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={sigType} onValueChange={setSigType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SIG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>消息大小(KB)</Label><Input type="number" value={sigMsgSize} onChange={(e) => setSigMsgSize(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>签名数</Label><Input type="number" value={sigSigs} onChange={(e) => setSigSigs(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography-security/quantum-signature", {sig_type: sigType, message_size_kb: sigMsgSize, num_signatures: sigSigs})} disabled={loading}>{loading ? "计算中..." : "签名分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="proto">
          <Card><CardHeader><CardTitle>安全协议 (Security Protocol)</CardTitle><CardDescription>TLS/VPN/ZKP/SecretShare/Oblivious</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={protoType} onValueChange={setProtoType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PROTO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>参与方数</Label><Input type="number" value={protoParties} onChange={(e) => setProtoParties(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>安全参数</Label><Input type="number" value={protoParam} onChange={(e) => setProtoParam(e.target.value)} min={128} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography-security/quantum-protocol", {protocol_type: protoType, num_parties: protoParties, security_param: protoParam})} disabled={loading}>{loading ? "计算中..." : "协议分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="fw">
          <Card><CardHeader><CardTitle>量子防火墙 (Quantum Firewall)</CardTitle><CardDescription>Intercept/Coherence/Clone/Entanglement/Channel</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={fwType} onValueChange={setFwType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FW_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>信道速率(Mbps)</Label><Input type="number" value={fwRate} onChange={(e) => setFwRate(e.target.value)} step={1} /></div>
<div className="space-y-2"><Label>灵敏度</Label><Input type="number" value={fwSensitivity} onChange={(e) => setFwSensitivity(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography-security/quantum-firewall", {firewall_type: fwType, channel_rate_mbps: fwRate, sensitivity: fwSensitivity})} disabled={loading}>{loading ? "计算中..." : "防火墙分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="audit">
          <Card><CardHeader><CardTitle>安全审计 (Security Audit)</CardTitle><CardDescription>KeyLifecycle/Compliance/VulnScan/Penetration/NIST</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={auditType} onValueChange={setAuditType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AUDIT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>系统规模</Label><Input type="number" value={auditSize} onChange={(e) => setAuditSize(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>审计深度</Label><Input type="number" value={auditDepth} onChange={(e) => setAuditDepth(e.target.value)} min={1} max={5} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography-security/quantum-audit", {audit_type: auditType, system_size: auditSize, audit_depth: auditDepth})} disabled={loading}>{loading ? "计算中..." : "审计分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
