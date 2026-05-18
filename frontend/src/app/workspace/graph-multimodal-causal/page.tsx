"use client";

import { useState } from "react";

const API_BASE = "/api/graph";

const CROSS_MODAL_METHODS = [
  { value: "canonical_correlation", label: "Canonical Correlation" },
  { value: "mutual_information", label: "Mutual Information" },
  { value: "kernel_independence", label: "Kernel Independence" },
  { value: "neural_causal", label: "Neural Causal" },
  { value: "granger_cross", label: "Granger Cross" },
  { value: "attention_causal", label: "Attention Causal" },
];

const ALIGNMENT_MODES = [
  { value: "contrastive", label: "Contrastive" },
  { value: "generative", label: "Generative" },
  { value: "hybrid", label: "Hybrid" },
  { value: "optimal_transport", label: "Optimal Transport" },
  { value: "graph_match", label: "Graph Match" },
  { value: "adversarial", label: "Adversarial" },
];

const GRAPH_TYPES = [
  { value: "homogeneous", label: "Homogeneous" },
  { value: "heterogeneous", label: "Heterogeneous" },
  { value: "multiplex", label: "Multiplex" },
  { value: "dynamic", label: "Dynamic" },
  { value: "attributed", label: "Attributed" },
  { value: "hierarchical", label: "Hierarchical" },
];

const GROUNDING_METHODS = [
  { value: "visual_grounding", label: "Visual Grounding" },
  { value: "textual_grounding", label: "Textual Grounding" },
  { value: "temporal_grounding", label: "Temporal Grounding" },
  { value: "structural_grounding", label: "Structural Grounding" },
  { value: "statistical_grounding", label: "Statistical Grounding" },
  { value: "joint_grounding", label: "Joint Grounding" },
];

const INTERVENTION_TYPES = [
  { value: "do_calculus", label: "Do-Calculus" },
  { value: "feature_ablation", label: "Feature Ablation" },
  { value: "modality_drop", label: "Modality Drop" },
  { value: "noise_injection", label: "Noise Injection" },
  { value: "counterfactual_swap", label: "Counterfactual Swap" },
  { value: "controlled_generation", label: "Controlled Generation" },
];

const VALIDATION_METHODS = [
  { value: "cross_prediction", label: "Cross-Prediction" },
  { value: "heldout_modality", label: "Heldout Modality" },
  { value: "consistency_check", label: "Consistency Check" },
  { value: "bootstrap_multi", label: "Bootstrap Multi" },
  { value: "permutation_multi", label: "Permutation Multi" },
  { value: "adversarial_validation", label: "Adversarial Validation" },
];

const MODALITIES = ["text", "image", "audio", "video", "sensor", "tabular"];

const TABS = ["Detect", "Align", "Graph", "Ground", "Intervene", "Validate", "Summary"];

function StatCard({ label, value, color = "blue" }: { label: string; value: string | number; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
    green: "from-green-500/20 to-green-600/10 border-green-500/30",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
    pink: "from-pink-500/20 to-pink-600/10 border-pink-500/30",
  };
  return (
    <div className={`rounded-lg border bg-gradient-to-br p-3 ${colorMap[color] || colorMap.blue}`}>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function DataBlock({ title, data, collapsed = true }: { title: string; data: unknown; collapsed?: boolean }) {
  const [open, setOpen] = useState(!collapsed);
  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 bg-gray-800/60 flex justify-between items-center hover:bg-gray-700/60"
      >
        <span className="text-sm font-medium text-gray-200">{title}</span>
        <span className="text-gray-500 text-xs">{open ? "▼" : "▶"}</span>
      </button>
      {open && (
        <pre className="p-3 text-xs text-gray-300 overflow-x-auto max-h-96 bg-gray-900/40">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function GraphMultimodalCausalPage() {
  const [activeTab, setActiveTab] = useState("Detect");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detect state
  const [detectMethod, setDetectMethod] = useState("canonical_correlation");
  const [detectNumModalities, setDetectNumModalities] = useState(4);
  const [detectNumPairs, setDetectNumPairs] = useState(12);
  const [detectSignificance, setDetectSignificance] = useState(0.05);

  // Align state
  const [alignMode, setAlignMode] = useState("contrastive");
  const [alignModalities, setAlignModalities] = useState<string[]>(["text", "image", "audio"]);
  const [alignDim, setAlignDim] = useState(128);

  // Graph state
  const [graphType, setGraphType] = useState("heterogeneous");
  const [graphModalities, setGraphModalities] = useState<string[]>(["text", "image", "audio", "video"]);
  const [graphMaxNodes, setGraphMaxNodes] = useState(30);
  const [graphThreshold, setGraphThreshold] = useState(0.3);

  // Ground state
  const [groundMethod, setGroundMethod] = useState("joint_grounding");
  const [groundClaims, setGroundClaims] = useState(6);
  const [groundThreshold, setGroundThreshold] = useState(0.5);

  // Intervene state
  const [interveneType, setInterveneType] = useState("do_calculus");
  const [interveneSource, setInterveneSource] = useState("text");
  const [interveneTarget, setInterveneTarget] = useState("image");
  const [interveneStrength, setInterveneStrength] = useState(0.5);
  const [interveneObs, setInterveneObs] = useState(20);

  // Validate state
  const [validateMethod, setValidateMethod] = useState("cross_prediction");
  const [validateClaims, setValidateClaims] = useState(5);
  const [validateBootstrap, setValidateBootstrap] = useState(1000);

  async function runEndpoint(endpoint: string, body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/multimodal-causal/summary`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleRun() {
    switch (activeTab) {
      case "Detect":
        runEndpoint("/multimodal-causal/detect", {
          method: detectMethod,
          num_modalities: detectNumModalities,
          num_pairs: detectNumPairs,
          significance_level: detectSignificance,
        });
        break;
      case "Align":
        runEndpoint("/multimodal-causal/align", {
          mode: alignMode,
          modalities: alignModalities,
          alignment_dim: alignDim,
        });
        break;
      case "Graph":
        runEndpoint("/multimodal-causal/graph", {
          graph_type: graphType,
          modalities: graphModalities,
          max_nodes: graphMaxNodes,
          causal_threshold: graphThreshold,
        });
        break;
      case "Ground":
        runEndpoint("/multimodal-causal/ground", {
          method: groundMethod,
          num_claims: groundClaims,
          modalities: alignModalities,
          evidence_threshold: groundThreshold,
        });
        break;
      case "Intervene":
        runEndpoint("/multimodal-causal/intervene", {
          intervention_type: interveneType,
          source_modality: interveneSource,
          target_modality: interveneTarget,
          intervention_strength: interveneStrength,
          num_observations: interveneObs,
        });
        break;
      case "Validate":
        runEndpoint("/multimodal-causal/validate", {
          method: validateMethod,
          num_causal_claims: validateClaims,
          num_bootstrap: validateBootstrap,
          modalities: alignModalities,
        });
        break;
      case "Summary":
        fetchSummary();
        break;
    }
  }

  function toggleModality(list: string[], setList: (v: string[]) => void, mod: string) {
    setList(list.includes(mod) ? list.filter((m) => m !== mod) : [...list, mod]);
  }

  function renderDetectControls() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Detection Method</label>
          <select
            value={detectMethod}
            onChange={(e) => setDetectMethod(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
          >
            {CROSS_MODAL_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Modalities</label>
            <input type="number" min={2} max={6} value={detectNumModalities} onChange={(e) => setDetectNumModalities(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Pairs</label>
            <input type="number" min={1} max={30} value={detectNumPairs} onChange={(e) => setDetectNumPairs(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Significance α</label>
            <input type="number" step={0.01} min={0.01} max={0.2} value={detectSignificance} onChange={(e) => setDetectSignificance(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
        </div>
      </div>
    );
  }

  function renderAlignControls() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Alignment Mode</label>
          <select value={alignMode} onChange={(e) => setAlignMode(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
            {ALIGNMENT_MODES.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Modalities</label>
          <div className="flex flex-wrap gap-2">
            {MODALITIES.map((mod) => (
              <button
                key={mod}
                onClick={() => toggleModality(alignModalities, setAlignModalities, mod)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  alignModalities.includes(mod)
                    ? "bg-blue-600/30 border-blue-500 text-blue-300"
                    : "bg-gray-800 border-gray-600 text-gray-400"
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Alignment Dimension</label>
          <input type="number" min={32} max={512} value={alignDim} onChange={(e) => setAlignDim(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
        </div>
      </div>
    );
  }

  function renderGraphControls() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Graph Type</label>
          <select value={graphType} onChange={(e) => setGraphType(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
            {GRAPH_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1">Modalities</label>
          <div className="flex flex-wrap gap-2">
            {MODALITIES.map((mod) => (
              <button
                key={mod}
                onClick={() => toggleModality(graphModalities, setGraphModalities, mod)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  graphModalities.includes(mod)
                    ? "bg-purple-600/30 border-purple-500 text-purple-300"
                    : "bg-gray-800 border-gray-600 text-gray-400"
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Max Nodes</label>
            <input type="number" min={10} max={100} value={graphMaxNodes} onChange={(e) => setGraphMaxNodes(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Causal Threshold</label>
            <input type="number" step={0.05} min={0.1} max={0.9} value={graphThreshold} onChange={(e) => setGraphThreshold(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
        </div>
      </div>
    );
  }

  function renderGroundControls() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Grounding Method</label>
          <select value={groundMethod} onChange={(e) => setGroundMethod(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
            {GROUNDING_METHODS.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Num Claims</label>
            <input type="number" min={1} max={20} value={groundClaims} onChange={(e) => setGroundClaims(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Evidence Threshold</label>
            <input type="number" step={0.05} min={0.1} max={0.9} value={groundThreshold} onChange={(e) => setGroundThreshold(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
        </div>
      </div>
    );
  }

  function renderInterveneControls() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Intervention Type</label>
          <select value={interveneType} onChange={(e) => setInterveneType(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
            {INTERVENTION_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Source Modality</label>
            <select value={interveneSource} onChange={(e) => setInterveneSource(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
              {MODALITIES.map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Target Modality</label>
            <select value={interveneTarget} onChange={(e) => setInterveneTarget(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
              {MODALITIES.map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Intervention Strength</label>
            <input type="number" step={0.1} min={0.1} max={1.0} value={interveneStrength} onChange={(e) => setInterveneStrength(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Observations</label>
            <input type="number" min={5} max={100} value={interveneObs} onChange={(e) => setInterveneObs(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
        </div>
      </div>
    );
  }

  function renderValidateControls() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Validation Method</label>
          <select value={validateMethod} onChange={(e) => setValidateMethod(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white">
            {VALIDATION_METHODS.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Causal Claims</label>
            <input type="number" min={1} max={20} value={validateClaims} onChange={(e) => setValidateClaims(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Bootstrap Samples</label>
            <input type="number" min={100} max={10000} value={validateBootstrap} onChange={(e) => setValidateBootstrap(+e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white" />
          </div>
        </div>
      </div>
    );
  }

  function renderControls() {
    switch (activeTab) {
      case "Detect": return renderDetectControls();
      case "Align": return renderAlignControls();
      case "Graph": return renderGraphControls();
      case "Ground": return renderGroundControls();
      case "Intervene": return renderInterveneControls();
      case "Validate": return renderValidateControls();
      default: return <p className="text-gray-400 text-sm">Click &quot;Run&quot; to fetch engine summary.</p>;
    }
  }

  function renderResult() {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          <span className="ml-3 text-gray-400">Processing...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">Error: {error}</p>
        </div>
      );
    }
    if (!result) return null;

    // Summary tab
    if (activeTab === "Summary") {
      const caches = result.caches as Record<string, number> ?? {};
      const enums = result.enums as Record<string, string[]> ?? {};
      const integration = result.integration as Record<string, string> ?? {};
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Engine" value={String(result.version ?? "")} color="blue" />
            <StatCard label="Modules" value={String((result.modules as string[])?.length ?? 0)} color="green" />
            <StatCard label="Caches" value={Object.values(caches).reduce((a, b) => a + b, 0)} color="purple" />
          </div>
          <DataBlock title="Enums" data={enums} />
          <DataBlock title="Integration" data={integration} />
          <DataBlock title="Modalities" data={result.modalities} />
        </div>
      );
    }

    // Detect result
    if (activeTab === "Detect") {
      const pairs = (result.causal_pairs as Record<string, unknown>[]) ?? [];
      const sig = (result.significant_pairs as Record<string, unknown>[]) ?? [];
      const coverage = result.modality_coverage as Record<string, unknown> ?? {};
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Pairs Analyzed" value={result.num_pairs_analyzed ?? 0} color="blue" />
            <StatCard label="Significant" value={sig.length} color="green" />
            <StatCard label="Discovery Rate" value={result.discovery_rate ?? "0"} color="purple" />
            <StatCard label="Avg Strength" value={result.average_strength ?? "0"} color="orange" />
          </div>
          {result.strongest_pair && (
            <DataBlock title="Strongest Pair" data={result.strongest_pair} />
          )}
          <DataBlock title="Modality Coverage" data={coverage} />
          <DataBlock title="All Causal Pairs" data={pairs} />
        </div>
      );
    }

    // Align result
    if (activeTab === "Align") {
      const pairs = (result.alignment_pairs as Record<string, unknown>[]) ?? [];
      const flow = (result.causal_flow_preservation as Record<string, unknown>[]) ?? [];
      const quality = result.quality_assessment as Record<string, unknown> ?? {};
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Overall Alignment" value={result.overall_alignment ?? "0"} color="blue" />
            <StatCard label="Causal Preservation" value={result.causal_preservation_rate ?? "0"} color="green" />
            <StatCard label="Alignment Pairs" value={pairs.length} color="purple" />
            <StatCard label="Modalities" value={(result.modalities as string[])?.length ?? 0} color="cyan" />
          </div>
          <DataBlock title="Quality Assessment" data={quality} />
          <DataBlock title="Causal Flow Preservation" data={flow} />
          <DataBlock title="Alignment Pairs" data={pairs} />
        </div>
      );
    }

    // Graph result
    if (activeTab === "Graph") {
      const stats = result.graph_statistics as Record<string, unknown> ?? {};
      const modCounts = result.modality_node_counts as Record<string, number> ?? {};
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Nodes" value={result.num_nodes ?? 0} color="blue" />
            <StatCard label="Edges" value={result.num_edges ?? 0} color="green" />
            <StatCard label="Cross-Modal Edges" value={result.num_cross_edges ?? 0} color="purple" />
            <StatCard label="Intra-Modal Edges" value={result.num_intra_edges ?? 0} color="orange" />
          </div>
          <DataBlock title="Graph Statistics" data={stats} />
          <DataBlock title="Modality Node Counts" data={modCounts} />
          <DataBlock title="Type-Specific Metrics" data={result.type_specific_metrics} />
          <DataBlock title="Nodes" data={result.nodes} />
          <DataBlock title="Edges" data={result.edges} />
        </div>
      );
    }

    // Ground result
    if (activeTab === "Ground") {
      const grounded = (result.grounded_claims as Record<string, unknown>[]) ?? [];
      const ungrounded = (result.ungrounded_claims as Record<string, unknown>[]) ?? [];
      const evidence = result.modality_evidence_summary as Record<string, unknown> ?? {};
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Total Claims" value={result.num_claims ?? 0} color="blue" />
            <StatCard label="Grounded" value={grounded.length} color="green" />
            <StatCard label="Grounding Rate" value={result.grounding_rate ?? "0"} color="purple" />
            <StatCard label="Avg Score" value={result.average_grounding_score ?? "0"} color="cyan" />
          </div>
          <DataBlock title="Modality Evidence Summary" data={evidence} />
          <DataBlock title="All Claims" data={result.claims} />
        </div>
      );
    }

    // Intervene result
    if (activeTab === "Intervene") {
      const obs = (result.observations as Record<string, unknown>[]) ?? [];
      const dist = result.effect_distribution as Record<string, unknown> ?? {};
      const impact = result.cross_modal_impact as Record<string, unknown> ?? {};
      const pathway = result.causal_pathway as Record<string, unknown> ?? {};
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Avg Treatment Effect" value={result.average_treatment_effect ?? "0"} color="blue" />
            <StatCard label="Observations" value={obs.length} color="green" />
            <StatCard label="Source → Target" value={`${result.source_modality} → ${result.target_modality}`} color="purple" />
            <StatCard label="Intervention" value={result.intervention_type ?? ""} color="orange" />
          </div>
          <DataBlock title="Effect Distribution" data={dist} />
          <DataBlock title="Cross-Modal Impact" data={impact} />
          <DataBlock title="Causal Pathway" data={pathway} />
          <DataBlock title="Intervention Metrics" data={result.intervention_metrics} />
          <DataBlock title="Observations" data={obs} />
        </div>
      );
    }

    // Validate result
    if (activeTab === "Validate") {
      const passed = (result.passed_claims as Record<string, unknown>[]) ?? [];
      const failed = (result.failed_claims as Record<string, unknown>[]) ?? [];
      const methodSummary = result.method_summary as Record<string, unknown> ?? {};
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Validation Rate" value={result.validation_rate ?? "0"} color="blue" />
            <StatCard label="Passed" value={passed.length} color="green" />
            <StatCard label="Failed" value={failed.length} color="red" />
            <StatCard label="Recommendation" value={result.recommendation ?? ""} color="purple" />
          </div>
          <DataBlock title="Method Summary" data={methodSummary} />
          <DataBlock title="Validation Results" data={result.validation_results} />
        </div>
      );
    }

    return <DataBlock title="Raw Result" data={result} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Graph Multimodal Causal Discovery
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            v1.224 — Discover causal relationships across modalities (text, image, audio, video, sensor, tabular)
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResult(null); setError(null); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Configuration</h2>
            {renderControls()}
            <button
              onClick={handleRun}
              disabled={loading}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/40 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? "Processing..." : "Run Analysis"}
            </button>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Results</h2>
            {renderResult()}
            {!result && !loading && !error && (
              <div className="text-center py-12 text-gray-500">
                <p>Configure parameters and click &quot;Run Analysis&quot; to see results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
