"use client";

import { useState } from "react";

const API = "/api/graph";

// Enum values from quantum-opt/api.ts
const QUANTUM_ALGORITHMS = ["qaoa", "vqe", "quantum_annealing", "grover", "shor", "qft"];
const OPTIMIZATION_OBJECTIVES = ["min_cut", "max_flow", "graph_coloring", "tsp", "vertex_cover", "community_detection"];
const ENTANGLEMENT_STRATEGIES = ["full", "pairwise", "nearest_neighbor", "random", "adaptive", "hierarchical"];
const DECOHERENCE_MITIGATIONS = ["error_correction", "dynamical_decoupling", "noise_adaptive", "fault_tolerant", "decoherence_free", "measurement_error"];
const CIRCUIT_DEPTHS = ["shallow", "medium", "deep", "adaptive", "nisq_optimized", "theoretical_optimal"];
const HYBRID_MODES = ["classical_preprocessing", "quantum_accelerated", "variational", "qpu_first", "cpu_first", "adaptive_switch"];

const TABS = ["Optimize", "Circuit", "Anneal", "Hybrid", "Entangle", "Benchmark", "Overview"] as const;
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

export default function GraphQuantumOptPage() {
  const [tab, setTab] = useState<Tab>("Optimize");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Optimize state
  const [optGraphId, setOptGraphId] = useState("qgraph_01");
  const [optAlgorithm, setOptAlgorithm] = useState("qaoa");
  const [optObjective, setOptObjective] = useState("min_cut");
  const [optQubits, setOptQubits] = useState(8);
  const [optShots, setOptShots] = useState(1024);
  const [optIterations, setOptIterations] = useState(100);

  // Circuit state
  const [cirGraphId, setCirGraphId] = useState("qgraph_01");
  const [cirAlgorithm, setCirAlgorithm] = useState("qaoa");
  const [cirDepth, setCirDepth] = useState("medium");
  const [cirQubits, setCirQubits] = useState(8);
  const [cirEntanglement, setCirEntanglement] = useState("full");
  const [cirMitigation, setCirMitigation] = useState("noise_adaptive");

  // Anneal state
  const [anGraphId, setAnGraphId] = useState("qgraph_01");
  const [anReads, setAnReads] = useState(1000);
  const [anTime, setAnTime] = useState(20);
  const [anChain, setAnChain] = useState(2.0);
  const [anSchedule, setAnSchedule] = useState("default");

  // Hybrid state
  const [hyGraphId, setHyGraphId] = useState("qgraph_01");
  const [hyMode, setHyMode] = useState("variational");
  const [hyObjective, setHyObjective] = useState("min_cut");
  const [hyClassIter, setHyClassIter] = useState(50);
  const [hyQuantIter, setHyQuantIter] = useState(20);

  // Entangle state
  const [enGraphId, setEnGraphId] = useState("qgraph_01");
  const [enStrategy, setEnStrategy] = useState("full");
  const [enQubits, setEnQubits] = useState(8);
  const [enDepth, setEnDepth] = useState(3);
  const [enConnectivity, setEnConnectivity] = useState("linear");

  // Benchmark state
  const [bmGraphId, setBmGraphId] = useState("qgraph_01");
  const [bmAlgorithms, setBmAlgorithms] = useState<string[]>(["qaoa", "vqe"]);
  const [bmObjective, setBmObjective] = useState("min_cut");
  const [bmQubitRange, setBmQubitRange] = useState<string>("4,8,16,32");

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

  const renderOptimize = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Quantum Optimization">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={optGraphId} onChange={(e) => setOptGraphId(e.target.value)} /></div>
        <SelectField label="Algorithm" value={optAlgorithm} onChange={setOptAlgorithm} options={QUANTUM_ALGORITHMS} />
        <SelectField label="Objective" value={optObjective} onChange={setOptObjective} options={OPTIMIZATION_OBJECTIVES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Qubits</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={optQubits} onChange={(e) => setOptQubits(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Shots</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={optShots} onChange={(e) => setOptShots(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Iterations</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={optIterations} onChange={(e) => setOptIterations(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/quantum-opt/optimize", { graph_id: optGraphId, algorithm: optAlgorithm, objective: optObjective, num_qubits: optQubits, shots: optShots, max_iterations: optIterations })}>{loading ? "Optimizing..." : "Run Optimization"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "result" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const r = d.result as Record<string, unknown>;
          const quality = r.solution_quality as Record<string, unknown>;
          return (<>
            <Card title="Optimization Results">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(r.algorithm)}</div><div className="text-xs text-gray-500">Algorithm</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(r.final_cost)}</div><div className="text-xs text-gray-500">Final Cost</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(r.improvement_percent)}%</div><div className="text-xs text-gray-500">Improvement</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(r.iterations_used)}</div><div className="text-xs text-gray-500">Iterations</div></div>
              </div>
              <StatBar label="Success Probability" value={Number(r.success_probability) || 0} color="bg-blue-500" />
              <StatBar label="Approximation Ratio" value={Number(quality?.approximation_ratio) || 0} color="bg-emerald-500" />
              <StatBar label="Gap to Optimal" value={Number(quality?.gap_to_optimal) || 0} color="bg-amber-500" />
            </Card>
            <Card title="Cost History">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(r.initial_cost)}</div><div className="text-xs text-gray-500">Initial Cost</div></div>
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(r.optimal_cost)}</div><div className="text-xs text-gray-500">Optimal Cost</div></div>
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(r.num_qubits_used)} qubits</div><div className="text-xs text-gray-500">Qubits Used</div></div>
              </div>
              {quality && <div className="flex gap-2"><Badge text={String(quality.feasibility) === "true" ? "Feasible" : "Infeasible"} color={String(quality.feasibility) === "true" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"} /></div>}
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderCircuit = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Circuit Construction">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cirGraphId} onChange={(e) => setCirGraphId(e.target.value)} /></div>
        <SelectField label="Algorithm" value={cirAlgorithm} onChange={setCirAlgorithm} options={QUANTUM_ALGORITHMS} />
        <SelectField label="Circuit Depth" value={cirDepth} onChange={setCirDepth} options={CIRCUIT_DEPTHS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Qubits</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cirQubits} onChange={(e) => setCirQubits(+e.target.value)} /></div>
        <SelectField label="Entanglement" value={cirEntanglement} onChange={setCirEntanglement} options={ENTANGLEMENT_STRATEGIES} />
        <SelectField label="Decoherence Mitigation" value={cirMitigation} onChange={setCirMitigation} options={DECOHERENCE_MITIGATIONS} />
        <button className="w-full mt-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/quantum-opt/circuit", { graph_id: cirGraphId, algorithm: cirAlgorithm, depth: cirDepth, num_qubits: cirQubits, entanglement: cirEntanglement, mitigation: cirMitigation })}>{loading ? "Building..." : "Build Circuit"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "result" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const r = d.result as Record<string, unknown>;
          return (
            <Card title="Circuit Analysis">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(r.circuit_depth)}</div><div className="text-xs text-gray-500">Depth</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(r.circuit_width)}</div><div className="text-xs text-gray-500">Width</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(r.total_gates)}</div><div className="text-xs text-gray-500">Total Gates</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(r.fidelity_estimate)}</div><div className="text-xs text-gray-500">Fidelity</div></div>
              </div>
              <StatBar label="Single-Qubit Gates" value={Number(r.single_qubit_gates) || 0} max={Number(r.total_gates) || 1} color="bg-blue-500" />
              <StatBar label="Two-Qubit Gates" value={Number(r.two_qubit_gates) || 0} max={Number(r.total_gates) || 1} color="bg-emerald-500" />
              <StatBar label="Entanglers" value={Number(r.entangler_count) || 0} max={Number(r.total_gates) || 1} color="bg-amber-500" />
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="text-xs font-medium text-gray-500">Mitigation</div>
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(r.mitigation_strategy)}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="text-xs font-medium text-gray-500">Overhead Factor</div>
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(r.mitigation_overhead_factor)}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="text-xs font-medium text-gray-500">Exec Time</div>
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(r.execution_time_estimate_ms)}ms</div>
                </div>
              </div>
            </Card>
          );
        })()}
      </div>
    </div>
  );

  const renderAnneal = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Quantum Annealing">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={anGraphId} onChange={(e) => setAnGraphId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Reads</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={anReads} onChange={(e) => setAnReads(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Anneal Time (us)</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={anTime} onChange={(e) => setAnTime(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Chain Strength</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={anChain} onChange={(e) => setAnChain(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/quantum-opt/anneal", { graph_id: anGraphId, num_reads: anReads, anneal_time_us: anTime, chain_strength: anChain, schedule_type: anSchedule })}>{loading ? "Annealing..." : "Run Annealing"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Annealing Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderHybrid = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Hybrid Classical-Quantum Solver">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={hyGraphId} onChange={(e) => setHyGraphId(e.target.value)} /></div>
        <SelectField label="Hybrid Mode" value={hyMode} onChange={setHyMode} options={HYBRID_MODES} />
        <SelectField label="Objective" value={hyObjective} onChange={setHyObjective} options={OPTIMIZATION_OBJECTIVES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Classical Iterations</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={hyClassIter} onChange={(e) => setHyClassIter(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Quantum Iterations</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={hyQuantIter} onChange={(e) => setHyQuantIter(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/quantum-opt/hybrid-solve", { graph_id: hyGraphId, mode: hyMode, objective: hyObjective, classical_iterations: hyClassIter, quantum_iterations: hyQuantIter })}>{loading ? "Solving..." : "Run Hybrid Solve"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Hybrid Solve Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderEntangle = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Entanglement Analysis">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={enGraphId} onChange={(e) => setEnGraphId(e.target.value)} /></div>
        <SelectField label="Strategy" value={enStrategy} onChange={setEnStrategy} options={ENTANGLEMENT_STRATEGIES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Qubits</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={enQubits} onChange={(e) => setEnQubits(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Depth</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={enDepth} onChange={(e) => setEnDepth(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/quantum-opt/entanglement", { graph_id: enGraphId, strategy: enStrategy, num_qubits: enQubits, depth: enDepth, connectivity: enConnectivity })}>{loading ? "Analyzing..." : "Analyze Entanglement"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Entanglement Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderBenchmark = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Quantum Benchmark">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={bmGraphId} onChange={(e) => setBmGraphId(e.target.value)} /></div>
        <SelectField label="Objective" value={bmObjective} onChange={setBmObjective} options={OPTIMIZATION_OBJECTIVES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Qubit Range (comma-sep)</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={bmQubitRange} onChange={(e) => setBmQubitRange(e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/quantum-opt/benchmark", { graph_id: bmGraphId, algorithms: bmAlgorithms, objective: bmObjective, num_qubits_range: bmQubitRange.split(",").map(Number) })}>{loading ? "Benchmarking..." : "Run Benchmark"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Benchmark Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderOverview = () => {
    const allEnums: Record<string, string[]> = {
      QuantumAlgorithm: QUANTUM_ALGORITHMS,
      OptimizationObjective: OPTIMIZATION_OBJECTIVES,
      EntanglementStrategy: ENTANGLEMENT_STRATEGIES,
      DecoherenceMitigation: DECOHERENCE_MITIGATIONS,
      CircuitDepth: CIRCUIT_DEPTHS,
      HybridMode: HYBRID_MODES,
    };
    return (
      <div className="space-y-4">
        <Card title="Engine Metadata">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center"><div className="text-lg font-bold text-blue-600">v1.240.0</div><div className="text-xs text-gray-500">Version</div></div>
            <div className="text-center"><div className="text-lg font-bold text-emerald-600">7</div><div className="text-xs text-gray-500">Endpoints</div></div>
            <div className="text-center"><div className="text-lg font-bold text-amber-600">6</div><div className="text-xs text-gray-500">Enums</div></div>
            <div className="text-center"><div className="text-lg font-bold text-purple-600">36</div><div className="text-xs text-gray-500">Enum Values</div></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Quantum-inspired optimization engine for graph problems — QAOA/VQE/annealing algorithms, circuit construction, hybrid classical-quantum solving, entanglement analysis, and benchmarking.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge text="Quantum Optimization" color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
            <Badge text="Circuit Construction" color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
            <Badge text="Quantum Annealing" color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
            <Badge text="Hybrid Solver" color="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300" />
            <Badge text="Entanglement Analysis" color="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" />
            <Badge text="Benchmarking" color="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" />
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
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.240</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Ontology Learning</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.239</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Adversarial Robustness</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.237</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Program Synthesis</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.236</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const tabRenderers: Record<Tab, () => React.ReactNode> = {
    Optimize: renderOptimize,
    Circuit: renderCircuit,
    Anneal: renderAnneal,
    Hybrid: renderHybrid,
    Entangle: renderEntangle,
    Benchmark: renderBenchmark,
    Overview: renderOverview,
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-100">
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Graph Quantum-Inspired Optimization</h1>
        <p className="text-sm text-gray-400 mt-1">v1.240.0 &mdash; QAOA/VQE/annealing algorithms, circuit construction, hybrid solver, entanglement analysis & benchmarking</p>
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