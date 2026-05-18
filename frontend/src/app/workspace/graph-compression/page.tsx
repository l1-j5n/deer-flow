"use client";

import { useState } from "react";

const API = "/api/graph";

const PRUNE_STRATEGIES = ["magnitude", "gradient", "attention", "structural", "lottery_ticket", "movement"];
const QUANT_TYPES = ["int8", "int4", "fp16", "bf16", "mixed_precision", "adaptive"];
const DISTILL_TYPES = ["task_distill", "feature_distill", "response_distill", "relational_distill", "progressive_distill", "self_distill"];
const STRUCTURE_METHODS = ["pooling", "coarsening", "partition", "skeleton", "core_extraction", "spectral_compress"];
const HW_TARGETS = ["cpu_server", "gpu_consumer", "gpu_datacenter", "edge_mobile", "iot_device", "fpga"];
const QUALITY_GUARANTEES = ["bounded_error", "relative_accuracy", "rank_preservation", "spectral_similarity", "structural_fidelity", "downstream_preserved"];

const TABS = ["Prune", "Quantize", "Distill", "Structure", "Hardware", "Quality", "Summary"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>{children}</div>;
}
function StatBar({ label, value, max = 1, color = "bg-emerald-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(4)}</span></div><div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div></div>;
}
function JsonBlock({ data }: { data: unknown }) {
  return <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto max-h-80 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label><select className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></div>;
}
function Badge({ text, color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

export default function GraphCompressionPage() {
  const [tab, setTab] = useState<Tab>("Prune");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const [pStrategy, setPStrategy] = useState("magnitude");
  const [pLayers, setPLayers] = useState(6);
  const [pDim, setPDim] = useState(256);
  const [pSparsity, setPSparsity] = useState(0.5);

  const [qType, setQType] = useState("int8");
  const [qSize, setQSize] = useState(500);
  const [qParams, setQParams] = useState(1000000);
  const [qCalib, setQCalib] = useState(128);

  const [dType, setDType] = useState("task_distill");
  const [dTeacher, setDTeacher] = useState(1000000);
  const [dStudent, setDStudent] = useState(100000);
  const [dTemp, setDTemp] = useState(3.0);

  const [sMethod, setSMethod] = useState("coarsening");
  const [sNodes, setSNodes] = useState(1000);
  const [sEdges, setSEdges] = useState(5000);
  const [sRatio, setSRatio] = useState(0.3);

  const [hTarget, setHTarget] = useState("edge_mobile");
  const [hSize, setHSize] = useState(500);
  const [hLatency, setHLatency] = useState(200);

  const [qaGuarantee, setQaGuarantee] = useState("bounded_error");
  const [qaAccuracy, setQaAccuracy] = useState(0.95);
  const [qaParams, setQaParams] = useState(1000000);
  const [qaMaxLoss, setQaMaxLoss] = useState(0.02);

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true); setResult(null);
    try { const r = await fetch(`${API}${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); setResult(await r.json()); }
    catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const renderPrune = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Model Pruning">
        <SelectField label="Strategy" value={pStrategy} onChange={setPStrategy} options={PRUNE_STRATEGIES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Layers</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={pLayers} onChange={(e) => setPLayers(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hidden Dim</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={pDim} onChange={(e) => setPDim(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sparsity</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={pSparsity} onChange={(e) => setPSparsity(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/compression/prune", { graph_id: "pr_01", strategy: pStrategy, num_layers: pLayers, hidden_dim: pDim, sparsity: pSparsity })}>{loading ? "Pruning..." : "Run Pruning"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "compression" in (result as Record<string, unknown>) && "quality" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const comp = d.compression as Record<string, unknown>;
          const quality = d.quality as Record<string, unknown>;
          const layers = (d.layer_details || []) as Array<Record<string, unknown>>;
          const recovery = d.recovery as Record<string, unknown>;
          return (<>
            <Card title="Compression Results">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-red-600">{String(comp?.original_params)}</div><div className="text-xs text-gray-500">Original Params</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(comp?.pruned_params)}</div><div className="text-xs text-gray-500">Pruned</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(comp?.compression_ratio)}</div><div className="text-xs text-gray-500">Ratio</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(comp?.flops_reduction)}</div><div className="text-xs text-gray-500">FLOPs Saved</div></div>
              </div>
            </Card>
            <Card title="Quality & Recovery">
              <StatBar label="Accuracy Retention" value={Number(quality?.accuracy_retention || 0)} color="bg-red-500" />
              <div className="text-xs mt-2">Perplexity: +{String(quality?.perplexity_increase)} | Embedding Shift: {String(quality?.embedding_shift)}</div>
              <div className="text-xs mt-1">Retraining: {String(recovery?.retraining_epochs)} epochs | Recovery: {String(recovery?.recovery_rate)} | Lottery Ticket: {String(recovery?.lottery_ticket_found)}</div>
            </Card>
            <Card title="Layer Details">
              <div className="space-y-1">{layers.map((l, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><span className="font-mono">Layer {String(l.layer)}</span><span>Kept: {String(l.kept_ratio)}</span><span>Dim: {String(l.pruned_dim)}</span></div>))}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderQuantize = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Quantization">
        <SelectField label="Type" value={qType} onChange={setQType} options={QUANT_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Model Size (MB)</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={qSize} onChange={(e) => setQSize(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Parameters</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={qParams} onChange={(e) => setQParams(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/compression/quantize", { graph_id: "qt_01", quant_type: qType, model_size_mb: qSize, num_parameters: qParams, calibration_samples: qCalib })}>{loading ? "Quantizing..." : "Quantize"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "quant_config" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const comp = d.compression as Record<string, unknown>;
          const quality = d.quality as Record<string, unknown>;
          const layers = (d.layer_analysis || []) as Array<Record<string, unknown>>;
          return (<>
            <Card title="Quantization Results">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(comp?.original_size_mb)} MB</div><div className="text-xs text-gray-500">Original</div></div>
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(comp?.compressed_size_mb)} MB</div><div className="text-xs text-gray-500">Compressed</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(comp?.speedup_factor)}×</div><div className="text-xs text-gray-500">Speedup</div></div>
              </div>
            </Card>
            <Card title="Quality Metrics">
              <StatBar label="Accuracy Retention" value={Number(quality?.accuracy_retention || 0)} color="bg-amber-500" />
              <StatBar label="Cosine Similarity" value={Number(quality?.cosine_similarity || 0)} color="bg-blue-500" />
              <div className="text-xs">SNR: {String(quality?.snr_db)} dB</div>
            </Card>
            <Card title="Layer Sensitivity">
              <div className="space-y-1">{layers.map((l, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><span className="font-mono">{String(l.layer)}</span><span>Sensitivity: {String(l.sensitivity)}</span><span>Bits: {String(l.recommended_bits)}</span></div>))}</div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderDistill = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Distillation Compression">
        <SelectField label="Type" value={dType} onChange={setDType} options={DISTILL_TYPES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Teacher Params</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dTeacher} onChange={(e) => setDTeacher(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Student Params</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dStudent} onChange={(e) => setDStudent(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Temperature</label><input type="number" step="0.5" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dTemp} onChange={(e) => setDTemp(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/compression/distill", { graph_id: "di_01", distill_type: dType, teacher_params: dTeacher, student_params: dStudent, temperature: dTemp })}>{loading ? "Distilling..." : "Distill"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "teacher_student" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const comp = d.compression as Record<string, unknown>;
          const ts = d.teacher_student as Record<string, unknown>;
          const training = d.training as Record<string, unknown>;
          return (<>
            <Card title="Teacher → Student">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="border border-blue-200 dark:border-blue-800 rounded p-3 text-center"><div className="text-xs font-semibold text-blue-600 mb-1">Teacher</div><div className="text-sm font-mono">{String(comp?.teacher_params)} params</div><div className="text-xs">Acc: {String(ts?.teacher_accuracy)}</div></div>
                <div className="border border-emerald-200 dark:border-emerald-800 rounded p-3 text-center"><div className="text-xs font-semibold text-emerald-600 mb-1">Student</div><div className="text-sm font-mono">{String(comp?.student_params)} params</div><div className="text-xs">Acc: {String(ts?.student_accuracy)}</div></div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div><span className="text-gray-500">Speedup</span><div className="font-mono font-bold text-violet-600">{String(comp?.speedup)}×</div></div>
                <div><span className="text-gray-500">Fidelity</span><div className="font-mono font-bold text-blue-600">{String(ts?.fidelity)}</div></div>
                <div><span className="text-gray-500">Knowledge Ret</span><div className="font-mono font-bold text-emerald-600">{String(ts?.knowledge_retention)}</div></div>
              </div>
            </Card>
            <Card title="Training"><div className="text-xs">Epochs: {String(training?.epochs)} | Final Loss: {String(training?.final_loss)} | Convergence: {String(training?.convergence)} | Temp: {String(training?.temperature)}</div></Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderStructure = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Structural Compression">
        <SelectField label="Method" value={sMethod} onChange={setSMethod} options={STRUCTURE_METHODS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nodes</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={sNodes} onChange={(e) => setSNodes(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Edges</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={sEdges} onChange={(e) => setSEdges(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Target Ratio</label><input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={sRatio} onChange={(e) => setSRatio(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/compression/structure", { graph_id: "sc_01", method: sMethod, num_nodes: sNodes, num_edges: sEdges, target_ratio: sRatio })}>{loading ? "Compressing..." : "Compress Structure"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "properties" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const comp = d.compression as Record<string, unknown>;
          const props = d.properties as Record<string, unknown>;
          return (<>
            <Card title="Graph Compression">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-teal-600">{String(comp?.original_nodes)}→{String(comp?.compressed_nodes)}</div><div className="text-xs text-gray-500">Nodes</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(comp?.original_edges)}→{String(comp?.compressed_edges)}</div><div className="text-xs text-gray-500">Edges</div></div>
                <div className="text-center"><div className="text-lg font-bold text-red-600">{String(comp?.node_reduction)}</div><div className="text-xs text-gray-500">Node Reduction</div></div>
                <div className="text-center"><div className="text-lg font-bold text-amber-600">{String(comp?.edge_reduction)}</div><div className="text-xs text-gray-500">Edge Reduction</div></div>
              </div>
            </Card>
            <Card title="Property Preservation">
              <StatBar label="Degree" value={Number(props?.degree_preservation || 0)} color="bg-teal-500" />
              <StatBar label="Centrality" value={Number(props?.centrality_preservation || 0)} color="bg-blue-500" />
              <StatBar label="Clustering" value={Number(props?.clustering_preservation || 0)} color="bg-purple-500" />
              <StatBar label="Spectral" value={Number(props?.spectral_similarity || 0)} color="bg-amber-500" />
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderHardware = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Hardware-Aware Optimization">
        <SelectField label="Target" value={hTarget} onChange={setHTarget} options={HW_TARGETS} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Model Size (MB)</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={hSize} onChange={(e) => setHSize(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Latency (ms)</label><input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={hLatency} onChange={(e) => setHLatency(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/compression/hardware", { graph_id: "hw_01", target: hTarget, model_size_mb: hSize, latency_ms: hLatency, memory_mb: 1000, accuracy: 0.95, constraints: { max_latency: 50, max_memory: 256 } })}>{loading ? "Optimizing..." : "Optimize"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "improvements" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const results = d.results as Record<string, unknown>;
          const improvements = d.improvements as Record<string, unknown>;
          const feasibility = d.feasibility as Record<string, unknown>;
          const opts = (d.applied_optimizations || []) as Array<Record<string, unknown>>;
          return (<>
            <Card title="Before → After">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center"><div className="text-xs text-gray-500">Size</div><div className="text-sm font-mono">{String(results?.original_size_mb)} → {String(results?.optimized_size_mb)} MB</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">Latency</div><div className="text-sm font-mono">{String(results?.original_latency_ms)} → {String(results?.optimized_latency_ms)} ms</div></div>
                <div className="text-center"><div className="text-xs text-gray-500">Accuracy</div><div className="text-sm font-mono">{String(results?.original_accuracy)} → {String(results?.optimized_accuracy)}</div></div>
              </div>
            </Card>
            <Card title="Improvements">
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div><span className="text-gray-500">Size ↓</span><div className="text-sm font-mono font-bold text-cyan-600">{String(improvements?.size_reduction)}</div></div>
                <div><span className="text-gray-500">Latency ↓</span><div className="text-sm font-mono font-bold text-blue-600">{String(improvements?.latency_reduction)}</div></div>
                <div><span className="text-gray-500">Accuracy Ret</span><div className="text-sm font-mono font-bold text-emerald-600">{String(improvements?.accuracy_retention)}</div></div>
              </div>
            </Card>
            <Card title="Applied Optimizations">
              <div className="space-y-1">{opts.map((o, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1"><Badge text={String(o.technique)} color="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300" /><span>{String(o.reduction)}</span><span>Impact: {String(o.accuracy_impact)}</span></div>))}</div>
            </Card>
            <Card title="Feasibility">
              <Badge text={String(feasibility?.overall)} color={feasibility?.overall === "feasible" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"} />
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderQuality = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Quality-Assured Compression">
        <SelectField label="Guarantee" value={qaGuarantee} onChange={setQaGuarantee} options={QUALITY_GUARANTEES} />
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Original Accuracy</label><input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={qaAccuracy} onChange={(e) => setQaAccuracy(+e.target.value)} /></div>
        <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Quality Loss</label><input type="number" step="0.005" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={qaMaxLoss} onChange={(e) => setQaMaxLoss(+e.target.value)} /></div>
        <button className="w-full mt-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-50" disabled={loading} onClick={() => callApi("/compression/quality", { graph_id: "qa_01", guarantee: qaGuarantee, original_accuracy: qaAccuracy, model_params: qaParams, max_quality_loss: qaMaxLoss })}>{loading ? "Compressing..." : "Quality-First Compress"}</button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "result" in (result as Record<string, unknown>) && "compression_steps" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const res = d.result as Record<string, unknown>;
          const steps = (d.compression_steps || []) as Array<Record<string, unknown>>;
          const qm = d.quality_metrics as Record<string, unknown>;
          return (<>
            <Card title="Final Result">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center"><div className="text-lg font-bold text-emerald-600">{String(res?.final_accuracy)}</div><div className="text-xs text-gray-500">Final Accuracy</div></div>
                <div className="text-center"><div className="text-lg font-bold text-blue-600">{String(res?.accuracy_preserved)}</div><div className="text-xs text-gray-500">Preserved</div></div>
                <div className="text-center"><div className="text-lg font-bold text-purple-600">{String(res?.compression_achieved)}</div><div className="text-xs text-gray-500">Compressed</div></div>
                <div className="text-center"><Badge text={res?.guarantee_met ? "MET" : "NOT MET"} color={res?.guarantee_met ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"} /></div>
              </div>
            </Card>
            <Card title="Compression Steps">
              <div className="space-y-1">{steps.map((s, i) => (<div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5"><span>Step {String(s.step)}: {String(s.technique)}</span><span>Quality: {String(s.quality_after)}</span><span>Params: {String(s.params_after)}</span></div>))}</div>
            </Card>
            <Card title="Quality Metrics">
              <div className="text-xs space-y-1">
                <div>Max Degradation: {String(qm?.max_degradation)} | Quality Efficiency: {String(qm?.quality_efficiency)} | Pareto Optimal: {String(qm?.pareto_optimal)}</div>
              </div>
            </Card>
          </>);
        })()}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div>
      <button className="rounded bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 mb-4" disabled={loading} onClick={async () => { setLoading(true); try { const r = await fetch(`${API}/compression/summary`); setResult(await r.json()); } catch (e) { setResult({ error: String(e) }); } setLoading(false); }}>{loading ? "Loading..." : "Load Summary"}</button>
      {result && <JsonBlock data={result} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Graph Adaptive Compression Engine</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.221 — Model pruning, quantization, distillation compression, structural compression, hardware-aware optimization, and quality-assured compression</p>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (<button key={t} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === t ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`} onClick={() => { setTab(t); setResult(null); }}>{t}</button>))}
        </div>
        {tab === "Prune" && renderPrune()}
        {tab === "Quantize" && renderQuantize()}
        {tab === "Distill" && renderDistill()}
        {tab === "Structure" && renderStructure()}
        {tab === "Hardware" && renderHardware()}
        {tab === "Quality" && renderQuality()}
        {tab === "Summary" && renderSummary()}
      </div>
    </div>
  );
}
