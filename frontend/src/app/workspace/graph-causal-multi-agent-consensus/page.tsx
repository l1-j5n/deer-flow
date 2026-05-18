"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.265 — Graph Causal Multi-Agent Consensus Engine
   7 tabs: Propose | Vote | Reconcile | Fuse | Verify | Trust | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Propose", "Vote", "Reconcile", "Fuse", "Verify", "Trust", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const CONSENSUS_PROTOCOLS = ["majority_voting","weighted_voting","byzantine_fault_tolerant","raft_consensus","paxos_style","ai_adaptive_consensus"];
const AGENT_ROLES = ["discoverer","validator","skeptic","synthesizer","auditor","ai_orchestrator"];
const CONFLICT_TYPES = ["edge_disagreement","direction_dispute","strength_conflict","structure_clash","scope_mismatch","ai_novel_conflict"];
const RESOLUTION_STRATEGIES = ["evidence_weighing","expert_deference","statistical_fusion","adversarial_debate","empirical_test","ai_meta_resolution"];
const AGGREGATION_METHODS = ["mean_pooling","median_robust","trimmed_mean","bayesian_fusion","evidence_theory","ai_learned_aggregation"];
const TRUST_MODELS = ["reputation_based","accuracy_tracked","calibration_aware","performance_weighted","adversarial_certified","ai_dynamic_trust"];

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

// ─── Tab Panels ───────────────────────────────────────────

function ProposePanel() {
  const [protocol, setProtocol] = useState("weighted_voting");
  const [agents, setAgents] = useState(6);
  const [dimensions, setDimensions] = useState(12);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Consensus Protocol" value={protocol} options={CONSENSUS_PROTOCOLS} onChange={setProtocol} />
        <NumField label="Agent Count" value={agents} min={2} max={50} onChange={setAgents} />
        <NumField label="Proposal Dimensions" value={dimensions} min={1} max={100} onChange={setDimensions} />
      </div>
      <Card title="Multi-Agent Proposal Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Agents" value={agents} color="text-cyan-400" />
          <Metric label="Protocol" value={protocol.replace(/_/g," ").slice(0,14)} color="text-blue-400" />
          <Metric label="Dimensions" value={dimensions} color="text-purple-400" />
          <Metric label="Efficiency" value="0.72" color="text-emerald-400" />
        </div>
        <div className="space-y-2">
          {AGENT_ROLES.slice(0, Math.min(agents, 6)).map((role, i) => (
            <div key={role} className="flex items-center gap-3 bg-gray-900/60 rounded p-2">
              <Badge label={role.replace(/_/g," ")} color={["blue","green","amber","purple","cyan","orange"][i]} />
              <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
                <span>Expertise: {(0.5 + i * 0.08).toFixed(2)}</span>
                <span>Confidence: {(0.4 + i * 0.1).toFixed(2)}</span>
                <span>Acceptance: {(0.35 + i * 0.07).toFixed(2)}</span>
                <span>Proposals: {3 + i * 2}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2 bg-gray-900/40 rounded text-xs text-gray-400">
          <span className="text-gray-300 font-medium">Proposal Rounds:</span>{" "}
          Agents independently propose causal hypotheses through {protocol.replace(/_/g," ")} protocol.
          Each round aggregates perspectives from {agents} agents across {dimensions} causal dimensions,
          producing consensus-weighted proposals with evidence strength scoring.
        </div>
      </Card>
    </div>
  );
}

function VotePanel() {
  const [method, setMethod] = useState("bayesian_fusion");
  const [voters, setVoters] = useState(8);
  const [quorum, setQuorum] = useState(0.6);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Aggregation Method" value={method} options={AGGREGATION_METHODS} onChange={setMethod} />
        <NumField label="Voter Count" value={voters} min={2} max={100} onChange={setVoters} />
        <NumField label="Quorum Threshold" value={quorum} min={0.1} max={1.0} step={0.05} onChange={setQuorum} />
      </div>
      <Card title="Consensus Voting Results">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Approved" value={Math.floor(12)} color="text-emerald-400" />
          <Metric label="Rejected" value={3} color="text-red-400" />
          <Metric label="Pass Rate" value="80%" color="text-blue-400" />
          <Metric label="Avg Margin" value="0.34" color="text-amber-400" />
        </div>
        {["PROP_0001","PROP_0002","PROP_0003"].map((pid, i) => {
          const yes = 5 + i;
          const no = voters - yes - 1;
          const turnout = (yes + no) / voters;
          const approved = yes / (yes + no) > 0.5 && turnout >= quorum;
          return (
            <div key={pid} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={pid} color="blue" />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className={approved ? "text-emerald-400" : "text-red-400"}>
                  {approved ? "✓ Approved" : "✗ Rejected"}
                </span>
                <span>Yes: {yes}</span>
                <span>No: {no}</span>
                <span>Turnout: {turnout.toFixed(2)}</span>
                <span>Margin: {Math.abs(yes - no) / voters}</span>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function ReconcilePanel() {
  const [conflict, setConflict] = useState("edge_disagreement");
  const [strategy, setStrategy] = useState("evidence_weighing");
  const [severity, setSeverity] = useState(0.5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Conflict Type" value={conflict} options={CONFLICT_TYPES} onChange={setConflict} />
        <SelectField label="Resolution Strategy" value={strategy} options={RESOLUTION_STRATEGIES} onChange={setStrategy} />
        <NumField label="Severity" value={severity} min={0} max={1} step={0.05} onChange={setSeverity} />
      </div>
      <Card title="Conflict Reconciliation">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Conflicts" value={Math.ceil(severity * 12)} color="text-red-400" />
          <Metric label="Resolved" value={Math.ceil(severity * 8)} color="text-emerald-400" />
          <Metric label="Agreement" value={(0.5 + severity * 0.3).toFixed(2)} color="text-blue-400" />
          <Metric label="Quality" value={(0.6 + (1 - severity) * 0.2).toFixed(2)} color="text-purple-400" />
        </div>
        {CONFLICT_TYPES.slice(0, 4).map((ct, i) => {
          const mag = (0.15 + i * 0.2) * severity;
          const level = mag > 0.7 ? "critical" : mag > 0.4 ? "high" : mag > 0.2 ? "medium" : "low";
          const colors: Record<string, string> = { critical: "red", high: "amber", medium: "blue", low: "green" };
          return (
            <div key={ct} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={level} color={colors[level]} />
              <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
                <span>{ct.replace(/_/g," ")}</span>
                <span>Magnitude: {mag.toFixed(3)}</span>
                <span>Agents: {2 + i}</span>
                <span>{mag < 0.5 ? "Resolvable" : "Escalation"}</span>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function FusePanel() {
  const [method, setMethod] = useState("bayesian_fusion");
  const [streams, setStreams] = useState(6);
  const [threshold, setThreshold] = useState(0.5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Aggregation Method" value={method} options={AGGREGATION_METHODS} onChange={setMethod} />
        <NumField label="Evidence Streams" value={streams} min={2} max={30} onChange={setStreams} />
        <NumField label="Trust Threshold" value={threshold} min={0} max={1} step={0.05} onChange={setThreshold} />
      </div>
      <Card title="Evidence Fusion Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Streams" value={streams} color="text-cyan-400" />
          <Metric label="Quality" value="0.78" color="text-emerald-400" />
          <Metric label="Consistency" value="0.82" color="text-blue-400" />
          <Metric label="Filtered" value={Math.floor(streams * 0.2)} color="text-amber-400" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: Math.min(streams, 6) }, (_, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-900/60 rounded p-2">
              <Badge label={`Stream ${i}`} color="blue" />
              <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
                <span>Reliability: {(0.5 + i * 0.08).toFixed(2)}</span>
                <span>Trust: {(0.45 + i * 0.09).toFixed(2)}</span>
                <span>Items: {5 + i * 3}</span>
                <span>Weight: {(1 / streams).toFixed(3)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-2 bg-gray-900/40 rounded text-xs text-gray-400">
          <span className="text-gray-300 font-medium">Fusion Pipeline:</span>{" "}
          {streams} evidence streams aggregated via {method.replace(/_/g," ")}.
          Each stream weighted by trust score, filtered below threshold {threshold.toFixed(2)},
          producing a unified causal model with consistency scoring.
        </div>
      </Card>
    </div>
  );
}

function VerifyPanel() {
  const [trust, setTrust] = useState("calibration_aware");
  const [depth, setDepth] = useState(3);
  const [strictness, setStrictness] = useState(0.7);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Trust Model" value={trust} options={TRUST_MODELS} onChange={setTrust} />
        <NumField label="Verification Depth" value={depth} min={1} max={6} onChange={setDepth} />
        <NumField label="Strictness" value={strictness} min={0} max={1} step={0.05} onChange={setStrictness} />
      </div>
      <Card title="Consensus Verification">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Passed" value={Math.floor(18)} color="text-emerald-400" />
          <Metric label="Failed" value={4} color="text-red-400" />
          <Metric label="Pass Rate" value="82%" color="text-blue-400" />
          <Metric label="Integrity" value="0.81" color="text-purple-400" />
        </div>
        {["CLAIM_0001","CLAIM_0002","CLAIM_0003"].map((cid, i) => {
          const accuracy = 0.65 + i * 0.1;
          const passes = accuracy >= strictness;
          return (
            <div key={cid} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={passes ? "PASS" : "FAIL"} color={passes ? "green" : "red"} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span>{cid}</span>
                <span>Accuracy: {accuracy.toFixed(3)}</span>
                <span>Depth: {1 + i}</span>
                <span>Repro: {(0.6 + i * 0.12).toFixed(3)}</span>
                <span>Agree: {5 + i}/8 agents</span>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function TrustPanel() {
  const [model, setModel] = useState("ai_dynamic_trust");
  const [history, setHistory] = useState(10);
  const [decay, setDecay] = useState(0.1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Trust Model" value={model} options={TRUST_MODELS} onChange={setModel} />
        <NumField label="History Length" value={history} min={1} max={100} onChange={setHistory} />
        <NumField label="Decay Factor" value={decay} min={0} max={1} step={0.05} onChange={setDecay} />
      </div>
      <Card title="Trust Dynamics">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="High Trust" value={6} color="text-emerald-400" />
          <Metric label="Low Trust" value={1} color="text-red-400" />
          <Metric label="Avg Trust" value="0.72" color="text-blue-400" />
          <Metric label="Stability" value="0.84" color="text-purple-400" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, i) => {
            const trust_val = 0.4 + i * 0.1;
            const grade = trust_val > 0.8 ? "A" : trust_val > 0.6 ? "B" : trust_val > 0.4 ? "C" : "D";
            const gradeColors: Record<string, string> = { A: "green", B: "blue", C: "amber", D: "red" };
            return (
              <div key={i} className="flex items-center gap-3 bg-gray-900/60 rounded p-2">
                <Badge label={`Grade ${grade}`} color={gradeColors[grade]} />
                <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
                  <span>Agent {i:03d}</span>
                  <span>Trust: {trust_val.toFixed(3)}</span>
                  <span>Accuracy: {(0.5 + i * 0.07).toFixed(3)}</span>
                  <span>Participation: {(0.6 + i * 0.06).toFixed(3)}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Trust Evolution Chart (simplified) */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-1">Trust Evolution Over Epochs</div>
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 10 }, (_, i) => {
              const h = 30 + i * 4 + Math.sin(i * 0.5) * 8;
              return (
                <div
                  key={i}
                  className="flex-1 bg-blue-600/60 rounded-t"
                  style={{ height: `${h}%` }}
                  title={`Epoch ${i + 1}: ${(0.5 + i * 0.025).toFixed(3)}`}
                />
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="space-y-4">
      <Card title="v1.265 — Multi-Agent Consensus Engine Overview">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-900/40 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Enums (6 × 6 values)</div>
            {[
              ["ConsensusProtocol", CONSENSUS_PROTOCOLS],
              ["AgentRole", AGENT_ROLES],
              ["ConflictType", CONFLICT_TYPES],
              ["ResolutionStrategy", RESOLUTION_STRATEGIES],
              ["AggregationMethod", AGGREGATION_METHODS],
              ["TrustModel", TRUST_MODELS],
            ].map(([name, vals]) => (
              <div key={name} className="mb-2">
                <div className="text-xs text-cyan-400 font-mono">{name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {vals.map((v) => (
                    <Badge key={v} label={v.replace(/_/g," ")} color="blue" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-900/40 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Endpoints (7)</div>
            {[
              ["POST", "/graph/causal-consensus/propose", "Multi-agent proposal"],
              ["POST", "/graph/causal-consensus/vote", "Consensus voting"],
              ["POST", "/graph/causal-consensus/reconcile", "Conflict reconciliation"],
              ["POST", "/graph/causal-consensus/fuse", "Evidence fusion"],
              ["POST", "/graph/causal-consensus/verify", "Consensus verification"],
              ["POST", "/graph/causal-consensus/trust", "Trust dynamics"],
              ["GET", "/graph/causal-consensus/overview", "System overview"],
            ].map(([method, path, desc]) => (
              <div key={path} className="mb-2 text-xs">
                <span className={method === "POST" ? "text-amber-400" : "text-emerald-400"}>{method}</span>
                <span className="text-gray-300 font-mono ml-2">{path}</span>
                <span className="text-gray-500 ml-2">— {desc}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900/40 rounded p-3">
          <div className="text-xs text-gray-500 mb-2">Architecture Layer</div>
          <div className="text-xs font-mono text-gray-300 space-y-0.5">
            <div className="text-purple-400">Multi-Agent Consensus (v1.265):</div>
            <div className="pl-4">Propose → Vote → Reconcile → Fuse → Verify → Trust</div>
            <div className="text-gray-500 mt-2">↑ Built on Real-time Streaming (v1.264)</div>
            <div className="text-gray-600 pl-4">Ingest → Window → Update → Monitor → Checkpoint → Replay</div>
          </div>
        </div>
      </Card>
      <Card title="Pipeline Integration">
        <div className="text-xs font-mono space-y-0.5 text-gray-400">
          <div><span className="text-blue-400">Causal Pipeline</span> (11 stages, v1.249–v1.259)</div>
          <div><span className="text-teal-400">Meta-Cognitive</span> (v1.260) → Reflect/Strategize/Self-Model/Introspect/Meta-Learn/Debias</div>
          <div><span className="text-amber-400">Emergence</span> (v1.261) → Detect/Analyze/Decompose/Simulate/Quantify/Evolve</div>
          <div><span className="text-red-400">Governance</span> (v1.262) → Audit/Comply/Trace/Govern/Report/Certify</div>
          <div><span className="text-cyan-400">Transfer</span> (v1.263) → Map/Transfer/Adapt/Drift/Validate/Synthesize</div>
          <div><span className="text-green-400">Streaming</span> (v1.264) → Ingest/Window/Update/Monitor/Checkpoint/Replay</div>
          <div><span className="text-purple-400">Consensus</span> (v1.265) → Propose/Vote/Reconcile/Fuse/Verify/Trust</div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

const PANELS: Record<Tab, React.FC> = {
  Propose: ProposePanel,
  Vote: VotePanel,
  Reconcile: ReconcilePanel,
  Fuse: FusePanel,
  Verify: VerifyPanel,
  Trust: TrustPanel,
  Overview: OverviewPanel,
};

export default function GraphCausalMultiAgentConsensusPage() {
  const [tab, setTab] = useState<Tab>("Propose");
  const Panel = PANELS[tab];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-100">
            Graph Causal Multi-Agent Consensus Engine
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            v1.265 — Distributed causal reasoning with consensus protocols, conflict resolution, evidence fusion &amp; trust dynamics
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors ${
                tab === t
                  ? "bg-purple-900/50 text-purple-300 border-purple-700"
                  : "bg-gray-800/30 text-gray-400 border-gray-700 hover:text-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <Panel />
      </div>
    </div>
  );
}
