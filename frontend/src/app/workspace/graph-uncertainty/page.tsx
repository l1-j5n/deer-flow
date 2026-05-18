"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const UNCERTAINTY_METHODS = [
  { value: "mc_dropout", label: "MC Dropout", desc: "Stochastic forward passes", color: "bg-blue-900 text-blue-200" },
  { value: "deep_ensemble", label: "Deep Ensemble", desc: "Multi-model disagreement", color: "bg-green-900 text-green-200" },
  { value: "bayesian_gnn", label: "Bayesian GNN", desc: "Variational inference", color: "bg-purple-900 text-purple-200" },
  { value: "evidential", label: "Evidential DL", desc: "Dirichlet prior", color: "bg-orange-900 text-orange-200" },
  { value: "mc_gnn", label: "MC-GNN", desc: "Node+Edge dropout", color: "bg-pink-900 text-pink-200" },
  { value: "dropout_bnn", label: "Dropout BNN", desc: "Weight uncertainty", color: "bg-cyan-900 text-cyan-200" },
];

const CALIBRATION_METHODS = [
  { value: "temperature_scaling", label: "Temperature Scaling" },
  { value: "platt_scaling", label: "Platt Scaling" },
  { value: "isotonic_regression", label: "Isotonic Regression" },
  { value: "beta_calibration", label: "Beta Calibration" },
  { value: "histogram_binning", label: "Histogram Binning" },
];

export default function GraphUncertaintyPage() {
  const [activeTab, setActiveTab] = useState("methods");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  // MC Dropout params
  const [mcPasses, setMcPasses] = useState(20);
  const [mcDropout, setMcDropout] = useState(0.5);
  const [mcBatchNorm, setMcBatchNorm] = useState(true);

  // Ensemble params
  const [ensModels, setEnsModels] = useState(5);
  const [ensDiversity, setEnsDiversity] = useState("entropy");
  const [ensWeightAvg, setEnsWeightAvg] = useState(true);

  // Bayesian GNN params
  const [bayesSamples, setBayesSamples] = useState(50);
  const [bayesPrior, setBayesPrior] = useState("gaussian");
  const [bayesKLWeight, setBayesKLWeight] = useState(0.1);
  const [bayesPosterior, setBayesPosterior] = useState("mean_field");

  // Evidential params
  const [evEvidence, setEvEvidence] = useState("dense");
  const [evRegularization, setEvRegularization] = useState(0.1);
  const [evSamples, setEvSamples] = useState(100);

  // MC-GNN params
  const [mcgnnPasses, setMcgnnPasses] = useState(20);
  const [mcgnnNodeDrop, setMcgnnNodeDrop] = useState(0.3);
  const [mcgnnEdgeDrop, setMcgnnEdgeDrop] = useState(0.2);
  const [mcgnnMsgSteps, setMcgnnMsgSteps] = useState(3);

  // Dropout BNN params
  const [bnnPasses, setBnnPasses] = useState(30);
  const [bnnDropType, setBnnDropType] = useState("standard");
  const [bnnDropRate, setBnnDropRate] = useState(0.5);
  const [bnnLayers, setBnnLayers] = useState(3);
  const [bnnHidden, setBnnHidden] = useState(64);

  // Shared params
  const [numClasses, setNumClasses] = useState(5);

  // Calibration params
  const [calibMethod, setCalibMethod] = useState("temperature_scaling");
  const [calibBins, setCalibBins] = useState(15);
  const [calibTemp, setCalibTemp] = useState(1.0);
  const [calibSamples, setCalibSamples] = useState(100);

  // Benchmark params
  const [benchTrials, setBenchTrials] = useState(10);

  // Multi-method params
  const [selectedMethods, setSelectedMethods] = useState(["mc_dropout", "deep_ensemble", "evidential", "bayesian_gnn"]);

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

  const handleMCDropout = () => callAPI("/uncertainty/mc-dropout", {
    graph_id: graphId, num_forward_passes: mcPasses, dropout_rate: mcDropout, num_classes: numClasses, use_mc_batchnorm: mcBatchNorm
  });

  const handleEnsemble = () => callAPI("/uncertainty/deep-ensemble", {
    graph_id: graphId, num_models: ensModels, num_classes: numClasses, diversity_metric: ensDiversity, use_weight_averaging: ensWeightAvg
  });

  const handleBayesian = () => callAPI("/uncertainty/bayesian-gnn", {
    graph_id: graphId, num_samples: bayesSamples, prior_type: bayesPrior, num_classes: numClasses, kl_weight: bayesKLWeight, posterior_type: bayesPosterior
  });

  const handleEvidential = () => callAPI("/uncertainty/evidential", {
    graph_id: graphId, num_classes: numClasses, evidence_type: evEvidence, regularization: evRegularization, num_samples: evSamples
  });

  const handleMCGNN = () => callAPI("/uncertainty/mc-gnn", {
    graph_id: graphId, num_forward_passes: mcgnnPasses, node_dropout: mcgnnNodeDrop, edge_dropout: mcgnnEdgeDrop, num_classes: numClasses, message_passing_steps: mcgnnMsgSteps
  });

  const handleDropoutBNN = () => callAPI("/uncertainty/dropout-bnn", {
    graph_id: graphId, num_forward_passes: bnnPasses, dropout_type: bnnDropType, dropout_rate: bnnDropRate, num_layers: bnnLayers, hidden_dim: bnnHidden, num_classes: numClasses
  });

  const handleCalibrate = () => callAPI("/uncertainty/calibrate", {
    graph_id: graphId, calibration_method: calibMethod, num_bins: calibBins, temperature: calibTemp, num_samples: calibSamples
  });

  const handleMultiMethod = () => callAPI("/uncertainty/multi-method", {
    graph_id: graphId, methods: selectedMethods, num_classes: numClasses
  });

  const handleBenchmark = () => callAPI("/uncertainty/benchmark", {
    graph_id: graphId, num_trials: benchTrials, num_classes: numClasses
  });

  const toggleMethod = (method: string) => {
    setSelectedMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const renderUncertaintyBadges = (uncertainties: Record<string, number>) => {
    if (!uncertainties) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(uncertainties).map(([key, val]) => (
          <Badge key={key} className="text-xs bg-slate-800 text-slate-200">
            {key}: {typeof val === "number" ? val.toFixed(4) : val}
          </Badge>
        ))}
      </div>
    );
  };

  const renderResultPanel = () => {
    if (!result) return null;
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Estimation Result</CardTitle>
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
          <h1 className="text-2xl font-bold">Graph Uncertainty Estimation</h1>
          <p className="text-muted-foreground text-sm">
            Predictive and epistemic uncertainty quantification for GNNs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Graph ID</Label>
          <Input value={graphId} onChange={e => setGraphId(e.target.value)} className="w-32 h-8 text-xs" />
          <Label className="text-xs ml-2">Classes</Label>
          <Input type="number" value={numClasses} onChange={e => setNumClasses(+e.target.value)} className="w-20 h-8 text-xs" min={2} max={20} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="methods">Sampling Methods</TabsTrigger>
          <TabsTrigger value="bayesian">Bayesian & Evidential</TabsTrigger>
          <TabsTrigger value="calibration">Calibration</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
        </TabsList>

        {/* Tab 1: Sampling Methods */}
        <TabsContent value="methods" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MC Dropout */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">MC Dropout</CardTitle>
                  <Badge className="bg-blue-900 text-blue-200 text-xs">Stochastic</Badge>
                </div>
                <CardDescription className="text-xs">
                  Multiple forward passes with dropout enabled at inference time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Forward Passes</Label>
                    <Input type="number" value={mcPasses} onChange={e => setMcPasses(+e.target.value)} className="h-8 text-xs" min={5} max={100} />
                  </div>
                  <div>
                    <Label className="text-xs">Dropout Rate</Label>
                    <Input type="number" value={mcDropout} onChange={e => setMcDropout(+e.target.value)} className="h-8 text-xs" step={0.1} min={0.1} max={0.9} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={mcBatchNorm} onChange={e => setMcBatchNorm(e.target.checked)} />
                  <Label className="text-xs">MC BatchNorm</Label>
                </div>
                <Button onClick={handleMCDropout} disabled={loading} size="sm" className="w-full">Run MC Dropout</Button>
              </CardContent>
            </Card>

            {/* Deep Ensemble */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Deep Ensemble</CardTitle>
                  <Badge className="bg-green-900 text-green-200 text-xs">Multi-Model</Badge>
                </div>
                <CardDescription className="text-xs">
                  Independent model predictions with disagreement analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Num Models</Label>
                    <Input type="number" value={ensModels} onChange={e => setEnsModels(+e.target.value)} className="h-8 text-xs" min={2} max={20} />
                  </div>
                  <div>
                    <Label className="text-xs">Diversity Metric</Label>
                    <select value={ensDiversity} onChange={e => setEnsDiversity(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="entropy">Entropy</option>
                      <option value="kl_divergence">KL Divergence</option>
                      <option value="cosine_distance">Cosine Distance</option>
                      <option value="js_divergence">JS Divergence</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={ensWeightAvg} onChange={e => setEnsWeightAvg(e.target.checked)} />
                  <Label className="text-xs">Weight Averaging</Label>
                </div>
                <Button onClick={handleEnsemble} disabled={loading} size="sm" className="w-full">Run Deep Ensemble</Button>
              </CardContent>
            </Card>

            {/* MC-GNN */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">MC-GNN</CardTitle>
                  <Badge className="bg-pink-900 text-pink-200 text-xs">Graph-Aware</Badge>
                </div>
                <CardDescription className="text-xs">
                  Node + edge dropout for graph-structured stochastic inference
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Forward Passes</Label>
                    <Input type="number" value={mcgnnPasses} onChange={e => setMcgnnPasses(+e.target.value)} className="h-8 text-xs" min={5} max={50} />
                  </div>
                  <div>
                    <Label className="text-xs">Msg Passing Steps</Label>
                    <Input type="number" value={mcgnnMsgSteps} onChange={e => setMcgnnMsgSteps(+e.target.value)} className="h-8 text-xs" min={1} max={10} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Node Dropout</Label>
                    <Input type="number" value={mcgnnNodeDrop} onChange={e => setMcgnnNodeDrop(+e.target.value)} className="h-8 text-xs" step={0.05} min={0} max={0.9} />
                  </div>
                  <div>
                    <Label className="text-xs">Edge Dropout</Label>
                    <Input type="number" value={mcgnnEdgeDrop} onChange={e => setMcgnnEdgeDrop(+e.target.value)} className="h-8 text-xs" step={0.05} min={0} max={0.9} />
                  </div>
                </div>
                <Button onClick={handleMCGNN} disabled={loading} size="sm" className="w-full">Run MC-GNN</Button>
              </CardContent>
            </Card>

            {/* Dropout BNN */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Dropout BNN</CardTitle>
                  <Badge className="bg-cyan-900 text-cyan-200 text-xs">Weight Uncertainty</Badge>
                </div>
                <CardDescription className="text-xs">
                  Bayesian Neural Network via dropout at inference
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Forward Passes</Label>
                    <Input type="number" value={bnnPasses} onChange={e => setBnnPasses(+e.target.value)} className="h-8 text-xs" min={5} max={100} />
                  </div>
                  <div>
                    <Label className="text-xs">Dropout Type</Label>
                    <select value={bnnDropType} onChange={e => setBnnDropType(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="standard">Standard</option>
                      <option value="variational">Variational</option>
                      <option value="concrete">Concrete</option>
                      <option value="locked">Locked</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Drop Rate</Label>
                    <Input type="number" value={bnnDropRate} onChange={e => setBnnDropRate(+e.target.value)} className="h-8 text-xs" step={0.1} />
                  </div>
                  <div>
                    <Label className="text-xs">Layers</Label>
                    <Input type="number" value={bnnLayers} onChange={e => setBnnLayers(+e.target.value)} className="h-8 text-xs" min={1} max={10} />
                  </div>
                  <div>
                    <Label className="text-xs">Hidden</Label>
                    <Input type="number" value={bnnHidden} onChange={e => setBnnHidden(+e.target.value)} className="h-8 text-xs" min={16} max={512} />
                  </div>
                </div>
                <Button onClick={handleDropoutBNN} disabled={loading} size="sm" className="w-full">Run Dropout BNN</Button>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 2: Bayesian & Evidential */}
        <TabsContent value="bayesian" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bayesian GNN */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Bayesian GNN</CardTitle>
                  <Badge className="bg-purple-900 text-purple-200 text-xs">Variational</Badge>
                </div>
                <CardDescription className="text-xs">
                  Variational inference with learnable weight distributions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Num Samples</Label>
                    <Input type="number" value={bayesSamples} onChange={e => setBayesSamples(+e.target.value)} className="h-8 text-xs" min={10} max={200} />
                  </div>
                  <div>
                    <Label className="text-xs">KL Weight</Label>
                    <Input type="number" value={bayesKLWeight} onChange={e => setBayesKLWeight(+e.target.value)} className="h-8 text-xs" step={0.01} min={0} max={1} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Prior Type</Label>
                    <select value={bayesPrior} onChange={e => setBayesPrior(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="gaussian">Gaussian</option>
                      <option value="laplace">Laplace</option>
                      <option value="spike_slab">Spike & Slab</option>
                      <option value="horseshoe">Horseshoe</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Posterior</Label>
                    <select value={bayesPosterior} onChange={e => setBayesPosterior(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="mean_field">Mean Field</option>
                      <option value="full_covariance">Full Covariance</option>
                      <option value="low_rank">Low Rank</option>
                      <option value="normalizing_flow">Normalizing Flow</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleBayesian} disabled={loading} size="sm" className="w-full">Run Bayesian GNN</Button>
              </CardContent>
            </Card>

            {/* Evidential Deep Learning */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Evidential Deep Learning</CardTitle>
                  <Badge className="bg-orange-900 text-orange-200 text-xs">Dirichlet</Badge>
                </div>
                <CardDescription className="text-xs">
                  Single-forward-pass uncertainty via Dirichlet prior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Evidence Type</Label>
                    <select value={evEvidence} onChange={e => setEvEvidence(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="dense">Dense</option>
                      <option value="sparse">Sparse</option>
                      <option value="relu">ReLU</option>
                      <option value="softplus">Softplus</option>
                      <option value="exp">Exp</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Regularization</Label>
                    <Input type="number" value={evRegularization} onChange={e => setEvRegularization(+e.target.value)} className="h-8 text-xs" step={0.01} min={0} max={1} />
                  </div>
                  <div>
                    <Label className="text-xs">Samples</Label>
                    <Input type="number" value={evSamples} onChange={e => setEvSamples(+e.target.value)} className="h-8 text-xs" min={10} max={1000} />
                  </div>
                </div>
                <Button onClick={handleEvidential} disabled={loading} size="sm" className="w-full">Run Evidential DL</Button>
              </CardContent>
            </Card>
          </div>

          {/* Multi-Method Comparison */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Multi-Method Comparison</CardTitle>
                <Badge className="bg-slate-700 text-slate-200 text-xs">Compare</Badge>
              </div>
              <CardDescription className="text-xs">
                Run selected methods simultaneously for direct comparison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {UNCERTAINTY_METHODS.map(m => (
                  <Badge
                    key={m.value}
                    className={`cursor-pointer text-xs ${selectedMethods.includes(m.value) ? m.color : "bg-slate-800 text-slate-400"}`}
                    onClick={() => toggleMethod(m.value)}
                  >
                    {m.label}
                  </Badge>
                ))}
              </div>
              <Button onClick={handleMultiMethod} disabled={loading || selectedMethods.length < 2} size="sm" className="w-full">
                Compare {selectedMethods.length} Methods
              </Button>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 3: Calibration */}
        <TabsContent value="calibration" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Uncertainty Calibration</CardTitle>
                  <Badge className="bg-amber-900 text-amber-200 text-xs">Calibrate</Badge>
                </div>
                <CardDescription className="text-xs">
                  Post-hoc calibration of uncertainty estimates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Calibration Method</Label>
                  <select value={calibMethod} onChange={e => setCalibMethod(e.target.value)} className="w-full h-8 text-xs border rounded px-2 mt-1">
                    {CALIBRATION_METHODS.map(cm => (
                      <option key={cm.value} value={cm.value}>{cm.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Num Bins</Label>
                    <Input type="number" value={calibBins} onChange={e => setCalibBins(+e.target.value)} className="h-8 text-xs" min={5} max={30} />
                  </div>
                  <div>
                    <Label className="text-xs">Temperature</Label>
                    <Input type="number" value={calibTemp} onChange={e => setCalibTemp(+e.target.value)} className="h-8 text-xs" step={0.1} />
                  </div>
                  <div>
                    <Label className="text-xs">Samples</Label>
                    <Input type="number" value={calibSamples} onChange={e => setCalibSamples(+e.target.value)} className="h-8 text-xs" min={50} max={10000} />
                  </div>
                </div>
                <Button onClick={handleCalibrate} disabled={loading} size="sm" className="w-full">Run Calibration</Button>
              </CardContent>
            </Card>

            {/* Calibration info card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Calibration Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="space-y-1.5">
                  {CALIBRATION_METHODS.map(cm => (
                    <div key={cm.value} className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs shrink-0">{cm.label}</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="font-medium text-foreground">Key Metrics:</p>
                  <p>ECE (Expected Calibration Error) — lower is better</p>
                  <p>NLL (Negative Log-Likelihood) — lower is better</p>
                  <p>Brier Score — lower is better</p>
                </div>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 4: Benchmark */}
        <TabsContent value="benchmark" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Uncertainty Benchmark</CardTitle>
                <Badge className="bg-red-900 text-red-200 text-xs">All Methods</Badge>
              </div>
              <CardDescription className="text-xs">
                Compare all 6 uncertainty methods with calibration metrics, ranking, and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Num Trials</Label>
                  <Input type="number" value={benchTrials} onChange={e => setBenchTrials(+e.target.value)} className="h-8 text-xs" min={5} max={50} />
                </div>
                <div className="flex items-end">
                  <Label className="text-xs text-muted-foreground">
                    Methods: MC Dropout, Ensemble, Bayesian, Evidential, MC-GNN, Dropout BNN
                  </Label>
                </div>
              </div>
              <Button onClick={handleBenchmark} disabled={loading} size="sm" className="w-full">
                Run Full Benchmark
              </Button>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">Computing uncertainty estimates...</div>
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
