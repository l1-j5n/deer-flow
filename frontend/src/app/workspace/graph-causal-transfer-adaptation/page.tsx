"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.263 — Graph Causal Transfer & Domain Adaptation Engine
   7 tabs: Map | Transfer | Adapt | Drift | Validate | Synthesize | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Map", "Transfer", "Adapt", "Drift", "Validate", "Synthesize", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const TRANSFER_METHODS = ["direct_transfer","feature_map","structural_analogy","distribution_align","causal_replay","ai_hybrid_transfer"];
const DOMAIN_TYPES = ["homogeneous","heterogeneous","latent_overlap","partial_overlap","novel_domain","ai_discovered_domain"];
const ADAPTATION_STRATEGIES = ["fine_tuning","reinforcement","curriculum","progressive_freezing","meta_adaptation","ai_autonomous_adapt"];
const DRIFT_TYPES = ["covariate_shift","concept_shift","distribution_shift","feature_drift","label_drift","ai_emergent_drift"];
const VALIDATION_MODES = ["statistical_test","interventional_verify","counterfactual_check","expert_review","adversarial_probe","ai_automated_validation"];
const SYNTHESIS_METHODS = ["ensemble_fusion","hierarchical_merge","conflict_resolve","complement_combine","theory_unification","ai_creative_synthesis"];

// ─── Helpers ──────────────────────────────────────────────
function Badge({ label, color = "blue" }: { label: string; color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-900/40 text-blue-300 border-blue-700",
    green: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
    amber: "bg-amber-900/40 text-amber-300 border-amber-700",
    red: "bg-red-900/40 text-red-300 border-red-700",
    purple: "bg-purple-900/40 text-purple-300 border-purple-700",
    cyan: "bg-cyan-900/40 text-cyan-300 border-cyan-700",
    teal: "bg-teal-900/40 text-teal-300 border-teal-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded border ${colors[color] ?? colors.blue}`}>
      {label}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select
        className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
        ))}
      </select>
    </div>
  );
}

function StatBox({ label, value, color = "text-gray-200" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-gray-900/60 rounded p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-mono font-semibold ${color}`}>{value}</div>
    </div>
  );
}

// ─── Tab Panels ──────────────────────────────────────────

function MapTab() {
  const [method, setMethod] = useState(TRANSFER_METHODS[5]);
  const [mappingDepth, setMappingDepth] = useState("0.70");
  const [sourceNodes, setSourceNodes] = useState("20");
  const [targetNodes, setTargetNodes] = useState("20");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-transfer/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, mapping_depth: parseFloat(mappingDepth), source_nodes: parseInt(sourceNodes), target_nodes: parseInt(targetNodes) }),
      });
      setResult(await res.json());
    } catch { setResult({ error: "Fetch failed" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Transfer Method" value={method} options={TRANSFER_METHODS} onChange={setMethod} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mapping Depth</label>
          <input type="range" min="0" max="100" value={Math.round(parseFloat(mappingDepth)*100)} onChange={(e) => setMappingDepth((parseInt(e.target.value)/100).toFixed(2))} className="w-full" />
          <div className="text-xs text-gray-500 text-right">{mappingDepth}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Source Nodes</label>
          <input type="number" min={1} max={500} value={sourceNodes} onChange={(e) => setSourceNodes(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Target Nodes</label>
          <input type="number" min={1} max={500} value={targetNodes} onChange={(e) => setTargetNodes(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" />
        </div>
      </div>
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-sm rounded disabled:opacity-50">
        {loading ? "Mapping..." : "Map Domains"}
      </button>
      {result && !result.error && (
        <div className="grid grid-cols-4 gap-3">
          <StatBox label="Structural Sim" value={result.structural_similarity?.toFixed(3) ?? "—"} color="text-cyan-400" />
          <StatBox label="Semantic Overlap" value={result.semantic_overlap?.toFixed(3) ?? "—"} color="text-blue-400" />
          <StatBox label="Causal Preservation" value={result.causal_preservation?.toFixed(3) ?? "—"} color="text-green-400" />
          <StatBox label="Mapping Effectiveness" value={result.mapping_effectiveness?.toFixed(3) ?? "—"} color="text-amber-400" />
        </div>
      )}
      {result?.mapped_pairs && (
        <Card title="Mapped Pairs (top 8)">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-gray-300">
              <thead><tr className="text-gray-500 border-b border-gray-700"><th className="text-left py-1 px-2">Source</th><th className="text-left py-1 px-2">Target</th><th className="text-right py-1 px-2">Similarity</th><th className="text-right py-1 px-2">Fidelity</th><th className="text-right py-1 px-2">Confidence</th></tr></thead>
              <tbody>{result.mapped_pairs.slice(0, 8).map((p: any, i: number) => (
                <tr key={i} className="border-b border-gray-800"><td className="py-1 px-2 font-mono">{p.source_node}</td><td className="py-1 px-2 font-mono">{p.target_node}</td><td className="py-1 px-2 text-right">{p.similarity}</td><td className="py-1 px-2 text-right">{p.causal_fidelity}</td><td className="py-1 px-2 text-right">{p.mapping_confidence}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function TransferTab() {
  const [domainType, setDomainType] = useState(DOMAIN_TYPES[3]);
  const [fidelity, setFidelity] = useState("0.80");
  const [units, setUnits] = useState("30");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-transfer/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain_type: domainType, fidelity_threshold: parseFloat(fidelity), knowledge_units: parseInt(units) }),
      });
      setResult(await res.json());
    } catch { setResult({ error: "Fetch failed" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <SelectField label="Domain Type" value={domainType} options={DOMAIN_TYPES} onChange={setDomainType} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Fidelity Threshold</label>
          <input type="range" min="0" max="100" value={Math.round(parseFloat(fidelity)*100)} onChange={(e) => setFidelity((parseInt(e.target.value)/100).toFixed(2))} className="w-full" />
          <div className="text-xs text-gray-500 text-right">{fidelity}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Knowledge Units</label>
          <input type="number" min={1} max={200} value={units} onChange={(e) => setUnits(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" />
        </div>
      </div>
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded disabled:opacity-50">
        {loading ? "Transferring..." : "Transfer Knowledge"}
      </button>
      {result && !result.error && (
        <div className="grid grid-cols-4 gap-3">
          <StatBox label="Success Rate" value={result.transfer_success_rate?.toFixed(3) ?? "—"} color="text-green-400" />
          <StatBox label="Avg Fidelity" value={result.avg_fidelity?.toFixed(3) ?? "—"} color="text-cyan-400" />
          <StatBox label="Transfer Quality" value={result.transfer_quality?.toFixed(3) ?? "—"} color="text-amber-400" />
          <StatBox label="Retained / Lost" value={`${result.knowledge_retained ?? "—"}/${result.knowledge_lost ?? "—"}`} color="text-blue-400" />
        </div>
      )}
      {result?.metrics?.fidelity_distribution && (
        <Card title="Fidelity Distribution">
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="High" value={result.metrics.fidelity_distribution.high_fidelity} color="text-green-400" />
            <StatBox label="Medium" value={result.metrics.fidelity_distribution.medium_fidelity} color="text-amber-400" />
            <StatBox label="Low" value={result.metrics.fidelity_distribution.low_fidelity} color="text-red-400" />
            <StatBox label="Failed" value={result.metrics.fidelity_distribution.failed_transfer} color="text-red-500" />
          </div>
        </Card>
      )}
    </div>
  );
}

function AdaptTab() {
  const [strategy, setStrategy] = useState(ADAPTATION_STRATEGIES[5]);
  const [lr, setLr] = useState("0.01");
  const [steps, setSteps] = useState("50");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-transfer/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy, learning_rate: parseFloat(lr), adaptation_steps: parseInt(steps) }),
      });
      setResult(await res.json());
    } catch { setResult({ error: "Fetch failed" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <SelectField label="Adaptation Strategy" value={strategy} options={ADAPTATION_STRATEGIES} onChange={setStrategy} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Learning Rate</label>
          <input type="number" step="0.001" min="0.0001" max="1" value={lr} onChange={(e) => setLr(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Adaptation Steps</label>
          <input type="number" min={1} max={500} value={steps} onChange={(e) => setSteps(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" />
        </div>
      </div>
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded disabled:opacity-50">
        {loading ? "Adapting..." : "Run Adaptation"}
      </button>
      {result && !result.error && (
        <>
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Convergence" value={result.adaptation_convergence?.toFixed(3) ?? "—"} color="text-purple-400" />
            <StatBox label="Performance Gain" value={result.performance_gain?.toFixed(3) ?? "—"} color="text-green-400" />
            <StatBox label="Stability" value={result.stability_index?.toFixed(3) ?? "—"} color="text-cyan-400" />
            <StatBox label="Adaptation Quality" value={result.adaptation_quality?.toFixed(3) ?? "—"} color="text-amber-400" />
          </div>
          {result.trajectory && (
            <Card title="Adaptation Trajectory (first 10 steps)">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-gray-300">
                  <thead><tr className="text-gray-500 border-b border-gray-700"><th className="text-right py-1 px-2">Step</th><th className="text-right py-1 px-2">Loss</th><th className="text-right py-1 px-2">Accuracy</th><th className="text-right py-1 px-2">Domain Align</th><th className="text-right py-1 px-2">Forgetting</th></tr></thead>
                  <tbody>{result.trajectory.slice(0, 10).map((t: any) => (
                    <tr key={t.step} className="border-b border-gray-800"><td className="py-1 px-2 text-right">{t.step}</td><td className="py-1 px-2 text-right">{t.loss}</td><td className="py-1 px-2 text-right">{t.accuracy}</td><td className="py-1 px-2 text-right">{t.domain_alignment}</td><td className="py-1 px-2 text-right">{t.catastrophic_forgetting}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function DriftTab() {
  const [driftType, setDriftType] = useState(DRIFT_TYPES[1]);
  const [sensitivity, setSensitivity] = useState("0.80");
  const [windowSize, setWindowSize] = useState("20");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-transfer/drift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drift_type: driftType, sensitivity: parseFloat(sensitivity), window_size: parseInt(windowSize) }),
      });
      setResult(await res.json());
    } catch { setResult({ error: "Fetch failed" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <SelectField label="Drift Type" value={driftType} options={DRIFT_TYPES} onChange={setDriftType} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Sensitivity</label>
          <input type="range" min="0" max="100" value={Math.round(parseFloat(sensitivity)*100)} onChange={(e) => setSensitivity((parseInt(e.target.value)/100).toFixed(2))} className="w-full" />
          <div className="text-xs text-gray-500 text-right">{sensitivity}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Window Size</label>
          <input type="number" min={5} max={100} value={windowSize} onChange={(e) => setWindowSize(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" />
        </div>
      </div>
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-sm rounded disabled:opacity-50">
        {loading ? "Detecting..." : "Detect Drift"}
      </button>
      {result && !result.error && (
        <>
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Detected" value={result.drift_detected ? "Yes ⚠" : "No ✓"} color={result.drift_detected ? "text-red-400" : "text-green-400"} />
            <StatBox label="Magnitude" value={result.drift_magnitude?.toFixed(3) ?? "—"} color="text-amber-400" />
            <StatBox label="Alert Level" value={result.alert_level ?? "—"} color={result.alert_level === "critical" ? "text-red-400" : "text-amber-400"} />
            <StatBox label="Recovery" value={result.recovery_potential?.toFixed(3) ?? "—"} color="text-cyan-400" />
          </div>
          {result.timeline && (
            <Card title="Drift Timeline">
              <div className="space-y-1">
                {result.timeline.map((w: any) => (
                  <div key={w.window} className="flex items-center gap-2 text-xs">
                    <span className="w-8 text-gray-500">W{w.window}</span>
                    <div className="flex-1 bg-gray-900 rounded-full h-3 relative overflow-hidden">
                      <div className={`h-full rounded-full ${w.status === "stable" ? "bg-green-600" : w.status === "warning" ? "bg-yellow-600" : "bg-red-600"}`} style={{ width: `${Math.min(100, w.drift_score * 100)}%` }} />
                    </div>
                    <span className={`w-16 text-right ${w.status === "stable" ? "text-green-400" : w.status === "warning" ? "text-yellow-400" : "text-red-400"}`}>{w.drift_score.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function ValidateTab() {
  const [mode, setMode] = useState(VALIDATION_MODES[5]);
  const [rigor, setRigor] = useState("0.80");
  const [claims, setClaims] = useState("15");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-transfer/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, rigor_level: parseFloat(rigor), num_claims: parseInt(claims) }),
      });
      setResult(await res.json());
    } catch { setResult({ error: "Fetch failed" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <SelectField label="Validation Mode" value={mode} options={VALIDATION_MODES} onChange={setMode} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Rigor Level</label>
          <input type="range" min="0" max="100" value={Math.round(parseFloat(rigor)*100)} onChange={(e) => setRigor((parseInt(e.target.value)/100).toFixed(2))} className="w-full" />
          <div className="text-xs text-gray-500 text-right">{rigor}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Number of Claims</label>
          <input type="number" min={1} max={100} value={claims} onChange={(e) => setClaims(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" />
        </div>
      </div>
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded disabled:opacity-50">
        {loading ? "Validating..." : "Validate Claims"}
      </button>
      {result && !result.error && (
        <>
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Pass Rate" value={result.validation_pass_rate?.toFixed(3) ?? "—"} color="text-green-400" />
            <StatBox label="Avg Confidence" value={result.avg_confidence?.toFixed(3) ?? "—"} color="text-cyan-400" />
            <StatBox label="Reproducibility" value={result.reproducibility?.toFixed(3) ?? "—"} color="text-blue-400" />
            <StatBox label="Validation Trust" value={result.validation_trust?.toFixed(3) ?? "—"} color="text-amber-400" />
          </div>
          {result.validated_claims && (
            <Card title="Validated Claims (first 8)">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-gray-300">
                  <thead><tr className="text-gray-500 border-b border-gray-700"><th className="text-left py-1 px-2">ID</th><th className="text-left py-1 px-2">Type</th><th className="text-center py-1 px-2">Result</th><th className="text-right py-1 px-2">Confidence</th><th className="text-right py-1 px-2">Effect Size</th><th className="text-right py-1 px-2">Robustness</th></tr></thead>
                  <tbody>{result.validated_claims.slice(0, 8).map((c: any) => (
                    <tr key={c.claim_id} className="border-b border-gray-800">
                      <td className="py-1 px-2 font-mono">{c.claim_id}</td>
                      <td className="py-1 px-2">{c.claim_type.replace(/_/g," ")}</td>
                      <td className="py-1 px-2 text-center"><Badge label={c.validation_result} color={c.validation_result === "pass" ? "green" : "red"} /></td>
                      <td className="py-1 px-2 text-right">{c.confidence}</td>
                      <td className="py-1 px-2 text-right">{c.effect_size}</td>
                      <td className="py-1 px-2 text-right">{c.robustness}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function SynthesizeTab() {
  const [method, setMethod] = useState(SYNTHESIS_METHODS[5]);
  const [creativity, setCreativity] = useState("0.60");
  const [domains, setDomains] = useState("4");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-transfer/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, creativity: parseFloat(creativity), source_domains: parseInt(domains) }),
      });
      setResult(await res.json());
    } catch { setResult({ error: "Fetch failed" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <SelectField label="Synthesis Method" value={method} options={SYNTHESIS_METHODS} onChange={setMethod} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Creativity Level</label>
          <input type="range" min="0" max="100" value={Math.round(parseFloat(creativity)*100)} onChange={(e) => setCreativity((parseInt(e.target.value)/100).toFixed(2))} className="w-full" />
          <div className="text-xs text-gray-500 text-right">{creativity}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Source Domains</label>
          <input type="number" min={2} max={20} value={domains} onChange={(e) => setDomains(e.target.value)} className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" />
        </div>
      </div>
      <button onClick={run} disabled={loading} className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-sm rounded disabled:opacity-50">
        {loading ? "Synthesizing..." : "Synthesize Insights"}
      </button>
      {result && !result.error && (
        <>
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Coherence" value={result.synthesis_coherence?.toFixed(3) ?? "—"} color="text-teal-400" />
            <StatBox label="Novelty Index" value={result.novelty_index?.toFixed(3) ?? "—"} color="text-purple-400" />
            <StatBox label="Insights" value={result.insight_count ?? "—"} color="text-blue-400" />
            <StatBox label="Synthesis Quality" value={result.synthesis_quality?.toFixed(3) ?? "—"} color="text-amber-400" />
          </div>
          {result.synthesized_insights && (
            <Card title="Synthesized Insights (first 8)">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-gray-300">
                  <thead><tr className="text-gray-500 border-b border-gray-700"><th className="text-left py-1 px-2">ID</th><th className="text-left py-1 px-2">Type</th><th className="text-right py-1 px-2">Confidence</th><th className="text-right py-1 px-2">Novelty</th><th className="text-right py-1 px-2">Generality</th><th className="text-right py-1 px-2">Testability</th></tr></thead>
                  <tbody>{result.synthesized_insights.slice(0, 8).map((i: any) => (
                    <tr key={i.insight_id} className="border-b border-gray-800">
                      <td className="py-1 px-2 font-mono">{i.insight_id}</td>
                      <td className="py-1 px-2">{i.insight_type.replace(/_/g," ")}</td>
                      <td className="py-1 px-2 text-right">{i.confidence}</td>
                      <td className="py-1 px-2 text-right">{i.novelty}</td>
                      <td className="py-1 px-2 text-right">{i.generality}</td>
                      <td className="py-1 px-2 text-right">{i.testability}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function OverviewTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-transfer/overview");
      setData(await res.json());
    } catch { setData(null); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <button onClick={load} disabled={loading} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded disabled:opacity-50">
        {loading ? "Loading..." : "Load Overview"}
      </button>
      {data && (
        <>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-200">{data.engine} <Badge label={data.version} color="cyan" /></div>
            <p className="text-xs text-gray-400">{data.description}</p>
            <div className="text-xs text-gray-500">Pipeline: {data.pipeline?.flow}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card title="Enums (6)">
              {Object.entries(data.enums ?? {}).map(([k, v]) => (
                <div key={k} className="mb-2">
                  <div className="text-xs font-semibold text-gray-400 mb-1">{k}</div>
                  <div className="flex flex-wrap gap-1">{(v as string[]).map((e) => <Badge key={e} label={e.replace(/_/g," ")} color="blue" />)}</div>
                </div>
              ))}
            </Card>
            <Card title="Endpoints (7)">
              <div className="space-y-1">
                {(data.endpoints ?? []).map((ep: string) => (
                  <div key={ep} className="text-xs font-mono text-gray-300">{ep}</div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-400">Cache entries:</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(data.caches ?? {}).map(([k, v]) => (
                  <Badge key={k} label={`${k}: ${v}`} color="amber" />
                ))}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

export default function CausalTransferAdaptationPage() {
  const [tab, setTab] = useState<Tab>("Map");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100 mb-1">Causal Transfer & Domain Adaptation</h1>
          <p className="text-sm text-gray-400">v1.263 — Cross-domain causal knowledge transfer with structural mapping, adaptive strategies, drift detection, and multi-domain synthesis</p>
        </div>

        <div className="flex gap-1 mb-6 border-b border-gray-800 pb-px">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm rounded-t transition-colors ${
                tab === t ? "bg-gray-800 text-cyan-400 border-t border-x border-gray-700" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Map" && <MapTab />}
        {tab === "Transfer" && <TransferTab />}
        {tab === "Adapt" && <AdaptTab />}
        {tab === "Drift" && <DriftTab />}
        {tab === "Validate" && <ValidateTab />}
        {tab === "Synthesize" && <SynthesizeTab />}
        {tab === "Overview" && <OverviewTab />}
      </div>
    </div>
  );
}
