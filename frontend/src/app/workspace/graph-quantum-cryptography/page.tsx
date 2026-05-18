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

const PQ_CRYPTO_TYPES = [
  { value: "lattice_based_kem", label: "Lattice KEM" },
  { value: "code_based_kem", label: "Code KEM" },
  { value: "hash_based_signature", label: "Hash Sig." },
  { value: "multivariate_crypto", label: "Multivariate" },
  { value: "isogeny_based", label: "Isogeny" },
  { value: "ai_post_quantum_crypto", label: "AI" },
];

const QKD_TYPES = [
  { value: "bb84_protocol", label: "BB84" },
  { value: "e91_protocol", label: "E91" },
  { value: "b92_protocol", label: "B92" },
  { value: "continuous_variable_qkd", label: "CV-QKD" },
  { value: "measurement_device_independent", label: "MDI-QKD" },
  { value: "ai_qkd_protocol", label: "AI" },
];

const QRNG_TYPES = [
  { value: "qrng_photon", label: "Photon" },
  { value: "qrng_vacuum", label: "Vacuum" },
  { value: "qrng_phase", label: "Phase" },
  { value: "qrng_entangled", label: "Entangled" },
  { value: "qrng_chip", label: "Chip" },
  { value: "ai_qrng_type", label: "AI" },
];

const SIGNATURE_TYPES = [
  { value: "Gottesman_Chuang", label: "Gottesman-Chuang" },
  { value: "lamport_quantum", label: "Lamport" },
  { value: "hash_lattice_signature", label: "Hash-Lattice" },
  { value: "quantum_one_time", label: "Quantum OTP" },
  { value: "quantum_blockchain_sig", label: "Blockchain" },
  { value: "ai_quantum_signature", label: "AI" },
];

const STEALTH_TYPES = [
  { value: "quantum_steganography", label: "Steganography" },
  { value: "quantum_covert_channel", label: "Covert Channel" },
  { value: "quantum_anonymity", label: "Anonymity" },
  { value: "quantum_oblivious_transfer", label: "Oblivious Transfer" },
  { value: "quantum_commitment", label: "Commitment" },
  { value: "ai_quantum_stealth", label: "AI" },
];

const CONSENSUS_TYPES = [
  { value: "quantum_byzantine", label: "Byzantine" },
  { value: "quantum_voting_protocol", label: "Voting" },
  { value: "quantum_auction", label: "Auction" },
  { value: "quantum_smart_contract", label: "Smart Contract" },
  { value: "quantum_ledger", label: "Ledger" },
  { value: "ai_quantum_consensus", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumCryptographyEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [pqType, setPqType] = useState("lattice_based_kem");
  const [pqSecurity, setPqSecurity] = useState("256");
  const [pqKeySize, setPqKeySize] = useState("1024");
  const [qkdType, setQkdType] = useState("bb84_protocol");
  const [qkdKeyLen, setQkdKeyLen] = useState("256");
  const [qkdDistance, setQkdDistance] = useState("100.0");
  const [qrngType, setQrngType] = useState("qrng_photon");
  const [qrngBits, setQrngBits] = useState("1024");
  const [qrngRate, setQrngRate] = useState("100.0");
  const [sigType, setSigType] = useState("Gottesman_Chuang");
  const [sigMsgSize, setSigMsgSize] = useState("256");
  const [sigSigners, setSigSigners] = useState("1");
  const [stealthType, setStealthType] = useState("quantum_steganography");
  const [stealthCapacity, setStealthCapacity] = useState("1024");
  const [stealthSecParam, setStealthSecParam] = useState("0.0000000001");
  const [consensusType, setConsensusType] = useState("quantum_byzantine");
  const [consensusParticipants, setConsensusParticipants] = useState("10");
  const [consensusByzFrac, setConsensusByzFrac] = useState("0.33");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-cryptography/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Cryptography Engine</h1>
          <p className="text-muted-foreground">Layer 88 — 后量子密码 / QKD / QRNG / 量子签名 / 量子隐匿 / 量子共识</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.336.0</Badge>
          <Badge variant="secondary">Layer 88</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="pqcrypto">后量子密码</TabsTrigger>
<TabsTrigger value="qkd">QKD</TabsTrigger>
<TabsTrigger value="qrng">QRNG</TabsTrigger>
<TabsTrigger value="signature">量子签名</TabsTrigger>
<TabsTrigger value="stealth">量子隐匿</TabsTrigger>
<TabsTrigger value="consensus">量子共识</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Cryptography Engine 概览</CardTitle><CardDescription>Layer 88 — 后量子密码 / QKD / QRNG / 量子签名 / 量子隐匿 / 量子共识 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="pqcrypto">
          <Card><CardHeader><CardTitle>后量子密码 (Post-Quantum Crypto)</CardTitle><CardDescription>Lattice/Code/Hash/Multivariate/Isogeny</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={pqType} onValueChange={setPqType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PQ_CRYPTO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>安全级别(bits)</Label><Input type="number" value={pqSecurity} onChange={(e) => setPqSecurity(e.target.value)} min={128} /></div>
<div className="space-y-2"><Label>密钥(bytes)</Label><Input type="number" value={pqKeySize} onChange={(e) => setPqKeySize(e.target.value)} min={32} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography/post-quantum-crypto", {crypto_type: pqType, security_level_bits: pqSecurity, key_size_bytes: pqKeySize})} disabled={loading}>{loading ? "计算中..." : "分析PQC"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="qkd">
          <Card><CardHeader><CardTitle>QKD (Quantum Key Distribution)</CardTitle><CardDescription>BB84/E91/B92/CV-QKD/MDI</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qkdType} onValueChange={setQkdType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QKD_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>密钥(bits)</Label><Input type="number" value={qkdKeyLen} onChange={(e) => setQkdKeyLen(e.target.value)} min={32} /></div>
<div className="space-y-2"><Label>距离(km)</Label><Input type="number" value={qkdDistance} onChange={(e) => setQkdDistance(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography/quantum-key-distribution", {qkd_type: qkdType, key_length_bits: qkdKeyLen, distance_km: qkdDistance})} disabled={loading}>{loading ? "计算中..." : "评估QKD"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="qrng">
          <Card><CardHeader><CardTitle>QRNG (Quantum Random Number)</CardTitle><CardDescription>Photon/Vacuum/Phase/Entangled/Chip</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qrngType} onValueChange={setQrngType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QRNG_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>比特数</Label><Input type="number" value={qrngBits} onChange={(e) => setQrngBits(e.target.value)} min={8} /></div>
<div className="space-y-2"><Label>速率(Mbps)</Label><Input type="number" value={qrngRate} onChange={(e) => setQrngRate(e.target.value)} step={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography/quantum-random", {qrng_type: qrngType, output_bits: qrngBits, generation_rate_mbps: qrngRate})} disabled={loading}>{loading ? "计算中..." : "分析QRNG"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="signature">
          <Card><CardHeader><CardTitle>量子签名 (Quantum Digital Signature)</CardTitle><CardDescription>GC/Lamport/Hash-Lattice/OTP/Blockchain</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={sigType} onValueChange={setSigType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SIGNATURE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>消息(bytes)</Label><Input type="number" value={sigMsgSize} onChange={(e) => setSigMsgSize(e.target.value)} min={1} /></div>
<div className="space-y-2"><Label>签名者</Label><Input type="number" value={sigSigners} onChange={(e) => setSigSigners(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography/quantum-signature", {signature_type: sigType, message_size_bytes: sigMsgSize, num_signers: sigSigners})} disabled={loading}>{loading ? "计算中..." : "设计签名"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="stealth">
          <Card><CardHeader><CardTitle>量子隐匿 (Quantum Stealth)</CardTitle><CardDescription>Steganography/Covert/Anonymity/OT</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={stealthType} onValueChange={setStealthType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STEALTH_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>容量(bits)</Label><Input type="number" value={stealthCapacity} onChange={(e) => setStealthCapacity(e.target.value)} min={8} /></div>
<div className="space-y-2"><Label>安全参数</Label><Input type="number" value={stealthSecParam} onChange={(e) => setStealthSecParam(e.target.value)} step={1e-10} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography/quantum-stealth", {stealth_type: stealthType, cover_capacity_bits: stealthCapacity, security_parameter: stealthSecParam})} disabled={loading}>{loading ? "计算中..." : "分析隐匿"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="consensus">
          <Card><CardHeader><CardTitle>量子共识 (Quantum Consensus)</CardTitle><CardDescription>Byzantine/Voting/Auction/Contract/Ledger</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={consensusType} onValueChange={setConsensusType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CONSENSUS_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>参与者</Label><Input type="number" value={consensusParticipants} onChange={(e) => setConsensusParticipants(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>拜占庭比例</Label><Input type="number" value={consensusByzFrac} onChange={(e) => setConsensusByzFrac(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-cryptography/quantum-consensus", {consensus_type: consensusType, num_participants: consensusParticipants, byzantine_fraction: consensusByzFrac})} disabled={loading}>{loading ? "计算中..." : "评估共识"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
