"use client";

import { useState } from "react";

// Enums mirror backend
const TASK_TYPES = ["node_classification", "graph_classification", "link_prediction", "edge_classification", "graph_regression", "node_regression"];
const ADAPTATION_METHODS = ["automl_guided", "nas_aware", "reasoning_augmented", "meta_learned", "hybrid", "adaptive"];
const REPLAY_POLICIES = ["uncertainty_weighted", "reasoning_guided", "diversity_preserving", "prototype_based", "gradient_gated", "coreset"];
const PRIVACY_LEVELS = ["none", "local_dp", "global_dp", "federated_dp", "hybrid_dp", "reasoning_aware_dp"];
const TRANSFER_MODES = ["forward", "backward", "lateral", "zero_shot", "negative", "bidirectional"];
const FORGETTING_BOUNDS = ["accuracy", "bwt", "fwt", "remembering", "learning_rate", "composite"];
const CONFIDENCE_LEVELS = ["certified", "high", "medium", "low", "uncertified"];
const CELL_TYPES = ["gcn", "gat", "gin", "sage", "gine", "custom"];
const SEARCH_METHODS = ["darts", "snas", "gdarts", "pdarts", "fbnet"];
const GRAPH_DOMAINS = ["social", "citation", "biological", "molecular", "financial", "knowledge"];

const TABS = [
  { id: "task", label: "Task Adapt", icon: "🎯" },
  { id: "arch", label: "Arch Evolve", icon: "🏗" },
  { id: "replay", label: "Replay", icon: "🔄" },
  { id: "privacy", label: "Privacy", icon: "🔒" },
  { id: "transfer", label: "Transfer", icon: "🔀" },
  { id: "certify", label: "Certify", icon: "✅" },
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

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`px-3 py-1 rounded text-xs font-medium ${
          value ? "bg-green-600 text-white" : "bg-gray-700 text-gray-400"
        }`}
      >
        {value ? "ON" : "OFF"}
      </button>
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

function TaskAdaptTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [taskType, setTaskType] = useState("node_classification");
  const [adaptMethod, setAdaptMethod] = useState("hybrid");
  const [numTasks, setNumTasks] = useState(5);
  const [reasoning, setReasoning] = useState(true);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cl-v3/task-adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          task_type: taskType,
          adaptation_method: adaptMethod,
          num_seen_tasks: numTasks,
          automl_pipeline: "v3",
          reasoning_integration: reasoning,
        }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <SelectField label="Task Type" value={taskType} options={TASK_TYPES} onChange={setTaskType} />
        <SelectField label="Adaptation Method" value={adaptMethod} options={ADAPTATION_METHODS} onChange={setAdaptMethod} />
        <NumberField label="Num Seen Tasks" value={numTasks} min={1} max={20} onChange={setNumTasks} />
        <ToggleField label="Reasoning Integration" value={reasoning} onChange={setReasoning} />
        <input
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white w-full focus:outline-none focus:border-blue-500"
          value={graphId}
          onChange={(e) => setGraphId(e.target.value)}
          placeholder="Graph ID"
        />
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 rounded text-sm transition-colors"
        >
          {loading ? "Running..." : "Run Task Adaptation"}
        </button>
      </div>
      <ResultPanel data={result} />
    </div>
  );
}

function ArchEvolveTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [cellType, setCellType] = useState("gat");
  const [searchMethod, setSearchMethod] = useState("darts");
  const [numTasksEvolved, setNumTasksEvolved] = useState(5);
  const [stages, setStages] = useState(5);
  const [stabilityThresh, setStabilityThresh] = useState(0.8);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cl-v3/architecture-evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          cell_type: cellType,
          search_method: searchMethod,
          num_tasks_evolved: numTasksEvolved,
          progressive_stages: stages,
          stability_threshold: stabilityThresh,
        }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <SelectField label="Cell Type" value={cellType} options={CELL_TYPES} onChange={setCellType} />
        <SelectField label="Search Method" value={searchMethod} options={SEARCH_METHODS} onChange={setSearchMethod} />
        <NumberField label="Tasks Evolved" value={numTasksEvolved} min={1} max={20} onChange={setNumTasksEvolved} />
        <NumberField label="Progressive Stages" value={stages} min={2} max={6} onChange={setStages} />
        <NumberField label="Stability Threshold" value={stabilityThresh} min={0.5} max={0.99} step={0.01} onChange={setStabilityThresh} />
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 rounded text-sm transition-colors"
        >
          {loading ? "Running..." : "Run Architecture Evolution"}
        </button>
      </div>
      <ResultPanel data={result} />
    </div>
  );
}

function ReplayTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [policy, setPolicy] = useState("reasoning_guided");
  const [bufferSize, setBufferSize] = useState(5000);
  const [numTasks, setNumTasks] = useState(5);
  const [reasoningDepth, setReasoningDepth] = useState(3);
  const [coherenceThresh, setCoherenceThresh] = useState(0.8);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cl-v3/reasoning-replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          replay_policy: policy,
          buffer_size: bufferSize,
          num_tasks: numTasks,
          reasoning_depth: reasoningDepth,
          coherence_threshold: coherenceThresh,
        }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <SelectField label="Replay Policy" value={policy} options={REPLAY_POLICIES} onChange={setPolicy} />
        <NumberField label="Buffer Size" value={bufferSize} min={100} max={50000} step={100} onChange={setBufferSize} />
        <NumberField label="Num Tasks" value={numTasks} min={1} max={20} onChange={setNumTasks} />
        <NumberField label="Reasoning Depth" value={reasoningDepth} min={1} max={10} onChange={setReasoningDepth} />
        <NumberField label="Coherence Threshold" value={coherenceThresh} min={0.5} max={0.99} step={0.01} onChange={setCoherenceThresh} />
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 rounded text-sm transition-colors"
        >
          {loading ? "Running..." : "Run Reasoning Replay"}
        </button>
      </div>
      <ResultPanel data={result} />
    </div>
  );
}

function PrivacyTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [privacyLevel, setPrivacyLevel] = useState("hybrid_dp");
  const [numTasks, setNumTasks] = useState(5);
  const [epsilonBudget, setEpsilonBudget] = useState(10.0);
  const [reasoningAware, setReasoningAware] = useState(true);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cl-v3/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          privacy_level: privacyLevel,
          num_tasks: numTasks,
          epsilon_budget: epsilonBudget,
          delta: 1e-5,
          reasoning_aware: reasoningAware,
        }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <SelectField label="Privacy Level" value={privacyLevel} options={PRIVACY_LEVELS} onChange={setPrivacyLevel} />
        <NumberField label="Num Tasks" value={numTasks} min={1} max={20} onChange={setNumTasks} />
        <NumberField label="Epsilon Budget" value={epsilonBudget} min={0.1} max={100} step={0.1} onChange={setEpsilonBudget} />
        <ToggleField label="Reasoning-Aware Privacy" value={reasoningAware} onChange={setReasoningAware} />
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 rounded text-sm transition-colors"
        >
          {loading ? "Running..." : "Run Privacy Analysis"}
        </button>
      </div>
      <ResultPanel data={result} />
    </div>
  );
}

function TransferTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [sourceDomain, setSourceDomain] = useState("citation");
  const [targetDomain, setTargetDomain] = useState("social");
  const [transferMode, setTransferMode] = useState("bidirectional");
  const [metaShot, setMetaShot] = useState(5);
  const [adaptSteps, setAdaptSteps] = useState(5);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cl-v3/cross-domain-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          source_domain: sourceDomain,
          target_domain: targetDomain,
          transfer_mode: transferMode,
          meta_shot: metaShot,
          adaptation_steps: adaptSteps,
        }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <SelectField label="Source Domain" value={sourceDomain} options={GRAPH_DOMAINS} onChange={setSourceDomain} />
        <SelectField label="Target Domain" value={targetDomain} options={GRAPH_DOMAINS} onChange={setTargetDomain} />
        <SelectField label="Transfer Mode" value={transferMode} options={TRANSFER_MODES} onChange={setTransferMode} />
        <NumberField label="Meta Shot" value={metaShot} min={1} max={20} onChange={setMetaShot} />
        <NumberField label="Adaptation Steps" value={adaptSteps} min={1} max={20} onChange={setAdaptSteps} />
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 rounded text-sm transition-colors"
        >
          {loading ? "Running..." : "Run Cross-Domain Transfer"}
        </button>
      </div>
      <ResultPanel data={result} />
    </div>
  );
}

function CertifyTab() {
  const [graphId, setGraphId] = useState("graph_1");
  const [numTasks, setNumTasks] = useState(5);
  const [forgettingBound, setForgettingBound] = useState("composite");
  const [confidenceLevel, setConfidenceLevel] = useState("high");
  const [certRounds, setCertRounds] = useState(10);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cl-v3/forgetting-certify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graph_id: graphId,
          num_tasks: numTasks,
          forgetting_bound: forgettingBound,
          confidence_level: confidenceLevel,
          certification_rounds: certRounds,
        }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <NumberField label="Num Tasks" value={numTasks} min={2} max={20} onChange={setNumTasks} />
        <SelectField label="Forgetting Bound" value={forgettingBound} options={FORGETTING_BOUNDS} onChange={setForgettingBound} />
        <SelectField label="Confidence Level" value={confidenceLevel} options={CONFIDENCE_LEVELS} onChange={setConfidenceLevel} />
        <NumberField label="Certification Rounds" value={certRounds} min={5} max={50} onChange={setCertRounds} />
        <button
          onClick={run}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 rounded text-sm transition-colors"
        >
          {loading ? "Running..." : "Run Forgetting Certification"}
        </button>
      </div>
      <ResultPanel data={result} />
    </div>
  );
}

function SummaryTab() {
  const [data, setData] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cl-v3/summary");
      setData(await res.json());
    } catch (e) {
      setData({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={fetchSummary}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-6 rounded text-sm transition-colors"
      >
        {loading ? "Loading..." : "Load CL v3 Summary"}
      </button>
      {data && !("error" in data) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard label="Version" value={String(data.version ?? "")} />
          <StatCard label="Task Adapt Cached" value={Number(data.task_adapt_cached ?? 0)} />
          <StatCard label="Arch Cached" value={Number(data.architecture_cached ?? 0)} />
          <StatCard label="Replay Cached" value={Number(data.replay_cached ?? 0)} />
          <StatCard label="Privacy Cached" value={Number(data.privacy_cached ?? 0)} />
          <StatCard label="Transfer Cached" value={Number(data.transfer_cached ?? 0)} />
          <StatCard label="Certify Cached" value={Number(data.certify_cached ?? 0)} />
          <StatCard label="Modules" value={Number((data.modules as string[])?.length ?? 0)} />
        </div>
      )}
      <ResultPanel data={data} />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

const TAB_COMPONENTS: Record<TabId, React.FC> = {
  task: TaskAdaptTab,
  arch: ArchEvolveTab,
  replay: ReplayTab,
  privacy: PrivacyTab,
  transfer: TransferTab,
  certify: CertifyTab,
  summary: SummaryTab,
};

export default function GraphContinualLearningV3Page() {
  const [activeTab, setActiveTab] = useState<TabId>("task");
  const TabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-xl">
          🔄
        </div>
        <div>
          <h1 className="text-xl font-bold">Graph Continual Learning v3</h1>
          <p className="text-xs text-gray-400">AutoML + NAS + Reasoning-Driven CL with Privacy Certification</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 border-b border-gray-800 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-t text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-gray-800 text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white hover:bg-gray-900"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <TabComponent />
      </div>
    </div>
  );
}
