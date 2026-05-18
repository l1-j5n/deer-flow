"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.266 — Graph Causal Resilience & Fault Tolerance Engine
   7 tabs: StressTest | FaultInject | Degrade | Recover | Redundancy | Harden | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["StressTest", "FaultInject", "Degrade", "Recover", "Redundancy", "Harden", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const STRESS_TYPES = ["adversarial_perturbation","data_corruption","concept_drift","resource_exhaustion","cascading_failure","ai_hybrid_stress"];
const FAULT_CATEGORIES = ["node_failure","edge_corruption","model_degradation","communication_fault","data_poisoning","ai_composite_fault"];
const DEGRADATION_LEVELS = ["minimal","moderate","severe","critical","catastrophic","ai_adaptive_degradation"];
const RECOVERY_STRATEGIES = ["rollback","checkpoint_restore","redundant_failover","graceful_degradation","self_repair","ai_autonomous_recovery"];
const REDUNDANCY_TYPES = ["active_active","active_passive","n_plus_one","consensus_replication","erasure_coding","ai_dynamic_redundancy"];
const HARDENING_METHODS = ["adversarial_training","input_sanitization","robust_optimization","certified_defense","ensemble_shielding","ai_meta_hardening"];

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

function StressTestPanel() {
  const [stressType, setStressType] = useState("adversarial_perturbation");
  const [intensity, setIntensity] = useState(0.5);
  const [steps, setSteps] = useState(10);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Stress Type" value={stressType} options={STRESS_TYPES} onChange={setStressType} />
        <NumField label="Intensity" value={intensity} min={0} max={1} step={0.05} onChange={setIntensity} />
        <NumField label="Duration Steps" value={steps} min={5} max={50} onChange={setSteps} />
      </div>
      <Card title="Stress Test Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Robustness" value={(0.95 - intensity * 0.4).toFixed(2)} color="text-cyan-400" />
          <Metric label="Withstand %" value={`${Math.round((1 - intensity * 0.6) * 100)}%`} color="text-emerald-400" />
          <Metric label="Avg Resilience" value={(0.9 - intensity * 0.3).toFixed(2)} color="text-blue-400" />
          <Metric label="MTTR (s)" value={(intensity * 15).toFixed(1)} color="text-amber-400" />
        </div>
        <div className="space-y-2">
          {["discovery_engine", "consensus_engine", "streaming_engine", "meta_cognitive_engine"].map((comp, i) => {
            const baseline = 0.85 + i * 0.03;
            const stressed = Math.max(0.2, baseline - intensity * (0.2 + i * 0.1));
            const degradation = ((baseline - stressed) / baseline * 100).toFixed(1);
            return (
              <div key={comp} className="flex items-center gap-3 bg-gray-900/60 rounded p-2">
                <Badge label={comp.replace(/_/g, " ")} color={["blue", "green", "amber", "purple"][i]} />
                <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
                  <span>Baseline: {baseline.toFixed(3)}</span>
                  <span>Stressed: {stressed.toFixed(3)}</span>
                  <span>↓ {degradation}%</span>
                  <span>Recovery: {(intensity * (3 + i * 2)).toFixed(1)}s</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Stress timeline bar chart */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-1">Stress Load vs System Performance</div>
          <div className="flex items-end gap-0.5 h-20">
            {Array.from({ length: Math.min(steps, 20) }, (_, i) => {
              const progress = i / Math.max(steps - 1, 1);
              const load = intensity * (0.5 + 0.5 * Math.sin(progress * Math.PI));
              const perf = Math.max(0.2, 1 - load * 0.6);
              return (
                <div key={i} className="flex-1 flex flex-col gap-0.5">
                  <div
                    className="bg-red-600/50 rounded-t"
                    style={{ height: `${load * 80}px` }}
                    title={`Load: ${load.toFixed(3)}`}
                  />
                  <div
                    className="bg-emerald-600/50 rounded-b"
                    style={{ height: `${perf * 60}px` }}
                    title={`Perf: ${perf.toFixed(3)}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Load (red) / Performance (green)</span>
            <span>Step 1 → {steps}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function FaultInjectPanel() {
  const [fault, setFault] = useState("node_failure");
  const [injectCount, setInjectCount] = useState(6);
  const [propDepth, setPropDepth] = useState(3);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Fault Category" value={fault} options={FAULT_CATEGORIES} onChange={setFault} />
        <NumField label="Injection Count" value={injectCount} min={1} max={30} onChange={setInjectCount} />
        <NumField label="Propagation Depth" value={propDepth} min={1} max={10} onChange={setPropDepth} />
      </div>
      <Card title="Fault Injection & Propagation">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Injected" value={injectCount} color="text-red-400" />
          <Metric label="Contained" value={Math.floor(injectCount * 0.7)} color="text-emerald-400" />
          <Metric label="Escaped" value={Math.ceil(injectCount * 0.3)} color="text-amber-400" />
          <Metric label="Blast Radius" value={propDepth * 2} color="text-purple-400" />
        </div>
        {["INJECT_0001", "INJECT_0002", "INJECT_0003"].map((id, i) => {
          const mag = 0.3 + i * 0.25;
          const severity = mag > 0.8 ? "critical" : mag > 0.5 ? "high" : mag > 0.3 ? "medium" : "low";
          const sevColors: Record<string, string> = { critical: "red", high: "amber", medium: "blue", low: "green" };
          const contained = i < 2;
          return (
            <div key={id} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={severity} color={sevColors[severity]} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span>{id}</span>
                <span>Magnitude: {mag.toFixed(3)}</span>
                <span>Blast: {1 + i * 2} nodes</span>
                <span>Delay: {(0.1 + i * 0.5).toFixed(2)}s</span>
                <span className={contained ? "text-emerald-400" : "text-red-400"}>
                  {contained ? "✓ Contained" : "✗ Escaped"}
                </span>
              </div>
            </div>
          );
        })}
        <div className="mt-3 p-2 bg-gray-900/40 rounded text-xs text-gray-400">
          <span className="text-gray-300 font-medium">Propagation Trace:</span>{" "}
          {injectCount} {fault.replace(/_/g, " ")} faults injected across {propDepth} depth levels.
          System health drops to {Math.max(20, 100 - injectCount * 8)}% at peak stress,
          with containment effectiveness of {(70 - propDepth * 3).toFixed(0)}%.
        </div>
      </Card>
    </div>
  );
}

function DegradePanel() {
  const [level, setLevel] = useState("moderate");
  const [affectedRatio, setAffectedRatio] = useState(0.3);
  const [adaptSteps, setAdaptSteps] = useState(8);

  const severityMap: Record<string, number> = {
    minimal: 0.1, moderate: 0.3, severe: 0.5,
    critical: 0.7, catastrophic: 0.9, ai_adaptive_degradation: 0.4,
  };
  const sev = severityMap[level] ?? 0.3;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Degradation Level" value={level} options={DEGRADATION_LEVELS} onChange={setLevel} />
        <NumField label="Affected Ratio" value={affectedRatio} min={0} max={1} step={0.05} onChange={setAffectedRatio} />
        <NumField label="Adaptation Steps" value={adaptSteps} min={3} max={20} onChange={setAdaptSteps} />
      </div>
      <Card title="Graceful Degradation Analysis">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Health" value={`${Math.round(100 - sev * affectedRatio * 100)}%`} color="text-cyan-400" />
          <Metric label="Functional" value={`${Math.round(12 * (1 - affectedRatio * sev))}`} color="text-emerald-400" />
          <Metric label="QoS" value={(1 - sev * 0.5).toFixed(2)} color="text-blue-400" />
          <Metric label="Continuity" value={(1 - affectedRatio * sev * 0.5).toFixed(2)} color="text-purple-400" />
        </div>
        <div className="space-y-2">
          {["causal_discovery", "causal_inference", "consensus_manager", "stream_processor"].map((sub, i) => {
            const health = Math.max(0.2, 1 - sev * (0.3 + i * 0.1) * affectedRatio);
            const affected = Math.random() < affectedRatio;
            const fallback = ["reduced_accuracy", "cached_results", "simplified_model", "batch_only"][i];
            return (
              <div key={sub} className="flex items-center gap-3 bg-gray-900/60 rounded p-2">
                <Badge label={affected ? "AFFECTED" : "OK"} color={affected ? "red" : "green"} />
                <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
                  <span>{sub.replace(/_/g, " ")}</span>
                  <span>Health: {health.toFixed(3)}</span>
                  <span>Fallback: {fallback.replace(/_/g, " ")}</span>
                  <span>Grade: {health > 0.8 ? "A" : health > 0.6 ? "B" : health > 0.4 ? "C" : "D"}</span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Degradation adaptation chart */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-1">Adaptation Progress</div>
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: adaptSteps }, (_, i) => {
              const progress = i / Math.max(adaptSteps - 1, 1);
              const healthPct = Math.min(100, (100 - sev * affectedRatio * 100) + progress * sev * affectedRatio * 60);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${healthPct * 0.7}%`,
                    backgroundColor: healthPct > 70 ? "#059669" : healthPct > 40 ? "#d97706" : "#dc2626",
                    opacity: 0.6 + progress * 0.4,
                  }}
                  title={`Step ${i + 1}: ${healthPct.toFixed(1)}% health`}
                />
              );
            })}
          </div>
          <div className="text-xs text-gray-500 text-right mt-1">Steps → Recovery</div>
        </div>
      </Card>
    </div>
  );
}

function RecoverPanel() {
  const [strategy, setStrategy] = useState("self_repair");
  const [scope, setScope] = useState(0.3);
  const [budget, setBudget] = useState(60);

  const affectedSvcs = Math.max(1, Math.floor(scope * 20));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Recovery Strategy" value={strategy} options={RECOVERY_STRATEGIES} onChange={setStrategy} />
        <NumField label="Failure Scope" value={scope} min={0} max={1} step={0.05} onChange={setScope} />
        <NumField label="Budget (s)" value={budget} min={1} max={600} onChange={setBudget} />
      </div>
      <Card title="Recovery Orchestration">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Affected" value={affectedSvcs} color="text-red-400" />
          <Metric label="Recovered" value={Math.floor(affectedSvcs * 0.9)} color="text-emerald-400" />
          <Metric label="RTO Met" value={scope < 0.7 ? "✓" : "✗"} color={scope < 0.7 ? "text-emerald-400" : "text-red-400"} />
          <Metric label="Data Integrity" value={(0.95 - scope * 0.1).toFixed(2)} color="text-blue-400" />
        </div>
        {/* Recovery phases */}
        {["Assessment", "Isolation", "Stabilization", "Restoration", "Verification"].map((phase, i) => {
          const phaseRecovered = Math.min(affectedSvcs, Math.ceil((i + 1) / 5 * affectedSvcs * 0.9));
          const accuracy = 0.3 + 0.7 * (phaseRecovered / Math.max(affectedSvcs, 1));
          return (
            <div key={phase} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`Phase ${i + 1}`} color="blue" />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{phase}</span>
                <span>Recovered: {phaseRecovered}/{affectedSvcs}</span>
                <span>Accuracy: {accuracy.toFixed(3)}</span>
                <span>Duration: {(budget / 5 * (0.5 + i * 0.1)).toFixed(1)}s</span>
                <span>Data loss: {Math.max(0, scope * (1 - phaseRecovered / Math.max(affectedSvcs, 1)) * 10).toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
        <div className="mt-3 p-2 bg-gray-900/40 rounded text-xs text-gray-400">
          <span className="text-gray-300 font-medium">Recovery Pipeline:</span>{" "}
          {strategy.replace(/_/g, " ")} strategy with {affectedSvcs} affected services.
          Estimated total recovery: {(budget * 0.7).toFixed(1)}s / {budget}s budget.
          Final causal accuracy restored to {(0.3 + 0.7 * 0.9).toFixed(2)}.
        </div>
      </Card>
    </div>
  );
}

function RedundancyPanel() {
  const [redType, setRedType] = useState("active_passive");
  const [replicas, setReplicas] = useState(3);
  const [consistency, setConsistency] = useState(0.9);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Redundancy Type" value={redType} options={REDUNDANCY_TYPES} onChange={setRedType} />
        <NumField label="Replica Count" value={replicas} min={2} max={10} onChange={setReplicas} />
        <NumField label="Consistency Level" value={consistency} min={0.5} max={1} step={0.05} onChange={setConsistency} />
      </div>
      <Card title="Redundancy Management">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Replicas" value={replicas} color="text-cyan-400" />
          <Metric label="Health" value="94.2%" color="text-emerald-400" />
          <Metric label="Failover" value="0.87" color="text-blue-400" />
          <Metric label="Availability" value={`${Math.min(99.9, 95 + replicas * 1.5).toFixed(1)}%`} color="text-purple-400" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: Math.min(replicas, 6) }, (_, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-900/60 rounded p-2">
              <Badge label={i === 0 ? "PRIMARY" : "STANDBY"} color={i === 0 ? "green" : "blue"} />
              <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
                <span>Health: {(0.85 + i * 0.02).toFixed(3)}</span>
                <span>Sync lag: {(i * 2.5).toFixed(1)}ms</span>
                <span>Load: {i === 0 ? "85%" : `${Math.round(20 + i * 5)}%`}</span>
                <span>Failover: {(0.8 + i * 0.03).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Sync consistency bar */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-1">Replica Sync Consistency</div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-emerald-600 h-3 rounded-full"
              style={{ width: `${consistency * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Target: {(consistency * 100).toFixed(0)}%</span>
            <span>Current: {Math.min(100, consistency * 100 + 2).toFixed(0)}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function HardenPanel() {
  const [method, setMethod] = useState("adversarial_training");
  const [attackSurface, setAttackSurface] = useState(0.3);
  const [defLayers, setDefLayers] = useState(4);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Hardening Method" value={method} options={HARDENING_METHODS} onChange={setMethod} />
        <NumField label="Attack Surface" value={attackSurface} min={0} max={1} step={0.05} onChange={setAttackSurface} />
        <NumField label="Defense Layers" value={defLayers} min={1} max={8} onChange={setDefLayers} />
      </div>
      <Card title="Adversarial Hardening">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Security" value={(0.95 - attackSurface * 0.2).toFixed(2)} color="text-cyan-400" />
          <Metric label="Defense ↑" value={`${Math.round(15 + (1 - attackSurface) * 25)}%`} color="text-emerald-400" />
          <Metric label="Residual" value={(attackSurface * 0.3).toFixed(2)} color="text-amber-400" />
          <Metric label="Overhead" value={`${(defLayers * 2).toFixed(0)}%`} color="text-red-400" />
        </div>
        {/* Attack vectors */}
        {["causal_edge_injection", "trust_exploitation", "consensus_subversion", "data_poisoning"].map((atk, i) => {
          const base = 0.5 + i * 0.08;
          const hardened = Math.min(1.0, base + 0.15);
          const improvement = ((hardened - base) / base * 100).toFixed(1);
          return (
            <div key={atk} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`ATK_${(i + 1).toString().padStart(4, "0")}`} color="red" />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span>{atk.replace(/_/g, " ")}</span>
                <span>Base: {base.toFixed(3)}</span>
                <span>Hardened: {hardened.toFixed(3)}</span>
                <span className="text-emerald-400">↑ {improvement}%</span>
                <span>Residual: {(1 - hardened).toFixed(3)}</span>
              </div>
            </div>
          );
        })}
        {/* Defense layers */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Defense Layers ({defLayers} active)</div>
          <div className="space-y-1">
            {["Input Sanitization", "Schema Validation", "Anomaly Detection", "Behavioral Analysis", "Trust Verification", "Consensus Integrity", "Model Certification", "Output Validation"].slice(0, defLayers).map((layer, i) => (
              <div key={layer} className="flex items-center gap-2 text-xs">
                <span className="text-emerald-400">■</span>
                <span className="text-gray-300">{layer}</span>
                <span className="text-gray-500 ml-auto">Coverage: {(85 + i * 2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="space-y-4">
      <Card title="v1.266 — Resilience & Fault Tolerance Engine Overview">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-900/40 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Enums (6 × 6 values)</div>
            {[
              ["StressType", STRESS_TYPES],
              ["FaultCategory", FAULT_CATEGORIES],
              ["DegradationLevel", DEGRADATION_LEVELS],
              ["RecoveryStrategy", RECOVERY_STRATEGIES],
              ["RedundancyType", REDUNDANCY_TYPES],
              ["HardeningMethod", HARDENING_METHODS],
            ].map(([name, vals]) => (
              <div key={name} className="mb-2">
                <div className="text-xs text-cyan-400 font-mono">{name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {vals.map((v) => (
                    <Badge key={v} label={v.replace(/_/g, " ")} color="blue" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-900/40 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Endpoints (7)</div>
            {[
              ["POST", "/graph/causal-resilience/stress-test", "Stress testing"],
              ["POST", "/graph/causal-resilience/fault-inject", "Fault injection"],
              ["POST", "/graph/causal-resilience/degrade", "Degradation analysis"],
              ["POST", "/graph/causal-resilience/recover", "Recovery orchestration"],
              ["POST", "/graph/causal-resilience/redundancy", "Redundancy management"],
              ["POST", "/graph/causal-resilience/harden", "Adversarial hardening"],
              ["GET", "/graph/causal-resilience/overview", "System overview"],
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
            <div className="text-red-400">Resilience & Fault Tolerance (v1.266):</div>
            <div className="pl-4">StressTest → FaultInject → Degrade → Recover → Redundancy → Harden</div>
            <div className="text-gray-500 mt-2">↑ Built on Multi-Agent Consensus (v1.265)</div>
            <div className="text-gray-600 pl-4">Propose → Vote → Reconcile → Fuse → Verify → Trust</div>
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
          <div><span className="text-rose-400">Resilience</span> (v1.266) → StressTest/FaultInject/Degrade/Recover/Redundancy/Harden</div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

const PANELS: Record<Tab, React.FC> = {
  StressTest: StressTestPanel,
  FaultInject: FaultInjectPanel,
  Degrade: DegradePanel,
  Recover: RecoverPanel,
  Redundancy: RedundancyPanel,
  Harden: HardenPanel,
  Overview: OverviewPanel,
};

export default function GraphCausalResiliencePage() {
  const [tab, setTab] = useState<Tab>("StressTest");
  const Panel = PANELS[tab];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-100">
            Graph Causal Resilience & Fault Tolerance Engine
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            v1.266 — Stress testing, fault injection, graceful degradation, recovery orchestration, redundancy &amp; adversarial hardening
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
                  ? "bg-red-900/50 text-red-300 border-red-700"
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
