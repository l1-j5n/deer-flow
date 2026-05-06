"use client";

import { useCallback, useState } from "react";
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FileTextIcon,
  FilterIcon,
  LinkIcon,
  LockIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShieldIcon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/core/i18n/hooks";
import { toast } from "sonner";

import {
  type AuditCategory,
  type AuditSeverity,
  type AuditResult,
  useAuditEvents,
  useAuditStats,
  useVerifyIntegrity,
  exportAuditJSON,
  exportAuditCSV,
} from "@/core/audit";

const categoryLabels: Record<AuditCategory, string> = {
  security: "Security",
  data: "Data",
  system: "System",
  user: "User",
  session: "Session",
  workflow: "Workflow",
  mcp: "MCP",
  skill: "Skill",
  config: "Config",
};

const categoryColors: Record<AuditCategory, string> = {
  security: "bg-red-500",
  data: "bg-blue-500",
  system: "bg-slate-500",
  user: "bg-green-500",
  session: "bg-purple-500",
  workflow: "bg-orange-500",
  mcp: "bg-cyan-500",
  skill: "bg-pink-500",
  config: "bg-yellow-500",
};

function CategoryBadge({ category }: { category: AuditCategory }) {
  return (
    <Badge className={`${categoryColors[category] ?? "bg-slate-500"} text-white text-xs`}>
      {categoryLabels[category] ?? category}
    </Badge>
  );
}

function SeverityBadge({ severity }: { severity: AuditSeverity }) {
  const variants: Record<AuditSeverity, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
    critical: { variant: "destructive", icon: <AlertTriangleIcon className="size-3" /> },
    high: { variant: "destructive", icon: <AlertTriangleIcon className="size-3" /> },
    medium: { variant: "secondary", icon: <AlertTriangleIcon className="size-3" /> },
    low: { variant: "outline", icon: <FileTextIcon className="size-3" /> },
    info: { variant: "outline", icon: <FileTextIcon className="size-3" /> },
  };
  const config = variants[severity];
  return (
    <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
      {config.icon}
      <span className="capitalize">{severity}</span>
    </Badge>
  );
}

function ResultBadge({ result }: { result: AuditResult }) {
  const icons: Record<AuditResult, React.ReactNode> = {
    success: <CheckCircle2Icon className="size-3 text-green-500" />,
    failure: <XCircleIcon className="size-3 text-red-500" />,
    partial: <ShieldIcon className="size-3 text-orange-500" />,
  };
  return (
    <div className="flex items-center gap-1">
      {icons[result]}
      <span className="text-xs capitalize">{result}</span>
    </div>
  );
}

export default function AuditPage() {
  const { t } = useI18n();

  const { data: events = [], isLoading, refetch } = useAuditEvents();
  const { data: stats } = useAuditStats();
  const verifyMutation = useVerifyIntegrity();

  const [integrity, setIntegrity] = useState<{ valid: boolean; tamperedCount: number; totalChecked: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<AuditCategory | "all">("all");
  const [filterSeverity, setFilterSeverity] = useState<AuditSeverity | "all">("all");
  const [exporting, setExporting] = useState(false);

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.actor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.target?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || e.category === filterCategory;
    const matchesSeverity = filterSeverity === "all" || e.severity === filterSeverity;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const handleVerifyIntegrity = async () => {
    try {
      const result = await verifyMutation.mutateAsync();
      setIntegrity(result);
    } catch {
      toast.error(t("audit.verifyFailed"));
    }
  };

  const handleExport = useCallback(async (format: "json" | "csv") => {
    setExporting(true);
    try {
      const filter = filterCategory !== "all"
        ? { category: filterCategory as AuditCategory }
        : {};

      const blob = format === "json"
        ? await exportAuditJSON(filter)
        : await exportAuditCSV(filter);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-export-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("audit.exportSuccess"));
    } catch {
      toast.error(t("audit.exportFailed"));
    } finally {
      setExporting(false);
    }
  }, [filterCategory, t]);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t("audit.title")}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleVerifyIntegrity}
            disabled={verifyMutation.isPending}
          >
            <LockIcon className="mr-2 size-4" />
            {verifyMutation.isPending ? "Verifying..." : t("audit.verify")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")} disabled={exporting}>
            <DownloadIcon className="mr-2 size-4" />
            {t("audit.export")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCwIcon className="mr-2 size-4" />
            {t("audit.refresh")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("audit.totalEvents")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-muted-foreground text-xs">
                {stats.timeRange.earliest ? new Date(stats.timeRange.earliest).toLocaleDateString() : "—"} -
                {stats.timeRange.latest ? new Date(stats.timeRange.latest).toLocaleDateString() : "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("audit.success")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.byResult.success ?? 0}</div>
              <p className="text-muted-foreground text-xs">{stats.byResult.failure ?? 0} failures</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("audit.critical")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.bySeverity.critical ?? 0}</div>
              <p className="text-muted-foreground text-xs">{stats.bySeverity.high ?? 0} high severity</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t("audit.categories")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</div>
              <p className="text-muted-foreground text-xs">event types</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Integrity Verification */}
      {integrity && (
        <Card className={integrity.valid ? "border-green-500/50" : "border-red-500/50"}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {integrity.valid ? (
                  <ShieldCheckIcon className="size-5 text-green-500" />
                ) : (
                  <AlertTriangleIcon className="size-5 text-red-500" />
                )}
                <CardTitle className="text-base">
                  {integrity.valid ? t("audit.integrityVerified") : t("audit.integrityCompromised")}
                </CardTitle>
              </div>
              <Badge variant={integrity.valid ? "default" : "destructive"}>
                {integrity.valid ? "Valid" : "Tampered"}
              </Badge>
            </div>
            <CardDescription>
              SHA-256 hash chain verification for {integrity.totalChecked} events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">{t("audit.totalChecked")}</p>
                <p className="text-lg font-mono font-medium">{integrity.totalChecked}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">{t("audit.tamperedCount")}</p>
                <p className={`text-lg font-mono font-medium ${integrity.tamperedCount > 0 ? "text-red-500" : "text-green-500"}`}>
                  {integrity.tamperedCount}
                </p>
              </div>
            </div>
            {!integrity.valid && integrity.tamperedCount > 0 && (
              <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <div className="flex items-center gap-2 text-red-500">
                  <LinkIcon className="size-4" />
                  <span className="text-sm font-medium">
                    {integrity.tamperedCount} tampered entries detected — hash chain integrity compromised
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="text-muted-foreground absolute left-2 top-2.5 size-4" />
          <Input
            placeholder={t("audit.searchPlaceholder")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon className="text-muted-foreground size-4" />
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as AuditCategory | "all")}
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as AuditSeverity | "all")}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("audit.events")}</CardTitle>
          <CardDescription>
            {filteredEvents.length} of {events.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShieldIcon className="text-muted-foreground mb-4 size-12" />
              <p className="text-muted-foreground">{t("audit.noEvents")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={event.category} />
                      <SeverityBadge severity={event.severity} />
                      <span className="text-sm font-medium">{event.action}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Actor: {event.actor.name ?? event.actor.type}</span>
                      {event.target && (
                        <span>Target: {event.target.name ?? event.target.type}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="size-3" />
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <ResultBadge result={event.result} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
