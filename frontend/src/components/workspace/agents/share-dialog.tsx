"use client";

import { useCallback, useState } from "react";
import { CopyIcon, Link2Icon, Loader2Icon, Share2Icon, Trash2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  useAgentShares,
  useCreateAgentShare,
  useRevokeAgentShare,
} from "@/core/sharing/hooks";
import type { ShareLink } from "@/core/sharing/types";
import { useI18n } from "@/core/i18n/hooks";

interface ShareDialogProps {
  agentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function ShareDialog({ agentName, open, onOpenChange }: ShareDialogProps) {
  const { t } = useI18n();
  const { data: sharesData, isLoading: loadingShares } = useAgentShares(agentName);
  const createShare = useCreateAgentShare(agentName);
  const revokeShare = useRevokeAgentShare(agentName);
  const [copyUrl, setCopyUrl] = useState<string | null>(null);

  const shares: ShareLink[] = sharesData?.shares ?? [];

  async function handleCreate() {
    try {
      const res = await createShare.mutateAsync(undefined);
      const fullUrl = `${window.location.origin}${res.url}`;
      setCopyUrl(fullUrl);
      await navigator.clipboard.writeText(fullUrl);
      toast.success(t("agents.share.linkCopied"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleRevoke(token: string) {
    try {
      await revokeShare.mutateAsync(token);
      toast.success(t("agents.share.revokeSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  const copyShareUrl = useCallback(
    async (token: string) => {
      const url = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(url);
      toast.success(t("agents.share.linkCopied"));
    },
    [t],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2Icon className="size-5" />
            {t("agents.share.title")}
          </DialogTitle>
          <DialogDescription>
            {t("agents.share.description")}
          </DialogDescription>
        </DialogHeader>

        {/* Create new share link */}
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={createShare.isPending}
          >
            {createShare.isPending ? (
              <Loader2Icon className="mr-2 size-4 animate-spin" />
            ) : (
              <Link2Icon className="mr-2 size-4" />
            )}
            {t("agents.share.createLink")}
          </Button>

          {copyUrl && (
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={copyUrl}
                className="font-mono text-xs"
              />
              <Button
                size="icon"
                variant="outline"
                className="shrink-0"
                onClick={() => {
                  void navigator.clipboard.writeText(copyUrl);
                  toast.success(t("agents.share.linkCopied"));
                }}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Existing shares */}
        {shares.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {t("agents.share.activeLinks", { count: String(shares.length) })}
            </Label>
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.token}
                    className="flex items-center justify-between gap-2 rounded-md border p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">
                        /share/{share.token}
                      </code>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{formatDate(share.created_at)}</span>
                        {share.expires_at && (
                          <Badge variant="secondary" className="text-[10px] px-1 h-4">
                            {t("agents.share.expires")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => copyShareUrl(share.token)}
                        title={t("agents.share.copyLink")}
                      >
                        <CopyIcon className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleRevoke(share.token)}
                        disabled={revokeShare.isPending}
                        title={t("agents.share.revoke")}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {!loadingShares && shares.length === 0 && (
          <p className="text-sm text-center text-muted-foreground">
            {t("agents.share.noLinks")}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <XIcon className="mr-1.5 size-4" />
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
