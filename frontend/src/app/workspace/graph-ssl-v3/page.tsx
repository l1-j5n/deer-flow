"use client";

import { useState } from "react";

// Enums mirror backend
const PRETEXT_TYPES = ["contrastive", "generative", "predictive", "reasoning_guided", "causal_structure", "multi_view"];
const ENCODER_TYPES = ["gcn", "gat", "gin", "sage", "gine", "pna"];
const SEARCH_METHODS = ["darts", "snas", "gdarts", "pdarts", "fbnet"];
const SCALES = ["node", "edge", "subgraph", "graph", "path", "motif"];
const LOSS_TYPES = ["info_nce", "triplet", "jensen_shannon", "barlow_twins", "vicreg", "byol"];
const CL_MODES = ["ewc", "si", "mas", "progressive", "packnet", "reasoning_aware"];
const QUALITY_METRICS = ["transferability", "discriminability", "robustness", "fairness", "calibration", "completeness"];
const CERT_LEVELS = ["strict", "standard", "relaxed"];
const PIPELINE_STRATEGIES = ["curriculum", "self_paced", "transfer_guided", "difficulty_aware", "budget_aware", "adaptive"];

const TABS = [
  { id: "pretext", label: "Pretext", icon: "🎯" },
  { id: "encoder", label: "Encoder", icon: "🏗" },
  { id: "multiscale", label: "Multi-Scale", icon: "🔬" },
  { id: "cl", label: "CL Pretrain", icon: "🔄" },
  { id: "certify", label: "Certify", icon: "✅" },
  { id: "pipeline", label: "Pipeline", icon: "⚡" },
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
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">
        {label}: <span className="text-blue-400">{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}

function BoolField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-blue-500"
      />
      {label}
    </label>
  );
}

function ResultPanel({ data }: { data: ApiResult | null }) {
  if (!data) return <div className="text-gray-500 text-sm italic">No results yet. Run an analysis.</div>;
  return (
    <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-xs text-green-300 overflow-auto max-h-96 whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-lg font-bold text-blue-400">{value}</div>
    </div>
  );
}

// ── Tab: Pretext Tasks ──────────────────────────────────────────────────────

function PretextTab() {
  const [pretextType, setPretextType] = useState("reasoning_guided");
  const [numTasks, setNumTasks] = useState(5);
  const [reasoning, setReasoning] = useState(true);
  const [automl, setAutoml] = useState(true);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pretext_type: pretextType,
        num_tasks: String(numTasks),
        reasoning_augment: String(reasoning),
        automl_schedule: String(automl),
      });
      const res = await fetch(`/api/electron/kg/ssl-v3/pretext?${params}`, { method: "POST" });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Pretext Type" value={pretextType} options={PRETEXT_TYPES} onChange={setPretextType} />
        <NumberField label="Num Tasks" value={numTasks} min={1} max={20} step={1} onChange={setNumTasks} />
        <BoolField label="Reasoning Augmentation (Reasoning v2)" value={reasoning} onChange={setReasoning} />
        <BoolField label="AutoML Schedule (AutoML v3)" value={automl} onChange={setAutoml} />
      </div>
      <button
        onClick={run}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Running..." : "Run Pretext Tasks"}
      </button>
      <ResultPanel data={result} />
    </div>
  );
}

// ── Tab: Encoder Search ─────────────────────────────────────────────────────

function EncoderTab() {
  const [encoderType, setEncoderType] = useState("gat");
  const [searchMethod, setSearchMethod] = useState("darts");
  const [numLayers, setNumLayers] = useState(4);
  const [hiddenDim, setHiddenDim] = useState(256);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        encoder_type: encoderType,
        search_method: searchMethod,
        num_layers: String(numLayers),
        hidden_dim: String(hiddenDim),
      });
      const res = await fetch(`/api/electron/kg/ssl-v3/encoder?${params}`, { method: "POST" });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Encoder Type" value={encoderType} options={ENCODER_TYPES} onChange={setEncoderType} />
        <SelectField label="Search Method" value={searchMethod} options={SEARCH_METHODS} onChange={setSearchMethod} />
        <NumberField label="Num Layers" value={numLayers} min={1} max={12} step={1} onChange={setNumLayers} />
        <NumberField label="Hidden Dim" value={hiddenDim} min={64} max={1024} step={64} onChange={setHiddenDim} />
      </div>
      <button
        onClick={run}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Searching..." : "Search Encoder"}
      </button>
      <ResultPanel data={result} />
    </div>
  );
}

// ── Tab: Multi-Scale ────────────────────────────────────────────────────────

function MultiScaleTab() {
  const [primaryScale, setPrimaryScale] = useState("graph");
  const [lossType, setLossType] = useState("info_nce");
  const [numScales, setNumScales] = useState(4);
  const [crossAttn, setCrossAttn] = useState(true);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        primary_scale: primaryScale,
        loss_type: lossType,
        num_scales: String(numScales),
        cross_scale_attn: String(crossAttn),
      });
      const res = await fetch(`/api/electron/kg/ssl-v3/multi-scale?${params}`, { method: "POST" });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Primary Scale" value={primaryScale} options={SCALES} onChange={setPrimaryScale} />
        <SelectField label="Loss Type" value={lossType} options={LOSS_TYPES} onChange={setLossType} />
        <NumberField label="Num Scales" value={numScales} min={1} max={6} step={1} onChange={setNumScales} />
        <BoolField label="Cross-Scale Attention" value={crossAttn} onChange={setCrossAttn} />
      </div>
      <button
        onClick={run}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Computing..." : "Run Multi-Scale SSL"}
      </button>
      <ResultPanel data={result} />
    </div>
  );
}

// ── Tab: CL Pretrain ────────────────────────────────────────────────────────

function CLPretrainTab() {
  const [clMode, setClMode] = useState("reasoning_aware");
  const [numTasks, setNumTasks] = useState(5);
  const [reprDim, setReprDim] = useState(256);
  const [forgetting, setForgetting] = useState(true);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        cl_mode: clMode,
        num_tasks: String(numTasks),
        representation_dim: String(reprDim),
        forgetting_resist: String(forgetting),
      });
      const res = await fetch(`/api/electron/kg/ssl-v3/cl-pretrain?${params}`, { method: "POST" });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="CL Mode" value={clMode} options={CL_MODES} onChange={setClMode} />
        <NumberField label="Num Tasks" value={numTasks} min={2} max={20} step={1} onChange={setNumTasks} />
        <NumberField label="Repr Dim" value={reprDim} min={64} max={1024} step={64} onChange={setReprDim} />
        <BoolField label="Forgetting Resistance (CL v3)" value={forgetting} onChange={setForgetting} />
      </div>
      <button
        onClick={run}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Pretraining..." : "Run CL Pretraining"}
      </button>
      <ResultPanel data={result} />
    </div>
  );
}

// ── Tab: Certify ────────────────────────────────────────────────────────────

function CertifyTab() {
  const [metric, setMetric] = useState("transferability");
  const [numDownstream, setNumDownstream] = useState(4);
  const [certLevel, setCertLevel] = useState("standard");
  const [compareSup, setCompareSup] = useState(true);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        quality_metric: metric,
        num_downstream: String(numDownstream),
        certification_level: certLevel,
        compare_supervised: String(compareSup),
      });
      const res = await fetch(`/api/electron/kg/ssl-v3/certify?${params}`, { method: "POST" });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Quality Metric" value={metric} options={QUALITY_METRICS} onChange={setMetric} />
        <SelectField label="Cert Level" value={certLevel} options={CERT_LEVELS} onChange={setCertLevel} />
        <NumberField label="Downstream Tasks" value={numDownstream} min={1} max={10} step={1} onChange={setNumDownstream} />
        <BoolField label="Compare with Supervised" value={compareSup} onChange={setCompareSup} />
      </div>
      <button
        onClick={run}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Certifying..." : "Certify SSL Quality"}
      </button>
      <ResultPanel data={result} />
    </div>
  );
}

// ── Tab: Pipeline ───────────────────────────────────────────────────────────

function PipelineTab() {
  const [strategy, setStrategy] = useState("adaptive");
  const [budget, setBudget] = useState(8);
  const [target, setTarget] = useState(0.90);
  const [earlyStop, setEarlyStop] = useState(true);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        strategy: strategy,
        budget_hours: String(budget),
        target_quality: String(target),
        auto_early_stop: String(earlyStop),
      });
      const res = await fetch(`/api/electron/kg/ssl-v3/pipeline?${params}`, { method: "POST" });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Strategy" value={strategy} options={PIPELINE_STRATEGIES} onChange={setStrategy} />
        <NumberField label="Budget (hrs)" value={budget} min={1} max={48} step={1} onChange={setBudget} />
        <NumberField label="Target Quality" value={target} min={0.5} max={1.0} step={0.01} onChange={setTarget} />
        <BoolField label="Auto Early Stop" value={earlyStop} onChange={setEarlyStop} />
      </div>
      <button
        onClick={run}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Running Pipeline..." : "Run SSL Pipeline"}
      </button>
      <ResultPanel data={result} />
    </div>
  );
}

// ── Tab: Summary ────────────────────────────────────────────────────────────

function SummaryTab() {
  const [summary, setSummary] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/electron/kg/ssl-v3/summary");
      setSummary(await res.json());
    } catch (e) {
      setSummary({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={fetchSummary}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50 w-fit"
      >
        {loading ? "Loading..." : "Load SSL v3 Summary"}
      </button>
      {summary && !("error" in summary) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Version" value={(summary.version as string) || "-"} />
          <StatCard label="Pretext Cached" value={(summary.pretext_cached as number) || 0} />
          <StatCard label="Encoder Cached" value={(summary.encoder_cached as number) || 0} />
          <StatCard label="Pipeline Cached" value={(summary.pipeline_cached as number) || 0} />
          <StatCard label="Pretext Types" value={((summary.pretext_types as string[]) || []).length} />
          <StatCard label="Encoder Types" value={((summary.encoder_types as string[]) || []).length} />
          <StatCard label="Scales" value={((summary.scales as string[]) || []).length} />
          <StatCard label="CL Modes" value={((summary.cl_modes as string[]) || []).length} />
        </div>
      )}
      <ResultPanel data={summary} />
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function GraphSSLv3Page() {
  const [activeTab, setActiveTab] = useState<TabId>("pretext");

  const renderTab = () => {
    switch (activeTab) {
      case "pretext": return <PretextTab />;
      case "encoder": return <EncoderTab />;
      case "multiscale": return <MultiScaleTab />;
      case "cl": return <CLPretrainTab />;
      case "certify": return <CertifyTab />;
      case "pipeline": return <PipelineTab />;
      case "summary": return <SummaryTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Graph Self-Supervised Learning v3</h1>
        <p className="text-sm text-gray-400 mb-4">
          Reasoning-Augmented + NAS-Optimized + CL-Compatible SSL with Quality Certification
        </p>

        <div className="flex gap-1 border-b border-gray-700 mb-4 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {renderTab()}
      </div>
    </div>
  );
}
