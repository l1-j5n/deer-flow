"use client";

import { BotIcon, DownloadIcon, EyeIcon, MessageSquareIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useDeleteAgent } from "@/core/agents";
import type { Agent } from "@/core/agents";
import { useI18n } from "@/core/i18n/hooks";

interface AgentCardProps {
  agent: Agent;
  selectable?: boolean;
  selected?: boolean;
  onSelectToggle?: (name: string) => void;
  onExport?: () => void;
}

export function AgentCard({ agent, selectable, selected, onSelectToggle, onExport }: AgentCardProps) {
  const { t } = useI18n();
  const router = useRouter();
  const deleteAgent = useDeleteAgent();
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleChat() {
    router.push(`/workspace/agents/${agent.name}/chats/new`);
  }

  function handleViewDetail() {
    router.push(`/workspace/agents/${agent.name}`);
  }

  async function handleDelete() {
    try {
      await deleteAgent.mutateAsync(agent.name);
      toast.success(t("agents.deleteSuccess"));
      setDeleteOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <>
      <Card
        className={`group flex flex-col transition-shadow hover:shadow-md ${selectable && selected ? "ring-2 ring-primary" : ""}`}
        onClick={() => {
          if (selectable && onSelectToggle) {
            onSelectToggle(agent.name);
          }
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {selectable && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? "bg-primary border-primary" : "border-muted-foreground/30"}`}
                  >
                    {selected && (
                      <svg className="h-3.5 w-3.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
              )}
              <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                <BotIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="truncate text-base">
                  {agent.name}
                </CardTitle>
                {agent.model && (
                  <Badge variant="secondary" className="mt-0.5 text-xs">
                    {agent.model}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {agent.description && (
            <CardDescription className="mt-2 line-clamp-2 text-sm">
              {agent.description}
            </CardDescription>
          )}
        </CardHeader>

        {agent.tool_groups && agent.tool_groups.length > 0 && (
          <CardContent className="pt-0 pb-3">
            <div className="flex flex-wrap gap-1">
              {agent.tool_groups.map((group) => (
                <Badge key={group} variant="outline" className="text-xs">
                  {group}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}

        <CardFooter className="mt-auto flex items-center justify-between gap-2 pt-3">
          <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); handleChat(); }}>
            <MessageSquareIcon className="mr-1.5 h-3.5 w-3.5" />
            {t("agents.chat")}
          </Button>
          <div className="flex gap-1">
            {onExport && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                onClick={(e) => { e.stopPropagation(); onExport(); }}
                title={t("agents.exportAgent")}
              >
                <DownloadIcon className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={(e) => { e.stopPropagation(); handleViewDetail(); }}
              title="View Details"
            >
              <EyeIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive hover:text-destructive h-8 w-8 shrink-0"
              onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
              title={t("agents.delete")}
            >
              <Trash2Icon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("agents.delete")}</DialogTitle>
            <DialogDescription>{t("agents.deleteConfirm")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteAgent.isPending}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAgent.isPending}
            >
              {deleteAgent.isPending ? t("common.loading") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
