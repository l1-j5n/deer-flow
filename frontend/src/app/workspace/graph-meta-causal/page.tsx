"use client";

import { useState } from "react";

const API = "/api/graph";

const META_STRATEGIES = ["maml", "reptile", "meta_sgd", "protonet", "matching_net", "relation_net"];
const TRANSFER_MODES = ["full_transfer", "partial_transfer", "selective_transfer", "compositional", "progressive", "adversarial"];
const DISTILL_TYPES = ["structure_distill", "parameter_distill", "response_distill", "feature_distill", "relational_distill", "attention_distill"];
const INTERVENTION_TYPES = ["do_calculus", "soft_intervention", "stochastic", "natural", "policy", "meta_intervention"];
const ADAPT_METHODS = ["dann", "coral", "mmd", "adversarial_align", "moment_match", "graph_da"];
const EVAL_METRICS = ["few_shot_shd", "transfer_efficiency", "adaptation_speed", "causal_generalization", "cross_domain_f1", "meta_auc"];
const DOMAINS = ["social", "biological", "financial", "climate", "neuroscience", "transportation"];

const TABS = ["Meta-Learn", "Transfer", "Distill", "Intervene", "Adapt", "Evaluate", "Summary"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>
      {children}
    </div>
  );
}

function StatBar({ label, value, max = 1, color = "bg-emerald-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(4)}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function JsonBlock({ data }: { data: unknown }) {
  return (
    <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto max-h-80 whitespace-pre-wrap">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <select className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (<option key={o} value={o}>{o}</option>))}
      </select>
    </div>
  );
}

function Badge({ text, color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

export default function GraphMetaCausalPage() {
  const [tab, setTab] = useState<Tab>("Meta-Learn");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Meta-Learn state
  const [mlStrategy, setMlStrategy] = useState("maml");
  const [mlTasks, setMlTasks] = useState(10);
  const [mlSupport, setMlSupport] = useState(5);
  const [mlQuery, setMlQuery] = useState(15);
  const [mlMetaSteps, setMlMetaSteps] = useState(100);

  // Transfer state
  const [trMode, setTrMode] = useState("partial_transfer");
  const [trSources, setTrSources] = useState("social,biological");
  const [trTarget, setTrTarget] = useState("financial");
  const [trStrength, setTrStrength] = useState(0.7);

  // Distill state
  const [dsType, setDsType] = useState("structure_distill");
  const [dsTeacherEdges, setDsTeacherEdges] = useState(50);
  const [dsStudentCap, setDsStudentCap] = useState(20);
  const [dsTemp, setDsTemp] = useState(2.0);
  const [dsRatio, setDsRatio] = useState(0.4);

  // Intervene state
  const [ivType, setIvType] = useState("meta_intervention");
  const [ivVars, setIvVars] = useState(15);
  const [ivBudget, setIvBudget] = useState(20);
  const [ivTargetEffect, setIvTargetEffect] = useState(0.5);
  const [ivExploration, setIvExploration] = useState(0.3);

  // Adapt state
  const [adMethod, setAdMethod] = useState("dann");
  const [adSourceSize, setAdSourceSize] = useState(1000);
  const [adTargetSize, setAdTargetSize] = useState(200);
  const [adSteps, setAdSteps] = useState(50);

  // Evaluate state
  const [evMetric, setEvMetric] = useState("few_shot_shd");
  const [evDomains, setEvDomains] = useState(6);
  const [evShots, setEvShots] = useState("1,5,10,20,50");
  const [evBaseline, setEvBaseline] = useState("pc_algorithm");

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setResult(await res.json());
    } catch (err) { setResult({ error: String(err) }); }
    setLoading(false);
  };

  const renderMetaLearn = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Meta-Causal Structure Learning">
        <SelectField label="Strategy" value={mlStrategy} onChange={setMlStrategy} options={META_STRATEGIES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Tasks</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={mlTasks} onChange={(e) => setMlTasks(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Support Size</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={mlSupport} onChange={(e) => setMlSupport(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Query Size</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={mlQuery} onChange={(e) => setMlQuery(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta Steps</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={mlMetaSteps} onChange={(e) => setMlMetaSteps(+e.target.value)} />
        </div>
        <button className="w-full mt-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading}
          onClick={() => callApi("/meta-causal/learn", { graph_id: "meta_01", strategy: mlStrategy, num_tasks: mlTasks, num_support: mlSupport, num_query: mlQuery, num_meta_steps: mlMetaSteps })}>
          {loading ? "Learning..." : "Run Meta-Learning"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "meta_metrics" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const meta = d.meta_metrics as Record<string, unknown>;
          const training = d.meta_training as Record<string, unknown>;
          const tasks = (d.task_results || []) as Array<Record<string, unknown>>;
          const knowledge = d.causal_knowledge as Record<string, unknown>;
          return (<>
            <Card title="Meta-Training Progress">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-indigo-600">{String(training?.final_loss)}</div><div className="text-xs text-gray-500">Final Loss</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(training?.convergence_step)}</div><div className="text-xs text-gray-500">Convergence</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(meta?.adaptation_efficiency)}</div><div className="text-xs text-gray-500">Adapt Efficiency</div></div>
              </div>
              <StatBar label="Mean Improvement" value={Number(meta?.mean_improvement || 0)} color="bg-indigo-500" />
            </Card>
            <Card title="Task Results">
              <div className="space-y-1 max-h-40 overflow-auto">
                {tasks.map((t, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                    <span className="font-mono">Task {String(t.task_id)}</span>
                    <Badge text={String(t.domain)} color="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300" />
                    <span>SHD: {String(t.support_shd)}→{String(t.query_shd)}</span>
                    <span>+{String((Number(t.improvement) * 100).toFixed(1))}%</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Causal Knowledge">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div><span className="text-gray-500">Shared Edges</span><div className="text-sm font-mono font-bold text-blue-600">{String(knowledge?.shared_edges)}</div></div>
                <div><span className="text-gray-500">Domain-Specific</span><div className="text-sm font-mono font-bold text-purple-600">{String(knowledge?.domain_specific_edges)}</div></div>
                <div><span className="text-gray-500">Graph Density</span><div className="text-sm font-mono font-bold text-emerald-600">{String(knowledge?.meta_graph_density)}</div></div>
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderTransfer = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Cross-Domain Causal Transfer">
        <SelectField label="Transfer Mode" value={trMode} onChange={setTrMode} options={TRANSFER_MODES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Source Domains (comma-sep)</label>
          <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trSources} onChange={(e) => setTrSources(e.target.value)} />
        </div>
        <SelectField label="Target Domain" value={trTarget} onChange={setTrTarget} options={DOMAINS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Transfer Strength</label>
          <input type="number" step="0.1" min="0" max="1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trStrength} onChange={(e) => setTrStrength(+e.target.value)} />
        </div>
        <button className="w-full mt-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading}
          onClick={() => callApi("/meta-causal/transfer", { graph_id: "transfer_01", transfer_mode: trMode, source_domains: trSources.split(","), target_domain: trTarget, transfer_strength: trStrength })}>
          {loading ? "Transferring..." : "Run Transfer"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "transfer_results" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const tr = d.transfer_results as Record<string, unknown>;
          const sources = (d.source_analysis || []) as Array<Record<string, unknown>>;
          const bridge = d.bridge_analysis as Record<string, unknown>;
          const recs = d.recommendations as Record<string, unknown>;
          return (<>
            <Card title="Transfer Results">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-teal-600">{String(tr?.total_transferred_edges)}</div><div className="text-xs text-gray-500">Transferred</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(tr?.target_shd_before)}</div><div className="text-xs text-gray-500">SHD Before</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(tr?.target_shd_after)}</div><div className="text-xs text-gray-500">SHD After</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(tr?.improvement_pct)}%</div><div className="text-xs text-gray-500">Improvement</div></div>
              </div>
            </Card>
            <Card title="Source Analysis">
              <div className="space-y-1">
                {sources.map((s, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                    <Badge text={String(s.domain)} color="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" />
                    <span>Edges: {String(s.causal_edges)}</span>
                    <span>Transferable: {String(s.transferable_edges)}</span>
                    <span>Quality: {String(s.transfer_quality)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Bridge & Recommendations">
              <div className="text-xs space-y-1">
                <div>Alignment: <Badge text={String(bridge?.alignment_score)} /> | Overlap: {String(bridge?.distribution_overlap)}</div>
                <div>Optimal Strength: {String(recs?.optimal_strength)} | Best Source: <Badge text={String(recs?.best_source)} /> | Risk: {String(recs?.risk_level)}</div>
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderDistill = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Causal Knowledge Distillation">
        <SelectField label="Distill Type" value={dsType} onChange={setDsType} options={DISTILL_TYPES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Teacher Edges</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dsTeacherEdges} onChange={(e) => setDsTeacherEdges(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Student Capacity</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dsStudentCap} onChange={(e) => setDsStudentCap(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Temperature</label>
          <input type="number" step="0.5" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dsTemp} onChange={(e) => setDsTemp(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Compression Ratio</label>
          <input type="number" step="0.1" min="0.1" max="0.9" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dsRatio} onChange={(e) => setDsRatio(+e.target.value)} />
        </div>
        <button className="w-full mt-2 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading}
          onClick={() => callApi("/meta-causal/distill", { graph_id: "distill_01", distill_type: dsType, teacher_edges: dsTeacherEdges, student_capacity: dsStudentCap, temperature: dsTemp, compression_ratio: dsRatio })}>
          {loading ? "Distilling..." : "Run Distillation"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "distillation" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const teacher = d.teacher_stats as Record<string, unknown>;
          const student = d.student_stats as Record<string, unknown>;
          const dist = d.distillation as Record<string, unknown>;
          const eff = d.efficiency as Record<string, unknown>;
          const edges = d.edge_analysis as Record<string, unknown>;
          return (<>
            <Card title="Teacher vs Student">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="border border-blue-200 dark:border-blue-800 rounded p-3">
                  <div className="text-xs font-semibold text-blue-600 mb-2">Teacher</div>
                  <div className="text-xs space-y-1">
                    <div>Edges: <span className="font-mono">{String(teacher?.edges)}</span></div>
                    <div>F1: <span className="font-mono">{String(teacher?.f1_score)}</span></div>
                    <div>Params: <span className="font-mono">{String(teacher?.parameters)}</span></div>
                  </div>
                </div>
                <div className="border border-emerald-200 dark:border-emerald-800 rounded p-3">
                  <div className="text-xs font-semibold text-emerald-600 mb-2">Student</div>
                  <div className="text-xs space-y-1">
                    <div>Edges: <span className="font-mono">{String(student?.edges)}</span></div>
                    <div>F1: <span className="font-mono">{String(student?.f1_score)}</span></div>
                    <div>Params: <span className="font-mono">{String(student?.parameters)}</span></div>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="Distillation Quality">
              <StatBar label="Knowledge Retention" value={Number(dist?.knowledge_retention || 0)} color="bg-violet-500" />
              <StatBar label="Fidelity" value={Number(dist?.fidelity || 0)} color="bg-emerald-500" />
              <StatBar label="Compression" value={Number(dist?.compression_achieved || 0)} color="bg-amber-500" />
              <div className="mt-2 text-xs text-gray-500">Preserved: {String(edges?.preserved)} | Lost: {String(edges?.lost)} | Approximated: {String(edges?.approximated)}</div>
            </Card>
            <Card title="Efficiency">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div><span className="text-gray-500">Speedup</span><div className="text-sm font-mono font-bold text-violet-600">{String(eff?.inference_speedup)}×</div></div>
                <div><span className="text-gray-500">Mem Reduction</span><div className="text-sm font-mono font-bold text-blue-600">{String(eff?.memory_reduction)}</div></div>
                <div><span className="text-gray-500">Quality Retained</span><div className="text-sm font-mono font-bold text-emerald-600">{String(eff?.quality_retention)}</div></div>
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderIntervene = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Meta-Intervention Optimization">
        <SelectField label="Intervention Type" value={ivType} onChange={setIvType} options={INTERVENTION_TYPES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Variables</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={ivVars} onChange={(e) => setIvVars(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Budget</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={ivBudget} onChange={(e) => setIvBudget(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Effect</label>
          <input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={ivTargetEffect} onChange={(e) => setIvTargetEffect(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Exploration Ratio</label>
          <input type="number" step="0.1" min="0" max="1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={ivExploration} onChange={(e) => setIvExploration(+e.target.value)} />
        </div>
        <button className="w-full mt-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading}
          onClick={() => callApi("/meta-causal/intervene", { graph_id: "intervene_01", intervention_type: ivType, num_variables: ivVars, budget: ivBudget, target_effect: ivTargetEffect, exploration_ratio: ivExploration })}>
          {loading ? "Optimizing..." : "Optimize Interventions"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "optimal_plan" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const plan = d.optimal_plan as Record<string, unknown>;
          const interventions = (plan?.interventions || []) as Array<Record<string, unknown>>;
          const meta = d.meta_analysis as Record<string, unknown>;
          const conv = d.convergence as Record<string, unknown>;
          return (<>
            <Card title="Optimal Intervention Plan">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-rose-600">{String(plan?.total_effect)}</div><div className="text-xs text-gray-500">Total Effect</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(plan?.total_cost)}</div><div className="text-xs text-gray-500">Total Cost</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(plan?.efficiency)}</div><div className="text-xs text-gray-500">Efficiency</div></div>
              </div>
            </Card>
            <Card title="Selected Interventions">
              <div className="space-y-1 max-h-40 overflow-auto">
                {interventions.map((iv, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                    <span className="font-mono">{String(iv.variable)} = {String(iv.value)}</span>
                    <span>Effect: {String(iv.estimated_effect)}</span>
                    <span>ROI: {String(iv.roi)}</span>
                    <Badge text={`${String(iv.confidence)}`} color="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300" />
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Meta Analysis">
              <div className="text-xs space-y-1">
                <StatBar label="Expected Improvement" value={Number(meta?.expected_improvement || 0)} max={0.5} color="bg-rose-500" />
                <StatBar label="Uncertainty Reduction" value={Number(meta?.uncertainty_reduction || 0)} color="bg-blue-500" />
                <div>Converged: {String(conv?.converged)} | Remaining: {String(conv?.remaining_budget)}</div>
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderAdapt = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Domain Adaptation">
        <SelectField label="Method" value={adMethod} onChange={setAdMethod} options={ADAPT_METHODS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Source Size</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adSourceSize} onChange={(e) => setAdSourceSize(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Size</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adTargetSize} onChange={(e) => setAdTargetSize(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Adaptation Steps</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adSteps} onChange={(e) => setAdSteps(+e.target.value)} />
        </div>
        <button className="w-full mt-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading}
          onClick={() => callApi("/meta-causal/adapt", { graph_id: "adapt_01", method: adMethod, source_size: adSourceSize, target_size: adTargetSize, adaptation_steps: adSteps })}>
          {loading ? "Adapting..." : "Run Adaptation"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "adaptation" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const adapt = d.adaptation as Record<string, unknown>;
          const domain = d.domain_analysis as Record<string, unknown>;
          const curve = (d.adaptation_curve || []) as number[];
          const causal = d.causal_preservation as Record<string, unknown>;
          return (<>
            <Card title="Adaptation Results">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(adapt?.source_performance)}</div><div className="text-xs text-gray-500">Source</div></div>
                <div className="text-center"><div className="text-lg font-bold text-red-500">{String(adapt?.target_before)}</div><div className="text-xs text-gray-500">Before</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(adapt?.target_after)}</div><div className="text-xs text-gray-500">After</div></div>
                <div className="text-center"><div className="text-lg font-bold text-cyan-600">+{String(adapt?.improvement)}</div><div className="text-xs text-gray-500">Improvement</div></div>
              </div>
            </Card>
            <Card title="Adaptation Curve">
              <div className="flex items-end gap-1 h-20">
                {curve.map((v, i) => (<div key={i} className="flex-1 bg-cyan-500 rounded-t" style={{ height: `${Math.max(5, (v - 0.2) * 120)}px` }} title={`Step ${i}: ${v}`} />))}
              </div>
            </Card>
            <Card title="Causal Preservation">
              <StatBar label="Preserved Edges" value={Number(causal?.preserved_edges_pct || 0)} color="bg-cyan-500" />
              <div className="text-xs text-gray-500">Spurious removed: {String(causal?.spurious_edges_removed)} | New discovered: {String(causal?.new_edges_discovered)}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderEvaluate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Meta-Causal Evaluation">
        <SelectField label="Metric" value={evMetric} onChange={setEvMetric} options={EVAL_METRICS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Domains</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evDomains} onChange={(e) => setEvDomains(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Shots (comma-sep)</label>
          <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={evShots} onChange={(e) => setEvShots(e.target.value)} />
        </div>
        <SelectField label="Baseline" value={evBaseline} onChange={setEvBaseline} options={["pc_algorithm", "ges", "notears", "lingam", "random"]} />
        <button className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading}
          onClick={() => callApi("/meta-causal/evaluate", { graph_id: "eval_01", metric: evMetric, num_domains: evDomains, shots: evShots.split(",").map(Number), baseline: evBaseline })}>
          {loading ? "Evaluating..." : "Run Evaluation"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "meta_statistics" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const stats = d.meta_statistics as Record<string, unknown>;
          const domains = (d.domain_scores || []) as Array<Record<string, unknown>>;
          const shots = (d.few_shot_analysis || []) as Array<Record<string, unknown>>;
          const comp = d.comparison as Record<string, unknown>;
          return (<>
            <Card title="Meta Statistics">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(stats?.mean)}</div><div className="text-xs text-gray-500">Mean</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(stats?.std)}</div><div className="text-xs text-gray-500">Std</div></div>
                <div className="text-center"><div className="text-sm font-mono text-purple-600">[{String(Array.isArray(stats?.confidence_interval) ? (stats?.confidence_interval as number[])[0] : "")}, {String(Array.isArray(stats?.confidence_interval) ? (stats?.confidence_interval as number[])[1] : "")}]</div><div className="text-xs text-gray-500">95% CI</div></div>
              </div>
              <div className="text-xs">Best: <Badge text={String(stats?.best_domain)} color="bg-emerald-100 text-emerald-700" /> | Worst: <Badge text={String(stats?.worst_domain)} color="bg-red-100 text-red-700" /></div>
            </Card>
            <Card title="Domain Scores">
              <div className="space-y-1">
                {domains.map((ds, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                    <Badge text={String(ds.domain_name)} color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
                    <span className="font-mono">{String(ds.score)}</span>
                    <span>Conf: {String(ds.confidence)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Few-Shot Analysis">
              <div className="space-y-1">
                {shots.map((s, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                    <span>{String(s.shots)}-shot</span>
                    <span>Meta: <span className="font-mono">{String(s.value)}</span></span>
                    <span>Base: <span className="font-mono">{String(s.baseline)}</span></span>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Comparison">
              <div className="text-xs">Baseline: {String(comp?.baseline)} | Significance: {String(comp?.statistical_significance)} | Effect Size: {String(comp?.effect_size)}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div>
      <button className="rounded bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 mb-4" disabled={loading}
        onClick={async () => { setLoading(true); try { const r = await fetch(`${API}/meta-causal/summary`); setResult(await r.json()); } catch (e) { setResult({ error: String(e) }); } setLoading(false); }}>
        {loading ? "Loading..." : "Load Summary"}
      </button>
      {result && <JsonBlock data={result} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Graph Meta-Causal Learning Engine</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.218 — Meta-learning for causal structure discovery across domains, cross-domain transfer, knowledge distillation, and meta-intervention optimization</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button key={t} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === t ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
              onClick={() => { setTab(t); setResult(null); }}>{t}</button>
          ))}
        </div>
        {tab === "Meta-Learn" && renderMetaLearn()}
        {tab === "Transfer" && renderTransfer()}
        {tab === "Distill" && renderDistill()}
        {tab === "Intervene" && renderIntervene()}
        {tab === "Adapt" && renderAdapt()}
        {tab === "Evaluate" && renderEvaluate()}
        {tab === "Summary" && renderSummary()}
      </div>
    </div>
  );
}
