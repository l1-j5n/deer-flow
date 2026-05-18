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

const HAMILTONIAN_TYPES = [
  { value: "heisenberg_model", label: "Heisenberg 海森堡模型" },
  { value: "hubbard_model", label: "Hubbard 哈伯德模型" },
  { value: "ising_model", label: "Ising 伊辛模型" },
  { value: "t_j_model", label: "t-J Model t-J模型" },
  { value: "kitaev_model", label: "Kitaev 基塔耶夫模型" },
  { value: "ai_many_body_hamiltonian", label: "AI 多体哈密顿量" },
];
const PHASE_TYPES = [
  { value: "topological_phase", label: "Topological 拓扑相" },
  { value: "symmetry_broken", label: "Symmetry Broken 对称性破缺" },
  { value: "quantum_spin_liquid", label: "Spin Liquid 量子自旋液体" },
  { value: "fractional_quantum", label: "FQHE 分数量子霍尔" },
  { value: "superconducting_phase", label: "Superconducting 超导相" },
  { value: "ai_quantum_phase", label: "AI 量子相" },
];
const TENSOR_TYPES = [
  { value: "mps_tensor", label: "MPS 矩阵积态" },
  { value: "peps_tensor", label: "PEPS 投影纠缠对" },
  { value: "mera_tensor", label: "MERA 多尺度纠缠" },
  { value: "tree_tensor", label: "Tree TNS 树张量网络" },
  { value: "ttn_tensor", label: "TTN 树张量网络" },
  { value: "ai_tensor_network", label: "AI 张量网络" },
];
const CORRELATED_TYPES = [
  { value: "heavy_fermion", label: "Heavy Fermion 重费米子" },
  { value: "high_tc_superconductor", label: "High-Tc 高温超导" },
  { value: "mott_insulator", label: "Mott Insulator 莫特绝缘体" },
  { value: "quantum_hall", label: "Quantum Hall 量子霍尔" },
  { value: "weyl_semimetal", label: "Weyl 外尔半金属" },
  { value: "ai_strongly_correlated", label: "AI 强关联系统" },
];
const TRANSITION_TYPES = [
  { value: "second_order_qpt", label: "2nd Order 二阶量子相变" },
  { value: "first_order_qpt", label: "1st Order 一阶量子相变" },
  { value: "kt_transition", label: "KT Kosterlitz-Thouless" },
  { value: "topological_transition", label: "Topological 拓扑相变" },
  { value: "deconfined_qcp", label: "Deconfined QCP 退禁闭临界点" },
  { value: "ai_phase_transition", label: "AI 相变分析" },
];
const ENTANGLEMENT_TYPES = [
  { value: "von_neumann_entropy", label: "von Neumann 冯诺依曼熵" },
  { value: "renyi_entropy", label: "Rényi 莱尼熵" },
  { value: "entanglement_spectrum", label: "Spectrum 纠缠谱" },
  { value: "mutual_information", label: "Mutual Info 互信息" },
  { value: "negativity", label: "Negativity 负性度量" },
  { value: "ai_entanglement_measure", label: "AI 纠缠度量" },
];

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function QuantumManyBodyPhysicsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  const [hamType, setHamType] = useState("heisenberg_model");
  const [latticeSites, setLatticeSites] = useState("20");
  const [coupling, setCoupling] = useState("1.0");
  const [phaseType, setPhaseType] = useState("topological_phase");
  const [temperature, setTemperature] = useState("0.01");
  const [extField, setExtField] = useState("0.0");
  const [tensorType, setTensorType] = useState("mps_tensor");
  const [bondDim, setBondDim] = useState("64");
  const [sysSize, setSysSize] = useState("100");
  const [corrType, setCorrType] = useState("high_tc_superconductor");
  const [interaction, setInteraction] = useState("1.0");
  const [filling, setFilling] = useState("0.5");
  const [transType, setTransType] = useState("second_order_qpt");
  const [critParam, setCritParam] = useState("1.0");
  const [transSysSize, setTransSysSize] = useState("50");
  const [entType, setEntType] = useState("von_neumann_entropy");
  const [subSize, setSubSize] = useState("10");
  const [totalSize, setTotalSize] = useState("20");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/graph/quantum-many-body-physics/overview`);
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Many-Body Physics Engine</h1>
          <p className="text-muted-foreground">
            Layer 84 — 多体哈密顿量 / 量子相 / 张量网络 / 强关联系统 / 量子相变 / 纠缠谱
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.332.0</Badge>
          <Badge variant="secondary">Layer 84</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hamiltonian">哈密顿量</TabsTrigger>
          <TabsTrigger value="phase">量子相</TabsTrigger>
          <TabsTrigger value="tensor">张量网络</TabsTrigger>
          <TabsTrigger value="correlated">强关联</TabsTrigger>
          <TabsTrigger value="transition">量子相变</TabsTrigger>
          <TabsTrigger value="entanglement">纠缠谱</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Quantum Many-Body Physics Engine 概览</CardTitle><CardDescription>量子多体物理引擎 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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

        <TabsContent value="hamiltonian">
          <Card>
            <CardHeader><CardTitle>多体哈密顿量 (Many-Body Hamiltonian)</CardTitle><CardDescription>Heisenberg/Hubbard/Ising/t-J/Kitaev — 量子多体系统哈密顿量</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>哈密顿量类型</Label><Select value={hamType} onValueChange={setHamType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{HAMILTONIAN_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>格点数 N</Label><Input type="number" value={latticeSites} onChange={(e) => setLatticeSites(e.target.value)} min={2} max={10000} /></div>
                <div className="space-y-2"><Label>耦合强度 J</Label><Input type="number" value={coupling} onChange={(e) => setCoupling(e.target.value)} step={0.1} min={0.01} max={100} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-many-body-physics/many-body-hamiltonian", { hamiltonian_type: hamType, lattice_sites: latticeSites, coupling_strength: coupling })} disabled={loading}>{loading ? "计算中..." : "计算哈密顿量"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phase">
          <Card>
            <CardHeader><CardTitle>量子相 (Quantum Phase)</CardTitle><CardDescription>Topological/Symmetry Broken/Spin Liquid/FQHE/Superconducting — 量子物态分析</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>量子相类型</Label><Select value={phaseType} onValueChange={setPhaseType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PHASE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>温度 (K)</Label><Input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} step={0.001} min={0.001} max={1000} /></div>
                <div className="space-y-2"><Label>外磁场 (T)</Label><Input type="number" value={extField} onChange={(e) => setExtField(e.target.value)} step={0.1} min={0} max={100} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-many-body-physics/quantum-phase", { phase_type: phaseType, temperature_k: temperature, external_field_t: extField })} disabled={loading}>{loading ? "计算中..." : "分析量子相"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tensor">
          <Card>
            <CardHeader><CardTitle>张量网络 (Tensor Network)</CardTitle><CardDescription>MPS/PEPS/MERA/Tree/TTN — 张量网络态压缩与优化</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>张量网络类型</Label><Select value={tensorType} onValueChange={setTensorType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TENSOR_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>键维数 χ</Label><Input type="number" value={bondDim} onChange={(e) => setBondDim(e.target.value)} min={2} max={4096} /></div>
                <div className="space-y-2"><Label>系统尺寸 N</Label><Input type="number" value={sysSize} onChange={(e) => setSysSize(e.target.value)} min={4} max={1000000} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-many-body-physics/tensor-network", { network_type: tensorType, bond_dimension: bondDim, system_size: sysSize })} disabled={loading}>{loading ? "计算中..." : "优化张量网络"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlated">
          <Card>
            <CardHeader><CardTitle>强关联系统 (Strongly Correlated)</CardTitle><CardDescription>Heavy Fermion/High-Tc/Mott/QH/Weyl — 强关联电子系统</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>系统类型</Label><Select value={corrType} onValueChange={setCorrType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CORRELATED_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>相互作用强度 U</Label><Input type="number" value={interaction} onChange={(e) => setInteraction(e.target.value)} step={0.1} min={0.01} max={100} /></div>
                <div className="space-y-2"><Label>填充因子 n</Label><Input type="number" value={filling} onChange={(e) => setFilling(e.target.value)} step={0.01} min={0} max={1} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-many-body-physics/strongly-correlated", { system_type: corrType, interaction_strength: interaction, filling_factor: filling })} disabled={loading}>{loading ? "计算中..." : "研究强关联系统"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transition">
          <Card>
            <CardHeader><CardTitle>量子相变 (Quantum Phase Transition)</CardTitle><CardDescription>1st/2nd Order/KT/Topological/Deconfined — 量子临界现象分析</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>相变类型</Label><Select value={transType} onValueChange={setTransType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TRANSITION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>临界参数 g_c</Label><Input type="number" value={critParam} onChange={(e) => setCritParam(e.target.value)} step={0.01} min={0.01} max={100} /></div>
                <div className="space-y-2"><Label>系统尺寸 N</Label><Input type="number" value={transSysSize} onChange={(e) => setTransSysSize(e.target.value)} min={4} max={10000} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-many-body-physics/phase-transition", { transition_type: transType, critical_parameter: critParam, system_size: transSysSize })} disabled={loading}>{loading ? "计算中..." : "分析量子相变"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entanglement">
          <Card>
            <CardHeader><CardTitle>纠缠谱 (Entanglement Spectrum)</CardTitle><CardDescription>von Neumann/Rényi/Spectrum/Mutual Info/Negativity — 多体纠缠分析</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>纠缠度量</Label><Select value={entType} onValueChange={setEntType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ENTANGLEMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>子系统尺寸 l_A</Label><Input type="number" value={subSize} onChange={(e) => setSubSize(e.target.value)} min={1} max={1000} /></div>
                <div className="space-y-2"><Label>总系统尺寸 L</Label><Input type="number" value={totalSize} onChange={(e) => setTotalSize(e.target.value)} min={2} max={10000} /></div>
              </div>
              <Button onClick={() => postEndpoint("/graph/quantum-many-body-physics/entanglement-spectrum", { spectrum_type: entType, subsystem_size: subSize, total_system_size: totalSize })} disabled={loading}>{loading ? "计算中..." : "计算纠缠谱"}</Button>
              {result && <JsonBlock data={result} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
