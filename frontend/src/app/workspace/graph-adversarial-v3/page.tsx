"use client";

import { useState } from "react";

const API = "/api/graph";

const TRAIN_STRATEGIES = ["trades", "mart", "virtual_adversarial", "graph_at", "grand", "robust_gnn"];
const DISTILL_METHODS = ["robust_teacher", "feature_distill", "response_distill", "relation_distill", "contrastive_distill", "ensemble_distill"];
const TEMPORAL_ATTACKS = ["temporal_perturbation", "snapshot_injection", "drift_attack", "causality_attack", "evolution_manipulation", "retrospective_attack"];
const TRANSFER_SCENARIOS = ["same_architecture", "cross_architecture", "cross_task", "cross_domain", "black_box", "query_limited"];
const TRADEOFF_MODES = ["accuracy_first", "balanced", "robustness_first", "certified_preferred", "adaptive", "multi_objective"];
const THREAT_LEVELS = ["low", "medium", "high", "critical"];

const TABS = ["Train", "Distill", "Temporal", "Transfer", "Tradeoff", "Testing", "Summary"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>
      {children}
    </div>
  );
}

function StatBar({ label, value, max = 1 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(4)}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
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

export default function GraphAdversarialV3Page() {
  const [tab, setTab] = useState<Tab>("Train");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

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
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Graph Adversarial Robustness v3</h1>
        <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-2 py-0.5 rounded">v1.212</span>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              tab === t
                ? "bg-red-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Train */}
      {tab === "Train" && (
        <Card title="Advanced Adversarial Training (6 Strategies)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {TRAIN_STRATEGIES.map((s) => (
              <button
                key={s}
                onClick={() => call("/adversarial-v3/train", { strategy: s, num_epochs: 20, attack_strength: 0.5 })}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Training in progress...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.epochs) return <JsonBlock data={result} />;
                const fm = d.final_metrics as Record<string, number>;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Clean Accuracy" value={fm?.clean_accuracy ?? 0} max={1} />
                      <StatBar label="Robust Accuracy" value={fm?.robust_accuracy ?? 0} max={1} />
                      <StatBar label="Robustness Gap" value={fm?.robustness_gap ?? 0} max={0.3} />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Strategy Comparison ({(d.strategy_comparison as unknown[])?.length ?? 0} strategies)</summary>
                      <JsonBlock data={d.strategy_comparison} />
                    </details>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Distill */}
      {tab === "Distill" && (
        <Card title="Distillation-Hardened Defense (6 Methods)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {DISTILL_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => call("/adversarial-v3/distill", { method: m, teacher_robustness: 0.9, student_capacity: 0.7, num_rounds: 10 })}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-orange-50 dark:hover:bg-orange-900 transition-colors"
              >
                {m}
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Distilling knowledge...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.rounds) return <JsonBlock data={result} />;
                const fr = d.final_result as Record<string, number>;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Hardened Accuracy" value={fr?.hardened_accuracy ?? 0} max={1} />
                      <StatBar label="Robustness Gain" value={fr?.total_robustness_gain ?? 0} max={0.3} />
                      <StatBar label="Gap Closed" value={fr?.teacher_student_gap_closed ?? 0} max={1} />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Method Comparison ({(d.method_comparison as unknown[])?.length ?? 0} methods)</summary>
                      <JsonBlock data={d.method_comparison} />
                    </details>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Temporal */}
      {tab === "Temporal" && (
        <Card title="Temporal Attack Defense (6 Attack Types)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {TEMPORAL_ATTACKS.map((a) => (
              <button
                key={a}
                onClick={() => call("/adversarial-v3/temporal-defense", { attack_type: a, num_snapshots: 15, defense_strategy: "adaptive", attack_intensity: 0.6 })}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors"
              >
                {a}
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Analyzing temporal threats...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.snapshots) return <JsonBlock data={result} />;
                const ds = d.defense_summary as Record<string, unknown>;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Overall Defense Rate" value={(ds?.overall_defense_rate as number) ?? 0} max={1} />
                      <StatBar label="Total Damage" value={(ds?.total_damage_accumulated as number) ?? 0} max={5} />
                      <StatBar label="Adaptation Speed" value={(ds?.adaptation_speed as number) ?? 0} max={2} />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Attack Comparison ({(d.attack_comparison as unknown[])?.length ?? 0} types)</summary>
                      <JsonBlock data={d.attack_comparison} />
                    </details>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Transfer */}
      {tab === "Transfer" && (
        <Card title="Adversarial Transferability (6 Scenarios)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {TRANSFER_SCENARIOS.map((s) => (
              <button
                key={s}
                onClick={() => call("/adversarial-v3/transfer", { scenario: s, num_attacks: 20, source_model: "GCN", target_model: "GAT" })}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Analyzing transferability...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.attacks) return <JsonBlock data={result} />;
                const ts = d.transfer_summary as Record<string, unknown>;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Avg Transfer Rate" value={(ts?.avg_transfer_rate as number) ?? 0} max={1} />
                      <StatBar label="Max Transfer Rate" value={(ts?.max_transfer_rate as number) ?? 0} max={1} />
                      <StatBar label="High Transfer Attacks" value={(ts?.high_transfer_attacks as number) ?? 0} max={20} />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Scenario Comparison ({(d.scenario_comparison as unknown[])?.length ?? 0} scenarios)</summary>
                      <JsonBlock data={d.scenario_comparison} />
                    </details>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Tradeoff */}
      {tab === "Tradeoff" && (
        <Card title="Robustness-Utility Tradeoff (6 Modes)">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {TRADEOFF_MODES.map((m) => (
              <button
                key={m}
                onClick={() => call("/adversarial-v3/tradeoff", { tradeoff_mode: m, num_points: 20, accuracy_weight: 0.5, robustness_weight: 0.5 })}
                className="px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 rounded hover:bg-green-50 dark:hover:bg-green-900 transition-colors"
              >
                {m}
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Optimizing tradeoff...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.pareto_points) return <JsonBlock data={result} />;
                const ep = d.extreme_points as Record<string, Record<string, number>>;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Best Accuracy" value={ep?.best_accuracy?.accuracy ?? 0} max={1} />
                      <StatBar label="Best Robustness" value={ep?.best_robustness?.robustness_score ?? 0} max={1} />
                      <StatBar label="Best Composite" value={ep?.best_composite?.composite_score ?? 0} max={1} />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Pareto Front ({(d.pareto_front as unknown[])?.length ?? 0} points)</summary>
                      <JsonBlock data={d.pareto_front} />
                    </details>
                  </>
                );
              })()}
            </div>
          )}
        </Card>
      )}

      {/* Testing */}
      {tab === "Testing" && (
        <Card title="Automated Adversarial Testing Pipeline">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {THREAT_LEVELS.map((t) => (
              <button
                key={t}
                onClick={() => call("/adversarial-v3/testing", { num_attacks: 6, num_defenses: 6, test_budget: 1000, threat_level: t })}
                className={`px-2 py-1.5 text-xs rounded transition-colors ${
                  t === "critical"
                    ? "bg-red-50 dark:bg-red-900 hover:bg-red-100 text-red-700 dark:text-red-200"
                    : t === "high"
                    ? "bg-orange-50 dark:bg-orange-900 hover:bg-orange-100 text-orange-700 dark:text-orange-200"
                    : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {t} threat
              </button>
            ))}
          </div>
          {loading && <p className="text-xs text-gray-500 animate-pulse">Running adversarial tests...</p>}
          {result && (
            <div className="space-y-3">
              {(() => {
                const d = result as Record<string, unknown>;
                if (!d || !d.attacks) return <JsonBlock data={result} />;
                const rs = d.robustness_score as Record<string, unknown>;
                const ts = d.test_summary as Record<string, unknown>;
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <StatBar label="Overall Robustness" value={(rs?.overall_robustness as number) ?? 0} max={1} />
                      <StatBar label="Certified Robustness" value={(rs?.certified_robustness as number) ?? 0} max={1} />
                      <StatBar label="Attack Success Rate" value={(ts?.total_attack_success_rate as number) ?? 0} max={1} />
                    </div>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Attack-Defense Matrix</summary>
                      <JsonBlock data={d.attack_defense_matrix} />
                    </details>
                    <details>
                      <summary className="text-xs cursor-pointer text-gray-500">Recommendations ({(d.recommendations as unknown[])?.length ?? 0})</summary>
                      <JsonBlock data={d.recommendations} />
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
                const res = await fetch(`${API}/adversarial-v3/summary`);
                setResult(await res.json());
              } catch (e) { setResult({ error: String(e) }); }
              setLoading(false);
            }}
            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
          >
            Load Summary
          </button>
          {result && <JsonBlock data={result} />}
        </Card>
      )}
    </div>
  );
}
