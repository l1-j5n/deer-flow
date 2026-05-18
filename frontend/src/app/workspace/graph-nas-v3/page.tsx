"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const CELL_TYPES = [
  { value: "gcn", label: "GCN", desc: "Graph Convolutional Network" },
  { value: "gat", label: "GAT", desc: "Graph Attention Network" },
  { value: "gin", label: "GIN", desc: "Graph Isomorphism Network" },
  { value: "sage", label: "SAGE", desc: "GraphSAGE" },
  { value: "gine", label: "GINE", desc: "GINE Conv" },
  { value: "custom", label: "Custom", desc: "Custom cell type" },
];

const SEARCH_METHODS = [
  { value: "darts", label: "DARTS", desc: "Differentiable arch search" },
  { value: "snas", label: "SNAS", desc: "Stochastic NAS" },
  { value: "gdarts", label: "GDARTS", desc: "GD-based DARTS" },
  { value: "pdarts", label: "PDARTS", desc: "Progressive DARTS" },
  { value: "fbnet", label: "FBNet", desc: "Facebook BN-based" },
];

const NAS_OBJECTIVES = [
  { value: "accuracy", label: "Accuracy", desc: "Maximize accuracy" },
  { value: "params", label: "Params", desc: "Minimize parameters" },
  { value: "flops", label: "FLOPs", desc: "Minimize compute" },
  { value: "latency", label: "Latency", desc: "Minimize inference time" },
  { value: "fairness", label: "Fairness", desc: "Maximize fairness" },
  { value: "robustness", label: "Robust", desc: "Maximize robustness" },
];

const PREDICTOR_TYPES = [
  { value: "gcnet", label: "GCNet", desc: "Graph-based predictor" },
  { value: "bonsai", label: "Bonsai", desc: "Tree-based predictor" },
  { value: "seminas", label: "SemiNAS", desc: "Semi-supervised predictor" },
  { value: "fbnet_predictor", label: "FBNet-P", desc: "FBNet predictor" },
  { value: "graphnas", label: "GraphNAS", desc: "Graph NAS predictor" },
];

const PROGRESSIVE_STAGES = [
  { value: "simple", label: "Simple", desc: "2 layers, 128 dim" },
  { value: "moderate", label: "Moderate", desc: "4 layers, 256 dim" },
  { value: "complex", label: "Complex", desc: "6 layers, 512 dim" },
  { value: "advanced", label: "Advanced", desc: "8 layers, 768 dim" },
  { value: "full", label: "Full", desc: "12 layers, 1024 dim" },
];

const TRANSFER_MODES = [
  { value: "zero_shot", label: "Zero-Shot", desc: "No target training" },
  { value: "few_shot", label: "Few-Shot", desc: "Few samples needed" },
  { value: "fine_tune", label: "Fine-Tune", desc: "Full fine-tuning" },
  { value: "meta_init", label: "Meta-Init", desc: "Meta-learning init" },
  { value: "full", label: "Full", desc: "Full retraining" },
];

type TabKey = "space" | "darts" | "multiobj" | "predictor" | "progressive" | "transfer" | "report";

export default function GraphNASV3Page() {
  const [activeTab, setActiveTab] = useState<TabKey>("space");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);

  // Search space state
  const [cellType, setCellType] = useState("gcn");
  const [automlGuided, setAutomlGuided] = useState(true);
  const [maxOps, setMaxOps] = useState("20");

  // DARTS state
  const [searchMethod, setSearchMethod] = useState("darts");
  const [numEpochs, setNumEpochs] = useState("50");
  const [fairnessWeight, setFairnessWeight] = useState("0.2");

  // Multi-objective state
  const [populationSize, setPopulationSize] = useState("50");
  const [numGenerations, setNumGenerations] = useState("30");

  // Predictor state
  const [predictorType, setPredictorType] = useState("gcnet");
  const [trainingArchs, setTrainingArchs] = useState("200");

  // Progressive state
  const [startStage, setStartStage] = useState("simple");
  const [endStage, setEndStage] = useState("full");
  const [automlPipelined, setAutomlPipelined] = useState(true);

  // Transfer state
  const [sourceTask, setSourceTask] = useState("node_classification");
  const [targetTask, setTargetTask] = useState("graph_classification");
  const [transferMode, setTransferMode] = useState("meta_init");

  const callApi = async (endpoint: string, body: Record<string, any>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/kg/nas-v3/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  const renderJson = (data: any) => (
    <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-[600px] whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );

  const renderMetric = (label: string, value: any, color = "blue") => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">{label}:</span>
      <Badge variant="outline" className="text-xs">{typeof value === "number" ? value.toFixed(4) : String(value)}</Badge>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;
    if (result.error) return <div className="text-red-400 p-4">Error: {result.error}</div>;

    switch (activeTab) {
      case "space":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Search Space Definition</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {renderMetric("Search Space ID", result.search_space_id)}
                {renderMetric("Raw Space Size", result.space_statistics?.raw_search_space_size)}
                {renderMetric("Effective Space Size", result.space_statistics?.effective_search_space_size)}
                {renderMetric("Reduction Ratio", result.space_statistics?.reduction_ratio)}
                {result.automl_insights && (
                  <div className="mt-2 p-3 bg-blue-950/30 rounded-lg space-y-1">
                    <div className="text-xs font-semibold text-blue-300">AutoML Insights</div>
                    {renderMetric("Space Reduction", result.automl_insights.search_space_reduction)}
                    {renderMetric("Expected Accuracy Gain", result.automl_insights.expected_accuracy_gain)}
                    {renderMetric("Pipeline Recommendation", result.automl_insights.pipeline_recommendation)}
                  </div>
                )}
              </CardContent>
            </Card>
            {result.layer_templates && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Layer Templates ({result.layer_templates.length})</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.layer_templates.map((t: any, i: number) => (
                      <div key={i} className="text-xs bg-gray-900 p-2 rounded">
                        <span className="text-cyan-400">Layer {t.layer_id}</span>: {t.operation} + {t.aggregation} + {t.activation} (dim={t.hidden_dim}, heads={t.num_heads})
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {renderJson(result)}
          </div>
        );

      case "darts":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">DARTS Search Results</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {renderMetric("Method", result.search_method)}
                {renderMetric("Best Epoch", result.best_epoch)}
                {renderMetric("Discovered Arch", result.discovered_architecture?.arch_id)}
                {renderMetric("Params", result.discovered_architecture?.estimated_params?.toLocaleString())}
                {result.multi_objective_results && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    <div className="bg-green-950/30 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Accuracy</div>
                      <div className="text-lg font-bold text-green-400">{result.multi_objective_results.accuracy}</div>
                    </div>
                    <div className="bg-blue-950/30 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Fairness</div>
                      <div className="text-lg font-bold text-blue-400">{result.multi_objective_results.fairness_score}</div>
                    </div>
                    <div className="bg-purple-950/30 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Robustness</div>
                      <div className="text-lg font-bold text-purple-400">{result.multi_objective_results.robustness_score}</div>
                    </div>
                    <div className="bg-orange-950/30 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Composite</div>
                      <div className="text-lg font-bold text-orange-400">{result.multi_objective_results.composite_score}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {result.search_metrics && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Search Metrics</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div>Convergence: {result.search_metrics.convergence_epoch} epochs</div>
                    <div>Time: {result.search_metrics.total_search_time_sec}s</div>
                    <div>Peak Mem: {result.search_metrics.memory_peak_gb} GB</div>
                    <div>GPU Util: {result.search_metrics.gpu_utilization_pct}%</div>
                    <div>Ops/sec: {result.search_metrics.operations_per_second}</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {renderJson(result)}
          </div>
        );

      case "multiobj":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Multi-Objective Pareto Search</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {renderMetric("Pareto Solutions", result.pareto_statistics?.total_pareto_solutions)}
                {renderMetric("Frontier Diversity", result.pareto_statistics?.frontier_diversity)}
                {renderMetric("Hypervolume", result.pareto_statistics?.hypervolume_final)}
                {renderMetric("Convergence Gen", result.pareto_statistics?.convergence_generation)}
                {result.automl_alignment && (
                  <div className="mt-2 p-3 bg-green-950/30 rounded-lg">
                    <div className="text-xs font-semibold text-green-300">AutoML Alignment</div>
                    <div className="text-xs mt-1">Objective: {result.automl_alignment.automl_objective}</div>
                    <div className="text-xs">Efficiency Gain: {result.automl_alignment.search_efficiency_gain}x</div>
                  </div>
                )}
              </CardContent>
            </Card>
            {result.pareto_frontier && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Pareto Frontier ({result.pareto_frontier.length} solutions)</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-1">Arch ID</th>
                          <th className="text-left p-1">Cell</th>
                          <th className="text-right p-1">Accuracy</th>
                          <th className="text-right p-1">Params</th>
                          <th className="text-right p-1">Fairness</th>
                          <th className="text-right p-1">Robust</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.pareto_frontier.slice(0, 10).map((a: any) => (
                          <tr key={a.arch_id} className="border-b border-gray-800 hover:bg-gray-900">
                            <td className="p-1 text-cyan-400">{a.arch_id}</td>
                            <td className="p-1">{a.architecture?.cell_type}</td>
                            <td className="p-1 text-right text-green-400">{a.objectives?.accuracy?.toFixed(4)}</td>
                            <td className="p-1 text-right">{a.objectives?.params?.toLocaleString()}</td>
                            <td className="p-1 text-right text-blue-400">{a.objectives?.fairness?.toFixed(4)}</td>
                            <td className="p-1 text-right text-purple-400">{a.objectives?.robustness?.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
            {renderJson(result)}
          </div>
        );

      case "predictor":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Performance Predictor</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.predictor_metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="bg-gray-900 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">RMSE</div>
                      <div className="text-sm font-bold">{result.predictor_metrics.validation_rmse}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Kendall τ</div>
                      <div className="text-sm font-bold">{result.predictor_metrics.kendall_tau}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Spearman ρ</div>
                      <div className="text-sm font-bold">{result.predictor_metrics.spearman_rho}</div>
                    </div>
                  </div>
                )}
                {result.ranking_analysis && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div>Top-5 Avg Accuracy: {result.ranking_analysis.top5_accuracy}</div>
                    <div>High Confidence Count: {result.ranking_analysis.high_confidence_count}</div>
                    <div>Speedup vs Full Eval: {result.ranking_analysis.speedup_vs_full_eval}x</div>
                  </div>
                )}
              </CardContent>
            </Card>
            {result.predictions && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Top Predictions ({result.predictions.length})</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {result.predictions.slice(0, 8).map((p: any) => (
                      <div key={p.arch_id} className="flex items-center gap-2 text-xs bg-gray-900 p-2 rounded">
                        <span className="text-yellow-400 w-6">#{p.rank}</span>
                        <span className="text-cyan-400 flex-1">{p.arch_id}</span>
                        <span className="text-green-400">Acc: {p.predicted_accuracy}</span>
                        <span className="text-blue-400">Conf: {p.confidence}</span>
                        {p.exceeds_threshold && <Badge className="text-xs bg-green-800">✓</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {renderJson(result)}
          </div>
        );

      case "progressive":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Progressive Evolution</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {result.progressive_metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="bg-gray-900 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Total Stages</div>
                      <div className="text-lg font-bold">{result.progressive_metrics.total_stages}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Total Improvement</div>
                      <div className="text-lg font-bold text-green-400">+{result.progressive_metrics.total_improvement}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Budget Util</div>
                      <div className="text-lg font-bold text-blue-400">{result.progressive_metrics.budget_utilization}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {result.evolution_path && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Evolution Path</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.evolution_path.map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-900 p-2 rounded">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold">
                          {s.stage_index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-cyan-400">{s.stage}</div>
                          <div className="text-xs text-gray-400">
                            Candidates: {s.num_candidates_evaluated} | Best: {s.best_accuracy} | Δ: +{s.improvement_over_prev}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">{s.compute_cost}s</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {renderJson(result)}
          </div>
        );

      case "transfer":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Cross-Task Transfer</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {renderMetric("Source Task", result.source_task)}
                {renderMetric("Target Task", result.target_task)}
                {renderMetric("Transfer Mode", result.transfer_mode)}
                {result.effectiveness && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    <div className="bg-gray-900 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Zero-Shot</div>
                      <div className="text-sm font-bold">{result.effectiveness.zero_shot_accuracy}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Final</div>
                      <div className="text-sm font-bold text-green-400">{result.effectiveness.final_accuracy}</div>
                    </div>
                    <div className="bg-gray-900 p-2 rounded text-center">
                      <div className="text-xs text-gray-400">Task Similarity</div>
                      <div className="text-sm font-bold text-blue-400">{result.effectiveness.task_similarity}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            {result.mode_comparison && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Mode Comparison</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {result.mode_comparison.map((m: any) => (
                      <div key={m.mode} className={`flex items-center gap-2 text-xs p-2 rounded ${m.recommended ? "bg-green-950/30 border border-green-800" : "bg-gray-900"}`}>
                        <span className={m.recommended ? "text-green-400 font-bold" : "text-gray-400"}>{m.mode}</span>
                        <span className="flex-1">Acc: {m.expected_accuracy} | Cost: {m.compute_cost} | Data: {m.data_requirement}</span>
                        {m.recommended && <Badge className="text-xs bg-green-800">Recommended</Badge>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {renderJson(result)}
          </div>
        );

      case "report":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">NAS v3 Comprehensive Report</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {renderMetric("Version", result.version)}
                {renderMetric("Overall Score", result.overall_score)}
                {result.capability_space && (
                  <div className="text-xs mt-2">
                    Total Configurations: {result.capability_space.total_configurations?.toLocaleString()}
                    ({result.capability_space.cell_types} cells × {result.capability_space.search_methods} methods × {result.capability_space.objectives} objectives × {result.capability_space.predictors} predictors × {result.capability_space.stages} stages × {result.capability_space.transfer_modes} transfers)
                  </div>
                )}
              </CardContent>
            </Card>
            {result.comparison_with_v2 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">vs NAS v2 Comparison</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-1 text-xs">
                    <div>Search Efficiency: {result.comparison_with_v2.search_efficiency}</div>
                    <div>Accuracy Gain: {result.comparison_with_v2.accuracy_gain}</div>
                    <div>Compute Savings: {result.comparison_with_v2.compute_savings}</div>
                    <div>New Capabilities: {result.comparison_with_v2.new_capabilities?.join(", ")}</div>
                  </div>
                </CardContent>
              </Card>
            )}
            {renderJson(result)}
          </div>
        );

      default:
        return renderJson(result);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Graph NAS v3 Engine
        </h1>
        <p className="text-sm text-gray-400 mt-1">AutoML-Driven Multi-Objective Neural Architecture Search</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="space" className="text-xs">Space</TabsTrigger>
          <TabsTrigger value="darts" className="text-xs">DARTS</TabsTrigger>
          <TabsTrigger value="multiobj" className="text-xs">Multi-Obj</TabsTrigger>
          <TabsTrigger value="predictor" className="text-xs">Predictor</TabsTrigger>
          <TabsTrigger value="progressive" className="text-xs">Progressive</TabsTrigger>
          <TabsTrigger value="transfer" className="text-xs">Transfer</TabsTrigger>
          <TabsTrigger value="report" className="text-xs">Report</TabsTrigger>
        </TabsList>

        {/* Search Space Tab */}
        <TabsContent value="space">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AutoML-Guided Search Space</CardTitle>
              <CardDescription>Define architecture search space with AutoML v3 meta-pruning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Cell Type</Label>
                  <select className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm" value={cellType} onChange={e => setCellType(e.target.value)}>
                    {CELL_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Max Operations</Label>
                  <Input className="mt-1" value={maxOps} onChange={e => setMaxOps(e.target.value)} />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={automlGuided} onChange={e => setAutomlGuided(e.target.checked)} />
                    AutoML Guided
                  </label>
                </div>
              </div>
              <Button onClick={() => callApi("search-space", { cell_types: [cellType], automl_guided: automlGuided, max_operations: parseInt(maxOps) })} disabled={loading}>
                {loading ? "Searching..." : "Define Search Space"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DARTS Tab */}
        <TabsContent value="darts">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Differentiable Architecture Search</CardTitle>
              <CardDescription>DARTS/SNAS/GDARTS/PDARTS/FBNet continuous relaxation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Search Method</Label>
                  <select className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm" value={searchMethod} onChange={e => setSearchMethod(e.target.value)}>
                    {SEARCH_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Epochs</Label>
                  <Input className="mt-1" type="number" value={numEpochs} onChange={e => setNumEpochs(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Fairness Weight</Label>
                  <Input className="mt-1" value={fairnessWeight} onChange={e => setFairnessWeight(e.target.value)} />
                </div>
              </div>
              <Button onClick={() => callApi("darts", { search_method: searchMethod, num_epochs: parseInt(numEpochs), fairness_weight: parseFloat(fairnessWeight) })} disabled={loading}>
                {loading ? "Searching..." : "Run DARTS Search"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Objective Tab */}
        <TabsContent value="multiobj">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Multi-Objective Pareto Search</CardTitle>
              <CardDescription>Evolutionary multi-objective search with Pareto frontier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Population Size</Label>
                  <Input className="mt-1" type="number" value={populationSize} onChange={e => setPopulationSize(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Generations</Label>
                  <Input className="mt-1" type="number" value={numGenerations} onChange={e => setNumGenerations(e.target.value)} />
                </div>
              </div>
              <Button onClick={() => callApi("multi-objective", { population_size: parseInt(populationSize), num_generations: parseInt(numGenerations) })} disabled={loading}>
                {loading ? "Searching..." : "Run Multi-Objective Search"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictor Tab */}
        <TabsContent value="predictor">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Architecture Performance Predictor</CardTitle>
              <CardDescription>Surrogate model for fast architecture evaluation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Predictor Type</Label>
                  <select className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm" value={predictorType} onChange={e => setPredictorType(e.target.value)}>
                    {PREDICTOR_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Training Architectures</Label>
                  <Input className="mt-1" type="number" value={trainingArchs} onChange={e => setTrainingArchs(e.target.value)} />
                </div>
              </div>
              <Button onClick={() => callApi("predictor", { predictor_type: predictorType, training_archs: parseInt(trainingArchs) })} disabled={loading}>
                {loading ? "Training..." : "Train Predictor"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progressive Tab */}
        <TabsContent value="progressive">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Progressive Architecture Evolution</CardTitle>
              <CardDescription>Evolve from simple to complex architectures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Start Stage</Label>
                  <select className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm" value={startStage} onChange={e => setStartStage(e.target.value)}>
                    {PROGRESSIVE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">End Stage</Label>
                  <select className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm" value={endStage} onChange={e => setEndStage(e.target.value)}>
                    {PROGRESSIVE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={automlPipelined} onChange={e => setAutomlPipelined(e.target.checked)} />
                    AutoML Pipelined
                  </label>
                </div>
              </div>
              <Button onClick={() => callApi("progressive", { start_stage: startStage, end_stage: endStage, automl_pipelined: automlPipelined })} disabled={loading}>
                {loading ? "Evolving..." : "Run Progressive Evolution"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfer Tab */}
        <TabsContent value="transfer">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Cross-Task Architecture Transfer</CardTitle>
              <CardDescription>Transfer architecture knowledge across graph tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Source Task</Label>
                  <Input className="mt-1" value={sourceTask} onChange={e => setSourceTask(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Target Task</Label>
                  <Input className="mt-1" value={targetTask} onChange={e => setTargetTask(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Transfer Mode</Label>
                  <select className="w-full mt-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm" value={transferMode} onChange={e => setTransferMode(e.target.value)}>
                    {TRANSFER_MODES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <Button onClick={() => callApi("transfer", { source_task: sourceTask, target_task: targetTask, transfer_mode: transferMode })} disabled={loading}>
                {loading ? "Transferring..." : "Run Transfer"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Comprehensive NAS v3 Report</CardTitle>
              <CardDescription>Full integration report across all v1.189-v1.203 engines</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => callApi("report", {})} disabled={loading}>
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {result && (
        <div className="mt-6">
          {renderResults()}
        </div>
      )}
    </div>
  );
}
