"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const SEARCH_SPACES = [
  { value: "cell_based", label: "Cell-Based", desc: "DARTS-style cell search" },
  { value: "hierarchical", label: "Hierarchical", desc: "Multi-level architecture" },
  { value: "graph_topology", label: "Graph Topo", desc: "Topology-aware search" },
  { value: "attention_based", label: "Attention", desc: "Attention mechanism search" },
  { value: "message_passing", label: "Msg Passing", desc: "MPNN variant search" },
  { value: "hybrid", label: "Hybrid", desc: "Mixed search space" },
];

const OBJECTIVES = [
  { value: "accuracy", label: "Accuracy", desc: "Prediction accuracy" },
  { value: "fairness_score", label: "Fairness", desc: "Fairness metric" },
  { value: "explainability", label: "Explain", desc: "Interpretability" },
  { value: "robustness", label: "Robust", desc: "Adversarial robustness" },
  { value: "efficiency", label: "Efficiency", desc: "Parameter efficiency" },
  { value: "composite", label: "Composite", desc: "Multi-objective" },
];

const OPERATIONS = [
  { value: "gcn", label: "GCN", desc: "Graph Convolution" },
  { value: "gat", label: "GAT", desc: "Graph Attention" },
  { value: "graphsage", label: "GraphSAGE", desc: "SAGE sampling" },
  { value: "gin", label: "GIN", desc: "Graph Isomorphism" },
  { value: "gnn_film", label: "GNN-FiLM", desc: "Feature-wise modulation" },
  { value: "edge_conv", label: "EdgeConv", desc: "Edge convolution" },
  { value: "sg_conv", label: "SGC", desc: "Simplified GC" },
  { value: "tag_conv", label: "TAG", desc: "Topology-adaptive" },
];

const MUTATIONS = [
  { value: "add_layer", label: "Add Layer", desc: "Insert new layer" },
  { value: "remove_layer", label: "Remove Layer", desc: "Delete layer" },
  { value: "change_op", label: "Change Op", desc: "Swap operation" },
  { value: "add_skip", label: "Add Skip", desc: "Add skip connection" },
  { value: "change_agg", label: "Change Agg", desc: "Change aggregation" },
  { value: "change_dim", label: "Change Dim", desc: "Resize hidden dim" },
];

const DISTILL_STRATEGIES = [
  { value: "response_based", label: "Response", desc: "Logit-level distillation" },
  { value: "feature_based", label: "Feature", desc: "Intermediate feature transfer" },
  { value: "relation_based", label: "Relation", desc: "Graph relation transfer" },
  { value: "attention_transfer", label: "Attention", desc: "Attention map transfer" },
  { value: "contrastive", label: "Contrastive", desc: "Contrastive distillation" },
];

const ADAPT_TRIGGERS = [
  { value: "performance_drop", label: "Perf Drop", desc: "Accuracy degradation" },
  { value: "distribution_shift", label: "Dist Shift", desc: "Data distribution change" },
  { value: "new_task", label: "New Task", desc: "New task arrival" },
  { value: "fairness_violation", label: "Fairness", desc: "Fairness constraint breach" },
  { value: "robustness_breach", label: "Robust", desc: "Robustness threshold breach" },
];

const CL_STRATEGIES = [
  { value: "ewc", label: "EWC", desc: "Elastic weight consolidation" },
  { value: "si", label: "SI", desc: "Synaptic intelligence" },
  { value: "mas", label: "MAS", desc: "Memory-aware synapses" },
  { value: "replay", label: "Replay", desc: "Experience replay" },
  { value: "packnet", label: "PackNet", desc: "Pack network" },
];

export default function GraphNASV2Page() {
  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Search state
  const [searchSpace, setSearchSpace] = useState("hybrid");
  const [searchObjectives, setSearchObjectives] = useState<string[]>(["accuracy", "fairness_score", "explainability", "robustness", "efficiency"]);
  const [numCandidates, setNumCandidates] = useState(20);
  const [budget, setBudget] = useState(100);
  const [minFairness, setMinFairness] = useState(0.7);
  const [minRobustness, setMinRobustness] = useState(0.6);
  const [searchResult, setSearchResult] = useState<any>(null);

  // Evaluate state
  const [evalArchId, setEvalArchId] = useState("arch_0");
  const [evalObjectives, setEvalObjectives] = useState<string[]>(["accuracy", "fairness_score", "explainability", "robustness", "efficiency"]);
  const [evalDataset, setEvalDataset] = useState("cora");
  const [crossValidate, setCrossValidate] = useState(5);
  const [evalResult, setEvalResult] = useState<any>(null);

  // Evolve state
  const [popSize, setPopSize] = useState(30);
  const [generations, setGenerations] = useState(20);
  const [mutationRate, setMutationRate] = useState(0.15);
  const [crossoverRate, setCrossoverRate] = useState(0.7);
  const [selectionPressure, setSelectionPressure] = useState(0.3);
  const [evolveResult, setEvolveResult] = useState<any>(null);

  // Distill state
  const [teacherArchId, setTeacherArchId] = useState("arch_0");
  const [distillStrategy, setDistillStrategy] = useState("response_based");
  const [compressionRatio, setCompressionRatio] = useState(0.3);
  const [distillTemp, setDistillTemp] = useState(4.0);
  const [preserveProps, setPreserveProps] = useState<string[]>(["fairness", "explainability", "robustness", "privacy"]);
  const [distillResult, setDistillResult] = useState<any>(null);

  // Adapt state
  const [adaptArchId, setAdaptArchId] = useState("arch_0");
  const [adaptTrigger, setAdaptTrigger] = useState("new_task");
  const [targetTask, setTargetTask] = useState("node_classification");
  const [adaptSteps, setAdaptSteps] = useState(10);
  const [clStrategy, setClStrategy] = useState("ewc");
  const [adaptResult, setAdaptResult] = useState<any>(null);

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

  const runSearch = async () => {
    const r = await call("/nas-v2/search", {
      search_space: searchSpace, objectives: searchObjectives,
      num_candidates: numCandidates, budget,
      constraints: { min_fairness: minFairness, min_robustness: minRobustness },
    });
    setSearchResult(r);
  };

  const runEvaluate = async () => {
    const r = await call("/nas-v2/evaluate", {
      arch_id: evalArchId, objectives: evalObjectives,
      dataset: evalDataset, cross_validate: crossValidate,
    });
    setEvalResult(r);
  };

  const runEvolve = async () => {
    const r = await call("/nas-v2/evolve", {
      population_size: popSize, generations,
      mutation_rate: mutationRate, crossover_rate: crossoverRate,
      selection_pressure: selectionPressure,
    });
    setEvolveResult(r);
  };

  const runDistill = async () => {
    const r = await call("/nas-v2/distill", {
      teacher_arch_id: teacherArchId, strategy: distillStrategy,
      compression_ratio: compressionRatio, temperature: distillTemp,
      preserve_properties: preserveProps,
    });
    setDistillResult(r);
  };

  const runAdapt = async () => {
    const r = await call("/nas-v2/adapt", {
      arch_id: adaptArchId, trigger: adaptTrigger,
      target_task: targetTask, adaptation_steps: adaptSteps,
      cl_strategy: clStrategy,
    });
    setAdaptResult(r);
  };

  const runReport = async () => {
    const r = await call("/nas-v2/report", {});
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

  const SelectButtons = ({ items, selected, onToggle, multi = false }: any) => (
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

  const MetricCard = ({ label, value, suffix = "" }: { label: string; value: any; suffix?: string }) => (
    <Card className="p-3">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{typeof value === "number" ? value.toFixed(3) : value}{suffix}</div>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Neural Architecture Search v2</h1>
          <p className="text-muted-foreground mt-1">
            Full-Stack NAS: AutoML + Fairness + Explainability + CL + Robustness + SSL Integration
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1">v1.99.0</Badge>
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
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
          <TabsTrigger value="evolve">Evolve</TabsTrigger>
          <TabsTrigger value="distill">Distill</TabsTrigger>
          <TabsTrigger value="adapt">Adapt</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Objective Architecture Search</CardTitle>
              <CardDescription>
                Search optimal architectures with fairness+explainability+robustness constraints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Search Space</Label>
                <SelectButtons items={SEARCH_SPACES} selected={[searchSpace]}
                  onToggle={(v: string) => setSearchSpace(v)} />
              </div>
              <div>
                <Label>Objectives</Label>
                <SelectButtons items={OBJECTIVES} selected={searchObjectives}
                  onToggle={(v: string) => toggleItem(searchObjectives, setSearchObjectives, v)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Candidates</Label><Input type="number" value={numCandidates} onChange={e => setNumCandidates(+e.target.value)} /></div>
                <div><Label>Budget</Label><Input type="number" value={budget} onChange={e => setBudget(+e.target.value)} /></div>
                <div><Label>Min Fairness</Label><Input type="number" step="0.05" value={minFairness} onChange={e => setMinFairness(+e.target.value)} /></div>
                <div><Label>Min Robustness</Label><Input type="number" step="0.05" value={minRobustness} onChange={e => setMinRobustness(+e.target.value)} /></div>
              </div>
              <Button onClick={runSearch} disabled={loading}>
                {loading ? "Searching..." : "Run Architecture Search"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {searchResult && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <MetricCard label="Candidates" value={searchResult.candidates?.length} />
                  <MetricCard label="Pareto Size" value={searchResult.pareto_size} />
                  <MetricCard label="Best Score" value={searchResult.best_architecture?.composite_score} />
                  <MetricCard label="Feasible %" value={searchResult.feasible_ratio ? (searchResult.feasible_ratio * 100).toFixed(1) : "N/A"} suffix="%" />
                </div>
              )}
              {renderResult(searchResult, "Architecture Search")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evaluate Tab */}
        <TabsContent value="evaluate">
          <Card>
            <CardHeader>
              <CardTitle>Deep Architecture Evaluation</CardTitle>
              <CardDescription>
                Cross-validated evaluation with all engine integration scores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Evaluate Objectives</Label>
                <SelectButtons items={OBJECTIVES} selected={evalObjectives}
                  onToggle={(v: string) => toggleItem(evalObjectives, setEvalObjectives, v)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Architecture ID</Label><Input value={evalArchId} onChange={e => setEvalArchId(e.target.value)} /></div>
                <div><Label>Dataset</Label><Input value={evalDataset} onChange={e => setEvalDataset(e.target.value)} /></div>
                <div><Label>Cross-Validate Folds</Label><Input type="number" value={crossValidate} onChange={e => setCrossValidate(+e.target.value)} /></div>
              </div>
              <Button onClick={runEvaluate} disabled={loading}>
                {loading ? "Evaluating..." : "Evaluate Architecture"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {evalResult && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard label="Overall Score" value={evalResult.overall_score} />
                    <MetricCard label="Test Accuracy" value={evalResult.dataset_performance?.test_accuracy} />
                    <MetricCard label="AUROC" value={evalResult.dataset_performance?.auroc} />
                    <MetricCard label="Gen. Gap" value={evalResult.dataset_performance?.generalization_gap} />
                  </div>
                  {evalResult.engine_scores && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Engine Integration Scores</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(evalResult.engine_scores).map(([k, v]: [string, any]) => (
                          <div key={k} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{k.replace(/_v?1?\.?\d*/g, "")}</Badge>
                            <span>{(v * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  {evalResult.recommendation && (
                    <Badge variant={evalResult.recommendation === "deploy" ? "default" : evalResult.recommendation === "iterate" ? "secondary" : "destructive"}>
                      Recommendation: {evalResult.recommendation.toUpperCase()}
                    </Badge>
                  )}
                </div>
              )}
              {renderResult(evalResult, "Architecture Evaluation")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evolve Tab */}
        <TabsContent value="evolve">
          <Card>
            <CardHeader>
              <CardTitle>Evolutionary Architecture Optimization</CardTitle>
              <CardDescription>
                Crossover + mutation + tournament selection for architecture evolution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div><Label>Population</Label><Input type="number" value={popSize} onChange={e => setPopSize(+e.target.value)} /></div>
                <div><Label>Generations</Label><Input type="number" value={generations} onChange={e => setGenerations(+e.target.value)} /></div>
                <div><Label>Mutation Rate</Label><Input type="number" step="0.05" value={mutationRate} onChange={e => setMutationRate(+e.target.value)} /></div>
                <div><Label>Crossover Rate</Label><Input type="number" step="0.05" value={crossoverRate} onChange={e => setCrossoverRate(+e.target.value)} /></div>
                <div><Label>Selection Pressure</Label><Input type="number" step="0.05" value={selectionPressure} onChange={e => setSelectionPressure(+e.target.value)} /></div>
              </div>
              <Button onClick={runEvolve} disabled={loading}>
                {loading ? "Evolving..." : "Run Evolution"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {evolveResult && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard label="Best Fitness" value={evolveResult.best_fitness_achieved} />
                    <MetricCard label="Improvement" value={evolveResult.fitness_improvement} />
                    <MetricCard label="Convergence Gen" value={evolveResult.convergence_generation} />
                    <MetricCard label="Final Pop" value={evolveResult.final_population_top5?.length} />
                  </div>
                  {evolveResult.generation_history && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Evolution Trajectory</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-auto">
                        {evolveResult.generation_history.slice(0, 10).map((gh: any) => (
                          <div key={gh.generation} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">Gen {gh.generation}</Badge>
                            <span>Best: {gh.best_fitness?.toFixed(4)} | Avg: {gh.avg_fitness?.toFixed(4)} | Div: {gh.diversity?.toFixed(3)}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
              {renderResult(evolveResult, "Evolution")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distill Tab */}
        <TabsContent value="distill">
          <Card>
            <CardHeader>
              <CardTitle>Architecture-Aware Knowledge Distillation</CardTitle>
              <CardDescription>
                Compress architectures while preserving fairness+explainability+robustness properties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Distillation Strategy</Label>
                <SelectButtons items={DISTILL_STRATEGIES} selected={[distillStrategy]}
                  onToggle={(v: string) => setDistillStrategy(v)} />
              </div>
              <div>
                <Label>Preserve Properties</Label>
                <SelectButtons
                  items={[
                    { value: "fairness", label: "Fairness", desc: "" },
                    { value: "explainability", label: "Explainability", desc: "" },
                    { value: "robustness", label: "Robustness", desc: "" },
                    { value: "privacy", label: "Privacy", desc: "" },
                  ]}
                  selected={preserveProps}
                  onToggle={(v: string) => toggleItem(preserveProps, setPreserveProps, v)}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Teacher Arch ID</Label><Input value={teacherArchId} onChange={e => setTeacherArchId(e.target.value)} /></div>
                <div><Label>Compression Ratio</Label><Input type="number" step="0.1" value={compressionRatio} onChange={e => setCompressionRatio(+e.target.value)} /></div>
                <div><Label>Temperature</Label><Input type="number" step="0.5" value={distillTemp} onChange={e => setDistillTemp(+e.target.value)} /></div>
              </div>
              <Button onClick={runDistill} disabled={loading}>
                {loading ? "Distilling..." : "Run Distillation"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {distillResult && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard label="Accuracy Retention" value={distillResult.distillation_metrics?.accuracy_retention} />
                    <MetricCard label="Param Reduction" value={distillResult.distillation_metrics?.param_reduction} suffix="%" />
                    <MetricCard label="Transfer Score" value={distillResult.distillation_metrics?.knowledge_transfer_score} />
                    <MetricCard label="Fidelity" value={distillResult.distillation_metrics?.fidelity_score} />
                  </div>
                  {distillResult.teacher && distillResult.student && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Teacher → Student Comparison</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Teacher ({distillResult.teacher.arch_id})</h4>
                          <div className="text-sm text-muted-foreground">Params: {distillResult.teacher.num_params?.toLocaleString()} | Accuracy: {(distillResult.teacher.accuracy * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">Student ({distillResult.student.arch_id})</h4>
                          <div className="text-sm text-muted-foreground">Params: {distillResult.student.num_params?.toLocaleString()} | Accuracy: {(distillResult.student.accuracy * 100).toFixed(1)}% | Speedup: {distillResult.student.inference_speedup}x</div>
                        </div>
                      </div>
                    </Card>
                  )}
                  {distillResult.property_preservation && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Property Preservation</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {Object.entries(distillResult.property_preservation).map(([k, v]: [string, any]) => (
                          <div key={k} className="text-sm">
                            <div className="font-medium">{k}</div>
                            <div className="text-muted-foreground">Retention: {(v.retention_ratio * 100).toFixed(1)}%</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
              {renderResult(distillResult, "Knowledge Distillation")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adapt Tab */}
        <TabsContent value="adapt">
          <Card>
            <CardHeader>
              <CardTitle>Continual Architecture Adaptation</CardTitle>
              <CardDescription>
                Adapt architectures for new tasks/distributions with CL strategy integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Adaptation Trigger</Label>
                <SelectButtons items={ADAPT_TRIGGERS} selected={[adaptTrigger]}
                  onToggle={(v: string) => setAdaptTrigger(v)} />
              </div>
              <div>
                <Label>CL Strategy</Label>
                <SelectButtons items={CL_STRATEGIES} selected={[clStrategy]}
                  onToggle={(v: string) => setClStrategy(v)} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>Architecture ID</Label><Input value={adaptArchId} onChange={e => setAdaptArchId(e.target.value)} /></div>
                <div><Label>Target Task</Label><Input value={targetTask} onChange={e => setTargetTask(e.target.value)} /></div>
                <div><Label>Adaptation Steps</Label><Input type="number" value={adaptSteps} onChange={e => setAdaptSteps(+e.target.value)} /></div>
              </div>
              <Button onClick={runAdapt} disabled={loading}>
                {loading ? "Adapting..." : "Run Adaptation"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {adaptResult && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard label="Base Score" value={adaptResult.performance?.base_score} />
                    <MetricCard label="Final Score" value={adaptResult.performance?.final_score} />
                    <MetricCard label="Improvement" value={adaptResult.performance?.improvement} />
                    <MetricCard label="Max Forgetting" value={adaptResult.performance?.max_forgetting} />
                  </div>
                  {adaptResult.continual_learning && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Continual Learning Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Strategy:</span> {adaptResult.continual_learning.strategy}</div>
                        <div><span className="text-muted-foreground">Tasks Learned:</span> {adaptResult.continual_learning.num_tasks_learned}</div>
                        <div><span className="text-muted-foreground">Knowledge Ret:</span> {(adaptResult.continual_learning.knowledge_retention * 100).toFixed(1)}%</div>
                        <div><span className="text-muted-foreground">Transfer Eff:</span> {(adaptResult.continual_learning.transfer_efficiency * 100).toFixed(1)}%</div>
                      </div>
                    </Card>
                  )}
                </div>
              )}
              {renderResult(adaptResult, "Architecture Adaptation")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive NAS v2 Report</CardTitle>
              <CardDescription>
                Full integration report with v1.89–v1.98 engine map and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runReport} disabled={loading}>
                {loading ? "Generating..." : "Generate Full Report"}
              </Button>
              {error && <p className="text-destructive text-sm">{error}</p>}
              {reportResult && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard label="Overall NAS Score" value={reportResult.overall_nas_score} />
                    <MetricCard label="Version" value={reportResult.version} />
                    <MetricCard label="Search Spaces" value={reportResult.capabilities?.search_spaces?.length} />
                    <MetricCard label="Operations" value={reportResult.capabilities?.operations?.length} />
                  </div>
                  {reportResult.integration_map && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Integration Map (v1.89–v1.98)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {Object.entries(reportResult.integration_map).map(([k, v]: [string, any]) => (
                          <div key={k} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{k.replace(/_/g, " ")}</Badge>
                            <span className="text-muted-foreground">{String(v).replace(/_/g, " ")}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  {reportResult.modules && (
                    <Card className="p-4">
                      <h3 className="font-semibold mb-2">Module Status</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {Object.entries(reportResult.modules).map(([k, v]: [string, any]) => (
                          <div key={k} className="flex items-center gap-2 text-sm">
                            <Badge variant={v.cached ? "default" : "outline"}>{k}</Badge>
                            <span className="text-muted-foreground">{v.cached ? "✓ cached" : "— empty"}</span>
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
                            <span className="font-medium">{String(rec.action).replace(/_/g, " ")}</span>
                            <span className="text-muted-foreground">— {rec.details}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
              {renderResult(reportResult, "NAS v2 Report")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
