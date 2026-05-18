"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.272 — Causal Digital Twin Simulation Engine
   7 tabs: Twin | Simulate | Compare | Calibrate | Scenario | Forecast | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Twin", "Simulate", "Compare", "Calibrate", "Scenario", "Forecast", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const TWIN_TYPES = ["mirror","sandbox","predictive","counterfactual","synthetic","ai_generative"];
const SIMULATION_MODES = ["deterministic","stochastic","monte_carlo","agent_based","system_dynamics","ai_hybrid"];
const PERTURBATION_TYPES = ["node_removal","edge_weight","confounder_add","intervention_apply","distribution_shift","ai_discovery"];
const CALIBRATION_METHODS = ["parameter_estimation","bayesian_update","gradient_descent","genetic_optimization","ensemble_calibrate","ai_auto_calibrate"];
const SCENARIO_CATEGORIES = ["stress_test","edge_case","regression","sensitivity_analysis","policy_impact","ai_generated"];
const FORECAST_HORIZONS = ["immediate","short_term","medium_term","long_term","strategic","ai_adaptive_horizon"];

const TYPE_COLORS: Record<string, string> = {
  mirror: "blue", sandbox: "amber", predictive: "cyan",
  counterfactual: "purple", synthetic: "teal", ai_generative: "rose",
};

const HORIZON_COLORS: Record<string, string> = {
  immediate: "green", short_term: "cyan", medium_term: "blue",
  long_term: "purple", strategic: "rose", ai_adaptive_horizon: "amber",
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

function Metric({ label, value, color = "text-gray-200" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-sm font-mono font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function ProgressBar({ pct, color = "bg-blue-500" }: { pct: number; color?: string }) {
  return (
    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

// ─── Tab Panels ───────────────────────────────────────────

function TwinPanel() {
  const [twinType, setTwinType] = useState("sandbox");
  const [fidelity, setFidelity] = useState(0.95);
  const [syncMode, setSyncMode] = useState("snapshot");
  const [includeTemporal, setIncludeTemporal] = useState(true);

  const layerCount = 15 + Math.floor(fidelity * 8);
  const memMB = Math.round(200 * fidelity + 64);
  const storageMB = Math.round(120 * fidelity + 32);
  const twinScore = (fidelity * (0.92 + 0.08 * 0.7)).toFixed(4);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Twin Type" value={twinType} options={TWIN_TYPES} onChange={setTwinType} />
        <SelectField label="Sync Mode" value={syncMode} options={["snapshot", "live", "periodic"]} onChange={setSyncMode} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumField label="Fidelity Level" value={fidelity} min={0.5} max={1.0} step={0.01} onChange={setFidelity} />
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer pb-1.5">
            <input type="checkbox" checked={includeTemporal} onChange={(e) => setIncludeTemporal(e.target.checked)} className="rounded" />
            Include Temporal
          </label>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Metric label="Layers Replicated" value={layerCount} color="text-cyan-400" />
        <Metric label="Twin Score" value={twinScore} color="text-emerald-400" />
        <Metric label="Memory (MB)" value={memMB} />
        <Metric label="Storage (MB)" value={storageMB} />
      </div>

      <Card title="Twin Topology (estimated)">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Structural Fidelity</div>
            <ProgressBar pct={fidelity * 100} color="bg-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Distributional Alignment</div>
            <ProgressBar pct={fidelity * 95} color="bg-blue-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Temporal Accuracy</div>
            <ProgressBar pct={includeTemporal ? fidelity * 90 : 0} color="bg-purple-500" />
          </div>
        </div>
      </Card>

      <Card title="Twin Type Description">
        <div className="flex items-center gap-3">
          <Badge label={twinType.replace(/_/g, " ")} color={TYPE_COLORS[twinType] ?? "blue"} />
          <span className="text-xs text-gray-400">
            {twinType === "mirror" && "Exact replica of production knowledge graph for read-only analysis"}
            {twinType === "sandbox" && "Isolated copy for safe experimentation with no production impact"}
            {twinType === "predictive" && "Forward-looking twin with forecast-augmented causal structure"}
            {twinType === "counterfactual" && "Alternative-reality twin for 'what if not' causal reasoning"}
            {twinType === "synthetic" && "Synthetically generated causal graph for testing and validation"}
            {twinType === "ai_generative" && "AI-generated twin with discovered latent causal structures"}
          </span>
        </div>
      </Card>
    </div>
  );
}

function SimulatePanel() {
  const [simMode, setSimMode] = useState("monte_carlo");
  const [perturbation, setPerturbation] = useState("intervention_apply");
  const [iterations, setIterations] = useState(100);
  const [seed, setSeed] = useState(42);

  const perturbationDescriptions: Record<string, string> = {
    node_removal: "Remove nodes to test structural resilience",
    edge_weight: "Modify edge weights to test causal strength sensitivity",
    confounder_add: "Inject confounders to test hidden bias robustness",
    intervention_apply: "Apply do-calculus interventions for effect estimation",
    distribution_shift: "Shift data distributions to test generalization",
    ai_discovery: "AI discovers and applies most informative perturbations",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Simulation Mode" value={simMode} options={SIMULATION_MODES} onChange={setSimMode} />
        <SelectField label="Perturbation Type" value={perturbation} options={PERTURBATION_TYPES} onChange={setPerturbation} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumField label="Iterations" value={iterations} min={1} max={10000} step={10} onChange={setIterations} />
        <NumField label="Random Seed" value={seed} min={0} max={999999} onChange={setSeed} />
      </div>

      <Card title="Perturbation Details">
        <div className="flex items-center gap-2 mb-2">
          <Badge label={perturbation.replace(/_/g, " ")} color="rose" />
          <span className="text-xs text-gray-400">{perturbationDescriptions[perturbation]}</span>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Mode" value={simMode.replace(/_/g, " ")} color="text-cyan-400" />
        <Metric label="Configurations" value="36" color="text-amber-400" />
        <Metric label="Iterations" value={iterations} />
      </div>

      <Card title="Statistical Summary (estimated)">
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Mean Effect Size</span>
            <span className="text-gray-200 font-mono">{(0.3 + 0.5 * Math.random()).toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>p-value</span>
            <span className="text-emerald-400 font-mono">{(0.001 + 0.05 * Math.random()).toFixed(4)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>95% CI</span>
            <span className="text-gray-200 font-mono">[0.15, 0.72]</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Statistical Power</span>
            <span className="text-cyan-400 font-mono">{(0.7 + 0.3 * Math.random()).toFixed(4)}</span>
          </div>
        </div>
      </Card>

      <Card title="Convergence Diagnostics">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Gelman-Rubin</div>
            <ProgressBar pct={97} color="bg-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Effective Sample Size</div>
            <ProgressBar pct={65} color="bg-blue-500" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function ComparePanel() {
  const [nTwins, setNTwins] = useState(3);
  const [metrics, setMetrics] = useState<string[]>(["causal_structure", "distribution", "intervention_effect"]);

  const availableMetrics = ["causal_structure", "distribution", "intervention_effect", "anomaly_rate", "temporal_drift", "robustness"];

  const toggleMetric = (m: string) => {
    setMetrics((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  };

  return (
    <div className="space-y-4">
      <NumField label="Number of Twins to Compare" value={nTwins} min={2} max={10} onChange={setNTwins} />

      <Card title="Comparison Metrics (click to toggle)">
        <div className="flex flex-wrap gap-2">
          {availableMetrics.map((m) => (
            <button
              key={m}
              onClick={() => toggleMetric(m)}
              className={`px-3 py-1.5 text-xs rounded border transition ${
                metrics.includes(m)
                  ? "bg-indigo-900/60 text-indigo-300 border-indigo-600"
                  : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500"
              }`}
            >
              {m.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">{metrics.length} metrics selected</div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Twins" value={nTwins} color="text-cyan-400" />
        <Metric label="Pairwise Comparisons" value={(nTwins * (nTwins - 1)) / 2} />
        <Metric label="Metrics" value={metrics.length} color="text-amber-400" />
      </div>

      <Card title="Pairwise Comparison Matrix (preview)">
        <div className="space-y-2">
          {Array.from({ length: Math.min((nTwins * (nTwins - 1)) / 2, 6) }, (_, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-900/50 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <Badge label={`Twin ${i + 1}`} color="blue" />
                <span className="text-xs text-gray-500">vs</span>
                <Badge label={`Twin ${(i % (nTwins - 1)) + 2}`} color="cyan" />
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-400">sim: <span className="text-emerald-400">{(0.7 + 0.3 * Math.random()).toFixed(2)}</span></span>
                <span className="text-gray-400">agree: <span className="text-cyan-400">{(60 + 40 * Math.random()).toFixed(0)}%</span></span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Consensus">
        <div className="text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Agreement rate: {(75 + 25 * Math.random()).toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Majority structure: {Math.random() > 0.3 ? "convergent" : "partially aligned"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CalibratePanel() {
  const [method, setMethod] = useState("bayesian_update");
  const [maxIter, setMaxIter] = useState(50);
  const [threshold, setThreshold] = useState(0.01);

  const methodDescriptions: Record<string, string> = {
    parameter_estimation: "Estimate parameters via maximum likelihood",
    bayesian_update: "Update posterior distributions with observations",
    gradient_descent: "Minimize calibration error via gradient optimization",
    genetic_optimization: "Evolve parameter populations toward optimal fidelity",
    ensemble_calibrate: "Combine multiple calibration methods for robustness",
    ai_auto_calibrate: "AI selects and tunes calibration strategy automatically",
  };

  const initialFidelity = (0.7 + 0.15 * 0.5).toFixed(4);
  const finalFidelity = Math.min(0.999, 0.85 + 0.15 * 0.7).toFixed(4);

  return (
    <div className="space-y-4">
      <SelectField label="Calibration Method" value={method} options={CALIBRATION_METHODS} onChange={setMethod} />
      <div className="grid grid-cols-2 gap-3">
        <NumField label="Max Iterations" value={maxIter} min={1} max={500} onChange={setMaxIter} />
        <NumField label="Convergence Threshold" value={threshold} min={0.001} max={0.1} step={0.001} onChange={setThreshold} />
      </div>

      <Card title="Method Description">
        <p className="text-xs text-gray-400">{methodDescriptions[method]}</p>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Initial Fidelity" value={initialFidelity} color="text-amber-400" />
        <Metric label="Final Fidelity" value={finalFidelity} color="text-emerald-400" />
        <Metric label="Improvement" value={`+${(parseFloat(finalFidelity) - parseFloat(initialFidelity)).toFixed(4)}`} color="text-cyan-400" />
      </div>

      <Card title="Calibration Progress (convergence trace)">
        <div className="space-y-1">
          {[0.85, 0.72, 0.58, 0.41, 0.28, 0.18, 0.12, 0.08, 0.05, 0.03].map((loss, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-8">#{idx + 1}</span>
              <ProgressBar pct={(1 - loss) * 100} color={loss < 0.1 ? "bg-emerald-500" : loss < 0.3 ? "bg-blue-500" : "bg-amber-500"} />
              <span className="text-xs text-gray-400 font-mono w-16">{loss.toFixed(3)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Validation Metrics">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">RMSE</span><span className="text-gray-200 font-mono">{(0.01 + 0.05 * Math.random()).toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">MAE</span><span className="text-gray-200 font-mono">{(0.005 + 0.03 * Math.random()).toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">R²</span><span className="text-emerald-400 font-mono">{(0.92 + 0.07 * Math.random()).toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">AIC</span><span className="text-gray-200 font-mono">{(-80 + 40 * Math.random()).toFixed(1)}</span></div>
        </div>
      </Card>
    </div>
  );
}

function ScenarioPanel() {
  const [category, setCategory] = useState("stress_test");
  const [nVariants, setNVariants] = useState(5);

  const categoryInfo: Record<string, { desc: string; risk: string; color: string; defaultIter: number }> = {
    stress_test: { desc: "Push causal graph to extreme conditions", risk: "high", color: "red", defaultIter: 500 },
    edge_case: { desc: "Test boundary conditions and rare events", risk: "medium", color: "amber", defaultIter: 200 },
    regression: { desc: "Verify causal properties remain stable", risk: "low", color: "green", defaultIter: 100 },
    sensitivity_analysis: { desc: "Vary parameters to identify critical factors", risk: "medium", color: "cyan", defaultIter: 300 },
    policy_impact: { desc: "Evaluate hypothetical policy interventions", risk: "low", color: "teal", defaultIter: 150 },
    ai_generated: { desc: "AI-discovered scenarios from pattern analysis", risk: "variable", color: "rose", defaultIter: 400 },
  };

  const info = categoryInfo[category] ?? categoryInfo.stress_test;
  const totalSims = nVariants * info.defaultIter;

  return (
    <div className="space-y-4">
      <SelectField label="Scenario Category" value={category} options={SCENARIO_CATEGORIES} onChange={setCategory} />
      <NumField label="Number of Variants" value={nVariants} min={1} max={50} onChange={setNVariants} />

      <Card title={`${category.replace(/_/g, " ")} scenario`}>
        <div className="space-y-2">
          <p className="text-xs text-gray-400">{info.desc}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Risk:</span>
            <Badge label={info.risk} color={info.color} />
            <span className="text-xs text-gray-500 ml-2">Default iterations:</span>
            <span className="text-xs text-gray-200 font-mono">{info.defaultIter}</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Variants" value={nVariants} color="text-cyan-400" />
        <Metric label="Total Sims" value={totalSims.toLocaleString()} color="text-amber-400" />
        <Metric label="Est. Duration" value={`${(totalSims * 0.01).toFixed(0)} min`} />
      </div>

      <Card title="Variant Preview">
        <div className="space-y-2">
          {Array.from({ length: Math.min(nVariants, 5) }, (_, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-900/50 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <Badge label={`v${i + 1}`} color="indigo" />
                <span className="text-sm text-gray-300">{category}_v{i + 1}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-400">impact: <span className="text-amber-400">{(0.1 + 0.8 * Math.random()).toFixed(2)}</span></span>
                <Badge label={["critical", "high", "medium", "low"][i % 4]} color={["red", "amber", "cyan", "green"][i % 4] as "red" | "amber" | "cyan" | "green"} />
              </div>
            </div>
          ))}
          {nVariants > 5 && <div className="text-xs text-gray-500 text-center">+{nVariants - 5} more variants</div>}
        </div>
      </Card>

      <Card title="Coverage Analysis">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Parameter Space</div>
            <ProgressBar pct={40 + 50 * Math.random()} color="bg-cyan-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Edge Case Detection</div>
            <ProgressBar pct={50 + 50 * Math.random()} color="bg-amber-500" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function ForecastPanel() {
  const [horizon, setHorizon] = useState("medium_term");
  const [nSims, setNSims] = useState(200);
  const [confidence, setConfidence] = useState(0.95);

  const horizonInfo: Record<string, { periods: number; unit: string; uncertainty: number }> = {
    immediate: { periods: 5, unit: "hours", uncertainty: 0.05 },
    short_term: { periods: 12, unit: "hours", uncertainty: 0.10 },
    medium_term: { periods: 30, unit: "days", uncertainty: 0.20 },
    long_term: { periods: 90, unit: "days", uncertainty: 0.35 },
    strategic: { periods: 365, unit: "days", uncertainty: 0.50 },
    ai_adaptive_horizon: { periods: 60, unit: "adaptive", uncertainty: 0.15 },
  };

  const hcfg = horizonInfo[horizon];
  const forecastQuality = (0.75 + 0.25 * (1 - hcfg.uncertainty)).toFixed(4);
  const ciWidth = (hcfg.uncertainty * 3.92).toFixed(4);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Forecast Horizon" value={horizon} options={FORECAST_HORIZONS} onChange={setHorizon} />
        <NumField label="Simulations" value={nSims} min={10} max={5000} step={10} onChange={setNSims} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumField label="Confidence Level" value={confidence} min={0.5} max={0.99} step={0.01} onChange={setConfidence} />
      </div>

      <Card title="Horizon Configuration">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-500">Periods</div>
            <div className="text-sm font-mono text-cyan-400">{hcfg.periods}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Unit</div>
            <div className="text-sm font-mono text-amber-400">{hcfg.unit}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Uncertainty</div>
            <div className="text-sm font-mono text-purple-400">{(hcfg.uncertainty * 100).toFixed(0)}%</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Forecast Quality" value={forecastQuality} color="text-emerald-400" />
        <Metric label="CI Width" value={ciWidth} />
        <Metric label="Simulations" value={nSims} color="text-cyan-400" />
      </div>

      <Card title="Target Variables Forecast (preview)">
        <div className="space-y-3">
          {["causal_strength", "anomaly_probability", "intervention_impact"].map((v) => (
            <div key={v}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-300">{v.replace(/_/g, " ")}</span>
                <span className="text-xs text-gray-500">{hcfg.periods} {hcfg.unit}</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(hcfg.periods, 12) }, (_, i) => {
                  const val = 0.4 + 0.4 * Math.sin(i * 0.5) + hcfg.uncertainty * (Math.random() - 0.5);
                  return (
                    <div
                      key={i}
                      className={`rounded-sm ${val > 0.6 ? "bg-emerald-500/60" : val > 0.4 ? "bg-blue-500/60" : "bg-amber-500/60"}`}
                      style={{ width: `${100 / Math.min(hcfg.periods, 12)}%`, height: `${Math.max(val * 40, 4)}px` }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Aggregate Metrics">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between"><span className="text-gray-500">Mean Accuracy</span><span className="text-emerald-400 font-mono">{(0.8 + 0.2 * (1 - hcfg.uncertainty)).toFixed(4)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">CI Width</span><span className="text-gray-200 font-mono">{ciWidth}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Drift Detected</span><span className="text-amber-400">{Math.random() > 0.8 ? "Yes" : "No"}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Regime Change</span><span className="text-gray-200 font-mono">{(Math.random() * 0.3).toFixed(4)}</span></div>
        </div>
      </Card>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="space-y-4">
      <Card title="v1.272 — Causal Digital Twin Simulation Engine">
        <p className="text-sm text-gray-400">
          The <span className="text-cyan-300">safe experimentation layer</span> for the 23-layer causal intelligence stack.
          Creates digital twins, runs what-if simulations, compares outcomes, calibrates fidelity, manages scenario libraries, and produces forecasts.
        </p>
      </Card>

      <Card title="Enums (6 × 6 = 36 values)">
        <div className="space-y-2">
          {[
            { name: "TwinType", values: TWIN_TYPES, color: "blue" },
            { name: "SimulationMode", values: SIMULATION_MODES, color: "cyan" },
            { name: "PerturbationType", values: PERTURBATION_TYPES, color: "rose" },
            { name: "CalibrationMethod", values: CALIBRATION_METHODS, color: "purple" },
            { name: "ScenarioCategory", values: SCENARIO_CATEGORIES, color: "amber" },
            { name: "ForecastHorizon", values: FORECAST_HORIZONS, color: "green" },
          ].map((e) => (
            <div key={e.name}>
              <div className="text-xs text-gray-400 mb-1">{e.name}</div>
              <div className="flex flex-wrap gap-1">
                {e.values.map((v) => (
                  <Badge key={v} label={v.replace(/_/g, " ")} color={e.color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Endpoints (7)">
        <div className="space-y-1 text-xs">
          {[
            { method: "POST", path: "/graph/causal-twin/twin", desc: "Create/manage digital twin instances" },
            { method: "POST", path: "/graph/causal-twin/simulate", desc: "Run what-if simulations with perturbations" },
            { method: "POST", path: "/graph/causal-twin/compare", desc: "Compare results across twins" },
            { method: "POST", path: "/graph/causal-twin/calibrate", desc: "Calibrate twin against real observations" },
            { method: "POST", path: "/graph/causal-twin/scenario", desc: "Define simulation scenario libraries" },
            { method: "POST", path: "/graph/causal-twin/forecast", desc: "Time-series forecast from twin simulation" },
            { method: "GET",  path: "/graph/causal-twin/overview", desc: "System overview" },
          ].map((ep) => (
            <div key={ep.path} className="flex gap-2 text-gray-400">
              <span className={`font-mono ${ep.method === "GET" ? "text-emerald-400" : "text-blue-400"}`}>{ep.method}</span>
              <span className="text-gray-300 font-mono">{ep.path}</span>
              <span>— {ep.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Architecture Chain (24 layers)">
        <div className="text-xs text-gray-400 space-y-0.5 font-mono">
          <div>Pipeline (v1.249-259) → Meta-Cognitive (v1.260) → Emergence (v1.261)</div>
          <div>→ Governance (v1.262) → Transfer (v1.263) → Streaming (v1.264)</div>
          <div>→ Consensus (v1.265) → Resilience (v1.266) → Explainability (v1.267)</div>
          <div>→ Compression (v1.268) → Self-Healing (v1.269) → Interop (v1.270)</div>
          <div>→ Orchestration (v1.271)</div>
          <div className="text-cyan-400 font-bold">→ <span className="underline">Digital Twin (v1.272) ← YOU ARE HERE</span></div>
        </div>
      </Card>

      <Card title="Core Innovation">
        <p className="text-xs text-gray-400 leading-relaxed">
          After workflow orchestration (v1.271) enables automated end-to-end pipelines, the <span className="text-cyan-300">digital twin simulation layer</span> provides a safe sandbox for experimentation. Key capabilities:
        </p>
        <div className="mt-2 space-y-1 text-xs text-gray-400">
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> <strong className="text-gray-300">Twin:</strong> 6 types from mirror to AI-generative with configurable fidelity</div>
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> <strong className="text-gray-300">Simulate:</strong> 36 configurations (6 modes × 6 perturbations) with statistical validation</div>
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> <strong className="text-gray-300">Compare:</strong> Pairwise structural/distributional comparison with consensus metrics</div>
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> <strong className="text-gray-300">Calibrate:</strong> 6 methods with convergence tracing and residual analysis</div>
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> <strong className="text-gray-300">Scenario:</strong> 6 categories with variant generation and coverage analysis</div>
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> <strong className="text-gray-300">Forecast:</strong> 6 horizons from immediate to strategic with confidence intervals</div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

export default function CausalDigitalTwinPage() {
  const [tab, setTab] = useState<Tab>("Twin");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">
            Causal Digital Twin Simulation
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            v1.272 — Safe experimentation layer for the 23-layer causal intelligence stack
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-800 pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm rounded-t transition ${
                tab === t
                  ? "bg-gray-800 text-white border border-gray-700 border-b-gray-800 -mb-[1px]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-b-lg p-5">
          {tab === "Twin" && <TwinPanel />}
          {tab === "Simulate" && <SimulatePanel />}
          {tab === "Compare" && <ComparePanel />}
          {tab === "Calibrate" && <CalibratePanel />}
          {tab === "Scenario" && <ScenarioPanel />}
          {tab === "Forecast" && <ForecastPanel />}
          {tab === "Overview" && <OverviewPanel />}
        </div>
      </div>
    </div>
  );
}
