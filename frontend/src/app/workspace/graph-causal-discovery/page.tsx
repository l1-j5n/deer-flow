"use client";

import { useState } from "react";

const API = "/api/graph";

const DISCOVERY_METHODS = ["pc", "fci", "ges", "notears", "lingam", "dag_gnn"];
const INTERVENTION_TYPES = ["do_intervention", "conditioning", "soft_intervention", "stochastic", "policy", "natural"];
const CF_METHODS = ["abduction_action_prediction", "twin_network", "potential_outcome", "structural", "g_formula", "mediation"];
const EFFECT_MEASURES = ["ate", "cate", "ite", "att", "ate_bootstrap", "natural_effect"];
const TEMPORAL_MODELS = ["var_granger", "td_pair", "pcmci", "dynotears", "lsvgm", "time_series"];
const MODALITIES = ["visual", "textual", "structural", "temporal", "audio", "tabular"];
const FUSION_STRATEGIES = ["early_fusion", "late_fusion", "hybrid_fusion", "contrastive", "attention_fusion", "graph_fusion"];

const TABS = ["Discover", "Intervene", "Counterfactual", "Effects", "Temporal", "Multimodal", "Summary"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>
      {children}
    </div>
  );
}

function StatBar({ label, value, max = 1, color = "bg-emerald-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(4)}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto max-h-80 whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <select
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Badge({ text, color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

export default function GraphCausalDiscoveryPage() {
  const [tab, setTab] = useState<Tab>("Discover");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Discover state
  const [method, setMethod] = useState("pc");
  const [numNodes, setNumNodes] = useState(20);
  const [numSamples, setNumSamples] = useState(1000);
  const [sigLevel, setSigLevel] = useState(0.05);

  // Intervene state
  const [interventionType, setInterventionType] = useState("do_intervention");
  const [targetNodes, setTargetNodes] = useState("0,1");
  const [intervValues, setIntervValues] = useState("1.0,0.5");
  const [numSim, setNumSim] = useState(100);

  // Counterfactual state
  const [cfMethod, setCfMethod] = useState("abduction_action_prediction");
  const [obsOutcome, setObsOutcome] = useState('{"y1": 0.5, "y2": 0.3}');
  const [hypInterv, setHypInterv] = useState('{"x1": 1.0}');
  const [numCF, setNumCF] = useState(10);

  // Effects state
  const [effectMeasure, setEffectMeasure] = useState("ate");
  const [treatNodes, setTreatNodes] = useState("0");
  const [outNodes, setOutNodes] = useState("1");
  const [adjSet, setAdjSet] = useState("2,3");
  const [numBootstrap, setNumBootstrap] = useState(1000);

  // Temporal state
  const [temporalModel, setTemporalModel] = useState("pcmci");
  const [timeLags, setTimeLags] = useState(5);
  const [timeSteps, setTimeSteps] = useState(200);
  const [numVars, setNumVars] = useState(10);

  // Multimodal state
  const [srcModality, setSrcModality] = useState("visual");
  const [tgtModality, setTgtModality] = useState("textual");
  const [fusionStrategy, setFusionStrategy] = useState("hybrid_fusion");
  const [numHypotheses, setNumHypotheses] = useState(20);

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: String(err) });
    }
    setLoading(false);
  };

  const renderDiscover = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Discovery Parameters">
        <SelectField label="Method" value={method} onChange={setMethod} options={DISCOVERY_METHODS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number of Nodes</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={numNodes} onChange={(e) => setNumNodes(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number of Samples</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={numSamples} onChange={(e) => setNumSamples(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Significance Level</label>
          <input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={sigLevel} onChange={(e) => setSigLevel(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/causal-discovery/discover", { method, num_nodes: numNodes, num_samples: numSamples, significance_level: sigLevel })}
        >
          {loading ? "Discovering..." : "Discover Causal Graph"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "discovered_edges" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const v = d.validation as Record<string, number>;
          return (
            <>
              <Card title="Discovery Results">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{String(d.num_edges)}</div>
                    <div className="text-xs text-gray-500">Edges Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{String(d.edge_density)}</div>
                    <div className="text-xs text-gray-500">Edge Density</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{String(d.avg_confidence)}</div>
                    <div className="text-xs text-gray-500">Avg Confidence</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">Method: <Badge text={String(d.method)} /></div>
              </Card>
              <Card title="Validation Metrics">
                <StatBar label="Precision" value={v?.precision ?? 0} color="bg-emerald-500" />
                <StatBar label="Recall" value={v?.recall ?? 0} color="bg-blue-500" />
                <StatBar label="F1 Score" value={v?.f1_score ?? 0} color="bg-purple-500" />
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div><span className="text-xs text-gray-500">SHD</span><div className="text-sm font-mono">{v?.shd ?? "-"}</div></div>
                  <div><span className="text-xs text-gray-500">SID</span><div className="text-sm font-mono">{v?.sid ?? "-"}</div></div>
                  <div><span className="text-xs text-gray-500">Hamming</span><div className="text-sm font-mono">{v?.hamming_distance ?? "-"}</div></div>
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderIntervene = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Intervention Parameters">
        <SelectField label="Intervention Type" value={interventionType} onChange={setInterventionType} options={INTERVENTION_TYPES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Nodes (comma-separated)</label>
          <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={targetNodes} onChange={(e) => setTargetNodes(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Intervention Values (comma-separated)</label>
          <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={intervValues} onChange={(e) => setIntervValues(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Simulations</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={numSim} onChange={(e) => setNumSim(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/causal-discovery/intervene", {
            intervention_type: interventionType,
            target_nodes: targetNodes.split(",").map(Number),
            intervention_values: intervValues.split(",").map(Number),
            num_simulations: numSim,
          })}
        >
          {loading ? "Computing..." : "Run Intervention"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "average_causal_effect" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const ci = d.confidence_interval as number[];
          return (
            <>
              <Card title="Intervention Results">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">{String(d.average_causal_effect)}</div>
                    <div className="text-xs text-gray-500">Average Causal Effect</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-mono text-blue-600">[{ci?.[0]?.toFixed(4) ?? "-"}, {ci?.[1]?.toFixed(4) ?? "-"}]</div>
                    <div className="text-xs text-gray-500">95% Confidence Interval</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><span className="text-xs text-gray-500">p-value</span><div className="text-sm font-mono">{String(d.p_value)}</div></div>
                  <div><span className="text-xs text-gray-500">Effect Size</span><div className="text-sm font-mono">{String(d.effect_size)}</div></div>
                  <div><span className="text-xs text-gray-500">Power</span><div className="text-sm font-mono">{String(d.power)}</div></div>
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderCounterfactual = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Counterfactual Parameters">
        <SelectField label="Method" value={cfMethod} onChange={setCfMethod} options={CF_METHODS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Observed Outcome (JSON)</label>
          <textarea className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5 h-16 font-mono" value={obsOutcome} onChange={(e) => setObsOutcome(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hypothetical Intervention (JSON)</label>
          <textarea className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5 h-16 font-mono" value={hypInterv} onChange={(e) => setHypInterv(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number of Counterfactuals</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={numCF} onChange={(e) => setNumCF(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => {
            let obs = {}, hyp = {};
            try { obs = JSON.parse(obsOutcome); } catch { /* keep empty */ }
            try { hyp = JSON.parse(hypInterv); } catch { /* keep empty */ }
            callApi("/causal-discovery/counterfactual", { method: cfMethod, observed_outcome: obs, hypothetical_intervention: hyp, num_counterfactuals: numCF });
          }}
        >
          {loading ? "Reasoning..." : "Compute Counterfactuals"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "average_treatment_effect" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const sens = d.sensitivity_analysis as Record<string, number>;
          return (
            <>
              <Card title="Counterfactual Results">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-violet-600">{String(d.average_treatment_effect)}</div>
                    <div className="text-xs text-gray-500">Average Treatment Effect</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{String(d.counterfactual_confidence)}</div>
                    <div className="text-xs text-gray-500">Confidence</div>
                  </div>
                </div>
                {d.causal_explanation && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 bg-violet-50 dark:bg-violet-900/20 rounded p-3 mb-3">
                    {String(d.causal_explanation)}
                  </div>
                )}
              </Card>
              <Card title="Sensitivity Analysis">
                <StatBar label="Robustness Score" value={sens?.robustness_score ?? 0} color="bg-violet-500" />
                <StatBar label="E-Value" value={(sens?.e_value ?? 0) / 4} color="bg-amber-500" />
                <StatBar label="Confounding Tolerated" value={sens?.confounding_strength_tolerated ?? 0} color="bg-teal-500" />
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderEffects = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Effect Estimation Parameters">
        <SelectField label="Effect Measure" value={effectMeasure} onChange={setEffectMeasure} options={EFFECT_MEASURES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Treatment Nodes</label>
          <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={treatNodes} onChange={(e) => setTreatNodes(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Outcome Nodes</label>
          <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={outNodes} onChange={(e) => setOutNodes(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Adjustment Set</label>
          <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adjSet} onChange={(e) => setAdjSet(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bootstrap Iterations</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={numBootstrap} onChange={(e) => setNumBootstrap(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/causal-discovery/effects", {
            effect_measure: effectMeasure,
            treatment_nodes: treatNodes.split(",").map(Number),
            outcome_nodes: outNodes.split(",").map(Number),
            adjustment_set: adjSet.split(",").map(Number),
            num_bootstrap: numBootstrap,
          })}
        >
          {loading ? "Estimating..." : "Estimate Effects"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "point_estimate" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const ci = d.confidence_interval_95 as number[];
          const bd = d.backdoor_criterion as Record<string, unknown>;
          return (
            <>
              <Card title="Effect Estimation Results">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600">{String(d.point_estimate)}</div>
                    <div className="text-xs text-gray-500">Point Estimate ({String(d.effect_measure)})</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-mono text-blue-600">[{ci?.[0]?.toFixed(4) ?? "-"}, {ci?.[1]?.toFixed(4) ?? "-"}]</div>
                    <div className="text-xs text-gray-500">95% Confidence Interval</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div><span className="text-xs text-gray-500">SE</span><div className="text-sm font-mono">{String(d.standard_error)}</div></div>
                  <div><span className="text-xs text-gray-500">t-stat</span><div className="text-sm font-mono">{String(d.t_statistic)}</div></div>
                  <div><span className="text-xs text-gray-500">p-value</span><div className="text-sm font-mono">{String(d.p_value)}</div></div>
                  <div><span className="text-xs text-gray-500">Power</span><div className="text-sm font-mono">{String(d.statistical_power)}</div></div>
                </div>
              </Card>
              <Card title="Backdoor Criterion">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">Satisfied:</span>
                  {bd?.satisfied ? <Badge text="Yes" color="bg-green-100 text-green-700" /> : <Badge text="No" color="bg-red-100 text-red-700" />}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Adjustment variables: {String(bd?.adjustment_variables ?? 0)} | Minimal set: {bd?.minimal_set ? "Yes" : "No"}
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderTemporal = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Temporal Causal Parameters">
        <SelectField label="Temporal Model" value={temporalModel} onChange={setTemporalModel} options={TEMPORAL_MODELS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time Lags</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={timeLags} onChange={(e) => setTimeLags(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time Steps</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={timeSteps} onChange={(e) => setTimeSteps(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Variables</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={numVars} onChange={(e) => setNumVars(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/causal-discovery/temporal", { temporal_model: temporalModel, time_lags: timeLags, num_time_steps: timeSteps, num_variables: numVars })}
        >
          {loading ? "Discovering..." : "Discover Temporal Causality"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "total_causal_edges" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const lagEdges = d.lag_specific_edges as Record<string, unknown[]>;
          const stability = d.causal_stability as Record<string, unknown>;
          return (
            <>
              <Card title="Temporal Discovery Results">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{String(d.total_causal_edges)}</div>
                    <div className="text-xs text-gray-500">Total Edges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{String(d.avg_edge_strength)}</div>
                    <div className="text-xs text-gray-500">Avg Strength</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{String(d.prediction_accuracy)}</div>
                    <div className="text-xs text-gray-500">Prediction Accuracy</div>
                  </div>
                </div>
              </Card>
              <Card title="Lag-Specific Edge Counts">
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(lagEdges).map(([lag, edges]) => (
                    <div key={lag} className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="text-sm font-mono font-bold">{lag.replace("lag_", "Lag ")}</div>
                      <div className="text-lg font-bold text-teal-600">{edges.length}</div>
                      <div className="text-xs text-gray-500">edges</div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Causal Stability">
                <StatBar label="Stationarity" value={Number(stability?.stationarity ?? 0)} color="bg-teal-500" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Change points: {String(stability?.change_points ?? 0)} | Structural shift: {String(stability?.structural_shift_score ?? "-")}
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderMultimodal = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Cross-Modal Causal Parameters">
        <SelectField label="Source Modality" value={srcModality} onChange={setSrcModality} options={MODALITIES} />
        <SelectField label="Target Modality" value={tgtModality} onChange={setTgtModality} options={MODALITIES.filter((m) => m !== srcModality)} />
        <SelectField label="Fusion Strategy" value={fusionStrategy} onChange={setFusionStrategy} options={FUSION_STRATEGIES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cross-Modal Hypotheses</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={numHypotheses} onChange={(e) => setNumHypotheses(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/causal-discovery/multimodal", {
            source_modality: srcModality,
            target_modality: tgtModality,
            fusion_strategy: fusionStrategy,
            num_cross_modal_hypotheses: numHypotheses,
          })}
        >
          {loading ? "Analyzing..." : "Discover Cross-Modal Causality"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "significant_hypotheses" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const cv = d.cross_validation as Record<string, unknown>;
          return (
            <>
              <Card title="Cross-Modal Causal Results">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rose-600">{String(d.num_significant)}</div>
                    <div className="text-xs text-gray-500">Significant</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{String(d.significance_rate)}</div>
                    <div className="text-xs text-gray-500">Significance Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{String(d.causal_transfer_score)}</div>
                    <div className="text-xs text-gray-500">Transfer Score</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <Badge text={`${String(d.source_modality)} → ${String(d.target_modality)}`} color="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" />
                  <Badge text={String(d.fusion_strategy)} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                  <Badge text={`Alignment: ${String(d.alignment_score)}`} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
                </div>
              </Card>
              <Card title="Cross-Validation Scores">
                <div className="grid grid-cols-5 gap-2">
                  {(cv?.fold_scores as number[] ?? []).map((s: number, i: number) => (
                    <div key={i} className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="text-xs text-gray-500">Fold {i + 1}</div>
                      <div className="text-sm font-mono font-bold">{s.toFixed(4)}</div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Mean: {String(cv?.mean_score)} ± {String(cv?.std_score)}
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-4">
      <Card title="Graph Causal Discovery Engine v1.214">
        <button
          className="rounded bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 mb-4"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            fetch(`${API}/causal-discovery/summary`)
              .then((r) => r.json())
              .then((d) => { setResult(d); setLoading(false); })
              .catch((e) => { setResult({ error: String(e) }); setLoading(false); });
          }}
        >
          {loading ? "Loading..." : "Load Summary"}
        </button>
        {result && <JsonBlock data={result} />}
      </Card>
      <Card title="Engine Architecture">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-3">
            <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Causal Discovery</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>6 discovery methods (PC/FCI/GES/NOTEARS/LiNGAM/DAG-GNN)</div>
              <div>Independence testing + structure learning</div>
              <div>6 validation metrics (Prec/Recall/F1/SHD/SID/Hamming)</div>
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded p-3">
            <div className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Intervention & Counterfactual</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>6 intervention types (do/conditioning/soft/stochastic/policy/natural)</div>
              <div>6 counterfactual methods (AAP/Twin/PO/SCM/G-formula/Mediation)</div>
              <div>Sensitivity analysis with E-values</div>
            </div>
          </div>
          <div className="bg-violet-50 dark:bg-violet-900/20 rounded p-3">
            <div className="font-semibold text-violet-700 dark:text-violet-300 mb-2">Temporal & Multimodal</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>6 temporal models (VAR/Granger/TD-Pair/PCMCI/DyNOTEARS/LSVGM)</div>
              <div>6 effect measures (ATE/CATE/ITE/ATT/Bootstrap/Natural)</div>
              <div>Cross-modal causal fusion with 6 strategies</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const tabRenderers: Record<Tab, () => JSX.Element> = {
    Discover: renderDiscover,
    Intervene: renderIntervene,
    Counterfactual: renderCounterfactual,
    Effects: renderEffects,
    Temporal: renderTemporal,
    Multimodal: renderMultimodal,
    Summary: renderSummary,
  };

  const tabColors: Record<Tab, string> = {
    Discover: "bg-emerald-500",
    Intervene: "bg-orange-500",
    Counterfactual: "bg-violet-500",
    Effects: "bg-cyan-500",
    Temporal: "bg-teal-500",
    Multimodal: "bg-rose-500",
    Summary: "bg-gray-500",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Graph Causal Discovery Engine</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.214 — Automated causal structure discovery, intervention analysis, counterfactual reasoning & cross-modal causal fusion</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? `${tabColors[t]} text-white border-transparent rounded-t`
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-transparent"
            }`}
            onClick={() => { setTab(t); setResult(null); }}
          >
            {t}
          </button>
        ))}
      </div>

      {tabRenderers[tab]()}
    </div>
  );
}
