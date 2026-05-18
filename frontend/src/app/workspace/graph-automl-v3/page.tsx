"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = "";

const PIPELINE_TYPES = [
  { value: "sequential", label: "Sequential", desc: "Linear pipeline stages" },
  { value: "branching", label: "Branching", desc: "Parallel branches" },
  { value: "ensemble", label: "Ensemble", desc: "Multi-model ensemble" },
  { value: "cascade", label: "Cascade", desc: "Cascaded stages" },
  { value: "adaptive", label: "Adaptive", desc: "Self-adaptive pipeline" },
];

const HPO_STRATEGIES = [
  { value: "bayesian", label: "Bayesian", desc: "Gaussian process-based" },
  { value: "meta_guided", label: "Meta-Guide", desc: "Meta-learning warmstart" },
  { value: "evolutionary", label: "Evolution", desc: "Genetic algorithm" },
  { value: "hyperband", label: "Hyperband", desc: "Successive halving" },
  { value: "combined", label: "Combined", desc: "Hybrid strategy" },
];

const FEATURE_ENGINES = [
  { value: "structural", label: "Structural", desc: "Graph topology features" },
  { value: "spectral", label: "Spectral", desc: "Eigenvalue-based" },
  { value: "random_walk", label: "R. Walk", desc: "Random walk features" },
  { value: "attention", label: "Attention", desc: "Attention-based features" },
  { value: "meta_learned", label: "Meta-Learn", desc: "Meta-learned features" },
  { value: "combined", label: "Combined", desc: "All feature types" },
];

const ENSEMBLE_STRATEGIES = [
  { value: "voting", label: "Voting", desc: "Majority voting" },
  { value: "stacking", label: "Stacking", desc: "Meta-learner stacking" },
  { value: "blending", label: "Blending", desc: "Holdout blending" },
  { value: "weighted", label: "Weighted", desc: "Score-weighted average" },
  { value: "distillation", label: "Distill", desc: "Knowledge distillation" },
];

const EARLY_STOP = [
  { value: "patience", label: "Patience", desc: "No improvement for N epochs" },
  { value: "budget", label: "Budget", desc: "Time/compute budget" },
  { value: "convergence", label: "Converge", desc: "Loss plateau detection" },
  { value: "meta_predicted", label: "Meta-Pred", desc: "Meta-learning predicted" },
  { value: "multi_objective", label: "Multi-Obj", desc: "Multi-objective plateau" },
];

const OBJECTIVES = [
  { value: "accuracy", label: "Accuracy", desc: "Maximize accuracy" },
  { value: "latency", label: "Latency", desc: "Minimize latency" },
  { value: "memory", label: "Memory", desc: "Minimize memory" },
  { value: "fairness", label: "Fairness", desc: "Minimize bias gap" },
  { value: "robustness", label: "Robust", desc: "Maximize robustness" },
  { value: "composite", label: "Composite", desc: "Multi-objective score" },
];

type TabKey = "pipeline" | "hpo" | "feature" | "model" | "exec" | "report";

export default function GraphAutoMLV3Page() {
  const [activeTab, setActiveTab] = useState<TabKey>("pipeline");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, any> | null>(null);

  // Pipeline state
  const [pipelineType, setPipelineType] = useState("adaptive");
  const [maxComponents, setMaxComponents] = useState("8");
  const [objective, setObjective] = useState("composite");
  const [metaGuided, setMetaGuided] = useState(true);

  // HPO state
  const [hpoStrategy, setHpoStrategy] = useState("combined");
  const [numTrials, setNumTrials] = useState("50");
  const [metaWarmstart, setMetaWarmstart] = useState(true);

  // Feature state
  const [featEngine, setFeatEngine] = useState("combined");
  const [numFeatures, setNumFeatures] = useState("100");
  const [targetDim, setTargetDim] = useState("32");

  // Model state
  const [ensembleStrategy, setEnsembleStrategy] = useState("weighted");
  const [numCandidates, setNumCandidates] = useState("10");

  // Exec state
  const [maxEpochs, setMaxEpochs] = useState("200");
  const [earlyStop, setEarlyStop] = useState("patience");
  const [patience, setPatience] = useState("10");

  async function submit(endpoint: string, body: Record<string, any>) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/automl-v3/${endpoint}`, {
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

  const actions: Record<TabKey, () => void> = {
    pipeline: () => submit("pipeline", {
      graph_id: "default", pipeline_type: pipelineType,
      max_components: parseInt(maxComponents), objective,
      meta_guided: metaGuided, seed: 42,
    }),
    hpo: () => submit("hpo", {
      graph_id: "default", strategy: hpoStrategy,
      num_trials: parseInt(numTrials), objective,
      meta_warmstart: metaWarmstart, seed: 42,
    }),
    feature: () => submit("feature", {
      graph_id: "default", engine_type: featEngine,
      num_features: parseInt(numFeatures),
      target_dim: parseInt(targetDim), seed: 42,
    }),
    model: () => submit("model", {
      graph_id: "default", ensemble_strategy: ensembleStrategy,
      num_candidates: parseInt(numCandidates),
      objectives: ["accuracy", "latency", "fairness"], seed: 42,
    }),
    exec: () => submit("execute", {
      graph_id: "default", pipeline_type: pipelineType,
      max_epochs: parseInt(maxEpochs), early_stop: earlyStop,
      patience: parseInt(patience), seed: 42,
    }),
    report: () => submit("report", {
      graph_id: "default",
      include_pipeline: true, include_hpo: true,
      include_feature: true, include_model: true,
      include_exec: true, seed: 42,
    }),
  };

  function cfg(label: string, opts: { value: string; label: string; desc: string }[], val: string, set: (v: string) => void) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="flex flex-wrap gap-1.5">
          {opts.map((o) => (
            <Button key={o.value} size="sm" variant={val === o.value ? "default" : "outline"}
              onClick={() => set(o.value)} className="text-xs h-7" title={o.desc}>
              {o.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  function toggle(label: string, val: boolean, set: (v: boolean) => void) {
    return (
      <div className="flex items-center gap-2">
        <Button size="sm" variant={val ? "default" : "outline"} onClick={() => set(!val)} className="text-xs h-7">
          {val ? "✓ " : ""}{label}
        </Button>
      </div>
    );
  }

  function numInput(label: string, val: string, set: (v: string) => void) {
    return (
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input type="number" value={val} onChange={(e) => set(e.target.value)} className="h-8 text-xs w-24" />
      </div>
    );
  }

  const BADGE_CLR: Record<string, string> = {
    high: "bg-orange-500/20 text-orange-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-blue-500/20 text-blue-400",
  };

  function renderResult() {
    if (!result) return null;
    if (result.error) return (
      <Card className="border-red-800"><CardContent className="p-3">
        <p className="text-xs text-red-400">{result.error}</p>
      </CardContent></Card>
    );

    if (result.version) return renderReport(result);

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{result.feature || result.pipeline_type || result.strategy || "Result"}</CardTitle>
          <CardDescription className="text-xs">
            {result.task_id} | {result.computation_time_ms}ms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {renderMetrics(result)}
          {renderTrajectory(result)}
          {renderComponents(result)}
          {renderTrials(result)}
          {renderModels(result)}
          {renderTrainingHistory(result)}
          {renderIntegration(result)}
        </CardContent>
      </Card>
    );
  }

  function renderMetrics(data: Record<string, any>) {
    const sections = [
      { title: "Pipeline", d: data.pipeline_metrics },
      { title: "HPO", d: data.hpo_metrics },
      { title: "Features", d: data.feature_metrics },
      { title: "Models", d: data.model_metrics },
      { title: "Execution", d: data.execution_metrics },
    ].filter((s) => s.d);

    if (sections.length === 0) return null;
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {sections.map((s) => (
          <Card key={s.title} className="bg-muted/30">
            <CardHeader className="py-1 px-3"><CardTitle className="text-xs text-muted-foreground">{s.title}</CardTitle></CardHeader>
            <CardContent className="px-3 pb-2">
              {Object.entries(s.d).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs py-0.5">
                  <span className="text-muted-foreground">{k.replace(/_/g, " ")}</span>
                  <span className="font-mono">{typeof v === "number" ? (v < 1 ? v.toFixed(4) : v.toFixed(1)) : String(v)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function renderTrajectory(data: Record<string, any>) {
    const traj = data.optimization_trajectory;
    if (!traj || !Array.isArray(traj) || traj.length === 0) return null;

    const sampled = traj.length > 20
      ? traj.filter((_: any, i: number) => i % Math.ceil(traj.length / 20) === 0 || i === traj.length - 1)
      : traj;

    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Optimization Trajectory ({traj.length} trials)</p>
        <div className="flex gap-0.5 items-end h-20 overflow-x-auto">
          {sampled.map((p: any, i: number) => {
            const h = Math.max(4, (p.best_so_far || p.score || 0) * 100);
            const isWarm = p.is_warmstart;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5 min-w-[20px]">
                <span className="text-[8px] text-muted-foreground">{((p.best_so_far || p.score) * 100).toFixed(0)}</span>
                <div
                  className={`rounded-t w-4 ${isWarm ? "bg-gradient-to-t from-purple-600 to-pink-400" : "bg-gradient-to-t from-blue-600 to-cyan-400"}`}
                  style={{ height: `${h}px` }}
                  title={`Trial ${p.trial}: ${((p.score || 0) * 100).toFixed(1)}%`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500" /> Meta Warmstart</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyan-500" /> Regular Trial</span>
        </div>
      </div>
    );
  }

  function renderComponents(data: Record<string, any>) {
    if (!data.components || !Array.isArray(data.components)) return null;
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Pipeline Components ({data.components.length})</p>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {data.components.map((c: any) => (
            <div key={c.component_id} className="flex items-center gap-2 text-xs bg-muted/20 rounded px-2 py-1">
              <Badge variant="outline" className="text-[9px]">{c.stage}</Badge>
              <span className="font-mono text-muted-foreground">{c.component_id}</span>
              <span>{c.type}</span>
              <span className="ml-auto text-green-400">+{(c.estimated_accuracy_gain * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderTrials(data: Record<string, any>) {
    if (!data.trials || !Array.isArray(data.trials)) return null;
    const bestTrials = data.trials.filter((t: any) => t.is_best);
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">HPO Trials ({data.trials.length} total, {bestTrials.length} improvements)</p>
        <div className="max-h-24 overflow-y-auto space-y-0.5">
          {data.trials.slice(-15).map((t: any) => (
            <div key={t.trial_id} className={`flex items-center gap-2 text-xs rounded px-2 py-0.5 ${t.is_best ? "bg-green-500/10" : "bg-muted/20"}`}>
              <span className="w-8 text-muted-foreground">#{t.trial_id}</span>
              <span className="font-mono">{(t.score * 100).toFixed(2)}%</span>
              {t.is_warmstart && <Badge className="text-[8px] bg-purple-500/20 text-purple-400">warm</Badge>}
              {t.is_best && <Badge className="text-[8px] bg-green-500/20 text-green-400">best</Badge>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderModels(data: Record<string, any>) {
    if (!data.ranked_models || !Array.isArray(data.ranked_models)) return null;
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Ranked Models (top {data.ranked_models.length})</p>
        <div className="space-y-0.5 max-h-32 overflow-y-auto">
          {data.ranked_models.map((m: any) => (
            <div key={m.model_id} className={`flex items-center gap-2 text-xs rounded px-2 py-0.5 ${m.rank <= 3 ? "bg-green-500/10" : "bg-muted/20"}`}>
              <span className="w-6 font-bold text-muted-foreground">#{m.rank}</span>
              <Badge variant="outline" className="text-[9px]">{m.family}</Badge>
              <span className="font-mono">{(m.composite_score * 100).toFixed(1)}%</span>
              <span className="text-muted-foreground">{m.params_m}M params</span>
              <span className="text-muted-foreground">{m.latency_ms}ms</span>
              {data.ensemble_weights && m.rank <= (data.ensemble_weights || []).length && (
                <Badge className="text-[8px] bg-blue-500/20 text-blue-400">w={((data.ensemble_weights || [])[m.rank - 1] * 100).toFixed(0)}%</Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderTrainingHistory(data: Record<string, any>) {
    const hist = data.training_history;
    if (!hist || !Array.isArray(hist) || hist.length === 0) return null;

    const sampled = hist.length > 25
      ? hist.filter((_: any, i: number) => i % Math.ceil(hist.length / 25) === 0 || i === hist.length - 1)
      : hist;

    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Training History ({hist.length} epochs, early stop: {data.early_stop_criterion})</p>
        <div className="flex gap-0.5 items-end h-20 overflow-x-auto">
          {sampled.map((h: any, i: number) => {
            const height = Math.max(4, h.val_accuracy * 100);
            return (
              <div key={i} className="flex flex-col items-center gap-0.5 min-w-[16px]">
                <span className="text-[7px] text-muted-foreground">{(h.val_accuracy * 100).toFixed(0)}</span>
                <div
                  className={`rounded-t w-3 ${h.is_best ? "bg-gradient-to-t from-emerald-600 to-green-400" : "bg-gradient-to-t from-slate-600 to-slate-400"}`}
                  style={{ height: `${height}px` }}
                  title={`Epoch ${h.epoch}: ${(h.val_accuracy * 100).toFixed(1)}%`}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderIntegration(data: Record<string, any>) {
    const integ = data.engine_integration || data.meta_initialization || data.meta_hpo_integration || data.meta_early_stop;
    if (!integ) return null;

    const entries: { key: string; val: Record<string, any> }[] = [];

    if (data.engine_integration) {
      for (const [k, v] of Object.entries(data.engine_integration)) {
        entries.push({ key: k, val: v as Record<string, any> });
      }
    }
    if (data.meta_initialization) entries.push({ key: "meta_init", val: data.meta_initialization });
    if (data.meta_hpo_integration) entries.push({ key: "meta_hpo", val: data.meta_hpo_integration });
    if (data.meta_early_stop) entries.push({ key: "meta_early_stop", val: data.meta_early_stop });

    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Engine Integration</p>
        <div className="flex flex-wrap gap-1.5">
          {entries.map(({ key, val }) => (
            <Badge key={key} variant="secondary" className="text-[10px] gap-1">
              <span className="text-blue-400">{key}</span>
              {val.source && <span className="text-muted-foreground">({val.source})</span>}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  function renderReport(data: Record<string, any>) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{data.feature}</CardTitle>
          <CardDescription className="text-xs">{data.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Score:</span>
            <div className="flex-1 bg-muted rounded-full h-3 max-w-xs">
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full h-3"
                style={{ width: `${(data.overall_score || 0) * 100}%` }} />
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
              <p className="text-xs font-medium text-muted-foreground">Integration ({Object.keys(data.integration_map).length} engines)</p>
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
              {data.recommendations.map((r: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Badge className={`text-[9px] ${BADGE_CLR[r.priority] || ""}`}>{r.priority}</Badge>
                  <div><p>{r.suggestion}</p><p className="text-green-400">{r.expected_gain}</p></div>
                </div>
              ))}
            </div>
          )}

          {data.modules_included && (
            <div className="flex flex-wrap gap-1">
              {data.modules_included.map((m: any) => (
                <Badge key={m.module} variant="secondary" className="text-[10px]">{m.module} ({m.cached})</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const tabDefs: { key: TabKey; label: string }[] = [
    { key: "pipeline", label: "Pipeline" },
    { key: "hpo", label: "HPO" },
    { key: "feature", label: "Feature" },
    { key: "model", label: "Model" },
    { key: "exec", label: "Execute" },
    { key: "report", label: "Report" },
  ];

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold">AutoML v3</h2>
        <Badge variant="outline" className="text-xs">v1.203</Badge>
        <span className="text-xs text-muted-foreground ml-2">
          Meta-Learning-Powered End-to-End Automated ML Pipeline
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          {tabDefs.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Pipeline Architecture Search</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {cfg("Pipeline Type", PIPELINE_TYPES, pipelineType, setPipelineType)}
              {cfg("Objective", OBJECTIVES, objective, setObjective)}
              {toggle("Meta-Guided Search", metaGuided, setMetaGuided)}
              {numInput("Max Components", maxComponents, setMaxComponents)}
              <Button onClick={actions.pipeline} disabled={loading} size="sm">
                {loading ? "Searching..." : "Search Pipeline"}
              </Button>
            </CardContent>
          </Card>
          {renderResult()}
        </TabsContent>

        <TabsContent value="hpo" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Hyperparameter Optimization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {cfg("Strategy", HPO_STRATEGIES, hpoStrategy, setHpoStrategy)}
              {cfg("Objective", OBJECTIVES, objective, setObjective)}
              {toggle("Meta Warmstart", metaWarmstart, setMetaWarmstart)}
              {numInput("Num Trials", numTrials, setNumTrials)}
              <Button onClick={actions.hpo} disabled={loading} size="sm">
                {loading ? "Optimizing..." : "Run HPO"}
              </Button>
            </CardContent>
          </Card>
          {renderResult()}
        </TabsContent>

        <TabsContent value="feature" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Automated Feature Engineering</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {cfg("Engine", FEATURE_ENGINES, featEngine, setFeatEngine)}
              <div className="flex gap-3">
                {numInput("Num Features", numFeatures, setNumFeatures)}
                {numInput("Target Dim", targetDim, setTargetDim)}
              </div>
              <Button onClick={actions.feature} disabled={loading} size="sm">
                {loading ? "Engineering..." : "Generate Features"}
              </Button>
            </CardContent>
          </Card>
          {renderResult()}
        </TabsContent>

        <TabsContent value="model" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Model Selection & Ensemble</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {cfg("Ensemble", ENSEMBLE_STRATEGIES, ensembleStrategy, setEnsembleStrategy)}
              {numInput("Candidates", numCandidates, setNumCandidates)}
              <Button onClick={actions.model} disabled={loading} size="sm">
                {loading ? "Selecting..." : "Select Models"}
              </Button>
            </CardContent>
          </Card>
          {renderResult()}
        </TabsContent>

        <TabsContent value="exec" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Pipeline Execution</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {cfg("Pipeline Type", PIPELINE_TYPES, pipelineType, setPipelineType)}
              {cfg("Early Stop", EARLY_STOP, earlyStop, setEarlyStop)}
              <div className="flex gap-3">
                {numInput("Max Epochs", maxEpochs, setMaxEpochs)}
                {numInput("Patience", patience, setPatience)}
              </div>
              <Button onClick={actions.exec} disabled={loading} size="sm">
                {loading ? "Executing..." : "Execute Pipeline"}
              </Button>
            </CardContent>
          </Card>
          {renderResult()}
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Comprehensive AutoML v3 Report</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                End-to-end AutoML report with full v1.189-v1.202 integration map.
              </p>
              <Button onClick={actions.report} disabled={loading} size="sm">
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>
          {renderResult()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
