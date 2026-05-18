"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.245 backend
const META_METHODS = ["maml", "reptile", "proto_net", "matching_net", "relation_net", "meta_sgd"];
const TASK_DISTRIBUTIONS = ["homogeneous", "heterogeneous", "compositional", "hierarchical", "adversarial", "curriculum"];
const ADAPTATION_METRICS = ["few_shot_accuracy", "graph_recovery", "intervention_effectiveness", "structure_edit_distance", "causal_order_f1", "domain_transfer_score"];
const INNER_STRATEGIES = ["gradient_descent", "bayesian_update", "prototype_update", "attention_update", "memory_retrieval", "hybrid_adaptation"];
const META_REGULARIZATIONS = ["l2_penalty", "task_dropout", "information_bottleneck", "causal_invariance", "structure_sparsity", "domain_confusion"];
const EVAL_PROTOCOLS = ["leave_one_domain_out", "cross_domain_k_shot", "incremental_domain", "few_shot_intervention", "meta_test_holdout", "continual_meta"];

const TABS = ["Train", "Adapt", "Evaluate", "Curriculum", "Distill", "Benchmark", "Overview"] as const;
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

export default function GraphMetaCausalV2Page() {
  const [tab, setTab] = useState<Tab>("Train");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Train state
  const [trDomains, setTrDomains] = useState("medical,finance,climate,education");
  const [trMethod, setTrMethod] = useState("maml");
  const [trDistribution, setTrDistribution] = useState("heterogeneous");
  const [trInnerStrat, setTrInnerStrat] = useState("gradient_descent");
  const [trReg, setTrReg] = useState("causal_invariance");
  const [trInnerSteps, setTrInnerSteps] = useState(5);
  const [trOuterSteps, setTrOuterSteps] = useState(100);
  const [trMetaLr, setTrMetaLr] = useState(0.001);
  const [trInnerLr, setTrInnerLr] = useState(0.01);
  const [trKShot, setTrKShot] = useState(5);

  // Adapt state
  const [adModelId, setAdModelId] = useState("meta_causal_5000");
  const [adTargetDomain, setAdTargetDomain] = useState("autonomous_driving");
  const [adInnerStrat, setAdInnerStrat] = useState("hybrid_adaptation");
  const [adKShot, setAdKShot] = useState(5);
  const [adMaxSteps, setAdMaxSteps] = useState(10);

  // Evaluate state
  const [evModelId, setEvModelId] = useState("meta_causal_5000");
  const [evProtocol, setEvProtocol] = useState("cross_domain_k_shot");
  const [evMetrics, setEvMetrics] = useState<string[]>(["few_shot_accuracy", "graph_recovery", "intervention_effectiveness"]);
  const [evTestDomains, setEvTestDomains] = useState("autonomous_driving,drug_discovery");

  // Curriculum state
  const [curModelId, setCurModelId] = useState("meta_causal_5000");
  const [curDistribution, setCurDistribution] = useState("curriculum");
  const [curLevels, setCurLevels] = useState(5);
  const [curTasksPerLevel, setCurTasksPerLevel] = useState(10);

  // Distill state
  const [diModelId, setDiModelId] = useState("meta_causal_5000");
  const [diTeachers, setDiTeachers] = useState<string[]>(["maml", "reptile", "proto_net"]);
  const [diTemperature, setDiTemperature] = useState(2.0);
  const [diEpochs, setDiEpochs] = useState(50);

  // Benchmark state
  const [bmModelId, setBmModelId] = useState("meta_causal_5000");
  const [bmDomains, setBmDomains] = useState("medical,finance,climate,social");
  const [bmKShots, setBmKShots] = useState("1,5,10");
  const [bmBaselines, setBmBaselines] = useState("random,transfer_learning,scratch");

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

  const renderTrain = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Meta-Train">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Task Domains (comma-sep)</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trDomains} onChange={(e) => setTrDomains(e.target.value)} /></div>
        <SelectField label="Meta Method" value={trMethod} onChange={setTrMethod} options={META_METHODS} />
        <SelectField label="Task Distribution" value={trDistribution} onChange={setTrDistribution} options={TASK_DISTRIBUTIONS} />
        <SelectField label="Inner Strategy" value={trInnerStrat} onChange={setTrInnerStrat} options={INNER_STRATEGIES} />
        <SelectField label="Regularization" value={trReg} onChange={setTrReg} options={META_REGULARIZATIONS} />
        <div className="grid grid-cols-2 gap-2">
          <div className="mb-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Inner Steps</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trInnerSteps} onChange={(e) => setTrInnerSteps(+e.target.value)} /></div>
          <div className="mb-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Outer Steps</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trOuterSteps} onChange={(e) => setTrOuterSteps(+e.target.value)} /></div>
          <div className="mb-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta LR</label><input type="number" step="0.0001" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trMetaLr} onChange={(e) => setTrMetaLr(+e.target.value)} /></div>
          <div className="mb-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Inner LR</label><input type="number" step="0.001" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trInnerLr} onChange={(e) => setTrInnerLr(+e.target.value)} /></div>
        </div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">K-Shot</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trKShot} onChange={(e) => setTrKShot(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/meta-causal/train", { task_domains: trDomains.split(",").map((s) => s.trim()), meta_method: trMethod, task_distribution: trDistribution, inner_strategy: trInnerStrat, regularization: trReg, inner_steps: trInnerSteps, outer_steps: trOuterSteps, meta_lr: trMetaLr, inner_lr: trInnerLr, k_shot: trKShot, n_query: 15 })}>{loading ? "Meta-Training..." : "Meta-Train"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "meta_train_loss" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const taskPerf = d.task_performance as Record<string, number>;
          return (<>
            <Card title="Training Summary">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(d.meta_model_id)}</div><div className="text-xs text-gray-500">Model ID</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(d.outer_steps_completed)}</div><div className="text-xs text-gray-500">Outer Steps</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(d.best_inner_steps)}</div><div className="text-xs text-gray-500">Best Inner Steps</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{(d.convergence_rate as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Convergence</div></div>
                <div className="text-center"><div className="text-lg font-bold text-cyan-600">{(d.regularization_loss as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Reg Loss</div></div>
              </div>
              <div className="flex gap-2 mb-3">
                <Badge text={`Train Loss: ${(d.meta_train_loss as number)?.toFixed(4)}`} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                <Badge text={`Val Loss: ${(d.meta_val_loss as number)?.toFixed(4)}`} color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
                <Badge text={`${String(d.meta_method).toUpperCase()}`} color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />
              </div>
            </Card>
            {taskPerf && (
              <Card title="Per-Domain Performance">
                {Object.entries(taskPerf).map(([domain, score]) => (
                  <StatBar key={domain} label={domain} value={score} color={score > 0.8 ? "bg-emerald-500" : (score > 0.65 ? "bg-amber-500" : "bg-red-500")} />
                ))}
              </Card>
            )}
          </>);
        })()}
      </div>
    </div>
  );

  const renderAdapt = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Few-Shot Adaptation">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta Model ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adModelId} onChange={(e) => setAdModelId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Domain</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adTargetDomain} onChange={(e) => setAdTargetDomain(e.target.value)} /></div>
        <SelectField label="Inner Strategy" value={adInnerStrat} onChange={setAdInnerStrat} options={INNER_STRATEGIES} />
        <div className="grid grid-cols-2 gap-2">
          <div className="mb-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">K-Shot</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adKShot} onChange={(e) => setAdKShot(+e.target.value)} /></div>
          <div className="mb-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Steps</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adMaxSteps} onChange={(e) => setAdMaxSteps(+e.target.value)} /></div>
        </div>
        <button className="w-full mt-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/meta-causal/adapt", { meta_model_id: adModelId, target_domain: adTargetDomain, inner_strategy: adInnerStrat, k_shot: adKShot, adaptation_steps: adMaxSteps, support_data_size: 50, query_data_size: 100, early_stop_patience: 3 })}>{loading ? "Adapting..." : "Adapt to Domain"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "few_shot_accuracy" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const improvement = d.improvement_over_baseline as number;
          return (<>
            <Card title="Adaptation Summary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(d.adapted_graph_nodes)}</div><div className="text-xs text-gray-500">Nodes</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(d.adapted_graph_edges)}</div><div className="text-xs text-gray-500">Edges</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(d.adaptation_steps_used)}</div><div className="text-xs text-gray-500">Steps Used</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(d.target_domain)}</div><div className="text-xs text-gray-500">Domain</div></div>
              </div>
              <StatBar label="Few-Shot Accuracy" value={d.few_shot_accuracy as number} color="bg-blue-500" />
              <StatBar label="Structure Recovery" value={d.structure_recovery as number} color="bg-emerald-500" />
              <StatBar label="Intervention Effectiveness" value={d.intervention_effectiveness as number} color="bg-amber-500" />
              <StatBar label="Adaptation Speed" value={d.adaptation_speed as number} color="bg-purple-500" />
              <div className="flex gap-2 mt-3">
                <Badge text={`+${improvement.toFixed(4)} over baseline`} color={improvement > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"} />
                <Badge text={`Loss: ${(d.adaptation_loss as number)?.toFixed(4)}`} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderEvaluate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Meta-Evaluation">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta Model ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evModelId} onChange={(e) => setEvModelId(e.target.value)} /></div>
        <SelectField label="Protocol" value={evProtocol} onChange={setEvProtocol} options={EVAL_PROTOCOLS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Metrics</label>
          <div className="flex flex-wrap gap-1">
            {ADAPTATION_METRICS.map((m) => (
              <button key={m} onClick={() => toggleItem(evMetrics, m, setEvMetrics)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${evMetrics.includes(m) ? "bg-amber-600 text-white border-amber-600" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>
                {m.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Test Domains (comma-sep)</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evTestDomains} onChange={(e) => setEvTestDomains(e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/meta-causal/evaluate", { meta_model_id: evModelId, protocol: evProtocol, metrics: evMetrics, test_domains: evTestDomains.split(",").map((s) => s.trim()), k_shots: [1, 5, 10, 20] })}>{loading ? "Evaluating..." : "Evaluate"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "overall_score" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const perDomain = d.per_domain_scores as Record<string, number>;
          const perKShot = d.per_k_shot_results as Record<string, number>;
          const perMetric = d.per_metric_scores as Record<string, number>;
          const curve = d.adaptation_curve as Record<string, unknown>[];
          return (<>
            <Card title="Evaluation Summary">
              <div className="flex gap-3 mb-4">
                <div className="text-center flex-1"><div className="text-2xl font-bold text-blue-600">{(d.overall_score as number)?.toFixed(4)}</div><div className="text-xs text-gray-500">Overall Score</div></div>
                <Badge text={`p-value: ${(d.statistical_significance as number)?.toFixed(4)}`} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
                <Badge text={String(d.protocol)} color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />
              </div>
            </Card>
            {perDomain && (
              <Card title="Per-Domain Scores">
                {Object.entries(perDomain).map(([domain, score]) => (
                  <StatBar key={domain} label={domain} value={score} color={score > 0.8 ? "bg-emerald-500" : (score > 0.65 ? "bg-amber-500" : "bg-red-500")} />
                ))}
              </Card>
            )}
            {perKShot && (
              <Card title="K-Shot Results">
                {Object.entries(perKShot).map(([k, score]) => (
                  <StatBar key={k} label={k.replace(/_/g, " ")} value={score} color="bg-blue-500" />
                ))}
              </Card>
            )}
            {perMetric && (
              <Card title="Per-Metric Scores">
                {Object.entries(perMetric).map(([metric, score]) => (
                  <StatBar key={metric} label={metric.replace(/_/g, " ")} value={score} color="bg-purple-500" />
                ))}
              </Card>
            )}
            {curve && curve.length > 0 && (
              <Card title="Adaptation Curve"><JsonBlock data={curve} /></Card>
            )}
          </>);
        })()}
      </div>
    </div>
  );

  const renderCurriculum = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Meta-Curriculum">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta Model ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={curModelId} onChange={(e) => setCurModelId(e.target.value)} /></div>
        <SelectField label="Distribution" value={curDistribution} onChange={setCurDistribution} options={TASK_DISTRIBUTIONS} />
        <div className="grid grid-cols-2 gap-2">
          <div className="mb-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Difficulty Levels</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={curLevels} onChange={(e) => setCurLevels(+e.target.value)} /></div>
          <div className="mb-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tasks/Level</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={curTasksPerLevel} onChange={(e) => setCurTasksPerLevel(+e.target.value)} /></div>
        </div>
        <button className="w-full mt-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/meta-causal/curriculum", { meta_model_id: curModelId, task_distribution: curDistribution, difficulty_levels: curLevels, tasks_per_level: curTasksPerLevel, promotion_threshold: 0.7, max_curriculum_steps: 200 })}>{loading ? "Running Curriculum..." : "Start Curriculum"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "curriculum_completion" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const levelProgress = (d.level_progress as Record<string, unknown>[]) ?? [];
          const levelScores = d.level_scores as Record<string, number>;
          return (<>
            <Card title="Curriculum Progress">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(d.current_level)}/{String(d.curriculum_levels)}</div><div className="text-xs text-gray-500">Current Level</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(d.mastered_tasks)}/{String(d.total_tasks)}</div><div className="text-xs text-gray-500">Tasks Mastered</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{(d.curriculum_completion as number)?.toFixed(4) ?? "-"}</div><div className="text-xs text-gray-500">Completion</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(d.curriculum_levels)}</div><div className="text-xs text-gray-500">Total Levels</div></div>
              </div>
            </Card>
            {levelScores && (
              <Card title="Level Scores">
                {Object.entries(levelScores).map(([level, score]) => (
                  <StatBar key={level} label={level.replace(/_/g, " ")} value={score} color={score > 0.7 ? "bg-emerald-500" : (score > 0.5 ? "bg-amber-500" : "bg-red-500")} />
                ))}
              </Card>
            )}
            <Card title="Level Details"><JsonBlock data={levelProgress} /></Card>
            <Card title="Promotion History"><JsonBlock data={d.promotion_history} /></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderDistill = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Meta-Knowledge Distillation">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta Model ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={diModelId} onChange={(e) => setDiModelId(e.target.value)} /></div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Teacher Methods</label>
          <div className="flex flex-wrap gap-1">
            {META_METHODS.map((m) => (
              <button key={m} onClick={() => toggleItem(diTeachers, m, setDiTeachers)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${diTeachers.includes(m) ? "bg-purple-600 text-white border-purple-600" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>
                {m.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="mb-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Temperature</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={diTemperature} onChange={(e) => setDiTemperature(+e.target.value)} /></div>
          <div className="mb-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Epochs</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={diEpochs} onChange={(e) => setDiEpochs(+e.target.value)} /></div>
        </div>
        <button className="w-full mt-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/meta-causal/distill", { meta_model_id: diModelId, teacher_methods: diTeachers, distillation_temperature: diTemperature, distillation_epochs: diEpochs, alpha: 0.5 })}>{loading ? "Distilling..." : "Distill Knowledge"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "student_performance" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const teacherPerf = d.teacher_performances as Record<string, number>;
          const improvement = d.improvement_over_best_teacher as number;
          return (<>
            <Card title="Distillation Summary">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(d.distilled_model_id)}</div><div className="text-xs text-gray-500">Student Model</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(d.teacher_count)}</div><div className="text-xs text-gray-500">Teachers</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{(d.compression_ratio as number)?.toFixed(4)}</div><div className="text-xs text-gray-500">Compression</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{(d.knowledge_retention as number)?.toFixed(4)}</div><div className="text-xs text-gray-500">Retention</div></div>
              </div>
              <StatBar label="Student Performance" value={d.student_performance as number} color="bg-blue-500" />
              <StatBar label="Distillation Loss" value={d.distillation_loss as number} color="bg-red-500" />
              <div className="flex gap-2 mt-3">
                <Badge text={`+${improvement.toFixed(4)} vs best teacher`} color={improvement > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"} />
              </div>
            </Card>
            {teacherPerf && (
              <Card title="Teacher vs Student">
                {Object.entries(teacherPerf).map(([teacher, score]) => (
                  <StatBar key={teacher} label={`Teacher: ${teacher}`} value={score} color="bg-purple-400" />
                ))}
                <StatBar label="Student (distilled)" value={d.student_performance as number} color="bg-blue-600" />
              </Card>
            )}
          </>);
        })()}
      </div>
    </div>
  );

  const renderBenchmark = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Meta-Benchmark">
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta Model ID</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={bmModelId} onChange={(e) => setBmModelId(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Domains (comma-sep)</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={bmDomains} onChange={(e) => setBmDomains(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">K-Shots (comma-sep)</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={bmKShots} onChange={(e) => setBmKShots(e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Baselines (comma-sep)</label><input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={bmBaselines} onChange={(e) => setBmBaselines(e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/meta-causal/benchmark", { meta_model_id: bmModelId, benchmark_name: "meta_causal_standard", domains: bmDomains.split(",").map((s) => s.trim()), k_shots: bmKShots.split(",").map((s) => +s.trim()), baseline_methods: bmBaselines.split(",").map((s) => s.trim()) })}>{loading ? "Benchmarking..." : "Run Benchmark"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "meta_method_score" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const baselines = d.baseline_scores as Record<string, number>;
          const relative = d.relative_improvements as Record<string, number>;
          const rankings = d.per_domain_rankings as Record<string, number>;
          const curve = d.few_shot_curve as Record<string, number[]>;
          const stats = d.statistical_tests as Record<string, unknown>;
          return (<>
            <Card title="Benchmark Results">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{(d.meta_method_score as number)?.toFixed(4)}</div><div className="text-xs text-gray-500">Meta Score</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(d.benchmark_name)}</div><div className="text-xs text-gray-500">Benchmark</div></div>
              </div>
              <div className="flex gap-2">
                {baselines && Object.entries(baselines).map(([b, score]) => (
                  <Badge key={b} text={`${b}: ${score.toFixed(4)}`} color="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" />
                ))}
              </div>
            </Card>
            {relative && (
              <Card title="Relative Improvements">
                {Object.entries(relative).map(([b, imp]) => (
                  <StatBar key={b} label={`vs ${b}`} value={imp} max={1} color={imp > 0.2 ? "bg-emerald-500" : (imp > 0.1 ? "bg-amber-500" : "bg-red-500")} />
                ))}
              </Card>
            )}
            {curve && (
              <Card title="Few-Shot Learning Curve"><JsonBlock data={curve} /></Card>
            )}
            {stats && (
              <Card title="Statistical Tests"><JsonBlock data={stats} /></Card>
            )}
            {rankings && (
              <Card title="Per-Domain Rankings">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(rankings).map(([domain, rank]) => (
                    <div key={domain} className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-200">#{String(rank)}</div>
                      <div className="text-xs text-gray-500">{domain}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>);
        })()}
      </div>
    </div>
  );

  const renderOverview = () => {
    const allEnums: Record<string, string[]> = {
      MetaLearningMethod: META_METHODS,
      TaskDistribution: TASK_DISTRIBUTIONS,
      AdaptationMetric: ADAPTATION_METRICS,
      InnerLoopStrategy: INNER_STRATEGIES,
      MetaRegularization: META_REGULARIZATIONS,
      EvaluationProtocol: EVAL_PROTOCOLS,
    };
    return (
      <div className="space-y-4">
        <Card title="Engine Metadata">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center"><div className="text-lg font-bold text-blue-600">v1.245.0</div><div className="text-xs text-gray-500">Version</div></div>
            <div className="text-center"><div className="text-lg font-bold text-emerald-600">7</div><div className="text-xs text-gray-500">Endpoints</div></div>
            <div className="text-center"><div className="text-lg font-bold text-amber-600">6</div><div className="text-xs text-gray-500">Enums</div></div>
            <div className="text-center"><div className="text-lg font-bold text-purple-600">36</div><div className="text-xs text-gray-500">Enum Values</div></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            Graph Meta-Causal Learning engine — meta-learning for rapid causal graph adaptation, enabling few-shot causal structure discovery across domains with curriculum learning, multi-teacher knowledge distillation, and comprehensive evaluation protocols.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge text="Meta-Training" color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
            <Badge text="Few-Shot Adaptation" color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
            <Badge text="Meta-Evaluation" color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
            <Badge text="Curriculum Learning" color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />
            <Badge text="Knowledge Distillation" color="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300" />
            <Badge text="Benchmark Testing" color="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" />
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
              <div className="text-xs font-medium text-gray-500">Commonsense</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.244</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Transfer Learning</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.243</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">Federated CF</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.242</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="text-xs font-medium text-gray-500">NAS Causal</div>
              <div className="text-sm font-bold text-gray-700 dark:text-gray-200">v1.241</div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const tabRenderers: Record<Tab, () => React.ReactNode> = {
    Train: renderTrain,
    Adapt: renderAdapt,
    Evaluate: renderEvaluate,
    Curriculum: renderCurriculum,
    Distill: renderDistill,
    Benchmark: renderBenchmark,
    Overview: renderOverview,
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-gray-100">
      <div className="px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Graph Meta-Causal Learning</h1>
        <p className="text-sm text-gray-400 mt-1">v1.245.0 &mdash; Meta-learning for rapid causal graph adaptation with few-shot learning, curriculum progression, multi-teacher distillation &amp; benchmark evaluation</p>
        <div className="flex gap-2 mt-2">
          <Badge text="6 Enums" color="bg-blue-900 text-blue-300" />
          <Badge text="7 Endpoints" color="bg-emerald-900 text-emerald-300" />
          <Badge text="36 Values" color="bg-purple-900 text-purple-300" />
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
