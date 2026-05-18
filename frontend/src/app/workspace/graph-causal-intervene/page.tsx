"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════
   v1.255 — Graph Causal Intervention Planner Engine
   7 tabs: Plan | Simulate | Optimize | Monitor | Adapt | Evaluate | Overview
   ═══════════════════════════════════════════════════════ */

const TABS = ["Plan", "Simulate", "Optimize", "Monitor", "Adapt", "Evaluate", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const GOALS = ["cost_minimization","effect_maximization","risk_reduction","equity_balancing","robustness_ensuring","ai_adaptive_goal"];
const INTERV_TYPES = ["do_intervention","soft_intervention","stochastic_intervention","conditional_intervention","policy_intervention","ai_hybrid_intervention"];
const HORIZONS = ["immediate","short_term","medium_term","long_term","strategic","ai_dynamic_horizon"];
const CONSTRAINTS = ["budget_constraint","time_constraint","ethical_constraint","feasibility_constraint","safety_constraint","ai_adaptive_constraint"];
const OUTCOMES = ["expected_effect","confidence_interval","worst_case","best_case","risk_adjusted_return","ai_composite_metric"];
const SIM_MODES = ["deterministic","probabilistic","monte_carlo","agent_based","system_dynamics","ai_hybrid_simulation"];

// ─── Helper ──────────────────────────────────────────────
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

function PlanTab() {
  const [goal, setGoal] = useState(GOALS[1]);
  const [itype, setItype] = useState(INTERV_TYPES[0]);
  const [horizon, setHorizon] = useState(HORIZONS[2]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <SelectField label="Intervention Goal" value={goal} options={GOALS} onChange={setGoal} />
        <SelectField label="Intervention Type" value={itype} options={INTERV_TYPES} onChange={setItype} />
        <SelectField label="Planning Horizon" value={horizon} options={HORIZONS} onChange={setHorizon} />
      </div>
      <Card title="Planned Intervention Steps">
        <div className="space-y-2">
          {["Observe baseline", "Apply do(X₁)", "Measure Y", "Apply do(X₂)", "Measure mediating path", "Measure final Y"].map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-900/60 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Step {i + 1}</span>
                <span className="text-sm text-gray-200">{s}</span>
              </div>
              <div className="flex gap-2">
                <Badge label={`~${(Math.random() * 500 + 50).toFixed(0)}ms`} color="cyan" />
                <Badge label={`conf ${(Math.random() * 0.3 + 0.7).toFixed(2)}`} color="green" />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Estimated Effects">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Total Effect</span><span className="text-emerald-400">+0.472</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Per Variable</span><span className="text-blue-400">0.235 / 0.312</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Spillover</span><span className="text-amber-400">0.087</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Time to Effect</span><span className="text-gray-300">~14.2 days</span></div>
          </div>
        </Card>
        <Card title="Risk Assessment">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Overall Risk</span><span className="text-amber-400">0.185</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Unintended Effects</span><span className="text-amber-400">0.072</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Reversibility</span><span className="text-emerald-400">0.912</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Safety Score</span><span className="text-emerald-400">0.941</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SimulateTab() {
  const [mode, setMode] = useState(SIM_MODES[2]);
  const [scenarios, setScenarios] = useState(100);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Simulation Mode" value={mode} options={SIM_MODES} onChange={setMode} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Number of Scenarios</label>
          <input type="number" value={scenarios} onChange={(e) => setScenarios(Number(e.target.value))}
            className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" />
        </div>
      </div>
      <Card title="Aggregate Statistics">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Mean Outcome", val: "0.534", color: "text-blue-400" },
            { label: "Success Rate", val: "78.3%", color: "text-emerald-400" },
            { label: "Std Dev", val: "0.142", color: "text-amber-400" },
          ].map((m) => (
            <div key={m.label} className="bg-gray-900/60 rounded p-3">
              <div className="text-xs text-gray-500">{m.label}</div>
              <div className={`text-lg font-bold ${m.color}`}>{m.val}</div>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Counterfactual Analysis">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">No Intervention</span><span className="text-red-400">0.187</span></div>
            <div className="flex justify-between"><span className="text-gray-400">With Intervention</span><span className="text-emerald-400">0.623</span></div>
            <div className="flex justify-between"><span className="text-gray-400">ATE</span><span className="text-blue-400">+0.436</span></div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-xs text-gray-500">Falsification Tests</div>
            {[["Placebo", true], ["Sharp Null", true], ["Anticipation", false]] as [string, boolean][].map(([t, p]) => (
              <div key={t} className="flex justify-between text-xs">
                <span className="text-gray-400">{t}</span>
                <Badge label={p ? "PASS" : "FAIL"} color={p ? "green" : "red"} />
              </div>
            ))}
          </div>
        </Card>
        <Card title="Sensitivity Analysis">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Most Sensitive</span><span className="text-amber-400">var_2</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Robustness</span><span className="text-emerald-400">0.847</span></div>
            <div className="text-xs text-gray-500 mt-2">Elasticity Ranking:</div>
            {["var_2 (0.41)", "var_1 (0.28)", "var_3 (0.12)"].map((e) => (
              <div key={e} className="flex items-center gap-2">
                <div className="h-1.5 bg-blue-600 rounded" style={{ width: `${parseFloat(e.split("(")[1]) * 200}px` }} />
                <span className="text-xs text-gray-400">{e}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function OptimizeTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card title="Optimal Strategy">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Selected Interventions</span><span className="text-blue-400">var_1, var_2, var_3</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Estimated Effect</span><span className="text-emerald-400">0.714</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Total Cost</span><span className="text-amber-400">$3,240</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Feasibility</span><span className="text-emerald-400">0.923</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Robustness</span><span className="text-emerald-400">0.867</span></div>
          </div>
        </Card>
        <Card title="Improvement over Baseline">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Effect ↑</span><span className="text-emerald-400">+28.4%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Cost ↓</span><span className="text-emerald-400">-17.2%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Risk ↓</span><span className="text-emerald-400">-34.1%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Pareto Gain</span><span className="text-blue-400">0.312</span></div>
          </div>
        </Card>
      </div>
      <Card title="Pareto Frontier">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">#</th>
                <th className="text-right py-1 px-2">Cost</th>
                <th className="text-right py-1 px-2">Effect</th>
                <th className="text-right py-1 px-2">Risk</th>
                <th className="text-center py-1 px-2">Interventions</th>
              </tr>
            </thead>
            <tbody>
              {[ [3200,0.82,0.08,3],[2800,0.71,0.12,2],[1500,0.53,0.18,2],[900,0.38,0.22,1] ].map(([c,e,r,n], i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-gray-500">{i + 1}</td>
                  <td className="py-1 px-2 text-right text-amber-400">${c.toLocaleString()}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{e.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right text-red-400">{r.toFixed(2)}</td>
                  <td className="py-1 px-2 text-center"><Badge label={`${n} vars`} color="purple" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function MonitorTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Progress", val: "67%", sub: "8/12 steps", color: "text-blue-400" },
          { label: "KPI Current", val: "0.62", sub: "target 0.85", color: "text-emerald-400" },
          { label: "Trend", val: "↑ Improving", sub: "ahead of schedule", color: "text-emerald-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
            <div className="text-xs text-gray-500">{m.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Drift Detection">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Drift Detected</span><Badge label="NONE" color="green" /></div>
            <div className="flex justify-between"><span className="text-gray-400">Magnitude</span><span className="text-emerald-400">0.042 &lt; 0.10</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Direction</span><span className="text-gray-300">neutral</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Recommendation</span><span className="text-blue-400">continue</span></div>
          </div>
        </Card>
        <Card title="Execution Status">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Phase</span><span className="text-purple-400">implementation</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Elapsed</span><span className="text-gray-300">12.3h</span></div>
            <div className="flex justify-between"><span className="text-gray-400">ETA</span><span className="text-gray-300">~6.1h</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Milestones</span><span className="text-blue-400">3/7</span></div>
          </div>
        </Card>
      </div>
      <Card title="Active Alerts">
        <div className="text-sm text-gray-400 text-center py-3">No active alerts — all checks passing ✓</div>
      </Card>
    </div>
  );
}

function AdaptTab() {
  return (
    <div className="space-y-4">
      <Card title="Adaptation History">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">Step</th>
                <th className="text-right py-1 px-2">LR</th>
                <th className="text-right py-1 px-2">Loss Before</th>
                <th className="text-right py-1 px-2">Loss After</th>
                <th className="text-right py-1 px-2">Δ</th>
                <th className="text-left py-1 px-2">Direction</th>
              </tr>
            </thead>
            <tbody>
              {[
                [0.01, 0.342, 0.287, "+0.055", "increase"],
                [0.0095, 0.287, 0.251, "+0.036", "increase"],
                [0.009, 0.251, 0.228, "+0.023", "increase"],
                [0.0086, 0.228, 0.219, "+0.009", "neutral"],
                [0.0081, 0.219, 0.215, "+0.004", "neutral"],
              ].map(([lr, lb, la, delta, dir], i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-gray-500">{i + 1}</td>
                  <td className="py-1 px-2 text-right text-cyan-400">{lr.toFixed(4)}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{lb.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{la.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{delta}</td>
                  <td className="py-1 px-2"><Badge label={dir} color={dir === "increase" ? "green" : "blue"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Performance Delta">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Effect Change</span><span className="text-emerald-400">+0.182</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Cost Change</span><span className="text-amber-400">-0.043</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Risk Change</span><span className="text-emerald-400">-0.091</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Net Improvement</span><span className="text-emerald-400">+0.127</span></div>
          </div>
        </Card>
        <Card title="Convergence Status">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Converged</span><Badge label="YES" color="green" /></div>
            <div className="flex justify-between"><span className="text-gray-400">Rate</span><span className="text-blue-400">0.934</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Remaining Gap</span><span className="text-amber-400">0.038</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Plateau</span><Badge label="No" color="green" /></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function EvaluateTab() {
  return (
    <div className="space-y-4">
      <Card title="Treatment Effects">
        <div className="grid grid-cols-4 gap-3 text-center">
          {[
            { label: "ATE", val: "+0.412", color: "text-emerald-400" },
            { label: "CATE (mean)", val: "+0.387", color: "text-blue-400" },
            { label: "ITT", val: "+0.368", color: "text-cyan-400" },
            { label: "LATE", val: "+0.431", color: "text-purple-400" },
          ].map((m) => (
            <div key={m.label} className="bg-gray-900/60 rounded p-3">
              <div className="text-xs text-gray-500">{m.label}</div>
              <div className={`text-lg font-bold ${m.color}`}>{m.val}</div>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Statistical Significance">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">p-value</span><span className="text-emerald-400">0.003</span></div>
            <div className="flex justify-between"><span className="text-gray-400">95% CI</span><span className="text-blue-400">[0.312, 0.512]</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Cohen's d</span><span className="text-purple-400">0.873</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Power</span><span className="text-emerald-400">0.924</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Significant @95%</span><Badge label="YES" color="green" /></div>
          </div>
        </Card>
        <Card title="Causal Attribution">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Direct Effect</span><span className="text-emerald-400">0.531</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Indirect Effect</span><span className="text-blue-400">0.142</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Confounding Adj.</span><Badge label="YES" color="green" /></div>
            <div className="text-xs text-gray-500 mt-2">Mediated Paths:</div>
            <div className="text-xs text-gray-400">X → M₁ → Y (38.2%)</div>
            <div className="text-xs text-gray-400">X → M₂ → Y (24.7%)</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card title="Engine Information">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Engine</span><span className="text-blue-400">Graph Causal Intervention Planner</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Version</span><span className="text-emerald-400">v1.255</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Endpoints</span><span className="text-gray-300">7 (6 POST + 1 GET)</span></div>
        </div>
      </Card>
      <Card title="Enums (6 enums, 36 values)">
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "InterventionGoal", vals: GOALS, color: "blue" },
            { name: "InterventionType", vals: INTERV_TYPES, color: "green" },
            { name: "PlanningHorizon", vals: HORIZONS, color: "amber" },
            { name: "ConstraintType", vals: CONSTRAINTS, color: "red" },
            { name: "OutcomeMetric", vals: OUTCOMES, color: "purple" },
            { name: "SimulationMode", vals: SIM_MODES, color: "cyan" },
          ].map((e) => (
            <div key={e.name} className="bg-gray-900/60 rounded p-2">
              <div className="text-xs font-semibold text-gray-300 mb-1">{e.name}</div>
              <div className="flex flex-wrap gap-1">
                {e.vals.map((v) => (
                  <Badge key={v} label={v.replace(/_/g, " ").slice(0, 18)} color={e.color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Integration Chain">
        <div className="space-y-1 text-sm">
          {[
            ["v1.254", "Causal Program Optimization → efficient execution"],
            ["v1.252", "Causal Fairness → equitable design"],
            ["v1.250", "Causal Explanation → justification"],
            ["v1.249", "Autonomous Discovery → targets"],
            ["v1.248", "Program Verification → validated plans"],
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

export default function GraphCausalIntervenePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Plan");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Causal Intervention Planner
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              v1.255 — Plan, simulate, optimize, monitor, adapt &amp; evaluate causal interventions
            </p>
          </div>
          <Badge label="v1.255" color="purple" />
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
          {activeTab === "Plan" && <PlanTab />}
          {activeTab === "Simulate" && <SimulateTab />}
          {activeTab === "Optimize" && <OptimizeTab />}
          {activeTab === "Monitor" && <MonitorTab />}
          {activeTab === "Adapt" && <AdaptTab />}
          {activeTab === "Evaluate" && <EvaluateTab />}
          {activeTab === "Overview" && <OverviewTab />}
        </div>
      </div>
    </div>
  );
}
