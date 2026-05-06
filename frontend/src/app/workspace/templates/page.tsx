"use client";

import { useEffect, useState } from "react";
import {
  BookOpenIcon,
  CheckCircle2Icon,
  CopyIcon,
  FileTextIcon,
  LayersIcon,
  LayoutTemplateIcon,
  MessageSquareIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type TemplateType = "session" | "workflow" | "skill" | "agent";
type TemplateCategory = "productivity" | "development" | "research" | "creative" | "business" | "system";

interface Template {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  category: TemplateCategory;
  tags: string[];
  author: string;
  version: string;
  usageCount: number;
  rating: number;
  isBuiltin: boolean;
  isFavorited: boolean;
  createdAt: string;
  params?: Array<{
    name: string;
    label: string;
    type: "string" | "number" | "boolean" | "select";
    default?: string | number | boolean;
    options?: string[];
    required: boolean;
  }>;
}

interface TemplateStats {
  totalTemplates: number;
  sessionTemplates: number;
  workflowTemplates: number;
  builtinTemplates: number;
  customTemplates: number;
  totalUsage: number;
}

const typeLabels: Record<TemplateType, string> = {
  session: "Session",
  workflow: "Workflow",
  skill: "Skill",
  agent: "Agent",
};

const typeIcons: Record<TemplateType, React.ReactNode> = {
  session: <MessageSquareIcon className="size-4" />,
  workflow: <WorkflowIcon className="size-4" />,
  skill: <LayersIcon className="size-4" />,
  agent: <StarIcon className="size-4" />,
};

const categoryColors: Record<TemplateCategory, string> = {
  productivity: "bg-emerald-500",
  development: "bg-blue-500",
  research: "bg-purple-500",
  creative: "bg-pink-500",
  business: "bg-amber-500",
  system: "bg-slate-500",
};

function TypeBadge({ type }: { type: TemplateType }) {
  return (
    <Badge variant="outline" className="text-xs flex items-center gap-1">
      {typeIcons[type]}
      {typeLabels[type]}
    </Badge>
  );
}

function CategoryBadge({ category }: { category: TemplateCategory }) {
  return (
    <Badge className={`${categoryColors[category] ?? "bg-slate-500"} text-white text-[10px]`}>
      {category}
    </Badge>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [stats, setStats] = useState<TemplateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [typeFilter, setTypeFilter] = useState<TemplateType | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Mock data for demo
      const mockTemplates: Template[] = [
        {
          id: "t1",
          name: "Code Review Assistant",
          description: "A session template for reviewing code changes with structured feedback on style, logic, and security.",
          type: "session",
          category: "development",
          tags: ["code", "review", "development"],
          author: "DeerFlow",
          version: "1.0.0",
          usageCount: 128,
          rating: 4.8,
          isBuiltin: true,
          isFavorited: true,
          createdAt: "2026-04-15T00:00:00Z",
          params: [
            { name: "language", label: "Language", type: "select", default: "typescript", options: ["typescript", "python", "go", "rust"], required: true },
            { name: "focus", label: "Focus Area", type: "select", default: "all", options: ["all", "security", "performance", "style"], required: false },
          ],
        },
        {
          id: "t2",
          name: "Research Deep Dive",
          description: "Structured workflow for conducting comprehensive research on any topic with source tracking.",
          type: "workflow",
          category: "research",
          tags: ["research", "analysis", "sources"],
          author: "DeerFlow",
          version: "1.1.0",
          usageCount: 95,
          rating: 4.6,
          isBuiltin: true,
          isFavorited: false,
          createdAt: "2026-04-10T00:00:00Z",
        },
        {
          id: "t3",
          name: "Blog Post Writer",
          description: "Creative session template for drafting blog posts with outline generation and SEO suggestions.",
          type: "session",
          category: "creative",
          tags: ["writing", "blog", "content"],
          author: "DeerFlow",
          version: "1.0.0",
          usageCount: 210,
          rating: 4.9,
          isBuiltin: true,
          isFavorited: true,
          createdAt: "2026-04-01T00:00:00Z",
        },
        {
          id: "t4",
          name: "Data Analysis Pipeline",
          description: "Workflow template for loading, cleaning, analyzing, and visualizing datasets.",
          type: "workflow",
          category: "productivity",
          tags: ["data", "analysis", "visualization"],
          author: "DeerFlow",
          version: "2.0.0",
          usageCount: 67,
          rating: 4.5,
          isBuiltin: true,
          isFavorited: false,
          createdAt: "2026-03-20T00:00:00Z",
        },
        {
          id: "t5",
          name: "Meeting Notes Summarizer",
          description: "Session template for extracting action items, decisions, and summaries from meeting transcripts.",
          type: "session",
          category: "business",
          tags: ["meeting", "notes", "summary"],
          author: "DeerFlow",
          version: "1.0.0",
          usageCount: 156,
          rating: 4.7,
          isBuiltin: true,
          isFavorited: false,
          createdAt: "2026-04-05T00:00:00Z",
        },
        {
          id: "t6",
          name: "API Endpoint Designer",
          description: "Workflow for designing RESTful API endpoints with OpenAPI spec generation.",
          type: "workflow",
          category: "development",
          tags: ["api", "design", "openapi"],
          author: "DeerFlow",
          version: "1.0.0",
          usageCount: 43,
          rating: 4.4,
          isBuiltin: true,
          isFavorited: false,
          createdAt: "2026-04-12T00:00:00Z",
        },
        {
          id: "t7",
          name: "System Health Check",
          description: "Automated workflow for running system diagnostics and generating health reports.",
          type: "workflow",
          category: "system",
          tags: ["health", "diagnostics", "system"],
          author: "DeerFlow",
          version: "1.0.0",
          usageCount: 89,
          rating: 4.6,
          isBuiltin: true,
          isFavorited: false,
          createdAt: "2026-04-18T00:00:00Z",
        },
        {
          id: "t8",
          name: "Learning Path Creator",
          description: "Session template for creating personalized learning paths with resources and milestones.",
          type: "session",
          category: "productivity",
          tags: ["learning", "education", "planning"],
          author: "DeerFlow",
          version: "1.0.0",
          usageCount: 72,
          rating: 4.5,
          isBuiltin: true,
          isFavorited: false,
          createdAt: "2026-04-08T00:00:00Z",
        },
      ];

      const mockStats: TemplateStats = {
        totalTemplates: mockTemplates.length,
        sessionTemplates: mockTemplates.filter((t) => t.type === "session").length,
        workflowTemplates: mockTemplates.filter((t) => t.type === "workflow").length,
        builtinTemplates: mockTemplates.filter((t) => t.isBuiltin).length,
        customTemplates: mockTemplates.filter((t) => !t.isBuiltin).length,
        totalUsage: mockTemplates.reduce((sum, t) => sum + t.usageCount, 0),
      };

      setTemplates(mockTemplates);
      setStats(mockStats);
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleFavorite = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFavorited: !t.isFavorited } : t))
    );
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesFav = !favoritesOnly || t.isFavorited;
    return matchesSearch && matchesType && matchesFav;
  });

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutTemplateIcon className="size-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Templates Marketplace</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCwIcon className="size-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <PlusIcon className="size-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTemplates}</div>
              <p className="text-muted-foreground text-xs">{stats.builtinTemplates} built-in</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sessionTemplates}</div>
              <p className="text-muted-foreground text-xs">chat templates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.workflowTemplates}</div>
              <p className="text-muted-foreground text-xs">automation templates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
              <p className="text-muted-foreground text-xs">times applied</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="text-muted-foreground absolute left-2 top-2.5 size-4" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(["all", "session", "workflow", "skill", "agent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "All" : typeLabels[t]}
            </button>
          ))}
        </div>
        <Button
          variant={favoritesOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          <StarIcon className={`size-4 mr-1 ${favoritesOnly ? "fill-current" : ""}`} />
          Favorites
        </Button>
      </div>

      {/* Template Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LayoutTemplateIcon className="text-muted-foreground mb-4 size-12" />
            <p className="text-muted-foreground">No templates found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.id === template.id ? "border-primary ring-1 ring-primary" : ""
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={template.type} />
                    <CategoryBadge category={template.category} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(template.id);
                    }}
                    className="text-muted-foreground hover:text-yellow-500 transition-colors"
                  >
                    <StarIcon
                      className={`size-4 ${template.isFavorited ? "fill-yellow-500 text-yellow-500" : ""}`}
                    />
                  </button>
                </div>
                <CardTitle className="text-base mt-2">{template.name}</CardTitle>
                <CardDescription className="line-clamp-2">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span>by {template.author}</span>
                    <span className="flex items-center gap-1">
                      <StarIcon className="size-3 fill-yellow-500 text-yellow-500" />
                      {template.rating}
                    </span>
                  </div>
                  <span>{template.usageCount} uses</span>
                </div>
                {selectedTemplate?.id === template.id && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Button size="sm" className="flex-1">
                      <PlayIcon className="size-4 mr-1" />
                      Use Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <CopyIcon className="size-4 mr-1" />
                      Clone
                    </Button>
                    {!template.isBuiltin && (
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2Icon className="size-4" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
