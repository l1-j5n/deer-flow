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

const PRICING_TYPES = [
  { value: "european_option", label: "European" },
  { value: "asian_option", label: "Asian" },
  { value: "american_option", label: "American" },
  { value: "barrier_option", label: "Barrier" },
  { value: "exotic_derivative", label: "Exotic" },
  { value: "ai_quantum_pricing", label: "AI" },
];

const RISK_TYPES = [
  { value: "var_quantum", label: "VaR" },
  { value: "cvar_quantum", label: "CVaR" },
  { value: "stress_testing", label: "Stress" },
  { value: "credit_risk_model", label: "Credit" },
  { value: "operational_risk", label: "Operational" },
  { value: "ai_quantum_risk", label: "AI" },
];

const PORTFOLIO_TYPES = [
  { value: "mean_variance", label: "Mean-Variance" },
  { value: "black_litterman", label: "Black-Litterman" },
  { value: "risk_parity", label: "Risk Parity" },
  { value: "factor_investing", label: "Factor" },
  { value: "esg_portfolio", label: "ESG" },
  { value: "ai_quantum_portfolio", label: "AI" },
];

const QMC_TYPES = [
  { value: "qmc_integration", label: "QMC Integration" },
  { value: "qmc_simulation", label: "QMC Simulation" },
  { value: "amplitude_estimation", label: "Amplitude Est." },
  { value: "quantum_rejection", label: "Quantum Rejection" },
  { value: "quantum_sampling", label: "Quantum Sampling" },
  { value: "ai_quantum_monte_carlo", label: "AI" },
];

const OPT_FINANCE_TYPES = [
  { value: "portfolio_rebalance", label: "Rebalance" },
  { value: "trade_execution", label: "Trade Execution" },
  { value: "settlement_optimization", label: "Settlement" },
  { value: "collateral_management", label: "Collateral" },
  { value: "capital_allocation", label: "Capital" },
  { value: "ai_quantum_opt_finance", label: "AI" },
];

const ARBITRAGE_TYPES = [
  { value: "statistical_arb", label: "Statistical" },
  { value: "cross_market_arb", label: "Cross-Market" },
  { value: "triangular_arb", label: "Triangular" },
  { value: "latency_arb", label: "Latency" },
  { value: "regulatory_arb", label: "Regulatory" },
  { value: "ai_quantum_arbitrage", label: "AI" },
];


function JsonBlock({ data }: { data: unknown }) {
  return (<pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-80 mt-3">{JSON.stringify(data, null, 2)}</pre>);
}

export default function QuantumFinanceEnginePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [pricingType, setPricingType] = useState("european_option");
  const [pricingSpot, setPricingSpot] = useState("100.0");
  const [pricingVol, setPricingVol] = useState("0.2");
  const [riskType, setRiskType] = useState("var_quantum");
  const [riskConf, setRiskConf] = useState("0.99");
  const [riskHorizon, setRiskHorizon] = useState("10");
  const [portfolioType, setPortfolioType] = useState("mean_variance");
  const [portfolioAssets, setPortfolioAssets] = useState("50");
  const [portfolioRf, setPortfolioRf] = useState("0.05");
  const [qmcType, setQmcType] = useState("qmc_integration");
  const [qmcPaths, setQmcPaths] = useState("100000");
  const [qmcSteps, setQmcSteps] = useState("252");
  const [optfinType, setOptfinType] = useState("portfolio_rebalance");
  const [optfinSize, setOptfinSize] = useState("100");
  const [optfinConstraints, setOptfinConstraints] = useState("20");
  const [arbType, setArbType] = useState("statistical_arb");
  const [arbInstruments, setArbInstruments] = useState("10");
  const [arbThreshold, setArbThreshold] = useState("0.001");

  async function fetchOverview() {
    setLoading(true);
    try { const res = await fetch(`${API_BASE}/graph/quantum-finance/overview`); const data = await res.json(); setOverview(data); setResult(data); }
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
          <h1 className="text-3xl font-bold tracking-tight">Quantum Finance Engine</h1>
          <p className="text-muted-foreground">Layer 87 — 定价 / 风险 / 组合 / QMC / 金融优化 / 套利</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v1.335.0</Badge>
          <Badge variant="secondary">Layer 87</Badge>
          <Badge variant="default">6⁶ = 46656</Badge>
        </div>
      </div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
<TabsTrigger value="pricing">定价</TabsTrigger>
<TabsTrigger value="risk">风险</TabsTrigger>
<TabsTrigger value="portfolio">组合</TabsTrigger>
<TabsTrigger value="qmc">QMC</TabsTrigger>
<TabsTrigger value="optfinance">金融优化</TabsTrigger>
<TabsTrigger value="arbitrage">套利</TabsTrigger>

        </TabsList>
        
        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Quantum Finance Engine 概览</CardTitle><CardDescription>Layer 87 — 定价 / 风险 / 组合 / QMC / 金融优化 / 套利 — 6枚举 × 6值 = 36值, 7 API端点</CardDescription></CardHeader>
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
        
        <TabsContent value="pricing">
          <Card><CardHeader><CardTitle>定价 (Quantum Pricing)</CardTitle><CardDescription>European/Asian/American/Barrier</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={pricingType} onValueChange={setPricingType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRICING_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>标的价格</Label><Input type="number" value={pricingSpot} onChange={(e) => setPricingSpot(e.target.value)} step={1} /></div>
<div className="space-y-2"><Label>波动率</Label><Input type="number" value={pricingVol} onChange={(e) => setPricingVol(e.target.value)} step={0.01} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-finance/quantum-pricing", {pricing_type: pricingType, spot_price: pricingSpot, volatility: pricingVol})} disabled={loading}>{loading ? "计算中..." : "定价"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="risk">
          <Card><CardHeader><CardTitle>风险 (Quantum Risk)</CardTitle><CardDescription>VaR/CVaR/Stress/Credit</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={riskType} onValueChange={setRiskType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RISK_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>置信水平</Label><Input type="number" value={riskConf} onChange={(e) => setRiskConf(e.target.value)} step={0.01} /></div>
<div className="space-y-2"><Label>天数</Label><Input type="number" value={riskHorizon} onChange={(e) => setRiskHorizon(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-finance/quantum-risk", {risk_type: riskType, confidence_level: riskConf, time_horizon_days: riskHorizon})} disabled={loading}>{loading ? "计算中..." : "风险分析"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="portfolio">
          <Card><CardHeader><CardTitle>组合 (Quantum Portfolio)</CardTitle><CardDescription>Mean-Var/BL/Risk Parity/Factor/ESG</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={portfolioType} onValueChange={setPortfolioType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PORTFOLIO_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>资产数</Label><Input type="number" value={portfolioAssets} onChange={(e) => setPortfolioAssets(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>无风险利率</Label><Input type="number" value={portfolioRf} onChange={(e) => setPortfolioRf(e.target.value)} step={0.001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-finance/quantum-portfolio", {portfolio_type: portfolioType, num_assets: portfolioAssets, risk_free_rate: portfolioRf})} disabled={loading}>{loading ? "计算中..." : "优化组合"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="qmc">
          <Card><CardHeader><CardTitle>QMC (Quantum Monte Carlo)</CardTitle><CardDescription>Integration/Simulation/Amplitude</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={qmcType} onValueChange={setQmcType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{QMC_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>路径数</Label><Input type="number" value={qmcPaths} onChange={(e) => setQmcPaths(e.target.value)} min={100} /></div>
<div className="space-y-2"><Label>时间步</Label><Input type="number" value={qmcSteps} onChange={(e) => setQmcSteps(e.target.value)} min={1} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-finance/quantum-monte-carlo", {qmc_type: qmcType, num_paths: qmcPaths, num_time_steps: qmcSteps})} disabled={loading}>{loading ? "计算中..." : "运行QMC"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="optfinance">
          <Card><CardHeader><CardTitle>金融优化 (Financial Optimization)</CardTitle><CardDescription>Rebalance/Execution/Settlement</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={optfinType} onValueChange={setOptfinType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{OPT_FINANCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>规模</Label><Input type="number" value={optfinSize} onChange={(e) => setOptfinSize(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>约束数</Label><Input type="number" value={optfinConstraints} onChange={(e) => setOptfinConstraints(e.target.value)} min={0} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-finance/quantum-opt-finance", {optimization_type: optfinType, problem_size: optfinSize, constraints: optfinConstraints})} disabled={loading}>{loading ? "计算中..." : "优化"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="arbitrage">
          <Card><CardHeader><CardTitle>套利 (Quantum Arbitrage)</CardTitle><CardDescription>Statistical/Cross/Triangular/Latency</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="space-y-2"><Label>类型</Label><Select value={arbType} onValueChange={setArbType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ARBITRAGE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
<div className="space-y-2"><Label>工具数</Label><Input type="number" value={arbInstruments} onChange={(e) => setArbInstruments(e.target.value)} min={2} /></div>
<div className="space-y-2"><Label>阈值</Label><Input type="number" value={arbThreshold} onChange={(e) => setArbThreshold(e.target.value)} step={0.0001} /></div>
</div>
            <Button onClick={() => postEndpoint("/graph/quantum-finance/quantum-arbitrage", {arbitrage_type: arbType, num_instruments: arbInstruments, detection_threshold: arbThreshold})} disabled={loading}>{loading ? "计算中..." : "检测套利"}</Button>
            {result && <JsonBlock data={result} />}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
