"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.242 backend
const FEDERATED_STRATEGIES = ["fedavg_cf", "fedprox_cf", "personalized_fedavg_cf", "caffold_fed_cf", "scaffold_local_dp_cf", "moon_cf"];
const PRIVACY_MECHANISMS = ["local_dp", "global_dp", "secure_aggregation", "differential_privacy_shield", "homomorphic_encryption", "multi_party_computation"];
const COUNTERFACTUAL_TYPES = ["node_intervention", "edge_intervention", "path_intervention", "subgraph_intervention", "temporal_intervention", "federated_intervention"];
const AGGREGATION_METHODS = ["weighted_avg", "median_aggregation", "trimmed_mean", "krum", "multi_krum", "robust_aggregation"];
const FAIRNESS_CONSTRAINTS = ["counterfactual_parity_fed", "equalized_odds_fed", "calibration_fed", "individual_fairness", "subgroup_fairness", "causal_fairness_fed"];
const EVALUATION_METRICS = ["federated_validity", "causal_consistency", "cross_party_diversity", "privacy_budget", "fairness_audit", "counterfactual_robustness"];

const TABS = ["Train", "Generate", "Evaluate", "Privacy", "Fairness", "What-If", "Overview"] as const;
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
function Badge({ text, color = "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

export default function GraphFederatedCFPage() {
  const [tab, setTab] = useState<Tab>("Train");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Train state
  const [trainGraphId, setTrainGraphId] = useState("fedcf_01");
  const [trainStrategy, setTrainStrategy] = useState("fedavg_cf");
  const [trainNumParties, setTrainNumParties] = useState(5);
  const [trainPrivacy, setTrainPrivacy] = useState("local_dp");
  const [trainRounds, setTrainRounds] = useState(50);
  const [trainLearningRate, setTrainLearningRate] = useState(0.01);

  // Generate state
  const [genGraphId, setGenGraphId] = useState("fedcf_01");
  const [genCfType, setGenCfType] = useState("node_intervention");
  const [genNumParties, setGenNumParties] = useState(5);
  const [genAggregation, setGenAggregation] = useState("weighted_avg");
  const [genNumSamples, setGenNumSamples] = useState(100);
  const [genTargetOutcome, setGenTargetOutcome] = useState(0.8);

  // Evaluate state
  const [evalGraphId, setEvalGraphId] = useState("fedcf_01");
  const [evalMetric, setEvalMetric] = useState("federated_validity");
  const [evalNumParties, setEvalNumParties] = useState(5);
  const [evalThreshold, setEvalThreshold] = useState(0.7);

  // Privacy state
  const [privGraphId, setPrivGraphId] = useState("fedcf_01");
  const [privPrivacy, setPrivPrivacy] = useState("local_dp");
  const [privNumParties, setPrivNumParties] = useState(5);
  const [privEpsilon, setPrivEpsilon] = useState(1.0);
  const [privDelta, setPrivDelta] = useState(1e-5);

  // Fairness state
  const [fairGraphId, setFairGraphId] = useState("fedcf_01");
  const [fairFairness, setFairFairness] = useState("counterfactual_parity_fed");
  const [fairNumParties, setFairNumParties] = useState(5);
  const [fairSensitiveAttribute, setFairSensitiveAttribute] = useState("A");
  const [fairThreshold, setFairThreshold] = useState(0.8);

  // What-If state
  const [whatIfGraphId, setWhatIfGraphId] = useState("fedcf_01");
  const [whatIfCfType, setWhatIfCfType] = useState("edge_intervention");
  const [whatIfNumParties, setWhatIfNumParties] = useState(5);
  const [whatIfPerturbationStrength, setWhatIfPerturbationStrength] = useState(0.5);

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true); setResult(null);
    try {
      const r = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setResult(await r.json());
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const renderTrain = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Federated Training">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trainGraphId} onChange={(e) => setTrainGraphId(e.target.value)} /></div>
        <SelectField label="Federated Strategy" value={trainStrategy} onChange={setTrainStrategy} options={FEDERATED_STRATEGIES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Parties</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trainNumParties} onChange={(e) => setTrainNumParties(+e.target.value)} /></div>
        <SelectField label="Privacy Mechanism" value={trainPrivacy} onChange={setTrainPrivacy} options={PRIVACY_MECHANISMS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Training Rounds</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trainRounds} onChange={(e) => setTrainRounds(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Learning Rate</label><input type="number" step="0.001" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trainLearningRate} onChange={(e) => setTrainLearningRate(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/federated-cf/train", { graph_id: trainGraphId, strategy: trainStrategy, num_parties: trainNumParties, privacy: trainPrivacy, rounds: trainRounds, learning_rate: trainLearningRate })}>{loading ? "Training..." : "Start Training"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "training_result" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const training = d.training_result as Record<string, unknown>;
          const perf = training.performance as Record<string, number>;
          const agg = training.aggregation as Record<string, number>;
          return (<>
            <Card title="Training Progress">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{training.global_accuracy?.toFixed(3) ?? "-"}</div><div className="text-xs text-gray-500">Global Accuracy</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(training.rounds_completed ?? 0)}/{String(training.total_rounds ?? 0)}</div><div className="text-xs text-gray-500">Rounds</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{training.num_parties ?? 0}</div><div className="text-xs text-gray-500">Parties</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{perf?.model_params ?? "-"}</div><div className="text-xs text-gray-500">Parameters</div></div>
              </div>
              <StatBar label="Global Accuracy" value={training.global_accuracy ?? 0} color="bg-blue-500" />
              <StatBar label="Causal Consistency" value={agg?.causal_consistency ?? 0} color="bg-emerald-500" />
              <StatBar label="Counterfactual Validity" value={agg?.counterfactual_validity ?? 0} color="bg-amber-500" />
            </Card>
            <Card title="Aggregation Metrics">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{agg?.num_updates ?? 0}</div><div className="text-xs text-gray-500">Updates</div></div>
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(agg?.agg_strategy)}</div><div className="text-xs text-gray-500">Strategy</div></div>
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(agg?.causal_weight?.toFixed(3) ?? "-")}</div><div className="text-xs text-gray-500">Causal Weight</div></div>
              </div>
              <StatBar label="Federated Validity" value={agg?.federated_validity ?? 0} color="bg-blue-500" />
              <StatBar label="Cross-Party Diversity" value={agg?.cross_party_diversity ?? 0} color="bg-emerald-500" />
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderGenerate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Counterfactual Generation">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={genGraphId} onChange={(e) => setGenGraphId(e.target.value)} /></div>
        <SelectField label="Counterfactual Type" value={genCfType} onChange={setGenCfType} options={COUNTERFACTUAL_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Parties</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={genNumParties} onChange={(e) => setGenNumParties(+e.target.value)} /></div>
        <SelectField label="Aggregation Method" value={genAggregation} onChange={setGenAggregation} options={AGGREGATION_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Samples</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={genNumSamples} onChange={(e) => setGenNumSamples(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Outcome</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={genTargetOutcome} onChange={(e) => setGenTargetOutcome(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/federated-cf/generate", { graph_id: genGraphId, cf_type: genCfType, num_parties: genNumParties, aggregation: genAggregation, num_samples: genNumSamples, target_outcome: genTargetOutcome })}>{loading ? "Generating..." : "Generate Counterfactuals"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Generation Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderEvaluate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Federated Evaluation">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evalGraphId} onChange={(e) => setEvalGraphId(e.target.value)} /></div>
        <SelectField label="Evaluation Metric" value={evalMetric} onChange={setEvalMetric} options={EVALUATION_METRICS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Parties</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evalNumParties} onChange={(e) => setEvalNumParties(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Threshold</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evalThreshold} onChange={(e) => setEvalThreshold(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/federated-cf/evaluate", { graph_id: evalGraphId, metric: evalMetric, num_parties: evalNumParties, threshold: evalThreshold })}>{loading ? "Evaluating..." : "Evaluate Model"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Evaluation Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Privacy Analysis">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={privGraphId} onChange={(e) => setPrivGraphId(e.target.value)} /></div>
        <SelectField label="Privacy Mechanism" value={privPrivacy} onChange={setPrivPrivacy} options={PRIVACY_MECHANISMS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Parties</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={privNumParties} onChange={(e) => setPrivNumParties(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Epsilon (ε)</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={privEpsilon} onChange={(e) => setPrivEpsilon(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Delta (δ)</label><input type="number" step="1e-6" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={privDelta} onChange={(e) => setPrivDelta(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/federated-cf/privacy-analysis", { graph_id: privGraphId, privacy: privPrivacy, num_parties: privNumParties, epsilon: privEpsilon, delta: privDelta })}>{loading ? "Analyzing..." : "Analyze Privacy"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Privacy Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderFairness = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Fairness Evaluation">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fairGraphId} onChange={(e) => setFairGraphId(e.target.value)} /></div>
        <SelectField label="Fairness Constraint" value={fairFairness} onChange={setFairFairness} options={FAIRNESS_CONSTRAINTS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Parties</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fairNumParties} onChange={(e) => setFairNumParties(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sensitive Attribute</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fairSensitiveAttribute} onChange={(e) => setFairSensitiveAttribute(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Threshold</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fairThreshold} onChange={(e) => setFairThreshold(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/federated-cf/fairness", { graph_id: fairGraphId, fairness: fairFairness, num_parties: fairNumParties, sensitive_attribute: fairSensitiveAttribute, threshold: fairThreshold })}>{loading ? "Evaluating..." : "Evaluate Fairness"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Fairness Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderWhatIf = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="What-If Analysis">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={whatIfGraphId} onChange={(e) => setWhatIfGraphId(e.target.value)} /></div>
        <SelectField label="Counterfactual Type" value={whatIfCfType} onChange={setWhatIfCfType} options={COUNTERFACTUAL_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Parties</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={whatIfNumParties} onChange={(e) => setWhatIfNumParties(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Perturbation Strength</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={whatIfPerturbationStrength} onChange={(e) => setWhatIfPerturbationStrength(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/federated-cf/whatif", { graph_id: whatIfGraphId, cf_type: whatIfCfType, num_parties: whatIfNumParties, perturbation_strength: whatIfPerturbationStrength })}>{loading ? "Analyzing..." : "Analyze What-If"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="What-If Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderOverview = () => {
    const allEnums: Record<string, string[]> = {
      FederatedStrategy: FEDERATED_STRATEGIES,
      PrivacyMechanism: PRIVACY_MECHANISMS,
      CounterfactualType: COUNTERFACTUAL_TYPES,
      AggregationMethod: AGGREGATION_METHODS,
      FairnessConstraint: FAIRNESS_CONSTRAINTS,
      EvaluationMetric: EVALUATION_METRICS,
    };
    return (
      <div className="space-y-4">
        <Card title="Engine Metadata">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center"><div className="text-lg font-bold text-blue-600">v1.242.0</div><div className="text-xs text-gray-500">Version</div></div>
            <div className="text-center"><div className="text-lg font-bold text-emerald-600">7</div><div className="text-xs text-gray-500">Endpoints</div></div>
            <div className="text-center"><div className="text-lg font-bold text-amber-600">6</div><div className="text-xs text-gray-500">Enums</div></div>
            <div className="text-center"><div className="text-lg font-bold text-purple-600">36</div><div className="text-xs text-gray-500">Enum Values</div></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Graph federated counterfactual learning engine — multi-party counterfactual reasoning with privacy-preserving causal inference, fairness constraints, and cross-party what-if analysis.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge text="Federated Training" color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
            <Badge text="Counterfactual Generation" color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
            <Badge text="Privacy Analysis" color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />
            <Badge text="Fairness Evaluation" color="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" />
            <Badge text="What-If Analysis" color="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" />
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(allEnums).map(([enumName, values]) => (
            <Card key={enumName} title={enumName}>
              <div className="flex flex-wrap gap-1">
                {values.map((v) => (
                  <span key={v} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded border border-gray-200 dark:border-gray-600">
                    {v.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <Card title="Integration Chain">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">NAS Causal</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.241</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Quantum Opt</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.240</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Ontology</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.239</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Temporal Dynamics</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.238</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const tabRenderers: Record<Tab, () => React.ReactNode> = {
    Train: renderTrain,
    Generate: renderGenerate,
    Evaluate: renderEvaluate,
    Privacy: renderPrivacy,
    Fairness: renderFairness,
    "What-If": renderWhatIf,
    Overview: renderOverview,
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-100">
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Graph Federated Counterfactual Learning</h1>
        <p className="text-sm text-gray-400 mt-1">v1.242.0 &mdash; Multi-party counterfactual reasoning with privacy-preserving causal inference, fairness constraints & cross-party what-if analysis</p>
        <div className="flex gap-2 mt-2">
          <Badge text="6 Enums" color="bg-blue-900 text-blue-300" />
          <Badge text="7 Endpoints" color="bg-emerald-900 text-emerald-300" />
          <Badge text="36 Values" color="bg-purple-900 text-purple-300" />
        </div>
      </div>
      <div className="px-6 py-2 border-b border-gray-800 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setResult(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors whitespace-nowrap ${tab === t ? "bg-gray-800 text-white border-b-2 border-blue-500" : "text-gray-400 hover:text-gray-200"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {tabRenderers[tab]()}
      </div>
    </div>
  );
}
