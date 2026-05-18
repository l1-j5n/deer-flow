"use client";

import { useState } from "react";

const API = "/api/graph";

const CONTRASTIVE_METHODS = ["simclr", "moco", "byol", "simsiam", "barlow_twins", "vicreg"];
const GENERATIVE_METHODS = ["masked_ae", "vae", "diffusion", "flow", "autoregressive", "hybrid"];
const PREDICTIVE_TASKS = ["link_prediction", "attribute_prediction", "degree_prediction", "community_prediction", "centrality_prediction", "graph_property"];
const CROSS_MODAL_PRETEXTS = ["modality_inpainting", "cross_prediction", "modality_discrimination", "jigsaw", "rotation", "colorization"];
const TASK_WEIGHTINGS = ["uniform", "uncertainty", "gradnorm", "pcgrad", "dynamic", "cosine"];
const SSL_EVALUATIONS = ["linear_probe", "fine_tuning", "knn", "alignment_uniformity", "transfer", "clustering"];
const MODALITIES = ["visual", "textual", "structural", "temporal", "audio", "tabular"];
const SCALES = ["node", "edge", "graph"];

const TABS = ["Contrastive", "Generative", "Predictive", "Pretext", "MultiTask", "Evaluate", "Summary"] as const;
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
      <select
        className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Badge({ text, color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{text}</span>;
}

export default function GraphSSLMultimodalPage() {
  const [tab, setTab] = useState<Tab>("Contrastive");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Contrastive state
  const [cMethod, setCMethod] = useState("simclr");
  const [cModality, setCModality] = useState("visual");
  const [cAugmentation, setCAugmentation] = useState("random_crop");
  const [cTemperature, setCTemperature] = useState(0.07);
  const [cProjDim, setCProjDim] = useState(128);
  const [cNumNegatives, setCNumNegatives] = useState(1024);
  const [cBatchSize, setCBatchSize] = useState(256);
  const [cEpochs, setCEpochs] = useState(100);

  // Generative state
  const [gMethod, setGMethod] = useState("masked_ae");
  const [gModality, setGModality] = useState("structural");
  const [gMaskRatio, setGMaskRatio] = useState(0.15);
  const [gLatentDim, setGLatentDim] = useState(64);
  const [gEpochs, setGEpochs] = useState(50);

  // Predictive state
  const [pTask, setPTask] = useState("link_prediction");
  const [pScale, setPScale] = useState("node");
  const [pNumSamples, setPNumSamples] = useState(1000);
  const [pDifficulty, setPDifficulty] = useState(0.5);

  // Pretext state
  const [pxTask, setPxTask] = useState("modality_inpainting");
  const [pxSourceModality, setPxSourceModality] = useState("visual");
  const [pxTargetModality, setPxTargetModality] = useState("textual");
  const [pxMaskingRatio, setPxMaskingRatio] = useState(0.3);
  const [pxEpochs, setPxEpochs] = useState(80);

  // MultiTask state
  const [mtTasks, setMtTasks] = useState("link_prediction,attribute_prediction,degree_prediction");
  const [mtWeighting, setMtWeighting] = useState("uncertainty");
  const [mtEpochs, setMtEpochs] = useState(100);
  const [mtBalanceFactor, setMtBalanceFactor] = useState(0.8);

  // Evaluate state
  const [eEvaluation, setEEvaluation] = useState("linear_probe");
  const [eSSLMethod, setESSLMethod] = useState("simclr");
  const [eDownstreamTask, setEDownstreamTask] = useState("node_classification");
  const [eNumClasses, setENumClasses] = useState(10);
  const [eFineTuneEpochs, setEFineTuneEpochs] = useState(50);

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: String(err) });
    }
    setLoading(false);
  };

  const renderContrastive = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Contrastive Parameters">
        <SelectField label="Method" value={cMethod} onChange={setCMethod} options={CONTRASTIVE_METHODS} />
        <SelectField label="Modality" value={cModality} onChange={setCModality} options={MODALITIES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Augmentation</label>
          <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cAugmentation} onChange={(e) => setCAugmentation(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Temperature</label>
          <input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cTemperature} onChange={(e) => setCTemperature(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Projection Dim</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cProjDim} onChange={(e) => setCProjDim(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Negatives</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cNumNegatives} onChange={(e) => setCNumNegatives(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Batch Size</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cBatchSize} onChange={(e) => setCBatchSize(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Epochs</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={cEpochs} onChange={(e) => setCEpochs(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/ssl-multimodal/contrastive", {
            graph_id: "default",
            method: cMethod,
            modality: cModality,
            augmentation: cAugmentation,
            temperature: cTemperature,
            projection_dim: cProjDim,
            num_negatives: cNumNegatives,
            batch_size: cBatchSize,
            epochs: cEpochs,
          })}
        >
          {loading ? "Training..." : "Run Contrastive SSL"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "method_config" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const cfg = d.config as Record<string, unknown>;
          const mc = d.method_config as Record<string, unknown>;
          const training = d.training as Record<string, unknown>;
          const quality = d.quality as Record<string, number>;
          const reps = d.representations as Record<string, Record<string, number>>;
          return (
            <>
              <Card title="Contrastive Results">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{String(d.method)}</div>
                    <div className="text-xs text-gray-500">Method</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{String(training?.final_loss ?? "-")}</div>
                    <div className="text-xs text-gray-500">Final Loss</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{String(training?.convergence_epoch ?? "-")}</div>
                    <div className="text-xs text-gray-500">Convergence Epoch</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <Badge text={String(d.modality)} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
                  <Badge text={String(d.augmentation)} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                  <Badge text={`Negatives: ${mc?.requires_neg ? "Yes" : "No"}`} color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />
                  <Badge text={`Stop Grad: ${mc?.stop_grad ? "Yes" : "No"}`} color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
                </div>
              </Card>
              <Card title="Quality Metrics">
                <StatBar label="Alignment" value={quality?.alignment ?? 0} color="bg-emerald-500" />
                <StatBar label="Uniformity" value={quality?.uniformity ?? 0} color="bg-blue-500" />
                <StatBar label="Positive Similarity" value={quality?.pos_similarity ?? 0} color="bg-purple-500" />
                <StatBar label="Negative Similarity" value={quality?.neg_similarity ?? 0} color="bg-amber-500" />
                <StatBar label="Separation" value={quality?.separation ?? 0} color="bg-teal-500" />
                <StatBar label="Augmentation Quality" value={quality?.augmentation_quality ?? 0} color="bg-cyan-500" />
              </Card>
              <Card title="Modality Representations">
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(reps ?? {}).map(([mod, info]) => (
                    <div key={mod} className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{mod}</div>
                      <div className="text-xs text-gray-500">dim={info?.dim ?? "-"}</div>
                      <div className="text-xs font-mono">norm={info?.norm_mean?.toFixed(3) ?? "-"} &plusmn; {info?.norm_std?.toFixed(3) ?? "-"}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderGenerative = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Generative Parameters">
        <SelectField label="Method" value={gMethod} onChange={setGMethod} options={GENERATIVE_METHODS} />
        <SelectField label="Modality" value={gModality} onChange={setGModality} options={MODALITIES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Mask Ratio</label>
          <input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={gMaskRatio} onChange={(e) => setGMaskRatio(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Latent Dim</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={gLatentDim} onChange={(e) => setGLatentDim(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Epochs</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={gEpochs} onChange={(e) => setGEpochs(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/ssl-multimodal/generative", {
            graph_id: "default",
            method: gMethod,
            modality: gModality,
            mask_ratio: gMaskRatio,
            latent_dim: gLatentDim,
            epochs: gEpochs,
          })}
        >
          {loading ? "Training..." : "Run Generative SSL"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "method_info" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const mi = d.method_info as Record<string, unknown>;
          const training = d.training as Record<string, unknown>;
          const la = d.latent_analysis as Record<string, number>;
          const mr = d.modality_reconstruction as Record<string, number>;
          const fid = d.fidelity as Record<string, number>;
          return (
            <>
              <Card title="Generative Results">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{String(d.method)}</div>
                    <div className="text-xs text-gray-500">Method</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{String(training?.final_reconstruction ?? "-")}</div>
                    <div className="text-xs text-gray-500">Final Reconstruction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{String(training?.convergence_epoch ?? "-")}</div>
                    <div className="text-xs text-gray-500">Convergence Epoch</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <Badge text={String(mi?.reconstruction_type ?? "-")} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                  <Badge text={`Metric: ${mi?.primary_metric ?? "-"}`} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
                  <Badge text={`Mask: ${d.mask_ratio}`} color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
                </div>
              </Card>
              <Card title="Latent Analysis">
                <StatBar label="KL Divergence" value={la?.kl_divergence ?? 0} color="bg-blue-500" />
                <StatBar label="Log Likelihood" value={(la?.log_likelihood ?? 0) + 5} max={10} color="bg-emerald-500" />
                <StatBar label="Mutual Info" value={la?.mutual_info ?? 0} color="bg-purple-500" />
                <StatBar label="Disentanglement" value={la?.disentanglement_score ?? 0} color="bg-amber-500" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Latent dim: {la?.dim ?? "-"} | Effective dim: {la?.effective_dim ?? "-"}
                </div>
              </Card>
              <Card title="Modality Reconstruction & Fidelity">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {Object.entries(mr).map(([mod, score]) => (
                    <div key={mod} className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                      <div className="text-xs text-gray-500">{mod}</div>
                      <div className="text-lg font-bold text-blue-600">{(score as number).toFixed(4)}</div>
                    </div>
                  ))}
                </div>
                <StatBar label="Overall Fidelity" value={fid?.overall_fidelity ?? 0} color="bg-blue-500" />
                <StatBar label="Structural Preservation" value={fid?.structural_preservation ?? 0} color="bg-emerald-500" />
                <StatBar label="Semantic Preservation" value={fid?.semantic_preservation ?? 0} color="bg-purple-500" />
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderPredictive = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Predictive Parameters">
        <SelectField label="Task" value={pTask} onChange={setPTask} options={PREDICTIVE_TASKS} />
        <SelectField label="Scale" value={pScale} onChange={setPScale} options={SCALES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Samples</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={pNumSamples} onChange={(e) => setPNumSamples(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Difficulty Threshold</label>
          <input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={pDifficulty} onChange={(e) => setPDifficulty(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/ssl-multimodal/predictive", {
            graph_id: "default",
            task: pTask,
            scale: pScale,
            num_samples: pNumSamples,
            difficulty_threshold: pDifficulty,
          })}
        >
          {loading ? "Predicting..." : "Run Predictive SSL"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "task_info" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const ti = d.task_info as Record<string, unknown>;
          const results = d.results as Record<string, unknown>;
          const ci = results?.confidence_interval as number[];
          const analysis = d.analysis as Record<string, unknown>;
          return (
            <>
              <Card title="Predictive Results">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{String(results?.score ?? "-")}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{String(results?.improvement ?? "-")}</div>
                    <div className="text-xs text-gray-500">Improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-mono text-blue-600">[{ci?.[0]?.toFixed(4) ?? "-"}, {ci?.[1]?.toFixed(4) ?? "-"}]</div>
                    <div className="text-xs text-gray-500">Confidence Interval</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <Badge text={`Level: ${ti?.level ?? "-"}`} color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />
                  <Badge text={`Metric: ${ti?.metric ?? "-"}`} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
                  <Badge text={`Baseline: ${ti?.baseline ?? "-"}`} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                </div>
              </Card>
              <Card title="Difficulty Analysis">
                <div className="grid grid-cols-4 gap-3 text-center mb-3">
                  <div>
                    <span className="text-xs text-gray-500">Easy</span>
                    <div className="text-sm font-mono font-bold text-emerald-600">{String(analysis?.easy_samples ?? "-")}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Medium</span>
                    <div className="text-sm font-mono font-bold text-amber-600">{String(analysis?.medium_samples ?? "-")}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Hard</span>
                    <div className="text-sm font-mono font-bold text-red-600">{String(analysis?.hard_samples ?? "-")}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Transfer</span>
                    <div className="text-sm font-mono font-bold text-blue-600">{String(analysis?.transfer_score ?? "-")}</div>
                  </div>
                </div>
                <StatBar label="Difficulty" value={results?.difficulty as number ?? 0} color="bg-purple-500" />
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderPretext = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Pretext Parameters">
        <SelectField label="Pretext Task" value={pxTask} onChange={setPxTask} options={CROSS_MODAL_PRETEXTS} />
        <SelectField label="Source Modality" value={pxSourceModality} onChange={setPxSourceModality} options={MODALITIES} />
        <SelectField label="Target Modality" value={pxTargetModality} onChange={setPxTargetModality} options={MODALITIES.filter((m) => m !== pxSourceModality)} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Masking Ratio</label>
          <input type="number" step="0.01" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={pxMaskingRatio} onChange={(e) => setPxMaskingRatio(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Epochs</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={pxEpochs} onChange={(e) => setPxEpochs(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/ssl-multimodal/pretext", {
            graph_id: "default",
            pretext_task: pxTask,
            source_modality: pxSourceModality,
            target_modality: pxTargetModality,
            masking_ratio: pxMaskingRatio,
            epochs: pxEpochs,
          })}
        >
          {loading ? "Training..." : "Run Cross-Modal Pretext"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "pretext_info" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const pi = d.pretext_info as Record<string, unknown>;
          const training = d.training as Record<string, unknown>;
          const cmt = d.cross_modal_transfer as Record<string, number>;
          const ps = d.pretext_specific as Record<string, number>;
          const lf = d.learned_features as Record<string, unknown>;
          return (
            <>
              <Card title="Pretext Results">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{String(training?.final_loss ?? "-")}</div>
                    <div className="text-xs text-gray-500">Final Loss</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{String(training?.convergence_epoch ?? "-")}</div>
                    <div className="text-xs text-gray-500">Convergence Epoch</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{String(cmt?.accuracy ?? "-")}</div>
                    <div className="text-xs text-gray-500">Cross-Modal Accuracy</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <Badge text={String(d.pretext_task)} color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
                  <Badge text={`${String(d.source_modality)} -> ${String(d.target_modality)}`} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                  <Badge text={`Loss: ${pi?.loss_type ?? "-"}`} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
                </div>
              </Card>
              <Card title="Cross-Modal Transfer">
                <StatBar label="Source Modality Quality" value={cmt?.source_modality_representation_quality ?? 0} color="bg-amber-500" />
                <StatBar label="Target Modality Quality" value={cmt?.target_modality_representation_quality ?? 0} color="bg-blue-500" />
                <StatBar label="Alignment Score" value={cmt?.alignment_score ?? 0} color="bg-emerald-500" />
              </Card>
              <Card title="Pretext-Specific Metrics">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-xs text-gray-500">Inpainting PSNR</span>
                    <div className="text-sm font-mono font-bold text-amber-600">{ps?.inpainting_psnr?.toFixed(3) ?? "-"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Discrimination Acc</span>
                    <div className="text-sm font-mono font-bold text-blue-600">{ps?.discrimination_acc?.toFixed(3) ?? "-"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Jigsaw Accuracy</span>
                    <div className="text-sm font-mono font-bold text-purple-600">{ps?.jigsaw_accuracy?.toFixed(3) ?? "-"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Rotation Acc</span>
                    <div className="text-sm font-mono font-bold text-emerald-600">{ps?.rotation_acc?.toFixed(3) ?? "-"}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  Shared dimensions: {String(lf?.shared_dimensions ?? "-")} | Modality-specific dims: {String(lf?.modality_specific_dims ?? "-")}
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderMultiTask = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Multi-Task Parameters">
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tasks (comma-separated)</label>
          <textarea className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5 h-20 font-mono" value={mtTasks} onChange={(e) => setMtTasks(e.target.value)} />
        </div>
        <SelectField label="Weighting Strategy" value={mtWeighting} onChange={setMtWeighting} options={TASK_WEIGHTINGS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Epochs</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={mtEpochs} onChange={(e) => setMtEpochs(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Balance Factor</label>
          <input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={mtBalanceFactor} onChange={(e) => setMtBalanceFactor(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/ssl-multimodal/multi-task", {
            graph_id: "default",
            tasks: mtTasks.split(",").map((t) => t.trim()),
            weighting: mtWeighting,
            num_epochs: mtEpochs,
            balance_factor: mtBalanceFactor,
          })}
        >
          {loading ? "Training..." : "Run Multi-Task SSL"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "weighting_info" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const wi = d.weighting_info as Record<string, unknown>;
          const tw = d.task_weights as Record<string, number>;
          const tl = d.task_losses as Record<string, Record<string, number>>;
          const training = d.training as Record<string, unknown>;
          const synergy = d.synergy as Record<string, unknown>;
          const rq = d.representation_quality as Record<string, number>;
          return (
            <>
              <Card title="Multi-Task Results">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-600">{String(d.num_tasks ?? "-")}</div>
                    <div className="text-xs text-gray-500">Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">{String(training?.convergence_epoch ?? "-")}</div>
                    <div className="text-xs text-gray-500">Convergence</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{String(training?.conflict_resolution_rate ?? "-")}</div>
                    <div className="text-xs text-gray-500">Conflict Resolution</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <Badge text={`Weighting: ${String(d.weighting)}`} color="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300" />
                  <Badge text={wi?.adaptive ? "Adaptive" : "Static"} color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" />
                  <Badge text={`Conflicts: ${training?.gradient_conflicts ?? "-"}`} color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" />
                </div>
              </Card>
              <Card title="Task Weights & Losses">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(tw).map(([task, weight]) => {
                    const losses = tl[task] as Record<string, number> | undefined;
                    return (
                      <div key={task} className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <div className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">{task}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          weight: <span className="font-mono">{(weight as number).toFixed(4)}</span>
                          {losses && (
                            <> | loss: <span className="font-mono">{(losses.initial ?? 0).toFixed(3)} -> {(losses.final ?? 0).toFixed(3)}</span></>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card title="Synergy & Representation Quality">
                <StatBar label="Pareto Improvement" value={synergy?.pareto_improvement as number ?? 0} color="bg-teal-500" />
                <StatBar label="Knowledge Transfer Score" value={synergy?.knowledge_transfer_score as number ?? 0} color="bg-emerald-500" />
                <StatBar label="Joint Alignment" value={rq?.joint_alignment ?? 0} color="bg-blue-500" />
                <StatBar label="Joint Uniformity" value={rq?.joint_uniformity ?? 0} color="bg-purple-500" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Effective dimension: {rq?.effective_dimension ?? "-"}
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderEvaluate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Evaluation Parameters">
        <SelectField label="Evaluation Type" value={eEvaluation} onChange={setEEvaluation} options={SSL_EVALUATIONS} />
        <SelectField label="SSL Method" value={eSSLMethod} onChange={setESSLMethod} options={CONTRASTIVE_METHODS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Downstream Task</label>
          <input type="text" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={eDownstreamTask} onChange={(e) => setEDownstreamTask(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Classes</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={eNumClasses} onChange={(e) => setENumClasses(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Fine-Tune Epochs</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={eFineTuneEpochs} onChange={(e) => setEFineTuneEpochs(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/ssl-multimodal/evaluate", {
            graph_id: "default",
            evaluation: eEvaluation,
            ssl_method: eSSLMethod,
            downstream_task: eDownstreamTask,
            num_classes: eNumClasses,
            fine_tune_epochs: eFineTuneEpochs,
          })}
        >
          {loading ? "Evaluating..." : "Run Evaluation"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "eval_info" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const ei = d.eval_info as Record<string, unknown>;
          const results = d.results as Record<string, number>;
          const ra = d.representation_analysis as Record<string, number>;
          const ft = d.fine_tuning as Record<string, unknown>;
          const cmp = d.comparison as Record<string, number>;
          return (
            <>
              <Card title="Evaluation Results">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600">{String(results?.performance ?? "-")}</div>
                    <div className="text-xs text-gray-500">Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">+{String(results?.relative_improvement ?? "-")}%</div>
                    <div className="text-xs text-gray-500">Relative Improvement</div>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <Badge text={String(d.evaluation)} color="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300" />
                  <Badge text={`SSL: ${d.ssl_method}`} color="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" />
                  <Badge text={`Params: ${ei?.trainable_params ?? "-"}`} color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" />
                </div>
              </Card>
              <Card title="Representation Analysis">
                <StatBar label="Effective Rank" value={ra?.effective_rank ?? 0} max={200} color="bg-cyan-500" />
                <StatBar label="Condition Number (inv)" value={1 / (ra?.condition_number ?? 1)} color="bg-blue-500" />
                <StatBar label="Intrinsic Dimension" value={ra?.intrinsic_dimension ?? 0} max={200} color="bg-purple-500" />
                <StatBar label="Cluster Separation" value={ra?.cluster_separation ?? 0} color="bg-emerald-500" />
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Class balance: {ra?.class_balance?.toFixed(4) ?? "-"}
                </div>
              </Card>
              <Card title="Comparison & Fine-Tuning">
                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                  <div>
                    <span className="text-xs text-gray-500">Supervised Only</span>
                    <div className="text-sm font-mono font-bold text-gray-600">{cmp?.supervised_only?.toFixed(4) ?? "-"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">SSL Frozen</span>
                    <div className="text-sm font-mono font-bold text-blue-600">{cmp?.ssl_frozen?.toFixed(4) ?? "-"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">SSL Fine-tuned</span>
                    <div className="text-sm font-mono font-bold text-emerald-600">{cmp?.ssl_finetuned?.toFixed(4) ?? "-"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">SSL Advantage</span>
                    <div className="text-sm font-mono font-bold text-cyan-600">{cmp?.ssl_advantage?.toFixed(4) ?? "-"}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Best epoch: {String(ft?.best_epoch ?? "-")} | Overfitting gap: {String(ft?.overfitting_gap ?? "-")} | Total epochs: {String(ft?.epochs ?? "-")}
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-4">
      <Card title="Graph Self-Supervised Multimodal Learning Engine v1.215">
        <button
          className="rounded bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 mb-4"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            fetch(`${API}/ssl-multimodal/summary`)
              .then((r) => r.json())
              .then((d) => { setResult(d); setLoading(false); })
              .catch((e) => { setResult({ error: String(e) }); setLoading(false); });
          }}
        >
          {loading ? "Loading..." : "Load Summary"}
        </button>
        {result && <JsonBlock data={result} />}
      </Card>
      <Card title="Engine Architecture">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-3">
            <div className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Contrastive & Generative SSL</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>6 contrastive methods (SimCLR/MoCo/BYOL/SimSiam/Barlow Twins/VICReg)</div>
              <div>6 generative methods (MaskedAE/VAE/Diffusion/Flow/Autoregressive/Hybrid)</div>
              <div>Alignment, uniformity & separation quality metrics</div>
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-3">
            <div className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Predictive & Pretext</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>6 predictive tasks (Link/Attr/Degree/Community/Centrality/Graph)</div>
              <div>6 cross-modal pretext tasks (Inpainting/CrossPred/Discrim/Jigsaw/Rotation/Color)</div>
              <div>3 scales (Node/Edge/Graph) with difficulty analysis</div>
            </div>
          </div>
          <div className="bg-teal-50 dark:bg-teal-900/20 rounded p-3">
            <div className="font-semibold text-teal-700 dark:text-teal-300 mb-2">Multi-Task & Evaluation</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>6 task weighting strategies (Uniform/Uncertainty/GradNorm/PCGrad/Dynamic/Cosine)</div>
              <div>6 evaluation protocols (LinearProbe/FineTune/KNN/Alignment/Transfer/Clustering)</div>
              <div>6 modalities (Visual/Textual/Structural/Temporal/Audio/Tabular)</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const tabRenderers: Record<Tab, () => JSX.Element> = {
    Contrastive: renderContrastive,
    Generative: renderGenerative,
    Predictive: renderPredictive,
    Pretext: renderPretext,
    MultiTask: renderMultiTask,
    Evaluate: renderEvaluate,
    Summary: renderSummary,
  };

  const tabColors: Record<Tab, string> = {
    Contrastive: "bg-emerald-500",
    Generative: "bg-blue-500",
    Predictive: "bg-purple-500",
    Pretext: "bg-amber-500",
    MultiTask: "bg-teal-500",
    Evaluate: "bg-cyan-500",
    Summary: "bg-gray-500",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Graph Self-Supervised Multimodal Learning Engine</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.215 — Contrastive, generative &amp; predictive SSL across 6 modalities with cross-modal pretext tasks</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? `${tabColors[t]} text-white border-transparent rounded-t`
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-transparent"
            }`}
            onClick={() => { setTab(t); setResult(null); }}
          >
            {t}
          </button>
        ))}
      </div>

      {tabRenderers[tab]()}
    </div>
  );
}
