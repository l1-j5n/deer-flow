"use client";

import { useState } from "react";

const API = "/api/graph";

const CAUSAL_SCALES = ["micro", "meso", "macro", "cross_scale", "hierarchical", "adaptive"];
const DISCOVERY_METHODS = ["bottom_up", "top_down", "hierarchical_pc", "multi_resolution", "scale_space", "spectral_decomposition"];
const EFFECT_TYPES = ["within_level", "between_level", "cascading", "emergent", "feedback", "composite"];
const TRANSFER_MECHANISMS = ["aggregation", "abstraction", "projection", "embedding", "compression", "summarization"];
const RESOLUTION_METRICS = ["consistency", "stability", "robustness", "coverage", "fidelity", "efficiency"];
const COMPOSITION_PATTERNS = ["sequential", "parallel", "hierarchical", "modular", "recursive", "hybrid"];

const TABS = ["Discovery", "Effects", "Transfer", "Validation", "Intervention", "Composition", "Overview"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>
      {children}
    </div>
  );
}

function StatBar({ label, value, max = 1, color = "bg-violet-500" }: { label: string; value: number; max?: number; color?: string }) {
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

function Badge({ text, color = "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

export default function GraphMultiScaleCausalPage() {
  const [tab, setTab] = useState<Tab>("Discovery");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Discovery state
  const [discoveryMethod, setDiscoveryMethod] = useState("bottom_up");
  const [targetScale, setTargetScale] = useState("hierarchical");
  const [graphId, setGraphId] = useState("graph-msc-001");

  // Effects state
  const [effectType, setEffectType] = useState("cascading");
  const [nLevels, setNLevels] = useState(3);

  // Transfer state
  const [transferMechanism, setTransferMechanism] = useState("aggregation");
  const [sourceScale, setSourceScale] = useState("micro");
  const [destScale, setDestScale] = useState("macro");

  // Validation state
  const [resMetric, setResMetric] = useState("consistency");

  // Intervention state
  const [intervSourceScale, setIntervSourceScale] = useState("micro");
  const [intervTargetScale, setIntervTargetScale] = useState("macro");
  const [budget, setBudget] = useState(10);

  // Composition state
  const [compPattern, setCompPattern] = useState("hierarchical");
  const [nScales, setNScales] = useState(3);

  async function runAnalysis(endpoint: string, body: Record<string, unknown>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) setResult(await res.json());
      else setResult({ error: `HTTP ${res.status}` });
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Multi-Scale Causal Inference</h1>
        <Badge text="v1.235" />
        <Badge text="6 Scales" color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Hierarchical causal reasoning across micro/meso/macro scales. Discovers multi-scale causal structures,
        estimates hierarchical effects, transfers knowledge between scales, and composes multi-resolution models.
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700 pb-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
              tab === t
                ? "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200 border-b-2 border-violet-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Graph ID */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Graph ID:</label>
        <input
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1 w-48"
          value={graphId}
          onChange={(e) => setGraphId(e.target.value)}
        />
      </div>

      {/* Discovery Tab */}
      {tab === "Discovery" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Discovery Configuration">
            <SelectField label="Discovery Method" value={discoveryMethod} onChange={setDiscoveryMethod} options={DISCOVERY_METHODS} />
            <SelectField label="Target Scale" value={targetScale} onChange={setTargetScale} options={CAUSAL_SCALES} />
            <button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-50"
              disabled={loading}
              onClick={() => runAnalysis("/multi-scale-causal/discovery", { graph_id: graphId, method: discoveryMethod, target_scale: targetScale })}
            >
              {loading ? "Discovering..." : "Discover Multi-Scale Structure"}
            </button>
          </Card>
          <Card title="Results">
            {result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Run discovery to see results</p>}
          </Card>
        </div>
      )}

      {/* Effects Tab */}
      {tab === "Effects" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Hierarchical Effect Configuration">
            <SelectField label="Effect Type" value={effectType} onChange={setEffectType} options={EFFECT_TYPES} />
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hierarchy Levels</label>
              <input type="number" min={2} max={10} value={nLevels} onChange={(e) => setNLevels(Number(e.target.value))}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" />
            </div>
            <button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-50"
              disabled={loading}
              onClick={() => runAnalysis("/multi-scale-causal/hierarchical-effects", { graph_id: graphId, effect_type: effectType, n_levels: nLevels })}
            >
              {loading ? "Estimating..." : "Estimate Hierarchical Effects"}
            </button>
          </Card>
          <Card title="Results">
            {result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Run estimation to see results</p>}
          </Card>
        </div>
      )}

      {/* Transfer Tab */}
      {tab === "Transfer" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Scale Transfer Configuration">
            <SelectField label="Transfer Mechanism" value={transferMechanism} onChange={setTransferMechanism} options={TRANSFER_MECHANISMS} />
            <SelectField label="Source Scale" value={sourceScale} onChange={setSourceScale} options={CAUSAL_SCALES} />
            <SelectField label="Target Scale" value={destScale} onChange={setDestScale} options={CAUSAL_SCALES} />
            <button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-50"
              disabled={loading}
              onClick={() => runAnalysis("/multi-scale-causal/scale-transfer", { graph_id: graphId, mechanism: transferMechanism, source_scale: sourceScale, target_scale: destScale })}
            >
              {loading ? "Transferring..." : "Transfer Cross-Scale"}
            </button>
          </Card>
          <Card title="Results">
            {result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Run transfer to see results</p>}
          </Card>
        </div>
      )}

      {/* Validation Tab */}
      {tab === "Validation" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Multi-Resolution Validation">
            <SelectField label="Validation Metric" value={resMetric} onChange={setResMetric} options={RESOLUTION_METRICS} />
            <button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-50"
              disabled={loading}
              onClick={() => runAnalysis("/multi-scale-causal/multi-resolution-validation", { graph_id: graphId, metric: resMetric, resolutions: [0.1, 0.25, 0.5, 0.75, 1.0] })}
            >
              {loading ? "Validating..." : "Validate Multi-Resolution"}
            </button>
          </Card>
          <Card title="Results">
            {result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Run validation to see results</p>}
          </Card>
        </div>
      )}

      {/* Intervention Tab */}
      {tab === "Intervention" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Cross-Scale Intervention Design">
            <SelectField label="Source Scale" value={intervSourceScale} onChange={setIntervSourceScale} options={CAUSAL_SCALES} />
            <SelectField label="Target Scale" value={intervTargetScale} onChange={setIntervTargetScale} options={CAUSAL_SCALES} />
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Intervention Budget</label>
              <input type="number" min={1} max={50} value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" />
            </div>
            <button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-50"
              disabled={loading}
              onClick={() => runAnalysis("/multi-scale-causal/cross-scale-intervention", { graph_id: graphId, source_scale: intervSourceScale, target_scale: intervTargetScale, intervention_budget: budget })}
            >
              {loading ? "Designing..." : "Design Interventions"}
            </button>
          </Card>
          <Card title="Results">
            {result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Run intervention design to see results</p>}
          </Card>
        </div>
      )}

      {/* Composition Tab */}
      {tab === "Composition" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Multi-Scale Composition">
            <SelectField label="Composition Pattern" value={compPattern} onChange={setCompPattern} options={COMPOSITION_PATTERNS} />
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number of Scale Levels</label>
              <input type="number" min={2} max={6} value={nScales} onChange={(e) => setNScales(Number(e.target.value))}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" />
            </div>
            <button
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors disabled:opacity-50"
              disabled={loading}
              onClick={() => runAnalysis("/multi-scale-causal/scale-composition", { graph_id: graphId, pattern: compPattern, n_scales: nScales })}
            >
              {loading ? "Composing..." : "Compose Multi-Scale Model"}
            </button>
          </Card>
          <Card title="Results">
            {result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Run composition to see results</p>}
          </Card>
        </div>
      )}

      {/* Overview Tab */}
      {tab === "Overview" && (
        <div className="space-y-4">
          <Card title="Engine Overview">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Engine:</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">Graph Multi-Scale Causal Inference</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Version:</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">v1.235.0</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Endpoints:</span>
                <p className="font-medium text-gray-800 dark:text-gray-200">7 (6 POST + 1 GET)</p>
              </div>
            </div>
          </Card>
          <Card title="Scales">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CAUSAL_SCALES.map((s) => (
                <div key={s} className="bg-violet-50 dark:bg-violet-950 rounded px-3 py-2">
                  <p className="text-xs font-medium text-violet-800 dark:text-violet-200">{s}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Enum Dimensions (6 × 6 = 36 values)">
            <div className="space-y-2">
              <StatBar label="CausalScale" value={CAUSAL_SCALES.length} max={6} color="bg-violet-500" />
              <StatBar label="ScaleDiscoveryMethod" value={DISCOVERY_METHODS.length} max={6} color="bg-blue-500" />
              <StatBar label="HierarchicalEffectType" value={EFFECT_TYPES.length} max={6} color="bg-emerald-500" />
              <StatBar label="ScaleTransferMechanism" value={TRANSFER_MECHANISMS.length} max={6} color="bg-amber-500" />
              <StatBar label="MultiResolutionMetric" value={RESOLUTION_METRICS.length} max={6} color="bg-rose-500" />
              <StatBar label="ScaleCompositionPattern" value={COMPOSITION_PATTERNS.length} max={6} color="bg-cyan-500" />
            </div>
          </Card>
          <Card title="Integration Chain">
            <div className="space-y-1 text-xs">
              <p className="text-gray-600 dark:text-gray-400">v1.230 — Causal Uncertainty Quantification</p>
              <p className="text-gray-600 dark:text-gray-400">v1.231 — Self-Supervised Causal Discovery</p>
              <p className="text-gray-600 dark:text-gray-400">v1.232 — Neuro-Symbolic Causal Meta-Learning</p>
              <p className="text-gray-600 dark:text-gray-400">v1.233 — Topology-Aware Causal Intervention</p>
              <p className="text-gray-600 dark:text-gray-400">v1.234 — Causal Explainability Synthesis</p>
              <p className="font-medium text-violet-700 dark:text-violet-300">v1.235 — Multi-Scale Causal Inference ← current</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
