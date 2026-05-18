"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const METHODS = [
  { value: "prototypical", label: "Prototypical" },
  { value: "matching", label: "Matching" },
  { value: "relation", label: "Relation" },
  { value: "maml", label: "MAML" },
  { value: "meta_sgd", label: "Meta-SGD" },
  { value: "anil", label: "ANIL" },
];

const AGGREGATIONS = ["mean", "weighted_mean", "attention", "robust"];
const DISTANCES = ["euclidean", "cosine", "mahalanobis", "learned"];
const ADAPT_STRATEGIES = ["inner_loop", "fine_tune", "prototype_shift", "hypernetwork"];

export default function GraphFewShotPage() {
  const [activeTab, setActiveTab] = useState("methods");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Episode config
  const [nWay, setNWay] = useState(5);
  const [kShot, setKShot] = useState(5);
  const [qQuery, setQQuery] = useState(15);
  const [numEpisodes, setNumEpisodes] = useState(1);

  // Prototypical
  const [aggregation, setAggregation] = useState("mean");
  const [distance, setDistance] = useState("euclidean");
  const [backbone, setBackbone] = useState("gcn");
  const [hiddenDim, setHiddenDim] = useState(128);

  // Matching
  const [attentionType, setAttentionType] = useState("cosine");
  const [fce, setFce] = useState(true);

  // Relation
  const [relationModule, setRelationModule] = useState("mlp");

  // MAML
  const [innerSteps, setInnerSteps] = useState(5);
  const [innerLr, setInnerLr] = useState(0.01);
  const [outerLr, setOuterLr] = useState(0.001);
  const [numTasks, setNumTasks] = useState(100);
  const [firstOrder, setFirstOrder] = useState(false);

  // Adaptation
  const [adaptMethod, setAdaptMethod] = useState("prototypical");
  const [adaptStrategy, setAdaptStrategy] = useState("inner_loop");
  const [adaptSteps, setAdaptSteps] = useState(5);
  const [adaptLr, setAdaptLr] = useState(0.01);
  const [taskId, setTaskId] = useState("task_1");

  // Benchmark
  const [benchNways, setBenchNways] = useState("3,5,10");
  const [benchKshots, setBenchKshots] = useState("1,5,10,20");
  const [benchMethods, setBenchMethods] = useState("prototypical,matching,relation");

  // Evaluate
  const [evalMethods, setEvalMethods] = useState("prototypical,matching,relation,maml");
  const [evalEpisodes, setEvalEpisodes] = useState(100);

  // Results
  const [episodeResult, setEpisodeResult] = useState<any>(null);
  const [protoResult, setProtoResult] = useState<any>(null);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [relResult, setRelResult] = useState<any>(null);
  const [mamlResult, setMamlResult] = useState<any>(null);
  const [metaSgdResult, setMetaSgdResult] = useState<any>(null);
  const [anilResult, setAnilResult] = useState<any>(null);
  const [adaptResult, setAdaptResult] = useState<any>(null);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [benchResult, setBenchResult] = useState<any>(null);
  const [summaryResult, setSummaryResult] = useState<any>(null);

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

  const renderScoreBar = (score: number, label: string) => {
    const pct = Math.min(100, score * 100);
    const color = pct > 80 ? "bg-green-500" : pct > 60 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-28">{label}</span>
        <div className="flex-1 bg-gray-800 rounded h-3 overflow-hidden">
          <div className={`${color} h-full rounded transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-gray-300 w-14 text-right">{pct.toFixed(1)}%</span>
      </div>
    );
  };

  const renderMetricRow = (label: string, value: string | number) => (
    <div className="flex justify-between bg-gray-900 px-3 py-1.5 rounded text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-300 font-mono">{typeof value === "number" ? value.toFixed(4) : value}</span>
    </div>
  );

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Few-Shot Learning</h1>
          <p className="text-sm text-gray-500">v1.86 — Meta-learning for graph tasks with limited labeled data</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-sm">Graph ID</Label>
          <Input className="w-32" value={graphId} onChange={e => setGraphId(e.target.value)} />
          <Button size="sm" variant="outline" onClick={() => callApi("v186/summary", {}, setSummaryResult)}>Summary</Button>
        </div>
      </div>

      {error && <div className="bg-red-900/50 text-red-200 p-2 rounded text-sm">{error}</div>}
      {loading && <div className="text-sm text-yellow-400 animate-pulse">Running few-shot learning...</div>}

      {summaryResult && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3 text-xs">
              <Badge variant="outline">Cached: {summaryResult.fewshot_cached}</Badge>
              <Badge variant="outline">Episodes: {summaryResult.episodes_stored}</Badge>
              <Badge variant="outline">Prototypes: {summaryResult.prototypes_banked}</Badge>
              <Badge variant="outline">Meta Models: {summaryResult.meta_models}</Badge>
              <div className="flex flex-wrap gap-1 ml-2">
                {summaryResult.fewshot_methods?.map((m: string) => (
                  <Badge key={m} className="text-xs bg-purple-900 text-purple-200">{m}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="methods">Methods</TabsTrigger>
          <TabsTrigger value="meta">Meta-Learning</TabsTrigger>
          <TabsTrigger value="adapt">Adaptation</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
        </TabsList>

        {/* === METHODS TAB === */}
        <TabsContent value="methods" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Episode Generator */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Episode Generator</CardTitle>
                <CardDescription>Generate N-way K-shot episodes from graph</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label className="text-xs">N-way</Label>
                    <Input type="number" value={nWay} onChange={e => setNWay(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">K-shot</Label>
                    <Input type="number" value={kShot} onChange={e => setKShot(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Q-query</Label>
                    <Input type="number" value={qQuery} onChange={e => setQQuery(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Episodes</Label>
                    <Input type="number" value={numEpisodes} onChange={e => setNumEpisodes(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("fewshot/generate-episode", {
                  n_way: nWay, k_shot: kShot, q_query: qQuery, num_episodes: numEpisodes,
                }, setEpisodeResult)}>Generate</Button>
                {episodeResult && (
                  <div className="space-y-1">
                    <div className="flex gap-2 text-xs">
                      <Badge>{episodeResult.n_way}-way {episodeResult.k_shot}-shot</Badge>
                      <Badge variant="outline">Support: {episodeResult.total_support}</Badge>
                      <Badge variant="outline">Query: {episodeResult.total_query}</Badge>
                      <Badge variant="outline">Stored: {episodeResult.total_episodes_stored}</Badge>
                    </div>
                    {episodeResult.episodes?.[0]?.support_set && (
                      <div className="text-xs text-gray-400">
                        Classes: [{episodeResult.episodes[0].classes?.join(", ")}]
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prototypical */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Prototypical Network</CardTitle>
                <CardDescription>Classify via distance to class prototypes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Aggregation</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={aggregation} onChange={e => setAggregation(e.target.value)}>
                      {AGGREGATIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Distance</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={distance} onChange={e => setDistance(e.target.value)}>
                      {DISTANCES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Backbone</Label>
                    <Input value={backbone} onChange={e => setBackbone(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Hidden Dim</Label>
                    <Input type="number" value={hiddenDim} onChange={e => setHiddenDim(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("fewshot/prototypical", {
                  n_way: nWay, k_shot: kShot, q_query: qQuery,
                  aggregation, distance, backbone, hidden_dim: hiddenDim,
                }, setProtoResult)}>Run Prototypical</Button>
                {protoResult && (
                  <div className="space-y-2">
                    <div className="text-xs text-green-400 font-semibold">
                      Accuracy: {(protoResult.accuracy * 100).toFixed(1)}% ({protoResult.num_correct}/{protoResult.num_total})
                    </div>
                    {renderScoreBar(protoResult.accuracy, "Accuracy")}
                    {renderScoreBar(protoResult.confidence, "Confidence")}
                    {protoResult.prototypes && (
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-300">Prototypes:</div>
                        {Object.entries(protoResult.prototypes).map(([cls, data]: [string, any]) => (
                          <div key={cls} className="flex justify-between bg-gray-900 px-2 py-0.5 rounded text-xs">
                            <span className="text-gray-300">Class {cls}</span>
                            <span className="text-gray-400">samples: {data.num_samples} | spread: {data.spread}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Matching */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Matching Network</CardTitle>
                <CardDescription>Attention-based full-context embedding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Attention</Label>
                    <Input value={attentionType} onChange={e => setAttentionType(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={fce} onChange={e => setFce(e.target.checked)} />
                    <Label className="text-xs">FCE</Label>
                  </div>
                  <div>
                    <Label className="text-xs">Backbone</Label>
                    <Input value={backbone} onChange={e => setBackbone(e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("fewshot/matching", {
                  n_way: nWay, k_shot: kShot, q_query: qQuery,
                  attention_type: attentionType, fce, backbone,
                }, setMatchResult)}>Run Matching</Button>
                {matchResult && (
                  <div className="space-y-2">
                    {renderScoreBar(matchResult.accuracy, "Accuracy")}
                    <div className="text-xs text-gray-400">
                      Attn Entropy: {matchResult.mean_attention_entropy} | Correct: {matchResult.num_correct}/{matchResult.num_total}
                    </div>
                    {matchResult.predictions_sample?.slice(0, 5).map((p: any, i: number) => (
                      <div key={i} className={`flex justify-between px-2 py-0.5 rounded text-xs ${p.correct ? "bg-green-900/30 text-green-300" : "bg-red-900/30 text-red-300"}`}>
                        <span>True: {p.true} → Pred: {p.pred}</span>
                        <span>{p.correct ? "✓" : "✗"}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Relation */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Relation Network</CardTitle>
                <CardDescription>Learn relation scores between query-support pairs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Relation Module</Label>
                    <Input value={relationModule} onChange={e => setRelationModule(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Backbone</Label>
                    <Input value={backbone} onChange={e => setBackbone(e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("fewshot/relation", {
                  n_way: nWay, k_shot: kShot, q_query: qQuery,
                  relation_module: relationModule, backbone, hidden_dim: hiddenDim,
                }, setRelResult)}>Run Relation</Button>
                {relResult && (
                  <div className="space-y-2">
                    {renderScoreBar(relResult.accuracy, "Accuracy")}
                    <div className="text-xs text-gray-400">
                      Module params: {relResult.relation_module_params?.toLocaleString()} | Correct: {relResult.num_correct}/{relResult.num_total}
                    </div>
                    {relResult.predictions_sample?.slice(0, 5).map((p: any, i: number) => (
                      <div key={i} className="bg-gray-900 px-2 py-1 rounded text-xs">
                        <div className="flex justify-between">
                          <span className={p.correct ? "text-green-400" : "text-red-400"}>
                            True: {p.true} → Pred: {p.pred} {p.correct ? "✓" : "✗"}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {Object.entries(p.relation_scores || {}).slice(0, 4).map(([c, s]: [string, any]) => (
                            <div key={c} className="flex-1 bg-gray-800 rounded px-1 text-center">
                              <div className="text-[10px] text-gray-500">C{c}</div>
                              <div className="text-[10px] text-gray-300">{s.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === META-LEARNING TAB === */}
        <TabsContent value="meta" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* MAML */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">MAML</CardTitle>
                <CardDescription>Model-Agnostic Meta-Learning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Inner Steps</Label>
                    <Input type="number" value={innerSteps} onChange={e => setInnerSteps(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Inner LR</Label>
                    <Input type="number" step="0.001" value={innerLr} onChange={e => setInnerLr(+e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Outer LR</Label>
                    <Input type="number" step="0.0001" value={outerLr} onChange={e => setOuterLr(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Meta Tasks</Label>
                    <Input type="number" value={numTasks} onChange={e => setNumTasks(+e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={firstOrder} onChange={e => setFirstOrder(e.target.checked)} />
                  <Label className="text-xs">First-Order</Label>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("fewshot/maml", {
                  n_way: nWay, k_shot: kShot, q_query: qQuery,
                  inner_steps: innerSteps, inner_lr: innerLr, outer_lr: outerLr,
                  num_tasks: numTasks, first_order: firstOrder, backbone,
                }, setMamlResult)}>Train MAML</Button>
                {mamlResult && (
                  <div className="space-y-2">
                    {renderScoreBar(mamlResult.meta_accuracy, "Meta Accuracy")}
                    <div className="flex gap-2 text-xs">
                      <Badge>Pre: {(mamlResult.pre_adaptation_accuracy * 100).toFixed(1)}%</Badge>
                      <Badge variant="outline">Post: {(mamlResult.post_adaptation_accuracy * 100).toFixed(1)}%</Badge>
                      <Badge className="bg-green-900 text-green-200">+{(mamlResult.adaptation_gain * 100).toFixed(1)}%</Badge>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-gray-400">Inner loop losses:</div>
                      {mamlResult.inner_loop_losses?.map((l: number, i: number) => (
                        <div key={i} className="flex justify-between bg-gray-900 px-2 py-0.5 rounded text-xs">
                          <span className="text-gray-500">Step {i + 1}</span>
                          <span className="text-blue-400">{l}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-400">
                      Loss: {mamlResult.meta_loss} | Params: {mamlResult.num_params?.toLocaleString()} | Time: {mamlResult.meta_training_time}s
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Meta-SGD */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Meta-SGD</CardTitle>
                <CardDescription>MAML with per-parameter learning rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Inner Steps</Label>
                    <Input type="number" value={innerSteps} onChange={e => setInnerSteps(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Outer LR</Label>
                    <Input type="number" step="0.0001" value={outerLr} onChange={e => setOuterLr(+e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Meta Tasks</Label>
                  <Input type="number" value={numTasks} onChange={e => setNumTasks(+e.target.value)} />
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("fewshot/meta-sgd", {
                  n_way: nWay, k_shot: kShot, q_query: qQuery,
                  inner_steps: innerSteps, outer_lr: outerLr,
                  num_tasks: numTasks, backbone,
                }, setMetaSgdResult)}>Train Meta-SGD</Button>
                {metaSgdResult && (
                  <div className="space-y-2">
                    {renderScoreBar(metaSgdResult.meta_accuracy, "Meta Accuracy")}
                    {renderMetricRow("Mean Learned LR", metaSgdResult.mean_learned_lr)}
                    {renderMetricRow("LR Diversity", metaSgdResult.lr_diversity)}
                    <div className="text-xs text-gray-400">Learned LR sample: [{metaSgdResult.learned_lr_sample?.map((l: number) => l.toFixed(4)).join(", ")}]</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ANIL */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">ANIL</CardTitle>
                <CardDescription>Almost No Inner Loop — only head adaptation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Inner Steps</Label>
                    <Input type="number" value={innerSteps} onChange={e => setInnerSteps(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Outer LR</Label>
                    <Input type="number" step="0.0001" value={outerLr} onChange={e => setOuterLr(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("fewshot/anil", {
                  n_way: nWay, k_shot: kShot, q_query: qQuery,
                  inner_steps: innerSteps, outer_lr: outerLr,
                  num_tasks: numTasks, backbone,
                }, setAnilResult)}>Train ANIL</Button>
                {anilResult && (
                  <div className="space-y-2">
                    {renderScoreBar(anilResult.meta_accuracy, "Meta Accuracy")}
                    {renderMetricRow("Adaptation Ratio", anilResult.adaptation_ratio)}
                    <div className="text-xs text-gray-400">
                      Head params: {anilResult.head_only_params?.toLocaleString()} / Total: {anilResult.total_params?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      Inner loop layers: [{anilResult.inner_loop_layers?.join(", ")}]
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === ADAPTATION TAB === */}
        <TabsContent value="adapt" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Fast Adaptation */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Fast Adaptation</CardTitle>
                <CardDescription>Adapt a pre-trained few-shot model to a new task</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Task ID</Label>
                    <Input value={taskId} onChange={e => setTaskId(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Method</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={adaptMethod} onChange={e => setAdaptMethod(e.target.value)}>
                      {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Strategy</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={adaptStrategy} onChange={e => setAdaptStrategy(e.target.value)}>
                      {ADAPT_STRATEGIES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Steps</Label>
                    <Input type="number" value={adaptSteps} onChange={e => setAdaptSteps(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">LR</Label>
                    <Input type="number" step="0.001" value={adaptLr} onChange={e => setAdaptLr(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("fewshot/adapt", {
                  task_id: taskId, method: adaptMethod, strategy: adaptStrategy,
                  adaptation_steps: adaptSteps, adaptation_lr: adaptLr,
                  n_way: nWay, k_shot: kShot,
                }, setAdaptResult)}>Adapt</Button>
                {adaptResult && (
                  <div className="space-y-2">
                    <div className="flex gap-2 text-xs">
                      <Badge>Base: {(adaptResult.base_accuracy * 100).toFixed(1)}%</Badge>
                      <Badge className="bg-green-900 text-green-200">Adapted: {(adaptResult.adapted_accuracy * 100).toFixed(1)}%</Badge>
                      <Badge variant="outline">+{(adaptResult.improvement * 100).toFixed(1)}%</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400">Adaptation trajectory:</div>
                      <div className="flex gap-1">
                        {adaptResult.step_accuracies?.map((a: number, i: number) => {
                          const pct = a * 100;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center">
                              <div className="text-[10px] text-green-400">{pct.toFixed(0)}%</div>
                              <div className="w-full bg-gray-800 rounded h-12 overflow-hidden flex items-end">
                                <div className="bg-blue-500 w-full rounded" style={{ height: `${pct}%` }} />
                              </div>
                              <div className="text-[10px] text-gray-500">S{i + 1}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Losses: [{adaptResult.step_losses?.map((l: number) => l.toFixed(3)).join(" → ")}]
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evaluate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Evaluate Methods</CardTitle>
                <CardDescription>Compare few-shot methods across episodes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Methods (comma-sep)</Label>
                    <Input value={evalMethods} onChange={e => setEvalMethods(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Episodes</Label>
                    <Input type="number" value={evalEpisodes} onChange={e => setEvalEpisodes(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("fewshot/evaluate", {
                  methods: evalMethods.split(",").map(m => m.trim()),
                  n_way: nWay, k_shot: kShot, num_episodes: evalEpisodes,
                }, setEvalResult)}>Evaluate All</Button>
                {evalResult?.method_results && (
                  <div className="space-y-2">
                    <div className="text-xs text-green-400 font-semibold">
                      Best: {evalResult.best_method} ({(evalResult.method_results[evalResult.best_method]?.mean_accuracy * 100).toFixed(1)}%)
                    </div>
                    {evalResult.ranking?.map((r: any) => (
                      <div key={r.method} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-300">{r.method}</span>
                          <span className="text-green-400 font-mono">{(r.accuracy * 100).toFixed(2)}%</span>
                        </div>
                        {renderScoreBar(r.accuracy, r.method)}
                      </div>
                    ))}
                    {Object.entries(evalResult.method_results).map(([m, r]: [string, any]) => (
                      <div key={m} className="grid grid-cols-2 gap-1 text-xs">
                        {renderMetricRow(`${m} std`, r.std_accuracy)}
                        {renderMetricRow(`${m} 95% CI`, r.confidence_95)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === BENCHMARK TAB === */}
        <TabsContent value="benchmark" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">N-way × K-shot Benchmark Grid</CardTitle>
              <CardDescription>Systematic grid search across configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">N-ways (comma-sep)</Label>
                  <Input value={benchNways} onChange={e => setBenchNways(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">K-shots (comma-sep)</Label>
                  <Input value={benchKshots} onChange={e => setBenchKshots(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Methods (comma-sep)</Label>
                  <Input value={benchMethods} onChange={e => setBenchMethods(e.target.value)} />
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={() => callApi("fewshot/benchmark", {
                n_ways: benchNways.split(",").map(n => +n.trim()),
                k_shots: benchKshots.split(",").map(k => +k.trim()),
                methods: benchMethods.split(",").map(m => m.trim()),
              }, setBenchResult)}>Run Benchmark</Button>
              {benchResult?.grid && (
                <div className="space-y-3">
                  <div className="flex gap-2 text-xs">
                    <Badge>{benchResult.total_configs} configs tested</Badge>
                    {benchResult.best_config && (
                      <Badge className="bg-green-900 text-green-200">
                        Best: {benchResult.best_config.method} {benchResult.best_config.n_way}-way {benchResult.best_config.k_shot}-shot = {(benchResult.best_config.accuracy * 100).toFixed(1)}%
                      </Badge>
                    )}
                  </div>

                  {/* Top 5 */}
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-300">Top 5 Configurations:</div>
                    {benchResult.top5?.map((cfg: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded text-xs">
                        <span className="text-yellow-400 w-6">#{i + 1}</span>
                        <span className="text-gray-300 flex-1">{cfg.method} | {cfg.n_way}-way {cfg.k_shot}-shot</span>
                        {renderScoreBar(cfg.accuracy, "")}
                        <span className="text-gray-500 w-10">±{cfg.std}</span>
                      </div>
                    ))}
                  </div>

                  {/* Grid heatmap as text table */}
                  {(() => {
                    const methods = benchResult.methods || [];
                    const kshots = benchResult.k_shots || [];
                    const nways = benchResult.n_ways || [];
                    return methods.map(m => (
                      <div key={m} className="space-y-1">
                        <div className="text-xs font-semibold text-gray-300">{m}</div>
                        <div className="overflow-x-auto">
                          <table className="text-xs w-full">
                            <thead>
                              <tr>
                                <th className="text-gray-500 px-2 py-1 text-left">N\K</th>
                                {kshots.map(k => (
                                  <th key={k} className="text-gray-500 px-2 py-1 text-center">{k}-shot</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {nways.map(n => (
                                <tr key={n}>
                                  <td className="text-gray-300 px-2 py-1">{n}-way</td>
                                  {kshots.map(k => {
                                    const key = `${m}_${n}way_${k}shot`;
                                    const val = benchResult.grid[key];
                                    const acc = val?.accuracy || 0;
                                    const color = acc > 0.85 ? "text-green-400" : acc > 0.7 ? "text-yellow-400" : acc > 0.5 ? "text-orange-400" : "text-red-400";
                                    return (
                                      <td key={k} className={`${color} px-2 py-1 text-center font-mono`}>
                                        {(acc * 100).toFixed(1)}%
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
