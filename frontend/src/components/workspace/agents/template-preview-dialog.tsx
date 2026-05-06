"use client";

import { useEffect, useState } from "react";

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
import type { AgentTemplate, TemplateCategory } from "@/core/agents/templates";
import { templateCategories } from "@/core/agents/templates";
import { useI18n } from "@/core/i18n/hooks";

interface TemplatePreviewDialogProps {
  template: AgentTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (template: AgentTemplate, name: string) => void;
}

function CategoryBadge({ category }: { category: TemplateCategory }) {
  const config = templateCategories[category];
  return (
    <Badge className={`${config.color} text-white text-[10px]`}>
      {config.label}
    </Badge>
  );
}

export function TemplatePreviewDialog({
  template,
  open,
  onOpenChange,
  onCreate,
}: TemplatePreviewDialogProps) {
  const { t } = useI18n();
  const [agentName, setAgentName] = useState("");

  // Reset name when template changes or dialog opens
  useEffect(() => {
    if (open && template) {
      setAgentName(template.name);
    }
  }, [open, template]);

  if (!template) return null;

  const Icon = template.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Icon className="text-primary h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">{template.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-0.5">
                <CategoryBadge category={template.category} />
                <span className="text-muted-foreground text-xs">
                  {t("agents.templates.builtin")}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {template.longDescription}
          </p>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {t("agents.templates.configuration")}
            </h4>
            <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
              <div className="space-y-1.5">
                <Label htmlFor="template-agent-name" className="text-xs text-muted-foreground">
                  {t("agents.templates.agentName")}
                </Label>
                <Input
                  id="template-agent-name"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder={template.name}
                  className="h-8 text-sm"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("agents.templates.model")}
                </span>
                <span>{template.config.model ?? "Default"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t("agents.templates.tools")}
                </span>
                <span>
                  {template.config.tool_groups?.join(", ") ?? "None"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {t("agents.templates.soulPreview")}
            </h4>
            <ScrollArea className="h-32 rounded-md border bg-muted/50">
              <pre className="p-3 text-xs text-muted-foreground whitespace-pre-wrap">
                {template.config.soul}
              </pre>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("agents.templates.cancel")}
          </Button>
          <Button
            onClick={() => onCreate(template, agentName.trim() || template.name)}
            disabled={!agentName.trim()}
          >
            {t("agents.templates.createAgent")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
