"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.273 — Causal Ontology & Concept Evolution Engine
   7 tabs: Concept | Change | Drift | Merge | Coherence | Evolution | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Concept", "Change", "Drift", "Merge", "Coherence", "Evolution", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const EVOLUTION_TYPES = ["merge","split","drift","emergence","deprecation","redefinition"];
const CHANGE_TYPES = ["additive","reductive","restructive","refinement","migration","ai_autonomous"];
const SEMANTIC_RELATIONS = ["is_a","part_of","related_to","depends_on","precedes","causes"];
const DRIFT_SEVERITIES = ["stable","low","moderate","high","critical","ai_predicted"];
const ONTOLOGY_SCOPES = ["domain","cross_domain","global","meta","application","ai_discovered"];
const CONCEPT_STATUSES = ["active","emerging","deprecated","merged","split","candidate"];

const EVO_COLORS: Record<string, string> = {
  merge: "purple", split: "orange", drift: "amber",
  emergence: "green", deprecation: "red", redefinition: "cyan",
};

const STATUS_COLORS: Record<string, string> = {
  active: "green", emerging: "cyan", deprecated: "red",
  merged: "purple", split: "orange", candidate: "amber",
};

const SEVERITY_COLORS: Record<string, string> = {
  stable: "green", low: "cyan", moderate: "amber",
  high: "orange", critical: "red", ai_predicted: "purple",
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

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        className="w-full bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded px-2 py-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox" checked={value}
        className="rounded border-gray-600 bg-gray-900"
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="text-xs text-gray-400">{label}</label>
    </div>
  );
}

function MetricBar({ label, value, color = "blue" }: { label: string; value: number; color?: string }) {
  const pct = Math.round(value * 100);
  const barColors: Record<string, string> = {
    blue: "bg-blue-500", green: "bg-emerald-500", amber: "bg-amber-500",
    red: "bg-red-500", purple: "bg-purple-500", cyan: "bg-cyan-500",
  };
  return (
    <div className="mb-1">
      <div className="flex justify-between text-xs text-gray-400 mb-0.5">
        <span>{label}</span><span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full">
        <div className={`h-1.5 rounded-full ${barColors[color] ?? barColors.blue}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Concept Tab ──────────────────────────────────────────
function ConceptTab() {
  const [name, setName] = useState("causal-strength");
  const [evoType, setEvoType] = useState("emergence");
  const [status, setStatus] = useState("active");
  const [scope, setScope] = useState("domain");
  const [confidence, setConfidence] = useState(0.85);
  const [res, setRes] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/graph/causal-ontology/concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_name: name, evolution_type: evoType,
          concept_status: status, scope, confidence,
          semantic_relations: ["related_to", "is_a"],
          parent_concepts: [],
        }),
      });
      setRes(await r.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Concept Lifecycle Configuration">
        <div className="space-y-3">
          <TextField label="Concept Name" value={name} onChange={setName} />
          <SelectField label="Evolution Type" value={evoType} options={EVOLUTION_TYPES} onChange={setEvoType} />
          <SelectField label="Concept Status" value={status} options={CONCEPT_STATUSES} onChange={setStatus} />
          <SelectField label="Ontology Scope" value={scope} options={ONTOLOGY_SCOPES} onChange={setScope} />
          <NumField label="Confidence" value={confidence} min={0.1} max={1.0} step={0.05} onChange={setConfidence} />
          <button onClick={run} disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded disabled:opacity-50">
            {loading ? "Executing..." : "Manage Concept"}
          </button>
        </div>
      </Card>

      {res && (
        <div className="space-y-4">
          <Card title="Concept Result">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Concept ID</span><span className="text-gray-200 font-mono">{(res as Record<string, unknown>).concept_id as string}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Name</span><span className="text-gray-200">{(res as Record<string, unknown>).concept_name as string}</span></div>
              <div className="flex gap-2">
                <Badge label={(res as Record<string, unknown>).evolution_type as string} color={EVO_COLORS[(res as Record<string, unknown>).evolution_type as string] ?? "blue"} />
                <Badge label={(res as Record<string, unknown>).status as string} color={STATUS_COLORS[(res as Record<string, unknown>).status as string] ?? "blue"} />
                <Badge label={(res as Record<string, unknown>).scope as string} />
              </div>
              <div className="flex justify-between"><span className="text-gray-400">Confidence</span><span className="text-gray-200">{((res as Record<string, unknown>).confidence as number).toFixed(4)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Hierarchy Depth</span><span className="text-gray-200">{(res as Record<string, unknown>).hierarchy_depth as number}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Fingerprint Dimensions</span><span className="text-gray-200">{(res as Record<string, unknown>).semantic_fingerprint_dim as number}</span></div>
            </div>
          </Card>
          <Card title="Concept Quality">
            {res.concept_quality && Object.entries(res.concept_quality as Record<string, number>).map(([k, v]) => (
              <MetricBar key={k} label={k.replace(/_/g, " ")} value={v} />
            ))}
          </Card>
          <Card title="Impact Radius">
            {res.impact_radius && Object.entries(res.impact_radius as Record<string, number>).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs text-gray-400">
                <span>{k.replace(/_/g, " ")}</span><span className="text-gray-300">{v}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Change Tab ───────────────────────────────────────────
function ChangeTab() {
  const [changeType, setChangeType] = useState("additive");
  const [scope, setScope] = useState("domain");
  const [revisions, setRevisions] = useState(3);
  const [autoProp, setAutoProp] = useState(true);
  const [res, setRes] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/graph/causal-ontology/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          change_type: changeType, scope, n_revisions: revisions,
          auto_propagate: autoProp, affected_concepts: ["c1", "c2", "c3"],
        }),
      });
      setRes(await r.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Ontology Change Configuration">
        <div className="space-y-3">
          <SelectField label="Change Type" value={changeType} options={CHANGE_TYPES} onChange={setChangeType} />
          <SelectField label="Scope" value={scope} options={ONTOLOGY_SCOPES} onChange={setScope} />
          <NumField label="Revisions" value={revisions} min={1} max={20} onChange={setRevisions} />
          <ToggleField label="Auto-propagate changes" value={autoProp} onChange={setAutoProp} />
          <button onClick={run} disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded disabled:opacity-50">
            {loading ? "Executing..." : "Apply Change"}
          </button>
        </div>
      </Card>

      {res && (
        <div className="space-y-4">
          <Card title="Change Result">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Change ID</span><span className="text-gray-200 font-mono">{(res as Record<string, unknown>).change_id as string}</span></div>
              <div className="flex gap-2">
                <Badge label={(res as Record<string, unknown>).change_type as string} />
                <Badge label={(res as Record<string, unknown>).scope as string} />
              </div>
              <div className="flex justify-between"><span className="text-gray-400">Affected Concepts</span><span className="text-gray-200">{(res as Record<string, unknown>).affected_concepts_count as number}</span></div>
            </div>
          </Card>
          <Card title="Impact Metrics">
            {res.impact_metrics && Object.entries(res.impact_metrics as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{k.replace(/_/g, " ")}</span><span className="text-gray-300">{String(v)}</span>
              </div>
            ))}
          </Card>
          <Card title="Validation">
            {res.validation && Object.entries(res.validation as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{k.replace(/_/g, " ")}</span><span className="text-gray-300">{typeof v === "number" ? v.toFixed(4) : String(v)}</span>
              </div>
            ))}
          </Card>
          <Card title="Change Quality">
            {res.change_quality && Object.entries(res.change_quality as Record<string, number>).map(([k, v]) => (
              <MetricBar key={k} label={k.replace(/_/g, " ")} value={v} />
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Drift Tab ────────────────────────────────────────────
function DriftTab() {
  const [window, setWindow] = useState(30);
  const [sensitivity, setSensitivity] = useState(0.8);
  const [checkpoints, setCheckpoints] = useState(10);
  const [res, setRes] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/graph/causal-ontology/drift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept_ids: ["c1", "c2", "c3", "c4", "c5"],
          detection_window: window, sensitivity,
          n_checkpoints: checkpoints,
        }),
      });
      setRes(await r.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Drift Detection Configuration">
        <div className="space-y-3">
          <NumField label="Detection Window (days)" value={window} min={7} max={365} onChange={setWindow} />
          <NumField label="Sensitivity" value={sensitivity} min={0.1} max={1.0} step={0.1} onChange={setSensitivity} />
          <NumField label="Checkpoints" value={checkpoints} min={3} max={50} onChange={setCheckpoints} />
          <button onClick={run} disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded disabled:opacity-50">
            {loading ? "Analyzing..." : "Detect Drift"}
          </button>
        </div>
      </Card>

      {res && (
        <div className="space-y-4">
          <Card title="Drift Analysis Result">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Drift ID</span><span className="text-gray-200 font-mono">{(res as Record<string, unknown>).drift_id as string}</span></div>
            </div>
          </Card>

          <Card title="Concept Drifts">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {(res.concept_drifts as Array<Record<string, unknown>>)?.map((cd, i) => (
                <div key={i} className="bg-gray-900/50 rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-300 font-mono">{cd.concept_id as string}</span>
                    <Badge label={cd.severity as string} color={SEVERITY_COLORS[cd.severity as string] ?? "blue"} />
                    <Badge label={cd.drift_direction as string} />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                    <span>Score: {(cd.current_drift_score as number).toFixed(4)}</span>
                    <span>Velocity: {(cd.drift_velocity as number).toFixed(6)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Aggregate Statistics">
            {res.aggregate && (
              <>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-2">
                  <span>Avg Drift: {((res.aggregate as Record<string, unknown>).average_drift_score as number).toFixed(4)}</span>
                  <span>Max Drift: {((res.aggregate as Record<string, unknown>).max_drift_score as number).toFixed(4)}</span>
                  <span>Stable: {((res.aggregate as Record<string, unknown>).stable_concepts as number)}</span>
                  <span>Critical: {((res.aggregate as Record<string, unknown>).critical_drift_concepts as number)}</span>
                </div>
                {((res.aggregate as Record<string, unknown>).drift_distribution as Record<string, number>) && Object.entries((res.aggregate as Record<string, unknown>).drift_distribution as Record<string, number>).map(([k, v]) => (
                  <MetricBar key={k} label={k} value={v / ((res.aggregate as Record<string, unknown>).total_concepts_analyzed as number)} color={SEVERITY_COLORS[k] ?? "blue"} />
                ))}
              </>
            )}
          </Card>

          <Card title="Predictions">
            {res.predictions && Object.entries(res.predictions as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{k.replace(/_/g, " ")}</span>
                <span className="text-gray-300">{typeof v === "number" ? (typeof v === "boolean" ? v : v.toFixed(4)) : String(v)}</span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Merge Tab ────────────────────────────────────────────
function MergeTab() {
  const [operation, setOperation] = useState("merge");
  const [strategy, setStrategy] = useState("union");
  const [preserve, setPreserve] = useState(true);
  const [threshold, setThreshold] = useState(0.7);
  const [res, setRes] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/graph/causal-ontology/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation, source_concepts: ["concept_a", "concept_b", "concept_c"],
          merge_strategy: strategy, preserve_history: preserve,
          confidence_threshold: threshold,
        }),
      });
      setRes(await r.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Merge / Split Configuration">
        <div className="space-y-3">
          <SelectField label="Operation" value={operation} options={["merge", "split"]} onChange={setOperation} />
          <SelectField label="Merge Strategy" value={strategy} options={["union", "intersection", "weighted", "ai_optimal"]} onChange={setStrategy} />
          <ToggleField label="Preserve History" value={preserve} onChange={setPreserve} />
          <NumField label="Confidence Threshold" value={threshold} min={0.1} max={1.0} step={0.05} onChange={setThreshold} />
          <button onClick={run} disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded disabled:opacity-50">
            {loading ? "Executing..." : "Execute Operation"}
          </button>
        </div>
      </Card>

      {res && (
        <div className="space-y-4">
          <Card title="Operation Result">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Operation ID</span><span className="text-gray-200 font-mono">{(res as Record<string, unknown>).operation_id as string}</span></div>
              <div className="flex gap-2">
                <Badge label={(res as Record<string, unknown>).operation as string} color={(res as Record<string, unknown>).operation === "merge" ? "purple" : "orange"} />
              </div>
              <div className="flex justify-between"><span className="text-gray-400">Target Concept</span><span className="text-gray-200">{(res as Record<string, unknown>).target_concept as string}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Source Count</span><span className="text-gray-200">{(res as Record<string, unknown>).source_profiles_count ?? (Array.isArray(res.source_profiles) ? (res.source_profiles as unknown[]).length : 0)}</span></div>
            </div>
          </Card>
          <Card title="Overlap Analysis">
            {res.overlap_analysis && Object.entries(res.overlap_analysis as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{k.replace(/_/g, " ")}</span>
                <span className="text-gray-300">{typeof v === "number" ? v.toFixed(4) : (Array.isArray(v) ? v.join(", ") : String(v))}</span>
              </div>
            ))}
          </Card>
          <Card title="Result Concept">
            {res.result_concept && Object.entries(res.result_concept as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{k.replace(/_/g, " ")}</span>
                <span className="text-gray-300">{typeof v === "number" ? v.toFixed(4) : String(v)}</span>
              </div>
            ))}
          </Card>
          <Card title="Quality Assessment">
            {res.quality && Object.entries(res.quality as Record<string, number>).map(([k, v]) => (
              <MetricBar key={k} label={k.replace(/_/g, " ")} value={v} />
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Coherence Tab ────────────────────────────────────────
function CoherenceTab() {
  const [scope, setScope] = useState("global");
  const [depth, setDepth] = useState(3);
  const [autoRepair, setAutoRepair] = useState(false);
  const [repairStrat, setRepairStrat] = useState("conservative");
  const [res, setRes] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/graph/causal-ontology/coherence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope, validation_depth: depth, auto_repair: autoRepair,
          repair_strategy: repairStrat,
          check_categories: ["circular", "orphan", "redundant", "contradictory", "incomplete"],
        }),
      });
      setRes(await r.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Coherence Validation Configuration">
        <div className="space-y-3">
          <SelectField label="Scope" value={scope} options={ONTOLOGY_SCOPES} onChange={setScope} />
          <NumField label="Validation Depth" value={depth} min={1} max={6} onChange={setDepth} />
          <ToggleField label="Auto-repair" value={autoRepair} onChange={setAutoRepair} />
          {autoRepair && (
            <SelectField label="Repair Strategy" value={repairStrat}
              options={["conservative", "moderate", "aggressive", "ai_adaptive"]} onChange={setRepairStrat} />
          )}
          <button onClick={run} disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded disabled:opacity-50">
            {loading ? "Validating..." : "Validate Coherence"}
          </button>
        </div>
      </Card>

      {res && (
        <div className="space-y-4">
          <Card title="Hierarchy Stats">
            {res.hierarchy_stats && Object.entries(res.hierarchy_stats as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{k.replace(/_/g, " ")}</span><span className="text-gray-300">{String(v)}</span>
              </div>
            ))}
          </Card>
          <Card title="Coherence Metrics">
            {res.coherence_metrics && Object.entries(res.coherence_metrics as Record<string, number>).map(([k, v]) => (
              <MetricBar key={k} label={k.replace(/_/g, " ")} value={v} />
            ))}
          </Card>
          <Card title="Check Results">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {(res.check_results as Array<Record<string, unknown>>)?.map((cr, i) => (
                <div key={i} className="bg-gray-900/50 rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge label={(cr as Record<string, unknown>).category as string} />
                    <span className="text-xs text-gray-300">{(cr as Record<string, unknown>).issues_found as number} issues</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-xs text-gray-400">
                    <span>C: {((cr as Record<string, unknown>).issues_by_severity as Record<string, number>)?.critical ?? 0}</span>
                    <span>H: {((cr as Record<string, unknown>).issues_by_severity as Record<string, number>)?.high ?? 0}</span>
                    <span>M: {((cr as Record<string, unknown>).issues_by_severity as Record<string, number>)?.medium ?? 0}</span>
                    <span>L: {((cr as Record<string, unknown>).issues_by_severity as Record<string, number>)?.low ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          {res.repair_results && (
            <Card title="Repair Results">
              {Object.entries(res.repair_results as Record<string, unknown>).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{k.replace(/_/g, " ")}</span>
                  <span className="text-gray-300">{typeof v === "number" ? v.toFixed(4) : String(v)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Evolution Tab ────────────────────────────────────────
function EvolutionTab() {
  const [timeRange, setTimeRange] = useState("last_month");
  const [granularity, setGranularity] = useState("daily");
  const [predictions, setPredictions] = useState(true);
  const [res, setRes] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/graph/causal-ontology/evolution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          time_range: timeRange, granularity,
          include_predictions: predictions,
          evolution_types: EVOLUTION_TYPES,
        }),
      });
      setRes(await r.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Evolution Timeline Configuration">
        <div className="space-y-3">
          <SelectField label="Time Range" value={timeRange}
            options={["last_week", "last_month", "last_quarter", "last_year", "all"]} onChange={setTimeRange} />
          <SelectField label="Granularity" value={granularity}
            options={["hourly", "daily", "weekly", "monthly"]} onChange={setGranularity} />
          <ToggleField label="Include Predictions" value={predictions} onChange={setPredictions} />
          <button onClick={run} disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded disabled:opacity-50">
            {loading ? "Analyzing..." : "Analyze Evolution"}
          </button>
        </div>
      </Card>

      {res && (
        <div className="space-y-4">
          <Card title="Evolution Summary">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Evolution ID</span><span className="text-gray-200 font-mono">{(res as Record<string, unknown>).evolution_id as string}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Range (days)</span><span className="text-gray-200">{(res as Record<string, unknown>).range_days as number}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Timeline Buckets</span><span className="text-gray-200">{(res as Record<string, unknown>).n_buckets as number}</span></div>
            </div>
          </Card>
          <Card title="Top Evolution Events">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {(res.top_events as Array<Record<string, unknown>>)?.slice(0, 8).map((evt, i) => (
                <div key={i} className="bg-gray-900/50 rounded p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge label={(evt as Record<string, unknown>).type as string} color={EVO_COLORS[(evt as Record<string, unknown>).type as string] ?? "blue"} />
                    <span className="text-xs text-gray-300">{(evt as Record<string, unknown>).concept as string}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span>Impact: {((evt as Record<string, unknown>).impact_score as number).toFixed(3)}</span>
                    <span>Cascade: {evt.cascade_depth as number}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Trend Analysis">
            {res.trend_analysis && Object.entries(res.trend_analysis as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{k.replace(/_/g, " ")}</span>
                <span className="text-gray-300">{typeof v === "number" ? v.toFixed(4) : String(v)}</span>
              </div>
            ))}
          </Card>
          {res.predictions && (
            <Card title="Predictions">
              {Object.entries(res.predictions as Record<string, unknown>).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{k.replace(/_/g, " ")}</span>
                  <span className="text-gray-300">{typeof v === "number" ? (Number.isInteger(v) ? v : v.toFixed(4)) : String(v)}</span>
                </div>
              ))}
            </Card>
          )}
          <Card title="Phase Detection">
            {(res.phase_detection as Array<Record<string, unknown>>)?.map((ph, i) => (
              <div key={i} className="bg-gray-900/50 rounded p-2 mb-1">
                <div className="flex items-center gap-2">
                  <Badge label={`Phase ${ph.phase as number}`} />
                  <span className="text-xs text-gray-300">{ph.name as string}</span>
                  <span className="text-xs text-gray-500">({ph.start_bucket as number}–{ph.end_bucket as number})</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Dominant: <Badge label={ph.dominant_event as string} color={EVO_COLORS[ph.dominant_event as string] ?? "blue"} />
                  Net change: {ph.net_concept_change as number}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────
function OverviewTab() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/graph/causal-ontology/overview");
      setData(await r.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <button onClick={load} disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded disabled:opacity-50">
        {loading ? "Loading..." : "Load System Overview"}
      </button>

      {data && (
        <>
          <Card title="Engine Info">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-400">Version:</span> <span className="text-gray-200">{data.version as string}</span></div>
              <div><span className="text-gray-400">Engine:</span> <span className="text-gray-200">{data.engine as string}</span></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{data.description as string}</p>
          </Card>

          <Card title="Enums (6 × 6 = 36 values)">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(data.enums as Record<string, string[]>).map(([name, values]) => (
                <div key={name}>
                  <div className="text-xs text-gray-300 font-semibold mb-1">{name}</div>
                  <div className="flex flex-wrap gap-1">
                    {values.map((v) => (
                      <Badge key={v} label={v} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Endpoints (7)">
            <div className="space-y-1">
              {Object.entries(data.endpoints as Record<string, string>).map(([ep, desc]) => (
                <div key={ep} className="flex gap-2 text-xs">
                  <span className="text-indigo-400 font-mono shrink-0">{ep}</span>
                  <span className="text-gray-400">{desc}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Cache Statistics">
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(data.caches as Record<string, number>).map(([name, count]) => (
                <div key={name} className="bg-gray-900/50 rounded p-2 text-center">
                  <div className="text-lg font-bold text-indigo-400">{count}</div>
                  <div className="text-xs text-gray-400">{name}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Architecture Position">
            <div className="text-xs text-gray-400">
              <div className="mb-1">Layer {(data.architecture_position as Record<string, unknown>).layer as number}: {(data.architecture_position as Record<string, unknown>).name as string}</div>
              <div className="mb-1">Sits above: {(data.architecture_position as Record<string, unknown>).sits_above as string}</div>
              <div className="mt-2 space-y-0.5">
                {((data.architecture_position as Record<string, unknown>).pipeline as string[]).map((line, i) => (
                  <div key={i} className="font-mono text-gray-500">{line}</div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Configuration Space">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">{data.configuration_space as string}</div>
              <div className="text-xs text-gray-400 mt-1">6 evolution × 6 change × 6 relation × 6 severity × 6 scope × 6 status</div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function CausalOntologyEvolutionPage() {
  const [tab, setTab] = useState<Tab>("Concept");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-indigo-400">
            Causal Ontology &amp; Concept Evolution Engine
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            v1.273 — Living ontology layer: concept lifecycle, drift detection, semantic merge/split, coherence validation, evolution timeline
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-800 pb-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm rounded-t transition-colors ${
                tab === t
                  ? "bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "Concept" && <ConceptTab />}
        {tab === "Change" && <ChangeTab />}
        {tab === "Drift" && <DriftTab />}
        {tab === "Merge" && <MergeTab />}
        {tab === "Coherence" && <CoherenceTab />}
        {tab === "Evolution" && <EvolutionTab />}
        {tab === "Overview" && <OverviewTab />}
      </div>
    </div>
  );
}
