"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════
   v1.258 — Graph Causal Temporal Evolution Engine
   7 tabs: Evolve | Drift | Stability | Regime | Forecast | Validate | Overview
   ═══════════════════════════════════════════════════════ */

const TABS = ["Evolve", "Drift", "Stability", "Regime", "Forecast", "Validate", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const TEMPORAL_PATTERNS = ["stationary","trend","seasonal","regime_shift","cyclic","ai_adaptive_temporal"];
const EVOLUTION_MODES = ["gradual_drift","sudden_shift","incremental","abrupt_change","recurring_pattern","ai_hybrid_evolution"];
const TEMPORAL_RESOLUTIONS = ["real_time","hourly","daily","weekly","monthly","ai_adaptive_resolution"];
const CAUSAL_STABILITIES = ["highly_stable","moderately_stable","marginal_stability","unstable","chaotic","ai_dynamic_assessment"];
const WINDOW_STRATEGIES = ["sliding_window","expanding_window","tumbling_window","exponential_decay","weighted_particles","ai_adaptive_window"];
const FORECAST_HORIZONS = ["immediate","short_term","medium_term","long_term","strategic","ai_contextual_horizon"];

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

// ─── Tab Panels ──────────────────────────────────────────

function EvolveTab() {
  const [pattern, setPattern] = useState(TEMPORAL_PATTERNS[5]);
  const [resolution, setResolution] = useState(TEMPORAL_RESOLUTIONS[2]);
  const [mode, setMode] = useState(EVOLUTION_MODES[0]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <SelectField label="Temporal Pattern" value={pattern} options={TEMPORAL_PATTERNS} onChange={setPattern} />
        <SelectField label="Resolution" value={resolution} options={TEMPORAL_RESOLUTIONS} onChange={setResolution} />
        <SelectField label="Evolution Mode" value={mode} options={EVOLUTION_MODES} onChange={setMode} />
      </div>
      <Card title="Temporal Snapshots">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">Timestamp</th>
                <th className="text-right py-1 px-2">Edges</th>
                <th className="text-right py-1 px-2">Avg Strength</th>
                <th className="text-right py-1 px-2">New</th>
                <th className="text-right py-1 px-2">Vanished</th>
                <th className="text-right py-1 px-2">Entropy</th>
                <th className="text-right py-1 px-2">Density</th>
                <th className="text-right py-1 px-2">Modularity</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["T-001", 15, 0.7234, 2, 0, 0.6512, 0.4231, 0.5123],
                ["T-002", 16, 0.7145, 1, 0, 0.6678, 0.4456, 0.4987],
                ["T-003", 14, 0.6989, 0, 2, 0.7012, 0.3987, 0.4834],
                ["T-004", 17, 0.7056, 3, 0, 0.6845, 0.4678, 0.5012],
                ["T-005", 15, 0.6823, 1, 3, 0.7234, 0.4123, 0.4756],
                ["T-006", 16, 0.6734, 2, 1, 0.7456, 0.4345, 0.4623],
              ].map(([ts, edges, strength, newE, vanE, entropy, density, mod]) => (
                <tr key={ts as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400 font-mono text-xs">{ts}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{edges}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{strength}</td>
                  <td className="py-1 px-2 text-right text-green-400">{newE}</td>
                  <td className="py-1 px-2 text-right text-red-400">{vanE}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{entropy}</td>
                  <td className="py-1 px-2 text-right text-purple-400">{density}</td>
                  <td className="py-1 px-2 text-right text-cyan-400">{mod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-4 text-center">
        {[
          { label: "New Edges", val: "9", color: "text-emerald-400" },
          { label: "Vanished", val: "6", color: "text-red-400" },
          { label: "Strength Trend", val: "Decreasing", color: "text-amber-400" },
          { label: "Stability Index", val: "0.98", color: "text-blue-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DriftTab() {
  const [mode, setMode] = useState(EVOLUTION_MODES[5]);
  const [window, setWindow] = useState(WINDOW_STRATEGIES[0]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Evolution Mode" value={mode} options={EVOLUTION_MODES} onChange={setMode} />
        <SelectField label="Window Strategy" value={window} options={WINDOW_STRATEGIES} onChange={setWindow} />
      </div>
      <Card title="Drift Detection Intervals">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">Interval</th>
                <th className="text-right py-1 px-2">Magnitude</th>
                <th className="text-left py-1 px-2">Direction</th>
                <th className="text-right py-1 px-2">P-value</th>
                <th className="text-center py-1 px-2">Detected</th>
                <th className="text-center py-1 px-2">Significant</th>
                <th className="text-right py-1 px-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["I-001", 0.0312, "weakening", 0.082, false, false, 0.8912],
                ["I-002", 0.0456, "strengthening", 0.034, true, false, 0.8745],
                ["I-003", 0.0223, "stable", 0.124, false, false, 0.9123],
                ["I-004", 0.0678, "reversal", 0.008, true, true, 0.8234],
                ["I-005", 0.0189, "weakening", 0.156, false, false, 0.9345],
                ["I-006", 0.0534, "strengthening", 0.021, true, true, 0.8567],
                ["I-007", 0.0712, "reversal", 0.005, true, true, 0.8123],
                ["I-008", 0.0267, "stable", 0.098, false, false, 0.9034],
                ["I-009", 0.0823, "weakening", 0.002, true, true, 0.7856],
                ["I-010", 0.0389, "strengthening", 0.045, true, false, 0.8678],
              ].map(([id, mag, dir, pv, det, sig, conf]) => (
                <tr key={id as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400 font-mono text-xs">{id}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{mag}</td>
                  <td className="py-1 px-2 text-xs"><Badge label={dir as string} color={dir === "stable" ? "green" : dir === "reversal" ? "red" : "blue"} /></td>
                  <td className="py-1 px-2 text-right text-purple-400">{pv}</td>
                  <td className="py-1 px-2 text-center"><Badge label={det ? "YES" : "NO"} color={det ? "amber" : "green"} /></td>
                  <td className="py-1 px-2 text-center"><Badge label={sig ? "YES" : "NO"} color={sig ? "red" : "green"} /></td>
                  <td className="py-1 px-2 text-right text-emerald-400">{conf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-4 text-center">
        {[
          { label: "Drift Rate", val: "50%", color: "text-amber-400" },
          { label: "Significant", val: "4", color: "text-red-400" },
          { label: "Max Magnitude", val: "0.0823", color: "text-purple-400" },
          { label: "Trend", val: "Accelerating", color: "text-blue-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-900/60 rounded p-3">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-lg font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StabilityTab() {
  const [level, setLevel] = useState(CAUSAL_STABILITIES[1]);
  return (
    <div className="space-y-4">
      <SelectField label="Stability Level" value={level} options={CAUSAL_STABILITIES} onChange={setLevel} />
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Overall Stability", val: "0.8234", color: "text-emerald-400" },
          { label: "Grade", val: "B", color: "text-blue-400" },
          { label: "Alert Level", val: "Normal", color: "text-emerald-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
      <Card title="Stability Dimensions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">Dimension</th>
                <th className="text-right py-1 px-2">Score</th>
                <th className="text-left py-1 px-2">Trend</th>
                <th className="text-right py-1 px-2">Change Rate</th>
                <th className="text-right py-1 px-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["structural_stability", 0.8912, "stable", 0.0012, 0.9234],
                ["parametric_stability", 0.8456, "improving", 0.0034, 0.8867],
                ["predictive_stability", 0.8234, "degrading", -0.0056, 0.8612],
                ["distributional_stability", 0.7823, "stable", 0.0008, 0.8434],
                ["interventional_stability", 0.7567, "fluctuating", -0.0023, 0.8123],
                ["counterfactual_stability", 0.8123, "improving", 0.0045, 0.8956],
              ].map(([dim, score, trend, rate, conf]) => (
                <tr key={dim as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400 text-xs">{(dim as string).replace(/_/g, " ")}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{score}</td>
                  <td className="py-1 px-2 text-xs"><Badge label={trend as string} color={trend === "improving" ? "green" : trend === "degrading" ? "red" : trend === "fluctuating" ? "amber" : "blue"} /></td>
                  <td className="py-1 px-2 text-right text-purple-400">{rate}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{conf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function RegimeTab() {
  const [horizon, setHorizon] = useState(FORECAST_HORIZONS[2]);
  return (
    <div className="space-y-4">
      <SelectField label="Forecast Horizon" value={horizon} options={FORECAST_HORIZONS} onChange={setHorizon} />
      <Card title="Detected Regimes">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">ID</th>
                <th className="text-left py-1 px-2">Name</th>
                <th className="text-right py-1 px-2">Onset</th>
                <th className="text-right py-1 px-2">Duration</th>
                <th className="text-right py-1 px-2">Edges</th>
                <th className="text-right py-1 px-2">Strength</th>
                <th className="text-left py-1 px-2">Direction</th>
                <th className="text-right py-1 px-2">Complexity</th>
                <th className="text-right py-1 px-2">Transition P</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["R-001", "stable_baseline", 0.0, 45.3, 12, 0.7234, "X→Y", 0.4512, 0.3212],
                ["R-002", "growing_influence", 45.3, 62.1, 18, 0.8123, "X↔Y", 0.5834, 0.2845],
                ["R-003", "structural_shift", 107.4, 38.7, 14, 0.6545, "Y→X", 0.3456, 0.4123],
                ["R-004", "new_equilibrium", 146.1, 78.4, 16, 0.7567, "X→Y", 0.5123, 0.2678],
              ].map(([id, name, onset, dur, edges, strength, dir, complexity, trans]) => (
                <tr key={id as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400 font-mono text-xs">{id}</td>
                  <td className="py-1 px-2 text-blue-400 text-xs">{(name as string).replace(/_/g, " ")}</td>
                  <td className="py-1 px-2 text-right text-gray-400">{onset}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{dur}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{edges}</td>
                  <td className="py-1 px-2 text-right text-purple-400">{strength}</td>
                  <td className="py-1 px-2 text-amber-400 text-xs font-mono">{dir}</td>
                  <td className="py-1 px-2 text-right text-cyan-400">{complexity}</td>
                  <td className="py-1 px-2 text-right text-red-400">{trans}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Transition Matrix">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">From \ To</th>
                <th className="text-right py-1 px-2">R-001</th>
                <th className="text-right py-1 px-2">R-002</th>
                <th className="text-right py-1 px-2">R-003</th>
                <th className="text-right py-1 px-2">R-004</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["R-001", 0.42, 0.28, 0.18, 0.12],
                ["R-002", 0.15, 0.48, 0.22, 0.15],
                ["R-003", 0.08, 0.12, 0.55, 0.25],
                ["R-004", 0.20, 0.15, 0.10, 0.55],
              ].map(([from, ...vals]) => (
                <tr key={from as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400 font-mono text-xs">{from}</td>
                  {vals.map((v, i) => (
                    <td key={i} className={`py-1 px-2 text-right ${(v as number) >= 0.4 ? "text-emerald-400" : "text-gray-400"}`}>{(v as number).toFixed(2)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Most Stable", val: "new_equilibrium", color: "text-emerald-400" },
          { label: "Current Regime", val: "new_equilibrium", color: "text-blue-400" },
          { label: "Regime Diversity", val: "1.00", color: "text-purple-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-lg font-bold ${m.color}`}>{m.val.replace(/_/g, " ")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ForecastTab() {
  const [horizon, setHorizon] = useState(FORECAST_HORIZONS[1]);
  return (
    <div className="space-y-4">
      <SelectField label="Forecast Horizon" value={horizon} options={FORECAST_HORIZONS} onChange={setHorizon} />
      <Card title="Causal Trajectory Forecast (10-step)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-right py-1 px-2">Step</th>
                <th className="text-right py-1 px-2">Treatment Effect</th>
                <th className="text-right py-1 px-2">Mediation</th>
                <th className="text-right py-1 px-2">Confounding</th>
                <th className="text-right py-1 px-2">Instrument</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 0.4523, 0.3812, 0.2934, 0.6745],
                [2, 0.4678, 0.3745, 0.3012, 0.6812],
                [3, 0.4834, 0.3623, 0.3156, 0.6934],
                [4, 0.4989, 0.3567, 0.3234, 0.6856],
                [5, 0.5123, 0.3489, 0.3345, 0.6978],
                [6, 0.5278, 0.3412, 0.3423, 0.7034],
                [7, 0.5412, 0.3356, 0.3512, 0.7145],
                [8, 0.5534, 0.3289, 0.3589, 0.7089],
                [9, 0.5678, 0.3234, 0.3678, 0.7212],
                [10, 0.5823, 0.3178, 0.3734, 0.7234],
              ].map(([step, te, med, conf, inst]) => (
                <tr key={step} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-right text-gray-500">{step}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{te.toFixed(4)}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{med.toFixed(4)}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{conf.toFixed(4)}</td>
                  <td className="py-1 px-2 text-right text-purple-400">{inst.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Reliability", val: "0.7480", color: "text-emerald-400" },
          { label: "Avg Volatility", val: "0.0142", color: "text-blue-400" },
          { label: "Increasing Targets", val: "4 / 4", color: "text-purple-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValidateTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4 text-center">
        {[
          { label: "Total Claims", val: "6", color: "text-blue-400" },
          { label: "Passing", val: "5", color: "text-emerald-400" },
          { label: "Pass Rate", val: "83.3%", color: "text-purple-400" },
          { label: "Avg Validity", val: "0.7456", color: "text-amber-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
      <Card title="Temporal Causal Claims Validation">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">ID</th>
                <th className="text-left py-1 px-2">Claim Type</th>
                <th className="text-right py-1 px-2">Evidence</th>
                <th className="text-right py-1 px-2">Temporal</th>
                <th className="text-right py-1 px-2">Cross-Val</th>
                <th className="text-right py-1 px-2">Overall</th>
                <th className="text-center py-1 px-2">Grade</th>
                <th className="text-center py-1 px-2">Pass</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["C-001", "causal_persistence", 0.8234, 0.8912, 0.7567, 0.8234, "B", true],
                ["C-002", "directional_consistency", 0.9123, 0.8456, 0.8234, 0.8567, "B", true],
                ["C-003", "strength_monotonicity", 0.7567, 0.7234, 0.8123, 0.7612, "C", true],
                ["C-004", "mediation_stability", 0.6834, 0.6512, 0.7234, 0.6812, "D", true],
                ["C-005", "confounding_invariance", 0.5412, 0.6234, 0.5812, 0.5812, "C", false],
                ["C-006", "intervention_reproducibility", 0.8567, 0.8834, 0.7956, 0.8412, "B", true],
              ].map(([id, typ, evidence, temporal, crossval, overall, grade, pass]) => (
                <tr key={id as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400 font-mono text-xs">{id}</td>
                  <td className="py-1 px-2 text-blue-400 text-xs">{(typ as string).replace(/_/g, " ")}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{evidence}</td>
                  <td className="py-1 px-2 text-right text-purple-400">{temporal}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{crossval}</td>
                  <td className="py-1 px-2 text-right text-amber-400 font-semibold">{overall}</td>
                  <td className="py-1 px-2 text-center"><Badge label={grade as string} color={grade === "B" ? "green" : grade === "C" ? "amber" : "red"} /></td>
                  <td className="py-1 px-2 text-center"><Badge label={pass ? "PASS" : "FAIL"} color={pass ? "green" : "red"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Grade Distribution", val: "3B / 2C / 1D", color: "text-blue-400" },
          { label: "Reproducibility", val: "0.7834", color: "text-emerald-400" },
          { label: "Rigor Level", val: "0.80", color: "text-purple-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-900/60 rounded p-3">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-lg font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card title="Engine Information">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Engine</span><span className="text-blue-400">Graph Causal Temporal Evolution</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Version</span><span className="text-emerald-400">v1.258</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Endpoints</span><span className="text-gray-300">7 (6 POST + 1 GET)</span></div>
        </div>
      </Card>
      <Card title="Enums (6 enums, 36 values)">
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "TemporalPattern", vals: TEMPORAL_PATTERNS, color: "blue" },
            { name: "EvolutionMode", vals: EVOLUTION_MODES, color: "amber" },
            { name: "TemporalResolution", vals: TEMPORAL_RESOLUTIONS, color: "green" },
            { name: "CausalStability", vals: CAUSAL_STABILITIES, color: "purple" },
            { name: "WindowStrategy", vals: WINDOW_STRATEGIES, color: "cyan" },
            { name: "ForecastHorizon", vals: FORECAST_HORIZONS, color: "red" },
          ].map((e) => (
            <div key={e.name} className="bg-gray-900/60 rounded p-2">
              <div className="text-xs font-semibold text-gray-300 mb-1">{e.name}</div>
              <div className="flex flex-wrap gap-1">
                {e.vals.map((v) => (
                  <Badge key={v} label={v.replace(/_/g, " ").slice(0, 20)} color={e.color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Causal Pipeline (Extended)">
        <div className="space-y-1 text-sm">
          {[
            ["v1.249", "Autonomous Discovery → temporal causal graph snapshots"],
            ["v1.255", "Intervention Planning → time-varying intervention strategies"],
            ["v1.256", "Knowledge Distillation → distilled temporal patterns"],
            ["v1.257", "Causal Ensemble → robust multi-model temporal consensus"],
            ["v1.258", "Temporal Evolution → drift, regime & stability tracking"],
          ].map(([v, desc]) => (
            <div key={v} className="flex items-center gap-2">
              <Badge label={v} color={v === "v1.258" ? "green" : "purple"} />
              <span className="text-gray-400 text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────

export default function GraphCausalTemporalEvolutionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Evolve");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Causal Temporal Evolution Engine
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              v1.258 — Track drift, regime changes, stability &amp; forecast causal trajectories over time
            </p>
          </div>
          <Badge label="v1.258" color="purple" />
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "Evolve" && <EvolveTab />}
          {activeTab === "Drift" && <DriftTab />}
          {activeTab === "Stability" && <StabilityTab />}
          {activeTab === "Regime" && <RegimeTab />}
          {activeTab === "Forecast" && <ForecastTab />}
          {activeTab === "Validate" && <ValidateTab />}
          {activeTab === "Overview" && <OverviewTab />}
        </div>
      </div>
    </div>
  );
}
