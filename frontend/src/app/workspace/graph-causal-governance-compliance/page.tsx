"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   v1.262 — Graph Causal Governance & Compliance Engine
   7 tabs: Audit | Comply | Trace | Govern | Report | Certify | Overview
   ═══════════════════════════════════════════════════════════════════════ */

const TABS = ["Audit", "Comply", "Trace", "Govern", "Report", "Certify", "Overview"] as const;
type Tab = (typeof TABS)[number];

// ─── Enums ────────────────────────────────────────────────
const AUDIT_TYPES = ["process_audit","data_audit","model_audit","outcome_audit","compliance_audit","ai_comprehensive_audit"];
const COMPLIANCE_FRAMEWORKS = ["gdpr","hipaa","sox","iso27001","nist","ai_adaptive_framework"];
const LINEAGE_TYPES = ["data_lineage","model_lineage","decision_lineage","transformation_lineage","policy_lineage","ai_full_provenance"];
const GOVERNANCE_POLICIES = ["access_control","retention_policy","anonymization_policy","consent_policy","quality_policy","ai_adaptive_policy"];
const REPORT_TYPES = ["compliance_report","audit_report","impact_assessment","risk_report","performance_report","ai_executive_summary"];
const CERTIFICATION_LEVELS = ["self_certified","peer_reviewed","third_party_audited","regulator_approved","continuous_compliance","ai_autonomous_certification"];

// ─── Helpers ──────────────────────────────────────────────
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

function StatBox({ label, value, color = "text-gray-200" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-gray-900/60 rounded p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-mono font-semibold ${color}`}>{value}</div>
    </div>
  );
}

// ─── Tab Panels ──────────────────────────────────────────

function AuditTab() {
  const [auditType, setAuditType] = useState(AUDIT_TYPES[5]);
  const [thoroughness, setThoroughness] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Audit Type" value={auditType} options={AUDIT_TYPES} onChange={setAuditType} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Thoroughness</label>
          <input type="range" min="0.1" max="1" step="0.05" value={thoroughness} onChange={(e) => setThoroughness(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{thoroughness}</div>
        </div>
      </div>
      <Card title="Audit Records">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Category</th>
                <th className="text-right py-2 px-2">Coverage</th>
                <th className="text-right py-2 px-2">Depth</th>
                <th className="text-center py-2 px-2">Issues</th>
                <th className="text-center py-2 px-2">Status</th>
                <th className="text-right py-2 px-2">Evidence</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "ADT-001", cat: "input_validation", cov: 0.88, dep: 0.72, iss: 0, stat: "compliant", evi: 0.85 },
                { id: "ADT-002", cat: "process_integrity", cov: 0.75, dep: 0.68, iss: 2, stat: "partially_compliant", evi: 0.78 },
                { id: "ADT-003", cat: "output_accuracy", cov: 0.82, dep: 0.75, iss: 1, stat: "partially_compliant", evi: 0.81 },
                { id: "ADT-004", cat: "data_provenance", cov: 0.91, dep: 0.85, iss: 0, stat: "compliant", evi: 0.92 },
                { id: "ADT-005", cat: "model_governance", cov: 0.65, dep: 0.58, iss: 3, stat: "non_compliant", evi: 0.62 },
                { id: "ADT-006", cat: "bias_detection", cov: 0.79, dep: 0.71, iss: 1, stat: "partially_compliant", evi: 0.75 },
              ].map((r) => (
                <tr key={r.id} className={`border-b border-gray-800 hover:bg-gray-800/40 ${r.stat === "non_compliant" ? "bg-red-900/10" : ""}`}>
                  <td className="py-2 px-2 font-mono text-xs">{r.id}</td>
                  <td className="py-2 px-2"><Badge label={r.cat.replace(/_/g, " ")} color="purple" /></td>
                  <td className={`py-2 px-2 text-right font-mono ${r.cov > 0.8 ? "text-green-400" : "text-amber-400"}`}>{r.cov.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{r.dep.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center font-mono">{r.iss}</td>
                  <td className="py-2 px-2 text-center">
                    <Badge
                      label={r.stat.replace(/_/g, " ")}
                      color={r.stat === "compliant" ? "green" : r.stat === "non_compliant" ? "red" : "amber"}
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-blue-400">{r.evi.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Compliance Rate" value="33.3%" color="text-amber-400" />
        <StatBox label="Avg Coverage" value="0.800" color="text-green-400" />
        <StatBox label="Critical Issues" value="1" color="text-red-400" />
        <StatBox label="Evidence Quality" value="0.788" color="text-blue-400" />
      </div>
    </div>
  );
}

function ComplyTab() {
  const [framework, setFramework] = useState(COMPLIANCE_FRAMEWORKS[5]);
  const [strictness, setStrictness] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Compliance Framework" value={framework} options={COMPLIANCE_FRAMEWORKS} onChange={setFramework} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Strictness</label>
          <input type="range" min="0.1" max="1" step="0.05" value={strictness} onChange={(e) => setStrictness(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{strictness}</div>
        </div>
      </div>
      <Card title="Compliance Control Assessment">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Domain</th>
                <th className="text-right py-2 px-2">Score</th>
                <th className="text-right py-2 px-2">Gap</th>
                <th className="text-center py-2 px-2">Status</th>
                <th className="text-right py-2 px-2">Penalty Risk</th>
                <th className="text-right py-2 px-2">Effort</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "CMP-001", dom: "fairness", score: 0.88, gap: 0.12, stat: "fully_compliant", pen: 0.11, eff: 0.08 },
                { id: "CMP-002", dom: "transparency", score: 0.72, gap: 0.28, stat: "mostly_compliant", pen: 0.27, eff: 0.22 },
                { id: "CMP-003", dom: "accountability", score: 0.55, gap: 0.45, stat: "partially_compliant", pen: 0.43, eff: 0.38 },
                { id: "CMP-004", dom: "safety", score: 0.91, gap: 0.09, stat: "fully_compliant", pen: 0.09, eff: 0.06 },
                { id: "CMP-005", dom: "privacy", score: 0.68, gap: 0.32, stat: "mostly_compliant", pen: 0.30, eff: 0.25 },
                { id: "CMP-006", dom: "fairness", score: 0.42, gap: 0.58, stat: "partially_compliant", pen: 0.55, eff: 0.48 },
              ].map((c) => (
                <tr key={c.id} className={`border-b border-gray-800 hover:bg-gray-800/40 ${c.stat === "non_compliant" ? "bg-red-900/10" : ""}`}>
                  <td className="py-2 px-2 font-mono text-xs">{c.id}</td>
                  <td className="py-2 px-2"><Badge label={c.dom} color="cyan" /></td>
                  <td className={`py-2 px-2 text-right font-mono ${c.score > 0.8 ? "text-green-400" : c.score > 0.6 ? "text-amber-400" : "text-red-400"}`}>{c.score.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-amber-400">{c.gap.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">
                    <Badge
                      label={c.stat.replace(/_/g, " ")}
                      color={c.stat === "fully_compliant" ? "green" : c.stat === "non_compliant" ? "red" : "amber"}
                    />
                  </td>
                  <td className={`py-2 px-2 text-right font-mono ${c.pen > 0.4 ? "text-red-400" : "text-amber-400"}`}>{c.pen.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-purple-400">{c.eff.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Full Compliance" value="33.3%" color="text-green-400" />
        <StatBox label="Avg Score" value="0.693" color="text-cyan-400" />
        <StatBox label="Risk Exposure" value="1.750" color="text-red-400" />
        <StatBox label="Maturity" value="0.485" color="text-purple-400" />
      </div>
    </div>
  );
}

function TraceTab() {
  const [lineageType, setLineageType] = useState(LINEAGE_TYPES[5]);
  const [traceDepth, setTraceDepth] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Lineage Type" value={lineageType} options={LINEAGE_TYPES} onChange={setLineageType} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Trace Depth</label>
          <input type="range" min="0.1" max="1" step="0.05" value={traceDepth} onChange={(e) => setTraceDepth(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{traceDepth}</div>
        </div>
      </div>
      <Card title="Lineage Provenance Chain">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-center py-2 px-2">Type</th>
                <th className="text-right py-2 px-2">Complete</th>
                <th className="text-center py-2 px-2">Links</th>
                <th className="text-right py-2 px-2">Audit.</th>
                <th className="text-center py-2 px-2">Verified</th>
                <th className="text-right py-2 px-2">Orphan</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "LNG-001", type: "source", comp: 0.92, links: "3↑ / 2↓", audit: 0.88, verified: true, orphan: 0.08 },
                { id: "LNG-002", type: "transform", comp: 0.78, links: "2↑ / 3↓", audit: 0.82, verified: true, orphan: 0.22 },
                { id: "LNG-003", type: "model", comp: 0.65, links: "1↑ / 1↓", audit: 0.75, verified: false, orphan: 0.35 },
                { id: "LNG-004", type: "decision", comp: 0.88, links: "2↑ / 4↓", audit: 0.91, verified: true, orphan: 0.12 },
                { id: "LNG-005", type: "output", comp: 0.72, links: "1↑ / 0↓", audit: 0.68, verified: true, orphan: 0.28 },
                { id: "LNG-006", type: "policy", comp: 0.95, links: "0↑ / 2↓", audit: 0.94, verified: true, orphan: 0.05 },
              ].map((n) => (
                <tr key={n.id} className={`border-b border-gray-800 hover:bg-gray-800/40 ${!n.verified ? "bg-amber-900/10" : ""}`}>
                  <td className="py-2 px-2 font-mono text-xs">{n.id}</td>
                  <td className="py-2 px-2 text-center"><Badge label={n.type} color="purple" /></td>
                  <td className={`py-2 px-2 text-right font-mono ${n.comp > 0.8 ? "text-green-400" : "text-amber-400"}`}>{n.comp.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center text-xs text-gray-400">{n.links}</td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{n.audit.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">{n.verified ? "✓" : "✗"}</td>
                  <td className={`py-2 px-2 text-right font-mono ${n.orphan < 0.15 ? "text-green-400" : "text-amber-400"}`}>{n.orphan.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Verified Chains" value="83.3%" color="text-green-400" />
        <StatBox label="Avg Complete" value="0.817" color="text-cyan-400" />
        <StatBox label="Provenance" value="0.748" color="text-blue-400" />
        <StatBox label="Orphan Risk" value="0.183" color="text-amber-400" />
      </div>
    </div>
  );
}

function GovernTab() {
  const [policy, setPolicy] = useState(GOVERNANCE_POLICIES[5]);
  const [enforcement, setEnforcement] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Governance Policy" value={policy} options={GOVERNANCE_POLICIES} onChange={setPolicy} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Enforcement Level</label>
          <input type="range" min="0.1" max="1" step="0.05" value={enforcement} onChange={(e) => setEnforcement(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{enforcement}</div>
        </div>
      </div>
      <Card title="Governance Rule Enforcement">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-center py-2 px-2">Action</th>
                <th className="text-right py-2 px-2">Effect.</th>
                <th className="text-right py-2 px-2">Detect</th>
                <th className="text-center py-2 px-2">Violations</th>
                <th className="text-right py-2 px-2">Resp. (ms)</th>
                <th className="text-right py-2 px-2">Impact</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "GOV-001", action: "block", eff: 0.92, det: 0.88, viol: 0, resp: 12.5, impact: 0.88 },
                { id: "GOV-002", action: "warn", eff: 0.78, det: 0.82, viol: 3, resp: 45.2, impact: 0.72 },
                { id: "GOV-003", action: "auto_remediate", eff: 0.85, det: 0.91, viol: 1, resp: 28.8, impact: 0.81 },
                { id: "GOV-004", action: "escalate", eff: 0.72, det: 0.75, viol: 5, resp: 120.0, impact: 0.68 },
                { id: "GOV-005", action: "quarantine", eff: 0.88, det: 0.85, viol: 0, resp: 35.5, impact: 0.84 },
                { id: "GOV-006", action: "log", eff: 0.65, det: 0.70, viol: 8, resp: 8.2, impact: 0.52 },
              ].map((r) => (
                <tr key={r.id} className={`border-b border-gray-800 hover:bg-gray-800/40 ${r.viol > 4 ? "bg-red-900/10" : ""}`}>
                  <td className="py-2 px-2 font-mono text-xs">{r.id}</td>
                  <td className="py-2 px-2 text-center">
                    <Badge
                      label={r.action.replace(/_/g, " ")}
                      color={r.action === "block" ? "red" : r.action === "auto_remediate" ? "green" : r.action === "escalate" ? "amber" : "cyan"}
                    />
                  </td>
                  <td className={`py-2 px-2 text-right font-mono ${r.eff > 0.8 ? "text-green-400" : "text-amber-400"}`}>{r.eff.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{r.det.toFixed(3)}</td>
                  <td className={`py-2 px-2 text-center font-mono ${r.viol > 4 ? "text-red-400" : r.viol > 0 ? "text-amber-400" : "text-green-400"}`}>{r.viol}</td>
                  <td className="py-2 px-2 text-right font-mono text-purple-400">{r.resp.toFixed(1)}</td>
                  <td className="py-2 px-2 text-right font-mono text-blue-400">{r.impact.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Avg Effect." value="0.800" color="text-green-400" />
        <StatBox label="Total Violations" value="17" color="text-amber-400" />
        <StatBox label="Governance Mat." value="0.686" color="text-cyan-400" />
        <StatBox label="Auto Efficiency" value="0.560" color="text-purple-400" />
      </div>
    </div>
  );
}

function ReportTab() {
  const [reportType, setReportType] = useState(REPORT_TYPES[5]);
  const [detailLevel, setDetailLevel] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Report Type" value={reportType} options={REPORT_TYPES} onChange={setReportType} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Detail Level</label>
          <input type="range" min="0.1" max="1" step="0.05" value={detailLevel} onChange={(e) => setDetailLevel(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{detailLevel}</div>
        </div>
      </div>
      <Card title="Report Section Analysis">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Section</th>
                <th className="text-right py-2 px-2">Quality</th>
                <th className="text-right py-2 px-2">Complete</th>
                <th className="text-center py-2 px-2">Data Pts</th>
                <th className="text-center py-2 px-2">Insights</th>
                <th className="text-center py-2 px-2">Risk Flags</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "RPT-001", sec: "executive_summary", qual: 0.88, comp: 0.82, dp: 18, ins: 3, rf: 0 },
                { id: "RPT-002", sec: "methodology", qual: 0.75, comp: 0.78, dp: 25, ins: 1, rf: 1 },
                { id: "RPT-003", sec: "findings", qual: 0.82, comp: 0.85, dp: 35, ins: 4, rf: 2 },
                { id: "RPT-004", sec: "recommendations", qual: 0.72, comp: 0.68, dp: 12, ins: 5, rf: 0 },
                { id: "RPT-005", sec: "metrics", qual: 0.91, comp: 0.95, dp: 42, ins: 2, rf: 1 },
                { id: "RPT-006", sec: "risk_matrix", qual: 0.78, comp: 0.72, dp: 15, ins: 3, rf: 3 },
              ].map((s) => (
                <tr key={s.id} className={`border-b border-gray-800 hover:bg-gray-800/40 ${s.rf > 2 ? "bg-red-900/10" : ""}`}>
                  <td className="py-2 px-2 font-mono text-xs">{s.id}</td>
                  <td className="py-2 px-2"><Badge label={s.sec.replace(/_/g, " ")} color="purple" /></td>
                  <td className={`py-2 px-2 text-right font-mono ${s.qual > 0.8 ? "text-green-400" : "text-amber-400"}`}>{s.qual.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-cyan-400">{s.comp.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center font-mono text-blue-400">{s.dp}</td>
                  <td className="py-2 px-2 text-center font-mono text-green-400">{s.ins}</td>
                  <td className={`py-2 px-2 text-center font-mono ${s.rf > 2 ? "text-red-400" : s.rf > 0 ? "text-amber-400" : "text-green-400"}`}>{s.rf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Avg Quality" value="0.810" color="text-green-400" />
        <StatBox label="Data Points" value="147" color="text-cyan-400" />
        <StatBox label="Insights" value="18" color="text-blue-400" />
        <StatBox label="Risk Flags" value="7" color="text-amber-400" />
      </div>
    </div>
  );
}

function CertifyTab() {
  const [certLevel, setCertLevel] = useState(CERTIFICATION_LEVELS[5]);
  const [rigor, setRigor] = useState("0.70");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SelectField label="Certification Level" value={certLevel} options={CERTIFICATION_LEVELS} onChange={setCertLevel} />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Rigor</label>
          <input type="range" min="0.1" max="1" step="0.05" value={rigor} onChange={(e) => setRigor(e.target.value)} className="w-full" />
          <div className="text-xs text-center text-gray-400 mt-1">{rigor}</div>
        </div>
      </div>
      <Card title="Certification Domain Assessment">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-2 px-2">ID</th>
                <th className="text-left py-2 px-2">Domain</th>
                <th className="text-right py-2 px-2">Score</th>
                <th className="text-right py-2 px-2">Threshold</th>
                <th className="text-center py-2 px-2">Passed</th>
                <th className="text-right py-2 px-2">Gap</th>
                <th className="text-right py-2 px-2">Trust</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                { id: "CRT-001", dom: "data_governance", score: 0.85, thresh: 0.60, passed: true, gap: 0.0, trust: 0.98 },
                { id: "CRT-002", dom: "model_governance", score: 0.72, thresh: 0.60, passed: true, gap: 0.0, trust: 0.72 },
                { id: "CRT-003", dom: "process_governance", score: 0.58, thresh: 0.60, passed: false, gap: 0.02, trust: 0.56 },
                { id: "CRT-004", dom: "security", score: 0.91, thresh: 0.60, passed: true, gap: 0.0, trust: 0.91 },
                { id: "CRT-005", dom: "privacy", score: 0.78, thresh: 0.60, passed: true, gap: 0.0, trust: 0.78 },
                { id: "CRT-006", dom: "transparency", score: 0.65, thresh: 0.60, passed: true, gap: 0.0, trust: 0.65 },
              ].map((d) => (
                <tr key={d.id} className={`border-b border-gray-800 hover:bg-gray-800/40 ${!d.passed ? "bg-red-900/10" : d.score > 0.8 ? "bg-green-900/10" : ""}`}>
                  <td className="py-2 px-2 font-mono text-xs">{d.id}</td>
                  <td className="py-2 px-2"><Badge label={d.dom.replace(/_/g, " ")} color="cyan" /></td>
                  <td className={`py-2 px-2 text-right font-mono ${d.score > 0.8 ? "text-green-400" : d.score > 0.6 ? "text-amber-400" : "text-red-400"}`}>{d.score.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-gray-400">{d.thresh.toFixed(3)}</td>
                  <td className="py-2 px-2 text-center">{d.passed ? "✓" : "✗"}</td>
                  <td className={`py-2 px-2 text-right font-mono ${d.gap > 0 ? "text-red-400" : "text-green-400"}`}>{d.gap > 0 ? `+${d.gap.toFixed(3)}` : "—"}</td>
                  <td className="py-2 px-2 text-right font-mono text-purple-400">{d.trust.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid grid-cols-4 gap-3">
        <StatBox label="Pass Rate" value="83.3%" color="text-green-400" />
        <StatBox label="Avg Score" value="0.748" color="text-cyan-400" />
        <StatBox label="Trust Score" value="0.818" color="text-blue-400" />
        <StatBox label="Viability" value="0.612" color="text-purple-400" />
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <Card title="Engine Info">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
          <div><span className="text-gray-500">Engine:</span> v1.262 — Graph Causal Governance & Compliance Engine</div>
          <div><span className="text-gray-500">Role:</span> Ensure responsible operation through auditing, compliance, lineage tracking, governance, reporting, certification</div>
          <div><span className="text-gray-500">Predecessor:</span> v1.261 — Causal Emergence & Complexity Engine</div>
          <div><span className="text-gray-500">Enums:</span> 6 enums × 6 values = 36</div>
        </div>
      </Card>
      <Card title="Enums">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { name: "AuditType", vals: AUDIT_TYPES },
            { name: "ComplianceFramework", vals: COMPLIANCE_FRAMEWORKS },
            { name: "LineageType", vals: LINEAGE_TYPES },
            { name: "GovernancePolicy", vals: GOVERNANCE_POLICIES },
            { name: "ReportType", vals: REPORT_TYPES },
            { name: "CertificationLevel", vals: CERTIFICATION_LEVELS },
          ].map((e) => (
            <div key={e.name} className="bg-gray-900/60 rounded p-3">
              <div className="text-xs text-purple-400 font-semibold mb-2">{e.name}</div>
              <div className="flex flex-wrap gap-1">
                {e.vals.map((v) => (
                  <Badge key={v} label={v.replace(/_/g, " ")} color="blue" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Endpoints">
        <div className="space-y-1 text-sm font-mono text-gray-300">
          <div className="text-green-400">POST /graph/causal-governance/audit</div>
          <div className="text-green-400">POST /graph/causal-governance/comply</div>
          <div className="text-green-400">POST /graph/causal-governance/trace</div>
          <div className="text-green-400">POST /graph/causal-governance/govern</div>
          <div className="text-green-400">POST /graph/causal-governance/report</div>
          <div className="text-green-400">POST /graph/causal-governance/certify</div>
          <div className="text-cyan-400">GET  /graph/causal-governance/overview</div>
        </div>
      </Card>
      <Card title="Governance & Compliance Layer">
        <div className="text-sm text-gray-300 font-mono space-y-1">
          <div>Causal Intelligence Stack (14 layers):</div>
          <div>Discovery → Explanation → Argumentation → Fairness → Curriculum → Optimization</div>
          <div>→ Intervention → Distillation → Ensemble → Temporal → Feedback → Meta-Cognitive</div>
          <div className="mt-2 text-emerald-400">Emergence & Complexity Layer (v1.261):</div>
          <div className="text-emerald-400">Detect → Analyze → Decompose → Simulate → Quantify → Evolve</div>
          <div className="mt-2 text-amber-400 font-bold">Governance & Compliance Layer (v1.262):</div>
          <div className="text-amber-400">Audit → Comply → Trace → Govern → Report → Certify</div>
          <div className="mt-2 text-cyan-400">Core Insight: Trust = compliance_rate × verification_depth × auditability</div>
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────
export default function CausalGovernanceCompliancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("Audit");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">
              Causal Governance & Compliance Engine
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              v1.262 — Audit → Comply → Trace → Govern → Report → Certify
            </p>
          </div>
          <Badge label="v1.262" color="amber" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-gray-700 text-white font-semibold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          {activeTab === "Audit" && <AuditTab />}
          {activeTab === "Comply" && <ComplyTab />}
          {activeTab === "Trace" && <TraceTab />}
          {activeTab === "Govern" && <GovernTab />}
          {activeTab === "Report" && <ReportTab />}
          {activeTab === "Certify" && <CertifyTab />}
          {activeTab === "Overview" && <OverviewTab />}
        </div>
      </div>
    </div>
  );
}
