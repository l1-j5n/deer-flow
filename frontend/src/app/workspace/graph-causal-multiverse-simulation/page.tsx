"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.277 — Causal Multi-Verse Simulation Engine
   7 tabs: Branch | Simulate | Converge | Diverge | Interfere | Sync | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Branch", "Simulate", "Converge", "Diverge", "Interfere", "Sync", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const BRANCHING_STRATEGIES = ["quantum_superposition","classical_fork","probability_fan","counterfactual_diverge","intervention_split","ai_discovered_branch"];
const UNIVERSE_TOPOLOGIES = ["parallel_worlds","tree_branching","cyclic_timelines","convergent_streams","entangled_multiverse","ai_hyper_topology"];
const CONVERGENCE_MODES = ["attractor_basin","path_merging","collapse_reunification","bayesian_convergence","temporal_sync","ai_adaptive_convergence"];
const DIVERGENCE_METRICS = ["hamming_distance","kl_divergence","wasserstein","causal_edit_distance","structural_divergence","ai_semantic_divergence"];
const TIMELINE_POLICIES = ["deterministic","stochastic","quantum_probabilistic","retrocausal","branching_time","ai_evolutionary_timeline"];
const SIMULATION_DEPTHS = ["micro_state","meso_pattern","macro_outcome","multi_scale","full_resolution","ai_adaptive_depth"];

const BRANCH_COLORS: Record<string, string> = {
  quantum_superposition: "purple", classical_fork: "blue", probability_fan: "cyan",
  counterfactual_diverge: "green", intervention_split: "orange", ai_discovered_branch: "rose",
};

const TOPO_COLORS: Record<string, string> = {
  parallel_worlds: "blue", tree_branching: "green", cyclic_timelines: "purple",
  convergent_streams: "cyan", entangled_multiverse: "orange", ai_hyper_topology: "rose",
};

const CONV_COLORS: Record<string, string> = {
  attractor_basin: "blue", path_merging: "green", collapse_reunification: "purple",
  bayesian_convergence: "cyan", temporal_sync: "orange", ai_adaptive_convergence: "rose",
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
    <span className={`inline-block px-2 py-0.5 text-xs font-mono rounded border ${colors[color] || colors.blue}`}>
      {label}
    </span>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-300 mb-3 border-b border-gray-700 pb-2">{title}</h3>
      {children}
    </div>
  );
}

function StatRow({ label, value, unit = "" }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-mono text-gray-200">{value}{unit}</span>
    </div>
  );
}

function ProgressBar({ value, max = 1, color = "blue" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500", green: "bg-emerald-500", red: "bg-red-500",
    purple: "bg-purple-500", cyan: "bg-cyan-500", orange: "bg-orange-500",
    rose: "bg-rose-500", amber: "bg-amber-500", teal: "bg-teal-500",
  };
  return (
    <div className="w-full bg-gray-700 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${colorMap[color] || colorMap.blue}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Mock Data Generators ─────────────────────────────────
function genUniverses(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    id: `U${i}`,
    nodes: 10 + Math.floor(Math.random() * 20),
    edges: 15 + Math.floor(Math.random() * 40),
    stability: +(0.5 + Math.random() * 0.5).toFixed(3),
    divergence: i === 0 ? 0 : +(Math.random()).toFixed(3),
    sharedRatio: +(0.6 + Math.random() * 0.4).toFixed(3),
    phase: +(2 * Math.PI * i / n).toFixed(3),
    signature: `sig_${42 + i}_${1000 + Math.floor(Math.random() * 9000)}`,
  }));
}

function genTrajectory(steps: number) {
  let coherence = 0.5 + Math.random() * 0.3;
  return Array.from({ length: steps }, (_, i) => {
    coherence += (Math.random() - 0.5) * 0.06;
    coherence = Math.max(0, Math.min(1, coherence));
    return { step: i, coherence: +coherence.toFixed(3), entropy: +(Math.random() * 3.3).toFixed(3) };
  });
}

function genDivergencePairs(n: number) {
  const pairs: { u1: number; u2: number; d: number; cls: string }[] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    const d = +Math.random().toFixed(3);
    pairs.push({ u1: i, u2: j, d, cls: d > 0.7 ? "high" : d > 0.3 ? "medium" : "low" });
  }
  return pairs;
}

// ─── Tab Panels ───────────────────────────────────────────

function BranchPanel() {
  const [strategy, setStrategy] = useState("ai_discovered_branch");
  const [nBranches, setNBranches] = useState(6);
  const [topology, setTopology] = useState("ai_hyper_topology");
  const [universes] = useState(() => genUniverses(nBranches));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card title="Branching Strategy">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={strategy} onChange={e => setStrategy(e.target.value)}>
            {BRANCHING_STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            {strategy === "quantum_superposition" ? "Superpose causal state vectors with decoherence" :
             strategy === "ai_discovered_branch" ? "AI discovers latent branch dimensions via causal embedding clustering" :
             "Branch the causal DAG into parallel trajectories"}
          </p>
        </Card>
        <Card title="Universe Topology">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={topology} onChange={e => setTopology(e.target.value)}>
            {UNIVERSE_TOPOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="mt-2 space-y-1">
            <StatRow label="Scale-free exp." value={+(2 + Math.random()).toFixed(2)} />
            <StatRow label="Clustering coeff." value={+(Math.random()).toFixed(3)} />
            <StatRow label="Small-world idx" value={+(0.5 + Math.random()).toFixed(3)} />
          </div>
        </Card>
        <Card title="Parameters">
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Branches: {nBranches}</label>
            <input type="range" min={2} max={32} value={nBranches}
              onChange={e => setNBranches(+e.target.value)}
              className="w-full accent-purple-500" />
            <StatRow label="Divergence seed" value={42} />
            <StatRow label="Branching point" value="t=0" />
            <StatRow label="Config space" value="46,656" />
          </div>
        </Card>
      </div>

      <Card title="Branched Universes">
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {universes.map((u, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-700 rounded p-2 space-y-1">
              <div className="flex justify-between items-center">
                <Badge label={u.id} color={BRANCH_COLORS[strategy] || "blue"} />
                <span className="text-xs text-gray-500">φ={u.phase}</span>
              </div>
              <StatRow label="Nodes" value={u.nodes} />
              <StatRow label="Edges" value={u.edges} />
              <StatRow label="Stability" value={u.stability} />
              <ProgressBar value={u.stability} color={BRANCH_COLORS[strategy]} />
              <StatRow label="Shared %" value={`${(u.sharedRatio * 100).toFixed(1)}%`} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SimulatePanel() {
  const [timeline, setTimeline] = useState("ai_evolutionary_timeline");
  const [depth, setDepth] = useState("ai_adaptive_depth");
  const [nUniverses] = useState(6);
  const [trajectories] = useState(() => Array.from({ length: 6 }, () => genTrajectory(30)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card title="Timeline Policy">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={timeline} onChange={e => setTimeline(e.target.value)}>
            {TIMELINE_POLICIES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Card>
        <Card title="Simulation Depth">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={depth} onChange={e => setDepth(e.target.value)}>
            {SIMULATION_DEPTHS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Card>
      </div>

      <Card title="Universe Trajectories (Coherence over Time)">
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {trajectories.slice(0, nUniverses).map((traj, ui) => {
            const maxC = Math.max(...traj.map(t => t.coherence));
            const colors = ["blue", "green", "purple", "cyan", "orange", "rose"];
            return (
              <div key={ui}>
                <div className="flex justify-between items-center mb-1">
                  <Badge label={`U${ui}`} color={colors[ui]} />
                  <span className="text-xs text-gray-400">
                    Δ = {((traj[traj.length - 1]?.coherence ?? 0) - (traj[0]?.coherence ?? 0)).toFixed(3)}
                  </span>
                </div>
                <div className="flex gap-px h-6 items-end">
                  {traj.map((t, ti) => (
                    <div key={ti} className="flex-1 rounded-t"
                      style={{
                        height: `${t.coherence * 100}%`,
                        backgroundColor: `hsl(${200 + ui * 30}, 70%, ${30 + t.coherence * 30}%)`,
                        minHeight: "2px",
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-2">
        <Card title="Convergent">
          <div className="text-2xl font-bold text-emerald-400">{1 + Math.floor(Math.random() * 3)}</div>
          <p className="text-xs text-gray-500">universes</p>
        </Card>
        <Card title="Divergent">
          <div className="text-2xl font-bold text-orange-400">{1 + Math.floor(Math.random() * 3)}</div>
          <p className="text-xs text-gray-500">universes</p>
        </Card>
        <Card title="Phase Transitions">
          <div className="text-2xl font-bold text-purple-400">{Math.floor(Math.random() * 8)}</div>
          <p className="text-xs text-gray-500">detected</p>
        </Card>
        <Card title="Cross-coupling">
          <div className="text-2xl font-bold text-cyan-400">{(Math.random()).toFixed(3)}</div>
          <p className="text-xs text-gray-500">inter-universe</p>
        </Card>
      </div>
    </div>
  );
}

function ConvergePanel() {
  const [mode, setMode] = useState("ai_adaptive_convergence");
  const [threshold, setThreshold] = useState(0.05);
  const [iterations] = useState(() => {
    const iters: { step: number; div: number; merged: number }[] = [];
    let div = 0.5 + Math.random() * 0.5;
    for (let i = 0; i < 25 && div > threshold; i++) {
      div = Math.max(0.001, div - 0.02 - Math.random() * 0.05);
      iters.push({ step: i + 1, div: +div.toFixed(4), merged: Math.floor(Math.random() * 2) });
    }
    return iters;
  });
  const converged = iterations.length > 0 && iterations[iterations.length - 1].div < threshold;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card title="Convergence Mode">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={mode} onChange={e => setMode(e.target.value)}>
            {CONVERGENCE_MODES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Card>
        <Card title="Threshold">
          <div className="space-y-2">
            <input type="range" min={1} max={50} value={Math.round(threshold * 100)}
              onChange={e => setThreshold(+e.target.value / 100)}
              className="w-full accent-purple-500" />
            <StatRow label="Convergence at" value={`< ${threshold.toFixed(3)}`} />
          </div>
        </Card>
        <Card title="Status">
          <div className={`text-lg font-bold ${converged ? "text-emerald-400" : "text-amber-400"}`}>
            {converged ? "✓ Converged" : "○ In Progress"}
          </div>
          <StatRow label="Iterations" value={iterations.length} />
          <StatRow label="Final divergence" value={iterations.length > 0 ? iterations[iterations.length - 1].div.toFixed(4) : "—"} />
          <StatRow label="Preserve diversity" value="true" />
        </Card>
      </div>

      <Card title="Convergence Trajectory">
        <div className="flex gap-px h-24 items-end">
          {iterations.map((it, i) => (
            <div key={i} className="flex-1 rounded-t transition-all"
              style={{
                height: `${Math.max(4, it.div * 100)}%`,
                backgroundColor: it.div < threshold
                  ? "rgb(16, 185, 129)"
                  : `hsl(${30 + (1 - it.div) * 120}, 70%, 45%)`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">Step 1</span>
          <span className="text-xs text-gray-500">Step {iterations.length}</span>
        </div>
      </Card>
    </div>
  );
}

function DivergePanel() {
  const [metric, setMetric] = useState("ai_semantic_divergence");
  const [nUni] = useState(6);
  const [pairs] = useState(() => genDivergencePairs(nUni));

  return (
    <div className="space-y-4">
      <Card title="Divergence Metric">
        <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
          value={metric} onChange={e => setMetric(e.target.value)}>
          {DIVERGENCE_METRICS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          {metric === "ai_semantic_divergence" ? "AI-learned embedding distance in causal latent space" :
           metric === "kl_divergence" ? "Information-theoretic distance between outcome distributions" :
           metric === "causal_edit_distance" ? "Min edit ops to transform one DAG into another" :
           "Structural/parametric distance metric"}
        </p>
      </Card>

      <Card title="Pairwise Divergence Matrix">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${nUni + 1}, 1fr)` }}>
          <div />{/* corner */}
          {Array.from({ length: nUni }, (_, j) => (
            <div key={`h${j}`} className="text-center text-xs text-gray-500 font-mono">U{j}</div>
          ))}
          {Array.from({ length: nUni }, (_, i) => (
            <>
              <div key={`r${i}`} className="text-xs text-gray-500 font-mono flex items-center justify-end pr-1">U{i}</div>
              {Array.from({ length: nUni }, (_, j) => {
                const pair = pairs.find(p => (p.u1 === i && p.u2 === j) || (p.u1 === j && p.u2 === i));
                const val = i === j ? 0 : pair?.d ?? 0;
                return (
                  <div key={`c${i}_${j}`} className="text-center text-xs font-mono rounded p-1"
                    style={{
                      backgroundColor: i === j ? "transparent" :
                        val > 0.7 ? "rgba(239,68,68,0.3)" :
                        val > 0.3 ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)",
                      color: i === j ? "transparent" : "#e5e7eb",
                    }}>
                    {i === j ? "—" : val.toFixed(2)}
                  </div>
                );
              })}
            </>
          ) as unknown as React.ReactNode}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <Card title="High Divergence">
          <div className="text-2xl font-bold text-red-400">{pairs.filter(p => p.cls === "high").length}</div>
          <p className="text-xs text-gray-500">pairs</p>
        </Card>
        <Card title="Medium Divergence">
          <div className="text-2xl font-bold text-amber-400">{pairs.filter(p => p.cls === "medium").length}</div>
          <p className="text-xs text-gray-500">pairs</p>
        </Card>
        <Card title="Low Divergence">
          <div className="text-2xl font-bold text-emerald-400">{pairs.filter(p => p.cls === "low").length}</div>
          <p className="text-xs text-gray-500">pairs</p>
        </Card>
      </div>
    </div>
  );
}

function InterferePanel() {
  const [topology, setTopology] = useState("entangled_multiverse");
  const [coherence, setCoherence] = useState(0.8);
  const [pairs] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: `IF_${i}`,
      u1: Math.floor(Math.random() * 12),
      u2: Math.floor(Math.random() * 12),
      phase: +(Math.random() * 2 * Math.PI).toFixed(3),
      constructive: Math.random() > 0.5,
      amplitude: +(Math.random() * 0.8).toFixed(3),
    }))
  );
  const constructive = pairs.filter(p => p.constructive);
  const destructive = pairs.filter(p => !p.constructive);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card title="Interference Topology">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={topology} onChange={e => setTopology(e.target.value)}>
            {UNIVERSE_TOPOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Card>
        <Card title="Coherence Level">
          <input type="range" min={10} max={100} value={Math.round(coherence * 100)}
            onChange={e => setCoherence(+e.target.value / 100)}
            className="w-full accent-purple-500 mt-2" />
          <StatRow label="Level" value={coherence.toFixed(2)} />
        </Card>
        <Card title="Summary">
          <StatRow label="Constructive" value={constructive.length} />
          <StatRow label="Destructive" value={destructive.length} />
          <StatRow label="Total pairs" value={pairs.length} />
          <StatRow label="Amplification" value={`${(1 + Math.random() * 2).toFixed(2)}x`} />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Constructive Interference">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {constructive.map((p, i) => (
              <div key={i} className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-800/30 rounded p-2">
                <Badge label={p.id} color="green" />
                <span className="text-xs text-gray-400">U{p.u1}↔U{p.u2}</span>
                <span className="text-xs text-emerald-300 ml-auto">+{p.amplitude.toFixed(3)}</span>
              </div>
            ))}
            {constructive.length === 0 && <p className="text-xs text-gray-500">No constructive pairs</p>}
          </div>
        </Card>
        <Card title="Destructive Interference">
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {destructive.map((p, i) => (
              <div key={i} className="flex items-center gap-2 bg-red-900/20 border border-red-800/30 rounded p-2">
                <Badge label={p.id} color="red" />
                <span className="text-xs text-gray-400">U{p.u1}↔U{p.u2}</span>
                <span className="text-xs text-red-300 ml-auto">−{p.amplitude.toFixed(3)}</span>
              </div>
            ))}
            {destructive.length === 0 && <p className="text-xs text-gray-500">No destructive pairs</p>}
          </div>
        </Card>
      </div>

      <Card title="Interference Landscape">
        <div className="flex gap-px h-16 items-center">
          {Array.from({ length: 40 }, (_, i) => {
            const x = (i / 40) * 2 * Math.PI;
            const y = Math.cos(x) * Math.sin(2 * x) * coherence;
            return (
              <div key={i} className="flex-1 rounded-sm"
                style={{
                  height: `${Math.max(2, Math.abs(y) * 100)}%`,
                  backgroundColor: y > 0
                    ? `rgba(16, 185, 129, ${0.3 + y * 0.7})`
                    : `rgba(239, 68, 68, ${0.3 + Math.abs(y) * 0.7})`,
                  alignSelf: y >= 0 ? "flex-end" : "flex-start",
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-emerald-500">+ constructive</span>
          <span className="text-xs text-red-500">− destructive</span>
        </div>
      </Card>
    </div>
  );
}

function SyncPanel() {
  const [policy, setPolicy] = useState("branching_time");
  const [granularity, setGranularity] = useState("coarse");
  const [conflict, setConflict] = useState("causal_priority");
  const statuses = ["synchronized", "minor_drift", "significant_drift", "desynchronized"];
  const statusColors: Record<string, string> = {
    synchronized: "emerald", minor_drift: "cyan", significant_drift: "amber", desynchronized: "red",
  };
  const universeStatuses = Array.from({ length: 6 }, (_, i) => ({
    id: `U${i}`,
    status: statuses[Math.floor(Math.random() * 4)],
    lag: +(Math.random() * 10).toFixed(2),
    pending: Math.floor(Math.random() * 10),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card title="Timeline Policy">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={policy} onChange={e => setPolicy(e.target.value)}>
            {TIMELINE_POLICIES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </Card>
        <Card title="Sync Granularity">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={granularity} onChange={e => setGranularity(e.target.value)}>
            {["fine", "coarse", "causal_event", "ai_adaptive"].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </Card>
        <Card title="Conflict Resolution">
          <select className="w-full bg-gray-700 text-gray-200 text-sm rounded px-2 py-1.5 border border-gray-600"
            value={conflict} onChange={e => setConflict(e.target.value)}>
            {["first_wins", "causal_priority", "voting", "ai_mediated"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Card>
      </div>

      <Card title="Universe Sync Status">
        <div className="grid grid-cols-3 gap-2">
          {universeStatuses.map((u, i) => (
            <div key={i} className="bg-gray-900/60 border border-gray-700 rounded p-2 space-y-1">
              <div className="flex justify-between items-center">
                <Badge label={u.id} color={statusColors[u.status]} />
                <Badge label={u.status} color={statusColors[u.status]} />
              </div>
              <StatRow label="Sync lag" value={`${u.lag} μs`} />
              <StatRow label="Pending events" value={u.pending} />
              <ProgressBar value={1 - u.lag / 10} color={statusColors[u.status]} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Pre-sync Coherence">
          <div className="text-2xl font-bold text-amber-400">{(0.3 + Math.random() * 0.4).toFixed(3)}</div>
        </Card>
        <Card title="Post-sync Coherence">
          <div className="text-2xl font-bold text-emerald-400">{(0.7 + Math.random() * 0.3).toFixed(3)}</div>
        </Card>
      </div>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="space-y-4">
      <Card title="v1.277 — Causal Multi-Verse Simulation Engine">
        <p className="text-sm text-gray-300 leading-relaxed">
          Multi-verse simulation engine that explores divergent causal trajectories across parallel
          quantum branches. Enables "what-if" analysis at quantum scale — branching universes with
          different initial conditions, intervention strategies, and exogenous shocks — then tracking
          how causal trajectories diverge, interfere, and converge across the multiverse landscape.
        </p>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card title="Enums (6 / 36 values)">
          <div className="space-y-1">
            {[
              ["BranchingStrategy", BRANCHING_STRATEGIES, "blue"],
              ["UniverseTopology", UNIVERSE_TOPOLOGIES, "purple"],
              ["ConvergenceMode", CONVERGENCE_MODES, "green"],
              ["DivergenceMetric", DIVERGENCE_METRICS, "cyan"],
              ["TimelinePolicy", TIMELINE_POLICIES, "orange"],
              ["SimulationDepth", SIMULATION_DEPTHS, "rose"],
            ].map(([name, vals, color]) => (
              <div key={name as string} className="flex items-center gap-2">
                <Badge label={name as string} color={color as string} />
                <span className="text-xs text-gray-500">{(vals as string[]).length} values</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Endpoints (7)">
          <div className="space-y-1">
            {[
              ["POST /branch", "Branch universes", "purple"],
              ["POST /simulate", "Simulate evolution", "blue"],
              ["POST /converge", "Converge trajectories", "green"],
              ["POST /diverge", "Measure divergence", "cyan"],
              ["POST /interfere", "Cross-interference", "orange"],
              ["POST /sync", "Timeline sync", "teal"],
              ["GET /overview", "System overview", "amber"],
            ].map(([ep, desc, color]) => (
              <div key={ep as string} className="flex items-center gap-2">
                <Badge label={ep as string} color={color as string} />
                <span className="text-xs text-gray-400">{desc}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Architecture">
          <div className="space-y-1">
            <StatRow label="Layer" value="29" />
            <StatRow label="Config space" value="46,656" />
            <StatRow label="Sits above" value="v1.276 Quantum Opt" />
            <div className="mt-2 p-2 bg-gray-900/40 rounded text-xs text-gray-400 font-mono leading-relaxed">
              Branch → Simulate → Converge<br />
              → Diverge → Interfere → Sync
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function CausalMultiverseSimulationPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Branch");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Causal Multi-Verse Simulation
            </h1>
            <Badge label="v1.277" color="purple" />
          </div>
          <p className="text-sm text-gray-400">
            Explore divergent causal trajectories across parallel quantum branches — Branch → Simulate → Converge → Diverge → Interfere → Sync
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-4 border-b border-gray-800">
          {TABS.map(tab => (
            <button key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t ${
                activeTab === tab
                  ? "bg-gray-800 text-gray-100 border-b-2 border-purple-500"
                  : "text-gray-500 hover:text-gray-300"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "Branch" && <BranchPanel />}
          {activeTab === "Simulate" && <SimulatePanel />}
          {activeTab === "Converge" && <ConvergePanel />}
          {activeTab === "Diverge" && <DivergePanel />}
          {activeTab === "Interfere" && <InterferePanel />}
          {activeTab === "Sync" && <SyncPanel />}
          {activeTab === "Overview" && <OverviewPanel />}
        </div>
      </div>
    </div>
  );
}
