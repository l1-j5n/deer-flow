"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const API_BASE = "";

const STRATEGIES = [
  { value: "response", label: "Response-Based", desc: "Match output logits", color: "bg-blue-900 text-blue-200" },
  { value: "hint", label: "Hint-Based", desc: "Intermediate hints", color: "bg-green-900 text-green-200" },
  { value: "attention", label: "Attention-Based", desc: "Transfer attention", color: "bg-purple-900 text-purple-200" },
  { value: "graph", label: "Graph-Based", desc: "Structure preservation", color: "bg-orange-900 text-orange-200" },
  { value: "feature", label: "Feature-Based", desc: "Feature alignment", color: "bg-pink-900 text-pink-200" },
  { value: "relational", label: "Relational", desc: "Relation preservation", color: "bg-cyan-900 text-cyan-200" },
  { value: "multi_teacher", label: "Multi-Teacher", desc: "Ensemble teachers", color: "bg-emerald-900 text-emerald-200" },
  { value: "progressive", label: "Progressive", desc: "Staged transfer", color: "bg-amber-900 text-amber-200" },
];

const TEACHER_ARCHS = ["gcn_large", "gat_large", "gin_large", "sage_large", "ensemble"];
const STUDENT_ARCHS = ["gcn_small", "gat_small", "mlp", "gin_small", "linear"];
const LOSS_FUNCTIONS = ["kl_divergence", "mse", "l1", "cosine", "huber", "js_divergence"];

export default function GraphKDPage() {
  const [activeTab, setActiveTab] = useState("methods");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Common params
  const [teacherArch, setTeacherArch] = useState("gat_large");
  const [studentArch, setStudentArch] = useState("gcn_small");
  const [teacherHidden, setTeacherHidden] = useState(512);
  const [studentHidden, setStudentHidden] = useState(64);
  const [epochs, setEpochs] = useState(100);
  const [temperature, setTemperature] = useState(4.0);
  const [alpha, setAlpha] = useState(0.7);

  // Strategy-specific
  const [transferLayers, setTransferLayers] = useState("hidden2");
  const [hintLossWeight, setHintLossWeight] = useState(0.3);
  const [attentionType, setAttentionType] = useState("node");
  const [attnLossWeight, setAttnLossWeight] = useState(0.5);
  const [graphLossType, setGraphLossType] = useState("adjacency");
  const [graphLossWeight, setGraphLossWeight] = useState(0.4);
  const [featureLayers, setFeatureLayers] = useState("embedding,output");
  const [featureLossWeight, setFeatureLossWeight] = useState(0.35);
  const [relationTypes, setRelationTypes] = useState("pairwise,triplet");
  const [relLossWeight, setRelLossWeight] = useState(0.4);
  const [teacherArchs, setTeacherArchs] = useState("gcn_large,gat_large,gin_large");
  const [fusionMethod, setFusionMethod] = useState("weighted_avg");
  const [numStages, setNumStages] = useState(3);
  const [tempSchedule, setTempSchedule] = useState("decay");
  const [alphaSchedule, setAlphaSchedule] = useState("increase");
  const [lossFn, setLossFn] = useState("kl_divergence");

  // Results
  const [responseResult, setResponseResult] = useState<any>(null);
  const [hintResult, setHintResult] = useState<any>(null);
  const [attnResult, setAttnResult] = useState<any>(null);
  const [graphResult, setGraphResult] = useState<any>(null);
  const [featureResult, setFeatureResult] = useState<any>(null);
  const [relResult, setRelResult] = useState<any>(null);
  const [multiResult, setMultiResult] = useState<any>(null);
  const [progResult, setProgResult] = useState<any>(null);
  const [benchResult, setBenchResult] = useState<any>(null);
  const [summaryResult, setSummaryResult] = useState<any>(null);

  const callApi = async (endpoint: string, params: any, setter: (v: any) => void) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/knowledge-graph/kd/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...params }),
      });
      setter(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const renderMetricBar = (label: string, value: number, max: number = 1.0, color: string = "bg-blue-600") => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{value.toFixed(2)}</span>
      </div>
      <Progress value={(value / max) * 100} className="h-2" />
    </div>
  );

  const renderResultCard = (title: string, result: any, children: React.ReactNode) => (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Graph Knowledge Distillation</h1>
          <p className="text-gray-400">Transfer knowledge from teacher to student GNN</p>
        </div>
        <div className="flex gap-2">
          <Input value={graphId} onChange={(e) => setGraphId(e.target.value)} placeholder="Graph ID" className="w-32 bg-gray-800 border-gray-700 text-white" />
          <Button onClick={() => callApi("v188/summary", {}, setSummaryResult)} variant="outline" className="bg-gray-800 border-gray-700 text-white">Summary</Button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-900/50 text-red-200 rounded-lg">{error}</div>}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="methods" className="data-[state=active]:bg-gray-700">Methods</TabsTrigger>
          <TabsTrigger value="config" className="data-[state=active]:bg-gray-700">Config</TabsTrigger>
          <TabsTrigger value="benchmark" className="data-[state=active]:bg-gray-700">Benchmark</TabsTrigger>
        </TabsList>

        {/* Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STRATEGIES.map((s) => (
              <Card key={s.value} className="bg-gray-900 border-gray-800 cursor-pointer hover:border-gray-600"
                onClick={() => {
                  const endpoints: Record<string, any> = {
                    response: () => callApi("response", {
                      teacher_arch: teacherArch, student_arch: studentArch,
                      temperature, alpha, epochs
                    }, setResponseResult),
                    hint: () => callApi("hint", {
                      teacher_arch: teacherArch, student_arch: studentArch,
                      transfer_layers: transferLayers.split(","),
                      hint_loss_weight: hintLossWeight, epochs
                    }, setHintResult),
                    attention: () => callApi("attention", {
                      teacher_arch: teacherArch, student_arch: studentArch,
                      attention_transfer_type: attentionType,
                      attention_loss_weight: attnLossWeight, epochs
                    }, setAttnResult),
                    graph: () => callApi("graph", {
                      teacher_arch: teacherArch, student_arch: studentArch,
                      graph_loss_type: graphLossType,
                      graph_loss_weight: graphLossWeight, epochs
                    }, setGraphResult),
                    feature: () => callApi("feature", {
                      teacher_arch: teacherArch, student_arch: studentArch,
                      feature_layers: featureLayers.split(","),
                      feature_loss_weight: featureLossWeight, epochs
                    }, setFeatureResult),
                    relational: () => callApi("relational", {
                      teacher_arch: teacherArch, student_arch: studentArch,
                      relation_types: relationTypes.split(","),
                      relation_loss_weight: relLossWeight, epochs
                    }, setRelResult),
                    multi_teacher: () => callApi("multi-teacher", {
                      teacher_archs: teacherArchs.split(","),
                      student_arch: studentArch,
                      fusion_method: fusionMethod,
                      temperature, alpha, epochs
                    }, setMultiResult),
                    progressive: () => callApi("progressive", {
                      teacher_arch: teacherArch, student_arch: studentArch,
                      num_stages: numStages, stage_epochs: 50,
                      temperature_schedule: tempSchedule,
                      initial_temperature: temperature,
                      alpha_schedule: alphaSchedule,
                      initial_alpha: alpha
                    }, setProgResult),
                  };
                  endpoints[s.value as keyof typeof endpoints]?.();
                }}>
                <CardContent className="p-3">
                  <Badge className={`${s.color} text-xs`}>{s.label}</Badge>
                  <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Results Display */}
          <div className="grid md:grid-cols-2 gap-4">
            {responseResult && renderResultCard("Response-Based Distillation", responseResult, (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Teacher:</span> <span className="text-white">{responseResult.teacher_arch}</span></div>
                  <div><span className="text-gray-400">Student:</span> <span className="text-white">{responseResult.student_arch}</span></div>
                  <div><span className="text-gray-400">Compression:</span> <span className="text-white">{responseResult.compression_ratio}x</span></div>
                  <div><span className="text-gray-400">Speedup:</span> <span className="text-white">{responseResult.inference_speedup}x</span></div>
                </div>
                {renderMetricBar("Teacher Acc", responseResult.teacher_accuracy)}
                {renderMetricBar("Student Distilled", responseResult.student_distilled_accuracy)}
                {renderMetricBar("Knowledge Transfer", responseResult.knowledge_transfer_score)}
                <div className="text-xs text-gray-500">Loss: {responseResult.final_loss}</div>
              </div>
            ))}

            {hintResult && renderResultCard("Hint-Based Distillation", hintResult, (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Transfer Layers:</span> <span className="text-white">{hintResult.transfer_layers?.join(", ")}</span></div>
                  <div><span className="text-gray-400">Compression:</span> <span className="text-white">{hintResult.compression_ratio}x</span></div>
                </div>
                {renderMetricBar("Teacher Acc", hintResult.teacher_accuracy)}
                {renderMetricBar("Student Acc", hintResult.student_accuracy)}
                {renderMetricBar("Feature Alignment", hintResult.avg_feature_alignment)}
                <div className="text-xs text-gray-500">Final Loss: {hintResult.final_loss}</div>
              </div>
            ))}

            {attnResult && renderResultCard("Attention-Based Distillation", attnResult, (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Attention Type:</span> <span className="text-white">{attnResult.attention_transfer_type}</span></div>
                  <div><span className="text-gray-400">Compression:</span> <span className="text-white">{attnResult.compression_ratio}x</span></div>
                </div>
                {renderMetricBar("Teacher Acc", attnResult.teacher_accuracy)}
                {renderMetricBar("Student Acc", attnResult.student_accuracy)}
                {renderMetricBar("Attention Score", attnResult.avg_attention_score)}
                <div className="text-xs text-gray-500">Final Loss: {attnResult.final_loss}</div>
              </div>
            ))}

            {graphResult && renderResultCard("Graph-Based Distillation", graphResult, (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Loss Type:</span> <span className="text-white">{graphResult.graph_loss_type}</span></div>
                  <div><span className="text-gray-400">Compression:</span> <span className="text-white">{graphResult.compression_ratio}x</span></div>
                </div>
                {renderMetricBar("Teacher Acc", graphResult.teacher_accuracy)}
                {renderMetricBar("Student Acc", graphResult.student_accuracy)}
                {renderMetricBar("Structure Preserve", graphResult.structure_preservation)}
                <div className="text-xs text-gray-500">Final Loss: {graphResult.final_loss}</div>
              </div>
            ))}

            {featureResult && renderResultCard("Feature-Based Distillation", featureResult, (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Feature Layers:</span> <span className="text-white">{featureResult.feature_layers?.join(", ")}</span></div>
                  <div><span className="text-gray-400">Compression:</span> <span className="text-white">{featureResult.compression_ratio}x</span></div>
                </div>
                {renderMetricBar("Teacher Acc", featureResult.teacher_accuracy)}
                {renderMetricBar("Student Acc", featureResult.student_accuracy)}
                {renderMetricBar("Feature Correlation", featureResult.avg_feature_correlation)}
                <div className="text-xs text-gray-500">Final Loss: {featureResult.final_loss}</div>
              </div>
            ))}

            {multiResult && renderResultCard("Multi-Teacher Distillation", multiResult, (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Teachers:</span> <span className="text-white">{multiResult.num_teachers}</span></div>
                  <div><span className="text-gray-400">Fusion:</span> <span className="text-white">{multiResult.fusion_method}</span></div>
                  <div><span className="text-gray-400">Weighted Acc:</span> <span className="text-white">{multiResult.weighted_teacher_accuracy}</span></div>
                  <div><span className="text-gray-400">Ensemble Gain:</span> <span className="text-green-400">+{multiResult.ensemble_gain}</span></div>
                </div>
                {renderMetricBar("Teacher Acc", multiResult.weighted_teacher_accuracy)}
                {renderMetricBar("Student Acc", multiResult.student_accuracy)}
                {renderMetricBar("Knowledge Diversity", multiResult.knowledge_diversity)}
                <div className="text-xs text-gray-500">Compression: {multiResult.compression_ratio}x</div>
              </div>
            ))}

            {progResult && renderResultCard("Progressive Distillation", progResult, (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Stages:</span> <span className="text-white">{progResult.num_stages}</span></div>
                  <div><span className="text-gray-400">Total Epochs:</span> <span className="text-white">{progResult.total_epochs}</span></div>
                </div>
                {progResult.stages?.map((stage: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400 w-16">Stage {stage.stage}:</span>
                    <Progress value={stage.knowledge_transferred * 333} className="flex-1 h-2" />
                    <span className="text-white w-12">{stage.accuracy.toFixed(3)}</span>
                  </div>
                ))}
                {renderMetricBar("Teacher Acc", progResult.teacher_accuracy)}
                {renderMetricBar("Final Acc", progResult.final_accuracy)}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Config Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Distillation Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Teacher Architecture</Label>
                  <select value={teacherArch} onChange={(e) => setTeacherArch(e.target.value)}
                    className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2">
                    {TEACHER_ARCHS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Student Architecture</Label>
                  <select value={studentArch} onChange={(e) => setStudentArch(e.target.value)}
                    className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2">
                    {STUDENT_ARCHS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Loss Function</Label>
                  <select value={lossFn} onChange={(e) => setLossFn(e.target.value)}
                    className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2">
                    {LOSS_FUNCTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Teacher Hidden Dim</Label>
                  <Input type="number" value={teacherHidden} onChange={(e) => setTeacherHidden(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Student Hidden Dim</Label>
                  <Input type="number" value={studentHidden} onChange={(e) => setStudentHidden(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Epochs</Label>
                  <Input type="number" value={epochs} onChange={(e) => setEpochs(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Temperature</Label>
                  <Input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Alpha (KD Weight)</Label>
                  <Input type="number" step="0.05" value={alpha} onChange={(e) => setAlpha(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Strategy Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Transfer Layers (Hint)</Label>
                  <Input value={transferLayers} onChange={(e) => setTransferLayers(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Feature Layers (Feature)</Label>
                  <Input value={featureLayers} onChange={(e) => setFeatureLayers(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Relation Types</Label>
                  <Input value={relationTypes} onChange={(e) => setRelationTypes(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Teacher Archs (Multi)</Label>
                  <Input value={teacherArchs} onChange={(e) => setTeacherArchs(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Progressive Stages</Label>
                  <Input type="number" value={numStages} onChange={(e) => setNumStages(Number(e.target.value))}
                    className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Fusion Method</Label>
                  <select value={fusionMethod} onChange={(e) => setFusionMethod(e.target.value)}
                    className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2">
                    <option value="weighted_avg">Weighted Average</option>
                    <option value="gating">Gating</option>
                    <option value="stacking">Stacking</option>
                    <option value="moe">MoE</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmark Tab */}
        <TabsContent value="benchmark" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Distillation Benchmark</CardTitle>
              <CardDescription className="text-gray-400">Compare all distillation strategies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button onClick={() => callApi("benchmark", {
                  teacher_arch: teacherArch,
                  student_arch: studentArch,
                  epochs
                }, setBenchResult)} disabled={loading} className="bg-blue-700 hover:bg-blue-600">
                  {loading ? "Running..." : "Run Benchmark"}
                </Button>
              </div>

              {benchResult && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div><span className="text-gray-400">Teacher:</span> <span className="text-white">{benchResult.teacher_arch}</span></div>
                    <div><span className="text-gray-400">Student:</span> <span className="text-white">{benchResult.student_arch}</span></div>
                    <div><span className="text-gray-400">Compression:</span> <span className="text-white">{benchResult.compression_ratio}x</span></div>
                    <div><span className="text-gray-400">Best:</span> <span className="text-green-400 font-bold">{benchResult.best_strategy}</span></div>
                  </div>

                  <div className="space-y-2">
                    {benchResult.ranking?.map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                        <span className="text-gray-400 w-6">#{i + 1}</span>
                        <span className="text-white w-32">{r.strategy}</span>
                        <Progress value={r.accuracy * 111} className="flex-1" />
                        <span className="text-white w-16">{r.accuracy.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {summaryResult && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">v1.88 Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div><span className="text-gray-400">KD Cached:</span> <span className="text-white">{summaryResult.kd_cached}</span></div>
                  <div><span className="text-gray-400">Teachers:</span> <span className="text-white">{summaryResult.teacher_states}</span></div>
                  <div><span className="text-gray-400">Students:</span> <span className="text-white">{summaryResult.student_states}</span></div>
                  <div><span className="text-gray-400">Entities:</span> <span className="text-white">{summaryResult.total_entities}</span></div>
                </div>
                <div className="text-gray-400">Modules: {summaryResult.modules?.join(", ")}</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}