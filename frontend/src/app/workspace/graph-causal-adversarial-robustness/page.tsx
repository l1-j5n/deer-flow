"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.275 — Causal Adversarial Robustness Engine
   7 tabs: Detection | Defense | Hardening | Audit | Robustness | Certification | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Detection", "Defense", "Hardening", "Audit", "Robustness", "Certification", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const ATTACK_TYPES = ["causal_dag_manipulation","confounder_injection","selection_bias_exploit","mediator_hijacking","collider_exploitation","ai_novel_attack"];
const DEFENSE_STRATEGIES = ["adversarial_training","causal_smoothing","robust_inference","input_sanitization","ensemble_defense","ai_adaptive_defense"];
const ROBUSTNESS_METRICS = ["dag_integrity","inference_stability","bound_tightness","sensitivity_score","perturbation_resistance","ai_composite_robustness"];
const THREAT_LEVELS = ["benign","low","moderate","high","critical","ai_emergent_threat"];
const HARDENING_PHASES = ["assess","fortify","test","monitor","adapt","certify"];
const VERIFICATION_RIGORS = ["formal_verification","statistical_testing","empirical_validation","adversarial_probing","prospective_analysis","ai_continuous_audit"];

const ATTACK_COLORS: Record<string, string> = {
  causal_dag_manipulation: "red", confounder_injection: "orange", selection_bias_exploit: "amber",
  mediator_hijacking: "purple", collider_exploitation: "rose", ai_novel_attack: "indigo",
};

const DEFENSE_COLORS: Record<string, string> = {
  adversarial_training: "blue", causal_smoothing: "cyan", robust_inference: "green",
  input_sanitization: "amber", ensemble_defense: "purple", ai_adaptive_defense: "rose",
};

const THREAT_COLORS: Record<string, string> = {
  benign: "green", low: "cyan", moderate: "amber", high: "orange", critical: "red", ai_emergent_threat: "rose",
};

const PHASE_COLORS: Record<string, string> = {
  assess: "blue", fortify: "orange", test: "amber",
  monitor: "cyan", adapt: "purple", certify: "green",
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

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-xs text-gray-400">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors ${value ? "bg-emerald-600" : "bg-gray-600"}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transform transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function BarChart({ data, maxVal }: { data: { label: string; value: number; color: string }[]; maxVal?: number }) {
  const mx = maxVal ?? Math.max(...data.map((d) => d.value), 0.001);
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-32 truncate">{d.label.replace(/_/g, " ")}</span>
          <div className="flex-1 bg-gray-900 rounded h-3 overflow-hidden">
            <div
              className={`h-full rounded ${d.color}`}
              style={{ width: `${(d.value / mx) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-300 w-12 text-right">{(d.value * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

function MetricRow({ label, value, color = "text-gray-200" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-700/50">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-mono ${color}`}>{typeof value === "number" ? value.toFixed(4) : value}</span>
    </div>
  );
}

// ─── Tab: Detection ───────────────────────────────────────
function DetectionTab() {
  const [sensitivity, setSensitivity] = useState(0.8);
  const [scanDepth, setScanDepth] = useState(3);
  const [recentInputs, setRecentInputs] = useState(100);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <NumField label="Detection Sensitivity" value={sensitivity} min={0.1} max={1.0} step={0.05} onChange={setSensitivity} />
        <NumField label="Scan Depth" value={scanDepth} min={1} max={10} onChange={setScanDepth} />
        <NumField label="Recent Inputs" value={recentInputs} min={10} max={10000} step={100} onChange={setRecentInputs} />
      </div>
      <Card title="Attack Type Scan Results">
        <div className="space-y-3">
          {ATTACK_TYPES.map((atk) => {
            const detected = Math.floor(Math.random() * 5 * sensitivity);
            return (
              <div key={atk} className="p-3 bg-gray-900/30 rounded border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <Badge label={atk.replace(/_/g, " ")} color={ATTACK_COLORS[atk]} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">threats:</span>
                    <span className={`text-sm font-mono ${detected > 3 ? "text-red-400" : detected > 1 ? "text-amber-400" : "text-emerald-400"}`}>
                      {detected}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {THREAT_LEVELS.slice(1).map((tl) => (
                    <div key={tl} className="text-center">
                      <div className="text-[10px] text-gray-500">{tl.replace(/_/g, " ")}</div>
                      <div className="text-xs font-mono text-gray-300">{Math.floor(Math.random() * 3)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="Input Anomaly Analysis">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricRow label="Inputs Analyzed" value={recentInputs} />
          <MetricRow label="Anomalous" value={Math.floor(recentInputs * 0.05 * sensitivity)} color="text-amber-400" />
          <MetricRow label="Distribution Shift" value={Math.random() > 0.7 ? "detected" : "none"} />
          <MetricRow label="Causal Anomalies" value={Math.floor(Math.random() * 8)} color="text-orange-400" />
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Defense ─────────────────────────────────────────
function DefenseTab() {
  const [strategy, setStrategy] = useState("ai_adaptive_defense");
  const [mode, setMode] = useState("active");
  const [rounds, setRounds] = useState(3);
  const [autoRespond, setAutoRespond] = useState(true);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SelectField label="Defense Strategy" value={strategy} options={DEFENSE_STRATEGIES} onChange={setStrategy} />
        <SelectField label="Deployment Mode" value={mode} options={["active", "passive", "shadow"]} onChange={setMode} />
        <NumField label="Defense Rounds" value={rounds} min={1} max={10} onChange={setRounds} />
        <ToggleField label="Auto Respond" value={autoRespond} onChange={setAutoRespond} />
      </div>
      <Card title="Defense Strategy Effectiveness">
        <BarChart
          data={DEFENSE_STRATEGIES.map((s) => ({
            label: s,
            value: 0.5 + Math.random() * 0.5,
            color: s === strategy ? "bg-emerald-500" : "bg-blue-500",
          }))}
        />
      </Card>
      <Card title="Layer Defense Status">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[1, 5, 10, 15, 20, 25].map((layer) => {
            const threat = 0.1 + Math.random() * 0.6;
            const effectiveness = 0.5 + Math.random() * 0.5;
            const post = Math.max(0.01, threat * (1 - effectiveness));
            return (
              <div key={layer} className="p-3 bg-gray-900/50 border border-gray-700 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">Layer {layer}</span>
                  <Badge label={post < 0.1 ? "secured" : post < 0.3 ? "moderate" : "vulnerable"} color={post < 0.1 ? "green" : post < 0.3 ? "amber" : "red"} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-500 mb-0.5">Before</div>
                    <div className="w-full h-1.5 bg-gray-800 rounded">
                      <div className="h-full bg-red-500 rounded" style={{ width: `${threat * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-gray-600 text-xs">→</span>
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-500 mb-0.5">After</div>
                    <div className="w-full h-1.5 bg-gray-800 rounded">
                      <div className="h-full bg-emerald-500 rounded" style={{ width: `${post * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="Countermeasures Deployed">
        <div className="flex flex-wrap gap-2">
          {["input_filter", "dag_validator", "confounder_detector", "bias_corrector",
            "mediator_monitor", "collider_guard", "ensemble_voter", "anomaly_detector"].map((cm) => (
            <Badge key={cm} label={cm.replace(/_/g, " ")} color={Math.random() > 0.3 ? "green" : "amber"} />
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Hardening ───────────────────────────────────────
function HardeningTab() {
  const [vulnThreshold, setVulnThreshold] = useState(0.3);
  const [stages, setStages] = useState(26);
  const [regression, setRegression] = useState(true);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <NumField label="Vulnerability Threshold" value={vulnThreshold} min={0} max={1} step={0.05} onChange={setVulnThreshold} />
        <NumField label="Pipeline Stages" value={stages} min={1} max={26} onChange={setStages} />
        <ToggleField label="Regression Tests" value={regression} onChange={setRegression} />
      </div>
      <Card title="Hardening Pipeline: Assess → Fortify → Test → Monitor → Adapt → Certify">
        <div className="flex items-center gap-1 mb-4">
          {HARDENING_PHASES.map((p, i) => (
            <div key={p} className="flex items-center">
              <div className="px-3 py-1.5 rounded text-xs font-medium bg-gray-900 border border-gray-700 text-gray-300">
                <span className="text-gray-500 mr-1">{i + 1}.</span>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </div>
              {i < HARDENING_PHASES.length - 1 && (
                <span className="text-gray-600 mx-1">→</span>
              )}
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {HARDENING_PHASES.map((phase, pi) => {
            const patches = Math.floor(2 + Math.random() * 8);
            const applied = Math.floor(patches * (0.7 + Math.random() * 0.3));
            return (
              <div key={phase} className="p-3 bg-gray-900/30 rounded border border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge label={phase} color={PHASE_COLORS[phase]} />
                    <span className="text-xs text-gray-500">Phase {pi + 1}</span>
                  </div>
                  <span className="text-xs text-emerald-400">
                    {applied}/{patches} patches applied
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded" style={{ width: `${(applied / patches) * 100}%` }} />
                </div>
                {regression && (
                  <div className="mt-2 text-xs text-gray-500">
                    Regression: <span className="text-emerald-400">{Math.floor(20 + Math.random() * 80)}/{Math.floor(20 + Math.random() * 80)}</span> passed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="Vulnerability Reduction Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricRow label="Pre-Hardening" value={0.45 + Math.random() * 0.3} color="text-orange-400" />
          <MetricRow label="Post-Hardening" value={0.1 + Math.random() * 0.2} color="text-emerald-400" />
          <MetricRow label="Reduction" value={0.2 + Math.random() * 0.3} color="text-cyan-400" />
          <MetricRow label="Critical Flaws" value={Math.floor(Math.random() * 3)} />
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Audit ───────────────────────────────────────────
function AuditTab() {
  const [rigor, setRigor] = useState("adversarial_probing");
  const [scope, setScope] = useState("full_stack");
  const [compliance, setCompliance] = useState(true);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SelectField label="Verification Rigor" value={rigor} options={VERIFICATION_RIGORS} onChange={setRigor} />
        <SelectField label="Audit Scope" value={scope} options={["full_stack", "single_layer", "cross_layer"]} onChange={setScope} />
        <ToggleField label="Include Compliance" value={compliance} onChange={setCompliance} />
      </div>
      <Card title="Vulnerability Scan Results">
        <div className="space-y-2">
          {["structural_vulnerability", "parametric_sensitivity", "input_manipulation",
            "feedback_loop_exploitation", "cross_layer_propagation", "meta_learning_poisoning"].map((vc) => {
            const findings = Math.floor(Math.random() * 8);
            const critical = Math.floor(Math.random() * Math.min(2, findings));
            return (
              <div key={vc} className="flex items-center justify-between p-2 bg-gray-900/30 rounded">
                <span className="text-xs text-gray-300">{vc.replace(/_/g, " ")}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-red-400">{critical} critical</span>
                  <span className="text-xs text-amber-400">{findings} total</span>
                  <Badge label={findings === 0 ? "clear" : findings < 3 ? "low" : "high"} color={findings === 0 ? "green" : findings < 3 ? "amber" : "red"} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      {compliance && (
        <Card title="Compliance Status">
          <div className="space-y-2">
            {[
              { name: "Causal Integrity Policy", score: 0.85 + Math.random() * 0.15 },
              { name: "Adversarial Robustness Standard", score: 0.7 + Math.random() * 0.3 },
              { name: "Data Protection Policy", score: 0.9 + Math.random() * 0.1 },
              { name: "Audit Trail Integrity", score: 0.92 + Math.random() * 0.08 },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-2 bg-gray-900/30 rounded">
                <span className="text-xs text-gray-300">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400">{item.score.toFixed(3)}</span>
                  <Badge label={item.score >= 0.9 ? "compliant" : item.score >= 0.7 ? "partial" : "non-compliant"} color={item.score >= 0.9 ? "green" : item.score >= 0.7 ? "amber" : "red"} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
      <Card title="Risk Assessment">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricRow label="Risk Score" value={0.15 + Math.random() * 0.5} color="text-amber-400" />
          <MetricRow label="Risk Level" value={THREAT_LEVELS[Math.floor(Math.random() * 4)]} />
          <MetricRow label="Findings" value={Math.floor(5 + Math.random() * 20)} />
          <MetricRow label="Trend" value={Math.random() > 0.5 ? "improving" : "stable"} color="text-emerald-400" />
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Robustness ──────────────────────────────────────
function RobustnessTab() {
  const [pertBudget, setPertBudget] = useState(0.1);
  const [stressTests, setStressTests] = useState(20);
  const [benchmark, setBenchmark] = useState("pre_hardening");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <NumField label="Perturbation Budget" value={pertBudget} min={0.01} max={1.0} step={0.01} onChange={setPertBudget} />
        <NumField label="Stress Tests" value={stressTests} min={5} max={100} onChange={setStressTests} />
        <SelectField label="Benchmark Baseline" value={benchmark} options={["pre_hardening", "random", "industry", "none"]} onChange={setBenchmark} />
      </div>
      <Card title="Robustness Metrics">
        <BarChart
          data={ROBUSTNESS_METRICS.map((m) => ({
            label: m,
            value: 0.5 + Math.random() * 0.5,
            color: m === "ai_composite_robustness" ? "bg-purple-500" : "bg-emerald-500",
          }))}
        />
      </Card>
      <Card title="Stress Test Scenarios">
        <div className="space-y-2">
          {["random_noise_injection", "targeted_perturbation", "causal_dag_corruption",
            "confounder_flooding", "meta_learning_poisoning", "cross_layer_cascade"].map((sc, i) => {
            const retained = 0.5 + Math.random() * 0.5;
            return (
              <div key={sc} className="flex items-center gap-3 p-2 bg-gray-900/30 rounded">
                <span className="text-xs text-gray-500 w-6">#{i + 1}</span>
                <div className="flex-1">
                  <div className="text-xs text-gray-300">{sc.replace(/_/g, " ")}</div>
                  <div className="w-full h-1.5 bg-gray-800 rounded mt-1">
                    <div
                      className={`h-full rounded ${retained > 0.7 ? "bg-emerald-500" : retained > 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${retained * 100}%` }}
                    />
                  </div>
                </div>
                <span className={`text-xs font-mono ${retained > 0.7 ? "text-emerald-400" : retained > 0.4 ? "text-amber-400" : "text-red-400"}`}>
                  {(retained * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </Card>
      {benchmark !== "none" && (
        <Card title="Benchmark Comparison">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricRow label="Baseline Score" value={0.3 + Math.random() * 0.3} color="text-amber-400" />
            <MetricRow label="Current Score" value={0.6 + Math.random() * 0.4} color="text-emerald-400" />
            <MetricRow label="Improvement" value={0.1 + Math.random() * 0.3} color="text-cyan-400" />
            <MetricRow label="Percentile" value={0.7 + Math.random() * 0.3} color="text-purple-400" />
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Tab: Certification ───────────────────────────────────
function CertificationTab() {
  const [rigor, setRigor] = useState("formal_verification");
  const [trustThreshold, setTrustThreshold] = useState(0.9);
  const [certScope, setCertScope] = useState("full_stack");

  const trustScore = 0.85 + Math.random() * 0.15;
  const certified = trustScore >= trustThreshold;
  const badge = trustScore >= 0.95 ? "gold" : trustScore >= 0.9 ? "silver" : trustScore >= trustThreshold ? "bronze" : "none";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SelectField label="Verification Rigor" value={rigor} options={VERIFICATION_RIGORS} onChange={setRigor} />
        <NumField label="Trust Threshold" value={trustThreshold} min={0.5} max={1.0} step={0.01} onChange={setTrustThreshold} />
        <SelectField label="Certification Scope" value={certScope} options={["full_stack", "causal_pipeline", "meta_layers"]} onChange={setCertScope} />
      </div>
      <Card title="Trustworthiness Certification">
        <div className="text-center py-6">
          <div className={`text-4xl mb-3 ${certified ? "text-emerald-400" : "text-red-400"}`}>
            {certified ? "✓" : "✗"}
          </div>
          <div className="text-lg font-bold text-gray-200 mb-1">
            {certified ? "CERTIFIED" : "NOT CERTIFIED"}
          </div>
          <div className={`text-3xl font-mono mb-2 ${trustScore >= 0.9 ? "text-emerald-400" : trustScore >= 0.7 ? "text-amber-400" : "text-red-400"}`}>
            {trustScore.toFixed(4)}
          </div>
          <div className="text-xs text-gray-400 mb-4">Overall Trust Score (threshold: {trustThreshold})</div>
          <div className="flex justify-center">
            {badge !== "none" ? (
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                badge === "gold" ? "bg-yellow-900/40 text-yellow-300 border border-yellow-600" :
                badge === "silver" ? "bg-gray-600/40 text-gray-200 border border-gray-400" :
                "bg-orange-900/40 text-orange-300 border border-orange-600"
              }`}>
                {badge.toUpperCase()} CERTIFIED
              </span>
            ) : (
              <span className="px-4 py-2 rounded-full text-sm font-bold bg-red-900/40 text-red-300 border border-red-600">
                BELOW THRESHOLD
              </span>
            )}
          </div>
        </div>
      </Card>
      <Card title="Trust Components">
        <div className="space-y-2">
          {ROBUSTNESS_METRICS.map((m) => {
            const score = 0.5 + Math.random() * 0.5;
            return (
              <div key={m} className="flex items-center gap-3 p-2 bg-gray-900/30 rounded">
                <span className="text-xs text-gray-400 w-32">{m.replace(/_/g, " ")}</span>
                <div className="flex-1 h-2 bg-gray-800 rounded">
                  <div
                    className={`h-full rounded ${score >= trustThreshold ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${score * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-mono ${score >= trustThreshold ? "text-emerald-400" : "text-amber-400"}`}>
                  {score.toFixed(3)}
                </span>
                <Badge label={score >= trustThreshold ? "pass" : "fail"} color={score >= trustThreshold ? "green" : "amber"} />
              </div>
            );
          })}
        </div>
      </Card>
      <Card title="Certification Scope">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/50 rounded p-3 text-center">
            <div className="text-xs text-gray-500">Scope</div>
            <div className="text-sm font-mono text-cyan-400">{certScope.replace(/_/g, " ")}</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3 text-center">
            <div className="text-xs text-gray-500">Layers Passing</div>
            <div className="text-sm font-mono text-emerald-400">{Math.floor(20 + Math.random() * 6)}/26</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3 text-center">
            <div className="text-xs text-gray-500">Verification</div>
            <div className="text-sm font-mono text-purple-400">{rigor.replace(/_/g, " ").slice(0, 15)}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Overview ────────────────────────────────────────
function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card title="v1.275 — Causal Adversarial Robustness Engine">
        <p className="text-sm text-gray-400 mb-4">
          Adversarial robustness shield — protects the self-improving causal reasoning stack
          from hostile manipulation. Detects causal-specific attacks (DAG manipulation, confounder
          injection, selection bias, mediator hijacking, collider exploitation), deploys multi-strategy
          defenses, hardens the pipeline, audits vulnerabilities, quantifies robustness through
          stress testing, and certifies trustworthiness.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Layer</div>
            <div className="text-lg font-mono text-cyan-400">27</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Enums</div>
            <div className="text-lg font-mono text-emerald-400">6 × 6 = 36</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Endpoints</div>
            <div className="text-lg font-mono text-amber-400">6 POST + 1 GET</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Config Space</div>
            <div className="text-lg font-mono text-purple-400">46,656</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Protection Cycle</div>
            <div className="text-sm font-mono text-rose-400">6 phases</div>
          </div>
          <div className="bg-gray-900/50 rounded p-3">
            <div className="text-xs text-gray-500">Sits Above</div>
            <div className="text-sm font-mono text-teal-400">v1.274</div>
          </div>
        </div>
      </Card>
      <Card title="Enums">
        <div className="space-y-3">
          {[
            { name: "AdversarialAttackType", values: ATTACK_TYPES, colors: ATTACK_COLORS },
            { name: "DefenseStrategy", values: DEFENSE_STRATEGIES, colors: DEFENSE_COLORS },
            { name: "RobustnessMetric", values: ROBUSTNESS_METRICS },
            { name: "ThreatLevel", values: THREAT_LEVELS, colors: THREAT_COLORS },
            { name: "HardeningPhase", values: HARDENING_PHASES, colors: PHASE_COLORS },
            { name: "VerificationRigor", values: VERIFICATION_RIGORS },
          ].map((e) => (
            <div key={e.name}>
              <div className="text-xs font-medium text-gray-300 mb-1">{e.name}</div>
              <div className="flex flex-wrap gap-1">
                {e.values.map((v) => (
                  <Badge key={v} label={v.replace(/_/g, " ")} color={(e.colors as Record<string, string>)?.[v] ?? "blue"} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Architecture Position">
        <div className="text-xs font-mono text-gray-400 space-y-1">
          <div className="text-gray-300 font-semibold mb-2">27-Layer Causal Intelligence Stack:</div>
          <div>Discovery → Explanation → Argumentation → Fairness → Curriculum → Optimization</div>
          <div>→ Intervention → Distillation → Ensemble → Temporal → Feedback</div>
          <div>→ Meta-Cognitive → Emergence → Governance → Transfer → Streaming</div>
          <div>→ Consensus → Resilience → Explainability → Compression</div>
          <div>→ Self-Healing → Semantic Interop → Workflow → Digital Twin</div>
          <div>→ Ontology Evolution → Meta-Learning → <span className="text-red-400 font-bold">Adversarial Robustness (v1.275) ← NEW</span></div>
        </div>
      </Card>
      <Card title="Endpoints">
        <div className="space-y-1">
          {[
            ["POST /graph/causal-adversarial/detection", "Adversarial attack detection"],
            ["POST /graph/causal-adversarial/defense", "Defense mechanism deployment"],
            ["POST /graph/causal-adversarial/hardening", "Pipeline hardening & patching"],
            ["POST /graph/causal-adversarial/audit", "Security audit & vulnerability scan"],
            ["POST /graph/causal-adversarial/robustness", "Robustness quantification & stress testing"],
            ["POST /graph/causal-adversarial/certification", "Trustworthiness certification"],
            ["GET /graph/causal-adversarial/overview", "System overview"],
          ].map(([ep, desc]) => (
            <div key={ep} className="flex items-center gap-2 py-1">
              <span className="text-xs font-mono text-amber-400">{ep}</span>
              <span className="text-xs text-gray-500">— {desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function GraphCausalAdversarialRobustnessPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Detection");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🛡️</span>
            <h1 className="text-xl font-bold">Causal Adversarial Robustness Engine</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700">v1.275</span>
          </div>
          <p className="text-sm text-gray-400">
            Protects the self-improving causal reasoning stack from hostile manipulation — detecting causal-specific
            attacks, deploying defenses, hardening the pipeline, auditing vulnerabilities, quantifying robustness,
            and certifying trustworthiness.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 border-b border-gray-800">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "text-emerald-400 border-emerald-400"
                  : "text-gray-400 border-transparent hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Detection" && <DetectionTab />}
        {activeTab === "Defense" && <DefenseTab />}
        {activeTab === "Hardening" && <HardeningTab />}
        {activeTab === "Audit" && <AuditTab />}
        {activeTab === "Robustness" && <RobustnessTab />}
        {activeTab === "Certification" && <CertificationTab />}
        {activeTab === "Overview" && <OverviewTab />}
      </div>
    </div>
  );
}
