"use client";

import { useState } from "react";

/* ── colour palette ── */
const C = {
  bg: "#0f172a",
  card: "#1e293b",
  border: "#334155",
  accent: "#8b5cf6",
  accent2: "#06b6d4",
  accent3: "#f59e0b",
  accent4: "#10b981",
  accent5: "#ef4444",
  accent6: "#ec4899",
  text: "#e2e8f0",
  dim: "#94a3b8",
  muted: "#64748b",
};

/* ── tabs ── */
const TABS = [
  "Contrastive",
  "Generative",
  "Predictive",
  "Pretext",
  "Multi-Task",
  "Evaluate",
  "Summary",
] as const;
type Tab = (typeof TABS)[number];

/* ── option sets ── */
const CONTRASTIVE_METHODS = [
  "simclr",
  "moco",
  "byol",
  "simsiam",
  "barlow_twins",
  "vicreg",
];
const GENERATIVE_METHODS = [
  "masked_ae",
  "vae",
  "diffusion",
  "flow",
  "autoregressive",
  "hybrid",
];
const PREDICTIVE_TASKS = [
  "link_prediction",
  "attribute_prediction",
  "degree_prediction",
  "community_prediction",
  "centrality_prediction",
  "graph_property",
];
const PRETEXT_TASKS = [
  "modality_inpainting",
  "cross_prediction",
  "modality_discrimination",
  "jigsaw",
  "rotation",
  "colorization",
];
const TASK_WEIGHTINGS = [
  "uniform",
  "uncertainty",
  "gradnorm",
  "pcgrad",
  "dynamic",
  "cosine",
];
const EVAL_PROTOCOLS = [
  "linear_probe",
  "fine_tuning",
  "knn",
  "alignment_uniformity",
  "transfer",
  "clustering",
];
const MODALITIES = [
  "visual",
  "textual",
  "structural",
  "temporal",
  "audio",
  "tabular",
];
const AUGMENTATIONS = [
  "dropout",
  "masking",
  "perturbation",
  "cropping",
  "mixing",
  "noise",
];

/* ── helpers ── */
const api = (path: string) =>
  `${window.location.origin}/api/knowledge-graph${path}`;

async function postJSON(path: string, body: Record<string, unknown>) {
  const res = await fetch(api(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

/* ── stat bar ── */
function StatBar({
  label,
  value,
  max = 1,
  color = C.accent,
}: {
  label: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: C.dim,
          marginBottom: 2,
        }}
      >
        <span>{label}</span>
        <span>{typeof value === "number" ? value.toFixed(3) : value}</span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 3,
          background: C.border,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

/* ── select ── */
function Sel({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: C.card,
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: "6px 10px",
        fontSize: 13,
        width: "100%",
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

/* ── number input ── */
function Num({
  value,
  onChange,
  min,
  max,
  step,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}) {
  return (
    <div>
      <label style={{ fontSize: 12, color: C.dim, display: "block", marginBottom: 2 }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: C.card,
          color: C.text,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: 13,
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

/* ── badge ── */
function Badge({ children, color = C.accent }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: `${color}22`,
        color,
        border: `1px solid ${color}44`,
        borderRadius: 12,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
        marginRight: 6,
      }}
    >
      {children}
    </span>
  );
}

/* ── section card ── */
function Card({
  title,
  children,
  color = C.accent,
}: {
  title: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <h3 style={{ fontSize: 14, color, margin: "0 0 12px 0", fontWeight: 700 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */
export default function GraphSSLMultimodalPage() {
  const [tab, setTab] = useState<Tab>("Contrastive");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  /* contrastive state */
  const [cMethod, setCMethod] = useState("simclr");
  const [cModality, setCModality] = useState("visual");
  const [cAug, setCAug] = useState("masking");
  const [cTemp, setCTemp] = useState(0.07);
  const [cProjDim, setCProjDim] = useState(128);
  const [cNeg, setCNeg] = useState(1024);
  const [cEpochs, setCEpochs] = useState(100);

  /* generative state */
  const [gMethod, setGMethod] = useState("masked_ae");
  const [gModality, setGModality] = useState("visual");
  const [gMask, setGMask] = useState(0.75);
  const [gLatent, setGLatent] = useState(256);
  const [gEpochs, setGEpochs] = useState(200);

  /* predictive state */
  const [pTask, setPTask] = useState("link_prediction");
  const [pScale, setPScale] = useState("node");
  const [pSamples, setPSamples] = useState(10000);

  /* pretext state */
  const [pxTask, setPxTask] = useState("modality_inpainting");
  const [pxSource, setPxSource] = useState("visual");
  const [pxTarget, setPxTarget] = useState("textual");
  const [pxMask, setPxMask] = useState(0.5);
  const [pxEpochs, setPxEpochs] = useState(100);

  /* multitask state */
  const [mtTasks, setMtTasks] = useState("contrastive,generative,predictive");
  const [mtWeight, setMtWeight] = useState("uncertainty");
  const [mtEpochs, setMtEpochs] = useState(150);

  /* evaluate state */
  const [evProto, setEvProto] = useState("linear_probe");
  const [evMethod, setEvMethod] = useState("simclr");
  const [evTask, setEvTask] = useState("node_classification");
  const [evClasses, setEvClasses] = useState(10);

  /* run handler */
  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res: Record<string, unknown>;
      switch (tab) {
        case "Contrastive":
          res = await postJSON("/ssl-multimodal/contrastive", {
            method: cMethod,
            modality: cModality,
            augmentation: cAug,
            temperature: cTemp,
            projection_dim: cProjDim,
            num_negatives: cNeg,
            epochs: cEpochs,
          });
          break;
        case "Generative":
          res = await postJSON("/ssl-multimodal/generative", {
            method: gMethod,
            modality: gModality,
            mask_ratio: gMask,
            latent_dim: gLatent,
            epochs: gEpochs,
          });
          break;
        case "Predictive":
          res = await postJSON("/ssl-multimodal/predictive", {
            task: pTask,
            scale: pScale,
            num_samples: pSamples,
          });
          break;
        case "Pretext":
          res = await postJSON("/ssl-multimodal/pretext", {
            pretext_task: pxTask,
            source_modality: pxSource,
            target_modality: pxTarget,
            masking_ratio: pxMask,
            epochs: pxEpochs,
          });
          break;
        case "Multi-Task":
          res = await postJSON("/ssl-multimodal/multi-task", {
            tasks: mtTasks.split(",").map((s) => s.trim()),
            weighting: mtWeight,
            num_epochs: mtEpochs,
          });
          break;
        case "Evaluate":
          res = await postJSON("/ssl-multimodal/evaluate", {
            evaluation: evProto,
            ssl_method: evMethod,
            downstream_task: evTask,
            num_classes: evClasses,
          });
          break;
        case "Summary":
          res = await (await fetch(api("/ssl-multimodal/summary"))).json();
          break;
        default:
          res = {};
      }
      setResult(res);
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  /* ── render config panel per tab ── */
  const configPanel = () => {
    switch (tab) {
      case "Contrastive":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={{ fontSize: 12, color: C.dim }}>Method</label><Sel value={cMethod} onChange={setCMethod} options={CONTRASTIVE_METHODS} /></div>
            <div><label style={{ fontSize: 12, color: C.dim }}>Modality</label><Sel value={cModality} onChange={setCModality} options={MODALITIES} /></div>
            <div><label style={{ fontSize: 12, color: C.dim }}>Augmentation</label><Sel value={cAug} onChange={setCAug} options={AUGMENTATIONS} /></div>
            <Num label="Temperature" value={cTemp} onChange={setCTemp} min={0.01} max={1} step={0.01} />
            <Num label="Projection Dim" value={cProjDim} onChange={setCProjDim} min={16} max={1024} step={16} />
            <Num label="Num Negatives" value={cNeg} onChange={setCNeg} min={0} max={65536} step={256} />
            <Num label="Epochs" value={cEpochs} onChange={setCEpochs} min={1} max={1000} step={10} />
          </div>
        );
      case "Generative":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={{ fontSize: 12, color: C.dim }}>Method</label><Sel value={gMethod} onChange={setGMethod} options={GENERATIVE_METHODS} /></div>
            <div><label style={{ fontSize: 12, color: C.dim }}>Modality</label><Sel value={gModality} onChange={setGModality} options={MODALITIES} /></div>
            <Num label="Mask Ratio" value={gMask} onChange={setGMask} min={0} max={0.95} step={0.05} />
            <Num label="Latent Dim" value={gLatent} onChange={setGLatent} min={16} max={1024} step={16} />
            <Num label="Epochs" value={gEpochs} onChange={setGEpochs} min={1} max={1000} step={10} />
          </div>
        );
      case "Predictive":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={{ fontSize: 12, color: C.dim }}>Task</label><Sel value={pTask} onChange={setPTask} options={PREDICTIVE_TASKS} /></div>
            <div><label style={{ fontSize: 12, color: C.dim }}>Scale</label><Sel value={pScale} onChange={setPScale} options={["node", "edge", "subgraph", "graph"]} /></div>
            <Num label="Num Samples" value={pSamples} onChange={setPSamples} min={100} max={1000000} step={1000} />
          </div>
        );
      case "Pretext":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={{ fontSize: 12, color: C.dim }}>Pretext Task</label><Sel value={pxTask} onChange={setPxTask} options={PRETEXT_TASKS} /></div>
            <div><label style={{ fontSize: 12, color: C.dim }}>Source Modality</label><Sel value={pxSource} onChange={setPxSource} options={MODALITIES} /></div>
            <div><label style={{ fontSize: 12, color: C.dim }}>Target Modality</label><Sel value={pxTarget} onChange={setPxTarget} options={MODALITIES} /></div>
            <Num label="Masking Ratio" value={pxMask} onChange={setPxMask} min={0} max={0.95} step={0.05} />
            <Num label="Epochs" value={pxEpochs} onChange={setPxEpochs} min={1} max={1000} step={10} />
          </div>
        );
      case "Multi-Task":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: C.dim }}>Tasks (comma-separated)</label>
              <input
                value={mtTasks}
                onChange={(e) => setMtTasks(e.target.value)}
                style={{
                  background: C.card,
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 13,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div><label style={{ fontSize: 12, color: C.dim }}>Weighting</label><Sel value={mtWeight} onChange={setMtWeight} options={TASK_WEIGHTINGS} /></div>
            <Num label="Epochs" value={mtEpochs} onChange={setMtEpochs} min={1} max={1000} step={10} />
          </div>
        );
      case "Evaluate":
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={{ fontSize: 12, color: C.dim }}>Protocol</label><Sel value={evProto} onChange={setEvProto} options={EVAL_PROTOCOLS} /></div>
            <div><label style={{ fontSize: 12, color: C.dim }}>SSL Method</label><Sel value={evMethod} onChange={setEvMethod} options={CONTRASTIVE_METHODS} /></div>
            <div>
              <label style={{ fontSize: 12, color: C.dim }}>Downstream Task</label>
              <input
                value={evTask}
                onChange={(e) => setEvTask(e.target.value)}
                style={{
                  background: C.card,
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: 13,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <Num label="Num Classes" value={evClasses} onChange={setEvClasses} min={2} max={1000} step={1} />
          </div>
        );
      default:
        return null;
    }
  };

  /* ── render result per tab ── */
  const resultPanel = () => {
    if (!result) return null;
    if (result.error) {
      return (
        <Card title="Error" color={C.accent5}>
          <pre style={{ color: C.accent5, fontSize: 12, whiteSpace: "pre-wrap" }}>{String(result.error)}</pre>
        </Card>
      );
    }

    if (tab === "Summary") {
      const enums = result.enums as Record<string, string[]> | undefined;
      const caches = result.caches as Record<string, number> | undefined;
      const integ = result.integration as Record<string, string> | undefined;
      return (
        <>
          <Card title="Engine Info" color={C.accent}>
            <Badge color={C.accent}>{String(result.version)}</Badge>
            <Badge color={C.accent2}>{String(result.engine)}</Badge>
            <div style={{ marginTop: 10, fontSize: 12, color: C.dim }}>
              {(result.modules as string[])?.map((m) => (
                <Badge key={m} color={C.accent2}>{m}</Badge>
              ))}
            </div>
          </Card>
          {enums && (
            <Card title="Enums" color={C.accent2}>
              {Object.entries(enums).map(([k, vs]) => (
                <div key={k} style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{k}: </span>
                  <span style={{ fontSize: 11, color: C.dim }}>{vs.join(", ")}</span>
                </div>
              ))}
            </Card>
          )}
          {caches && (
            <Card title="Cache Status" color={C.accent4}>
              {Object.entries(caches).map(([k, v]) => (
                <StatBar key={k} label={k} value={v} max={50} color={C.accent4} />
              ))}
            </Card>
          )}
          {integ && (
            <Card title="Integration" color={C.accent3}>
              {Object.entries(integ).map(([k, v]) => (
                <div key={k} style={{ fontSize: 12, color: C.dim, marginBottom: 2 }}>
                  <span style={{ color: C.text }}>{k}</span>: {v}
                </div>
              ))}
            </Card>
          )}
        </>
      );
    }

    if (tab === "Contrastive") {
      const training = result.training as Record<string, unknown>;
      const quality = result.quality as Record<string, number>;
      const mcfg = result.method_config as Record<string, unknown>;
      return (
        <>
          <Card title="Method Config" color={C.accent}>
            <Badge color={C.accent}>{String(result.method)}</Badge>
            <Badge color={C.accent2}>{String(result.modality)}</Badge>
            <Badge color={C.accent3}>{String(result.augmentation)}</Badge>
            <div style={{ marginTop: 8, fontSize: 12, color: C.dim }}>
              requires_neg: {String(mcfg?.requires_neg)} | symmetric: {String(mcfg?.symmetric)} | stop_grad: {String(mcfg?.stop_grad)}
            </div>
          </Card>
          <Card title="Training" color={C.accent2}>
            <StatBar label="Initial Loss" value={Number(training?.initial_loss)} max={3} color={C.accent5} />
            <StatBar label="Final Loss" value={Number(training?.final_loss)} max={3} color={C.accent4} />
            <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>
              Convergence: epoch {String(training?.convergence_epoch)} / {String(training?.total_epochs)} | Pairs: +{String(result.positive_pairs)} / -{String(result.negative_pairs)}
            </div>
          </Card>
          <Card title="Representation Quality" color={C.accent4}>
            <StatBar label="Alignment" value={quality?.alignment ?? 0} color={C.accent} />
            <StatBar label="Uniformity" value={quality?.uniformity ?? 0} color={C.accent2} />
            <StatBar label="Pos Similarity" value={quality?.pos_similarity ?? 0} color={C.accent4} />
            <StatBar label="Neg Similarity" value={quality?.neg_similarity ?? 0} color={C.accent3} />
            <StatBar label="Separation" value={quality?.separation ?? 0} color={C.accent6} />
            <StatBar label="Aug Quality" value={quality?.augmentation_quality ?? 0} color={C.accent4} />
          </Card>
        </>
      );
    }

    if (tab === "Generative") {
      const training = result.training as Record<string, unknown>;
      const latent = result.latent_analysis as Record<string, unknown>;
      const fidelity = result.fidelity as Record<string, number>;
      const modRecon = result.modality_reconstruction as Record<string, number>;
      return (
        <>
          <Card title="Generative Method" color={C.accent}>
            <Badge color={C.accent}>{String(result.method)}</Badge>
            <Badge color={C.accent2}>{String(result.modality)}</Badge>
            <div style={{ marginTop: 6, fontSize: 12, color: C.dim }}>Mask Ratio: {String(result.mask_ratio)}</div>
          </Card>
          <Card title="Training" color={C.accent2}>
            <StatBar label="Initial Reconstruction" value={Number(training?.initial_reconstruction)} color={C.accent3} />
            <StatBar label="Final Reconstruction" value={Number(training?.final_reconstruction)} color={C.accent4} />
            <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Convergence: epoch {String(training?.convergence_epoch)}</div>
          </Card>
          <Card title="Latent Analysis" color={C.accent3}>
            <StatBar label="Mutual Info" value={Number(latent?.mutual_info)} color={C.accent} />
            <StatBar label="Disentanglement" value={Number(latent?.disentanglement_score)} color={C.accent2} />
            <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Dim: {String(latent?.dim)} | Effective: {String(latent?.effective_dim)}</div>
            {latent?.kl_divergence != null && <div style={{ fontSize: 12, color: C.dim }}>KL Divergence: {String(latent.kl_divergence)}</div>}
            {latent?.log_likelihood != null && <div style={{ fontSize: 12, color: C.dim }}>Log Likelihood: {String(latent.log_likelihood)}</div>}
          </Card>
          <Card title="Modality Reconstruction" color={C.accent4}>
            {modRecon && Object.entries(modRecon).map(([k, v]) => (
              <StatBar key={k} label={k} value={v} color={C.accent4} />
            ))}
          </Card>
          <Card title="Fidelity" color={C.accent6}>
            <StatBar label="Overall" value={fidelity?.overall_fidelity ?? 0} color={C.accent4} />
            <StatBar label="Structural" value={fidelity?.structural_preservation ?? 0} color={C.accent2} />
            <StatBar label="Semantic" value={fidelity?.semantic_preservation ?? 0} color={C.accent3} />
          </Card>
        </>
      );
    }

    if (tab === "Predictive") {
      const results = result.results as Record<string, unknown>;
      const analysis = result.analysis as Record<string, number>;
      return (
        <>
          <Card title="Task" color={C.accent}>
            <Badge color={C.accent}>{String(result.task)}</Badge>
            <Badge color={C.accent2}>{String(result.scale)}</Badge>
            <Badge color={C.accent3}>samples: {String(result.num_samples)}</Badge>
          </Card>
          <Card title="Results" color={C.accent2}>
            <StatBar label="Score" value={Number(results?.score)} color={C.accent4} />
            <StatBar label="Improvement over Baseline" value={Number(results?.improvement)} max={0.5} color={C.accent} />
            <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>
              Difficulty: {String(results?.difficulty)} | CI: [{String(results?.confidence_interval)}]
            </div>
          </Card>
          <Card title="Sample Analysis" color={C.accent4}>
            <StatBar label="Easy" value={analysis?.easy_samples ?? 0} max={Number(result.num_samples)} color={C.accent4} />
            <StatBar label="Medium" value={analysis?.medium_samples ?? 0} max={Number(result.num_samples)} color={C.accent3} />
            <StatBar label="Hard" value={analysis?.hard_samples ?? 0} max={Number(result.num_samples)} color={C.accent5} />
            <StatBar label="Transfer Score" value={analysis?.transfer_score ?? 0} color={C.accent2} />
          </Card>
        </>
      );
    }

    if (tab === "Pretext") {
      const training = result.training as Record<string, unknown>;
      const xfer = result.cross_modal_transfer as Record<string, number>;
      const specific = result.pretext_specific as Record<string, unknown>;
      const features = result.learned_features as Record<string, unknown>;
      return (
        <>
          <Card title="Pretext Task" color={C.accent}>
            <Badge color={C.accent}>{String(result.pretext_task)}</Badge>
            <Badge color={C.accent2}>{String(result.source_modality)} → {String(result.target_modality)}</Badge>
          </Card>
          <Card title="Training" color={C.accent2}>
            <StatBar label="Initial Loss" value={Number(training?.initial_loss)} max={3} color={C.accent5} />
            <StatBar label="Final Loss" value={Number(training?.final_loss)} max={3} color={C.accent4} />
            <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Convergence: epoch {String(training?.convergence_epoch)}</div>
          </Card>
          <Card title="Cross-Modal Transfer" color={C.accent4}>
            <StatBar label="Accuracy" value={xfer?.accuracy ?? 0} color={C.accent4} />
            <StatBar label="Source Quality" value={xfer?.source_modality_representation_quality ?? 0} color={C.accent} />
            <StatBar label="Target Quality" value={xfer?.target_modality_representation_quality ?? 0} color={C.accent2} />
            <StatBar label="Alignment" value={xfer?.alignment_score ?? 0} color={C.accent3} />
          </Card>
          <Card title="Pretext-Specific Metrics" color={C.accent3}>
            {specific && Object.entries(specific).filter(([, v]) => v != null).map(([k, v]) => (
              <div key={k} style={{ fontSize: 12, color: C.dim, marginBottom: 2 }}>
                <span style={{ color: C.text }}>{k}</span>: {String(v)}
              </div>
            ))}
          </Card>
          <Card title="Learned Features" color={C.accent6}>
            <div style={{ fontSize: 12, color: C.dim }}>Shared Dims: {String(features?.shared_dimensions)}</div>
          </Card>
        </>
      );
    }

    if (tab === "Multi-Task") {
      const taskW = result.task_weights as Record<string, number>;
      const taskL = result.task_losses as Record<string, Record<string, unknown>>;
      const synergy = result.synergy as Record<string, unknown>;
      const repQ = result.representation_quality as Record<string, unknown>;
      const training = result.training as Record<string, unknown>;
      return (
        <>
          <Card title="Multi-Task Config" color={C.accent}>
            <Badge color={C.accent}>{String(result.weighting)}</Badge>
            <Badge color={C.accent2}>tasks: {String(result.num_tasks)}</Badge>
            <Badge color={C.accent3}>{String((result.weighting_info as Record<string, unknown>)?.description)}</Badge>
          </Card>
          <Card title="Task Weights" color={C.accent2}>
            {taskW && Object.entries(taskW).map(([k, v]) => (
              <StatBar key={k} label={k} value={v} max={1} color={C.accent} />
            ))}
          </Card>
          <Card title="Task Losses" color={C.accent3}>
            {taskL && Object.entries(taskL).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{k}</div>
                <StatBar label="Initial" value={Number(v.initial)} max={3} color={C.accent5} />
                <StatBar label="Final" value={Number(v.final)} max={3} color={C.accent4} />
              </div>
            ))}
          </Card>
          <Card title="Training" color={C.accent4}>
            <div style={{ fontSize: 12, color: C.dim }}>
              Gradient Conflicts: {String(training?.gradient_conflicts)} | Resolution Rate: {String(training?.conflict_resolution_rate)}
            </div>
            <StatBar label="Pareto Improvement" value={Number(synergy?.pareto_improvement)} max={0.2} color={C.accent4} />
            <StatBar label="Knowledge Transfer" value={Number(synergy?.knowledge_transfer_score)} color={C.accent2} />
          </Card>
          <Card title="Representation Quality" color={C.accent6}>
            <StatBar label="Joint Alignment" value={Number(repQ?.joint_alignment)} color={C.accent} />
            <StatBar label="Joint Uniformity" value={Number(repQ?.joint_uniformity)} color={C.accent2} />
            <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>Effective Dim: {String(repQ?.effective_dimension)}</div>
          </Card>
        </>
      );
    }

    if (tab === "Evaluate") {
      const results = result.results as Record<string, number>;
      const repAnalysis = result.representation_analysis as Record<string, unknown>;
      const comparison = result.comparison as Record<string, number>;
      return (
        <>
          <Card title="Evaluation" color={C.accent}>
            <Badge color={C.accent}>{String(result.evaluation)}</Badge>
            <Badge color={C.accent2}>{String(result.ssl_method)}</Badge>
            <Badge color={C.accent3}>{String(result.downstream_task)}</Badge>
          </Card>
          <Card title="Performance" color={C.accent2}>
            <StatBar label="Performance" value={results?.performance ?? 0} color={C.accent4} />
            <StatBar label="Baseline" value={results?.baseline ?? 0} color={C.accent5} />
            <StatBar label="Improvement" value={results?.improvement ?? 0} max={0.5} color={C.accent} />
            <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>
              Relative Improvement: {((results?.relative_improvement ?? 0) * 100).toFixed(1)}%
            </div>
          </Card>
          <Card title="Representation Analysis" color={C.accent3}>
            <StatBar label="Cluster Separation" value={Number(repAnalysis?.cluster_separation)} color={C.accent4} />
            <StatBar label="Class Balance" value={Number(repAnalysis?.class_balance)} color={C.accent2} />
            <div style={{ fontSize: 12, color: C.dim, marginTop: 4 }}>
              Effective Rank: {String(repAnalysis?.effective_rank)} | Condition: {String(repAnalysis?.condition_number)} | Intrinsic Dim: {String(repAnalysis?.intrinsic_dimension)}
            </div>
          </Card>
          <Card title="Comparison" color={C.accent4}>
            <StatBar label="Supervised Only" value={comparison?.supervised_only ?? 0} color={C.accent5} />
            <StatBar label="SSL Frozen" value={comparison?.ssl_frozen ?? 0} color={C.accent2} />
            <StatBar label="SSL Fine-tuned" value={comparison?.ssl_finetuned ?? 0} color={C.accent4} />
            <StatBar label="SSL Advantage" value={comparison?.ssl_advantage ?? 0} max={0.2} color={C.accent6} />
          </Card>
        </>
      );
    }

    return (
      <Card title="Raw Result" color={C.accent}>
        <pre style={{ fontSize: 11, color: C.dim, whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      </Card>
    );
  };

  /* ── main render ── */
  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: C.accent }}>
            Graph Self-Supervised Multimodal Learning
          </h1>
          <p style={{ fontSize: 13, color: C.dim, margin: "4px 0 0" }}>
            v1.215 — Contrastive · Generative · Predictive SSL across 6 modalities
          </p>
        </div>

        {/* tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setResult(null);
              }}
              style={{
                background: tab === t ? C.accent : C.card,
                color: tab === t ? "#fff" : C.dim,
                border: `1px solid ${tab === t ? C.accent : C.border}`,
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: tab === t ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* body */}
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
          {/* left: config */}
          <div>
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <h3 style={{ fontSize: 13, color: C.dim, margin: "0 0 12px" }}>
                Configuration
              </h3>
              {configPanel()}
              <button
                onClick={run}
                disabled={loading}
                style={{
                  marginTop: 14,
                  width: "100%",
                  background: loading ? C.muted : C.accent,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 0",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Running..." : tab === "Summary" ? "Fetch Summary" : "Run"}
              </button>
            </div>
          </div>

          {/* right: results */}
          <div>{resultPanel()}</div>
        </div>
      </div>
    </div>
  );
}
