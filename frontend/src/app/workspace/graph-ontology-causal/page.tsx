"use client";

import { useState } from "react";

const API = "/api/graph";

const CONSTRUCTION_METHODS = ["top_down", "bottom_up", "hybrid", "data_driven", "domain_expert", "neural_inductive"];
const EXTRACTION_METHODS = ["statistical", "linguistic", "embedding", "graph_based", "pattern_mining", "multi_modal"];
const ALIGNMENT_STRATEGIES = ["lexical", "structural", "semantic", "instance_based", "propagation", "learned"];
const REASONING_STRATEGIES = ["deductive", "inductive", "abductive", "analogical", "probabilistic", "fuzzy"];
const EVOLUTION_TYPES = ["expansion", "refinement", "merge", "split", "revision", "restructure"];
const VALIDATION_METHODS = ["consistency_check", "completeness_check", "coherence_check", "domain_validation", "user_validation", "automated_test"];

const TABS = ["Build", "Extract", "Align", "Reason", "Evolve", "Validate", "Overview"] as const;
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
  return <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label><select className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>;
}
function Badge({ text, color = "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

export default function GraphOntologyCausalPage() {
  const [tab, setTab] = useState<Tab>("Build");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Build state
  const [bMethod, setBMethod] = useState("hybrid");
  const [bDepth, setBDepth] = useState(5);
  const [bSupport, setBSupport] = useState(0.1);

  // Extract state
  const [eExtractor, setEExtractor] = useState("embedding");
  const [eNConcepts, setENConcepts] = useState(20);
  const [eMinConf, setEMinConf] = useState(0.5);

  // Align state
  const [aStrategy, setAStrategy] = useState("semantic");
  const [aTargetId, setATargetId] = useState("");
  const [aThreshold, setAThreshold] = useState(0.7);
  const [aMaxMaps, setAMaxMaps] = useState(100);

  // Reason state
  const [rReasoner, setRReasoner] = useState("deductive");
  const [rQuery, setRQuery] = useState("");
  const [rMaxDepth, setRMaxDepth] = useState(3);
  const [rConfThresh, setRConfThresh] = useState(0.6);

  // Evolve state
  const [vEvoType, setVEvoType] = useState("expansion");
  const [vMaxChanges, setVMaxChanges] = useState(50);
  const [vNewFacts, setVNewFacts] = useState("");

  // Validate state
  const [valMethod, setValMethod] = useState("consistency_check");
  const [valScope, setValScope] = useState("full");
  const [valSeverity, setValSeverity] = useState(0.5);
  const [valAutoFix, setValAutoFix] = useState(false);

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

  const renderBuild = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Ontology Construction">
        <SelectField label="Method" value={bMethod} onChange={setBMethod} options={CONSTRUCTION_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Depth</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={bDepth} onChange={(e) => setBDepth(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Min Concept Support</label><input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={bSupport} onChange={(e) => setBSupport(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/ontology-causal/build", { graph_id: "onto_01", method: bMethod, max_depth: bDepth, min_concept_support: bSupport, domain_hints: [] })}>{loading ? "Building..." : "Build Ontology"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "result" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const r = d.result as Record<string, unknown>;
          const quality = r.construction_quality as Record<string, number>;
          const hierarchy = r.hierarchy as Record<string, unknown>;
          return (<>
            <Card title="Build Summary">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(r.n_concepts)}</div><div className="text-xs text-gray-500">Concepts</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(r.n_relations)}</div><div className="text-xs text-gray-500">Relations</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(hierarchy?.max_depth)}</div><div className="text-xs text-gray-500">Max Depth</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(hierarchy?.root_concepts)}</div><div className="text-xs text-gray-500">Roots</div></div>
              </div>
              <StatBar label="Coherence" value={quality?.coherence ?? 0} color="bg-blue-500" />
              <StatBar label="Coverage" value={quality?.coverage ?? 0} color="bg-emerald-500" />
              <StatBar label="Specificity" value={quality?.specificity ?? 0} color="bg-amber-500" />
              <StatBar label="Consistency" value={quality?.consistency ?? 0} color="bg-purple-500" />
              <StatBar label="Richness" value={quality?.richness ?? 0} color="bg-pink-500" />
            </Card>
            <Card title="Hierarchy Info">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(hierarchy?.avg_breadth)}</div><div className="text-xs text-gray-500">Avg Breadth</div></div>
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(hierarchy?.leaf_concepts)}</div><div className="text-xs text-gray-500">Leaves</div></div>
                <div className="text-center"><div className="text-sm font-bold text-gray-700 dark:text-gray-200">{String(hierarchy?.is_a_relations)}</div><div className="text-xs text-gray-500">Is-A Relations</div></div>
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderExtract = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Concept Extraction">
        <SelectField label="Extractor" value={eExtractor} onChange={setEExtractor} options={EXTRACTION_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Number of Concepts</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={eNConcepts} onChange={(e) => setENConcepts(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Min Confidence</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={eMinConf} onChange={(e) => setEMinConf(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/ontology-causal/extract-concepts", { graph_id: "onto_01", extractor: eExtractor, n_concepts: eNConcepts, min_confidence: eMinConf, source_types: ["entity", "relation", "attribute"] })}>{loading ? "Extracting..." : "Extract Concepts"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Extraction Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderAlign = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Ontology Alignment">
        <SelectField label="Strategy" value={aStrategy} onChange={setAStrategy} options={ALIGNMENT_STRATEGIES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Ontology ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={aTargetId} onChange={(e) => setATargetId(e.target.value)} placeholder="e.g. snomed_ct" /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Similarity Threshold</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={aThreshold} onChange={(e) => setAThreshold(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Mappings</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={aMaxMaps} onChange={(e) => setAMaxMaps(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/ontology-causal/align", { graph_id: "onto_01", strategy: aStrategy, target_ontology_id: aTargetId, threshold: aThreshold, max_mappings: aMaxMaps })}>{loading ? "Aligning..." : "Align Ontology"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Alignment Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderReason = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Ontology Reasoning">
        <SelectField label="Reasoner" value={rReasoner} onChange={setRReasoner} options={REASONING_STRATEGIES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Query</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={rQuery} onChange={(e) => setRQuery(e.target.value)} placeholder="e.g. classify_all" /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Inference Depth</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={rMaxDepth} onChange={(e) => setRMaxDepth(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Confidence Threshold</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={rConfThresh} onChange={(e) => setRConfThresh(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/ontology-causal/reason", { graph_id: "onto_01", reasoner: rReasoner, query: rQuery, max_inference_depth: rMaxDepth, confidence_threshold: rConfThresh })}>{loading ? "Reasoning..." : "Run Reasoning"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Reasoning Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderEvolve = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Ontology Evolution">
        <SelectField label="Evolution Type" value={vEvoType} onChange={setVEvoType} options={EVOLUTION_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Changes</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={vMaxChanges} onChange={(e) => setVMaxChanges(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">New Facts (comma-separated)</label><textarea className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" rows={3} value={vNewFacts} onChange={(e) => setVNewFacts(e.target.value)} placeholder="fact1, fact2, fact3" /></div>
        <button className="w-full mt-2 rounded bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/ontology-causal/evolve", { graph_id: "onto_01", evolution_type: vEvoType, new_facts: vNewFacts.split(",").map(s => s.trim()).filter(Boolean), validation_required: true, max_changes: vMaxChanges })}>{loading ? "Evolving..." : "Evolve Ontology"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Evolution Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderValidate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Semantic Validation">
        <SelectField label="Validator" value={valMethod} onChange={setValMethod} options={VALIDATION_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Scope</label>
          <select className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={valScope} onChange={(e) => setValScope(e.target.value)}>
            <option value="full">Full</option>
            <option value="partial">Partial</option>
            <option value="incremental">Incremental</option>
          </select>
        </div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Severity Threshold</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={valSeverity} onChange={(e) => setValSeverity(+e.target.value)} /></div>
        <div className="mb-3 flex items-center gap-2">
          <input type="checkbox" id="autoFix" checked={valAutoFix} onChange={(e) => setValAutoFix(e.target.checked)} className="rounded" />
          <label htmlFor="autoFix" className="text-xs text-gray-600 dark:text-gray-400">Auto Fix</label>
        </div>
        <button className="w-full mt-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/ontology-causal/validate", { graph_id: "onto_01", validator: valMethod, scope: valScope, severity_threshold: valSeverity, auto_fix: valAutoFix })}>{loading ? "Validating..." : "Validate Semantics"}</button>
      </Card>
      <div className="lg:col-span-2">
        {result && <Card title="Validation Results"><JsonBlock data={result} /></Card>}
      </div>
    </div>
  );

  const renderOverview = () => {
    const allEnums: Record<string, string[]> = {
      OntologyConstruction: CONSTRUCTION_METHODS,
      ConceptExtraction: EXTRACTION_METHODS,
      OntologyAlignment: ALIGNMENT_STRATEGIES,
      OntologyReasoning: REASONING_STRATEGIES,
      OntologyEvolution: EVOLUTION_TYPES,
      SemanticValidation: VALIDATION_METHODS,
    };
    return (
      <div className="space-y-4">
        <Card title="Engine Metadata">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center"><div className="text-lg font-bold text-blue-600">v1.239.0</div><div className="text-xs text-gray-500">Version</div></div>
            <div className="text-center"><div className="text-lg font-bold text-emerald-600">7</div><div className="text-xs text-gray-500">Endpoints</div></div>
            <div className="text-center"><div className="text-lg font-bold text-amber-600">6</div><div className="text-xs text-gray-500">Enums</div></div>
            <div className="text-center"><div className="text-lg font-bold text-purple-600">36</div><div className="text-xs text-gray-500">Enum Values</div></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Automatic ontology construction, concept extraction, alignment, reasoning, evolution, and semantic validation from causal knowledge graphs.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge text="Ontology Construction" color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
            <Badge text="Concept Extraction" color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
            <Badge text="Ontology Alignment" color="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300" />
            <Badge text="Ontology Reasoning" color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
            <Badge text="Ontology Evolution" color="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" />
            <Badge text="Semantic Validation" color="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" />
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
              <div className="text-xs font-medium text-gray-500">Temporal Dynamics</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.238</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Adversarial Robustness</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.237</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Program Synthesis</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.236</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Causal Discovery</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.219</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const tabRenderers: Record<Tab, () => React.ReactNode> = {
    Build: renderBuild,
    Extract: renderExtract,
    Align: renderAlign,
    Reason: renderReason,
    Evolve: renderEvolve,
    Validate: renderValidate,
    Overview: renderOverview,
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-100">
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Graph Causal Ontology Learning</h1>
        <p className="text-sm text-gray-400 mt-1">v1.239.0 &mdash; Ontology construction, concept extraction, alignment, reasoning, evolution & semantic validation</p>
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
