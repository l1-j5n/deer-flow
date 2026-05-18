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
import { Loader2, Eye, CheckCircle, Bug, Target, Activity, BrainCircuit, Sparkles } from "lucide-react";

const API_BASE = "";

export default function GraphMetaCognitionPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Monitor state - 监控推理过程
  const [reasoningTrace, setReasoningTrace] = useState("premise_a,premise_b,inference_step_1,intermediate_conclusion,refinement_step,final_conclusion");
  const [monitoringStrategy, setMonitoringStrategy] = useState("monitoring");
  const [granularity, setGranularity] = useState("step");
  const [captureInterval, setCaptureInterval] = useState(0.1);

  // Evaluate state - 评估推理质量
  const [reasoningChain, setReasoningChain] = useState("premise_1,premise_2,premise_3,inference_1,inference_2,conclusion");
  const [targetConclusion, setTargetConclusion] = useState("conclusion_valid");
  const [evaluationCriteria, setEvaluationCriteria] = useState("logical_validity,evidence_support,clarity,completeness,robustness");
  const [biasDetectionSensitivity, setBiasDetectionSensitivity] = useState(0.7);
  const [consistencyCheck, setConsistencyCheck] = useState(true);

  // Debug state - 调试推理错误
  const [flawedReasoning, setFlawedReasoning] = useState("invalid_premise,logical_fallacy,incomplete_inference,contradictory_step");
  const [expectedOutcome, setExpectedOutcome] = useState("correct_conclusion");
  const [debuggingDepth, setDebuggingDepth] = useState(3);
  const [autoCorrection, setAutoCorrection] = useState(true);

  // Plan state - 规划推理策略
  const [problemSpecification, setProblemSpecification] = useState("complex_decision_making_under_uncertainty");
  const [availableModes, setAvailableModes] = useState("deductive,inductive,abductive,analogical,counterfactual,ai_hybrid");
  const [planConstraints, setPlanConstraints] = useState("time_limit,resource_constraint,accuracy_requirement");
  const [optimizationObjective, setOptimizationObjective] = useState("accuracy");

  // Regulate state - 调控认知资源
  const [activeReasoningTasks, setActiveReasoningTasks] = useState("task_primary_analysis,task_validation,task_synthesis,task_communication");
  const [resourceConstraints, setResourceConstraints] = useState("computing_budget:0.7,memory_budget:0.8,time_budget:0.6");
  const [regulationMechanism, setRegulationMechanism] = useState("ai_autonomous");
  const [adaptationRate, setAdaptationRate] = useState(0.3);

  // Learn state - 从经验中学习
  const [reasoningExperience, setReasoningExperience] = useState("exp_successful_deduction,exp_failed_analogy,exp_successful_abduction,exp_failed_induction,exp_successful_counterfactual");
  const [successOutcomes, setSuccessOutcomes] = useState("outcome_valid_inference,outcome_efficient_solution");
  const [failureModes, setFailureModes] = useState("failure_circular_reasoning,failure_missing_premise");
  const [learningRate, setLearningRate] = useState(0.5);
  const [knowledgeSynthesis, setKnowledgeSynthesis] = useState(true);

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
      const res = await fetch(`${API_BASE}/graph/causal-meta-cognition/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      setOverview({ error: String(err) });
    }
  };

  React.useEffect(() => {
    loadOverview();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">因果元认知引擎 (v1.285.0)</h1>
        <p className="text-muted-foreground">
          Layer 37: 实时监控、评估、调试、规划、调控、学习推理过程
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="monitor">监控</TabsTrigger>
          <TabsTrigger value="evaluate">评估</TabsTrigger>
          <TabsTrigger value="debug">调试</TabsTrigger>
          <TabsTrigger value="plan">规划</TabsTrigger>
          <TabsTrigger value="regulate">调控</TabsTrigger>
          <TabsTrigger value="learn">学习</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                系统概览
              </CardTitle>
              <CardDescription>Causal Meta-Cognition Engine 架构信息</CardDescription>
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
                          <span className="font-semibold">{key}:</span> {val}
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

        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                监控推理过程
              </CardTitle>
              <CardDescription>实时追踪和监控推理步骤</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>推理轨迹（逗号分隔）</Label>
                  <Input
                    value={reasoningTrace}
                    onChange={(e) => setReasoningTrace(e.target.value)}
                    placeholder="step1,step2,step3"
                  />
                </div>
                <div>
                  <Label>监控策略</Label>
                  <Select value={monitoringStrategy} onValueChange={setMonitoringStrategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monitoring">过程监控</SelectItem>
                      <SelectItem value="planning">策略规划</SelectItem>
                      <SelectItem value="error_detection">错误检测</SelectItem>
                      <SelectItem value="regulation">自适应调控</SelectItem>
                      <SelectItem value="knowledge_update">知识更新</SelectItem>
                      <SelectItem value="ai_meta">AI元战略</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>监控粒度</Label>
                  <Select value={granularity} onValueChange={setGranularity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="step">步骤级</SelectItem>
                      <SelectItem value="chain">链级</SelectItem>
                      <SelectItem value="task">任务级</SelectItem>
                      <SelectItem value="session">会话级</SelectItem>
                      <SelectItem value="lifecycle">生命周期级</SelectItem>
                      <SelectItem value="ai_adaptive">AI自适应粒度</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>捕获间隔 (秒)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={captureInterval}
                    onChange={(e) => setCaptureInterval(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-meta-cognition/monitor", {
                    reasoning_trace: reasoningTrace.split(",").map(s => s.trim()).filter(Boolean),
                    monitoring_strategy: monitoringStrategy,
                    granularity: granularity,
                    capture_interval: captureInterval,
                  })
                }
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                开始监控
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                评估推理质量
              </CardTitle>
              <CardDescription>评估推理链质量并检测认知偏差</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>推理链（逗号分隔）</Label>
                <Input
                  value={reasoningChain}
                  onChange={(e) => setReasoningChain(e.target.value)}
                  placeholder="premise1,premise2,inference,conclusion"
                />
              </div>
              <div>
                <Label>目标结论</Label>
                <Input
                  value={targetConclusion}
                  onChange={(e) => setTargetConclusion(e.target.value)}
                  placeholder="expected conclusion"
                />
              </div>
              <div>
                <Label>评估标准（逗号分隔）</Label>
                <Input
                  value={evaluationCriteria}
                  onChange={(e) => setEvaluationCriteria(e.target.value)}
                  placeholder="logical_validity,evidence_support,clarity"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>偏差检测灵敏度</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={biasDetectionSensitivity}
                    onChange={(e) => setBiasDetectionSensitivity(parseFloat(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="consistency-check"
                    checked={consistencyCheck}
                    onChange={(e) => setConsistencyCheck(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="consistency-check" className="cursor-pointer">启用一致性检查</Label>
                </div>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-meta-cognition/evaluate", {
                    reasoning_chain: reasoningChain.split(",").map(s => s.trim()).filter(Boolean),
                    target_conclusion: targetConclusion,
                    evaluation_criteria: evaluationCriteria.split(",").map(s => s.trim()).filter(Boolean),
                    bias_detection_sensitivity: biasDetectionSensitivity,
                    consistency_check: consistencyCheck,
                  })
                }
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                评估推理
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                调试推理错误
              </CardTitle>
              <CardDescription>识别并修复有缺陷的推理</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>有缺陷的推理（逗号分隔）</Label>
                <Input
                  value={flawedReasoning}
                  onChange={(e) => setFlawedReasoning(e.target.value)}
                  placeholder="flaw1,flaw2,flaw3"
                />
              </div>
              <div>
                <Label>预期结果</Label>
                <Input
                  value={expectedOutcome}
                  onChange={(e) => setExpectedOutcome(e.target.value)}
                  placeholder="correct outcome"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>调试深度</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={debuggingDepth}
                    onChange={(e) => setDebuggingDepth(parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="auto-correction"
                    checked={autoCorrection}
                    onChange={(e) => setAutoCorrection(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="auto-correction" className="cursor-pointer">启用自动修正</Label>
                </div>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-meta-cognition/debug", {
                    flawed_reasoning: flawedReasoning.split(",").map(s => s.trim()).filter(Boolean),
                    expected_outcome: expectedOutcome,
                    debugging_depth: debuggingDepth,
                    auto_correction: autoCorrection,
                  })
                }
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                调试推理
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                规划推理策略
              </CardTitle>
              <CardDescription>选择最优推理模式和策略</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>问题描述</Label>
                <Input
                  value={problemSpecification}
                  onChange={(e) => setProblemSpecification(e.target.value)}
                  placeholder="problem description"
                />
              </div>
              <div>
                <Label>可用推理模式（逗号分隔）</Label>
                <Input
                  value={availableModes}
                  onChange={(e) => setAvailableModes(e.target.value)}
                  placeholder="deductive,inductive,abductive,analogical,counterfactual,ai_hybrid"
                />
              </div>
              <div>
                <Label>约束条件（逗号分隔）</Label>
                <Input
                  value={planConstraints}
                  onChange={(e) => setPlanConstraints(e.target.value)}
                  placeholder="time_limit,resource_constraint,accuracy_requirement"
                />
              </div>
              <div>
                <Label>优化目标</Label>
                <Select value={optimizationObjective} onValueChange={setOptimizationObjective}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accuracy">准确度</SelectItem>
                    <SelectItem value="efficiency">效率</SelectItem>
                    <SelectItem value="generalization">泛化能力</SelectItem>
                    <SelectItem value="balanced">平衡</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-meta-cognition/plan", {
                    problem_specification: problemSpecification,
                    available_modes: availableModes.split(",").map(s => s.trim()).filter(Boolean),
                    constraints: planConstraints.split(",").map(s => s.trim()).filter(Boolean),
                    optimization_objective: optimizationObjective,
                  })
                }
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                规划策略
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                调控认知资源
              </CardTitle>
              <CardDescription>动态调整认知资源分配</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>活跃推理任务（逗号分隔）</Label>
                <Input
                  value={activeReasoningTasks}
                  onChange={(e) => setActiveReasoningTasks(e.target.value)}
                  placeholder="task1,task2,task3"
                />
              </div>
              <div>
                <Label>资源约束（格式: key:value,key:value）</Label>
                <Input
                  value={resourceConstraints}
                  onChange={(e) => setResourceConstraints(e.target.value)}
                  placeholder="computing_budget:0.7,memory_budget:0.8"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>调控机制</Label>
                  <Select value={regulationMechanism} onValueChange={setRegulationMechanism}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="effort">努力分配</SelectItem>
                      <SelectItem value="strategy_switch">策略切换</SelectItem>
                      <SelectItem value="resource">资源重分配</SelectItem>
                      <SelectItem value="attention">注意力聚焦</SelectItem>
                      <SelectItem value="offloading">认知卸载</SelectItem>
                      <SelectItem value="ai_autonomous">AI自主调控</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>适应率</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={adaptationRate}
                    onChange={(e) => setAdaptationRate(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-meta-cognition/regulate", {
                    active_reasoning_tasks: activeReasoningTasks.split(",").map(s => s.trim()).filter(Boolean),
                    resource_constraints: Object.fromEntries(
                      resourceConstraints.split(",").map(s => {
                        const [key, value] = s.trim().split(":");
                        return [key, parseFloat(value)];
                      })
                    ),
                    regulation_mechanism: regulationMechanism,
                    adaptation_rate: adaptationRate,
                  })
                }
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                调控资源
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learn" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" />
                从经验中学习
              </CardTitle>
              <CardDescription>从推理经验中提取知识和改进策略</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>推理经验（逗号分隔）</Label>
                <Input
                  value={reasoningExperience}
                  onChange={(e) => setReasoningExperience(e.target.value)}
                  placeholder="exp1,exp2,exp3"
                />
              </div>
              <div>
                <Label>成功结果（逗号分隔）</Label>
                <Input
                  value={successOutcomes}
                  onChange={(e) => setSuccessOutcomes(e.target.value)}
                  placeholder="success1,success2"
                />
              </div>
              <div>
                <Label>失败模式（逗号分隔）</Label>
                <Input
                  value={failureModes}
                  onChange={(e) => setFailureModes(e.target.value)}
                  placeholder="failure1,failure2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>学习率</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={learningRate}
                    onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    id="knowledge-synthesis"
                    checked={knowledgeSynthesis}
                    onChange={(e) => setKnowledgeSynthesis(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="knowledge-synthesis" className="cursor-pointer">启用知识综合</Label>
                </div>
              </div>
              <Button
                onClick={() =>
                  callAPI("/causal-meta-cognition/learn", {
                    reasoning_experience: reasoningExperience.split(",").map(s => s.trim()).filter(Boolean),
                    success_outcomes: successOutcomes.split(",").map(s => s.trim()).filter(Boolean),
                    failure_modes: failureModes.split(",").map(s => s.trim()).filter(Boolean),
                    learning_rate: learningRate,
                    knowledge_synthesis: knowledgeSynthesis,
                  })
                }
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                开始学习
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>结果</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}