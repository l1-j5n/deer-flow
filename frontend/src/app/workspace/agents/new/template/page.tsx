"use client";

import { ArrowLeftIcon, LayoutTemplateIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard } from "@/components/workspace/agents/template-card";
import { TemplatePreviewDialog } from "@/components/workspace/agents/template-preview-dialog";
import { createAgent } from "@/core/agents/api";
import type { AgentTemplate } from "@/core/agents/templates";
import { builtInTemplates } from "@/core/agents/templates";
import { useI18n } from "@/core/i18n/hooks";

export default function AgentTemplatePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const handlePreview = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleCreate = async (template: AgentTemplate, customName: string) => {
    setCreating(true);
    try {
      const name = customName.trim() || template.name;

      await createAgent({
        name,
        description: template.description,
        model: template.config.model,
        tool_groups: template.config.tool_groups,
        soul: template.config.soul,
      });

      toast.success(t("agents.templates.createSuccess", { name }));
      router.push(`/workspace/agents/${name}`);
    } catch (err: any) {
      toast.error(t("agents.templates.createFailed", { error: err.message ?? "Unknown error" }));
      setCreating(false);
    }
  };

  return (
    <div className="flex size-full flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/workspace/agents/new")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-sm font-semibold">{t("agents.templates.title")}</h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Description */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{t("agents.templates.title")}</h2>
            <p className="text-muted-foreground text-sm">
              {t("agents.templates.description")}
            </p>
          </div>

          {/* Template Grid */}
          {creating ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : builtInTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <LayoutTemplateIcon className="text-muted-foreground mb-4 size-12" />
              <p className="font-medium">{t("agents.templates.noTemplates")}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {t("agents.templates.noTemplatesDescription")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {builtInTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onPreview={handlePreview}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        template={selectedTemplate}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreate}
      />
    </div>
  );
}
