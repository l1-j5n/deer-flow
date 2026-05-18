"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.250 backend
const EXPLANATION_STYLES = ["narrative", "technical", "pedagogical", "comparative", "counterfactual", "interactive"];
const CAUSAL_DEPTHS = ["surface", "mechanism", "pathway", "structural", "interventional", "counterfactual"];
const AUDIENCE_LEVELS = ["layperson", "student", "analyst", "researcher", "domain_expert", "policy_maker"];
const NARRATIVE_MODES = ["chronological", "effect_tracing", "pathway", "comparative", "scenario", "interactive"];
const EVIDENCE_STRENGTHS = ["conclusive", "strong", "moderate", "weak", "speculative", "contradictory"];
const EXPLANATION_FORMATS = ["natural_language", "structured_report", "visual_description", "annotated_graph", "interactive_doc", "executive_summary"];

const TABS = ["Generate", "Chain", "Contrast", "Simplify", "Evidence", "Validate", "Overview"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>{children}</div>;
}
function StatBar({ label, value, max = 1, color = "bg-blue-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(4)}</span></div><div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div></div>;
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

export default function GraphCausalExplanationPage() {
  const [tab, setTab] = useState<Tab>("Generate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Generate state
  const [explanationId, setExplanationId] = useState("");
  const [causalStructureId, setCausalStructureId] = useState("graph-obs-001");
  const [explanationStyle, setExplanationStyle] = useState("narrative");
  const [causalDepth, setCausalDepth] = useState("mechanism");
  const [audienceLevel, setAudienceLevel] = useState("analyst");
  const [narrativeMode, setNarrativeMode] = useState("effect_tracing");
  const [explanationFormat, setExplanationFormat] = useState("natural_language");
  const [includeVisualizations, setIncludeVisualizations] = useState(true);
  const [includeCounterfactuals, setIncludeCounterfactuals] = useState(true);
  const [language, setLanguage] = useState("en");

  // Chain state
  const [chainId, setChainId] = useState("");
  const [baseExplanationId, setBaseExplanationId] = useState("");
  const [chainDirection, setChainDirection] = useState("forward");
  const [chainDepth, setChainDepth] = useState(3);
  const [audienceProgression, setAudienceProgression] = useState<string[]>(["layperson", "analyst", "researcher"]);
  const [transitionStyle, setTransitionStyle] = useState("gradual");

  // Contrast state
  const [contrastId, setContrastId] = useState("");
  const [explanationIdA, setExplanationIdA] = useState("");
  const [explanationIdB, setExplanationIdB] = useState("");
  const [contrastDimensions, setContrastDimensions] = useState<string[]>(["causal_mechanism", "effect_size"]);
  const [highlightDifferences, setHighlightDifferences] = useState(true);
  const [compareConfidence, setCompareConfidence] = useState(true);
  const [suggestSynthesis, setSuggestSynthesis] = useState(true);

  // Simplify state
  const [simplifyId, setSimplifyId] = useState("");
  const [originalExplanationId, setOriginalExplanationId] = useState("");
  const [targetAudience, setTargetAudience] = useState("layperson");
  const [simplificationLevel, setSimplificationLevel] = useState(0.5);
  const [preserveCoreConcepts, setPreserveCoreConcepts] = useState(true);
  const [useAnalogies, setUseAnalogies] = useState(true);
  const [removeTechnicalTerms, setRemoveTechnicalTerms] = useState(true);

  // Evidence state
  const [evidenceId, setEvidenceId] = useState("");
  const [evidenceExplanationId, setEvidenceExplanationId] = useState("");
  const [evidenceSources, setEvidenceSources] = useState<string[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [requireStatisticalSignificance, setRequireStatisticalSignificance] = useState(true);
  const [checkReplicability, setCheckReplicability] = useState(true);

  // Validate state
  const [validationId, setValidationId] = useState("");
  const [validateExplanationId, setValidateExplanationId] = useState("");
  const [validationCriteria, setValidationCriteria] = useState<string[]>(["accuracy", "clarity", "completeness"]);
  const [expertReviews, setExpertReviews] = useState<Record<string, unknown>[]>([]);
  const [groundTruthComparison, setGroundTruthComparison] = useState(true);
  const [audienceTesting, setAudienceTesting] = useState(false);

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
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Graph Causal Explanation Generation</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">v1.250 — Human-readable causal explanations for interpretability</p>
        </div>
        <Badge text="v1.250" color="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200" />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-indigo-500 text-indigo-700 dark:text-indigo-300" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>{t}</button>
        ))}
      </div>

      {/* Generate Tab */}
      {tab === "Generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Explanation Configuration">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Explanation ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={explanationId} onChange={(e) => setExplanationId(e.target.value)} placeholder="exp-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Causal Structure ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={causalStructureId} onChange={(e) => setCausalStructureId(e.target.value)} />
              </div>
              <SelectField label="Explanation Style" value={explanationStyle} onChange={setExplanationStyle} options={EXPLANATION_STYLES} />
              <SelectField label="Causal Depth" value={causalDepth} onChange={setCausalDepth} options={CAUSAL_DEPTHS} />
              <SelectField label="Audience Level" value={audienceLevel} onChange={setAudienceLevel} options={AUDIENCE_LEVELS} />
              <SelectField label="Narrative Mode" value={narrativeMode} onChange={setNarrativeMode} options={NARRATIVE_MODES} />
              <SelectField label="Output Format" value={explanationFormat} onChange={setExplanationFormat} options={EXPLANATION_FORMATS} />
              <div className="grid grid-cols-2 gap-2 mb-3">
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={includeVisualizations} onChange={(e) => setIncludeVisualizations(e.target.checked)} className="rounded" />
                  Include Visualizations
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={includeCounterfactuals} onChange={(e) => setIncludeCounterfactuals(e.target.checked)} className="rounded" />
                  Include Counterfactuals
                </label>
              </div>
              <SelectField label="Language" value={language} onChange={setLanguage} options={["en", "zh", "es", "fr"]} />
              <button disabled={loading} onClick={() => callApi("causal-explain/generate", {
                explanation_id: explanationId || undefined, causal_structure_id: causalStructureId,
                explanation_style: explanationStyle, causal_depth: causalDepth, audience_level: audienceLevel,
                narrative_mode: narrativeMode, explanation_format: explanationFormat,
                include_visualizations: includeVisualizations, include_counterfactuals: includeCounterfactuals, language,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Generating..." : "Generate Explanation"}
              </button>
            </div>
          </Card>
          <Card title="Generated Explanation">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.explanation_id && <div className="flex gap-2 flex-wrap"><Badge text={`ID: ${(result as Record<string, unknown>).explanation_id}`} /><Badge text={`Style: ${(result as Record<string, unknown>).style}`} color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" /></div>}
                {(result as Record<string, unknown>)?.explanation_text && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                    <h4 className="text-xs font-semibold mb-2 text-gray-600 dark:text-gray-400">Explanation Text</h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{String((result as Record<string, unknown>).explanation_text)}</p>
                  </div>
                )}
                {(result as Record<string, unknown>)?.readability_score != null && <StatBar label="Readability Score" value={(result as Record<string, number>).readability_score} color="bg-indigo-500" />}
                {(result as Record<string, unknown>)?.completeness_score != null && <StatBar label="Completeness Score" value={(result as Record<string, number>).completeness_score} color="bg-violet-500" />}
                {(result as Record<string, Record<string, string>>)?.causality_summary && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Causality Summary</h4>
                    {Object.entries((result as Record<string, Record<string, string>>).causality_summary).map(([k, v]) => (
                      <div key={k} className="text-xs text-gray-600 dark:text-gray-400 mb-1"><span className="font-medium">{k}:</span> {v}</div>
                    ))}
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Configure and generate explanation to see results</p>}
          </Card>
        </div>
      )}

      {/* Chain Tab */}
      {tab === "Chain" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Explanation Chain Builder">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Chain ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={chainId} onChange={(e) => setChainId(e.target.value)} placeholder="chain-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Base Explanation ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={baseExplanationId} onChange={(e) => setBaseExplanationId(e.target.value)} />
              </div>
              <SelectField label="Chain Direction" value={chainDirection} onChange={setChainDirection} options={["forward", "backward"]} />
              <div className="grid grid-cols-2 gap-2">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Chain Depth</label>
                  <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={chainDepth} onChange={(e) => setChainDepth(Number(e.target.value))} min={1} max={10} />
                </div>
                <SelectField label="Transition Style" value={transitionStyle} onChange={setTransitionStyle} options={["gradual", "abrupt"]} />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Audience Progression</label>
                <div className="grid grid-cols-3 gap-1">
                  {AUDIENCE_LEVELS.map((a) => (
                    <label key={a} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <input type="checkbox" checked={audienceProgression.includes(a)} onChange={() => toggleItem(a, audienceProgression, setAudienceProgression)} className="rounded" />
                      {a.replace(/_/g, " ")}
                    </label>
                  ))}
                </div>
              </div>
              <button disabled={loading || audienceProgression.length < 2} onClick={() => callApi("causal-explain/chain", {
                chain_id: chainId || undefined, base_explanation_id: baseExplanationId, chain_direction: chainDirection,
                chain_depth: chainDepth, audience_progression: audienceProgression, transition_style: transitionStyle,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Building..." : "Build Chain"}
              </button>
            </div>
          </Card>
          <Card title="Chain Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.chain_id && <Badge text={`Chain: ${(result as Record<string, unknown>).chain_id}`} />}
                {(result as Record<string, unknown>)?.coherence_score != null && <StatBar label="Coherence Score" value={(result as Record<string, number>).coherence_score} color="bg-emerald-500" />}
                {(result as Record<string, Record<string, number>>)?.transition_analysis && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Transition Analysis</h4>
                    {Object.entries((result as Record<string, Record<string, number>>).transition_analysis).map(([k, v]) => (
                      <StatBar key={k} label={k.replace(/_/g, " ")} value={v} />
                    ))}
                  </div>
                )}
                {(result as Record<string, unknown[]>)?.chain_layers && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Chain Layers</h4>
                    <div className="space-y-2 max-h-60 overflow-auto">
                      {(result as Record<string, unknown[]>).chain_layers.map((layer: Record<string, unknown>, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs">
                          <div className="flex justify-between mb-1"><span className="font-medium">Layer {layer.layer_number}</span><Badge text={String(layer.audience_level)} color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" /></div>
                          <div className="text-gray-500 dark:text-gray-400 italic">{String(layer.explanation).slice(0, 100)}...</div>
                          <div className="text-gray-400 mt-1">Complexity: {layer.complexity_score}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Build chain to see layered explanations</p>}
          </Card>
        </div>
      )}

      {/* Contrast Tab */}
      {tab === "Contrast" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Contrastive Explanation">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Contrast ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={contrastId} onChange={(e) => setContrastId(e.target.value)} placeholder="contrast-..." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Explanation A</label>
                  <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={explanationIdA} onChange={(e) => setExplanationIdA(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Explanation B</label>
                  <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={explanationIdB} onChange={(e) => setExplanationIdB(e.target.value)} />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Contrast Dimensions</label>
                <div className="grid grid-cols-3 gap-1">
                  {["causal_mechanism", "effect_size", "confidence", "scope", "assumptions"].map((dim) => (
                    <label key={dim} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <input type="checkbox" checked={contrastDimensions.includes(dim)} onChange={() => toggleItem(dim, contrastDimensions, setContrastDimensions)} className="rounded" />
                      {dim.replace(/_/g, " ")}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={highlightDifferences} onChange={(e) => setHighlightDifferences(e.target.checked)} className="rounded" />
                  Highlight Diff
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={compareConfidence} onChange={(e) => setCompareConfidence(e.target.checked)} className="rounded" />
                  Compare Conf
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={suggestSynthesis} onChange={(e) => setSuggestSynthesis(e.target.checked)} className="rounded" />
                  Suggest Synth
                </label>
              </div>
              <button disabled={loading} onClick={() => callApi("causal-explain/contrast", {
                contrast_id: contrastId || undefined, explanation_id_a: explanationIdA, explanation_id_b: explanationIdB,
                contrast_dimensions: contrastDimensions, highlight_differences: highlightDifferences,
                compare_confidence: compareConfidence, suggest_synthesis: suggestSynthesis,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Contrasting..." : "Contrast Explanations"}
              </button>
            </div>
          </Card>
          <Card title="Contrast Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.contrast_id && <Badge text={`Contrast: ${(result as Record<string, unknown>).contrast_id}`} />}
                {(result as Record<string, unknown>)?.confidence_comparison && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Confidence Comparison</h4>
                    {(result as Record<string, Record<string, number>>).confidence_comparison && Object.entries((result as Record<string, Record<string, number>>).confidence_comparison).slice(0, 2).map(([k, v]) => (
                      <StatBar key={k} label={k.replace(/_/g, " ")} value={v} />
                    ))}
                  </div>
                )}
                {(result as Record<string, unknown[]>)?.differences && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-orange-600">Key Differences</h4>
                    <div className="space-y-1 max-h-48 overflow-auto">
                      {(result as Record<string, unknown[]>).differences.slice(0, 3).map((diff: Record<string, unknown>, i) => (
                        <div key={i} className="bg-orange-50 dark:bg-orange-900/20 rounded p-2 text-xs text-orange-800 dark:text-orange-200">
                          <span className="font-medium">{String(diff.dimension)}:</span> {String(diff.explanation_a)} vs {String(diff.explanation_b)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(result as Record<string, unknown>)?.synthesis_suggestion && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-blue-600">Synthesis Suggestion</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{String((result as Record<string, unknown>).synthesis_suggestion).slice(0, 200)}...</p>
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Contrast explanations to see differences</p>}
          </Card>
        </div>
      )}

      {/* Simplify Tab */}
      {tab === "Simplify" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Explanation Simplification">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Simplification ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={simplifyId} onChange={(e) => setSimplifyId(e.target.value)} placeholder="simp-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Original Explanation ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={originalExplanationId} onChange={(e) => setOriginalExplanationId(e.target.value)} />
              </div>
              <SelectField label="Target Audience" value={targetAudience} onChange={setTargetAudience} options={AUDIENCE_LEVELS} />
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Simplification Level</label>
                  <input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={simplificationLevel} onChange={(e) => setSimplificationLevel(Number(e.target.value))} min={0} max={1} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={preserveCoreConcepts} onChange={(e) => setPreserveCoreConcepts(e.target.checked)} className="rounded" />
                  Preserve Core
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={useAnalogies} onChange={(e) => setUseAnalogies(e.target.checked)} className="rounded" />
                  Use Analogies
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={removeTechnicalTerms} onChange={(e) => setRemoveTechnicalTerms(e.target.checked)} className="rounded" />
                  Remove Terms
                </label>
              </div>
              <button disabled={loading} onClick={() => callApi("causal-explain/simplify", {
                simplify_id: simplifyId || undefined, original_explanation_id: originalExplanationId, target_audience: targetAudience,
                simplification_level: simplificationLevel, preserve_core_concepts: preserveCoreConcepts,
                use_analogies: useAnalogies, remove_technical_terms: removeTechnicalTerms,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Simplifying..." : "Simplify Explanation"}
              </button>
            </div>
          </Card>
          <Card title="Simplification Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.simplification_ratio != null && <StatBar label="Simplification Ratio" value={(result as Record<string, number>).simplification_ratio} color="bg-teal-500" />}
                {(result as Record<string, unknown>)?.readability_improvement != null && <StatBar label="Readability Improvement" value={(result as Record<string, number>).readability_improvement} color="bg-cyan-500" />}
                {(result as Record<string, unknown>)?.comprehension_estimate != null && <StatBar label="Comprehension Estimate" value={(result as Record<string, number>).comprehension_estimate} color="bg-emerald-500" />}
                {(result as Record<string, unknown>)?.simplified_text && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
                    <h4 className="text-xs font-semibold mb-2 text-green-700 dark:text-green-300">Simplified Text</h4>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{String((result as Record<string, unknown>).simplified_text)}</p>
                  </div>
                )}
                {(result as Record<string, unknown[]>)?.analogies_used?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Analogies Used</h4>
                    {(result as Record<string, unknown[]>).analogies_used.map((a: unknown, i) => (
                      <Badge key={i} text={String(a)} color="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" />
                    ))}
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Simplify explanation to see results</p>}
          </Card>
        </div>
      )}

      {/* Evidence Tab */}
      {tab === "Evidence" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Evidence Strength Analysis">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Evidence ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evidenceId} onChange={(e) => setEvidenceId(e.target.value)} placeholder="ev-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Explanation ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evidenceExplanationId} onChange={(e) => setEvidenceExplanationId(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confidence Threshold</label>
                  <input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={confidenceThreshold} onChange={(e) => setConfidenceThreshold(Number(e.target.value))} min={0} max={1} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={requireStatisticalSignificance} onChange={(e) => setRequireStatisticalSignificance(e.target.checked)} className="rounded" />
                  Require Sig
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={checkReplicability} onChange={(e) => setCheckReplicability(e.target.checked)} className="rounded" />
                  Check Rep
                </label>
              </div>
              <button disabled={loading} onClick={() => callApi("causal-explain/evidence", {
                evidence_id: evidenceId || undefined, explanation_id: evidenceExplanationId, evidence_sources: evidenceSources,
                confidence_threshold: confidenceThreshold, require_statistical_significance: requireStatisticalSignificance, check_replicability: checkReplicability,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Analyzing..." : "Analyze Evidence"}
              </button>
            </div>
          </Card>
          <Card title="Evidence Results">
            {result ? (
              <div className="space-y-3">
                {(result as Record<string, unknown>)?.overall_evidence_strength && <Badge text={`Evidence: ${(result as Record<string, unknown>).overall_evidence_strength}`} color={String((result as Record<string, unknown>).overall_evidence_strength) === "strong" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"} />}
                {(result as Record<string, unknown[]>)?.evidence_items && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-400">Evidence Items</h4>
                    <div className="space-y-1 max-h-40 overflow-auto">
                      {(result as Record<string, unknown[]>).evidence_items.map((item: Record<string, unknown>, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs">
                          <div className="flex justify-between"><span className="font-medium">{String(item.source)}</span><Badge text={String(item.quality)} color="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" /></div>
                          <div className="text-gray-500 dark:text-gray-400">N={item.sample_size} | Effect: {item.effect_size} | p={item.p_value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(result as Record<string, unknown[]>)?.evidence_gaps?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-amber-600">Evidence Gaps</h4>
                    {(result as Record<string, unknown[]>).evidence_gaps.map((gap: unknown, i) => (
                      <Badge key={i} text={String(gap)} color="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" />
                    ))}
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Analyze evidence to see results</p>}
          </Card>
        </div>
      )}

      {/* Validate Tab */}
      {tab === "Validate" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Explanation Validation">
            <div className="space-y-1">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Validation ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={validationId} onChange={(e) => setValidationId(e.target.value)} placeholder="val-..." />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Explanation ID</label>
                <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={validateExplanationId} onChange={(e) => setValidateExplanationId(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Validation Criteria</label>
                <div className="grid grid-cols-3 gap-1">
                  {["accuracy", "clarity", "completeness", "domain_correctness", "audience_comprehension"].map((c) => (
                    <label key={c} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      <input type="checkbox" checked={validationCriteria.includes(c)} onChange={() => toggleItem(c, validationCriteria, setValidationCriteria)} className="rounded" />
                      {c.replace(/_/g, " ")}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={groundTruthComparison} onChange={(e) => setGroundTruthComparison(e.target.checked)} className="rounded" />
                  Ground Truth
                </label>
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input type="checkbox" checked={audienceTesting} onChange={(e) => setAudienceTesting(e.target.checked)} className="rounded" />
                  Audience Test
                </label>
              </div>
              <button disabled={loading || validationCriteria.length === 0} onClick={() => callApi("causal-explain/validate", {
                validation_id: validationId || undefined, explanation_id: validateExplanationId, validation_criteria: validationCriteria,
                expert_reviews: expertReviews, ground_truth_comparison: groundTruthComparison, audience_testing: audienceTesting,
              })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded disabled:opacity-50">
                {loading ? "Validating..." : "Validate Explanation"}
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
                {(result as Record<string, unknown>)?.accuracy_score != null && <StatBar label="Accuracy Score" value={(result as Record<string, number>).accuracy_score} color="bg-blue-500" />}
                {(result as Record<string, unknown>)?.clarity_score != null && <StatBar label="Clarity Score" value={(result as Record<string, number>).clarity_score} color="bg-indigo-500" />}
                {(result as Record<string, unknown>)?.domain_correctness != null && <StatBar label="Domain Correctness" value={(result as Record<string, number>).domain_correctness} color="bg-purple-500" />}
                {(result as Record<string, unknown[]>)?.improvement_suggestions?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-1 text-blue-600">Improvement Suggestions</h4>
                    {(result as Record<string, unknown[]>).improvement_suggestions.map((s: unknown, i) => (
                      <div key={i} className="text-xs bg-blue-50 dark:bg-blue-900/20 rounded p-1.5 mb-1 text-blue-700 dark:text-blue-300">{String(s)}</div>
                    ))}
                  </div>
                )}
                <JsonBlock data={result} />
              </div>
            ) : <p className="text-xs text-gray-400">Validate explanation to see results</p>}
          </Card>
        </div>
      )}

      {/* Overview Tab */}
      {tab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="Engine Metadata">
            <div className="space-y-2 text-xs">
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Version:</span> <span className="text-gray-900 dark:text-gray-100">v1.250.0</span></div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Module:</span> <span className="text-gray-900 dark:text-gray-100">Graph Causal Explanation Generation</span></div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">Description:</span> <span className="text-gray-700 dark:text-gray-300">Converts causal structures and verified programs into human-readable explanations with multiple styles, audience levels, narrative modes, and evidence analysis</span></div>
            </div>
          </Card>
          <Card title="Endpoints">
            <div className="space-y-1 text-xs font-mono">
              <div className="text-indigo-700 dark:text-indigo-300">POST /graph/causal-explain/generate</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-explain/chain</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-explain/contrast</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-explain/simplify</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-explain/evidence</div>
              <div className="text-gray-600 dark:text-gray-400">POST /graph/causal-explain/validate</div>
              <div className="text-gray-600 dark:text-gray-400">GET  /graph/causal-explain/overview</div>
            </div>
          </Card>
          <Card title="Enums (6 enums, 36 values)">
            <div className="space-y-2 text-xs">
              <div><span className="font-medium text-gray-600 dark:text-gray-400">ExplanationStyle:</span> {EXPLANATION_STYLES.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">CausalDepth:</span> {CAUSAL_DEPTHS.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">AudienceLevel:</span> {AUDIENCE_LEVELS.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">NarrativeMode:</span> {NARRATIVE_MODES.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">EvidenceStrength:</span> {EVIDENCE_STRENGTHS.join(", ")}</div>
              <div><span className="font-medium text-gray-600 dark:text-gray-400">ExplanationFormat:</span> {EXPLANATION_FORMATS.join(", ")}</div>
            </div>
          </Card>
          <Card title="Integration Chain">
            <div className="space-y-1 text-xs">
              <div className="text-gray-600 dark:text-gray-400">v1.249 → Autonomous Causal Discovery (discovered structures → explain)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.248 → Causal Program Verification (verified programs → explain correctness)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.247 → Causal World Model (world models → explain dynamics)</div>
              <div className="text-gray-600 dark:text-gray-400">v1.246 → Neuro-Symbolic Causal (symbolic reasoning → explain logic)</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}