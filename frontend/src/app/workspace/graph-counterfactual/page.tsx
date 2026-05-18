"use client";

import { useState } from "react";

const API = "/api/graph";

const CF_METHODS = ["twin_network", "structural", "abduction", "interventionist", "gnn_counterfactual", "variational_cf"];
const EVAL_METRICS = ["validity", "proximity", "sparsity", "plausibility", "causally_consistent", "diversity"];
const WHATIF_SCENARIOS = ["node_removal", "edge_removal", "edge_addition", "weight_change", "subgraph_replace", "cascade_interrupt"];
const EXPLAIN_TYPES = ["necessary_cause", "sufficient_cause", "contributory_cause", "counter_necessary", "counter_sufficient", "actual_cause"];
const SENSITIVITY_METHODS = ["einstein", "rosenbaum", "cornfield", "dagitty", "causal_forest", "partial_r2"];
const FAIRNESS_METRICS = ["demographic_parity", "equalized_odds", "counterfactual_parity", "individual_fairness", "path_specific", "interventional_fair"];

const TABS = ["Generate", "Evaluate", "What-If", "Explain", "Sensitivity", "Fairness", "Summary"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>{children}</div>;
}
function StatBar({ label, value, max = 1, color = "bg-emerald-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(4)}</span></div><div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div></div>;
}
function JsonBlock({ data }: { data: unknown }) {
  return <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto max-h-80 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label><select className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>;
}
function Badge({ text, color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

export default function GraphCounterfactualPage() {
  const [tab, setTab] = useState<Tab>("Generate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const [gMethod, setGMethod] = useState("twin_network");
  const [gFactual, setGFactual] = useState(0.5);
  const [gTarget, setGTarget] = useState(0.8);
  const [gVars, setGVars] = useState(8);

  const [eMetric, setEMetric] = useState("validity");
  const [eSamples, setESamples] = useState(50);
  const [eThreshold, setEThreshold] = useState(0.7);

  const [wScenario, setWScenario] = useState("node_removal");
  const [wNodes, setWNodes] = useState(20);
  const [wEdges, setWEdges] = useState(50);
  const [wStrength, setWStrength] = useState(0.5);

  const [xType, setXType] = useState("necessary_cause");
  const [xOutcome, setXOutcome] = useState("Y");
  const [xOutcomeVal, setXOutcomeVal] = useState(1.0);
  const [xCauses, setXCauses] = useState(6);

  const [sMethod, setSMethod] = useState("einstein");
  const [sTreatment, setSTreatment] = useState("X_0");

  const [fMetric, setFMetric] = useState("counterfactual_parity");
  const [fSensitive, setFSensitive] = useState("A");
  const [fIndividuals, setFIndividuals] = useState(50);
  const [fThreshold, setFThreshold] = useState(0.1);

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true); setResult(null);
    try { const r = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setResult(await r.json()); }
    catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const renderGenerate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Counterfactual Generation">
        <SelectField label="Method" value={gMethod} onChange={setGMethod} options={CF_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Factual Outcome</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={gFactual} onChange={(e) => setGFactual(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Outcome</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={gTarget} onChange={(e) => setGTarget(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Variables</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={gVars} onChange={(e) => setGVars(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/counterfactual/generate", { graph_id: "cf_01", method: gMethod, factual_outcome: gFactual, target_outcome: gTarget, num_variables: gVars, intervention_vars: ["X_0", "X_1"] })}>{loading ? "Generating..." : "Generate Counterfactual"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "counterfactual" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const cf = d.counterfactual as Record<string, unknown>;
          const changes = (d.changes || []) as Array<Record<string, unknown>>;
          const path = d.causal_path as Record<string, unknown>;
          return (<>
            <Card title="Counterfactual Result">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-red-500">{String(cf?.factual_outcome || d.config && (d.config as Record<string, unknown>)?.factual_outcome)}</div><div className="text-xs text-gray-500">Factual</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(cf?.achieved_outcome)}</div><div className="text-xs text-gray-500">Achieved</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(cf?.target_outcome)}</div><div className="text-xs text-gray-500">Target</div></div>
              </div>
              <div className="text-xs text-gray-500">Gap: {String(cf?.outcome_gap)} | Iterations: {String(cf?.iterations_used)}</div>
            </Card>
            <Card title="Changes (Factual → Counterfactual)">
              <div className="space-y-1">
                {changes.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                    <span className="font-mono">{String(c.variable)}</span>
                    <span>{String(c.factual_value)} → {String(c.counterfactual_value)}</span>
                    <Badge text={`Δ ${String(c.change)}`} color={Number(c.change) > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"} />
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Causal Path">
              <div className="text-xs">{String(path?.from_vars)} → {String(path?.through_vars)} → {String(path?.to_outcome)} | Strength: {String(path?.path_strength)}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderEvaluate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="CF Evaluation">
        <SelectField label="Metric" value={eMetric} onChange={setEMetric} options={EVAL_METRICS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Samples</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={eSamples} onChange={(e) => setESamples(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Threshold</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={eThreshold} onChange={(e) => setEThreshold(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/counterfactual/evaluate", { graph_id: "ev_01", metric: eMetric, num_samples: eSamples, threshold: eThreshold })}>{loading ? "Evaluating..." : "Evaluate"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "overall_score" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const samples = (d.samples || []) as Array<Record<string, unknown>>;
          const sum = d.summary as Record<string, unknown>;
          const dist = d.distribution_analysis as Record<string, unknown>;
          return (<>
            <Card title="Evaluation Results">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center"><div className="text-2xl font-bold text-indigo-600">{String(d.overall_score)}</div><div className="text-xs text-gray-500">Score</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(sum?.pass_rate)}</div><div className="text-xs text-gray-500">Pass Rate</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(sum?.mean_score)}</div><div className="text-xs text-gray-500">Mean</div></div>
              </div>
            </Card>
            <Card title="Sample Scores">
              <div className="space-y-1 max-h-40 overflow-auto">
                {samples.map((s, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1">
                    <span className="font-mono">#{String(s.sample_id)}</span>
                    <span>Score: {String(s.score)}</span>
                    <Badge text={s.passed ? "PASS" : "FAIL"} color={s.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"} />
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Distribution">
              <div className="text-xs">Factual mean: {String(dist?.factual_mean)} | CF mean: {String(dist?.cf_mean)} | Wasserstein: {String(dist?.wasserstein_distance)} | KL: {String(dist?.kl_divergence)}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderWhatIf = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="What-If Scenario">
        <SelectField label="Scenario" value={wScenario} onChange={setWScenario} options={WHATIF_SCENARIOS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nodes</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={wNodes} onChange={(e) => setWNodes(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Edges</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={wEdges} onChange={(e) => setWEdges(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Perturbation</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={wStrength} onChange={(e) => setWStrength(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/counterfactual/whatif", { graph_id: "wi_01", scenario: wScenario, num_nodes: wNodes, num_edges: wEdges, perturbation_strength: wStrength })}>{loading ? "Analyzing..." : "Run What-If"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "graph_metrics" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const metrics = d.graph_metrics as Record<string, unknown>;
          const before = metrics?.before as Record<string, unknown>;
          const after = metrics?.after as Record<string, unknown>;
          const delta = metrics?.delta as Record<string, unknown>;
          const cascade = (d.cascading_effects || []) as Array<Record<string, unknown>>;
          const robust = d.robustness as Record<string, unknown>;
          return (<>
            <Card title="Graph Metrics (Before → After)">
              <div className="space-y-2">
                {Object.keys(before || {}).map((k) => (
                  <div key={k} className="flex justify-between text-xs"><span className="text-gray-600 dark:text-gray-400">{k}</span><span>{String(before?.[k])} → {String(after?.[k])} <Badge text={String(delta?.[k])} color={Number(delta?.[k]) >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"} /></span></div>
                ))}
              </div>
            </Card>
            <Card title="Cascading Effects">
              <div className="space-y-1">{cascade.map((c, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><span className="font-mono">{String(c.node)}</span><span>{String(c.before)} → {String(c.after)}</span><span>Depth: {String(c.propagation_depth)}</span></div>))}</div>
            </Card>
            <Card title="Robustness">
              <StatBar label="Resilience" value={Number(robust?.graph_resilience || 0)} color="bg-amber-500" />
              <div className="text-xs">Critical nodes: {String(robust?.critical_nodes)} | Recovery: {String(robust?.recovery_probability)}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderExplain = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Counterfactual Explanation">
        <SelectField label="Type" value={xType} onChange={setXType} options={EXPLAIN_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Outcome</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={xOutcome} onChange={(e) => setXOutcome(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Outcome Value</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={xOutcomeVal} onChange={(e) => setXOutcomeVal(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/counterfactual/explain", { graph_id: "ex_01", explanation_type: xType, outcome: xOutcome, outcome_value: xOutcomeVal, num_candidate_causes: xCauses })}>{loading ? "Explaining..." : "Explain"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "primary_explanation" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const primary = d.primary_explanation as Record<string, unknown>;
          const candidates = (d.causal_candidates || []) as Array<Record<string, unknown>>;
          const chain = (d.explanation_chain || []) as Array<Record<string, unknown>>;
          const bft = d.but_for_test as Record<string, unknown>;
          return (<>
            <Card title="Primary Explanation">
              <div className="bg-rose-50 dark:bg-rose-950 rounded p-3">
                <div className="text-sm font-bold text-rose-700 dark:text-rose-300">{String(primary?.cause)} → {String(d.config && (d.config as Record<string, unknown>)?.outcome)}</div>
                <div className="text-xs mt-1">{String(primary?.reasoning)}</div>
                <div className="text-xs mt-1 text-gray-500">{String(primary?.counterfactual)}</div>
              </div>
            </Card>
            <Card title="Causal Candidates">
              <div className="space-y-1">{candidates.map((c, i) => (
                <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                  <span className="font-mono">{String(c.cause_variable)}</span>
                  <StatBar label="" value={Number(c.causal_strength || 0)} color="bg-rose-500" />
                  <span>Dep: {String(c.counterfactual_dependence)}</span>
                </div>
              ))}</div>
            </Card>
            <Card title="But-For Test">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div><span className="text-gray-500">Original</span><div className="font-mono font-bold">{String(bft?.original_outcome)}</div></div>
                <div><span className="text-gray-500">CF Outcome</span><div className="font-mono font-bold">{String(bft?.counterfactual_outcome)}</div></div>
                <div><Badge text={bft?.passed ? "PASSED" : "FAILED"} color={bft?.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"} /></div>
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderSensitivity = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Sensitivity Analysis">
        <SelectField label="Method" value={sMethod} onChange={setSMethod} options={SENSITIVITY_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Treatment</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={sTreatment} onChange={(e) => setSTreatment(e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/counterfactual/sensitivity", { graph_id: "sa_01", method: sMethod, treatment: sTreatment, outcome: "Y", confounders: ["X_2", "X_3", "X_4"] })}>{loading ? "Analyzing..." : "Analyze Sensitivity"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "main_result" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const main = d.main_result as Record<string, unknown>;
          const confs = (d.confounder_analysis || []) as Array<Record<string, unknown>>;
          const sum = d.summary as Record<string, unknown>;
          return (<>
            <Card title="Main Results">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-teal-600">{String(main?.point_estimate)}</div><div className="text-xs text-gray-500">Estimate</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(main?.robustness_value)}</div><div className="text-xs text-gray-500">Robustness</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(main?.e_value)}</div><div className="text-xs text-gray-500">E-Value</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(main?.partial_r2)}</div><div className="text-xs text-gray-500">R²</div></div>
              </div>
            </Card>
            <Card title="Confounder Analysis">
              <div className="space-y-1">{confs.map((c, i) => (
                <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                  <span className="font-mono">{String(c.confounder)}</span>
                  <span>Bias: {String(c.potential_bias)}</span>
                  <span>R²T: {String(c.r2_with_treatment)}</span>
                  <span>R²Y: {String(c.r2_with_outcome)}</span>
                </div>
              ))}</div>
            </Card>
            <Card title="Conclusion">
              <div className="text-xs">Robustness Rate: {String(sum?.robustness_rate)} | Max Bias: {String(sum?.max_bias)} | <Badge text={String(sum?.conclusion)} color={sum?.conclusion === "robust" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"} /></div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderFairness = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Counterfactual Fairness">
        <SelectField label="Metric" value={fMetric} onChange={setFMetric} options={FAIRNESS_METRICS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sensitive Attribute</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fSensitive} onChange={(e) => setFSensitive(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Individuals</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fIndividuals} onChange={(e) => setFIndividuals(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Threshold</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fThreshold} onChange={(e) => setFThreshold(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/counterfactual/fairness", { graph_id: "ff_01", fairness_metric: fMetric, sensitive_attribute: fSensitive, outcome: "Y", num_individuals: fIndividuals, threshold: fThreshold })}>{loading ? "Assessing..." : "Assess Fairness"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "fairness_score" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const group = d.group_analysis as Record<string, unknown>;
          const paths = d.paths as Record<string, unknown>;
          const sum = d.summary as Record<string, unknown>;
          return (<>
            <Card title="Fairness Score">
              <div className="text-center mb-3">
                <div className="text-3xl font-bold text-violet-600">{String(d.fairness_score)}</div>
                <div className="text-xs text-gray-500">{String(d.fairness_metric)}</div>
              </div>
              <Badge text={sum?.is_fair ? "FAIR" : "UNFAIR"} color={sum?.is_fair ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"} />
            </Card>
            <Card title="Group Analysis">
              <div className="grid grid-cols-4 gap-3 text-center text-xs">
                <div><span className="text-gray-500">Group A</span><div className="font-mono font-bold">{String(group?.group_a_mean)}</div></div>
                <div><span className="text-gray-500">Group B</span><div className="font-mono font-bold">{String(group?.group_b_mean)}</div></div>
                <div><span className="text-gray-500">Disparity</span><div className="font-mono font-bold text-amber-600">{String(group?.disparity)}</div></div>
                <div><span className="text-gray-500">Parity</span><div className="font-mono font-bold">{String(group?.statistical_parity)}</div></div>
              </div>
            </Card>
            <Card title="Causal Path Decomposition">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>Direct Effect: <span className="font-mono">{String(paths?.direct_effect)}</span></div>
                <div>Indirect Effect: <span className="font-mono">{String(paths?.indirect_effect)}</span></div>
                <div>Spurious Effect: <span className="font-mono">{String(paths?.spurious_effect)}</span></div>
                <div>Total Effect: <span className="font-mono font-bold">{String(paths?.total_effect)}</span></div>
              </div>
            </Card>
            <Card title="Recommendation">
              <div className="text-xs">Fairness Rate: {String(sum?.fairness_rate)} | Action: <Badge text={String(sum?.recommendation)} /></div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div>
      <button className="rounded bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 mb-4" disabled={loading} onClick={async () => { setLoading(true); try { const r = await fetch(`${API}/counterfactual/summary`); setResult(await r.json()); } catch (e) { setResult({ error: String(e) }); } setLoading(false); }}>{loading ? "Loading..." : "Load Summary"}</button>
      {result && <JsonBlock data={result} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Graph Causal Counterfactual Reasoning Engine</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.220 — Counterfactual generation, evaluation, what-if scenarios, causal explanation, sensitivity analysis, and fairness assessment</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (<button key={t} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === t ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`} onClick={() => { setTab(t); setResult(null); }}>{t}</button>))}
        </div>
        {tab === "Generate" && renderGenerate()}
        {tab === "Evaluate" && renderEvaluate()}
        {tab === "What-If" && renderWhatIf()}
        {tab === "Explain" && renderExplain()}
        {tab === "Sensitivity" && renderSensitivity()}
        {tab === "Fairness" && renderFairness()}
        {tab === "Summary" && renderSummary()}
      </div>
    </div>
  );
}
