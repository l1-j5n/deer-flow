"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.253 backend
const CURRICULUM_STAGES = ["foundation", "intermediate", "advanced", "expert", "mastery", "adaptive"];
const LEARNING_OBJECTIVES = ["concept_mastery", "procedural_fluency", "transfer_learning", "metacognition", "error_diagnosis", "creative_synthesis"];
const DIFFICULTY_SCHEDULES = ["linear_ramp", "step_function", "exponential_decay", "spiral_revisit", "adaptive_dynamic", "mastery_based"];
const PEDAGOGICAL_STRATEGIES = ["scaffolding", "fading", "worked_examples", "self_explanation", "contrasting_cases", "ai_guided_discovery"];
const ASSESSMENT_TYPES = ["formative", "diagnostic", "summative", "peer_review", "self_assessment", "ai_adaptive_assessment"];
const PROGRESS_METRICS = ["accuracy_gain", "time_efficiency", "knowledge_retention", "transfer_score", "confidence_calibration", "learning_curve_slope"];

const TABS = ["Design", "Deliver", "Assess", "Adapt", "Track", "Graduate", "Overview"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>{children}</div>;
}
function StatBar({ label, value, max = 1, color = "bg-blue-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(3)}</span></div><div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div></div>;
}
function JsonBlock({ data }: { data: unknown }) {
  return <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto max-h-80 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label><select className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}</select></div>;
}
function Badge({ text, color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mr-1 mb-1 ${color}`}>{text}</span>;
}

export default function GraphCausalCurriculumPage() {
  const [tab, setTab] = useState<Tab>("Design");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Design state
  const [curriculumId, setCurriculumId] = useState("curr-001");
  const [learnerId, setLearnerId] = useState("learner-001");
  const [targetStage, setTargetStage] = useState("foundation");
  const [objectives, setObjectives] = useState<string[]>(["concept_mastery", "procedural_fluency"]);
  const [difficultySchedule, setDifficultySchedule] = useState("adaptive_dynamic");
  const [initialDifficulty, setInitialDifficulty] = useState(0.3);

  // Deliver state
  const [sessionId, setSessionId] = useState("sess-001");
  const [deliverCurrId, setDeliverCurrId] = useState("curr-001");
  const [moduleIndex, setModuleIndex] = useState(0);
  const [pedagogicalStrategy, setPedagogicalStrategy] = useState("scaffolding");
  const [currentDifficulty, setCurrentDifficulty] = useState(0.3);

  // Assess state
  const [assessmentId, setAssessmentId] = useState("assess-001");
  const [assessSessionId, setAssessSessionId] = useState("sess-001");
  const [assessmentType, setAssessmentType] = useState("formative");

  // Adapt state
  const [adaptationId, setAdaptationId] = useState("adapt-001");
  const [adaptCurrId, setAdaptCurrId] = useState("curr-001");
  const [adaptAssessId, setAdaptAssessId] = useState("assess-001");
  const [adaptStrategy, setAdaptStrategy] = useState("adaptive_dynamic");

  // Track state
  const [trackerId, setTrackerId] = useState("track-001");
  const [trackLearnerId, setTrackLearnerId] = useState("learner-001");
  const [trackMetrics, setTrackMetrics] = useState<string[]>(["accuracy_gain", "time_efficiency", "knowledge_retention", "transfer_score"]);
  const [timeWindow, setTimeWindow] = useState("all");

  // Graduate state
  const [graduationId, setGraduationId] = useState("grad-001");
  const [gradCurrId, setGradCurrId] = useState("curr-001");
  const [gradLearnerId, setGradLearnerId] = useState("learner-001");
  const [certLevel, setCertLevel] = useState("mastery");

  const callApi = async (endpoint: string, body: Record<string, unknown>) => {
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
    } finally {
      setLoading(false);
    }
  };

  const toggleObjective = (obj: string) => {
    setObjectives((prev) => prev.includes(obj) ? prev.filter((o) => o !== obj) : [...prev, obj]);
  };

  const toggleMetric = (m: string) => {
    setTrackMetrics((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);
  };

  // --- Tab Renderers ---

  const renderDesign = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Curriculum Design Parameters">
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Curriculum ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={curriculumId} onChange={(e) => setCurriculumId(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Learner ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={learnerId} onChange={(e) => setLearnerId(e.target.value)} />
        </div>
        <SelectField label="Target Stage" value={targetStage} onChange={setTargetStage} options={CURRICULUM_STAGES} />
        <SelectField label="Difficulty Schedule" value={difficultySchedule} onChange={setDifficultySchedule} options={DIFFICULTY_SCHEDULES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Initial Difficulty: {initialDifficulty.toFixed(2)}</label>
          <input type="range" min="0" max="1" step="0.05" value={initialDifficulty} onChange={(e) => setInitialDifficulty(parseFloat(e.target.value))} className="w-full" />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Learning Objectives</label>
          <div className="flex flex-wrap gap-1">
            {LEARNING_OBJECTIVES.map((obj) => (
              <button key={obj} onClick={() => toggleObjective(obj)}
                className={`text-xs px-2 py-1 rounded-full border ${objectives.includes(obj) ? "bg-blue-500 text-white border-blue-500" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>
                {obj.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-curriculum/design", {
          curriculum_id: curriculumId, learner_id: learnerId, target_stage: targetStage,
          learning_objectives: objectives, difficulty_schedule: difficultySchedule,
          initial_difficulty: initialDifficulty,
        })}>
          {loading ? "Designing..." : "Design Curriculum"}
        </button>
      </Card>
      <Card title="Result">{result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Click &quot;Design Curriculum&quot; to see results</p>}</Card>
    </div>
  );

  const renderDeliver = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Lesson Delivery">
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Session ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Curriculum ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={deliverCurrId} onChange={(e) => setDeliverCurrId(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Module Index: {moduleIndex}</label>
          <input type="range" min="0" max="4" step="1" value={moduleIndex} onChange={(e) => setModuleIndex(parseInt(e.target.value))} className="w-full" />
        </div>
        <SelectField label="Pedagogical Strategy" value={pedagogicalStrategy} onChange={setPedagogicalStrategy} options={PEDAGOGICAL_STRATEGIES} />
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Difficulty: {currentDifficulty.toFixed(2)}</label>
          <input type="range" min="0" max="1" step="0.05" value={currentDifficulty} onChange={(e) => setCurrentDifficulty(parseFloat(e.target.value))} className="w-full" />
        </div>
        <button className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-curriculum/deliver", {
          session_id: sessionId, curriculum_id: deliverCurrId, module_index: moduleIndex,
          pedagogical_strategy: pedagogicalStrategy, current_difficulty: currentDifficulty,
        })}>
          {loading ? "Delivering..." : "Deliver Lesson"}
        </button>
      </Card>
      <Card title="Result">{result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Click &quot;Deliver Lesson&quot; to see results</p>}</Card>
    </div>
  );

  const renderAssess = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Assessment">
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Assessment ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Session ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={assessSessionId} onChange={(e) => setAssessSessionId(e.target.value)} />
        </div>
        <SelectField label="Assessment Type" value={assessmentType} onChange={setAssessmentType} options={ASSESSMENT_TYPES} />
        <button className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-curriculum/assess", {
          assessment_id: assessmentId, session_id: assessSessionId, assessment_type: assessmentType,
        })}>
          {loading ? "Assessing..." : "Run Assessment"}
        </button>
      </Card>
      <Card title="Result">{result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Click &quot;Run Assessment&quot; to see results</p>}</Card>
    </div>
  );

  const renderAdapt = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Curriculum Adaptation">
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Adaptation ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adaptationId} onChange={(e) => setAdaptationId(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Curriculum ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adaptCurrId} onChange={(e) => setAdaptCurrId(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Assessment ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={adaptAssessId} onChange={(e) => setAdaptAssessId(e.target.value)} />
        </div>
        <SelectField label="Adaptation Strategy" value={adaptStrategy} onChange={setAdaptStrategy} options={DIFFICULTY_SCHEDULES} />
        <button className="mt-2 w-full bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-curriculum/adapt", {
          adaptation_id: adaptationId, curriculum_id: adaptCurrId, assessment_id: adaptAssessId,
          adaptation_strategy: adaptStrategy,
        })}>
          {loading ? "Adapting..." : "Adapt Curriculum"}
        </button>
      </Card>
      <Card title="Result">{result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Click &quot;Adapt Curriculum&quot; to see results</p>}</Card>
    </div>
  );

  const renderTrack = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Progress Tracking">
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tracker ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trackerId} onChange={(e) => setTrackerId(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Learner ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={trackLearnerId} onChange={(e) => setTrackLearnerId(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Progress Metrics</label>
          <div className="flex flex-wrap gap-1">
            {PROGRESS_METRICS.map((m) => (
              <button key={m} onClick={() => toggleMetric(m)}
                className={`text-xs px-2 py-1 rounded-full border ${trackMetrics.includes(m) ? "bg-teal-500 text-white border-teal-500" : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"}`}>
                {m.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
        <SelectField label="Time Window" value={timeWindow} onChange={setTimeWindow} options={["all", "recent", "last_session"]} />
        <button className="mt-2 w-full bg-teal-600 hover:bg-teal-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-curriculum/track", {
          tracker_id: trackerId, learner_id: trackLearnerId, progress_metrics: trackMetrics,
          time_window: timeWindow,
        })}>
          {loading ? "Tracking..." : "Track Progress"}
        </button>
      </Card>
      <Card title="Result">
        {result && typeof result === "object" && result !== null ? (() => {
          const r = result as Record<string, unknown>;
          const aggregate = r.aggregate_progress as Record<string, number> | undefined;
          const milestones = r.milestone_status as Array<Record<string, unknown>> | undefined;
          return (<>
            {aggregate && Object.entries(aggregate).map(([k, v]) => (
              <StatBar key={k} label={k.replace(/_/g, " ")} value={v} color={v >= 0.7 ? "bg-green-500" : v >= 0.4 ? "bg-yellow-500" : "bg-red-500"} />
            ))}
            {milestones && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Milestones</p>
                {milestones.map((ms, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <Badge text={ms.achieved ? "✓" : "○"} color={ms.achieved ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"} />
                    <span className="text-xs text-gray-700 dark:text-gray-300">{String(ms.milestone)} ({String(ms.threshold)})</span>
                  </div>
                ))}
              </div>
            )}
            <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Full JSON</summary><JsonBlock data={result} /></details>
          </>);
        })() : result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Click &quot;Track Progress&quot; to see results</p>}
      </Card>
    </div>
  );

  const renderGraduate = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Graduation & Certification">
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Graduation ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={graduationId} onChange={(e) => setGraduationId(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Curriculum ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={gradCurrId} onChange={(e) => setGradCurrId(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Learner ID</label>
          <input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={gradLearnerId} onChange={(e) => setGradLearnerId(e.target.value)} />
        </div>
        <SelectField label="Certification Level" value={certLevel} onChange={setCertLevel} options={CURRICULUM_STAGES} />
        <button className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded" disabled={loading} onClick={() => callApi("/causal-curriculum/graduate", {
          graduation_id: graduationId, curriculum_id: gradCurrId, learner_id: gradLearnerId,
          certification_level: certLevel,
        })}>
          {loading ? "Processing..." : "Graduate / Certify"}
        </button>
      </Card>
      <Card title="Result">
        {result && typeof result === "object" && result !== null ? (() => {
          const r = result as Record<string, unknown>;
          const breakdown = r.competency_breakdown as Record<string, number> | undefined;
          return (<>
            {r.certified !== undefined && (
              <Badge text={r.certified ? "✓ Certified" : "✗ Not Certified"} color={r.certified ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"} />
            )}
            {r.overall_competency !== undefined && (
              <StatBar label="Overall Competency" value={r.overall_competency as number} />
            )}
            {breakdown && Object.entries(breakdown).map(([k, v]) => (
              <StatBar key={k} label={k.replace(/_/g, " ")} value={v} color={v >= 0.7 ? "bg-green-500" : v >= 0.4 ? "bg-yellow-500" : "bg-red-500"} />
            ))}
            <details className="mt-3"><summary className="text-xs cursor-pointer text-gray-500">Full JSON</summary><JsonBlock data={result} /></details>
          </>);
        })() : result ? <JsonBlock data={result} /> : <p className="text-xs text-gray-400">Click &quot;Graduate / Certify&quot; to see results</p>}
      </Card>
    </div>
  );

  const renderOverview = () => (
    <Card title="Engine Overview (v1.253)">
      <button className="mb-3 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-4 rounded" disabled={loading} onClick={async () => {
        setLoading(true); setResult(null);
        try {
          const res = await fetch(`${API}/causal-curriculum/overview`);
          setResult(await res.json());
        } catch (e) { setResult({ error: String(e) }); } finally { setLoading(false); }
      }}>
        {loading ? "Loading..." : "Load Overview"}
      </button>
      {result ? <JsonBlock data={result} /> : null}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p className="font-semibold mb-2">Graph Causal Curriculum Learning Engine — v1.253</p>
        <p>Progressive curriculum for causal reasoning training with adaptive difficulty, pedagogical strategies, multi-dimensional assessment, and milestone-based progression tracking.</p>
        <p className="mt-2"><strong>6 Enums (36 values)</strong>: CurriculumStage, LearningObjective, DifficultySchedule, PedagogicalStrategy, AssessmentType, ProgressMetric</p>
        <p className="mt-1"><strong>7 Endpoints</strong>: design, deliver, assess, adapt, track, graduate, overview</p>
        <p className="mt-1"><strong>Integration</strong>: v1.248–v1.252 as curriculum modules (Verification → Discovery → Explanation → Argumentation → Fairness)</p>
      </div>
    </Card>
  );

  const tabRenderers: Record<Tab, () => React.ReactNode> = {
    Design: renderDesign,
    Deliver: renderDeliver,
    Assess: renderAssess,
    Adapt: renderAdapt,
    Track: renderTrack,
    Graduate: renderGraduate,
    Overview: renderOverview,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Graph Causal Curriculum Learning</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">v1.253 — Progressive curriculum for causal reasoning training with adaptive difficulty &amp; pedagogical strategies</p>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setResult(null); }}
            className={`text-sm px-3 py-1.5 rounded-t font-medium transition-colors ${tab === t ? "bg-blue-600 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
            {t}
          </button>
        ))}
      </div>

      {tabRenderers[tab]()}
    </div>
  );
}
