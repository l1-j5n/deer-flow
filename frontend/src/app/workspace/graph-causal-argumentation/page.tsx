"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.251 backend
const ARGUMENT_TYPES = ["premise", "conclusion", "rebuttal", "support", "attack", "concession"];
const ARGUMENTATION_FRAMEWORKS = ["abstract_argumentation", "aspic_plus", "structured_debate", "dialectical_analysis", "bipartite_argumentation", "causal_focused"];
const ARGUMENT_STRENGTHS = ["refuted", "defeated", "acceptable", "defended", "preferred", "warranted"];
const DEBATE_MODES = ["adversarial", "collaborative", "constructive", "dialectical", "synthesis_focused", "consensus_building"];
const EVALUATION_METHODS = ["grounded_extension", "preferred_extension", "stable_extension", "semi_stable", "complete_extension", "ideal_extension"];
const ARGUMENT_RELATIONS = ["attacks", "supports", "defeats", "undermines", "rebuts", "concedes"];

const TABS = ["Construct", "Debate", "Rebuttal", "Evaluate", "Synthesize", "Validate", "Overview"] as const;
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
  return <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{text}</span>;
}

export default function GraphCausalArgumentationPage() {
  const [tab, setTab] = useState<Tab>("Construct");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Construct state
  const [argumentId, setArgumentId] = useState("");
  const [causalClaim, setCausalClaim] = useState("X causes Y through mechanism M with 95% confidence");
  const [argumentType, setArgumentType] = useState("conclusion");
  const [framework, setFramework] = useState("structured_debate");
  const [premiseIds, setPremiseIds] = useState<string[]>(["prem-001", "prem-002"]);
  const [evidenceIds, setEvidenceIds] = useState<string[]>(["ev-demo-001", "ev-demo-002"]);
  const [confidence, setConfidence] = useState(0.8);
  const [domain, setDomain] = useState("healthcare");

  // Debate state
  const [sessionId, setSessionId] = useState("");
  const [claimIds, setClaimIds] = useState<string[]>(["claim-001", "claim-002", "claim-003"]);
  const [debateMode, setDebateMode] = useState("dialectical");
  const [participants, setParticipants] = useState<string[]>(["proponent", "opponent", "judge"]);
  const [maxRounds, setMaxRounds] = useState(5);
  const [evaluationMethod, setEvaluationMethod] = useState("grounded_extension");
  const [focusDimensions, setFocusDimensions] = useState<string[]>(["causal_mechanism", "evidence_strength", "confounders"]);

  // Rebuttal state
  const [rebuttalId, setRebuttalId] = useState("");
  const [targetArgumentId, setTargetArgumentId] = useState("");
  const [relationType, setRelationType] = useState("attacks");
  const [rebuttalStrategy, setRebuttalStrategy] = useState("evidence_based");
  const [strengthThreshold, setStrengthThreshold] = useState(0.5);
  const [generateCounterRebuttals, setGenerateCounterRebuttals] = useState(true);

  // Evaluate state
  const [evaluationId, setEvaluationId] = useState("");
  const [argumentEvalIds, setArgumentEvalIds] = useState<string[]>(["arg-001", "arg-002", "arg-003", "arg-004"]);
  const [evalMethod, setEvalMethod] = useState("preferred_extension");
  const [includeAttackGraph, setIncludeAttackGraph] = useState(true);
  const [includeDefenseGraph, setIncludeDefenseGraph] = useState(true);
  const [strengthCalibration, setStrengthCalibration] = useState(true);

  // Synthesize state
  const [synthesisId, setSynthesisId] = useState("");
  const [argumentSetIds, setArgumentSetIds] = useState<string[]>(["set-001", "set-002"]);
  const [debateSessionId, setDebateSessionId] = useState("");
  const [resolutionStrategy, setResolutionStrategy] = useState("weighted_merge");
  const [preserveMinorityViews, setPreserveMinorityViews] = useState(true);
  const [generateExplanation, setGenerateExplanation] = useState(true);

  // Validate state
  const [validationId, setValidationId] = useState("");
  const [argumentValidId, setArgumentValidId] = useState("");
  const [checkLogicalConsistency, setCheckLogicalConsistency] = useState(true);
  const [checkCausalSoundness, setCheckCausalSoundness] = useState(true);
  const [checkEvidenceQuality, setCheckEvidenceQuality] = useState(true);
  const [checkCompleteness, setCheckCompleteness] = useState(true);

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
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Graph Causal Argumentation</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">v1.251 — Structured debate and argumentation for causal claims</p>
        </div>
        <Badge text="v1.251" color="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-indigo-500 text-indigo-700 dark:text-indigo-300" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>{t}</button>
        ))}
      </div>

      {/* Construct Tab */}
      {tab === "Construct" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Argument Construction">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Argument ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={argumentId} onChange={(e) => setArgumentId(e.target.value)} placeholder="arg-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Causal Claim</label>
                <textarea className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5 h-20" value={causalClaim} onChange={(e) => setCausalClaim(e.target.value)} />
              </div>
              <SelectField label="Argument Type" value={argumentType} onChange={setArgumentType} options={ARGUMENT_TYPES} />
              <SelectField label="Framework" value={framework} onChange={setFramework} options={ARGUMENTATION_FRAMEWORKS} />
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confidence</label>
                  <input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} min={0} max={1} />
                </div>
                <SelectField label="Domain" value={domain} onChange={setDomain} options={["healthcare", "economics", "social_science", "physics", "biology", "psychology"]} />
              </div>
              <button disabled={loading} onClick={() => callApi("causal-argumentation/construct", {
                argument_id: argumentId || undefined, causal_claim: causalClaim, argument_type: argumentType,
                framework, premise_ids: premiseIds, evidence_ids: evidenceIds, confidence, domain,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Constructing..." : "Construct Argument"}
              </button>
            </div>
          </Card>
          <Card title="Argument Result">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.argument_id && <Badge text={`ID: ${(result as Record<string, unknown>).argument_id}`} />}
                {(result as Record<string, unknown>)?.initial_strength && <Badge text={`Strength: ${(result as Record<string, unknown>).initial_strength}`} color={String((result as Record<string, unknown>).initial_strength) === "warranted" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"} />}
                {(result as Record<string, unknown[]>)?.premises?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Premises</h4>
                    <div className="space-y-1 max-h-40 overflow-auto">
                      {(result as Record<string, unknown[]>).premises.slice(0, 3).map((p: Record<string, unknown>, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs">
                          <div className="flex justify-between"><span className="font-medium">{String(p.type)}</span><Badge text={`Str: ${p.strength}`} color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" /></div>
                          <div className="text-gray-600 dark:text-gray-400">{String(p.content).slice(0, 80)}...</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(result as Record<string, string[]>)?.attack_surface?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-orange-600">Attack Surface</h4>
                    <div className="space-y-1">
                      {(result as Record<string, string[]>).attack_surface.slice(0, 3).map((a: string, i) => (
                        <div key={i} className="text-xs bg-orange-50 dark:bg-orange-900/20 rounded p-1.5 text-orange-700 dark:text-orange-300">{a}</div>
                      ))}
                    </div>
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Configure argument to see constructed output</p>}
          </Card>
        </div>
      )}

      {/* Debate Tab */}
      {tab === "Debate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Debate Session Setup">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Session ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="debate-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Claim IDs</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={claimIds.join(",")} onChange={(e) => setClaimIds(e.target.value.split(",").map(s => s.trim()))} />
              </div>
              <SelectField label="Debate Mode" value={debateMode} onChange={setDebateMode} options={DEBATE_MODES} />
              <SelectField label="Evaluation Method" value={evaluationMethod} onChange={setEvaluationMethod} options={EVALUATION_METHODS} />
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Rounds</label>
                  <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={maxRounds} onChange={(e) => setMaxRounds(Number(e.target.value))} min={1} max={20} />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Focus Dimensions</label>
                <div className="grid grid-cols-3 gap-1">
                  {["causal_mechanism", "evidence_strength", "confounders", "alternative_mechanisms", "temporal_ordering", "robustness"].map((dim) => (
                    <label key={dim} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <input type="checkbox" checked={focusDimensions.includes(dim)} onChange={() => toggleItem(dim, focusDimensions, setFocusDimensions)} className="rounded" />
                      {dim.replace(/_/g, " ")}
                    </label>
                  ))}
                </div>
              </div>
              <button disabled={loading} onClick={() => callApi("causal-argumentation/debate", {
                session_id: sessionId || undefined, claim_ids: claimIds, debate_mode: debateMode,
                evaluation_method: evaluationMethod, max_rounds: maxRounds, focus_dimensions: focusDimensions, participants,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Debating..." : "Start Debate"}
              </button>
            </div>
          </Card>
          <Card title="Debate Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.session_id && <Badge text={`Session: ${(result as Record<string, unknown>).session_id}`} />}
                {(result as Record<string, unknown>)?.winner && (
                  <div className={`p-3 rounded ${String((result as Record<string, unknown>).winner) === "proponent" ? "bg-green-50 dark:bg-green-900/30" : "bg-blue-50 dark:bg-blue-900/30"}`}>
                    <span className={`text-sm font-bold ${String((result as Record<string, unknown>).winner) === "proponent" ? "text-green-700 dark:text-green-300" : "text-blue-700 dark:text-blue-300"}`}>
                      Winner: {(result as Record<string, unknown>).winner}
                    </span>
                  </div>
                )}
                {(result as Record<string, unknown[]>)?.debate_rounds?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Debate Rounds</h4>
                    <div className="space-y-2 max-h-48 overflow-auto">
                      {(result as Record<string, unknown[]>).debate_rounds.slice(0, 3).map((round: Record<string, unknown>, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs">
                          <div className="flex justify-between mb-1"><span className="font-medium">Round {round.round}</span><Badge text={String(round.judge?.ruling || "")} color="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" /></div>
                          <div className="text-gray-500 dark:text-gray-400">Score Delta: {round.judge?.score_delta}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Configure and start debate to see results</p>}
          </Card>
        </div>
      )}

      {/* Rebuttal Tab */}
      {tab === "Rebuttal" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Rebuttal Generation">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rebuttal ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={rebuttalId} onChange={(e) => setRebuttalId(e.target.value)} placeholder="reb-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Argument ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={targetArgumentId} onChange={(e) => setTargetArgumentId(e.target.value)} />
              </div>
              <SelectField label="Relation Type" value={relationType} onChange={setRelationType} options={ARGUMENT_RELATIONS} />
              <SelectField label="Strategy" value={rebuttalStrategy} onChange={setRebuttalStrategy} options={["evidence_based", "alternative_mechanism", "confounder_highlight", "scope_challenge", "methodology_critique"]} />
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Strength Threshold</label>
                  <input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={strengthThreshold} onChange={(e) => setStrengthThreshold(Number(e.target.value))} min={0} max={1} />
                </div>
              </div>
              <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-3">
                <input type="checkbox" checked={generateCounterRebuttals} onChange={(e) => setGenerateCounterRebuttals(e.target.checked)} className="rounded" />
                Generate Counter-Rebuttals
              </label>
              <button disabled={loading} onClick={() => callApi("causal-argumentation/rebuttal", {
                rebuttal_id: rebuttalId || undefined, target_argument_id: targetArgumentId, relation_type: relationType,
                rebuttal_strategy: rebuttalStrategy, strength_threshold: strengthThreshold, generate_counter_rebuttals: generateCounterRebuttals,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Generating..." : "Generate Rebuttal"}
              </button>
            </div>
          </Card>
          <Card title="Rebuttal Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.rebuttal_id && <Badge text={`Rebuttal: ${(result as Record<string, unknown>).rebuttal_id}`} />}
                {(result as Record<string, unknown>)?.rebuttal_strength != null && <StatBar label="Rebuttal Strength" value={(result as Record<string, number>).rebuttal_strength} color="bg-orange-500" />}
                {(result as Record<string, unknown>)?.effectiveness_score != null && <StatBar label="Effectiveness Score" value={(result as Record<string, number>).effectiveness_score} color="bg-amber-500" />}
                {(result as Record<string, unknown[]>)?.rebuttal_claims?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Rebuttal Claims</h4>
                    <div className="space-y-1 max-h-48 overflow-auto">
                      {(result as Record<string, unknown[]>).rebuttal_claims.slice(0, 3).map((c: Record<string, unknown>, i) => (
                        <div key={i} className="bg-red-50 dark:bg-red-900/20 rounded p-2 text-xs text-red-700 dark:text-red-300">
                          <div className="flex justify-between"><span className="font-medium">{String(c.strategy)}</span><Badge text={`Str: ${c.strength}`} color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" /></div>
                          <div className="text-gray-600 dark:text-gray-400">{String(c.claim).slice(0, 70)}...</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Select target argument and generate rebuttal</p>}
          </Card>
        </div>
      )}

      {/* Evaluate Tab */}
      {tab === "Evaluate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Argument Evaluation">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Evaluation ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evaluationId} onChange={(e) => setEvaluationId(e.target.value)} placeholder="eval-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Argument IDs</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={argumentEvalIds.join(",")} onChange={(e) => setArgumentEvalIds(e.target.value.split(",").map(s => s.trim()))} />
              </div>
              <SelectField label="Evaluation Method" value={evalMethod} onChange={setEvalMethod} options={EVALUATION_METHODS} />
              <div className="grid grid-cols-3 gap-2 mb-3">
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={includeAttackGraph} onChange={(e) => setIncludeAttackGraph(e.target.checked)} className="rounded" />
                  Attack Graph
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={includeDefenseGraph} onChange={(e) => setIncludeDefenseGraph(e.target.checked)} className="rounded" />
                  Defense Graph
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={strengthCalibration} onChange={(e) => setStrengthCalibration(e.target.checked)} className="rounded" />
                  Calibration
                </label>
              </div>
              <button disabled={loading || argumentEvalIds.length === 0} onClick={() => callApi("causal-argumentation/evaluate", {
                evaluation_id: evaluationId || undefined, argument_ids: argumentEvalIds, evaluation_method: evalMethod,
                include_attack_graph: includeAttackGraph, include_defense_graph: includeDefenseGraph, strength_calibration: strengthCalibration,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Evaluating..." : "Evaluate Arguments"}
              </button>
            </div>
          </Card>
          <Card title="Evaluation Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown[]>)?.evaluated_arguments?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Argument Acceptability</h4>
                    <div className="space-y-1 max-h-40 overflow-auto">
                      {(result as Record<string, unknown[]>).evaluated_arguments.slice(0, 4).map((a: Record<string, unknown>, i) => (
                        <div key={i} className={`bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs ${String(a.acceptability) === "accepted" ? "border-l-4 border-green-500" : "border-l-4 border-red-500"}`}>
                          <div className="flex justify-between"><span className="font-medium">{String(a.argument_id)}</span><Badge text={String(a.acceptability)} color={String(a.acceptability) === "accepted" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"} /></div>
                          <div className="text-gray-500 dark:text-gray-400">Score: {a.strength_score}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(result as Record<string, unknown[]>)?.grounded?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-blue-600">Grounded Extension</h4>
                    <div className="flex gap-1 flex-wrap">
                      {(result as Record<string, string[]>).grounded.slice(0, 5).map((g: string, i) => <Badge key={i} text={g} color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" />)}
                    </div>
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Provide argument IDs to evaluate</p>}
          </Card>
        </div>
      )}

      {/* Synthesize Tab */}
      {tab === "Synthesize" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Consensus Synthesis">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Synthesis ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={synthesisId} onChange={(e) => setSynthesisId(e.target.value)} placeholder="synth-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Argument Set IDs</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={argumentSetIds.join(",")} onChange={(e) => setArgumentSetIds(e.target.value.split(",").map(s => s.trim()))} />
              </div>
              <SelectField label="Resolution Strategy" value={resolutionStrategy} onChange={setResolutionStrategy} options={["weighted_merge", "majority_vote", "strongest_argument", "dialectical_synthesis"]} />
              <div className="grid grid-cols-2 gap-2 mb-3">
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={preserveMinorityViews} onChange={(e) => setPreserveMinorityViews(e.target.checked)} className="rounded" />
                  Preserve Minority
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={generateExplanation} onChange={(e) => setGenerateExplanation(e.target.checked)} className="rounded" />
                  Generate Explanation
                </label>
              </div>
              <button disabled={loading || argumentSetIds.length === 0} onClick={() => callApi("causal-argumentation/synthesize", {
                synthesis_id: synthesisId || undefined, argument_set_ids: argumentSetIds, debate_session_id: debateSessionId,
                resolution_strategy: resolutionStrategy, preserve_minority_views: preserveMinorityViews, generate_explanation: generateExplanation,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Synthesizing..." : "Synthesize Consensus"}
              </button>
            </div>
          </Card>
          <Card title="Synthesis Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown[]>)?.consensus_claims?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-green-600">Consensus Claims</h4>
                    <div className="space-y-1 max-h-48 overflow-auto">
                      {(result as Record<string, unknown[]>).consensus_claims.slice(0, 3).map((c: Record<string, unknown>, i) => (
                        <div key={i} className="bg-green-50 dark:bg-green-900/20 rounded p-2 text-xs text-green-700 dark:text-green-300">
                          <div className="flex justify-between"><span className="font-medium">{String(c.claim).slice(0, 60)}...</span><Badge text={`Agree: ${c.agreement_level}`} color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" /></div>
                          <div className="text-gray-600 dark:text-gray-400">Supporting: {c.supporting_arguments} | Against: {c.against}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(result as Record<string, unknown>)?.consensus_distribution && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Agreement Distribution</h4>
                    {Object.entries((result as Record<string, Record<string, number>>).consensus_distribution).map(([k, v]) => (
                      <StatBar key={k} label={k.replace(/_/g, " ")} value={v} />
                    ))}
                  </div>
                )}
                {(result as Record<string, unknown>)?.synthesis_explanation && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-blue-600">Synthesis Explanation</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded p-2">{String((result as Record<string, unknown>).synthesis_explanation).slice(0, 200)}...</p>
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Provide argument sets to synthesize consensus</p>}
          </Card>
        </div>
      )}

      {/* Validate Tab */}
      {tab === "Validate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Argument Validation">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Validation ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={validationId} onChange={(e) => setValidationId(e.target.value)} placeholder="valarg-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Argument ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={argumentValidId} onChange={(e) => setArgumentValidId(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={checkLogicalConsistency} onChange={(e) => setCheckLogicalConsistency(e.target.checked)} className="rounded" />
                  Logical Consistency
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={checkCausalSoundness} onChange={(e) => setCheckCausalSoundness(e.target.checked)} className="rounded" />
                  Causal Soundness
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={checkEvidenceQuality} onChange={(e) => setCheckEvidenceQuality(e.target.checked)} className="rounded" />
                  Evidence Quality
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={checkCompleteness} onChange={(e) => setCheckCompleteness(e.target.checked)} className="rounded" />
                  Completeness
                </label>
              </div>
              <button disabled={loading} onClick={() => callApi("causal-argumentation/validate", {
                validation_id: validationId || undefined, argument_id: argumentValidId, check_logical_consistency: checkLogicalConsistency,
                check_causal_soundness: checkCausalSoundness, check_evidence_quality: checkEvidenceQuality, check_completeness: checkCompleteness,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Validating..." : "Validate Argument"}
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
                {(result as Record<string, unknown>)?.logical_consistency != null && <StatBar label="Logical Consistency" value={(result as Record<string, number>).logical_consistency} color="bg-blue-500" />}
                {(result as Record<string, unknown>)?.causal_soundness != null && <StatBar label="Causal Soundness" value={(result as Record<string, number>).causal_soundness} color="bg-purple-500" />}
                {(result as Record<string, unknown>)?.evidence_quality != null && <StatBar label="Evidence Quality" value={(result as Record<string, number>).evidence_quality} color="bg-green-500" />}
                {(result as Record<string, unknown[]>)?.fallacy_detection?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-orange-600">Fallacies Detected</h4>
                    <div className="space-y-1">
                      {(result as Record<string, unknown[]>).fallacy_detection.map((f: Record<string, unknown>, i) => (
                        <div key={i} className="text-xs bg-orange-50 dark:bg-orange-900/20 rounded p-1.5 text-orange-700 dark:text-orange-300">
                          <span className="font-medium">{String(f.fallacy)}:</span> {String(f.description).slice(0, 50)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Provide argument ID to validate</p>}
          </Card>
        </div>
      )}

      {/* Overview Tab */}
      {tab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Engine Metadata">
            <div className="space-y-2 text-xs">
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Version:</span> <span className="text-gray-900 dark:text-gray-100">v1.251.0</span></div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Module:</span> <span className="text-gray-900 dark:text-gray-100">Graph Causal Argumentation Engine</span></div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Description:</span> <span className="text-gray-700 dark:text-gray-300">Combines formal argumentation theory with causal reasoning to enable structured debate, rebuttal generation, consensus synthesis, and argument validation for causal claims</span></div>
            </div>
          </Card>
          <Card title="Endpoints">
            <div className="space-y-1 text-xs font-mono">
              <div className="text-indigo-700 dark:text-indigo-300">POST /graph/causal-argumentation/construct</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-argumentation/debate</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-argumentation/rebuttal</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-argumentation/evaluate</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-argumentation/synthesize</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-argumentation/validate</div>
              <div className="text-gray-600 dark:text-gray-400">GET  /graph/causal-argumentation/overview</div>
            </div>
          </Card>
          <Card title="Enums (6 enums, 36 values)">
            <div className="space-y-2 text-xs">
              <div><span className="font-medium text-gray-600 dark:text-gray-400">ArgumentType:</span> {ARGUMENT_TYPES.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">ArgumentationFramework:</span> {ARGUMENTATION_FRAMEWORKS.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">ArgumentStrength:</span> {ARGUMENT_STRENGTHS.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">DebateMode:</span> {DEBATE_MODES.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">EvaluationMethod:</span> {EVALUATION_METHODS.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">ArgumentRelation:</span> {ARGUMENT_RELATIONS.join(", ")}</div>
            </div>
          </Card>
          <Card title="Integration Chain">
            <div className="space-y-1 text-xs">
              <div className="text-gray-600 dark:text-gray-400">v1.250 → Causal Explanation (explanations → argument premises)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.249 → Autonomous Causal Discovery (discovered structures → claims to argue)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.248 → Causal Program Verification (verified programs → sound arguments)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.247 → Causal World Model (world models → simulate debate scenarios)</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
