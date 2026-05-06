"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayersIcon,
  PlusIcon,
  Trash2Icon,
  MessageSquareIcon,
  BrainIcon,
  Minimize2Icon,
  FileTextIcon,
  GitBranchIcon,
  PencilIcon,
  SearchIcon,
  ClockIcon,
  AlertCircleIcon,
  Loader2Icon,
  RefreshCwIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  SaveIcon,
  XIcon,
  Link2Icon,
  HashIcon,
} from "lucide-react";
import {
  useAgentContextSessions,
  useAgentContextStats,
} from "@/core/electron-api/hooks";
import { useI18n } from "@/core/i18n/hooks";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

interface SessionData {
  id: string;
  name: string;
  messages: MessageData[];
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
  totalTokens: number;
  maxTokens: number;
  metadata: {
    model: string;
    temperature: number;
    tags: string[];
    parentSessionId?: string;
  };
}

interface MessageData {
  id: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  timestamp: string;
  tokens?: number;
  metadata?: {
    toolName?: string;
    importance?: number;
  };
}

interface SummaryData {
  sessionId: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  generatedAt: string;
  messageCount: number;
  originalTokens: number;
  summaryTokens: number;
}

interface StatsData {
  totalSessions: number;
  totalMessages: number;
  totalTokens: number;
  totalSummaries: number;
  averageMessagesPerSession: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  system: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  assistant: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  tool: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
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
      </CardContent>
    </Card>
  );
}

// ── Create Session Dialog ──────────────────────────────────────────────────

function CreateSessionDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const result = await window.electronAPI?.agentContext?.createSession(name.trim());
      if (result) {
        toast.success(t("agentContext.create.success"));
        onClose();
        setName("");
      } else {
        toast.error(t("agentContext.create.failure"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("agentContext.create.creationFailed"));
    } finally {
      setCreating(false);
    }
  }, [name, onClose, t]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("agentContext.create.title")}</DialogTitle>
          <DialogDescription>
            {t("agentContext.create.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder={t("agentContext.create.placeholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || creating}>
            {creating ? (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            ) : (
              <PlusIcon className="mr-2 size-4" />
            )}
            {t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Rename Dialog ──────────────────────────────────────────────────────────

function RenameDialog({
  open,
  sessionId,
  currentName,
  onClose,
}: {
  open: boolean;
  sessionId: string;
  currentName: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleRename = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await window.electronAPI?.agentContext?.renameSession(sessionId, name.trim());
      toast.success(t("agentContext.rename.success"));
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("agentContext.rename.failure"));
    } finally {
      setSaving(false);
    }
  }, [name, sessionId, onClose, t]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("agentContext.rename.title")}</DialogTitle>
        </DialogHeader>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRename()}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button onClick={handleRename} disabled={saving || !name.trim()}>
            {saving ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── System Prompt Dialog ──────────────────────────────────────────────────

function SystemPromptDialog({
  open,
  sessionId,
  currentPrompt,
  onClose,
}: {
  open: boolean;
  sessionId: string;
  currentPrompt: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [prompt, setPrompt] = useState(currentPrompt);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPrompt(currentPrompt);
  }, [currentPrompt]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await window.electronAPI?.agentContext?.updateSystemPrompt(sessionId, prompt);
      toast.success(t("agentContext.systemPrompt.success"));
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("agentContext.systemPrompt.failure"));
    } finally {
      setSaving(false);
    }
  }, [prompt, sessionId, onClose, t]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("agentContext.systemPrompt.title")}</DialogTitle>
          <DialogDescription>
            {t("agentContext.systemPrompt.description")}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder={t("agentContext.systemPrompt.placeholder")}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : <SaveIcon className="mr-2 size-4" />}
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Compress Dialog ──────────────────────────────────────────────────────

function CompressDialog({
  open,
  sessionId,
  onClose,
  session,
}: {
  open: boolean;
  sessionId: string;
  onClose: () => void;
  session: SessionData | null;
}) {
  const { t } = useI18n();
  const [compressing, setCompressing] = useState(false);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const tokenUsage = session
    ? Math.round((session.totalTokens / session.maxTokens) * 100)
    : 0;

  const handleCompress = useCallback(async () => {
    setCompressing(true);
    try {
      const result = (await window.electronAPI?.agentContext?.compressSession(sessionId)) as SummaryData | undefined;
      if (result) {
        setSummary(result);
        toast.success(t("agentContext.compress.success"));
      } else {
        toast.error(t("agentContext.compress.failure"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("agentContext.compress.failure"));
    } finally {
      setCompressing(false);
    }
  }, [sessionId, t]);

  useEffect(() => {
    if (open) {
      window.electronAPI?.agentContext
        ?.getSummary(sessionId)
        .then((s) => setSummary(s as SummaryData))
        .catch(() => setSummary(null));
    }
  }, [open, sessionId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("agentContext.compress.title")}</DialogTitle>
          <DialogDescription>
            {t("agentContext.compress.description")}
          </DialogDescription>
        </DialogHeader>

        {session && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>{t("agentContext.compress.tokenUsage")}</span>
              <span className="font-medium">
                {formatTokens(session.totalTokens)} / {formatTokens(session.maxTokens)}
              </span>
            </div>
            <Progress value={tokenUsage} className="h-2" />
            <p className="text-muted-foreground text-xs">
              {t("agentContext.compress.messageCount", {count: String(session.messages.length)})}
            </p>
          </div>
        )}

        {summary && (
          <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
            <p className="font-medium text-sm">{t("agentContext.compress.currentSummary")}</p>
            <p className="text-xs text-muted-foreground">{summary.summary}</p>
            {summary.keyPoints.length > 0 && (
              <div>
                <p className="text-xs font-medium mt-2">{t("agentContext.compress.keyPoints")}</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground">
                  {summary.keyPoints.map((kp, i) => (
                    <li key={i}>{kp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleCompress}
          disabled={compressing || !session}
          className="w-full"
        >
          {compressing ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : (
            <Minimize2Icon className="mr-2 size-4" />
          )}
          {t("agentContext.compress.compressNow")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ── Inherit Context Dialog ─────────────────────────────────────────────────

function InheritDialog({
  open,
  sessionId,
  allSessions,
  onClose,
}: {
  open: boolean;
  sessionId: string;
  allSessions: SessionData[];
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [targetId, setTargetId] = useState("");
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeKeyPoints, setIncludeKeyPoints] = useState(true);
  const [includeActionItems, setIncludeActionItems] = useState(true);
  const [inheriting, setInheriting] = useState(false);

  const targets = allSessions.filter((s) => s.id !== sessionId);

  const handleInherit = useCallback(async () => {
    if (!targetId) return;
    setInheriting(true);
    try {
      await window.electronAPI?.agentContext?.inheritContext(sessionId, targetId, {
        includeSummary,
        includeKeyPoints,
        includeActionItems,
      });
      toast.success(t("agentContext.inherit.success"));
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("agentContext.inherit.failure"));
    } finally {
      setInheriting(false);
    }
  }, [sessionId, targetId, includeSummary, includeKeyPoints, includeActionItems, onClose, t]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("agentContext.inherit.title")}</DialogTitle>
          <DialogDescription>
            {t("agentContext.inherit.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t("agentContext.inherit.targetSession")}</label>
            {targets.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t("agentContext.inherit.noSessionsAvailable")}</p>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {targets.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setTargetId(s.id)}
                    className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${targetId === s.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted border border-transparent"}`}
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      {t("agentContext.inherit.messageCount", {count: String(s.messages.length)})}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeSummary}
                onChange={(e) => setIncludeSummary(e.target.checked)}
                className="rounded"
              />
              {t("agentContext.inherit.includeSummary")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeKeyPoints}
                onChange={(e) => setIncludeKeyPoints(e.target.checked)}
                className="rounded"
              />
              {t("agentContext.inherit.includeKeyPoints")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeActionItems}
                onChange={(e) => setIncludeActionItems(e.target.checked)}
                className="rounded"
              />
              {t("agentContext.inherit.includeActionItems")}
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button onClick={handleInherit} disabled={!targetId || inheriting}>
            {inheriting ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : <GitBranchIcon className="mr-2 size-4" />}
            {t("agentContext.inherit.inherit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Build Context Preview ─────────────────────────────────────────────────

function BuildContextDialog({
  open,
  sessionId,
  onClose,
}: {
  open: boolean;
  sessionId: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [context, setContext] = useState<{
    messages: Array<{ role: string; content: string }>;
    systemPrompt: string;
    totalTokens: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && sessionId) {
      setLoading(true);
      window.electronAPI?.agentContext
        ?.buildContextForLLM(sessionId)
        .then((c) => setContext(c as typeof context))
        .catch(() => setContext(null))
        .finally(() => setLoading(false));
    }
  }, [open, sessionId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t("agentContext.buildContext.title")}</DialogTitle>
          <DialogDescription>
            {t("agentContext.buildContext.description")}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : context ? (
          <div className="space-y-4 overflow-y-auto max-h-[50vh]">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{t("agentContext.buildContext.tokenCount", {count: formatTokens(context.totalTokens)})}</Badge>
              <Badge variant="outline">{t("agentContext.buildContext.messageCount", {count: String(context.messages.length)})}</Badge>
            </div>
            {context.systemPrompt && (
              <div className="border rounded-lg p-3">
                <p className="text-xs font-medium mb-1 text-muted-foreground">{t("agentContext.buildContext.systemPrompt")}</p>
                <pre className="text-xs whitespace-pre-wrap">{context.systemPrompt}</pre>
              </div>
            )}
            <div className="space-y-2">
              {context.messages.map((msg, i) => (
                <div key={i} className="border rounded-lg p-3">
                  <Badge className={`mb-1 text-[10px] ${ROLE_COLORS[msg.role] ?? ""}`}>
                    {msg.role}
                  </Badge>
                  <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                    {msg.content.length > 200 ? msg.content.slice(0, 200) + "..." : msg.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">{t("agentContext.buildContext.noData")}</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Session Detail ────────────────────────────────────────────────────────

function SessionDetail({
  session,
  allSessions,
  onBack,
  onRename,
  onDelete,
  onSystemPrompt,
  onCompress,
  onInherit,
  onBuildContext,
}: {
  session: SessionData;
  allSessions: SessionData[];
  onBack: () => void;
  onRename: () => void;
  onDelete: () => void;
  onSystemPrompt: () => void;
  onCompress: () => void;
  onInherit: () => void;
  onBuildContext: () => void;
}) {
  const { t } = useI18n();
  const [searchMsg, setSearchMsg] = useState("");
  const tokenUsage = Math.round((session.totalTokens / session.maxTokens) * 100);

  const filteredMessages = useMemo(() => {
    if (!searchMsg.trim()) return session.messages;
    const q = searchMsg.toLowerCase();
    return session.messages.filter((m) => m.content.toLowerCase().includes(q));
  }, [session.messages, searchMsg]);

  return (
    <div className="space-y-4">
      {/* Session Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeftIcon className="size-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <LayersIcon className="size-5" />
              {session.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <HashIcon className="mr-1 size-3" />
                {session.id.slice(0, 12)}...
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <ClockIcon className="mr-1 size-3" />
                {formatDate(session.updatedAt)}
              </Badge>
              {session.metadata.parentSessionId && (
                <Badge variant="outline" className="text-xs">
                  <Link2Icon className="mr-1 size-3" />
                  {t("agentContext.detail.inherited")}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onBuildContext}>
            <FileTextIcon className="mr-1.5 size-4" />
            {t("agentContext.detail.preview")}
          </Button>
          <Button variant="outline" size="sm" onClick={onSystemPrompt}>
            <PencilIcon className="mr-1.5 size-4" />
            {t("agentContext.detail.prompt")}
          </Button>
          <Button variant="outline" size="sm" onClick={onCompress}>
            <Minimize2Icon className="mr-1.5 size-4" />
            {t("agentContext.detail.compress")}
          </Button>
          <Button variant="outline" size="sm" onClick={onInherit}>
            <GitBranchIcon className="mr-1.5 size-4" />
            {t("agentContext.detail.inherit")}
          </Button>
          <Button variant="outline" size="sm" onClick={onRename}>
            <PencilIcon className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}>
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Token Usage */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{t("agentContext.detail.tokenUsage")}</CardTitle>
            <span className="text-sm font-medium">
              {formatTokens(session.totalTokens)} / {formatTokens(session.maxTokens)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress
            value={tokenUsage > 100 ? 100 : tokenUsage}
            className={`h-2 ${tokenUsage > 90 ? "[&>div]:bg-red-500" : tokenUsage > 75 ? "[&>div]:bg-amber-500" : ""}`}
          />
          <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
            <span>{t("agentContext.detail.messageCount", {count: String(session.messages.length)})}</span>
            <span>
              {tokenUsage > 90 ? t("agentContext.detail.critical") : tokenUsage > 75 ? t("agentContext.detail.warning") : t("agentContext.detail.healthy")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquareIcon className="size-5" />
              {t("agentContext.detail.messages")}
              <Badge variant="secondary" className="text-xs">{filteredMessages.length}</Badge>
            </CardTitle>
            <div className="relative w-48">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder={t("agentContext.detail.searchMessages")}
                className="pl-8 h-8 text-xs"
                value={searchMsg}
                onChange={(e) => setSearchMsg(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            session.messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquareIcon className="size-8 mx-auto mb-2 opacity-50" />
                <p>{t("agentContext.detail.noMessages")}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4 text-sm">
                {t("agentContext.detail.noMatchingMessages")}
              </p>
            )
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <Badge className={`mb-1.5 ${ROLE_COLORS[msg.role] ?? ""}`}>
                      {msg.role}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {msg.tokens && <span>{msg.tokens} tokens</span>}
                      {msg.metadata?.toolName && (
                        <Badge variant="outline" className="text-[10px]">
                          {msg.metadata.toolName}
                        </Badge>
                      )}
                      <span>{formatDate(msg.timestamp)}</span>
                    </div>
                  </div>
                  <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {msg.content.length > 300 ? msg.content.slice(0, 300) + "..." : msg.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AgentContextPage() {
  const { t } = useI18n();
  const {
    data: sessionsRaw,
    loading: sessionsLoading,
    error: sessionsError,
    refresh: refreshSessions,
  } = useAgentContextSessions();
  const { data: statsRaw, loading: statsLoading, refresh: refreshStats } = useAgentContextStats();

  const sessions: SessionData[] = useMemo(() => {
    return (sessionsRaw as SessionData[]) ?? [];
  }, [sessionsRaw]);

  const stats: StatsData | null = useMemo(() => {
    return (statsRaw as StatsData) ?? null;
  }, [statsRaw]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<SessionData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SessionData | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [systemPromptTarget, setSystemPromptTarget] = useState<SessionData | null>(null);
  const [compressTarget, setCompressTarget] = useState<SessionData | null>(null);
  const [inheritTarget, setInheritTarget] = useState<SessionData | null>(null);
  const [buildContextId, setBuildContextId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = useCallback(() => {
    refreshSessions();
    refreshStats();
  }, [refreshSessions, refreshStats]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await window.electronAPI?.agentContext?.deleteSession(deleteTarget.id);
      toast.success(t("agentContext.delete.success"));
      setDeleteOpen(false);
      setDeleteTarget(null);
      if (selectedId === deleteTarget.id) setSelectedId(null);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("agentContext.delete.failure"));
    }
  }, [deleteTarget, selectedId, refresh, t]);

  const selectedSession = useMemo(() => {
    return sessions.find((s) => s.id === selectedId) ?? null;
  }, [sessions, selectedId]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) => s.name.toLowerCase().includes(q));
  }, [sessions, searchQuery]);

  // If a session is selected, show detail
  if (selectedId && selectedSession) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <SessionDetail
          session={selectedSession}
          allSessions={sessions}
          onBack={() => setSelectedId(null)}
          onRename={() => setRenameTarget(selectedSession)}
          onDelete={() => {
            setDeleteTarget(selectedSession);
            setDeleteOpen(true);
          }}
          onSystemPrompt={() => setSystemPromptTarget(selectedSession)}
          onCompress={() => setCompressTarget(selectedSession)}
          onInherit={() => setInheritTarget(selectedSession)}
          onBuildContext={() => setBuildContextId(selectedSession.id)}
        />

        {/* Dialogs */}
        <DeleteDialog
          open={deleteOpen}
          sessionName={deleteTarget?.name ?? ""}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
        />
        {renameTarget && (
          <RenameDialog
            open={!!renameTarget}
            sessionId={renameTarget.id}
            currentName={renameTarget.name}
            onClose={() => {
              setRenameTarget(null);
              refresh();
            }}
          />
        )}
        {systemPromptTarget && (
          <SystemPromptDialog
            open={!!systemPromptTarget}
            sessionId={systemPromptTarget.id}
            currentPrompt={systemPromptTarget.systemPrompt}
            onClose={() => {
              setSystemPromptTarget(null);
              refresh();
            }}
          />
        )}
        {compressTarget && (
          <CompressDialog
            open={!!compressTarget}
            sessionId={compressTarget.id}
            onClose={() => {
              setCompressTarget(null);
              refresh();
            }}
            session={compressTarget}
          />
        )}
        {inheritTarget && (
          <InheritDialog
            open={!!inheritTarget}
            sessionId={inheritTarget.id}
            allSessions={sessions}
            onClose={() => {
              setInheritTarget(null);
              refresh();
            }}
          />
        )}
        {buildContextId && (
          <BuildContextDialog
            open={!!buildContextId}
            sessionId={buildContextId}
            onClose={() => setBuildContextId(null)}
          />
        )}
      </div>
    );
  }

  // ── Session List View ─────────────────────────────────────────────────────

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayersIcon className="h-6 w-6" />
            {t("agentContext.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("agentContext.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={sessionsLoading}>
            <RefreshCwIcon className={`h-4 w-4 mr-1 ${sessionsLoading ? "animate-spin" : ""}`} />
            {t("agentContext.refresh")}
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <PlusIcon className="mr-1.5 h-4 w-4" />
            {t("agentContext.newSession")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
        <StatCard
          title={t("agentContext.stats.sessions")}
          value={stats?.totalSessions ?? "--"}
          icon={LayersIcon}
          loading={statsLoading}
        />
        <StatCard
          title={t("agentContext.stats.messages")}
          value={stats?.totalMessages ?? "--"}
          icon={MessageSquareIcon}
          loading={statsLoading}
        />
        <StatCard
          title={t("agentContext.stats.totalTokens")}
          value={stats ? formatTokens(stats.totalTokens) : "--"}
          icon={BrainIcon}
          loading={statsLoading}
        />
        <StatCard
          title={t("agentContext.stats.summaries")}
          value={stats?.totalSummaries ?? "--"}
          icon={Minimize2Icon}
          loading={statsLoading}
        />
        <StatCard
          title={t("agentContext.stats.avgMsgPerSession")}
          value={stats?.averageMessagesPerSession ?? "--"}
          icon={FileTextIcon}
          loading={statsLoading}
        />
      </div>

      {/* Error */}
      {sessionsError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircleIcon className="h-5 w-5" />
          <span>{t("agentContext.error.loadFailed", {message: sessionsError.message})}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("agentContext.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Session List */}
      {sessionsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <LayersIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">
            {sessions.length === 0 ? t("agentContext.empty.noSessions") : t("agentContext.empty.noMatching")}
          </p>
          <p className="text-sm mt-1">
            {sessions.length === 0
              ? t("agentContext.empty.noSessionsHint")
              : t("agentContext.empty.noMatchingHint")}
          </p>
          {sessions.length === 0 && (
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <PlusIcon className="mr-1.5 h-4 w-4" />
              {t("agentContext.empty.createSession")}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSessions.map((session) => {
            const tokenUsage = Math.round(
              (session.totalTokens / session.maxTokens) * 100,
            );
            return (
              <button
                key={session.id}
                onClick={() => setSelectedId(session.id)}
                className="w-full text-left"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{session.name}</h3>
                          {session.metadata.parentSessionId && (
                            <Badge variant="outline" className="text-[10px]">
                              <GitBranchIcon className="mr-1 size-3" />
                              {t("agentContext.list.inherited")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquareIcon className="size-3" />
                            {t("agentContext.list.messageCount", {count: String(session.messages.length)})}
                          </span>
                          <span className="flex items-center gap-1">
                            <BrainIcon className="size-3" />
                            {t("agentContext.list.tokenCount", {count: formatTokens(session.totalTokens)})}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon className="size-3" />
                            {formatDate(session.updatedAt)}
                          </span>
                          {session.metadata.tags.length > 0 && (
                            <div className="flex gap-1">
                              {session.metadata.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="flex flex-col items-end gap-1">
                          <div className="w-24">
                            <Progress
                              value={tokenUsage > 100 ? 100 : tokenUsage}
                              className={`h-1.5 ${tokenUsage > 90 ? "[&>div]:bg-red-500" : tokenUsage > 75 ? "[&>div]:bg-amber-500" : ""}`}
                            />
                          </div>
                          <span className={`text-[10px] ${tokenUsage > 90 ? "text-red-500" : tokenUsage > 75 ? "text-amber-500" : "text-muted-foreground"}`}>
                            {tokenUsage}%
                          </span>
                        </div>
                        <ChevronRightIcon className="size-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <CreateSessionDialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          refresh();
        }}
      />

      {deleteTarget && (
        <DeleteDialog
          open={deleteOpen}
          sessionName={deleteTarget.name}
          onClose={() => {
            setDeleteOpen(false);
            setDeleteTarget(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

// ── Delete Dialog ──────────────────────────────────────────────────────────

function DeleteDialog({
  open,
  sessionName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  sessionName: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("agentContext.delete.title")}</DialogTitle>
          <DialogDescription>
            {t("agentContext.delete.confirm", {name: sessionName})}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2Icon className="mr-2 size-4" />
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
