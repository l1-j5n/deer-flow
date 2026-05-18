"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.252 backend
const FAIRNESS_METRICS = ["demographic_parity", "equalized_odds", "counterfactual_fairness", "individual_fairness", "calibration_fairness", "procedural_fairness"];
const BIAS_TYPES = ["selection_bias", "confounding_bias", "measurement_bias", "aggregation_bias", "representation_bias", "temporal_bias"];
const CORRECTION_STRATEGIES = ["reweighting", "counterfactual_augmentation", "fair_representation", "constraint_optimization", "causal_debiasing", "equitable_redesign"];
const SYNTHESIS_GOALS = ["unbiased_estimation", "equitable_allocation", "fair_prediction", "balanced_representation", "distributive_justice", "corrective_intervention"];
const FAIRNESS_CRITERIA = ["strict_parity", "bounded_disparity", "proportional_equity", "sufficient_threshold", "rank_preservation", "intersectional_fairness"];
const AUDIT_LEVELS = ["surface_audit", "mechanism_audit", "structural_audit", "intersectional_audit", "counterfactual_audit", "comprehensive_audit"];

const TABS = ["Synthesize", "Detect Bias", "Correct", "Evaluate", "Audit", "Validate", "Overview"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>{children}</div>;
}
function StatBar({ label, value, max = 1, color = "bg-blue-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(4)}</span></div><div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div></div></div>;
}
function JsonBlock({ data }: { data: unknown }) {
  return <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto max-h-80 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label><select className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}</select></div>;
}
function Badge({ text, color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mr-1 mb-1 ${color}`}>{text}</span>;
}

export default function GraphCausalFairnessPage() {
  const [tab, setTab] = useState<Tab>("Synthesize");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Synthesize state
  const [programId, setProgramId] = useState("");
  const [causalGraphId, setCausalGraphId] = useState("graph-obs-001");
  const [synthesisGoal, setSynthesisGoal] = useState("unbiased_estimation");
  const [fairnessMetrics, setFairnessMetrics] = useState<string[]>(["demographic_parity", "equalized_odds"]);
  const [sensitiveAttrs, setSensitiveAttrs] = useState<string[]>(["race", "gender", "age"]);
  const [fairnessCriterion, setFairnessCriterion] = useState("bounded_disparity");
  const [constraintWeight, setConstraintWeight] = useState(0.5);

  // Detect state
  const [detectionId, setDetectionId] = useState("");
  const [detectProgramId, setDetectProgramId] = useState("");
  const [biasTypes, setBiasTypes] = useState<string[]>(["selection_bias", "confounding_bias"]);
  const [detectSensitiveAttrs, setDetectSensitiveAttrs] = useState<string[]>(["race", "gender"]);
  const [auditLevel, setAuditLevel] = useState("mechanism_audit");
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [intersectionalAnalysis, setIntersectionalAnalysis] = useState(true);

  // Correct state
  const [correctionId, setCorrectionId] = useState("");
  const [correctProgramId, setCorrectProgramId] = useState("");
  const [detectedBiasIds, setDetectedBiasIds] = useState<string[]>(["bias-001", "bias-002"]);
  const [correctionStrategy, setCorrectionStrategy] = useState("causal_debiasing");
  const [targetMetrics, setTargetMetrics] = useState<string[]>(["demographic_parity"]);
  const [preserveAccuracy, setPreserveAccuracy] = useState(true);
  const [maxIterations, setMaxIterations] = useState(10);

  // Evaluate state
  const [evalId, setEvalId] = useState("");
  const [evalProgramId, setEvalProgramId] = useState("");
  const [evalMetrics, setEvalMetrics] = useState<string[]>(["demographic_parity", "equalized_odds", "counterfactual_fairness"]);
  const [evalCriterion, setEvalCriterion] = useState("bounded_disparity");
  const [groupAnalysis, setGroupAnalysis] = useState(true);
  const [evalThreshold, setEvalThreshold] = useState(0.05);

  // Audit state
  const [auditId, setAuditId] = useState("");
  const [auditProgramIds, setAuditProgramIds] = useState<string[]>(["prog-001", "prog-002", "prog-003"]);
  const [auditLvl, setAuditLvl] = useState("comprehensive_audit");
  const [includeCounterfactual, setIncludeCounterfactual] = useState(true);
  const [includeIntersectional, setIncludeIntersectional] = useState(true);
  const [generateReport, setGenerateReport] = useState(true);

  // Validate state
  const [validId, setValidId] = useState("");
  const [validProgramId, setValidProgramId] = useState("");
  const [checkStatValidity, setCheckStatValidity] = useState(true);
  const [checkCausalIntegrity, setCheckCausalIntegrity] = useState(true);
  const [checkFairnessSoundness, setCheckFairnessSoundness] = useState(true);
  const [checkRobustness, setCheckRobustness] = useState(true);

  const callApi = async (endpoint: string, body?: Record<string, unknown>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  const toggleItem = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((m) => m !== item) : [...list, item]);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Graph Causal Fairness Programming</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">v1.252 — Fairness-aware causal program synthesis and bias detection</p>
        </div>
        <Badge text="v1.252" color="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-indigo-500 text-indigo-700 dark:text-indigo-300" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>{t}</button>
        ))}
      </div>

      {/* Synthesize Tab */}
      {tab === "Synthesize" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Fairness Program Synthesis">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={programId} onChange={(e) => setProgramId(e.target.value)} placeholder="cfp-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Causal Graph ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={causalGraphId} onChange={(e) => setCausalGraphId(e.target.value)} />
              </div>
              <SelectField label="Synthesis Goal" value={synthesisGoal} onChange={setSynthesisGoal} options={SYNTHESIS_GOALS} />
              <SelectField label="Fairness Criterion" value={fairnessCriterion} onChange={setFairnessCriterion} options={FAIRNESS_CRITERIA} />
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Fairness Metrics</label>
                <div className="grid grid-cols-3 gap-1">
                  {FAIRNESS_METRICS.map((m) => (
                    <label key={m} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <input type="checkbox" checked={fairnessMetrics.includes(m)} onChange={() => toggleItem(m, fairnessMetrics, setFairnessMetrics)} className="rounded" />
                      {m.replace(/_/g, " ")}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sensitive Attributes</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={sensitiveAttrs.join(",")} onChange={(e) => setSensitiveAttrs(e.target.value.split(",").map(s => s.trim()))} />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Constraint Weight (Fairness ↔ Utility)</label>
                <input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={constraintWeight} onChange={(e) => setConstraintWeight(Number(e.target.value))} min={0} max={1} />
              </div>
              <button disabled={loading || fairnessMetrics.length === 0} onClick={() => callApi("causal-fairness/synthesize", {
                program_id: programId || undefined, causal_graph_id: causalGraphId, synthesis_goal: synthesisGoal,
                fairness_metrics: fairnessMetrics, sensitive_attributes: sensitiveAttrs, fairness_criterion: fairnessCriterion,
                constraint_weight: constraintWeight,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Synthesizing..." : "Synthesize Fair Program"}
              </button>
            </div>
          </Card>
          <Card title="Synthesis Result">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.program_id && <Badge text={`Program: ${(result as Record<string, unknown>).program_id}`} />}
                {(result as Record<string, unknown>)?.utility_score != null && <StatBar label="Utility Score" value={(result as Record<string, number>).utility_score} color="bg-blue-500" />}
                {(result as Record<string, unknown>)?.fairness_score != null && <StatBar label="Fairness Score" value={(result as Record<string, number>).fairness_score} color="bg-green-500" />}
                {(result as Record<string, Record<string, number>>)?.tradeoff_analysis && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Tradeoff Analysis</h4>
                    {Object.entries((result as Record<string, Record<string, number>>).tradeoff_analysis).map(([k, v]) => (
                      <StatBar key={k} label={k.replace(/_/g, " ")} value={v} color="bg-purple-500" />
                    ))}
                  </div>
                )}
                {(result as Record<string, Record<string, unknown>>)?.protected_attribute_analysis && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Protected Attribute Analysis</h4>
                    {Object.entries((result as Record<string, Record<string, Record<string, unknown>>>).protected_attribute_analysis).map(([attr, info]) => (
                      <div key={attr} className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs mb-1">
                        <div className="flex justify-between"><span className="font-medium">{attr}</span><Badge text={info.compliant ? "Compliant" : "Non-compliant"} color={info.compliant ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"} /></div>
                        <span className="text-gray-500 dark:text-gray-400">Max Disparity: {info.max_disparity}</span>
                      </div>
                    ))}
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Configure and synthesize to see results</p>}
          </Card>
        </div>
      )}

      {/* Detect Bias Tab */}
      {tab === "Detect Bias" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Bias Detection Configuration">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Detection ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={detectionId} onChange={(e) => setDetectionId(e.target.value)} placeholder="bias-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={detectProgramId} onChange={(e) => setDetectProgramId(e.target.value)} />
              </div>
              <SelectField label="Audit Level" value={auditLevel} onChange={setAuditLevel} options={AUDIT_LEVELS} />
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Bias Types to Check</label>
                <div className="grid grid-cols-3 gap-1">
                  {BIAS_TYPES.map((bt) => (
                    <label key={bt} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <input type="checkbox" checked={biasTypes.includes(bt)} onChange={() => toggleItem(bt, biasTypes, setBiasTypes)} className="rounded" />
                      {bt.replace(/_/g, " ")}
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sensitive Attributes</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={detectSensitiveAttrs.join(",")} onChange={(e) => setDetectSensitiveAttrs(e.target.value.split(",").map(s => s.trim()))} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confidence Level</label>
                  <input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={confidenceLevel} onChange={(e) => setConfidenceLevel(Number(e.target.value))} min={0.8} max={0.99} />
                </div>
              </div>
              <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-3">
                <input type="checkbox" checked={intersectionalAnalysis} onChange={(e) => setIntersectionalAnalysis(e.target.checked)} className="rounded" />
                Intersectional Analysis
              </label>
              <button disabled={loading} onClick={() => callApi("causal-fairness/detect-bias", {
                detection_id: detectionId || undefined, program_id: detectProgramId, bias_types: biasTypes,
                sensitive_attributes: detectSensitiveAttrs, audit_level: auditLevel, confidence_level: confidenceLevel,
                intersectional_analysis: intersectionalAnalysis,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Detecting..." : "Detect Bias"}
              </button>
            </div>
          </Card>
          <Card title="Detection Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.risk_classification && <Badge text={`Risk: ${(result as Record<string, unknown>).risk_classification}`} color={String((result as Record<string, unknown>).risk_classification).includes("high") ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"} />}
                {(result as Record<string, unknown>)?.overall_fairness_score != null && <StatBar label="Overall Fairness Score" value={(result as Record<string, number>).overall_fairness_score} color="bg-green-500" />}
                {(result as Record<string, unknown[]>)?.detected_biases?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-orange-600">Detected Biases</h4>
                    <div className="space-y-1 max-h-48 overflow-auto">
                      {(result as Record<string, unknown[]>).detected_biases.slice(0, 4).map((b: Record<string, unknown>, i) => (
                        <div key={i} className={`rounded p-2 text-xs ${String(b.severity) === "critical" ? "bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500" : String(b.severity) === "high" ? "bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500" : "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500"}`}>
                          <div className="flex justify-between mb-1"><span className="font-medium">{String(b.type).replace(/_/g, " ")}</span><Badge text={String(b.severity)} color={String(b.severity) === "critical" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : String(b.severity) === "high" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"} /></div>
                          <div className="text-gray-500 dark:text-gray-400">p={b.p_value} | Effect: {b.effect_size}</div>
                          <div className="text-gray-500 dark:text-gray-400 mt-1">{String(b.description).slice(0, 80)}...</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(result as Record<string, Record<string, number>>)?.bias_severity_summary && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Severity Summary</h4>
                    {Object.entries((result as Record<string, Record<string, number>>).bias_severity_summary).map(([sev, count]) => (
                      <Badge key={sev} text={`${sev}: ${count}`} color="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" />
                    ))}
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Configure and run bias detection to see results</p>}
          </Card>
        </div>
      )}

      {/* Correct Tab */}
      {tab === "Correct" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Fairness Correction">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Correction ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={correctionId} onChange={(e) => setCorrectionId(e.target.value)} placeholder="corr-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={correctProgramId} onChange={(e) => setCorrectProgramId(e.target.value)} />
              </div>
              <SelectField label="Correction Strategy" value={correctionStrategy} onChange={setCorrectionStrategy} options={CORRECTION_STRATEGIES} />
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Detected Bias IDs</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={detectedBiasIds.join(",")} onChange={(e) => setDetectedBiasIds(e.target.value.split(",").map(s => s.trim()))} />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Metrics</label>
                <div className="grid grid-cols-3 gap-1">
                  {FAIRNESS_METRICS.map((m) => (
                    <label key={m} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <input type="checkbox" checked={targetMetrics.includes(m)} onChange={() => toggleItem(m, targetMetrics, setTargetMetrics)} className="rounded" />
                      {m.replace(/_/g, " ").slice(0, 12)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={preserveAccuracy} onChange={(e) => setPreserveAccuracy(e.target.checked)} className="rounded" />
                  Preserve Accuracy
                </label>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Iterations</label>
                  <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={maxIterations} onChange={(e) => setMaxIterations(Number(e.target.value))} min={1} max={50} />
                </div>
              </div>
              <button disabled={loading || detectedBiasIds.length === 0} onClick={() => callApi("causal-fairness/correct", {
                correction_id: correctionId || undefined, program_id: correctProgramId, detected_bias_ids: detectedBiasIds,
                correction_strategy: correctionStrategy, target_metrics: targetMetrics, preserve_accuracy: preserveAccuracy, max_iterations: maxIterations,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Correcting..." : "Correct Fairness"}
              </button>
            </div>
          </Card>
          <Card title="Correction Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, Record<string, Record<string, number>>>)?.before_after_comparison && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Before → After Comparison</h4>
                    {Object.entries((result as Record<string, Record<string, Record<string, number>>>).before_after_comparison).map(([phase, metrics]) => (
                      <div key={phase} className="mb-2">
                        <h5 className={`text-xs font-medium ${phase === "before" ? "text-red-600 dark:text-red-400" : phase === "after" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`}>{phase.charAt(0).toUpperCase() + phase.slice(1)}</h5>
                        {Object.entries(metrics).map(([k, v]) => (
                          <div key={k} className="text-xs text-gray-500 dark:text-gray-400 ml-2">{k.replace(/_/g, " ")}: {typeof v === "number" ? v.toFixed(3) : v}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {(result as Record<string, Record<string, number>>)?.fairness_improvement && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-green-600">Fairness Improvement</h4>
                    {Object.entries((result as Record<string, Record<string, number>>).fairness_improvement).map(([k, v]) => (
                      <StatBar key={k} label={k.replace(/_/g, " ")} value={v} color="bg-green-500" />
                    ))}
                  </div>
                )}
                {(result as Record<string, string[]>)?.residual_bias?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-amber-600">Residual Bias</h4>
                    {(result as Record<string, string[]>).residual_bias.map((r: string, i) => (
                      <div key={i} className="text-xs bg-amber-50 dark:bg-amber-900/20 rounded p-1.5 mb-1 text-amber-700 dark:text-amber-300">{r}</div>
                    ))}
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Run correction to see before/after comparison</p>}
          </Card>
        </div>
      )}

      {/* Evaluate Tab */}
      {tab === "Evaluate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Fairness Evaluation">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Evaluation ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evalId} onChange={(e) => setEvalId(e.target.value)} placeholder="feval-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evalProgramId} onChange={(e) => setEvalProgramId(e.target.value)} />
              </div>
              <SelectField label="Fairness Criterion" value={evalCriterion} onChange={setEvalCriterion} options={FAIRNESS_CRITERIA} />
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Evaluation Metrics</label>
                <div className="grid grid-cols-3 gap-1">
                  {FAIRNESS_METRICS.map((m) => (
                    <label key={m} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <input type="checkbox" checked={evalMetrics.includes(m)} onChange={() => toggleItem(m, evalMetrics, setEvalMetrics)} className="rounded" />
                      {m.replace(/_/g, " ").slice(0, 12)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Disparity Threshold</label>
                  <input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evalThreshold} onChange={(e) => setEvalThreshold(Number(e.target.value))} min={0} max={0.5} />
                </div>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={groupAnalysis} onChange={(e) => setGroupAnalysis(e.target.checked)} className="rounded" />
                  Group Analysis
                </label>
              </div>
              <button disabled={loading || evalMetrics.length === 0} onClick={() => callApi("causal-fairness/evaluate", {
                evaluation_id: evalId || undefined, program_id: evalProgramId, evaluation_metrics: evalMetrics,
                fairness_criterion: evalCriterion, group_analysis: groupAnalysis, threshold: evalThreshold,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Evaluating..." : "Evaluate Fairness"}
              </button>
            </div>
          </Card>
          <Card title="Evaluation Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.overall_compliance != null && (
                  <div className={`p-3 rounded ${(result as Record<string, boolean>).overall_compliance ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
                    <span className={`text-sm font-bold ${(result as Record<string, boolean>).overall_compliance ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                      {(result as Record<string, boolean>).overall_compliance ? "✓ COMPLIANT" : "✗ VIOLATIONS DETECTED"}
                    </span>
                    <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">Rate: {(result as Record<string, number>).compliance_rate}</span>
                  </div>
                )}
                {(result as Record<string, Record<string, number>>)?.metric_scores && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Metric Scores</h4>
                    {Object.entries((result as Record<string, Record<string, number>>).metric_scores).map(([k, v]) => {
                      const compliant = (result as Record<string, Record<string, boolean>>).compliance_status?.[k];
                      return <StatBar key={k} label={k.replace(/_/g, " ")} value={v} color={compliant ? "bg-green-500" : "bg-red-500"} />;
                    })}
                  </div>
                )}
                {(result as Record<string, Record<string, number>>)?.disparity_measures && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Disparity Measures</h4>
                    {Object.entries((result as Record<string, Record<string, number>>).disparity_measures).map(([k, v]) => (
                      <div key={k} className="text-xs text-gray-600 dark:text-gray-400 mb-1"><span className="font-medium">{k.replace(/_/g, " ")}:</span> {v.toFixed(4)}</div>
                    ))}
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Evaluate fairness compliance to see results</p>}
          </Card>
        </div>
      )}

      {/* Audit Tab */}
      {tab === "Audit" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Comprehensive Fairness Audit">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Audit ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={auditId} onChange={(e) => setAuditId(e.target.value)} placeholder="faudit-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program IDs</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={auditProgramIds.join(",")} onChange={(e) => setAuditProgramIds(e.target.value.split(",").map(s => s.trim()))} />
              </div>
              <SelectField label="Audit Level" value={auditLvl} onChange={setAuditLvl} options={AUDIT_LEVELS} />
              <div className="grid grid-cols-3 gap-2 mb-3">
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={includeCounterfactual} onChange={(e) => setIncludeCounterfactual(e.target.checked)} className="rounded" />
                  Counterfactual
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={includeIntersectional} onChange={(e) => setIncludeIntersectional(e.target.checked)} className="rounded" />
                  Intersectional
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={generateReport} onChange={(e) => setGenerateReport(e.target.checked)} className="rounded" />
                  Report
                </label>
              </div>
              <button disabled={loading || auditProgramIds.length === 0} onClick={() => callApi("causal-fairness/audit", {
                audit_id: auditId || undefined, program_ids: auditProgramIds, audit_level: auditLvl,
                include_counterfactual: includeCounterfactual, include_intersectional: includeIntersectional, generate_report: generateReport,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Auditing..." : "Run Full Audit"}
              </button>
            </div>
          </Card>
          <Card title="Audit Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown[]>)?.program_summaries?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Program Summaries</h4>
                    <div className="space-y-1 max-h-40 overflow-auto">
                      {(result as Record<string, unknown[]>).program_summaries.slice(0, 5).map((s: Record<string, unknown>, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs">
                          <div className="flex justify-between"><span className="font-medium">{String(s.program_id)}</span><Badge text={`Risk: ${s.risk_level}`} color={String(s.risk_level) === "low" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : String(s.risk_level) === "moderate" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"} /></div>
                          <div className="text-gray-500 dark:text-gray-400">Fairness: {s.fairness_score} | Biases: {s.bias_count} | Compliance: {s.compliance_rate}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(result as Record<string, string[]>)?.systemic_bias_patterns?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-orange-600">Systemic Bias Patterns</h4>
                    {(result as Record<string, string[]>).systemic_bias_patterns.slice(0, 3).map((p: string, i) => (
                      <div key={i} className="text-xs bg-orange-50 dark:bg-orange-900/20 rounded p-1.5 mb-1 text-orange-700 dark:text-orange-300">{p}</div>
                    ))}
                  </div>
                )}
                {(result as Record<string, string>)?.audit_report && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-blue-600">Audit Report</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded p-2">{String((result as Record<string, string>).audit_report).slice(0, 300)}...</p>
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Run audit to see comprehensive fairness analysis</p>}
          </Card>
        </div>
      )}

      {/* Validate Tab */}
      {tab === "Validate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Program Validation">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Validation ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={validId} onChange={(e) => setValidId(e.target.value)} placeholder="fval-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={validProgramId} onChange={(e) => setValidProgramId(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={checkStatValidity} onChange={(e) => setCheckStatValidity(e.target.checked)} className="rounded" />
                  Statistical Validity
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={checkCausalIntegrity} onChange={(e) => setCheckCausalIntegrity(e.target.checked)} className="rounded" />
                  Causal Integrity
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={checkFairnessSoundness} onChange={(e) => setCheckFairnessSoundness(e.target.checked)} className="rounded" />
                  Fairness Soundness
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={checkRobustness} onChange={(e) => setCheckRobustness(e.target.checked)} className="rounded" />
                  Robustness
                </label>
              </div>
              <button disabled={loading} onClick={() => callApi("causal-fairness/validate", {
                validation_id: validId || undefined, program_id: validProgramId, check_statistical_validity: checkStatValidity,
                check_causal_integrity: checkCausalIntegrity, check_fairness_soundness: checkFairnessSoundness, check_robustness: checkRobustness,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Validating..." : "Validate Program"}
              </button>
            </div>
          </Card>
          <Card title="Validation Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.is_valid != null && (
                  <div className={`p-3 rounded ${(result as Record<string, boolean>).is_valid ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
                    <span className={`text-sm font-bold ${(result as Record<string, boolean>).is_valid ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                      {(result as Record<string, boolean>).is_valid ? "✓ VALID" : "✗ INVALID"}
                    </span>
                  </div>
                )}
                {(result as Record<string, unknown>)?.statistical_validity != null && <StatBar label="Statistical Validity" value={(result as Record<string, number>).statistical_validity} color="bg-blue-500" />}
                {(result as Record<string, unknown>)?.causal_integrity != null && <StatBar label="Causal Integrity" value={(result as Record<string, number>).causal_integrity} color="bg-purple-500" />}
                {(result as Record<string, unknown>)?.fairness_soundness != null && <StatBar label="Fairness Soundness" value={(result as Record<string, number>).fairness_soundness} color="bg-green-500" />}
                {(result as Record<string, unknown>)?.robustness_score != null && <StatBar label="Robustness Score" value={(result as Record<string, number>).robustness_score} color="bg-amber-500" />}
                {(result as Record<string, Record<string, float>>)?.sensitivity_analysis && Object.keys((result as Record<string, Record<string, float>>).sensitivity_analysis).length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Sensitivity Analysis</h4>
                    {Object.entries((result as Record<string, Record<string, number>>).sensitivity_analysis).map(([k, v]) => (
                      <StatBar key={k} label={k.replace(/_/g, " ")} value={v} color="bg-rose-500" />
                    ))}
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Validate fairness program to see results</p>}
          </Card>
        </div>
      )}

      {/* Overview Tab */}
      {tab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Engine Metadata">
            <div className="space-y-2 text-xs">
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Version:</span> <span className="text-gray-900 dark:text-gray-100">v1.252.0</span></div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Module:</span> <span className="text-gray-900 dark:text-gray-100">Graph Causal Fairness Programming Engine</span></div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Description:</span> <span className="text-gray-700 dark:text-gray-300">Synthesizes, audits, and corrects causal programs for equitable outcomes, combining causal reasoning with fairness constraints</span></div>
            </div>
          </Card>
          <Card title="Endpoints">
            <div className="space-y-1 text-xs font-mono">
              <div className="text-indigo-700 dark:text-indigo-300">POST /graph/causal-fairness/synthesize</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-fairness/detect-bias</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-fairness/correct</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-fairness/evaluate</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-fairness/audit</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-fairness/validate</div>
              <div className="text-gray-600 dark:text-gray-400">GET  /graph/causal-fairness/overview</div>
            </div>
          </Card>
          <Card title="Enums (6 enums, 36 values)">
            <div className="space-y-2 text-xs">
              <div><span className="font-medium text-gray-600 dark:text-gray-400">FairnessMetric:</span> {FAIRNESS_METRICS.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">BiasType:</span> {BIAS_TYPES.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">CorrectionStrategy:</span> {CORRECTION_STRATEGIES.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">SynthesisGoal:</span> {SYNTHESIS_GOALS.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">FairnessCriterion:</span> {FAIRNESS_CRITERIA.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">AuditLevel:</span> {AUDIT_LEVELS.join(", ")}</div>
            </div>
          </Card>
          <Card title="Integration Chain">
            <div className="space-y-1 text-xs">
              <div className="text-gray-600 dark:text-gray-400">v1.251 → Causal Argumentation (fairness debates → equity argumentation)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.250 → Causal Explanation (fairness explanations → equity narratives)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.249 → Autonomous Causal Discovery (discovered structures → fairness synthesis)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.248 → Causal Program Verification (verified programs → fairness validation)</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
