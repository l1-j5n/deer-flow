"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════
   v1.260 — Graph Causal Meta-Cognitive Engine
   7 tabs: Reflect | Strategize | Self-Model | Introspect | Meta-Learn | Debias | Overview
   ═══════════════════════════════════════════════════════ */

const TABS = ["Reflect", "Strategize", "Self-Model", "Introspect", "Meta-Learn", "Debias", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const META_LEVELS = ["surface_reasoning","strategic_reasoning","reflective_reasoning","meta_strategic","self_aware","ai_transcendent"];
const REASONING_MODES = ["deductive","inductive","abductive","analogical","counterfactual","ai_hybrid_reasoning"];
const SELF_MODEL_DIMS = ["accuracy_calibration","confidence_calibration","bias_awareness","strategy_adequacy","knowledge_boundary","ai_meta_dimension"];
const INTROSPECTION_TYPES = ["process_audit","outcome_audit","strategy_audit","bias_audit","consistency_audit","ai_comprehensive_audit"];
const META_LEARNING_STRATEGIES = ["learning_to_learn","strategy_selection","resource_allocation","error_prediction","capability_mapping","ai_meta_adaptive"];
const COGNITIVE_BIASES = ["confirmation_bias","anchoring_bias","availability_bias","selection_bias","overconfidence_bias","ai_debiasing"];

// ─── Helpers ──────────────────────────────────────────────
function Badge({ label, color = "blue" }: { label: string; color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-900/40 text-blue-300 border-blue-700",
    green: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
    amber: "bg-amber-900/40 text-amber-300 border-amber-700",
    red: "bg-red-900/40 text-red-300 border-red-700",
    purple: "bg-purple-900/40 text-purple-300 border-purple-700",
    cyan: "bg-cyan-900/40 text-cyan-300 border-cyan-700",
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

function ReflectTab() {
  const [level, setLevel] = useState(META_LEVELS[2]);
  const [mode, setMode] = useState(REASONING_MODES[5]);
  const [depth, setDepth] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <SelectField label="Meta-Cognitive Level" value={level} options={META_LEVELS} onChange={setLevel} />
        <SelectField label="Reasoning Mode" value={mode} options={REASONING_MODES} onChange={setMode} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Reflection Depth</label>
          <input type="range" min="0.1" max="1" step="0.05" value={depth} onChange={(e) => setDepth(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{depth}</div>
        </div>
      </div>
      <Card title="Self-Reflection on Reasoning Processes">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Focus Area</th>
                <th className="text-right py-2 px-2">Insight Depth</th>
                <th className="text-right py-2 px-2">Quality</th>
                <th className="text-center py-2 px-2">Blind Spot</th>
                <th className="text-right py-2 px-2">Novelty</th>
                <th className="text-center py-2 px-2">Actionable</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "REF-001", focus: "assumption_validity", depth: 0.42, quality: 0.68, blind: false, novelty: 0.35, action: true },
                { id: "REF-002", focus: "evidence_sufficiency", depth: 0.55, quality: 0.72, blind: true, novelty: 0.28, action: true },
                { id: "REF-003", focus: "logical_coherence", depth: 0.48, quality: 0.81, blind: false, novelty: 0.45, action: true },
                { id: "REF-004", focus: "alternative_explanations", depth: 0.62, quality: 0.59, blind: true, novelty: 0.62, action: true },
                { id: "REF-005", focus: "confounding_awareness", depth: 0.38, quality: 0.75, blind: false, novelty: 0.18, action: true },
                { id: "REF-006", focus: "scope_limitations", depth: 0.51, quality: 0.45, blind: false, novelty: 0.52, action: false },
              ].map((r) => (
                <tr key={r.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 px-2 font-mono text-xs">{r.id}</td>
                  <td className="py-2 px-2"><Badge label={r.focus.replace(/_/g, " ")} color="purple" /></td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{r.depth.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${r.quality > 0.7 ? "text-green-400" : "text-amber-400"}`}>{r.quality.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">{r.blind ? "⚠" : "✓"}</td>
                  <td className="py-2 px-2 text-right font-mono text-blue-400">{r.novelty.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">{r.action ? "✓" : "✗"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Avg Quality" value="0.667" color="text-green-400" />
        <StatBox label="Blind Spots" value="2" color="text-amber-400" />
        <StatBox label="Actionable" value="5/6" color="text-cyan-400" />
        <StatBox label="Meta Index" value="0.467" color="text-purple-400" />
      </div>
    </div>
  );
}

function StrategizeTab() {
  const [strategy, setStrategy] = useState(META_LEARNING_STRATEGIES[5]);
  const [budget, setBudget] = useState("0.80");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Meta Strategy" value={strategy} options={META_LEARNING_STRATEGIES} onChange={setStrategy} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Complexity Budget</label>
          <input type="range" min="0.1" max="2" step="0.1" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{budget}</div>
        </div>
      </div>
      <Card title="Strategy Recommendations (sorted by priority)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Task</th>
                <th className="text-left py-2 px-2">Approach</th>
                <th className="text-right py-2 px-2">Effectiveness</th>
                <th className="text-right py-2 px-2">ROI</th>
                <th className="text-center py-2 px-2">Risk</th>
                <th className="text-right py-2 px-2">Priority</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "STRAT-001", task: "discovery", approach: "systematic", eff: 0.82, roi: 3.45, risk: 0.3, pri: 0.412 },
                { id: "STRAT-002", task: "effect_estimation", approach: "adaptive", eff: 0.78, roi: 2.88, risk: 0.5, pri: 0.285 },
                { id: "STRAT-003", task: "counterfactual", approach: "conservative", eff: 0.85, roi: 4.12, risk: 0.2, pri: 0.485 },
                { id: "STRAT-004", task: "mediation", approach: "moderate", eff: 0.71, roi: 2.15, risk: 0.4, pri: 0.245 },
                { id: "STRAT-005", task: "intervention", approach: "exploratory", eff: 0.68, roi: 1.92, risk: 0.6, pri: 0.162 },
                { id: "STRAT-006", task: "fairness_analysis", approach: "adaptive", eff: 0.75, roi: 2.55, risk: 0.4, pri: 0.275 },
              ].map((s) => (
                <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 px-2 font-mono text-xs">{s.id}</td>
                  <td className="py-2 px-2"><Badge label={s.task.replace(/_/g, " ")} color="purple" /></td>
                  <td className="py-2 px-2"><Badge label={s.approach} color="cyan" /></td>
                  <td className={`py-2 px-2 text-right font-mono ${s.eff > 0.8 ? "text-green-400" : "text-amber-400"}`}>{s.eff.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{s.roi.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center">
                    <Badge label={`${(s.risk * 100).toFixed(0)}%`} color={s.risk > 0.5 ? "red" : s.risk > 0.3 ? "amber" : "green"} />
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-purple-400">{s.pri.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Avg Effect." value="0.765" color="text-green-400" />
        <StatBox label="Cost Efficiency" value="3.18" color="text-cyan-400" />
        <StatBox label="High Priority" value="3" color="text-amber-400" />
        <StatBox label="Budget Used" value="78.5%" color="text-purple-400" />
      </div>
    </div>
  );
}

function SelfModelTab() {
  const [dimension, setDimension] = useState(SELF_MODEL_DIMS[5]);
  const [window, setWindow] = useState("10");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Self-Model Dimension" value={dimension} options={SELF_MODEL_DIMS} onChange={setDimension} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Calibration Window</label>
          <input type="range" min="3" max="50" step="1" value={window} onChange={(e) => setWindow(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{window} steps</div>
        </div>
      </div>
      <Card title="Self-Model Calibration Assessment">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-right py-2 px-2">Actual</th>
                <th className="text-right py-2 px-2">Predicted</th>
                <th className="text-right py-2 px-2">Cal. Error</th>
                <th className="text-center py-2 px-2">Grade</th>
                <th className="text-center py-2 px-2">Trend</th>
                <th className="text-center py-2 px-2">Signal</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "ASM-001", actual: 0.82, pred: 0.79, err: 0.03, grade: "A", trend: "stable", signal: "positive" },
                { id: "ASM-002", actual: 0.84, pred: 0.81, err: 0.03, grade: "A", trend: "up", signal: "positive" },
                { id: "ASM-003", actual: 0.83, pred: 0.88, err: 0.05, grade: "A", trend: "up", signal: "negative" },
                { id: "ASM-004", actual: 0.86, pred: 0.83, err: 0.03, grade: "A", trend: "up", signal: "positive" },
                { id: "ASM-005", actual: 0.85, pred: 0.90, err: 0.05, grade: "A", trend: "stable", signal: "negative" },
                { id: "ASM-006", actual: 0.88, pred: 0.85, err: 0.03, grade: "A", trend: "up", signal: "positive" },
              ].map((a) => (
                <tr key={a.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 px-2 font-mono text-xs">{a.id}</td>
                  <td className="py-2 px-2 text-right font-mono text-green-400">{a.actual.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{a.pred.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${a.err < 0.05 ? "text-green-400" : "text-amber-400"}`}>{a.err.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">
                    <Badge label={a.grade} color={a.grade === "A" ? "green" : a.grade === "B" ? "cyan" : "amber"} />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <Badge label={a.trend} color={a.trend === "up" ? "green" : a.trend === "down" ? "red" : "blue"} />
                  </td>
                  <td className="py-2 px-2 text-center">
                    <Badge label={a.signal} color={a.signal === "positive" ? "green" : a.signal === "negative" ? "red" : "blue"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Cal. Accuracy" value="0.962" color="text-green-400" />
        <StatBox label="Overconfident" value="16.7%" color="text-amber-400" />
        <StatBox label="Current Level" value="0.880" color="text-cyan-400" />
        <StatBox label="Self-Awareness" value="0.924" color="text-purple-400" />
      </div>
    </div>
  );
}

function IntrospectTab() {
  const [itype, setItype] = useState(INTROSPECTION_TYPES[5]);
  const [thoroughness, setThoroughness] = useState("0.80");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Introspection Type" value={itype} options={INTROSPECTION_TYPES} onChange={setItype} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Thoroughness</label>
          <input type="range" min="0.1" max="1" step="0.05" value={thoroughness} onChange={(e) => setThoroughness(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{thoroughness}</div>
        </div>
      </div>
      <Card title="Introspective Audit Results">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Decision Point</th>
                <th className="text-right py-2 px-2">Consistency</th>
                <th className="text-right py-2 px-2">Coherence</th>
                <th className="text-center py-2 px-2">Issue</th>
                <th className="text-center py-2 px-2">Severity</th>
                <th className="text-left py-2 px-2">Recommendation</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "AUD-001", dp: "variable_selection", cons: 0.88, coh: 0.92, issue: false, sev: 0.0, rec: "maintain" },
                { id: "AUD-002", dp: "model_specification", cons: 0.82, coh: 0.78, issue: true, sev: 0.35, rec: "add_robustness_check" },
                { id: "AUD-003", dp: "identification_strategy", cons: 0.91, coh: 0.88, issue: false, sev: 0.0, rec: "maintain" },
                { id: "AUD-004", dp: "estimator_choice", cons: 0.75, coh: 0.82, issue: true, sev: 0.52, rec: "reconsider_alternative" },
                { id: "AUD-005", dp: "hypothesis_formulation", cons: 0.85, coh: 0.90, issue: false, sev: 0.0, rec: "maintain" },
                { id: "AUD-006", dp: "evidence_evaluation", cons: 0.79, coh: 0.72, issue: true, sev: 0.28, rec: "strengthen_evidence" },
              ].map((a) => (
                <tr key={a.id} className={`border-b border-gray-800 hover:bg-gray-800/40 ${a.issue && a.sev > 0.4 ? "bg-red-900/10" : ""}`}>
                  <td className="py-2 px-2 font-mono text-xs">{a.id}</td>
                  <td className="py-2 px-2"><Badge label={a.dp.replace(/_/g, " ")} color="purple" /></td>
                  <td className={`py-2 px-2 text-right font-mono ${a.cons > 0.85 ? "text-green-400" : "text-amber-400"}`}>{a.cons.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${a.coh > 0.85 ? "text-green-400" : "text-amber-400"}`}>{a.coh.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">{a.issue ? "⚠" : "✓"}</td>
                  <td className={`py-2 px-2 text-center ${a.sev > 0.4 ? "text-red-400" : a.sev > 0 ? "text-amber-400" : "text-gray-500"}`}>
                    {a.sev.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-xs"><Badge label={a.rec.replace(/_/g, " ")} color={a.rec === "maintain" ? "green" : "amber"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Avg Consistency" value="0.833" color="text-green-400" />
        <StatBox label="Issue Rate" value="50.0%" color="text-amber-400" />
        <StatBox label="Critical Issues" value="1" color="text-red-400" />
        <StatBox label="Quality Index" value="0.706" color="text-purple-400" />
      </div>
    </div>
  );
}

function MetaLearnTab() {
  const [strategy, setStrategy] = useState(META_LEARNING_STRATEGIES[5]);
  const [breadth, setBreadth] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Meta-Learning Strategy" value={strategy} options={META_LEARNING_STRATEGIES} onChange={setStrategy} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Transfer Breadth</label>
          <input type="range" min="0.1" max="1" step="0.05" value={breadth} onChange={(e) => setBreadth(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{breadth}</div>
        </div>
      </div>
      <Card title="Cross-Stage Knowledge Transfer">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-center py-2 px-2">Source → Target</th>
                <th className="text-right py-2 px-2">Transfer</th>
                <th className="text-right py-2 px-2">Gain</th>
                <th className="text-right py-2 px-2">Retention</th>
                <th className="text-center py-2 px-2">Neg. Risk</th>
                <th className="text-right py-2 px-2">Quality</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "LES-001", src: "discovery", tgt: "fairness", transfer: 0.82, gain: 0.065, ret: 0.88, neg: 0.02, quality: 0.75 },
                { id: "LES-002", src: "explanation", tgt: "curriculum", transfer: 0.78, gain: 0.058, ret: 0.91, neg: 0.03, quality: 0.78 },
                { id: "LES-003", src: "argumentation", tgt: "optimization", transfer: 0.71, gain: 0.045, ret: 0.85, neg: 0.05, quality: 0.72 },
                { id: "LES-004", src: "fairness", tgt: "intervention", transfer: 0.68, gain: 0.042, ret: 0.87, neg: 0.04, quality: 0.70 },
                { id: "LES-005", src: "curriculum", tgt: "distillation", transfer: 0.75, gain: 0.052, ret: 0.89, neg: 0.03, quality: 0.74 },
                { id: "LES-006", src: "optimization", tgt: "ensemble", transfer: 0.85, gain: 0.072, ret: 0.92, neg: 0.01, quality: 0.82 },
              ].map((l) => (
                <tr key={l.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 px-2 font-mono text-xs">{l.id}</td>
                  <td className="py-2 px-2 text-center text-xs">
                    <Badge label={l.src} color="blue" /> → <Badge label={l.tgt} color="green" />
                  </td>
                  <td className={`py-2 px-2 text-right font-mono ${l.transfer > 0.8 ? "text-green-400" : "text-amber-400"}`}>{l.transfer.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">+{l.gain.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-purple-400">{l.ret.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-center ${l.neg > 0.05 ? "text-red-400" : "text-green-400"}`}>{l.neg.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right font-mono text-blue-400">{l.quality.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Avg Gain" value="+0.056" color="text-green-400" />
        <StatBox label="Avg Retention" value="0.887" color="text-cyan-400" />
        <StatBox label="Meta Effective." value="0.512" color="text-purple-400" />
        <StatBox label="Pipeline Cov." value="54.5%" color="text-amber-400" />
      </div>
    </div>
  );
}

function DebiasTab() {
  const [biasType, setBiasType] = useState(COGNITIVE_BIASES[5]);
  const [strength, setStrength] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Cognitive Bias Type" value={biasType} options={COGNITIVE_BIASES} onChange={setBiasType} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Debias Strength</label>
          <input type="range" min="0.1" max="1" step="0.05" value={strength} onChange={(e) => setStrength(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{strength}</div>
        </div>
      </div>
      <Card title="Cognitive Bias Detection & Correction">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Reasoning Step</th>
                <th className="text-center py-2 px-2">Detected</th>
                <th className="text-right py-2 px-2">Severity</th>
                <th className="text-left py-2 px-2">Method</th>
                <th className="text-right py-2 px-2">Residual</th>
                <th className="text-right py-2 px-2">Confidence</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "DBI-001", step: "hypothesis_gen", det: true, sev: 0.42, method: "perspective_shift", res: 0.08, conf: 0.92 },
                { id: "DBI-002", step: "evidence_collect", det: false, sev: 0.0, method: "none", res: 0.0, conf: 0.88 },
                { id: "DBI-003", step: "pattern_recognition", det: true, sev: 0.55, method: "adversarial_challenge", res: 0.12, conf: 0.88 },
                { id: "DBI-004", step: "causal_attribution", det: true, sev: 0.38, method: "reweighting", res: 0.06, conf: 0.94 },
                { id: "DBI-005", step: "strength_assess", det: false, sev: 0.0, method: "none", res: 0.0, conf: 0.91 },
                { id: "DBI-006", step: "conclusion_synth", det: true, sev: 0.62, method: "ensemble_debias", res: 0.10, conf: 0.90 },
              ].map((d) => (
                <tr key={d.id} className={`border-b border-gray-800 hover:bg-gray-800/40 ${d.det && d.sev > 0.5 ? "bg-red-900/10" : ""}`}>
                  <td className="py-2 px-2 font-mono text-xs">{d.id}</td>
                  <td className="py-2 px-2"><Badge label={d.step.replace(/_/g, " ")} color="purple" /></td>
                  <td className="py-2 px-2 text-center">{d.det ? "⚠" : "✓"}</td>
                  <td className={`py-2 px-2 text-right font-mono ${d.sev > 0.5 ? "text-red-400" : d.sev > 0 ? "text-amber-400" : "text-gray-500"}`}>
                    {d.sev.toFixed(2)}
                  </td>
                  <td className="py-2 px-2"><Badge label={d.method.replace(/_/g, " ")} color={d.method === "none" ? "green" : "cyan"} /></td>
                  <td className={`py-2 px-2 text-right font-mono ${d.res > 0.1 ? "text-amber-400" : "text-green-400"}`}>{d.res.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right font-mono text-green-400">{d.conf.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Detection Rate" value="66.7%" color="text-amber-400" />
        <StatBox label="Correction Eff." value="0.812" color="text-green-400" />
        <StatBox label="Avg Residual" value="0.060" color="text-cyan-400" />
        <StatBox label="Debiased Conf." value="0.970" color="text-purple-400" />
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card title="Engine Info">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div><span className="text-gray-500">Engine:</span> v1.260 — Graph Causal Meta-Cognitive Engine</div>
          <div><span className="text-gray-500">Role:</span> Self-aware causal reasoning — introspection, meta-learning, debiasing</div>
          <div><span className="text-gray-500">Predecessor:</span> v1.259 — Causal Feedback Loop Engine</div>
          <div><span className="text-gray-500">Enums:</span> 6 enums × 6 values = 36</div>
        </div>
      </Card>
      <Card title="Enums">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { name: "MetaCognitiveLevel", vals: META_LEVELS },
            { name: "ReasoningMode", vals: REASONING_MODES },
            { name: "SelfModelDimension", vals: SELF_MODEL_DIMS },
            { name: "IntrospectionType", vals: INTROSPECTION_TYPES },
            { name: "MetaLearningStrategy", vals: META_LEARNING_STRATEGIES },
            { name: "CognitiveBiasType", vals: COGNITIVE_BIASES },
          ].map((e) => (
            <div key={e.name} className="bg-gray-900/60 rounded p-3">
              <div className="text-xs text-purple-400 font-semibold mb-2">{e.name}</div>
              <div className="flex flex-wrap gap-1">
                {e.vals.map((v) => (
                  <Badge key={v} label={v.replace(/_/g, " ")} color="blue" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Endpoints">
        <div className="space-y-1 text-sm font-mono text-gray-300">
          <div className="text-green-400">POST /graph/causal-meta-cognitive/reflect</div>
          <div className="text-green-400">POST /graph/causal-meta-cognitive/strategize</div>
          <div className="text-green-400">POST /graph/causal-meta-cognitive/self-model</div>
          <div className="text-green-400">POST /graph/causal-meta-cognitive/introspect</div>
          <div className="text-green-400">POST /graph/causal-meta-cognitive/meta-learn</div>
          <div className="text-green-400">POST /graph/causal-meta-cognitive/debias</div>
          <div className="text-cyan-400">GET  /graph/causal-meta-cognitive/overview</div>
        </div>
      </Card>
      <Card title="Causal Meta-Cognitive Layer">
        <div className="text-sm text-gray-300 font-mono space-y-1">
          <div>Causal Pipeline (11 stages):</div>
          <div>Discovery → Explanation → Argumentation → Fairness → Curriculum → Optimization</div>
          <div>→ Intervention → Distillation → Ensemble → Temporal Evolution → Feedback Loop</div>
          <div className="mt-2 text-emerald-400 font-bold">Meta-Cognitive Layer (v1.260): Reflect → Strategize → Self-Model → Introspect → Meta-Learn → Debias</div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function CausalMetaCognitivePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Reflect");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Causal Meta-Cognitive Engine
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              v1.260 — Self-aware causal reasoning: reflect → strategize → self-model → introspect → meta-learn → debias
            </p>
          </div>
          <Badge label="v1.260" color="purple" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-gray-700 text-white font-semibold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          {activeTab === "Reflect" && <ReflectTab />}
          {activeTab === "Strategize" && <StrategizeTab />}
          {activeTab === "Self-Model" && <SelfModelTab />}
          {activeTab === "Introspect" && <IntrospectTab />}
          {activeTab === "Meta-Learn" && <MetaLearnTab />}
          {activeTab === "Debias" && <DebiasTab />}
          {activeTab === "Overview" && <OverviewTab />}
        </div>
      </div>
    </div>
  );
}
