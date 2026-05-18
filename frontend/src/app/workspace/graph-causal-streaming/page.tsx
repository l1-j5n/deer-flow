"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.264 — Graph Causal Real-time Streaming Engine
   7 tabs: Ingest | Window | Update | Monitor | Checkpoint | Replay | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Ingest", "Window", "Update", "Monitor", "Checkpoint", "Replay", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const STREAMING_MODES = ["event_driven","micro_batch","continuous","sliding_window","trigger_based","ai_adaptive_stream"];
const WINDOW_STRATEGIES = ["fixed_size","time_based","count_based","session_based","adaptive_size","ai_dynamic_window"];
const UPDATE_METHODS = ["stochastic_gradient","incremental_bayesian","online_em","reservoir_sampling","forgetting_factor","ai_rapid_update"];
const HEALTH_METRICS = ["throughput","latency_p99","backpressure","skewness","completeness","ai_anomaly_score"];
const CHECKPOINT_POLICIES = ["interval_based","event_triggered","state_change","hybrid_checkpoint","incremental_snapshot","ai_predictive_checkpoint"];
const REPLAY_SCOPES = ["full","partial","delta","critical_only"];

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

function StatBox({ label, value, color = "text-gray-200" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-gray-900/60 rounded p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-mono font-semibold ${color}`}>{value}</div>
    </div>
  );
}

// ─── Tab Panels ──────────────────────────────────────────

function IngestTab() {
  const [mode, setMode] = useState(STREAMING_MODES[5]);
  const [eventRate, setEventRate] = useState("100");
  const [causalDim, setCausalDim] = useState("10");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-stream/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, event_rate: parseFloat(eventRate), causal_dimensions: parseInt(causalDim) }),
      });
      setResult(await res.json());
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card title="Stream Ingestion Configuration">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <SelectField label="Streaming Mode" value={mode} options={STREAMING_MODES} onChange={setMode} />
          <div>
            <label className="block text-xs text-gray-400 mb-1">Event Rate (events/sec)</label>
            <input type="number" className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" value={eventRate} onChange={(e) => setEventRate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Causal Dimensions</label>
            <input type="number" className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" value={causalDim} onChange={(e) => setCausalDim(e.target.value)} />
          </div>
        </div>
        <button onClick={run} disabled={loading} className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white text-sm rounded disabled:opacity-50">
          {loading ? "Processing..." : "Run Ingestion"}
        </button>
      </Card>
      {result && !("error" in result) && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Total Events" value={(result.total_events as number)?.toLocaleString()} color="text-cyan-300" />
            <StatBox label="Processed" value={(result.processed_events as number)?.toLocaleString()} color="text-green-300" />
            <StatBox label="Rejected" value={result.rejected_events as number} color="text-red-300" />
            <StatBox label="Quality" value={(result.ingestion_quality as number)?.toFixed(4)} color="text-amber-300" />
          </div>
          <Card title="Streams">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2 px-2">Stream</th>
                    <th className="text-right py-2 px-2">Throughput</th>
                    <th className="text-right py-2 px-2">Latency</th>
                    <th className="text-right py-2 px-2">Error Rate</th>
                    <th className="text-right py-2 px-2">Backpressure</th>
                    <th className="text-right py-2 px-2">Buffer</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.streams as Record<string, unknown>[]).map((s, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="py-1.5 px-2 text-gray-300">{s.stream_name as string}</td>
                      <td className="text-right py-1.5 px-2 text-cyan-300">{(s.throughput_events_per_sec as number)?.toFixed(1)}</td>
                      <td className="text-right py-1.5 px-2 text-amber-300">{(s.avg_latency_ms as number)?.toFixed(2)} ms</td>
                      <td className="text-right py-1.5 px-2 text-red-300">{(s.error_rate as number)?.toFixed(4)}</td>
                      <td className="text-right py-1.5 px-2 text-orange-300">{(s.backpressure_ratio as number)?.toFixed(3)}</td>
                      <td className="text-right py-1.5 px-2 text-gray-300">{(s.buffer_utilization as number)?.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function WindowTab() {
  const [strategy, setStrategy] = useState(WINDOW_STRATEGIES[5]);
  const [windowSize, setWindowSize] = useState("100");
  const [overlap, setOverlap] = useState("0.2");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-stream/window", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy, window_size: parseInt(windowSize), overlap_ratio: parseFloat(overlap) }),
      });
      setResult(await res.json());
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card title="Windowing Configuration">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <SelectField label="Window Strategy" value={strategy} options={WINDOW_STRATEGIES} onChange={setStrategy} />
          <div>
            <label className="block text-xs text-gray-400 mb-1">Window Size</label>
            <input type="number" className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" value={windowSize} onChange={(e) => setWindowSize(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Overlap Ratio</label>
            <input type="number" step="0.05" className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" value={overlap} onChange={(e) => setOverlap(e.target.value)} />
          </div>
        </div>
        <button onClick={run} disabled={loading} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-sm rounded disabled:opacity-50">
          {loading ? "Processing..." : "Apply Windowing"}
        </button>
      </Card>
      {result && !("error" in result) && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Total Windows" value={result.total_windows as number} color="text-purple-300" />
            <StatBox label="Active Windows" value={result.active_windows as number} color="text-green-300" />
            <StatBox label="Effectiveness" value={(result.windowing_effectiveness as number)?.toFixed(4)} color="text-cyan-300" />
            <StatBox label="Memory (MB)" value={(result.memory_footprint_mb as number)?.toFixed(1)} color="text-amber-300" />
          </div>
          <Card title="Windows Detail">
            <div className="grid grid-cols-4 gap-3">
              {(result.windows as Record<string, unknown>[]).slice(0, 8).map((w, i) => (
                <div key={i} className="bg-gray-900/60 rounded p-2 space-y-1">
                  <div className="text-xs text-purple-300 font-mono">{w.window_id as string}</div>
                  <div className="text-xs text-gray-400">Events: <span className="text-gray-200">{w.event_count as number}</span></div>
                  <div className="text-xs text-gray-400">Density: <span className="text-cyan-300">{(w.causal_density as number)?.toFixed(3)}</span></div>
                  <div className="text-xs text-gray-400">Complete: <span className="text-green-300">{(w.completeness as number)?.toFixed(3)}</span></div>
                  <div className="text-xs text-gray-400">Stale: <span className="text-orange-300">{(w.data_staleness as number)?.toFixed(3)}</span></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function UpdateTab() {
  const [method, setMethod] = useState(UPDATE_METHODS[5]);
  const [lr, setLr] = useState("0.01");
  const [complexity, setComplexity] = useState("50");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-stream/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, learning_rate: parseFloat(lr), model_complexity: parseInt(complexity) }),
      });
      setResult(await res.json());
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card title="Online Update Configuration">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <SelectField label="Update Method" value={method} options={UPDATE_METHODS} onChange={setMethod} />
          <div>
            <label className="block text-xs text-gray-400 mb-1">Learning Rate</label>
            <input type="number" step="0.001" className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" value={lr} onChange={(e) => setLr(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Model Complexity</label>
            <input type="number" className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" value={complexity} onChange={(e) => setComplexity(e.target.value)} />
          </div>
        </div>
        <button onClick={run} disabled={loading} className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white text-sm rounded disabled:opacity-50">
          {loading ? "Processing..." : "Run Update"}
        </button>
      </Card>
      {result && !("error" in result) && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Steps" value={result.update_steps as number} color="text-teal-300" />
            <StatBox label="Convergence" value={`Step ${result.convergence_step as number}`} color="text-green-300" />
            <StatBox label="Loss Δ" value={(result.loss_improvement as number)?.toFixed(5)} color="text-cyan-300" />
            <StatBox label="Quality" value={(result.update_quality as number)?.toFixed(4)} color="text-amber-300" />
          </div>
          <Card title="Convergence Trajectory">
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {(result.trajectory as Record<string, unknown>[]).filter((_, i) => i % 3 === 0).map((t, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="text-gray-500 w-12">Step {t.step as number}</span>
                  <div className="flex-1 bg-gray-900 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.min(((t.causal_accuracy as number) ?? 0) * 100, 100)}%` }} />
                  </div>
                  <span className="text-teal-300 w-16 text-right">{(t.causal_accuracy as number)?.toFixed(3)}</span>
                  <span className="text-gray-400 w-16">loss {(t.loss as number)?.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Stability" value={(result.stability_index as number)?.toFixed(4)} color="text-green-300" />
            <StatBox label="Memory Retention" value={(result.memory_retention as number)?.toFixed(4)} color="text-cyan-300" />
            <StatBox label="Forgetting Risk" value={(result.catastrophic_forgetting_risk as number)?.toFixed(4)} color="text-red-300" />
          </div>
        </div>
      )}
    </div>
  );
}

function MonitorTab() {
  const [metric, setMetric] = useState(HEALTH_METRICS[5]);
  const [windowSec, setWindowSec] = useState("60");
  const [threshold, setThreshold] = useState("0.3");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-stream/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metric, monitoring_window_sec: parseFloat(windowSec), alert_threshold: parseFloat(threshold) }),
      });
      setResult(await res.json());
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card title="Stream Health Monitor">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <SelectField label="Health Metric" value={metric} options={HEALTH_METRICS} onChange={setMetric} />
          <div>
            <label className="block text-xs text-gray-400 mb-1">Monitor Window (sec)</label>
            <input type="number" className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" value={windowSec} onChange={(e) => setWindowSec(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Alert Threshold</label>
            <input type="number" step="0.05" className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          </div>
        </div>
        <button onClick={run} disabled={loading} className="px-4 py-2 bg-orange-700 hover:bg-orange-600 text-white text-sm rounded disabled:opacity-50">
          {loading ? "Processing..." : "Monitor Stream"}
        </button>
      </Card>
      {result && !("error" in result) && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Current" value={(result.current_value as number)?.toFixed(4)} color="text-orange-300" />
            <StatBox label="Baseline" value={(result.baseline_value as number)?.toFixed(4)} color="text-gray-300" />
            <StatBox label="Health Score" value={(result.health_score as number)?.toFixed(4)} color="text-green-300" />
            <div className="bg-gray-900/60 rounded p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">Alert</div>
              <Badge label={(result.alert_level as string)?.toUpperCase() ?? "NONE"} color={
                result.alert_level === "none" ? "green" :
                result.alert_level === "low" ? "amber" :
                result.alert_level === "high" ? "orange" : "red"
              } />
            </div>
          </div>
          <Card title="Health Timeline">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {(result.timeline as Record<string, unknown>[]).filter((_, i) => i % 3 === 0).map((t, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="text-gray-500 w-16">{((t.timestamp_offset_ms as number) / 1000)?.toFixed(1)}s</span>
                  <div className="flex-1 bg-gray-900 rounded-full h-2 relative">
                    <div className={`h-2 rounded-full ${
                      t.status === "healthy" ? "bg-green-500" :
                      t.status === "warning" ? "bg-amber-500" : "bg-red-500"
                    }`} style={{ width: `${Math.min(((t.value as number) ?? 0) * 100, 100)}%` }} />
                  </div>
                  <Badge label={t.status as string} color={
                    t.status === "healthy" ? "green" :
                    t.status === "warning" ? "amber" : "red"
                  } />
                </div>
              ))}
            </div>
          </Card>
          <Card title="Diagnostics">
            <div className="grid grid-cols-3 gap-3 text-xs">
              {(Object.entries((result.diagnostics as Record<string, unknown>) ?? {})).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-400">{k.replace(/_/g, " ")}:</span>
                  <span className="text-gray-200 font-mono">{typeof v === "number" ? v.toFixed(3) : String(v)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function CheckpointTab() {
  const [policy, setPolicy] = useState(CHECKPOINT_POLICIES[5]);
  const [interval, setInterval] = useState("30");
  const [stateSize, setStateSize] = useState("50");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-stream/checkpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy, checkpoint_interval_sec: parseFloat(interval), state_size_mb: parseFloat(stateSize) }),
      });
      setResult(await res.json());
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card title="Checkpoint Configuration">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <SelectField label="Checkpoint Policy" value={policy} options={CHECKPOINT_POLICIES} onChange={setPolicy} />
          <div>
            <label className="block text-xs text-gray-400 mb-1">Interval (sec)</label>
            <input type="number" className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" value={interval} onChange={(e) => setInterval(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">State Size (MB)</label>
            <input type="number" className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" value={stateSize} onChange={(e) => setStateSize(e.target.value)} />
          </div>
        </div>
        <button onClick={run} disabled={loading} className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded disabled:opacity-50">
          {loading ? "Processing..." : "Run Checkpoint"}
        </button>
      </Card>
      {result && !("error" in result) && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Total" value={result.total_checkpoints as number} color="text-blue-300" />
            <StatBox label="Success" value={result.successful_checkpoints as number} color="text-green-300" />
            <StatBox label="Failed" value={result.failed_checkpoints as number} color="text-red-300" />
            <StatBox label="Quality" value={(result.checkpoint_quality as number)?.toFixed(4)} color="text-amber-300" />
          </div>
          <Card title="Checkpoints">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {(result.checkpoints as Record<string, unknown>[]).map((cp, i) => (
                <div key={i} className="flex items-center gap-3 text-xs bg-gray-900/40 rounded p-2">
                  <span className="text-blue-300 font-mono w-16">{cp.checkpoint_id as string}</span>
                  <span className="text-gray-400 w-20">{(cp.state_size_mb as number)?.toFixed(1)} MB</span>
                  <span className="text-gray-400 w-20">{(cp.duration_ms as number)?.toFixed(1)} ms</span>
                  <Badge label={cp.status as string} color={cp.status === "completed" ? "green" : "red"} />
                  <span className="text-gray-500 flex-1 text-right">hash: {cp.causal_model_hash as string}</span>
                </div>
              ))}
            </div>
          </Card>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Storage (MB)" value={(result.total_storage_mb as number)?.toFixed(1)} color="text-purple-300" />
            <StatBox label="RTO (sec)" value={(result.recovery_rto_sec as number)?.toFixed(2)} color="text-cyan-300" />
            <StatBox label="RPO (sec)" value={(result.recovery_rpo_sec as number)?.toFixed(2)} color="text-teal-300" />
          </div>
        </div>
      )}
    </div>
  );
}

function ReplayTab() {
  const [streamMode, setStreamMode] = useState(STREAMING_MODES[5]);
  const [speed, setSpeed] = useState("2.0");
  const [scope, setScope] = useState("full");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/graph/causal-stream/replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streaming_mode: streamMode, replay_speed: parseFloat(speed), replay_scope: scope }),
      });
      setResult(await res.json());
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Card title="Stream Replay Configuration">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <SelectField label="Streaming Mode" value={streamMode} options={STREAMING_MODES} onChange={setStreamMode} />
          <div>
            <label className="block text-xs text-gray-400 mb-1">Replay Speed (×)</label>
            <input type="number" step="0.5" className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5" value={speed} onChange={(e) => setSpeed(e.target.value)} />
          </div>
          <SelectField label="Replay Scope" value={scope} options={REPLAY_SCOPES} onChange={setScope} />
        </div>
        <button onClick={run} disabled={loading} className="px-4 py-2 bg-amber-700 hover:bg-amber-600 text-white text-sm rounded disabled:opacity-50">
          {loading ? "Processing..." : "Run Replay"}
        </button>
      </Card>
      {result && !("error" in result) && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="Total Events" value={(result.total_replay_events as number)?.toLocaleString()} color="text-amber-300" />
            <StatBox label="Replayed" value={(result.replayed_events as number)?.toLocaleString()} color="text-green-300" />
            <StatBox label="Divergences" value={result.divergences as number} color="text-red-300" />
            <StatBox label="Fidelity" value={(result.replay_fidelity as number)?.toFixed(4)} color="text-cyan-300" />
          </div>
          <Card title="Replay Segments">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2 px-2">Segment</th>
                    <th className="text-right py-2 px-2">Events</th>
                    <th className="text-right py-2 px-2">Divergences</th>
                    <th className="text-right py-2 px-2">Consistency</th>
                    <th className="text-right py-2 px-2">State Match</th>
                    <th className="text-right py-2 px-2">Edge Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.segments as Record<string, unknown>[]).map((s, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="py-1.5 px-2 text-amber-300 font-mono">{s.segment_id as string}</td>
                      <td className="text-right py-1.5 px-2">{s.event_count as number}</td>
                      <td className="text-right py-1.5 px-2 text-red-300">{s.divergences as number}</td>
                      <td className="text-right py-1.5 px-2 text-green-300">{(s.causal_consistency as number)?.toFixed(3)}</td>
                      <td className="text-right py-1.5 px-2 text-cyan-300">{(s.state_match as number)?.toFixed(3)}</td>
                      <td className="text-right py-1.5 px-2 text-teal-300">{(s.edge_reconstruction_accuracy as number)?.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Determinism" value={(result.determinism_score as number)?.toFixed(4)} color="text-green-300" />
            <StatBox label="Wall Time (s)" value={(result.replay_wall_time_sec as number)?.toFixed(2)} color="text-amber-300" />
            <StatBox label="Memory Peak (MB)" value={(result.memory_peak_mb as number)?.toFixed(1)} color="text-purple-300" />
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/graph/causal-stream/overview");
      setData(await res.json());
    } catch (e) { setData({ error: String(e) }); }
  };

  return (
    <div className="space-y-4">
      <button onClick={load} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded">
        Load Overview
      </button>
      {data && !("error" in data) && (
        <div className="space-y-4">
          <Card title="Module Info">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-gray-400">Version:</span> <span className="text-cyan-300">{data.version as string}</span></div>
              <div><span className="text-gray-400">Module:</span> <span className="text-cyan-300">{data.module as string}</span></div>
            </div>
          </Card>
          <Card title="Enums (6 × 6 = 36 values)">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries((data.enums as Record<string, string[]>) ?? {}).map(([name, values]) => (
                <div key={name} className="bg-gray-900/60 rounded p-3">
                  <div className="text-xs text-purple-300 font-mono mb-2">{name}</div>
                  <div className="flex flex-wrap gap-1">
                    {values.map((v) => (
                      <Badge key={v} label={v} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Endpoints (7)">
            <div className="space-y-1">
              {(data.endpoints as string[]).map((ep, i) => (
                <div key={i} className="text-xs font-mono text-gray-300 bg-gray-900/40 rounded px-2 py-1">{ep}</div>
              ))}
            </div>
          </Card>
          <Card title="Architecture Chain">
            <div className="space-y-1">
              {(data.architecture_chain as string[]).map((layer, i) => (
                <div key={i} className={`text-xs px-2 py-1 rounded ${layer.includes("NEW") ? "bg-cyan-900/30 text-cyan-300 font-semibold" : "text-gray-400"}`}>
                  {layer}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

const TAB_COMPONENTS: Record<Tab, React.FC> = {
  Ingest: IngestTab,
  Window: WindowTab,
  Update: UpdateTab,
  Monitor: MonitorTab,
  Checkpoint: CheckpointTab,
  Replay: ReplayTab,
  Overview: OverviewTab,
};

export default function CausalStreamingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Ingest");
  const TabComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Causal Real-time Streaming Engine
          </h1>
          <Badge label="v1.264" color="cyan" />
        </div>
        <p className="text-sm text-gray-400">
          Real-time causal analysis with online model updates, adaptive windowing, stream health monitoring,
          checkpoint-based fault tolerance, and causal replay for debugging and validation.
        </p>

        <div className="flex gap-1 border-b border-gray-800">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-t transition-colors ${
                activeTab === tab
                  ? "bg-gray-800 text-cyan-300 border-b-2 border-cyan-500"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <TabComponent />
      </div>
    </div>
  );
}
