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
  { value: "ewc", label: "EWC", desc: "Elastic Weight Consolidation" },
  { value: "mas", label: "MAS", desc: "Memory Aware Synapses" },
  { value: "si", label: "SI", desc: "Synaptic Intelligence" },
  { value: "replay", label: "Replay", desc: "Experience Replay Buffer" },
  { value: "progressive", label: "Progressive", desc: "Progressive Neural Networks" },
  { value: "lwf", label: "LwF", desc: "Learning without Forgetting" },
];

const TASK_TYPES = ["node_classification", "graph_classification", "link_prediction", "edge_classification", "node_regression"];
const CURRICULUM_STRATEGIES = ["easy_to_hard", "hard_to_easy", "similarity_based", "uncertainty_based", "random"];
const REPLAY_STRATEGIES = ["random", "herding", "fifo", "reservoir", "prioritized"];

export default function GraphContinualPage() {
  const [activeTab, setActiveTab] = useState("train");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");

  // Task creation
  const [taskId, setTaskId] = useState("task_1");
  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState("node_classification");
  const [taskDataset, setTaskDataset] = useState("cora");
  const [taskClasses, setTaskClasses] = useState(7);

  // Training
  const [method, setMethod] = useState("ewc");
  const [learningRate, setLearningRate] = useState(0.001);
  const [epochs, setEpochs] = useState(100);
  const [regStrength, setRegStrength] = useState(1000);
  const [replayRatio, setReplayRatio] = useState(0.3);

  // EWC params
  const [fisherSamples, setFisherSamples] = useState(200);
  const [onlineEwc, setOnlineEwc] = useState(false);
  const [gamma, setGamma] = useState(1.0);

  // MAS params
  const [sensitivitySamples, setSensitivitySamples] = useState(100);

  // SI params
  const [siC, setSiC] = useState(0.5);
  const [damping, setDamping] = useState(0.1);
  const [omegaDecay, setOmegaDecay] = useState(0.95);

  // LwF params
  const [temperature, setTemperature] = useState(2.0);
  const [alpha, setAlpha] = useState(0.5);

  // Progressive params
  const [colWidth, setColWidth] = useState(64);
  const [lateralConn, setLateralConn] = useState(true);
  const [freezePrev, setFreezePrev] = useState(true);

  // Replay buffer
  const [replayStrategy, setReplayStrategy] = useState("herding");
  const [bufferSize, setBufferSize] = useState(500);
  const [replayAction, setReplayAction] = useState("update");
  const [replaySamples, setReplaySamples] = useState(100);

  // Evaluate
  const [evalMetric, setEvalMetric] = useState("average_forgetting");
  const [evalTasks, setEvalTasks] = useState("task_1,task_2,task_3");

  // Curriculum
  const [curriculum, setCurriculum] = useState("easy_to_hard");
  const [curriculumTasks, setCurriculumTasks] = useState("task_1,task_2,task_3,task_4");
  const [epochsPerTask, setEpochsPerTask] = useState(50);
  const [adaptLr, setAdaptLr] = useState(true);

  // Forgetting analysis
  const [forgettingTasks, setForgettingTasks] = useState("task_1,task_2,task_3");
  const [numCheckpoints, setNumCheckpoints] = useState(5);

  // Results
  const [createResult, setCreateResult] = useState<any>(null);
  const [trainResult, setTrainResult] = useState<any>(null);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [ewcResult, setEwcResult] = useState<any>(null);
  const [masResult, setMasResult] = useState<any>(null);
  const [siResult, setSiResult] = useState<any>(null);
  const [replayResult, setReplayResult] = useState<any>(null);
  const [progressiveResult, setProgressiveResult] = useState<any>(null);
  const [forgettingResult, setForgettingResult] = useState<any>(null);
  const [curriculumResult, setCurriculumResult] = useState<any>(null);
  const [lwfResult, setLwfResult] = useState<any>(null);
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

  const renderJson = (data: any) => (
    <pre className="bg-gray-950 text-green-400 p-3 rounded text-xs overflow-auto max-h-64 mt-2">
      {JSON.stringify(data, null, 2)}
    </pre>
  );

  const renderScoreBar = (score: number, label: string, maxScore: number = 1) => {
    const pct = Math.min(100, (score / maxScore) * 100);
    const color = pct > 70 ? "bg-green-500" : pct > 40 ? "bg-yellow-500" : "bg-red-500";
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-28">{label}</span>
        <div className="flex-1 bg-gray-800 rounded h-3 overflow-hidden">
          <div className={`${color} h-full rounded transition-all`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-xs text-gray-300 w-16 text-right">{(score * 100).toFixed(1)}%</span>
      </div>
    );
  };

  const renderMetricRow = (label: string, value: string | number, good?: "high" | "low") => (
    <div className="flex justify-between items-center bg-gray-900 px-3 py-1.5 rounded text-xs">
      <span className="text-gray-400">{label}</span>
      <span className={good === "high" ? "text-green-400" : good === "low" ? "text-green-400" : "text-gray-300"}>
        {typeof value === "number" ? value.toFixed(4) : value}
      </span>
    </div>
  );

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Continual Learning</h1>
          <p className="text-sm text-gray-500">v1.85 — Lifelong learning on dynamic graphs with catastrophic forgetting prevention</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-sm">Graph ID</Label>
          <Input className="w-32" value={graphId} onChange={e => setGraphId(e.target.value)} />
          <Button size="sm" variant="outline" onClick={() => callApi("v185/summary", {}, setSummaryResult)}>Summary</Button>
        </div>
      </div>

      {error && <div className="bg-red-900/50 text-red-200 p-2 rounded text-sm">{error}</div>}
      {loading && <div className="text-sm text-yellow-400 animate-pulse">Processing continual learning...</div>}

      {summaryResult && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3 text-xs">
              <Badge variant="outline">Cached: {summaryResult.continual_cached}</Badge>
              <Badge variant="outline">Tasks: {summaryResult.task_registries}</Badge>
              <Badge variant="outline">Fisher: {summaryResult.fisher_matrices}</Badge>
              <Badge variant="outline">Replay: {summaryResult.replay_buffers}</Badge>
              <Badge variant="outline">Curriculum: {summaryResult.curriculum_states}</Badge>
              <div className="flex flex-wrap gap-1 ml-2">
                {summaryResult.continual_methods?.map((m: string) => (
                  <Badge key={m} className="text-xs bg-blue-900 text-blue-200">{m.toUpperCase()}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="train">Task & Train</TabsTrigger>
          <TabsTrigger value="regularize">Regularization</TabsTrigger>
          <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* === TASK & TRAIN TAB === */}
        <TabsContent value="train" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Create Task */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Create Continual Task</CardTitle>
                <CardDescription>Register a new learning task in the sequence</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Task ID</Label>
                    <Input value={taskId} onChange={e => setTaskId(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Task Name</Label>
                    <Input value={taskName} onChange={e => setTaskName(e.target.value)} placeholder={taskId} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={taskType} onChange={e => setTaskType(e.target.value)}>
                      {TASK_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Dataset</Label>
                    <Input value={taskDataset} onChange={e => setTaskDataset(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Classes</Label>
                    <Input type="number" value={taskClasses} onChange={e => setTaskClasses(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("continual/create-task", {
                  task_id: taskId, task_name: taskName, task_type: taskType,
                  dataset: taskDataset, num_classes: taskClasses,
                }, setCreateResult)}>Create Task</Button>
                {createResult && (
                  <div className="space-y-1">
                    <div className="text-xs text-green-400 font-semibold">
                      Task: {createResult.task?.task_id} — Total: {createResult.total_tasks}
                    </div>
                    <div className="text-xs text-gray-400">Sequence: {createResult.task_sequence?.join(" → ")}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Train */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Train on Task</CardTitle>
                <CardDescription>Train with selected continual learning method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Task ID</Label>
                    <Input value={taskId} onChange={e => setTaskId(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Method</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={method} onChange={e => setMethod(e.target.value)}>
                      {METHODS.map(m => <option key={m.value} value={m.value}>{m.label} — {m.desc}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Learning Rate</Label>
                    <Input type="number" step="0.0001" value={learningRate} onChange={e => setLearningRate(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Epochs</Label>
                    <Input type="number" value={epochs} onChange={e => setEpochs(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Reg Strength</Label>
                    <Input type="number" value={regStrength} onChange={e => setRegStrength(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("continual/train", {
                  task_id: taskId, method, learning_rate: learningRate,
                  epochs, regularization_strength: regStrength, replay_ratio: replayRatio,
                }, setTrainResult)}>Train</Button>
                {trainResult && (
                  <div className="space-y-2">
                    <div className="text-xs text-green-400 font-semibold">
                      Method: {trainResult.method?.toUpperCase()} | Loss: {trainResult.train_loss}
                    </div>
                    {renderScoreBar(trainResult.validation_accuracy, "Val Acc")}
                    {renderScoreBar(trainResult.test_accuracy, "Test Acc")}
                    {trainResult.regularization_loss > 0 && (
                      <div className="text-xs text-gray-400">Reg Loss: {trainResult.regularization_loss} | Time: {trainResult.training_time_seconds}s</div>
                    )}
                    {trainResult.replay_info && (
                      <div className="text-xs text-gray-400">
                        Replay: {trainResult.replay_info.replayed_samples}/{trainResult.replay_info.buffer_size} samples
                      </div>
                    )}
                    {trainResult.progressive_info && (
                      <div className="text-xs text-gray-400">
                        Column: {trainResult.progressive_info.new_column} | Params: +{trainResult.progressive_info.added_params?.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === REGULARIZATION TAB === */}
        <TabsContent value="regularize" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* EWC */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">EWC</CardTitle>
                <CardDescription>Elastic Weight Consolidation — Fisher Information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Task ID</Label>
                    <Input value={taskId} onChange={e => setTaskId(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Fisher Samples</Label>
                    <Input type="number" value={fisherSamples} onChange={e => setFisherSamples(+e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Reg Strength</Label>
                    <Input type="number" value={regStrength} onChange={e => setRegStrength(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Gamma (Online)</Label>
                    <Input type="number" step="0.1" value={gamma} onChange={e => setGamma(+e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={onlineEwc} onChange={e => setOnlineEwc(e.target.checked)} />
                  <Label className="text-xs">Online EWC</Label>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("continual/ewc", {
                  task_id: taskId, fisher_samples: fisherSamples,
                  regularization_strength: regStrength, online_ewc: onlineEwc, gamma,
                }, setEwcResult)}>Compute EWC</Button>
                {ewcResult?.fisher_information && (
                  <div className="space-y-1">
                    {renderMetricRow("Fisher Trace", ewcResult.fisher_information.fisher_trace)}
                    {renderMetricRow("Fisher Norm", ewcResult.fisher_information.fisher_norm)}
                    {renderMetricRow("EWC Penalty", ewcResult.ewc_penalty)}
                    {renderMetricRow("Forgetting Reduction", ewcResult.estimated_forgetting_reduction, "high")}
                    {ewcResult.constraint_info && (
                      <div className="text-xs text-gray-400">Constrained tasks: {ewcResult.constraint_info.num_constrained_tasks}</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MAS */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">MAS</CardTitle>
                <CardDescription>Memory Aware Synapses — Sensitivity-based importance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Task ID</Label>
                    <Input value={taskId} onChange={e => setTaskId(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Sensitivity Samples</Label>
                    <Input type="number" value={sensitivitySamples} onChange={e => setSensitivitySamples(+e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Reg Strength</Label>
                  <Input type="number" step="0.1" value={1.0} onChange={e => setRegStrength(+e.target.value)} />
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("continual/mas", {
                  task_id: taskId, sensitivity_samples: sensitivitySamples,
                  regularization_strength: regStrength,
                }, setMasResult)}>Compute MAS</Button>
                {masResult?.importance_weights && (
                  <div className="space-y-1">
                    {renderMetricRow("Avg Importance", masResult.importance_weights.average_importance)}
                    {renderMetricRow("Sparsity", masResult.importance_weights.sparsity, "low")}
                    {renderMetricRow("MAS Penalty", masResult.mas_penalty)}
                    {renderMetricRow("Forgetting Reduction", masResult.estimated_forgetting_reduction, "high")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SI */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">SI</CardTitle>
                <CardDescription>Synaptic Intelligence — Online path-integral</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Task ID</Label>
                    <Input value={taskId} onChange={e => setTaskId(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">c (strength)</Label>
                    <Input type="number" step="0.1" value={siC} onChange={e => setSiC(+e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Damping</Label>
                    <Input type="number" step="0.01" value={damping} onChange={e => setDamping(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Omega Decay</Label>
                    <Input type="number" step="0.01" value={omegaDecay} onChange={e => setOmegaDecay(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("continual/si", {
                  task_id: taskId, c: siC, damping, omega_decay: omegaDecay,
                }, setSiResult)}>Compute SI</Button>
                {siResult?.importance_weights && (
                  <div className="space-y-1">
                    {renderMetricRow("Path Integral", siResult.path_integral_online)}
                    {renderMetricRow("Avg Importance", siResult.importance_weights.average_importance)}
                    {renderMetricRow("Forgetting Reduction", siResult.estimated_forgetting_reduction, "high")}
                    <div className="text-xs text-gray-400">c={siResult.c} | damping={siResult.damping} | decay={siResult.omega_decay}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* LwF & Progressive row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* LwF */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Learning without Forgetting (LwF)</CardTitle>
                <CardDescription>Knowledge distillation from old model to new</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Task ID</Label>
                    <Input value={taskId} onChange={e => setTaskId(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Temperature</Label>
                    <Input type="number" step="0.5" value={temperature} onChange={e => setTemperature(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Alpha</Label>
                    <Input type="number" step="0.1" value={alpha} onChange={e => setAlpha(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("continual/lwf", {
                  task_id: taskId, temperature, alpha,
                }, setLwfResult)}>Train LwF</Button>
                {lwfResult && (
                  <div className="space-y-1">
                    {renderMetricRow("Distillation Loss", lwfResult.distillation_loss, "low")}
                    {renderMetricRow("Classification Loss", lwfResult.classification_loss, "low")}
                    {renderMetricRow("Total Loss", lwfResult.total_loss, "low")}
                    {renderScoreBar(lwfResult.accuracy, "Accuracy")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progressive */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Progressive Networks</CardTitle>
                <CardDescription>Add new columns per task with lateral connections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Task ID</Label>
                    <Input value={taskId} onChange={e => setTaskId(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Column Width</Label>
                    <Input type="number" value={colWidth} onChange={e => setColWidth(+e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={lateralConn} onChange={e => setLateralConn(e.target.checked)} />
                      <Label className="text-xs">Lateral</Label>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <input type="checkbox" checked={freezePrev} onChange={e => setFreezePrev(e.target.checked)} />
                      <Label className="text-xs">Freeze</Label>
                    </div>
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("continual/progressive", {
                  task_id: taskId, new_column_width: colWidth,
                  lateral_connections: lateralConn, freeze_previous: freezePrev,
                }, setProgressiveResult)}>Add Column</Button>
                {progressiveResult?.new_column && (
                  <div className="space-y-1">
                    <div className="text-xs text-green-400 font-semibold">
                      Column {progressiveResult.new_column.column_id} | Total: {progressiveResult.total_columns}
                    </div>
                    {renderMetricRow("Total Params", progressiveResult.total_params?.toLocaleString())}
                    {renderMetricRow("Capacity Growth", progressiveResult.model_capacity_growth)}
                    {progressiveResult.new_column.lateral_connections && (
                      <div className="text-xs text-gray-400">
                        Lateral: {progressiveResult.new_column.lateral_connections.length} connections
                        ({progressiveResult.new_column.total_lateral_params?.toLocaleString()} params)
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === EVALUATE TAB === */}
        <TabsContent value="evaluate" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Evaluate */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Continual Evaluation</CardTitle>
                <CardDescription>Measure forgetting, transfer, and accuracy matrix</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Metric</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={evalMetric} onChange={e => setEvalMetric(e.target.value)}>
                      <option value="average_forgetting">Average Forgetting</option>
                      <option value="max_forgetting">Max Forgetting</option>
                      <option value="backward_transfer">Backward Transfer</option>
                      <option value="forward_transfer">Forward Transfer</option>
                      <option value="accuracy_matrix">Accuracy Matrix</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Tasks (comma-sep)</Label>
                    <Input value={evalTasks} onChange={e => setEvalTasks(e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("continual/evaluate", {
                  metric: evalMetric, tasks: evalTasks.split(",").map(t => t.trim()),
                }, setEvalResult)}>Evaluate</Button>
                {evalResult && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {renderMetricRow("Avg Forgetting", evalResult.average_forgetting, "low")}
                      {renderMetricRow("Max Forgetting", evalResult.max_forgetting, "low")}
                      {renderMetricRow("Backward Transfer", evalResult.backward_transfer, "high")}
                      {renderMetricRow("Forward Transfer", evalResult.forward_transfer, "high")}
                    </div>
                    {evalResult.accuracy_matrix && (
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-gray-300">Accuracy Matrix:</div>
                        <div className="bg-gray-950 p-2 rounded overflow-auto">
                          <table className="text-xs w-full">
                            <thead>
                              <tr>
                                <th className="text-gray-500 px-2 py-1 text-left">Task</th>
                                {evalResult.task_ids?.map((t: string) => (
                                  <th key={t} className="text-gray-500 px-2 py-1">{t}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {evalResult.task_ids?.map((rowTask: string) => (
                                <tr key={rowTask}>
                                  <td className="text-gray-300 px-2 py-1">{rowTask}</td>
                                  {evalResult.task_ids?.map((colTask: string) => {
                                    const val = evalResult.accuracy_matrix[rowTask]?.[colTask];
                                    return (
                                      <td key={colTask} className={`px-2 py-1 text-center ${val === null ? "text-gray-700" : val > 0.8 ? "text-green-400" : val > 0.7 ? "text-yellow-400" : "text-red-400"}`}>
                                        {val !== null ? (val * 100).toFixed(1) + "%" : "—"}
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Forgetting Analysis */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Forgetting Analysis</CardTitle>
                <CardDescription>Track per-task accuracy decay across checkpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Tasks (comma-sep)</Label>
                    <Input value={forgettingTasks} onChange={e => setForgettingTasks(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Checkpoints</Label>
                    <Input type="number" value={numCheckpoints} onChange={e => setNumCheckpoints(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("continual/forgetting-analysis", {
                  tasks: forgettingTasks.split(",").map(t => t.trim()), num_checkpoints: numCheckpoints,
                }, setForgettingResult)}>Analyze</Button>
                {forgettingResult?.forgetting_curves && (
                  <div className="space-y-2">
                    <div className="flex gap-2 text-xs">
                      <Badge>Severity: {forgettingResult.forgetting_severity}</Badge>
                      <Badge variant="outline">Avg: {(forgettingResult.average_forgetting * 100).toFixed(1)}%</Badge>
                    </div>
                    <div className="text-xs text-gray-400 italic">{forgettingResult.recommendation}</div>
                    {Object.entries(forgettingResult.forgetting_curves).map(([tid, data]: [string, any]) => (
                      <div key={tid} className="bg-gray-900 p-2 rounded space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-300 font-medium">{tid}</span>
                          <span className="text-red-400">Forgot: {(data.forgetting_amount * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex gap-1">
                          {data.checkpoints?.map((acc: number, i: number) => {
                            const barColor = acc > data.peak_accuracy * 0.95 ? "bg-green-500" : acc > data.peak_accuracy * 0.85 ? "bg-yellow-500" : "bg-red-500";
                            return (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div className="w-full bg-gray-800 rounded h-8 overflow-hidden flex items-end">
                                  <div className={`${barColor} w-full rounded`} style={{ height: `${acc * 100}%` }} />
                                </div>
                                <span className="text-[10px] text-gray-500">C{i+1}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === ADVANCED TAB === */}
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Curriculum Learning */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Curriculum Learning</CardTitle>
                <CardDescription>Order tasks by difficulty for better continual learning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Strategy</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={curriculum} onChange={e => setCurriculum(e.target.value)}>
                      {CURRICULUM_STRATEGIES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Epochs/Task</Label>
                    <Input type="number" value={epochsPerTask} onChange={e => setEpochsPerTask(+e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Tasks (comma-sep)</Label>
                  <Input value={curriculumTasks} onChange={e => setCurriculumTasks(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={adaptLr} onChange={e => setAdaptLr(e.target.checked)} />
                  <Label className="text-xs">Adaptive Learning Rate</Label>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("continual/curriculum", {
                  strategy: curriculum, tasks: curriculumTasks.split(",").map(t => t.trim()),
                  num_epochs_per_task: epochsPerTask, adapt_lr: adaptLr,
                }, setCurriculumResult)}>Generate Curriculum</Button>
                {curriculumResult?.schedule && (
                  <div className="space-y-2">
                    <div className="flex gap-2 text-xs">
                      <Badge>Strategy: {curriculumResult.strategy}</Badge>
                      <Badge variant="outline">Final: {(curriculumResult.final_expected_accuracy * 100).toFixed(1)}%</Badge>
                    </div>
                    {curriculumResult.schedule.map((step: any) => (
                      <div key={step.step} className="flex items-center gap-2 bg-gray-900 px-2 py-1 rounded text-xs">
                        <span className="text-gray-500 w-6">#{step.step}</span>
                        <span className="text-gray-300 flex-1">{step.task_id}</span>
                        <span className="text-yellow-400 w-14">diff: {step.difficulty}</span>
                        <span className="text-blue-400 w-16">lr: {step.learning_rate}</span>
                        <span className="text-green-400 w-16">{(step.expected_accuracy * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Replay Buffer */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Replay Buffer Management</CardTitle>
                <CardDescription>Manage experience replay for continual learning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Strategy</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={replayStrategy} onChange={e => setReplayStrategy(e.target.value)}>
                      {REPLAY_STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Action</Label>
                    <select className="w-full bg-gray-900 border rounded p-1 text-sm" value={replayAction} onChange={e => setReplayAction(e.target.value)}>
                      <option value="update">Update</option>
                      <option value="clear">Clear</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Buffer Size</Label>
                    <Input type="number" value={bufferSize} onChange={e => setBufferSize(+e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Task ID</Label>
                    <Input value={taskId} onChange={e => setTaskId(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Samples</Label>
                    <Input type="number" value={replaySamples} onChange={e => setReplaySamples(+e.target.value)} />
                  </div>
                </div>
                <Button size="sm" className="w-full" onClick={() => callApi("continual/replay", {
                  strategy: replayStrategy, buffer_size: bufferSize,
                  action: replayAction, task_id: taskId, num_samples: replaySamples,
                }, setReplayResult)}>Manage Buffer</Button>
                {replayResult && (
                  <div className="space-y-1">
                    <div className="flex gap-2 text-xs">
                      <Badge>Size: {replayResult.buffer_size}/{replayResult.max_buffer_size}</Badge>
                      <Badge variant="outline">Coverage: {(replayResult.coverage_ratio * 100).toFixed(0)}%</Badge>
                    </div>
                    {replayResult.per_task_counts && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-400">Per-task distribution:</div>
                        {Object.entries(replayResult.per_task_counts).map(([tid, count]: [string, any]) => (
                          <div key={tid} className="flex justify-between bg-gray-900 px-2 py-0.5 rounded text-xs">
                            <span className="text-gray-300">{tid}</span>
                            <span className="text-blue-400">{count} samples</span>
                          </div>
                        ))}
                      </div>
                    )}
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
