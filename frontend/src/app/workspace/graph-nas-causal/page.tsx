"use client";

import { useState } from "react";

const API = "/api/graph";

// Enum values from nas-causal/api.ts
const CAUSAL_SEARCH_SPACES = ["causal_graph_aware", "intervention_tolerant", "counterfactual_optimized", "structural_causal_model", "do_calculus_net", "causal_attention"];
const CAUSAL_CONSTRAINTS = ["causal_consistency", "intervention_independence", "counterfactual_validity", "fairness_causal", "identifiability", "markov_equivalence"];
const CAUSAL_CELL_TYPES = ["causal_conv", "intervention_layer", "counterfactual_head", "do_operator", "causal_attention_cell", "structural_encoder"];
const CAUSAL_OPTIMIZATIONS = ["causal_accuracy", "intervention_robustness", "counterfactual_fidelity", "identification_score", "causal_discovery_quality", "intervention_effect_estimation"];
const NAS_STRATEGIES = ["evolutionary_causal", "reinforcement_causal", "bayesian_causal", "gradient_based_causal", "one_shot_causal", "multi_objective_causal"];
const CAUSAL_EVALUATIONS = ["intervention_testing", "counterfactual_evaluation", "causal_discovery_benchmark", "identification_score", "structural_validation", "fairness_causal_audit"];

const TABS = ["NAS Search", "Cell Search", "Intervention", "Counterfactual", "Constraint", "SCM", "Evaluate", "Overview"] as const;
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

export default function GraphNASCausalPage() {
  const [tab, setTab] = useState<Tab>("NAS Search");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // NAS Search state
  const [nasGraphId, setNasGraphId] = useState("causal_graph_01");
  const [nasSpace, setNasSpace] = useState("causal_graph_aware");
  const [nasStrategy, setNasStrategy] = useState("evolutionary_causal");
  const [nasTrials, setNasTrials] = useState(50);
  const [nasMaxLayers, setNasMaxLayers] = useState(6);
  const [nasOptimization, setNasOptimization] = useState("causal_accuracy");
  const [nasConstraints, setNasConstraints] = useState<string[]>(["causal_consistency"]);

  // Cell Search state
  const [cellGraphId, setCellGraphId] = useState("causal_graph_01");
  const [cellType, setCellType] = useState("causal_conv");
  const [cellCount, setCellCount] = useState(10);
  const [cellHidden, setCellHidden] = useState(128);
  const [cellAwareness, setCellAwareness] = useState(0.8);
  const [cellTolerance, setCellTolerance] = useState(0.7);

  // Intervention state
  const [intGraphId, setIntGraphId] = useState("causal_graph_01");
  const [intType, setIntType] = useState("do_intervention");
  const [intStrength, setIntStrength] = useState(0.5);
  const [intArchId, setIntArchId] = useState("arch_01");
  const [intRobustness, setIntRobustness] = useState<string[]>([]);

  // Counterfactual state
  const [cfGraphId, setCfGraphId] = useState("causal_graph_01");
  const [cfDistance, setCfDistance] = useState(2);
  const [cfFactual, setCfFactual] = useState(0.85);
  const [cfFidelity, setCfFidelity] = useState(0.8);
  const [cfCandidates, setCfCandidates] = useState(20);

  // Constraint state
  const [conGraphId, setConGraphId] = useState("causal_graph_01");
  const [conConstraint, setConConstraint] = useState("causal_consistency");
  const [conWeight, setConWeight] = useState(0.5);
  const [conTolerance, setConTolerance] = useState(0.1);
  const [conFrequency, setConFrequency] = useState(10);

  // SCM state
  const [scmGraphId, setScmGraphId] = useState("causal_graph_01");
  const [scmType, setScmType] = useState("additive");
  const [scmDepth, setScmDepth] = useState(3);
  const [scmLatent, setScmLatent] = useState(2);

  // Evaluate state
  const [evalGraphId, setEvalGraphId] = useState("causal_graph_01");
  const [evalType, setEvalType] = useState("intervention_testing");
  const [evalInterventions, setEvalInterventions] = useState<string[]>([]);
  const [evalCounterfactuals, setEvalCounterfactuals] = useState<string[]>([]);

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

  const renderNASSearch = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Causal NAS Search">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={nasGraphId} onChange={(e) => setNasGraphId(e.target.value)} /></div>
        <SelectField label="Search Space" value={nasSpace} onChange={setNasSpace} options={CAUSAL_SEARCH_SPACES} />
        <SelectField label="Strategy" value={nasStrategy} onChange={setNasStrategy} options={NAS_STRATEGIES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Trials</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={nasTrials} onChange={(e) => setNasTrials(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Layers</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={nasMaxLayers} onChange={(e) => setNasMaxLayers(+e.target.value)} /></div>
        <SelectField label="Optimization" value={nasOptimization} onChange={setNasOptimization} options={CAUSAL_OPTIMIZATIONS} />
        <button className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/nas-causal/search", { graph_id: nasGraphId, search_space: nasSpace, strategy: nasStrategy, num_trials: nasTrials, max_layers: nasMaxLayers, optimization_objective: nasOptimization, causal_constraints: nasConstraints })}>{loading ? "Searching..." : "Search Causal NAS"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "best_architecture" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const arch = d.best_architecture as Record<string, unknown>;
          const perf = arch.performance as Record<string, number>;
          const metrics = arch.causal_metrics as Record<string, number>;
          return (<>
            <Card title="Best Architecture">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(arch.architecture_id)}</div><div className="text-xs text-gray-500">Architecture ID</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{(arch.cell_types as string[])?.length ?? 0}</div><div className="text-xs text-gray-500">Cells</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{perf?.accuracy?.toFixed(3) ?? "-"}</div><div className="text-xs text-gray-500">Accuracy</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(arch.layers)?.split(",").length ?? "-"}</div><div className="text-xs text-gray-500">Layers</div></div>
              </div>
              <StatBar label="Causal Consistency" value={metrics?.causal_consistency ?? 0} color="bg-blue-500" />
              <StatBar label="Intervention Independence" value={metrics?.intervention_independence ?? 0} color="bg-emerald-500" />
              <StatBar label="Counterfactual Validity" value={metrics?.counterfactual_validity ?? 0} color="bg-amber-500" />
              <StatBar label="Identifiability" value={metrics?.identifiability ?? 0} color="bg-purple-500" />
            </Card>
            <Card title="Performance">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(perf?.total_params)}</div><div className="text-xs text-gray-500">Parameters</div></div>
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(perf?.flops)}</div><div className="text-xs text-gray-500">FLOPs</div></div>
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(perf?.latency_ms)}ms</div><div className="text-xs text-gray-500">Latency</div></div>
              </div>
              <StatBar label="Accuracy" value={perf?.accuracy ?? 0} color="bg-blue-500" />
              <StatBar label="Intervention Robustness" value={perf?.intervention_robustness ?? 0} color="bg-emerald-500" />
              <StatBar label="Counterfactual Fidelity" value={perf?.counterfactual_fidelity ?? 0} color="bg-amber-500" />
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderCellSearch = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Causal Cell Search">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cellGraphId} onChange={(e) => setCellGraphId(e.target.value)} /></div>
        <SelectField label="Cell Type" value={cellType} onChange={setCellType} options={CAUSAL_CELL_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Cells</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cellCount} onChange={(e) => setCellCount(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hidden Dim</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cellHidden} onChange={(e) => setCellHidden(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Causal Awareness</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cellAwareness} onChange={(e) => setCellAwareness(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Intervention Tolerance</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cellTolerance} onChange={(e) => setCellTolerance(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/nas-causal/cell-search", { graph_id: cellGraphId, cell_type: cellType, num_cells: cellCount, hidden_dim: cellHidden, causal_awareness: cellAwareness, intervention_tolerance: cellTolerance })}>{loading ? "Searching..." : "Search Cells"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Cell Search Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderIntervention = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Intervention Architecture">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={intGraphId} onChange={(e) => setIntGraphId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Intervention Type</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={intType} onChange={(e) => setIntType(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Intervention Strength</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={intStrength} onChange={(e) => setIntStrength(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Architecture ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={intArchId} onChange={(e) => setIntArchId(e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/nas-causal/intervention", { graph_id: intGraphId, intervention_type: intType, intervention_strength: intStrength, architecture_id: intArchId, robustness_targets: intRobustness })}>{loading ? "Designing..." : "Design Architecture"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Intervention Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderCounterfactual = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Counterfactual NAS">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cfGraphId} onChange={(e) => setCfGraphId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Counterfactual Distance</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cfDistance} onChange={(e) => setCfDistance(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Factual Accuracy</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cfFactual} onChange={(e) => setCfFactual(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Counterfactual Fidelity</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cfFidelity} onChange={(e) => setCfFidelity(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Candidates</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cfCandidates} onChange={(e) => setCfCandidates(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/nas-causal/counterfactual", { graph_id: cfGraphId, counterfactual_distance: cfDistance, factual_accuracy: cfFactual, counterfactual_fidelity: cfFidelity, num_candidates: cfCandidates })}>{loading ? "Searching..." : "Search Counterfactual"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Counterfactual Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderConstraint = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Causal Constraint NAS">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={conGraphId} onChange={(e) => setConGraphId(e.target.value)} /></div>
        <SelectField label="Constraint" value={conConstraint} onChange={setConConstraint} options={CAUSAL_CONSTRAINTS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Constraint Weight</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={conWeight} onChange={(e) => setConWeight(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Violation Tolerance</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={conTolerance} onChange={(e) => setConTolerance(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Validation Frequency</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={conFrequency} onChange={(e) => setConFrequency(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/nas-causal/constraint", { graph_id: conGraphId, constraint: conConstraint, constraint_weight: conWeight, violation_tolerance: conTolerance, validation_frequency: conFrequency })}>{loading ? "Searching..." : "Apply Constraint"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Constraint Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderSCM = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="SCM Integration">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={scmGraphId} onChange={(e) => setScmGraphId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">SCM Type</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={scmType} onChange={(e) => setScmType(e.target.value)} placeholder="additive, nonlinear, etc." /></div>
        <div className="mb-3"><label className="block text-xs font-medium textgray-600 dark:text-gray-400 mb-1">Integration Depth</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={scmDepth} onChange={(e) => setScmDepth(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Latent Variables</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={scmLatent} onChange={(e) => setScmLatent(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/nas-causal/scm", { graph_id: scmGraphId, scm_type: scmType, scm_parameters: {}, integration_depth: scmDepth, latent_variables: scmLatent })}>{loading ? "Integrating..." : "Integrate SCM"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="SCM Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderEvaluate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Causal NAS Evaluation">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evalGraphId} onChange={(e) => setEvalGraphId(e.target.value)} /></div>
        <SelectField label="Evaluation Type" value={evalType} onChange={setEvalType} options={CAUSAL_EVALUATIONS} />
        <button className="w-full mt-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/nas-causal/evaluate", { graph_id: evalGraphId, architecture: {}, evaluation_type: evalType, intervention_scenarios: evalInterventions, counterfactual_queries: evalCounterfactuals })}>{loading ? "Evaluating..." : "Evaluate Architecture"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Evaluation Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderOverview = () => {
    const allEnums: Record<string, string[]> = {
      CausalSearchSpace: CAUSAL_SEARCH_SPACES,
      CausalConstraint: CAUSAL_CONSTRAINTS,
      CausalCellType: CAUSAL_CELL_TYPES,
      CausalOptimization: CAUSAL_OPTIMIZATIONS,
      NASCausalStrategy: NAS_STRATEGIES,
      CausalEvaluation: CAUSAL_EVALUATIONS,
    };
    return (
      <div className="space-y-4">
        <Card title="Engine Metadata">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center"><div className="text-lg font-bold text-blue-600">v1.240.0</div><div className="text-xs text-gray-500">Version</div></div>
            <div className="text-center"><div className="text-lg font-bold text-emerald-600">8</div><div className="text-xs text-gray-500">Endpoints</div></div>
            <div className="text-center"><div className="text-lg font-bold text-amber-600">7</div><div className="text-xs text-gray-500">Enums</div></div>
            <div className="text-center"><div className="text-lg font-bold text-purple-600">42</div><div className="text-xs text-gray-500">Enum Values</div></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Causality-optimized neural architecture search engine — causal-aware search spaces, intervention-tolerant architectures, counterfactual reasoning, and SCM integration.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge text="Causal Search Spaces" color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
            <Badge text="Cell Search" color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
            <Badge text="Intervention Arch" color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
            <Badge text="Counterfactual NAS" color="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300" />
            <Badge text="SCM Integration" color="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" />
            <Badge text="Causal Evaluation" color="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" />
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
              <div className="text-xs font-medium text-gray-500">Ontology Learning</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.239</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Multi-Scale Causal</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.235</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Temporal Dynamics</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.238</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Counterfactual</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.224</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const tabRenderers: Record<Tab, () => React.ReactNode> = {
    "NAS Search": renderNASSearch,
    "Cell Search": renderCellSearch,
    Intervention: renderIntervention,
    Counterfactual: renderCounterfactual,
    Constraint: renderConstraint,
    SCM: renderSCM,
    Evaluate: renderEvaluate,
    Overview: renderOverview,
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-100">
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Graph Neural Architecture Search for Causality</h1>
        <p className="text-sm text-gray-400 mt-1">v1.240.0 &mdash; Causal-aware NAS search spaces, intervention-tolerant architectures, counterfactual reasoning & SCM integration</p>
        <div className="flex gap-2 mt-2">
          <Badge text="7 Enums" color="bg-blue-900 text-blue-300" />
          <Badge text="8 Endpoints" color="bg-emerald-900 text-emerald-300" />
          <Badge text="42 Values" color="bg-purple-900 text-purple-300" />
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