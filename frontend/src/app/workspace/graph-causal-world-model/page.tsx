"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.247 backend
const WORLD_TYPES = ["markov_decision", "structural_causal", "dynamic_bayesian", "neural_causal_sim", "compositional_factor", "ai_discovered_world"];
const STATE_REPRS = ["tabular", "continuous_vector", "graph_state", "relational", "hybrid_symbolic_neural", "object_oriented"];
const INTERVENTION_TYPES = ["hard_do", "soft_nudge", "policy_intervention", "structural_break", "counterfactual_swap", "compositional_intervention"];
const SIM_MODES = ["deterministic", "stochastic", "ensemble", "worst_case", "best_case", "distributional"];
const CONSISTENCY_CHECKS = ["markov_equivalence", "faithfulness", "causal_sufficiency", "temporal_consistency", "intervention_invariance", "compositionality"];
const TEMPORAL_HORIZONS = ["single_step", "short_term", "medium_term", "long_term", "infinite_horizon", "adaptive_horizon"];

const TABS = ["Build", "Simulate", "Rollout", "Verify", "Compose", "Predict", "Overview"] as const;
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

export default function GraphCausalWorldModelPage() {
  const [tab, setTab] = useState<Tab>("Build");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Build state
  const [graphId, setGraphId] = useState("graph-wm-001");
  const [worldType, setWorldType] = useState("structural_causal");
  const [stateRepr, setStateRepr] = useState("graph_state");
  const [numVars, setNumVars] = useState(10);
  const [includeLatent, setIncludeLatent] = useState(true);

  // Simulate state
  const [modelId, setModelId] = useState("");
  const [intervVar, setIntervVar] = useState("var_0");
  const [intervType, setIntervType] = useState("hard_do");
  const [intervValue, setIntervValue] = useState("1.0");
  const [simMode, setSimMode] = useState("stochastic");
  const [tempHorizon, setTempHorizon] = useState("medium_term");
  const [numSteps, setNumSteps] = useState(10);
  const [numTraj, setNumTraj] = useState(100);

  // Rollout state
  const [rolloutModelId, setRolloutModelId] = useState("");
  const [policyType, setPolicyType] = useState("optimal");
  const [numEpisodes, setNumEpisodes] = useState(50);
  const [maxSteps, setMaxSteps] = useState(100);
  const [discountFactor, setDiscountFactor] = useState(0.95);
  const [exploreRate, setExploreRate] = useState(0.1);

  // Verify state
  const [verifyModelId, setVerifyModelId] = useState("");
  const [verifyChecks, setVerifyChecks] = useState<string[]>(["markov_equivalence", "faithfulness", "temporal_consistency"]);
  const [tolerance, setTolerance] = useState(0.05);
  const [genCounterexamples, setGenCounterexamples] = useState(true);

  // Compose state
  const [subModelIds, setSubModelIds] = useState("wm-abc12345, wm-def67890");
  const [compStrategy, setCompStrategy] = useState("causal_bridge");
  const [sharedVars, setSharedVars] = useState("");
  const [resolveConflicts, setResolveConflicts] = useState(true);

  // Predict state
  const [predModelId, setPredModelId] = useState("");
  const [targetVars, setTargetVars] = useState("var_0, var_1, var_2");
  const [evidence, setEvidence] = useState('{"var_3": 0.5, "var_4": -0.3}');
  const [predType, setPredType] = useState("conditional");
  const [confLevel, setConfLevel] = useState(0.95);

  const call = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setResult(await res.json());
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const handleBuild = () => call("/causal-world/build", { graph_id: graphId, model_type: worldType, state_repr: stateRepr, num_state_variables: numVars, include_latent: includeLatent });
  const handleSimulate = () => call("/causal-world/simulate", { model_id: modelId, intervention_var: intervVar, intervention_type: intervType, intervention_value: parseFloat(intervValue) || null, simulation_mode: simMode, temporal_horizon: tempHorizon, num_steps: numSteps, num_trajectories: numTraj });
  const handleRollout = () => call("/causal-world/rollout", { model_id: rolloutModelId, policy_type: policyType, num_episodes: numEpisodes, max_steps_per_episode: maxSteps, discount_factor: discountFactor, exploration_rate: exploreRate });
  const handleVerify = () => call("/causal-world/verify", { model_id: verifyModelId, checks: verifyChecks, tolerance, generate_counterexamples: genCounterexamples });
  const handleCompose = () => call("/causal-world/compose", { sub_model_ids: subModelIds.split(",").map((s) => s.trim()).filter(Boolean), composition_strategy: compStrategy, shared_variables: sharedVars ? sharedVars.split(",").map((s) => s.trim()) : null, resolve_conflicts: resolveConflicts });
  const handlePredict = () => call("/causal-world/predict", { model_id: predModelId, target_variables: targetVars.split(",").map((s) => s.trim()).filter(Boolean), evidence: (() => { try { return JSON.parse(evidence); } catch { return {}; } })(), prediction_type: predType, confidence_level: confLevel });
  const handleOverview = async () => {
    setLoading(true); setResult(null);
    try { const res = await fetch(`${API}/causal-world/overview`); setResult(await res.json()); } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const toggleCheck = (c: string) => setVerifyChecks((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const renderResult = () => {
    if (!result) return null;
    const d = result as Record<string, unknown>;
    return <Card title="Result"><JsonBlock data={result}</Card>;
  };

  const renderBuildVars = () => {
    if (!result || tab !== "Build") return null;
    const d = result as Record<string, unknown>;
    const vars = d.state_variables as Record<string, unknown>[] | undefined;
    const mechs = d.causal_mechanisms as Record<string, unknown>[] | undefined;
    return (
      <>
        {vars && vars.length > 0 && (
          <Card title={`State Variables (${vars.length})`}>
            <div className="space-y-2 max-h-60 overflow-auto">
              {vars.map((v, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Badge text={v.var_type as string} color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" />
                  <span className="font-mono text-gray-700 dark:text-gray-300">{v.name as string}</span>
                  {(v.causal_parents as string[])?.length > 0 && <span className="text-gray-500 dark:text-gray-400">← [{(v.causal_parents as string[]).join(", ")}]</span>}
                  {v.is_latent as boolean && <Badge text="latent" color="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" />}
                </div>
              ))}
            </div>
          </Card>
        )}
        {mechs && mechs.length > 0 && (
          <Card title={`Causal Mechanisms (${mechs.length})`}>
            <div className="space-y-2 max-h-48 overflow-auto">
              {mechs.slice(0, 10).map((m, i) => (
                <div key={i} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-700 dark:text-gray-300">{m.output_var as string}</span>
                    <span className="text-gray-400">← f({(m.input_vars as string[]).join(", ")})</span>
                    <Badge text={m.mechanism_type as string} color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" />
                  </div>
                  <div className="flex gap-3 mt-1">
                    <StatBar label="R²" value={m.r_squared as number} max={1} color="bg-emerald-500" />
                    <StatBar label="Robust" value={m.intervention_robustness as number} max={1} color="bg-sky-500" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        <Card title="Summary">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="text-lg font-bold text-blue-600 dark:text-blue-400">{d.observed_variable_count as number}</div><div className="text-xs text-gray-500">Observed</div></div>
            <div><div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{d.latent_variable_count as number}</div><div className="text-xs text-gray-500">Latent</div></div>
            <div><div className="text-lg font-bold text-purple-600 dark:text-purple-400">{d.structural_complexity as number}</div><div className="text-xs text-gray-500">Complexity</div></div>
          </div>
        </Card>
      </>
    );
  };

  const renderSimulation = () => {
    if (!result || tab !== "Simulate") return null;
    const d = result as Record<string, unknown>;
    const traj = d.sample_trajectory as Record<string, unknown>[] | undefined;
    const effects = d.aggregated_effects as Record<string, Record<string, number>> | undefined;
    return (
      <>
        {traj && traj.length > 0 && (
          <Card title={`Sample Trajectory (${traj.length} steps)`}>
            <div className="space-y-1 max-h-48 overflow-auto">
              {traj.map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-xs border-b border-gray-100 dark:border-gray-700 pb-1">
                  <span className="font-mono text-gray-500 w-8">t={s.step as number}</span>
                  <span className="text-gray-600 dark:text-gray-400">div={s.divergence as number}</span>
                  {(s.intervened_vars as string[])?.length > 0 && <Badge text="intervened" color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" />}
                  {s.reward != null && <span className="text-gray-500">r={s.reward as number}</span>}
                </div>
              ))}
            </div>
          </Card>
        )}
        {effects && (
          <Card title="Causal Effect Estimates">
            {Object.entries(effects).slice(0, 8).map(([v, e]) => (
              <StatBar key={v} label={v} value={e.mean_effect} max={2} color={e.effect_direction > 0 ? "bg-green-500" : "bg-red-500"} />
            ))}
          </Card>
        )}
      </>
    );
  };

  const renderVerify = () => {
    if (!result || tab !== "Verify") return null;
    const d = result as Record<string, unknown>;
    const checks = d.results as Record<string, unknown>[] | undefined;
    return (
      <>
        <Card title={`Consistency: ${d.is_consistent ? "PASS" : "FAIL"}`}>
          <div className={`text-center text-2xl font-bold mb-2 ${d.is_consistent ? "text-green-600" : "text-red-600"}`}>
            {((d.overall_consistency as number) * 100).toFixed(1)}%
          </div>
          {checks?.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs mb-1">
              <Badge text={c.passed ? "PASS" : "FAIL"} color={c.passed ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"} />
              <span className="text-gray-700 dark:text-gray-300">{c.check_type as string}</span>
              <span className="text-gray-500 ml-auto">{((c.score as number) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </Card>
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Graph Causal World Model</h2>
        <Badge text="v1.247" color="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setResult(null); }}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${tab === t ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>{t}</button>
        ))}
      </div>

      {/* Build */}
      {tab === "Build" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Build World Model">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
            <SelectField label="World Model Type" value={worldType} onChange={setWorldType} options={WORLD_TYPES} />
            <SelectField label="State Representation" value={stateRepr} onChange={setStateRepr} options={STATE_REPRS} />
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">State Variables</label><input type="number" min={2} max={200} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={numVars} onChange={(e) => setNumVars(parseInt(e.target.value) || 10)} /></div>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3"><input type="checkbox" checked={includeLatent} onChange={(e) => setIncludeLatent(e.target.checked)} /> Include Latent Variables</label>
            <button onClick={handleBuild} disabled={loading} className="w-full bg-indigo-600 text-white text-sm py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">{loading ? "Building..." : "Build Model"}</button>
          </Card>
          {renderBuildVars()}
        </div>
      )}

      {/* Simulate */}
      {tab === "Simulate" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Simulate Intervention">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Model ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={modelId} onChange={(e) => setModelId(e.target.value)} /></div>
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Intervention Variable</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={intervVar} onChange={(e) => setIntervVar(e.target.value)} /></div>
            <SelectField label="Intervention Type" value={intervType} onChange={setIntervType} options={INTERVENTION_TYPES} />
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Intervention Value</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={intervValue} onChange={(e) => setIntervValue(e.target.value)} /></div>
            <SelectField label="Simulation Mode" value={simMode} onChange={setSimMode} options={SIM_MODES} />
            <SelectField label="Temporal Horizon" value={tempHorizon} onChange={setTempHorizon} options={TEMPORAL_HORIZONS} />
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Steps</label><input type="number" min={1} max={500} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={numSteps} onChange={(e) => setNumSteps(parseInt(e.target.value) || 10)} /></div>
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Trajectories</label><input type="number" min={1} max={10000} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={numTraj} onChange={(e) => setNumTraj(parseInt(e.target.value) || 100)} /></div>
            </div>
            <button onClick={handleSimulate} disabled={loading} className="w-full bg-indigo-600 text-white text-sm py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">{loading ? "Simulating..." : "Run Simulation"}</button>
          </Card>
          {renderSimulation()}
        </div>
      )}

      {/* Rollout */}
      {tab === "Rollout" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Policy Rollout">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Model ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={rolloutModelId} onChange={(e) => setRolloutModelId(e.target.value)} /></div>
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Policy Type</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={policyType} onChange={(e) => setPolicyType(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Episodes</label><input type="number" min={1} max={1000} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={numEpisodes} onChange={(e) => setNumEpisodes(parseInt(e.target.value) || 50)} /></div>
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Steps</label><input type="number" min={1} max={2000} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={maxSteps} onChange={(e) => setMaxSteps(parseInt(e.target.value) || 100)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Discount γ</label><input type="number" step={0.01} min={0} max={1} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={discountFactor} onChange={(e) => setDiscountFactor(parseFloat(e.target.value) || 0.95)} /></div>
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Explore ε</label><input type="number" step={0.01} min={0} max={1} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={exploreRate} onChange={(e) => setExploreRate(parseFloat(e.target.value) || 0.1)} /></div>
            </div>
            <button onClick={handleRollout} disabled={loading} className="w-full bg-indigo-600 text-white text-sm py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">{loading ? "Rolling out..." : "Start Rollout"}</button>
          </Card>
          {result && (
            <Card title="Rollout Results">
              <div className="grid grid-cols-2 gap-3 text-center mb-3">
                <div><div className="text-lg font-bold text-green-600">{((result as Record<string, unknown>).mean_reward as number)?.toFixed(4)}</div><div className="text-xs text-gray-500">Mean Reward</div></div>
                <div><div className="text-lg font-bold text-amber-600">{((result as Record<string, unknown>).std_reward as number)?.toFixed(4)}</div><div className="text-xs text-gray-500">Std Reward</div></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Causal Leverage Points:</div>
              <div className="flex flex-wrap gap-1">
                {((result as Record<string, unknown>).causal_leverage_points as string[])?.map((p) => <Badge key={p} text={p} color="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" />)}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Verify */}
      {tab === "Verify" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Verify Consistency">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Model ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={verifyModelId} onChange={(e) => setVerifyModelId(e.target.value)} /></div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Consistency Checks</label>
              <div className="grid grid-cols-2 gap-1">
                {CONSISTENCY_CHECKS.map((c) => (
                  <label key={c} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <input type="checkbox" checked={verifyChecks.includes(c)} onChange={() => toggleCheck(c)} /> {c.replace(/_/g, " ")}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tolerance</label><input type="number" step={0.01} min={0} max={1} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={tolerance} onChange={(e) => setTolerance(parseFloat(e.target.value) || 0.05)} /></div>
              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-5"><input type="checkbox" checked={genCounterexamples} onChange={(e) => setGenCounterexamples(e.target.checked)} /> Counterexamples</label>
            </div>
            <button onClick={handleVerify} disabled={loading} className="w-full bg-indigo-600 text-white text-sm py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">{loading ? "Verifying..." : "Verify"}</button>
          </Card>
          {renderVerify()}
        </div>
      )}

      {/* Compose */}
      {tab === "Compose" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Compose World Models">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sub-Model IDs (comma-separated)</label><textarea className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5 h-16" value={subModelIds} onChange={(e) => setSubModelIds(e.target.value)} /></div>
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Composition Strategy</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={compStrategy} onChange={(e) => setCompStrategy(e.target.value)} /></div>
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Shared Variables (comma-separated, optional)</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={sharedVars} onChange={(e) => setSharedVars(e.target.value)} /></div>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3"><input type="checkbox" checked={resolveConflicts} onChange={(e) => setResolveConflicts(e.target.checked)} /> Resolve Conflicts</label>
            <button onClick={handleCompose} disabled={loading} className="w-full bg-indigo-600 text-white text-sm py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">{loading ? "Composing..." : "Compose"}</button>
          </Card>
          {result && (
            <Card title="Composition Result">
              <div className="space-y-3">
                <div className="text-xs"><span className="text-gray-500">Composed ID:</span> <span className="font-mono text-gray-800 dark:text-gray-200">{(result as Record<string, unknown>).composed_id as string}</span></div>
                <div className="text-xs"><span className="text-gray-500">Fidelity:</span> <span className="font-mono text-green-600">{((result as Record<string, unknown>).composition_fidelity as number)?.toFixed(4)}</span></div>
                <div className="text-xs"><span className="text-gray-500">Total Variables:</span> <span className="font-mono">{(result as Record<string, unknown>).total_state_variables as number}</span></div>
                <div className="flex flex-wrap gap-1">
                  {((result as Record<string, unknown>).shared_variables as string[])?.map((v) => <Badge key={v} text={v} color="bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" />)}
                </div>
                {((result as Record<string, unknown>).conflict_resolutions as Record<string, unknown>[])?.length > 0 && (
                  <div className="text-xs text-gray-500">{((result as Record<string, unknown>).conflict_resolutions as Record<string, unknown>[]).length} conflicts resolved</div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Predict */}
      {tab === "Predict" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Predict with Model">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Model ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={predModelId} onChange={(e) => setPredModelId(e.target.value)} /></div>
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Variables (comma-separated)</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={targetVars} onChange={(e) => setTargetVars(e.target.value)} /></div>
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Evidence (JSON)</label><textarea className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5 h-16 font-mono" value={evidence} onChange={(e) => setEvidence(e.target.value)} /></div>
            <SelectField label="Prediction Type" value={predType} onChange={setPredType} options={["marginal", "conditional", "interventional", "counterfactual"]} />
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confidence Level</label><input type="number" step={0.01} min={0.5} max={0.999} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={confLevel} onChange={(e) => setConfLevel(parseFloat(e.target.value) || 0.95)} /></div>
            <button onClick={handlePredict} disabled={loading} className="w-full bg-indigo-600 text-white text-sm py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">{loading ? "Predicting..." : "Predict"}</button>
          </Card>
          {result && (
            <Card title="Predictions">
              {((result as Record<string, unknown>).predictions as Record<string, unknown>[])?.map((p, i) => (
                <div key={i} className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{p.variable as string}</span>
                    <Badge text={predType} color="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Predicted: <span className="font-mono">{JSON.stringify(p.predicted_value)}</span></div>
                  <StatBar label="Confidence" value={p.confidence as number} max={1} color="bg-emerald-500" />
                  <div className="text-xs text-gray-500 mt-1">{p.causal_explanation as string}</div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* Overview */}
      {tab === "Overview" && (
        <div>
          <button onClick={handleOverview} disabled={loading} className="mb-4 bg-indigo-600 text-white text-sm py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50">{loading ? "Loading..." : "Load Overview"}</button>
          {renderResult()}
        </div>
      )}
    </div>
  );
}
