"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const CONTRASTIVE_METHODS = [
  { value: "graphcl", label: "GraphCL", desc: "Graph contrastive learning via augmentations" },
  { value: "dgi", label: "DGI", desc: "Deep Graph Infomax" },
  { value: "infograph", label: "InfoGraph", desc: "Mutual information maximization" },
  { value: "mvgrl", label: "MVGRL", desc: "Multi-view graph representation learning" },
  { value: "hdgi", label: "HDGI", desc: "Hierarchical DGI" },
];

const GENERATIVE_METHODS = [
  { value: "vae", label: "Graph VAE", desc: "Variational autoencoder for graphs" },
  { value: "gae", label: "GAE", desc: "Graph autoencoder" },
  { value: "arga", label: "ARGA", desc: "Adversarially regularized GAE" },
  { value: "graph_generator", label: "Graph Generator", desc: "Generative graph model" },
  { value: "masked_autoencoder", label: "Masked AE", desc: "Masked graph autoencoder" },
];

const PREDICTIVE_TASKS = [
  { value: "link_prediction", label: "Link Prediction", desc: "Predict missing edges" },
  { value: "attribute_prediction", label: "Attr Prediction", desc: "Predict node attributes" },
  { value: "edge_prediction", label: "Edge Prediction", desc: "Predict edge properties" },
  { value: "degree_prediction", label: "Degree Prediction", desc: "Predict node degrees" },
  { value: "subgraph_prediction", label: "Subgraph Pred.", desc: "Predict subgraph properties" },
];

const CL_STRATEGIES = [
  { value: "ewc", label: "EWC", desc: "Elastic weight consolidation" },
  { value: "si", label: "SI", desc: "Synaptic intelligence" },
  { value: "mas", label: "MAS", desc: "Memory-aware synapses" },
  { value: "replay", label: "Replay", desc: "Experience replay" },
  { value: "packnet", label: "PackNet", desc: "Pack network" },
  { value: "progressive", label: "Progressive", desc: "Progressive networks" },
];

const PREVENTION_METHODS = [
  { value: "replay_buffer", label: "Replay Buffer", desc: "Store & replay samples" },
  { value: "regularization", label: "Regularization", desc: "Weight regularization" },
  { value: "distillation", label: "Distillation", desc: "Knowledge distillation" },
  { value: "parameter_isolation", label: "Param Isolation", desc: "Isolate task parameters" },
  { value: "adapter", label: "Adapter", desc: "Task-specific adapters" },
];

export default function GraphSSLCLPage() {
  const [activeTab, setActiveTab] = useState("contrastive");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Contrastive state
  const [contrastMethod, setContrastMethod] = useState("graphcl");
  const [numAugmentations, setNumAugmentations] = useState(4);
  const [temperature, setTemperature] = useState(0.5);
  const [clStrategyContrast, setClStrategyContrast] = useState("ewc");
  const [taskId, setTaskId] = useState("task_1");
  const [memoryBudget, setMemoryBudget] = useState(1000);
  const [contrastResult, setContrastResult] = useState<any>(null);

  // Generative state
  const [genMethod, setGenMethod] = useState("vae");
  const [latentDim, setLatentDim] = useState(64);
  const [clStrategyGen, setClStrategyGen] = useState("replay");
  const [privacyLevel, setPrivacyLevel] = useState("standard");
  const [reconWeight, setReconWeight] = useState(1.0);
  const [genResult, setGenResult] = useState<any>(null);

  // Predictive state
  const [predTask, setPredTask] = useState("link_prediction");
  const [numPredTasks, setNumPredTasks] = useState(5);
  const [clStrategyPred, setClStrategyPred] = useState("mas");
  const [maskingRatio, setMaskingRatio] = useState(0.2);
  const [predDepth, setPredDepth] = useState(8);
  const [predResult, setPredResult] = useState<any>(null);

  // Strategy state
  const [sslParadigms, setSslParadigms] = useState<string[]>(["contrastive", "generative", "predictive"]);
  const [clStrategies, setClStrategies] = useState<string[]>(["ewc", "si", "mas", "replay", "packnet"]);
  const [optObjectives, setOptObjectives] = useState<string[]>(["accuracy", "efficiency", "robustness"]);
  const [resourceBudget, setResourceBudget] = useState(1.0);
  const [strategyResult, setStrategyResult] = useState<any>(null);

  // Forgetting state
  const [preventionMethods, setPreventionMethods] = useState<string[]>(["replay_buffer", "regularization", "distillation"]);
  const [numForgettingTasks, setNumForgettingTasks] = useState(8);
  const [monitoringWindow, setMonitoringWindow] = useState(10);
  const [alertThreshold, setAlertThreshold] = useState(0.1);
  const [forgettingResult, setForgettingResult] = useState<any>(null);

  // Report state
  const [reportResult, setReportResult] = useState<any>(null);

  const call = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/kg${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...body }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const runContrastive = async () => {
    const r = await call("/ssl-cl/contrastive", {
      method: contrastMethod, num_augmentations: numAugmentations,
      temperature, cl_strategy: clStrategyContrast,
      task_id: taskId, memory_budget: memoryBudget,
    });
    setContrastResult(r);
  };

  const runGenerative = async () => {
    const r = await call("/ssl-cl/generative", {
      method: genMethod, latent_dim: latentDim,
      cl_strategy: clStrategyGen, privacy_level: privacyLevel,
      reconstruction_weight: reconWeight,
    });
    setGenResult(r);
  };

  const runPredictive = async () => {
    const r = await call("/ssl-cl/predictive", {
      task: predTask, num_tasks: numPredTasks,
      cl_strategy: clStrategyPred, masking_ratio: maskingRatio,
      prediction_depth: predDepth,
    });
    setPredResult(r);
  };

  const runStrategy = async () => {
    const r = await call("/ssl-cl/strategy", {
      ssl_paradigms: sslParadigms, cl_strategies: clStrategies,
      optimization_objectives: optObjectives, resource_budget: resourceBudget,
    });
    setStrategyResult(r);
  };

  const runForgetting = async () => {
    const r = await call("/ssl-cl/forgetting", {
      prevention_methods: preventionMethods, num_tasks: numForgettingTasks,
      monitoring_window: monitoringWindow, alert_threshold: alertThreshold,
    });
    setForgettingResult(r);
  };

  const runReport = async () => {
    const r = await call("/ssl-cl/report", {
      include_contrastive: true, include_generative: true,
      include_predictive: true, include_strategy: true,
      include_forgetting: true,
    });
    setReportResult(r);
  };

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, v: string) => {
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
  };

  const renderResult = (data: any, title: string) => {
    if (!data) return null;
    return (
      <Card className="mt-4">
        <CardHeader><CardTitle className="text-lg">{title} Results</CardTitle></CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  const SelectButtons = ({ items, selected, onToggle, color = "default" }: any) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item: any) => (
        <Button
          key={item.value}
          variant={selected.includes(item.value) ? "default" : "outline"}
          size="sm"
          onClick={() => onToggle(item.value)}
          title={item.desc}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Self-Supervised Continual Learning</h1>
          <p className="text-muted-foreground mt-1">
            Deep SSL×CL integration: Contrastive, Generative, Predictive paradigms with forgetting prevention
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1">v1.98.0</Badge>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Graph ID</Label>
              <Input value={graphId} onChange={e => setGraphId(e.target.value)} placeholder="graph1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="contrastive">Contrastive</TabsTrigger>
          <TabsTrigger value="generative">Generative</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="forgetting">Forgetting</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        {/* Contrastive Tab */}
        <TabsContent value="contrastive">
          <Card>
            <CardHeader>
              <CardTitle>Contrastive SSL + CL</CardTitle>
              <CardDescription>GraphCL/DGI/InfoGraph/MVGRL/HDGI × continual learning constraints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Contrastive Method</Label>
                <SelectButtons items={CONTRASTIVE_METHODS} selected={[contrastMethod]}
                  onToggle={(v: string) => setContrastMethod(v)} />
              </div>
              <div>
                <Label>CL Strategy</Label>
                <SelectButtons items={CL_STRATEGIES} selected={[clStrategyContrast]}
                  onToggle={(v: string) => setClStrategyContrast(v)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Temperature</Label><Input type="number" step="0.1" value={temperature} onChange={e => setTemperature(+e.target.value)} /></div>
                <div><Label>Augmentations</Label><Input type="number" value={numAugmentations} onChange={e => setNumAugmentations(+e.target.value)} /></div>
                <div><Label>Task ID</Label><Input value={taskId} onChange={e => setTaskId(e.target.value)} /></div>
                <div><Label>Memory Budget</Label><Input type="number" value={memoryBudget} onChange={e => setMemoryBudget(+e.target.value)} /></div>
              </div>
              <Button onClick={runContrastive} disabled={loading}>
                {loading ? "Running..." : "Run Contrastive SSL-CL"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {contrastResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Alignment</div><div className="text-xl font-bold">{(contrastResult.alignment_score * 100).toFixed(1)}%</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Uniformity</div><div className="text-xl font-bold">{(contrastResult.uniformity_score * 100).toFixed(1)}%</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Downstream Acc</div><div className="text-xl font-bold">{(contrastResult.downstream_accuracy * 100).toFixed(1)}%</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Tasks Learned</div><div className="text-xl font-bold">{contrastResult.tasks_learned}</div></Card>
                </div>
              )}
              {renderResult(contrastResult, "Contrastive SSL-CL")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generative Tab */}
        <TabsContent value="generative">
          <Card>
            <CardHeader>
              <CardTitle>Generative SSL + CL</CardTitle>
              <CardDescription>VAE/GAE/ARGA × continual knowledge retention × privacy-preserving generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Generative Method</Label>
                <SelectButtons items={GENERATIVE_METHODS} selected={[genMethod]}
                  onToggle={(v: string) => setGenMethod(v)} />
              </div>
              <div>
                <Label>CL Strategy</Label>
                <SelectButtons items={CL_STRATEGIES} selected={[clStrategyGen]}
                  onToggle={(v: string) => setClStrategyGen(v)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Latent Dim</Label><Input type="number" value={latentDim} onChange={e => setLatentDim(+e.target.value)} /></div>
                <div>
                  <Label>Privacy Level</Label>
                  <Input value={privacyLevel} onChange={e => setPrivacyLevel(e.target.value)} placeholder="standard" />
                </div>
                <div><Label>Recon Weight</Label><Input type="number" step="0.1" value={reconWeight} onChange={e => setReconWeight(+e.target.value)} /></div>
              </div>
              <Button onClick={runGenerative} disabled={loading}>
                {loading ? "Running..." : "Run Generative SSL-CL"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {genResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Edge Accuracy</div><div className="text-xl font-bold">{(genResult.reconstruction_metrics?.edge_accuracy * 100).toFixed(1)}%</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Gen Quality</div><div className="text-xl font-bold">{(genResult.generation_quality * 100).toFixed(1)}%</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Knowledge Ret.</div><div className="text-xl font-bold">{(genResult.cl_metrics?.knowledge_retention * 100).toFixed(1)}%</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">ELBO</div><div className="text-xl font-bold">{genResult.elbo?.toFixed(3)}</div></Card>
                </div>
              )}
              {renderResult(genResult, "Generative SSL-CL")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictive Tab */}
        <TabsContent value="predictive">
          <Card>
            <CardHeader>
              <CardTitle>Predictive SSL + CL</CardTitle>
              <CardDescription>Link/Attribute/Edge prediction × continual learning adaptation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Prediction Task</Label>
                <SelectButtons items={PREDICTIVE_TASKS} selected={[predTask]}
                  onToggle={(v: string) => setPredTask(v)} />
              </div>
              <div>
                <Label>CL Strategy</Label>
                <SelectButtons items={CL_STRATEGIES} selected={[clStrategyPred]}
                  onToggle={(v: string) => setClStrategyPred(v)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Num Tasks</Label><Input type="number" value={numPredTasks} onChange={e => setNumPredTasks(+e.target.value)} /></div>
                <div><Label>Masking Ratio</Label><Input type="number" step="0.05" value={maskingRatio} onChange={e => setMaskingRatio(+e.target.value)} /></div>
                <div><Label>Prediction Depth</Label><Input type="number" value={predDepth} onChange={e => setPredDepth(+e.target.value)} /></div>
              </div>
              <Button onClick={runPredictive} disabled={loading}>
                {loading ? "Running..." : "Run Predictive SSL-CL"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {predResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Overall Acc</div><div className="text-xl font-bold">{(predResult.overall_accuracy * 100).toFixed(1)}%</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Retention</div><div className="text-xl font-bold">{(predResult.continual_retention * 100).toFixed(1)}%</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Transfer</div><div className="text-xl font-bold">{(predResult.task_transfer_score * 100).toFixed(1)}%</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Predictions</div><div className="text-xl font-bold">{predResult.predictions?.length}</div></Card>
                </div>
              )}
              {renderResult(predResult, "Predictive SSL-CL")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy">
          <Card>
            <CardHeader>
              <CardTitle>SSL-CL Strategy Optimization</CardTitle>
              <CardDescription>Multi-objective strategy selection with Pareto front analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>SSL Paradigms</Label>
                <SelectButtons
                  items={[
                    { value: "contrastive", label: "Contrastive", desc: "" },
                    { value: "generative", label: "Generative", desc: "" },
                    { value: "predictive", label: "Predictive", desc: "" },
                    { value: "hybrid", label: "Hybrid", desc: "" },
                    { value: "autoencoder", label: "Autoencoder", desc: "" },
                  ]}
                  selected={sslParadigms}
                  onToggle={(v: string) => toggleItem(sslParadigms, setSslParadigms, v)}
                />
              </div>
              <div>
                <Label>CL Strategies</Label>
                <SelectButtons items={CL_STRATEGIES} selected={clStrategies}
                  onToggle={(v: string) => toggleItem(clStrategies, setClStrategies, v)} />
              </div>
              <div>
                <Label>Optimization Objectives</Label>
                <SelectButtons
                  items={[
                    { value: "accuracy", label: "Accuracy", desc: "" },
                    { value: "efficiency", label: "Efficiency", desc: "" },
                    { value: "robustness", label: "Robustness", desc: "" },
                    { value: "scalability", label: "Scalability", desc: "" },
                  ]}
                  selected={optObjectives}
                  onToggle={(v: string) => toggleItem(optObjectives, setOptObjectives, v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Resource Budget</Label><Input type="number" step="0.1" value={resourceBudget} onChange={e => setResourceBudget(+e.target.value)} /></div>
              </div>
              <Button onClick={runStrategy} disabled={loading}>
                {loading ? "Running..." : "Optimize Strategy"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {strategyResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Combinations</div><div className="text-xl font-bold">{strategyResult.strategy_combinations?.length}</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Best Score</div><div className="text-xl font-bold">{strategyResult.recommended?.composite_score?.toFixed(3)}</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Best Paradigm</div><div className="text-xl font-bold">{strategyResult.recommended?.paradigm}</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Est. Time</div><div className="text-xl font-bold">{strategyResult.estimated_training_time_hours}h</div></Card>
                </div>
              )}
              {renderResult(strategyResult, "Strategy Optimization")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forgetting Tab */}
        <TabsContent value="forgetting">
          <Card>
            <CardHeader>
              <CardTitle>SSL Forgetting Prevention</CardTitle>
              <CardDescription>Monitor & prevent catastrophic forgetting with replay + regularization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Prevention Methods</Label>
                <SelectButtons items={PREVENTION_METHODS} selected={preventionMethods}
                  onToggle={(v: string) => toggleItem(preventionMethods, setPreventionMethods, v)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Num Tasks</Label><Input type="number" value={numForgettingTasks} onChange={e => setNumForgettingTasks(+e.target.value)} /></div>
                <div><Label>Monitoring Window</Label><Input type="number" value={monitoringWindow} onChange={e => setMonitoringWindow(+e.target.value)} /></div>
                <div><Label>Alert Threshold</Label><Input type="number" step="0.01" value={alertThreshold} onChange={e => setAlertThreshold(+e.target.value)} /></div>
              </div>
              <Button onClick={runForgetting} disabled={loading}>
                {loading ? "Running..." : "Analyze Forgetting"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {forgettingResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Forgetting Rate</div><div className="text-xl font-bold">{(forgettingResult.overall_forgetting_rate * 100).toFixed(1)}%</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Retention</div><div className="text-xl font-bold">{(forgettingResult.average_performance_retention * 100).toFixed(1)}%</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Critical Alerts</div><div className="text-xl font-bold text-destructive">{forgettingResult.critical_alerts}</div></Card>
                  <Card className="p-3"><div className="text-sm text-muted-foreground">Recommended</div><div className="text-xl font-bold">{forgettingResult.recommended_method}</div></Card>
                </div>
              )}
              {renderResult(forgettingResult, "Forgetting Prevention")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive SSL-CL Report</CardTitle>
              <CardDescription>Full integration report with cross-module analysis & v1.89–v1.97 integration map</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runReport} disabled={loading}>
                {loading ? "Generating..." : "Generate Full Report"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {reportResult && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="p-3"><div className="text-sm text-muted-foreground">Synergy Score</div><div className="text-xl font-bold">{(reportResult.integration_metrics?.ssl_cl_synergy_score * 100).toFixed(1)}%</div></Card>
                    <Card className="p-3"><div className="text-sm text-muted-foreground">Repr. Quality</div><div className="text-xl font-bold">{(reportResult.integration_metrics?.continual_representation_quality * 100).toFixed(1)}%</div></Card>
                    <Card className="p-3"><div className="text-sm text-muted-foreground">Cross-Task</div><div className="text-xl font-bold">{(reportResult.integration_metrics?.cross_task_transfer * 100).toFixed(1)}%</div></Card>
                    <Card className="p-3"><div className="text-sm text-muted-foreground">Overall</div><div className="text-xl font-bold">{(reportResult.integration_metrics?.overall_system_score * 100).toFixed(1)}%</div></Card>
                  </div>
                  {reportResult.integration_map && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Integration Map (v1.89–v1.97)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {Object.entries(reportResult.integration_map).map(([k, v]: [string, any]) => (
                          <div key={k} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{k.replace("v1.", "v1.")}</Badge>
                            <span className="text-muted-foreground">{String(v).replace(/_/g, " ")}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  {reportResult.recommendations && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Recommendations</h3>
                      <div className="space-y-2">
                        {reportResult.recommendations.map((rec: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Badge variant={rec.priority === "high" ? "default" : rec.priority === "medium" ? "secondary" : "outline"}>
                              {rec.priority}
                            </Badge>
                            <span>{String(rec.action).replace(/_/g, " ")}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
              {renderResult(reportResult, "SSL-CL Report")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
