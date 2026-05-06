"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AgentTemplate, TemplateCategory } from "@/core/agents/templates";
import { templateCategories } from "@/core/agents/templates";
import { useI18n } from "@/core/i18n/hooks";

interface TemplateCardProps {
  template: AgentTemplate;
  onPreview: (template: AgentTemplate) => void;
}

function CategoryBadge({ category }: { category: TemplateCategory }) {
  const config = templateCategories[category];
  return (
    <Badge className={`${config.color} text-white text-[10px]`}>
      {config.label}
    </Badge>
  );
}

export function TemplateCard({ template, onPreview }: TemplateCardProps) {
  const { t } = useI18n();
  const Icon = template.icon;

  return (
    <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <Icon className="text-primary h-4 w-4" />
            </div>
            <CategoryBadge category={template.category} />
          </div>
        </div>
        <CardTitle className="text-base mt-2">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onPreview(template)}
        >
          {t("agents.templates.preview")}
        </Button>
      </CardContent>
    </Card>
  );
}
