"use client";

import { useState } from "react";

const API = "/api/electron/kg/graph";

// Enum values from v1.248 backend
const VERIF_LOGICS = ["hoare_logic", "separation_logic", "temporal_logic_ctl", "temporal_logic_ltl", "dependent_type", "effect_system"];
const PROGRAM_TYPES = ["structural_equation", "do_calculus_program", "counterfactual_program", "intervention_policy", "causal_dag_program", "ai_synthesized_causal"];
const SAFETY_PROPS = ["intervention_safety", "counterfactual_consistency", "causal_monotonicity", "no_backdoor_violation", "markov_locality", "faithfulness_preservation"];
const PROOF_STRATEGIES = ["forward_proof", "backward_proof", "induction_on_graph", "contradiction", "coinduction", "smt_assisted"];
const VERIF_RESULTS = ["verified", "falsified", "unknown", "conditionally_verified", "timeout", "error"];
const TEMPORAL_PROPS = ["always_safe", "eventually_stable", "never_violate", "leads_to", "until_property", "globally_monotone"];

const TABS = ["Verify", "TypeCheck", "ModelCheck", "Prove", "Synthesize", "Composition", "Overview"] as const;
type Tab = (typeof TABS)[number];

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"><h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-200">{title}</h3>{children}</div>;
}
function StatBar({ label, value, max = 1, color = "bg-blue-500" }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  return <div className="mb-2"><div className="flex justify-between text-xs mb-1"><span className="text-gray-600 dark:text-gray-400">{label}</span><span className="font-mono text-gray-800 dark:text-gray-200">{value.toFixed(4)}</span></div><div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} /></div></div>;
}
function JsonBlock({ data }: { data: unknown }) {
  return <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded p-3 overflow-auto max-h-80 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
}
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label><select className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}</select></div>;
}
function Badge({ text, color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" }: { text: string; color?: string }) {
  return <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{text}</span>;
}

export default function GraphCausalProgramVerificationPage() {
  const [tab, setTab] = useState<Tab>("Verify");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  // Verify state
  const [programId, setProgramId] = useState("prog-causal-001");
  const [programType, setProgramType] = useState("do_calculus_program");
  const [verifLogic, setVerifLogic] = useState("hoare_logic");
  const [selectedSafety, setSelectedSafety] = useState<string[]>(["intervention_safety", "counterfactual_consistency", "no_backdoor_violation"]);
  const [proofStrat, setProofStrat] = useState("forward_proof");
  const [maxProofDepth, setMaxProofDepth] = useState(20);

  // TypeCheck state
  const [tcProgramId, setTcProgramId] = useState("");
  const [tcProgramType, setTcProgramType] = useState("structural_equation");
  const [tcStrict, setTcStrict] = useState(true);
  const [tcCausal, setTcCausal] = useState(true);
  const [tcIntervention, setTcIntervention] = useState(true);

  // ModelCheck state
  const [mcProgramId, setMcProgramId] = useState("");
  const [mcTempProps, setMcTempProps] = useState<string[]>(["always_safe", "never_violate"]);
  const [mcMaxStates, setMcMaxStates] = useState(10000);
  const [mcStrategy, setMcStrategy] = useState("bfs");

  // Prove state
  const [prProgramId, setPrProgramId] = useState("");
  const [prProperty, setPrProperty] = useState("intervention_safety");
  const [prStrategy, setPrStrategy] = useState("induction_on_graph");
  const [prGenWitness, setPrGenWitness] = useState(false);
  const [prLemmaDepth, setPrLemmaDepth] = useState(5);

  // Synthesize state
  const [synProgramId, setSynProgramId] = useState("");
  const [synTarget, setSynTarget] = useState("counterfactual_consistency");
  const [synMaxSteps, setSynMaxSteps] = useState(30);

  // Composition state
  const [compProgramIds, setCompProgramIds] = useState("prog-abc123, prog-def456");
  const [compType, setCompType] = useState("sequential");
  const [compSafety, setCompSafety] = useState(true);
  const [compInfoFlow, setCompInfoFlow] = useState(true);

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
    } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const handleVerify = () => call("/causal-verify/verify-program", { program_id: programId, program_type: programType, verification_logic: verifLogic, safety_properties: selectedSafety, proof_strategy: proofStrat, max_proof_depth: maxProofDepth });
  const handleTypeCheck = () => call("/causal-verify/type-check", { program_id: tcProgramId, program_type: tcProgramType, strict_mode: tcStrict, check_causal_types: tcCausal, check_intervention_types: tcIntervention });
  const handleModelCheck = () => call("/causal-verify/model-check", { program_id: mcProgramId, temporal_properties: mcTempProps, max_states: mcMaxStates, search_strategy: mcStrategy });
  const handleProve = () => call("/causal-verify/prove-property", { program_id: prProgramId, property_type: prProperty, proof_strategy: prStrategy, generate_witness: prGenWitness, lemma_depth: prLemmaDepth });
  const handleSynthesize = () => call("/causal-verify/synthesize-proof", { program_id: synProgramId, target_property: synTarget, max_proof_steps: synMaxSteps });
  const handleComposition = () => call("/causal-verify/composition", { program_ids: compProgramIds.split(",").map((s) => s.trim()).filter(Boolean), composition_type: compType, verify_compositional_safety: compSafety, verify_information_flow: compInfoFlow });
  const handleOverview = async () => {
    setLoading(true); setResult(null);
    try { const res = await fetch(`${API}/causal-verify/overview`); setResult(await res.json()); } catch (e) { setResult({ error: String(e) }); }
    setLoading(false);
  };

  const toggleSafety = (p: string) => setSelectedSafety((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  const toggleTempProp = (p: string) => setMcTempProps((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const renderVerifyResult = () => {
    if (!result || tab !== "Verify") return null;
    const d = result as Record<string, unknown>;
    const trace = d.proof_trace as Record<string, unknown>[] | undefined;
    return (
      <>
        <Card title={`Verification: ${d.result as string}`}>
          <div className="text-center mb-3">
            <div className={`text-2xl font-bold ${(d.result as string) === "verified" ? "text-green-600" : (d.result as string) === "falsified" ? "text-red-600" : "text-amber-600"}`}>
              {(d.result as string).toUpperCase()}
            </div>
            <StatBar label="Confidence" value={d.confidence_score as number} max={1} color={(d.result as string) === "verified" ? "bg-green-500" : "bg-amber-500"} />
            <div className="text-xs text-gray-500 mt-1">{(d.verification_time_ms as number)?.toFixed(1)}ms</div>
          </div>
          <div className="space-y-1">
            {(d.properties_verified as string[])?.map((p) => (
              <div key={p} className="flex items-center gap-2 text-xs"><Badge text="VERIFIED" color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" /><span className="text-gray-700 dark:text-gray-300">{p.replace(/_/g, " ")}</span></div>
            ))}
            {(d.properties_failed as string[])?.map((p) => (
              <div key={p} className="flex items-center gap-2 text-xs"><Badge text="FAILED" color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" /><span className="text-gray-700 dark:text-gray-300">{p.replace(/_/g, " ")}</span></div>
            ))}
          </div>
        </Card>
        {trace && trace.length > 0 && (
          <Card title={`Proof Trace (${trace.length} steps)`}>
            <div className="space-y-1 max-h-60 overflow-auto">
              {trace.slice(0, 20).map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs border-b border-gray-100 dark:border-gray-700 pb-1">
                  <span className="font-mono text-gray-500 w-6">#{s.step_number as number}</span>
                  <Badge text={s.tactic as string} color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" />
                  <span className={`ml-auto ${(s.result as string) === "QED" ? "text-green-600 font-bold" : (s.result as string) === "STUCK" ? "text-red-600 font-bold" : "text-gray-500"}`}>{s.result as string}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </>
    );
  };

  const renderTypeCheckResult = () => {
    if (!result || tab !== "TypeCheck") return null;
    const d = result as Record<string, unknown>;
    const violations = d.violations as Record<string, unknown>[] | undefined;
    const typeEnv = d.type_environment as Record<string, string> | undefined;
    return (
      <>
        <Card title={`Type Check: ${d.is_well_typed ? "PASS" : "FAIL"}`}>
          <div className={`text-center text-2xl font-bold mb-2 ${d.is_well_typed ? "text-green-600" : "text-red-600"}`}>
            {d.is_well_typed ? "WELL-TYPED" : "TYPE ERRORS"}
          </div>
          <div className="text-xs text-gray-500 text-center mb-2">{d.inference_count as number} type inferences</div>
          {violations && violations.length > 0 && (
            <div className="space-y-2">
              {violations.map((v, i) => (
                <div key={i} className="text-xs p-2 rounded bg-red-50 dark:bg-red-900/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge text={v.severity as string} color={v.severity === "error" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"} />
                    <span className="font-mono text-gray-600 dark:text-gray-400">{v.location as string}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">{v.message as string}</div>
                  <div className="text-gray-500 mt-1">Expected: {v.expected_type as string} | Actual: {v.actual_type as string}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        {typeEnv && (
          <Card title="Type Environment">
            <div className="space-y-1 max-h-48 overflow-auto">
              {Object.entries(typeEnv).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-gray-700 dark:text-gray-300">{k}</span>
                  <span className="text-gray-400">:</span>
                  <Badge text={v} color="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200" />
                </div>
              ))}
            </div>
          </Card>
        )}
      </>
    );
  };

  const renderModelCheckResult = () => {
    if (!result || tab !== "ModelCheck") return null;
    const d = result as Record<string, unknown>;
    return (
      <>
        <Card title="Model Check Result">
          <div className="grid grid-cols-3 gap-3 text-center mb-3">
            <div><div className="text-lg font-bold text-blue-600">{d.states_explored as number}</div><div className="text-xs text-gray-500">States</div></div>
            <div><div className="text-lg font-bold text-green-600">{(d.satisfied_properties as string[])?.length}</div><div className="text-xs text-gray-500">Satisfied</div></div>
            <div><div className="text-lg font-bold text-red-600">{(d.violated_properties as string[])?.length}</div><div className="text-xs text-gray-500">Violated</div></div>
          </div>
          {(d.satisfied_properties as string[])?.map((p) => (
            <div key={p} className="flex items-center gap-2 text-xs mb-1"><Badge text="SAT" color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" /><span className="text-gray-700 dark:text-gray-300">{p.replace(/_/g, " ")}</span></div>
          ))}
          {(d.violated_properties as string[])?.map((p) => (
            <div key={p} className="flex items-center gap-2 text-xs mb-1"><Badge text="VIOL" color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" /><span className="text-gray-700 dark:text-gray-300">{p.replace(/_/g, " ")}</span></div>
          ))}
        </Card>
        {d.counterexample && (
          <Card title="Counterexample">
            <JsonBlock data={d.counterexample} />
          </Card>
        )}
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Graph Causal Program Verification</h2>
        <Badge text="v1.248" color="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => { setTab(t); setResult(null); }}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${tab === t ? "bg-violet-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>{t}</button>
        ))}
      </div>

      {/* Verify */}
      {tab === "Verify" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Verify Program">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={programId} onChange={(e) => setProgramId(e.target.value)} /></div>
            <SelectField label="Program Type" value={programType} onChange={setProgramType} options={PROGRAM_TYPES} />
            <SelectField label="Verification Logic" value={verifLogic} onChange={setVerifLogic} options={VERIF_LOGICS} />
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Safety Properties</label>
              <div className="grid grid-cols-2 gap-1">
                {SAFETY_PROPS.map((p) => (
                  <label key={p} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <input type="checkbox" checked={selectedSafety.includes(p)} onChange={() => toggleSafety(p)} /> {p.replace(/_/g, " ")}
                  </label>
                ))}
              </div>
            </div>
            <SelectField label="Proof Strategy" value={proofStrat} onChange={setProofStrat} options={PROOF_STRATEGIES} />
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Proof Depth</label><input type="number" min={1} max={200} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={maxProofDepth} onChange={(e) => setMaxProofDepth(parseInt(e.target.value) || 20)} /></div>
            <button onClick={handleVerify} disabled={loading} className="w-full bg-violet-600 text-white text-sm py-2 rounded-md hover:bg-violet-700 disabled:opacity-50">{loading ? "Verifying..." : "Verify Program"}</button>
          </Card>
          {renderVerifyResult()}
        </div>
      )}

      {/* TypeCheck */}
      {tab === "TypeCheck" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Type Check">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={tcProgramId} onChange={(e) => setTcProgramId(e.target.value)} /></div>
            <SelectField label="Program Type" value={tcProgramType} onChange={setTcProgramType} options={PROGRAM_TYPES} />
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2"><input type="checkbox" checked={tcStrict} onChange={(e) => setTcStrict(e.target.checked)} /> Strict Mode</label>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2"><input type="checkbox" checked={tcCausal} onChange={(e) => setTcCausal(e.target.checked)} /> Check Causal Types</label>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3"><input type="checkbox" checked={tcIntervention} onChange={(e) => setTcIntervention(e.target.checked)} /> Check Intervention Types</label>
            <button onClick={handleTypeCheck} disabled={loading} className="w-full bg-violet-600 text-white text-sm py-2 rounded-md hover:bg-violet-700 disabled:opacity-50">{loading ? "Checking..." : "Type Check"}</button>
          </Card>
          {renderTypeCheckResult()}
        </div>
      )}

      {/* ModelCheck */}
      {tab === "ModelCheck" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Model Check">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={mcProgramId} onChange={(e) => setMcProgramId(e.target.value)} /></div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Temporal Properties</label>
              <div className="grid grid-cols-2 gap-1">
                {TEMPORAL_PROPS.map((p) => (
                  <label key={p} className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <input type="checkbox" checked={mcTempProps.includes(p)} onChange={() => toggleTempProp(p)} /> {p.replace(/_/g, " ")}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max States</label><input type="number" min={100} max={1000000} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={mcMaxStates} onChange={(e) => setMcMaxStates(parseInt(e.target.value) || 10000)} /></div>
              <SelectField label="Strategy" value={mcStrategy} onChange={setMcStrategy} options={["bfs", "dfs", "symbolic"]} />
            </div>
            <button onClick={handleModelCheck} disabled={loading} className="w-full bg-violet-600 text-white text-sm py-2 rounded-md hover:bg-violet-700 disabled:opacity-50">{loading ? "Checking..." : "Model Check"}</button>
          </Card>
          {renderModelCheckResult()}
        </div>
      )}

      {/* Prove */}
      {tab === "Prove" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Prove Property">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={prProgramId} onChange={(e) => setPrProgramId(e.target.value)} /></div>
            <SelectField label="Safety Property" value={prProperty} onChange={setPrProperty} options={SAFETY_PROPS} />
            <SelectField label="Proof Strategy" value={prStrategy} onChange={setPrStrategy} options={PROOF_STRATEGIES} />
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Lemma Depth</label><input type="number" min={1} max={50} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={prLemmaDepth} onChange={(e) => setPrLemmaDepth(parseInt(e.target.value) || 5)} /></div>
              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-5"><input type="checkbox" checked={prGenWitness} onChange={(e) => setPrGenWitness(e.target.checked)} /> Generate Witness</label>
            </div>
            <button onClick={handleProve} disabled={loading} className="w-full bg-violet-600 text-white text-sm py-2 rounded-md hover:bg-violet-700 disabled:opacity-50">{loading ? "Proving..." : "Prove Property"}</button>
          </Card>
          {result && (
            <Card title="Proof Result">
              <div className={`text-center text-2xl font-bold mb-2 ${((result as Record<string, unknown>).is_proven as boolean) ? "text-green-600" : "text-red-600"}`}>
                {((result as Record<string, unknown>).is_proven as boolean) ? "PROVEN" : "UNPROVEN"}
              </div>
              <div className="text-xs text-gray-500 text-center mb-3">Proof size: {(result as Record<string, unknown>).proof_size as number}</div>
              {((result as Record<string, unknown>).auxiliary_lemmas as Record<string, unknown>[])?.map((l, i) => (
                <div key={i} className="mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <Badge text={l.is_proven ? "PROVEN" : "UNPROVEN"} color={l.is_proven ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"} />
                    <span className="font-mono text-gray-700 dark:text-gray-300">{l.name as string}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{l.statement as string}</div>
                </div>
              ))}
              {(result as Record<string, unknown>).witness && (
                <Card title="Witness"><JsonBlock data={(result as Record<string, unknown>).witness} /></Card>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Synthesize */}
      {tab === "Synthesize" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Synthesize Proof">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program ID</label><input className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={synProgramId} onChange={(e) => setSynProgramId(e.target.value)} /></div>
            <SelectField label="Target Property" value={synTarget} onChange={setSynTarget} options={SAFETY_PROPS} />
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Max Proof Steps</label><input type="number" min={1} max={200} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5" value={synMaxSteps} onChange={(e) => setSynMaxSteps(parseInt(e.target.value) || 30)} /></div>
            <button onClick={handleSynthesize} disabled={loading} className="w-full bg-violet-600 text-white text-sm py-2 rounded-md hover:bg-violet-700 disabled:opacity-50">{loading ? "Synthesizing..." : "Synthesize Proof"}</button>
          </Card>
          {result && (
            <Card title="Synthesis Result">
              <div className={`text-center text-2xl font-bold mb-2 ${((result as Record<string, unknown>).proof_synthesized as boolean) ? "text-green-600" : "text-amber-600"}`}>
                {((result as Record<string, unknown>).proof_synthesized as boolean) ? "SYNTHESIZED" : "FAILED"}
              </div>
              {((result as Record<string, unknown>).proof_synthesized as boolean) && (
                <>
                  <div className="grid grid-cols-2 gap-3 text-center mb-3">
                    <div><div className="text-lg font-bold text-violet-600">{(result as Record<string, unknown>).proof_length as number}</div><div className="text-xs text-gray-500">Steps</div></div>
                    <div><div className="text-lg font-bold text-purple-600">{((result as Record<string, unknown>).proof_complexity as number)?.toFixed(2)}</div><div className="text-xs text-gray-500">Complexity</div></div>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">Tactics Used:</div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {((result as Record<string, unknown>).tactics_used as string[])?.map((t) => <Badge key={t} text={t} color="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" />)}
                  </div>
                </>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Composition */}
      {tab === "Composition" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Composition Verification">
            <div className="mb-3"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program IDs (comma-separated)</label><textarea className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm px-2 py-1.5 h-16" value={compProgramIds} onChange={(e) => setCompProgramIds(e.target.value)} /></div>
            <SelectField label="Composition Type" value={compType} onChange={setCompType} options={["sequential", "parallel", "conditional"]} />
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2"><input type="checkbox" checked={compSafety} onChange={(e) => setCompSafety(e.target.checked)} /> Verify Compositional Safety</label>
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3"><input type="checkbox" checked={compInfoFlow} onChange={(e) => setCompInfoFlow(e.target.checked)} /> Verify Information Flow</label>
            <button onClick={handleComposition} disabled={loading} className="w-full bg-violet-600 text-white text-sm py-2 rounded-md hover:bg-violet-700 disabled:opacity-50">{loading ? "Verifying..." : "Verify Composition"}</button>
          </Card>
          {result && (
            <Card title="Composition Result">
              <div className={`text-center text-2xl font-bold mb-2 ${((result as Record<string, unknown>).is_safe as boolean) ? "text-green-600" : "text-red-600"}`}>
                {((result as Record<string, unknown>).is_safe as boolean) ? "SAFE" : "UNSAFE"}
              </div>
              <div className="space-y-2">
                {((result as Record<string, unknown>).compositional_guarantees as string[])?.map((g) => (
                  <div key={g} className="flex items-center gap-2 text-xs"><Badge text="✓" color="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" /><span className="text-gray-700 dark:text-gray-300">{g}</span></div>
                ))}
                {((result as Record<string, unknown>).safety_violations as string[])?.map((v) => (
                  <div key={v} className="flex items-center gap-2 text-xs"><Badge text="✗" color="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" /><span className="text-gray-700 dark:text-gray-300">{v}</span></div>
                ))}
                {((result as Record<string, unknown>).flow_violations as string[])?.map((v) => (
                  <div key={v} className="flex items-center gap-2 text-xs"><Badge text="⚠" color="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" /><span className="text-gray-700 dark:text-gray-300">{v}</span></div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Overview */}
      {tab === "Overview" && (
        <div>
          <button onClick={handleOverview} disabled={loading} className="mb-4 bg-violet-600 text-white text-sm py-2 px-4 rounded-md hover:bg-violet-700 disabled:opacity-50">{loading ? "Loading..." : "Load Overview"}</button>
          {result && <Card title="Engine Overview"><JsonBlock data={result} /></Card>}
        </div>
      )}
    </div>
  );
}
