"use client";

import { useState } from "react";

// Enums mirror backend
const RULE_TYPES = ["implication", "equivalence", "exclusion", "dependency", "temporal", "causal"];
const NEURO_METHODS = ["embedding_guided", "rule_constrained", "attention_fused", "hybrid_gate", "progressive", "teacher_student"];
const HOP_STRATEGIES = ["bfs", "dfs", "beam", "mcts", "greedy", "adaptive"];
const QUERY_TYPES = ["conjunction", "disjunction", "negation", "projection", "existential", "counting"];
const HYPOTHESIS_TYPES = ["missing_link", "wrong_label", "hidden_node", "latent_relation", "temporal_shift", "measurement_error"];
const EXPLANATION_TYPES = ["trace", "proof", "analogy", "counterfactual", "statistical", "narrative"];
const DETAIL_LEVELS = ["low", "medium", "high"];

const TABS = [
  { id: "symbolic", label: "Symbolic Logic", icon: "⛓" },
  { id: "neuro", label: "Neuro-Symbolic", icon: "🧠" },
  { id: "multihop", label: "Multi-Hop", icon: "🔀" },
  { id: "query", label: "Query Decomp", icon: "🔍" },
  { id: "abductive", label: "Abductive", icon: "💡" },
  { id: "explain", label: "Explanation", icon: "📝" },
  { id: "summary", label: "Summary", icon: "📊" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ApiResult {
  [key: string]: unknown;
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[] | string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <select
        className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">
        {label}: {value}
      </label>
      <input
        type="range"
        min={min ?? 0}
        max={max ?? 100}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <textarea
        className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-y"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows ?? 2}
      />
    </div>
  );
}

function ResultPanel({ data }: { data: ApiResult | null }) {
  if (!data) return <div className="text-gray-500 text-sm italic">No results yet. Run a query to see output.</div>;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-[520px] overflow-auto">
      <pre className="text-xs text-green-300 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-center">
      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-lg font-bold text-blue-400 mt-0.5">{value}</div>
    </div>
  );
}

// ─── Tab Panels ────────────────────────────────────────────────

function SymbolicTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [inferenceMode, setInferenceMode] = useState("forward");
  const [maxDepth, setMaxDepth] = useState(5);
  const [confThreshold, setConfThreshold] = useState(0.5);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reasoning-v2/symbolic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          inference_mode: inferenceMode,
          max_depth: maxDepth,
          confidence_threshold: confThreshold,
        }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <TextField label="Graph ID" value={graphId} onChange={setGraphId} />
        <SelectField label="Inference Mode" value={inferenceMode} options={["forward", "backward", "mixed"]} onChange={setInferenceMode} />
        <NumberField label="Max Depth" value={maxDepth} min={1} max={20} onChange={setMaxDepth} />
        <NumberField label="Confidence Threshold" value={confThreshold} min={0} max={1} step={0.05} onChange={setConfThreshold} />
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-lg py-2 text-sm font-medium transition"
        >
          {loading ? "Running..." : "Run Symbolic Inference"}
        </button>
      </div>
      <div>
        {result && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard label="Rules" value={String((result as Record<string, unknown>).total_rules ?? 0)} />
            <StatCard label="Facts Derived" value={String((result as Record<string, unknown>).total_facts_derived ?? 0)} />
            <StatCard label="Chain Length" value={String((result as Record<string, unknown>).inference_chain_length ?? 0)} />
          </div>
        )}
        <ResultPanel data={result} />
      </div>
    </div>
  );
}

function NeuroSymbolicTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [method, setMethod] = useState("embedding_guided");
  const [embeddingDim, setEmbeddingDim] = useState(128);
  const [ruleWeight, setRuleWeight] = useState(0.4);
  const [neuralWeight, setNeuralWeight] = useState(0.6);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reasoning-v2/neuro-symbolic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          method,
          embedding_dim: embeddingDim,
          rule_weight: ruleWeight,
          neural_weight: neuralWeight,
        }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <TextField label="Graph ID" value={graphId} onChange={setGraphId} />
        <SelectField label="Integration Method" value={method} options={NEURO_METHODS} onChange={setMethod} />
        <NumberField label="Embedding Dim" value={embeddingDim} min={16} max={512} step={16} onChange={setEmbeddingDim} />
        <NumberField label="Rule Weight" value={ruleWeight} min={0} max={1} step={0.05} onChange={setRuleWeight} />
        <NumberField label="Neural Weight" value={neuralWeight} min={0} max={1} step={0.05} onChange={setNeuralWeight} />
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded-lg py-2 text-sm font-medium transition"
        >
          {loading ? "Running..." : "Run Neuro-Symbolic Integration"}
        </button>
      </div>
      <div>
        {result && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard label="Nodes" value={String((result as Record<string, unknown>).num_nodes ?? 0)} />
            <StatCard label="Agreement" value={String(((result as Record<string, unknown>).consistency as Record<string, unknown>)?.neural_symbolic_agreement ?? "N/A")} />
            <StatCard label="Integrated Acc" value={String(((result as Record<string, unknown>).performance as Record<string, unknown>)?.accuracy_integrated ?? "N/A")} />
          </div>
        )}
        <ResultPanel data={result} />
      </div>
    </div>
  );
}

function MultiHopTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [source, setSource] = useState("entity_start");
  const [target, setTarget] = useState("entity_target");
  const [strategy, setStrategy] = useState("beam");
  const [maxHops, setMaxHops] = useState(5);
  const [beamWidth, setBeamWidth] = useState(5);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reasoning-v2/multi-hop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, source, target, strategy, max_hops: maxHops, beam_width: beamWidth }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <TextField label="Graph ID" value={graphId} onChange={setGraphId} />
        <TextField label="Source Entity" value={source} onChange={setSource} />
        <TextField label="Target Entity" value={target} onChange={setTarget} />
        <SelectField label="Strategy" value={strategy} options={HOP_STRATEGIES} onChange={setStrategy} />
        <NumberField label="Max Hops" value={maxHops} min={1} max={15} onChange={setMaxHops} />
        <NumberField label="Beam Width" value={beamWidth} min={1} max={20} onChange={setBeamWidth} />
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 text-white rounded-lg py-2 text-sm font-medium transition"
        >
          {loading ? "Searching..." : "Find Multi-Hop Paths"}
        </button>
      </div>
      <div>
        {result && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard label="Paths Found" value={String((result as Record<string, unknown>).paths_found ?? 0)} />
            <StatCard label="Best Score" value={String((result as Record<string, unknown>).best_path_score ?? 0)} />
            <StatCard label="Evidence" value={String(((result as Record<string, unknown>).reasoning_summary as Record<string, unknown>)?.total_evidence ?? 0)} />
          </div>
        )}
        <ResultPanel data={result} />
      </div>
    </div>
  );
}

function QueryTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [query, setQuery] = useState("Find all entities related to high-risk nodes within 3 hops");
  const [queryType, setQueryType] = useState("conjunction");
  const [maxSub, setMaxSub] = useState(8);
  const [parallel, setParallel] = useState(true);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reasoning-v2/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, query, query_type: queryType, max_subqueries: maxSub, parallel }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <TextField label="Graph ID" value={graphId} onChange={setGraphId} />
        <TextField label="Query" value={query} onChange={setQuery} rows={3} />
        <SelectField label="Query Type" value={queryType} options={QUERY_TYPES} onChange={setQueryType} />
        <NumberField label="Max Sub-Queries" value={maxSub} min={2} max={20} onChange={setMaxSub} />
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={parallel} onChange={(e) => setParallel(e.target.checked)} className="accent-blue-500" />
          Parallel Execution
        </label>
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 text-white rounded-lg py-2 text-sm font-medium transition"
        >
          {loading ? "Decomposing..." : "Decompose & Execute Query"}
        </button>
      </div>
      <div>
        {result && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard label="Sub-Queries" value={String((result as Record<string, unknown>).num_sub_queries ?? 0)} />
            <StatCard label="Depth" value={String(((result as Record<string, unknown>).statistics as Record<string, unknown>)?.decomposition_depth ?? 0)} />
            <StatCard label="Confidence" value={String(((result as Record<string, unknown>).aggregated_answer as Record<string, unknown>)?.overall_confidence ?? "N/A")} />
          </div>
        )}
        <ResultPanel data={result} />
      </div>
    </div>
  );
}

function AbductiveTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [observations, setObservations] = useState("Unexpected transaction pattern detected\nAnomaly score spike in cluster_7\nTemporal correlation with known_risk_entity");
  const [hypTypes, setHypTypes] = useState("missing_link,hidden_node,latent_relation");
  const [maxHyp, setMaxHyp] = useState(10);
  const [plausibility, setPlausibility] = useState(0.5);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reasoning-v2/abductive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          observations: observations.split("\n").filter(Boolean),
          hypothesis_types: hypTypes.split(",").map((s) => s.trim()).filter(Boolean),
          max_hypotheses: maxHyp,
          plausibility_threshold: plausibility,
        }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <TextField label="Graph ID" value={graphId} onChange={setGraphId} />
        <TextField label="Observations (one per line)" value={observations} onChange={setObservations} rows={4} />
        <TextField label="Hypothesis Types (comma-sep)" value={hypTypes} onChange={setHypTypes} />
        <NumberField label="Max Hypotheses" value={maxHyp} min={1} max={20} onChange={setMaxHyp} />
        <NumberField label="Plausibility Threshold" value={plausibility} min={0} max={1} step={0.05} onChange={setPlausibility} />
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 text-white rounded-lg py-2 text-sm font-medium transition"
        >
          {loading ? "Generating..." : "Generate Hypotheses"}
        </button>
      </div>
      <div>
        {result && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard label="Generated" value={String((result as Record<string, unknown>).num_hypotheses_generated ?? 0)} />
            <StatCard label="Viable" value={String((result as Record<string, unknown>).num_viable_hypotheses ?? 0)} />
            <StatCard label="Best" value={String(((result as Record<string, unknown>).statistics as Record<string, unknown>)?.best_plausibility ?? 0)} />
          </div>
        )}
        <ResultPanel data={result} />
      </div>
    </div>
  );
}

function ExplainTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [explanationType, setExplanationType] = useState("trace");
  const [detailLevel, setDetailLevel] = useState("medium");
  const [audience, setAudience] = useState("analyst");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reasoning-v2/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          explanation_type: explanationType,
          detail_level: detailLevel,
          audience,
        }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-3">
        <TextField label="Graph ID" value={graphId} onChange={setGraphId} />
        <SelectField label="Explanation Type" value={explanationType} options={EXPLANATION_TYPES} onChange={setExplanationType} />
        <SelectField label="Detail Level" value={detailLevel} options={DETAIL_LEVELS} onChange={setDetailLevel} />
        <SelectField label="Audience" value={audience} options={["analyst", "developer", "manager", "researcher"]} onChange={setAudience} />
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-gray-600 text-white rounded-lg py-2 text-sm font-medium transition"
        >
          {loading ? "Generating..." : "Generate Explanation"}
        </button>
      </div>
      <div>
        {result && (
          <div className="grid grid-cols-3 gap-2 mb-3">
            <StatCard label="Steps" value={String((result as Record<string, unknown>).num_steps ?? 0)} />
            <StatCard label="Confidence" value={String(((result as Record<string, unknown>).confidence_visualization as Record<string, unknown>)?.overall_confidence ?? "N/A")} />
            <StatCard label="Trend" value={String(((result as Record<string, unknown>).confidence_visualization as Record<string, unknown>)?.confidence_trend ?? "N/A")} />
          </div>
        )}
        {result && (result as Record<string, unknown>).natural_language && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-3 text-sm text-gray-200 leading-relaxed">
            <div className="text-xs text-gray-400 mb-1 font-medium">Natural Language Explanation</div>
            {String((result as Record<string, unknown>).natural_language)}
          </div>
        )}
        <ResultPanel data={result} />
      </div>
    </div>
  );
}

async function fetchSummary(): Promise<ApiResult> {
  const res = await fetch("/api/reasoning-v2/summary");
  return res.json();
}

function SummaryTab() {
  const [data, setData] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setData(await fetchSummary());
    } catch {
      setData(null);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={load}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white rounded-lg px-6 py-2 text-sm font-medium transition"
      >
        {loading ? "Loading..." : "Load Engine Summary"}
      </button>
      {data && (
        <>
          <div className="grid grid-cols-6 gap-2">
            <StatCard label="Symbolic" value={String((data as Record<string, unknown>).symbolic_cached ?? 0)} />
            <StatCard label="Neuro-Sym" value={String((data as Record<string, unknown>).neuro_symbolic_cached ?? 0)} />
            <StatCard label="Multi-Hop" value={String((data as Record<string, unknown>).multihop_cached ?? 0)} />
            <StatCard label="Query" value={String((data as Record<string, unknown>).query_cached ?? 0)} />
            <StatCard label="Abductive" value={String((data as Record<string, unknown>).abductive_cached ?? 0)} />
            <StatCard label="Explain" value={String((data as Record<string, unknown>).explain_cached ?? 0)} />
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">
              {(data as Record<string, unknown>).version} — {(data as Record<string, unknown>).feature}
            </h3>
            <p className="text-xs text-gray-400 mb-3">{(data as Record<string, unknown>).subtitle}</p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-gray-400 mb-1">Rule Types:</div>
                <div className="flex flex-wrap gap-1">
                  {((data as Record<string, unknown>).rule_types as string[])?.map((r) => (
                    <span key={r} className="bg-gray-700 px-2 py-0.5 rounded text-gray-300">{r}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Neuro-Symbolic Methods:</div>
                <div className="flex flex-wrap gap-1">
                  {((data as Record<string, unknown>).neuro_symbolic_methods as string[])?.map((m) => (
                    <span key={m} className="bg-gray-700 px-2 py-0.5 rounded text-gray-300">{m}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Query Types:</div>
                <div className="flex flex-wrap gap-1">
                  {((data as Record<string, unknown>).query_types as string[])?.map((q) => (
                    <span key={q} className="bg-gray-700 px-2 py-0.5 rounded text-gray-300">{q}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Integration:</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(((data as Record<string, unknown>).integration as Record<string, string>) ?? {}).map(([k, v]) => (
                    <span key={k} className="bg-blue-900/40 px-2 py-0.5 rounded text-blue-300">{k}: {v}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function GraphReasoningV2Page() {
  const [activeTab, setActiveTab] = useState<TabId>("symbolic");

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-lg">
            🧠
          </div>
          <div>
            <h1 className="text-xl font-bold">Graph Reasoning v2 Engine</h1>
            <p className="text-xs text-gray-400">Neuro-Symbolic Reasoning with Multi-Hop Inference — v1.205.0</p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-gray-800 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm whitespace-nowrap transition rounded-t-lg ${
                activeTab === tab.id
                  ? "bg-gray-800 text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "symbolic" && <SymbolicTab />}
        {activeTab === "neuro" && <NeuroSymbolicTab />}
        {activeTab === "multihop" && <MultiHopTab />}
        {activeTab === "query" && <QueryTab />}
        {activeTab === "abductive" && <AbductiveTab />}
        {activeTab === "explain" && <ExplainTab />}
        {activeTab === "summary" && <SummaryTab />}
      </div>
    </div>
  );
}
