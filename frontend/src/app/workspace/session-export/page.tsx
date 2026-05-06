"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileJson,
  FileText,
  FileCode,
  Archive,
  Check,
  ChevronDown,
  Loader2,
  Trash2,
  RefreshCw,
  Calendar,
  Clock,
  Package,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// Types
// ============================================================

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ExportRecord {
  fileName: string;
  format: string;
  timestamp: string;
  size: number;
  sessionCount: number;
}

interface ExportOptions {
  format: "json" | "markdown" | "html" | "csv";
  includeMetadata: boolean;
  includeTimestamps: boolean;
  includeToolCalls: boolean;
  includeThinking: boolean;
  mediaHandling: "embed" | "link" | "skip";
  mediaBase64Threshold: number;
  compressMedia: boolean;
  prettyPrint: boolean;
  template?: string;
}

// ============================================================
// Components
// ============================================================

function FormatButton({
  format,
  selected,
  onClick,
  icon: Icon,
  label,
}: {
  format: string;
  selected: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
        selected
          ? "border-blue-500 bg-blue-500/10 text-blue-400"
          : "border-[#2a2a2a] bg-[#1a1a1a] text-gray-400 hover:border-gray-600 hover:text-gray-300"
      )}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={cn(
          "w-10 h-5 rounded-full transition-colors relative",
          checked ? "bg-blue-500" : "bg-[#2a2a2a]"
        )}
      >
        <div
          className={cn(
            "w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}

function TemplateCard({ template, selected, onClick }: { template: ExportTemplate; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
        selected
          ? "border-blue-500 bg-blue-500/10"
          : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-gray-600"
      )}
    >
      <div className="p-2 bg-[#2a2a2a] rounded-lg">
        <Package className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{template.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
      </div>
      {selected && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
    </button>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function SessionExportPage() {
  const { t } = useTranslation();
  const [options, setOptions] = useState<ExportOptions>({
    format: "json",
    includeMetadata: true,
    includeTimestamps: true,
    includeToolCalls: true,
    includeThinking: false,
    mediaHandling: "embed",
    mediaBase64Threshold: 1024 * 1024,
    compressMedia: true,
    prettyPrint: true,
  });
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"export" | "history">("export");

  const isElectron = typeof window !== "undefined" && (window as any).electronAPI;

  // Fetch templates and export history
  const fetchData = useCallback(async () => {
    if (!isElectron) return;
    setLoading(true);
    try {
      const api = (window as any).electronAPI.sessionExport;
      const [tpls, exps] = await Promise.all([api.getTemplates(), api.listExports()]);
      setTemplates(tpls || []);
      setExports(exps || []);
    } catch (err: any) {
      setError(err.message || "Failed to load export data");
    } finally {
      setLoading(false);
    }
  }, [isElectron]);

  useEffect(() => {
    if (isElectron) fetchData();
    else {
      // Mock data for browser preview
      setTemplates([
        { id: "default", name: "Default", description: "Standard export with all content", icon: "file" },
        { id: "minimal", name: "Minimal", description: "Messages only, no metadata", icon: "file" },
        { id: "detailed", name: "Detailed", description: "Full content with tool calls and reasoning", icon: "file" },
        { id: "shareable", name: "Shareable", description: "Clean format for sharing", icon: "file" },
      ]);
      setExports([
        { fileName: "session_2024-01-15.json", format: "json", timestamp: "2024-01-15T10:30:00Z", size: 24580, sessionCount: 1 },
        { fileName: "batch_export_2024-01-14.zip", format: "zip", timestamp: "2024-01-14T16:45:00Z", size: 156000, sessionCount: 5 },
      ]);
    }
  }, [isElectron, fetchData]);

  const handleExport = async () => {
    if (!isElectron) {
      setError("Export requires Electron environment");
      return;
    }
    setExporting(true);
    setError(null);
    setSuccess(null);
    try {
      const api = (window as any).electronAPI.sessionExport;
      // For demo, export a mock session
      const result = await api.export("demo-session", options);
      if (result.success) {
        setSuccess(`Exported to ${result.filePath}`);
        fetchData();
      } else {
        setError(result.error || "Export failed");
      }
    } catch (err: any) {
      setError(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteExport = async (fileName: string) => {
    if (!isElectron) return;
    try {
      const api = (window as any).electronAPI.sessionExport;
      await api.deleteExport(fileName);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to delete export");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Download className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">{t("sessionExport.title") || "Session Export"}</h1>
            <p className="text-xs text-gray-500">{t("sessionExport.subtitle") || "Export sessions in multiple formats"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1">
          {(["export", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-medium transition-colors",
                activeTab === tab ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-gray-300"
              )}
            >
              {tab === "export" ? "New Export" : "History"}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-xs hover:underline">Dismiss</button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-6 mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-sm"
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            {success}
            <button onClick={() => setSuccess(null)} className="ml-auto text-xs hover:underline">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "export" ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Format Selection */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Export Format</h3>
              <div className="grid grid-cols-4 gap-3">
                <FormatButton
                  format="json"
                  selected={options.format === "json"}
                  onClick={() => setOptions((o) => ({ ...o, format: "json" }))}
                  icon={FileJson}
                  label="JSON"
                />
                <FormatButton
                  format="markdown"
                  selected={options.format === "markdown"}
                  onClick={() => setOptions((o) => ({ ...o, format: "markdown" }))}
                  icon={FileText}
                  label="Markdown"
                />
                <FormatButton
                  format="html"
                  selected={options.format === "html"}
                  onClick={() => setOptions((o) => ({ ...o, format: "html" }))}
                  icon={FileCode}
                  label="HTML"
                />
                <FormatButton
                  format="csv"
                  selected={options.format === "csv"}
                  onClick={() => setOptions((o) => ({ ...o, format: "csv" }))}
                  icon={Archive}
                  label="CSV"
                />
              </div>
            </div>

            {/* Options */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Export Options</h3>
              <div className="space-y-1">
                <Toggle
                  label="Include metadata"
                  checked={options.includeMetadata}
                  onChange={(v) => setOptions((o) => ({ ...o, includeMetadata: v }))}
                />
                <Toggle
                  label="Include timestamps"
                  checked={options.includeTimestamps}
                  onChange={(v) => setOptions((o) => ({ ...o, includeTimestamps: v }))}
                />
                <Toggle
                  label="Include tool calls"
                  checked={options.includeToolCalls}
                  onChange={(v) => setOptions((o) => ({ ...o, includeToolCalls: v }))}
                />
                <Toggle
                  label="Include thinking/reasoning"
                  checked={options.includeThinking}
                  onChange={(v) => setOptions((o) => ({ ...o, includeThinking: v }))}
                />
                <Toggle
                  label="Pretty print"
                  checked={options.prettyPrint}
                  onChange={(v) => setOptions((o) => ({ ...o, prettyPrint: v }))}
                />
              </div>

              <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
                <h4 className="text-xs font-medium text-gray-400 mb-3">Media Handling</h4>
                <div className="flex gap-2">
                  {(["embed", "link", "skip"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setOptions((o) => ({ ...o, mediaHandling: mode }))}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                        options.mediaHandling === mode
                          ? "border-blue-500 bg-blue-500/10 text-blue-400"
                          : "border-[#2a2a2a] text-gray-400 hover:text-gray-300"
                      )}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Templates */}
            {templates.length > 0 && (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Templates</h3>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((tpl) => (
                    <TemplateCard
                      key={tpl.id}
                      template={tpl}
                      selected={options.template === tpl.id}
                      onClick={() => setOptions((o) => ({ ...o, template: tpl.id }))}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-xl font-medium transition-colors"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Session
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {exports.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No exports yet</p>
                <p className="text-xs text-gray-600 mt-1">Export a session to see it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exports.map((exp) => (
                  <motion.div
                    key={exp.fileName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="p-2 bg-[#2a2a2a] rounded-lg">
                      {exp.format === "json" && <FileJson className="w-5 h-5 text-blue-400" />}
                      {exp.format === "markdown" && <FileText className="w-5 h-5 text-green-400" />}
                      {exp.format === "html" && <FileCode className="w-5 h-5 text-orange-400" />}
                      {(exp.format === "zip" || exp.format === "csv") && <Archive className="w-5 h-5 text-purple-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{exp.fileName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{formatFileSize(exp.size)}</span>
                        <span className="text-xs text-gray-500">{exp.sessionCount} session{exp.sessionCount > 1 ? "s" : ""}</span>
                        <span className="text-xs text-gray-500">{formatDate(exp.timestamp)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteExport(exp.fileName)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
