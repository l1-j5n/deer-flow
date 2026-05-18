"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.246 backend
const INTEGRATIONS = ["neural_to_symbolic", "symbolic_to_neural", "interleaved", "parallel", "constraint_guided", "ai_discovered_integration"];
const SYMBOLIC_LOGICS = ["first_order_logic", "propositional_logic", "temporal_logic", "description_logic", "modal_logic", "fuzzy_logic"];
const NEURAL_ARCHES = ["gnn_causal", "transformer_causal", "mlp_causal", "attention_causal", "graph_sage_causal", "hybrid_neural"];
const REASONING_MODES = ["abduction", "deduction", "induction", "analogy", "counterfactual", "causal_chain"];
const VALIDATION_METHODS = ["formal_verification", "consistency_check", "empirical_validation", "model_checking", "theorem_proving", "counterexample_search"];
const EXPLANATION_FORMATS = ["natural_language", "formal_proof", "visual_graph", "structured_logic", "interactive", "comparative"];

const TABS = ["Reason", "Validate", "Ground", "Explain", "Synthesize", "Benchmark", "Overview"] as const;
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

export default function GraphNeuroSymbolicCausalPage() {
  const [tab, setTab] = useState<Tab>("Reason");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Reason state
  const [graphId, setGraphId] = useState("graph-ns-001");
  const [integration, setIntegration] = useState("interleaved");
  const [symLogic, setSymLogic] = useState("first_order_logic");
  const [neuralArch, setNeuralArch] = useState("gnn_causal");
  const [reasonMode, setReasonMode] = useState("abduction");
  const [queryVars, setQueryVars] = useState("X, Y, Z");
  const [maxDepth, setMaxDepth] = useState(5);
  const [confThreshold, setConfThreshold] = useState(0.7);

  // Validate state
  const [valMethod, setValMethod] = useState("formal_verification");
  const [valStrictness, setValStrictness] = useState(0.8);

  // Ground state
  const [groundSamples, setGroundSamples] = useState(100);
  const [fitThreshold, setFitThreshold] = useState(0.75);

  // Explain state
  const [explainFormat, setExplainFormat] = useState("natural_language");
  const [reasoningId, setReasoningId] = useState("nsr-demo");
  const [detailLevel, setDetailLevel] = useState(3);

  // Synthesize state
  const [targetOutcome, setTargetOutcome] = useState("Y");
  const [synthIntegration, setSynthIntegration] = useState("constraint_guided");
  const [maxProgramLen, setMaxProgramLen] = useState(20);

  // Benchmark state
  const [testDomains, setTestDomains] = useState("healthcare, economics, climate, social");

  const post = async (endpoint: string, body: Record<string, unknown>) => {
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

  const getOverview = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/neuro-symbolic-causal/overview`);
      setResult(await res.json());
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const fmt = (v: string) => v.replace(/_/g, " ");

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Neuro-Symbolic Causal Reasoning</h1>
        <Badge text="v1.246" color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        Combine neural pattern recognition with symbolic logic for rigorous, interpretable causal inference on graph structures.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setResult(null); }}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${tab === t ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Reason Tab */}
      {tab === "Reason" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Configuration">
            <input className="w-full mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" placeholder="Graph ID" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            <SelectField label="Integration" value={integration} onChange={setIntegration} options={INTEGRATIONS} />
            <SelectField label="Symbolic Logic" value={symLogic} onChange={setSymLogic} options={SYMBOLIC_LOGICS} />
            <SelectField label="Neural Architecture" value={neuralArch} onChange={setNeuralArch} options={NEURAL_ARCHES} />
            <SelectField label="Reasoning Mode" value={reasonMode} onChange={setReasonMode} options={REASONING_MODES} />
            <input className="w-full mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" placeholder="Query variables (comma-separated)" value={queryVars} onChange={(e) => setQueryVars(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block text-xs text-gray-500 mb-1">Max Depth</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={maxDepth} onChange={(e) => setMaxDepth(+e.target.value)} /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Confidence ≥</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={confThreshold} onChange={(e) => setConfThreshold(+e.target.value)} /></div>
            </div>
            <button disabled={loading} onClick={() => post("/neuro-symbolic-causal/reason", { graph_id: graphId, integration, symbolic_logic: symLogic, neural_arch: neuralArch, reasoning_mode: reasonMode, query_variables: queryVars.split(",").map((s) => s.trim()), max_depth: maxDepth, confidence_threshold: confThreshold })}
              className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-md disabled:opacity-50">
              {loading ? "Reasoning..." : "Run Neuro-Symbolic Reasoning"}
            </button>
          </Card>
          <div className="md:col-span-2 space-y-4">
            {result && !("error" in (result as Record<string, unknown>)) && (() => {
              const r = result as Record<string, unknown>;
              return (
                <>
                  <Card title="Causal Conclusions">
                    {((r.causal_conclusions || []) as Record<string, unknown>[]).map((c: Record<string, unknown>, i: number) => (
                      <div key={i} className="mb-2 p-2 rounded bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-center gap-2 mb-1"><Badge text={String(c.integration_method || "")} /><Badge text={String(c.reasoning_depth || "") + " steps"} color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" /></div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{String(c.statement || "")}</p>
                        <StatBar label="Confidence" value={Number(c.confidence || 0)} color="bg-purple-500" />
                      </div>
                    ))}
                  </Card>
                  <Card title="Neural-Symbolic Integration">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><span className="text-gray-500">Integration:</span> <span className="font-medium">{fmt(String(r.integration_used || ""))}</span></div>
                      <div><span className="text-gray-500">Logic:</span> <span className="font-medium">{fmt(String(r.symbolic_logic_used || ""))}</span></div>
                      <div><span className="text-gray-500">Neural Arch:</span> <span className="font-medium">{fmt(String(r.neural_arch_used || ""))}</span></div>
                      <div><span className="text-gray-500">Mode:</span> <span className="font-medium">{fmt(String(r.reasoning_mode_used || ""))}</span></div>
                    </div>
                    {((r.consistency_report || {}) as Record<string, unknown>).neural_symbolic_consistency !== undefined && (
                      <StatBar label="Neural-Symbolic Consistency" value={Number((r.consistency_report as Record<string, unknown>).neural_symbolic_consistency)} color="bg-green-500" />
                    )}
                  </Card>
                  <Card title="Symbolic Rules Applied">
                    {((r.symbolic_rules_applied || []) as Record<string, unknown>[]).map((rule: Record<string, unknown>, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs mb-1 py-1 border-b border-gray-100 dark:border-gray-700">
                        <span className="font-medium">{String(rule.rule_name || "")}</span>
                        <div className="flex gap-2">
                          <Badge text={rule.validated ? "✓ Valid" : "✗ Invalid"} color={rule.validated ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"} />
                          <span className="text-gray-500">{Number(rule.strength || 0).toFixed(3)}</span>
                        </div>
                      </div>
                    ))}
                  </Card>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Validate Tab */}
      {tab === "Validate" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Validation Config">
            <input className="w-full mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" placeholder="Graph ID" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            <SelectField label="Validation Method" value={valMethod} onChange={setValMethod} options={VALIDATION_METHODS} />
            <SelectField label="Symbolic Logic" value={symLogic} onChange={setSymLogic} options={SYMBOLIC_LOGICS} />
            <div className="mb-3"><label className="block text-xs text-gray-500 mb-1">Strictness ({valStrictness})</label><input type="range" min="0.1" max="1" step="0.05" className="w-full" value={valStrictness} onChange={(e) => setValStrictness(+e.target.value)} /></div>
            <button disabled={loading} onClick={() => post("/neuro-symbolic-causal/validate", { graph_id: graphId, hypotheses: [{ id: "h1", cause: "X", effect: "Y" }, { id: "h2", cause: "Z", effect: "Y" }], validation_method: valMethod, symbolic_logic: symLogic, strictness: valStrictness })}
              className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-md disabled:opacity-50">
              {loading ? "Validating..." : "Validate Hypotheses"}
            </button>
          </Card>
          <div className="md:col-span-2">
            {result && !("error" in (result as Record<string, unknown>)) && (() => {
              const r = result as Record<string, unknown>;
              return (
                <>
                  <Card title="Validation Results">
                    <StatBar label="Overall Validity" value={Number(r.overall_validity || 0)} color="bg-green-500" />
                    {((r.results || []) as Record<string, unknown>[]).map((v: Record<string, unknown>, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-700">
                        <span>Hypothesis {String(v.hypothesis_index || i)}</span>
                        <div className="flex gap-2 items-center">
                          <Badge text={v.valid ? "Valid" : "Invalid"} color={v.valid ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"} />
                          <span className="font-mono">{Number(v.validity_score || 0).toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </Card>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Card title="Proven Properties">
                      {((r.proven_properties || []) as Record<string, unknown>[]).map((p: Record<string, unknown>, i: number) => (
                        <div key={i} className="text-xs mb-2 p-2 bg-green-50 dark:bg-green-900/30 rounded">
                          <div className="font-medium text-green-800 dark:text-green-200">{String(p.statement || "")}</div>
                          <div className="text-gray-500 mt-1">Proof: {String(p.proof_technique || "")} ({String(p.steps_count || "")} steps)</div>
                        </div>
                      ))}
                    </Card>
                    <Card title="Counterexamples">
                      {((r.counterexamples || []) as Record<string, unknown>[]).map((ce: Record<string, unknown>, i: number) => (
                        <div key={i} className="text-xs mb-2 p-2 bg-red-50 dark:bg-red-900/30 rounded">
                          <div className="font-medium text-red-800 dark:text-red-200">{String(ce.description || "")}</div>
                          <div className="text-gray-500 mt-1">Violated: {String(ce.violated_clause || "")}</div>
                        </div>
                      ))}
                    </Card>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Ground Tab */}
      {tab === "Ground" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Grounding Config">
            <input className="w-full mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" placeholder="Graph ID" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            <SelectField label="Neural Architecture" value={neuralArch} onChange={setNeuralArch} options={NEURAL_ARCHES} />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="block text-xs text-gray-500 mb-1">Samples</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={groundSamples} onChange={(e) => setGroundSamples(+e.target.value)} /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Fit ≥</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fitThreshold} onChange={(e) => setFitThreshold(+e.target.value)} /></div>
            </div>
            <button disabled={loading} onClick={() => post("/neuro-symbolic-causal/ground", { graph_id: graphId, symbolic_rules: [{ name: "transitivity", body: "A→B ∧ B→C ⇒ A→C" }, { name: "exclusion", body: "indep(X,Y|D) ⇒ confound(D)" }], neural_arch: neuralArch, grounding_samples: groundSamples, fit_threshold: fitThreshold })}
              className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-md disabled:opacity-50">
              {loading ? "Grounding..." : "Ground Symbolic Rules"}
            </button>
          </Card>
          <div className="md:col-span-2">
            {result && !("error" in (result as Record<string, unknown>)) && (() => {
              const r = result as Record<string, unknown>;
              const cov = (r.coverage_report || {}) as Record<string, unknown>;
              return (
                <>
                  <Card title="Grounding Results">
                    <StatBar label="Grounding Accuracy" value={Number(r.grounding_accuracy || 0)} color="bg-purple-500" />
                    <div className="grid grid-cols-4 gap-2 text-xs text-center mt-2">
                      <div className="p-2 rounded bg-gray-50 dark:bg-gray-900"><div className="text-gray-500">Total Rules</div><div className="font-bold text-lg">{String(cov.total_rules || 0)}</div></div>
                      <div className="p-2 rounded bg-green-50 dark:bg-green-900/30"><div className="text-gray-500">Grounded</div><div className="font-bold text-lg text-green-600">{String(cov.grounded || 0)}</div></div>
                      <div className="p-2 rounded bg-red-50 dark:bg-red-900/30"><div className="text-gray-500">Ungroundable</div><div className="font-bold text-lg text-red-600">{String(cov.ungroundable || 0)}</div></div>
                      <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/30"><div className="text-gray-500">Coverage</div><div className="font-bold text-lg text-blue-600">{(Number(cov.coverage_rate || 0) * 100).toFixed(1)}%</div></div>
                    </div>
                  </Card>
                  <Card title="Grounded Rules">
                    {((r.grounded_rules || []) as Record<string, unknown>[]).map((gr: Record<string, unknown>, i: number) => (
                      <div key={i} className="text-xs mb-2 p-2 rounded bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                        <span className="font-medium">{String(gr.rule_id || "")}: {fmt(String(gr.neural_arch || ""))}</span>
                        <div className="flex gap-2 items-center"><span className="text-gray-500">{String(gr.samples_matched || "")} samples</span><Badge text={`fit: ${Number(gr.grounding_fit || 0).toFixed(3)}`} /></div>
                      </div>
                    ))}
                  </Card>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Explain Tab */}
      {tab === "Explain" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Explanation Config">
            <input className="w-full mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" placeholder="Graph ID" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            <input className="w-full mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" placeholder="Reasoning ID" value={reasoningId} onChange={(e) => setReasoningId(e.target.value)} />
            <SelectField label="Format" value={explainFormat} onChange={setExplainFormat} options={EXPLANATION_FORMATS} />
            <div className="mb-3"><label className="block text-xs text-gray-500 mb-1">Detail Level (1-5)</label><input type="range" min="1" max="5" step="1" className="w-full" value={detailLevel} onChange={(e) => setDetailLevel(+e.target.value)} /></div>
            <button disabled={loading} onClick={() => post("/neuro-symbolic-causal/explain", { graph_id: graphId, reasoning_id: reasoningId, explanation_format: explainFormat, detail_level: detailLevel, audience: "expert" })}
              className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-md disabled:opacity-50">
              {loading ? "Generating..." : "Generate Explanation"}
            </button>
          </Card>
          <div className="md:col-span-2">
            {result && !("error" in (result as Record<string, unknown>)) && (() => {
              const r = result as Record<string, unknown>;
              return (
                <>
                  <Card title={`Explanation (${fmt(String(r.format_used || ""))})`}>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3">
                      {String(r.explanation || "")}
                    </div>
                    <StatBar label="Confidence" value={Number(r.confidence || 0)} color="bg-purple-500" />
                  </Card>
                  <Card title="Key Insights">
                    {((r.key_insights || []) as string[]).map((ins: string, i: number) => (
                      <div key={i} className="text-xs mb-1 flex gap-2"><span className="text-purple-500">→</span><span>{ins}</span></div>
                    ))}
                  </Card>
                  <Card title="Structured Steps">
                    {((r.structured_steps || []) as Record<string, unknown>[]).map((s: Record<string, unknown>, i: number) => (
                      <div key={i} className="text-xs mb-1 flex gap-3 items-center">
                        <Badge text={String(s.phase || "")} color={String(s.phase) === "neural_analysis" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : String(s.phase) === "symbolic_check" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"} />
                        <span>{String(s.description || "")}</span>
                        <span className="text-gray-400 ml-auto">{Number(s.evidence_strength || 0).toFixed(3)}</span>
                      </div>
                    ))}
                  </Card>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Synthesize Tab */}
      {tab === "Synthesize" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Synthesis Config">
            <input className="w-full mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" placeholder="Graph ID" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            <input className="w-full mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" placeholder="Target Outcome" value={targetOutcome} onChange={(e) => setTargetOutcome(e.target.value)} />
            <SelectField label="Integration" value={synthIntegration} onChange={setSynthIntegration} options={INTEGRATIONS} />
            <SelectField label="Neural Arch" value={neuralArch} onChange={setNeuralArch} options={NEURAL_ARCHES} />
            <SelectField label="Symbolic Logic" value={symLogic} onChange={setSymLogic} options={SYMBOLIC_LOGICS} />
            <div className="mb-3"><label className="block text-xs text-gray-500 mb-1">Max Program Length</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={maxProgramLen} onChange={(e) => setMaxProgramLen(+e.target.value)} /></div>
            <button disabled={loading} onClick={() => post("/neuro-symbolic-causal/synthesize", { graph_id: graphId, target_outcome: targetOutcome, integration: synthIntegration, neural_arch: neuralArch, symbolic_logic: symLogic, max_program_length: maxProgramLen, safety_constraints: ["no_harm"] })}
              className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-md disabled:opacity-50">
              {loading ? "Synthesizing..." : "Synthesize Causal Program"}
            </button>
          </Card>
          <div className="md:col-span-2">
            {result && !("error" in (result as Record<string, unknown>)) && (() => {
              const r = result as Record<string, unknown>;
              const prog = (r.causal_program || {}) as Record<string, unknown>;
              return (
                <>
                  <Card title="Synthesized Causal Program">
                    <div className="grid grid-cols-3 gap-3 text-center text-xs mb-3">
                      <div className="p-2 rounded bg-purple-50 dark:bg-purple-900/30"><div className="text-gray-500">Expected Effect</div><div className="font-bold text-lg text-purple-600">{Number(r.expected_effect || 0).toFixed(4)}</div></div>
                      <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/30"><div className="text-gray-500">Complexity</div><div className="font-bold text-lg">{String(r.program_complexity || 0)} steps</div></div>
                      <div className="p-2 rounded bg-green-50 dark:bg-green-900/30"><div className="text-gray-500">Safety</div><div className="font-bold text-lg">{r.safety_verified ? "✓ Verified" : "✗ Failed"}</div></div>
                    </div>
                    {((prog.steps || []) as Record<string, unknown>[]).map((step: Record<string, unknown>, i: number) => (
                      <div key={i} className="text-xs mb-1 flex gap-2 items-center py-1 border-b border-gray-100 dark:border-gray-700">
                        <span className="font-mono text-gray-400 w-6">{String(step.step || "")}.</span>
                        <Badge text={String(step.operation || "")} />
                        <span className="text-gray-500">neural: {String(step.neural_component || "")}</span>
                        <span className="text-gray-400 ml-auto">eff: {Number(step.estimated_effect || 0).toFixed(3)}</span>
                      </div>
                    ))}
                  </Card>
                  <Card title="Symbolic Guards">
                    {((r.symbolic_guards || []) as Record<string, unknown>[]).map((sg: Record<string, unknown>, i: number) => (
                      <div key={i} className="text-xs mb-1 flex gap-2 items-center">
                        <Badge text="✓" color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" />
                        <span>{String(sg.constraint || "")}</span>
                        <span className="text-gray-400 ml-auto">{String(sg.logic || "")}</span>
                      </div>
                    ))}
                  </Card>
                  {((r.alternative_programs || []) as Record<string, unknown>[]).length > 0 && (
                    <Card title="Alternative Programs">
                      {((r.alternative_programs || []) as Record<string, unknown>[]).map((alt: Record<string, unknown>, i: number) => (
                        <div key={i} className="text-xs mb-1 flex gap-3 items-center py-1 border-b border-gray-100 dark:border-gray-700">
                          <span className="font-mono">{String(alt.program_id || "")}</span>
                          <span>effect: {Number(alt.estimated_effect || 0).toFixed(3)}</span>
                          <span>complexity: {String(alt.complexity || "")}</span>
                          <Badge text={String(alt.trade_off || "")} color="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" />
                        </div>
                      ))}
                    </Card>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Benchmark Tab */}
      {tab === "Benchmark" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Benchmark Config">
            <input className="w-full mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" placeholder="Graph ID" value={graphId} onChange={(e) => setGraphId(e.target.value)} />
            <SelectField label="Neural Arch" value={neuralArch} onChange={setNeuralArch} options={NEURAL_ARCHES} />
            <SelectField label="Symbolic Logic" value={symLogic} onChange={setSymLogic} options={SYMBOLIC_LOGICS} />
            <input className="w-full mb-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" placeholder="Domains (comma-separated)" value={testDomains} onChange={(e) => setTestDomains(e.target.value)} />
            <button disabled={loading} onClick={() => post("/neuro-symbolic-causal/benchmark", { graph_id: graphId, test_domains: testDomains.split(",").map((s) => s.trim()), neural_arch: neuralArch, symbolic_logic: symLogic })}
              className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded-md disabled:opacity-50">
              {loading ? "Benchmarking..." : "Run Benchmark"}
            </button>
          </Card>
          <div className="md:col-span-2">
            {result && !("error" in (result as Record<string, unknown>)) && (() => {
              const r = result as Record<string, unknown>;
              const tradeoff = (r.accuracy_speed_tradeoff || {}) as Record<string, unknown>;
              return (
                <>
                  <Card title="Score Comparison">
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="p-3 rounded bg-purple-50 dark:bg-purple-900/30"><div className="text-gray-500 mb-1">Neuro-Symbolic</div><div className="font-bold text-2xl text-purple-600">{Number(r.neuro_symbolic_score || 0).toFixed(4)}</div></div>
                      <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/30"><div className="text-gray-500 mb-1">Pure Neural</div><div className="font-bold text-2xl text-blue-600">{Number(r.pure_neural_score || 0).toFixed(4)}</div></div>
                      <div className="p-3 rounded bg-green-50 dark:bg-green-900/30"><div className="text-gray-500 mb-1">Pure Symbolic</div><div className="font-bold text-2xl text-green-600">{Number(r.pure_symbolic_score || 0).toFixed(4)}</div></div>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-gray-500">
                      <span>vs Neural: <span className="text-green-600 font-bold">+{Number(r.improvement_over_neural || 0).toFixed(1)}%</span></span>
                      <span>vs Symbolic: <span className="text-green-600 font-bold">+{Number(r.improvement_over_symbolic || 0).toFixed(1)}%</span></span>
                    </div>
                  </Card>
                  <Card title="Per-Domain Results">
                    {((r.per_domain_results || []) as Record<string, unknown>[]).map((d: Record<string, unknown>, i: number) => (
                      <div key={i} className="mb-2">
                        <div className="flex justify-between text-xs mb-1"><span className="font-medium">{String(d.domain || "")}</span><span className="text-green-600">+{String(d.improvement || 0)}%</span></div>
                        <div className="flex gap-1 h-2">
                          <div className="bg-purple-500 rounded-l" style={{ width: `${Number(d.neuro_symbolic || 0) * 100}px` }} />
                          <div className="bg-blue-400" style={{ width: `${Number(d.pure_neural || 0) * 100}px` }} />
                          <div className="bg-green-400 rounded-r" style={{ width: `${Number(d.pure_symbolic || 0) * 100}px` }} />
                        </div>
                      </div>
                    ))}
                  </Card>
                  <Card title="Accuracy-Speed Tradeoff">
                    <div className="text-xs">
                      {Object.entries(tradeoff).map(([method, vals]) => {
                        const v = vals as Record<string, unknown>;
                        return (
                          <div key={method} className="flex gap-4 py-1 border-b border-gray-100 dark:border-gray-700">
                            <span className="w-32 font-medium">{fmt(method)}</span>
                            <span>accuracy: {Number(v.accuracy || 0).toFixed(3)}</span>
                            <span>speed: {String(v.speed_ms || "")}ms</span>
                            <span>interpretability: {Number(v.interpretability || 0).toFixed(3)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {tab === "Overview" && (
        <div>
          <button disabled={loading} onClick={getOverview}
            className="mb-4 bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 px-4 rounded-md disabled:opacity-50">
            {loading ? "Loading..." : "Load Engine Overview"}
          </button>
          {result && <JsonBlock data={result} />}
        </div>
      )}

      {/* Raw JSON toggle */}
      {result && tab !== "Overview" && (
        <details className="mt-4">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">Raw JSON Response</summary>
          <JsonBlock data={result} />
        </details>
      )}
    </div>
  );
}
