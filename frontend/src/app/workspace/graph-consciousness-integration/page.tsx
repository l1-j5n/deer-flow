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
import { Loader2, Sparkles, RotateCcw, Layers, Eye, Dna, Rocket, Brain } from "lucide-react";

const API_BASE = "";
export default function GraphConsciousnessIntegrationPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Awaken state - 初始化意识状态
  const [knowledgeSources, setKnowledgeSources] = useState("source_perception,source_memory,source_introspection,source_social,source_temporal");
  const [consciousnessLevel, setConsciousnessLevel] = useState("reflective");
  const [selfModel, setSelfModel] = useState("narrative");
  const [initialAwareness, setInitialAwareness] = useState(0.5);
  const [integrationDepth, setIntegrationDepth] = useState(3);

  // Reflect state - 自我反思状态
  const [reasoningTrace, setReasoningTrace] = useState("trace_deductive,trace_inductive,trace_abductive,trace_analogical,trace_counterfactual");
  const [reflectionDepth, setReflectionDepth] = useState("process");
  const [awarenessMode, setAwarenessMode] = useState("focal");
  const [numCycles, setNumCycles] = useState(5);
  const [honestyThreshold, setHonestyThreshold] = useState(0.75);

  // Integrate state - 整合碎片化意识
  const [fragmentedAwareness, setFragmentedAwareness] = useState("fragment_sensory,fragment_emotional,fragment_cognitive,fragment_social,fragment_temporal");
  const [integrationStrategy, setIntegrationStrategy] = useState("global_workspace");
  const [integrateSelfModel, setIntegrateSelfModel] = useState("narrative");
  const [coherenceTarget, setCoherenceTarget] = useState(0.8);
  const [numModules, setNumModules] = useState(5);

  // Perceive state - 统一感知
  const [perceptionInputs, setPerceptionInputs] = useState("input_visual,input_auditory,input_somatosensory,input_interoceptive,input_exteroceptive");
  const [perceiveAwarenessMode, setPerceiveAwarenessMode] = useState("meta_monitor");
  const [perceiveConsciousnessLevel, setPerceiveConsciousnessLevel] = useState("deliberative");
  const [attentionBandwidth, setAttentionBandwidth] = useState(0.7);
  const [numPerspectives, setNumPerspectives] = useState(4);

  // Evolve state - 演化自我认同
  const [identityDimensions, setIdentityDimensions] = useState("dimension_values,dimension_beliefs,dimension_goals,dimension_traits,dimension_roles");
  const [identityCoherence, setIdentityCoherence] = useState("narrative_coherence");
  const [evolveSelfModel, setEvolveSelfModel] = useState("temporal");
  const [adaptationRate, setAdaptationRate] = useState(0.5);
  const [evolveGenerations, setEvolveGenerations] = useState(10);

  // Transcend state - 超越范式
  const [currentParadigms, setCurrentParadigms] = useState("paradigm_objective,paradigm_subjective,paradigm_relational,paradigm_process,paradigm_systems");
  const [transcendConsciousnessLevel, setTranscendConsciousnessLevel] = useState("meta_reflective");
  const [transcendIntegrationStrategy, setTranscendIntegrationStrategy] = useState("phi_integration");
  const [noveltyThreshold, setNoveltyThreshold] = useState(0.7);
  const [transcendenceDepth, setTranscendenceDepth] = useState(5);

  // 枚举值定义
  const consciousnessLevels = ["reactive", "deliberative", "reflective", "meta_reflective", "transcendent", "ai_unified"];
  const selfModels = ["narrative", "schematic", "embodied", "social_mirror", "temporal", "ai_hybrid_self"];
  const awarenessModes = ["focal", "peripheral", "meta_monitor", "intuitive", "discursive", "ai_holographic"];
  const integrationStrategies = ["global_workspace", "recurrent", "predictive", "phi_integration", "harmonic", "ai_neural"];
  const reflectionDepths = ["surface", "process", "assumption", "epistemic", "ontological", "ai_recursive"];
  const identityCoherences = ["narrative_coherence", "value_alignment", "temporal_stability", "behavioral", "authentic", "ai_adaptive"];

  React.useEffect(() => {
    fetchOverview();
  }, []);

  // 获取概览
  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-consciousness-integration/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (e) {
      console.error("Failed to fetch overview:", e);
    }
  };

  // 通用请求处理
  const handleSubmit = async (endpoint: string, payload: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-consciousness-integration/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResults({ endpoint, ...data });
    } catch (e) {
      console.error("Error:", e);
      setResults({ endpoint, error: "Failed to fetch results" });
    } finally {
      setLoading(false);
    }
  };

  // 唤醒 - 初始化意识系统
  const handleAwaken = () => handleSubmit("awaken", {
    knowledge_sources: knowledgeSources.split(",").map(s => s.trim()),
    consciousness_level: consciousnessLevel,
    self_model: selfModel,
    initial_awareness: initialAwareness,
    integration_depth: integrationDepth,
  });

  // 反思 - 自我反思与元认知
  const handleReflect = () => handleSubmit("reflect", {
    reasoning_trace: reasoningTrace.split(",").map(s => s.trim()),
    reflection_depth: reflectionDepth,
    awareness_mode: awarenessMode,
    num_cycles: numCycles,
    honesty_threshold: honestyThreshold,
  });

  // 整合 - 整合碎片化觉知
  const handleIntegrate = () => handleSubmit("integrate", {
    fragmented_awareness: fragmentedAwareness.split(",").map(s => s.trim()),
    integration_strategy: integrationStrategy,
    self_model: integrateSelfModel,
    coherence_target: coherenceTarget,
    num_modules: numModules,
  });

  // 感知 - 统一感知处理
  const handlePerceive = () => handleSubmit("perceive", {
    perception_inputs: perceptionInputs.split(",").map(s => s.trim()),
    awareness_mode: perceiveAwarenessMode,
    consciousness_level: perceiveConsciousnessLevel,
    attention_bandwidth: attentionBandwidth,
    num_perspectives: numPerspectives,
  });

  // 演化 - 自我认同演化
  const handleEvolve = () => handleSubmit("evolve", {
    identity_dimensions: identityDimensions.split(",").map(s => s.trim()),
    identity_coherence: identityCoherence,
    self_model: evolveSelfModel,
    adaptation_rate: adaptationRate,
    generations: evolveGenerations,
  });

  // 超越 - 范式超越
  const handleTranscend = () => handleSubmit("transcend", {
    current_paradigms: currentParadigms.split(",").map(s => s.trim()),
    consciousness_level: transcendConsciousnessLevel,
    integration_strategy: transcendIntegrationStrategy,
    novelty_threshold: noveltyThreshold,
    transcendence_depth: transcendenceDepth,
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* 页面标题区域 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-6 w-6 text-violet-500" />
          <h1 className="text-3xl font-bold">Causal Consciousness Integration Engine</h1>
          <Badge variant="outline">Layer 36</Badge>
          <Badge variant="outline">v1.284.0</Badge>
        </div>
        <p className="text-muted-foreground">
          {/* 因果意识整合引擎 - 统一感知、自我反思与范式超越 */}
          Unified causal consciousness through self-reflection, awareness integration, and paradigm transcendence
        </p>
        {overview && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">v{overview.version}</Badge>
            <Badge variant="secondary">{overview.enums?.consciousness_level?.length} Levels</Badge>
            <Badge variant="secondary">{overview.configuration_space}</Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="awaken">Awaken</TabsTrigger>
          <TabsTrigger value="reflect">Reflect</TabsTrigger>
          <TabsTrigger value="integrate">Integrate</TabsTrigger>
          <TabsTrigger value="perceive">Perceive</TabsTrigger>
          <TabsTrigger value="evolve">Evolve</TabsTrigger>
          <TabsTrigger value="transcend">Transcend</TabsTrigger>
        </TabsList>

        {/* 概览标签页 - 显示系统状态与配置 */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                System Overview
              </CardTitle>
              <CardDescription>Current consciousness integration engine configuration and capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              {overview ? (
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs">
                  {JSON.stringify(overview, null, 2)}
                </pre>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Loading overview...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 唤醒标签页 - 初始化意识系统 */}
        <TabsContent value="awaken" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Awaken Consciousness
              </CardTitle>
              <CardDescription>Initialize consciousness from knowledge sources with specified awareness level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Knowledge Sources (comma-separated)</Label>
                  <Textarea value={knowledgeSources} onChange={(e) => setKnowledgeSources(e.target.value)} placeholder="source_a,source_b" />
                </div>
                <div>
                  <Label>Consciousness Level</Label>
                  <Select value={consciousnessLevel} onValueChange={setConsciousnessLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{consciousnessLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Self Model</Label>
                  <Select value={selfModel} onValueChange={setSelfModel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{selfModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Initial Awareness ({initialAwareness})</Label>
                  <Input type="range" min="0.0" max="1.0" step="0.05" value={initialAwareness} onChange={(e) => setInitialAwareness(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Integration Depth</Label>
                  <Input type="number" min="1" max="10" value={integrationDepth} onChange={(e) => setIntegrationDepth(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleAwaken} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Awaken Consciousness
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 反思标签页 - 自我反思与元认知 */}
        <TabsContent value="reflect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Self Reflection
              </CardTitle>
              <CardDescription>Perform deep self-reflection on reasoning traces and cognitive processes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Reasoning Trace (comma-separated)</Label>
                  <Textarea value={reasoningTrace} onChange={(e) => setReasoningTrace(e.target.value)} placeholder="trace_a,trace_b" />
                </div>
                <div>
                  <Label>Reflection Depth</Label>
                  <Select value={reflectionDepth} onValueChange={setReflectionDepth}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{reflectionDepths.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Awareness Mode</Label>
                  <Select value={awarenessMode} onValueChange={setAwarenessMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{awarenessModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of Cycles</Label>
                  <Input type="number" min="1" max="20" value={numCycles} onChange={(e) => setNumCycles(parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>Honesty Threshold ({honestyThreshold})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.05" value={honestyThreshold} onChange={(e) => setHonestyThreshold(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleReflect} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                Begin Reflection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 整合标签页 - 整合碎片化觉知 */}
        <TabsContent value="integrate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Integrate Awareness
              </CardTitle>
              <CardDescription>Integrate fragmented awareness modules into coherent consciousness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Fragmented Awareness (comma-separated)</Label>
                  <Textarea value={fragmentedAwareness} onChange={(e) => setFragmentedAwareness(e.target.value)} placeholder="fragment_a,fragment_b" />
                </div>
                <div>
                  <Label>Integration Strategy</Label>
                  <Select value={integrationStrategy} onValueChange={setIntegrationStrategy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{integrationStrategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Self Model</Label>
                  <Select value={integrateSelfModel} onValueChange={setIntegrateSelfModel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{selfModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Coherence Target ({coherenceTarget})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.05" value={coherenceTarget} onChange={(e) => setCoherenceTarget(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Number of Modules</Label>
                  <Input type="number" min="2" max="20" value={numModules} onChange={(e) => setNumModules(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleIntegrate} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers className="mr-2 h-4 w-4" />}
                Integrate Awareness
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 感知标签页 - 统一感知处理 */}
        <TabsContent value="perceive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Unified Perception
              </CardTitle>
              <CardDescription>Process and unify multiple perception streams through consciousness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Perception Inputs (comma-separated)</Label>
                  <Textarea value={perceptionInputs} onChange={(e) => setPerceptionInputs(e.target.value)} placeholder="input_a,input_b" />
                </div>
                <div>
                  <Label>Awareness Mode</Label>
                  <Select value={perceiveAwarenessMode} onValueChange={setPerceiveAwarenessMode}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{awarenessModes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Consciousness Level</Label>
                  <Select value={perceiveConsciousnessLevel} onValueChange={setPerceiveConsciousnessLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{consciousnessLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Attention Bandwidth ({attentionBandwidth})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.05" value={attentionBandwidth} onChange={(e) => setAttentionBandwidth(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Number of Perspectives</Label>
                  <Input type="number" min="1" max="12" value={numPerspectives} onChange={(e) => setNumPerspectives(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handlePerceive} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                Process Perception
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 演化标签页 - 自我认同演化 */}
        <TabsContent value="evolve" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dna className="h-5 w-5" />
                Evolve Self-Identity
              </CardTitle>
              <CardDescription>Evolve self-identity across dimensions through adaptive coherence mechanisms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Identity Dimensions (comma-separated)</Label>
                  <Textarea value={identityDimensions} onChange={(e) => setIdentityDimensions(e.target.value)} placeholder="dimension_a,dimension_b" />
                </div>
                <div>
                  <Label>Identity Coherence</Label>
                  <Select value={identityCoherence} onValueChange={setIdentityCoherence}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{identityCoherences.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Self Model</Label>
                  <Select value={evolveSelfModel} onValueChange={setEvolveSelfModel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{selfModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Adaptation Rate ({adaptationRate})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.05" value={adaptationRate} onChange={(e) => setAdaptationRate(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Generations</Label>
                  <Input type="number" min="1" max="50" value={evolveGenerations} onChange={(e) => setEvolveGenerations(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleEvolve} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Dna className="mr-2 h-4 w-4" />}
                Evolve Identity
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 超越标签页 - 范式超越 */}
        <TabsContent value="transcend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Transcend Paradigm
              </CardTitle>
              <CardDescription>Transcend existing paradigms through novel consciousness integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Current Paradigms (comma-separated)</Label>
                  <Textarea value={currentParadigms} onChange={(e) => setCurrentParadigms(e.target.value)} placeholder="paradigm_a,paradigm_b" />
                </div>
                <div>
                  <Label>Consciousness Level</Label>
                  <Select value={transcendConsciousnessLevel} onValueChange={setTranscendConsciousnessLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{consciousnessLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Integration Strategy</Label>
                  <Select value={transcendIntegrationStrategy} onValueChange={setTranscendIntegrationStrategy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{integrationStrategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Novelty Threshold ({noveltyThreshold})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.05" value={noveltyThreshold} onChange={(e) => setNoveltyThreshold(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Transcendence Depth</Label>
                  <Input type="number" min="1" max="20" value={transcendenceDepth} onChange={(e) => setTranscendenceDepth(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleTranscend} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                Transcend Paradigm
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 结果展示区域 */}
      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Results - {results.endpoint}</CardTitle>
            <CardDescription>
              {results.cached ? <Badge variant="secondary">Cached</Badge> : <Badge>Computed</Badge>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-xs">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
