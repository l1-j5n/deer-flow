"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════
   v1.257 — Graph Causal Ensemble Engine
   7 tabs: Ensemble | Aggregate | Calibrate | Diversify | Resolve | Forecast | Overview
   ═══════════════════════════════════════════════════════ */

const TABS = ["Ensemble", "Aggregate", "Calibrate", "Diversify", "Resolve", "Forecast", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const ENSEMBLE_METHODS = ["bagging","boosting","stacking","bayesian_model_averaging","moe_mixture_of_experts","ai_adaptive_ensemble"];
const AGGREGATION_STRATEGIES = ["weighted_average","median_pooling","trimmed_mean","evidence_synthesis","consensus_voting","ai_meta_learned_aggregation"];
const CALIBRATION_METHODS = ["platt_scaling","isotonic_regression","temperature_scaling","beta_calibration","histogram_binning","ai_adaptive_calibration"];
const DIVERSITY_METRICS = ["prediction_disagreement","structural_diversity","effect_heterogeneity","intervention_divergence","causal_path_variety","ai_composite_diversity"];
const CONFLICT_RESOLUTIONS = ["majority_voting","weighted_evidence","bayesian_fusion","dempster_shafer","priority_hierarchy","ai_negotiated_resolution"];
const UNCERTAINTY_METHODS = ["dropout_ensemble","bootstrap_ensemble","decomposition_epistemic_aleatoric","conformal_prediction","bayesian_posterior","ai_hybrid_uncertainty"];

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

function EnsembleTab() {
  const [method, setMethod] = useState(ENSEMBLE_METHODS[5]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Ensemble Method" value={method} options={ENSEMBLE_METHODS} onChange={setMethod} />
        <Card title="Method Properties">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Dynamic Weights</span><Badge label="YES" color="green" /></div>
            <div className="flex justify-between"><span className="text-gray-400">Context Aware</span><Badge label="YES" color="green" /></div>
            <div className="flex justify-between"><span className="text-gray-400">Online Adaptation</span><Badge label="YES" color="green" /></div>
            <div className="flex justify-between"><span className="text-gray-400">Base Diversity</span><span className="text-amber-400">0.50</span></div>
          </div>
        </Card>
      </div>
      <Card title="Ensemble Members (7 Models)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">ID</th>
                <th className="text-left py-1 px-2">Source</th>
                <th className="text-right py-1 px-2">Weight</th>
                <th className="text-right py-1 px-2">Causal Acc</th>
                <th className="text-right py-1 px-2">Interv. F1</th>
                <th className="text-right py-1 px-2">Expl. Cov</th>
                <th className="text-right py-1 px-2">Struct. Fid</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["M-01","discovery",0.143,0.892,0.841,0.783,0.912],
                ["M-02","explanation",0.143,0.851,0.802,0.847,0.878],
                ["M-03","argumentation",0.143,0.874,0.823,0.791,0.901],
                ["M-04","fairness",0.143,0.867,0.838,0.812,0.885],
                ["M-05","optimization",0.143,0.883,0.856,0.829,0.917],
                ["M-06","intervention",0.143,0.891,0.871,0.845,0.923],
                ["M-07","distillation",0.143,0.858,0.814,0.798,0.869],
              ].map(([id, src, w, ca, if1, ec, sf]) => (
                <tr key={id as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400 font-mono text-xs">{id}</td>
                  <td className="py-1 px-2 text-blue-400 text-xs">{src}</td>
                  <td className="py-1 px-2 text-right text-purple-400">{w}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{ca}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{if1}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{ec}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{sf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Ensemble Accuracy", val: "0.923", color: "text-emerald-400" },
          { label: "vs Best Single", val: "+0.032", color: "text-blue-400" },
          { label: "Effective Size", val: "6.7", color: "text-purple-400" },
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

function AggregateTab() {
  const [strategy, setStrategy] = useState(AGGREGATION_STRATEGIES[5]);
  return (
    <div className="space-y-4">
      <SelectField label="Aggregation Strategy" value={strategy} options={AGGREGATION_STRATEGIES} onChange={setStrategy} />
      <Card title="Per-Edge Aggregation">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">Edge</th>
                <th className="text-right py-1 px-2">Aggregated</th>
                <th className="text-right py-1 px-2">Std</th>
                <th className="text-right py-1 px-2">Agreement</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["X1→Y1", 0.542, 0.081, 0.892],
                ["X2→Y2", 0.387, 0.124, 0.756],
                ["X3→Y3", 0.671, 0.053, 0.941],
                ["X4→M1→Y4", 0.298, 0.167, 0.634],
                ["X5→Y5", 0.483, 0.092, 0.867],
              ].map(([edge, agg, std, agr]) => (
                <tr key={edge as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400 font-mono text-xs">{edge}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{agg}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{std}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{agr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Point Estimate", val: "0.4762", color: "text-emerald-400" },
          { label: "Consensus Level", val: "0.891", color: "text-blue-400" },
          { label: "Effective Sources", val: "4.3", color: "text-purple-400" },
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

function CalibrateTab() {
  const [method, setMethod] = useState(CALIBRATION_METHODS[5]);
  return (
    <div className="space-y-4">
      <SelectField label="Calibration Method" value={method} options={CALIBRATION_METHODS} onChange={setMethod} />
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "ECE Before", val: "0.087", color: "text-red-400" },
          { label: "ECE After", val: "0.023", color: "text-emerald-400" },
          { label: "Improvement", val: "73.6%", color: "text-blue-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
      <Card title="Reliability Diagram">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-right py-1 px-2">Expected</th>
                <th className="text-right py-1 px-2">Before</th>
                <th className="text-right py-1 px-2">After</th>
                <th className="text-right py-1 px-2">Error Δ</th>
                <th className="text-right py-1 px-2">Samples</th>
              </tr>
            </thead>
            <tbody>
              {[
                [0.15, 0.08, 0.14, 62],
                [0.25, 0.19, 0.24, 48],
                [0.35, 0.31, 0.34, 71],
                [0.45, 0.42, 0.45, 55],
                [0.55, 0.51, 0.54, 83],
                [0.65, 0.61, 0.65, 67],
                [0.75, 0.72, 0.74, 42],
                [0.85, 0.83, 0.85, 38],
              ].map(([exp, bef, aft, cnt]) => (
                <tr key={exp} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-right text-gray-400">{exp.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{bef.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{aft.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{Math.abs(aft - exp).toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-gray-500">{cnt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function DiversifyTab() {
  const [metric, setMetric] = useState(DIVERSITY_METRICS[5]);
  return (
    <div className="space-y-4">
      <SelectField label="Diversity Metric" value={metric} options={DIVERSITY_METRICS} onChange={setMetric} />
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Aggregate Diversity", val: "0.523", color: "text-emerald-400" },
          { label: "Meets Threshold", val: "YES", color: "text-emerald-400" },
          { label: "Recommendation", val: "Optimal", color: "text-blue-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
      <Card title="Pairwise Diversity Matrix">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">Pair</th>
                <th className="text-right py-1 px-2">Diversity</th>
                <th className="text-right py-1 px-2">Agreement</th>
                <th className="text-right py-1 px-2">Unique i</th>
                <th className="text-right py-1 px-2">Unique j</th>
                <th className="text-right py-1 px-2">Shared</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["M-01 / M-02", 0.42, 0.58, 5, 7, 18],
                ["M-01 / M-03", 0.38, 0.62, 4, 6, 20],
                ["M-02 / M-04", 0.55, 0.45, 8, 5, 14],
                ["M-03 / M-05", 0.61, 0.39, 6, 8, 16],
                ["M-04 / M-06", 0.47, 0.53, 3, 7, 19],
                ["M-05 / M-07", 0.53, 0.47, 5, 4, 21],
              ].map(([pair, div, agr, ui, uj, sh]) => (
                <tr key={pair as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400 text-xs">{pair}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{div}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{agr}</td>
                  <td className="py-1 px-2 text-right text-purple-400">{ui}</td>
                  <td className="py-1 px-2 text-right text-purple-400">{uj}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{sh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ResolveTab() {
  const [resolution, setResolution] = useState(CONFLICT_RESOLUTIONS[5]);
  return (
    <div className="space-y-4">
      <SelectField label="Conflict Resolution" value={resolution} options={CONFLICT_RESOLUTIONS} onChange={setResolution} />
      <div className="grid grid-cols-4 gap-4 text-center">
        {[
          { label: "Conflicts", val: "8", color: "text-amber-400" },
          { label: "Resolved", val: "7", color: "text-emerald-400" },
          { label: "Deferred", val: "1", color: "text-red-400" },
          { label: "Rate", val: "87.5%", color: "text-blue-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-900/60 rounded p-3">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-lg font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
      <Card title="Conflict Details">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">ID</th>
                <th className="text-left py-1 px-2">Type</th>
                <th className="text-left py-1 px-2">Subject</th>
                <th className="text-right py-1 px-2">Severity</th>
                <th className="text-left py-1 px-2">Resolution</th>
                <th className="text-right py-1 px-2">Conf After</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["CF-001","causal_edge","X1→Y1",0.72,"accepted_majority",0.891],
                ["CF-002","effect_direction","X2→M1→Y2",0.85,"accepted_weighted",0.834],
                ["CF-003","effect_magnitude","X3→Y3",0.31,"compromise",0.762],
                ["CF-004","confounder","X4*→Y4",0.67,"accepted_majority",0.878],
                ["CF-005","mediator","X5→Y5",0.91,"deferred",0.543],
                ["CF-006","intervention_outcome","X1→Y1",0.45,"compromise",0.812],
              ].map(([id, typ, subj, sev, res, conf]) => (
                <tr key={id as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400 font-mono text-xs">{id}</td>
                  <td className="py-1 px-2 text-blue-400 text-xs">{typ}</td>
                  <td className="py-1 px-2 text-purple-400 font-mono text-xs">{subj}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{sev}</td>
                  <td className="py-1 px-2"><Badge label={res as string} color={res === "deferred" ? "red" : "green"} /></td>
                  <td className="py-1 px-2 text-right text-emerald-400">{conf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ForecastTab() {
  const [uncertainty, setUncertainty] = useState(UNCERTAINTY_METHODS[5]);
  return (
    <div className="space-y-4">
      <SelectField label="Uncertainty Method" value={uncertainty} options={UNCERTAINTY_METHODS} onChange={setUncertainty} />
      <Card title="Consensus Forecast (10-step horizon)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-right py-1 px-2">Step</th>
                <th className="text-right py-1 px-2">Point Est.</th>
                <th className="text-right py-1 px-2">Epistemic</th>
                <th className="text-right py-1 px-2">Aleatoric</th>
                <th className="text-right py-1 px-2">Total</th>
                <th className="text-right py-1 px-2">CI Lower</th>
                <th className="text-right py-1 px-2">CI Upper</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 0.412, 0.045, 0.062, 0.077, 0.261, 0.563],
                [2, 0.431, 0.048, 0.065, 0.081, 0.272, 0.590],
                [3, 0.458, 0.051, 0.068, 0.085, 0.291, 0.625],
                [4, 0.472, 0.053, 0.071, 0.089, 0.298, 0.646],
                [5, 0.498, 0.056, 0.074, 0.093, 0.316, 0.680],
                [6, 0.521, 0.059, 0.077, 0.097, 0.331, 0.711],
                [7, 0.537, 0.062, 0.081, 0.102, 0.337, 0.737],
                [8, 0.554, 0.065, 0.084, 0.106, 0.346, 0.762],
                [9, 0.572, 0.068, 0.087, 0.111, 0.354, 0.790],
                [10, 0.591, 0.072, 0.091, 0.116, 0.364, 0.818],
              ].map(([step, pt, epi, ale, tot, lo, hi]) => (
                <tr key={step} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-right text-gray-500">{step}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{pt.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-purple-400">{epi.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{ale.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-red-400">{tot.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{lo.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-cyan-400">{hi.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Coverage", val: "94.2%", color: "text-emerald-400" },
          { label: "Sharpness", val: "0.091", color: "text-blue-400" },
          { label: "Forecast Skill", val: "0.874", color: "text-purple-400" },
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

function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card title="Engine Information">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Engine</span><span className="text-blue-400">Graph Causal Ensemble</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Version</span><span className="text-emerald-400">v1.257</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Endpoints</span><span className="text-gray-300">7 (6 POST + 1 GET)</span></div>
        </div>
      </Card>
      <Card title="Enums (6 enums, 36 values)">
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "EnsembleMethod", vals: ENSEMBLE_METHODS, color: "blue" },
            { name: "AggregationStrategy", vals: AGGREGATION_STRATEGIES, color: "green" },
            { name: "DiversityMetric", vals: DIVERSITY_METRICS, color: "amber" },
            { name: "CalibrationMethod", vals: CALIBRATION_METHODS, color: "red" },
            { name: "UncertaintyQuantification", vals: UNCERTAINTY_METHODS, color: "purple" },
            { name: "ConflictResolution", vals: CONFLICT_RESOLUTIONS, color: "cyan" },
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
      <Card title="Integration Chain">
        <div className="space-y-1 text-sm">
          {[
            ["v1.256", "Knowledge Distillation → diverse ensemble members"],
            ["v1.255", "Intervention Planning → ensemble intervention strategies"],
            ["v1.252", "Causal Fairness → equitable ensemble weighting"],
            ["v1.250", "Explanation Generation → interpretable aggregation"],
            ["v1.249", "Autonomous Discovery → ensemble causal graphs"],
          ].map(([v, desc]) => (
            <div key={v} className="flex items-center gap-2">
              <Badge label={v} color="purple" />
              <span className="text-gray-400 text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────

export default function GraphCausalEnsemblePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Ensemble");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Causal Ensemble Engine
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              v1.257 — Ensemble, aggregate, calibrate, diversify, resolve &amp; forecast causal models
            </p>
          </div>
          <Badge label="v1.257" color="purple" />
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
          {activeTab === "Ensemble" && <EnsembleTab />}
          {activeTab === "Aggregate" && <AggregateTab />}
          {activeTab === "Calibrate" && <CalibrateTab />}
          {activeTab === "Diversify" && <DiversifyTab />}
          {activeTab === "Resolve" && <ResolveTab />}
          {activeTab === "Forecast" && <ForecastTab />}
          {activeTab === "Overview" && <OverviewTab />}
        </div>
      </div>
    </div>
  );
}
