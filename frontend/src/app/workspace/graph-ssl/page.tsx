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
  { value: "simclr", label: "SimCLR-Gr", color: "bg-blue-900 text-blue-200" },
  { value: "moco", label: "MoCo-Gr", color: "bg-green-900 text-green-200" },
  { value: "byol", label: "BYOL-Gr", color: "bg-purple-900 text-purple-200" },
  { value: "barlow_twins", label: "Barlow Twins", color: "bg-orange-900 text-orange-200" },
  { value: "vicreg", label: "VICReg", color: "bg-pink-900 text-pink-200" },
  { value: "swav", label: "SwAV", color: "bg-cyan-900 text-cyan-200" },
];

const AUGMENTATIONS = ["node_dropping", "edge_dropping", "subgraph", "feature_masking", "attribution", "identity"];

export default function GraphSSLPage() {
  const [activeTab, setActiveTab] = useState("methods");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // General params
  const [backbone, setBackbone] = useState("gcn");
  const [hiddenDim, setHiddenDim] = useState(256);
  const [projDim, setProjDim] = useState(128);
  const [epochs, setEpochs] = useState(200);
  const [temperature, setTemperature] = useState(0.5);
  const [aug1, setAug1] = useState("node_dropping");
  const [aug2, setAug2] = useState("edge_dropping");
  const [augRatio, setAugRatio] = useState(0.2);

  // Method-specific
  const [mocoQueue, setMocoQueue] = useState(65536);
  const [mocoMomentum, setMocoMomentum] = useState(0.999);
  const [byolMomentum, setByolMomentum] = useState(0.996);
  const [byolPredDim, setByolPredDim] = useState(256);
  const [btLambda, setBtLambda] = useState(0.0051);
  const [btProjDim, setBtProjDim] = useState(8192);
  const [vicregSimW, setVicregSimW] = useState(25.0);
  const [vicregVarW, setVicregVarW] = useState(25.0);
  const [vicregCovW, setVicregCovW] = useState(1.0);
  const [swavPrototypes, setSwavPrototypes] = useState(3000);
  const [swavCrops, setSwavCrops] = useState(2);

  // Evaluation
  const [evalMethods, setEvalMethods] = useState("simclr,moco,byol,barlow_twins,vicreg,swav");
  const [evalType, setEvalType] = useState("linear_probe");
  const [downstreamTask, setDownstreamTask] = useState("node_classification");
  const [trainRatio, setTrainRatio] = useState(0.1);

  // Aug study
  const [studyAugs, setStudyAugs] = useState("node_dropping,edge_dropping,subgraph,feature_masking");
  const [studyRatios, setStudyRatios] = useState("0.1,0.2,0.3,0.5");

  // Results
  const [augResult, setAugResult] = useState<any>(null);
  const [simclrResult, setSimclrResult] = useState<any>(null);
  const [mocoResult, setMocoResult] = useState<any>(null);
  const [byolResult, setByolResult] = useState<any>(null);
  const [btResult, setBtResult] = useState<any>(null);
  const [vicregResult, setVicregResult] = useState<any>(null);
  const [swavResult, setSwavResult] = useState<any>(null);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [augStudyResult, setAugStudyResult] = useState<any>(null);
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

  const renderLossChart = (trajectory: number[], label: string = "Loss") => {
    if (!trajectory?.length) return null;
    const min = Math.min(...trajectory);
    const max = Math.max(...trajectory);
    const range = max - min || 1;
    return (
      <div className="space-y-1">
        <div className="text-xs text-gray-400">{label} trajectory:</div>
        <div className="flex gap-0.5 items-end h-16">
          {trajectory.map((v, i) => {
            const h = ((v - min) / range) * 100;
            return (
              <div key={i} className="flex-1 bg-gray-800 rounded-t overflow-hidden flex items-end" style={{ minHeight: 4 }}>
                <div className="bg-blue-500 w-full rounded-t" style={{ height: `${Math.max(4, h)}%` }} />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>{trajectory[0]?.toFixed(3)}</span>
          <span>→</span>
          <span>{trajectory[trajectory.length - 1]?.toFixed(3)}</span>
        </div>
      </div>
    );
  };

  const renderScoreBar = (score: number, label: string) => {
    const pct = Math.min(100, score * 100);
    const color = pct > 85 ? "bg-green-500" : pct > 70 ? "bg-yellow-500" : "bg-red-500";
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

  const MethodCard = ({ method, result, state, children }: any) => {
    const info = METHODS.find(m => m.value === method);
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Badge className={info?.color}>{info?.label}</Badge>
            <CardTitle className="text-base">{info?.label}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {children}
          <Button size="sm" className="w-full" disabled={loading} onClick={() => {
            const params: any = { backbone, hidden_dim: hiddenDim, projection_dim: projDim, epochs, aug1, aug2, aug_ratio: augRatio };
            if (method === "simclr") { params.temperature = temperature; }
            if (method === "moco") { params.queue_size = mocoQueue; params.momentum = mocoMomentum; params.temperature = 0.07; }
            if (method === "byol") { params.momentum = byolMomentum; params.prediction_dim = byolPredDim; }
            if (method === "barlow_twins") { params.lambda_bt = btLambda; params.projection_dim = btProjDim; }
            if (method === "vicreg") { params.sim_weight = vicregSimW; params.var_weight = vicregVarW; params.cov_weight = vicregCovW; }
            if (method === "swav") { params.num_prototypes = swavPrototypes; params.num_crops = swavCrops; params.temperature = 0.1; }
            callApi(`ssl/${method === "barlow_twins" ? "barlow-twins" : method}`, params, state);
          }}>Train</Button>
          {result && (
            <div className="space-y-2">
              {renderScoreBar(result.downstream_linear_acc, "Linear Probe")}
              {renderScoreBar(result.downstream_finetune_acc, "Fine-tune")}
              {renderLossChart(result.loss_trajectory)}
              <div className="text-xs text-gray-400">Final loss: {result.final_loss}</div>
              {result.alignment !== undefined && renderMetricRow("Alignment", result.alignment)}
              {result.uniformity !== undefined && renderMetricRow("Uniformity", result.uniformity)}
              {result.queue_utilization !== undefined && renderMetricRow("Queue Util", result.queue_utilization)}
              {result.key_encoder_consistency !== undefined && renderMetricRow("Key Encoder", result.key_encoder_consistency)}
              {result.redundancy_reduction !== undefined && renderMetricRow("Redundancy ↓", result.redundancy_reduction)}
              {result.code_assignment_entropy !== undefined && renderMetricRow("Code Entropy", result.code_assignment_entropy)}
              {result.sim_loss !== undefined && (
                <div className="grid grid-cols-3 gap-1">
                  {renderMetricRow("Sim Loss", result.sim_loss)}
                  {renderMetricRow("Var Loss", result.var_loss)}
                  {renderMetricRow("Cov Loss", result.cov_loss)}
                </div>
              )}
              {result.cross_correlation_diag_sample && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">Cross-corr diagonal sample:</div>
                  <div className="flex gap-0.5">
                    {result.cross_correlation_diag_sample.map((v: number, i: number) => (
                      <div key={i} className="flex-1 bg-green-800 rounded" style={{ height: `${v * 40}px` }} title={v.toFixed(4)} />
                    ))}
                  </div>
                </div>
              )}
              {result.prototype_usage_sample && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">Prototype usage:</div>
                  <div className="flex gap-0.5 items-end h-10">
                    {result.prototype_usage_sample.map((u: number, i: number) => (
                      <div key={i} className="flex-1 bg-cyan-600 rounded-t" style={{ height: `${u * 100}%` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Self-Supervised Contrastive Learning</h1>
          <p className="text-sm text-gray-500">v1.87 — Learn graph representations without labels via contrastive objectives</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-sm">Graph ID</Label>
          <Input className="w-32" value={graphId} onChange={e => setGraphId(e.target.value)} />
          <Button size="sm" variant="outline" onClick={() => callApi("v187/summary", {}, setSummaryResult)}>Summary</Button>
        </div>
      </div>

      {error && <div className="bg-red-900/50 text-red-200 p-2 rounded text-sm">{error}</div>}
      {loading && <div className="text-sm text-yellow-400 animate-pulse">Training SSL model...</div>}

      {summaryResult && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3 text-xs">
              <Badge variant="outline">Cached: {summaryResult.ssl_cached}</Badge>
              <Badge variant="outline">Encoders: {summaryResult.encoder_states}</Badge>
              <Badge variant="outline">Augmentations: {summaryResult.augmentation_states}</Badge>
              <div className="flex flex-wrap gap-1 ml-2">
                {summaryResult.ssl_methods?.map((m: string) => {
                  const info = METHODS.find(x => x.value === m);
                  return <Badge key={m} className={`text-xs ${info?.color || "bg-gray-800"}`}>{m}</Badge>;
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="methods">SSL Methods</TabsTrigger>
          <TabsTrigger value="augment">Augmentations</TabsTrigger>
          <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
          <TabsTrigger value="study">Aug Study</TabsTrigger>
        </TabsList>

        {/* === SSL METHODS TAB === */}
        <TabsContent value="methods" className="space-y-4">

          {/* Common config bar */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-6 gap-2 text-xs">
                <div>
                  <Label className="text-xs">Backbone</Label>
                  <Input value={backbone} onChange={e => setBackbone(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Hidden Dim</Label>
                  <Input type="number" value={hiddenDim} onChange={e => setHiddenDim(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Proj Dim</Label>
                  <Input type="number" value={projDim} onChange={e => setProjDim(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Epochs</Label>
                  <Input type="number" value={epochs} onChange={e => setEpochs(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Aug 1</Label>
                  <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={aug1} onChange={e => setAug1(e.target.value)}>
                    {AUGMENTATIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Aug 2</Label>
                  <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={aug2} onChange={e => setAug2(e.target.value)}>
                    {AUGMENTATIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 1: SimCLR, MoCo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MethodCard method="simclr" result={simclrResult} state={setSimclrResult}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Temperature</Label>
                  <Input type="number" step="0.05" value={temperature} onChange={e => setTemperature(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Aug Ratio</Label>
                  <Input type="number" step="0.05" value={augRatio} onChange={e => setAugRatio(+e.target.value)} />
                </div>
              </div>
            </MethodCard>

            <MethodCard method="moco" result={mocoResult} state={setMocoResult}>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Queue Size</Label>
                  <Input type="number" value={mocoQueue} onChange={e => setMocoQueue(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Momentum</Label>
                  <Input type="number" step="0.001" value={mocoMomentum} onChange={e => setMocoMomentum(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Aug Ratio</Label>
                  <Input type="number" step="0.05" value={augRatio} onChange={e => setAugRatio(+e.target.value)} />
                </div>
              </div>
            </MethodCard>
          </div>

          {/* Row 2: BYOL, Barlow Twins */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MethodCard method="byol" result={byolResult} state={setByolResult}>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Momentum</Label>
                  <Input type="number" step="0.001" value={byolMomentum} onChange={e => setByolMomentum(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Pred Dim</Label>
                  <Input type="number" value={byolPredDim} onChange={e => setByolPredDim(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Aug Ratio</Label>
                  <Input type="number" step="0.05" value={augRatio} onChange={e => setAugRatio(+e.target.value)} />
                </div>
              </div>
            </MethodCard>

            <MethodCard method="barlow_twins" result={btResult} state={setBtResult}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Lambda</Label>
                  <Input type="number" step="0.0001" value={btLambda} onChange={e => setBtLambda(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Proj Dim (large)</Label>
                  <Input type="number" value={btProjDim} onChange={e => setBtProjDim(+e.target.value)} />
                </div>
              </div>
            </MethodCard>
          </div>

          {/* Row 3: VICReg, SwAV */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MethodCard method="vicreg" result={vicregResult} state={setVicregResult}>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Sim Weight</Label>
                  <Input type="number" step="1" value={vicregSimW} onChange={e => setVicregSimW(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Var Weight</Label>
                  <Input type="number" step="1" value={vicregVarW} onChange={e => setVicregVarW(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Cov Weight</Label>
                  <Input type="number" step="0.1" value={vicregCovW} onChange={e => setVicregCovW(+e.target.value)} />
                </div>
              </div>
            </MethodCard>

            <MethodCard method="swav" result={swavResult} state={setSwavResult}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Prototypes</Label>
                  <Input type="number" value={swavPrototypes} onChange={e => setSwavPrototypes(+e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Num Crops</Label>
                  <Input type="number" value={swavCrops} onChange={e => setSwavCrops(+e.target.value)} />
                </div>
              </div>
            </MethodCard>
          </div>
        </TabsContent>

        {/* === AUGMENTATION TAB === */}
        <TabsContent value="augment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Graph Augmentation</CardTitle>
                <CardDescription>Apply augmentations to generate contrastive views</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Augmentation</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={aug1} onChange={e => setAug1(e.target.value)}>
                      {AUGMENTATIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Ratio</Label>
                    <Input type="number" step="0.05" value={augRatio} onChange={e => setAugRatio(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Num Views</Label>
                    <Input type="number" value={2} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("ssl/augment", {
                  augmentation: aug1, aug_ratio: augRatio, num_augmentations: 2,
                }, setAugResult)}>Apply Augmentation</Button>
                {augResult?.augmentations && (
                  <div className="space-y-2">
                    <div className="flex gap-2 text-xs">
                      <Badge>{augResult.augmentation.replace(/_/g, " ")}</Badge>
                      <Badge variant="outline">Ratio: {augResult.aug_ratio}</Badge>
                      <Badge variant="outline">Views: {augResult.num_views}</Badge>
                    </div>
                    {augResult.augmentations.map((a: any, i: number) => (
                      <div key={i} className="bg-gray-900 p-2 rounded space-y-1">
                        <div className="text-xs font-semibold text-gray-300">View {i + 1}:</div>
                        {Object.entries(a).filter(([k]) => k !== "augmentation").map(([k, v]) => (
                          <div key={k} className="flex justify-between text-xs">
                            <span className="text-gray-400">{k.replace(/_/g, " ")}</span>
                            <span className="text-gray-300">{typeof v === "number" ? (v < 1 ? v.toFixed(4) : v.toLocaleString()) : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Augmentation Quick Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Augmentation Reference</CardTitle>
                <CardDescription>Graph augmentation strategies and their effects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  {[
                    { name: "Node Dropping", desc: "Randomly drop nodes and their edges", impact: "Structural robustness" },
                    { name: "Edge Dropping", desc: "Randomly remove edges from the graph", impact: "Topology invariance" },
                    { name: "Subgraph", desc: "Sample a connected subgraph", impact: "Local pattern learning" },
                    { name: "Feature Masking", desc: "Zero out random feature dimensions", impact: "Feature robustness" },
                    { name: "Attribution", desc: "Perturb node features by attribution", impact: "Semantic preservation" },
                    { name: "Identity", desc: "No augmentation (baseline)", impact: "Raw feature baseline" },
                  ].map(a => (
                    <div key={a.name} className="bg-gray-900 p-2 rounded">
                      <div className="font-medium text-gray-200">{a.name}</div>
                      <div className="text-gray-400">{a.desc}</div>
                      <Badge variant="outline" className="text-[10px] mt-1">{a.impact}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === EVALUATE TAB === */}
        <TabsContent value="evaluate" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Representation Evaluation</CardTitle>
              <CardDescription>Compare SSL methods on downstream tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-xs">Methods</Label>
                  <Input value={evalMethods} onChange={e => setEvalMethods(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Eval Type</Label>
                  <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={evalType} onChange={e => setEvalType(e.target.value)}>
                    <option value="linear_probe">Linear Probe</option>
                    <option value="finetune">Fine-tune</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Task</Label>
                  <Input value={downstreamTask} onChange={e => setDownstreamTask(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Train Ratio</Label>
                  <Input type="number" step="0.05" value={trainRatio} onChange={e => setTrainRatio(+e.target.value)} />
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={() => callApi("ssl/evaluate-representation", {
                methods: evalMethods.split(",").map(m => m.trim()),
                eval_type: evalType, downstream_task: downstreamTask, train_ratio: trainRatio,
              }, setEvalResult)}>Evaluate All</Button>
              {evalResult?.results && (
                <div className="space-y-3">
                  <div className="text-xs text-green-400 font-semibold">
                    Best: {evalResult.best_method} ({(evalResult.results[evalResult.best_method]?.accuracy * 100).toFixed(1)}%)
                  </div>
                  {evalResult.ranking?.map((r: any) => {
                    const info = METHODS.find(m => m.value === r.method);
                    return (
                      <div key={r.method} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${info?.color || ""}`}>{r.method}</Badge>
                          {renderScoreBar(r.accuracy, "")}
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          {renderMetricRow("Accuracy", evalResult.results[r.method]?.accuracy)}
                          {renderMetricRow("F1 Macro", evalResult.results[r.method]?.f1_macro)}
                          {renderMetricRow("F1 Micro", evalResult.results[r.method]?.f1_micro)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === AUG STUDY TAB === */}
        <TabsContent value="study" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Augmentation Ablation Study</CardTitle>
              <CardDescription>Systematic search for optimal augmentation strategy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Augmentations (comma)</Label>
                  <Input value={studyAugs} onChange={e => setStudyAugs(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Ratios (comma)</Label>
                  <Input value={studyRatios} onChange={e => setStudyRatios(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">SSL Method</Label>
                  <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={aug1} onChange={e => setAug1(e.target.value)}>
                    {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={() => callApi("ssl/augmentation-study", {
                augmentations: studyAugs.split(",").map(a => a.trim()),
                aug_ratios: studyRatios.split(",").map(r => parseFloat(r.trim())),
              }, setAugStudyResult)}>Run Study</Button>
              {augStudyResult?.grid && (
                <div className="space-y-3">
                  <div className="flex gap-2 text-xs">
                    <Badge>{augStudyResult.total_configs} configs</Badge>
                    {augStudyResult.best_config && (
                      <Badge className="bg-green-900 text-green-200">
                        Best: {augStudyResult.best_config.augmentation} r={augStudyResult.best_config.ratio} = {(augStudyResult.best_config.downstream_accuracy * 100).toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-gray-300">Top 5:</div>
                  {augStudyResult.top5?.map((cfg: any, i: number) => {
                    const pct = cfg.downstream_accuracy * 100;
                    const color = pct > 85 ? "bg-green-500" : pct > 75 ? "bg-yellow-500" : "bg-orange-500";
                    return (
                      <div key={i} className="flex items-center gap-2 bg-gray-900 px-3 py-1.5 rounded text-xs">
                        <span className="text-yellow-400 w-6">#{i + 1}</span>
                        <span className="text-gray-300 flex-1">{cfg.augmentation.replace(/_/g, " ")} r={cfg.ratio}</span>
                        <div className="w-32 bg-gray-800 rounded h-3 overflow-hidden">
                          <div className={`${color} h-full rounded`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-gray-300 w-14 text-right">{pct.toFixed(1)}%</span>
                      </div>
                    );
                  })}

                  {/* Grid table */}
                  <div className="overflow-x-auto">
                    <table className="text-xs w-full">
                      <thead>
                        <tr>
                          <th className="text-gray-500 px-2 py-1 text-left">Aug \ Ratio</th>
                          {studyRatios.split(",").map(r => (
                            <th key={r} className="text-gray-500 px-2 py-1 text-center">r={r.trim()}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {studyAugs.split(",").map(aug => (
                          <tr key={aug}>
                            <td className="text-gray-300 px-2 py-1">{aug.trim().replace(/_/g, " ")}</td>
                            {studyRatios.split(",").map(r => {
                              const key = `${aug.trim()}_r${r.trim()}`;
                              const val = augStudyResult.grid[key];
                              const acc = val?.downstream_accuracy || 0;
                              const color = acc > 0.85 ? "text-green-400" : acc > 0.75 ? "text-yellow-400" : acc > 0.65 ? "text-orange-400" : "text-red-400";
                              return (
                                <td key={r} className={`${color} px-2 py-1 text-center font-mono`}>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
