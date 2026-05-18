"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Zap, Cpu, Database, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";

const API_BASE = "";

export default function GraphDistillationPage() {
  const [activeTab, setActiveTab] = useState("distill");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);

  // Distill state
  const [distillMethod, setDistillMethod] = useState("logit_based");
  const [knowledgeType, setKnowledgeType] = useState("causal");
  const [compressionRatio, setCompressionRatio] = useState(0.5);
  const [temperature, setTemperature] = useState(1.0);
  const [epochs, setEpochs] = useState(10);
  const [teacherModels, setTeacherModels] = useState("teacher_v1,teacher_v2,teacher_v3");
  const [studentModels, setStudentModels] = useState("student_v1,student_v2");

  // Compress state
  const [compressStrategy, setCompressStrategy] = useState("linear_projection");
  const [targetSize, setTargetSize] = useState(500000);
  const [preserveAccuracy, setPreserveAccuracy] = useState(0.95);
  const [compressionRatio2, setCompressionRatio2] = useState(0.5);
  const [compressModels, setCompressModels] = useState("model_a,model_b,model_c");

  // Transfer state
  const [transferTarget, setTransferTarget] = useState("cross_domain");
  const [domainDistance, setDomainDistance] = useState(0.5);
  const [adaptationLayers, setAdaptationLayers] = useState(3);
  const [freezingStrategy, setFreezingStrategy] = useState("gradual");
  const [sourceModels, setSourceModels] = useState("source_model_x,source_model_y");
  const [targetModels, setTargetModels] = useState("target_model_z");

  // Evaluate state
  const [lossFunction, setLossFunction] = useState("kl_divergence");
  const [evaluationDataset, setEvaluationDataset] = useState("validation");
  const [batchSize, setBatchSize] = useState(32);
  const [evaluateModels, setEvaluateModels] = useState("eval_model_1,eval_model_2");

  // Pipeline state
  const [pipelineMethod, setPipelineMethod] = useState("causal_graph");
  const [pipelineCompression, setPipelineCompression] = useState("low_rank");
  const [pipelineTransfer, setPipelineTransfer] = useState("cross_domain");
  const [pipelineLoss, setPipelineLoss] = useState("contrastive");
  const [overallRatio, setOverallRatio] = useState(0.3);
  const [pipelineStages, setPipelineStages] = useState("pre_training,fine_tuning,intermediate");
  const [pipelineTeachers, setPipelineTeachers] = useState("teacher_1,teacher_2");
  const [pipelineStudents, setPipelineStudents] = useState("student_1,student_2,student_3");

  // Optimize state
  const [objective, setObjective] = useState("accuracy_size_tradeoff");
  const [constraints, setConstraints] = useState('{"max_size": 1000000, "min_accuracy": 0.90}');
  const [optimizationBudget, setOptimizationBudget] = useState(1000);
  const [optimizeModels, setOptimizeModels] = useState("opt_model_1,opt_model_2,opt_model_3");

  const distillMethods = [
    "logit_based", "feature_based", "response_based",
    "relational", "causal_graph", "ai_hybrid"
  ];
  const knowledgeTypes = [
    "procedural", "declarative", "structural", "causal", "meta", "ai_emergent"
  ];
  const compressionStrategies = [
    "linear_projection", "quantization", "pruning",
    "low_rank", "distillation", "ai_adaptive"
  ];
  const transferTargets = [
    "same_domain", "cross_domain", "multi_task",
    "hierarchical", "zero_shot", "ai_meta"
  ];
  const lossFunctions = [
    "kl_divergence", "mse_loss", "cosine",
    "contrastive", "hinge", "ai_custom"
  ];
  const distillationStages = [
    "pre_training", "fine_tuning", "intermediate",
    "post_training", "continual", "ai_dynamic"
  ];

  React.useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-knowledge-distillation/overview`);
      const data = await res.json();
      setOverview(data);
    } catch (e) {
      console.error("Failed to fetch overview:", e);
    }
  };

  const handleSubmit = async (endpoint: string, payload: any) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/graph/causal-knowledge-distillation/${endpoint}`, {
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

  const handleDistill = () => {
    handleSubmit("distill", {
      teacher_models: teacherModels.split(",").map(s => s.trim()),
      student_models: studentModels.split(",").map(s => s.trim()),
      method: distillMethod,
      knowledge_type: knowledgeType,
      compression_ratio: compressionRatio,
      temperature,
      epochs,
    });
  };

  const handleCompress = () => {
    handleSubmit("compress", {
      models: compressModels.split(",").map(s => s.trim()),
      strategy: compressStrategy,
      target_size: targetSize,
      preserve_accuracy: preserveAccuracy,
      compression_ratio: compressionRatio2,
    });
  };

  const handleTransfer = () => {
    handleSubmit("transfer", {
      source_models: sourceModels.split(",").map(s => s.trim()),
      target_models: targetModels.split(",").map(s => s.trim()),
      transfer_target: transferTarget,
      domain_distance: domainDistance,
      adaptation_layers: adaptationLayers,
      freezing_strategy: freezingStrategy,
    });
  };

  const handleEvaluate = () => {
    handleSubmit("evaluate", {
      models: evaluateModels.split(",").map(s => s.trim()),
      loss_function: lossFunction,
      evaluation_dataset: evaluationDataset,
      batch_size: batchSize,
      metrics: ["accuracy", "f1", "latency"],
    });
  };

  const handlePipeline = () => {
    handleSubmit("pipeline", {
      teacher_models: pipelineTeachers.split(",").map(s => s.trim()),
      student_models: pipelineStudents.split(",").map(s => s.trim()),
      stages: pipelineStages.split(",").map(s => s.trim()),
      method: pipelineMethod,
      compression_strategy: pipelineCompression,
      transfer_target: pipelineTransfer,
      loss_function: pipelineLoss,
      overall_ratio: overallRatio,
    });
  };

  const handleOptimize = () => {
    handleSubmit("optimize", {
      models: optimizeModels.split(",").map(s => s.trim()),
      objective,
      constraints: JSON.parse(constraints),
      optimization_budget: optimizationBudget,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold">Causal Knowledge Distillation Engine</h1>
          <Badge variant="outline">Layer 32</Badge>
        </div>
        <p className="text-muted-foreground">
          Efficiently distill, compress, and transfer causal knowledge across the multiverse
        </p>
        {overview && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">v{overview.version}</Badge>
            <Badge variant="secondary">{overview.enums?.distillation_method?.length} Methods</Badge>
            <Badge variant="secondary">{overview.configuration_space}</Badge>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="distill">Distill</TabsTrigger>
          <TabsTrigger value="compress">Compress</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="optimize">Optimize</TabsTrigger>
        </TabsList>

        <TabsContent value="distill" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Knowledge Distillation
              </CardTitle>
              <CardDescription>Transfer knowledge from teacher to student models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Teacher Models (comma-separated)</Label>
                  <Input value={teacherModels} onChange={(e) => setTeacherModels(e.target.value)} placeholder="teacher_v1,teacher_v2" />
                </div>
                <div>
                  <Label>Student Models (comma-separated)</Label>
                  <Input value={studentModels} onChange={(e) => setStudentModels(e.target.value)} placeholder="student_v1,student_v2" />
                </div>
                <div>
                  <Label>Distillation Method</Label>
                  <Select value={distillMethod} onValueChange={setDistillMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{distillMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Knowledge Type</Label>
                  <Select value={knowledgeType} onValueChange={setKnowledgeType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{knowledgeTypes.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Compression Ratio ({compressionRatio})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.1" value={compressionRatio} onChange={(e) => setCompressionRatio(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Temperature ({temperature})</Label>
                  <Input type="range" min="0.1" max="3.0" step="0.1" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Epochs</Label>
                  <Input type="number" min="1" max="100" value={epochs} onChange={(e) => setEpochs(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleDistill} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Distill Knowledge
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Model Compression
              </CardTitle>
              <CardDescription>Compress models while preserving accuracy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Models (comma-separated)</Label>
                  <Input value={compressModels} onChange={(e) => setCompressModels(e.target.value)} placeholder="model_a,model_b,model_c" />
                </div>
                <div>
                  <Label>Compression Strategy</Label>
                  <Select value={compressStrategy} onValueChange={setCompressStrategy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{compressionStrategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Size</Label>
                  <Input type="number" value={targetSize} onChange={(e) => setTargetSize(parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>Preserve Accuracy ({preserveAccuracy})</Label>
                  <Input type="range" min="0.5" max="0.99" step="0.01" value={preserveAccuracy} onChange={(e) => setPreserveAccuracy(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Compression Ratio ({compressionRatio2})</Label>
                  <Input type="range" min="0.1" max="1.0" step="0.1" value={compressionRatio2} onChange={(e) => setCompressionRatio2(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleCompress} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cpu className="mr-2 h-4 w-4" />}
                Compress Models
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Knowledge Transfer
              </CardTitle>
              <CardDescription>Transfer distilled knowledge across models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Source Models</Label>
                  <Input value={sourceModels} onChange={(e) => setSourceModels(e.target.value)} placeholder="source_x,source_y" />
                </div>
                <div>
                  <Label>Target Models</Label>
                  <Input value={targetModels} onChange={(e) => setTargetModels(e.target.value)} placeholder="target_z" />
                </div>
                <div>
                  <Label>Transfer Target</Label>
                  <Select value={transferTarget} onValueChange={setTransferTarget}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{transferTargets.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Domain Distance ({domainDistance})</Label>
                  <Input type="range" min="0.0" max="1.0" step="0.1" value={domainDistance} onChange={(e) => setDomainDistance(parseFloat(e.target.value))} />
                </div>
                <div>
                  <Label>Adaptation Layers</Label>
                  <Input type="number" min="1" max="10" value={adaptationLayers} onChange={(e) => setAdaptationLayers(parseInt(e.target.value))} />
                </div>
                <div>
                  <Label>Freezing Strategy</Label>
                  <Select value={freezingStrategy} onValueChange={setFreezingStrategy}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradual">gradual</SelectItem>
                      <SelectItem value="none">none</SelectItem>
                      <SelectItem value="full">full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleTransfer} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                Transfer Knowledge
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Model Evaluation
              </CardTitle>
              <CardDescription>Evaluate distilled models with custom loss</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Models (comma-separated)</Label>
                  <Input value={evaluateModels} onChange={(e) => setEvaluateModels(e.target.value)} placeholder="eval_model_1,eval_model_2" />
                </div>
                <div>
                  <Label>Loss Function</Label>
                  <Select value={lossFunction} onValueChange={setLossFunction}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{lossFunctions.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Evaluation Dataset</Label>
                  <Input value={evaluationDataset} onChange={(e) => setEvaluationDataset(e.target.value)} placeholder="validation" />
                </div>
                <div>
                  <Label>Batch Size</Label>
                  <Input type="number" min="1" max="256" value={batchSize} onChange={(e) => setBatchSize(parseInt(e.target.value))} />
                </div>
              </div>
              <Button onClick={handleEvaluate} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                Evaluate Models
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Full Pipeline
              </CardTitle>
              <CardDescription>Run full distillation pipeline across stages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Teacher Models</Label>
                  <Input value={pipelineTeachers} onChange={(e) => setPipelineTeachers(e.target.value)} placeholder="teacher_1,teacher_2" />
                </div>
                <div>
                  <Label>Student Models</Label>
                  <Input value={pipelineStudents} onChange={(e) => setPipelineStudents(e.target.value)} placeholder="student_1,student_2,student_3" />
                </div>
                <div>
                  <Label>Pipeline Stages (comma-separated)</Label>
                  <Select value={pipelineStages} onValueChange={setPipelineStages}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{distillationStages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Method</Label>
                  <Select value={pipelineMethod} onValueChange={setPipelineMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{distillMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Compression Strategy</Label>
                  <Select value={pipelineCompression} onValueChange={setPipelineCompression}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{compressionStrategies.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Transfer Target</Label>
                  <Select value={pipelineTransfer} onValueChange={setPipelineTransfer}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{transferTargets.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Loss Function</Label>
                  <Select value={pipelineLoss} onValueChange={setPipelineLoss}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{lossFunctions.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Overall Ratio ({overallRatio})</Label>
                  <Input type="range" min="0.1" max="0.9" step="0.1" value={overallRatio} onChange={(e) => setOverallRatio(parseFloat(e.target.value))} />
                </div>
              </div>
              <Button onClick={handlePipeline} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Run Pipeline
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Configuration Optimization
              </CardTitle>
              <CardDescription>Optimize distillation configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Models (comma-separated)</Label>
                  <Input value={optimizeModels} onChange={(e) => setOptimizeModels(e.target.value)} placeholder="opt_model_1,opt_model_2,opt_model_3" />
                </div>
                <div>
                  <Label>Objective</Label>
                  <Select value={objective} onValueChange={setObjective}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accuracy_size_tradeoff">accuracy_size_tradeoff</SelectItem>
                      <SelectItem value="latency">latency</SelectItem>
                      <SelectItem value="energy">energy</SelectItem>
                      <SelectItem value="memory">memory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Optimization Budget</Label>
                  <Input type="number" min="100" max="10000" value={optimizationBudget} onChange={(e) => setOptimizationBudget(parseInt(e.target.value))} />
                </div>
                <div className="col-span-2">
                  <Label>Constraints (JSON)</Label>
                  <Textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder='{"max_size": 1000000, "min_accuracy": 0.90}' className="font-mono" />
                </div>
              </div>
              <Button onClick={handleOptimize} disabled={loading} className="w-full">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                Optimize Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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