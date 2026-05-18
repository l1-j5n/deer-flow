"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════
   v1.259 — Graph Causal Feedback Loop Engine
   7 tabs: Observe | Evaluate | Adapt | Track | Correct | Converge | Overview
   ═══════════════════════════════════════════════════════ */

const TABS = ["Observe", "Evaluate", "Adapt", "Track", "Correct", "Converge", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const FEEDBACK_TYPES = ["outcome_observed","prediction_error","hypothesis_validated","hypothesis_rejected","intervention_result","ai_adaptive_feedback"];
const LEARNING_SIGNALS = ["positive_reinforcement","negative_correction","neutral_calibration","strong_signal","weak_signal","ai_contextual_signal"];
const ADAPTATION_MODES = ["conservative","moderate","aggressive","exploratory","consolidating","ai_balanced_adaptation"];
const LOOP_PHASES = ["observe","predict","act","measure","learn","ai_meta_adapt"];
const CORRECTION_STRATEGIES = ["parameter_update","structure_revision","confounder_reassessment","strength_recalibration","direction_reversal","ai_holistic_correction"];
const FEEDBACK_GRANULARITIES = ["fine_grained","edge_level","path_level","subgraph_level","graph_level","ai_multi_scale"];

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

function ObserveTab() {
  const [feedbackType, setFeedbackType] = useState(FEEDBACK_TYPES[5]);
  const [granularity, setGranularity] = useState(FEEDBACK_GRANULARITIES[1]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Feedback Type" value={feedbackType} options={FEEDBACK_TYPES} onChange={setFeedbackType} />
        <SelectField label="Granularity" value={granularity} options={FEEDBACK_GRANULARITIES} onChange={setGranularity} />
      </div>
      <Card title="Real-World Observations vs Predictions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-right py-2 px-2">Predicted</th>
                <th className="text-right py-2 px-2">Actual</th>
                <th className="text-right py-2 px-2">Error</th>
                <th className="text-center py-2 px-2">Surprise</th>
                <th className="text-center py-2 px-2">Direction</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "OBS-001", pred: 0.72, act: 0.68, err: 0.04, surp: false, dir: "aligned" },
                { id: "OBS-002", pred: 0.55, act: 0.81, err: 0.26, surp: true, dir: "misaligned" },
                { id: "OBS-003", pred: 0.63, act: 0.59, err: 0.04, surp: false, dir: "aligned" },
                { id: "OBS-004", pred: 0.48, act: 0.45, err: 0.03, surp: false, dir: "aligned" },
                { id: "OBS-005", pred: 0.71, act: 0.42, err: 0.29, surp: true, dir: "misaligned" },
                { id: "OBS-006", pred: 0.66, act: 0.70, err: 0.04, surp: false, dir: "aligned" },
              ].map((o) => (
                <tr key={o.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 px-2 font-mono text-xs">{o.id}</td>
                  <td className="py-2 px-2"><Badge label={feedbackType.replace(/_/g, " ")} color="purple" /></td>
                  <td className="py-2 px-2 text-right font-mono">{o.pred.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono">{o.act.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${o.err > 0.2 ? "text-red-400" : "text-green-400"}`}>
                    {o.err.toFixed(3)}
                  </td>
                  <td className="py-2 px-2 text-center">{o.surp ? "⚡" : "✓"}</td>
                  <td className="py-2 px-2 text-center">
                    <Badge label={o.dir} color={o.dir === "aligned" ? "green" : "red"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Surprise Rate" value="33.3%" color="text-amber-400" />
        <StatBox label="Avg Error" value="0.117" color="text-red-400" />
        <StatBox label="Alignment" value="0.883" color="text-green-400" />
        <StatBox label="Reliability" value="0.812" color="text-cyan-400" />
      </div>
    </div>
  );
}

function EvaluateTab() {
  const [signal, setSignal] = useState(LEARNING_SIGNALS[5]);
  const [rigor, setRigor] = useState("0.80");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Learning Signal" value={signal} options={LEARNING_SIGNALS} onChange={setSignal} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Rigor Threshold</label>
          <input type="range" min="0.1" max="1" step="0.05" value={rigor} onChange={(e) => setRigor(e.target.value)}
            className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{rigor}</div>
        </div>
      </div>
      <Card title="Prediction Evaluation Results">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-right py-2 px-2">Error</th>
                <th className="text-right py-2 px-2">Accuracy</th>
                <th className="text-center py-2 px-2">Bias</th>
                <th className="text-right py-2 px-2">Calibration</th>
                <th className="text-right py-2 px-2">Discrimination</th>
                <th className="text-center py-2 px-2">Pass</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "P-001", err: 0.08, acc: 0.92, bias: "unbiased", cal: 0.94, disc: 0.88, pass: true },
                { id: "P-002", err: 0.15, acc: 0.85, bias: "overestimate", cal: 0.78, disc: 0.82, pass: true },
                { id: "P-003", err: 0.22, acc: 0.78, bias: "underestimate", cal: 0.65, disc: 0.76, pass: false },
                { id: "P-004", err: 0.05, acc: 0.95, bias: "unbiased", cal: 0.96, disc: 0.91, pass: true },
                { id: "P-005", err: 0.18, acc: 0.82, bias: "overestimate", cal: 0.72, disc: 0.79, pass: true },
                { id: "P-006", err: 0.03, acc: 0.97, bias: "unbiased", cal: 0.98, disc: 0.93, pass: true },
              ].map((e) => (
                <tr key={e.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 px-2 font-mono text-xs">{e.id}</td>
                  <td className={`py-2 px-2 text-right font-mono ${e.err > 0.15 ? "text-red-400" : "text-green-400"}`}>{e.err.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono">{e.acc.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center"><Badge label={e.bias} color={e.bias === "unbiased" ? "green" : "amber"} /></td>
                  <td className="py-2 px-2 text-right font-mono">{e.cal.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono">{e.disc.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">{e.pass ? "✓" : "✗"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Avg Accuracy" value="0.882" color="text-green-400" />
        <StatBox label="Pass Rate" value="83.3%" color="text-cyan-400" />
        <StatBox label="Calibration" value="0.838" color="text-purple-400" />
        <StatBox label="Effectiveness" value="0.785" color="text-amber-400" />
      </div>
    </div>
  );
}

function AdaptTab() {
  const [mode, setMode] = useState(ADAPTATION_MODES[5]);
  const [phase, setPhase] = useState(LOOP_PHASES[4]);
  const [lr, setLr] = useState("0.10");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <SelectField label="Adaptation Mode" value={mode} options={ADAPTATION_MODES} onChange={setMode} />
        <SelectField label="Loop Phase" value={phase} options={LOOP_PHASES} onChange={setPhase} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Learning Rate</label>
          <input type="range" min="0.01" max="1" step="0.01" value={lr} onChange={(e) => setLr(e.target.value)}
            className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{lr}</div>
        </div>
      </div>
      <Card title="Model Adaptations">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Parameter</th>
                <th className="text-right py-2 px-2">Old</th>
                <th className="text-right py-2 px-2">New</th>
                <th className="text-right py-2 px-2">Change</th>
                <th className="text-center py-2 px-2">Direction</th>
                <th className="text-right py-2 px-2">Rollback Risk</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "ADJ-001", param: "edge_strength", old: 0.65, new: 0.68, dir: "increase", risk: 0.02 },
                { id: "ADJ-002", param: "confounder_weight", old: 0.42, new: 0.38, dir: "decrease", risk: 0.04 },
                { id: "ADJ-003", param: "mediation_ratio", old: 0.55, new: 0.61, dir: "increase", risk: 0.01 },
                { id: "ADJ-004", param: "selection_bias", old: 0.28, new: 0.22, dir: "decrease", risk: 0.03 },
                { id: "ADJ-005", param: "instrumental_str.", old: 0.73, new: 0.76, dir: "increase", risk: 0.01 },
                { id: "ADJ-006", param: "effect_heterogeneity", old: 0.48, new: 0.44, dir: "decrease", risk: 0.02 },
              ].map((a) => {
                const change = Math.abs(a.new - a.old);
                return (
                  <tr key={a.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                    <td className="py-2 px-2 font-mono text-xs">{a.id}</td>
                    <td className="py-2 px-2">{a.param}</td>
                    <td className="py-2 px-2 text-right font-mono">{a.old.toFixed(3)}</td>
                    <td className="py-2 px-2 text-right font-mono">{a.new.toFixed(3)}</td>
                    <td className={`py-2 px-2 text-right font-mono ${a.dir === "increase" ? "text-green-400" : "text-red-400"}`}>
                      {change.toFixed(3)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <Badge label={a.dir} color={a.dir === "increase" ? "green" : "red"} />
                    </td>
                    <td className={`py-2 px-2 text-right font-mono ${a.risk > 0.03 ? "text-amber-400" : "text-gray-400"}`}>
                      {a.risk.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Total Change" value="0.340" color="text-amber-400" />
        <StatBox label="Confidence Δ" value="+0.085" color="text-green-400" />
        <StatBox label="Max Risk" value="0.040" color="text-red-400" />
        <StatBox label="Efficiency" value="0.944" color="text-cyan-400" />
      </div>
    </div>
  );
}

function TrackTab() {
  const [granularity, setGranularity] = useState(FEEDBACK_GRANULARITIES[2]);
  const iterations = [
    { i: 1, phase: "observe", acc: 0.52, delta: 0.02, conv: 0.04, vel: 0.20 },
    { i: 2, phase: "predict", acc: 0.56, delta: 0.04, conv: 0.12, vel: 0.40 },
    { i: 3, phase: "act", acc: 0.61, delta: 0.05, conv: 0.22, vel: 0.50 },
    { i: 4, phase: "measure", acc: 0.64, delta: 0.03, conv: 0.28, vel: 0.30 },
    { i: 5, phase: "learn", acc: 0.69, delta: 0.05, conv: 0.38, vel: 0.50 },
    { i: 6, phase: "ai_meta_adapt", acc: 0.73, delta: 0.04, conv: 0.46, vel: 0.40 },
    { i: 7, phase: "observe", acc: 0.76, delta: 0.03, conv: 0.52, vel: 0.30 },
    { i: 8, phase: "predict", acc: 0.79, delta: 0.03, conv: 0.58, vel: 0.30 },
    { i: 9, phase: "act", acc: 0.82, delta: 0.03, conv: 0.64, vel: 0.30 },
    { i: 10, phase: "measure", acc: 0.84, delta: 0.02, conv: 0.68, vel: 0.20 },
  ];
  return (
    <div className="space-y-4">
      <SelectField label="Granularity" value={granularity} options={FEEDBACK_GRANULARITIES} onChange={setGranularity} />
      <Card title="Feedback Loop Progress">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-center py-2 px-2">#</th>
                <th className="text-center py-2 px-2">Phase</th>
                <th className="text-right py-2 px-2">Accuracy</th>
                <th className="text-right py-2 px-2">Δ</th>
                <th className="text-right py-2 px-2">Conv.</th>
                <th className="text-right py-2 px-2">Velocity</th>
                <th className="text-right py-2 px-2">Cumul.</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {iterations.map((it) => (
                <tr key={it.i} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 px-2 text-center font-mono">{it.i}</td>
                  <td className="py-2 px-2 text-center"><Badge label={it.phase} color="purple" /></td>
                  <td className={`py-2 px-2 text-right font-mono ${it.acc >= 0.75 ? "text-green-400" : "text-amber-400"}`}>
                    {it.acc.toFixed(3)}
                  </td>
                  <td className={`py-2 px-2 text-right font-mono ${it.delta > 0 ? "text-green-400" : "text-red-400"}`}>
                    {it.delta > 0 ? "+" : ""}{it.delta.toFixed(3)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{it.conv.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono">{it.vel.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-blue-400">{(it.acc - 0.5).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Total Gain" value="+0.340" color="text-green-400" />
        <StatBox label="Peak Acc." value="0.840" color="text-cyan-400" />
        <StatBox label="Avg Velocity" value="0.340" color="text-purple-400" />
        <StatBox label="Trend" value="converging" color="text-green-400" />
      </div>
    </div>
  );
}

function CorrectTab() {
  const [strategy, setStrategy] = useState(CORRECTION_STRATEGIES[5]);
  const [intensity, setIntensity] = useState("0.50");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Correction Strategy" value={strategy} options={CORRECTION_STRATEGIES} onChange={setStrategy} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Intensity</label>
          <input type="range" min="0.1" max="1" step="0.05" value={intensity} onChange={(e) => setIntensity(e.target.value)}
            className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{intensity}</div>
        </div>
      </div>
      <Card title="Applied Corrections">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Target</th>
                <th className="text-right py-2 px-2">Pre</th>
                <th className="text-right py-2 px-2">Magnitude</th>
                <th className="text-right py-2 px-2">Post</th>
                <th className="text-center py-2 px-2">Cascades</th>
                <th className="text-right py-2 px-2">Reversible</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "COR-001", target: "X→Y_direct", pre: 0.62, mag: 0.18, post: 0.72, casc: 1, rev: 0.92 },
                { id: "COR-002", target: "X→M→Y_med", pre: 0.45, mag: 0.25, post: 0.38, casc: 3, rev: 0.75 },
                { id: "COR-003", target: "C→X_confound", pre: 0.33, mag: 0.15, post: 0.28, casc: 0, rev: 0.95 },
                { id: "COR-004", target: "X→Y_moderated", pre: 0.71, mag: 0.30, post: 0.82, casc: 2, rev: 0.68 },
                { id: "COR-005", target: "Z_instrument", pre: 0.55, mag: 0.22, post: 0.62, casc: 1, rev: 0.88 },
                { id: "COR-006", target: "X→Y_hetero", pre: 0.48, mag: 0.12, post: 0.52, casc: 0, rev: 0.96 },
              ].map((c) => (
                <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 px-2 font-mono text-xs">{c.id}</td>
                  <td className="py-2 px-2">{c.target}</td>
                  <td className="py-2 px-2 text-right font-mono">{c.pre.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${c.mag > 0.2 ? "text-amber-400" : "text-gray-400"}`}>{c.mag.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono">{c.post.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-center ${c.casc > 2 ? "text-red-400" : "text-gray-400"}`}>{c.casc}</td>
                  <td className={`py-2 px-2 text-right font-mono ${c.rev < 0.7 ? "text-red-400" : "text-green-400"}`}>{c.rev.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Avg Magnitude" value="0.203" color="text-amber-400" />
        <StatBox label="Confidence Δ" value="+0.142" color="text-green-400" />
        <StatBox label="Cascades" value="7" color="text-red-400" />
        <StatBox label="Effectiveness" value="0.832" color="text-cyan-400" />
      </div>
    </div>
  );
}

function ConvergeTab() {
  const [threshold, setThreshold] = useState("0.010");
  const [patience, setPatience] = useState("3");
  const cycles = [
    { c: 1, acc: 0.48, delta: 0.032, conv: 0.032, below: false, phase: "learning" },
    { c: 2, acc: 0.52, delta: 0.041, conv: 0.041, below: false, phase: "learning" },
    { c: 3, acc: 0.56, delta: 0.038, conv: 0.038, below: false, phase: "learning" },
    { c: 4, acc: 0.60, delta: 0.035, conv: 0.035, below: false, phase: "learning" },
    { c: 5, acc: 0.63, delta: 0.028, conv: 0.028, below: false, phase: "learning" },
    { c: 6, acc: 0.66, delta: 0.022, conv: 0.022, below: false, phase: "learning" },
    { c: 7, acc: 0.68, delta: 0.018, conv: 0.018, below: false, phase: "learning" },
    { c: 8, acc: 0.70, delta: 0.009, conv: 0.009, below: true, phase: "learning" },
    { c: 9, acc: 0.71, delta: 0.006, conv: 0.006, below: true, phase: "learning" },
    { c: 10, acc: 0.72, delta: 0.004, conv: 0.004, below: true, phase: "converged" },
  ];
  const converged = cycles.some(c => c.phase === "converged");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Convergence Threshold</label>
          <input type="range" min="0.001" max="0.1" step="0.001" value={threshold} onChange={(e) => setThreshold(e.target.value)}
            className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{threshold}</div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Patience</label>
          <input type="range" min="1" max="10" step="1" value={patience} onChange={(e) => setPatience(e.target.value)}
            className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{patience}</div>
        </div>
      </div>
      <Card title="Convergence Dynamics">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-center py-2 px-2">Cycle</th>
                <th className="text-right py-2 px-2">Accuracy</th>
                <th className="text-right py-2 px-2">Δ</th>
                <th className="text-right py-2 px-2">Conv. Metric</th>
                <th className="text-center py-2 px-2">Below Thresh</th>
                <th className="text-center py-2 px-2">Phase</th>
                <th className="text-right py-2 px-2">Gain</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {cycles.map((cy) => (
                <tr key={cy.c} className={`border-b border-gray-800 hover:bg-gray-800/40 ${cy.phase === "converged" ? "bg-emerald-900/20" : ""}`}>
                  <td className="py-2 px-2 text-center font-mono">{cy.c}</td>
                  <td className="py-2 px-2 text-right font-mono text-green-400">{cy.acc.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${cy.delta > 0.02 ? "text-amber-400" : "text-green-400"}`}>
                    {cy.delta.toFixed(4)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{cy.conv.toFixed(4)}</td>
                  <td className="py-2 px-2 text-center">{cy.below ? "✓" : "✗"}</td>
                  <td className="py-2 px-2 text-center">
                    <Badge label={cy.phase} color={cy.phase === "converged" ? "green" : "amber"} />
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-blue-400">{(cy.acc - 0.45).toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Converged" value={converged ? "Yes ✓" : "No"} color={converged ? "text-green-400" : "text-red-400"} />
        <StatBox label="Final Acc." value="0.720" color="text-green-400" />
        <StatBox label="Total Gain" value="+0.270" color="text-cyan-400" />
        <StatBox label="Speed" value="fast" color="text-purple-400" />
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card title="Engine Info">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div><span className="text-gray-500">Engine:</span> v1.259 — Graph Causal Feedback Loop Engine</div>
          <div><span className="text-gray-500">Role:</span> Close the causal loop — observe, evaluate, adapt, converge</div>
          <div><span className="text-gray-500">Predecessor:</span> v1.258 — Causal Temporal Evolution Engine</div>
          <div><span className="text-gray-500">Enums:</span> 6 enums × 6 values = 36</div>
        </div>
      </Card>
      <Card title="Enums">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { name: "FeedbackType", vals: FEEDBACK_TYPES },
            { name: "LearningSignal", vals: LEARNING_SIGNALS },
            { name: "AdaptationMode", vals: ADAPTATION_MODES },
            { name: "LoopPhase", vals: LOOP_PHASES },
            { name: "CorrectionStrategy", vals: CORRECTION_STRATEGIES },
            { name: "FeedbackGranularity", vals: FEEDBACK_GRANULARITIES },
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
          <div className="text-green-400">POST /graph/causal-feedback/observe</div>
          <div className="text-green-400">POST /graph/causal-feedback/evaluate</div>
          <div className="text-green-400">POST /graph/causal-feedback/adapt</div>
          <div className="text-green-400">POST /graph/causal-feedback/track</div>
          <div className="text-green-400">POST /graph/causal-feedback/correct</div>
          <div className="text-green-400">POST /graph/causal-feedback/converge</div>
          <div className="text-cyan-400">GET  /graph/causal-feedback/overview</div>
        </div>
      </Card>
      <Card title="Causal Pipeline (11 stages)">
        <div className="text-sm text-gray-300 font-mono space-y-1">
          <div>Discovery (v1.249) → Explanation (v1.250) → Argumentation (v1.251)</div>
          <div>→ Fairness (v1.252) → Curriculum (v1.253) → Optimization (v1.254)</div>
          <div>→ Intervention (v1.255) → Distillation (v1.256) → Ensemble (v1.257)</div>
          <div>→ Temporal Evolution (v1.258) → <span className="text-emerald-400 font-bold">Feedback Loop (v1.259)</span></div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function CausalFeedbackLoopPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Observe");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Causal Feedback Loop Engine
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              v1.259 — Close the causal loop: observe outcomes → evaluate predictions → adapt models → converge
            </p>
          </div>
          <Badge label="v1.259" color="purple" />
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
          {activeTab === "Observe" && <ObserveTab />}
          {activeTab === "Evaluate" && <EvaluateTab />}
          {activeTab === "Adapt" && <AdaptTab />}
          {activeTab === "Track" && <TrackTab />}
          {activeTab === "Correct" && <CorrectTab />}
          {activeTab === "Converge" && <ConvergeTab />}
          {activeTab === "Overview" && <OverviewTab />}
        </div>
      </div>
    </div>
  );
}
