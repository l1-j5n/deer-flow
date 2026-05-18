"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.244 backend
const CS_DOMAINS = ["physical", "social", "temporal", "spatial", "biological", "ai_augmented"];
const REASONING_PATTERNS = ["deductive", "inductive", "abductive", "analogical", "counterfactual", "commonsense_chain"];
const KNOWLEDGE_SOURCES = ["conceptnet", "atOMIC", "wikidata", "worldtree", "custom_kg", "ai_generated"];
const INFERENCE_STRATEGIES = ["forward_chain", "backward_chain", "constraint_propagation", "bayesian_inference", "neural_symbolic", "hybrid_reasoning"];
const CONSISTENCY_CHECKS = ["logical", "semantic", "temporal", "causal", "physical_plausibility", "social_norm"];
const EXPLANATION_TYPES = ["natural_language", "structured_graph", "evidence_chain", "analogy_based", "contrastive", "interactive"];

const TABS = ["Reason", "Validate", "Enrich", "Conflict", "Explain", "Benchmark", "Overview"] as const;
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
function Badge({ text, color = "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

export default function GraphCommonsenseReasoningPage() {
  const [tab, setTab] = useState<Tab>("Reason");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Reason state
  const [graphId, setGraphId] = useState("graph_cs_01");
  const [csDomain, setCsDomain] = useState("physical");
  const [pattern, setPattern] = useState("abductive");
  const [csSource, setCsSource] = useState("conceptnet");
  const [csStrategy, setCsStrategy] = useState("hybrid_reasoning");
  const [csMaxHops, setCsMaxHops] = useState(3);
  const [csConfThresh, setCsConfThresh] = useState(0.5);

  // Validate state
  const [valGraphId, setValGraphId] = useState("graph_cs_01");
  const [valChecks, setValChecks] = useState<string[]>(["logical", "causal", "physical_plausibility"]);
  const [valDomain, setValDomain] = useState("physical");

  // Enrich state
  const [enrichGraphId, setEnrichGraphId] = useState("graph_cs_01");
  const [enrichDomain, setEnrichDomain] = useState("physical");
  const [enrichSources, setEnrichSources] = useState<string[]>(["conceptnet", "wikidata"]);
  const [enrichDepth, setEnrichDepth] = useState(2);
  const [enrichMaxNodes, setEnrichMaxNodes] = useState(20);

  // Conflict state
  const [confGraphId, setConfGraphId] = useState("graph_cs_01");
  const [confDomain, setConfDomain] = useState("physical");
  const [confStrategy, setConfStrategy] = useState("hybrid_reasoning");
  const [confPref, setConfPref] = useState("commonsense");

  // Explain state
  const [expGraphId, setExpGraphId] = useState("graph_cs_01");
  const [expInfId, setExpInfId] = useState("inf_0");
  const [expType, setExpType] = useState("natural_language");
  const [expDetail, setExpDetail] = useState(2);

  // Benchmark state
  const [bmGraphId, setBmGraphId] = useState("graph_cs_01");
  const [bmDomain, setBmDomain] = useState("physical");
  const [bmSize, setBmSize] = useState(100);
  const [bmDifficulty, setBmDifficulty] = useState("mixed");

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true); setResult(null);
    try {
      const r = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setResult(await r.json());
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const renderReason = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Commonsense Reasoning">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={graphId} onChange={(e) => setGraphId(e.target.value)} /></div>
        <SelectField label="Domain" value={csDomain} onChange={setCsDomain} options={CS_DOMAINS} />
        <SelectField label="Reasoning Pattern" value={pattern} onChange={setPattern} options={REASONING_PATTERNS} />
        <SelectField label="Knowledge Source" value={csSource} onChange={setCsSource} options={KNOWLEDGE_SOURCES} />
        <SelectField label="Inference Strategy" value={csStrategy} onChange={setCsStrategy} options={INFERENCE_STRATEGIES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Hops</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={csMaxHops} onChange={(e) => setCsMaxHops(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confidence Threshold</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={csConfThresh} onChange={(e) => setCsConfThresh(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/commonsense-reasoning/reason", { graph_id: graphId, domain: csDomain, pattern, source: csSource, strategy: csStrategy, query_concepts: ["cause", "effect", "precondition"], max_hops: csMaxHops, confidence_threshold: csConfThresh })}>{loading ? "Reasoning..." : "Run Reasoning"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "coverage_score" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const inferences = (d.inferences as Record<string, unknown>[]) ?? [];
          const validCount = inferences.filter((inf) => inf.valid).length;
          return (<>
            <Card title="Reasoning Summary">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{inferences.length}</div><div className="text-xs text-gray-500">Inferences</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(d.commonsense_facts_used ?? 0)}</div><div className="text-xs text-gray-500">CS Facts</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(d.novel_connections ?? 0)}</div><div className="text-xs text-gray-500">Novel Links</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(d.inference_depth ?? 0)}</div><div className="text-xs text-gray-500">Max Depth</div></div>
                <div className="text-center"><div className="text-lg font-bold text-cyan-600">{validCount}/{inferences.length}</div><div className="text-xs text-gray-500">Valid</div></div>
              </div>
              <StatBar label="Coverage Score" value={d.coverage_score as number} color="bg-blue-500" />
              <StatBar label="Consistency Score" value={d.consistency_score as number} color="bg-emerald-500" />
            </Card>
            <Card title="Inferences"><JsonBlock data={d.inferences} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderValidate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Consistency Validation">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={valGraphId} onChange={(e) => setValGraphId(e.target.value)} /></div>
        <SelectField label="Domain" value={valDomain} onChange={setValDomain} options={CS_DOMAINS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Consistency Checks</label>
          <div className="flex flex-wrap gap-1">
            {CONSISTENCY_CHECKS.map((c) => (
              <button key={c} onClick={() => toggleItem(valChecks, c, setValChecks)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${valChecks.includes(c) ? "bg-amber-600 text-white border-amber-600" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>
                {c.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <button className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/commonsense-reasoning/validate", { graph_id: valGraphId, checks: valChecks, domain: valDomain, strict_mode: false })}>{loading ? "Validating..." : "Validate Consistency"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "overall_consistency" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const violations = (d.violations as Record<string, unknown>[]) ?? [];
          const scores = d.consistency_scores as Record<string, number>;
          return (<>
            <Card title="Validation Summary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(d.total_nodes_checked ?? 0)}</div><div className="text-xs text-gray-500">Nodes</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(d.total_edges_checked ?? 0)}</div><div className="text-xs text-gray-500">Edges</div></div>
                <div className="text-center"><div className="text-lg font-bold text-red-600">{violations.length}</div><div className="text-xs text-gray-500">Violations</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{(d.overall_consistency as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Overall</div></div>
              </div>
              {scores && Object.entries(scores).map(([k, v]) => (
                <StatBar key={k} label={k.replace(/_/g, " ")} value={v} color={v > 0.8 ? "bg-emerald-500" : (v > 0.6 ? "bg-amber-500" : "bg-red-500")} />
              ))}
            </Card>
            <Card title="Violations"><JsonBlock data={d.violations} /></Card>
            <Card title="Repair Suggestions"><JsonBlock data={d.repair_suggestions} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderEnrich = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Graph Enrichment">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={enrichGraphId} onChange={(e) => setEnrichGraphId(e.target.value)} /></div>
        <SelectField label="Domain" value={enrichDomain} onChange={setEnrichDomain} options={CS_DOMAINS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Knowledge Sources</label>
          <div className="flex flex-wrap gap-1">
            {KNOWLEDGE_SOURCES.map((s) => (
              <button key={s} onClick={() => toggleItem(enrichSources, s, setEnrichSources)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${enrichSources.includes(s) ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Enrichment Depth</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={enrichDepth} onChange={(e) => setEnrichDepth(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Nodes to Add</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={enrichMaxNodes} onChange={(e) => setEnrichMaxNodes(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/commonsense-reasoning/enrich", { graph_id: enrichGraphId, domain: enrichDomain, sources: enrichSources, enrichment_depth: enrichDepth, max_nodes_to_add: enrichMaxNodes, similarity_threshold: 0.6 })}>{loading ? "Enriching..." : "Enrich Graph"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "enrichment_quality" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return (<>
            <Card title="Enrichment Summary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(d.original_nodes ?? 0)} → {String(d.enriched_nodes ?? 0)}</div><div className="text-xs text-gray-500">Nodes</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(d.original_edges ?? 0)} → {String(d.enriched_edges ?? 0)}</div><div className="text-xs text-gray-500">Edges</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{(d.enrichment_quality as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Quality</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{(d.domain_coverage as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Domain Coverage</div></div>
              </div>
              <div className="flex gap-2">
                <Badge text={`+${(d.added_concepts as unknown[])?.length ?? 0} Concepts`} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                <Badge text={`+${(d.added_relations as unknown[])?.length ?? 0} Relations`} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
              </div>
            </Card>
            <Card title="Added Concepts"><JsonBlock data={d.added_concepts} /></Card>
            <Card title="Added Relations"><JsonBlock data={d.added_relations} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderConflict = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Conflict Resolution">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={confGraphId} onChange={(e) => setConfGraphId(e.target.value)} /></div>
        <SelectField label="Domain" value={confDomain} onChange={setConfDomain} options={CS_DOMAINS} />
        <SelectField label="Resolution Strategy" value={confStrategy} onChange={setConfStrategy} options={INFERENCE_STRATEGIES} />
        <SelectField label="Preference" value={confPref} onChange={setConfPref} options={["commonsense", "causal", "balanced"]} />
        <button className="w-full mt-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/commonsense-reasoning/resolve-conflict", { graph_id: confGraphId, domain: confDomain, resolution_strategy: confStrategy, preference: confPref })}>{loading ? "Resolving..." : "Resolve Conflicts"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "total_conflicts" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return (<>
            <Card title="Conflict Summary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-red-600">{String(d.total_conflicts ?? 0)}</div><div className="text-xs text-gray-500">Total</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(d.resolved_conflicts ?? 0)}</div><div className="text-xs text-gray-500">Resolved</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(d.unresolved_conflicts ?? 0)}</div><div className="text-xs text-gray-500">Unresolved</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{(d.resolution_confidence as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Confidence</div></div>
              </div>
            </Card>
            <Card title="Conflict Details"><JsonBlock data={d.conflict_details} /></Card>
            <Card title="Resolutions"><JsonBlock data={d.resolutions} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderExplain = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Explain Inference">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={expGraphId} onChange={(e) => setExpGraphId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Inference ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={expInfId} onChange={(e) => setExpInfId(e.target.value)} /></div>
        <SelectField label="Explanation Type" value={expType} onChange={setExpType} options={EXPLANATION_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Detail Level</label><input type="number" min={1} max={5} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={expDetail} onChange={(e) => setExpDetail(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/commonsense-reasoning/explain", { graph_id: expGraphId, inference_id: expInfId, explanation_type: expType, detail_level: expDetail, target_audience: "expert" })}>{loading ? "Generating..." : "Generate Explanation"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "explanation_text" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return (<>
            <Card title="Explanation">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg mb-3">
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{String(d.explanation_text)}</p>
              </div>
              <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">{String(d.confidence_narrative)}</p>
              </div>
              <div className="flex gap-2">
                <Badge text={`Type: ${String(d.explanation_type)}`} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                <Badge text={`Steps: ${(d.reasoning_steps as unknown[])?.length ?? 0}`} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
                <Badge text={`Evidence: ${(d.evidence as unknown[])?.length ?? 0}`} color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
              </div>
            </Card>
            <Card title="Reasoning Steps"><JsonBlock data={d.reasoning_steps} /></Card>
            <Card title="Evidence"><JsonBlock data={d.evidence} /></Card>
            {((d.alternative_explanations as string[]) ?? []).length > 0 && (
              <Card title="Alternative Explanations">
                <ul className="space-y-2">
                  {(d.alternative_explanations as string[]).map((alt, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-purple-500 mt-0.5">&#9679;</span> {alt}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </>);
        })()}
      </div>
    </div>
  );

  const renderBenchmark = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Benchmark Test">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={bmGraphId} onChange={(e) => setBmGraphId(e.target.value)} /></div>
        <SelectField label="Domain" value={bmDomain} onChange={setBmDomain} options={CS_DOMAINS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Benchmark Size</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={bmSize} onChange={(e) => setBmSize(+e.target.value)} /></div>
        <SelectField label="Difficulty" value={bmDifficulty} onChange={setBmDifficulty} options={["easy", "medium", "hard", "mixed"]} />
        <button className="w-full mt-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/commonsense-reasoning/benchmark", { graph_id: bmGraphId, domain: bmDomain, benchmark_size: bmSize, difficulty: bmDifficulty })}>{loading ? "Benchmarking..." : "Run Benchmark"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "accuracy" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const catScores = d.per_category_scores as Record<string, number>;
          return (<>
            <Card title="Benchmark Results">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{(d.accuracy as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Accuracy</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{(d.precision_score as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Precision</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{(d.recall_score as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Recall</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{(d.f1_score as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">F1 Score</div></div>
              </div>
              <div className="flex gap-2 mb-3">
                <Badge text={`${String(d.correct_answers)}/${String(d.total_questions)}`} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                <Badge text={String(d.benchmark_name)} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
              </div>
            </Card>
            {catScores && (
              <Card title="Category Scores">
                {Object.entries(catScores).map(([k, v]) => (
                  <StatBar key={k} label={k.replace(/_/g, " ")} value={v} color={v > 0.75 ? "bg-emerald-500" : (v > 0.6 ? "bg-amber-500" : "bg-red-500")} />
                ))}
              </Card>
            )}
            <Card title="Error Analysis"><JsonBlock data={d.error_analysis} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderOverview = () => {
    const allEnums: Record<string, string[]> = {
      CommonsenseDomain: CS_DOMAINS,
      ReasoningPattern: REASONING_PATTERNS,
      KnowledgeSource: KNOWLEDGE_SOURCES,
      InferenceStrategy: INFERENCE_STRATEGIES,
      ConsistencyCheck: CONSISTENCY_CHECKS,
      ExplanationType: EXPLANATION_TYPES,
    };
    return (
      <div className="space-y-4">
        <Card title="Engine Metadata">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center"><div className="text-lg font-bold text-blue-600">v1.244.0</div><div className="text-xs text-gray-500">Version</div></div>
            <div className="text-center"><div className="text-lg font-bold text-emerald-600">7</div><div className="text-xs text-gray-500">Endpoints</div></div>
            <div className="text-center"><div className="text-lg font-bold text-amber-600">6</div><div className="text-xs text-gray-500">Enums</div></div>
            <div className="text-center"><div className="text-lg font-bold text-purple-600">36</div><div className="text-xs text-gray-500">Enum Values</div></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Graph Common Sense Reasoning engine — commonsense knowledge integration for causal reasoning, combining structured knowledge bases (ConceptNet, atOMIC, Wikidata, WorldTree) with graph-based causal inference for enhanced reasoning accuracy, consistency validation, conflict resolution, and natural language explanations.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge text="Commonsense Reasoning" color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
            <Badge text="Consistency Validation" color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
            <Badge text="Graph Enrichment" color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
            <Badge text="Conflict Resolution" color="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" />
            <Badge text="Explanation Generation" color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />
            <Badge text="Benchmark Testing" color="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300" />
          </div>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(allEnums).map(([enumName, values]) => (
            <Card key={enumName} title={enumName}>
              <div className="flex flex-wrap gap-1">
                {values.map((v) => (
                  <span key={v} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded border border-gray-200 dark:border-gray-600">
                    {v.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <Card title="Integration Chain">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Transfer Learning</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.243</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Federated CF</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.242</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">NAS Causal</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.241</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Ontology</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.239</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const tabRenderers: Record<Tab, () => React.ReactNode> = {
    Reason: renderReason,
    Validate: renderValidate,
    Enrich: renderEnrich,
    Conflict: renderConflict,
    Explain: renderExplain,
    Benchmark: renderBenchmark,
    Overview: renderOverview,
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-100">
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Graph Common Sense Reasoning</h1>
        <p className="text-sm text-gray-400 mt-1">v1.244.0 &mdash; Commonsense knowledge integration for causal reasoning with consistency validation, graph enrichment, conflict resolution &amp; natural language explanations</p>
        <div className="flex gap-2 mt-2">
          <Badge text="6 Enums" color="bg-blue-900 text-blue-300" />
          <Badge text="7 Endpoints" color="bg-emerald-900 text-emerald-300" />
          <Badge text="36 Values" color="bg-purple-900 text-purple-300" />
        </div>
      </div>
      <div className="px-6 py-2 border-b border-gray-800 flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setResult(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors whitespace-nowrap ${tab === t ? "bg-gray-800 text-white border-b-2 border-blue-500" : "text-gray-400 hover:text-gray-200"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {tabRenderers[tab]()}
      </div>
    </div>
  );
}
