"use client";

import { useEffect, useState } from "react";
import {
  BotIcon,
  BrainCircuitIcon,
  ClockIcon,
  ExternalLinkIcon,
  TagIcon,
  WrenchIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSharedAgent } from "@/core/sharing/api";
import type { SharedAgentView } from "@/core/sharing/types";

// ── Mini QueryClientProvider wrapper for standalone public page ──────

function QueryClientWrapper({ children }: { children: React.ReactNode }) {
  const [QCP, setQCP] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null);

  useEffect(() => {
    import("@tanstack/react-query")
      .then((mod) => {
        const qc = new mod.QueryClient({
          defaultOptions: { queries: { retry: 0, staleTime: 60_000 } },
        });
        const Provider = ({ children: c }: { children: React.ReactNode }) =>
          mod.QueryClientProvider({ client: qc, children: c }) as React.ReactElement;
        setQCP(() => Provider);
      })
      .catch(() => setQCP(null));
  }, []);

  if (!QCP) return <>{children}</>;
  return <QCP>{children}</QCP>;
}

// ── Format Helpers ────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function expiryLabel(expiresAt: string | null): { label: string; variant: "outline" | "destructive" } {
  if (!expiresAt) return { label: "No expiry", variant: "outline" };
  const exp = new Date(expiresAt);
  if (exp <= new Date()) return { label: "Expired", variant: "destructive" };
  return { label: `Expires ${formatDate(expiresAt)}`, variant: "outline" };
}

// ── SharedAgentContent ────────────────────────────────────────────────

function SharedAgentContent({ token }: { token: string }) {
  const [data, setData] = useState<SharedAgentView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSharedAgent(token)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <Skeleton className="mx-auto h-16 w-16 rounded-xl" />
            <Skeleton className="mx-auto mt-4 h-7 w-48" />
            <Skeleton className="mx-auto mt-2 h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="w-full max-w-lg border-destructive/50">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 flex h-16 w-16 items-center justify-center rounded-xl">
              <BotIcon className="text-destructive size-8" />
            </div>
            <CardTitle className="text-destructive">Agent Unavailable</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              The share link may have been revoked or expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const expiry = expiryLabel(data.expires_at);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 flex h-16 w-16 items-center justify-center rounded-xl">
            <BotIcon className="text-primary size-8" />
          </div>
          <CardTitle className="mt-3 text-2xl">{data.agent_name}</CardTitle>
          <CardDescription className="text-base">{data.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Model */}
          {data.model && (
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">
                <BrainCircuitIcon className="mr-1 size-3" />
                {data.model}
              </Badge>
              <Badge variant={expiry.variant}>
                <ClockIcon className="mr-1 size-3" />
                {expiry.label}
              </Badge>
            </div>
          )}

          {/* Tool Groups */}
          {data.tool_groups && data.tool_groups.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                <WrenchIcon className="mr-1 inline size-3.5" />
                Tools
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.tool_groups.map((g) => (
                  <Badge key={g} variant="outline">
                    <TagIcon className="mr-1 size-3" />
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Soul / Personality */}
          {data.soul && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">Personality</h3>
              <div className="rounded-md bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                {data.soul.length > 500 ? `${data.soul.slice(0, 500)}…` : data.soul}
              </div>
            </div>
          )}

          {/* Shared info */}
          <div className="pt-2 text-center text-xs text-muted-foreground">
            Shared on {formatDate(data.shared_at)}
            {data.expired && " · This share link has expired"}
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-2">
            <Button asChild variant="outline">
              <a href="/workspace/agents" target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="mr-1.5 size-4" />
                Open DeerFlow
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export default function SharedAgentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return <SharedAgentPageInner params={params} />;
}

async function SharedAgentPageInner({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <SharedAgentContent token={token} />;
}
