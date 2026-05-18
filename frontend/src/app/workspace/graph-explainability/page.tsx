"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const EXPLAIN_METHODS = [
  { value: "gradient", label: "Gradient" },
  { value: "integrated_grad", label: "Integrated Grad" },
  { value: "gnn_explainer", label: "GNNExplainer" },
  { value: "pg_explainer", label: "PGExplainer" },
  { value: "gradcam", label: "GradCAM" },
  { value: "lrp", label: "LRP" },
  { value: "shapley", label: "Shapley" },
];

const TARGETS = [
  { value: "node", label: "Node" },
  { value: "edge", label: "Edge" },
  { value: "feature", label: "Feature" },
  { value: "subgraph", label: "Subgraph" },
];

const CONCEPT_TYPES = [
  { value: "motif", label: "Motif" },
  { value: "subgraph", label: "Subgraph" },
  { value: "path", label: "Path" },
  { value: "community", label: "Community" },
  { value: "structure", label: "Structure" },
];

const CF_STRATEGIES = [
  { value: "minimal_edit", label: "Minimal Edit" },
  { value: "node_removal", label: "Node Removal" },
  { value: "edge_removal", label: "Edge Removal" },
  { value: "feature_edit", label: "Feature Edit" },
  { value: "subgraph_replace", label: "Subgraph Replace" },
];

export default function GraphExplainabilityPage() {
  const [activeTab, setActiveTab] = useState("attribution");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Attribution
  const [explainMethod, setExplainMethod] = useState("gnn_explainer");
  const [attributionTarget, setAttributionTarget] = useState("node");
  const [targetIndex, setTargetIndex] = useState(0);
  const [numSteps, setNumSteps] = useState(50);
  const [attributionResult, setAttributionResult] = useState<any>(null);

  // Node importance
  const [nodeMethod, setNodeMethod] = useState("gnn_explainer");
  const [targetNode, setTargetNode] = useState(0);
  const [topK, setTopK] = useState(10);
  const [nodeResult, setNodeResult] = useState<any>(null);

  // Edge importance
  const [edgeMethod, setEdgeMethod] = useState("pg_explainer");
  const [edgeThreshold, setEdgeThreshold] = useState(0.1);
  const [edgeTopK, setEdgeTopK] = useState(10);
  const [edgeResult, setEdgeResult] = useState<any>(null);

  // Feature importance
  const [featMethod, setFeatMethod] = useState("integrated_grad");
  const [numFeatures, setNumFeatures] = useState(4);
  const [featResult, setFeatResult] = useState<any>(null);

  // Subgraph
  const [subgraphNode, setSubgraphNode] = useState(0);
  const [maxHops, setMaxHops] = useState(3);
  const [sparsityTarget, setSparsityTarget] = useState(0.5);
  const [subgraphResult, setSubgraphResult] = useState<any>(null);

  // GradCAM
  const [camTargetLayer, setCamTargetLayer] = useState(-1);
  const [camClassIndex, setCamClassIndex] = useState(0);
  const [gradcamResult, setGradcamResult] = useState<any>(null);

  // Integrated Gradients
  const [igTargetNode, setIgTargetNode] = useState(0);
  const [igSteps, setIgSteps] = useState(50);
  const [igResult, setIgResult] = useState<any>(null);

  // Concept
  const [conceptType, setConceptType] = useState("motif");
  const [numConcepts, setNumConcepts] = useState(5);
  const [minSupport, setMinSupport] = useState(3);
  const [conceptResult, setConceptResult] = useState<any>(null);

  // Prototype
  const [numPrototypes, setNumPrototypes] = useState(3);
  const [protoSize, setProtoSize] = useState(5);
  const [protoResult, setProtoResult] = useState<any>(null);

  // Counterfactual
  const [cfStrategy, setCfStrategy] = useState("minimal_edit");
  const [cfTargetClass, setCfTargetClass] = useState(1);
  const [cfMaxEdits, setCfMaxEdits] = useState(5);
  const [cfResult, setCfResult] = useState<any>(null);

  // Contrastive
  const [contrastClassA, setContrastClassA] = useState(0);
  const [contrastClassB, setContrastClassB] = useState(1);
  const [contrastResult, setContrastResult] = useState<any>(null);

  // Benchmark
  const [benchResult, setBenchResult] = useState<any>(null);

  // Compare
  const [compareMethodA, setCompareMethodA] = useState("gnn_explainer");
  const [compareMethodB, setCompareMethodB] = useState("gradcam");
  const [compareResult, setCompareResult] = useState<any>(null);

  const callApi = async (endpoint: string, params: any, setter: (v: any) => void) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...params }),
      });
      setter(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const renderJson = (data: any) => (
    <pre className="bg-gray-950 text-green-400 p-3 rounded text-xs overflow-auto max-h-96 mt-2">
      {JSON.stringify(data, null, 2)}
    </pre>
  );

  const renderTopK = (items: any[], labelField: string, scoreField: string) => (
    <div className="grid grid-cols-2 gap-2 mt-2">
      {items?.map((item: any, i: number) => (
        <div key={i} className="flex items-center justify-between bg-gray-900 px-3 py-1.5 rounded">
          <span className="text-sm text-gray-300">{item[labelField]}</span>
          <Badge variant={item[scoreField] > 0.7 ? "default" : "secondary"}>
            {typeof item[scoreField] === "number" ? item[scoreField].toFixed(4) : item[scoreField]}
          </Badge>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Explainability</h1>
          <p className="text-sm text-gray-500">v1.83 — Explain, attribute, and interpret graph model predictions</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-sm">Graph ID</Label>
          <Input className="w-32" value={graphId} onChange={e => setGraphId(e.target.value)} />
        </div>
      </div>

      {error && <div className="bg-red-900/50 text-red-200 p-2 rounded text-sm">{error}</div>}
      {loading && <div className="text-sm text-yellow-400 animate-pulse">Computing explanation...</div>}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
          <TabsTrigger value="discovery">Concept & Prototype</TabsTrigger>
          <TabsTrigger value="counterfactual">Counterfactual & Contrast</TabsTrigger>
        </TabsList>

        {/* === ATTRIBUTION TAB === */}
        <TabsContent value="attribution" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">

            {/* General Attribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Attribution</CardTitle>
                <CardDescription>General attribution by method & target</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Method</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={explainMethod} onChange={e => setExplainMethod(e.target.value)}>
                      {EXPLAIN_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Target</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={attributionTarget} onChange={e => setAttributionTarget(e.target.value)}>
                      {TARGETS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Target Index</Label>
                  <Input type="number" value={targetIndex} onChange={e => setTargetIndex(+e.target.value)} />
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/attribution", {
                  method: explainMethod, target: attributionTarget, target_index: targetIndex, num_steps: numSteps,
                }, setAttributionResult)}>Run Attribution</Button>
                {attributionResult && (
                  <>
                    {attributionResult.top_k_nodes && renderTopK(attributionResult.top_k_nodes, "node", "score")}
                    {attributionResult.top_edges && renderTopK(attributionResult.top_edges, "edge", "score")}
                    {attributionResult.ranking && renderTopK(attributionResult.ranking, "feature", "score")}
                    {renderJson(attributionResult)}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Node Importance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Node Importance</CardTitle>
                <CardDescription>Rank nodes by predictive importance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-xs">Method</Label>
                  <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={nodeMethod} onChange={e => setNodeMethod(e.target.value)}>
                    {EXPLAIN_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Target Node</Label>
                    <Input type="number" value={targetNode} onChange={e => setTargetNode(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Top K</Label>
                    <Input type="number" value={topK} onChange={e => setTopK(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/node-importance", {
                  method: nodeMethod, target_node: targetNode, top_k: topK,
                }, setNodeResult)}>Run</Button>
                {nodeResult?.top_k && (
                  <>
                    <div className="text-xs text-gray-400 mt-1">
                      Mean: {nodeResult.statistics?.mean_importance} | Max: {nodeResult.statistics?.max_importance}
                    </div>
                    {renderTopK(nodeResult.top_k, "node", "importance")}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Edge Importance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Edge Importance</CardTitle>
                <CardDescription>Score edge contributions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <Label className="text-xs">Method</Label>
                  <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={edgeMethod} onChange={e => setEdgeMethod(e.target.value)}>
                    {EXPLAIN_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Threshold</Label>
                    <Input type="number" step="0.05" value={edgeThreshold} onChange={e => setEdgeThreshold(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Top K</Label>
                    <Input type="number" value={edgeTopK} onChange={e => setEdgeTopK(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/edge-importance", {
                  method: edgeMethod, threshold: edgeThreshold, top_k: edgeTopK,
                }, setEdgeResult)}>Run</Button>
                {edgeResult?.top_k && (
                  <>
                    <div className="text-xs text-gray-400">
                      Important: {edgeResult.important_edges} / {edgeResult.total_edges} edges
                    </div>
                    {renderTopK(edgeResult.top_k, "source", "importance")}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Feature Importance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Feature Importance</CardTitle>
                <CardDescription>Attribute features to predictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Method</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={featMethod} onChange={e => setFeatMethod(e.target.value)}>
                      {EXPLAIN_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Num Features</Label>
                    <Input type="number" value={numFeatures} onChange={e => setNumFeatures(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/feature-importance", {
                  method: featMethod, num_features: numFeatures,
                }, setFeatResult)}>Run</Button>
                {featResult?.ranking && renderTopK(featResult.ranking, "feature", "score")}
              </CardContent>
            </Card>

            {/* Subgraph Extraction */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Subgraph Extraction</CardTitle>
                <CardDescription>BFS-based important subgraph</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Target Node</Label>
                    <Input type="number" value={subgraphNode} onChange={e => setSubgraphNode(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Max Hops</Label>
                    <Input type="number" value={maxHops} onChange={e => setMaxHops(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Sparsity</Label>
                    <Input type="number" step="0.1" value={sparsityTarget} onChange={e => setSparsityTarget(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/subgraph-extraction", {
                  target_node: subgraphNode, max_hops: maxHops, sparsity_target: sparsityTarget,
                }, setSubgraphResult)}>Extract</Button>
                {subgraphResult && (
                  <>
                    <div className="flex gap-2 text-xs">
                      <Badge>Fidelity: {subgraphResult.fidelity}</Badge>
                      <Badge variant="outline">Sparsity: {subgraphResult.sparsity}</Badge>
                      <Badge variant="secondary">Nodes: {subgraphResult.explanation_size}</Badge>
                    </div>
                    <div className="text-xs text-gray-400">Hop distribution: {JSON.stringify(subgraphResult.hop_distribution)}</div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* GradCAM */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">GradCAM</CardTitle>
                <CardDescription>Gradient-weighted class activation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Target Layer</Label>
                    <Input type="number" value={camTargetLayer} onChange={e => setCamTargetLayer(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Class Index</Label>
                    <Input type="number" value={camClassIndex} onChange={e => setCamClassIndex(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/gradcam", {
                  target_layer: camTargetLayer, class_index: camClassIndex,
                }, setGradcamResult)}>Compute</Button>
                {gradcamResult?.heatmap && (
                  <div className="space-y-1 mt-1">
                    <div className="flex gap-2 text-xs">
                      <span className="text-red-400">High: {gradcamResult.high_activation_nodes}</span>
                      <span className="text-yellow-400">Med: {gradcamResult.medium_activation_nodes}</span>
                      <span className="text-blue-400">Low: {gradcamResult.low_activation_nodes}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {gradcamResult.heatmap.slice(0, 10).map((h: any) => (
                        <div key={h.node} className="flex justify-between bg-gray-900 px-2 py-0.5 rounded text-xs">
                          <span className="text-gray-400">Node {h.node}</span>
                          <span className={h.intensity === "high" ? "text-red-400" : h.intensity === "medium" ? "text-yellow-400" : "text-blue-400"}>
                            {h.cam_score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Integrated Gradients */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Integrated Gradients</CardTitle>
                <CardDescription>Path-integrated feature attribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Target Node</Label>
                    <Input type="number" value={igTargetNode} onChange={e => setIgTargetNode(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Steps</Label>
                    <Input type="number" value={igSteps} onChange={e => setIgSteps(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/integrated-gradients", {
                  target_node: igTargetNode, num_steps: igSteps,
                }, setIgResult)}>Compute</Button>
                {igResult?.top_features && (
                  <>
                    <div className="text-xs text-gray-400">Convergence: {igResult.convergence_delta}</div>
                    {renderTopK(igResult.top_features, "feature", "attribution")}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Benchmark */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Benchmark</CardTitle>
                <CardDescription>Compare method fidelity & sparsity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/benchmark", {
                  methods: ["gradient", "gnn_explainer", "gradcam", "integrated_grad", "shapley"],
                }, setBenchResult)}>Run Benchmark</Button>
                {benchResult?.results && (
                  <div className="space-y-1">
                    <div className="text-xs text-green-400 font-semibold">Best: {benchResult.best_method} (fidelity: {benchResult.best_fidelity})</div>
                    {benchResult.results.map((r: any) => (
                      <div key={r.method} className="flex justify-between bg-gray-900 px-2 py-1 rounded text-xs">
                        <span className="text-gray-300">{r.method}</span>
                        <span className="text-gray-400">F:{r.fidelity} S:{r.sparsity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compare */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Compare Methods</CardTitle>
                <CardDescription>Side-by-side method comparison</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Method A</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={compareMethodA} onChange={e => setCompareMethodA(e.target.value)}>
                      {EXPLAIN_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Method B</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={compareMethodB} onChange={e => setCompareMethodB(e.target.value)}>
                      {EXPLAIN_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/compare", {
                  method_a: compareMethodA, method_b: compareMethodB,
                }, setCompareResult)}>Compare</Button>
                {compareResult && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400">Correlation: {compareResult.correlation}</div>
                    <div className="text-xs text-gray-400">High agreement: {compareResult.high_agreement_count} / {compareResult.total_nodes}</div>
                    {compareResult.top_agreed_nodes?.slice(0, 5).map((n: any) => (
                      <div key={n.node} className="flex justify-between bg-gray-900 px-2 py-0.5 rounded text-xs">
                        <span>Node {n.node}</span>
                        <span className="text-green-400">diff: {n.difference}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === CONCEPT & PROTOTYPE TAB === */}
        <TabsContent value="discovery" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Concept Discovery */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Concept Discovery</CardTitle>
                <CardDescription>Discover high-level graph concepts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={conceptType} onChange={e => setConceptType(e.target.value)}>
                      {CONCEPT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Num Concepts</Label>
                    <Input type="number" value={numConcepts} onChange={e => setNumConcepts(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Min Support</Label>
                    <Input type="number" value={minSupport} onChange={e => setMinSupport(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/concept-discovery", {
                  concept_type: conceptType, num_concepts: numConcepts, min_support: minSupport,
                }, setConceptResult)}>Discover</Button>
                {conceptResult?.concepts && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">
                      Found {conceptResult.num_concepts} concepts ({conceptResult.discovery_time_ms}ms)
                    </div>
                    {conceptResult.concepts.map((c: any) => (
                      <div key={c.concept_id} className="bg-gray-900 p-2 rounded space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-200">{c.name}</span>
                          <Badge variant="default">{c.importance}</Badge>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-400">
                          <span>Freq: {c.frequency}</span>
                          <span>Coverage: {c.coverage}</span>
                          <span>Coherence: {c.coherence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prototype */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Graph Prototypes</CardTitle>
                <CardDescription>Extract representative subgraph prototypes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Num Prototypes</Label>
                    <Input type="number" value={numPrototypes} onChange={e => setNumPrototypes(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Size</Label>
                    <Input type="number" value={protoSize} onChange={e => setProtoSize(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Coverage</Label>
                    <Badge variant="outline">{protoResult?.total_coverage || "—"}</Badge>
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/prototype", {
                  num_prototypes: numPrototypes, prototype_size: protoSize,
                }, setProtoResult)}>Extract</Button>
                {protoResult?.prototypes && (
                  <div className="space-y-2">
                    <div className="flex gap-2 text-xs">
                      <Badge>Coverage: {protoResult.total_coverage}</Badge>
                      <Badge variant="outline">Diversity: {protoResult.diversity_score}</Badge>
                    </div>
                    {protoResult.prototypes.map((p: any) => (
                      <div key={p.prototype_id} className="bg-gray-900 p-2 rounded space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-200">{p.prototype_id} (center: {p.center_node})</span>
                          <Badge>Rep: {p.representativeness}</Badge>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-400">
                          <span>Nodes: {p.size}</span>
                          <span>Density: {p.density}</span>
                          <span>Coverage: {p.coverage_score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === COUNTERFACTUAL & CONTRAST TAB === */}
        <TabsContent value="counterfactual" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Counterfactual */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Counterfactual</CardTitle>
                <CardDescription>Minimal edits to change prediction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Strategy</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={cfStrategy} onChange={e => setCfStrategy(e.target.value)}>
                      {CF_STRATEGIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Target Class</Label>
                    <Input type="number" value={cfTargetClass} onChange={e => setCfTargetClass(+e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Target Node</Label>
                    <Input type="number" value={targetNode} onChange={e => setTargetNode(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Max Edits</Label>
                    <Input type="number" value={cfMaxEdits} onChange={e => setCfMaxEdits(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/counterfactual", {
                  target_node: targetNode, strategy: cfStrategy, target_class: cfTargetClass, max_edits: cfMaxEdits,
                }, setCfResult)}>Generate</Button>
                {cfResult && (
                  <div className="space-y-2">
                    <div className="flex gap-2 text-xs">
                      <Badge variant={cfResult.prediction_changed ? "default" : "destructive"}>
                        {cfResult.prediction_changed ? "Changed" : "No Change"}
                      </Badge>
                      <Badge variant="outline">
                        {cfResult.original_prediction} → {cfResult.counterfactual_prediction}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400">
                      Confidence: {cfResult.confidence_before} → {cfResult.confidence_after} | Proximity: {cfResult.proximity}
                    </div>
                    <div className="text-xs font-semibold text-gray-300 mt-1">Edits ({cfResult.num_edits}):</div>
                    {cfResult.edits?.map((edit: any, i: number) => (
                      <div key={i} className="flex justify-between bg-gray-900 px-2 py-1 rounded text-xs">
                        <span className="text-gray-300">{edit.type}</span>
                        <span className="text-gray-400">
                          {edit.source !== undefined ? `${edit.source}→${edit.target}` : edit.node !== undefined ? `node ${edit.node}` : `nodes [${edit.nodes}]`}
                        </span>
                        <span className="text-yellow-400">impact: {edit.impact ?? edit.delta}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contrastive */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Contrastive</CardTitle>
                <CardDescription>Why class A instead of class B?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Class A (predicted)</Label>
                    <Input type="number" value={contrastClassA} onChange={e => setContrastClassA(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Class B (alternative)</Label>
                    <Input type="number" value={contrastClassB} onChange={e => setContrastClassB(+e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Target Node</Label>
                  <Input type="number" value={targetNode} onChange={e => setTargetNode(+e.target.value)} />
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("explainability/contrastive", {
                  target_node: targetNode, class_a: contrastClassA, class_b: contrastClassB,
                }, setContrastResult)}>Explain</Button>
                {contrastResult && (
                  <div className="space-y-2">
                    <div className="text-xs text-gray-300 font-medium">{contrastResult.question}</div>
                    <div className="text-xs text-gray-400">Key: {contrastResult.key_difference}</div>
                    <div className="flex gap-2 text-xs">
                      <Badge>Discriminative: {contrastResult.discriminative_power}</Badge>
                      <Badge variant="outline">Contrast: {contrastResult.contrast_score}</Badge>
                    </div>
                    <div className="text-xs font-semibold text-green-400 mt-1">Present Factors (support A):</div>
                    {contrastResult.present_factors?.map((f: any, i: number) => (
                      <div key={i} className="flex justify-between bg-gray-900 px-2 py-1 rounded text-xs">
                        <span className="text-gray-300">{f.factor_type}: {f.element}</span>
                        <span className="text-green-400">A:{f.evidence_for_a} B:{f.evidence_for_b}</span>
                      </div>
                    ))}
                    <div className="text-xs font-semibold text-red-400 mt-1">Absent Factors (would support B):</div>
                    {contrastResult.absent_factors?.map((f: any, i: number) => (
                      <div key={i} className="flex justify-between bg-gray-900 px-2 py-1 rounded text-xs">
                        <span className="text-gray-300">{f.factor_type}: {f.element}</span>
                        <span className="text-red-400">Would B:{f.would_support_b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
