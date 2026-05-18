"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Zap, Shield, Copy, ArrowRightRight, Wrench, Dna } from "lucide-react";

const API_BASE = "";

export default function GraphAutopoiesisPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Generate state - 生成自创生系统
  const [systemSpec, setSystemSpec] = useState("adaptive_reasoning_network");
  const [autopoieticProcess, setAutopoieticProcess] = useState("self_organization");
  const [organizationalClosure, setOrganizationalClosure] = useState("structural");
  const [initialComplexity, setInitialComplexity] = useState(0.5);
  const [seedComponents, setSeedComponents] = useState("causal_node_a,causal_node_b,causal_node_c");

  // Maintain state - 维持稳态
  const [systemId, setSystemId] = useState("auto_sys_001");
  const [homeostaticRegulation, setHomeostaticRegulation] = useState("negative_feedback");
  const [targetStability, setTargetStability] = useState(0.8);
  const [perturbationTolerance, setPerturbationTolerance] = useState(0.3);
  const [monitoringFrequency, setMonitoringFrequency] = useState(0.5);

  // Reproduce state - 繁殖因果模式
  const [sourcePattern, setSourcePattern] = useState("successful_reasoning_pattern_v1");
  const [reproductionMode, setReproductionMode] = useState("modular");
  const [mutationRate, setMutationRate] = useState(0.1);
  const [fidelityThreshold, setFidelityThreshold] = useState(0.85);
  const [offspringCount, setOffspringCount] = useState(3);

  // Adapt state - 适应环境
  const [envConditions, setEnvConditions] = useState("high_noise,limited_data,dynamic_topology");
  const [boundaryFormation, setBoundaryFormation] = useState("topology");
  const [adaptationPressure, setAdaptationPressure] = useState(0.5);
  const [structuralPlasticity, setStructuralPlasticity] = useState(0.6);

  // Repair state - 修复组件
  const [damagedComponents, setDamagedComponents] = useState("comp_inference_chain,comp_validation_loop,comp_aggregation");
  const [repairStrategy, setRepairStrategy] = useState("regeneration");
  const [regenerationDepth, setRegenerationDepth] = useState(3);
  const [fallbackEnabled, setFallbackEnabled] = useState(true);

  // Evolve state - 演化系统
  const [evolutionaryDrift, setEvolutionaryDrift] = useState("directed");
  const [generations, setGenerations] = useState(10);
  const [selectionPressure, setSelectionPressure] = useState(0.7);
  const [diversityMaintenance, setDiversityMaintenance] = useState(0.4);

  // API Calls
  const callAPI = async (endpoint: string, body: any) => {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`${API_BASE}/graph${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setResults({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const loadOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/graph/causal-autopoiesis/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      setOverview({ error: String(err) });
    }
  };

  React.useEffect(() => {
    loadOverview();
  }, []);

  const renderResults = () => {
    if (!results) return null;
    if (results.error) {
      return (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <p className="text-destructive text-sm">错误: {results.error}</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {results.cached && <Badge variant="secondary">缓存</Badge>}
            执行结果
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[500px] whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">因果自创生引擎 (v1.286.0)</h1>
        <p className="text-muted-foreground">
          Layer 38: 自创建、自维持、自繁殖、自修复的因果推理自生成系统
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="generate">生成</TabsTrigger>
          <TabsTrigger value="maintain">维持</TabsTrigger>
          <TabsTrigger value="reproduce">繁殖</TabsTrigger>
          <TabsTrigger value="adapt">适应</TabsTrigger>
          <TabsTrigger value="repair">修复</TabsTrigger>
          <TabsTrigger value="evolve">演化</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                系统概览
              </CardTitle>
              <CardDescription>Causal Autopoiesis Engine 架构信息</CardDescription>
            </CardHeader>
            <CardContent>
              {overview ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>版本</Label>
                      <p className="font-mono text-sm">{overview.version}</p>
                    </div>
                    <div>
                      <Label>层级</Label>
                      <p className="font-mono text-sm">Layer {overview.layer}</p>
                    </div>
                    <div>
                      <Label>名称</Label>
                      <p className="font-mono text-sm">{overview.name}</p>
                    </div>
                    <div>
                      <Label>上层依赖</Label>
                      <p className="font-mono text-sm text-muted-foreground">{overview.sits_above}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">配置空间</Label>
                    <Badge variant="secondary">{overview.configuration_space}</Badge>
                  </div>
                  <div>
                    <Label className="mb-2 block">处理流水线</Label>
                    <p className="font-mono text-sm bg-muted p-2 rounded">{overview.pipeline}</p>
                  </div>
                  <div>
                    <Label className="mb-2 block">缓存状态</Label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {overview.cache_sizes && Object.entries(overview.cache_sizes).map(([key, val]) => (
                        <div key={key} className="bg-muted p-2 rounded">
                          <span className="font-semibold">{key}:</span> {String(val)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">架构位置</Label>
                    <div className="space-y-1 text-sm">
                      <p className="font-semibold">当前层级: Layer {overview.architecture_position?.current_layer}</p>
                      <p className="text-muted-foreground">下层依赖:</p>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        {overview.architecture_position?.below_this_layer?.map((layer: string, i: number) => (
                          <li key={i} className="text-muted-foreground">{layer}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">枚举定义</Label>
                    <div className="space-y-2">
                      {overview.enums && Object.entries(overview.enums).map(([enumName, values]) => (
                        <div key={enumName} className="text-xs">
                          <span className="font-semibold">{enumName}:</span>
                          <span className="text-muted-foreground"> {Array.isArray(values) ? values.join(", ") : JSON.stringify(values)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">API 端点</Label>
                    <div className="space-y-1">
                      {overview.endpoints && Object.entries(overview.endpoints).map(([key, desc]) => (
                        <div key={key} className="text-xs font-mono bg-muted p-2 rounded">
                          {typeof desc === "string" ? desc : JSON.stringify(desc)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">加载中...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                生成自创生系统
              </CardTitle>
              <CardDescription>从零创建新的因果自创生结构</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>系统规格描述</Label>
                  <Input
                    value={systemSpec}
                    onChange={(e) => setSystemSpec(e.target.value)}
                    placeholder="描述要生成的自创生系统..."
                  />
                </div>
                <div>
                  <Label>自创生过程</Label>
                  <Select value={autopoieticProcess} onValueChange={setAutopoieticProcess}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self_creation">自创建</SelectItem>
                      <SelectItem value="self_maintenance">自维持</SelectItem>
                      <SelectItem value="self_reproduction">自繁殖</SelectItem>
                      <SelectItem value="self_regeneration">自再生</SelectItem>
                      <SelectItem value="self_organization">自组织</SelectItem>
                      <SelectItem value="ai_meta">AI元自创生</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>组织闭合类型</Label>
                  <Select value={organizationalClosure} onValueChange={setOrganizationalClosure}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">操作闭合</SelectItem>
                      <SelectItem value="structural">结构耦合</SelectItem>
                      <SelectItem value="dissipative">耗散结构</SelectItem>
                      <SelectItem value="catalytic">催化闭合</SelectItem>
                      <SelectItem value="thermodynamic">热力学平衡</SelectItem>
                      <SelectItem value="ai_adaptive">AI自适应闭合</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>初始复杂度 (0-1)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={initialComplexity}
                    onChange={(e) => setInitialComplexity(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label>种子组件（逗号分隔）</Label>
                  <Input
                    value={seedComponents}
                    onChange={(e) => setSeedComponents(e.target.value)}
                    placeholder="comp_a,comp_b,comp_c"
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-autopoiesis/generate", {
                    system_specification: systemSpec,
                    autopoietic_process: autopoieticProcess,
                    organizational_closure: organizationalClosure,
                    initial_complexity: initialComplexity,
                    seed_components: seedComponents.split(",").map(s => s.trim()).filter(Boolean),
                  })
                }
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                生成自创生系统
              </Button>
            </CardContent>
          </Card>
          {renderResults()}
        </TabsContent>

        {/* Maintain Tab */}
        <TabsContent value="maintain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                维持稳态
              </CardTitle>
              <CardDescription>维持自创生系统的稳态平衡</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>系统 ID</Label>
                  <Input
                    value={systemId}
                    onChange={(e) => setSystemId(e.target.value)}
                    placeholder="auto_sys_001"
                  />
                </div>
                <div>
                  <Label>稳态调控机制</Label>
                  <Select value={homeostaticRegulation} onValueChange={setHomeostaticRegulation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="negative_feedback">负反馈</SelectItem>
                      <SelectItem value="positive_feedback">正反馈</SelectItem>
                      <SelectItem value="feedforward">前馈控制</SelectItem>
                      <SelectItem value="cascading">级联调控</SelectItem>
                      <SelectItem value="oscillatory">振荡阻尼</SelectItem>
                      <SelectItem value="ai_predictive">AI预测性稳态</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>目标稳定性 (0-1)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={targetStability}
                    onChange={(e) => setTargetStability(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label>扰动容忍度 (0-1)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={perturbationTolerance}
                    onChange={(e) => setPerturbationTolerance(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label>监控频率 (0-1)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={monitoringFrequency}
                    onChange={(e) => setMonitoringFrequency(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-autopoiesis/maintain", {
                    system_id: systemId,
                    homeostatic_regulation: homeostaticRegulation,
                    target_stability: targetStability,
                    perturbation_tolerance: perturbationTolerance,
                    monitoring_frequency: monitoringFrequency,
                  })
                }
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                执行稳态维持
              </Button>
            </CardContent>
          </Card>
          {renderResults()}
        </TabsContent>

        {/* Reproduce Tab */}
        <TabsContent value="reproduce" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="w-5 h-5" />
                繁殖因果模式
              </CardTitle>
              <CardDescription>复制成功的推理模式并引入变异</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>源模式名称</Label>
                  <Input
                    value={sourcePattern}
                    onChange={(e) => setSourcePattern(e.target.value)}
                    placeholder="successful_reasoning_pattern_v1"
                  />
                </div>
                <div>
                  <Label>繁殖模式</Label>
                  <Select value={reproductionMode} onValueChange={setReproductionMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="synthesis">组件合成</SelectItem>
                      <SelectItem value="regeneration">网络再生</SelectItem>
                      <SelectItem value="recursive">递归生产</SelectItem>
                      <SelectItem value="template">模板复制</SelectItem>
                      <SelectItem value="modular">模块组装</SelectItem>
                      <SelectItem value="ai_generative">AI生成式生产</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>变异率 (0-1)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={mutationRate}
                    onChange={(e) => setMutationRate(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label>保真阈值 (0-1)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={fidelityThreshold}
                    onChange={(e) => setFidelityThreshold(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label>后代数量</Label>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    max="20"
                    value={offspringCount}
                    onChange={(e) => setOffspringCount(parseInt(e.target.value) || 3)}
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-autopoiesis/reproduce", {
                    source_pattern: sourcePattern,
                    reproduction_mode: reproductionMode,
                    mutation_rate: mutationRate,
                    fidelity_threshold: fidelityThreshold,
                    offspring_count: offspringCount,
                  })
                }
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                繁殖模式
              </Button>
            </CardContent>
          </Card>
          {renderResults()}
        </TabsContent>

        {/* Adapt Tab */}
        <TabsContent value="adapt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightRight className="w-5 h-5" />
                适应环境
              </CardTitle>
              <CardDescription>调整自创生边界以适应环境变化</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>环境条件（逗号分隔）</Label>
                  <Input
                    value={envConditions}
                    onChange={(e) => setEnvConditions(e.target.value)}
                    placeholder="condition_1,condition_2,condition_3"
                  />
                </div>
                <div>
                  <Label>边界形成机制</Label>
                  <Select value={boundaryFormation} onValueChange={setBoundaryFormation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="membrane">膜选择</SelectItem>
                      <SelectItem value="gradient">梯度边界</SelectItem>
                      <SelectItem value="topology">拓扑感知</SelectItem>
                      <SelectItem value="functional">功能边界</SelectItem>
                      <SelectItem value="informational">信息壁垒</SelectItem>
                      <SelectItem value="ai_dynamic">AI动态边界</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>适应压力 (0-1)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={adaptationPressure}
                    onChange={(e) => setAdaptationPressure(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label>结构可塑性 (0-1)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={structuralPlasticity}
                    onChange={(e) => setStructuralPlasticity(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-autopoiesis/adapt", {
                    environmental_conditions: envConditions.split(",").map(s => s.trim()).filter(Boolean),
                    boundary_formation: boundaryFormation,
                    adaptation_pressure: adaptationPressure,
                    structural_plasticity: structuralPlasticity,
                  })
                }
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                执行适应
              </Button>
            </CardContent>
          </Card>
          {renderResults()}
        </TabsContent>

        {/* Repair Tab */}
        <TabsContent value="repair" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                修复组件
              </CardTitle>
              <CardDescription>通过再生机制修复损坏的自创生组件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>损坏组件（逗号分隔）</Label>
                  <Input
                    value={damagedComponents}
                    onChange={(e) => setDamagedComponents(e.target.value)}
                    placeholder="comp_a,comp_b,comp_c"
                  />
                </div>
                <div>
                  <Label>修复策略</Label>
                  <Select value={repairStrategy} onValueChange={setRepairStrategy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="synthesis">组件合成</SelectItem>
                      <SelectItem value="regeneration">网络再生</SelectItem>
                      <SelectItem value="recursive">递归生产</SelectItem>
                      <SelectItem value="template">模板复制</SelectItem>
                      <SelectItem value="modular">模块组装</SelectItem>
                      <SelectItem value="ai_generative">AI生成式生产</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>再生深度</Label>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    max="10"
                    value={regenerationDepth}
                    onChange={(e) => setRegenerationDepth(parseInt(e.target.value) || 3)}
                  />
                </div>
                <div>
                  <Label>启用降级回退</Label>
                  <Select value={fallbackEnabled ? "true" : "false"} onValueChange={(v) => setFallbackEnabled(v === "true")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">是</SelectItem>
                      <SelectItem value="false">否</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-autopoiesis/repair", {
                    damaged_components: damagedComponents.split(",").map(s => s.trim()).filter(Boolean),
                    repair_strategy: repairStrategy,
                    regeneration_depth: regenerationDepth,
                    fallback_enabled: fallbackEnabled,
                  })
                }
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                执行修复
              </Button>
            </CardContent>
          </Card>
          {renderResults()}
        </TabsContent>

        {/* Evolve Tab */}
        <TabsContent value="evolve" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dna className="w-5 h-5" />
                演化系统
              </CardTitle>
              <CardDescription>通过演化漂移推动自创生系统进化</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>演化漂移模式</Label>
                  <Select value={evolutionaryDrift} onValueChange={setEvolutionaryDrift}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neutral">中性漂移</SelectItem>
                      <SelectItem value="directed">定向适应</SelectItem>
                      <SelectItem value="punctuated">间断平衡</SelectItem>
                      <SelectItem value="exaptive">扩展适应</SelectItem>
                      <SelectItem value="constructive">建设性发展</SelectItem>
                      <SelectItem value="ai_structured">AI结构化漂移</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>演化代数</Label>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    value={generations}
                    onChange={(e) => setGenerations(parseInt(e.target.value) || 10)}
                  />
                </div>
                <div>
                  <Label>选择压力 (0-1)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={selectionPressure}
                    onChange={(e) => setSelectionPressure(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label>多样性维护 (0-1)</Label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={diversityMaintenance}
                    onChange={(e) => setDiversityMaintenance(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-autopoiesis/evolve", {
                    evolutionary_drift: evolutionaryDrift,
                    generations: generations,
                    selection_pressure: selectionPressure,
                    diversity_maintenance: diversityMaintenance,
                  })
                }
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                执行演化
              </Button>
            </CardContent>
          </Card>
          {renderResults()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
