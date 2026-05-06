"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2Icon,
  ClockIcon,
  KeyIcon,
  LockIcon,
  RefreshCwIcon,
  ShieldIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSecurityStats,
  useSecurityPolicies,
  useRateLimitStatus,
} from "@/core/security";

function PolicyBadge({ type }: { type: string }) {
  const variants: Record<string, { color: string; label: string }> = {
    allow: { color: "bg-green-500", label: "Allow" },
    deny: { color: "bg-red-500", label: "Deny" },
    prompt: { color: "bg-yellow-500", label: "Prompt" },
  };
  const config = variants[type] ?? variants.deny;
  if (!config) return null;
  return (
    <Badge className={`${config.color} text-white text-xs`}>{config.label}</Badge>
  );
}

export default function SecurityPage() {
  const qc = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useSecurityStats();
  const { data: policiesData, isLoading: policiesLoading } = useSecurityPolicies();
  const { data: rateLimit, isLoading: rlLoading } = useRateLimitStatus();

  const policies = policiesData?.policies ?? [];
  const loading = statsLoading || policiesLoading || rlLoading;

  const securityScore = stats
    ? Math.round(
        ((stats.encryptionEnabled ? 1 : 0) +
          (stats.rateLimitEnabled ? 1 : 0) +
          (stats.inputSanitizationEnabled ? 1 : 0) +
          (stats.pathSanitizationEnabled ? 1 : 0) +
          (stats.apiKeyValidationEnabled ? 1 : 0) +
          (stats.activePolicies / Math.max(stats.totalPolicies, 1))) /
          6 *
          100
      )
    : 0;

  const handleRefresh = () => {
    void qc.invalidateQueries({ queryKey: ["security"] });
  };

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCwIcon className="size-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Score */}
      {loading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <Card>
          <CardContent className="flex items-center gap-6 py-6">
            <div className="flex flex-col items-center">
              <div
                className={`text-4xl font-bold ${
                  securityScore >= 80 ? "text-green-500" : securityScore >= 60 ? "text-yellow-500" : "text-red-500"
                }`}
              >
                {securityScore}
              </div>
              <span className="text-muted-foreground text-xs">/ 100</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Security Score</span>
                <span className={securityScore >= 80 ? "text-green-500" : securityScore >= 60 ? "text-yellow-500" : "text-red-500"}>
                  {securityScore >= 80 ? "Excellent" : securityScore >= 60 ? "Good" : "Needs Attention"}
                </span>
              </div>
              <Progress value={securityScore} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Features */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <LockIcon className="size-4" />
                Encryption
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {stats.encryptionEnabled ? (
                  <>
                    <CheckCircle2Icon className="size-5 text-green-500" />
                    <span className="text-sm font-medium">AES-256-GCM Enabled</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="size-5 text-red-500" />
                    <span className="text-sm font-medium">Disabled</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <ClockIcon className="size-4" />
                Rate Limiting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {stats.rateLimitEnabled ? (
                  <>
                    <CheckCircle2Icon className="size-5 text-green-500" />
                    <span className="text-sm font-medium">Sliding Window Active</span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="size-5 text-red-500" />
                    <span className="text-sm font-medium">Disabled</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheckIcon className="size-4" />
                Sanitization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  {stats.inputSanitizationEnabled ? (
                    <CheckCircle2Icon className="size-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="size-4 text-red-500" />
                  )}
                  <span>Input sanitization</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {stats.pathSanitizationEnabled ? (
                    <CheckCircle2Icon className="size-4 text-green-500" />
                  ) : (
                    <XCircleIcon className="size-4 text-red-500" />
                  )}
                  <span>Path sanitization</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Rate Limit Status */}
      {rlLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : rateLimit ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="size-5" />
              Rate Limit Status
            </CardTitle>
            <CardDescription>Current request window usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <span className="text-muted-foreground text-xs">Window</span>
                <p className="text-lg font-medium">{rateLimit.windowMs / 1000}s</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Max Requests</span>
                <p className="text-lg font-medium">{rateLimit.maxRequests}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Used</span>
                <p className="text-lg font-medium">{rateLimit.currentRequests}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Remaining</span>
                <p className="text-lg font-medium text-green-500">{rateLimit.remainingRequests}</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={(rateLimit.currentRequests / rateLimit.maxRequests) * 100}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyIcon className="size-5" />
            Security Policies
          </CardTitle>
          <CardDescription>
            {stats?.activePolicies ?? 0} of {stats?.totalPolicies ?? 0} policies active
          </CardDescription>
        </CardHeader>
        <CardContent>
          {policiesLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : policies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShieldIcon className="text-muted-foreground mb-4 size-12" />
              <p className="text-muted-foreground">No security policies configured.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{policy.name}</span>
                      <PolicyBadge type={policy.type} />
                      <Badge variant="outline" className="text-xs capitalize">
                        {policy.category}
                      </Badge>
                    </div>
                    <code className="text-muted-foreground text-xs">{policy.pattern}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    {policy.enabled ? (
                      <CheckCircle2Icon className="size-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="size-5 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
