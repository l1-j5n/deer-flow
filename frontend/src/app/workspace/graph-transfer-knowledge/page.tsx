"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.243 backend
const TRANSFER_METHODS = ["instance_transfer", "feature_transfer", "parameter_transfer", "relational_transfer", "graph_transfer", "knowledge_distillation"];
const TRANSFER_TYPES = ["positive", "zero", "negative", "discrepancy"];
const ADAPTATION_STRATEGIES = ["domain_adversarial", "causal_alignment", "disentanglement", "invariant_risk", "target_adaptation"];
const KNOWLEDGE_TYPES = ["structure", "mechanism", "weights", "intervention_effect"];
const EVALUATION_METRICS = ["structural_similarity", "causal_consistency", "target_performance", "source_retention"];
const SIMILARITY_METRICS = ["edit_distance", "graph_kernel", "spectral", "motif_based", "path_based", "information_theoretic"];

const TABS = ["Transfer", "Align", "Extract", "Adapt", "Evaluate", "NegTransfer", "Overview"] as const;
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

export default function GraphTransferKnowledgePage() {
  const [tab, setTab] = useState<Tab>("Transfer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Transfer state
  const [srcDomain, setSrcDomain] = useState("medical");
  const [tgtDomain, setTgtDomain] = useState("finance");
  const [tfMethod, setTfMethod] = useState("graph_transfer");
  const [tfKTypes, setTfKTypes] = useState<string[]>(["structure", "mechanism", "weights"]);
  const [tfMaxIter, setTfMaxIter] = useState(100);

  // Align state
  const [alignSrc, setAlignSrc] = useState("medical");
  const [alignTgt, setAlignTgt] = useState("finance");
  const [alignStrategy, setAlignStrategy] = useState("causal_alignment");
  const [alignMetric, setAlignMetric] = useState("graph_kernel");
  const [alignThreshold, setAlignThreshold] = useState(0.7);

  // Extract state
  const [extractDomain, setExtractDomain] = useState("medical");
  const [extractTypes, setExtractTypes] = useState<string[]>(["structure", "mechanism", "weights", "intervention_effect"]);
  const [extractDepth, setExtractDepth] = useState(3);

  // Adapt state
  const [adaptSrc, setAdaptSrc] = useState("medical");
  const [adaptTgt, setAdaptTgt] = useState("finance");
  const [adaptStrategy, setAdaptStrategy] = useState("target_adaptation");
  const [adaptSamples, setAdaptSamples] = useState(50);
  const [adaptReg, setAdaptReg] = useState(0.1);

  // Evaluate state
  const [evalSrc, setEvalSrc] = useState("medical");
  const [evalTgt, setEvalTgt] = useState("finance");
  const [evalMetrics, setEvalMetrics] = useState<string[]>(["structural_similarity", "causal_consistency", "target_performance", "source_retention"]);

  // NegTransfer state
  const [negSrc, setNegSrc] = useState("medical");
  const [negTgt, setNegTgt] = useState("finance");
  const [negThreshold, setNegThreshold] = useState(0.5);

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

  const renderTransfer = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Transfer Knowledge">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Source Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={srcDomain} onChange={(e) => setSrcDomain(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={tgtDomain} onChange={(e) => setTgtDomain(e.target.value)} /></div>
        <SelectField label="Transfer Method" value={tfMethod} onChange={setTfMethod} options={TRANSFER_METHODS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Knowledge Types</label>
          <div className="flex flex-wrap gap-1">
            {KNOWLEDGE_TYPES.map((kt) => (
              <button key={kt} onClick={() => toggleItem(tfKTypes, kt, setTfKTypes)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${tfKTypes.includes(kt) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>
                {kt.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Iterations</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={tfMaxIter} onChange={(e) => setTfMaxIter(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/transfer-knowledge/transfer", { source_domain: srcDomain, target_domain: tgtDomain, transfer_method: tfMethod, knowledge_types: tfKTypes, max_iterations: tfMaxIter })}>{loading ? "Transferring..." : "Transfer Knowledge"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "transfer_quality" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const metrics = d.transfer_metrics as Record<string, number>;
          const ttype = d.transfer_type as string;
          const typeColor = ttype === "positive" ? "bg-emerald-900 text-emerald-300" : (ttype === "negative" ? "bg-red-900 text-red-300" : "bg-amber-900 text-amber-300");
          return (<>
            <Card title="Transfer Summary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(d.source_causal_nodes ?? 0)}</div><div className="text-xs text-gray-500">Source Nodes</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(d.target_causal_nodes ?? 0)}</div><div className="text-xs text-gray-500">Target Nodes</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(d.transferred_nodes ?? 0)}</div><div className="text-xs text-gray-500">Transferred</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(d.transferred_edges ?? 0)}</div><div className="text-xs text-gray-500">Edges</div></div>
              </div>
              <div className="flex gap-2 mb-3">
                <Badge text={`Quality: ${(d.transfer_quality as number)?.toFixed(4) ?? "-"}`} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                <Badge text={`Type: ${ttype}`} color={typeColor} />
                <Badge text={d.converged ? "Converged" : "Not Converged"} color={d.converged ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"} />
              </div>
              {metrics && <>
                <StatBar label="Source Coverage" value={metrics.source_coverage ?? 0} color="bg-blue-500" />
                <StatBar label="Target Applicability" value={metrics.target_applicability ?? 0} color="bg-emerald-500" />
                <StatBar label="Semantic Preservation" value={metrics.semantic_preservation ?? 0} color="bg-amber-500" />
                <StatBar label="Structural Fidelity" value={metrics.structural_fidelity ?? 0} color="bg-purple-500" />
              </>}
            </Card>
            <Card title="Knowledge Items"><JsonBlock data={d.knowledge_transferred} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderAlign = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Domain Alignment">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Source Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={alignSrc} onChange={(e) => setAlignSrc(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={alignTgt} onChange={(e) => setAlignTgt(e.target.value)} /></div>
        <SelectField label="Adaptation Strategy" value={alignStrategy} onChange={setAlignStrategy} options={ADAPTATION_STRATEGIES} />
        <SelectField label="Similarity Metric" value={alignMetric} onChange={setAlignMetric} options={SIMILARITY_METRICS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Alignment Threshold</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={alignThreshold} onChange={(e) => setAlignThreshold(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/transfer-knowledge/align-domains", { source_domain: alignSrc, target_domain: alignTgt, adaptation_strategy: alignStrategy, similarity_metric: alignMetric, alignment_threshold: alignThreshold })}>{loading ? "Aligning..." : "Align Domains"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "alignment_score" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return (<>
            <Card title="Alignment Summary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{(d.alignment_score as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Alignment Score</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{(d.domain_distance as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Domain Distance</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{(d.aligned_concepts as unknown[])?.length ?? 0}</div><div className="text-xs text-gray-500">Aligned Concepts</div></div>
                <div className="text-center"><div className="text-lg font-bold text-red-600">{(d.conflicting_concepts as unknown[])?.length ?? 0}</div><div className="text-xs text-gray-500">Conflicts</div></div>
              </div>
              <div className="flex gap-2 mb-3">
                <Badge text={`Invariant: ${(d.invariant_features as string[])?.length ?? 0}`} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                <Badge text={`Domain-Specific: ${(d.domain_specific_features as string[])?.length ?? 0}`} color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />
              </div>
            </Card>
            <Card title="Aligned Concepts"><JsonBlock data={d.aligned_concepts} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderExtract = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Knowledge Extraction">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={extractDomain} onChange={(e) => setExtractDomain(e.target.value)} /></div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Extraction Types</label>
          <div className="flex flex-wrap gap-1">
            {KNOWLEDGE_TYPES.map((kt) => (
              <button key={kt} onClick={() => toggleItem(extractTypes, kt, setExtractTypes)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${extractTypes.includes(kt) ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>
                {kt.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Depth</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={extractDepth} onChange={(e) => setExtractDepth(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/transfer-knowledge/extract-knowledge", { domain: extractDomain, extraction_types: extractTypes, depth: extractDepth })}>{loading ? "Extracting..." : "Extract Knowledge"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "extraction_quality" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return (<>
            <Card title="Extraction Summary">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(d.total_knowledge_items ?? 0)}</div><div className="text-xs text-gray-500">Total Items</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{(d.extraction_quality as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Quality</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(d.domain)}</div><div className="text-xs text-gray-500">Domain</div></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded"><span className="font-medium text-blue-700 dark:text-blue-300">Structures:</span> {(d.structures as unknown[])?.length ?? 0}</div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded"><span className="font-medium text-emerald-700 dark:text-emerald-300">Mechanisms:</span> {(d.mechanisms as unknown[])?.length ?? 0}</div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded"><span className="font-medium text-purple-700 dark:text-purple-300">Weights:</span> {(d.weights as unknown[])?.length ?? 0}</div>
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded"><span className="font-medium text-amber-700 dark:text-amber-300">Effects:</span> {(d.intervention_effects as unknown[])?.length ?? 0}</div>
              </div>
            </Card>
            <Card title="Extracted Structures"><JsonBlock data={d.structures} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderAdapt = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Target Adaptation">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Source Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adaptSrc} onChange={(e) => setAdaptSrc(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adaptTgt} onChange={(e) => setAdaptTgt(e.target.value)} /></div>
        <SelectField label="Adaptation Strategy" value={adaptStrategy} onChange={setAdaptStrategy} options={ADAPTATION_STRATEGIES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Samples</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adaptSamples} onChange={(e) => setAdaptSamples(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Regularization</label><input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adaptReg} onChange={(e) => setAdaptReg(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/transfer-knowledge/adapt-target", { source_domain: adaptSrc, target_domain: adaptTgt, adaptation_strategy: adaptStrategy, target_samples: adaptSamples, regularization: adaptReg })}>{loading ? "Adapting..." : "Adapt to Target"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "performance_gain" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          return (<>
            <Card title="Adaptation Summary">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(d.adapted_nodes ?? 0)}</div><div className="text-xs text-gray-500">Adapted Nodes</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(d.adapted_edges ?? 0)}</div><div className="text-xs text-gray-500">Adapted Edges</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{(d.performance_gain as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Performance Gain</div></div>
              </div>
              <StatBar label="Adaptation Loss" value={d.adaptation_loss as number} color="bg-red-500" />
              <StatBar label="Source Retention" value={d.source_retention as number} color="bg-emerald-500" />
            </Card>
            <Card title="Adaptation Log"><JsonBlock data={d.adaptation_log} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderEvaluate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Transfer Evaluation">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Source Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evalSrc} onChange={(e) => setEvalSrc(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evalTgt} onChange={(e) => setEvalTgt(e.target.value)} /></div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Evaluation Metrics</label>
          <div className="flex flex-wrap gap-1">
            {EVALUATION_METRICS.map((m) => (
              <button key={m} onClick={() => toggleItem(evalMetrics, m, setEvalMetrics)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${evalMetrics.includes(m) ? "bg-amber-600 text-white border-amber-600" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>
                {m.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <button className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/transfer-knowledge/evaluate", { source_domain: evalSrc, target_domain: evalTgt, evaluation_metrics: evalMetrics })}>{loading ? "Evaluating..." : "Evaluate Transfer"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "overall_score" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const scores = d.metric_scores as Record<string, number>;
          const qualityColor = d.transfer_quality === "excellent" ? "bg-emerald-900 text-emerald-300" : (d.transfer_quality === "good" ? "bg-blue-900 text-blue-300" : (d.transfer_quality === "moderate" ? "bg-amber-900 text-amber-300" : "bg-red-900 text-red-300"));
          return (<>
            <Card title="Evaluation Summary">
              <div className="flex gap-3 mb-4">
                <div className="text-center flex-1"><div className="text-2xl font-bold text-blue-600">{(d.overall_score as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Overall Score</div></div>
                <Badge text={`Quality: ${String(d.transfer_quality)}`} color={qualityColor} />
              </div>
              {scores && Object.entries(scores).map(([k, v]) => (
                <StatBar key={k} label={k.replace(/_/g, " ")} value={v} color={v > 0.7 ? "bg-emerald-500" : (v > 0.5 ? "bg-amber-500" : "bg-red-500")} />
              ))}
            </Card>
            <Card title="Recommendations">
              <ul className="space-y-1">
                {((d.recommendations as string[]) ?? []).map((r, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">&#9679;</span> {r}
                  </li>
                ))}
              </ul>
            </Card>
            <Card title="Detailed Analysis"><JsonBlock data={{ structural: d.structural_analysis, causal: d.causal_analysis, performance: d.performance_analysis, retention: d.retention_analysis }} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderNegTransfer = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Negative Transfer Detection">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Source Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={negSrc} onChange={(e) => setNegSrc(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={negTgt} onChange={(e) => setNegTgt(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Detection Threshold</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={negThreshold} onChange={(e) => setNegThreshold(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/transfer-knowledge/negative-transfer", { source_domain: negSrc, target_domain: negTgt, detection_threshold: negThreshold })}>{loading ? "Detecting..." : "Detect Negative Transfer"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "risk_score" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const isNeg = d.is_negative_transfer as boolean;
          return (<>
            <Card title="Detection Result">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className={`text-lg font-bold ${isNeg ? "text-red-600" : "text-emerald-600"}`}>{isNeg ? "NEGATIVE" : "SAFE"}</div><div className="text-xs text-gray-500">Transfer Status</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{(d.risk_score as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Risk Score</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{(d.conflict_nodes as unknown[])?.length ?? 0}</div><div className="text-xs text-gray-500">Node Conflicts</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{(d.conflict_edges as unknown[])?.length ?? 0}</div><div className="text-xs text-gray-500">Edge Conflicts</div></div>
              </div>
              <StatBar label="Domain Shift" value={d.domain_shift as number} color="bg-amber-500" />
            </Card>
            <Card title="Mitigation Strategies"><JsonBlock data={d.mitigation_strategies} /></Card>
            <Card title="Semantic Conflicts"><JsonBlock data={d.semantic_conflicts} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderOverview = () => {
    const allEnums: Record<string, string[]> = {
      TransferMethod: TRANSFER_METHODS,
      TransferType: TRANSFER_TYPES,
      DomainAdaptationStrategy: ADAPTATION_STRATEGIES,
      KnowledgeExtractionType: KNOWLEDGE_TYPES,
      TransferEvaluation: EVALUATION_METRICS,
      CausalSimilarity: SIMILARITY_METRICS,
    };
    return (
      <div className="space-y-4">
        <Card title="Engine Metadata">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center"><div className="text-lg font-bold text-blue-600">v1.243.0</div><div className="text-xs text-gray-500">Version</div></div>
            <div className="text-center"><div className="text-lg font-bold text-emerald-600">7</div><div className="text-xs text-gray-500">Endpoints</div></div>
            <div className="text-center"><div className="text-lg font-bold text-amber-600">6</div><div className="text-xs text-gray-500">Enums</div></div>
            <div className="text-center"><div className="text-lg font-bold text-purple-600">29</div><div className="text-xs text-gray-500">Enum Values</div></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Graph Causal Transfer Learning engine — cross-domain causal knowledge transfer with domain adaptation, negative transfer detection, and multi-level knowledge extraction.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge text="Knowledge Transfer" color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
            <Badge text="Domain Alignment" color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
            <Badge text="Knowledge Extraction" color="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300" />
            <Badge text="Target Adaptation" color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />
            <Badge text="Transfer Evaluation" color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
            <Badge text="Negative Transfer Detection" color="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" />
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
              <div className="text-xs font-medium text-gray-500">Federated CF</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.242</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">NAS Causal</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.241</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Quantum Opt</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.240</div>
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
    Transfer: renderTransfer,
    Align: renderAlign,
    Extract: renderExtract,
    Adapt: renderAdapt,
    Evaluate: renderEvaluate,
    NegTransfer: renderNegTransfer,
    Overview: renderOverview,
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-100">
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Graph Causal Transfer Learning</h1>
        <p className="text-sm text-gray-400 mt-1">v1.243.0 &mdash; Cross-domain causal knowledge transfer with domain adaptation, negative transfer detection &amp; multi-level knowledge extraction</p>
        <div className="flex gap-2 mt-2">
          <Badge text="6 Enums" color="bg-blue-900 text-blue-300" />
          <Badge text="7 Endpoints" color="bg-emerald-900 text-emerald-300" />
          <Badge text="29 Values" color="bg-purple-900 text-purple-300" />
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
