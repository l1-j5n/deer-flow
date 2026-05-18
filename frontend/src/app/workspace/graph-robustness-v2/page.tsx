"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const CERT_TYPES = [
  { value: "deterministic", label: "Deterministic", desc: "Provable radius guarantees" },
  { value: "randomized_smoothing", label: "Randomized Smoothing", desc: "Statistical certification" },
  { value: "interval_bound", label: "Interval Bound", desc: "Interval arithmetic bounds" },
  { value: "linear_programming", label: "Linear Programming", desc: "LP-based verification" },
  { value: "convex_relaxation", label: "Convex Relaxation", desc: "Convex relaxation bounds" },
];

const PERTURBATION_NORMS = [
  { value: "l0", label: "L0", desc: "Node/edge perturbations" },
  { value: "l1", label: "L1", desc: "Manhattan distance" },
  { value: "l2", label: "L2", desc: "Euclidean distance" },
  { value: "linf", label: "L-inf", desc: "Maximum perturbation" },
  { value: "spectral", label: "Spectral", desc: "Spectral norm perturbation" },
];

const ROBUSTNESS_LEVELS: Record<string, { color: string; label: string }> = {
  certified: { color: "bg-green-500", label: "Certified" },
  probably_robust: { color: "bg-blue-500", label: "Probably Robust" },
  unknown: { color: "bg-yellow-500", label: "Unknown" },
  vulnerable: { color: "bg-orange-500", label: "Vulnerable" },
  critically_vulnerable: { color: "bg-red-500", label: "Critically Vulnerable" },
};

const SHIFT_TYPES = [
  { value: "covariate_shift", label: "Covariate Shift", desc: "Input distribution change" },
  { value: "concept_shift", label: "Concept Shift", desc: "Label relationship change" },
  { value: "structural_shift", label: "Structural Shift", desc: "Graph topology change" },
  { value: "label_shift", label: "Label Shift", desc: "Label distribution change" },
  { value: "adversarial_shift", label: "Adversarial Shift", desc: "Adversarial distribution" },
];

const HARDENING_METHODS = [
  { value: "adversarial_training", label: "Adversarial Training", desc: "Train on adversarial examples" },
  { value: "certifiable_training", label: "Certifiable Training", desc: "Train for certifiable bounds" },
  { value: "robust_aggregation", label: "Robust Aggregation", desc: "Robust neighbor aggregation" },
  { value: "graph_purification", label: "Graph Purification", desc: "Clean perturbed graphs" },
  { value: "structural_regularization", label: "Structural Regularization", desc: "Regularize graph structure" },
  { value: "ensemble_hardening", label: "Ensemble Hardening", desc: "Ensemble-based robustness" },
];

const CASCADE_TYPES = [
  { value: "node_failure", label: "Node Failure", desc: "Targeted node removal" },
  { value: "edge_failure", label: "Edge Failure", desc: "Edge perturbation/removal" },
  { value: "propagation_failure", label: "Propagation Failure", desc: "Message passing disruption" },
  { value: "representation_collapse", label: "Repr. Collapse", desc: "Embedding collapse" },
  { value: "community_disruption", label: "Community Disruption", desc: "Community structure attack" },
];

export default function GraphRobustnessV2Page() {
  const [activeTab, setActiveTab] = useState("certify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Certify state
  const [certType, setCertType] = useState("deterministic");
  const [perturbNorm, setPerturbNorm] = useState("l2");
  const [perturbBudget, setPerturbBudget] = useState(0.5);
  const [numNodes, setNumNodes] = useState(30);
  const [certResult, setCertResult] = useState<any>(null);

  // Smoothing state
  const [noiseScale, setNoiseScale] = useState(0.5);
  const [numSamples, setNumSamples] = useState(1000);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [smoothResult, setSmoothResult] = useState<any>(null);

  // Distribution state
  const [shiftTypes, setShiftTypes] = useState<string[]>(["covariate_shift", "concept_shift", "structural_shift"]);
  const [severity, setSeverity] = useState(0.5);
  const [numScenarios, setNumScenarios] = useState(10);
  const [adaptationSteps, setAdaptationSteps] = useState(5);
  const [distResult, setDistResult] = useState<any>(null);

  // Cascade state
  const [cascadeTypes, setCascadeTypes] = useState<string[]>(["node_failure", "edge_failure", "propagation_failure"]);
  const [impactBudget, setImpactBudget] = useState(0.5);
  const [numTargets, setNumTargets] = useState(10);
  const [propSteps, setPropSteps] = useState(8);
  const [cascadeResult, setCascadeResult] = useState<any>(null);

  // Harden state
  const [hardenMethods, setHardenMethods] = useState<string[]>(["adversarial_training", "certifiable_training", "robust_aggregation"]);
  const [robustTarget, setRobustTarget] = useState(0.85);
  const [budgetConstraint, setBudgetConstraint] = useState(1.0);
  const [numIterations, setNumIterations] = useState(10);
  const [hardenResult, setHardenResult] = useState<any>(null);

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

  const runCertify = async () => {
    const r = await call("/robustness-v2/certify", {
      certification_type: certType, perturbation_norm: perturbNorm,
      perturbation_budget: perturbBudget, num_nodes: numNodes,
      certify_scope: "full", integration: { continual_learning: true, fairness: true, explainability: true },
    });
    setCertResult(r);
  };

  const runSmoothing = async () => {
    const r = await call("/robustness-v2/smoothing", {
      noise_scale: noiseScale, num_samples: numSamples,
      confidence_level: confidenceLevel, certify_nodes: true, certify_edges: true,
    });
    setSmoothResult(r);
  };

  const runDistribution = async () => {
    const r = await call("/robustness-v2/distribution", {
      shift_types: shiftTypes, severity, num_scenarios: numScenarios,
      adaptation_steps: adaptationSteps,
    });
    setDistResult(r);
  };

  const runCascade = async () => {
    const r = await call("/robustness-v2/cascade", {
      cascade_types: cascadeTypes, impact_budget: impactBudget,
      num_targets: numTargets, propagation_steps: propSteps,
    });
    setCascadeResult(r);
  };

  const runHarden = async () => {
    const r = await call("/robustness-v2/harden", {
      hardening_methods: hardenMethods, robustness_target: robustTarget,
      budget_constraint: budgetConstraint, num_iterations: numIterations,
    });
    setHardenResult(r);
  };

  const runReport = async () => {
    const r = await call("/robustness-v2/report", {
      include_smoothing: true, include_distribution: true,
      include_cascade: true, include_hardening: true,
    });
    setReportResult(r);
  };

  const toggleShiftType = (v: string) => {
    setShiftTypes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const toggleCascadeType = (v: string) => {
    setCascadeTypes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const toggleHardenMethod = (v: string) => {
    setHardenMethods(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Graph Robustness Certification v2</h1>
          <p className="text-muted-foreground mt-1">Provable robustness guarantees, randomized smoothing, distributional robustness & cascade analysis</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-1">v1.97.0</Badge>
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
          <TabsTrigger value="certify">Certify</TabsTrigger>
          <TabsTrigger value="smoothing">Smoothing</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="cascade">Cascade</TabsTrigger>
          <TabsTrigger value="harden">Harden</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        {/* Certify Tab */}
        <TabsContent value="certify">
          <Card>
            <CardHeader>
              <CardTitle>Deterministic Certification</CardTitle>
              <CardDescription>Compute provable robustness certificates with certified radius guarantees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Certification Type</Label>
                  <select className="w-full border rounded p-2 text-sm" value={certType} onChange={e => setCertType(e.target.value)}>
                    {CERT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Perturbation Norm</Label>
                  <select className="w-full border rounded p-2 text-sm" value={perturbNorm} onChange={e => setPerturbNorm(e.target.value)}>
                    {PERTURBATION_NORMS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Perturbation Budget</Label>
                  <Input type="number" step="0.1" value={perturbBudget} onChange={e => setPerturbBudget(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Num Nodes</Label>
                  <Input type="number" value={numNodes} onChange={e => setNumNodes(parseInt(e.target.value) || 30)} />
                </div>
              </div>
              <Button onClick={runCertify} disabled={loading}>
                {loading ? "Certifying..." : "Run Certification"}
              </Button>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {certResult && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(certResult.level_distribution || {}).map(([level, count]: [string, any]) => (
                      <div key={level} className={`p-3 rounded-lg text-white ${ROBUSTNESS_LEVELS[level]?.color || "bg-gray-500"}`}>
                        <div className="text-xs opacity-80">{ROBUSTNESS_LEVELS[level]?.label || level}</div>
                        <div className="text-2xl font-bold">{count}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Certification Rate</div>
                      <div className="text-xl font-bold">{(certResult.overall_certification_rate * 100).toFixed(1)}%</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Avg Certified Radius</div>
                      <div className="text-xl font-bold">{certResult.average_certified_radius?.toFixed(4)}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Avg Robustness</div>
                      <div className="text-xl font-bold">{certResult.average_robustness_score?.toFixed(4)}</div>
                    </div>
                  </div>

                  {certResult.nodes && certResult.nodes.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Node</th>
                            <th className="p-2 text-left">Radius</th>
                            <th className="p-2 text-left">Score</th>
                            <th className="p-2 text-left">Level</th>
                            <th className="p-2 text-left">Margin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {certResult.nodes.slice(0, 15).map((n: any) => (
                            <tr key={n.node_id} className="border-t">
                              <td className="p-2">{n.node_id}</td>
                              <td className="p-2">{n.certified_radius?.toFixed(4)}</td>
                              <td className="p-2">{n.robustness_score?.toFixed(4)}</td>
                              <td className="p-2">
                                <Badge className={`${ROBUSTNESS_LEVELS[n.level]?.color || "bg-gray-500"} text-white text-xs`}>
                                  {ROBUSTNESS_LEVELS[n.level]?.label || n.level}
                                </Badge>
                              </td>
                              <td className="p-2">{n.margin?.toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {certResult.integration && (
                    <div className="border rounded-lg p-3 bg-muted/30">
                      <div className="text-sm font-medium mb-2">Cross-Module Integration</div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {certResult.integration.continual_learning && (
                          <div>CL Stability: <strong>{certResult.integration.continual_learning.task_boundary_stability}</strong></div>
                        )}
                        {certResult.integration.fairness && (
                          <div>Equitable Cert: <strong>{certResult.integration.fairness.equitable_certification}</strong></div>
                        )}
                        {certResult.integration.explainability && (
                          <div>Attribution Stable: <strong>{certResult.integration.explainability.attribution_stability}</strong></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smoothing Tab */}
        <TabsContent value="smoothing">
          <Card>
            <CardHeader>
              <CardTitle>Randomized Smoothing</CardTitle>
              <CardDescription>Statistical robustness certification via noise injection and majority vote</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Noise Scale (σ)</Label>
                  <Input type="number" step="0.1" value={noiseScale} onChange={e => setNoiseScale(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Num Samples</Label>
                  <Input type="number" value={numSamples} onChange={e => setNumSamples(parseInt(e.target.value) || 1000)} />
                </div>
                <div>
                  <Label>Confidence Level</Label>
                  <Input type="number" step="0.01" value={confidenceLevel} onChange={e => setConfidenceLevel(parseFloat(e.target.value) || 0.95)} />
                </div>
              </div>
              <Button onClick={runSmoothing} disabled={loading}>
                {loading ? "Smoothing..." : "Run Smoothing Certification"}
              </Button>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {smoothResult && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Cert Rate</div>
                      <div className="text-xl font-bold">{(smoothResult.certification_rate * 100).toFixed(1)}%</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Certified Radius</div>
                      <div className="text-xl font-bold">{smoothResult.global_certified_radius?.toFixed(4)}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Statistical Power</div>
                      <div className="text-xl font-bold">{smoothResult.statistical_power?.toFixed(4)}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Certified / Total</div>
                      <div className="text-xl font-bold">{smoothResult.certified_count} / {smoothResult.total_elements}</div>
                    </div>
                  </div>

                  {smoothResult.noise_utility_tradeoff && (
                    <div className="border rounded-lg p-3 bg-muted/30">
                      <div className="text-sm font-medium mb-2">Noise-Utility Tradeoff</div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>Clean Acc: <strong>{(smoothResult.noise_utility_tradeoff.clean_accuracy * 100).toFixed(1)}%</strong></div>
                        <div>Robust Acc: <strong>{(smoothResult.noise_utility_tradeoff.robust_accuracy * 100).toFixed(1)}%</strong></div>
                        <div>Acc-Robust Ratio: <strong>{smoothResult.noise_utility_tradeoff.accuracy_robustness_ratio?.toFixed(3)}</strong></div>
                        <div>Optimal σ: <strong>{smoothResult.recommendations?.optimal_noise_scale?.toFixed(3)}</strong></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Distributional Robustness</CardTitle>
              <CardDescription>Analyze robustness under various distribution shifts with adaptation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {SHIFT_TYPES.map(st => (
                  <Button key={st.value} variant={shiftTypes.includes(st.value) ? "default" : "outline"} size="sm"
                    onClick={() => toggleShiftType(st.value)} title={st.desc}>
                    {st.label}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Severity</Label>
                  <Input type="number" step="0.1" min="0" max="1" value={severity} onChange={e => setSeverity(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Num Scenarios</Label>
                  <Input type="number" value={numScenarios} onChange={e => setNumScenarios(parseInt(e.target.value) || 10)} />
                </div>
                <div>
                  <Label>Adaptation Steps</Label>
                  <Input type="number" value={adaptationSteps} onChange={e => setAdaptationSteps(parseInt(e.target.value) || 5)} />
                </div>
              </div>
              <Button onClick={runDistribution} disabled={loading || shiftTypes.length === 0}>
                {loading ? "Analyzing..." : "Run Distribution Analysis"}
              </Button>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {distResult && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Base Accuracy</div>
                      <div className="text-xl font-bold">{(distResult.average_base_accuracy * 100).toFixed(1)}%</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Degraded</div>
                      <div className="text-xl font-bold text-orange-500">{(distResult.average_degraded_accuracy * 100).toFixed(1)}%</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Adapted</div>
                      <div className="text-xl font-bold text-green-600">{(distResult.average_adapted_accuracy * 100).toFixed(1)}%</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Robustness Gap</div>
                      <div className="text-xl font-bold">{(distResult.global_robustness_gap * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  {distResult.per_shift_analysis && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Shift Type</th>
                            <th className="p-2 text-left">Count</th>
                            <th className="p-2 text-left">Avg Degradation</th>
                            <th className="p-2 text-left">Avg Recovery</th>
                            <th className="p-2 text-left">Detection Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(distResult.per_shift_analysis).map(([type, data]: [string, any]) => (
                            <tr key={type} className="border-t">
                              <td className="p-2">{type}</td>
                              <td className="p-2">{data.count}</td>
                              <td className="p-2">{data.avg_degradation?.toFixed(4)}</td>
                              <td className="p-2">{data.avg_recovery?.toFixed(4)}</td>
                              <td className="p-2">{(data.detection_rate * 100).toFixed(1)}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cascade Tab */}
        <TabsContent value="cascade">
          <Card>
            <CardHeader>
              <CardTitle>Cascade Failure Analysis</CardTitle>
              <CardDescription>Analyze adversarial cascade propagation and graph resilience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {CASCADE_TYPES.map(ct => (
                  <Button key={ct.value} variant={cascadeTypes.includes(ct.value) ? "default" : "outline"} size="sm"
                    onClick={() => toggleCascadeType(ct.value)} title={ct.desc}>
                    {ct.label}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Impact Budget</Label>
                  <Input type="number" step="0.1" min="0" max="1" value={impactBudget} onChange={e => setImpactBudget(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Num Targets</Label>
                  <Input type="number" value={numTargets} onChange={e => setNumTargets(parseInt(e.target.value) || 10)} />
                </div>
                <div>
                  <Label>Propagation Steps</Label>
                  <Input type="number" value={propSteps} onChange={e => setPropSteps(parseInt(e.target.value) || 8)} />
                </div>
              </div>
              <Button onClick={runCascade} disabled={loading || cascadeTypes.length === 0}>
                {loading ? "Analyzing..." : "Run Cascade Analysis"}
              </Button>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {cascadeResult && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Resilience Score</div>
                      <div className="text-xl font-bold">{(cascadeResult.resilience_score * 100).toFixed(1)}%</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Critical Events</div>
                      <div className="text-xl font-bold text-red-500">{cascadeResult.critical_events}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Nodes Affected</div>
                      <div className="text-xl font-bold">{cascadeResult.total_nodes_affected}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Avg Propagation</div>
                      <div className="text-xl font-bold">{cascadeResult.average_propagation_length?.toFixed(1)} steps</div>
                    </div>
                  </div>

                  {cascadeResult.per_type_analysis && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Cascade Type</th>
                            <th className="p-2 text-left">Count</th>
                            <th className="p-2 text-left">Avg Impact</th>
                            <th className="p-2 text-left">Avg Propagation</th>
                            <th className="p-2 text-left">Critical</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(cascadeResult.per_type_analysis).map(([type, data]: [string, any]) => (
                            <tr key={type} className="border-t">
                              <td className="p-2">{type}</td>
                              <td className="p-2">{data.count}</td>
                              <td className="p-2">{data.avg_impact?.toFixed(4)}</td>
                              <td className="p-2">{data.avg_propagation?.toFixed(1)}</td>
                              <td className="p-2"><Badge variant="destructive">{data.critical_count}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Harden Tab */}
        <TabsContent value="harden">
          <Card>
            <CardHeader>
              <CardTitle>Automated Hardening</CardTitle>
              <CardDescription>Apply automated defense methods to improve certified robustness</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {HARDENING_METHODS.map(hm => (
                  <Button key={hm.value} variant={hardenMethods.includes(hm.value) ? "default" : "outline"} size="sm"
                    onClick={() => toggleHardenMethod(hm.value)} title={hm.desc}>
                    {hm.label}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Robustness Target</Label>
                  <Input type="number" step="0.05" min="0" max="1" value={robustTarget} onChange={e => setRobustTarget(parseFloat(e.target.value) || 0.85)} />
                </div>
                <div>
                  <Label>Budget Constraint</Label>
                  <Input type="number" step="0.1" value={budgetConstraint} onChange={e => setBudgetConstraint(parseFloat(e.target.value) || 1.0)} />
                </div>
                <div>
                  <Label>Num Iterations</Label>
                  <Input type="number" value={numIterations} onChange={e => setNumIterations(parseInt(e.target.value) || 10)} />
                </div>
              </div>
              <Button onClick={runHarden} disabled={loading || hardenMethods.length === 0}>
                {loading ? "Hardening..." : "Run Hardening"}
              </Button>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {hardenResult && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Best Method</div>
                      <div className="text-xl font-bold">{hardenResult.best_method}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Best Robustness</div>
                      <div className="text-xl font-bold">{(hardenResult.best_final_robustness * 100).toFixed(1)}%</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">All Targets Met</div>
                      <div className="text-xl font-bold">{hardenResult.all_targets_met ? "✅" : "❌"}</div>
                    </div>
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-muted-foreground">Ranking</div>
                      <div className="text-sm font-bold">{hardenResult.ranking?.join(" > ")}</div>
                    </div>
                  </div>

                  {hardenResult.method_results && (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Method</th>
                            <th className="p-2 text-left">Initial</th>
                            <th className="p-2 text-left">Final</th>
                            <th className="p-2 text-left">Improvement</th>
                            <th className="p-2 text-left">Target Met</th>
                            <th className="p-2 text-left">Budget Eff.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(hardenResult.method_results).map(([method, data]: [string, any]) => (
                            <tr key={method} className="border-t">
                              <td className="p-2 font-medium">{method}</td>
                              <td className="p-2">{(data.initial_robustness * 100).toFixed(1)}%</td>
                              <td className="p-2">{(data.final_robustness * 100).toFixed(1)}%</td>
                              <td className="p-2 text-green-600">+{(data.improvement * 100).toFixed(1)}%</td>
                              <td className="p-2">{data.target_met ? "✅" : "❌"}</td>
                              <td className="p-2">{data.budget_efficiency?.toFixed(3)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Certification Report</CardTitle>
              <CardDescription>Full robustness certification report integrating all analysis modules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runReport} disabled={loading}>
                {loading ? "Generating Report..." : "Generate Full Report"}
              </Button>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {reportResult && (
                <div className="space-y-4 mt-4">
                  <div className={`p-6 rounded-lg text-center text-white ${ROBUSTNESS_LEVELS[reportResult.overall_level]?.color || "bg-gray-500"}`}>
                    <div className="text-sm opacity-80">Overall Robustness Level</div>
                    <div className="text-4xl font-bold mt-1">{ROBUSTNESS_LEVELS[reportResult.overall_level]?.label || reportResult.overall_level}</div>
                    <div className="text-lg mt-2">Score: {(reportResult.overall_robustness_score * 100).toFixed(1)}%</div>
                  </div>

                  {reportResult.deterministic_certification && (
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">Deterministic Certification</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>Cert Rate: <strong>{(reportResult.deterministic_certification.certification_rate * 100).toFixed(1)}%</strong></div>
                        <div>Avg Radius: <strong>{reportResult.deterministic_certification.avg_radius?.toFixed(4)}</strong></div>
                        <div>Avg Robust: <strong>{reportResult.deterministic_certification.avg_robust?.toFixed(4)}</strong></div>
                      </div>
                    </div>
                  )}

                  {reportResult.randomized_smoothing && (
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">Randomized Smoothing</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>Cert Rate: <strong>{(reportResult.randomized_smoothing.certification_rate * 100).toFixed(1)}%</strong></div>
                        <div>Radius: <strong>{reportResult.randomized_smoothing.certified_radius?.toFixed(4)}</strong></div>
                        <div>Power: <strong>{reportResult.randomized_smoothing.statistical_power?.toFixed(4)}</strong></div>
                      </div>
                    </div>
                  )}

                  {reportResult.distribution_robustness && (
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">Distributional Robustness</div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>Base: <strong>{(reportResult.distribution_robustness.avg_base_accuracy * 100).toFixed(1)}%</strong></div>
                        <div>Degraded: <strong>{(reportResult.distribution_robustness.avg_degraded_accuracy * 100).toFixed(1)}%</strong></div>
                        <div>Adapted: <strong>{(reportResult.distribution_robustness.avg_adapted_accuracy * 100).toFixed(1)}%</strong></div>
                        <div>Gap: <strong>{(reportResult.distribution_robustness.global_robustness_gap * 100).toFixed(1)}%</strong></div>
                      </div>
                    </div>
                  )}

                  {reportResult.cascade_failure && (
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">Cascade Failure</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>Resilience: <strong>{(reportResult.cascade_failure.resilience_score * 100).toFixed(1)}%</strong></div>
                        <div>Critical: <strong className="text-red-500">{reportResult.cascade_failure.critical_events}</strong></div>
                        <div>Nodes Affected: <strong>{reportResult.cascade_failure.total_nodes_affected}</strong></div>
                      </div>
                    </div>
                  )}

                  {reportResult.automated_hardening && (
                    <div className="border rounded-lg p-4">
                      <div className="font-medium mb-2">Automated Hardening</div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>Best: <strong>{reportResult.automated_hardening.best_method}</strong></div>
                        <div>Robustness: <strong>{(reportResult.automated_hardening.best_robustness * 100).toFixed(1)}%</strong></div>
                        <div>Targets Met: <strong>{reportResult.automated_hardening.all_targets_met ? "✅ All" : "❌ Partial"}</strong></div>
                      </div>
                    </div>
                  )}

                  {reportResult.integration_map && (
                    <div className="border rounded-lg p-3 bg-muted/30">
                      <div className="text-sm font-medium mb-2">Integration Map (v1.89–v1.96)</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {Object.entries(reportResult.integration_map).map(([mod, ver]: [string, any]) => (
                          <div key={mod}>{mod}: <strong>{ver}</strong></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
