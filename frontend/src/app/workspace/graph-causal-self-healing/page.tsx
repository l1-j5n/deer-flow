"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.269 — Causal Self-Healing & Auto-Recovery Engine
   7 tabs: Diagnose | Repair | Recover | Monitor | Prevent | Validate | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Diagnose", "Repair", "Recover", "Monitor", "Prevent", "Validate", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const HEALING_MODES = ["diagnostic_scan","consistency_repair","structural_restoration","semantic_reconciliation","proactive_maintenance","ai_autonomous_healing"];
const ANOMALY_TYPES = ["structural_anomaly","semantic_anomaly","temporal_anomaly","causal_anomaly","evidence_anomaly","ai_emergent_anomaly"];
const REPAIR_STRATEGIES = ["local_patch","regional_rebuild","global_restructure","incremental_fix","rollback_restore","ai_adaptive_repair"];
const HEALTH_DOMAINS = ["graph_integrity","causal_consistency","temporal_coherence","evidence_completeness","semantic_alignment","ai_holistic_health"];
const RECOVERY_LEVELS = ["minimal_recovery","partial_recovery","full_recovery","enhanced_recovery","preventive_hardening","ai_optimal_recovery"];
const DIAGNOSIS_DEPTHS = ["surface_scan","standard_diagnosis","deep_analysis","root_cause_trace","comprehensive_audit","ai_predictive_diagnosis"];

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

function DiagnosePanel() {
  const [mode, setMode] = useState("diagnostic_scan");
  const [anomaly, setAnomaly] = useState("causal_anomaly");
  const [depth, setDepth] = useState("standard_diagnosis");

  const depthCoverage: Record<string, number> = {
    surface_scan: 0.3, standard_diagnosis: 0.5, deep_analysis: 0.7,
    root_cause_trace: 0.85, comprehensive_audit: 0.95, ai_predictive_diagnosis: 0.8,
  };
  const anomalyRate: Record<string, number> = {
    structural_anomaly: 0.03, semantic_anomaly: 0.05, temporal_anomaly: 0.04,
    causal_anomaly: 0.02, evidence_anomaly: 0.06, ai_emergent_anomaly: 0.01,
  };
  const coverage = depthCoverage[depth] ?? 0.5;
  const rate = anomalyRate[anomaly] ?? 0.03;
  const anomaliesFound = Math.round(100000 * coverage * rate);
  const healthScore = Math.max(0.3, 1 - anomaliesFound * 0.0005);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Healing Mode" value={mode} options={HEALING_MODES} onChange={setMode} />
        <SelectField label="Anomaly Type" value={anomaly} options={ANOMALY_TYPES} onChange={setAnomaly} />
        <SelectField label="Diagnosis Depth" value={depth} options={DIAGNOSIS_DEPTHS} onChange={setDepth} />
      </div>
      <Card title="Diagnostic Scan Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Coverage" value={`${(coverage * 100).toFixed(0)}%`} color="text-cyan-400" />
          <Metric label="Anomalies" value={anomaliesFound} color="text-amber-400" />
          <Metric label="Health Score" value={healthScore.toFixed(3)} color={healthScore > 0.85 ? "text-emerald-400" : "text-red-400"} />
          <Metric label="Scan Depth" value={depth.replace(/_/g, " ")} color="text-purple-400" />
        </div>
        {/* Scan phases */}
        {["Initial Scan", "Deep Inspection", "Anomaly Classification", "Root Cause Analysis", "Impact Assessment", "Priority Ranking"].map((phase, i) => {
          const detected = Math.round(anomaliesFound * (0.1 + i * 0.15));
          const confidence = 0.75 + i * 0.04;
          return (
            <div key={phase} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`P${i + 1}`} color={["blue", "green", "amber", "purple", "cyan", "teal"][i]} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{phase}</span>
                <span>Detected: {detected}</span>
                <span>Confidence: {confidence.toFixed(3)}</span>
                <span>Time: {Math.round(50 + i * 300)}ms</span>
                <span>Nodes: {Math.round(10000 * coverage * (0.3 + i * 0.12)).toLocaleString()}</span>
              </div>
              <div className="w-16 bg-gray-700 rounded-full h-1.5">
                <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${(i + 1) / 6 * 100}%` }} />
              </div>
            </div>
          );
        })}
        {/* Domain health */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Domain Health Scores</div>
          <div className="space-y-1">
            {[
              { name: "Graph Integrity", score: 0.92 },
              { name: "Causal Consistency", score: 0.88 },
              { name: "Temporal Coherence", score: 0.85 },
              { name: "Evidence Completeness", score: 0.91 },
              { name: "Semantic Alignment", score: 0.87 },
              { name: "Holistic Health", score: healthScore },
            ].map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-36">{d.name}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                  <div className={`${d.score > 0.9 ? "bg-emerald-600" : d.score > 0.8 ? "bg-cyan-600" : "bg-amber-600"} h-1.5 rounded-full`} style={{ width: `${d.score * 100}%` }} />
                </div>
                <span className="text-gray-500 w-10 text-right">{d.score.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function RepairPanel() {
  const [strategy, setStrategy] = useState("ai_adaptive_repair");
  const [anomaly, setAnomaly] = useState("causal_anomaly");
  const [threshold, setThreshold] = useState(0.3);

  const strategyPower: Record<string, number> = {
    local_patch: 0.6, regional_rebuild: 0.75, global_restructure: 0.9,
    incremental_fix: 0.55, rollback_restore: 0.85, ai_adaptive_repair: 0.8,
  };
  const power = strategyPower[strategy] ?? 0.6;
  const preHealth = 0.65 + threshold * 0.15;
  const effectiveness = power * (0.8 + threshold * 0.2);
  const postHealth = Math.min(0.99, preHealth + effectiveness * 0.12);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Repair Strategy" value={strategy} options={REPAIR_STRATEGIES} onChange={setStrategy} />
        <SelectField label="Anomaly Type" value={anomaly} options={ANOMALY_TYPES} onChange={setAnomaly} />
        <NumField label="Severity Threshold" value={threshold} min={0.05} max={0.9} step={0.05} onChange={setThreshold} />
      </div>
      <Card title="Targeted Repair Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Strategy Power" value={power.toFixed(2)} color="text-cyan-400" />
          <Metric label="Effectiveness" value={effectiveness.toFixed(3)} color="text-emerald-400" />
          <Metric label="Pre-Health" value={preHealth.toFixed(3)} color="text-amber-400" />
          <Metric label="Post-Health" value={postHealth.toFixed(3)} color="text-blue-400" />
        </div>
        {/* Repair operations */}
        {[
          { name: "Node Reconnection", factor: 0.9 },
          { name: "Edge Weight Correction", factor: 0.85 },
          { name: "Chain Restoration", factor: 0.8 },
          { name: "Evidence Gap Fill", factor: 0.75 },
          { name: "Temporal Reorder", factor: 0.88 },
          { name: "Confidence Recalibration", factor: 0.92 },
        ].map((op, i) => {
          const success = power * op.factor;
          return (
            <div key={op.name} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`OP${i + 1}`} color={["blue", "green", "amber", "purple", "cyan", "teal"][i]} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{op.name}</span>
                <span>Success: {(success * 100).toFixed(0)}%</span>
                <span>Affected: {Math.round(5 + i * 15)}</span>
                <span>Time: {Math.round(50 + i * 200)}ms</span>
                <Badge label={success > 0.8 ? "optimal" : "adequate"} color={success > 0.8 ? "green" : "amber"} />
              </div>
              <div className="w-16 bg-gray-700 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${success * 100}%` }} />
              </div>
            </div>
          );
        })}
        {/* Health comparison */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Health Improvement</div>
          <div className="flex items-end gap-2 h-20">
            <div className="flex-1">
              <div className="bg-amber-600/60 rounded-t h-full" style={{ height: `${preHealth * 100}%` }} title="Pre-repair" />
              <div className="text-xs text-gray-500 text-center mt-1">Pre</div>
            </div>
            <div className="flex-1">
              <div className="bg-emerald-600/60 rounded-t" style={{ height: `${postHealth * 100}%` }} title="Post-repair" />
              <div className="text-xs text-gray-500 text-center mt-1">Post</div>
            </div>
            <div className="flex-1">
              <div className="bg-cyan-600/60 rounded-t" style={{ height: `${effectiveness * 100}%` }} title="Effectiveness" />
              <div className="text-xs text-gray-500 text-center mt-1">Effect.</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 text-right mt-1">+{((postHealth - preHealth) * 100).toFixed(1)}% improvement</div>
        </div>
      </Card>
    </div>
  );
}

function RecoverPanel() {
  const [level, setLevel] = useState("full_recovery");
  const [targetHealth, setTargetHealth] = useState(0.95);

  const levelIntensity: Record<string, number> = {
    minimal_recovery: 0.3, partial_recovery: 0.5, full_recovery: 0.7,
    enhanced_recovery: 0.85, preventive_hardening: 0.95, ai_optimal_recovery: 0.8,
  };
  const intensity = levelIntensity[level] ?? 0.5;
  const currentHealth = 0.55;
  const achievable = Math.min(0.99, currentHealth + (1 - currentHealth) * intensity * 0.9);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Recovery Level" value={level} options={RECOVERY_LEVELS} onChange={setLevel} />
        <NumField label="Target Health" value={targetHealth} min={0.5} max={0.99} step={0.01} onChange={setTargetHealth} />
      </div>
      <Card title="Full Recovery Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Intensity" value={`${(intensity * 100).toFixed(0)}%`} color="text-cyan-400" />
          <Metric label="Current" value={currentHealth.toFixed(2)} color="text-red-400" />
          <Metric label="Achievable" value={achievable.toFixed(3)} color="text-emerald-400" />
          <Metric label="Target" value={targetHealth.toFixed(2)} color="text-blue-400" />
        </div>
        {/* Recovery stages */}
        {["Damage Assessment", "Backup Creation", "Isolation & Quarantine", "Structural Recovery", "Semantic Recovery", "Temporal Recovery", "Evidence Recovery", "Validation Testing", "Gradual Reintegration"].slice(0, 5 + Math.round(intensity * 4)).map((stage, i) => {
          const contribution = 0.02 + i * 0.008;
          const successRate = 0.92 + i * 0.008;
          return (
            <div key={stage} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`S${i + 1}`} color={["blue", "green", "amber", "purple", "cyan", "teal", "orange", "rose", "red"][i]} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{stage}</span>
                <span>Contribution: +{(contribution * 100).toFixed(1)}%</span>
                <span>Success: {(successRate * 100).toFixed(1)}%</span>
                <span>Elements: {Math.round(100 + i * 2000).toLocaleString()}</span>
                <span>Time: {Math.round(100 + i * 800)}ms</span>
              </div>
              <div className="w-16 bg-gray-700 rounded-full h-1.5">
                <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${successRate * 100}%` }} />
              </div>
            </div>
          );
        })}
        {/* Recovery progress */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Recovery Progress</div>
          <div className="space-y-1">
            {[
              { name: "Graph Integrity", before: 0.52, after: achievable * 0.97 },
              { name: "Causal Consistency", before: 0.58, after: achievable * 0.95 },
              { name: "Temporal Coherence", before: 0.48, after: achievable * 0.92 },
              { name: "Evidence Completeness", before: 0.55, after: achievable * 0.96 },
            ].map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-36">{d.name}</span>
                <span className="text-red-400 w-10 text-right">{d.before.toFixed(2)}</span>
                <span className="text-gray-600">→</span>
                <span className="text-emerald-400 w-10">{d.after.toFixed(2)}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${d.after * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function MonitorPanel() {
  const [domain, setDomain] = useState("ai_holistic_health");
  const [interval, setInterval] = useState(60);
  const [sensitivity, setSensitivity] = useState(0.5);

  const overallHealth = 0.88 + sensitivity * 0.02;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Health Domain" value={domain} options={HEALTH_DOMAINS} onChange={setDomain} />
        <NumField label="Interval (s)" value={interval} min={10} max={3600} onChange={setInterval} />
        <NumField label="Sensitivity" value={sensitivity} min={0.1} max={1.0} step={0.05} onChange={setSensitivity} />
      </div>
      <Card title="Continuous Health Monitoring">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Overall Health" value={overallHealth.toFixed(3)} color="text-emerald-400" />
          <Metric label="Active Alerts" value={Math.round(sensitivity * 4)} color="text-amber-400" />
          <Metric label="Uptime" value="99.7%" color="text-cyan-400" />
          <Metric label="Detection" value={`${Math.round(10 + sensitivity * 100)}ms`} color="text-purple-400" />
        </div>
        {/* Monitoring dimensions */}
        {[
          { name: "Structural Integrity", health: 0.92 },
          { name: "Causal Validity", health: 0.89 },
          { name: "Temporal Consistency", health: 0.86 },
          { name: "Evidence Density", health: 0.91 },
          { name: "Semantic Coherence", health: 0.87 },
          { name: "Connectivity Strength", health: 0.93 },
          { name: "Confidence Distribution", health: 0.88 },
          { name: "Anomaly Density", health: 0.84 },
          { name: "Query Responsiveness", health: 0.95 },
        ].map((dim, i) => {
          const status = dim.health > 0.9 ? "healthy" : dim.health > 0.8 ? "warning" : "critical";
          return (
            <div key={dim.name} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={dim.name.split(" ").map(w => w[0]).join("")} color={
                status === "healthy" ? "green" : status === "warning" ? "amber" : "red"
              } />
              <div className="flex-1 grid grid-cols-4 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{dim.name}</span>
                <span>Value: {dim.health.toFixed(3)}</span>
                <span>Trend: {["stable", "improving", "stable", "declining"][i % 4]}</span>
                <Badge label={status} color={status === "healthy" ? "green" : status === "warning" ? "amber" : "red"} />
              </div>
              <div className="w-20 bg-gray-700 rounded-full h-1.5">
                <div className={`${status === "healthy" ? "bg-emerald-500" : status === "warning" ? "bg-amber-500" : "bg-red-500"} h-1.5 rounded-full`} style={{ width: `${dim.health * 100}%` }} />
              </div>
            </div>
          );
        })}
        {/* Health timeline */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Health Timeline</div>
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 10 }, (_, i) => {
              const val = overallHealth - 0.05 + Math.random() * 0.1;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${val * 100}%`,
                    backgroundColor: val > 0.9 ? "#059669" : val > 0.8 ? "#0891b2" : "#d97706",
                    opacity: 0.5 + i * 0.05,
                  }}
                  title={`T+${i * interval}s: ${val.toFixed(3)}`}
                />
              );
            })}
          </div>
          <div className="text-xs text-gray-500 text-right mt-1">T+0 → T+{9 * interval}s</div>
        </div>
      </Card>
    </div>
  );
}

function PreventPanel() {
  const [horizon, setHorizon] = useState(24);
  const [riskTolerance, setRiskTolerance] = useState(0.15);

  const avgRisk = 0.08 + riskTolerance * 0.3;
  const hardeningLevel = Math.min(1, 0.4 + (1 - avgRisk / 0.3) * 0.5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <NumField label="Horizon (hours)" value={horizon} min={1} max={168} onChange={setHorizon} />
        <NumField label="Risk Tolerance" value={riskTolerance} min={0.01} max={0.5} step={0.01} onChange={setRiskTolerance} />
      </div>
      <Card title="Proactive Prevention Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Avg Risk" value={(avgRisk * 100).toFixed(1)} color="text-cyan-400" />
          <Metric label="Hardening" value={(hardeningLevel * 100).toFixed(0)} color="text-emerald-400" />
          <Metric label="Measures" value={Math.round(4 + (1 - riskTolerance) * 6)} color="text-blue-400" />
          <Metric label="Horizon" value={`${horizon}h`} color="text-purple-400" />
        </div>
        {/* Prevention measures */}
        {[
          { name: "Redundancy Injection", effectiveness: 0.85, cost: 0.03 },
          { name: "Checkpoint Scheduling", effectiveness: 0.9, cost: 0.02 },
          { name: "Constraint Tightening", effectiveness: 0.78, cost: 0.04 },
          { name: "Evidence Refresh", effectiveness: 0.82, cost: 0.05 },
          { name: "Structural Reinforcement", effectiveness: 0.88, cost: 0.03 },
          { name: "Confidence Recalibration", effectiveness: 0.75, cost: 0.02 },
          { name: "Temporal Stabilization", effectiveness: 0.8, cost: 0.04 },
          { name: "Cascade Breaker Install", effectiveness: 0.92, cost: 0.06 },
          { name: "Anomaly Detection Tuning", effectiveness: 0.87, cost: 0.01 },
          { name: "Semantic Anchor Reinforce", effectiveness: 0.83, cost: 0.03 },
        ].slice(0, Math.round(4 + (1 - riskTolerance) * 6)).map((m, i) => (
          <div key={m.name} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
            <Badge label={`M${i + 1}`} color={["blue", "green", "amber", "purple", "cyan", "teal", "orange", "rose", "red", "blue"][i]} />
            <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
              <span className="text-gray-300">{m.name}</span>
              <span>Efficacy: {(m.effectiveness * 100).toFixed(0)}%</span>
              <span>Cost: {(m.cost * 100).toFixed(0)}%</span>
              <span>Risk −{(m.effectiveness * avgRisk * 100).toFixed(1)}%</span>
              <Badge label={m.effectiveness > 0.85 ? "high" : "medium"} color={m.effectiveness > 0.85 ? "green" : "amber"} />
            </div>
            <div className="w-16 bg-gray-700 rounded-full h-1.5">
              <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${m.effectiveness * 100}%` }} />
            </div>
          </div>
        ))}
        {/* Risk scenarios */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Predictive Risk Scenarios</div>
          <div className="space-y-1">
            {[
              { name: "Gradual Degradation", prob: 0.12, impact: 0.25 },
              { name: "Sudden Failure", prob: 0.03, impact: 0.55 },
              { name: "Slow Drift", prob: 0.15, impact: 0.18 },
              { name: "Cascade Collapse", prob: 0.02, impact: 0.6 },
            ].map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-36">{s.name}</span>
                <span className="text-amber-400 w-14">P: {(s.prob * 100).toFixed(1)}%</span>
                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                  <div className={`${s.impact > 0.4 ? "bg-red-600" : s.impact > 0.2 ? "bg-amber-600" : "bg-emerald-600"} h-1.5 rounded-full`} style={{ width: `${s.impact * 100}%` }} />
                </div>
                <span className="text-gray-500 w-12 text-right">I: {(s.impact * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function ValidatePanel() {
  const [depth, setDepth] = useState("standard_diagnosis");
  const [strict, setStrict] = useState(false);

  const strictFactor = strict ? 0.9 : 0.75;
  const passRate = strictFactor + 0.05;
  const quality = 0.85 + (strict ? 0.08 : 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Validation Depth" value={depth} options={DIAGNOSIS_DEPTHS} onChange={setDepth} />
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={strict}
              onChange={(e) => setStrict(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-900"
            />
            Strict Mode
          </label>
        </div>
        <div />
      </div>
      <Card title="Post-Healing Validation Engine">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Metric label="Pass Rate" value={`${(passRate * 100).toFixed(0)}%`} color="text-cyan-400" />
          <Metric label="Quality" value={quality.toFixed(3)} color="text-emerald-400" />
          <Metric label="Checks" value={10} color="text-blue-400" />
          <Metric label="Mode" value={strict ? "Strict" : "Standard"} color="text-purple-400" />
        </div>
        {/* Validation checks */}
        {[
          "Structural Integrity", "Causal Consistency", "Temporal Ordering",
          "Evidence Completeness", "Semantic Coherence", "Confidence Calibration",
          "Constraint Satisfaction", "Performance Regression", "Side Effect Detection", "Cascade Impact",
        ].map((check, i) => {
          const passed = Math.random() < passRate;
          const score = passed ? 0.85 + Math.random() * 0.14 : 0.4 + Math.random() * 0.35;
          const threshold = strict ? 0.85 : 0.7;
          return (
            <div key={check} className="flex items-center gap-3 bg-gray-900/60 rounded p-2 mb-2">
              <Badge label={`V${i + 1}`} color={passed ? "green" : "red"} />
              <div className="flex-1 grid grid-cols-5 gap-2 text-xs text-gray-400">
                <span className="text-gray-300">{check}</span>
                <span>Score: {score.toFixed(3)}</span>
                <span>Threshold: {threshold.toFixed(2)}</span>
                <span>Elements: {Math.round(50 + i * 100).toLocaleString()}</span>
                <Badge label={passed ? "PASS" : "FAIL"} color={passed ? "green" : "red"} />
              </div>
              <div className="w-16 bg-gray-700 rounded-full h-1.5">
                <div className={`${passed ? "bg-emerald-500" : "bg-red-500"} h-1.5 rounded-full`} style={{ width: `${score * 100}%` }} />
              </div>
            </div>
          );
        })}
        {/* Consistency metrics */}
        <div className="mt-3 p-2 bg-gray-900/40 rounded">
          <div className="text-xs text-gray-400 mb-2">Consistency Metrics</div>
          <div className="space-y-1">
            {[
              { name: "Structural Consistency", value: 0.94 },
              { name: "Causal Validity", value: 0.92 },
              { name: "Temporal Coherence", value: 0.89 },
              { name: "Evidence Completeness", value: 0.93 },
              { name: "Semantic Alignment", value: 0.91 },
              { name: "Overall Integrity", value: quality },
            ].map((m) => (
              <div key={m.name} className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 w-36">{m.name}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                  <div className={`${m.value > 0.9 ? "bg-emerald-600" : "bg-cyan-600"} h-1.5 rounded-full`} style={{ width: `${m.value * 100}%` }} />
                </div>
                <span className="text-gray-500 w-10 text-right">{(m.value * 100).toFixed(0)}%</span>
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
      <Card title="v1.269 — Self-Healing & Auto-Recovery Engine Overview">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-900/40 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Enums (6 × 6 values)</div>
            {[
              ["HealingMode", HEALING_MODES],
              ["AnomalyType", ANOMALY_TYPES],
              ["RepairStrategy", REPAIR_STRATEGIES],
              ["HealthDomain", HEALTH_DOMAINS],
              ["RecoveryLevel", RECOVERY_LEVELS],
              ["DiagnosisDepth", DIAGNOSIS_DEPTHS],
            ].map(([name, vals]) => (
              <div key={name} className="mb-2">
                <div className="text-xs text-cyan-400 font-mono">{name}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(vals as string[]).map((v) => (
                    <Badge key={v} label={v.replace(/_/g, " ")} color="blue" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-900/40 rounded p-3">
            <div className="text-xs text-gray-500 mb-2">Endpoints (7)</div>
            {[
              ["POST", "/graph/causal-healing/diagnose", "Health diagnosis & anomaly scan"],
              ["POST", "/graph/causal-healing/repair", "Targeted repair execution"],
              ["POST", "/graph/causal-healing/recover", "Full recovery operations"],
              ["POST", "/graph/causal-healing/monitor", "Continuous health monitoring"],
              ["POST", "/graph/causal-healing/prevent", "Proactive prevention & hardening"],
              ["POST", "/graph/causal-healing/validate", "Post-healing validation"],
              ["GET", "/graph/causal-healing/overview", "System health overview"],
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
            <div className="text-rose-400">Self-Healing & Auto-Recovery (v1.269):</div>
            <div className="pl-4">Diagnose → Repair → Recover → Monitor → Prevent → Validate</div>
            <div className="text-gray-500 mt-2">↑ Built on Knowledge Compression & Lifecycle (v1.268)</div>
            <div className="text-gray-600 pl-4">Compress → Summarize → Prune → Archive → Decompress → Benchmark</div>
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
          <div><span className="text-cyan-300">Explainability</span> (v1.267) → Explain/Interpret/Counterfactual/Visualize/Narrate/Validate</div>
          <div><span className="text-orange-400">Compression</span> (v1.268) → Compress/Summarize/Prune/Archive/Decompress/Benchmark</div>
          <div><span className="text-rose-300">Self-Healing</span> (v1.269) → Diagnose/Repair/Recover/Monitor/Prevent/Validate</div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────

const PANELS: Record<Tab, React.FC> = {
  Diagnose: DiagnosePanel,
  Repair: RepairPanel,
  Recover: RecoverPanel,
  Monitor: MonitorPanel,
  Prevent: PreventPanel,
  Validate: ValidatePanel,
  Overview: OverviewPanel,
};

export default function GraphCausalSelfHealingPage() {
  const [tab, setTab] = useState<Tab>("Diagnose");
  const Panel = PANELS[tab];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-100">
            Causal Self-Healing &amp; Auto-Recovery Engine
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            v1.269 — Automated diagnosis, targeted repair, progressive recovery, continuous monitoring, proactive prevention &amp; post-healing validation
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
                  ? "bg-rose-900/50 text-rose-300 border-rose-700"
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
