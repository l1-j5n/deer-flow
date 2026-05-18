"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.271 — Causal Workflow Orchestration Engine
   7 tabs: Design | Execute | Monitor | Optimize | Checkpoint | Template | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Design", "Execute", "Monitor", "Optimize", "Checkpoint", "Template", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const WORKFLOW_STAGES = ["discovery","validation","transformation","analysis","synthesis","deployment"];
const EXECUTION_MODES = ["sequential","parallel","conditional","iterative","adaptive","ai_optimized"];
const WORKFLOW_STATUSES = ["pending","running","paused","completed","failed","cancelled"];
const DEPENDENCY_TYPES = ["hard","soft","conditional","resource","temporal","data_flow"];
const OPTIMIZATION_STRATEGIES = ["latency","throughput","accuracy","resource_efficiency","balanced","ai_adaptive"];
const TEMPLATE_CATEGORIES = ["full_pipeline","targeted_analysis","comparative_study","longitudinal","intervention_design","custom"];

const LAYER_MAP: Record<string, { version: string; stage: string; weight: number }> = {
  discovery:      { version: "v1.249", stage: "discovery",      weight: 0.15 },
  explanation:    { version: "v1.250", stage: "analysis",        weight: 0.10 },
  argumentation:  { version: "v1.251", stage: "analysis",        weight: 0.08 },
  fairness:       { version: "v1.252", stage: "validation",      weight: 0.08 },
  curriculum:     { version: "v1.253", stage: "transformation",  weight: 0.06 },
  optimization:   { version: "v1.254", stage: "transformation",  weight: 0.07 },
  intervention:   { version: "v1.255", stage: "analysis",        weight: 0.10 },
  distillation:   { version: "v1.256", stage: "transformation",  weight: 0.06 },
  ensemble:       { version: "v1.257", stage: "synthesis",       weight: 0.05 },
  temporal_evo:   { version: "v1.258", stage: "analysis",        weight: 0.06 },
  feedback_loop:  { version: "v1.259", stage: "synthesis",       weight: 0.05 },
  meta_cognitive: { version: "v1.260", stage: "analysis",        weight: 0.04 },
  emergence:      { version: "v1.261", stage: "analysis",        weight: 0.03 },
  governance:     { version: "v1.262", stage: "validation",      weight: 0.08 },
  transfer:       { version: "v1.263", stage: "transformation",  weight: 0.05 },
  streaming:      { version: "v1.264", stage: "discovery",       weight: 0.04 },
  consensus:      { version: "v1.265", stage: "synthesis",       weight: 0.05 },
  resilience:     { version: "v1.266", stage: "validation",      weight: 0.05 },
  explainability: { version: "v1.267", stage: "analysis",        weight: 0.04 },
  compression:    { version: "v1.268", stage: "transformation",  weight: 0.04 },
  self_healing:   { version: "v1.269", stage: "validation",      weight: 0.05 },
  interop:        { version: "v1.270", stage: "deployment",      weight: 0.06 },
  orchestration:  { version: "v1.271", stage: "synthesis",       weight: 0.01 },
};

const STAGE_COLORS: Record<string, string> = {
  discovery: "blue", validation: "amber", transformation: "purple",
  analysis: "cyan", synthesis: "teal", deployment: "green",
};

// ─── Helpers ──────────────────────────────────────────────
function Badge({ label, color = "blue" }: { label: string; color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-900/40 text-blue-300 border-blue-700",
    green: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
    amber: "bg-amber-900/40 text-amber-300 border-amber-700",
    red: "bg-red-900/40 text-red-300 border-red-700",
    purple: "bg-purple-900/40 text-purple-300 border-purple-700",
    cyan: "bg-cyan-900/40 text-cyan-300 border-cyan-700",
    teal: "bg-teal-900/40 text-teal-300 border-teal-700",
    orange: "bg-orange-900/40 text-orange-300 border-orange-700",
    rose: "bg-rose-900/40 text-rose-300 border-rose-700",
    indigo: "bg-indigo-900/40 text-indigo-300 border-indigo-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded border ${colors[color] ?? colors.blue}`}>
      {label}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select
        className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
        ))}
      </select>
    </div>
  );
}

function NumField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="number" min={min} max={max} step={step}
        className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function Metric({ label, value, color = "text-gray-200" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-sm font-mono font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function ProgressBar({ pct, color = "bg-blue-500" }: { pct: number; color?: string }) {
  return (
    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

// ─── Tab Panels ───────────────────────────────────────────

function DesignPanel() {
  const [stages, setStages] = useState<string[]>(["discovery", "validation", "analysis"]);
  const [execMode, setExecMode] = useState("ai_optimized");
  const [depType, setDepType] = useState("data_flow");
  const [maxParallel, setMaxParallel] = useState(4);
  const [timeout, setTimeout_] = useState(300);

  const stageLayers = stages.map((s) =>
    Object.entries(LAYER_MAP).filter(([, v]) => v.stage === s).map(([k]) => k)
  );
  const totalWeight = stages.reduce((acc, s) => {
    const w = Object.values(LAYER_MAP).filter((v) => v.stage === s).reduce((a, v) => a + v.weight, 0);
    return acc + w;
  }, 0);

  const designQuality = Math.min(0.5 + totalWeight * 0.5 + 0.05, 1.0).toFixed(4);
  const sequentialEst = stages.length * timeout * 0.6;
  const parallelEst = sequentialEst / Math.min(maxParallel, stages.length);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Execution Mode" value={execMode} options={EXECUTION_MODES} onChange={setExecMode} />
        <SelectField label="Dependency Type" value={depType} options={DEPENDENCY_TYPES} onChange={setDepType} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumField label="Max Parallel Stages" value={maxParallel} min={1} max={16} onChange={setMaxParallel} />
        <NumField label="Timeout per Stage (s)" value={timeout} min={10} max={3600} step={10} onChange={setTimeout_} />
      </div>

      <Card title="Pipeline Stage Configuration">
        <div className="flex flex-wrap gap-2 mb-3">
          {WORKFLOW_STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setStages((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])}
              className={`px-3 py-1.5 text-xs rounded border transition ${
                stages.includes(s)
                  ? "bg-blue-900/60 text-blue-300 border-blue-600"
                  : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 mb-2">Selected: {stages.length} stages (click to toggle)</div>
      </Card>

      <div className="grid grid-cols-4 gap-3">
        <Metric label="Stages" value={stages.length} />
        <Metric label="Design Quality" value={designQuality} color="text-emerald-400" />
        <Metric label="Sequential (s)" value={sequentialEst.toFixed(0)} />
        <Metric label="Parallel (s)" value={parallelEst.toFixed(0)} color="text-cyan-400" />
      </div>

      <Card title="Stage → Layer Mapping">
        <div className="space-y-2">
          {stages.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Badge label={s} color={STAGE_COLORS[s] ?? "blue"} />
              <div className="flex-1 text-xs text-gray-400">
                {stageLayers[idx]?.join(", ") || "—"}
              </div>
              <div className="text-xs text-gray-500">#{idx + 1}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Critical Path">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-500">Speedup</div>
            <div className="text-sm font-mono text-amber-400">{(sequentialEst / Math.max(parallelEst, 1)).toFixed(1)}×</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Total Weight</div>
            <div className="text-sm font-mono text-purple-400">{totalWeight.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Data Flow Edges</div>
            <div className="text-sm font-mono text-teal-400">{Math.max(stages.length - 1, 0)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ExecutePanel() {
  const [stage, setStage] = useState("discovery");
  const [execMode, setExecMode] = useState("ai_optimized");
  const [dryRun, setDryRun] = useState(false);

  const layersForStage = Object.entries(LAYER_MAP).filter(([, v]) => v.stage === stage);
  const nLayers = layersForStage.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Stage" value={stage} options={WORKFLOW_STAGES} onChange={setStage} />
        <SelectField label="Execution Mode" value={execMode} options={EXECUTION_MODES} onChange={setExecMode} />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
        <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="rounded" />
        Dry Run (simulate)
      </label>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Layers Involved" value={nLayers} color="text-cyan-400" />
        <Metric label="Stage Type" value={stage} />
        <Metric label="Mode" value={execMode.replace(/_/g, " ")} />
      </div>

      <Card title={`Layer Dispatch: ${stage}`}>
        <div className="space-y-2">
          {layersForStage.map(([name, info]) => (
            <div key={name} className="flex items-center justify-between bg-gray-900/50 rounded px-3 py-2">
              <div className="flex items-center gap-2">
                <Badge label={info.version} color="indigo" />
                <span className="text-sm text-gray-300">{name.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>weight: {info.weight}</span>
                <span className={dryRun ? "text-amber-400" : "text-emerald-400"}>
                  {dryRun ? "simulated" : "ready"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Quality Metrics (estimated)">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Overall Quality</div>
            <ProgressBar pct={82} color="bg-emerald-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Data Fidelity</div>
            <ProgressBar pct={88} color="bg-blue-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Causal Preservation</div>
            <ProgressBar pct={91} color="bg-purple-500" />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Consistency Score</div>
            <ProgressBar pct={94} color="bg-teal-500" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function MonitorPanel() {
  const [wfId, setWfId] = useState("wf-demo-001");

  const stageData = [
    { stage: "discovery",      status: "completed",  progress: 100, duration: 420 },
    { stage: "validation",     status: "completed",  progress: 100, duration: 310 },
    { stage: "transformation", status: "completed",  progress: 100, duration: 680 },
    { stage: "analysis",       status: "running",    progress: 67,  duration: 0 },
    { stage: "synthesis",      status: "pending",    progress: 0,   duration: 0 },
    { stage: "deployment",     status: "pending",    progress: 0,   duration: 0 },
  ];

  const completed = stageData.filter((s) => s.status === "completed").length;
  const running = stageData.filter((s) => s.status === "running").length;
  const overallProgress = stageData.reduce((acc, s) => acc + s.progress, 0) / stageData.length;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-400 mb-1">Workflow ID</label>
        <input
          className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5"
          value={wfId}
          onChange={(e) => setWfId(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Overall" value={`${overallProgress.toFixed(0)}%`} color="text-emerald-400" />
        <Metric label="Completed" value={`${completed}/${stageData.length}`} />
        <Metric label="Running" value={running} color="text-cyan-400" />
      </div>

      <ProgressBar pct={overallProgress} color="bg-emerald-500" />

      <Card title="Stage Progress">
        <div className="space-y-3">
          {stageData.map((s, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Badge label={s.stage} color={STAGE_COLORS[s.stage] ?? "blue"} />
                  <span className={`text-xs ${
                    s.status === "completed" ? "text-emerald-400" :
                    s.status === "running" ? "text-cyan-400" :
                    s.status === "failed" ? "text-red-400" : "text-gray-500"
                  }`}>
                    {s.status}
                  </span>
                </div>
                {s.duration > 0 && <span className="text-xs text-gray-500">{s.duration}ms</span>}
              </div>
              <ProgressBar
                pct={s.progress}
                color={
                  s.status === "completed" ? "bg-emerald-500" :
                  s.status === "running" ? "bg-cyan-500" :
                  s.status === "failed" ? "bg-red-500" : "bg-gray-600"
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Bottleneck Detection">
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>transformation stage: 680ms — consider splitting</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>discovery stage: 420ms — within normal range</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function OptimizePanel() {
  const [strategy, setStrategy] = useState("ai_adaptive");
  const [histRuns, setHistRuns] = useState(5);

  const strategyLabels: Record<string, string> = {
    latency: "Minimize execution time",
    throughput: "Maximize workflows/second",
    accuracy: "Maximize output quality",
    resource_efficiency: "Minimize resource consumption",
    balanced: "Balance all dimensions",
    ai_adaptive: "AI dynamically selects optimal strategy",
  };

  const strategyColors: Record<string, string> = {
    latency: "text-amber-400",
    throughput: "text-cyan-400",
    accuracy: "text-emerald-400",
    resource_efficiency: "text-purple-400",
    balanced: "text-blue-400",
    ai_adaptive: "text-rose-400",
  };

  const optimizationTypes: Record<string, string[]> = {
    latency: ["parallel_grouping", "cache_reuse", "early_termination"],
    throughput: ["batch_pipeline", "resource_pooling", "async_io"],
    accuracy: ["ensemble_layers", "validation_gates", "iterative_refinement"],
    resource_efficiency: ["memory_pooling", "lazy_loading", "result_compression"],
    balanced: ["mixed_parallelism", "smart_caching", "resource_budgeting"],
    ai_adaptive: ["dynamic_reordering", "predictive_caching", "adaptive_timeout", "failure_prediction"],
  };

  return (
    <div className="space-y-4">
      <SelectField label="Optimization Strategy" value={strategy} options={OPTIMIZATION_STRATEGIES} onChange={setStrategy} />
      <NumField label="Historical Runs to Analyze" value={histRuns} min={1} max={50} onChange={setHistRuns} />

      <Card title="Strategy Details">
        <p className={`text-sm ${strategyColors[strategy] ?? "text-gray-300"}`}>
          {strategyLabels[strategy] ?? strategy}
        </p>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Optimizations" value={optimizationTypes[strategy]?.length ?? 0} color="text-amber-400" />
        <Metric label="Runs Analyzed" value={histRuns} />
        <Metric label="Est. Gain" value={`${(15 + 20 * Math.random()).toFixed(0)}%`} color="text-emerald-400" />
      </div>

      <Card title="Applied Optimizations">
        <div className="space-y-2">
          {(optimizationTypes[strategy] ?? []).map((opt) => (
            <div key={opt} className="flex items-center justify-between bg-gray-900/50 rounded px-3 py-2">
              <span className="text-sm text-gray-300">{opt.replace(/_/g, " ")}</span>
              <Badge label={`+${(8 + 15 * Math.random()).toFixed(0)}%`} color="green" />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Recommended Execution Plan">
        <div className="text-xs text-gray-400 space-y-1">
          <div>Mode: <span className="text-gray-200">{strategy === "ai_adaptive" ? "AI Optimized" : "Parallel"}</span></div>
          <div>Max Parallel: <span className="text-gray-200">6</span></div>
          <div>Checkpoint Interval: <span className="text-gray-200">60s</span></div>
          <div>Quality Gates: <span className="text-emerald-400">Enabled</span></div>
          <div>Retry Policy: <span className="text-gray-200">3 retries, exponential backoff</span></div>
        </div>
      </Card>
    </div>
  );
}

function CheckpointPanel() {
  const [action, setAction] = useState("save");
  const [cpId, setCpId] = useState("");
  const [includeArtifacts, setIncludeArtifacts] = useState(true);
  const [wfId, setWfId] = useState("wf-demo-001");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Action" value={action} options={["save", "restore"]} onChange={setAction} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Workflow ID</label>
          <input
            className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5"
            value={wfId}
            onChange={(e) => setWfId(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Checkpoint ID (blank = latest)</label>
        <input
          className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5"
          value={cpId}
          onChange={(e) => setCpId(e.target.value)}
          placeholder="auto-generated if blank"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
        <input type="checkbox" checked={includeArtifacts} onChange={(e) => setIncludeArtifacts(e.target.checked)} className="rounded" />
        Include artifacts (causal graph, claims, interventions)
      </label>

      <Card title={`Checkpoint ${action === "save" ? "Save" : "Restore"} Preview`}>
        <div className="space-y-2 text-xs text-gray-400">
          {action === "save" ? (
            <>
              <div className="flex justify-between"><span>Stage snapshots</span><span className="text-gray-200">6 stages captured</span></div>
              <div className="flex justify-between"><span>Causal graph</span><span className="text-gray-200">{includeArtifacts ? "247 nodes, 412 edges" : "excluded"}</span></div>
              <div className="flex justify-between"><span>Claims registry</span><span className="text-gray-200">{includeArtifacts ? "89 claims, 72 validated" : "excluded"}</span></div>
              <div className="flex justify-between"><span>Compression ratio</span><span className="text-purple-400">{includeArtifacts ? "0.42" : "1.00"}</span></div>
              <div className="flex justify-between"><span>Total data size</span><span className="text-gray-200">{includeArtifacts ? "4.8 MB" : "0.3 MB"}</span></div>
            </>
          ) : (
            <>
              <div className="flex justify-between"><span>Restore from</span><span className="text-gray-200">{cpId || "latest checkpoint"}</span></div>
              <div className="flex justify-between"><span>Stages restored</span><span className="text-cyan-400">4 stages</span></div>
              <div className="flex justify-between"><span>Artifacts</span><span className="text-gray-200">{includeArtifacts ? "included" : "excluded"}</span></div>
              <div className="flex justify-between"><span>Data restored</span><span className="text-gray-200">4.8 MB</span></div>
            </>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Action" value={action} color={action === "save" ? "text-emerald-400" : "text-cyan-400"} />
        <Metric label="Artifacts" value={includeArtifacts ? "Yes" : "No"} />
      </div>
    </div>
  );
}

function TemplatePanel() {
  const [category, setCategory] = useState("full_pipeline");
  const defaultLayers = ["discovery","validation","explanation","governance","compression","interop"];
  const [selectedLayers, setSelectedLayers] = useState<string[]>(defaultLayers);

  const templateInfo: Record<string, { name: string; stages: number; estMin: number; complexity: string }> = {
    full_pipeline:        { name: "Full Causal Analysis Pipeline", stages: 6, estMin: 15, complexity: "high" },
    targeted_analysis:    { name: "Targeted Causal Analysis",     stages: 3, estMin: 5,  complexity: "medium" },
    comparative_study:    { name: "Comparative Causal Study",     stages: 5, estMin: 12, complexity: "high" },
    longitudinal:         { name: "Longitudinal Causal Tracking", stages: 6, estMin: 20, complexity: "high" },
    intervention_design:  { name: "Causal Intervention Design",   stages: 5, estMin: 10, complexity: "medium" },
    custom:               { name: "Custom Causal Workflow",       stages: 3, estMin: 8,  complexity: "variable" },
  };

  const tpl = templateInfo[category] ?? templateInfo.custom;

  const toggleLayer = (layer: string) => {
    setSelectedLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  };

  return (
    <div className="space-y-4">
      <SelectField label="Template Category" value={category} options={TEMPLATE_CATEGORIES} onChange={setCategory} />

      <Card title={tpl.name}>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-gray-500">Stages</div>
            <div className="text-sm font-mono text-cyan-400">{tpl.stages}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Est. Duration</div>
            <div className="text-sm font-mono text-amber-400">{tpl.estMin} min</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Complexity</div>
            <div className={`text-sm font-mono ${
              tpl.complexity === "high" ? "text-red-400" : tpl.complexity === "medium" ? "text-amber-400" : "text-gray-400"
            }`}>{tpl.complexity}</div>
          </div>
        </div>
      </Card>

      <Card title="Layer Selection (click to toggle)">
        <div className="flex flex-wrap gap-2">
          {Object.keys(LAYER_MAP).map((layer) => (
            <button
              key={layer}
              onClick={() => toggleLayer(layer)}
              className={`px-2 py-1 text-xs rounded border transition ${
                selectedLayers.includes(layer)
                  ? "bg-indigo-900/60 text-indigo-300 border-indigo-600"
                  : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500"
              }`}
            >
              {layer.replace(/_/g, " ")}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">{selectedLayers.length} of {Object.keys(LAYER_MAP).length} layers selected</div>
      </Card>

      <Card title="Template Quality">
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Layers Mapped" value={selectedLayers.length} color="text-indigo-400" />
          <Metric label="Quality Score" value={(0.75 + 0.25 * selectedLayers.length / Object.keys(LAYER_MAP).length).toFixed(4)} color="text-emerald-400" />
        </div>
      </Card>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="space-y-4">
      <Card title="v1.271 — Causal Workflow Orchestration Engine">
        <p className="text-sm text-gray-400">
          The <span className="text-cyan-300">conductor layer</span> for the 22-layer causal intelligence stack.
          Composes, sequences, parallelizes, and manages end-to-end causal analysis workflows.
        </p>
      </Card>

      <Card title="Enums (6 × 6 = 36 values)">
        <div className="space-y-2">
          {[
            { name: "WorkflowStage", values: WORKFLOW_STAGES, color: "blue" },
            { name: "ExecutionMode", values: EXECUTION_MODES, color: "cyan" },
            { name: "WorkflowStatus", values: WORKFLOW_STATUSES, color: "amber" },
            { name: "DependencyType", values: DEPENDENCY_TYPES, color: "purple" },
            { name: "OptimizationStrategy", values: OPTIMIZATION_STRATEGIES, color: "teal" },
            { name: "TemplateCategory", values: TEMPLATE_CATEGORIES, color: "green" },
          ].map((e) => (
            <div key={e.name}>
              <div className="text-xs text-gray-400 mb-1">{e.name}</div>
              <div className="flex flex-wrap gap-1">
                {e.values.map((v) => (
                  <Badge key={v} label={v.replace(/_/g, " ")} color={e.color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Endpoints (7)">
        <div className="space-y-1 text-xs">
          {[
            { method: "POST", path: "/graph/causal-workflow/design", desc: "Design workflow with dependency resolution" },
            { method: "POST", path: "/graph/causal-workflow/execute", desc: "Execute stage with layer dispatching" },
            { method: "POST", path: "/graph/causal-workflow/monitor", desc: "Monitor with bottleneck detection" },
            { method: "POST", path: "/graph/causal-workflow/optimize", desc: "Auto-optimize execution strategy" },
            { method: "POST", path: "/graph/causal-workflow/checkpoint", desc: "Save/restore state checkpoints" },
            { method: "POST", path: "/graph/causal-workflow/template", desc: "Generate workflow templates" },
            { method: "GET",  path: "/graph/causal-workflow/overview", desc: "System overview" },
          ].map((ep) => (
            <div key={ep.path} className="flex gap-2 text-gray-400">
              <span className={`font-mono ${ep.method === "GET" ? "text-emerald-400" : "text-blue-400"}`}>{ep.method}</span>
              <span className="text-gray-300 font-mono">{ep.path}</span>
              <span>— {ep.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Architecture Chain (23 layers)">
        <div className="text-xs text-gray-400 space-y-0.5 font-mono">
          <div>Pipeline (v1.249-259) → Meta-Cognitive (v1.260) → Emergence (v1.261)</div>
          <div>→ Governance (v1.262) → Transfer (v1.263) → Streaming (v1.264)</div>
          <div>→ Consensus (v1.265) → Resilience (v1.266) → Explainability (v1.267)</div>
          <div>→ Compression (v1.268) → Self-Healing (v1.269) → Interop (v1.270)</div>
          <div className="text-cyan-400 font-bold">→ <span className="underline">Orchestration (v1.271) ← YOU ARE HERE</span></div>
        </div>
      </Card>

      <Card title="22-Layer Mapping">
        <div className="space-y-1">
          {Object.entries(LAYER_MAP).map(([name, info]) => (
            <div key={name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Badge label={info.version} color="indigo" />
                <span className="text-gray-300">{name.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <span>{info.stage}</span>
                <span>w: {info.weight}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

export default function CausalWorkflowOrchestrationPage() {
  const [tab, setTab] = useState<Tab>("Design");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-100">
            Causal Workflow Orchestration
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            v1.271 — Conductor layer for the 22-layer causal intelligence stack
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-800 pb-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm rounded-t transition ${
                tab === t
                  ? "bg-gray-800 text-white border border-gray-700 border-b-gray-800 -mb-[1px]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-b-lg p-5">
          {tab === "Design" && <DesignPanel />}
          {tab === "Execute" && <ExecutePanel />}
          {tab === "Monitor" && <MonitorPanel />}
          {tab === "Optimize" && <OptimizePanel />}
          {tab === "Checkpoint" && <CheckpointPanel />}
          {tab === "Template" && <TemplatePanel />}
          {tab === "Overview" && <OverviewPanel />}
        </div>
      </div>
    </div>
  );
}
