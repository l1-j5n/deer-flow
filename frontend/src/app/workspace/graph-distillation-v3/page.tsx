"use client";

import { useState } from "react";

// Enums mirror backend
const DISTIL_METHODS = ["response", "feature", "relation", "graph", "attention", "progressive"];
const TEACHER_POLICIES = ["best_accuracy", "diversity", "complementary", "nas_optimized", "cl_aware", "reasoning_guided"];
const KNOWLEDGE_TYPES = ["dark", "feature_map", "relation_structure", "attention_pattern", "reasoning_chain", "cl_experience"];
const COMPRESSION_RATIOS = ["minimal", "moderate", "aggressive", "extreme", "adaptive"];
const PRESERVE_OBJECTIVES = ["accuracy", "fairness", "explainability", "privacy", "reasoning", "multi_objective"];
const SCHEDULE_TYPES = ["linear", "cosine", "step", "warmup", "adaptive", "curriculum"];

const TABS = [
  { id: "teachers", label: "Teachers", icon: "👨‍🏫" },
  { id: "knowledge", label: "Knowledge", icon: "🧠" },
  { id: "student", label: "Student", icon: "🎓" },
  { id: "reasoning", label: "Reasoning", icon: "🔗" },
  { id: "compress", label: "Compress", icon: "📦" },
  { id: "pipeline", label: "Pipeline", icon: "⚡" },
  { id: "summary", label: "Summary", icon: "📊" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface ApiResult {
  [key: string]: unknown;
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[] | string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <select
        className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-900/40 text-green-400 border-green-700",
    blue: "bg-blue-900/40 text-blue-400 border-blue-700",
    purple: "bg-purple-900/40 text-purple-400 border-purple-700",
    amber: "bg-amber-900/40 text-amber-400 border-amber-700",
    red: "bg-red-900/40 text-red-400 border-red-700",
    cyan: "bg-cyan-900/40 text-cyan-400 border-cyan-700",
  };
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-lg font-semibold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

// ---------- Tab Components ----------

function TeachersTab() {
  const [method, setMethod] = useState("progressive");
  const [policy, setPolicy] = useState("nas_optimized");
  const [numTeachers, setNumTeachers] = useState(3);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/electron/kg/distil-v3/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, teacher_policy: policy, num_teachers: numTeachers }),
      });
      setResult(await res.json());
    } catch {
      setResult({ error: "Failed to fetch" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Distillation Method" value={method} options={DISTIL_METHODS} onChange={setMethod} />
        <SelectField label="Teacher Policy" value={policy} options={TEACHER_POLICIES} onChange={setPolicy} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-medium">Num Teachers</label>
          <input
            type="number" min={1} max={8} value={numTeachers}
            onChange={(e) => setNumTeachers(parseInt(e.target.value) || 3)}
            className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <button
        onClick={run}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded"
      >
        {loading ? "Running..." : "Select Teachers"}
      </button>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="Avg Teacher Acc" value={((result.avg_teacher_accuracy as number) || 0).toFixed(4)} />
            <MetricCard label="Ensemble Acc" value={((result.ensemble_accuracy as number) || 0).toFixed(4)} />
            <MetricCard label="Avg Params" value={`${((result.avg_teacher_params_m as number) || 0).toFixed(1)}M`} />
            <MetricCard label="Diversity" value={((result.teacher_diversity as number) || 0).toFixed(4)} />
          </div>
          {(result.selected_teachers as ApiResult[])?.map((t, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white text-sm">{t.name as string}</span>
                <Badge color="blue">{t.specialization as string}</Badge>
                <Badge color="green">Acc: {(t.accuracy as number).toFixed(4)}</Badge>
              </div>
              <div className="text-xs text-gray-400">
                Params: {(t.params_m as number).toFixed(1)}M · FLOPs: {(t.flops_g as number).toFixed(1)}G ·
                CL Stable: {(t.cl_stability as number).toFixed(3)} · Reasoning: {(t.reasoning_score as number).toFixed(3)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function KnowledgeTab() {
  const [temp, setTemp] = useState(4.0);
  const [alpha, setAlpha] = useState(0.7);
  const [selTypes, setSelTypes] = useState<string[]>(["dark", "feature_map", "reasoning_chain"]);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleType = (t: string) => setSelTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/electron/kg/distil-v3/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ knowledge_types: selTypes, temperature: temp, alpha }),
      });
      setResult(await res.json());
    } catch {
      setResult({ error: "Failed" });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {KNOWLEDGE_TYPES.map((t) => (
          <button
            key={t} onClick={() => toggleType(t)}
            className={`text-xs px-2 py-1 rounded border ${selTypes.includes(t) ? "bg-blue-700 border-blue-500 text-white" : "bg-gray-800 border-gray-600 text-gray-400"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Temperature ({temp})</label>
          <input type="range" min={0.5} max={20} step={0.5} value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} className="w-full" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Alpha ({alpha})</label>
          <input type="range" min={0.1} max={1.0} step={0.05} value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))} className="w-full" />
        </div>
      </div>
      <button onClick={run} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded">
        {loading ? "Analyzing..." : "Transfer Knowledge"}
      </button>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="Transfer Efficiency" value={((result.avg_transfer_efficiency as number) || 0).toFixed(4)} />
            <MetricCard label="Combined Loss" value={((result.combined_loss as number) || 0).toFixed(4)} />
            <MetricCard label="Total Dim" value={String(result.total_knowledge_dim || 0)} />
          </div>
          {Object.entries(result.knowledge_types as Record<string, ApiResult> || {}).map(([k, v]) => (
            <div key={k} className="bg-gray-800/50 border border-gray-700 rounded p-2">
              <div className="font-medium text-sm text-white mb-1">{k}</div>
              <div className="text-xs text-gray-400">
                Dim: {v.dim as number} · Efficiency: {(v.distillation_efficiency as number).toFixed(4)} ·
                Absorption: {(v.student_absorption as number).toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentTab() {
  const [arch, setArch] = useState("GAT-4L-128D");
  const [comp, setComp] = useState("moderate");
  const [preserve, setPreserve] = useState("multi_objective");
  const [epochs, setEpochs] = useState(100);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/electron/kg/distil-v3/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_arch: arch, compression: comp, preserve, epochs }),
      });
      setResult(await res.json());
    } catch { setResult({ error: "Failed" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Student Arch</label>
          <input value={arch} onChange={(e) => setArch(e.target.value)} className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white" />
        </div>
        <SelectField label="Compression" value={comp} options={COMPRESSION_RATIOS} onChange={setComp} />
        <SelectField label="Preserve" value={preserve} options={PRESERVE_OBJECTIVES} onChange={setPreserve} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Epochs</label>
          <input type="number" min={10} max={500} value={epochs} onChange={(e) => setEpochs(parseInt(e.target.value) || 100)} className="bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white" />
        </div>
      </div>
      <button onClick={run} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded">
        {loading ? "Training..." : "Train Student"}
      </button>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="Teacher Acc" value={((result.teacher_accuracy as number) || 0).toFixed(4)} />
            <MetricCard label="Student Acc" value={((result.student_accuracy as number) || 0).toFixed(4)} />
            <MetricCard label="Acc Gap" value={((result.accuracy_gap as number) || 0).toFixed(4)} />
            <MetricCard label="Retention" value={((result.accuracy_retention as number) || 0).toFixed(4)} />
          </div>
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="Params Reduction" value={`${((result.params_reduction_pct as number) || 0).toFixed(1)}%`} />
            <MetricCard label="Speedup" value={`${((result.inference_speedup as number) || 0).toFixed(2)}x`} />
            <MetricCard label="Reasoning Pres." value={((result.reasoning_preservation as number) || 0).toFixed(4)} />
            <MetricCard label="CL Resistance" value={((result.cl_forgetting_resistance as number) || 0).toFixed(4)} />
          </div>
          {(result.epoch_log as ApiResult[])?.map((e, i) => (
            <div key={i} className="flex gap-4 text-xs text-gray-400 bg-gray-800/50 rounded p-2">
              <span>Epoch {e.epoch as number}</span>
              <span>Loss: {(e.train_loss as number).toFixed(4)}</span>
              <span>Acc: {(e.val_acc as number).toFixed(4)}</span>
              <span>Reasoning: {(e.reasoning_score as number).toFixed(4)}</span>
              <span>CL: {(e.cl_stability as number).toFixed(4)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReasoningTab() {
  const [threshold, setThreshold] = useState(0.75);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/electron/kg/distil-v3/reasoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reasoning_methods: ["symbolic_rules", "multi_hop_paths", "causal_chains", "abductive_hypotheses"], preserve_threshold: threshold }),
      });
      setResult(await res.json());
    } catch { setResult({ error: "Failed" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-400">Preserve Threshold ({threshold})</label>
        <input type="range" min={0.5} max={1.0} step={0.05} value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} className="w-full" />
      </div>
      <button onClick={run} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded">
        {loading ? "Analyzing..." : "Check Reasoning Preservation"}
      </button>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="Overall" value={((result.overall_preservation as number) || 0).toFixed(4)} />
            <MetricCard label="Certification" value={(result.certification as string) || "N/A"} />
            <MetricCard label="All Pass" value={(result.all_methods_pass as boolean) ? "✅ Yes" : "❌ No"} />
          </div>
          {Object.entries(result.reasoning_methods as Record<string, ApiResult> || {}).map(([k, v]) => (
            <div key={k} className="bg-gray-800/50 border border-gray-700 rounded p-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-white">{k}</span>
                <Badge color={v.passes_threshold ? "green" : "red"}>{v.passes_threshold ? "PASS" : "FAIL"}</Badge>
              </div>
              <div className="text-xs text-gray-400">
                Teacher: {(v.teacher_score as number).toFixed(4)} · Student: {(v.student_score as number).toFixed(4)} ·
                Preservation: {(v.preservation_rate as number).toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompressTab() {
  const [comp, setComp] = useState("moderate");
  const [target, setTarget] = useState(0.85);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/electron/kg/distil-v3/compress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ compression: comp, preserve: ["accuracy", "reasoning", "fairness"], accuracy_target: target }),
      });
      setResult(await res.json());
    } catch { setResult({ error: "Failed" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Compression" value={comp} options={COMPRESSION_RATIOS} onChange={setComp} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Accuracy Target ({target})</label>
          <input type="range" min={0.5} max={1.0} step={0.05} value={target} onChange={(e) => setTarget(parseFloat(e.target.value))} className="w-full" />
        </div>
      </div>
      <button onClick={run} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded">
        {loading ? "Analyzing..." : "Analyze Compression"}
      </button>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="Params ↓" value={`${((result.total_params_reduction as number) || 0).toFixed(1)}%`} />
            <MetricCard label="FLOPs ↓" value={`${((result.flops_reduction as number) || 0).toFixed(1)}%`} />
            <MetricCard label="Memory ↓" value={`${((result.memory_reduction as number) || 0).toFixed(1)}%`} />
            <MetricCard label="Speedup" value={`${((result.inference_speedup as number) || 0).toFixed(2)}x`} />
          </div>
          {(result.layers_analysis as ApiResult[])?.map((l, i) => (
            <div key={i} className="flex items-center gap-3 text-xs bg-gray-800/50 rounded p-2">
              <span className="text-white font-medium w-24">{l.layer as string}</span>
              <span className="text-gray-400">T: {l.teacher_dim as number} → S: {l.student_dim as number}</span>
              <Badge color={l.priority === "keep" ? "green" : l.priority === "compress" ? "amber" : "red"}>{l.priority as string}</Badge>
              <span className="text-gray-500">Acc Δ: {(l.accuracy_impact as number).toFixed(4)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PipelineTab() {
  const [strategy, setStrategy] = useState("curriculum");
  const [ratio, setRatio] = useState(0.5);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/electron/kg/distil-v3/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy, max_steps: 7, student_target_ratio: ratio }),
      });
      setResult(await res.json());
    } catch { setResult({ error: "Failed" }); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Schedule" value={strategy} options={SCHEDULE_TYPES} onChange={setStrategy} />
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">Target Ratio ({ratio})</label>
          <input type="range" min={0.1} max={1.0} step={0.05} value={ratio} onChange={(e) => setRatio(parseFloat(e.target.value))} className="w-full" />
        </div>
      </div>
      <button onClick={run} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded">
        {loading ? "Running..." : "Run Pipeline"}
      </button>
      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="Duration" value={`${((result.total_duration_s as number) || 0).toFixed(1)}s`} />
            <MetricCard label="Steps" value={`${result.steps_completed as number || 0}/7`} />
            <MetricCard label="Certified" value={(result.final_result as ApiResult)?.quality_certified ? "✅" : "❌"} />
          </div>
          {(result.steps as ApiResult[])?.map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-xs bg-gray-800/50 rounded p-2">
              <span className="text-gray-500 w-6">#{s.step as number}</span>
              <span className="text-white font-medium flex-1">{s.stage as string}</span>
              <Badge color="green">{s.status as string}</Badge>
              <span className="text-gray-400">{(s.duration_s as number).toFixed(1)}s</span>
              <span className="text-gray-400">Q: {(s.quality_score as number).toFixed(3)}</span>
            </div>
          ))}
          {result.resource_usage && (
            <div className="text-xs text-gray-400 bg-gray-800/50 rounded p-2">
              GPU: {(result.resource_usage as ApiResult).gpu_hours as number}h ·
              Peak Mem: {(result.resource_usage as ApiResult).peak_memory_gb as number}GB ·
              Data: {(result.resource_usage as ApiResult).data_processed_gb as number}GB
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryTab() {
  const [data, setData] = useState<ApiResult | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/electron/kg/distil-v3/summary");
      setData(await res.json());
    } catch { setData(null); }
  };

  return (
    <div className="space-y-4">
      <button onClick={fetchSummary} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded">
        Load Summary
      </button>
      {data && (
        <div className="space-y-3">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-1">{data.feature as string}</h3>
            <p className="text-sm text-gray-400">{data.subtitle as string}</p>
            <p className="text-xs text-gray-500 mt-1">Version: {data.version as string}</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="Teachers Cached" value={String(data.teachers_cached || 0)} />
            <MetricCard label="Knowledge Cached" value={String(data.knowledge_cached || 0)} />
            <MetricCard label="Student Cached" value={String(data.student_cached || 0)} />
            <MetricCard label="Reasoning Cached" value={String(data.reasoning_cached || 0)} />
            <MetricCard label="Compress Cached" value={String(data.compress_cached || 0)} />
            <MetricCard label="Pipeline Cached" value={String(data.pipeline_cached || 0)} />
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded p-3">
            <h4 className="text-sm font-medium text-white mb-2">Enums</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(data.distillation_methods as string[])?.map((m) => <Badge key={m} color="blue">{m}</Badge>)}
            </div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded p-3">
            <h4 className="text-sm font-medium text-white mb-2">Integration</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(data.integration as Record<string, string> || {}).map(([k, v]) => (
                <span key={k} className="text-gray-400">{k}: <span className="text-blue-400">{v}</span></span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Main Page ----------

export default function GraphDistillationV3Page() {
  const [activeTab, setActiveTab] = useState<TabId>("teachers");

  const renderTab = () => {
    switch (activeTab) {
      case "teachers": return <TeachersTab />;
      case "knowledge": return <KnowledgeTab />;
      case "student": return <StudentTab />;
      case "reasoning": return <ReasoningTab />;
      case "compress": return <CompressTab />;
      case "pipeline": return <PipelineTab />;
      case "summary": return <SummaryTab />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      <div className="px-6 py-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Graph Distillation v3</h1>
        <p className="text-sm text-gray-400 mt-1">NAS + CL-aware Multi-Teacher Distillation with Reasoning Preservation</p>
      </div>

      <div className="flex border-b border-gray-700 px-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">{renderTab()}</div>
    </div>
  );
}
