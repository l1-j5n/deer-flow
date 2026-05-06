# Agent Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add pre-configured agent templates for one-click agent creation, accessible from the agent creation flow.

**Architecture:** Frontend-only static template definitions with a new template selection page. Uses existing agent creation API. Templates are TypeScript objects with pre-defined SOUL, model, and tool group configurations.

**Tech Stack:** React + TypeScript + Tailwind CSS + shadcn/ui + Lucide icons

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `frontend/src/core/agents/templates.ts` | **Create** | Template definitions, categories, and helper functions |
| `frontend/src/components/workspace/agents/template-card.tsx` | **Create** | Individual template card component |
| `frontend/src/components/workspace/agents/template-preview-dialog.tsx` | **Create** | Dialog for previewing template details |
| `frontend/src/app/workspace/agents/new/template/page.tsx` | **Create** | Template selection page |
| `frontend/src/app/workspace/agents/new/page.tsx` | **Modify** | Add "From Template" option to creation flow |
| `frontend/src/core/i18n/locales/types.ts` | **Modify** | Add template translation types |
| `frontend/src/core/i18n/locales/en-US.ts` | **Modify** | Add English template translations |
| `frontend/src/core/i18n/locales/zh-CN.ts` | **Modify** | Add Chinese template translations |

---

## Task 1: Template Data Layer

**Files:**
- **Create:** `frontend/src/core/agents/templates.ts`

- [ ] **Step 1: Define template types and data**

```typescript
import type { LucideIcon } from "lucide-react";
import {
  Code2Icon,
  MicroscopeIcon,
  BarChart3Icon,
  PenLineIcon,
  ServerIcon,
  ClipboardListIcon,
} from "lucide-react";

export type TemplateCategory = "development" | "research" | "creative" | "productivity" | "system";

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  category: TemplateCategory;
  config: {
    model: string | null;
    tool_groups: string[] | null;
    soul: string;
  };
}

export const templateCategories: Record<TemplateCategory, { label: string; color: string }> = {
  development: { label: "Development", color: "bg-blue-500" },
  research: { label: "Research", color: "bg-purple-500" },
  creative: { label: "Creative", color: "bg-pink-500" },
  productivity: { label: "Productivity", color: "bg-emerald-500" },
  system: { label: "System", color: "bg-slate-500" },
};

export const builtInTemplates: AgentTemplate[] = [
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    description: "Reviews code for style, logic, security, and best practices.",
    longDescription:
      "A specialized agent for reviewing code changes. It provides structured feedback on code style, logical correctness, security vulnerabilities, and performance considerations. Supports multiple programming languages.",
    icon: Code2Icon,
    category: "development",
    config: {
      model: null,
      tool_groups: ["code-tools"],
      soul: `You are an expert code reviewer with deep knowledge of software engineering best practices.

Your responsibilities:
- Review code for correctness, efficiency, and maintainability
- Identify security vulnerabilities and suggest fixes
- Check adherence to language-specific conventions
- Suggest refactoring opportunities when beneficial
- Provide constructive, actionable feedback

Be thorough but concise. Prioritize critical issues over nitpicks. Always explain WHY something is a problem, not just WHAT is wrong.`,
    },
  },
  {
    id: "research-assistant",
    name: "Research Assistant",
    description: "Conducts deep research with source tracking and synthesis.",
    longDescription:
      "An agent designed for comprehensive research tasks. It searches for information, evaluates sources, tracks references, and synthesizes findings into well-structured summaries.",
    icon: MicroscopeIcon,
    category: "research",
    config: {
      model: null,
      tool_groups: ["search", "web"],
      soul: `You are a thorough research assistant with expertise in information gathering and synthesis.

Your approach:
- Break complex topics into sub-questions
- Search for diverse and authoritative sources
- Evaluate source credibility and relevance
- Track all references for citation
- Synthesize findings into clear, structured summaries
- Highlight areas of uncertainty or disagreement

Always cite your sources. Be transparent about confidence levels. When information is limited, say so clearly.`,
    },
  },
  {
    id: "data-analyst",
    name: "Data Analyst",
    description: "Analyzes datasets and creates visualizations and insights.",
    longDescription:
      "An agent specialized in data analysis. It can load datasets, perform statistical analysis, create visualizations, and extract actionable insights from data.",
    icon: BarChart3Icon,
    category: "research",
    config: {
      model: null,
      tool_groups: ["data", "charts", "python"],
      soul: `You are a skilled data analyst with expertise in statistics, visualization, and insight extraction.

Your capabilities:
- Load and inspect datasets of various formats
- Perform exploratory data analysis (EDA)
- Calculate descriptive and inferential statistics
- Create clear, informative visualizations
- Identify trends, anomalies, and correlations
- Communicate findings in business-friendly language

Always show your work. Explain your analytical choices. When presenting data, use appropriate visualizations and clearly label axes and units.`,
    },
  },
  {
    id: "writing-partner",
    name: "Writing Partner",
    description: "Helps draft, edit, and refine written content.",
    longDescription:
      "A collaborative writing assistant that helps with drafting, editing, and refining various types of content including blog posts, documentation, emails, and creative writing.",
    icon: PenLineIcon,
    category: "creative",
    config: {
      model: null,
      tool_groups: null,
      soul: `You are a collaborative writing partner with expertise in clear, engaging communication.

Your approach:
- Adapt tone and style to the audience and purpose
- Suggest structural improvements for clarity and flow
- Catch grammar, spelling, and punctuation issues
- Improve word choice and eliminate redundancy
- Maintain the author's voice while enhancing quality
- Offer alternatives rather than dictating changes

Be encouraging and constructive. Explain your suggestions so the author learns. Respect the author's intent and voice.`,
    },
  },
  {
    id: "devops-helper",
    name: "DevOps Helper",
    description: "Assists with deployment, infrastructure, and operations tasks.",
    longDescription:
      "An agent specialized in DevOps and infrastructure tasks. It helps with deployment scripts, configuration management, troubleshooting, and cloud operations.",
    icon: ServerIcon,
    category: "system",
    config: {
      model: null,
      tool_groups: ["shell", "system", "docker"],
      soul: `You are a DevOps engineer with expertise in deployment, infrastructure, and system operations.

Your focus:
- Write safe, idempotent deployment scripts
- Troubleshoot infrastructure issues systematically
- Suggest monitoring and alerting improvements
- Optimize resource utilization and costs
- Follow security best practices for operations
- Document procedures clearly for team reference

Safety first: always validate commands before execution. Prefer dry-run modes. Never expose secrets in outputs. Explain the impact of each operation.`,
    },
  },
  {
    id: "meeting-summarizer",
    name: "Meeting Summarizer",
    description: "Extracts action items, decisions, and summaries from meetings.",
    longDescription:
      "An agent that processes meeting transcripts or notes to extract key decisions, action items, and concise summaries for distribution to stakeholders.",
    icon: ClipboardListIcon,
    category: "productivity",
    config: {
      model: null,
      tool_groups: null,
      soul: `You are a meeting summarization specialist focused on clarity and actionability.

Your output format:
- Executive Summary: 2-3 sentence overview
- Key Decisions: Bullet list of decisions made
- Action Items: Table with owner, task, and deadline
- Open Questions: Items needing follow-up
- Next Steps: Recommended immediate actions

Be concise. Use clear, professional language. Attribute action items to specific people when mentioned. Flag items requiring decisions.`,
    },
  },
];

export function getTemplateById(id: string): AgentTemplate | undefined {
  return builtInTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: TemplateCategory): AgentTemplate[] {
  return builtInTemplates.filter((t) => t.category === category);
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `cd frontend && npx tsc --noEmit --skipLibCheck src/core/agents/templates.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/core/agents/templates.ts
git commit -m "feat(agents): add built-in agent template definitions"
```

---

## Task 2: i18n Translations

**Files:**
- **Modify:** `frontend/src/core/i18n/locales/types.ts`
- **Modify:** `frontend/src/core/i18n/locales/en-US.ts`
- **Modify:** `frontend/src/core/i18n/locales/zh-CN.ts`

- [ ] **Step 1: Add template types to types.ts**

Add to the `Translations` interface in `frontend/src/core/i18n/locales/types.ts`, inside the `agents` object:

```typescript
    templates: {
      title: string;
      description: string;
      chooseTemplate: string;
      customAgent: string;
      customAgentDescription: string;
      createFromTemplate: string;
      preview: string;
      category: string;
      configuration: string;
      model: string;
      tools: string;
      soulPreview: string;
      cancel: string;
      createAgent: string;
      builtin: string;
      noTemplates: string;
      noTemplatesDescription: string;
    };
```

- [ ] **Step 2: Add English translations to en-US.ts**

Add inside the `agents` object in `frontend/src/core/i18n/locales/en-US.ts` (after `backToGallery`):

```typescript
    templates: {
      title: "Agent Templates",
      description: "Choose a pre-configured template to get started quickly.",
      chooseTemplate: "Choose how to create your agent",
      customAgent: "Custom Agent",
      customAgentDescription: "Create a unique agent through conversation",
      createFromTemplate: "From Template",
      preview: "Preview",
      category: "Category",
      configuration: "Configuration",
      model: "Model",
      tools: "Tools",
      soulPreview: "SOUL Preview",
      cancel: "Cancel",
      createAgent: "Create Agent",
      builtin: "Built-in",
      noTemplates: "No templates found",
      noTemplatesDescription: "Try adjusting your search or filters.",
    },
```

- [ ] **Step 3: Add Chinese translations to zh-CN.ts**

Add inside the `agents` object in `frontend/src/core/i18n/locales/zh-CN.ts` (after `backToGallery`):

```typescript
    templates: {
      title: "智能体模板",
      description: "选择预配置模板快速开始。",
      chooseTemplate: "选择创建方式",
      customAgent: "自定义智能体",
      customAgentDescription: "通过对话创建专属智能体",
      createFromTemplate: "从模板创建",
      preview: "预览",
      category: "分类",
      configuration: "配置",
      model: "模型",
      tools: "工具",
      soulPreview: "SOUL 预览",
      cancel: "取消",
      createAgent: "创建智能体",
      builtin: "内置",
      noTemplates: "未找到模板",
      noTemplatesDescription: "尝试调整搜索或筛选条件。",
    },
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `cd frontend && npx tsc --noEmit --skipLibCheck`
Expected: No new errors (existing errors unrelated to this change are acceptable)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/core/i18n/locales/types.ts frontend/src/core/i18n/locales/en-US.ts frontend/src/core/i18n/locales/zh-CN.ts
git commit -m "feat(i18n): add agent template translation keys"
```

---

## Task 3: Template Card Component

**Files:**
- **Create:** `frontend/src/components/workspace/agents/template-card.tsx`

- [ ] **Step 1: Implement TemplateCard component**

```typescript
"use client";

import type { AgentTemplate, TemplateCategory } from "@/core/agents/templates";
import { templateCategories } from "@/core/agents/templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onPreview(template)}
        >
          Preview
        </Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `cd frontend && npx tsc --noEmit --skipLibCheck src/components/workspace/agents/template-card.tsx`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/workspace/agents/template-card.tsx
git commit -m "feat(agents): add TemplateCard component"
```

---

## Task 4: Template Preview Dialog

**Files:**
- **Create:** `frontend/src/components/workspace/agents/template-preview-dialog.tsx`

- [ ] **Step 1: Implement TemplatePreviewDialog component**

```typescript
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AgentTemplate, TemplateCategory } from "@/core/agents/templates";
import { templateCategories } from "@/core/agents/templates";
import { useI18n } from "@/core/i18n/hooks";

interface TemplatePreviewDialogProps {
  template: AgentTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (template: AgentTemplate) => void;
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
                <span className="text-muted-foreground text-xs">{t.agents.templates.builtin}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{template.longDescription}</p>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t.agents.templates.configuration}</h4>
            <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.agents.templates.model}</span>
                <span>{template.config.model ?? "Default"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.agents.templates.tools}</span>
                <span>
                  {template.config.tool_groups?.join(", ") ?? "None"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t.agents.templates.soulPreview}</h4>
            <ScrollArea className="h-32 rounded-md border bg-muted/50">
              <pre className="p-3 text-xs text-muted-foreground whitespace-pre-wrap">
                {template.config.soul}
              </pre>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.agents.templates.cancel}
          </Button>
          <Button onClick={() => onCreate(template)}>{t.agents.templates.createAgent}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `cd frontend && npx tsc --noEmit --skipLibCheck src/components/workspace/agents/template-preview-dialog.tsx`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/workspace/agents/template-preview-dialog.tsx
git commit -m "feat(agents): add TemplatePreviewDialog component"
```

---

## Task 5: Template Selection Page

**Files:**
- **Create:** `frontend/src/app/workspace/agents/new/template/page.tsx`

- [ ] **Step 1: Implement template selection page**

```typescript
"use client";

import { ArrowLeftIcon, BotIcon, LayoutTemplateIcon } from "lucide-react";
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

  const handleCreate = async (template: AgentTemplate) => {
    setCreating(true);
    try {
      // Generate a unique name based on template id + timestamp
      const timestamp = Date.now();
      const name = `${template.id}-${timestamp}`;

      await createAgent({
        name,
        description: template.description,
        model: template.config.model,
        tool_groups: template.config.tool_groups,
        soul: template.config.soul,
      });

      toast.success(`Agent "${template.name}" created successfully!`);
      router.push(`/workspace/agents/${name}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create agent");
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
        <h1 className="text-sm font-semibold">{t.agents.templates.title}</h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Description */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{t.agents.templates.title}</h2>
            <p className="text-muted-foreground text-sm">
              {t.agents.templates.description}
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
              <p className="font-medium">{t.agents.templates.noTemplates}</p>
              <p className="text-muted-foreground text-sm mt-1">
                {t.agents.templates.noTemplatesDescription}
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
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `cd frontend && npx tsc --noEmit --skipLibCheck src/app/workspace/agents/new/template/page.tsx`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/workspace/agents/new/template/page.tsx
git commit -m "feat(agents): add agent template selection page"
```

---

## Task 6: Update Agent Creation Flow

**Files:**
- **Modify:** `frontend/src/app/workspace/agents/new/page.tsx`

- [ ] **Step 1: Add "From Template" option to creation flow**

Modify the `NewAgentPage` component to show a choice between "Custom Agent" and "From Template" before the name step.

Add a new step type:
```typescript
type Step = "choose" | "name" | "chat";
```

Update the initial state:
```typescript
const [step, setStep] = useState<Step>("choose");
```

Add a "Choose" step UI before the "name" step. The "choose" step shows two cards:
1. "Custom Agent" — continues to existing name/chat flow
2. "From Template" — navigates to `/workspace/agents/new/template`

Replace the `step === "name"` block with a `step === "choose"` block that renders:

```tsx
if (step === "choose") {
  return (
    <div className="flex size-full flex-col">
      {header}
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-3 text-center">
            <div className="bg-primary/10 mx-auto flex h-14 w-14 items-center justify-center rounded-full">
              <BotIcon className="text-primary h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{t.agents.templates.chooseTemplate}</h2>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Custom Agent Card */}
            <button
              onClick={() => setStep("name")}
              className="flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:border-primary hover:shadow-sm"
            >
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <BotIcon className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{t.agents.templates.customAgent}</p>
                <p className="text-muted-foreground text-sm">
                  {t.agents.templates.customAgentDescription}
                </p>
              </div>
            </button>

            {/* Template Card */}
            <button
              onClick={() => router.push("/workspace/agents/new/template")}
              className="flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:border-primary hover:shadow-sm"
            >
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <LayoutTemplateIcon className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{t.agents.templates.createFromTemplate}</p>
                <p className="text-muted-foreground text-sm">
                  {t.agents.templates.description}
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
```

Import `LayoutTemplateIcon` from `lucide-react`.

- [ ] **Step 2: Verify TypeScript compilation**

Run: `cd frontend && npx tsc --noEmit --skipLibCheck src/app/workspace/agents/new/page.tsx`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/workspace/agents/new/page.tsx
git commit -m "feat(agents): add template/custom choice to agent creation flow"
```

---

## Task 7: Integration & Testing

**Files:**
- All files created/modified above

- [ ] **Step 1: Verify full TypeScript compilation**

Run: `cd frontend && npx tsc --noEmit --skipLibCheck`
Expected: No new errors introduced by this feature

- [ ] **Step 2: Verify build**

Run: `cd frontend && npm run build`
Expected: Build succeeds

- [ ] **Step 3: Final review checklist**

- [ ] Template data layer exports all necessary types and functions
- [ ] i18n keys added to all locale files (en-US, zh-CN)
- [ ] TemplateCard renders correctly with icon, name, description, category badge
- [ ] TemplatePreviewDialog shows all template details
- [ ] Template selection page lists all built-in templates
- [ ] Agent creation flow shows choice between custom and template
- [ ] Template creation uses existing `createAgent` API
- [ ] Generated agent names are unique (template-id + timestamp)

- [ ] **Step 4: Commit all remaining changes**

```bash
git add .
git commit -m "feat(agents): v0.6.0 agent templates - one-click agent creation"
```

---

## Self-Review

**Spec coverage:**
- ✅ Built-in templates with pre-configured SOUL, model, tool groups
- ✅ Template gallery with category badges
- ✅ Template preview dialog with full details
- ✅ One-click creation from template
- ✅ Choice between custom and template creation
- ✅ i18n support for all new UI text

**Placeholder scan:** None found.

**Type consistency:** All types use `AgentTemplate` from `templates.ts`, translations use `agents.templates` namespace consistently.
