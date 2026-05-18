"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const EXPLANATION_METHODS = [
  { value: "gradient", label: "Gradient", desc: "Direct gradient-based attribution" },
  { value: "integrated_gradient", label: "Integrated Gradient", desc: "Path-integrated gradients" },
  { value: "gnn_explainer", label: "GNNExplainer", desc: "Learned edge/node masks" },
  { value: "pg_explainer", label: "PGExplainer", desc: "Parameterized explainer" },
  { value: "subgraphx", label: "SubgraphX", desc: "Subgraph-level attribution" },
  { value: "graphlime", label: "GraphLIME", desc: "LIME adaptation for graphs" },
];

const ATTRIBUTION_LEVELS = [
  { value: "node", label: "Node", desc: "Per-node importance scores" },
  { value: "edge", label: "Edge", desc: "Per-edge importance scores" },
  { value: "subgraph", label: "Subgraph", desc: "Subgraph structure attribution" },
  { value: "path", label: "Path", desc: "Information flow paths" },
  { value: "concept", label: "Concept", desc: "High-level concept detection" },
  { value: "global", label: "Global", desc: "Whole-graph attribution" },
];

const COUNTERFACTUAL_TYPES = [
  { value: "feature_perturbation", label: "Feature Perturbation", desc: "Modify node features" },
  { value: "edge_perturbation", label: "Edge Perturbation", desc: "Add/remove/weight edges" },
  { value: "node_removal", label: "Node Removal", desc: "Remove nodes from graph" },
  { value: "node_addition", label: "Node Addition", desc: "Add new nodes" },
  { value: "subgraph_replace", label: "Subgraph Replace", desc: "Replace subgraph structures" },
];

const CAUSAL_TYPES = [
  { value: "direct", label: "Direct", desc: "Direct causal effect" },
  { value: "indirect", label: "Indirect", desc: "Indirect/mediated effect" },
  { value: "mediated", label: "Mediated", desc: "Through mediator variables" },
  { value: "confounded", label: "Confounded", desc: "Confounding variable effect" },
  { value: "spurious", label: "Spurious", desc: "Spurious correlation" },
];

const QUALITY_METRICS = [
  { value: "faithfulness", label: "Faithfulness", desc: "Explanation matches model behavior" },
  { value: "sparsity", label: "Sparsity", desc: "Concise, minimal explanations" },
  { value: "stability", label: "Stability", desc: "Consistent under small perturbations" },
  { value: "comprehensibility", label: "Comprehensibility", desc: "Human-understandable" },
  { value: "robustness", label: "Robustness", desc: "Resistant to adversarial manipulation" },
];

export default function GraphExplainabilityV2Page() {
  const [activeTab, setActiveTab] = useState("attribution");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  // Attribution params
  const [method, setMethod] = useState("gnn_explainer");
  const [level, setLevel] = useState("node");
  const [targetNode, setTargetNode] = useState("n_0");
  const [numHops, setNumHops] = useState(3);
  const [topK, setTopK] = useState(10);

  // Counterfactual params
  const [cfType, setCfType] = useState("feature_perturbation");
  const [targetClass, setTargetClass] = useState("class_B");
  const [numCF, setNumCF] = useState(5);
  const [maxPert, setMaxPert] = useState(0.3);

  // Causal params
  const [selectedCausalTypes, setSelectedCausalTypes] = useState<string[]>(["direct", "indirect", "mediated"]);
  const [numPaths, setNumPaths] = useState(10);
  const [interventionThreshold, setInterventionThreshold] = useState(0.1);

  // Fairness-aware params
  const [sensitiveAttr, setSensitiveAttr] = useState("gender");
  const [fairnessMethod, setFairnessMethod] = useState("gnn_explainer");
  const [fairnessMetric, setFairnessMetric] = useState("demographic_parity");
  const [fairTopK, setFairTopK] = useState(5);

  // Subgraph params
  const [maxSubgraphSize, setMaxSubgraphSize] = useState(10);
  const [numCandidates, setNumCandidates] = useState(20);

  // Validation params
  const [selectedQualityMetrics, setSelectedQualityMetrics] = useState<string[]>([
    "faithfulness", "sparsity", "stability", "comprehensibility", "robustness",
  ]);
  const [numPerturbations, setNumPerturbations] = useState(50);
  const [fidelityThreshold, setFidelityThreshold] = useState(0.7);

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

  const handleAttribution = () => callAPI("/explainability-v2/attribution", {
    graph_id: graphId, method, level, target_node: targetNode,
    num_hops: numHops, top_k: topK,
  });

  const handleCounterfactual = () => callAPI("/explainability-v2/counterfactual", {
    graph_id: graphId, counterfactual_type: cfType,
    target_node: targetNode, target_class: targetClass,
    num_counterfactuals: numCF, max_perturbation: maxPert,
  });

  const handleCausal = () => callAPI("/explainability-v2/causal", {
    graph_id: graphId, target_node: targetNode,
    causal_types: selectedCausalTypes, num_paths: numPaths,
    intervention_threshold: interventionThreshold,
  });

  const handleFairnessAware = () => callAPI("/explainability-v2/fairness-aware", {
    graph_id: graphId, sensitive_attribute: sensitiveAttr,
    explanation_method: fairnessMethod, fairness_metric: fairnessMetric,
    top_k: fairTopK,
  });

  const handleSubgraph = () => callAPI("/explainability-v2/subgraph-importance", {
    graph_id: graphId, target_node: targetNode, method,
    max_subgraph_size: maxSubgraphSize, num_candidates: numCandidates,
  });

  const handleValidation = () => callAPI("/explainability-v2/validate", {
    graph_id: graphId, method, quality_metrics: selectedQualityMetrics,
    num_perturbations: numPerturbations, fidelity_threshold: fidelityThreshold,
  });

  const toggleCausalType = (ct: string) => {
    setSelectedCausalTypes(prev =>
      prev.includes(ct) ? prev.filter(c => c !== ct) : [...prev, ct]
    );
  };

  const toggleQualityMetric = (qm: string) => {
    setSelectedQualityMetrics(prev =>
      prev.includes(qm) ? prev.filter(q => q !== qm) : [...prev, qm]
    );
  };

  const renderResultPanel = (title: string = "Result") => {
    if (!result) return null;
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
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
          <h1 className="text-2xl font-bold">Graph Explainability v2 Engine</h1>
          <p className="text-muted-foreground text-sm">
            Counterfactual explanations, causal attribution, fairness-aware explanations, and subgraph importance analysis for GNNs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Graph ID</Label>
          <Input value={graphId} onChange={e => setGraphId(e.target.value)} className="w-32 h-8 text-xs" />
          <Badge variant="outline" className="text-xs">v1.95</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="counterfactual">Counterfactual</TabsTrigger>
          <TabsTrigger value="causal">Causal</TabsTrigger>
          <TabsTrigger value="fairness">Fairness-Aware</TabsTrigger>
          <TabsTrigger value="subgraph">Subgraph</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        {/* Tab 1: Attribution */}
        <TabsContent value="attribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Multi-Level Attribution</CardTitle>
                <CardDescription>
                  Compute feature/node/edge/path attribution using 6 explanation methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Explanation Method</Label>
                  <select className="w-full h-8 text-xs border rounded px-2" value={method} onChange={e => setMethod(e.target.value)}>
                    {EXPLANATION_METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.label} — {m.desc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Attribution Level</Label>
                  <select className="w-full h-8 text-xs border rounded px-2" value={level} onChange={e => setLevel(e.target.value)}>
                    {ATTRIBUTION_LEVELS.map(l => (
                      <option key={l.value} value={l.value}>{l.label} — {l.desc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Target Node</Label>
                  <Input value={targetNode} onChange={e => setTargetNode(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Num Hops</Label>
                    <Input type="number" min="1" max="10" value={numHops}
                      onChange={e => setNumHops(parseInt(e.target.value) || 3)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Top K</Label>
                    <Input type="number" min="1" max="50" value={topK}
                      onChange={e => setTopK(parseInt(e.target.value) || 10)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleAttribution} disabled={loading} className="w-full" size="sm">
                  {loading ? "Computing..." : "Compute Attribution"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Explanation Methods Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {EXPLANATION_METHODS.map(m => (
                  <div key={m.value} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground">{m.desc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Attribution Result")}
        </TabsContent>

        {/* Tab 2: Counterfactual */}
        <TabsContent value="counterfactual">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Counterfactual Explanations</CardTitle>
                <CardDescription>
                  What-if analysis: perturb graph to change predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Counterfactual Type</Label>
                  <select className="w-full h-8 text-xs border rounded px-2" value={cfType} onChange={e => setCfType(e.target.value)}>
                    {COUNTERFACTUAL_TYPES.map(ct => (
                      <option key={ct.value} value={ct.value}>{ct.label} — {ct.desc}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Target Node</Label>
                    <Input value={targetNode} onChange={e => setTargetNode(e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Target Class</Label>
                    <Input value={targetClass} onChange={e => setTargetClass(e.target.value)} className="h-8 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Num Counterfactuals</Label>
                    <Input type="number" min="1" max="20" value={numCF}
                      onChange={e => setNumCF(parseInt(e.target.value) || 5)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Max Perturbation</Label>
                    <Input type="number" step="0.05" min="0.05" max="1.0" value={maxPert}
                      onChange={e => setMaxPert(parseFloat(e.target.value) || 0.3)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleCounterfactual} disabled={loading} className="w-full" size="sm">
                  {loading ? "Generating..." : "Generate Counterfactuals"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Counterfactual Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {COUNTERFACTUAL_TYPES.map(ct => (
                  <div key={ct.value} className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-xs">{ct.label}</Badge>
                    <span className="text-muted-foreground">{ct.desc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Counterfactual Result")}
        </TabsContent>

        {/* Tab 3: Causal Attribution */}
        <TabsContent value="causal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Causal Attribution Analysis</CardTitle>
                <CardDescription>
                  Identify causal paths, interventions, and confounders in GNN predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Causal Types to Analyze</Label>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {CAUSAL_TYPES.map(ct => (
                      <label key={ct.value} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCausalTypes.includes(ct.value)}
                          onChange={() => toggleCausalType(ct.value)}
                          className="h-3 w-3"
                        />
                        {ct.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Target Node</Label>
                    <Input value={targetNode} onChange={e => setTargetNode(e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Num Paths</Label>
                    <Input type="number" min="5" max="50" value={numPaths}
                      onChange={e => setNumPaths(parseInt(e.target.value) || 10)} className="h-8 text-xs" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Intervention Threshold</Label>
                  <Input type="number" step="0.01" value={interventionThreshold}
                    onChange={e => setInterventionThreshold(parseFloat(e.target.value) || 0.1)} className="h-8 text-xs" />
                </div>
                <Button onClick={handleCausal} disabled={loading} className="w-full" size="sm">
                  {loading ? "Analyzing..." : "Run Causal Analysis"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Causal Analysis Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">Causal Paths</span> — Trace information flow through graph</p>
                <p><span className="font-medium text-foreground">Intervention Analysis</span> — do-calculus on features/node sets</p>
                <p><span className="font-medium text-foreground">Confounder Detection</span> — Identify backdoor paths</p>
                <p><span className="font-medium text-foreground">Mediator Analysis</span> — Direct vs indirect effects</p>
                <p><span className="font-medium text-foreground">Causal Graph</span> — Markov blanket, d-separation tests</p>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Causal Analysis Result")}
        </TabsContent>

        {/* Tab 4: Fairness-Aware Explanation */}
        <TabsContent value="fairness">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Fairness-Aware Explanations</CardTitle>
                <CardDescription>
                  Generate bias-aware explanations that account for fairness across sensitive groups
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Sensitive Attribute</Label>
                  <Input value={sensitiveAttr} onChange={e => setSensitiveAttr(e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Explanation Method</Label>
                  <select className="w-full h-8 text-xs border rounded px-2" value={fairnessMethod} onChange={e => setFairnessMethod(e.target.value)}>
                    {EXPLANATION_METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Fairness Metric</Label>
                    <select className="w-full h-8 text-xs border rounded px-2" value={fairnessMetric} onChange={e => setFairnessMetric(e.target.value)}>
                      <option value="demographic_parity">Demographic Parity</option>
                      <option value="equalized_odds">Equalized Odds</option>
                      <option value="predictive_parity">Predictive Parity</option>
                      <option value="individual_fairness">Individual Fairness</option>
                      <option value="counterfactual_fairness">Counterfactual Fairness</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Top K Features</Label>
                    <Input type="number" min="3" max="20" value={fairTopK}
                      onChange={e => setFairTopK(parseInt(e.target.value) || 5)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleFairnessAware} disabled={loading} className="w-full" size="sm">
                  {loading ? "Analyzing..." : "Generate Fairness-Aware Explanation"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Integration with v1.94 Fairness Engine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>Cross-group feature importance disparity analysis</p>
                <p>Detection of biased features via importance ratio</p>
                <p>Fairness-adjusted feature importance scores</p>
                <p>Per-group subgraph pattern analysis</p>
                <p>Automated mitigation recommendations</p>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Fairness-Aware Explanation Result")}
        </TabsContent>

        {/* Tab 5: Subgraph Importance */}
        <TabsContent value="subgraph">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Subgraph Importance Analysis</CardTitle>
                <CardDescription>
                  Identify critical subgraph structures, motifs, and connectivity patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Target Node</Label>
                  <Input value={targetNode} onChange={e => setTargetNode(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Max Subgraph Size</Label>
                    <Input type="number" min="3" max="30" value={maxSubgraphSize}
                      onChange={e => setMaxSubgraphSize(parseInt(e.target.value) || 10)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Num Candidates</Label>
                    <Input type="number" min="5" max="100" value={numCandidates}
                      onChange={e => setNumCandidates(parseInt(e.target.value) || 20)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleSubgraph} disabled={loading} className="w-full" size="sm">
                  {loading ? "Analyzing..." : "Analyze Subgraph Importance"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Motif Types Detected</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Triangle", "Star", "Chain", "Clique", "Bipartite Core", "Path"].map(m => (
                  <div key={m} className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-xs">{m}</Badge>
                    <span className="text-muted-foreground">Frequency analysis + importance ranking</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Subgraph Importance Result")}
        </TabsContent>

        {/* Tab 6: Validation */}
        <TabsContent value="validation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Explanation Quality Validation</CardTitle>
                <CardDescription>
                  Evaluate explanations across 5 quality dimensions with perturbation tests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Quality Metrics</Label>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {QUALITY_METRICS.map(qm => (
                      <label key={qm.value} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedQualityMetrics.includes(qm.value)}
                          onChange={() => toggleQualityMetric(qm.value)}
                          className="h-3 w-3"
                        />
                        {qm.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Num Perturbations</Label>
                    <Input type="number" min="10" max="200" value={numPerturbations}
                      onChange={e => setNumPerturbations(parseInt(e.target.value) || 50)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Fidelity Threshold</Label>
                    <Input type="number" step="0.05" value={fidelityThreshold}
                      onChange={e => setFidelityThreshold(parseFloat(e.target.value) || 0.7)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleValidation} disabled={loading} className="w-full" size="sm">
                  {loading ? "Validating..." : "Validate Explanation Quality"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {QUALITY_METRICS.map(qm => (
                  <div key={qm.value} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{qm.label}</span>
                    <span className="text-muted-foreground">{qm.desc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Validation Result")}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">Running explainability analysis...</div>
      )}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
