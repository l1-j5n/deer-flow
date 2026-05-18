"use client";

import { useState } from "react";

const API = "/api/graph";

const HARDWARE_TARGETS = ["cpu", "gpu_consumer", "gpu_datacenter", "tpu", "edge_device", "fpga"];
const NAS_CELL_TYPES = ["gcn", "gat", "gin", "graphsage", "gtn", "pna"];
const FEDERATED_STRATEGIES = ["fednas", "federated_darts", "split_nas", "hnns", "cfl_nas", "async_nas"];
const NAS_CONSTRAINTS = ["latency", "memory", "energy", "flops", "parameter_count", "communication_cost"];
const MULTIMODAL_ARCHS = ["early_fusion", "late_fusion", "cross_attention", "hierarchical", "parallel_towers", "adapter_based"];
const SEARCH_STRATEGIES = ["darts", "enas", "nbanas", "genetic", "random_warmup", "progressive"];
const MODALITIES = ["visual", "textual", "structural", "temporal", "audio", "tabular"];
const COMPLEXITIES = ["light", "medium", "heavy"];
const AGGREGATIONS = ["fedavg", "fedprox", "scaffold", "fednova"];

const TABS = ["Hardware", "Cell Search", "Federated", "Constraints", "Multimodal", "Search", "Summary"] as const;
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

export default function GraphNASV4Page() {
  const [tab, setTab] = useState<Tab>("Hardware");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Hardware state
  const [hwTarget, setHwTarget] = useState("gpu_consumer");
  const [hwBatchSizes, setHwBatchSizes] = useState("16,32,64");
  const [hwComplexity, setHwComplexity] = useState("medium");

  // Cell Search state
  const [cellType, setCellType] = useState("gcn");
  const [cellLayers, setCellLayers] = useState(4);
  const [cellHiddenDim, setCellHiddenDim] = useState(128);
  const [cellSearchSpace, setCellSearchSpace] = useState(1000);
  const [cellCandidates, setCellCandidates] = useState(10);

  // Federated state
  const [fedStrategy, setFedStrategy] = useState("fednas");
  const [fedClients, setFedClients] = useState(5);
  const [fedRounds, setFedRounds] = useState(20);
  const [fedLocalEpochs, setFedLocalEpochs] = useState(3);
  const [fedAggregation, setFedAggregation] = useState("fedavg");

  // Constraints state
  const [conConstraint, setConConstraint] = useState("latency");
  const [conThreshold, setConThreshold] = useState(50.0);
  const [conNumArchs, setConNumArchs] = useState(200);
  const [conOptimization, setConOptimization] = useState("darts");

  // Multimodal state
  const [mmArchType, setMmArchType] = useState("cross_attention");
  const [mmModalities, setMmModalities] = useState("visual,structural");
  const [mmFusionDepth, setMmFusionDepth] = useState(3);
  const [mmCrossConnections, setMmCrossConnections] = useState(4);

  // Search state
  const [srchStrategy, setSrchStrategy] = useState("darts");
  const [srchBudget, setSrchBudget] = useState(100);
  const [srchNumEvals, setSrchNumEvals] = useState(50);
  const [srchConstrained, setSrchConstrained] = useState(true);
  const [srchSslAware, setSrchSslAware] = useState(true);

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

  const renderHardware = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Hardware Profile Parameters">
        <SelectField label="Target Hardware" value={hwTarget} onChange={setHwTarget} options={HARDWARE_TARGETS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Batch Sizes (comma-separated)</label>
          <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={hwBatchSizes} onChange={(e) => setHwBatchSizes(e.target.value)} />
        </div>
        <SelectField label="Model Complexity" value={hwComplexity} onChange={setHwComplexity} options={COMPLEXITIES} />
        <button
          className="w-full mt-2 rounded bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/nas-v4/hardware-profile", {
            graph_id: "nas_hw_01",
            target: hwTarget,
            batch_sizes: hwBatchSizes.split(",").map(Number),
            model_complexity: hwComplexity,
          })}
        >
          {loading ? "Profiling..." : "Profile Hardware"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "hardware_profile" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const hp = d.hardware_profile as Record<string, unknown>;
          const profiling = d.profiling as Record<string, unknown>;
          const bottleneck = d.bottleneck as Record<string, unknown>;
          const recommendation = d.recommendation as Record<string, unknown>;
          return (
            <>
              <Card title="Hardware Profile">
                <div className="grid grid-cols-5 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-600">{String(hp?.compute_tflops)}</div>
                    <div className="text-xs text-gray-500">TFLOPS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{String(hp?.memory_gb)}</div>
                    <div className="text-xs text-gray-500">Memory (GB)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{String(hp?.bandwidth_gbs)}</div>
                    <div className="text-xs text-gray-500">BW (GB/s)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{String(hp?.cores)}</div>
                    <div className="text-xs text-gray-500">Cores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600">{String(hp?.tp)}</div>
                    <div className="text-xs text-gray-500">TP</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">Target: <Badge text={String(d.target)} color="bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300" /> Complexity: <Badge text={String(d.model_complexity)} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" /></div>
              </Card>
              <Card title="Profiling & Bottleneck Analysis">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-600">{String(profiling?.peak_memory_gb)}</div>
                    <div className="text-xs text-gray-500">Peak Memory (GB)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{String(profiling?.energy_per_epoch_kwh)}</div>
                    <div className="text-xs text-gray-500">Energy/Epoch (kWh)</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  {bottleneck?.compute_bound && <Badge text="Compute Bound" color="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" />}
                  {bottleneck?.memory_bound && <Badge text="Memory Bound" color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />}
                  {bottleneck?.bandwidth_bound && <Badge text="Bandwidth Bound" color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Optimal Batch Size: {String(recommendation?.optimal_batch_size)} | Est. Epochs/Hour: {String(recommendation?.estimated_epochs_per_hour)}
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderCellSearch = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Cell Search Parameters">
        <SelectField label="Cell Type" value={cellType} onChange={setCellType} options={NAS_CELL_TYPES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number of Layers</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cellLayers} onChange={(e) => setCellLayers(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hidden Dimension</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cellHiddenDim} onChange={(e) => setCellHiddenDim(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Search Space Size</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cellSearchSpace} onChange={(e) => setCellSearchSpace(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number of Candidates</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cellCandidates} onChange={(e) => setCellCandidates(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/nas-v4/cell-search", {
            graph_id: "nas_cell_01",
            cell_type: cellType,
            num_layers: cellLayers,
            hidden_dim: cellHiddenDim,
            search_space_size: cellSearchSpace,
            num_candidates: cellCandidates,
          })}
        >
          {loading ? "Searching..." : "Search Cells"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "best_candidate" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const best = d.best_candidate as Record<string, unknown>;
          const stats = d.search_stats as Record<string, unknown>;
          const top5 = d.top5_candidates as Record<string, unknown>[];
          return (
            <>
              <Card title="Best Candidate">
                <div className="grid grid-cols-5 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{String(best?.score)}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{String(best?.params)}</div>
                    <div className="text-xs text-gray-500">Params</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{String(best?.flops)}</div>
                    <div className="text-xs text-gray-500">FLOPs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600">{String(best?.latency_ms)}</div>
                    <div className="text-xs text-gray-500">Latency (ms)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-600">{String(best?.memory_mb)}</div>
                    <div className="text-xs text-gray-500">Memory (MB)</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">Cell Type: <Badge text={String(d.cell_type)} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" /> Candidate ID: {String(best?.id)}</div>
              </Card>
              <Card title="Search Statistics">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div><span className="text-xs text-gray-500">Total Searched</span><div className="text-sm font-mono font-bold">{String(stats?.total_searched)}</div></div>
                  <div><span className="text-xs text-gray-500">Space Coverage</span><div className="text-sm font-mono font-bold">{String(stats?.search_space_coverage)}</div></div>
                  <div><span className="text-xs text-gray-500">Pareto Size</span><div className="text-sm font-mono font-bold">{String(stats?.pareto_size)}</div></div>
                  <div><span className="text-xs text-gray-500">Best Score</span><div className="text-sm font-mono font-bold">{String(stats?.best_score)}</div></div>
                </div>
                <div className="mt-3 text-xs text-gray-500">Top 5 Candidates:</div>
                <div className="mt-1 space-y-1">
                  {top5?.map((c: Record<string, unknown>, i: number) => (
                    <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1">
                      <span className="font-mono">{String(c.id)}</span>
                      <span>Score: {String(c.score)}</span>
                      <span>{String(c.params)} params</span>
                      <span>{String(c.latency_ms)} ms</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderFederated = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Federated NAS Parameters">
        <SelectField label="Strategy" value={fedStrategy} onChange={setFedStrategy} options={FEDERATED_STRATEGIES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number of Clients</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fedClients} onChange={(e) => setFedClients(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Communication Rounds</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fedRounds} onChange={(e) => setFedRounds(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Local Epochs</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fedLocalEpochs} onChange={(e) => setFedLocalEpochs(+e.target.value)} />
        </div>
        <SelectField label="Aggregation" value={fedAggregation} onChange={setFedAggregation} options={AGGREGATIONS} />
        <button
          className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/nas-v4/federated", {
            graph_id: "nas_fed_01",
            strategy: fedStrategy,
            num_clients: fedClients,
            communication_rounds: fedRounds,
            local_epochs: fedLocalEpochs,
            aggregation: fedAggregation,
          })}
        >
          {loading ? "Training..." : "Run Federated NAS"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "global_result" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const global = d.global_result as Record<string, unknown>;
          const comm = d.communication as Record<string, unknown>;
          const privacy = d.privacy as Record<string, unknown>;
          const clientResults = d.client_results as Record<string, Record<string, unknown>>;
          return (
            <>
              <Card title="Global Federated Result">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{String(global?.best_arch_score)}</div>
                    <div className="text-xs text-gray-500">Best Architecture Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{String(global?.convergence_round)}</div>
                    <div className="text-xs text-gray-500">Convergence Round</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">Strategy: <Badge text={String(d.strategy)} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" /> Aggregation: <Badge text={String(d.config && (d.config as Record<string, unknown>)?.aggregation)} color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" /></div>
              </Card>
              <Card title="Communication & Privacy">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{String(comm?.total_mb)}</div>
                    <div className="text-xs text-gray-500">Total MB</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{String(comm?.per_round_mb)}</div>
                    <div className="text-xs text-gray-500">MB/Round</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600">{String(comm?.bandwidth_utilization)}</div>
                    <div className="text-xs text-gray-500">BW Utilization</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><span className="text-xs text-gray-500">DP Epsilon</span><div className="text-sm font-mono">{String(privacy?.dp_epsilon)}</div></div>
                  <div><span className="text-xs text-gray-500">Grad Clipping</span><div className="text-sm font-mono">{String(privacy?.gradient_clipping)}</div></div>
                  <div><span className="text-xs text-gray-500">Noise Mult</span><div className="text-sm font-mono">{String(privacy?.noise_multiplier)}</div></div>
                </div>
              </Card>
              <Card title="Client Results">
                <div className="space-y-1">
                  {Object.entries(clientResults ?? {}).map(([cid, info]) => (
                    <div key={cid} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                      <span className="font-mono font-medium">{cid}</span>
                      <span>Score: {String(info.local_score)}</span>
                      <span>{String(info.data_size)} samples</span>
                      <span>{String(info.communication_mb)} MB</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderConstraints = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Constraint Parameters">
        <SelectField label="Constraint Type" value={conConstraint} onChange={setConConstraint} options={NAS_CONSTRAINTS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Threshold</label>
          <input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={conThreshold} onChange={(e) => setConThreshold(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number of Architectures</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={conNumArchs} onChange={(e) => setConNumArchs(+e.target.value)} />
        </div>
        <SelectField label="Optimization Strategy" value={conOptimization} onChange={setConOptimization} options={SEARCH_STRATEGIES} />
        <button
          className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/nas-v4/constraints", {
            graph_id: "nas_con_01",
            constraint: conConstraint,
            threshold: conThreshold,
            num_architectures: conNumArchs,
            optimization: conOptimization,
          })}
        >
          {loading ? "Optimizing..." : "Search Under Constraints"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "results" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const results = d.results as Record<string, unknown>;
          const bestFeasible = results?.best_feasible as Record<string, unknown>;
          const bestUnconstrained = results?.best_unconstrained as Record<string, unknown>;
          const pareto = d.pareto_analysis as Record<string, unknown>;
          const constraintInfo = d.constraint_info as Record<string, unknown>;
          return (
            <>
              <Card title="Constraint Search Results">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{String(results?.feasible_count)}</div>
                    <div className="text-xs text-gray-500">Feasible</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{String(results?.feasibility_rate)}</div>
                    <div className="text-xs text-gray-500">Feasibility Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{String(results?.total_evaluated)}</div>
                    <div className="text-xs text-gray-500">Total Evaluated</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">Constraint: <Badge text={String(d.constraint)} color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" /> Threshold: {String(d.threshold)} {String(constraintInfo?.unit)} | Direction: {String(constraintInfo?.direction)}</div>
              </Card>
              <Card title="Best Architectures">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-3">
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Best Feasible</div>
                    <div className="text-sm space-y-1">
                      <div>Arch: <span className="font-mono">{String(bestFeasible?.arch_id)}</span></div>
                      <div>Accuracy: <span className="font-mono">{String(bestFeasible?.accuracy)}</span></div>
                      <div>{String(d.constraint)}: <span className="font-mono">{String(bestFeasible?.constraint_value)}</span></div>
                      <div>{bestFeasible?.feasible ? <Badge text="Feasible" color="bg-green-100 text-green-700" /> : <Badge text="Infeasible" color="bg-red-100 text-red-700" />}</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                    <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">Best Unconstrained</div>
                    <div className="text-sm space-y-1">
                      <div>Arch: <span className="font-mono">{String(bestUnconstrained?.arch_id)}</span></div>
                      <div>Accuracy: <span className="font-mono">{String(bestUnconstrained?.accuracy)}</span></div>
                      <div>{String(d.constraint)}: <span className="font-mono">{String(bestUnconstrained?.constraint_value)}</span></div>
                      <div>{bestUnconstrained?.feasible ? <Badge text="Feasible" color="bg-green-100 text-green-700" /> : <Badge text="Infeasible" color="bg-red-100 text-red-700" />}</div>
                    </div>
                  </div>
                </div>
              </Card>
              <Card title="Pareto Analysis">
                <StatBar label="Accuracy at Threshold" value={Number(pareto?.accuracy_at_threshold ?? 0)} color="bg-amber-500" />
                <StatBar label="Constraint Utilization" value={Number(pareto?.constraint_utilization ?? 0)} color="bg-blue-500" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Tradeoff Slope: {String(pareto?.tradeoff_slope)}
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
      <Card title="Multimodal Architecture Parameters">
        <SelectField label="Architecture Type" value={mmArchType} onChange={setMmArchType} options={MULTIMODAL_ARCHS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Modalities (comma-separated)</label>
          <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={mmModalities} onChange={(e) => setMmModalities(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Fusion Depth</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={mmFusionDepth} onChange={(e) => setMmFusionDepth(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cross-Modal Connections</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={mmCrossConnections} onChange={(e) => setMmCrossConnections(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/nas-v4/multimodal-arch", {
            graph_id: "nas_mm_01",
            arch_type: mmArchType,
            modalities: mmModalities.split(",").map((s) => s.trim()),
            fusion_depth: mmFusionDepth,
            cross_modal_connections: mmCrossConnections,
          })}
        >
          {loading ? "Designing..." : "Design Architecture"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "modality_specifications" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const archInfo = d.arch_info as Record<string, unknown>;
          const modSpecs = d.modality_specifications as Record<string, Record<string, unknown>>;
          const fusionLayer = d.fusion_layer as Record<string, unknown>;
          const estimated = d.estimated as Record<string, unknown>;
          const connections = d.connections as Record<string, unknown>[];
          return (
            <>
              <Card title="Multimodal Architecture">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-violet-600">{String(d.total_parameters)}</div>
                    <div className="text-xs text-gray-500">Total Parameters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-mono text-blue-600">{String(archInfo?.complexity)}</div>
                    <div className="text-xs text-gray-500">Complexity | Overhead: {String(archInfo?.parameters_overhead)} params</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <Badge text={String(d.arch_type)} color="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300" />
                  <Badge text={`Fusion Depth: ${String((d.config as Record<string, unknown>)?.fusion_depth)}`} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                  <Badge text={`Connections: ${String((d.config as Record<string, unknown>)?.cross_modal_connections)}`} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
                </div>
              </Card>
              <Card title="Modality Specifications">
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(modSpecs ?? {}).map(([mod, spec]) => (
                    <div key={mod} className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                      <div className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-2">{mod}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <div>Layers: {String(spec?.encoder_layers)}</div>
                        <div>Hidden Dim: {String(spec?.hidden_dim)}</div>
                        <div>Params: {String(spec?.parameters)}</div>
                        <div>FLOPs: {String(spec?.flops)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Estimated Performance">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><span className="text-xs text-gray-500">Latency (ms)</span><div className="text-lg font-bold text-violet-600">{String(estimated?.latency_ms)}</div></div>
                  <div><span className="text-xs text-gray-500">Memory (MB)</span><div className="text-lg font-bold text-blue-600">{String(estimated?.memory_mb)}</div></div>
                  <div><span className="text-xs text-gray-500">FLOPs</span><div className="text-lg font-bold text-amber-600">{String(estimated?.flops)}</div></div>
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="NAS Search Parameters">
        <SelectField label="Search Strategy" value={srchStrategy} onChange={setSrchStrategy} options={SEARCH_STRATEGIES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Search Budget</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={srchBudget} onChange={(e) => setSrchBudget(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number of Evaluations</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={srchNumEvals} onChange={(e) => setSrchNumEvals(+e.target.value)} />
        </div>
        <div className="mb-3 flex items-center gap-2">
          <input type="checkbox" id="srchConstrained" className="rounded" checked={srchConstrained} onChange={(e) => setSrchConstrained(e.target.checked)} />
          <label htmlFor="srchConstrained" className="text-xs text-gray-600 dark:text-gray-400">Constrained</label>
        </div>
        <div className="mb-3 flex items-center gap-2">
          <input type="checkbox" id="srchSslAware" className="rounded" checked={srchSslAware} onChange={(e) => setSrchSslAware(e.target.checked)} />
          <label htmlFor="srchSslAware" className="text-xs text-gray-600 dark:text-gray-400">SSL-Aware</label>
        </div>
        <button
          className="w-full mt-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/nas-v4/search", {
            graph_id: "nas_srch_01",
            strategy: srchStrategy,
            search_budget: srchBudget,
            num_evals: srchNumEvals,
            constrained: srchConstrained,
            ssl_aware: srchSslAware,
          })}
        >
          {loading ? "Searching..." : "Run NAS Search"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "best_architecture" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const best = d.best_architecture as Record<string, unknown>;
          const progress = d.search_progress as Record<string, unknown>;
          const comparison = d.comparison as Record<string, unknown>;
          return (
            <>
              <Card title="Best Architecture">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600">{String(best?.final_accuracy ?? best?.accuracy)}</div>
                    <div className="text-xs text-gray-500">Final Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{String(best?.latency_ms)}</div>
                    <div className="text-xs text-gray-500">Latency (ms)</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                  <div><span className="text-xs text-gray-500">Eval ID</span><div className="text-sm font-mono">{String(best?.eval_id)}</div></div>
                  <div><span className="text-xs text-gray-500">Params</span><div className="text-sm font-mono">{String(best?.params)}</div></div>
                  <div><span className="text-xs text-gray-500">Epoch</span><div className="text-sm font-mono">{String(best?.epoch)}</div></div>
                  <div><span className="text-xs text-gray-500">SSL Bonus</span><div className="text-sm font-mono">{String(best?.ssl_bonus)}</div></div>
                </div>
                <div className="flex gap-2">
                  <Badge text={String(d.strategy)} color="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300" />
                  {best?.feasible ? <Badge text="Feasible" color="bg-green-100 text-green-700" /> : <Badge text="Infeasible" color="bg-red-100 text-red-700" />}
                </div>
              </Card>
              <Card title="Search Progress">
                <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                  <div><span className="text-xs text-gray-500">Evaluations Used</span><div className="text-lg font-bold text-cyan-600">{String(progress?.evaluations_used)}</div></div>
                  <div><span className="text-xs text-gray-500">Budget Utilization</span><div className="text-lg font-bold text-blue-600">{String(progress?.budget_utilization)}</div></div>
                  <div><span className="text-xs text-gray-500">Best Found At</span><div className="text-lg font-bold text-purple-600">Eval {String(progress?.best_found_at_eval)}</div></div>
                </div>
                {progress?.convergence_curve && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-500 mb-1">Convergence Curve</div>
                    <div className="flex gap-0.5 items-end h-16">
                      {(progress.convergence_curve as number[]).map((val: number, i: number) => (
                        <div key={i} className="bg-cyan-500 rounded-t flex-1 min-w-[4px]" style={{ height: `${Math.min(100, val * 100)}%` }} title={`Eval ${i + 1}: ${val}`} />
                      ))}
                    </div>
                  </div>
                )}
              </Card>
              <Card title="Comparison vs Baseline">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <StatBar label="Random Baseline" value={Number(comparison?.random_baseline ?? 0)} color="bg-gray-500" />
                    <StatBar label="NAS Improvement" value={Number(comparison?.nas_improvement ?? 0)} color="bg-cyan-500" />
                  </div>
                  <div>
                    <StatBar label="SSL Improvement" value={Number(comparison?.ssl_improvement ?? 0)} color="bg-violet-500" />
                    <StatBar label="Total Improvement" value={Number(comparison?.total_improvement ?? 0)} color="bg-emerald-500" />
                  </div>
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
      <Card title="Graph Neural Architecture Search v4 Engine">
        <button
          className="rounded bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 mb-4"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            fetch(`${API}/nas-v4/summary`)
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
          <div className="bg-slate-50 dark:bg-slate-900/20 rounded p-3">
            <div className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Hardware Profiling</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>6 hardware targets (CPU/GPU Consumer/GPU DC/TPU/Edge/FPGA)</div>
              <div>Compute, memory, bandwidth bottleneck analysis</div>
              <div>Batch size optimization with energy profiling</div>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-3">
            <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Cell Search & Constraints</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>6 cell types (GCN/GAT/GIN/GraphSAGE/GTN/PNA)</div>
              <div>Pareto-optimal candidate selection</div>
              <div>6 constraint types with feasibility analysis</div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
            <div className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Federated & Multimodal</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>6 federated strategies with 4 aggregation methods</div>
              <div>Privacy-preserving NAS with differential privacy</div>
              <div>6 multimodal arch types with cross-modal fusion</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const tabRenderers: Record<Tab, () => JSX.Element> = {
    Hardware: renderHardware,
    "Cell Search": renderCellSearch,
    Federated: renderFederated,
    Constraints: renderConstraints,
    Multimodal: renderMultimodal,
    Search: renderSearch,
    Summary: renderSummary,
  };

  const tabColors: Record<Tab, string> = {
    Hardware: "bg-slate-500",
    "Cell Search": "bg-emerald-500",
    Federated: "bg-blue-500",
    Constraints: "bg-amber-500",
    Multimodal: "bg-violet-500",
    Search: "bg-cyan-500",
    Summary: "bg-gray-500",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Graph Neural Architecture Search v4 Engine</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.216 — Hardware-aware federated NAS with multimodal + causal + SSL constraints</p>
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
