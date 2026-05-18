"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const CL_STRATEGIES = [
  { value: "ewc", label: "EWC", desc: "Elastic Weight Consolidation" },
  { value: "si", label: "SI", desc: "Synaptic Intelligence" },
  { value: "mas", label: "MAS", desc: "Memory Aware Synapses" },
  { value: "gem", label: "GEM", desc: "Gradient Episodic Memory" },
  { value: "packnet", label: "PackNet", desc: "Packing/Pruning networks" },
  { value: "progressive", label: "Progressive", desc: "Progressive network expansion" },
  { value: "lwf", label: "LwF", desc: "Learning without Forgetting" },
  { value: "hat", label: "HAT", desc: "Hard Attention to Task" },
];

const BOUNDARY_METHODS = [
  { value: "ood_detection", label: "OOD Detection", desc: "Out-of-distribution signals" },
  { value: "uncertainty_spike", label: "Uncertainty Spike", desc: "Sudden uncertainty increase" },
  { value: "feature_drift", label: "Feature Drift", desc: "Feature distribution shift" },
  { value: "label_shift", label: "Label Shift", desc: "Label distribution change" },
  { value: "combined", label: "Combined", desc: "Multi-signal ensemble" },
];

const REPLAY_STRATEGIES = [
  { value: "random", label: "Random", desc: "Uniform random sampling" },
  { value: "uncertainty_weighted", label: "Uncertainty Weighted", desc: "Weighted by uncertainty score" },
  { value: "diversity", label: "Diversity", desc: "Maximize sample diversity" },
  { value: "prototype", label: "Prototype", desc: "Class prototype selection" },
  { value: "gradient_based", label: "Gradient Based", desc: "Gradient norm selection" },
  { value: "coreset", label: "Coreset", desc: "Representative coreset" },
];

const TRANSFER_TYPES = [
  { value: "forward", label: "Forward Transfer", desc: "Past → Future task knowledge" },
  { value: "backward", label: "Backward Transfer", desc: "New → Old task influence" },
  { value: "lateral", label: "Lateral Transfer", desc: "Parallel task sharing" },
  { value: "negative", label: "Negative Transfer", desc: "Harmful interference" },
  { value: "zero", label: "Zero Transfer", desc: "No transfer effect" },
];

const FORGETTING_MEASURES = [
  { value: "accuracy_drop", label: "Accuracy Drop", desc: "Direct accuracy decrease" },
  { value: "bwt", label: "BWT", desc: "Backward Transfer metric" },
  { value: "fwt", label: "FWT", desc: "Forward Transfer metric" },
  { value: "remembering", label: "Remembering", desc: "Knowledge retention score" },
  { value: "learning_curve", label: "Learning Curve", desc: "AUC of learning trajectory" },
];

const PRIVACY_LEVELS = [
  { value: "none", label: "None", desc: "No privacy constraints" },
  { value: "local_dp", label: "Local DP", desc: "Local differential privacy" },
  { value: "global_dp", label: "Global DP", desc: "Global differential privacy" },
  { value: "federated_dp", label: "Federated DP", desc: "Federated DP training" },
];

export default function GraphContinualLearningV2Page() {
  const [activeTab, setActiveTab] = useState("boundary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [graphId, setGraphId] = useState("graph1");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  // Boundary params
  const [selectedMethods, setSelectedMethods] = useState<string[]>(["ood_detection", "uncertainty_spike", "combined"]);
  const [threshold, setThreshold] = useState(0.6);
  const [windowSize, setWindowSize] = useState(10);
  const [oodSensitivity, setOodSensitivity] = useState(0.8);

  // Strategy params
  const [strategy, setStrategy] = useState("ewc");
  const [taskId, setTaskId] = useState("task_1");
  const [numTasks, setNumTasks] = useState(5);
  const [regStrength, setRegStrength] = useState(1.0);
  const [privacyLevel, setPrivacyLevel] = useState("none");
  const [fairnessWeight, setFairnessWeight] = useState(0.1);

  // Forgetting params
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>(["accuracy_drop", "bwt", "remembering"]);
  const [alertThreshold, setAlertThreshold] = useState(0.15);
  const [forgetWindowSize, setForgetWindowSize] = useState(5);

  // Replay params
  const [replayStrategy, setReplayStrategy] = useState("uncertainty_weighted");
  const [bufferSize, setBufferSize] = useState(200);
  const [replayRatio, setReplayRatio] = useState(0.3);
  const [uncThreshold, setUncThreshold] = useState(0.5);
  const [divWeight, setDivWeight] = useState(0.5);

  // Transfer params
  const [selectedTransferTypes, setSelectedTransferTypes] = useState<string[]>(["forward", "backward"]);
  const [granularity, setGranularity] = useState("task");

  // Evaluate params
  const [evalStrategies, setEvalStrategies] = useState<string[]>(["ewc", "si", "mas", "gem", "lwf"]);
  const [includePrivacy, setIncludePrivacy] = useState(true);
  const [includeFairness, setIncludeFairness] = useState(true);
  const [includeExplainability, setIncludeExplainability] = useState(true);

  const callAPI = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/knowledge-graph${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleBoundary = () => callAPI("/continual-v2/task-boundary", {
    graph_id: graphId, methods: selectedMethods, threshold,
    window_size: windowSize, ood_sensitivity: oodSensitivity,
  });

  const handleStrategy = () => callAPI("/continual-v2/strategy", {
    graph_id: graphId, strategy, task_id: taskId, num_tasks: numTasks,
    regularization_strength: regStrength, privacy_level: privacyLevel,
    fairness_weight: fairnessWeight,
  });

  const handleForgetting = () => callAPI("/continual-v2/forgetting", {
    graph_id: graphId, measures: selectedMeasures, num_tasks: numTasks,
    alert_threshold: alertThreshold, window_size: forgetWindowSize,
  });

  const handleReplay = () => callAPI("/continual-v2/replay", {
    graph_id: graphId, strategy: replayStrategy, buffer_size: bufferSize,
    replay_ratio: replayRatio, uncertainty_threshold: uncThreshold,
    diversity_weight: divWeight,
  });

  const handleTransfer = () => callAPI("/continual-v2/transfer", {
    graph_id: graphId, num_tasks: numTasks,
    transfer_types: selectedTransferTypes, granularity,
  });

  const handleEvaluate = () => callAPI("/continual-v2/evaluate", {
    graph_id: graphId, num_tasks: numTasks, strategies: evalStrategies,
    include_privacy: includePrivacy, include_fairness: includeFairness,
    include_explainability: includeExplainability,
  });

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);
  };

  const renderResultPanel = (title: string = "Result") => {
    if (!result) return null;
    return (
      <Card className="mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-[400px]">
            {JSON.stringify(result, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Graph Continual Learning v2 Engine</h1>
          <p className="text-muted-foreground text-sm">
            OOD-Aware Lifelong Learning with Uncertainty, Privacy, Fairness & Explainability Integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Graph ID</Label>
          <Input value={graphId} onChange={e => setGraphId(e.target.value)} className="w-32 h-8 text-xs" />
          <Badge variant="outline" className="text-xs">v1.96</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="boundary">Task Boundary</TabsTrigger>
          <TabsTrigger value="strategy">CL Strategy</TabsTrigger>
          <TabsTrigger value="forgetting">Forgetting</TabsTrigger>
          <TabsTrigger value="replay">Replay</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
        </TabsList>

        {/* Tab 1: Task Boundary Detection */}
        <TabsContent value="boundary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Task Boundary Detection</CardTitle>
                <CardDescription>
                  Detect when new tasks begin using OOD + uncertainty + drift signals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Detection Methods</Label>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {BOUNDARY_METHODS.map(m => (
                      <label key={m.value} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMethods.includes(m.value)}
                          onChange={() => toggleItem(selectedMethods, m.value, setSelectedMethods)}
                          className="h-3 w-3"
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Threshold</Label>
                    <Input type="number" step="0.05" min="0.1" max="1.0" value={threshold}
                      onChange={e => setThreshold(parseFloat(e.target.value) || 0.6)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Window Size</Label>
                    <Input type="number" min="5" max="50" value={windowSize}
                      onChange={e => setWindowSize(parseInt(e.target.value) || 10)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">OOD Sensitivity</Label>
                    <Input type="number" step="0.05" min="0.1" max="1.0" value={oodSensitivity}
                      onChange={e => setOodSensitivity(parseFloat(e.target.value) || 0.8)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleBoundary} disabled={loading} className="w-full" size="sm">
                  {loading ? "Detecting..." : "Detect Task Boundaries"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Integration Stack</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">v1.89 OOD Detection</span> — Out-of-distribution signals for task change</p>
                <p><span className="font-medium text-foreground">v1.90 Uncertainty</span> — Uncertainty spikes at task boundaries</p>
                <p><span className="font-medium text-foreground">v1.91 Anomaly</span> — Anomalous feature drift detection</p>
                <p><span className="font-medium text-foreground">Multi-Signal Fusion</span> — Combined confidence scoring</p>
                <p><span className="font-medium text-foreground">Adaptive Window</span> — Sliding window with configurable size</p>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Task Boundary Result")}
        </TabsContent>

        {/* Tab 2: CL Strategy */}
        <TabsContent value="strategy">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Continual Learning Strategy</CardTitle>
                <CardDescription>
                  Apply CL strategies with privacy & fairness constraints
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Strategy</Label>
                  <select className="w-full h-8 text-xs border rounded px-2" value={strategy} onChange={e => setStrategy(e.target.value)}>
                    {CL_STRATEGIES.map(s => (
                      <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Task ID</Label>
                    <Input value={taskId} onChange={e => setTaskId(e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Num Tasks</Label>
                    <Input type="number" min="2" max="20" value={numTasks}
                      onChange={e => setNumTasks(parseInt(e.target.value) || 5)} className="h-8 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Reg Strength</Label>
                    <Input type="number" step="0.1" min="0.1" max="10" value={regStrength}
                      onChange={e => setRegStrength(parseFloat(e.target.value) || 1.0)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Privacy Level</Label>
                    <select className="w-full h-8 text-xs border rounded px-1" value={privacyLevel} onChange={e => setPrivacyLevel(e.target.value)}>
                      {PRIVACY_LEVELS.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Fairness Weight</Label>
                    <Input type="number" step="0.05" min="0" max="1" value={fairnessWeight}
                      onChange={e => setFairnessWeight(parseFloat(e.target.value) || 0.1)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleStrategy} disabled={loading} className="w-full" size="sm">
                  {loading ? "Applying..." : "Apply Strategy"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Strategy Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {CL_STRATEGIES.map(s => (
                  <div key={s.value} className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-xs">{s.label}</Badge>
                    <span className="text-muted-foreground">{s.desc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Strategy Result")}
        </TabsContent>

        {/* Tab 3: Forgetting Monitor */}
        <TabsContent value="forgetting">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Catastrophic Forgetting Monitor</CardTitle>
                <CardDescription>
                  Monitor and detect catastrophic forgetting across tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Forgetting Measures</Label>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {FORGETTING_MEASURES.map(m => (
                      <label key={m.value} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMeasures.includes(m.value)}
                          onChange={() => toggleItem(selectedMeasures, m.value, setSelectedMeasures)}
                          className="h-3 w-3"
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Num Tasks</Label>
                    <Input type="number" min="2" max="20" value={numTasks}
                      onChange={e => setNumTasks(parseInt(e.target.value) || 5)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Alert Threshold</Label>
                    <Input type="number" step="0.05" min="0.05" max="0.5" value={alertThreshold}
                      onChange={e => setAlertThreshold(parseFloat(e.target.value) || 0.15)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Window Size</Label>
                    <Input type="number" min="3" max="20" value={forgetWindowSize}
                      onChange={e => setForgetWindowSize(parseInt(e.target.value) || 5)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleForgetting} disabled={loading} className="w-full" size="sm">
                  {loading ? "Monitoring..." : "Monitor Forgetting"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Forgetting Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {FORGETTING_MEASURES.map(m => (
                  <div key={m.value} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{m.label}</span>
                    <span className="text-muted-foreground">{m.desc}</span>
                  </div>
                ))}
                <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
                  <p><span className="font-medium text-foreground">v1.91 Integration</span> — Anomaly-based forgetting alerts</p>
                </div>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Forgetting Monitor Result")}
        </TabsContent>

        {/* Tab 4: Experience Replay */}
        <TabsContent value="replay">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Experience Replay Management</CardTitle>
                <CardDescription>
                  Manage replay buffers with uncertainty-aware sampling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Replay Strategy</Label>
                  <select className="w-full h-8 text-xs border rounded px-2" value={replayStrategy} onChange={e => setReplayStrategy(e.target.value)}>
                    {REPLAY_STRATEGIES.map(s => (
                      <option key={s.value} value={s.value}>{s.label} — {s.desc}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Buffer Size</Label>
                    <Input type="number" min="50" max="1000" value={bufferSize}
                      onChange={e => setBufferSize(parseInt(e.target.value) || 200)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Replay Ratio</Label>
                    <Input type="number" step="0.05" min="0.1" max="0.8" value={replayRatio}
                      onChange={e => setReplayRatio(parseFloat(e.target.value) || 0.3)} className="h-8 text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Uncertainty Threshold</Label>
                    <Input type="number" step="0.05" min="0" max="1" value={uncThreshold}
                      onChange={e => setUncThreshold(parseFloat(e.target.value) || 0.5)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Diversity Weight</Label>
                    <Input type="number" step="0.05" min="0" max="1" value={divWeight}
                      onChange={e => setDivWeight(parseFloat(e.target.value) || 0.5)} className="h-8 text-xs" />
                  </div>
                </div>
                <Button onClick={handleReplay} disabled={loading} className="w-full" size="sm">
                  {loading ? "Managing..." : "Manage Replay Buffer"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Replay Strategies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {REPLAY_STRATEGIES.map(s => (
                  <div key={s.value} className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-xs">{s.label}</Badge>
                    <span className="text-muted-foreground">{s.desc}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Replay Result")}
        </TabsContent>

        {/* Tab 5: Knowledge Transfer */}
        <TabsContent value="transfer">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Knowledge Transfer Analysis</CardTitle>
                <CardDescription>
                  Analyze forward/backward/lateral transfer between tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Transfer Types</Label>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {TRANSFER_TYPES.map(t => (
                      <label key={t.value} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTransferTypes.includes(t.value)}
                          onChange={() => toggleItem(selectedTransferTypes, t.value, setSelectedTransferTypes)}
                          className="h-3 w-3"
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Num Tasks</Label>
                    <Input type="number" min="2" max="20" value={numTasks}
                      onChange={e => setNumTasks(parseInt(e.target.value) || 5)} className="h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-xs">Granularity</Label>
                    <select className="w-full h-8 text-xs border rounded px-2" value={granularity} onChange={e => setGranularity(e.target.value)}>
                      <option value="task">Task-level</option>
                      <option value="epoch">Epoch-level</option>
                      <option value="layer">Layer-level</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleTransfer} disabled={loading} className="w-full" size="sm">
                  {loading ? "Analyzing..." : "Analyze Transfer"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Transfer Analysis Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">Transfer Matrix</span> — N×N task-to-task transfer scores</p>
                <p><span className="font-medium text-foreground">Forward Transfer</span> — How past tasks help future tasks</p>
                <p><span className="font-medium text-foreground">Backward Transfer</span> — How new tasks affect old tasks</p>
                <p><span className="font-medium text-foreground">Knowledge Graph</span> — Shared/unique features per task</p>
                <p><span className="font-medium text-foreground">v1.95 Integration</span> — Attribution continuity tracking</p>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Transfer Analysis Result")}
        </TabsContent>

        {/* Tab 6: Comprehensive Evaluation */}
        <TabsContent value="evaluate">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Continual Learning Evaluation</CardTitle>
                <CardDescription>
                  Comprehensive evaluation across strategies with all integrations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Strategies to Compare</Label>
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    {CL_STRATEGIES.map(s => (
                      <label key={s.value} className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={evalStrategies.includes(s.value)}
                          onChange={() => toggleItem(evalStrategies, s.value, setEvalStrategies)}
                          className="h-3 w-3"
                        />
                        {s.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Num Tasks</Label>
                  <Input type="number" min="2" max="20" value={numTasks}
                    onChange={e => setNumTasks(parseInt(e.target.value) || 5)} className="h-8 text-xs" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="checkbox" checked={includePrivacy}
                      onChange={e => setIncludePrivacy(e.target.checked)} className="h-3 w-3" />
                    Privacy
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="checkbox" checked={includeFairness}
                      onChange={e => setIncludeFairness(e.target.checked)} className="h-3 w-3" />
                    Fairness
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="checkbox" checked={includeExplainability}
                      onChange={e => setIncludeExplainability(e.target.checked)} className="h-3 w-3" />
                    Explainability
                  </label>
                </div>
                <Button onClick={handleEvaluate} disabled={loading} className="w-full" size="sm">
                  {loading ? "Evaluating..." : "Evaluate Strategies"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Integration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">v1.89 OOD</span> — Task boundary identification</p>
                <p><span className="font-medium text-foreground">v1.90 Uncertainty</span> — Replay quality weighting</p>
                <p><span className="font-medium text-foreground">v1.91 Anomaly</span> — Forgetting anomaly alerts</p>
                <p><span className="font-medium text-foreground">v1.92 Privacy</span> — DP continual learning</p>
                <p><span className="font-medium text-foreground">v1.93 AutoML</span> — Strategy auto-selection</p>
                <p><span className="font-medium text-foreground">v1.94 Fairness</span> — Fair continual learning</p>
                <p><span className="font-medium text-foreground">v1.95 Explainability</span> — Explanation continuity</p>
              </CardContent>
            </Card>
          </div>
          {renderResultPanel("Evaluation Result")}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="text-center text-sm text-muted-foreground">Running continual learning analysis...</div>
      )}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <p className="text-sm text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
