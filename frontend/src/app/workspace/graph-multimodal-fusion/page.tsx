"use client";

import { useState } from "react";

const API = "/api/graph";

const MODALITY_TYPES = ["visual", "textual", "structural", "temporal", "audio", "tabular"];
const ALIGNMENT_METHODS = ["contrastive", "canonical", "optimal_transport", "mutual_information", "adversarial", "geometric"];
const FUSION_STRATEGIES = ["early_fusion", "late_fusion", "mid_fusion", "hybrid_fusion", "attention_fusion", "gated_fusion"];
const CROSS_MODAL_TASKS = ["retrieval", "captioning", "vqa", "grounding", "generation", "reasoning"];
const GENERATION_METHODS = ["diffusion", "vae", "gan", "autoregressive", "flow", "hybrid"];
const ATTENTION_MECHANISMS = ["co_attention", "cross_attention", "self_attention", "hierarchical", "sparse", "adaptive"];

const TABS = ["Align", "Encode", "Fusion", "Reasoning", "Generate", "Attention", "Summary"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>
      {children}
    </div>
  );
}

function StatBar({ label, value, max = 1, color = "bg-indigo-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(3)}</span>
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

function ChipGroup({ items, selected, onToggle }: { items: string[]; selected: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onToggle(item)}
          className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
            selected.includes(item)
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default function GraphMultimodalFusionPage() {
  const [tab, setTab] = useState<Tab>("Align");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const [selectedModalities, setSelectedModalities] = useState<string[]>(["visual", "textual", "structural"]);

  const toggleModality = (m: string) => {
    setSelectedModalities((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const call = async (endpoint: string, body: Record<string, unknown>) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: String(e) });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Graph Multimodal Fusion</h1>
        <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 px-2 py-0.5 rounded">v1.213</span>
      </div>

      {/* Modality selector */}
      <Card title="Select Modalities">
        <ChipGroup items={MODALITY_TYPES} selected={selectedModalities} onToggle={toggleModality} />
      </Card>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              tab === t
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Align */}
      {tab === "Align" && (
        <Card title="Cross-Modal Alignment (6 Methods)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {ALIGNMENT_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => call("/multimodal-fusion/align", { modalities: selectedModalities, alignment_method: m, num_iterations: 100, embedding_dim: 256 })}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
              >
                {m}
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Aligning modalities...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.pair_results) return <JsonBlock data={result} />;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Overall Alignment" value={(d.overall_alignment_score as number) ?? 0} />
                      <StatBar label="Worst Pair Score" value={(d.worst_aligned_pair as Record<string, number>)?.score ?? 0} color="bg-orange-500" />
                      <StatBar label="Num Pairs" value={(d.num_pairs as number) ?? 0} max={15} color="bg-green-500" />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Pair Results ({(d.pair_results as unknown[])?.length ?? 0} pairs)</summary>
                      <JsonBlock data={d.pair_results} />
                    </details>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Encode */}
      {tab === "Encode" && (
        <Card title="Multimodal Encoding (Transformer/MLP/GNN)">
          <div className="flex gap-2 mb-3">
            {["transformer", "gnn_encoder", "mlp_encoder", "cnn_encoder"].map((e) => (
              <button
                key={e}
                onClick={() => call("/multimodal-fusion/encode", { modalities: selectedModalities, encoder_type: e, hidden_dim: 256, num_layers: 4 })}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors"
              >
                {e}
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Encoding multimodal features...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.encoder_architectures) return <JsonBlock data={result} />;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Overall Quality" value={(d.overall_quality as number) ?? 0} />
                      <StatBar label="Parameters" value={((d.total_parameters as number) ?? 0) / 1e6} max={10} color="bg-blue-500" />
                      <StatBar label="Time (ms)" value={(d.encoding_time_ms as number) ?? 0} max={500} color="bg-yellow-500" />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Encoder Architectures</summary>
                      <JsonBlock data={d.encoder_architectures} />
                    </details>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Fusion */}
      {tab === "Fusion" && (
        <Card title="Modality Fusion (6 Strategies)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {FUSION_STRATEGIES.map((s) => (
              <button
                key={s}
                onClick={() => call("/multimodal-fusion/fusion", { modalities: selectedModalities, fusion_strategy: s, fusion_dim: 256, num_heads: 8 })}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Fusing modalities...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.fusion_stages) return <JsonBlock data={result} />;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Fusion Quality" value={(d.fusion_quality as number) ?? 0} />
                      <StatBar label="Recommended" value={(d.recommended_strategy as string) === (d.fusion_strategy as string) ? 1 : 0} color="bg-teal-500" />
                      <StatBar label="Strategy Comp." value={((d.strategy_comparison as unknown[])?.length ?? 0)} max={6} color="bg-pink-500" />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Modality Weights</summary>
                      <JsonBlock data={d.modality_weights} />
                    </details>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Strategy Comparison ({(d.strategy_comparison as unknown[])?.length ?? 0})</summary>
                      <JsonBlock data={d.strategy_comparison} />
                    </details>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Reasoning */}
      {tab === "Reasoning" && (
        <Card title="Cross-Modal Reasoning (6 Tasks)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {CROSS_MODAL_TASKS.map((t) => (
              <button
                key={t}
                onClick={() => call("/multimodal-fusion/reasoning", { task: t, source_modality: selectedModalities[0] || "visual", target_modality: selectedModalities[1] || "textual", reasoning_depth: 3 })}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-violet-50 dark:hover:bg-violet-900 transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Cross-modal reasoning...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.reasoning_chain) return <JsonBlock data={result} />;
                const tm = d.task_metrics as Record<string, unknown>;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Final Confidence" value={(d.final_confidence as number) ?? 0} />
                      <StatBar label="Graph Utilization" value={(d.graph_utilization as number) ?? 0} color="bg-cyan-500" />
                      <StatBar label="Cross-Modal Coherence" value={(d.cross_modal_coherence as number) ?? 0} color="bg-rose-500" />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Task Metrics</summary>
                      <JsonBlock data={tm} />
                    </details>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Reasoning Chain ({(d.reasoning_chain as unknown[])?.length ?? 0} steps)</summary>
                      <JsonBlock data={d.reasoning_chain} />
                    </details>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Generate */}
      {tab === "Generate" && (
        <Card title="Multimodal Generation (6 Methods)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {GENERATION_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => call("/multimodal-fusion/generate", { target_modality: selectedModalities[0] || "visual", conditioning_modalities: selectedModalities.slice(1), generation_method: m, num_samples: 8 })}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-amber-50 dark:hover:bg-amber-900 transition-colors"
              >
                {m}
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Generating multimodal content...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.samples) return <JsonBlock data={result} />;
                const am = d.aggregated_metrics as Record<string, number>;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Avg Quality" value={am?.avg_quality ?? 0} />
                      <StatBar label="Avg Diversity" value={am?.avg_diversity ?? 0} color="bg-purple-500" />
                      <StatBar label="QD Tradeoff" value={am?.quality_diversity_tradeoff ?? 0} color="bg-lime-500" />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Modality Metrics</summary>
                      <JsonBlock data={d.modality_specific_metrics} />
                    </details>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Samples ({(d.samples as unknown[])?.length ?? 0})</summary>
                      <JsonBlock data={d.samples} />
                    </details>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Attention */}
      {tab === "Attention" && (
        <Card title="Modality-Aware Attention (6 Mechanisms)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {ATTENTION_MECHANISMS.map((a) => (
              <button
                key={a}
                onClick={() => call("/multimodal-fusion/attention", { modalities: selectedModalities, attention_mechanism: a, num_heads: 8, attention_resolution: 64 })}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-sky-50 dark:hover:bg-sky-900 transition-colors"
              >
                {a}
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Analyzing attention...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.head_analysis) return <JsonBlock data={result} />;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Attention Entropy" value={(d.attention_entropy as number) ?? 0} max={3} color="bg-fuchsia-500" />
                      <StatBar label="Modality Specialization" value={(d.modality_specialization as number) ?? 0} color="bg-orange-500" />
                      <StatBar label="Heads Analyzed" value={((d.head_analysis as unknown[])?.length ?? 0)} max={16} color="bg-emerald-500" />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Head Analysis ({(d.head_analysis as unknown[])?.length ?? 0} heads)</summary>
                      <JsonBlock data={d.head_analysis} />
                    </details>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Cross-Modal Attention</summary>
                      <JsonBlock data={d.cross_modal_attention_matrix} />
                    </details>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Summary */}
      {tab === "Summary" && (
        <Card title="Engine Summary">
          <button
            onClick={async () => {
              setLoading(true);
              try {
                const res = await fetch(`${API}/multimodal-fusion/summary`);
                setResult(await res.json());
              } catch (e) { setResult({ error: String(e) }); }
              setLoading(false);
            }}
            className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Load Summary
          </button>
          {result && <JsonBlock data={result} />}
        </Card>
      )}
    </div>
  );
}
