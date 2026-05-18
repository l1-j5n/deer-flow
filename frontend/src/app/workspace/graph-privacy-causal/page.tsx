"use client";

import { useState } from "react";

const API = "/api/graph";

const PRIVACY_MECHANISMS = ["gaussian", "laplacian", "exponential", "analytic_gaussian", "truncated", "renyi_dp"];
const PRIVACY_LEVELS = ["edge_dp", "node_dp", "attribute_dp", "relationship_dp", "subgraph_dp", "distribution_dp"];
const FEDERATED_PRIVACY = ["local_dp", "global_dp", "shuffled_dp", "hybrid_dp", "cds_dp", "split_dp"];
const AUDIT_TYPES = ["epsilon_audit", "composition_audit", "leakage_audit", "membership_inference", "attribute_inference", "model_inversion"];
const SECURE_METHODS = ["secret_sharing", "homomorphic", "tee_based", "secure_mpc", "functional_enc", "trusted_aggregator"];
const TRADEOFF_METRICS = ["causal_f1", "structural_hamming", "intervention_accuracy", "ate_error", "privacy_overhead", "information_gain"];
const ALLOCATION_STRATEGIES = ["uniform", "adaptive", "prioritized", "exponential_decay", "round_robin", "reserved"];
const RENEWAL_POLICIES = ["daily", "weekly", "monthly", "none"];

const TABS = ["DP Discovery", "Federated", "Audit", "Budget", "Secure Agg", "Tradeoff", "Summary"] as const;
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
        <span className="font-mono text-gray-800 dark:text-gray-200">{typeof value === "number" ? value.toFixed(4) : value}</span>
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

export default function GraphPrivacyCausalPage() {
  const [tab, setTab] = useState<Tab>("DP Discovery");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // DP Discovery state
  const [dpMechanism, setDpMechanism] = useState("gaussian");
  const [dpLevel, setDpLevel] = useState("edge_dp");
  const [dpEpsilon, setDpEpsilon] = useState(1.0);
  const [dpDelta, setDpDelta] = useState(0.00001);
  const [dpNumVars, setDpNumVars] = useState(20);
  const [dpMaxParents, setDpMaxParents] = useState(5);

  // Federated state
  const [fedPrivacy, setFedPrivacy] = useState("local_dp");
  const [fedClients, setFedClients] = useState(5);
  const [fedEpsLocal, setFedEpsLocal] = useState(0.5);
  const [fedRounds, setFedRounds] = useState(10);
  const [fedMethod, setFedMethod] = useState("pc_algorithm");

  // Audit state
  const [auditType, setAuditType] = useState("epsilon_audit");
  const [auditEpsTotal, setAuditEpsTotal] = useState(5.0);
  const [auditQueries, setAuditQueries] = useState(50);
  const [auditDepth, setAuditDepth] = useState(3);

  // Budget state
  const [budgetTotal, setBudgetTotal] = useState(10.0);
  const [budgetOps, setBudgetOps] = useState(20);
  const [budgetStrategy, setBudgetStrategy] = useState("adaptive");
  const [budgetRenewal, setBudgetRenewal] = useState("daily");

  // Secure Aggregation state
  const [secMethod, setSecMethod] = useState("secret_sharing");
  const [secParties, setSecParties] = useState(5);
  const [secThreshold, setSecThreshold] = useState(3);
  const [secGraphSize, setSecGraphSize] = useState(30);

  // Tradeoff state
  const [trMetric, setTrMetric] = useState("causal_f1");
  const [trNoiseMult, setTrNoiseMult] = useState(0.3);
  const [trRounds, setTrRounds] = useState(100);

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

  const renderDPDiscovery = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="DP Causal Discovery">
        <SelectField label="Mechanism" value={dpMechanism} onChange={setDpMechanism} options={PRIVACY_MECHANISMS} />
        <SelectField label="Privacy Level" value={dpLevel} onChange={setDpLevel} options={PRIVACY_LEVELS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Epsilon (ε)</label>
          <input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dpEpsilon} onChange={(e) => setDpEpsilon(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Delta (δ)</label>
          <input type="number" step="0.00001" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dpDelta} onChange={(e) => setDpDelta(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Variables</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dpNumVars} onChange={(e) => setDpNumVars(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Parents</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={dpMaxParents} onChange={(e) => setDpMaxParents(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/privacy-causal/dp-discovery", {
            graph_id: "dp_causal_01", mechanism: dpMechanism, privacy_level: dpLevel,
            epsilon: dpEpsilon, delta: dpDelta, num_variables: dpNumVars, max_parents: dpMaxParents,
          })}
        >
          {loading ? "Discovering..." : "Run DP Discovery"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "noise_analysis" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const noise = d.noise_analysis as Record<string, unknown>;
          const disc = d.discovery as Record<string, unknown>;
          const metrics = d.metrics as Record<string, unknown>;
          const accounting = d.privacy_accounting as Record<string, unknown>;
          return (
            <>
              <Card title="Noise Analysis">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{String(noise?.noise_scale)}</div>
                    <div className="text-xs text-gray-500">Noise Scale</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-mono text-purple-600">{String(noise?.privacy_guarantee)}</div>
                    <div className="text-xs text-gray-500">Guarantee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{String(noise?.effective_epsilon)}</div>
                    <div className="text-xs text-gray-500">Effective ε</div>
                  </div>
                </div>
              </Card>
              <Card title="Discovery Metrics">
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-600">{String(disc?.true_edges)}</div>
                    <div className="text-xs text-gray-500">True Edges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{String(disc?.discovered_edges)}</div>
                    <div className="text-xs text-gray-500">Discovered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-500">{String(disc?.false_positives)}</div>
                    <div className="text-xs text-gray-500">False +</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-500">{String(disc?.false_negatives)}</div>
                    <div className="text-xs text-gray-500">False -</div>
                  </div>
                </div>
                <StatBar label="Precision" value={Number(metrics?.precision || 0)} color="bg-blue-500" />
                <StatBar label="Recall" value={Number(metrics?.recall || 0)} color="bg-emerald-500" />
                <StatBar label="F1 Score" value={Number(metrics?.f1_score || 0)} color="bg-purple-500" />
                <div className="mt-2 text-xs text-gray-500">SHD: {String(metrics?.structural_hamming_distance)} | ε Spent: {String(accounting?.epsilon_spent)}</div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderFederated = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Federated Causal Inference">
        <SelectField label="Privacy Type" value={fedPrivacy} onChange={setFedPrivacy} options={FEDERATED_PRIVACY} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Clients</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fedClients} onChange={(e) => setFedClients(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Local Epsilon</label>
          <input type="number" step="0.1" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fedEpsLocal} onChange={(e) => setFedEpsLocal(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Communication Rounds</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={fedRounds} onChange={(e) => setFedRounds(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/privacy-causal/federated", {
            graph_id: "fed_causal_01", privacy_type: fedPrivacy, num_clients: fedClients,
            epsilon_local: fedEpsLocal, communication_rounds: fedRounds, causal_method: fedMethod,
          })}
        >
          {loading ? "Inferring..." : "Run Federated Inference"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "federated_results" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const fedRes = d.federated_results as Record<string, unknown>;
          const sec = d.security as Record<string, unknown>;
          const clients = (d.client_details || []) as Array<Record<string, unknown>>;
          return (
            <>
              <Card title="Federated Results">
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{String(fedRes?.consensus_edges)}</div>
                    <div className="text-xs text-gray-500">Consensus</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{String(fedRes?.aggregated_precision)}</div>
                    <div className="text-xs text-gray-500">Precision</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{String(fedRes?.aggregated_recall)}</div>
                    <div className="text-xs text-gray-500">Recall</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600">{String(fedRes?.num_local_graphs)}</div>
                    <div className="text-xs text-gray-500">Clients</div>
                  </div>
                </div>
              </Card>
              <Card title="Security Assessment">
                <StatBar label="Inference Resistance" value={Number(sec?.inference_resistance || 0)} color="bg-emerald-500" />
                <StatBar label="Audit Compliance" value={Number(sec?.audit_compliance || 0)} color="bg-blue-500" />
                <div className="text-xs text-gray-500">Leakage Risk: <Badge text={String(sec?.data_leakage_risk)} color="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" /></div>
              </Card>
              <Card title="Client Details">
                <div className="space-y-1">
                  {clients.map((c, i) => (
                    <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                      <span className="font-mono font-medium">Client {String(c.client_id)}</span>
                      <span>Edges: {String(c.local_edges)}</span>
                      <span>Prec: {String(c.local_precision)}</span>
                      <span>Cost: {String(c.privacy_cost)}</span>
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

  const renderAudit = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Privacy Audit">
        <SelectField label="Audit Type" value={auditType} onChange={setAuditType} options={AUDIT_TYPES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Epsilon</label>
          <input type="number" step="0.5" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={auditEpsTotal} onChange={(e) => setAuditEpsTotal(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Num Queries</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={auditQueries} onChange={(e) => setAuditQueries(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Audit Depth</label>
          <input type="number" min={1} max={5} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={auditDepth} onChange={(e) => setAuditDepth(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/privacy-causal/audit", {
            graph_id: "audit_01", audit_type: auditType, epsilon_total: auditEpsTotal,
            num_queries: auditQueries, audit_depth: auditDepth,
          })}
        >
          {loading ? "Auditing..." : "Run Audit"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "results" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const results = d.results as Record<string, unknown>;
          const events = (d.events || []) as Array<Record<string, unknown>>;
          const recs = (d.recommendations || []) as Array<Record<string, unknown>>;
          return (
            <>
              <Card title="Audit Results">
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-600">{String(results?.total_events)}</div>
                    <div className="text-xs text-gray-500">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{String(results?.passed)}</div>
                    <div className="text-xs text-gray-500">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{String(results?.failed)}</div>
                    <div className="text-xs text-gray-500">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{String(results?.pass_rate)}</div>
                    <div className="text-xs text-gray-500">Pass Rate</div>
                  </div>
                </div>
                <StatBar label="Overall Risk" value={Number(d.overall_risk || 0)} color="bg-red-500" />
              </Card>
              <Card title="Events">
                <div className="space-y-1 max-h-40 overflow-auto">
                  {events.map((e, i) => (
                    <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1">
                      <span className="font-mono">{String(e.event_id)}</span>
                      <span>{String(e.query_type)}</span>
                      <span>ε: {String(e.epsilon_used)}</span>
                      <Badge text={e.passed ? "PASS" : "FAIL"} color={e.passed ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"} />
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Recommendations">
                {recs.map((r, i) => (
                  <div key={i} className="flex justify-between text-xs mb-1">
                    <Badge text={String(r.priority)} color={r.priority === "high" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : r.priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"} />
                    <span>{String(r.action)}</span>
                    <span className="font-mono">Impact: {String(r.impact)}</span>
                  </div>
                ))}
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderBudget = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Privacy Budget">
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Epsilon</label>
          <input type="number" step="0.5" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={budgetTotal} onChange={(e) => setBudgetTotal(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Operations</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={budgetOps} onChange={(e) => setBudgetOps(+e.target.value)} />
        </div>
        <SelectField label="Strategy" value={budgetStrategy} onChange={setBudgetStrategy} options={ALLOCATION_STRATEGIES} />
        <SelectField label="Renewal" value={budgetRenewal} onChange={setBudgetRenewal} options={RENEWAL_POLICIES} />
        <button
          className="w-full mt-2 rounded bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/privacy-causal/budget", {
            graph_id: "budget_01", total_epsilon: budgetTotal, total_delta: 1e-5,
            num_operations: budgetOps, allocation_strategy: budgetStrategy, renewal_policy: budgetRenewal,
          })}
        >
          {loading ? "Allocating..." : "Manage Budget"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "summary" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const summary = d.summary as Record<string, unknown>;
          const allocations = (d.allocations || []) as Array<Record<string, unknown>>;
          const renewal = d.renewal as Record<string, unknown>;
          return (
            <>
              <Card title="Budget Summary">
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-600">{String(summary?.total_budget)}</div>
                    <div className="text-xs text-gray-500">Total ε</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{String(summary?.consumed)}</div>
                    <div className="text-xs text-gray-500">Consumed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{String(summary?.remaining)}</div>
                    <div className="text-xs text-gray-500">Remaining</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{String(summary?.utilization_rate)}</div>
                    <div className="text-xs text-gray-500">Utilization</div>
                  </div>
                </div>
                <StatBar label="Utilization" value={Number(summary?.utilization_rate || 0)} color="bg-teal-500" />
              </Card>
              <Card title="Allocations">
                <div className="space-y-1">
                  {allocations.map((a, i) => (
                    <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                      <span className="font-mono">Op {String(a.operation_id)}</span>
                      <span>Alloc: {String(a.allocated_epsilon)}</span>
                      <span>Used: {String(a.consumed_epsilon)}</span>
                      <span>Left: {String(a.remaining_budget)}</span>
                      <Badge text={String(a.status)} color={a.status === "consumed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"} />
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Renewal">
                <div className="text-xs">Policy: <Badge text={String(renewal?.policy)} /> | Next: {String(renewal?.next_renewal)} | Amount: {String(renewal?.renewal_amount)}</div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderSecureAgg = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Secure Aggregation">
        <SelectField label="Method" value={secMethod} onChange={setSecMethod} options={SECURE_METHODS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Parties</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={secParties} onChange={(e) => setSecParties(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Threshold</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={secThreshold} onChange={(e) => setSecThreshold(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graph Size</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={secGraphSize} onChange={(e) => setSecGraphSize(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/privacy-causal/secure-aggregation", {
            graph_id: "sec_agg_01", method: secMethod, num_parties: secParties,
            threshold: secThreshold, causal_graph_size: secGraphSize,
          })}
        >
          {loading ? "Aggregating..." : "Secure Aggregate"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "aggregation" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const agg = d.aggregation as Record<string, unknown>;
          const perf = d.performance as Record<string, unknown>;
          const secAnalysis = d.security_analysis as Record<string, unknown>;
          const parties = (d.party_details || []) as Array<Record<string, unknown>>;
          return (
            <>
              <Card title="Aggregation Results">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-violet-600">{String(agg?.total_edges_aggregated)}</div>
                    <div className="text-xs text-gray-500">Edges Aggregated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{String(agg?.consensus_edges)}</div>
                    <div className="text-xs text-gray-500">Consensus</div>
                  </div>
                </div>
                <StatBar label="Accuracy" value={Number(agg?.aggregation_accuracy || 0)} color="bg-violet-500" />
              </Card>
              <Card title="Security & Performance">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Collusion Resistance</div>
                    <div className="text-sm font-mono">{String(secAnalysis?.collusion_resistance)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Privacy Amplification</div>
                    <div className="text-sm font-mono">{String(secAnalysis?.privacy_amplification)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div><span className="text-gray-500">Rounds</span><div className="font-mono">{String(perf?.communication_rounds)}</div></div>
                  <div><span className="text-gray-500">Data KB</span><div className="font-mono">{String(perf?.total_data_sent_kb)}</div></div>
                  <div><span className="text-gray-500">Time ms</span><div className="font-mono">{String(perf?.computation_time_ms)}</div></div>
                </div>
              </Card>
              <Card title="Party Details">
                <div className="space-y-1">
                  {parties.map((p, i) => (
                    <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                      <span className="font-mono">Party {String(p.party_id)}</span>
                      <span>Edges: {String(p.edges_contributed)}</span>
                      <span>Noise: {String(p.noise_added)}</span>
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

  const renderTradeoff = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card title="Privacy-Utility Tradeoff">
        <SelectField label="Metric" value={trMetric} onChange={setTrMetric} options={TRADEOFF_METRICS} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Noise Multiplier</label>
          <input type="number" step="0.05" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trNoiseMult} onChange={(e) => setTrNoiseMult(+e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Evaluation Rounds</label>
          <input type="number" className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trRounds} onChange={(e) => setTrRounds(+e.target.value)} />
        </div>
        <button
          className="w-full mt-2 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 disabled:opacity-50"
          disabled={loading}
          onClick={() => callApi("/privacy-causal/tradeoff", {
            graph_id: "tradeoff_01", metric: trMetric,
            epsilon_range: [0.1, 0.5, 1.0, 2.0, 5.0, 10.0],
            noise_multiplier: trNoiseMult, evaluation_rounds: trRounds,
          })}
        >
          {loading ? "Analyzing..." : "Analyze Tradeoff"}
        </button>
      </Card>
      <div className="lg:col-span-2 space-y-4">
        {result && typeof result === "object" && result !== null && "tradeoff_curve" in (result as Record<string, unknown>) && (() => {
          const d = result as Record<string, unknown>;
          const curve = (d.tradeoff_curve || []) as Array<Record<string, unknown>>;
          const analysis = d.analysis as Record<string, unknown>;
          const recs = d.recommendations as Record<string, unknown>;
          return (
            <>
              <Card title="Tradeoff Analysis">
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-600">{String(analysis?.baseline_performance)}</div>
                    <div className="text-xs text-gray-500">Baseline</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600">{String(analysis?.optimal_epsilon)}</div>
                    <div className="text-xs text-gray-500">Optimal ε</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{String(analysis?.optimal_utility)}</div>
                    <div className="text-xs text-gray-500">Optimal Utility</div>
                  </div>
                </div>
              </Card>
              <Card title="Tradeoff Curve">
                <div className="space-y-1">
                  {curve.map((pt, i) => (
                    <div key={i} className="flex justify-between text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5">
                      <span className="font-mono">ε = {String(pt.epsilon)}</span>
                      <span>Utility: {String(pt.utility)}</span>
                      <span>Noise: {String(pt.noise_scale)}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Recommendations">
                <div className="text-xs space-y-1">
                  <div>Suggested ε: <Badge text={String(recs?.suggested_epsilon)} color="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" /></div>
                  <div>Expected Drop: {String(recs?.expected_utility_drop)}</div>
                  <div>CI: [{String(Array.isArray(recs?.confidence_interval) ? (recs?.confidence_interval as number[])[0] : "")}, {String(Array.isArray(recs?.confidence_interval) ? (recs?.confidence_interval as number[])[1] : "")}]</div>
                </div>
              </Card>
            </>
          );
        })()}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div>
      <button
        className="rounded bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 disabled:opacity-50 mb-4"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          try {
            const res = await fetch(`${API}/privacy-causal/summary`);
            setResult(await res.json());
          } catch (err) { setResult({ error: String(err) }); }
          setLoading(false);
        }}
      >
        {loading ? "Loading..." : "Load Summary"}
      </button>
      {result && <JsonBlock data={result} />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Graph Privacy-Preserving Causal Engine</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.217 — Differential privacy for causal discovery, federated inference, secure aggregation, and privacy-utility tradeoff analysis</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === t ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"}`}
              onClick={() => { setTab(t); setResult(null); }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "DP Discovery" && renderDPDiscovery()}
        {tab === "Federated" && renderFederated()}
        {tab === "Audit" && renderAudit()}
        {tab === "Budget" && renderBudget()}
        {tab === "Secure Agg" && renderSecureAgg()}
        {tab === "Tradeoff" && renderTradeoff()}
        {tab === "Summary" && renderSummary()}
      </div>
    </div>
  );
}
