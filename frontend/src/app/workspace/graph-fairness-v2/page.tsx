"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const FAIRNESS_METRICS = [
  { value: "all", label: "All Metrics", desc: "Full fairness audit" },
  { value: "demographic_parity", label: "Demographic Parity", desc: "Equal positive rate across groups" },
  { value: "equalized_odds", label: "Equalized Odds", desc: "Equal TPR/FPR across groups" },
  { value: "predictive_parity", label: "Predictive Parity", desc: "Equal precision across groups" },
  { value: "individual_fairness", label: "Individual Fairness", desc: "Similar individuals, similar outcomes" },
  { value: "counterfactual_fairness", label: "Counterfactual", desc: "Same outcome under perturbation" },
  { value: "calibration_fairness", label: "Calibration", desc: "Equal calibration across groups" },
];

const BIAS_TYPES = [
  { value: "representation_bias", label: "Representation", desc: "Unequal group representation" },
  { value: "degree_bias", label: "Degree", desc: "Structural connectivity advantage" },
  { value: "community_bias", label: "Community", desc: "Cluster-level disparities" },
  { value: "attribute_bias", label: "Attribute", desc: "Sensitive attribute leakage" },
  { value: "structural_bias", label: "Structural", desc: "Neighborhood composition bias" },
  { value: "label_bias", label: "Label", desc: "Outcome distribution disparities" },
];

const MITIGATION_STRATEGIES = [
  { value: "reweighting", label: "Reweighting", desc: "Balance sample importance" },
  { value: "adversarial_debiasing", label: "Adversarial Debiasing", desc: "Adversarial training for fairness" },
  { value: "fair_representation", label: "Fair Representation", desc: "Learn fair latent features" },
  { value: "calibrated_fairness", label: "Calibrated Fairness", desc: "Post-hoc group calibration" },
  { value: "graph_augmentation", label: "Graph Augmentation", desc: "Augment edges/nodes for balance" },
  { value: "constraint_optimization", label: "Constraint Opt", desc: "Fairness in optimization objective" },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: "destructive",
  high: "destructive",
  medium: "default",
  low: "secondary",
  negligible: "outline",
};

export default function GraphFairnessV2Page() {
  const [activeTab, setActiveTab] = useState("metrics");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  // Metrics params
  const [metric, setMetric] = useState("all");
  const [sensitiveAttr, setSensitiveAttr] = useState("gender");
  const [fairnessThreshold, setFairnessThreshold] = useState(0.1);
  const [numGroups, setNumGroups] = useState(4);

  // Bias detection params
  const [selectedBiasTypes, setSelectedBiasTypes] = useState<string[]>([
    "representation_bias", "degree_bias", "attribute_bias", "label_bias",
  ]);
  const [sensitiveAttrs, setSensitiveAttrs] = useState("gender,race");
  const [severityThreshold, setSeverityThreshold] = useState("medium");

  // Mitigation params
  const [mitigationStrategy, setMitigationStrategy] = useState("adversarial_debiasing");
  const [fairnessTarget, setFairnessTarget] = useState(0.05);
  const [mitigationAttr, setMitigationAttr] = useState("gender");

  // Audit params
  const [auditScope, setAuditScope] = useState("full");
  const [auditAttrs, setAuditAttrs] = useState("gender,race,age_group");
  const [auditThreshold, setAuditThreshold] = useState(0.1);

  // Fair AutoML params
  const [fairnessWeight, setFairnessWeight] = useState(0.4);
  const [accuracyWeight, setAccuracyWeight] = useState(0.6);
  const [autoMlTrials, setAutoMlTrials] = useState(20);

  // Monitoring params
  const [monitorMetrics, setMonitorMetrics] = useState("demographic_parity,equalized_odds,predictive_parity");
  const [windowSize, setWindowSize] = useState(10);
  const [alertThreshold, setAlertThreshold] = useState(0.15);

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

  const handleMetrics = () => callAPI("/fairness-v2/metrics", {
    graph_id: graphId, metric, sensitive_attribute: sensitiveAttr,
    threshold: fairnessThreshold, num_groups: numGroups, num_samples: 1000,
  });

  const handleBiasDetection = () => callAPI("/fairness-v2/bias-detection", {
    graph_id: graphId, bias_types: selectedBiasTypes,
    sensitive_attributes: sensitiveAttrs.split(",").map(s => s.trim()),
    severity_threshold: severityThreshold,
  });

  const handleMitigation = () => callAPI("/fairness-v2/mitigation", {
    graph_id: graphId, strategy: mitigationStrategy,
    sensitive_attribute: mitigationAttr, fairness_target: fairnessTarget,
  });

  const handleAudit = () => callAPI("/fairness-v2/audit", {
    graph_id: graphId,
    sensitive_attributes: auditAttrs.split(",").map(s => s.trim()),
    audit_scope: auditScope, threshold: auditThreshold,
  });

  const handleFairAutoML = () => callAPI("/fairness-v2/fair-automl", {
    graph_id: graphId, fairness_weight: fairnessWeight,
    accuracy_weight: accuracyWeight,
    strategies: ["bayesian", "evolutionary", "hyperband"],
    num_trials: autoMlTrials,
  });

  const handleMonitoring = () => callAPI("/fairness-v2/monitoring", {
    graph_id: graphId,
    metrics: monitorMetrics.split(",").map(s => s.trim()),
    window_size: windowSize, alert_threshold: alertThreshold,
  });

  const toggleBiasType = (bt: string) => {
    setSelectedBiasTypes(prev =>
      prev.includes(bt) ? prev.filter(b => b !== bt) : [...prev, bt]
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

  const renderMetricsBadge = (pass: boolean) => (
    <Badge variant={pass ? "default" : "destructive"} className="text-xs">
      {pass ? "PASS" : "FAIL"}
    </Badge>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Fairness Audit & Bias Mitigation</h1>
          <p className="text-muted-foreground text-sm">
            Comprehensive fairness metrics, bias detection, mitigation strategies, and continuous monitoring for GNNs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Graph ID</Label>
          <Input value={graphId} onChange={e => setGraphId(e.target.value)} className="w-32 h-8 text-xs" />
          <Badge variant="outline" className="text-xs">v1.94</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="metrics">Fairness Metrics</TabsTrigger>
          <TabsTrigger value="bias">Bias Detection</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
          <TabsTrigger value="audit">Full Audit</TabsTrigger>
          <TabsTrigger value="fair-automl">Fair AutoML</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Tab 1: Fairness Metrics */}
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Compute Fairness Metrics</CardTitle>
                <CardDescription>
                  Evaluate GNN predictions across 6 fairness dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Metric</Label>
                  <select
                    className="w-full h-8 text-xs border rounded px-2"
                    value={metric}
                    onChange={e => setMetric(e.target.value)}
                  >
                    {FAIRNESS_METRICS.map(m => (
                      <option key={m.value} value={m.value}>{m.label} — {m.desc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Sensitive Attribute</Label>
                  <Input value={sensitiveAttr} onChange={e => setSensitiveAttr(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Threshold</Label>
                    <Input type="number" step="0.01" value={fairnessThreshold}
                      onChange={e => setFairnessThreshold(parseFloat(e.target.value) || 0.1)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Num Groups</Label>
                    <Input type="number" min="2" max="10" value={numGroups}
                      onChange={e => setNumGroups(parseInt(e.target.value) || 4)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleMetrics} disabled={loading} className="w-full" size="sm">
                  {loading ? "Computing..." : "Compute Metrics"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Available Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {FAIRNESS_METRICS.filter(m => m.value !== "all").map(m => (
                  <div key={m.value} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground">{m.desc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Fairness Metrics Result")}
        </TabsContent>

        {/* Tab 2: Bias Detection */}
        <TabsContent value="bias">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Bias Detection Engine</CardTitle>
                <CardDescription>
                  Detect 6 types of bias across graph structure, features, and predictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Bias Types to Check</Label>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {BIAS_TYPES.map(bt => (
                      <label key={bt.value} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBiasTypes.includes(bt.value)}
                          onChange={() => toggleBiasType(bt.value)}
                          className="h-3 w-3"
                        />
                        {bt.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Sensitive Attributes (comma-separated)</Label>
                  <Input value={sensitiveAttrs} onChange={e => setSensitiveAttrs(e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Min Severity Threshold</Label>
                  <select
                    className="w-full h-8 text-xs border rounded px-2"
                    value={severityThreshold}
                    onChange={e => setSeverityThreshold(e.target.value)}
                  >
                    <option value="negligible">Negligible</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <Button onClick={handleBiasDetection} disabled={loading} className="w-full" size="sm">
                  {loading ? "Detecting..." : "Run Bias Detection"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Bias Type Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {BIAS_TYPES.map(bt => (
                  <div key={bt.value} className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-xs">{bt.label}</Badge>
                    <span className="text-muted-foreground">{bt.desc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Bias Detection Result")}
        </TabsContent>

        {/* Tab 3: Mitigation */}
        <TabsContent value="mitigation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Fairness Mitigation</CardTitle>
                <CardDescription>
                  Apply mitigation strategies and measure before/after improvement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Mitigation Strategy</Label>
                  <select
                    className="w-full h-8 text-xs border rounded px-2"
                    value={mitigationStrategy}
                    onChange={e => setMitigationStrategy(e.target.value)}
                  >
                    {MITIGATION_STRATEGIES.map(s => (
                      <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Target Sensitive Attribute</Label>
                  <Input value={mitigationAttr} onChange={e => setMitigationAttr(e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Fairness Target (max disparity)</Label>
                  <Input type="number" step="0.01" value={fairnessTarget}
                    onChange={e => setFairnessTarget(parseFloat(e.target.value) || 0.05)} className="h-8 text-xs" />
                </div>
                <Button onClick={handleMitigation} disabled={loading} className="w-full" size="sm">
                  {loading ? "Applying..." : "Apply Mitigation"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Mitigation Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {MITIGATION_STRATEGIES.map(s => (
                  <div key={s.value} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{s.label}</span>
                    <span className="text-muted-foreground">{s.desc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Mitigation Result")}
        </TabsContent>

        {/* Tab 4: Full Audit */}
        <TabsContent value="audit">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Comprehensive Fairness Audit</CardTitle>
                <CardDescription>
                  Full 4-stage audit: pre-processing, in-processing, post-processing, monitoring plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Audit Scope</Label>
                  <select
                    className="w-full h-8 text-xs border rounded px-2"
                    value={auditScope}
                    onChange={e => setAuditScope(e.target.value)}
                  >
                    <option value="full">Full Pipeline Audit</option>
                    <option value="pre_only">Pre-Processing Only</option>
                    <option value="post_only">Post-Processing Only</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Sensitive Attributes (comma-separated)</Label>
                  <Input value={auditAttrs} onChange={e => setAuditAttrs(e.target.value)} className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Fairness Threshold</Label>
                  <Input type="number" step="0.01" value={auditThreshold}
                    onChange={e => setAuditThreshold(parseFloat(e.target.value) || 0.1)} className="h-8 text-xs" />
                </div>
                <Button onClick={handleAudit} disabled={loading} className="w-full" size="sm">
                  {loading ? "Auditing..." : "Run Full Audit"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Audit Stages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="default">1</Badge>
                  <span>Pre-Processing — Representation, feature correlation, degree distribution</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="default">2</Badge>
                  <span>In-Processing — Gradient fairness, embedding fairness, message passing bias</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="default">3</Badge>
                  <span>Post-Processing — DP, EO, PP per attribute group</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="default">4</Badge>
                  <span>Monitoring — Drift detection, alert rules, escalation</span>
                </div>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Audit Result")}
        </TabsContent>

        {/* Tab 5: Fair AutoML */}
        <TabsContent value="fair-automl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Fairness-Constrained AutoML</CardTitle>
                <CardDescription>
                  Search for optimal accuracy-fairness tradeoff using Pareto optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Fairness Weight</Label>
                    <Input type="number" step="0.1" min="0" max="1" value={fairnessWeight}
                      onChange={e => setFairnessWeight(parseFloat(e.target.value) || 0.4)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Accuracy Weight</Label>
                    <Input type="number" step="0.1" min="0" max="1" value={accuracyWeight}
                      onChange={e => setAccuracyWeight(parseFloat(e.target.value) || 0.6)} className="h-8 text-xs" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Number of Trials</Label>
                  <Input type="number" min="5" max="100" value={autoMlTrials}
                    onChange={e => setAutoMlTrials(parseInt(e.target.value) || 20)} className="h-8 text-xs" />
                </div>
                <Button onClick={handleFairAutoML} disabled={loading} className="w-full" size="sm">
                  {loading ? "Searching..." : "Run Fair AutoML Search"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Integration with v1.93 AutoML</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>Extends v1.93 AutoML pipeline with fairness constraints.</p>
                <p>Searches for Pareto-optimal configurations balancing accuracy and fairness.</p>
                <p>Strategies: Bayesian, Evolutionary, HyperBand</p>
                <p>Output: Pareto front, best tradeoff, fairness-accuracy correlation</p>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Fair AutoML Result")}
        </TabsContent>

        {/* Tab 6: Monitoring */}
        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Continuous Fairness Monitoring</CardTitle>
                <CardDescription>
                  Track fairness metrics over time with drift detection and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Metrics to Monitor (comma-separated)</Label>
                  <Input value={monitorMetrics} onChange={e => setMonitorMetrics(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Window Size</Label>
                    <Input type="number" min="5" max="50" value={windowSize}
                      onChange={e => setWindowSize(parseInt(e.target.value) || 10)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Alert Threshold</Label>
                    <Input type="number" step="0.01" value={alertThreshold}
                      onChange={e => setAlertThreshold(parseFloat(e.target.value) || 0.15)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleMonitoring} disabled={loading} className="w-full" size="sm">
                  {loading ? "Monitoring..." : "Run Monitoring Check"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Monitoring Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>Time-series fairness tracking with baseline drift detection</p>
                <p>Automatic alert generation when thresholds are exceeded</p>
                <p>Trend analysis: increasing/decreasing fairness drift</p>
                <p>Overall status: healthy / warning / critical</p>
                <p>Automated retraining recommendations</p>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Monitoring Result")}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">Processing fairness analysis...</div>
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
