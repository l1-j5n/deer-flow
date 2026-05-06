"use client";

import {
  ActivityIcon,
  ArrowLeftIcon,
  BarChart3Icon,
  BotIcon,
  BrainCircuitIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  DiffIcon,
  Edit3Icon,
  FileTextIcon,
  GitBranchIcon,
  HistoryIcon,
  Loader2Icon,
  MessageSquareIcon,
  MessageSquarePlusIcon,
  PencilIcon,
  RotateCcwIcon,
  SaveIcon,
  SearchIcon,
  Settings2Icon,
  Share2Icon,
  TagIcon,
  Trash2Icon,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAgent,
  useAgentStats,
  useAgentStatus,
  useAgentTiming,
  useAgentVersion,
  useAgentVersionDiff,
  useAgentVersions,
  useDeleteAgent,
  useRestoreAgentVersion,
  useUpdateAgent,
  type AgentStatus as AgentStatusType,
} from "@/core/agents";
import { useI18n } from "@/core/i18n/hooks";
import { useAgentThreads } from "@/core/threads/hooks";
import { titleOfThread } from "@/core/threads/utils";
import { formatTimeAgo } from "@/core/utils/datetime";
import TimingHistoryChart from "@/components/workspace/agents/timing-chart";
import WeeklyActivityChart from "@/components/workspace/agents/weekly-activity-chart";
import TopToolsChart from "@/components/workspace/agents/top-tools-chart";
import ResponseTimePercentileChart from "@/components/workspace/agents/percentile-chart";
import { TimingDecompositionCard } from "@/components/workspace/agents/timing-decomposition-card";
import { ShareDialog } from "@/components/workspace/agents/share-dialog";

// ── Components ─────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && !loading && (
          <p className="text-muted-foreground text-xs">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, responseTimeMs, labels }: { status: AgentStatusType; responseTimeMs?: number | null; labels: { online: string; offline: string; busy: string; unknown: string } }) {
  const config: Record<
    AgentStatusType,
    { label: string; color: string; dot: string }
  > = {
    online: {
      label: labels.online,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      dot: "bg-emerald-500",
    },
    offline: {
      label: labels.offline,
      color: "bg-slate-500/10 text-slate-600 border-slate-500/20",
      dot: "bg-slate-400",
    },
    busy: {
      label: labels.busy,
      color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
      dot: "bg-amber-500",
    },
    unknown: {
      label: labels.unknown,
      color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
      dot: "bg-gray-400",
    },
  };

  const c = config[status] ?? config.unknown;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.color}`}
    >
      <span className={`relative flex size-2`}>
        <span
          className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${c.dot}`}
          style={{ display: status === "online" ? "inline-flex" : "none" }}
        />
        <span className={`relative inline-flex size-2 rounded-full ${c.dot}`} />
      </span>
      {c.label}
      {responseTimeMs !== null && responseTimeMs !== undefined && status === "online" && (
        <span className="text-muted-foreground ml-1 font-normal">
          · {responseTimeMs}ms
        </span>
      )}
    </span>
  );
}

function ChatHistoryItem({
  thread,
  onClick,
}: {
  thread: { thread_id: string; updated_at?: string; values?: { title?: string } };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col gap-1 rounded-lg border p-4 text-left transition-colors hover:bg-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium">{titleOfThread(thread as never)}</span>
        {thread.updated_at && (
          <span className="text-muted-foreground shrink-0 text-xs">
            {formatTimeAgo(thread.updated_at)}
          </span>
        )}
      </div>
      <span className="text-muted-foreground text-xs">
        ID: {thread.thread_id.slice(0, 12)}...
      </span>
    </button>
  );
}

function useFieldLabels(t: ReturnType<typeof useI18n>["t"]): Record<string, string> {
  return {
    description: t("agents.detail.fieldLabelDescription"),
    model: t("agents.detail.fieldLabelModel"),
    tool_groups: t("agents.detail.fieldLabelTools"),
    soul: t("agents.detail.fieldLabelSoul"),
  };
}

function VersionHistoryItem({
  version,
  agentName,
  currentAgent,
  onRestore,
  isRestoring,
  compareMode = false,
  selected = false,
  onToggleSelect,
}: {
  version: { version_id: string; timestamp: string; changed_fields: string[] };
  agentName: string;
  currentAgent: { description?: string | null; model?: string | null; tool_groups?: string[] | null; soul?: string | null } | null;
  onRestore: (versionId: string) => void;
  isRestoring: boolean;
  compareMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (versionId: string) => void;
}) {
  const { t } = useI18n();
  const fieldLabels = useFieldLabels(t);
  const [expanded, setExpanded] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const time = new Date(version.timestamp);
  const timeStr = time.toLocaleString();

  // Fetch version detail only when expanded
  const { version: versionDetail, isLoading: detailLoading } = useAgentVersion(
    expanded ? agentName : null,
    expanded ? version.version_id : null,
  );

  return (
    <>
      <div className={`flex flex-col gap-2 rounded-lg border p-4 transition-colors ${selected ? "border-primary bg-primary/5 ring-1 ring-primary/30" : compareMode ? "cursor-pointer hover:border-primary/30" : "cursor-pointer hover:border-primary/30"} ${expanded ? "border-primary/50 border-l-2 border-l-primary" : ""}`}>
        <div
          className="flex items-center justify-between gap-2"
          onClick={() => { if (compareMode) { onToggleSelect?.(version.version_id); } else { setExpanded(!expanded); } }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { if (compareMode) { onToggleSelect?.(version.version_id); } else { setExpanded(!expanded); } } }}
        >
          <div className="flex items-center gap-2">
            {compareMode && (
              <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                {selected && <span className="text-[10px] font-bold">✓</span>}
              </div>
            )}
            <GitBranchIcon className="text-muted-foreground size-4" />
            <span className="text-xs font-mono text-muted-foreground">
              {version.version_id}
            </span>
            <span className="text-muted-foreground text-xs">{timeStr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex flex-wrap gap-1.5">
              {version.changed_fields.map((field) => (
                <Badge key={field} variant="outline" className="text-[10px]">
                  {fieldLabels[field] ?? field}
                </Badge>
              ))}
            </div>
            {!compareMode && (expanded ? (
              <ChevronUpIcon className="size-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDownIcon className="size-4 text-muted-foreground shrink-0" />
            ))}
          </div>
        </div>

        {/* Expanded diff view */}
        {expanded && (
          <div className="mt-2 space-y-3 border-t pt-3">
            {detailLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : versionDetail ? (
              <>
                {/* Config diff */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                    {t("agents.detail.versionConfig")}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Old (version) */}
                    <div className="rounded-md bg-muted/50 p-2 space-y-1.5">
                      <span className="font-mono text-[10px] text-primary/60">{version.version_id}</span>
                      {versionDetail.config && Object.keys(versionDetail.config).length > 0 ? (
                        Object.entries(versionDetail.config).map(([key, value]) => (
                          <DiffFieldRow
                            key={key}
                            label={fieldLabels[key] ?? key}
                            oldValue={formatFieldValue(value)}
                            newValue={currentAgent ? formatFieldValue((currentAgent as Record<string, unknown>)[key]) : "—"}
                          />
                        ))
                      ) : (
                        <span className="text-muted-foreground italic">{t("agents.detail.diffNoChanges")}</span>
                      )}
                    </div>
                    {/* New (current) */}
                    <div className="rounded-md bg-muted/50 p-2 space-y-1.5">
                      <span className="font-mono text-[10px] text-primary">{t("agents.detail.versionCurrent")}</span>
                      {currentAgent ? (
                        ["description", "model", "tool_groups", "soul"].map((key) => {
                          const val = (currentAgent as Record<string, unknown>)[key];
                          if (val === undefined || val === null) return null;
                          return (
                            <DiffFieldRow
                              key={key}
                              label={fieldLabels[key] ?? key}
                              oldValue={versionDetail.config?.[key] !== undefined ? formatFieldValue(versionDetail.config[key]) : "—"}
                              newValue={formatFieldValue(val)}
                            />
                          );
                        })
                      ) : (
                        <span className="text-muted-foreground italic">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SOUL diff */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">
                    {t("agents.detail.versionSoul")}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="font-mono text-[10px] text-muted-foreground mb-1">
                        {version.version_id}
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px] leading-relaxed max-h-32 overflow-y-auto">
                        {versionDetail.soul || (
                          <span className="text-muted-foreground italic">{t("agents.detail.noPersonality")}</span>
                        )}
                      </pre>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="font-mono text-[10px] text-primary mb-1">
                        {t("agents.detail.versionCurrent")}
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px] leading-relaxed max-h-32 overflow-y-auto">
                        {currentAgent?.soul || (
                          <span className="text-muted-foreground italic">{t("agents.detail.noPersonality")}</span>
                        )}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Restore button */}
                <div className="flex justify-end pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setRestoreOpen(true); }}
                    disabled={isRestoring}
                  >
                    <RotateCcwIcon className="size-3.5 mr-1.5" />
                    {t("agents.detail.restore")}
                  </Button>
                </div>
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                {t("agents.detail.restoreFailed")}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Restore confirmation dialog */}
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcwIcon className="size-5 text-primary" />
              {t("agents.detail.restoreTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("agents.detail.restoreDescription", { versionId: version.version_id })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreOpen(false)}>
              {t("agents.detail.restoreCancel")}
            </Button>
            <Button
              onClick={() => {
                setRestoreOpen(false);
                onRestore(version.version_id);
              }}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>
                  <Loader2Icon className="size-4 mr-1.5 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                t("agents.detail.restoreConfirm")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Format a config value for display in diff view */
function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value || "(empty)";
  return String(value);
}

/** Single diff field row showing old vs new value with highlighting */
function DiffFieldRow({
  label,
  oldValue,
  newValue,
}: {
  label: string;
  oldValue: string;
  newValue: string;
}) {
  const changed = oldValue !== newValue && oldValue !== "—" && newValue !== "—";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      <span className={changed ? "text-primary font-medium" : ""}>
        {newValue}
      </span>
    </div>
  );
}

function _formatTimeAgo(iso: string | null, labels: { never: string; justNow: string; minutesAgo: string; hoursAgo: string; daysAgo: string }): string {
  if (!iso) return labels.never;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return labels.justNow;
  if (mins < 60) return labels.minutesAgo.replace("{mins}", String(mins));
  const hours = Math.floor(mins / 60);
  if (hours < 24) return labels.hoursAgo.replace("{hours}", String(hours));
  const days = Math.floor(hours / 24);
  return labels.daysAgo.replace("{days}", String(days));
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AgentDetailPage() {
  const { t } = useI18n();
  const fieldLabels = useFieldLabels(t);
  const router = useRouter();
  const { agent_name } = useParams<{ agent_name: string }>();

  const { agent, isLoading: agentLoading } = useAgent(agent_name);
  const { stats, isLoading: statsLoading } = useAgentStats(agent_name);
  const { timing, isLoading: timingLoading } = useAgentTiming(agent_name);
  const { statusData, isLoading: statusLoading } = useAgentStatus(agent_name);
  const { threads, isLoading: threadsLoading } = useAgentThreads(agent_name);
  const { versions, isLoading: versionsLoading } = useAgentVersions(agent_name);
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();
  const restoreVersion = useRestoreAgentVersion();

  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editSoul, setEditSoul] = useState("");
  const [editToolGroups, setEditToolGroups] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [threadSearch, setThreadSearch] = useState("");

  // Version compare state
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  const { diff: versionDiff, isLoading: diffLoading } = useAgentVersionDiff(
    compareDialogOpen ? agent_name : null,
    selectedVersions.length === 2 ? selectedVersions[0] : null,
    selectedVersions.length === 2 ? selectedVersions[1] : null,
  );

  useEffect(() => {
    if (agent) {
      setEditDescription(agent.description ?? "");
      setEditModel(agent.model ?? "");
      setEditSoul(agent.soul ?? "");
      setEditToolGroups(agent.tool_groups?.join(", ") ?? "");
    }
  }, [agent]);

  const handleSave = useCallback(async () => {
    if (!agent) return;
    try {
      await updateAgent.mutateAsync({
        name: agent.name,
        request: {
          description: editDescription || null,
          model: editModel || null,
          soul: editSoul || null,
          tool_groups: editToolGroups
            ? editToolGroups.split(",").map((s) => s.trim()).filter(Boolean)
            : null,
        },
      });
      toast.success(t("agents.detail.updateSuccess"));
      setIsEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("agents.detail.updateFailed"));
    }
  }, [agent, editDescription, editModel, editSoul, editToolGroups, updateAgent]);

  const handleDelete = useCallback(async () => {
    if (!agent) return;
    try {
      await deleteAgent.mutateAsync(agent.name);
      toast.success(t("agents.detail.deleteSuccessToast"));
      router.push("/workspace/agents");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("agents.detail.deleteFailedToast"));
    }
  }, [agent, deleteAgent, router]);

  const handleStartChat = useCallback(() => {
    router.push(`/workspace/agents/${agent_name}/chats/new`);
  }, [router, agent_name]);

  const handleResumeChat = useCallback(
    (threadId: string) => {
      router.push(`/workspace/chats/${threadId}`);
    },
    [router],
  );

  const filteredThreads = useMemo(() => {
    if (!threadSearch.trim()) return threads;
    const q = threadSearch.toLowerCase();
    return threads.filter((t) =>
      titleOfThread(t).toLowerCase().includes(q),
    );
  }, [threads, threadSearch]);

  const isLoading = agentLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto max-w-5xl p-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BotIcon className="text-muted-foreground mb-4 size-16" />
          <h2 className="text-xl font-semibold">{t("agents.detail.notFound")}</h2>
          <p className="text-muted-foreground mt-2">
            {t("agents.detail.notFoundDesc", { name: agent_name })}
          </p>
          <Button
            className="mt-6"
            variant="outline"
            onClick={() => router.push("/workspace/agents")}
          >
            <ArrowLeftIcon className="mr-2 size-4" />
            {t("agents.detail.backToAgents")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/workspace/agents")}
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-xl">
              <BotIcon className="text-primary size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                {!statusLoading && (
                  <StatusBadge
                    status={statusData.status}
                    responseTimeMs={statusData.responseTimeMs}
                    labels={t.agents.detail}
                  />
                )}
              </div>
              <div className="mt-1 flex items-center gap-2">
                {agent.model && (
                  <Badge variant="secondary" className="text-xs">
                    <BrainCircuitIcon className="mr-1 size-3" />
                    {agent.model}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  <ClockIcon className="mr-1 size-3" />
                  {_formatTimeAgo(stats?.last_active ?? null, t.agents.detail)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <XIcon className="mr-1.5 size-4" />
                {t("agents.detail.cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateAgent.isPending}
              >
                {updateAgent.isPending ? (
                  <Loader2Icon className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <SaveIcon className="mr-1.5 size-4" />
                )}
                {t("agents.detail.save")}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleStartChat}>
                <MessageSquarePlusIcon className="mr-1.5 size-4" />
                {t("agents.detail.newChat")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <PencilIcon className="mr-1.5 size-4" />
                {t("agents.detail.edit")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareOpen(true)}
              >
                <Share2Icon className="mr-1.5 size-4" />
                {t("common.share")}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("agents.detail.totalChats")}
          value={stats?.total_chats ?? "--"}
          icon={MessageSquareIcon}
          loading={statsLoading}
        />
        <StatCard
          title={t("agents.detail.messages")}
          value={stats?.total_messages ?? "--"}
          icon={FileTextIcon}
          loading={statsLoading}
        />
        <StatCard
          title={t("agents.detail.toolCalls")}
          value={stats?.tool_calls ?? "--"}
          icon={WrenchIcon}
          loading={statsLoading}
        />
        <StatCard
          title={t("agents.detail.avgResponse")}
          value={stats ? `${stats.avg_response_time}s` : "--"}
          icon={ClockIcon}
          description={
            stats && stats.p50_response_time != null
              ? `p50:${stats.p50_response_time}s p95:${stats.p95_response_time ?? "--"}s p99:${stats.p99_response_time ?? "--"}s`
              : t("agents.detail.avgResponseDesc")
          }
          loading={statsLoading}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <Settings2Icon className="mr-1.5 size-4" />
            {t("agents.detail.overview")}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3Icon className="mr-1.5 size-4" />
            {t("agents.detail.analytics")}
          </TabsTrigger>
          <TabsTrigger value="history">
            <HistoryIcon className="mr-1.5 size-4" />
            {t("agents.detail.chatHistory")}
            {threads.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                {threads.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="versions">
            <GitBranchIcon className="mr-1.5 size-4" />
            {t("agents.detail.versions")}
            {versions && versions.count > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                {versions.count}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="size-5" />
                {t("agents.detail.description")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder={t("agents.detail.descriptionPlaceholder")}
                  rows={4}
                />
              ) : (
                <p className="text-muted-foreground">
                  {agent.description || t("agents.detail.noDescription")}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuitIcon className="size-5" />
                  {t("agents.detail.model")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    placeholder={t("agents.detail.modelPlaceholder")}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    {agent.model || t("agents.detail.defaultModel")}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WrenchIcon className="size-5" />
                  {t("agents.detail.toolGroups")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Input
                    value={editToolGroups}
                    onChange={(e) => setEditToolGroups(e.target.value)}
                    placeholder={t("agents.detail.toolGroupsPlaceholder")}
                  />
                ) : agent.tool_groups && agent.tool_groups.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {agent.tool_groups.map((group) => (
                      <Badge key={group} variant="outline">
                        {group}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{t("agents.detail.noToolGroups")}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TagIcon className="size-5" />
                {t("agents.detail.soul")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editSoul}
                  onChange={(e) => setEditSoul(e.target.value)}
                  placeholder={t("agents.detail.soulPlaceholder")}
                  rows={3}
                />
              ) : (
                <p className="text-muted-foreground">
                  {agent.soul || t("agents.detail.noPersonality")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="size-5" />
                  {t("agents.detail.weeklyActivity")}
                </CardTitle>
                <CardDescription>{t("agents.detail.messagesPerDay")}</CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyActivityChart
                  data={stats?.weekly_activity ?? []}
                  loading={statsLoading}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WrenchIcon className="size-5" />
                  {t("agents.detail.topTools")}
                </CardTitle>
                <CardDescription>{t("agents.detail.mostUsedTools")}</CardDescription>
              </CardHeader>
              <CardContent>
                <TopToolsChart
                  tools={stats?.top_tools ?? []}
                  loading={statsLoading}
                />
              </CardContent>
            </Card>
          </div>

          {/* Response Time Percentiles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="size-5" />
                {t("agents.detail.responseTimePercentiles")}
              </CardTitle>
              <CardDescription>
                {t("agents.detail.responseTimePercentilesDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponseTimePercentileChart
                data={
                  stats
                    ? {
                        p50_response_time: stats.p50_response_time ?? null,
                        p95_response_time: stats.p95_response_time ?? null,
                        p99_response_time: stats.p99_response_time ?? null,
                      }
                    : null
                }
                loading={statsLoading}
                labels={{
                  p50: "p50",
                  p95: "p95",
                  p99: "p99",
                  noData: t("agents.detail.responseTimePercentilesNoData"),
                  noDataHint: t("agents.detail.responseTimePercentilesNoDataHint"),
                }}
              />
            </CardContent>
          </Card>

          {/* LangGraph vs Gateway Timing Decomposition */}
          <TimingDecompositionCard
            data={
              stats
                ? {
                    avg_response_time: stats.avg_response_time,
                    langgraph_avg_response_time:
                      stats.langgraph_avg_response_time,
                    gateway_overhead_ms: stats.gateway_overhead_ms,
                  }
                : undefined
            }
            loading={statsLoading}
            labels={{
              title: t("agents.detail.timingDecomposition"),
              description: t("agents.detail.timingDecompositionDesc"),
              gatewayLabel: t("agents.detail.gatewayHttpLabel"),
              langgraphLabel: t("agents.detail.langgraphProcLabel"),
              overheadLabel: t("agents.detail.gatewayOverheadLabel"),
              noData: t("agents.detail.timingDecompositionNoData"),
              noDataHint: t("agents.detail.timingDecompositionNoDataHint"),
            }}
          />

          {/* Response Time History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivityIcon className="size-5" />
                {t("agents.detail.responseTimeHistory")}
              </CardTitle>
              <CardDescription>
                {t("agents.detail.responseTimeHistoryDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TimingHistoryChart data={timing} loading={timingLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HistoryIcon className="size-5" />
                    {t("agents.detail.chatHistory")}
                  </CardTitle>
                  <CardDescription>
                    {threads.length === 1
                      ? t("agents.detail.conversationOne")
                      : t("agents.detail.conversationsCount", { count: String(threads.length) })}
                  </CardDescription>
                </div>
                <div className="relative">
                  <SearchIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                  <Input
                    placeholder={t("agents.detail.searchConversations")}
                    className="pl-9"
                    value={threadSearch}
                    onChange={(e) => setThreadSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {threadsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredThreads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquareIcon className="text-muted-foreground mb-3 size-10" />
                  <p className="text-muted-foreground text-sm">
                    {threadSearch.trim()
                      ? t("agents.detail.noMatchingConversations")
                      : t("agents.detail.noConversations")}
                  </p>
                  {!threadSearch.trim() && (
                    <Button
                      className="mt-4"
                      size="sm"
                      onClick={handleStartChat}
                    >
                      <MessageSquarePlusIcon className="mr-1.5 size-4" />
                      {t("agents.detail.startChat")}
                    </Button>
                  )}
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredThreads.map((thread) => (
                      <ChatHistoryItem
                        key={thread.thread_id}
                        thread={thread}
                        onClick={() => handleResumeChat(thread.thread_id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Version History Tab */}
        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranchIcon className="size-5" />
                    {t("agents.detail.versionHistory")}
                  </CardTitle>
                  <CardDescription>
                    {t("agents.detail.versionHistoryDescription")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {compareMode && (
                    <Button
                      variant="default"
                      size="sm"
                      disabled={selectedVersions.length !== 2}
                      onClick={() => setCompareDialogOpen(true)}
                    >
                      <DiffIcon className="size-3.5 mr-1.5" />
                      {t("agents.detail.versionCompareTitle", { count: String(selectedVersions.length) })}
                    </Button>
                  )}
                  <Button
                    variant={compareMode ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => { setCompareMode(!compareMode); setSelectedVersions([]); }}
                  >
                    <DiffIcon className="size-3.5 mr-1.5" />
                    {compareMode ? t("agents.detail.cancel") : t("agents.detail.versionCompareBtn")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {versionsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !versions || versions.count === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GitBranchIcon className="mx-auto size-8 mb-3 opacity-30" />
                  <p className="font-medium">{t("agents.detail.noVersions")}</p>
                  <p className="text-xs mt-1">{t("agents.detail.noVersionsHint")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.versions.map((v) => (
                    <VersionHistoryItem
                      key={v.version_id}
                      version={v}
                      agentName={agent_name}
                      currentAgent={agent}
                      isRestoring={restoreVersion.isPending}
                      compareMode={compareMode}
                      selected={selectedVersions.includes(v.version_id)}
                      onToggleSelect={(versionId: string) => {
                        setSelectedVersions((prev: string[]) => {
                          if (prev.includes(versionId)) {
                            return prev.filter((id) => id !== versionId);
                          }
                          if (prev.length >= 2) {
                            return [prev[1]!, versionId];
                          }
                          return [...prev, versionId];
                        });
                      }}
                      onRestore={(versionId) => {
                        restoreVersion.mutate(
                          { name: agent_name, versionId },
                          {
                            onSuccess: (data) => {
                              toast.success(
                                t("agents.detail.restoreSuccess", { versionId: data.restored_version_id }),
                              );
                            },
                            onError: () => {
                              toast.error(t("agents.detail.restoreFailed"));
                            },
                          },
                        );
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <ShareDialog
        agentName={agent.name}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />

      {/* Version Diff Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DiffIcon className="size-5 text-primary" />
              {t("agents.detail.versionDiffTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("agents.detail.versionDiffDescription", { from: selectedVersions[0] || "", to: selectedVersions[1] || "" })}
            </DialogDescription>
          </DialogHeader>
          {diffLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : versionDiff ? (
            <div className="space-y-4 py-2">
              {/* Soul changed indicator */}
              {versionDiff.soul_changed && (
                <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-3 text-sm">
                  <span className="font-semibold text-amber-600">SOUL</span>
                  {" "}{t("agents.detail.versionDiffSoulModified")}
                </div>
              )}

              {/* Config fields changed */}
              {versionDiff.fields_changed.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-muted-foreground">Changed fields:</span>
                  {versionDiff.fields_changed.map((field) => (
                    <Badge key={field} variant="secondary" className="text-[10px]">
                      {fieldLabels[field] ?? field}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Side-by-side config diff */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">{t("agents.detail.versionDiffConfig")}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {/* From (older) */}
                  <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                    <div className="text-xs font-mono text-muted-foreground">
                      {versionDiff.from_version.version_id}
                    </div>
                    {versionDiff.from_version.config && Object.keys(versionDiff.from_version.config).length > 0 ? (
                      Object.entries(versionDiff.from_version.config).map(([key, value]) => {
                        const changed = versionDiff.config_diff[key] !== undefined;
                        return (
                          <div key={key} className={`text-xs ${changed ? "text-orange-600" : ""}`}>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {fieldLabels[key] ?? key}:{" "}
                            </span>
                            {formatFieldValue(value)}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground italic">{t("agents.detail.versionDiffNoConfig")}</span>
                    )}
                  </div>

                  {/* To (newer) */}
                  <div className="rounded-md border bg-primary/5 p-3 space-y-2">
                    <div className="text-xs font-mono text-primary">
                      {versionDiff.to_version.version_id}
                    </div>
                    {versionDiff.to_version.config && Object.keys(versionDiff.to_version.config).length > 0 ? (
                      Object.entries(versionDiff.to_version.config).map(([key, value]) => {
                        const changed = versionDiff.config_diff[key] !== undefined;
                        return (
                          <div key={key} className={`text-xs ${changed ? "text-emerald-600 font-medium" : ""}`}>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {fieldLabels[key] ?? key}:{" "}
                            </span>
                            {formatFieldValue(value)}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground italic">{t("agents.detail.versionDiffNoConfig")}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Soul diff */}
              {(versionDiff.from_version.soul || versionDiff.to_version.soul) && (
                <div>
                  <h4 className={`text-xs font-semibold mb-2 ${versionDiff.soul_changed ? "text-amber-600" : "text-muted-foreground"}`}>
                    SOUL {versionDiff.soul_changed ? t("agents.detail.versionDiffModified") : t("agents.detail.versionDiffUnchanged")}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border bg-muted/30 p-3">
                      <div className="text-[10px] text-muted-foreground mb-1 font-mono">
                        {versionDiff.from_version.version_id}
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px] leading-relaxed max-h-40 overflow-y-auto">
                        {versionDiff.from_version.soul || (
                          <span className="text-muted-foreground italic">{t("agents.detail.versionDiffNoSoul")}</span>
                        )}
                      </pre>
                    </div>
                    <div className="rounded-md border bg-primary/5 p-3">
                      <div className="text-[10px] text-primary mb-1 font-mono">
                        {versionDiff.to_version.version_id}
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px] leading-relaxed max-h-40 overflow-y-auto">
                        {versionDiff.to_version.soul || (
                          <span className="text-muted-foreground italic">{t("agents.detail.versionDiffNoSoul")}</span>
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {versionDiff.fields_changed.length === 0 && !versionDiff.soul_changed && (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  <DiffIcon className="mx-auto size-6 mb-2 opacity-30" />
                  {t("agents.detail.versionDiffIdentical")}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground text-sm">
              {t("agents.detail.versionDiffFailed")}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareDialogOpen(false)}>
              {t("agents.detail.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog — shadcn Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2Icon className="size-5" />
              {t("agents.detail.deleteTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("agents.detail.deleteDescription", { name: agent.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteAgent.isPending}
            >
              {t("agents.detail.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAgent.isPending}
            >
              {deleteAgent.isPending ? (
                <Loader2Icon className="mr-1.5 size-4 animate-spin" />
              ) : (
                <Trash2Icon className="mr-1.5 size-4" />
              )}
              {t("agents.detail.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
