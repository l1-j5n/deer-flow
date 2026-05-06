"use client";

import {
  BotIcon,
  PlusIcon,
  BarChart3Icon,
  XIcon,
  SearchIcon,
  UploadIcon,
  DownloadIcon,
  Loader2Icon,
  ArrowUpDownIcon,
  CheckSquareIcon,
  ArchiveIcon,
  FileArchiveIcon,
  Trash2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAgents, useDeleteAgentsBatch, useExportAgent, useImportAgent } from "@/core/agents";
import { exportAgent, importAgentFromFile, downloadBlob, exportAgentsBatch, importAgentsBatch, type AgentExportData, type BatchDeleteResponse, type BatchImportResponse } from "@/core/agents/api";
import { useI18n } from "@/core/i18n/hooks";

import { AgentCard } from "./agent-card";

type SortBy = "name-asc" | "name-desc" | "model-asc" | "model-desc" | "chats-asc" | "chats-desc" | "last-active-asc" | "last-active-desc";

const SORT_OPTIONS: { value: SortBy; i18nKey: string }[] = [
  { value: "name-asc", i18nKey: "agents.sortOptions.nameAsc" },
  { value: "name-desc", i18nKey: "agents.sortOptions.nameDesc" },
  { value: "model-asc", i18nKey: "agents.sortOptions.modelAsc" },
  { value: "model-desc", i18nKey: "agents.sortOptions.modelDesc" },
  { value: "chats-asc", i18nKey: "agents.sortOptions.chatsAsc" },
  { value: "chats-desc", i18nKey: "agents.sortOptions.chatsDesc" },
  { value: "last-active-asc", i18nKey: "agents.sortOptions.lastActiveAsc" },
  { value: "last-active-desc", i18nKey: "agents.sortOptions.lastActiveDesc" },
];

export function AgentGallery() {
  const { t } = useI18n();
  const { agents, isLoading } = useAgents();
  const router = useRouter();
  const [compareMode, setCompareMode] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("name-asc");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [batchImportDialogOpen, setBatchImportDialogOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [batchImportResult, setBatchImportResult] = useState<BatchImportResponse | null>(null);
  const [batchExporting, setBatchExporting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  const exportMutation = useExportAgent();
  const importMutation = useImportAgent();
  const deleteBatchMutation = useDeleteAgentsBatch();

  // Collect unique models from agents for filter chips
  const availableModels = useMemo(() => {
    const models = new Set<string>();
    agents.forEach((a) => {
      if (a.model) models.add(a.model);
    });
    return Array.from(models).sort();
  }, [agents]);

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    const filtered = agents.filter((agent) => {
      const q = searchQuery.toLowerCase();
      if (q && !agent.name.toLowerCase().includes(q) && !(agent.description ?? "").toLowerCase().includes(q)) {
        return false;
      }
      if (modelFilter && agent.model !== modelFilter) {
        return false;
      }
      return true;
    });
    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "model-asc":
          return (a.model ?? "").localeCompare(b.model ?? "");
        case "model-desc":
          return (b.model ?? "").localeCompare(a.model ?? "");
        case "chats-asc":
          return (b.total_chats ?? 0) - (a.total_chats ?? 0);
        case "chats-desc":
          return (a.total_chats ?? 0) - (b.total_chats ?? 0);
        case "last-active-asc":
          return new Date(b.last_active ?? 0).getTime() - new Date(a.last_active ?? 0).getTime();
        case "last-active-desc":
          return new Date(a.last_active ?? 0).getTime() - new Date(b.last_active ?? 0).getTime();
        default:
          return 0;
      }
    });
  }, [agents, searchQuery, modelFilter, sortBy]);

  const handleNewAgent = () => {
    router.push("/workspace/agents/new");
  };

  const toggleSelect = useCallback((name: string) => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else if (next.size < 4) {
        next.add(name);
      }
      return next;
    });
  }, []);

  const handleCompare = () => {
    if (selectedAgents.size >= 2) {
      const names = Array.from(selectedAgents).join(",");
      router.push(`/workspace/agents/compare?agents=${encodeURIComponent(names)}`);
    }
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setSelectedAgents(new Set());
  };

  const enterBatchMode = () => {
    setBatchMode(true);
    setCompareMode(false);
    setSelectedAgents(new Set());
  };

  const exitBatchMode = () => {
    setBatchMode(false);
    setSelectedAgents(new Set());
  };

  const toggleSelectAll = () => {
    setSelectedAgents((prev) => {
      if (prev.size === filteredAgents.length) {
        return new Set();
      }
      return new Set(filteredAgents.map((a) => a.name));
    });
  };

  const handleExport = async (name: string) => {
    try {
      await exportMutation.mutateAsync(name);
      toast.success(t("agents.exportSuccess"));
    } catch (err) {
      toast.error(t("agents.exportFailed") + ": " + (err instanceof Error ? err.message : ""));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedAgents.size === 0) return;
    setBatchDeleting(true);
    try {
      const result = await deleteBatchMutation.mutateAsync(Array.from(selectedAgents));
      if (result.failed === 0) {
        toast.success(t("agents.batchDeleteSuccess", { count: String(result.deleted) }));
      } else {
        toast.warning(
          t("agents.batchDeletePartial", {
            deleted: String(result.deleted),
            failed: String(result.failed),
          })
        );
      }
      setDeleteConfirmOpen(false);
      exitBatchMode();
    } catch (err) {
      toast.error(t("agents.batchDeleteFailed") + ": " + (err instanceof Error ? err.message : ""));
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleBatchExport = async () => {
    if (selectedAgents.size === 0) return;
    setBatchExporting(true);
    try {
      const blob = await exportAgentsBatch(Array.from(selectedAgents));
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      downloadBlob(blob, `deerflow-agents-${ts}.zip`);
      toast.success(t("agents.batchExportSuccess", { count: String(selectedAgents.size) }));
      exitBatchMode();
    } catch (err) {
      toast.error(t("agents.batchExportFailed") + ": " + (err instanceof Error ? err.message : ""));
    } finally {
      setBatchExporting(false);
    }
  };

  const handleBatchImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setBatchImportResult(null);
    try {
      const result = await importAgentsBatch(file, false);
      setBatchImportResult(result);
      if (result.failed === 0) {
        toast.success(
          t("agents.batchImportSuccess", {
            imported: String(result.imported),
            skipped: String(result.skipped),
          })
        );
      } else {
        toast.warning(
          t("agents.batchImportPartial", {
            imported: String(result.imported),
            failed: String(result.failed),
          })
        );
      }
      // Refresh list
      window.location.reload();
    } catch (err) {
      toast.error(t("agents.batchImportFailed") + ": " + (err instanceof Error ? err.message : ""));
    } finally {
      setImporting(false);
      if (batchFileInputRef.current) batchFileInputRef.current.value = "";
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const result = await importAgentFromFile(file, false);
      toast.success(
        result.created
          ? t("agents.importSuccess")
          : t("agents.importSuccess")
      );
      setImportDialogOpen(false);
      // Reset the input
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Refresh the list via React Query invalidation
      window.location.reload();
    } catch (err) {
      toast.error(t("agents.importFailed") + ": " + (err instanceof Error ? err.message : ""));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex size-full flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">{t("agents.title")}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {t("agents.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {batchMode ? (
            <>
              <span className="text-muted-foreground text-sm">
                {t("agents.batchSelectedCount", { count: String(selectedAgents.size), total: String(filteredAgents.length) })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={exitBatchMode}
              >
                <XIcon className="mr-1.5 h-4 w-4" />
                {t("agents.batchCancel")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={selectedAgents.size === 0}
              >
                <Trash2Icon className="mr-1.5 h-4 w-4" />
                {t("agents.batchDelete")}
              </Button>
              <Button
                size="sm"
                onClick={handleBatchExport}
                disabled={selectedAgents.size === 0 || batchExporting}
              >
                {batchExporting ? (
                  <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <DownloadIcon className="mr-1.5 h-4 w-4" />
                )}
                {t("agents.batchExport")}
              </Button>
            </>
          ) : compareMode ? (
            <>
              <span className="text-muted-foreground text-sm">
                {t("agents.selectedCount", { count: String(selectedAgents.size) })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={exitCompareMode}
              >
                <XIcon className="mr-1.5 h-4 w-4" />
                {t("agents.cancelCompare")}
              </Button>
              <Button
                size="sm"
                onClick={handleCompare}
                disabled={selectedAgents.size < 2}
              >
                <BarChart3Icon className="mr-1.5 h-4 w-4" />
                {t("agents.compareBtn")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setBatchImportDialogOpen(true)}>
                <FileArchiveIcon className="mr-1.5 h-4 w-4" />
                {t("agents.batchImport")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
                <UploadIcon className="mr-1.5 h-4 w-4" />
                {t("agents.importAgent")}
              </Button>
              <Button variant="outline" size="sm" onClick={enterBatchMode}>
                <CheckSquareIcon className="mr-1.5 h-4 w-4" />
                {t("agents.batchSelect")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCompareMode(true)}>
                <BarChart3Icon className="mr-1.5 h-4 w-4" />
                {t("agents.compareBtn")}
              </Button>
              <Button onClick={handleNewAgent}>
                <PlusIcon className="mr-1.5 h-4 w-4" />
                {t("agents.newAgent")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      {!isLoading && agents.length > 0 && (
        <div className="flex flex-col gap-3 border-b px-6 py-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              placeholder={t("agents.searchPlaceholder")}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDownIcon className="text-muted-foreground size-4 shrink-0" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {t(opt.i18nKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {availableModels.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground text-xs">Model:</span>
              <Badge
                variant={modelFilter === null ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setModelFilter(null)}
              >
                All
              </Badge>
              {availableModels.map((m) => (
                <Badge
                  key={m}
                  variant={modelFilter === m ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => setModelFilter(modelFilter === m ? null : m)}
                >
                  {m}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
            {t("common.loading")}
          </div>
        ) : agents.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full">
              <BotIcon className="text-muted-foreground h-7 w-7" />
            </div>
            <div>
              <p className="font-medium">{t("agents.emptyTitle")}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {t("agents.emptyDescription")}
              </p>
            </div>
            <Button variant="outline" className="mt-2" onClick={handleNewAgent}>
              <PlusIcon className="mr-1.5 h-4 w-4" />
              {t("agents.newAgent")}
            </Button>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <SearchIcon className="text-muted-foreground size-8" />
            <p className="text-muted-foreground text-sm">
              No agents match your search.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setModelFilter(null);
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            {/* Result count + batch select-all */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-muted-foreground text-xs">
                {filteredAgents.length} agent{filteredAgents.length !== 1 ? "s" : ""}
                {(searchQuery || modelFilter) && ` found`}
              </p>
              {batchMode && (
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
                  onClick={toggleSelectAll}
                >
                  <div
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                      selectedAgents.size === filteredAgents.length && filteredAgents.length > 0
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {selectedAgents.size === filteredAgents.length && filteredAgents.length > 0 && (
                      <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  {t("agents.batchSelectAll")}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.name}
                  agent={agent}
                  selectable={compareMode || batchMode}
                  selected={selectedAgents.has(agent.name)}
                  onSelectToggle={toggleSelect}
                  onExport={!compareMode && !batchMode ? () => handleExport(agent.name) : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("agents.importAgent")}</DialogTitle>
            <DialogDescription>
              {t("agents.importDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-muted-foreground/20 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-8">
              <UploadIcon className="text-muted-foreground size-8" />
              <p className="text-muted-foreground text-sm text-center">
                {t("agents.importDropHint")}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
                id="agent-import-file"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={importing}
                onClick={() => fileInputRef.current?.click()}
              >
                {importing ? (
                  <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <UploadIcon className="mr-1.5 h-4 w-4" />
                )}
                {importing ? t("agents.importing") : t("agents.importSelectFile")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Import Dialog */}
      <Dialog open={batchImportDialogOpen} onOpenChange={setBatchImportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("agents.batchImportTitle")}</DialogTitle>
            <DialogDescription>
              {t("agents.batchImportDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!batchImportResult ? (
              <div className="border-muted-foreground/20 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed p-8">
                <FileArchiveIcon className="text-muted-foreground size-10" />
                <p className="text-muted-foreground text-sm text-center">
                  {t("agents.batchImportDropHint")}
                </p>
                <input
                  ref={batchFileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleBatchImportFile}
                  id="agent-batch-import-file"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={importing}
                  onClick={() => batchFileInputRef.current?.click()}
                >
                  {importing ? (
                    <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <UploadIcon className="mr-1.5 h-4 w-4" />
                  )}
                  {importing ? t("agents.importing") : t("agents.batchImportSelectFile")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="default">{t("agents.batchImportTotal")}: {batchImportResult.total}</Badge>
                  <Badge variant="default" className="bg-emerald-500">{t("agents.batchImportImported")}: {batchImportResult.imported}</Badge>
                  <Badge variant="outline">{t("agents.batchImportSkipped")}: {batchImportResult.skipped}</Badge>
                  {batchImportResult.failed > 0 && (
                    <Badge variant="destructive">{t("agents.batchImportFailedLabel")}: {batchImportResult.failed}</Badge>
                  )}
                </div>
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2 text-xs">
                  {batchImportResult.results.map((r) => (
                    <div key={r.name} className="flex items-center gap-2 py-0.5">
                      {r.error ? (
                        <>
                          <span className="text-destructive">✗</span>
                          <span>{r.name}</span>
                          <span className="text-muted-foreground">— {r.error}</span>
                        </>
                      ) : r.created ? (
                        <>
                          <span className="text-emerald-500">+</span>
                          <span>{r.name}</span>
                          <span className="text-muted-foreground">({t("agents.created")})</span>
                        </>
                      ) : (
                        <>
                          <span className="text-muted-foreground">→</span>
                          <span>{r.name}</span>
                          <span className="text-muted-foreground">({t("agents.skipped")})</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setBatchImportResult(null);
                    setBatchImportDialogOpen(false);
                  }}
                >
                  {t("common.close")}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Delete Confirm */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("agents.batchDeleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("agents.batchDeleteDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2 text-sm">
            {Array.from(selectedAgents).map((name) => (
              <div key={name} className="text-muted-foreground flex items-center gap-2 py-0.5">
                <BotIcon className="size-3.5 shrink-0" />
                <span className="truncate">{name}</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={batchDeleting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              disabled={batchDeleting}
            >
              {batchDeleting ? (
                <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Trash2Icon className="mr-1.5 h-4 w-4" />
              )}
              {batchDeleting ? t("common.loading") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
