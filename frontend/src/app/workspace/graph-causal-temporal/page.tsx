"use client";

import { useState } from "react";

const API = "/api/graph";

const TEMPORAL_MODELS = ["var_causal", "granger", "dti", "svcm", "time_varying_dag", "rnn_causal"];
const FORECAST_METHODS = ["arima_causal", "var_forecast", "lstm_causal", "transformer_causal", "gnn_temporal", "ensemble_causal"];
const CP_METHODS = ["cusum", "bayesian_online", "kernel_cp", "energy_distance", "graph_cp", "causal_cp"];
const INTERVENTION_TYPES = ["instantaneous", "delayed", "sustained", "periodic", "adaptive", "rolling"];
const EFFECT_TYPES = ["constant", "linear_trend", "piecewise", "cyclic", "decaying", "regime_switching"];
const CYCLE_TYPES = ["positive_feedback", "negative_feedback", "oscillating", "damped", "chaotic", "resonant"];

const TABS = ["Discover", "Forecast", "Changepoint", "Intervene", "Effect", "Cycles", "Summary"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>{children}</div>;
}
function StatBar({ label, value, max = 1, color = "bg-emerald-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(4)}</span></div><div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div></div>;
}
function JsonBlock({ data }: { data: unknown }) {
  return <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto max-h-80 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label><select className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>;
}
function Badge({ text, color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

export default function GraphCausalTemporalPage() {
  const [tab, setTab] = useState<Tab>("Discover");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const [dModel, setDModel] = useState("var_causal");
  const [dSteps, setDSteps] = useState(100);
  const [dVars, setDVars] = useState(10);
  const [dLag, setDLag] = useState(5);
  const [dWindow, setDWindow] = useState(10);

  const [fMethod, setFMethod] = useState("lstm_causal");
  const [fHorizon, setFHorizon] = useState(10);
  const [fConf, setFConf] = useState(0.95);
  const [fHistory, setFHistory] = useState(100);

  const [cpMethod, setCpMethod] = useState("causal_cp");
  const [cpSteps, setCpSteps] = useState(200);
  const [cpSens, setCpSens] = useState(0.8);
  const [cpVars, setCpVars] = useState(8);

  const [ivType, setIvType] = useState("sustained");
  const [ivSteps, setIvSteps] = useState(30);
  const [ivStartStep, setIvStartStep] = useState(10);
  const [ivMagnitude, setIvMagnitude] = useState(0.5);
  const [ivDepth, setIvDepth] = useState(3);

  const [efType, setEfType] = useState("linear_trend");
  const [efPoints, setEfPoints] = useState(20);
  const [efTreatment, setEfTreatment] = useState("X_0");
  const [efOutcome, setEfOutcome] = useState("X_1");

  const [cyType, setCyType] = useState("oscillating");
  const [cyNodes, setCyNodes] = useState(10);
  const [cyEdges, setCyEdges] = useState(25);
  const [cyDamping, setCyDamping] = useState(0.8);

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true); setResult(null);
    try { const r = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setResult(await r.json()); }
    catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const renderDiscover = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Temporal Causal Discovery">
        <SelectField label="Model" value={dModel} onChange={setDModel} options={TEMPORAL_MODELS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time Steps</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dSteps} onChange={(e) => setDSteps(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Variables</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dVars} onChange={(e) => setDVars(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Lag</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dLag} onChange={(e) => setDLag(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Window Size</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dWindow} onChange={(e) => setDWindow(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-temporal/discover", { graph_id: "td_01", model: dModel, num_time_steps: dSteps, num_variables: dVars, max_lag: dLag, window_size: dWindow })}>{loading ? "Discovering..." : "Discover Temporal Causal"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "discovery" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const disc = d.discovery as Record<string, unknown>;
          const windows = (d.time_windows || []) as Array<Record<string, unknown>>;
          return (<>
            <Card title="Discovery Summary">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(disc?.total_causal_edges)}</div><div className="text-xs text-gray-500">Total Edges</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(disc?.stable_edges)}</div><div className="text-xs text-gray-500">Stable</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(disc?.transient_edges)}</div><div className="text-xs text-gray-500">Transient</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(disc?.avg_density)}</div><div className="text-xs text-gray-500">Avg Density</div></div>
              </div>
              <StatBar label="Temporal Consistency" value={Number(disc?.temporal_consistency || 0)} color="bg-blue-500" />
            </Card>
            <Card title="Time Windows">
              <div className="space-y-1 max-h-48 overflow-auto">
                {windows.map((w, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                    <span className="font-mono">W{String(w.window_id)}</span>
                    <span>Steps: {String(w.start_step)}-{String(w.end_step)}</span>
                    <span>Edges: {String(w.causal_edges)}</span>
                    <Badge text={String(w.dominant_direction)} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                  </div>
                ))}
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderForecast = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Causal Forecast">
        <SelectField label="Method" value={fMethod} onChange={setFMethod} options={FORECAST_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Horizon</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fHorizon} onChange={(e) => setFHorizon(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confidence</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fConf} onChange={(e) => setFConf(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">History Length</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fHistory} onChange={(e) => setFHistory(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-temporal/forecast", { graph_id: "fc_01", method: fMethod, horizon: fHorizon, confidence: fConf, history_length: fHistory })}>{loading ? "Forecasting..." : "Forecast"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "forecasts" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const acc = d.accuracy as Record<string, unknown>;
          const fc = (d.forecasts || []) as Array<Record<string, unknown>>;
          const decomp = (d.causal_decomposition || []) as Array<Record<string, unknown>>;
          const unc = d.uncertainty as Record<string, unknown>;
          return (<>
            <Card title="Accuracy Metrics">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-indigo-600">{String(acc?.mae)}</div><div className="text-xs text-gray-500">MAE</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(acc?.rmse)}</div><div className="text-xs text-gray-500">RMSE</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(acc?.mape)}%</div><div className="text-xs text-gray-500">MAPE</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(acc?.causal_explanation_ratio)}</div><div className="text-xs text-gray-500">Causal Expl</div></div>
              </div>
            </Card>
            <Card title="Forecast Timeline">
              <div className="space-y-1">
                {fc.map((f, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1">
                    <span className="font-mono">t+{String(f.step)}</span>
                    <span>Point: {String(f.point_forecast)}</span>
                    <span>[{String(f.lower_bound)}, {String(f.upper_bound)}]</span>
                    <span>Causal: {String(f.causal_contribution)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Causal Decomposition & Uncertainty">
              <div className="text-xs space-y-1">
                {decomp.map((dc, i) => (<div key={i}><span className="font-mono">{String(dc.variable)}</span>: {String(dc.contribution_pct)}% (lag {String(dc.lag_effect)})</div>))}
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">Aleatoric: {String(unc?.aleatoric)} | Epistemic: {String(unc?.epistemic)} | Total: {String(unc?.total)}</div>
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderChangepoint = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Changepoint Detection">
        <SelectField label="Method" value={cpMethod} onChange={setCpMethod} options={CP_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time Steps</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cpSteps} onChange={(e) => setCpSteps(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sensitivity</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cpSens} onChange={(e) => setCpSens(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-temporal/changepoint", { graph_id: "cp_01", method: cpMethod, num_time_steps: cpSteps, sensitivity: cpSens, num_variables: cpVars })}>{loading ? "Detecting..." : "Detect Changepoints"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "changepoints" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const cps = (d.changepoints || []) as Array<Record<string, unknown>>;
          const segs = (d.segments || []) as Array<Record<string, unknown>>;
          const sum = d.summary as Record<string, unknown>;
          return (<>
            <Card title="Changepoints">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-red-600">{String(sum?.num_changepoints)}</div><div className="text-xs text-gray-500">Detected</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(sum?.avg_segment_length)}</div><div className="text-xs text-gray-500">Avg Segment</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(sum?.false_positive_rate)}</div><div className="text-xs text-gray-500">FPR</div></div>
              </div>
            </Card>
            <Card title="Detected Changepoints">
              <div className="space-y-1">
                {cps.map((cp, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                    <span className="font-mono">Step {String(cp.step)}</span>
                    <Badge text={String(cp.type)} color="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" />
                    <span>Conf: {String(cp.confidence)}</span>
                    <span>Mag: {String(cp.magnitude)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Segments">
              <div className="space-y-1">
                {segs.map((s, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                    <Badge text={String(s.regime)} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                    <span>Steps: {String(s.start)}-{String(s.end)}</span>
                    <span>Length: {String(s.length)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderIntervene = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Temporal Intervention">
        <SelectField label="Type" value={ivType} onChange={setIvType} options={INTERVENTION_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Steps</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={ivSteps} onChange={(e) => setIvSteps(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Intervention Step</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={ivStartStep} onChange={(e) => setIvStartStep(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Magnitude</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={ivMagnitude} onChange={(e) => setIvMagnitude(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Propagation Depth</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={ivDepth} onChange={(e) => setIvDepth(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-temporal/intervene", { graph_id: "iv_01", intervention_type: ivType, num_steps: ivSteps, intervention_step: ivStartStep, effect_magnitude: ivMagnitude, propagation_depth: ivDepth })}>{loading ? "Simulating..." : "Simulate Intervention"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "impact_summary" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const impact = d.impact_summary as Record<string, unknown>;
          const timeline = (d.timeline || []) as Array<Record<string, unknown>>;
          const paths = (d.affected_paths || []) as Array<Record<string, unknown>>;
          return (<>
            <Card title="Impact Summary">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-rose-600">{String(impact?.total_impact)}</div><div className="text-xs text-gray-500">Total Impact</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(impact?.peak_effect)}</div><div className="text-xs text-gray-500">Peak</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(impact?.time_to_peak)}</div><div className="text-xs text-gray-500">Time to Peak</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(impact?.spillover_ratio)}</div><div className="text-xs text-gray-500">Spillover</div></div>
              </div>
            </Card>
            <Card title="Effect Timeline">
              <div className="flex items-end gap-px h-24">
                {timeline.map((t, i) => {
                  const v = Math.abs(Number(t.total_effect || 0));
                  const isPost = t.phase === "post";
                  return <div key={i} className={`flex-1 rounded-t ${isPost ? "bg-rose-500" : "bg-gray-400 dark:bg-gray-500"}`} style={{ height: `${Math.max(3, v * 40)}px` }} />;
                })}
              </div>
              <div className="flex justify-between text-xs mt-1 text-gray-500">
                <span>Pre-intervention</span>
                <span>↓ Intervention</span>
                <span>Post-intervention</span>
              </div>
            </Card>
            <Card title="Affected Paths">
              <div className="space-y-1">{paths.map((p, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><span>{String(p.from)} → {String(p.to)}</span><span>Delay: {String(p.delay)}</span><span>Strength: {String(p.strength)}</span></div>))}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderEffect = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Time-Varying Effect">
        <SelectField label="Effect Type" value={efType} onChange={setEfType} options={EFFECT_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Time Points</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={efPoints} onChange={(e) => setEfPoints(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Treatment</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={efTreatment} onChange={(e) => setEfTreatment(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Outcome</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={efOutcome} onChange={(e) => setEfOutcome(e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-temporal/effect", { graph_id: "ef_01", effect_type: efType, num_time_points: efPoints, treatment: efTreatment, outcome: efOutcome, confounders: ["X_2", "X_3"] })}>{loading ? "Estimating..." : "Estimate Effect"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "effect_curve" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const curve = (d.effect_curve || []) as Array<Record<string, unknown>>;
          const sum = d.summary as Record<string, unknown>;
          const robust = d.robustness as Record<string, unknown>;
          return (<>
            <Card title="Effect Curve">
              <div className="flex items-end gap-1 h-24">
                {curve.map((pt, i) => {
                  const v = Number(pt.ate || 0);
                  return <div key={i} className="flex-1 rounded-t bg-teal-500" style={{ height: `${Math.max(3, v * 80)}px` }} title={`t={String(pt.time)}: ATE={String(pt.ate)}`} />;
                })}
              </div>
            </Card>
            <Card title="Summary">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-teal-600">{String(sum?.mean_ate)}</div><div className="text-xs text-gray-500">Mean ATE</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(sum?.max_ate)}</div><div className="text-xs text-gray-500">Max</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(sum?.min_ate)}</div><div className="text-xs text-gray-500">Min</div></div>
                <div className="text-center"><Badge text={String(sum?.trend_direction)} color="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" /></div>
              </div>
            </Card>
            <Card title="Robustness">
              <StatBar label="Sensitivity" value={Number(robust?.sensitivity_score || 0)} color="bg-teal-500" />
              <div className="text-xs">E-value: {String(robust?.e_value)}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderCycles = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Causal Cycle Detection">
        <SelectField label="Cycle Type" value={cyType} onChange={setCyType} options={CYCLE_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nodes</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cyNodes} onChange={(e) => setCyNodes(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Edges</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cyEdges} onChange={(e) => setCyEdges(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Damping</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cyDamping} onChange={(e) => setCyDamping(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/causal-temporal/cycle", { graph_id: "cy_01", cycle_type: cyType, num_nodes: cyNodes, num_edges: cyEdges, damping: cyDamping })}>{loading ? "Detecting..." : "Detect Cycles"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "detected_cycles" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const cycles = (d.detected_cycles || []) as Array<Record<string, unknown>>;
          const sim = (d.simulation || []) as Array<Record<string, unknown>>;
          const analysis = d.analysis as Record<string, unknown>;
          const intPts = (d.intervention_points || []) as Array<Record<string, unknown>>;
          return (<>
            <Card title="Cycle Analysis">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-violet-600">{String(analysis?.total_cycles)}</div><div className="text-xs text-gray-500">Cycles</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(analysis?.avg_cycle_strength)}</div><div className="text-xs text-gray-500">Avg Strength</div></div>
                <div className="text-center"><Badge text={String(analysis?.stability_assessment)} color={analysis?.stability_assessment === "stable" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"} /></div>
              </div>
            </Card>
            <Card title="Detected Cycles">
              <div className="space-y-1">{cycles.map((c, i) => (
                <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                  <span className="font-mono">C{String(c.cycle_id)}</span>
                  <span>Len: {String(c.length)}</span>
                  <span>Strength: {String(c.strength)}</span>
                  <span>Gain: {String(c.gain)}</span>
                  <span>Damp: {String(c.damping_ratio)}</span>
                </div>
              ))}</div>
            </Card>
            <Card title="Simulation">
              <div className="flex items-center gap-px h-16">
                {sim.map((s, i) => (<div key={i} className={`flex-1 rounded-t ${Number(s.amplitude) >= 0 ? "bg-violet-500" : "bg-rose-500"}`} style={{ height: `${Math.max(2, Math.abs(Number(s.amplitude)) * 50)}px` }} />))}
              </div>
            </Card>
            <Card title="Intervention Points">
              <div className="space-y-1">{intPts.map((ip, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><span className="font-mono">{String(ip.node)}</span><span>{String(ip.intervention)}</span><span>Impact: {String(ip.expected_impact)}</span></div>))}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div>
      <button className="rounded bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 mb-4" disabled={loading} onClick={async () => { setLoading(true); try { const r = await fetch(`${API}/causal-temporal/summary`); setResult(await r.json()); } catch (e) { setResult({ error: String(e) }); } setLoading(false); }}>{loading ? "Loading..." : "Load Summary"}</button>
      {result && <JsonBlock data={result} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Graph Causal Temporal Reasoning Engine</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.219 — Temporal causal discovery, causal forecasting, changepoint detection, time-varying effects, and causal cycle analysis</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (<button key={t} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === t ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`} onClick={() => { setTab(t); setResult(null); }}>{t}</button>))}
        </div>
        {tab === "Discover" && renderDiscover()}
        {tab === "Forecast" && renderForecast()}
        {tab === "Changepoint" && renderChangepoint()}
        {tab === "Intervene" && renderIntervene()}
        {tab === "Effect" && renderEffect()}
        {tab === "Cycles" && renderCycles()}
        {tab === "Summary" && renderSummary()}
      </div>
    </div>
  );
}
