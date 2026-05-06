"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  BarChart3Icon,
  BellIcon,
  CheckCircle2Icon,
  ClockIcon,
  PlayIcon,
  RefreshCwIcon,
  SettingsIcon,
  ZapIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { useAlertConfigs, useAlertHistory, useEvaluateAlerts, useUpdateAlertConfig } from "@/core/alerts";
import type { AlertConfig, AlertRecord } from "@/core/alerts";
import { useI18n } from "@/core/i18n/hooks";

// ── helpers ──────────────────────────────────────────────────────────

function severityVariant(severity: string): "destructive" | "default" | "secondary" | "outline" {
  if (severity === "critical") return "destructive";
  if (severity === "warning") return "default";
  return "secondary";
}

function statusVariant(status: string): "destructive" | "default" | "secondary" | "outline" {
  if (status === "firing") return "destructive";
  return "secondary";
}

function formatTimeAgo(iso: string, t: (k: string, p?: Record<string, string>) => string): string {
  if (!iso) return t("agents.detail.never");
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("agents.detail.justNow");
  if (mins < 60) return t("agents.detail.minutesAgo", { mins: String(mins) });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("agents.detail.hoursAgo", { hours: String(hrs) });
  const days = Math.floor(hrs / 24);
  return t("agents.detail.daysAgo", { days: String(days) });
}

// ── config dialog ────────────────────────────────────────────────────

interface ConfigDialogProps {
  open: boolean;
  config: AlertConfig | null;
  onClose: () => void;
}

function ConfigDialog({ open, config, onClose }: ConfigDialogProps) {
  const { t } = useI18n();
  const updateMutation = useUpdateAlertConfig();

  const [enabled, setEnabled] = useState(true);
  const [p95Threshold, setP95Threshold] = useState(5000);
  const [cooldown, setCooldown] = useState(30);
  const [severity, setSeverity] = useState("warning");

  // Reset state when dialog opens with a config
  const [lastConfig, setLastConfig] = useState<string | null>(null);
  if (config && config.agent_name !== lastConfig && open) {
    setLastConfig(config.agent_name);
    setEnabled(config.enabled);
    setP95Threshold(config.p95_threshold_ms);
    setCooldown(config.cooldown_minutes);
    setSeverity(config.severity);
  }

  const handleSave = useCallback(async () => {
    if (!config) return;
    try {
      await updateMutation.mutateAsync({
        name: config.agent_name,
        request: {
          enabled,
          p95_threshold_ms: p95Threshold,
          cooldown_minutes: cooldown,
          severity,
        },
      });
      toast.success(t("alerts.configSaved"));
      onClose();
    } catch {
      toast.error(t("alerts.configSaveFailed"));
    }
  }, [config, enabled, p95Threshold, cooldown, severity, updateMutation, t, onClose]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="size-5" />
            {t("alerts.configTitle", { name: config?.agent_name ?? "" })}
          </DialogTitle>
          <DialogDescription>{t("alerts.configDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Enabled toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="alert-enabled">{t("alerts.enableAlerting")}</Label>
            <Switch id="alert-enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* P95 threshold */}
          <div className="space-y-1.5">
            <Label htmlFor="p95-threshold">{t("alerts.p95Threshold")}</Label>
            <Input
              id="p95-threshold"
              type="number"
              min={100}
              step={100}
              value={p95Threshold}
              onChange={(e) => setP95Threshold(Number(e.target.value) || 5000)}
            />
            <p className="text-xs text-muted-foreground">{t("alerts.p95ThresholdHint")}</p>
          </div>

          {/* Cooldown */}
          <div className="space-y-1.5">
            <Label htmlFor="cooldown">{t("alerts.cooldownMinutes")}</Label>
            <Input
              id="cooldown"
              type="number"
              min={1}
              max={1440}
              value={cooldown}
              onChange={(e) => setCooldown(Number(e.target.value) || 30)}
            />
            <p className="text-xs text-muted-foreground">{t("alerts.cooldownHint")}</p>
          </div>

          {/* Severity */}
          <div className="space-y-1.5">
            <Label htmlFor="severity">{t("alerts.severity")}</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">{t("alerts.severityCritical")}</SelectItem>
                <SelectItem value="warning">{t("alerts.severityWarning")}</SelectItem>
                <SelectItem value="info">{t("alerts.severityInfo")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── main page ────────────────────────────────────────────────────────

export default function AlertsPage() {
  const { t } = useI18n();
  const { configs, isLoading: configsLoading } = useAlertConfigs();
  const evaluateMutation = useEvaluateAlerts();

  const [activeTab, setActiveTab] = useState<"configs" | "history">("configs");
  const [editConfig, setEditConfig] = useState<AlertConfig | null>(null);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  // ── derived stats ─────────────────────────────────────────────────

  const stats = useMemo(() => {
    const configured = configs.length;
    const enabled = configs.filter((c) => c.enabled).length;
    const withHistory = configs.filter((c) => c.last_fired_at).length;
    return { configured, enabled, withHistory };
  }, [configs]);

  // ── handlers ───────────────────────────────────────────────────────

  const handleEvaluate = useCallback(async () => {
    try {
      const result = await evaluateMutation.mutateAsync(true); // dry-run first
      if (result.dry_run && result.fired.length === 0) {
        toast.success(t("alerts.evaluateOk"));
      } else if (result.dry_run) {
        toast.warning(t("alerts.evaluateWouldFire", { count: String(result.fired.length) }));
      }
    } catch {
      toast.error(t("alerts.evaluateFailed"));
    }
  }, [evaluateMutation, t]);

  // ── render ─────────────────────────────────────────────────────────

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="mb-6 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <AlertTriangleIcon className="size-6 text-amber-500" />
            {t("alerts.title")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("alerts.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleEvaluate} disabled={evaluateMutation.isPending}>
            <PlayIcon className="mr-1.5 size-4" />
            {t("alerts.evaluateNow")}
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a href="/workspace/agents?tab=compare">
              <BarChart3Icon className="size-4" />
            </a>
          </Button>
        </div>
      </div>

      {/* Stats row */}
      {configsLoading ? (
        <div className="mb-6 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{t("alerts.configuredAgents")}</CardDescription>
              <SettingsIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.configured}</div>
              <p className="text-xs text-muted-foreground">
                {t("alerts.enabledCount", { count: String(stats.enabled) })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{t("alerts.activeAlerts")}</CardDescription>
              <AlertTriangleIcon className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withHistory}</div>
              <p className="text-xs text-muted-foreground">{t("alerts.agentsWithHistory")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{t("alerts.defaultThreshold")}</CardDescription>
              <ZapIcon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,000ms</div>
              <p className="text-xs text-muted-foreground">{t("alerts.p95Default")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b">
        <button
          className={`relative px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "configs"
              ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("configs")}
        >
          {t("alerts.tabConfigs")}
        </button>
        <button
          className={`relative px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "history"
              ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setActiveTab("history")}
        >
          {t("alerts.tabHistory")}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "configs" ? (
          <ConfigsTab
            configs={configs}
            loading={configsLoading}
            onEdit={setEditConfig}
            onToggleExpand={setExpandedAgent}
            expandedAgent={expandedAgent}
            t={t}
          />
        ) : (
          <HistoryTab
            configs={configs}
            loading={configsLoading}
            t={t}
          />
        )}
      </div>

      {/* Config dialog */}
      <ConfigDialog
        open={editConfig !== null}
        config={editConfig}
        onClose={() => setEditConfig(null)}
      />
    </div>
  );
}

// ── Configs Tab ──────────────────────────────────────────────────────

function ConfigsTab({
  configs,
  loading,
  onEdit,
  onToggleExpand,
  expandedAgent,
  t,
}: {
  configs: AlertConfig[];
  loading: boolean;
  onEdit: (c: AlertConfig) => void;
  onToggleExpand: (name: string | null) => void;
  expandedAgent: string | null;
  t: (k: string, p?: Record<string, string>) => string;
}) {
  const updateMutation = useUpdateAlertConfig();

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <Skeleton className="mb-2 h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BellIcon className="mb-3 size-10 text-muted-foreground/40" />
          <h3 className="mb-1 text-lg font-medium">{t("alerts.noConfigs")}</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t("alerts.noConfigsDesc")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleToggle = async (config: AlertConfig) => {
    try {
      await updateMutation.mutateAsync({
        name: config.agent_name,
        request: {
          enabled: !config.enabled,
          p95_threshold_ms: config.p95_threshold_ms,
          cooldown_minutes: config.cooldown_minutes,
          severity: config.severity,
        },
      });
    } catch {
      toast.error("Failed to toggle alert config");
    }
  };

  return (
    <div className="space-y-3">
      {configs.map((config) => (
        <HistoryEmbeddedCard
          key={config.agent_name}
          config={config}
          expanded={expandedAgent === config.agent_name}
          onToggleExpand={() =>
            onToggleExpand(expandedAgent === config.agent_name ? null : config.agent_name)
          }
          onEdit={() => onEdit(config)}
          onToggle={() => handleToggle(config)}
          t={t}
        />
      ))}
    </div>
  );
}

// ── Config card with embedded history ────────────────────────────────

function HistoryEmbeddedCard({
  config,
  expanded,
  onToggleExpand,
  onEdit,
  onToggle,
  t,
}: {
  config: AlertConfig;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onToggle: () => void;
  t: (k: string, p?: Record<string, string>) => string;
}) {
  const { history, isLoading: historyLoading } = useAlertHistory(
    expanded ? config.agent_name : null,
  );

  const firingCount = history.filter((r) => r.status === "firing").length;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={config.enabled} onCheckedChange={() => onToggle()} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">{config.agent_name}</span>
                <Badge variant={severityVariant(config.severity)} className="text-[10px]">
                  {config.severity}
                </Badge>
                {firingCount > 0 && (
                  <Badge variant="destructive" className="text-[10px]">
                    {firingCount} {t("alerts.firing")}
                  </Badge>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{t("alerts.threshold")}: {config.p95_threshold_ms}ms</span>
                <span>·</span>
                <span>{t("alerts.cooldown")}: {config.cooldown_minutes}m</span>
                {config.last_fired_at && (
                  <>
                    <span>·</span>
                    <span>{t("alerts.lastFired")}: {formatTimeAgo(config.last_fired_at, t)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <SettingsIcon className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggleExpand}>
              <ClockIcon className="size-4" />
            </Button>
          </div>
        </div>

        {/* Embedded history */}
        {expanded && (
          <div className="mt-3 border-t pt-3">
            {historyLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : history.length === 0 ? (
              <p className="py-3 text-center text-xs text-muted-foreground">
                {t("alerts.noHistory")}
              </p>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {history.map((record, i) => (
                    <AlertHistoryItem key={`${record.fired_at}-${i}`} record={record} t={t} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── History tab ──────────────────────────────────────────────────────

function HistoryTab({
  configs,
  loading,
  t,
}: {
  configs: AlertConfig[];
  loading: boolean;
  t: (k: string, p?: Record<string, string>) => string;
}) {
  // Aggregate all history from all agents
  // For the history tab, we need to fetch all agent histories.
  // To keep things simple, we show all configs with their last_fired_at status.
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <Skeleton className="mb-2 h-5 w-64" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const agentsWithHistory = configs.filter((c) => c.last_fired_at);

  if (agentsWithHistory.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2Icon className="mb-3 size-10 text-emerald-500/40" />
          <h3 className="mb-1 text-lg font-medium">{t("alerts.allClear")}</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t("alerts.allClearDesc")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("alerts.agentsWithAlerts", { count: String(agentsWithHistory.length) })}
        </p>
      </div>
      {agentsWithHistory.map((config) => (
        <Card key={config.agent_name}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Badge variant={severityVariant(config.severity)}>{config.severity}</Badge>
              <span className="font-mono text-sm font-medium">{config.agent_name}</span>
              <span className="text-xs text-muted-foreground">
                {t("alerts.thresholdAt", { ms: String(config.p95_threshold_ms) })}
              </span>
              <span className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {t("alerts.lastFiredAt")}: {new Date(config.last_fired_at!).toLocaleString()}
              </span>
              <RefreshCwIcon className="size-3 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Alert history item ───────────────────────────────────────────────

function AlertHistoryItem({
  record,
  t,
}: {
  record: AlertRecord;
  t: (k: string, p?: Record<string, string>) => string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
      <Badge variant={statusVariant(record.status)} className="text-[10px]">
        {record.status}
      </Badge>
      <Badge variant={severityVariant(record.severity)} className="text-[10px]">
        {record.severity}
      </Badge>
      <span className="flex-1 truncate">{record.message}</span>
      <span className="shrink-0 text-muted-foreground">
        {formatTimeAgo(record.fired_at, t)}
      </span>
    </div>
  );
}
