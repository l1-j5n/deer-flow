"use client";

import { useState } from "react";

const API = "/api/graph";

const STRATEGIES = ["template_based", "constraint_driven", "example_guided", "neuro_symbolic", "llm_assisted", "evolutionary"];
const LANGUAGES = ["python", "r", "julia", "matlab", "sql", "dsl"];
const VERIFY_METHODS = ["type_check", "runtime_test", "formal_proof", "counterexample", "property_check", "equivalence"];
const OPT_TARGETS = ["correctness", "efficiency", "readability", "composability", "robustness", "interpretability"];
const COMPOSITION_MODES = ["sequential", "parallel", "conditional", "iterative", "recursive", "modular"];
const EXEC_ENVIRONMENTS = ["local", "sandbox", "distributed", "gpu_enabled", "streaming", "interactive"];

const TABS = ["Synthesize", "Verify", "Optimize", "Compose", "Execute", "Debug", "Overview"] as const;
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

function TextField({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <textarea
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5 min-h-[60px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function InputField({ label, value, onChange, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <input
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    passed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    conditional: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"}`}>
      {status}
    </span>
  );
}

export default function CausalProgramPage() {
  const [tab, setTab] = useState<Tab>("Synthesize");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  // Synthesize state
  const [graphId, setGraphId] = useState("graph_001");
  const [strategy, setStrategy] = useState(STRATEGIES[0]);
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [specification, setSpecification] = useState("Discover causal relationships between variables using PC algorithm and estimate average treatment effects with do-calculus");

  // Verify state
  const [verifyMethod, setVerifyMethod] = useState(VERIFY_METHODS[0]);
  const [programId, setProgramId] = useState("prog_001");

  // Optimize state
  const [optTarget, setOptTarget] = useState(OPT_TARGETS[0]);
  const [optIterations, setOptIterations] = useState("20");

  // Compose state
  const [compMode, setCompMode] = useState(COMPOSITION_MODES[0]);
  const [compIds, setCompIds] = useState("prog_001,prog_002,prog_003");

  // Execute state
  const [execEnv, setExecEnv] = useState(EXEC_ENVIRONMENTS[1]);

  // Debug state
  const [debugErrorCtx, setDebugErrorCtx] = useState("RuntimeError: Causal cycle detected in graph traversal at line 42");

  async function callApi(endpoint: string, body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function renderSynthesize() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Synthesis Configuration">
          <InputField label="Graph ID" value={graphId} onChange={setGraphId} placeholder="graph_001" />
          <SelectField label="Strategy" value={strategy} onChange={setStrategy} options={STRATEGIES} />
          <SelectField label="Language" value={language} onChange={setLanguage} options={LANGUAGES} />
          <TextField label="Specification" value={specification} onChange={setSpecification} placeholder="Describe the causal analysis program..." />
          <button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded transition-colors disabled:opacity-50"
            disabled={loading}
            onClick={() => callApi("/causal-program/synthesize", { graph_id: graphId, strategy, language, specification })}
          >
            {loading ? "Synthesizing..." : "Synthesize Program"}
          </button>
        </Card>
        <Card title="Synthesis Results">
          {result && (
            <div>
              {(result as { synthesis?: { best_candidate?: { quality_score: number; spec_coverage: number; strategy_match: number; execution_time_estimate_ms: number }; synthesis_confidence?: number; spec_satisfaction?: number; n_candidates?: number; candidates?: Array<{ candidate_id: number; quality_score: number; complexity: number }> } }).synthesis && (
                <div className="space-y-3">
                  <StatBar label="Synthesis Confidence" value={(result as { synthesis: { synthesis_confidence: number } }).synthesis.synthesis_confidence} color="bg-emerald-500" />
                  <StatBar label="Spec Satisfaction" value={(result as { synthesis: { spec_satisfaction: number } }).synthesis.spec_satisfaction} color="bg-blue-500" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Candidates: {(result as { synthesis: { n_candidates: number } }).synthesis.n_candidates}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Candidate Rankings:</p>
                    {((result as { synthesis: { candidates: Array<{ candidate_id: number; quality_score: number; complexity: number }> } }).synthesis.candidates || []).map((c) => (
                      <div key={c.candidate_id} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">#{c.candidate_id}</span>
                        <StatBar label="" value={c.quality_score} color="bg-violet-400" />
                        <span className="text-gray-400">C{c.complexity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Raw JSON</summary><JsonBlock data={result} /></details>
            </div>
          )}
        </Card>
      </div>
    );
  }

  function renderVerify() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Verification Configuration">
          <InputField label="Graph ID" value={graphId} onChange={setGraphId} />
          <InputField label="Program ID" value={programId} onChange={setProgramId} />
          <SelectField label="Method" value={verifyMethod} onChange={setVerifyMethod} options={VERIFY_METHODS} />
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded transition-colors disabled:opacity-50"
            disabled={loading}
            onClick={() => callApi("/causal-program/verify", { graph_id: graphId, method: verifyMethod, program_id: programId })}
          >
            {loading ? "Verifying..." : "Verify Program"}
          </button>
        </Card>
        <Card title="Verification Results">
          {result && (
            <div>
              {(result as { verification?: { overall_verdict?: string; coverage?: number; test_pass_rate?: number; properties?: Array<{ property: string; status: string; confidence: number }>; pass_count?: number; warning_count?: number; fail_count?: number } }).verification && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Verdict:</span>
                    <Badge status={(result as { verification: { overall_verdict: string } }).verification.overall_verdict} />
                  </div>
                  <StatBar label="Coverage" value={(result as { verification: { coverage: number } }).verification.coverage} color="bg-blue-500" />
                  <StatBar label="Test Pass Rate" value={(result as { verification: { test_pass_rate: number } }).verification.test_pass_rate} color="bg-green-500" />
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-green-50 dark:bg-green-900/30 rounded p-2">
                      <div className="font-bold text-green-700 dark:text-green-300">{(result as { verification: { pass_count: number } }).verification.pass_count}</div>
                      <div className="text-gray-500">Passed</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded p-2">
                      <div className="font-bold text-yellow-700 dark:text-yellow-300">{(result as { verification: { warning_count: number } }).verification.warning_count}</div>
                      <div className="text-gray-500">Warnings</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/30 rounded p-2">
                      <div className="font-bold text-red-700 dark:text-red-300">{(result as { verification: { fail_count: number } }).verification.fail_count}</div>
                      <div className="text-gray-500">Failed</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Property Results:</p>
                    {((result as { verification: { properties: Array<{ property: string; status: string; confidence: number }> } }).verification.properties || []).map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">{p.property}</span>
                        <div className="flex items-center gap-2">
                          <Badge status={p.status} />
                          <span className="font-mono text-gray-500">{p.confidence.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Raw JSON</summary><JsonBlock data={result} /></details>
            </div>
          )}
        </Card>
      </div>
    );
  }

  function renderOptimize() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Optimization Configuration">
          <InputField label="Graph ID" value={graphId} onChange={setGraphId} />
          <InputField label="Program ID" value={programId} onChange={setProgramId} />
          <SelectField label="Target" value={optTarget} onChange={setOptTarget} options={OPT_TARGETS} />
          <InputField label="Iterations" value={optIterations} onChange={setOptIterations} placeholder="20" />
          <button
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded transition-colors disabled:opacity-50"
            disabled={loading}
            onClick={() => callApi("/causal-program/optimize", { graph_id: graphId, target: optTarget, program_id: programId, iterations: parseInt(optIterations) || 20 })}
          >
            {loading ? "Optimizing..." : "Optimize Program"}
          </button>
        </Card>
        <Card title="Optimization Results">
          {result && (
            <div>
              {(result as { optimization?: { initial_score?: number; final_score?: number; improvement_pct?: number; convergence_iteration?: number; trajectory?: Array<{ iteration: number; score: number; technique_applied: string }>; transforms?: Array<{ type: string; line_reduction: number; performance_gain: number }> } }).optimization && (
                <div className="space-y-3">
                  <StatBar label="Initial Score" value={(result as { optimization: { initial_score: number } }).optimization.initial_score} color="bg-gray-400" />
                  <StatBar label="Final Score" value={(result as { optimization: { final_score: number } }).optimization.final_score} color="bg-purple-500" />
                  <div className="text-center text-xs text-gray-500">
                    +{(result as { optimization: { improvement_pct: number } }).optimization.improvement_pct.toFixed(1)}% improvement · Converged at iter {(result as { optimization: { convergence_iteration: number } }).optimization.convergence_iteration}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Optimization Trajectory:</p>
                    <div className="h-24 flex items-end gap-px">
                      {((result as { optimization: { trajectory: Array<{ iteration: number; score: number; technique_applied: string }> } }).optimization.trajectory || []).map((t) => (
                        <div key={t.iteration} className="flex-1 bg-purple-400 rounded-t" style={{ height: `${t.score * 100}%` }} title={`Iter ${t.iteration}: ${t.score.toFixed(4)} (${t.technique_applied})`} />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Transforms Applied:</p>
                    {((result as { optimization: { transforms: Array<{ type: string; line_reduction: number; performance_gain: number }> } }).optimization.transforms || []).map((t, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-mono">{t.type}</span>
                        <div className="flex gap-3">
                          <span className="text-blue-500">-{(t.line_reduction * 100).toFixed(0)}% lines</span>
                          <span className="text-green-500">+{(t.performance_gain * 100).toFixed(0)}% perf</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Raw JSON</summary><JsonBlock data={result} /></details>
            </div>
          )}
        </Card>
      </div>
    );
  }

  function renderCompose() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Composition Configuration">
          <InputField label="Graph ID" value={graphId} onChange={setGraphId} />
          <SelectField label="Mode" value={compMode} onChange={setCompMode} options={COMPOSITION_MODES} />
          <TextField label="Component IDs (comma-separated)" value={compIds} onChange={setCompIds} placeholder="prog_001,prog_002,prog_003" />
          <button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-2 rounded transition-colors disabled:opacity-50"
            disabled={loading}
            onClick={() => callApi("/causal-program/compose", { graph_id: graphId, mode: compMode, component_ids: compIds.split(",").map((s) => s.trim()).filter(Boolean) })}
          >
            {loading ? "Composing..." : "Compose Pipeline"}
          </button>
        </Card>
        <Card title="Composition Results">
          {result && (
            <div>
              {(result as { composition?: { composition_quality?: number; data_flow_consistency?: number; components?: Array<{ component_id: string; position: number; input_type: string; output_type: string; estimated_runtime_ms: number }>; interfaces?: Array<{ from_component: string; to_component: string; compatibility: number; adapter_required: boolean }> } }).composition && (
                <div className="space-y-3">
                  <StatBar label="Composition Quality" value={(result as { composition: { composition_quality: number } }).composition.composition_quality} color="bg-orange-500" />
                  <StatBar label="Data Flow Consistency" value={(result as { composition: { data_flow_consistency: number } }).composition.data_flow_consistency} color="bg-teal-500" />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Pipeline Components:</p>
                    {((result as { composition: { components: Array<{ component_id: string; position: number; input_type: string; output_type: string; estimated_runtime_ms: number }> } }).composition.components || []).map((c) => (
                      <div key={c.component_id} className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs">
                        <div className="flex justify-between">
                          <span className="font-mono text-gray-700 dark:text-gray-300">{c.component_id}</span>
                          <span className="text-gray-400">~{c.estimated_runtime_ms.toFixed(0)}ms</span>
                        </div>
                        <div className="text-gray-500 mt-1">{c.input_type} → {c.output_type}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Interfaces:</p>
                    {((result as { composition: { interfaces: Array<{ from_component: string; to_component: string; compatibility: number; adapter_required: boolean }> } }).composition.interfaces || []).map((iface, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-mono">{iface.from_component} → {iface.to_component}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{iface.compatibility.toFixed(2)}</span>
                          {iface.adapter_required && <Badge status="warning" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Raw JSON</summary><JsonBlock data={result} /></details>
            </div>
          )}
        </Card>
      </div>
    );
  }

  function renderExecute() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Execution Configuration">
          <InputField label="Graph ID" value={graphId} onChange={setGraphId} />
          <InputField label="Program ID" value={programId} onChange={setProgramId} />
          <SelectField label="Environment" value={execEnv} onChange={setExecEnv} options={EXEC_ENVIRONMENTS} />
          <button
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 rounded transition-colors disabled:opacity-50"
            disabled={loading}
            onClick={() => callApi("/causal-program/execute", { graph_id: graphId, environment: execEnv, program_id: programId })}
          >
            {loading ? "Executing..." : "Execute Program"}
          </button>
        </Card>
        <Card title="Execution Results">
          {result && (
            <div>
              {(result as { execution?: { execution_success?: boolean; total_duration_ms?: number; peak_memory_mb?: number; total_records?: number; stages?: Array<{ stage: number; name: string; status: string; duration_ms: number; records_processed: number }>; outputs?: Array<{ type: string; format: string; size_bytes: number }>; error_message?: string | null } }).execution && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Status:</span>
                    <Badge status={(result as { execution: { execution_success: boolean } }).execution.execution_success ? "completed" : "failed"} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-2">
                      <div className="font-bold text-blue-700 dark:text-blue-300">{((result as { execution: { total_duration_ms: number } }).execution.total_duration_ms / 1000).toFixed(1)}s</div>
                      <div className="text-gray-500">Duration</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/30 rounded p-2">
                      <div className="font-bold text-purple-700 dark:text-purple-300">{(result as { execution: { peak_memory_mb: number } }).execution.peak_memory_mb.toFixed(0)}MB</div>
                      <div className="text-gray-500">Peak Mem</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/30 rounded p-2">
                      <div className="font-bold text-green-700 dark:text-green-300">{(result as { execution: { total_records: number } }).execution.total_records.toLocaleString()}</div>
                      <div className="text-gray-500">Records</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Execution Stages:</p>
                    {((result as { execution: { stages: Array<{ stage: number; name: string; status: string; duration_ms: number; records_processed: number }> } }).execution.stages || []).map((s) => (
                      <div key={s.stage} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge status={s.status} />
                          <span className="text-gray-400">{s.duration_ms.toFixed(0)}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(result as { execution: { error_message: string | null } }).execution.error_message && (
                    <div className="bg-red-50 dark:bg-red-900/30 rounded p-2 text-xs text-red-700 dark:text-red-300">
                      {(result as { execution: { error_message: string } }).execution.error_message}
                    </div>
                  )}
                </div>
              )}
              <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Raw JSON</summary><JsonBlock data={result} /></details>
            </div>
          )}
        </Card>
      </div>
    );
  }

  function renderDebug() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Debug Configuration">
          <InputField label="Graph ID" value={graphId} onChange={setGraphId} />
          <InputField label="Program ID" value={programId} onChange={setProgramId} />
          <TextField label="Error Context" value={debugErrorCtx} onChange={setDebugErrorCtx} placeholder="Paste error message..." />
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded transition-colors disabled:opacity-50"
            disabled={loading}
            onClick={() => callApi("/causal-program/debug", { graph_id: graphId, program_id: programId, error_context: debugErrorCtx })}
          >
            {loading ? "Diagnosing..." : "Debug Program"}
          </button>
        </Card>
        <Card title="Debug Results">
          {result && (
            <div>
              {(result as { debug?: { diagnosis?: { root_cause?: string; critical_count?: number; error_count?: number; fixable_count?: number; issues?: Array<{ type: string; severity: string; message: string; fixable: boolean; suggested_fix: string; confidence: number }> }; patches?: Array<{ type: string; lines_affected: number; confidence: number; auto_applicable: boolean; risk_level: string }>; debug_confidence?: number } }).debug && (
                <div className="space-y-3">
                  <div className="bg-red-50 dark:bg-red-900/30 rounded p-2">
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">Root Cause:</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{(result as { debug: { diagnosis: { root_cause: string } } }).debug.diagnosis.root_cause}</p>
                  </div>
                  <StatBar label="Debug Confidence" value={(result as { debug: { debug_confidence: number } }).debug.debug_confidence} color="bg-red-400" />
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-red-50 dark:bg-red-900/30 rounded p-2">
                      <div className="font-bold text-red-700 dark:text-red-300">{(result as { debug: { diagnosis: { critical_count: number } } }).debug.diagnosis.critical_count}</div>
                      <div className="text-gray-500">Critical</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/30 rounded p-2">
                      <div className="font-bold text-orange-700 dark:text-orange-300">{(result as { debug: { diagnosis: { error_count: number } } }).debug.diagnosis.error_count}</div>
                      <div className="text-gray-500">Errors</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/30 rounded p-2">
                      <div className="font-bold text-green-700 dark:text-green-300">{(result as { debug: { diagnosis: { fixable_count: number } } }).debug.diagnosis.fixable_count}</div>
                      <div className="text-gray-500">Fixable</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Issues Found:</p>
                    {((result as { debug: { diagnosis: { issues: Array<{ type: string; severity: string; message: string; fixable: boolean; suggested_fix: string; confidence: number }> } } }).debug.diagnosis.issues || []).map((issue) => (
                      <div key={issue.type} className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-gray-700 dark:text-gray-300">{issue.type}</span>
                          <div className="flex items-center gap-2">
                            <Badge status={issue.severity} />
                            <span className="text-gray-400">{(issue.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <p className="text-gray-500">{issue.message}</p>
                        {issue.fixable && (
                          <p className="text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Fix: {issue.suggested_fix}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {((result as { debug: { patches: Array<{ type: string; lines_affected: number; confidence: number; auto_applicable: boolean; risk_level: string }> } }).debug.patches || []).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Patches Available:</p>
                      {((result as { debug: { patches: Array<{ type: string; lines_affected: number; confidence: number; auto_applicable: boolean; risk_level: string }> } }).debug.patches || []).map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-gray-600 dark:text-gray-400 font-mono">{p.type} ({p.lines_affected} lines)</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">{(p.confidence * 100).toFixed(0)}%</span>
                            {p.auto_applicable && <Badge status="passed" />}
                            <span className={`text-xs ${p.risk_level === "low" ? "text-green-500" : p.risk_level === "medium" ? "text-yellow-500" : "text-red-500"}`}>{p.risk_level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Raw JSON</summary><JsonBlock data={result} /></details>
            </div>
          )}
        </Card>
      </div>
    );
  }

  function renderOverview() {
    return (
      <div className="space-y-4">
        <Card title="Engine Overview — v1.236.0 Graph Causal Program Synthesis">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded p-3 text-center">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">6</div>
              <div className="text-xs text-gray-500">Synthesis Strategies</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-3 text-center">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300">6</div>
              <div className="text-xs text-gray-500">Languages</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded p-3 text-center">
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">6</div>
              <div className="text-xs text-gray-500">Verification Methods</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 rounded p-3 text-center">
              <div className="text-lg font-bold text-orange-700 dark:text-orange-300">6</div>
              <div className="text-xs text-gray-500">Optimization Targets</div>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-900/30 rounded p-3 text-center">
              <div className="text-lg font-bold text-cyan-700 dark:text-cyan-300">6</div>
              <div className="text-xs text-gray-500">Composition Modes</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/30 rounded p-3 text-center">
              <div className="text-lg font-bold text-red-700 dark:text-red-300">6</div>
              <div className="text-xs text-gray-500">Execution Environments</div>
            </div>
          </div>
        </Card>
        <Card title="Workflow Pipeline">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { label: "Synthesize", color: "bg-emerald-500", desc: "NL spec → program candidates" },
              { label: "Verify", color: "bg-blue-500", desc: "Correctness & safety checks" },
              { label: "Optimize", color: "bg-purple-500", desc: "Targeted improvements" },
              { label: "Compose", color: "bg-orange-500", desc: "Build pipelines" },
              { label: "Execute", color: "bg-cyan-500", desc: "Run in environment" },
              { label: "Debug", color: "bg-red-500", desc: "Diagnose & repair" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`${step.color} rounded-lg p-3 text-white text-center min-w-[120px]`}>
                  <div className="text-sm font-bold">{step.label}</div>
                  <div className="text-xs opacity-80 mt-1">{step.desc}</div>
                </div>
                {i < 5 && <span className="text-gray-400 text-lg">→</span>}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Integration Chain">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {[
              { version: "v1.235", name: "Multi-Scale Causal" },
              { version: "v1.234", name: "Explainability Synthesis" },
              { version: "v1.233", name: "Topology Intervention" },
              { version: "v1.232", name: "Neuro-Symbolic Meta" },
              { version: "v1.231", name: "SSL Causal Discovery" },
              { version: "v1.214", name: "Causal Discovery" },
            ].map((dep) => (
              <div key={dep.version} className="bg-gray-50 dark:bg-gray-900 rounded p-2 flex items-center gap-2">
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{dep.version}</span>
                <span className="text-gray-600 dark:text-gray-400">{dep.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Causal Program Synthesis</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">v1.236.0 — Synthesize, verify, optimize, compose, execute & debug causal analysis programs</p>
        </div>
        <div className="text-xs text-gray-400 font-mono">6 enums · 36 values · 7 endpoints</div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t
                ? "text-emerald-600 border-b-2 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
            onClick={() => { setTab(t); setResult(null); setError(null); }}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {tab === "Synthesize" && renderSynthesize()}
      {tab === "Verify" && renderVerify()}
      {tab === "Optimize" && renderOptimize()}
      {tab === "Compose" && renderCompose()}
      {tab === "Execute" && renderExecute()}
      {tab === "Debug" && renderDebug()}
      {tab === "Overview" && renderOverview()}
    </div>
  );
}
