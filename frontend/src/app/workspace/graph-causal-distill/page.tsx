"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════
   v1.256 — Graph Causal Knowledge Distillation Engine
   7 tabs: Distill | Compress | Transfer | Validate | Curate | Evolve | Overview
   ═══════════════════════════════════════════════════════ */

const TABS = ["Distill", "Compress", "Transfer", "Validate", "Curate", "Evolve", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const STRATEGIES = ["response_distillation","feature_distillation","relation_distillation","attention_distillation","graph_distillation","ai_hybrid_distillation"];
const TEACHERS = ["discovery_teacher","explanation_teacher","argumentation_teacher","fairness_teacher","optimization_teacher","intervention_teacher"];
const STUDENTS = ["mlp_student","gnn_student","transformer_student","hybrid_student","symbolic_student","ai_adaptive_student"];
const COMPRESSION_LEVELS = ["light","moderate","aggressive","ultra","semantic","ai_dynamic_compression"];
const FIDELITIES = ["causal_structure_fidelity","effect_preservation","ranking_correlation","distribution_matching","interventional_equivalence","ai_composite_fidelity"];
const DOMAINS = ["homogeneous","heterogeneous","cross_modal","cross_scale","temporal_shift","ai_adaptive_domain"];

// ─── Helper ──────────────────────────────────────────────
function Badge({ label, color = "blue" }: { label: string; color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-900/40 text-blue-300 border-blue-700",
    green: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
    amber: "bg-amber-900/40 text-amber-300 border-amber-700",
    red: "bg-red-900/40 text-red-300 border-red-700",
    purple: "bg-purple-900/40 text-purple-300 border-purple-700",
    cyan: "bg-cyan-900/40 text-cyan-300 border-cyan-700",
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

// ─── Tab Panels ──────────────────────────────────────────

function DistillTab() {
  const [strategy, setStrategy] = useState(STRATEGIES[5]);
  const [teacher, setTeacher] = useState(TEACHERS[5]);
  const [student, setStudent] = useState(STUDENTS[1]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <SelectField label="Distillation Strategy" value={strategy} options={STRATEGIES} onChange={setStrategy} />
        <SelectField label="Teacher Model" value={teacher} options={TEACHERS} onChange={setTeacher} />
        <SelectField label="Student Architecture" value={student} options={STUDENTS} onChange={setStudent} />
      </div>
      <Card title="Training Trajectory">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">Epoch</th>
                <th className="text-right py-1 px-2">Soft Loss</th>
                <th className="text-right py-1 px-2">Hard Loss</th>
                <th className="text-right py-1 px-2">Total</th>
                <th className="text-right py-1 px-2">Teacher Acc</th>
                <th className="text-right py-1 px-2">Student Acc</th>
              </tr>
            </thead>
            <tbody>
              {[
                [0.241, 0.892, 0.347, 0.923, 0.712],
                [0.198, 0.804, 0.297, 0.917, 0.758],
                [0.157, 0.712, 0.241, 0.931, 0.801],
                [0.124, 0.631, 0.199, 0.928, 0.836],
                [0.098, 0.558, 0.167, 0.942, 0.864],
              ].map(([sl, hl, tot, ta, sa], i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-gray-500">{i + 1}</td>
                  <td className="py-1 px-2 text-right text-cyan-400">{sl.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{hl.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{tot.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-purple-400">{ta.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{sa.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Causal Knowledge Preservation">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Edges Preserved</span><span className="text-blue-400">22/34</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Structure Fidelity</span><span className="text-emerald-400">0.892</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Effect Correlation</span><span className="text-emerald-400">0.874</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Intervention Accuracy</span><span className="text-blue-400">0.851</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Explanation Coverage</span><span className="text-amber-400">0.798</span></div>
          </div>
        </Card>
        <Card title="Distillation Metrics">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Quality Score</span><span className="text-emerald-400">0.892</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Compression Ratio</span><span className="text-blue-400">4.11×</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Inference Speedup</span><span className="text-emerald-400">9.8×</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Teacher Params</span><span className="text-purple-400">11.5M</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Student Params</span><span className="text-cyan-400">2.8M</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CompressTab() {
  const [level, setLevel] = useState(COMPRESSION_LEVELS[4]);
  const [fidelity, setFidelity] = useState(FIDELITIES[0]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Compression Level" value={level} options={COMPRESSION_LEVELS} onChange={setLevel} />
        <SelectField label="Fidelity Metric" value={fidelity} options={FIDELITIES} onChange={setFidelity} />
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Original Size", val: "247 MB", color: "text-amber-400" },
          { label: "Compressed", val: "98.8 MB", color: "text-emerald-400" },
          { label: "Ratio", val: "40%", color: "text-blue-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
      <Card title="Layer-wise Compression">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">Layer</th>
                <th className="text-right py-1 px-2">Original</th>
                <th className="text-right py-1 px-2">Compressed</th>
                <th className="text-right py-1 px-2">Sparsity</th>
                <th className="text-right py-1 px-2">Causal Impact</th>
              </tr>
            </thead>
            <tbody>
              {[["42.1", "18.3", "56%", "0.92"], ["39.8", "15.7", "61%", "0.87"], ["40.5", "17.1", "58%", "0.73"],
                ["41.2", "16.4", "60%", "0.95"], ["38.7", "15.2", "61%", "0.68"], ["43.0", "16.1", "63%", "0.81"]].map(
                ([orig, comp, sp, ci], i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-gray-500">{i + 1}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{orig} MB</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{comp} MB</td>
                  <td className="py-1 px-2 text-right text-blue-400">{sp}</td>
                  <td className="py-1 px-2 text-right text-purple-400">{ci}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Causal Preservation">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">d-Separation Preserved</span><Badge label="YES" color="green" /></div>
          <div className="flex justify-between"><span className="text-gray-400">Markov Blanket Intact</span><Badge label="YES" color="green" /></div>
          <div className="flex justify-between"><span className="text-gray-400">Intervention Consistency</span><span className="text-emerald-400">0.941</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Confounding Control</span><span className="text-emerald-400">0.887</span></div>
        </div>
      </Card>
    </div>
  );
}

function TransferTab() {
  const [domain, setDomain] = useState(DOMAINS[1]);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Transfer Domain" value={domain} options={DOMAINS} onChange={setDomain} />
        <Card title="Domain Gap Analysis">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Difficulty</span><span className="text-amber-400">0.50</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Alignment</span><span className="text-blue-400">optimal_transport</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Source Graph</span><span className="text-gray-300">142 nodes / 234 edges</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Target Graph</span><span className="text-gray-300">98 nodes / 167 edges</span></div>
          </div>
        </Card>
      </div>
      <Card title="Transferred Causal Edges">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">Source Edge</th>
                <th className="text-left py-1 px-2">Target Analogue</th>
                <th className="text-right py-1 px-2">Confidence</th>
                <th className="text-right py-1 px-2">Equivalence</th>
                <th className="text-center py-1 px-2">Adapt</th>
              </tr>
            </thead>
            <tbody>
              {[["X0→Y0","X0'→Y0'",0.91,0.87,false],["X1→Y1","X1'→Y1'",0.85,0.79,true],["X2→Y2","X2'→Y2'",0.78,0.72,true],
                ["X3→Y3","X3'→Y3'",0.93,0.89,false],["X4→Y4","X4'→Y4'",0.72,0.66,true]].map(
                ([src, tgt, conf, equiv, adapt], i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400">{src}</td>
                  <td className="py-1 px-2 text-purple-400">{tgt}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{conf}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{equiv}</td>
                  <td className="py-1 px-2 text-center"><Badge label={adapt ? "YES" : "NO"} color={adapt ? "amber" : "green"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Transfer Quality", val: "0.85", color: "text-emerald-400" },
          { label: "Effective Rate", val: "77.5%", color: "text-blue-400" },
          { label: "Domain Gap", val: "0.50", color: "text-amber-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-900/60 rounded p-3">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-lg font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValidateTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: "Pass Rate", val: "91.7%", color: "text-emerald-400" },
          { label: "Overall Fidelity", val: "0.884", color: "text-blue-400" },
          { label: "Recommendation", val: "DEPLOY", color: "text-emerald-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-xl font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
      <Card title="Test Results">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">ID</th>
                <th className="text-left py-1 px-2">Type</th>
                <th className="text-center py-1 px-2">Pass</th>
                <th className="text-right py-1 px-2">Teacher</th>
                <th className="text-right py-1 px-2">Student</th>
                <th className="text-right py-1 px-2">Deviation</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["TC-001","causal_edge",true,0.742,0.718,0.024],
                ["TC-002","intervention_effect",true,0.834,0.812,0.022],
                ["TC-003","counterfactual",false,0.671,0.543,0.128],
                ["TC-004","d_separation",true,0.892,0.878,0.014],
                ["TC-005","markov_blanket",true,0.756,0.741,0.015],
                ["TC-006","causal_edge",true,0.821,0.798,0.023],
              ].map(([id, typ, pass, teach, stud, dev]) => (
                <tr key={id as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-gray-500">{id}</td>
                  <td className="py-1 px-2 text-cyan-400">{typ}</td>
                  <td className="py-1 px-2 text-center"><Badge label={pass ? "PASS" : "FAIL"} color={pass ? "green" : "red"} /></td>
                  <td className="py-1 px-2 text-right text-purple-400">{teach}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{stud}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{dev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="Fidelity Breakdown">
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: "Structure", val: 0.91, color: "blue" },
            { name: "Effect", val: 0.87, color: "green" },
            { name: "Ranking", val: 0.93, color: "purple" },
            { name: "Distribution", val: 0.85, color: "cyan" },
            { name: "Intervention", val: 0.82, color: "amber" },
            { name: "Composite", val: 0.88, color: "green" },
          ].map((f) => (
            <div key={f.name} className="bg-gray-900/60 rounded p-2 text-center">
              <div className="text-xs text-gray-500">{f.name}</div>
              <div className={`text-sm font-bold text-${f.color}-400`}>{f.val.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CurateTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4 text-center">
        {[
          { label: "Raw Items", val: "87", color: "text-amber-400" },
          { label: "Filtered", val: "61", color: "text-blue-400" },
          { label: "Duplicates Removed", val: "8", color: "text-red-400" },
          { label: "Final Items", val: "8", color: "text-emerald-400" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-900/60 rounded p-3">
            <div className="text-xs text-gray-500">{m.label}</div>
            <div className={`text-lg font-bold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>
      <Card title="Curated Knowledge Items">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">ID</th>
                <th className="text-left py-1 px-2">Category</th>
                <th className="text-left py-1 px-2">Source</th>
                <th className="text-right py-1 px-2">Confidence</th>
                <th className="text-right py-1 px-2">Strength</th>
                <th className="text-center py-1 px-2">Verified</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["CK-a3f7b2","causal_rules","v1.255",0.87,0.72,true],
                ["CK-c8d4e1","intervention_protocols","v1.255",0.82,0.85,true],
                ["CK-f2a6b9","effect_estimates","v1.254",0.91,0.68,false],
                ["CK-1e7c3d","counterfactual_patterns","v1.250",0.79,0.81,true],
                ["CK-5b9a2f","fairness_constraints","v1.252",0.94,0.77,true],
              ].map(([id, cat, src, conf, str, ver]) => (
                <tr key={id as string} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-cyan-400 font-mono text-xs">{id}</td>
                  <td className="py-1 px-2 text-blue-400 text-xs">{cat}</td>
                  <td className="py-1 px-2"><Badge label={src as string} color="purple" /></td>
                  <td className="py-1 px-2 text-right text-emerald-400">{conf}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{str}</td>
                  <td className="py-1 px-2 text-center"><Badge label={ver ? "YES" : "NO"} color={ver ? "green" : "amber"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Category Distribution">
          <div className="space-y-1 text-sm">
            {[
              ["Causal Rules", 14, "blue"],
              ["Intervention Protocols", 8, "green"],
              ["Effect Estimates", 19, "amber"],
              ["Counterfactual Patterns", 11, "purple"],
              ["Fairness Constraints", 6, "cyan"],
            ].map(([name, count, col]) => (
              <div key={name as string} className="flex justify-between items-center">
                <span className="text-gray-400">{name}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-gray-700 rounded w-20">
                    <div className={`h-2 bg-${col}-600 rounded`} style={{ width: `${(count / 20) * 100}%` }} />
                  </div>
                  <span className="text-gray-300 text-xs">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Quality Summary">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Avg Confidence</span><span className="text-emerald-400">0.874</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Verified Ratio</span><span className="text-emerald-400">75%</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Coverage Score</span><span className="text-blue-400">0.812</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function EvolveTab() {
  return (
    <div className="space-y-4">
      <Card title="Evolution History">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-gray-700">
                <th className="text-left py-1 px-2">Gen</th>
                <th className="text-right py-1 px-2">Best</th>
                <th className="text-right py-1 px-2">Avg</th>
                <th className="text-right py-1 px-2">Worst</th>
                <th className="text-right py-1 px-2">Diversity</th>
                <th className="text-right py-1 px-2">Added</th>
                <th className="text-right py-1 px-2">Pruned</th>
              </tr>
            </thead>
            <tbody>
              {[
                [1, 0.682, 0.548, 0.341, 0.78, 3, 1],
                [2, 0.721, 0.591, 0.372, 0.71, 2, 1],
                [3, 0.758, 0.634, 0.412, 0.64, 4, 2],
                [4, 0.789, 0.672, 0.448, 0.58, 1, 0],
                [5, 0.812, 0.701, 0.483, 0.51, 3, 1],
                [6, 0.834, 0.728, 0.512, 0.44, 2, 2],
                [7, 0.851, 0.748, 0.537, 0.38, 1, 1],
                [8, 0.863, 0.762, 0.558, 0.32, 0, 0],
              ].map(([gen, best, avg, worst, div, added, pruned]) => (
                <tr key={gen} className="border-b border-gray-800">
                  <td className="py-1 px-2 text-gray-500">{gen}</td>
                  <td className="py-1 px-2 text-right text-emerald-400">{best.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-blue-400">{avg.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-red-400">{worst.toFixed(3)}</td>
                  <td className="py-1 px-2 text-right text-amber-400">{div.toFixed(2)}</td>
                  <td className="py-1 px-2 text-right text-cyan-400">{added}</td>
                  <td className="py-1 px-2 text-right text-purple-400">{pruned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Convergence">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Converged</span><Badge label="NO" color="amber" /></div>
            <div className="flex justify-between"><span className="text-gray-400">Best Fitness</span><span className="text-emerald-400">0.863</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Improvement</span><span className="text-emerald-400">+0.213</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Plateau</span><Badge label="No" color="green" /></div>
          </div>
        </Card>
        <Card title="Evolved Knowledge">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Total Rules</span><span className="text-blue-400">32</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Avg Strength</span><span className="text-emerald-400">0.847</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Coverage</span><span className="text-blue-400">0.782</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Redundancy</span><span className="text-amber-400">0.124</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card title="Engine Information">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Engine</span><span className="text-blue-400">Graph Causal Knowledge Distillation</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Version</span><span className="text-emerald-400">v1.256</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Endpoints</span><span className="text-gray-300">7 (6 POST + 1 GET)</span></div>
        </div>
      </Card>
      <Card title="Enums (6 enums, 36 values)">
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "DistillationStrategy", vals: STRATEGIES, color: "blue" },
            { name: "TeacherModel", vals: TEACHERS, color: "green" },
            { name: "StudentArchitecture", vals: STUDENTS, color: "amber" },
            { name: "CompressionLevel", vals: COMPRESSION_LEVELS, color: "red" },
            { name: "FidelityMetric", vals: FIDELITIES, color: "purple" },
            { name: "TransferDomain", vals: DOMAINS, color: "cyan" },
          ].map((e) => (
            <div key={e.name} className="bg-gray-900/60 rounded p-2">
              <div className="text-xs font-semibold text-gray-300 mb-1">{e.name}</div>
              <div className="flex flex-wrap gap-1">
                {e.vals.map((v) => (
                  <Badge key={v} label={v.replace(/_/g, " ").slice(0, 18)} color={e.color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Integration Chain">
        <div className="space-y-1 text-sm">
          {[
            ["v1.255", "Intervention Planning → distilled intervention knowledge"],
            ["v1.254", "Program Optimization → efficient distillation pipelines"],
            ["v1.252", "Causal Fairness → equitable knowledge transfer"],
            ["v1.250", "Explanation Generation → interpretable student models"],
            ["v1.249", "Autonomous Discovery → teacher causal graphs"],
          ].map(([v, desc]) => (
            <div key={v} className="flex items-center gap-2">
              <Badge label={v} color="purple" />
              <span className="text-gray-400 text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────

export default function GraphCausalDistillPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Distill");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Causal Knowledge Distillation
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              v1.256 — Distill, compress, transfer, validate, curate &amp; evolve causal knowledge
            </p>
          </div>
          <Badge label="v1.256" color="purple" />
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-blue-600 text-white font-medium"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "Distill" && <DistillTab />}
          {activeTab === "Compress" && <CompressTab />}
          {activeTab === "Transfer" && <TransferTab />}
          {activeTab === "Validate" && <ValidateTab />}
          {activeTab === "Curate" && <CurateTab />}
          {activeTab === "Evolve" && <EvolveTab />}
          {activeTab === "Overview" && <OverviewTab />}
        </div>
      </div>
    </div>
  );
}
