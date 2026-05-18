"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const SEARCH_STRATEGIES = [
  { value: "random_search", label: "Random Search", desc: "Uniform random sampling" },
  { value: "bayesian", label: "Bayesian Opt", desc: "Gaussian process surrogate" },
  { value: "evolutionary", label: "Evolutionary", desc: "Mutation + selection" },
  { value: "hyperband", label: "HyperBand", desc: "Successive halving" },
  { value: "bohb", label: "BOHB", desc: "Bayesian + HyperBand" },
  { value: "grid_search", label: "Grid Search", desc: "Exhaustive grid" },
];

const OBJECTIVES = [
  { value: "composite", label: "Composite", desc: "Weighted multi-metric" },
  { value: "accuracy", label: "Accuracy" },
  { value: "privacy_utility", label: "Privacy-Utility" },
  { value: "uncertainty_quality", label: "Uncertainty Quality" },
  { value: "robustness", label: "Robustness" },
];

export default function GraphAutoMLPage() {
  const [activeTab, setActiveTab] = useState("search");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  // Search params
  const [strategy, setStrategy] = useState("bayesian");
  const [numTrials, setNumTrials] = useState(20);
  const [objective, setObjective] = useState("composite");

  // Multi-objective params
  const [moTrials, setMoTrials] = useState(30);

  // Pipeline params
  const [numNodes, setNumNodes] = useState(1000);
  const [taskType, setTaskType] = useState("node_classification");
  const [maxTime, setMaxTime] = useState(30);
  const [privacyReq, setPrivacyReq] = useState("moderate");

  // Ensemble params
  const [ensModels, setEnsModels] = useState(5);
  const [ensStrategy, setEnsStrategy] = useState("diversity_weighted");

  // Early stop params
  const [stopStrategy, setStopStrategy] = useState("patience");
  const [patience, setPatience] = useState(10);
  const [minImprovement, setMinImprovement] = useState(0.001);
  const [maxEpochs, setMaxEpochs] = useState(100);
  const [numConfigs, setNumConfigs] = useState(5);

  // Benchmark params
  const [benchTrials, setBenchTrials] = useState(15);

  const callAPI = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSpace = () => callAPI("/automl/search-space", { graph_id: graphId });

  const handleSearch = () => callAPI("/automl/search", {
    graph_id: graphId, strategy, num_trials: numTrials, objective
  });

  const handleMultiObjective = () => callAPI("/automl/multi-objective", {
    graph_id: graphId, objectives: ["private_accuracy", "privacy_score", "uncertainty_ece"], num_trials: moTrials
  });

  const handlePipeline = () => callAPI("/automl/pipeline", {
    graph_id: graphId, num_nodes: numNodes, task_type: taskType,
    max_time_minutes: maxTime, privacy_requirement: privacyReq
  });

  const handleEnsemble = () => callAPI("/automl/ensemble", {
    graph_id: graphId, num_models: ensModels, strategy: ensStrategy
  });

  const handleEarlyStop = () => callAPI("/automl/early-stop", {
    graph_id: graphId, strategy: stopStrategy, patience_epochs: patience,
    min_improvement: minImprovement, max_epochs: maxEpochs, num_configs: numConfigs
  });

  const handleBenchmark = () => callAPI("/automl/benchmark", {
    graph_id: graphId, num_trials: benchTrials,
    strategies: ["random_search", "bayesian", "evolutionary", "hyperband"]
  });

  const renderResultPanel = () => {
    if (!result) return null;
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">AutoML Result</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-[400px]">
            {JSON.stringify(result, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph AutoML Pipeline</h1>
          <p className="text-muted-foreground text-sm">
            Automated search for optimal model + privacy + uncertainty + robustness configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Graph ID</Label>
          <Input value={graphId} onChange={e => setGraphId(e.target.value)} className="w-32 h-8 text-xs" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="search">HPO Search</TabsTrigger>
          <TabsTrigger value="multi-obj">Multi-Objective</TabsTrigger>
          <TabsTrigger value="pipeline">Full Pipeline</TabsTrigger>
          <TabsTrigger value="ensemble">Ensemble & Stop</TabsTrigger>
        </TabsList>

        {/* Tab 1: HPO Search */}
        <TabsContent value="search" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Space */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Search Space</CardTitle>
                  <Badge className="bg-slate-700 text-slate-200 text-xs">3.4T+ configs</Badge>
                </div>
                <CardDescription className="text-xs">
                  Inspect the full search space spanning architecture, privacy, uncertainty, training
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSearchSpace} disabled={loading} size="sm" className="w-full">Inspect Search Space</Button>
              </CardContent>
            </Card>

            {/* Search Execution */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Run HPO Search</CardTitle>
                  <Badge className="bg-blue-900 text-blue-200 text-xs">Search</Badge>
                </div>
                <CardDescription className="text-xs">
                  Execute automated hyperparameter optimization with chosen strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Strategy</Label>
                    <select value={strategy} onChange={e => setStrategy(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {SEARCH_STRATEGIES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Objective</Label>
                    <select value={objective} onChange={e => setObjective(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      {OBJECTIVES.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Num Trials</Label>
                  <Input type="number" value={numTrials} onChange={e => setNumTrials(+e.target.value)} className="h-8 text-xs" min={5} max={200} />
                </div>
                <Button onClick={handleSearch} disabled={loading} size="sm" className="w-full">Run AutoML Search</Button>
              </CardContent>
            </Card>
          </div>

          {/* Strategy descriptions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Search Strategies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {SEARCH_STRATEGIES.map(s => (
                  <div key={s.value} className={`p-2 rounded ${strategy === s.value ? "bg-blue-900/30 border border-blue-700" : "bg-muted/50"}`}>
                    <div className="font-medium">{s.label}</div>
                    <div className="text-muted-foreground">{s.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 2: Multi-Objective */}
        <TabsContent value="multi-obj" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Pareto-Optimal Search</CardTitle>
                  <Badge className="bg-green-900 text-green-200 text-xs">Multi-Obj</Badge>
                </div>
                <CardDescription className="text-xs">
                  Find Pareto front across accuracy, privacy score, and uncertainty calibration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="text-xs bg-blue-900 text-blue-200">Accuracy ↑</Badge>
                  <Badge className="text-xs bg-green-900 text-green-200">Privacy Score ↑</Badge>
                  <Badge className="text-xs bg-purple-900 text-purple-200">Uncertainty ECE ↓</Badge>
                </div>
                <div>
                  <Label className="text-xs">Num Trials</Label>
                  <Input type="number" value={moTrials} onChange={e => setMoTrials(+e.target.value)} className="h-8 text-xs" min={10} max={100} />
                </div>
                <Button onClick={handleMultiObjective} disabled={loading} size="sm" className="w-full">Find Pareto Front</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Multi-Objective Tradeoffs</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>The Pareto front reveals configurations where no single objective can be improved without sacrificing another.</p>
                <div className="mt-2 space-y-1">
                  <p className="font-medium text-foreground">Extreme Points:</p>
                  <p>• Best Accuracy — highest private accuracy</p>
                  <p>• Best Privacy — strongest DP guarantee</p>
                  <p>• Best Uncertainty — lowest ECE calibration</p>
                  <p>• Knee Point — best overall tradeoff</p>
                </div>
                <div className="mt-2 pt-2 border-t">
                  <p className="font-medium text-foreground">Objectives integrate v1.89-v1.92:</p>
                  <p>• Accuracy ← architecture search + training</p>
                  <p>• Privacy Score ← differential privacy (v1.92)</p>
                  <p>• Uncertainty ECE ← calibration quality (v1.90)</p>
                </div>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 3: Full Pipeline */}
        <TabsContent value="pipeline" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Full AutoML Pipeline</CardTitle>
                <Badge className="bg-amber-900 text-amber-200 text-xs">End-to-End</Badge>
              </div>
              <CardDescription className="text-xs">
                Complete pipeline: Preprocess → Architecture Search → Private Training → Evaluation → Deployment Recommendation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Num Nodes</Label>
                  <Input type="number" value={numNodes} onChange={e => setNumNodes(+e.target.value)} className="h-8 text-xs" min={100} />
                </div>
                <div>
                  <Label className="text-xs">Task Type</Label>
                  <select value={taskType} onChange={e => setTaskType(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                    <option value="node_classification">Node Classification</option>
                    <option value="graph_classification">Graph Classification</option>
                    <option value="link_prediction">Link Prediction</option>
                    <option value="edge_classification">Edge Classification</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Max Time (min)</Label>
                  <Input type="number" value={maxTime} onChange={e => setMaxTime(+e.target.value)} className="h-8 text-xs" min={5} max={120} />
                </div>
                <div>
                  <Label className="text-xs">Privacy Level</Label>
                  <select value={privacyReq} onChange={e => setPrivacyReq(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                    <option value="strict">Strict (ε≤1)</option>
                    <option value="moderate">Moderate (ε≤3)</option>
                    <option value="relaxed">Relaxed (ε≤10)</option>
                  </select>
                </div>
              </div>
              <Button onClick={handlePipeline} disabled={loading} size="sm" className="w-full">Run Full Pipeline</Button>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 4: Ensemble & Early Stop */}
        <TabsContent value="ensemble" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ensemble */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Auto-Ensemble</CardTitle>
                  <Badge className="bg-pink-900 text-pink-200 text-xs">Ensemble</Badge>
                </div>
                <CardDescription className="text-xs">
                  Automatically construct diverse ensemble from best configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Num Models</Label>
                    <Input type="number" value={ensModels} onChange={e => setEnsModels(+e.target.value)} className="h-8 text-xs" min={2} max={10} />
                  </div>
                  <div>
                    <Label className="text-xs">Strategy</Label>
                    <select value={ensStrategy} onChange={e => setEnsStrategy(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="diversity_weighted">Diversity Weighted</option>
                      <option value="top_k">Top-K</option>
                      <option value="greedy">Greedy Selection</option>
                      <option value="caruana">Caruana Ensemble</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleEnsemble} disabled={loading} size="sm" className="w-full">Build Ensemble</Button>
              </CardContent>
            </Card>

            {/* Early Stop */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Early Stopping</CardTitle>
                  <Badge className="bg-teal-900 text-teal-200 text-xs">Efficiency</Badge>
                </div>
                <CardDescription className="text-xs">
                  Stop underperforming configurations early to save compute budget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Strategy</Label>
                    <select value={stopStrategy} onChange={e => setStopStrategy(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="patience">Patience</option>
                      <option value="decay">Decay</option>
                      <option value="curve_fit">Curve Fit</option>
                      <option value="median_stop">Median Stop</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Patience</Label>
                    <Input type="number" value={patience} onChange={e => setPatience(+e.target.value)} className="h-8 text-xs" min={3} max={30} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Min Δ</Label>
                    <Input type="number" value={minImprovement} onChange={e => setMinImprovement(+e.target.value)} className="h-8 text-xs" step={0.001} />
                  </div>
                  <div>
                    <Label className="text-xs">Max Epochs</Label>
                    <Input type="number" value={maxEpochs} onChange={e => setMaxEpochs(+e.target.value)} className="h-8 text-xs" min={10} max={500} />
                  </div>
                  <div>
                    <Label className="text-xs">Configs</Label>
                    <Input type="number" value={numConfigs} onChange={e => setNumConfigs(+e.target.value)} className="h-8 text-xs" min={2} max={20} />
                  </div>
                </div>
                <Button onClick={handleEarlyStop} disabled={loading} size="sm" className="w-full">Run Early Stop Analysis</Button>
              </CardContent>
            </Card>
          </div>

          {/* Benchmark */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Strategy Benchmark</CardTitle>
                <Badge className="bg-red-900 text-red-200 text-xs">Compare All</Badge>
              </div>
              <CardDescription className="text-xs">
                Compare Random, Bayesian, Evolutionary, HyperBand across accuracy, convergence, speed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Trials per Strategy</Label>
                  <Input type="number" value={benchTrials} onChange={e => setBenchTrials(+e.target.value)} className="h-8 text-xs" min={5} max={50} />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleBenchmark} disabled={loading} size="sm" className="w-full">Run Benchmark</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">Running AutoML search...</div>
      )}
      {error && (
        <Card className="border-red-500/50">
          <CardContent className="pt-4">
            <p className="text-sm text-red-500">Error: {error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
