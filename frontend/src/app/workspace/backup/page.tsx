/**
 * Auto-Backup & Restore Settings Page
 *
 * Configure automatic backups, manage backup history, and restore data.
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  useBackupConfig,
  useUpdateBackupConfig,
  useBackups,
  useCreateBackup,
  useDeleteBackup,
  useRestoreBackup,
  useBackupStats,
} from "@/core/backup";
import type { BackupEntry, BackupConfig } from "@/core/backup";
import {
  Database,
  Clock,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Save,
  FolderOpen,
  Calendar,
  FileArchive,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  Settings,
  Shield,
  Layers,
  Brain,
  Workflow,
  MessageSquare,
  Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// Helpers
// ============================================================

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN");
}

// ============================================================
// Components
// ============================================================

function ComponentToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
        checked
          ? "border-indigo-500/30 bg-indigo-500/5"
          : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]"
      )}
      onClick={() => onChange(!checked)}
    >
      <div className={cn("p-2 rounded-lg mt-0.5", checked ? "bg-indigo-500/20" : "bg-[#2a2a2a]")}>
        <Icon className={cn("w-4 h-4", checked ? "text-indigo-400" : "text-gray-500")} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={cn("text-sm font-medium", checked ? "text-white" : "text-gray-300")}>{label}</span>
          <div
            className={cn(
              "w-10 h-5 rounded-full relative transition-colors",
              checked ? "bg-indigo-500" : "bg-[#3a3a3a]"
            )}
          >
            <div
              className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                checked ? "left-5" : "left-0.5"
              )}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

function BackupCard({
  backup,
  onRestore,
  onDelete,
  onExport,
}: {
  backup: BackupEntry;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  return (
    <motion.div
      layout
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#3a3a3a] transition-colors"
    >
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FileArchive className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-white">{backup.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{formatDate(backup.createdAt)}</span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-500">{formatBytes(backup.size)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onRestore(backup.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t("backup.restore")}
          </button>
          <button
            onClick={() => onExport(backup.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#2a2a2a] text-gray-300 hover:bg-[#333] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(backup.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a] transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 border-t border-[#2a2a2a]">
              {backup.description && (
                <p className="text-xs text-gray-400 mt-3">{backup.description}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {backup.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-xs bg-[#2a2a2a] text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-3 space-y-1.5">
                {backup.contents.map((content) => (
                  <div
                    key={content.type}
                    className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#222]"
                  >
                    <span className="text-xs text-gray-400 capitalize">{content.type}</span>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{content.count} items</span>
                      <span>{formatBytes(content.size)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================
// Main Page
// ============================================================

export default function BackupSettingsPage() {
  const { t } = useTranslation();

  // React Query hooks — replace all mock data
  const { data: config, isLoading: isConfigLoading } = useBackupConfig();
  const { data: backups = [], isLoading: isBackupsLoading } = useBackups();
  const { data: stats } = useBackupStats();
  const createMutation = useCreateBackup();
  const deleteMutation = useDeleteBackup();
  const restoreMutation = useRestoreBackup();
  const updateConfigMutation = useUpdateBackupConfig();

  // Local config copy for form editing (synced from fetched config)
  const [localConfig, setLocalConfig] = useState<BackupConfig | null>(null);
  useEffect(() => {
    if (config && !localConfig) setLocalConfig(config);
  }, [config, localConfig]);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);
  const [restoreComponents, setRestoreComponents] = useState<string[]>(["sessions", "workflows", "config", "knowledge-graph", "memories", "plugins"]);
  const [mergeStrategy, setMergeStrategy] = useState<"overwrite" | "merge" | "skip">("overwrite");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isCreating, setIsCreating] = useState(false);

  const effectiveConfig = localConfig ?? config ?? {
    enabled: true,
    intervalHours: 24,
    maxBackups: 10,
    backupPath: ".deerflow/backups",
    includeSessions: true,
    includeWorkflows: true,
    includeKnowledgeGraph: true,
    includeConfig: true,
    includeMemories: true,
    includePlugins: true,
    compress: true,
  } as BackupConfig;
  const effectiveStats = stats ?? {
    totalBackups: backups.length,
    totalSize: backups.reduce((s, b) => s + (b.size ?? 0), 0),
    autoBackupEnabled: effectiveConfig.enabled ?? false,
  };

  const handleCreateBackup = async () => {
    setIsCreating(true);
    await createMutation.mutateAsync({
      name: `Manual Backup ${new Date().toLocaleString("zh-CN")}`,
      description: "Manually created backup",
      tags: ["manual"],
    });
    setIsCreating(false);
  };

  const handleDeleteBackup = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleRestore = (id: string) => {
    setRestoreTarget(id);
    setShowRestoreModal(true);
  };

  const confirmRestore = async () => {
    if (!restoreTarget) return;
    setShowRestoreModal(false);
    await restoreMutation.mutateAsync({
      backupId: restoreTarget,
      mergeStrategy,
      components: restoreComponents,
    });
    setRestoreTarget(null);
  };

  const handleExport = (id: string) => {
    const backup = backups.find((b) => b.id === id);
    if (!backup) return;
    const data = JSON.stringify(backup, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${backup.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveConfig = async () => {
    if (!localConfig) return;
    setSaveStatus("saving");
    await updateConfigMutation.mutateAsync(localConfig);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const updateLocalConfig = (updates: Partial<BackupConfig>) => {
    if (!localConfig && config) setLocalConfig({ ...config, ...updates });
    else if (localConfig) setLocalConfig({ ...localConfig, ...updates });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">{t("backup.title")}</h1>
            <p className="text-xs text-gray-500">{t("backup.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateBackup}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("backup.creating")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t("backup.createNow")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Stats + Config */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">{t("backup.stats")}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#222] rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{effectiveStats.totalBackups}</div>
                  <div className="text-xs text-gray-500 mt-1">{t("backup.totalBackups")}</div>
                </div>
                <div className="bg-[#222] rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{formatBytes(effectiveStats.totalSize)}</div>
                  <div className="text-xs text-gray-500 mt-1">{t("backup.totalSize")}</div>
                </div>
                <div className="bg-[#222] rounded-lg p-3">
                  <div className="flex items-center gap-1.5">
                    {effectiveStats.autoBackupEnabled ? (
                      <>
                        <Play className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-sm font-medium text-green-400">{t("backup.running")}</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-400">{t("backup.paused")}</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{t("backup.autoBackup")}</div>
                </div>
                <div className="bg-[#222] rounded-lg p-3">
                  <div className="text-sm font-medium text-white">
                    {effectiveStats.nextScheduledBackup ? formatDate(effectiveStats.nextScheduledBackup) : "--"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{t("backup.nextBackup")}</div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">{t("backup.configuration")}</h3>
                <button
                  onClick={handleSaveConfig}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    saveStatus === "saved"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                  )}
                >
                  {saveStatus === "saving" ? (
                    <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                  ) : saveStatus === "saved" ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {saveStatus === "saved" ? t("backup.saved") : t("backup.save")}
                </button>
              </div>

              <div className="space-y-4">
                {/* Enable toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{t("backup.enableAuto")}</span>
                  </div>
                  <button
                    onClick={() => updateLocalConfig({ enabled: !effectiveConfig.enabled })}
                    className={cn(
                      "w-10 h-5 rounded-full relative transition-colors",
                      effectiveConfig.enabled ? "bg-indigo-500" : "bg-[#3a3a3a]"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                        effectiveConfig.enabled ? "left-5" : "left-0.5"
                      )}
                    />
                  </button>
                </div>

                {/* Interval */}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">{t("backup.interval")}</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <select
                      value={effectiveConfig.intervalHours}
                      onChange={(e) => updateLocalConfig({ intervalHours: Number(e.target.value) })}
                      className="flex-1 bg-[#222] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value={1}>1 {t("backup.hour")}</option>
                      <option value={6}>6 {t("backup.hours")}</option>
                      <option value={12}>12 {t("backup.hours")}</option>
                      <option value={24}>24 {t("backup.hours")}</option>
                      <option value={48}>48 {t("backup.hours")}</option>
                      <option value={168}>1 {t("backup.week")}</option>
                    </select>
                  </div>
                </div>

                {/* Max backups */}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">{t("backup.maxBackups")}</label>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-gray-500" />
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={effectiveConfig.maxBackups}
                      onChange={(e) => updateLocalConfig({ maxBackups: Number(e.target.value) })}
                      className="flex-1 bg-[#222] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Backup path */}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">{t("backup.path")}</label>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={effectiveConfig.backupPath}
                      onChange={(e) => updateLocalConfig({ backupPath: e.target.value })}
                      className="flex-1 bg-[#222] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Components to include */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4">{t("backup.includeComponents")}</h3>
              <div className="space-y-2">
                <ComponentToggle
                  icon={MessageSquare}
                  label={t("backup.sessions")}
                  description={t("backup.sessionsDesc")}
                  checked={effectiveConfig.includeSessions}
                  onChange={(v) => updateLocalConfig({ includeSessions: v })}
                />
                <ComponentToggle
                  icon={Workflow}
                  label={t("backup.workflows")}
                  description={t("backup.workflowsDesc")}
                  checked={effectiveConfig.includeWorkflows}
                  onChange={(v) => updateLocalConfig({ includeWorkflows: v })}
                />
                <ComponentToggle
                  icon={Layers}
                  label={t("backup.knowledgeGraph")}
                  description={t("backup.knowledgeGraphDesc")}
                  checked={effectiveConfig.includeKnowledgeGraph}
                  onChange={(v) => updateLocalConfig({ includeKnowledgeGraph: v })}
                />
                <ComponentToggle
                  icon={Settings}
                  label={t("backup.config")}
                  description={t("backup.configDesc")}
                  checked={effectiveConfig.includeConfig}
                  onChange={(v) => updateLocalConfig({ includeConfig: v })}
                />
                <ComponentToggle
                  icon={Brain}
                  label={t("backup.memories")}
                  description={t("backup.memoriesDesc")}
                  checked={effectiveConfig.includeMemories}
                  onChange={(v) => updateLocalConfig({ includeMemories: v })}
                />
                <ComponentToggle
                  icon={Puzzle}
                  label={t("backup.plugins")}
                  description={t("backup.pluginsDesc")}
                  checked={effectiveConfig.includePlugins}
                  onChange={(v) => updateLocalConfig({ includePlugins: v })}
                />
              </div>
            </div>
          </div>

          {/* Right: Backup List */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">{t("backup.history")}</h3>
                </div>
                <span className="text-xs text-gray-500">
                  {backups.length} {t("backup.items")}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <AnimatePresence>
                  {backups.map((backup) => (
                    <BackupCard
                      key={backup.id}
                      backup={backup}
                      onRestore={handleRestore}
                      onDelete={handleDeleteBackup}
                      onExport={handleExport}
                    />
                  ))}
                </AnimatePresence>
                {backups.length === 0 && (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">{t("backup.noBackups")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restore Modal */}
      <AnimatePresence>
        {showRestoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowRestoreModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl w-full max-w-lg mx-4 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{t("backup.restoreConfirm")}</h3>
                  <p className="text-xs text-gray-500">{t("backup.restoreWarning")}</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">{t("backup.restoreComponents")}</label>
                  <div className="space-y-2">
                    {["sessions", "workflows", "config", "knowledge-graph", "memories", "plugins"].map((comp) => (
                      <label key={comp} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={restoreComponents.includes(comp)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRestoreComponents((prev) => [...prev, comp]);
                            } else {
                              setRestoreComponents((prev) => prev.filter((c) => c !== comp));
                            }
                          }}
                          className="rounded border-[#2a2a2a] bg-[#222] text-indigo-500 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-300 capitalize">{comp}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">{t("backup.mergeStrategy")}</label>
                  <div className="flex gap-2">
                    {(["overwrite", "merge", "skip"] as const).map((strategy) => (
                      <button
                        key={strategy}
                        onClick={() => setMergeStrategy(strategy)}
                        className={cn(
                          "flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors capitalize",
                          mergeStrategy === strategy
                            ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                            : "border-[#2a2a2a] bg-[#222] text-gray-400 hover:border-[#3a3a3a]"
                        )}
                      >
                        {t(`backup.strategy.${strategy}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#2a2a2a] flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-colors"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={confirmRestore}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                >
                  {t("backup.confirmRestore")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
