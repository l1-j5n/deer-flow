"use client";

import { useState } from "react";

const API = "/api/graph";

const EVOLUTION_TYPES = ["node_birth", "node_death", "edge_formation", "edge_dissolution", "attribute_drift", "structural_shift"];
const ATTENTION_TYPES = ["local_window", "global_decay", "periodic", "event_driven", "hierarchical", "adaptive"];
const FORECAST_METHODS = ["arima", "exponential_smooth", "neural_ode", "graph_transformer", "diffusion", "ensemble"];
const CAUSALITY_METHODS = ["granger", "transfer_entropy", "pc_algorithm", "var_model", "dtw_causal", "spectral"];
const ANOMALY_TYPES = ["sudden_change", "gradual_drift", "periodic_violation", "missing_pattern", "concept_shift", "cascading_failure"];
const TIME_SCALES = ["tick", "second", "minute", "hour", "day", "custom"];

const TABS = ["Evolve", "Attention", "Forecast", "Causality", "Anomaly", "Pipeline", "Summary"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>
      {children}
    </div>
  );
}

function StatBar({ label, value, max = 1 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(4)}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto max-h-80 whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export default function GraphTemporalDynamicsPage() {
  const [tab, setTab] = useState<Tab>("Evolve");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [graphId] = useState("graph_001");
  const [evolutionType, setEvolutionType] = useState("edge_formation");
  const [numSnapshots, setNumSnapshots] = useState(20);
  const [timeScale, setTimeScale] = useState("hour");
  const [evolutionRate, setEvolutionRate] = useState(0.5);

  const [attentionType, setAttentionType] = useState("adaptive");
  const [windowSize, setWindowSize] = useState(10);
  const [numHeads, setNumHeads] = useState(4);
  const [decayFactor, setDecayFactor] = useState(0.9);

  const [forecastMethod, setForecastMethod] = useState("ensemble");
  const [forecastHorizon, setForecastHorizon] = useState(10);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [numHistory, setNumHistory] = useState(30);

  const [causalityMethod, setCausalityMethod] = useState("granger");
  const [numVariables, setNumVariables] = useState(8);
  const [maxLag, setMaxLag] = useState(5);
  const [significanceLevel, setSignificanceLevel] = useState(0.05);

  const [anomalyType, setAnomalyType] = useState("sudden_change");
  const [detectionWindow, setDetectionWindow] = useState(10);
  const [sensitivity, setSensitivity] = useState(0.5);
  const [numCheckpoints, setNumCheckpoints] = useState(20);

  const [pipelineStages, setPipelineStages] = useState(7);
  const [timeBudget, setTimeBudget] = useState(5000);
  const [accuracyTarget, setAccuracyTarget] = useState(0.9);

  async function run(endpoint: string, body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...body }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/temporal/summary`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const SelectInput = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
    <select
      className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );

  const NumberInput = ({ value, onChange, step = 1, min = 0, max = 10000 }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number }) => (
    <input
      type="number"
      className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Graph Temporal Dynamics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">v1.211 — Dynamic graph reasoning with temporal attention & forecasting</p>
        </div>
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full">
          v1.211.0
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b dark:border-gray-700 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t
                ? "border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Controls + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Controls */}
        <div className="space-y-3">
          {tab === "Evolve" && (
            <Card title="Temporal Graph Evolution">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Evolution Type</label><SelectInput value={evolutionType} onChange={setEvolutionType} options={EVOLUTION_TYPES} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Snapshots</label><NumberInput value={numSnapshots} onChange={setNumSnapshots} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Time Scale</label><SelectInput value={timeScale} onChange={setTimeScale} options={TIME_SCALES} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Evolution Rate</label><NumberInput value={evolutionRate} onChange={setEvolutionRate} step={0.05} min={0} max={2} /></div>
                <button onClick={() => run("/temporal/evolve", { evolution_type: evolutionType, num_snapshots: numSnapshots, time_scale: timeScale, evolution_rate: evolutionRate })} disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2 text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Evolution Simulation"}
                </button>
              </div>
            </Card>
          )}

          {tab === "Attention" && (
            <Card title="Temporal Attention">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Attention Type</label><SelectInput value={attentionType} onChange={setAttentionType} options={ATTENTION_TYPES} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Window Size</label><NumberInput value={windowSize} onChange={setWindowSize} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Num Heads</label><NumberInput value={numHeads} onChange={setNumHeads} min={1} max={16} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Decay Factor</label><NumberInput value={decayFactor} onChange={setDecayFactor} step={0.05} min={0} max={1} /></div>
                <button onClick={() => run("/temporal/attention", { attention_type: attentionType, window_size: windowSize, num_heads: numHeads, decay_factor: decayFactor })} disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2 text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Temporal Attention"}
                </button>
              </div>
            </Card>
          )}

          {tab === "Forecast" && (
            <Card title="Graph State Forecasting">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Forecast Method</label><SelectInput value={forecastMethod} onChange={setForecastMethod} options={FORECAST_METHODS} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Forecast Horizon</label><NumberInput value={forecastHorizon} onChange={setForecastHorizon} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Confidence Level</label><NumberInput value={confidenceLevel} onChange={setConfidenceLevel} step={0.01} min={0.8} max={0.99} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">History Snapshots</label><NumberInput value={numHistory} onChange={setNumHistory} /></div>
                <button onClick={() => run("/temporal/forecast", { forecast_method: forecastMethod, forecast_horizon: forecastHorizon, confidence_level: confidenceLevel, num_history: numHistory })} disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2 text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Forecast"}
                </button>
              </div>
            </Card>
          )}

          {tab === "Causality" && (
            <Card title="Temporal Causal Discovery">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Causality Method</label><SelectInput value={causalityMethod} onChange={setCausalityMethod} options={CAUSALITY_METHODS} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Variables</label><NumberInput value={numVariables} onChange={setNumVariables} min={3} max={50} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Max Lag</label><NumberInput value={maxLag} onChange={setMaxLag} min={1} max={20} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Significance Level</label><NumberInput value={significanceLevel} onChange={setSignificanceLevel} step={0.01} min={0.01} max={0.2} /></div>
                <button onClick={() => run("/temporal/causality", { causality_method: causalityMethod, num_variables: numVariables, max_lag: maxLag, significance_level: significanceLevel })} disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2 text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Causal Discovery"}
                </button>
              </div>
            </Card>
          )}

          {tab === "Anomaly" && (
            <Card title="Temporal Anomaly Detection">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Anomaly Type</label><SelectInput value={anomalyType} onChange={setAnomalyType} options={ANOMALY_TYPES} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Detection Window</label><NumberInput value={detectionWindow} onChange={setDetectionWindow} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Sensitivity</label><NumberInput value={sensitivity} onChange={setSensitivity} step={0.05} min={0} max={1} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Checkpoints</label><NumberInput value={numCheckpoints} onChange={setNumCheckpoints} /></div>
                <button onClick={() => run("/temporal/anomaly", { anomaly_type: anomalyType, detection_window: detectionWindow, sensitivity: sensitivity, num_checkpoints: numCheckpoints })} disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2 text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Anomaly Detection"}
                </button>
              </div>
            </Card>
          )}

          {tab === "Pipeline" && (
            <Card title="Autonomous Temporal Pipeline">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Stages (1-7)</label><NumberInput value={pipelineStages} onChange={setPipelineStages} min={1} max={7} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Time Budget (ms)</label><NumberInput value={timeBudget} onChange={setTimeBudget} step={100} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Accuracy Target</label><NumberInput value={accuracyTarget} onChange={setAccuracyTarget} step={0.05} min={0.5} max={1} /></div>
                <button onClick={() => run("/temporal/pipeline", { num_stages: pipelineStages, time_budget: timeBudget, accuracy_target: accuracyTarget })} disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2 text-sm hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Pipeline"}
                </button>
              </div>
            </Card>
          )}

          {tab === "Summary" && (
            <Card title="Engine Summary">
              <button onClick={fetchSummary} disabled={loading} className="w-full bg-green-600 text-white rounded py-2 text-sm hover:bg-green-700 disabled:opacity-50">
                {loading ? "Loading..." : "Fetch Full Summary"}
              </button>
            </Card>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded p-3">
              Error: {error}
            </div>
          )}

          {result && (
            <>
              {/* Quick Stats */}
              <Card title="Key Metrics">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {"evolution_summary" in result && typeof result.evolution_summary === "object" && result.evolution_summary !== null && (
                    <>
                      <StatBar label="Avg Stability" value={(result.evolution_summary as Record<string, unknown>).avg_stability as number} />
                      <StatBar label="Max Evolution" value={(result.evolution_summary as Record<string, unknown>).max_evolution_intensity as number} />
                    </>
                  )}
                  {"attention_summary" in result && typeof result.attention_summary === "object" && result.attention_summary !== null && (
                    <>
                      <StatBar label="Overall Focus" value={(result.attention_summary as Record<string, unknown>).overall_focus as number} />
                      <StatBar label="Temporal Coverage" value={(result.attention_summary as Record<string, unknown>).temporal_coverage as number} />
                    </>
                  )}
                  {"forecast_summary" in result && typeof result.forecast_summary === "object" && result.forecast_summary !== null && (
                    <>
                      <StatBar label="Structural Stability" value={(result.forecast_summary as Record<string, unknown>).structural_stability as number} />
                      <StatBar label="Volatility" value={(result.forecast_summary as Record<string, unknown>).volatility_forecast as number} />
                    </>
                  )}
                  {"causality_summary" in result && typeof result.causality_summary === "object" && result.causality_summary !== null && (
                    <>
                      <StatBar label="Causal Complexity" value={(result.causality_summary as Record<string, unknown>).causal_complexity as number} />
                      <StatBar label="Significant Ratio" value={((result.causality_summary as Record<string, unknown>).significant_links as number) / Math.max(((result.causality_summary as Record<string, unknown>).total_causal_links as number), 1)} />
                    </>
                  )}
                  {"anomaly_summary" in result && typeof result.anomaly_summary === "object" && result.anomaly_summary !== null && (
                    <>
                      <StatBar label="Structural Stability" value={(result.anomaly_summary as Record<string, unknown>).structural_stability as number} />
                      <StatBar label="Anomaly Rate" value={(result.anomaly_summary as Record<string, unknown>).anomaly_rate as number} />
                    </>
                  )}
                  {"pipeline_summary" in result && typeof result.pipeline_summary === "object" && result.pipeline_summary !== null && (
                    <>
                      <StatBar label="Avg Quality" value={(result.pipeline_summary as Record<string, unknown>).avg_quality as number} />
                      <StatBar label="Accuracy" value={(result.pipeline_summary as Record<string, unknown>).accuracy_achieved as number} />
                    </>
                  )}
                  {"version" in result && <StatBar label="Version" value={1} />}
                </div>
              </Card>

              {/* Full JSON */}
              <Card title="Raw Response">
                <JsonBlock data={result} />
              </Card>
            </>
          )}

          {!result && !error && !loading && (
            <Card title="Ready">
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure parameters on the left and click Run to execute.</p>
              <div className="mt-3 space-y-1 text-xs text-gray-400 dark:text-gray-500">
                <p><strong>Evolve:</strong> Simulate graph structure changes over time</p>
                <p><strong>Attention:</strong> Compute temporal attention across snapshots</p>
                <p><strong>Forecast:</strong> Predict future graph states with confidence intervals</p>
                <p><strong>Causality:</strong> Discover temporal cause-effect relationships</p>
                <p><strong>Anomaly:</strong> Detect abnormal temporal patterns in graphs</p>
                <p><strong>Pipeline:</strong> Run autonomous multi-stage temporal analysis</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
