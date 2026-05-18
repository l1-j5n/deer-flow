"use client";

import { useState } from "react";

const API = "/api/graph";

const FUSION_STRATEGIES = ["ensemble_voting", "bayesian_averaging", "constraint_intersection", "graph_agreement", "adaptive_weighting", "hierarchical_consensus"];
const TEMPORAL_MODES = ["window_sliding", "event_driven", "granger_cascade", "state_space", "recurrent_causal", "dynamic_bayesian"];
const CF_METHODS = ["potential_outcome", "structural_model", "twin_network", "transportability", "selection_diagram", "parameter_sensitivity"];
const TRANSFER_MODES = ["domain_adaptation", "causal_invariance", "mechanism_copy", "distribution_shift", "multi_source_fusion", "incremental_transfer"];
const EXPLAIN_MODES = ["path_tracing", "decomposition", "sufficiency_analysis", "necessity_analysis", "responsibility_attribution", "contextual_explanation"];
const VALIDATION_METHODS = ["refutation_test", "placebo_test", "sensitivity_analysis", "bootstrap_ci", "falsification", "cross_validation"];

const TABS = ["Fusion", "Temporal", "Counterfactual", "Transfer", "Explain", "Validate", "Summary"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>{children}</div>;
}
function StatBar({ label, value, max = 1, color = "bg-indigo-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-mono text-gray-800 dark:text-gray-200">{typeof value === "number" ? value.toFixed(4) : value}</span></div><div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div></div>;
}
function JsonBlock({ data }: { data: unknown }) {
  return <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto max-h-80 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label><select className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>;
}
function Badge({ text, color = "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

export default function CausalSynthesisPage() {
  const [tab, setTab] = useState<Tab>("Fusion");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Fusion params
  const [fusionStrategy, setFusionStrategy] = useState("ensemble_voting");
  const [fusionMethods, setFusionMethods] = useState(4);
  const [fusionConfThreshold, setFusionConfThreshold] = useState(0.7);
  const [fusionMaxEdges, setFusionMaxEdges] = useState(30);

  // Temporal params
  const [tempMode, setTempMode] = useState("window_sliding");
  const [tempSteps, setTempSteps] = useState(50);
  const [tempWindow, setTempWindow] = useState(5);
  const [tempVars, setTempVars] = useState(10);

  // Counterfactual params
  const [cfMethod, setCfMethod] = useState("potential_outcome");
  const [cfScenarios, setCfScenarios] = useState(5);
  const [cfStrength, setCfStrength] = useState(0.5);
  const [cfVars, setCfVars] = useState(10);

  // Transfer params
  const [transferMode, setTransferMode] = useState("domain_adaptation");
  const [transferDomains, setTransferDomains] = useState(3);
  const [transferSteps, setTransferSteps] = useState(20);

  // Explain params
  const [explainMode, setExplainMode] = useState("path_tracing");
  const [explainTarget, setExplainTarget] = useState("var_1");
  const [explainDepth, setExplainDepth] = useState(5);
  const [explainPaths, setExplainPaths] = useState(10);

  // Validate params
  const [validMethod, setValidMethod] = useState("refutation_test");
  const [validTests, setValidTests] = useState(5);
  const [validPerturb, setValidPerturb] = useState(0.3);
  const [validBootstrap, setValidBootstrap] = useState(1000);

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true); setResult(null);
    try { const r = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setResult(await r.json()); }
    catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const renderFusion = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Causal Fusion Discovery">
        <SelectField label="Strategy" value={fusionStrategy} onChange={setFusionStrategy} options={FUSION_STRATEGIES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Methods</label><input type="number" min={1} max={6} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fusionMethods} onChange={(e) => setFusionMethods(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confidence Threshold</label><input type="number" min={0} max={1} step={0.05} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fusionConfThreshold} onChange={(e) => setFusionConfThreshold(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Edges</label><input type="number" min={5} max={100} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fusionMaxEdges} onChange={(e) => setFusionMaxEdges(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-synthesis/fusion", { graph_id: "g_fusion", strategy: fusionStrategy, num_methods: fusionMethods, confidence_threshold: fusionConfThreshold, max_edges: fusionMaxEdges })}>{loading ? "Computing..." : "Run Fusion"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "fused_edges" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return <>
            <Card title="Fusion Metrics">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatBar label="Fusion Quality" value={(d as Record<string, unknown>).fusion_quality as number} />
                <StatBar label="Consensus Score" value={(d as Record<string, unknown>).consensus_score as number} />
                <StatBar label="Conflict Rate" value={(d as Record<string, unknown>).conflict_rate as number} color="bg-amber-500" />
                <StatBar label="Precision" value={(d as Record<string, unknown>).estimated_precision as number} color="bg-emerald-500" />
              </div>
            </Card>
            <Card title={`Fused Edges (${(d.fused_edges as unknown[])?.length ?? 0})`}>
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-gray-200 dark:border-gray-600"><th className="text-left py-1 px-2">From</th><th className="text-left py-1 px-2">To</th><th className="text-left py-1 px-2">Confidence</th><th className="text-left py-1 px-2">Strength</th><th className="text-left py-1 px-2">Agree</th></tr></thead>
                  <tbody>{(d.fused_edges as Record<string, unknown>[])?.slice(0, 15).map((e, i) => <tr key={i} className="border-b border-gray-100 dark:border-gray-700"><td className="py-1 px-2 font-mono">{String(e.from)}</td><td className="py-1 px-2 font-mono">{String(e.to)}</td><td className="py-1 px-2"><Badge text={String(e.confidence)} color={Number(e.confidence) > 0.8 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"} /></td><td className="py-1 px-2 font-mono">{String(e.causal_strength)}</td><td className="py-1 px-2">{String(e.methods_agree)}</td></tr>)}</tbody>
                </table>
              </div>
            </Card>
          </>;
        })()}
      </div>
    </div>
  );

  const renderTemporal = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Temporal-Causal Integration">
        <SelectField label="Mode" value={tempMode} onChange={setTempMode} options={TEMPORAL_MODES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time Steps</label><input type="number" min={10} max={500} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={tempSteps} onChange={(e) => setTempSteps(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Window Size</label><input type="number" min={1} max={20} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={tempWindow} onChange={(e) => setTempWindow(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Variables</label><input type="number" min={3} max={30} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={tempVars} onChange={(e) => setTempVars(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-synthesis/temporal-causal", { graph_id: "g_temp", mode: tempMode, time_steps: tempSteps, window_size: tempWindow, num_variables: tempVars })}>{loading ? "Computing..." : "Run Temporal"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "causal_series" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return <>
            <Card title="Temporal Metrics">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatBar label="Temporal Stability" value={d.temporal_stability as number} />
                <StatBar label="Causal Persistence" value={d.causal_persistence as number} color="bg-blue-500" />
                <StatBar label="Causal Entropy" value={d.causal_entropy as number} max={2} color="bg-amber-500" />
                <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-400">Avg Lag</span><span className="font-mono text-gray-800 dark:text-gray-200">{String(d.average_lag)}</span></div><div className="flex justify-between text-xs"><span className="text-gray-600 dark:text-gray-400">Forecast Horizon</span><span className="font-mono text-gray-800 dark:text-gray-200">{String(d.forecast_horizon)}</span></div></div>
              </div>
            </Card>
            <Card title={`Change Points (${(d.change_points as unknown[])?.length ?? 0})`}>
              <div className="space-y-2">{(d.change_points as Record<string, unknown>[])?.map((cp, i) => <div key={i} className="flex items-center gap-3 text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded"><Badge text={`t=${String(cp.time_step)}`} color="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" /><span className="text-gray-600 dark:text-gray-400">{String(cp.type)}</span><span className="ml-auto font-mono">{String(cp.magnitude)}</span></div>)}</div>
            </Card>
          </>;
        })()}
      </div>
    </div>
  );

  const renderCounterfactual = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Counterfactual Synthesis">
        <SelectField label="Method" value={cfMethod} onChange={setCfMethod} options={CF_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Scenarios</label><input type="number" min={1} max={20} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cfScenarios} onChange={(e) => setCfScenarios(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Intervention Strength</label><input type="number" min={0.1} max={2} step={0.1} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cfStrength} onChange={(e) => setCfStrength(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Variables</label><input type="number" min={3} max={30} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cfVars} onChange={(e) => setCfVars(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-synthesis/counterfactual", { graph_id: "g_cf", method: cfMethod, num_scenarios: cfScenarios, intervention_strength: cfStrength, num_variables: cfVars })}>{loading ? "Computing..." : "Run Counterfactual"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "scenarios" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return <>
            <Card title="Counterfactual Metrics">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatBar label="Avg Plausibility" value={d.average_plausibility as number} />
                <StatBar label="Avg Total Effect" value={d.average_total_effect as number} color="bg-blue-500" />
                <StatBar label="Identifiability" value={d.causal_identifiability as number} color="bg-emerald-500" />
                <StatBar label="WhatIf Coverage" value={d.whatif_coverage as number} color="bg-violet-500" />
              </div>
            </Card>
            <Card title={`Scenarios (${(d.scenarios as unknown[])?.length ?? 0})`}>
              <div className="space-y-2">{(d.scenarios as Record<string, unknown>[])?.map((s, i) => <div key={i} className="p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs"><div className="flex items-center gap-2 mb-1"><Badge text={`#${String(s.scenario_id)}`} /><span className="text-gray-500">Intervened: {(s.intervened_variables as string[])?.join(", ")}</span><span className="ml-auto font-mono">Effect: {String(s.total_effect)}</span></div><div className="flex items-center gap-2"><span className="text-gray-500">Plausibility:</span><StatBar label="" value={s.plausibility as number} /></div></div>)}</div>
            </Card>
          </>;
        })()}
      </div>
    </div>
  );

  const renderTransfer = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Meta-Causal Transfer">
        <SelectField label="Transfer Mode" value={transferMode} onChange={setTransferMode} options={TRANSFER_MODES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Source Domains</label><input type="number" min={1} max={8} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={transferDomains} onChange={(e) => setTransferDomains(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Adaptation Steps</label><input type="number" min={5} max={100} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={transferSteps} onChange={(e) => setTransferSteps(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-synthesis/meta-transfer", { graph_id: "g_transfer", transfer_mode: transferMode, num_source_domains: transferDomains, num_variables: 10, adaptation_steps: transferSteps })}>{loading ? "Computing..." : "Run Transfer"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "domains" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return <>
            <Card title="Transfer Metrics">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatBar label="Overall Transferability" value={d.overall_transferability as number} />
                <StatBar label="Cross-Domain Consistency" value={d.cross_domain_consistency as number} color="bg-blue-500" />
                <StatBar label="Transfer Efficiency" value={d.transfer_efficiency as number} color="bg-emerald-500" />
              </div>
            </Card>
            <Card title="Domain Transfer Results">
              <div className="space-y-2">{(d.transfer_results as Record<string, unknown>[])?.map((t, i) => <div key={i} className="flex items-center gap-3 text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded"><Badge text={String(t.source_domain)} color="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300" /><span className="text-gray-600 dark:text-gray-400">Transfer: {String(t.transferability_score)}</span><span className="text-gray-500">Overlap: {String(t.mechanism_overlap)}</span><span className="ml-auto">Adapt: {String(t.adaptation_needed)}</span></div>)}</div>
            </Card>
          </>;
        })()}
      </div>
    </div>
  );

  const renderExplain = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Causal Explanation & Attribution">
        <SelectField label="Mode" value={explainMode} onChange={setExplainMode} options={EXPLAIN_MODES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Variable</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={explainTarget} onChange={(e) => setExplainTarget(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Depth</label><input type="number" min={1} max={10} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={explainDepth} onChange={(e) => setExplainDepth(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Paths</label><input type="number" min={1} max={50} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={explainPaths} onChange={(e) => setExplainPaths(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-synthesis/explain", { graph_id: "g_explain", mode: explainMode, target_variable: explainTarget, depth: explainDepth, num_paths: explainPaths })}>{loading ? "Computing..." : "Run Explanation"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "attributions" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return <>
            <Card title="Explanation Metrics">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatBar label="Completeness" value={d.explanation_completeness as number} />
                <StatBar label="Fidelity" value={d.explanation_fidelity as number} color="bg-blue-500" />
                <StatBar label="Variance Explained" value={d.total_variance_explained as number} color="bg-emerald-500" />
              </div>
            </Card>
            <Card title="Attributions">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-gray-200 dark:border-gray-600"><th className="text-left py-1 px-2">Variable</th><th className="text-left py-1 px-2">Direct</th><th className="text-left py-1 px-2">Indirect</th><th className="text-left py-1 px-2">Total</th><th className="text-left py-1 px-2">Attribution</th></tr></thead>
                  <tbody>{(d.attributions as Record<string, unknown>[])?.slice(0, 10).map((a, i) => <tr key={i} className="border-b border-gray-100 dark:border-gray-700"><td className="py-1 px-2 font-mono">{String(a.variable)}</td><td className="py-1 px-2">{String(a.direct_effect)}</td><td className="py-1 px-2">{String(a.indirect_effect)}</td><td className="py-1 px-2 font-semibold">{String(a.total_effect)}</td><td className="py-1 px-2"><StatBar label="" value={a.normalized_attribution as number} /></td></tr>)}</tbody>
                </table>
              </div>
            </Card>
          </>;
        })()}
      </div>
    </div>
  );

  const renderValidate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Causal Validation & Robustness">
        <SelectField label="Method" value={validMethod} onChange={setValidMethod} options={VALIDATION_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Tests</label><input type="number" min={1} max={20} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={validTests} onChange={(e) => setValidTests(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Perturbation Strength</label><input type="number" min={0.01} max={1} step={0.05} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={validPerturb} onChange={(e) => setValidPerturb(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bootstrap Samples</label><input type="number" min={100} max={10000} step={100} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={validBootstrap} onChange={(e) => setValidBootstrap(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-synthesis/validate", { graph_id: "g_valid", method: validMethod, num_tests: validTests, perturbation_strength: validPerturb, bootstrap_samples: validBootstrap })}>{loading ? "Computing..." : "Run Validation"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "tests" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return <>
            <Card title="Validation Metrics">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatBar label="Pass Rate" value={d.pass_rate as number} color={Number(d.pass_rate) > 0.7 ? "bg-emerald-500" : "bg-rose-500"} />
                <StatBar label="Overall Validity" value={d.overall_validity as number} />
                <div className="col-span-2"><Badge text={`Recommendation: ${String(d.recommendation)}`} color={String(d.recommendation) === "proceed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"} /></div>
              </div>
            </Card>
            <Card title={`Tests (${String(d.tests_passed)}/${String(d.tests_total)} passed)`}>
              <div className="space-y-2">{(d.tests as Record<string, unknown>[])?.map((t, i) => <div key={i} className="flex items-center gap-3 text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded"><Badge text={t.passed ? "PASS" : "FAIL"} color={t.passed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300"} /><span className="text-gray-600 dark:text-gray-400">{String(t.test_name)}</span><span className="ml-auto font-mono">p={String(t.p_value)}</span></div>)}</div>
            </Card>
            <Card title="Assumptions">
              <div className="space-y-2">{(d.assumptions as Record<string, unknown>[])?.map((a, i) => <div key={i} className="flex items-center gap-3 text-xs p-2 bg-gray-50 dark:bg-gray-900 rounded"><span className="font-medium text-gray-700 dark:text-gray-300">{String(a.assumption)}</span><Badge text={String(a.status)} color={String(a.status) === "satisfied" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : String(a.status) === "violated" ? "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"} /><span className="ml-auto font-mono">{String(a.confidence)}</span></div>)}</div>
            </Card>
          </>;
        })()}
      </div>
    </div>
  );

  const renderSummary = () => (
    <Card title="Engine Summary">
      <button className="mb-4 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 px-4 disabled:opacity-50" disabled={loading} onClick={async () => { setLoading(true); setResult(null); try { const r = await fetch(`${API}/causal-synthesis/summary`); setResult(await r.json()); } catch (e) { setResult({ error: String(e) }); } setLoading(false); }}>{loading ? "Loading..." : "Load Summary"}</button>
      {result && <JsonBlock data={result} />}
    </Card>
  );

  const renderResult = () => {
    if (!result) return null;
    if ("error" in (result as Record<string, unknown>)) return <Card title="Error"><JsonBlock data={result} /></Card>;
    if (!("fused_edges" in (result as Record<string, unknown>)) && !("causal_series" in (result as Record<string, unknown>)) && !("scenarios" in (result as Record<string, unknown>)) && !("domains" in (result as Record<string, unknown>)) && !("attributions" in (result as Record<string, unknown>)) && !("tests" in (result as Record<string, unknown>)) && !("version" in (result as Record<string, unknown>)))
      return <Card title="Raw Result"><JsonBlock data={result} /></Card>;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Graph Causal Reasoning Synthesis</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.223 — Unified causal reasoning: fusion discovery, temporal-causal, counterfactual, meta-transfer, explanation, validation</p>
        </div>
        <div className="flex gap-1 mb-6 flex-wrap">
          {TABS.map((t) => <button key={t} className={`px-4 py-2 rounded text-sm font-medium transition-colors ${tab === t ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"}`} onClick={() => { setTab(t); setResult(null); }}>{t}</button>)}
        </div>
        {tab === "Fusion" && renderFusion()}
        {tab === "Temporal" && renderTemporal()}
        {tab === "Counterfactual" && renderCounterfactual()}
        {tab === "Transfer" && renderTransfer()}
        {tab === "Explain" && renderExplain()}
        {tab === "Validate" && renderValidate()}
        {tab === "Summary" && renderSummary()}
        {renderResult()}
      </div>
    </div>
  );
}
