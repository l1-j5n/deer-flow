"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.274 — Causal Meta-Learning & Self-Improvement Engine
   7 tabs: Profile | Experience | Strategy | Adaptation | Assessment | Trajectory | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Profile", "Experience", "Strategy", "Adaptation", "Assessment", "Trajectory", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const META_STRATEGIES = ["maml_based","prototypical","matching","relation_network","memory_augmented","ai_autonomous_meta"];
const IMPROVEMENT_DIMS = ["accuracy","speed","robustness","generalization","interpretability","ai_emergent"];
const EXPERIENCE_SOURCES = ["task_execution","feedback_signal","error_analysis","cross_domain","simulation_trial","ai_synthetic"];
const ADAPTATION_MECHANISMS = ["gradient_based","bayesian","evolutionary","reinforcement","compositional","ai_hybrid"];
const RIGOR_LEVELS = ["heuristic","statistical","causal","counterfactual","prospective","ai_rigorous"];
const IMPROVEMENT_PHASES = ["observe","reflect","hypothesize","experiment","validate","integrate"];

const STRATEGY_COLORS: Record<string, string> = {
  maml_based: "blue", prototypical: "green", matching: "amber",
  relation_network: "purple", memory_augmented: "cyan", ai_autonomous_meta: "rose",
};

const DIM_COLORS: Record<string, string> = {
  accuracy: "green", speed: "cyan", robustness: "orange",
  generalization: "purple", interpretability: "blue", ai_emergent: "rose",
};

const PHASE_COLORS: Record<string, string> = {
  observe: "blue", reflect: "cyan", hypothesize: "amber",
  experiment: "orange", validate: "green", integrate: "purple",
};

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
    rose: "bg-rose-900/40 text-rose-300 border-rose-700",
    indigo: "bg-indigo-900/40 text-indigo-300 border-indigo-700",
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

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-400">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors ${value ? "bg-emerald-600" : "bg-gray-600"}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function BarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal?: number }) {
  const mx = maxVal ?? Math.max(...data.map((d) => d.value), 0.001);
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-28 truncate">{d.label.replace(/_/g, " ")}</span>
          <div className="flex-1 bg-gray-900 rounded h-3 overflow-hidden">
            <div
              className={`h-full rounded ${d.color}`}
              style={{ width: `${(d.value / mx) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-300 w-12 text-right">{(d.value * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

function MetricRow({ label, value, color = "text-gray-200" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-mono ${color}`}>{typeof value === "number" ? value.toFixed(4) : value}</span>
    </div>
  );
}

// ─── Tab: Profile ─────────────────────────────────────────
function ProfileTab() {
  const [strategy, setStrategy] = useState("ai_autonomous_meta");
  const [dimension, setDimension] = useState("accuracy");
  const [layers, setLayers] = useState(10);
  const [baseline, setBaseline] = useState(30);
  const [capMatrix, setCapMatrix] = useState(true);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SelectField label="Meta-Learning Strategy" value={strategy} options={META_STRATEGIES} onChange={setStrategy} />
        <SelectField label="Target Dimension" value={dimension} options={IMPROVEMENT_DIMS} onChange={setDimension} />
        <NumField label="Layers to Profile" value={layers} min={1} max={25} onChange={setLayers} />
        <NumField label="Baseline Period (days)" value={baseline} min={1} max={365} onChange={setBaseline} />
        <ToggleField label="Capability Matrix" value={capMatrix} onChange={setCapMatrix} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Strategy Selection">
          <div className="space-y-2">
            {META_STRATEGIES.map((s) => (
              <div key={s} className="flex items-center justify-between">
                <Badge label={s.replace(/_/g, " ")} color={STRATEGY_COLORS[s]} />
                <span className="text-xs text-gray-400">
                  {s === strategy ? "✓ Selected" : ""}
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Layer Capabilities (Preview)">
          <BarChart
            data={IMPROVEMENT_DIMS.map((d) => ({
              label: d,
              value: 0.4 + Math.random() * 0.6,
              color: d === dimension ? "bg-emerald-500" : "bg-blue-500",
            }))}
          />
        </Card>
      </div>
      <Card title="Self-Improvement Dimensions">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {IMPROVEMENT_DIMS.map((d) => (
            <div key={d} className={`p-2 rounded border ${d === dimension ? "border-emerald-600 bg-emerald-900/20" : "border-gray-700"}`}>
              <div className="text-xs text-gray-300 capitalize">{d.replace(/_/g, " ")}</div>
              <div className="text-sm font-mono text-emerald-400">{(0.4 + Math.random() * 0.6).toFixed(4)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Experience ──────────────────────────────────────
function ExperienceTab() {
  const [timeWindow, setTimeWindow] = useState(90);
  const [minConf, setMinConf] = useState(0.5);
  const [topLessons, setTopLessons] = useState(10);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <NumField label="Time Window (days)" value={timeWindow} min={1} max={365} onChange={setTimeWindow} />
        <NumField label="Min Confidence" value={minConf} min={0} max={1} step={0.05} onChange={setMinConf} />
        <NumField label="Top Lessons" value={topLessons} min={1} max={50} onChange={setTopLessons} />
      </div>
      <Card title="Experience Sources">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {EXPERIENCE_SOURCES.map((s) => (
            <div key={s} className="bg-gray-900/50 border border-gray-700 rounded p-3">
              <div className="text-xs text-gray-400 mb-1">{s.replace(/_/g, " ")}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-mono text-cyan-400">{Math.floor(50 + Math.random() * 450)}</span>
                <span className="text-xs text-gray-500">experiences</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                avg conf: <span className="text-emerald-400">{(0.5 + Math.random() * 0.5).toFixed(3)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Top Lessons Learned">
        <div className="space-y-2">
          {Array.from({ length: Math.min(topLessons, 6) }, (_, i) => (
            <div key={i} className="flex items-start gap-3 p-2 bg-gray-900/30 rounded">
              <Badge label={`#${i + 1}`} color={i < 3 ? "amber" : "blue"} />
              <div className="flex-1">
                <div className="text-xs text-gray-300">
                  {["Better warm-start across layers", "Adaptive step size for convergence", "Layer coupling optimization",
                    "Context-aware strategy selection", "Transfer amplification technique", "Error pattern memorization"][i % 6]}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  impact: <span className="text-emerald-400">{(0.02 + Math.random() * 0.15).toFixed(4)}</span>
                  {" · "}
                  confidence: <span className="text-cyan-400">{(0.6 + Math.random() * 0.4).toFixed(3)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Strategy ────────────────────────────────────────
function StrategyTab() {
  const [mechanism, setMechanism] = useState("ai_hybrid");
  const [candidates, setCandidates] = useState(5);
  const [exploreRatio, setExploreRatio] = useState(0.3);
  const [iterations, setIterations] = useState(10);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SelectField label="Adaptation Mechanism" value={mechanism} options={ADAPTATION_MECHANISMS} onChange={setMechanism} />
        <NumField label="Candidate Strategies" value={candidates} min={2} max={20} onChange={setCandidates} />
        <NumField label="Explore Ratio" value={exploreRatio} min={0} max={1} step={0.05} onChange={setExploreRatio} />
        <NumField label="Iterations" value={iterations} min={1} max={100} onChange={setIterations} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Candidate Strategies (Pareto Front)">
          <div className="space-y-2">
            {Array.from({ length: Math.min(candidates, 6) }, (_, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-900/30 rounded">
                <span className="text-xs text-gray-500 w-6">#{i + 1}</span>
                <div className="flex-1">
                  <div className="text-xs text-gray-300">
                    {["adaptive_ensemble", "progressive_refinement", "hierarchical_decomposition",
                      "contrastive_reasoning", "curriculum_guided", "analogical_transfer"][i % 6]}
                  </div>
                </div>
                <Badge label={i < 3 ? "Pareto" : "Dominated"} color={i < 3 ? "green" : "amber"} />
                <span className="text-xs font-mono text-emerald-400">{(0.5 + Math.random() * 0.5).toFixed(3)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Optimization Trajectory">
          <BarChart
            data={Array.from({ length: Math.min(iterations, 8) }, (_, i) => ({
              label: `iter ${i + 1}`,
              value: 0.4 + 0.6 * ((i + 1) / iterations) + 0.02 * Math.random(),
              color: "bg-emerald-500",
            }))}
          />
        </Card>
      </div>
      <Card title="Target Dimensions">
        <div className="flex flex-wrap gap-2">
          {IMPROVEMENT_DIMS.map((d) => (
            <Badge key={d} label={d.replace(/_/g, " ")} color={DIM_COLORS[d]} />
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Adaptation ──────────────────────────────────────
function AdaptationTab() {
  const [mechanism, setMechanism] = useState("ai_hybrid");
  const [cycles, setCycles] = useState(5);
  const [threshold, setThreshold] = useState(0.01);
  const [safety, setSafety] = useState(true);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SelectField label="Mechanism" value={mechanism} options={ADAPTATION_MECHANISMS} onChange={setMechanism} />
        <NumField label="Cycles" value={cycles} min={1} max={20} onChange={setCycles} />
        <NumField label="Convergence Threshold" value={threshold} min={0.001} max={0.5} step={0.01} onChange={setThreshold} />
        <ToggleField label="Safety Constraints" value={safety} onChange={setSafety} />
      </div>
      <Card title="Improvement Cycle: Observe → Reflect → Hypothesize → Experiment → Validate → Integrate">
        <div className="flex items-center gap-1 mb-4">
          {IMPROVEMENT_PHASES.map((p, i) => (
            <div key={p} className="flex items-center">
              <div className={`px-3 py-1.5 rounded text-xs font-medium bg-gray-900 border border-gray-700 text-gray-300`}>
                <span className="text-gray-500 mr-1">{i + 1}.</span>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </div>
              {i < IMPROVEMENT_PHASES.length - 1 && (
                <span className="text-gray-600 mx-1">→</span>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: Math.min(cycles, 6) }, (_, c) => (
            <div key={c} className="p-3 bg-gray-900/30 rounded border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-200">Cycle {c + 1}</span>
                <span className="text-xs font-mono text-emerald-400">
                  +{(0.01 + 0.1 * Math.random()).toFixed(4)} improvement
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {IMPROVEMENT_PHASES.map((p) => (
                  <div key={p} className="text-center">
                    <div className={`w-full h-2 rounded ${Math.random() > 0.15 ? "bg-emerald-600" : "bg-red-600/50"}`} />
                    <span className="text-[10px] text-gray-500">{p.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Safety Report">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricRow label="Safety Checks" value={cycles * 6} />
          <MetricRow label="Violations" value={Math.floor(Math.random() * 2)} />
          <MetricRow label="Safety Score" value={0.9 + Math.random() * 0.1} color="text-emerald-400" />
          <MetricRow label="Rollbacks" value={0} color="text-emerald-400" />
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Assessment ──────────────────────────────────────
function AssessmentTab() {
  const [rigor, setRigor] = useState("causal");
  const [scope, setScope] = useState("full_stack");
  const [baselines, setBaselines] = useState(5);
  const [counterfactual, setCounterfactual] = useState(true);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SelectField label="Rigor Level" value={rigor} options={RIGOR_LEVELS} onChange={setRigor} />
        <SelectField label="Scope" value={scope} options={["full_stack", "single_layer", "cross_layer"]} onChange={setScope} />
        <NumField label="Baseline Comparisons" value={baselines} min={1} max={20} onChange={setBaselines} />
        <ToggleField label="Counterfactual" value={counterfactual} onChange={setCounterfactual} />
      </div>
      <Card title="Dimension Assessments">
        <div className="space-y-3">
          {IMPROVEMENT_DIMS.map((d) => {
            const before = 0.4 + Math.random() * 0.4;
            const after = Math.min(1.0, before + 0.05 + Math.random() * 0.2);
            return (
              <div key={d} className="p-3 bg-gray-900/30 rounded">
                <div className="flex items-center justify-between mb-2">
                  <Badge label={d.replace(/_/g, " ")} color={DIM_COLORS[d]} />
                  <span className="text-xs text-emerald-400">+{((after - before) * 100).toFixed(1)}% improvement</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Before</div>
                    <div className="w-full h-2 bg-gray-800 rounded">
                      <div className="h-full bg-amber-500 rounded" style={{ width: `${before * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-gray-600">→</span>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">After</div>
                    <div className="w-full h-2 bg-gray-800 rounded">
                      <div className="h-full bg-emerald-500 rounded" style={{ width: `${after * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-mono text-gray-300 w-14 text-right">{after.toFixed(3)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="Rigor Validation Methods">
        <div className="flex flex-wrap gap-2">
          {["t_test", "mann_whitney", "bootstrap_ci", "do_calculus", "backdoor_adjustment",
            "counterfactual_bounds", "a_b_testing", "bayesian_update", "causal_dag_validation", "neural_counterfactual"].map((m) => (
            <Badge key={m} label={m.replace(/_/g, " ")} color="indigo" />
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Trajectory ──────────────────────────────────────
function TrajectoryTab() {
  const [timeRange, setTimeRange] = useState("last_quarter");
  const [granularity, setGranularity] = useState("weekly");
  const [predictions, setPredictions] = useState(true);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SelectField label="Time Range" value={timeRange} options={["last_month", "last_quarter", "last_half", "last_year", "all"]} onChange={setTimeRange} />
        <SelectField label="Granularity" value={granularity} options={["daily", "weekly", "monthly", "quarterly"]} onChange={setGranularity} />
        <ToggleField label="Include Predictions" value={predictions} onChange={setPredictions} />
      </div>
      <Card title="Learning Trajectory">
        <div className="space-y-1.5">
          {Array.from({ length: 12 }, (_, i) => {
            const val = 0.3 + 0.7 * ((i + 1) / 12);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-8">{i + 1}</span>
                <div className="flex-1 bg-gray-900 rounded h-4 overflow-hidden">
                  <div
                    className="h-full rounded bg-gradient-to-r from-blue-600 to-emerald-500"
                    style={{ width: `${val * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-300 w-12 text-right">{val.toFixed(3)}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Phase Detection">
          <div className="space-y-2">
            {["Rapid Learning", "Consolidation", "Breakthrough", "Refinement", "Stabilization"].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-900/30 rounded">
                <span className="text-xs text-gray-300">{p}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">rate: {(0.005 + Math.random() * 0.03).toFixed(4)}</span>
                  <Badge label={i < 2 ? "active" : "completed"} color={i < 2 ? "amber" : "green"} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Milestones">
          <div className="space-y-2">
            {["Breakthrough: Layer coupling strategy", "Plateau broken: Adaptive learning rate",
              "New strategy: Emergent meta-learning", "Convergence: Inner loop optimized"].map((m, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-gray-900/30 rounded">
                <span className="text-amber-400">★</span>
                <div>
                  <div className="text-xs text-gray-300">{m}</div>
                  <div className="text-xs text-gray-500">
                    impact: <span className="text-emerald-400">{(0.3 + Math.random() * 0.7).toFixed(3)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card title="v1.274 — Causal Meta-Learning & Self-Improvement Engine">
        <p className="text-sm text-gray-400 mb-4">
          Self-improvement intelligence layer — the system observes its own reasoning performance,
          reflects on successes and failures, hypothesizes better strategies, experiments safely via
          digital twin simulation, validates improvements rigorously, and integrates learned
          optimizations back into all 25 layers of the causal intelligence stack.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Layer</div>
            <div className="text-lg font-mono text-cyan-400">26</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Enums</div>
            <div className="text-lg font-mono text-emerald-400">6 × 6 = 36</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Endpoints</div>
            <div className="text-lg font-mono text-amber-400">6 POST + 1 GET</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Config Space</div>
            <div className="text-lg font-mono text-purple-400">46,656</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Improvement Cycle</div>
            <div className="text-sm font-mono text-rose-400">6 phases</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Sits Above</div>
            <div className="text-sm font-mono text-teal-400">v1.273</div>
          </div>
        </div>
      </Card>
      <Card title="Enums">
        <div className="space-y-3">
          {[
            { name: "MetaLearningStrategy", values: META_STRATEGIES, colors: STRATEGY_COLORS },
            { name: "SelfImprovementDimension", values: IMPROVEMENT_DIMS, colors: DIM_COLORS },
            { name: "ExperienceSourceType", values: EXPERIENCE_SOURCES },
            { name: "AdaptationMechanism", values: ADAPTATION_MECHANISMS },
            { name: "LearningRigorLevel", values: RIGOR_LEVELS },
            { name: "ImprovementPhase", values: IMPROVEMENT_PHASES, colors: PHASE_COLORS },
          ].map((e) => (
            <div key={e.name}>
              <div className="text-xs font-medium text-gray-300 mb-1">{e.name}</div>
              <div className="flex flex-wrap gap-1">
                {e.values.map((v) => (
                  <Badge key={v} label={v.replace(/_/g, " ")} color={(e.colors as Record<string, string>)?.[v] ?? "blue"} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Architecture Position">
        <div className="text-xs font-mono text-gray-400 space-y-1">
          <div className="text-gray-300 font-semibold mb-2">26-Layer Causal Intelligence Stack:</div>
          <div>Discovery → Explanation → Argumentation → Fairness → Curriculum → Optimization</div>
          <div>→ Intervention → Distillation → Ensemble → Temporal → Feedback</div>
          <div>→ Meta-Cognitive → Emergence → Governance → Transfer → Streaming</div>
          <div>→ Consensus → Resilience → Explainability → Compression</div>
          <div>→ Self-Healing → Semantic Interop → Workflow → Digital Twin</div>
          <div>→ Ontology Evolution → <span className="text-emerald-400 font-bold">Meta-Learning (v1.274) ← NEW</span></div>
        </div>
      </Card>
      <Card title="Endpoints">
        <div className="space-y-1">
          {[
            ["POST /graph/causal-meta-learning/profile", "Meta-learning strategy profiling"],
            ["POST /graph/causal-meta-learning/experience", "Experience aggregation & analysis"],
            ["POST /graph/causal-meta-learning/strategy", "Strategy optimization with Pareto analysis"],
            ["POST /graph/causal-meta-learning/adaptation", "Multi-cycle adaptation execution"],
            ["POST /graph/causal-meta-learning/assessment", "Rigorous self-assessment"],
            ["POST /graph/causal-meta-learning/trajectory", "Learning trajectory & phase tracking"],
            ["GET /graph/causal-meta-learning/overview", "System overview"],
          ].map(([ep, desc]) => (
            <div key={ep} className="flex items-center gap-2 py-1">
              <span className="text-xs font-mono text-amber-400">{ep}</span>
              <span className="text-xs text-gray-500">— {desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function GraphCausalMetaLearningPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Profile");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🧠</span>
            <h1 className="text-xl font-bold">Causal Meta-Learning & Self-Improvement Engine</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700">v1.274</span>
          </div>
          <p className="text-sm text-gray-400">
            The system observes its own reasoning, reflects on what works, hypothesizes better strategies,
            experiments safely, validates rigorously, and integrates optimizations across all 25 layers.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 border-b border-gray-800">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-emerald-400 border-emerald-400"
                  : "text-gray-400 border-transparent hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Profile" && <ProfileTab />}
        {activeTab === "Experience" && <ExperienceTab />}
        {activeTab === "Strategy" && <StrategyTab />}
        {activeTab === "Adaptation" && <AdaptationTab />}
        {activeTab === "Assessment" && <AssessmentTab />}
        {activeTab === "Trajectory" && <TrajectoryTab />}
        {activeTab === "Overview" && <OverviewTab />}
      </div>
    </div>
  );
}
