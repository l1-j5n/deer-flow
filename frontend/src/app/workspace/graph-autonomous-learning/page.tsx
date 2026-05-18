"use client";

import { useState } from "react";

const API = "/api/graph";

const CURIOSITY_TYPES = ["prediction_error", "information_gain", "novelty_seeking", "competence_progress", "semantic_gap", "diversity_driven"];
const REWARD_TYPES = ["exploration_bonus", "learning_progress", "empowerment", "state_novelty", "skill_mastery", "knowledge_density"];
const CURRICULUM_STRATEGIES = ["difficulty_ascending", "competence_based", "readiness_scored", "zone_of_proximal", "spiral_curriculum", "adaptive_pacing"];
const METACOG_SKILLS = ["self_monitoring", "strategy_selection", "effort_regulation", "confidence_calibration", "goal_setting", "reflection"];
const AUTONOMOUS_GOALS = ["representation_mastery", "reasoning_proficiency", "transfer_capability", "robustness_achievement", "efficiency_optimization", "generalization_maximization"];
const LEARNING_PHASES = ["auto", "exploration", "exploitation", "consolidation", "reflection", "meta_learning", "transfer"];

const TABS = ["Curiosity", "Reward", "Curriculum", "MetaCog", "Skills", "Trajectory", "Summary"] as const;
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
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
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

export default function GraphAutonomousLearningPage() {
  const [tab, setTab] = useState<Tab>("Curiosity");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [graphId] = useState("graph_001");
  const [curiosityType, setCuriosityType] = useState("prediction_error");
  const [explorationBudget, setExplorationBudget] = useState(100);
  const [numFrontierNodes, setNumFrontierNodes] = useState(20);
  const [noveltyDecay, setNoveltyDecay] = useState(0.1);

  const [rewardType, setRewardType] = useState("exploration_bonus");
  const [numSteps, setNumSteps] = useState(50);
  const [explorationRate, setExplorationRate] = useState(0.5);
  const [skillLevel, setSkillLevel] = useState(0.3);

  const [curriculumStrategy, setCurriculumStrategy] = useState("zone_of_proximal");
  const [numTasks, setNumTasks] = useState(10);
  const [initialDifficulty, setInitialDifficulty] = useState(0.2);
  const [masteryThreshold, setMasteryThreshold] = useState(0.7);

  const [metacogSkill, setMetacogSkill] = useState("self_monitoring");
  const [monitoringWindow, setMonitoringWindow] = useState(20);
  const [adaptationRate, setAdaptationRate] = useState(0.1);

  const [autoGoal, setAutoGoal] = useState("representation_mastery");
  const [numSkills, setNumSkills] = useState(8);
  const [proficiencyTarget, setProficiencyTarget] = useState(0.8);
  const [learningHorizon, setLearningHorizon] = useState(50);

  const [learningPhase, setLearningPhase] = useState("auto");
  const [numEpochs, setNumEpochs] = useState(30);
  const [learningRate, setLearningRate] = useState(0.001);
  const [explorationAnnealing, setExplorationAnnealing] = useState(0.7);

  async function run(endpoint: string, body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ graph_id: graphId, ...body }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function fetchSummary() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API}/auto-learn/summary`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const SelectInput = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
    <select
      className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );

  const NumberInput = ({ value, onChange, step = 1, min = 0, max = 10000 }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number }) => (
    <input
      type="number"
      className="w-full border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
      value={value}
      step={step}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Graph Autonomous Learning</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">v1.210 — Self-directed learning with curiosity-driven exploration</p>
        </div>
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
          v1.210.0
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b dark:border-gray-700 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Controls + Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Controls */}
        <div className="space-y-3">
          {tab === "Curiosity" && (
            <Card title="Curiosity-Driven Exploration">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Curiosity Type</label><SelectInput value={curiosityType} onChange={setCuriosityType} options={CURIOSITY_TYPES} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Exploration Budget</label><NumberInput value={explorationBudget} onChange={setExplorationBudget} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Frontier Nodes</label><NumberInput value={numFrontierNodes} onChange={setNumFrontierNodes} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Novelty Decay</label><NumberInput value={noveltyDecay} onChange={setNoveltyDecay} step={0.01} min={0} max={1} /></div>
                <button onClick={() => run("/auto-learn/curiosity", { curiosity_type: curiosityType, exploration_budget: explorationBudget, num_frontier_nodes: numFrontierNodes, novelty_decay: noveltyDecay })} disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Curiosity Exploration"}
                </button>
              </div>
            </Card>
          )}

          {tab === "Reward" && (
            <Card title="Intrinsic Reward Shaping">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Reward Type</label><SelectInput value={rewardType} onChange={setRewardType} options={REWARD_TYPES} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Steps</label><NumberInput value={numSteps} onChange={setNumSteps} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Exploration Rate</label><NumberInput value={explorationRate} onChange={setExplorationRate} step={0.05} min={0} max={1} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Skill Level</label><NumberInput value={skillLevel} onChange={setSkillLevel} step={0.05} min={0} max={1} /></div>
                <button onClick={() => run("/auto-learn/intrinsic-reward", { reward_type: rewardType, num_steps: numSteps, exploration_rate: explorationRate, skill_level: skillLevel })} disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Reward Shaping"}
                </button>
              </div>
            </Card>
          )}

          {tab === "Curriculum" && (
            <Card title="Self-Paced Curriculum">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Strategy</label><SelectInput value={curriculumStrategy} onChange={setCurriculumStrategy} options={CURRICULUM_STRATEGIES} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Tasks</label><NumberInput value={numTasks} onChange={setNumTasks} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Initial Difficulty</label><NumberInput value={initialDifficulty} onChange={setInitialDifficulty} step={0.05} min={0} max={1} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Mastery Threshold</label><NumberInput value={masteryThreshold} onChange={setMasteryThreshold} step={0.05} min={0} max={1} /></div>
                <button onClick={() => run("/auto-learn/curriculum", { strategy: curriculumStrategy, num_tasks: numTasks, initial_difficulty: initialDifficulty, mastery_threshold: masteryThreshold })} disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Curriculum"}
                </button>
              </div>
            </Card>
          )}

          {tab === "MetaCog" && (
            <Card title="Meta-Cognitive Regulation">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Skill</label><SelectInput value={metacogSkill} onChange={setMetacogSkill} options={METACOG_SKILLS} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Monitoring Window</label><NumberInput value={monitoringWindow} onChange={setMonitoringWindow} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Adaptation Rate</label><NumberInput value={adaptationRate} onChange={setAdaptationRate} step={0.01} min={0} max={1} /></div>
                <button onClick={() => run("/auto-learn/metacognitive", { skill: metacogSkill, monitoring_window: monitoringWindow, adaptation_rate: adaptationRate })} disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Metacognitive Analysis"}
                </button>
              </div>
            </Card>
          )}

          {tab === "Skills" && (
            <Card title="Autonomous Skill Acquisition">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Goal</label><SelectInput value={autoGoal} onChange={setAutoGoal} options={AUTONOMOUS_GOALS} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Number of Skills</label><NumberInput value={numSkills} onChange={setNumSkills} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Proficiency Target</label><NumberInput value={proficiencyTarget} onChange={setProficiencyTarget} step={0.05} min={0} max={1} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Learning Horizon</label><NumberInput value={learningHorizon} onChange={setLearningHorizon} /></div>
                <button onClick={() => run("/auto-learn/skill-acquisition", { goal: autoGoal, num_skills: numSkills, proficiency_target: proficiencyTarget, learning_horizon: learningHorizon })} disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Skill Acquisition"}
                </button>
              </div>
            </Card>
          )}

          {tab === "Trajectory" && (
            <Card title="Learning Trajectory Optimization">
              <div className="space-y-3">
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Phase</label><SelectInput value={learningPhase} onChange={setLearningPhase} options={LEARNING_PHASES} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Epochs</label><NumberInput value={numEpochs} onChange={setNumEpochs} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Learning Rate</label><NumberInput value={learningRate} onChange={setLearningRate} step={0.0001} min={0} max={1} /></div>
                <div><label className="text-xs text-gray-500 dark:text-gray-400">Exploration Annealing</label><NumberInput value={explorationAnnealing} onChange={setExplorationAnnealing} step={0.05} min={0} max={1} /></div>
                <button onClick={() => run("/auto-learn/trajectory", { phase: learningPhase, num_epochs: numEpochs, learning_rate: learningRate, exploration_annealing: explorationAnnealing })} disabled={loading} className="w-full bg-blue-600 text-white rounded py-2 text-sm hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Running..." : "Run Trajectory Optimization"}
                </button>
            </div>
            </Card>
          )}

          {tab === "Summary" && (
            <Card title="Engine Summary">
              <button onClick={fetchSummary} disabled={loading} className="w-full bg-green-600 text-white rounded py-2 text-sm hover:bg-green-700 disabled:opacity-50">
                {loading ? "Loading..." : "Fetch Full Summary"}
              </button>
            </Card>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded p-3">
              Error: {error}
            </div>
          )}

          {result && (
            <>
              {/* Quick Stats */}
              <Card title="Key Metrics">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {"graph_id" in result && <StatBar label="Graph" value={typeof result.graph_id === "string" ? 1 : 0} />}
                  {"budget_efficiency" in result && <StatBar label="Budget Efficiency" value={result.budget_efficiency as number} />}
                  {"mastery_rate" in result && <StatBar label="Mastery Rate" value={result.mastery_rate as number} />}
                  {"average_mastery_level" in result && <StatBar label="Avg Mastery" value={result.average_mastery_level as number} />}
                  {"total_cumulative_reward" in result && <StatBar label="Cumulative Reward" value={(result.total_cumulative_reward as number) / 50} />}
                  {"knowledge_coverage_final" in result && <StatBar label="Knowledge Coverage" value={result.knowledge_coverage_final as number} />}
                  {"skill_improvement" in result && <StatBar label="Skill Improvement" value={result.skill_improvement as number} />}
                  {"accuracy_improvement" in result && typeof result.trajectory_summary === "object" && result.trajectory_summary !== null && "accuracy_improvement" in (result.trajectory_summary as Record<string, unknown>) && <StatBar label="Accuracy Gain" value={(result.trajectory_summary as Record<string, unknown>).accuracy_improvement as number} />}
                </div>
              </Card>

              {/* Full JSON */}
              <Card title="Raw Response">
                <JsonBlock data={result} />
              </Card>
            </>
          )}

          {!result && !error && !loading && (
            <Card title="Ready">
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure parameters on the left and click Run to execute.</p>
              <div className="mt-3 space-y-1 text-xs text-gray-400 dark:text-gray-500">
                <p><strong>Curiosity:</strong> Explore frontier nodes with intrinsic motivation</p>
                <p><strong>Reward:</strong> Shape learning rewards for self-motivation</p>
                <p><strong>Curriculum:</strong> Auto-sequence tasks by difficulty</p>
                <p><strong>MetaCog:</strong> Monitor & regulate learning strategies</p>
                <p><strong>Skills:</strong> Acquire graph reasoning skills autonomously</p>
                <p><strong>Trajectory:</strong> Optimize multi-phase learning schedule</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
