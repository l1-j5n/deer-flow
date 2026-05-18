"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const STRATEGIES = [
  { value: "maml", label: "MAML", desc: "Model-Agnostic Meta-Learning (2nd order)" },
  { value: "fomaml", label: "FOMAML", desc: "First-Order MAML (efficient)" },
  { value: "reptile", label: "Reptile", desc: "Reptile meta-learning" },
  { value: "anil", label: "ANIL", desc: "Almost No Inner Loop" },
  { value: "boil", label: "BOIL", desc: "Body-Only Inner Loop" },
];

const TASK_TYPES = [
  { value: "classification", label: "Classification", desc: "Graph classification" },
  { value: "regression", label: "Regression", desc: "Value prediction" },
  { value: "link_prediction", label: "Link Pred", desc: "Edge prediction" },
  { value: "node_classification", label: "Node Class", desc: "Node-level prediction" },
  { value: "graph_classification", label: "Graph Class", desc: "Graph-level prediction" },
];

const ADAPT_MODES = [
  { value: "few_shot", label: "Few-Shot", desc: "5-shot adaptation" },
  { value: "zero_shot", label: "Zero-Shot", desc: "No target data" },
  { value: "many_shot", label: "Many-Shot", desc: "Abundant target data" },
  { value: "incremental", label: "Incremental", desc: "Progressive adaptation" },
];

const GEN_TYPES = [
  { value: "in_domain", label: "In-Domain", desc: "Same domain transfer" },
  { value: "cross_domain", label: "Cross-Domain", desc: "Different domain" },
  { value: "cross_task", label: "Cross-Task", desc: "Different task type" },
  { value: "cross_modal", label: "Cross-Modal", desc: "Different modality" },
  { value: "compositional", label: "Compositional", desc: "Composed tasks" },
];

const CL_MODES = [
  { value: "sequential", label: "Sequential", desc: "Sequential task learning" },
  { value: "compositional", label: "Compositional", desc: "Compositional knowledge" },
  { value: "hierarchical", label: "Hierarchical", desc: "Hierarchical task structure" },
  { value: "replay_enhanced", label: "Replay+", desc: "Replay-enhanced meta-CL" },
  { value: "regularization", label: "Regularized", desc: "Regularization-based" },
];

const INIT_METHODS = [
  { value: "random", label: "Random", desc: "Random initialization" },
  { value: "pretrained", label: "Pretrained", desc: "SSL-pretrained init" },
  { value: "nas_optimized", label: "NAS-Opt", desc: "NAS-optimized architecture" },
  { value: "distilled", label: "Distilled", desc: "Distilled knowledge init" },
  { value: "fl_warmed", label: "FL-Warmed", desc: "FL warm-started init" },
];

type TabKey = "task" | "train" | "adapt" | "general" | "continual" | "report";

export default function GraphMetaLearningV2Page() {
  const [activeTab, setActiveTab] = useState<TabKey>("task");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);

  // Task Generation state
  const [taskType, setTaskType] = useState("node_classification");
  const [numTasks, setNumTasks] = useState("20");
  const [kShot, setKShot] = useState("5");
  const [kQuery, setKQuery] = useState("15");
  const [initMethod, setInitMethod] = useState("pretrained");

  // Meta-Training state
  const [strategy, setStrategy] = useState("maml");
  const [metaLr, setMetaLr] = useState("0.001");
  const [innerLr, setInnerLr] = useState("0.01");
  const [innerSteps, setInnerSteps] = useState("5");
  const [metaSteps, setMetaSteps] = useState("100");

  // Adaptation state
  const [adaptMode, setAdaptMode] = useState("few_shot");
  const [adaptSteps, setAdaptSteps] = useState("10");
  const [targetTasks, setTargetTasks] = useState("10");

  // Generalization state
  const [genType, setGenType] = useState("cross_domain");
  const [sourceTasks, setSourceTasks] = useState("10");
  const [genTargetTasks, setGenTargetTasks] = useState("10");

  // Continual state
  const [clMode, setClMode] = useState("replay_enhanced");
  const [clTasks, setClTasks] = useState("10");
  const [clAdaptSteps, setClAdaptSteps] = useState("5");

  async function submitEndpoint(endpoint: string, body: Record<string, any>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/meta-v2/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  }

  function handleTaskGen() {
    submitEndpoint("task", {
      graph_id: "default",
      task_type: taskType,
      num_tasks: parseInt(numTasks),
      k_shot: parseInt(kShot),
      k_query: parseInt(kQuery),
      init_method: initMethod,
      seed: 42,
    });
  }

  function handleTrain() {
    submitEndpoint("train", {
      graph_id: "default",
      strategy,
      num_tasks: parseInt(numTasks),
      meta_lr: parseFloat(metaLr),
      inner_lr: parseFloat(innerLr),
      num_inner_steps: parseInt(innerSteps),
      num_meta_steps: parseInt(metaSteps),
      init_method: initMethod,
      seed: 42,
    });
  }

  function handleAdapt() {
    submitEndpoint("adapt", {
      graph_id: "default",
      adaptation_mode: adaptMode,
      strategy,
      k_shot: parseInt(kShot),
      num_adaptation_steps: parseInt(adaptSteps),
      num_target_tasks: parseInt(targetTasks),
      seed: 42,
    });
  }

  function handleGeneralize() {
    submitEndpoint("generalize", {
      graph_id: "default",
      generalization_type: genType,
      num_source_tasks: parseInt(sourceTasks),
      num_target_tasks: parseInt(genTargetTasks),
      strategy,
      seed: 42,
    });
  }

  function handleContinual() {
    submitEndpoint("continual", {
      graph_id: "default",
      continual_mode: clMode,
      strategy,
      num_tasks: parseInt(clTasks),
      adaptation_steps: parseInt(clAdaptSteps),
      seed: 42,
    });
  }

  function handleReport() {
    submitEndpoint("report", {
      graph_id: "default",
      include_task: true,
      include_train: true,
      include_adapt: true,
      include_general: true,
      include_continual: true,
      seed: 42,
    });
  }

  const BADGE_COLOR: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400",
    high: "bg-orange-500/20 text-orange-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-blue-500/20 text-blue-400",
  };

  function renderConfig(label: string, options: { value: string; label: string; desc: string }[], value: string, setter: (v: string) => void) {
    return (
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <Button
              key={o.value}
              size="sm"
              variant={value === o.value ? "default" : "outline"}
              onClick={() => setter(o.value)}
              className="text-xs"
              title={o.desc}
            >
              {o.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  function renderResultCard(title: string, data: Record<string, any>) {
    if (data.error) {
      return (
        <Card className="border-red-800">
          <CardHeader><CardTitle className="text-red-400 text-sm">Error</CardTitle></CardHeader>
          <CardContent><p className="text-xs text-red-300">{data.error}</p></CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription className="text-xs">
            Task ID: {data.task_id} | Time: {data.computation_time_ms}ms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {renderMetricsGrid(data)}
          {renderTrajectory(data)}
          {renderIntegration(data)}
        </CardContent>
      </Card>
    );
  }

  function renderMetricsGrid(data: Record<string, any>) {
    const metricSections = [
      { title: "Task Statistics", data: data.task_statistics },
      { title: "Support Statistics", data: data.support_statistics },
      { title: "Init Profile", data: data.initialization_profile },
      { title: "Final Metrics", data: data.final_metrics },
      { title: "Inner Loop Analysis", data: data.inner_loop_analysis },
      { title: "Adaptation Metrics", data: data.adaptation_metrics },
      { title: "Generalization Metrics", data: data.generalization_metrics },
      { title: "Task Similarity", data: data.task_similarity },
      { title: "Meta-CL Metrics", data: data.meta_cl_metrics },
      { title: "Compute Cost", data: data.compute_cost },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {metricSections.filter((s) => s.data).map((section) => (
          <Card key={section.title} className="bg-muted/30">
            <CardHeader className="py-1 px-3">
              <CardTitle className="text-xs text-muted-foreground">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-2">
              {Object.entries(section.data).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-0.5">
                  <span className="text-muted-foreground">{k.replace(/_/g, " ")}</span>
                  <span className="font-mono">{typeof v === "number" ? v.toFixed(4) : String(v)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function renderTrajectory(data: Record<string, any>) {
    const trajectory = data.meta_trajectory || data.adaptation_trajectory;
    if (!trajectory || !Array.isArray(trajectory) || trajectory.length === 0) return null;

    const sampled = trajectory.length > 15
      ? trajectory.filter((_: any, i: number) => i % Math.ceil(trajectory.length / 15) === 0 || i === trajectory.length - 1)
      : trajectory;

    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Learning Trajectory ({trajectory.length} steps)</p>
        <div className="flex gap-1 items-end h-24 overflow-x-auto">
          {sampled.map((point: any, i: number) => {
            const acc = point.val_accuracy || point.accuracy || 0;
            const height = Math.max(4, acc * 100);
            return (
              <div key={i} className="flex flex-col items-center gap-0.5 min-w-[24px]">
                <span className="text-[9px] text-muted-foreground">{(acc * 100).toFixed(0)}%</span>
                <div
                  className="bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t w-5"
                  style={{ height: `${height}px` }}
                  title={`Step ${point.step}: ${(acc * 100).toFixed(1)}%`}
                />
                <span className="text-[8px] text-muted-foreground">{point.step}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderIntegration(data: Record<string, any>) {
    const integration = data.engine_integration;
    if (!integration) return null;

    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Engine Integration</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(integration).map(([key, value]) => {
            const val = value as Record<string, any>;
            const source = val.source || "";
            return (
              <Badge key={key} variant="secondary" className="text-[10px] gap-1">
                <span className="text-blue-400">{key}</span>
                {source && <span className="text-muted-foreground">({source})</span>}
              </Badge>
            );
          })}
        </div>
      </div>
    );
  }

  function renderReport(data: Record<string, any>) {
    if (!data.version) return null;

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{data.feature}</CardTitle>
          <CardDescription className="text-xs">{data.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Overall Score:</span>
            <div className="flex-1 bg-muted rounded-full h-3 max-w-xs">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full h-3" style={{ width: `${(data.overall_score || 0) * 100}%` }} />
            </div>
            <span className="text-xs font-mono">{((data.overall_score || 0) * 100).toFixed(1)}%</span>
          </div>

          {data.capability_space && (
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(data.capability_space).map(([k, v]) => (
                <div key={k} className="text-center p-2 bg-muted/30 rounded">
                  <p className="text-lg font-bold">{String(v)}</p>
                  <p className="text-[10px] text-muted-foreground">{k.replace(/_/g, " ")}</p>
                </div>
              ))}
            </div>
          )}

          {data.integration_map && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Integration Map ({Object.keys(data.integration_map).length} engines)</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(data.integration_map).map(([k, v]) => (
                  <Badge key={k} variant="outline" className="text-[9px]">{k}: {String(v).split("—")[0]}</Badge>
                ))}
              </div>
            </div>
          )}

          {data.recommendations && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Recommendations</p>
              {data.recommendations.map((rec: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Badge className={`text-[9px] ${BADGE_COLOR[rec.priority] || "bg-gray-500/20"}`}>
                    {rec.priority}
                  </Badge>
                  <div>
                    <p>{rec.suggestion}</p>
                    <p className="text-green-400">{rec.expected_gain}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.modules_included && (
            <div className="flex flex-wrap gap-1">
              {data.modules_included.map((m: any) => (
                <Badge key={m.module} variant="secondary" className="text-[10px]">
                  {m.module} ({m.cached})
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  function renderTargetTasks(data: Record<string, any>) {
    if (!data.target_tasks || !Array.isArray(data.target_tasks)) return null;
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Target Tasks ({data.target_tasks.length})</p>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {data.target_tasks.map((t: any) => (
            <div key={t.task_id} className="flex items-center gap-2 text-xs bg-muted/20 rounded px-2 py-1">
              <span className="font-mono text-muted-foreground">{t.task_id}</span>
              <Badge variant="outline" className="text-[9px]">+{((t.adaptation_gain || 0) * 100).toFixed(1)}%</Badge>
              <span className="ml-auto">{((t.post_adapt_accuracy || 0) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderForgettingEvents(data: Record<string, any>) {
    if (!data.forgetting_events || !Array.isArray(data.forgetting_events)) return null;
    if (data.forgetting_events.length === 0) {
      return <p className="text-xs text-green-400">No significant forgetting events detected</p>;
    }
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Forgetting Events ({data.forgetting_events.length})</p>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {data.forgetting_events.map((evt: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-muted/20 rounded px-2 py-1">
              <Badge className={`text-[9px] ${BADGE_COLOR[evt.severity] || ""}`}>{evt.severity}</Badge>
              <span>Task {evt.after_task} → {evt.forgotten_task}</span>
              <span className="text-red-400">-{(evt.accuracy_drop * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderAccuracyMatrix(data: Record<string, any>) {
    const matrix = data.accuracy_matrix;
    if (!matrix || !Array.isArray(matrix) || matrix.length === 0) return null;
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Accuracy Matrix</p>
        <div className="overflow-x-auto">
          <table className="text-[9px] border-collapse">
            <tbody>
              {matrix.map((row: number[], i: number) => (
                <tr key={i}>
                  {row.map((val: number, j: number) => {
                    const intensity = Math.min(255, Math.floor(val * 255));
                    return (
                      <td
                        key={j}
                        className="border border-muted/30 px-1 py-0.5 text-center font-mono"
                        style={{ backgroundColor: `rgb(0, ${intensity}, ${Math.floor(intensity * 0.8)})`, color: val > 0.7 ? "#fff" : "#888" }}
                        title={`Task ${i} after ${j}: ${(val * 100).toFixed(1)}%`}
                      >
                        {(val * 100).toFixed(0)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">Meta-Learning v2</h2>
        <Badge variant="outline" className="text-xs">v1.202</Badge>
        <span className="text-xs text-muted-foreground ml-2">
          FL-Guided Distributed Meta-Learning with NAS + Distillation
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="task" className="text-xs">Task Gen</TabsTrigger>
          <TabsTrigger value="train" className="text-xs">Train</TabsTrigger>
          <TabsTrigger value="adapt" className="text-xs">Adapt</TabsTrigger>
          <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
          <TabsTrigger value="continual" className="text-xs">Continual</TabsTrigger>
          <TabsTrigger value="report" className="text-xs">Report</TabsTrigger>
        </TabsList>

        {/* Task Generation */}
        <TabsContent value="task" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Meta-Task Generation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {renderConfig("Task Type", TASK_TYPES, taskType, setTaskType)}
              {renderConfig("Init Method", INIT_METHODS, initMethod, setInitMethod)}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Num Tasks</Label>
                  <Input type="number" value={numTasks} onChange={(e) => setNumTasks(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">K-Shot</Label>
                  <Input type="number" value={kShot} onChange={(e) => setKShot(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">K-Query</Label>
                  <Input type="number" value={kQuery} onChange={(e) => setKQuery(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <Button onClick={handleTaskGen} disabled={loading} size="sm">
                {loading ? "Generating..." : "Generate Tasks"}
              </Button>
            </CardContent>
          </Card>
          {result && renderResultCard("Task Generation Result", result)}
        </TabsContent>

        {/* Meta-Training */}
        <TabsContent value="train" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Meta-Training</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {renderConfig("Strategy", STRATEGIES, strategy, setStrategy)}
              {renderConfig("Init Method", INIT_METHODS, initMethod, setInitMethod)}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Meta LR</Label>
                  <Input type="text" value={metaLr} onChange={(e) => setMetaLr(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Inner LR</Label>
                  <Input type="text" value={innerLr} onChange={(e) => setInnerLr(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Num Tasks</Label>
                  <Input type="number" value={numTasks} onChange={(e) => setNumTasks(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Inner Steps</Label>
                  <Input type="number" value={innerSteps} onChange={(e) => setInnerSteps(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Meta Steps</Label>
                  <Input type="number" value={metaSteps} onChange={(e) => setMetaSteps(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <Button onClick={handleTrain} disabled={loading} size="sm">
                {loading ? "Training..." : "Start Meta-Training"}
              </Button>
            </CardContent>
          </Card>
          {result && renderResultCard("Meta-Training Result", result)}
        </TabsContent>

        {/* Adaptation */}
        <TabsContent value="adapt" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Meta-Adaptation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {renderConfig("Adaptation Mode", ADAPT_MODES, adaptMode, setAdaptMode)}
              {renderConfig("Strategy", STRATEGIES, strategy, setStrategy)}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">K-Shot</Label>
                  <Input type="number" value={kShot} onChange={(e) => setKShot(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Adapt Steps</Label>
                  <Input type="number" value={adaptSteps} onChange={(e) => setAdaptSteps(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Target Tasks</Label>
                  <Input type="number" value={targetTasks} onChange={(e) => setTargetTasks(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <Button onClick={handleAdapt} disabled={loading} size="sm">
                {loading ? "Adapting..." : "Run Adaptation"}
              </Button>
            </CardContent>
          </Card>
          {result && (
            <>
              {renderResultCard("Adaptation Result", result)}
              {renderTargetTasks(result)}
            </>
          )}
        </TabsContent>

        {/* Generalization */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Meta-Generalization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {renderConfig("Generalization Type", GEN_TYPES, genType, setGenType)}
              {renderConfig("Strategy", STRATEGIES, strategy, setStrategy)}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Source Tasks</Label>
                  <Input type="number" value={sourceTasks} onChange={(e) => setSourceTasks(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Target Tasks</Label>
                  <Input type="number" value={genTargetTasks} onChange={(e) => setGenTargetTasks(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <Button onClick={handleGeneralize} disabled={loading} size="sm">
                {loading ? "Analyzing..." : "Analyze Generalization"}
              </Button>
            </CardContent>
          </Card>
          {result && renderResultCard("Generalization Result", result)}
        </TabsContent>

        {/* Continual */}
        <TabsContent value="continual" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Meta-Continual Learning</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {renderConfig("Continual Mode", CL_MODES, clMode, setClMode)}
              {renderConfig("Strategy", STRATEGIES, strategy, setStrategy)}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Num Tasks</Label>
                  <Input type="number" value={clTasks} onChange={(e) => setClTasks(e.target.value)} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Adapt Steps</Label>
                  <Input type="number" value={clAdaptSteps} onChange={(e) => setClAdaptSteps(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <Button onClick={handleContinual} disabled={loading} size="sm">
                {loading ? "Running..." : "Run Meta-Continual"}
              </Button>
            </CardContent>
          </Card>
          {result && (
            <>
              {renderResultCard("Continual Learning Result", result)}
              {renderForgettingEvents(result)}
              {renderAccuracyMatrix(result)}
            </>
          )}
        </TabsContent>

        {/* Report */}
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Comprehensive Report</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Generate a comprehensive meta-learning v2 report integrating all modules with full v1.89-v1.201 engine integration map.
              </p>
              <Button onClick={handleReport} disabled={loading} size="sm">
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>
          {result && renderReport(result)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
