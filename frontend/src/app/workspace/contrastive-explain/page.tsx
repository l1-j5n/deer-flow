"use client";

import { useState } from "react";

const API = "/api/graph";

const ATTRIBUTION_METHODS = ["integrated_gradients", "gradcam", "shap", "lime", "attention_rollout", "perturbation"];
const PAIR_TYPES = ["feature_alignment", "structural_match", "semantic_proximity", "augmentation_path", "prototype_similarity", "decision_boundary"];
const AUGMENTATION_TYPES = ["node_drop", "edge_perturbation", "attribute_mask", "subgraph_sample", "feature_shuffle", "identity"];
const CONCEPT_METHODS = ["clustering", "pca_components", "disentanglement", "matrix_factorization", "prototype_network", "hierarchical"];
const FAIRNESS_DIMS = ["demographic_parity", "equalized_odds", "calibration", "disparate_impact", "individual_fairness", "counterfactual_fairness"];
const STRUCTURE_ASPECTS = ["neighborhood_influence", "path_importance", "community_effect", "centrality_impact", "hierarchical_role", "motif_contribution"];

const TABS = ["Attribution", "Pairwise", "Augmentation", "Concept", "Fairness", "Structure", "Summary"] as const;
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

export default function ContrastiveExplainPage() {
  const [tab, setTab] = useState<Tab>("Attribution");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const [attrMethod, setAttrMethod] = useState("integrated_gradients");
  const [attrSteps, setAttrSteps] = useState(50);
  const [attrBaseline, setAttrBaseline] = useState("zero");
  const [attrAgg, setAttrAgg] = useState("mean");

  const [pairType, setPairType] = useState("feature_alignment");
  const [pairCount, setPairCount] = useState(10);
  const [pairDim, setPairDim] = useState(128);
  const [pairTemp, setPairTemp] = useState(0.07);

  const [augType, setAugType] = useState("node_drop");
  const [augViews, setAugViews] = useState(4);
  const [augStrength, setAugStrength] = useState(0.5);

  const [cptMethod, setCptMethod] = useState("clustering");
  const [cptCount, setCptCount] = useState(10);
  const [cptGran, setCptGran] = useState("medium");

  const [fairDim, setFairDim] = useState("demographic_parity");
  const [fairThreshold, setFairThreshold] = useState(0.8);
  const [fairGroups, setFairGroups] = useState(2);

  const [strAspect, setStrAspect] = useState("neighborhood_influence");
  const [strNodes, setStrNodes] = useState(20);
  const [strDepth, setStrDepth] = useState(3);

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true); setResult(null);
    try { const r = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setResult(await r.json()); }
    catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const renderAttribution = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Attribution Analysis">
        <SelectField label="Method" value={attrMethod} onChange={setAttrMethod} options={ATTRIBUTION_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Steps</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={attrSteps} onChange={(e) => setAttrSteps(+e.target.value)} /></div>
        <SelectField label="Baseline" value={attrBaseline} onChange={setAttrBaseline} options={["zero", "uniform", "random", "blurred"]} />
        <SelectField label="Aggregation" value={attrAgg} onChange={setAttrAgg} options={["mean", "sum", "max", "min"]} />
        <button className="w-full mt-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/contrastive-explain/attribution", { graph_id: "attr_01", method: attrMethod, target_nodes: Array.from({ length: 10 }, (_, i) => `node_${i}`), baseline_type: attrBaseline, num_steps: attrSteps, aggregation: attrAgg })}>{loading ? "Computing..." : "Run Attribution"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "node_attributions" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const nodes = (d.node_attributions || []) as Array<Record<string, unknown>>;
          const stability = d.stability as Record<string, unknown>;
          const summary = d.summary as Record<string, unknown>;
          return (<>
            <Card title="Node Attribution Scores">
              <div className="space-y-1">{nodes.slice(0, 8).map((n, i) => (<div key={i} className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5"><span className="font-mono w-20">{String(n.node_id)}</span><span>Score: <strong>{String(n.attribution_score)}</strong></span><Badge text={`#${String(n.rank)}`} color="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" /><span>Conf: {String(n.confidence)}</span></div>))}</div>
            </Card>
            <Card title="Stability & Summary">
              <StatBar label="Mean Stability" value={Number(stability?.mean_stability || 0)} color="bg-indigo-500" />
              <div className="grid grid-cols-3 gap-3 text-center text-xs mt-2">
                <div><span className="text-gray-500">Nodes Scored</span><div className="font-mono font-bold text-indigo-600">{String(summary?.total_nodes_scored)}</div></div>
                <div><span className="text-gray-500">Edges Scored</span><div className="font-mono font-bold text-blue-600">{String(summary?.total_edges_scored)}</div></div>
                <div><span className="text-gray-500">Top Node</span><div className="font-mono font-bold text-emerald-600">{String(summary?.top_node)}</div></div>
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderPairwise = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Pairwise Explanation">
        <SelectField label="Explanation Type" value={pairType} onChange={setPairType} options={PAIR_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Pairs</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={pairCount} onChange={(e) => setPairCount(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Embedding Dim</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={pairDim} onChange={(e) => setPairDim(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Temperature</label><input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={pairTemp} onChange={(e) => setPairTemp(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/contrastive-explain/pairwise", { graph_id: "pair_01", explanation_type: pairType, num_pairs: pairCount, embedding_dim: pairDim, temperature: pairTemp })}>{loading ? "Analyzing..." : "Explain Pairs"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "positive_pairs" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const posPairs = (d.positive_pairs || []) as Array<Record<string, unknown>>;
          const negPairs = (d.negative_pairs || []) as Array<Record<string, unknown>>;
          const global = d.global_analysis as Record<string, unknown>;
          const recs = d.recommendations as Record<string, unknown>;
          return (<>
            <Card title="Global Metrics">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(global?.mean_positive_similarity)}</div><div className="text-xs text-gray-500">Pos Similarity</div></div>
                <div className="text-center"><div className="text-lg font-bold text-rose-600">{String(global?.mean_negative_similarity)}</div><div className="text-xs text-gray-500">Neg Similarity</div></div>
                <div className="text-center"><div className="text-lg font-bold text-indigo-600">{String(global?.alignment)}</div><div className="text-xs text-gray-500">Alignment</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(global?.uniformity)}</div><div className="text-xs text-gray-500">Uniformity</div></div>
              </div>
            </Card>
            <Card title="Positive Pairs (Top 5)">
              <div className="space-y-1">{posPairs.slice(0, 5).map((p, i) => (<div key={i} className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><span className="font-mono">{String(p.node_a)}↔{String(p.node_b)}</span><span>Sim: {String(p.cosine_similarity)}</span><Badge text={`${String(p.contributing_features)}`} color="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" /></div>))}</div>
            </Card>
            <Card title="Recommendations">
              <div className="text-xs space-y-1">
                <div>Optimal Temperature: {String(recs?.optimal_temperature)}</div>
                <div>Suggested Neg Ratio: {String(recs?.suggested_neg_ratio)}</div>
                <div>Augmentation Strength: {String(recs?.augmentation_strength)}</div>
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderAugmentation = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Augmentation Sensitivity">
        <SelectField label="Augmentation" value={augType} onChange={setAugType} options={AUGMENTATION_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Views</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={augViews} onChange={(e) => setAugViews(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Perturbation Strength</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={augStrength} onChange={(e) => setAugStrength(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/contrastive-explain/augmentation", { graph_id: "aug_01", augmentation: augType, num_views: augViews, perturbation_strength: augStrength })}>{loading ? "Analyzing..." : "Analyze Augmentation"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "view_effects" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const views = (d.view_effects || []) as Array<Record<string, unknown>>;
          const ranking = (d.importance_ranking || []) as Array<Record<string, unknown>>;
          const sensSummary = d.sensitivity_summary as Record<string, unknown>;
          const rec = d.recommendation as Record<string, unknown>;
          return (<>
            <Card title="View Effects">
              <div className="space-y-1">{views.map((v, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><span>View {String(v.view_id)}</span><span>Shift: {String(v.representation_shift)}</span><span>Stability: {String(v.cosine_stability)}</span><span>Info: {String(v.information_preserved)}</span></div>))}</div>
            </Card>
            <Card title="Augmentation Importance Ranking">
              <div className="space-y-1">{ranking.map((a, i) => (<div key={i} className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><Badge text={String(a.augmentation)} color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" /><StatBar label="" value={Number(a.importance || 0)} color="bg-amber-500" /></div>))}</div>
            </Card>
            <Card title="Summary & Recommendations">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center"><div className="text-sm font-bold text-amber-600">{String(sensSummary?.mean_shift)}</div><div className="text-xs text-gray-500">Mean Shift</div></div>
                <div className="text-center"><div className="text-sm font-bold text-emerald-600">{String(sensSummary?.stability_index)}</div><div className="text-xs text-gray-500">Stability Index</div></div>
              </div>
              <div className="text-xs">Optimal Strength: {String(rec?.optimal_strength)} | Best Combo: {JSON.stringify(rec?.best_combo)}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderConcept = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Concept Discovery">
        <SelectField label="Method" value={cptMethod} onChange={setCptMethod} options={CONCEPT_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Concepts</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cptCount} onChange={(e) => setCptCount(+e.target.value)} /></div>
        <SelectField label="Granularity" value={cptGran} onChange={setCptGran} options={["fine", "medium", "coarse"]} />
        <button className="w-full mt-2 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/contrastive-explain/concept", { graph_id: "cpt_01", method: cptMethod, num_concepts: cptCount, representation_dim: 128, granularity: cptGran })}>{loading ? "Discovering..." : "Discover Concepts"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "concepts" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const concepts = (d.concepts || []) as Array<Record<string, unknown>>;
          const quality = d.quality_summary as Record<string, unknown>;
          const interp = d.interpretation as Record<string, unknown>;
          return (<>
            <Card title="Discovered Concepts">
              <div className="space-y-1">{concepts.slice(0, 8).map((c, i) => (<div key={i} className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5"><Badge text={String(c.concept_name)} color="bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300" /><span>Purity: {String(c.purity)}</span><span>Complete: {String(c.completeness)}</span><span>Prev: {String(c.prevalence)}</span></div>))}</div>
            </Card>
            <Card title="Quality & Interpretation">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center"><div className="text-sm font-bold text-violet-600">{String(quality?.mean_purity)}</div><div className="text-xs text-gray-500">Mean Purity</div></div>
                <div className="text-center"><div className="text-sm font-bold text-purple-600">{String(quality?.concept_diversity)}</div><div className="text-xs text-gray-500">Concept Diversity</div></div>
              </div>
              <div className="text-xs">Top: {String(interp?.top_concept)} | Pattern: {String(interp?.dominant_pattern)} | Novelty: {String(interp?.novelty_score)}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderFairness = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Fairness Audit">
        <SelectField label="Dimension" value={fairDim} onChange={setFairDim} options={FAIRNESS_DIMS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Threshold</label><input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fairThreshold} onChange={(e) => setFairThreshold(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Groups</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fairGroups} onChange={(e) => setFairGroups(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/contrastive-explain/fairness", { graph_id: "fair_01", dimension: fairDim, sensitive_attributes: ["gender", "age_group"], threshold: fairThreshold, num_groups: fairGroups })}>{loading ? "Auditing..." : "Audit Fairness"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "parity_score" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const groups = (d.group_analysis || []) as Array<Record<string, unknown>>;
          const layers = (d.layer_wise_bias || []) as Array<Record<string, unknown>>;
          const mitigations = (d.mitigation_recommendations || []) as Array<Record<string, unknown>>;
          const audit = d.audit_summary as Record<string, unknown>;
          return (<>
            <Card title="Audit Result">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-pink-600">{String(d.parity_score)}</div><div className="text-xs text-gray-500">Parity Score</div></div>
                <div className="text-center"><Badge text={String(d.is_fair) === "true" ? "FAIR" : "UNFAIR"} color={String(d.is_fair) === "true" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"} /></div>
                <div className="text-center"><Badge text={String(audit?.overall_fairness)} color={String(audit?.overall_fairness) === "PASS" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"} /></div>
              </div>
            </Card>
            <Card title="Group Analysis">
              <div className="space-y-1">{groups.map((g, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><span>Group {String(g.group_label)}</span><span>Size: {String(g.size)}</span><span>Pos Rate: {String(g.positive_rate)}</span><span>Quality: {String(g.mean_representation_quality)}</span></div>))}</div>
            </Card>
            <Card title="Layer-wise Bias">
              <div className="space-y-1">{layers.map((l, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><span>Layer {String(l.layer)}</span><StatBar label="" value={Number(l.bias_magnitude || 0)} max={0.2} color="bg-pink-500" /><span>Fair: {String(l.fairness_score)}</span></div>))}</div>
            </Card>
            <Card title="Mitigation Options">
              <div className="space-y-1">{mitigations.map((m, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><Badge text={String(m.strategy)} color="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" /><span>Improvement: {String(m.expected_improvement)}</span><span>Cost: {String(m.quality_cost)}</span></div>))}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderStructure = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Structural Explanation">
        <SelectField label="Aspect" value={strAspect} onChange={setStrAspect} options={STRUCTURE_ASPECTS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Nodes</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={strNodes} onChange={(e) => setStrNodes(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Depth</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={strDepth} onChange={(e) => setStrDepth(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/contrastive-explain/structure", { graph_id: "str_01", aspect: strAspect, num_nodes: strNodes, depth: strDepth })}>{loading ? "Analyzing..." : "Explain Structure"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "node_structural_scores" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const scores = (d.node_structural_scores || []) as Array<Record<string, unknown>>;
          const correlation = d.structure_quality_correlation as Record<string, unknown>;
          const summary = d.summary as Record<string, unknown>;
          const sensitivity = (d.topological_sensitivity || []) as Array<Record<string, unknown>>;
          return (<>
            <Card title="Node Structural Influence">
              <div className="space-y-1">{scores.slice(0, 8).map((n, i) => (<div key={i} className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><span className="font-mono">{String(n.node_id)}</span><Badge text={String(n.role)} color="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" /><span>Influence: {String(n.influence_score)}</span></div>))}</div>
            </Card>
            <Card title="Topology Sensitivity">
              <div className="space-y-1">{sensitivity.map((s, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><span>{String(s.perturbation)}</span><span>Rep Δ: {String(s.mean_representation_change)}</span><span>Struct Δ: {String(s.structural_impact)}</span></div>))}</div>
            </Card>
            <Card title="Quality Correlation">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div><span className="text-gray-500">Pearson</span><div className="font-mono font-bold text-teal-600">{String(correlation?.pearson_r)}</div></div>
                <div><span className="text-gray-500">Spearman</span><div className="font-mono font-bold text-blue-600">{String(correlation?.spearman_r)}</div></div>
                <div><span className="text-gray-500">MI</span><div className="font-mono font-bold text-purple-600">{String(correlation?.mutual_information)}</div></div>
              </div>
            </Card>
            <Card title="Summary">
              <div className="text-xs">Top Influential: {String(summary?.top_influential_node)} | Mean Influence: {String(summary?.mean_influence)} | Robustness: {String(summary?.robustness_index)}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div>
      <button className="rounded bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 mb-4" disabled={loading} onClick={async () => { setLoading(true); try { const r = await fetch(`${API}/contrastive-explain/summary`); setResult(await r.json()); } catch (e) { setResult({ error: String(e) }); } setLoading(false); }}>{loading ? "Loading..." : "Load Summary"}</button>
      {result && <JsonBlock data={result} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Graph Contrastive Explainability Engine</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.222 — Attribution analysis, pairwise explanation, augmentation sensitivity, concept discovery, fairness audit, and structural explanation</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (<button key={t} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === t ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`} onClick={() => { setTab(t); setResult(null); }}>{t}</button>))}
        </div>
        {tab === "Attribution" && renderAttribution()}
        {tab === "Pairwise" && renderPairwise()}
        {tab === "Augmentation" && renderAugmentation()}
        {tab === "Concept" && renderConcept()}
        {tab === "Fairness" && renderFairness()}
        {tab === "Structure" && renderStructure()}
        {tab === "Summary" && renderSummary()}
      </div>
    </div>
  );
}
