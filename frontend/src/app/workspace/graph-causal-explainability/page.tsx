"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.267 — Graph Causal Explainability & Interpretation Engine
   7 tabs: Explain | Interpret | Counterfactual | Visualize | Narrate | Validate | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Explain", "Interpret", "Counterfactual", "Visualize", "Narrate", "Validate", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const EXPLANATION_TYPES = ["natural_language","counterfactual","mechanistic","statistical","structural","ai_multi_modal"];
const AUDIENCE_LEVELS = ["expert","practitioner","stakeholder","general_public","regulatory","ai_adaptive"];
const INTERPRETATION_METHODS = ["feature_importance","partial_dependence","shap_values","attention_weights","causal_path_trace","ai_holistic"];
const VISUALIZATION_TYPES = ["causal_graph","flow_diagram","heatmap","timeline","sankey_diagram","ai_interactive_3d"];
const NARRATIVE_STYLES = ["analytical","storytelling","question_answer","comparative","pedagogical","ai_contextual"];
const VALIDATION_METHODS = ["human_evaluation","consistency_check","faithfulness_test","robustness_check","ablation_study","ai_meta_validation"];

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

function ExplainPanel() {
  const [exType, setExType] = useState("natural_language");
  const [audience, setAudience] = useState("practitioner");
  const [depth, setDepth] = useState(4);

  const complexityMap: Record<string, number> = {
    expert: 0.9, practitioner: 0.7, stakeholder: 0.5,
    general_public: 0.3, regulatory: 0.6, ai_adaptive: 0.8,
  };
  const complexity = complexityMap[audience] ?? 0.5;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Explanation Type" value={exType} options={EXPLANATION_TYPES} onChange={setExType} />
        <SelectField label="Audience Level" value={audience} options={AUDIENCE_LEVELS} onChange={setAudience} />
        <NumField label="Explanation Depth" value={depth} min={1} max={6} onChange={setDepth} />
      </div>
      <Card title="Causal Explanation Generator">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Quality" value={(0.85 - (1 - complexity) * 0.2).toFixed(2)} color="text-cyan-400" />
          <Metric label="Confidence" value={(0.88 - (1 - complexity) * 0.15).toFixed(2)} color="text-emerald-400" />
          <Metric label="Completeness" value={(0.82 + complexity * 0.1).toFixed(2)} color="text-blue-400" />
          <Metric label="Coherence" value={(0.9 - complexity * 0.05).toFixed(2)} color="text-purple-400" />
        </div>
        {/* Explanation layers */}
        {["Surface Summary", "Mechanistic Detail", "Statistical Evidence", "Structural Path Analysis"].slice(0, depth).map((layer, i) => {
          const coverage = 0.65 + i * 0.07;
          const coherence = 0.7 + i * 0.05;
          const jargon = complexity * (0.1 + i * 0.08);
          return (
            <div key={layer} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`L${i + 1}`} color={["blue", "green", "amber", "purple", "cyan", "teal"][i]} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{layer}</span>
                <span>Coverage: {(coverage * 100).toFixed(0)}%</span>
                <span>Coherence: {coherence.toFixed(3)}</span>
                <span>Jargon: {(jargon * 100).toFixed(0)}%</span>
                <span>Depth: {i + 1}/{depth}</span>
              </div>
            </div>
          );
        })}
        {/* Causal claims */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-1">Causal Claims Confidence Distribution</div>
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 8 }, (_, i) => {
              const conf = 0.5 + i * 0.06;
              const barColor = conf > 0.8 ? "#059669" : conf > 0.6 ? "#d97706" : "#dc2626";
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{ height: `${conf * 100}%`, backgroundColor: barColor, opacity: 0.7 }}
                  title={`Claim ${i + 1}: confidence=${conf.toFixed(3)}`}
                />
              );
            })}
          </div>
          <div className="text-xs text-gray-500 text-right mt-1">Claims sorted by confidence</div>
        </div>
      </Card>
    </div>
  );
}

function InterpretPanel() {
  const [method, setMethod] = useState("feature_importance");
  const [modelComplexity, setModelComplexity] = useState(0.5);
  const [featureCount, setFeatureCount] = useState(10);

  const topFeatures = Math.min(featureCount, 20);
  const featureNames = [
    "temperature", "pressure", "humidity", "wind_speed", "altitude",
    "precipitation", "solar_radiation", "co2_level", "soil_moisture", "veg_index",
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Interpretation Method" value={method} options={INTERPRETATION_METHODS} onChange={setMethod} />
        <NumField label="Model Complexity" value={modelComplexity} min={0} max={1} step={0.05} onChange={setModelComplexity} />
        <NumField label="Feature Count" value={featureCount} min={3} max={30} onChange={setFeatureCount} />
      </div>
      <Card title="Causal Model Interpretation">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Quality" value={(0.78 + modelComplexity * 0.15).toFixed(2)} color="text-cyan-400" />
          <Metric label="Stability" value={(0.85 - modelComplexity * 0.1).toFixed(2)} color="text-emerald-400" />
          <Metric label="Top Feature" value={featureNames[0]} color="text-blue-400" />
          <Metric label="Depth" value={`${Math.floor(3 + modelComplexity * 5)} levels`} color="text-purple-400" />
        </div>
        {/* Feature importance bars */}
        <div className="space-y-1.5">
          {featureNames.slice(0, Math.min(topFeatures, 8)).map((feat, i) => {
            const importance = Math.max(0.05, 1 - i * 0.12);
            const direction = i % 3 === 0 ? "positive" : i % 3 === 1 ? "negative" : "mixed";
            const dirColor = direction === "positive" ? "bg-emerald-600" : direction === "negative" ? "bg-red-600" : "bg-amber-600";
            return (
              <div key={feat} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-28 truncate">{feat}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2.5 relative">
                  <div className={`${dirColor} h-2.5 rounded-full`} style={{ width: `${importance * 100}%` }} />
                </div>
                <Badge label={direction} color={direction === "positive" ? "green" : direction === "negative" ? "red" : "amber"} />
                <span className="text-xs font-mono text-gray-300 w-10 text-right">{importance.toFixed(3)}</span>
              </div>
            );
          })}
        </div>
        {/* Path trace summary */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded text-xs text-gray-400">
          <span className="text-gray-300 font-medium">Causal Path Trace:</span>{" "}
          {method.replace(/_/g, " ")} analysis reveals {Math.floor(2 + modelComplexity * 6)} significant causal paths.
          Top path: {featureNames[0]} → {featureNames[1]} → outcome (strength: {(0.7 + modelComplexity * 0.2).toFixed(3)}).
          {modelComplexity > 0.6 && " Non-linear threshold effects detected at 2 interaction points."}
        </div>
      </Card>
    </div>
  );
}

function CounterfactualPanel() {
  const [exType, setExType] = useState("counterfactual");
  const [interventions, setInterventions] = useState(5);
  const [divDepth, setDivDepth] = useState(5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Explanation Type" value={exType} options={EXPLANATION_TYPES} onChange={setExType} />
        <NumField label="Intervention Count" value={interventions} min={1} max={20} onChange={setInterventions} />
        <NumField label="Divergence Depth" value={divDepth} min={1} max={10} onChange={setDivDepth} />
      </div>
      <Card title="Counterfactual Causal Analysis">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Quality" value={(0.82 + interventions * 0.01).toFixed(2)} color="text-cyan-400" />
          <Metric label="Plausibility" value={(0.75 + Math.random() * 0.1).toFixed(2)} color="text-emerald-400" />
          <Metric label="Necessity" value={`${Math.round(60 + interventions * 3)}%`} color="text-blue-400" />
          <Metric label="Sufficiency" value={`${Math.round(45 + interventions * 2)}%`} color="text-purple-400" />
        </div>
        {/* Counterfactual scenarios */}
        {Array.from({ length: Math.min(interventions, 5) }, (_, i) => {
          const factual = 0.5 + i * 0.08;
          const counterfactual = Math.max(0.1, factual - 0.15 - i * 0.05);
          const diff = Math.abs(factual - counterfactual);
          const necessary = i < 3;
          const sufficient = i < 2;
          return (
            <div key={i} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`CF_${(i).toString().padStart(4, "0")}`} color="red" />
              <div className="flex-1 grid grid-cols-6 gap-2 text-xs text-gray-400">
                <span>Factual: {factual.toFixed(3)}</span>
                <span>CF: {counterfactual.toFixed(3)}</span>
                <span className="text-amber-400">Δ {diff.toFixed(3)}</span>
                <span className={necessary ? "text-emerald-400" : "text-gray-500"}>{necessary ? "✓ Nec" : "✗ Nec"}</span>
                <span className={sufficient ? "text-emerald-400" : "text-gray-500"}>{sufficient ? "✓ Suff" : "✗ Suff"}</span>
                <span>Power: {(diff * (necessary ? 1 : 0.5)).toFixed(3)}</span>
              </div>
            </div>
          );
        })}
        {/* Divergence timeline */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-1">Temporal Divergence Trace</div>
          <div className="flex items-end gap-1 h-20">
            {Array.from({ length: divDepth }, (_, i) => {
              const factual = Math.max(0.2, 1 - i * 0.08);
              const cf = Math.max(0.1, 1 - i * 0.15);
              return (
                <div key={i} className="flex-1 flex gap-0.5">
                  <div
                    className="flex-1 bg-blue-600/60 rounded-t"
                    style={{ height: `${factual * 80}px` }}
                    title={`Factual d${i + 1}: ${factual.toFixed(3)}`}
                  />
                  <div
                    className="flex-1 bg-red-600/60 rounded-t"
                    style={{ height: `${cf * 80}px` }}
                    title={`CF d${i + 1}: ${cf.toFixed(3)}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Factual (blue) / Counterfactual (red)</span>
            <span>Depth 1 → {divDepth}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function VisualizePanel() {
  const [vizType, setVizType] = useState("causal_graph");
  const [nodeCount, setNodeCount] = useState(12);
  const [complexity, setComplexity] = useState(0.5);

  const edgeCount = Math.floor(nodeCount + nodeCount * complexity * 2);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Visualization Type" value={vizType} options={VISUALIZATION_TYPES} onChange={setVizType} />
        <NumField label="Node Count" value={nodeCount} min={5} max={50} onChange={setNodeCount} />
        <NumField label="Complexity" value={complexity} min={0} max={1} step={0.05} onChange={setComplexity} />
      </div>
      <Card title="Visualization Data Generator">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Nodes" value={nodeCount} color="text-cyan-400" />
          <Metric label="Edges" value={edgeCount} color="text-emerald-400" />
          <Metric label="Readability" value={(0.85 - complexity * 0.25).toFixed(2)} color="text-blue-400" />
          <Metric label="Layers" value={Math.floor(2 + complexity * 3)} color="text-purple-400" />
        </div>
        {/* Mini causal graph visualization */}
        <div className="p-3 bg-gray-900/60 rounded mb-3">
          <div className="text-xs text-gray-400 mb-2">Graph Preview ({vizType.replace(/_/g, " ")})</div>
          <div className="relative" style={{ height: "140px" }}>
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Render simplified node graph */}
              {Array.from({ length: Math.min(nodeCount, 12) }, (_, i) => {
                const cols = 4;
                const row = Math.floor(i / cols);
                const col = i % cols;
                const x = 40 + col * 120;
                const y = 25 + row * 55;
                const importance = 1 - i * 0.08;
                const r = 8 + importance * 12;
                const categories = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
                return (
                  <g key={i}>
                    {i > 0 && i < Math.min(nodeCount, 12) && (
                      <line
                        x1={40 + ((i - 1) % cols) * 120}
                        y1={25 + Math.floor((i - 1) / cols) * 55}
                        x2={x}
                        y2={y}
                        stroke="#4b5563"
                        strokeWidth={importance * 2}
                        opacity={0.5}
                      />
                    )}
                    <circle cx={x} cy={y} r={r} fill={categories[i % categories.length]} opacity={0.7} />
                    <text x={x} y={y + 4} textAnchor="middle" fill="#e5e7eb" fontSize={7}>
                      v{i}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
        {/* Node categories */}
        <div className="flex flex-wrap gap-2 text-xs">
          {["cause", "effect", "mediator", "confounder", "outcome", "context"].map((cat, i) => (
            <div key={cat} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-red-500", "bg-purple-500", "bg-cyan-500"][i]}`} />
              <span className="text-gray-400">{cat}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2 bg-gray-900/40 rounded text-xs text-gray-400">
          <span className="text-gray-300 font-medium">Render Info:</span>{" "}
          {nodeCount} nodes, {edgeCount} edges, {vizType.replace(/_/g, " ")} layout.
          Estimated render: {(nodeCount * edgeCount * 0.1).toFixed(0)}ms.
          {complexity > 0.7 && " Edge bundling recommended for clarity."}
        </div>
      </Card>
    </div>
  );
}

function NarratePanel() {
  const [style, setStyle] = useState("analytical");
  const [topics, setTopics] = useState(5);
  const [audience, setAudience] = useState("practitioner");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Narrative Style" value={style} options={NARRATIVE_STYLES} onChange={setStyle} />
        <NumField label="Topic Count" value={topics} min={1} max={12} onChange={setTopics} />
        <SelectField label="Target Audience" value={audience} options={AUDIENCE_LEVELS} onChange={setAudience} />
      </div>
      <Card title="Narrative Explanation Generator">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Quality" value={(0.8 + topics * 0.01).toFixed(2)} color="text-cyan-400" />
          <Metric label="Coherence" value="0.87" color="text-emerald-400" />
          <Metric label="Engagement" value={(style === "storytelling" ? 0.85 : 0.72).toFixed(2)} color="text-blue-400" />
          <Metric label="Coverage" value={(0.75 + topics * 0.02).toFixed(2)} color="text-purple-400" />
        </div>
        {/* Narrative sections */}
        {["Executive Summary", "Key Findings", "Detailed Analysis", "Implications", "Recommendations"].slice(0, Math.min(3 + Math.floor(topics / 3), 5)).map((section, i) => {
          const wordCount = 150 + i * 80;
          const coherence = 0.7 + i * 0.04;
          const readingLevel = ["accessible", "moderate", "technical", "technical", "expert"][i];
          return (
            <div key={section} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`§${i + 1}`} color={["blue", "green", "amber", "purple", "cyan"][i]} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{section}</span>
                <span>{wordCount} words</span>
                <span>Coherence: {coherence.toFixed(3)}</span>
                <span>Level: {readingLevel}</span>
                <span>{(wordCount / 200).toFixed(1)} min</span>
              </div>
            </div>
          );
        })}
        {/* Topic coverage bars */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Topic Coverage</div>
          <div className="space-y-1">
            {["Primary Causes", "Mediating Mechanisms", "Confounding Variables", "Temporal Dynamics", "Uncertainty Sources"].slice(0, topics).map((topic, i) => {
              const coverage = 0.6 + i * 0.06;
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

function ValidatePanel() {
  const [method, setMethod] = useState("consistency_check");
  const [sampleSize, setSampleSize] = useState(50);
  const [strictness, setStrictness] = useState(0.5);

  const passThreshold = (1 - strictness) * 0.7 + 0.2;
  const metrics = ["faithfulness", "plausibility", "consistency", "completeness", "parsimony", "actionability"];
  const passRate = metrics.filter(() => Math.random() > (1 - passThreshold) * 0.3).length / metrics.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Validation Method" value={method} options={VALIDATION_METHODS} onChange={setMethod} />
        <NumField label="Sample Size" value={sampleSize} min={10} max={500} onChange={setSampleSize} />
        <NumField label="Strictness" value={strictness} min={0} max={1} step={0.05} onChange={setStrictness} />
      </div>
      <Card title="Explanation Validation Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Pass Rate" value={`${(passRate * 100).toFixed(0)}%`} color={passRate > 0.8 ? "text-emerald-400" : "text-amber-400"} />
          <Metric label="Quality" value={(0.75 + passRate * 0.2).toFixed(2)} color="text-cyan-400" />
          <Metric label="Verdict" value={passRate > 0.8 ? "PASS" : passRate > 0.5 ? "CONDITIONAL" : "FAIL"} color={passRate > 0.8 ? "text-emerald-400" : passRate > 0.5 ? "text-amber-400" : "text-red-400"} />
          <Metric label="Confidence" value={(0.8 + sampleSize * 0.001).toFixed(2)} color="text-purple-400" />
        </div>
        {/* Validation metrics */}
        {metrics.map((metric, i) => {
          const score = 0.5 + Math.random() * 0.45;
          const passed = score >= passThreshold;
          return (
            <div key={metric} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={passed ? "PASS" : "FAIL"} color={passed ? "green" : "red"} />
              <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
                <span className="text-gray-300 capitalize">{metric}</span>
                <span>Score: {score.toFixed(3)}</span>
                <span>Threshold: {passThreshold.toFixed(3)}</span>
                <span>CI: [{(score - 0.05).toFixed(3)}, {(score + 0.05).toFixed(3)}]</span>
              </div>
            </div>
          );
        })}
        {/* Validation rounds */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-1">Validation Rounds Progress</div>
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 5 }, (_, i) => {
              const roundPass = Math.min(1, passRate + i * 0.04);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${roundPass * 100}%`,
                    backgroundColor: roundPass > 0.8 ? "#059669" : roundPass > 0.5 ? "#d97706" : "#dc2626",
                    opacity: 0.5 + i * 0.1,
                  }}
                  title={`Round ${i + 1}: ${(roundPass * 100).toFixed(1)}% pass`}
                />
              );
            })}
          </div>
          <div className="text-xs text-gray-500 text-right mt-1">Round 1 → 5 (convergence)</div>
        </div>
      </Card>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="space-y-4">
      <Card title="v1.267 — Explainability & Interpretation Engine Overview">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-900/40 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Enums (6 × 6 values)</div>
            {[
              ["ExplanationType", EXPLANATION_TYPES],
              ["AudienceLevel", AUDIENCE_LEVELS],
              ["InterpretationMethod", INTERPRETATION_METHODS],
              ["VisualizationType", VISUALIZATION_TYPES],
              ["NarrativeStyle", NARRATIVE_STYLES],
              ["ValidationMethod", VALIDATION_METHODS],
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
              ["POST", "/graph/causal-explain/explain", "Multi-level explanations"],
              ["POST", "/graph/causal-explain/interpret", "Model interpretation"],
              ["POST", "/graph/causal-explain/counterfactual", "Counterfactual analysis"],
              ["POST", "/graph/causal-explain/visualize", "Visualization data"],
              ["POST", "/graph/causal-explain/narrate", "Narrative generation"],
              ["POST", "/graph/causal-explain/validate", "Explanation validation"],
              ["GET", "/graph/causal-explain/overview", "System overview"],
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
            <div className="text-cyan-400">Explainability & Interpretation (v1.267):</div>
            <div className="pl-4">Explain → Interpret → Counterfactual → Visualize → Narrate → Validate</div>
            <div className="text-gray-500 mt-2">↑ Built on Resilience & Fault Tolerance (v1.266)</div>
            <div className="text-gray-600 pl-4">StressTest → FaultInject → Degrade → Recover → Redundancy → Harden</div>
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
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

const PANELS: Record<Tab, React.FC> = {
  Explain: ExplainPanel,
  Interpret: InterpretPanel,
  Counterfactual: CounterfactualPanel,
  Visualize: VisualizePanel,
  Narrate: NarratePanel,
  Validate: ValidatePanel,
  Overview: OverviewPanel,
};

export default function GraphCausalExplainabilityPage() {
  const [tab, setTab] = useState<Tab>("Explain");
  const Panel = PANELS[tab];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-100">
            Graph Causal Explainability &amp; Interpretation Engine
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            v1.267 — Multi-level explanations, model interpretation, counterfactual analysis, visualization, narrative generation &amp; validation
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
