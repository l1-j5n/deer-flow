"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const API_BASE = "";

const OOD_METHODS = [
  { value: "energy", label: "Energy-Based", desc: "Energy score detection", color: "bg-blue-900 text-blue-200" },
  { value: "mahalanobis", label: "Mahalanobis", desc: "Distance-based detection", color: "bg-green-900 text-green-200" },
  { value: "outlier_exposure", label: "Outlier Exposure", desc: "OE training", color: "bg-purple-900 text-purple-200" },
  { value: "ensemble", label: "Deep Ensemble", desc: "Disagreement-based", color: "bg-orange-900 text-orange-200" },
  { value: "graphde", label: "GraphDE Density", desc: "Density estimation", color: "bg-pink-900 text-pink-200" },
  { value: "gpn", label: "GPN Evidential", desc: "Uncertainty-aware", color: "bg-cyan-900 text-cyan-200" },
];

const SCORE_TYPES = [
  { value: "energy_score", label: "Energy Score" },
  { value: "msp", label: "Max Softmax Prob" },
  { value: "entropy", label: "Entropy" },
  { value: "odin", label: "ODIN" },
  { value: "likelihood", label: "Likelihood" },
  { value: "knn_distance", label: "KNN Distance" },
];

export default function GraphOODPage() {
  const [activeTab, setActiveTab] = useState("methods");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  // Energy params
  const [temperature, setTemperature] = useState(1.0);
  const [energyThreshold, setEnergyThreshold] = useState(-10.0);

  // Mahalanobis params
  const [featureLayer, setFeatureLayer] = useState("hidden1");
  const [useRelative, setUseRelative] = useState(true);
  const [numClasses, setNumClasses] = useState(5);

  // Outlier Exposure params
  const [oeWeight, setOeWeight] = useState(0.5);
  const [oeTemperature, setOeTemperature] = useState(1.0);
  const [numOodClasses, setNumOodClasses] = useState(20);

  // Ensemble params
  const [numModels, setNumModels] = useState(5);
  const [diversityMetric, setDiversityMetric] = useState("entropy");

  // GraphDE params
  const [flowType, setFlowType] = useState("graph_nf");
  const [numFlowSteps, setNumFlowSteps] = useState(8);
  const [graphdeHidden, setGraphdeHidden] = useState(128);

  // GPN params
  const [evidenceDim, setEvidenceDim] = useState(64);
  const [gpnClasses, setGpnClasses] = useState(5);

  // Scoring params
  const [selectedScores, setSelectedScores] = useState(["energy_score", "msp", "entropy"]);
  const [numSamples, setNumSamples] = useState(10);

  // Benchmark params
  const [benchMethods, setBenchMethods] = useState("energy,mahalanobis,ensemble,gpn");

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

  const handleEnergy = () => callAPI("/ood/energy", {
    graph_id: graphId, temperature, threshold: energyThreshold, use_calibrated: false
  });

  const handleMahalanobis = () => callAPI("/ood/mahalanobis", {
    graph_id: graphId, feature_layer: featureLayer, use_relative: useRelative, num_classes: numClasses
  });

  const handleOutlierExposure = () => callAPI("/ood/outlier-exposure", {
    graph_id: graphId, oe_weight: oeWeight, oe_temperature: oeTemperature, num_ood_classes: numOodClasses
  });

  const handleEnsemble = () => callAPI("/ood/ensemble", {
    graph_id: graphId, num_models: numModels, diversity_metric: diversityMetric, use_mcdropout: false
  });

  const handleGraphDE = () => callAPI("/ood/graphde", {
    graph_id: graphId, flow_type: flowType, num_flow_steps: numFlowSteps, hidden_dim: graphdeHidden
  });

  const handleGPN = () => callAPI("/ood/gpn", {
    graph_id: graphId, evidence_dim: evidenceDim, num_classes: gpnClasses, learn_evidence: true
  });

  const handleScore = () => callAPI("/ood/score", {
    graph_id: graphId, score_types: selectedScores, num_samples: numSamples, use_ensemble: false
  });

  const handleBenchmark = () => callAPI("/ood/benchmark", {
    graph_id: graphId, methods: benchMethods.split(","), id_datasets: ["cora", "citeseer"], ood_datasets: ["pubmed", "flickr"]
  });

  const toggleScore = (score: string) => {
    setSelectedScores(prev =>
      prev.includes(score) ? prev.filter(s => s !== score) : [...prev, score]
    );
  };

  const renderStatCard = (label: string, value: string | number, color: string) => (
    <div className={`rounded-lg p-3 ${color}`}>
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-xl font-bold">{typeof value === "number" ? value.toFixed(4) : value}</div>
    </div>
  );

  const renderResultPanel = () => {
    if (!result) return null;
    const r = result as Record<string, unknown>;

    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Detection Result</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-[400px]">
            {JSON.stringify(r, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph OOD Detection</h1>
          <p className="text-muted-foreground text-sm">
            Out-of-Distribution detection for graph neural networks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Graph ID</Label>
          <Input value={graphId} onChange={e => setGraphId(e.target.value)} className="w-32 h-8 text-xs" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="methods">Methods</TabsTrigger>
          <TabsTrigger value="density">Density</TabsTrigger>
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
        </TabsList>

        {/* Tab 1: Methods */}
        <TabsContent value="methods" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Energy-Based */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Energy-Based OOD</CardTitle>
                  <Badge className="bg-blue-900 text-blue-200 text-xs">Energy</Badge>
                </div>
                <CardDescription className="text-xs">
                  Energy score: E(x) = -T·log Σexp(f(x)/T)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Temperature</Label>
                    <Input type="number" value={temperature} onChange={e => setTemperature(+e.target.value)} className="h-8 text-xs" step={0.1} />
                  </div>
                  <div>
                    <Label className="text-xs">Threshold</Label>
                    <Input type="number" value={energyThreshold} onChange={e => setEnergyThreshold(+e.target.value)} className="h-8 text-xs" step={1} />
                  </div>
                </div>
                <Button onClick={handleEnergy} disabled={loading} size="sm" className="w-full">Run Energy Detection</Button>
              </CardContent>
            </Card>

            {/* Mahalanobis */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Mahalanobis Distance</CardTitle>
                  <Badge className="bg-green-900 text-green-200 text-xs">Distance</Badge>
                </div>
                <CardDescription className="text-xs">
                  Class-conditional Gaussian modeling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Feature Layer</Label>
                    <Input value={featureLayer} onChange={e => setFeatureLayer(e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Num Classes</Label>
                    <Input type="number" value={numClasses} onChange={e => setNumClasses(+e.target.value)} className="h-8 text-xs" min={2} max={20} />
                  </div>
                  <div className="flex items-end gap-1">
                    <Label className="text-xs">Relative</Label>
                    <input type="checkbox" checked={useRelative} onChange={e => setUseRelative(e.target.checked)} className="mb-1.5" />
                  </div>
                </div>
                <Button onClick={handleMahalanobis} disabled={loading} size="sm" className="w-full">Run Mahalanobis Detection</Button>
              </CardContent>
            </Card>

            {/* Outlier Exposure */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Outlier Exposure</CardTitle>
                  <Badge className="bg-purple-900 text-purple-200 text-xs">OE</Badge>
                </div>
                <CardDescription className="text-xs">
                  Train with auxiliary OOD data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">OE Weight</Label>
                    <Input type="number" value={oeWeight} onChange={e => setOeWeight(+e.target.value)} className="h-8 text-xs" step={0.1} min={0} max={1} />
                  </div>
                  <div>
                    <Label className="text-xs">Temperature</Label>
                    <Input type="number" value={oeTemperature} onChange={e => setOeTemperature(+e.target.value)} className="h-8 text-xs" step={0.1} />
                  </div>
                  <div>
                    <Label className="text-xs">OOD Classes</Label>
                    <Input type="number" value={numOodClasses} onChange={e => setNumOodClasses(+e.target.value)} className="h-8 text-xs" min={5} max={100} />
                  </div>
                </div>
                <Button onClick={handleOutlierExposure} disabled={loading} size="sm" className="w-full">Run Outlier Exposure</Button>
              </CardContent>
            </Card>

            {/* Ensemble */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Deep Ensemble</CardTitle>
                  <Badge className="bg-orange-900 text-orange-200 text-xs">Ensemble</Badge>
                </div>
                <CardDescription className="text-xs">
                  Prediction disagreement = OOD signal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Num Models</Label>
                    <Input type="number" value={numModels} onChange={e => setNumModels(+e.target.value)} className="h-8 text-xs" min={2} max={20} />
                  </div>
                  <div>
                    <Label className="text-xs">Diversity</Label>
                    <select value={diversityMetric} onChange={e => setDiversityMetric(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="entropy">Entropy</option>
                      <option value="kl_divergence">KL Divergence</option>
                      <option value="cosine_distance">Cosine Distance</option>
                      <option value="js_divergence">JS Divergence</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleEnsemble} disabled={loading} size="sm" className="w-full">Run Ensemble Detection</Button>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 2: Density Methods */}
        <TabsContent value="density" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GraphDE */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">GraphDE Density</CardTitle>
                  <Badge className="bg-pink-900 text-pink-200 text-xs">Density</Badge>
                </div>
                <CardDescription className="text-xs">
                  Log-likelihood via normalizing flows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Flow Type</Label>
                    <select value={flowType} onChange={e => setFlowType(e.target.value)} className="w-full h-8 text-xs border rounded px-2">
                      <option value="graph_nf">Graph NF</option>
                      <option value="gnf">GNF</option>
                      <option value="graphflow">GraphFlow</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Flow Steps</Label>
                    <Input type="number" value={numFlowSteps} onChange={e => setNumFlowSteps(+e.target.value)} className="h-8 text-xs" min={2} max={32} />
                  </div>
                  <div>
                    <Label className="text-xs">Hidden Dim</Label>
                    <Input type="number" value={graphdeHidden} onChange={e => setGraphdeHidden(+e.target.value)} className="h-8 text-xs" min={32} max={512} />
                  </div>
                </div>
                <Button onClick={handleGraphDE} disabled={loading} size="sm" className="w-full">Run GraphDE Detection</Button>
              </CardContent>
            </Card>

            {/* GPN */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">GPN Evidential</CardTitle>
                  <Badge className="bg-cyan-900 text-cyan-200 text-xs">Evidential</Badge>
                </div>
                <CardDescription className="text-xs">
                  Dirichlet prior uncertainty decomposition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Evidence Dim</Label>
                    <Input type="number" value={evidenceDim} onChange={e => setEvidenceDim(+e.target.value)} className="h-8 text-xs" min={16} max={256} />
                  </div>
                  <div>
                    <Label className="text-xs">Num Classes</Label>
                    <Input type="number" value={gpnClasses} onChange={e => setGpnClasses(+e.target.value)} className="h-8 text-xs" min={2} max={20} />
                  </div>
                </div>
                <Button onClick={handleGPN} disabled={loading} size="sm" className="w-full">Run GPN Detection</Button>
              </CardContent>
            </Card>
          </div>

          {/* Method overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">OOD Detection Methods Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {OOD_METHODS.map(m => (
                  <div key={m.value} className="rounded-lg border p-2 text-center">
                    <Badge className={`${m.color} text-xs mb-1`}>{m.label}</Badge>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 3: Scoring & Calibration */}
        <TabsContent value="scoring" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OOD Scoring */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Unified OOD Scoring</CardTitle>
                <CardDescription className="text-xs">
                  Compute multiple OOD scores simultaneously
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs mb-1 block">Score Types</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {SCORE_TYPES.map(st => (
                      <label key={st.value} className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedScores.includes(st.value)}
                          onChange={() => toggleScore(st.value)}
                          className="h-3 w-3"
                        />
                        {st.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Num Samples</Label>
                  <Input type="number" value={numSamples} onChange={e => setNumSamples(+e.target.value)} className="h-8 text-xs w-24" min={1} max={100} />
                </div>
                <Button onClick={handleScore} disabled={loading} size="sm" className="w-full">Compute OOD Scores</Button>
              </CardContent>
            </Card>

            {/* Threshold Calibration */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Threshold Calibration</CardTitle>
                <CardDescription className="text-xs">
                  Calibrate optimal OOD detection threshold
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Target FPR</Label>
                    <Input type="number" value={0.05} className="h-8 text-xs" disabled />
                  </div>
                  <div>
                    <Label className="text-xs">Metric</Label>
                    <select className="w-full h-8 text-xs border rounded px-2">
                      <option value="auroc">AUROC</option>
                      <option value="aupr_in">AUPR (In)</option>
                      <option value="aupr_out">AUPR (Out)</option>
                      <option value="fpr95">FPR@95</option>
                    </select>
                  </div>
                </div>
                <Button
                  onClick={() => callAPI("/ood/calibrate", {
                    graph_id: graphId, method: "energy", target_fpr: 0.05, metric: "auroc"
                  })}
                  disabled={loading}
                  size="sm"
                  className="w-full"
                >
                  Calibrate Threshold
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Score legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Score Type Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <div className="border rounded p-2">
                  <div className="font-semibold text-blue-400">Energy Score</div>
                  <div className="text-muted-foreground">Lower energy → ID, Higher → OOD</div>
                </div>
                <div className="border rounded p-2">
                  <div className="font-semibold text-green-400">MSP</div>
                  <div className="text-muted-foreground">Higher prob → ID, Lower → OOD</div>
                </div>
                <div className="border rounded p-2">
                  <div className="font-semibold text-purple-400">Entropy</div>
                  <div className="text-muted-foreground">Higher entropy → OOD</div>
                </div>
                <div className="border rounded p-2">
                  <div className="font-semibold text-orange-400">ODIN</div>
                  <div className="text-muted-foreground">Perturbation-enhanced MSP</div>
                </div>
                <div className="border rounded p-2">
                  <div className="font-semibold text-pink-400">Likelihood</div>
                  <div className="text-muted-foreground">Density-based scoring</div>
                </div>
                <div className="border rounded p-2">
                  <div className="font-semibold text-cyan-400">KNN Distance</div>
                  <div className="text-muted-foreground">Feature-space nearest neighbor</div>
                </div>
              </div>
            </CardContent>
          </Card>
          {renderResultPanel()}
        </TabsContent>

        {/* Tab 4: Benchmark */}
        <TabsContent value="benchmark" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">OOD Method Benchmark</CardTitle>
              <CardDescription className="text-xs">
                Compare all OOD detection methods on the same graph
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Methods (comma-separated)</Label>
                <Input value={benchMethods} onChange={e => setBenchMethods(e.target.value)} className="h-8 text-xs" />
              </div>
              <Button onClick={handleBenchmark} disabled={loading} size="sm" className="w-full">
                Run Benchmark Comparison
              </Button>
            </CardContent>
          </Card>

          {result && (result as Record<string, unknown>).method_results && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Benchmark Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 px-2">Method</th>
                        <th className="text-right py-1 px-2">AUROC</th>
                        <th className="text-right py-1 px-2">AUPR-In</th>
                        <th className="text-right py-1 px-2">FPR95</th>
                        <th className="text-right py-1 px-2">Det. Error</th>
                        <th className="text-right py-1 px-2">Time (ms)</th>
                        <th className="text-right py-1 px-2">Mem (MB)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(((result as Record<string, unknown>).method_results as Record<string, Record<string, number>>)|| {}).map(([method, metrics]) => (
                        <tr key={method} className="border-b hover:bg-muted/30">
                          <td className="py-1 px-2 font-medium">{method}</td>
                          <td className="text-right py-1 px-2">
                            <span className={metrics.auroc > 0.9 ? "text-green-400" : "text-yellow-400"}>
                              {metrics.auroc?.toFixed(4)}
                            </span>
                          </td>
                          <td className="text-right py-1 px-2">{metrics.aupr_in?.toFixed(4)}</td>
                          <td className="text-right py-1 px-2">
                            <span className={metrics.fpr95 < 0.05 ? "text-green-400" : "text-yellow-400"}>
                              {metrics.fpr95?.toFixed(4)}
                            </span>
                          </td>
                          <td className="text-right py-1 px-2">{metrics.detection_error?.toFixed(4)}</td>
                          <td className="text-right py-1 px-2">{metrics.inference_time_ms?.toFixed(1)}</td>
                          <td className="text-right py-1 px-2">{metrics.memory_mb?.toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(result as Record<string, unknown>).best_method && (
                  <div className="mt-3 p-2 bg-green-900/20 rounded text-xs">
                    <span className="font-semibold text-green-400">Best Method: </span>
                    <span>{String((result as Record<string, unknown>).best_method)}</span>
                    {(result as Record<string, unknown>).ranking && (
                      <div className="mt-1 text-muted-foreground">
                        Ranking: {((result as Record<string, unknown>).ranking as Array<Record<string, unknown>>)?.map((r, i) =>
                          `${i+1}. ${String(r.method)} (${String(r.auroc)})`
                        ).join(" > ")}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {error && (
        <div className="text-red-500 text-sm bg-red-900/20 p-2 rounded">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent" />
          Running OOD detection...
        </div>
      )}
    </div>
  );
}
