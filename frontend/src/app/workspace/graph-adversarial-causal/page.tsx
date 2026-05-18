'use client';

import { useState } from 'react';
import {
  AdversarialAttackType,
  DefenseMechanism,
  RobustnessMetric,
  AttackSurface,
  PerturbationBudget,
  RobustnessCertification,
  generateAdversarialAttack,
  applyDefense,
  assessRobustness,
  certifyRobustness,
  hardenModel,
  auditAdversarialVulnerabilities,
} from '@/core/adversarial-causal/api';
import {
  useAdversarialAttack,
  useAdversarialDefense,
  useRobustnessAssessment,
  useRobustnessCertification,
  useModelHardening,
  useAdversarialAudit,
} from '@/core/adversarial-causal/hooks';

// Tab definitions
const TABS = [
  { id: 'attack', label: 'Attack' },
  { id: 'defend', label: 'Defend' },
  { id: 'assess', label: 'Assess' },
  { id: 'certify', label: 'Certify' },
  { id: 'harden', label: 'Harden' },
  { id: 'audit', label: 'Audit' },
  { id: 'overview', label: 'Overview' },
];

const ATTACK_TYPES = Object.values(AdversarialAttackType);
const DEFENSE_MECHANISMS = Object.values(DefenseMechanism);
const ROBUSTNESS_METRICS = Object.values(RobustnessMetric);
const ATTACK_SURFACES = Object.values(AttackSurface);
const PERTURBATION_BUDGETS = Object.values(PerturbationBudget);
const CERTIFICATION_METHODS = Object.values(RobustnessCertification);

export default function AdversarialCausalPage() {
  const [activeTab, setActiveTab] = useState('attack');
  const [graphId, setGraphId] = useState('demo-graph');

  // Form states
  const [attackType, setAttackType] = useState<AdversarialAttackType>(AdversarialAttackType.STRUCTURE_PERTURBATION);
  const [surface, setSurface] = useState<AttackSurface>(AttackSurface.EDGE_REMOVAL);
  const [budget, setBudget] = useState<PerturbationBudget>(PerturbationBudget.LP_NORM);
  const [budgetValue, setBudgetValue] = useState(0.1);
  const [nAttacks, setNAttacks] = useState(5);

  const [defenseMechanism, setDefenseMechanism] = useState<DefenseMechanism>(DefenseMechanism.ADVERSARIAL_TRAINING);
  const [defenseBudget, setDefenseBudget] = useState(0.5);

  const [metrics, setMetrics] = useState<RobustnessMetric[]>([RobustnessMetric.STRUCTURE_STABILITY]);
  const [attackScenarios, setAttackScenarios] = useState<AdversarialAttackType[]>([AdversarialAttackType.STRUCTURE_PERTURBATION]);

  const [certMethod, setCertMethod] = useState<RobustnessCertification>(RobustnessCertification.LIPSCHITZ_CERTIFICATE);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);

  const [hardeningLevel, setHardeningLevel] = useState(0.8);
  const [targetAttacks, setTargetAttacks] = useState<AdversarialAttackType[]>([AdversarialAttackType.DATA_POISONING]);

  const [auditDepth, setAuditDepth] = useState(3);
  const [auditSurfaces, setAuditSurfaces] = useState<AttackSurface[]>([AttackSurface.NODE_INJECTION]);

  // API calls
  const attackMutation = useAdversarialAttack();
  const defenseMutation = useAdversarialDefense();
  const assessMutation = useRobustnessAssessment();
  const certifyMutation = useRobustnessCertification();
  const hardenMutation = useModelHardening();
  const auditMutation = useAdversarialAudit();

  const handleAttack = async () => {
    await attackMutation.mutateAsync({
      graph_id: graphId,
      attack_type: attackType,
      surface,
      budget,
      budget_value: budgetValue,
      n_attacks: nAttacks,
    });
  };

  const handleDefense = async () => {
    await defenseMutation.mutateAsync({
      graph_id: graphId,
      mechanism: defenseMechanism,
      attack_types: attackScenarios,
      defense_budget: defenseBudget,
    });
  };

  const handleAssess = async () => {
    await assessMutation.mutateAsync({
      graph_id: graphId,
      metrics,
      attack_scenarios: attackScenarios,
    });
  };

  const handleCertify = async () => {
    await certifyMutation.mutateAsync({
      graph_id: graphId,
      method: certMethod,
      confidence_level: confidenceLevel,
      perturbation_type: budget,
    });
  };

  const handleHarden = async () => {
    await hardenMutation.mutateAsync({
      graph_id: graphId,
      target_attack_types: targetAttacks,
      hardening_level: hardeningLevel,
    });
  };

  const handleAudit = async () => {
    await auditMutation.mutateAsync({
      graph_id: graphId,
      audit_depth: auditDepth,
      surfaces: auditSurfaces,
    });
  };

  const currentMutation = () => {
    switch (activeTab) {
      case 'attack': return attackMutation;
      case 'defend': return defenseMutation;
      case 'assess': return assessMutation;
      case 'certify': return certifyMutation;
      case 'harden': return hardenMutation;
      case 'audit': return auditMutation;
      default: return null;
    }
  };

  const isLoading = currentMutation()?.isPending ?? false;
  const data = currentMutation()?.data?.result;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Graph Adversarial Causal Robustness Engine
          </h1>
          <p className="text-gray-400 mt-2">
            v1.237.0 — Adversarial attack generation, defense, certification, and hardening for causal models
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Graph ID Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Graph ID</label>
          <input
            type="text"
            value={graphId}
            onChange={(e) => setGraphId(e.target.value)}
            className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
            placeholder="Enter graph ID"
          />
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          {activeTab === 'attack' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-orange-400">Generate Adversarial Attacks</h2>
              <p className="text-gray-400">Test causal model robustness by generating adversarial attacks</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Attack Type</label>
                  <select
                    value={attackType}
                    onChange={(e) => setAttackType(e.target.value as AdversarialAttackType)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                  >
                    {ATTACK_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Attack Surface</label>
                  <select
                    value={surface}
                    onChange={(e) => setSurface(e.target.value as AttackSurface)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                  >
                    {ATTACK_SURFACES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Perturbation Budget</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value as PerturbationBudget)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                  >
                    {PERTURBATION_BUDGETS.map((b) => (
                      <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Budget Value ({budgetValue})</label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Number of Attacks ({nAttacks})</label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={nAttacks}
                    onChange={(e) => setNAttacks(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={handleAttack}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate Attacks'}
              </button>
            </div>
          )}

          {activeTab === 'defend' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-orange-400">Apply Defense Mechanisms</h2>
              <p className="text-gray-400">Protect causal models against adversarial attacks</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Defense Mechanism</label>
                  <select
                    value={defenseMechanism}
                    onChange={(e) => setDefenseMechanism(e.target.value as DefenseMechanism)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                  >
                    {DEFENSE_MECHANISMS.map((d) => (
                      <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Defense Budget ({defenseBudget})</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={defenseBudget}
                    onChange={(e) => setDefenseBudget(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={handleDefense}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Applying Defense...' : 'Apply Defense'}
              </button>
            </div>
          )}

          {activeTab === 'assess' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-orange-400">Assess Robustness Metrics</h2>
              <p className="text-gray-400">Evaluate model robustness across attack scenarios</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Metrics to Assess</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ROBUSTNESS_METRICS.map((m) => (
                      <label key={m} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={metrics.includes(m as never)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMetrics([...metrics, m as never]);
                            } else {
                              setMetrics(metrics.filter((x) => x !== m));
                            }
                          }}
                          className="rounded bg-gray-800 border-gray-700"
                        />
                        <span className="text-sm">{m.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAssess}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Assessing...' : 'Assess Robustness'}
              </button>
            </div>
          )}

          {activeTab === 'certify' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-orange-400">Certify Robustness Bounds</h2>
              <p className="text-gray-400">Provide formal or statistical robustness guarantees</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Certification Method</label>
                  <select
                    value={certMethod}
                    onChange={(e) => setCertMethod(e.target.value as RobustnessCertification)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                  >
                    {CERTIFICATION_METHODS.map((c) => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Confidence Level ({confidenceLevel * 100}%)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="0.99"
                    step="0.01"
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={handleCertify}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Certifying...' : 'Certify Robustness'}
              </button>
            </div>
          )}

          {activeTab === 'harden' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-orange-400">Harden Causal Model</h2>
              <p className="text-gray-400">Apply comprehensive hardening against targeted attacks</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Target Attack Types</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ATTACK_TYPES.map((a) => (
                      <label key={a} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={targetAttacks.includes(a as never)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTargetAttacks([...targetAttacks, a as never]);
                            } else {
                              setTargetAttacks(targetAttacks.filter((x) => x !== a));
                            }
                          }}
                          className="rounded bg-gray-800 border-gray-700"
                        />
                        <span className="text-sm">{a.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hardening Level ({hardeningLevel * 100}%)</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={hardeningLevel}
                    onChange={(e) => setHardeningLevel(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={handleHarden}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Hardening...' : 'Harden Model'}
              </button>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-orange-400">Audit Adversarial Vulnerabilities</h2>
              <p className="text-gray-400">Comprehensive vulnerability audit across attack surfaces</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Audit Depth ({auditDepth})</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={auditDepth}
                    onChange={(e) => setAuditDepth(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Attack Surfaces</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ATTACK_SURFACES.map((s) => (
                      <label key={s} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={auditSurfaces.includes(s as never)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAuditSurfaces([...auditSurfaces, s as never]);
                            } else {
                              setAuditSurfaces(auditSurfaces.filter((x) => x !== s));
                            }
                          }}
                          className="rounded bg-gray-800 border-gray-700"
                        />
                        <span className="text-sm">{s.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleAudit}
                disabled={isLoading}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Auditing...' : 'Run Audit'}
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-orange-400">Engine Overview</h2>
              <p className="text-gray-400">v1.237.0 — Graph Adversarial Causal Robustness Engine</p>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="font-semibold text-orange-300 mb-4">Endpoints</h3>
                <ul className="space-y-2 text-sm">
                  <li><code className="text-orange-400">POST /adversarial-causal/attack</code> — Generate adversarial attacks</li>
                  <li><code className="text-orange-400">POST /adversarial-causal/defend</code> — Apply defense mechanisms</li>
                  <li><code className="text-orange-400">POST /adversarial-causal/assess</code> — Assess robustness metrics</li>
                  <li><code className="text-orange-400">POST /adversarial-causal/certify</code> — Certify robustness bounds</li>
                  <li><code className="text-orange-400">POST /adversarial-causal/harden</code> — Harden causal models</li>
                  <li><code className="text-orange-400">POST /adversarial-causal/audit</code> — Audit vulnerabilities</li>
                  <li><code className="text-orange-400">GET /adversarial-causal/overview</code> — Engine overview</li>
                </ul>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="font-semibold text-orange-300 mb-4">Enums (6 × 6 = 36 values)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="text-gray-300 mb-2">AdversarialAttackType</h4>
                    <ul className="text-gray-500 space-y-1">
                      {ATTACK_TYPES.map((t) => (
                        <li key={t}>• {t.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gray-300 mb-2">DefenseMechanism</h4>
                    <ul className="text-gray-500 space-y-1">
                      {DEFENSE_MECHANISMS.map((d) => (
                        <li key={d}>• {d.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gray-300 mb-2">RobustnessMetric</h4>
                    <ul className="text-gray-500 space-y-1">
                      {ROBUSTNESS_METRICS.map((m) => (
                        <li key={m}>• {m.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gray-300 mb-2">AttackSurface</h4>
                    <ul className="text-gray-500 space-y-1">
                      {ATTACK_SURFACES.map((s) => (
                        <li key={s}>• {s.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gray-300 mb-2">PerturbationBudget</h4>
                    <ul className="text-gray-500 space-y-1">
                      {PERTURBATION_BUDGETS.map((b) => (
                        <li key={b}>• {b.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-gray-300 mb-2">RobustnessCertification</h4>
                    <ul className="text-gray-500 space-y-1">
                      {CERTIFICATION_METHODS.map((c) => (
                        <li key={c}>• {c.replace(/_/g, ' ')}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="font-semibold text-orange-300 mb-4">Integration</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-orange-400 font-medium">v1.236</div>
                    <div className="text-gray-500">Program Synthesis</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-medium">v1.235</div>
                    <div className="text-gray-500">Multi-Scale Causal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-medium">v1.233</div>
                    <div className="text-gray-500">Topology Intervention</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-medium">v1.225</div>
                    <div className="text-gray-500">Neuro-Symbolic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-medium">v1.227</div>
                    <div className="text-gray-500">Robustness</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {data && (
            <div className="mt-8 bg-gray-800/50 border border-gray-700 rounded-lg p-4 overflow-x-auto">
              <h3 className="font-semibold text-orange-400 mb-4">Results</h3>
              <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}