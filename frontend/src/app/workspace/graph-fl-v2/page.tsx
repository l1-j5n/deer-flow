"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const AGGREGATIONS = [
  { value: "fedavg", label: "FedAvg", desc: "Standard federated averaging" },
  { value: "fedprox", label: "FedProx", desc: "Proximal regularization" },
  { value: "scaffold", label: "SCAFFOLD", desc: "Variance reduction" },
  { value: "fednova", label: "FedNova", desc: "Normalized averaging" },
  { value: "moon", label: "MOON", desc: "Contrastive model collaboration" },
];

const COMPRESS_METHODS = [
  { value: "none", label: "None", desc: "No compression" },
  { value: "topk", label: "TopK", desc: "Top-K sparsification" },
  { value: "randomk", label: "RandomK", desc: "Random sparsification" },
  { value: "quantization", label: "Quantize", desc: "Gradient quantization" },
  { value: "sparsification", label: "Sparse", desc: "Threshold sparsification" },
  { value: "mixed", label: "Mixed", desc: "Combined compression" },
];

const CLIENT_SELECTIONS = [
  { value: "random", label: "Random", desc: "Uniform random selection" },
  { value: "performance", label: "Performance", desc: "Select high-performing" },
  { value: "diversity", label: "Diversity", desc: "Maximize data diversity" },
  { value: "uncertainty", label: "Uncertainty", desc: "Uncertainty-weighted" },
  { value: "resource_aware", label: "Resource", desc: "Resource-aware selection" },
];

const HETEROS = [
  { value: "iid", label: "IID", desc: "Identical distribution" },
  { value: "non_iid_label", label: "Non-IID Label", desc: "Label skew" },
  { value: "non_iid_quantity", label: "Non-IID Qty", desc: "Quantity imbalance" },
  { value: "non_iid_feature", label: "Non-IID Feature", desc: "Feature shift" },
  { value: "non_iid_temporal", label: "Non-IID Temporal", desc: "Temporal drift" },
];

const DISTILL_MODES = [
  { value: "logit_matching", label: "Logit Match", desc: "Soft label matching" },
  { value: "feature_matching", label: "Feature Match", desc: "Feature alignment" },
  { value: "relation_matching", label: "Relation Match", desc: "Relation knowledge" },
  { value: "contrastive", label: "Contrastive", desc: "Contrastive distillation" },
  { value: "nas_guided", label: "NAS-Guided", desc: "Architecture-aware" },
];

const PROTOCOLS = [
  { value: "plain", label: "Plain", desc: "No encryption" },
  { value: "secagg", label: "SecAgg", desc: "Secure aggregation" },
  { value: "homomorphic", label: "HE", desc: "Homomorphic encryption" },
  { value: "tee", label: "TEE", desc: "Trusted execution" },
  { value: "dp_secagg", label: "DP+SecAgg", desc: "DP + Secure aggregation" },
];

export default function GraphFLV2Page() {
  const [activeTab, setActiveTab] = useState("round");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Round state
  const [numClients, setNumClients] = useState(10);
  const [aggregation, setAggregation] = useState("fedavg");
  const [numRounds, setNumRounds] = useState(30);
  const [localEpochs, setLocalEpochs] = useState(5);
  const [lr, setLr] = useState(0.01);
  const [clientFraction, setClientFraction] = useState(0.5);
  const [roundResult, setRoundResult] = useState<any>(null);

  // Secure state
  const [protocol, setProtocol] = useState("secagg");
  const [epsilon, setEpsilon] = useState(3.0);
  const [clipNorm, setClipNorm] = useState(1.0);
  const [secureResult, setSecureResult] = useState<any>(null);

  // Hetero state
  const [hetero, setHetero] = useState("non_iid_label");
  const [adaptStrategy, setAdaptStrategy] = useState("personalized");
  const [personalize, setPersonalize] = useState(true);
  const [heteroResult, setHeteroResult] = useState<any>(null);

  // Comm state
  const [compress, setCompress] = useState("topk");
  const [modelSize, setModelSize] = useState(10.0);
  const [targetReduction, setTargetReduction] = useState(0.9);
  const [commRounds, setCommRounds] = useState(30);
  const [commResult, setCommResult] = useState<any>(null);

  // Distill state
  const [distillMode, setDistillMode] = useState("logit_matching");
  const [distillTemp, setDistillTemp] = useState(3.0);
  const [nasOptimized, setNasOptimized] = useState(true);
  const [distillClients, setDistillClients] = useState(10);
  const [distillRounds, setDistillRounds] = useState(30);
  const [distillResult, setDistillResult] = useState<any>(null);

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

  const runRound = async () => {
    const r = await call("/fl-v2/round", {
      num_clients: numClients, aggregation, num_rounds: numRounds,
      local_epochs: localEpochs, learning_rate: lr, client_fraction: clientFraction,
    });
    setRoundResult(r);
  };

  const runSecure = async () => {
    const r = await call("/fl-v2/secure", {
      protocol, num_clients: numClients, epsilon, clipping_norm: clipNorm,
    });
    setSecureResult(r);
  };

  const runHetero = async () => {
    const r = await call("/fl-v2/heterogeneous", {
      heterogeneity: hetero, num_clients: numClients,
      adaptation_strategy: adaptStrategy, personalization: personalize,
    });
    setHeteroResult(r);
  };

  const runComm = async () => {
    const r = await call("/fl-v2/communication", {
      compression: compress, num_rounds: commRounds,
      model_size_mb: modelSize, target_reduction: targetReduction,
    });
    setCommResult(r);
  };

  const runDistill = async () => {
    const r = await call("/fl-v2/distill", {
      distill_mode: distillMode, num_clients: distillClients,
      num_rounds: distillRounds, temperature: distillTemp,
      nas_optimized: nasOptimized,
    });
    setDistillResult(r);
  };

  const runReport = async () => {
    const r = await call("/fl-v2/report", {});
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

  const renderMetrics = (metrics: Record<string, any>) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
      {Object.entries(metrics).map(([k, v]) => (
        typeof v === "number" ? <ScoreBadge key={k} value={v} label={k.replace(/_/g, " ")} /> : null
      ))}
    </div>
  );

  const SelectInput = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div>
      <Label>{label}</Label>
      <select className="w-full border rounded p-2 text-sm" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  const NumInput = ({ label, value, onChange, step, min, max }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number }) => (
    <div>
      <Label>{label}</Label>
      <Input type="number" step={step} min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} />
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Federated Learning v2</h1>
          <p className="text-sm text-gray-500">Distillation-Aware FL with NAS-Optimized Local Models</p>
        </div>
        <Badge variant="outline" className="text-sm">v1.201.0</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm">Graph ID</Label>
        <Input value={graphId} onChange={e => setGraphId(e.target.value)} className="w-48" />
      </div>

      {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="round">FL Round</TabsTrigger>
          <TabsTrigger value="secure">Secure</TabsTrigger>
          <TabsTrigger value="hetero">Hetero</TabsTrigger>
          <TabsTrigger value="comm">Comm</TabsTrigger>
          <TabsTrigger value="distill">Fed Distill</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        {/* Federated Round */}
        <TabsContent value="round">
          <Card>
            <CardHeader><CardTitle>Federated Round Coordination</CardTitle>
            <CardDescription>Aggregation strategies and round management</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SelectInput label="Aggregation" value={aggregation} onChange={setAggregation} options={AGGREGATIONS} />
                <NumInput label="Num Clients" value={numClients} onChange={setNumClients} min={2} max={100} />
                <NumInput label="Num Rounds" value={numRounds} onChange={setNumRounds} min={1} max={200} />
                <NumInput label="Local Epochs" value={localEpochs} onChange={setLocalEpochs} min={1} max={50} />
                <NumInput label="Learning Rate" value={lr} onChange={setLr} step={0.001} min={0.0001} max={1} />
                <NumInput label="Client Fraction" value={clientFraction} onChange={setClientFraction} step={0.1} min={0.1} max={1} />
              </div>
              <Button onClick={runRound} disabled={loading}>{loading ? "Running..." : "Run Federated Round"}</Button>
              {roundResult && (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-sm">Task: {roundResult.task_id}</p>
                    <p className="text-xs text-gray-500">Convergence: Round {roundResult.convergence?.round}/{roundResult.convergence?.total_rounds} | Speed: {roundResult.convergence?.convergence_speed}</p>
                  </div>
                  <h4 className="font-semibold text-sm">Final Metrics</h4>
                  {roundResult.final_metrics && renderMetrics(roundResult.final_metrics)}
                  {roundResult.round_history && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">Round History (last 5)</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {roundResult.round_history.slice(-5).map((r: any) => (
                          <div key={r.round} className="bg-gray-50 p-1.5 rounded text-xs flex justify-between">
                            <span>R{r.round}</span>
                            <span>Acc: {((r.global_accuracy || 0) * 100).toFixed(1)}%</span>
                            <span>Loss: {r.global_loss}</span>
                            <span>{r.communication_mb} MB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {roundResult.engine_integration && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">Engine Integration</h4>
                      {renderMetrics(roundResult.engine_integration)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Secure Aggregation */}
        <TabsContent value="secure">
          <Card>
            <CardHeader><CardTitle>Secure Aggregation</CardTitle>
            <CardDescription>Privacy-preserving aggregation protocols</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SelectInput label="Protocol" value={protocol} onChange={setProtocol} options={PROTOCOLS} />
                <NumInput label="Num Clients" value={numClients} onChange={setNumClients} min={2} max={100} />
                <NumInput label="Epsilon (ε)" value={epsilon} onChange={setEpsilon} step={0.5} />
                <NumInput label="Clipping Norm" value={clipNorm} onChange={setClipNorm} step={0.1} min={0.01} max={10} />
              </div>
              <Button onClick={runSecure} disabled={loading}>{loading ? "Running..." : "Run Secure Aggregation"}</Button>
              {secureResult && (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-sm">Task: {secureResult.task_id}</p>
                    <p className="text-xs text-gray-500">Final ε: {secureResult.privacy_budget?.final_epsilon} | Composition: {secureResult.privacy_budget?.composition_method}</p>
                  </div>
                  {secureResult.security_properties && (
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <h4 className="font-semibold">Security Properties</h4>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {Object.entries(secureResult.security_properties).map(([k, v]) => (
                          <div key={k}><span className="font-medium">{k}:</span> {String(v)}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  <h4 className="font-semibold text-sm">Security Metrics</h4>
                  {secureResult.security_metrics && renderMetrics(secureResult.security_metrics)}
                  <h4 className="font-semibold text-sm mt-2">Utility Metrics</h4>
                  {secureResult.utility_metrics && renderMetrics(secureResult.utility_metrics)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Heterogeneous Clients */}
        <TabsContent value="hetero">
          <Card>
            <CardHeader><CardTitle>Heterogeneous Client Handling</CardTitle>
            <CardDescription>Non-IID data and system heterogeneity adaptation</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SelectInput label="Heterogeneity" value={hetero} onChange={setHetero} options={HETEROS} />
                <NumInput label="Num Clients" value={numClients} onChange={setNumClients} min={2} max={100} />
                <div>
                  <Label>Adaptation Strategy</Label>
                  <select className="w-full border rounded p-2 text-sm" value={adaptStrategy} onChange={e => setAdaptStrategy(e.target.value)}>
                    <option value="personalized">Personalized</option>
                    <option value="meta_learning">Meta-Learning</option>
                    <option value="multi_task">Multi-Task</option>
                    <option value="clustering">Clustering</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" checked={personalize} onChange={e => setPersonalize(e.target.checked)} />
                  <Label>Enable Personalization</Label>
                </div>
              </div>
              <Button onClick={runHetero} disabled={loading}>{loading ? "Running..." : "Run Heterogeneous Analysis"}</Button>
              {heteroResult && (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-sm">Task: {heteroResult.task_id}</p>
                    <p className="text-xs text-gray-500">Type: {heteroResult.heterogeneity_type} | Robustness: {heteroResult.metrics?.heterogeneity_robustness}</p>
                  </div>
                  <h4 className="font-semibold text-sm">Heterogeneity Scores</h4>
                  {heteroResult.heterogeneity_scores && renderMetrics(heteroResult.heterogeneity_scores)}
                  {heteroResult.per_client_adaptation && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">Per-Client Adaptation</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {Object.entries(heteroResult.per_client_adaptation).map(([cid, data]: [string, any]) => (
                          <div key={cid} className="bg-gray-50 p-1.5 rounded text-xs flex gap-3">
                            <span className="font-semibold">{cid}</span>
                            <span>Local: {((data.local_accuracy || 0) * 100).toFixed(1)}%</span>
                            {data.personalized_accuracy && <span>Pers: {(data.personalized_accuracy * 100).toFixed(1)}%</span>}
                            <span>Efficiency: {((data.data_efficiency || 0) * 100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {heteroResult.engine_integration && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">Engine Integration</h4>
                      {renderMetrics(heteroResult.engine_integration)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Efficiency */}
        <TabsContent value="comm">
          <Card>
            <CardHeader><CardTitle>Communication Efficiency</CardTitle>
            <CardDescription>Gradient compression and bandwidth optimization</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SelectInput label="Compression" value={compress} onChange={setCompress} options={COMPRESS_METHODS} />
                <NumInput label="Model Size (MB)" value={modelSize} onChange={setModelSize} step={1} min={0.1} />
                <NumInput label="Target Reduction" value={targetReduction} onChange={setTargetReduction} step={0.05} min={0.1} max={0.99} />
                <NumInput label="Num Rounds" value={commRounds} onChange={setCommRounds} min={1} max={200} />
              </div>
              <Button onClick={runComm} disabled={loading}>{loading ? "Running..." : "Run Comm Efficiency"}</Button>
              {commResult && (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-sm">Task: {commResult.task_id}</p>
                    <p className="text-xs text-gray-500">Saved: {commResult.efficiency_metrics?.bandwidth_saved_percent}% | Penalty: {commResult.efficiency_metrics?.convergence_penalty}</p>
                  </div>
                  {commResult.compression_details && (
                    <div className="bg-gray-50 p-2 rounded text-xs">
                      <h4 className="font-semibold">Compression Details</h4>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {Object.entries(commResult.compression_details).map(([k, v]) => (
                          <div key={k}><span className="font-medium">{k}:</span> {String(v)}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  <h4 className="font-semibold text-sm">Efficiency Metrics</h4>
                  {commResult.efficiency_metrics && renderMetrics(commResult.efficiency_metrics)}
                  <h4 className="font-semibold text-sm mt-2">Accuracy Impact</h4>
                  {commResult.accuracy_impact && renderMetrics(commResult.accuracy_impact)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Federated Distillation */}
        <TabsContent value="distill">
          <Card>
            <CardHeader><CardTitle>Federated Distillation</CardTitle>
            <CardDescription>Knowledge distillation across federated clients</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <SelectInput label="Distill Mode" value={distillMode} onChange={setDistillMode} options={DISTILL_MODES} />
                <NumInput label="Num Clients" value={distillClients} onChange={setDistillClients} min={2} max={100} />
                <NumInput label="Num Rounds" value={distillRounds} onChange={setDistillRounds} min={1} max={200} />
                <NumInput label="Temperature" value={distillTemp} onChange={setDistillTemp} step={0.5} />
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" checked={nasOptimized} onChange={e => setNasOptimized(e.target.checked)} />
                  <Label>NAS Optimized</Label>
                </div>
              </div>
              <Button onClick={runDistill} disabled={loading}>{loading ? "Running..." : "Run Federated Distillation"}</Button>
              {distillResult && (
                <div className="space-y-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold text-sm">Task: {distillResult.task_id}</p>
                    <p className="text-xs text-gray-500">Mode: {distillResult.distill_mode} | Speedup: {distillResult.distill_metrics?.convergence_speedup}x</p>
                  </div>
                  <h4 className="font-semibold text-sm">Distillation Metrics</h4>
                  {distillResult.distill_metrics && renderMetrics(distillResult.distill_metrics)}
                  {distillResult.local_models && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">Local Models</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                        {distillResult.local_models.map((m: any) => (
                          <div key={m.client_id} className="bg-gray-50 p-1.5 rounded text-xs">
                            <span className="font-semibold">{m.client_id}</span>
                            <br />{m.specialization} | {(m.local_accuracy * 100).toFixed(1)}%
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {distillResult.nas_optimization && Object.keys(distillResult.nas_optimization).length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">NAS Optimization</h4>
                      {renderMetrics(distillResult.nas_optimization)}
                    </div>
                  )}
                  {distillResult.privacy_analysis && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">Privacy Analysis</h4>
                      {renderMetrics(distillResult.privacy_analysis)}
                    </div>
                  )}
                  {distillResult.engine_integration && (
                    <div className="mt-2">
                      <h4 className="font-semibold text-sm">Engine Integration</h4>
                      {renderMetrics(distillResult.engine_integration)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report */}
        <TabsContent value="report">
          <Card>
            <CardHeader><CardTitle>Comprehensive FL v2 Report</CardTitle>
            <CardDescription>Full integration report across all FL modules</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={runReport} disabled={loading}>{loading ? "Generating..." : "Generate Report"}</Button>
              {reportResult && (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">Overall FL Score: <Badge className="bg-green-600 text-white">{((reportResult.overall_fl_score || 0) * 100).toFixed(1)}%</Badge></p>
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
                      <h4 className="font-semibold text-sm">Integration Map (v1.89–v1.200)</h4>
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
