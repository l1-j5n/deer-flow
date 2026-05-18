"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.268 — Graph Causal Knowledge Graph Compression Engine
   7 tabs: Compress | Summarize | Prune | Archive | Decompress | Benchmark | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Compress", "Summarize", "Prune", "Archive", "Decompress", "Benchmark", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const COMPRESSION_STRATEGIES = ["structural_merge","semantic_summarization","information_pruning","temporal_aggregation","quality_preserving","ai_adaptive_compression"];
const RESOLUTION_LEVELS = ["fine_grained","moderate","coarse","abstract","meta","ai_dynamic_resolution"];
const COMPRESSION_METRICS = ["size_reduction","information_retention","causal_fidelity","query_performance","reconstruction_accuracy","ai_quality_score"];
const DECOMPRESSION_METHODS = ["full_restore","selective_expand","progressive_detail","on_demand_fetch","lazy_reconstruction","ai_intelligent_decompress"];
const COMPRESSION_DOMAINS = ["graph_structure","edge_weights","node_attributes","temporal_series","evidence_chains","ai_cross_domain"];
const FIDELITY_LEVELS = ["lossless","near_lossless","high_fidelity","standard","aggressive","ai_balanced"];

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
    orange: "bg-orange-900/40 text-orange-300 border-orange-700",
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

function NumField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="number" min={min} max={max} step={step}
        className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Metric({ label, value, color = "text-gray-200" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-sm font-mono font-semibold ${color}`}>{value}</div>
    </div>
  );
}

// ─── Tab Panels ───────────────────────────────────────────

function CompressPanel() {
  const [strategy, setStrategy] = useState("ai_adaptive_compression");
  const [domain, setDomain] = useState("graph_structure");
  const [fidelity, setFidelity] = useState("ai_balanced");
  const [targetRatio, setTargetRatio] = useState(0.5);

  const fidelityMap: Record<string, number> = {
    lossless: 0.15, near_lossless: 0.35, high_fidelity: 0.55,
    standard: 0.7, aggressive: 0.85, ai_balanced: 0.6,
  };
  const strategyMap: Record<string, number> = {
    structural_merge: 0.6, semantic_summarization: 0.7, information_pruning: 0.5,
    temporal_aggregation: 0.65, quality_preserving: 0.4, ai_adaptive_compression: 0.75,
  };
  const fFactor = fidelityMap[fidelity] ?? 0.5;
  const sFactor = strategyMap[strategy] ?? 0.5;
  const achieved = Math.min(0.95, targetRatio * sFactor * fFactor / 0.5);
  const retention = 1 - achieved * 0.2;
  const fidelityScore = 1 - achieved * 0.1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Compression Strategy" value={strategy} options={COMPRESSION_STRATEGIES} onChange={setStrategy} />
        <SelectField label="Domain" value={domain} options={COMPRESSION_DOMAINS} onChange={setDomain} />
        <SelectField label="Fidelity Level" value={fidelity} options={FIDELITY_LEVELS} onChange={setFidelity} />
        <NumField label="Target Ratio" value={targetRatio} min={0.1} max={0.9} step={0.05} onChange={setTargetRatio} />
      </div>
      <Card title="Compression Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Achieved Ratio" value={achieved.toFixed(2)} color="text-cyan-400" />
          <Metric label="Retention" value={retention.toFixed(3)} color="text-emerald-400" />
          <Metric label="Causal Fidelity" value={fidelityScore.toFixed(3)} color="text-blue-400" />
          <Metric label="Quality" value={(achieved * 0.3 + retention * 0.35 + fidelityScore * 0.35).toFixed(3)} color="text-purple-400" />
        </div>
        {/* Compression phases */}
        {["Analysis", "Clustering", "Merging", "Optimization", "Validation"].map((phase, i) => {
          const reduction = achieved / 5 * (0.8 + i * 0.08);
          const progress = Math.min(1, (i + 1) / 5);
          return (
            <div key={phase} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`P${i + 1}`} color={["blue", "green", "amber", "purple", "cyan"][i]} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{phase}</span>
                <span>Reduction: {(reduction * 100).toFixed(0)}%</span>
                <span>Memory: {Math.round(50 + i * 80)}MB</span>
                <span>Ops: {Math.round(100 + i * 200)}</span>
                <span>Impact: {(0.01 + i * 0.015).toFixed(3)}</span>
              </div>
              <div className="w-16 bg-gray-700 rounded-full h-1.5">
                <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
          );
        })}
        {/* Size comparison */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Size Comparison</div>
          <div className="flex items-end gap-2 h-20">
            <div className="flex-1">
              <div className="bg-blue-600/60 rounded-t h-full" title="Original" />
              <div className="text-xs text-gray-500 text-center mt-1">Original</div>
            </div>
            <div className="flex-1">
              <div className="bg-emerald-600/60 rounded-t" style={{ height: `${(1 - achieved) * 100}%` }} title="Compressed" />
              <div className="text-xs text-gray-500 text-center mt-1">Compressed</div>
            </div>
            <div className="flex-1">
              <div className="bg-amber-600/60 rounded-t" style={{ height: `${retention * 100}%` }} title="Info Retained" />
              <div className="text-xs text-gray-500 text-center mt-1">Info Kept</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 text-right mt-1">Saved: {(achieved * 100).toFixed(0)}% space</div>
        </div>
      </Card>
    </div>
  );
}

function SummarizePanel() {
  const [resolution, setResolution] = useState("moderate");
  const [depth, setDepth] = useState(4);
  const [focus, setFocus] = useState("general");

  const resolutionCompression: Record<string, number> = {
    fine_grained: 0.3, moderate: 0.5, coarse: 0.7,
    abstract: 0.85, meta: 0.95, ai_dynamic_resolution: 0.6,
  };
  const compression = resolutionCompression[resolution] ?? 0.5;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Resolution Level" value={resolution} options={RESOLUTION_LEVELS} onChange={setResolution} />
        <NumField label="Topic Depth" value={depth} min={1} max={6} onChange={setDepth} />
        <SelectField label="Focus Area" value={focus} options={["general", "causal_mechanisms", "temporal_dynamics", "intervention_effects", "feedback_systems"]} onChange={setFocus} />
      </div>
      <Card title="Semantic Summarization Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Compression" value={(compression * 100).toFixed(0)} color="text-cyan-400" />
          <Metric label="Quality" value={(0.7 + compression * 0.2).toFixed(2)} color="text-emerald-400" />
          <Metric label="Coverage" value={(0.75 + depth * 0.03).toFixed(2)} color="text-blue-400" />
          <Metric label="Speedup" value={`${(1 / Math.max(1 - compression, 0.05)).toFixed(1)}x`} color="text-purple-400" />
        </div>
        {/* Summary hierarchy */}
        {["Micro Causal Facts", "Local Patterns", "Regional Structures", "Domain Summaries", "Cross-Domain Insights", "Meta Principles"].slice(0, depth).map((layer, i) => {
          const coverage = 0.5 + i * 0.08;
          const coherence = 0.7 + i * 0.04;
          return (
            <div key={layer} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`L${i + 1}`} color={["blue", "green", "amber", "purple", "cyan", "teal"][i]} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{layer}</span>
                <span>Coverage: {(coverage * 100).toFixed(0)}%</span>
                <span>Coherence: {coherence.toFixed(3)}</span>
                <span>Insights: {Math.round(3 + i * 2)}</span>
                <span>Depth: {i + 1}/{depth}</span>
              </div>
            </div>
          );
        })}
        {/* Topic coverage */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Topic Coverage Matrix</div>
          <div className="space-y-1">
            {["Causal Mechanisms", "Temporal Dynamics", "Intervention Effects", "Confounding", "Feedback Systems"].slice(0, depth).map((topic, i) => {
              const coverage = 0.55 + i * 0.07;
              return (
                <div key={topic} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 w-36 truncate">{topic}</span>
                  <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                    <div className="bg-cyan-600 h-1.5 rounded-full" style={{ width: `${coverage * 100}%` }} />
                  </div>
                  <span className="text-gray-500 w-10 text-right">{(coverage * 100).toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

function PrunePanel() {
  const [threshold, setThreshold] = useState(0.3);
  const [domain, setDomain] = useState("graph_structure");
  const [fidelity, setFidelity] = useState("high_fidelity");

  const fidelitySens: Record<string, number> = {
    lossless: 0.05, near_lossless: 0.1, high_fidelity: 0.2,
    standard: 0.35, aggressive: 0.5, ai_balanced: 0.3,
  };
  const sensitivity = fidelitySens[fidelity] ?? 0.3;
  const prunableRatio = threshold * sensitivity;
  const safeToPrune = prunableRatio < 0.05;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <NumField label="Pruning Threshold" value={threshold} min={0.05} max={0.8} step={0.05} onChange={setThreshold} />
        <SelectField label="Domain" value={domain} options={COMPRESSION_DOMAINS} onChange={setDomain} />
        <SelectField label="Fidelity" value={fidelity} options={FIDELITY_LEVELS} onChange={setFidelity} />
      </div>
      <Card title="Information-Theoretic Pruning Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Prunable" value={`${(prunableRatio * 100).toFixed(1)}%`} color="text-cyan-400" />
          <Metric label="Sensitivity" value={sensitivity.toFixed(2)} color="text-emerald-400" />
          <Metric label="Safety" value={safeToPrune ? "SAFE" : "CAUTION"} color={safeToPrune ? "text-emerald-400" : "text-amber-400"} />
          <Metric label="Quality" value={(0.7 + (1 - prunableRatio) * 0.25).toFixed(2)} color="text-purple-400" />
        </div>
        {/* Pruning categories */}
        {[
          { name: "Weak Associations", factor: 0.8 },
          { name: "Redundant Paths", factor: 0.6 },
          { name: "Deprecated Evidence", factor: 0.4 },
          { name: "Stale Temporal Data", factor: 0.5 },
          { name: "Low Confidence Inferences", factor: 0.3 },
          { name: "Orphaned Structures", factor: 0.7 },
        ].map((cat, i) => {
          const ratio = prunableRatio * cat.factor / 3.3;
          const impact = threshold * sensitivity * (0.02 + i * 0.01);
          return (
            <div key={cat.name} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={cat.name.split(" ").map(w => w[0]).join("")} color={["blue", "green", "amber", "purple", "cyan", "teal"][i]} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{cat.name}</span>
                <span>Prunable: {(ratio * 100).toFixed(1)}%</span>
                <span>Impact: {impact.toFixed(3)}</span>
                <span>Safety: {(0.85 + i * 0.02).toFixed(3)}</span>
                <Badge label={impact < 0.03 ? "prune" : "review"} color={impact < 0.03 ? "green" : "amber"} />
              </div>
            </div>
          );
        })}
        {/* Impact analysis */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Impact Analysis</div>
          <div className="space-y-1">
            {[
              { name: "Causal Fidelity", impact: prunableRatio * 0.6 },
              { name: "Query Accuracy", impact: prunableRatio * 0.3 },
              { name: "Inference Quality", impact: prunableRatio * 0.45 },
              { name: "Explanation", impact: prunableRatio * 0.2 },
              { name: "Counterfactual", impact: prunableRatio * 0.35 },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-28">{item.name}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                  <div className={`${item.impact < 0.03 ? "bg-emerald-600" : item.impact < 0.06 ? "bg-amber-600" : "bg-red-600"} h-1.5 rounded-full`} style={{ width: `${Math.min(item.impact * 500, 100)}%` }} />
                </div>
                <span className="text-gray-500 w-14 text-right">-{(item.impact * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function ArchivePanel() {
  const [strategy, setStrategy] = useState("quality_preserving");
  const [retention, setRetention] = useState(90);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Archive Strategy" value={strategy} options={COMPRESSION_STRATEGIES} onChange={setStrategy} />
        <NumField label="Retention (days)" value={retention} min={7} max={365} onChange={setRetention} />
      </div>
      <Card title="Long-Term Archival Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Efficiency" value="0.85" color="text-cyan-400" />
          <Metric label="Integrity" value="0.997" color="text-emerald-400" />
          <Metric label="Versions" value="3" color="text-blue-400" />
          <Metric label="Retention" value={`${retention}d`} color="text-purple-400" />
        </div>
        {/* Archive blocks */}
        {["Incremental Snapshot", "Full Checkpoint", "Delta Archive", "Compressed Segment", "Semantic Digest"].map((block, i) => {
          const ratio = 0.6 + i * 0.06;
          const entries = Math.round(500 + i * 1500);
          return (
            <div key={block} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`BLK_${i}`} color={["blue", "green", "amber", "purple", "cyan"][i]} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{block}</span>
                <span>Entries: {entries.toLocaleString()}</span>
                <span>Ratio: {ratio.toFixed(2)}</span>
                <span>Size: {(entries * 0.003).toFixed(1)}MB</span>
                <Badge label={ratio > 0.8 ? "excellent" : "good"} color={ratio > 0.8 ? "green" : "blue"} />
              </div>
            </div>
          );
        })}
        {/* Version timeline */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Version History</div>
          <div className="flex items-end gap-2 h-16">
            {[0.8, 0.6, 0.4, 0.25].map((size, i) => (
              <div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  height: `${size * 100}%`,
                  backgroundColor: i === 0 ? "#06b6d4" : "#6b7280",
                  opacity: 0.6 + i * 0.1,
                }}
                title={`v${4 - i}.0 — ${Math.round(size * 500)}MB`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 text-right mt-1">v1.0 → v4.0 (latest)</div>
        </div>
      </Card>
    </div>
  );
}

function DecompressPanel() {
  const [method, setMethod] = useState("progressive_detail");
  const [segments, setSegments] = useState(5);
  const [resolution, setResolution] = useState("moderate");

  const expansionFactors: Record<string, number> = {
    fine_grained: 8, moderate: 5, coarse: 3,
    abstract: 1.5, meta: 1, ai_dynamic_resolution: 4,
  };
  const expansion = expansionFactors[resolution] ?? 3;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Decompression Method" value={method} options={DECOMPRESSION_METHODS} onChange={setMethod} />
        <NumField label="Segments" value={segments} min={1} max={20} onChange={setSegments} />
        <SelectField label="Target Resolution" value={resolution} options={RESOLUTION_LEVELS} onChange={setResolution} />
      </div>
      <Card title="Causal Knowledge Restoration Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Expansion" value={`${expansion}x`} color="text-cyan-400" />
          <Metric label="Fidelity" value={(0.88 + expansion * 0.01).toFixed(3)} color="text-emerald-400" />
          <Metric label="Quality" value={(0.85 + expansion * 0.015).toFixed(3)} color="text-blue-400" />
          <Metric label="Recovery" value={(0.92 + expansion * 0.005).toFixed(3)} color="text-purple-400" />
        </div>
        {/* Decompression phases */}
        {["Integrity Check", "Header Parse", "Block Decode", "Structure Rebuild", "Attribute Restore", "Relationship Reconstruct", "Quality Verify"].map((phase, i) => {
          const progress = Math.min(1, (i + 1) / 7);
          const successRate = 0.95 + i * 0.007;
          return (
            <div key={phase} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`D${i + 1}`} color={["blue", "green", "amber", "purple", "cyan", "teal", "orange"][i]} />
              <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{phase}</span>
                <span>Success: {(successRate * 100).toFixed(1)}%</span>
                <span>Time: {Math.round(50 + i * 200)}ms</span>
                <span>Elements: {Math.round(500 + i * 1000)}</span>
              </div>
            </div>
          );
        })}
        {/* Fidelity assessment */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Fidelity Assessment</div>
          <div className="space-y-1">
            {[
              { name: "Structural Fidelity", value: 0.94 },
              { name: "Edge Weight Accuracy", value: 0.91 },
              { name: "Node Attribute", value: 0.96 },
              { name: "Causal Path Integrity", value: 0.93 },
              { name: "Temporal Sequence", value: 0.90 },
              { name: "Evidence Chain", value: 0.95 },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-36">{item.name}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                  <div className={`${item.value > 0.9 ? "bg-emerald-600" : "bg-amber-600"} h-1.5 rounded-full`} style={{ width: `${item.value * 100}%` }} />
                </div>
                <span className="text-gray-500 w-10 text-right">{(item.value * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function BenchmarkPanel() {
  const [metric, setMetric] = useState("causal_fidelity");
  const [fidelity, setFidelity] = useState("ai_balanced");
  const [iterations, setIterations] = useState(5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Benchmark Metric" value={metric} options={COMPRESSION_METRICS} onChange={setMetric} />
        <SelectField label="Fidelity Level" value={fidelity} options={FIDELITY_LEVELS} onChange={setFidelity} />
        <NumField label="Iterations" value={iterations} min={1} max={20} onChange={setIterations} />
      </div>
      <Card title="Compression Benchmark Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Best Score" value="0.95" color="text-cyan-400" />
          <Metric label="Avg Score" value="0.82" color="text-emerald-400" />
          <Metric label="Configs" value={COMPRESSION_STRATEGIES.length * 3} color="text-blue-400" />
          <Metric label="Duration" value={`${iterations * 12}s`} color="text-purple-400" />
        </div>
        {/* Strategy comparison */}
        {COMPRESSION_STRATEGIES.map((strat, i) => {
          const score = 0.5 + (0.75 - i * 0.06) * 0.5;
          const isTop = i === 0;
          return (
            <div key={strat} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`#${i + 1}`} color={isTop ? "green" : ["blue", "green", "amber", "purple", "cyan", "teal"][i]} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300 flex-1">{strat.replace(/_/g, " ")}</span>
                  <div className="w-32 bg-gray-700 rounded-full h-2">
                    <div className={`${isTop ? "bg-emerald-500" : "bg-cyan-600"} h-2 rounded-full`} style={{ width: `${score * 100}%` }} />
                  </div>
                  <span className="text-xs font-mono text-gray-300 w-10 text-right">{score.toFixed(3)}</span>
                </div>
              </div>
            </div>
          );
        })}
        {/* Iteration convergence */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Iteration Convergence</div>
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: Math.min(iterations, 8) }, (_, i) => {
              const val = 0.7 + i * 0.04 + Math.random() * 0.05;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${val * 100}%`,
                    backgroundColor: val > 0.85 ? "#059669" : val > 0.75 ? "#0891b2" : "#d97706",
                    opacity: 0.5 + i * 0.08,
                  }}
                  title={`Iter ${i + 1}: ${val.toFixed(3)}`}
                />
              );
            })}
          </div>
          <div className="text-xs text-gray-500 text-right mt-1">Iteration 1 → {Math.min(iterations, 8)}</div>
        </div>
        {/* Quality distribution */}
        <div className="mt-3 flex gap-2 text-xs">
          <Badge label="Excellent: 3" color="green" />
          <Badge label="Good: 8" color="blue" />
          <Badge label="Acceptable: 5" color="amber" />
          <Badge label="Poor: 2" color="red" />
        </div>
      </Card>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="space-y-4">
      <Card title="v1.268 — Knowledge Compression & Lifecycle Engine Overview">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-900/40 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Enums (6 × 6 values)</div>
            {[
              ["CompressionStrategy", COMPRESSION_STRATEGIES],
              ["ResolutionLevel", RESOLUTION_LEVELS],
              ["CompressionMetric", COMPRESSION_METRICS],
              ["DecompressionMethod", DECOMPRESSION_METHODS],
              ["CompressionDomain", COMPRESSION_DOMAINS],
              ["FidelityLevel", FIDELITY_LEVELS],
            ].map(([name, vals]) => (
              <div key={name} className="mb-2">
                <div className="text-xs text-cyan-400 font-mono">{name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(vals as string[]).map((v) => (
                    <Badge key={v} label={v.replace(/_/g, " ")} color="blue" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-900/40 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Endpoints (7)</div>
            {[
              ["POST", "/graph/causal-compress/compress", "Structural compression"],
              ["POST", "/graph/causal-compress/summarize", "Semantic summarization"],
              ["POST", "/graph/causal-compress/prune", "Information-theoretic pruning"],
              ["POST", "/graph/causal-compress/archive", "Long-term archival"],
              ["POST", "/graph/causal-compress/decompress", "Knowledge restoration"],
              ["POST", "/graph/causal-compress/benchmark", "Quality benchmarking"],
              ["GET", "/graph/causal-compress/overview", "System overview"],
            ].map(([method, path, desc]) => (
              <div key={path} className="mb-2 text-xs">
                <span className={method === "POST" ? "text-amber-400" : "text-emerald-400"}>{method}</span>
                <span className="text-gray-300 font-mono ml-2">{path}</span>
                <span className="text-gray-500 ml-2">— {desc}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900/40 rounded p-3">
          <div className="text-xs text-gray-500 mb-2">Architecture Layer</div>
          <div className="text-xs font-mono text-gray-300 space-y-0.5">
            <div className="text-cyan-400">Knowledge Compression & Lifecycle (v1.268):</div>
            <div className="pl-4">Compress → Summarize → Prune → Archive → Decompress → Benchmark</div>
            <div className="text-gray-500 mt-2">↑ Built on Explainability & Interpretation (v1.267)</div>
            <div className="text-gray-600 pl-4">Explain → Interpret → Counterfactual → Visualize → Narrate → Validate</div>
          </div>
        </div>
      </Card>
      <Card title="Pipeline Integration">
        <div className="text-xs font-mono space-y-0.5 text-gray-400">
          <div><span className="text-blue-400">Causal Pipeline</span> (11 stages, v1.249–v1.259)</div>
          <div><span className="text-teal-400">Meta-Cognitive</span> (v1.260) → Reflect/Strategize/Self-Model/Introspect/Meta-Learn/Debias</div>
          <div><span className="text-amber-400">Emergence</span> (v1.261) → Detect/Analyze/Decompose/Simulate/Quantify/Evolve</div>
          <div><span className="text-red-400">Governance</span> (v1.262) → Audit/Comply/Trace/Govern/Report/Certify</div>
          <div><span className="text-cyan-400">Transfer</span> (v1.263) → Map/Transfer/Adapt/Drift/Validate/Synthesize</div>
          <div><span className="text-green-400">Streaming</span> (v1.264) → Ingest/Window/Update/Monitor/Checkpoint/Replay</div>
          <div><span className="text-purple-400">Consensus</span> (v1.265) → Propose/Vote/Reconcile/Fuse/Verify/Trust</div>
          <div><span className="text-rose-400">Resilience</span> (v1.266) → StressTest/FaultInject/Degrade/Recover/Redundancy/Harden</div>
          <div><span className="text-cyan-300">Explainability</span> (v1.267) → Explain/Interpret/Counterfactual/Visualize/Narrate/Validate</div>
          <div><span className="text-orange-400">Compression</span> (v1.268) → Compress/Summarize/Prune/Archive/Decompress/Benchmark</div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

const PANELS: Record<Tab, React.FC> = {
  Compress: CompressPanel,
  Summarize: SummarizePanel,
  Prune: PrunePanel,
  Archive: ArchivePanel,
  Decompress: DecompressPanel,
  Benchmark: BenchmarkPanel,
  Overview: OverviewPanel,
};

export default function GraphCausalCompressionPage() {
  const [tab, setTab] = useState<Tab>("Compress");
  const Panel = PANELS[tab];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-100">
            Graph Causal Knowledge Graph Compression Engine
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            v1.268 — Structural compression, semantic summarization, information pruning, archival, decompression &amp; benchmarking
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                tab === t
                  ? "bg-cyan-900/50 text-cyan-300 border-cyan-700"
                  : "bg-gray-800/30 text-gray-400 border-gray-700 hover:text-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <Panel />
      </div>
    </div>
  );
}
