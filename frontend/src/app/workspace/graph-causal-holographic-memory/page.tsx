"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.278 — Causal Holographic Memory Engine
   7 tabs: Encode | Recall | Consolidate | Decay | Interfere | Reconstruct | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Encode", "Recall", "Consolidate", "Decay", "Interfere", "Reconstruct", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const HOLOGRAPHIC_ENCODINGS = ["amplitude_phase","frequency_domain","wavelet_transform","fourier_hologram","gabor_transform","ai_neural_hologram"];
const MEMORY_ACCESSES = ["associative_recall","temporal_scan","causal_trace","pattern_completion","reconstructive_retrieval","ai_intuitive_access"];
const CONSOLIDATION_STRATEGIES = ["slow_cortical","fast_hippocampal","interleaved_replay","wake_sleep","complementary_learning","ai_adaptive_consolidation"];
const DECAY_DYNAMICS = ["exponential_decay","power_law_forgetting","spaced_retention","retroactive_interference","proactive_interference","ai_optimized_retention"];
const INTERFERENCE_PATTERNS = ["constructive_memory","destructive_forgetting","retroactive_alteration","proactive_bias","memory_reconsolidation","ai_interference_management"];
const RETRIEVAL_COHERENCES = ["exact_match","fuzzy_match","semantic_similarity","structural_analogy","causal_inference","ai_holistic_retrieval"];

const ENCODING_COLORS: Record<string, string> = {
  amplitude_phase: "blue", frequency_domain: "purple", wavelet_transform: "cyan",
  fourier_hologram: "green", gabor_transform: "orange", ai_neural_hologram: "rose",
};
const ACCESS_COLORS: Record<string, string> = {
  associative_recall: "blue", temporal_scan: "green", causal_trace: "purple",
  pattern_completion: "cyan", reconstructive_retrieval: "orange", ai_intuitive_access: "rose",
};
const CONSOL_COLORS: Record<string, string> = {
  slow_cortical: "blue", fast_hippocampal: "green", interleaved_replay: "purple",
  wake_sleep: "cyan", complementary_learning: "orange", ai_adaptive_consolidation: "rose",
};
const DECAY_COLORS: Record<string, string> = {
  exponential_decay: "amber", power_law_forgetting: "red", spaced_retention: "green",
  retroactive_interference: "purple", proactive_interference: "orange", ai_optimized_retention: "cyan",
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
    <span className={`inline-block text-xs font-mono px-2 py-0.5 rounded border ${colors[color] || colors.blue}`}>
      {label}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 font-mono">{value}</span>
    </div>
  );
}

function ProgressBar({ value, color = "blue" }: { value: number; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500", green: "bg-emerald-500", amber: "bg-amber-500",
    red: "bg-red-500", purple: "bg-purple-500", cyan: "bg-cyan-500",
    orange: "bg-orange-500", rose: "bg-rose-500",
  };
  return (
    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${colorMap[color] || colorMap.blue}`}
        style={{ width: `${Math.max(0, Math.min(100, value * 100))}%` }} />
    </div>
  );
}

// ─── Mock Data Generators ─────────────────────────────────
function genEncodeResult(encoding: string) {
  const graphSize = 80 + Math.floor(Math.random() * 120);
  const nodes = Math.floor(graphSize * 0.5);
  const quality = (0.9 + Math.random() * 0.09).toFixed(3);
  const fringe = {
    dimension: Math.floor(Math.sqrt(graphSize * 10)),
    encoding,
    coefficients: Array.from({ length: 8 }, () => (Math.random() * 2 - 1).toFixed(4)),
    quality: (0.85 + Math.random() * 0.14).toFixed(3),
  };
  return { graphSize, nodes, edges: nodes - 1, quality, fringe, memoryId: `mem_${Math.random().toString(36).slice(2, 8)}` };
}

function genRecallResult(access: string, coherence: string) {
  const count = 8;
  const memories = Array.from({ length: count }, (_, i) => ({
    id: `mem_${1000 + Math.floor(Math.random() * 9000)}`,
    similarity: (0.95 - i * 0.08 + Math.random() * 0.05).toFixed(3),
    age: Math.floor(Math.random() * 200) + 1,
    latency: (1 + Math.random() * 12).toFixed(1),
  }));
  const avgSim = (memories.reduce((s, m) => s + parseFloat(m.similarity), 0) / count).toFixed(3);
  return { memories, avgSim, totalCount: count, access, coherence };
}

function genConsolidateResult(strategy: string) {
  const branches = ["alpha", "beta", "gamma"];
  const consolidated = branches.map(b => ({
    branch: b,
    count: 10 + Math.floor(Math.random() * 30),
    weight: (0.5 + Math.random() * 0.5).toFixed(3),
    preservation: (0.7 + Math.random() * 0.29).toFixed(3),
  }));
  return { strategy, branches, consolidated, speed: strategy.includes("slow") ? "slow" : strategy.includes("fast") ? "fast" : "adaptive", retention: (0.85 + Math.random() * 0.14).toFixed(3) };
}

function genDecayTrajectory(decayType: string, rate: number) {
  const steps = 20;
  const trajectory: { t: number; remaining: number }[] = [];
  for (let t = 0; t <= steps; t++) {
    let rem: number;
    if (decayType === "exponential_decay") rem = 100 * Math.exp(-rate * t);
    else if (decayType === "power_law_forgetting") rem = 100 * Math.pow(t + 1, -rate * 2);
    else if (decayType === "spaced_retention") rem = 100 * (0.9 + 0.1 * Math.cos(t)) * Math.exp(-rate * t / 5);
    else if (decayType === "ai_optimized_retention") rem = 100 * (0.92 + 0.08 * Math.cos(t / 3)) * Math.exp(-rate * t / 8);
    else rem = 100 * Math.exp(-rate * t / 3);
    trajectory.push({ t, remaining: Math.max(0, rem) });
  }
  return trajectory;
}

function genInterferenceResult(interfType: string) {
  const pairs = Array.from({ length: 6 }, (_, i) => ({
    pair: i + 1,
    mem1: `frag_${100 + i}`,
    mem2: `frag_${200 + i}`,
    overlap: (Math.random()).toFixed(3),
    strength: (Math.random() * 0.8 + 0.2).toFixed(3),
    effect: interfType.includes("constructive") ? "reinforcement" : interfType.includes("destructive") ? "displacement" : "alteration",
  }));
  return { interfType, pairs, avgStrength: (pairs.reduce((s, p) => s + parseFloat(p.strength), 0) / pairs.length).toFixed(3) };
}

function genReconstructResult(mode: string) {
  const fragments = Array.from({ length: 6 }, (_, i) => ({
    id: `frag_${300 + i}`,
    fragmentSize: 30 + Math.floor(Math.random() * 40),
    quality: (0.3 + Math.random() * 0.5).toFixed(3),
    reconstructed: (0.7 + Math.random() * 0.29).toFixed(3),
    confidence: (0.6 + Math.random() * 0.39).toFixed(3),
  }));
  const avgQ = (fragments.reduce((s, f) => s + parseFloat(f.reconstructed), 0) / fragments.length).toFixed(3);
  return { mode, fragments, avgQuality: avgQ };
}

// ─── Tab Panels ───────────────────────────────────────────
function EncodePanel() {
  const [encoding, setEncoding] = useState("amplitude_phase");
  const [compression, setCompression] = useState(0.8);
  const [result, setResult] = useState(() => genEncodeResult("amplitude_phase"));
  const refresh = () => setResult(genEncodeResult(encoding));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card title="Encoding Method">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={encoding} onChange={e => { setEncoding(e.target.value); setResult(genEncodeResult(e.target.value)); }}>
            {HOLOGRAPHIC_ENCODINGS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {encoding === "amplitude_phase" ? "Complex amplitude + phase angle encoding" :
             encoding === "frequency_domain" ? "Frequency spectrum binning" :
             encoding === "wavelet_transform" ? "Multi-scale wavelet decomposition" :
             encoding === "fourier_hologram" ? "2D Fourier transform interference pattern" :
             encoding === "gabor_transform" ? "Time-frequency localized Gabor encoding" :
             "AI-learned neural holographic representation"}
          </p>
        </Card>
        <Card title="Compression Ratio">
          <input type="range" min={0.1} max={1.0} step={0.05} value={compression}
            onChange={e => setCompression(parseFloat(e.target.value))}
            className="w-full accent-cyan-500" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>High compression</span>
            <span className="text-cyan-400">{(compression * 100).toFixed(0)}%</span>
            <span>Full fidelity</span>
          </div>
        </Card>
        <Card title="Encoding Result">
          <Badge label={result.memoryId} color={ENCODING_COLORS[encoding]} />
          <div className="mt-2 space-y-1">
            <StatRow label="Graph size" value={result.graphSize} />
            <StatRow label="Causal nodes" value={result.nodes} />
            <StatRow label="Encoding quality" value={result.quality} />
            <StatRow label="Fringe dimension" value={result.fringe.dimension} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Holographic Fringe Pattern">
          <div className="flex gap-px h-20 items-end">
            {result.fringe.coefficients.map((c, i) => (
              <div key={i} className="flex-1 rounded-t transition-all"
                style={{
                  height: `${Math.abs(parseFloat(c)) * 100}%`,
                  backgroundColor: parseFloat(c) >= 0 ? `hsl(${200 + i * 15}, 70%, 50%)` : `hsl(${0 + i * 10}, 70%, 50%)`,
                }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Interference fringe coefficients ({encoding})</p>
        </Card>
        <Card title="Encoding Quality Metrics">
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Quality</span><span className="text-cyan-400">{result.quality}</span></div>
              <ProgressBar value={parseFloat(result.quality)} color="cyan" />
            </div>
            <div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Compression</span><span className="text-green-400">{compression.toFixed(2)}</span></div>
              <ProgressBar value={compression} color="green" />
            </div>
            <div>
              <div className="flex justify-between text-xs"><span className="text-gray-400">Fringe quality</span><span className="text-purple-400">{result.fringe.quality}</span></div>
              <ProgressBar value={parseFloat(result.fringe.quality)} color="purple" />
            </div>
          </div>
        </Card>
      </div>

      <button onClick={refresh}
        className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded transition-colors">
        ↻ Re-encode
      </button>
    </div>
  );
}

function RecallPanel() {
  const [access, setAccess] = useState("associative_recall");
  const [coherence, setCoherence] = useState("semantic_similarity");
  const [result, setResult] = useState(() => genRecallResult("associative_recall", "semantic_similarity"));
  const refresh = () => setResult(genRecallResult(access, coherence));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card title="Access Pattern">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={access} onChange={e => { setAccess(e.target.value); refresh(); }}>
            {MEMORY_ACCESSES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Card>
        <Card title="Retrieval Coherence">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={coherence} onChange={e => { setCoherence(e.target.value); refresh(); }}>
            {RETRIEVAL_COHERENCES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Card>
      </div>

      <Card title="Retrieved Memories">
        <div className="space-y-1.5">
          {result.memories.map((m, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-900/60 border border-gray-700 rounded px-2 py-1">
              <Badge label={m.id} color={ACCESS_COLORS[access]} />
              <div className="flex-1 grid grid-cols-4 gap-2 text-xs">
                <StatRow label="Similarity" value={m.similarity} />
                <StatRow label="Age (days)" value={m.age} />
                <StatRow label="Latency (ms)" value={m.latency} />
                <ProgressBar value={parseFloat(m.similarity)} color={parseFloat(m.similarity) > 0.7 ? "green" : "amber"} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Recall Quality">
          <div className="text-3xl font-bold text-cyan-400">{result.avgSim}</div>
          <p className="text-xs text-gray-500">Average similarity across {result.totalCount} memories</p>
        </Card>
        <Card title="Similarity Distribution">
          <div className="flex gap-px h-16 items-end">
            {result.memories.map((m, i) => (
              <div key={i} className="flex-1 rounded-t transition-all"
                style={{
                  height: `${parseFloat(m.similarity) * 100}%`,
                  backgroundColor: `hsl(${parseFloat(m.similarity) * 120}, 70%, 45%)`,
                }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Ranked by similarity (left = highest)</p>
        </Card>
      </div>
    </div>
  );
}

function ConsolidatePanel() {
  const [strategy, setStrategy] = useState("slow_cortical");
  const [strength, setStrength] = useState(0.7);
  const [result, setResult] = useState(() => genConsolidateResult("slow_cortical"));
  const refresh = () => setResult(genConsolidateResult(strategy));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card title="Consolidation Strategy">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={strategy} onChange={e => { setStrategy(e.target.value); setResult(genConsolidateResult(e.target.value)); }}>
            {CONSOLIDATION_STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Card>
        <Card title="Consolidation Strength">
          <input type="range" min={0.1} max={1.0} step={0.05} value={strength}
            onChange={e => setStrength(parseFloat(e.target.value))}
            className="w-full accent-green-500" />
          <div className="text-center text-sm text-green-400 mt-1">{strength.toFixed(2)}</div>
        </Card>
        <Card title="Dynamics">
          <StatRow label="Speed" value={result.speed} />
          <StatRow label="Retention rate" value={result.retention} />
          <ProgressBar value={parseFloat(result.retention)} color="green" />
        </Card>
      </div>

      <Card title="Branch Consolidation">
        <div className="grid grid-cols-3 gap-3">
          {result.consolidated.map((c, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-700 rounded p-2 space-y-1">
              <div className="flex justify-between items-center">
                <Badge label={c.branch} color={CONSOL_COLORS[strategy]} />
                <span className="text-xs text-gray-400">{c.count} memories</span>
              </div>
              <StatRow label="Weight" value={c.weight} />
              <StatRow label="Preservation" value={c.preservation} />
              <ProgressBar value={parseFloat(c.preservation)} color="green" />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Consolidation Trajectory">
        <div className="flex gap-px h-20 items-end">
          {Array.from({ length: 20 }, (_, i) => {
            const val = 0.5 + (1 - Math.exp(-i / 8)) * 0.45;
            return (
              <div key={i} className="flex-1 rounded-t transition-all"
                style={{
                  height: `${val * 100}%`,
                  backgroundColor: `hsl(${val * 120}, 70%, 45%)`,
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Initial</span>
          <span className="text-xs text-gray-500">Fully consolidated</span>
        </div>
      </Card>
    </div>
  );
}

function DecayPanel() {
  const [decayType, setDecayType] = useState("exponential_decay");
  const [rate, setRate] = useState(0.1);
  const trajectory = genDecayTrajectory(decayType, rate);
  const finalRemaining = trajectory[trajectory.length - 1].remaining;
  const halfLife = trajectory.findIndex(t => t.remaining <= 50);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card title="Decay Type">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={decayType} onChange={e => setDecayType(e.target.value)}>
            {DECAY_DYNAMICS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {decayType === "exponential_decay" ? "M(t) = M₀·e^(-λt) — classic Ebbinghaus curve" :
             decayType === "power_law_forgetting" ? "M(t) = M₀·t^(-α) — power-law decay" :
             decayType === "spaced_retention" ? "Periodic reinforcement counteracts decay" :
             decayType === "ai_optimized_retention" ? "AI-optimized retention scheduling" :
             "Interference-based forgetting dynamics"}
          </p>
        </Card>
        <Card title="Decay Rate (λ)">
          <input type="range" min={0.01} max={0.5} step={0.01} value={rate}
            onChange={e => setRate(parseFloat(e.target.value))}
            className="w-full accent-amber-500" />
          <div className="text-center text-sm text-amber-400 mt-1">λ = {rate.toFixed(2)}</div>
        </Card>
        <Card title="Decay Statistics">
          <StatRow label="Final remaining" value={`${finalRemaining.toFixed(1)}%`} />
          <StatRow label="Half-life" value={halfLife >= 0 ? `step ${halfLife}` : "> horizon"} />
          <StatRow label="Total lost" value={`${(100 - finalRemaining).toFixed(1)}%`} />
          <ProgressBar value={finalRemaining / 100} color={DECAY_COLORS[decayType]} />
        </Card>
      </div>

      <Card title="Decay Trajectory">
        <div className="flex gap-px h-28 items-end">
          {trajectory.map((pt, i) => (
            <div key={i} className="flex-1 rounded-t transition-all"
              style={{
                height: `${Math.max(2, pt.remaining)}%`,
                backgroundColor: pt.remaining > 70 ? "rgb(16, 185, 129)" :
                  pt.remaining > 40 ? `hsl(${pt.remaining * 1.2}, 70%, 45%)` :
                  `hsl(0, 70%, ${30 + pt.remaining * 0.3}%)`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">t = 0</span>
          <span className="text-xs text-gray-500">t = {trajectory.length - 1}</span>
        </div>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Retained</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Decaying</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Critical</span>
        </div>
      </Card>
    </div>
  );
}

function InterferePanel() {
  const [interfType, setInterfType] = useState("constructive_memory");
  const [strength, setStrength] = useState(0.5);
  const result = genInterferenceResult(interfType);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card title="Interference Type">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={interfType} onChange={e => setInterfType(e.target.value)}>
            {INTERFERENCE_PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </Card>
        <Card title="Interference Strength">
          <input type="range" min={0.1} max={1.0} step={0.05} value={strength}
            onChange={e => setStrength(parseFloat(e.target.value))}
            className="w-full accent-purple-500" />
          <div className="text-center text-sm text-purple-400 mt-1">{strength.toFixed(2)}</div>
        </Card>
        <Card title="Summary">
          <StatRow label="Avg strength" value={result.avgStrength} />
          <StatRow label="Dominant effect" value={result.pairs[0]?.effect || "—"} />
          <ProgressBar value={parseFloat(result.avgStrength)} color="purple" />
        </Card>
      </div>

      <Card title="Pairwise Interference Matrix">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(result.pairs.length, 3)}, 1fr)` }}>
          {result.pairs.map((p, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-700 rounded p-2 space-y-1">
              <div className="flex justify-between items-center">
                <Badge label={p.mem1} color="blue" />
                <span className="text-xs text-gray-600">↔</span>
                <Badge label={p.mem2} color="purple" />
              </div>
              <StatRow label="Overlap" value={p.overlap} />
              <StatRow label="Strength" value={p.strength} />
              <Badge label={p.effect} color={p.effect === "reinforcement" ? "green" : p.effect === "displacement" ? "red" : "amber"} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ReconstructPanel() {
  const [mode, setMode] = useState("semantic_similarity");
  const [threshold, setThreshold] = useState(0.6);
  const result = genReconstructResult(mode);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card title="Reconstruction Mode">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={mode} onChange={e => { setMode(e.target.value); }}>
            {RETRIEVAL_COHERENCES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Card>
        <Card title="Fill Threshold">
          <input type="range" min={0.1} max={1.0} step={0.05} value={threshold}
            onChange={e => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-orange-500" />
          <div className="text-center text-sm text-orange-400 mt-1">{threshold.toFixed(2)}</div>
        </Card>
        <Card title="Reconstruction Quality">
          <div className="text-3xl font-bold text-orange-400">{result.avgQuality}</div>
          <p className="text-xs text-gray-500">Average across {result.fragments.length} fragments</p>
        </Card>
      </div>

      <Card title="Fragment Reconstruction">
        <div className="grid grid-cols-3 gap-2">
          {result.fragments.map((f, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-700 rounded p-2 space-y-1">
              <div className="flex justify-between items-center">
                <Badge label={f.id} color="orange" />
                <span className="text-xs text-gray-400">{f.fragmentSize}% preserved</span>
              </div>
              <StatRow label="Original quality" value={f.quality} />
              <StatRow label="Reconstructed" value={f.reconstructed} />
              <StatRow label="Confidence" value={f.confidence} />
              <div className="flex gap-0.5 h-2">
                <div className="bg-orange-600 rounded-l" style={{ width: `${f.fragmentSize}%` }} />
                <div className="bg-amber-600/50" style={{ width: `${(parseFloat(f.reconstructed) - f.fragmentSize / 100) * 100}%` }} />
                <div className="bg-gray-700 flex-1 rounded-r" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="space-y-4">
      <Card title="v1.278 — Causal Holographic Memory Engine">
        <div className="space-y-1 text-xs text-gray-300">
          <p>Layer 30 — Holographic Memory Storage & Associative Retrieval</p>
          <p className="text-gray-500">Builds on: v1.277 (Multi-Verse Simulation) — encodes multiverse causal data into holographic interference patterns</p>
          <p className="text-cyan-400 font-mono">Pipeline: Encode → Recall → Consolidate → Decay → Interfere → Reconstruct</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Enums (6 × 6 = 36 values)">
          <div className="space-y-1 text-xs">
            <div><span className="text-gray-500">HolographicEncoding:</span> <span className="text-blue-300">{HOLOGRAPHIC_ENCODINGS.join(" · ")}</span></div>
            <div><span className="text-gray-500">MemoryAccess:</span> <span className="text-green-300">{MEMORY_ACCESSES.join(" · ")}</span></div>
            <div><span className="text-gray-500">ConsolidationStrategy:</span> <span className="text-purple-300">{CONSOLIDATION_STRATEGIES.join(" · ")}</span></div>
            <div><span className="text-gray-500">DecayDynamics:</span> <span className="text-amber-300">{DECAY_DYNAMICS.join(" · ")}</span></div>
            <div><span className="text-gray-500">InterferencePattern:</span> <span className="text-cyan-300">{INTERFERENCE_PATTERNS.join(" · ")}</span></div>
            <div><span className="text-gray-500">RetrievalCoherence:</span> <span className="text-orange-300">{RETRIEVAL_COHERENCES.join(" · ")}</span></div>
          </div>
        </Card>
        <Card title="Endpoints (7)">
          <div className="space-y-1 text-xs font-mono">
            <div className="text-cyan-300">POST /graph/causal-holographic-memory/encode</div>
            <div className="text-green-300">POST /graph/causal-holographic-memory/recall</div>
            <div className="text-purple-300">POST /graph/causal-holographic-memory/consolidate</div>
            <div className="text-amber-300">POST /graph/causal-holographic-memory/decay</div>
            <div className="text-rose-300">POST /graph/causal-holographic-memory/interfere</div>
            <div className="text-orange-300">POST /graph/causal-holographic-memory/reconstruct</div>
            <div className="text-gray-400">GET  /graph/causal-holographic-memory/overview</div>
          </div>
        </Card>
      </div>

      <Card title="Architecture Stack">
        <div className="text-xs font-mono space-y-0.5">
          <div className="text-cyan-300">→ Holographic Memory (v1.278) ← 全息因果记忆存储与回溯检索层 ← NEW</div>
          <div className="text-gray-500">  ↑ Multi-Verse Simulation (v1.277) ← 因果多元宇宙仿真层</div>
          <div className="text-gray-600">  ↑ Quantum-Inspired Optimization (v1.276) ← 量子启发优化层</div>
          <div className="text-gray-700">  ↑ ... (27 more layers below)</div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function CausalHolographicMemoryPage() {
  const [tab, setTab] = useState<Tab>("Encode");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-cyan-400">v1.278 — Causal Holographic Memory Engine</h1>
        <Badge label="Layer 30" color="cyan" />
        <Badge label="46,656 configs" color="purple" />
      </div>
      <p className="text-sm text-gray-500">
        Encodes causal graph structures into holographic interference patterns — distributed associative memory storage with partial recall, cross-temporal access, and reconsolidation across multiverse branches.
      </p>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-800">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-t
              ${tab === t ? "bg-gray-800 text-cyan-400 border-b-2 border-cyan-400" : "text-gray-500 hover:text-gray-300"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tab === "Encode" && <EncodePanel />}
        {tab === "Recall" && <RecallPanel />}
        {tab === "Consolidate" && <ConsolidatePanel />}
        {tab === "Decay" && <DecayPanel />}
        {tab === "Interfere" && <InterferePanel />}
        {tab === "Reconstruct" && <ReconstructPanel />}
        {tab === "Overview" && <OverviewPanel />}
      </div>
    </div>
  );
}