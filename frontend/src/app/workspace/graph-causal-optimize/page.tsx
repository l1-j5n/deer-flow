"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.254 backend
const OPT_OBJECTIVES = ["latency_minimization", "throughput_maximization", "memory_efficiency", "accuracy_preservation", "energy_efficiency", "multi_objective"];
const OPT_TECHNIQUES = ["constant_folding", "dead_code_elimination", "operator_fusion", "quantization", "pruning", "causal_graph_simplification"];
const PROFILING_METRICS = ["execution_time", "memory_usage", "compute_flops", "data_transfer", "causal_inference_steps", "graph_traversal_depth"];
const BOTTLENECK_TYPES = ["compute_bound", "memory_bound", "io_bound", "causal_dependency", "synchronization", "data_structural"];
const SCHEDULING_STRATEGIES = ["topological_order", "critical_path", "parallel_causal", "priority_based", "resource_aware", "ai_adaptive_scheduling"];
const VALIDATION_LEVELS = ["semantic_equivalence", "causal_preservation", "statistical_approximation", "performance_benchmark", "regression_test", "full_validation"];

const TABS = ["Profile", "Optimize", "Schedule", "Validate", "Benchmark", "Tune", "Overview"] as const;
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
  return <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mr-1 mb-1 ${color}`}>{text}</span>;
}

export default function GraphCausalOptimizePage() {
  const [tab, setTab] = useState<Tab>("Profile");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Profile state
  const [profileId, setProfileId] = useState("prof-001");
  const [programId, setProgramId] = useState("prog-001");
  const [profMetrics, setProfMetrics] = useState<string[]>(["execution_time", "memory_usage", "compute_flops"]);
  const [profileRuns, setProfileRuns] = useState(10);

  // Optimize state
  const [optId, setOptId] = useState("opt-001");
  const [optProgramId, setOptProgramId] = useState("prog-001");
  const [optProfileId, setOptProfileId] = useState("prof-001");
  const [objectives, setObjectives] = useState<string[]>(["latency_minimization", "accuracy_preservation"]);
  const [techniques, setTechniques] = useState<string[]>(["operator_fusion", "causal_graph_simplification"]);
  const [accuracyDrop, setAccuracyDrop] = useState(0.02);

  // Schedule state
  const [schedId, setSchedId] = useState("sched-001");
  const [schedProgramId, setSchedProgramId] = useState("prog-001");
  const [schedOptId, setSchedOptId] = useState("opt-001");
  const [schedStrategy, setSchedStrategy] = useState("parallel_causal");
  const [maxParallelism, setMaxParallelism] = useState(4);

  // Validate state
  const [valId, setValId] = useState("val-001");
  const [origProgId, setOrigProgId] = useState("prog-001");
  const [optProgId, setOptProgId] = useState("prog-001-opt");
  const [valLevels, setValLevels] = useState<string[]>(["semantic_equivalence", "causal_preservation"]);
  const [tolerance, setTolerance] = useState(0.01);

  // Benchmark state
  const [benchId, setBenchId] = useState("bench-001");
  const [benchProgId, setBenchProgId] = useState("prog-001");
  const [baselineProgId, setBaselineProgId] = useState("prog-001-baseline");
  const [benchIterations, setBenchIterations] = useState(50);

  // Tune state
  const [tuneId, setTuneId] = useState("tune-001");
  const [tuneProgId, setTuneProgId] = useState("prog-001");
  const [tuneObjective, setTuneObjective] = useState("multi_objective");
  const [tuneTrials, setTuneTrials] = useState(20);
  const [tuneTechnique, setTuneTechnique] = useState("operator_fusion");

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setResult(await res.json());
    } catch (e) { setResult({ error: String(e) }); } finally { setLoading(false); }
  };

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const renderProfile = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Program Profiling">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Profile ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={profileId} onChange={(e) => setProfileId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={programId} onChange={(e) => setProgramId(e.target.value)} /></div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Profiling Metrics</label>
          <div className="flex flex-wrap gap-1">{PROFILING_METRICS.map((m) => (
            <button key={m} onClick={() => toggleItem(profMetrics, m, setProfMetrics)} className={`text-xs px-2 py-1 rounded-full border ${profMetrics.includes(m) ? "bg-blue-500 text-white border-blue-500" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>{m.replace(/_/g, " ")}</button>
          ))}</div>
        </div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Profile Runs: {profileRuns}</label><input type="range" min="5" max="100" value={profileRuns} onChange={(e) => setProfileRuns(parseInt(e.target.value))} className="w-full" /></div>
        <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-optimize/profile", { profile_id: profileId, program_id: programId, profiling_metrics: profMetrics, profile_runs: profileRuns })}>{loading ? "Profiling..." : "Profile Program"}</button>
      </Card>
      <Card title="Profile Results">
        {result && typeof result === "object" && result !== null ? (() => {
          const r = result as Record<string, unknown>;
          const bottlenecks = r.bottlenecks as Array<Record<string, unknown>> | undefined;
          return (<>
            {bottlenecks && bottlenecks.map((b, i) => (<div key={i} className="mb-2 p-2 rounded bg-gray-50 dark:bg-gray-900"><Badge text={String(b.type).replace(/_/g, " ")} color={String(b.severity) === "high" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"} /><span className="text-xs text-gray-600 dark:text-gray-400 ml-2">{String(b.suggestion)}</span></div>))}
            <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Full Profile JSON</summary><JsonBlock data={result} /></details>
          </>);
        })() : <p className="text-xs text-gray-400">Click &quot;Profile Program&quot; to see results</p>}
      </Card>
    </div>
  );

  const renderOptimize = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Program Optimization">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Optimization ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={optId} onChange={(e) => setOptId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={optProgramId} onChange={(e) => setOptProgramId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Profile ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={optProfileId} onChange={(e) => setOptProfileId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Objectives</label><div className="flex flex-wrap gap-1">{OPT_OBJECTIVES.map((o) => (<button key={o} onClick={() => toggleItem(objectives, o, setObjectives)} className={`text-xs px-2 py-1 rounded-full border ${objectives.includes(o) ? "bg-green-500 text-white border-green-500" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>{o.replace(/_/g, " ")}</button>))}</div></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Techniques</label><div className="flex flex-wrap gap-1">{OPT_TECHNIQUES.map((t) => (<button key={t} onClick={() => toggleItem(techniques, t, setTechniques)} className={`text-xs px-2 py-1 rounded-full border ${techniques.includes(t) ? "bg-purple-500 text-white border-purple-500" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>{t.replace(/_/g, " ")}</button>))}</div></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Accuracy Drop: {accuracyDrop.toFixed(3)}</label><input type="range" min="0" max="0.1" step="0.005" value={accuracyDrop} onChange={(e) => setAccuracyDrop(parseFloat(e.target.value))} className="w-full" /></div>
        <button className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-optimize/optimize", { optimization_id: optId, program_id: optProgramId, profile_id: optProfileId, objectives: objectives, techniques: techniques, constraint_accuracy_drop: accuracyDrop })}>{loading ? "Optimizing..." : "Optimize"}</button>
      </Card>
      <Card title="Optimization Results">
        {result && typeof result === "object" && result !== null ? (() => {
          const r = result as Record<string, unknown>;
          const orig = r.original_metrics as Record<string, number> | undefined;
          const opt = r.optimized_metrics as Record<string, number> | undefined;
          const ratios = r.improvement_ratios as Record<string, number> | undefined;
          return (<>
            {orig && opt && Object.keys(orig).map((k) => (<div key={k} className="flex items-center justify-between text-xs mb-1.5"><span className="text-gray-600 dark:text-gray-400">{k.replace(/_/g, " ")}</span><span className="font-mono"><span className="text-red-500">{orig[k].toFixed(2)}</span> → <span className="text-green-500">{opt[k].toFixed(2)}</span> {ratios && ratios[k] !== undefined ? <span className="text-blue-500 ml-1">({(ratios[k] * 100).toFixed(1)}%)</span> : null}</span></div>))}
            <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Full JSON</summary><JsonBlock data={result} /></details>
          </>);
        })() : <p className="text-xs text-gray-400">Click &quot;Optimize&quot; to see results</p>}
      </Card>
    </div>
  );

  const renderSchedule = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Operation Scheduling">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Schedule ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={schedId} onChange={(e) => setSchedId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={schedProgramId} onChange={(e) => setSchedProgramId(e.target.value)} /></div>
        <SelectField label="Scheduling Strategy" value={schedStrategy} onChange={setSchedStrategy} options={SCHEDULING_STRATEGIES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Parallelism: {maxParallelism}</label><input type="range" min="1" max="16" value={maxParallelism} onChange={(e) => setMaxParallelism(parseInt(e.target.value))} className="w-full" /></div>
        <button className="mt-2 w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-optimize/schedule", { schedule_id: schedId, program_id: schedProgramId, optimization_id: schedOptId, strategy: schedStrategy, max_parallelism: maxParallelism })}>{loading ? "Scheduling..." : "Schedule"}</button>
      </Card>
      <Card title="Schedule Result">{result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Click &quot;Schedule&quot; to see results</p>}</Card>
    </div>
  );

  const renderValidate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Optimization Validation">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Validation ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={valId} onChange={(e) => setValId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Original Program</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={origProgId} onChange={(e) => setOrigProgId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Optimized Program</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={optProgId} onChange={(e) => setOptProgId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Validation Levels</label><div className="flex flex-wrap gap-1">{VALIDATION_LEVELS.map((l) => (<button key={l} onClick={() => toggleItem(valLevels, l, setValLevels)} className={`text-xs px-2 py-1 rounded-full border ${valLevels.includes(l) ? "bg-indigo-500 text-white border-indigo-500" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>{l.replace(/_/g, " ")}</button>))}</div></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tolerance: {tolerance.toFixed(3)}</label><input type="range" min="0" max="0.1" step="0.001" value={tolerance} onChange={(e) => setTolerance(parseFloat(e.target.value))} className="w-full" /></div>
        <button className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-optimize/validate", { validation_id: valId, original_program_id: origProgId, optimized_program_id: optProgId, validation_levels: valLevels, tolerance: tolerance })}>{loading ? "Validating..." : "Validate"}</button>
      </Card>
      <Card title="Validation Results">
        {result && typeof result === "object" && result !== null ? (() => {
          const r = result as Record<string, unknown>;
          return (<>
            <Badge text={r.overall_passed ? "✓ All Passed" : "✗ Violations Found"} color={r.overall_passed ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"} />
            {r.semantic_equivalence_score !== undefined && <StatBar label="Semantic Equivalence" value={r.semantic_equivalence_score as number} color={(r.semantic_equivalence_score as number) >= 0.95 ? "bg-green-500" : "bg-yellow-500"} />}
            {r.causal_preservation_score !== undefined && <StatBar label="Causal Preservation" value={r.causal_preservation_score as number} color={(r.causal_preservation_score as number) >= 0.95 ? "bg-green-500" : "bg-yellow-500"} />}
            <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Full JSON</summary><JsonBlock data={result} /></details>
          </>);
        })() : <p className="text-xs text-gray-400">Click &quot;Validate&quot; to see results</p>}
      </Card>
    </div>
  );

  const renderBenchmark = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Performance Benchmark">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Benchmark ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={benchId} onChange={(e) => setBenchId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={benchProgId} onChange={(e) => setBenchProgId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Baseline Program</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={baselineProgId} onChange={(e) => setBaselineProgId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Iterations: {benchIterations}</label><input type="range" min="10" max="200" value={benchIterations} onChange={(e) => setBenchIterations(parseInt(e.target.value))} className="w-full" /></div>
        <button className="mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-optimize/benchmark", { benchmark_id: benchId, program_id: benchProgId, baseline_program_id: baselineProgId, iterations: benchIterations })}>{loading ? "Benchmarking..." : "Run Benchmark"}</button>
      </Card>
      <Card title="Benchmark Results">{result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Click &quot;Run Benchmark&quot; to see results</p>}</Card>
    </div>
  );

  const renderTune = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Auto-Tuning">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tune ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={tuneId} onChange={(e) => setTuneId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={tuneProgId} onChange={(e) => setTuneProgId(e.target.value)} /></div>
        <SelectField label="Tuning Objective" value={tuneObjective} onChange={setTuneObjective} options={OPT_OBJECTIVES} />
        <SelectField label="Primary Technique" value={tuneTechnique} onChange={setTuneTechnique} options={OPT_TECHNIQUES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Trials: {tuneTrials}</label><input type="range" min="5" max="100" value={tuneTrials} onChange={(e) => setTuneTrials(parseInt(e.target.value))} className="w-full" /></div>
        <button className="mt-2 w-full bg-rose-600 hover:bg-rose-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-optimize/tune", { tune_id: tuneId, program_id: tuneProgId, objective: tuneObjective, num_trials: tuneTrials, technique: tuneTechnique })}>{loading ? "Tuning..." : "Auto-Tune"}</button>
      </Card>
      <Card title="Tuning Results">
        {result && typeof result === "object" && result !== null ? (() => {
          const r = result as Record<string, unknown>;
          const importance = r.parameter_importance as Record<string, number> | undefined;
          return (<>
            {r.best_score !== undefined && <StatBar label="Best Score" value={r.best_score as number} color={(r.best_score as number) >= 0.9 ? "bg-green-500" : "bg-yellow-500"} />}
            {importance && Object.entries(importance).map(([k, v]) => (<StatBar key={k} label={k.replace(/_/g, " ")} value={v} max={0.5} color="bg-purple-500" />))}
            <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Full JSON</summary><JsonBlock data={result} /></details>
          </>);
        })() : <p className="text-xs text-gray-400">Click &quot;Auto-Tune&quot; to see results</p>}
      </Card>
    </div>
  );

  const renderOverview = () => (
    <Card title="Engine Overview (v1.254)">
      <button className="mb-3 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-4 rounded" disabled={loading} onClick={async () => {
        setLoading(true); setResult(null);
        try { const res = await fetch(`${API}/causal-optimize/overview`); setResult(await res.json()); } catch (e) { setResult({ error: String(e) }); } finally { setLoading(false); }
      }}>{loading ? "Loading..." : "Load Overview"}</button>
      {result ? <JsonBlock data={result} /> : null}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p className="font-semibold mb-2">Graph Causal Program Optimization Engine — v1.254</p>
        <p>Optimize verified causal programs for performance while preserving causal semantics through profiling, optimization, scheduling, validation, benchmarking, and auto-tuning.</p>
        <p className="mt-2"><strong>6 Enums (36 values)</strong>: OptimizationObjective, OptimizationTechnique, ProfilingMetric, BottleneckType, SchedulingStrategy, ValidationLevel</p>
        <p className="mt-1"><strong>7 Endpoints</strong>: profile, optimize, schedule, validate, benchmark, tune, overview</p>
      </div>
    </Card>
  );

  const tabRenderers: Record<Tab, () => React.ReactNode> = {
    Profile: renderProfile, Optimize: renderOptimize, Schedule: renderSchedule,
    Validate: renderValidate, Benchmark: renderBenchmark, Tune: renderTune, Overview: renderOverview,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Graph Causal Program Optimization</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.254 — Optimize causal programs for performance while preserving causal semantics</p>
      </div>
      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setResult(null); }}
            className={`text-sm px-3 py-1.5 rounded-t font-medium transition-colors ${tab === t ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
            {t}
          </button>
        ))}
      </div>
      {tabRenderers[tab]()}
    </div>
  );
}
