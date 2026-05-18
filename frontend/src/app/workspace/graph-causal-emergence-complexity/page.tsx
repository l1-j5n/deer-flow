"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════
   v1.261 — Graph Causal Emergence & Complexity Engine
   7 tabs: Detect | Analyze | Decompose | Simulate | Quantify | Evolve | Overview
   ═══════════════════════════════════════════════════════ */

const TABS = ["Detect", "Analyze", "Decompose", "Simulate", "Quantify", "Evolve", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const EMERGENCE_PATTERNS = ["scale_transition","collective_behavior","phase_transition","self_organization","synergetic_effect","ai_hyper_emergence"];
const COMPLEXITY_METRICS = ["shannon_entropy","mutual_information","integrated_information","algorithmic_complexity","effective_complexity","ai_adaptive_complexity"];
const SCALE_LEVELS = ["micro","meso","macro","cross_scale","multi_resolution","ai_dynamic_scale"];
const CAUSAL_EMERGENCE_TYPES = ["upward_causation","downward_causation","causal_exclusion","effective_information","integrated_causation","ai_hybrid_emergence"];
const SIMULATION_MODELS = ["agent_based","network_dynamics","cellular_automata","mean_field","stochastic_process","ai_neural_simulation"];
const PHASE_TRANSITIONS = ["continuous","discontinuous","critical_slowing","bifurcation","catastrophe","ai_adaptive_transition"];

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

function DetectTab() {
  const [pattern, setPattern] = useState(EMERGENCE_PATTERNS[5]);
  const [sensitivity, setSensitivity] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Emergence Pattern" value={pattern} options={EMERGENCE_PATTERNS} onChange={setPattern} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Detection Sensitivity</label>
          <input type="range" min="0.1" max="1" step="0.05" value={sensitivity} onChange={(e) => setSensitivity(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{sensitivity}</div>
        </div>
      </div>
      <Card title="Emergent Pattern Detection">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Indicator</th>
                <th className="text-right py-2 px-2">Signal</th>
                <th className="text-right py-2 px-2">SNR</th>
                <th className="text-center py-2 px-2">Detected</th>
                <th className="text-right py-2 px-2">Novelty</th>
                <th className="text-right py-2 px-2">Robust</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "EMR-001", ind: "correlation_amplification", sig: 0.62, snr: 3.45, det: true, nov: 0.58, rob: 0.82 },
                { id: "EMR-002", ind: "variance_concentration", sig: 0.45, snr: 1.82, det: false, nov: 0.35, rob: 0.71 },
                { id: "EMR-003", ind: "order_parameter_shift", sig: 0.71, snr: 4.12, det: true, nov: 0.72, rob: 0.88 },
                { id: "EMR-004", ind: "mutual_info_spike", sig: 0.38, snr: 1.55, det: false, nov: 0.45, rob: 0.65 },
                { id: "EMR-005", ind: "entropy_gradient_flip", sig: 0.68, snr: 3.88, det: true, nov: 0.62, rob: 0.79 },
                { id: "EMR-006", ind: "scale_coupling_strength", sig: 0.55, snr: 2.65, det: true, nov: 0.51, rob: 0.74 },
              ].map((r) => (
                <tr key={r.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 px-2 font-mono text-xs">{r.id}</td>
                  <td className="py-2 px-2"><Badge label={r.ind.replace(/_/g, " ")} color="purple" /></td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{r.sig.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${r.snr > 3 ? "text-green-400" : "text-amber-400"}`}>{r.snr.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center">{r.det ? "✓" : "✗"}</td>
                  <td className="py-2 px-2 text-right font-mono text-blue-400">{r.nov.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-purple-400">{r.rob.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Emergence Rate" value="66.7%" color="text-green-400" />
        <StatBox label="Avg SNR" value="2.91" color="text-cyan-400" />
        <StatBox label="Avg Novelty" value="0.538" color="text-blue-400" />
        <StatBox label="Detect Effect." value="0.600" color="text-purple-400" />
      </div>
    </div>
  );
}

function AnalyzeTab() {
  const [metric, setMetric] = useState(COMPLEXITY_METRICS[5]);
  const [resolution, setResolution] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Complexity Metric" value={metric} options={COMPLEXITY_METRICS} onChange={setMetric} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Resolution</label>
          <input type="range" min="0.1" max="1" step="0.05" value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{resolution}</div>
        </div>
      </div>
      <Card title="Complexity Analysis by System Layer">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Layer</th>
                <th className="text-right py-2 px-2">Complexity</th>
                <th className="text-right py-2 px-2">Excess</th>
                <th className="text-right py-2 px-2">Structured</th>
                <th className="text-center py-2 px-2">Interpretation</th>
                <th className="text-right py-2 px-2">Causal</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "CPL-001", layer: "micro_dynamics", cx: 0.72, exc: 0.35, str: 0.49, interp: "moderately_structured", causal: 0.28 },
                { id: "CPL-002", layer: "local_interactions", cx: 0.65, exc: 0.32, str: 0.49, interp: "moderately_structured", causal: 0.25 },
                { id: "CPL-003", layer: "meso_structures", cx: 0.58, exc: 0.28, str: 0.48, interp: "moderately_structured", causal: 0.22 },
                { id: "CPL-004", layer: "regional_patterns", cx: 0.45, exc: 0.18, str: 0.40, interp: "moderately_structured", causal: 0.15 },
                { id: "CPL-005", layer: "macro_behavior", cx: 0.38, exc: 0.12, str: 0.32, interp: "near_random", causal: 0.08 },
                { id: "CPL-006", layer: "global_emergence", cx: 0.52, exc: 0.25, str: 0.48, interp: "moderately_structured", causal: 0.20 },
              ].map((s) => (
                <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 px-2 font-mono text-xs">{s.id}</td>
                  <td className="py-2 px-2"><Badge label={s.layer.replace(/_/g, " ")} color="purple" /></td>
                  <td className={`py-2 px-2 text-right font-mono ${s.cx > 0.6 ? "text-green-400" : "text-amber-400"}`}>{s.cx.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{s.exc.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${s.str > 0.6 ? "text-green-400" : s.str > 0.3 ? "text-cyan-400" : "text-amber-400"}`}>{s.str.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center"><Badge label={s.interp.replace(/_/g, " ")} color={s.interp === "highly_structured" ? "green" : s.interp === "moderately_structured" ? "cyan" : "amber"} /></td>
                  <td className="py-2 px-2 text-right font-mono text-purple-400">{s.causal.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Avg Complexity" value="0.550" color="text-green-400" />
        <StatBox label="Excess Ratio" value="0.618" color="text-cyan-400" />
        <StatBox label="High Structured" value="0" color="text-amber-400" />
        <StatBox label="Causal Content" value="0.197" color="text-purple-400" />
      </div>
    </div>
  );
}

function DecomposeTab() {
  const [scale, setScale] = useState(SCALE_LEVELS[5]);
  const [coupling, setCoupling] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Scale Level" value={scale} options={SCALE_LEVELS} onChange={setScale} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Coupling Strength</label>
          <input type="range" min="0.1" max="1" step="0.05" value={coupling} onChange={(e) => setCoupling(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{coupling}</div>
        </div>
      </div>
      <Card title="Multi-Scale Causal Decomposition">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-center py-2 px-2">Flow</th>
                <th className="text-center py-2 px-2">Src → Tgt</th>
                <th className="text-right py-2 px-2">Coupling</th>
                <th className="text-right py-2 px-2">Fidelity</th>
                <th className="text-center py-2 px-2">Bridge</th>
                <th className="text-right py-2 px-2">Emerge.</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "CSD-001", flow: "bottom_up_aggregation", src: "micro", tgt: "meso", coup: 0.42, fid: 0.88, bridge: "causal", emrg: 0.35 },
                { id: "CSD-002", flow: "top_down_constraint", src: "meso", tgt: "macro", coup: 0.35, fid: 0.72, bridge: "causal", emrg: 0.28 },
                { id: "CSD-003", flow: "lateral_coupling", src: "micro", tgt: "meso", coup: 0.28, fid: 0.55, bridge: "correlational", emrg: 0.18 },
                { id: "CSD-004", flow: "feedback_amplification", src: "meso", tgt: "macro", coup: 0.52, fid: 0.91, bridge: "causal", emrg: 0.45 },
                { id: "CSD-005", flow: "info_cascading", src: "micro", tgt: "meso", coup: 0.38, fid: 0.78, bridge: "causal", emrg: 0.32 },
                { id: "CSD-006", flow: "resonance_coupling", src: "meso", tgt: "macro", coup: 0.45, fid: 0.82, bridge: "causal", emrg: 0.38 },
              ].map((b) => (
                <tr key={b.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-2 px-2 font-mono text-xs">{b.id}</td>
                  <td className="py-2 px-2"><Badge label={b.flow.replace(/_/g, " ")} color="purple" /></td>
                  <td className="py-2 px-2 text-center"><Badge label={b.src} color="blue" /> → <Badge label={b.tgt} color="green" /></td>
                  <td className={`py-2 px-2 text-right font-mono ${b.coup > 0.4 ? "text-green-400" : "text-amber-400"}`}>{b.coup.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${b.fid > 0.7 ? "text-green-400" : "text-amber-400"}`}>{b.fid.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center"><Badge label={b.bridge} color={b.bridge === "causal" ? "green" : b.bridge === "correlational" ? "cyan" : "amber"} /></td>
                  <td className="py-2 px-2 text-right font-mono text-purple-400">{b.emrg.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Causal Fidelity" value="0.777" color="text-green-400" />
        <StatBox label="Causal Bridge %" value="83.3%" color="text-cyan-400" />
        <StatBox label="Info Transfer" value="1.245" color="text-blue-400" />
        <StatBox label="Scale Integr." value="3.870" color="text-purple-400" />
      </div>
    </div>
  );
}

function SimulateTab() {
  const [model, setModel] = useState(SIMULATION_MODELS[5]);
  const [perturbation, setPerturbation] = useState("0.50");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Simulation Model" value={model} options={SIMULATION_MODELS} onChange={setModel} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Perturbation</label>
          <input type="range" min="0" max="1" step="0.05" value={perturbation} onChange={(e) => setPerturbation(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{perturbation}</div>
        </div>
      </div>
      <Card title="Emergence Simulation Dynamics">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-right py-2 px-2">Order Param</th>
                <th className="text-right py-2 px-2">Complexity</th>
                <th className="text-center py-2 px-2">Critical</th>
                <th className="text-right py-2 px-2">Variance</th>
                <th className="text-right py-2 px-2">Emerge.</th>
                <th className="text-right py-2 px-2">Info Gen</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "SIM-001", order: 0.28, cx: 0.86, crit: false, var: 0.02, emrg: 0.24, info: 0.51 },
                { id: "SIM-002", order: 0.35, cx: 0.93, crit: false, var: 0.02, emrg: 0.30, info: 0.62 },
                { id: "SIM-003", order: 0.48, cx: 1.00, crit: true, var: 0.08, emrg: 0.41, info: 0.82 },
                { id: "SIM-004", order: 0.52, cx: 1.00, crit: true, var: 0.08, emrg: 0.44, info: 0.85 },
                { id: "SIM-005", order: 0.61, cx: 0.97, crit: false, var: 0.02, emrg: 0.52, info: 0.78 },
                { id: "SIM-006", order: 0.72, cx: 0.88, crit: false, var: 0.02, emrg: 0.61, info: 0.68 },
              ].map((s) => (
                <tr key={s.id} className={`border-b border-gray-800 hover:bg-gray-800/40 ${s.crit ? "bg-amber-900/10" : ""}`}>
                  <td className="py-2 px-2 font-mono text-xs">{s.id}</td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{s.order.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${s.cx > 0.95 ? "text-green-400" : "text-amber-400"}`}>{s.cx.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">{s.crit ? <Badge label="CRITICAL" color="amber" /> : "—"}</td>
                  <td className={`py-2 px-2 text-right font-mono ${s.var > 0.05 ? "text-red-400" : "text-green-400"}`}>{s.var.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-purple-400">{s.emrg.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-blue-400">{s.info.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Max Complexity" value="1.000" color="text-green-400" />
        <StatBox label="Critical Steps" value="2" color="text-amber-400" />
        <StatBox label="Emerg. Efficiency" value="0.944" color="text-cyan-400" />
        <StatBox label="Trajectory" value="ascending" color="text-purple-400" />
      </div>
    </div>
  );
}

function QuantifyTab() {
  const [emergenceType, setEmergenceType] = useState(CAUSAL_EMERGENCE_TYPES[5]);
  const [granularity, setGranularity] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Causal Emergence Type" value={emergenceType} options={CAUSAL_EMERGENCE_TYPES} onChange={setEmergenceType} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Measurement Granularity</label>
          <input type="range" min="0.1" max="1" step="0.05" value={granularity} onChange={(e) => setGranularity(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{granularity}</div>
        </div>
      </div>
      <Card title="Causal Emergence Quantification">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-right py-2 px-2">Micro EI</th>
                <th className="text-right py-2 px-2">Macro EI</th>
                <th className="text-right py-2 px-2">ΔEI</th>
                <th className="text-center py-2 px-2">Emergent</th>
                <th className="text-right py-2 px-2">Ratio</th>
                <th className="text-right py-2 px-2">Gauge</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "QNT-001", micro: 0.18, macro: 0.32, delta: 0.14, emrg: true, ratio: 1.78, gauge: 0.28 },
                { id: "QNT-002", micro: 0.22, macro: 0.19, delta: -0.03, emrg: false, ratio: 0.86, gauge: -0.07 },
                { id: "QNT-003", micro: 0.15, macro: 0.42, delta: 0.27, emrg: true, ratio: 2.80, gauge: 0.47 },
                { id: "QNT-004", micro: 0.28, macro: 0.38, delta: 0.10, emrg: true, ratio: 1.36, gauge: 0.15 },
                { id: "QNT-005", micro: 0.20, macro: 0.35, delta: 0.15, emrg: true, ratio: 1.75, gauge: 0.27 },
                { id: "QNT-006", micro: 0.25, macro: 0.45, delta: 0.20, emrg: true, ratio: 1.80, gauge: 0.29 },
              ].map((q) => (
                <tr key={q.id} className={`border-b border-gray-800 hover:bg-gray-800/40 ${!q.emrg ? "bg-red-900/10" : q.delta > 0.15 ? "bg-green-900/10" : ""}`}>
                  <td className="py-2 px-2 font-mono text-xs">{q.id}</td>
                  <td className="py-2 px-2 text-right font-mono text-amber-400">{q.micro.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-green-400">{q.macro.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${q.delta > 0 ? "text-green-400" : "text-red-400"}`}>{q.delta > 0 ? "+" : ""}{q.delta.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">{q.emrg ? "✓" : "✗"}</td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{q.ratio.toFixed(2)}×</td>
                  <td className={`py-2 px-2 text-right font-mono ${q.gauge > 0.3 ? "text-green-400" : q.gauge > 0 ? "text-cyan-400" : "text-red-400"}`}>{q.gauge.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Detection Rate" value="83.3%" color="text-green-400" />
        <StatBox label="Avg ΔEI" value="+0.138" color="text-cyan-400" />
        <StatBox label="Strong Emerg." value="2" color="text-amber-400" />
        <StatBox label="Robustness" value="0.750" color="text-purple-400" />
      </div>
    </div>
  );
}

function EvolveTab() {
  const [transition, setTransition] = useState(PHASE_TRANSITIONS[5]);
  const [adaptRate, setAdaptRate] = useState("0.60");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Phase Transition Type" value={transition} options={PHASE_TRANSITIONS} onChange={setTransition} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Adaptation Rate</label>
          <input type="range" min="0.1" max="1" step="0.05" value={adaptRate} onChange={(e) => setAdaptRate(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{adaptRate}</div>
        </div>
      </div>
      <Card title="Complexity Phase Transition Navigation">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-right py-2 px-2">Complexity</th>
                <th className="text-right py-2 px-2">Stability</th>
                <th className="text-center py-2 px-2">Critical</th>
                <th className="text-right py-2 px-2">Navig.</th>
                <th className="text-right py-2 px-2">Emerge. Pot.</th>
                <th className="text-left py-2 px-2">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "PHS-001", cx: 0.25, stab: 0.92, crit: false, nav: 0.78, ep: 0.02, action: "continue" },
                { id: "PHS-002", cx: 0.38, stab: 0.85, crit: false, nav: 0.72, ep: 0.04, action: "continue" },
                { id: "PHS-003", cx: 0.55, stab: 0.68, crit: true, nav: 0.55, ep: 0.09, action: "probe_critical" },
                { id: "PHS-004", cx: 0.62, stab: 0.72, crit: true, nav: 0.58, ep: 0.08, action: "advance_cautiously" },
                { id: "PHS-005", cx: 0.71, stab: 0.80, crit: false, nav: 0.68, ep: 0.07, action: "exploit_structure" },
                { id: "PHS-006", cx: 0.78, stab: 0.88, crit: false, nav: 0.75, ep: 0.05, action: "consolidate" },
              ].map((p) => (
                <tr key={p.id} className={`border-b border-gray-800 hover:bg-gray-800/40 ${p.crit ? "bg-amber-900/10" : ""}`}>
                  <td className="py-2 px-2 font-mono text-xs">{p.id}</td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{p.cx.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-right font-mono ${p.stab > 0.8 ? "text-green-400" : p.stab > 0.6 ? "text-amber-400" : "text-red-400"}`}>{p.stab.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">{p.crit ? <Badge label="CRITICAL" color="amber" /> : "—"}</td>
                  <td className="py-2 px-2 text-right font-mono text-purple-400">{p.nav.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-blue-400">{p.ep.toFixed(3)}</td>
                  <td className="py-2 px-2"><Badge label={p.action.replace(/_/g, " ")} color={p.action === "continue" ? "green" : p.action === "probe_critical" ? "red" : "cyan"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Critical Points" value="2" color="text-amber-400" />
        <StatBox label="Avg Navig." value="0.677" color="text-green-400" />
        <StatBox label="Final Cx" value="0.780" color="text-cyan-400" />
        <StatBox label="Trajectory" value="ascending" color="text-purple-400" />
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card title="Engine Info">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div><span className="text-gray-500">Engine:</span> v1.261 — Graph Causal Emergence & Complexity Engine</div>
          <div><span className="text-gray-500">Role:</span> Detect emergent causal structures, quantify complexity, navigate phase transitions</div>
          <div><span className="text-gray-500">Predecessor:</span> v1.260 — Causal Meta-Cognitive Engine</div>
          <div><span className="text-gray-500">Enums:</span> 6 enums × 6 values = 36</div>
        </div>
      </Card>
      <Card title="Enums">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { name: "EmergencePattern", vals: EMERGENCE_PATTERNS },
            { name: "ComplexityMetric", vals: COMPLEXITY_METRICS },
            { name: "ScaleLevel", vals: SCALE_LEVELS },
            { name: "CausalEmergenceType", vals: CAUSAL_EMERGENCE_TYPES },
            { name: "SimulationModel", vals: SIMULATION_MODELS },
            { name: "PhaseTransitionType", vals: PHASE_TRANSITIONS },
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
          <div className="text-green-400">POST /graph/causal-emergence/detect</div>
          <div className="text-green-400">POST /graph/causal-emergence/analyze</div>
          <div className="text-green-400">POST /graph/causal-emergence/decompose</div>
          <div className="text-green-400">POST /graph/causal-emergence/simulate</div>
          <div className="text-green-400">POST /graph/causal-emergence/quantify</div>
          <div className="text-green-400">POST /graph/causal-emergence/evolve</div>
          <div className="text-cyan-400">GET  /graph/causal-emergence/overview</div>
        </div>
      </Card>
      <Card title="Emergence & Complexity Layer">
        <div className="text-sm text-gray-300 font-mono space-y-1">
          <div>Causal Pipeline (11 stages + Meta-Cognitive):</div>
          <div>Discovery → Explanation → Argumentation → Fairness → Curriculum → Optimization</div>
          <div>→ Intervention → Distillation → Ensemble → Temporal → Feedback → Meta-Cognitive</div>
          <div className="mt-2 text-emerald-400 font-bold">Emergence & Complexity Layer (v1.261):</div>
          <div className="text-emerald-400">Detect → Analyze → Decompose → Simulate → Quantify → Evolve</div>
          <div className="mt-2 text-amber-400">Core Insight: Macro causation &gt; Micro causation when ΔEI &gt; 0</div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function CausalEmergenceComplexityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Detect");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Causal Emergence & Complexity Engine
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              v1.261 — Detect emergent structures: pattern → complexity → decomposition → simulation → quantification → evolution
            </p>
          </div>
          <Badge label="v1.261" color="purple" />
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
          {activeTab === "Detect" && <DetectTab />}
          {activeTab === "Analyze" && <AnalyzeTab />}
          {activeTab === "Decompose" && <DecomposeTab />}
          {activeTab === "Simulate" && <SimulateTab />}
          {activeTab === "Quantify" && <QuantifyTab />}
          {activeTab === "Evolve" && <EvolveTab />}
          {activeTab === "Overview" && <OverviewTab />}
        </div>
      </div>
    </div>
  );
}
