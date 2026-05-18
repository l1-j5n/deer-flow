"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.249 backend
const DISCOVERY_METHODS = ["pc_algorithm", "ges_score", "lingam", "notears", "causal_additive", "autonomous_hybrid"];
const DATA_SOURCES = ["observational", "interventional", "time_series", "federated", "simulation", "mixed"];
const INTERVENE_STRATEGIES = ["entropy_maximization", "uncertainty_sampling", "graph_edit_distance", "causal_strength", "information_gain", "adaptive_exploration"];
const GRAPH_SCORINGS = ["bic", "aic", "bge", "bdeu", "mdl", "causal_score"];
const STABILITY_METRICS = ["bootstrap_confidence", "subsample_stability", "edge_probability", "orientation_confidence", "markov_blanket_recall", "intervention_invariance"];
const REFINEMENT_MODES = ["edge_pruning", "orientation_refinement", "latent_discovery", "confounder_resolution", "temporal_extension", "full_refinement"];

const TABS = ["Discover", "Intervene", "Stability", "Refine", "Ensemble", "Validate", "Overview"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>{children}</div>;
}
function StatBar({ label, value, max = 1, color = "bg-blue-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(4)}</span></div><div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div></div>;
}
function JsonBlock({ data }: { data: unknown }) {
  return <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto max-h-80 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label><select className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}</select></div>;
}
function Badge({ text, color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{text}</span>;
}

export default function GraphAutonomousCausalDiscoveryPage() {
  const [tab, setTab] = useState<Tab>("Discover");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Discover state
  const [datasetId, setDatasetId] = useState("dataset-obs-001");
  const [dataSource, setDataSource] = useState("observational");
  const [discoveryMethod, setDiscoveryMethod] = useState("autonomous_hybrid");
  const [scoring, setScoring] = useState("bic");
  const [maxVars, setMaxVars] = useState(50);
  const [alpha, setAlpha] = useState(0.05);

  // Intervene state
  const [intvDiscoveryId, setIntvDiscoveryId] = useState("");
  const [intvStrategy, setIntvStrategy] = useState("information_gain");
  const [intvBudget, setIntvBudget] = useState(10);
  const [intvTargetVars, setIntvTargetVars] = useState("");

  // Stability state
  const [stabDiscoveryId, setStabDiscoveryId] = useState("");
  const [stabMetrics, setStabMetrics] = useState<string[]>(["bootstrap_confidence", "edge_probability", "orientation_confidence"]);
  const [stabBootstrap, setStabBootstrap] = useState(100);
  const [stabSubsample, setStabSubsample] = useState(0.8);

  // Refine state
  const [refDiscoveryId, setRefDiscoveryId] = useState("");
  const [refGraphId, setRefGraphId] = useState("");
  const [refMode, setRefMode] = useState("full_refinement");
  const [refIterations, setRefIterations] = useState(5);
  const [refConfThreshold, setRefConfThreshold] = useState(0.7);

  // Ensemble state
  const [ensDiscoveryId, setEnsDiscoveryId] = useState("");
  const [ensMethods, setEnsMethods] = useState<string[]>(["pc_algorithm", "notears", "autonomous_hybrid"]);
  const [ensAggregation, setEnsAggregation] = useState("weighted_vote");
  const [ensDiversityWeight, setEnsDiversityWeight] = useState(0.3);

  // Validate state
  const [valDiscoveryId, setValDiscoveryId] = useState("");
  const [valGraphId, setValGraphId] = useState("");
  const [valGroundTruth, setValGroundTruth] = useState("");

  const callApi = async (endpoint: string, body?: Record<string, unknown>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  const toggleMetric = (metric: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(metric) ? list.filter((m) => m !== metric) : [...list, metric]);
  };

  const toggleEnsMethod = (method: string) => {
    setEnsMethods(ensMethods.includes(method) ? ensMethods.filter((m) => m !== method) : [...ensMethods, method]);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Graph Autonomous Causal Discovery</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">v1.249 — Self-supervised autonomous causal structure learning from raw data</p>
        </div>
        <Badge text="v1.249" color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-purple-500 text-purple-700 dark:text-purple-300" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>{t}</button>
        ))}
      </div>

      {/* Discover Tab */}
      {tab === "Discover" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Discovery Configuration">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Dataset ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={datasetId} onChange={(e) => setDatasetId(e.target.value)} />
              </div>
              <SelectField label="Data Source" value={dataSource} onChange={setDataSource} options={DATA_SOURCES} />
              <SelectField label="Discovery Method" value={discoveryMethod} onChange={setDiscoveryMethod} options={DISCOVERY_METHODS} />
              <SelectField label="Scoring Criterion" value={scoring} onChange={setScoring} options={GRAPH_SCORINGS} />
              <div className="grid grid-cols-2 gap-2">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Variables</label>
                  <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={maxVars} onChange={(e) => setMaxVars(Number(e.target.value))} min={2} max={500} />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Alpha (α)</label>
                  <input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={alpha} onChange={(e) => setAlpha(Number(e.target.value))} min={0.001} max={0.5} />
                </div>
              </div>
              <button disabled={loading} onClick={() => callApi("auto-causal/discover", { dataset_id: datasetId, data_source: dataSource, discovery_method: discoveryMethod, scoring_criterion: scoring, max_variables: maxVars, alpha })} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Discovering..." : "Discover Causal Structure"}
              </button>
            </div>
          </Card>
          <Card title="Discovery Result">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.discovery_id && <div className="flex gap-2 flex-wrap"><Badge text={`ID: ${(result as Record<string, unknown>).discovery_id}`} /><Badge text={`Method: ${(result as Record<string, unknown>).method}`} color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" /></div>}
                {(result as Record<string, unknown>)?.num_variables != null && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2"><div className="text-lg font-bold text-gray-900 dark:text-gray-100">{String((result as Record<string, unknown>).num_variables)}</div><div className="text-xs text-gray-500">Variables</div></div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2"><div className="text-lg font-bold text-gray-900 dark:text-gray-100">{String((result as Record<string, unknown>).num_edges)}</div><div className="text-xs text-gray-500">Edges</div></div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2"><div className="text-lg font-bold text-gray-900 dark:text-gray-100">{String((result as Record<string, unknown>).equiv_class_size)}</div><div className="text-xs text-gray-500">Equiv Class</div></div>
                  </div>
                )}
                {(result as Record<string, unknown>)?.confidence_summary && Object.entries((result as Record<string, Record<string, number>>).confidence_summary).map(([k, v]) => (
                  <StatBar key={k} label={k.replace(/_/g, " ")} value={v} />
                ))}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Configure and run discovery to see results</p>}
          </Card>
        </div>
      )}

      {/* Active Intervene Tab */}
      {tab === "Intervene" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Active Intervention Selection">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Discovery ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={intvDiscoveryId} onChange={(e) => setIntvDiscoveryId(e.target.value)} placeholder="acd-..." />
              </div>
              <SelectField label="Intervention Strategy" value={intvStrategy} onChange={setIntvStrategy} options={INTERVENE_STRATEGIES} />
              <div className="grid grid-cols-2 gap-2">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Budget</label>
                  <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={intvBudget} onChange={(e) => setIntvBudget(Number(e.target.value))} min={1} max={1000} />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Variables (comma-sep)</label>
                  <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={intvTargetVars} onChange={(e) => setIntvTargetVars(e.target.value)} placeholder="V0,V1,V5" />
                </div>
              </div>
              <button disabled={loading} onClick={() => callApi("auto-causal/active-intervene", {
                discovery_id: intvDiscoveryId, strategy: intvStrategy, budget: intvBudget,
                target_variables: intvTargetVars ? intvTargetVars.split(",").map((s) => s.trim()) : undefined,
              })} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Selecting..." : "Select Interventions"}
              </button>
            </div>
          </Card>
          <Card title="Intervention Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.recommended_interventions && (
                  <div>
                    <h4 className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">Recommended Interventions</h4>
                    <div className="space-y-2 max-h-60 overflow-auto">
                      {((result as Record<string, Record<string, unknown>[]>).recommended_interventions || []).map((ri, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs">
                          <div className="flex justify-between"><span className="font-medium">{String(ri.variable)}</span><Badge text={String(ri.intervention_type)} color="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" /></div>
                          <div className="text-gray-500 dark:text-gray-400 mt-1">Value: {String(ri.value)} | Priority: {String(ri.priority)}</div>
                          <div className="text-gray-400 dark:text-gray-500 mt-1 italic">{String(ri.rationale)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(result as Record<string, unknown>)?.graph_reduction_ratio != null && <StatBar label="Graph Reduction Ratio" value={(result as Record<string, number>).graph_reduction_ratio} color="bg-orange-500" />}
                {(result as Record<string, unknown>)?.budget_remaining != null && <div className="text-xs text-gray-500">Budget Remaining: {String((result as Record<string, unknown>).budget_remaining)}</div>}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Run intervention selection to see results</p>}
          </Card>
        </div>
      )}

      {/* Stability Tab */}
      {tab === "Stability" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Stability Evaluation">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Discovery ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={stabDiscoveryId} onChange={(e) => setStabDiscoveryId(e.target.value)} placeholder="acd-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Stability Metrics</label>
                <div className="grid grid-cols-2 gap-1">
                  {STABILITY_METRICS.map((m) => (
                    <label key={m} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <input type="checkbox" checked={stabMetrics.includes(m)} onChange={() => toggleMetric(m, stabMetrics, setStabMetrics)} className="rounded" />
                      {m.replace(/_/g, " ")}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bootstrap Samples</label>
                  <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={stabBootstrap} onChange={(e) => setStabBootstrap(Number(e.target.value))} min={10} max={1000} />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subsample Ratio</label>
                  <input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={stabSubsample} onChange={(e) => setStabSubsample(Number(e.target.value))} min={0.3} max={0.99} />
                </div>
              </div>
              <button disabled={loading || stabMetrics.length === 0} onClick={() => callApi("auto-causal/stability", { discovery_id: stabDiscoveryId, stability_metrics: stabMetrics, num_bootstrap: stabBootstrap, subsample_ratio: stabSubsample })} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Evaluating..." : "Evaluate Stability"}
              </button>
            </div>
          </Card>
          <Card title="Stability Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.overall_stability != null && <StatBar label="Overall Stability" value={(result as Record<string, number>).overall_stability} color="bg-green-500" />}
                {(result as Record<string, Record<string, number>>)?.metrics && Object.entries((result as Record<string, Record<string, number>>).metrics).map(([k, v]) => (
                  <StatBar key={k} label={k.replace(/_/g, " ")} value={v} />
                ))}
                {(result as Record<string, string[]>)?.unstable_edges?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-red-600">Unstable Edges</h4>
                    {(result as Record<string, string[]>).unstable_edges.map((e) => (
                      <Badge key={e} text={e} color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" />
                    ))}
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Run stability evaluation to see results</p>}
          </Card>
        </div>
      )}

      {/* Refine Tab */}
      {tab === "Refine" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Graph Refinement">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Discovery ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={refDiscoveryId} onChange={(e) => setRefDiscoveryId(e.target.value)} placeholder="acd-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={refGraphId} onChange={(e) => setRefGraphId(e.target.value)} placeholder="graph-..." />
              </div>
              <SelectField label="Refinement Mode" value={refMode} onChange={setRefMode} options={REFINEMENT_MODES} />
              <div className="grid grid-cols-2 gap-2">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Iterations</label>
                  <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={refIterations} onChange={(e) => setRefIterations(Number(e.target.value))} min={1} max={50} />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confidence Threshold</label>
                  <input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={refConfThreshold} onChange={(e) => setRefConfThreshold(Number(e.target.value))} min={0.1} max={0.99} />
                </div>
              </div>
              <button disabled={loading} onClick={() => callApi("auto-causal/refine", { discovery_id: refDiscoveryId, graph_id: refGraphId, mode: refMode, iterations: refIterations, confidence_threshold: refConfThreshold })} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Refining..." : "Refine Graph"}
              </button>
            </div>
          </Card>
          <Card title="Refinement Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.original_edges != null && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2"><div className="text-lg font-bold text-gray-900 dark:text-gray-100">{String((result as Record<string, unknown>).original_edges)}</div><div className="text-xs text-gray-500">Original</div></div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2"><div className="text-lg font-bold text-gray-900 dark:text-gray-100">{String((result as Record<string, unknown>).refined_edges)}</div><div className="text-xs text-gray-500">Refined</div></div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2"><div className="text-lg font-bold text-gray-900 dark:text-gray-100">{String((result as Record<string, unknown>).iterations_used)}</div><div className="text-xs text-gray-500">Iters</div></div>
                  </div>
                )}
                {(result as Record<string, unknown>)?.improvement_score != null && <StatBar label="Improvement Score" value={(result as Record<string, number>).improvement_score} color="bg-emerald-500" />}
                {(result as Record<string, Record<string, unknown>[]>)?.changes && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Changes Applied</h4>
                    <div className="space-y-1">
                      {(result as Record<string, Record<string, unknown>[]>).changes.map((c, i) => (
                        <div key={i} className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-1.5 flex gap-2">
                          <Badge text={String(c.type)} color="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" />
                          {c.edge && <span className="text-gray-600 dark:text-gray-400">{String(c.edge)}</span>}
                          <span className="text-gray-400 ml-auto">Δ {String(c.confidence_delta)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Run refinement to see results</p>}
          </Card>
        </div>
      )}

      {/* Ensemble Tab */}
      {tab === "Ensemble" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Ensemble Discovery">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Discovery ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={ensDiscoveryId} onChange={(e) => setEnsDiscoveryId(e.target.value)} placeholder="acd-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Discovery Methods</label>
                <div className="grid grid-cols-2 gap-1">
                  {DISCOVERY_METHODS.map((m) => (
                    <label key={m} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <input type="checkbox" checked={ensMethods.includes(m)} onChange={() => toggleEnsMethod(m)} className="rounded" />
                      {m.replace(/_/g, " ")}
                    </label>
                  ))}
                </div>
              </div>
              <SelectField label="Aggregation Strategy" value={ensAggregation} onChange={setEnsAggregation} options={["weighted_vote", "consensus", "bayesian_model_averaging"]} />
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Diversity Weight</label>
                <input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={ensDiversityWeight} onChange={(e) => setEnsDiversityWeight(Number(e.target.value))} min={0} max={1} />
              </div>
              <button disabled={loading || ensMethods.length < 2} onClick={() => callApi("auto-causal/ensemble", { discovery_id: ensDiscoveryId, methods: ensMethods, aggregation: ensAggregation, diversity_weight: ensDiversityWeight })} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Ensembling..." : "Run Ensemble Discovery"}
              </button>
            </div>
          </Card>
          <Card title="Ensemble Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.method_agreement != null && <StatBar label="Method Agreement" value={(result as Record<string, number>).method_agreement} color="bg-indigo-500" />}
                {(result as Record<string, unknown>)?.diversity_score != null && <StatBar label="Diversity Score" value={(result as Record<string, number>).diversity_score} color="bg-cyan-500" />}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-2"><div className="text-lg font-bold text-gray-900 dark:text-gray-100">{String((result as Record<string, unknown>).consensus_edges)}</div><div className="text-xs text-gray-500">Consensus</div></div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-2"><div className="text-lg font-bold text-gray-900 dark:text-gray-100">{String((result as Record<string, unknown>).disputed_edges)}</div><div className="text-xs text-gray-500">Disputed</div></div>
                </div>
                {(result as Record<string, Record<string, number>>)?.final_scoring && Object.entries((result as Record<string, Record<string, number>>).final_scoring).map(([k, v]) => (
                  <StatBar key={k} label={k.replace(/_/g, " ")} value={v} color="bg-violet-500" />
                ))}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Run ensemble to see results</p>}
          </Card>
        </div>
      )}

      {/* Validate Tab */}
      {tab === "Validate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Discovery Validation">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Discovery ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={valDiscoveryId} onChange={(e) => setValDiscoveryId(e.target.value)} placeholder="acd-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={valGraphId} onChange={(e) => setValGraphId(e.target.value)} placeholder="graph-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ground Truth ID (optional)</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={valGroundTruth} onChange={(e) => setValGroundTruth(e.target.value)} placeholder="gt-..." />
              </div>
              <button disabled={loading} onClick={() => callApi("auto-causal/validate", {
                discovery_id: valDiscoveryId, graph_id: valGraphId,
                ground_truth_id: valGroundTruth || undefined,
                validation_criteria: ["structural_hamming", "precision_recall", "markov_equivalence"],
              })} className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Validating..." : "Validate Discovery"}
              </button>
            </div>
          </Card>
          <Card title="Validation Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.is_valid != null && (
                  <div className={`p-3 rounded ${(result as Record<string, boolean>).is_valid ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
                    <span className={`text-sm font-bold ${(result as Record<string, boolean>).is_valid ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                      {(result as Record<string, boolean>).is_valid ? "✓ VALID" : "✗ INVALID"}
                    </span>
                  </div>
                )}
                {(result as Record<string, unknown>)?.precision != null && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2"><div className="text-sm font-bold text-gray-900 dark:text-gray-100">{((result as Record<string, number>).precision * 100).toFixed(1)}%</div><div className="text-xs text-gray-500">Precision</div></div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2"><div className="text-sm font-bold text-gray-900 dark:text-gray-100">{((result as Record<string, number>).recall || 0 * 100).toFixed(1)}%</div><div className="text-xs text-gray-500">Recall</div></div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded p-2"><div className="text-sm font-bold text-gray-900 dark:text-gray-100">{((result as Record<string, number>).f1_score || 0 * 100).toFixed(1)}%</div><div className="text-xs text-gray-500">F1</div></div>
                  </div>
                )}
                {(result as Record<string, unknown>)?.structural_hamming_distance != null && <StatBar label="Structural Hamming Distance" value={(result as Record<string, number>).structural_hamming_distance} max={30} color="bg-amber-500" />}
                {(result as Record<string, string[]>)?.violations?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-red-600">Violations</h4>
                    {(result as Record<string, string[]>).violations.map((v, i) => (
                      <div key={i} className="text-xs bg-red-50 dark:bg-red-900/20 rounded p-1.5 mb-1 text-red-700 dark:text-red-300">{v}</div>
                    ))}
                  </div>
                )}
                {(result as Record<string, string[]>)?.recommendations?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-blue-600">Recommendations</h4>
                    {(result as Record<string, string[]>).recommendations.map((r, i) => (
                      <div key={i} className="text-xs bg-blue-50 dark:bg-blue-900/20 rounded p-1.5 mb-1 text-blue-700 dark:text-blue-300">{r}</div>
                    ))}
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Run validation to see results</p>}
          </Card>
        </div>
      )}

      {/* Overview Tab */}
      {tab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Engine Metadata">
            <div className="space-y-2 text-xs">
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Version:</span> <span className="text-gray-900 dark:text-gray-100">v1.249.0</span></div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Module:</span> <span className="text-gray-900 dark:text-gray-100">Graph Autonomous Causal Discovery</span></div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Description:</span> <span className="text-gray-700 dark:text-gray-300">Self-supervised autonomous causal structure learning from raw data, combining constraint-based, score-based, and functional methods with active intervention selection, graph stability analysis, and iterative refinement</span></div>
            </div>
          </Card>
          <Card title="Endpoints">
            <div className="space-y-1 text-xs font-mono">
              <div className="text-purple-700 dark:text-purple-300">POST /graph/auto-causal/discover</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/auto-causal/active-intervene</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/auto-causal/stability</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/auto-causal/refine</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/auto-causal/ensemble</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/auto-causal/validate</div>
              <div className="text-gray-600 dark:text-gray-400">GET  /graph/auto-causal/overview</div>
            </div>
          </Card>
          <Card title="Enums (6 enums, 36 values)">
            <div className="space-y-2 text-xs">
              <div><span className="font-medium text-gray-600 dark:text-gray-400">DiscoveryMethod:</span> {DISCOVERY_METHODS.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">DataSource:</span> {DATA_SOURCES.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">InterventionStrategy:</span> {INTERVENE_STRATEGIES.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">GraphScoring:</span> {GRAPH_SCORINGS.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">StabilityMetric:</span> {STABILITY_METRICS.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">RefinementMode:</span> {REFINEMENT_MODES.join(", ")}</div>
            </div>
          </Card>
          <Card title="Integration Chain">
            <div className="space-y-1 text-xs">
              <div className="text-gray-600 dark:text-gray-400">v1.248 → Causal Program Verification (verified programs → discover causal programs)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.247 → Causal World Model (discovered graph → world model initialization)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.246 → Neuro-Symbolic Causal (symbolic constraints → discovery background knowledge)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.245 → Meta-Causal Learning (meta-learned patterns → discovery priors)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.244 → Common Sense Reasoning (commonsense constraints → discovery filtering)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.243 → Causal Transfer Learning (transferred structures → discovery warm-start)</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
