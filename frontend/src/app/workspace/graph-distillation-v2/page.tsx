"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const DISTILL_MODES = [
  { value: "response_based", label: "Response", desc: "Logit-level transfer" },
  { value: "feature_based", label: "Feature", desc: "Intermediate feature transfer" },
  { value: "relation_based", label: "Relation", desc: "Graph relation transfer" },
  { value: "attention_transfer", label: "Attention", desc: "Attention map transfer" },
  { value: "contrastive", label: "Contrastive", desc: "Contrastive distillation" },
  { value: "nas_guided", label: "NAS-Guided", desc: "Architecture-aware distillation" },
];

const COMPRESS_TYPES = [
  { value: "pruning", label: "Pruning", desc: "Weight/structured pruning" },
  { value: "quantization", label: "Quantization", desc: "Precision reduction" },
  { value: "low_rank", label: "Low-Rank", desc: "SVD decomposition" },
  { value: "knowledge_compilation", label: "Compiled", desc: "Knowledge compilation" },
  { value: "layer_reduction", label: "Layer Red.", desc: "Layer dropping" },
  { value: "channel_reduction", label: "Channel Red.", desc: "Channel pruning" },
];

const PRIVACY_LEVELS = [
  { value: "none", label: "None", desc: "No privacy constraint" },
  { value: "local_dp", label: "Local DP", desc: "Local differential privacy" },
  { value: "global_dp", label: "Global DP", desc: "Global differential privacy" },
  { value: "federated_dp", label: "Fed. DP", desc: "Federated DP" },
  { value: "secure_aggregation", label: "Secure Agg", desc: "Secure aggregation" },
];

const FAIRNESS_METRICS = [
  { value: "demographic_parity", label: "Demo. Parity", desc: "Equal selection rates" },
  { value: "equalized_odds", label: "Equal. Odds", desc: "Equal TPR/FPR" },
  { value: "predictive_parity", label: "Pred. Parity", desc: "Equal precision" },
  { value: "individual_fairness", label: "Indiv. Fair", desc: "Similar treatment" },
  { value: "calibration", label: "Calibration", desc: "Calibrated scores" },
  { value: "counterfactual", label: "Counterfactual", desc: "Counterfactual fairness" },
];

const EXPLAIN_METHODS = [
  { value: "attribution", label: "Attribution", desc: "Feature attribution" },
  { value: "counterfactual", label: "Counterfactual", desc: "What-if explanations" },
  { value: "concept", label: "Concept", desc: "Concept-based" },
  { value: "subgraph", label: "Subgraph", desc: "Subgraph importance" },
  { value: "attention", label: "Attention", desc: "Attention weights" },
  { value: "gradient", label: "Gradient", desc: "Gradient-based" },
];

const ENSEMBLE_STRATS = [
  { value: "averaging", label: "Averaging", desc: "Simple average" },
  { value: "weighted", label: "Weighted", desc: "Performance-weighted" },
  { value: "moe", label: "MoE", desc: "Mixture of experts" },
  { value: "cascading", label: "Cascading", desc: "Cascade teachers" },
  { value: "adaptive", label: "Adaptive", desc: "Adaptive gating" },
];

export default function GraphDistillationV2Page() {
  const [activeTab, setActiveTab] = useState("nas");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // NAS-aware state
  const [searchSpace, setSearchSpace] = useState("hybrid");
  const [nasObjective, setNasObjective] = useState("composite");
  const [compressRatio, setCompressRatio] = useState(0.5);
  const [temperature, setTemperature] = useState(3.0);
  const [alpha, setAlpha] = useState(0.7);
  const [nasIntegration, setNasIntegration] = useState(true);
  const [nasResult, setNasResult] = useState<any>(null);

  // Privacy state
  const [privacyLevel, setPrivacyLevel] = useState("local_dp");
  const [epsilon, setEpsilon] = useState(3.0);
  const [delta, setDelta] = useState(1e-5);
  const [noiseMult, setNoiseMult] = useState(1.1);
  const [privacyResult, setPrivacyResult] = useState<any>(null);

  // Fairness state
  const [fairMetric, setFairMetric] = useState("demographic_parity");
  const [compressType, setCompressType] = useState("pruning");
  const [fairWeight, setFairWeight] = useState(0.3);
  const [protectedAttrs, setProtectedAttrs] = useState("gender,age_group");
  const [fairResult, setFairResult] = useState<any>(null);

  // Explainability state
  const [explainMethod, setExplainMethod] = useState("attribution");
  const [compressTypeExp, setCompressTypeExp] = useState("pruning");
  const [explainWeight, setExplainWeight] = useState(0.3);
  const [attrTypes, setAttrTypes] = useState("gradient,integrated_gradient,attention");
  const [explainResult, setExplainResult] = useState<any>(null);

  // Ensemble state
  const [ensStrategy, setEnsStrategy] = useState("weighted");
  const [numTeachers, setNumTeachers] = useState(3);
  const [ensTemp, setEnsTemp] = useState(4.0);
  const [diversityWeight, setDiversityWeight] = useState(0.2);
  const [ensResult, setEnsResult] = useState<any>(null);

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

  const runNAS = async () => {
    const r = await call("/distill-v2/nas-aware", {
      search_space: searchSpace, objective: nasObjective,
      compression_ratio: compressRatio, temperature, alpha,
      nas_integration: nasIntegration,
    });
    setNasResult(r);
  };

  const runPrivacy = async () => {
    const r = await call("/distill-v2/privacy", {
      privacy_level: privacyLevel, epsilon, delta,
      compression_ratio: compressRatio, noise_multiplier: noiseMult,
    });
    setPrivacyResult(r);
  };

  const runFairness = async () => {
    const r = await call("/distill-v2/fairness", {
      fairness_metric: fairMetric, compression_type: compressType,
      compression_ratio: compressRatio, fairness_weight: fairWeight,
      protected_attributes: protectedAttrs.split(",").map(s => s.trim()),
    });
    setFairResult(r);
  };

  const runExplain = async () => {
    const r = await call("/distill-v2/explainability", {
      explain_method: explainMethod, compression_type: compressTypeExp,
      compression_ratio: compressRatio, explain_weight: explainWeight,
      attribution_types: attrTypes.split(",").map(s => s.trim()),
    });
    setExplainResult(r);
  };

  const runEnsemble = async () => {
    const r = await call("/distill-v2/ensemble", {
      ensemble_strategy: ensStrategy, num_teachers: numTeachers,
      compression_ratio: compressRatio, temperature: ensTemp,
      diversity_weight: diversityWeight,
    });
    setEnsResult(r);
  };

  const runReport = async () => {
    const r = await call("/distill-v2/report", {
      include_nas: true, include_privacy: true,
      include_fairness: true, include_explain: true,
      include_ensemble: true,
    });
    setReportResult(r);
  };

  const ScoreBadge = ({ value, label }: { value: number; label: string }) => {
    const color = value >= 0.9 ? "bg-green-600" : value >= 0.8 ? "bg-blue-600" : value >= 0.7 ? "bg-yellow-600" : "bg-red-600";
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{label}</span>
        <Badge className={`${color} text-white`}>{(value * 100).toFixed(1)}%</Badge>
      </div>
    );
  };

  const renderMetrics = (metrics: Record<string, number>) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
      {Object.entries(metrics).map(([k, v]) => (
        typeof v === "number" ? <ScoreBadge key={k} value={v} label={k.replace(/_/g, " ")} /> : null
      ))}
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Distillation & Compression v2</h1>
          <p className="text-sm text-gray-500">NAS-Aware Distillation with Privacy+Fairness+Explainability Preservation</p>
        </div>
        <Badge variant="outline" className="text-sm">v1.200.0</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm">Graph ID</Label>
        <Input value={graphId} onChange={e => setGraphId(e.target.value)} className="w-48" />
      </div>

      {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="nas">NAS Distill</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="fairness">Fairness</TabsTrigger>
          <TabsTrigger value="explain">Explain</TabsTrigger>
          <TabsTrigger value="ensemble">Ensemble</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        {/* NAS-Aware Distillation */}
        <TabsContent value="nas">
          <Card>
            <CardHeader><CardTitle>NAS-Aware Architecture Distillation</CardTitle>
            <CardDescription>Leverage NAS v2 search results for optimal teacher-student pairing</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><Label>Search Space</Label>
                  <select className="w-full border rounded p-2 text-sm" value={searchSpace} onChange={e => setSearchSpace(e.target.value)}>
                    {DISTILL_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div><Label>Objective</Label>
                  <select className="w-full border rounded p-2 text-sm" value={nasObjective} onChange={e => setNasObjective(e.target.value)}>
                    <option value="accuracy">Accuracy</option><option value="fairness_score">Fairness</option>
                    <option value="explainability">Explainability</option><option value="robustness">Robustness</option>
                    <option value="composite">Composite</option>
                  </select>
                </div>
                <div><Label>Compression Ratio</Label><Input type="number" step={0.1} min={0.1} max={0.9} value={compressRatio} onChange={e => setCompressRatio(+e.target.value)} /></div>
                <div><Label>Temperature</Label><Input type="number" step={0.5} value={temperature} onChange={e => setTemperature(+e.target.value)} /></div>
                <div><Label>Alpha (loss weight)</Label><Input type="number" step={0.1} min={0} max={1} value={alpha} onChange={e => setAlpha(+e.target.value)} /></div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" checked={nasIntegration} onChange={e => setNasIntegration(e.target.checked)} />
                  <Label>NAS Integration</Label>
                </div>
              </div>
              <Button onClick={runNAS} disabled={loading}>{loading ? "Running..." : "Run NAS-Aware Distillation"}</Button>
              {nasResult && (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-sm">Task: {nasResult.task_id}</p>
                    <p className="text-xs text-gray-500">Convergence epoch: {nasResult.training_trajectory?.convergence_epoch}</p>
                  </div>
                  <h4 className="font-semibold text-sm">Distillation Metrics</h4>
                  {nasResult.distillation_metrics && renderMetrics(nasResult.distillation_metrics)}
                  {nasResult.nas_integration_scores && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">NAS Integration Scores</h4>
                      {renderMetrics(nasResult.nas_integration_scores)}
                    </div>
                  )}
                  {nasResult.engine_integration && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">Engine Integration</h4>
                      {renderMetrics(nasResult.engine_integration)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy-Preserving */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader><CardTitle>Privacy-Preserving Distillation</CardTitle>
            <CardDescription>Differential privacy guarantees during knowledge transfer</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><Label>Privacy Level</Label>
                  <select className="w-full border rounded p-2 text-sm" value={privacyLevel} onChange={e => setPrivacyLevel(e.target.value)}>
                    {PRIVACY_LEVELS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div><Label>Epsilon (ε)</Label><Input type="number" step={0.5} value={epsilon} onChange={e => setEpsilon(+e.target.value)} /></div>
                <div><Label>Delta (δ)</Label><Input type="text" value={delta} onChange={e => setDelta(+e.target.value)} /></div>
                <div><Label>Compression Ratio</Label><Input type="number" step={0.1} min={0.1} max={0.9} value={compressRatio} onChange={e => setCompressRatio(+e.target.value)} /></div>
                <div><Label>Noise Multiplier</Label><Input type="number" step={0.1} value={noiseMult} onChange={e => setNoiseMult(+e.target.value)} /></div>
              </div>
              <Button onClick={runPrivacy} disabled={loading}>{loading ? "Running..." : "Run Privacy-Preserving Distillation"}</Button>
              {privacyResult && (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-sm">Task: {privacyResult.task_id}</p>
                    <p className="text-xs text-gray-500">Effective ε: {privacyResult.privacy_budget?.effective_epsilon} | Composition: {privacyResult.privacy_budget?.composition_method}</p>
                  </div>
                  <h4 className="font-semibold text-sm">Privacy Metrics</h4>
                  {privacyResult.privacy_metrics && renderMetrics(privacyResult.privacy_metrics)}
                  <h4 className="font-semibold text-sm mt-2">Distillation Metrics</h4>
                  {privacyResult.distillation_metrics && renderMetrics(privacyResult.distillation_metrics)}
                  {privacyResult.engine_integration && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">Engine Integration</h4>
                      {renderMetrics(privacyResult.engine_integration)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fairness-Preserving */}
        <TabsContent value="fairness">
          <Card>
            <CardHeader><CardTitle>Fairness-Preserving Compression</CardTitle>
            <CardDescription>Maintain fairness properties during model compression</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><Label>Fairness Metric</Label>
                  <select className="w-full border rounded p-2 text-sm" value={fairMetric} onChange={e => setFairMetric(e.target.value)}>
                    {FAIRNESS_METRICS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div><Label>Compression Type</Label>
                  <select className="w-full border rounded p-2 text-sm" value={compressType} onChange={e => setCompressType(e.target.value)}>
                    {COMPRESS_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div><Label>Compression Ratio</Label><Input type="number" step={0.1} min={0.1} max={0.9} value={compressRatio} onChange={e => setCompressRatio(+e.target.value)} /></div>
                <div><Label>Fairness Weight</Label><Input type="number" step={0.1} min={0} max={1} value={fairWeight} onChange={e => setFairWeight(+e.target.value)} /></div>
                <div className="col-span-2"><Label>Protected Attributes (comma-separated)</Label>
                  <Input value={protectedAttrs} onChange={e => setProtectedAttrs(e.target.value)} />
                </div>
              </div>
              <Button onClick={runFairness} disabled={loading}>{loading ? "Running..." : "Run Fairness Compression"}</Button>
              {fairResult && (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-sm">Task: {fairResult.task_id}</p>
                    <p className="text-xs text-gray-500">Actual ratio: {fairResult.compression_metrics?.actual_ratio} | Fidelity: {fairResult.compression_metrics?.fidelity_score}</p>
                  </div>
                  <h4 className="font-semibold text-sm">Fairness Metrics</h4>
                  {fairResult.fairness_metrics && renderMetrics(fairResult.fairness_metrics)}
                  {fairResult.per_group_performance && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">Per-Group Performance</h4>
                      <div className="space-y-1">
                        {Object.entries(fairResult.per_group_performance).map(([attr, perf]: [string, any]) => (
                          <div key={attr} className="bg-gray-50 p-2 rounded text-xs">
                            <span className="font-semibold">{attr}:</span>
                            <span className="ml-2">Retention: {((perf.fairness_retention || 0) * 100).toFixed(1)}%</span>
                            <span className="ml-2">Accuracy: {((perf.student_accuracy || 0) * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explainability-Preserving */}
        <TabsContent value="explain">
          <Card>
            <CardHeader><CardTitle>Explainability-Preserving Compression</CardTitle>
            <CardDescription>Maintain model interpretability during compression</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><Label>Explain Method</Label>
                  <select className="w-full border rounded p-2 text-sm" value={explainMethod} onChange={e => setExplainMethod(e.target.value)}>
                    {EXPLAIN_METHODS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>
                <div><Label>Compression Type</Label>
                  <select className="w-full border rounded p-2 text-sm" value={compressTypeExp} onChange={e => setCompressTypeExp(e.target.value)}>
                    {COMPRESS_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div><Label>Compression Ratio</Label><Input type="number" step={0.1} min={0.1} max={0.9} value={compressRatio} onChange={e => setCompressRatio(+e.target.value)} /></div>
                <div><Label>Explain Weight</Label><Input type="number" step={0.1} min={0} max={1} value={explainWeight} onChange={e => setExplainWeight(+e.target.value)} /></div>
                <div className="col-span-2"><Label>Attribution Types (comma-separated)</Label>
                  <Input value={attrTypes} onChange={e => setAttrTypes(e.target.value)} />
                </div>
              </div>
              <Button onClick={runExplain} disabled={loading}>{loading ? "Running..." : "Run Explain Compression"}</Button>
              {explainResult && (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-sm">Task: {explainResult.task_id}</p>
                    <p className="text-xs text-gray-500">Stability: {explainResult.explain_metrics?.attribution_stability} | Concept: {explainResult.explain_metrics?.concept_consistency}</p>
                  </div>
                  <h4 className="font-semibold text-sm">Explainability Metrics</h4>
                  {explainResult.explain_metrics && renderMetrics(explainResult.explain_metrics)}
                  {explainResult.attribution_preservation && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">Attribution Preservation</h4>
                      <div className="space-y-1">
                        {Object.entries(explainResult.attribution_preservation).map(([type, data]: [string, any]) => (
                          <div key={type} className="bg-gray-50 p-2 rounded text-xs">
                            <span className="font-semibold">{type}:</span>
                            <span className="ml-2">Correlation: {((data.correlation || 0) * 100).toFixed(1)}%</span>
                            <span className="ml-2">Top-K: {((data.top_k_overlap || 0) * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Teacher Ensemble */}
        <TabsContent value="ensemble">
          <Card>
            <CardHeader><CardTitle>Multi-Teacher Ensemble Distillation</CardTitle>
            <CardDescription>Robust knowledge transfer from multiple specialized teachers</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><Label>Ensemble Strategy</Label>
                  <select className="w-full border rounded p-2 text-sm" value={ensStrategy} onChange={e => setEnsStrategy(e.target.value)}>
                    {ENSEMBLE_STRATS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div><Label>Num Teachers</Label><Input type="number" min={2} max={8} value={numTeachers} onChange={e => setNumTeachers(+e.target.value)} /></div>
                <div><Label>Compression Ratio</Label><Input type="number" step={0.1} min={0.1} max={0.9} value={compressRatio} onChange={e => setCompressRatio(+e.target.value)} /></div>
                <div><Label>Temperature</Label><Input type="number" step={0.5} value={ensTemp} onChange={e => setEnsTemp(+e.target.value)} /></div>
                <div><Label>Diversity Weight</Label><Input type="number" step={0.1} min={0} max={1} value={diversityWeight} onChange={e => setDiversityWeight(+e.target.value)} /></div>
              </div>
              <Button onClick={runEnsemble} disabled={loading}>{loading ? "Running..." : "Run Ensemble Distillation"}</Button>
              {ensResult && (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-sm">Task: {ensResult.task_id}</p>
                    <p className="text-xs text-gray-500">Teachers: {ensResult.teachers?.length} | Strategy: {ensResult.ensemble_strategy}</p>
                  </div>
                  {ensResult.teachers && (
                    <div>
                      <h4 className="font-semibold text-sm">Teacher Models</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                        {ensResult.teachers.map((t: any) => (
                          <div key={t.teacher_id} className="bg-gray-50 p-2 rounded text-xs">
                            <span className="font-semibold">{t.teacher_id}</span>
                            <span className="ml-1 text-gray-500">({t.specialization})</span>
                            <br/>Accuracy: {((t.accuracy || 0) * 100).toFixed(1)}%
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <h4 className="font-semibold text-sm">Ensemble Metrics</h4>
                  {ensResult.ensemble_metrics && renderMetrics(ensResult.ensemble_metrics)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report */}
        <TabsContent value="report">
          <Card>
            <CardHeader><CardTitle>Comprehensive Distillation v2 Report</CardTitle>
            <CardDescription>Full integration report across all distillation modules</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={runReport} disabled={loading}>{loading ? "Generating..." : "Generate Report"}</Button>
              {reportResult && (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">Overall Score: <Badge className="bg-green-600 text-white">{((reportResult.overall_distillation_score || 0) * 100).toFixed(1)}%</Badge></p>
                    <p className="text-xs text-gray-500 mt-1">Task: {reportResult.task_id} | Version: {reportResult.version}</p>
                  </div>
                  {reportResult.module_summaries && (
                    <div>
                      <h4 className="font-semibold text-sm">Module Summaries</h4>
                      <div className="space-y-1">
                        {Object.entries(reportResult.module_summaries).map(([mod, data]: [string, any]) => (
                          <div key={mod} className="bg-gray-50 p-2 rounded text-xs flex justify-between">
                            <span className="font-semibold">{mod}</span>
                            <span>{data.status} | Tasks: {data.tasks}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {reportResult.integration_map && (
                    <div>
                      <h4 className="font-semibold text-sm">Integration Map (v1.89–v1.99)</h4>
                      {renderMetrics(reportResult.integration_map)}
                    </div>
                  )}
                  {reportResult.recommendations && (
                    <div>
                      <h4 className="font-semibold text-sm">Recommendations</h4>
                      <div className="space-y-1">
                        {reportResult.recommendations.map((r: any, i: number) => (
                          <div key={i} className="bg-gray-50 p-2 rounded text-xs">
                            <Badge className={r.priority === "high" ? "bg-red-600 text-white" : r.priority === "medium" ? "bg-yellow-600 text-white" : "bg-gray-500 text-white"}>
                              {r.priority}
                            </Badge>
                            <span className="ml-2">{r.action}</span>
                            <span className="ml-2 text-gray-500">({r.expected_gain})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {reportResult.capabilities && (
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <h4 className="font-semibold">Capabilities</h4>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {Object.entries(reportResult.capabilities).map(([cap, vals]: [string, any]) => (
                          <div key={cap}><span className="font-semibold">{cap}:</span> {vals.join(", ")}</div>
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
