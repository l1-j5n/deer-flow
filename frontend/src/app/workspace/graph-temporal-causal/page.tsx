'use client';

import { useState } from 'react';
import {
  TemporalGranularity,
  CausalTransition,
  TemporalPattern,
  InterventionTiming,
  DriftDetector,
  ForecastHorizon,
} from '@/core/temporal-causal/api';
import {
  useTemporalEvolution,
  useCausalDriftDetection,
  useTemporalForecast,
  useTimedIntervention,
  useTemporalPatternAnalysis,
  useCausalLifecycle,
  useTemporalCausalOverview,
} from '@/core/temporal-causal/hooks';

// Tab definitions
const TABS = [
  { id: 'evolution', label: 'Evolution' },
  { id: 'drift', label: 'Drift' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'intervene', label: 'Intervene' },
  { id: 'pattern', label: 'Pattern' },
  { id: 'lifecycle', label: 'Lifecycle' },
  { id: 'overview', label: 'Overview' },
];

const GRANULARITIES = Object.values(TemporalGranularity);
const TRANSITIONS = Object.values(CausalTransition);
const PATTERNS = Object.values(TemporalPattern);
const TIMINGS = Object.values(InterventionTiming);
const DRIFT_DETECTORS = Object.values(DriftDetector);
const FORECAST_HORIZONS = Object.values(ForecastHorizon);

export default function TemporalCausalPage() {
  const [activeTab, setActiveTab] = useState('evolution');
  const [graphId, setGraphId] = useState('demo-graph');

  // Evolution form states
  const [granularity, setGranularity] = useState<TemporalGranularity>(TemporalGranularity.TICK);
  const [nSteps, setNSteps] = useState(50);
  const [selectedTransitions, setSelectedTransitions] = useState<CausalTransition[]>([CausalTransition.STRENGTH_CHANGE]);

  // Drift form states
  const [detector, setDetector] = useState<DriftDetector>(DriftDetector.ADWIN);
  const [windowSize, setWindowSize] = useState(20);
  const [sensitivity, setSensitivity] = useState(0.05);
  const [driftEdges, setDriftEdges] = useState<string>('');

  // Forecast form states
  const [horizon, setHorizon] = useState<ForecastHorizon>(ForecastHorizon.SHORT_TERM);
  const [stepsAhead, setStepsAhead] = useState(10);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);

  // Intervention form states
  const [timing, setTiming] = useState<InterventionTiming>(InterventionTiming.IMMEDIATE);
  const [targetNode, setTargetNode] = useState('');
  const [delaySteps, setDelaySteps] = useState(0);
  const [nInterventions, setNInterventions] = useState(3);

  // Pattern form states
  const [pattern, setPattern] = useState<TemporalPattern>(TemporalPattern.PERIODIC);
  const [analysisWindow, setAnalysisWindow] = useState(100);
  const [minOccurrences, setMinOccurrences] = useState(3);

  // Lifecycle form states
  const [edgeId, setEdgeId] = useState('');
  const [lifecycleGranularity, setLifecycleGranularity] = useState<TemporalGranularity>(TemporalGranularity.TICK);

  // API hooks
  const evolutionMutation = useTemporalEvolution();
  const driftMutation = useCausalDriftDetection();
  const forecastMutation = useTemporalForecast();
  const interventionMutation = useTimedIntervention();
  const patternMutation = useTemporalPatternAnalysis();
  const lifecycleMutation = useCausalLifecycle();
  const overviewQuery = useTemporalCausalOverview();

  // Handlers
  const handleEvolution = async () => {
    await evolutionMutation.mutateAsync({
      graph_id: graphId,
      granularity,
      n_steps: nSteps,
      transition_types: selectedTransitions,
    });
  };

  const handleDrift = async () => {
    await driftMutation.mutateAsync({
      graph_id: graphId,
      detector,
      window_size: windowSize,
      sensitivity,
      edges: driftEdges ? driftEdges.split(',').map((e) => e.trim()) : [],
    });
  };

  const handleForecast = async () => {
    await forecastMutation.mutateAsync({
      graph_id: graphId,
      horizon,
      n_steps_ahead: stepsAhead,
      confidence_level: confidenceLevel,
    });
  };

  const handleIntervention = async () => {
    await interventionMutation.mutateAsync({
      graph_id: graphId,
      timing,
      target_node: targetNode,
      delay_steps: delaySteps,
      n_interventions: nInterventions,
    });
  };

  const handlePattern = async () => {
    await patternMutation.mutateAsync({
      graph_id: graphId,
      pattern,
      analysis_window: analysisWindow,
      min_occurrences: minOccurrences,
    });
  };

  const handleLifecycle = async () => {
    await lifecycleMutation.mutateAsync({
      graph_id: graphId,
      edge_id: edgeId,
      granularity: lifecycleGranularity,
    });
  };

  const toggleTransition = (t: CausalTransition) => {
    setSelectedTransitions((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  // Shared styles
  const selectCls = 'w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500';
  const inputCls = 'w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500';
  const btnCls = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50';
  const labelCls = 'block text-xs font-medium text-gray-400 mb-1';
  const cardCls = 'bg-gray-900 border border-gray-700 rounded-lg p-4';

  const renderEvolution = () => {
    const data = evolutionMutation.data?.result;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Graph ID</label>
            <input className={inputCls} value={graphId} onChange={(e) => setGraphId(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Granularity</label>
            <select className={selectCls} value={granularity} onChange={(e) => setGranularity(e.target.value as TemporalGranularity)}>
              {GRANULARITIES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Steps</label>
            <input className={inputCls} type="number" value={nSteps} onChange={(e) => setNSteps(Number(e.target.value))} min={1} max={1000} />
          </div>
          <div>
            <label className={labelCls}>Transitions</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {TRANSITIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTransition(t)}
                  className={`px-2 py-1 text-xs rounded border ${
                    selectedTransitions.includes(t) ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-600 text-gray-400'
                  }`}
                >
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button className={btnCls} onClick={handleEvolution} disabled={evolutionMutation.isPending}>
          {evolutionMutation.isPending ? 'Simulating...' : 'Simulate Evolution'}
        </button>

        {data && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Regime</div>
                <div className="text-lg font-semibold text-white capitalize">{data.evolution_regime?.replace(/_/g, ' ')}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Transitions</div>
                <div className="text-lg font-semibold text-blue-400">{data.n_transitions}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Temporal Complexity</div>
                <div className="text-lg font-semibold text-green-400">{(data.temporal_complexity * 100).toFixed(1)}%</div>
              </div>
            </div>

            {data.stability_profile && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Stability Profile</div>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(data.stability_profile).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div className="text-xs text-gray-500">{key.replace(/_/g, ' ')}</div>
                      <div className="text-sm font-medium text-blue-300">{((val as number) * 100).toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.transitions && data.transitions.length > 0 && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Transitions ({data.transitions.length})</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-700">
                        <th className="text-left py-1 px-2">Step</th>
                        <th className="text-left py-1 px-2">Type</th>
                        <th className="text-left py-1 px-2">Edge</th>
                        <th className="text-left py-1 px-2">Old</th>
                        <th className="text-left py-1 px-2">New</th>
                        <th className="text-left py-1 px-2">Conf</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transitions.slice(0, 20).map((t, i) => (
                        <tr key={i} className="border-b border-gray-800">
                          <td className="py-1 px-2 text-gray-300">{t.step}</td>
                          <td className="py-1 px-2 text-blue-400">{t.type.replace(/_/g, ' ')}</td>
                          <td className="py-1 px-2 text-gray-300">{t.source}→{t.target}</td>
                          <td className="py-1 px-2 text-yellow-400">{t.old_strength}</td>
                          <td className="py-1 px-2 text-green-400">{t.new_strength}</td>
                          <td className="py-1 px-2 text-gray-400">{t.confidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {data.snapshots && data.snapshots.length > 0 && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Graph Snapshots</div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {data.snapshots.map((s, i) => (
                    <div key={i} className="bg-gray-800 rounded p-2 text-xs">
                      <div className="text-gray-400">Step {s.time_step}</div>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        <div>Edges: <span className="text-blue-300">{s.total_edges}</span></div>
                        <div>Active: <span className="text-green-300">{s.active_edges}</span></div>
                        <div>Density: <span className="text-yellow-300">{s.graph_density}</span></div>
                        <div>Loops: <span className="text-red-300">{s.feedback_loops}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDrift = () => {
    const data = driftMutation.data?.result as Record<string, any> | undefined;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Detector</label>
            <select className={selectCls} value={detector} onChange={(e) => setDetector(e.target.value as DriftDetector)}>
              {DRIFT_DETECTORS.map((d) => <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Window Size</label>
            <input className={inputCls} type="number" value={windowSize} onChange={(e) => setWindowSize(Number(e.target.value))} min={5} max={100} />
          </div>
          <div>
            <label className={labelCls}>Sensitivity (α)</label>
            <input className={inputCls} type="number" step={0.01} value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))} min={0.001} max={0.2} />
          </div>
          <div>
            <label className={labelCls}>Edges (comma-separated)</label>
            <input className={inputCls} value={driftEdges} onChange={(e) => setDriftEdges(e.target.value)} placeholder="Leave empty for all edges" />
          </div>
        </div>
        <button className={btnCls} onClick={handleDrift} disabled={driftMutation.isPending}>
          {driftMutation.isPending ? 'Detecting...' : 'Detect Drift'}
        </button>

        {data && data.summary && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Status</div>
                <div className={`text-lg font-semibold ${
                  data.summary.overall_status === 'stable' ? 'text-green-400' :
                  data.summary.overall_status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                }`}>{data.summary.overall_status?.toUpperCase()}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Drifting</div>
                <div className="text-lg font-semibold text-red-400">{data.summary.drifting_edges}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Stable</div>
                <div className="text-lg font-semibold text-green-400">{data.summary.stable_edges}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Drift Rate</div>
                <div className="text-lg font-semibold text-yellow-400">{((data.summary.drift_rate || 0) * 100).toFixed(1)}%</div>
              </div>
            </div>

            {data.edge_drifts && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Edge Drift Analysis ({data.edge_drifts.length} edges)</div>
                <div className="space-y-2">
                  {data.edge_drifts.map((ed: any, i: number) => (
                    <div key={i} className={`p-2 rounded border ${ed.drift_detected ? 'border-red-800 bg-red-950/30' : 'border-green-800 bg-green-950/30'}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-200">{ed.edge}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${ed.drift_detected ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'}`}>
                          {ed.drift_detected ? 'DRIFT' : 'STABLE'}
                        </span>
                      </div>
                      {ed.drift_detected && (
                        <div className="text-xs text-gray-400 mt-1">
                          Magnitude: {ed.magnitude} | Direction: {ed.direction} | Change point: step {ed.change_point}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderForecast = () => {
    const data = forecastMutation.data?.result as Record<string, any> | undefined;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Horizon</label>
            <select className={selectCls} value={horizon} onChange={(e) => setHorizon(e.target.value as ForecastHorizon)}>
              {FORECAST_HORIZONS.map((h) => <option key={h} value={h}>{h.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Steps Ahead</label>
            <input className={inputCls} type="number" value={stepsAhead} onChange={(e) => setStepsAhead(Number(e.target.value))} min={1} max={500} />
          </div>
          <div>
            <label className={labelCls}>Confidence Level</label>
            <input className={inputCls} type="number" step={0.01} value={confidenceLevel} onChange={(e) => setConfidenceLevel(Number(e.target.value))} min={0.5} max={0.999} />
          </div>
        </div>
        <button className={btnCls} onClick={handleForecast} disabled={forecastMutation.isPending}>
          {forecastMutation.isPending ? 'Forecasting...' : 'Generate Forecast'}
        </button>

        {data && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Model</div>
                <div className="text-lg font-semibold text-blue-400">{data.model_type}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Forecast Stability</div>
                <div className="text-lg font-semibold text-green-400">{((data.forecast_stability || 0) * 100).toFixed(1)}%</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Structural Changes</div>
                <div className="text-lg font-semibold text-yellow-400">{data.n_predicted_changes || 0}</div>
              </div>
            </div>

            {data.quality_metrics && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Quality Metrics</div>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(data.quality_metrics).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div className="text-xs text-gray-500">{key.replace(/_/g, ' ')}</div>
                      <div className="text-sm font-medium text-blue-300">{(val as number).toFixed(3)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.predicted_structural_changes && data.predicted_structural_changes.length > 0 && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Predicted Structural Changes</div>
                <div className="space-y-1">
                  {data.predicted_structural_changes.map((c: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-800 rounded p-2 text-xs">
                      <span className="text-gray-400">Step {c.predicted_step}</span>
                      <span className="text-blue-400">{c.change_type?.replace(/_/g, ' ')}</span>
                      <span className="text-gray-300">{c.affected_edge}</span>
                      <span className="text-yellow-400">P={c.probability}</span>
                      <span className="text-red-400">Impact={c.estimated_impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.edge_forecasts && data.edge_forecasts.length > 0 && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Edge Forecasts ({data.edge_forecasts.length} edges)</div>
                <div className="space-y-2">
                  {data.edge_forecasts.slice(0, 8).map((ef: any, i: number) => (
                    <div key={i} className="bg-gray-800 rounded p-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-200">{ef.edge}</span>
                        <span className={`px-2 py-0.5 rounded ${
                          ef.trend_direction === 'increasing' ? 'bg-green-900 text-green-300' :
                          ef.trend_direction === 'decreasing' ? 'bg-red-900 text-red-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>{ef.trend_direction}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {ef.current_strength} → {ef.terminal_strength} | Volatility: {ef.volatility}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderIntervene = () => {
    const data = interventionMutation.data?.result as Record<string, any> | undefined;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Timing Strategy</label>
            <select className={selectCls} value={timing} onChange={(e) => setTiming(e.target.value as InterventionTiming)}>
              {TIMINGS.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Target Node</label>
            <input className={inputCls} value={targetNode} onChange={(e) => setTargetNode(e.target.value)} placeholder="Auto-assigned if empty" />
          </div>
          <div>
            <label className={labelCls}>Interventions</label>
            <input className={inputCls} type="number" value={nInterventions} onChange={(e) => setNInterventions(Number(e.target.value))} min={1} max={10} />
          </div>
          <div>
            <label className={labelCls}>Delay Steps</label>
            <input className={inputCls} type="number" value={delaySteps} onChange={(e) => setDelaySteps(Number(e.target.value))} min={0} />
          </div>
        </div>
        <button className={btnCls} onClick={handleIntervention} disabled={interventionMutation.isPending}>
          {interventionMutation.isPending ? 'Planning...' : 'Plan Interventions'}
        </button>

        {data && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Strategy</div>
                <div className="text-lg font-semibold text-blue-400 capitalize">{data.timing_strategy?.replace(/_/g, ' ')}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Interventions</div>
                <div className="text-lg font-semibold text-green-400">{data.n_interventions}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Efficiency</div>
                <div className="text-lg font-semibold text-yellow-400">{((data.temporal_efficiency || 0) * 100).toFixed(1)}%</div>
              </div>
            </div>

            {data.optimal_timing && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Optimal Timing</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Recommended Step: <span className="text-blue-300">{data.optimal_timing.recommended_step}</span></div>
                  <div>Best Intervention: <span className="text-green-300">{data.optimal_timing.best_intervention_id}</span></div>
                  <div>Expected Effect: <span className="text-yellow-300">{data.optimal_timing.expected_effect}</span></div>
                  <div className="text-gray-400">{data.optimal_timing.timing_rationale}</div>
                </div>
              </div>
            )}

            {data.interventions && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Intervention Plans</div>
                <div className="space-y-2">
                  {data.interventions.map((intv: any, i: number) => (
                    <div key={i} className="bg-gray-800 rounded p-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-blue-400">{intv.id}</span>
                        <span className="text-gray-400">Apply at step {intv.apply_step}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs mt-1">
                        <div>Peak: <span className="text-green-300">{intv.peak_effect}</span></div>
                        <div>Duration: <span className="text-yellow-300">{intv.effect_duration}</span></div>
                        <div>Total: <span className="text-blue-300">{intv.total_impact}</span></div>
                        <div>Robust: <span className="text-purple-300">{intv.robustness_score}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.interactions && data.interactions.length > 0 && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Intervention Interactions</div>
                <div className="space-y-1">
                  {data.interactions.map((ix: any, i: number) => (
                    <div key={i} className={`flex items-center gap-3 text-xs p-1 rounded ${
                      ix.interaction_type === 'synergistic' ? 'bg-green-950/30' :
                      ix.interaction_type === 'antagonistic' ? 'bg-red-950/30' : 'bg-gray-800'
                    }`}>
                      <span className="text-gray-300">{ix.pair}</span>
                      <span className={ix.interaction_type === 'synergistic' ? 'text-green-400' : ix.interaction_type === 'antagonistic' ? 'text-red-400' : 'text-gray-400'}>
                        {ix.interaction_type}
                      </span>
                      <span className="text-gray-500">Overlap: {ix.temporal_overlap}</span>
                      <span className="text-blue-300">Modifier: {ix.combined_effect_modifier}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPattern = () => {
    const data = patternMutation.data?.result as Record<string, any> | undefined;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Pattern Type</label>
            <select className={selectCls} value={pattern} onChange={(e) => setPattern(e.target.value as TemporalPattern)}>
              {PATTERNS.map((p) => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Analysis Window</label>
            <input className={inputCls} type="number" value={analysisWindow} onChange={(e) => setAnalysisWindow(Number(e.target.value))} min={10} max={1000} />
          </div>
          <div>
            <label className={labelCls}>Min Occurrences</label>
            <input className={inputCls} type="number" value={minOccurrences} onChange={(e) => setMinOccurrences(Number(e.target.value))} min={1} max={20} />
          </div>
        </div>
        <button className={btnCls} onClick={handlePattern} disabled={patternMutation.isPending}>
          {patternMutation.isPending ? 'Analyzing...' : 'Analyze Patterns'}
        </button>

        {data && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Pattern</div>
                <div className="text-lg font-semibold text-blue-400 capitalize">{data.pattern_type?.replace(/_/g, ' ')}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Instances</div>
                <div className="text-lg font-semibold text-green-400">{data.n_instances}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Effect Size</div>
                <div className="text-lg font-semibold text-yellow-400">{((data.effect_size || 0) * 100).toFixed(1)}%</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Predictability</div>
                <div className="text-lg font-semibold text-purple-400">{((data.predictability_score || 0) * 100).toFixed(1)}%</div>
              </div>
            </div>

            {data.pattern_specific && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Pattern-Specific Metrics</div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                  {Object.entries(data.pattern_specific).map(([key, val]) => (
                    <div key={key} className="bg-gray-800 rounded p-2">
                      <div className="text-gray-500">{key.replace(/_/g, ' ')}</div>
                      <div className="text-blue-300 font-medium">{typeof val === 'number' ? (val < 1 ? val.toFixed(4) : val) : JSON.stringify(val)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.instances && data.instances.length > 0 && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Detected Instances</div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {data.instances.slice(0, 12).map((inst: any, i: number) => (
                    <div key={i} className="bg-gray-800 rounded p-2 text-xs">
                      <div className="text-gray-300">Instance #{inst.instance_id}</div>
                      <div className="text-gray-500 mt-1">Steps {inst.start_step}→{inst.end_step} ({inst.duration} long)</div>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        <div>Amplitude: <span className="text-blue-300">{inst.amplitude}</span></div>
                        <div>Correlation: <span className="text-green-300">{inst.strength_correlation}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLifecycle = () => {
    const data = lifecycleMutation.data?.result as Record<string, any> | undefined;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Edge ID</label>
            <input className={inputCls} value={edgeId} onChange={(e) => setEdgeId(e.target.value)} placeholder="Auto-assigned if empty" />
          </div>
          <div>
            <label className={labelCls}>Granularity</label>
            <select className={selectCls} value={lifecycleGranularity} onChange={(e) => setLifecycleGranularity(e.target.value as TemporalGranularity)}>
              {GRANULARITIES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <button className={btnCls} onClick={handleLifecycle} disabled={lifecycleMutation.isPending}>
          {lifecycleMutation.isPending ? 'Tracking...' : 'Track Lifecycle'}
        </button>

        {data && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Edge</div>
                <div className="text-sm font-semibold text-blue-400">{data.edge}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Lifespan</div>
                <div className="text-lg font-semibold text-green-400">{data.total_lifespan} steps</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Class</div>
                <div className="text-lg font-semibold text-purple-400 capitalize">{data.lifecycle_class?.replace(/_/g, ' ')}</div>
              </div>
              <div className={cardCls}>
                <div className="text-xs text-gray-400">Peak Strength</div>
                <div className="text-lg font-semibold text-yellow-400">{(data.summary?.peak_strength * 100).toFixed(1)}%</div>
              </div>
            </div>

            {data.temporal_signature && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Temporal Signature</div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>Rise Time: <span className="text-green-300">{data.temporal_signature.rise_time}</span></div>
                  <div>Stable Time: <span className="text-blue-300">{data.temporal_signature.stable_time}</span></div>
                  <div>Decay Time: <span className="text-red-300">{data.temporal_signature.decay_time}</span></div>
                  <div>Asymmetry: <span className="text-yellow-300">{data.temporal_signature.asymmetry_ratio}</span></div>
                </div>
              </div>
            )}

            {data.lifecycle_phases && (
              <div className={cardCls}>
                <div className="text-sm font-medium text-gray-300 mb-2">Lifecycle Phases ({data.lifecycle_phases.length})</div>
                <div className="space-y-2">
                  {data.lifecycle_phases.map((phase: any, i: number) => {
                    const phaseColors: Record<string, string> = {
                      dormant: 'border-gray-600 bg-gray-800/50',
                      emerging: 'border-green-700 bg-green-950/30',
                      strengthening: 'border-blue-700 bg-blue-950/30',
                      stable: 'border-purple-700 bg-purple-950/30',
                      weakening: 'border-yellow-700 bg-yellow-950/30',
                      dissolving: 'border-red-700 bg-red-950/30',
                    };
                    return (
                      <div key={i} className={`p-2 rounded border ${phaseColors[phase.phase] || 'border-gray-700'}`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-medium capitalize">{phase.phase}</span>
                          <span className="text-gray-400">Steps {phase.start_step}→{phase.end_step} ({phase.duration})</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{phase.description}</div>
                        <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
                          <div>Strength: <span className="text-blue-300">[{phase.strength_range?.[0]}, {phase.strength_range?.[1]}]</span></div>
                          <div>Trigger: <span className="text-yellow-300">{phase.transition_trigger?.replace(/_/g, ' ')}</span></div>
                        </div>
                        {phase.trajectory_points && phase.trajectory_points.length > 0 && (
                          <div className="mt-2 flex items-end gap-0.5 h-8">
                            {phase.trajectory_points.map((tp: any, j: number) => (
                              <div
                                key={j}
                                className="bg-blue-500/60 rounded-t flex-1 min-w-[4px]"
                                style={{ height: `${Math.max(4, tp.strength * 100)}%` }}
                                title={`Step ${tp.relative_step}: ${tp.strength}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderOverview = () => {
    const data = overviewQuery.data;
    if (overviewQuery.isLoading) return <div className="text-gray-400 text-sm">Loading overview...</div>;
    if (!data) return <div className="text-gray-400 text-sm">No overview data available.</div>;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className={cardCls}>
            <div className="text-xs text-gray-400">Engine</div>
            <div className="text-lg font-semibold text-white">{data.engine}</div>
          </div>
          <div className={cardCls}>
            <div className="text-xs text-gray-400">Version</div>
            <div className="text-lg font-semibold text-blue-400">{data.version}</div>
          </div>
          <div className={cardCls}>
            <div className="text-xs text-gray-400">Enum Values</div>
            <div className="text-lg font-semibold text-green-400">{data.total_enum_values}</div>
          </div>
        </div>

        <div className={cardCls}>
          <div className="text-sm font-medium text-gray-300 mb-2">Endpoints ({data.endpoints.length})</div>
          <div className="space-y-1">
            {data.endpoints.map((ep: string, i: number) => (
              <div key={i} className="text-xs text-blue-300 font-mono">{ep}</div>
            ))}
          </div>
        </div>

        <div className={cardCls}>
          <div className="text-sm font-medium text-gray-300 mb-2">Features (6×6 = 36 dimensions)</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(data.features).map(([key, val]) => (
              <div key={key} className="bg-gray-800 rounded p-2 text-xs">
                <div className="text-gray-500">{key.replace(/_/g, ' ')}</div>
                <div className="text-lg font-semibold text-blue-300">{val as number}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={cardCls}>
          <div className="text-sm font-medium text-gray-300 mb-2">Integration</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(data.integration).map(([key, val]) => (
              <div key={key} className="text-xs">
                <span className="text-gray-400">{key.replace(/_/g, ' ')}: </span>
                <span className="text-blue-300">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={cardCls}>
          <div className="text-sm font-medium text-gray-300 mb-2">Enums</div>
          <div className="space-y-2">
            {Object.entries(data.enums).map(([enumName, values]) => (
              <div key={enumName}>
                <div className="text-xs text-gray-400 font-medium">{enumName}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(values as string[]).map((v) => (
                    <span key={v} className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700">{v.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'evolution': return renderEvolution();
      case 'drift': return renderDrift();
      case 'forecast': return renderForecast();
      case 'intervene': return renderIntervene();
      case 'pattern': return renderPattern();
      case 'lifecycle': return renderLifecycle();
      case 'overview': return renderOverview();
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div>
          <h1 className="text-lg font-semibold text-white">Graph Causal Temporal Dynamics</h1>
          <p className="text-xs text-gray-500">v1.238.0 — Temporal evolution, drift detection, forecasting & lifecycle tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded">6 Enums</span>
          <span className="px-2 py-1 bg-green-900/50 text-green-300 text-xs rounded">7 Endpoints</span>
          <span className="px-2 py-1 bg-purple-900/50 text-purple-300 text-xs rounded">36 Values</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-blue-400 border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
}